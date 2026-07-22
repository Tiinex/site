export function setWorkspaceDiscoveryProgress(state = {}, workspaceId = '', progress = {}) {
  const next = structuredClone(state || {});
  const targetId = workspaceId || next.activeWorkspaceId;
  const workspace = (next.workspaces || []).find((item) => item.id === targetId);
  if (!workspace) return { ok: false, error: 'workspace.not.found', state };
  const sourceId = String(progress.sourceId || '').trim();
  const percent = Math.max(0, Math.min(100, Number(progress.percent ?? 48)));
  workspace.discoveryProgress = {
    sourceId,
    phase: progress.phase || 'source-materialization',
    label: progress.label || 'Source materialization running',
    percent,
    active: progress.active !== false
  };
  const source = (workspace.sources || []).find((item) => item.id === sourceId);
  if (source) source.discoveryState = progress.discoveryState || (progress.active === false ? 'failed' : 'loading');
  next.activeWorkspaceId = workspace.id;
  return { ok: true, workspace, state: next };
}

export function clearWorkspaceDiscoveryProgress(state = {}, workspaceId = '', sourceId = '') {
  const next = structuredClone(state || {});
  const targetId = workspaceId || next.activeWorkspaceId;
  const workspace = (next.workspaces || []).find((item) => item.id === targetId);
  if (!workspace) return { ok: false, error: 'workspace.not.found', state };
  const clean = String(sourceId || '').trim();
  if (!clean || workspace.discoveryProgress?.sourceId === clean) workspace.discoveryProgress = null;
  next.activeWorkspaceId = workspace.id;
  return { ok: true, workspace, state: next };
}
