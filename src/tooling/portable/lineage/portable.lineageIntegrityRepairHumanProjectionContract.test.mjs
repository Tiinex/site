import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown } from '../../../schemas/creation.contracts.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { buildPortableLineageIntegrityRepairProjection } from './lineage.integrity.projection.js';
import { applyPortableLineageIntegrityRepair } from './lineage.integrity.apply.js';
import { publicationProviderAcceptance } from './publicationProviderReceipt.fixture.mjs';
import { runPortableOperation } from '../operation.catalog.js';

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
const aRecord = record('A', A_PATH, aMarkdown);
const aParent = withPublication(aRecord, A_PUB);
const bHealthyMarkdown = createArtifactDraftMarkdown(taskContinuation, { parentRecord: aParent, childPath: B_PATH, values: taskValues('B'), createdAt: '2026-08-24T09:01:00.000Z' });
const bHealthy = record('B', B_PATH, bHealthyMarkdown);
const providerA = providerFor(A_PUB, aMarkdown);

// 1. Healthy chain: compact human output and separate machine evidence.
const healthy = buildPortableLineageIntegrityRepairProjection({ records: [aParent, bHealthy], publicationProviderAcceptance: providerA, localOwned: true });
const healthyB = opportunity(healthy, B_PATH);
assert.equal(healthy.schema, 'tiinex.portable.lineage-integrity-repair-projection.v1');
assert.equal(healthyB.state, 'healthy');
assert.equal(healthyB.findingClass, 'healthy-lineage');
assert.equal(healthyB.human.headline, 'Lineage integrity is healthy.');
assert.equal(healthyB.machineEvidence.inspectionState, 'healthy');
assert.equal(healthy.boundary.machineEvidenceSeparateFromHumanExplanation, true);
assert.deepEqual(healthy.boundary.sharedConsumers, ['Viewer', 'VS Code', 'CLI', 'LLM']);
assert.equal(healthy.host.remotePublication.implementedByProjection, false);
assert.match(healthy.boundary.continuityCreationConformance, /Tooling 019/);
assert.equal(healthy.boundary.continuityCreationConformance.includes('028'), false);

// 2. Missing Parent target: ready for explicit local approval, body remains unauthorized.
const bSelfOnlyMarkdown = removeParentTargetAndReseal(bHealthyMarkdown);
const bSelfOnly = record('B', B_PATH, bSelfOnlyMarkdown);
const missing = buildPortableLineageIntegrityRepairProjection({ records: [aParent, bSelfOnly], publicationProviderAcceptance: providerA, localOwned: true });
const missingB = opportunity(missing, B_PATH);
assert.equal(missingB.state, 'repair-available');
assert.equal(missingB.findingClass, 'missing-parent-target');
assert.equal(missingB.proposedMutation.bodyMutation, false);
assert.deepEqual(missingB.proposedMutation.headerFields, []);
assert(missingB.proposedMutation.footerChanges.includes('Parent-target c14n-v2 entry'));
assert.equal(actionState(missingB, 'approve'), 'required');
assert.equal(actionState(missingB, 'apply-local-result'), 'after-approval');

// 3. Existing mismatch stays trust-sensitive review; projection does not create refresh authority.
const parentDigest = validatedC14nV2PrimarySelfDigest(aMarkdown).value;
const bMismatchMarkdown = replaceParentDigestAndReseal(bHealthyMarkdown, 'Z'.repeat(parentDigest.length));
const mismatch = buildPortableLineageIntegrityRepairProjection({ records: [aParent, record('B', B_PATH, bMismatchMarkdown)], publicationProviderAcceptance: providerA, localOwned: true });
const mismatchB = opportunity(mismatch, B_PATH);
assert.equal(mismatchB.state, 'review-required');
assert.equal(mismatchB.findingClass, 'parent-target-mismatch');
assert.equal(mismatchB.decision.semanticAuthorityRequired, true);
assert(mismatchB.decision.blockers.includes('existing-target-mismatch-is-not-refresh-authority'));
assert.equal(mismatchB.human.headline, 'Parent target mismatch needs review.');

