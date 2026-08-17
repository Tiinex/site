import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildTransitionDefinitionRegistry } from '../transitions/transition.definitionRegistry.js';
import { buildCanonicalTransitionAvailability } from '../transitions/transition.availabilityPlanner.js';
import { buildLoadedArtifactParticipantIndex } from '../artifacts/artifact.participantIndex.js';
import { buildCanonicalTransitionResultPlan } from '../transitions/transition.resultSemantics.js';

const ROOT_SCHEMA_ID = 'tiinex.root.v1';
const TRANSITION_SCHEMA_ID = 'tiinex.transition.definition.v1';
const DOCS_REF = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';

const rootOrdinaryContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.ordinary-target.contract-fixture.md', import.meta.url), 'utf8');
const rootMachineShapeContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.root.v1.machine-shape.contract-fixture.md', import.meta.url), 'utf8');
const transitionBaseContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const transitionFieldDomainContract = fs.readFileSync(new URL('../tooling/portable/schema/fixtures/tiinex.transition.definition.v1.field-domain.contract-fixture.md', import.meta.url), 'utf8');
const registrySource = fs.readFileSync(new URL('../transitions/transition.definitionRegistry.js', import.meta.url), 'utf8');
const readProjectionSource = fs.readFileSync(new URL('../transitions/transition.definitionReadProjection.js', import.meta.url), 'utf8');
const availabilitySource = fs.readFileSync(new URL('../transitions/transition.availabilityPlanner.js', import.meta.url), 'utf8');
const availabilitySemanticsSource = fs.readFileSync(new URL('../transitions/transition.availabilitySemantics.js', import.meta.url), 'utf8');
const resultSemanticsSource = fs.readFileSync(new URL('../transitions/transition.resultSemantics.js', import.meta.url), 'utf8');

const resolvers = Object.freeze({
  schemaAuthorities: Object.freeze({
    'tiinex.topic.v1': Object.freeze({ targetKind: 'artifact' }),
    'tiinex.signal.v1': Object.freeze({ targetKind: 'artifact', generation: true, fileNaming: true })
  })
});

