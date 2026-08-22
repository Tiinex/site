import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { defineArtifactCreationCapability, executeArtifactCreationCapability } from '../schemas/creation.capability.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { defineBundledSchemaSource } from '../schemas/schema.source.js';
import { schemaRegistry } from '../schemas/registry.js';

// A — every built-in ordinary Create that reports ready must preserve every required caller input.
for (const module of schemaRegistry.modules) {
  const contract = buildArtifactCreationContract({ schemaId: module.id, module, transitionType: 'create-artifact' });
  if (contract.status !== 'ready') continue;
  const values = Object.fromEntries(contract.creation.requiredInputs.map((name, index) => [name, `V455_${index + 1}_${token(name)}_SENTINEL`]));
  const markdown = createArtifactDraftMarkdown(contract, { values, createdAt: '2026-08-20T00:00:00.000Z' });
  assert(markdown, `${module.id} ready ordinary Create must materialize through the advertised owner`);
  const parsed = parseArtifactMarkdown(markdown);
  assert.equal(hasParent(parsed.envelope.parent), false, `${module.id} standalone ordinary Create must not invent Parent truth`);
  for (const name of contract.creation.requiredInputs) {
    const binding = contract.creation.inputBindings.find((item) => norm(item.input) === norm(name));
    assert(binding && binding.kind !== 'unmapped', `${module.id} ready input ${name} must have compiler-derived representation binding`);
    const sentinel = values[name];
    if (binding.kind === 'root-current-summary-body-title') {
      assert.equal(parsed.envelope.current.summary, sentinel, `${module.id} ${name} must bind to Current Summary`);
      assert.equal(parsed.body.title, sentinel, `${module.id} ${name} must bind to body title`);
    } else if (binding.kind === 'section-body') {
      assert.equal(sectionBody(parsed.body.text, binding.section), sentinel, `${module.id} ${name} must bind exactly to ${binding.section}`);
    } else assert.fail(`${module.id} ready Create exposed unsupported binding kind ${binding.kind}`);
  }
  const validation = validateArtifactCreationResult({ schemaId: module.id, status: 'local', sourceMode: 'local-create', markdown }, {}, { contract });
  assert.equal(validation.ok, true, `${module.id} input-faithful root result must validate`);
  assert.equal(contract.executionQualification?.inputFidelity, 'representative-qualified', `${module.id} readiness must carry input-fidelity qualification`);

  if (contract.creation.requiredInputs.length) {
    const missing = { ...values };
    delete missing[contract.creation.requiredInputs.at(-1)];
    assert.equal(createArtifactDraftMarkdown(contract, { values: missing, createdAt: '2026-08-20T00:00:00.000Z' }), '', `${module.id} must fail closed when a required caller input is absent`);
  }
}

// B — generic renderer must not dispatch semantic defaults through today's section vocabulary.
const rendererSource = fs.readFileSync('src/schemas/creation.renderer.js', 'utf8');
for (const literal of ['Objective', 'Done Criteria', 'Scope', 'Dependencies', 'Current Read', 'Design Direction', 'Next Artifacts']) {
  assert.equal(rendererSource.includes(`'${literal}'`) || rendererSource.includes(`\"${literal}\"`), false, `generic renderer must not own ${literal} semantic behavior`);
}
assert.equal(rendererSource.includes('defaultSectionValue'), false, 'schema-vocabulary default switchboard must be removed');

// C — root create has no Parent; continuation has the exact supplied Parent.
const topicRoot = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'create-artifact' });
const topicValues = Object.fromEntries(topicRoot.creation.requiredInputs.map((name, index) => [name, `ROOT_${index}_${token(name)}`]));
const rootMarkdown = createArtifactDraftMarkdown(topicRoot, { values: topicValues, createdAt: '2026-08-20T00:00:00.000Z' });
const rootParsed = parseArtifactMarkdown(rootMarkdown);
assert.equal(hasParent(rootParsed.envelope.parent), false);
assert.equal(rootMarkdown.includes('\n- Parent\n'), false);
assert.equal(validateArtifactCreationResult({ schemaId: 'tiinex.topic.v1', status: 'local', sourceMode: 'local-create', markdown: rootMarkdown }, {}, { contract: topicRoot }).ok, true);

