(function attachWorkspacePersistence(global) {
  'use strict';

  const STORAGE_KEY = 'tiinex.site.workspaceState.v1';
  const HASH_PREFIX = '#state=';

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
    const encoded = encodeState(routeState);
    try { storage?.setItem?.(STORAGE_KEY, JSON.stringify(routeState)); } catch (_) {}
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
    if (hashState) return hashState;
    return null;
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
    readStoredState,
    writeState,
    writeUrlHash
  };
})(typeof window !== 'undefined' ? window : globalThis);
