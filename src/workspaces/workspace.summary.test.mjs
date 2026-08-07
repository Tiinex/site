import assert from 'node:assert/strict';
import { shouldShowWorkspaceSummary, summarizeWorkspaceMaterial } from './workspace.summary.js';

const summary = summarizeWorkspaceMaterial({
  records: [
    { id: 'local:ws:a.md', source: { adapterId: 'local', kind: 'local-session' } },
    { id: 'source:github:repo:b.md', source: { adapterId: 'github' } },
    { id: 'package:local:c.md', sourceMode: 'package-import', packageImport: true, source: { adapterId: 'export-package', kind: 'local-session', sourceKind: 'export.package.import', sourceBacked: false } }
  ],
  assets: [{ id: 'asset:ws:img.png' }],
  workspaceMergeCandidates: [{ id: 'workspace:ws:viewer.workspace.md' }],
  sources: [{ id: 'local' }, { id: 'github:tiinex/docs' }],
  importResults: [{ ok: true, message: 'Imported 2 artifacts · 1 asset.', counts: { warnings: 1, errors: 0, previewOmitted: 1 }, at: '2026-07-21T00:00:00Z' }]
});

assert.equal(summary.schema, 'tiinex.workspace.material.summary.v1');
assert.equal(summary.counts.records, 3);
assert.equal(summary.counts.assets, 1);
assert.equal(summary.counts.workspaceCandidates, 1);
assert.equal(summary.counts.localRecords, 2, 'package imports should count as local/session material');
assert.equal(summary.counts.sourceBackedRecords, 1);
assert.equal(summary.counts.warnings, 1);
assert.equal(summary.counts.previewOmitted, 1);
assert.equal(summary.hasLocalMaterial, true);
assert.equal(summary.hasSourceBackedMaterial, true);
assert.equal(shouldShowWorkspaceSummary(summary), true);
assert.equal(shouldShowWorkspaceSummary(summarizeWorkspaceMaterial({})), false);

console.log('✓ workspace.summary tests passed');
