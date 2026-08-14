import assert from 'node:assert/strict';
import { buildWorkspaceRecoverabilityView } from './workspace.recoverabilityView.js';

const workspace = {
  id: 'w1',
  title: 'Recoverability Test',
  records: [
    { id: 'r1', title: 'Local', source: { adapterId: 'local', boundary: 'local' } },
    { id: 'r2', title: 'GitHub Workspace', path: 'root.workspace.md', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'abcdef', boundary: 'source' } }
  ],
  assets: [
    { id: 'a1', path: 'assets/a.png', previewState: 'metadata-only', source: { adapterId: 'local', boundary: 'asset local' } },
    { id: 'a2', path: 'assets/large.bin', previewState: 'omitted-large', source: { adapterId: 'local', boundary: 'asset local' } }
  ],
  importResults: [{
    ok: true,
    message: 'Imported test material.',
    counts: { records: 2, assets: 2, workspaceEntries: 1, warnings: 1, errors: 0, previewOmitted: 1 },
    warnings: [{ code: 'large.preview.omitted', message: 'Large preview omitted', path: 'assets/large.bin' }],
    errors: [],
    at: '2026-07-21T00:00:00Z'
  }],
  importLog: [{ kind: 'adapter-import-result' }]
};

const view = buildWorkspaceRecoverabilityView(workspace);
assert.equal(view.schema, 'tiinex.workspace.recoverabilityView.v1');
assert.equal(view.status, 'degraded');
assert.equal(view.counts.localRecords, 1);
assert.equal(view.counts.sourceBackedRecords, 1);
assert.equal(view.counts.localAssets, 2);
assert.equal(view.counts.workspaceArtifacts, 1);
assert.equal(view.counts.previewOmitted, 1);
assert.equal(view.counts.warnings, 1);
assert.equal(view.latestImport.ok, true);
assert.equal(view.sourceBoundary.status, 'degraded');
assert.equal(view.sourceTransport.schema, 'tiinex.sourceTransport.report.v1');
assert.equal(view.sourceTransport.status, 'degraded');
assert.equal(view.counts.sourceTransportEvents >= 1, true);
assert.equal(view.publicationPreflight.status, 'blocked');
assert.equal(view.counts.publicationPreflightErrors >= 1, true);
assert.ok(view.publicationPreflight.findings.some((finding) => finding.code === 'publication.local-record.no-markdown'));
assert.equal(view.reingestPlan.status, 'blocked');
assert.equal(view.counts.reingestSourceTargets, 1);
assert.equal(view.counts.reingestPinnedSourceTargets, 1);
assert.equal(view.counts.reingestWarnings >= 1, true);
assert.ok(view.reingestPlan.findings.some((finding) => finding.code === 'reingest.asset.metadata-only'));
assert.equal(view.exportPackagePreflight.status, 'blocked');
assert.equal(view.counts.exportPackageEntries >= 3, true);
assert.equal(view.counts.exportPackageSourceReferences, 1);
assert.equal(view.counts.exportPackageErrors >= 1, true);
assert.ok(view.exportPackagePreflight.findings.some((finding) => finding.code === 'export.package.local-entry.blocked'));
assert.ok(view.exportPackagePreflight.findings.some((finding) => finding.code === 'export.package.asset.metadata-only'));
assert.equal(view.exportPackageManifest.status, 'blocked');
assert.equal(view.exportPackageManifest.counts.entries >= 3, true);
assert.equal(view.exportPackageManifest.counts.blocked >= 1, true);
assert.ok(view.exportPackageManifest.integrity.fingerprint.startsWith('tixfp1-'));
assert.equal(view.exportPackageReceipt.state, 'blocked');
assert.ok(view.exportPackageReceipt.nextActions.some((action) => action.includes('Resolve blocked')));
assert.equal(view.exportPackageContract.status, 'blocked');
assert.equal(view.exportPackageBundle.status, 'blocked');
assert.equal(view.counts.exportPackageBundleFiles >= 3, true);
assert.equal(view.counts.exportPackageBundleMaterialFiles, 0);
assert.equal(view.exportPackageBundle.inspection.status, 'valid');
assert.equal(view.exportPackageImportPlan.status, 'blocked');
assert.equal(view.counts.exportPackageImportSourceReferences, 0);
assert.equal(view.exportPackageApplyResult.status, 'blocked');
assert.equal(view.exportPackageApplyResult.diagnostics.noRemoteFetch, true);
assert.equal(view.exportPackageApplyResult.diagnostics.noSourceMutation, true);
assert.ok(view.guarantees.some((item) => item.includes('local/session')));
assert.equal(view.assets.length, 2);

console.log('workspace.recoverabilityView: ok');
