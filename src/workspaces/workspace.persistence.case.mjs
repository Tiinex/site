import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { runExplicitUrlMaterialImportCommand } from '../app/urlMaterialCommand.js';
await import('./workspace.lifecycle.js');

function loadPersistence(options = {}) {
  const storageMap = new Map();
  const historyUrls = [];
  const failKeys = new Set(options.failKeys || []);
  const events = [];
  const sandbox = {
    Buffer,
    window: {
      localStorage: {
        getItem: (key) => storageMap.get(key) || null,
        setItem: (key, value) => {
          if (failKeys.has(key)) throw new Error(`quota:${key}`);
          storageMap.set(key, String(value));
        },
        removeItem: (key) => storageMap.delete(key)
      },
      location: { pathname: '/index.html', search: '', hash: '' },
      CustomEvent: class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
      dispatchEvent: (event) => { events.push(event); return true; },
      history: {
        replaceState: (_a, _b, url) => { historyUrls.push(['replace', url]); sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; },
        pushState: (_a, _b, url) => { historyUrls.push(['push', url]); sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }
      }
    },
    globalThis: {}
  };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.route.js', import.meta.url), 'utf8'), sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.persistenceRecovery.js', import.meta.url), 'utf8'), sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.persistenceRouteCache.js', import.meta.url), 'utf8'), sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.persistencePresentation.js', import.meta.url), 'utf8'), sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.persistenceClear.js', import.meta.url), 'utf8'), sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.persistence.js', import.meta.url), 'utf8'), sandbox);
  return { persistence: sandbox.window.TiinexWorkspacePersistence, routeCache: sandbox.window.TiinexWorkspacePersistenceRouteCache, env: sandbox.window, historyUrls, storageMap, failKeys, events };
}

const { persistence, env, historyUrls, storageMap } = loadPersistence();
const localSource = { id: 'local', kind: 'local-session', adapterId: 'local', sourceKind: 'local.session', label: 'Local' };
const githubSource = { id: 'github:docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics' };
const state = {
  version: 1,
  activeWorkspaceId: 'workspace:embedded-default:tiinex-docs',
  view: { workspaceVerse: 'tree', query: 'topic' },
  workspaces: [{
    id: 'workspace:embedded-default:tiinex-docs', name: 'Tiinex docs', title: 'Tiinex docs', sources: [localSource, githubSource], sourceOrder: ['local', githubSource.id],
    records: [
      { id: 'local:r1', title: 'Local Topic', path: 'topics/local.md', markdown: '# Local Topic', sourceMode: 'local-draft', source: localSource },
      { id: 'source:r2', title: 'Remote Topic', path: 'topics/remote.md', markdown: '# Remote must not be durable local authority', sourceMode: 'source-backed', source: githubSource, materialRole: 'leaf' }
    ],
    assets: [
      { id: 'local:a1', path: 'assets/local.svg', name: 'local.svg', content: '<svg/>', previewState: 'available', source: localSource, publicAvailability: 'not-public' },
      { id: 'source:a2', path: 'assets/remote.svg', name: 'remote.svg', content: '<svg>remote</svg>', previewState: 'available', source: githubSource }
    ], importLog: [{ kind: 'fixture', at: '2026-08-11T00:00:00.000Z' }]
  }]
};

