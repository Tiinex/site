import {
  collectLoadedArtifactAggregates,
  artifactRegistryIdentityForRecord,
  readArtifactRepresentationQualification,
  readArtifactSchemaQualification,
  artifactSourceBoundaryIdentity,
  artifactSourceBoundarySignature
} from '../artifacts/artifact.identityAggregation.js';

const TRANSITION_REGISTRY_IDENTITY_PREFIX = 'tiinex.transition.registry';

export function collectTransitionDefinitionRegistryRecords(input = {}, declaredSchemaIdForRecord = () => '', metadataSchemaIdForRecord = () => '', canonicalSchemaId = '') {
  return collectLoadedArtifactAggregates(input, declaredSchemaIdForRecord, metadataSchemaIdForRecord, canonicalSchemaId, TRANSITION_REGISTRY_IDENTITY_PREFIX);
}
export function registryIdentityForRecord(record = {}, workspaceIds = [], declaredSchemaIdForRecord = () => '', metadataSchemaIdForRecord = () => '') {
  return artifactRegistryIdentityForRecord(record, workspaceIds, declaredSchemaIdForRecord, metadataSchemaIdForRecord, TRANSITION_REGISTRY_IDENTITY_PREFIX);
}
export function readTransitionDefinitionRepresentationQualification(...args) { return readArtifactRepresentationQualification(...args); }
export function readTransitionDefinitionSchemaQualification(...args) { return readArtifactSchemaQualification(...args); }
export function sourceBoundaryIdentity(...args) { return artifactSourceBoundaryIdentity(...args); }
export function sourceBoundarySignature(...args) { return artifactSourceBoundarySignature(...args); }
