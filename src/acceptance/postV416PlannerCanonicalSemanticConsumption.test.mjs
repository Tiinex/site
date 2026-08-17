import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';
import { buildCanonicalTransitionAvailability } from '../transitions/transition.availabilityPlanner.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const plannerSource = fs.readFileSync(new URL('../transitions/transition.availabilityPlanner.js', import.meta.url), 'utf8');
const semanticSource = fs.readFileSync(new URL('../transitions/transition.availabilitySemantics.js', import.meta.url), 'utf8');

const authorities = { schemaAuthorities: {
  'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.comment.v1': { targetKind: 'non-artifact' },
  'tiinex.signal.v1': { targetKind: 'artifact' },
  'tiinex.feedback.v1': { targetKind: 'artifact' }
} };

function transitionMarkdown({
  id = 'semantic-consumption',
  targetKind = 'artifact',
  schemaConstraint = 'tiinex.topic.v1',
  acquisitionPolicy = 'existing-only',
  minimum = '1',
  maximum = '1',
  roleCondition = '',
  roleConditionReference = '',
  applicabilityMeaning = 'Role/cardinality truth determines availability.',
  transitionCondition = '',
  transitionConditionReference = '',
  failureMeaning = 'Required participant unavailable.',
  unknownMeaning = 'Preserve unresolved truth.',
  authoringExtra = []
} = {}) {
  const roleFields = [
    '  - Meaning: Semantic source participant.',
    `  - Minimum Count: ${minimum}`,
    `  - Maximum Count: ${maximum}`,
    ...(targetKind === null ? [] : [`  - Target Kind: ${targetKind}`]),
    ...(schemaConstraint === null ? [] : [`  - Schema Constraint: ${schemaConstraint}`]),
    ...(acquisitionPolicy === null ? [] : [`  - Acquisition Policy: ${acquisitionPolicy}`]),
    ...(roleCondition ? [`  - Condition: ${roleCondition}`] : []),
    ...(roleConditionReference ? [`  - Condition Reference: ${roleConditionReference}`] : [])
  ];
  const applicability = [
    `- Applicability Meaning: ${applicabilityMeaning}`,
    ...(transitionCondition ? [`- Condition: ${transitionCondition}`] : []),
    ...(transitionConditionReference ? [`- Condition Reference: ${transitionConditionReference}`] : []),
    `- Failure Meaning: ${failureMeaning}`,
    `- Unknown Meaning: ${unknownMeaning}`
  ];
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

- Purpose: Read-only planner semantic-consumption fixture.
- Semantic Boundary: Availability planning only.

## Input Roles

- source
${roleFields.join('\n')}

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

${applicability.join('\n')}

## Authoring Bindings

- Authoring Notes: fixture
${authoringExtra.join('\n')}

## Placement Intent

### Destination Bindings

- none

### Output Placements

- none

## Interpretation Limits

- Does Not Prove: execution.
- Must Not Be Inferred: mutation.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function definitionRecord(markdown, id) {
  return Object.assign(createRecordFromMarkdown(markdown, {
    path: `.topics/transitions/${id}.trace.md`, sourceMode: 'source-backed'
  }), {
    id: `transition:${id}`,
    source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' },
    sourceTarget: { sourceArtifactPath: `.topics/transitions/${id}.trace.md` }
  });
}

function readDefinition(options = {}, resolvers = authorities) {
  const id = options.id || 'semantic-consumption';
  const markdown = transitionMarkdown(options);
  const registry = buildTransitionDefinitionRegistry({
    records: [definitionRecord(markdown, id)],
    schemaMaterials: [rootContract, transitionContract],
    resolvers
  });
  return registry.definitions[0];
}

function artifactRecord(id, schemaId, workspaceId = 'w') {
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-16 00:00:00\n\n---\n\n# ${id}\n\nReadable participant.\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `.topics/${id}.trace.md`, sourceMode: 'local' }), {
    id,
    workspaceId,
    source: { id: 'local-session', adapterId: 'local' }
  });
}

function index(records = []) { return buildLoadedArtifactParticipantIndex({ records }); }
function plan(definition, participantIndex = index(), currentArtifact) {
  return buildCanonicalTransitionAvailability({ definition, participantIndex, currentArtifact });
}
function sourceRole(result) { return result.inputRoles.find((role) => role.name === 'source'); }

const topic = artifactRecord('topic', 'tiinex.topic.v1');
const topicIndex = index([topic]);

