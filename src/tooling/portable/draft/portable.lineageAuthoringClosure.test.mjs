import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createPortableLocalDraft } from './draft.create.js';
import { createPortableLocalArtifactSet } from './draft.set.js';
import { processPortableLiveTurn } from '../live/live.lineage.js';

const ROOT_SCHEMA_REFERENCE = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const TASK_SCHEMA_REFERENCE = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const taskSchemaReferences = Object.freeze({
  envelope: Object.freeze({ schemaId: 'tiinex.root.v1', preferredTarget: ROOT_SCHEMA_REFERENCE, resolutionState: 'qualified' }),
  current: Object.freeze({ schemaId: 'tiinex.task.v1', preferredTarget: TASK_SCHEMA_REFERENCE, resolutionState: 'qualified' })
});

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
    schemaReferences: taskSchemaReferences,
    values: taskValues
  }
];
const set = createPortableLocalArtifactSet({ proposals }, { createdAt: '2026-08-21T15:32:00.000Z' });
assert.equal(set.status, 'created-local-continuity', 'unpublished local Parent must carry relative continuity without forcing publication');
assert.equal(set.artifacts.length, 2);
const [setRoot, setChild] = set.artifacts;
assert.equal(setRoot.draft.id, 'dogfood-root-topic');
assert.equal(setRoot.draft.path, rootPath);
assert.notEqual(setRoot.draft.id, setRoot.draft.path, 'logical id must not be replaced by repository path');
assert.equal(setRoot.draft.creationMode, 'exact-site-creation-contract');
assert.equal(setRoot.validation.status, 'clean');
assert(setChild.draft, 'unpublished local Parent must remain authorable through exact relative continuity representation');
assert.equal(setChild.qualification?.parentAuthorityQualification, 'qualified-local-continuity');
assert.equal(setChild.qualification?.parentAuthorityReason, 'continuation-parent-browse-git-root-contract-conflict');
assert.equal(setChild.qualification?.localContinuityUsable, true);
assert.equal(setChild.qualification?.exactCreateToolingApplied, false);
assert.equal(setChild.qualification?.exactRuntimeValidation, false);
assert(setChild.draft.markdown.includes(`  - Current Schema: [tiinex.task.v1](${TASK_SCHEMA_REFERENCE})`), 'local continuity preserves the caller-qualified external child schema reference');
assert(setChild.draft.markdown.includes('  - Trace: [dogfood-root-topic.trace.md](dogfood-root-topic.trace.md)'), 'local continuity uses a real relative Parent Trace');
assert(setChild.draft.markdown.includes('  - Origin:\n    - [relative](dogfood-root-topic.trace.md)'), 'local continuity keeps a labelled relative Origin');
assert.equal(setChild.draft.markdown.includes('[browse + git]'), false, 'unpublished local Parent must not fabricate browse + git authority');
assert(set.findings.some((finding) => finding.code === 'portable.draft-create.parent.root-browse-git-authority-conflict'), 'set must expose the Root browse + git exactness conflict without forcing publication');
assert.equal(JSON.stringify(set).includes('record:dogfood-root-topic'), false, 'v475 must not restore record:<id> as Root Trace authority');
assert.equal(JSON.stringify(set).includes('github.com/Tiinex/site/blob/'), false, 'v475 must not fabricate a browse + git permalink for the unpublished local Parent');

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
      schemaReferences: taskSchemaReferences,
      values: { ...taskValues, Summary: 'Live portable child' }
    }
  ]
}, { clock: () => '2026-08-21T15:40:00.000Z' });
assert.equal(live.status, 'processed-with-artifact-change');
assert.equal(live.state.artifacts.length, 2, 'same-turn local lineage may retain root and child without a publication interlock');
const liveChild = live.state.artifacts.find((artifact) => artifact.id === 'live-child');
assert(liveChild?.draft?.markdown.includes('  - Trace: [live-root.trace.md](live-root.trace.md)'), 'live child must preserve a real relative Parent Trace');
assert(liveChild?.draft?.markdown.includes('  - Origin:\n    - [relative](live-root.trace.md)'), 'live child must preserve labelled relative Origin');
assert.equal(liveChild?.draft?.markdown.includes('[browse + git]'), false, 'live child must not fabricate publication authority');
assert.equal(liveChild?.qualification?.localContinuityUsable, true);
assert.equal(liveChild?.qualification?.exactRuntimeValidation, false, 'Root browse + git conflict prevents exact qualification even though local continuity is usable');
assert.equal(liveChild?.exportReady, false, 'authority-conflicted local continuity must not be export-ready as an exact artifact');
assert.equal(JSON.stringify(live).includes('record:live-root'), false, 'live path must not synthesize record:<id> Trace authority');
assert.equal(JSON.stringify(live).includes('github.com/Tiinex/site/blob/'), false, 'live path must not synthesize a browse + git Parent authority');

console.log('✓ v471 portable lineage authoring closure preserved under v475 acceptance correction: unpublished same-set/live Parents carry relative continuity without fabricated publication, while exact Root qualification remains false');
