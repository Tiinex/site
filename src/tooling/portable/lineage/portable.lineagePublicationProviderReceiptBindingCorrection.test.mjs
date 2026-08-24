import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown } from '../../../schemas/creation.contracts.js';
import { canonicalC14nV2SelfState, sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { inspectPortableLineageIntegrity } from './lineage.integrity.plan.js';
import { publicationProviderReceipt } from './publicationProviderReceipt.fixture.mjs';

const A_PATH = '.topics/lineage/A.trace.md';
const B_PATH = '.topics/lineage/B.trace.md';
const COMMIT = 'a'.repeat(40);
const A_PUB = `https://github.com/Tiinex/site/blob/${COMMIT}/${A_PATH}`;
const A_BRANCH = `https://github.com/Tiinex/site/blob/main/${A_PATH}`;
const topicRoot = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'create-artifact' });
const taskContinuation = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record' });
const aMarkdown = createArtifactDraftMarkdown(topicRoot, {
  values: { Summary: 'A', 'Current Read': 'A read', 'Design Direction': 'A direction', 'Next Artifacts': 'B' },
  createdAt: '2026-08-24T10:55:00.000Z'
});
assert.equal(canonicalC14nV2SelfState(aMarkdown).state, 'verified');
const aRecord = record('A', A_PATH, aMarkdown);
const fabricatedParent = withFabricatedEvidence(aRecord, A_PUB);
const bFabricated = childFromParent(fabricatedParent, 'B fabricated');
const bFabricatedSelfOnly = record('B', B_PATH, removeParentTargetAndReseal(bFabricated.markdown));

// Fully caller-fabricated nested evidence stays descriptive and cannot qualify publication.
const fabricated = inspectPortableLineageIntegrity({ records: [fabricatedParent, bFabricatedSelfOnly] });
const fabricatedArtifact = find(fabricated, B_PATH);
assert.equal(fabricatedArtifact.publicationOrigin.state, 'unresolved');
assert.equal(fabricatedArtifact.publicationOrigin.reason, 'publication-provider-receipt-required');
assert.equal(fabricatedArtifact.publicationOrigin.locatorState, 'commit-pinned-github-blob');
assert.notEqual(fabricatedArtifact.publicationOrigin.evidenceState, 'qualified');
assert.equal(fabricatedArtifact.publicationOrigin.providerRequirement.required, true);
assert.equal(fabricated.publicationProviderEvidence.summary.acceptedReceipts, 0);
assert.equal(step(fabricated, B_PATH).approval.disposition, 'blocked');

// Exact accepted repository-read material qualifies after Tooling re-hashes returned UTF-8 bytes.
const exactReceipt = publicationProviderReceipt({ repository: 'Tiinex/site', commit: COMMIT, path: A_PATH, content: aMarkdown });
const exact = inspectPortableLineageIntegrity({ records: [fabricatedParent, bFabricatedSelfOnly], publicationProviderReceipt: exactReceipt });
const exactArtifact = find(exact, B_PATH);
assert.equal(exactArtifact.publicationOrigin.state, 'qualified');
assert.equal(exactArtifact.publicationOrigin.evidenceState, 'qualified');
assert.equal(exactArtifact.publicationOrigin.evidence.kind, 'accepted-provider-material');
assert.equal(exactArtifact.publicationOrigin.evidence.receiptReference, exactReceipt.plan.actionId);
assert.equal(exactArtifact.publicationOrigin.evidence.materialIdentity.sha256, sha256Hex(utf8Bytes(aMarkdown)));
assert.equal(exactArtifact.publicationOrigin.evidence.materialIdentity.bytes, utf8Bytes(aMarkdown).byteLength);
assert.equal(exactArtifact.publicationOrigin.providerRequirement.required, false);
assert.equal(exact.publicationProviderEvidence.summary.acceptedReceipts, 1);
assert.equal(exact.boundary.remoteWrite, false);
assert.equal(exact.boundary.sourceMutation, false);
assert.equal(step(exact, B_PATH).approval.disposition, 'proposed');

