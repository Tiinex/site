import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { workspaceWindowFor } from '../app/workspaceWindow.js';

function loadPersistence() {
  const storageMap = new Map();
  const sandbox = {
    Buffer,
    window: {
      localStorage: {
        getItem: (key) => storageMap.get(key) || null,
        setItem: (key, value) => storageMap.set(key, String(value)),
        removeItem: (key) => storageMap.delete(key)
      },
      location: { pathname: '/index.html', search: '', hash: '' },
      history: {
        replaceState: (_a, _b, url) => { sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; },
        pushState: (_a, _b, url) => { sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }
      }
    },
    globalThis: {}
  };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const file of [
    './workspace.route.js',
    './workspace.persistenceRecovery.js',
    './workspace.persistenceRouteCache.js',
    './workspace.persistencePresentation.js',
    './workspace.persistence.js'
  ]) vm.runInContext(readFileSync(new URL(file, import.meta.url), 'utf8'), sandbox);
  return { persistence: sandbox.window.TiinexWorkspacePersistence, env: sandbox.window, storageMap };
}

const workspace = (id) => ({ id, name: id.toUpperCase(), title: id.toUpperCase(), records: [], assets: [], sources: [], sourceOrder: [] });
const views = {
  a: { workspaceVerse: 'lineage', lineageQuery: '', query: '', layoutMode: 'expanded', scrollPositions: { 'a:lineage:::': 420 } },
  b: { workspaceVerse: 'tree', query: 'schema', layoutMode: 'compact', scrollPositions: { 'b:tree:schema::': 175 } },
  c: { workspaceVerse: 'feed', query: '', layoutMode: 'expanded', scrollPositions: {} }
};
const state = {
  version: 1,
  activeWorkspaceId: 'b',
  view: { ...views.b },
  workspaceViews: views,
  workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: 1 },
  workspaces: [workspace('a'), workspace('b'), workspace('c')]
};

const roundtrip = loadPersistence();
const hash = roundtrip.persistence.writeState(state, { storage: roundtrip.env.localStorage, location: roundtrip.env.location, history: roundtrip.env.history, mode: 'replace' });
const routeState = roundtrip.persistence.decodeState(hash);
assert.equal(routeState.workspaceViews, undefined, 'M2 browser presentation must not enter the semantic/share route');
assert.equal(routeState.workspaceWindow, undefined, 'workspaceWindow must remain outside route/hash semantics in M2');
assert.equal(routeState.view.layoutMode, undefined, 'active workspace layoutMode must remain browser-local presentation, not route semantics');
assert.equal(routeState.view.scrollPositions, undefined, 'active workspace scroll positions must remain browser-local presentation, not route semantics');
const localEnvelope = JSON.parse(roundtrip.storageMap.get(roundtrip.persistence.LOCAL_DELTA_KEY));
assert.equal(localEnvelope.state.workspaceViews, undefined, 'workspaceViews must not enter durable local material deltas');
assert.equal(localEnvelope.state.workspaceWindow, undefined, 'workspaceWindow must not enter durable local material deltas');
const cacheEnvelope = JSON.parse(roundtrip.storageMap.get(roundtrip.persistence.STORAGE_KEY));
assert.deepEqual(Object.keys(cacheEnvelope.state.workspaceViews).sort(), ['a', 'b', 'c'], 'session cache stores presentation only for current workspace identities');
assert.equal(cacheEnvelope.state.workspaceWindow.offset, 1, 'session cache stores the preferred workspace window offset');

const restored = roundtrip.persistence.readInitialState({ storage: roundtrip.env.localStorage, location: roundtrip.env.location });
assert.equal(restored.activeWorkspaceId, 'b', 'explicit route focus remains authoritative after session presentation restore');
assert.equal(restored.workspaceViews.a.workspaceVerse, 'lineage', 'workspace A lens restores across refresh');
assert.equal(restored.workspaceViews.a.scrollPositions['a:lineage:::'], 420, 'workspace A vertical reading position restores across refresh');
assert.equal(restored.workspaceViews.b.workspaceVerse, 'tree', 'workspace B lens restores across refresh');
assert.equal(restored.workspaceViews.b.query, 'schema', 'workspace B query restores across refresh');
assert.equal(restored.workspaceViews.b.layoutMode, 'compact', 'workspace B compact presentation restores across refresh');
assert.equal(restored.workspaceViews.b.scrollPositions['b:tree:schema::'], 175, 'workspace B vertical reading position restores across refresh');
assert.equal(restored.workspaceViews.c.workspaceVerse, 'feed', 'workspace C keeps its independent lens');
assert.equal(restored.workspaceWindow.offset, 1, 'workspace window preferred offset restores from browser-local session cache');
const restoredWindow = workspaceWindowFor(restored, { viewportWidth: 1400 });
assert.equal(restoredWindow.visibleIds.join(','), 'b,c', 'restored preferred window is clamped while keeping route-active workspace visible');
assert.equal(restoredWindow.activeWorkspaceId, 'b', 'restore never uses pager semantics to change focus');

