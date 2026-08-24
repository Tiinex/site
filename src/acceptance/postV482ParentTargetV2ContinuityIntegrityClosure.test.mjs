import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import {
  buildArtifactCreationContract,
  createArtifactDraftMarkdown,
  validateArtifactCreationResult
} from '../schemas/creation.contracts.js';
import { inspectCreationRepresentation } from '../schemas/creation.representation.js';
import {
  canonicalC14nV2SelfState,
  sealC14nV2Self,
  validatedC14nV2PrimarySelfDigest,
  verifyC14nV2TargetSelfDigest
} from '../integrity/integrity.c14nV2.js';

const parentContract = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'create-artifact' });
const parentValues = Object.freeze({
  Summary: 'Parent v2 integrity authority',
  'Current Read': 'Parent bytes are the exact target of continuation integrity.',
  'Design Direction': 'Read the validated primary self digest rather than recomputing a different target mode.',
  'Next Artifacts': 'Emit a child with Parent-target integrity before final self sealing.'
});
const parentMarkdown = createArtifactDraftMarkdown(parentContract, { values: parentValues, createdAt: '2026-08-24T08:00:00.000Z' });
assert(parentMarkdown);
const parentSelf = validatedC14nV2PrimarySelfDigest(parentMarkdown);
assert.equal(parentSelf.state, 'verified');

const childContract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record' });
const parentPath = '.topics/development/tooling/dogfood/parent-v2.trace.md';
const childPath = '.topics/development/tooling/dogfood/children/child-v2.trace.md';
const publishedTarget = 'https://github.com/Tiinex/site/blob/0123456789012345678901234567890123456789/.topics/development/tooling/dogfood/parent-v2.trace.md';
const parentRecord = Object.freeze({
  id: 'parent-v2',
  path: parentPath,
  schemaId: 'tiinex.topic.v1',
  currentCreatedAt: '2026-08-24 10:00:00',
  markdown: parentMarkdown,
  integrity: parseArtifactMarkdown(parentMarkdown).integrity,
  publishedReference: Object.freeze({ target: publishedTarget, state: 'qualified' }),
  schemaReferenceAuthority: parentContract.schemaReferences.current,
  sourceMode: 'loaded-fixture',
  source: Object.freeze({ boundary: 'read-only fixture source' })
});
const parentSnapshot = JSON.stringify(parentRecord);
const values = Object.freeze({
  Summary: 'Child v2 integrity binding',
  Objective: 'Bind the child to the exact Parent primary v2 self digest.',
  'Done Criteria': 'One Parent-target entry precedes one final self entry.',
  Scope: 'Creation and validation only.',
  Dependencies: 'Validated Parent bytes and exact Parent authority.'
});
const childMarkdown = createArtifactDraftMarkdown(childContract, { parentRecord, childPath, values, createdAt: '2026-08-24T08:01:00.000Z' });
assert(childMarkdown);
const childParsed = parseArtifactMarkdown(childMarkdown);
const entries = childParsed.integrity.entries;
assert.equal(entries.length, 2);
const targetEntries = entries.filter((entry) => entry.towards !== 'self');
const selfEntries = entries.filter((entry) => entry.towards === 'self');
assert.equal(targetEntries.length, 1);
assert.equal(selfEntries.length, 1);
assert.equal(targetEntries[0].towards, publishedTarget);
assert.equal(targetEntries[0].value, parentSelf.value);
assert.equal(verifyC14nV2TargetSelfDigest({ value: targetEntries[0].value, targetMarkdown: parentMarkdown }).state, 'verified');
assert.equal(canonicalC14nV2SelfState(childMarkdown).state, 'verified');
assert.equal(JSON.stringify(parentRecord), parentSnapshot, 'creation must not mutate Parent authority/source state');
assert.equal(childParsed.envelope.parent.trace, '../parent-v2.trace.md');
assert.deepEqual(childParsed.envelope.parent.originEntries.map(({ label, target }) => [label, target]), [
  ['relative', '../parent-v2.trace.md'],
  ['browse + git', publishedTarget]
]);

const representation = inspectCreationRepresentation(childMarkdown);
assert.equal(representation.integrityEntries, 2);
assert.equal(representation.selfIntegrityEntries.length, 1);
assert.equal(representation.integrityEntryDetails.filter((entry) => entry.towards === publishedTarget).length, 1);

