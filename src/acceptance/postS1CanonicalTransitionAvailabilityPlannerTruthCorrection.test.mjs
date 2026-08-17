import assert from 'node:assert/strict';
import { buildLoadedArtifactParticipantIndex, resolveCurrentArtifactParticipant } from '../artifacts/artifact.participantIndex.js';
import { buildCanonicalTransitionAvailability } from '../transitions/transition.availabilityPlanner.js';
import { TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID } from '../transitions/transition.definitionRegistry.js';
import { CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID } from '../transitions/transition.legacyShorthand.js';

function artifactMarkdown(schemaId, title = 'Artifact') {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-15 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nReadable participant material.`;
}
function record(id, schemaId, options = {}) {
  return {
    id,
    workspaceId: options.workspaceId,
    workspaceIds: options.workspaceIds,
    path: options.path || 'same.trace.md',
    markdown: options.markdown || artifactMarkdown(schemaId, options.title || id),
    schemaId,
    sourceMode: 'local-manual',
    source: { id: 'local-session', adapterId: 'local' }
  };
}
function definition(id, roles = [], options = {}) {
  return {
    schema: TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID,
    artifact: { id: `definition:${id}`, registryIdentity: `definition:${id}`, schemaId: CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID },
    transitionIdentity: { Name: id, 'Canonical Identifier': id },
    canonicalReadQualified: true,
    diagnostics: [],
    inputRoles: roles,
    destinationBindings: options.destinationBindings || [],
    outputRoles: [], lifecycleEffects: [], parentEffects: [], relationEffects: [], outputPlacements: []
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

// Participant identity: raw runtime record ids are compatibility data, not participant identity authority.
const localTopicA = record('same', 'tiinex.topic.v1', { workspaceId: 'a', title: 'Topic A' });
const localTaskB = record('same', 'tiinex.task.v1', { workspaceId: 'b', title: 'Task B' });
const mixedIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [
  { id: 'a', records: [localTopicA] },
  { id: 'b', records: [localTaskB] }
] } });
assert.equal(mixedIndex.count, 2);
assert.equal(new Set(mixedIndex.participants.map((participant) => participant.identity.id)).size, 2, 'distinct local aggregates need distinct participant identities');
assert.equal(new Set(mixedIndex.participants.map((participant) => participant.identity.key)).size, 2);
assert(mixedIndex.participants.every((participant) => participant.artifact.loadedRecordIds.includes('same')), 'raw record id remains compatibility evidence');

const resolvedTask = resolveCurrentArtifactParticipant(localTaskB, mixedIndex);
assert.equal(resolvedTask?.candidateSchemaId, 'tiinex.task.v1', 'workspace-scoped identity must resolve the Task rather than first same-id participant');
assert.deepEqual(resolvedTask?.artifact.workspaceIds, ['b']);

const ambiguousRawOnly = resolveCurrentArtifactParticipant({ id: 'same', path: 'same.trace.md', markdown: artifactMarkdown('tiinex.task.v1', 'Raw only'), schemaId: 'tiinex.task.v1' }, mixedIndex);
assert.equal(ambiguousRawOnly, null, 'raw record id matching multiple aggregates must never choose first');

const topicA = record('same', 'tiinex.topic.v1', { workspaceId: 'a', title: 'Topic Same' });
const topicB = record('same', 'tiinex.topic.v1', { workspaceId: 'b', title: 'Topic Same' });
const twoTopicIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [
  { id: 'a', records: [topicA] },
  { id: 'b', records: [topicB] }
] } });
const twoTopicPlan = buildCanonicalTransitionAvailability({
  definition: definition('two-topics', [role('topics', {
    Meaning: 'Two Topics', 'Minimum Count': '2', 'Maximum Count': '2', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only'
  })]),
  participantIndex: twoTopicIndex
});
assert.equal(twoTopicPlan.availability, 'available');
assert.equal(twoTopicPlan.inputRoles[0].cleanCandidateCount, 2);
assert.equal(new Set(twoTopicPlan.inputRoles[0].cleanCandidateIds).size, 2, 'planner candidate ids must identify both local participants distinctly');

// Unknown maximum is unresolved cardinality even when the numeric minimum is already satisfiable.
const oneTopicIndex = buildLoadedArtifactParticipantIndex({ records: [record('topic', 'tiinex.topic.v1', { path: 'topic.trace.md', title: 'Topic' })] });
const maxUnknown = buildCanonicalTransitionAvailability({
  definition: definition('max-unknown', [role('topic', {
    Meaning: 'Topic', 'Minimum Count': '1', 'Maximum Count': 'unknown', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only'
  })]),
  participantIndex: oneTopicIndex
});
assert.equal(maxUnknown.inputRoles[0].maximumCount, 'unknown');
assert.equal(maxUnknown.inputRoles[0].availability, 'unresolved');
assert(maxUnknown.inputRoles[0].reasons.includes('maximum-count-unknown'));
assert.equal(maxUnknown.availability, 'unresolved');

// Entirely optional unknown cardinality remains visible at role level without necessarily blocking discoverability.
const optionalMaxUnknown = buildCanonicalTransitionAvailability({
  definition: definition('optional-max-unknown', [role('topic', {
    Meaning: 'Optional Topic', 'Minimum Count': '0', 'Maximum Count': 'unknown', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only'
  })]),
  participantIndex: oneTopicIndex
});
assert.equal(optionalMaxUnknown.inputRoles[0].availability, 'unresolved');
assert.equal(optionalMaxUnknown.availability, 'available');

// Unknown requiredness must never collapse to known-false invocation truth.
const minUnknownInvocation = buildCanonicalTransitionAvailability({
  definition: definition('min-unknown-invocation', [role('comment', {
    Meaning: 'Comment', 'Minimum Count': 'unknown', 'Maximum Count': '1', 'Target Kind': 'non-artifact', 'Acquisition Policy': 'invocation-provided'
  })]),
  participantIndex: oneTopicIndex
});
assert.equal(minUnknownInvocation.availability, 'unresolved');
assert.equal(minUnknownInvocation.inputRoles[0].invocationInputQualification.state, 'unresolved');
assert.equal(minUnknownInvocation.invocationInputQualification.state, 'unresolved');
assert.equal(minUnknownInvocation.invocationInputRequired, false, 'compat boolean means definitely required only; qualification is authoritative');
assert(minUnknownInvocation.invocationRequirements.some((item) => item.kind === 'input-role' && item.state === 'unresolved'));

const destinationUnknown = buildCanonicalTransitionAvailability({
  definition: definition('destination-unknown', [], { destinationBindings: [{ name: 'root', fields: { Meaning: 'Destination', Required: 'unknown' } }] }),
  participantIndex: oneTopicIndex
});
assert.equal(destinationUnknown.destinationRequirements[0].required, 'unknown');
assert.equal(destinationUnknown.destinationRequirements[0].invocationInputQualification.state, 'unresolved');
assert.equal(destinationUnknown.invocationInputQualification.state, 'unresolved');
assert.equal(destinationUnknown.invocationInputRequired, false);

const destinationRequired = buildCanonicalTransitionAvailability({
  definition: definition('destination-required', [], { destinationBindings: [{ name: 'root', fields: { Meaning: 'Destination', Required: 'yes' } }] }),
  participantIndex: oneTopicIndex
});
assert.equal(destinationRequired.destinationRequirements[0].invocationInputQualification.state, 'required');
assert.equal(destinationRequired.invocationInputQualification.state, 'required');
assert.equal(destinationRequired.invocationInputRequired, true);

const knownOptional = buildCanonicalTransitionAvailability({
  definition: definition('known-optional', [role('comment', {
    Meaning: 'Optional Comment', 'Minimum Count': '0', 'Maximum Count': '1', 'Target Kind': 'non-artifact', 'Acquisition Policy': 'invocation-provided'
  })]),
  participantIndex: oneTopicIndex
});
assert.equal(knownOptional.inputRoles[0].invocationInputQualification.state, 'not-required');
assert.equal(knownOptional.invocationInputQualification.state, 'not-required');
assert.equal(knownOptional.invocationInputRequired, false);

for (const result of [twoTopicPlan, maxUnknown, optionalMaxUnknown, minUnknownInvocation, destinationUnknown, destinationRequired, knownOptional]) {
  assert.equal(result.executable, false, 'targeted correction must not open execution');
}

console.log('✓ post-S1 canonical Transition Availability Planner truth correction tests passed');
