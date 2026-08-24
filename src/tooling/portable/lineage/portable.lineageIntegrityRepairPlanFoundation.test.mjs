import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown } from '../../../schemas/creation.contracts.js';
import { canonicalC14nV2SelfState, sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { inspectPortableLineageIntegrity } from './lineage.integrity.plan.js';
import { runPortableOperation } from '../operation.catalog.js';
import { publicationProviderAcceptance } from './publicationProviderReceipt.fixture.mjs';

const A_PATH = '.topics/lineage/A.trace.md';
const B_PATH = '.topics/lineage/B.trace.md';
const C_PATH = '.topics/lineage/C.trace.md';
const A_PUB = 'https://github.com/Tiinex/site/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/.topics/lineage/A.trace.md';
const B_PUB = 'https://github.com/Tiinex/site/blob/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/.topics/lineage/B.trace.md';
const topicRoot = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'create-artifact' });
const taskContinuation = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record' });
const topicValues = Object.freeze({ Summary: 'A', 'Current Read': 'A read', 'Design Direction': 'A direction', 'Next Artifacts': 'B' });
const taskValues = (summary) => Object.freeze({ Summary: summary, Objective: `${summary} objective`, 'Done Criteria': `${summary} done`, Scope: `${summary} scope`, Dependencies: `${summary} dependencies` });

const aMarkdown = createArtifactDraftMarkdown(topicRoot, { values: topicValues, createdAt: '2026-08-24T09:00:00.000Z' });
assert.equal(canonicalC14nV2SelfState(aMarkdown).state, 'verified');
const aRecord = record('A', A_PATH, aMarkdown);
const aParent = withQualifiedPublication(Object.freeze({ ...aRecord, schemaId: 'tiinex.topic.v1', schemaReferenceAuthority: topicRoot.schemaReferences.current }), A_PUB);
const bHealthyMarkdown = createArtifactDraftMarkdown(taskContinuation, { parentRecord: aParent, childPath: B_PATH, values: taskValues('B'), createdAt: '2026-08-24T09:01:00.000Z' });
assert(bHealthyMarkdown);
const bHealthyRecord = record('B', B_PATH, bHealthyMarkdown);

