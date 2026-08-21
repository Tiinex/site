import assert from 'node:assert/strict';
import { canonicalGithubSchemaSourceTargets, qualifyExactGithubSchemaSourceTarget } from '../schemas/schema.githubSourceTarget.js';
import { schemaReferenceAuthoritiesForCreation } from '../schemas/creation.schemaReferences.js';
import { schemaRegistry } from '../schemas/registry.js';

const topic = schemaRegistry.modules.find((item) => item.id === 'tiinex.topic.v1');
const sourceQualification = topic.schemaSource.qualify();
assert.equal(sourceQualification.state, 'qualified');
const authority = sourceQualification.authority;
const canonical = canonicalGithubSchemaSourceTargets(authority);
assert.equal(canonical.state, 'qualified');
assert.equal(qualifyExactGithubSchemaSourceTarget(canonical.blobUrl, authority).state, 'qualified');
assert.equal(qualifyExactGithubSchemaSourceTarget(canonical.rawUrl, authority).state, 'qualified');

const commit = authority.commit;
const path = authority.path;
const negatives = [
  `https://evil.github.com/Tiinex/docs/blob/${commit}/${path}`,
  `http://github.com/Tiinex/docs/blob/${commit}/${path}`,
  `ftp://github.com/Tiinex/docs/blob/${commit}/${path}`,
  `javascript://github.com/Tiinex/docs/blob/${commit}/${path}`,
  `data://github.com/Tiinex/docs/blob/${commit}/${path}`,
  `https://github.com:444/Tiinex/docs/blob/${commit}/${path}`,
  `https://user:pass@github.com/Tiinex/docs/blob/${commit}/${path}`,
  `http://raw.githubusercontent.com/Tiinex/docs/${commit}/${path}`,
  `https://github.com/Other/docs/blob/${commit}/${path}`,
  `https://github.com/Tiinex/docs/blob/${'1'.repeat(40)}/${path}`,
  `https://github.com/Tiinex/docs/blob/main/${path}`,
  `https://github.com/Tiinex/docs/blob/${commit}/README.md`,
  `https://github.com/Tiinex/docs/blob/${commit}/.topics/.schemas/core/topic/../topic/tiinex.topic.v1.schema.md`,
  `https://github.com/Tiinex/docs/blob/${commit}/.topics/.schemas/core/topic/%2e%2e/topic/tiinex.topic.v1.schema.md`,
  `https://github.com/Tiinex/docs/blob/${commit}/.topics/.schemas/core/topic\\tiinex.topic.v1.schema.md`,
  `https://github.com/Tiinex/docs/blob/${commit}/.topics/.schemas/core/topic%2Ftiinex.topic.v1.schema.md`,
  `https://github.com/Tiinex/docs/blob/${commit}/.topics//.schemas/core/topic/tiinex.topic.v1.schema.md`,
  `${canonical.blobUrl}?plain=1`,
  `${canonical.blobUrl}#L1`,
];
for (const target of negatives) assert.equal(qualifyExactGithubSchemaSourceTarget(target, authority).state, 'unavailable', target);

const badBinding = Object.freeze({ ...topic, binding: Object.freeze({ ...topic.binding, permalink: negatives[0], rawUrl: negatives[1], exactReferenceTarget: negatives[2] }) });
const refs = schemaReferenceAuthoritiesForCreation(badBinding);
assert.equal(refs.current.preferredTarget, canonical.blobUrl, 'unsafe binding aliases cannot become preferred exact authority');
assert.equal(refs.current.targetAuthority, 'exact-source-target');
assert.deepEqual(refs.current.exactTargets, [canonical.blobUrl, canonical.rawUrl]);
for (const target of negatives) assert.equal(refs.current.exactTargets.includes(target), false);

const viewerLocal = schemaRegistry.modules.find((item) => item.id === 'tiinex.task.v1');
assert.equal(schemaReferenceAuthoritiesForCreation(viewerLocal).current.preferredTarget, '');
assert.equal(schemaReferenceAuthoritiesForCreation(viewerLocal).current.targetAuthority, 'schema-id-only');

console.log('post-v462 exact schema-reference lexical/source-target authority correction: PASS');
