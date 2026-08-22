import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { runPortableOperation } from '../operation.catalog.js';
import { createPortableLocalDraft } from './draft.create.js';

const topicValues = {
  Summary: 'Exact  values   only',
  'Current Read': 'Read  with   repeated whitespace.',
  'Design Direction': 'Preserve  caller  bytes.',
  'Next Artifacts': 'Continue without synthesized convenience values.'
};
const PARENT_SCHEMA_REFERENCE = 'https://archive.example.test/schemas/tiinex.topic.v1.schema.md';
const PARENT_PUBLISHED_REFERENCE = 'https://archive.example.test/artifacts/p.trace.md';
const qualifiedParent = (extra = {}) => ({ id: 'parent-A', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1', publishedReference: { target: PARENT_PUBLISHED_REFERENCE, state: 'qualified' }, schemaReferenceAuthority: { schemaId: 'tiinex.topic.v1', preferredTarget: PARENT_SCHEMA_REFERENCE, resolutionState: 'qualified' }, ...extra });

const taskValues = {
  Summary: 'Exact  task   values',
  Objective: 'Preserve  exact   objective text.',
  'Done Criteria': 'Exact values survive generic portable authoring.',
  Scope: 'Portable exact authoring only.',
  Dependencies: 'Qualified parent identity only.'
};

const operationTopic = await runPortableOperation('create-local-draft', { schemaId: 'tiinex.topic.v1', values: topicValues, createdAt: '2026-08-21T16:19:00.000Z' });
assert.equal(operationTopic.status, 'created-clean');
assert.equal(operationTopic.qualification.exactCreateToolingApplied, true);
assert(operationTopic.draft.markdown.includes('  - Created At: 2026-08-21 16:19:00'));

const topic = createPortableLocalDraft({ schemaId: 'tiinex.topic.v1', values: topicValues, createdAt: '2026-08-21T16:20:00.000Z' });
assert.equal(topic.status, 'created-clean');
assert.equal(topic.qualification.exactCreateToolingApplied, true);
assert.equal(topic.qualification.exactCreationResultQualification, 'qualified');
assert.equal(topic.draft.creationMode, 'exact-site-creation-contract');
assert(topic.draft.markdown.includes('  - Summary: Exact  values   only'));
assert(topic.draft.markdown.includes('# Exact  values   only'));
assert(topic.draft.markdown.includes('Read  with   repeated whitespace.'));

const longSummary = `Long exact summary ${'x'.repeat(180)}  tail`;
const longTopic = createPortableLocalDraft({ schemaId: 'tiinex.topic.v1', values: { ...topicValues, Summary: longSummary }, createdAt: '2026-08-21T16:20:30.000Z' });
assert.equal(longTopic.status, 'created-clean');
assert(longTopic.draft.markdown.includes(`  - Summary: ${longSummary}`), 'exact Summary must not inherit portable convenience truncation');
assert(longTopic.draft.markdown.includes(`# ${longSummary}`));

const taskRoot = createPortableLocalDraft({ schemaId: 'tiinex.task.v1', values: taskValues, createdAt: '2026-08-21T16:21:00.000Z' });
assert.equal(taskRoot.status, 'created-clean');
assert.equal(taskRoot.qualification.exactCreateToolingApplied, true);
assert(taskRoot.draft.markdown.includes('Objective\n\nPreserve  exact   objective text.'));

const badOneLine = createPortableLocalDraft({ schemaId: 'tiinex.topic.v1', values: { ...topicValues, Summary: ' leading-space-is-not-representable' }, createdAt: '2026-08-21T16:22:00.000Z' });
assert.equal(badOneLine.status, 'blocked');
assert.equal(badOneLine.draft, null);
assert.equal(badOneLine.qualification.exactCreateToolingApplied, false);
assert.equal(badOneLine.qualification.exactCreationResultQualification, 'unqualified');
assert(badOneLine.findings.some((finding) => finding.code === 'portable.draft-create.exact-result.unqualified'));

const contradictory = createPortableLocalDraft({
  schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record', values: taskValues, title: taskValues.Summary, summary: taskValues.Summary,
  parentRecord: { id: 'parent-A', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1', continuationTrace: 'record:parent-B' },
  createdAt: '2026-08-21T16:23:00.000Z'
});
assert.equal(contradictory.status, 'blocked');
assert.equal(contradictory.draft, null);
assert.equal(contradictory.qualification.exactCreateToolingApplied, false);
assert(contradictory.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-legacy-trace-not-authority')); 

const kindOnly = createPortableLocalDraft({
  schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record', values: taskValues, title: taskValues.Summary, summary: taskValues.Summary,
  parentRecord: { id: 'parent-A', path: '.topics/p.trace.md', kind: 'tiinex.topic.v1' },
  createdAt: '2026-08-21T16:24:00.000Z'
});
assert.equal(kindOnly.status, 'blocked');
assert.equal(kindOnly.draft, null);
assert.equal(kindOnly.qualification.exactCreateToolingApplied, false);
assert(kindOnly.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-schema-required'));

const coherent = createPortableLocalDraft({
  schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record', values: taskValues,
  parentRecord: qualifiedParent(),
  createdAt: '2026-08-21T16:25:00.000Z'
});
assert.equal(coherent.status, 'created-clean');
assert.equal(coherent.qualification.exactCreateToolingApplied, true);
const parsedChild = parseArtifactMarkdown(coherent.draft.markdown);
assert.equal(parsedChild.envelope.parent.trace.startsWith('record:'), false);
assert.equal(parsedChild.envelope.parent.schema.id, 'tiinex.topic.v1');
assert.equal(parsedChild.envelope.parent.schema.target, PARENT_SCHEMA_REFERENCE);
assert(parsedChild.envelope.parent.originEntries.some((entry) => entry.label === 'browse + git' && entry.target === PARENT_PUBLISHED_REFERENCE));

const tmp = await mkdtemp(path.join(os.tmpdir(), 'tiinex-v472-exact-authoring-'));
try {
  const valuesPath = path.join(tmp, 'topic-values.json');
  const outputPath = path.join(tmp, 'topic.trace.md');
  await writeFile(valuesPath, `${JSON.stringify(topicValues, null, 2)}\n`, 'utf8');
  const lines = [];
  const code = await runPortableCli([
    'create-local-draft', '--schema', 'tiinex.topic.v1', '--values', valuesPath,
    '--created-at', '2026-08-21T16:26:00.000Z', '--output', outputPath, '--compact'
  ], { log(value) { lines.push(value); }, error(value) { lines.push(value); } });
  assert.equal(code, 0, lines.join('\n'));
  const cliResult = JSON.parse(lines.at(-1));
  assert.equal(cliResult.status, 'created-clean');
  assert.equal(cliResult.qualification.exactCreateToolingApplied, true);
  const cliMarkdown = await readFile(outputPath, 'utf8');
  assert(cliMarkdown.includes('  - Created At: 2026-08-21 16:26:00'));
  assert(cliMarkdown.includes('  - Summary: Exact  values   only'));
  assert(cliMarkdown.includes('Read  with   repeated whitespace.'));
} finally {
  await rm(tmp, { recursive: true, force: true });
}

console.log('✓ v472 portable exact authoring fidelity closure: values-only CLI, exact value fidelity, coherent Parent identity, kind-only authority blocking, and exact result truth passed');