// Missing receipt step is rejected by the existing host acceptance boundary and remains fail-closed.
const missingStepReceipt = publicationProviderReceipt({ repository: 'Tiinex/site', commit: COMMIT, path: A_PATH, content: aMarkdown, omitStep: true });
const missingStep = inspectPortableLineageIntegrity({ records: [fabricatedParent, bFabricatedSelfOnly], publicationProviderReceipt: missingStepReceipt });
assert.equal(find(missingStep, B_PATH).publicationOrigin.state, 'unresolved');
assert.equal(missingStep.publicationProviderEvidence.summary.acceptedReceipts, 0);
assert.equal(missingStep.publicationProviderEvidence.summary.rejectedReceipts, 1);
assert(missingStep.findings.some((finding) => finding.code === 'portable.lineage.publication-provider.acceptance-rejected'));

// Wrong host action cannot be repurposed as publication evidence even if it returns matching local bytes.
const wrongActionReceipt = publicationProviderReceipt({ repository: 'Tiinex/site', commit: COMMIT, path: A_PATH, content: aMarkdown, action: 'filesystem-read' });
const wrongAction = inspectPortableLineageIntegrity({ records: [fabricatedParent, bFabricatedSelfOnly], publicationProviderReceipt: wrongActionReceipt });
assert.equal(find(wrongAction, B_PATH).publicationOrigin.state, 'unresolved');
assert.equal(wrongAction.publicationProviderEvidence.summary.acceptedReceipts, 0);
assert(wrongAction.findings.some((finding) => finding.code === 'portable.lineage.publication-provider.action.invalid'));

// A record-local receipt reference binds only to the same accepted actionId; a missing reference is unresolved.
const missingReferenceParent = withFabricatedEvidence(aRecord, A_PUB, { receiptRef: 'host-action:missing' });
const bMissingReference = childFromParent(missingReferenceParent, 'B missing reference');
const missingReference = inspectPortableLineageIntegrity({ records: [missingReferenceParent, record('B', B_PATH, removeParentTargetAndReseal(bMissingReference.markdown))], publicationProviderReceipt: exactReceipt });
assert.equal(find(missingReference, B_PATH).publicationOrigin.state, 'unresolved');
assert.equal(find(missingReference, B_PATH).publicationOrigin.reason, 'publication-evidence-receipt-reference-unresolved');

// Repository, commit, or path disagreement on the specifically referenced accepted receipt is contradictory.
const wrongRepositoryReceipt = publicationProviderReceipt({ repository: 'Other/site', commit: COMMIT, path: A_PATH, content: aMarkdown });
const referencedWrongRepositoryParent = withFabricatedEvidence(aRecord, A_PUB, { receiptRef: wrongRepositoryReceipt.plan.actionId });
const bWrongRepository = childFromParent(referencedWrongRepositoryParent, 'B wrong repository');
const wrongRepository = inspectPortableLineageIntegrity({ records: [referencedWrongRepositoryParent, record('B', B_PATH, removeParentTargetAndReseal(bWrongRepository.markdown))], publicationProviderReceipt: wrongRepositoryReceipt });
assert.equal(find(wrongRepository, B_PATH).publicationOrigin.state, 'contradictory');
assert.equal(find(wrongRepository, B_PATH).publicationOrigin.reason, 'publication-provider-identity-mismatch');

const wrongCommitReceipt = publicationProviderReceipt({ repository: 'Tiinex/site', commit: 'b'.repeat(40), path: A_PATH, content: aMarkdown });
const referencedWrongCommitParent = withFabricatedEvidence(aRecord, A_PUB, { receiptRef: wrongCommitReceipt.plan.actionId });
const bWrongCommit = childFromParent(referencedWrongCommitParent, 'B wrong commit');
const wrongCommit = inspectPortableLineageIntegrity({ records: [referencedWrongCommitParent, record('B', B_PATH, removeParentTargetAndReseal(bWrongCommit.markdown))], publicationProviderReceipt: wrongCommitReceipt });
assert.equal(find(wrongCommit, B_PATH).publicationOrigin.state, 'contradictory');
assert.equal(find(wrongCommit, B_PATH).publicationOrigin.reason, 'publication-provider-identity-mismatch');

