export function findWorkspaceCandidate(workspace = {}, candidateIdOrPath = '') {
  const key = String(candidateIdOrPath || '').trim();
  const canonical = canonicalizeLocalPath(key);
  return (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []).find((candidate) => {
    return candidate.id === key || canonicalizeLocalPath(candidate.path || '') === canonical;
  }) || null;
}

export function openWorkspaceCandidate(lifecycle, state, workspaceId = '', candidateIdOrPath = '', options = {}) {
  if (!lifecycle) return { ok: false, error: 'lifecycle.missing', state };
  const sourceWorkspace = (Array.isArray(state?.workspaces) ? state.workspaces : [])
    .find((workspace) => workspace.id === (workspaceId || state.activeWorkspaceId));
  if (!sourceWorkspace) return { ok: false, error: 'workspace.not.found', state };
  const candidate = findWorkspaceCandidate(sourceWorkspace, candidateIdOrPath);
  if (!candidate) return { ok: false, error: 'workspace.candidate.not.found', state };
  const opened = lifecycle.openWorkspaceFromMarkdown?.(state, candidate.markdown || '', {
    title: candidate.title || workspaceTitleFromMarkdown(candidate.markdown || '') || candidate.path || 'Imported workspace',
    path: candidate.path,
    sourceMode: candidate.sourceMode || 'local-workspace-file'
  }, options);
  if (!opened?.ok) return opened || { ok: false, error: 'workspace.open.failed', state };
  const workspace = lifecycle.activeWorkspace?.(opened.state);
  if (workspace) {
    if (options.preserveImportedMaterial !== false) preserveImportedMaterialFromSourceWorkspace(workspace, sourceWorkspace, candidate);
    workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
    workspace.importLog.unshift({ kind: 'workspace-candidate-opened', fromWorkspaceId: sourceWorkspace.id, path: candidate.path || '', preservedMaterial: options.preserveImportedMaterial !== false, at: nowIso(options) });
  }
  return Object.assign({}, opened, { candidate });
}

export function mergeWorkspaceCandidate(lifecycle, state, workspaceId = '', candidateIdOrPath = '', options = {}) {
  if (!lifecycle) return { ok: false, error: 'lifecycle.missing', state };
  const next = lifecycle.cloneState?.(state) || structuredClone(state);
  const workspace = (Array.isArray(next?.workspaces) ? next.workspaces : [])
    .find((item) => item.id === (workspaceId || next.activeWorkspaceId));
  if (!workspace) return { ok: false, error: 'workspace.not.found', state };
  const candidate = findWorkspaceCandidate(workspace, candidateIdOrPath);
  if (!candidate) return { ok: false, error: 'workspace.candidate.not.found', state };
  const path = canonicalizeLocalPath(candidate.path || 'workspace.workspace.md');
  const merged = Object.assign({}, candidate, { mergedAt: nowIso(options), mergeMode: 'metadata-context' });
  workspace.workspaceMergedEntries = Array.isArray(workspace.workspaceMergedEntries) ? workspace.workspaceMergedEntries.slice() : [];
  const idx = workspace.workspaceMergedEntries.findIndex((item) => canonicalizeLocalPath(item.path || '') === path);
  if (idx >= 0) workspace.workspaceMergedEntries[idx] = merged;
  else workspace.workspaceMergedEntries.unshift(merged);
  workspace.workspaceMergeCandidates = (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [])
    .filter((item) => canonicalizeLocalPath(item.path || '') !== path);
  workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
  workspace.importLog.unshift({ kind: 'workspace-merge-applied', path, title: candidate.title || '', at: merged.mergedAt });
  next.activeWorkspaceId = workspace.id;
  return { ok: true, workspace, candidate: merged, state: next };
}


function preserveImportedMaterialFromSourceWorkspace(targetWorkspace, sourceWorkspace, openedCandidate) {
  const openedPath = canonicalizeLocalPath(openedCandidate?.path || '');
  targetWorkspace.records = Array.isArray(sourceWorkspace.records) ? sourceWorkspace.records.map((item) => Object.assign({}, item)) : [];
  targetWorkspace.assets = Array.isArray(sourceWorkspace.assets) ? sourceWorkspace.assets.map((item) => Object.assign({}, item)) : [];
  targetWorkspace.workspaceMergeCandidates = Array.isArray(sourceWorkspace.workspaceMergeCandidates)
    ? sourceWorkspace.workspaceMergeCandidates
      .filter((item) => canonicalizeLocalPath(item.path || '') !== openedPath)
      .map((item) => Object.assign({}, item))
    : [];
  targetWorkspace.workspaceMergedEntries = Array.isArray(sourceWorkspace.workspaceMergedEntries)
    ? sourceWorkspace.workspaceMergedEntries.map((item) => Object.assign({}, item))
    : [];
  targetWorkspace.importResults = Array.isArray(sourceWorkspace.importResults)
    ? sourceWorkspace.importResults.map((item) => Object.assign({}, item))
    : [];
  targetWorkspace.sources = Array.isArray(sourceWorkspace.sources) ? sourceWorkspace.sources.map((item) => Object.assign({}, item)) : targetWorkspace.sources;
  targetWorkspace.sourceOrder = Array.isArray(sourceWorkspace.sourceOrder) ? sourceWorkspace.sourceOrder.slice() : targetWorkspace.sourceOrder;
}

function workspaceTitleFromMarkdown(markdown = '') {
  const text = String(markdown || '');
  const browserTitle = text.match(/^\s*-\s*Browser Title:\s*(.+)$/mi)?.[1]?.trim();
  if (browserTitle) return stripMarkdown(browserTitle);
  const heading = text.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
  return stripMarkdown(heading || '');
}

function stripMarkdown(value = '') {
  return String(value || '').replace(/^\[([^\]]+)\]\([^)]*\)$/, '$1').trim();
}

function canonicalizeLocalPath(inputPath) {
  let p = String(inputPath || '').trim().replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  const out = [];
  for (const part of p.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

function nowIso(options = {}) {
  return typeof options.clock === 'function' ? options.clock() : new Date().toISOString();
}
