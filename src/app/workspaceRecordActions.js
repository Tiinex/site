export function workspaceEntryFromRecord(record = {}) {
  const path = record.path || record.sourcePath || record.sourceTarget?.sourceArtifactPath || 'workspace.workspace.md';
  return {
    id: `workspace-record:${record.id || path}`,
    title: record.title || workspaceTitleFromMarkdown(record.markdown || '') || path,
    path,
    markdown: String(record.markdown || ''),
    sourceMode: record.source?.adapterId === 'github' ? 'source-backed-workspace-file' : 'local-workspace-file',
    source: record.source ? Object.assign({}, record.source) : undefined,
    sourceRecordId: record.id || '',
    sourceTarget: record.sourceTarget ? Object.assign({}, record.sourceTarget) : undefined
  };
}

export function openWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, record }) {
  const entry = workspaceEntryFromRecord(record);
  if (!entry.markdown) return { ok: false, error: 'workspace.markdown.unavailable', message: 'Workspace artifact body is unavailable; reload the source first.', state, entry };
  const sourceInputs = workspaceSourceInputsFromMarkdown(entry.markdown, parseWorkspaceConfig);
  if (sourceInputs.length) return openWorkspaceEntrypointsAsCurrentSet({ lifecycle, state, entry, sourceInputs });

  const opened = lifecycle?.openWorkspaceFromMarkdown?.(state, entry.markdown, entry);
  if (!opened?.ok) return { ok: false, error: opened?.error || 'workspace.open.failed', message: 'Could not open workspace artifact.', state, entry };
  const exactState = openedWorkspaceOnly(opened.state, opened.workspace?.id);
  const workspace = (Array.isArray(exactState?.workspaces) ? exactState.workspaces : []).find((item) => item.id === opened.workspace?.id) || opened.workspace;
  return { ok: true, state: exactState, workspace, entry, sourceInputs: [] };
}

export function mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, workspaceId, record }) {
  const entry = workspaceEntryFromRecord(record);
  if (!entry.markdown) return { ok: false, error: 'workspace.markdown.unavailable', message: 'Workspace artifact body is unavailable; reload the source first.', state, entry };
  const sourceInputs = workspaceSourceInputsFromMarkdown(entry.markdown, parseWorkspaceConfig);
  if (sourceInputs.length) return mergeWorkspaceEntrypointsIntoCurrentSet({ lifecycle, state, workspaceId, entry, sourceInputs });

  const staged = lifecycle?.mergeWorkspaceImport?.(state, workspaceId, entry);
  if (!staged?.ok) return { ok: false, error: staged?.error || 'workspace.merge.stage.failed', message: 'Could not stage workspace artifact for merge.', state, entry };
  return { ok: true, state: staged.state, workspace: staged.workspace, candidate: entry, entry, sourceInputs: [] };
}

export function registerWorkspaceConfigSources(state, workspaceId, markdown = '', { lifecycle, parseWorkspaceConfig } = {}) {
  if (!lifecycle?.addWorkspaceSource || typeof parseWorkspaceConfig !== 'function') return state;
  const sourceInputs = workspaceSourceInputsFromMarkdown(markdown, parseWorkspaceConfig);
  let next = state;
  for (const sourceInput of sourceInputs) {
    const added = addConfiguredSourceToWorkspace(lifecycle, next, workspaceId, sourceInput);
    if (added?.ok) next = added.state;
  }
  return next;
}

