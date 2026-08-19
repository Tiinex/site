import assert from 'node:assert/strict';
import { buildExportPackageContract, buildExportPackageManifest, buildExportPackageReceipt } from './package.manifest.js';

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
    { id: 'source-ready', title: 'Source', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: 'topics/source.md', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }
  ],
  assets: [{ id: 'asset-ready', name: 'Image', path: 'assets/image.png', content: 'bytes', type: 'image/png', source: { adapterId: 'local' } }]
};

const manifest = buildExportPackageManifest(readyWorkspace, { clock: () => '2026-07-21T02:00:00.000Z' });
assert.equal(manifest.schema, 'tiinex.export.package.manifest.v1');
assert.equal(manifest.status, 'ready');
assert.equal(manifest.packageScope.sourceMutation, false);
assert.equal(manifest.packageScope.remoteFetch, false);
assert.equal(manifest.counts.localDrafts, 1);
assert.equal(manifest.counts.sourceReferences, 1);
assert.equal(manifest.counts.assets, 1);
assert.equal(manifest.material.localDrafts[0].packagePath, 'artifacts/drafts/draft.md');
assert.equal(manifest.material.localDrafts[0].content.available, true);
assert.ok(manifest.material.localDrafts[0].content.fingerprint.startsWith('tixfp1-'));
assert.equal(manifest.material.sourceReferences[0].kind, 'source-reference');
assert.equal(manifest.material.sourceReferences[0].target.repo, 'Tiinex/docs');
assert.equal(manifest.material.sourceReferences[0].target.ref, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
assert.equal(manifest.material.assets[0].kind, 'asset');
assert.equal(manifest.material.assets[0].content.available, true);
assert.equal(manifest.material.blocked.length, 0);
assert.ok(manifest.integrity.fingerprint.startsWith('tixfp1-'));

const repeat = buildExportPackageManifest(readyWorkspace, { clock: () => '2026-07-21T03:00:00.000Z' });
assert.equal(repeat.packageId, manifest.packageId, 'package id should be deterministic across clock changes');
assert.equal(repeat.integrity.fingerprint, manifest.integrity.fingerprint, 'manifest fingerprint should be content deterministic');
assert.notEqual(repeat.createdAt, manifest.createdAt, 'createdAt may reflect planning run time');

const receipt = buildExportPackageReceipt(manifest, { clock: () => '2026-07-21T02:01:00.000Z' });
assert.equal(receipt.schema, 'tiinex.export.package.receipt.v1');
assert.equal(receipt.state, 'planned');
assert.equal(receipt.status, 'ready');
assert.equal(receipt.manifestFingerprint, manifest.integrity.fingerprint);
assert.ok(receipt.guarantees.some((item) => item.includes('Source-backed material')));
assert.equal(receipt.findings.length, 0);

const degradedWorkspace = {
  id: 'w-degraded',
  title: 'Degraded package',
  records: [
    { id: 'source-unpinned', title: 'Source unpinned', path: '../topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' } }
  ],
  assets: [{ id: 'asset-large', path: '/assets/large.bin', previewState: 'omitted-large', source: { adapterId: 'local' } }],
  workspaceMergeCandidates: [{ id: 'wc', path: '../root.workspace.md' }]
};
const degraded = buildExportPackageManifest(degradedWorkspace, { clock: () => '2026-07-21T02:02:00.000Z' });
assert.equal(degraded.status, 'degraded');
assert.equal(degraded.counts.metadataOnlyAssets, 1);
assert.equal(degraded.counts.workspaceContextCandidates, 1);
assert.equal(degraded.material.sourceReferences[0].path, 'topics/source.md');
assert.equal(degraded.material.assets[0].path, 'assets/large.bin');
assert.equal(degraded.material.workspaceContextCandidates[0].path, 'root.workspace.md');
assert.ok(degraded.findings.some((finding) => finding.code === 'export.package.source-reference.degraded'));
const degradedReceipt = buildExportPackageReceipt(degraded, { clock: () => '2026-07-21T02:03:00.000Z' });
assert.equal(degradedReceipt.state, 'planned');
assert.ok(degradedReceipt.nextActions.some((item) => item.includes('metadata-only assets')));

const blockedWorkspace = {
  id: 'w-blocked',
  title: 'Blocked package',
  records: [
    { id: 'no-md', title: 'No markdown', path: 'no-md.md', source: { adapterId: 'local' } },
    { id: 'leak', title: 'Leaked local', path: 'leak.md', markdown: validDraftMarkdown, source: { adapterId: 'local', repo: 'Tiinex/docs' } }
  ]
};
const contract = buildExportPackageContract(blockedWorkspace, { clock: () => '2026-07-21T02:04:00.000Z' });
assert.equal(contract.schema, 'tiinex.export.package.contract.v1');
assert.equal(contract.status, 'blocked');
assert.equal(contract.preflight.status, 'blocked');
assert.equal(contract.manifest.status, 'blocked');
assert.equal(contract.receipt.state, 'blocked');
assert.equal(contract.manifest.counts.blocked, 1);
assert.ok(contract.manifest.material.blocked.some((entry) => entry.id === 'no-md'));
assert.ok(contract.manifest.findings.some((finding) => finding.code === 'record.local.github-provenance-leak'));
assert.ok(contract.receipt.nextActions.some((item) => item.includes('Resolve blocked')));

console.log('export.package.manifest: ok');
