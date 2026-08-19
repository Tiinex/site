import assert from 'node:assert/strict';
import { buildExportPackageBundle } from './package.builder.js';
import { buildExportPackageApplyResult, buildExportPackageImportPlan } from './package.apply.js';

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
  assets: [{ id: 'asset-ready', name: 'Image', path: 'assets/image.png', content: 'image-bytes', type: 'image/png', source: { adapterId: 'local' } }]
};

const bundle = buildExportPackageBundle(readyWorkspace, { clock: () => '2026-07-21T03:00:00.000Z' });
const plan = buildExportPackageImportPlan(bundle);
assert.equal(plan.schema, 'tiinex.export.package.import.plan.v1');
assert.equal(plan.status, 'ready');
assert.equal(plan.counts.importedRecords, 1, 'only embedded local drafts are materialized as records');
assert.equal(plan.counts.sourceReferences, 1, 'source-backed records remain source references');
assert.equal(plan.counts.assets, 1, 'asset content roundtrips as asset');
assert.equal(plan.records[0].id, 'package:local:draft-ready');
assert.equal(plan.records[0].source.adapterId, 'export-package');
assert.equal(plan.records[0].source.sourceBacked, false);
assert.equal(plan.records[0].source.githubPolicy, 'not guessed');
assert.equal(plan.records[0].path, 'drafts/draft.md');
assert.equal(plan.sourceReferences[0].target.repo, 'Tiinex/docs');
assert.equal(plan.sourceReferences[0].target.ref, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
assert.equal(plan.sourceReferences[0].target.path, 'topics/source.md');
assert.equal(plan.assets[0].source.adapterId, 'export-package');
assert.equal(plan.assets[0].source.sourceBacked, false);
assert.equal(plan.assets[0].path, 'assets/image.png');
assert.equal(plan.assets[0].previewState, 'available');
assert.equal(plan.records.every((record) => record.source.adapterId !== 'github'), true, 'package import must not infer GitHub provenance for materialized records');

const applyResult = buildExportPackageApplyResult(bundle);
assert.equal(applyResult.schema, 'tiinex.export.package.apply.result.v1');
assert.equal(applyResult.adapterResult.adapterId, 'export-package');
assert.equal(applyResult.adapterResult.records.length, 1);
assert.equal(applyResult.adapterResult.assets.length, 1);
assert.equal(applyResult.adapterResult.diagnostics.noRemoteFetch, true);
assert.equal(applyResult.adapterResult.diagnostics.noSourceMutation, true);
assert.equal(applyResult.sourceReferences.length, 1);
assert.equal(applyResult.counts.sourceReferences, 1);
assert.equal(applyResult.adapterResult.records.some((record) => record.source?.adapterId === 'github'), false);

const degradedWorkspace = {
  id: 'w-degraded',
  title: 'Degraded package',
  records: [
    { id: 'source-unpinned', title: 'Source unpinned', path: 'topics/source.md', markdown: validDraftMarkdown, source: { adapterId: 'github', repo: 'Tiinex/docs', ref: '' } }
  ],
  assets: [{ id: 'asset-large', path: '/assets/large.bin', previewState: 'omitted-large', source: { adapterId: 'local' } }],
  workspaceMergeCandidates: [{ id: 'wc', path: '../root.workspace.md' }]
};
const degradedBundle = buildExportPackageBundle(degradedWorkspace, { clock: () => '2026-07-21T03:01:00.000Z' });
const degradedPlan = buildExportPackageImportPlan(degradedBundle);
assert.equal(degradedPlan.status, 'degraded');
assert.equal(degradedPlan.counts.importedRecords, 0);
assert.equal(degradedPlan.counts.sourceReferences, 1);
assert.equal(degradedPlan.counts.metadataOnlyAssets, 1);
assert.equal(degradedPlan.counts.workspaceCandidates, 1);
assert.equal(degradedPlan.assets[0].previewState, 'metadata-only');
assert.ok(degradedPlan.findings.some((finding) => finding.code === 'export.package.import.asset.metadata-only'));
assert.ok(degradedPlan.findings.some((finding) => finding.code === 'export.package.import.workspace-candidate.descriptor-only'));

const blockedWorkspace = {
  id: 'w-blocked',
  title: 'Blocked package',
  records: [{ id: 'no-md', title: 'No markdown', path: 'no-md.md', source: { adapterId: 'local' } }]
};
const blockedBundle = buildExportPackageBundle(blockedWorkspace, { clock: () => '2026-07-21T03:02:00.000Z' });
const blockedApply = buildExportPackageApplyResult(blockedBundle);
assert.equal(blockedApply.status, 'blocked');
assert.equal(blockedApply.adapterResult.records.length, 0, 'blocked package material is not applied by default');
assert.ok(blockedApply.adapterResult.errors.some((error) => error.code === 'export.package.import.manifest-blocked'));

const unsafeFileBundle = Object.assign({}, bundle, {
  files: bundle.files.concat([{ path: '../escape.md', kind: 'artifact-markdown', content: validDraftMarkdown, bytes: validDraftMarkdown.length, fingerprint: 'bad' }])
});
const unsafePlan = buildExportPackageImportPlan(unsafeFileBundle);
assert.equal(unsafePlan.status, 'blocked', 'invalid inspection should block trust even when recoverable files are present');
assert.ok(unsafePlan.findings.some((finding) => finding.code.includes('path')));

console.log('export.package.apply: ok');