const parent = Object.freeze({ id: 'parent-455', path: '.topics/parent-455.trace.md', schemaId: 'tiinex.topic.v1', currentSchemaId: 'tiinex.topic.v1', createdAt: '2026-08-20 00:00:00', currentCreatedAt: '2026-08-20 00:00:00', sourceMode: 'local-test' });
assert.equal(createArtifactDraftMarkdown(topicRoot, { parentRecord: parent, values: topicValues }), '', 'ordinary root Create must refuse supplied Parent input');
const continuation = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'continue-from-record' });
const unpublishedContinuation = createArtifactDraftMarkdown(continuation, { parentRecord: parent, title: 'Continuation', summary: 'Continuation', createdAt: '2026-08-20T00:00:00.000Z', bodyMarkdown: '# Continuation\n\n## Current Read\n\nread\n\n## Design Direction\n\ndirection\n\n## Next Artifacts\n\nnext', childPath: '.topics/children/continuation.trace.md' });
assert.equal(unpublishedContinuation, '', 'exact continuation must fail closed when the local Parent has no qualified published/recovery authority');
const qualifiedParent = Object.freeze({
  ...parent,
  publishedReference: Object.freeze({ target: 'https://archive.example.test/v455/parent-455.trace.md', state: 'qualified' }),
  schemaReferenceAuthority: Object.freeze({ ...continuation.schemaReferences.current, resolutionState: 'qualified' })
});
const continuationPath = '.topics/children/continuation.trace.md';
const continuationMarkdown = createArtifactDraftMarkdown(continuation, { parentRecord: qualifiedParent, title: 'Continuation', summary: 'Continuation', createdAt: '2026-08-20T00:00:00.000Z', bodyMarkdown: '# Continuation\n\n## Current Read\n\nread\n\n## Design Direction\n\ndirection\n\n## Next Artifacts\n\nnext', childPath: continuationPath });
const continuationParsed = parseArtifactMarkdown(continuationMarkdown);
assert.equal(continuationParsed.envelope.parent.schema.id, qualifiedParent.schemaId);
assert.equal(continuationParsed.envelope.parent.trace, '../parent-455.trace.md');
assert.deepEqual(continuationParsed.envelope.parent.originEntries.map(({ label, target }) => ({ label, target })), [
  { label: 'relative', target: '../parent-455.trace.md' },
  { label: 'browse + git', target: qualifiedParent.publishedReference.target }
]);
assert.equal(validateArtifactCreationResult({ schemaId: 'tiinex.topic.v1', status: 'local', sourceMode: 'local-create', markdown: continuationMarkdown, path: continuationPath }, qualifiedParent, { contract: continuation, childPath: continuationPath }).ok, true);
const rootAgainstParentBytes = validateArtifactCreationResult({ schemaId: 'tiinex.topic.v1', status: 'local', sourceMode: 'local-create', markdown: continuationMarkdown, path: continuationPath }, {}, { contract: topicRoot });
assert.equal(rootAgainstParentBytes.ok, false);
assert(rootAgainstParentBytes.findings.some((finding) => finding.code === 'creation.parent.unexpected'));

// D — blocked exact ordinary creation is fail-closed at the execution helper.
for (const schemaId of ['tiinex.evidence.v1', 'tiinex.relation.v1', 'tiinex.future.unknown.v9']) {
  const contract = buildArtifactCreationContract({ schemaId, transitionType: 'create-artifact' });
  assert.equal(contract.status, 'blocked', `${schemaId} fixture must be blocked`);
  assert.equal(createArtifactDraftMarkdown(contract, { values: { Summary: 'must-not-render' } }), '', `${schemaId} blocked Create must not fall through to generic bytes`);
}
const incompatible = syntheticModule({ execute() { return '# not an artifact'; } });
const incompatibleContract = buildArtifactCreationContract({ schemaId: incompatible.id, module: incompatible, transitionType: 'create-artifact' });
assert.equal(incompatibleContract.status, 'blocked');
assert.equal(executeArtifactCreationCapability(incompatible, 'create-artifact', incompatibleContract, { values: { Summary: 'S', 'Future Section': 'F' } }).state, 'unavailable');

