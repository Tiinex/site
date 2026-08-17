import { addConfiguredSourceToWorkspace, findConfiguredSource, findWorkspaceForIncomingSource, sourceMaterializationCompleteEnough, sourceSignature } from './workspace.entrypoints.js';
import { replaceNonDraftWorkspaceSet } from './workspace.openSemantics.js';

export function openWorkspaceEntrypointSet({
  lifecycle,
  state = {},
  sourceInputs = [],
  entry = null,
  workspaceInput = defaultWorkspaceInput,
  afterCreate = null,
  annotateWorkspace = null,
  registerSources = true
} = {}) {
  const inputs = normalizeSourceInputs(sourceInputs);
  if (!inputs.length) return { ok: false, error: 'workspace.entrypoint-set.empty', message: 'Workspace entrypoint has no openable workspace set.', state, entry, sourceInputs: [] };
  if (!lifecycle?.createWorkspace || (registerSources && !lifecycle?.addWorkspaceSource)) return { ok: false, error: 'workspace.lifecycle.incomplete', message: 'Workspace lifecycle cannot apply workspace entrypoints.', state, entry, sourceInputs: [] };

  let next = cloneLifecycleState(lifecycle, state);
  const preparedInputs = [];
  const openedWorkspaceIds = [];
  for (let index = 0; index < inputs.length; index += 1) {
    const sourceInput = inputs[index];
    const createInput = workspaceInput(sourceInput, index, inputs) || defaultWorkspaceInput(sourceInput, index);
    const created = lifecycle.createWorkspace(next, createInput, {});
    if (!created?.ok) continue;
    next = created.state;
    if (typeof afterCreate === 'function') {
      const adjusted = afterCreate({ state: next, workspace: created.workspace, sourceInput, index, inputs, entry });
      if (adjusted) next = adjusted;
    }
    if (typeof annotateWorkspace === 'function') annotateWorkspace({ state: next, workspaceId: created.workspace.id, workspace: created.workspace, sourceInput, index, inputs, entry, mode: 'open' });
    if (registerSources) {
      const added = addConfiguredSourceToWorkspace(lifecycle, next, created.workspace.id, sourceInput, { discoveryState: 'deferred' });
      if (added?.ok) {
        next = added.state;
        preparedInputs.push(Object.assign({}, sourceInput, { workspaceId: created.workspace.id, sourceId: added.source?.id || sourceInput.sourceId || '' }));
      }
    } else {
      preparedInputs.push(Object.assign({}, sourceInput, { workspaceId: created.workspace.id, sourceId: sourceInput.sourceId || '' }));
    }
    openedWorkspaceIds.push(created.workspace.id);
  }
  if (!openedWorkspaceIds.length) return { ok: false, error: 'workspace.open.no-entrypoints', message: 'Workspace entrypoint has no usable workspace set.', state, entry, sourceInputs: [] };
  const replaced = replaceNonDraftWorkspaceSet(next, openedWorkspaceIds);
  next = replaced.state;
  const preferredWorkspaceId = openedWorkspaceIds[0] || '';
  if (preferredWorkspaceId && (next.workspaces || []).some((workspace) => workspace.id === preferredWorkspaceId)) next.activeWorkspaceId = preferredWorkspaceId;
  const workspace = (next.workspaces || []).find((item) => item.id === preferredWorkspaceId)
    || (next.workspaces || []).find((item) => openedWorkspaceIds.includes(item.id))
    || null;
  return { ok: true, state: next, workspace, workspaces: openedWorkspaceIds.map((id) => (next.workspaces || []).find((item) => item.id === id)).filter(Boolean), entry, sourceInputs: preparedInputs, openedWorkspaceIds, openBoundary: replaced.report };
}

