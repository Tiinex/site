import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { runGithubSourceOperation } from './githubSourceOperation.js';
import { sourceTransportRefreshInputForSource } from './sourceTransportRefresh.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Operation boundary' }, { clock: () => '2026-08-09T00:00:00.000Z' });
assert.equal(created.ok, true);
let committed = null;
let pendingStates = [];
let notices = [];
let dialogs = [];
const result = await runGithubSourceOperation({
  input: { operation: 'register', repository: 'Tiinex/docs', rootPath: '.topics', label: 'Docs', repoDiscovery: false, explicitFileRefs: '.topics/exact.md\n.topics/exact.md\n.topics/other.md' },
  state: created.state,
  active: created.workspace,
  runtimeApi: { lifecycle },
  githubRequestPending: false,
  operationRef: { current: { token: null, controller: null } },
  setNotice: (value) => notices.push(value),
  setDialog: (value) => dialogs.push(value),
  setGithubRequestPending: (value) => pendingStates.push(value),
  commit: (state, mode) => { committed = { state, mode }; },
  getLatestState: () => created.state,
  fetchImpl: async () => { throw new Error('register-only operation must not fetch'); },
  AbortControllerImpl: undefined
});
assert.equal(result.ok, true, result.error);
assert.match(result.sourceId, /^github:tiinex-docs:/, 'source id should be normalized by source identity contract');
assert.deepEqual(pendingStates, [true, false], 'operation must expose busy state boundaries');
assert.equal(committed.mode, 'push');
const workspace = lifecycle.activeWorkspace(committed.state);
assert(workspace.sources.some((source) => source.id === result.sourceId && source.discoveryState === 'deferred'), 'register-only operation pins a deferred source boundary');
const savedSource = workspace.sources.find((source) => source.id === result.sourceId);
assert.deepEqual(savedSource.explicitFileRefs, ['.topics/exact.md', '.topics/other.md'], 'Save source persists canonical deduped exact Markdown targets without loading');
assert.equal(savedSource.repoDiscovery, false, 'exact file targets do not infer broad repo discovery');
assert.equal(workspace.importResults[0].diagnostics.operation, 'register-boundary-only', 'register-only operation records an import/source receipt');
assert(notices.at(-1).includes('source registered'), 'operation should return a user-facing source receipt');
assert.deepEqual(dialogs, [null], 'operation owns its add-dialog close effect while TiinexApp only wires it');

const pending = await runGithubSourceOperation({
  input: { repository: 'Tiinex/docs' },
  state: created.state,
  active: created.workspace,
  runtimeApi: { lifecycle },
  githubRequestPending: true,
  setNotice: (value) => notices.push(value)
});
assert.equal(pending.ok, false);
assert.equal(pending.error, 'github.operation.pending');
assert.equal(notices.at(-1), 'GitHub source operation already in progress.');

// v426 prequalified representation consistency: an ordinary branch refresh must not inherit an OLD materialized receipt as invocation authority.
const refreshOldCommit = '1111111111111111111111111111111111111111';
const refreshNewCommit = '2222222222222222222222222222222222222222';
const refreshSeed = lifecycle.addWorkspaceSource(created.state, created.workspace.id, {
  repository: 'owner/repo', ref: 'main', requestedRef: 'main', materializedCommit: refreshOldCommit, rootPath: '.topics', label: 'Refresh repo', repoDiscovery: true
});
assert.equal(refreshSeed.ok, true);
const refreshSource = refreshSeed.source;
const refreshCommitApi = 'https://api.github.com/repos/owner/repo/commits/main';
const refreshTreeApi = `https://api.github.com/repos/owner/repo/git/trees/${refreshNewCommit}?recursive=1`;
const refreshRaw = `https://raw.githubusercontent.com/owner/repo/${refreshNewCommit}/.topics/refresh.md`;
const refreshCalls = [];
const refreshFetch = async (url) => {
  refreshCalls.push(url);
  if (url === refreshCommitApi) return { ok: true, status: 200, statusText: 'OK', json: async () => ({ sha: refreshNewCommit }), text: async () => '' };
  if (url === refreshTreeApi) return { ok: true, status: 200, statusText: 'OK', json: async () => ({ truncated: false, tree: [{ type: 'blob', path: '.topics/refresh.md' }] }), text: async () => '' };
  if (url === refreshRaw) return { ok: true, status: 200, statusText: 'OK', json: async () => ({}), text: async () => '# Refresh topic\n\nFresh branch bytes' };
  return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}), text: async () => '' };
};
const refreshPlan = sourceTransportRefreshInputForSource(Object.assign({}, refreshSource, { transportPlan: { configured: { cache: true, mirror: true, proxy: true, direct: true } } }), 'proxy', ['repoFiles']);
assert.equal(refreshPlan.ok, true);
assert.equal(refreshPlan.nextTier, 'direct');
assert.equal(Object.prototype.hasOwnProperty.call(refreshPlan.input, 'materializedCommit'), false, 'normal product refresh input must not inherit historical immutable receipt');
const refreshed = await runGithubSourceOperation({
  input: Object.assign({}, refreshPlan.input, { maxRequestsPerOperation: 2 }),
  state: refreshSeed.state,
  active: lifecycle.activeWorkspace(refreshSeed.state),
  runtimeApi: { lifecycle },
  githubRequestPending: false,
  operationRef: { current: { token: null, controller: null } },
  setNotice: () => {}, setDialog: () => {}, setGithubRequestPending: () => {}, commit: () => {},
  getLatestState: () => refreshSeed.state, fetchImpl: refreshFetch, AbortControllerImpl: undefined
});
assert.equal(refreshed.ok, true);
assert.deepEqual(refreshCalls, [refreshCommitApi, refreshTreeApi, refreshRaw], 'fresh branch refresh resolves and materializes one NEW immutable representation');
assert.equal(refreshCalls.some((url) => url.includes(refreshOldCommit)), false, 'historical materialized receipt must not prequalify a fresh branch invocation');
const refreshedWorkspace = lifecycle.activeWorkspace(refreshed.state);
const refreshedSource = refreshedWorkspace.sources.find((item) => item.id === refreshSource.id);
assert.equal(refreshedSource.ref, 'main', 'configured branch truth remains main');
assert.equal(refreshedSource.materializedCommit, refreshNewCommit, 'fresh branch refresh stores NEW immutable receipt');
const refreshedRecord = refreshedWorkspace.records.find((record) => record.path === '.topics/refresh.md');
assert.equal(refreshedRecord?.sourceTarget?.materializedCommit, refreshNewCommit, 'fresh raw record uses NEW immutable representation');

console.log('githubSourceOperation prequalified refresh consistency: PASS');
console.log('githubSourceOperation: ok');
