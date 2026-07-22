export function setWorkspaceDiscoveryProgress(state = {}, workspaceId = '', progress = {}) {
  const next = structuredClone(state || {});
  const targetId = workspaceId || next.activeWorkspaceId;
  const workspace = (next.workspaces || []).find((item) => item.id === targetId);
  if (!workspace) return { ok: false, error: 'workspace.not.found', state };
  const sourceId = String(progress.sourceId || '').trim();
  const hasMeasuredPercent = progress.percent != null && Number.isFinite(Number(progress.percent));
  const quantified = progress.quantified === false ? false : hasMeasuredPercent;
  workspace.discoveryProgress = {
    sourceId,
    phase: progress.phase || 'source-materialization',
    label: progress.label || 'Source materialization running',
    percent: quantified ? Math.max(0, Math.min(100, Number(progress.percent))) : null,
    quantified,
    active: progress.active !== false
  };
  if (progress.loaded != null) workspace.discoveryProgress.loaded = Number(progress.loaded || 0);
  if (progress.total != null) workspace.discoveryProgress.total = Number(progress.total || 0);
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
