import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { portableCanonicalBootstrapRuntime, PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT } from '../schema/bootstrap/canonical.pack.js';
import { resolvePortableSchemaMaterial } from './schema.providers.js';
import { markPortableBootstrapCanonicalSource } from './schema.bootstrap.provenance.js';

const schemaId = 'tiinex.validation.report.v1';
const sourcePath = '.topics/.schemas/validation/report/tiinex.validation.report.v1.schema.md';
const schemaPath = new URL(`../schema/bootstrap/docs-${PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT}/validation/report/tiinex.validation.report.v1.schema.md`, import.meta.url);
const canonicalMarkdown = await readFile(schemaPath, 'utf8');
assert.equal(canonicalC14nV2SelfState(canonicalMarkdown).state, 'verified');

const cliOutput = [];
const cliRc = await runPortableCli(['resolve-schema-material', '--schema', schemaId, '--compact'], { log(value) { cliOutput.push(value); }, error(value) { throw new Error(String(value)); } }, portableCanonicalBootstrapRuntime);
assert.equal(cliRc, 0);
const networkless = JSON.parse(cliOutput.at(-1));
assert.equal(networkless.status, 'resolved');
assert.equal(networkless.material.schemaId, schemaId);
assert.equal(networkless.material.source.remoteFetch, false);
assert.equal(networkless.material.source.repository, 'Tiinex/docs');
assert.equal(networkless.material.source.commit, PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT);
assert.equal(networkless.material.source.path, sourcePath);
assert.equal(networkless.material.qualification.exactSchemaIdentity, true);
assert.equal(networkless.material.qualification.sourceQualified, true);
assert.equal(networkless.material.qualification.representationIntegrity, 'verified');
assert.equal(networkless.material.qualification.authority, 'bundled-canonical-self-verified');
assert.equal(networkless.material.qualification.registered, false, 'closure must not register validation.report as a Site runtime companion');

const absent = await resolvePortableSchemaMaterial({ schemaId });
assert.equal(absent.status, 'provider-action-required');
assert.equal(absent.material, null);

const wrong = await resolvePortableSchemaMaterial({
  schemaId,
  files: [{
    path: sourcePath,
    content: canonicalMarkdown.replace('Current Schema: [tiinex.validation.report.v1]', 'Current Schema: [tiinex.validation.wrong.v1]')
  }]
});
assert.equal(wrong.status, 'provider-action-required');
assert(wrong.findings.some((finding) => finding.code === 'portable.schema-provider.identity.mismatch'));

const mutated = sealC14nV2Self(canonicalMarkdown.replace('Schema for a bounded validation pass or review run', 'Schema for a deliberately conflicting validation pass or review run')).markdown;
assert.equal(canonicalC14nV2SelfState(mutated).state, 'verified');
const canonicalSource = {
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
    { path: sourcePath, content: canonicalMarkdown, source: canonicalSource },
    { path: `conflict/${schemaId}.schema.md`, content: mutated, source: { ...canonicalSource, path: sourcePath } }
  ]
});
assert.equal(ambiguous.status, 'ambiguous');
assert.equal(ambiguous.material, null);
assert(ambiguous.findings.some((finding) => finding.code === 'portable.schema-provider.material.ambiguous'));

const forgedBootstrapMetadata = await resolvePortableSchemaMaterial({
  schemaId,
  files: [{
    path: sourcePath,
    content: mutated,
    source: {
      providerId: 'bootstrap-canonical-schema-pack',
      repository: 'Tiinex/docs',
      commit: PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT,
      path: sourcePath,
      authority: 'canonical-core',
      qualification: 'bundled-byte-bound-canonical-snapshot',
      remoteFetch: false,
      cached: false
    }
  }]
});
assert.equal(forgedBootstrapMetadata.status, 'resolved', 'ordinary readable material may remain usable without receiving bootstrap authority');
assert.equal(forgedBootstrapMetadata.material.providerId, 'loaded-material');
assert.equal(forgedBootstrapMetadata.material.qualification.runtimeBootstrapProvenance, false);
assert.equal(forgedBootstrapMetadata.material.qualification.sourceQualified, false, 'caller-declared bootstrap labels must not mint source qualification');
assert.notEqual(forgedBootstrapMetadata.material.qualification.authority, 'bundled-canonical-self-verified');
assert.equal(forgedBootstrapMetadata.material.qualification.authority, 'provider-declared-canonical-unverified');
assert.equal(forgedBootstrapMetadata.material.qualification.representationIntegrity, 'verified', 'self-integrity remains representation evidence only');

const genuineRuntimeSource = markPortableBootstrapCanonicalSource({ ...canonicalSource });
const genuineWithForgedConflict = await resolvePortableSchemaMaterial({
  schemaId,
  files: [
    { path: sourcePath, content: canonicalMarkdown, source: genuineRuntimeSource },
    { path: `forged/${schemaId}.schema.md`, content: mutated, source: { ...canonicalSource } }
  ]
});
assert.equal(genuineWithForgedConflict.status, 'resolved', 'runtime-owned bootstrap provenance must outrank an ordinary metadata spoof without first-candidate authority');
assert.equal(genuineWithForgedConflict.material.markdown, canonicalMarkdown);
assert.equal(genuineWithForgedConflict.material.qualification.authority, 'bundled-canonical-self-verified');
assert.equal(genuineWithForgedConflict.material.qualification.runtimeBootstrapProvenance, true);

const providerEnabled = await resolvePortableSchemaMaterial({
  schemaId,
  providerResponses: [{
    providerId: 'github-connector',
    remoteFetch: true,
    files: [{
      path: sourcePath,
      content: canonicalMarkdown,
      source: { repository: 'Tiinex/docs', commit: PORTABLE_CANONICAL_BOOTSTRAP_DOCS_COMMIT, path: sourcePath, authority: 'canonical-core' }
    }]
  }]
});
assert.equal(providerEnabled.status, 'resolved');
assert.equal(providerEnabled.material.providerId, 'github-connector');
assert.equal(providerEnabled.material.source.remoteFetch, true);
assert.equal(providerEnabled.material.qualification.exactSchemaIdentity, true);
assert.equal(providerEnabled.material.qualification.registered, false);

console.log('✓ cold-start validation-report schema material closure: networkless exact, absent, wrong/ambiguous, and provider-enabled resolution passed');