export function workspaceSourceInputsFromMarkdown(markdown = '', parseWorkspaceConfig = null) {
  if (typeof parseWorkspaceConfig !== 'function') return [];
  let config = null;
  try { config = parseWorkspaceConfig(markdown); } catch (_) { return []; }
  const entrypoints = Array.isArray(config?.workspaceEntrypoints) ? config.workspaceEntrypoints : [];
  return entrypoints.map((entrypoint) => {
    const repository = String(entrypoint?.repository || entrypoint?.repo || '').trim();
    if (!repository) return null;
    const issueUrls = entrypoint.issueUrl || entrypoint.issueUrls || '';
    return {
      repository,
      ref: entrypoint.ref || '',
      rootPath: entrypoint.rootPath || '.topics',
      label: entrypoint.workspaceLabel || entrypoint.name || entrypoint.label || repository,
      sourceKind: entrypoint.sourceKind || entrypoint.kind || 'github-tree',
      repoDiscovery: truthyWorkspaceConfigValue(entrypoint.repoFilesDiscovery ?? entrypoint.repoDiscovery ?? true),
      issueDiscovery: truthyWorkspaceConfigValue(entrypoint.issueDiscovery ?? entrypoint.issueSnapshots ?? false),
      issueUrls,
      preserveView: true,
      allowSourceCache: true,
      workspaceEntrypoint: Object.assign({}, entrypoint)
    };
  }).filter(Boolean);
}

function openWorkspaceEntrypointsAsCurrentSet({ lifecycle, state, entry, sourceInputs }) {
  if (!lifecycle?.cloneState || !lifecycle?.createWorkspace || !lifecycle?.addWorkspaceSource) return { ok: false, error: 'workspace.lifecycle.incomplete', message: 'Workspace lifecycle cannot apply workspace entrypoints.', state, entry };
  const preservedDrafts = localDraftWorkspacesToPreserve(state);
  let next = lifecycle.cloneState(Object.assign({}, state, {
    workspaces: preservedDrafts,
    activeWorkspaceId: preservedDrafts[0]?.id || '',
    view: Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, state?.view || {}, { workspaceVerse: 'feed', selectedRecordId: '', lineageQuery: '', expandedLineageRecordIds: [], lineageAuditReport: null, lineageLoadReport: null })
  }));
  const preparedInputs = [];
  let firstWorkspace = null;
  for (let index = sourceInputs.length - 1; index >= 0; index -= 1) {
    const sourceInput = sourceInputs[index];
    const created = lifecycle.createWorkspace(next, { name: sourceInput.label || entry.title || sourceInput.repository }, {});
    if (!created?.ok) continue;
    next = created.state;
    annotateWorkspaceImport(next, created.workspace.id, entry, 'open');
    const added = addConfiguredSourceToWorkspace(lifecycle, next, created.workspace.id, sourceInput, { discoveryState: 'deferred' });
    if (added?.ok) {
      next = added.state;
      const withWorkspace = Object.assign({}, sourceInput, { workspaceId: created.workspace.id, sourceId: added.source?.id || sourceInput.sourceId || '' });
      preparedInputs.unshift(withWorkspace);
    }
    firstWorkspace = created.workspace;
  }
  if (!preparedInputs.length && !firstWorkspace) return { ok: false, error: 'workspace.open.no-entrypoints', message: 'Workspace artifact has no usable workspace entrypoints.', state, entry };
  const orderedWorkspaces = Array.isArray(next.workspaces) ? next.workspaces : [];
  const workspace = orderedWorkspaces.find((item) => item.id === preparedInputs[0]?.workspaceId) || orderedWorkspaces[0] || firstWorkspace;
  next.activeWorkspaceId = workspace?.id || next.activeWorkspaceId || '';
  next.workspaceViews = {};
  return { ok: true, state: next, workspace, entry, sourceInputs: preparedInputs, replacedWorkspaces: true };
}

