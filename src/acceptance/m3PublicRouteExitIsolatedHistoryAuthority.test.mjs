import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import { buildPublicTargetHash, classifyRouteLocation, publicTargetFromExternalUrl } from '../app/publicTarget.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';
import {
  createPersistenceOwnershipPolicy,
  DurableLocalAuthority,
  PersistenceRouteOwner,
  persistenceWriteEnvForOwnership
} from '../app/persistenceOwnership.js';
import {
  durableLocalAuthorityForRoute,
  durableLocalAuthorityFromHistoryState,
  markCurrentHistoryDurableAuthority,
  TIINEX_HISTORY_AUTHORITY_KEY
} from '../app/historyAuthority.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from '../app/durableLocalMutationPolicy.js';
import { commitStateWithPersistence, createStatePersistenceScheduler } from '../app/statePersistenceScheduler.js';
import { runLocalMaterialImportCommand } from '../app/localMaterialCommand.js';
import { runWorkspaceEntrypointIntakeCommand } from '../app/workspaceEntrypointIntakeCommand.js';

const fixture = loadPersistence();
const { persistence, env, storageMap, history } = fixture;
const hiddenBaseline = localBaselineState();
persistence.writeState(hiddenBaseline, { storage: env.localStorage, location: env.location, history: env.history, mode: 'replace' });
const durableBefore = storageMap.get(persistence.LOCAL_DELTA_KEY);
const recoveryBefore = storageMap.get(persistence.LOCAL_RECOVERY_INDEX_KEY);
assert(durableBefore?.includes('# Hidden local draft'), 'fixture seeds hidden durable recovery L');

const publicTarget = publicTargetFromExternalUrl('https://example.test/shared/public.trace.md', 'web.markdown');
const publicHash = buildPublicTargetHash(publicTarget);
history.reset(`/${publicHash}`, { foreignOwner: { keep: true } });
assert.equal(classifyRouteLocation(env.location).kind, 'public-target');
const ownership = createPersistenceOwnershipPolicy(PersistenceRouteOwner.publicTarget, {
  durableLocalAuthority: DurableLocalAuthority.isolatedPreexistingRecovery
});
markCurrentHistoryDurableAuthority(history, env.location, DurableLocalAuthority.isolatedPreexistingRecovery);
assert.equal(history.state.foreignOwner.keep, true, 'history authority composes with unrelated history.state metadata');
assert.equal(durableLocalAuthorityFromHistoryState(history.state), DurableLocalAuthority.isolatedPreexistingRecovery);

const publicState = publicDerivedState();
persistence.writeState(publicState, persistenceWriteEnvForOwnership(ownership, {
  storage: env.localStorage,
  location: env.location,
  history: env.history,
  mode: 'replace'
}));
assert.equal(env.location.hash, publicHash, 'automatic public persistence keeps readable public target URL');
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'automatic public persistence preserves hidden durable baseline L');
assert.equal(storageMap.get(persistence.LOCAL_RECOVERY_INDEX_KEY), recoveryBefore, 'automatic public persistence preserves recovery index');

const autoHydrated = clone(publicState);
autoHydrated.view = Object.assign({}, autoHydrated.view, { derivedHydrationProof: 'automatic' });
persistence.writeState(autoHydrated, persistenceWriteEnvForOwnership(ownership, {
  storage: env.localStorage,
  location: env.location,
  history: env.history,
  mode: 'replace'
}));
assert.equal(env.location.hash, publicHash, 'automatic hydration does not release public route ownership');
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'automatic hydration keeps L byte-for-byte');

const semanticState = clone(publicState);
semanticState.view = Object.assign({}, semanticState.view, { workspaceVerse: 'tree', query: 'truthful-semantic-view' });
const firstExit = ownership.beginSemanticNavigation('replace');
assert.equal(firstExit.firstExitFromPublicTarget, true);
assert.equal(firstExit.mode, 'push', 'first explicit semantic exit forces a history PUSH even for replace-like interaction');
assert.equal(ownership.report().routeKind, PersistenceRouteOwner.semanticState);
assert.equal(ownership.report().durableLocalAuthority, DurableLocalAuthority.isolatedPreexistingRecovery, 'route exit does not release durable-local isolation');
persistence.writeState(semanticState, persistenceWriteEnvForOwnership(ownership, {
  storage: env.localStorage,
  location: env.location,
  history: env.history,
  mode: firstExit.mode
}));
assert.match(env.location.hash, /^#state=/, 'explicit semantic navigation writes truthful #state');
assert.equal(history.length, 2, 'semantic exit creates a second history entry behind the public target');
assert.equal(history.state.foreignOwner.keep, true, 'semantic history entry preserves unrelated history metadata');
assert.equal(history.state[TIINEX_HISTORY_AUTHORITY_KEY]?.durableLocalAuthority, DurableLocalAuthority.isolatedPreexistingRecovery, 'semantic history entry carries browser-local isolation authority');
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'semantic route exit still preserves hidden L');

