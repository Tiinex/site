import { parseArtifactMarkdown } from './artifact.parse.js';
import {
  collectLoadedArtifactAggregates,
  readArtifactRepresentationQualification,
  readArtifactSchemaQualification,
  artifactSourceBoundaryIdentity,
  artifactRegistryIdentityForRecord
} from './artifact.identityAggregation.js';

export const ARTIFACT_PARTICIPANT_INDEX_SCHEMA_ID = 'tiinex.site.artifact-participant-index.v1';
export const ARTIFACT_PARTICIPANT_SCHEMA_ID = 'tiinex.site.artifact-participant.v1';
const PARTICIPANT_IDENTITY_PREFIX = 'tiinex.artifact.participant';

export function buildLoadedArtifactParticipantIndex(input = {}) {
  const aggregates = collectLoadedArtifactAggregates(
    input,
    declaredRecordSchemaId,
    metadataRecordSchemaId,
    '',
    PARTICIPANT_IDENTITY_PREFIX
  );
  const participants = aggregates
    .filter(hasAnyDeclaredArtifactSchema)
    .map(buildArtifactParticipantReadModel)
    .sort(compareParticipants);
  return Object.freeze({
    schema: ARTIFACT_PARTICIPANT_INDEX_SCHEMA_ID,
    count: participants.length,
    cleanCandidateCount: participants.filter((participant) => participant.cleanCandidate).length,
    participants: Object.freeze(participants),
    boundary: Object.freeze({
      readOnly: true,
      networkFetch: false,
      mutation: false,
      completenessRequired: false
    })
  });
}

export function buildArtifactParticipantReadModel(record = {}) {
  const representationQualification = readArtifactRepresentationQualification(record);
  const schemaQualification = readArtifactSchemaQualification(record);
  const declaredSchemaIds = [...schemaQualification.declaredSchemaIds];
  const aggregateIdentity = record.registryIdentity || {};
  const identity = participantIdentityProjection(aggregateIdentity);
  const cleanCandidate = Boolean(identity.id)
    && representationQualification.state === 'equivalent'
    && schemaQualification.state === 'equivalent'
    && declaredSchemaIds.length === 1;
  return Object.freeze({
    schema: ARTIFACT_PARTICIPANT_SCHEMA_ID,
    identity: Object.freeze({
      id: identity.id,
      key: identity.key,
      kind: identity.kind,
      global: identity.global
    }),
    artifact: Object.freeze({
      id: String(record.id || ''),
      loadedRecordIds: Object.freeze([...(record.loadedRecordIds || [record.id]).map(normalizeToken).filter(Boolean)].sort()),
      workspaceIds: Object.freeze([...(record.workspaceIds || []).map(normalizeToken).filter(Boolean)].sort()),
      path: String(record.path || ''),
      title: String(record.title || ''),
      declaredSchemaId: cleanCandidate ? declaredSchemaIds[0] : '',
      declaredSchemaIds: Object.freeze(declaredSchemaIds),
      metadataSchemaId: metadataRecordSchemaId(record),
      currentCreatedAt: String(record.currentCreatedAt || record.createdAt || '')
    }),
    source: sourceProjection(record),
    representationQualification,
    schemaQualification,
    indexedReadable: declaredSchemaIds.length > 0,
    cleanCandidate,
    candidateSchemaId: cleanCandidate ? declaredSchemaIds[0] : '',
    completeness: 'not-evaluated'
  });
}

export function participantMatchesSchema(participant = {}, schemaConstraint = '') {
  if (!participant?.cleanCandidate) return false;
  const constraint = normalizeSchemaConstraint(schemaConstraint);
  return !constraint || participant.candidateSchemaId === constraint;
}

