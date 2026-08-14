import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { runGithubSourceOperation } from './githubSourceOperation.js';

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

console.log('githubSourceOperation: ok');
