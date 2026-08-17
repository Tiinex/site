import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';

const rootContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const schemaInput = { schemaMaterials: [rootContract, transitionContract] };

function definitionMarkdown(name = 'Aggregate fixture', canonicalIdentifier = 'aggregate-fixture') {
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
- Canonical Identifier: ${canonicalIdentifier}

## Purpose And Scope

- Purpose: Exercise deterministic Transition Definition registry aggregation.
- Semantic Boundary: Read-only registry aggregate truth fixture.

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
- Must Not Be Inferred: representation equality from registry identity.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function configuredDefinition({ id, workspaceId, markdown = definitionMarkdown(), repository = 'Tiinex/docs', ref = 'main', rootPath = '.topics', materialReconciliation } = {}) {
  const path = '.topics/transitions/aggregate-fixture.trace.md';
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'source-backed' }), {
    id,
    workspaceId,
    source: { id: `loaded:${id}`, adapterId: 'github', repository, ref, rootPath },
    sourceTarget: { sourceArtifactPath: path },
    materialReconciliation
  });
}

function explicitTargetDefinition({ id, workspaceId, markdown = definitionMarkdown(), inputTarget = 'https://example.invalid/definition.md' } = {}) {
  const path = `loaded/${id}.trace.md`;
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'explicit-url' }), {
    id,
    workspaceId,
    source: { id: 'local-session', adapterId: 'url', kind: 'local-session' },
    sourceTarget: { inputTarget }
  });
}

function registryFor(records) {
  return buildTransitionDefinitionRegistry({ ...schemaInput, records });
}

function stableAggregateProjection(definition) {
  return {
    artifact: {
      id: definition.artifact.id,
      registryIdentity: definition.artifact.registryIdentity,
      workspaceId: definition.artifact.workspaceId,
      workspaceIds: definition.artifact.workspaceIds,
      loadedRecordIds: definition.artifact.loadedRecordIds
    },
    source: definition.source,
    representationQualification: definition.representationQualification,
    diagnostics: definition.diagnostics,
    transitionIdentity: definition.transitionIdentity
  };
}

// Same configured source artifact must aggregate deterministically regardless of observation order.
const equivalentA = configuredDefinition({ id: 'runtime:a', workspaceId: 'a' });
const equivalentB = configuredDefinition({ id: 'runtime:b', workspaceId: 'b' });
const equivalentAB = registryFor([equivalentA, equivalentB]);
const equivalentBA = registryFor([equivalentB, equivalentA]);
assert.equal(equivalentAB.count, 1);
assert.equal(equivalentBA.count, 1);
assert.deepEqual(stableAggregateProjection(equivalentAB.definitions[0]), stableAggregateProjection(equivalentBA.definitions[0]), 'aggregate identity/read truth must be observation-order independent');
const equivalent = equivalentAB.definitions[0];
assert.deepEqual(equivalent.artifact.workspaceIds, ['a', 'b']);
assert.equal(equivalent.artifact.workspaceId, 'a', 'singular compatibility membership must be deterministic first sorted membership');
assert.deepEqual(equivalent.artifact.loadedRecordIds, ['runtime:a', 'runtime:b']);
assert.equal(equivalent.artifact.id, 'runtime:a', 'compatibility artifact.id must be deterministic first sorted loaded record id, not first observation');
assert.match(equivalent.artifact.registryIdentity, /^tiinex\.transition\.registry:source-boundary:/, 'canonical registry identity must derive from qualified source identity');
assert.equal(equivalent.representationQualification.state, 'equivalent');
assert.equal(equivalent.representationQualification.variantCount, 1);
assert.equal(equivalent.canonicalReadQualified, true);
assert(!equivalent.diagnostics.some((item) => item.code === 'canonical-transition.representation.conflict'));

