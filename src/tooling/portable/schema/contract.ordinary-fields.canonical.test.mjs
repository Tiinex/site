import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { compilePortableSchemaContractChain } from './contract.compile.js';
import { projectPortableContractInstance } from './contract.project.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(join(here, 'fixtures', name), 'utf8');
const root = fixture('tiinex.root.v1.ordinary-target.contract-fixture.md');
const transition = fixture('tiinex.transition.definition.v1.contract-fixture.md');
const portalTime = fixture('tiinex.portal.time.v1.contract-fixture.md');
const schemaContract = fixture('tiinex.schema.contract.v1.repeated-record.contract-fixture.md');
const schemaGeneration = fixture('tiinex.schema.generation.v1.repeated-record.contract-fixture.md');
const schemaInheritance = fixture('tiinex.schema.inheritance.v1.repeated-record.contract-fixture.md');

// Canonical Transition Definition acceptance: ordinary fields project through Root authority, not schema-id logic.
let compiled = compilePortableSchemaContractChain([root, transition]);
assert.equal(compiled.lineageQualification.state, 'valid');
let ordinary = compiled.validation.ordinaryGroups.find((item) => item.group === 'Applicability And Conditions');
assert.ok(ordinary);
assert.equal(ordinary.target.heading, '## Applicability And Conditions');
assert.equal(ordinary.target.authority, 'root-same-name-default');
assert.equal(ordinary.target.requiredness, 'required');
assert.deepEqual(ordinary.requiredFields, ['Applicability Meaning']);
assert.deepEqual(ordinary.optionalFields, ['Condition', 'Condition Reference', 'Failure Meaning', 'Unknown Meaning']);

let projection = projectPortableContractInstance({
  markdown: `# Transition\n\n## Applicability And Conditions\n\n- Applicability Meaning: bounded by separately owned condition semantics\n- Condition: local-readable-condition\n- Condition Reference: condition-alpha\n`,
  compiledContract: compiled
});
let group = projection.ordinaryGroups.find((item) => item.group === 'Applicability And Conditions');
assert.equal(field(group, 'Applicability Meaning').qualification, 'present');
assert.equal(field(group, 'Condition').occurrences[0].value, 'local-readable-condition');
assert.equal(field(group, 'Condition Reference').occurrences[0].value, 'condition-alpha');

projection = projectPortableContractInstance({
  markdown: `# Transition\n\n## Applicability And Conditions\n\n## Authoring Bindings\n\n- Applicability Meaning: misplaced\n- Condition: misplaced\n`,
  compiledContract: compiled
});
group = projection.ordinaryGroups.find((item) => item.group === 'Applicability And Conditions');
assert.equal(field(group, 'Applicability Meaning').qualification, 'missing-required');
assert.equal(field(group, 'Condition').qualification, 'absent');

// Canonical unchanged Portal Time pressure case: optional same-name block is inactive while absent.
const portal = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: tiinex.root.v1\n  - Trace: root.trace.md\n  - Origin: root.trace.md\n- Current\n  - Current Schema: tiinex.portal.v1\n  - Created At: 2026-07-02 00:00:00\n\n---\n\n# Portal\n\n## Schema Validation Contract\n`;
compiled = compilePortableSchemaContractChain([root, portal, portalTime]);
assert.equal(compiled.lineageQualification.state, 'valid');
ordinary = compiled.validation.ordinaryGroups.find((item) => item.group === 'Resolved Source State');
assert.ok(ordinary);
assert.equal(ordinary.target.heading, '## Resolved Source State');
assert.equal(ordinary.target.authority, 'root-same-name-default');
assert.equal(ordinary.target.requiredness, 'optional');
projection = projectPortableContractInstance({ markdown: '# Time Portal\n\n## Resolution State\n\n- Resolution Status: unavailable\n', compiledContract: compiled });
group = projection.ordinaryGroups.find((item) => item.group === 'Resolved Source State');
assert.equal(group.target.present, false);
assert.equal(field(group, 'Anchor Kind').qualification, 'absent');
assert.equal(field(group, 'Anchor').qualification, 'absent');
assert.equal(projection.validation.findings.some((item) => item.code === 'portable.contract.ordinary.field.required.missing' && item.data?.group === 'Resolved Source State'), false);
projection = projectPortableContractInstance({ markdown: '# Time Portal\n\n## Resolved Source State\n\n- Anchor Kind: commit\n', compiledContract: compiled });
group = projection.ordinaryGroups.find((item) => item.group === 'Resolved Source State');
assert.equal(field(group, 'Anchor').qualification, 'missing-required');

// The four repaired repeated-record groups remain named declarations, never ordinary scalar groups.
compiled = compilePortableSchemaContractChain([root, schemaContract]);
assert.equal(compiled.lineageQualification.state, 'valid');
assertDeclaration(compiled, 'Contract Nodes', '## Contract Nodes');
assert.equal(compiled.validation.ordinaryGroups.some((item) => item.group === 'Contract Nodes'), false);

compiled = compilePortableSchemaContractChain([root, schemaContract, schemaGeneration]);
assert.equal(compiled.lineageQualification.state, 'valid');
assertDeclaration(compiled, 'Required Inputs', '## Required Inputs');
assertDeclaration(compiled, 'Generation Steps', '## Generation Steps');
assert.equal(compiled.validation.ordinaryGroups.some((item) => item.group === 'Required Inputs' || item.group === 'Generation Steps'), false);

compiled = compilePortableSchemaContractChain([root, schemaContract, schemaInheritance]);
assert.equal(compiled.lineageQualification.state, 'valid');
assertDeclaration(compiled, 'Merge Rules', '## Merge Rules');
assert.equal(compiled.validation.ordinaryGroups.some((item) => item.group === 'Merge Rules'), false);

console.log('✓ committed ordinary-target pressure fixtures project scoped fields and preserve repeated-record ownership');

function field(groupProjection, label) {
  return groupProjection.fields.find((item) => item.label === label);
}

function assertDeclaration(contract, name, heading) {
  const declaration = contract.declarations.find((item) => item.group === name);
  assert.ok(declaration, `${name} declaration must compile`);
  assert.equal(declaration.entryShape.includes('First-Level Hyphen List Item'), true);
  assert.equal(declaration.targetHeadings.includes(heading), true);
}
