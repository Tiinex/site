import assert from 'node:assert/strict';
import { buildReingestPlan } from './reingest.plan.js';

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

const readySource = buildReingestPlan({
  id: 'w-source',
  title: 'Source workspace',
  sources: [{ id: 'github:tiinex/docs', adapterId: 'github', repo: 'Tiinex/docs', ref: 'main' }],
  records: [{ id: 'source-1', title: 'Source', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: 'topics/source.md', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }],
  assets: []
});
assert.equal(readySource.schema, 'tiinex.reingest.plan.v1');
assert.equal(readySource.status, 'ready');
assert.equal(readySource.counts.pinnedSourceTargets, 1);
assert.equal(readySource.sourceTargets[0].status, 'pinned');

const degraded = buildReingestPlan({
  id: 'w-degraded',
  title: 'Degraded workspace',
  sources: [{ id: 'github:tiinex/docs', adapterId: 'github', repo: 'Tiinex/docs', ref: '' }],
  records: [
    { id: 'draft-ready', title: 'Draft', path: 'drafts/draft.md', markdown: validDraftMarkdown, source: { adapterId: 'local' }, sourceMode: 'local-transition' },
    { id: 'source-unpinned', title: 'Source unpinned', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' } }
  ],
  assets: [{ id: 'asset-large', path: 'assets/large.bin', previewState: 'omitted-large', source: { adapterId: 'local' } }],
  workspaceMergeCandidates: [{ id: 'wc', path: 'workspace.workspace.md' }]
});
assert.equal(degraded.status, 'degraded');
assert.equal(degraded.counts.localDraftTargets, 1);
assert.equal(degraded.counts.degradedSourceTargets, 1);
assert.equal(degraded.counts.metadataOnlyAssets, 1);
assert.equal(degraded.counts.workspaceCandidates, 1);
assert.ok(degraded.findings.some((finding) => finding.code === 'reingest.github.ref-unpinned'));
assert.ok(degraded.findings.some((finding) => finding.code === 'reingest.asset.metadata-only'));
assert.ok(degraded.findings.some((finding) => finding.code === 'reingest.workspace-candidate.explicit-open-merge-required'));

const blocked = buildReingestPlan({
  id: 'w-blocked',
  title: 'Blocked workspace',
  sources: [{ id: 'local', adapterId: 'local', repo: 'Tiinex/docs' }],
  records: [{ id: 'leak', title: 'Leaked local', path: 'leak.md', markdown: validDraftMarkdown, source: { adapterId: 'local', repo: 'Tiinex/docs' } }]
});
assert.equal(blocked.status, 'blocked');
assert.ok(blocked.findings.some((finding) => finding.code === 'record.local.github-provenance-leak'));

console.log('reingest.plan: ok');
