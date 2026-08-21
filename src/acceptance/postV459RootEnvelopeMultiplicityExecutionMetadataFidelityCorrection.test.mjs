import assert from 'node:assert/strict';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { defineArtifactCreationCapability, executeArtifactCreationCapability, qualifyArtifactCreationCapability } from '../schemas/creation.capability.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { canonicalRootCreatedAt } from '../schemas/creation.rootMetadata.js';
import { inspectCreationRepresentation } from '../schemas/creation.representation.js';
import { schemaRegistry } from '../schemas/registry.js';
import { sealC14nV2Self } from '../integrity/integrity.c14nV2.js';

const taskModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.task.v1');
const task = buildArtifactCreationContract({ schemaId: taskModule.id, module: taskModule });
const values = { Summary: 'v459 root truth', Objective: 'objective', 'Done Criteria': 'done', Scope: 'scope', Dependencies: 'deps' };
const baseline = createArtifactDraftMarkdown(task, { values, createdAt: '2026-08-20T00:00:00.000Z' });
assert(baseline);

// A — Envelope Schema is owned by the same raw occurrence model and must be exactly one.
for (const [label, mutate, expectedCount] of [
  ['missing', (md) => md.replace(/^- Envelope Schema:.*\n/m, ''), 0],
  ['single', (md) => md, 1],
  ['duplicate-identical', (md) => md.replace(/^- Envelope Schema:.*$/m, (line) => `${line}\n${line}`), 2],
  ['duplicate-conflicting', (md) => md.replace(/^- Envelope Schema:.*$/m, (line) => `${line}\n- Envelope Schema: [tiinex.root.v999](tiinex.root.v999.schema.md)`), 2]
]) {
  const mutated = label === 'single' ? mutate(baseline) : resealIfPossible(mutate(baseline));
  const observed = inspectCreationRepresentation(mutated, { boundSections: task.creation.requiredSections });
  assert.equal(observed.envelopeSchema.length, expectedCount, `${label} Envelope Schema multiplicity must remain observable`);
  const result = validateArtifactCreationResult({ schemaId: taskModule.id, status: 'local', sourceMode: 'local-create', markdown: mutated }, {}, { contract: task });
  assert.equal(result.ok, label === 'single', `${label} Envelope Schema must ${label === 'single' ? 'qualify' : 'fail closed'}`);
}

const duplicateEnvelopeModule = taskWithImplementation('v459.duplicate-envelope', (contract, input) => {
  const markdown = genericArtifactCreationImplementation.execute(contract, input);
  const mutated = markdown.replace(/^- Envelope Schema:.*$/m, (line) => `${line}\n${line}`);
  return reseal(mutated);
});
const duplicateEnvelopeQualification = qualifyArtifactCreationCapability(duplicateEnvelopeModule, 'create-artifact');
assert.equal(duplicateEnvelopeQualification.ready, false, 'representative readiness must reject duplicate Envelope Schema');
assert(duplicateEnvelopeQualification.implementation.executionQualification.findings.some((finding) => String(finding).includes('Envelope Schema field')));

// B — Created At shape and concrete execution instant fidelity are distinct.
assert.equal(canonicalRootCreatedAt('2027-01-02T03:04:05Z'), '2027-01-02 03:04:05');
assert.equal(canonicalRootCreatedAt('2027-01-02T05:04:05+02:00'), '2027-01-02 03:04:05');
assert.equal(canonicalRootCreatedAt(new Date('2027-01-02T03:04:05.999Z')), '2027-01-02 03:04:05', 'Root representation has seconds precision');

for (const [inputCreatedAt, expected] of [
  ['2027-01-02T03:04:05Z', '2027-01-02 03:04:05'],
  ['2027-01-02T05:04:05+02:00', '2027-01-02 03:04:05']
]) {
  const execution = executeArtifactCreationCapability(taskModule, 'create-artifact', task, { values, createdAt: inputCreatedAt });
  assert.equal(execution.state, 'rendered');
  assert.equal(execution.qualification.executionMetadataFidelity.state, 'qualified');
  assert.equal(execution.qualification.executionMetadataFidelity.createdAt.expected, expected);
  assert.equal(execution.qualification.executionMetadataFidelity.createdAt.observed, expected);
  assert(execution.markdown.includes(`  - Created At: ${expected}`));
}

const frozenTimestampModule = taskWithImplementation('v459.frozen-created-at', (contract, input) => genericArtifactCreationImplementation.execute(contract, { ...input, createdAt: '2026-08-20T00:00:00.000Z' }));
const frozenContract = buildArtifactCreationContract({ schemaId: frozenTimestampModule.id, module: frozenTimestampModule });
assert.equal(frozenContract.status, 'ready', 'representative timestamp must still qualify the frozen executor preflight');
assert.equal(frozenContract.executionQualification.executionMetadataFidelity, 'qualified');
const later = executeArtifactCreationCapability(frozenTimestampModule, 'create-artifact', frozenContract, { values, createdAt: '2027-01-02T03:04:05Z' });
assert.equal(later.state, 'unavailable', 'later concrete invocation must reject frozen representative timestamp');
assert.equal(later.markdown, '');
assert.equal(later.qualification.executionMetadataFidelity.state, 'failed');
assert.equal(later.qualification.executionMetadataFidelity.createdAt.expected, '2027-01-02 03:04:05');
assert.equal(later.qualification.executionMetadataFidelity.createdAt.observed, '2026-08-20 00:00:00');
assert.equal(later.qualification.concreteInvocationInputBinding.state, 'qualified', 'caller-content fidelity remains a separate gate');
assert.equal(later.qualification.representationMultiplicity.state, 'qualified', 'timestamp value mismatch is not multiplicity ambiguity');
assert.equal(later.qualification.portableRootTargetValidation.state, 'qualified', 'shape-valid stale timestamp may remain portable-structural valid');
assert.equal(later.qualification.integrity.state, 'verified', 'correctly sealed stale timestamp can still be integrity-valid');

for (const invalid of ['not-a-date', '2027-99-99T00:00:00Z']) {
  const execution = executeArtifactCreationCapability(frozenTimestampModule, 'create-artifact', frozenContract, { values, createdAt: invalid });
  assert.equal(execution.state, 'unavailable', `${invalid} must fail closed`);
  assert.equal(execution.markdown, '');
  assert.equal(execution.qualification.executionMetadataFidelity.state, 'failed');
}

console.log('post-v459 Root Envelope multiplicity + execution metadata fidelity correction: PASS');

function taskWithImplementation(id, execute) {
  return Object.freeze({
    ...taskModule,
    artifactCreation: defineArtifactCreationCapability(taskModule.binding, Object.freeze({
      status: 'implemented', renderer: Object.freeze({ id }), transitionTypes: Object.freeze(['create-artifact']), execute
    }))
  });
}
function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}
function resealIfPossible(markdown) {
  // Missing/duplicated Root metadata does not alter the integrity owner itself, so it can be maliciously resealed.
  return reseal(markdown);
}
