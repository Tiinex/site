import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildWorkspaceDiscoveryView, buildDiscoveryMaterialIndex } from '../workspaces/workspace.discoveryView.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { buildWorkspacePathTree } from '../workspaces/workspace.pathTree.js';
import { WORKSPACE_RECORD_PRIMARY_INTENT, workspaceRecordPrimaryIntent } from '../workspaces/workspace.navigation.js';
import { stateWithRecordLineageFocused, stateWithWorkspaceViewPatchAndFocus, workspaceVerseNavigationPatch } from './workspaceScopedInteraction.js';

const parent = record('parent', 'Root Parent', 'roots/parent.trace.md', '2026-09-01 09:00:00');
const child = record('child', 'Focused Child', 'branches/deep/child.trace.md', '2026-09-02 09:00:00', '../../roots/parent.trace.md');
const sibling = record('sibling', 'Sibling Note', 'branches/sibling.trace.md', '2026-09-01 12:00:00');
const records = [parent, child, sibling];
const workspace = { id: 'workspace-navigation', title: 'Navigation', records, assets: [] };
const displayOptions = { leavesOnly: false, showSupportingMarkdown: true, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' };

// Feed and Tree are presentation projections over the same stable record identity.
const feed = buildWorkspaceDiscoveryView(workspace, { records, displayOptions, query: '' });
assert.strictEqual(feed.records.find((item) => item.id === child.id), child);
const tree = buildWorkspacePathTree({ records: feed.records, assets: [] });
const treeChild = findTreeRecord(tree, child.id);
assert.ok(treeChild, 'Tree must contain the Feed-visible child');
assert.strictEqual(treeChild.source, child, 'Tree must preserve the exact loaded record identity used by Feed');
assert.equal(treeChild.path, 'branches/deep/child.trace.md');
assert.equal(workspaceRecordPrimaryIntent({ surface: 'feed' }), WORKSPACE_RECORD_PRIMARY_INTENT.open);
assert.equal(workspaceRecordPrimaryIntent({ surface: 'tree' }), WORKSPACE_RECORD_PRIMARY_INTENT.open);
assert.equal(workspaceRecordPrimaryIntent({ surface: 'lineage' }), WORKSPACE_RECORD_PRIMARY_INTENT.toggleLineagePreview);
assert.equal(workspaceRecordPrimaryIntent({ surface: 'tree', selectionActive: true, selectionCandidate: { id: child.id } }), WORKSPACE_RECORD_PRIMARY_INTENT.select);
assert.equal(workspaceRecordPrimaryIntent({ surface: 'tree', selectionActive: true }), WORKSPACE_RECORD_PRIMARY_INTENT.unavailable);

// Path Tree truth remains independent from declared Parent truth.
const lineage = buildWorkspaceLineageView(workspace, { records, selectedRecordId: child.id });
assert.ok(lineage.edges.some((edge) => edge.kind === 'parent' && edge.from === parent.id && edge.to === child.id), 'Lineage must follow the declared Parent Trace across unrelated path folders');
assert.deepEqual(lineage.selectedTraversal.nodes.map((node) => node.id), [child.id, parent.id]);
assert.equal(findTreeRecord(tree, parent.id).path, 'roots/parent.trace.md');
assert.equal(findTreeRecord(tree, child.id).path, 'branches/deep/child.trace.md');

// Search/filtering and optional material-index reuse are presentation-only and semantically equivalent.
const filterOptions = { ...displayOptions, schemaFilter: 'tiinex.topic.v1' };
const uncached = buildWorkspaceDiscoveryView(workspace, { records, displayOptions: filterOptions, query: 'focused' });
const cached = buildWorkspaceDiscoveryView(workspace, { records, displayOptions: filterOptions, query: 'focused', materialIndex: buildDiscoveryMaterialIndex(records) });
assert.deepEqual(cached.records.map((item) => item.id), uncached.records.map((item) => item.id));
assert.deepEqual(cached.records.map((item) => item.id), [child.id]);
const lineageAfterFiltering = buildWorkspaceLineageView(workspace, { records, selectedRecordId: child.id });
assert.deepEqual(lineageAfterFiltering.edges, lineage.edges, 'Discovery filtering must not mutate declared lineage truth');

// Feed ordering is deterministic and independent of loaded array order.
const orderA = buildWorkspaceDiscoveryView(workspace, { records: [parent, child, sibling], displayOptions, query: '' }).records.map((item) => item.id);
const orderB = buildWorkspaceDiscoveryView(workspace, { records: [sibling, parent, child], displayOptions, query: '' }).records.map((item) => item.id);
assert.deepEqual(orderA, orderB);
assert.deepEqual(orderA, [child.id, sibling.id, parent.id]);

// Artifact -> Lineage -> Back preserves discovery context while clearing lineage-only state.
const discoveryView = {
  universe: 'column',
  workspaceVerse: 'tree',
  query: 'focused',
  displayOptions: { ...displayOptions, mismatchesOnly: true },
  expandedTreeFolders: ['branches', 'branches/deep'],
  scrollPositions: { 'workspace-navigation:tree:focused::display': 318 }
};
const state = { activeWorkspaceId: workspace.id, workspaces: [workspace], view: discoveryView, workspaceViews: { [workspace.id]: discoveryView } };
const lineageState = stateWithRecordLineageFocused(state, workspace.id, child.id, 1280);
assert.equal(lineageState.view.workspaceVerse, 'lineage');
assert.equal(lineageState.view.lineageReturnVerse, 'tree');
assert.equal(lineageState.view.selectedRecordId, child.id);
assert.equal(lineageState.view.query, discoveryView.query);
assert.deepEqual(lineageState.view.displayOptions, discoveryView.displayOptions);
assert.deepEqual(lineageState.view.expandedTreeFolders, discoveryView.expandedTreeFolders);
assert.deepEqual(lineageState.view.scrollPositions, discoveryView.scrollPositions);
const returned = stateWithWorkspaceViewPatchAndFocus(lineageState, workspace.id, workspaceVerseNavigationPatch(lineageState.view.lineageReturnVerse), 1280);
assert.equal(returned.view.workspaceVerse, 'tree');
assert.equal(returned.view.selectedRecordId, '');
assert.equal(returned.view.lineageReturnVerse, '');
assert.equal(returned.view.query, discoveryView.query);
assert.deepEqual(returned.view.displayOptions, discoveryView.displayOptions);
assert.deepEqual(returned.view.expandedTreeFolders, discoveryView.expandedTreeFolders);
assert.deepEqual(returned.view.scrollPositions, discoveryView.scrollPositions);

// UI wiring must expose opening and lineage as distinct actions rather than conflating primary click with lineage.
const cardSource = fs.readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8');
const treeSource = fs.readFileSync(new URL('../schemas/workspace/workspace.tree.views.jsx', import.meta.url), 'utf8');
const detailSource = fs.readFileSync(new URL('../schemas/workspace/workspace.recordDialogs.views.jsx', import.meta.url), 'utf8');
assert.ok(cardSource.includes("label: lineageContext ? 'Anchor' : 'Lineage'"));
assert.ok(cardSource.includes('return onOpenRecord?.(record.id);'));
assert.ok(treeSource.includes('return onOpenRecord?.(item.source.id);'));
assert.ok(treeSource.includes('Open lineage for ${item.name || item.title || \'artifact\'}'));
assert.ok(detailSource.includes('onLineage && !historical'));
assert.ok(detailSource.includes('>Lineage</Button>'));

console.log('✓ Viewer navigation parity invariants passed');

function record(id, title, path, createdAt, trace = '') {
  const parentBlock = trace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [Parent](${trace})\n` : '';
  const markdown = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${parentBlock}- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: ${createdAt}\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n${title} body.\n\n---\n\n# Continuity Integrity\n\n- local-test\n  - Towards: self\n  - Value: ${id}-self\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'local-test' }), { id });
}

function findTreeRecord(tree, id) {
  const visit = (folder) => {
    const direct = (folder.items || []).find((item) => item.type === 'record' && item.source?.id === id);
    if (direct) return direct;
    for (const childFolder of folder.folders || []) {
      const found = visit(childFolder);
      if (found) return found;
    }
    return null;
  };
  return visit({ folders: tree.folders || [], items: tree.items || [] });
}
