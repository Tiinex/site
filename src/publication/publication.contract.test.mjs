import assert from 'node:assert/strict';
import { buildPublicationPlan, buildPublicationResult } from './publication.contract.js';
import { acceptPortablePublicationResult, planPortablePublication } from '../tooling/portable/publication/runtime.publication.js';
import { runPortableOperation } from '../tooling/portable/operation.catalog.js';

const markdown = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-19T00:00:00.000Z\n  - Summary: Publication draft\n  - Status: draft/local\n\n---\n\n# Publication draft\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
const record = { id: 'draft-1', title: 'Draft', path: 'topics/draft.md', markdown, schemaId: 'tiinex.topic.v1', sourceMode: 'local-transition', source: { adapterId: 'local' } };
const workspace = { id: 'w-pub', title: 'Publication', records: [record], assets: [] };
const destination = { provider: 'github', repository: 'Tiinex/docs', ref: 'main', path: '.topics/published.trace.md', targetKind: 'github-repo-file' };

const plan = buildPublicationPlan(workspace, { recordId: 'draft-1', destination, mutationPolicy: 'create-or-fail' });
assert.equal(plan.status, 'ready');
assert.equal(plan.localInput.ownership, 'owned-local');
assert.equal(plan.outboundPayload.content, markdown);
assert.ok(plan.outboundPayload.sha256);
assert.equal(plan.verification.required, true);
assert.equal(plan.destination.repository, 'Tiinex/docs');
assert.equal(plan.guarantees.some((line) => line.includes('local input/source state is not mutated')), true);

const sourceBackedPlan = buildPublicationPlan({ id: 'w', records: [{ ...record, id: 'source', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main' } }] }, { recordId: 'source', destination, mutationPolicy: 'create-or-fail' });
assert.equal(sourceBackedPlan.status, 'blocked');
assert.ok(sourceBackedPlan.findings.some((finding) => finding.code === 'publication.plan.input.source-backed'));

const unverified = buildPublicationResult(plan, { state: 'success', verificationStatus: 'not-run' });
assert.equal(unverified.status, 'failure');
assert.equal(unverified.sourceBinding, null);

const commit = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const claimedVerifiedWithoutDigest = buildPublicationResult(plan, { state: 'success', verificationStatus: 'verified', sourceTarget: { adapterId: 'github', repo: 'Tiinex/docs', materializedCommit: commit, path: '.topics/published.trace.md' } });
assert.equal(claimedVerifiedWithoutDigest.status, 'failure');
assert.ok(claimedVerifiedWithoutDigest.findings.some((finding) => finding.code === 'publication.result.payload-verification.missing'));

const success = buildPublicationResult(plan, {
  state: 'success',
  verificationStatus: 'verified',
  verifiedPayloadSha256: plan.outboundPayload.sha256,
  providerReceiptId: 'provider-1',
  sourceTarget: { adapterId: 'github', repo: 'Tiinex/docs', materializedCommit: commit, path: '.topics/published.trace.md', targetKind: 'github-repo-file' }
});
assert.equal(success.status, 'success');
assert.equal(success.sourceBinding.verified, true);
assert.equal(success.sourceBinding.localInputId, 'draft-1');
assert.equal(success.remoteTarget.materializedCommit, commit);
assert.equal(success.receipt.inputSourceUnchanged, true);
assert.equal(success.receipt.remoteWritePerformed, true);

const partial = buildPublicationResult(plan, { state: 'partial', verificationStatus: 'unavailable' });
assert.equal(partial.status, 'partial');
assert.equal(partial.sourceBinding, null);
const failure = buildPublicationResult(plan, { state: 'failure', verificationStatus: 'failed' });
assert.equal(failure.status, 'failure');

const portablePlan = planPortablePublication({ workspace, recordId: 'draft-1', destination, mutationPolicy: 'create-or-fail' });
assert.equal(portablePlan.status, 'ready');
assert.equal(portablePlan.qualification.remoteWrite, false);
const portableResult = acceptPortablePublicationResult({ plan: portablePlan, execution: { state: 'success', verificationStatus: 'verified', verifiedPayloadSha256: plan.outboundPayload.sha256, sourceTarget: { adapterId: 'github', repo: 'Tiinex/docs', materializedCommit: commit, path: '.topics/published.trace.md' } } });
assert.equal(portableResult.status, 'success');
assert.equal(portableResult.qualification.durableSourceBinding, true);
const operation = await runPortableOperation('plan-publication', { workspace, recordId: 'draft-1', destination, mutationPolicy: 'create-or-fail' });
assert.equal(operation.operation, 'plan-publication');
assert.equal(operation.status, 'ready');

console.log('publication.contract: ok');