// 1. Explicit artifact remains ordinary exact-schema Artifact planning.
const explicitArtifactDefinition = readDefinition({ id: 'explicit-artifact' });
const explicitArtifact = plan(explicitArtifactDefinition, topicIndex);
assert.equal(explicitArtifact.availability, 'available');
assert.equal(sourceRole(explicitArtifact).targetKind, 'artifact');
assert.equal(sourceRole(explicitArtifact).effectiveParticipantKind, 'artifact');
assert.equal(sourceRole(explicitArtifact).participantClassification.qualification, 'agreement');
assert.equal(sourceRole(explicitArtifact).schemaConstraintQualification, 'resolved');
assert.equal(sourceRole(explicitArtifact).cleanCandidateCount, 1);

// 2. Omitted Target Kind + schema authority artifact now uses the Artifact index.
const derivedArtifactDefinition = readDefinition({ id: 'derived-artifact', targetKind: null });
assert.equal(Object.prototype.hasOwnProperty.call(derivedArtifactDefinition.inputRoles[0].fields, 'Target Kind'), false);
assert.equal(derivedArtifactDefinition.inputRoles[0].participantClassification.resolved, 'artifact');
assert.equal(derivedArtifactDefinition.inputRoles[0].participantClassification.qualification, 'resolved-by-authority');
const derivedArtifact = plan(derivedArtifactDefinition, topicIndex, topic);
assert.equal(sourceRole(derivedArtifact).targetKind, '', 'declared Target Kind remains absent');
assert.equal(sourceRole(derivedArtifact).effectiveParticipantKind, 'artifact');
assert.equal(sourceRole(derivedArtifact).cleanCandidateCount, 1);
assert.equal(derivedArtifact.availability, 'available');
assert.equal(derivedArtifact.context.assignment, 'unique');
assert.deepEqual(derivedArtifact.context.candidateRoleIds, ['source']);

// 3. Omitted Target Kind + schema authority non-artifact never substitutes from Artifact index.
const derivedNonArtifactDefinition = readDefinition({
  id: 'derived-non-artifact', targetKind: null, schemaConstraint: 'tiinex.comment.v1', acquisitionPolicy: 'invocation-provided'
});
const derivedNonArtifact = plan(derivedNonArtifactDefinition, topicIndex);
assert.equal(sourceRole(derivedNonArtifact).targetKind, '');
assert.equal(sourceRole(derivedNonArtifact).effectiveParticipantKind, 'non-artifact');
assert.equal(sourceRole(derivedNonArtifact).participantClassification.qualification, 'resolved-by-authority');
assert.equal(sourceRole(derivedNonArtifact).cleanCandidateCount, 0);
assert.equal(sourceRole(derivedNonArtifact).invocationInputQualification.state, 'required');
assert.equal(derivedNonArtifact.availability, 'available');

// 4. Explicit artifact + resolved authority agreement remains artifact.
assert.equal(sourceRole(explicitArtifact).participantClassification.declared, 'artifact');
assert.equal(sourceRole(explicitArtifact).participantClassification.resolved, 'artifact');
assert.equal(sourceRole(explicitArtifact).participantClassification.authority, 'explicit+schema-constraint');

// 5. Explicit artifact + unresolved schema authority preserves representation but cannot claim suitability from raw schema-id equality.
const unresolvedSchemaDefinition = readDefinition({ id: 'unresolved-schema', schemaConstraint: 'tiinex.unresolved.v1' }, { schemaAuthorities: {} });
assert.equal(unresolvedSchemaDefinition.inputRoles[0].participantClassification.declared, 'artifact');
assert.equal(unresolvedSchemaDefinition.inputRoles[0].participantClassification.resolved, 'artifact');
assert.equal(unresolvedSchemaDefinition.inputRoles[0].participantClassification.schemaConstraint.qualification, 'unresolved');
const unresolvedSchemaPlannerFixture = Object.freeze({ ...unresolvedSchemaDefinition, canonicalReadQualified: true });
const sameRawSchema = artifactRecord('same-raw-schema', 'tiinex.unresolved.v1');
const unresolvedSchemaPlan = plan(unresolvedSchemaPlannerFixture, index([sameRawSchema]), sameRawSchema);
assert.equal(sourceRole(unresolvedSchemaPlan).effectiveParticipantKind, 'artifact');
assert.equal(sourceRole(unresolvedSchemaPlan).schemaConstraintQualification, 'unresolved');
assert.equal(sourceRole(unresolvedSchemaPlan).cleanCandidateCount, 0, 'raw schema-id equality is not suitable evidence when schema authority is unresolved');
assert.equal(sourceRole(unresolvedSchemaPlan).availability, 'unresolved');
assert.equal(unresolvedSchemaPlan.context.assignment, 'unresolved');
assert.deepEqual(unresolvedSchemaPlan.context.candidateRoleIds, []);
assert.deepEqual(unresolvedSchemaPlan.context.unresolvedRoleIds, ['source']);

