import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { buildPortableSchemaGuide } from '../schema/schema.guide.js';
import { portableCanonicalBootstrapRuntime, PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT } from '../schema/bootstrap/canonical.pack.js';
import { markPortableBootstrapCanonicalSource } from './schema.bootstrap.provenance.js';
import { resolvePortableSchemaMaterial } from './schema.providers.js';

const schemaId = 'tiinex.party.role.v1';
const sourcePath = '.topics/.schemas/party/role/tiinex.party.role.v1.schema.md';
const schemaPath = new URL(`../schema/bootstrap/docs-${PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT}/party/role/tiinex.party.role.v1.schema.md`, import.meta.url);
const canonicalMarkdown = await readFile(schemaPath, 'utf8');
assert.equal(createHash('sha256').update(canonicalMarkdown).digest('hex'), '77b6b05b03f0ea777fe4d0aeb087d72cbc589b2e1779a03f2c30b6acef4ca22b');
assert.equal(canonicalC14nV2SelfState(canonicalMarkdown).state, 'verified');

const resolvedOutput = [];
assert.equal(await runPortableCli(['resolve-schema-material', '--schema', schemaId, '--compact'], { log(value) { resolvedOutput.push(value); }, error(value) { throw new Error(String(value)); } }, portableCanonicalBootstrapRuntime), 0);
const resolved = JSON.parse(resolvedOutput.at(-1));
assert.equal(resolved.status, 'resolved');
assert.equal(resolved.material.schemaId, schemaId);
assert.equal(resolved.material.source.repository, 'Tiinex/docs');
assert.equal(resolved.material.source.commit, PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT);
assert.equal(resolved.material.source.path, sourcePath);
assert.equal(resolved.material.source.remoteFetch, false);
assert.equal(resolved.material.qualification.authority, 'bundled-canonical-self-verified');
assert.equal(resolved.material.qualification.sourceQualified, true);
assert.equal(resolved.material.qualification.representationIntegrity, 'verified');
assert.equal(resolved.material.qualification.registered, false, 'Party Role readable authoring material must not register a Site runtime companion');

const guideOutput = [];
assert.equal(await runPortableCli(['schema-guide', '--schema', schemaId, '--task', 'create', '--detail', 'compact'], { log(value) { guideOutput.push(value); }, error(value) { throw new Error(String(value)); } }, portableCanonicalBootstrapRuntime), 0);
const guide = JSON.parse(guideOutput.at(-1)).guide;
assert.equal(guide.capability.fallbackUsed, false, 'qualified readable Party Role contract must not be reported as Root authoring fallback');
assert.equal(guide.capability.resolvedThrough, schemaId);
assert.equal(guide.capability.status, 'readable-exact-contract');
assert.equal(guide.capability.exactModule, false, 'readable exact authoring contract is distinct from registered runtime companion availability');
assert.equal(guide.capability.runtimeFallbackUsed, true);
assert.equal(guide.capability.runtimeResolvedThrough, 'tiinex.root.v1');
assert.equal(guide.authority.exactReadableContract, true);
assert.equal(guide.authority.materialQualification.authority, 'bundled-canonical-self-verified');
assert.deepEqual(guide.requiredStructure, ['Role Identity', 'Role Boundary', 'Authority And Responsibility Boundary', 'Holder Relationship', 'Interpretation Limits']);
assert.deepEqual(guide.requiredFields, ['Role Label', 'Role Kind', 'In Scope', 'Out Of Scope', 'May Do', 'Does Not Authorize', 'Holder State', 'Does Not Prove', 'Must Not Be Treated As']);

for (const rolePath of ['.topics/development/sigma/role/001-1-sigma-role.trace.md', '.topics/development/loom/role/001-loom-role.trace.md']) {
  const output = [];
  const rc = await runPortableCli(['validate-draft', rolePath, '--schema', schemaId, '--compact'], { log(value) { output.push(value); }, error(value) { throw new Error(String(value)); } }, portableCanonicalBootstrapRuntime);
  assert.equal(rc, 0);
  const validation = JSON.parse(output.at(-1)).validation;
  assert.equal(validation.structural.status, 'valid');
  assert.deepEqual(validation.structural.missingSections, []);
  assert.deepEqual(validation.structural.missingFields, []);
  assert.equal(validation.qualification.readableSchemaAvailable, true);
  assert.equal(validation.qualification.contractDrivenStructuralValidation, true);
  assert.equal(validation.qualification.exactRuntimeValidation, false);
  assert.equal(validation.qualification.fallbackUsed, true, 'runtime audit must continue to disclose Root fallback separately from exact readable contract validation');
}

