import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { runPortableOperation } from '../operation.catalog.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { preflightPortableReduction } from './reduction.preflight.js';

const COMMIT = 'de31f58569550819d89f63dcfbe1abfdfe815ab7';
const OTHER_COMMIT = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const leafPath = '001-1-1-1-1-loom-to-anchor-validation-checkpoint-efficiency-return-handoff.trace.md';
const parentPath = '001-1-1-1-loom-validation-checkpoint-efficiency-implementation-evidence.trace.md';
const placementPath = '022-reduction-composition-destructive-eligibility-recovery.task.trace.md';
const reductionPath = 'reduction-preflight-regression.trace.md';
const [leafMarkdown, parentMarkdown, placementMarkdown] = await Promise.all([
  readFile(`.topics/tooling/${leafPath}`, 'utf8'),
  readFile(`.topics/tooling/${parentPath}`, 'utf8'),
  readFile(`.topics/tooling/${placementPath}`, 'utf8')
]);
const leafRecord = createRecordFromMarkdown(leafMarkdown, { path: leafPath, sourceMode: 'portable-local' });
const parentRecord = createRecordFromMarkdown(parentMarkdown, { path: parentPath, sourceMode: 'portable-local' });
const placementRecord = createRecordFromMarkdown(placementMarkdown, { path: placementPath, sourceMode: 'portable-local' });
const parentDigest = verifiedDigest(parentMarkdown);
const placementDigest = verifiedDigest(placementMarkdown);
const baseReductionMarkdown = sealedReduction({ path: reductionPath, placementPath: parentPath, placementSchema: parentRecord.schemaId, placementDigest: parentDigest, entries: [entry(leafPath, parentPath)] });
const baseReductionRecord = record(baseReductionMarkdown, reductionPath);
const baseRecords = [parentRecord, leafRecord, baseReductionRecord];

const baseInput = (overrides = {}) => ({
  records: baseRecords,
  candidateSet: [{ path: leafPath, action: 'delete', repository: 'Tiinex/site' }],
  reductionArtifactPath: reductionPath,
  immutableSources: [source(leafPath), source(parentPath)],
  snapshots: [snapshot('Tiinex/site', COMMIT)],
  currentnessFacts: [currentness(leafPath, 'closed')],
  lossFacts: [loss(reductionPath, 'none')],
  ...overrides
});

// Ordinary Reduction remains observable composition/recovery only. Destructive eligibility is a separate surface.
const ordinary = preflightPortableReduction({ records: baseRecords, reductionArtifactPath: reductionPath, immutableSources: [source(leafPath), source(parentPath)], lossFacts: [loss(reductionPath, 'none')] });
assert.equal(ordinary.status, 'projection-qualified');
assert.equal(ordinary.composition.state, 'qualified');
assert.equal(ordinary.eligibility.state, 'not-requested');
assert.equal(ordinary.destructiveEligible, false);
assert.equal(ordinary.boundary.ordinaryReductionAuthoritySeparate, true);
assert.equal(ordinary.boundary.destructiveApplyImplemented, false);
assert.equal(ordinary.boundary.sourceMutation, false);

// Exact candidate set + exact snapshots + normalized currentness + immutable Parent closure qualifies locally.
const qualified = preflightPortableReduction(baseInput());
assert.equal(qualified.status, 'preflight-qualified');
assert.equal(qualified.eligibility.state, 'eligible');
assert.equal(qualified.destructiveEligible, true);
assert.equal(qualified.eligibility.leafEntrypoints[0].parentSpan.state, 'qualified');
assert.deepEqual(qualified.eligibility.leafEntrypoints[0].parentSpan.path, [leafPath, parentPath]);
assert.equal(qualified.eligibility.leafEntrypoints[0].parentSpan.crossRepository, false);
assert.match(qualified.eligibility.receipt.inputFingerprint, /^[0-9a-f]{64}$/);
assert.equal(qualified.eligibility.receipt.reusableOnlyForExactBoundInputs, true);

// Any exact bound input change invalidates a prior receipt.
const changedReductionMarkdown = sealedReduction({ path: reductionPath, placementPath: parentPath, placementSchema: parentRecord.schemaId, placementDigest: parentDigest, entries: [entry(leafPath, parentPath)], summary: 'Changed exact Reduction bytes.' });
const changedReduction = preflightPortableReduction(baseInput({ records: [parentRecord, leafRecord, record(changedReductionMarkdown, reductionPath)], priorReceipt: qualified.eligibility.receipt }));
assert(hasCode(changedReduction.eligibility.blockers, 'receipt-input-fingerprint-mismatch'));

