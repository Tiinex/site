import assert from 'node:assert/strict';
import { compilePortableSchemaContractChain } from './contract.compile.js';
import { validatePortableContractInstance } from './contract.validate.js';
import { projectPortableContractInstance } from './contract.project.js';

const ROOT_AUTHORITY = `### Ordinary Instance Field Targeting

Applies To

- descendant \`Schema Validation Contract\` groups that declare \`Required Fields\` and/or \`Optional Fields\`

Rules

- An ordinary instance-field group declares \`Required Fields\` and/or \`Optional Fields\`, does not declare \`Entry Shape\`, and uses ordinary unqualified field labels.
- Unless an ordinary instance-field group declares \`Instance Target\`, its Artifact instance target is the exact second-level heading whose text equals the contract group name.
- Ordinary field occurrences are owned only by their authorized target block. Fields inside a nested heading or named-declaration-owned region are not claimed by an ancestor ordinary group merely because the label matches.

### Instance Target

Applies To

- ordinary instance-field contract groups that intentionally target a heading other than Root's same-name default

Required Shape

- one literal Markdown heading token

Rules

- \`Instance Target\` is singular; it must not be used as a list of multiple Artifact targets.
- Heading text is interpreted using Root exact, case-sensitive heading matching.
- \`Instance Target\` changes field-ownership location only; it does not make an otherwise optional target section required.`;

function schema({ id, parent = '', validation = '' }) {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: ${id}
  - Created At: 2026-08-16 00:00:00
${parent ? `- Parent\n  - Parent Schema: ${parent}\n  - Trace: parent.md\n  - Origin: parent.md\n` : ''}
---

# ${id}

## Schema Validation Contract

${validation.trim()}
`;
}

const root = schema({ id: 'example.root.v1', validation: ROOT_AUTHORITY });

function compileChild(validation, id = 'example.child.v1') {
  const child = schema({ id, parent: 'example.root.v1', validation });
  return compilePortableSchemaContractChain([root, child]);
}

// 1, 4, 5, 6: same-name target success, wrong-block rejection, required/optional field semantics.
let compiled = compileChild(`### Body

Required Sections

- Applicability And Conditions

### Applicability And Conditions

Required Fields

- Applicability Meaning

Optional Fields

- Condition
- Condition Reference`);
let ordinary = compiled.validation.ordinaryGroups.find((group) => group.group === 'Applicability And Conditions');
assert.equal(ordinary.target.heading, '## Applicability And Conditions');
assert.equal(ordinary.target.authority, 'root-same-name-default');
assert.equal(ordinary.target.requiredness, 'required');

let markdown = `# Artifact

## Applicability And Conditions

- Applicability Meaning: always
- Condition: local-condition
`;
let result = projectPortableContractInstance({ markdown, compiledContract: compiled });
let projected = result.ordinaryGroups.find((group) => group.group === 'Applicability And Conditions');
assert.equal(projected.target.present, true);
assert.equal(field(projected, 'Applicability Meaning').qualification, 'present');
assert.equal(field(projected, 'Applicability Meaning').occurrences[0].value, 'always');
assert.equal(field(projected, 'Condition').qualification, 'present');
assert.equal(field(projected, 'Condition Reference').qualification, 'absent');

markdown = `# Artifact

## Applicability And Conditions

## Authoring Bindings

- Applicability Meaning: misplaced
`;
result = projectPortableContractInstance({ markdown, compiledContract: compiled });
projected = result.ordinaryGroups.find((group) => group.group === 'Applicability And Conditions');
assert.equal(field(projected, 'Applicability Meaning').qualification, 'missing-required');
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.required.missing'), true);

// Condition + Condition Reference stay separately visible; no execution/preference is introduced.
markdown = `# Artifact

## Applicability And Conditions

- Applicability Meaning: context dependent
- Condition: readable local expression
- Condition Reference: condition-alpha
`;
result = projectPortableContractInstance({ markdown, compiledContract: compiled });
projected = result.ordinaryGroups.find((group) => group.group === 'Applicability And Conditions');
assert.equal(field(projected, 'Condition').occurrences[0].value, 'readable local expression');
assert.equal(field(projected, 'Condition Reference').occurrences[0].value, 'condition-alpha');

// 2: explicit singular Instance Target.
compiled = compileChild(`### Body

Required Sections

- Custom Block

### Logical Name

Instance Target

- ## Custom Block

Required Fields

- Meaning`);
ordinary = compiled.validation.ordinaryGroups.find((group) => group.group === 'Logical Name');
assert.equal(ordinary.target.heading, '## Custom Block');
assert.equal(ordinary.target.authority, 'explicit-instance-target');
result = projectPortableContractInstance({ markdown: '# A\n\n## Custom Block\n\n- Meaning: explicit\n', compiledContract: compiled });
assert.equal(field(result.ordinaryGroups[0], 'Meaning').qualification, 'present');

// 2b: committed Root permits a singular literal heading token at another depth.
compiled = compileChild(`### Body

Required Shape

- \`### Nested Block\`

### Nested Logical Name

Instance Target

- ### Nested Block

Required Fields

- Meaning`);
ordinary = compiled.validation.ordinaryGroups.find((group) => group.group === 'Nested Logical Name');
assert.equal(ordinary.target.heading, '### Nested Block');
assert.equal(ordinary.target.level, 3);
assert.equal(ordinary.target.requiredness, 'required');
result = projectPortableContractInstance({ markdown: '# A\n\n## Container\n\n### Nested Block\n\n- Meaning: nested explicit\n', compiledContract: compiled });
assert.equal(field(group(result, 'Nested Logical Name'), 'Meaning').qualification, 'present');

