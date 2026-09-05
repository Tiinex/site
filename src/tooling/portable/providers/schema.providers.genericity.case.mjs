import assert from 'node:assert/strict';
import { resolvePortableSchemaMaterial } from './schema.providers.js';

const generic = await resolvePortableSchemaMaterial({ schemaId: 'example.schema.v1' }, {});
assert.equal(generic.providerRequest.repository, '', 'generic provider requests must not invent a project repository');
assert.equal(generic.providerRequest.ref, '', 'generic provider requests must not invent a project ref');
assert.equal(generic.providerRequest.capability, 'supply-schema-material', 'repository action is unavailable without an explicit repository source');

let observed = null;
await resolvePortableSchemaMaterial({
  schemaId: 'example.schema.v1',
  sourceProfile: { repository: 'Acme/specs', ref: 'stable' }
}, {
  providers: [{
    id: 'capture',
    resolveSchema: async (request) => { observed = request; return null; }
  }]
});
assert.equal(observed.repository, 'Acme/specs');
assert.equal(observed.ref, 'stable');

const overridden = await resolvePortableSchemaMaterial({
  schemaId: 'example.schema.v1',
  repository: 'Operator/schemas',
  ref: 'review',
  sourceProfile: { repository: 'Acme/specs', ref: 'stable' }
}, {});
assert.equal(overridden.providerRequest.repository, 'Operator/schemas');
assert.equal(overridden.providerRequest.ref, 'review');

console.log('✓ schema provider genericity regression: project source is explicit profile/operator data only');
