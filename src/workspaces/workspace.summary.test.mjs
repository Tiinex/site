import assert from 'node:assert/strict';
import { shouldShowWorkspaceSummary, summarizeWorkspaceMaterial } from './workspace.summary.js';

const summary = summarizeWorkspaceMaterial({
  records: [
    { id: 'local:ws:a.md', source: { adapterId: 'local', kind: 'local-session' } },
    { id: 'source:github:repo:b.md', source: { adapterId: 'github' } },
    { id: 'local-shadow', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, materialReconciliation: { status: 'local-shadowed-by-source', sourceId: 'github:tiinex/docs' } },
    { id: 'workspace:ws:viewer.workspace.md', title: 'Local workspace', path: 'viewer.workspace.md', kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1', sourceMode: 'local-workspace-file', source: { id: 'local', adapterId: 'local', kind: 'local-session' }, workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true } },
    { id: 'workspace-record:source:github:tiinex/docs:docs.workspace.md', title: 'Docs workspace', path: 'docs.workspace.md', kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1', sourceMode: 'source-backed-workspace-file', source: { id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree' }, workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true }, materialReconciliation: { status: 'checksum-match', localSnapshot: { source: { id: 'local', adapterId: 'local', kind: 'local-session' } } } }
  ],
  assets: [{ id: 'asset:ws:img.png', source: { id: 'local', adapterId: 'local', kind: 'local-session' } }], sources: [{ id: 'local' }, { id: 'github:tiinex/docs' }, { id: 'origin:github:tiinusen:socials', sourceKind: 'github.origin-reference', recoveryOnly: true, originReferenceCount: 2 }],
  importResults: [{ ok: true, message: 'Imported 2 artifacts · 1 asset.', counts: { warnings: 1, errors: 0, previewOmitted: 1 }, at: '2026-07-21T00:00:00Z' }]
});

assert.equal(summary.schema, 'tiinex.workspace.material.summary.v1');
assert.equal(summary.counts.records, 5);
assert.equal(summary.counts.assets, 1);
assert.equal(summary.counts.workspaceArtifacts, 2);
assert.equal(summary.counts.localRecords, 4);
assert.equal(summary.counts.localAssets, 1);
assert.equal(summary.counts.localWorkspaceArtifacts, 1);
assert.equal('reconciledLocalWorkspaceCandidates' in summary.counts, false, 'canonical summary exposes no legacy candidate reconciliation count');
assert.equal(summary.counts.sourceBackedRecords, 2);
assert.equal(summary.counts.sourceBackedWorkspaceArtifacts, 1);
assert.equal(summary.counts.groupedRecords, 1);
assert.equal(summary.counts.configuredSources, 1);
assert.equal(summary.counts.recoveryOriginSources, 1);
assert.equal(summary.counts.originReferences, 2);
assert.equal(summary.counts.warnings, 1);
assert.equal(summary.counts.previewOmitted, 1);
assert.equal(summary.hasLocalMaterial, true);
assert.equal(summary.hasSourceBackedMaterial, true);
assert.equal(summary.hasRecoveryOrigins, true);
assert.equal(summary.boundaryReadability.mixed, true);
assert.match(summary.boundaryReadability.local, /no GitHub provenance inferred/);
assert.match(summary.boundaryReadability.source, /explicitly configured source rows/);
assert.match(summary.boundaryReadability.recovery, /not loaded source authority/);
assert.equal(shouldShowWorkspaceSummary(summary), true);
assert.equal(shouldShowWorkspaceSummary(summarizeWorkspaceMaterial({})), false);


const closedReceiptSummary = summarizeWorkspaceMaterial({
  records: [], assets: [], sources: [{ id: 'local' }, { id: 'github:b', adapterId: 'github' }],
  importResults: [
    { ok: false, message: 'A stale source warning', diagnostics: { sourceId: 'github:a' }, counts: { warnings: 1, errors: 0 } },
    { ok: true, message: 'B current receipt', diagnostics: { materialLedgerReceipt: { sourceId: 'github:b' } }, counts: { warnings: 0, errors: 0 } }
  ]
});
assert.equal(closedReceiptSummary.latestImport?.message, 'B current receipt', 'closed source receipt stays historical and must not drive current workspace summary');
assert.equal(closedReceiptSummary.counts.warnings, 0, 'closed source warnings must not remain current workspace truth');

console.log('✓ workspace.summary tests passed');
