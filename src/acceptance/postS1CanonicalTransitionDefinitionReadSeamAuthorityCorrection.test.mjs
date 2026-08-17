import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import {
  buildTransitionDefinitionRegistry,
  buildTransitionDefinitionRegistryFromPortableMaterial
} from '../transitions/transition.definitionRegistry.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const rootPath = '.topics/.schemas/tiinex.root.v1.schema.md';
const transitionSchemaPath = '.topics/.schemas/transition/definition/tiinex.transition.definition.v1.schema.md';
const transitionArtifactPath = '.topics/transitions/topic-to-task.trace.md';

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

function source(overrides = {}) {
  return {
    id: 'docs',
    adapterId: 'github',
    repository: 'Tiinex/docs',
    ref: 'main',
    rootPath: '.topics',
    ...overrides
  };
}

function definitionRecord({ markdown = topicToTask, id = 'transition:topic-to-task', sourceOverrides = {}, metadataSchemaId } = {}) {
  const result = Object.assign(createRecordFromMarkdown(markdown, { path: transitionArtifactPath, sourceMode: 'source-backed' }), {
    id,
    source: source(sourceOverrides),
    sourceTarget: {
      sourceArtifactPath: transitionArtifactPath,
      inputTarget: `https://github.com/Tiinex/docs/blob/${sourceOverrides.ref || 'main'}/${transitionArtifactPath}`
    }
  });
  if (metadataSchemaId !== undefined) result.schemaId = metadataSchemaId;
  return result;
}

function schemaRecord(schemaId, path, markdown) {
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'source-backed' }), {
    id: `schema:${schemaId}`,
    source: source({ id: 'docs-schema', authority: 'canonical-core' })
  });
}

function schemaFile(path, content) {
  return { path, content, source: { repository: 'Tiinex/docs', ref: 'main', path, authority: 'canonical-core' } };
}

function assertCompleteRegistry(registry, label) {
  assert.equal(registry.schemaMaterialResolution.status, 'complete-to-root', `${label}: Tooling should resolve complete schema material`);
  assert.equal(registry.count, 1, `${label}: canonical definition should remain indexed`);
  assert.equal(registry.definitions[0].schemaChain.state, 'valid', `${label}: resolved material should compile as valid chain`);
  assert.equal(registry.definitions[0].schemaChain.completeAuthority, true, `${label}: resolved material should establish complete authority`);
  assert.equal(registry.definitions[0].contractValidation.status, 'valid', `${label}: definition instance should validate`);
}

// 1. The portable-material entrypoint must consume exactly Tooling-resolved material.
const schemaRecordsRegistry = await buildTransitionDefinitionRegistryFromPortableMaterial({
  records: [definitionRecord()],
  schemaRecords: [schemaRecord('tiinex.transition.definition.v1', transitionSchemaPath, transitionContract), schemaRecord('tiinex.root.v1', rootPath, rootContract)],
  resolvers: authorities
});
assertCompleteRegistry(schemaRecordsRegistry, 'schemaRecords');

const schemaFilesRegistry = await buildTransitionDefinitionRegistryFromPortableMaterial({
  records: [definitionRecord()],
  schemaFiles: [schemaFile(transitionSchemaPath, transitionContract), schemaFile(rootPath, rootContract)],
  resolvers: authorities
});
assertCompleteRegistry(schemaFilesRegistry, 'schemaFiles');

const schemaCacheRegistry = await buildTransitionDefinitionRegistryFromPortableMaterial({
  records: [definitionRecord()],
  schemaCache: [
    { schemaId: 'tiinex.transition.definition.v1', path: transitionSchemaPath, markdown: transitionContract, source: { repository: 'Tiinex/docs', ref: 'main', path: transitionSchemaPath, authority: 'canonical-core' } },
    { schemaId: 'tiinex.root.v1', path: rootPath, markdown: rootContract, source: { repository: 'Tiinex/docs', ref: 'main', path: rootPath, authority: 'canonical-core' } }
  ],
  resolvers: authorities
});
assertCompleteRegistry(schemaCacheRegistry, 'schemaCache');

const providerResponsesRegistry = await buildTransitionDefinitionRegistryFromPortableMaterial({
  records: [definitionRecord()],
  providerResponses: [{
    providerId: 'fixture-provider',
    priority: 85,
    remoteFetch: false,
    source: { repository: 'Tiinex/docs', ref: 'main', authority: 'canonical-core' },
    files: [schemaFile(transitionSchemaPath, transitionContract), schemaFile(rootPath, rootContract)]
  }],
  resolvers: authorities
});
assertCompleteRegistry(providerResponsesRegistry, 'providerResponses');

const identityMismatchSchema = transitionContract.replace('Current Schema: tiinex.transition.definition.v1', 'Current Schema: tiinex.task.v1');
const rejectedRawCandidate = await buildTransitionDefinitionRegistryFromPortableMaterial({
  records: [definitionRecord()],
  schemaRecords: [schemaRecord('tiinex.root.v1', rootPath, rootContract), {
    id: 'schema:bad-transition',
    schemaId: 'tiinex.transition.definition.v1',
    path: transitionSchemaPath,
    markdown: identityMismatchSchema,
    source: source({ id: 'docs-schema', authority: 'canonical-core' })
  }],
  resolvers: authorities
});
assert.notEqual(rejectedRawCandidate.schemaMaterialResolution.status, 'complete-to-root', 'Tooling should reject filename-matching material with contradictory declared Current Schema');
assert.equal(rejectedRawCandidate.definitions[0].schemaAuthorityComplete, false, 'site must not reconsume Tooling-rejected raw schema material');
assert.equal(rejectedRawCandidate.definitions[0].contractValidation.status, 'unresolved');

