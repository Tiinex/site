import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createStartupOwnershipGate, runOwnedWorkspaceStartupTransition } from './startupOwnership.js';

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

const gate = createStartupOwnershipGate();
const wait = deferred();
const commits = [];
const materialized = [];
const phases = [];
const notices = [];
const diagnostics = [];
const pending = runOwnedWorkspaceStartupTransition({
  gate,
  setPhase: (phase) => phases.push(phase),
  setNotice: (notice) => notices.push(notice),
  transitionOptions: {
    commit: (state) => commits.push(state),
    setDiagnostics: (value) => diagnostics.push(value),
    materializeSource: async (input) => { materialized.push(input); return { ok: true }; }
  },
  runTransition: async (options) => {
    await wait.promise;
    options.setDiagnostics({ owner: 'startup-a' });
    options.commit({ owner: 'startup-a' });
    await options.materializeSource({ id: 'source:a' });
    return { ok: true, state: { owner: 'startup-a' } };
  }
});

// A newer explicit route/navigation owner arrives while startup A is unresolved.
gate.invalidate();
wait.resolve();
const stale = await pending;
assert.equal(stale.stale, true, 'older async startup must be marked stale after a newer route owner invalidates it');
assert.deepEqual(commits, [], 'stale startup owner must not commit over the newer route state');
assert.deepEqual(materialized, [], 'stale startup owner must not begin source materialization');
assert.deepEqual(phases, ['resolving'], 'stale startup completion must not rewrite the newer owner render phase');
assert.deepEqual(notices, [], 'stale startup completion must not emit product notices');
assert.deepEqual(diagnostics, [], 'stale startup owner must not rewrite config diagnostics after route ownership changes');

const nextCommits = [];
const next = await runOwnedWorkspaceStartupTransition({
  gate,
  setPhase: (phase) => phases.push(phase),
  transitionOptions: { commit: (state) => nextCommits.push(state), materializeSource: async () => ({ ok: true }) },
  runTransition: async (options) => { options.commit({ owner: 'startup-b' }); return { ok: true }; }
});
assert.equal(next.stale, false);
assert.equal(nextCommits[0]?.owner, 'startup-b', 'current startup owner remains able to commit');
assert.equal(phases.at(-1), 'resolved');
console.log('✓ startup ownership tests passed');

const appSource = readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
assert(appSource.includes('runOwnedWorkspaceStartupTransition'), 'TiinexApp must execute startup through the ownership-generation boundary');
assert(appSource.includes('startupOwnershipRef.current.invalidate();'), 'browser route/navigation must invalidate older pending startup ownership');
assert(appSource.includes('abortGithubSourceOperation(githubOperationRef);'), 'route owner change must abort in-flight startup/source transport');
assert(appSource.includes("typeof options.isCurrentOwner === 'function'"), 'startup source-materialization callbacks must remain guarded after transport begins');
const ownershipSource = readFileSync(new URL('./startupOwnership.js', import.meta.url), 'utf8');
assert(ownershipSource.includes('sourceDiagnostics') && ownershipSource.includes('setDiagnostics: (...args) => isCurrentOwner()'), 'startup diagnostics must be ownership-guarded alongside commit/materialization');
