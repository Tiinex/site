import assert from 'node:assert/strict';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildCanonicalTransitionAvailability, buildCanonicalTransitionAvailabilityPlan } from '../transitions/transition.availabilityPlanner.js';
import { TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID } from '../transitions/transition.definitionRegistry.js';
import { CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID, LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID } from '../transitions/transition.legacyShorthand.js';

function artifactMarkdown(schemaId, title = 'Artifact', extra = '') {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-15 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n${extra || 'Readable but intentionally incomplete body.'}`;
}
function record(id, schemaId, options = {}) {
  return {
    id,
    path: options.path || `.topics/${id}.trace.md`,
    markdown: options.markdown || artifactMarkdown(schemaId, options.title || id),
    schemaId: options.metadataSchemaId || schemaId,
    sourceMode: options.sourceMode || 'local-manual',
    source: options.source || { id: options.sourceId || 'local-session', adapterId: options.adapterId || 'local' },
    sourceTarget: options.sourceTarget || undefined,
    materialReconciliation: options.materialReconciliation
  };
}
function configuredRecord(id, schemaId, options = {}) {
  return record(id, schemaId, {
    ...options,
    sourceMode: 'source-backed',
    source: { id: options.sourceId || 'docs', adapterId: 'github', repository: options.repository || 'Tiinex/docs', ref: options.ref || 'main', rootPath: options.rootPath || '.topics' },
    sourceTarget: { sourceArtifactPath: options.sourceArtifactPath || `.topics/${options.logicalName || 'shared'}.trace.md` }
  });
}
function definition(id, roles = [], options = {}) {
  return {
    schema: TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID,
    artifact: { id: `definition:${id}`, registryIdentity: `definition:${id}`, schemaId: CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID },
    transitionIdentity: { Name: id, 'Canonical Identifier': id },
    canonicalReadQualified: options.canonicalReadQualified !== false,
    diagnostics: options.diagnostics || [],
    inputRoles: roles,
    destinationBindings: options.destinationBindings || [],
    outputRoles: options.outputRoles || [], lifecycleEffects: [], parentEffects: [], relationEffects: [], outputPlacements: []
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
function participantIds(result, roleName) { return result.inputRoles.find((item) => item.name === roleName).cleanCandidateIds; }

// Phase A: generic participant index identity/qualification.
const sharedMarkdown = artifactMarkdown('tiinex.topic.v1', 'Shared Topic');
const sharedA = configuredRecord('shared-a', 'tiinex.topic.v1', { logicalName: 'topic-a', markdown: sharedMarkdown });
const sharedB = configuredRecord('shared-b', 'tiinex.topic.v1', { logicalName: 'topic-a', markdown: sharedMarkdown });
const sharedIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [{ id: 'a', records: [sharedA] }, { id: 'b', records: [sharedB] }] } });
assert.equal(sharedIndex.count, 1);
assert.equal(sharedIndex.cleanCandidateCount, 1);
assert.deepEqual(sharedIndex.participants[0].artifact.workspaceIds, ['a', 'b']);
assert.equal(sharedIndex.participants[0].candidateSchemaId, 'tiinex.topic.v1');

const localIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [
  { id: 'a', records: [record('local-a', 'tiinex.topic.v1', { path: 'same.trace.md' })] },
  { id: 'b', records: [record('local-b', 'tiinex.topic.v1', { path: 'same.trace.md' })] }
] } });
assert.equal(localIndex.count, 2, 'local/unqualified same-path artifacts remain distinct');

const divergentIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [
  { id: 'a', records: [configuredRecord('div-a', 'tiinex.topic.v1', { logicalName: 'div', markdown: artifactMarkdown('tiinex.topic.v1', 'Version A') })] },
  { id: 'b', records: [configuredRecord('div-b', 'tiinex.topic.v1', { logicalName: 'div', markdown: artifactMarkdown('tiinex.topic.v1', 'Version B') })] }
] } });
assert.equal(divergentIndex.count, 1);
assert.equal(divergentIndex.participants[0].representationQualification.state, 'conflicting');
assert.equal(divergentIndex.participants[0].cleanCandidate, false);

const schemaConflictIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [
  { id: 'a', records: [configuredRecord('schema-a', 'tiinex.topic.v1', { logicalName: 'schema-div' })] },
  { id: 'b', records: [configuredRecord('schema-b', 'tiinex.task.v1', { logicalName: 'schema-div' })] }
] } });
assert.equal(schemaConflictIndex.count, 1);
assert.equal(schemaConflictIndex.participants[0].schemaQualification.state, 'conflicting');
assert.deepEqual(schemaConflictIndex.participants[0].schemaQualification.declaredSchemaIds, ['tiinex.task.v1', 'tiinex.topic.v1']);
assert.equal(schemaConflictIndex.participants[0].cleanCandidate, false);

const incompleteParticipantIndex = buildLoadedArtifactParticipantIndex({ records: [record('thin-topic', 'tiinex.topic.v1', { markdown: artifactMarkdown('tiinex.topic.v1', 'Thin', '') })] });
assert.equal(incompleteParticipantIndex.participants[0].cleanCandidate, true, 'artifact completeness is not a global participant eligibility gate');
assert.equal(incompleteParticipantIndex.participants[0].completeness, 'not-evaluated');

// 1. Zero-input / literal none, with a required destination still only an invocation requirement.
const zero = buildCanonicalTransitionAvailability({
  definition: definition('global-create', [{ name: 'none', fields: {} }], { destinationBindings: [{ name: 'root', fields: { Meaning: 'Destination root', Required: 'yes' } }] }),
  participantIndex: { participants: [] }
});
assert.equal(zero.availability, 'available');
assert.equal(zero.executable, false);
assert.equal(zero.invocationInputRequired, true);
assert.equal(zero.destinationRequirements[0].invocationInputRequired, true);

// 2. Singular Topic -> Task, existing-only.
const topicRole = role('source-topic', { Meaning: 'Source Topic', 'Minimum Count': '1', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only' });
const topicAvailable = buildCanonicalTransitionAvailability({ definition: definition('topic-to-task', [topicRole]), participantIndex: incompleteParticipantIndex });
assert.equal(topicAvailable.availability, 'available');
assert.equal(participantIds(topicAvailable, 'source-topic').length, 1);
const topicMissing = buildCanonicalTransitionAvailability({ definition: definition('topic-to-task', [topicRole]), participantIndex: { participants: [] } });
assert.equal(topicMissing.availability, 'unavailable-current-index');

// 3. Multi-input A + B -> C, no positional matching.
const multiDefinition = definition('a-plus-b', [
  role('a', { Meaning: 'A', 'Minimum Count': '1', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.a.v1', 'Acquisition Policy': 'existing-only' }),
  role('b', { Meaning: 'B', 'Minimum Count': '1', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.b.v1', 'Acquisition Policy': 'existing-only' })
]);
const abIndex = buildLoadedArtifactParticipantIndex({ records: [record('b-first', 'tiinex.b.v1'), record('a-second', 'tiinex.a.v1')] });
const abAvailable = buildCanonicalTransitionAvailability({ definition: multiDefinition, participantIndex: abIndex });
assert.equal(abAvailable.availability, 'available');
assert.equal(abAvailable.inputRoles.find((item) => item.name === 'a').cleanCandidateCount, 1);
assert.equal(abAvailable.inputRoles.find((item) => item.name === 'b').cleanCandidateCount, 1);
const onlyA = buildLoadedArtifactParticipantIndex({ records: [record('a-only', 'tiinex.a.v1')] });
assert.equal(buildCanonicalTransitionAvailability({ definition: multiDefinition, participantIndex: onlyA }).availability, 'unavailable-current-index');

// 4. Current artifact may match multiple roles; no first-role guess.
const ambiguousDefinition = definition('ambiguous-context', [
  role('left', { Meaning: 'Left', 'Minimum Count': '0', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only' }),
  role('right', { Meaning: 'Right', 'Minimum Count': '0', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only' })
]);
const contextArtifact = record('context-topic', 'tiinex.topic.v1');
const contextIndex = buildLoadedArtifactParticipantIndex({ records: [contextArtifact] });
const ambiguous = buildCanonicalTransitionAvailability({ definition: ambiguousDefinition, participantIndex: contextIndex, currentArtifact: contextArtifact });
assert.deepEqual(ambiguous.context.candidateRoleIds, ['left', 'right']);
assert.equal(ambiguous.context.assignment, 'ambiguous');

// 5. Unknown Target Kind / cardinality remains literal and unresolved.
const unknown = buildCanonicalTransitionAvailability({ definition: definition('unknown-role', [role('mystery', { Meaning: 'Mystery', 'Minimum Count': '1', 'Maximum Count': 'unknown', 'Target Kind': 'unknown', 'Acquisition Policy': 'unknown' })]), participantIndex: contextIndex });
assert.equal(unknown.availability, 'unresolved');
assert.equal(unknown.inputRoles[0].targetKind, 'unknown');
assert.equal(unknown.inputRoles[0].maximumCount, 'unknown');
assert.equal(unknown.inputRoles[0].cleanCandidateCount, 0);

// 6. Non-artifact invocation-provided input is not substituted from Artifact index.
const nonArtifact = buildCanonicalTransitionAvailability({ definition: definition('needs-comment', [role('comment', { Meaning: 'Comment', 'Minimum Count': '1', 'Maximum Count': '1', 'Target Kind': 'non-artifact', 'Acquisition Policy': 'invocation-provided' })]), participantIndex: contextIndex });
assert.equal(nonArtifact.availability, 'available');
assert.equal(nonArtifact.invocationInputRequired, true);
assert.equal(nonArtifact.inputRoles[0].cleanCandidateCount, 0);
assert.equal(nonArtifact.inputRoles[0].requirementKind, 'invocation-non-artifact');

// 7. Unevaluated condition propagates unresolved required participation.
const conditional = buildCanonicalTransitionAvailability({ definition: definition('conditional', [role('subject', { Meaning: 'Subject', 'Minimum Count': '1', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only', Condition: 'only when approved' })]), participantIndex: contextIndex });
assert.equal(conditional.availability, 'unresolved');
assert.equal(conditional.inputRoles[0].participation, 'unresolved');

// 8. Producing-transition acquisition is surfaced but not recursively solved.
const existingOrCreate = buildCanonicalTransitionAvailability({ definition: definition('existing-or-create', [role('topic', { Meaning: 'Topic', 'Minimum Count': '1', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-or-create' })]), participantIndex: { participants: [] } });
assert.equal(existingOrCreate.availability, 'unresolved');
assert.equal(existingOrCreate.inputRoles[0].availability, 'unresolved-needs-producing-transition');
const createOnly = buildCanonicalTransitionAvailability({ definition: definition('create-only', [role('topic', { Meaning: 'Topic', 'Minimum Count': '1', 'Maximum Count': '1', 'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'create-only' })]), participantIndex: contextIndex });
assert.equal(createOnly.availability, 'unresolved');
assert.equal(createOnly.inputRoles[0].availability, 'unresolved-needs-producing-transition');

// 10. Conflicting participants remain inspectable but cannot satisfy required roles.
const conflictAvailability = buildCanonicalTransitionAvailability({ definition: definition('conflict', [topicRole]), participantIndex: divergentIndex });
assert.equal(conflictAvailability.availability, 'unavailable-current-index');
assert.equal(conflictAvailability.inputRoles[0].cleanCandidateCount, 0);
assert.equal(conflictAvailability.inputRoles[0].inspectableMatchingParticipantIds.length, 1);

// 12. Definition gate.
const blocked = buildCanonicalTransitionAvailability({ definition: definition('blocked', [topicRole], { canonicalReadQualified: false, diagnostics: [{ code: 'fixture' }] }), participantIndex: contextIndex });
assert.equal(blocked.availability, 'blocked');
assert.equal(blocked.executable, false);
assert.equal(blocked.definitionDiagnostics.length, 1);

// 13. Legacy shorthand never enters canonical plan.
const plan = buildCanonicalTransitionAvailabilityPlan({ definitions: [definition('canonical', []), { schema: LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID, id: 'legacy', canonicalReadQualified: true }], participantIndex: contextIndex });
assert.equal(plan.count, 1);
assert.equal(plan.transitions[0].definition.canonicalIdentifier, 'canonical');

console.log('✓ post-S1 canonical Transition Availability Planner foundation tests passed');
