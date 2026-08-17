import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';
import { buildCanonicalTransitionOutputMaterializationPlan } from '../transitions/transition.outputMaterializationPlanner.js';

const rootOrdinary = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const rootMachineShape = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.machine-shape.contract-fixture.md', import.meta.url), 'utf8');
const transitionBase = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const transitionDomains = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.field-domain.contract-fixture.md', import.meta.url), 'utf8');
const plannerSource = fs.readFileSync(new URL('../transitions/transition.outputMaterializationPlanner.js', import.meta.url), 'utf8');

const resolvers = Object.freeze({ schemaAuthorities: Object.freeze({
  'tiinex.topic.v1': Object.freeze({ targetKind: 'artifact' }),
  'tiinex.feedback.v1': Object.freeze({ targetKind: 'artifact' }),
  'tiinex.signal.v1': Object.freeze({ targetKind: 'artifact', generation: true, fileNaming: true })
}) });

function contractGroups(markdown) {
  const headings = [...String(markdown).matchAll(/^### ([^\n]+)\n/gm)];
  return headings.map((heading, index) => ({ name: heading[1], start: heading.index, end: index + 1 < headings.length ? headings[index + 1].index : markdown.length, text: markdown.slice(heading.index, index + 1 < headings.length ? headings[index + 1].index : markdown.length) }));
}
function categoryBlock(groupText, label) {
  const start = groupText.indexOf(`\n${label}\n`);
  if (start < 0) return '';
  const tail = groupText.slice(start + 1);
  const rules = tail.indexOf('\nRules\n');
  return tail.slice(0, rules < 0 ? tail.length : rules).trimEnd();
}
function transitionContract() {
  let output = transitionBase;
  for (const pressureGroup of contractGroups(transitionDomains)) {
    const domains = categoryBlock(pressureGroup.text, 'Field Value Constraints');
    if (!domains) continue;
    const current = contractGroups(output).find((group) => group.name === pressureGroup.name);
    assert.ok(current);
    let replacement = current.text;
    const appliesTo = categoryBlock(pressureGroup.text, 'Applies To');
    if (appliesTo && !replacement.includes('\nApplies To\n')) {
      const rulesAt = replacement.indexOf('\nRules\n');
      replacement = rulesAt < 0 ? `${replacement.trimEnd()}\n${appliesTo}\n` : `${replacement.slice(0, rulesAt)}\n${appliesTo}\n${replacement.slice(rulesAt)}`;
    }
    const rulesAt = replacement.indexOf('\nRules\n');
    replacement = rulesAt < 0 ? `${replacement.trimEnd()}\n${domains}\n` : `${replacement.slice(0, rulesAt)}\n${domains}\n${replacement.slice(rulesAt)}`;
    output = `${output.slice(0, current.start)}${replacement}${output.slice(current.end)}`;
  }
  return output;
}
function rootContract() {
  const marker = '### Machine Shape Authority';
  return `${rootOrdinary.trimEnd()}\n\n${rootMachineShape.slice(rootMachineShape.indexOf(marker)).trim()}\n`;
}
const schemaMaterials = [rootContract(), transitionContract()];

function targetSchema(schemaId = 'tiinex.signal.v1', { parent = 'tiinex.root.v1', creation = true } = {}) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parent ? `- Parent\n  - Parent Schema: ${parent}\n  - Trace: root.trace.md\n  - Origin: root.trace.md\n` : ''}- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-16 00:00:00\n\n---\n\n# Signal\n\n## Schema Validation Contract\n\n### Signal Scope\n\nApplies To\n\n- artifacts whose Current Schema is ${schemaId}\n\nRules\n\n- Signal test authority.\n${creation ? `\n## Artifact Creation Contract\n\n### Creation Inputs\n\nRequired Fields\n\n- Prompt\n- Count\n\nOptional Fields\n\n- Note\n\n### Content Shape\n\nRequired Sections\n\n- Summary\n\n### Tooling Configuration\n\nRequired Fields\n\n- createTitle\n` : ''}`;
}
const signalSchema = targetSchema();
const targetAuthorities = [{ outputRole: 'result', materials: [rootOrdinary, signalSchema] }];
const completeGenerationInputs = [
  { outputRole: 'result', name: 'Prompt', value: 'prompt' },
  { outputRole: 'result', name: 'Count', value: 1 },
  { outputRole: 'result', name: 'Summary', value: 'summary' }
];

