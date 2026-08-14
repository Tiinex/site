import assert from 'node:assert/strict';
import { activeWorkspaceViewFor } from './workspaceMulticolumn.js';
import { stateAfterWorkspaceClosePresentation, stateWithWorkspaceViewPatchAndFocus } from './workspaceScopedInteraction.js';

const state = {
  activeWorkspaceId: 'a',
  view: { workspaceVerse: 'feed', query: 'alpha' },
  workspaceViews: { a: { workspaceVerse: 'feed', query: 'alpha' }, b: { workspaceVerse: 'feed', query: 'beta' } },
  workspaces: [
    { id: 'a', title: 'A', records: [{ id: 'a1' }] },
    { id: 'b', title: 'B', records: [{ id: 'b1' }] }
  ]
};

const actedOnB = stateWithWorkspaceViewPatchAndFocus(state, 'b', { workspaceVerse: 'tree', query: 'schema' }, 1400);
assert.equal(actedOnB.activeWorkspaceId, 'b', 'direct action on visible sibling B focuses B in the same state transition');
assert.equal(activeWorkspaceViewFor(actedOnB, 'b').workspaceVerse, 'tree', 'B action executes on B');
assert.equal(activeWorkspaceViewFor(actedOnB, 'b').query, 'schema', 'B receives the requested query');
assert.equal(activeWorkspaceViewFor(actedOnB, 'a').query, 'alpha', 'A is not mutated by direct action on B');

const afterClose = stateAfterWorkspaceClosePresentation(Object.assign({}, actedOnB, {
  workspaces: actedOnB.workspaces.filter((workspace) => workspace.id !== 'b'),
  activeWorkspaceId: 'a'
}), 1400);
assert.equal(afterClose.workspaceViews?.b, undefined, 'closed workspace view is removed');
assert.equal(afterClose.activeWorkspaceId, 'a', 'remaining focus remains valid');
assert.equal(afterClose.workspaceWindow?.offset, 0, 'workspace window offset is clamped after close');

console.log('✓ workspaceScopedInteraction tests passed');
