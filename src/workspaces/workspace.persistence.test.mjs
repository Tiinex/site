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



const scaleEnv = loadPersistence();
const scaleSource = { id: 'github:tiinex-docs:master:.topics', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics', boundary: 'explicit source boundary' };
const scaleRecords = Array.from({ length: 325 }, (_, index) => ({
  id: `source:${scaleSource.id}:.topics/topic-${index}.md`,
  title: `Topic ${index}`,
  path: `.topics/topic-${index}.md`,
  markdown: `# Continuity Context\n\n- Current\n  - Summary: Topic ${index}\n\n---\n\n# Topic ${index}`,
  sourceMode: 'source-backed',
  source: scaleSource,
  materialRole: 'leaf',
  materialAvailability: 'available',
  hasContinuityContext: true,
  schemaId: 'tiinex.topic.v1'
}));
const scaleScrollKey = `scale-w:lineage::${scaleRecords[200].id}:`;
const scaleState = {
  version: 1,
  activeWorkspaceId: 'scale-w',
  view: { workspaceVerse: 'lineage', query: '', lineageQuery: '', selectedRecordId: scaleRecords[200].id, scrollPositions: { [scaleScrollKey]: 1840 } },
  workspaces: [{ id: 'scale-w', name: 'Scale', sources: [scaleSource], sourceOrder: [scaleSource.id], records: scaleRecords, assets: [], workspaceMergeCandidates: [], importLog: [] }]
};
scaleEnv.persistence.writeState(scaleState, { storage: scaleEnv.env.localStorage, location: scaleEnv.env.location, history: scaleEnv.env.history, mode: 'push' });
const scaleRestored = scaleEnv.persistence.readInitialState({ storage: scaleEnv.env.localStorage, location: scaleEnv.env.location });
if (scaleRestored.workspaces[0].records.length !== 325) throw new Error('scale restore should keep all source-backed record shells');
const restoredScaleRecord = scaleRestored.workspaces[0].records[200];
if (!restoredScaleRecord.markdown.includes('# Topic 200')) throw new Error('scale restore should keep source-backed markdown in same-session cache');
if (restoredScaleRecord.cacheState !== 'source-backed-session-cache-complete') throw new Error('scale restore should disclose complete source-backed session cache state');
if (restoredScaleRecord.materialRole !== 'leaf') throw new Error('scale restore should preserve materialRole across hash restore');
if (restoredScaleRecord.source.requestedSurfaces || restoredScaleRecord.source.surfaces || restoredScaleRecord.source.governanceBoundary || restoredScaleRecord.source.config) throw new Error('session-cache record source shell should stay compact and not repeat source rail metadata');
if (scaleRestored.view.selectedRecordId !== scaleRecords[200].id) throw new Error('scale restore should preserve selected record view state');
if (scaleRestored.view.scrollPositions?.[scaleScrollKey] !== 1840) throw new Error('scale restore should preserve per-view scroll positions');



const routeOverlayEnv = loadPersistence();
const staleSource = { id: 'github:stale', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics', count: 328, repoDiscovery: true, issueDiscovery: false, requestedSurfaces: { repoFiles: { requested: true }, issueSnapshots: { requested: false } } };
const staleState = { version: 1, activeWorkspaceId: 'overlay-w', view: { workspaceVerse: 'feed' }, workspaces: [{ id: 'overlay-w', name: 'Overlay', sources: [staleSource], sourceOrder: [staleSource.id], records: [], assets: [], workspaceMergeCandidates: [], importLog: [] }] };
routeOverlayEnv.persistence.writeState(staleState, { storage: routeOverlayEnv.env.localStorage, location: routeOverlayEnv.env.location, history: routeOverlayEnv.env.history, mode: 'push' });
const routeSource = Object.assign({}, staleSource, { issueDiscovery: true, requestedSurfaces: { repoFiles: { requested: true }, issueSnapshots: { requested: true, attempted: true, loaded: 0 } } });
const routeStateWithRequestedIssue = { v: 2, activeWorkspaceId: 'overlay-w', view: { workspaceVerse: 'feed' }, workspaces: [{ id: 'overlay-w', name: 'Overlay', sources: [routeSource], sourceOrder: [routeSource.id], records: [], assets: [], workspaceMergeCandidates: [], importLog: [] }] };
routeOverlayEnv.env.location.hash = `#state=${routeOverlayEnv.persistence.encodeState(routeStateWithRequestedIssue)}`;
const overlayRestored = routeOverlayEnv.persistence.readInitialState({ storage: routeOverlayEnv.env.localStorage, location: routeOverlayEnv.env.location });
const overlaySource = overlayRestored.workspaces[0].sources[0];
if (overlaySource.issueDiscovery !== true) throw new Error('route shell source request must overlay stale session-cache source on F5/hash restore');
if (overlaySource.requestedSurfaces?.issueSnapshots?.requested !== true) throw new Error('requested issue surface must survive route/cache hydration merge');


persistence.clearState({ storage: env.localStorage, location: env.location, history: env.history, mode: 'push' });
if (persistence.readStoredState(env.localStorage)) throw new Error('clear should remove local storage cache');
if (historyUrls.at(-1)?.[0] !== 'push') throw new Error('closing last workspace should be push-history capable');

console.log('✓ workspace persistence tests passed');
