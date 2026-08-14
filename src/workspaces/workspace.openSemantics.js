import { isLocalSessionMaterial } from './workspace.localSourceLifecycle.js';

export function workspaceHasDurableLocalMaterial(workspace = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  return records.some(isLocalSessionMaterial)
    || assets.some(isLocalSessionMaterial);
}

export function replaceNonDraftWorkspaceSet(state = {}, keepWorkspaceIds = []) {
  const keepIds = new Set((Array.isArray(keepWorkspaceIds) ? keepWorkspaceIds : [keepWorkspaceIds]).map((id) => String(id || '').trim()).filter(Boolean));
  const before = Array.isArray(state.workspaces) ? state.workspaces : [];
  const kept = [];
  const closed = [];
  for (const workspace of before) {
    if (keepIds.has(String(workspace?.id || '')) || workspaceHasDurableLocalMaterial(workspace)) kept.push(workspace);
    else closed.push(workspace);
  }
  const next = Object.assign({}, state, { workspaces: kept });
  if (!kept.some((workspace) => workspace.id === next.activeWorkspaceId)) {
    next.activeWorkspaceId = kept.find((workspace) => keepIds.has(String(workspace?.id || '')))?.id || kept[0]?.id || '';
  }
  return {
    state: next,
    report: {
      schema: 'tiinex.workspace.open-replace.v1',
      before: before.length,
      keptLocalWorkspaces: kept.filter((workspace) => !keepIds.has(String(workspace?.id || ''))).map((workspace) => workspace.id),
      openedWorkspaceIds: kept.filter((workspace) => keepIds.has(String(workspace?.id || ''))).map((workspace) => workspace.id),
      closedNonDraftWorkspaces: closed.map((workspace) => workspace.id)
    }
  };
}
