import assert from 'node:assert/strict';
import { listPortableOperations, runPortableOperation } from './operation.catalog.js';

const catalog = listPortableOperations();
assert.equal(catalog.schema, 'tiinex.portable.operation.catalog.v1');
assert.equal(Array.isArray(catalog.operations), true);
assert.equal(new Set(catalog.operations.map((operation) => operation.name)).size, catalog.operations.length);

const expected = [
  'prepare-task',
  'discover-tooling',
  'plan-host-action',
  'accept-host-receipt',
  'describe-checkpoint-gate',
  'qualify-checkpoint',
  'resolve-schema-material',
  'search-lineage',
  'schema-guide',
  'create-local-draft',
  'materialize-durable-findings',
  'create-checkpoint',
  'build-runtime-package',
  'rehydrate-runtime-package',
  'roundtrip-runtime-package',
  'plan-publication',
  'accept-publication-result'
];
for (const name of expected) assert.equal(catalog.operations.some((operation) => operation.name === name), true, `missing operation ${name}`);
for (const operation of catalog.operations) {
  assert.equal(Boolean(operation.inputSchema), true, `${operation.name} input schema`);
  assert.equal(operation.outputSchema, 'tiinex.portable.operation.result.v1');
  assert.equal(operation.serializableResult, true);
  assert.equal(operation.sourceMutation, false);
  assert.equal(operation.remoteWrite, false);
}
assert.doesNotThrow(() => JSON.stringify(catalog));
await assert.rejects(() => runPortableOperation('not-an-operation', {}), /portable\.operation\.unknown/);

console.log('✓ portable operation catalog is self-describing, unique, serializable, and source-safe');
