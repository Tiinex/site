import { prepareDefaultWorkspaceStartCommand } from './defaultWorkspaceStartCommand.js';
import { prepareResolvedStartupWorkspaceCommand } from './startupWorkspaceCommand.js';
import { resolveTiinexAppStartupGithubInput } from './tiinexAppStartupSource.js';
import { applyMaterializedStartupWorkspaceConfig } from './startupWorkspaceConfigApplication.js';

export async function runInitialWorkspaceBootstrapOperation({
  runtimeApi = {},
  state = {},
  workspaceConfig = {},
  storage = null,
  locationLike = null,
  windowObj = null,
  fetchImpl = globalThis.fetch,
  commit = null,
  materializeSource = null,
  setDiagnostics = null,
  resolveStartupInput = resolveTiinexAppStartupGithubInput
} = {}) {
  if ((state.workspaces || []).length) return { ok: true, skipped: 'workspace-already-present', state };
  const resolved = await resolveStartup(locationLike?.href || '', {
    fetchImpl,
    parseWorkspaceConfig: runtimeApi.config?.parseWorkspaceConfig,
    locationLike,
    windowObj,
    hostWorkspace: windowObj?.TiinexWorkspace || windowObj?.tiinexWorkspace || windowObj?.TIINEX_WORKSPACE
  }, resolveStartupInput);
  const strongConfig = resolved?.ok && (resolved.startupClass === 'explicit-runtime-config' || resolved.startupClass === 'hosted-config');
  if (strongConfig) return applyResolved({ runtimeApi, state, storage, resolved, commit, materializeSource, setDiagnostics, locationLike, workspaceConfig });
  if (resolved?.ok && resolved.startupClass === 'packaged-fallback-config') {
    return applyResolved({ runtimeApi, state, storage, resolved, commit, materializeSource, setDiagnostics, locationLike, workspaceConfig });
  }
  if (resolved?.explicitQueryRequested) return explicitStartupFailure({ resolved, state, setDiagnostics, locationLike });
  return applyDefault({ runtimeApi, state, storage, workspaceConfig, commit, materializeSource, setDiagnostics });
}

async function resolveStartup(targetUrl, options, resolver = resolveTiinexAppStartupGithubInput) {
  try {
    return await resolver(targetUrl, options);
  } catch (error) {
    return { ok: false, message: error?.message || String(error || 'Startup config resolution failed.') };
  }
}

async function applyResolved({ runtimeApi, state, storage, resolved, commit, materializeSource, setDiagnostics, locationLike, workspaceConfig }) {
  const prepared = prepareResolvedStartupWorkspaceCommand({ lifecycle: runtimeApi.lifecycle, persistence: runtimeApi.persistence, state, resolved, storage });
  if (!prepared?.ok) {
    if (resolved?.explicitQueryRequested) return explicitStartupFailure({ resolved: Object.assign({}, resolved, { message: prepared?.message || resolved?.message || 'Explicit workspace startup failed.' }), state, setDiagnostics, locationLike });
    return applyDefault({ runtimeApi, state, storage, workspaceConfig, commit, materializeSource, setDiagnostics });
  }
  setDiagnostics?.({
    last: {
      targetUrl: resolved.targetUrl || locationLike?.href || '',
      ok: true,
      selectedConvention: resolved.diagnostics?.selectedConvention || '',
      selectedPlan: resolved.selectedPlan || '',
      startupClass: resolved.startupClass || '',
      input: resolved.input || null,
      inputs: resolved.inputs || (resolved.input ? [resolved.input] : []),
      diagnostics: resolved.diagnostics || null,
      message: resolved.message || ''
    }
  });
  const augmentedState = runtimeApi.persistence?.augmentStartupStateWithLocalRecovery?.(prepared.state, storage, { restoreFocus: !resolved?.explicitQueryRequested }) || prepared.state;
  const workspace = (augmentedState.workspaces || []).find((item) => item.id === prepared.workspace?.id) || prepared.workspace;
  let materialState = augmentedState;
  for (const sourceInput of prepared.sourceInputs || (prepared.sourceInput ? [prepared.sourceInput] : [])) {
    const loaded = await materializeSource?.(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || workspace?.id, bufferProductState: true });
    if (loaded?.state) materialState = loaded.state;
  }
  const appliedConfig = applyMaterializedStartupWorkspaceConfig({ runtimeApi, state: materialState, resolved, discoveryWorkspaceId: workspace?.id || prepared.workspace?.id || '' });
  if (!appliedConfig?.ok) return { ok: false, error: appliedConfig?.error || 'startup.workspace-config-application-failed', message: appliedConfig?.message || 'Could not apply startup workspace config.', state: materialState, resolved };
  if (appliedConfig.applied) {
    materialState = appliedConfig.state;
    for (const sourceInput of appliedConfig.sourceInputs || []) {
      const loaded = await materializeSource?.(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || appliedConfig.workspace?.id, bufferProductState: true });
      if (loaded?.state) materialState = loaded.state;
    }
    commit?.(materialState, 'replace');
    const appliedWorkspace = (materialState.workspaces || []).find((item) => item.id === appliedConfig.workspace?.id) || appliedConfig.workspace;
    return { ok: true, selected: `${resolved.startupClass || 'resolved-config'}-workspace-artifact-applied`, state: materialState, workspace: appliedWorkspace, workspaces: appliedConfig.workspaces || [appliedWorkspace].filter(Boolean), startupRecord: appliedConfig.startupRecord };
  }
  commit?.(materialState, 'replace');
  return { ok: true, selected: resolved.startupClass || 'resolved-config', state: materialState, workspace, workspaces: prepared.workspaces || [workspace].filter(Boolean) };
}

function explicitStartupFailure({ resolved = {}, state = {}, setDiagnostics = null, locationLike = null } = {}) {
  const message = resolved?.message || resolved?.error || 'Explicit workspace startup failed.';
  setDiagnostics?.({ last: { targetUrl: resolved.targetUrl || locationLike?.href || '', ok: false, startupClass: resolved.startupClass || 'explicit-workspace-failed', explicitQueryRequested: true, diagnostics: resolved.diagnostics || null, message } });
  return { ok: false, error: 'startup.explicit-workspace-unavailable', message, explicitQueryRequested: true, state };
}

async function applyDefault({ runtimeApi, state, storage, workspaceConfig, commit, materializeSource, setDiagnostics }) {
  const prepared = prepareDefaultWorkspaceStartCommand({ lifecycle: runtimeApi.lifecycle, persistence: runtimeApi.persistence, state, workspaceConfig, storage });
  if (!prepared?.ok) return { ok: false, error: prepared?.error || 'startup.default-unavailable', message: prepared?.message || 'Default workspace config is unavailable.', state };
  setDiagnostics?.({ last: prepared.diagnostics });
  const augmentedState = runtimeApi.persistence?.augmentStartupStateWithLocalRecovery?.(prepared.state, storage) || prepared.state;
  const workspace = (augmentedState.workspaces || []).find((item) => item.id === prepared.workspace?.id) || prepared.workspace;
  let materialState = augmentedState;
  for (const sourceInput of prepared.sourceInputs || (prepared.sourceInput ? [prepared.sourceInput] : [])) {
    const loaded = await materializeSource?.(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || workspace?.id, bufferProductState: true });
    if (loaded?.state) materialState = loaded.state;
  }
  commit?.(materialState, 'replace');
  return { ok: true, selected: 'embedded-default-workspace', state: materialState, workspace, workspaces: prepared.workspaces || [workspace].filter(Boolean) };
}
