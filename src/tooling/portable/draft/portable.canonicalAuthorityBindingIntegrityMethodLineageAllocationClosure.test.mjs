import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildArtifactCreationContract, validateArtifactCreationResult } from '../../../schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../../../schemas/creation.renderer.js';
import { qualifyCreationSchemaReferences } from '../../../schemas/creation.schemaReferences.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { allocateContinuationPath } from '../../../transitions/record.transitions.js';
import { prepareEpistemicMaterialization } from '../materialization/epistemic.plan.js';
import { processPortableLiveTurn } from '../live/live.lineage.js';

const ROOT = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const TASK = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const ROOT_SHA = '0868fbc1c5e3501e0994ea8feaa22f50d59877fff447f73a60f2bffbc64324a1';
const TASK_SHA = 'ff26811ac5c4393bc6b69d652f0b9fcdb38c2bdc9688dccb0b42608cbef07a98';
const values = Object.freeze({
  Summary: 'v476 authority binding fixture',
  Objective: 'Bind exact references to exact semantic material.',
  'Done Criteria': 'Schema material, method reference, and lineage allocation remain coherent.',
  Scope: 'Shared creation and portable path ownership only.',
  Dependencies: 'Qualified authority remains explicit.'
});

const canonical = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1' });
assert.equal(canonical.status, 'ready');
assert.equal(canonical.schemaReferences.envelope.preferredTarget, ROOT);
assert.equal(canonical.schemaReferences.current.preferredTarget, TASK);
assert.equal(canonical.schemaReferences.envelope.semanticMaterialIdentity.sha256, ROOT_SHA);
assert.equal(canonical.schemaReferences.current.semanticMaterialIdentity.sha256, TASK_SHA);
assert.equal(canonical.schemaReferences.envelope.resolutionState, 'qualified');
assert.equal(canonical.schemaReferences.current.resolutionState, 'qualified');
assert.equal(canonical.integrityMethodReferences.primarySelf.preferredTarget, C14N_V2_VALIDATOR_TARGET);

const canonicalMarkdown = renderArtifactCreationDraftMarkdown(canonical, { values, createdAt: '2026-08-21 21:00:00' });
assert(canonicalMarkdown.includes(`- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})`));
assert.equal(canonicalC14nV2SelfState(canonicalMarkdown).state, 'verified');
assert.equal(qualifyCreationSchemaReferences(canonicalMarkdown, canonical).state, 'qualified');

const ALTERNATE_TASK = 'https://cache.example.test/exact/task-v1.schema.md';
const equivalent = buildArtifactCreationContract({
  schemaId: 'tiinex.task.v1',
  schemaReferences: {
    current: {
      schemaId: 'tiinex.task.v1', preferredTarget: ALTERNATE_TASK, exactTargets: [ALTERNATE_TASK], resolutionState: 'qualified',
      resolutionEvidence: { state: 'qualified', target: ALTERNATE_TASK, materialIdentity: { state: 'qualified', sha256: TASK_SHA, bytes: 7332 } }
    }
  }
});
const equivalentMarkdown = renderArtifactCreationDraftMarkdown(equivalent, { values, createdAt: '2026-08-21 21:01:00' });
assert(equivalentMarkdown.includes(`  - Current Schema: [tiinex.task.v1](${ALTERNATE_TASK})`), 'resolved local/cache material must not replace the caller-supplied external reference');
assert.equal(qualifyCreationSchemaReferences(equivalentMarkdown, equivalent).state, 'qualified', 'byte-equivalent material may qualify an alternate exact representation');

for (const [name, current] of [
  ['different material A/B', { schemaId: 'tiinex.task.v1', preferredTarget: 'https://archive.example.test/schema-A', exactTargets: ['https://archive.example.test/schema-A'], resolutionState: 'qualified', resolutionEvidence: { state: 'qualified', target: 'https://archive.example.test/schema-A', materialIdentity: { state: 'qualified', sha256: '0'.repeat(64), bytes: 7332 } } }],
  ['stale same-schema-id material', { schemaId: 'tiinex.task.v1', preferredTarget: 'https://archive.example.test/stale-task', exactTargets: ['https://archive.example.test/stale-task'], resolutionState: 'qualified', resolutionEvidence: { state: 'qualified', target: 'https://archive.example.test/stale-task', materialIdentity: { state: 'qualified', sha256: '1'.repeat(64), bytes: 7332 } } }],
  ['missing resolver', { schemaId: 'tiinex.task.v1', preferredTarget: 'https://archive.example.test/unresolved-task', exactTargets: ['https://archive.example.test/unresolved-task'], resolutionState: 'unresolved' }]
]) {
  const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', schemaReferences: { current } });
  assert.equal(contract.schemaReferences.current.preferredTarget, current.preferredTarget, `${name}: declared external reference must be retained`);
  const markdown = renderArtifactCreationDraftMarkdown(contract, { values, createdAt: '2026-08-21 21:02:00' });
  const qualification = qualifyCreationSchemaReferences(markdown, contract);
  assert.equal(qualification.state, 'unavailable', `${name} must fail exact schema-reference/material coherence`);
}

