export function workspaceViewScrollKeyFor(sourceState = {}, viewOverride = null, explicitWorkspaceId = '') {
  const view = viewOverride || sourceState?.view || {};
  const workspaceId = explicitWorkspaceId || sourceState?.activeWorkspaceId || 'workspace';
  const verse = view.workspaceVerse || 'feed';
  const query = verse === 'lineage' ? (view.lineageQuery || '') : (view.query || '');
  const selected = verse === 'lineage' ? (view.selectedRecordId || '') : '';
  const display = view.displayOptions ? JSON.stringify(view.displayOptions) : '';
  return `${workspaceId}:${verse}:${query}:${selected}:${display}`;
}

export function stateWithViewPatch(sourceState = {}, patch = {}) {
  return Object.assign({}, sourceState, {
    view: Object.assign({}, sourceState.view || {}, patch)
  });
}

export function stateWithViewUpdate(sourceState = {}, updater = null) {
  const currentView = sourceState.view || {};
  const nextView = typeof updater === 'function' ? updater(currentView, sourceState) : Object.assign({}, currentView, updater || {});
  if (nextView === currentView) return sourceState;
  return Object.assign({}, sourceState, { view: nextView });
}

export function stateWithCapturedViewScroll(nextState = {}, sourceState = {}, capturedScroll = {}, explicitWorkspaceId = '') {
  const key = workspaceViewScrollKeyFor(sourceState, null, explicitWorkspaceId);
  const top = capturedScroll?.[key];
  if (!Number.isFinite(Number(top))) return nextState;
  const scrollPositions = Object.assign({}, nextState.view?.scrollPositions || {});
  const roundedTop = Math.max(0, Math.round(Number(top)));
  if (Number(scrollPositions[key] || 0) === roundedTop) return nextState;
  scrollPositions[key] = roundedTop;
  return Object.assign({}, nextState, {
    view: Object.assign({}, nextState.view || {}, { scrollPositions })
  });
}
