import assert from 'node:assert/strict';
import fs from 'node:fs';
import { schemaFactoryViewerProofActions, schemaFactoryViewerProofCapabilities, SCHEMA_FACTORY_VIEWER_PROOF_SCHEMA_IDS } from './schemaFactoryViewerProof.js';
import { buildArtifactCreationContract, renderArtifactCreationCandidateMarkdown, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { GENERIC_ARTIFACT_CREATION_RENDERER_ID } from '../schemas/creation.renderer.js';
import { resolveSchemaCapabilities } from '../schemas/capability.registry.js';

const projections = schemaFactoryViewerProofCapabilities();
assert.equal(projections.length, 6);
assert.deepEqual(projections.map((item) => item.authoring.schemaId), SCHEMA_FACTORY_VIEWER_PROOF_SCHEMA_IDS);
assert.equal(schemaFactoryViewerProofActions().length, 0, 'No factory projection may become an invocable Create action without separately qualified Transition Definition applicability.');

for (const projection of projections) {
  const descriptor = resolveSchemaCapabilities({ schemaId: projection.authoring.schemaId }).descriptor;
  assert.equal(descriptor.actions.read.status, 'implemented', `${projection.authoring.schemaId} must remain readable`);
  assert.equal(descriptor.actions.validate.status, 'implemented', `${projection.authoring.schemaId} must remain validatable`);
  assert.equal(projection.transitionAuthority.authority, 'canonical-transition-definition');
  assert.equal(projection.capability.invocableCreate, 'unavailable');
  assert.equal(projection.productCapable, false);
}

const byId = Object.fromEntries(projections.map((item) => [item.authoring.schemaId, item]));
for (const schemaId of ['tiinex.decision.v1', 'tiinex.evidence.v1', 'tiinex.handoff.v1', 'tiinex.validation.finding.v1', 'tiinex.validation.report.v1']) {
  const projection = byId[schemaId];
  assert.equal(projection.capability.generationReady, true, `${schemaId} must retain qualified shared generation`);
  assert.equal(projection.capability.state, 'generation-qualified-transition-unavailable');
  assert.equal(resolveSchemaCapabilities({ schemaId }).descriptor.factory.generation.ready, true);
  assert.equal(resolveSchemaCapabilities({ schemaId }).descriptor.factory.capabilities.generation.implementation.renderer.id, GENERIC_ARTIFACT_CREATION_RENDERER_ID);
}

const method = byId['tiinex.validation.method.v1'];
assert.equal(method.capability.generationReady, false);
assert.equal(method.capability.generationAuthority, 'unavailable');
assert.equal(method.authoring.requiredInputs.length, 0);
assert.equal(buildArtifactCreationContract({ schemaId: 'tiinex.validation.method.v1' }).status, 'blocked');

const report = byId['tiinex.validation.report.v1'];
assert.equal(report.authoring.requiredInputs.length, 11);
assert.ok(report.authoring.inputDescriptors.every((item) => item.kind === 'ordinary-field'));
const reportSummary = report.authoring.inputDescriptors.find((item) => item.name === 'Summary');
assert.deepEqual({ section: reportSummary.section, group: reportSummary.group, field: reportSummary.field }, { section: 'Findings Summary', group: 'Findings Summary', field: 'Summary' });

const samples = {
  'tiinex.decision.v1': {
    Summary: 'Viewer factory decision proof',
    Decision: 'Use the shared schema factory rendering path.',
    Basis: 'The Artifact Creation Contract and factory descriptor are qualified.',
    Consequences: 'Generation remains separate from transition invocation.'
  },
  'tiinex.evidence.v1': {
    'Supported Claim Or Question': 'whether Viewer generation consumes the shared factory',
    'Evidence Role': 'supports the bounded product proof',
    'Known Source': 'browser-local proof fixture',
    'Preservation Basis': 'rendered through the qualified Artifact Creation Contract',
    'Provenance Limits': 'local product proof only',
    Material: 'factory-generated Viewer artifact',
    'Material Kind': 'local proof record',
    'Preservation State': 'preserved in local proof output',
    'Fidelity Notes': 'required structured values are retained exactly',
    'Known Losses': 'remote publication state not tested',
    'Does Not Prove': 'invocable transition authority',
    'Must Not Be Treated As': 'remote canonical publication proof'
  },
  'tiinex.handoff.v1': {
    Purpose: 'Return bounded Viewer factory proof.',
    From: 'Kodax',
    'From Kind': 'role',
    To: 'Anchor',
    'To Kind': 'role',
    Transfers: [{ name: 'viewer-proof', fields: { 'Transfer Kind': 'work-and-responsibility', Description: 'Exercise shared generation and validation.', Boundary: 'No synthetic transition.' } }],
    'Required Context': 'none',
    'Reference Context': 'none',
    'Retained Responsibilities': [{ name: 'acceptance', fields: { 'Retained By': 'Sigma', Responsibility: 'Accept or reject the factory pattern.' } }],
    'Exclusions And Dependencies': [{ name: 'remote-publication', fields: { Kind: 'excluded-scope', Description: 'No remote Docs publication in this proof.' } }],
    'Completion Expectation': { 'Signal Kind': 'return', 'Signal Meaning': 'Return qualified local factory evidence.', 'Return To': 'Anchor' },
    'Interpretation Limits': { 'Does Not Mean': 'This does not authorize broad schema fan-out.', 'Must Not Be Used To Claim': 'This does not prove transition applicability.', 'Authority Limits': 'Schema semantics remain factory/canonical-material owned.' }
  },
  'tiinex.validation.finding.v1': {
    Target: 'Viewer schema factory proof',
    'Target Kind': 'browser-local product path',
    Method: 'shared contract-driven generation and validation',
    'Method Scope': 'Decision Evidence Handoff Validation Finding',
    Status: 'pass',
    Observation: 'shared factory output validated without transition invocation',
    'What Was Checked': 'factory descriptor generation read projection and validation',
    'What Was Not Checked': 'remote publication or transition applicability',
    'Recommended Response': 'retain the shared generic path',
    'Does Not Prove': 'catalog-wide schema readiness',
    'Must Not Be Treated As': 'semantic acceptance'
  },
  'tiinex.validation.report.v1': {
    Scope: 'bounded Viewer factory scale proof',
    Targets: 'Validation Method and Validation Report',
    'Methods Used': 'shared descriptor renderer and validator',
    'Method Boundaries': 'local proof only',
    Summary: 'Generation is qualified while invocable Create remains unavailable.',
    'Overall State': 'generation-qualified-transition-unavailable',
    Findings: 'all eleven required inputs use ordinary-field bindings',
    'Run Context': 'bounded Viewer proof',
    'What Was Not Checked': 'future canonical Transition Definition applicability',
    'Does Not Prove': 'an invocable Create action exists',
    'Must Not Hide': 'generation and invocation are independent capability dimensions'
  }
};

const generated = [];
for (const schemaId of Object.keys(samples)) {
  const contract = buildArtifactCreationContract({ schemaId });
  assert.equal(contract.status, 'ready', `${schemaId} generation contract must remain ready`);
  assert.equal(contract.capabilities.create, 'implemented');
  const markdown = renderArtifactCreationCandidateMarkdown(contract, { values: samples[schemaId], createdAt: '2026-09-04T13:00:00.000Z' });
  assert.ok(markdown, `${schemaId} must render through the shared generic generation path`);
  const validation = validateArtifactCreationResult({ schemaId, status: 'local', sourceMode: 'local-factory-proof', path: `${schemaId}.viewer-proof.trace.md`, markdown }, {}, { contract, childPath: `${schemaId}.viewer-proof.trace.md` });
  assert.equal(validation.counts.errors, 0, `${schemaId}: ${JSON.stringify(validation.findings, null, 2)}`);
  generated.push({ schemaId, status: validation.status });
}

const reportMarkdown = renderArtifactCreationCandidateMarkdown(buildArtifactCreationContract({ schemaId: 'tiinex.validation.report.v1' }), { values: samples['tiinex.validation.report.v1'], createdAt: '2026-09-04T13:00:00.000Z' });
assert.ok(reportMarkdown.includes('## Findings Summary\n\n- Summary: Generation is qualified while invocable Create remains unavailable.'));

const appSource = fs.readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
assert.ok(appSource.includes('schemaFactoryViewerProofActions()'), 'Workspace Create continues to consume only product-capable factory actions; unqualified generation descriptors are filtered before UI invocation.');

console.log(JSON.stringify({
  schema: 'tiinex.site.schema-factory-viewer-proof.v2',
  schemas: SCHEMA_FACTORY_VIEWER_PROOF_SCHEMA_IDS,
  generated,
  generationQualified: projections.filter((item) => item.capability.generationReady).map((item) => item.authoring.schemaId),
  generationUnavailable: projections.filter((item) => !item.capability.generationReady).map((item) => item.authoring.schemaId),
  invocableCreateActions: schemaFactoryViewerProofActions().length,
  validationErrors: 0,
  renderer: GENERIC_ARTIFACT_CREATION_RENDERER_ID,
  boundary: 'Viewer/Builder capability proof: read/validate, generation authority, and invocable Transition authority remain independent.'
}, null, 2));
