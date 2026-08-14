import { buildWorkspaceAuditView } from '../workspaces/workspace.auditView.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { recoverMissingLineageParentsFromSource } from './lineageSourceRecovery.js';

export function lineageLoadReportForSelectedView(view = {}) {
  const selectedRecordId = String(view.selectedRecordId || '').trim();
  const report = view.lineageLoadReport || null;
  return selectedRecordId && report && String(report.selectedRecordId || '') === selectedRecordId ? report : null;
}

export function lineageControlsReadyForTraversal(traversal = null) {
  if (!traversal) return false;
  const terminalState = String(traversal.terminalState || traversal.status?.terminalState || '').trim();
  if (['root-reached', 'root-reached-scope-transition', 'no-parent-declared', 'target-unavailable', 'ambiguous-parent', 'integrity-mismatch'].includes(terminalState)) return true;
  return traversal.complete === true;
}

export function shouldAutoLoadLineage({ workspace, selectedRecordId = '', existingLoadReport = null, loadedKeys = new Set() } = {}) {
  const cleanId = String(selectedRecordId || '').trim();
  if (!workspace || !cleanId || existingLoadReport) return { shouldLoad: false, key: '', lineage: null };
  const lineage = buildWorkspaceLineageView(workspace, { records: Array.isArray(workspace?.records) ? workspace.records : [], query: '', selectedRecordId: cleanId });
  const key = `${workspace.id || ''}:${cleanId}:${workspace.records?.length || 0}:${lineage.selectedTraversal?.missingEdges?.length || 0}`;
  return { shouldLoad: Boolean(lineage.selectedTraversal?.hasMissing && !loadedKeys.has(key)), key, lineage };
}

export async function loadFullLineageCommand({ lifecycle, state, workspace, selectedRecordId = '', fetchImpl, workspaceConfig, clock = () => new Date().toISOString() } = {}) {
  const cleanId = String(selectedRecordId || '').trim();
  if (!workspace) return { ok: false, error: 'workspace.missing', message: 'No active workspace is available.', state };
  if (!cleanId) return { ok: false, error: 'lineage.selection.required', message: 'Select an artifact lineage before loading lineage.', state };
  const recovered = await recoverMissingLineageParentsFromSource({ lifecycle, state, workspace, selectedRecordId: cleanId, fetchImpl, workspaceConfig });
  const sourceState = recovered.state || state;
  const activeWorkspace = workspaceById(sourceState, workspace.id) || recovered.workspace || workspace;
  const lineage = recovered.lineage || buildWorkspaceLineageView(activeWorkspace, { records: Array.isArray(activeWorkspace.records) ? activeWorkspace.records : [], query: '', selectedRecordId: cleanId });
  const recoveredParents = Number(recovered.recoveredParents || 0);
  const traversal = lineage.selectedTraversal || null;
  const nodes = Array.isArray(traversal?.nodes) ? traversal.nodes : [];
  const stateLabel = traversal?.complete ? 'complete' : 'partial';
  const terminalState = traversal?.terminalState || traversal?.status?.terminalState || (stateLabel === 'complete' ? 'complete' : 'partial');
  const scopeTransitions = Array.isArray(traversal?.scopeTransitions) ? traversal.scopeTransitions : [];
  const lineageLoadReport = {
    schema: 'tiinex.workspace.lineageLoadReport.v1',
    selectedRecordId: cleanId,
    mode: recoveredParents ? 'source-assisted-loaded-workspace' : 'loaded-workspace',
    state: stateLabel,
    terminalState,
    statusLabel: traversal?.status?.label || '',
    nodes: nodes.length,
    rootReached: Boolean(traversal?.rootReached),
    noParentDeclared: Boolean(traversal?.noParentDeclared),
    hasMissing: Boolean(traversal?.hasMissing),
    hasMismatch: Boolean(traversal?.hasMismatch),
    ambiguous: Boolean(traversal?.ambiguous),
    depthLimited: Boolean(traversal?.depthLimited),
    scopeTransitions: scopeTransitions.length,
    recoveredParents,
    generatedAt: clock()
  };
  const notice = recoveredParents
    ? `Loaded ${recoveredParents} declared parent artifact${recoveredParents === 1 ? '' : 's'} from the source boundary.`
    : stateLabel === 'complete' ? 'Full loaded-workspace lineage index ready.' : 'Loaded lineage index is partial; terminal root was not proven.';
  return { ok: true, state: sourceState, workspace: activeWorkspace, lineage, lineageLoadReport, recoveredParents, notice, commitMode: recoveredParents ? 'push' : 'replace' };
}