function markdown({
  id = 'output-materialization', outputMinimum = '1', outputMaximum = '1', outputTargetKind = 'artifact', outputSchemaConstraint = 'tiinex.signal.v1', generationBinding = 'target-schema',
  requiredOperation = 'create', placementIntent = 'new-materialization', namingAuthority = 'explicit-binding', namingReference = '', destinationRequired = 'yes', relativeToBinding = '', transitionCondition = '',
  memberMapping = 'single', mappingKey = '', mappingMeaning = '', secondLifecycle = false, explicitOverrideAllowed = 'no'
} = {}) {
  const schemaLine = outputSchemaConstraint ? `\n  - Schema Constraint: ${outputSchemaConstraint}` : '';
  const generationLine = generationBinding ? `\n  - Generation Binding: ${generationBinding}` : '';
  const operationLine = requiredOperation ? `\n  - Required Materialization Operation: ${requiredOperation}` : '';
  const namingRefLine = namingReference ? `\n  - Naming Authority Reference: ${namingReference}` : '';
  const relativeLine = relativeToBinding ? `\n  - Relative To Binding: ${relativeToBinding}\n  - Relative Placement Meaning: place relative to declared binding` : '';
  const second = secondLifecycle ? `\n- revise-result\n  - Target Binding: result\n  - Effect: revise-current\n  - Logical Continuity: preserve-subject\n  - Required Materialization Operation: revise\n  - Preserve Why: yes\n  - Member Mapping: single\n` : '';
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.transition.definition.v1\n  - Created At: 2026-08-16 00:00:00\n\n---\n\n# ${id}\n\n## Transition Identity\n\n- Name: ${id}\n- Version: 1\n- Canonical Identifier: ${id}\n\n## Purpose And Scope\n\n- Purpose: Canonical output generation and materialization intent fixture.\n- Semantic Boundary: Intent planning only; no generation, path, materialization, or execution.\n\n## Input Roles\n\n- source\n  - Meaning: Existing Topic source.\n  - Minimum Count: 1\n  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1\n  - Acquisition Policy: existing-only\n- note\n  - Meaning: Opaque caller value.\n  - Minimum Count: 1\n  - Maximum Count: 1\n  - Target Kind: non-artifact\n  - Acquisition Policy: invocation-provided\n\n## Output Roles\n\n- result\n  - Meaning: Planned result.\n  - Minimum Count: ${outputMinimum}\n  - Maximum Count: ${outputMaximum}\n  - Target Kind: ${outputTargetKind}${schemaLine}${generationLine}\n\n## Lifecycle And Continuity Effects\n\n### Lifecycle Effects\n\n- create-result\n  - Target Binding: result\n  - Effect: create-new\n  - Logical Continuity: new-subject${operationLine}\n  - Preserve Why: yes\n  - Member Mapping: ${memberMapping}${mappingKey ? `\n  - Mapping Key: ${mappingKey}` : ''}${mappingMeaning ? `\n  - Mapping Meaning: ${mappingMeaning}` : ''}${second}\n\n### Parent Effects\n\n- none\n\n## Relation Effects\n\n- none\n\n## Applicability And Conditions\n\n- Applicability Meaning: Output intent planning fixture.${transitionCondition ? `\n- Condition: ${transitionCondition}` : ''}\n- Failure Meaning: Missing intent authority remains incomplete or unresolved.\n- Unknown Meaning: Unknown truth remains unresolved.\n\n## Authoring Bindings\n\n- Authoring Notes: Read-only output intent fixture.\n\n## Placement Intent\n\n### Destination Bindings\n\n- destination\n  - Meaning: Caller-selected destination.\n  - Required: ${destinationRequired}\n\n### Output Placements\n\n- result-placement\n  - Output Binding: result\n  - Destination Binding: destination\n  - Placement Intent: ${placementIntent}\n  - Naming Authority: ${namingAuthority}${namingRefLine}${relativeLine}\n  - Explicit Override Allowed: ${explicitOverrideAllowed}\n\n## Interpretation Limits\n\n- Does Not Prove: Artifact generation, path allocation, materialization, mutation, or execution.\n- Must Not Be Inferred: output member identities or filesystem paths.\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture-integrity-value\n`;
}
function transitionRecord(source, id) {
  return Object.assign(createRecordFromMarkdown(source, { path: `.topics/transitions/${id}.trace.md`, sourceMode: 'source-backed' }), {
    id: `transition:${id}`,
    source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: 'd69b8ff55a56b8cb9282b8684db6a938a4435b94', rootPath: '.topics' },
    sourceTarget: { sourceArtifactPath: `.topics/transitions/${id}.trace.md` }
  });
}
function read(options = {}) {
  const id = options.id || 'output-materialization';
  return buildTransitionDefinitionRegistry({ records: [transitionRecord(markdown(options), id)], schemaMaterials, resolvers }).definitions[0];
}
function artifactRecord(id, schemaId) {
  const source = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-16 00:00:00\n\n---\n\n# ${id}\n\nReadable participant.\n`;
  return Object.assign(createRecordFromMarkdown(source, { path: `.topics/${id}.trace.md`, sourceMode: 'local' }), { id, workspaceId: 'w', source: { id: 'local-session', adapterId: 'local' } });
}
const topicRecord = artifactRecord('topic', 'tiinex.topic.v1');
const participantIndex = buildLoadedArtifactParticipantIndex({ records: [topicRecord] });
const topicParticipant = participantIndex.participants.find((participant) => participant.candidateSchemaId === 'tiinex.topic.v1');
function completePacket(overrides = {}) {
  return {
    inputRoles: [
      { role: 'source', members: [{ bindingId: 'source-1', participantId: topicParticipant.identity.id }] },
      { role: 'note', members: [{ bindingId: 'note-1', value: 'opaque note' }] }
    ],
    destinations: [{ name: 'destination', value: { slot: 'workspace-a' } }],
    naming: [{ placement: 'result-placement', value: 'result-name' }],
    memberAssociations: [],
    ...overrides
  };
}
function plan(options = {}, extra = {}) {
  const definition = extra.definition || read(options);
  return buildCanonicalTransitionOutputMaterializationPlan({
    definition,
    participantIndex,
    bindingPacket: extra.bindingPacket || completePacket(),
    generationInputs: extra.generationInputs === undefined ? completeGenerationInputs : extra.generationInputs,
    targetSchemaAuthorities: extra.targetSchemaAuthorities === undefined ? targetAuthorities : extra.targetSchemaAuthorities,
    currentArtifact: extra.currentArtifact
  });
}
function output(result) { return result.outputRolePlans.find((item) => item.name === 'result'); }
function placement(result) { return output(result)?.placements.find((item) => item.name === 'result-placement'); }