if (persistence.readInitialState({ storage: env.localStorage, location: env.location }) !== null) throw new Error('clean URL must not restore unrelated persisted route/session state');
const cleanResolution = persistence.resolveInitialState({ storage: env.localStorage, location: env.location });
if (cleanResolution.requested || cleanResolution.resolved) throw new Error('clean URL must remain unowned by explicit route resolution');
env.location.hash = '#state=%%%invalid%%%';
const malformedResolution = persistence.resolveInitialState({ storage: env.localStorage, location: env.location });
if (!malformedResolution.requested || malformedResolution.resolved || malformedResolution.reason !== 'route-decode-failed') throw new Error('malformed route encoding must be requested but unresolved');
env.location.hash = `#state=${persistence.encodeState({ arbitrary: true })}`;
const invalidShapeResolution = persistence.resolveInitialState({ storage: env.localStorage, location: env.location });
if (!invalidShapeResolution.requested || invalidShapeResolution.resolved) throw new Error('parseable JSON with invalid route shape must not own startup');
env.location.hash = `#state=${persistence.encodeState({ v: 999, workspaces: [] })}`;
const unsupportedResolution = persistence.resolveInitialState({ storage: env.localStorage, location: env.location });
if (unsupportedResolution.resolved || unsupportedResolution.reason !== 'route-version-unsupported') throw new Error('unsupported route version must not own startup');
env.location.hash = `#state=${persistence.encodeState({ v: 2, activeWorkspaceId: '', view: {}, workspaces: [] })}`;
const explicitEmptyResolution = persistence.resolveInitialState({ storage: env.localStorage, location: env.location });
if (!explicitEmptyResolution.resolved || explicitEmptyResolution.reason !== 'route-owned-empty' || !Array.isArray(explicitEmptyResolution.state?.workspaces) || explicitEmptyResolution.state.workspaces.length !== 0) throw new Error('well-shaped v2 empty route must remain a legitimate explicit route owner');
env.location.hash = '';
const hash = persistence.writeState(state, { storage: env.localStorage, location: env.location, history: env.history, mode: 'push' });
if (!hash.startsWith('#state=')) throw new Error('explicit route must be written to hash');
if (historyUrls[0]?.[0] !== 'push') throw new Error('route creation should support push history');
if (!storageMap.has(persistence.STORAGE_KEY)) throw new Error('route/source cache must use its own storage domain');
if (!storageMap.has(persistence.LOCAL_DELTA_KEY)) throw new Error('durable local deltas must use a separate storage domain');
if (!storageMap.has(persistence.LOCAL_RECOVERY_INDEX_KEY)) throw new Error('durable local deltas must publish a small recovery index so clean-start local work cannot become orphaned');
if (storageMap.has(persistence.LEGACY_STORAGE_KEY)) throw new Error('new writes must not use legacy all-in-one workspaceState key');
const writtenRoute = persistence.decodeState(hash);
const writtenRemoteShell = writtenRoute.workspaces[0].records.find((record) => record.id === 'source:r2');
const writtenRemoteAssetShell = writtenRoute.workspaces[0].assets.find((asset) => asset.id === 'source:a2');
if (writtenRemoteShell?.markdown !== '' || writtenRemoteShell?.materialAvailability !== 'material-unavailable' || writtenRemoteShell?.cacheState !== 'route-shell-material-unavailable') throw new Error('makeRouteState/writeState must truthfully mark omitted source record material unavailable');
if (writtenRemoteAssetShell?.content || writtenRemoteAssetShell?.dataUrl || writtenRemoteAssetShell?.materialAvailability !== 'material-unavailable' || writtenRemoteAssetShell?.previewState === 'available' || writtenRemoteAssetShell?.cacheState !== 'route-shell-material-unavailable') throw new Error('makeRouteState/writeState must truthfully mark omitted source asset material unavailable');

const routeCacheText = storageMap.get(persistence.STORAGE_KEY) || '';
const localDeltaText = storageMap.get(persistence.LOCAL_DELTA_KEY) || '';
if (routeCacheText.includes('# Remote must not be durable local authority')) throw new Error('source-backed markdown must not be persisted as localStorage authority');
if (!localDeltaText.includes('# Local Topic')) throw new Error('local draft markdown must be preserved in durable local delta storage');
if (!localDeltaText.includes('<svg/>')) throw new Error('local asset availability must be preserved in local delta storage');
if (localDeltaText.includes('# Remote must not be durable local authority')) throw new Error('source-backed markdown must not leak into local delta storage');

const restored = persistence.readInitialState({ storage: env.localStorage, location: env.location });
const restoredWorkspace = restored.workspaces[0];
const restoredLocal = restoredWorkspace.records.find((record) => record.id === 'local:r1');
const restoredRemote = restoredWorkspace.records.find((record) => record.id === 'source:r2');
if (restoredLocal?.markdown !== '# Local Topic') throw new Error('explicit route restore must reapply durable local delta markdown');
if (restoredRemote?.markdown !== '') throw new Error('source-backed body must restore as metadata/material-unavailable until transport reloads it');
if (restoredRemote?.cacheState !== 'source-backed-metadata-only-session-cache') throw new Error('source-backed route cache must disclose metadata-only state');
if (restoredWorkspace.assets.find((asset) => asset.id === 'local:a1')?.content !== '<svg/>') throw new Error('local asset must restore from local delta storage');
if (restoredWorkspace.assets.find((asset) => asset.id === 'source:a2')?.content) throw new Error('source-backed asset body must remain metadata-only');