const routeWins = loadPersistence();
routeWins.persistence.writeState(state, { storage: routeWins.env.localStorage, location: routeWins.env.location, history: routeWins.env.history });
const alteredCache = JSON.parse(routeWins.storageMap.get(routeWins.persistence.STORAGE_KEY));
alteredCache.state.workspaceViews.b.workspaceVerse = 'feed';
alteredCache.state.workspaceViews.b.query = 'stale-cache-query';
routeWins.storageMap.set(routeWins.persistence.STORAGE_KEY, JSON.stringify(alteredCache));
const explicitRoute = routeWins.persistence.decodeState(routeWins.env.location.hash);
explicitRoute.view = { workspaceVerse: 'tree', query: 'route-query', layoutMode: 'expanded', scrollPositions: { illegal: 999 } };
routeWins.env.location.hash = `#state=${routeWins.persistence.encodeState(explicitRoute)}`;
const routeFocused = routeWins.persistence.readInitialState({ storage: routeWins.env.localStorage, location: routeWins.env.location });
assert.equal(routeFocused.activeWorkspaceId, 'b', 'cached presentation cannot redirect explicit route focus');
assert.equal(routeFocused.workspaceViews.b.workspaceVerse, 'tree', 'route active view fields override stale cached active view');
assert.equal(routeFocused.workspaceViews.b.query, 'route-query', 'route active query overrides stale cached active query');
assert.equal(routeFocused.workspaceViews.b.layoutMode, 'compact', 'illegal route layoutMode cannot override compatible cached browser presentation');
assert.equal(routeFocused.workspaceViews.b.scrollPositions['b:tree:schema::'], 175, 'illegal route scrollPositions cannot override compatible cached browser presentation');
assert.equal(routeFocused.view.layoutMode, undefined, 'incoming route layoutMode is stripped at the semantic route boundary');
assert.equal(routeFocused.view.scrollPositions, undefined, 'incoming route scroll positions are stripped at the semantic route boundary');

const closed = loadPersistence();
const afterClose = { ...state, activeWorkspaceId: 'a', view: { ...views.a }, workspaces: [workspace('a'), workspace('c')], workspaceViews: { ...views }, workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: 0 } };
closed.persistence.writeState(afterClose, { storage: closed.env.localStorage, location: closed.env.location, history: closed.env.history });
const closedCache = JSON.parse(closed.storageMap.get(closed.persistence.STORAGE_KEY));
assert.equal(closedCache.state.workspaceViews.b, undefined, 'closed workspace presentation is pruned before session-cache write');

const mismatch = loadPersistence();
mismatch.persistence.writeState(state, { storage: mismatch.env.localStorage, location: mismatch.env.location, history: mismatch.env.history });
const mismatchedCache = JSON.parse(mismatch.storageMap.get(mismatch.persistence.STORAGE_KEY));
mismatchedCache.state.view = { workspaceVerse: 'tree', query: 'stale-cache', selectedRecordId: 'stale', layoutMode: 'compact', scrollPositions: { stale: 175 } };
mismatch.storageMap.set(mismatch.persistence.STORAGE_KEY, JSON.stringify(mismatchedCache));
const mismatchedRoute = { v: 2, activeWorkspaceId: 'a', view: { workspaceVerse: 'feed', query: '' }, workspaces: [workspace('a'), workspace('c')] };
mismatch.env.location.hash = `#state=${mismatch.persistence.encodeState(mismatchedRoute)}`;
const mismatchedRestored = mismatch.persistence.readInitialState({ storage: mismatch.env.localStorage, location: mismatch.env.location });
assert.equal(mismatchedRestored.workspaceViews, undefined, 'mismatched ordered route/cache workspace sets must not hydrate stale presentation');
assert.equal(mismatchedRestored.workspaceWindow, undefined, 'mismatched route/cache workspace sets must ignore stale window presentation');
assert.equal(mismatchedRestored.activeWorkspaceId, 'a', 'mismatched cache cannot redirect route focus');
assert.equal(mismatchedRestored.view.workspaceVerse, 'feed', 'mismatched cache cannot restore a stale active workspace lens through cached.view');
assert.equal(mismatchedRestored.view.query, '', 'mismatched cache cannot restore a stale active query through cached.view');
assert.equal(mismatchedRestored.view.selectedRecordId, undefined, 'mismatched cache cannot restore stale selection through cached.view');
assert.equal(mismatchedRestored.view.layoutMode, undefined, 'mismatched cache cannot restore stale layoutMode through cached.view');
assert.equal(mismatchedRestored.view.scrollPositions, undefined, 'mismatched cache cannot restore stale scroll through cached.view');

