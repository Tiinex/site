import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compilePortableSchemaContract, compilePortableSchemaContractChain } from './contract.compile.js';
import { validatePortableContractInstance } from './contract.validate.js';
import { projectPortableContractInstance } from './contract.project.js';
import { comparePortableSchemaSnapshots } from './schema.snapshot.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const transitionSchema = fs.readFileSync(path.join(here, 'fixtures/tiinex.transition.definition.v1.field-domain.contract-fixture.md'), 'utf8');
const rootMachineShapeSchema = fs.readFileSync(path.join(here, 'fixtures/tiinex.root.v1.machine-shape.contract-fixture.md'), 'utf8');
const ordinaryTargetAuthoritySchema = `# Continuity Context
- Current
  - Current Schema: example.ordinary-target-authority.v1
---
## Schema Validation Contract
### Ordinary Instance Field Targeting
Rules
- Unless an ordinary instance-field group declares \`Instance Target\`, its Artifact instance target is the exact second-level heading whose text equals the contract group name.
- Ordinary field occurrences are owned only by their authorized target block. Fields inside a nested heading or named-declaration-owned region are not claimed by an ancestor ordinary group merely because the label matches.
### Instance Target
Required Shape
- one literal Markdown heading token
Rules
- \`Instance Target\` is singular; it must not be used as a list of multiple Artifact targets.`;
const transitionCompiled = compilePortableSchemaContract(transitionSchema);
const transitionChainCompiled = compilePortableSchemaContractChain([rootMachineShapeSchema, transitionSchema]);
const fieldConstraints = transitionCompiled.constraints.filter((item) => item.kind === 'field-domain');

assert.equal(fieldConstraints.length, 19, 'canonical pressure fixture compiles every local/shared field-domain contribution');
assert.deepEqual(
  fieldConstraints.filter((item) => item.field === 'Target Kind').map((item) => [item.targetGroup, item.targetMode]),
  [['Input Role Declaration', 'shared'], ['Output Role Declaration', 'shared']],
  'shared Target Kind contribution compiles only to exact owning Applies To groups'
);
assert.equal(
  fieldConstraints.filter((item) => item.targetGroup === 'Parent Effect Declaration' && item.field === 'Member Mapping').length,
  2,
  'Parent Member Mapping retains shared + local narrowing as separate additive contributions'
);
assert.equal(
  fieldConstraints.some((item) => item.field === 'Generation Binding' && item.allowedShapes.includes('Markdown Link')),
  true,
  'Generation Binding preserves canonical Markdown Link shape authority'
);

const validTransition = `# Transition Instance

## Input Roles

- source
  - Meaning: source participant
  - Minimum Count: 1
  - Maximum Count: 1
  - Acquisition Policy: existing-only
  - Target Kind: artifact

## Output Roles

- task
  - Meaning: output participant
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-task
  - Target Binding: task
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create
  - Preserve Why: yes
  - Member Mapping: single

### Parent Effects

- set-parent
  - Target Binding: task
  - Effect: set
  - Member Mapping: single

## Relation Effects

- source-to-task
  - Effect: declare
  - Subject Binding: source
  - Predicate Identifier: derived-to
  - Predicate Meaning: source derives to task
  - Object Binding: task
  - Directionality: directed
  - Member Mapping: all-to-all

## Placement Intent

### Destination Bindings

- destination-root
  - Meaning: destination root
  - Required: yes

### Output Placements

- task-placement
  - Output Binding: task
  - Placement Intent: new-materialization
  - Naming Authority: target-schema
  - Explicit Override Allowed: no
`;

function replaceOne(markdown, from, to) {
  assert.equal(markdown.includes(from), true, `fixture contains ${from}`);
  return markdown.replace(from, to);
}

function validateTransition(markdown) {
  return validatePortableContractInstance({ markdown, compiledContract: transitionChainCompiled });
}

function projectTransition(markdown) {
  return projectPortableContractInstance({ markdown, compiledContract: transitionChainCompiled });
}

let result = validateTransition(validTransition);
assert.equal(result.status, 'valid');
assert.equal(result.fieldDomains.groups.length > 0, true);
assert.equal(projectTransition(validTransition).validation.status, 'valid', 'coherent read projection carries field-domain validation');