export function mergeWorkspaceEntrypointSet({
  lifecycle,
  state = {},
  sourceInputs = [],
  entry = null,
  annotateWorkspace = null
} = {}) {
  const inputs = normalizeSourceInputs(sourceInputs);
  if (!inputs.length) return { ok: false, error: 'workspace.entrypoint-set.empty', message: 'Workspace entrypoint has no mergeable workspace set.', state, entry, sourceInputs: [] };
  if (!lifecycle?.createWorkspace || !lifecycle?.addWorkspaceSource) return { ok: false, error: 'workspace.lifecycle.incomplete', message: 'Workspace lifecycle cannot merge workspace entrypoints.', state, entry, sourceInputs: [] };

  let next = cloneLifecycleState(lifecycle, state);
  const originalActiveWorkspaceId = next.activeWorkspaceId || '';
  const preparedInputs = [];
  const touchedWorkspaceIds = [];
  let createdCount = 0;
  for (const sourceInput of inputs) {
    let workspace = findWorkspaceForIncomingSource(next, sourceInput);
    const existingSource = workspace ? findConfiguredSource(workspace, sourceInput) : null;
    const alreadyLoaded = Boolean(existingSource && sourceMaterializationCompleteEnough(existingSource, sourceInput));
    if (!workspace) {
      const created = lifecycle.createWorkspace(next, defaultWorkspaceInput(sourceInput), {});
      if (!created?.ok) continue;
      next = created.state;
      workspace = created.workspace;
      createdCount += 1;
    }
    if (typeof annotateWorkspace === 'function') annotateWorkspace({ state: next, workspaceId: workspace.id, workspace, sourceInput, entry, mode: alreadyLoaded ? 'merge-existing-noop' : (createdCount && touchedWorkspaceIds.length === 0 ? 'merge-created' : 'merge-refresh') });
    if (alreadyLoaded) {
      touchedWorkspaceIds.push(workspace.id);
      continue;
    }
    const added = addConfiguredSourceToWorkspace(lifecycle, next, workspace.id, sourceInput, { discoveryState: 'deferred' });
    if (added?.ok) {
      next = added.state;
      touchedWorkspaceIds.push(workspace.id);
      preparedInputs.push(Object.assign({}, sourceInput, { workspaceId: workspace.id, sourceId: added.source?.id || sourceInput.sourceId || '' }));
    }
  }
  if (!touchedWorkspaceIds.length) return { ok: false, error: 'workspace.merge.no-entrypoints', message: 'Workspace entrypoint has no usable workspace set.', state, entry, sourceInputs: [] };
  if (originalActiveWorkspaceId && (next.workspaces || []).some((workspace) => workspace.id === originalActiveWorkspaceId)) next.activeWorkspaceId = originalActiveWorkspaceId;
  else next.activeWorkspaceId = touchedWorkspaceIds[0] || next.activeWorkspaceId || '';
  const workspace = (next.workspaces || []).find((item) => item.id === touchedWorkspaceIds[0]) || null;
  return { ok: true, state: next, workspace, entry, sourceInputs: preparedInputs, merge: { touchedWorkspaceIds, createdCount, skippedLoads: inputs.length - preparedInputs.length } };
}

export function normalizeWorkspaceEntrypointSet(sourceInputs = []) {
  return normalizeSourceInputs(sourceInputs);
}

function normalizeSourceInputs(sourceInputs = []) {
  const seen = new Set();
  const output = [];
  for (const input of Array.isArray(sourceInputs) ? sourceInputs : []) {
    if (!input || !String(input.repository || input.repo || '').trim()) continue;
    const label = String(input.label || '').trim().toLowerCase();
    const plan = sourceSignature(input);
    const key = `${label}|${plan}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(Object.assign({}, input));
  }
  return output;
}

function cloneLifecycleState(lifecycle, state) {
  if (typeof lifecycle?.cloneState === 'function') return lifecycle.cloneState(state);
  return JSON.parse(JSON.stringify(state && typeof state === 'object' ? state : { workspaces: [], activeWorkspaceId: '' }));
}

function defaultWorkspaceInput(sourceInput = {}) {
  return {
    name: sourceInput.label || sourceInput.workspaceLabel || sourceInput.repository || sourceInput.repo || 'Workspace',
    boundary: 'workspace entrypoint set; source materialization is explicit'
  };
}
