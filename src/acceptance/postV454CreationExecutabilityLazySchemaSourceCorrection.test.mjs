import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { defineArtifactCreationCapability, qualifyArtifactCreationCapability } from '../schemas/creation.capability.js';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { defineBundledSchemaSource, qualifyBundledSchemaReadableText, qualifyBundledSchemaSource } from '../schemas/schema.source.js';
import { schemaRegistry } from '../schemas/registry.js';
import { relationSchemaModule } from '../schemas/core/relation/tiinex.relation.v1.schema.js';
import { loadViewerSchemaMarkdown } from '../app/schemaNavigationRuntimeCatalog.js';
import { schemaCatalogEntryForId } from '../schemas/schemaMarkdownCatalog.js';

// A — every built-in ordinary Create reported ready must execute and validate at the target boundary.
const expectedReady = new Set(['tiinex.topic.v1', 'tiinex.task.v1', 'tiinex.signal.v1']);
for (const module of schemaRegistry.modules) {
  const contract = buildArtifactCreationContract({ schemaId: module.id, module, transitionType: 'create-artifact' });
  if (contract.status !== 'ready') continue;
  assert(expectedReady.has(module.id), `${module.id} unexpectedly reports ordinary Create ready`);
  const values = Object.fromEntries(contract.creation.requiredInputs.map((name, index) => [name, `v454-input-${index + 1}-${name}`]));
  const markdown = createArtifactDraftMarkdown(contract, { values, createdAt: '2026-08-20T00:00:00.000Z' });
  const validation = validateArtifactCreationResult({ schemaId: module.id, status: 'local', sourceMode: 'local-creation', markdown }, {}, { contract });
  assert.equal(validation.ok, true, `${module.id} advertised Create owner must produce a target-valid result`);
  assert.equal(contract.executionQualification?.state, 'qualified', `${module.id} ready contract must carry execution qualification`);
}
assert.equal(buildArtifactCreationContract({ schemaId: 'tiinex.task.v1' }).status, 'ready', 'Task remains ready only because the executable now satisfies exact Task validation');
assert.equal(buildArtifactCreationContract({ schemaId: 'tiinex.evidence.v1' }).status, 'blocked', 'Evidence must fail closed while its executable cannot satisfy required Evidence sections');
assert.equal(buildArtifactCreationContract({ schemaId: relationSchemaModule.id, module: relationSchemaModule }).status, 'blocked', 'Relation remains without ordinary standalone Create authority');

// semantic authority + no compatible executable => blocked.
const syntheticProjection = runtimeProjection('tiinex.synthetic.future.v1', 'a'.repeat(64), ['Required Section']);
const syntheticBinding = bindingFor('tiinex.synthetic.future.v1', 'a'.repeat(64));
const syntheticSource = defineBundledSchemaSource(syntheticBinding, syntheticProjection, { bundledPath: syntheticBinding.sourcePath, assetUrl: 'asset:synthetic' });
const noExecutable = moduleFor(syntheticBinding, syntheticSource, null, syntheticValidator);
assert.equal(buildArtifactCreationContract({ schemaId: noExecutable.id, module: noExecutable }).status, 'blocked');

// compatible executable + no semantic authority => blocked.
const noAuthorityProjection = runtimeProjection('tiinex.synthetic.no-authority.v1', 'b'.repeat(64), [], false);
const noAuthorityBinding = bindingFor('tiinex.synthetic.no-authority.v1', 'b'.repeat(64));
const noAuthority = moduleFor(noAuthorityBinding, defineBundledSchemaSource(noAuthorityBinding, noAuthorityProjection, { assetUrl: 'asset:no-authority' }), validSyntheticImplementation(), syntheticValidator);
assert.equal(buildArtifactCreationContract({ schemaId: noAuthority.id, module: noAuthority }).status, 'blocked');

// Arbitrary callable that ignores target creation requirements is not enough.
const ignoresRequirements = moduleFor(syntheticBinding, syntheticSource, Object.freeze({
  status: 'implemented', renderer: Object.freeze({ id: 'synthetic.ignores-requirements' }), transitionTypes: Object.freeze(['create-artifact']),
  execute(contract, input) { return genericArtifactCreationImplementation.execute({ ...contract, creation: { ...contract.creation, requiredSections: [] } }, input); }
}), syntheticValidator);
const ignored = buildArtifactCreationContract({ schemaId: ignoresRequirements.id, module: ignoresRequirements });
assert.equal(ignored.status, 'blocked');
assert.equal(ignored.executionQualification?.state, 'unavailable');

// Synthetic future schema can be ready without generic-core schema-id edits only with genuinely satisfying execution.
const future = moduleFor(syntheticBinding, syntheticSource, validSyntheticImplementation(), syntheticValidator);
const futureContract = buildArtifactCreationContract({ schemaId: future.id, module: future });
assert.equal(futureContract.status, 'ready');
assert.equal(qualifyArtifactCreationCapability(future, 'create-artifact').implementation.executableOwner, 'representative-preflight-qualified-execution');