const invalidCases = [
  ['Lifecycle Effect typo', '  - Effect: create-new', '  - Effect: cretae-new'],
  ['Lifecycle Effect case mismatch', '  - Effect: create-new', '  - Effect: Create-new'],
  ['Lifecycle Effect cross-field label', '  - Effect: create-new', '  - Effect: pairwise'],
  ['Logical Continuity typo', '  - Logical Continuity: new-subject', '  - Logical Continuity: new-subjct'],
  ['Preserve Why typo', '  - Preserve Why: yes', '  - Preserve Why: maybe'],
  ['Parent Effect typo', '  - Effect: set', '  - Effect: sett'],
  ['Parent Effect cross-field label', '  - Effect: set', '  - Effect: pairwise'],
  ['Parent local Member Mapping narrowing', '  - Member Mapping: single\n\n## Relation Effects', '  - Member Mapping: all-to-all\n\n## Relation Effects'],
  ['Relation Effect typo', '  - Effect: declare', '  - Effect: declrae'],
  ['Relation Effect cross-field label', '  - Effect: declare', '  - Effect: pairwise'],
  ['Directionality typo', '  - Directionality: directed', '  - Directionality: sideways'],
  ['Directionality cross-field label', '  - Directionality: directed', '  - Directionality: declare'],
  ['Destination Required typo', '  - Required: yes', '  - Required: maybe'],
  ['Placement Intent typo', '  - Placement Intent: new-materialization', '  - Placement Intent: new-materialisation'],
  ['Naming Authority typo', '  - Naming Authority: target-schema', '  - Naming Authority: target_shema'],
  ['Explicit Override Allowed typo', '  - Explicit Override Allowed: no', '  - Explicit Override Allowed: maybe'],
  ['Generation Binding arbitrary prose', '  - Generation Binding: target-schema', '  - Generation Binding: not-a-reference'],
  ['Member Mapping typo', '  - Member Mapping: single\n\n### Parent Effects', '  - Member Mapping: pairwize\n\n### Parent Effects']
];

for (const [label, from, to] of invalidCases) {
  const markdown = replaceOne(validTransition, from, to);
  const validation = validateTransition(markdown);
  const projection = projectTransition(markdown);
  assert.notEqual(validation.status, 'valid', label);
  assert.notEqual(validation.status, 'valid-with-preserved-unknowns', label);
  assert.equal(validation.findings.some((item) => item.code === 'portable.contract.field-domain.value.invalid'), true, `${label}: field-domain finding`);
  assert.equal(projection.validation.status, validation.status, `${label}: coherent read path sees same failure`);
}

// Positive canonical cases.
for (const markdown of [
  validTransition,
  replaceOne(validTransition, '  - Target Kind: artifact\n  - Generation Binding', '  - Target Kind: unknown\n  - Generation Binding'),
  replaceOne(validTransition, '  - Generation Binding: target-schema', '  - Generation Binding: [authority](../authority.md)'),
  replaceOne(validTransition, '  - Directionality: directed', '  - Directionality: undirected'),
  replaceOne(validTransition, '  - Required Materialization Operation: create', '  - Required Materialization Operation: restore')
]) {
  const validation = validateTransition(markdown);
  assert.equal(['valid', 'valid-with-preserved-unknowns'].includes(validation.status), true, `positive case remains valid: ${validation.status}`);
  assert.equal(validation.findings.some((item) => item.code === 'portable.contract.field-domain.value.invalid'), false);
}

// Relation all-to-all is legal under the shared Member Mapping contribution.
result = validateTransition(validTransition);
const relationMapping = result.fieldDomains.groups.find((item) => item.group === 'Relation Effect Declaration' && item.field === 'Member Mapping');
assert.equal(relationMapping.occurrences[0].qualification, 'core');

// Extension-authorized values remain unresolved candidates; unknown is not an escape hatch.
let extensionMarkdown = replaceOne(validTransition, '  - Required Materialization Operation: create', '  - Required Materialization Operation: domain-specific-op');
result = validateTransition(extensionMarkdown);
assert.equal(result.status, 'unresolved');
assert.equal(result.findings.some((item) => item.code === 'portable.contract.field-domain.extension.unresolved'), true);
assert.equal(result.fieldDomains.groups.find((item) => item.field === 'Required Materialization Operation').occurrences[0].qualification, 'extension-candidate');
assert.equal(projectTransition(extensionMarkdown).validation.status, 'unresolved');

extensionMarkdown = replaceOne(validTransition, '  - Required Materialization Operation: create', '  - Required Materialization Operation: unknown');
result = validateTransition(extensionMarkdown);
assert.equal(result.status, 'structurally-invalid');
assert.equal(result.findings.some((item) => item.code === 'portable.contract.field-domain.value.invalid'), true);
assert.equal(result.findings.some((item) => item.code === 'portable.contract.field-domain.extension.unresolved'), false);

