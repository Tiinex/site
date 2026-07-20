export function ensureWorkspaceForLocalMaterial(lifecycle, state, workspaceId = '', input = {}, options = {}) {
  const current = lifecycle?.cloneState?.(state) || state;
  const targetId = workspaceId || current?.activeWorkspaceId || '';
  const existing = targetId && Array.isArray(current?.workspaces)
    ? current.workspaces.find((item) => item.id === targetId)
    : null;
  if (existing) return { ok: true, created: false, workspace: existing, workspaceId: existing.id, state: current };

  const name = normalizeWorkspaceName(lifecycle, input.name || input.title || 'Local import');
  if (!name) return { ok: false, error: 'workspace.name.required', state };
  const created = lifecycle?.createWorkspace?.(current, { name }, options);
  if (!created?.ok) return created || { ok: false, error: 'workspace.create.failed', state };
  created.workspace.importLog = Array.isArray(created.workspace.importLog) ? created.workspace.importLog : [];
  created.workspace.importLog.unshift({
    kind: 'workspace-auto-created-for-local-import',
    title: name,
    at: nowIso(options)
  });
  return { ok: true, created: true, workspace: created.workspace, workspaceId: created.workspace.id, state: created.state };
}

export function summarizeAdapterImportResult(adapterResult = {}, applied = {}) {
  const records = Number(applied.addedRecords || 0);
  const assets = Number(applied.addedAssets || 0);
  const workspaceEntries = Number(applied.workspaceEntries || 0);
  const warnings = Array.isArray(adapterResult.warnings) ? adapterResult.warnings : [];
  const errors = Array.isArray(adapterResult.errors) ? adapterResult.errors : [];
  const diagnostics = adapterResult.diagnostics || {};
  const parts = [];
  if (applied.workspaceOpened) parts.push('opened workspace');
  else if (workspaceEntries) parts.push(`${workspaceEntries} workspace file${workspaceEntries === 1 ? '' : 's'} staged for merge`);
  if (records) parts.push(`${records} artifact${records === 1 ? '' : 's'}`);
  if (assets) parts.push(`${assets} asset${assets === 1 ? '' : 's'}`);
  const ok = Boolean(records || assets || applied.workspaceOpened || workspaceEntries);
  return {
    schema: 'tiinex.workspace.import.result.v1',
    ok,
    message: `${parts.length ? `Imported ${parts.join(' · ')}` : 'Import completed'}${warnings.length || errors.length ? `; ${warnings.length + errors.length} warning/error${warnings.length + errors.length === 1 ? '' : 's'}` : ''}.`,
    counts: {
      records,
      assets,
      workspaceEntries,
      warnings: warnings.length,
      errors: errors.length,
      previewOmitted: Number(diagnostics.previewOmittedCount || 0)
    },
    warnings,
    errors,
    diagnostics
  };
}

