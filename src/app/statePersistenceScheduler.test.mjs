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
const canonicalRuntime = () => ({
  persistence: {
    normalizeLegacyWorkspaceCandidateState(state) {
      return {
        ...state,
        workspaces: (state.workspaces || []).map((workspace) => {
          const canonical = {
            ...workspace,
            records: [
              ...(workspace.records || []),
              ...(workspace.workspaceMergeCandidates || []).map((candidate) => ({
                id: candidate.id,
                path: candidate.path,
                workspaceArtifactRole: {
                  schema: 'tiinex.workspace.artifact.role.v1',
                  openEligible: true,
                  mergeEligible: true,
                  migratedFromLegacyCandidate: true
                }
              }))
            ]
          };
          delete canonical.workspaceMergeCandidates;
          return canonical;
        })
      };
    },
    writeState(state) { canonicalWrites.push(state); },
    clearState() {}
  }
});
const legacyProductState = { workspaces: [{ id: 'w', records: [], workspaceMergeCandidates: [{ id: 'legacy-workspace', path: 'legacy.workspace.md' }] }] };
const committed = commitStateWithPersistence({ nextState: legacyProductState, sourceState: {}, setState: (state) => { rendered = state; }, runtime: canonicalRuntime, scheduler: { cancel() {} } });
assert.equal(Object.prototype.hasOwnProperty.call(committed.workspaces[0], 'workspaceMergeCandidates'), false, 'product commit must consume legacy candidate shape before UI/runtime state');
assert.equal(Object.prototype.hasOwnProperty.call(rendered.workspaces[0], 'workspaceMergeCandidates'), false, 'candidate compatibility must not reach rendered product state');
assert.equal(committed.workspaces[0].records[0].workspaceArtifactRole.schema, 'tiinex.workspace.artifact.role.v1', 'product commit produces canonical Workspace Artifact role');

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