const semanticHash = env.location.hash;
const routeResolutionIsolated = persistence.resolveInitialState({
  location: env.location,
  storage: env.localStorage,
  durableLocalPolicy: 'preserve-existing'
});
assert.equal(routeResolutionIsolated.resolved, true);
assert.equal(findRecord(routeResolutionIsolated.state, 'local:hidden'), null, 'isolated semantic restore does not inject hidden pre-public local recovery even when workspace id matches');
const routeResolutionOrdinary = persistence.resolveInitialState({
  location: env.location,
  storage: env.localStorage,
  durableLocalPolicy: 'normal'
});
assert(findRecord(routeResolutionOrdinary.state, 'local:hidden'), 'the same copied semantic route without browser-local isolation metadata remains ordinary and may hydrate local recovery');

history.back();
assert.equal(env.location.hash, publicHash, 'Back restores the readable public target entry');
assert.equal(durableLocalAuthorityForRoute(classifyRouteLocation(env.location).kind, history.state), DurableLocalAuthority.isolatedPreexistingRecovery, 'Back restores isolated durable authority for public target');
history.forward();
assert.equal(env.location.hash, semanticHash, 'Forward restores semantic history entry');
assert.equal(durableLocalAuthorityForRoute(classifyRouteLocation(env.location).kind, history.state), DurableLocalAuthority.isolatedPreexistingRecovery, 'Forward restores isolated authority from history metadata');

const secondEdit = ownership.beginSemanticNavigation('replace');
assert.equal(secondEdit.firstExitFromPublicTarget, false);
assert.equal(secondEdit.mode, 'replace', 'after semantic ownership exists, replace-like updates retain normal replace behavior');

const emptyState = { version: 1, activeWorkspaceId: '', view: { workspaceVerse: 'feed', query: '' }, workspaces: [], audit: null };
let rendered = semanticState;
const scheduler = createStatePersistenceScheduler(env, { persistenceOwnership: ownership });
commitStateWithPersistence({
  nextState: emptyState,
  mode: 'push',
  options: { allowEmptySemanticState: true },
  sourceState: semanticState,
  preserveCapturedViewScroll: (next) => next,
  latestStateRef: { current: semanticState },
  setState: (next) => { rendered = next; },
  runtime: () => ({ persistence }),
  scheduler,
  persistenceOwnership: ownership
});
assert.equal(rendered.workspaces.length, 0);
assert.match(env.location.hash, /^#state=/, 'explicit isolated final-close uses empty semantic route, not clean URL');
assert.equal(persistence.decodeState(env.location.hash).workspaces.length, 0, 'empty semantic history payload truthfully represents zero workspaces');
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'empty semantic history does not destroy hidden L');
const emptyHash = env.location.hash;
history.back();
assert.equal(env.location.hash, semanticHash, 'Back from empty semantic result returns prior semantic entry');
history.forward();
assert.equal(env.location.hash, emptyHash, 'Forward returns exact empty semantic result instead of clean startup');

