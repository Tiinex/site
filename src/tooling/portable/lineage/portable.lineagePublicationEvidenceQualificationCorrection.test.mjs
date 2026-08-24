import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown } from '../../../schemas/creation.contracts.js';
import { canonicalC14nV2SelfState, sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { inspectPortableLineageIntegrity } from './lineage.integrity.plan.js';
import { publicationProviderAcceptance } from './publicationProviderReceipt.fixture.mjs';

const A_PATH = '.topics/lineage/A.trace.md';
const B_PATH = '.topics/lineage/B.trace.md';
const COMMIT = 'a'.repeat(40);
const A_PUB = `https://github.com/Tiinex/site/blob/${COMMIT}/.topics/lineage/A.trace.md`;
const A_BRANCH = 'https://github.com/Tiinex/site/blob/main/.topics/lineage/A.trace.md';
const topicRoot = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'create-artifact' });
const taskContinuation = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record' });
const aMarkdown = createArtifactDraftMarkdown(topicRoot, {
  values: { Summary: 'A', 'Current Read': 'A read', 'Design Direction': 'A direction', 'Next Artifacts': 'B' },
  createdAt: '2026-08-24T09:00:00.000Z'
});
assert.equal(canonicalC14nV2SelfState(aMarkdown).state, 'verified');
const aRecord = record('A', A_PATH, aMarkdown);

// Lexical commit-pinned shape alone is declared immutable-looking evidence, never qualification authority.
const lexicalParent = Object.freeze({ ...aRecord, publishedReference: Object.freeze({ target: A_PUB, state: 'qualified' }) });
const bLexical = childFromParent(lexicalParent, 'B lexical');
const bLexicalSelfOnly = record('B', B_PATH, removeParentTargetAndReseal(bLexical.markdown));
const lexical = inspectPortableLineageIntegrity({ records: [lexicalParent, bLexicalSelfOnly] });
const lexicalArtifact = find(lexical, B_PATH);
assert.equal(lexicalArtifact.state, 'parent-target-missing');
assert.equal(lexicalArtifact.publicationOrigin.state, 'unresolved');
assert.equal(lexicalArtifact.publicationOrigin.locatorState, 'commit-pinned-github-blob');
assert.notEqual(lexicalArtifact.publicationOrigin.evidenceState, 'qualified');
assert.equal(lexicalArtifact.publicationOrigin.providerRequirement.required, true);
assert.equal(lexicalArtifact.publicationOrigin.providerRequirement.mode, 'host-mediated');
assert.equal(lexicalArtifact.publicationOrigin.providerRequirement.action, 'repositoryRead');
assert.equal(lexicalArtifact.publicationOrigin.providerRequirement.remoteFetchPerformed, false);
assert.equal(step(lexical, B_PATH).approval.disposition, 'blocked');
assert(step(lexical, B_PATH).approval.blockers.includes('publication-origin-unresolved'));

// Exact provider/source evidence must bind target, repository identity, commit/path, and exact loaded Parent bytes.
const qualifiedParent = withEvidence(aRecord, A_PUB);
const bQualified = childFromParent(qualifiedParent, 'B qualified');
const bQualifiedSelfOnly = record('B', B_PATH, removeParentTargetAndReseal(bQualified.markdown));
const qualified = inspectPortableLineageIntegrity({
  records: [qualifiedParent, bQualifiedSelfOnly],
  publicationProviderAcceptance: publicationProviderAcceptance({ repository: 'Tiinex/site', commit: COMMIT, path: A_PATH, content: aMarkdown })
});
const qualifiedArtifact = find(qualified, B_PATH);
assert.equal(qualifiedArtifact.publicationOrigin.state, 'qualified');
assert.equal(qualifiedArtifact.publicationOrigin.locatorState, 'commit-pinned-github-blob');
assert.equal(qualifiedArtifact.publicationOrigin.evidenceState, 'qualified');
assert.equal(qualifiedArtifact.publicationOrigin.providerRequirement.required, false);
assert.equal(step(qualified, B_PATH).approval.disposition, 'proposed');

// Exact target mismatch rejects the evidence rather than treating caller state=qualified as an escape hatch.
const targetMismatchParent = withEvidence(aRecord, A_PUB, { evidenceTarget: `${A_PUB}?wrong=1` });
const bTargetMismatch = childFromParent(Object.freeze({ ...targetMismatchParent, publishedReference: Object.freeze({ ...targetMismatchParent.publishedReference, target: A_PUB }) }), 'B target mismatch');
const targetMismatch = inspectPortableLineageIntegrity({ records: [targetMismatchParent, record('B', B_PATH, removeParentTargetAndReseal(bTargetMismatch.markdown))] });
assert.equal(find(targetMismatch, B_PATH).publicationOrigin.state, 'contradictory');
assert.equal(find(targetMismatch, B_PATH).publicationOrigin.reason, 'publication-evidence-target-mismatch');
assert.equal(step(targetMismatch, B_PATH).approval.disposition, 'blocked');