// 6. Literal unknown remains unresolved and does not inspect Artifact index.
const unknownKindDefinition = readDefinition({ id: 'unknown-kind', targetKind: 'unknown' });
const unknownKind = plan(unknownKindDefinition, topicIndex, topic);
assert.equal(sourceRole(unknownKind).targetKind, 'unknown');
assert.equal(sourceRole(unknownKind).effectiveParticipantKind, '');
assert.equal(sourceRole(unknownKind).participantClassification.qualification, 'preserved-unknown');
assert.equal(sourceRole(unknownKind).cleanCandidateCount, 0);
assert.deepEqual(sourceRole(unknownKind).inspectableMatchingParticipantIds, []);
assert.equal(unknownKind.availability, 'unresolved');
assert.equal(unknownKind.context.assignment, 'unresolved');

// 7. Contradictory classification remains blocked by canonical read qualification; no winner is selected.
const contradictoryDefinition = readDefinition({ id: 'contradictory', targetKind: 'artifact', schemaConstraint: 'tiinex.comment.v1' });
assert.equal(contradictoryDefinition.canonicalReadQualified, false);
assert.equal(contradictoryDefinition.inputRoles[0].participantClassification.qualification, 'contradictory');
const contradictoryPlan = plan(contradictoryDefinition, topicIndex);
assert.equal(contradictoryPlan.availability, 'blocked');
assert.equal(contradictoryPlan.inputRoles.length, 0);

// 8–10. Current context uses resolved kind, never guesses unresolved classification/schema restriction.
assert.equal(derivedArtifact.context.assignment, 'unique');
const unresolvedClassificationDefinition = readDefinition({ id: 'unresolved-classification', targetKind: null, schemaConstraint: null });
assert.equal(unresolvedClassificationDefinition.canonicalReadQualified, true);
const unresolvedClassification = plan(unresolvedClassificationDefinition, topicIndex, topic);
assert.equal(sourceRole(unresolvedClassification).participantClassification.qualification, 'unresolved');
assert.equal(unresolvedClassification.context.assignment, 'unresolved');
assert.deepEqual(unresolvedClassification.context.candidateRoleIds, []);
assert.deepEqual(unresolvedClassification.context.unresolvedRoleIds, ['source']);
assert.equal(unresolvedSchemaPlan.context.assignment, 'unresolved');

// 11. No transition-level Condition/Reference preserves ordinary role-based availability.
const noTransitionCondition = plan(readDefinition({ id: 'no-transition-condition' }), topicIndex);
assert.equal(noTransitionCondition.transitionApplicability.conditionQualification.state, 'active');
assert.equal(noTransitionCondition.roleBasedAvailability, 'available');
assert.equal(noTransitionCondition.availability, 'available');

// 12–14. Transition-level Condition/Reference are preserved, never executed, and dominate final availability.
const transitionConditionOnly = plan(readDefinition({ id: 'transition-condition', transitionCondition: 'external semantic condition' }), topicIndex);
assert.equal(transitionConditionOnly.transitionApplicability.condition, 'external semantic condition');
assert.equal(transitionConditionOnly.transitionApplicability.conditionReference, '');
assert.equal(transitionConditionOnly.transitionApplicability.conditionQualification.state, 'unresolved');
assert.equal(transitionConditionOnly.transitionApplicability.conditionQualification.reason, 'transition-condition-not-evaluated');
assert.equal(transitionConditionOnly.roleBasedAvailability, 'available');
assert.equal(transitionConditionOnly.availability, 'unresolved');

const transitionReferenceOnly = plan(readDefinition({ id: 'transition-reference', transitionConditionReference: '[condition](../condition.trace.md)' }), topicIndex);
assert.equal(transitionReferenceOnly.transitionApplicability.condition, '');
assert.equal(transitionReferenceOnly.transitionApplicability.conditionReference, '[condition](../condition.trace.md)');
assert.equal(transitionReferenceOnly.availability, 'unresolved');

const bothTransitionConditions = plan(readDefinition({
  id: 'transition-both', transitionCondition: 'readable restatement', transitionConditionReference: '[authority](../authority.trace.md)'
}), topicIndex);
assert.equal(bothTransitionConditions.transitionApplicability.condition, 'readable restatement');
assert.equal(bothTransitionConditions.transitionApplicability.conditionReference, '[authority](../authority.trace.md)');
assert.equal(bothTransitionConditions.availability, 'unresolved');
assert.equal(bothTransitionConditions.executable, false);

