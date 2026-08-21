import assert from 'node:assert/strict';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { schemaReferenceAuthoritiesForCreation } from '../schemas/creation.schemaReferences.js';
import { canonicalGithubSchemaSourceTargets, qualifyGithubSchemaSourceProvider } from '../schemas/schema.githubSourceTarget.js';
import { parseSchemaReferenceValue, qualifySchemaReferenceValue } from '../schemas/schema.reference.js';
import { schemaRegistry } from '../schemas/registry.js';
import { sealC14nV2Self } from '../integrity/integrity.c14nV2.js';

const topicModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.topic.v1');
const topic = buildArtifactCreationContract({ schemaId: topicModule.id, module: topicModule });
const values = { Summary: 'v463 lexical fidelity', 'Current Read': 'read', 'Design Direction': 'direction', 'Next Artifacts': 'next' };
const valid = createArtifactDraftMarkdown(topic, { values, createdAt: '2026-08-20T00:00:00Z' });
assert(valid);
assert.equal(validate(valid, topic), true);
const exactTarget = topic.schemaReferences.current.preferredTarget;
assert(exactTarget);

// A — authority qualification consumes exact raw link label/target lexemes. Presentation parsing must not trim aliases into authority.
const aliases = [
  `[tiinex.topic.v1]( ${exactTarget} )`,
  `[ tiinex.topic.v1 ](${exactTarget})`,
  `[ tiinex.topic.v1 ]( ${exactTarget} )`
];
for (const alias of aliases) {
  const mutated = reseal(valid.replace(/^  - Current Schema:.*$/m, `  - Current Schema: ${alias}`));
  assert.equal(validate(mutated, topic), false, alias);
  assert.equal(qualifySchemaReferenceValue(alias, topic.schemaReferences.current).state, 'unavailable', alias);
}
assert.equal(qualifySchemaReferenceValue(`[tiinex.topic.v1](${exactTarget})`, topic.schemaReferences.current).state, 'qualified');
assert.equal(qualifySchemaReferenceValue('tiinex.topic.v1', topic.schemaReferences.current).state, 'qualified');
assert.equal(parseSchemaReferenceValue(`[ tiinex.topic.v1 ]( ${exactTarget} )`).schemaId, ' tiinex.topic.v1 ');
assert.equal(parseSchemaReferenceValue(`[ tiinex.topic.v1 ]( ${exactTarget} )`).target, ` ${exactTarget} `);
assert.equal(qualifySchemaReferenceValue('[tiinex.topic.v1](https://example.invalid/schema.md)', topic.schemaReferences.current).state, 'unavailable');

// B — a generic repository/revision/path tuple does not establish GitHub provider authority.
const tuple = Object.freeze({ repository: 'Acme/schemas', commit: 'a'.repeat(40), path: 'schemas/custom.trace.md' });
for (const authority of [tuple, { ...tuple, provider: 'ipfs', kind: 'artifact-ref' }, { ...tuple, provider: 'custom' }]) {
  assert.equal(canonicalGithubSchemaSourceTargets(authority).state, 'unavailable');
}
const explicitGithub = Object.freeze({ ...tuple, provider: 'github' });
const githubTargets = canonicalGithubSchemaSourceTargets(explicitGithub);
assert.equal(githubTargets.state, 'qualified');
assert.equal(githubTargets.blobUrl, `https://github.com/Acme/schemas/blob/${'a'.repeat(40)}/schemas/custom.trace.md`);

// Explicit bundled-source provider qualification requires exact canonical GitHub binding evidence, not tuple shape alone.
const noProviderBinding = Object.freeze({ sourceRepository: tuple.repository, sourceCommit: tuple.commit, sourcePath: tuple.path, permalink: 'ipfs://example/schema' });
assert.equal(qualifyGithubSchemaSourceProvider(noProviderBinding, tuple).state, 'unavailable');
const githubBinding = Object.freeze({ ...noProviderBinding, permalink: githubTargets.blobUrl });
assert.equal(qualifyGithubSchemaSourceProvider(githubBinding, tuple).provider, 'github');

// Synthetic future/custom module with non-GitHub source authority remains Plain Schema Id.
const customModule = Object.freeze({
  id: 'example.custom.v1',
  binding: Object.freeze({ schemaId: 'example.custom.v1' }),
  schemaSource: Object.freeze({ qualify: () => Object.freeze({ state: 'qualified', authority: Object.freeze({ ...tuple, provider: 'ipfs' }) }) })
});
const customRefs = schemaReferenceAuthoritiesForCreation(customModule);
assert.equal(customRefs.current.targetAuthority, 'schema-id-only');
assert.equal(customRefs.current.preferredTarget, '');
assert.deepEqual(customRefs.current.exactTargets, []);

// The real bundled Topic source is explicitly provider-qualified by its exact canonical binding evidence.
const topicSource = topicModule.schemaSource.qualify();
assert.equal(topicSource.authority.provider, 'github');
assert.equal(topicSource.authority.providerQualification.state, 'qualified');
assert.equal(schemaReferenceAuthoritiesForCreation(topicModule).current.targetAuthority, 'exact-source-target');

console.log('post-v463 schema-reference lexical fidelity + source provider authority correction: PASS');

function validate(markdown, contract) {
  return validateArtifactCreationResult({ schemaId: contract.target.schemaId, status: 'local', sourceMode: 'local-create', markdown }, {}, { contract }).ok;
}
function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}
