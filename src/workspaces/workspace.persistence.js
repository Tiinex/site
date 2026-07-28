(function attachWorkspacePersistence(global) {
  'use strict';

  const STORAGE_KEY = 'tiinex.site.workspaceState.v1';
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
      return JSON.parse(decodeURIComponent(b64UrlDecode(encoded)));
    } catch (_) {
      return null;
    }
  }

  function readStoredState(storage) {
    try {
      const value = storage?.getItem?.(STORAGE_KEY);
      const parsed = value ? JSON.parse(value) : null;
      return unwrapSessionCache(parsed);
    } catch (_) {
      return null;
    }
  }

  function readStoredCacheEnvelope(storage) {
    try {
      const value = storage?.getItem?.(STORAGE_KEY);
      return value ? JSON.parse(value) : null;
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
    const routeState = global.TiinexWorkspaceRoute?.makeRouteState?.(state) || state;
    const sessionCache = createSessionCacheEnvelope(state, routeState);
    const encoded = encodeState(routeState);
    try { storage?.setItem?.(STORAGE_KEY, JSON.stringify(sessionCache)); } catch (_) {
      try { storage?.setItem?.(STORAGE_KEY, JSON.stringify({ schema: SESSION_CACHE_SCHEMA_ID, degraded: true, state: routeState, routeSummary: global.TiinexWorkspaceRoute?.routeSummary?.(routeState) || {} })); } catch (__) {}
    }
    const nextHash = `${HASH_PREFIX}${encoded}`;
    const mode = env.mode === 'push' ? 'push' : 'replace';
    writeUrlHash(nextHash, { mode, locationLike, historyLike, historyState: routeHistoryState(routeState, env.historyIndex) });
    return nextHash;
  }

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

  function routeHistoryState(routeState, explicitIndex) {
    const index = Number.isFinite(Number(explicitIndex)) ? Number(explicitIndex) : Date.now();
    return Object.assign({}, global.TiinexWorkspaceRoute?.routeSummary?.(routeState) || {}, { __tiinexRouteIndex: index });
  }

  function readInitialState(env = {}) {
    const hashState = readHashState(env.location || global.location);
    if (!hashState) return null;
    return hydrateHashStateFromSessionCache(hashState, readStoredCacheEnvelope(env.storage || global.localStorage));
  }

  function clearState(env = {}) {
    const storage = env.storage || global.localStorage;
    const locationLike = env.location || global.location;
    const historyLike = env.history || global.history;
    const mode = env.mode === 'push' ? 'push' : 'replace';
    try { storage?.removeItem?.(STORAGE_KEY); } catch (_) {}
    try {
      const pathname = locationLike?.pathname || '';
      const search = locationLike?.search || '';
      const url = `${pathname}${search}`;
      if (mode === 'push' && historyLike?.pushState) historyLike.pushState({ v: 'empty', workspaces: 0 }, '', url);
      else historyLike?.replaceState?.({ v: 'empty', workspaces: 0 }, '', url);
      if (!historyLike?.replaceState && locationLike) locationLike.hash = '';
    } catch (_) {}
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
      view: Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all' } }, source.view || {}),
      audit: source.audit || null,
      workspaces: Array.isArray(source.workspaces) ? source.workspaces.map(compactWorkspaceForCache) : []
    };
  }

  function unwrapSessionCache(value) {
    if (!value || typeof value !== 'object') return null;
    if (value.schema === SESSION_CACHE_SCHEMA_ID && value.state && typeof value.state === 'object') return value.state;
    if (value.schema === SESSION_CACHE_SCHEMA_ID) return value;
    if (Array.isArray(value.workspaces)) return value;
    return null;
  }

  function hydrateHashStateFromSessionCache(routeState, storedEnvelope) {
    const route = routeState && typeof routeState === 'object' ? routeState : null;
    if (!route || !Array.isArray(route.workspaces) || !route.workspaces.length) return routeState || null;
    const cached = unwrapSessionCache(storedEnvelope);
    if (!cached || !Array.isArray(cached.workspaces) || !cached.workspaces.length) return route;
    const cachedById = new Map(cached.workspaces.map((workspace) => [workspace.id, workspace]));
    const hydratedWorkspaces = route.workspaces.map((workspace) => {
      const cachedWorkspace = cachedById.get(workspace.id);
      return cachedWorkspace ? mergeWorkspaceRouteShell(workspace, cachedWorkspace) : workspace;
    });
    return Object.assign({}, route, {
      view: Object.assign({}, cached.view || {}, route.view || {}),
      audit: cached.audit || route.audit || null,
      workspaces: hydratedWorkspaces,
      activeWorkspaceId: route.activeWorkspaceId || cached.activeWorkspaceId || hydratedWorkspaces[0]?.id || ''
    });
  }

  function mergeWorkspaceRouteShell(routeWorkspace = {}, cachedWorkspace = {}) {
    return Object.assign({}, cachedWorkspace, routeWorkspace, {
      source: Object.assign({}, cachedWorkspace.source || {}, routeWorkspace.source || {}),
      sources: mergeSourceShells(routeWorkspace.sources || [], cachedWorkspace.sources || []),
      sourceOrder: Array.isArray(cachedWorkspace.sourceOrder) && cachedWorkspace.sourceOrder.length ? cachedWorkspace.sourceOrder : (routeWorkspace.sourceOrder || []),
      records: Array.isArray(cachedWorkspace.records) ? cachedWorkspace.records : (routeWorkspace.records || []),
      assets: Array.isArray(cachedWorkspace.assets) ? cachedWorkspace.assets : [],
      workspaceMergeCandidates: Array.isArray(cachedWorkspace.workspaceMergeCandidates) ? cachedWorkspace.workspaceMergeCandidates : [],
      importLog: Array.isArray(cachedWorkspace.importLog) ? cachedWorkspace.importLog : [],
      workspaceMarkdown: cachedWorkspace.workspaceMarkdown || routeWorkspace.workspaceMarkdown || '',
      workspaceImport: Object.assign({}, cachedWorkspace.workspaceImport || {}, routeWorkspace.workspaceImport || {})
    });
  }

  function mergeSourceShells(routeSources = [], cachedSources = []) {
    const out = new Map();
    for (const source of Array.isArray(cachedSources) ? cachedSources : []) {
      if (source?.id) out.set(source.id, Object.assign({}, source));
    }
    for (const source of Array.isArray(routeSources) ? routeSources : []) {
      if (!source?.id) continue;
      out.set(source.id, Object.assign({}, out.get(source.id) || {}, source));
    }
    return Array.from(out.values());
  }


  function compactWorkspaceForCache(workspace = {}) {
    return Object.assign({}, workspace, {
      source: Object.assign({}, workspace.source || {}),
      sources: Array.isArray(workspace.sources) ? workspace.sources.map((source) => compactSourceForSessionCache(source, workspace)) : [],
      sourceOrder: Array.isArray(workspace.sourceOrder) ? workspace.sourceOrder.slice() : [],
      records: Array.isArray(workspace.records) ? workspace.records.map(compactRecordForCache) : [],
      assets: Array.isArray(workspace.assets) ? workspace.assets.map(compactAssetForCache) : [],
      workspaceMergeCandidates: Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates.map(compactWorkspaceCandidateForCache) : [],
      importLog: Array.isArray(workspace.importLog) ? workspace.importLog.slice(0, SESSION_CACHE_LIMITS.maxImportLogEntries).map((item) => Object.assign({}, item)) : [],
      workspaceMarkdown: truncateForCache(workspace.workspaceMarkdown || '', SESSION_CACHE_LIMITS.maxWorkspaceMarkdownChars).value,
      workspaceImport: Object.assign({}, workspace.workspaceImport || {})
    });
  }

  function compactSourceForSessionCache(source = {}, workspace = {}) {
    const next = Object.assign({}, source || {});
    next.surfaces = cacheSurfaceMapForSource(source, workspace);
    delete next.transportOutcome;
    delete next.transportPlan;
    delete next.transportTiers;
    next.transportRefreshTier = '';
    return next;
  }

  function cacheSurfaceMapForSource(source = {}, workspace = {}) {
    const sourceId = String(source.id || '').trim();
    const base = source.surfaces && typeof source.surfaces === 'object' ? JSON.parse(JSON.stringify(source.surfaces)) : {};
    const records = Array.isArray(workspace.records) ? workspace.records : [];
    const counts = {};
    for (const record of records) {
      if (sourceId && String(record?.source?.id || '') !== sourceId) continue;
      const surface = String(record?.sourceTarget?.surface || '').trim();
      if (!surface) continue;
      counts[surface] ||= { loaded: 0, records: [] };
      counts[surface].loaded += 1;
      if (record.id) counts[surface].records.push(record.id);
    }
    for (const [surface, count] of Object.entries(counts)) {
      base[surface] = Object.assign({}, base[surface] || {}, {
        requested: true, attempted: true, loaded: count.loaded, records: count.records,
        transportTier: 'cache', transportTiers: ['cache'], pendingTier: '', transportRefreshTier: ''
      });
    }
    for (const value of Object.values(base)) {
      if (!value || typeof value !== 'object') continue;
      delete value.pendingTier;
      value.transportRefreshTier = '';
      if (value.loaded && !value.transportTier) value.transportTier = 'cache';
      if (value.loaded && !Array.isArray(value.transportTiers)) value.transportTiers = ['cache'];
    }
    return base;
  }

  function compactRecordForCache(record = {}) {
    const source = Object.assign({}, record.source || {});
    const markdown = truncateForCache(record.markdown || '', SESSION_CACHE_LIMITS.maxRecordMarkdownChars);
    if (isSourceBackedForCache(record) && !isLocalForCache(record)) {
      return Object.assign({}, record, {
        source,
        markdown: markdown.value,
        cacheState: markdown.omitted ? 'source-backed-markdown-truncated-for-session-cache' : (record.markdown ? 'source-backed-session-cache-complete' : (record.cacheState || 'source-backed-metadata-only-session-cache'))
      });
    }
    return Object.assign({}, record, {
      source,
      markdown: markdown.value,
      cacheState: markdown.omitted ? 'markdown-truncated-for-session-cache' : (record.cacheState || 'session-cache-complete')
    });
  }

  function compactAssetForCache(asset = {}) {
    const source = Object.assign({}, asset.source || {});
    if (isSourceBackedForCache(asset)) {
      return Object.assign({}, asset, {
        source,
        content: '',
        dataUrl: '',
        previewState: asset.previewState || 'metadata-only',
        cacheState: 'source-backed-metadata-only-session-cache'
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

  function compactWorkspaceCandidateForCache(candidate = {}) {
    const markdown = truncateForCache(candidate.markdown || '', SESSION_CACHE_LIMITS.maxWorkspaceMarkdownChars);
    return Object.assign({}, candidate, {
      markdown: markdown.value,
      cacheState: markdown.omitted ? 'markdown-truncated-for-session-cache' : (candidate.cacheState || 'session-cache-complete')
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
    clearState,
    decodeState,
    encodeState,
    readHashState,
    readInitialState,
    createSessionCacheState,
    hydrateHashStateFromSessionCache,
    readStoredState,
    writeState,
    writeUrlHash
  };
})(typeof window !== 'undefined' ? window : globalThis);
