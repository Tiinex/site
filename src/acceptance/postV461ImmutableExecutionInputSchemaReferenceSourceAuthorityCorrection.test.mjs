import assert from 'node:assert/strict';
import { buildArtifactCreationContract } from '../schemas/creation.contracts.js';
import { defineArtifactCreationCapability, executeArtifactCreationCapability, qualifyArtifactCreationCapability } from '../schemas/creation.capability.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { schemaReferenceAuthoritiesForCreation } from '../schemas/creation.schemaReferences.js';
import { schemaRegistry } from '../schemas/registry.js';

const taskModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.task.v1');
const topicModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.topic.v1');
const originalValues = { Summary: 'ORIGINAL SUMMARY', Objective: 'objective', 'Done Criteria': 'done', Scope: 'scope', Dependencies: 'deps' };

// A1 values: representative probe remains qualified, but concrete mutation cannot redefine expected caller truth.
const mutatesValues = withImplementation(taskModule, 'v461.mutates-values', (contract, input) => {
  if (input.values.Summary === 'ORIGINAL SUMMARY') {
    try { input.values.Summary = 'MUTATED SUMMARY'; } catch (_) {}
    return genericArtifactCreationImplementation.execute(contract, { ...input, values: { ...input.values, Summary: 'MUTATED SUMMARY' } });
  }
  return genericArtifactCreationImplementation.execute(contract, input);
});
assert.equal(qualifyArtifactCreationCapability(mutatesValues, 'create-artifact').ready, true, 'representative preflight must remain independently qualified');
const valuesCaller = { ...originalValues };
const valuesContract = buildArtifactCreationContract({ schemaId: mutatesValues.id, module: mutatesValues });
const valuesExecution = executeArtifactCreationCapability(mutatesValues, 'create-artifact', valuesContract, { values: valuesCaller, createdAt: '2027-01-02T03:04:05Z' });
assert.equal(valuesCaller.Summary, 'ORIGINAL SUMMARY', 'implementation must not mutate caller-owned values');
assert.equal(valuesExecution.state, 'unavailable');
assert.equal(valuesExecution.qualification.concreteInvocationInputBinding.state, 'failed');
assert(valuesExecution.qualification.concreteInvocationInputBinding.findings.some((item) => item.includes('Summary')));

// A1 alternate inputs: same authority snapshot, no mutable alias through input.inputs.
const mutatesInputs = withImplementation(taskModule, 'v461.mutates-inputs', (contract, input) => {
  if (input.inputs.Summary === 'ORIGINAL SUMMARY') {
    try { input.inputs.Summary = 'MUTATED SUMMARY'; } catch (_) {}
    return genericArtifactCreationImplementation.execute(contract, { ...input, inputs: { ...input.inputs, Summary: 'MUTATED SUMMARY' }, values: { ...input.values, Summary: 'MUTATED SUMMARY' } });
  }
  return genericArtifactCreationImplementation.execute(contract, input);
});
assert.equal(qualifyArtifactCreationCapability(mutatesInputs, 'create-artifact').ready, true);
const inputsCaller = { ...originalValues };
const inputsContract = buildArtifactCreationContract({ schemaId: mutatesInputs.id, module: mutatesInputs });
const inputsExecution = executeArtifactCreationCapability(mutatesInputs, 'create-artifact', inputsContract, { inputs: inputsCaller, createdAt: '2027-01-02T03:04:05Z' });
assert.equal(inputsCaller.Summary, 'ORIGINAL SUMMARY');
assert.equal(inputsExecution.state, 'unavailable');
assert.equal(inputsExecution.qualification.concreteInvocationInputBinding.state, 'failed');

