import { hydrateUiWorkspace } from './recordUi.js';
import { workspaceColumnCapacity, workspaceWindowFor } from './workspaceWindow.js';

const DEFAULT_WORKSPACE_VIEW = Object.freeze({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', layoutMode: 'expanded' });

export function defaultWorkspaceView() {
  return Object.assign({}, DEFAULT_WORKSPACE_VIEW);
}

export function activeWorkspaceViewFor(state = {}, workspaceId = '') {
  const id = String(workspaceId || '').trim();
  const stored = id && state.workspaceViews && typeof state.workspaceViews === 'object' ? state.workspaceViews[id] : null;
  if (stored && typeof stored === 'object') return normalizeWorkspaceView(stored);
  if (id && id === state.activeWorkspaceId && state.view && typeof state.view === 'object') return normalizeWorkspaceView(state.view);
  return defaultWorkspaceView();
}

export function workspaceLayoutModeFor(state = {}, workspaceId = '') {
  return activeWorkspaceViewFor(state, workspaceId).layoutMode === 'compact' ? 'compact' : 'expanded';
}

export function stateForWorkspaceSurface(state = {}, workspaceId = '') {
  return Object.assign({}, state, { view: activeWorkspaceViewFor(state, workspaceId) });
}

export function stateWithWorkspaceViewPatch(state = {}, workspaceId = '', patch = {}) {
  const id = String(workspaceId || state.activeWorkspaceId || '').trim();
  if (!id) return Object.assign({}, state, { view: normalizeWorkspaceView(Object.assign({}, state.view || {}, patch || {})) });
  return stateWithWorkspaceView(state, id, normalizeWorkspaceView(Object.assign({}, activeWorkspaceViewFor(state, id), patch || {})));
}

export function stateWithWorkspaceViewUpdate(state = {}, workspaceId = '', updater = null) {
  const id = String(workspaceId || state.activeWorkspaceId || '').trim();
  const currentView = activeWorkspaceViewFor(state, id);
  const nextView = typeof updater === 'function' ? updater(currentView) : currentView;
  return stateWithWorkspaceView(state, id, normalizeWorkspaceView(nextView));
}

export function stateWithWorkspaceLayoutMode(state = {}, workspaceId = '', layoutMode = 'expanded') {
  return stateWithWorkspaceViewPatch(state, workspaceId, { layoutMode: layoutMode === 'compact' ? 'compact' : 'expanded' });
}

export function stateWithActiveWorkspace(state = {}, workspaceId = '') {
  const id = String(workspaceId || '').trim();
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  if (!id || !workspaces.some((workspace) => workspace.id === id)) return state;
  const previousId = String(state.activeWorkspaceId || '').trim();
  const views = Object.assign({}, state.workspaceViews || {});
  if (previousId) views[previousId] = normalizeWorkspaceView(state.view || views[previousId] || DEFAULT_WORKSPACE_VIEW);
  const nextView = normalizeWorkspaceView(views[id] || DEFAULT_WORKSPACE_VIEW);
  views[id] = nextView;
  return Object.assign({}, state, { activeWorkspaceId: id, view: nextView, workspaceViews: views });
}

export function stateWithWorkspacePresentationPruned(state = {}) {
  const allowed = new Set((Array.isArray(state.workspaces) ? state.workspaces : []).map((workspace) => String(workspace.id || '')));
  const views = Object.fromEntries(Object.entries(state.workspaceViews || {}).filter(([id]) => allowed.has(String(id))));
  const activeId = allowed.has(String(state.activeWorkspaceId || '')) ? state.activeWorkspaceId : (state.workspaces?.[0]?.id || '');
  const view = activeId ? normalizeWorkspaceView(views[activeId] || (activeId === state.activeWorkspaceId ? state.view : DEFAULT_WORKSPACE_VIEW)) : normalizeWorkspaceView(state.view || DEFAULT_WORKSPACE_VIEW);
  if (activeId) views[activeId] = view;
  return Object.assign({}, state, { activeWorkspaceId: activeId, view, workspaceViews: views });
}

export function visibleWorkspaceItemsFor(state = {}, { active = null, activeUi = null, viewportWidth = 0 } = {}) {
  const windowState = workspaceWindowFor(state, { viewportWidth, activeWorkspaceId: active?.id || state.activeWorkspaceId });
  return windowState.visible.map((workspace) => ({
    workspace,
    ui: workspace?.id === active?.id ? activeUi : hydrateUiWorkspace(workspace),
    surfaceState: stateForWorkspaceSurface(state, workspace?.id),
    layoutMode: workspaceLayoutModeFor(state, workspace?.id),
    active: workspace?.id === active?.id
  }));
}

export { workspaceColumnCapacity };

function stateWithWorkspaceView(state = {}, workspaceId = '', view = {}) {
  const id = String(workspaceId || '').trim();
  const views = Object.assign({}, state.workspaceViews || {});
  if (id) views[id] = normalizeWorkspaceView(view);
  return Object.assign({}, state, {
    view: id === state.activeWorkspaceId ? views[id] : normalizeWorkspaceView(state.view || DEFAULT_WORKSPACE_VIEW),
    workspaceViews: views
  });
}

function normalizeWorkspaceView(view = {}) {
  const next = Object.assign({}, DEFAULT_WORKSPACE_VIEW, view || {});
  if (!['feed', 'tree', 'lineage', 'audit'].includes(String(next.workspaceVerse || ''))) next.workspaceVerse = 'feed';
  next.layoutMode = next.layoutMode === 'compact' ? 'compact' : 'expanded';
  return next;
}
