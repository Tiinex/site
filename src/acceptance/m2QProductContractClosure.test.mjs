import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';
import { actionClassName } from '../schemas/workspace/workspace.viewFormatting.js';
import '../workspaces/workspace.route.js';
import { sourceTransportRefreshInputForSource } from '../app/sourceTransportRefresh.js';
import { runGithubSourceOperation } from '../app/githubSourceOperation.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const configured = lifecycle.makeConfiguredSource({ repository:'owner/repo', rootPath:'.topics', repoDiscovery:false, explicitFileRefs:['.topics/a.md','.topics/a.md','.topics/b.md'] });
assert.deepEqual(configured.explicitFileRefs, ['.topics/a.md','.topics/b.md']);
assert.equal(configured.repoDiscovery, false, 'exact files must not infer broad repo discovery');
assert.deepEqual(configured.config.explicitFileRefs, ['.topics/a.md','.topics/b.md']);

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name:'Closure' }, { clock:()=> '2026-08-13T00:00:00.000Z' });
const added = lifecycle.addWorkspaceSource(created.state, created.workspace.id, configured);
const route = globalThis.TiinexWorkspaceRoute.makeRouteState(added.state);
const routeSource = route.workspaces[0].sources.find((source) => source.repo === 'owner/repo');
assert.deepEqual(routeSource?.explicitFileRefs, ['.topics/a.md','.topics/b.md'], 'F5/route source projection preserves exact file targets');
const refresh = sourceTransportRefreshInputForSource(added.source, 'cache', ['repoFiles']);
assert.deepEqual(refresh.input.explicitFileRefs, ['.topics/a.md','.topics/b.md'], 'source refresh projects canonical exact targets');



let loadedCommit = null;
const loadCalls = [];
const loadResult = await runGithubSourceOperation({
  input: { operation:'materialize', repository:'owner/repo', ref:'main', rootPath:'.topics', repoDiscovery:false, issueDiscovery:false, explicitFileRefs:['.topics/a.md'], transportRefreshTier:'direct', resetSourceCache:false },
  state: created.state,
  active: created.workspace,
  runtimeApi: { lifecycle },
  operationRef: { current:{ token:null, controller:null } },
  setNotice:()=>{}, setDialog:()=>{}, setGithubRequestPending:()=>{},
  commit:(state)=>{ loadedCommit=state; }, getLatestState:()=>created.state,
  fetchImpl: async (url) => { loadCalls.push(String(url)); return { ok:true, status:200, statusText:'OK', text:async()=> '# Exact\n\nBody', json:async()=>({}) }; },
  AbortControllerImpl: undefined
});
assert.equal(loadResult.ok, true, loadResult.error);
const loadedWorkspace = lifecycle.activeWorkspace(loadedCommit || loadResult.state);
const loadedSource = loadedWorkspace.sources.find((source)=>source.repo==='owner/repo');
assert.deepEqual(loadedSource.explicitFileRefs, ['.topics/a.md'], 'Load material persists exact file targets as source configuration');
assert.equal(loadedSource.repoDiscovery, false, 'explicit-only load stays explicit-only');
assert(loadCalls.some((url)=>url.includes('/owner/repo/main/.topics/a.md')), 'canonical explicit source target is projected into the actual load operation');

const workspaceRecord = { id:'w', title:'Docs', path:'.topics/docs.workspace.md', schemaId:'tiinex.workspace.v1', source:{ adapterId:'github', repo:'owner/repo', ref:'main' }, sourceTarget:{ sourceArtifactPath:'.topics/docs.workspace.md' } };
const ordinaryRecord = { id:'a', title:'Artifact', path:'.topics/a.md', schemaId:'tiinex.unknown.v1', source:{ adapterId:'github', repo:'owner/repo', ref:'main' }, sourceTarget:{ sourceArtifactPath:'.topics/a.md' } };
const workspaceActions = presentRecordActions(workspaceRecord);
const ordinaryActions = presentRecordActions(ordinaryRecord);
const lifecycleIds = new Set([RecordActionKind.workspaceOpen, RecordActionKind.workspaceMerge]);
assert.deepEqual(workspaceActions.filter((action)=>!lifecycleIds.has(action.id)).map((action)=>action.id), ordinaryActions.map((action)=>action.id), 'Workspace Artifact shares ordinary artifact actions before workspace lifecycle capabilities');
assert.deepEqual(workspaceActions.slice(-2).map((action)=>action.id), [RecordActionKind.workspaceOpen, RecordActionKind.workspaceMerge]);
const workspaceSourceAction = workspaceActions.find((action)=>action.id===RecordActionKind.source);
const ordinarySourceAction = ordinaryActions.find((action)=>action.id===RecordActionKind.source);
assert.equal(actionClassName(workspaceSourceAction), actionClassName(ordinarySourceAction), 'Workspace Artifact source provenance uses the same generic icon/tooltip styling contract as ordinary artifacts');
assert.equal(actionClassName(workspaceSourceAction).includes('tx-labeled-action'), false, 'Open source is not a Workspace-specific labeled action');

const formSource = readFileSync(new URL('../schemas/workspace/workspace.add.views.jsx', import.meta.url), 'utf8');
assert(formSource.includes("const saveLabel = 'Save source'"));
assert.equal(formSource.includes('Register only'), false);
assert(formSource.includes('continuation?.explicitFileRefs'), 'Edit source must restore exact Markdown targets from durable source state');

const chromeSource = readFileSync(new URL('../schemas/workspace/workspace.chrome.views.jsx', import.meta.url), 'utf8');
assert(chromeSource.includes("source.sourceKind === 'github.file' && source.loadable === false"), 'targeted schema recovery must have explicit non-broad source-strip ownership');
assert(chromeSource.includes("'targeted-provenance'"), 'targeted recovered file sources must not masquerade as configured broad sources');

console.log('✓ M2 Q product contract v374 closure tests passed');
