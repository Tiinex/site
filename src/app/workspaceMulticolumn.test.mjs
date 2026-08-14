import assert from 'node:assert/strict';
import { activeWorkspaceViewFor, stateWithActiveWorkspace, stateWithWorkspaceLayoutMode, stateWithWorkspacePresentationPruned, stateWithWorkspaceViewPatch, visibleWorkspaceItemsFor, workspaceColumnCapacity } from './workspaceMulticolumn.js';
import { shouldPageWorkspaces, stateWithWorkspaceWindowPage, workspaceWindowFor } from './workspaceWindow.js';

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
const items = visibleWorkspaceItemsFor(treeB, { active: treeB.workspaces[1], viewportWidth: 1600 });
assert.equal(items.length, 2, 'wide viewport exposes side-by-side workspace items');
assert.equal(items[0].surfaceState.view.workspaceVerse, 'lineage', 'left workspace receives scoped lineage view');
assert.equal(items[1].surfaceState.view.workspaceVerse, 'tree', 'right workspace receives scoped tree view');
assert.equal(activeWorkspaceViewFor(treeB, 'a').workspaceVerse, 'lineage', 'tree action in active workspace does not leak into sibling workspace');

const scrolledA = stateWithWorkspaceViewPatch(treeB, 'a', { scrollPositions: { 'a:lineage': 420 } });
const scrolledAB = stateWithWorkspaceViewPatch(scrolledA, 'b', { scrollPositions: { 'b:tree': 175 } });
assert.equal(activeWorkspaceViewFor(scrolledAB, 'a').scrollPositions['a:lineage'], 420, 'workspace A keeps its own vertical reading position');
assert.equal(activeWorkspaceViewFor(scrolledAB, 'b').scrollPositions['b:tree'], 175, 'workspace B keeps an independent vertical reading position');
const refocusedA = stateWithActiveWorkspace(stateWithActiveWorkspace(scrolledAB, 'b'), 'a');
assert.equal(activeWorkspaceViewFor(refocusedA, 'a').scrollPositions['a:lineage'], 420, 'focus changes do not reset A scroll state');
assert.equal(activeWorkspaceViewFor(refocusedA, 'b').scrollPositions['b:tree'], 175, 'focus changes do not reset sibling B scroll state');

assert.equal(workspaceColumnCapacity(1920), 3, '1920 desktop supports three visible workspace columns');
assert.equal(workspaceColumnCapacity(1400), 2, 'narrowed desktop supports two visible workspace columns');
assert.equal(workspaceColumnCapacity(760), 1, 'mobile keeps one visible workspace column');
assert.equal(shouldPageWorkspaces(3, 1400), true, '3 workspaces at 1400px require pager/reachability beyond capacity 2');
assert.equal(shouldPageWorkspaces(4, 1920), true, '4 workspaces at 1920px require pager/reachability beyond capacity 3');
assert.equal(shouldPageWorkspaces(3, 1920), false, 'pager stays hidden when all workspaces fit');

const fourWorkspaceState = Object.assign({}, treeB, { workspaces: [
  ...treeB.workspaces,
  { id: 'c', title: 'C', records: [], assets: [], sources: [] },
  { id: 'd', title: 'D', records: [], assets: [], sources: [] }
], activeWorkspaceId: 'c' });
const wideWindow = workspaceWindowFor(fourWorkspaceState, { viewportWidth: 1920 });
assert.equal(wideWindow.capacity, 3);
assert.equal(wideWindow.canPage, true);
assert.ok(wideWindow.visibleIds.includes('c'), 'active workspace remains reachable/visible at 1920px');
const mediumWindow = workspaceWindowFor(fourWorkspaceState, { viewportWidth: 1400 });
assert.equal(mediumWindow.capacity, 2);
assert.ok(mediumWindow.visibleIds.includes('c'), 'resize to 1400 keeps active workspace visible');
const narrowWindow = workspaceWindowFor(fourWorkspaceState, { viewportWidth: 760 });
assert.deepEqual(narrowWindow.visibleIds, ['c'], 'resize below 980 keeps the active workspace as the single visible workspace');

const pagerBase = Object.assign({}, fourWorkspaceState, { activeWorkspaceId: 'a', workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: 0 } });
const widePagedNext = stateWithWorkspaceWindowPage(pagerBase, 'next', 1920);
const widePagedNextWindow = workspaceWindowFor(widePagedNext, { viewportWidth: 1920 });
assert.equal(widePagedNextWindow.offset, 1, '1920 pager advances workspace window offset immediately');
assert.deepEqual(widePagedNextWindow.visibleIds, ['b', 'c', 'd'], '1920 pager exposes B/C/D after one next command');
assert.equal(widePagedNext.activeWorkspaceId, 'b', 'pager focuses the first workspace in the newly visible window');
assert.equal(widePagedNextWindow.nextEnabled, false, 'pager disables next at the maximum window offset instead of wrapping');
assert.equal(stateWithWorkspaceWindowPage(widePagedNext, 'next', 1920), widePagedNext, 'next at max offset is a no-op');
const widePagedPrevious = stateWithWorkspaceWindowPage(widePagedNext, 'previous', 1920);
const widePagedPreviousWindow = workspaceWindowFor(widePagedPrevious, { viewportWidth: 1920 });
assert.equal(widePagedPreviousWindow.offset, 0);
assert.deepEqual(widePagedPreviousWindow.visibleIds, ['a', 'b', 'c'], 'previous restores A/B/C immediately');
assert.equal(widePagedPrevious.activeWorkspaceId, 'a', 'previous focuses the first visible workspace');
assert.equal(widePagedPreviousWindow.previousEnabled, false, 'pager disables previous at offset zero');

const threeWorkspacePagerBase = {
  activeWorkspaceId: 'a',
  workspaces: pagerBase.workspaces.slice(0, 3),
  workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: 0 }
};
const mediumPagedNext = stateWithWorkspaceWindowPage(threeWorkspacePagerBase, 'next', 1400);
const mediumPagedWindow = workspaceWindowFor(mediumPagedNext, { viewportWidth: 1400 });
assert.equal(mediumPagedWindow.offset, 1, '1400 pager advances from capacity-two window after one click');
assert.deepEqual(mediumPagedWindow.visibleIds, ['b', 'c'], '1400 next exposes B/C immediately');
assert.equal(mediumPagedNext.activeWorkspaceId, 'b');

const compactB = stateWithWorkspaceLayoutMode(treeB, 'b', 'compact');
assert.equal(activeWorkspaceViewFor(compactB, 'b').layoutMode, 'compact', 'compact/expanded belongs to workspace view presentation');
assert.equal(activeWorkspaceViewFor(compactB, 'a').workspaceVerse, 'lineage', 'compacting B does not mutate A view/material');
const expandedB = stateWithWorkspaceLayoutMode(compactB, 'b', 'expanded');
assert.equal(activeWorkspaceViewFor(expandedB, 'b').workspaceVerse, 'tree', 'expanding restores the same workspace lens');
assert.equal(activeWorkspaceViewFor(expandedB, 'b').query, 'schema', 'expanding preserves workspace query');

const closedB = Object.assign({}, expandedB, { workspaces: expandedB.workspaces.filter((workspace) => workspace.id !== 'b'), activeWorkspaceId: 'a' });
const pruned = stateWithWorkspacePresentationPruned(closedB);
assert.equal(pruned.workspaceViews?.b, undefined, 'closing a workspace prunes stale workspace-scoped presentation');
assert.equal(pruned.activeWorkspaceId, 'a', 'remaining focus stays valid after close');

console.log('✓ workspaceMulticolumn tests passed');
