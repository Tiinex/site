import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { createPortableLocalDraft } from './draft.create.js';
import { createPortableLocalArtifactSet } from './draft.set.js';
import { processPortableLiveTurn } from '../live/live.lineage.js';

const rootValues = {
  Summary: 'Portable lineage authoring root',
  'Current Read': 'Built-in root creation must use the registered Site creation contract without inventing a Parent.',
  'Design Direction': 'Keep logical lineage identity separate from repository path.',
  'Next Artifacts': 'Continue with an exact Task child.'
};
const taskValues = {
  Summary: 'Portable lineage dogfood child',
  Objective: 'Prove exact continuation through the registered Task creation contract.',
  'Done Criteria': 'Parent Trace uses the logical id and Origin preserves the exact parent path.',
  Scope: 'Portable authoring and live-lineage closure only.',
  Dependencies: 'The exact preceding Topic artifact.'
};

const root = createPortableLocalDraft({
  schemaId: 'tiinex.topic.v1',
  id: 'logical-root',
  path: '.topics/development/tooling/dogfood/generated/logical-root.trace.md',
  title: 'Portable lineage authoring root',
  summary: rootValues.Summary,
  values: rootValues,
  createdAt: '2026-08-21T15:30:00.000Z'
});
assert.equal(root.status, 'created-clean');
assert.equal(root.draft.creationMode, 'exact-site-creation-contract');
assert.equal(root.qualification.exactCreateToolingApplied, true);
assert.equal(root.validation.qualification.exactRuntimeValidation, true);
assert.equal(root.draft.id, 'logical-root');
assert.equal(root.draft.markdown.includes('- Parent\n'), false, 'root exact creation must not invent Parent');
assert.equal(root.draft.markdown.includes('This topic captures the current direction for Portable lineage authoring root.'), true, 'Topic exact renderer must own its required shape');

const unknown = createPortableLocalDraft({
  schemaId: 'tiinex.experimental.no-material.v1',
  title: 'Unknown schema draft',
  summary: 'Unknown schema draft',
  values: { Statement: 'No built-in semantics may be guessed.' },
  createdAt: '2026-08-21T15:30:00.000Z'
});
assert.equal(unknown.status, 'blocked');
assert.equal(unknown.draft, null);
assert.equal(unknown.qualification.exactCreateToolingAvailable, false);
assert(unknown.findings.some((finding) => finding.code === 'portable.draft-create.schema-material.required'), 'unknown/custom schema must still require explicit readable material');

const rootPath = '.topics/development/tooling/dogfood/generated/dogfood-root-topic.trace.md';
const childPath = '.topics/development/tooling/dogfood/generated/dogfood-child-task.trace.md';
const proposals = [
  {
    id: 'dogfood-root-topic',
    schemaId: 'tiinex.topic.v1',
    path: rootPath,
    title: 'Portable lineage dogfood root',
    summary: 'Portable lineage dogfood root',
    rationale: 'Exercise exact built-in root creation through the portable artifact-set surface.',
    evidenceRefs: ['task:v471-portable-lineage-authoring-closure'],
    createdAt: '2026-08-21T15:31:00.000Z',
    values: {
      Summary: 'Portable lineage dogfood root',
      'Current Read': 'The portable authoring seam creates the built-in root without a Parent.',
      'Design Direction': 'Use the registered Site creation renderer directly.',
      'Next Artifacts': 'Continue with a Task child whose Parent is the logical root id.'
    }
  },
  {
    id: 'dogfood-child-task',
    schemaId: 'tiinex.task.v1',
    parentRef: 'proposal:dogfood-root-topic',
    path: childPath,
    title: 'Portable lineage dogfood child',
    summary: 'Portable lineage dogfood child',
    rationale: 'Exercise exact continue-from-record semantics in the same portable artifact set.',
    evidenceRefs: ['task:v471-portable-lineage-authoring-closure'],
    createdAt: '2026-08-21T15:32:00.000Z',
    values: taskValues
  }
];
const set = createPortableLocalArtifactSet({ proposals }, { createdAt: '2026-08-21T15:32:00.000Z' });
assert.equal(set.status, 'created-clean');
assert.equal(set.artifacts.length, 2);
const [setRoot, setChild] = set.artifacts;
assert.equal(setRoot.draft.id, 'dogfood-root-topic');
assert.equal(setRoot.draft.path, rootPath);
assert.notEqual(setRoot.draft.id, setRoot.draft.path, 'logical id must not be replaced by repository path');
assert.equal(setRoot.draft.creationMode, 'exact-site-creation-contract');
assert.equal(setChild.draft.creationMode, 'exact-site-creation-contract');
assert.equal(setChild.validation.status, 'clean');
assert(Buffer.byteLength(setChild.draft.markdown) > 0, 'child Markdown must be non-empty');
const parsedChild = parseArtifactMarkdown(setChild.draft.markdown);
assert.equal(parsedChild.envelope.parent.trace, 'record:dogfood-root-topic');
assert.equal(parsedChild.envelope.parent.origin, rootPath);
assert.notEqual(parsedChild.envelope.parent.trace, '../dogfood-root-topic.trace.md');
assert(set.lineageClosure.edges.some((edge) => edge.childPath === childPath && edge.parentPath === rootPath && edge.parentKind === 'created-in-set'), 'artifact set must expose the created lineage edge');

