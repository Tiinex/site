import assert from 'node:assert/strict';
import fs from 'node:fs';
import { schemaRegistry } from '../../../schemas/registry.js';
import { buildPortableSchemaGuide, planPortableArtifact } from '../schema/schema.guide.js';
import { parsePortableSchemaDocument } from '../schema/schema.contract.js';
import { validateArtifact } from '../../../validation/validateArtifact.js';
import { inspectPortableMaterial, auditPortableMaterial } from '../engine.facade.js';

const DOCS_COMMIT = 'e713557f8be630967571d11a73f9ecd05ae329ce';
const HANDOFF_DOCS_COMMIT = '3988951208eb9a8926e84ab42625d4b42fa00c2d';
const expected = Object.freeze({
  'tiinex.handoff.v1': ['2332023aecf690279805d34c7e512a9f9799c20d', '.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md', HANDOFF_DOCS_COMMIT],
  'tiinex.decision.v1': ['866ed2d1f2d213d13e68866fd51b5faad155a15c', '.topics/.schemas/core/decision/tiinex.decision.v1.schema.md'],
  'tiinex.feedback.v1': ['7337a482400557ddece16c65a8ec60df441af22b', '.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md'],
  'tiinex.evidence.v1': ['430367bb717d93e396a50c993dc011f8d129bf54', '.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md'],
  'tiinex.discovery.v1': ['1e18d78521c6298d243f1c87a84155be040f032c', '.topics/.schemas/discovery/tiinex.discovery.v1.schema.md'],
  'tiinex.discovery.finding.v1': ['e4f4b5caaf590ed3dc138b5bf2f25e2ece85e6b8', '.topics/.schemas/discovery/finding/tiinex.discovery.finding.v1.schema.md'],
  'tiinex.signal.v1': ['d2c88bd0d1695efc828a3f718429d772aba4c9ca', '.topics/.schemas/core/signal/tiinex.signal.v1.schema.md'],
  'tiinex.preservation.v1': ['0a2f653a7188defcdf8bd60d9b845c695438f6b4', '.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md']
});

for (const [schemaId, [blobSha, sourcePath, sourceCommit = DOCS_COMMIT]] of Object.entries(expected)) {
  const module = schemaRegistry.byId.get(schemaId);
  assert(module, `${schemaId} must be registered`);
  assert.equal(module.binding.sourceRepository, 'Tiinex/docs');
  assert.equal(module.binding.sourceCommit, sourceCommit);
  assert.equal(module.binding.sourcePath, sourcePath);
  assert.equal(module.binding.sourceBlobSha, blobSha);
  assert.equal(module.binding.snapshotCompleteness, 'exact-canonical-docs-snapshot');
  const qualification = module.schemaSource.qualify();
  assert.equal(qualification.state, 'qualified', `${schemaId} bundled source must qualify`);
  assert.equal(qualification.materialIdentity.sourceBlobSha, blobSha, `${schemaId} loaded bytes must prove the published blob`);
  assert.equal(qualification.compiledContract.validationContract.lineageQualification.state, 'valid', `${schemaId} validation lineage must compile`);
  const material = { files: [{ path: module.schemaSource.bundledPath, content: fs.readFileSync(module.schemaSource.bundledPath, 'utf8') }] };
  const guideResult = buildPortableSchemaGuide({ schemaId, task: 'create', materials: material });
  assert.equal(guideResult.findings.some((finding) => finding.severity === 'error'), false, `${schemaId} schema-guide must consume the registered exact material`);
  assert.equal(guideResult.guide.requiredInputs.includes('Create When'), false, `${schemaId} must not expose Creation Scope criteria as input`);
  assert.equal(guideResult.guide.requiredInputs.includes('Do Not Create When'), false, `${schemaId} must not expose Creation Scope criteria as input`);
  const planResult = planPortableArtifact({ schemaId, task: 'create', materials: material });
  assert.equal(planResult.findings.some((finding) => finding.severity === 'error'), false, `${schemaId} plan-artifact must consume the registered exact material`);
  assert.equal(planResult.plan.missingInputs.includes('Create When'), false);
  assert.equal(planResult.plan.missingInputs.includes('Do Not Create When'), false);
}

