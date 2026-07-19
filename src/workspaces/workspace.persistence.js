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
    const encoded = encodeState(state);
    try { storage?.setItem?.(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
    const nextHash = `${HASH_PREFIX}${encoded}`;
    try {
      const pathname = locationLike?.pathname || '';
      const search = locationLike?.search || '';
      historyLike?.replaceState?.(null, '', `${pathname}${search}${nextHash}`);
      if (!historyLike?.replaceState && locationLike) locationLike.hash = nextHash;
    } catch (_) {}
    return nextHash;
  }

  function readInitialState(env = {}) {
    return readHashState(env.location || global.location) || readStoredState(env.storage || global.localStorage) || null;
  }

  function clearState(env = {}) {
    const storage = env.storage || global.localStorage;
    const locationLike = env.location || global.location;
    const historyLike = env.history || global.history;
    try { storage?.removeItem?.(STORAGE_KEY); } catch (_) {}
    try {
      const pathname = locationLike?.pathname || '';
      const search = locationLike?.search || '';
      historyLike?.replaceState?.(null, '', `${pathname}${search}`);
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
    writeState
  };
})(typeof window !== 'undefined' ? window : globalThis);