// 3: Instance Target is singular and exact-heading-shaped.
compiled = compileChild(`### Logical Name

Instance Target

- ## One
- ## Two

Required Fields

- Meaning`);
ordinary = compiled.validation.ordinaryGroups.find((group) => group.group === 'Logical Name');
assert.equal(ordinary.qualification, 'structurally-invalid');
result = projectPortableContractInstance({ markdown: '# A\n\n## One\n\n- Meaning: x\n', compiledContract: compiled });
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.target.invalid'), true);

// 3a: a declared Instance Target category with zero tokens is structurally invalid.
compiled = compileChild(`### Logical Name

Instance Target

Required Fields

- Meaning`);
ordinary = compiled.validation.ordinaryGroups.find((group) => group.group === 'Logical Name');
assert.equal(ordinary.qualification, 'structurally-invalid');
result = projectPortableContractInstance({ markdown: '# A\n\n## Logical Name\n\n- Meaning: must not default\n', compiledContract: compiled });
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.target.invalid'), true);

// 3b: malformed explicit target token fails closed instead of degrading to same-name/default behavior.
compiled = compileChild(`### Logical Name

Instance Target

- Custom Block

Required Fields

- Meaning`);
ordinary = compiled.validation.ordinaryGroups.find((group) => group.group === 'Logical Name');
assert.equal(ordinary.qualification, 'structurally-invalid');
assert.equal(ordinary.target.qualification, 'structurally-invalid');
result = projectPortableContractInstance({ markdown: '# A\n\n## Custom Block\n\n- Meaning: x\n', compiledContract: compiled });
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.target.invalid'), true);

