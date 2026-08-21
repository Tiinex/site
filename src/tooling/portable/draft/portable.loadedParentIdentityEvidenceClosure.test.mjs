import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPortableLocalArtifactSet } from './draft.set.js';
import { prepareEpistemicMaterialization } from '../materialization/epistemic.plan.js';
import { materializeLiveArtifact } from '../live/live.artifact.js';

const values = Object.freeze({
  Summary: 'Loaded Parent identity evidence closure',
  Objective: 'Preserve exact loaded Parent identity and evidence.',
  'Done Criteria': 'Relationship targets never become child identity aliases and contradictory Parent metadata fails closed.',
  Scope: 'Portable loaded Parent continuation only.',
  Dependencies: 'Exact supplied loaded material.'
});
const childCreatedAt = '2026-08-21T17:30:00.000Z';
const canonicalCreatedAt = '2026-08-21 16:34:00';
const alternateCreatedAt = '2026-08-21 16:35:00';
const taskPath = '.topics/development/tooling/dogfood/001-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure.trace.md';
const resultPath = '.topics/development/tooling/dogfood/001-1-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure-result.trace.md';

function proposal(parentRef, id = 'loaded-child') {
  return {
    id,
    schemaId: 'tiinex.task.v1',
    title: values.Summary,
    summary: values.Summary,
    parentRef,
    path: `.topics/development/tooling/dogfood/${id}.trace.md`,
    rationale: 'Pressure exact loaded Parent identity and evidence without rewriting it.',
    evidenceRefs: [String(parentRef)],
    values,
    createdAt: childCreatedAt
  };
}

// Real dogfood pair: the result declares Parent Trace toward the task. That relationship target
// must not index the result under the task's identity and make exact task selection ambiguous.
const realFiles = await Promise.all([taskPath, resultPath].map(async (path) => ({ path, content: await readFile(path, 'utf8') })));
const realSet = createPortableLocalArtifactSet({ files: realFiles, proposals: [proposal(taskPath, 'real-v473-child')] });
assert.equal(realSet.status, 'created-clean');
assert.equal(realSet.plan.proposals[0].parentKind, 'loaded-record');
assert.equal(realSet.plan.proposals[0].parent.id, taskPath);
assert.equal(realSet.plan.proposals[0].parent.path, taskPath);
assert.equal(realSet.plan.proposals[0].parent.currentCreatedAt, canonicalCreatedAt);
assert.equal(realSet.plan.proposals[0].parent.createdAt, '');
assert.equal(realSet.artifacts[0].qualification.parentAuthorityQualification, 'qualified');
assert.equal(realSet.artifacts[0].qualification.exactRuntimeValidation, true);
assert(!realSet.findings.some((finding) => finding.code === 'portable.materialization.parent.ambiguous'));

// Exact loaded id/path identity: internal or surrounding whitespace in the caller reference
// is not normalized into the same logical record.
const exactRecord = Object.freeze({
  id: 'parent  A',
  path: '.topics/a  b.trace.md',
  schemaId: 'tiinex.topic.v1',
  currentCreatedAt: canonicalCreatedAt,
  hasContinuityContext: true,
  sourceMode: 'portable-local'
});
function planFor(ref) {
  return prepareEpistemicMaterialization({ records: [exactRecord], proposals: [proposal(ref, 'identity-child')] });
}
const exactIdPlan = planFor('parent  A');
assert.equal(exactIdPlan.status, 'ready');
assert.equal(exactIdPlan.proposals[0].parent.id, 'parent  A');
assert.equal(exactIdPlan.proposals[0].parent.path, '.topics/a  b.trace.md');
const exactPathPlan = planFor('.topics/a  b.trace.md');
assert.equal(exactPathPlan.status, 'ready');
for (const near of ['parent A', ' parent  A', 'parent  A ', '.topics/a b.trace.md', ' .topics/a  b.trace.md', '.topics/a  b.trace.md ']) {
  const plan = planFor(near);
  assert.equal(plan.status, 'blocked', near);
  assert.equal(plan.proposals[0].parent, null, near);
  assert(plan.proposals[0].findings.some((finding) => finding.code === 'portable.materialization.parent.missing'), near);
}

