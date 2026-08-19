import assert from 'node:assert/strict';
import { buildWorkspaceExportPlan, EXPORT_PLAN_SCHEMA_ID } from './export.plan.js';

const workspace = {
  id: 'ws',
  title: 'Gaming',
  records: [
    { id: 'source:1', title: 'Source', path: '.topics/source.trace.md', markdown: '# Source', source: { boundary: 'explicit source-backed material', sourceBacked: true } },
    { id: 'local:1', title: 'Draft', path: '.topics/001-1-draft.trace.md', markdown: '# Draft', source: { adapterId: 'local' } }
  ],
  assets: [{ id: 'asset:1', path: 'assets/evidence.txt', content: 'asset' }]
};

const plan = buildWorkspaceExportPlan(workspace, { clock: () => '2026-08-07T12:00:00.000Z' });
assert.equal(plan.schema, EXPORT_PLAN_SCHEMA_ID);
assert.equal(plan.status, 'ready');
assert.equal(plan.selectedAdapterId, 'download');
assert.equal(plan.selectedExportType, 'tree');
assert.equal(plan.selectedScope, 'all');
assert.equal(plan.operation, 'local-download');
assert.equal(plan.transport.selectedLevel, 'TL0');
assert.equal(plan.transport.credentialMaterialIncluded, false);
assert.equal(plan.packageEnvelope, false);
assert.equal(plan.execution.available, true);
assert.equal(plan.treeBundle.exportType, 'tree');
assert.equal(plan.treeBundle.packageEnvelope, false);
assert.equal(plan.counts.records, 2);
assert.equal(plan.counts.assets, 1);
assert.equal(plan.counts.sourceRecords, 1);
assert.equal(plan.counts.localRecords, 1);
assert(plan.adapters.some((adapter) => adapter.id === 'github' && adapter.status === 'available' && adapter.transportLevel === 'TL0'), 'GitHub adapter exposes the guided shared-contract publication routine without hidden provider write');
assert(plan.adapters.some((adapter) => adapter.id === 'handoff-package' && adapter.status === 'available'), 'default Tree plan exposes Handoff as an explicit opt-in without performing package qualification work');
assert(plan.exportTypes.some((type) => type.id === 'tree' && type.status === 'ready' && type.packageEnvelope === false));
assert(plan.exportTypes.some((type) => type.id === 'handoff-package' && type.status === 'available' && type.packageEnvelope === true));
assert.equal(Object.prototype.hasOwnProperty.call(plan, 'handoffPreparation'), false, 'read-model never owns Handoff package preparation');

const handoffPlan = buildWorkspaceExportPlan(workspace, { exportType: 'handoff-package', clock: () => '2026-08-07T12:00:00.000Z' });
assert.equal(handoffPlan.selectedAdapterId, 'handoff-package');
assert.equal(handoffPlan.execution.action, 'download-handoff-package');
assert.equal(handoffPlan.execution.available, true);
assert.equal(handoffPlan.packageEnvelope, true);
assert.equal(handoffPlan.exportTypes.find((type) => type.id === 'handoff-package')?.status, 'available');
assert.equal(Object.prototype.hasOwnProperty.call(handoffPlan, 'handoffBundle'), false, 'selected Handoff read-model must not cache serialized package truth');
assert.equal(Object.prototype.hasOwnProperty.call(handoffPlan, 'handoffInspection'), false, 'selected Handoff read-model must not cache exact package qualification');
assert.equal(handoffPlan.treeBundle, null, 'Handoff selection must not turn the ordinary Tree export into a package envelope');

const githubPlan = buildWorkspaceExportPlan(workspace, { exportType: 'github-publish' });
assert.equal(githubPlan.selectedAdapterId, 'github');
assert.equal(githubPlan.status, 'available');
assert.equal(githubPlan.execution.available, true);
assert.equal(githubPlan.execution.action, 'guided-github-publication');
assert.ok(githubPlan.execution.boundary.includes('No GitHub API mutation')); 

console.log('✓ export plan tests passed');