const changedAction = preflightPortableReduction(baseInput({ candidateSet: [{ path: leafPath, action: 'retain', repository: 'Tiinex/site' }], priorReceipt: qualified.eligibility.receipt }));
assert.equal(changedAction.eligibility.state, 'blocked');
assert(hasCode(changedAction.eligibility.blockers, 'reduction-leaf-retained-by-candidate-set'));
assert(hasCode(changedAction.eligibility.blockers, 'receipt-input-fingerprint-mismatch'));

const changedPreimage = preflightPortableReduction(baseInput({ candidateSet: [{ path: leafPath, action: 'delete', repository: 'Tiinex/site', expectedDigest: '0'.repeat(64) }] }));
assert.equal(changedPreimage.eligibility.state, 'blocked');
assert(hasCode(changedPreimage.eligibility.blockers, 'candidate-preimage-mismatch'));

const changedSnapshot = preflightPortableReduction(baseInput({ snapshots: [snapshot('Tiinex/site', OTHER_COMMIT)], priorReceipt: qualified.eligibility.receipt }));
assert(hasCode(changedSnapshot.eligibility.blockers, 'receipt-input-fingerprint-mismatch'));
assert(hasCode(changedSnapshot.eligibility.missingEvidence, 'parent-hop-snapshot-ref-mismatch'));

// Semantic/transport/fixture ambiguity fails closed, as does a required fixture deletion.
const ambiguousKind = preflightPortableReduction(baseInput({ candidateSet: [{ path: 'mystery-material.bin', action: 'delete' }] }));
assert.equal(ambiguousKind.eligibility.state, 'blocked');
assert(hasCode(ambiguousKind.eligibility.ambiguities, 'candidate-classification-unresolved'));

const fixtureDelete = preflightPortableReduction(baseInput({ candidateSet: [{ path: 'fixtures/required.fixture.trace.md', action: 'delete', classification: 'fixture', classificationQualification: 'qualified', classificationBasis: 'fixture manifest says required', fixtureRequired: true }] }));
assert.equal(fixtureDelete.eligibility.state, 'blocked');
assert(hasCode(fixtureDelete.eligibility.blockers, 'fixture-required-deletion'));

// Every disappearing semantic artifact must be covered by exact Reduction leaf spans.
const uncovered = preflightPortableReduction(baseInput({
  records: [parentRecord, leafRecord, placementRecord, baseReductionRecord],
  candidateSet: [
    { path: leafPath, action: 'delete', repository: 'Tiinex/site' },
    { path: placementPath, action: 'delete', repository: 'Tiinex/site' }
  ],
  immutableSources: [source(leafPath), source(parentPath), source(placementPath)],
  currentnessFacts: [currentness(leafPath, 'closed'), currentness(placementPath, 'closed')]
}));
assert.equal(uncovered.eligibility.state, 'blocked');
assert(hasCode(uncovered.eligibility.blockers, 'uncovered-disappearing-semantic-artifact') || hasCode(uncovered.eligibility.blockers, 'disappearing-leaf-declaration-missing'));

// Lifecycle/currentness is normalized evidence only: closed clears, operative blocks, unresolved stays unresolved.
const operative = preflightPortableReduction(baseInput({ currentnessFacts: [currentness(leafPath, 'operative')] }));
assert.equal(operative.eligibility.state, 'blocked');
assert(hasCode(operative.eligibility.blockers, 'operative-obligation-disappearing'));

const unresolvedCurrentness = preflightPortableReduction(baseInput({ currentnessFacts: [{ target: leafPath, state: 'mystery', currentness: 'current', qualification: 'qualified', basis: 'qualified source does not resolve operative state' }] }));
assert.equal(unresolvedCurrentness.eligibility.state, 'unresolved');
assert(hasCode(unresolvedCurrentness.eligibility.ambiguities, 'currentness-state-unresolved'));

const unqualifiedCurrentness = preflightPortableReduction(baseInput({ currentnessFacts: [{ target: leafPath, state: 'closed', currentness: 'historical', qualification: 'qualified', basis: 'stale fact' }] }));
assert.equal(unqualifiedCurrentness.eligibility.state, 'unresolved');
assert(hasCode(unqualifiedCurrentness.eligibility.ambiguities, 'currentness-evidence-unqualified'));