export function resolveCurrentArtifactParticipant(currentArtifact, participantIndex = {}) {
  if (!currentArtifact) return null;
  if (currentArtifact.schema === ARTIFACT_PARTICIPANT_SCHEMA_ID) return currentArtifact;
  const participants = Array.isArray(participantIndex.participants) ? participantIndex.participants : [];

  const suppliedIdentityKey = normalizeToken(currentArtifact.identity?.key || currentArtifact.participantIdentity?.key || currentArtifact.registryIdentity?.key);
  if (suppliedIdentityKey) {
    const matches = participants.filter((participant) => participant.identity.key === suppliedIdentityKey);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return null;
  }

  const suppliedIdentityId = normalizeToken(currentArtifact.identity?.id || currentArtifact.participantIdentity?.id);
  if (suppliedIdentityId) {
    const matches = participants.filter((participant) => participant.identity.id === suppliedIdentityId);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return null;
  }

  const aggregateIdentity = artifactRegistryIdentityForRecord(
    currentArtifact,
    currentArtifactWorkspaceIds(currentArtifact),
    declaredRecordSchemaId,
    metadataRecordSchemaId,
    PARTICIPANT_IDENTITY_PREFIX
  );
  if (aggregateIdentity?.key) {
    const matches = participants.filter((participant) => participant.identity.key === aggregateIdentity.key);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return null;
  }

  const recordId = normalizeToken(currentArtifact.id);
  if (!recordId) return null;
  const recordIdMatches = participants.filter((participant) => participant.artifact.loadedRecordIds.includes(recordId));
  return recordIdMatches.length === 1 ? recordIdMatches[0] : null;
}


function participantIdentityProjection(identity = {}) {
  const key = normalizeToken(identity.key);
  const kind = normalizeToken(identity.kind);
  const global = identity.global === true;
  const id = global
    ? normalizeToken(identity.id) || participantIdentityId(kind || 'global', key)
    : participantIdentityId(kind || 'workspace-record', key);
  return Object.freeze({ id, key, kind, global });
}

function participantIdentityId(kind = '', key = '') {
  return `${PARTICIPANT_IDENTITY_PREFIX}:${encodeURIComponent(normalizeToken(kind))}:${encodeURIComponent(normalizeToken(key))}`;
}

function currentArtifactWorkspaceIds(record = {}) {
  const memberships = new Set();
  const add = (value) => {
    const id = normalizeToken(value);
    if (id) memberships.add(id);
  };
  add(record.workspaceId);
  for (const value of Array.isArray(record.workspaceIds) ? record.workspaceIds : []) add(value);
  return [...memberships].sort();
}

function hasAnyDeclaredArtifactSchema(record = {}) {
  return readArtifactSchemaQualification(record).declaredSchemaIds.length > 0;
}

function sourceProjection(record = {}) {
  const identity = record.registryIdentity || {};
  const boundary = identity.sourceBoundary || artifactSourceBoundaryIdentity(record) || {};
  return Object.freeze({
    sourceIds: Object.freeze([...(record.loadedSourceIds || [record.source?.id]).map(normalizeToken).filter(Boolean)].sort()),
    adapterId: String(record.source?.adapterId || ''),
    sourceMode: String(record.sourceMode || ''),
    repository: String(boundary.repository || record.source?.repository || record.source?.repo || ''),
    ref: String(boundary.ref || record.source?.ref || ''),
    rootPath: String(boundary.rootPath || record.source?.rootPath || ''),
    boundaryKey: String(boundary.key || identity.boundaryKey || ''),
    boundarySignature: String(boundary.signature || identity.boundarySignature || ''),
    sourceArtifactPath: String(identity.sourceArtifactPath || record.sourceTarget?.sourceArtifactPath || record.path || ''),
    inputTarget: String(identity.inputTarget || record.sourceTarget?.inputTarget || '')
  });
}

function declaredRecordSchemaId(record = {}) {
  const markdown = String(record.markdown || '');
  if (!markdown.trim()) return '';
  try { return normalizeToken(parseArtifactMarkdown(markdown).envelope?.current?.schema?.id); }
  catch { return ''; }
}

function metadataRecordSchemaId(record = {}) {
  return normalizeToken(record.schemaId || record.currentSchemaId || '');
}

function normalizeSchemaConstraint(value = '') {
  return normalizeToken(value).replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1');
}
function normalizeToken(value = '') { return String(value || '').trim(); }
function compareParticipants(left, right) {
  return String(left.identity.id).localeCompare(String(right.identity.id))
    || String(left.artifact.path).localeCompare(String(right.artifact.path))
    || String(left.artifact.id).localeCompare(String(right.artifact.id));
}
