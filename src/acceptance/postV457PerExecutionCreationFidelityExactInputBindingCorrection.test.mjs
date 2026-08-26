import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { defineArtifactCreationCapability, executeArtifactCreationCapability, qualifyArtifactCreationCapability } from '../schemas/creation.capability.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown } from '../schemas/creation.contracts.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { schemaRegistry } from '../schemas/registry.js';
import { sealC14nV2Self } from '../integrity/integrity.c14nV2.js';
import { runtimeProjectionForFiles } from '../../tools/schema-runtime-projection.lib.mjs';

const taskModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.task.v1');
const taskContract = buildArtifactCreationContract({ schemaId: taskModule.id, module: taskModule });
assert.equal(taskContract.status, 'ready');
assert.equal(taskContract.executionQualification?.qualificationScope, 'representative-preflight');
assert.equal(taskContract.executionQualification?.inputFidelity, 'representative-qualified');

// B — required input identity is exact; undeclared normalized aliases do not bind.
const baseValues = {
  Summary: 'Exact input identity',
  Objective: 'objective',
  'Done Criteria': 'done',
  Scope: 'scope',
  Dependencies: 'dependencies'
};
assert(createArtifactDraftMarkdown(taskContract, { values: baseValues, createdAt: '2026-08-20T00:00:00.000Z' }));
for (const values of [
  { ...baseValues, 'Done Criteria': undefined, 'Done-Criteria': 'alias-only' },
  { ...baseValues, 'Done Criteria': undefined, 'done criteria': 'alias-only' },
  { ...baseValues, 'Done Criteria': undefined, 'Done-Criteria': 'FIRST', done_criteria: 'SECOND' }
]) {
  delete values['Done Criteria'];
  assert.equal(createArtifactDraftMarkdown(taskContract, { values, createdAt: '2026-08-20T00:00:00.000Z' }), '', 'undeclared aliases must not satisfy exact required input identity');
}

// A/C — representative probe can pass while a concrete execution is rejected for caller-value mutation.
const whitespaceMutator = taskWithImplementation((contract, input) => {
  if (isRepresentativeProbe(input)) return genericArtifactCreationImplementation.execute(contract, input);
  const values = { ...(input.values || {}), Summary: String(input.values?.Summary || '').replace(/\s+/g, ' ') };
  return genericArtifactCreationImplementation.execute(contract, { ...input, values });
});
const whitespaceContract = buildArtifactCreationContract({ schemaId: whitespaceMutator.id, module: whitespaceMutator });
assert.equal(whitespaceContract.status, 'ready', 'representative probe must remain readiness preflight');
const whitespaceExecution = executeArtifactCreationCapability(whitespaceMutator, 'create-artifact', whitespaceContract, { values: { ...baseValues, Summary: 'Alpha   Beta' }, createdAt: '2026-08-20T00:00:00.000Z' });
assert.equal(whitespaceExecution.state, 'unavailable');
assert.equal(whitespaceExecution.markdown, '');
assert.equal(whitespaceExecution.qualification.representativeImplementation.state, 'qualified');
assert.equal(whitespaceExecution.qualification.concreteInvocationInputBinding.state, 'failed');
assert.equal(whitespaceExecution.qualification.portableRootTargetValidation.state, 'qualified');
assert.equal(whitespaceExecution.qualification.integrity.state, 'verified');

