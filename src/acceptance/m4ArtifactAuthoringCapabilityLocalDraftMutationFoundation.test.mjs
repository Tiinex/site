import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { createContinuationDraft } from '../transitions/record.transitions.js';
import { projectArtifactAuthoringCapability } from '../app/artifactAuthoringCapability.js';
import { canDiscardLocalDraft } from '../artifacts/artifact.localDraft.js';
import { runLocalDraftDiscardCommand, runLocalDraftUpdateCommand } from '../app/localDraftMutationCommand.js';
import { createPersistenceOwnershipPolicy, DurableLocalAuthority, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { presentRecordActions, RecordActionKind } from '../actions/record.actions.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const base = lifecycle.makeEmptyAppState();
const created = lifecycle.createWorkspace(base, { name: 'Authoring' }, { clock: () => '2026-08-15T07:00:00.000Z' });
const workspaceId = created.workspace.id;
const topic = sourceTopic();
const sourceAdded = sourceRecordState(created.state, workspaceId, topic);
const taskDraft = createContinuationDraft(topic, { id: 'tiinex.task.v1', label: 'Task' }, { title: 'Draft task', summary: 'Initial task summary.' }, { clock: () => '2026-08-15T07:01:00.000Z' });
const draftAdded = lifecycle.addWorkspaceRecord(sourceAdded, workspaceId, taskDraft);
assert.equal(draftAdded.ok, true);
const task = draftAdded.record;

const topicProjection = projectArtifactAuthoringCapability(topic);
assert.equal(topicProjection.operations.createFromTransition.available, true, 'Topic transition create remains available');
assert.equal(topicProjection.operations.createRoot.available, false, 'root Create remains explicitly unavailable');
assert.equal(topicProjection.operations.editLocalDraft.available, false, 'source-backed Topic is not editable');
assert.equal(topicProjection.operations.discardLocalDraft.available, false, 'source-backed Topic is not discardable');

const taskProjection = projectArtifactAuthoringCapability(task);
assert.equal(taskProjection.operations.editLocalDraft.available, true, 'local Task edit capability is available');
assert.equal(taskProjection.operations.discardLocalDraft.available, true, 'local Task discard capability is available');
assert.equal(taskProjection.operations.createRoot.available, false, 'createRoot remains unavailable for local Task too');
assert.equal(canDiscardLocalDraft(task), true);
assert(presentRecordActions(task).some((action) => action.id === RecordActionKind.deleteLocal), 'action layer consumes canonical discard policy');

const isolated = createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState, { durableLocalAuthority: DurableLocalAuthority.isolatedPreexistingRecovery });
const isolatedTask = projectArtifactAuthoringCapability(task, { persistenceOwnership: isolated });
assert.equal(isolatedTask.operations.editLocalDraft.available, false, 'isolated local Task edit is unavailable');
assert.equal(isolatedTask.operations.discardLocalDraft.available, false, 'isolated local Task discard is unavailable');
const isolatedTopic = projectArtifactAuthoringCapability(topic, { persistenceOwnership: isolated });
assert.equal(isolatedTopic.operations.createFromTransition.known, true, 'Topic transition remains semantically known while isolated');
assert.equal(isolatedTopic.operations.createFromTransition.available, false, 'isolated transition cannot create new durable local draft');
assert.match(isolatedTopic.operations.createFromTransition.reason, /shared view is isolated/i);

const editedMarkdown = task.markdown
  .replace('Initial task summary.', 'Edited task summary.')
  .replace(/## Next Step[\s\S]*?(?=\n## |\n# Continuity Integrity)/, '## Next Step\n\nReview edited local draft.');
const updated = runLocalDraftUpdateCommand({ lifecycle, state: draftAdded.state, workspaceId, recordId: task.id, candidate: { markdown: editedMarkdown }, persistenceOwnership: createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState) });
assert.equal(updated.ok, true, updated.notice || updated.error);
assert.equal(updated.record.id, task.id);
assert.equal(updated.record.path, task.path);
assert.equal(updated.record.kind, task.kind);
assert.equal(updated.record.createdAt, task.createdAt);
assert.match(updated.record.markdown, /Edited task summary\./);

