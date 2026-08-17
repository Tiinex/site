import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';
import { buildCanonicalTransitionResultPlan } from '../transitions/transition.resultSemantics.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');

const resolvers = { schemaAuthorities: {
  'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.signal.v1': { targetKind: 'artifact', generation: true, fileNaming: true }
} };

function markdown({
  id,
  logicalContinuity = 'new-subject',
  preserveWhy = 'yes',
  explicitOverrideAllowed = 'no',
  lifecycleTarget = 'result',
  lifecycleResult = '',
  lifecycleCondition = '',
  lifecycleEffect = 'create-new',
  lifecycleEffectMeaning = 'Introduce the declared result as a new semantic subject.',
  memberMapping = 'single',
  mappingKey = 'stable-id',
  mappingMeaning = 'Invocation supplies semantic member association.',
  parentEffect = 'set',
  parentBinding = 'source',
  destinationRequired = 'yes',
  placementDestination = 'destination',
  namingAuthority = 'target-schema',
  namingAuthorityReference = ''
}) {
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

- Purpose: Result qualification closure fixture.
- Semantic Boundary: Read-only result qualification only.

## Input Roles

- source
  - Meaning: Existing semantic source.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Acquisition Policy: existing-only

## Output Roles

- result
  - Meaning: Transition result.
  - Minimum Count: 1
  - Maximum Count: 1
  - Schema Constraint: tiinex.signal.v1
  - Generation Binding: target-schema
  - Selection Notes: semantic output only.

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-result
  - Target Binding: ${lifecycleTarget}
${lifecycleResult ? `  - Result Binding: ${lifecycleResult}\n` : ''}  - Effect: ${lifecycleEffect}
  - Logical Continuity: ${logicalContinuity}
${lifecycleEffectMeaning ? `  - Effect Meaning: ${lifecycleEffectMeaning}\n` : ''}  - Required Materialization Operation: create
  - Preserve Why: ${preserveWhy}
  - Member Mapping: ${memberMapping}
${mappingKey ? `  - Mapping Key: ${mappingKey}\n` : ''}${mappingMeaning ? `  - Mapping Meaning: ${mappingMeaning}\n` : ''}${lifecycleCondition ? `  - Condition: ${lifecycleCondition}\n` : ''}  - Notes: declarative only.

### Parent Effects

- result-parent
  - Output Binding: result
  - Effect: ${parentEffect}
${parentBinding ? `  - Parent Binding: ${parentBinding}\n` : ''}  - Member Mapping: single
  - Notes: parent declaration only.

## Relation Effects

- source-to-result
  - Effect: declare
  - Subject Binding: result
  - Predicate Identifier: derived-from
  - Predicate Meaning: Result is semantically derived from source.
  - Object Binding: source
  - Directionality: directed
  - Predicate Label: derived from
  - Member Mapping: pairwise
  - Mapping Meaning: Invocation supplies explicit pairs.
  - Notes: no relation materialization.

## Applicability And Conditions

- Applicability Meaning: Input planning is owned by the frozen availability planner.
- Failure Meaning: Preserve unresolved semantics.
- Unknown Meaning: Never guess execution.

## Authoring Bindings

- Interaction Unit: semantic-authoring
- Schema Module: generic-transition-authoring
- Presentation Surface: portable-read-model
- Authoring Notes: Guidance only.

## Placement Intent

### Destination Bindings

- destination
  - Meaning: Invocation-selected output destination.
  - Required: ${destinationRequired}
  - Destination Kind: workspace-root
  - Capability Requirement: write
  - Notes: definition origin does not satisfy this slot.

### Output Placements

- result-placement
  - Output Binding: result
${placementDestination ? `  - Destination Binding: ${placementDestination}\n` : ''}  - Placement Intent: new-materialization
  - Naming Authority: ${namingAuthority}
${namingAuthorityReference ? `  - Naming Authority Reference: ${namingAuthorityReference}\n` : ''}  - Relative To Binding: source
  - Relative Placement Meaning: Place result relative to source.
  - Explicit Override Allowed: ${explicitOverrideAllowed}
  - Notes: path resolution is later.

## Interpretation Limits

- Does Not Prove: invocation, generation, materialization, Parent mutation, relation materialization, or execution.
- Must Not Be Inferred: concrete path or participant member association.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function readDefinition(options) {
  const id = options.id;
  const source = markdown(options);
  const record = Object.assign(createRecordFromMarkdown(source, {
    path: `.topics/transitions/${id}.trace.md`, sourceMode: 'source-backed'
  }), {
    id: `transition:${id}`,
    source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' },
    sourceTarget: { sourceArtifactPath: `.topics/transitions/${id}.trace.md` }
  });
  return buildTransitionDefinitionRegistry({
    records: [record], schemaMaterials: [rootContract, transitionContract], resolvers
  }).definitions[0];
}

function plan(options) {
  const definition = readDefinition(options);
  assert.equal(definition.canonicalReadQualified, true, `${options.id}: fixture must remain canonically readable`);
  return buildCanonicalTransitionResultPlan({ definition });
}

function hasReason(result, reason) {
  assert.equal(result.reasons.includes(reason), true, `expected reason ${reason}; got ${JSON.stringify(result.reasons)}`);
}

// Positive oracle remains fully qualified when all local result semantics are resolved.
const base = plan({ id: 'qualified-base' });
assert.equal(base.qualification, 'qualified');
assert.equal(base.outputRoles[0].lifecycleCoverage.state, 'present');
assert.equal(base.destinationBindings[0].placementCoverage.state, 'present');

// A. Explicit unresolved lifecycle continuity truth must remain unresolved.
const logicalUnknown = plan({ id: 'logical-unknown', logicalContinuity: 'unknown' });
assert.equal(logicalUnknown.lifecycleEffects[0].logicalContinuity, 'unknown');
assert.equal(logicalUnknown.qualification, 'unresolved');
hasReason(logicalUnknown, 'lifecycle:create-result:logical-continuity-unresolved');

// B. Preserve Why unknown is unresolved policy truth.
const preserveUnknown = plan({ id: 'preserve-unknown', preserveWhy: 'unknown' });
assert.equal(preserveUnknown.qualification, 'unresolved');
hasReason(preserveUnknown, 'lifecycle:create-result:preserve-why-unresolved');

// C. Explicit Override Allowed unknown is unresolved placement policy truth.
const overrideUnknown = plan({ id: 'override-unknown', explicitOverrideAllowed: 'unknown' });
assert.equal(overrideUnknown.outputPlacements[0].explicitOverrideAllowed, 'unknown');
assert.equal(overrideUnknown.qualification, 'unresolved');
hasReason(overrideUnknown, 'placement:result-placement:explicit-override-unresolved');

// D. Every Output Role requires lifecycle coverage; no effect is inferred.
const uncoveredOutput = plan({ id: 'uncovered-output', lifecycleTarget: 'source' });
assert.equal(uncoveredOutput.outputRoles[0].lifecycleCoverage.state, 'missing');
assert.deepEqual(uncoveredOutput.outputRoles[0].lifecycleCoverage.effectNames, []);
assert.equal(uncoveredOutput.qualification, 'unresolved');
hasReason(uncoveredOutput, 'output-role:result:lifecycle-coverage-missing');

// E. Conditional-only lifecycle coverage remains unresolved, not missing.
const conditionalCoverage = plan({ id: 'conditional-coverage', lifecycleCondition: 'runtime condition is not evaluated' });
assert.equal(conditionalCoverage.outputRoles[0].lifecycleCoverage.state, 'unresolved');
assert.deepEqual(conditionalCoverage.outputRoles[0].lifecycleCoverage.unresolvedEffectNames, ['create-result']);
assert.equal(conditionalCoverage.qualification, 'unresolved');
hasReason(conditionalCoverage, 'output-role:result:lifecycle-coverage-unresolved');

// F. Parent set requires a resolved Parent Binding.
const parentSetAbsent = plan({ id: 'parent-set-absent', parentBinding: '' });
assert.equal(parentSetAbsent.parentEffects[0].parentBinding.qualification, 'absent');
assert.equal(parentSetAbsent.parentEffects[0].semanticQualification.state, 'unresolved');
hasReason(parentSetAbsent, 'parent:result-parent:parent-binding-required');

// G. Parent replace with an unresolved binding remains unresolved; no first-match substitution.
const parentReplaceDefinition = readDefinition({ id: 'parent-replace-base', parentEffect: 'replace', parentBinding: 'source' });
assert.equal(parentReplaceDefinition.canonicalReadQualified, true);
const parentReplaceMalformedDefinition = Object.freeze({
  ...parentReplaceDefinition,
  parentEffects: Object.freeze([
    Object.freeze({
      ...parentReplaceDefinition.parentEffects[0],
      fields: Object.freeze({ ...parentReplaceDefinition.parentEffects[0].fields, 'Parent Binding': 'missing-role' })
    })
  ])
});
const parentReplaceTypo = buildCanonicalTransitionResultPlan({ definition: parentReplaceMalformedDefinition });
assert.equal(parentReplaceTypo.parentEffects[0].parentBinding.qualification, 'unresolved');
assert.equal(parentReplaceTypo.parentEffects[0].parentBinding.resolvedName, '');
hasReason(parentReplaceTypo, 'parent:result-parent:parent-binding-required');

// H. Preserve/clear does not make Parent Binding globally required.
const parentPreserve = plan({ id: 'parent-preserve', parentEffect: 'preserve', parentBinding: '' });
assert.equal(parentPreserve.parentEffects[0].parentBinding.qualification, 'absent');
assert.equal(parentPreserve.parentEffects[0].semanticQualification.state, 'qualified');
assert.equal(parentPreserve.qualification, 'qualified');

const parentClear = plan({ id: 'parent-clear', parentEffect: 'clear', parentBinding: '' });
assert.equal(parentClear.parentEffects[0].semanticQualification.state, 'qualified');
assert.equal(parentClear.qualification, 'qualified');

// I–J. Required Destination must be consumed by at least one exact Output Placement reference.
const destinationUnused = plan({ id: 'destination-unused', placementDestination: '' });
assert.equal(destinationUnused.destinationBindings[0].requiredQualification.state, 'required');
assert.equal(destinationUnused.destinationBindings[0].placementCoverage.state, 'missing');
assert.equal(destinationUnused.qualification, 'unresolved');
hasReason(destinationUnused, 'destination:destination:required-placement-missing');

assert.equal(base.destinationBindings[0].placementCoverage.state, 'present');
assert.equal(base.qualification, 'qualified');

// K–L. External naming authority requires a declared reference, but never fetches/resolves it here.
const externalNamingMissing = plan({ id: 'external-naming-missing', namingAuthority: 'external-authority', namingAuthorityReference: '' });
assert.equal(externalNamingMissing.outputPlacements[0].namingQualification.state, 'unresolved');
hasReason(externalNamingMissing, 'placement:result-placement:naming-authority-reference-required');

const externalNamingReferenced = plan({ id: 'external-naming-referenced', namingAuthority: 'external-authority', namingAuthorityReference: '[naming authority](../naming.trace.md)' });
assert.equal(externalNamingReferenced.outputPlacements[0].namingAuthorityReference, '[naming authority](../naming.trace.md)');
assert.equal(externalNamingReferenced.outputPlacements[0].namingQualification.state, 'not-evaluated');
assert.equal(externalNamingReferenced.outputPlacements[0].concretePath, null);
assert.equal(externalNamingReferenced.qualification, 'qualified');

// M. Lifecycle custom requires Effect Meaning locally before result semantics can be qualified.
const customEffectMissingMeaning = plan({ id: 'custom-effect-missing-meaning', lifecycleEffect: 'custom', lifecycleEffectMeaning: '' });
assert.equal(customEffectMissingMeaning.lifecycleEffects[0].effect, 'custom');
assert.equal(customEffectMissingMeaning.lifecycleEffects[0].effectMeaning, '');
hasReason(customEffectMissingMeaning, 'lifecycle:create-result:effect-meaning-required');

// N. Member Mapping custom requires Mapping Meaning.
const customMappingMissingMeaning = plan({ id: 'custom-mapping-missing-meaning', memberMapping: 'custom', mappingMeaning: '' });
assert.equal(customMappingMissingMeaning.lifecycleEffects[0].memberMapping.semanticQualification.state, 'unresolved');
hasReason(customMappingMissingMeaning, 'lifecycle:create-result:member-mapping-meaning-required');

// O. Member Mapping by-key requires Mapping Key.
const byKeyMissingKey = plan({ id: 'by-key-missing-key', memberMapping: 'by-key', mappingKey: '' });
assert.equal(byKeyMissingKey.lifecycleEffects[0].memberMapping.semanticQualification.state, 'unresolved');
hasReason(byKeyMissingKey, 'lifecycle:create-result:member-mapping-key-required');

for (const result of [
  base, logicalUnknown, preserveUnknown, overrideUnknown, uncoveredOutput, conditionalCoverage,
  parentSetAbsent, parentReplaceTypo, parentPreserve, parentClear, destinationUnused,
  externalNamingMissing, externalNamingReferenced, customEffectMissingMeaning,
  customMappingMissingMeaning, byKeyMissingKey
]) {
  assert.equal(result.readOnly, true);
  assert.equal(result.mutation, false);
  assert.equal(result.networkFetch, false);
  assert.equal(result.executable, false);
}

console.log('postV419CanonicalTransitionResultSemanticsQualificationClosure: pass');
