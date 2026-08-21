import assert from 'node:assert/strict';
import { runInitialWorkspaceBootstrapOperation } from './initialWorkspaceBootstrapOperation.js';

const lifecycle = {
  createWorkspace(state, input = {}) {
    const workspace = { id: input.id || 'w', name: input.name || 'W', title: input.name || 'W', records: [], assets: [], sources: [], sourceOrder: [] };
    return { ok: true, workspace, state: { ...state, workspaces: [workspace], activeWorkspaceId: workspace.id } };
  }
};
const persistence = { augmentStartupStateWithLocalRecovery(state) { return state; }, hydrateWorkspaceWithLocalDeltas(state) { return state; } };
const commits=[]; const materialCalls=[];
const result=await runInitialWorkspaceBootstrapOperation({
  runtimeApi:{lifecycle,persistence,config:{parseWorkspaceConfig:()=>({workspaceEntrypoints:[]})}},
  state:{workspaces:[]},storage:{},locationLike:{href:'https://example.test/',search:''},windowObj:{},
  resolveStartupInput:async()=>({ok:true,startupClass:'hosted-config',selectedPlan:'workspace-entrypoints',configUrl:'exact',targetUrl:'exact',config:{viewerIdentity:{browserTitle:'Configured'}},input:{label:'Configured',repository:'Tiinex/docs',repoDiscovery:true},inputs:[{label:'Configured',repository:'Tiinex/docs',repoDiscovery:true}]}),
  materializeSource:async(input,options)=>{materialCalls.push(options); const ws=options.state.workspaces[0]; return {state:{...options.state,workspaces:[{...ws,records:[{id:'loaded',path:'loaded.trace.md'}]}]}};},
  commit:(state)=>commits.push(state)
});
assert.equal(result.ok,true);
assert.equal(materialCalls.length,1);
assert.equal(materialCalls[0].bufferProductState,true,'startup source materialization is explicitly buffered away from product commits');
assert.equal(commits.length,1,'configured startup exposes one final product commit rather than an interim empty workspace');
assert.equal(commits[0].workspaces[0].records.length,1,'the one visible startup commit contains materialized useful state');
console.log('✓ startup buffered product commit tests passed');