// 2. Artifact-declared Current Schema owns canonical registry eligibility.
const markdownSaysTask = topicToTask.replace('Current Schema: tiinex.transition.definition.v1', 'Current Schema: tiinex.task.v1');
const staleMetadataClaimsTransition = definitionRecord({ markdown: markdownSaysTask, id: 'transition:metadata-wins-bug', metadataSchemaId: 'tiinex.transition.definition.v1' });
const notCanonical = buildTransitionDefinitionRegistry({ records: [staleMetadataClaimsTransition], schemaMaterials: [rootContract, transitionContract], resolvers: authorities });
assert.equal(notCanonical.count, 0, 'metadata must not override artifact Current Schema when artifact declares another schema');

const staleMetadataClaimsTask = definitionRecord({ id: 'transition:declared-wins', metadataSchemaId: 'tiinex.task.v1' });
const declaredWins = buildTransitionDefinitionRegistry({ records: [staleMetadataClaimsTask], schemaMaterials: [rootContract, transitionContract], resolvers: authorities });
assert.equal(declaredWins.count, 1, 'declared Transition Definition Current Schema remains canonical even when record metadata is stale');
assert.equal(declaredWins.definitions[0].artifact.schemaId, 'tiinex.transition.definition.v1');
assert.equal(declaredWins.definitions[0].artifact.metadataSchemaId, 'tiinex.task.v1');
assert(declaredWins.definitions[0].diagnostics.some((item) => item.code === 'canonical-transition.record-schema-metadata.drift'), 'metadata drift should remain visible rather than silently winning');

// 3. Registry identity follows existing configured source-boundary semantics and preserves workspace memberships.
const sameA = definitionRecord({ id: 'transition:workspace-a' });
const sameB = definitionRecord({ id: 'transition:workspace-b' });
const membershipRegistry = buildTransitionDefinitionRegistry({
  state: { workspaces: [{ id: 'a', records: [sameA] }, { id: 'b', records: [sameB] }] },
  schemaMaterials: [rootContract, transitionContract],
  resolvers: authorities
});
assert.equal(membershipRegistry.count, 1, 'same source boundary + artifact path should dedupe globally');
assert.deepEqual(membershipRegistry.definitions[0].artifact.workspaceIds, ['a', 'b'], 'deduped definition must retain every loaded workspace membership');
assert.equal(membershipRegistry.definitions[0].source.boundarySignature, 'tiinex/docs|main|.topics');

const main = definitionRecord({ id: 'transition:main', sourceOverrides: { ref: 'main' } });
const feature = definitionRecord({ id: 'transition:feature', sourceOverrides: { ref: 'feature' } });
const refDistinct = buildTransitionDefinitionRegistry({
  state: { workspaces: [{ id: 'a', records: [main] }, { id: 'b', records: [feature] }] },
  schemaMaterials: [rootContract, transitionContract],
  resolvers: authorities
});
assert.equal(refDistinct.count, 2, 'same source id/path at distinct refs must remain distinct canonical definitions');
assert.deepEqual(new Set(refDistinct.definitions.map((item) => item.source.ref)), new Set(['main', 'feature']));

const repoCaseA = definitionRecord({ id: 'transition:repo-upper', sourceOverrides: { repository: 'Tiinex/docs', ref: 'Main', rootPath: '.topics/Foo' } });
const repoCaseB = definitionRecord({ id: 'transition:repo-lower', sourceOverrides: { repository: 'tiinex/DOCS', ref: 'Main', rootPath: '.topics/Foo' } });
const repoCaseEquivalent = buildTransitionDefinitionRegistry({
  state: { workspaces: [{ id: 'a', records: [repoCaseA] }, { id: 'b', records: [repoCaseB] }] },
  schemaMaterials: [rootContract, transitionContract],
  resolvers: authorities
});
assert.equal(repoCaseEquivalent.count, 1, 'repository casing follows established case-insensitive source-boundary identity');
assert.deepEqual(repoCaseEquivalent.definitions[0].artifact.workspaceIds, ['a', 'b']);

const refCaseA = definitionRecord({ id: 'transition:ref-upper', sourceOverrides: { ref: 'Main', rootPath: '.topics/Foo' } });
const refCaseB = definitionRecord({ id: 'transition:ref-lower', sourceOverrides: { ref: 'main', rootPath: '.topics/Foo' } });
const refCaseDistinct = buildTransitionDefinitionRegistry({
  state: { workspaces: [{ id: 'a', records: [refCaseA] }, { id: 'b', records: [refCaseB] }] },
  schemaMaterials: [rootContract, transitionContract],
  resolvers: authorities
});
assert.equal(refCaseDistinct.count, 2, 'ref casing remains identity-significant');

const rootCaseA = definitionRecord({ id: 'transition:root-upper', sourceOverrides: { ref: 'Main', rootPath: '.topics/Foo' } });
const rootCaseB = definitionRecord({ id: 'transition:root-lower', sourceOverrides: { ref: 'Main', rootPath: '.topics/foo' } });
const rootCaseDistinct = buildTransitionDefinitionRegistry({
  state: { workspaces: [{ id: 'a', records: [rootCaseA] }, { id: 'b', records: [rootCaseB] }] },
  schemaMaterials: [rootContract, transitionContract],
  resolvers: authorities
});
assert.equal(rootCaseDistinct.count, 2, 'rootPath casing remains identity-significant');

for (const registry of [membershipRegistry, refDistinct, repoCaseEquivalent, refCaseDistinct, rootCaseDistinct]) {
  for (const definition of registry.definitions) {
    assert.equal(definition.applicability, 'not-evaluated');
    assert.equal(definition.executable, false, 'identity correction must not open planner/execution semantics');
  }
}

console.log('✓ post-S1 canonical Transition Definition read-seam authority correction tests passed');
