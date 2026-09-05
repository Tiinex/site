import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { preflightPortableReduction } from './reduction.preflight.js';

const leafPath = '001-1-1-1-1-loom-to-anchor-validation-checkpoint-efficiency-return-handoff.trace.md';
const parentPath = '001-1-1-1-loom-validation-checkpoint-efficiency-implementation-evidence.trace.md';
const reductionPath = 'reduction-preflight-regression.trace.md';
const [leafMarkdown, parentMarkdown] = await Promise.all([
  readFile(`.topics/tooling/${leafPath}`, 'utf8'),
  readFile(`.topics/tooling/${parentPath}`, 'utf8')
]);
const parentDigest = validatedC14nV2PrimarySelfDigest(parentMarkdown);
assert.equal(parentDigest.state, 'verified');

const reductionMarkdown = sealedReduction({ leafPath, parentPath, parentDigest: parentDigest.value });
const records = [
  createRecordFromMarkdown(parentMarkdown, { path: parentPath, sourceMode: 'portable-local' }),
  createRecordFromMarkdown(leafMarkdown, { path: leafPath, sourceMode: 'portable-local' }),
  createRecordFromMarkdown(reductionMarkdown, { path: reductionPath, sourceMode: 'portable-local' })
];

const qualified = preflightPortableReduction({ records, candidates: [leafPath], reductionArtifactPath: reductionPath });
assert.equal(qualified.status, 'preflight-qualified');
assert.equal(qualified.destructiveEligible, true);
assert.equal(qualified.boundary.planningOnly, true);
assert.equal(qualified.boundary.destructiveApplyImplemented, false);
assert.equal(qualified.boundary.canonicalReductionSchemaAuthorityChanged, false);
assert.equal(qualified.candidates[0].semanticLeaf, true);
assert.equal(qualified.candidates[0].immutableSource.state, 'immutable-permalink');
assert.equal(qualified.candidates[0].parentSpan.state, 'loaded-qualified');
assert.deepEqual(qualified.candidates[0].parentSpan.path, [leafPath, parentPath]);
assert.equal(qualified.reduction.qualification.parentPath, parentPath);

const noReduction = preflightPortableReduction({ records: records.slice(0, 2), candidates: [leafPath] });
assert.equal(noReduction.destructiveEligible, false);
assert(noReduction.candidates[0].blockers.includes('qualified-pre-delete-reduction-required'));

const realCli = [];
const cliCode = await runPortableCli([
  'reduction-preflight', '.topics/tooling',
  '--candidate', leafPath,
  '--reduction', '009-1-tooling-historical-lineage-reduction.trace.md',
  '--compact'
], { log: (value) => realCli.push(value), error: (value) => realCli.push(value) });
assert.equal(cliCode, 2, 'blocked preflight must produce the standard blocked CLI exit code');
const real = JSON.parse(realCli.at(-1));
assert.equal(real.operation, 'reduction-preflight');
assert.equal(real.destructiveEligible, false);
assert.equal(real.reduction.qualification.qualified, true);
assert(real.candidates[0].blockers.includes('parent-span-external-proof-required'));
assert.equal(real.candidates[0].immutableSource.commit, 'de31f58569550819d89f63dcfbe1abfdfe815ab7');
assert.equal(real.boundary.remoteWrite, false);

console.log('✓ Reduction preflight inventories semantic leaves and fails closed unless exact Reduction placement, immutable recovery, and Parent-span evidence qualify each explicit disappearing leaf');

function sealedReduction({ leafPath, parentPath, parentDigest }) {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.evidence.v1
  - Created At: 2026-09-03 22:00:00
  - Trace: [Parent](${parentPath})
  - Origin:
    - [relative](${parentPath})
- Current
  - Current Schema: tiinex.reduction.v1
  - Created At: 2026-09-03 22:01:00
  - Authors: Loom
  - Why: Exercise the shared Reduction preflight contract without mutating source material.
  - Summary: Synthetic observable reduction for the permanent Reduction-preflight regression.
  - Status: ready/local

---

# Reduction Preflight Regression

## Source Context

- Source: synthetic test fixture backed by an immutable leaf permalink.

### Reduced Leaves / Expansion Boundary

- **Leaf**
  - Leaf: [${leafPath}](https://github.com/Tiinex/site/blob/de31f58569550819d89f63dcfbe1abfdfe815ab7/.topics/tooling/${leafPath})
  - Collapse To: [Parent](${parentPath})
  - Disposition: \`completed-and-superseded\`
  - Why: Synthetic fixture proves the exact loaded Parent span.
  - Expansion Span: 2 loaded nodes.

## Carry-Forward State

- The qualified parent remains current.

## Loss And Uncertainty

- This is a synthetic permanent regression fixture and does not represent a real deletion request.

## Validation

- Shared audit and Reduction preflight must both qualify before destructive eligibility is reported.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: [Parent](${parentPath})
  - Value: ${parentDigest}

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: pending
`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
