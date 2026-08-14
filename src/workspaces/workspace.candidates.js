import { addConfiguredSourceToWorkspace, workspaceSourceInputsFromMarkdown } from './workspace.entrypoints.js';
import { replaceNonDraftWorkspaceSet } from './workspace.openSemantics.js';
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
  const sourceInputs = workspaceSourceInputsFromMarkdown(candidate.markdown || '', options.parseWorkspaceConfig);
  const opened = lifecycle.openWorkspaceFromMarkdown?.(state, candidate.markdown || '', {
    title: candidate.title || workspaceTitleFromMarkdown(candidate.markdown || '') || candidate.path || 'Imported workspace',
    path: candidate.path,
    sourceMode: candidate.sourceMode || 'local-workspace-file',
    importedFromWorkspaceId: sourceWorkspace.id || '',
    importedFromWorkspaceTitle: sourceWorkspace.title || sourceWorkspace.name || ''
  }, options);
  if (!opened?.ok) return opened || { ok: false, error: 'workspace.open.failed', state };
  let nextState = opened.state;
  let workspace = lifecycle.activeWorkspace?.(nextState);
  let contextReference = null;
  if (workspace) {
    contextReference = attachOpenedWorkspaceContextReference(workspace, sourceWorkspace, candidate, options);
    workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
    workspace.workspaceImport = Object.assign({}, workspace.workspaceImport || {}, {
      openedFromWorkspaceId: sourceWorkspace.id || '',
      openedFromWorkspaceTitle: sourceWorkspace.title || sourceWorkspace.name || '',
      openedCandidatePath: candidate.path || '',
      mode: sourceInputs.length ? 'workspace-candidate-entrypoint-opened' : 'workspace-candidate-opened',
      contextReferenceId: contextReference.id || '',
      ownedMaterialPolicy: 'opened-workspace-owns-selected-workspace-only'
    });
    workspace.importLog.unshift({ kind: sourceInputs.length ? 'workspace-candidate-entrypoint-opened' : 'workspace-candidate-opened', fromWorkspaceId: sourceWorkspace.id, fromWorkspaceTitle: sourceWorkspace.title || sourceWorkspace.name || '', path: candidate.path || '', contextReferenceId: contextReference.id || '', ownedMaterialPolicy: 'reference-only', entrypointSources: sourceInputs.length, at: nowIso(options) });
  }
  const preparedInputs = [];
  for (const sourceInput of sourceInputs) {
    if (!workspace?.id) break;
    const added = addConfiguredSourceToWorkspace(lifecycle, nextState, workspace.id, sourceInput, { discoveryState: 'deferred' });
    if (!added?.ok) continue;
    nextState = added.state;
    workspace = (Array.isArray(nextState?.workspaces) ? nextState.workspaces : []).find((item) => item.id === workspace.id) || lifecycle.activeWorkspace?.(nextState);
    preparedInputs.push(Object.assign({}, sourceInput, { workspaceId: workspace?.id || '', sourceId: added.source?.id || sourceInput.sourceId || '' }));
  }
  const targetWorkspaceId = workspace?.id || opened.workspace?.id || '';
  const replaced = replaceNonDraftWorkspaceSet(nextState, [targetWorkspaceId]);
  nextState = replaced.state;
  workspace = (Array.isArray(nextState?.workspaces) ? nextState.workspaces : []).find((item) => item.id === targetWorkspaceId) || workspace || opened.workspace;
  return Object.assign({}, opened, { state: nextState, workspace, candidate, sourceInputs: preparedInputs, contextReference, openedEntrypointWorkspace: Boolean(preparedInputs.length), openBoundary: replaced.report });
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
  const merged = Object.assign({}, candidate, { mergedAt: nowIso(options), mergeMode: 'metadata-context', mergedIntoWorkspaceId: workspace.id || '', mergedIntoWorkspaceTitle: workspace.title || workspace.name || '' });
  workspace.workspaceMergedEntries = Array.isArray(workspace.workspaceMergedEntries) ? workspace.workspaceMergedEntries.slice() : [];
  const idx = workspace.workspaceMergedEntries.findIndex((item) => canonicalizeLocalPath(item.path || '') === path);
  if (idx >= 0) workspace.workspaceMergedEntries[idx] = merged;
  else workspace.workspaceMergedEntries.unshift(merged);
  workspace.workspaceMergeCandidates = (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [])
    .filter((item) => canonicalizeLocalPath(item.path || '') !== path);
  workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
  workspace.importLog.unshift({ kind: 'workspace-merge-applied', path, title: candidate.title || '', intoWorkspaceId: workspace.id || '', at: merged.mergedAt });
  next.activeWorkspaceId = workspace.id;
  return { ok: true, workspace, candidate: merged, state: next, merge: { mode: 'metadata-context', targetWorkspaceId: workspace.id || '', targetWorkspaceTitle: workspace.title || workspace.name || '' } };
}