// Future schema: exact source-derived bindings + faithful executor work without editing generic core for the schema id.
const future = syntheticModule({ execute: genericArtifactCreationImplementation.execute });
const futureContract = buildArtifactCreationContract({ schemaId: future.id, module: future, transitionType: 'create-artifact' });
assert.equal(futureContract.status, 'ready');
assert.equal(futureContract.executionQualification?.inputFidelity, 'representative-qualified');

console.log('post-v455 creation input fidelity + root continuity correction: PASS');

function syntheticModule({ execute }) {
  const schemaId = 'tiinex.synthetic.v455.v1';
  const checksum = 'c'.repeat(64);
  const binding = Object.freeze({ schemaId, sourcePath: `.topics/.schemas/${schemaId}.schema.md`, sourceRepository: 'Tiinex/test', sourceCommit: '0123456789012345678901234567890123456789', checksum: Object.freeze({ algorithm: 'sha256', value: checksum }) });
  const projection = Object.freeze({ schema: 'tiinex.site.schema-runtime-projection.v1', generator: 'schema-runtime-projection-v1', schemaId, sourceChecksum: checksum, bindingChecksum: checksum, sourceBytes: 1, validationContract: syntheticValidationContract(schemaId, ['Future Section']), creation: Object.freeze({ declared: true, groupNames: Object.freeze(['Synthetic Creation']), requiredInputs: Object.freeze(['Summary', 'Future Section']), optionalInputs: Object.freeze([]), requiredSections: Object.freeze(['Future Section']), toolingConfigurationFields: Object.freeze([]), inputBindings: Object.freeze([{ input: 'Summary', kind: 'root-current-summary-body-title', section: '' }, { input: 'Future Section', kind: 'section-body', section: 'Future Section' }]) }) });
  const schemaSource = defineBundledSchemaSource(binding, projection, { assetUrl: 'asset:synthetic-v455' });
  return Object.freeze({ id: schemaId, label: 'Synthetic v455', kind: 'concrete', role: 'core-artifact', parentSchemaId: 'tiinex.root.v1', binding, schemaSource, artifactCreation: defineArtifactCreationCapability(binding, Object.freeze({ status: 'implemented', renderer: Object.freeze({ id: 'synthetic.v455' }), transitionTypes: Object.freeze(['create-artifact']), execute })), capabilities: Object.freeze({}), validate(parsed) { return parsed.body.sections.includes('Future Section') ? [] : [{ severity: 'error', code: 'future.section.missing', message: 'Future Section missing.' }]; }, present() { return {}; } });
}

function syntheticValidationContract(schemaId, requiredSections = []) {
  const root = compilePortableSchemaContractChain([fs.readFileSync('src/schemas/tiinex.root.v1.schema.md', 'utf8')]);
  return Object.freeze({
    ...root,
    schemaId,
    lineage: Object.freeze(['tiinex.root.v1', schemaId]),
    lineageQualification: Object.freeze({ state: 'valid', complete: true, lineage: Object.freeze(['tiinex.root.v1', schemaId]), findings: Object.freeze([]) }),
    validation: Object.freeze({ ...root.validation, requiredSections: Object.freeze([...new Set([...(root.validation?.requiredSections || []), ...requiredSections])]) })
  });
}

function sectionBody(bodyText = '', section = '') {
  const lines = String(bodyText || '').split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${section}`);
  if (start < 0) return '';
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) if (/^#{1,2}\s+/.test(lines[index])) { end = index; break; }
  return lines.slice(start + 1, end).join('\n').trim();
}
function hasParent(parent = {}) { return Boolean(parent?.schema?.id || parent?.trace || parent?.origin || parent?.boundary || parent?.createdAt); }
function norm(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' '); }
function token(value = '') { return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_'); }