// Generic non-Transition proof: no schema IDs, field names, or Allowed Labels heuristics.
const genericSchema = `# Continuity Context

- Parent
  - Parent Schema: tiinex.root.v1
- Current
  - Current Schema: example.science.field-domain.v1

---

# Science Field Domains

## Schema Validation Contract

### Specimen Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Specimen State
- Measurement Unit
- Coordinate Reference
- Notes

Field Value Constraints

- Specimen State
  - Allowed Value: fresh
  - Allowed Value: frozen
  - Allowed Value: unknown
  - Domain Policy: closed

- Measurement Unit
  - Allowed Value: SI
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

- Coordinate Reference
  - Allowed Value: WGS84
  - Domain Policy: extension-authorized

Rules

- Entries under \`## Specimens\` are repeated named declarations using this shape.
`;
const genericCompiled = compilePortableSchemaContractChain([rootMachineShapeSchema, genericSchema]);
assert.equal(genericCompiled.constraints.filter((item) => item.kind === 'field-domain').length, 3);
const genericBase = `# Science

## Specimens

- sample-a
  - Specimen State: fresh
  - Measurement Unit: [metre](../units/metre.md)
  - Coordinate Reference: WGS84
  - Notes: free human prose remains unconstrained
`;
assert.equal(validatePortableContractInstance({ markdown: genericBase, compiledContract: genericCompiled }).status, 'valid');
assert.equal(validatePortableContractInstance({ markdown: replaceOne(genericBase, 'Specimen State: fresh', 'Specimen State: stale-ish'), compiledContract: genericCompiled }).status, 'structurally-invalid');
assert.equal(validatePortableContractInstance({ markdown: replaceOne(genericBase, 'Coordinate Reference: WGS84', 'Coordinate Reference: lab-grid-17'), compiledContract: genericCompiled }).status, 'unresolved');
assert.equal(validatePortableContractInstance({ markdown: replaceOne(genericBase, 'Coordinate Reference: WGS84', 'Coordinate Reference: unknown'), compiledContract: genericCompiled }).status, 'structurally-invalid');
assert.equal(validatePortableContractInstance({ markdown: replaceOne(genericBase, 'Notes: free human prose remains unconstrained', 'Notes: arbitrary: punctuation / prose is still free'), compiledContract: genericCompiled }).status, 'valid');

// Absence of Field Value Constraints does not infer a domain from Allowed Labels.
const allowedLabelsOnly = compilePortableSchemaContract(`# Continuity Context\n- Current\n  - Current Schema: example.labels-only.v1\n---\n## Schema Validation Contract\n### Thing Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- State\nAllowed Labels\n- alpha\n- beta\nRules\n- Entries under \`## Things\` are repeated named declarations using this shape.`);
assert.equal(allowedLabelsOnly.constraints.some((item) => item.kind === 'field-domain'), false);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - State: anything-at-all', compiledContract: allowedLabelsOnly }).status, 'valid');

// Unsupported Allowed Shape authority remains unresolved; English labels are not guessed.
const unknownShapeSchema = compilePortableSchemaContract(`# Continuity Context\n- Current\n  - Current Schema: example.unknown-shape.v1\n---\n## Schema Validation Contract\n### Thing Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Pointer\nField Value Constraints\n- Pointer\n  - Allowed Shape: Galactic Pointer\n  - Domain Policy: closed\nRules\n- Entries under \`## Things\` are repeated named declarations using this shape.`);
result = validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Pointer: gp://x', compiledContract: unknownShapeSchema });
assert.equal(result.status, 'unresolved');
assert.equal(result.findings.some((item) => item.code === 'portable.contract.field-domain.shape.unresolved'), true);

// Shared authority is all-or-nothing: never compile a partial Applies To subset.
const partialShared = compilePortableSchemaContract(`# Continuity Context\n- Current\n  - Current Schema: example.partial-shared.v1\n---\n## Schema Validation Contract\n### A Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Kind\nRules\n- Entries under \`## As\` are repeated named declarations using this shape.\n### B Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Other\nRules\n- Entries under \`## Bs\` are repeated named declarations using this shape.\n### Kind Semantics\nApplies To\n- A Declaration\n- B Declaration\nField Value Constraints\n- Kind\n  - Allowed Value: x\n  - Domain Policy: closed`);
const partial = partialShared.constraints.filter((item) => item.kind === 'field-domain');
assert.equal(partial.length, 1);
assert.equal(partial[0].targetGroup, '');
assert.equal(partial[0].authorityQualification, 'unresolved');
result = validatePortableContractInstance({ markdown: '# A\n\n## As\n\n- one\n  - Kind: x', compiledContract: partialShared });
assert.equal(result.status, 'unresolved');
assert.equal(result.findings.some((item) => item.code === 'portable.contract.field-domain.authority.unresolved'), true);

