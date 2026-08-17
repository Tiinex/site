import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { createContinuationDraft } from '../transitions/record.transitions.js';
import { runLocalDraftUpdateCommand } from '../app/localDraftMutationCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const base = lifecycle.makeEmptyAppState();
const created = lifecycle.createWorkspace(base, { name: 'Continuity Edit' }, { clock: () => '2026-08-15T08:20:00.000Z' });
const workspaceId = created.workspace.id;
const topic = sourceTopic();
const sourceState = sourceRecordState(created.state, workspaceId, topic);
const draft = createContinuationDraft(topic, { id: 'tiinex.task.v1', label: 'Task' }, { title: 'Draft task', summary: 'Initial task summary.' }, { clock: () => '2026-08-15T08:21:00.000Z' });
const added = lifecycle.addWorkspaceRecord(sourceState, workspaceId, draft);
assert.equal(added.ok, true);
const original = added.record;
const before = parseArtifactMarkdown(original.markdown);

const ordinaryMarkdown = original.markdown
  .replace('# Draft task', '# Edited task')
  .replace('Initial task summary.', 'Edited task summary.')
  .replace('Review and refine this task draft before export/publication.', 'Review the edited task before export/publication.');
const ordinary = runLocalDraftUpdateCommand({ lifecycle, state: added.state, workspaceId, recordId: original.id, candidate: { markdown: ordinaryMarkdown } });
assert.equal(ordinary.ok, true, ordinary.notice || ordinary.error);
assert.equal(ordinary.record.title, 'Edited task');
assert.equal(ordinary.record.summary, 'Edited task summary.');
assert.equal(parseArtifactMarkdown(ordinary.record.markdown).envelope.current.status, before.envelope.current.status);
assert.equal(parseArtifactMarkdown(ordinary.record.markdown).envelope.current.why, before.envelope.current.why);
assert.equal(parseArtifactMarkdown(ordinary.record.markdown).hasIntegrity, true);
assert.equal(ordinary.record.hasIntegrity, original.hasIntegrity);
assert.equal(ordinary.record.hasContinuityContext, original.hasContinuityContext);

const mutations = [
  ['continuity context removal', (m) => m.replace('# Continuity Context\n', '')],
  ['integrity removal', (m) => m.replace(/\n# Continuity Integrity[\s\S]*$/, '')],
  ['envelope schema drift', (m) => m.replace('Envelope Schema: [tiinex.root.v1]', 'Envelope Schema: [tiinex.root.v2]')],
  ['parent created at drift', (m) => m.replace(`Created At: ${before.envelope.parent.createdAt}`, 'Created At: 2099-01-01T00:00:00.000Z')],
  ['current status drift', (m) => m.replace(`Status: ${before.envelope.current.status}`, 'Status: published')],
  ['current why drift', (m) => m.replace(`Why: ${before.envelope.current.why}`, 'Why: Published elsewhere')],
  ['integrity value drift', (m) => m.replace('Value: pending-publication-or-export', 'Value: forged')]
];
for (const [label, mutate] of mutations) {
  const result = runLocalDraftUpdateCommand({ lifecycle, state: added.state, workspaceId, recordId: original.id, candidate: { markdown: mutate(ordinaryMarkdown) } });
  assert.equal(result.ok, false, `${label} must be refused`);
  assert.equal(result.error, 'record.edit.continuity-shell.changed', `${label} is owned by continuity shell`);
}

const emptySummaryMarkdown = original.markdown.replace('Summary: Initial task summary.', 'Summary:');
const emptySummary = runLocalDraftUpdateCommand({ lifecycle, state: added.state, workspaceId, recordId: original.id, candidate: { markdown: emptySummaryMarkdown } });
assert.equal(emptySummary.ok, false, 'empty Task Summary is refused rather than silently restoring old record truth');
assert.equal(emptySummary.error, 'record.edit.summary.required');

console.log('✓ M4-A local draft Edit continuity truth closure tests passed');

function sourceTopic() {
  return {
    id: 'source-topic', title: 'Source Topic', summary: 'Source-backed Topic parent.', kind: 'tiinex.topic.v1', schemaId: 'tiinex.topic.v1', status: 'loaded', createdAt: '2026-08-14', path: '.topics/source-topic.trace.md', sourceMode: 'source-backed', source: { id: 'github:owner-repo:main:topics', kind: 'github-tree', adapterId: 'github', repo: 'Owner/Repo', ref: 'main' },
    markdown: ['# Continuity Context','','- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)','- Parent','  - Parent Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)','  - Created At: 2026-08-14','  - Trace: root','  - Boundary: source-backed github material','- Current','  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)','  - Created At: 2026-08-14','  - Summary: Source-backed Topic parent.','  - Status: active','  - Why: Fixture','','---','','# Source Topic','','Topic body with enough readable material for Continue.','','# Continuity Integrity','','- Fixture','  - Value: stable'].join('\n')
  };
}
function sourceRecordState(state, workspaceId, record) { const next = structuredClone(state); const workspace = next.workspaces.find((item) => item.id === workspaceId); workspace.records = [structuredClone(record), ...(workspace.records || []).filter((item) => item.id !== record.id)]; return next; }