function mergeWorkspaceEntrypointsIntoCurrentSet({ lifecycle, state, workspaceId, entry, sourceInputs }) {
  if (!lifecycle?.cloneState || !lifecycle?.createWorkspace || !lifecycle?.addWorkspaceSource) return { ok: false, error: 'workspace.lifecycle.incomplete', message: 'Workspace lifecycle cannot merge workspace entrypoints.', state, entry };
  let next = lifecycle.cloneState(state);
  const originalActiveWorkspaceId = next.activeWorkspaceId || workspaceId || '';
  const preparedInputs = [];
  const touchedWorkspaceIds = [];
  let createdCount = 0;
  for (const sourceInput of sourceInputs) {
    let workspace = findWorkspaceForIncomingSource(next, sourceInput);
    const existingSource = workspace ? findConfiguredSource(workspace, sourceInput) : null;
    const alreadyLoaded = Boolean(existingSource && sourceMaterializationCompleteEnough(existingSource, sourceInput));
    if (!workspace) {
      const created = lifecycle.createWorkspace(next, { name: sourceInput.label || entry.title || sourceInput.repository }, {});
      if (!created?.ok) continue;
      next = created.state;
      workspace = created.workspace;
      createdCount += 1;
      annotateWorkspaceImport(next, workspace.id, entry, 'merge-created');
    } else {
      annotateWorkspaceImport(next, workspace.id, entry, alreadyLoaded ? 'merge-existing-noop' : 'merge-refresh');
    }
    const added = addConfiguredSourceToWorkspace(lifecycle, next, workspace.id, sourceInput, { discoveryState: alreadyLoaded ? existingSource.discoveryState : 'deferred' });
    if (added?.ok) {
      next = added.state;
      touchedWorkspaceIds.push(workspace.id);
      if (!alreadyLoaded) preparedInputs.push(Object.assign({}, sourceInput, { workspaceId: workspace.id, sourceId: added.source?.id || sourceInput.sourceId || '' }));
    }
  }
  if (originalActiveWorkspaceId && (next.workspaces || []).some((workspace) => workspace.id === originalActiveWorkspaceId)) next.activeWorkspaceId = originalActiveWorkspaceId;
  else if (touchedWorkspaceIds[0]) next.activeWorkspaceId = touchedWorkspaceIds[0];
  const workspace = (next.workspaces || []).find((item) => item.id === (touchedWorkspaceIds[0] || next.activeWorkspaceId)) || null;
  return { ok: true, state: next, workspace, candidate: entry, entry, sourceInputs: preparedInputs, merge: { touchedWorkspaceIds, createdCount, skippedLoads: sourceInputs.length - preparedInputs.length } };
}

function addConfiguredSourceToWorkspace(lifecycle, state, workspaceId, sourceInput, overrides = {}) {
  return lifecycle.addWorkspaceSource(state, workspaceId, Object.assign({
    repository: sourceInput.repository,
    repo: sourceInput.repository,
    ref: sourceInput.ref || '',
    rootPath: sourceInput.rootPath || '.topics',
    label: sourceInput.label || sourceInput.repository,
    sourceKind: sourceInput.sourceKind || 'github-tree',
    repoDiscovery: Boolean(sourceInput.repoDiscovery),
    issueDiscovery: Boolean(sourceInput.issueDiscovery),
    issueUrls: sourceInput.issueUrls || '',
    workspaceMatch: sourceInput.workspaceMatch || '',
    appConfigPlan: sourceInput.appConfigPlan || '',
    openBehavior: sourceInput.openBehavior || '',
    preferredDisplay: sourceInput.preferredDisplay || '',
    discoveryState: 'deferred'
  }, overrides));
}

function annotateWorkspaceImport(state = {}, workspaceId = '', entry = {}, mode = 'open') {
  const workspace = (Array.isArray(state?.workspaces) ? state.workspaces : []).find((item) => item.id === workspaceId);
  if (!workspace) return;
  workspace.workspaceMarkdown = entry.markdown || workspace.workspaceMarkdown || '';
  workspace.workspaceImport = Object.assign({}, workspace.workspaceImport || {}, {
    schema: 'tiinex.workspace.import.v1',
    path: entry.path || workspace.workspaceImport?.path || 'workspace.workspace.md',
    sourceMode: entry.sourceMode || workspace.workspaceImport?.sourceMode || 'workspace-file',
    sourceRecordId: entry.sourceRecordId || '',
    mode
  });
  workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog.slice() : [];
  workspace.importLog.unshift({ kind: `workspace-record-${mode}`, path: entry.path || '', title: entry.title || '', at: new Date().toISOString() });
}

