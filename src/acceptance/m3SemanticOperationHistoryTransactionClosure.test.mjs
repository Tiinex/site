import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { runGithubSourceOperation } from '../app/githubSourceOperation.js';
import { createSemanticOperationHistoryCommit } from '../app/semanticOperationHistory.js';
import { createPersistenceOwnershipPolicy, DurableLocalAuthority, PersistenceRouteOwner } from '../app/persistenceOwnership.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;

// A user-owned GitHub operation leaving a public target may emit many internal commits,
// but exactly one of them may become a browser-history PUSH for that user action.
{
  const seeded = seedWorkspace('User Add GitHub Source');
  const ownership = createPersistenceOwnershipPolicy(PersistenceRouteOwner.publicTarget, {
    durableLocalAuthority: DurableLocalAuthority.isolatedPreexistingRecovery
  });
  const visibleModes = [];
  const semanticCommit = (_state, mode) => {
    const transition = ownership.beginSemanticNavigation(mode);
    visibleModes.push(transition.mode);
  };
  const ordinaryCommit = (_state, mode) => visibleModes.push(mode);
  const operationCommit = createSemanticOperationHistoryCommit({
    commit: ordinaryCommit,
    commitSemanticNavigation: semanticCommit
  });
  const result = await runGithubSourceOperation({
    input: {
      repository: 'Owner/Repo',
      rootPath: '.topics',
      label: 'Owner/Repo',
      explicitFileRefs: ['.topics/a.md'],
      resetSourceCache: false
    },
    state: seeded.state,
    active: seeded.workspace,
    runtimeApi: { lifecycle },
    githubRequestPending: false,
    operationRef: { current: { token: null, controller: null } },
    setNotice: () => {},
    setDialog: () => {},
    setGithubRequestPending: () => {},
    commit: operationCommit,
    getLatestState: () => seeded.state,
    fetchImpl: async (url) => responseFor(url),
    AbortControllerImpl: undefined
  });
  assert.equal(result.ok, true, result.error);
  assert(visibleModes.length >= 2, 'materializing GitHub operation must exercise staged visible commits');
  assert.equal(visibleModes[0], 'push', 'first meaningful commit exits public target with one semantic PUSH');
  assert.equal(visibleModes.filter((mode) => mode === 'push').length, 1, 'one user Add GitHub Source action creates exactly one semantic history entry');
  assert(visibleModes.slice(1).every((mode) => mode === 'replace'), 'all progress/final commits replace the same semantic history entry');
  assert.equal(ownership.report().routeKind, PersistenceRouteOwner.semanticState);
  assert.equal(ownership.report().durableLocalAuthority, DurableLocalAuthority.isolatedPreexistingRecovery, 'history transaction must not release v399 durable isolation');
}

// Workspace Open/Merge already own the semantic PUSH before child source materialization begins.
// Every child operation therefore replaces that already-established history entry.
{
  const seeded = seedWorkspace('Workspace Open child materialization');
  const ownership = createPersistenceOwnershipPolicy(PersistenceRouteOwner.publicTarget, {
    durableLocalAuthority: DurableLocalAuthority.isolatedPreexistingRecovery
  });
  const historyModes = [];
  const parentTransition = ownership.beginSemanticNavigation('push');
  historyModes.push(parentTransition.mode);
  const childCommit = createSemanticOperationHistoryCommit({
    commit: (_state, mode) => historyModes.push(mode),
    commitSemanticNavigation: (_state, mode) => historyModes.push(ownership.beginSemanticNavigation(mode).mode),
    navigationEstablished: true
  });
  const result = await runGithubSourceOperation({
    input: {
      repository: 'Owner/Repo',
      rootPath: '.topics',
      label: 'Owner/Repo',
      explicitFileRefs: ['.topics/a.md'],
      resetSourceCache: false
    },
    state: seeded.state,
    active: seeded.workspace,
    runtimeApi: { lifecycle },
    githubRequestPending: false,
    operationRef: { current: { token: null, controller: null } },
    setNotice: () => {},
    setDialog: () => {},
    setGithubRequestPending: () => {},
    commit: childCommit,
    getLatestState: () => seeded.state,
    fetchImpl: async (url) => responseFor(url),
    AbortControllerImpl: undefined
  });
  assert.equal(result.ok, true, result.error);
  assert.equal(historyModes.filter((mode) => mode === 'push').length, 1, 'parent Open/Merge owns the only PUSH for the whole user operation');
  assert(historyModes.slice(1).every((mode) => mode === 'replace'), 'all child source stages replace the parent semantic entry');
}

const appSource = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
assert(appSource.includes("from './semanticOperationHistory.js'"), 'React controller must consume the operation-scoped history owner');
assert(appSource.includes("commit: guarded(options.semanticNavigation\n        ? createSemanticOperationHistoryCommit({ commit, commitSemanticNavigation })"), 'user Add GitHub Source must use a fresh semantic operation history transaction');
assert.equal((appSource.match(/semanticNavigationEstablished: true/g) || []).length, 2, 'Workspace Artifact Open and Merge must mark their child materialization as history-established');
assert(appSource.includes("onAddGitHubSource={(input) => addGitHubSource(input, { state: latestStateRef.current || state, workspaceId: dialogWorkspace.id, semanticNavigation: true })}"), 'visible Add GitHub Source remains the user-navigation owner');

console.log('✓ M3-C1 semantic operation history transaction closure tests passed');

function seedWorkspace(name) {
  const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name }, { clock: () => '2026-08-14T00:00:00.000Z' });
  assert.equal(created.ok, true);
  return { state: created.state, workspace: created.workspace };
}

function responseFor(url = '') {
  if (url === 'https://api.github.com/repos/Owner/Repo' || url === 'https://api.github.com/repos/owner/repo') return responseJson({ default_branch: 'main' });
  if (url === 'https://raw.githubusercontent.com/Owner/Repo/main/.topics/a.md' || url === 'https://raw.githubusercontent.com/owner/repo/main/.topics/a.md') return responseText('# A\n\nSemantic operation history fixture.');
  return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}), text: async () => '' };
}
function responseJson(json) { return { ok: true, status: 200, statusText: 'OK', json: async () => json, text: async () => JSON.stringify(json) }; }
function responseText(text) { return { ok: true, status: 200, statusText: 'OK', json: async () => ({}), text: async () => text }; }
