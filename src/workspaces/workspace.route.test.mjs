import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, globalThis: {} };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('../sources/source.identity.js', import.meta.url), 'utf8'), sandbox);
vm.runInContext(readFileSync(new URL('./workspace.lifecycle.js', import.meta.url), 'utf8'), sandbox);
vm.runInContext(readFileSync(new URL('./workspace.route.js', import.meta.url), 'utf8'), sandbox);
const lifecycle = sandbox.window.TiinexWorkspaceLifecycle;
const route = sandbox.window.TiinexWorkspaceRoute;

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Route Test' }, { clock: () => '2026-07-19T22:00:00.000Z' }).state;
created.view.workspaceVerse = 'audit';
created.view.query = 'schema';
const routeState = route.makeRouteState(created);
if (routeState.v !== 2) throw new Error('route state version should be explicit');
if (routeState.workspaces[0].records.length !== 0) throw new Error('empty workspace route should preserve empty records');
if (route.routeSummary(routeState).workspaceVerse !== 'audit') throw new Error('route summary should include active verse');
const normalized = route.normalizeRouteState(routeState, lifecycle);
if (normalized.activeWorkspaceId !== created.activeWorkspaceId) throw new Error('normalized route should keep active workspace');
if (normalized.view.query !== 'schema') throw new Error('normalized route should keep query');
const empty = route.normalizeRouteState({ v: 2, workspaces: [] }, lifecycle);
if (empty.workspaces.length !== 0 || empty.activeWorkspaceId) throw new Error('empty route should normalize to empty app state');

const stateWithSourceRecord = {
  version: 1,
  activeWorkspaceId: 'w-route-source',
  view: { workspaceVerse: 'feed', query: '' },
  workspaces: [{
    id: 'w-route-source',
    name: 'Route Source',
    sources: [{ id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary' }],
    sourceOrder: ['github:tiinex-docs'],
    records: [{
      id: 'source:github:tiinex-docs:topics/source.md',
      title: 'Source backed shell',
      summary: 'Route shell only',
      path: 'topics/source.md',
      sourceMode: 'source-backed',
      source: { id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary' }
    }]
  }]
};
const sourceRoute = route.makeRouteState(stateWithSourceRecord);
const sourceRecordShell = sourceRoute.workspaces[0].records[0];
if (sourceRecordShell.source.adapterId !== 'github') throw new Error('route shell must preserve source adapter');
if (sourceRecordShell.sourceMode !== 'source-backed') throw new Error('route shell must preserve source mode');
if (sourceRecordShell.path !== 'topics/source.md') throw new Error('route shell must preserve path');
const normalizedSourceRoute = route.normalizeRouteState(sourceRoute, lifecycle);
const normalizedRecord = normalizedSourceRoute.workspaces[0].records[0];
if (normalizedRecord.source.adapterId !== 'github') throw new Error('normalized route must not turn source-backed record local');
if (normalizedRecord.materialAvailability !== 'material-unavailable') throw new Error('route-only record should disclose unavailable material');
if (normalizedRecord.cacheState !== 'route-shell-material-unavailable') throw new Error('route-only record should disclose route-shell cache state');


const stateWithRouteMaterial = {
  version: 1,
  activeWorkspaceId: 'w-route-material',
  view: { workspaceVerse: 'tree', query: '' },
  workspaces: [{
    id: 'w-route-material',
    name: 'Route Material',
    assets: [{ id: 'asset-1', name: 'diagram.png', path: 'assets/diagram.png', type: 'image/png', size: 128, content: 'binary', dataUrl: 'data:image/png;base64,abc', source: { kind: 'local-session', adapterId: 'local' } }],
    workspaceMergeCandidates: [{ id: 'candidate-1', title: 'Workspace Candidate', path: 'workspaces/demo.workspace.md', markdown: '# Workspace Candidate', source: { kind: 'local-session', adapterId: 'local' } }],
    importLog: [{ kind: 'archive', at: '2026-07-21T00:00:00.000Z', ok: true, message: 'Imported fixture.', counts: { records: 1, assets: 1 } }],
    records: []
  }]
};
const materialRoute = route.makeRouteState(stateWithRouteMaterial);
if (materialRoute.workspaces[0].assets.length !== 1) throw new Error('route state must preserve asset shells');
if (materialRoute.workspaces[0].assets[0].content) throw new Error('route asset shell must not include asset content');
if (materialRoute.workspaces[0].assets[0].path !== 'assets/diagram.png') throw new Error('route asset shell must preserve path');
if (materialRoute.workspaces[0].workspaceMergeCandidates.length !== 1) throw new Error('route state must preserve workspace candidate shells');
if (materialRoute.workspaces[0].workspaceMergeCandidates[0].markdown) throw new Error('route workspace candidate shell must not include markdown');
if (materialRoute.workspaces[0].importLog[0].counts.assets !== 1) throw new Error('route import log should preserve bounded counts');
const normalizedMaterialRoute = route.normalizeRouteState(materialRoute, lifecycle);
const normalizedAsset = normalizedMaterialRoute.workspaces[0].assets[0];
if (normalizedAsset.materialAvailability !== 'material-unavailable') throw new Error('route-only asset should disclose unavailable material');
if (normalizedAsset.cacheState !== 'route-shell-material-unavailable') throw new Error('route-only asset should disclose route-shell cache state');
const normalizedCandidate = normalizedMaterialRoute.workspaces[0].workspaceMergeCandidates[0];
if (normalizedCandidate.materialAvailability !== 'material-unavailable') throw new Error('route-only workspace candidate should disclose unavailable material');
if (normalizedCandidate.markdown !== '') throw new Error('route-only workspace candidate should not invent markdown');

console.log('✓ workspace route tests passed');
