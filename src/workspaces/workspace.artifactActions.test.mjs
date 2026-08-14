import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';
import {
  forbiddenPrimaryWorkspaceActionCopy,
  workspaceArtifactActionModel,
  workspaceArtifactBoundaryBadge,
  WORKSPACE_ARTIFACT_ACTION_CONTRACT_ID
} from './workspace.artifactActions.js';

const sourceBacked = { title: 'Documentation', path: '.topics/docs.workspace.md', sourceMode: 'source-backed-workspace-file', source: { adapterId: 'github' } };
const model = workspaceArtifactActionModel(sourceBacked);
assert.equal(model.schema, WORKSPACE_ARTIFACT_ACTION_CONTRACT_ID);
assert.equal(model.roleLabel, 'workspace artifact');
assert.equal(model.open.label, 'Open');
assert.equal(model.merge.label, 'Merge');
assert.match(model.open.title, /active workspace context/);
assert(!model.open.title.includes('separate workspace'), 'Open copy must not describe a separate-workspace implementation model');
assert.equal(workspaceArtifactBoundaryBadge(sourceBacked), 'source-backed');
assert.equal(workspaceArtifactBoundaryBadge({ source: { adapterId: 'local' } }), 'local/session');
assert.equal(workspaceArtifactBoundaryBadge({ materialReconciliation: { status: 'source-candidate-over-local' } }), 'source + local snapshot');

const ordinaryRecord = {
  id: 'ordinary-record',
  title: 'Ordinary',
  path: '.topics/ordinary.md',
  schemaId: 'tiinex.unknown.v1',
  source: { adapterId: 'github' },
  sourceTarget: { sourceUrl: 'https://github.com/Tiinex/docs/blob/main/.topics/ordinary.md' }
};
const workspaceRecord = {
  id: 'workspace-record',
  title: 'Start',
  path: '.topics/start/start.workspace.md',
  schemaId: 'tiinex.workspace.v1',
  source: { adapterId: 'github' },
  sourceTarget: { sourceUrl: 'https://github.com/Tiinex/docs/blob/main/.topics/start/start.workspace.md' }
};
const ordinaryActions = presentRecordActions(ordinaryRecord);
const workspaceActions = presentRecordActions(workspaceRecord);
const lifecycleIds = new Set([RecordActionKind.workspaceOpen, RecordActionKind.workspaceMerge]);
const workspaceGeneric = workspaceActions.filter((action) => !lifecycleIds.has(action.id));
assert.deepEqual(workspaceGeneric.map((action) => action.id), ordinaryActions.map((action) => action.id), 'Workspace Artifact must retain the ordinary artifact action vocabulary/order');
assert.deepEqual(workspaceActions.slice(-2).map((action) => action.id), [RecordActionKind.workspaceOpen, RecordActionKind.workspaceMerge], 'workspace lifecycle capabilities trail the ordinary artifact actions');
assert(workspaceActions.some((action) => action.id === RecordActionKind.source), 'source-backed Workspace Artifact retains the ordinary truthful source action');

const localActions = presentRecordActions({ id:'local-workspace', title:'Local', path:'local.workspace.md', schemaId:'tiinex.workspace.v1', source:{ adapterId:'local', kind:'local-session' } });
assert.equal(localActions.some((action) => action.id === RecordActionKind.source), false, 'local Workspace Artifact must never gain guessed Open source provenance');
assert.deepEqual(localActions.slice(-2).map((action) => action.id), [RecordActionKind.workspaceOpen, RecordActionKind.workspaceMerge], 'local Workspace Artifact still receives lifecycle capabilities');

const primaryUi = [
  readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../schemas/workspace/workspace.tree.views.jsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../schemas/workspace/workspace.viewFormatting.js', import.meta.url), 'utf8'),
  readFileSync(new URL('../actions/record.actions.js', import.meta.url), 'utf8'),
  readFileSync(new URL('../app/workspaceContinuityNotices.js', import.meta.url), 'utf8')
].join('\n');
assert.deepEqual(forbiddenPrimaryWorkspaceActionCopy(primaryUi), [], 'Workspace Artifact UI/notices must not expose candidate-vs-record Open/Merge copy');

const recordCardSource = readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8');
assert.equal(recordCardSource.includes('tx-workspace-artifact-primary-actions'), false, 'Workspace Artifact must not use a dedicated primary action renderer');
assert.equal(recordCardSource.includes('tx-workspace-artifact-secondary-actions'), false, 'Workspace Artifact must not use a dedicated secondary action renderer');
assert(recordCardSource.includes('aria-label="Artifact actions"'), 'all record artifacts share the ordinary Artifact actions rail');
assert(recordCardSource.includes('data-workspace-artifact-action-model'), 'workspace artifacts may expose lifecycle metadata without owning a parallel renderer');
assert.equal(recordCardSource.includes('Source/local states are roles'), false, 'primary workspace cards must not explain internal refactor architecture');
assert.equal(recordCardSource.includes('workspaceCandidateRoles) && record.workspaceCandidateRoles.length'), false, 'record workspace capability must not be inferred from legacy candidate readmodel roles');

console.log('✓ workspace artifact capability composition tests passed');
