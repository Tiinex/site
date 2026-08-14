(function attachWorkspacePersistencePresentation(global) {
  'use strict';

  function createSessionPresentationState(state = {}) {
    const ids = workspaceIds(state);
    const allowed = new Set(ids);
    const workspaceViews = {};
    for (const [id, view] of Object.entries(state.workspaceViews || {})) {
      if (!allowed.has(String(id)) || !view || typeof view !== 'object') continue;
      workspaceViews[id] = clonePlain(view);
    }
    const activeId = String(state.activeWorkspaceId || '').trim();
    if (activeId && allowed.has(activeId) && state.view && typeof state.view === 'object') {
      workspaceViews[activeId] = Object.assign({}, workspaceViews[activeId] || {}, clonePlain(state.view));
    }
    const maxOffset = Math.max(0, ids.length - 1);
    const rawOffset = Number(state.workspaceWindow?.offset || 0);
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.min(Math.round(rawOffset), maxOffset)) : 0;
    return {
      workspaceViews,
      workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset }
    };
  }


  function sessionPresentationCompatible(routeState = {}, cachedState = {}) {
    return sameOrderedIds(workspaceIds(routeState), workspaceIds(cachedState));
  }

  function semanticCachedView(routeState = {}, cachedState = {}) {
    if (!sessionPresentationCompatible(routeState, cachedState)) return {};
    const project = global.TiinexWorkspaceRoute?.semanticRouteView;
    return typeof project === 'function' ? project(cachedState.view || {}) : stripPresentationView(cachedState.view || {});
  }


  function mergeSessionView(routeState = {}, cachedState = {}) {
    return Object.assign({}, semanticCachedView(routeState, cachedState), routeState.view || {});
  }

  function stripPresentationView(view = {}) {
    const out = clonePlain(view || {});
    delete out.layoutMode;
    delete out.scrollPositions;
    return out;
  }

  function restoreSessionPresentation(routeState = {}, cachedState = {}) {
    const routeIds = workspaceIds(routeState);
    const cachedIds = workspaceIds(cachedState);
    if (!sameOrderedIds(routeIds, cachedIds)) return routeState;
    const allowed = new Set(routeIds);
    const workspaceViews = {};
    for (const [id, view] of Object.entries(cachedState.workspaceViews || {})) {
      if (!allowed.has(String(id)) || !view || typeof view !== 'object') continue;
      workspaceViews[id] = clonePlain(view);
    }
    const activeId = String(routeState.activeWorkspaceId || '').trim();
    if (activeId && allowed.has(activeId)) {
      workspaceViews[activeId] = Object.assign({}, workspaceViews[activeId] || {}, routeState.view || {});
    }
    const rawOffset = Number(cachedState.workspaceWindow?.offset || 0);
    const maxOffset = Math.max(0, routeIds.length - 1);
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.min(Math.round(rawOffset), maxOffset)) : 0;
    return Object.assign({}, routeState, {
      workspaceViews,
      workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset }
    });
  }

  function workspaceIds(state = {}) {
    return asArray(state.workspaces).map((workspace) => String(workspace?.id || '').trim()).filter(Boolean);
  }

  function sameOrderedIds(left = [], right = []) {
    return left.length === right.length && left.every((id, index) => id === right[index]);
  }

  function clonePlain(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return Object.assign({}, value || {}); }
  }

  function asArray(value) { return Array.isArray(value) ? value : []; }

  global.TiinexWorkspacePersistencePresentation = {
    createSessionPresentationState,
    restoreSessionPresentation,
    sessionPresentationCompatible,
    semanticCachedView,
    mergeSessionView,
    sameOrderedIds
  };
})(typeof window !== 'undefined' ? window : globalThis);
