import { canonicalProductState } from './productStateBoundary.js';
import { classifyRouteLocation } from './publicTarget.js';
import { durableLocalAuthorityForRoute } from './historyAuthority.js';

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
  const routeOwner = classifyRouteLocation(window.location);
  const durableLocalAuthority = durableLocalAuthorityForRoute(routeOwner.kind, window.history?.state || null);
  const durableLocalPolicy = durableLocalAuthority === 'isolated-preexisting-recovery' ? 'preserve-existing' : 'normal';
  const routeResolution = routeOwner.kind === 'semantic-state'
    ? (persistence?.resolveInitialState?.({ location: window.location, storage: window.localStorage, durableLocalPolicy }) || { requested: true, resolved: false, state: null, reason: 'route-resolution-unavailable' })
    : { requested: routeOwner.kind === 'public-target', resolved: false, state: null, reason: routeOwner.kind };
  const routeState = routeResolution?.resolved ? routeResolution.state : null;
  const resolved = routeState ? route?.normalizeRouteState?.(routeState, lifecycle) || routeState : defaultState();
  return {
    state: canonicalProductState(resolved, persistence, 'initial-state'),
    routeResolved: Boolean(routeResolution?.resolved),
    routeRequested: Boolean(routeResolution?.requested),
    routeReason: routeResolution?.reason || '',
    routeState: routeState || null,
    routeKind: routeOwner.kind,
    durableLocalAuthority,
    publicTarget: routeOwner.target || null
  };
}

export function initialState() {
  return initialRuntimeSnapshot().state;
}

export function activeWorkspace(state) {
  return runtime().lifecycle?.activeWorkspace?.(state) || null;
}