// Condition-dependent required-section drop, correctly resealed, must still fail this concrete invocation.
const dropSection = taskWithImplementation((contract, input) => {
  const markdown = genericArtifactCreationImplementation.execute(contract, input);
  if (isRepresentativeProbe(input)) return markdown;
  const mutated = markdown.replace(/\n## Dependencies\n\n[^\n]*(?=\n\n(?:---\n\n)?# Continuity Integrity)/, '');
  return sealC14nV2Self(mutated).markdown;
});
const dropContract = buildArtifactCreationContract({ schemaId: dropSection.id, module: dropSection });
assert.equal(dropContract.status, 'ready');
const dropExecution = executeArtifactCreationCapability(dropSection, 'create-artifact', dropContract, { values: baseValues, createdAt: '2026-08-20T00:00:00.000Z' });
assert.equal(dropExecution.state, 'unavailable');
assert.equal(dropExecution.markdown, '');
assert.equal(dropExecution.qualification.representativeImplementation.state, 'qualified');
assert.equal(dropExecution.qualification.concreteInvocationInputBinding.state, 'failed');
assert.equal(dropExecution.qualification.portableRootTargetValidation.state, 'qualified', 'ordinary target validation may remain green while creation-generation fidelity fails');
assert.equal(dropExecution.qualification.integrity.state, 'verified');

// Real-input punctuation/Unicode/long mutation after a clean representative probe must fail.
const unicodeMutator = taskWithImplementation((contract, input) => {
  if (isRepresentativeProbe(input)) return genericArtifactCreationImplementation.execute(contract, input);
  const values = { ...(input.values || {}), Objective: String(input.values?.Objective || '').replace(/[—Δ日本語!?]/g, '') };
  return genericArtifactCreationImplementation.execute(contract, { ...input, values });
});
const unicodeContract = buildArtifactCreationContract({ schemaId: unicodeMutator.id, module: unicodeMutator });
assert.equal(unicodeContract.status, 'ready');
const unicodeExecution = executeArtifactCreationCapability(unicodeMutator, 'create-artifact', unicodeContract, { values: { ...baseValues, Objective: `Ω — Δ 日本語 !? ${'L'.repeat(300)}` }, createdAt: '2026-08-20T00:00:00.000Z' });
assert.equal(unicodeExecution.state, 'unavailable');
assert.equal(unicodeExecution.qualification.concreteInvocationInputBinding.state, 'failed');
assert.equal(unicodeExecution.qualification.portableRootTargetValidation.state, 'qualified');

// Build-time sibling: punctuation coincidence must not invent input→section authority.
const taskMarkdown = fs.readFileSync('src/schemas/core/task/tiinex.task.v1.schema.md', 'utf8');
const mismatchMarkdown = taskMarkdown
  .replace('### Template Body\n\nRequired Shape', '### Template Body\n\nRequired Inputs\n\n- Done Criteria\n\nRequired Shape')
  .replace('- `## Done Criteria` section', '- `## Done-Criteria` section');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tiinex-v457-'));
const markdownPath = path.join(temp, 'tiinex.task.v1.schema.md');
const bindingPath = path.join(temp, 'tiinex.task.v1.schema.json');
fs.writeFileSync(markdownPath, mismatchMarkdown);
const checksum = crypto.createHash('sha256').update(Buffer.from(mismatchMarkdown, 'utf8')).digest('hex');
fs.writeFileSync(bindingPath, JSON.stringify({ schemaId: 'tiinex.task.v1', checksum: { algorithm: 'sha256', value: checksum } }));
const mismatchProjection = runtimeProjectionForFiles(markdownPath, bindingPath);
const exactInput = mismatchProjection.creation.inputBindings.find((item) => item.input === 'Done Criteria');
assert.equal(exactInput?.kind, 'unmapped', 'normalized punctuation coincidence must not create a semantic input→section binding');
assert(mismatchProjection.creation.inputBindings.some((item) => item.input === 'Done-Criteria' && item.kind === 'section-body'));

console.log('post-v457 per-execution creation fidelity + exact input binding correction: PASS');

function taskWithImplementation(execute) {
  return Object.freeze({
    ...taskModule,
    artifactCreation: defineArtifactCreationCapability(taskModule.binding, Object.freeze({
      status: 'implemented',
      renderer: Object.freeze({ id: 'synthetic.v457.task' }),
      transitionTypes: Object.freeze(['create-artifact']),
      execute
    }))
  });
}
function isRepresentativeProbe(input = {}) {
  const values = input.values || {};
  const entries = Object.values(values);
  return entries.length > 0 && entries.every((value) => String(value).startsWith('TIINEX_CREATE_INPUT_'));
}
