import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveSchemaCapabilities } from './capability.registry.js';
import { buildArtifactCreationContract, renderArtifactCreationCandidateMarkdown, validateArtifactCreationResult } from './creation.contracts.js';
import { GENERIC_ARTIFACT_CREATION_RENDERER_ID } from './creation.renderer.js';
import { schemaRegistry } from './registry.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';

const decision = resolveSchemaCapabilities({ schemaId: 'tiinex.decision.v1' }).descriptor;
const evidence = resolveSchemaCapabilities({ schemaId: 'tiinex.evidence.v1' }).descriptor;
const handoff = resolveSchemaCapabilities({ schemaId: 'tiinex.handoff.v1' }).descriptor;
const validationFinding = resolveSchemaCapabilities({ schemaId: 'tiinex.validation.finding.v1' }).descriptor;
const validationMethod = resolveSchemaCapabilities({ schemaId: 'tiinex.validation.method.v1' }).descriptor;
const validationReport = resolveSchemaCapabilities({ schemaId: 'tiinex.validation.report.v1' }).descriptor;
const root = resolveSchemaCapabilities({ schemaId: 'tiinex.root.v1' }).descriptor;

assert.equal(root.actions.create.status, 'unavailable', 'Root must remain abstract/non-creatable');

assert.equal(decision.actions.create.status, 'unavailable');
assert.equal(decision.factory.generation.ready, true);
assert.equal(decision.factory.invocation.create.state, 'unavailable');
assert.deepEqual(decision.factory.creation.inputBindings.map((item) => item.kind), [
  'root-current-summary-body-title', 'section-body', 'section-body', 'section-body'
]);
assert.equal(decision.factory.creation.residualRequiredShape.length, 0);
const decisionBodyProse = decision.factory.creation.requiredShape.find((item) => item.primitive?.kind === 'body-prose-block');
assert.ok(decisionBodyProse, 'Decision must compile its unheaded body prose through the generic Required Shape primitive');
assert.equal(decisionBodyProse.primitive.position, 'after-first-body-heading-before-first-second-level-section');

assert.equal(evidence.actions.create.status, 'unavailable');
assert.equal(evidence.factory.generation.ready, true);
assert.equal(evidence.factory.invocation.create.state, 'unavailable');
assert.deepEqual(evidence.factory.inheritance.lineage, ['tiinex.root.v1', 'tiinex.preservation.v1', 'tiinex.evidence.v1']);
assert.equal(evidence.factory.inheritance.resolution.state, 'qualified');
assert.equal(evidence.factory.inheritance.resolution.applications.length, 1);
assert.equal(evidence.factory.inheritance.resolution.declarations.length, 1);
assert.equal(evidence.factory.inheritance.resolution.declarations[0].sourceGroup, 'Parent Preservation Specialization');
assert.equal(Object.hasOwn(schemaRegistry.byId.get('tiinex.evidence.v1')?.binding || {}, 'inheritanceCompanions'), false, 'Evidence must not depend on loose inheritanceCompanions binding authority');
const evidenceOverride = evidence.factory.inheritance.resolution.applications[0];
assert.equal(evidenceOverride.operation, 'override');
assert.equal(evidenceOverride.parentNode, 'Schema Validation Contract / Preservation Body / Required Shape');
assert.equal(evidenceOverride.childNode, 'Schema Validation Contract / Evidence Body / Required Shape');
assert.deepEqual(new Set(evidenceOverride.deactivatedContributions.map((item) => item.group)), new Set([
  'Preservation Body', 'Preserved Material', 'Preservation Act', 'Fidelity And Loss', 'Custody Or Storage Boundary'
]));
assert.ok(evidence.factory.sections.some((section) => section.group === 'Provenance'
  && section.contributors.some((item) => item.sourceSchemaId === 'tiinex.preservation.v1')
  && section.contributors.some((item) => item.sourceSchemaId === 'tiinex.evidence.v1')), 'Evidence inherited provenance contributors must remain visible');
