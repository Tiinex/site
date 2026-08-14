import { addConfiguredSourceToWorkspace, workspaceSourceInputsFromMarkdown } from '../workspaces/workspace.entrypoints.js';
import { replaceNonDraftWorkspaceSet } from '../workspaces/workspace.openSemantics.js';
import { mergeWorkspaceEntrypointSet, openWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';
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
  if (sourceInputs.length) {
    const opened = openWorkspaceEntrypointSet({ lifecycle, state, entry, sourceInputs, annotateWorkspace: annotateWorkspaceEntrypoint });
    if (!opened?.ok) return opened;
    const focusedState = stateWithFocusedWorkspace(opened.state, opened.workspace?.id, { previousWorkspaceId: state.activeWorkspaceId || '', previousView: state.view || {} });
    const workspace = (focusedState.workspaces || []).find((item) => item.id === opened.workspace?.id) || opened.workspace;
    return Object.assign({}, opened, { state: focusedState, workspace, openedWorkspaceSet: true });
  }

  const opened = lifecycle?.openWorkspaceFromMarkdown?.(state, entry.markdown, entry);
  if (!opened?.ok) return { ok: false, error: opened?.error || 'workspace.open.failed', message: 'Could not open workspace artifact.', state, entry };
  const replaced = replaceNonDraftWorkspaceSet(opened.state, [opened.workspace?.id]);
  const focusedState = stateWithFocusedWorkspace(replaced.state, opened.workspace?.id, { previousWorkspaceId: state.activeWorkspaceId || '', previousView: state.view || {} });
  const workspace = (Array.isArray(focusedState?.workspaces) ? focusedState.workspaces : []).find((item) => item.id === opened.workspace?.id) || opened.workspace;
  return { ok: true, state: focusedState, workspace, entry, sourceInputs: [], openBoundary: replaced.report };
}

export function mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, workspaceId, record }) {
  const entry = workspaceEntryFromRecord(record);
  if (!entry.markdown) return { ok: false, error: 'workspace.markdown.unavailable', message: 'Workspace artifact body is unavailable; reload the source first.', state, entry };
  const sourceInputs = workspaceSourceInputsFromMarkdown(entry.markdown, parseWorkspaceConfig);
  if (sourceInputs.length) return mergeWorkspaceEntrypointSet({ lifecycle, state, entry, sourceInputs, annotateWorkspace: annotateWorkspaceEntrypoint });

  const merged = lifecycle?.mergeWorkspaceArtifactContext?.(state, workspaceId, entry)
    || lifecycle?.mergeWorkspaceImport?.(state, workspaceId, entry);
  if (!merged?.ok) return { ok: false, error: merged?.error || 'workspace.merge.failed', message: 'Could not merge workspace artifact context.', state, entry };
  return { ok: true, state: merged.state, workspace: merged.workspace, entry, sourceInputs: [], merge: merged.merge || { mode: 'artifact-context' } };
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

function annotateWorkspaceEntrypoint({ state, workspaceId, entry, mode }) {
  annotateWorkspaceImport(state, workspaceId, entry, mode);
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

function stateWithFocusedWorkspace(state = {}, workspaceId = '', { previousWorkspaceId = '', previousView = {} } = {}) {
  const target = (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => workspace.id === workspaceId);
  if (!target) return state;
  const views = Object.assign({}, state.workspaceViews || {});
  const prevId = String(previousWorkspaceId || '').trim();
  if (prevId && prevId !== target.id && (Array.isArray(state.workspaces) ? state.workspaces : []).some((workspace) => workspace.id === prevId)) views[prevId] = normalizeWorkspaceView(previousView || state.view || {});
  views[target.id] = normalizeWorkspaceView({ workspaceVerse: 'feed', selectedRecordId: '', lineageQuery: '', expandedLineageRecordIds: [], lineageAuditReport: null, lineageLoadReport: null });
  return Object.assign({}, state, {
    activeWorkspaceId: target.id,
    workspaceViews: views,
    view: views[target.id]
  });
}

function normalizeWorkspaceView(view = {}) {
  return Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, view || {}, {
    workspaceVerse: view.workspaceVerse && ['feed', 'tree', 'lineage', 'audit'].includes(String(view.workspaceVerse)) ? view.workspaceVerse : 'feed',
    selectedRecordId: String(view.selectedRecordId || ''),
    lineageQuery: String(view.lineageQuery || ''),
    expandedLineageRecordIds: Array.isArray(view.expandedLineageRecordIds) ? view.expandedLineageRecordIds.slice() : [],
    lineageAuditReport: view.lineageAuditReport || null,
    lineageLoadReport: view.lineageLoadReport || null
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
