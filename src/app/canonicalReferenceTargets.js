import { buildLoadedArtifactParticipantIndex, participantMatchesSchema, resolveCurrentArtifactParticipant } from '../artifacts/artifact.participantIndex.js';
import { referenceTargetOption } from '../transitions/transition.referenceTarget.js';

export const CANONICAL_REFERENCE_TARGET_OPTIONS_SCHEMA_ID = 'tiinex.site.canonical-reference-target-options.v1';

export function canonicalReferenceTargetOptions(input = {}) {
  const state = input.state || {};
  const subjectWorkspaceId = token(input.subjectWorkspaceId);
  const subjectRecord = input.subjectRecord || null;
  const targetSchemaId = token(input.targetSchemaId);
  const loaded = annotatedLoadedRecords(state);
  const participantIndex = buildLoadedArtifactParticipantIndex({ records: loaded.map((item) => item.record) });
  const subjectAnnotated = loaded.find((item) => item.workspaceId === subjectWorkspaceId && String(item.record?.id || '') === String(subjectRecord?.id || ''))?.record || subjectRecord;
  const subjectParticipant = resolveCurrentArtifactParticipant(subjectAnnotated, participantIndex);
  if (!subjectParticipant?.cleanCandidate || !targetSchemaId) return result([], participantIndex, subjectParticipant, 'subject-or-target-schema-unqualified');

  const byParticipant = new Map();
  for (const item of loaded) {
    const participant = resolveCurrentArtifactParticipant(item.record, participantIndex);
    if (!participantMatchesSchema(participant, targetSchemaId)) continue;
    if (participant.identity?.id === subjectParticipant.identity?.id) continue;
    const option = referenceTargetOption(item.original, participant, {
      subjectWorkspaceId,
      participantWorkspaceId: item.workspaceId,
      workspaceRecords: item.workspaceRecords
    });
    const key = token(participant.identity?.id);
    if (!key) continue;
    const previous = byParticipant.get(key);
    if (!previous || preferOption(option, previous, subjectWorkspaceId)) byParticipant.set(key, Object.freeze({ ...option, participantId: key }));
  }
  const options = [...byParticipant.values()].sort(compareOptions);
  return result(options, participantIndex, subjectParticipant, 'qualified');
}

export function annotatedLoadedRecords(state = {}) {
  const out = [];
  for (const workspace of Array.isArray(state.workspaces) ? state.workspaces : []) {
    const workspaceId = token(workspace?.id);
    const records = Array.isArray(workspace?.records) ? workspace.records : [];
    for (const original of records) {
      const workspaceIds = [...new Set([...(Array.isArray(original?.workspaceIds) ? original.workspaceIds : []), workspaceId].map(token).filter(Boolean))].sort();
      out.push(Object.freeze({ workspaceId, workspaceRecords: records, original, record: Object.freeze({ ...original, workspaceIds }) }));
    }
  }
  return Object.freeze(out);
}

function result(options, participantIndex, subjectParticipant, state) {
  return Object.freeze({
    schema: CANONICAL_REFERENCE_TARGET_OPTIONS_SCHEMA_ID,
    state,
    options: Object.freeze(options),
    qualifiedOptions: Object.freeze(options.filter((item) => item.enabled)),
    unavailableOptions: Object.freeze(options.filter((item) => !item.enabled)),
    participantIndex,
    subjectParticipant: subjectParticipant || null,
    readOnly: true,
    mutation: false,
    networkFetch: false
  });
}
function preferOption(next, previous, subjectWorkspaceId) {
  if (next.enabled !== previous.enabled) return next.enabled;
  const nextSame = next.workspaceId === subjectWorkspaceId, previousSame = previous.workspaceId === subjectWorkspaceId;
  if (nextSame !== previousSame) return nextSame;
  return `${next.workspaceId}\0${next.id}`.localeCompare(`${previous.workspaceId}\0${previous.id}`) < 0;
}
function compareOptions(a, b) {
  if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
  return String(a.title || '').localeCompare(String(b.title || '')) || String(a.workspaceId || '').localeCompare(String(b.workspaceId || '')) || String(a.id || '').localeCompare(String(b.id || ''));
}
function token(value = '') { return String(value || '').trim(); }
