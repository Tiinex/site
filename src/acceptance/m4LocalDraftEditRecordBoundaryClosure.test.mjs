import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { createContinuationDraft } from '../transitions/record.transitions.js';
import { runLocalDraftUpdateCommand } from '../app/localDraftMutationCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const base = lifecycle.makeEmptyAppState();
const created = lifecycle.createWorkspace(base, { name: 'Edit Boundary' }, { clock: () => '2026-08-15T08:00:00.000Z' });
const workspaceId = created.workspace.id;
const topic = sourceTopic();
const sourceState = sourceRecordState(created.state, workspaceId, topic);
const draft = createContinuationDraft(
  topic,
  { id: 'tiinex.task.v1', label: 'Task' },
  { title: 'Draft task', summary: 'Initial task summary.' },
  { clock: () => '2026-08-15T08:01:00.000Z' }
);
const added = lifecycle.addWorkspaceRecord(sourceState, workspaceId, draft);
assert.equal(added.ok, true);
const original = added.record;

const editedMarkdown = original.markdown
  .replace('# Draft task', '# Edited task title')
  .replace('Initial task summary.', 'Edited task summary.');

const injectedCandidate = {
  markdown: editedMarkdown,
  transition: {
    schema: 'fake.transition',
    parentRecordId: 'parent-B',
    parentPath: '.topics/b.trace.md',
    parentBoundary: 'other'
  },
  creationContract: { id: 'fake-contract', status: 'fake' },
  creationValidation: { ok: false, status: 'fake' },
  validation: { ok: false, status: 'fake' },
  status: 'loaded',
  currentStatus: 'loaded',
  currentWhy: 'Injected runtime state',
  hasContinuityContext: false,
  hasIntegrity: false,
  sourceTarget: { targetKind: 'workspace', externalTarget: 'https://example.invalid/fake.workspace.md' },
  sourceMode: 'source-backed',
  source: { id: 'github:fake', kind: 'github-tree', adapterId: 'github' },
  provenance: { owner: 'candidate' },
  debugOwnership: 'candidate-owned'
};

const updated = runLocalDraftUpdateCommand({
  lifecycle,
  state: added.state,
  workspaceId,
  recordId: original.id,
  candidate: injectedCandidate
});
assert.equal(updated.ok, true, updated.notice || updated.error);

assert.equal(updated.record.title, 'Edited task title', 'title is derived from accepted edited Markdown');
assert.equal(updated.record.summary, 'Edited task summary.', 'summary is derived from accepted edited Markdown');
assert.equal(updated.record.markdown, editedMarkdown.trim(), 'accepted Markdown is the edited artifact material');

for (const key of ['id', 'path', 'schemaId', 'kind', 'createdAt', 'sourceMode', 'status', 'currentStatus', 'currentWhy', 'hasContinuityContext', 'hasIntegrity']) {
  assert.deepEqual(updated.record[key], original[key], `${key} remains owned by the original canonical record`);
}
for (const key of ['source', 'transition', 'creationContract', 'creationValidation', 'validation']) {
  assert.deepEqual(updated.record[key], original[key], `${key} cannot be replaced by arbitrary Edit candidate metadata`);
}
assert.equal(updated.record.sourceTarget, original.sourceTarget, 'candidate sourceTarget is ignored');
assert.equal(updated.record.provenance, original.provenance, 'candidate provenance is ignored');
assert.equal(updated.record.debugOwnership, undefined, 'unknown candidate runtime metadata is not committed');

const parentDrift = runLocalDraftUpdateCommand({
  lifecycle,
  state: added.state,
  workspaceId,
  recordId: original.id,
  candidate: { markdown: editedMarkdown.replace('record:source-topic', 'record:other-parent') }
});
assert.equal(parentDrift.ok, false, 'Markdown Parent Trace drift remains refused');
assert.equal(parentDrift.error, 'record.edit.parent-trace.changed');

const schemaDrift = runLocalDraftUpdateCommand({
  lifecycle,
  state: added.state,
  workspaceId,
  recordId: original.id,
  candidate: { markdown: editedMarkdown.replace('tiinex.task.v1', 'tiinex.evidence.v1') }
});
assert.equal(schemaDrift.ok, false, 'Markdown Current Schema drift remains refused');
assert.equal(schemaDrift.error, 'record.edit.current-schema.changed');

const sourceTaskState = sourceRecordState(created.state, workspaceId, {
  ...original,
  id: 'source-task',
  sourceMode: 'source-backed',
  source: { id: 'github:x', kind: 'github-tree', adapterId: 'github' }
});
const sourceEdit = runLocalDraftUpdateCommand({
  lifecycle,
  state: sourceTaskState,
  workspaceId,
  recordId: 'source-task',
  candidate: { markdown: editedMarkdown }
});
assert.equal(sourceEdit.ok, false, 'source-backed Task edit remains refused');
assert.equal(sourceEdit.error, 'record.edit.refused');

console.log('✓ M4-A local draft Edit record-boundary closure tests passed');

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