for (const operation of Object.values(DurableLocalMutationOperation)) {
  const decision = durableLocalMutationDecision(ownership, operation);
  assert.equal(decision.ok, false, `${operation} must be refused while hidden recovery is isolated`);
  assert.match(decision.notice, /shared view/i);
}
assert.equal(durableLocalMutationDecision(ownership, 'public-target-materialization').ok, true, 'operation-owned guard does not classify public-derived material as new user-owned local work');
const normalOwnership = createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState, { durableLocalAuthority: DurableLocalAuthority.normal });
assert.equal(durableLocalMutationDecision(normalOwnership, DurableLocalMutationOperation.localMaterialIntake).ok, true, 'ordinary local owner still allows local intake');
let localMaterializeCalled = false;
const refusedLocalImport = await runLocalMaterialImportCommand({
  lifecycle: globalThis.TiinexWorkspaceLifecycle,
  state: publicState,
  workspaceId: 'W',
  fileList: [{ name: 'local.md' }],
  options: { materialize: async () => { localMaterializeCalled = true; return { records: [] }; } },
  persistenceOwnership: ownership
});
assert.equal(refusedLocalImport.ok, false);
assert.equal(refusedLocalImport.error, 'local-durable-change.unavailable-in-isolated-shared-view');
assert.equal(localMaterializeCalled, false, 'true local intake is refused before reading/materializing files or claiming durable success');
let workspaceMaterializeCalled = false;
const refusedWorkspaceIntake = await runWorkspaceEntrypointIntakeCommand({
  lifecycle: globalThis.TiinexWorkspaceLifecycle,
  state: publicState,
  parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig?.parseWorkspaceConfig,
  fileList: [{ name: 'local.workspace.md' }],
  options: { materialize: async () => { workspaceMaterializeCalled = true; return { workspaceEntries: [] }; } },
  persistenceOwnership: ownership
});
assert.equal(refusedWorkspaceIntake.ok, false);
assert.equal(workspaceMaterializeCalled, false, 'local Workspace Artifact intake is refused at command boundary before local materialization');
// Public-derived web.markdown remains a valid restore path even though lifecycle currently presents it with local-session-ish source metadata.
const restoredWebMarkdown = await runPublicTargetRestoreCommand({
  target: publicTarget,
  runtimeApi: { lifecycle: globalThis.TiinexWorkspaceLifecycle, config: globalThis.TiinexWorkspaceConfig },
  fetchImpl: async () => responseText(topicMarkdown('Public markdown'))
});
assert.equal(restoredWebMarkdown.ok, true, restoredWebMarkdown.error);
const restoredRecord = restoredWebMarkdown.record;
assert.equal(restoredRecord?.sourceMode, 'explicit-url');
assert.equal(restoredRecord?.source?.adapterId, 'local', 'fixture proves public-derived P still looks local-session-ish to current persistence');

const appSource = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
const localHookSource = readFileSync(new URL('../app/useLocalMaterialIntake.js', import.meta.url), 'utf8');
const workspaceHookSource = readFileSync(new URL('../app/useWorkspaceEntrypointIntake.js', import.meta.url), 'utf8');
assert(appSource.includes('beginSemanticNavigation'), 'React owner must expose one explicit semantic-navigation boundary');
assert(appSource.includes('durableLocalAuthorityForRoute(routeOwner.kind, window.history?.state || null)'), 'Back/Forward route restore must consume history-local durable authority');
assert(appSource.includes("durableLocalPolicy: durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery ? 'preserve-existing' : 'normal'"), 'isolated semantic restore must suppress hidden local-delta hydration');
assert(appSource.includes("commitSemanticNavigation(stateWithWorkspaceViewPatchAndFocus"), 'record/verse/query view navigation consumes semantic navigation owner');
assert(appSource.includes("commitSemanticNavigation(preparedState, 'push')"), 'Workspace Artifact Open exits public route through semantic owner');
assert(appSource.includes("commitSemanticNavigation(stateAfterWorkspaceClosePresentation"), 'workspace close consumes semantic navigation owner');
assert(appSource.includes("commit(stateWithWorkspaceViewPatch(currentState, workspaceId, { scrollPositions }), 'replace', { deferPersistence: true, persistenceReason: 'workspace-scroll' })"), 'scroll persistence remains automatic/non-navigation');
assert(appSource.includes("commit(stateWithWorkspaceFocused(withLayout, id, viewportWidth), 'replace'"), 'presentation layout remains non-navigation');
assert(localHookSource.includes('persistenceOwnership: getPersistenceOwnership?.() || null'), 'local intake hook passes ownership into the command-level local durability guard');
assert(workspaceHookSource.includes('persistenceOwnership: getPersistenceOwnership?.() || null'), 'global local Workspace Artifact intake passes ownership into the same command-level guard');
assert(!readFileSync(new URL('../app/publicTargetRestoreCommand.js', import.meta.url), 'utf8').includes('durableLocalMutationDecision'), 'public target materialization must not be falsely guarded by local-session storage classification');

console.log('✓ M3-C1 public route exit / isolated history authority tests passed');