export function applyLocalAdapterResultToWorkspace(lifecycle, state, workspaceId = '', adapterResult = {}, options = {}) {
  if (!lifecycle) return { ok: false, error: 'lifecycle.missing', state, summary: summarizeAdapterImportResult(adapterResult) };
  let nextState = lifecycle.cloneState?.(state) || state;
  let addedRecords = 0;
  let addedAssets = 0;
  let workspaceOpened = false;
  const workspaces = Array.isArray(adapterResult.workspaceEntries) ? adapterResult.workspaceEntries : [];
  const records = Array.isArray(adapterResult.records) ? adapterResult.records : [];
  const assets = Array.isArray(adapterResult.assets) ? adapterResult.assets : [];
  const hasMaterial = Boolean(records.length || assets.length);
  const targetWorkspaceId = workspaceId || nextState?.activeWorkspaceId || '';

  if (workspaces.length && !targetWorkspaceId && typeof lifecycle.openWorkspaceFromMarkdown === 'function') {
    const first = workspaces[0];
    const opened = lifecycle.openWorkspaceFromMarkdown(nextState, first.markdown || '', first, options);
    if (opened?.ok) {
      nextState = opened.state;
      workspaceOpened = true;
      const openedWorkspaceId = lifecycle.activeWorkspace?.(nextState)?.id;
      if (openedWorkspaceId && typeof lifecycle.mergeWorkspaceImport === 'function') {
        for (const entry of workspaces.slice(1)) {
          const merged = lifecycle.mergeWorkspaceImport(nextState, openedWorkspaceId, entry, options);
          if (merged?.ok) nextState = merged.state;
        }
      }
    }
  } else if (workspaces.length && targetWorkspaceId && typeof lifecycle.mergeWorkspaceImport === 'function') {
    for (const entry of workspaces) {
      const merged = lifecycle.mergeWorkspaceImport(nextState, targetWorkspaceId, entry, options);
      if (merged?.ok) nextState = merged.state;
    }
  }

  let finalWorkspaceId = lifecycle.activeWorkspace?.(nextState)?.id || targetWorkspaceId;
  if (!finalWorkspaceId && hasMaterial) {
    const ensured = ensureWorkspaceForLocalMaterial(lifecycle, nextState, '', {
      name: adapterResult.diagnostics?.suggestedWorkspaceName || options.workspaceName || 'Local import'
    }, options);
    if (ensured?.ok) {
      nextState = ensured.state;
      finalWorkspaceId = ensured.workspaceId;
      workspaceOpened = Boolean(ensured.created);
    }
  }

  if (records.length && finalWorkspaceId && typeof lifecycle.addWorkspaceRecords === 'function') {
    const added = lifecycle.addWorkspaceRecords(nextState, finalWorkspaceId, records, options);
    if (added?.ok) {
      nextState = added.state;
      addedRecords = added.records.length;
    }
  }
  if (assets.length && finalWorkspaceId && typeof lifecycle.addWorkspaceAssets === 'function') {
    const added = lifecycle.addWorkspaceAssets(nextState, finalWorkspaceId, assets, options);
    if (added?.ok) {
      nextState = added.state;
      addedAssets = added.assets.length;
    }
  }

  const applied = { addedRecords, addedAssets, workspaceOpened, workspaceEntries: workspaces.length };
  const summary = summarizeAdapterImportResult(adapterResult, applied);
  nextState = appendImportSummary(lifecycle, nextState, summary, options);

  return { ok: summary.ok, state: nextState, summary, workspaceId: lifecycle.activeWorkspace?.(nextState)?.id || finalWorkspaceId, ...applied };
}

function appendImportSummary(lifecycle, state, summary, options = {}) {
  const next = lifecycle?.cloneState?.(state) || state;
  const workspace = lifecycle?.activeWorkspace?.(next);
  if (!workspace) return next;
  const entry = {
    schema: 'tiinex.workspace.import.result.v1',
    ok: summary.ok !== false,
    message: String(summary.message || 'Import completed.').slice(0, 500),
    counts: Object.assign({ records: 0, assets: 0, workspaceEntries: 0, warnings: 0, errors: 0 }, summary.counts || {}),
    warnings: Array.isArray(summary.warnings) ? summary.warnings.slice(0, 20) : [],
    errors: Array.isArray(summary.errors) ? summary.errors.slice(0, 20) : [],
    diagnostics: Object.assign({}, summary.diagnostics || {}),
    at: nowIso(options)
  };
  workspace.importResults = Array.isArray(workspace.importResults) ? workspace.importResults.slice() : [];
  workspace.importResults.unshift(entry);
  workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog.slice() : [];
  workspace.importLog.unshift({ kind: 'adapter-import-result', ok: entry.ok, counts: entry.counts, at: entry.at });
  return next;
}

function normalizeWorkspaceName(lifecycle, value) {
  if (typeof lifecycle?.normalizeWorkspaceName === 'function') return lifecycle.normalizeWorkspaceName(value);
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 72);
}

function nowIso(options = {}) {
  return typeof options.clock === 'function' ? options.clock() : new Date().toISOString();
}
