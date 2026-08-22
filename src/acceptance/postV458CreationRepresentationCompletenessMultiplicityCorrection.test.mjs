import assert from 'node:assert/strict';
import { buildArtifactCreationContract, createArtifactDraftMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { defineArtifactCreationCapability, executeArtifactCreationCapability } from '../schemas/creation.capability.js';
import { genericArtifactCreationImplementation } from '../schemas/creation.renderer.js';
import { schemaRegistry } from '../schemas/registry.js';
import { sealC14nV2Self } from '../integrity/integrity.c14nV2.js';
import { inspectCreationRepresentation } from '../schemas/creation.representation.js';
import { renderCanonicalTaskLocalArtifact, qualifyCanonicalTaskLocalArtifact } from '../schemas/core/task/tiinex.task.v1.localMaterialization.js';
import { renderCanonicalTopicLocalArtifact, qualifyCanonicalTopicLocalArtifact } from '../schemas/core/topic/tiinex.topic.v1.localMaterialization.js';
import { defineBundledSchemaSource } from '../schemas/schema.source.js';

const taskModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.task.v1');
const topicModule = schemaRegistry.modules.find((item) => item.id === 'tiinex.topic.v1');
const task = buildArtifactCreationContract({ schemaId: taskModule.id, module: taskModule });
const topic = buildArtifactCreationContract({ schemaId: topicModule.id, module: topicModule });
assert.equal(task.status, 'ready');
assert.equal(topic.status, 'ready');
assert.equal(task.executionQualification.requiredShapeQualification, 'qualified');
assert.equal(topic.executionQualification.requiredShapeQualification, 'qualified');
assert(topic.creation.requiredShape.some((item) => item.primitive.kind === 'residual'), 'Topic must preserve residual creation shape authority');
assert.equal(task.creation.requiredShape.some((item) => item.primitive.kind === 'residual'), false, 'Task shape must be fully generic-projectable');

const taskValues = { Summary: 'Multiplicity', Objective: 'GOOD', 'Done Criteria': 'DONE', Scope: 'SCOPE', Dependencies: 'DEPS' };
const taskMarkdown = createArtifactDraftMarkdown(task, { values: taskValues, createdAt: '2026-08-20T00:00:00.000Z' });
assert(taskMarkdown);
assert(taskMarkdown.includes('  - Created At: 2026-08-20 00:00:00'), 'Root Created At must use canonical Root representation');
assert.equal(taskMarkdown.includes('2026-08-20T00:00:00.000Z'), false);
assert.equal(validateArtifactCreationResult({ schemaId: taskModule.id, status: 'local', sourceMode: 'local-create', markdown: taskMarkdown }, {}, { contract: task }).ok, true);

// A — exact creation representation targets are unique, not first-match authority.
for (const [label, mutate] of [
  ['duplicate required section conflicting', (md) => md.replace('\n## Done Criteria\n', '\n## Objective\n\nCONFLICTING SECOND OBJECTIVE\n\n## Done Criteria\n')],
  ['duplicate required section identical', (md) => md.replace('\n## Done Criteria\n', '\n## Objective\n\nGOOD\n\n## Done Criteria\n')],
  ['duplicate Current Summary', (md) => md.replace('  - Summary: Multiplicity\n', '  - Summary: Multiplicity\n  - Summary: Multiplicity\n')],
  ['duplicate Current Schema', (md) => md.replace(/^  - Current Schema:.*$/m, (line) => `${line}\n${line}`)],
  ['duplicate Created At', (md) => md.replace('  - Created At: 2026-08-20 00:00:00\n', '  - Created At: 2026-08-20 00:00:00\n  - Created At: 2026-08-20 00:00:00\n')],
  ['duplicate body H1', (md) => md.replace('# Multiplicity\n', '# Multiplicity\n\n# Multiplicity\n')]
]) {
  const mutated = reseal(mutate(taskMarkdown));
  const observed = inspectCreationRepresentation(mutated, { boundSections: task.creation.requiredSections });
  assert(observed, label);
  const validation = validateArtifactCreationResult({ schemaId: taskModule.id, status: 'local', sourceMode: 'local-create', markdown: mutated }, {}, { contract: task });
  assert.equal(validation.ok, false, `${label} must fail closed after correct reseal`);
}

const duplicatedIntegrity = taskMarkdown.replace(/(- (?:\[sha256-base64url-c14n-v2\]\([^)]+\)|sha256-base64url-c14n-v2)\n  - Towards: self\n  - Value: [^\n]+)/, '$1\n$1');
assert.equal(validateArtifactCreationResult({ schemaId: taskModule.id, status: 'local', sourceMode: 'local-create', markdown: duplicatedIntegrity }, {}, { contract: task }).ok, false, 'duplicate active self-integrity entries must fail closed');

