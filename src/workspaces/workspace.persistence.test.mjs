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
const state = {
  version: 1,
  activeWorkspaceId: 'local-demo',
  view: { workspaceVerse: 'tree', query: 'topic' },
  workspaces: [{
    id: 'local-demo',
    name: 'Demo',
    records: [
      { id: 'r1', title: 'Topic', path: 'topics/topic.md', markdown: '# Topic', sourceMode: 'local-draft', source: { kind: 'local-session', adapterId: 'local' } },
      { id: 'r2', title: 'Remote', path: 'topics/remote.md', markdown: '# Remote should not be cache authority', sourceMode: 'source-backed', source: { kind: 'github-tree', adapterId: 'github', repo: 'Tiinex/docs', ref: 'abcdef' } }
    ],
    assets: [
      { id: 'a1', path: 'assets/icon.svg', name: 'icon.svg', content: '<svg/>', previewState: 'available', source: { kind: 'local-session', adapterId: 'archive' } },
      { id: 'a2', path: 'assets/remote.svg', name: 'remote.svg', content: '<svg>remote</svg>', previewState: 'available', source: { kind: 'github-tree', adapterId: 'github' } }
    ],
    workspaceMergeCandidates: [{ id: 'w1', title: 'Workspace', path: 'demo.workspace.md', markdown: '# Demo workspace' }],
    importLog: [{ kind: 'fixture', at: '2026-07-21T00:00:00.000Z' }]
  }]
};
if (persistence.readInitialState({ storage: env.localStorage, location: env.location }) !== null) throw new Error('clean URL must not restore local storage implicitly');
const hash = persistence.writeState(state, { storage: env.localStorage, location: env.location, history: env.history, mode: 'push' });
if (!hash.startsWith('#state=')) throw new Error('state must be written to hash');
if (historyUrls[0]?.[0] !== 'push') throw new Error('workspace route creation should be push-history capable');
if (env.location.hash !== hash) throw new Error('hash should be history-owned');
if (persistence.readHashState(env.location).activeWorkspaceId !== 'local-demo') throw new Error('hash state should restore active workspace');
const restored = persistence.readInitialState({ storage: env.localStorage, location: env.location });
if (restored.workspaces[0].name !== 'Demo') throw new Error('explicit hash should restore state');
if (restored.workspaces[0].records[0].markdown !== '# Topic') throw new Error('hash reload should hydrate local record markdown from session cache');
if (restored.workspaces[0].records[1].markdown !== '# Remote should not be cache authority') throw new Error('same-session hash reload should keep loaded source-backed markdown for audit continuity');
if (restored.workspaces[0].records[1].cacheState !== 'source-backed-session-cache-complete') throw new Error('loaded source-backed record should disclose same-session cache state');
if (restored.workspaces[0].assets[0].content !== '<svg/>') throw new Error('hash reload should hydrate local assets from session cache');
if (restored.workspaces[0].assets[1].content !== '') throw new Error('hash reload should keep source-backed asset content metadata-only');
if (restored.workspaces[0].workspaceMergeCandidates[0].markdown !== '# Demo workspace') throw new Error('hash reload should hydrate workspace candidates from session cache');
if (persistence.readStoredState(env.localStorage).workspaces[0].records[0].path !== 'topics/topic.md') throw new Error('local storage cache should mirror workspace material');

env.location.hash = '';
if (persistence.readInitialState({ storage: env.localStorage, location: env.location }) !== null) throw new Error('clean URL should ignore stale local storage cache');


const noCacheEnv = loadPersistence();
const routeOnly = noCacheEnv.persistence.encodeState({
  v: 2,
  activeWorkspaceId: 'shared-w',
  view: { workspaceVerse: 'feed', query: '' },
  workspaces: [{
    id: 'shared-w',
    name: 'Shared Workspace',
    sources: [{ id: 'github:shared', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary' }],
    records: [{ id: 'r-remote', title: 'Remote shell', path: 'topics/remote.md', sourceMode: 'source-backed', source: { id: 'github:shared', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary' }, cacheState: 'route-shell-material-unavailable', materialAvailability: 'material-unavailable' }],
    assets: [{ id: 'a-shared', name: 'shared.png', path: 'assets/shared.png', type: 'image/png', size: 10, materialAvailability: 'material-unavailable', cacheState: 'route-shell-material-unavailable' }],
    workspaceMergeCandidates: [{ id: 'wc-shared', title: 'Shared Candidate', path: 'shared.workspace.md', materialAvailability: 'material-unavailable', cacheState: 'route-shell-material-unavailable' }]
  }]
});
noCacheEnv.env.location.hash = `#state=${routeOnly}`;
const noCacheRestored = noCacheEnv.persistence.readInitialState({ storage: noCacheEnv.env.localStorage, location: noCacheEnv.env.location });
const noCacheRecord = noCacheRestored.workspaces[0].records[0];
if (noCacheRecord.source.adapterId !== 'github') throw new Error('hash-only share must preserve source boundary without cache');
if (noCacheRecord.sourceMode !== 'source-backed') throw new Error('hash-only share must preserve source-backed mode without cache');
if (noCacheRecord.cacheState !== 'route-shell-material-unavailable') throw new Error('hash-only share should disclose unavailable material cache state');
if (noCacheRestored.workspaces[0].assets[0].materialAvailability !== 'material-unavailable') throw new Error('route-only assets should disclose unavailable material');
if (noCacheRestored.workspaces[0].workspaceMergeCandidates[0].materialAvailability !== 'material-unavailable') throw new Error('route-only workspace candidates should disclose unavailable material');

persistence.clearState({ storage: env.localStorage, location: env.location, history: env.history, mode: 'push' });
if (persistence.readStoredState(env.localStorage)) throw new Error('clear should remove local storage cache');
if (historyUrls.at(-1)?.[0] !== 'push') throw new Error('closing last workspace should be push-history capable');

console.log('✓ workspace persistence tests passed');