// Temporal evidence remains separate through loaded projection. Contradictory non-empty
// candidates fail exact Parent qualification; one candidate or exactly equal candidates qualify.
function loadedTemporalSet(record) {
  return createPortableLocalArtifactSet({
    records: [{
      id: 'temporal-parent', path: '.topics/temporal-parent.trace.md', schemaId: 'tiinex.topic.v1', hasContinuityContext: true,
      ...record
    }],
    proposals: [proposal('temporal-parent', 'temporal-child')]
  });
}
const contradictory = loadedTemporalSet({ currentCreatedAt: canonicalCreatedAt, createdAt: alternateCreatedAt });
assert.equal(contradictory.status, 'blocked');
assert.equal(contradictory.plan.proposals[0].parent.currentCreatedAt, canonicalCreatedAt);
assert.equal(contradictory.plan.proposals[0].parent.createdAt, alternateCreatedAt);
assert(contradictory.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-created-at-contradictory'));
assert.equal(contradictory.artifacts[0].qualification.parentAuthorityQualification, 'invalid');
assert.equal(contradictory.artifacts[0].qualification.parentAuthorityReason, 'continuation-parent-created-at-contradictory');

for (const record of [
  { currentCreatedAt: canonicalCreatedAt },
  { createdAt: canonicalCreatedAt },
  { currentCreatedAt: canonicalCreatedAt, createdAt: canonicalCreatedAt },
  {}
]) {
  const result = loadedTemporalSet(record);
  assert.equal(result.status, 'created-clean', JSON.stringify(record));
  assert.equal(result.artifacts[0].qualification.parentAuthorityQualification, 'qualified', JSON.stringify(record));
  assert.equal(result.artifacts[0].qualification.exactRuntimeValidation, true, JSON.stringify(record));
}

// Live loaded-parent projection consumes the same exact resolution + temporal evidence rules.
function liveLoaded(record, parentRef = 'loaded:live-parent') {
  const findings = [];
  const artifact = materializeLiveArtifact({
    current: null,
    change: {
      id: 'live-child',
      schemaId: 'tiinex.task.v1',
      title: values.Summary,
      summary: values.Summary,
      path: '.topics/live-child.trace.md',
      parentRef,
      values
    },
    material: { records: [{
      id: 'live-parent', path: '.topics/live  parent.trace.md', schemaId: 'tiinex.topic.v1', hasContinuityContext: true,
      ...record
    }], files: [] },
    artifacts: new Map(),
    findings,
    input: { state: { evidence: [] }, turn: {}, runtimeObservedAt: '2026-08-21T17:31:00.000Z' },
    options: {}
  });
  return { artifact, findings };
}
const liveContradictory = liveLoaded({ currentCreatedAt: canonicalCreatedAt, createdAt: alternateCreatedAt });
assert.equal(liveContradictory.artifact, null);
assert(liveContradictory.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-created-at-contradictory'));
const liveEqual = liveLoaded({ currentCreatedAt: canonicalCreatedAt, createdAt: canonicalCreatedAt });
assert(liveEqual.artifact);
assert.equal(liveEqual.artifact.qualification.parentAuthorityQualification, 'qualified');
assert.equal(liveEqual.artifact.parentRef, 'loaded:live-parent');
const liveNear = liveLoaded({ currentCreatedAt: canonicalCreatedAt }, 'loaded: live-parent');
assert.equal(liveNear.artifact, null);
assert(liveNear.findings.some((finding) => finding.code === 'live-lineage.parent.loaded-missing'));

console.log('✓ v474 portable loaded Parent identity + evidence closure: relationship Trace is not identity, loaded id/path matching is exact, and temporal evidence remains coherent/fail-closed across materialization and live lineage');
