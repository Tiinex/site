import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';
import { buildCanonicalTransitionAvailability } from '../transitions/transition.availabilityPlanner.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const registrySource = fs.readFileSync(new URL('../transitions/transition.definitionRegistry.js', import.meta.url), 'utf8');
const plannerSource = fs.readFileSync(new URL('../transitions/transition.availabilityPlanner.js', import.meta.url), 'utf8');
const plannerSemanticSource = fs.readFileSync(new URL('../transitions/transition.availabilitySemantics.js', import.meta.url), 'utf8');

const authorities = { schemaAuthorities: {
  'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.non-artifact.v1': { targetKind: 'non-artifact', generation: true, fileNaming: true }
} };

function markdown({
  identity = ['- Name: Topic to Task', '- Version: 1', '- Canonical Identifier: topic-to-task'],
  purposeExtra = [],
  inputFields = ['  - Target Kind: artifact', '  - Schema Constraint: tiinex.topic.v1'],
  applicabilityFields = [
    '- Applicability Meaning: exactly one suitable source-topic may be bound.',
    '- Condition: source topic remains relevant',
    '- Condition Reference: [topic-relevance](../conditions/topic-relevance.trace.md)',
    '- Failure Meaning: required source cannot be resolved',
    '- Unknown Meaning: preserve unresolved source relevance'
  ],
  authoringFields = ['- Authoring Notes: read-only fixture']
} = {}) {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-16 00:00:00

---

# Topic To Task

## Transition Identity

${identity.join('\n')}

## Purpose And Scope

- Purpose: Create one Task from one Topic.
- Semantic Boundary: Reusable transition semantics only.
${purposeExtra.join('\n')}

## Input Roles

- source-topic
  - Meaning: Topic used as the continuity source.
  - Minimum Count: 1
  - Maximum Count: 1
${inputFields.join('\n')}
  - Acquisition Policy: existing-only

## Output Roles

- none

## Lifecycle And Continuity Effects

### Lifecycle Effects

- none

### Parent Effects

- none

## Relation Effects

- none

## Applicability And Conditions

${applicabilityFields.join('\n')}

## Authoring Bindings

${authoringFields.join('\n')}

## Placement Intent

### Destination Bindings

- none

### Output Placements

- none

## Interpretation Limits

- Does Not Prove: transition invocation or output existence.
- Must Not Be Inferred: mutation or execution authority.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function definitionRecord(sourceMarkdown, id = 'transition:topic-to-task') {
  return Object.assign(createRecordFromMarkdown(sourceMarkdown, {
    path: `.topics/transitions/${id}.trace.md`, sourceMode: 'source-backed'
  }), {
    id,
    source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' },
    sourceTarget: {
      sourceArtifactPath: `.topics/transitions/${id}.trace.md`,
      inputTarget: `https://github.com/Tiinex/docs/blob/main/.topics/transitions/${id}.trace.md`
    }
  });
}

function read(sourceMarkdown, resolvers = authorities, id = 'transition:topic-to-task') {
  return buildTransitionDefinitionRegistry({
    records: [definitionRecord(sourceMarkdown, id)],
    schemaMaterials: [rootContract, transitionContract],
    resolvers
  }).definitions[0];
}

function ordinaryField(definition, group, label) {
  return definition.ordinaryProjection.byGroup[group]?.fields?.find((field) => field.label === label);
}

// One coherent portable projection owns validation and ordinary/semantic instance truth.
assert.equal(registrySource.includes('projectPortableContractInstance({'), true);
assert.equal(registrySource.includes('validatePortableContractInstance'), false, 'registry must not run a parallel contract-instance validation pass');
assert.equal(registrySource.includes('readTransitionIdentity'), false, 'local Transition Identity Markdown parser must be removed');
assert.equal(registrySource.includes('exactHeadingBody'), false, 'document-wide heading fallback must be removed');

const baseMarkdown = markdown();
const baseBefore = baseMarkdown;
const rootBefore = rootContract;
const transitionBefore = transitionContract;
const base = read(baseMarkdown);
assert.equal(baseMarkdown, baseBefore, 'site read integration does not mutate Transition source Markdown');
assert.equal(rootContract, rootBefore, 'site read integration does not mutate Root contract material');
assert.equal(transitionContract, transitionBefore, 'site read integration does not mutate Transition contract material');
assert.equal(base.contractValidation.status, 'valid');
assert.equal(base.canonicalReadQualified, true);
assert.deepEqual(base.transitionIdentity, {
  Name: 'Topic to Task',
  Version: '1',
  'Canonical Identifier': 'topic-to-task'
});
assert.deepEqual(base.ordinaryProjection.groups.map((group) => group.group), [
  'Transition Identity',
  'Purpose And Scope',
  'Applicability And Conditions',
  'Authoring Bindings',
  'Interpretation Limits'
]);
assert.equal(base.ordinaryProjection.byGroup['Applicability And Conditions'].values['Applicability Meaning'], 'exactly one suitable source-topic may be bound.');
assert.equal(base.ordinaryProjection.byGroup['Applicability And Conditions'].values.Condition, 'source topic remains relevant');
assert.equal(base.ordinaryProjection.byGroup['Applicability And Conditions'].values['Condition Reference'], '[topic-relevance](../conditions/topic-relevance.trace.md)');
assert.equal(base.ordinaryProjection.byGroup['Applicability And Conditions'].values['Failure Meaning'], 'required source cannot be resolved');
assert.equal(base.ordinaryProjection.byGroup['Applicability And Conditions'].values['Unknown Meaning'], 'preserve unresolved source relevance');
assert.equal(base.applicability, 'not-evaluated');
assert.equal(base.executable, false);

// Transition Identity is scoped ordinary truth: wrong target cannot satisfy it.
const movedIdentity = read(markdown({
  identity: ['- Version: 1', '- Canonical Identifier: topic-to-task'],
  purposeExtra: ['- Name: Topic to Task']
}), authorities, 'transition:moved-identity');
assert.equal(movedIdentity.transitionIdentity.Name, undefined);
assert.equal(ordinaryField(movedIdentity, 'Transition Identity', 'Name').qualification, 'missing-required');
assert.equal(movedIdentity.contractValidation.status, 'incomplete');
assert.equal(movedIdentity.canonicalReadQualified, false);

// Duplicate ordinary scalar remains invalid; no first/last winner is projected.
const duplicateIdentity = read(markdown({
  identity: ['- Name: Topic to Task', '- Name: Other Name', '- Version: 1', '- Canonical Identifier: topic-to-task']
}), authorities, 'transition:duplicate-identity');
assert.equal(ordinaryField(duplicateIdentity, 'Transition Identity', 'Name').qualification, 'duplicate');
assert.equal(duplicateIdentity.transitionIdentity.Name, undefined);
assert.equal(duplicateIdentity.contractValidation.status, 'structurally-invalid');
assert.equal(duplicateIdentity.canonicalReadQualified, false);
assert(duplicateIdentity.diagnostics.some((item) => item.code === 'portable.contract.ordinary.field.duplicate'));

// Ordinary values are scoped to their authorized block; a same-label value elsewhere does not satisfy it.
const wrongApplicabilityBlock = read(markdown({
  applicabilityFields: ['- Condition: source topic remains relevant'],
  authoringFields: ['- Applicability Meaning: WRONG BLOCK', '- Authoring Notes: read-only fixture']
}), authorities, 'transition:wrong-applicability-block');
assert.equal(ordinaryField(wrongApplicabilityBlock, 'Applicability And Conditions', 'Applicability Meaning').qualification, 'missing-required');
assert.equal(wrongApplicabilityBlock.ordinaryProjection.byGroup['Applicability And Conditions'].values['Applicability Meaning'], undefined);
assert.equal(wrongApplicabilityBlock.ordinaryProjection.byGroup['Authoring Bindings'].values['Applicability Meaning'], undefined);
assert.equal(wrongApplicabilityBlock.contractValidation.status, 'incomplete');

// Declared Target Kind and resolved semantic classification remain separate.
const explicitRole = base.inputRoles[0];
assert.equal(explicitRole.fields['Target Kind'], 'artifact');
assert.equal(explicitRole.participantClassification.declared, 'artifact');
assert.equal(explicitRole.participantClassification.resolved, 'artifact');
assert.equal(explicitRole.participantClassification.qualification, 'agreement');
assert.equal(explicitRole.participantClassification.authority, 'explicit+schema-constraint');
assert.equal(explicitRole.participantClassification.schemaConstraint.schemaId, 'tiinex.topic.v1');
assert.equal(explicitRole.participantClassification.schemaConstraint.qualification, 'resolved');

const derived = read(markdown({
  inputFields: ['  - Schema Constraint: tiinex.topic.v1']
}), authorities, 'transition:derived-target-kind');
assert.equal(Object.prototype.hasOwnProperty.call(derived.inputRoles[0].fields, 'Target Kind'), false, 'resolved classification must not rewrite declared fields');
assert.equal(derived.inputRoles[0].participantClassification.declared, '');
assert.equal(derived.inputRoles[0].participantClassification.resolved, 'artifact');
assert.equal(derived.inputRoles[0].participantClassification.qualification, 'resolved-by-authority');
assert.equal(derived.inputRoles[0].participantClassification.authority, 'schema-constraint');

const contradiction = read(markdown({
  inputFields: ['  - Target Kind: artifact', '  - Schema Constraint: tiinex.non-artifact.v1']
}), authorities, 'transition:classification-contradiction');
assert.equal(contradiction.inputRoles[0].fields['Target Kind'], 'artifact');
assert.equal(contradiction.inputRoles[0].participantClassification.declared, 'artifact');
assert.equal(contradiction.inputRoles[0].participantClassification.resolved, '');
assert.equal(contradiction.inputRoles[0].participantClassification.qualification, 'contradictory');
assert.equal(contradiction.contractValidation.status, 'contradictory');
assert.equal(contradiction.canonicalReadQualified, false);
assert(contradiction.diagnostics.some((item) => item.code === 'portable.contract.classification.contradiction'));

const unknown = read(markdown({
  inputFields: ['  - Target Kind: unknown', '  - Schema Constraint: tiinex.topic.v1']
}), authorities, 'transition:classification-unknown');
assert.equal(unknown.inputRoles[0].fields['Target Kind'], 'unknown');
assert.equal(unknown.inputRoles[0].participantClassification.declared, 'unknown');
assert.equal(unknown.inputRoles[0].participantClassification.resolved, 'unknown');
assert.equal(unknown.inputRoles[0].participantClassification.qualification, 'preserved-unknown');
assert(unknown.diagnostics.some((item) => item.code === 'portable.contract.unknown.preserved' && item.field === 'Target Kind'));

// Named declaration content remains declaration truth, never an ordinary-group value fallback.
assert.equal(base.inputRoles[0].fields.Meaning, 'Topic used as the continuity source.');
assert.equal(base.ordinaryProjection.groups.some((group) => Object.values(group.values).includes('Topic used as the continuity source.')), false);

// The post-v416 planner now consumes this read seam without changing the read projection itself.
const topicRecord = Object.assign(createRecordFromMarkdown(`# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.topic.v1
  - Created At: 2026-08-16 00:00:00

---

# Topic
`, {
  path: '.topics/topic.trace.md', sourceMode: 'local'
}), { id: 'topic:1', workspaceId: 'w' });
const participantIndex = buildLoadedArtifactParticipantIndex({ state: { workspaces: [{ id: 'w', records: [topicRecord] }] } });
const plan = buildCanonicalTransitionAvailability({ definition: base, participantIndex });
assert.equal(plan.inputRoles[0].targetKind, 'artifact');
assert.equal(plan.inputRoles[0].effectiveParticipantKind, 'artifact');
assert.equal(plan.inputRoles[0].participantClassification.qualification, 'agreement');
assert.equal(plan.inputRoles[0].cleanCandidateCount, 1);
assert.equal(plan.roleBasedAvailability, 'available');
assert.equal(plan.transitionApplicability.condition, 'source topic remains relevant');
assert.equal(plan.transitionApplicability.conditionReference, '[topic-relevance](../conditions/topic-relevance.trace.md)');
assert.equal(plan.transitionApplicability.conditionQualification.state, 'unresolved');
assert.equal(plan.availability, 'unresolved', 'transition-level canonical Condition now governs final planner availability without execution');
assert.equal(plan.executable, false);
assert.equal(plannerSource.includes("from './transition.availabilitySemantics.js'"), true, 'planner delegates resolved read semantics to its bounded semantic owner');
assert.equal(plannerSemanticSource.includes('participantClassification'), true, 'semantic owner consumes resolved Target Kind from the stable read model');
assert.equal(plannerSemanticSource.includes("ordinaryProjection?.byGroup?.['Applicability And Conditions']"), true, 'semantic owner consumes scoped ordinary Condition projection');
assert.equal(plannerSource.includes('parseArtifactMarkdown'), false, 'planner does not add a Transition Markdown parser');
assert.equal(plannerSemanticSource.includes('parseArtifactMarkdown'), false, 'semantic owner does not add a Transition Markdown parser');

console.log('✓ post-v414 resolved contract-instance read projection integration tests passed');
