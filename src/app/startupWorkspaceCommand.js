import { stateWithDefaultWorkspaceStartProgress } from './defaultWorkspaceStart.js';
import { openWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';

export function prepareResolvedStartupWorkspaceCommand({ lifecycle, persistence, state = {}, resolved = {}, storage = null } = {}) {
  const resolvedInputs = (Array.isArray(resolved?.inputs) ? resolved.inputs : [resolved?.input]).filter(Boolean);
  if (!resolved?.ok || !resolvedInputs.length) return { ok: false, error: 'startup.config-unavailable', message: resolved?.message || 'Startup workspace config is unavailable.', state, resolved };
  if (!lifecycle?.createWorkspace) return { ok: false, error: 'workspace.lifecycle-unavailable', message: 'Workspace lifecycle is unavailable.', state, resolved };
  const inputs = resolvedInputs.map((sourceInput) => Object.assign({}, sourceInput, {
    bootstrapStartState: resolved.startupClass || 'configured-workspace',
    bootstrapBoundary: 'resolved-startup-config'
  }));
  const opened = openWorkspaceEntrypointSet({
    lifecycle,
    state,
    sourceInputs: inputs,
    entry: { title: resolved.config?.viewerIdentity?.browserTitle || 'Tiinex workspace set', markdown: resolved.markdown || '', path: resolved.configUrl || resolved.targetUrl || '' },
    workspaceInput(sourceInput, index) {
      const name = sourceInput.label || resolved.config?.viewerIdentity?.browserTitle || sourceInput.repository || `Tiinex workspace ${index + 1}`;
      const id = inputs.length === 1
        ? stableStartupWorkspaceId(resolved.configUrl || resolved.targetUrl || name)
        : stableStartupWorkspaceId(`${resolved.configUrl || resolved.targetUrl || 'tiinex-startup'}#${index}:${name}:${sourceInput.repository || ''}`);
      return { id, name, boundary: 'resolved Tiinex startup config; source materialization is explicit' };
    },
    afterCreate({ state: createdState, workspace, sourceInput }) {
      let nextState = persistence?.hydrateWorkspaceWithLocalDeltas?.(createdState, workspace?.id, storage) || createdState;
      let target = (nextState.workspaces || []).find((item) => item.id === workspace?.id) || workspace;
      if (target && resolved.markdown) target.workspaceMarkdown = resolved.markdown;
      nextState = stateWithDefaultWorkspaceStartProgress(nextState, workspace?.id, { input: sourceInput });
      return nextState;
    },
    registerSources: false,
    annotateWorkspace({ state: nextState, workspaceId, index }) {
      const workspace = (nextState.workspaces || []).find((item) => item.id === workspaceId);
      if (!workspace) return;
      workspace.workspaceConfig = resolved.config && typeof resolved.config === 'object' ? JSON.parse(JSON.stringify(resolved.config)) : null;
      workspace.workspaceBootstrap = Object.assign({}, workspace.workspaceBootstrap || {}, {
        schema: 'tiinex.workspace.bootstrap.v1',
        startState: resolved.startupClass || 'configured-workspace',
        boundary: 'resolved-startup-config',
        configUrl: resolved.configUrl || resolved.targetUrl || '',
        selectedConvention: resolved.diagnostics?.selectedConvention || '',
        usefulStartPath: 'resolved-config-workspace-set-materialization-queued',
        workspaceSetSize: inputs.length,
        workspaceSetIndex: index
      });
    }
  });
  if (!opened?.ok) return { ok: false, error: opened?.error || 'startup.workspace-create-failed', message: opened?.message || 'Could not create startup workspace set.', state, resolved };
  return Object.assign({}, opened, {
    resolved,
    sourceInput: opened.sourceInputs?.[0] || null,
    notice: inputs.length > 1 ? `Opening ${inputs.length} configured workspaces.` : `Opening ${opened.workspace?.title || opened.workspace?.name || 'workspace'}.`
  });
}


export function stableStartupWorkspaceId(value = '') {
  const text = String(value || 'tiinex-startup');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return `workspace:startup:${(hash >>> 0).toString(36)}`;
}
