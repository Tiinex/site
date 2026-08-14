import { upsertOriginReferenceSources } from '../sources/origin.references.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { resolveLocalImportConflicts } from './workspace.importConflicts.js';
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
  else if (workspaceEntries) parts.push(`${workspaceEntries} workspace artifact${workspaceEntries === 1 ? '' : 's'}`);
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
  const targetWorkspaceId = workspaceId || nextState?.activeWorkspaceId || '';
  const diagnostics = Object.assign({}, adapterResult.diagnostics || {});

  if (targetWorkspaceId) {
    const targetWorkspace = findWorkspace(nextState, targetWorkspaceId, lifecycle);
    const conflictResolution = resolveLocalImportConflicts(targetWorkspace || {}, adapterResult, options.conflictResolution || '');
    if (conflictResolution.requiresResolution) {
      return { ok: false, error: 'import.conflict.requires-resolution', state, conflicts: conflictResolution.conflicts, adapterResult, summary: summarizeAdapterImportResult(adapterResult) };
    }
    if (conflictResolution.cancelled) {
      return { ok: false, error: 'import.cancelled', cancelled: true, state, conflicts: conflictResolution.conflicts, adapterResult, summary: summarizeAdapterImportResult(adapterResult) };
    }
    if (conflictResolution.adapterResult) {
      adapterResult = conflictResolution.adapterResult;
      diagnostics.importConflictResolution = conflictResolution.resolution;
      diagnostics.importConflictCount = conflictResolution.conflicts.length;
    }
  }

  let workspaces = Array.isArray(adapterResult.workspaceEntries) ? adapterResult.workspaceEntries : [];
  const records = Array.isArray(adapterResult.records) ? adapterResult.records : [];
  const assets = Array.isArray(adapterResult.assets) ? adapterResult.assets : [];
  const hasMaterial = Boolean(records.length || assets.length || workspaces.length);

  if (targetWorkspaceId && options.conflictResolution === 'replace' && workspaces.length) {
    const targetWorkspace = findWorkspace(nextState, targetWorkspaceId, lifecycle);
    const rootPath = canonicalImportPath(targetWorkspace?.workspaceImport?.path || '');
    const replacement = rootPath ? workspaces.find((entry) => canonicalImportPath(entry.path || '') === rootPath) : null;
    if (replacement && targetWorkspace) {
      targetWorkspace.workspaceMarkdown = String(replacement.markdown || '');
      targetWorkspace.workspaceImport = Object.assign({}, targetWorkspace.workspaceImport || {}, {
        path: replacement.path || targetWorkspace.workspaceImport?.path || '',
        sourceMode: replacement.sourceMode || 'local-workspace-file',
        boundary: replacement.boundary || 'browser-local workspace file; no GitHub provenance inferred',
        replacedAt: nowIso(options)
      });
      workspaces = workspaces.filter((entry) => entry !== replacement);
      diagnostics.workspaceRootReplaced = true;
    }
  }

  let workspaceArtifactRecords = [];
  if (workspaces.length && !targetWorkspaceId && typeof lifecycle.openWorkspaceFromMarkdown === 'function') {
    const first = workspaces[0];
    const opened = lifecycle.openWorkspaceFromMarkdown(nextState, first.markdown || '', first, options);
    if (opened?.ok) {
      nextState = opened.state;
      workspaceOpened = true;
      workspaceArtifactRecords = workspaces.slice(1).map(workspaceArtifactRecordFromEntry);
    }
  } else if (workspaces.length) {
    workspaceArtifactRecords = workspaces.map(workspaceArtifactRecordFromEntry);
  }

  let finalWorkspaceId = lifecycle.activeWorkspace?.(nextState)?.id || targetWorkspaceId;
  if (!finalWorkspaceId && hasMaterial) {
    const ensured = ensureWorkspaceForLocalMaterial(lifecycle, nextState, '', {
      name: diagnostics.suggestedWorkspaceName || options.workspaceName || 'Local import'
    }, options);
    if (ensured?.ok) {
      nextState = ensured.state;
      finalWorkspaceId = ensured.workspaceId;
      workspaceOpened = Boolean(ensured.created);
    }
  }

  const canonicalRecords = records.concat(workspaceArtifactRecords);
  if (canonicalRecords.length && finalWorkspaceId && typeof lifecycle.addWorkspaceRecords === 'function') {
    const added = lifecycle.addWorkspaceRecords(nextState, finalWorkspaceId, canonicalRecords, options);
    if (added?.ok) {
      nextState = added.state;
      addedRecords = added.records.length;
      const workspace = findWorkspace(nextState, finalWorkspaceId, lifecycle);
      const originSources = upsertOriginReferenceSources(workspace, added.records || []);
      if (originSources.length) {
        diagnostics.originReferenceSourceCount = originSources.length;
        diagnostics.originReferenceSources = originSources.map((source) => ({ id: source.id, repo: source.repo, sourceKind: source.sourceKind }));
      }
    }
  }
  if (assets.length && finalWorkspaceId && typeof lifecycle.addWorkspaceAssets === 'function') {
    const added = lifecycle.addWorkspaceAssets(nextState, finalWorkspaceId, assets, options);
    if (added?.ok) {
      nextState = added.state;
      addedAssets = added.assets.length;
    }
  }

  const applied = { addedRecords, addedAssets, workspaceOpened, workspaceEntries: workspaces.length, workspaceArtifacts: workspaceArtifactRecords.length };
  const summaryInput = Object.assign({}, adapterResult, { diagnostics });
  const summary = summarizeAdapterImportResult(summaryInput, applied);
  nextState = appendImportSummary(lifecycle, nextState, summary, options);

  return { ok: summary.ok, state: nextState, summary, workspaceId: lifecycle.activeWorkspace?.(nextState)?.id || finalWorkspaceId, ...applied };
}

export function appendImportSummary(lifecycle, state, summary, options = {}) {
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

function workspaceArtifactRecordFromEntry(entry = {}) {
  const path = entry.path || 'workspace.workspace.md';
  const record = createRecordFromMarkdown(entry.markdown || '', {
    path,
    name: entry.title || path,
    sourceMode: entry.sourceMode || 'archive-local-workspace-artifact'
  });
  return Object.assign({}, record, {
    title: entry.title || record.title,
    workspaceArtifactRole: {
      schema: 'tiinex.workspace.artifact.role.v1',
      openEligible: true,
      mergeEligible: true,
      origin: 'local-import'
    },
    importBoundary: entry.boundary || 'browser-local workspace artifact; canonical artifact record with workspace capability'
  });
}

function canonicalImportPath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/').trim(); }

function findWorkspace(state = {}, workspaceId = '', lifecycle = {}) {
  const id = String(workspaceId || '').trim();
  return (Array.isArray(state.workspaces) ? state.workspaces : []).find((workspace) => workspace.id === id) || lifecycle?.activeWorkspace?.(state) || null;
}

function normalizeWorkspaceName(lifecycle, value) {
  if (typeof lifecycle?.normalizeWorkspaceName === 'function') return lifecycle.normalizeWorkspaceName(value);
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 72);
}

function nowIso(options = {}) {
  return typeof options.clock === 'function' ? options.clock() : new Date().toISOString();
}
