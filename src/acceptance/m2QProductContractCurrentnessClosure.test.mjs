import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistenceCache.js';
import { runGithubSourceOperation } from '../app/githubSourceOperation.js';
import { sourceTransportBadgesForSource, sourceTransportRefreshInputForSource } from '../app/sourceTransportRefresh.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const route = globalThis.TiinexWorkspaceRoute;
const persistenceCache = globalThis.TiinexWorkspacePersistenceCache;

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Current source' }, { clock: () => '2026-08-13T12:00:00.000Z' });
const broad = lifecycle.addWorkspaceSource(created.state, created.workspace.id, {
  repository: 'owner/repo', ref: 'main', rootPath: '.topics', repoDiscovery: true,
  requestedSurfaces: { repoFiles: { requested: true } },
  surfaces: { repoFiles: { requested: true, attempted: true, discovered: 5, loaded: 5, transportTier: 'cache', transportTiers: ['cache'] } },
  transportPlan: { configured: { cache: true, mirror: true, proxy: true, direct: true } }
});
assert.equal(broad.ok, true);

let savedState = null;
const save = await runGithubSourceOperation({
  input: {
    operation: 'register', sourceId: broad.source.id, repository: 'owner/repo', ref: 'main', rootPath: '.topics',
    repoDiscovery: false, issueDiscovery: false, issueUrls: '', explicitFileRefs: ['.topics/x.md']
  },
  state: broad.state,
  active: lifecycle.activeWorkspace(broad.state),
  runtimeApi: { lifecycle },
  commit: (state) => { savedState = state; },
  getLatestState: () => broad.state,
  setNotice: () => {}, setDialog: () => {}, setGithubRequestPending: () => {},
  AbortControllerImpl: undefined
});
assert.equal(save.ok, true, save.error);
const savedWorkspace = lifecycle.activeWorkspace(savedState || save.state);
const savedSource = savedWorkspace.sources.find((source) => source.id === broad.source.id);
assert.equal(savedSource.repoDiscovery, false, 'current source config owns broad repo discovery after Save source');
assert.deepEqual(savedSource.explicitFileRefs, ['.topics/x.md'], 'exact file target remains current source configuration');
assert.equal(savedSource.requestedSurfaces.repoFiles.requested, false, 'current requested surface records broad repo discovery as off');
assert.equal(savedSource.surfaces.repoFiles.loaded, 5, 'historical loaded repo surface remains diagnostic history instead of being erased');

const formSource = readFileSync(new URL('../schemas/workspace/workspace.add.views.jsx', import.meta.url), 'utf8');
assert(formSource.includes('const repoRequested = Boolean(continuation?.repoDiscovery);'), 'Edit source checkbox must hydrate from current repoDiscovery only');
assert.equal(formSource.includes('rememberedRepo.loaded'), false, 'historical loaded repo surface must not become checkbox authority');

const routed = route.makeRouteState(savedState || save.state);
const restored = route.normalizeRouteState(routed, lifecycle);
const restoredSource = lifecycle.activeWorkspace(restored).sources.find((source) => source.id === broad.source.id);
assert.equal(restoredSource.repoDiscovery, false, 'route/F5 keeps broad discovery off');
assert.deepEqual(restoredSource.explicitFileRefs, ['.topics/x.md'], 'route/F5 keeps exact target');
assert.equal(restoredSource.surfaces.repoFiles.loaded, 5, 'route/F5 may keep historical repo surface diagnostics');
const historyBadges = sourceTransportBadgesForSource(restoredSource);
assert(historyBadges.some((badge) => badge.rows?.some((row) => row.key === 'repoFiles')), 'historical repo transport may remain diagnostically visible');
assert.equal(historyBadges.some((badge) => badge.rows?.some((row) => row.key === 'repoFiles' && row.refreshable)), false, 'historical repo surface is not refreshable broad discovery when repoDiscovery is off');
const exactRefresh = sourceTransportRefreshInputForSource(restoredSource, 'cache', ['repoFiles']);
assert.equal(exactRefresh.ok, true, 'exact configured targets remain refreshable even when a stale repo surface was requested');
assert.equal(exactRefresh.input.repoDiscovery, false, 'transport refresh cannot re-enable broad repo discovery from history');
assert.deepEqual(exactRefresh.input.explicitFileRefs, ['.topics/x.md'], 'transport refresh falls back to current exact target configuration');
assert.deepEqual(exactRefresh.selectedSurfaceKeys, ['explicitFiles'], 'stale repo surface selection is replaced by currently configured exact surface');

const targeted = lifecycle.addWorkspaceSource(savedState || save.state, created.workspace.id, {
  id: 'github-file:tiinex-docs:schema', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.file',
  label: 'Tiinex/docs', repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics', count: 1,
  closeable: true, loadable: false, repoDiscovery: false, explicitFileRefs: ['.topics/.schemas/decision.md']
});
assert.equal(targeted.ok, true);
const targetedRoute = route.makeRouteState(targeted.state);
const targetedRestored = route.normalizeRouteState(targetedRoute, lifecycle);
const targetedSource = lifecycle.activeWorkspace(targetedRestored).sources.find((source) => source.id === 'github-file:tiinex-docs:schema');
assert.equal(targetedSource.sourceKind, 'github.file');
assert.equal(targetedSource.loadable, false, 'targeted schema provenance remains non-loadable across route restore');
assert.equal(targetedSource.count, 1, 'targeted schema provenance keeps truthful recovered count across route restore');
const cacheSource = persistenceCache.compactSourceForSessionCache(targetedSource, lifecycle.activeWorkspace(targetedRestored));
assert.equal(cacheSource.loadable, false, 'session cache preserves targeted schema source capability');
assert.equal(cacheSource.count, 1, 'session cache preserves targeted schema source count');

const routeSource = readFileSync(new URL('../workspaces/workspace.route.js', import.meta.url), 'utf8');
assert(routeSource.includes('loadable: source.loadable !== false'), 'route source projection must explicitly preserve loadability capability');

console.log('✓ M2 Q product contract v376 currentness/capability closure tests passed');
