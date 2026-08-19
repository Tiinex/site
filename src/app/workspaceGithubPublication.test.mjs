import assert from 'node:assert/strict';
import { buildWorkspaceGithubPublicationProduct, confirmWorkspaceGithubPublicationMutation, copyWorkspaceGithubPublicationPayload, GITHUB_PUBLICATION_MODE, openWorkspaceGithubPublicationTarget, publicationProgressFor, verifyWorkspaceGithubPublication } from './workspaceGithubPublication.js';

const markdown = '# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-19T00:00:00.000Z\n  - Summary: Guided publication fixture\n  - Status: draft/local\n\n---\n\n# Guided publication fixture\n\nReadable exact local payload.\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n';
const local = { id: 'local-1', title: 'Local draft', path: 'local.trace.md', markdown, schemaId: 'tiinex.topic.v1', sourceMode: 'local-transition', source: { adapterId: 'local' } };
const source = { ...local, id: 'source-1', title: 'Source', sourceMode: 'source-backed', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main' } };
const workspace = { id: 'w449', title: 'v449', records: [local, source], assets: [] };
const repo = 'Tiinex/docs';
const issueA = 'https://github.com/Tiinex/docs/issues/12';
const issueB = 'https://github.com/Tiinex/docs/issues/13';
const commentA = `${issueA}#issuecomment-34`;
const commentB = `${issueA}#issuecomment-35`;
const fakeFetch = async (url) => ({ ok: true, status: 200, json: async () => ({ id: url.includes('comments') ? 34 : 12, body: markdown, updated_at: '2026-08-19T12:00:00Z' }) });

const cases = [
  [GITHUB_PUBLICATION_MODE.createIssue, '', issueA, issueB, 'github.issue.body', 'create-new'],
  [GITHUB_PUBLICATION_MODE.createComment, issueA, commentA, commentB, 'github.issue.comment', 'create-comment'],
  [GITHUB_PUBLICATION_MODE.updateIssue, issueA, issueA, issueB, 'github.issue.body', 'update-known'],
  [GITHUB_PUBLICATION_MODE.updateComment, commentA, commentA, commentB, 'github.issue.comment', 'update-known']
];

for (const [mode, targetInput, exactTarget, differentTarget, targetKind, mutation] of cases) {
  const product = buildWorkspaceGithubPublicationProduct(workspace, { mode, recordId: local.id, repository: repo, targetInput, finalTarget: exactTarget });
  assert.equal(product.plan.status, 'ready', `${mode}: shared plan must qualify`);
  assert.equal(product.plan.destination.targetKind, targetKind);
  assert.equal(product.plan.mutationPolicy, mutation);
  assert.equal(product.plan.outboundPayload.content, markdown);
  assert.equal(product.mutationTargetQualified, true, `${mode}: exact mutation target must qualify through accepted parser seam`);
  assert.equal(product.mutationTarget.inputTarget, exactTarget);
  assert.equal(product.mutationTarget.targetKind, targetKind);

  let readCalls = 0;
  const noAttestation = await verifyWorkspaceGithubPublication(product.plan, { finalTarget: exactTarget, fetchImpl: async (...args) => { readCalls += 1; return fakeFetch(...args); } });
  assert.equal(noAttestation.ok, false, `${mode}: matching remote body is not write evidence`);
  assert.equal(noAttestation.error, 'publication.verify.human-mutation-attestation-required');
  assert.equal(noAttestation.result.sourceBinding, null);
  assert.equal(noAttestation.result.receipt.remoteWritePerformed, false);
  assert.equal(readCalls, 0, `${mode}: unattested target fails before remote read`);

  const attested = confirmWorkspaceGithubPublicationMutation(product.plan, { finalTarget: exactTarget, clock: () => Date.parse('2026-08-19T12:00:00Z') });
  assert.equal(attested.ok, true, `${mode}: exact target-bound confirmation qualifies`);
  assert.equal(attested.mutationAttestation.planSha256, product.plan.planSha256);
  assert.equal(attested.mutationAttestation.mutationTarget.inputTarget, exactTarget);
  assert.equal(attested.mutationAttestation.mutationTarget.targetKind, targetKind);
  assert.equal(typeof attested.mutationAttestation.mutationTarget.issueNumberLexeme, 'string', 'numeric identity stays lexical in operational evidence');

  const verified = await verifyWorkspaceGithubPublication(product.plan, { finalTarget: exactTarget, mutationAttestation: attested.mutationAttestation, fetchImpl: fakeFetch, clock: () => Date.parse('2026-08-19T12:00:01Z') });
  assert.equal(verified.ok, true, `${mode}: same exact plan + target + remote payload may qualify`);
  assert.equal(verified.result.status, 'success');
  assert.equal(verified.result.receipt.remoteWritePerformed, true);
  assert.equal(verified.result.sourceBinding.remoteTarget.inputTarget, exactTarget);
  assert.equal(verified.executionAttestation.mutationTarget.inputTarget, exactTarget);

  let mismatchReads = 0;
  const mismatch = await verifyWorkspaceGithubPublication(product.plan, { finalTarget: differentTarget, mutationAttestation: attested.mutationAttestation, fetchImpl: async (...args) => { mismatchReads += 1; return fakeFetch(...args); } });
  assert.equal(mismatch.ok, false, `${mode}: attestation for target A must never qualify target B`);
  assert.equal(mismatchReads, 0, `${mode}: target mismatch must fail before remote read`);
  assert.equal(mismatch.result.sourceBinding, null);
  assert.equal(mismatch.result.receipt.remoteWritePerformed, false);

  const progress = { copiedPlanSha256: product.plan.planSha256, openedPlanSha256: product.plan.planSha256, mutationAttestation: attested.mutationAttestation, verificationPlanSha256: product.plan.planSha256, result: verified.result };
  assert.equal(publicationProgressFor(product.plan, exactTarget, progress).attested, true, `${mode}: attestation visible only for exact target`);
  assert.equal(publicationProgressFor(product.plan, exactTarget, progress).verified, true);
  assert.equal(publicationProgressFor(product.plan, differentTarget, progress).attested, false, `${mode}: changing final target invalidates visible attestation`);
  assert.equal(publicationProgressFor(product.plan, differentTarget, progress).verified, false);

  if (mutation === 'update-known') {
    const rebound = confirmWorkspaceGithubPublicationMutation(product.plan, { finalTarget: differentTarget });
    assert.equal(rebound.ok, false, `${mode}: update-known confirmation cannot silently rebind to a different target`);
    assert.equal(rebound.mutationAttestation, null);
  }
}

const createIssue = buildWorkspaceGithubPublicationProduct(workspace, { mode: GITHUB_PUBLICATION_MODE.createIssue, recordId: local.id, repository: repo });
assert.equal(createIssue.mutationTargetQualified, false, 'create-new needs final target before attestation');
assert.equal(confirmWorkspaceGithubPublicationMutation(createIssue.plan, {}).ok, false, 'missing create-new target cannot attest');
assert.equal(confirmWorkspaceGithubPublicationMutation(createIssue.plan, { finalTarget: 'https://github.com/Tiinex/docs/issues/01' }).ok, false, 'lexically invalid target cannot attest');
assert.equal(confirmWorkspaceGithubPublicationMutation(createIssue.plan, { finalTarget: 'https://github.com/OpenAI/docs/issues/12' }).ok, false, 'wrong repository target cannot attest');

const blockedSource = buildWorkspaceGithubPublicationProduct(workspace, { mode: GITHUB_PUBLICATION_MODE.createIssue, recordId: source.id, repository: repo });
assert.equal(blockedSource.plan.status, 'blocked');
assert.ok(blockedSource.plan.findings.some((f) => f.code === 'publication.plan.input.source-backed' || f.code === 'publication.plan.input.not-preflight-qualified'));
const missingRepo = buildWorkspaceGithubPublicationProduct(workspace, { mode: GITHUB_PUBLICATION_MODE.createIssue, recordId: local.id, repository: '' });
assert.equal(missingRepo.plan.status, 'blocked');

const writes = [];
assert.equal((await copyWorkspaceGithubPublicationPayload(createIssue.plan, { clipboard: { writeText: async (text) => writes.push(text) } })).ok, true);
assert.deepEqual(writes, [markdown]);
let opened = '';
assert.equal(openWorkspaceGithubPublicationTarget(createIssue.plan, { open: (url, target, features) => { opened = `${url}|${target}|${features}`; return {}; } }).ok, true);
assert.ok(opened.startsWith('https://github.com/Tiinex/docs/issues/new|_blank|noopener,noreferrer'));
const copyOpenOnly = await verifyWorkspaceGithubPublication(createIssue.plan, { finalTarget: issueA, fetchImpl: fakeFetch });
assert.equal(copyOpenOnly.ok, false, 'Copy/Open completion remains non-write evidence');

const targetBound = confirmWorkspaceGithubPublicationMutation(createIssue.plan, { finalTarget: issueA, clock: () => Date.parse('2026-08-19T12:00:00Z') }).mutationAttestation;
const wrongPayload = await verifyWorkspaceGithubPublication(createIssue.plan, { finalTarget: issueA, mutationAttestation: targetBound, fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ id: 12, body: 'different body' }) }) });
assert.equal(wrongPayload.ok, false);
assert.equal(wrongPayload.result.sourceBinding, null);
assert.ok(wrongPayload.result.findings.some((f) => f.code === 'publication.result.payload-verification.mismatch'));
const unavailable = await verifyWorkspaceGithubPublication(createIssue.plan, { finalTarget: issueA, mutationAttestation: targetBound, fetchImpl: async () => { throw new Error('offline'); } });
assert.equal(unavailable.ok, false);
assert.equal(unavailable.result.sourceBinding, null);

const changed = { ...workspace, records: [{ ...local, markdown: markdown + '\nchanged' }, source] };
const changedProduct = buildWorkspaceGithubPublicationProduct(changed, { mode: GITHUB_PUBLICATION_MODE.createIssue, recordId: local.id, repository: repo, finalTarget: issueA });
assert.notEqual(changedProduct.plan.planSha256, createIssue.plan.planSha256, 'payload change invalidates exact plan identity');
assert.equal(publicationProgressFor(changedProduct.plan, issueA, { mutationAttestation: targetBound }).attested, false);
let staleReads = 0;
const stale = await verifyWorkspaceGithubPublication(changedProduct.plan, { finalTarget: issueA, mutationAttestation: targetBound, fetchImpl: async (...args) => { staleReads += 1; return fakeFetch(...args); } });
assert.equal(stale.ok, false);
assert.equal(stale.error, 'publication.verify.human-mutation-attestation-required');
assert.equal(staleReads, 0, 'stale-plan attestation fails before remote read');

console.log('workspaceGithubPublication: PASS');