// 15. Whole-transition unresolved condition dominates a subordinate unavailable-current-index result.
const transitionConditionMissingRole = plan(readDefinition({ id: 'transition-condition-missing', transitionCondition: 'not evaluated' }), index());
assert.equal(sourceRole(transitionConditionMissingRole).availability, 'unavailable-current-index');
assert.equal(transitionConditionMissingRole.roleBasedAvailability, 'unavailable-current-index');
assert.equal(transitionConditionMissingRole.availability, 'unresolved');

// 16. Human-readable applicability/failure/unknown prose is projected literally, never parsed as planner controls.
const proseTruth = plan(readDefinition({
  id: 'prose-truth', applicabilityMeaning: 'false', failureMeaning: 'blocked', unknownMeaning: 'unavailable-current-index'
}), topicIndex);
assert.equal(proseTruth.transitionApplicability.applicabilityMeaning, 'false');
assert.equal(proseTruth.transitionApplicability.failureMeaning, 'blocked');
assert.equal(proseTruth.transitionApplicability.unknownMeaning, 'unavailable-current-index');
assert.equal(proseTruth.availability, 'available');

// Wrong-H2 Condition is not recovered by the planner from document-wide text.
const wrongH2 = plan(readDefinition({ id: 'wrong-h2-condition', authoringExtra: ['- Condition: WRONG-H2'] }), topicIndex);
assert.equal(wrongH2.transitionApplicability.condition, '');
assert.equal(wrongH2.transitionApplicability.conditionQualification.state, 'active');
assert.equal(wrongH2.availability, 'available');

// 17. Existing role-level Condition behavior remains unresolved.
const roleCondition = plan(readDefinition({ id: 'role-condition', roleCondition: 'role condition not evaluated' }), topicIndex);
assert.equal(sourceRole(roleCondition).participation, 'unresolved');
assert.equal(sourceRole(roleCondition).availability, 'unresolved');
assert.equal(roleCondition.availability, 'unresolved');

// 18. No schema assignability: exact mismatch remains unavailable even though both schemas classify as artifact.
const feedback = artifactRecord('feedback', 'tiinex.feedback.v1');
const exactSignalDefinition = readDefinition({ id: 'exact-signal', schemaConstraint: 'tiinex.signal.v1' });
const exactOnly = plan(exactSignalDefinition, index([feedback]));
assert.equal(sourceRole(exactOnly).effectiveParticipantKind, 'artifact');
assert.equal(sourceRole(exactOnly).schemaConstraintQualification, 'resolved');
assert.equal(sourceRole(exactOnly).cleanCandidateCount, 0);
assert.equal(exactOnly.availability, 'unavailable-current-index');

// 19. Producer-needed semantics remain non-recursive.
const producing = plan(readDefinition({ id: 'producer-needed', acquisitionPolicy: 'existing-or-create' }), index());
assert.equal(sourceRole(producing).availability, 'unresolved-needs-producing-transition');
assert.equal(producing.availability, 'unresolved');
assert(sourceRole(producing).reasons.includes('producing-transition-required'));

// 20–21. Every result is read-only/non-executable and the planner adds no Markdown/Tooling parser authority.
for (const result of [
  explicitArtifact, derivedArtifact, derivedNonArtifact, unresolvedSchemaPlan, unknownKind, contradictoryPlan,
  unresolvedClassification, noTransitionCondition, transitionConditionOnly, transitionReferenceOnly,
  bothTransitionConditions, transitionConditionMissingRole, proseTruth, wrongH2, roleCondition, exactOnly, producing
]) {
  assert.equal(result.executable, false);
  assert.equal(result.readOnly, true);
  assert.equal(result.mutation, false);
  assert.equal(result.networkFetch, false);
}
for (const source of [plannerSource, semanticSource]) {
  assert.equal(source.includes('parseArtifactMarkdown'), false);
  assert.equal(source.includes('projectPortableContractInstance'), false);
  assert.equal(source.includes('resolveSchemaAuthority'), false);
}
assert.equal(plannerSource.includes("from './transition.availabilitySemantics.js'"), true, 'planner delegates canonical read semantics to the bounded semantic owner');
assert.equal(semanticSource.includes('participantClassification'), true, 'semantic owner consumes v416 participant classification read truth');
assert.equal(semanticSource.includes("ordinaryProjection?.byGroup?.['Applicability And Conditions']"), true, 'semantic owner consumes scoped ordinary applicability read truth');

console.log('✓ post-v416 planner canonical semantic consumption tests passed');
