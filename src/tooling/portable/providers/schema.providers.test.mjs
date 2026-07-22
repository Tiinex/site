import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  listPortableMaterialProviders,
  resolvePortableSchemaChainMaterial,
  resolvePortableSchemaMaterial
} from './schema.providers.js';

const rootMarkdown = await readFile(new URL('../../../schemas/tiinex.root.v1.schema.md', import.meta.url), 'utf8');
const topicMarkdown = await readFile(new URL('../../../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const childMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Trace: [tiinex.root.v1.schema.md](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.experimental.provider-child.v1](tiinex.experimental.provider-child.v1.schema.md)
  - Created At: 2026-07-23 00:00:00
  - Summary: Provider child schema.

---

# Provider Child

## Summary

A test-only readable schema.

## Schema Validation Contract

### Child Body

Required Sections

- Child Content

Required Fields

- Result

## Artifact Creation Contract

### Child Creation

Required Inputs

- Result
`;

const loaded = await resolvePortableSchemaMaterial({
  schemaId: 'tiinex.experimental.provider-child.v1',
  files: [{ path: 'schemas/tiinex.experimental.provider-child.v1.schema.md', content: childMarkdown }]
});
assert.equal(loaded.status, 'resolved');
assert.equal(loaded.material.parentSchemaId, 'tiinex.root.v1');
assert.equal(loaded.material.qualification.registered, false);
assert.equal(loaded.material.cacheEntry.schemaId, 'tiinex.experimental.provider-child.v1');

const request = await resolvePortableSchemaMaterial({
  schemaId: 'tiinex.experimental.remote.v1',
  tools: [
    { name: 'GitHub.search', description: 'Search repository files.' },
    { name: 'GitHub.fetch_file', description: 'Read repository file content.' }
  ]
});
assert.equal(request.status, 'provider-action-required');
assert.equal(request.providerRequest.capability, 'repository-search-and-read');
assert.equal(request.providerRequest.nextOperation, 'resolve-schema-material');
assert.equal(request.providerRequest.boundary.remoteWrite, false);

const providerResponse = await resolvePortableSchemaMaterial({
  schemaId: 'tiinex.topic.v1',
  providerResponses: [{
    providerId: 'github-connector',
    files: [{
      path: '.topics/.schemas/core/topic/tiinex.topic.v1.schema.md',
      content: topicMarkdown,
      source: {
        repository: 'Tiinex/docs',
        commit: '52ecdea0a75893882ce282214d155f70e1309c2a',
        path: '.topics/.schemas/core/topic/tiinex.topic.v1.schema.md',
        authority: 'canonical-core'
      }
    }]
  }]
});
assert.equal(providerResponse.status, 'resolved');
assert.equal(providerResponse.material.providerId, 'github-connector');
assert.equal(providerResponse.material.qualification.bindingMatch, true);
assert.equal(providerResponse.material.qualification.authority, 'canonical-binding-match');

let calls = 0;
const runtime = await resolvePortableSchemaMaterial({ schemaId: 'tiinex.experimental.provider-child.v1' }, {
  providers: [{
    id: 'host-runtime',
    priority: 100,
    remoteFetch: true,
    async resolveSchema({ schemaId }) {
      calls += 1;
      return { path: `${schemaId}.schema.md`, content: childMarkdown, source: { repository: 'Example/docs', commit: 'abc', authority: 'supplied' } };
    }
  }]
});
assert.equal(calls, 1);
assert.equal(runtime.status, 'resolved');
assert.equal(runtime.material.providerId, 'host-runtime');

const chain = await resolvePortableSchemaChainMaterial({
  schemaId: 'tiinex.experimental.provider-child.v1',
  files: [
    { path: 'schemas/tiinex.experimental.provider-child.v1.schema.md', content: childMarkdown },
    { path: 'schemas/tiinex.root.v1.schema.md', content: rootMarkdown }
  ]
});
assert.equal(chain.status, 'complete-to-root');
assert.deepEqual(chain.nodes.map((node) => node.schemaId), ['tiinex.experimental.provider-child.v1', 'tiinex.root.v1']);
assert.equal(chain.materials.schemaCache.length, 2);

const cached = await resolvePortableSchemaMaterial({
  schemaId: 'tiinex.experimental.provider-child.v1',
  schemaCache: chain.materials.schemaCache
});
assert.equal(cached.status, 'resolved');
assert.equal(cached.material.source.cached, true);

const catalog = listPortableMaterialProviders({
  files: [{ path: 'schema.md', content: childMarkdown }],
  tools: [{ name: 'GitHub.search', description: 'Search repository files.' }, { name: 'GitHub.fetch_file', description: 'Read repository files.' }]
});
assert.equal(catalog.providers.find((provider) => provider.id === 'loaded-material').available, true);
assert.equal(catalog.providers.find((provider) => provider.id === 'host-repository').available, true);


const unrelatedCache = {
  schema: 'tiinex.portable.schema-cache-entry.v1',
  cacheKey: 'unrelated',
  schemaId: 'tiinex.unrelated.v1',
  path: 'tiinex.unrelated.v1.schema.md',
  markdown: childMarkdown.replaceAll('tiinex.experimental.provider-child.v1', 'tiinex.unrelated.v1'),
  authority: 'supplied-unverified',
  source: {}
};
const boundedChain = await resolvePortableSchemaChainMaterial({
  schemaId: 'tiinex.experimental.provider-child.v1',
  files: [
    { path: 'schemas/tiinex.experimental.provider-child.v1.schema.md', content: childMarkdown },
    { path: 'schemas/tiinex.root.v1.schema.md', content: rootMarkdown }
  ],
  schemaCache: [unrelatedCache]
});
assert.equal(boundedChain.materials.schemaCache.length, 2, "chain result returns only resolved cache updates, not the caller's entire cache");
assert.equal(boundedChain.materials.schemaCache.some((entry) => entry.schemaId === 'tiinex.unrelated.v1'), false);

console.log('✓ portable schema providers, host handoff, cache, and parent-chain material resolution passed');
