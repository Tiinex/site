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


const importedPackage = buildSourceBoundaryReport({
  id: 'w-package-import',
  sources: [{ id: 'local', adapterId: 'local' }],
  records: [{
    id: 'package:local:.topics/imported.trace.md',
    path: '.topics/imported.trace.md',
    sourceMode: 'package-import',
    packageImport: true,
    source: { adapterId: 'export-package', kind: 'local-session', sourceKind: 'export.package.import', sourceBacked: false, repo: '' }
  }],
  assets: [{ id: 'asset-package', path: 'asset.png', source: { adapterId: 'export-package', kind: 'local-session', sourceKind: 'export.package.import', sourceBacked: false } }]
});
assert.equal(importedPackage.counts.localRecords, 1, 'package-imported records remain local/session material in source-boundary diagnostics');
assert.equal(importedPackage.counts.sourceBackedRecords, 0, 'package-imported records must not be counted as source-backed');
assert.equal(importedPackage.counts.localAssets, 1, 'package-imported assets remain local/session assets');
assert.equal(importedPackage.status, 'clean');

console.log('sourceBoundary.report: ok');