// B — runtime schema source is compact/generated; readable Markdown remains lazy and exact.
const sourceCompanions = findFiles('src/schemas', (file) => file.endsWith('.schema.source.js'));
const eagerSourceBytes = sourceCompanions.reduce((sum, file) => sum + fs.statSync(file).size, 0);
assert.equal(sourceCompanions.length, schemaRegistry.modules.length, 'every registered built-in module keeps one lazy schema source companion');
assert(eagerSourceBytes < 10000, `schema source companions must remain compact; observed ${eagerSourceBytes} bytes`);
for (const file of sourceCompanions) {
  const text = fs.readFileSync(file, 'utf8');
  assert.equal(text.includes('const markdown = '), false, `${file} must not eagerly embed full schema Markdown`);
  assert(text.includes('.schema.runtime.json'), `${file} must consume generated runtime projection`);
  assert(text.includes('new URL('), `${file} must expose lazy bundled readable asset`);
}
const schemaSourceOwner = fs.readFileSync('src/schemas/schema.source.js', 'utf8');
assert.equal(schemaSourceOwner.includes('compilePortableSchemaContract'), false, 'browser runtime source owner must not import portable schema compiler');
assert.equal(schemaSourceOwner.includes('runtimeProjection'), true);

for (const module of schemaRegistry.modules) {
  const qualification = qualifyBundledSchemaSource(module.schemaSource);
  assert.equal(qualification.state, 'qualified', `${module.id} generated runtime projection must match exact binding`);
  assert.equal(qualification.checksum, module.binding.checksum.value);
}

const relationEntry = schemaCatalogEntryForId('tiinex.relation.v1');
assert(relationEntry, 'Relation remains discoverable through installed schema source projection');
let assetReads = 0;
const relationLoaded = await loadViewerSchemaMarkdown('tiinex.relation.v1', async (url) => {
  assetReads += 1;
  assert(String(url).includes('tiinex.relation.v1.schema.md'));
  const markdown = fs.readFileSync(new URL(url), 'utf8');
  return { ok: true, text: async () => markdown };
});
assert.equal(assetReads, 1, 'Relation readable source is loaded lazily only when opened');
assert.equal(relationLoaded?.readableQualification?.state, 'qualified');
assert(relationLoaded.markdown.includes('tiinex.relation.v1'));
const tampered = qualifyBundledSchemaReadableText(relationSchemaModule.schemaSource, `${relationLoaded.markdown}\nchanged`);
assert.equal(tampered.state, 'unavailable', 'lazy readable bytes must be checked against exact binding before use');
assert.equal(await loadViewerSchemaMarkdown('tiinex.unknown.unbundled.v1', async () => { throw new Error('unknown schema must not guess/fetch'); }), null);

console.log('post-v454 creation executability + lazy schema source correction: PASS');

function validSyntheticImplementation() {
  return Object.freeze({
    status: 'implemented', renderer: Object.freeze({ id: 'synthetic.valid-renderer' }), transitionTypes: Object.freeze(['create-artifact']),
    execute(contract, input) { return genericArtifactCreationImplementation.execute(contract, input); }
  });
}
function syntheticValidator(parsed) {
  return parsed.body.sections.includes('Required Section') ? [] : [{ severity: 'error', code: 'synthetic.section.missing', message: 'Required Section missing.' }];
}
function moduleFor(binding, schemaSource, implementation, validate) {
  return Object.freeze({
    id: binding.schemaId, label: 'Synthetic', kind: 'concrete', role: 'core-artifact', parentSchemaId: 'tiinex.root.v1', binding, schemaSource,
    artifactCreation: defineArtifactCreationCapability(binding, implementation), capabilities: Object.freeze({}), validate, present() { return {}; }
  });
}
function bindingFor(schemaId, checksum) {
  return Object.freeze({ schemaId, sourcePath: `.topics/.schemas/${schemaId}.schema.md`, sourceRepository: 'Tiinex/test', sourceCommit: '0123456789012345678901234567890123456789', checksum: Object.freeze({ algorithm: 'sha256', value: checksum }) });
}
function runtimeProjection(schemaId, checksum, requiredSections = [], declared = true) {
  return Object.freeze({
    schema: 'tiinex.site.schema-runtime-projection.v1', generator: 'schema-runtime-projection-v1', schemaId, sourceChecksum: checksum, bindingChecksum: checksum, sourceBytes: 1,
    validationContract: syntheticValidationContract(schemaId, requiredSections),
    creation: Object.freeze({ declared, groupNames: Object.freeze(declared ? ['Synthetic Creation'] : []), requiredInputs: Object.freeze(['Summary', ...requiredSections]), optionalInputs: Object.freeze([]), requiredSections: Object.freeze(requiredSections), toolingConfigurationFields: Object.freeze([]), inputBindings: Object.freeze([{ input: 'Summary', kind: 'root-current-summary-body-title', section: '' }, ...requiredSections.map((section) => ({ input: section, kind: 'section-body', section }))]) })
  });
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

function findFiles(root, predicate) {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory()) out.push(...findFiles(full, predicate));
    else if (entry.isFile() && predicate(full)) out.push(full);
  }
  return out;
}