for (const mutation of [
  { id: 'different-id' },
  { path: `${task.path}.moved` },
  { kind: 'tiinex.evidence.v1' },
  { markdown: task.markdown.replace('record:source-topic', 'record:other-parent') }
]) {
  const candidate = { markdown: editedMarkdown, ...mutation };
  const result = runLocalDraftUpdateCommand({ lifecycle, state: draftAdded.state, workspaceId, recordId: task.id, candidate });
  assert.equal(result.ok, false, `identity mutation must be refused: ${JSON.stringify(mutation)}`);
}

const sourceTaskState = sourceRecordState(created.state, workspaceId, { ...task, id: 'source-task', sourceMode: 'source-backed', source: { id: 'github:x', kind: 'github-tree', adapterId: 'github' } });
const sourceEdit = runLocalDraftUpdateCommand({ lifecycle, state: sourceTaskState, workspaceId, recordId: 'source-task', candidate: { markdown: editedMarkdown } });
assert.equal(sourceEdit.ok, false, 'source-backed Task edit is refused');
assert.equal(sourceEdit.error, 'record.edit.refused');

const isolatedUpdate = runLocalDraftUpdateCommand({ lifecycle, state: draftAdded.state, workspaceId, recordId: task.id, candidate: { markdown: editedMarkdown }, persistenceOwnership: isolated });
assert.equal(isolatedUpdate.ok, false, 'isolated edit refused before mutation');
assert.equal(isolatedUpdate.state, draftAdded.state, 'isolated edit leaves state untouched');

const discard = runLocalDraftDiscardCommand({ lifecycle, state: draftAdded.state, workspaceId, recordId: task.id });
assert.equal(discard.ok, true, discard.notice || discard.error);
assert(!discard.workspace.records.some((record) => record.id === task.id), 'local Task discard removes the exact draft');
const sourceDiscard = runLocalDraftDiscardCommand({ lifecycle, state: sourceAdded, workspaceId, recordId: topic.id });
assert.equal(sourceDiscard.ok, false, 'source-backed record discard is refused');
assert.equal(sourceDiscard.error, 'record.remove.refused');
const lifecycleDiscard = lifecycle.removeWorkspaceRecord(sourceAdded, workspaceId, topic.id);
assert.equal(lifecycleDiscard.ok, false, 'lifecycle consumes the same discard truth');
assert.equal(lifecycleDiscard.error, 'record.remove.refused');

console.log('✓ M4-A artifact authoring capability / local draft mutation foundation tests passed');

function sourceTopic() {
  return {
    id: 'source-topic',
    title: 'Source Topic',
    summary: 'Source-backed Topic parent.',
    kind: 'tiinex.topic.v1',
    schemaId: 'tiinex.topic.v1',
    status: 'loaded',
    createdAt: '2026-08-14',
    path: '.topics/source-topic.trace.md',
    sourceMode: 'source-backed',
    source: { id: 'github:owner-repo:main:topics', kind: 'github-tree', adapterId: 'github', repo: 'Owner/Repo', ref: 'main' },
    markdown: [
      '# Continuity Context','','- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)','- Parent','  - Parent Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)','  - Created At: 2026-08-14','  - Trace: root','  - Boundary: source-backed github material','- Current','  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)','  - Created At: 2026-08-14','  - Summary: Source-backed Topic parent.','  - Status: active','  - Why: Fixture','','---','','# Source Topic','','Topic body with enough readable material for Continue.','','# Continuity Integrity','','- Fixture','  - Value: stable'
    ].join('\n')
  };
}

function sourceRecordState(state, workspaceId, record) {
  const next = structuredClone(state);
  const workspace = next.workspaces.find((item) => item.id === workspaceId);
  workspace.records = [structuredClone(record), ...(workspace.records || []).filter((item) => item.id !== record.id)];
  return next;
}