// Clean/default startup may bootstrap a stable workspace first, then reapply only
// its browser-local deltas. This is distinct from blindly restoring old route state.
const cleanBootstrapState = {
  version: 1, activeWorkspaceId: state.activeWorkspaceId, view: { workspaceVerse: 'feed' },
  workspaces: [{ id: state.activeWorkspaceId, name: 'Tiinex docs', title: 'Tiinex docs', sources: [githubSource], sourceOrder: [githubSource.id], records: [], assets: [] }]
};
const hydratedBootstrap = persistence.hydrateWorkspaceWithLocalDeltas(cleanBootstrapState, state.activeWorkspaceId, env.localStorage);
if (!hydratedBootstrap.workspaces[0].records.some((record) => record.id === 'local:r1' && record.markdown === '# Local Topic')) throw new Error('default bootstrap must be able to reapply saved local deltas after config ownership is established');
if (hydratedBootstrap.workspaces[0].records.some((record) => record.id === 'source:r2')) throw new Error('local delta hydration must not inject source cache records');
const unrelatedLocalState = { ...state, activeWorkspaceId: 'workspace:local-only', workspaces: [{ id: 'workspace:local-only', name: 'Local only', records: [{ id: 'local:standalone', path: 'draft.md', markdown: '# Draft', sourceMode: 'local-draft', source: localSource }], assets: [], sources: [localSource], sourceOrder: ['local'] }] };
const standaloneEnv = loadPersistence();
standaloneEnv.persistence.writeState(unrelatedLocalState, { storage: standaloneEnv.env.localStorage, location: standaloneEnv.env.location, history: standaloneEnv.env.history });
const canonicalBase = { version: 1, activeWorkspaceId: state.activeWorkspaceId, view: { workspaceVerse: 'feed' }, workspaces: [{ id: state.activeWorkspaceId, name: 'Tiinex docs', records: [], assets: [], sources: [githubSource], sourceOrder: [githubSource.id] }] };
const augmented = standaloneEnv.persistence.augmentStartupStateWithLocalRecovery(canonicalBase, standaloneEnv.env.localStorage);
if (augmented.activeWorkspaceId !== 'workspace:local-only') throw new Error('saved local focus should restore after canonical config/default workspace ownership is established');
if (!augmented.workspaces.some((workspace) => workspace.id === 'workspace:local-only')) throw new Error('unmatched durable local workspace must remain explicitly recoverable alongside canonical startup');
if (!augmented.workspaces.some((workspace) => workspace.id === state.activeWorkspaceId && workspace.sources?.some((source) => source.id === githubSource.id))) throw new Error('restored local focus must not replace canonical source/bootstrap authority');

env.location.hash = '';
if (persistence.readInitialState({ storage: env.localStorage, location: env.location }) !== null) throw new Error('clean URL remains isolated from stale route cache; bootstrap owns startup');
const recoverableLocal = persistence.readRecoverableLocalState(env.localStorage);
if (!recoverableLocal?.workspaces?.some((workspace) => workspace.id === state.activeWorkspaceId)) throw new Error('durable browser-local work must remain discoverable after route/hash loss');
if (!recoverableLocal.workspaces[0].records.some((record) => record.id === 'local:r1')) throw new Error('clean-start recovery must preserve local draft payload');
if (recoverableLocal.workspaces[0].records.some((record) => record.id === 'source:r2')) throw new Error('clean-start local recovery must not resurrect source-cache material as local truth');
if (recoverableLocal.workspaces[0].workspaceRecovery?.recoveredFromCleanStart !== true) throw new Error('clean-start recovery must disclose its boundary');