// Local field ownership wins even when the group also has Applies To for unrelated semantics.
const localWithApplies = compilePortableSchemaContract(`# Continuity Context\n- Current\n  - Current Schema: example.local-applies.v1\n---\n## Schema Validation Contract\n### A Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Kind\nApplies To\n- B Declaration\nField Value Constraints\n- Kind\n  - Allowed Value: x\n  - Domain Policy: closed\nRules\n- Entries under \`## As\` are repeated named declarations using this shape.\n### B Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Kind\nRules\n- Entries under \`## Bs\` are repeated named declarations using this shape.`);
const localConstraint = localWithApplies.constraints.find((item) => item.kind === 'field-domain');
assert.equal(localConstraint.targetMode, 'local');
assert.equal(localConstraint.targetGroup, 'A Declaration');

// Declaration-shape integrity is fail-closed.

// Shared constraints can resolve against an inherited target only once the full lineage is supplied.
const inheritedTargetParent = `# Continuity Context\n- Current\n  - Current Schema: example.inherited-target-parent.v1\n---\n## Schema Validation Contract\n### Thing Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Kind\nRules\n- Entries under \`## Things\` are repeated named declarations using this shape.`;
const inheritedSharedChild = `# Continuity Context\n- Parent\n  - Parent Schema: example.inherited-target-parent.v1\n- Current\n  - Current Schema: example.inherited-shared-child.v1\n---\n## Schema Validation Contract\n### Kind Semantics\nApplies To\n- Thing Declaration\nField Value Constraints\n- Kind\n  - Allowed Value: alpha\n  - Domain Policy: closed`;
const childAlone = compilePortableSchemaContract(inheritedSharedChild);
assert.equal(childAlone.constraints.find((item) => item.kind === 'field-domain').authorityQualification, 'unresolved');
const inheritedSharedChain = compilePortableSchemaContractChain([inheritedTargetParent, inheritedSharedChild]);
const inheritedResolved = inheritedSharedChain.constraints.find((item) => item.kind === 'field-domain');
assert.equal(inheritedResolved.authorityQualification, 'valid');
assert.equal(inheritedResolved.targetGroup, 'Thing Declaration');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Kind: alpha', compiledContract: inheritedSharedChain }).status, 'valid');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Kind: beta', compiledContract: inheritedSharedChain }).status, 'structurally-invalid');

const malformedAuthority = compilePortableSchemaContract(`# Continuity Context\n- Current\n  - Current Schema: example.bad-authority.v1\n---\n## Schema Validation Contract\n### Thing Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- State\nField Value Constraints\n- State\n  - Allowed Value: x\n  - Domain Policy: closed\n  - Domain Policy: extension-authorized\nRules\n- Entries under \`## Things\` are repeated named declarations using this shape.`);
assert.equal(malformedAuthority.constraints.find((item) => item.kind === 'field-domain').authorityQualification, 'structurally-invalid');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - State: x', compiledContract: malformedAuthority }).status, 'structurally-invalid');

// Additive parent/child contributions are AND obligations with source provenance retained.
const parentSchema = `# Continuity Context\n- Current\n  - Current Schema: example.parent-domain.v1\n---\n## Schema Validation Contract\n### Thing Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Mode\nField Value Constraints\n- Mode\n  - Allowed Value: a\n  - Allowed Value: b\n  - Allowed Value: c\n  - Domain Policy: closed\nRules\n- Entries under \`## Things\` are repeated named declarations using this shape.`;
const childSchema = `# Continuity Context\n- Parent\n  - Parent Schema: example.parent-domain.v1\n- Current\n  - Current Schema: example.child-domain.v1\n---\n## Schema Validation Contract\n### Thing Declaration\nEntry Shape\n- First-Level Hyphen List Item\nRequired Fields\n- Mode\nField Value Constraints\n- Mode\n  - Allowed Value: a\n  - Allowed Value: b\n  - Domain Policy: closed\nRules\n- Entries under \`## Things\` are repeated named declarations using this shape.`;
const chain = compilePortableSchemaContractChain([parentSchema, childSchema]);
const chainDomains = chain.constraints.filter((item) => item.kind === 'field-domain' && item.targetGroup === 'Thing Declaration' && item.field === 'Mode');
assert.equal(chainDomains.length, 2);
assert.deepEqual(chainDomains.map((item) => item.sourceSchemaId), ['example.parent-domain.v1', 'example.child-domain.v1']);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: a', compiledContract: chain }).status, 'valid');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: c', compiledContract: chain }).status, 'structurally-invalid', 'wider parent value is narrowed by child contribution');