// Exact target with mismatching provider material identity remains contradictory and blocked.
const bytesMismatchParent = withEvidence(aRecord, A_PUB, { sha256: '0'.repeat(64) });
const bBytesMismatch = childFromParent(bytesMismatchParent, 'B material mismatch');
const bytesMismatch = inspectPortableLineageIntegrity({ records: [bytesMismatchParent, record('B', B_PATH, removeParentTargetAndReseal(bBytesMismatch.markdown))] });
assert.equal(find(bytesMismatch, B_PATH).publicationOrigin.state, 'contradictory');
assert.equal(find(bytesMismatch, B_PATH).publicationOrigin.reason, 'publication-evidence-material-sha256-mismatch');

// A mutable GitHub branch locator stays stale even if a caller attaches apparently qualified evidence.
const branchParent = withEvidence(aRecord, A_BRANCH, { genericTarget: A_BRANCH });
const bBranch = childFromParent(branchParent, 'B branch');
const branch = inspectPortableLineageIntegrity({ records: [branchParent, record('B', B_PATH, removeParentTargetAndReseal(bBranch.markdown))] });
assert.equal(find(branch, B_PATH).publicationOrigin.state, 'stale');
assert.equal(find(branch, B_PATH).publicationOrigin.locatorState, 'mutable-or-noncanonical-github-blob');
assert.equal(step(branch, B_PATH).approval.disposition, 'blocked');

// Local unpublished Parent representation remains truthful and no locator is fabricated.
const bLocalOnlyMarkdown = sealC14nV2Self(removeParentTargetAndReseal(bLexical.markdown).replace(`    - [browse + git](${A_PUB})\n`, '')).markdown;
const localOnly = inspectPortableLineageIntegrity({ records: [aRecord, record('B', B_PATH, bLocalOnlyMarkdown)] });
assert.equal(find(localOnly, B_PATH).publicationOrigin.state, 'missing');
assert.equal(find(localOnly, B_PATH).publicationOrigin.locator, '');
assert.equal(step(localOnly, B_PATH).publicationLocator, '');

// A pre-existing digest mismatch remains review-required regardless of locator verification state.
const aDigest = validatedC14nV2PrimarySelfDigest(aMarkdown).value;
const wrong = 'Z'.repeat(aDigest.length);
const mismatchedMarkdown = sealC14nV2Self(bLexical.markdown.replace(`  - Value: ${aDigest}\n\n- `, `  - Value: ${wrong}\n\n- `)).markdown;
const mismatch = inspectPortableLineageIntegrity({ records: [lexicalParent, record('B', B_PATH, mismatchedMarkdown)] });
assert.equal(find(mismatch, B_PATH).state, 'parent-target-mismatch');
assert.equal(find(mismatch, B_PATH).publicationOrigin.state, 'unresolved');
assert.equal(step(mismatch, B_PATH).approval.disposition, 'requires-explicit-approval');
assert(step(mismatch, B_PATH).approval.blockers.includes('existing-target-mismatch-is-not-refresh-authority'));
assert(step(mismatch, B_PATH).approval.blockers.includes('publication-origin-unresolved'));
assert.equal(mismatch.repairPlan.status, 'review-required');
assert.match(mismatch.compatibility.note, /publicationOrigin\.state=qualified requires accepted repository-read provider material/);
assert.equal(mismatch.boundary.remoteWrite, false);
assert.equal(mismatch.boundary.sourceMutation, false);

console.log('✓ Tooling 024 publication locator evidence qualification correction passed');

function childFromParent(parent, summary) {
  const markdown = createArtifactDraftMarkdown(taskContinuation, {
    parentRecord: Object.freeze({ ...parent, schemaId: 'tiinex.topic.v1', schemaReferenceAuthority: topicRoot.schemaReferences.current }),
    childPath: B_PATH,
    values: { Summary: summary, Objective: `${summary} objective`, 'Done Criteria': `${summary} done`, Scope: `${summary} scope`, Dependencies: `${summary} deps` },
    createdAt: '2026-08-24T09:01:00.000Z'
  });
  assert(markdown);
  return record('B', B_PATH, markdown);
}
function withEvidence(base, target, overrides = {}) {
  const parsed = parseGithubTarget(target);
  const bytes = utf8Bytes(base.markdown || '');
  const evidenceTarget = overrides.evidenceTarget || target;
  const source = parsed
    ? { repository: parsed.repository, commit: parsed.commit, path: parsed.path }
    : { target: overrides.genericTarget || target };
  return Object.freeze({
    ...base,
    publishedReference: Object.freeze({
      target,
      state: 'qualified',
      evidence: Object.freeze({
        state: 'qualified',
        target: evidenceTarget,
        kind: 'provider-material',
        source: Object.freeze(source),
        materialIdentity: Object.freeze({ state: 'qualified', sha256: overrides.sha256 || sha256Hex(bytes), bytes: bytes.byteLength })
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