const wrongPathReceipt = publicationProviderReceipt({ repository: 'Tiinex/site', commit: COMMIT, path: '.topics/lineage/not-A.trace.md', content: aMarkdown });
const referencedWrongPathParent = withFabricatedEvidence(aRecord, A_PUB, { receiptRef: wrongPathReceipt.plan.actionId });
const bWrongPath = childFromParent(referencedWrongPathParent, 'B wrong path');
const wrongPath = inspectPortableLineageIntegrity({ records: [referencedWrongPathParent, record('B', B_PATH, removeParentTargetAndReseal(bWrongPath.markdown))], publicationProviderReceipt: wrongPathReceipt });
assert.equal(find(wrongPath, B_PATH).publicationOrigin.state, 'contradictory');
assert.equal(find(wrongPath, B_PATH).publicationOrigin.reason, 'publication-provider-identity-mismatch');

// Exact repository identity with different returned bytes is contradictory; caller digests are not trusted instead.
const byteMismatchReceipt = publicationProviderReceipt({ repository: 'Tiinex/site', commit: COMMIT, path: A_PATH, content: `${aMarkdown}\nprovider-byte-mismatch` });
const byteMismatch = inspectPortableLineageIntegrity({ records: [fabricatedParent, bFabricatedSelfOnly], publicationProviderReceipt: byteMismatchReceipt });
assert.equal(find(byteMismatch, B_PATH).publicationOrigin.state, 'contradictory');
assert.equal(find(byteMismatch, B_PATH).publicationOrigin.reason, 'publication-provider-material-mismatch');
assert.equal(step(byteMismatch, B_PATH).approval.disposition, 'blocked');

// Direct providerResponses without an accepted host receipt are explicitly ignored for publication authority.
const directProviderResponses = inspectPortableLineageIntegrity({
  records: [fabricatedParent, bFabricatedSelfOnly],
  providerResponses: [{ providerId: 'fabricated', remoteFetch: true, files: [{ path: A_PATH, content: aMarkdown, sourceMode: 'portable-host-repository', source: { repository: 'Tiinex/site', commit: COMMIT, path: A_PATH, remoteFetch: true } }] }]
});
assert.equal(find(directProviderResponses, B_PATH).publicationOrigin.state, 'unresolved');
assert(directProviderResponses.findings.some((finding) => finding.code === 'portable.lineage.publication-provider.responses-unaccepted'));

// Mutable branch locators remain stale even when a repository receipt is supplied.
const branchParent = Object.freeze({ ...aRecord, publishedReference: Object.freeze({ target: A_BRANCH, state: 'qualified' }) });
const bBranch = childFromParent(branchParent, 'B branch');
const branchReceipt = publicationProviderReceipt({ repository: 'Tiinex/site', commit: COMMIT, path: A_PATH, content: aMarkdown });
const branch = inspectPortableLineageIntegrity({ records: [branchParent, record('B', B_PATH, removeParentTargetAndReseal(bBranch.markdown))], publicationProviderReceipt: branchReceipt });
assert.equal(find(branch, B_PATH).publicationOrigin.state, 'stale');
assert.equal(find(branch, B_PATH).publicationOrigin.locatorState, 'mutable-or-noncanonical-github-blob');
assert.equal(step(branch, B_PATH).approval.disposition, 'blocked');

// Local unpublished Parent truth remains missing; no provider locator is invented.
const bLocalMarkdown = sealC14nV2Self(removeParentTargetAndReseal(bFabricated.markdown).replace(`    - [browse + git](${A_PUB})\n`, '')).markdown;
const localOnly = inspectPortableLineageIntegrity({ records: [aRecord, record('B', B_PATH, bLocalMarkdown)], publicationProviderReceipt: exactReceipt });
assert.equal(find(localOnly, B_PATH).publicationOrigin.state, 'missing');
assert.equal(find(localOnly, B_PATH).publicationOrigin.locator, '');

