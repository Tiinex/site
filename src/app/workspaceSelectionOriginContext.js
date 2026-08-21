export const WORKSPACE_SELECTION_ORIGIN_CONTEXT_SCHEMA_ID = 'tiinex.site.workspace-selection-origin-context.v1';

export function captureWorkspaceSelectionOriginContext(state = {}) {
  return Object.freeze({
    schema: WORKSPACE_SELECTION_ORIGIN_CONTEXT_SCHEMA_ID,
    activeWorkspaceId: String(state.activeWorkspaceId || ''),
    view: cloneJson(state.view || {}),
    workspaceViews: cloneJson(state.workspaceViews || {}),
    workspaceWindow: state.workspaceWindow ? cloneJson(state.workspaceWindow) : null
  });
}

export function restoreWorkspaceSelectionOriginContext(state = {}, context = null) {
  if (!context || context.schema !== WORKSPACE_SELECTION_ORIGIN_CONTEXT_SCHEMA_ID) return state;
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const activeWorkspaceId = workspaces.some((workspace) => String(workspace?.id || '') === String(context.activeWorkspaceId || ''))
    ? String(context.activeWorkspaceId || '')
    : String(state.activeWorkspaceId || '');
  const next = Object.assign({}, state, {
    activeWorkspaceId,
    view: cloneJson(context.view || state.view || {}),
    workspaceViews: cloneJson(context.workspaceViews || state.workspaceViews || {})
  });
  if (context.workspaceWindow) next.workspaceWindow = cloneJson(context.workspaceWindow);
  else delete next.workspaceWindow;
  return next;
}

function cloneJson(value) { return JSON.parse(JSON.stringify(value ?? null)); }
