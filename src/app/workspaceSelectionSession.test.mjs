import assert from 'node:assert/strict';
import { createWorkspaceSelectionSession, workspaceSelectionAllows, workspaceSelectionResult } from './workspaceSelectionSession.js';
import { explicitPlacementPath, workspacePlacementOptions } from './workspacePlacementOptions.js';

const reference = createWorkspaceSelectionSession({ role: 'reference-target', ownerKey: 'ref:1', originWorkspaceId: 'w1', title: 'Choose Reference target', candidates: [{ key:'participant:a', workspaceId:'w1', id:'a', enabled:true }, { key:'participant:b', workspaceId:'w2', id:'b', enabled:false }] });
assert.equal(reference.ok,true); assert.equal(workspaceSelectionAllows(reference,{key:'participant:a'}),true); assert.equal(workspaceSelectionAllows(reference,{key:'participant:b'}),false);
assert.equal(workspaceSelectionResult(reference,{key:'participant:a'}).candidate.key,'participant:a');

const futureRole = createWorkspaceSelectionSession({ role:'transition-input:A', ownerKey:'future:1', title:'Choose Input A', guidance:'Synthetic future Transition input.', candidates:[{key:'future-candidate:42',workspaceId:'w1',id:'x',enabled:true}] });
assert.equal(futureRole.ok,true,'opaque future role works without picker-core registration');
assert.equal(futureRole.role,'transition-input:A');
assert.equal(futureRole.title,'Choose Input A','caller owns selection presentation text');
assert.equal(workspaceSelectionResult(futureRole,{key:'future-candidate:42'}).ok,true,'caller-owned exact candidate key transports through common primitive');
assert.equal(createWorkspaceSelectionSession({ role:'', candidates:[] }).error,'selection-role-missing');
assert.equal(createWorkspaceSelectionSession({ role:'transition-input:B', candidates:[{workspaceId:'w1',id:'x'}] }).candidateKeys.length,0,'core does not synthesize identity from candidate kind/id');
const exactKey=createWorkspaceSelectionSession({role:'transition-input:C',candidates:[{key:'  opaque-key  ',enabled:true}]});
assert.equal(exactKey.candidateKeys[0],'  opaque-key  ','candidate identity is transported exactly rather than normalized by picker core');

const state={workspaces:[{id:'w1',name:'One',records:[{path:'.topics/a/x.trace.md'}]},{id:'w2',name:'Two',records:[{path:'.topics/b/y.trace.md'}]}]};
const placements=workspacePlacementOptions(state,'w1');
assert.ok(placements.qualifiedOptions.some((x)=>x.path==='.topics/a' && x.key==='placement-folder:w1:.topics/a'));
assert.ok(placements.unavailableOptions.some((x)=>x.workspaceId==='w2'&&x.reason==='cross-workspace-placement-authority-unavailable'));
assert.equal(explicitPlacementPath('.topics/example--topic.trace.md','.topics/a'),'.topics/a/example--topic.trace.md');
console.log('workspaceSelectionSession tests passed');