// Same global identity with divergent loaded representations must remain one aggregate but show a deterministic conflict.
const markdownA = definitionMarkdown('Representation A');
const markdownB = definitionMarkdown('Representation B');
const divergentA = configuredDefinition({ id: 'variant:a', workspaceId: 'a', markdown: markdownA });
const divergentB = configuredDefinition({ id: 'variant:b', workspaceId: 'b', markdown: markdownB });
const divergentAB = registryFor([divergentA, divergentB]);
const divergentBA = registryFor([divergentB, divergentA]);
assert.equal(divergentAB.count, 1);
assert.equal(divergentBA.count, 1);
assert.deepEqual(stableAggregateProjection(divergentAB.definitions[0]), stableAggregateProjection(divergentBA.definitions[0]), 'representation conflict output must be independent of observation order');
const divergent = divergentAB.definitions[0];
assert.deepEqual(divergent.artifact.workspaceIds, ['a', 'b']);
assert.equal(divergent.representationQualification.state, 'conflicting');
assert.equal(divergent.representationQualification.variantCount, 2);
assert.equal(divergent.canonicalReadQualified, false, 'representation conflict must prevent a conflict-free canonical read qualification');
assert(divergent.diagnostics.some((item) => item.code === 'canonical-transition.representation.conflict' && item.state === 'contradictory'));
assert.deepEqual(new Set(divergent.representationQualification.variants.map((variant) => variant.markdown)), new Set([markdownA, markdownB]));
assert.equal(divergent.executable, false);
assert.equal(divergent.applicability, 'not-evaluated');

// Explicit inputTarget identity uses the same no-silent-first-win representation rule.
const targetA = explicitTargetDefinition({ id: 'target:a', workspaceId: 'a', markdown: markdownA });
const targetB = explicitTargetDefinition({ id: 'target:b', workspaceId: 'b', markdown: markdownB });
const targetConflict = registryFor([targetB, targetA]);
const targetConflictReverse = registryFor([targetA, targetB]);
assert.equal(targetConflict.count, 1);
assert.deepEqual(stableAggregateProjection(targetConflict.definitions[0]), stableAggregateProjection(targetConflictReverse.definitions[0]), 'explicit inputTarget conflict output must be observation-order independent');
assert.equal(targetConflict.definitions[0].source.inputTarget, 'https://example.invalid/definition.md');
assert.equal(targetConflict.definitions[0].representationQualification.state, 'conflicting');
assert.equal(targetConflict.definitions[0].canonicalReadQualified, false);
assert.deepEqual(targetConflict.definitions[0].artifact.workspaceIds, ['a', 'b']);

// Existing upstream reconciliation conflict must remain visible even when Markdown is byte-equivalent.
const reconciledA = configuredDefinition({ id: 'reconcile:a', workspaceId: 'a', materialReconciliation: { status: 'checksum-mismatch' } });
const reconciledB = configuredDefinition({ id: 'reconcile:b', workspaceId: 'b' });
const reconciled = registryFor([reconciledA, reconciledB]).definitions[0];
assert.equal(reconciled.representationQualification.state, 'conflicting');
assert.equal(reconciled.canonicalReadQualified, false);
assert.deepEqual(reconciled.representationQualification.reconciliationStatuses, ['checksum-mismatch']);
assert(reconciled.diagnostics.some((item) => item.code === 'canonical-transition.representation.conflict'));

const unresolvedReconciliation = registryFor([
  configuredDefinition({ id: 'unverified:a', workspaceId: 'a', materialReconciliation: { status: 'same-origin-unverified' } }),
  configuredDefinition({ id: 'unverified:b', workspaceId: 'b' })
]).definitions[0];
assert.equal(unresolvedReconciliation.representationQualification.state, 'unresolved');
assert.equal(unresolvedReconciliation.canonicalReadQualified, false, 'unresolved upstream representation authority must not be reported as canonically qualified');
assert(unresolvedReconciliation.diagnostics.some((item) => item.code === 'canonical-transition.representation.unresolved'));

// Distinct registry identities with the same Canonical Identifier must sort deterministically by registry identity.
const sameCanonicalFeature = configuredDefinition({ id: 'same:feature', workspaceId: 'feature', ref: 'feature', markdown: definitionMarkdown('Feature name', 'same-canonical') });
const sameCanonicalMain = configuredDefinition({ id: 'same:main', workspaceId: 'main', ref: 'main', markdown: definitionMarkdown('Main name', 'same-canonical') });
const orderA = registryFor([sameCanonicalMain, sameCanonicalFeature]);
const orderB = registryFor([sameCanonicalFeature, sameCanonicalMain]);
assert.equal(orderA.count, 2);
assert.deepEqual(orderA.definitions.map((item) => item.artifact.registryIdentity), orderB.definitions.map((item) => item.artifact.registryIdentity), 'same Canonical Identifier must use registry identity as deterministic sort tie-break');
assert.deepEqual(orderA.definitions.map((item) => item.source.ref), orderB.definitions.map((item) => item.source.ref));

console.log('✓ post-S1 canonical Transition Definition registry aggregate truth correction tests passed');
