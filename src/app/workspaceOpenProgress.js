import { setWorkspaceDiscoveryProgress } from '../workspaces/workspace.discoveryProgress.js';

export function stateWithWorkspaceRecordOpenProgress(openedState = {}, workspaceId = '', sourceInputs = [], entry = {}) {
  const inputs = Array.isArray(sourceInputs) ? sourceInputs : [];
  if (!inputs.length) return openedState;
  let next = openedState;
  for (const input of inputs) {
    const targetWorkspaceId = input.workspaceId || workspaceId || '';
    if (!targetWorkspaceId) continue;
    const primary = input || {};
    const sourceId = String(primary.sourceId || primary.id || '').trim();
    const sourceLabel = String(primary.label || primary.repository || entry?.title || 'Workspace source').trim();
    const workspace = (Array.isArray(next?.workspaces) ? next.workspaces : []).find((item) => item.id === targetWorkspaceId);
    const resolvedSourceId = sourceId || (Array.isArray(workspace?.sources) ? workspace.sources.find((source) => String(source.label || '') === sourceLabel || String(source.repo || source.repository || '') === String(primary.repository || ''))?.id : '') || '';
    const progress = setWorkspaceDiscoveryProgress(next, targetWorkspaceId, {
      sourceId: resolvedSourceId,
      phase: 'workspace-open-source-queued',
      label: `${sourceLabel} source loading queued`,
      active: true,
      quantified: false,
      discoveryState: 'loading'
    });
    if (progress?.ok) next = progress.state;
  }
  return next;
}