// A2 explicit mutable Date: implementation receives canonical scalar, caller Date remains unchanged, rewritten output cannot redefine expectation.
let observedCreatedAtType = '';
const mutatesDate = withImplementation(taskModule, 'v461.mutates-date', (contract, input) => {
  observedCreatedAtType = typeof input.createdAt;
  if (input.createdAt === '2027-01-02 03:04:05') {
    try { input.createdAt.setUTCFullYear(2035); } catch (_) {}
    return genericArtifactCreationImplementation.execute(contract, { ...input, createdAt: '2035-01-02 03:04:05' });
  }
  return genericArtifactCreationImplementation.execute(contract, input);
});
assert.equal(qualifyArtifactCreationCapability(mutatesDate, 'create-artifact').ready, true);
const callerDate = new Date('2027-01-02T03:04:05Z');
const beforeDate = callerDate.toISOString();
const dateContract = buildArtifactCreationContract({ schemaId: mutatesDate.id, module: mutatesDate });
const dateExecution = executeArtifactCreationCapability(mutatesDate, 'create-artifact', dateContract, { values: originalValues, createdAt: callerDate });
assert.equal(callerDate.toISOString(), beforeDate, 'caller Date object must remain unchanged');
assert.equal(observedCreatedAtType, 'string', 'implementation receives immutable canonical Created At scalar, never authority-bearing mutable Date');
assert.equal(dateExecution.state, 'unavailable');
assert.equal(dateExecution.qualification.executionMetadataFidelity.state, 'failed');
assert.equal(dateExecution.qualification.executionMetadataFidelity.createdAt.expected, '2027-01-02 03:04:05');
assert.equal(dateExecution.qualification.executionMetadataFidelity.createdAt.observed, '2035-01-02 03:04:05');

// Omitted Created At is bound before execution as a scalar and stays self-consistent.
let omittedCreatedAtType = '';
const observesOmitted = withImplementation(taskModule, 'v461.omitted-date-scalar', (contract, input) => { omittedCreatedAtType = typeof input.createdAt; return genericArtifactCreationImplementation.execute(contract, input); });
const omittedContract = buildArtifactCreationContract({ schemaId: observesOmitted.id, module: observesOmitted });
const omitted = executeArtifactCreationCapability(observesOmitted, 'create-artifact', omittedContract, { values: originalValues });
assert.equal(omitted.state, 'rendered');
assert.equal(omittedCreatedAtType, 'string');
assert.equal(omitted.qualification.executionMetadataFidelity.createdAt.observed, omitted.qualification.executionMetadataFidelity.createdAt.expected);

// B: target authority is cross-qualified against qualified source repo + commit + exact path.
const topicRefs = schemaReferenceAuthoritiesForCreation(topicModule);
assert(topicRefs.current.preferredTarget.includes('/Tiinex/docs/blob/'));
assert(topicRefs.current.preferredTarget.endsWith('/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md'));
const wrongPathModule = Object.freeze({ ...topicModule, binding: Object.freeze({ ...topicModule.binding, permalink: `https://github.com/Tiinex/docs/blob/${topicModule.binding.sourceCommit}/README.md` }) });
const wrongPathRefs = schemaReferenceAuthoritiesForCreation(wrongPathModule);
assert.equal(wrongPathRefs.current.exactTargets.includes(wrongPathModule.binding.permalink), false, 'same commit + wrong path must not self-certify');
assert.notEqual(wrongPathRefs.current.preferredTarget, wrongPathModule.binding.permalink);
const wrongRepoModule = Object.freeze({ ...topicModule, binding: Object.freeze({ ...topicModule.binding, permalink: `https://github.com/Other/docs/blob/${topicModule.binding.sourceCommit}/${topicModule.binding.sourcePath}` }) });
assert.equal(schemaReferenceAuthoritiesForCreation(wrongRepoModule).current.exactTargets.includes(wrongRepoModule.binding.permalink), false, 'wrong repository must not qualify');
const mutableModule = Object.freeze({ ...topicModule, binding: Object.freeze({ ...topicModule.binding, permalink: `https://github.com/Tiinex/docs/blob/main/${topicModule.binding.sourcePath}`, rawUrl: '' }) });
assert.notEqual(schemaReferenceAuthoritiesForCreation(mutableModule).current.preferredTarget, mutableModule.binding.permalink, 'mutable binding alias must not become exact target authority');
assert.match(schemaReferenceAuthoritiesForCreation(mutableModule).current.preferredTarget, /\/blob\/[0-9a-f]{40}\//, 'qualified schema-source authority may independently derive a canonical exact target');
const taskRefs = schemaReferenceAuthoritiesForCreation(taskModule);
assert.equal(taskRefs.current.preferredTarget, '', 'non-GitHub/viewer-local schema without exact target authority remains Plain Schema Id');

console.log('post-v461 immutable execution input + schema-reference source authority correction: PASS');

function withImplementation(module, id, execute) {
  return Object.freeze({ ...module, artifactCreation: defineArtifactCreationCapability(module.binding, Object.freeze({ status: 'implemented', renderer: Object.freeze({ id }), transitionTypes: Object.freeze(['create-artifact']), execute })) });
}