function contractGroups(markdown) {
  const headings = [...String(markdown || '').matchAll(/^### ([^\n]+)\n/gm)];
  return headings.map((heading, index) => Object.freeze({
    name: heading[1],
    start: heading.index,
    end: index + 1 < headings.length ? headings[index + 1].index : markdown.length,
    text: markdown.slice(heading.index, index + 1 < headings.length ? headings[index + 1].index : markdown.length)
  }));
}

function categoryBlock(groupText, label) {
  const marker = `\n${label}\n`;
  const start = groupText.indexOf(marker);
  if (start < 0) return '';
  const tail = groupText.slice(start + 1);
  const rules = tail.indexOf('\nRules\n');
  return tail.slice(0, rules < 0 ? tail.length : rules).trimEnd();
}

// Test-only composition of frozen machine-authoritative surfaces. No domain values are copied
// into Site code: the exact Tooling fixtures remain the authority source consumed by production.
function transitionContractWithFieldDomains() {
  let output = transitionBaseContract;
  for (const pressureGroup of contractGroups(transitionFieldDomainContract)) {
    const fieldDomains = categoryBlock(pressureGroup.text, 'Field Value Constraints');
    if (!fieldDomains) continue;
    const currentGroup = contractGroups(output).find((candidate) => candidate.name === pressureGroup.name);
    assert.ok(currentGroup, `current Transition contract exposes ${pressureGroup.name}`);
    let replacement = currentGroup.text;
    const appliesTo = categoryBlock(pressureGroup.text, 'Applies To');
    if (appliesTo && !replacement.includes('\nApplies To\n')) {
      const rulesAt = replacement.indexOf('\nRules\n');
      replacement = rulesAt < 0
        ? `${replacement.trimEnd()}\n${appliesTo}\n`
        : `${replacement.slice(0, rulesAt)}\n${appliesTo}\n${replacement.slice(rulesAt)}`;
    }
    const rulesAt = replacement.indexOf('\nRules\n');
    replacement = rulesAt < 0
      ? `${replacement.trimEnd()}\n${fieldDomains}\n`
      : `${replacement.slice(0, rulesAt)}\n${fieldDomains}\n${replacement.slice(rulesAt)}`;
    output = `${output.slice(0, currentGroup.start)}${replacement}${output.slice(currentGroup.end)}`;
  }
  return output;
}

function machineShapeSurface(machineShapeContract = rootMachineShapeContract) {
  const marker = '### Machine Shape Authority';
  const index = machineShapeContract.indexOf(marker);
  assert.ok(index >= 0, 'frozen Root Machine Shape fixture exposes Machine Shape Authority');
  return machineShapeContract.slice(index).trim();
}

function rootContractWithMachineShape(machineShapeContract = rootMachineShapeContract) {
  return `${rootOrdinaryContract.trimEnd()}\n\n${machineShapeSurface(machineShapeContract)}\n`;
}

const transitionContract = transitionContractWithFieldDomains();
const canonicalRootContract = rootContractWithMachineShape();

function markdown({
  id = 'field-domain-machine-shape',
  generationBinding = 'target-schema',
  inputTargetKind = 'artifact',
  lifecycleEffect = 'create-new',
  logicalContinuity = 'new-subject',
  preserveWhy = 'yes',
  parentEffect = 'set',
  relationEffect = 'declare',
  directionality = 'directed',
  placementIntent = 'new-materialization',
  namingAuthority = 'target-schema',
  explicitOverrideAllowed = 'no',
  lifecycleMemberMapping = 'single'
} = {}) {
  return `# Continuity Context

- Envelope Schema: ${ROOT_SCHEMA_ID}
- Current
  - Current Schema: ${TRANSITION_SCHEMA_ID}
  - Created At: 2026-08-16 00:00:00

---

# ${id}

## Transition Identity

- Name: ${id}
- Version: 1
- Canonical Identifier: ${id}

## Purpose And Scope

- Purpose: Prove frozen field-domain and Machine Shape authority through the real Site registry/read chain.
- Semantic Boundary: Read-only validation integration only.

## Input Roles

- source
  - Meaning: Existing source participant.
  - Minimum Count: 1
  - Maximum Count: 1
  - Acquisition Policy: existing-only
  - Target Kind: ${inputTargetKind}
  - Schema Constraint: tiinex.topic.v1

## Output Roles

- result
  - Meaning: Declared output participant.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.signal.v1
  - Generation Binding: ${generationBinding}

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-result
  - Target Binding: result
  - Effect: ${lifecycleEffect}
  - Logical Continuity: ${logicalContinuity}
  - Effect Meaning: Introduce the declared result.
  - Required Materialization Operation: create
  - Preserve Why: ${preserveWhy}
  - Member Mapping: ${lifecycleMemberMapping}

### Parent Effects

- parent-result
  - Output Binding: result
  - Effect: ${parentEffect}
  - Parent Binding: source
  - Member Mapping: single

## Relation Effects

- source-result
  - Effect: ${relationEffect}
  - Subject Binding: result
  - Predicate Identifier: derived-from
  - Predicate Meaning: Result is derived from source.
  - Object Binding: source
  - Directionality: ${directionality}
  - Member Mapping: pairwise
  - Mapping Meaning: Invocation supplies the exact semantic pairs.

## Applicability And Conditions

- Applicability Meaning: Existing read-only participant planning applies.
- Failure Meaning: Fail closed on unresolved canonical authority.
- Unknown Meaning: Preserve unknowns rather than guessing.

## Authoring Bindings

- Interaction Unit: semantic-authoring
- Schema Module: canonical-transition-authoring
- Presentation Surface: portable-read-model
- Authoring Notes: Guidance only.

## Placement Intent

### Destination Bindings

- destination
  - Meaning: Invocation-selected destination.
  - Required: yes

### Output Placements

- result-placement
  - Output Binding: result
  - Destination Binding: destination
  - Placement Intent: ${placementIntent}
  - Naming Authority: ${namingAuthority}
  - Explicit Override Allowed: ${explicitOverrideAllowed}

## Interpretation Limits

- Does Not Prove: invocation, generation, materialization, mutation, or execution.
- Must Not Be Inferred: a concrete path or execution command.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;
}

function record(sourceMarkdown, id = 'field-domain-machine-shape') {
  return Object.assign(createRecordFromMarkdown(sourceMarkdown, {
    path: `.topics/transitions/${id}.trace.md`,
    sourceMode: 'source-backed'
  }), {
    id: `transition:${id}`,
    source: Object.freeze({
      id: 'docs',
      adapterId: 'github',
      repository: 'Tiinex/docs',
      ref: DOCS_REF,
      rootPath: '.topics'
    }),
    sourceTarget: Object.freeze({ sourceArtifactPath: `.topics/transitions/${id}.trace.md` })
  });
}

function read(options = {}, rootContract = canonicalRootContract) {
  const id = options.id || 'field-domain-machine-shape';
  const sourceMarkdown = markdown(options);
  const registry = buildTransitionDefinitionRegistry({
    records: [record(sourceMarkdown, id)],
    schemaMaterials: [rootContract, transitionContract],
    resolvers
  });
  assert.equal(registry.count, 1, `${id}: canonical registry still indexes the definition`);
  return registry.definitions[0];
}

function assertFieldDomainRejected(label, options, field) {
  const definition = read({ id: label, ...options });
  assert.equal(definition.canonicalReadQualified, false, `${label}: malformed field-domain truth fails canonical read qualification`);
  assert.equal(['structurally-invalid', 'contradictory', 'unresolved'].includes(definition.contractValidation.status), true, `${label}: validation fails closed`);
  assert.equal(definition.diagnostics.some((finding) => finding.code === 'portable.contract.field-domain.value.invalid' && finding.field === field), true, `${label}: field-specific Tooling finding survives registry boundary`);
  return definition;
}

const valid = read();
assert.equal(valid.contractValidation.status, 'valid');
assert.equal(valid.canonicalReadQualified, true);
assert.equal(valid.diagnostics.some((finding) => finding.code.startsWith('portable.contract.field-domain.')), false);

// Real-chain closed-domain pressure: malformed/cross-field values never reach canonical read truth.
assertFieldDomainRejected('lifecycle-effect-typo', { lifecycleEffect: 'cretae-new' }, 'Effect');
assertFieldDomainRejected('logical-continuity-typo', { logicalContinuity: 'new-subjct' }, 'Logical Continuity');
assertFieldDomainRejected('preserve-why-typo', { preserveWhy: 'maybe' }, 'Preserve Why');
assertFieldDomainRejected('parent-effect-cross-field', { parentEffect: 'pairwise' }, 'Effect');
assertFieldDomainRejected('relation-effect-cross-field', { relationEffect: 'pairwise' }, 'Effect');
assertFieldDomainRejected('directionality-cross-field', { directionality: 'declare' }, 'Directionality');
assertFieldDomainRejected('placement-intent-typo', { placementIntent: 'new-materialisation' }, 'Placement Intent');
assertFieldDomainRejected('naming-authority-typo', { namingAuthority: 'target_shema' }, 'Naming Authority');
assertFieldDomainRejected('override-typo', { explicitOverrideAllowed: 'maybe' }, 'Explicit Override Allowed');
assertFieldDomainRejected('member-mapping-typo', { lifecycleMemberMapping: 'pairwize' }, 'Member Mapping');
assertFieldDomainRejected('generation-binding-prose', { generationBinding: 'not-a-reference' }, 'Generation Binding');

// Canonical Machine Shape proof through buildTransitionDefinitionRegistry(), not a Site regex.
const targetSchemaGeneration = read({ id: 'generation-target-schema', generationBinding: 'target-schema' });
assert.equal(targetSchemaGeneration.contractValidation.status, 'valid');
assert.equal(targetSchemaGeneration.canonicalReadQualified, true);

const markdownLinkGeneration = read({ id: 'generation-markdown-link', generationBinding: '[authority](../authority.md)' });
assert.equal(markdownLinkGeneration.contractValidation.status, 'valid');
assert.equal(markdownLinkGeneration.canonicalReadQualified, true);
assert.equal(markdownLinkGeneration.outputRoles[0].fields['Generation Binding'], '[authority](../authority.md)');

// Legitimate canonical unknown stays source-visible and is not a closed-domain violation.
const preservedUnknown = read({ id: 'preserved-unknown-target-kind', inputTargetKind: 'unknown' });
assert.equal(['valid', 'valid-with-preserved-unknowns'].includes(preservedUnknown.contractValidation.status), true);
assert.equal(preservedUnknown.diagnostics.some((finding) => finding.code === 'portable.contract.field-domain.value.invalid'), false);
assert.equal(preservedUnknown.inputRoles[0].fields['Target Kind'], 'unknown');

// Extension-authorized materialization operations remain extension candidates, not typo-normalized core values.
const extensionMarkdown = markdown({ id: 'materialization-extension' }).replace('  - Required Materialization Operation: create', '  - Required Materialization Operation: domain-specific-operation');
const extensionDefinition = buildTransitionDefinitionRegistry({
  records: [record(extensionMarkdown, 'materialization-extension')],
  schemaMaterials: [canonicalRootContract, transitionContract],
  resolvers
}).definitions[0];
assert.equal(extensionDefinition.contractValidation.status, 'unresolved');
assert.equal(extensionDefinition.canonicalReadQualified, false);
assert.equal(extensionDefinition.diagnostics.some((finding) => finding.code === 'portable.contract.field-domain.extension.unresolved'), true);
assert.equal(extensionDefinition.diagnostics.some((finding) => finding.code === 'portable.contract.field-domain.value.invalid'), false);

// Shape authority itself is fail-closed: absent, conflicting, or malformed definitions cannot qualify a link-shaped value.
const unresolvedShape = read({ id: 'shape-authority-unresolved', generationBinding: '[authority](../authority.md)' }, rootOrdinaryContract);
assert.equal(unresolvedShape.canonicalReadQualified, false);
assert.equal(unresolvedShape.contractValidation.status, 'unresolved');
assert.equal(unresolvedShape.diagnostics.some((finding) => finding.code === 'portable.contract.field-domain.shape.unresolved' || finding.code === 'portable.contract.field-domain.authority.unresolved'), true);

function duplicateMarkdownShape(machineShapeContract) {
  const declarationStart = machineShapeContract.indexOf('- Markdown Link\n');
  const rulesStart = machineShapeContract.indexOf('\nRules\n', declarationStart);
  assert.ok(declarationStart >= 0 && rulesStart > declarationStart);
  const declaration = machineShapeContract.slice(declarationStart, rulesStart).trimEnd();
  return `${machineShapeContract.slice(0, rulesStart).trimEnd()}\n${declaration}\n${machineShapeContract.slice(rulesStart)}`;
}

const conflictingShapeRoot = rootContractWithMachineShape(duplicateMarkdownShape(rootMachineShapeContract));
const conflictingShape = read({ id: 'shape-authority-conflicting', generationBinding: '[authority](../authority.md)' }, conflictingShapeRoot);
assert.equal(conflictingShape.canonicalReadQualified, false);
assert.equal(conflictingShape.contractValidation.status, 'unresolved');
assert.equal(conflictingShape.diagnostics.some((finding) => finding.code === 'portable.contract.field-domain.shape.unresolved'), true);

const malformedMachineShape = rootMachineShapeContract.replace(
  'Grammar Rule: markdown-link = "[" label "](" target ")"',
  'Grammar Rule: markdown-link = "[" label "](" target ")"??'
);
const malformedShape = read({ id: 'shape-authority-malformed', generationBinding: '[authority](../authority.md)' }, rootContractWithMachineShape(malformedMachineShape));
assert.equal(malformedShape.canonicalReadQualified, false);
assert.equal(malformedShape.contractValidation.status, 'unresolved');
assert.equal(malformedShape.diagnostics.some((finding) => finding.code === 'portable.contract.field-domain.shape.unresolved'), true);

// Existing frozen planners consume only definitions that have already survived the coherent read gate.
const topicRecord = Object.assign(createRecordFromMarkdown(`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-16 00:00:00\n\n---\n\n# Topic`, {
  path: '.topics/topic.trace.md', sourceMode: 'source-backed'
}), {
  id: 'topic', workspaceId: 'workspace', source: { id: 'docs', adapterId: 'github', repository: 'Tiinex/docs', ref: DOCS_REF, rootPath: '.topics' }, sourceTarget: { sourceArtifactPath: '.topics/topic.trace.md' }
});
const participants = buildLoadedArtifactParticipantIndex({ state: { workspaces: [{ id: 'workspace', records: [topicRecord] }] } });
const availability = buildCanonicalTransitionAvailability({ definition: valid, participantIndex: participants });
const result = buildCanonicalTransitionResultPlan({ definition: valid });
assert.equal(availability.executable, false);
assert.equal(result.executable, false);
assert.equal(result.readOnly, true);

// Source guards: Site consumes Tooling validation; no duplicate domain/Markdown-link authority was introduced.
for (const source of [registrySource, readProjectionSource, availabilitySource, availabilitySemanticsSource, resultSemanticsSource]) {
  assert.equal(/cretae-new|new-subjct|target_shema|new-materialisation|pairwize/.test(source), false, 'production Site source contains no field-domain typo table');
  assert.equal(/\^\\?\[.*\\]\(/.test(source), false, 'production Site source contains no Markdown-link regex authority');
}
assert.equal(registrySource.includes('projectPortableContractInstance'), true, 'registry remains on one coherent portable projection authority');
assert.equal(registrySource.includes('contractReadValid'), true, 'registry canonical gate continues to consume portable validation status');

console.log('postV420CanonicalFieldDomainMachineShapeReadIntegration: pass');
