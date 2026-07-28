import assert from 'node:assert/strict';
import { visualDormancyEligible, visualDormancyPreviewHtml, visualDormancyRequiresManualRestore, visualDormancyRestoreDelay, visualDormancySummary } from './visualDormancy.js';

const state = {
  activeWorkspaceId: 'w1',
  view: { workspaceVerse: 'tree' },
  workspaces: [{ id: 'w1', name: 'Docs', records: Array.from({ length: 333 }, (_, i) => ({ id: `r${i}` })), assets: [], sources: [{ label: 'Tiinex/docs' }] }]
};
const summary = visualDormancySummary(state);
assert.equal(summary.title, 'Docs');
assert.equal(summary.records, 333);
assert.equal(summary.source, 'Tiinex/docs');
assert.equal(summary.view, 'Tree view');
assert.equal(visualDormancyEligible(summary, { width: 1400, coarse: false }).ok, false, 'desktop workspace should not switch to the mobile parked preview solely because it is large');
assert.equal(visualDormancyEligible(summary, { width: 720, coarse: false }).ok, false, 'desktop narrow viewport should not switch to the mobile parked preview on fine-pointer devices');
assert.equal(visualDormancyEligible(summary, { width: 390, coarse: true }).ok, true, 'coarse mobile viewport should be eligible for preview dormancy');
assert.equal(visualDormancyRequiresManualRestore(summary, { width: 390, coarse: true }), true, 'coarse mobile viewport should wait for user interaction before restoring the heavy DOM');
assert.equal(visualDormancyRestoreDelay(summary, { width: 390, coarse: true }), 0, 'manual mobile preview restore should not auto-restore immediately after app focus');
assert.equal(visualDormancyEligible({ hasMaterial: false, records: 0 }, { width: 400, coarse: true }).ok, false, 'empty state should not park');
const html = visualDormancyPreviewHtml(summary);
assert.ok(html.includes('Parked workspace'));
assert.ok(html.includes('333 artifacts'));
assert.ok(html.includes('resume the full workspace'));
assert.ok(html.includes('Workspace resume summary'));
assert.ok(html.includes('Material'));
assert.ok(html.includes('Source'));
assert.ok(!html.includes('<script'));
console.log('visualDormancy: ok');
