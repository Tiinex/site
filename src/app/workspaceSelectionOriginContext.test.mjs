import assert from 'node:assert/strict';
import { captureWorkspaceSelectionOriginContext, restoreWorkspaceSelectionOriginContext } from './workspaceSelectionOriginContext.js';
import { createWorkspaceSelectionSession, workspaceSelectionResult } from './workspaceSelectionSession.js';

const base={
  activeWorkspaceId:'A',
  workspaces:[{id:'A',records:[{id:'a1'}]},{id:'B',records:[{id:'b1'}]}],
  view:{workspaceVerse:'tree',query:'alpha',selectedRecordId:'a1'},
  workspaceViews:{A:{workspaceVerse:'tree',query:'alpha',selectedRecordId:'a1'},B:{workspaceVerse:'feed',query:'beta',selectedRecordId:''}},
  workspaceWindow:{schema:'tiinex.workspace.window.v1',offset:0}
};
const origin=captureWorkspaceSelectionOriginContext(base);
const session=createWorkspaceSelectionSession({role:'transition-input:A',ownerKey:'x',originWorkspaceId:'A',originContext:origin,candidates:[{key:'b',workspaceId:'B',id:'b1',enabled:true}]});
const chosen=workspaceSelectionResult(session,{key:'b'});
assert.equal(chosen.ok,true);
const traversed={...base,activeWorkspaceId:'B',view:{workspaceVerse:'lineage',query:'changed',selectedRecordId:'b1'},workspaceViews:{...base.workspaceViews,A:{workspaceVerse:'feed',query:'mutated'},B:{workspaceVerse:'lineage',query:'changed',selectedRecordId:'b1'}},workspaceWindow:{schema:'tiinex.workspace.window.v1',offset:1},workspaces:[{id:'A',records:[{id:'a1'},{id:'new-during-selection'}]},{id:'B',records:[{id:'b1'}]}]};
const afterChoose=restoreWorkspaceSelectionOriginContext(traversed,session.originContext);
assert.equal(afterChoose.activeWorkspaceId,'A','cross-workspace choose restores origin workspace');
assert.deepEqual(afterChoose.workspaceViews.A,base.workspaceViews.A,'origin view/search/selected-node context restores exactly');
assert.equal(afterChoose.workspaceWindow.offset,0,'workspace-window traversal is temporary');
assert.equal(afterChoose.workspaces[0].records.length,2,'ambient restore does not roll back current material truth');
const afterCancel=restoreWorkspaceSelectionOriginContext(traversed,session.originContext);
assert.equal(afterCancel.activeWorkspaceId,'A','cross-workspace cancel restores origin workspace');
const reenteredOrigin=captureWorkspaceSelectionOriginContext(afterChoose);
const reentered=createWorkspaceSelectionSession({role:'transition-input:A',ownerKey:'x',originWorkspaceId:'A',originContext:reenteredOrigin,candidates:[{key:'b',workspaceId:'B',id:'b1',enabled:true}]});
assert.equal(reentered.originContext.activeWorkspaceId,'A','change/re-enter snapshots restored caller context rather than incidental target focus');
assert.equal(reentered.originContext.workspaceViews.A.query,'alpha');
console.log('workspaceSelectionOriginContext tests passed');
