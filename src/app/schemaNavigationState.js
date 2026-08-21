import { stateWithActiveWorkspace, stateWithWorkspaceViewPatch } from './workspaceMulticolumn.js';
import { qualifySchemaRecordRecoveryRepresentation } from './schemaSourceRecovery.js';

export function stateWithWorkspaceStructuralCopy(state = {}, workspaceId = '') {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const index = workspaces.findIndex((workspace) => String(workspace?.id || '') === String(workspaceId || ''));
  if (index < 0) return { state, workspace: null };
  const current = workspaces[index];
  const workspace = Object.assign({}, current, {
    records: Array.isArray(current.records) ? current.records.slice() : [],
    sources: Array.isArray(current.sources) ? current.sources.slice() : [],
    sourceOrder: Array.isArray(current.sourceOrder) ? current.sourceOrder.slice() : []
  });
  const nextWorkspaces = workspaces.slice();
  nextWorkspaces[index] = workspace;
  return { state: Object.assign({}, state, { workspaces: nextWorkspaces }), workspace };
}

export function stateWithReplacedWorkspaceRecord(state = {}, workspaceId = '', existing = null, replacement = null) {
  const copied = stateWithWorkspaceStructuralCopy(state, workspaceId);
  if (!copied.workspace || !replacement) return state;
  const records = copied.workspace.records;
  const index = records.findIndex((record) => record === existing || (existing?.id && String(record?.id || '') === String(existing.id)));
  if (index < 0) return state;
  records[index] = replacement;
  return copied.state;
}

export function recordWithTruthfulRepresentationMetadata(record = {}) {
  const navigation = record?.schemaNavigation;
  if (!navigation || typeof navigation !== 'object') return record;
  const representation = qualifySchemaRecordRecoveryRepresentation(record);
  const truthfulIdentity = representation.state === 'qualified' ? representation.identity : '';
  if (String(navigation.representationIdentity || '') === truthfulIdentity) return record;
  return Object.assign({}, record, {
    schemaNavigation: Object.assign({}, navigation, {
      representationIdentity: truthfulIdentity,
      representationQualification: Object.freeze({ state: representation.state, reason: representation.reason || '' })
    })
  });
}


export function focusSchemaRecordState({ state, workspaceId, record, schemaId, notice, existing = false, loaded = false }) {
  const id = String(workspaceId || state?.activeWorkspaceId || '').trim();
  const truthfulRecord = recordWithTruthfulRepresentationMetadata(record);
  let next = truthfulRecord === record ? state : stateWithReplacedWorkspaceRecord(state, id, record, truthfulRecord);
  next = stateWithActiveWorkspace(next, id);
  const currentView = next.workspaceViews?.[id] || next.view || {};
  next = stateWithWorkspaceViewPatch(next, id, {
    workspaceVerse: 'lineage',
    selectedRecordId: truthfulRecord.id,
    lineageQuery: '',
    lineageAuditReport: null,
    lineageLoadReport: null,
    expandedLineageRecordIds: unique([truthfulRecord.id].concat(currentView.expandedLineageRecordIds || []))
  });
  return { ok: true, state: next, workspace: workspaceById(next, id), record: truthfulRecord, schemaId, existing, loaded, commitMode: 'push', notice };
}

function workspaceById(state = {}, workspaceId = '') {
  return (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => String(workspace?.id || '') === String(workspaceId || '')) || null;
}
function unique(values = []) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}
