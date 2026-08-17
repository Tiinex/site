import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import { buildPublicTargetHash, classifyRouteLocation, publicTargetFromExternalUrl } from '../app/publicTarget.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';
import { createPersistenceOwnershipPolicy } from '../app/persistenceOwnership.js';
import { commitStateWithPersistence, createStatePersistenceScheduler } from '../app/statePersistenceScheduler.js';
import { persistCapturedScroll } from '../app/scrollPersistence.js';

const persistenceFixture = loadPersistence();
const { persistence, env, storageMap } = persistenceFixture;
const localState = durableLocalFixture();
persistence.writeState(localState, { storage: env.localStorage, location: env.location, history: env.history, mode: 'replace' });
const durableBefore = storageMap.get(persistence.LOCAL_DELTA_KEY);
const recoveryBefore = storageMap.get(persistence.LOCAL_RECOVERY_INDEX_KEY);
const cacheBefore = storageMap.get(persistence.STORAGE_KEY);
assert(durableBefore?.includes('# LOCAL DRAFT'), 'fixture must seed real durable local payload before public route');
assert(recoveryBefore?.includes('local-ws'), 'fixture must seed recovery index before public route');

const targetUrl = 'https://example.test/shared/public.trace.md';
const target = publicTargetFromExternalUrl(targetUrl, 'web.markdown');
const publicHash = buildPublicTargetHash(target);
env.location.hash = publicHash;
const routeOwner = classifyRouteLocation(env.location);
assert.equal(routeOwner.kind, 'public-target');
const ownership = createPersistenceOwnershipPolicy(routeOwner.kind);

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const runtimeApi = { lifecycle, config: globalThis.TiinexWorkspaceConfig };
const restored = await runPublicTargetRestoreCommand({
  target: routeOwner.target,
  runtimeApi,
  fetchImpl: async (url) => responseText(url === targetUrl ? topicMarkdown('Public target') : '', url === targetUrl)
});
assert.equal(restored.ok, true, restored.error);
assert.equal(restored.state.workspaces.some((workspace) => workspace.id === 'local-ws'), false, 'public runtime must not display unrelated durable local workspace');

let renderedState = null;
const latestStateRef = { current: lifecycle.makeEmptyAppState() };
const runtime = () => ({ persistence });
const scheduler = createStatePersistenceScheduler(env, { persistenceOwnership: ownership });
commitStateWithPersistence({
  nextState: restored.state,
  mode: 'replace',
  sourceState: latestStateRef.current,
  preserveCapturedViewScroll: (next) => next,
  latestStateRef,
  setState: (next) => { renderedState = next; },
  runtime,
  scheduler,
  persistenceOwnership: ownership
});
assert(renderedState?.workspaces?.length > 0, 'public target commit must render canonical public runtime');
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'initial public target commit must preserve existing durable local snapshot byte-for-byte');
assert.equal(storageMap.get(persistence.LOCAL_RECOVERY_INDEX_KEY), recoveryBefore, 'initial public target commit must preserve existing recovery index byte-for-byte');
assert.notEqual(storageMap.get(persistence.STORAGE_KEY), cacheBefore, 'public target commit may update source/session route cache normally');
assert.equal(env.location.hash, publicHash, 'public-target ownership must preserve readable public URL during automatic persistence');

// Simulate a later automatic/deferred view/lineage write while the public route still owns the browser.
const deferredState = JSON.parse(JSON.stringify(renderedState));
deferredState.view = Object.assign({}, deferredState.view, { workspaceVerse: 'lineage', query: 'deferred-public-view' });
commitStateWithPersistence({
  nextState: deferredState,
  mode: 'replace',
  options: { deferPersistence: true, persistenceReason: 'auto-lineage-view' },
  sourceState: renderedState,
  preserveCapturedViewScroll: (next) => next,
  latestStateRef,
  setState: (next) => { renderedState = next; },
  runtime,
  scheduler,
  persistenceOwnership: ownership
});
assert.equal(scheduler.report().pending, true, 'automatic public view update should enter normal deferred scheduler');
scheduler.flush('auto-lineage-view');
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'deferred public-target persistence must not replace hidden durable local recovery');
assert.equal(storageMap.get(persistence.LOCAL_RECOVERY_INDEX_KEY), recoveryBefore, 'deferred public-target persistence must preserve recovery index');
assert.equal(env.location.hash, publicHash, 'deferred public-target persistence must not silently turn public route into #state ownership');

// Scroll persistence is a separate direct write path and must consume the same owner policy.
const scrollState = JSON.parse(JSON.stringify(renderedState));
const scrollLatestRef = { current: scrollState };
persistCapturedScroll({
  latestStateRef: scrollLatestRef,
  state: scrollState,
  preserveCapturedViewScroll: (base) => Object.assign({}, base, { view: Object.assign({}, base.view, { scrollProof: 91 }) }),
  runtime,
  mode: 'replace',
  options: { force: true },
  doc: { visibilityState: 'visible' },
  persistenceOwnership: ownership
});
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'direct scroll persistence under public ownership must preserve hidden durable local recovery');
assert.equal(storageMap.get(persistence.LOCAL_RECOVERY_INDEX_KEY), recoveryBefore, 'direct scroll persistence under public ownership must preserve hidden recovery index');
assert.equal(env.location.hash, publicHash, 'scroll persistence must not implicitly release public-target ownership');

