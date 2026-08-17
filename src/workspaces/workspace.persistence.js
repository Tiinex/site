(function attachWorkspacePersistence(global) {
  'use strict';

  const STORAGE_KEY = 'tiinex.site.routeCache.v2';
  const LEGACY_STORAGE_KEY = 'tiinex.site.workspaceState.v1';
  const LOCAL_DELTA_KEY = 'tiinex.site.localDeltas.v1';
  const LOCAL_RECOVERY_INDEX_KEY = 'tiinex.site.localRecoveryIndex.v1';
  const LOCAL_DELTA_SCHEMA_ID = 'tiinex.workspace.localDeltas.v1';
  const HASH_PREFIX = '#state=';
  const SESSION_CACHE_SCHEMA_ID = 'tiinex.workspace.sessionCache.v1';
  const SESSION_CACHE_LIMITS = { maxRecordMarkdownChars: 160000, maxAssetPreviewChars: 160000, maxWorkspaceMarkdownChars: 160000, maxImportLogEntries: 25 };

  function encodeState(state) {
    const json = JSON.stringify(state || {});
    return b64UrlEncode(encodeURIComponent(json));
  }

  function decodeState(value) {
    try {
      const encoded = String(value || '').replace(/^#?state=/, '');
      if (!encoded) return null;
      return normalizeLegacyWorkspaceCandidateState(JSON.parse(decodeURIComponent(b64UrlDecode(encoded))));
    } catch (_) {
      return null;
    }
  }

  function readStoredState(storage) {
    try {
      const routeEnvelope = readStoredCacheEnvelope(storage);
      const routeState = unwrapSessionCache(routeEnvelope);
      const localState = readLocalDeltaState(storage);
      if (!routeState) return localState ? recoverableStateFromLocalDeltas(localState, readLocalRecoveryIndex(storage)) : null;
      return normalizeLegacyWorkspaceCandidateState(mergeStateWithLocalDeltas(routeState, localState));
    } catch (_) {
      return null;
    }
  }

  function readStoredCacheEnvelope(storage) {
    try {
      const value = storage?.getItem?.(STORAGE_KEY) || storage?.getItem?.(LEGACY_STORAGE_KEY);
      return value ? JSON.parse(value) : null;
    } catch (_) {
      return null;
    }
  }

  function readLocalDeltaState(storage) {
    try {
      const value = storage?.getItem?.(LOCAL_DELTA_KEY);
      const parsed = value ? JSON.parse(value) : null;
      if (!parsed || parsed.schema !== LOCAL_DELTA_SCHEMA_ID) return null;
      return parsed.state && typeof parsed.state === 'object' ? normalizeLegacyWorkspaceCandidateState(parsed.state) : null;
    } catch (_) {
      return null;
    }
  }

  function readHashState(locationLike) {
    const hash = locationLike?.hash || '';
    return hash.startsWith(HASH_PREFIX) ? decodeState(hash) : null;
  }

  function writeState(state, env = {}) {
    const storage = env.storage || global.localStorage;
    const locationLike = env.location || global.location;
    const historyLike = env.history || global.history;
    const normalizedState = normalizeLegacyWorkspaceCandidateState(state);
    const routeState = global.TiinexWorkspaceRoute?.makeRouteState?.(normalizedState) || normalizedState;
    const sessionCache = createSessionCacheEnvelope(normalizedState, routeState);
    const encoded = encodeState(routeState);
    try { storage?.setItem?.(STORAGE_KEY, JSON.stringify(sessionCache)); } catch (_) {}
    if (env.durableLocalPolicy !== 'preserve-existing') {
      const localDeltaEnvelope = createLocalDeltaEnvelope(normalizedState);
      const localRecoveryIndex = createLocalRecoveryIndex(normalizedState, localDeltaEnvelope.state);
      const localDeltaText = JSON.stringify(localDeltaEnvelope);
      const localRecoveryIndexText = JSON.stringify(localRecoveryIndex);
      const previousLocalDeltaText = safeStorageValue(storage, LOCAL_DELTA_KEY);
      const previousLocalRecoveryIndexText = safeStorageValue(storage, LOCAL_RECOVERY_INDEX_KEY);
      try {
        writeDurableLocalSnapshot(storage, localDeltaText, localRecoveryIndexText);
      } catch (error) {
        try { storage?.removeItem?.(STORAGE_KEY); } catch (_) {}
        try { storage?.removeItem?.(LEGACY_STORAGE_KEY); } catch (_) {}
        try {
          writeDurableLocalSnapshot(storage, localDeltaText, localRecoveryIndexText);
        } catch (retryError) {
          restoreLastKnownGoodLocalSnapshot(storage, previousLocalDeltaText, previousLocalRecoveryIndexText);
          const lastKnownGoodPreserved = Boolean(previousLocalDeltaText) && safeStorageValue(storage, LOCAL_DELTA_KEY) === previousLocalDeltaText;
          const recoveryIndexPreserved = previousLocalRecoveryIndexText == null || safeStorageValue(storage, LOCAL_RECOVERY_INDEX_KEY) === previousLocalRecoveryIndexText;
          surfaceLocalPersistenceFailure({
            schema: 'tiinex.local-state.persistence.failure.v1',
            at: new Date().toISOString(),
            message: String(retryError?.message || error?.message || 'localStorage write failed'),
            localMaterialAtRisk: true,
            newestChangesPersisted: false,
            previousRecoveryAvailable: Boolean(previousLocalDeltaText),
            lastKnownGoodPreserved,
            recoveryIndexPreserved
          });
        }
      }
    }
    const nextHash = `${HASH_PREFIX}${encoded}`;
    const mode = env.mode === 'push' ? 'push' : 'replace';
    if (!env.preserveUrl) writeUrlHash(nextHash, {
      mode,
      locationLike,
      historyLike,
      historyState: global.TiinexWorkspaceRoute?.routeHistoryState?.(routeState, env.historyIndex, historyLike?.state || null, env.historyStatePatch || null) || null
    });
    return nextHash;
  }

  function safeStorageValue(storage, key) {
    try { return storage?.getItem?.(key) ?? null; } catch (_) { return null; }
  }

  function writeDurableLocalSnapshot(storage, localDeltaText, localRecoveryIndexText) {
    storage?.setItem?.(LOCAL_DELTA_KEY, localDeltaText);
    storage?.setItem?.(LOCAL_RECOVERY_INDEX_KEY, localRecoveryIndexText);
  }

  function restoreLastKnownGoodLocalSnapshot(storage, previousLocalDeltaText, previousLocalRecoveryIndexText) {
    if (previousLocalDeltaText != null && safeStorageValue(storage, LOCAL_DELTA_KEY) !== previousLocalDeltaText) {
      try { storage?.setItem?.(LOCAL_DELTA_KEY, previousLocalDeltaText); } catch (_) {}
    }
    if (previousLocalRecoveryIndexText != null && safeStorageValue(storage, LOCAL_RECOVERY_INDEX_KEY) !== previousLocalRecoveryIndexText) {
      try { storage?.setItem?.(LOCAL_RECOVERY_INDEX_KEY, previousLocalRecoveryIndexText); } catch (_) {}
    }
  }

  function surfaceLocalPersistenceFailure(receipt = {}) { return recovery().surfaceLocalPersistenceFailure?.(receipt, global) || receipt; }

  function writeUrlHash(nextHash, options = {}) {
    const mode = options.mode === 'push' ? 'push' : 'replace';
    const locationLike = options.locationLike || global.location;
    const historyLike = options.historyLike || global.history;
    const pathname = locationLike?.pathname || '';
    const search = locationLike?.search || '';
    const url = `${pathname}${search}${nextHash || ''}`;
    try {
      if (mode === 'push' && historyLike?.pushState) historyLike.pushState(options.historyState || null, '', url);
      else if (historyLike?.replaceState) historyLike.replaceState(options.historyState || null, '', url);
      else if (locationLike) locationLike.hash = nextHash || '';
    } catch (_) {}
  }

  function recovery() { return global.TiinexWorkspacePersistenceRecovery || {}; }
  function readLocalRecoveryIndex(storage) { return recovery().readLocalRecoveryIndex?.(storage) || null; }
  function createLocalRecoveryIndex(state, localState) { return recovery().createLocalRecoveryIndex?.(state, localState) || { schema: 'tiinex.workspace.localRecoveryIndex.v1', currentWorkspaceId: '', workspaces: [] }; }
  function normalizeLegacyWorkspaceCandidateState(state) { return recovery().normalizeLegacyWorkspaceCandidateState?.(state) || state; }
  function recoverableStateFromLocalDeltas(localState, index) { return recovery().recoverableStateFromLocalDeltas?.(localState, index) || null; }
  function readRecoverableLocalState(storage = global.localStorage) { const localState = readLocalDeltaState(storage); return localState ? recoverableStateFromLocalDeltas(localState, readLocalRecoveryIndex(storage)) : null; }

  function augmentStartupStateWithLocalRecovery(state = {}, storage = global.localStorage, options = {}) { return recovery().augmentStartupStateWithLocalRecovery?.(state, readLocalDeltaState(storage), readLocalRecoveryIndex(storage), options) || normalizeLegacyWorkspaceCandidateState(state); }

  function resolveInitialState(env = {}) {
    const locationLike = env.location || global.location;
    const hash = String(locationLike?.hash || '');
    const requested = hash.startsWith(HASH_PREFIX);
    if (!requested) return { requested: false, resolved: false, state: null, reason: 'route-not-requested' };
    const decoded = readHashState(locationLike);
    if (!decoded) return { requested: true, resolved: false, state: null, reason: 'route-decode-failed' };
    const validateRoute = global.TiinexWorkspaceRoute?.validateRouteOwnershipState;
    const validation = typeof validateRoute === 'function' ? validateRoute(decoded) : { ok: false, reason: 'route-validator-unavailable' };
    if (!validation.ok) return { requested: true, resolved: false, state: null, reason: validation.reason || 'route-shape-invalid' };
    const storage = env.storage || global.localStorage;
    const semanticRoute = global.TiinexWorkspaceRoute?.semanticRouteState?.(decoded) || decoded;
    const localDeltaState = env.durableLocalPolicy === 'preserve-existing' ? null : readLocalDeltaState(storage);
    const state = hydrateHashStateFromSessionCache(semanticRoute, readStoredCacheEnvelope(storage), localDeltaState);
    return { requested: true, resolved: true, state, reason: validation.reason || 'route-resolved' };
  }

  function readInitialState(env = {}) {
    const resolution = resolveInitialState(env);
    return resolution.resolved ? resolution.state : null;
  }

  function clearState(env = {}) {
    const clearOwner = global.TiinexWorkspacePersistenceClear;
    if (typeof clearOwner?.clearState !== 'function') throw new Error('workspace.persistence-clear-owner-unavailable');
    return clearOwner.clearState(Object.assign({}, env, {
      keys: {
        storage: STORAGE_KEY,
        localDelta: LOCAL_DELTA_KEY,
        localRecoveryIndex: LOCAL_RECOVERY_INDEX_KEY,
        legacyStorage: LEGACY_STORAGE_KEY
      }
    }));
  }

  function createSessionCacheEnvelope(state, routeState) {
    return {
      schema: SESSION_CACHE_SCHEMA_ID,
      routeSummary: global.TiinexWorkspaceRoute?.routeSummary?.(routeState) || {},
      writtenAt: new Date().toISOString(),
      state: createSessionCacheState(state)
    };
  }

  function createSessionCacheState(state = {}) {
    const source = state && typeof state === 'object' ? state : {};
    return {
      schema: SESSION_CACHE_SCHEMA_ID,
      version: source.version || 1,
      activeWorkspaceId: source.activeWorkspaceId || '',
      view: Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all' } }, source.view || {}),
      audit: source.audit || null,
      workspaces: Array.isArray(source.workspaces) ? source.workspaces.map(compactWorkspaceForCache) : [],
      ...global.TiinexWorkspacePersistencePresentation?.createSessionPresentationState?.(source)
    };
  }

  function unwrapSessionCache(value) {
    if (!value || typeof value !== 'object') return null;
    if (value.schema === SESSION_CACHE_SCHEMA_ID && value.state && typeof value.state === 'object') return value.state;
    if (value.schema === SESSION_CACHE_SCHEMA_ID) return value;
    if (Array.isArray(value.workspaces)) return value;
    return null;
  }

  function hydrateHashStateFromSessionCache(routeState, storedEnvelope, localDeltaState = null) {
    const route = routeState && typeof routeState === 'object' ? routeState : null;
    if (!route || !Array.isArray(route.workspaces) || !route.workspaces.length) return routeState || null;
    const cached = unwrapSessionCache(storedEnvelope);
    if (!cached || !Array.isArray(cached.workspaces) || !cached.workspaces.length) return mergeStateWithLocalDeltas(route, localDeltaState);
    const cachedById = new Map(cached.workspaces.map((workspace) => [workspace.id, workspace]));
    const hydratedWorkspaces = route.workspaces.map((workspace) => {
      const cachedWorkspace = cachedById.get(workspace.id);
      return cachedWorkspace ? mergeWorkspaceRouteShell(workspace, cachedWorkspace) : workspace;
    });
    const merged = Object.assign({}, route, {
      view: global.TiinexWorkspacePersistencePresentation?.mergeSessionView?.(route, cached) || route.view || {},
      audit: cached.audit || route.audit || null,
      workspaces: hydratedWorkspaces,
      activeWorkspaceId: route.activeWorkspaceId || cached.activeWorkspaceId || hydratedWorkspaces[0]?.id || ''
    });
    const withPresentation = global.TiinexWorkspacePersistencePresentation?.restoreSessionPresentation?.(merged, cached) || merged;
    return normalizeLegacyWorkspaceCandidateState(mergeStateWithLocalDeltas(withPresentation, localDeltaState));
  }

  function mergeWorkspaceRouteShell(routeWorkspace = {}, cachedWorkspace = {}) {
    return global.TiinexWorkspacePersistenceRouteCache?.mergeWorkspaceRouteShell?.(routeWorkspace, cachedWorkspace) || routeWorkspace;
  }

  function compactWorkspaceForCache(workspace = {}) {
    return Object.assign({}, workspace, {
      source: Object.assign({}, workspace.source || {}),
      sources: Array.isArray(workspace.sources) ? workspace.sources.map((source) => compactSourceForSessionCache(source, workspace)) : [],
      sourceOrder: Array.isArray(workspace.sourceOrder) ? workspace.sourceOrder.slice() : [],
      records: Array.isArray(workspace.records) ? workspace.records.filter((record) => !isLocalForCache(record)).map(compactRecordForCache) : [],
      assets: Array.isArray(workspace.assets) ? workspace.assets.filter(isSourceBackedForCache).map(compactAssetForCache) : [],
      importLog: [],
      workspaceMarkdown: '',
      workspaceImport: Object.assign({}, workspace.workspaceImport || {})
    });
  }

  function createLocalDeltaEnvelope(state = {}) {
    return {
      schema: LOCAL_DELTA_SCHEMA_ID,
      writtenAt: new Date().toISOString(),
      state: createLocalDeltaState(state)
    };
  }

  function createLocalDeltaState(state = {}) {
    const source = state && typeof state === 'object' ? state : {};
    return {
      schema: LOCAL_DELTA_SCHEMA_ID,
      version: source.version || 1,
      activeWorkspaceId: source.activeWorkspaceId || '',
      workspaces: Array.isArray(source.workspaces) ? source.workspaces.map(compactLocalWorkspaceDelta).filter(hasLocalWorkspaceDelta) : []
    };
  }

  function compactLocalWorkspaceDelta(workspace = {}) {
    return {
      id: workspace.id || '',
      name: workspace.name || workspace.title || '',
      title: workspace.title || workspace.name || '',
      records: Array.isArray(workspace.records) ? workspace.records.filter(isLocalForCache).map(compactRecordForCache) : [],
      assets: Array.isArray(workspace.assets) ? workspace.assets.filter((asset) => !isSourceBackedForCache(asset)).map(compactAssetForCache) : [],
      workspaceMarkdown: localWorkspaceMarkdownForDelta(workspace),
      workspaceImport: Object.assign({}, workspace.workspaceImport || {}),
      importLog: Array.isArray(workspace.importLog) ? workspace.importLog.slice(0, SESSION_CACHE_LIMITS.maxImportLogEntries).map((item) => Object.assign({}, item)) : []
    };
  }

  function localWorkspaceMarkdownForDelta(workspace = {}) {
    const mode = String(workspace?.workspaceImport?.sourceMode || workspace?.sourceMode || '').trim().toLowerCase();
    const boundary = String(workspace?.workspaceImport?.boundary || workspace?.source?.boundary || '').trim().toLowerCase();
    const localOwned = mode.startsWith('local') || mode.startsWith('manual') || mode.startsWith('package-import') || boundary.includes('browser-local') || workspace?.workspaceImport?.localDraft === true;
    return localOwned ? truncateForCache(workspace.workspaceMarkdown || '', SESSION_CACHE_LIMITS.maxWorkspaceMarkdownChars).value : '';
  }

  function hasLocalWorkspaceDelta(workspace = {}) {
    return Boolean((workspace.records || []).length || (workspace.assets || []).length || workspace.workspaceMarkdown);
  }

  function mergeStateWithLocalDeltas(state = {}, localDeltaState = null) {
    if (!state || !Array.isArray(state.workspaces) || !localDeltaState || !Array.isArray(localDeltaState.workspaces)) return state;
    const localById = new Map(localDeltaState.workspaces.map((workspace) => [workspace.id, workspace]));
    const workspaces = state.workspaces.map((workspace) => mergeWorkspaceLocalDelta(workspace, localById.get(workspace.id)));
    return Object.assign({}, state, { workspaces });
  }

  function mergeWorkspaceLocalDelta(workspace = {}, local = null) {
    if (!local) return workspace;
    const sourceRecords = Array.isArray(workspace.records) ? workspace.records.filter((record) => !isLocalForCache(record)) : [];
    const sourceAssets = Array.isArray(workspace.assets) ? workspace.assets.filter(isSourceBackedForCache) : [];
    const legacyCandidates = Array.isArray(local.workspaceMergeCandidates) ? local.workspaceMergeCandidates : [];
    return Object.assign({}, workspace, {
      records: mergeByIdOrPath(sourceRecords, local.records || []),
      assets: mergeByIdOrPath(sourceAssets, local.assets || []),
      ...(legacyCandidates.length ? { workspaceMergeCandidates: legacyCandidates.slice() } : {}),
      workspaceMarkdown: local.workspaceMarkdown || workspace.workspaceMarkdown || '',
      workspaceImport: Object.assign({}, workspace.workspaceImport || {}, local.workspaceImport || {}),
      importLog: Array.isArray(local.importLog) ? local.importLog : (workspace.importLog || [])
    });
  }

  function mergeByIdOrPath(primary = [], secondary = []) {
    const out = Array.isArray(primary) ? primary.slice() : [];
    const keys = new Set(out.map((item) => `${item?.id || ''}::${item?.path || ''}`));
    for (const item of Array.isArray(secondary) ? secondary : []) {
      const key = `${item?.id || ''}::${item?.path || ''}`;
      if (!keys.has(key)) { out.push(item); keys.add(key); }
    }
    return out;
  }

  function hydrateWorkspaceWithLocalDeltas(state = {}, workspaceId = '', storage = global.localStorage) {
    const localState = readLocalDeltaState(storage);
    if (!localState || !Array.isArray(state.workspaces)) return state;
    const id = String(workspaceId || state.activeWorkspaceId || '').trim();
    const local = localState.workspaces.find((workspace) => workspace.id === id);
    if (!local) return state;
    return Object.assign({}, state, {
      workspaces: state.workspaces.map((workspace) => workspace.id === id ? mergeWorkspaceLocalDelta(workspace, local) : workspace)
    });
  }

  function compactSourceForSessionCache(source = {}, workspace = {}) { return global.TiinexWorkspacePersistenceCache?.compactSourceForSessionCache?.(source, workspace) || Object.assign({}, source || {}); }

  function compactRecordSourceForCache(source = {}) {
    const config = source.config && typeof source.config === 'object' ? source.config : {};
    const out = {
      id: source.id || '',
      kind: source.kind || '',
      adapterId: source.adapterId || '',
      sourceKind: source.sourceKind || '',
      label: source.label || '',
      repo: source.repo || config.repo || '',
      ref: source.ref || config.ref || '',
      requestedRef: source.requestedRef ?? config.requestedRef ?? '',
      materializedCommit: source.materializedCommit || '',
      rootPath: source.rootPath || config.rootPath || '',
      boundary: source.boundary || ''
    };
    if (source.url) out.url = source.url;
    return out;
  }

  function compactRecordForCache(record = {}) {
    const source = compactRecordSourceForCache(record.source || {});
    const markdown = truncateForCache(record.markdown || '', SESSION_CACHE_LIMITS.maxRecordMarkdownChars);
    if (isSourceBackedForCache(record) && !isLocalForCache(record)) {
      return Object.assign({}, record, {
        source,
        markdown: '',
        cacheState: 'source-backed-metadata-only-session-cache',
        materialAvailability: 'material-unavailable'
      });
    }
    return Object.assign({}, record, {
      source,
      markdown: markdown.value,
      cacheState: markdown.omitted ? 'markdown-truncated-for-session-cache' : (record.cacheState || 'session-cache-complete')
    });
  }

  function compactAssetForCache(asset = {}) {
    const source = compactRecordSourceForCache(asset.source || {});
    if (isSourceBackedForCache(asset)) {
      return Object.assign({}, asset, {
        source,
        content: '',
        dataUrl: '',
        previewState: 'metadata-only',
        cacheState: 'source-backed-metadata-only-session-cache',
        materialAvailability: 'material-unavailable'
      });
    }
    const content = truncateForCache(asset.content || '', SESSION_CACHE_LIMITS.maxAssetPreviewChars);
    const dataUrl = truncateForCache(asset.dataUrl || '', SESSION_CACHE_LIMITS.maxAssetPreviewChars);
    return Object.assign({}, asset, {
      source,
      content: content.value,
      dataUrl: dataUrl.value,
      previewState: content.omitted || dataUrl.omitted ? 'omitted-large' : (asset.previewState || 'metadata-only'),
      cacheState: content.omitted || dataUrl.omitted ? 'preview-truncated-for-session-cache' : (asset.cacheState || 'session-cache-complete')
    });
  }

  function isLocalForCache(item = {}) {
    const source = item.source || {};
    const mode = String(item.sourceMode || '').toLowerCase();
    return source.adapterId === 'local' || source.kind === 'local-session' || mode.startsWith('local-') || mode.includes('fixture');
  }

  function isSourceBackedForCache(item = {}) {
    const source = item.source || {};
    const mode = String(item.sourceMode || '').toLowerCase();
    return source.adapterId === 'github' || source.kind === 'github-tree' || source.sourceKind === 'github.repo' || mode === 'source-backed';
  }

  function truncateForCache(value = '', limit = 160000) {
    const text = String(value || '');
    const max = Math.max(0, Number(limit || 0));
    if (!text || !max || text.length <= max) return { value: text, omitted: false };
    return { value: text.slice(0, max), omitted: true };
  }

  function b64UrlEncode(value) {
    const b64 = typeof btoa === 'function'
      ? btoa(value)
      : Buffer.from(value, 'utf8').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function b64UrlDecode(value) {
    const padded = String(value).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(String(value).length / 4) * 4, '=');
    return typeof atob === 'function'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString('utf8');
  }

  global.TiinexWorkspacePersistence = {
    HASH_PREFIX,
    STORAGE_KEY,
    LOCAL_DELTA_KEY,
    LOCAL_RECOVERY_INDEX_KEY,
    LEGACY_STORAGE_KEY,
    clearState,
    decodeState,
    encodeState,
    readHashState,
    resolveInitialState,
    readInitialState,
    createSessionCacheState,
    createLocalDeltaState,
    readLocalDeltaState,
    readLocalRecoveryIndex,
    readRecoverableLocalState,
    augmentStartupStateWithLocalRecovery,
    createLocalRecoveryIndex,
    normalizeLegacyWorkspaceCandidateState,
    hydrateWorkspaceWithLocalDeltas,
    hydrateHashStateFromSessionCache,
    readStoredState,
    writeState,
    writeUrlHash
  };
})(typeof window !== 'undefined' ? window : globalThis);
