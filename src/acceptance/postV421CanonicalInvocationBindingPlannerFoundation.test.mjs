import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';
import { buildCanonicalTransitionInvocationBindingPlan } from '../transitions/transition.invocationBindingPlanner.js';

const rootOrdinary = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const rootMachineShape = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.machine-shape.contract-fixture.md', import.meta.url), 'utf8');
const transitionBase = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const transitionDomains = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.field-domain.contract-fixture.md', import.meta.url), 'utf8');
const plannerSource = fs.readFileSync(new URL('../transitions/transition.invocationBindingPlanner.js', import.meta.url), 'utf8');

const resolvers = Object.freeze({ schemaAuthorities: Object.freeze({
  'tiinex.topic.v1': Object.freeze({ targetKind: 'artifact' }),
  'tiinex.task.v1': Object.freeze({ targetKind: 'artifact' }),
  'tiinex.feedback.v1': Object.freeze({ targetKind: 'artifact' }),
  'tiinex.signal.v1': Object.freeze({ targetKind: 'artifact', generation: true, fileNaming: true })
}) });

function contractGroups(markdown) {
  const headings = [...String(markdown).matchAll(/^### ([^\n]+)\n/gm)];
  return headings.map((heading, index) => ({
    name: heading[1], start: heading.index,
    end: index + 1 < headings.length ? headings[index + 1].index : markdown.length,
    text: markdown.slice(heading.index, index + 1 < headings.length ? headings[index + 1].index : markdown.length)
  }));
}
function categoryBlock(groupText, label) {
  const start = groupText.indexOf(`\n${label}\n`);
  if (start < 0) return '';
  const tail = groupText.slice(start + 1);
  const rules = tail.indexOf('\nRules\n');
  return tail.slice(0, rules < 0 ? tail.length : rules).trimEnd();
}
function transitionContract() {
  let output = transitionBase;
  for (const pressureGroup of contractGroups(transitionDomains)) {
    const domains = categoryBlock(pressureGroup.text, 'Field Value Constraints');
    if (!domains) continue;
    const current = contractGroups(output).find((group) => group.name === pressureGroup.name);
    assert.ok(current);
    let replacement = current.text;
    const appliesTo = categoryBlock(pressureGroup.text, 'Applies To');
    if (appliesTo && !replacement.includes('\nApplies To\n')) {
      const rulesAt = replacement.indexOf('\nRules\n');
      replacement = rulesAt < 0 ? `${replacement.trimEnd()}\n${appliesTo}\n` : `${replacement.slice(0, rulesAt)}\n${appliesTo}\n${replacement.slice(rulesAt)}`;
    }
    const rulesAt = replacement.indexOf('\nRules\n');
    replacement = rulesAt < 0 ? `${replacement.trimEnd()}\n${domains}\n` : `${replacement.slice(0, rulesAt)}\n${domains}\n${replacement.slice(rulesAt)}`;
    output = `${output.slice(0, current.start)}${replacement}${output.slice(current.end)}`;
  }
  return output;
}
function rootContract() {
  const marker = '### Machine Shape Authority';
  return `${rootOrdinary.trimEnd()}\n\n${rootMachineShape.slice(rootMachineShape.indexOf(marker)).trim()}\n`;
}
const schemaMaterials = [rootContract(), transitionContract()];

function markdown({
  id = 'invocation-binding', sourceMinimum = '1', sourceMaximum = '1', sourceAcquisition = 'existing-only',
  sourceCondition = '', transitionCondition = '', resultMapping = 'single', resultMappingMeaning = '', resultMappingKey = '', resultBinding = '', noteAcquisition = 'invocation-provided',
  addInputAssociation = false, secondPlacement = false
} = {}) {
  const inputAssociation = addInputAssociation ? `\n- associate-inputs
  - Target Binding: source
  - Effect: preserve
  - Result Binding: note
  - Member Mapping: explicit-at-invocation
` : '';
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-16 00:00:00

---

# ${id}

## Transition Identity

- Name: ${id}
- Version: 1
- Canonical Identifier: ${id}

## Purpose And Scope

- Purpose: Canonical ephemeral invocation binding planner fixture.
- Semantic Boundary: Binding completeness only; no execution.

## Input Roles

- source
  - Meaning: Existing Topic source.
  - Minimum Count: ${sourceMinimum}
  - Maximum Count: ${sourceMaximum}
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Acquisition Policy: ${sourceAcquisition}${sourceCondition ? `\n  - Condition: ${sourceCondition}` : ''}
- note
  - Meaning: Opaque caller value.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: non-artifact
  - Acquisition Policy: ${noteAcquisition}
- optional-feedback
  - Meaning: Optional Artifact input.
  - Minimum Count: 0
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.feedback.v1
  - Acquisition Policy: existing-only

## Output Roles

- result
  - Meaning: Future result.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.signal.v1
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-result
  - Target Binding: result
  - Effect: create-new${resultBinding ? `\n  - Result Binding: ${resultBinding}` : ''}
  - Logical Continuity: new-subject
  - Required Materialization Operation: create
  - Preserve Why: yes
  - Member Mapping: ${resultMapping}${resultMappingKey ? `
  - Mapping Key: ${resultMappingKey}` : ''}${resultMappingMeaning ? `
  - Mapping Meaning: ${resultMappingMeaning}` : ''}${inputAssociation}

### Parent Effects

- none

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: Invocation binds concrete role members and destination slots.${transitionCondition ? `\n- Condition: ${transitionCondition}` : ''}
- Failure Meaning: Missing required invocation input is incomplete.
- Unknown Meaning: Unavailable authority remains unresolved.

## Authoring Bindings

- Authoring Notes: Read-only invocation binding planner fixture.

## Placement Intent

### Destination Bindings

- destination
  - Meaning: Caller-selected destination.
  - Required: yes

### Output Placements

- result-placement
  - Output Binding: result
  - Destination Binding: destination
  - Placement Intent: new-materialization
  - Naming Authority: explicit-binding
  - Explicit Override Allowed: no${secondPlacement ? `\n- secondary-placement\n  - Output Binding: result\n  - Destination Binding: destination\n  - Placement Intent: new-materialization\n  - Naming Authority: target-schema\n  - Explicit Override Allowed: no` : ''}

## Interpretation Limits

- Does Not Prove: generation, path allocation, materialization, mutation, or execution.
- Must Not Be Inferred: implicit participant selection or positional member association.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function transitionRecord(source, id) {
  return Object.assign(createRecordFromMarkdown(source, { path: `.topics/transitions/${id}.trace.md`, sourceMode: 'source-backed' }), {
    id: `transition:${id}`,
    source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: 'd69b8ff55a56b8cb9282b8684db6a938a4435b94', rootPath: '.topics' },
    sourceTarget: { sourceArtifactPath: `.topics/transitions/${id}.trace.md` }
  });
}
function read(options = {}) {
  const id = options.id || 'invocation-binding';
  return buildTransitionDefinitionRegistry({ records: [transitionRecord(markdown(options), id)], schemaMaterials, resolvers }).definitions[0];
}
function artifactRecord(id, schemaId) {
  const source = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-16 00:00:00\n\n---\n\n# ${id}\n\nReadable participant.\n`;
  return Object.assign(createRecordFromMarkdown(source, { path: `.topics/${id}.trace.md`, sourceMode: 'local' }), {
    id, workspaceId: 'w', source: { id: 'local-session', adapterId: 'local' }
  });
}
const topicRecord = artifactRecord('topic', 'tiinex.topic.v1');
const taskRecord = artifactRecord('task', 'tiinex.task.v1');
const participantIndex = buildLoadedArtifactParticipantIndex({ records: [topicRecord, taskRecord] });
const topicParticipant = participantIndex.participants.find((participant) => participant.candidateSchemaId === 'tiinex.topic.v1');
const taskParticipant = participantIndex.participants.find((participant) => participant.candidateSchemaId === 'tiinex.task.v1');

function completePacket(overrides = {}) {
  return {
    inputRoles: [{ role: 'source', members: [{ bindingId: 'source-1', participantId: topicParticipant.identity.id }] }, { role: 'note', members: [{ bindingId: 'note-1', value: { text: 'opaque note' } }] }],
    destinations: [{ name: 'destination', value: { slot: 'workspace-a' } }],
    naming: [{ placement: 'result-placement', value: 'result-name' }],
    memberAssociations: [],
    ...overrides
  };
}
function plan(options = {}, packet = completePacket(), context = {}) {
  const definition = read(options);
  return { definition, plan: buildCanonicalTransitionInvocationBindingPlan({ definition, participantIndex, bindingPacket: packet, ...context }) };
}
function role(result, name) { return result.inputRoleBindings.find((item) => item.role === name); }
function destination(result, name = 'destination') { return result.destinationBindings.find((item) => item.name === name); }
function naming(result, name = 'result-placement') { return result.namingBindings.find((item) => item.placement === name); }

// Baseline: all invocation-owned bindings concretely satisfied, but execution remains closed.
const base = plan();
assert.equal(base.definition.canonicalReadQualified, true);
assert.equal(base.plan.qualification, 'qualified');
assert.equal(base.plan.executable, false);
assert.equal(base.plan.execution, false);
assert.equal(base.plan.generation, false);
assert.equal(base.plan.pathResolution, false);
assert.equal(base.plan.materialization, false);
assert.equal(role(base.plan, 'source').state, 'resolved');
assert.equal(role(base.plan, 'note').state, 'resolved');
assert.deepEqual(role(base.plan, 'note').members[0].value, { text: 'opaque note' });
assert.equal(role(base.plan, 'optional-feedback').state, 'resolved');
assert.equal(destination(base.plan).state, 'resolved');
assert.equal(naming(base.plan).state, 'resolved');
assert.equal(naming(base.plan).concretePath, null);

// 1. Non-qualified canonical read blocks invocation planning.
const blockedDefinition = Object.freeze({ ...base.definition, canonicalReadQualified: false });
const blocked = buildCanonicalTransitionInvocationBindingPlan({ definition: blockedDefinition, participantIndex, bindingPacket: completePacket() });
assert.equal(blocked.qualification, 'blocked');
assert.equal(blocked.executable, false);

// 2. Required Artifact role is incomplete without caller selection; candidates are evidence only.
const missingSource = plan({}, completePacket({ inputRoles: [{ role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] })).plan;
assert.equal(missingSource.qualification, 'incomplete');
assert.equal(role(missingSource, 'source').state, 'incomplete');
assert.deepEqual(role(missingSource, 'source').cleanCandidateIds, [topicParticipant.identity.id]);
assert.equal(role(missingSource, 'source').autoSelected, false);

// 3. Valid Artifact selection resolves exactly one loaded participant.
assert.equal(role(base.plan, 'source').members[0].participantId, topicParticipant.identity.id);
assert.equal(role(base.plan, 'source').members[0].state, 'resolved');

// 4. Unknown participant identity remains unresolved, not invalid/guessed.
const unknownParticipant = plan({}, completePacket({ inputRoles: [{ role: 'source', members: [{ bindingId: 'source-1', participantId: 'missing-participant' }] }, { role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] })).plan;
assert.equal(role(unknownParticipant, 'source').state, 'unresolved');
assert.equal(unknownParticipant.qualification, 'unresolved');

// 5. Known participant contradicting resolved schema restriction is invalid.
const wrongSchema = plan({}, completePacket({ inputRoles: [{ role: 'source', members: [{ bindingId: 'source-1', participantId: taskParticipant.identity.id }] }, { role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] })).plan;
assert.equal(role(wrongSchema, 'source').state, 'invalid');
assert.ok(role(wrongSchema, 'source').members[0].reasons.includes('participant-schema-mismatch'));
assert.equal(wrongSchema.qualification, 'invalid');

// 6. Minimum Count 0 role may remain unbound.
assert.equal(role(base.plan, 'optional-feedback').suppliedMemberCount, 0);
assert.equal(role(base.plan, 'optional-feedback').state, 'resolved');

// 7. Finite maximum overflow is invalid; no member is invented/dropped.
const overflow = plan({}, completePacket({ inputRoles: [{ role: 'source', members: [
  { bindingId: 'source-1', participantId: topicParticipant.identity.id },
  { bindingId: 'source-2', participantId: topicParticipant.identity.id }
] }, { role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] })).plan;
assert.equal(role(overflow, 'source').state, 'invalid');
assert.equal(role(overflow, 'source').suppliedMemberCount, 2);
assert.equal(overflow.qualification, 'invalid');

// 8–9. Required non-Artifact invocation value is incomplete when absent and opaque/resolved when supplied.
const missingNote = plan({}, completePacket({ inputRoles: [{ role: 'source', members: [{ bindingId: 'source-1', participantId: topicParticipant.identity.id }] }] })).plan;
assert.equal(role(missingNote, 'note').state, 'incomplete');
assert.equal(missingNote.qualification, 'incomplete');
assert.deepEqual(role(base.plan, 'note').members[0].value, { text: 'opaque note' });

// 10. Unknown role binding key is visible and invalid.
const unknownRole = plan({}, completePacket({ inputRoles: [...completePacket().inputRoles, { role: 'ghost', members: [{ value: 1 }] }] })).plan;
assert.equal(unknownRole.qualification, 'invalid');
assert.ok(unknownRole.packetAudit.findings.some((finding) => finding.code === 'unknown-input-role-binding'));

// 11–12. Required destination is incomplete when missing and opaque/resolved when supplied.
const missingDestination = plan({}, completePacket({ destinations: [] })).plan;
assert.equal(destination(missingDestination).state, 'incomplete');
assert.equal(missingDestination.qualification, 'incomplete');
assert.deepEqual(destination(base.plan).value, { slot: 'workspace-a' });

// 13. One concrete destination binding satisfies multiple placements referencing the same slot.
const reusedDestination = plan({ id: 'reused-destination', secondPlacement: true }, completePacket({ naming: [{ placement: 'result-placement', value: 'result-name' }] })).plan;
assert.equal(reusedDestination.destinationBindings.length, 1);
assert.equal(destination(reusedDestination).state, 'resolved');
assert.equal(destination(reusedDestination).suppliedEntryCount, 1);

// 14. Unknown destination key is invalid.
const unknownDestination = plan({}, completePacket({ destinations: [...completePacket().destinations, { name: 'ghost-destination', value: 'x' }] })).plan;
assert.equal(unknownDestination.qualification, 'invalid');
assert.ok(unknownDestination.packetAudit.findings.some((finding) => finding.code === 'unknown-destination-binding'));

// 15–16. explicit-binding naming is invocation-owned but never becomes a concrete path.
const missingNaming = plan({}, completePacket({ naming: [] })).plan;
assert.equal(naming(missingNaming).state, 'incomplete');
assert.equal(missingNaming.qualification, 'incomplete');
assert.equal(naming(base.plan).state, 'resolved');
assert.equal(naming(base.plan).value, 'result-name');
assert.equal(naming(base.plan).concretePath, null);

// 17. Unique current Artifact is prebinding evidence only; it is never silently committed.
const currentCandidate = plan({}, completePacket({ inputRoles: [{ role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] }), { currentArtifact: topicRecord }).plan;
assert.equal(currentCandidate.currentArtifactContext.assignment, 'unique');
assert.deepEqual(currentCandidate.currentArtifactContext.candidateRoleIds, ['source']);
assert.equal(role(currentCandidate, 'source').currentArtifactCandidate, true);
assert.equal(role(currentCandidate, 'source').autoSelected, false);
assert.equal(role(currentCandidate, 'source').state, 'incomplete');

// 18. Transition/role Condition stays unresolved despite otherwise complete packet.
const conditioned = plan({ id: 'conditioned', transitionCondition: 'authority not evaluated' }).plan;
assert.equal(conditioned.qualification, 'unresolved');
assert.ok(conditioned.reasons.some((reason) => reason.includes('transition-condition-not-evaluated')));
const roleConditioned = plan({ id: 'role-conditioned', sourceCondition: 'source participates when approved' }).plan;
assert.equal(role(roleConditioned, 'source').state, 'unresolved');
assert.equal(roleConditioned.qualification, 'unresolved');

// 19. create-only remains a producer dependency; no recursive production is attempted.
const createOnly = plan({ id: 'create-only', sourceAcquisition: 'create-only' }, completePacket({ inputRoles: [{ role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] })).plan;
assert.equal(role(createOnly, 'source').state, 'unresolved');
assert.ok(role(createOnly, 'source').reasons.includes('unresolved-needs-producing-transition'));
assert.equal(createOnly.qualification, 'unresolved');

// 20. pairwise mapping is preserved/deferred and never inferred from member order.
const pairwise = plan({ id: 'pairwise', resultMapping: 'pairwise', resultBinding: 'source' }).plan;
const pairwiseMapping = pairwise.memberAssociations.find((mapping) => mapping.effect === 'create-result');
assert.equal(pairwiseMapping.mapping, 'pairwise');
assert.equal(pairwiseMapping.state, 'deferred');
assert.equal(pairwiseMapping.positionalInference, false);
assert.deepEqual(pairwiseMapping.associations, []);

// Correction gate: custom/unknown remain unresolved locally; deterministic mappings remain deferred.
const customMappingPlan = plan({ id: 'custom-mapping', resultMapping: 'custom', resultMappingMeaning: 'runtime-owned custom association semantics' }).plan;
const customMapping = customMappingPlan.memberAssociations.find((mapping) => mapping.effect === 'create-result');
assert.equal(customMapping.mapping, 'custom');
assert.equal(customMapping.state, 'unresolved');
assert.deepEqual(customMapping.associations, []);
assert.equal(customMapping.positionalInference, false);
assert.equal(customMappingPlan.qualification, 'unresolved');
assert.equal(customMappingPlan.executable, false);

const unknownMappingPlan = plan({ id: 'unknown-mapping', resultMapping: 'unknown' }).plan;
const unknownMapping = unknownMappingPlan.memberAssociations.find((mapping) => mapping.effect === 'create-result');
assert.equal(unknownMapping.mapping, 'unknown');
assert.equal(unknownMapping.state, 'unresolved');
assert.deepEqual(unknownMapping.associations, []);
assert.equal(unknownMapping.positionalInference, false);
assert.equal(unknownMappingPlan.qualification, 'unresolved');

const byKeyMappingPlan = plan({ id: 'by-key-mapping', resultMapping: 'by-key', resultMappingKey: 'canonical-key' }).plan;
const byKeyMapping = byKeyMappingPlan.memberAssociations.find((mapping) => mapping.effect === 'create-result');
assert.equal(byKeyMapping.mapping, 'by-key');
assert.equal(byKeyMapping.state, 'deferred');
assert.deepEqual(byKeyMapping.associations, []);
assert.equal(byKeyMapping.positionalInference, false);

// 21. explicit-at-invocation may resolve only associations over already bound concrete input members.
const inputAssociationPacket = completePacket({ memberAssociations: [{
  group: 'lifecycle', effect: 'associate-inputs', associations: [{
    from: { role: 'source', memberId: 'source-1' },
    to: { role: 'note', memberId: 'note-1' }
  }]
}] });
const explicitInputs = plan({ id: 'explicit-input-association', addInputAssociation: true }, inputAssociationPacket).plan;
const explicitInputMapping = explicitInputs.memberAssociations.find((mapping) => mapping.effect === 'associate-inputs');
assert.equal(explicitInputMapping.state, 'resolved');
assert.equal(explicitInputMapping.associations[0].from.resolvedMemberId, 'source-1');
assert.equal(explicitInputMapping.associations[0].to.resolvedMemberId, 'note-1');
assert.equal(explicitInputMapping.positionalInference, false);

// 22. Association to a future Output Role member stays deferred/unresolved; no output identity is invented.
const futureAssociationPacket = completePacket({ memberAssociations: [{
  group: 'lifecycle', effect: 'create-result', associations: [{
    from: { role: 'source', memberId: 'source-1' },
    to: { role: 'result', memberId: 'future-result-1' }
  }]
}] });
const futureAssociation = plan({ id: 'future-association', resultMapping: 'explicit-at-invocation', resultBinding: 'source' }, futureAssociationPacket).plan;
const futureMapping = futureAssociation.memberAssociations.find((mapping) => mapping.effect === 'create-result');
assert.equal(futureMapping.state, 'unresolved');
assert.equal(futureMapping.associations[0].to.state, 'deferred');
assert.equal(futureMapping.associations[0].to.resolvedMemberId, '');
assert.equal(futureAssociation.qualification, 'unresolved');

// Correction gate: caller values cannot bypass non-artifact acquisition authority.
const existingOnlyNote = plan({ id: 'note-existing-only', noteAcquisition: 'existing-only' }).plan;
assert.equal(role(existingOnlyNote, 'note').state, 'unresolved');
assert.ok(role(existingOnlyNote, 'note').reasons.includes('non-artifact-existing-authority-unavailable'));
assert.equal(existingOnlyNote.qualification, 'unresolved');
assert.deepEqual(role(existingOnlyNote, 'note').members[0].value, { text: 'opaque note' });

const existingOrCreateNote = plan({ id: 'note-existing-or-create', noteAcquisition: 'existing-or-create' }).plan;
assert.equal(role(existingOrCreateNote, 'note').state, 'unresolved');
assert.ok(role(existingOrCreateNote, 'note').reasons.includes('unresolved-needs-producing-transition'));
assert.equal(existingOrCreateNote.qualification, 'unresolved');

const derivedNote = plan({ id: 'note-derived', noteAcquisition: 'derived' }).plan;
assert.equal(role(derivedNote, 'note').state, 'unresolved');
assert.ok(role(derivedNote, 'note').reasons.includes('derivation-not-evaluated'));
assert.equal(derivedNote.qualification, 'unresolved');

// Correction gate: undefined is absence, while explicit non-truthy opaque values remain concrete.
const undefinedNote = plan({}, completePacket({ inputRoles: [
  { role: 'source', members: [{ bindingId: 'source-1', participantId: topicParticipant.identity.id }] },
  { role: 'note', members: [{ bindingId: 'note-1', value: undefined }] }
] })).plan;
assert.equal(role(undefinedNote, 'note').state, 'incomplete');
assert.equal(undefinedNote.qualification, 'incomplete');

const undefinedDestination = plan({}, completePacket({ destinations: [{ name: 'destination', value: undefined }] })).plan;
assert.equal(destination(undefinedDestination).state, 'incomplete');
assert.equal(undefinedDestination.qualification, 'incomplete');

const undefinedNaming = plan({}, completePacket({ naming: [{ placement: 'result-placement', value: undefined }] })).plan;
assert.equal(naming(undefinedNaming).state, 'incomplete');
assert.equal(undefinedNaming.qualification, 'incomplete');

for (const opaqueValue of [0, false, null]) {
  const nonTruthy = plan({}, completePacket({ inputRoles: [
    { role: 'source', members: [{ bindingId: 'source-1', participantId: topicParticipant.identity.id }] },
    { role: 'note', members: [{ bindingId: 'note-1', value: opaqueValue }] }
  ], destinations: [{ name: 'destination', value: opaqueValue }], naming: [{ placement: 'result-placement', value: opaqueValue }] })).plan;
  assert.equal(role(nonTruthy, 'note').state, 'resolved');
  assert.equal(destination(nonTruthy).state, 'resolved');
  assert.equal(naming(nonTruthy).state, 'resolved');
  assert.equal(nonTruthy.qualification, 'qualified');
}

// Correction gate: explicit associations require legitimately bound members, not caller evidence from unresolved/invalid roles.
const unresolvedAssociationRole = plan({ id: 'association-unresolved-role', addInputAssociation: true, noteAcquisition: 'existing-only' }, inputAssociationPacket).plan;
const unresolvedAssociationMapping = unresolvedAssociationRole.memberAssociations.find((mapping) => mapping.effect === 'associate-inputs');
assert.equal(role(unresolvedAssociationRole, 'note').state, 'unresolved');
assert.equal(unresolvedAssociationMapping.associations[0].to.state, 'unresolved');
assert.equal(unresolvedAssociationMapping.associations[0].to.resolvedMemberId, '');
assert.equal(unresolvedAssociationMapping.state, 'unresolved');

const invalidAssociationPacket = completePacket({
  inputRoles: [
    { role: 'source', members: [{ bindingId: 'source-1', participantId: topicParticipant.identity.id }] },
    { role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] },
    { role: 'note', members: [{ bindingId: 'note-2', value: 'duplicate note' }] }
  ],
  memberAssociations: inputAssociationPacket.memberAssociations
});
const invalidAssociationRole = plan({ id: 'association-invalid-role', addInputAssociation: true }, invalidAssociationPacket).plan;
const invalidAssociationMapping = invalidAssociationRole.memberAssociations.find((mapping) => mapping.effect === 'associate-inputs');
assert.equal(role(invalidAssociationRole, 'note').state, 'invalid');
assert.equal(invalidAssociationMapping.associations[0].to.state, 'invalid');
assert.equal(invalidAssociationMapping.associations[0].to.resolvedMemberId, '');
assert.equal(invalidAssociationMapping.state, 'invalid');

const incompleteAssociationRole = plan({ id: 'association-incomplete-role', addInputAssociation: true, sourceMinimum: '2', sourceMaximum: '2' }, inputAssociationPacket).plan;
const incompleteAssociationMapping = incompleteAssociationRole.memberAssociations.find((mapping) => mapping.effect === 'associate-inputs');
assert.equal(role(incompleteAssociationRole, 'source').state, 'incomplete');
assert.equal(incompleteAssociationMapping.associations[0].from.state, 'resolved');
assert.equal(incompleteAssociationMapping.associations[0].from.resolvedMemberId, 'source-1');
assert.equal(incompleteAssociationMapping.state, 'resolved');

// Runtime multiplicity is observable: duplicate named packet entries do not overwrite each other.
const duplicateRoleEntries = plan({}, completePacket({ inputRoles: [
  { role: 'source', members: [{ bindingId: 'source-1', participantId: topicParticipant.identity.id }] },
  { role: 'source', members: [{ bindingId: 'source-2', participantId: topicParticipant.identity.id }] },
  { role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }
] })).plan;
assert.equal(role(duplicateRoleEntries, 'source').suppliedEntryCount, 2);
assert.equal(role(duplicateRoleEntries, 'source').state, 'invalid');
assert.equal(duplicateRoleEntries.qualification, 'invalid');

// Source/packet boundary guards.
assert.equal(plannerSource.includes('buildCanonicalTransitionAvailability'), true);
assert.equal(plannerSource.includes('buildCanonicalTransitionResultPlan'), true);
assert.equal(plannerSource.includes('projectPortableContractInstance'), false);
assert.equal(plannerSource.includes('validatePortableContractInstance'), false);
assert.equal(plannerSource.includes('Markdown Link'), false);
assert.equal(plannerSource.includes('createContinuationDraft'), false);
assert.equal(base.plan.readOnly, true);
assert.equal(base.plan.mutation, false);
assert.equal(base.plan.networkFetch, false);

console.log('PASS post-v421 canonical invocation/binding planner foundation');
