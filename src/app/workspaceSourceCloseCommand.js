import { clearGithubSourceCacheForSource } from './githubSourceOperation.js';

export function runWorkspaceSourceCloseCommand(input = {}) {
  const lifecycle = input.lifecycle;
  const state = input.state;
  const workspaceId = String(input.workspaceId || state?.activeWorkspaceId || '').trim();
  const sourceId = String(input.sourceId || '').trim();
  const workspace = (Array.isArray(state?.workspaces) ? state.workspaces : []).find((item) => item.id === workspaceId) || lifecycle?.activeWorkspace?.(state) || null;
  const source = (workspace?.sources || []).find((item) => String(item.id || '') === sourceId) || null;
  if (source) clearGithubSourceCacheForSource(source);
  const result = lifecycle?.closeWorkspaceSource?.(state, workspaceId, sourceId);
  if (!result?.ok) return { ok: false, error: result?.error || 'source.close.failed', state, notice: 'Source stays pinned.' };
  return { ok: true, state: result.state, localSessionCleared: Boolean(result.localSessionCleared), counts: result.counts || {}, notice: sourceCloseNotice(result) };
}

function sourceCloseNotice(result = {}) {
  if (!result.localSessionCleared) return 'Source closed.';
  const counts = result.counts || {};
  const parts = [
    Number(counts.records || 0) ? `${Number(counts.records || 0)} record${Number(counts.records || 0) === 1 ? '' : 's'}` : '',
    Number(counts.assets || 0) ? `${Number(counts.assets || 0)} asset${Number(counts.assets || 0) === 1 ? '' : 's'}` : '',
    Number(counts.workspaceArtifacts || 0) ? `${Number(counts.workspaceArtifacts || 0)} workspace artifact${Number(counts.workspaceArtifacts || 0) === 1 ? '' : 's'}` : ''
  ].filter(Boolean);
  return parts.length ? `Cleared Local session material: ${parts.join(', ')}. Local source row stays available.` : 'Local source was already empty.';
}