function findWorkspaceForIncomingSource(state = {}, sourceInput = {}) {
  const label = String(sourceInput.label || '').trim().toLowerCase();
  const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
  if (label) {
    const byLabel = workspaces.find((workspace) => String(workspace?.title || workspace?.name || '').trim().toLowerCase() === label);
    if (byLabel) return byLabel;
    return null;
  }
  const signature = sourceSignature(sourceInput);
  if (!signature) return null;
  return workspaces.find((workspace) => (Array.isArray(workspace?.sources) ? workspace.sources : []).some((source) => sourceSignature(source) === signature)) || null;
}

function findConfiguredSource(workspace = {}, sourceInput = {}) {
  const signature = sourceSignature(sourceInput);
  return (Array.isArray(workspace?.sources) ? workspace.sources : []).find((source) => sourceSignature(source) === signature) || null;
}

function sourceMaterializationCompleteEnough(source = {}, sourceInput = {}) {
  const state = String(source.discoveryState || '').toLowerCase();
  if (!['loaded', 'partial'].includes(state)) return false;
  const wantsMaterial = Boolean(sourceInput.repoDiscovery || sourceInput.issueDiscovery || sourceInput.issueUrls);
  if (!wantsMaterial) return true;
  return Number(source.count || 0) > 0;
}

function sourceSignature(source = {}) {
  const repo = String(source.repository || source.repo || source.config?.repo || '').trim().toLowerCase();
  if (!repo) return '';
  const ref = String(source.ref || source.requestedRef || source.config?.ref || '').trim().toLowerCase();
  const root = canonicalizeLocalPath(source.rootPath || source.config?.rootPath || '.topics').toLowerCase();
  const repoDiscovery = Boolean(source.repoDiscovery || source.requestedSurfaces?.repoFiles?.requested);
  const issueDiscovery = Boolean(source.issueDiscovery || source.requestedSurfaces?.issueSnapshots?.requested || source.issueUrls || source.config?.issueUrls);
  const issueUrls = normalizeIssueUrls(source.issueUrls || source.config?.issueUrls || '');
  return [repo, ref, root, repoDiscovery ? 'repo:on' : 'repo:off', issueDiscovery ? 'issues:on' : 'issues:off', issueUrls].join('|');
}

function normalizeIssueUrls(value = '') {
  return String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean).sort().join('\n');
}

function localDraftWorkspacesToPreserve(state = {}) {
  return (Array.isArray(state?.workspaces) ? state.workspaces : [])
    .filter((workspace) => hasUnpublishedLocalMaterial(workspace))
    .map((workspace) => Object.assign({}, workspace));
}

function hasUnpublishedLocalMaterial(workspace = {}) {
  const localRecord = (Array.isArray(workspace.records) ? workspace.records : []).some((record) => !record?.source || record.source.adapterId === 'local' || record.source.kind === 'local-session');
  const localAsset = (Array.isArray(workspace.assets) ? workspace.assets : []).some((asset) => !asset?.source || asset.source.adapterId === 'local' || !asset.rawUrl);
  return Boolean(localRecord || localAsset);
}

function openedWorkspaceOnly(state = {}, workspaceId = '') {
  const target = (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => workspace.id === workspaceId);
  if (!target) return state;
  return Object.assign({}, state, {
    activeWorkspaceId: target.id,
    workspaces: [target],
    workspaceViews: {},
    view: Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, state.view || {}, { workspaceVerse: 'feed', selectedRecordId: '', lineageQuery: '', expandedLineageRecordIds: [], lineageAuditReport: null, lineageLoadReport: null })
  });
}

function canonicalizeLocalPath(inputPath = '') {
  let p = String(inputPath || '').trim().replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  const out = [];
  for (const part of p.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

function workspaceTitleFromMarkdown(markdown = '') {
  const text = String(markdown || '');
  const browserTitle = text.match(/^\s*-\s*Browser Title:\s*(.+)$/mi)?.[1]?.trim();
  if (browserTitle) return stripMarkdown(browserTitle);
  const heading = text.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
  return stripMarkdown(heading || '');
}

function stripMarkdown(value = '') {
  return String(value || '').replace(/^\[([^\]]+)\]\([^)]*\)$/u, '$1').trim();
}

function truthyWorkspaceConfigValue(value) {
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return false;
  return !['off', 'false', 'no', '0', 'disabled'].includes(text);
}