export function runLineageAuditCommand({ state, workspace, selectedRecordId = '', query = '', existingLoadReport = null, clock = () => new Date().toISOString() } = {}) {
  const cleanId = String(selectedRecordId || '').trim();
  const records = Array.isArray(workspace?.records) ? workspace.records : [];
  if (!workspace) return { ok: false, error: 'workspace.missing', message: 'No active workspace is available.', state };
  if (!cleanId) return { ok: false, error: 'lineage.selection.required', message: 'Select an artifact lineage before running Audit.', state };
  const lineage = buildWorkspaceLineageView(workspace, { records, query, selectedRecordId: cleanId });
  if (!existingLoadReport && !lineageControlsReadyForTraversal(lineage.selectedTraversal)) return { ok: false, error: 'lineage.load.required', message: 'Load full lineage before running Audit.', state, lineage };
  const audit = buildWorkspaceAuditView(workspace, { records, query: '' });
  const auditById = new Map((audit.items || []).map((item) => [item.id, item]));
  const traversalNodes = Array.isArray(lineage.selectedTraversal?.nodes) && lineage.selectedTraversal.nodes.length
    ? lineage.selectedTraversal.nodes
    : records.filter((record) => record.id === cleanId).map((record) => ({ id: record.id, record }));
  const counts = { ok: 0, mismatch: 0, open: 0, pending: 0 };
  for (const node of traversalNodes) {
    const id = String(node.id || node.record?.id || '');
    const item = auditById.get(id);
    const status = String(item?.status || '').toLowerCase();
    if (status === 'readable' && !item?.fallbackUsed) counts.ok += 1;
    else if (status === 'pending-unavailable') counts.pending += 1;
    else if (status === 'readable' || status === 'degraded' || item?.fallbackUsed || !status) counts.open += 1;
    else counts.mismatch += 1;
  }
  const loadReport = existingLoadReport || {
    selectedRecordId: cleanId,
    state: lineage.selectedTraversal?.complete ? 'complete' : 'partial',
    terminalState: lineage.selectedTraversal?.terminalState || lineage.selectedTraversal?.status?.terminalState || '',
    rootReached: Boolean(lineage.selectedTraversal?.rootReached),
    noParentDeclared: Boolean(lineage.selectedTraversal?.noParentDeclared),
    hasMissing: Boolean(lineage.selectedTraversal?.hasMissing),
    hasMismatch: Boolean(lineage.selectedTraversal?.hasMismatch),
    ambiguous: Boolean(lineage.selectedTraversal?.ambiguous),
    depthLimited: Boolean(lineage.selectedTraversal?.depthLimited),
    scopeTransitions: Array.isArray(lineage.selectedTraversal?.scopeTransitions) ? lineage.selectedTraversal.scopeTransitions.length : 0
  };
  const auditState = loadReport?.state === 'complete' && lineage.selectedTraversal?.complete ? 'complete' : 'partial';
  const lineageAuditReport = {
    schema: 'tiinex.workspace.lineageAuditInline.v1',
    selectedRecordId: cleanId,
    state: auditState,
    terminalState: lineage.selectedTraversal?.terminalState || loadReport?.terminalState || '',
    statusLabel: lineage.selectedTraversal?.status?.label || loadReport?.statusLabel || '',
    nodes: traversalNodes.length,
    rootReached: Boolean(lineage.selectedTraversal?.rootReached),
    noParentDeclared: Boolean(lineage.selectedTraversal?.noParentDeclared),
    hasMissing: Boolean(lineage.selectedTraversal?.hasMissing),
    scopeTransitions: Array.isArray(lineage.selectedTraversal?.scopeTransitions) ? lineage.selectedTraversal.scopeTransitions.length : Number(loadReport?.scopeTransitions || 0),
    counts,
    generatedAt: clock()
  };
  return { ok: true, state, workspace, lineage, lineageAuditReport };
}

function workspaceById(state = {}, workspaceId = '') {
  return (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => workspace.id === workspaceId) || null;
}