const absent = await resolvePortableSchemaMaterial({ schemaId });
assert.equal(absent.status, 'provider-action-required');
assert.equal(absent.material, null);

const wrong = await resolvePortableSchemaMaterial({
  schemaId,
  files: [{ path: sourcePath, content: canonicalMarkdown.replace('Current Schema: [tiinex.party.role.v1]', 'Current Schema: [tiinex.party.wrong.v1]') }]
});
assert.equal(wrong.status, 'provider-action-required');
assert.equal(wrong.material, null);
assert(wrong.findings.some((finding) => finding.code === 'portable.schema-provider.identity.mismatch'));

const stale = canonicalMarkdown.replace('Schema for a bounded role, capacity, responsibility, or authority-facing position', 'Schema for a stale role representation');
assert.notEqual(canonicalC14nV2SelfState(stale).state, 'verified');
const runtimeSource = markPortableBootstrapCanonicalSource({
  providerId: 'bootstrap-canonical-schema-pack',
  repository: 'Tiinex/docs',
  commit: PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT,
  path: sourcePath,
  authority: 'canonical-core',
  qualification: 'bundled-byte-bound-canonical-snapshot'
});
const staleRuntime = await resolvePortableSchemaMaterial({ schemaId, files: [{ path: sourcePath, content: stale, source: runtimeSource }] });
assert.equal(staleRuntime.status, 'provider-action-required');
assert.equal(staleRuntime.material, null);
assert(staleRuntime.findings.some((finding) => finding.code === 'portable.schema-provider.bootstrap.integrity.invalid'));

const conflictingMarkdown = sealC14nV2Self(canonicalMarkdown.replace('Schema for a bounded role, capacity, responsibility, or authority-facing position', 'Schema for a deliberately conflicting bounded role')).markdown;
assert.equal(canonicalC14nV2SelfState(conflictingMarkdown).state, 'verified');
const callerCanonicalLabels = {
  providerId: 'bootstrap-canonical-schema-pack',
  repository: 'Tiinex/docs',
  commit: PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT,
  path: sourcePath,
  authority: 'canonical-core',
  qualification: 'bundled-byte-bound-canonical-snapshot'
};
const ambiguous = await resolvePortableSchemaMaterial({
  schemaId,
  files: [
    { path: sourcePath, content: canonicalMarkdown, source: callerCanonicalLabels },
    { path: `conflict/${schemaId}.schema.md`, content: conflictingMarkdown, source: callerCanonicalLabels }
  ]
});
assert.equal(ambiguous.status, 'ambiguous');
assert.equal(ambiguous.material, null);
assert(ambiguous.findings.some((finding) => finding.code === 'portable.schema-provider.material.ambiguous'));

const spoofedGuide = buildPortableSchemaGuide({
  schemaId,
  task: 'create',
  files: [{ path: sourcePath, content: canonicalMarkdown, source: callerCanonicalLabels }]
});
assert.equal(spoofedGuide.guide.authority.exactReadableContract, false, 'caller-declared canonical labels must not mint exact readable authoring authority');
assert.equal(spoofedGuide.guide.capability.fallbackUsed, true);
assert.equal(spoofedGuide.guide.capability.runtimeFallbackUsed, true);
assert.equal(spoofedGuide.guide.authority.materialQualification.sourceQualified, false);
assert.notEqual(spoofedGuide.guide.authority.materialQualification.authority, 'bundled-canonical-self-verified');

const spoofGuideOutput = [];
assert.equal(await runPortableCli(['schema-guide', '--schema', schemaId, '--task', 'create', '--detail', 'compact'], { log(value) { spoofGuideOutput.push(value); }, error(value) { throw new Error(String(value)); } }, {
  defaultSchemaMaterialPaths: [],
  defaultSchemaSource: portableCanonicalBootstrapRuntime.defaultSchemaSource
}), 2, 'without runtime bootstrap material the CLI should not silently acquire child-schema authority');

console.log('✓ Party Role exact portable authoring/validation material closure passed');
