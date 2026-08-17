import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT,
  CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST,
  gitBlobSha1,
  qualifyCanonicalTransitionSchemaCache
} from './canonicalTransition.schemaCache.js';

const fileBySchema = Object.freeze({
  'tiinex.root.v1': new URL(`./canonical-schema-cache/${CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT}/tiinex.root.v1.schema.md`, import.meta.url),
  'tiinex.transition.definition.v1': new URL(`./canonical-schema-cache/${CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT}/tiinex.transition.definition.v1.schema.md`, import.meta.url),
  'tiinex.task.v1': new URL('../schemas/core/task/tiinex.task.v1.schema.md', import.meta.url)
});
const entries = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => {
  const markdown = fs.readFileSync(fileBySchema[item.schemaId], 'utf8');
  assert.equal(gitBlobSha1(markdown), item.gitBlob, `${item.schemaId} cached bytes must retain exact Git blob identity`);
  return { ...item, markdown, sourceQualification: 'source-qualified-cache' };
});
assert.deepEqual(entries.map((item) => item.gitBlob), [
  '7078e4832872be0df0df4ee944ee1bcd1d886f12',
  '548dac027abcc4fddf918e294a80b5aca1603c46',
  'e4d545ad45382a150351ead587339d8b43cc0fb2'
]);
const exact = qualifyCanonicalTransitionSchemaCache(entries);
assert.equal(exact.status, 'qualified');
assert.equal(exact.sourceQualified, true);
assert.equal(exact.entries.length, 3);
const stale = entries.map((item, index) => index === 2 ? { ...item, markdown: `${item.markdown}\n` } : item);
const rejected = qualifyCanonicalTransitionSchemaCache(stale);
assert.equal(rejected.sourceQualified, false);
assert.ok(rejected.findings.some((finding) => finding.code === 'schema-cache-source-identity-mismatch' && finding.schemaId === 'tiinex.task.v1'));
console.log('canonical Transition product schema-cache source identity: PASS');
