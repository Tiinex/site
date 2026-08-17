import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry, buildTransitionDefinitionRegistryFromPortableMaterial, isCanonicalTransitionDefinitionRecord } from '../transitions/transition.definitionRegistry.js';
import { normalizeLegacyTransitionDefinition, LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID } from '../transitions/transition.legacyShorthand.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');

const topicToTask = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-15 00:00:00

---

# Topic To Task

## Transition Identity

- Name: Topic to Task
- Version: 1
- Canonical Identifier: topic-to-task

## Purpose And Scope

- Purpose: Create one Task from one bound Topic.
- Semantic Boundary: Reusable transition semantics only.

## Input Roles

- source-topic
  - Meaning: Topic used as the direct continuity source.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Acquisition Policy: existing-only

## Output Roles

- task
  - Meaning: Task created by the invocation.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.task.v1
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-task
  - Target Binding: task
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create

### Parent Effects

- task-continues-topic
  - Output Binding: task
  - Parent Binding: source-topic
  - Effect: set

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: exactly one suitable source-topic must be bound.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- destination-root
  - Meaning: writable root selected once for the Task.
  - Required: yes

### Output Placements

- task-placement
  - Output Binding: task
  - Placement Intent: new-materialization
  - Destination Binding: destination-root
  - Naming Authority: target-schema

## Interpretation Limits

- Does Not Prove: invocation or output existence.
- Must Not Be Inferred: source truth or mutation.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;

const authorities = { schemaAuthorities: {
  'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.task.v1': { targetKind: 'artifact', generation: true, fileNaming: true }
} };

function record(markdown, id = 'transition:topic-to-task') {
  return Object.assign(createRecordFromMarkdown(markdown, { path: `.topics/transitions/${id}.trace.md`, sourceMode: 'source-backed' }), {
    id,
    source: { id: 'docs', adapterId: 'github' },
    sourceTarget: { sourceArtifactPath: `.topics/transitions/${id}.trace.md`, inputTarget: `https://github.com/Tiinex/docs/blob/main/.topics/transitions/${id}.trace.md` }
  });
}

const positiveRecord = record(topicToTask);
const registry = buildTransitionDefinitionRegistry({
  state: { workspaces: [{ id: 'a', records: [{ id: 'other', schemaId: 'tiinex.topic.v1', markdown: '# Topic' }] }, { id: 'b', records: [positiveRecord] }] },
  schemaMaterials: { 'tiinex.root.v1': rootContract, 'tiinex.transition.definition.v1': transitionContract },
  resolvers: authorities
});
assert.equal(registry.count, 1, 'registry is workspace-global rather than anchored to one clicked record');
const positive = registry.definitions[0];
assert.equal(positive.transitionIdentity['Canonical Identifier'], 'topic-to-task');
assert.equal(positive.schemaChain.state, 'valid');
assert.equal(positive.schemaChain.complete, true);
assert.equal(positive.schemaChain.completeAuthority, true);
assert.equal(positive.contractValidation.status, 'valid');
assert.equal(positive.inputRoles[0].name, 'source-topic');
assert.equal(positive.inputRoles[0].fields['Target Kind'], 'artifact');
assert.equal(positive.outputRoles[0].name, 'task');
assert.equal(positive.lifecycleEffects[0].fields.Effect, 'create-new');
assert.equal(positive.parentEffects[0].fields['Parent Binding'], 'source-topic');
assert.equal(positive.relationEffects[0].name, 'none');
assert.equal(positive.destinationBindings[0].name, 'destination-root');
assert.equal(positive.outputPlacements[0].fields['Naming Authority'], 'target-schema');
assert.equal(positive.applicability, 'not-evaluated');
assert.equal(positive.executable, false, 'read seam must make no execution claim');
assert.equal(positive.source.sourceId, 'docs');


const rootSchemaRecord = Object.assign(createRecordFromMarkdown(rootContract, { path: '.topics/.schemas/tiinex.root.v1.schema.md', sourceMode: 'source-backed' }), {
  id: 'schema:root',
  source: { id: 'docs-schema', adapterId: 'github', repository: 'Tiinex/docs', authority: 'canonical-core' }
});
const transitionSchemaRecord = Object.assign(createRecordFromMarkdown(transitionContract, { path: '.topics/.schemas/transition/definition/tiinex.transition.definition.v1.schema.md', sourceMode: 'source-backed' }), {
  id: 'schema:transition-definition',
  source: { id: 'docs-schema', adapterId: 'github', repository: 'Tiinex/docs', authority: 'canonical-core' }
});
const providerBacked = await buildTransitionDefinitionRegistryFromPortableMaterial({
  records: [positiveRecord],
  schemaRecords: [transitionSchemaRecord, rootSchemaRecord],
  resolvers: authorities
});
assert.equal(providerBacked.schemaMaterialResolution.status, 'complete-to-root', 'site read seam consumes Tooling loaded-material schema-chain resolution without fetching');
assert.deepEqual(providerBacked.schemaMaterialResolution.nodes.map((node) => node.schemaId), ['tiinex.transition.definition.v1', 'tiinex.root.v1']);
assert.equal(providerBacked.definitions[0].schemaChain.completeAuthority, true);