// 4. Accepted exact provider material can surface one qualified immutable permalink opportunity
// even when the child lacks browse+git, but nothing is applied automatically.
const bUnpublishedMarkdown = sealC14nV2Self(removeBrowseGit(removeParentTargetAndReseal(bHealthyMarkdown))).markdown;
const bUnpublished = record('B', B_PATH, bUnpublishedMarkdown);
const permalink = buildPortableLineageIntegrityRepairProjection({ records: [aRecord, bUnpublished], publicationProviderAcceptance: providerA, localOwned: true });
const permalinkB = opportunity(permalink, B_PATH);
assert.equal(permalinkB.state, 'repair-available');
assert.equal(permalinkB.findingClass, 'qualified-permalink-repair');
assert.equal(permalinkB.publicationLocator.state, 'qualified-repair-available');
assert.equal(permalinkB.publicationLocator.candidate, A_PUB);
assert.deepEqual(permalinkB.proposedMutation.headerFields, ['Parent.Origin.browse+git']);
assert.equal(permalinkB.machineEvidence.planAction, 'update-parent-origin-permalink');
assert.equal(permalink.application, null);
const permalinkStep = findStep(permalink.preparedRepairPlan, B_PATH);
assert.equal(permalinkStep.approval.disposition, 'proposed');
assert.equal(permalinkStep.candidateParentOrigin, A_PUB);

// The prepared step remains a Tooling 021 plan: explicit approval + accepted provider bytes are still required.
const permalinkApplied = applyPortableLineageIntegrityRepair({
  records: [aRecord, bUnpublished],
  repairPlan: permalink.preparedRepairPlan,
  approvals: [{ path: B_PATH, state: 'approved', publicationDisposition: 'qualified-exact-publication' }],
  publicationProviderAcceptance: providerA
});
assert.equal(permalinkApplied.status, 'changed');
assert.equal(parentBrowseGit(changed(permalinkApplied, B_PATH).markdown), A_PUB);
assert.equal(parentTarget(changed(permalinkApplied, B_PATH).markdown).towards, A_PUB);

// 5. Local-only/unpublished Parent stays blocked without provider evidence; no locator is fabricated.
const unpublished = buildPortableLineageIntegrityRepairProjection({ records: [aRecord, bUnpublished], localOwned: true });
const unpublishedB = opportunity(unpublished, B_PATH);
assert.equal(unpublishedB.state, 'blocked');
assert.equal(unpublishedB.findingClass, 'publication-locator-unavailable');
assert.equal(unpublishedB.publicationLocator.candidate, '');
assert.equal(unpublishedB.publicationLocator.fabricated, false);
assert.equal(unpublishedB.human.headline, 'Parent publication locator is unavailable.');

// 6. Cascade preview is deterministic and remains a decision boundary, not automatic descendant rewrite.
const bSelfOnlyParent = withPublication(bSelfOnly, B_PUB);
const cMarkdown = createArtifactDraftMarkdown(taskContinuation, { parentRecord: bSelfOnlyParent, childPath: C_PATH, values: taskValues('C'), createdAt: '2026-08-24T09:02:00.000Z' });
const cRecord = record('C', C_PATH, cMarkdown);
const cascade = buildPortableLineageIntegrityRepairProjection({ records: [aParent, bSelfOnlyParent, cRecord], publicationProviderAcceptances: [providerA, providerFor(B_PUB, bSelfOnlyMarkdown)], localOwned: true });
const cascadeB = opportunity(cascade, B_PATH);
assert.equal(cascadeB.state, 'repair-available');
assert.equal(cascadeB.cascadeImpact.count, 1);
assert.equal(cascadeB.cascadeImpact.descendants[0].path, C_PATH);
assert.equal(cascade.preparedRepairPlan.boundary.descendantRefreshAutomatic, false);