function attachOpenedWorkspaceContextReference(targetWorkspace, sourceWorkspace, openedCandidate, options = {}) {
  const openedPath = canonicalizeLocalPath(openedCandidate?.path || '');
  targetWorkspace.records = Array.isArray(targetWorkspace.records) ? targetWorkspace.records : [];
  targetWorkspace.assets = Array.isArray(targetWorkspace.assets) ? targetWorkspace.assets : [];
  targetWorkspace.workspaceMergeCandidates = Array.isArray(targetWorkspace.workspaceMergeCandidates) ? targetWorkspace.workspaceMergeCandidates : [];
  targetWorkspace.workspaceMergedEntries = Array.isArray(targetWorkspace.workspaceMergedEntries) ? targetWorkspace.workspaceMergedEntries : [];
  const reference = {
    schema: 'tiinex.workspace.context-reference.v1',
    id: contextReferenceId(sourceWorkspace, openedCandidate),
    relation: 'opened-from-workspace-candidate',
    sourceWorkspaceId: sourceWorkspace?.id || '',
    sourceWorkspaceTitle: sourceWorkspace?.title || sourceWorkspace?.name || '',
    candidateId: openedCandidate?.id || '',
    candidatePath: openedPath,
    candidateTitle: openedCandidate?.title || workspaceTitleFromMarkdown(openedCandidate?.markdown || '') || openedPath,
    ownedMaterialPolicy: 'reference-only',
    note: 'Opened workspace may use the origin/package workspace as lineage or recovery context, but sibling records, assets, source rows, and workspace candidates are not cloned as owned material.',
    counts: {
      sourceRecords: Array.isArray(sourceWorkspace?.records) ? sourceWorkspace.records.length : 0,
      sourceAssets: Array.isArray(sourceWorkspace?.assets) ? sourceWorkspace.assets.length : 0,
      sourceRows: Array.isArray(sourceWorkspace?.sources) ? sourceWorkspace.sources.length : 0,
      sourceWorkspaceCandidates: Array.isArray(sourceWorkspace?.workspaceMergeCandidates) ? sourceWorkspace.workspaceMergeCandidates.length : 0,
      siblingWorkspaceCandidates: Array.isArray(sourceWorkspace?.workspaceMergeCandidates) ? sourceWorkspace.workspaceMergeCandidates.filter((item) => canonicalizeLocalPath(item.path || '') !== openedPath).length : 0
    },
    at: nowIso(options)
  };
  targetWorkspace.contextReferences = Array.isArray(targetWorkspace.contextReferences) ? targetWorkspace.contextReferences.filter((item) => item?.id !== reference.id) : [];
  targetWorkspace.contextReferences.unshift(reference);
  targetWorkspace.workspaceContext = Object.assign({}, targetWorkspace.workspaceContext || {}, {
    schema: 'tiinex.workspace.context.v1',
    openedFromContextReferenceId: reference.id,
    ownedMaterialPolicy: reference.ownedMaterialPolicy,
    sourceWorkspaceId: reference.sourceWorkspaceId
  });
  return reference;
}

function contextReferenceId(sourceWorkspace = {}, openedCandidate = {}) {
  const sourceId = String(sourceWorkspace?.id || 'workspace').trim() || 'workspace';
  const candidateKey = canonicalizeLocalPath(openedCandidate?.path || openedCandidate?.id || 'workspace.workspace.md') || 'workspace.workspace.md';
  return `workspace-context:${sourceId}:${candidateKey}`;
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
