import assert from 'node:assert/strict';
import '../workspaces/workspace.config.js';
await import('../workspaces/workspace.lifecycle.js');
import { prepareDefaultWorkspaceStartCommand } from './defaultWorkspaceStartCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const workspaceConfig = globalThis.TiinexWorkspaceConfig.createDefaultWorkspaceConfig();
const localDeltaState = { schema: 'tiinex.workspace.localDeltas.v1', workspaces: [] };
const persistence = {
  hydrateWorkspaceWithLocalDeltas(state, workspaceId, storage) {
    assert.equal(workspaceId, 'workspace:embedded-default:tiinex-docs');
    assert.equal(storage, localDeltaState);
    return state;
  }
};
const prepared = prepareDefaultWorkspaceStartCommand({ lifecycle, persistence, state: lifecycle.makeEmptyAppState(), workspaceConfig, storage: localDeltaState });
assert.equal(prepared.ok, true, prepared.message);
assert.equal(prepared.workspace.id, 'workspace:embedded-default:tiinex-docs');
assert.equal(prepared.state.activeWorkspaceId, prepared.workspace.id);
assert.equal(prepared.state.workspaces[0].discoveryProgress.phase, 'default-workspace-bootstrap');
assert.equal(prepared.sourceInput.repository, 'Tiinex/docs');
assert.equal(prepared.diagnostics.selectedConvention, 'embedded-default-workspace');
assert.equal(Object.prototype.hasOwnProperty.call(prepared.state.workspaces[0], 'workspaceMergeCandidates'), false, 'bootstrap must not create the legacy candidate runtime shape');



const multiConfig = globalThis.TiinexWorkspaceConfig.createDefaultWorkspaceConfig();
multiConfig.workspaceEntrypoints = [
  { name: 'News', sourceKind: 'github-tree', repository: 'Tiinex/news', ref: 'main', rootPath: '.topics', openOnApply: 'on' },
  { name: 'Documentation', sourceKind: 'github-tree', repository: 'Tiinex/docs', ref: 'master', rootPath: '.topics', openOnApply: 'on' }
];
const hydratedIds = [];
const multiPersistence = {
  hydrateWorkspaceWithLocalDeltas(state, workspaceId) {
    hydratedIds.push(workspaceId);
    return state;
  }
};
const multiPrepared = prepareDefaultWorkspaceStartCommand({ lifecycle, persistence: multiPersistence, state: lifecycle.makeEmptyAppState(), workspaceConfig: multiConfig, storage: localDeltaState });
assert.equal(multiPrepared.ok, true, multiPrepared.message);
assert.deepEqual(multiPrepared.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'default startup must preserve declared workspace-entrypoint order through the shared lifecycle');
assert.deepEqual(multiPrepared.sourceInputs.map((input) => input.repository), ['Tiinex/news', 'Tiinex/docs'], 'default startup materialization inputs must preserve declared order');
assert.equal(multiPrepared.workspaces[0].id, 'workspace:embedded-default:tiinex-docs', 'first default workspace keeps its deterministic canonical id');
assert.match(multiPrepared.workspaces[1].id, /^workspace:embedded-default:tiinex-docs:2:documentation$/, 'additional default workspace gets deterministic ordered id');
assert.deepEqual(hydratedIds.sort(), multiPrepared.workspaces.map((workspace) => workspace.id).sort(), 'every default workspace must pass through local-delta hydration hook');

const sourceOnly = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'source-only', name: 'Source only' });
sourceOnly.workspace.sources = [{ id: 'github:old', kind: 'github-tree', adapterId: 'github' }];
sourceOnly.workspace.sourceOrder = ['github:old'];
sourceOnly.workspace.records = [{ id: 'source:old', path: '.topics/old.md', sourceMode: 'source-backed', source: sourceOnly.workspace.sources[0] }];
const durable = lifecycle.createWorkspace(sourceOnly.state, { id: 'durable-local', name: 'Durable local' });
durable.workspace.records = [{ id: 'local:draft', path: '.topics/local.md', markdown: '# local', sourceMode: 'local-draft', source: { id: 'local', kind: 'local-session', adapterId: 'local' } }];
const sharedPrepared = prepareDefaultWorkspaceStartCommand({ lifecycle, persistence, state: durable.state, workspaceConfig, storage: localDeltaState });
assert.equal(sharedPrepared.ok, true, sharedPrepared.message);
assert.equal(sharedPrepared.state.workspaces.some((workspace) => workspace.id === 'source-only'), false, 'default startup must use shared Open semantics and replace prior source-only/non-draft workspace context');
assert.equal(sharedPrepared.state.workspaces.some((workspace) => workspace.id === 'durable-local'), true, 'shared Open semantics must preserve durable local work during default startup');
assert.equal(sharedPrepared.state.activeWorkspaceId, 'workspace:embedded-default:tiinex-docs', 'deterministic default workspace remains active after shared lifecycle Open');

const blocked = prepareDefaultWorkspaceStartCommand({ lifecycle, state: lifecycle.makeEmptyAppState(), workspaceConfig: { workspaceEntrypoints: [], workspaceDiscovery: [] } });
assert.equal(blocked.ok, false, 'missing embedded/default config must fail instead of inventing source provenance');
console.log('✓ default workspace start command tests passed');
