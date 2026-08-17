import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import {
  buildCanonicalTransitionAvailability
} from '../transitions/transition.availabilityPlanner.js';
import {
  TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID
} from '../transitions/transition.definitionRegistry.js';

function artifactRecord(id, schemaId = 'tiinex.topic.v1', workspaceId = 'w') {
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-16 00:00:00\n\n---\n\n# ${id}\n\nReadable participant.\n`;
  return Object.assign(createRecordFromMarkdown(markdown, {
    path: `.topics/${id}.trace.md`, sourceMode: 'local'
  }), {
    id,
    workspaceId,
    source: { id: 'local-session', adapterId: 'local' }
  });
}

function role(name, {
  schemaId = 'tiinex.topic.v1',
  classification = 'explicit',
  resolved = 'artifact',
  schemaQualification = 'resolved'
} = {}) {
  const fields = {
    Meaning: `${name} fixture`,
    'Minimum Count': '1',
    'Maximum Count': '1',
    'Acquisition Policy': 'existing-only'
  };
  if (classification !== 'unresolved') fields['Target Kind'] = 'artifact';
  if (schemaId) fields['Schema Constraint'] = schemaId;
  return Object.freeze({
    name,
    fields: Object.freeze(fields),
    participantClassification: Object.freeze({
      declared: classification === 'unresolved' ? '' : 'artifact',
      resolved: classification === 'unresolved' ? '' : resolved,
      qualification: classification,
      authority: classification === 'unresolved' ? '' : 'explicit+schema-constraint',
      schemaConstraint: Object.freeze({
        schemaId: schemaId || '',
        qualification: schemaId ? schemaQualification : 'absent',
        observedTargetKind: schemaQualification === 'unresolved' ? '' : 'artifact'
      }),
      evidence: Object.freeze([])
    })
  });
}

function definition(inputRoles) {
  return Object.freeze({
    schema: TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID,
    artifact: Object.freeze({
      schemaId: 'tiinex.transition.definition.v1',
      registryIdentity: 'fixture:current-assignment',
      id: 'fixture-transition'
    }),
    transitionIdentity: Object.freeze({
      Name: 'current-assignment',
      'Canonical Identifier': 'current-assignment'
    }),
    canonicalReadQualified: true,
    inputRoles: Object.freeze(inputRoles),
    destinationBindings: Object.freeze([]),
    diagnostics: Object.freeze([]),
    ordinaryProjection: Object.freeze({ byGroup: Object.freeze({}) })
  });
}

function plan(roles) {
  const currentArtifact = artifactRecord('current-topic');
  const participantIndex = buildLoadedArtifactParticipantIndex({ records: [currentArtifact] });
  return buildCanonicalTransitionAvailability({
    definition: definition(roles),
    participantIndex,
    currentArtifact
  });
}

// A. One known match + unresolved participant-kind competitor must fail closed.
const participantKindCompetitor = plan([
  role('known-topic'),
  role('unresolved-role', { schemaId: '', classification: 'unresolved' })
]);
assert.deepEqual(participantKindCompetitor.context.candidateRoleIds, ['known-topic']);
assert.deepEqual(participantKindCompetitor.context.unresolvedRoleIds, ['unresolved-role']);
assert.equal(participantKindCompetitor.context.assignment, 'unresolved');
assert.equal(participantKindCompetitor.context.artifactContextCandidate, true);
assert(participantKindCompetitor.context.reasons.includes('role-participant-classification-or-schema-unresolved'));

// B. One known match + unresolved schema-restriction competitor must also fail closed.
const schemaCompetitor = plan([
  role('known-topic'),
  role('unresolved-schema', { schemaId: 'tiinex.topic.v1', schemaQualification: 'unresolved' })
]);
assert.deepEqual(schemaCompetitor.context.candidateRoleIds, ['known-topic']);
assert.deepEqual(schemaCompetitor.context.unresolvedRoleIds, ['unresolved-schema']);
assert.equal(schemaCompetitor.context.assignment, 'unresolved');

// C. One known candidate with no unresolved competitors remains unique.
const unique = plan([role('known-topic')]);
assert.deepEqual(unique.context.candidateRoleIds, ['known-topic']);
assert.deepEqual(unique.context.unresolvedRoleIds, []);
assert.equal(unique.context.assignment, 'unique');

// D. Proven ambiguity stays ambiguous even if another role is unresolved.
const ambiguous = plan([
  role('known-a'),
  role('known-b'),
  role('unresolved-role', { schemaId: '', classification: 'unresolved' })
]);
assert.deepEqual(ambiguous.context.candidateRoleIds, ['known-a', 'known-b']);
assert.deepEqual(ambiguous.context.unresolvedRoleIds, ['unresolved-role']);
assert.equal(ambiguous.context.assignment, 'ambiguous');

for (const result of [participantKindCompetitor, schemaCompetitor, unique, ambiguous]) {
  assert.equal(result.executable, false);
  assert.equal(result.readOnly, true);
  assert.equal(result.mutation, false);
  assert.equal(result.networkFetch, false);
}

console.log('post-v417 current-artifact assignment fail-closed correction regression passed');
