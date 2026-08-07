import assert from 'node:assert/strict';
import { activeWorkspaceViewFor, stateWithActiveWorkspace, stateWithWorkspaceViewPatch, visibleWorkspaceItemsFor, workspaceColumnCapacity } from './workspaceMulticolumn.js';

const state = {
  activeWorkspaceId: 'a',
  view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: 'news' },
  workspaces: [
    { id: 'a', title: 'A', records: [], assets: [], sources: [] },
    { id: 'b', title: 'B', records: [], assets: [], sources: [] }
  ]
};

const lineageA = stateWithWorkspaceViewPatch(state, 'a', { workspaceVerse: 'lineage', selectedRecordId: 'record-a' });
assert.equal(activeWorkspaceViewFor(lineageA, 'a').workspaceVerse, 'lineage');
assert.equal(activeWorkspaceViewFor(lineageA, 'b').workspaceVerse, 'feed', 'inactive workspace keeps its own feed view instead of inheriting active lineage mode');

const activatedB = stateWithActiveWorkspace(lineageA, 'b');
assert.equal(activatedB.activeWorkspaceId, 'b');
assert.equal(activatedB.view.workspaceVerse, 'feed', 'activating another workspace restores that workspace scoped view');
assert.equal(activatedB.workspaceViews.a.workspaceVerse, 'lineage', 'previous active workspace view is retained for side-by-side restore');

const treeB = stateWithWorkspaceViewPatch(activatedB, 'b', { workspaceVerse: 'tree', query: 'schema' });
const items = visibleWorkspaceItemsFor(treeB, { active: treeB.workspaces[1], pagerVisible: false, viewportWidth: 1600 });
assert.equal(items.length, 2, 'wide viewport exposes side-by-side workspace items');
assert.equal(items[0].surfaceState.view.workspaceVerse, 'lineage', 'left workspace receives scoped lineage view');
assert.equal(items[1].surfaceState.view.workspaceVerse, 'tree', 'right workspace receives scoped tree view');
assert.equal(activeWorkspaceViewFor(treeB, 'a').workspaceVerse, 'lineage', 'tree action in active workspace does not leak into sibling workspace');


assert.equal(workspaceColumnCapacity(1920), 3, '1920 desktop supports three visible workspace columns');
assert.equal(workspaceColumnCapacity(1400), 2, 'narrowed desktop steps down to two visible columns instead of horizontal scrolling');
assert.equal(workspaceColumnCapacity(760), 1, 'mobile keeps a single paged workspace column');
const threeWorkspaceState = Object.assign({}, treeB, { workspaces: [...treeB.workspaces, { id: 'c', title: 'C', records: [], assets: [], sources: [] }] });
const threeWide = visibleWorkspaceItemsFor(threeWorkspaceState, { active: threeWorkspaceState.workspaces[1], pagerVisible: false, viewportWidth: 1920 });
assert.deepEqual(threeWide.map((item) => item.workspace.id), ['a', 'b', 'c'], '1920 viewport can show three workspaces without x-scroll');
const twoWide = visibleWorkspaceItemsFor(threeWorkspaceState, { active: threeWorkspaceState.workspaces[1], pagerVisible: false, viewportWidth: 1400 });
assert.deepEqual(twoWide.map((item) => item.workspace.id), ['b', 'c'], 'narrowed desktop trims visible columns around the active workspace instead of keeping all columns in an x-scroll row');

const paged = visibleWorkspaceItemsFor(treeB, { active: treeB.workspaces[1], pagerVisible: true, viewportWidth: 760 });
assert.deepEqual(paged.map((item) => item.workspace.id), ['b'], 'paged view keeps only the active workspace visible');

console.log('✓ workspaceMulticolumn tests passed');
