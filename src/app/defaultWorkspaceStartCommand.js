import { DEFAULT_WORKSPACE_START_ID, defaultWorkspaceStartPlan, stateWithDefaultWorkspaceStartProgress } from './defaultWorkspaceStart.js';
import { openWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';

export function prepareDefaultWorkspaceStartCommand({ lifecycle, persistence, state = {}, workspaceConfig = {}, storage = null } = {}) {
  const plan = defaultWorkspaceStartPlan(workspaceConfig);
  if (!plan.ok) return { ok: false, error: 'default-workspace.config-unavailable', message: plan.message || 'Default workspace config is unavailable.', state, plan };
  if (!lifecycle?.createWorkspace) return { ok: false, error: 'workspace.lifecycle-unavailable', message: 'Workspace lifecycle is unavailable.', state, plan };
  const inputs = (plan.inputs || [plan.input]).filter(Boolean);
  const opened = openWorkspaceEntrypointSet({
    lifecycle,
    state,
    sourceInputs: inputs,
    entry: { title: plan.workspaceName || 'Tiinex docs', markdown: workspaceConfig?.markdown || '', path: plan.input?.appConfigSourceUrl || 'embedded-default-workspace' },
    workspaceInput(input, index) {
      const id = index === 0 ? DEFAULT_WORKSPACE_START_ID : `${DEFAULT_WORKSPACE_START_ID}:${index + 1}:${workspaceIdSlug(input.label || input.repository || 'workspace')}`;
      return {
        id,
        name: input.label || input.repository || plan.workspaceName || 'Tiinex docs',
        boundary: 'embedded/default workspace config; startup owns source materialization'
      };
    },
    afterCreate({ state: createdState, workspace, sourceInput }) {
      let nextState = persistence?.hydrateWorkspaceWithLocalDeltas?.(createdState, workspace?.id, storage) || createdState;
      nextState = stateWithDefaultWorkspaceStartProgress(nextState, workspace?.id, { input: sourceInput });
      return nextState;
    },
    annotateWorkspace({ state: nextState, workspaceId, index }) {
      const workspace = (nextState.workspaces || []).find((item) => item.id === workspaceId);
      if (!workspace) return;
      workspace.workspaceConfig = workspaceConfig && typeof workspaceConfig === 'object' ? JSON.parse(JSON.stringify(workspaceConfig)) : null;
      workspace.workspaceBootstrap = Object.assign({}, workspace.workspaceBootstrap || {}, { workspaceSetSize: inputs.length, workspaceSetIndex: index });
    },
    registerSources: false
  });
  if (!opened?.ok) return { ok: false, error: opened?.error || 'default-workspace.create-failed', message: opened?.message || 'Could not create default workspace set.', state, plan };
  return Object.assign({}, opened, {
    plan,
    sourceInput: opened.sourceInputs?.[0] || null,
    notice: plan.message || 'Default workspace source registered.',
    diagnostics: {
      targetUrl: plan.input.appConfigSourceUrl || 'embedded-default-workspace',
      ok: true,
      selectedConvention: 'embedded-default-workspace',
      selectedPlan: plan.selectedPlan || '',
      input: plan.input,
      inputs: plan.inputs || [plan.input],
      diagnostics: { bootstrapStartState: plan.input.bootstrapStartState, boundary: plan.input.bootstrapBoundary },
      message: plan.message || ''
    }
  });
}

function workspaceIdSlug(value = '') {
  return String(value || 'workspace').toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 40) || 'workspace';
}
