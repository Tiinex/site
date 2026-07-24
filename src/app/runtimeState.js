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
    view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' }, expandedTreeFolders: [] },
    workspaces: [],
    audit: null
  };
}

export function initialState() {
  const { lifecycle, route, persistence } = runtime();
  const routeState = persistence?.readInitialState?.({ location: window.location, storage: window.localStorage });
  return routeState ? route?.normalizeRouteState?.(routeState, lifecycle) || routeState : defaultState();
}

export function activeWorkspace(state) {
  return runtime().lifecycle?.activeWorkspace?.(state) || null;
}
