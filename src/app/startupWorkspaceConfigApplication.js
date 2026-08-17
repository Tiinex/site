import { isWorkspaceEntrypointArtifact } from '../workspaces/workspace.entrypointCapability.js';
import { openWorkspaceRecordAction } from './workspaceRecordActions.js';

export function applyMaterializedStartupWorkspaceConfig({ runtimeApi = {}, state = {}, resolved = {}, discoveryWorkspaceId = '' } = {}) {
  if (resolved?.selectedPlan !== 'workspace-discovery') return { ok: true, applied: false, state };
  const workspace = workspaceById(state, discoveryWorkspaceId || state.activeWorkspaceId);
  if (!workspace) return { ok: false, error: 'startup.discovery-workspace-missing', message: 'Startup workspace discovery materialized without a workspace owner.', state };
  const candidates = (Array.isArray(workspace.records) ? workspace.records : []).filter((record) => isWorkspaceEntrypointArtifact(record) && String(record.markdown || '').trim());
  const selected = selectStartupWorkspaceArtifact(candidates, resolved?.input?.workspaceMatch || '');
  if (!selected.ok) return Object.assign({}, selected, { state, workspace });
  const opened = openWorkspaceRecordAction({ lifecycle: runtimeApi.lifecycle, parseWorkspaceConfig: runtimeApi.config?.parseWorkspaceConfig, state, record: selected.record });
  if (!opened?.ok) return { ok: false, error: opened?.error || 'startup.workspace-artifact-open-failed', message: opened?.message || 'Could not apply the discovered startup workspace artifact.', state, workspace, record: selected.record };
  return Object.assign({}, opened, { applied: true, startupRecord: selected.record, discoveryWorkspaceId: workspace.id });
}

export function selectStartupWorkspaceArtifact(records = [], workspaceMatch = '') {
  const list = Array.isArray(records) ? records : [];
  if (!list.length) return { ok: false, error: 'startup.workspace-artifact-missing', message: 'Startup discovery did not materialize an openable workspace artifact.' };
  const pattern = String(workspaceMatch || '').trim();
  if (pattern) {
    const matched = list.filter((record) => workspaceArtifactMatches(record, pattern));
    if (matched.length === 1) return { ok: true, record: matched[0] };
    if (matched.length > 1) return { ok: false, error: 'startup.workspace-artifact-ambiguous', message: 'Startup workspace match resolved to more than one workspace artifact.' };
    return { ok: false, error: 'startup.workspace-artifact-match-missing', message: 'Startup workspace match did not resolve to a materialized workspace artifact.' };
  }
  if (list.length === 1) return { ok: true, record: list[0] };
  return { ok: false, error: 'startup.workspace-artifact-ambiguous', message: 'Startup discovery materialized multiple workspace artifacts without a unique match.' };
}

function workspaceArtifactMatches(record = {}, pattern = '') {
  const values = [record.path, record.sourceTarget?.sourceArtifactPath, record.title, record.name].map((value) => String(value || '').trim()).filter(Boolean);
  const cleanPattern = String(pattern || '').trim().replace(/\\/g, '/');
  const regex = wildcardRegex(cleanPattern);
  return values.some((value) => {
    const cleanValue = String(value || '').replace(/\\/g, '/');
    if (regex.test(cleanValue)) return true;
    if (!cleanPattern.includes('/')) return regex.test(cleanValue.split('/').filter(Boolean).pop() || '');
    return false;
  });
}

function wildcardRegex(pattern = '') {
  const escaped = String(pattern || '').replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

function workspaceById(state = {}, workspaceId = '') {
  return (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => String(workspace?.id || '') === String(workspaceId || '')) || null;
}
