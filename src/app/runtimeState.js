import { canonicalProductState } from './productStateBoundary.js';

export const CLEAN_URL_BOUNDARY = 'clean-url-does-not-bootstrap-stale-local-storage';

export function runtime() {
  return {
    config: window.TiinexWorkspaceConfig,
    lifecycle: window.TiinexWorkspaceLifecycle,
    route: window.TiinexWorkspaceRoute,
    persistence: window.TiinexWorkspacePersistence
  };
}

export function defaultState() {
  return runtime().lifecycle?.makeEmptyAppState?.() || {
    version: 1,
    activeWorkspaceId: '',
    view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' }, expandedTreeFolders: [] },
    workspaces: [],
    audit: null
  };
}

export function initialRuntimeSnapshot() {
  const { lifecycle, route, persistence } = runtime();
  const routeResolution = persistence?.resolveInitialState?.({ location: window.location, storage: window.localStorage })
    || { requested: false, resolved: false, state: null, reason: 'route-resolution-unavailable' };
  const routeState = routeResolution?.resolved ? routeResolution.state : null;
  const resolved = routeState ? route?.normalizeRouteState?.(routeState, lifecycle) || routeState : defaultState();
  return {
    state: canonicalProductState(resolved, persistence, 'initial-state'),
    routeResolved: Boolean(routeResolution?.resolved),
    routeRequested: Boolean(routeResolution?.requested),
    routeReason: routeResolution?.reason || '',
    routeState: routeState || null
  };
}

export function initialState() {
  return initialRuntimeSnapshot().state;
}

export function activeWorkspace(state) {
  return runtime().lifecycle?.activeWorkspace?.(state) || null;
}