const lineageRecords = [setRoot.draft, setChild.draft].map((draft) => Object.assign(
  createRecordFromMarkdown(draft.markdown, { path: draft.path }),
  { id: draft.id, path: draft.path, sourceMode: draft.sourceMode }
));
const lineage = resolveLineage(lineageRecords, { depth: 'v471-portable-authoring-closure' });
assert(lineage.edges.some((edge) => edge.from === 'dogfood-root-topic' && edge.to === 'dogfood-child-task' && edge.kind === 'parent'), 'shared lineage resolver must resolve the logical record:<id> edge');

const userMessage = 'Create a portable Topic root and a Task child in one live lineage turn.';
const live = processPortableLiveTurn({
  sessionId: 'v471-live-lineage-authoring',
  turn: {
    id: 'dialogue:v471-live-1',
    sequence: 1,
    userMessage,
    messageSha256: createHash('sha256').update(userMessage).digest('hex'),
    summary: 'Create one exact root and child through live lineage.'
  },
  changes: [
    {
      action: 'upsert',
      id: 'live-root',
      schemaId: 'tiinex.topic.v1',
      path: '.topics/development/tooling/dogfood/generated/live-root.trace.md',
      title: 'Live portable root',
      summary: 'Live portable root',
      evidenceRefs: ['dialogue:v471-live-1'],
      allowIncomplete: false,
      values: { ...rootValues, Summary: 'Live portable root' }
    },
    {
      action: 'upsert',
      id: 'live-child',
      schemaId: 'tiinex.task.v1',
      parentRef: 'live:live-root',
      path: '.topics/development/tooling/dogfood/generated/live-child.trace.md',
      title: 'Live portable child',
      summary: 'Live portable child',
      evidenceRefs: ['dialogue:v471-live-1'],
      allowIncomplete: false,
      values: { ...taskValues, Summary: 'Live portable child' }
    }
  ]
}, { clock: () => '2026-08-21T15:40:00.000Z' });
assert.equal(live.status, 'processed-with-artifact-change');
assert.equal(live.findings.some((finding) => finding.severity === 'error'), false);
const liveRoot = live.state.artifacts.find((artifact) => artifact.id === 'live-root');
const liveChild = live.state.artifacts.find((artifact) => artifact.id === 'live-child');
assert.equal(liveRoot?.draft?.creationMode, 'exact-site-creation-contract');
assert.equal(liveRoot?.draft?.markdown?.includes('- Parent\n'), false);
assert.equal(liveChild?.draft?.creationMode, 'exact-site-creation-contract');
assert.equal(liveChild?.exportReady, true);
const parsedLiveChild = parseArtifactMarkdown(liveChild?.draft?.markdown || '');
assert.equal(parsedLiveChild.envelope.parent.trace, 'record:live-root');
assert.equal(parsedLiveChild.envelope.parent.origin, '.topics/development/tooling/dogfood/generated/live-root.trace.md');

console.log('✓ v471 portable lineage authoring closure: exact root, child continuation, logical identity, lineage resolution, live lineage, and custom-schema fail-closed passed');