const reissued = preflightPortableReduction(baseInput({ currentnessFacts: [currentness(leafPath, 'operative', { qualification: 'qualified', basis: 'qualified explicit reissue', survivingArtifact: parentPath, mapping: 'same obligation is carried by surviving parent' })] }));
assert.equal(reissued.eligibility.state, 'eligible');
assert.equal(reissued.eligibility.leafEntrypoints[0].reissue.qualified, true);

// Placement Parent is continuity placement, not the historical closure endpoint.
const distinctPlacementMarkdown = sealedReduction({ path: reductionPath, placementPath, placementSchema: placementRecord.schemaId, placementDigest, entries: [entry(leafPath, parentPath)] });
const distinctPlacement = preflightPortableReduction(baseInput({ records: [parentRecord, leafRecord, placementRecord, record(distinctPlacementMarkdown, reductionPath)] }));
assert.equal(distinctPlacement.eligibility.state, 'eligible');
assert.equal(distinctPlacement.eligibility.reduction.placementParent, placementPath);
assert.equal(distinctPlacement.eligibility.leafEntrypoints[0].historicalClosureEndpoint, parentPath);
assert.notEqual(distinctPlacement.eligibility.reduction.placementParent, distinctPlacement.eligibility.leafEntrypoints[0].historicalClosureEndpoint);

// Cross-repository Parent closure is first-class when every hop is exact and immutable.
const businessBoundary = 'business-major-011-historical-closure.trace.md';
const detachedLeaf = Object.freeze({ ...leafRecord, trace: '' });
const crossReductionMarkdown = sealedReduction({ path: reductionPath, placementPath: parentPath, placementSchema: parentRecord.schemaId, placementDigest: parentDigest, entries: [entry(leafPath, businessBoundary)] });
const crossRepo = preflightPortableReduction({
  records: [parentRecord, detachedLeaf, record(crossReductionMarkdown, reductionPath)],
  candidateSet: [{ path: leafPath, action: 'delete', repository: 'Tiinex/site' }],
  reductionArtifactPath: reductionPath,
  immutableSources: [source(leafPath)],
  parentProofs: [{ kind: 'parent', qualification: 'qualified', basis: 'qualified immutable cross-repository Parent edge', child: leafPath, parent: businessBoundary, childLocator: source(leafPath), parentLocator: source(businessBoundary, 'Tiinex/business', OTHER_COMMIT) }],
  closureEndpoints: [{ path: businessBoundary, ...source(businessBoundary, 'Tiinex/business', OTHER_COMMIT) }],
  snapshots: [snapshot('Tiinex/site', COMMIT), snapshot('Tiinex/business', OTHER_COMMIT)],
  currentnessFacts: [currentness(leafPath, 'closed')],
  lossFacts: [loss(reductionPath, 'none')]
});
assert.equal(crossRepo.eligibility.state, 'eligible');
assert.equal(crossRepo.eligibility.leafEntrypoints[0].parentSpan.crossRepository, true);
assert.deepEqual([...crossRepo.eligibility.leafEntrypoints[0].parentSpan.repositories].sort(), ['Tiinex/business', 'Tiinex/site']);

const missingHopSource = preflightPortableReduction(baseInput({ immutableSources: [source(leafPath)] }));
assert.equal(missingHopSource.eligibility.state, 'unresolved');
assert(hasCode(missingHopSource.eligibility.missingEvidence, 'parent-hop-immutable-source-unresolved'));

const alternateBoundary = 'alternate-surviving-boundary.trace.md';
const ambiguousParent = preflightPortableReduction({
  ...baseInput(),
  records: [parentRecord, detachedLeaf, baseReductionRecord],
  parentProofs: [
    proof(leafPath, parentPath, 'Tiinex/site', COMMIT),
    proof(leafPath, alternateBoundary, 'Tiinex/site', COMMIT)
  ],
  immutableSources: [source(leafPath), source(parentPath), source(alternateBoundary)],
  closureEndpoints: [{ path: alternateBoundary, ...source(alternateBoundary) }]
});
assert.equal(ambiguousParent.eligibility.state, 'unresolved');
assert(hasCode(ambiguousParent.eligibility.ambiguities, 'parent-hop-ambiguous'));

