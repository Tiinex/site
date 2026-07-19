import { readFileSync } from 'node:fs';
import vm from 'node:vm';

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
      history: { replaceState: (_a, _b, url) => { sandbox.window.location.hash = url.includes('#') ? `#${url.split('#').pop()}` : ''; } }
    },
    globalThis: {}
  };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.persistence.js', import.meta.url), 'utf8'), sandbox);
  return { persistence: sandbox.window.TiinexWorkspacePersistence, env: sandbox.window };
}

const { persistence, env } = loadPersistence();
const state = { version: 1, activeWorkspaceId: 'local-demo', view: { workspaceVerse: 'feed' }, workspaces: [{ id: 'local-demo', name: 'Demo' }] };
const hash = persistence.writeState(state, { storage: env.localStorage, location: env.location, history: env.history });
if (!hash.startsWith('#state=')) throw new Error('state must be written to hash');
if (env.location.hash !== hash) throw new Error('hash should be replaceState-owned');
if (persistence.readHashState(env.location).activeWorkspaceId !== 'local-demo') throw new Error('hash state should restore active workspace');
if (persistence.readStoredState(env.localStorage).workspaces[0].name !== 'Demo') throw new Error('local storage cache should restore workspace');

persistence.clearState({ storage: env.localStorage, location: env.location, history: env.history });
if (persistence.readStoredState(env.localStorage)) throw new Error('clear should remove local storage cache');

console.log('✓ workspace persistence tests passed');
