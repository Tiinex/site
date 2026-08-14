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
assert(plan.adapters.some((adapter) => adapter.id === 'github' && adapter.status === 'future' && adapter.transportLevel === 'TL0'), 'GitHub adapter is visible but future/manual only');
assert(plan.adapters.some((adapter) => adapter.id === 'handoff-package' && adapter.status === 'future'), 'handoff package is explicit and not default');
assert(plan.exportTypes.some((type) => type.id === 'tree' && type.status === 'ready' && type.packageEnvelope === false));
assert(plan.exportTypes.some((type) => type.id === 'handoff-package' && type.status === 'future' && type.packageEnvelope === true));

const githubPlan = buildWorkspaceExportPlan(workspace, { adapterId: 'github' });
assert.equal(githubPlan.selectedAdapterId, 'github');
assert.equal(githubPlan.status, 'future');
assert.equal(githubPlan.execution.available, false, 'future adapters must not execute fake writes');

console.log('✓ export plan tests passed');
