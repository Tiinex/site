import assert from 'node:assert/strict';
import { commitStateWithPersistence, createStatePersistenceScheduler } from './statePersistenceScheduler.js';

const calls = [];
const timers = [];
const win = {
  setTimeout(fn) { timers.push(fn); return timers.length; },
  clearTimeout() {},
  requestIdleCallback(fn) { timers.push(fn); return timers.length; },
  cancelIdleCallback() {}
};
const scheduler = createStatePersistenceScheduler(win);
const runtime = () => ({ persistence: { writeState: (state, opts) => calls.push({ state, opts }) } });
const state1 = { workspaces: [{ id: 'w1' }], view: { workspaceVerse: 'feed' } };
const state2 = { workspaces: [{ id: 'w1' }], view: { workspaceVerse: 'tree' } };

scheduler.schedule({ state: state1, mode: 'replace', runtime }, { reason: 'first' });
scheduler.schedule({ state: state2, mode: 'replace', runtime }, { reason: 'second' });
assert.equal(calls.length, 0, 'scheduled view persistence must not synchronously write state');
assert.equal(scheduler.report().pending, true, 'latest view persistence should be pending');
scheduler.flush('test-flush');
assert.equal(calls.length, 1, 'flush writes only the latest pending state');
assert.equal(calls[0].state.view.workspaceVerse, 'tree', 'latest pending view state wins');
assert.deepEqual(calls[0].opts, { mode: 'replace' });
assert.equal(scheduler.report().pending, false, 'flush clears pending state');

scheduler.schedule({ state: state1, mode: 'push', runtime }, { reason: 'share' });
scheduler.cancel();
scheduler.flush('after-cancel');
assert.equal(calls.length, 1, 'cancel prevents stale scheduled route writes');

const canonicalWrites = [];
let rendered = null;
let migrationCalls = 0;
const canonicalRuntime = () => ({
  persistence: {
    normalizeLegacyWorkspaceCandidateState() { migrationCalls += 1; throw new Error('ordinary runtime commit must not invoke persistence migration'); },
    writeState(state) { canonicalWrites.push(state); },
    clearState() {}
  }
});
const currentProductState = { workspaces: [{ id: 'w', records: [{ id: 'current', path: 'current.trace.md' }], assets: [], sources: [] }], activeWorkspaceId: 'w', view: { workspaceVerse: 'feed' } };
const committed = commitStateWithPersistence({ nextState: currentProductState, sourceState: {}, setState: (state) => { rendered = state; }, runtime: canonicalRuntime, scheduler: { cancel() {} } });
assert.equal(migrationCalls, 0, 'ordinary product commit never invokes legacy persistence migration');
assert.equal(committed.workspaces[0], currentProductState.workspaces[0], 'workspace identity is preserved across ordinary product commit');
assert.equal(committed.workspaces[0].records, currentProductState.workspaces[0].records, 'record collection identity is preserved across ordinary product commit');
assert.equal(rendered.workspaces[0], currentProductState.workspaces[0], 'rendered product state retains current workspace identity');
assert.throws(() => commitStateWithPersistence({ nextState: { workspaces: [{ id: 'legacy', workspaceMergeCandidates: [] }] }, sourceState: {}, setState: () => {}, runtime: canonicalRuntime, scheduler: { cancel() {} } }), /workspace\.runtime-candidate-leak:commit:legacy/, 'legacy compatibility is rejected if it leaks into current product commits');

const clearCalls = [];
const publicOwnership = { writePolicy: () => ({ routeKind: 'public-target', preserveUrl: true, durableLocalPolicy: 'preserve-existing' }) };
const emptyCommitted = commitStateWithPersistence({
  nextState: { version: 1, workspaces: [], activeWorkspaceId: '', view: { workspaceVerse: 'feed' } },
  sourceState: state1,
  setState: () => {},
  runtime: () => ({ persistence: { clearState: (opts) => clearCalls.push(opts) } }),
  scheduler: { cancel() {} },
  persistenceOwnership: publicOwnership
});
assert.equal(emptyCommitted.workspaces.length, 0, 'empty product state should still commit canonically');
assert.deepEqual(clearCalls, [{ mode: 'push', preserveUrl: true, routeKind: 'public-target', durableLocalPolicy: 'preserve-existing' }], 'zero-workspace clear must receive the same route persistence ownership policy as ordinary writes');



console.log('✓ state persistence scheduler tests passed');