const reordered = loadPersistence();
reordered.persistence.writeState(state, { storage: reordered.env.localStorage, location: reordered.env.location, history: reordered.env.history });
const reorderedCache = JSON.parse(reordered.storageMap.get(reordered.persistence.STORAGE_KEY));
reorderedCache.state.view = { workspaceVerse: 'tree', query: 'stale-order', layoutMode: 'compact', scrollPositions: { stale: 222 } };
reordered.storageMap.set(reordered.persistence.STORAGE_KEY, JSON.stringify(reorderedCache));
const reorderedRoute = { v: 2, activeWorkspaceId: 'b', view: { workspaceVerse: 'feed', query: 'route-order' }, workspaces: [workspace('b'), workspace('a'), workspace('c')] };
reordered.env.location.hash = `#state=${reordered.persistence.encodeState(reorderedRoute)}`;
const reorderedRestored = reordered.persistence.readInitialState({ storage: reordered.env.localStorage, location: reordered.env.location });
assert.equal(reorderedRestored.workspaceViews, undefined, 'same workspace IDs in a different order are presentation-incompatible');
assert.equal(reorderedRestored.workspaceWindow, undefined, 'different workspace ordering must reject cached workspaceWindow');
assert.equal(reorderedRestored.view.workspaceVerse, 'feed', 'different workspace ordering must reject legacy cached.view presentation');
assert.equal(reorderedRestored.view.query, 'route-order', 'route semantic query remains authoritative when cache order differs');
assert.equal(reorderedRestored.view.layoutMode, undefined, 'different workspace ordering cannot restore cached layoutMode');
assert.equal(reorderedRestored.view.scrollPositions, undefined, 'different workspace ordering cannot restore cached scroll');

const inbound = loadPersistence();
const inboundRoute = {
  v: 2,
  activeWorkspaceId: 'a',
  view: { workspaceVerse: 'tree', query: 'inbound', layoutMode: 'compact', scrollPositions: { inbound: 321 } },
  workspaceViews: { a: { workspaceVerse: 'lineage', layoutMode: 'compact', scrollPositions: { inbound: 321 } } },
  workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: 9 },
  workspaces: [workspace('a')]
};
inbound.env.location.hash = `#state=${inbound.persistence.encodeState(inboundRoute)}`;
const inboundRestored = inbound.persistence.readInitialState({ storage: inbound.env.localStorage, location: inbound.env.location });
assert.equal(inboundRestored.view.workspaceVerse, 'tree', 'incoming semantic route lens remains readable');
assert.equal(inboundRestored.view.query, 'inbound', 'incoming semantic route query remains readable');
assert.equal(inboundRestored.view.layoutMode, undefined, 'incoming route layoutMode is never presentation authority');
assert.equal(inboundRestored.view.scrollPositions, undefined, 'incoming route scrollPositions are never presentation authority');
assert.equal(inboundRestored.workspaceViews, undefined, 'incoming top-level workspaceViews are stripped at route ingress');
assert.equal(inboundRestored.workspaceWindow, undefined, 'incoming top-level workspaceWindow is stripped at route ingress');

mismatch.env.location.hash = '';
assert.equal(mismatch.persistence.readInitialState({ storage: mismatch.env.localStorage, location: mismatch.env.location }), null, 'clean URL must not bootstrap stale session presentation');

console.log('✓ workspace presentation persistence tests passed');
