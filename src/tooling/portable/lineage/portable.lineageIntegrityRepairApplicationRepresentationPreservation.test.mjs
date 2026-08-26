import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown } from '../../../schemas/creation.contracts.js';
import { canonicalC14nV2SelfState, sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { inspectPortableLineageIntegrity } from './lineage.integrity.plan.js';
import { applyPortableLineageIntegrityRepair } from './lineage.integrity.apply.js';
import { publicationProviderAcceptance } from './publicationProviderReceipt.fixture.mjs';
import { runPortableOperation } from '../operation.catalog.js';

const A_PATH = '.topics/lineage/A.trace.md';
const B_PATH = '.topics/lineage/B.trace.md';
const C_PATH = '.topics/lineage/C.trace.md';
const A_PUB = 'https://github.com/Tiinex/site/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/.topics/lineage/A.trace.md';
const A_PUB_2 = 'https://github.com/Tiinex/site/blob/dddddddddddddddddddddddddddddddddddddddd/.topics/lineage/A.trace.md';
const B_PUB = 'https://github.com/Tiinex/site/blob/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/.topics/lineage/B.trace.md';
const topicRoot = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'create-artifact' });
const taskContinuation = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record' });
const topicValues = Object.freeze({ Summary: 'A', 'Current Read': 'A read', 'Design Direction': 'A direction', 'Next Artifacts': 'B' });
const taskValues = (summary) => Object.freeze({ Summary: summary, Objective: `${summary} objective`, 'Done Criteria': `${summary} done`, Scope: `${summary} scope`, Dependencies: `${summary} dependencies` });

const aMarkdown = createArtifactDraftMarkdown(topicRoot, { values: topicValues, createdAt: '2026-08-24T09:00:00.000Z' });
const aRecord = record('A', A_PATH, aMarkdown);
const aParent = withPublication(aRecord, A_PUB);
const bHealthyMarkdown = createArtifactDraftMarkdown(taskContinuation, { parentRecord: aParent, childPath: B_PATH, values: taskValues('B'), createdAt: '2026-08-24T09:01:00.000Z' });
const bHealthyRecord = record('B', B_PATH, bHealthyMarkdown);

// Adversarial B: multiple blank lines, an embedded divider, long nested lists, a sibling footer entry,
// Parent + Origin, and CRLF representation. Only the Parent-target/self footer may change.
let bAdversarial = bHealthyMarkdown.replace('\n# Continuity Integrity\n', `\n\n### Arbitrary body representation\n\nalpha\n\n\n---\n\n- nested\n  - level 2\n    - level 3\n      - level 4\n        - level 5 with punctuation: []() {} :: keep exactly\n\nomega\n\n# Continuity Integrity\n`);
bAdversarial = insertSiblingIntegrityEntry(bAdversarial);
bAdversarial = sealC14nV2Self(bAdversarial).markdown;
bAdversarial = removeParentTargetAndReseal(bAdversarial);
bAdversarial = bAdversarial.replace(/\n/g, '\r\n');
assert.equal(canonicalC14nV2SelfState(bAdversarial).state, 'verified');
const bSelfOnly = record('B', B_PATH, bAdversarial);
const bSelfOnlyParent = withPublication(bSelfOnly, B_PUB);
const cMarkdown = createArtifactDraftMarkdown(taskContinuation, { parentRecord: bSelfOnlyParent, childPath: C_PATH, values: taskValues('C'), createdAt: '2026-08-24T09:02:00.000Z' });
const cRecord = record('C', C_PATH, cMarkdown);
const providers = [providerFor(A_PUB, aMarkdown), providerFor(B_PUB, bAdversarial)];
const inspection = inspectPortableLineageIntegrity({ records: [cRecord, bSelfOnlyParent, aParent], publicationProviderAcceptances: providers });
assert.equal(findArtifact(inspection, B_PATH).state, 'parent-target-missing');
assert.equal(findStep(inspection.repairPlan, B_PATH).approval.disposition, 'proposed');
assert.equal(findArtifact(inspection, C_PATH).state, 'healthy');

