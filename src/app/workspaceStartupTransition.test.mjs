import assert from 'node:assert/strict';
import { runWorkspaceStartupTransition } from './workspaceStartupTransition.js';

const lifecycle = { createWorkspace(state, input = {}) { const workspace = { id: 'home', name: input.name || 'Home', records: [], assets: [], sources: [], sourceOrder: [] }; return { ok: true, workspace, state: { ...state, activeWorkspaceId: workspace.id, workspaces: [workspace] } }; } };
let commits = [];
const result = await runWorkspaceStartupTransition({
  runtimeApi: { lifecycle, persistence: { augmentStartupStateWithLocalRecovery: (state) => state }, config: { parseWorkspaceConfig: () => ({ workspaceEntrypoints: [] }) } },
  emptyState: { workspaces: [] },
  workspaceConfig: { viewerIdentity: { browserTitle: 'Tiinex docs' }, workspaceEntrypoints: [{ sourceKind: 'github-tree', repository: 'Tiinex/docs', rootPath: '.topics' }] },
  locationLike: { href: 'https://example.test/', search: '' }, windowObj: {},
  resolveStartupInput: async () => ({ ok: false, startupClass: 'unresolved' }),
  commit: (state, mode) => commits.push({ state, mode }), mode: 'push'
});
assert.equal(result.ok, true);
assert.equal(commits.length, 1);
assert.equal(commits[0].mode, 'push', 'Home/start transition preserves requested history semantics');
assert(commits[0].state.workspaces.length, 'Home/clean route resolves startup ownership instead of committing blank state');
console.log('✓ workspace startup transition tests passed');
