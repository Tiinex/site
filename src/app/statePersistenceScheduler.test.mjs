import assert from 'node:assert/strict';
import { createStatePersistenceScheduler } from './statePersistenceScheduler.js';

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

console.log('✓ state persistence scheduler tests passed');
