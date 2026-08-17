(function attachWorkspacePersistenceClear(global) {
  'use strict';

  function clearState(env = {}) {
    const storage = env.storage || global.localStorage;
    const locationLike = env.location || global.location;
    const historyLike = env.history || global.history;
    const mode = env.mode === 'push' ? 'push' : 'replace';
    const keys = env.keys || {};

    removeStorageKey(storage, keys.storage);

    if (env.durableLocalPolicy !== 'preserve-existing') {
      removeStorageKey(storage, keys.localDelta);
      removeStorageKey(storage, keys.localRecoveryIndex);
    }

    removeStorageKey(storage, keys.legacyStorage);

    if (!env.preserveUrl) clearUrl({ locationLike, historyLike, mode });
  }

  function removeStorageKey(storage, key) {
    if (!key) return;
    try {
      storage?.removeItem?.(key);
    } catch (_) {}
  }

  function clearUrl({ locationLike, historyLike, mode = 'replace' } = {}) {
    try {
      const pathname = locationLike?.pathname || '';
      const search = locationLike?.search || '';
      const url = `${pathname}${search}`;
      if (mode === 'push' && historyLike?.pushState) {
        historyLike.pushState({ v: 'empty', workspaces: 0 }, '', url);
      } else {
        historyLike?.replaceState?.({ v: 'empty', workspaces: 0 }, '', url);
      }
      if (!historyLike?.replaceState && locationLike) locationLike.hash = '';
    } catch (_) {}
  }

  global.TiinexWorkspacePersistenceClear = Object.freeze({ clearState });
})(typeof window !== 'undefined' ? window : globalThis);
