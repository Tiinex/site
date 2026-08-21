import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import { defineArtifactCreationCapability, qualifyArtifactCreationCapability } from '../schemas/creation.capability.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { schemaRegistry } from '../schemas/registry.js';
import { defineBundledSchemaSource } from '../schemas/schema.source.js';
import { validatePortableContractInstance } from '../tooling/portable/schema/contract.validate.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { inspectPortableCreationContract } from '../tooling/portable/engine.facade.js';

// A/B — built-in ordinary Create is ready only when representative execution is exact Root + target valid.
for (const schemaId of ['tiinex.topic.v1', 'tiinex.task.v1']) {
  const module = schemaRegistry.modules.find((item) => item.id === schemaId);
  const contract = buildArtifactCreationContract({ schemaId, module, transitionType: 'create-artifact' });
  assert.equal(contract.status, 'ready', `${schemaId} remains ordinary-Create ready`);
  assert.equal(contract.executionQualification?.portableContractQualification, 'qualified');
  assert.equal(contract.executionQualification?.integrityQualification, 'verified');
  const values = Object.fromEntries(contract.creation.requiredInputs.map((name, index) => [name, `V456_${index + 1}_${token(name)}`]));
  const markdown = createArtifactDraftMarkdown(contract, { values, createdAt: '2026-08-20T00:00:00.000Z' });
  assert(markdown, `${schemaId} ordinary Create must materialize`);
  const exact = module.schemaSource.qualify().compiledContract.validationContract;
  const portable = validatePortableContractInstance({ markdown, compiledContract: exact });
  assert.equal(portable.status, 'valid', `${schemaId} generic ordinary Create must satisfy exact compiled Root + target contract`);
  const fullExact = compilePortableSchemaContractChain([
    fs.readFileSync('src/schemas/tiinex.root.v1.schema.md', 'utf8'),
    fs.readFileSync(module.schemaSource.bundledPath, 'utf8')
  ]);
  for (const variant of [
    markdown,
    markdown.replace(/^- Envelope Schema:.*\n/m, ''),
    markdown.replace(/^  - Created At:.*\n/m, ''),
    markdown.replace(/\n?# Continuity Integrity[\s\S]*$/m, ''),
    markdown.replace(/^  - Towards: self\n/m, '')
  ]) {
    assert.equal(validatePortableContractInstance({ markdown: variant, compiledContract: exact }).status, validatePortableContractInstance({ markdown: variant, compiledContract: fullExact }).status, `${schemaId} compact runtime validation projection must match full exact contract status`);
  }
  assert.equal(canonicalC14nV2SelfState(markdown).state, 'verified', `${schemaId} ordinary Create must carry verified self-integrity`);
  assert.equal(validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-create', markdown }, {}, { contract }).ok, true);
}

// A — synthetic future schemas cannot become ready through a shallow target validator.
const malformedExecutors = new Map([
  ['missing Envelope Schema', (markdown) => markdown.replace(/^- Envelope Schema:.*\n/m, '')],
  ['missing Current Created At', (markdown) => markdown.replace(/^  - Created At:.*\n/m, '')],
  ['missing Continuity Integrity', (markdown) => markdown.replace(/\n?# Continuity Integrity[\s\S]*$/m, '')],
  ['malformed Continuity Integrity', (markdown) => markdown.replace(/^  - Towards: self\n/m, '')],
  ['wrong Current Schema', (markdown) => markdown.replace(/^  - Current Schema:.*$/m, '  - Current Schema: tiinex.wrong.v1')],
  ['unexpected Parent in root mode', (markdown) => markdown.replace(/^- Current$/m, '- Parent\n  - Parent Schema: tiinex.root.v1\n  - Trace: record:invented\n  - Boundary: invented\n- Current')],
  ['missing required target section', (markdown) => markdown.replace(/\n## Future Section\n\n[^\n]+/, '')]
]);
for (const [label, mutate] of malformedExecutors) {
  const module = syntheticModule((contract, input) => mutate(genericArtifactCreationImplementation.execute(contract, input)));
  const qualification = qualifyArtifactCreationCapability(module, 'create-artifact');
  assert.equal(qualification.ready, false, `${label} must not become ordinary-Create ready`);
  assert.equal(qualification.implementation.executionQualification.state, 'unavailable', `${label} must fail execution qualification`);
}
const syntheticGood = syntheticModule(genericArtifactCreationImplementation.execute);
assert.equal(buildArtifactCreationContract({ schemaId: syntheticGood.id, module: syntheticGood }).status, 'ready', 'future schema remains extensible when exact source projection + executor really satisfy Root + target truth');

// C — one-line Summary/title binding preserves exact representable caller text or rejects it; it never silently normalizes.
const task = buildArtifactCreationContract({ schemaId: 'tiinex.task.v1' });
const taskValues = (summary, objective = 'objective') => ({ Summary: summary, Objective: objective, 'Done Criteria': 'done', Scope: 'scope', Dependencies: 'dependencies' });
for (const invalid of ['  Alpha Beta', 'Alpha Beta  ', 'Alpha\nBeta', 'Alpha\r\nBeta']) {
  assert.equal(createArtifactDraftMarkdown(task, { values: taskValues(invalid), createdAt: '2026-08-20T00:00:00.000Z' }), '', `unrepresentable one-line Summary must fail closed: ${JSON.stringify(invalid)}`);
}
for (const summary of ['Alpha   Beta', 'A'.repeat(420), 'Pågående — Δ / 日本語 / !? #42']) {
  const markdown = createArtifactDraftMarkdown(task, { values: taskValues(summary), createdAt: '2026-08-20T00:00:00.000Z' });
  assert(markdown, `representable Summary must render: ${summary.slice(0, 30)}`);
  const parsed = parseArtifactMarkdown(markdown);
  assert.equal(parsed.envelope.current.summary, summary, 'Current Summary must preserve caller value exactly');
  assert.equal(parsed.body.title, summary, 'body title must preserve caller value exactly');
}
const multilineBody = 'first line\nsecond  line with repeated spaces\nUnicode Ω and punctuation !?';
const multilineMarkdown = createArtifactDraftMarkdown(task, { values: taskValues('Multiline section proof', multilineBody), createdAt: '2026-08-20T00:00:00.000Z' });
assert(multilineMarkdown.includes(`## Objective\n\n${multilineBody}`), 'multiline section body must preserve caller representation');
assert.equal(validateArtifactCreationResult({ schemaId: 'tiinex.task.v1', status: 'local', sourceMode: 'local-create', markdown: multilineMarkdown }, {}, { contract: task }).ok, true);

const rendererSource = fs.readFileSync('src/schemas/creation.renderer.js', 'utf8');
assert.equal(rendererSource.includes('normalizeTitle'), false, 'generic hidden title normalization must be removed');
assert.equal(rendererSource.includes('normalizeSummary'), false, 'generic hidden Summary normalization must be removed');
assert.equal(/slice\(0,\s*(96|280)\)/.test(rendererSource), false, 'generic 96/280 truncation policy must be removed');

// Shared portable consumer behavior, not byte identity only.
assert.equal(inspectPortableCreationContract({ schemaId: 'tiinex.topic.v1' }).contract.status, 'ready');
assert.equal(inspectPortableCreationContract({ schemaId: 'tiinex.task.v1' }).contract.status, 'ready');
assert.equal(inspectPortableCreationContract({ schemaId: 'tiinex.evidence.v1' }).contract.status, 'blocked');
assert.equal(inspectPortableCreationContract({ schemaId: 'tiinex.relation.v1' }).contract.status, 'blocked');

console.log('post-v456 exact creation-result qualification correction: PASS');

function syntheticModule(execute) {
  const schemaId = 'tiinex.synthetic.v456.v1';
  const checksum = 'd'.repeat(64);
  const binding = Object.freeze({ schemaId, sourcePath: `.topics/.schemas/${schemaId}.schema.md`, sourceRepository: 'Tiinex/test', sourceCommit: '0123456789012345678901234567890123456789', checksum: Object.freeze({ algorithm: 'sha256', value: checksum }) });
  const projection = Object.freeze({
    schema: 'tiinex.site.schema-runtime-projection.v1', generator: 'schema-runtime-projection-v1', schemaId, sourceChecksum: checksum, bindingChecksum: checksum, sourceBytes: 1,
    validationContract: syntheticValidationContract(schemaId, ['Future Section']),
    creation: Object.freeze({ declared: true, groupNames: Object.freeze(['Synthetic Creation']), requiredInputs: Object.freeze(['Summary', 'Future Section']), optionalInputs: Object.freeze([]), requiredSections: Object.freeze(['Future Section']), toolingConfigurationFields: Object.freeze([]), inputBindings: Object.freeze([{ input: 'Summary', kind: 'root-current-summary-body-title', section: '' }, { input: 'Future Section', kind: 'section-body', section: 'Future Section' }]) })
  });
  const schemaSource = defineBundledSchemaSource(binding, projection, { assetUrl: 'asset:synthetic-v456' });
  return Object.freeze({ id: schemaId, label: 'Synthetic v456', kind: 'concrete', role: 'core-artifact', parentSchemaId: 'tiinex.root.v1', binding, schemaSource, artifactCreation: defineArtifactCreationCapability(binding, Object.freeze({ status: 'implemented', renderer: Object.freeze({ id: 'synthetic.v456' }), transitionTypes: Object.freeze(['create-artifact']), execute })), capabilities: Object.freeze({}), validate() { return []; }, present() { return {}; } });
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
function token(value = '') { return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_'); }
