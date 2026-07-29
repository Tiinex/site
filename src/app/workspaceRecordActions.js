import { mergeWorkspaceCandidate as mergeStagedWorkspaceCandidate } from '../workspaces/workspace.candidates.js';

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
  const opened = lifecycle?.openWorkspaceFromMarkdown?.(state, entry.markdown, entry);
  if (!opened?.ok) return { ok: false, error: opened?.error || 'workspace.open.failed', message: 'Could not open workspace artifact.', state, entry };
  const withSources = registerWorkspaceConfigSources(opened.state, opened.workspace?.id, entry.markdown, { lifecycle, parseWorkspaceConfig });
  return { ok: true, state: withSources, workspace: opened.workspace, entry };
}

export function mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state, workspaceId, record }) {
  const entry = workspaceEntryFromRecord(record);
  if (!entry.markdown) return { ok: false, error: 'workspace.markdown.unavailable', message: 'Workspace artifact body is unavailable; reload the source first.', state, entry };
  const staged = lifecycle?.mergeWorkspaceImport?.(state, workspaceId, entry);
  if (!staged?.ok) return { ok: false, error: staged?.error || 'workspace.merge.stage.failed', message: 'Could not stage workspace artifact for merge.', state, entry };
  const merged = mergeStagedWorkspaceCandidate(lifecycle, staged.state, workspaceId, entry.id || entry.path);
  if (!merged?.ok) return { ok: false, error: merged?.error || 'workspace.merge.failed', message: 'Could not merge workspace artifact.', state, entry };
  const withSources = registerWorkspaceConfigSources(merged.state, workspaceId, entry.markdown, { lifecycle, parseWorkspaceConfig });
  return { ok: true, state: withSources, workspace: merged.workspace, candidate: merged.candidate, entry };
}

export function registerWorkspaceConfigSources(state, workspaceId, markdown = '', { lifecycle, parseWorkspaceConfig } = {}) {
  if (!lifecycle?.addWorkspaceSource || typeof parseWorkspaceConfig !== 'function') return state;
  let config = null;
  try { config = parseWorkspaceConfig(markdown); } catch (_) { return state; }
  const entrypoints = Array.isArray(config?.workspaceEntrypoints) ? config.workspaceEntrypoints : [];
  let next = state;
  for (const entrypoint of entrypoints) {
    const repository = String(entrypoint?.repository || entrypoint?.repo || '').trim();
    if (!repository) continue;
    const added = lifecycle.addWorkspaceSource(next, workspaceId, {
      repository,
      ref: entrypoint.ref || '',
      rootPath: entrypoint.rootPath || '.topics',
      label: entrypoint.name || entrypoint.label || repository,
      sourceKind: entrypoint.sourceKind || entrypoint.kind || 'github-tree',
      repoDiscovery: truthyWorkspaceConfigValue(entrypoint.repoFilesDiscovery ?? entrypoint.repoDiscovery ?? true),
      issueDiscovery: truthyWorkspaceConfigValue(entrypoint.issueDiscovery ?? entrypoint.issueSnapshots ?? false),
      issueUrls: entrypoint.issueUrl || entrypoint.issueUrls || '',
      discoveryState: 'deferred'
    });
    if (added?.ok) next = added.state;
  }
  return next;
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
