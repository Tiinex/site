import assert from 'node:assert/strict';
import { canonicalGithubSchemaSourceTargets, qualifyExactGithubSchemaSourceTarget, qualifyGithubSchemaSourceProvider } from '../schemas/schema.githubSourceTarget.js';
import { parseSchemaReferenceValue, qualifySchemaReferenceValue, renderSchemaReference, schemaReferenceAuthorityFromBinding } from '../schemas/schema.reference.js';
import { schemaRegistry } from '../schemas/registry.js';

const commit = 'a'.repeat(40);

// A — every qualified canonical target must be representable by the exact markdown-link shape.
for (const path of ['schemas/custom)foo.trace.md', 'schemas/custom(foo).trace.md']) {
  const sourceAuthority = Object.freeze({ provider: 'github', repository: 'Acme/schemas', commit, path });
  const targets = canonicalGithubSchemaSourceTargets(sourceAuthority);
  assert.equal(targets.state, 'qualified', path);
  assert.equal(targets.blobUrl.includes(')'), false, path);
  assert.equal(targets.blobUrl.includes('('), false, path);
  assert.equal(targets.blobUrl.includes('%29'), path.includes(')'), path);
  assert.equal(targets.blobUrl.includes('%28'), path.includes('('), path);

  const authority = schemaReferenceAuthorityFromBinding('example.custom.v1', {}, sourceAuthority);
  const rendered = renderSchemaReference(authority);
  const parsed = parseSchemaReferenceValue(rendered);
  assert.equal(parsed.form, 'markdown-link', rendered);
  assert.equal(parsed.schemaId, 'example.custom.v1', rendered);
  assert.equal(parsed.target, targets.blobUrl, rendered);
  assert.equal(qualifySchemaReferenceValue(rendered, authority).state, 'qualified', rendered);
  assert.equal(qualifyExactGithubSchemaSourceTarget(targets.blobUrl, sourceAuthority).state, 'qualified');

  const rawAlias = targets.blobUrl.replaceAll('%28', '(').replaceAll('%29', ')');
  assert.notEqual(rawAlias, targets.blobUrl);
  assert.equal(qualifyExactGithubSchemaSourceTarget(rawAlias, sourceAuthority).state, 'unavailable', 'decode/re-encode aliases are not exact authority');
}

// Current built-in safe paths remain byte-for-byte unchanged.
const topic = schemaRegistry.modules.find((item) => item.id === 'tiinex.topic.v1');
const topicSource = topic.schemaSource.qualify();
assert.equal(topicSource.state, 'qualified');
const topicTargets = canonicalGithubSchemaSourceTargets(topicSource.authority);
assert.equal(topicTargets.blobUrl, topic.binding.permalink);
assert.equal(topicTargets.rawUrl, topic.binding.rawUrl);
const topicAuthority = schemaReferenceAuthorityFromBinding(topic.id, topic.binding, topicSource.authority);
assert.equal(qualifySchemaReferenceValue(renderSchemaReference(topicAuthority), topicAuthority).state, 'qualified');

// B — repository owner/repo dot segments are never exact lexical authority.
for (const repository of ['Acme/.', 'Acme/..', './schemas', '../schemas']) {
  const sourceAuthority = Object.freeze({ provider: 'github', repository, commit, path: 'schemas/custom.md' });
  const targets = canonicalGithubSchemaSourceTargets(sourceAuthority);
  assert.equal(targets.state, 'unavailable', repository);

  const lookingTarget = repository.startsWith('Acme/')
    ? `https://github.com/${repository}/blob/${commit}/schemas/custom.md`
    : `https://github.com/${repository}/blob/${commit}/schemas/custom.md`;
  const binding = Object.freeze({ permalink: lookingTarget, rawUrl: '', exactReferenceTarget: '' });
  assert.equal(qualifyGithubSchemaSourceProvider(binding, sourceAuthority).state, 'unavailable', repository);
}

// Normal admitted repository identities still qualify when explicit provider authority exists.
const ordinary = Object.freeze({ provider: 'github', repository: 'Acme/schemas.repo', commit, path: 'schemas/custom.trace.md' });
const ordinaryTargets = canonicalGithubSchemaSourceTargets(ordinary);
assert.equal(ordinaryTargets.state, 'qualified');
const ordinaryBinding = Object.freeze({ permalink: ordinaryTargets.blobUrl });
const ordinaryTuple = Object.freeze({ repository: ordinary.repository, commit: ordinary.commit, path: ordinary.path });
assert.equal(qualifyGithubSchemaSourceProvider(ordinaryBinding, ordinaryTuple).provider, 'github');

console.log('post-v464 canonical schema target representation + repository lexical authority correction: PASS');