// Hash-only public/share routes work without local cache and retain honest source shells.
const noCache = loadPersistence();
const routeOnly = noCache.persistence.encodeState({
  v: 2, activeWorkspaceId: 'shared-w', view: { workspaceVerse: 'feed' },
  workspaces: [{ id: 'shared-w', name: 'Shared', sources: [githubSource], sourceOrder: [githubSource.id], records: [{ id: 'source:shared', title: 'Remote shell', path: 'topics/remote.md', sourceMode: 'source-backed', source: githubSource, cacheState: 'route-shell-material-unavailable', materialAvailability: 'material-unavailable' }], assets: [] }]
});
noCache.env.location.hash = `#state=${routeOnly}`;
const publicRestored = noCache.persistence.readInitialState({ storage: noCache.env.localStorage, location: noCache.env.location });
if (publicRestored.workspaces[0].records[0].source.adapterId !== 'github') throw new Error('public hash route must preserve explicit source boundary');
if (publicRestored.workspaces[0].records[0].markdown) throw new Error('public hash route must not invent source body cache');
const publicWithLocal = loadPersistence();
publicWithLocal.persistence.writeState(unrelatedLocalState, { storage: publicWithLocal.env.localStorage, location: publicWithLocal.env.location, history: publicWithLocal.env.history });
publicWithLocal.env.location.hash = `#state=${routeOnly}`;
const isolatedPublic = publicWithLocal.persistence.readInitialState({ storage: publicWithLocal.env.localStorage, location: publicWithLocal.env.location });
if (isolatedPublic.workspaces.some((workspace) => workspace.id === 'workspace:local-only')) throw new Error('explicit public/share route must remain isolated from unrelated standalone local recovery');