const handoff = schemaRegistry.byId.get('tiinex.handoff.v1');
const handoffGuide = buildPortableSchemaGuide({ schemaId: 'tiinex.handoff.v1', task: 'create', materials: { files: [{ path: handoff.schemaSource.bundledPath, content: fs.readFileSync(handoff.schemaSource.bundledPath, 'utf8') }] } }).guide;
assert(handoffGuide.requiredInputs.includes('Purpose'));
assert(handoffGuide.requiredInputs.includes('Transfers'));
assert.equal(handoffGuide.requiredInputs.includes('Create When'), false, 'Creation Scope criteria are not authoring inputs');
assert.equal(handoffGuide.requiredInputs.includes('Do Not Create When'), false, 'Creation Scope criteria are not authoring inputs');
const handoffPlan = planPortableArtifact({ schemaId: 'tiinex.handoff.v1', task: 'create', materials: { files: [{ path: handoff.schemaSource.bundledPath, content: fs.readFileSync(handoff.schemaSource.bundledPath, 'utf8') }] } }).plan;
assert.equal(handoffPlan.missingInputs.includes('Create When'), false);
assert.equal(handoffPlan.missingInputs.includes('Do Not Create When'), false);

const schemaModule = schemaRegistry.byId.get('tiinex.schema.module.v1');
const schemaModuleGuide = buildPortableSchemaGuide({ schemaId: schemaModule.id, task: 'create', materials: { files: [{ path: schemaModule.schemaSource.bundledPath, content: fs.readFileSync(schemaModule.schemaSource.bundledPath, 'utf8') }] } }).guide;
assert.equal(schemaModuleGuide.requiredInputs.includes('Create When'), false, 'Creation Scope fix must be generic across maintained schemas');
assert.equal(schemaModuleGuide.requiredInputs.includes('Do Not Create When'), false);

const evidence = schemaRegistry.byId.get('tiinex.evidence.v1');
const evidenceGuide = buildPortableSchemaGuide({ schemaId: evidence.id, task: 'create', materials: { files: [{ path: evidence.schemaSource.bundledPath, content: fs.readFileSync(evidence.schemaSource.bundledPath, 'utf8') }] } }).guide;
assert(evidenceGuide.requiredInputs.includes('Supported Claim Or Question'), 'Creation Fields remain authoring inputs');
assert(evidenceGuide.requiredInputs.includes('Material'), 'Creation Fields remain authoring inputs');

const discovery = schemaRegistry.byId.get('tiinex.discovery.v1');
const discoveryGuide = buildPortableSchemaGuide({ schemaId: discovery.id, task: 'create', materials: { files: [{ path: discovery.schemaSource.bundledPath, content: fs.readFileSync(discovery.schemaSource.bundledPath, 'utf8') }] } }).guide;
assert(discoveryGuide.requiredInputs.includes('Summary'), 'single-brace canonical template placeholders compile to Summary');
assert.equal(discoveryGuide.requiredInputs.includes('{summary}'), false);

const handoffSchemaDocument = parsePortableSchemaDocument(fs.readFileSync(handoff.schemaSource.bundledPath, 'utf8'));
const validationGroups = new Map(handoffSchemaDocument.validation.groups.map((group) => [group.name, group]));
const categoryItems = (group, category) => (group?.categories || []).filter((item) => item.name === category).flatMap((item) => item.items || []);
assert.deepEqual(categoryItems(validationGroups.get('Transfers'), 'Required Fields'), ['Transfer Kind', 'Description']);
assert.deepEqual(categoryItems(validationGroups.get('Required Context'), 'Required Fields'), ['Material', 'Purpose', 'Availability']);
assert.deepEqual(categoryItems(validationGroups.get('Reference Context'), 'Required Fields'), ['Material', 'Purpose', 'Availability']);
assert.equal(categoryItems(validationGroups.get('Required Context'), 'Required Fields').includes('Transfer Kind'), false, 'context membership must not become transfer semantics');

const dogfoodPath = '.topics/development/handoff/tooling/001-v480-tooling-workflow-schema-enablement-handoff.trace.md';
const dogfoodMarkdown = fs.readFileSync(dogfoodPath, 'utf8');
const reopened = validateArtifact({ markdown: dogfoodMarkdown });
assert.equal(reopened.resolution.fallbackUsed, false);
assert.equal(reopened.validation.state, 'compiled-schema-validated');
assert.equal(reopened.validation.semanticContract.state, 'valid');
assert.equal(reopened.validation.integrity.state, 'verified');
assert.equal(reopened.findings.some((finding) => finding.severity === 'error'), false);

const portableInput = { files: [{ path: dogfoodPath, content: dogfoodMarkdown }] };
const inspected = inspectPortableMaterial(portableInput);
assert.equal(inspected.records[0].qualification.moduleExact, true);
assert.equal(inspected.records[0].qualification.capabilityStatus, 'implemented');
const audited = auditPortableMaterial(portableInput);
assert.equal(audited.findingSummary.status, 'clean');

console.log('✓ v480 workflow schema enablement preserved: exact workflow materials, v481 current Handoff requalification, generic compiled validation, Creation Scope exclusion, Creation Fields preservation, and Handoff transfer/context boundary passed');