const unknown = buildTransitionDefinitionRegistry({
  records: [record(topicToTask
    .replace('  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1', '  - Maximum Count: unknown\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1')
    .replace('  - Target Kind: artifact\n  - Schema Constraint: tiinex.task.v1', '  - Target Kind: unknown\n  - Schema Constraint: tiinex.task.v1'), 'transition:unknown')],
  schemaMaterials: [rootContract, transitionContract],
  resolvers: authorities
}).definitions[0];
assert.equal(unknown.inputRoles[0].fields['Maximum Count'], 'unknown');
assert.equal(unknown.outputRoles[0].fields['Target Kind'], 'unknown');
assert(unknown.diagnostics.some((item) => item.code === 'portable.contract.unknown.preserved' && item.field === 'Maximum Count'));
assert.equal(unknown.executable, false);

const missingField = buildTransitionDefinitionRegistry({
  records: [record(topicToTask.replace('  - Meaning: Task created by the invocation.\n', ''), 'transition:incomplete')],
  schemaMaterials: [rootContract, transitionContract],
  resolvers: authorities
}).definitions[0];
assert.equal(missingField.contractValidation.status, 'incomplete');
assert(missingField.diagnostics.some((item) => item.code === 'portable.contract.declaration.field.required.missing'));
assert.equal(missingField.executable, false);

const generationUnresolved = buildTransitionDefinitionRegistry({
  records: [record(topicToTask, 'transition:generation-unresolved')],
  schemaMaterials: [rootContract, transitionContract],
  resolvers: { schemaAuthorities: { ...authorities.schemaAuthorities, 'tiinex.task.v1': { targetKind: 'artifact', generation: false, fileNaming: true } } }
}).definitions[0];
assert.equal(generationUnresolved.contractValidation.status, 'unresolved');
assert(generationUnresolved.diagnostics.some((item) => item.code === 'portable.contract.authority.target-schema.unresolved'));

const incompleteChain = buildTransitionDefinitionRegistry({
  records: [record(topicToTask, 'transition:chain-incomplete')],
  schemaMaterials: { 'tiinex.transition.definition.v1': transitionContract },
  resolvers: authorities
}).definitions[0];
assert.equal(incompleteChain.schemaChain.state, 'unresolved');
assert.equal(incompleteChain.schemaChain.complete, false);
assert.equal(incompleteChain.schemaChain.completeAuthority, false);
assert.equal(incompleteChain.executable, false);

const contradictory = buildTransitionDefinitionRegistry({
  records: [record(topicToTask, 'transition:contradictory')],
  schemaMaterials: [rootContract, transitionContract],
  resolvers: { schemaAuthorities: { ...authorities.schemaAuthorities, 'tiinex.task.v1': { targetKind: 'non-artifact', generation: true, fileNaming: true } } }
}).definitions[0];
assert.equal(contradictory.contractValidation.status, 'contradictory');
assert(contradictory.diagnostics.some((item) => item.code === 'portable.contract.classification.contradiction'));
assert.equal(contradictory.executable, false);

const legacy = normalizeLegacyTransitionDefinition({ id: 'topic.continue.task', fromSchema: 'tiinex.topic.v1', intent: 'continue', resultSchema: 'tiinex.task.v1', label: 'Continue' });
assert.equal(legacy.schema, LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID);
assert.equal(isCanonicalTransitionDefinitionRecord(legacy), false, 'legacy shorthand cannot masquerade as canonical Transition Definition artifact');
const coexistence = buildTransitionDefinitionRegistry({ records: [legacy, positiveRecord], schemaMaterials: [rootContract, transitionContract], resolvers: authorities });
assert.equal(coexistence.count, 1);
assert.equal(coexistence.definitions[0].artifact.id, positiveRecord.id);

console.log('✓ post-S1 canonical Transition Definition read seam tests passed');
