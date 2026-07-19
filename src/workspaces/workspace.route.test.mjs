import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {}, globalThis: {} };
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('./workspace.lifecycle.js', import.meta.url), 'utf8'), sandbox);
vm.runInContext(readFileSync(new URL('./workspace.route.js', import.meta.url), 'utf8'), sandbox);
const lifecycle = sandbox.window.TiinexWorkspaceLifecycle;
const route = sandbox.window.TiinexWorkspaceRoute;

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Route Test' }, { clock: () => '2026-07-19T22:00:00.000Z' }).state;
created.view.workspaceVerse = 'tree';
created.view.query = 'schema';
const routeState = route.makeRouteState(created);
if (routeState.v !== 2) throw new Error('route state version should be explicit');
if (routeState.workspaces[0].records.length !== 0) throw new Error('empty workspace route should preserve empty records');
if (route.routeSummary(routeState).workspaceVerse !== 'tree') throw new Error('route summary should include active verse');
const normalized = route.normalizeRouteState(routeState, lifecycle);
if (normalized.activeWorkspaceId !== created.activeWorkspaceId) throw new Error('normalized route should keep active workspace');
if (normalized.view.query !== 'schema') throw new Error('normalized route should keep query');
const empty = route.normalizeRouteState({ v: 2, workspaces: [] }, lifecycle);
if (empty.workspaces.length !== 0 || empty.activeWorkspaceId) throw new Error('empty route should normalize to empty app state');
console.log('✓ workspace route tests passed');
