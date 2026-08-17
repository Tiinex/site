import { summarizeGithubAdapterResult } from './githubMaterializationSummary.js';
import { mergeGithubSurfaceStates } from './githubSourceInput.js';
import { appendImportSummary } from '../workspaces/workspace.import.js';
import { materialLedgerSourceReceipt } from '../workspaces/workspace.materialLedger.js';
import { assertCanonicalWorkspaceRuntimeState } from '../workspaces/workspace.runtimeCanonical.js';

export function githubMaterializationDiscoveryState(out = {}) {
  const okCount = Number(out.okCount || 0);
  const failCount = Number(out.failCount || 0);
  const errors = Array.isArray(out.errors) ? out.errors : [];
  if (okCount > 0) return failCount > 0 ? 'partial' : 'loaded';
  return failCount > 0 || errors.length ? 'failed' : 'unavailable';
}

export function applyGithubSourceMaterializationCommand(input = {}) {
  const lifecycle = input.lifecycle;
  if (!lifecycle) return { ok: false, error: 'lifecycle.missing', state: input.state };
  const source = input.source || {};
  const sourceId = String(input.sourceId || source.id || '').trim();
  const workspaceId = String(input.workspaceId || '').trim();
  if (!sourceId) return { ok: false, error: 'source.id.required', state: input.state };
  let nextState = input.state;
  const out = input.adapterResult || {};
  const records = Array.isArray(out.records) ? out.records : [];
  let insertResult = null;
  if (Number(out.okCount || 0) > 0 || records.length) {
    insertResult = lifecycle.addWorkspaceSourceRecords?.(nextState, workspaceId, sourceId, records, { preserveView: Boolean(input.preserveView) });
    if (insertResult?.ok) nextState = insertResult.state;
  }

  const sourceWorkspace = workspaceFor(nextState, workspaceId, lifecycle);
  const sourceRecordCount = countSourceRecords(sourceWorkspace, sourceId);
  const discoveryState = githubMaterializationDiscoveryState(out);
  const diagnostics = out.diagnostics || {};
  const resolvedRef = String(diagnostics.resolvedRef || '').trim();
  const updated = lifecycle.addWorkspaceSource?.(nextState, workspaceId, Object.assign({}, source, {
    id: sourceId,
    label: input.sourceLabel || source.label || source.repo || source.repository || 'Source',
    repository: input.repository || source.repo || source.repository || '',
    repo: input.repository || source.repo || source.repository || '',
    ref: input.ref || resolvedRef || source.ref || '',
    requestedRef: Object.prototype.hasOwnProperty.call(input, 'requestedRef') ? String(input.requestedRef || '').trim() : String(source.requestedRef ?? source.ref ?? '').trim(),
    materializedCommit: exactCommit(input.materializedCommit || diagnostics.materializedCommit || source.materializedCommit),
    rootPath: input.rootPath || source.rootPath || '.topics',
    count: Number(sourceRecordCount || out.okCount || records.length || 0),
    discoveryState,
    repoDiscovery: Boolean(input.repoDiscovery ?? source.repoDiscovery),
    issueDiscovery: Boolean(input.issueDiscovery ?? source.issueDiscovery),
    issueUrls: input.issueUrls || source.issueUrls || source.config?.issueUrls || '',
    explicitFileRefs: input.explicitFileRefs ?? source.explicitFileRefs ?? source.config?.explicitFileRefs ?? [],
    workspaceMatch: input.workspaceMatch || source.workspaceMatch || '',
    appConfigPlan: input.appConfigPlan || source.appConfigPlan || '',
    openBehavior: input.openBehavior || source.openBehavior || '',
    preferredDisplay: input.preferredDisplay || source.preferredDisplay || '',
    requestedSurfaces: input.requestedSurfaces || source.requestedSurfaces || {},
    surfaces: mergeGithubSurfaceStates(input.existingSource?.surfaces || source.surfaces || {}, diagnostics.surfaces || {}, input.selectedTransportSurfaces || []),
    sourcePlan: diagnostics.sourcePlan || {},
    recordAttribution: diagnostics.recordAttribution || [],
    transportTiers: diagnostics.transportTiers || {},
    transportOutcome: diagnostics.transportOutcome || {},
    transportPlan: diagnostics.transportPlan || {},
    governanceBoundary: diagnostics.governanceBoundary || source.governanceBoundary || {},
    transportLabel: diagnostics.transportPlan?.label || input.transportLabel || source.transportLabel || '',
    transportRefreshTier: input.transportRefreshTier || source.transportRefreshTier || ''
  }), { sourceIdentityPolicy: 'refine-existing' });
  if (updated?.ok) nextState = updated.state;

  const finalWorkspace = workspaceFor(nextState, workspaceId, lifecycle);
  const materialLedgerReceipt = finalWorkspace ? materialLedgerSourceReceipt(finalWorkspace, sourceId, { rawAdapterRecords: Number(out.okCount || records.length || 0) }, { displayOptions: finalWorkspace.displayOptions || {} }) : null;
  const summary = summarizeGithubAdapterResult(out, { materialLedgerReceipt });
  nextState = appendImportSummary(lifecycle, nextState, summary, {});
  const canonicality = assertCanonicalWorkspaceRuntimeState(nextState, 'github-source-materialization');
  if (!canonicality.ok) return { ok: false, error: 'workspace.runtime-candidate-model-leak', state: input.state, sourceId, source: updated?.source || source, canonicality };
  return {
    ok: true,
    state: nextState,
    sourceId,
    source: updated?.source || source,
    sourceRecordCount: countSourceRecords(workspaceFor(nextState, workspaceId, lifecycle), sourceId),
    discoveryState,
    insertResult,
    materialLedgerReceipt,
    summary
  };
}

function exactCommit(value = '') { const commit = String(value || '').trim(); return /^[0-9a-f]{40}$/i.test(commit) ? commit : ''; }

function workspaceFor(state = {}, workspaceId = '', lifecycle = {}) {
  const targetId = String(workspaceId || state?.activeWorkspaceId || '').trim();
  return (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => workspace.id === targetId) || lifecycle.activeWorkspace?.(state) || null;
}

function countSourceRecords(workspace = {}, sourceId = '') {
  const id = String(sourceId || '').trim();
  return Array.isArray(workspace?.records) ? workspace.records.filter((record) => String(record?.source?.id || '') === id).length : 0;
}