const bBodyBefore = exactBody(bAdversarial);
const cBodyBefore = exactBody(cMarkdown);
const siblingBefore = siblingIntegrityRaw(bAdversarial);
const approvals = [
  { path: B_PATH, state: 'approved', reason: 'exact-parent-identity-backfill' },
  { path: C_PATH, state: 'approved', reason: 'approved-descendant-cascade' }
];
const applied = applyPortableLineageIntegrityRepair({ records: [cRecord, bSelfOnlyParent, aParent], repairPlan: inspection.repairPlan, approvals, publicationProviderAcceptances: providers });
assert.equal(applied.status, 'changed');
assert.deepEqual([...applied.changeset.changedPaths].sort(), [B_PATH, C_PATH].sort());
const bChanged = changed(applied, B_PATH);
const cChanged = changed(applied, C_PATH);
assert(bChanged && cChanged);
assert.equal(exactBody(bChanged.markdown), bBodyBefore);
assert.equal(exactBody(cChanged.markdown), cBodyBefore);
assert.equal(siblingIntegrityRaw(bChanged.markdown), siblingBefore);
assert.equal(bChanged.markdown.replace(/\r\n/g, '').includes('\n'), false, 'CRLF representation must not be normalized by repair');
assert.equal(canonicalC14nV2SelfState(bChanged.markdown).state, 'verified');
assert.equal(canonicalC14nV2SelfState(cChanged.markdown).state, 'verified');
const aDigest = validatedC14nV2PrimarySelfDigest(aMarkdown).value;
const bDigestAfter = validatedC14nV2PrimarySelfDigest(bChanged.markdown).value;
assert.deepEqual(parentTarget(bChanged.markdown), { towards: A_PUB, value: aDigest });
assert.deepEqual(parentTarget(cChanged.markdown), { towards: B_PUB, value: bDigestAfter });
for (const receipt of applied.receipts) {
  assert.equal(receipt.bodyPreservationCheck, 'byte-identical');
  assert.equal(receipt.siblingFooterPreservationCheck, 'byte-identical');
  assert.equal(receipt.remainingBlockers.length, 0);
}
assert(applied.humanReceipt.includes(`CHANGED ${B_PATH}`));
assert(applied.humanReceipt.includes(`CHANGED ${C_PATH}`));

// Idempotence: accepted plan reapplied to repaired material is a no-op, without duplicate footer entries.
const reapplied = applyPortableLineageIntegrityRepair({ records: [aParent, bChanged, cChanged], repairPlan: inspection.repairPlan, approvals, publicationProviderAcceptances: providers });
assert.equal(reapplied.status, 'no-op');
assert.equal(reapplied.changeset.records.length, 0);
assert.equal(reapplied.receipts.find((receipt) => receipt.artifact.path === B_PATH)?.status, 'no-op');
assert.equal(c14nParentEntryCount(bChanged.markdown), 1);

// Per-artifact cascade gating: unapproved descendant stops the branch and is reported, not silently rewritten.
const partial = applyPortableLineageIntegrityRepair({ records: [aParent, bSelfOnlyParent, cRecord], repairPlan: inspection.repairPlan, approvals: [{ path: B_PATH, state: 'approved' }], publicationProviderAcceptances: providers });
assert.equal(partial.status, 'partial-blocked');
assert.deepEqual(partial.changeset.changedPaths, [B_PATH]);
const cBlocked = partial.receipts.find((receipt) => receipt.artifact.path === C_PATH);
assert(cBlocked?.remainingBlockers.includes('per-artifact-approval-required'));
assert.equal(cRecord.markdown, cMarkdown);

