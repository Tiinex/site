import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';

const staleRootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.contract-fixture.md', import.meta.url), 'utf8');
const canonicalRootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');

const definitionMarkdown = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-16 00:00:00

---

# Topic To Task

## Transition Identity

- Name: Topic to Task
- Version: 1
- Canonical Identifier: topic-to-task

## Purpose And Scope

- Purpose: Create one Task from one Topic.
- Semantic Boundary: Reusable transition semantics only.

## Input Roles

- source-topic
  - Meaning: Topic used as the continuity source.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
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

- Applicability Meaning: exactly one suitable source-topic may be bound.
- Condition: source topic remains relevant
- Condition Reference: [topic-relevance](../conditions/topic-relevance.trace.md)
- Failure Meaning: required source cannot be resolved
- Unknown Meaning: preserve unresolved source relevance

## Authoring Bindings

- Authoring Notes: read-only fixture

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

function definitionRecord() {
  return Object.assign(createRecordFromMarkdown(definitionMarkdown, {
    path: '.topics/transitions/topic-to-task.trace.md',
    sourceMode: 'source-backed'
  }), {
    id: 'transition:topic-to-task',
    source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' },
    sourceTarget: {
      sourceArtifactPath: '.topics/transitions/topic-to-task.trace.md',
      inputTarget: 'https://github.com/Tiinex/docs/blob/main/.topics/transitions/topic-to-task.trace.md'
    }
  });
}

function read(rootContract) {
  return buildTransitionDefinitionRegistry({
    records: [definitionRecord()],
    schemaMaterials: [rootContract, transitionContract],
    resolvers: {
      schemaAuthorities: {
        'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true }
      }
    }
  }).definitions[0];
}

const stale = read(staleRootContract);
assert.equal(stale.schemaChain.state, 'valid', 'stale Root still has matching lineage identity');
assert.equal(stale.schemaChain.complete, true);
assert.equal(stale.schemaAuthorityComplete, true, 'lineage completeness remains a separate truth axis');
assert.equal(stale.ordinaryReadAuthority.state, 'unavailable');
assert.equal(stale.contractValidation.status, 'valid', 'ordinary read authority must fail closed independently of otherwise valid instance validation');
assert.deepEqual(stale.transitionIdentity, {});
assert.deepEqual(stale.ordinaryProjection.groups, []);
assert.equal(stale.canonicalReadQualified, false);
assert(stale.diagnostics.some((item) => item.code === 'canonical-transition.ordinary-read-authority.unavailable'));
assert.equal(stale.executable, false);

const canonical = read(canonicalRootContract);
assert.equal(canonical.schemaChain.state, 'valid');
assert.equal(canonical.schemaChain.complete, true);
assert.equal(canonical.schemaAuthorityComplete, true);
assert.equal(canonical.ordinaryReadAuthority.state, 'available');
assert.equal(canonical.contractValidation.status, 'valid');
assert.equal(canonical.transitionIdentity.Name, 'Topic to Task');
assert(canonical.ordinaryProjection.groups.length > 0);
assert.equal(canonical.canonicalReadQualified, true);
assert.equal(canonical.diagnostics.some((item) => item.code === 'canonical-transition.ordinary-read-authority.unavailable'), false);
assert.equal(canonical.executable, false);

console.log('✓ post-v415 canonical ordinary-read authority fail-closed correction tests passed');
