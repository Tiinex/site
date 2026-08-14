import { tiinexAppConfigSourceToStartupPlan } from './tiinexAppConfigSource.js';

export const DEFAULT_WORKSPACE_START_CONFIG_URL = 'embedded-default-workspace';
export const DEFAULT_WORKSPACE_START_ID = 'workspace:embedded-default:tiinex-docs';

export function defaultWorkspaceStartPlan(workspaceConfig = {}) {
  const mapped = tiinexAppConfigSourceToStartupPlan({
    config: workspaceConfig,
    configUrl: DEFAULT_WORKSPACE_START_CONFIG_URL,
    diagnostics: { selectedConvention: 'embedded-default-workspace' }
  });
  if (!mapped?.ok) {
    return {
      ok: false,
      message: mapped?.message || 'Default Tiinex workspace config has no explicit source or discovery path.'
    };
  }
  const inputs = (mapped.inputs || [mapped.input]).filter(Boolean).map((item) => Object.assign({}, item, {
    appConfigSourceUrl: item.appConfigSourceUrl || DEFAULT_WORKSPACE_START_CONFIG_URL,
    bootstrapStartState: 'default-workspace-config',
    bootstrapBoundary: 'explicit-default-config-path'
  }));
  const input = inputs[0];
  const identity = workspaceConfig?.viewerIdentity || {};
  const workspaceName = input?.label || identity.browserTitle || 'Tiinex docs';
  return {
    ok: true,
    workspaceName,
    selectedPlan: mapped.selectedPlan || 'workspace-entrypoints',
    input,
    inputs,
    message: inputs.length > 1 ? `Opening ${inputs.length} configured workspaces.` : `Opening ${workspaceName} workspace.`
  };
}


export function stateWithDefaultWorkspaceStartProgress(state = {}, workspaceId = '', plan = {}) {
  const targetId = String(workspaceId || '').trim();
  if (!targetId) return state;
  const next = structuredClone(state || {});
  const workspace = (Array.isArray(next.workspaces) ? next.workspaces : []).find((item) => item.id === targetId);
  if (!workspace) return state;
  const input = plan?.input || plan || {};
  const label = String(input.label || input.repository || 'Tiinex docs').trim() || 'Tiinex docs';
  workspace.discoveryProgress = {
    sourceId: String(input.sourceId || input.id || '').trim(),
    phase: 'default-workspace-bootstrap',
    label: `Opening ${label} workspace`,
    percent: null,
    quantified: false,
    active: true
  };
  workspace.workspaceBootstrap = Object.assign({}, workspace.workspaceBootstrap || {}, {
    schema: 'tiinex.workspace.bootstrap.v1',
    startState: input.bootstrapStartState || 'default-workspace-config',
    boundary: input.bootstrapBoundary || 'explicit-default-config-path',
    repository: input.repository || input.repo || '',
    rootPath: input.rootPath || '',
    workspaceMatch: input.workspaceMatch || '',
    usefulStartPath: 'explicit-source-materialization-queued',
    userFacingMessage: 'Opening Tiinex docs workspace.'
  });
  next.activeWorkspaceId = workspace.id;
  return next;
}