// Reduction-of-Reductions expands only through explicit Source Context edges and independently audits every hop.
const dailyPath = 'reduction-daily-regression.trace.md';
const monthlyPath = 'reduction-monthly-regression.trace.md';
const yearlyPath = 'reduction-yearly-regression.trace.md';
const dailyMarkdown = sealedReduction({ path: dailyPath, placementPath: parentPath, placementSchema: parentRecord.schemaId, placementDigest: parentDigest, sourcePath: leafPath, summary: 'Synthetic observable reduction daily.' });
const dailyRecord = record(dailyMarkdown, dailyPath);
const monthlyMarkdown = sealedReduction({ path: monthlyPath, placementPath: parentPath, placementSchema: parentRecord.schemaId, placementDigest: parentDigest, sourcePath: dailyPath, summary: 'Synthetic observable reduction monthly.' });
const monthlyRecord = record(monthlyMarkdown, monthlyPath);
const yearlyMarkdown = sealedReduction({ path: yearlyPath, placementPath: parentPath, placementSchema: parentRecord.schemaId, placementDigest: parentDigest, sourcePath: monthlyPath, summary: 'Synthetic observable reduction yearly.' });
const yearlyRecord = record(yearlyMarkdown, yearlyPath);
const hierarchyRecords = [parentRecord, leafRecord, dailyRecord, monthlyRecord, yearlyRecord];
const hierarchyInput = {
  records: hierarchyRecords,
  reductionArtifactPath: yearlyPath,
  immutableSources: [source(leafPath), source(dailyPath), source(monthlyPath), source(yearlyPath)],
  lossFacts: [loss(dailyPath, 'none'), loss(monthlyPath, 'none'), loss(yearlyPath, 'none')]
};
const hierarchy = preflightPortableReduction(hierarchyInput);
assert.equal(hierarchy.status, 'projection-qualified');
assert.equal(hierarchy.composition.state, 'qualified');
assert.equal(hierarchy.composition.hops.length, 3);
assert.deepEqual(hierarchy.composition.hops.map((hop) => `${hop.from}->${hop.to}`), [`${dailyPath}->${leafPath}`, `${monthlyPath}->${dailyPath}`, `${yearlyPath}->${monthlyPath}`]);
assert.equal(hierarchy.composition.expansion.state, 'qualified-navigation');
assert.equal(preflightPortableReduction(hierarchyInput).composition.fingerprint, hierarchy.composition.fingerprint, 'composition expansion must be deterministic');

const knownLoss = preflightPortableReduction({ ...hierarchyInput, lossFacts: [loss(dailyPath, 'known-irrecoverable'), loss(monthlyPath, 'none'), loss(yearlyPath, 'none')] });
assert.equal(knownLoss.composition.state, 'qualified-with-known-loss');
assert.equal(knownLoss.composition.expansion.state, 'known-loss');
assert(knownLoss.composition.lossAndUncertainty.knownIrrecoverable.some((item) => item.target === dailyPath));
assert(!knownLoss.composition.nodes.some((node) => node.path === 'fabricated-recovery.trace.md'));

const inheritedUnresolved = preflightPortableReduction({ ...hierarchyInput, lossFacts: [loss(dailyPath, 'none'), loss(monthlyPath, 'unresolved'), loss(yearlyPath, 'none')] });
assert.equal(inheritedUnresolved.composition.state, 'unresolved');
assert(hasCode(inheritedUnresolved.composition.ambiguities, 'reduction-loss-unresolved'));

const corruptedDaily = Object.freeze({ ...dailyRecord, hasIntegrity: false });
const downstreamCannotRepair = preflightPortableReduction({ ...hierarchyInput, records: [parentRecord, leafRecord, corruptedDaily, monthlyRecord, yearlyRecord] });
assert.equal(downstreamCannotRepair.composition.state, 'unresolved');
assert(hasCode(downstreamCannotRepair.composition.missingEvidence, 'upstream-reduction-unqualified'));
assert.equal(downstreamCannotRepair.composition.boundary.downstreamValidationRepairsUpstream, false);

// Post-apply is a separate simulation boundary and never mutates source or retroactively repairs qualification.
const postApplyMismatch = preflightPortableReduction(baseInput({ postApply: { actualCandidateSet: [{ path: leafPath, action: 'retain', repository: 'Tiinex/site' }] } }));
assert.equal(postApplyMismatch.eligibility.state, 'eligible');
assert.equal(postApplyMismatch.eligibility.postApply.state, 'mismatch');
assert.equal(postApplyMismatch.eligibility.postApply.sourceMutation, false);
assert.equal(postApplyMismatch.eligibility.boundary.destructiveApplyAuthorized, false);

