import { recoverCanonicalParentReference } from './transition.parentReference.js';

const freeze = Object.freeze;

export function qualifyDurableReferenceParticipant(record = {}, participant = {}, context = {}) {
  const subjectWorkspaceId = token(context.subjectWorkspaceId);
  const participantWorkspaceId = token(context.participantWorkspaceId || subjectWorkspaceId);
  const sameWorkspace = Boolean(subjectWorkspaceId && participantWorkspaceId && subjectWorkspaceId === participantWorkspaceId);
  if (!record?.id || participant?.cleanCandidate !== true) return unavailable('participant-not-clean');

  const sourceReference = recoverCanonicalParentReference(record, participant);
  if (sourceReference.state === 'qualified' && sourceReference.representationKind !== 'local-path') {
    const durable = sourceBackedReference(sourceReference);
    if (!durable) return unavailable('source-backed-reference-unavailable');
    return freeze({ state: 'qualified', kind: sourceReference.representationKind, durableTarget: durable, global: true, sameWorkspace, schemaId: participant.candidateSchemaId, recordId: record.id, participantId: participant.identity?.id || '' });
  }

  if (!sameWorkspace) return unavailable('cross-workspace-local-identity-not-portable');
  const path = normalizePath(record.path || participant.artifact?.path || '');
  if (!path) return unavailable('local-path-unavailable');
  const records = Array.isArray(context.workspaceRecords) ? context.workspaceRecords : [];
  const collisions = records.filter((item) => normalizePath(item?.path || '') === path);
  if (collisions.length !== 1 || String(collisions[0]?.id || '') !== String(record.id || '')) return unavailable('local-path-identity-ambiguous');
  return freeze({ state: 'qualified', kind: 'local-path', durableTarget: path, global: false, sameWorkspace: true, schemaId: participant.candidateSchemaId, recordId: record.id, participantId: participant.identity?.id || '' });
}

export function referenceTargetOption(record = {}, participant = {}, context = {}) {
  const qualification = qualifyDurableReferenceParticipant(record, participant, context);
  return freeze({
    id: String(record.id || ''),
    workspaceId: token(context.participantWorkspaceId),
    title: String(record.title || record.name || participant.artifact?.title || record.path || 'Artifact'),
    schemaId: token(participant.candidateSchemaId),
    path: String(record.path || ''),
    qualification,
    enabled: qualification.state === 'qualified'
  });
}

function sourceBackedReference(reference = {}) {
  if (reference.representationKind === 'github-issue-embedded' || reference.representationKind === 'github-comment-embedded') {
    const trace = token(reference.traceTarget);
    const origin = token(reference.originTarget);
    return trace && origin ? `${trace} @ ${origin}` : origin || trace;
  }
  return token(reference.traceTarget || reference.permalink || reference.originTarget);
}
function unavailable(reason) { return freeze({ state: 'unavailable', reason, kind: '', durableTarget: '', global: false, sameWorkspace: false, schemaId: '', recordId: '', participantId: '' }); }
function normalizePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/{2,}/g, '/'); }
function token(value = '') { return String(value || '').trim(); }