// No plan and no approval are both hard gates.
const noPlan = applyPortableLineageIntegrityRepair({ records: [aParent, bSelfOnlyParent] });
assert.equal(noPlan.status, 'blocked');
assert(noPlan.receipts[0].remainingBlockers.includes('explicit-repair-plan-required'));
const noApproval = applyPortableLineageIntegrityRepair({ records: [aParent, bSelfOnlyParent], repairPlan: inspection.repairPlan, publicationProviderAcceptances: providers });
assert.equal(noApproval.status, 'blocked');
assert.equal(noApproval.changeset.records.length, 0);

// Existing mismatch requires semantic authority; a raw approval flag is insufficient.
const wrong = 'Z'.repeat(aDigest.length);
const bMismatch = replaceParentDigestAndReseal(bHealthyMarkdown, wrong);
const mismatchRecord = record('B', B_PATH, bMismatch);
const mismatchInspection = inspectPortableLineageIntegrity({ records: [aParent, mismatchRecord], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(findArtifact(mismatchInspection, B_PATH).state, 'parent-target-mismatch');
const mismatchBlocked = applyPortableLineageIntegrityRepair({ records: [aParent, mismatchRecord], repairPlan: mismatchInspection.repairPlan, approvals: [{ path: B_PATH, state: 'approved' }], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(mismatchBlocked.status, 'blocked');
assert(mismatchBlocked.receipts[0].remainingBlockers.includes('qualified-semantic-disposition-required'));
const mismatchApproved = applyPortableLineageIntegrityRepair({ records: [aParent, mismatchRecord], repairPlan: mismatchInspection.repairPlan, approvals: [{ path: B_PATH, state: 'approved', semanticDisposition: 'representation-only', semanticAuthority: 'Axiom/accepted-decision' }], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(mismatchApproved.status, 'changed');
assert.equal(parentTarget(changed(mismatchApproved, B_PATH).markdown).value, aDigest);

// Axiom-style repaired-local-vs-pre-repair-published mismatch: old immutable Origin remains historical,
// while the Parent-target is explicitly re-bound to repaired local Parent bytes via Trace.
const aRepairedMarkdown = sealC14nV2Self(aMarkdown.replace('A direction', 'A repaired direction')).markdown;
const aRepaired = withPublication(record('A', A_PATH, aRepairedMarkdown), A_PUB);
const historicalInspection = inspectPortableLineageIntegrity({ records: [aRepaired, bHealthyRecord], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
const historicalStep = findStep(historicalInspection.repairPlan, B_PATH);
assert.equal(findArtifact(historicalInspection, B_PATH).state, 'parent-target-mismatch');
assert(historicalStep.approval.blockers.some((item) => ['publication-origin-stale', 'publication-origin-contradictory'].includes(item)));
const historicalApplied = applyPortableLineageIntegrityRepair({
  records: [aRepaired, bHealthyRecord], repairPlan: historicalInspection.repairPlan,
  approvals: [{ path: B_PATH, state: 'approved', semanticDisposition: 'representation-only', semanticAuthority: 'Axiom-011', targetDisposition: 'repaired-local-parent', originDisposition: 'historical-pre-repair-origin-retained' }],
  publicationProviderAcceptance: providerFor(A_PUB, aMarkdown)
});
assert.equal(historicalApplied.status, 'changed');
const historicalB = changed(historicalApplied, B_PATH).markdown;
assert.equal(parentTarget(historicalB).towards, 'A.trace.md');
assert.equal(parentTarget(historicalB).value, validatedC14nV2PrimarySelfDigest(aRepairedMarkdown).value);
assert.equal(parentBrowseGit(historicalB), A_PUB);

// Qualified Parent Origin/permalink update requires explicit header authorization and accepted exact provider bytes.
const healthyInspection = inspectPortableLineageIntegrity({ records: [aParent, bHealthyRecord], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
const originPlan = planWithOriginUpdate(healthyInspection.repairPlan, B_PATH, A_PUB_2, aDigest);
const originApproval = [{ path: B_PATH, state: 'approved', publicationDisposition: 'qualified-exact-publication' }];
const originBlocked = applyPortableLineageIntegrityRepair({ records: [aParent, bHealthyRecord], repairPlan: originPlan, approvals: originApproval, publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(originBlocked.status, 'blocked');
assert(originBlocked.receipts[0].remainingBlockers.includes('accepted-exact-provider-material-required'));
const originApplied = applyPortableLineageIntegrityRepair({ records: [aParent, bHealthyRecord], repairPlan: originPlan, approvals: originApproval, publicationProviderAcceptances: [providerFor(A_PUB, aMarkdown), providerFor(A_PUB_2, aMarkdown)] });
assert.equal(originApplied.status, 'changed');
const originB = changed(originApplied, B_PATH).markdown;
assert.equal(parentBrowseGit(originB), A_PUB_2);
assert.deepEqual(parentTarget(originB), { towards: A_PUB_2, value: aDigest });
assert.equal(exactBody(originB), exactBody(bHealthyMarkdown));

// Malformed/absent footer and ambiguous Parent-target entries fail closed.
const absentFooter = bSelfOnly.markdown.slice(0, bSelfOnly.markdown.indexOf('# Continuity Integrity')).trimEnd();
const absent = applyPortableLineageIntegrityRepair({ records: [aParent, record('B', B_PATH, absentFooter)], repairPlan: inspection.repairPlan, approvals: [{ path: B_PATH, state: 'approved' }], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(absent.status, 'blocked');
assert(absent.receipts[0].remainingBlockers.some((item) => item.startsWith('child-self-')));
const malformed = bSelfOnly.markdown.replace('  - Towards: self', '  - Towards: self\r\n  - Towards: self');
const malformedResult = applyPortableLineageIntegrityRepair({ records: [aParent, record('B', B_PATH, malformed)], repairPlan: inspection.repairPlan, approvals: [{ path: B_PATH, state: 'approved' }], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(malformedResult.status, 'blocked');
const duplicateParent = duplicateParentTarget(bHealthyMarkdown);
const duplicatePlan = mismatchInspection.repairPlan;
const duplicateResult = applyPortableLineageIntegrityRepair({ records: [aParent, record('B', B_PATH, duplicateParent)], repairPlan: duplicatePlan, approvals: [{ path: B_PATH, state: 'approved', semanticDisposition: 'representation-only', semanticAuthority: 'test' }], publicationProviderAcceptance: providerFor(A_PUB, aMarkdown) });
assert.equal(duplicateResult.status, 'blocked');

// Catalog surface exposes the same local-result/no-source-mutation contract.
const operation = await runPortableOperation('lineage-integrity-apply', { records: [aParent, bSelfOnlyParent, cRecord], repairPlan: inspection.repairPlan, approvals, publicationProviderAcceptances: providers });
assert.equal(operation.operation, 'lineage-integrity-apply');
assert.equal(operation.application.schema, 'tiinex.portable.lineage-integrity-repair-application.v1');
assert.equal(operation.changeset.sourceMutation, false);
assert.equal(operation.changeset.remoteWrite, false);
assert.equal(operation.boundary.representationDiffFailClosed, true);

console.log('✓ portable lineage integrity repair application + representation preservation passed');

function record(id, path, markdown) {
  const parsed = parseArtifactMarkdown(markdown);
  return Object.freeze({ id, path, markdown, schemaId: parsed.envelope?.current?.schema?.id || '', hasContinuityContext: parsed.hasContinuityContext, hasIntegrity: parsed.hasIntegrity, integrity: parsed.integrity, trace: parsed.envelope?.parent?.trace || '', origin: parsed.envelope?.parent?.origin || '', sourceMode: 'portable-test' });
}
function withPublication(base, target) { return Object.freeze({ ...base, schemaId: base.schemaId || 'tiinex.task.v1', schemaReferenceAuthority: base.schemaId === 'tiinex.topic.v1' ? topicRoot.schemaReferences.current : taskContinuation.schemaReferences.current, publishedReference: Object.freeze({ target, state: 'qualified' }) }); }
function providerFor(target, content) { const parsed = new URL(target); const parts = parsed.pathname.split('/').filter(Boolean); return publicationProviderAcceptance({ repository: `${parts[0]}/${parts[1]}`, commit: parts[3], path: parts.slice(4).join('/'), content }); }
function findArtifact(result, path) { return result.artifacts.find((artifact) => artifact.path === path); }
function findStep(plan, path) { return plan.steps.find((step) => step.artifact.path === path); }
function changed(result, path) { return result.changeset.records.find((item) => item.path === path); }
function parentTarget(markdown) { const entry = parseArtifactMarkdown(markdown).integrity.entries.find((item) => item.method === 'sha256-base64url-c14n-v2' && item.towards !== 'self'); return entry ? { towards: entry.towards, value: entry.value } : null; }
function parentBrowseGit(markdown) { return parseArtifactMarkdown(markdown).envelope.parent.originEntries.find((entry) => entry.label === 'browse + git')?.target || ''; }
function c14nParentEntryCount(markdown) { return parseArtifactMarkdown(markdown).integrity.entries.filter((entry) => entry.method === 'sha256-base64url-c14n-v2' && entry.towards !== 'self').length; }
function removeParentTargetAndReseal(markdown) { const target = parseArtifactMarkdown(markdown).integrity.entries.find((entry) => entry.method === 'sha256-base64url-c14n-v2' && entry.towards !== 'self'); assert(target); const sealed = sealC14nV2Self(markdown.replace(`${target.raw}\n`, '')); assert.equal(sealed.state, 'sealed'); return sealed.markdown; }
function replaceParentDigestAndReseal(markdown, value) { const target = parseArtifactMarkdown(markdown).integrity.entries.find((entry) => entry.method === 'sha256-base64url-c14n-v2' && entry.towards !== 'self'); const next = markdown.replace(target.raw, target.raw.replace(/(\n\s+- Value:\s*).*/, `$1${value}`)); return sealC14nV2Self(next).markdown; }
function insertSiblingIntegrityEntry(markdown) { const selfMarker = '\n- [sha256-base64url-c14n-v2]'; const index = markdown.lastIndexOf(selfMarker); assert(index > 0); return `${markdown.slice(0, index)}\n- custom-preservation-check\n  - Towards: audit-sibling\n  - Value: keep-me-byte-identical\n${markdown.slice(index)}`; }
function siblingIntegrityRaw(markdown) { const parsed = parseArtifactMarkdown(markdown); return parsed.integrity.entries.find((entry) => entry.method === 'custom-preservation-check')?.raw || ''; }
function exactBody(markdown) { const start = markdown.search(/^---\r?$/m); const footer = markdown.search(/^# Continuity Integrity\r?$/m); assert(start >= 0 && footer > start); return markdown.slice(start, footer); }
function planWithOriginUpdate(plan, path, candidateParentOrigin, candidateTargetDigest) { return Object.freeze({ ...plan, status: 'proposed', steps: Object.freeze(plan.steps.map((step) => step.artifact.path === path ? Object.freeze({ ...step, action: 'update-parent-origin-permalink', currentState: 'healthy', candidateParentOrigin, candidateTargetDigest, expectedMutation: Object.freeze({ ...step.expectedMutation, headerFields: Object.freeze(['Parent.Origin.browse+git']), footerChanges: Object.freeze(['Parent-target locator', 'primary self c14n-v2 Value after fixed sibling entry']) }), approval: Object.freeze({ required: true, disposition: 'proposed', blockers: Object.freeze([]) }) }) : step)) }); }
function duplicateParentTarget(markdown) { const parsed = parseArtifactMarkdown(markdown); const target = parsed.integrity.entries.find((entry) => entry.method === 'sha256-base64url-c14n-v2' && entry.towards !== 'self'); const next = markdown.replace(`${target.raw}\n`, `${target.raw}\n\n${target.raw}\n`); return sealC14nV2Self(next).markdown; }
