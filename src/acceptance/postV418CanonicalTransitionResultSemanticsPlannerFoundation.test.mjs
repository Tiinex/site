import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';
import { buildCanonicalTransitionResultPlan } from '../transitions/transition.resultSemantics.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const resultSource = fs.readFileSync(new URL('../transitions/transition.resultSemantics.js', import.meta.url), 'utf8');

const authorities = { schemaAuthorities: {
  'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.signal.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.comment.v1': { targetKind: 'non-artifact' }
} };

function markdown({
  id = 'result-semantics',
  outputTargetKind = null,
  outputSchema = 'tiinex.signal.v1',
  generationBinding = 'target-schema',
  lifecycleCondition = '',
  lifecycleConditionReference = '',
  lifecycleTarget = 'result',
  parentBinding = 'source',
  relationAuthority = '',
  relationVocabulary = '',
  placementIntent = 'new-materialization',
  placementNamingAuthority = 'target-schema',
  memberMapping = 'single',
  outputRoles = true,
  effects = true
} = {}) {
  const output = outputRoles ? `- result
  - Meaning: Transition result.
  - Minimum Count: 1
  - Maximum Count: 1
${outputTargetKind === null ? '' : `  - Target Kind: ${outputTargetKind}\n`}${outputSchema ? `  - Schema Constraint: ${outputSchema}\n` : ''}${generationBinding ? `  - Generation Binding: ${generationBinding}\n` : ''}  - Selection Notes: semantic output only.` : '- none';
  const lifecycle = effects ? `- create-result
  - Target Binding: ${lifecycleTarget}
  - Effect: create-new
  - Logical Continuity: new-subject
  - Effect Meaning: Introduce the declared result as a new semantic subject.
  - Required Materialization Operation: create
  - Preserve Why: yes
  - Member Mapping: ${memberMapping}
  - Mapping Key: stable-id
  - Mapping Meaning: Invocation supplies semantic member association.
${lifecycleCondition ? `  - Condition: ${lifecycleCondition}\n` : ''}${lifecycleConditionReference ? `  - Condition Reference: ${lifecycleConditionReference}\n` : ''}  - Notes: declarative only.` : '- none';
  const parent = effects ? `- result-parent
  - Output Binding: result
  - Effect: set
  - Parent Binding: ${parentBinding}
  - Member Mapping: single
  - Notes: parent declaration only.` : '- none';
  const relation = effects ? `- source-to-result
  - Effect: declare
  - Subject Binding: result
  - Predicate Identifier: derived-from
  - Predicate Meaning: Result is semantically derived from source.
  - Object Binding: source
  - Directionality: directed
  - Predicate Label: derived from
${relationVocabulary ? `  - Predicate Vocabulary: ${relationVocabulary}\n` : ''}${relationAuthority ? `  - Predicate Authority: ${relationAuthority}\n` : ''}  - Member Mapping: pairwise
  - Mapping Meaning: Invocation supplies explicit pairs.
  - Notes: no relation materialization.` : '- none';
  const destinations = outputRoles ? `- destination
  - Meaning: Invocation-selected output destination.
  - Required: yes
  - Destination Kind: workspace-root
  - Capability Requirement: write
  - Notes: definition origin does not satisfy this slot.` : '- none';
  const placements = outputRoles ? `- result-placement
  - Output Binding: result
  - Destination Binding: destination
  - Placement Intent: ${placementIntent}
${placementNamingAuthority ? `  - Naming Authority: ${placementNamingAuthority}\n` : ''}  - Relative To Binding: source
  - Relative Placement Meaning: Place result relative to the semantic source context.
  - Explicit Override Allowed: no
  - Notes: path resolution is later.` : '- none';
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

- Purpose: Read-only canonical result semantics fixture.
- Semantic Boundary: Result/effect planning only.

## Input Roles

- source
  - Meaning: Existing semantic source.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Acquisition Policy: existing-only

## Output Roles

${output}

## Lifecycle And Continuity Effects

### Lifecycle Effects

${lifecycle}

### Parent Effects

${parent}

## Relation Effects

${relation}

## Applicability And Conditions

- Applicability Meaning: Input planning is owned by the frozen availability planner.
- Failure Meaning: Preserve unresolved semantics.
- Unknown Meaning: Never guess execution.

## Authoring Bindings

- Interaction Unit: semantic-authoring
- Schema Module: generic-transition-authoring
- Presentation Surface: portable-read-model
- Authoring Notes: Guidance only; not generation authority.

## Placement Intent

### Destination Bindings

${destinations}

### Output Placements

${placements}

## Interpretation Limits

- Does Not Prove: invocation, generation, materialization, Parent mutation, relation materialization, or execution.
- Must Not Be Inferred: concrete path or participant member association.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function record(sourceMarkdown, id) {
  return Object.assign(createRecordFromMarkdown(sourceMarkdown, {
    path: `.topics/transitions/${id}.trace.md`, sourceMode: 'source-backed'
  }), {
    id: `transition:${id}`,
    source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' },
    sourceTarget: { sourceArtifactPath: `.topics/transitions/${id}.trace.md` }
  });
}

function read(options = {}, resolvers = authorities) {
  const id = options.id || 'result-semantics';
  return buildTransitionDefinitionRegistry({
    records: [record(markdown(options), id)],
    schemaMaterials: [rootContract, transitionContract],
    resolvers
  }).definitions[0];
}

function plan(options = {}, resolvers = authorities) {
  const definition = read(options, resolvers);
  return { definition, result: buildCanonicalTransitionResultPlan({ definition }) };
}

const base = plan();
assert.equal(base.definition.canonicalReadQualified, true);
assert.equal(base.result.qualification, 'qualified');
assert.equal(base.result.readOnly, true);
assert.equal(base.result.mutation, false);
assert.equal(base.result.networkFetch, false);
assert.equal(base.result.executable, false);

// 1–3. Output participant truth preserves declared/resolved separation and unknown.
const output = base.result.outputRoles[0];
assert.equal(output.name, 'result');
assert.equal(output.targetKind, '', 'authority-derived output kind must not rewrite source declaration');
assert.equal(output.effectiveParticipantKind, 'artifact');
assert.equal(output.participantClassification.qualification, 'resolved-by-authority');
assert.equal(output.schemaConstraint, 'tiinex.signal.v1');
assert.equal(output.schemaConstraintQualification, 'resolved');
assert.equal(output.generationBinding, 'target-schema');
assert.equal(output.generation.authority, 'target-schema');
assert.equal(output.generation.qualification, 'not-evaluated');
assert.equal(output.generation.executable, false);

const explicitOutput = plan({ id: 'explicit-output', outputTargetKind: 'artifact' });
assert.equal(explicitOutput.result.outputRoles[0].targetKind, 'artifact');
assert.equal(explicitOutput.result.outputRoles[0].effectiveParticipantKind, 'artifact');
assert.equal(explicitOutput.result.outputRoles[0].participantClassification.qualification, 'agreement');

const unknownOutput = plan({ id: 'unknown-output', outputTargetKind: 'unknown', outputSchema: '', generationBinding: '', placementNamingAuthority: '' });
assert.equal(unknownOutput.definition.canonicalReadQualified, true);
assert.equal(unknownOutput.result.outputRoles[0].targetKind, 'unknown');
assert.equal(unknownOutput.result.outputRoles[0].effectiveParticipantKind, '');
assert.equal(unknownOutput.result.outputRoles[0].qualification, 'unresolved');
assert.equal(unknownOutput.result.qualification, 'unresolved');

// 4–6. Lifecycle semantics are readable only; exact binding references fail closed.
const lifecycle = base.result.lifecycleEffects[0];
assert.equal(lifecycle.effect, 'create-new');
assert.equal(lifecycle.requiredMaterializationOperation, 'create');
assert.equal(lifecycle.targetBinding.qualification, 'resolved');
assert.equal(lifecycle.targetBinding.resolvedName, 'result');
assert.equal(lifecycle.command, null);
assert.equal(lifecycle.executable, false);
assert.equal(base.result.boundary.materialization, false);

const malformedLifecycleDefinition = Object.freeze({
  ...base.definition,
  lifecycleEffects: Object.freeze([
    Object.freeze({ ...base.definition.lifecycleEffects[0], fields: Object.freeze({ ...base.definition.lifecycleEffects[0].fields, 'Target Binding': 'missing-role' }) })
  ])
});
const malformedLifecycle = buildCanonicalTransitionResultPlan({ definition: malformedLifecycleDefinition });
assert.equal(malformedLifecycle.lifecycleEffects[0].targetBinding.qualification, 'unresolved');
assert.equal(malformedLifecycle.lifecycleEffects[0].targetBinding.resolvedName, '');
assert.equal(malformedLifecycle.qualification, 'unresolved');

// 7–9. Effect conditions remain unresolved; both source values are preserved without execution.
const conditionOnly = plan({ id: 'condition-only', lifecycleCondition: 'source remains relevant' });
assert.equal(conditionOnly.result.lifecycleEffects[0].participation.condition, 'source remains relevant');
assert.equal(conditionOnly.result.lifecycleEffects[0].participation.state, 'unresolved');
assert.equal(conditionOnly.result.qualification, 'unresolved');

const referenceOnly = plan({ id: 'reference-only', lifecycleConditionReference: '[condition](../condition.trace.md)' });
assert.equal(referenceOnly.result.lifecycleEffects[0].participation.conditionReference, '[condition](../condition.trace.md)');
assert.equal(referenceOnly.result.lifecycleEffects[0].participation.state, 'unresolved');

const both = plan({ id: 'both-condition', lifecycleCondition: 'readable restatement', lifecycleConditionReference: '[authority](../authority.trace.md)' });
assert.equal(both.result.lifecycleEffects[0].participation.condition, 'readable restatement');
assert.equal(both.result.lifecycleEffects[0].participation.conditionReference, '[authority](../authority.trace.md)');
assert.equal(both.result.lifecycleEffects[0].participation.state, 'unresolved');
assert.equal(both.result.lifecycleEffects[0].executable, false);

// 10. Parent semantics resolve names but assign no actual Parent.
const parent = base.result.parentEffects[0];
assert.equal(parent.outputBinding.resolvedName, 'result');
assert.equal(parent.parentBinding.resolvedName, 'source');
assert.equal(parent.effect, 'set');
assert.equal(parent.actualParentAssigned, false);

const parentTypoDefinition = Object.freeze({
  ...base.definition,
  parentEffects: Object.freeze([
    Object.freeze({ ...base.definition.parentEffects[0], fields: Object.freeze({ ...base.definition.parentEffects[0].fields, 'Parent Binding': 'soruce' }) })
  ])
});
const parentTypo = buildCanonicalTransitionResultPlan({ definition: parentTypoDefinition });
assert.equal(parentTypo.parentEffects[0].parentBinding.qualification, 'unresolved');
assert.equal(parentTypo.parentEffects[0].parentBinding.resolvedName, '');
assert.equal(parentTypo.qualification, 'unresolved');

// 11–12. Relation semantics preserve predicate scope but create no edge/global identity.
const relation = base.result.relationEffects[0];
assert.equal(relation.subjectBinding.resolvedName, 'result');
assert.equal(relation.objectBinding.resolvedName, 'source');
assert.equal(relation.predicateIdentifier, 'derived-from');
assert.equal(relation.predicateMeaning, 'Result is semantically derived from source.');
assert.equal(relation.directionality, 'directed');
assert.equal(relation.predicateScope, 'local-transition-definition');
assert.equal(relation.portablePredicateIdentityClaimed, false);
assert.equal(relation.relationMaterialized, false);

// 13–16. Placement correlates named declarations but never resolves a path or creates materialization.
const destination = base.result.destinationBindings[0];
const placement = base.result.outputPlacements[0];
assert.equal(destination.name, 'destination');
assert.equal(destination.requiredQualification.state, 'required');
assert.equal(destination.invocationInputRequired, true);
assert.equal(placement.outputBinding.resolvedName, 'result');
assert.equal(placement.destinationBinding.resolvedName, 'destination');
assert.equal(placement.placementIntent, 'new-materialization');
assert.equal(placement.namingAuthority, 'target-schema');
assert.equal(placement.namingQualification.state, 'not-evaluated');
assert.equal(placement.concretePath, null);
assert.equal(placement.pathQualification, 'not-evaluated');
assert.equal(placement.materializationCommand, null);

const noMaterialization = plan({ id: 'no-materialization', placementIntent: 'no-materialization' });
assert.equal(noMaterialization.result.outputPlacements[0].placementIntent, 'no-materialization');
assert.equal(noMaterialization.result.lifecycleEffects[0].effect, 'create-new', 'placement intent must not erase lifecycle semantics');
assert.equal(noMaterialization.result.lifecycleEffects[0].requiredMaterializationOperation, 'create');

// 17–18. Generation remains requested/not-evaluated; Authoring Bindings are guidance only.
assert.equal(output.generation.qualification, 'not-evaluated');
assert.equal(base.result.authoringGuidance.interactionUnit, 'semantic-authoring');
assert.equal(base.result.authoringGuidance.schemaModule, 'generic-transition-authoring');
assert.equal(base.result.authoringGuidance.presentationSurface, 'portable-read-model');
assert.equal(base.result.authoringGuidance.guidanceOnly, true);
assert.equal(base.result.authoringGuidance.generationAuthority, false);
assert.equal(base.result.authoringGuidance.executionAuthority, false);

// 19. Member Mapping is preserved but no positional member association is inferred.
assert.equal(lifecycle.memberMapping.declared, 'single');
assert.equal(lifecycle.memberMapping.concreteQualification, 'not-evaluated');
assert.deepEqual(lifecycle.memberMapping.concreteAssociations, []);
assert.equal(lifecycle.memberMapping.positionalInference, false);
assert.equal(relation.memberMapping.declared, 'pairwise');
assert.deepEqual(relation.memberMapping.concreteAssociations, []);
assert.equal(relation.memberMapping.positionalInference, false);

// 20. Sole `none` sentinels project empty collections rather than fake declarations.
const none = plan({ id: 'none-result', outputRoles: false, effects: false });
assert.equal(none.definition.canonicalReadQualified, true);
assert.deepEqual(none.result.outputRoles, []);
assert.deepEqual(none.result.lifecycleEffects, []);
assert.deepEqual(none.result.parentEffects, []);
assert.deepEqual(none.result.relationEffects, []);
assert.deepEqual(none.result.destinationBindings, []);
assert.deepEqual(none.result.outputPlacements, []);

// 21. Non-canonical read truth blocks result/effect planning.
const blocked = buildCanonicalTransitionResultPlan({ definition: Object.freeze({ ...base.definition, canonicalReadQualified: false }) });
assert.equal(blocked.qualification, 'blocked');
assert.equal(blocked.executable, false);
assert.deepEqual(blocked.outputRoles, []);

// 23–24. This owner consumes the frozen read model; it adds no Markdown/Tooling/UI/Create/Edit authority.
assert.equal(resultSource.includes('markdown'), false, 'result semantics owner must not parse Transition Markdown');
assert.equal(resultSource.includes('tooling/portable'), false, 'result semantics owner must not re-enter Tooling authority');
assert.equal(resultSource.includes('createContinuationDraft'), false);
assert.equal(resultSource.includes('React'), false);
assert.equal(resultSource.includes('TiinexApp'), false);

console.log('postV418CanonicalTransitionResultSemanticsPlannerFoundation: pass');
