import assert from 'node:assert/strict';
import { buildSourceBoundaryReport } from './sourceBoundary.report.js';

const clean = buildSourceBoundaryReport({
  id: 'w-clean',
  sources: [{ id: 'local', adapterId: 'local' }, { id: 'github:tiinex/docs', adapterId: 'github', repo: 'Tiinex/docs', ref: 'abcdef' }],
  records: [
    { id: 'local-1', path: 'draft.md', source: { adapterId: 'local' } },
    { id: 'source-1', path: 'topics/a.md', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'abcdef' } }
  ],
  assets: [{ id: 'asset-1', path: 'assets/a.png', source: { adapterId: 'local' } }]
});
assert.equal(clean.status, 'clean');
assert.equal(clean.counts.localRecords, 1);
assert.equal(clean.counts.sourceBackedRecords, 1);

const degraded = buildSourceBoundaryReport({
  id: 'w-degraded',
  sources: [{ id: 'github:tiinex/docs', adapterId: 'github', repo: 'Tiinex/docs', ref: '' }],
  records: [{ id: 'source-1', path: 'topics/a.md', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' } }],
  assets: [{ id: 'large', path: 'assets/large.bin', source: { adapterId: 'local' }, previewState: 'omitted-large' }]
});
assert.equal(degraded.status, 'degraded');
assert.ok(degraded.findings.some((finding) => finding.code === 'source.github.ref.unpinned'));
assert.ok(degraded.findings.some((finding) => finding.code === 'record.github.ref.unpinned'));
assert.ok(degraded.findings.some((finding) => finding.code === 'asset.preview.omitted'));

const blocked = buildSourceBoundaryReport({
  id: 'w-blocked',
  sources: [{ id: 'local', adapterId: 'local', repo: 'Tiinex/docs' }],
  records: [{ id: 'local-1', path: 'draft.md', source: { adapterId: 'local', repo: 'Tiinex/docs' } }],
  assets: []
});
assert.equal(blocked.status, 'blocked');
assert.ok(blocked.findings.some((finding) => finding.code === 'source.local.github-provenance-leak'));
assert.ok(blocked.findings.some((finding) => finding.code === 'record.local.github-provenance-leak'));

console.log('sourceBoundary.report: ok');