// 7. Repaired local result projects export readiness without claiming source/publication mutation.
const appliedMissing = applyPortableLineageIntegrityRepair({
  records: [aParent, bSelfOnly], repairPlan: missing.preparedRepairPlan,
  approvals: [{ path: B_PATH, state: 'approved' }], publicationProviderAcceptance: providerA
});
assert.equal(appliedMissing.status, 'changed');
const repaired = buildPortableLineageIntegrityRepairProjection({ records: [aParent, bSelfOnly], publicationProviderAcceptance: providerA, localOwned: true, application: appliedMissing });
const repairedB = opportunity(repaired, B_PATH);
assert.equal(repairedB.state, 'local-result-ready');
assert.equal(repairedB.findingClass, 'repaired-local-result');
assert.equal(actionState(repairedB, 'export-changeset'), 'available');
assert.equal(repaired.application.sourceMutation, false);
assert.equal(repaired.application.remoteWrite, false);
assert.equal(repaired.application.publicationMutation, false);

// Handoff package intake is semantically equivalent after workspace-path projection, but carriage never authorizes apply.
const packageProjection = buildPortableLineageIntegrityRepairProjection({
  files: packageFiles([aParent, bSelfOnly]), publicationProviderAcceptance: providerA
});
const packageB = opportunity(packageProjection, B_PATH);
assert.equal(packageProjection.intake.kind, 'handoff-package');
assert.equal(packageProjection.intake.selectedWorkspaceId, 'fixture');
assert.equal(packageProjection.intake.packageCarriageAuthorizesRepair, false);
assert.equal(packageProjection.intake.localOwned, false);
assert.equal(packageB.state, missingB.state);
assert.equal(packageB.findingClass, missingB.findingClass);
assert.deepEqual(packageB.parentTarget, missingB.parentTarget);
assert.deepEqual(packageB.proposedMutation, missingB.proposedMutation);
assert.deepEqual(packageB.human, missingB.human);
assert.equal(actionState(packageB, 'apply-local-result'), 'requires-local-owned-material');

// Host remote-write capability remains a requirement projection, never an implemented publication path.
const remoteCapable = buildPortableLineageIntegrityRepairProjection({
  records: [aParent, bSelfOnly], publicationProviderAcceptance: providerA, localOwned: true,
  capabilities: { mutation: { remoteWriteAvailable: true, remoteWriteAuthorized: false } }
});
assert.equal(remoteCapable.host.remotePublication.state, 'authorization-required');
const remoteAuthorized = buildPortableLineageIntegrityRepairProjection({
  records: [aParent, bSelfOnly], publicationProviderAcceptance: providerA, localOwned: true,
  capabilities: { mutation: { remoteWriteAvailable: true, remoteWriteAuthorized: true } }
});
assert.equal(remoteAuthorized.host.remotePublication.state, 'authorized-host-adapter-required');
assert.equal(remoteAuthorized.host.remotePublication.implementedByProjection, false);

// Static snapshots pin the shared human/action vocabulary for deterministic adapter reuse.
const generatedProjectionFixtures = {
  'healthy-chain': fixtureView(healthyB),
  'missing-parent-target': fixtureView(missingB),
  'mismatch-review': fixtureView(mismatchB),
  'qualified-permalink-repair': fixtureView(permalinkB),
  'unpublished-parent-blocker': fixtureView(unpublishedB),
  'cascade-preview': fixtureView(cascadeB),
  'repaired-local-ready-for-export': fixtureView(repairedB)
};
const fixtureDocument = JSON.parse(readFileSync(new URL('./fixtures/lineage.integrity.repair-projection.v1.examples.json', import.meta.url), 'utf8'));
assert.equal(fixtureDocument.schema, 'tiinex.portable.lineage-integrity-repair-projection-fixtures.v1');
assert.deepEqual(fixtureDocument.examples, generatedProjectionFixtures);

// Operation catalog exposes the same serializable adapter-neutral contract.
const operationResult = await runPortableOperation('lineage-integrity-project', { records: [aParent, bSelfOnly], publicationProviderAcceptance: providerA, localOwned: true });
assert.equal(operationResult.operation, 'lineage-integrity-project');
assert.equal(operationResult.projection.schema, 'tiinex.portable.lineage-integrity-repair-projection.v1');
assert.equal(operationResult.boundary.remoteWrite, false);
assert.doesNotThrow(() => JSON.stringify(operationResult));

