import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { createContinuationDraft } from '../transitions/record.transitions.js';
import { runLocalDraftUpdateCommand } from '../app/localDraftMutationCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const base = lifecycle.makeEmptyAppState();
const created = lifecycle.createWorkspace(base, { name: 'Lossless Edit Shell' }, { clock: () => '2026-08-15T08:40:00.000Z' });
const workspaceId = created.workspace.id;
const topic = sourceTopic();
const sourceState = sourceRecordState(created.state, workspaceId, topic);
const draft = createContinuationDraft(topic, { id: 'tiinex.task.v1', label: 'Task' }, { title: 'Draft task', summary: 'Initial task summary.' }, { clock: () => '2026-08-15T08:41:00.000Z' });
const added = lifecycle.addWorkspaceRecord(sourceState, workspaceId, draft);
assert.equal(added.ok, true);
const original = added.record;

const editedMarkdown = original.markdown
  .replace('# Draft task', '# Edited task')
  .replace('Summary: Initial task summary.', 'Summary: Edited task summary.')
  .replace('## Task Draft\nInitial task summary.', '## Task Draft\nEdited body content for the local Task draft.')
  .replace('Review and refine this task draft before export/publication.', 'Review and refine the edited Task before export/publication.');

const accepted = runLocalDraftUpdateCommand({ lifecycle, state: added.state, workspaceId, recordId: original.id, candidate: { markdown: editedMarkdown } });
assert.equal(accepted.ok, true, accepted.notice || accepted.error);
assert.equal(accepted.record.title, 'Edited task');
assert.equal(accepted.record.summary, 'Edited task summary.');
assert.match(accepted.record.markdown, /Edited body content for the local Task draft\./);
for (const declaration of [
  '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
  '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
  '  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)',
  '  - Method: browser-local-draft',
  '  - Value: pending-publication-or-export'
]) {
  assert.equal(accepted.record.markdown.includes(declaration), true, `accepted edit preserves ${declaration}`);
}

const mutations = [
  ['current schema href only', (m) => m.replace('[tiinex.task.v1](tiinex.task.v1.schema.md)', '[tiinex.task.v1](https://example.invalid/other.task.schema.md)')],
  ['parent schema href only', (m) => m.replace('[tiinex.topic.v1](tiinex.topic.v1.schema.md)', '[tiinex.topic.v1](https://example.invalid/other.topic.schema.md)')],
  ['envelope schema href only', (m) => m.replace('[tiinex.root.v1](tiinex.root.v1.schema.md)', '[tiinex.root.v1](https://example.invalid/other.root.schema.md)')],
  ['integrity method href only', (m) => m.replace('  - Method: browser-local-draft', '  - Method: [browser-local-draft](https://example.invalid/integrity-method)')],
  ['integrity unknown metadata', (m) => m.replace('  - Method: browser-local-draft', '  - Method: browser-local-draft\n  - Verification Note: changed-but-parser-unknown')],
  ['continuity unknown field added', (m) => m.replace('- Current\n', '- Edit Extension: parser-unknown\n- Current\n')]
];
for (const [label, mutate] of mutations) {
  const result = runLocalDraftUpdateCommand({ lifecycle, state: added.state, workspaceId, recordId: original.id, candidate: { markdown: mutate(editedMarkdown) } });
  assert.equal(result.ok, false, `${label} must be refused`);
  assert.equal(result.error, 'record.edit.continuity-shell.changed', `${label} is preserve-only lossless shell state`);
}

const extensionDraft = createContinuationDraft(topic, { id: 'tiinex.task.v1', label: 'Task' }, { title: 'Extended draft', summary: 'Extended draft summary.' }, { clock: () => '2026-08-15T08:42:00.000Z' });
extensionDraft.markdown = extensionDraft.markdown.replace('- Current\n', '- Edit Extension: preserve-me\n- Current\n');
const extensionAdded = lifecycle.addWorkspaceRecord(added.state, workspaceId, extensionDraft);
assert.equal(extensionAdded.ok, true);
const extensionOriginal = extensionAdded.record;
const extensionEdit = extensionOriginal.markdown
  .replace('# Extended draft', '# Extended draft edited')
  .replace('Summary: Extended draft summary.', 'Summary: Extended draft edited summary.')
  .replace('- Edit Extension: preserve-me', '- Edit Extension: changed');
const unknownChanged = runLocalDraftUpdateCommand({ lifecycle, state: extensionAdded.state, workspaceId, recordId: extensionOriginal.id, candidate: { markdown: extensionEdit } });
assert.equal(unknownChanged.ok, false, 'existing parser-unknown continuity field is preserve-only');
assert.equal(unknownChanged.error, 'record.edit.continuity-shell.changed');

console.log('✓ M4-A local draft Edit lossless shell authority closure tests passed');

function sourceTopic() {
  return {
    id: 'source-topic', title: 'Source Topic', summary: 'Source-backed Topic parent.', kind: 'tiinex.topic.v1', schemaId: 'tiinex.topic.v1', status: 'loaded', createdAt: '2026-08-14', path: '.topics/source-topic.trace.md', sourceMode: 'source-backed', source: { id: 'github:owner-repo:main:topics', kind: 'github-tree', adapterId: 'github', repo: 'Owner/Repo', ref: 'main' },
    markdown: ['# Continuity Context','','- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)','- Parent','  - Parent Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)','  - Created At: 2026-08-14','  - Trace: root','  - Boundary: source-backed github material','- Current','  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)','  - Created At: 2026-08-14','  - Summary: Source-backed Topic parent.','  - Status: active','  - Why: Fixture','','---','','# Source Topic','','Topic body with enough readable material for Continue.','','# Continuity Integrity','','- Fixture','  - Value: stable'].join('\n')
  };
}
function sourceRecordState(state, workspaceId, record) { const next = structuredClone(state); const workspace = next.workspaces.find((item) => item.id === workspaceId); workspace.records = [structuredClone(record), ...(workspace.records || []).filter((item) => item.id !== record.id)]; return next; }