// Baseline: all v422 obligations and v423-owned creation/destination/naming intent inputs are known.
const base = plan();
assert.equal(base.qualification, 'qualified');
assert.equal(base.executable, false);
assert.equal(base.artifactCreated, false);
assert.equal(base.draftRendered, false);
assert.equal(base.pathResolution, false);
assert.equal(base.materialization, false);
assert.equal(output(base).outputCount.state, 'resolved');
assert.equal(output(base).outputCount.exactCount, 1);
assert.equal(output(base).outputMemberIds.length, 0);
assert.equal(output(base).generation.state, 'resolved');
assert.deepEqual(output(base).generation.requiredInputs, ['Prompt', 'Count', 'Summary']);
assert.deepEqual(output(base).generation.optionalInputs, ['Note']);
assert.deepEqual(output(base).generation.requiredSections, ['Summary']);
assert.deepEqual(output(base).generation.toolingConfigurationFields, ['createTitle']);
assert.equal(output(base).lifecycle.requestedOperation, 'create');
assert.equal(placement(base).state, 'resolved');
assert.deepEqual(placement(base).destinationValue, { slot: 'workspace-a' });
assert.equal(placement(base).naming.state, 'resolved');
assert.equal(placement(base).naming.value, 'result-name');
assert.equal(placement(base).concretePath, null);