const conflictingChild = childSchema.replace('- Allowed Value: a\n  - Allowed Value: b', '- Allowed Value: d').replace('example.child-domain.v1', 'example.conflicting-domain.v1');
const conflictChain = compilePortableSchemaContractChain([parentSchema, conflictingChild]);
result = validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: a', compiledContract: conflictChain });
assert.equal(result.status, 'contradictory');
assert.equal(result.findings.some((item) => item.code === 'portable.contract.field-domain.authority.unsatisfiable'), true);



// Descendant narrowing may rely on inherited same-group field ownership without restating fields.
const inheritedLocalParent = `# Continuity Context
- Current
  - Current Schema: example.inherited-local-parent.v1
---
## Schema Validation Contract
### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Required Fields
- Mode
Field Value Constraints
- Mode
  - Allowed Value: a
  - Allowed Value: b
  - Allowed Value: c
  - Domain Policy: closed
Rules
- Entries under \`## Things\` are repeated named declarations using this shape.`;
const inheritedLocalChild = `# Continuity Context
- Parent
  - Parent Schema: example.inherited-local-parent.v1
- Current
  - Current Schema: example.inherited-local-child.v1
---
## Schema Validation Contract
### Thing Declaration
Field Value Constraints
- Mode
  - Allowed Value: a
  - Allowed Value: b
  - Domain Policy: closed`;
const inheritedLocalChildAlone = compilePortableSchemaContract(inheritedLocalChild);
const inheritedLocalChildConstraint = inheritedLocalChildAlone.constraints.find((item) => item.kind === 'field-domain');
assert.equal(inheritedLocalChildConstraint.authorityQualification, 'unresolved', 'child alone cannot prove inherited local ownership');
assert.equal(inheritedLocalChildConstraint.targetGroup, '');
const inheritedLocalChain = compilePortableSchemaContractChain([inheritedLocalParent, inheritedLocalChild]);
const inheritedLocalDomains = inheritedLocalChain.constraints.filter((item) => item.kind === 'field-domain' && item.field === 'Mode');
assert.equal(inheritedLocalDomains.length, 2);
assert.deepEqual(inheritedLocalDomains.map((item) => item.sourceSchemaId), ['example.inherited-local-parent.v1', 'example.inherited-local-child.v1']);
assert.deepEqual(inheritedLocalDomains.map((item) => item.targetMode), ['local', 'local']);
assert.deepEqual(inheritedLocalDomains.map((item) => item.targetOwnership), ['source-local', 'inherited-local']);
assert.deepEqual(inheritedLocalDomains.map((item) => item.targetGroup), ['Thing Declaration', 'Thing Declaration']);
assert.deepEqual(inheritedLocalDomains[1].ownershipSourceSchemaIds, ['example.inherited-local-parent.v1']);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: a', compiledContract: inheritedLocalChain }).status, 'valid');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: c', compiledContract: inheritedLocalChain }).status, 'structurally-invalid');

// The same lineage-aware local ownership rule applies to ordinary fields.
const inheritedOrdinaryParent = `# Continuity Context
- Parent
  - Parent Schema: example.ordinary-target-authority.v1
- Current
  - Current Schema: example.inherited-ordinary-parent.v1
---
## Schema Validation Contract
### Example Body
Required Shape
- \`## Sample\` section
### Sample
Required Fields
- State
Field Value Constraints
- State
  - Allowed Value: a
  - Allowed Value: b
  - Domain Policy: closed`;
const inheritedOrdinaryChild = `# Continuity Context
- Parent
  - Parent Schema: example.inherited-ordinary-parent.v1
- Current
  - Current Schema: example.inherited-ordinary-child.v1
---
## Schema Validation Contract
### Sample
Field Value Constraints
- State
  - Allowed Value: a
  - Domain Policy: closed`;
const inheritedOrdinaryChain = compilePortableSchemaContractChain([ordinaryTargetAuthoritySchema, inheritedOrdinaryParent, inheritedOrdinaryChild]);
const inheritedOrdinaryDomains = inheritedOrdinaryChain.constraints.filter((item) => item.kind === 'field-domain' && item.field === 'State');
assert.equal(inheritedOrdinaryDomains.length, 2);
assert.deepEqual(inheritedOrdinaryDomains.map((item) => item.targetOwnership), ['source-local', 'inherited-local']);
assert.deepEqual(inheritedOrdinaryDomains[1].ownershipSourceSchemaIds, ['example.inherited-ordinary-parent.v1']);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Sample\n\n- State: a', compiledContract: inheritedOrdinaryChain }).status, 'valid');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Sample\n\n- State: b', compiledContract: inheritedOrdinaryChain }).status, 'structurally-invalid');

