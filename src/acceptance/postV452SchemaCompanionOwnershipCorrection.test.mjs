import assert from 'node:assert/strict';
import fs from 'node:fs';
import { localArtifactMaterializerForSchema } from '../transitions/transition.localArtifactMaterializers.js';
import { defineArtifactCreationCapability } from '../schemas/creation.capability.js';
import { qualifiedCreationAuthorityFromSchemaSource, qualifyBundledSchemaSource } from '../schemas/schema.source.js';
import { schemaRegistry } from '../schemas/registry.js';
import { buildArtifactCreationContract } from '../schemas/creation.contracts.js';
import { schemaIdForRecord } from '../schemas/schema.identity.js';
import { actionAvailabilityForRecord, presentRecordActions, RecordActionKind } from '../actions/record.actions.js';
import { parsePortableSchemaDocument } from '../tooling/portable/schema/schema.contract.js';
import { topicSchemaModule } from '../schemas/core/topic/tiinex.topic.v1.schema.js';
import { taskSchemaModule } from '../schemas/core/task/tiinex.task.v1.schema.js';
import { evidenceSchemaModule } from '../schemas/core/evidence/tiinex.evidence.v1.schema.js';
import { interpretationSchemaModule } from '../schemas/core/interpretation/tiinex.interpretation.v1.schema.js';
import { preservationSchemaModule } from '../schemas/core/preservation/tiinex.preservation.v1.schema.js';
import { relationSchemaModule } from '../schemas/core/relation/tiinex.relation.v1.schema.js';
import { renderCanonicalTopicLocalArtifact, qualifyCanonicalTopicLocalArtifact } from '../schemas/core/topic/tiinex.topic.v1.localMaterialization.js';

const materializerFacadeSource = fs.readFileSync('src/transitions/transition.localArtifactMaterializers.js','utf8');
const creationSource = fs.readFileSync('src/schemas/creation.contracts.js','utf8');
const capabilitySource = fs.readFileSync('src/schemas/capability.registry.js','utf8');
const productPreparationSource = fs.readFileSync('src/transitions/transition.productPreparation.js','utf8');
const relationMaterializerSource = fs.readFileSync('src/schemas/core/relation/tiinex.relation.v1.localMaterialization.js','utf8');
const localDraftMutationSource = fs.readFileSync('src/app/localDraftMutationCommand.js','utf8');

// H1/H2 — generic materialization consumes an opaque module capability and unknown schemas fail closed.
const syntheticAdapter = Object.freeze({
  schemaId: 'tiinex.synthetic.builder-ready.v1',
  render(input = {}) { return Object.freeze({ state: 'rendered', markdown: `# ${String(input.values?.Title || 'Synthetic')}` }); },
  qualify(input = {}) { return Object.freeze({ state: String(input.markdown || '').startsWith('# ') ? 'qualified' : 'invalid' }); }
});
const syntheticModule = Object.freeze({ id: syntheticAdapter.schemaId, localMaterialization: syntheticAdapter });
const syntheticRegistry = Object.freeze({ modules: Object.freeze([syntheticModule]), byId: new Map([[syntheticModule.id, syntheticModule]]), byChecksum: new Map(), fallback: null });
const resolvedSynthetic = localArtifactMaterializerForSchema(syntheticModule.id, { registry: syntheticRegistry });
assert.equal(resolvedSynthetic, syntheticAdapter, 'synthetic installed schema capability must resolve without generic schema-id dispatch');
assert.equal(resolvedSynthetic.render({ values: { Title: 'Future schema' } }).state, 'rendered');
assert.equal(localArtifactMaterializerForSchema('tiinex.unknown.no-capability.v1', { registry: syntheticRegistry }), null, 'unknown schema without capability must fail closed');
assert.equal(/topicMaterializer|taskMaterializer|relationMaterializer|interpretationMaterializer/.test(materializerFacadeSource), false, 'generic materializer facade must not import concrete schema materializers');
assert.equal(/tiinex\.(topic|task|relation|interpretation)\.v1/.test(materializerFacadeSource), false, 'generic materializer facade must not switch on core schema ids');

