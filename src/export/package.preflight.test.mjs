import assert from 'node:assert/strict';
import { buildExportPackagePreflight } from './package.preflight.js';

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

const ready = buildExportPackagePreflight({
  id: 'w-ready',
  title: 'Ready package',
  records: [
    { id: 'draft-ready', title: 'Draft', path: 'drafts/draft.md', markdown: validDraftMarkdown, source: { adapterId: 'local' }, sourceMode: 'local-transition' },
    { id: 'source-ready', title: 'Source', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: 'topics/source.md', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }
  ],
  assets: [{ id: 'asset-ready', name: 'Image', path: 'assets/image.png', content: 'bytes', type: 'image/png', source: { adapterId: 'local' } }]
});

assert.equal(ready.schema, 'tiinex.export.package.preflight.v1');
assert.equal(ready.status, 'ready');
assert.equal(ready.counts.localDraftEntries, 1);
assert.equal(ready.counts.sourceReferenceEntries, 1);
assert.equal(ready.counts.pinnedSourceReferences, 1);
assert.equal(ready.counts.assetEntries, 1);
assert.equal(ready.assetEntries[0].status, 'content-available');
assert.equal(ready.sourceReferenceEntries[0].mode, 'preserve-source-reference');
assert.equal(ready.localDraftEntries[0].mode, 'embed-local-draft-markdown');

const degraded = buildExportPackagePreflight({
  id: 'w-degraded',
  title: 'Degraded package',
  records: [
    { id: 'source-unpinned', title: 'Source unpinned', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' } }
  ],
  assets: [{ id: 'asset-large', path: 'assets/large.bin', previewState: 'omitted-large', source: { adapterId: 'local' } }],
  workspaceMergeCandidates: [{ id: 'wc', path: 'root.workspace.md' }]
});
assert.equal(degraded.status, 'degraded');
assert.equal(degraded.counts.degradedSourceReferences, 1);
assert.equal(degraded.counts.metadataOnlyAssets, 1);
assert.equal(degraded.counts.workspaceCandidateEntries, 1);
assert.ok(degraded.findings.some((finding) => finding.code === 'export.package.source-reference.degraded'));
assert.ok(degraded.findings.some((finding) => finding.code === 'export.package.asset.metadata-only'));
assert.ok(degraded.findings.some((finding) => finding.code === 'export.package.workspace-candidate.open-merge-required'));

const blocked = buildExportPackagePreflight({
  id: 'w-blocked',
  title: 'Blocked package',
  records: [
    { id: 'no-md', title: 'No markdown', path: 'no-md.md', source: { adapterId: 'local' } },
    { id: 'leak', title: 'Leaked local', path: 'leak.md', markdown: validDraftMarkdown, source: { adapterId: 'local', repo: 'Tiinex/docs' } }
  ]
});
assert.equal(blocked.status, 'blocked');
assert.equal(blocked.counts.blockedLocalEntries, 1);
assert.ok(blocked.findings.some((finding) => finding.code === 'export.package.local-entry.blocked'));
assert.ok(blocked.findings.some((finding) => finding.code === 'record.local.github-provenance-leak'));

console.log('export.package.preflight: ok');
