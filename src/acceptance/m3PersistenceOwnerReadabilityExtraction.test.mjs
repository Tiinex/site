import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const persistenceUrl = new URL('../workspaces/workspace.persistence.js', import.meta.url);
const clearUrl = new URL('../workspaces/workspace.persistenceClear.js', import.meta.url);
const persistenceSource = readFileSync(persistenceUrl, 'utf8');
const clearSource = readFileSync(clearUrl, 'utf8');
const mainSource = readFileSync(new URL('../main.jsx', import.meta.url), 'utf8');

assert(statSync(persistenceUrl).size < 24_000, 'canonical persistence owner remains under the unchanged source-size guard');
assert(clearSource.includes('function clearState(env = {})'), 'clear/storage policy has an explicit readable owner');
assert(clearSource.includes("env.durableLocalPolicy !== 'preserve-existing'"), 'durable-local preservation policy is readable in the clear owner');
assert(clearSource.includes('if (!env.preserveUrl) clearUrl'), 'route URL preservation policy is readable in the clear owner');
assert(!persistenceSource.includes("if(env.durableLocalPolicy!==\'preserve-existing\')"), 'persistence source must not minify the ownership policy to satisfy shape metrics');
assert(mainSource.indexOf("./workspaces/workspace.persistenceClear.js") < mainSource.indexOf("./workspaces/workspace.persistence.js"), 'clear owner loads before the persistence facade');

function loadPersistence() {
  const storageMap = new Map();
  const historyUrls = [];
  const sandbox = {
    Buffer,
    window: {
      localStorage: {
        getItem: (key) => storageMap.get(key) || null,
        setItem: (key, value) => storageMap.set(key, String(value)),
        removeItem: (key) => storageMap.delete(key)
      },
      location: { pathname: '/', search: '', hash: '#public-target' },
      history: {
        replaceState: (_a, _b, url) => { historyUrls.push(['replace', url]); sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; },
        pushState: (_a, _b, url) => { historyUrls.push(['push', url]); sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; }
      }
    },
    globalThis: {}
  };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const file of [
    'workspace.route.js',
    'workspace.persistenceRecovery.js',
    'workspace.persistenceRouteCache.js',
    'workspace.persistencePresentation.js',
    'workspace.persistenceClear.js',
    'workspace.persistence.js'
  ]) vm.runInContext(readFileSync(new URL(`../workspaces/${file}`, import.meta.url), 'utf8'), sandbox);
  return { persistence: sandbox.window.TiinexWorkspacePersistence, env: sandbox.window, storageMap, historyUrls };
}

const preserved = loadPersistence();
preserved.storageMap.set(preserved.persistence.STORAGE_KEY, 'route-cache');
preserved.storageMap.set(preserved.persistence.LOCAL_DELTA_KEY, 'durable-local');
preserved.storageMap.set(preserved.persistence.LOCAL_RECOVERY_INDEX_KEY, 'recovery-index');
preserved.storageMap.set(preserved.persistence.LEGACY_STORAGE_KEY, 'legacy-cache');
preserved.persistence.clearState({
  storage: preserved.env.localStorage,
  location: preserved.env.location,
  history: preserved.env.history,
  durableLocalPolicy: 'preserve-existing',
  preserveUrl: true
});
assert.equal(preserved.storageMap.has(preserved.persistence.STORAGE_KEY), false, 'public/session route cache may clear');
assert.equal(preserved.storageMap.get(preserved.persistence.LOCAL_DELTA_KEY), 'durable-local', 'hidden durable local snapshot survives extracted clear owner');
assert.equal(preserved.storageMap.get(preserved.persistence.LOCAL_RECOVERY_INDEX_KEY), 'recovery-index', 'hidden recovery index survives extracted clear owner');
assert.equal(preserved.storageMap.has(preserved.persistence.LEGACY_STORAGE_KEY), false, 'legacy route cache may clear');
assert.equal(preserved.env.location.hash, '#public-target', 'public route URL remains owned while preserveUrl is active');

const destructive = loadPersistence();
destructive.storageMap.set(destructive.persistence.STORAGE_KEY, 'route-cache');
destructive.storageMap.set(destructive.persistence.LOCAL_DELTA_KEY, 'durable-local');
destructive.storageMap.set(destructive.persistence.LOCAL_RECOVERY_INDEX_KEY, 'recovery-index');
destructive.storageMap.set(destructive.persistence.LEGACY_STORAGE_KEY, 'legacy-cache');
destructive.persistence.clearState({ storage: destructive.env.localStorage, location: destructive.env.location, history: destructive.env.history });
assert.equal(destructive.storageMap.size, 0, 'ordinary explicit clear remains destructive outside preservation ownership');
assert.equal(destructive.env.location.hash, '', 'ordinary explicit clear still clears the route URL');

console.log('✓ M3 persistence owner readability extraction tests passed');
