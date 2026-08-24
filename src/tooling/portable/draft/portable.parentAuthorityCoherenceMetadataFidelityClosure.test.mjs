import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { runPortableOperation } from '../operation.catalog.js';
import { createPortableLocalDraft } from './draft.create.js';
import { createPortableLocalArtifactSet } from './draft.set.js';
import { sealedC14nV2FixtureMarkdown } from '../../../integrity/integrity.testFixture.js';
import {
  normalizePortableParentRecord,
  qualifyPortableExactParent,
  qualifyPortableRenderedParentRepresentation
} from './draft.exact.js';

const values = Object.freeze({
  Summary: 'Parent authority coherence',
  Objective: 'Preserve exact Parent authority and metadata.',
  'Done Criteria': 'Contradictory or unrepresentable Parent truth fails closed.',
  Scope: 'Portable exact continuation only.',
  Dependencies: 'Qualified explicit Parent metadata.'
});
const createdAt = '2026-08-21T16:40:00.000Z';
const withAuthority = (parent = {}) => ({ markdown: sealedC14nV2FixtureMarkdown('Parent Authority Fixture'), ...parent, publishedReference: { target: 'https://archive.example.test/exact/parent.trace.md', state: 'qualified' }, schemaReferenceAuthority: { schemaId: parent.schemaId || parent.currentSchemaId || 'tiinex.topic.v1', preferredTarget: 'https://archive.example.test/schemas/parent.schema.md', resolutionState: 'qualified' } });

async function continueTask(parentRecord) {
  return runPortableOperation('create-local-draft', {
    schemaId: 'tiinex.task.v1',
    transitionType: 'continue-from-record',
    values,
    path: '.topics/child.trace.md',
    createdAt,
    parentRecord: withAuthority(parentRecord)
  });
}

