export function workspaceColumnCapacity(viewportWidth = 0) {
  const width = Number(viewportWidth || 0) || 1280;
  if (width < 980) return 1;
  if (width < 1500) return 2;
  return 3;
}

export function shouldPageWorkspaces(workspaceCount, viewportWidth = 0) {
  const count = Math.max(0, Number(workspaceCount || 0));
  return count > workspaceColumnCapacity(viewportWidth);
}

export function workspaceWindowFor(state = {}, { viewportWidth = 0, activeWorkspaceId = '' } = {}) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const capacity = workspaceColumnCapacity(viewportWidth);
  const count = workspaces.length;
  const activeId = String(activeWorkspaceId || state.activeWorkspaceId || workspaces[0]?.id || '').trim();
  const activeIndex = Math.max(0, workspaces.findIndex((workspace) => workspace.id === activeId));
  const limit = Math.max(1, Math.min(capacity, Math.max(1, count)));
  const maxOffset = Math.max(0, count - limit);
  const preferredOffset = Number(state.workspaceWindow?.offset || 0);
  let offset = Number.isFinite(preferredOffset) ? Math.max(0, Math.min(preferredOffset, maxOffset)) : 0;
  if (count && (activeIndex < offset || activeIndex >= offset + limit)) {
    offset = Math.max(0, Math.min(activeIndex - Math.floor((limit - 1) / 2), maxOffset));
  }
  const visible = workspaces.slice(offset, offset + limit);
  return {
    schema: 'tiinex.workspace.window.v1',
    capacity,
    count,
    offset,
    canPage: count > capacity,
    from: count ? offset + 1 : 0,
    to: Math.min(count, offset + limit),
    visible,
    visibleIds: visible.map((workspace) => workspace.id),
    activeWorkspaceId: activeId,
    previousEnabled: offset > 0,
    nextEnabled: offset + limit < count
  };
}

export function stateWithWorkspaceWindowOffset(state = {}, offset = 0, viewportWidth = 0) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const windowState = workspaceWindowFor(state, { viewportWidth });
  const maxOffset = Math.max(0, windowState.count - Math.max(1, windowState.capacity));
  const nextOffset = Math.max(0, Math.min(Number(offset || 0), maxOffset));
  const firstVisibleId = String(workspaces[nextOffset]?.id || state.activeWorkspaceId || '').trim();
  return Object.assign({}, state, {
    activeWorkspaceId: firstVisibleId || state.activeWorkspaceId,
    workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: nextOffset }
  });
}

export function stateWithWorkspaceWindowPage(state = {}, direction = 'next', viewportWidth = 0) {
  const current = workspaceWindowFor(state, { viewportWidth });
  const delta = direction === 'previous' ? -1 : 1;
  if ((delta < 0 && !current.previousEnabled) || (delta > 0 && !current.nextEnabled)) return state;
  return stateWithWorkspaceWindowOffset(state, current.offset + delta, viewportWidth);
}

export function stateWithWorkspaceWindowFocus(state = {}, workspaceId = '', viewportWidth = 0) {
  const id = String(workspaceId || '').trim();
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const index = workspaces.findIndex((workspace) => workspace.id === id);
  if (index < 0) return state;
  const capacity = workspaceColumnCapacity(viewportWidth);
  const maxOffset = Math.max(0, workspaces.length - capacity);
  const current = workspaceWindowFor(state, { viewportWidth, activeWorkspaceId: id });
  let offset = current.offset;
  if (index < offset) offset = index;
  if (index >= offset + capacity) offset = Math.max(0, index - capacity + 1);
  offset = Math.max(0, Math.min(offset, maxOffset));
  return Object.assign({}, state, {
    activeWorkspaceId: id,
    workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset }
  });
}

export function stateWithWorkspaceWindowPruned(state = {}, viewportWidth = 0) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  if (!workspaces.length) return Object.assign({}, state, { workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: 0 } });
  const activeId = workspaces.some((workspace) => workspace.id === state.activeWorkspaceId) ? state.activeWorkspaceId : workspaces[0].id;
  return stateWithWorkspaceWindowFocus(Object.assign({}, state, { activeWorkspaceId: activeId }), activeId, viewportWidth);
}