// Target sibling bytes are covered by the child's final self seal.
const targetBlock = targetEntries[0].raw;
const targetValueMutated = childMarkdown.replace(`  - Value: ${parentSelf.value}\n\n- `, `  - Value: ${'A'.repeat(parentSelf.value.length)}\n\n- `);
assert.equal(canonicalC14nV2SelfState(targetValueMutated).state, 'mismatch');
const targetRemoved = childMarkdown.replace(`${targetBlock}\n`, '');
assert.equal(canonicalC14nV2SelfState(targetRemoved).state, 'mismatch');

// Re-sealing can restore child self, but must not turn a mismatched Parent digest into valid continuity.
const wrongValue = 'B'.repeat(parentSelf.value.length);
const wrongTargetResealed = sealC14nV2Self(childMarkdown.replace(`  - Value: ${parentSelf.value}\n\n- `, `  - Value: ${wrongValue}\n\n- `));
assert.equal(wrongTargetResealed.state, 'sealed');
assert.equal(canonicalC14nV2SelfState(wrongTargetResealed.markdown).state, 'verified');
const wrongTargetValidation = validateArtifactCreationResult({ schemaId: 'tiinex.task.v1', status: 'local', sourceMode: 'local-test', path: childPath, markdown: wrongTargetResealed.markdown }, parentRecord, { contract: childContract, childPath });
assert.equal(wrongTargetValidation.ok, false);
assert(wrongTargetValidation.findings.some((finding) => finding.code === 'creation.integrity.parent-target.mismatch'));

// A different valid Parent artifact is not interchangeable merely because its self seal is valid.
const alternateParentMarkdown = sealC14nV2Self(parentMarkdown.replace('Parent bytes are the exact target', 'Alternate bytes are the exact target')).markdown;
assert.equal(canonicalC14nV2SelfState(alternateParentMarkdown).state, 'verified');
const alternateParent = Object.freeze({ ...parentRecord, markdown: alternateParentMarkdown, integrity: parseArtifactMarkdown(alternateParentMarkdown).integrity });
const mismatchedParentValidation = validateArtifactCreationResult({ schemaId: 'tiinex.task.v1', status: 'local', sourceMode: 'local-test', path: childPath, markdown: childMarkdown }, alternateParent, { contract: childContract, childPath });
assert.equal(mismatchedParentValidation.ok, false);
assert(mismatchedParentValidation.findings.some((finding) => finding.code === 'creation.integrity.parent-target.mismatch'));

// Parent self evidence is mandatory and fail-closed.
const missingSelfParent = Object.freeze({ ...parentRecord, markdown: '# Parent without integrity' });
assert.equal(createArtifactDraftMarkdown(childContract, { parentRecord: missingSelfParent, childPath, values, createdAt: '2026-08-24T08:02:00.000Z' }), '');
const ambiguousSelfParentMarkdown = `${parentMarkdown}\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: duplicate`;
const ambiguousSelfParent = Object.freeze({ ...parentRecord, markdown: ambiguousSelfParentMarkdown });
assert.equal(validatedC14nV2PrimarySelfDigest(ambiguousSelfParentMarkdown).state, 'ambiguous');
assert.equal(createArtifactDraftMarkdown(childContract, { parentRecord: ambiguousSelfParent, childPath, values, createdAt: '2026-08-24T08:03:00.000Z' }), '');

// Standalone/root creation remains self-only.
const rootTask = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'create-artifact' });
const rootMarkdown = createArtifactDraftMarkdown(rootTask, { values, createdAt: '2026-08-24T08:04:00.000Z' });
assert(rootMarkdown);
const rootEntries = parseArtifactMarkdown(rootMarkdown).integrity.entries;
assert.equal(rootEntries.length, 1);
assert.equal(rootEntries[0].towards, 'self');
assert.equal(canonicalC14nV2SelfState(rootMarkdown).state, 'verified');

// Self sealing is deterministic and preserves the already-fixed Parent sibling entry byte-for-byte.
const bodyMutated = childMarkdown.replace('Creation and validation only.', 'Creation and validation surfaces only.');
assert.equal(canonicalC14nV2SelfState(bodyMutated).state, 'mismatch');
const resealed = sealC14nV2Self(bodyMutated);
assert.equal(resealed.state, 'sealed');
assert.equal(parseArtifactMarkdown(resealed.markdown).integrity.entries.find((entry) => entry.towards !== 'self').raw, targetBlock);
assert.equal(sealC14nV2Self(resealed.markdown).markdown, resealed.markdown);

console.log('post-v482 Parent-target v2 continuity integrity emission + validation closure: PASS');