const noMaintainedMethod = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', integrityMethodReference: false });
const plainMethodMarkdown = renderArtifactCreationDraftMarkdown(noMaintainedMethod, { values, createdAt: '2026-08-21 21:03:00' });
assert(plainMethodMarkdown.includes('\n- sha256-base64url-c14n-v2\n'), 'plain method identifier remains representable only when no qualified maintained method target is available');
assert.equal(canonicalC14nV2SelfState(plainMethodMarkdown).state, 'verified');
const plainValidation = validateArtifactCreationResult({ schemaId: 'tiinex.task.v1', status: 'local', sourceMode: 'local-v476-method-unavailable', markdown: plainMethodMarkdown, path: '.topics/v476-method-unavailable.trace.md' }, {}, { contract: noMaintainedMethod });
assert.equal(plainValidation.ok, true);

const parent = Object.freeze({ id: 'v475-task', path: '.topics/development/tooling/dogfood/002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md', schemaId: 'tiinex.task.v1', currentCreatedAt: '2026-08-21 18:57:00', title: 'v475 task' });
const first = allocateContinuationPath({ parentRecord: parent, targetId: 'tiinex.task.v1', targetLabel: 'Task', title: 'v475 canonical result' }, { existingPaths: [parent.path] });
assert(first.path.includes('/002-1-'), first.path);
const second = allocateContinuationPath({ parentRecord: parent, targetId: 'tiinex.task.v1', targetLabel: 'Task', title: 'v475 canonical result' }, { existingPaths: [parent.path, first.path] });
assert(second.path.includes('/002-2-'), second.path);

const parentRecord = {
  ...parent,
  hasContinuityContext: true,
  publishedReference: { target: 'https://github.com/Tiinex/site/blob/32c7c291101b2a6a72c12241f3107d4a56af81fc/.topics/development/tooling/dogfood/002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md', state: 'qualified' },
  schemaReferenceAuthority: { schemaId: 'tiinex.task.v1', preferredTarget: TASK, exactTargets: [TASK], resolutionState: 'qualified' }
};
const plan = prepareEpistemicMaterialization({
  records: [parentRecord],
  proposals: [{
    id: 'v475-result', schemaId: 'tiinex.task.v1', parentRef: 'v475-task', title: 'v475 canonical result',
    rationale: 'Canonical child allocation must extend the Parent dimension.', evidenceRefs: ['v475-task'], values
  }]
});
assert.equal(plan.status, 'ready');
assert(plan.proposals[0].path.includes('/002-1-'), `artifact-set planner must reuse canonical continuation allocation: ${plan.proposals[0].path}`);

const userMessage = 'Create a dimensioned live continuation.';
const live = processPortableLiveTurn({
  sessionId: 'v476-live-allocation', records: [parentRecord],
  turn: { id: 'dialogue:v476-live', sequence: 1, userMessage, messageSha256: createHash('sha256').update(userMessage).digest('hex'), summary: userMessage },
  changes: [{ action: 'upsert', id: 'live-v475-child', schemaId: 'tiinex.task.v1', parentRef: 'loaded:v475-task', title: 'v475 live child', evidenceRefs: ['loaded:.topics/development/tooling/dogfood/002-site-tooling-v475-canonical-artifact-envelope-reference-integrity-validation-closure.trace.md'], allowIncomplete: false, values: { ...values, Summary: 'v475 live child' } }]
}, { clock: () => '2026-08-21T21:04:00.000Z' });
assert.equal(live.status, 'processed-with-artifact-change');
const liveChild = live.state.artifacts.find((artifact) => artifact.id === 'live-v475-child');
assert(liveChild.path.includes('/002-1-'), `live authoring must reuse canonical continuation allocation: ${liveChild.path}`);

console.log('✓ v476 canonical authority binding + maintained integrity method reference + dimensioned continuation allocation closure passed');
