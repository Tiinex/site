import assert from 'node:assert/strict';
import { summarizeGithubAdapterResult } from './githubMaterializationSummary.js';

const summary = summarizeGithubAdapterResult({ okCount: 6, warnings: [], errors: [], diagnostics: { surfaces: { issueSnapshots: { requested: true, loaded: 6 } } } }, {
  materialLedgerReceipt: {
    schema: 'tiinex.workspace.source-material.ledger-receipt.v1',
    sourceId: 'github:tiinusen-socials',
    rawAdapterRecords: 6,
    sourceRecords: 6,
    visibleSourceRecords: 3,
    hiddenSourceRecords: 3,
    groupedSourceRecords: 1,
    sourceWorkspaceArtifacts: 2,
    sourceWorkspaceCandidates: 0
  }
});

assert.equal(summary.counts.records, 6, 'adapter summary still reports raw loaded records');
assert.equal(summary.diagnostics.materialLedgerReceipt.sourceRecords, 6, 'source material receipt is attached to import summary diagnostics');
assert.equal(summary.diagnostics.materialLedgerReceipt.visibleSourceRecords, 3, 'receipt preserves visible source count separately from loaded count');
assert.equal(summary.diagnostics.materialLedgerReceipt.sourceWorkspaceArtifacts, 2, 'receipt preserves source-backed workspace artifact records');
assert.equal(summary.diagnostics.materialLedgerReceipt.sourceWorkspaceCandidates, 0, 'new receipts do not fabricate candidate objects');
console.log('githubMaterializationSummary: ok');
