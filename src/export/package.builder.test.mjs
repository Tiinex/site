import assert from 'node:assert/strict';
import { buildExportPackageBundle, inspectExportPackageBundle } from './package.builder.js';

const validDraftMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-21T00:00:00.000Z
  - Summary: Draft
  - Status: draft/local

---

# Draft

# Continuity Integrity

- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
`;

const readyWorkspace = {
  id: 'w-ready',
  title: 'Ready package',
  records: [
    { id: 'draft-ready', title: 'Draft', path: 'drafts/draft.md', markdown: validDraftMarkdown, source: { adapterId: 'local' }, sourceMode: 'local-transition' },
    { id: 'source-ready', title: 'Source', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'abcdef' } }
  ],
  assets: [{ id: 'asset-ready', name: 'Image', path: 'assets/image.png', content: 'image-bytes', type: 'image/png', source: { adapterId: 'local' } }]
};

const bundle = buildExportPackageBundle(readyWorkspace, { clock: () => '2026-07-21T02:10:00.000Z' });
assert.equal(bundle.schema, 'tiinex.export.package.bundle.v1');
assert.equal(bundle.status, 'ready');
assert.equal(bundle.boundary.includes('mutates no source'), true);
assert.equal(bundle.contract.status, 'ready');
assert.equal(bundle.manifest.counts.localDrafts, 1);
assert.equal(bundle.counts.localDraftFiles, 1);
assert.equal(bundle.counts.sourceReferenceFiles, 1);
assert.equal(bundle.counts.assetContentFiles, 1);
assert.ok(bundle.files.some((file) => file.path === 'tiinex.package/index.json'));
assert.ok(bundle.files.some((file) => file.path === 'tiinex.package/manifest.json'));
assert.ok(bundle.files.some((file) => file.path === 'tiinex.package/receipt.json'));
assert.ok(bundle.files.some((file) => file.path === 'artifacts/drafts/draft.md' && file.kind === 'artifact-markdown'));
assert.ok(bundle.files.some((file) => file.kind === 'source-reference' && file.content.includes('Tiinex/docs')));
assert.ok(bundle.files.some((file) => file.path === 'assets/assets/image.png' && file.kind === 'asset-content'));
assert.equal(bundle.files.filter((file) => file.kind === 'source-reference').every((file) => !file.path.startsWith('artifacts/')), true, 'source references must not become local artifacts');
assert.equal(bundle.files.filter((file) => file.kind === 'asset-content').every((file) => !file.path.startsWith('artifacts/')), true, 'assets must not become artifact leaves');
assert.ok(bundle.packageFingerprint.startsWith('tixfp1-'));
const inspection = inspectExportPackageBundle(bundle);
assert.equal(inspection.status, 'valid');

const repeat = buildExportPackageBundle(readyWorkspace, { clock: () => '2026-07-21T02:11:00.000Z' });
assert.equal(repeat.packageId, bundle.packageId, 'package id remains manifest-deterministic');
assert.notEqual(repeat.packageFingerprint, bundle.packageFingerprint, 'build receipt time changes the full file-map fingerprint');
assert.deepEqual(
  repeat.files.filter((file) => ['artifact-markdown', 'source-reference', 'asset-content', 'asset-metadata', 'workspace-candidate'].includes(file.kind)).map((file) => [file.path, file.fingerprint]),
  bundle.files.filter((file) => ['artifact-markdown', 'source-reference', 'asset-content', 'asset-metadata', 'workspace-candidate'].includes(file.kind)).map((file) => [file.path, file.fingerprint]),
  'material files remain deterministic across clock changes'
);

const degradedWorkspace = {
  id: 'w-degraded',
  title: 'Degraded package',
  records: [
    { id: 'source-unpinned', title: 'Source unpinned', path: '../topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' } }
  ],
  assets: [{ id: 'asset-large', path: '/assets/large.bin', previewState: 'omitted-large', source: { adapterId: 'local' } }],
  workspaceMergeCandidates: [{ id: 'wc', path: '../root.workspace.md' }]
};
const degraded = buildExportPackageBundle(degradedWorkspace, { clock: () => '2026-07-21T02:12:00.000Z' });
assert.equal(degraded.status, 'degraded');
assert.equal(degraded.counts.sourceReferenceFiles, 1);
assert.equal(degraded.counts.assetMetadataFiles, 1);
assert.equal(degraded.counts.workspaceCandidateFiles, 1);
assert.ok(degraded.files.some((file) => file.kind === 'asset-metadata' && file.path.startsWith('metadata/assets/')));
assert.ok(degraded.findings.some((finding) => finding.code === 'export.package.bundle.source-reference.degraded'));
assert.equal(inspectExportPackageBundle(degraded).status, 'valid');

const blockedWorkspace = {
  id: 'w-blocked',
  title: 'Blocked package',
  records: [{ id: 'no-md', title: 'No markdown', path: 'no-md.md', source: { adapterId: 'local' } }]
};
const blocked = buildExportPackageBundle(blockedWorkspace, { clock: () => '2026-07-21T02:13:00.000Z' });
assert.equal(blocked.status, 'blocked');
assert.equal(blocked.counts.materialFiles, 0, 'blocked package should not include material files by default');
assert.ok(blocked.files.some((file) => file.path === 'tiinex.package/manifest.json'));
assert.ok(blocked.findings.some((finding) => finding.code === 'export.package.bundle.blocked'));
assert.equal(inspectExportPackageBundle(blocked).status, 'valid');

const tampered = Object.assign({}, bundle, { files: [Object.assign({}, bundle.files[0], { bytes: 1 })] });
assert.equal(inspectExportPackageBundle(tampered).status, 'invalid');

console.log('export.package.builder: ok');