// Explicit route membership is authoritative even when session cache has the same workspace id.
const membership = loadPersistence();
const staleSource = { id: 'github:stale', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Stale/source', repo: 'Stale/source', ref: 'old', rootPath: '.topics' };
const routeSource = { id: 'github:route', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Route/source', repo: 'Route/source', ref: 'new', rootPath: '.topics' };
const staleCacheState = {
  version: 1, activeWorkspaceId: 'shared-w', view: { workspaceVerse: 'feed' },
  workspaces: [{ id: 'shared-w', name: 'Cached Shared', sources: [staleSource], sourceOrder: [staleSource.id], records: [{ id: 'source:stale', path: 'topics/stale.md', markdown: '# stale', sourceMode: 'source-backed', source: staleSource }], assets: [{ id: 'asset:stale', path: 'assets/stale.svg', content: '<svg/>', source: staleSource }] }]
};
membership.persistence.writeState(staleCacheState, { storage: membership.env.localStorage, location: membership.env.location, history: membership.env.history });
const authoritativeRouteState = {
  v: 2, activeWorkspaceId: 'shared-w', view: { workspaceVerse: 'feed' },
  workspaces: [{ id: 'shared-w', name: 'Route Shared', sources: [routeSource], sourceOrder: [routeSource.id], records: [{ id: 'source:route', path: 'topics/route.md', markdown: '', sourceMode: 'source-backed', source: routeSource }], assets: [{ id: 'asset:route', path: 'assets/route.svg', content: '', source: routeSource }] }]
};
membership.env.location.hash = `#state=${membership.persistence.encodeState(authoritativeRouteState)}`;
const authoritativeRestored = membership.persistence.readInitialState({ storage: membership.env.localStorage, location: membership.env.location });
const authoritativeWorkspace = authoritativeRestored.workspaces[0];
if (authoritativeWorkspace.records.some((record) => record.id === 'source:stale')) throw new Error('session cache must not add stale record membership to explicit route');
if (!authoritativeWorkspace.records.some((record) => record.id === 'source:route')) throw new Error('explicit route record membership must survive same-id cache hydration');
if (authoritativeWorkspace.assets.some((asset) => asset.id === 'asset:stale')) throw new Error('session cache must not add stale asset membership to explicit route');
if (!authoritativeWorkspace.assets.some((asset) => asset.id === 'asset:route')) throw new Error('explicit route asset membership must survive same-id cache hydration');
if (authoritativeWorkspace.sources.some((source) => source.id === staleSource.id)) throw new Error('session cache must not add stale source membership to explicit route');
if (authoritativeWorkspace.sources[0]?.id !== routeSource.id || authoritativeWorkspace.sourceOrder.join(',') !== routeSource.id) throw new Error('explicit route source membership/order must remain authoritative');

// Cache hydration is monotonic: same-identity metadata cache may enrich gaps but must never downgrade richer explicit route material.
const richRouteRecord = { id: 'issue:route-snapshot', path: 'issues/42.trace.md', markdown: '# route snapshot', materialAvailability: 'available', cacheState: 'route-issue-snapshot-cache-complete', source: routeSource };
const weakCachedRecord = { id: richRouteRecord.id, path: richRouteRecord.path, markdown: '', materialAvailability: 'material-unavailable', cacheState: 'source-backed-metadata-only-session-cache', source: routeSource };
const richRouteAsset = { id: 'asset:route-rich', path: 'assets/route.svg', content: '<svg>route</svg>', previewState: 'available', cacheState: 'route-asset-complete', source: routeSource };
const weakCachedAsset = { id: richRouteAsset.id, path: richRouteAsset.path, content: '', previewState: 'material-unavailable', cacheState: 'source-backed-metadata-only-session-cache', source: routeSource };
const monotonic = membership.routeCache.mergeWorkspaceRouteShell(
  { id: 'shared-w', sources: [routeSource], sourceOrder: [routeSource.id], records: [richRouteRecord], assets: [richRouteAsset] },
  { id: 'shared-w', sources: [routeSource], sourceOrder: [routeSource.id], records: [weakCachedRecord], assets: [weakCachedAsset] }
);
if (monotonic.records[0].markdown !== '# route snapshot' || monotonic.records[0].materialAvailability !== 'available' || monotonic.records[0].cacheState !== 'route-issue-snapshot-cache-complete') throw new Error('session cache must not downgrade richer route-owned record material/status');
if (monotonic.assets[0].content !== '<svg>route</svg>' || monotonic.assets[0].previewState !== 'available' || monotonic.assets[0].cacheState !== 'route-asset-complete') throw new Error('session cache must not downgrade richer route-owned asset material/status');

// Legacy candidate-bearing route/cache state is migrated once at the I/O boundary.
const legacy = loadPersistence();
const legacyState = {
  version: 1, activeWorkspaceId: 'legacy-w', view: { workspaceVerse: 'feed' },
  workspaces: [{ id: 'legacy-w', name: 'Legacy', title: 'Legacy', sources: [githubSource], records: [], assets: [], workspaceMergeCandidates: [{ id: 'legacy-candidate', sourceRecordId: 'source:legacy:workspace', title: 'Legacy Workspace', path: '.topics/legacy.workspace.md', markdown: '# Legacy Workspace', sourceMode: 'source-backed', source: githubSource, materialReconciliation: { status: 'source-candidate-over-local', localCandidateSnapshot: { id: 'local:legacy', title: 'Legacy local edit', path: '.topics/legacy.workspace.md', markdown: '# Legacy Workspace\n\nlocal edit', sourceMode: 'local-workspace-file', source: localSource } } }] }]
};
legacy.env.location.hash = `#state=${legacy.persistence.encodeState(legacyState)}`;
const migratedLegacy = legacy.persistence.readInitialState({ storage: legacy.env.localStorage, location: legacy.env.location });
const migratedWorkspace = migratedLegacy.workspaces[0];
if (Object.prototype.hasOwnProperty.call(migratedWorkspace, 'workspaceMergeCandidates')) throw new Error('legacy candidate shape must be consumed at the persistence boundary');
const migratedCandidateRecord = migratedWorkspace.records.find((record) => record.id === 'source:legacy:workspace');
if (!migratedCandidateRecord?.workspaceArtifactRole?.migratedFromLegacyCandidate) throw new Error('legacy candidate must become canonical workspace artifact record');
if (migratedCandidateRecord.workspaceArtifactRole.schema !== 'tiinex.workspace.artifact.role.v1') throw new Error('legacy candidate migration must emit the canonical workspace artifact role schema');
if (migratedCandidateRecord.workspaceArtifactRole.openEligible !== true || migratedCandidateRecord.workspaceArtifactRole.mergeEligible !== true) throw new Error('legacy candidate migration must emit canonical Open/Merge capability flags');
if ('openMergeEligible' in migratedCandidateRecord.workspaceArtifactRole) throw new Error('legacy combined Open/Merge flag must not survive canonical migration');
if (!migratedWorkspace.records.some((record) => record.id === 'local:legacy' && record.materialReconciliation?.status === 'legacy-candidate-local-snapshot-migrated-explicit')) throw new Error('divergent hidden legacy candidate snapshot must migrate into explicit local material');

// Quota policy: disposable route cache may be dropped, but local delta failure is surfaced.
const quota = loadPersistence();
quota.failKeys.add(quota.persistence.STORAGE_KEY);
quota.persistence.writeState(state, { storage: quota.env.localStorage, location: quota.env.location, history: quota.env.history });
if (!quota.storageMap.has(quota.persistence.LOCAL_DELTA_KEY)) throw new Error('local deltas should still persist when disposable route cache cannot be written');
const localFailure = loadPersistence();
const oldSavedState = JSON.parse(JSON.stringify(state));
oldSavedState.workspaces[0].records[0].markdown = '# OLD SAVED WORK';
localFailure.persistence.writeState(oldSavedState, { storage: localFailure.env.localStorage, location: localFailure.env.location, history: localFailure.env.history });
const previousDurableDelta = localFailure.storageMap.get(localFailure.persistence.LOCAL_DELTA_KEY);
const previousRecoveryIndex = localFailure.storageMap.get(localFailure.persistence.LOCAL_RECOVERY_INDEX_KEY);
const newerUnsavedState = JSON.parse(JSON.stringify(oldSavedState));
newerUnsavedState.workspaces[0].records[0].markdown = '# NEWER UNSAVED WORK';
localFailure.failKeys.add(localFailure.persistence.LOCAL_DELTA_KEY);
localFailure.persistence.writeState(newerUnsavedState, { storage: localFailure.env.localStorage, location: localFailure.env.location, history: localFailure.env.history });
if (localFailure.storageMap.get(localFailure.persistence.LOCAL_DELTA_KEY) !== previousDurableDelta) throw new Error('failed local delta update must preserve the last-known-good durable snapshot');
if (localFailure.storageMap.get(localFailure.persistence.LOCAL_RECOVERY_INDEX_KEY) !== previousRecoveryIndex) throw new Error('failed local delta update must preserve the last-known-good recovery index');
const recoveredAfterFailure = localFailure.persistence.readRecoverableLocalState(localFailure.env.localStorage);
if (!recoveredAfterFailure?.workspaces?.[0]?.records?.some((record) => record.markdown === '# OLD SAVED WORK')) throw new Error('last-known-good local work must remain readable/recoverable after failed newer save');
if (recoveredAfterFailure?.workspaces?.[0]?.records?.some((record) => record.markdown === '# NEWER UNSAVED WORK')) throw new Error('failed newer local snapshot must not masquerade as durably persisted');
if (!localFailure.env.TiinexLocalStatePersistenceFailure?.localMaterialAtRisk || localFailure.env.TiinexLocalStatePersistenceFailure?.newestChangesPersisted !== false) throw new Error('local delta persistence failure must explicitly disclose that newest changes were not persisted');
if (!localFailure.env.TiinexLocalStatePersistenceFailure?.lastKnownGoodPreserved || !localFailure.env.TiinexLocalStatePersistenceFailure?.recoveryIndexPreserved) throw new Error('persistence failure receipt must disclose preserved last-known-good recovery');
if (!localFailure.events.some((event) => event.type === 'tiinex:local-persistence-failure' && event.detail?.localMaterialAtRisk && event.detail?.lastKnownGoodPreserved)) throw new Error('local persistence risk must dispatch a user-surfaceable product event with preserved-recovery truth');

const preservedClear = loadPersistence();
preservedClear.persistence.writeState(state, { storage: preservedClear.env.localStorage, location: preservedClear.env.location, history: preservedClear.env.history });
const preservedDelta = preservedClear.storageMap.get(preservedClear.persistence.LOCAL_DELTA_KEY);
const preservedIndex = preservedClear.storageMap.get(preservedClear.persistence.LOCAL_RECOVERY_INDEX_KEY);
preservedClear.env.location.hash = '#public-target-proof';
preservedClear.persistence.clearState({
  storage: preservedClear.env.localStorage,
  location: preservedClear.env.location,
  history: preservedClear.env.history,
  mode: 'replace',
  preserveUrl: true,
  durableLocalPolicy: 'preserve-existing'
});
if (preservedClear.storageMap.has(preservedClear.persistence.STORAGE_KEY)) throw new Error('public-owned empty-state clear may remove current route/session cache');
if (preservedClear.storageMap.get(preservedClear.persistence.LOCAL_DELTA_KEY) !== preservedDelta) throw new Error('public-owned empty-state clear must preserve durable local delta');
if (preservedClear.storageMap.get(preservedClear.persistence.LOCAL_RECOVERY_INDEX_KEY) !== preservedIndex) throw new Error('public-owned empty-state clear must preserve local recovery index');
if (preservedClear.env.location.hash !== '#public-target-proof') throw new Error('public-owned empty-state clear must preserve public route URL');

// Deferred presentation/view writes keep the last material cache/recovery intact and
// emit only a material-free route shell. This avoids serializing large repo snapshots
// again for every query/scroll/focus interaction.
const lightweight = loadPersistence();
lightweight.persistence.writeState(state, { storage: lightweight.env.localStorage, location: lightweight.env.location, history: lightweight.env.history });
const cachedBeforeViewWrite = lightweight.storageMap.get(lightweight.persistence.STORAGE_KEY);
const deltaBeforeViewWrite = lightweight.storageMap.get(lightweight.persistence.LOCAL_DELTA_KEY);
lightweight.persistence.writeState(state, {
  storage: lightweight.env.localStorage, location: lightweight.env.location, history: lightweight.env.history, mode: 'replace',
  sessionCachePolicy: 'preserve-existing', durableLocalPolicy: 'preserve-existing', routeMaterialPolicy: 'omit'
});
if (lightweight.storageMap.get(lightweight.persistence.STORAGE_KEY) !== cachedBeforeViewWrite) throw new Error('lightweight view persistence must preserve existing session material cache');
if (lightweight.storageMap.get(lightweight.persistence.LOCAL_DELTA_KEY) !== deltaBeforeViewWrite) throw new Error('lightweight view persistence must preserve existing durable local delta');
const lightweightHash = lightweight.persistence.readHashState(lightweight.env.location);
if ((lightweightHash?.workspaces || []).some((workspace) => (workspace.records || []).length || (workspace.assets || []).length)) throw new Error('lightweight view route must omit record/asset material');

persistence.clearState({ storage: env.localStorage, location: env.location, history: env.history, mode: 'push' });
if (storageMap.has(persistence.STORAGE_KEY) || storageMap.has(persistence.LOCAL_DELTA_KEY) || storageMap.has(persistence.LOCAL_RECOVERY_INDEX_KEY) || storageMap.has(persistence.LEGACY_STORAGE_KEY)) throw new Error('ordinary explicit clear must remove all persistence domains');
if (historyUrls.at(-1)?.[0] !== 'push') throw new Error('ordinary closing last workspace should remain push-history capable');

console.log('✓ workspace persistence tests passed');


// v426 external-web multi-target persistence: exact target-qualified identities survive local/session reopen.
const externalLifecycle = globalThis.TiinexWorkspaceLifecycle;
const externalCreated = externalLifecycle.createWorkspace(externalLifecycle.makeEmptyAppState(), { name: 'External multi persistence' }, { clock: () => '2026-08-18T11:20:00.000Z' });
const externalUrlA = 'https://a.example.test/folder/001.trace.md';
const externalUrlB = 'https://b.example.test/other/001.trace.md';
const externalImported = await runExplicitUrlMaterialImportCommand({
  lifecycle: externalLifecycle, state: externalCreated.state, workspaceId: externalCreated.workspace.id, urls: [externalUrlA, externalUrlB],
  fetchImpl: async (url) => ({ ok: true, status: 200, statusText: 'OK', text: async () => `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-18 11:20:00\n  - Summary: ${url.includes('a.example') ? 'A' : 'B'}\n\n---\n\n# External ${url}\n`, json: async () => ({}) })
});
if (!externalImported.ok || externalImported.records.length !== 2) throw new Error('external multi-target fixture must materialize two records');
const externalBefore = externalImported.state.workspaces[0].records.map((record) => ({ id: record.id, inputTarget: record.sourceTarget?.inputTarget })).sort((a, b) => a.inputTarget.localeCompare(b.inputTarget));
if (new Set(externalBefore.map((item) => item.id)).size !== 2) throw new Error('external multi-target fixture must have distinct target-qualified ids before persistence');
const externalEnv = loadPersistence();
externalEnv.persistence.writeState(externalImported.state, { storage: externalEnv.env.localStorage, location: externalEnv.env.location, history: externalEnv.env.history });
const externalRestored = externalEnv.persistence.readInitialState({ storage: externalEnv.env.localStorage, location: externalEnv.env.location });
const externalAfter = externalRestored.workspaces[0].records.map((record) => ({ id: record.id, inputTarget: record.sourceTarget?.inputTarget })).sort((a, b) => a.inputTarget.localeCompare(b.inputTarget));
if (externalAfter.length !== 2) throw new Error('external multi-target reopen must preserve both records');
if (JSON.stringify(externalAfter) !== JSON.stringify(externalBefore)) throw new Error('external multi-target reopen must preserve exact target-qualified identities');
console.log('workspace persistence external multi-target identity roundtrip: ok');
