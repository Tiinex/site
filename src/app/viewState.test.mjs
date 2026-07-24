import assert from 'node:assert/strict';
import { stateWithViewPatch, stateWithViewUpdate, stateWithCapturedViewScroll, workspaceViewScrollKeyFor } from './viewState.js';

const workspace = { id: 'workspace:a', records: [{ id: 'record:a' }] };
const source = {
  activeWorkspaceId: 'workspace:a',
  view: { workspaceVerse: 'feed', query: '', displayOptions: { leavesOnly: true }, scrollPositions: {} },
  workspaces: [workspace]
};

const patched = stateWithViewPatch(source, { query: 'topic' });
assert.notEqual(patched, source);
assert.equal(patched.workspaces, source.workspaces, 'view patch preserves workspace identity');
assert.equal(patched.workspaces[0].records, workspace.records, 'view patch preserves record array identity');
assert.equal(patched.view.query, 'topic');

const unchanged = stateWithViewUpdate(source, (view) => view);
assert.equal(unchanged, source, 'view updater may intentionally return original state');

const updated = stateWithViewUpdate(source, (view) => Object.assign({}, view, { workspaceVerse: 'tree' }));
assert.equal(updated.workspaces, source.workspaces, 'view update preserves workspace identity');
assert.equal(updated.view.workspaceVerse, 'tree');

const key = workspaceViewScrollKeyFor(source);
const withScroll = stateWithCapturedViewScroll(source, source, { [key]: 48.7 });
assert.notEqual(withScroll, source);
assert.equal(withScroll.workspaces, source.workspaces, 'scroll persistence preserves workspace identity');
assert.equal(withScroll.view.scrollPositions[key], 49);

console.log('✓ app viewState helpers preserve workspace identity');