for (const removed of ['Preserved Material', 'Preservation Act', 'Fidelity And Loss', 'Custody Or Storage Boundary']) {
  assert.equal(evidence.factory.sections.some((section) => section.group === removed), false, `${removed} must be inactive after the declared structural override`);
}
assert.equal(evidence.factory.creation.inputBindings.length, 12);
assert.ok(evidence.factory.creation.inputBindings.every((item) => item.kind === 'ordinary-field'), 'Evidence creation fields must compile through generic field bindings');
assert.deepEqual(evidence.factory.creation.supplementalRequiredFields, [{
  section: 'Interpretation Limits',
  group: 'Interpretation Limits',
  field: 'Not Yet Used As',
  sourceSchemaIds: ['tiinex.preservation.v1'],
  representation: 'neutral-placeholder',
  value: 'unknown / not supplied at creation'
}]);

assert.equal(handoff.actions.create.status, 'unavailable');
assert.equal(handoff.factory.generation.ready, true);
assert.equal(handoff.factory.invocation.create.state, 'unavailable');
assert.deepEqual(handoff.factory.creation.inputBindings.map((item) => item.kind), [
  'ordinary-field', 'ordinary-field', 'ordinary-field', 'ordinary-field', 'ordinary-field',
  'named-declaration-section', 'named-declaration-section', 'named-declaration-section', 'named-declaration-section', 'named-declaration-section',
  'ordinary-group', 'ordinary-group'
]);
assert.ok(handoff.factory.declarations.some((item) => item.group === 'Transfers' && item.requiredFields.includes('Transfer Kind')));
assert.equal(handoff.factory.transitionParticipation.authority, 'canonical-transition-definition');
assert.equal(handoff.factory.transitionParticipation.applicability, 'not-inferred-from-schema-module');

assert.equal(validationFinding.actions.create.status, 'unavailable');
assert.equal(validationFinding.factory.generation.ready, true);
assert.equal(validationFinding.factory.invocation.create.state, 'unavailable');
assert.equal(validationFinding.factory.creation.inputBindings.length, 11);
assert.ok(validationFinding.factory.creation.inputBindings.every((item) => item.kind === 'ordinary-field'));
const methodBinding = validationFinding.factory.creation.inputBindings.find((item) => item.input === 'Method');
assert.deepEqual({ section: methodBinding.section, group: methodBinding.group }, { section: 'Validation Method', group: 'Validation Method' });

assert.equal(validationMethod.actions.read.status, 'implemented');
assert.equal(validationMethod.actions.validate.status, 'implemented');
assert.equal(validationMethod.actions.create.status, 'unavailable');
assert.equal(validationMethod.factory.creation.authorityState, 'unavailable');
assert.equal(validationMethod.factory.generation.ready, false);
assert.equal(validationMethod.factory.invocation.create.state, 'unavailable');

assert.equal(validationReport.actions.read.status, 'implemented');
assert.equal(validationReport.actions.validate.status, 'implemented');
assert.equal(validationReport.actions.create.status, 'unavailable');
assert.equal(validationReport.factory.creation.authorityState, 'qualified');
assert.equal(validationReport.factory.generation.ready, true);
assert.equal(validationReport.factory.invocation.create.state, 'unavailable');
assert.equal(validationReport.factory.creation.inputBindings.length, 11);
assert.ok(validationReport.factory.creation.inputBindings.every((item) => item.kind === 'ordinary-field'));
const reportSummaryBinding = validationReport.factory.creation.inputBindings.find((item) => item.input === 'Summary');
assert.deepEqual({ section: reportSummaryBinding.section, group: reportSummaryBinding.group, field: reportSummaryBinding.field }, { section: 'Findings Summary', group: 'Findings Summary', field: 'Summary' });
assert.equal(validationReport.factory.creation.inputBindings.some((item) => item.input === 'Summary' && item.kind === 'root-current-summary-body-title'), false);

for (const schemaId of ['tiinex.decision.v1', 'tiinex.evidence.v1', 'tiinex.handoff.v1', 'tiinex.validation.finding.v1', 'tiinex.validation.method.v1', 'tiinex.validation.report.v1']) {
  const module = schemaRegistry.byId.get(schemaId);
  assert.equal(module?.artifactCreation?.implementation?.renderer?.id, GENERIC_ARTIFACT_CREATION_RENDERER_ID, `${schemaId} must use the shared generic renderer`);
}