// Healthy qualified A -> B.
const healthy = inspectPortableLineageIntegrity({ records: [aParent, bHealthyRecord], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(find(healthy, B_PATH).state, 'healthy');
assert.equal(find(healthy, B_PATH).parentAvailability.state, 'resolved');
assert.equal(find(healthy, B_PATH).parentPrimarySelf.state, 'verified');
assert.equal(find(healthy, B_PATH).childSelf.state, 'verified');
assert.equal(find(healthy, B_PATH).parentTarget.state, 'verified');
assert.equal(find(healthy, B_PATH).publicationOrigin.state, 'qualified');
assert.equal(step(healthy, B_PATH).action, 'no-change');

// Historical self-only B is a bounded backfill candidate; C still binds to B's current self digest.
const bSelfOnlyMarkdown = removeParentTargetAndReseal(bHealthyMarkdown);
assert.equal(canonicalC14nV2SelfState(bSelfOnlyMarkdown).state, 'verified');
const bSelfOnlyRecord = record('B', B_PATH, bSelfOnlyMarkdown);
const bSelfOnlyParent = withQualifiedPublication(Object.freeze({ ...bSelfOnlyRecord, schemaId: 'tiinex.task.v1', schemaReferenceAuthority: taskContinuation.schemaReferences.current }), B_PUB);
const cMarkdown = createArtifactDraftMarkdown(taskContinuation, { parentRecord: bSelfOnlyParent, childPath: C_PATH, values: taskValues('C'), createdAt: '2026-08-24T09:02:00.000Z' });
assert(cMarkdown);
const cRecord = record('C', C_PATH, cMarkdown);
const backfill = inspectPortableLineageIntegrity({ records: [aParent, bSelfOnlyParent, cRecord], publicationProviderAcceptances: [providerFor(A_PUB, aMarkdown), providerFor(B_PUB, bSelfOnlyMarkdown)] });
const bBackfill = find(backfill, B_PATH);
assert.equal(bBackfill.state, 'parent-target-missing');
assert.equal(bBackfill.parentTarget.state, 'missing');
assert.equal(bBackfill.publicationOrigin.state, 'qualified');
assert.equal(bBackfill.repairCandidate.candidateTargetDigest, validatedC14nV2PrimarySelfDigest(aMarkdown).value);
const bStep = step(backfill, B_PATH);
assert.equal(bStep.action, 'backfill-parent-target-v2');
assert.equal(bStep.approval.disposition, 'proposed');
assert.equal(bStep.approval.required, true);
assert.equal(bStep.expectedMutation.bodyMutation, false);
assert.deepEqual(bStep.expectedMutation.headerFields, []);
assert.equal(bStep.descendantImpact.length, 1);
assert.equal(bStep.descendantImpact[0].path, C_PATH);
assert.equal(bStep.descendantImpact[0].depth, 1);
assert.equal(find(backfill, C_PATH).state, 'healthy');

// Existing mismatched target is a review flag, never refresh authority.
const aDigest = validatedC14nV2PrimarySelfDigest(aMarkdown).value;
const wrong = 'Z'.repeat(aDigest.length);
const bMismatchMarkdown = sealC14nV2Self(bHealthyMarkdown.replace(`  - Value: ${aDigest}\n\n- `, `  - Value: ${wrong}\n\n- `)).markdown;
assert.equal(canonicalC14nV2SelfState(bMismatchMarkdown).state, 'verified');
const mismatch = inspectPortableLineageIntegrity({ records: [aParent, record('B', B_PATH, bMismatchMarkdown)], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(find(mismatch, B_PATH).state, 'parent-target-mismatch');
assert.equal(find(mismatch, B_PATH).parentTarget.state, 'mismatch');
assert.equal(step(mismatch, B_PATH).action, 'review-parent-target-mismatch');
assert.equal(step(mismatch, B_PATH).approval.disposition, 'requires-explicit-approval');
assert(step(mismatch, B_PATH).approval.blockers.includes('existing-target-mismatch-is-not-refresh-authority'));
assert.equal(step(mismatch, B_PATH).oldTargetDigest, wrong);
assert.equal(step(mismatch, B_PATH).candidateTargetDigest, aDigest);

// Missing Parent self evidence blocks repair qualification without direct-target recomputation.
const aWithoutSelf = aMarkdown.slice(0, aMarkdown.indexOf('# Continuity Integrity')).trimEnd();
const parentSelfUnavailable = inspectPortableLineageIntegrity({ records: [record('A', A_PATH, aWithoutSelf), bSelfOnlyRecord] });
assert.equal(find(parentSelfUnavailable, B_PATH).state, 'parent-self-unavailable');
assert.equal(find(parentSelfUnavailable, B_PATH).parentPrimarySelf.state, 'unavailable');
assert.equal(step(parentSelfUnavailable, B_PATH).approval.disposition, 'blocked');

// Truthful local-only Parent representation remains a publication blocker; no permalink is invented.
const bLocalOnlyMarkdown = sealC14nV2Self(bSelfOnlyMarkdown.replace(`    - [browse + git](${A_PUB})\n`, '')).markdown;
assert.equal(canonicalC14nV2SelfState(bLocalOnlyMarkdown).state, 'verified');
const localOnly = inspectPortableLineageIntegrity({ records: [aRecord, record('B', B_PATH, bLocalOnlyMarkdown)] });
const localArtifact = find(localOnly, B_PATH);
assert.equal(localArtifact.state, 'parent-target-missing');
assert.equal(localArtifact.publicationOrigin.state, 'missing');
assert.equal(localArtifact.exactParent.publicationLocator, '');
assert.equal(localArtifact.exactParent.expectedIntegrityTarget, 'A.trace.md');
assert.equal(step(localOnly, B_PATH).approval.disposition, 'blocked');
assert(step(localOnly, B_PATH).approval.blockers.includes('publication-origin-missing'));
assert.equal(step(localOnly, B_PATH).publicationLocator, '');

// Ambiguous and unresolved Parent authority stay fail-closed.
const duplicateA = { ...aRecord, id: 'A-duplicate', markdown: aMarkdown };
const ambiguous = inspectPortableLineageIntegrity({ records: [aRecord, duplicateA, bSelfOnlyRecord] });
assert.equal(find(ambiguous, B_PATH).state, 'parent-ambiguous');
const unresolved = inspectPortableLineageIntegrity({ records: [bSelfOnlyRecord] });
assert.equal(find(unresolved, B_PATH).state, 'parent-unresolved');

// Operation-catalog surface returns the same read-only planning language.
const operation = await runPortableOperation('lineage-integrity-plan', { records: [aParent, bSelfOnlyParent, cRecord], publicationProviderAcceptances: [providerFor(A_PUB, aMarkdown), providerFor(B_PUB, bSelfOnlyMarkdown)] });
assert.equal(operation.operation, 'lineage-integrity-plan');
assert.equal(operation.repairPlan.schema, 'tiinex.portable.repair-plan.v1');
assert.equal(operation.repairPlan.mode, 'lineage-integrity-inspection');
assert.equal(operation.repairPlan.boundary.automaticRewrite, false);
assert.equal(operation.inspection.boundary.sourceMutation, false);
assert.equal(operation.inspection.boundary.remoteWrite, false);

console.log('✓ portable lineage integrity inspection + repair-plan foundation passed');



function providerFor(target, content) {
  const parsed = new URL(target);
  const parts = parsed.pathname.split('/').filter(Boolean);
  return publicationProviderAcceptance({ repository: `${parts[0]}/${parts[1]}`, commit: parts[3], path: parts.slice(4).join('/'), content });
}

function withQualifiedPublication(base, target) {
  const parsed = new URL(target);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const repository = `${parts[0]}/${parts[1]}`;
  const commit = parts[3];
  const sourcePath = parts.slice(4).join('/');
  const bytes = utf8Bytes(base.markdown || '');
  return Object.freeze({
    ...base,
    publishedReference: Object.freeze({
      target,
      state: 'qualified',
      evidence: Object.freeze({
        state: 'qualified',
        target,
        kind: 'provider-material',
        source: Object.freeze({ repository, commit, path: sourcePath }),
        materialIdentity: Object.freeze({ state: 'qualified', sha256: sha256Hex(bytes), bytes: bytes.byteLength })
      })
    })
  });
}

function record(id, path, markdown) {
  const parsed = parseArtifactMarkdown(markdown);
  return Object.freeze({
    id, path, markdown,
    schemaId: parsed.envelope?.current?.schema?.id || '',
    hasContinuityContext: parsed.hasContinuityContext,
    hasIntegrity: parsed.hasIntegrity,
    integrity: parsed.integrity,
    trace: parsed.envelope?.parent?.trace || '',
    origin: parsed.envelope?.parent?.origin || '',
    sourceMode: 'portable-test'
  });
}
function removeParentTargetAndReseal(markdown) {
  const parsed = parseArtifactMarkdown(markdown);
  const target = parsed.integrity.entries.find((entry) => entry.towards !== 'self');
  assert(target);
  const removed = markdown.replace(`${target.raw}\n`, '');
  const sealed = sealC14nV2Self(removed);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}
function find(result, path) { return result.artifacts.find((artifact) => artifact.path === path); }
function step(result, path) { return result.repairPlan.steps.find((item) => item.artifact.path === path); }