// Per-execution boundary must return no bytes for a correctly resealed duplicate section.
const duplicateExecutor = taskWithImplementation((contract, input) => {
  const md = genericArtifactCreationImplementation.execute(contract, input);
  const mutated = md.replace('\n## Done Criteria\n', '\n## Objective\n\nCONFLICTING SECOND OBJECTIVE\n\n## Done Criteria\n');
  return reseal(mutated);
});
const duplicateContract = buildArtifactCreationContract({ schemaId: duplicateExecutor.id, module: duplicateExecutor });
assert.equal(duplicateContract.status, 'blocked', 'representative duplicate target must block readiness instead of selecting first occurrence');

// C — portable validation is explicit partial coverage, not an exact semantic claim.
const executed = executeArtifactCreationCapability(taskModule, 'create-artifact', task, { values: taskValues, createdAt: '2026-08-20T00:00:00.000Z' });
assert.equal(executed.state, 'rendered');
assert.equal(executed.qualification.portableRootTargetValidation.state, 'qualified');
assert.equal(executed.qualification.portableRootTargetValidation.coverage, 'portable-structural');
assert.equal(Object.hasOwn(executed.qualification, 'exactRootTargetResult'), false);
assert.equal(executed.qualification.representationMultiplicity.state, 'qualified');
assert.equal(executed.qualification.requiredShapeCoverage.state, 'qualified');
assert.equal(executed.qualification.integrity.state, 'verified');

// B — Topic residual creation shape is schema-owned and present in ordinary Create.
const topicValues = { Summary: 'Residual shape', 'Current Read': 'READ', 'Design Direction': 'DIRECTION', 'Next Artifacts': 'NEXT' };
const topicMarkdown = createArtifactDraftMarkdown(topic, { values: topicValues, createdAt: '2026-08-20T00:00:00.000Z' });
assert(topicMarkdown.includes('This topic captures the current direction for Residual shape.'));
const topicExecution = executeArtifactCreationCapability(topicModule, 'create-artifact', topic, { values: topicValues, createdAt: '2026-08-20T00:00:00.000Z' });
assert.equal(topicExecution.qualification.requiredShapeCoverage.coverage, 'complete-declared-required-shape');

// Schema-owned local materialization qualifiers must also reject duplicate exact required sections after valid reseal.
const taskParent = Object.freeze({ state: 'qualified', finalized: true, schemaId: 'tiinex.topic.v1', createdAt: '2026-08-20 00:00:00', traceTarget: 'parent.trace.md', originTarget: 'parent.trace.md', boundary: 'fixture' });
const taskLocal = renderCanonicalTaskLocalArtifact({ values: taskValues, parent: taskParent, now: new Date('2026-08-20T00:00:00Z') });
const taskLocalDup = reseal(taskLocal.markdown.replace('\n## Done Criteria\n', '\n## Objective\n\nCONFLICTING\n\n## Done Criteria\n'));
assert.notEqual(qualifyCanonicalTaskLocalArtifact({ markdown: taskLocalDup, schemaMaterials: schemaMaterials('tiinex.task.v1'), values: taskValues, parent: taskParent, path: 'dup-task.trace.md' }).state, 'qualified');
const topicLocal = renderCanonicalTopicLocalArtifact({ values: topicValues, continuityMode: 'root', parent: null, now: new Date('2026-08-20T00:00:00Z') });
const topicLocalDup = reseal(topicLocal.markdown.replace('\n## Design Direction\n', '\n## Current Read\n\nCONFLICTING\n\n## Design Direction\n'));
assert.notEqual(qualifyCanonicalTopicLocalArtifact({ markdown: topicLocalDup, schemaMaterials: schemaMaterials('tiinex.topic.v1'), values: topicValues, parent: null, continuityMode: 'root', path: 'dup-topic.trace.md' }).state, 'qualified');

// Synthetic future schema: residual Required Shape without owner blocks; explicit schema-owned proof can qualify without a core schema-id branch.
const futureBase = futureModule(false);
assert.equal(buildArtifactCreationContract({ schemaId: futureBase.id, module: futureBase }).status, 'blocked');
const futureOwned = futureModule(true);
const futureContract = buildArtifactCreationContract({ schemaId: futureOwned.id, module: futureOwned });
assert.equal(futureContract.status, 'ready');
const futureExecution = executeArtifactCreationCapability(futureOwned, 'create-artifact', futureContract, { values: { Summary: 'Future', Body: 'Body' }, createdAt: '2026-08-20T00:00:00Z' });
assert.equal(futureExecution.state, 'rendered');

console.log('post-v458 creation representation completeness + multiplicity correction: PASS');

