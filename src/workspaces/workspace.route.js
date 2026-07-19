(function attachWorkspaceRoute(global) {
  'use strict';

  const HASH_PREFIX = '#state=';
  const STATE_VERSION = 2;

  function makeRouteState(appState) {
    const state = appState && typeof appState === 'object' ? appState : {};
    return {
      v: STATE_VERSION,
      activeWorkspaceId: state.activeWorkspaceId || '',
      view: Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, state.view || {}),
      workspaces: Array.isArray(state.workspaces) ? state.workspaces.map(compactWorkspace) : []
    };
  }

  function compactWorkspace(workspace) {
    return {
      id: workspace.id || '',
      name: workspace.name || workspace.title || 'Workspace',
      title: workspace.title || workspace.name || 'Workspace',
      createdAt: workspace.createdAt || '',
      kind: workspace.kind || 'workspace',
      source: Object.assign({}, workspace.source || {}),
      sources: Array.isArray(workspace.sources) ? workspace.sources.map(compactSource) : [],
      sourceOrder: Array.isArray(workspace.sourceOrder) ? workspace.sourceOrder.slice() : [],
      discoveryProgress: workspace.discoveryProgress ? Object.assign({}, workspace.discoveryProgress) : null,
      records: Array.isArray(workspace.records) ? workspace.records.map(compactRecord) : [],
      mode: workspace.mode || 'feed'
    };
  }

  function compactSource(source) {
    return {
      id: source.id || '',
      kind: source.kind || '',
      label: source.label || '',
      repo: source.repo || '',
      ref: source.ref || '',
      rootPath: source.rootPath || '',
      count: Number(source.count || 0),
      boundary: source.boundary || '',
      transportLabel: source.transportLabel || '',
      closeable: Boolean(source.closeable)
    };
  }

  function compactRecord(record) {
    return {
      id: record.id || '',
      title: record.title || '',
      summary: record.summary || '',
      kind: record.kind || '',
      status: record.status || '',
      createdAt: record.createdAt || ''
    };
  }

  function routeHasWorkspaces(routeState) {
    return Array.isArray(routeState?.workspaces) && routeState.workspaces.length > 0;
  }

  function normalizeRouteState(routeState, lifecycle) {
    const empty = lifecycle?.makeEmptyAppState?.() || { version: 1, activeWorkspaceId: '', view: {}, workspaces: [], audit: null };
    if (!routeState || !routeHasWorkspaces(routeState)) return empty;
    const next = lifecycle?.cloneState?.(Object.assign({}, empty, routeState)) || JSON.parse(JSON.stringify(Object.assign({}, empty, routeState)));
    next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {});
    next.workspaces = Array.isArray(next.workspaces) ? next.workspaces : [];
    next.activeWorkspaceId = next.workspaces.some((workspace) => workspace.id === next.activeWorkspaceId)
      ? next.activeWorkspaceId
      : (next.workspaces[0]?.id || '');
    return next;
  }

  function routeSummary(routeState) {
    return {
      v: routeState?.v || STATE_VERSION,
      workspaces: Array.isArray(routeState?.workspaces) ? routeState.workspaces.length : 0,
      activeWorkspaceId: routeState?.activeWorkspaceId || '',
      workspaceVerse: routeState?.view?.workspaceVerse || 'feed',
      query: routeState?.view?.query || ''
    };
  }

  global.TiinexWorkspaceRoute = {
    HASH_PREFIX,
    STATE_VERSION,
    compactRecord,
    compactSource,
    compactWorkspace,
    makeRouteState,
    normalizeRouteState,
    routeHasWorkspaces,
    routeSummary
  };
})(typeof window !== 'undefined' ? window : globalThis);