function renderAndValidate(schemaId, values, createdAt = '2026-09-04T08:00:00.000Z') {
  const contract = buildArtifactCreationContract({ schemaId });
  assert.equal(contract.status, 'ready', `${schemaId} must build a ready creation contract`);
  const markdown = renderArtifactCreationCandidateMarkdown(contract, { values, createdAt });
  assert.ok(markdown, `${schemaId} must render through the generic creation path`);
  const validation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-create', path: `${schemaId}.factory-proof.trace.md`, markdown }, {}, { contract, childPath: `${schemaId}.factory-proof.trace.md` });
  assert.equal(validation.counts.errors, 0, JSON.stringify(validation.findings, null, 2));
  return { contract, markdown, validation };
}

const decisionProof = renderAndValidate('tiinex.decision.v1', {
  Summary: 'Factory decision proof',
  Decision: 'Use the shared generic factory.',
  Basis: 'The compiled contract is qualified.',
  Consequences: 'No schema-specific renderer is introduced.'
});
const firstTitleEnd = decisionProof.markdown.indexOf('\n', decisionProof.markdown.indexOf('\n# Factory decision proof') + 1);
const firstDecisionSection = decisionProof.markdown.indexOf('\n## Decision');
const decisionInterveningBody = decisionProof.markdown.slice(firstTitleEnd, firstDecisionSection).trim();
assert.equal(decisionInterveningBody, 'Provide the required unheaded body prose here.');
assert.equal(/^#{1,6}\s/m.test(decisionInterveningBody), false, 'Decision body-prose primitive must remain unheaded');

const evidenceProof = renderAndValidate('tiinex.evidence.v1', {
  'Supported Claim Or Question': 'whether the generic factory can create Evidence',
  'Evidence Role': 'supports the factory conformance claim',
  'Known Source': 'local qualified implementation test',
  'Preservation Basis': 'rendered from qualified creation contract',
  'Provenance Limits': 'local conformance only',
  Material: 'qualified renderer output',
  'Material Kind': 'excerpt',
  'Preservation State': 'preserved in local test output',
  'Fidelity Notes': 'exact field values retained',
  'Known Losses': 'none relevant to structural qualification',
  'Does Not Prove': 'product acceptance',
  'Must Not Be Treated As': 'remote publication proof'
});
assert.equal(evidenceProof.validation.status, 'valid', 'Standalone factory-created Evidence must validate cleanly without an inferred Preservation Parent requirement');
assert.equal(evidenceProof.validation.findings.some((finding) => finding.code === 'evidence.preservation.parent.unresolved'), false, 'Evidence schema inheritance must not manufacture an artifact Parent warning');
assert.ok(evidenceProof.markdown.includes('- Not Yet Used As: unknown / not supplied at creation'));
assert.equal(evidenceProof.markdown.includes('## Preserved Material'), false);
assert.equal(evidenceProof.markdown.includes('## Preservation Act'), false);
assert.equal(evidenceProof.markdown.includes('## Fidelity And Loss'), false);
assert.equal(evidenceProof.markdown.includes('## Custody Or Storage Boundary'), false);

const handoffValues = {
  Purpose: 'Factory conformance handoff.',
  From: 'Anchor',
  'From Kind': 'role',
  To: 'Loom',
  'To Kind': 'role',
  Transfers: [{ name: 'factory-proof', fields: { 'Transfer Kind': 'work', Description: 'Exercise the generic structured creation path.' } }],
  'Required Context': 'none',
  'Reference Context': 'none',
  'Retained Responsibilities': 'none',
  'Exclusions And Dependencies': 'none',
  'Completion Expectation': { 'Signal Kind': 'result', 'Signal Meaning': 'Return qualified factory evidence.' },
  'Interpretation Limits': { 'Does Not Mean': 'This does not authorize broad schema fan-out.', 'Must Not Be Used To Claim': 'This does not prove semantic acceptance.' }
};
const handoffProof = renderAndValidate('tiinex.handoff.v1', handoffValues);
assert.ok(handoffProof.markdown.includes('## Transfers\n\n- factory-proof\n  - Transfer Kind: work'));
assert.ok(handoffProof.markdown.includes('## Completion Expectation\n\n- Signal Kind: result'));
const invalidStructured = renderArtifactCreationCandidateMarkdown(handoffProof.contract, { values: { ...handoffValues, Transfers: 'opaque free text' }, createdAt: '2026-09-04T08:00:00.000Z' });
assert.equal(invalidStructured, '', 'Structured declaration inputs must fail closed rather than flatten to free text');

const validationFindingProof = renderAndValidate('tiinex.validation.finding.v1', {
  Target: 'generic schema factory',
  'Target Kind': 'local implementation',
  Method: 'contract-driven conformance',
  'Method Scope': 'factory creation and validation',
  Status: 'pass',
  Observation: 'shared renderer produced a valid artifact',
  'What Was Checked': 'compiled creation and validation path',
  'What Was Not Checked': 'remote publication or product acceptance',
  'Recommended Response': 'retain the shared generic path',
  'Does Not Prove': 'broad schema fan-out is safe',
  'Must Not Be Treated As': 'semantic acceptance'
});
assert.equal(validationFindingProof.validation.status, 'valid');

const validationMethodContract = buildArtifactCreationContract({ schemaId: 'tiinex.validation.method.v1' });
assert.equal(validationMethodContract.status, 'blocked');
assert.equal(validationMethodContract.capabilities.create, 'unavailable');

const validationReportProof = renderAndValidate('tiinex.validation.report.v1', {
  Scope: 'bounded shared-factory scale proof',
  Targets: 'Validation Method and Validation Report descriptors',
  'Methods Used': 'compiled contract conformance and shared renderer validation',
  'Method Boundaries': 'local source-qualified factory path only',
  Summary: 'Validation Report generation is qualified independently from transition invocation.',
  'Overall State': 'qualified generation; invocable transition unavailable',
  Findings: 'eleven ordinary-field bindings are exact and schema-owned',
  'Run Context': 'Loom bounded implementation tranche',
  'What Was Not Checked': 'remote publication or future Transition Definition applicability',
  'Does Not Prove': 'an invocable Create transition exists',
  'Must Not Hide': 'generation authority and invocation authority are distinct'
});
assert.equal(validationReportProof.validation.status, 'valid');
assert.ok(validationReportProof.markdown.includes('## Findings Summary\n\n- Summary: Validation Report generation is qualified independently from transition invocation.'));
assert.equal(validationReportProof.contract.capabilities.create, 'implemented');

const rootMarkdown = fs.readFileSync(new URL('./tiinex.root.v1.schema.md', import.meta.url), 'utf8');
const preservationMarkdown = fs.readFileSync(new URL('./core/preservation/tiinex.preservation.v1.schema.md', import.meta.url), 'utf8');
const evidenceMarkdown = fs.readFileSync(new URL('./core/evidence/tiinex.evidence.v1.schema.md', import.meta.url), 'utf8');
const standaloneInheritanceRecord = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/evidence-preservation-body.inheritance-record-fixture.md', import.meta.url), 'utf8');

function compileEvidenceVariant(evidenceSource = evidenceMarkdown, preservationSource = preservationMarkdown, options = {}) {
  return compilePortableSchemaContractChain([rootMarkdown, preservationSource, evidenceSource], options);
}
function expectInlineOverrideBlocked(label, evidenceSource, preservationSource = preservationMarkdown) {
  const compiled = compileEvidenceVariant(evidenceSource, preservationSource);
  assert.equal(compiled.inheritanceResolution.state, 'unresolved', `${label} must fail closed`);
  assert.equal(compiled.inheritanceResolution.applications.length, 0, `${label} must not partially apply an override`);
  assert.ok(compiled.validation.requiredSections.includes('Preserved Material'), `${label} must retain additive parent structure when override authority is unresolved`);
}

const additivePreservation = compilePortableSchemaContractChain([rootMarkdown, preservationMarkdown]);
assert.equal(additivePreservation.inheritanceResolution.state, 'not-declared', 'Schemas without inline Inheritance Overrides remain purely additive');

expectInlineOverrideBlocked('unsupported operation', evidenceMarkdown.replace('Merge Operation: override', 'Merge Operation: refine'));
expectInlineOverrideBlocked('non-ancestor parent', evidenceMarkdown.replace('Parent Schema: tiinex.preservation.v1', 'Parent Schema: tiinex.task.v1'));
expectInlineOverrideBlocked('missing parent node', evidenceMarkdown.replace('Schema Validation Contract / Preservation Body / Required Shape', 'Schema Validation Contract / Missing Body / Required Shape'));
const declarationBlock = `- evidence-preservation-body-structure\n  - Merge Operation: override\n  - Parent Schema: tiinex.preservation.v1\n  - Parent Node: Schema Validation Contract / Preservation Body / Required Shape\n  - Child Node: Schema Validation Contract / Evidence Body / Required Shape\n  - Reason: Evidence specializes Preservation by replacing only the generic Preservation artifact-body structure while retaining compatible non-structural Preservation semantics and provenance.\n  - Effective Result: Evidence body structure is authoritative for Evidence artifacts; parent-only structural body groups become inactive, while compatible parent contributions targeting surviving Evidence sections remain active.`;
expectInlineOverrideBlocked('duplicate inline declaration', evidenceMarkdown.replace(declarationBlock, `${declarationBlock}\n\n${declarationBlock}`));
const preservationBodyStart = preservationMarkdown.indexOf('### Preservation Body');
const preservationBodyEnd = preservationMarkdown.indexOf('\n### ', preservationBodyStart + 4);
const preservationBodyGroup = preservationMarkdown.slice(preservationBodyStart, preservationBodyEnd);
const ambiguousPreservation = preservationMarkdown.slice(0, preservationBodyEnd) + `\n\n${preservationBodyGroup}` + preservationMarkdown.slice(preservationBodyEnd);
expectInlineOverrideBlocked('ambiguous parent node', evidenceMarkdown, ambiguousPreservation);
const duplicateParentGroupWithoutTargetCategory = preservationMarkdown.replace('### Preservation Body', '### Preservation Body\n\n#### Optional Fields\n\n- Noise\n\n### Preservation Body');
expectInlineOverrideBlocked('ambiguous parent group even when target category appears once', evidenceMarkdown, duplicateParentGroupWithoutTargetCategory);

const corroboratedEvidence = compileEvidenceVariant(evidenceMarkdown, preservationMarkdown, { inheritanceArtifacts: [standaloneInheritanceRecord] });
assert.equal(corroboratedEvidence.inheritanceResolution.state, 'qualified');
assert.equal(corroboratedEvidence.inheritanceResolution.applications.length, 1, 'Standalone record may corroborate but must not create an extra application');
assert.equal(corroboratedEvidence.inheritanceResolution.corroborations.length, 1);
const disagreeingRecord = standaloneInheritanceRecord.replace('Child Contract Nodes: Schema Validation Contract / Evidence Body / Required Shape', 'Child Contract Nodes: Schema Validation Contract / Evidence Material / Required Fields');
const blockedByMismatch = compileEvidenceVariant(evidenceMarkdown, preservationMarkdown, { inheritanceArtifacts: [disagreeingRecord] });
assert.equal(blockedByMismatch.inheritanceResolution.state, 'unresolved', 'A disagreeing standalone record must fail visible rather than override inline schema authority');
assert.equal(blockedByMismatch.inheritanceResolution.applications.length, 0);

console.log(JSON.stringify({
  schema: 'tiinex.site.schema-factory-conformance.v2',
  decision: { create: decision.actions.create.status, requiredShapePrimitive: decisionBodyProse.primitive.kind, validation: decisionProof.validation.status },
  evidence: { create: evidence.actions.create.status, inheritance: evidence.factory.inheritance.resolution.state, supplementalRequiredFields: evidence.factory.creation.supplementalRequiredFields.length, validation: evidenceProof.validation.status },
  handoff: { create: handoff.actions.create.status, renderer: GENERIC_ARTIFACT_CREATION_RENDERER_ID, validation: handoffProof.validation.status },
  validationFinding: { create: validationFinding.actions.create.status, generation: validationFinding.factory.generation.ready, methodBinding: methodBinding.section, validation: validationFindingProof.validation.status },
  validationMethod: { read: validationMethod.actions.read.status, validate: validationMethod.actions.validate.status, generation: validationMethod.factory.generation.ready, invocableCreate: validationMethod.factory.invocation.create.state },
  validationReport: { read: validationReport.actions.read.status, validate: validationReport.actions.validate.status, generation: validationReport.factory.generation.ready, invocableCreate: validationReport.factory.invocation.create.state, summaryBinding: reportSummaryBinding.section, validation: validationReportProof.validation.status },
  builderDescriptor: handoff.factory.schema
}, null, 2));
