import assert from 'node:assert/strict';
import { zipBufferToImportEntries } from '../../../adapters/archive/archive.adapter.js';
import { buildPortableRuntimePackage, inspectPortableRuntimePackage, PORTABLE_RUNTIME_PACKAGE_REHYDRATION_SCHEMA_ID, PORTABLE_RUNTIME_PACKAGE_ROUNDTRIP_SCHEMA_ID, rehydratePortableRuntimePackage, roundTripPortableRuntimePackage } from './runtime.package.js';
import { portableRuntimePackageZipBuffer } from '../output/node.zip.js';
import { runPortableOperation } from '../operation.catalog.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-23T00:00:00.000Z
  - Summary: Runtime package draft
  - Status: draft/local

---

# Runtime Package Draft

## Current Read

The portable runtime package is being tested.

# Continuity Integrity

- Draft Local Integrity
  - Method: portable-local-draft
  - Value: pending-explicit-export
`;
const input = {
  title: 'Portable runtime package test',
  stagedArtifacts: [{ id: 'draft-1', path: 'drafts/runtime.md', schemaId: 'tiinex.topic.v1', markdown, sourceMode: 'local-portable-staged', lifecycleStatus: 'draft' }],
  records: [{ id: 'source-1', title: 'Canonical source reference', path: 'topics/source.md', markdown, sourceMode: 'github', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', path: 'topics/source.md' }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: 'topics/source.md', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }],
  assets: [{ id: 'asset-1', path: 'assets/example.txt', name: 'Example', type: 'text/plain', content: 'asset-content', source: { adapterId: 'local' } }]
};
const built = buildPortableRuntimePackage(input, { clock: () => '2026-07-23T02:00:00.000Z' });
assert.equal(built.status, 'ready');
assert.equal(built.qualification.canonicalPackageSchemaLocked, false);
assert.equal(built.bundle.counts.localDraftFiles, 1);
assert.equal(built.bundle.counts.sourceReferenceFiles, 1);
assert.equal(built.bundle.counts.assetContentFiles, 1);

const inspected = inspectPortableRuntimePackage(built.bundle);
assert.equal(inspected.status, 'valid');

const roundtrip = roundTripPortableRuntimePackage({ bundle: built.bundle });
assert.equal(roundtrip.status, 'passed');
assert.equal(roundtrip.comparison.status, 'match');
assert.equal(roundtrip.importPlan.records.length, 1);
assert.equal(roundtrip.importPlan.sourceReferences.length, 1);
assert.equal(roundtrip.importPlan.records[0].source.adapterId, 'export-package');
assert.equal(roundtrip.importPlan.records[0].source.githubPolicy, 'not guessed');

const zip = portableRuntimePackageZipBuffer(built.bundle);
const parsed = await zipBufferToImportEntries(zip, { source: 'portable-runtime-package-test', excludeRepositoryInternals: true });
assert.equal(parsed.errors.length, 0);
assert.equal(parsed.entries.some((entry) => entry.path === 'tiinex.package/manifest.json'), true);
assert.equal(parsed.entries.some((entry) => entry.path === 'artifacts/drafts/runtime.md'), true);

const rehydrated = rehydratePortableRuntimePackage({ files: parsed.entries });
assert.equal(rehydrated.schema, PORTABLE_RUNTIME_PACKAGE_REHYDRATION_SCHEMA_ID);
assert.equal(rehydrated.status, 'rehydrated');
assert.equal(rehydrated.bundle.files.some((file) => file.kind === 'artifact-markdown'), true);
const serializedRoundTrip = roundTripPortableRuntimePackage({ files: parsed.entries });
assert.equal(serializedRoundTrip.status, 'passed');
assert.equal(serializedRoundTrip.comparison.status, 'match');

const operation = await runPortableOperation('roundtrip-runtime-package', { bundle: built.bundle });
assert.equal(operation.operation, 'roundtrip-runtime-package');
assert.equal(operation.resultSchema, PORTABLE_RUNTIME_PACKAGE_ROUNDTRIP_SCHEMA_ID);
assert.equal(operation.status, 'passed');

console.log('✓ portable runtime package build, import round-trip, boundaries, and zip serialization passed');
