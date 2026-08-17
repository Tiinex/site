import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');

const definitionMarkdown = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-15 00:00:00

---

# Local Identity Fixture

## Transition Identity

- Name: Local identity fixture
- Version: 1
- Canonical Identifier: local-identity-fixture

## Purpose And Scope

- Purpose: Exercise canonical Transition Definition registry identity only.
- Semantic Boundary: Read-only registry identity fixture.

## Input Roles

- source
  - Meaning: One source artifact.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact

## Output Roles

- result
  - Meaning: One result artifact.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact

## Lifecycle And Continuity Effects

### Lifecycle Effects

- preserve-source
  - Target Binding: source
  - Effect: preserve

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

- none

### Output Placements

- none

## Interpretation Limits

- Does Not Prove: applicability or execution.
- Must Not Be Inferred: cross-workspace identity without source evidence.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;

function localDefinition({ id, path = 'same.trace.md', workspaceId, workspaceIds, sourceId = 'local-session' } = {}) {
  return Object.assign(createRecordFromMarkdown(definitionMarkdown, { path, sourceMode: 'local-transition' }), {
    id,
    workspaceId,
    workspaceIds,
    source: { id: sourceId, adapterId: 'local', kind: 'local-session', sourceKind: 'local.session' }
  });
}

function configuredDefinition({ id, repository = 'Tiinex/docs', ref = 'main', rootPath = '.topics' } = {}) {
  const path = '.topics/transitions/local-identity-fixture.trace.md';
  return Object.assign(createRecordFromMarkdown(definitionMarkdown, { path, sourceMode: 'source-backed' }), {
    id,
    source: { id: 'docs', adapterId: 'github', repository, ref, rootPath },
    sourceTarget: { sourceArtifactPath: path }
  });
}

const schemaInput = { schemaMaterials: [rootContract, transitionContract] };

// No qualified shared source boundary means generic local source ids cannot authorize global dedupe.
const localA = localDefinition({ id: 'local:a' });
const localB = localDefinition({ id: 'local:b' });
const localRegistry = buildTransitionDefinitionRegistry({
  ...schemaInput,
  state: { workspaces: [{ id: 'a', records: [localA] }, { id: 'b', records: [localB] }] }
});
assert.equal(localRegistry.count, 2, 'separate local/session artifacts with the same generic source id/path must remain distinct across workspaces');
const localById = new Map(localRegistry.definitions.map((definition) => [definition.artifact.id, definition]));
assert.deepEqual(localById.get('local:a').artifact.workspaceIds, ['a']);
assert.deepEqual(localById.get('local:b').artifact.workspaceIds, ['b']);

// Existing configured source boundary evidence still authorizes global dedupe.
const configuredA = configuredDefinition({ id: 'configured:a' });
const configuredB = configuredDefinition({ id: 'configured:b' });
const configuredRegistry = buildTransitionDefinitionRegistry({
  ...schemaInput,
  state: { workspaces: [{ id: 'a', records: [configuredA] }, { id: 'b', records: [configuredB] }] }
});
assert.equal(configuredRegistry.count, 1, 'same configured source boundary + artifact path must still dedupe across workspaces');
assert.deepEqual(configuredRegistry.definitions[0].artifact.workspaceIds, ['a', 'b']);

// Re-consuming already-normalized records must preserve explicit membership arrays deterministically.
const normalized = localDefinition({ id: 'normalized:membership', path: 'normalized.trace.md', workspaceIds: ['b', 'a', 'a'] });
const normalizedRegistry = buildTransitionDefinitionRegistry({ ...schemaInput, records: [normalized] });
assert.equal(normalizedRegistry.count, 1);
assert.deepEqual(normalizedRegistry.definitions[0].artifact.workspaceIds, ['a', 'b'], 'record.workspaceIds must be preserved, deduped and sorted');

// Containing workspace membership must union with explicit normalized membership without loss.
const contained = localDefinition({ id: 'normalized:contained', path: 'contained.trace.md', workspaceIds: ['b', 'a', 'a'] });
const containedRegistry = buildTransitionDefinitionRegistry({
  ...schemaInput,
  state: { workspaces: [{ id: 'c', records: [contained] }] }
});
assert.equal(containedRegistry.count, 1);
assert.deepEqual(containedRegistry.definitions[0].artifact.workspaceIds, ['a', 'b', 'c'], 'containing workspace + record.workspaceId + record.workspaceIds must union deterministically');

// Existing configured boundary casing semantics remain unchanged.
const repoCaseRegistry = buildTransitionDefinitionRegistry({
  ...schemaInput,
  state: { workspaces: [
    { id: 'a', records: [configuredDefinition({ id: 'repo:upper', repository: 'Tiinex/docs', ref: 'Main', rootPath: '.topics/Foo' })] },
    { id: 'b', records: [configuredDefinition({ id: 'repo:lower', repository: 'tiinex/DOCS', ref: 'Main', rootPath: '.topics/Foo' })] }
  ] }
});
assert.equal(repoCaseRegistry.count, 1, 'repository casing remains case-insensitive');

const refCaseRegistry = buildTransitionDefinitionRegistry({
  ...schemaInput,
  state: { workspaces: [
    { id: 'a', records: [configuredDefinition({ id: 'ref:upper', ref: 'Main' })] },
    { id: 'b', records: [configuredDefinition({ id: 'ref:lower', ref: 'main' })] }
  ] }
});
assert.equal(refCaseRegistry.count, 2, 'ref casing remains identity-significant');

const rootCaseRegistry = buildTransitionDefinitionRegistry({
  ...schemaInput,
  state: { workspaces: [
    { id: 'a', records: [configuredDefinition({ id: 'root:upper', rootPath: '.topics/Foo' })] },
    { id: 'b', records: [configuredDefinition({ id: 'root:lower', rootPath: '.topics/foo' })] }
  ] }
});
assert.equal(rootCaseRegistry.count, 2, 'rootPath casing remains identity-significant');

for (const definition of [...localRegistry.definitions, ...configuredRegistry.definitions, ...normalizedRegistry.definitions, ...containedRegistry.definitions]) {
  assert.equal(definition.applicability, 'not-evaluated');
  assert.equal(definition.executable, false);
}

console.log('✓ post-S1 canonical Transition Definition registry local identity correction tests passed');
