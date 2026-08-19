import assert from 'node:assert/strict';
import { SurfaceImplementationStatus } from '../surfaces/contracts.js';
import { listSurfaceFindings, surfaceRegistry } from '../surfaces/registry.js';
import { assetPreviewSummary, assetSourceBadge, assetSourceBoundary } from '../schemas/workspace/workspace.viewFormatting.js';
import { classifyAssetPersistence } from '../storage/storage.policy.js';
import { collectSourceAssetReferences } from '../sources/source.assetReferences.js';
import { buildWorkspaceExportPlan, ExportAdapterId, ExportType } from '../export/export.plan.js';

const expectedSurfaceIds = [
  'feed', 'tree', 'lineage', 'audit', 'detail', 'preview', 'share',
  'create', 'edit', 'display-options', 'source-settings'
];
assert.deepEqual(surfaceRegistry.surfaces.map((surface) => surface.id), expectedSurfaceIds, 'v436 must pressure all eleven registered product surfaces');
assert.equal(surfaceRegistry.counts.total, 11);
assert.equal(surfaceRegistry.counts.partial, 11, 'every registered surface has a genuine current product path but remains pre-Q partial');
assert.equal(surfaceRegistry.counts.parity, 0, 'v436 discovery must not silently promote final parity');
assert.equal(surfaceRegistry.counts.scaffold, 0, 'implemented product paths must not remain falsely scaffolded');
assert(surfaceRegistry.surfaces.every((surface) => surface.status === SurfaceImplementationStatus.partial));
assert.equal(listSurfaceFindings().filter((finding) => finding.code === 'surface.status.scaffold').length, 0);

const localAsset = {
  id: 'local:asset', path: 'assets/local.png', type: 'image/png', size: 12,
  dataUrl: 'data:image/png;base64,ZmFrZQ==', previewState: 'available',
  sourceMode: 'local-asset', source: { adapterId: 'local', kind: 'local-session' }
};
assert.equal(assetSourceBadge(localAsset), 'local/session');
assert.match(assetSourceBoundary(localAsset), /Browser-local asset/);
assert.match(assetPreviewSummary(localAsset), /preserved as local asset/);
assert.equal(classifyAssetPersistence(localAsset).persistence, 'full', 'local asset preview material remains session-persistable');

const sourceAsset = {
  id: 'source:asset', path: '.topics/assets/remote.png', type: 'image/png', size: 20,
  content: 'should-not-be-session-authority', previewState: 'available',
  sourceMode: 'source-backed', source: { adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs' }
};
assert.equal(assetSourceBadge(sourceAsset), 'source-backed', 'source-backed asset must not display local/session ownership');
assert.match(assetSourceBoundary(sourceAsset), /Source-backed asset/);
assert.match(assetPreviewSummary(sourceAsset), /source-backed asset/);
assert.equal(classifyAssetPersistence(sourceAsset).persistence, 'metadata-only', 'source-backed preview bytes are not durable browser-session authority');
assert.equal(classifyAssetPersistence(sourceAsset).persistContent, false);

const unknownAsset = { id: 'asset:unknown', path: 'assets/unknown.bin' };
assert.equal(assetSourceBadge(unknownAsset), 'source unknown');
assert.match(assetSourceBoundary(unknownAsset), /unresolved/);

const sourceRecord = {
  id: 'source:topic',
  path: '.topics/work/item.trace.md',
  markdown: '# Item\n\n![plot](../assets/plot.png)',
  source: { adapterId: 'github', kind: 'github-tree', rootPath: '.topics' }
};
const sourceAssetRefs = collectSourceAssetReferences([sourceRecord], { source: sourceRecord.source, availablePaths: [] });
assert.equal(sourceAssetRefs.counts.total, 1);
assert.equal(sourceAssetRefs.references[0].status, 'referenced-unloaded', 'source asset reference remains explicit when bytes were not materialized');
assert.equal(sourceAssetRefs.references[0].path, '.topics/assets/plot.png');
assert.match(sourceAssetRefs.references[0].boundary, /content not auto-fetched/, 'source provenance must stay distinct from previewability');

const workspace = {
  id: 'workspace:v436', title: 'v436 export truth',
  records: [{ id: 'local:r', path: 'draft.trace.md', markdown: '# Draft', source: { adapterId: 'local' } }],
  assets: [localAsset]
};
const ordinaryTree = buildWorkspaceExportPlan(workspace);
assert.equal(ordinaryTree.selectedAdapterId, ExportAdapterId.download);
assert.equal(ordinaryTree.selectedExportType, ExportType.tree);
assert.equal(ordinaryTree.execution.available, true, 'ordinary Tree ZIP is the currently executable export product path');
assert.equal(ordinaryTree.packageEnvelope, false, 'ordinary Tree export must not masquerade as a package/handoff envelope');

const handoffQualified = buildWorkspaceExportPlan(workspace, { adapterId: ExportAdapterId.handoffPackage, exportType: ExportType.handoffPackage });
assert.equal(handoffQualified.execution.available, true, 'v442 supersedes render-time package qualification: explicit Handoff execution is selectable even when a later execution-time package build may block');
assert.equal(handoffQualified.adapters.find((adapter) => adapter.id === ExportAdapterId.handoffPackage)?.status, 'available', 'selected Handoff is a cheap available-to-execute configuration; exact package qualification belongs to execution');
assert.equal(Object.prototype.hasOwnProperty.call(handoffQualified, 'handoffInspection'), false, 'v442 render/read-model carries no exact package inspection snapshot');
const githubGuided = buildWorkspaceExportPlan(workspace, { adapterId: ExportAdapterId.github, exportType: ExportType.githubPublish });
assert.equal(githubGuided.execution.available, true, 'v447 supersedes the old Case C hold with a guided no-write GitHub social publication routine');
assert.equal(githubGuided.execution.action, 'guided-github-publication');
assert.equal(githubGuided.adapters.find((adapter) => adapter.id === ExportAdapterId.github)?.status, 'available');
assert.match(githubGuided.execution.boundary, /No GitHub API mutation/, 'guided availability must not become a hidden provider write');

console.log('post-v436 M0-E/F integrated product parity discovery: PASS');