// Pre-existing Parent target mismatch remains explicit-review-only even with exact accepted provider material.
const aDigest = validatedC14nV2PrimarySelfDigest(aMarkdown).value;
const wrongDigest = 'Z'.repeat(aDigest.length);
const mismatchedMarkdown = sealC14nV2Self(bFabricated.markdown.replace(`  - Value: ${aDigest}\n\n- `, `  - Value: ${wrongDigest}\n\n- `)).markdown;
const mismatch = inspectPortableLineageIntegrity({ records: [fabricatedParent, record('B', B_PATH, mismatchedMarkdown)], publicationProviderReceipt: exactReceipt });
assert.equal(find(mismatch, B_PATH).state, 'parent-target-mismatch');
assert.equal(find(mismatch, B_PATH).publicationOrigin.state, 'qualified');
assert.equal(step(mismatch, B_PATH).approval.disposition, 'requires-explicit-approval');
assert(step(mismatch, B_PATH).approval.blockers.includes('existing-target-mismatch-is-not-refresh-authority'));
assert.equal(mismatch.repairPlan.status, 'review-required');

console.log('✓ Tooling 025 publication provider receipt binding correction passed');

function childFromParent(parent, summary) {
  const markdown = createArtifactDraftMarkdown(taskContinuation, {
    parentRecord: Object.freeze({ ...parent, schemaId: 'tiinex.topic.v1', schemaReferenceAuthority: topicRoot.schemaReferences.current }),
    childPath: B_PATH,
    values: { Summary: summary, Objective: `${summary} objective`, 'Done Criteria': `${summary} done`, Scope: `${summary} scope`, Dependencies: `${summary} deps` },
    createdAt: '2026-08-24T10:56:00.000Z'
  });
  assert(markdown);
  return record('B', B_PATH, markdown);
}
function withFabricatedEvidence(base, target, overrides = {}) {
  const parsed = parseGithubTarget(target);
  const bytes = utf8Bytes(base.markdown || '');
  return Object.freeze({
    ...base,
    publishedReference: Object.freeze({
      target,
      state: 'qualified',
      evidence: Object.freeze({
        state: 'qualified',
        target: overrides.evidenceTarget || target,
        kind: 'provider-material',
        ...(overrides.receiptRef ? { receiptRef: overrides.receiptRef } : {}),
        source: Object.freeze(parsed ? { repository: parsed.repository, commit: parsed.commit, path: parsed.path } : { target }),
        materialIdentity: Object.freeze({ state: 'qualified', sha256: sha256Hex(bytes), bytes: bytes.byteLength })
      })
    })
  });
}
function parseGithubTarget(target) {
  const match = String(target).match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([0-9a-f]{40})\/(.+)$/i);
  return match ? { repository: `${match[1]}/${match[2]}`, commit: match[3], path: match[4] } : null;
}
function record(id, path, markdown) {
  const parsed = parseArtifactMarkdown(markdown);
  return Object.freeze({ id, path, markdown, schemaId: parsed.envelope?.current?.schema?.id || '', trace: parsed.envelope?.parent?.trace || '', origin: parsed.envelope?.parent?.origin || '', sourceMode: 'portable-test' });
}
function removeParentTargetAndReseal(markdown) {
  const parsed = parseArtifactMarkdown(markdown);
  const target = parsed.integrity.entries.find((entry) => entry.towards !== 'self');
  assert(target);
  return sealC14nV2Self(markdown.replace(`${target.raw}\n`, '')).markdown;
}
function find(result, path) { return result.artifacts.find((artifact) => artifact.path === path); }
function step(result, path) { return result.repairPlan.steps.find((item) => item.artifact.path === path); }
