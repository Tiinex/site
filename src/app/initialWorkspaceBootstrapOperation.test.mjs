import assert from 'node:assert/strict';
import { runInitialWorkspaceBootstrapOperation } from './initialWorkspaceBootstrapOperation.js';
import { stableStartupWorkspaceId } from './startupWorkspaceCommand.js';

function lifecycle() {
  return {
    createWorkspace(state, input = {}) {
      const workspace = { id: input.id || 'workspace:test', name: input.name || 'Test', records: [], assets: [], sources: [], sourceOrder: [] };
      return { ok: true, workspace, state: { ...state, workspaces: [...(state.workspaces || []).filter((item) => item.id !== workspace.id), workspace], activeWorkspaceId: workspace.id } };
    }
  };
}

function persistence(localWorkspaces = []) {
  return {
    hydrateWorkspaceWithLocalDeltas(state, workspaceId) {
      const local = localWorkspaces.find((workspace) => workspace.id === workspaceId);
      if (!local) return state;
      return { ...state, workspaces: state.workspaces.map((workspace) => workspace.id === workspaceId ? { ...workspace, records: [...(workspace.records || []), ...(local.records || [])] } : workspace) };
    },
    augmentStartupStateWithLocalRecovery(state, _storage, options = {}) {
      const known = new Set(state.workspaces.map((workspace) => workspace.id));
      const workspaces = state.workspaces.map((workspace) => {
        const local = localWorkspaces.find((item) => item.id === workspace.id);
        return local ? { ...workspace, records: [...(workspace.records || []), ...(local.records || [])] } : workspace;
      });
      for (const local of localWorkspaces) if (!known.has(local.id)) workspaces.push(local);
      const savedFocus = localWorkspaces.at(-1)?.id || '';
      return { ...state, workspaces, activeWorkspaceId: options.restoreFocus === false ? state.activeWorkspaceId : (savedFocus || state.activeWorkspaceId) };
    }
  };
}

const defaultLocal = { id: 'workspace:embedded-default:tiinex-docs', name: 'Tiinex docs', records: [{ id: 'local:matching', path: 'local.md', markdown: '# Local' }], assets: [], sources: [], sourceOrder: [] };
const standaloneLocal = { id: 'workspace:local-only', name: 'Local recovered', records: [{ id: 'local:standalone', path: 'draft.md', markdown: '# Draft' }], assets: [], sources: [], sourceOrder: ['local'] };
let committed = null;
const defaultResult = await runInitialWorkspaceBootstrapOperation({
  runtimeApi: { lifecycle: lifecycle(), persistence: persistence([defaultLocal, standaloneLocal]), config: { parseWorkspaceConfig: () => ({ workspaceEntrypoints: [] }) } },
  state: { workspaces: [] },
  workspaceConfig: { viewerIdentity: { browserTitle: 'Tiinex docs' }, workspaceEntrypoints: [{ sourceKind: 'github-tree', repository: 'Tiinex/docs', rootPath: '.topics' }] },
  storage: {}, locationLike: { href: 'https://example.test/', search: '' }, windowObj: {},
  resolveStartupInput: async () => ({ ok: false, startupClass: 'unresolved' }),
  commit: (state) => { committed = state; }
});
assert.equal(defaultResult.ok, true);
assert.equal(defaultResult.selected, 'embedded-default-workspace');
assert.equal(committed.activeWorkspaceId, 'workspace:local-only', 'saved browser-local focus may be restored after canonical default bootstrap');
assert(committed.workspaces.find((workspace) => workspace.id === 'workspace:embedded-default:tiinex-docs')?.records.some((record) => record.id === 'local:matching'), 'matching local delta augments default workspace');
assert(committed.workspaces.some((workspace) => workspace.id === 'workspace:local-only'), 'unmatched durable local workspace remains explicitly recoverable alongside canonical startup');
assert(committed.workspaces.some((workspace) => workspace.id === 'workspace:embedded-default:tiinex-docs'), 'canonical default workspace remains present/source-owning even when local focus is restored');

