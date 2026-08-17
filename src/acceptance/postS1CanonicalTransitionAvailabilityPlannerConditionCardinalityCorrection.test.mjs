import assert from 'node:assert/strict';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildCanonicalTransitionAvailability } from '../transitions/transition.availabilityPlanner.js';
import { TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID } from '../transitions/transition.definitionRegistry.js';
import { CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID } from '../transitions/transition.legacyShorthand.js';

function artifactMarkdown(schemaId, title = 'Topic') {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-15 00:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nReadable participant material.`;
}
function participantIndex() {
  return buildLoadedArtifactParticipantIndex({ records: [{
    id: 'topic', workspaceId: 'w', path: 'topic.trace.md', markdown: artifactMarkdown('tiinex.topic.v1'),
    schemaId: 'tiinex.topic.v1', sourceMode: 'local-manual', source: { id: 'local-session', adapterId: 'local' }
  }] });
}
function role(name, fields) {
  const declared = String(fields?.['Target Kind'] || '').trim();
  const schemaId = String(fields?.['Schema Constraint'] || '').trim();
  const known = declared === 'artifact' || declared === 'non-artifact';
  return {
    name,
    fields,
    participantClassification: {
      declared,
      resolved: declared === 'unknown' ? 'unknown' : known ? declared : '',
      qualification: declared === 'unknown' ? 'preserved-unknown' : known ? (schemaId ? 'agreement' : 'explicit') : 'unresolved',
      authority: declared === 'unknown' ? 'explicit-declaration' : known ? (schemaId ? 'explicit+schema-constraint' : 'explicit-declaration') : '',
      schemaConstraint: { schemaId, qualification: schemaId ? 'resolved' : 'absent', observedTargetKind: known ? declared : '' },
      evidence: []
    }
  };
}
function definition(id, fields) {
  return {
    schema: TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID,
    artifact: { id: `definition:${id}`, registryIdentity: `definition:${id}`, schemaId: CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID },
    transitionIdentity: { Name: id, 'Canonical Identifier': id },
    canonicalReadQualified: true, diagnostics: [],
    inputRoles: [role('role', fields)], destinationBindings: [], outputRoles: [], lifecycleEffects: [], parentEffects: [], relationEffects: [], outputPlacements: []
  };
}
function plan(id, fields) {
  return buildCanonicalTransitionAvailability({ definition: definition(id, fields), participantIndex: participantIndex() });
}
function artifactFields(minimum, maximum = '1') {
  return {
    Meaning: 'Topic', 'Minimum Count': minimum, 'Maximum Count': maximum,
    'Target Kind': 'artifact', 'Schema Constraint': 'tiinex.topic.v1', 'Acquisition Policy': 'existing-only',
    Condition: 'condition-not-evaluated'
  };
}
function invocationFields(minimum) {
  return {
    Meaning: 'Comment', 'Minimum Count': minimum, 'Maximum Count': '1',
    'Target Kind': 'non-artifact', 'Acquisition Policy': 'invocation-provided',
    Condition: 'condition-not-evaluated'
  };
}

// 1. Unknown minimum + unresolved condition: both axes remain unresolved and block overall applicability.
const unknownMinimum = plan('condition-unknown-minimum', artifactFields('unknown'));
assert.equal(unknownMinimum.inputRoles[0].requiredQualification.state, 'unresolved');
assert.equal(unknownMinimum.inputRoles[0].participation, 'unresolved');
assert.equal(unknownMinimum.inputRoles[0].availability, 'unresolved');
assert.equal(unknownMinimum.availability, 'unresolved');

// 2. Definitely required + unresolved condition remains unresolved overall.
const required = plan('condition-required', artifactFields('1'));
assert.equal(required.inputRoles[0].requiredQualification.state, 'required');
assert.equal(required.inputRoles[0].participation, 'unresolved');
assert.equal(required.inputRoles[0].availability, 'unresolved');
assert.equal(required.availability, 'unresolved');

// 3. Known optional + unresolved condition: role truth unresolved, transition may remain discoverable.
const optional = plan('condition-optional', artifactFields('0'));
assert.equal(optional.inputRoles[0].requiredQualification.state, 'not-required');
assert.equal(optional.inputRoles[0].participation, 'unresolved');
assert.equal(optional.inputRoles[0].availability, 'unresolved');
assert.equal(optional.availability, 'available');

// 4. Known optional + unknown maximum + unresolved condition: preserve both unresolved axes without blocking overall discoverability.
const optionalUnknownMaximum = plan('condition-optional-max-unknown', artifactFields('0', 'unknown'));
assert.equal(optionalUnknownMaximum.inputRoles[0].requiredQualification.state, 'not-required');
assert.equal(optionalUnknownMaximum.inputRoles[0].participation, 'unresolved');
assert.equal(optionalUnknownMaximum.inputRoles[0].availability, 'unresolved');
assert.equal(optionalUnknownMaximum.inputRoles[0].maximumCount, 'unknown');
assert.equal(optionalUnknownMaximum.inputRoles[0].cardinality.maximum.kind, 'unknown');
assert.equal(optionalUnknownMaximum.availability, 'available');

// 5. Optional invocation-provided + unresolved condition is definitely not required.
const optionalInvocation = plan('condition-optional-invocation', invocationFields('0'));
assert.equal(optionalInvocation.inputRoles[0].requiredQualification.state, 'not-required');
assert.equal(optionalInvocation.inputRoles[0].participation, 'unresolved');
assert.equal(optionalInvocation.inputRoles[0].availability, 'unresolved');
assert.equal(optionalInvocation.inputRoles[0].invocationInputQualification.state, 'not-required');
assert.equal(optionalInvocation.invocationInputQualification.state, 'not-required');
assert.equal(optionalInvocation.invocationInputRequired, false);
assert.equal(optionalInvocation.availability, 'available');

// 6. Required invocation-provided + unresolved condition remains unresolved; no execution claim.
const requiredInvocation = plan('condition-required-invocation', invocationFields('1'));
assert.equal(requiredInvocation.inputRoles[0].requiredQualification.state, 'required');
assert.equal(requiredInvocation.inputRoles[0].availability, 'unresolved');
assert.equal(requiredInvocation.inputRoles[0].invocationInputQualification.state, 'unresolved');
assert.equal(requiredInvocation.invocationInputQualification.state, 'unresolved');
assert.equal(requiredInvocation.availability, 'unresolved');

for (const result of [unknownMinimum, required, optional, optionalUnknownMaximum, optionalInvocation, requiredInvocation]) {
  assert.equal(result.executable, false, 'v414 condition/cardinality correction must not open execution');
}

console.log('✓ post-S1 canonical Transition Availability Planner condition × cardinality correction tests passed');