// Optional inherited ownership is also local once the full chain proves it.
const inheritedOptionalParent = inheritedOrdinaryParent
  .replace('example.inherited-ordinary-parent.v1', 'example.inherited-optional-parent.v1')
  .replace('Required Shape\n- \`## Sample\` section', 'Optional Sections\n- Sample')
  .replace('Required Fields\n- State', 'Optional Fields\n- State');
const inheritedOptionalChild = inheritedOrdinaryChild
  .replace('example.inherited-ordinary-parent.v1', 'example.inherited-optional-parent.v1')
  .replace('example.inherited-ordinary-child.v1', 'example.inherited-optional-child.v1');
const inheritedOptionalChain = compilePortableSchemaContractChain([ordinaryTargetAuthoritySchema, inheritedOptionalParent, inheritedOptionalChild]);
const inheritedOptionalDomains = inheritedOptionalChain.constraints.filter((item) => item.kind === 'field-domain' && item.field === 'State');
assert.deepEqual(inheritedOptionalDomains.map((item) => item.targetOwnership), ['source-local', 'inherited-local']);
assert.deepEqual(inheritedOptionalDomains[1].ownershipSourceSchemaIds, ['example.inherited-optional-parent.v1']);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Sample\n\n- State: a', compiledContract: inheritedOptionalChain }).status, 'valid');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Sample\n\n- State: b', compiledContract: inheritedOptionalChain }).status, 'structurally-invalid');


// Duplicate exact same-name ancestor contract groups must not be guessed through for inherited-local ownership.
const duplicateInheritedParent = `# Continuity Context
- Current
  - Current Schema: example.duplicate-inherited-parent.v1
---
## Schema Validation Contract
### Thing Declaration
Required Fields
- Mode
### Thing Declaration
Rules
- duplicate exact group identity`;
const duplicateInheritedChild = `# Continuity Context
- Parent
  - Parent Schema: example.duplicate-inherited-parent.v1
- Current
  - Current Schema: example.duplicate-inherited-child.v1
---
## Schema Validation Contract
### Thing Declaration
Field Value Constraints
- Mode
  - Allowed Value: a
  - Domain Policy: closed`;
const duplicateInheritedChain = compilePortableSchemaContractChain([duplicateInheritedParent, duplicateInheritedChild]);
const duplicateInheritedConstraint = duplicateInheritedChain.constraints.find((item) => item.kind === 'field-domain');
assert.equal(duplicateInheritedConstraint.targetOwnership, 'unresolved');
assert.equal(duplicateInheritedConstraint.authorityQualification, 'unresolved');
assert.equal(duplicateInheritedConstraint.authorityFindings.some((item) => item.includes('resolves to 2 exact groups')), true);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: a', compiledContract: duplicateInheritedChain }).status, 'unresolved');

// Negative control: exact field ownership in another group does not make the declaring group local.
const inheritedNegativeChild = `# Continuity Context
- Parent
  - Parent Schema: example.inherited-local-parent.v1
- Current
  - Current Schema: example.inherited-negative-child.v1
---
## Schema Validation Contract
### Other Semantics
Field Value Constraints
- Mode
  - Allowed Value: a
  - Domain Policy: closed`;
const inheritedNegativeChain = compilePortableSchemaContractChain([inheritedLocalParent, inheritedNegativeChild]);
const inheritedNegativeConstraint = inheritedNegativeChain.constraints.find((item) => item.kind === 'field-domain' && item.sourceSchemaId === 'example.inherited-negative-child.v1');
assert.equal(inheritedNegativeConstraint.targetGroup, '');
assert.equal(inheritedNegativeConstraint.authorityQualification, 'unresolved');
assert.equal(inheritedNegativeConstraint.targetOwnership, 'unresolved');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: a', compiledContract: inheritedNegativeChain }).status, 'unresolved');

// Shared Applies To remains shared when the declaring group itself does not own the field after composition.
const inheritedSharedOwnership = inheritedSharedChain.constraints.find((item) => item.kind === 'field-domain' && item.sourceSchemaId === 'example.inherited-shared-child.v1');
assert.equal(inheritedSharedOwnership.targetMode, 'shared');
assert.equal(inheritedSharedOwnership.targetOwnership, 'shared-applies-to');
assert.equal(inheritedSharedOwnership.targetGroup, 'Thing Declaration');


