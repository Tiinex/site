import assert from 'node:assert/strict';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildCanonicalTransitionAvailability } from '../transitions/transition.availabilityPlanner.js';
import { TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID } from '../transitions/transition.definitionRegistry.js';
import { CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID } from '../transitions/transition.legacyShorthand.js';

function artifactMarkdown(schemaId, title = 'Artifact', body = 'Readable participant material.') {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-15 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n${body}`;
}
function localRecord(id, schemaId, options = {}) {
  return {
    id,
    workspaceId: options.workspaceId || 'w',
    path: options.path || 'same.trace.md',
    markdown: options.markdown || artifactMarkdown(schemaId, options.title || 'Same'),
    schemaId,
    sourceMode: 'local-manual',
    source: { id: 'local-session', adapterId: 'local' }
  };
}
function definition(id, roles = []) {
  return {
    schema: TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID,
    artifact: { id: `definition:${id}`, registryIdentity: `definition:${id}`, schemaId: CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID },
    transitionIdentity: { Name: id, 'Canonical Identifier': id },
    canonicalReadQualified: true,
    diagnostics: [],
    inputRoles: roles,
    destinationBindings: [], outputRoles: [], lifecycleEffects: [], parentEffects: [], relationEffects: [], outputPlacements: []
  };
}
function role(name, fields) {
  const declared = String(fields?.['Target Kind'] || '').trim();
  const schemaId = String(fields?.['Schema Constraint'] || '').trim();
  const known = declared === 'artifact' || declared === 'non-artifact';
  const qualification = declared === 'unknown' ? 'preserved-unknown' : known ? (schemaId ? 'agreement' : 'explicit') : 'unresolved';
  const resolved = declared === 'unknown' ? 'unknown' : known ? declared : '';
  return {
    name,
    fields,
    participantClassification: {
      declared,
      resolved,
      qualification,
      authority: declared === 'unknown' ? 'explicit-declaration' : known ? (schemaId ? 'explicit+schema-constraint' : 'explicit-declaration') : '',
      schemaConstraint: { schemaId, qualification: schemaId ? 'resolved' : 'absent', observedTargetKind: known ? declared : '' },
      evidence: []
    }
  };
}
function artifactRole(name, minimum, schemaId, acquisition = 'existing-only', maximum = '1') {
  return role(name, {
    Meaning: name,
    'Minimum Count': minimum,
    'Maximum Count': maximum,
    'Target Kind': 'artifact',
    'Schema Constraint': schemaId,
    'Acquisition Policy': acquisition
  });
}

// Same local logical record with divergent declared schema must aggregate first, then surface conflict.
const sameTopicObservation = localRecord('same', 'tiinex.topic.v1', { workspaceId: 'w', path: 'same.trace.md', title: 'Same' });
const sameTaskObservation = localRecord('same', 'tiinex.task.v1', { workspaceId: 'w', path: 'same.trace.md', title: 'Same' });
const schemaConflictIndex = buildLoadedArtifactParticipantIndex({ records: [sameTopicObservation, sameTaskObservation] });
assert.equal(schemaConflictIndex.count, 1, 'declared schema must not split one local logical-record identity');
const schemaConflict = schemaConflictIndex.participants[0];
assert.equal(schemaConflict.schemaQualification.state, 'conflicting');
assert.deepEqual(schemaConflict.schemaQualification.declaredSchemaIds, ['tiinex.task.v1', 'tiinex.topic.v1']);
assert.equal(schemaConflict.cleanCandidate, false);
assert.equal(schemaConflict.artifact.loadedRecordIds.length, 1, 'runtime record id remains compatibility evidence, not aggregate multiplicity');

const falseTwoRolePlan = buildCanonicalTransitionAvailability({
  definition: definition('topic-plus-task', [
    artifactRole('topic', '1', 'tiinex.topic.v1'),
    artifactRole('task', '1', 'tiinex.task.v1')
  ]),
  participantIndex: schemaConflictIndex
});
assert.notEqual(falseTwoRolePlan.availability, 'available', 'one schema-conflicting local logical record cannot satisfy Topic + Task as two clean participants');
assert.equal(falseTwoRolePlan.inputRoles[0].cleanCandidateCount, 0);
assert.equal(falseTwoRolePlan.inputRoles[1].cleanCandidateCount, 0);

// Same local identity + same schema + divergent representation must also remain one conflicting aggregate.
const repA = localRecord('rep', 'tiinex.topic.v1', { workspaceId: 'w', path: 'rep.trace.md', title: 'Representation', markdown: artifactMarkdown('tiinex.topic.v1', 'Representation', 'Body A') });
const repB = localRecord('rep', 'tiinex.topic.v1', { workspaceId: 'w', path: 'rep.trace.md', title: 'Representation', markdown: artifactMarkdown('tiinex.topic.v1', 'Representation', 'Body B') });
const representationConflictIndex = buildLoadedArtifactParticipantIndex({ records: [repA, repB] });
assert.equal(representationConflictIndex.count, 1);
assert.equal(representationConflictIndex.participants[0].schemaQualification.state, 'equivalent');
assert.equal(representationConflictIndex.participants[0].representationQualification.state, 'conflicting');
assert.equal(representationConflictIndex.participants[0].cleanCandidate, false);

// Distinct workspace-scoped local records with the same raw id/path remain distinct.
const localA = localRecord('same', 'tiinex.topic.v1', { workspaceId: 'a', path: 'same.trace.md', title: 'Topic' });
const localB = localRecord('same', 'tiinex.topic.v1', { workspaceId: 'b', path: 'same.trace.md', title: 'Topic' });
const workspaceDistinctIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [
  { id: 'a', records: [localA] },
  { id: 'b', records: [localB] }
] } });
assert.equal(workspaceDistinctIndex.count, 2);
assert.equal(new Set(workspaceDistinctIndex.participants.map((item) => item.identity.id)).size, 2);

// Role requiredness is tri-state authority; compatibility bool is true only for definitely-required.
const participantIndex = buildLoadedArtifactParticipantIndex({ records: [localRecord('topic', 'tiinex.topic.v1', { workspaceId: 'w', path: 'topic.trace.md', title: 'Topic' })] });
const requiredPlan = buildCanonicalTransitionAvailability({
  definition: definition('required-role', [artifactRole('topic', '1', 'tiinex.topic.v1')]),
  participantIndex
});
assert.equal(requiredPlan.inputRoles[0].requiredQualification.state, 'required');
assert.equal(requiredPlan.inputRoles[0].required, true);
assert.equal(requiredPlan.availability, 'available');

const optionalPlan = buildCanonicalTransitionAvailability({
  definition: definition('optional-role', [artifactRole('topic', '0', 'tiinex.topic.v1')]),
  participantIndex
});
assert.equal(optionalPlan.inputRoles[0].requiredQualification.state, 'not-required');
assert.equal(optionalPlan.inputRoles[0].required, false);

const unknownMinimumPlan = buildCanonicalTransitionAvailability({
  definition: definition('unknown-minimum-role', [artifactRole('topic', 'unknown', 'tiinex.topic.v1')]),
  participantIndex
});
assert.equal(unknownMinimumPlan.inputRoles[0].requiredQualification.state, 'unresolved');
assert.equal(unknownMinimumPlan.inputRoles[0].required, false, 'unknown minimum must not project definitely-required');
assert.equal(unknownMinimumPlan.inputRoles[0].availability, 'unresolved');
assert.equal(unknownMinimumPlan.availability, 'unresolved');

const unknownInvocationPlan = buildCanonicalTransitionAvailability({
  definition: definition('unknown-invocation-requiredness', [role('comment', {
    Meaning: 'Comment',
    'Minimum Count': 'unknown',
    'Maximum Count': '1',
    'Target Kind': 'non-artifact',
    'Acquisition Policy': 'invocation-provided'
  })]),
  participantIndex
});
assert.equal(unknownInvocationPlan.inputRoles[0].requiredQualification.state, 'unresolved');
assert.equal(unknownInvocationPlan.inputRoles[0].required, false);
assert.equal(unknownInvocationPlan.inputRoles[0].invocationInputQualification.state, 'unresolved');
assert.equal(unknownInvocationPlan.invocationInputQualification.state, 'unresolved');
assert.equal(unknownInvocationPlan.availability, 'unresolved');

for (const plan of [falseTwoRolePlan, requiredPlan, optionalPlan, unknownMinimumPlan, unknownInvocationPlan]) {
  assert.equal(plan.executable, false, 'v413 correction must not open execution');
}

console.log('✓ post-S1 canonical Transition Availability Planner local aggregation + requiredness correction tests passed');