// Closing the final public workspace exercises the zero-workspace persistence branch.
const publicWorkspaceId = renderedState.activeWorkspaceId || renderedState.workspaces[0]?.id;
const closedPublic = lifecycle.closeWorkspace(renderedState, publicWorkspaceId);
assert.equal(closedPublic.ok, true, 'fixture must close the visible public workspace through canonical lifecycle');
assert.equal(closedPublic.state.workspaces.length, 0, 'closing the only public workspace must produce the real zero-workspace product state');
commitStateWithPersistence({
  nextState: closedPublic.state,
  mode: 'push',
  sourceState: renderedState,
  preserveCapturedViewScroll: (next) => next,
  latestStateRef,
  setState: (next) => { renderedState = next; },
  runtime,
  scheduler,
  persistenceOwnership: ownership
});
assert.equal(renderedState.workspaces.length, 0, 'public runtime may become visibly empty without revealing hidden local recovery');
assert.equal(storageMap.get(persistence.LOCAL_DELTA_KEY), durableBefore, 'zero-workspace public commit must preserve hidden durable local snapshot');
assert.equal(storageMap.get(persistence.LOCAL_RECOVERY_INDEX_KEY), recoveryBefore, 'zero-workspace public commit must preserve hidden local recovery index');
assert.equal(env.location.hash, publicHash, 'zero-workspace public clear must honor public route URL ownership');
assert.equal(storageMap.has(persistence.STORAGE_KEY), false, 'zero-workspace public clear may discard current public/session route cache');

// M3-C separates route truth from durable-local authority: semantic route exit alone must not release v387 preservation.
ownership.beginSemanticNavigation('push');
assert.equal(ownership.writePolicy().routeKind, 'semantic-state');
assert.equal(ownership.writePolicy().durableLocalPolicy, 'preserve-existing', 'semantic route exit from public target keeps hidden durable-local recovery isolated');
ownership.restoreHistoryEntry({ routeKind: 'semantic-state', durableLocalAuthority: 'normal' });
assert.equal(ownership.writePolicy().durableLocalPolicy, undefined, 'an independently restored ordinary semantic entry may retain normal durable-local authority');

const appSource = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
assert(appSource.includes('createPersistenceOwnershipPolicy(initialRuntimeRef.current.routeKind, { durableLocalAuthority: initialRuntimeRef.current.durableLocalAuthority })'), 'TiinexApp must establish separate route and durable-local authorities from initial classification/history');
assert(appSource.includes('persistenceOwnershipRef.current?.restoreHistoryEntry?.({ routeKind: routeOwner.kind, durableLocalAuthority })'), 'browser navigation must restore both route and durable-local authority');
assert.equal(appSource.includes("commit(result.state, 'replace', { preserveUrl: true })"), false, 'public restore must not rely on a one-shot preserveUrl commit flag');

console.log('✓ M3-A public-target durable-local preservation tests passed');

function durableLocalFixture() {
  const localSource = { id: 'local', kind: 'local-session', adapterId: 'local', sourceKind: 'local.session', label: 'Local' };
  return {
    version: 1,
    activeWorkspaceId: 'local-ws',
    view: { workspaceVerse: 'feed', selectedRecordId: 'local:draft' },
    workspaces: [{
      id: 'local-ws', name: 'Local recovery', title: 'Local recovery', sources: [localSource], sourceOrder: ['local'], assets: [],
      records: [{ id: 'local:draft', title: 'Local draft', path: 'draft.md', markdown: '# LOCAL DRAFT', sourceMode: 'local-draft', source: localSource }]
    }]
  };
}

function topicMarkdown(title) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-14\n  - Summary: Public target topic.\n\n---\n\n# ${title}\n\nPublic target material.\n`;
}

function responseText(text, ok = true) {
  return { ok, status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', text: async () => text };
}

function loadPersistence() {
  const storageMap = new Map();
  const historyUrls = [];
  const events = [];
  const sandbox = {
    Buffer,
    window: {
      localStorage: {
        getItem: (key) => storageMap.get(key) || null,
        setItem: (key, value) => storageMap.set(key, String(value)),
        removeItem: (key) => storageMap.delete(key)
      },
      location: { href: 'https://tiinex.dev/', pathname: '/', search: '', hash: '' },
      CustomEvent: class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
      dispatchEvent: (event) => { events.push(event); return true; },
      history: {
        replaceState: (_a, _b, url) => { historyUrls.push(['replace', url]); sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; },
        pushState: (_a, _b, url) => { historyUrls.push(['push', url]); sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }
      },
      setTimeout: () => 1,
      clearTimeout: () => {},
      requestIdleCallback: () => 2,
      cancelIdleCallback: () => {}
    },
    globalThis: {}
  };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const file of ['workspace.route.js', 'workspace.persistenceRecovery.js', 'workspace.persistenceRouteCache.js', 'workspace.persistencePresentation.js', 'workspace.persistenceClear.js', 'workspace.persistence.js']) {
    vm.runInContext(readFileSync(new URL(`../workspaces/${file}`, import.meta.url), 'utf8'), sandbox);
  }
  return { persistence: sandbox.window.TiinexWorkspacePersistence, env: sandbox.window, storageMap, historyUrls, events };
}