// Operation catalog and CLI both expose the same shared read-only projection surface.
const operation = await runPortableOperation('reduction-preflight', baseInput());
assert.equal(operation.operation, 'reduction-preflight');
assert.equal(operation.eligibility.receipt.inputFingerprint, qualified.eligibility.receipt.inputFingerprint);
assert.equal(operation.boundary.sourceMutation, false);
const cliOutput = [];
const cliCode = await runPortableCli(['reduction-preflight', '.topics/tooling', '--candidate', leafPath, '--reduction', '009-1-tooling-historical-lineage-reduction.trace.md', '--compact'], { log: (value) => cliOutput.push(value), error: (value) => cliOutput.push(value) });
assert.equal(cliCode, 2);
const cli = JSON.parse(cliOutput.at(-1));
assert.equal(cli.operation, 'reduction-preflight');
assert.equal(cli.boundary.sourceMutation, false);
assert.equal(cli.boundary.destructiveApplyImplemented, false);
assert.equal(cli.eligibility.boundary.lifecycleFactsAreEvidenceNotDeleteAuthority, true);

console.log('✓ Major 011 Reduction composition/recovery and exact destructive-lineage eligibility remain separate, deterministic, recoverable, fail-closed, and mutation-free across local/cross-repo lineage, normalized currentness, receipts, and nested reductions');

function entry(path, collapseTo) {
  return { path, collapseTo, disposition: 'completed-and-superseded', reason: 'Synthetic fixture proves exact disappearing semantic coverage.' };
}
function source(path, repository = 'Tiinex/site', commit = COMMIT) { return { path, repository, commit, immutable: true, basis: 'qualified immutable regression source' }; }
function snapshot(repository, commit) { return { repository, commit, qualification: 'qualified', basis: 'exact pre-delete regression snapshot' }; }
function currentness(target, state, reissue = null) { return { target, state, currentness: 'current', qualification: 'qualified', basis: 'qualified normalized Major 010 currentness fact', ...(reissue ? { reissue } : {}) }; }
function loss(target, state) { return { target, state, qualification: 'qualified', basis: 'qualified normalized loss fact' }; }
function proof(child, parent, repository, commit) { return { kind: 'parent', qualification: 'qualified', basis: 'qualified immutable Parent proof', child, parent, childLocator: source(child, repository, commit), parentLocator: source(parent, repository, commit) }; }
function record(markdown, path) { return createRecordFromMarkdown(markdown, { path, sourceMode: 'portable-local' }); }
function verifiedDigest(markdown) { const digest = validatedC14nV2PrimarySelfDigest(markdown); assert.equal(digest.state, 'verified'); return digest.value; }
function hasCode(values, code) { return values.some((item) => item.code === code); }

function sealedReduction({ path, placementPath, placementSchema, placementDigest, entries = [], sourcePath = '', summary = 'Synthetic observable reduction for permanent Major 011 regression.' }) {
  const sourceContext = sourcePath ? `- Source: [Immediate Source](${sourcePath})` : '- Source identity is intentionally represented by the exact synthetic regression material supplied to the shared operation.';
  const leafSection = entries.length ? entries.map((item, index) => `- **Leaf ${index + 1}**\n  - Leaf: [${item.path}](https://github.com/Tiinex/site/blob/${COMMIT}/.topics/tooling/${item.path})\n  - Collapse To: [Historical Boundary](${item.collapseTo})\n  - Disposition: \`${item.disposition}\`\n  - Why: ${item.reason}\n  - Expansion Span: exact qualified Parent traversal.`).join('\n\n') : '- No destructive leaf declaration is required for this ordinary composition-only Reduction fixture.';
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: ${placementSchema}
  - Created At: 2026-09-03 22:00:00
  - Trace: [Placement Parent](${placementPath})
  - Origin:
    - [relative](${placementPath})
- Current
  - Current Schema: tiinex.reduction.v1
  - Created At: 2026-09-03 22:01:00
  - Authors: Loom
  - Why: Exercise the shared Major 011 Reduction mechanics without mutating source material.
  - Summary: ${summary}
  - Status: ready/local

---

# Major 011 Reduction Regression

## Source Context

${sourceContext}

### Reduced Leaves / Expansion Boundary

${leafSection}

## Carry-Forward State

- Exact qualified source identity and declared recovery boundaries remain observable.

## Loss And Uncertainty

- Free-form prose is retained but never interpreted as destructive lifecycle/currentness policy.

## Validation

- Shared audit plus exact normalized qualification inputs are required; no destructive apply is implemented.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Placement Parent](${placementPath})
  - Value: ${placementDigest}

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: pending
`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
