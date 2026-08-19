import assert from 'node:assert/strict';
import fs from 'node:fs';
import { activeWorkspaceViewFor, stateWithWorkspaceViewPatch } from '../app/workspaceMulticolumn.js';
import { stateWithRecordLineageFocused } from '../app/workspaceScopedInteraction.js';
import { buildDiscoveryDisplayOptionCounts, buildWorkspaceDiscoveryView } from '../workspaces/workspace.discoveryView.js';

function state(verse) {
  return {
    activeWorkspaceId: 'w',
    view: { workspaceVerse: verse, query: 'needle' },
    workspaceViews: { w: { workspaceVerse: verse, query: 'needle' } },
    workspaces: [{ id: 'w', records: [{ id: 'r1' }] }]
  };
}

for (const origin of ['feed', 'tree']) {
  const focused = stateWithRecordLineageFocused(state(origin), 'w', 'r1', 1280);
  const lineageView = activeWorkspaceViewFor(focused, 'w');
  assert.equal(lineageView.workspaceVerse, 'lineage');
  assert.equal(lineageView.lineageReturnVerse, origin, `${origin} is retained as exact return context`);
  const returned = stateWithWorkspaceViewPatch(focused, 'w', { workspaceVerse: lineageView.lineageReturnVerse, lineageReturnVerse: '', selectedRecordId: '' });
  assert.equal(activeWorkspaceViewFor(returned, 'w').workspaceVerse, origin, `Back can restore ${origin} without heuristic fallback`);
}

const chromeSource = fs.readFileSync('src/schemas/workspace/workspace.chrome.views.jsx', 'utf8');
assert.ok(chromeSource.includes("state.view?.lineageReturnVerse === 'tree' ? 'tree' : 'feed'"), 'ModeToolbar consumes explicit lineage return context');
assert.ok(chromeSource.includes("auditVerse && selectedRecord ? 'lineage' : lineageVerse ? lineageReturnVerse : 'feed'"), 'Audit still returns to lineage while lineage returns to its Discovery origin');

const records = [
  { id: 'topic', title: 'Topic', path: '001.trace.md', schemaId: 'tiinex.topic.v1', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Topic' },
  { id: 'plain', title: 'Plain', path: 'README.md', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Plain' },
  { id: 'support', title: 'Support', path: 'support.md', kind: 'supporting-markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Support' }
];
const workspace = { id: 'w', records, assets: [] };
assert.deepEqual(buildDiscoveryDisplayOptionCounts(workspace).schemaChoices, [['tiinex.topic.v1', 1]], 'Schema choices do not expose kind/supporting pseudo-schema values');
const filtered = buildWorkspaceDiscoveryView(workspace, { displayOptions: { leavesOnly: false, showSupportingMarkdown: true, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'tiinex.topic.v1', artifactFilter: 'all', sourceFilter: 'all' }, query: '' });
assert.deepEqual(filtered.records.map((record) => record.id), ['topic']);

console.log('post-v427 discovery return-context + schema-filter parity closure: PASS');
