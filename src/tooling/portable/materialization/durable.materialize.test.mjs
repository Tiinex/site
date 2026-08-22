import assert from 'node:assert/strict';
import { materializePortableDurableFindings, planPortableDurableMaterialization, PORTABLE_DURABLE_MATERIALIZATION_RESULT_SCHEMA_ID } from './durable.materialize.js';
import { runPortableOperation } from '../operation.catalog.js';

const schemaMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Trace: [tiinex.root.v1.schema.md](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.experimental.outcome.v1](tiinex.experimental.outcome.v1.schema.md)
  - Created At: 2026-07-23 00:00:00
  - Summary: Outcome schema.

---

# Outcome

## Summary

A local outcome artifact.

## Schema Validation Contract

### Outcome

Required Sections

- Outcome

Required Fields

- Result

## Artifact Creation Contract

### Outcome Creation

Required Inputs

- Result
`;
const rootMarkdown = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.root.v1
  - Created At: 2026-07-23 00:00:00
  - Summary: Root

---

# Root

## Schema Validation Contract

### Current

Required Fields

- Current Schema
`;
const durableFindings = [{ id: 'result-1', code: 'result.ready', message: 'The provider architecture is ready.' }];
const missingSchema = planPortableDurableMaterialization({ durableFindings, materializations: [{ findingIds: ['result-1'] }] });
assert.equal(missingSchema.status, 'blocked');
assert.equal(missingSchema.findings.some((finding) => finding.code === 'portable.materialization.schema.required'), true);

const materialized = await materializePortableDurableFindings({
  files: [
    { path: 'schemas/tiinex.experimental.outcome.v1.schema.md', content: schemaMarkdown },
    { path: 'schemas/tiinex.root.v1.schema.md', content: rootMarkdown }
  ],
  durableFindings,
  materializations: [{
    id: 'outcome-artifact',
    findingIds: ['result-1'],
    schemaId: 'tiinex.experimental.outcome.v1',
    title: 'Provider Outcome',
    summary: 'The provider architecture outcome.',
    values: { Result: 'The host-provider architecture is ready for portable use.' },
    path: 'drafts/provider-outcome.md'
  }]
}, { createdAt: '2026-07-23T01:10:00.000Z', stagedAt: '2026-07-23T01:11:00.000Z' });
assert.equal(materialized.status, 'degraded', 'readable custom-schema materialization may be retained, but unified Root/reference validation prevents a false clean/staged claim');
assert.equal(materialized.materialized.length, 1);
assert.equal(materialized.materialized[0].draft.path, 'drafts/provider-outcome.md');
assert.equal(materialized.materialized[0].stagedArtifact, null, 'semantic-invalid readable custom draft is retained but not silently staged as clean');
assert.equal(materialized.remainingFindings.length, 0);
assert.equal(materialized.session.durableFindings.length, 0);
assert.equal(materialized.session.stagedArtifacts.length, 0);
assert.equal(materialized.boundary.remoteWrite, false);

const operation = await runPortableOperation('materialize-durable-findings', {
  files: [
    { path: 'schemas/tiinex.experimental.outcome.v1.schema.md', content: schemaMarkdown },
    { path: 'schemas/tiinex.root.v1.schema.md', content: rootMarkdown }
  ],
  durableFindings,
  materializations: [{
    id: 'outcome-operation',
    findingIds: ['result-1'],
    schemaId: 'tiinex.experimental.outcome.v1',
    title: 'Operation Outcome',
    values: { Result: 'The operation catalog exposes materialization.' },
    path: 'drafts/operation-outcome.md'
  }]
}, { createdAt: '2026-07-23T01:12:00.000Z' });
assert.equal(operation.operation, 'materialize-durable-findings');
assert.equal(operation.resultSchema, PORTABLE_DURABLE_MATERIALIZATION_RESULT_SCHEMA_ID);

console.log('✓ portable durable finding materialization requires explicit schema and preserves invalid custom drafts without false clean staging');
