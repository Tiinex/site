import { readFileSync } from 'node:fs';
import vm from 'node:vm';

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
      location: { pathname: '/index.html', search: '', hash: '' },
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
  vm.runInContext(readFileSync(new URL('./workspace.persistence.js', import.meta.url), 'utf8'), sandbox);
  return { persistence: sandbox.window.TiinexWorkspacePersistence, env: sandbox.window, historyUrls };
}

const { persistence, env, historyUrls } = loadPersistence();
const state = { version: 1, activeWorkspaceId: 'local-demo', view: { workspaceVerse: 'feed' }, workspaces: [{ id: 'local-demo', name: 'Demo' }] };
if (persistence.readInitialState({ storage: env.localStorage, location: env.location }) !== null) throw new Error('clean URL must not restore local storage implicitly');
const hash = persistence.writeState(state, { storage: env.localStorage, location: env.location, history: env.history, mode: 'push' });
if (!hash.startsWith('#state=')) throw new Error('state must be written to hash');
if (historyUrls[0]?.[0] !== 'push') throw new Error('workspace route creation should be push-history capable');
if (env.location.hash !== hash) throw new Error('hash should be history-owned');
if (persistence.readHashState(env.location).activeWorkspaceId !== 'local-demo') throw new Error('hash state should restore active workspace');
if (persistence.readInitialState({ storage: env.localStorage, location: env.location }).workspaces[0].name !== 'Demo') throw new Error('explicit hash should restore state');
if (persistence.readStoredState(env.localStorage).workspaces[0].name !== 'Demo') throw new Error('local storage cache should mirror workspace');

env.location.hash = '';
if (persistence.readInitialState({ storage: env.localStorage, location: env.location }) !== null) throw new Error('clean URL should ignore stale local storage cache');

persistence.clearState({ storage: env.localStorage, location: env.location, history: env.history, mode: 'push' });
if (persistence.readStoredState(env.localStorage)) throw new Error('clear should remove local storage cache');
if (historyUrls.at(-1)?.[0] !== 'push') throw new Error('closing last workspace should be push-history capable');

console.log('✓ workspace persistence tests passed');