// Upstream v422 qualification is monotonic and never upgraded by downstream authority.
const blockedDefinition = Object.freeze({ ...read(), canonicalReadQualified: false });
assert.equal(plan({}, { definition: blockedDefinition }).qualification, 'blocked');
assert.equal(plan({}, { bindingPacket: completePacket({ destinations: [{ name: 'destination', value: 'a' }, { name: 'destination', value: 'b' }] }) }).qualification, 'invalid');
assert.equal(plan({ transitionCondition: 'unknown condition truth' }).qualification, 'unresolved');
assert.equal(plan({}, { bindingPacket: completePacket({ inputRoles: [{ role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] }) }).qualification, 'incomplete');

// Output count truth.
assert.equal(plan({ outputMinimum: '0', outputMaximum: '1' }).qualification, 'unresolved');
assert.equal(output(plan({ outputMinimum: '0', outputMaximum: '1' })).outputCount.exactCount, null);
assert.equal(plan({ outputMinimum: '1', outputMaximum: 'unbounded' }).qualification, 'unresolved');
assert.equal(plan({ outputMinimum: 'unknown', outputMaximum: '1' }).qualification, 'unresolved');

// target-schema creation authority and fail-closed material identity/lineage.
assert.equal(plan({}, { targetSchemaAuthorities: [] }).qualification, 'unresolved');
const wrongAuthority = [{ outputRole: 'result', materials: [rootOrdinary, targetSchema('tiinex.other.v1')] }];
assert.equal(plan({}, { targetSchemaAuthorities: wrongAuthority }).qualification, 'invalid');
const incompleteAuthority = [{ outputRole: 'result', materials: [signalSchema] }];
assert.equal(plan({}, { targetSchemaAuthorities: incompleteAuthority }).qualification, 'unresolved');
const noCreationAuthority = [{ outputRole: 'result', materials: [rootOrdinary, targetSchema('tiinex.signal.v1', { creation: false })] }];
assert.equal(plan({}, { targetSchemaAuthorities: noCreationAuthority }).qualification, 'unresolved');

// Explicit Markdown generation reference stays exact and unresolved without a generic reference resolver.
const explicitReference = '[authority](../authority.md)';
const refPlan = plan({ generationBinding: explicitReference }, { targetSchemaAuthorities: [] });
assert.equal(refPlan.qualification, 'unresolved');
assert.equal(output(refPlan).generation.reference, explicitReference);
assert.equal(output(refPlan).generation.authority, 'explicit-reference');

// Generation Binding absent is not guessed; create/revise materialization makes the missing generation authority unresolved.
const noGenerationNoOperation = plan({ generationBinding: '', requiredOperation: '', placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(output(noGenerationNoOperation).generation.authority, 'not-prescribed');
assert.equal(output(noGenerationNoOperation).lifecycle.requestedOperation, '');
assert.equal(noGenerationNoOperation.qualification, 'qualified');
const noGenerationCreate = plan({ generationBinding: '' }, { targetSchemaAuthorities: [], generationInputs: [] });
assert.equal(noGenerationCreate.qualification, 'unresolved');
assert.ok(output(noGenerationCreate).reasons.some((item) => item.includes('generation-not-prescribed-for-materialization')));

// Generation input presence, multiplicity, opaque values, and tooling separation.
const missingRequired = plan({}, { generationInputs: completeGenerationInputs.filter((entry) => entry.name !== 'Prompt') });
assert.equal(missingRequired.qualification, 'incomplete');
const undefinedRequired = plan({}, { generationInputs: completeGenerationInputs.map((entry) => entry.name === 'Prompt' ? { ...entry, value: undefined } : entry) });
assert.equal(undefinedRequired.qualification, 'incomplete');
const opaqueValues = plan({}, { generationInputs: [
  { outputRole: 'result', name: 'Prompt', value: 0 },
  { outputRole: 'result', name: 'Count', value: false },
  { outputRole: 'result', name: 'Summary', value: null },
  { outputRole: 'result', name: 'Note', value: '' }
] });
assert.equal(opaqueValues.qualification, 'qualified');
const duplicateGeneration = plan({}, { generationInputs: [...completeGenerationInputs, { outputRole: 'result', name: 'Prompt', value: 'duplicate' }] });
assert.equal(duplicateGeneration.qualification, 'invalid');
const toolingInput = plan({}, { generationInputs: [...completeGenerationInputs, { outputRole: 'result', name: 'createTitle', value: 'UI title' }, { outputRole: 'result', name: 'Extra', value: 42 }] });
assert.equal(toolingInput.qualification, 'qualified');
assert.equal(output(toolingInput).generation.unclaimedInputs.find((item) => item.name === 'createTitle').category, 'tooling-configuration');
assert.equal(output(toolingInput).generation.unclaimedInputs.find((item) => item.name === 'Extra').category, 'unclaimed-extra');
assert.equal(output(toolingInput).generation.inputPlans.some((item) => item.name === 'createTitle'), false);
assert.equal(plan({}, { generationInputs: [...completeGenerationInputs, { outputRole: 'ghost', name: 'Prompt', value: 'x' }] }).qualification, 'invalid');
assert.equal(plan({}, { generationInputs: [...completeGenerationInputs, { outputRole: 'result', name: 'Extra', value: 1 }, { outputRole: 'result', name: 'Extra', value: 2 }] }).qualification, 'invalid');
const upstreamIncompleteWithLocalDuplicate = plan({}, { bindingPacket: completePacket({ inputRoles: [{ role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] }), generationInputs: [...completeGenerationInputs, { outputRole: 'result', name: 'Prompt', value: 'duplicate' }] });
assert.equal(upstreamIncompleteWithLocalDuplicate.qualification, 'incomplete');

// Target kind boundary.
const nonArtifact = plan({ outputTargetKind: 'non-artifact', outputSchemaConstraint: '', generationBinding: '', requiredOperation: '', placementIntent: 'no-materialization', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) });
assert.equal(nonArtifact.qualification, 'qualified');
assert.equal(output(nonArtifact).effectiveParticipantKind, 'non-artifact');
assert.equal(output(nonArtifact).artifactDraft, null);
assert.equal(output(nonArtifact).generation.state, 'not-prescribed');
assert.equal(plan({ outputTargetKind: 'unknown', outputSchemaConstraint: '', generationBinding: '' }, { targetSchemaAuthorities: [], generationInputs: [] }).qualification, 'unresolved');

// Placement + destination intent.
assert.equal(placement(base).state, 'resolved');
const optionalDestinationUnbound = plan({ destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [] }) });
assert.equal(optionalDestinationUnbound.qualification, 'unresolved');
assert.equal(placement(optionalDestinationUnbound).reason, 'destination-component-unresolved');
const noMaterialization = plan({ placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(placement(noMaterialization).state, 'resolved');
assert.equal(placement(noMaterialization).concretePath, null);
assert.equal(plan({ placementIntent: 'preserve-current', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }).qualification, 'unresolved');
assert.equal(plan({ placementIntent: 'unknown' }).qualification, 'unresolved');
const relativePlacement = plan({ relativeToBinding: 'source' });
assert.equal(relativePlacement.qualification, 'unresolved');
assert.equal(placement(relativePlacement).reason, 'relative-placement-resolver-unavailable');

// Naming authority never fabricates a concrete path.
assert.equal(placement(base).naming.authority, 'explicit-binding');
assert.equal(placement(base).concretePath, null);
const targetNaming = plan({ namingAuthority: 'target-schema' }, { bindingPacket: completePacket({ naming: [] }) });
assert.equal(targetNaming.qualification, 'unresolved');
assert.equal(placement(targetNaming).reason, 'target-schema-naming-resolver-unavailable');
const externalNaming = plan({ namingAuthority: 'external-authority', namingReference: '[naming](../naming.md)' }, { bindingPacket: completePacket({ naming: [] }) });
assert.equal(externalNaming.qualification, 'unresolved');
assert.equal(placement(externalNaming).naming.reference, '[naming](../naming.md)');
assert.equal(plan({ namingAuthority: 'unknown' }, { bindingPacket: completePacket({ naming: [] }) }).qualification, 'unresolved');
assert.equal(plannerSource.includes('Allowed Shapes'), false);
assert.equal(plannerSource.includes('.trace.md'), false);
assert.equal(plannerSource.includes("join('/'"), false);

// Lifecycle operation is declared only; absence is not defaulted and multiple operation-bearing effects remain unresolved.
const noOperation = plan({ requiredOperation: '', placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(output(noOperation).lifecycle.state, 'not-prescribed');
assert.equal(output(noOperation).lifecycle.requestedOperation, '');
assert.equal(output(noOperation).lifecycle.command, null);
const multipleEffects = plan({ secondLifecycle: true });
assert.equal(multipleEffects.qualification, 'unresolved');
assert.equal(output(multipleEffects).lifecycle.reason, 'multiple-materialization-operations-require-composition');

// Mapping dependencies are consumed from v422; deterministic mappings remain deferred with no positional inference.
const pairwise = plan({ memberMapping: 'pairwise' });
assert.equal(pairwise.qualification, 'qualified');
assert.equal(output(pairwise).mappingDependencies[0].state, 'deferred');
assert.deepEqual(output(pairwise).mappingDependencies[0].associations, []);
assert.equal(output(pairwise).mappingDependencies[0].positionalInference, false);
const byKey = plan({ memberMapping: 'by-key', mappingKey: 'id' });
assert.equal(byKey.qualification, 'qualified');
assert.equal(output(byKey).mappingDependencies[0].state, 'deferred');
assert.equal(output(byKey).mappingDependencies[0].positionalInference, false);
assert.equal(plan({ memberMapping: 'custom', mappingMeaning: 'runtime-owned custom semantics' }).qualification, 'unresolved');
assert.equal(plan({ memberMapping: 'unknown' }).qualification, 'unresolved');

// Mandatory adjacent-state / authority-monotonicity sweep.
const sweepCases = [
  { label: 'artifact-target-generation-missing', options: {}, extra: { targetSchemaAuthorities: [] }, expected: 'unresolved' },
  { label: 'artifact-range-count', options: { outputMinimum: '0', outputMaximum: '1' }, expected: 'unresolved' },
  { label: 'artifact-optional-destination-still-placement-required', options: { destinationRequired: 'no' }, extra: { bindingPacket: completePacket({ destinations: [] }) }, expected: 'unresolved' },
  { label: 'artifact-no-materialization-does-not-require-destination', options: { placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, extra: { bindingPacket: completePacket({ destinations: [], naming: [] }) }, expected: 'qualified' },
  { label: 'target-schema-naming-never-uses-prose', options: { namingAuthority: 'target-schema' }, extra: { bindingPacket: completePacket({ naming: [] }) }, expected: 'unresolved' },
  { label: 'pairwise-no-order-inference', options: { memberMapping: 'pairwise' }, expected: 'qualified' },
  { label: 'upstream-incomplete-not-upgraded', options: {}, extra: { bindingPacket: completePacket({ inputRoles: [{ role: 'note', members: [{ bindingId: 'note-1', value: 'note' }] }] }) }, expected: 'incomplete' },
  { label: 'nonartifact-no-artifact-intent', options: { outputTargetKind: 'non-artifact', outputSchemaConstraint: '', generationBinding: '', requiredOperation: '', placementIntent: 'no-materialization', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, extra: { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) }, expected: 'qualified' }
];
for (const item of sweepCases) {
  const swept = plan(item.options, item.extra || {});
  assert.equal(swept.qualification, item.expected, item.label);
  assert.equal(swept.executable, false, `${item.label}: executable remains false`);
  if (swept.outputRolePlans.length) {
    assert.equal(output(swept).outputMemberIds.length, 0, `${item.label}: no output IDs invented`);
    for (const placementPlan of output(swept).placements) assert.equal(placementPlan.concretePath, null, `${item.label}: no concrete path`);
  }
}

console.log('post-v422 canonical output generation/materialization intent planner foundation: PASS');

// Architect correction batch: exact-zero outputs preserve declarations but create no concrete downstream obligations.
const zeroOutput = plan({
  outputMinimum: '0', outputMaximum: '0', destinationRequired: 'no', namingAuthority: 'target-schema'
}, {
  targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] })
});
assert.equal(zeroOutput.qualification, 'qualified');
assert.equal(output(zeroOutput).outputCount.state, 'resolved');
assert.equal(output(zeroOutput).outputCount.exactCount, 0);
assert.deepEqual(output(zeroOutput).outputMemberIds, []);
assert.equal(output(zeroOutput).generation.declared, 'target-schema');
assert.equal(output(zeroOutput).generation.authority, 'target-schema');
assert.equal(output(zeroOutput).generation.state, 'not-required');
assert.equal(output(zeroOutput).generation.inputPlans.length, 0);
assert.equal(output(zeroOutput).lifecycle.state, 'not-required');
assert.equal(output(zeroOutput).lifecycle.requestedOperation, '');
assert.equal(output(zeroOutput).lifecycle.effects.length, 1);
assert.equal(output(zeroOutput).placements.length, 1);
assert.equal(output(zeroOutput).placements[0].state, 'not-required');
assert.equal(output(zeroOutput).placements[0].naming.authority, 'target-schema');
assert.equal(output(zeroOutput).placements[0].concretePath, null);
assert.equal(output(zeroOutput).mappingDependencies[0].state, 'not-required');
const zeroDuplicate = plan({ outputMinimum: '0', outputMaximum: '0' }, {
  generationInputs: [{ outputRole: 'result', name: 'Extra', value: 1 }, { outputRole: 'result', name: 'Extra', value: 2 }]
});
assert.equal(zeroDuplicate.qualification, 'invalid');
assert.ok(zeroDuplicate.reasons.some((item) => item.includes('duplicate-generation-input-entry')));

// Architect correction batch: lifecycle declaration provenance survives independent of operation-bearing subset.
const lifecycleNoOperation = plan({
  requiredOperation: '', generationBinding: '', placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no'
}, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(lifecycleNoOperation.qualification, 'qualified');
assert.equal(output(lifecycleNoOperation).lifecycle.state, 'not-prescribed');
assert.equal(output(lifecycleNoOperation).lifecycle.requestedOperation, '');
assert.equal(output(lifecycleNoOperation).lifecycle.effects.length, 1);
assert.equal(output(lifecycleNoOperation).lifecycle.effects[0].name, 'create-result');
assert.equal(output(lifecycleNoOperation).lifecycle.effects[0].effect, 'create-new');
assert.equal(output(lifecycleNoOperation).lifecycle.effects[0].logicalContinuity, 'new-subject');
assert.equal(output(lifecycleNoOperation).lifecycle.effects[0].requiredMaterializationOperation, '');
assert.equal(output(lifecycleNoOperation).lifecycle.effects[0].memberMapping, 'single');
assert.equal(output(lifecycleNoOperation).lifecycle.effects[0].participation.state, 'active');
const oneOperationAmongTwo = plan({ requiredOperation: '', secondLifecycle: true });
assert.equal(output(oneOperationAmongTwo).lifecycle.effects.length, 2);
assert.equal(output(oneOperationAmongTwo).lifecycle.requestedOperation, 'revise');
assert.equal(output(oneOperationAmongTwo).lifecycle.state, 'resolved');
const twoOperationEffects = plan({ secondLifecycle: true });
assert.equal(output(twoOperationEffects).lifecycle.effects.length, 2);
assert.equal(output(twoOperationEffects).lifecycle.state, 'unresolved');
assert.equal(output(twoOperationEffects).lifecycle.requestedOperation, '');

// Architect correction batch: present-but-empty target authority is missing/unresolved, not contradictory schema authority.
const emptyAuthority = plan({}, { targetSchemaAuthorities: [{ outputRole: 'result', materials: [] }] });
assert.equal(emptyAuthority.qualification, 'unresolved');
assert.equal(output(emptyAuthority).generation.reason, 'target-schema-authority-missing');
const blankAuthority = plan({}, { targetSchemaAuthorities: [{ outputRole: 'result', materials: [''] }] });
assert.equal(blankAuthority.qualification, 'unresolved');
assert.equal(output(blankAuthority).generation.reason, 'target-schema-authority-missing');
const whitespaceAuthority = plan({}, { targetSchemaAuthorities: [{ outputRole: 'result', materials: ['   \n'] }] });
assert.equal(whitespaceAuthority.qualification, 'unresolved');
assert.equal(output(whitespaceAuthority).generation.reason, 'target-schema-authority-missing');
assert.equal(plan().qualification, 'qualified');
assert.equal(plan({}, { targetSchemaAuthorities: wrongAuthority }).qualification, 'invalid');

console.log('post-v423 consolidated output-intent correction batch: PASS');

// Consolidated adjacent-state sweep requested before repackaging.
const correctionSweep = [
  ['zero-missing-authority', { outputMinimum: '0', outputMaximum: '0', destinationRequired: 'no', namingAuthority: 'target-schema' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified'],
  ['zero-empty-authority', { outputMinimum: '0', outputMaximum: '0', destinationRequired: 'no', namingAuthority: 'target-schema' }, { targetSchemaAuthorities: [{ outputRole: 'result', materials: [] }], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified'],
  ['one-missing-authority', {}, { targetSchemaAuthorities: [] }, 'unresolved'],
  ['one-empty-authority', {}, { targetSchemaAuthorities: [{ outputRole: 'result', materials: [] }] }, 'unresolved'],
  ['one-correct-authority', {}, {}, 'qualified'],
  ['one-wrong-authority', {}, { targetSchemaAuthorities: wrongAuthority }, 'invalid'],
  ['range-correct-authority', { outputMinimum: '0', outputMaximum: '1' }, {}, 'unresolved'],
  ['explicit-generation-reference', { generationBinding: explicitReference }, { targetSchemaAuthorities: [] }, 'unresolved'],
  ['generation-absent-operation-absent', { generationBinding: '', requiredOperation: '', placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified'],
  ['lifecycle-multiple-operation', { secondLifecycle: true }, {}, 'unresolved'],
  ['placement-no-materialization', { placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified'],
  ['placement-preserve-current', { placementIntent: 'preserve-current', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'unresolved'],
  ['naming-external', { namingAuthority: 'external-authority', namingReference: '[n](../n.md)' }, { bindingPacket: completePacket({ naming: [] }) }, 'unresolved'],
  ['generation-undefined', {}, { generationInputs: completeGenerationInputs.map((entry) => entry.name === 'Prompt' ? { ...entry, value: undefined } : entry) }, 'incomplete'],
  ['generation-duplicate', {}, { generationInputs: [...completeGenerationInputs, { outputRole: 'result', name: 'Prompt', value: 'duplicate' }] }, 'invalid'],
  ['generation-extra', {}, { generationInputs: [...completeGenerationInputs, { outputRole: 'result', name: 'Extra', value: 42 }] }, 'qualified']
];
for (const [label, options, extra, expected] of correctionSweep) {
  const result = plan(options, extra);
  assert.equal(result.qualification, expected, label);
  assert.equal(result.executable, false, `${label}: executable false`);
  if (result.outputRolePlans.length) {
    assert.deepEqual(output(result).outputMemberIds, [], `${label}: no output identities`);
    for (const item of output(result).placements) assert.equal(item.concretePath, null, `${label}: no concrete path`);
  }
}
console.log('post-v423 consolidated adjacent-state sweep: PASS');


// Architect provenance + authority closure batch.
const nonArtifactReference = plan({
  outputTargetKind: 'non-artifact', outputSchemaConstraint: '', generationBinding: explicitReference,
  requiredOperation: '', placementIntent: 'no-materialization', namingAuthority: 'explicit-binding', destinationRequired: 'no'
}, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) });
assert.equal(nonArtifactReference.qualification, 'unresolved');
assert.equal(output(nonArtifactReference).generation.declared, explicitReference);
assert.equal(output(nonArtifactReference).generation.authority, 'explicit-reference');
assert.equal(output(nonArtifactReference).generation.reference, explicitReference);
assert.equal(output(nonArtifactReference).generation.state, 'unresolved');

const overrideYes = plan({ explicitOverrideAllowed: 'yes' });
assert.equal(placement(overrideYes).explicitOverrideAllowed, 'yes');
assert.equal(placement(base).explicitOverrideAllowed, 'no');
assert.equal(placement(overrideYes).concretePath, null);

const byKeyProvenance = plan({ memberMapping: 'by-key', mappingKey: 'specimen-id', mappingMeaning: 'Match exact specimen identity.' });
assert.equal(output(byKeyProvenance).mappingDependencies[0].mapping, 'by-key');
assert.equal(output(byKeyProvenance).mappingDependencies[0].mappingKey, 'specimen-id');
assert.equal(output(byKeyProvenance).mappingDependencies[0].mappingMeaning, 'Match exact specimen identity.');
assert.equal(output(byKeyProvenance).mappingDependencies[0].state, 'deferred');
assert.equal(output(byKeyProvenance).mappingDependencies[0].positionalInference, false);

const duplicateZeroAuthority = plan({ outputMinimum: '0', outputMaximum: '0', destinationRequired: 'no', namingAuthority: 'target-schema' }, {
  targetSchemaAuthorities: [targetAuthorities[0], targetAuthorities[0]], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] })
});
assert.equal(duplicateZeroAuthority.qualification, 'invalid');
assert.ok(duplicateZeroAuthority.generationAudit.findings.some((item) => item.code === 'duplicate-target-schema-authority-entry' && item.subject === 'result'));
assert.equal(output(duplicateZeroAuthority).generation.state, 'not-required');

// Final bounded closure sweep: declaration provenance survives deferred evaluation and exact-zero hides no malformed packet multiplicity.
const closureSweep = [
  ['artifact-absent-one', { generationBinding: '', requiredOperation: '', placementIntent: 'no-materialization', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) }, 'qualified'],
  ['artifact-target-zero', { outputMinimum: '0', outputMaximum: '0', destinationRequired: 'no', namingAuthority: 'target-schema' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified'],
  ['artifact-reference-one', { generationBinding: explicitReference, requiredOperation: '', placementIntent: 'no-materialization', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) }, 'unresolved'],
  ['nonartifact-absent-one', { outputTargetKind: 'non-artifact', outputSchemaConstraint: '', generationBinding: '', requiredOperation: '', placementIntent: 'no-materialization', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) }, 'qualified'],
  ['nonartifact-reference-one', { outputTargetKind: 'non-artifact', outputSchemaConstraint: '', generationBinding: explicitReference, requiredOperation: '', placementIntent: 'no-materialization', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) }, 'unresolved'],
  ['artifact-target-range', { outputMinimum: '0', outputMaximum: '1' }, {}, 'unresolved'],
  ['placement-new-override-yes', { explicitOverrideAllowed: 'yes' }, {}, 'qualified'],
  ['placement-none-override-no', { placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no', explicitOverrideAllowed: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified'],
  ['mapping-single', { memberMapping: 'single', mappingMeaning: 'single declaration meaning' }, {}, 'qualified'],
  ['mapping-pairwise', { memberMapping: 'pairwise', mappingMeaning: 'pairwise declaration meaning' }, {}, 'qualified'],
  ['mapping-by-key', { memberMapping: 'by-key', mappingKey: 'specimen-id', mappingMeaning: 'key declaration meaning' }, {}, 'qualified']
];
for (const [label, options, extra, expected] of closureSweep) {
  const result = plan(options, extra);
  assert.equal(result.qualification, expected, label);
  assert.equal(result.executable, false, `${label}: executable false`);
  if (result.outputRolePlans.length) {
    const out = output(result);
    assert.deepEqual(out.outputMemberIds, [], `${label}: no output IDs`);
    for (const item of out.placements) {
      assert.ok(Object.hasOwn(item, 'explicitOverrideAllowed'), `${label}: override provenance preserved`);
      assert.equal(item.concretePath, null, `${label}: concrete path remains null`);
    }
    for (const item of out.mappingDependencies) {
      assert.ok(Object.hasOwn(item, 'mappingKey'), `${label}: mapping key field preserved`);
      assert.ok(Object.hasOwn(item, 'mappingMeaning'), `${label}: mapping meaning field preserved`);
      assert.equal(item.positionalInference, false, `${label}: no positional inference`);
    }
  }
}
console.log('post-v423 provenance + authority closure batch: PASS');

// Architect naming-component provenance closure: placement axes may suppress work, never known naming truth.
const noMaterializationExplicit = plan({ placementIntent: 'no-materialization', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [] }) });
assert.equal(noMaterializationExplicit.qualification, 'qualified');
assert.equal(placement(noMaterializationExplicit).state, 'resolved');
assert.equal(placement(noMaterializationExplicit).naming.state, 'not-required');
assert.equal(placement(noMaterializationExplicit).naming.authority, 'explicit-binding');
assert.equal(placement(noMaterializationExplicit).naming.value, 'result-name');
assert.equal(placement(noMaterializationExplicit).concretePath, null);

const noMaterializationExternal = plan({ placementIntent: 'no-materialization', namingAuthority: 'external-authority', namingReference: '[n](../n.md)', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(noMaterializationExternal.qualification, 'qualified');
assert.equal(placement(noMaterializationExternal).naming.state, 'not-required');
assert.equal(placement(noMaterializationExternal).naming.authority, 'external-authority');
assert.equal(placement(noMaterializationExternal).naming.reference, '[n](../n.md)');

const preserveExplicit = plan({ placementIntent: 'preserve-current', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [] }) });
assert.equal(preserveExplicit.qualification, 'unresolved');
assert.equal(placement(preserveExplicit).reason, 'current-placement-authority-unavailable');
assert.equal(placement(preserveExplicit).naming.state, 'not-required');
assert.equal(placement(preserveExplicit).naming.value, 'result-name');

const missingDestinationExplicit = plan({ placementIntent: 'new-materialization', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [] }) });
assert.equal(missingDestinationExplicit.qualification, 'unresolved');
assert.equal(placement(missingDestinationExplicit).reason, 'destination-component-unresolved');
assert.equal(placement(missingDestinationExplicit).naming.state, 'resolved');
assert.equal(placement(missingDestinationExplicit).naming.value, 'result-name');
assert.equal(placement(missingDestinationExplicit).concretePath, null);

const missingDestinationExternal = plan({ placementIntent: 'new-materialization', namingAuthority: 'external-authority', namingReference: '[n](../n.md)', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(missingDestinationExternal.qualification, 'unresolved');
assert.equal(placement(missingDestinationExternal).reason, 'destination-component-unresolved');
assert.equal(placement(missingDestinationExternal).naming.state, 'unresolved');
assert.equal(placement(missingDestinationExternal).naming.reference, '[n](../n.md)');

const missingDestinationTarget = plan({ placementIntent: 'new-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(missingDestinationTarget.qualification, 'unresolved');
assert.equal(placement(missingDestinationTarget).reason, 'destination-component-unresolved');
assert.equal(placement(missingDestinationTarget).naming.state, 'unresolved');
assert.equal(placement(missingDestinationTarget).naming.authority, 'target-schema');

const zeroExplicitNaming = plan({ outputMinimum: '0', outputMaximum: '0', placementIntent: 'new-materialization', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) });
assert.equal(zeroExplicitNaming.qualification, 'qualified');
assert.equal(placement(zeroExplicitNaming).state, 'not-required');
assert.equal(placement(zeroExplicitNaming).naming.state, 'not-required');
assert.equal(placement(zeroExplicitNaming).naming.value, 'result-name');
assert.equal(placement(zeroExplicitNaming).concretePath, null);

const zeroExternalNaming = plan({ outputMinimum: '0', outputMaximum: '0', placementIntent: 'no-materialization', namingAuthority: 'external-authority', namingReference: '[n](../n.md)', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) });
assert.equal(zeroExternalNaming.qualification, 'qualified');
assert.equal(placement(zeroExternalNaming).naming.state, 'not-required');
assert.equal(placement(zeroExternalNaming).naming.reference, '[n](../n.md)');

// Compact branch sweep: naming authority/evidence survives every placement branch without authority upgrade.
for (const [label, options, extra, expectedPlan, expectedNaming] of [
  ['none-explicit-one', { placementIntent: 'no-materialization', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [] }) }, 'qualified', 'not-required'],
  ['none-target-one', { placementIntent: 'no-materialization', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified', 'not-required'],
  ['none-external-one', { placementIntent: 'no-materialization', namingAuthority: 'external-authority', namingReference: '[n](../n.md)', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified', 'not-required'],
  ['preserve-explicit-one', { placementIntent: 'preserve-current', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [] }) }, 'unresolved', 'not-required'],
  ['preserve-target-one', { placementIntent: 'preserve-current', namingAuthority: 'target-schema', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'unresolved', 'not-required'],
  ['preserve-external-one', { placementIntent: 'preserve-current', namingAuthority: 'external-authority', namingReference: '[n](../n.md)', destinationRequired: 'no' }, { bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'unresolved', 'not-required'],
  ['new-explicit-resolved-one', { namingAuthority: 'explicit-binding' }, {}, 'qualified', 'resolved'],
  ['new-target-resolved-one', { namingAuthority: 'target-schema' }, { bindingPacket: completePacket({ naming: [] }) }, 'unresolved', 'unresolved'],
  ['new-external-resolved-one', { namingAuthority: 'external-authority', namingReference: '[n](../n.md)' }, { bindingPacket: completePacket({ naming: [] }) }, 'unresolved', 'unresolved'],
  ['zero-explicit', { outputMinimum: '0', outputMaximum: '0', namingAuthority: 'explicit-binding', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [] }) }, 'qualified', 'not-required'],
  ['zero-target', { outputMinimum: '0', outputMaximum: '0', namingAuthority: 'target-schema', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified', 'not-required'],
  ['zero-external', { outputMinimum: '0', outputMaximum: '0', namingAuthority: 'external-authority', namingReference: '[n](../n.md)', destinationRequired: 'no' }, { targetSchemaAuthorities: [], generationInputs: [], bindingPacket: completePacket({ destinations: [], naming: [] }) }, 'qualified', 'not-required']
]) {
  const result = plan(options, extra);
  const projected = placement(result);
  assert.equal(result.qualification, expectedPlan, label);
  assert.equal(projected.naming.state, expectedNaming, `${label}: naming state`);
  assert.equal(projected.concretePath, null, `${label}: no concrete path`);
  if (options.namingAuthority === 'explicit-binding') assert.equal(projected.naming.value, 'result-name', `${label}: explicit value preserved`);
  if (options.namingAuthority === 'external-authority') assert.equal(projected.naming.reference, '[n](../n.md)', `${label}: external reference preserved`);
  assert.equal(result.executable, false, `${label}: executable false`);
}
console.log('post-v423 naming-component provenance branch sweep: PASS');
