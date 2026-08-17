import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const schemaInput = { schemaMaterials: [rootContract, transitionContract] };
const authorities = { schemaAuthorities: {
  'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.task.v1': { targetKind: 'artifact', generation: true, fileNaming: true }
} };

function definitionMarkdown({ name = 'Final hardening fixture', targetKind = 'artifact', maximumCount = '1', omitOutputMeaning = false } = {}) {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-15 00:00:00

---

# ${name}

## Transition Identity

- Name: ${name}
- Version: 1
- Canonical Identifier: final-hardening-fixture

## Purpose And Scope

- Purpose: Exercise final registry qualification and source identity truth.
- Semantic Boundary: Read-only registry fixture.

## Input Roles

- source
  - Meaning: One source artifact.
  - Minimum Count: 1
  - Maximum Count: ${maximumCount}
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1

## Output Roles

- result
${omitOutputMeaning ? '' : '  - Meaning: One result artifact.\n'}  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: ${targetKind}
  - Schema Constraint: tiinex.task.v1
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-result
  - Target Binding: result
  - Effect: create-new
  - Required Materialization Operation: create

### Parent Effects

- none

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: Not evaluated by this registry fixture.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- destination
  - Meaning: Destination chosen at invocation.
  - Required: yes

### Output Placements

- result-placement
  - Output Binding: result
  - Placement Intent: new-materialization
  - Destination Binding: destination
  - Naming Authority: target-schema

## Interpretation Limits

- Does Not Prove: applicability or execution.
- Must Not Be Inferred: source identity from declared schema.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function taskMarkdown(name = 'Task observation') {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.task.v1
  - Created At: 2026-08-15 00:00:00

---

# ${name}

## Objective

Prove schema divergence stays visible.

## Done Criteria

- conflict preserved

## Scope

- registry only

## Dependencies

- none

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: task-fixture-integrity
`;
}

const canonicalPath = '.topics/transitions/final-hardening.trace.md';
function configuredRecord({ id, workspaceId, markdown = definitionMarkdown(), repository = 'Tiinex/docs', ref = 'main', rootPath = '.topics', path = canonicalPath } = {}) {
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'source-backed' }), {
    id,
    workspaceId,
    source: { id: `loaded:${id}`, adapterId: 'github', repository, ref, rootPath },
    sourceTarget: { sourceArtifactPath: path }
  });
}

function inputTargetRecord({ id, workspaceId, markdown = definitionMarkdown(), inputTarget = 'https://example.invalid/shared-definition.md' } = {}) {
  const path = `loaded/${id}.trace.md`;
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'explicit-url' }), {
    id,
    workspaceId,
    source: { id: 'local-session', adapterId: 'url', kind: 'local-session' },
    sourceTarget: { inputTarget }
  });
}

function registry(records, extra = {}) {
  return buildTransitionDefinitionRegistry({ ...schemaInput, records, resolvers: authorities, ...extra });
}

// 1. canonicalReadQualified is a conjunction, not representation equivalence alone.
const valid = registry([configuredRecord({ id: 'valid', workspaceId: 'a' })]).definitions[0];
assert.equal(valid.contractValidation.status, 'valid');
assert.equal(valid.schemaAuthorityComplete, true);
assert.equal(valid.schemaQualification.state, 'equivalent');
assert.equal(valid.representationQualification.state, 'equivalent');
assert.equal(valid.canonicalReadQualified, true);

const missingChain = buildTransitionDefinitionRegistry({ records: [configuredRecord({ id: 'missing-chain', workspaceId: 'a' })], resolvers: authorities }).definitions[0];
assert.equal(missingChain.schemaAuthorityComplete, false);
assert.equal(missingChain.contractValidation.status, 'unresolved');
assert.equal(missingChain.canonicalReadQualified, false);

const incomplete = registry([configuredRecord({ id: 'incomplete', workspaceId: 'a', markdown: definitionMarkdown({ omitOutputMeaning: true }) })]).definitions[0];
assert.equal(incomplete.contractValidation.status, 'incomplete');
assert.equal(incomplete.canonicalReadQualified, false);

const unresolved = registry([configuredRecord({ id: 'unresolved', workspaceId: 'a' })], {
  resolvers: { schemaAuthorities: { ...authorities.schemaAuthorities, 'tiinex.task.v1': { targetKind: 'artifact', generation: false, fileNaming: true } } }
}).definitions[0];
assert.equal(unresolved.contractValidation.status, 'unresolved');
assert.equal(unresolved.canonicalReadQualified, false);

const contradictory = registry([configuredRecord({ id: 'contradictory', workspaceId: 'a' })], {
  resolvers: { schemaAuthorities: { ...authorities.schemaAuthorities, 'tiinex.task.v1': { targetKind: 'non-artifact', generation: true, fileNaming: true } } }
}).definitions[0];
assert.equal(contradictory.contractValidation.status, 'contradictory');
assert.equal(contradictory.canonicalReadQualified, false);

const preservedUnknown = registry([configuredRecord({ id: 'unknown', workspaceId: 'a', markdown: definitionMarkdown({ targetKind: 'unknown', maximumCount: 'unknown' }) })]).definitions[0];
assert.equal(preservedUnknown.contractValidation.status, 'valid-with-preserved-unknowns');
assert.equal(preservedUnknown.canonicalReadQualified, true, 'preserved unknowns remain contract-valid when every other canonical read authority is clean');

// 2. Shared source Artifact identity aggregates before declared schema qualification.
const transitionA = configuredRecord({ id: 'schema-transition', workspaceId: 'a' });
const taskB = configuredRecord({ id: 'schema-task', workspaceId: 'b', markdown: taskMarkdown() });
const schemaConflict = registry([transitionA, taskB]);
assert.equal(schemaConflict.count, 1, 'same configured source Artifact must stay one inspectable aggregate even when declared schema diverges');
const conflicted = schemaConflict.definitions[0];
assert.deepEqual(conflicted.artifact.workspaceIds, ['a', 'b']);
assert.deepEqual(conflicted.schemaQualification.declaredSchemaIds, ['tiinex.task.v1', 'tiinex.transition.definition.v1']);
assert.equal(conflicted.schemaQualification.state, 'conflicting');
assert.equal(conflicted.schemaQualification.canonicalObserved, true);
assert.equal(conflicted.canonicalReadQualified, false);
assert(conflicted.diagnostics.some((item) => item.code === 'canonical-transition.declared-schema.conflict' && item.state === 'contradictory'));

const inputTargetConflict = registry([
  inputTargetRecord({ id: 'target-transition', workspaceId: 'a' }),
  inputTargetRecord({ id: 'target-task', workspaceId: 'b', markdown: taskMarkdown() })
]);
assert.equal(inputTargetConflict.count, 1);
assert.equal(inputTargetConflict.definitions[0].schemaQualification.state, 'conflicting');
assert.deepEqual(inputTargetConflict.definitions[0].artifact.workspaceIds, ['a', 'b']);
assert.equal(inputTargetConflict.definitions[0].canonicalReadQualified, false);

const unreadableSchemaObservation = {
  id: 'schema-unreadable', workspaceId: 'b', path: canonicalPath,
  markdown: '# Artifact without continuity envelope\n\nUnreadable Current Schema declaration.\n',
  sourceMode: 'source-backed',
  source: { id: 'loaded:schema-unreadable', adapterId: 'github', repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' },
  sourceTarget: { sourceArtifactPath: canonicalPath }
};
const schemaUnresolved = registry([configuredRecord({ id: 'schema-readable', workspaceId: 'a' }), unreadableSchemaObservation]);
assert.equal(schemaUnresolved.count, 1);
assert.equal(schemaUnresolved.definitions[0].schemaQualification.state, 'unresolved');
assert.equal(schemaUnresolved.definitions[0].schemaQualification.unresolvedObservationCount, 1);
assert.equal(schemaUnresolved.definitions[0].canonicalReadQualified, false);
assert(schemaUnresolved.definitions[0].diagnostics.some((item) => item.code === 'canonical-transition.declared-schema.unresolved'));

const separateBoundary = registry([
  configuredRecord({ id: 'separate-transition', workspaceId: 'a', ref: 'main' }),
  configuredRecord({ id: 'separate-task', workspaceId: 'b', ref: 'feature', markdown: taskMarkdown() })
]);
assert.equal(separateBoundary.count, 1, 'Task observation at another configured boundary must remain a distinct source Artifact and not contaminate the Transition aggregate');
assert.deepEqual(separateBoundary.definitions[0].artifact.workspaceIds, ['a']);
assert.equal(separateBoundary.definitions[0].schemaQualification.state, 'equivalent');

// 3. Collision-safe configured boundary identity and structured source projection.
const delimiterA = configuredRecord({ id: 'delimiter-a', workspaceId: 'a', repository: 'o/r', ref: 'foo|bar', rootPath: '.topics' });
const delimiterB = configuredRecord({ id: 'delimiter-b', workspaceId: 'b', repository: 'o/r', ref: 'foo', rootPath: 'bar|.topics' });
const delimiterRegistry = registry([delimiterA, delimiterB]);
assert.equal(delimiterRegistry.count, 2, 'valid delimiter-bearing configured boundaries must not collide');
const delimiterSources = delimiterRegistry.definitions.map((item) => ({
  repository: item.source.repository,
  ref: item.source.ref,
  rootPath: item.source.rootPath,
  boundaryKey: item.source.boundaryKey
}));
assert(delimiterSources.some((item) => item.repository === 'o/r' && item.ref === 'foo|bar' && item.rootPath === '.topics'));
assert(delimiterSources.some((item) => item.repository === 'o/r' && item.ref === 'foo' && item.rootPath === 'bar|.topics'));
assert.equal(new Set(delimiterSources.map((item) => item.boundaryKey)).size, 2, 'read model must carry collision-safe boundary identity directly rather than decoding the legacy signature');

const repoCase = registry([
  configuredRecord({ id: 'repo-upper', workspaceId: 'a', repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/Foo' }),
  configuredRecord({ id: 'repo-lower', workspaceId: 'b', repository: 'owner/repo', ref: 'Main', rootPath: '.topics/Foo' })
]);
assert.equal(repoCase.count, 1);
assert.deepEqual(repoCase.definitions[0].artifact.workspaceIds, ['a', 'b']);

const refCase = registry([
  configuredRecord({ id: 'ref-upper', workspaceId: 'a', repository: 'owner/repo', ref: 'Main', rootPath: '.topics/Foo' }),
  configuredRecord({ id: 'ref-lower', workspaceId: 'b', repository: 'owner/repo', ref: 'main', rootPath: '.topics/Foo' })
]);
assert.equal(refCase.count, 2);

const rootCase = registry([
  configuredRecord({ id: 'root-upper', workspaceId: 'a', repository: 'owner/repo', ref: 'Main', rootPath: '.topics/Foo' }),
  configuredRecord({ id: 'root-lower', workspaceId: 'b', repository: 'owner/repo', ref: 'Main', rootPath: '.topics/foo' })
]);
assert.equal(rootCase.count, 2);

for (const definition of [valid, conflicted, inputTargetConflict.definitions[0], schemaUnresolved.definitions[0], ...delimiterRegistry.definitions]) {
  assert.equal(definition.applicability, 'not-evaluated');
  assert.equal(definition.executable, false);
}

console.log('✓ post-S1 canonical Transition Definition registry final hardening tests passed');
