import assert from 'node:assert/strict';
import { forbiddenPrimaryWorkspaceActionCopy } from '../workspaces/workspace.artifactActions.js';
import { workspaceRecordOpenedNotice, workspaceRecordMergedNotice } from './workspaceContinuityNotices.js';
const recordOpen = workspaceRecordOpenedNotice({
  entry: { title: 'Start' },
  sourceInputs: [{ label: 'Tiinex docs' }],
  openedWorkspaceSet: true
});
assert.equal(forbiddenPrimaryWorkspaceActionCopy(recordOpen).length, 0, 'record-open notice must not expose separate-workspace copy');
assert.match(recordOpen, /Opened workspace artifact Start as the active workspace set/);
assert.match(recordOpen, /Previous non-draft workspaces were replaced/);

const recordMerge = workspaceRecordMergedNotice({
  entry: { title: 'Start' },
  merge: { createdCount: 1, touchedWorkspaceIds: [], skippedLoads: 0 },
  sourceInputs: []
});
assert.equal(forbiddenPrimaryWorkspaceActionCopy(recordMerge).length, 0, 'record-merge notice must use canonical workspace artifact copy');
assert.match(recordMerge, /Merged workspace artifact Start/);

console.log('✓ workspace continuity notices action-copy tests passed');