function localBaselineState() {
  const local = { id: 'local', kind: 'local-session', adapterId: 'local', sourceKind: 'local.session', label: 'Local' };
  return {
    version: 1,
    activeWorkspaceId: 'W',
    view: { workspaceVerse: 'feed', selectedRecordId: 'local:hidden' },
    workspaces: [{
      id: 'W', name: 'Hidden recovery workspace', title: 'Hidden recovery workspace', sources: [local], sourceOrder: ['local'], assets: [],
      records: [{ id: 'local:hidden', title: 'Hidden local draft', path: 'hidden.md', markdown: '# Hidden local draft', sourceMode: 'local-draft', source: local }]
    }]
  };
}

function publicDerivedState() {
  const github = { id: 'github:owner-repo:main:topics', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', repo: 'Owner/Repo', ref: 'main', rootPath: '.topics', label: 'Public source' };
  return {
    version: 1,
    activeWorkspaceId: 'W',
    view: { universe: 'column', workspaceVerse: 'lineage', reader: 'scan', query: '', selectedRecordId: 'remote:A', displayOptions: {} },
    workspaces: [{
      id: 'W', name: 'Public branch', title: 'Public branch', sources: [github], sourceOrder: [github.id], assets: [],
      records: [{ id: 'remote:A', title: 'Public A', path: '.topics/a.trace.md', markdown: '', sourceMode: 'source-backed', source: github, sourceTarget: { inputTarget: 'https://raw.githubusercontent.com/Owner/Repo/main/.topics/a.trace.md' } }]
    }]
  };
}

function findRecord(state, id) {
  for (const workspace of state?.workspaces || []) {
    const record = (workspace.records || []).find((item) => item.id === id);
    if (record) return record;
  }
  return null;
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function topicMarkdown(title) { return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-14\n  - Summary: Public markdown.\n\n---\n\n# ${title}\n\nBody.\n`; }
function responseText(text) { return { ok: true, status: 200, statusText: 'OK', text: async () => text }; }

function loadPersistence() {
  const storageMap = new Map();
  const entries = [];
  let index = -1;
  const sandbox = { Buffer, window: {}, globalThis: {} };
  const location = { href: 'https://tiinex.dev/', pathname: '/', search: '', hash: '' };
  function applyUrl(url = '/') {
    const parsed = new URL(String(url || '/'), 'https://tiinex.dev/');
    location.href = parsed.href;
    location.pathname = parsed.pathname;
    location.search = parsed.search;
    location.hash = parsed.hash;
  }
  const history = {
    get state() { return index >= 0 ? entries[index]?.state || null : null; },
    get length() { return entries.length; },
    replaceState(state, _title, url) {
      if (index < 0) { entries.push({ state, url: url || '/' }); index = 0; }
      else entries[index] = { state, url: url || entries[index].url };
      applyUrl(entries[index].url);
    },
    pushState(state, _title, url) {
      entries.splice(index + 1);
      entries.push({ state, url: url || '/' });
      index = entries.length - 1;
      applyUrl(entries[index].url);
    },
    back() { if (index > 0) { index -= 1; applyUrl(entries[index].url); } },
    forward() { if (index + 1 < entries.length) { index += 1; applyUrl(entries[index].url); } },
    reset(url = '/', state = null) { entries.splice(0, entries.length, { state, url }); index = 0; applyUrl(url); },
    entries
  };
  Object.assign(sandbox.window, {
    localStorage: {
      getItem: (key) => storageMap.get(key) || null,
      setItem: (key, value) => storageMap.set(key, String(value)),
      removeItem: (key) => storageMap.delete(key)
    },
    location,
    history,
    CustomEvent: class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    dispatchEvent: () => true,
    setTimeout: () => 1,
    clearTimeout: () => {},
    requestIdleCallback: () => 2,
    cancelIdleCallback: () => {}
  });
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const file of ['workspace.route.js', 'workspace.persistenceRecovery.js', 'workspace.persistenceRouteCache.js', 'workspace.persistencePresentation.js', 'workspace.persistenceClear.js', 'workspace.persistence.js']) {
    vm.runInContext(readFileSync(new URL(`../workspaces/${file}`, import.meta.url), 'utf8'), sandbox);
  }
  history.reset('/', { foreignOwner: { keep: true } });
  return { persistence: sandbox.window.TiinexWorkspacePersistence, env: sandbox.window, storageMap, history };
}
