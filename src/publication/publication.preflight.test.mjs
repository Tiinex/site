import assert from 'node:assert/strict';
import { buildPublicationPreflight } from './publication.preflight.js';

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

const ready = buildPublicationPreflight({
  id: 'w-ready',
  title: 'Ready',
  sources: [{ id: 'local', adapterId: 'local' }],
  records: [{ id: 'draft-1', title: 'Draft', path: 'drafts/draft.md', markdown: validDraftMarkdown, source: { adapterId: 'local' }, sourceMode: 'local-transition' }],
  assets: []
});
assert.equal(ready.status, 'degraded');
assert.equal(ready.counts.publishableLocalDrafts, 1);
assert.equal(ready.counts.errors, 0);
assert.equal(ready.counts.sourceReferences, 0);

const mixed = buildPublicationPreflight({
  id: 'w-mixed',
  title: 'Mixed',
  sources: [{ id: 'local', adapterId: 'local' }, { id: 'github:tiinex/docs', adapterId: 'github', repo: 'Tiinex/docs', ref: '' }],
  records: [
    { id: 'plain', title: 'Plain', path: 'plain.md', markdown: '# Plain', source: { adapterId: 'local' }, sourceMode: 'local-files' },
    { id: 'gh', title: 'GitHub', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' } }
  ],
  assets: [{ id: 'large', path: 'assets/large.bin', previewState: 'omitted-large', source: { adapterId: 'local' } }],
  workspaceMergeCandidates: [{ id: 'wc', path: 'workspace.workspace.md' }]
});
assert.equal(mixed.status, 'blocked');
assert.equal(mixed.counts.publishableLocalDrafts, 0);
assert.equal(mixed.counts.blockedLocalDrafts, 1);
assert.equal(mixed.counts.sourceReferences, 1);
assert.ok(mixed.findings.some((finding) => finding.code === 'publication.local-record.missing-envelope-schema'));
assert.ok(mixed.findings.some((finding) => finding.code === 'publication.source-reference.ref-unpinned'));
assert.ok(mixed.findings.some((finding) => finding.code === 'publication.asset.metadata-only'));
assert.ok(mixed.findings.some((finding) => finding.code === 'publication.workspace-candidate.reference-only'));

const leaked = buildPublicationPreflight({
  id: 'w-leaked',
  sources: [{ id: 'local', adapterId: 'local', repo: 'Tiinex/docs' }],
  records: [{ id: 'local-leak', title: 'Leak', path: 'leak.md', markdown: validDraftMarkdown, source: { adapterId: 'local', repo: 'Tiinex/docs' } }]
});
assert.equal(leaked.status, 'blocked');
assert.ok(leaked.findings.some((finding) => finding.code === 'record.local.github-provenance-leak'));

console.log('publication.preflight: ok');