function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return sealed.markdown;
}
function taskWithImplementation(execute) {
  return Object.freeze({ ...taskModule, artifactCreation: defineArtifactCreationCapability(taskModule.binding, Object.freeze({ status: 'implemented', renderer: Object.freeze({ id: 'v458.duplicate' }), transitionTypes: Object.freeze(['create-artifact']), execute })) });
}
function schemaMaterials(target) {
  const root = schemaRegistry.modules.find((item) => item.id === 'tiinex.root.v1');
  const module = schemaRegistry.modules.find((item) => item.id === target);
  return [readBundled(root), readBundled(module)];
}
function readBundled(module) {
  return `# Continuity Context\n\n- Current\n  - Current Schema: ${module.id}\n\n---\n\n# placeholder`;
}
function futureModule(withOwner) {
  const schemaId = 'tiinex.future.creation.v1';
  const checksum = 'f'.repeat(64);
  const residualId = `${schemaId}#artifact-creation/Template Body/required-shape/99`;
  const binding = Object.freeze({ schemaId, checksum: Object.freeze({ value: checksum }), sourcePath: 'synthetic/tiinex.future.creation.v1.schema.md', sourceCommit: 'fixture-commit' });
  const validationContract = Object.freeze({ schema: 'tiinex.site.compact-portable-validation-contract.v1', schemaId, lineage: Object.freeze(['tiinex.root.v1', schemaId]), lineageQualification: Object.freeze({ state: 'valid', complete: true, lineage: Object.freeze(['tiinex.root.v1', schemaId]), findings: Object.freeze([]) }), validation: Object.freeze({ groups: Object.freeze([]), requiredSections: Object.freeze(['Continuity Context','Continuity Integrity']), requiredHeadings: Object.freeze([]), requiredEntries: Object.freeze([]), ordinaryGroups: Object.freeze([]) }), declarations: Object.freeze([]), constraints: Object.freeze([]) });
  const projection = Object.freeze({ schema: 'tiinex.site.schema-runtime-projection.v1', generator: 'fixture', schemaId, sourceChecksum: checksum, sourceBytes: 1, bindingChecksum: checksum, validationContract, creation: Object.freeze({ declared: true, groupNames: Object.freeze(['Template Body']), requiredInputs: Object.freeze(['Summary','Body']), optionalInputs: Object.freeze([]), requiredSections: Object.freeze(['Body']), toolingConfigurationFields: Object.freeze([]), inputBindings: Object.freeze([{ input:'Summary',kind:'root-current-summary-body-title',section:'' },{ input:'Body',kind:'section-body',section:'Body' }]), requiredShape: Object.freeze([{ id:`${schemaId}#artifact-creation/Template Body/required-shape/1`, sourceSchemaId:schemaId,group:'Template Body',category:'Required Shape',line:1,sourceText:'first heading uses `# {{summary}}`',primitive:{kind:'body-title-summary',input:'Summary',section:''} },{ id:`${schemaId}#artifact-creation/Template Body/required-shape/2`, sourceSchemaId:schemaId,group:'Template Body',category:'Required Shape',line:2,sourceText:'`## Body` section',primitive:{kind:'section-body',input:'Body',section:'Body'} },{ id:residualId, sourceSchemaId:schemaId,group:'Template Body',category:'Required Shape',line:99,sourceText:'future opaque residual shape',primitive:{kind:'residual',input:'',section:''} }]) }) });
  const source = defineBundledSchemaSource(binding, projection, { bundledPath: binding.sourcePath, assetUrl: 'fixture://future' });
  const execute = (contract, input) => {
    const base = genericArtifactCreationImplementation.execute(contract, input);
    if (!withOwner) return base;
    const lines = base.split('\n'); const boundary = lines.indexOf('---'); let title=-1; for(let i=boundary+1;i<lines.length;i+=1) if(/^#\s+/.test(lines[i]) && lines[i] !== '# Continuity Integrity'){title=i;break;} lines.splice(title+1,0,'','FUTURE-RESIDUAL'); return reseal(lines.join('\n'));
  };
  const implementation = Object.freeze({ ...genericArtifactCreationImplementation, transitionTypes:Object.freeze(['create-artifact']), execute, ...(withOwner ? { qualifyRequiredShape({ markdown, residualItems }) { const ok = markdown.includes('\nFUTURE-RESIDUAL\n'); return Object.freeze({ state: ok ? 'qualified':'unavailable', coveredItemIds:Object.freeze(ok ? residualItems.map((item)=>item.id):[]), findings:Object.freeze(ok?[]:['future residual missing']) }); } } : {}) });
  return Object.freeze({ id:schemaId,label:'Future',kind:'concrete',role:'core-artifact',parentSchemaId:'tiinex.root.v1',binding,schemaSource:source,artifactCreation:defineArtifactCreationCapability(binding,implementation),validate(){return [];},present(){return {};},capabilities:Object.freeze({}) });
}
