import { hydrateUiWorkspace } from './recordUi.js';

const DEFAULT_WORKSPACE_VIEW = Object.freeze({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' });

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

export function visibleWorkspaceItemsFor(state = {}, { active = null, activeUi = null, pagerVisible = false, viewportWidth = 0 } = {}) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const width = Number(viewportWidth || 0) || 1280;
  const maxColumns = pagerVisible ? 1 : workspaceColumnCapacity(width);
  const visible = maxColumns > 1 ? visibleWorkspaceSlice(workspaces, active?.id, maxColumns) : (active ? [active] : []);
  return visible.map((workspace) => ({
    workspace,
    ui: workspace?.id === active?.id ? activeUi : hydrateUiWorkspace(workspace),
    surfaceState: stateForWorkspaceSurface(state, workspace?.id),
    active: workspace?.id === active?.id
  }));
}

export function workspaceColumnCapacity(viewportWidth = 0) {
  const width = Number(viewportWidth || 0) || 1280;
  if (width < 980) return 1;
  if (width < 1500) return 2;
  return 3;
}

function visibleWorkspaceSlice(workspaces = [], activeWorkspaceId = '', maxColumns = 1) {
  const list = Array.isArray(workspaces) ? workspaces : [];
  const limit = Math.max(1, Math.min(Number(maxColumns || 1), list.length));
  if (list.length <= limit) return list;
  const activeIndex = Math.max(0, list.findIndex((workspace) => workspace.id === activeWorkspaceId));
  const preferredStart = activeIndex - Math.floor((limit - 1) / 2);
  const start = Math.max(0, Math.min(preferredStart, list.length - limit));
  return list.slice(start, start + limit);
}

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
  return next;
}
