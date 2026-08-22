import assert from 'node:assert/strict';
import { schemaRegistry } from './registry.js';
import {
  ARTIFACT_CREATION_CONTRACT_SCHEMA_ID,
  buildArtifactCreationContract,
  createArtifactDraftMarkdown,
  listCreatableArtifactSchemas,
  validateArtifactCreationContract,
  validateArtifactCreationResult
} from './creation.contracts.js';


const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const TOPIC_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md';
const exactTopicReferences = Object.freeze({
  envelope: Object.freeze({ schemaId: 'tiinex.root.v1', preferredTarget: ROOT_SCHEMA_TARGET, resolutionState: 'qualified' }),
  current: Object.freeze({ schemaId: 'tiinex.topic.v1', preferredTarget: TOPIC_SCHEMA_TARGET, resolutionState: 'qualified' })
});

const creatable = listCreatableArtifactSchemas(schemaRegistry);
assert(creatable.some((contract) => contract.target.schemaId === 'tiinex.topic.v1'), 'topic creation contract must be available');
assert.equal(creatable.some((contract) => contract.target.schemaId === 'tiinex.evidence.v1'), false, 'evidence ordinary Create stays blocked until its executable satisfies exact Evidence validation');
assert(creatable.some((contract) => contract.target.schemaId === 'tiinex.task.v1'), 'task creation contract must be available for the first Topic → Task slice');
assert(creatable.every((contract) => contract.schema === ARTIFACT_CREATION_CONTRACT_SCHEMA_ID), 'all creation targets are contracts');
assert(creatable.every((contract) => contract.status === 'ready'), 'registered core artifact contracts should be ready');
assert(creatable.every((contract) => contract.resultBoundary.remoteWrite === false), 'creation contracts must not remote write');
assert(creatable.every((contract) => contract.resultBoundary.mayInheritParentSource === false), 'creation contracts must not inherit source objects');

const unknown = buildArtifactCreationContract({ schemaId: 'tiinex.future.unknown.v9' });
assert.equal(unknown.status, 'blocked', 'unknown schemas cannot be created through root fallback');
assert(unknown.findings.some((finding) => finding.code === 'creation.schema.fallback-blocked'), 'unknown creation is blocked with fallback finding');
assert.equal(validateArtifactCreationContract(unknown).ok, false, 'blocked contract validation fails');

const parent = {
  id: 'local:workspace:notes/parent.md',
  title: 'Parent artifact',
  summary: 'Parent summary',
  path: 'notes/parent.md',
  kind: 'tiinex.topic.v1',
  schemaId: 'tiinex.topic.v1',
  createdAt: '2026-07-20 00:00:00',
  publishedReference: { target: 'https://archive.example.test/site/notes/parent.md', state: 'qualified' },
  schemaReferenceAuthority: { schemaId: 'tiinex.topic.v1', preferredTarget: TOPIC_SCHEMA_TARGET, exactTargets: [TOPIC_SCHEMA_TARGET], resolutionState: 'qualified' },
  sourceMode: 'local-files',
  source: { adapterId: 'local', kind: 'local-session' }
};

const taskContract = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1', transitionType: 'continue-from-record' });
assert.equal(taskContract.status, 'ready', 'task creation contract is ready for continue-from-record');
assert.equal(validateArtifactCreationContract(taskContract).ok, true, 'ready task contract validates');

const contract = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'continue-from-record', schemaReferences: exactTopicReferences });
assert.equal(contract.status, 'ready', 'topic creation contract is ready');
assert.equal(validateArtifactCreationContract(contract).ok, true, 'ready contract validates');

const markdown = createArtifactDraftMarkdown(contract, {
  parentRecord: parent,
  childPath: 'notes/nested/created-topic.trace.md',
  title: 'Created through creation contract.',
  summary: 'Created through creation contract.',
  createdAt: '2026-07-21T00:00:00.000Z',
  values: {
    Summary: 'Created through creation contract.',
    'Current Read': 'The shared renderer uses exact contract-owned Topic sections.',
    'Design Direction': 'Preserve canonical envelope and reference authority.',
    'Next Artifacts': 'Continue only from a qualified published Parent representation.'
  }
});
assert(markdown.includes(`Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})`), 'contract renderer writes exact root envelope reference');
assert(markdown.includes(`Current Schema: [tiinex.topic.v1](${TOPIC_SCHEMA_TARGET})`), 'contract renderer writes exact target schema reference');
assert(markdown.includes('Trace: [parent.md](../parent.md)'), 'contract renderer writes a path-relative Markdown Parent Trace');
assert(markdown.includes('  - Origin:\n    - [relative](../parent.md)\n    - [browse + git](https://archive.example.test/site/notes/parent.md)'), 'contract renderer writes exact labelled Parent Origin references');
assert.equal(markdown.includes('  - Boundary:'), false, 'canonical Parent must not invent legacy Boundary');
assert(markdown.includes('# Continuity Integrity'), 'contract renderer writes integrity footer');

const draft = { kind: 'tiinex.topic.v1', status: 'local', sourceMode: 'local-creation', markdown };
const validation = validateArtifactCreationResult({ ...draft, path: 'notes/nested/created-topic.trace.md' }, parent, { contract, childPath: 'notes/nested/created-topic.trace.md' });
assert.equal(validation.schema, 'tiinex.artifact.creation.result.validation.v1');
assert.equal(validation.ok, true, 'contract-generated draft validates');
assert.equal(validation.parsed.currentSchemaId, 'tiinex.topic.v1');
assert.equal(validation.parsed.parentTrace, '../parent.md');

const leaked = { ...draft, source: { adapterId: 'github' } };
const leakedValidation = validateArtifactCreationResult({ ...leaked, path: 'notes/nested/created-topic.trace.md' }, parent, { contract, childPath: 'notes/nested/created-topic.trace.md' });
assert.equal(leakedValidation.ok, false, 'creation result must not inherit source object');
assert(leakedValidation.findings.some((finding) => finding.code === 'creation.result.source.inherited'), 'source inheritance finding exists');

console.log('schema creation contracts: ok');
