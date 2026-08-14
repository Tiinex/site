import { runInitialWorkspaceBootstrapOperation } from './initialWorkspaceBootstrapOperation.js';

export async function runWorkspaceStartupTransition({
  runtimeApi = {},
  emptyState = {},
  workspaceConfig = {},
  storage = null,
  locationLike = null,
  windowObj = null,
  fetchImpl = globalThis.fetch,
  commit = null,
  materializeSource = null,
  setDiagnostics = null,
  mode = 'replace',
  resolveStartupInput
} = {}) {
  let committed = null;
  const result = await runInitialWorkspaceBootstrapOperation({
    runtimeApi,
    state: emptyState,
    workspaceConfig,
    storage,
    locationLike,
    windowObj,
    fetchImpl,
    materializeSource,
    setDiagnostics,
    resolveStartupInput,
    commit: (nextState) => { committed = nextState; commit?.(nextState, mode); }
  });
  return Object.assign({}, result, { state: committed || result?.state || emptyState });
}
