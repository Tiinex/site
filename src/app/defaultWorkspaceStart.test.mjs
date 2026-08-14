import assert from 'node:assert/strict';
import '../workspaces/workspace.config.js';
import { DEFAULT_WORKSPACE_START_CONFIG_URL, defaultWorkspaceStartPlan, stateWithDefaultWorkspaceStartProgress } from './defaultWorkspaceStart.js';

const config = globalThis.TiinexWorkspaceConfig.createDefaultWorkspaceConfig();
const plan = defaultWorkspaceStartPlan(config);

assert.equal(plan.ok, true, plan.message);
assert.equal(plan.input.appConfigSourceUrl, DEFAULT_WORKSPACE_START_CONFIG_URL);
assert.equal(plan.input.bootstrapStartState, 'default-workspace-config');
assert.equal(plan.input.bootstrapBoundary, 'explicit-default-config-path');
assert.equal(plan.input.repository, 'Tiinex/docs');
assert.equal(plan.input.rootPath, '.topics');
assert.equal(plan.input.repoDiscovery, true);
assert.equal(plan.selectedPlan, 'workspace-entrypoints', 'PoC startup applies Workspace Entrypoints as the initial workspace set');
assert.equal(plan.input.issueDiscovery, true, 'default entrypoint preserves its configured issue discovery surface');
assert.equal(plan.input.workspaceMatch, '', 'Workspace Discovery chooser is not the initial workspace owner when entrypoints exist');
assert.equal(plan.input.preserveView, false);
assert.equal(plan.input.preferredDisplay, '');
assert.match(plan.workspaceName, /Tiinex docs/i);



const stateWithShell = {
  activeWorkspaceId: 'ws-default',
  workspaces: [{ id: 'ws-default', title: 'Tiinex docs', sources: [], records: [] }]
};
const queued = stateWithDefaultWorkspaceStartProgress(stateWithShell, 'ws-default', plan);
assert.equal(queued.activeWorkspaceId, 'ws-default');
assert.equal(queued.workspaces[0].discoveryProgress.phase, 'default-workspace-bootstrap');
assert.equal(queued.workspaces[0].discoveryProgress.active, true, 'default start must make the clean shell visibly loading before source materialization finishes');
assert.equal(queued.workspaces[0].workspaceBootstrap.boundary, 'explicit-default-config-path');
assert.equal(queued.workspaces[0].workspaceBootstrap.usefulStartPath, 'explicit-source-materialization-queued');
assert.equal(stateWithShell.workspaces[0].discoveryProgress, undefined, 'progress helper must not mutate input state');

const empty = defaultWorkspaceStartPlan({ workspaceEntrypoints: [], workspaceDiscovery: [], viewerIdentity: { browserTitle: 'Empty' } });
assert.equal(empty.ok, false, 'empty config must not invent a default GitHub source');

console.log('✓ default workspace start plan tests passed');