// 3c: heading depth is identity for explicit targets; H2 cannot satisfy an H3 authority.
compiled = compileChild(`### Nested Logical Name

Instance Target

- ### Nested Block

Required Fields

- Meaning`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Nested Block\n\n- Meaning: wrong depth\n', compiledContract: compiled });
projected = group(result, 'Nested Logical Name');
assert.equal(projected.target.present, false);
assert.equal(field(projected, 'Meaning').qualification, 'unresolved');

// 7: duplicate scalar occurrences are preserved and invalid.
compiled = compileChild(`### Body

Required Sections

- Details

### Details

Required Fields

- Meaning`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Details\n\n- Meaning: first\n- Meaning: second\n', compiledContract: compiled });
projected = result.ordinaryGroups.find((group) => group.group === 'Details');
assert.equal(field(projected, 'Meaning').qualification, 'duplicate');
assert.deepEqual(field(projected, 'Meaning').occurrences.map((item) => item.value), ['first', 'second']);
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.duplicate'), true);

// 7b: another structural category does not silently disqualify an otherwise ordinary group.
// Root's committed ordinary-group definition is Required/Optional Fields + no Entry Shape +
// ordinary unqualified labels; Required Shape does not create a hidden classifier exception.
compiled = compileChild(`### Special Requirement

Required Shape

- special-owner

Required Fields

- Meaning

### Details

Required Fields

- Meaning`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Details\n\n- Meaning: ordinary-only\n', compiledContract: compiled });
assert.equal(field(group(result, 'Details'), 'Meaning').qualification, 'present');
assert.equal(field(group(result, 'Special Requirement'), 'Meaning').qualification, 'unresolved');
assert.equal(group(result, 'Special Requirement').target.heading, '## Special Requirement');

// 8: same field label in two groups is independently scoped.
compiled = compileChild(`### Body

Required Sections

- Group A
- Group B

### Group A

Required Fields

- Notes

### Group B

Required Fields

- Notes`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Group A\n\n- Notes: alpha\n\n## Group B\n\n- Notes: beta\n', compiledContract: compiled });
assert.equal(field(group(result, 'Group A'), 'Notes').occurrences[0].value, 'alpha');
assert.equal(field(group(result, 'Group B'), 'Notes').occurrences[0].value, 'beta');

// 9, 10: optional target absent is valid/inactive; present activates Required Fields.
compiled = compileChild(`### Body

Optional Sections

- Resolved Source State

### Resolved Source State

Required Fields

- Anchor Kind
- Anchor`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Other\n\n- Note: none\n', compiledContract: compiled });
projected = group(result, 'Resolved Source State');
assert.equal(projected.target.requiredness, 'optional');
assert.equal(projected.target.present, false);
assert.equal(field(projected, 'Anchor Kind').qualification, 'absent');
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.required.missing'), false);
result = projectPortableContractInstance({ markdown: '# A\n\n## Resolved Source State\n\n- Anchor Kind: commit\n', compiledContract: compiled });
assert.equal(field(group(result, 'Resolved Source State'), 'Anchor').qualification, 'missing-required');

// 11: repeated exact target headings are ambiguous, never first/last guessed.
compiled = compileChild(`### Body

Required Sections

- Details

### Details

Required Fields

- Meaning`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Details\n\n- Meaning: first\n\n## Details\n\n- Meaning: second\n', compiledContract: compiled });
projected = group(result, 'Details');
assert.equal(projected.target.occurrenceCount, 2);
assert.equal(projected.qualification, 'ambiguous');
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.target.ambiguous'), true);

// 12: nested declaration field is not stolen by an ordinary parent/group.
compiled = compileChild(`### Body

Required Sections

- Shared

### Shared

Required Fields

- Meaning

### Thing Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning

Rules

- Entries under \`## Shared\` are repeated named declarations using this shape.`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Shared\n\n- thing\n  - Meaning: declaration-owned\n', compiledContract: compiled });
assert.equal(field(group(result, 'Shared'), 'Meaning').qualification, 'missing-required');
assert.equal(result.validation.declarations[0].sections[0].entries[0].fields.Meaning, 'declaration-owned');

// 12a: a declaration entry root owns its name line as well as nested fields.
// A declaration name that collides with an ordinary field label must not satisfy that ordinary requirement.
compiled = compileChild(`### Body

Required Sections

- Shared

### Shared

Required Fields

- Meaning

### Thing Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Other

Rules

- Entries under \`## Shared\` are repeated named declarations using this shape.`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Shared\n\n- Meaning\n  - Other: declaration child\n', compiledContract: compiled });
assert.equal(result.validation.declarations[0].sections[0].entries[0].name, 'Meaning');
assert.equal(result.validation.declarations[0].sections[0].entries[0].fields.Other, 'declaration child');
assert.equal(field(group(result, 'Shared'), 'Meaning').qualification, 'missing-required');
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.required.missing'), true);

// 12a.1: declaration ownership, not colon resemblance, decides ownership of the root line.
compiled = compileChild(`### Body

Required Sections

- Shared

### Shared

Required Fields

- Human

### Thing Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Other

Rules

- Entries under \`## Shared\` are repeated named declarations using this shape.`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Shared\n\n- Human: readable declaration name\n  - Other: declaration child\n', compiledContract: compiled });
assert.equal(result.validation.declarations[0].sections[0].entries[0].name, 'Human: readable declaration name');
assert.equal(field(group(result, 'Shared'), 'Human').qualification, 'missing-required');
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.required.missing'), true);

// 12a.2: legitimate ordinary block-valued fields outside declaration-owned targets remain ordinary.
compiled = compileChild(`### Body

Required Sections

- Shared
- Declarations

### Shared

Required Fields

- Meaning

### Thing Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Other

Rules

- Entries under \`## Declarations\` are repeated named declarations using this shape.`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Shared\n\n- Meaning\n  - Detail: ordinary block value\n\n## Declarations\n\n- thing\n  - Other: declaration child\n', compiledContract: compiled });
assert.equal(field(group(result, 'Shared'), 'Meaning').qualification, 'present');
assert.equal(field(group(result, 'Shared'), 'Meaning').occurrences[0].form, 'block');
assert.equal(result.validation.declarations[0].sections[0].entries[0].name, 'thing');

// 12b: an ordinary H2 target must not steal fields whose nearest owner is a descendant heading.
compiled = compileChild(`### Body

Required Sections

- Shared

### Shared

Required Fields

- Meaning`);
result = projectPortableContractInstance({ markdown: '# A\n\n## Shared\n\n### Child\n\n- Meaning: descendant-owned\n', compiledContract: compiled });
assert.equal(field(group(result, 'Shared'), 'Meaning').qualification, 'missing-required');
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.required.missing'), true);

// 13: inherited same-group contributions remain additive and attributable.
const parent = schema({ id: 'example.parent.v1', parent: 'example.root.v1', validation: `### Body

Required Sections

- Shared

### Shared

Required Fields

- Parent Meaning` });
const child = schema({ id: 'example.leaf.v1', parent: 'example.parent.v1', validation: `### Shared

Required Fields

- Child Meaning` });
compiled = compilePortableSchemaContractChain([root, parent, child]);
ordinary = compiled.validation.ordinaryGroups.find((item) => item.group === 'Shared');
assert.deepEqual(ordinary.requiredFields, ['Parent Meaning', 'Child Meaning']);
assert.deepEqual(ordinary.contributors.map((item) => item.sourceSchemaId), ['example.parent.v1', 'example.leaf.v1']);
result = projectPortableContractInstance({ markdown: '# A\n\n## Shared\n\n- Parent Meaning: p\n- Child Meaning: c\n', compiledContract: compiled });
assert.equal(field(group(result, 'Shared'), 'Parent Meaning').qualification, 'present');
assert.equal(field(group(result, 'Shared'), 'Child Meaning').qualification, 'present');

// 13a: inherited optional target may be strengthened to required by a descendant body contract.
const optionalTargetParent = schema({ id: 'example.optional-target.parent.v1', parent: 'example.root.v1', validation: `### Parent Body

Optional Sections

- Shared

### Shared

Required Fields

- Parent Meaning` });
const requiredTargetChild = schema({ id: 'example.required-target.child.v1', parent: 'example.optional-target.parent.v1', validation: `### Child Body

Required Sections

- Shared

### Shared

Required Fields

- Child Meaning` });
compiled = compilePortableSchemaContractChain([root, optionalTargetParent, requiredTargetChild]);
ordinary = compiled.validation.ordinaryGroups.find((item) => item.group === 'Shared');
assert.equal(ordinary.target.requiredness, 'required');
assert.equal(ordinary.target.qualification, 'valid');
assert.deepEqual(ordinary.contributors.map((item) => item.sourceSchemaId), ['example.optional-target.parent.v1', 'example.required-target.child.v1']);

// 13b: inherited target disagreement is surfaced; contributors are not silently retargeted.
const conflictParent = schema({ id: 'example.conflict.parent.v1', parent: 'example.root.v1', validation: `### Shared

Instance Target

- ## Parent Shared

Required Fields

- Parent Meaning` });
const conflictChild = schema({ id: 'example.conflict.child.v1', parent: 'example.conflict.parent.v1', validation: `### Shared

Instance Target

- ## Child Shared

Required Fields

- Child Meaning` });
compiled = compilePortableSchemaContractChain([root, conflictParent, conflictChild]);
ordinary = compiled.validation.ordinaryGroups.find((item) => item.group === 'Shared');
assert.equal(ordinary.qualification, 'conflicting');
assert.equal(ordinary.target.qualification, 'conflicting');
result = projectPortableContractInstance({ markdown: '# A\n\n## Parent Shared\n\n- Parent Meaning: p\n\n## Child Shared\n\n- Child Meaning: c\n', compiledContract: compiled });
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.target.conflicting'), true);

// 13c: target requiredness remains unresolved when body/section authority does not declare it.
compiled = compileChild(`### Details

Required Fields

- Meaning`);
ordinary = compiled.validation.ordinaryGroups.find((item) => item.group === 'Details');
assert.equal(ordinary.target.requiredness, 'unresolved');
result = projectPortableContractInstance({ markdown: '# A\n\n## Other\n', compiledContract: compiled });
assert.equal(group(result, 'Details').target.present, false);
assert.equal(result.validation.findings.some((item) => item.code === 'portable.contract.ordinary.target.requiredness.unresolved'), true);

// 18: projection/validation are read-only.
const source = '# A\n\n## Shared\n\n- Parent Meaning: p\n- Child Meaning: c\n';
const before = source;
projectPortableContractInstance({ markdown: source, compiledContract: compiled });
assert.equal(source, before);

console.log('✓ ordinary instance-field ownership/projection is scoped, additive and read-only');

function group(projection, name) {
  return projection.ordinaryGroups.find((item) => item.group === name);
}

function field(groupProjection, label) {
  return groupProjection.fields.find((item) => item.label === label);
}