console.log('✓ Tooling 022 adapter-neutral lineage repair human projection contract passed');

function fixtureView(item) {
  return {
    state: item.state,
    findingClass: item.findingClass,
    severity: item.severity,
    trustImpact: item.trustImpact,
    artifact: { path: item.artifact.path },
    parentTarget: item.parentTarget,
    publicationLocator: item.publicationLocator,
    proposedMutation: item.proposedMutation,
    cascadeImpact: item.cascadeImpact,
    decision: item.decision,
    safeActions: item.safeActions,
    human: item.human,
    machineEvidence: {
      inspectionState: item.machineEvidence.inspectionState,
      planAction: item.machineEvidence.planAction,
      planDisposition: item.machineEvidence.planDisposition,
      parentMaterialAvailable: item.machineEvidence.parentMaterialAvailable,
      projectionEvidence: item.machineEvidence.projectionEvidence,
      receipt: item.machineEvidence.receipt
    }
  };
}

function record(id, path, markdown) {
  const parsed = parseArtifactMarkdown(markdown);
  return Object.freeze({ id, path, markdown, schemaId: parsed.envelope?.current?.schema?.id || '', hasContinuityContext: parsed.hasContinuityContext, hasIntegrity: parsed.hasIntegrity, integrity: parsed.integrity, trace: parsed.envelope?.parent?.trace || '', origin: parsed.envelope?.parent?.origin || '', sourceMode: 'portable-test' });
}
function withPublication(base, target) { return Object.freeze({ ...base, schemaId: base.schemaId || 'tiinex.task.v1', schemaReferenceAuthority: base.schemaId === 'tiinex.topic.v1' ? topicRoot.schemaReferences.current : taskContinuation.schemaReferences.current, publishedReference: Object.freeze({ target, state: 'qualified' }) }); }
function providerFor(target, content) { const parsed = new URL(target); const parts = parsed.pathname.split('/').filter(Boolean); return publicationProviderAcceptance({ repository: `${parts[0]}/${parts[1]}`, commit: parts[3], path: parts.slice(4).join('/'), content }); }
function opportunity(result, path) { const item = result.opportunities.find((entry) => entry.artifact.path === path); assert(item, `missing opportunity ${path}`); return item; }
function findStep(plan, path) { return plan.steps.find((step) => step.artifact.path === path); }
function actionState(item, id) { return item.safeActions.find((action) => action.id === id)?.state || ''; }
function changed(result, path) { return result.changeset.records.find((item) => item.path === path); }
function parentBrowseGit(markdown) { return parseArtifactMarkdown(markdown).envelope.parent.originEntries.find((entry) => entry.label === 'browse + git')?.target || ''; }
function parentTarget(markdown) { const entry = parseArtifactMarkdown(markdown).integrity.entries.find((item) => item.method === 'sha256-base64url-c14n-v2' && item.towards !== 'self'); return entry ? { towards: entry.towards, value: entry.value } : null; }
function removeParentTargetAndReseal(markdown) { const target = parseArtifactMarkdown(markdown).integrity.entries.find((entry) => entry.method === 'sha256-base64url-c14n-v2' && entry.towards !== 'self'); assert(target); return sealC14nV2Self(markdown.replace(`${target.raw}\n`, '')).markdown; }
function replaceParentDigestAndReseal(markdown, value) { const target = parseArtifactMarkdown(markdown).integrity.entries.find((entry) => entry.method === 'sha256-base64url-c14n-v2' && entry.towards !== 'self'); const next = markdown.replace(target.raw, target.raw.replace(/(\n\s+- Value:\s*).*/, `$1${value}`)); return sealC14nV2Self(next).markdown; }
function removeBrowseGit(markdown) { return markdown.replace(/^\s{4}- \[browse \+ git\]\([^\n]+\)\r?\n/m, ''); }
function packageFiles(records) { return [{ path: 'tiinex.package/handoff-carrier.json', content: '{"schema":"fixture"}', kind: 'asset' }, ...records.map((item) => ({ path: `handoff.workspaces/fixture/${item.path}`, content: item.markdown, kind: 'record' }))]; }
