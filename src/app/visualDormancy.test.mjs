import assert from 'node:assert/strict';
import { visualDormancyEligible, visualDormancyPreviewHtml, visualDormancySummary } from './visualDormancy.js';

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
assert.equal(visualDormancyEligible(summary, { width: 1400, coarse: false }).ok, true, 'large workspace should be eligible even on desktop');
assert.equal(visualDormancyEligible({ hasMaterial: false, records: 0 }, { width: 400, coarse: true }).ok, false, 'empty state should not park');
const html = visualDormancyPreviewHtml(summary);
assert.ok(html.includes('Parked workspace'));
assert.ok(html.includes('333 artifacts'));
assert.ok(!html.includes('<script'));
console.log('visualDormancy: ok');
