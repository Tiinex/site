import assert from 'node:assert/strict';
import { createPortableLocalDraft } from './draft.create.js';
import { buildArtifactCreationContract, validateArtifactCreationResult } from '../../../schemas/creation.contracts.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

const ROOT = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const TASK = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const refs = Object.freeze({
  envelope: Object.freeze({ schemaId: 'tiinex.root.v1', preferredTarget: ROOT, resolutionState: 'qualified', resolutionEvidence: Object.freeze({ gitBlobSha: '1398960010b919d266a7451f59bbfc9c211c0e4b' }) }),
  current: Object.freeze({ schemaId: 'tiinex.task.v1', preferredTarget: TASK, resolutionState: 'qualified', resolutionEvidence: Object.freeze({ gitBlobSha: 'e4d545ad45382a150351ead587339d8b43cc0fb2' }) })
});
const values = Object.freeze({
  Summary: 'v475 canonical exact authoring fixture',
  Objective: 'Close canonical envelope, reference, integrity, and validation fidelity.',
  'Done Criteria': 'Exact references, canonical Parent representation, Authors, and v2 self integrity qualify together.',
  Scope: 'Portable authoring and shared validation only.',
  Dependencies: 'Every external reference is explicitly supplied and independently qualified in this fixture.'
});
const root = createPortableLocalDraft({
  schemaId: 'tiinex.task.v1', path: '.topics/v475/root.trace.md', values, authors: 'Tooling & Architect', schemaReferences: refs, createdAt: '2026-08-21 19:30:00'
});
assert.equal(root.status, 'created-clean');
assert.equal(root.qualification.exactCreateToolingApplied, true);
assert.equal(root.qualification.exactRuntimeValidation, true);
assert(root.draft.markdown.includes(`- Envelope Schema: [tiinex.root.v1](${ROOT})`));
assert(root.draft.markdown.includes(`  - Current Schema: [tiinex.task.v1](${TASK})`));
assert(root.draft.markdown.includes('  - Authors: Tooling & Architect'));
assert.equal(root.draft.markdown.includes('Draft Local Integrity'), false);
assert.equal(canonicalC14nV2SelfState(root.draft.markdown).state, 'verified');

const parent = Object.freeze({
  id: 'published-parent',
  path: '.topics/development/tooling/dogfood/published-parent.trace.md',
  schemaId: 'tiinex.task.v1',
  currentCreatedAt: '2026-08-21 18:57:00',
  publishedReference: Object.freeze({ target: 'https://archive.example.test/exact/published-parent.trace.md', state: 'qualified', evidence: Object.freeze({ representation: 'fixture' }) }),
  schemaReferenceAuthority: Object.freeze({ schemaId: 'tiinex.task.v1', preferredTarget: TASK, exactTargets: Object.freeze([TASK]), resolutionState: 'qualified' })
});
const childPath = '.topics/development/tooling/dogfood/nested/v475-child.trace.md';
const child = createPortableLocalDraft({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record', path: childPath, values, schemaReferences: refs, parentRecord: parent, createdAt: '2026-08-21 19:31:00' });
assert.equal(child.status, 'created-clean');
assert.equal(child.qualification.exactRuntimeValidation, true);
const parsed = parseArtifactMarkdown(child.draft.markdown);
assert.equal(parsed.envelope.parent.trace, '../published-parent.trace.md');
assert.equal(parsed.envelope.parent.traceRaw, '[published-parent.trace.md](../published-parent.trace.md)');
assert.deepEqual(parsed.envelope.parent.originEntries.map(({ label, target }) => [label, target]), [
  ['relative', '../published-parent.trace.md'],
  ['browse + git', 'https://archive.example.test/exact/published-parent.trace.md']
]);
assert.equal(parsed.envelope.parent.boundary, '');
assert.equal(parsed.envelope.parent.schema.target, TASK);
assert.equal(canonicalC14nV2SelfState(child.draft.markdown).state, 'verified');

const contract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record', schemaReferences: refs });
function validateMutation(name, mutate, expectedFragment) {
  const mutated = mutate(child.draft.markdown);
  const resealed = mutated.includes('sha256-base64url-c14n-v2') ? sealC14nV2Self(mutated).markdown : mutated;
  const result = validateArtifactCreationResult({ schemaId: 'tiinex.task.v1', status: 'local', sourceMode: 'local-v475-negative', markdown: resealed, path: childPath }, parent, { contract, childPath });
  assert.equal(result.ok, false, `${name} must fail exact validation`);
  assert(result.findings.some((finding) => `${finding.code} ${finding.message}`.includes(expectedFragment)), `${name} must expose its canonical representation failure: ${JSON.stringify(result.findings)}`);
}
validateMutation('record Trace', (md) => md.replace('  - Trace: [published-parent.trace.md](../published-parent.trace.md)', '  - Trace: record:published-parent'), 'Trace');
validateMutation('scalar Origin', (md) => md.replace('  - Origin:\n    - [relative](../published-parent.trace.md)\n    - [browse + git](https://archive.example.test/exact/published-parent.trace.md)', '  - Origin: .topics/development/tooling/dogfood/published-parent.trace.md'), 'Origin');
validateMutation('broken schema basename', (md) => md.replace(`  - Current Schema: [tiinex.task.v1](${TASK})`, '  - Current Schema: [tiinex.task.v1](tiinex.task.v1.schema.md)'), 'Schema reference');
validateMutation('undeclared Parent Boundary', (md) => md.replace('  - Origin:\n', '  - Boundary: local convenience boundary\n  - Origin:\n'), 'Boundary');
validateMutation('Draft Local Integrity pseudo-footer', (md) => md.replace(/- (?:\[sha256-base64url-c14n-v2\]\([^)]+\)|sha256-base64url-c14n-v2)\n  - Towards: self\n  - Value: [^\n]+$/, '- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export'), 'integrity');

const unresolvedRefs = {
  envelope: { schemaId: 'tiinex.root.v1', preferredTarget: ROOT, resolutionState: 'unresolved' },
  current: { schemaId: 'tiinex.task.v1', preferredTarget: TASK, resolutionState: 'unresolved' }
};
const unresolved = createPortableLocalDraft({ schemaId: 'tiinex.task.v1', path: '.topics/v475/unresolved.trace.md', values, schemaReferences: unresolvedRefs, createdAt: '2026-08-21 19:32:00' });
assert.equal(unresolved.status, 'blocked');
assert.equal(unresolved.qualification.exactRuntimeValidation, false);
assert.equal(unresolved.draft, null);
assert(unresolved.findings.some((finding) => finding.code === 'portable.draft-create.exact-result.unqualified'));

console.log('✓ v475 canonical artifact envelope/reference/integrity/validation closure: exact external refs and canonical Parent/footer qualify; legacy record/scalar-origin/basename/boundary/pseudo-integrity shapes fail closed');