const hostedWorkspaceId = stableStartupWorkspaceId('test');
const hostedLocal = { id: hostedWorkspaceId, name: 'Hosted', records: [{ id: 'local:hosted', path: 'hosted-local.md', markdown: '# Hosted local' }], assets: [], sources: [], sourceOrder: [] };
let hostedCommitted = null;
const hosted = await runInitialWorkspaceBootstrapOperation({
  runtimeApi: { lifecycle: lifecycle(), persistence: persistence([hostedLocal]), config: { parseWorkspaceConfig: () => ({ workspaceEntrypoints: [] }) } },
  state: { workspaces: [] }, storage: {}, locationLike: { href: 'https://example.test/?workspace=x', search: '?workspace=x' }, windowObj: {},
  resolveStartupInput: async () => ({ ok: true, startupClass: 'hosted-config', input: { label: 'Hosted', repository: 'Tiinex/docs' }, configUrl: 'test', targetUrl: 'test', config: { viewerIdentity: { browserTitle: 'Hosted' } }, diagnostics: { selectedConvention: 'hosted' } }),
  commit: (state) => { hostedCommitted = state; }
});
assert.equal(hosted.ok, true);
assert.equal(hosted.selected, 'hosted-config');
assert.equal(hostedCommitted.activeWorkspaceId, hosted.workspace.id, 'hosted config remains startup owner when local deltas exist');
assert(hostedCommitted.workspaces.find((workspace) => workspace.id === hostedWorkspaceId)?.records.some((record) => record.id === 'local:hosted'), 'matching local delta augments explicit hosted startup');

let explicitFailureCommit = null;
const explicitFailure = await runInitialWorkspaceBootstrapOperation({ runtimeApi:{lifecycle:lifecycle(),persistence:persistence([]),config:{parseWorkspaceConfig:()=>({workspaceEntrypoints:[]})}}, state:{workspaces:[]}, workspaceConfig:{viewerIdentity:{browserTitle:'Tiinex docs'},workspaceEntrypoints:[{sourceKind:'github-tree',repository:'Tiinex/docs',rootPath:'.topics'}]}, storage:{}, locationLike:{href:'https://example.test/?workspace=https%3A%2F%2Fmissing.example%2Fworkspace.md',search:'?workspace=https%3A%2F%2Fmissing.example%2Fworkspace.md'}, windowObj:{}, resolveStartupInput:async()=>({ok:false,startupClass:'unresolved',explicitQueryRequested:true,message:'Requested workspace is unavailable.'}), commit:(state)=>{explicitFailureCommit=state;} });
assert.equal(explicitFailure.ok,false,'failed explicit workspace query must remain a disclosed startup failure');
assert.equal(explicitFailure.error,'startup.explicit-workspace-unavailable');
assert.equal(explicitFailureCommit,null,'failed explicit workspace query must not silently substitute embedded default');

const skipped = await runInitialWorkspaceBootstrapOperation({ state: { workspaces: [{ id: 'existing' }] } });
assert.equal(skipped.skipped, 'workspace-already-present');
console.log('✓ initial workspace bootstrap operation tests passed');

const materializedWorkspaceLabels = [];
let multiCommitted = null;
const multiBootstrap = await runInitialWorkspaceBootstrapOperation({
  runtimeApi: { lifecycle: lifecycle(), persistence: persistence([]), config: { parseWorkspaceConfig: () => ({ workspaceEntrypoints: [] }) } },
  state: { workspaces: [] }, storage: {}, locationLike: { href: 'https://tiinex.dev/', search: '' }, windowObj: {},
  resolveStartupInput: async () => ({
    ok: true,
    startupClass: 'hosted-config',
    configUrl: 'https://tiinex.dev/tiinex.workspace.md',
    targetUrl: 'https://tiinex.dev/tiinex.workspace.md',
    config: { viewerIdentity: { browserTitle: 'Tiinex' } },
    inputs: [
      { label: 'News', workspaceLabel: 'News', repository: 'Tiinex/site', rootPath: '.topics/news', issueDiscovery: true },
      { label: 'Documentation', workspaceLabel: 'Documentation', repository: 'Tiinex/docs', rootPath: '.topics/documentation', issueDiscovery: true }
    ],
    input: { label: 'News', workspaceLabel: 'News', repository: 'Tiinex/site', rootPath: '.topics/news', issueDiscovery: true },
    selectedPlan: 'workspace-entrypoints',
    diagnostics: { selectedConvention: 'workspace-entrypoints' }
  }),
  commit: (state) => { multiCommitted = state; },
  materializeSource: async (input, options) => {
    materializedWorkspaceLabels.push(input.workspaceLabel || input.label);
    return { state: options.state };
  }
});
assert.equal(multiBootstrap.ok, true);
assert.deepEqual(multiBootstrap.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'hosted startup applies the complete configured workspace entrypoint set in PoC order');
assert.deepEqual(multiCommitted.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'first useful committed workspace set matches configured entrypoint order');
assert.deepEqual(materializedWorkspaceLabels, ['News', 'Documentation'], 'every configured workspace entrypoint is materialized instead of reducing startup to one selected source');