// H3/K — implementation presence is orthogonal to exact ordinary creation authority.
assert(relationSchemaModule.localMaterialization, 'Relation companion must expose qualified local representation implementation for Reference');
const relationCreate = buildArtifactCreationContract({ schemaId: relationSchemaModule.id, module: relationSchemaModule });
assert.equal(relationCreate.status, 'blocked', 'Relation representation implementation must not create ordinary standalone Create authority');
assert(relationCreate.findings.some((finding) => finding.code === 'creation.authority.missing'));
const liarBinding = Object.freeze({ schemaId: 'tiinex.synthetic.boolean-only.v1', sourcePath: 'synthetic.md', sourceRepository: 'test', sourceCommit: 'abc', checksum: Object.freeze({ value: 'deadbeef' }) });
const booleanOnlyModule = Object.freeze({ id: liarBinding.schemaId, label: 'Boolean only', kind: 'concrete', role: 'core-artifact', binding: liarBinding, capabilities: Object.freeze({ canCreateArtifact: true, supportedSurfaces: Object.freeze(['feed']) }), validate() { return []; }, present() { return {}; } });
assert.equal(buildArtifactCreationContract({ schemaId: booleanOnlyModule.id, module: booleanOnlyModule }).status, 'blocked', 'canCreateArtifact=true without exact semantic creation authority must fail closed');
const syntheticCreationModule = Object.freeze({
  ...booleanOnlyModule,
  id: 'tiinex.synthetic.creation-ready.v1',
  binding: Object.freeze({ ...liarBinding, schemaId: 'tiinex.synthetic.creation-ready.v1' }),
  artifactCreation: null
});
const syntheticReady = Object.freeze({ ...syntheticCreationModule, artifactCreation: defineArtifactCreationCapability(syntheticCreationModule.binding, Object.freeze({ status: 'implemented', renderer: Object.freeze({ id: 'synthetic.creation.renderer', scope: 'synthetic' }), execute() { return Object.freeze({ state: 'rendered' }); }, transitionTypes: Object.freeze(['create-artifact']) })) });
assert.equal(buildArtifactCreationContract({ schemaId: syntheticReady.id, module: syntheticReady }).status, 'blocked', 'v453 hardening: implementation metadata/callable without exact schema-source creation authority must fail closed');
assert.equal(creationSource.includes('schemaCreationRendererFor'), false, 'ordinary creation owner must not keep concrete renderer switchboard');
assert.equal(/schemaId\s*===\s*['"]tiinex\.(topic|task|evidence|relation|interpretation|preservation)\.v1/.test(creationSource), false, 'ordinary creation owner must not dispatch behavior by core schema id');

// K semantic grounding pressure — every installed bundled source qualifies against its exact binding; creation authority is derived from compiled source, not a hand-maintained schema list.
for (const module of schemaRegistry.modules) {
  const sourceQualification = qualifyBundledSchemaSource(module.schemaSource);
  assert.equal(sourceQualification.state, 'qualified', `${module.id} bundled schema source must qualify against exact binding bytes`);
  assert.equal(sourceQualification.schemaId, module.id);
  assert.equal(sourceQualification.checksum, module.binding.checksum.value);
  const authority = qualifiedCreationAuthorityFromSchemaSource(module);
  const hasCreationGroups = (sourceQualification.compiledContract?.creation?.groups || []).length > 0;
  assert.equal(authority.state === 'qualified', hasCreationGroups, `${module.id} creation authority must be derived from exact compiled source groups`);
}
assert.equal(qualifiedCreationAuthorityFromSchemaSource(relationSchemaModule).state, 'unavailable', 'Relation exact source intentionally lacks ordinary Artifact Creation Contract');

// H4/H5 — Topic representation is not globally root-only: operation supplies continuity mode.
const topicMaterials = [
  fs.readFileSync('src/schemas/tiinex.root.v1.schema.md','utf8'),
  fs.readFileSync('src/schemas/core/topic/tiinex.topic.v1.schema.md','utf8')
];
const topicValues = Object.freeze({ Summary: 'Companion ownership', 'Current Read': 'The representation is owned by the Topic companion while continuity is supplied by the operation.', 'Design Direction': 'Keep schema representation and operation continuity orthogonal.', 'Next Artifacts': 'Exercise both root and parented Topic materialization without a global root invariant.' });
const rootTopic = renderCanonicalTopicLocalArtifact({ values: topicValues, continuityMode: 'root', parent: null, now: new Date('2026-08-20T12:00:00Z') });
assert.equal(rootTopic.state, 'rendered');
assert.equal(qualifyCanonicalTopicLocalArtifact({ markdown: rootTopic.markdown, schemaMaterials: topicMaterials, values: topicValues, continuityMode: 'root', parent: null, path: 'root-topic.trace.md' }).state, 'qualified');
const topicParent = Object.freeze({ state: 'qualified', finalized: true, schemaId: 'tiinex.topic.v1', createdAt: '2026-08-20 11:00:00', traceTarget: 'parent-topic.trace.md', originTarget: 'parent-topic.trace.md', boundary: 'explicit-parent-reference' });
const parentedTopic = renderCanonicalTopicLocalArtifact({ values: topicValues, continuityMode: 'parent', parent: topicParent, now: new Date('2026-08-20T12:00:00Z') });
assert.equal(parentedTopic.state, 'rendered');
assert(parentedTopic.markdown.includes('- Parent\n'));
assert.equal(qualifyCanonicalTopicLocalArtifact({ markdown: parentedTopic.markdown, schemaMaterials: topicMaterials, values: topicValues, continuityMode: 'parent', parent: topicParent, path: 'parented-topic.trace.md' }).state, 'qualified');

// H6 — Relation companion represents supplied values; it does not own the concrete Reference predicate/participants.
assert.equal(relationMaterializerSource.includes('topic-references-task'), false);
assert.equal(relationMaterializerSource.includes('Topic References Task'), false);
assert(relationMaterializerSource.includes("values['Subject Binding']"));
assert(relationMaterializerSource.includes("values['Object Binding']"));
assert(relationMaterializerSource.includes("values['Predicate Identifier']"));
const referenceCommandSource = fs.readFileSync('src/app/canonicalReferenceLocalCreateCommand.js','utf8');
assert(referenceCommandSource.includes('relationEffects'), 'Reference command must still consume Transition relation effects');
assert(referenceCommandSource.includes('generation'), 'Reference command must still consume explicit generation qualification');

// H7 — Interpretation owns representation field mapping; operation supplies the bound concrete target.
const interpretationAdapter = interpretationSchemaModule.localMaterialization;
assert.deepEqual(interpretationAdapter.authoringInputsFromInvocationBindings({ parentTarget: 'exact://parent/A' }), { 'Source Target': 'exact://parent/A' });
assert.equal(productPreparationSource.includes("'Source Target'"), false, 'generic operation preparation must not own schema field label');
assert(productPreparationSource.includes('parentTarget: canonicalSourceTargetForParent(parent)'), 'operation preparation must still bind the concrete participant target');

// H8 — legacy Task branch remains explicit compatibility, not a generic extension mechanism.
assert(localDraftMutationSource.includes("schemaId === 'tiinex.task.v1'"));
assert(localDraftMutationSource.includes("sourceMode || '') === 'local-transition'"));
assert(localDraftMutationSource.includes('validateLegacyTaskDraftCompatibility'));
assert.equal(localDraftMutationSource.includes('schemaCreationRendererFor'), false);

// J — representation kind is not schema identity.
const kindOnly = Object.freeze({ id: 'kind-only', kind: 'markdown', title: 'Markdown', markdown: '# Plain markdown\n\nNo Continuity Context schema authority.' });
assert.equal(schemaIdForRecord(kindOnly), '', 'kind=markdown must remain schema-unknown without qualified schema authority');
const kindOnlyAvailability = actionAvailabilityForRecord(kindOnly);
assert.equal(kindOnlyAvailability.schemaId, '');
assert.equal(kindOnlyAvailability.fallbackUsed, true);
assert.equal(kindOnlyAvailability.continue.enabled, false);
assert.equal(kindOnlyAvailability.reference.enabled, false);
assert(!presentRecordActions(kindOnly).some((action) => action.id === RecordActionKind.continue || action.id === RecordActionKind.reference));

// L — companion transition-shaped metadata cannot shadow canonical Transition Definition authority.
assert.equal(capabilitySource.includes('transitionSupports'), false);
assert(capabilitySource.includes("actions.continue = capability('continue', false"), 'generic capability owner must explicitly deny companion-derived canonical Continue applicability');
assert(capabilitySource.includes("actions.reference = capability('reference', false"), 'generic capability owner must explicitly deny companion-derived canonical Reference applicability');
const topicAvailability = actionAvailabilityForRecord({ schemaId: 'tiinex.topic.v1', markdown: '# Topic\n\nContent' });
assert.equal(topicAvailability.continue.enabled, false, 'installing Topic companion transition metadata must not itself make canonical Continue applicable');
assert.equal(topicAvailability.reference.enabled, false);

console.log('post-v452 schema companion ownership correction: PASS');

function schemaSnapshotPath(module) {
  const snapshot = String(module?.binding?.snapshot || '').replace(/^\.\//, '');
  if (module.id === 'tiinex.root.v1') return `src/schemas/${snapshot}`;
  const family = module.id.replace(/^tiinex\./,'').replace(/\.v\d+$/,'');
  return `src/schemas/core/${family}/${snapshot}`;
}