// Shared Applies To authority is evaluated at the contribution source point, never against future descendants.
const retroactiveSharedParent = `# Continuity Context
- Current
  - Current Schema: example.shared-source-parent.v1
---
## Schema Validation Contract
### Kind Semantics
Applies To
- Thing Declaration
Field Value Constraints
- Kind
  - Allowed Value: alpha
  - Domain Policy: closed
### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Rules
- Entries under \`## Things\` are repeated named declarations using this shape.`;
const retroactiveSharedChild = `# Continuity Context
- Parent
  - Parent Schema: example.shared-source-parent.v1
- Current
  - Current Schema: example.shared-source-child.v1
---
## Schema Validation Contract
### Thing Declaration
Required Fields
- Kind`;
const retroactiveParentCompiled = compilePortableSchemaContract(retroactiveSharedParent);
const retroactiveParentConstraint = retroactiveParentCompiled.constraints.find((item) => item.kind === 'field-domain');
assert.equal(retroactiveParentConstraint.authorityQualification, 'unresolved', 'ancestor shared authority is unresolved before a descendant adds target ownership');
const retroactiveSharedChain = compilePortableSchemaContractChain([retroactiveSharedParent, retroactiveSharedChild]);
const retroactiveChainConstraint = retroactiveSharedChain.constraints.find((item) => item.kind === 'field-domain' && item.sourceSchemaId === 'example.shared-source-parent.v1');
assert.equal(retroactiveChainConstraint.targetOwnership, 'unresolved');
assert.equal(retroactiveChainConstraint.authorityQualification, 'unresolved');
assert.equal(retroactiveChainConstraint.targetGroup, '');
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Kind: alpha', compiledContract: retroactiveSharedChain }).status, 'unresolved');

// A descendant shared contribution may target ownership already visible in an ancestor.
assert.deepEqual(inheritedSharedOwnership.targetOwnershipSourceSchemaIds, ['example.inherited-target-parent.v1']);

// A descendant shared contribution may also target ownership introduced in that same descendant source.
const sameSourceSharedParent = `# Continuity Context
- Current
  - Current Schema: example.same-source-shared-parent.v1
---
## Schema Validation Contract
### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Rules
- Entries under \`## Things\` are repeated named declarations using this shape.`;
const sameSourceSharedChild = `# Continuity Context
- Parent
  - Parent Schema: example.same-source-shared-parent.v1
- Current
  - Current Schema: example.same-source-shared-child.v1
---
## Schema Validation Contract
### Thing Declaration
Required Fields
- Kind
### Kind Semantics
Applies To
- Thing Declaration
Field Value Constraints
- Kind
  - Allowed Value: alpha
  - Domain Policy: closed`;
const sameSourceSharedChain = compilePortableSchemaContractChain([sameSourceSharedParent, sameSourceSharedChild]);
const sameSourceSharedConstraint = sameSourceSharedChain.constraints.find((item) => item.kind === 'field-domain');
assert.equal(sameSourceSharedConstraint.targetMode, 'shared');
assert.equal(sameSourceSharedConstraint.targetOwnership, 'shared-applies-to');
assert.equal(sameSourceSharedConstraint.authorityQualification, 'valid');
assert.deepEqual(sameSourceSharedConstraint.targetOwnershipSourceSchemaIds, ['example.same-source-shared-child.v1']);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Kind: alpha', compiledContract: sameSourceSharedChain }).status, 'valid');

// Source-point ambiguity remains unresolved when chain composition merges same-named groups.
const ambiguousSharedSource = `# Continuity Context
- Current
  - Current Schema: example.shared-source-ambiguous.v1
---
## Schema Validation Contract
### Thing Declaration
Required Fields
- Kind
### Thing Declaration
Required Fields
- Kind
### Kind Semantics
Applies To
- Thing Declaration
Field Value Constraints
- Kind
  - Allowed Value: alpha
  - Domain Policy: closed`;
const ambiguousSharedCompiled = compilePortableSchemaContract(ambiguousSharedSource);
assert.equal(ambiguousSharedCompiled.constraints.find((item) => item.kind === 'field-domain').authorityQualification, 'unresolved');
const ambiguousSharedChain = compilePortableSchemaContractChain([ambiguousSharedSource]);
const ambiguousSharedChainConstraint = ambiguousSharedChain.constraints.find((item) => item.kind === 'field-domain');
assert.equal(ambiguousSharedChainConstraint.targetOwnership, 'unresolved');
assert.equal(ambiguousSharedChainConstraint.authorityQualification, 'unresolved');
assert.equal(ambiguousSharedChainConstraint.authorityFindings.some((item) => item.includes('resolves to 2 contract groups')), true);

