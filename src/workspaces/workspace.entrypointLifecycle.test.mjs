import assert from 'node:assert/strict';
import './workspace.lifecycle.js';
import { mergeWorkspaceEntrypointSet, openWorkspaceEntrypointSet } from './workspace.entrypointLifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const sourceInputs = [
  { repository: 'Tiinex/site', rootPath: '.topics/news', label: 'News', repoDiscovery: true },
  { repository: 'Tiinex/docs', rootPath: '.topics/documentation', label: 'Documentation', repoDiscovery: true }
];

let state = lifecycle.makeEmptyAppState();
let source = lifecycle.createWorkspace(state, { name: 'Origin' });
state = source.state;
const local = lifecycle.createWorkspace(state, { name: 'Local draft' });
state = local.state;
const localRecord = lifecycle.addWorkspaceRecords(state, local.workspace.id, [{ id: 'local:draft', title: 'Draft', path: 'draft.md', markdown: '# draft', sourceMode: 'local-draft', source: { id: 'local', adapterId: 'local', kind: 'local-session' } }]);
state = localRecord.state;
state.activeWorkspaceId = source.workspace.id;

const opened = openWorkspaceEntrypointSet({ lifecycle, state, sourceInputs });
assert.equal(opened.ok, true);
assert.deepEqual(opened.workspaces.map((workspace) => workspace.title), ['News', 'Documentation'], 'Open creates the declared workspace set in order');
assert.equal(opened.state.workspaces.some((workspace) => workspace.id === source.workspace.id), false, 'Open closes prior non-draft/source workspace');
assert.equal(opened.state.workspaces.some((workspace) => workspace.id === local.workspace.id), true, 'Open preserves durable local workspace');
assert.equal(opened.state.activeWorkspaceId, opened.workspaces[0].id, 'Open focuses first workspace in declared set');
assert.deepEqual(opened.sourceInputs.map((input) => input.label), ['News', 'Documentation']);

const merged = mergeWorkspaceEntrypointSet({ lifecycle, state: opened.state, sourceInputs });
assert.equal(merged.ok, true);
assert.equal(merged.state.workspaces.filter((workspace) => ['News', 'Documentation'].includes(workspace.title)).length, 2, 'Merge upserts declared workspaces without duplicates');
assert.equal(merged.state.activeWorkspaceId, opened.state.activeWorkspaceId, 'Merge retains current workspace focus');
assert.equal(merged.merge.createdCount, 0, 'Merge reuses matching workspaces');

console.log('✓ workspace entrypoint lifecycle tests passed');
