import assert from 'node:assert/strict';
import { zipBufferToImportEntries } from '../adapters/archive/archive.adapter.js';
import { buildExportPackageBundle, inspectExportPackageBundle } from './package.builder.js';
import { buildExportPackageFileMap, finalizeFile } from './package.fileMap.js';
import { exportPackageZipUint8Array } from './package.zip.js';
import { packageFileBytes, sha256Hex, utf8Bytes } from './package.bytes.js';
import { rehydratePortableRuntimePackage, roundTripPortableRuntimePackage } from '../tooling/portable/package/runtime.package.js';

const markdown = (title) => `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-19T00:00:00.000Z\n  - Summary: ${title}\n  - Status: draft/local\n\n---\n\n# ${title}\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;

const workspaceMarkdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.workspace.v1\n  - Created At: 2026-08-19T00:00:00.000Z\n  - Summary: Workspace\n\n---\n\n# Workspace\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;

const workspace = {
  id: 'w-transport',
  title: 'Transport foundation',
  workspaceMarkdown,
  workspaceImport: { sourceMode: 'local-manual', boundary: 'browser-local', localDraft: true, path: 'root.workspace.md' },
  records: [
    { id: 'a', title: 'A', path: 'same.md', markdown: markdown('A'), sourceMode: 'local-transition', source: { adapterId: 'local' } },
    { id: 'b', title: 'B', path: 'same.md', markdown: markdown('B'), sourceMode: 'local-transition', source: { adapterId: 'local' } }
  ],
  assets: [
    { id: 'bin', path: 'assets/raw.bin', type: 'application/octet-stream', bytes: new Uint8Array([0, 1, 127, 128, 255]), source: { adapterId: 'local' } },
    { id: 'png', path: 'assets/tiny.png', type: 'image/png', dataUrl: 'data:image/png;base64,iVBORw0KGgo=', source: { adapterId: 'local' } },
    { id: 'remote', path: 'assets/remote.bin', type: 'application/octet-stream', content: 'SHOULD-NOT-BE-EMBEDDED', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: 'assets/remote.bin', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }
  ]
};

const bundle = buildExportPackageBundle(workspace, { clock: () => '2026-08-19T13:20:00.000Z' });
assert.equal(bundle.status, 'degraded', 'collision warning is disclosed but package remains buildable');
assert.equal(inspectExportPackageBundle(bundle).status, 'valid');
assert.equal(bundle.fileMap.schema, 'tiinex.export.package.file-map.v1');
assert.ok(bundle.packageRepresentationSha256);
const artifacts = bundle.files.filter((file) => file.kind === 'artifact-markdown');
assert.equal(artifacts.length, 2);
assert.equal(new Set(artifacts.map((file) => file.path)).size, 2);
assert.equal(bundle.manifest.material.localDrafts[0].packagePath, artifacts.find((file) => file.entryId === 'a').path);
assert.equal(bundle.manifest.material.localDrafts[1].packagePath, artifacts.find((file) => file.entryId === 'b').path);

const raw = bundle.files.find((file) => file.entryId === 'bin');
assert.deepEqual([...packageFileBytes(raw)], [0, 1, 127, 128, 255]);
assert.equal(raw.sha256, sha256Hex(new Uint8Array([0, 1, 127, 128, 255])));
const png = bundle.files.find((file) => file.entryId === 'png');
assert.deepEqual([...packageFileBytes(png)], [137, 80, 78, 71, 13, 10, 26, 10]);
const remote = bundle.files.find((file) => file.entryId === 'remote');
assert.equal(remote.kind, 'asset-source-reference');
assert.equal(new TextDecoder().decode(packageFileBytes(remote)).includes('SHOULD-NOT-BE-EMBEDDED'), false);
assert.ok(bundle.files.some((file) => file.kind === 'workspace-context'));
assert.ok(bundle.files.some((file) => file.kind === 'workspace-context-markdown'));

const zip = exportPackageZipUint8Array(bundle);
const parsed = await zipBufferToImportEntries(zip, { source: 'transport-foundation-test', excludeRepositoryInternals: true });
assert.equal(parsed.errors.length, 0);
const rehydrated = rehydratePortableRuntimePackage({ files: parsed.entries });
assert.equal(rehydrated.status, 'rehydrated');
assert.equal(rehydrated.inspection.status, 'valid');
const roundtrip = roundTripPortableRuntimePackage({ files: parsed.entries });
assert.equal(roundtrip.status, 'passed-degraded');
assert.equal(roundtrip.comparison.status, 'match');
assert.equal(roundtrip.importPlan.records.length, 2);
assert.equal(roundtrip.importPlan.assets.length, 2);
assert.equal(roundtrip.importPlan.sourceReferences.length, 1);
assert.equal(roundtrip.importPlan.workspaceEntries.length, 1);
assert.deepEqual([...roundtrip.importPlan.assets.find((asset) => asset.packageEntryId === 'bin').bytes], [0, 1, 127, 128, 255]);

// Physical loss must fail, not degrade to a false-positive match.
const missing = { ...bundle, files: bundle.files.filter((file) => file.entryId !== 'b') };
assert.equal(inspectExportPackageBundle(missing).status, 'invalid');
assert.ok(inspectExportPackageBundle(missing).findings.some((finding) => finding.code.includes('claimed-file-missing')));

// Unmapped extra material must fail closed.
const extra = finalizeFile({ path: 'artifacts/extra.md', kind: 'artifact-markdown', entryId: 'extra', content: markdown('Extra') });
const withExtra = { ...bundle, files: [...bundle.files, extra] };
assert.equal(inspectExportPackageBundle(withExtra).status, 'invalid');
assert.ok(inspectExportPackageBundle(withExtra).findings.some((finding) => finding.code.includes('unmapped-file')));

// Byte tamper is caught by per-file and durable file-map SHA authority.
const rawIndex = bundle.files.indexOf(raw);
const changedRaw = finalizeFile({ ...raw, data: new Uint8Array([9, 9, 9]) });
const tamperedBytes = { ...bundle, files: bundle.files.map((file, index) => index === rawIndex ? changedRaw : file) };
assert.equal(inspectExportPackageBundle(tamperedBytes).status, 'invalid');
assert.ok(inspectExportPackageBundle(tamperedBytes).findings.some((finding) => finding.code.includes('sha256-mismatch')));

// Even if an attacker rebuilds the outer file map after changing the manifest, receipt/contract cross-control truth must fail.
const manifestIndex = bundle.files.findIndex((file) => file.path === 'tiinex.package/manifest.json');
const fileMapIndex = bundle.files.findIndex((file) => file.path === 'tiinex.package/file-map.json');
const manifestObject = JSON.parse(new TextDecoder().decode(packageFileBytes(bundle.files[manifestIndex])));
manifestObject.material.localDrafts[0].path = 'tampered/path.md';
const changedManifest = finalizeFile({ ...bundle.files[manifestIndex], content: `${JSON.stringify(manifestObject, null, 2)}\n`, data: undefined });
const governed = bundle.files.map((file, index) => index === manifestIndex ? changedManifest : file).filter((_, index) => index !== fileMapIndex);
const rebuiltMap = buildExportPackageFileMap(governed, { packageId: bundle.packageId });
const changedMap = finalizeFile({ ...bundle.files[fileMapIndex], content: `${JSON.stringify(rebuiltMap, null, 2)}\n`, data: undefined });
const controlTamper = { ...bundle, files: bundle.files.map((file, index) => index === manifestIndex ? changedManifest : index === fileMapIndex ? changedMap : file) };
const controlInspection = inspectExportPackageBundle(controlTamper);
assert.equal(controlInspection.status, 'invalid');
assert.ok(controlInspection.findings.some((finding) => finding.code === 'export.package.bundle.manifest-fingerprint-mismatch' || finding.code === 'export.package.bundle.receipt-manifest-mismatch'));

// Rebuilding only the file map after governed material-byte mutation cannot leave the build receipt green.
const changedRawAdvanced = finalizeFile({ ...raw, data: new Uint8Array([5, 4, 3, 2, 1]) });
const advancedGoverned = bundle.files.map((file) => file.entryId === 'bin' ? changedRawAdvanced : file).filter((file) => file.path !== 'tiinex.package/file-map.json');
const advancedMap = buildExportPackageFileMap(advancedGoverned, { packageId: bundle.packageId });
const advancedMapFile = finalizeFile({ ...bundle.files[fileMapIndex], content: `${JSON.stringify(advancedMap, null, 2)}\n`, data: undefined });
const advancedTamper = { ...bundle, files: bundle.files.map((file) => file.entryId === 'bin' ? changedRawAdvanced : file.path === 'tiinex.package/file-map.json' ? advancedMapFile : file) };
const advancedInspection = inspectExportPackageBundle(advancedTamper);
assert.equal(advancedInspection.status, 'invalid');
assert.ok(advancedInspection.findings.some((finding) => finding.code === 'export.package.bundle.build-receipt-material-mismatch'));

// Zero-record handoff still carries canonical workspace context and owned workspace Markdown.
const contextOnly = buildExportPackageBundle({ id: 'w-context', title: 'Context only', workspaceMarkdown, workspaceImport: { sourceMode: 'local-manual', boundary: 'browser-local', localDraft: true }, records: [], assets: [] }, { clock: () => '2026-08-19T13:21:00.000Z' });
assert.equal(inspectExportPackageBundle(contextOnly).status, 'valid');
const contextRoundtrip = roundTripPortableRuntimePackage({ bundle: contextOnly });
assert.equal(contextRoundtrip.importPlan.counts.importedRecords, 0);
assert.equal(contextRoundtrip.importPlan.counts.workspaceContext, 1);
assert.equal(contextRoundtrip.importPlan.counts.workspaceEntries, 1);

console.log('export.package.transportFoundation: ok');