// Shared multi-target ownership is all-or-nothing at the contribution source point.
const multiTargetSharedParent = `# Continuity Context
- Current
  - Current Schema: example.multi-target-shared-parent.v1
---
## Schema Validation Contract
### A Declaration
Required Fields
- Kind
### B Declaration
Required Fields
- Other
### Kind Semantics
Applies To
- A Declaration
- B Declaration
Field Value Constraints
- Kind
  - Allowed Value: alpha
  - Domain Policy: closed`;
const multiTargetSharedChild = `# Continuity Context
- Parent
  - Parent Schema: example.multi-target-shared-parent.v1
- Current
  - Current Schema: example.multi-target-shared-child.v1
---
## Schema Validation Contract
### B Declaration
Required Fields
- Kind`;
const multiTargetSharedChain = compilePortableSchemaContractChain([multiTargetSharedParent, multiTargetSharedChild]);
const multiTargetSharedConstraint = multiTargetSharedChain.constraints.find((item) => item.kind === 'field-domain' && item.sourceSchemaId === 'example.multi-target-shared-parent.v1');
assert.equal(multiTargetSharedConstraint.targetOwnership, 'unresolved');
assert.equal(multiTargetSharedConstraint.authorityQualification, 'unresolved');
assert.equal(multiTargetSharedChain.constraints.filter((item) => item.kind === 'field-domain' && item.sourceSchemaId === 'example.multi-target-shared-parent.v1').length, 1, 'no partial shared target subset is emitted');

// `unknown` must satisfy every applicable contribution; one omission makes it invalid.
const unknownParent = parentSchema.replace('- Allowed Value: a\n  - Allowed Value: b\n  - Allowed Value: c', '- Allowed Value: a\n  - Allowed Value: b\n  - Allowed Value: unknown');
const unknownChild = childSchema.replace('- Allowed Value: a\n  - Allowed Value: b', '- Allowed Value: a\n  - Allowed Value: b\n  - Allowed Value: unknown');
const unknownAllowedChain = compilePortableSchemaContractChain([unknownParent, unknownChild]);
assert.equal(validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: unknown', compiledContract: unknownAllowedChain }).status, 'valid-with-preserved-unknowns');
const unknownRejectedChain = compilePortableSchemaContractChain([unknownParent, childSchema]);
result = validatePortableContractInstance({ markdown: '# A\n\n## Things\n\n- one\n  - Mode: unknown', compiledContract: unknownRejectedChain });
assert.equal(result.status, 'structurally-invalid');
assert.equal(result.findings.some((item) => item.code === 'portable.contract.field-domain.value.invalid'), true);

// Declaration properties are one level deep; extra nested content is not silently ignored.
const nestedAuthority = compilePortableSchemaContract(`# Continuity Context
- Current
  - Current Schema: example.nested-authority.v1
---
## Schema Validation Contract
### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Required Fields
- State
Field Value Constraints
- State
  - Allowed Value: x
    - Alias: y
  - Domain Policy: closed
Rules
- Entries under \`## Things\` are repeated named declarations using this shape.`);
assert.equal(nestedAuthority.constraints.find((item) => item.kind === 'field-domain').authorityQualification, 'structurally-invalid');

// Snapshot freshness preserves Field Value Constraints hierarchy while keeping sibling order non-semantic.
const snapshotA = `# Continuity Context
- Current
  - Current Schema: example.snapshot-domain.v1
---
## Schema Validation Contract
### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Required Fields
- A
- B
Field Value Constraints
- A
  - Allowed Value: x
  - Domain Policy: closed
- B
  - Allowed Value: y
  - Domain Policy: closed`;
const snapshotReordered = `# Continuity Context
- Current
  - Current Schema: example.snapshot-domain.v1
---
## Schema Validation Contract
### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Required Fields
- B
- A
Field Value Constraints
- B
  - Domain Policy: closed
  - Allowed Value: y
- A
  - Domain Policy: closed
  - Allowed Value: x`;
const snapshotRebound = snapshotA.replace('- A\n  - Allowed Value: x', '- A\n  - Allowed Value: y').replace('- B\n  - Allowed Value: y', '- B\n  - Allowed Value: x');
assert.equal(comparePortableSchemaSnapshots({ candidate: { markdown: snapshotA }, reference: { markdown: snapshotReordered } }).status, 'equivalent-current');
assert.equal(comparePortableSchemaSnapshots({ candidate: { markdown: snapshotA }, reference: { markdown: snapshotRebound } }).status, 'materially-stale', 'same flattened items with different field ownership remains materially stale');

console.log('✓ portable field-domain compiler/validator enforces scoped values, shapes, extensions, and additive provenance');