const contradictorySchema = await continueTask({
  id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1', currentSchemaId: 'tiinex.task.v1'
});
assert.equal(contradictorySchema.status, 'blocked');
assert.equal(contradictorySchema.draft, null);
assert.equal(contradictorySchema.qualification.exactCreateToolingApplied, false);
assert.equal(contradictorySchema.qualification.exactRuntimeValidation, false);
assert.equal(contradictorySchema.qualification.parentAuthorityQualification, 'invalid');
assert.equal(contradictorySchema.qualification.parentAuthorityReason, 'continuation-parent-schema-contradictory');
assert(contradictorySchema.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-schema-contradictory'));

for (const parentRecord of [
  { id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1' },
  { id: 'p', path: '.topics/p.trace.md', currentSchemaId: 'tiinex.topic.v1' },
  { id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1', currentSchemaId: 'tiinex.topic.v1' }
]) {
  const result = await continueTask(parentRecord);
  assert.equal(result.status, 'created-clean');
  assert.equal(result.qualification.exactCreateToolingApplied, true);
  assert.equal(result.qualification.exactRuntimeValidation, true);
  assert.equal(result.qualification.parentAuthorityQualification, 'qualified');
  assert.equal(result.qualification.parentAuthorityReason, '');
  assert.equal(parseArtifactMarkdown(result.draft.markdown).envelope.parent.schema.id, 'tiinex.topic.v1');
}

const canonicalCreatedAt = '2026-01-01 00:00:00';
const canonicalParent = withAuthority({ id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1', createdAt: canonicalCreatedAt });
const canonical = await continueTask(canonicalParent);
assert.equal(canonical.status, 'created-clean');
assert.equal(canonical.qualification.exactCreateToolingApplied, true);
assert.equal(canonical.qualification.exactRuntimeValidation, true);
assert(canonical.draft.markdown.includes(`  - Created At: ${canonicalCreatedAt}\n  - Trace: [p.trace.md](p.trace.md)`));
assert.equal(parseArtifactMarkdown(canonical.draft.markdown).envelope.parent.createdAt, canonicalCreatedAt);

const omitted = await continueTask({ id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1' });
assert.equal(omitted.status, 'created-clean');
assert.equal(omitted.qualification.parentAuthorityQualification, 'qualified');
assert.equal(parseArtifactMarkdown(omitted.draft.markdown).envelope.parent.createdAt, '');

for (const invalidCreatedAt of [
  'not-a-date',
  '2026-01-01T00:00:00Z',
  '2026-01-01 00:00:00Z',
  '2026-01-01 00:00:00+00:00',
  '2026-01-01 00:00:00.000',
  ' 2026-01-01 00:00:00',
  '2026-01-01 00:00:00 ',
  '2026-01-01 00:00:00\nX',
  '2026-01-01 00:00:00\r\nX'
]) {
  const result = await continueTask({ id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1', createdAt: invalidCreatedAt });
  assert.equal(result.status, 'blocked', invalidCreatedAt);
  assert.equal(result.draft, null, invalidCreatedAt);
  assert.equal(result.qualification.exactCreateToolingApplied, false, invalidCreatedAt);
  assert.equal(result.qualification.exactCreationResultQualification, 'not-run', invalidCreatedAt);
  assert.equal(result.qualification.exactRuntimeValidation, false, invalidCreatedAt);
  assert.equal(result.qualification.parentAuthorityReason, 'continuation-parent-created-at-invalid', invalidCreatedAt);
  assert(result.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-created-at-invalid'), invalidCreatedAt);
}

const snapshotQualification = qualifyPortableExactParent(normalizePortableParentRecord(canonicalParent), 'continue-from-record');
assert.equal(snapshotQualification.state, 'qualified');
assert.equal(qualifyPortableRenderedParentRepresentation(canonical.draft.markdown, snapshotQualification.snapshot, 'continue-from-record', '.topics/child.trace.md').state, 'qualified');
const driftedTimestamp = canonical.draft.markdown.replace(
  `  - Created At: ${canonicalCreatedAt}\n  - Trace: [p.trace.md](p.trace.md)`,
  `  - Created At: ${canonicalCreatedAt} \n  - Trace: [p.trace.md](p.trace.md)`
);
const driftQualification = qualifyPortableRenderedParentRepresentation(driftedTimestamp, snapshotQualification.snapshot, 'continue-from-record', '.topics/child.trace.md');
assert.equal(driftQualification.state, 'invalid');
assert.equal(driftQualification.reason, 'exact-result-parent-representation-mismatch');

const omittedSnapshot = qualifyPortableExactParent(normalizePortableParentRecord(withAuthority({ id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1' })), 'continue-from-record');
assert.equal(omittedSnapshot.state, 'qualified');
const inventedTimestamp = omitted.draft.markdown.replace('  - Trace: [p.trace.md](p.trace.md)', `  - Created At: ${canonicalCreatedAt}\n  - Trace: [p.trace.md](p.trace.md)`);
const inventedQualification = qualifyPortableRenderedParentRepresentation(inventedTimestamp, omittedSnapshot.snapshot, 'continue-from-record', '.topics/child.trace.md');
assert.equal(inventedQualification.state, 'invalid');
assert.equal(inventedQualification.reason, 'exact-result-parent-representation-mismatch');

const directContradiction = createPortableLocalDraft({
  schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record', values, createdAt,
  parentRecord: { id: 'p', path: '.topics/p.trace.md', schemaId: 'tiinex.topic.v1', currentSchemaId: 'tiinex.task.v1' }
});
assert.equal(directContradiction.status, 'blocked');
assert.equal(directContradiction.qualification.parentAuthorityQualification, 'invalid');

function loadedParentSet(parentRecord) {
  return createPortableLocalArtifactSet({
    records: [{ ...withAuthority(parentRecord), id: 'loaded-p', path: '.topics/loaded-p.trace.md', hasContinuityContext: true }],
    proposals: [{
      id: 'loaded-child', schemaId: 'tiinex.task.v1', parentRef: 'loaded-p', path: '.topics/loaded-child.trace.md',
      rationale: 'Pressure loaded Parent projection without rewriting authority-bearing metadata.', evidenceRefs: ['loaded-p'], values, createdAt
    }]
  });
}
const loadedContradiction = loadedParentSet({ schemaId: 'tiinex.topic.v1', currentSchemaId: 'tiinex.task.v1', currentCreatedAt: canonicalCreatedAt });
assert.equal(loadedContradiction.status, 'blocked');
assert(loadedContradiction.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-schema-contradictory'));
const loadedWhitespaceTimestamp = loadedParentSet({ schemaId: 'tiinex.topic.v1', currentCreatedAt: ` ${canonicalCreatedAt} ` });
assert.equal(loadedWhitespaceTimestamp.status, 'blocked');
assert(loadedWhitespaceTimestamp.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-created-at-invalid'));
const loadedKindOnly = loadedParentSet({ kind: 'tiinex.topic.v1', currentCreatedAt: canonicalCreatedAt });
assert.equal(loadedKindOnly.status, 'blocked');
assert(loadedKindOnly.findings.some((finding) => finding.code === 'portable.draft-create.parent.continuation-parent-schema-required'));

console.log('✓ v473 portable Parent authority coherence + metadata fidelity: schema evidence coherence, exact optional Parent Created At, pre-render fail-closed behavior, and post-render representation drift passed');
