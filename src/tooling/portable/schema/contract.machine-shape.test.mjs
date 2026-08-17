import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compilePortableSchemaContract, compilePortableSchemaContractChain } from './contract.compile.js';
import { validatePortableContractInstance } from './contract.validate.js';
import { qualifyResolvedMachineShape } from './contract.machine-shape.js';
import { compileLexicalShapeV1, qualifyLexicalShapeV1 } from './lexical.shape.v1.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootShapeSchema = fs.readFileSync(path.join(here, 'fixtures/tiinex.root.v1.machine-shape.contract-fixture.md'), 'utf8');
const rootCompiled = compilePortableSchemaContract(rootShapeSchema);
const markdownDefinition = rootCompiled.machineShapes.definitions.find((item) => item.shapeLabel === 'Markdown Link');
assert.equal(markdownDefinition.definitionQualification, 'valid');
assert.equal(markdownDefinition.qualificationSupport, 'available');
assert.equal(markdownDefinition.grammarProfile, 'tiinex.lexical.shape.v1');
assert.equal(markdownDefinition.grammarRules.length, 3, 'repeatable Grammar Rule fields are retained');
assert.equal(markdownDefinition.visibilityPolicy, 'lineage-prefix-ancestors-and-same-source');

const markdownConsumer = `# Continuity Context
- Parent
  - Parent Schema: tiinex.root.v1
- Current
  - Current Schema: example.markdown-consumer.v1
---
## Schema Validation Contract
### Link Declaration
Entry Shape
- First-Level Hyphen List Item
Required Fields
- Link
Field Value Constraints
- Link
  - Allowed Shape: Markdown Link
  - Domain Policy: closed
Rules
- Entries under \`## Links\` are repeated named declarations using this shape.`;
const markdownChain = compilePortableSchemaContractChain([rootShapeSchema, markdownConsumer]);
const markdownConstraint = markdownChain.constraints.find((item) => item.kind === 'field-domain');
assert.equal(markdownConstraint.allowedShapeAuthorities.length, 1);
assert.equal(markdownConstraint.allowedShapeAuthorities[0].qualification, 'evaluable');
assert.equal(markdownConstraint.allowedShapeAuthorities[0].resolvedDefinitionProvenance.sourceSchemaId, 'tiinex.root.v1');
assert.equal(markdownConstraint.allowedShapeAuthorities[0].useSourceSchemaId, 'example.markdown-consumer.v1');
assert.deepEqual(markdownConstraint.allowedShapeAuthorities[0].visibleSchemaIds, ['tiinex.root.v1', 'example.markdown-consumer.v1']);

const canonicalMarkdownCases = [
  ['[label](target)', true],
  ['[](...)', false],
  ['[label]()', false],
  ['[label with spaces](target)', true],
  ['[label](../relative.md)', true],
  ['[label](https://example.test/x)', true],
  ['[label](target with spaces)', false],
  ['[label\nline](target)', false],
  ['prefix [label](target)', false],
  ['[a](b) [c](d)', false],
  ['![x](y)', false],
  ['[label](a(b)', true],
  ['[label](a%29b)', true],
  ['[lab]el](target)', false]
];
for (const [value, expected] of canonicalMarkdownCases) {
  const resolution = markdownConstraint.allowedShapeAuthorities[0];
  assert.equal(qualifyResolvedMachineShape(value, resolution).qualification, expected ? 'matched' : 'not-matched', value);
  const instance = `# Links\n\n## Links\n\n- one\n  - Link: ${value}`;
  const validation = validatePortableContractInstance({ markdown: instance, compiledContract: markdownChain });
  assert.equal(validation.status === 'valid', expected, `field-domain integration: ${value}`);
}

// Syntax qualification does not imply reference-target resolution.
const unresolvedReferenceSyntax = validatePortableContractInstance({
  markdown: '# Links\n\n## Links\n\n- one\n  - Link: [authority](../missing-authority.md)',
  compiledContract: markdownChain
});
assert.equal(unresolvedReferenceSyntax.status, 'valid');
assert.equal(unresolvedReferenceSyntax.fieldDomains.groups[0].occurrences[0].contributions[0].shapeResults[0].qualification, 'matched');

// Generic lexical grammar pressure.
function compileGrammar(startRule, grammarRules) {
  return compileLexicalShapeV1({ startRule, grammarRules });
}
function matched(grammar, value) {
  return qualifyLexicalShapeV1(grammar, value).qualification === 'matched';
}

let grammar = compileGrammar('start', [' \t start \t = \t "x" \t ']);
assert.equal(grammar.qualification, 'valid', 'ASCII SPACE/TAB meta-whitespace is accepted');
assert.equal(matched(grammar, 'x'), true);

for (const rule of [
  'start\u00a0= "x"',
  'start = "x"??',
  'start = "x"*+',
  'start = | "x"',
  'start = "x" |',
  'start = ()',
  'start = missing',
  'start = "\\q"',
  'start = ANY-EXCEPT("ab")'
]) {
  grammar = compileGrammar('start', [rule]);
  assert.equal(grammar.qualification, 'structurally-invalid', `malformed grammar rejected: ${JSON.stringify(rule)}`);
}

grammar = compileGrammar('a', ['a = b', 'b = a']);
assert.equal(grammar.qualification, 'structurally-invalid', 'cyclic local references are grammar errors');

grammar = compileGrammar('start', ['start = ANY-EXCEPT("]", SPACE)+']);
assert.equal(grammar.qualification, 'valid');
assert.equal(matched(grammar, 'abc'), true);
assert.equal(matched(grammar, 'a b'), false);
assert.equal(matched(grammar, 'a]b'), false);

grammar = compileGrammar('start', ['start = "x"?']);
assert.equal(matched(grammar, ''), true);
assert.equal(matched(grammar, 'x'), true);
assert.equal(matched(grammar, 'xx'), false);

grammar = compileGrammar('start', ['start = "x"*']);
assert.equal(matched(grammar, ''), true);
assert.equal(matched(grammar, 'xxx'), true);

grammar = compileGrammar('start', ['start = "x"+']);
assert.equal(matched(grammar, ''), false);
assert.equal(matched(grammar, 'xxx'), true);

grammar = compileGrammar('start', ['start = ("x"?)*']);
assert.equal(grammar.qualification, 'valid', 'empty-capable repetition is legal');
assert.equal(matched(grammar, ''), true);
assert.equal(matched(grammar, 'xxx'), true, 'empty-capable repetition terminates and preserves finite language');

grammar = compileGrammar('start', ['start = "a"* "a"']);
assert.equal(matched(grammar, ''), false);
assert.equal(matched(grammar, 'a'), true);
assert.equal(matched(grammar, 'aaaa'), true, 'existential whole-value derivation is preserved');

// A non-software shape proves the grammar interpreter is profile-driven, not shape-name-driven.
const specimenGrammar = compileGrammar('specimen-id', [
  'specimen-id = "SP-" DIGIT+ ("-" ASCII-LETTER+)?'
]);
assert.equal(specimenGrammar.qualification, 'valid');
assert.equal(matched(specimenGrammar, 'SP-17'), true);
assert.equal(matched(specimenGrammar, 'SP-17-AZ'), true);
assert.equal(matched(specimenGrammar, 'sp-17'), false);

function shapeDefinition(label, profile = 'tiinex.lexical.shape.v1', rules = ['shape = "GP:" DIGIT+'], start = 'shape') {
  return `### Machine Shape Authority
Machine Shape Definitions
- ${label}
  - Grammar Profile: ${profile}
  - Start Rule: ${start}
${rules.map((rule) => `  - Grammar Rule: ${rule}`).join('\n')}
  - Human Meaning: synthetic pressure shape`;
}
function shapeConsumerGroup(label, field = 'Pointer') {
  return `### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Required Fields
- ${field}
Field Value Constraints
- ${field}
  - Allowed Shape: ${label}
  - Domain Policy: closed
Rules
- Entries under \`## Things\` are repeated named declarations using this shape.`;
}
function schema({ id, parent = '', body = '' }) {
  return `# Continuity Context
${parent ? `- Parent\n  - Parent Schema: ${parent}\n` : ''}- Current
  - Current Schema: ${id}
---
## Schema Validation Contract
${body}`;
}
function validatePointer(compiled, value) {
  return validatePortableContractInstance({ markdown: `# Things\n\n## Things\n\n- one\n  - Pointer: ${value}`, compiledContract: compiled });
}

// Parent use cannot acquire a definition from a later child.
const galacticParent = schema({ id: 'example.galactic-parent.v1', body: shapeConsumerGroup('Galactic Pointer') });
const galacticChild = schema({
  id: 'example.galactic-child.v1',
  parent: 'example.galactic-parent.v1',
  body: shapeDefinition('Galactic Pointer')
});
const galacticChain = compilePortableSchemaContractChain([galacticParent, galacticChild]);
const galacticParentConstraint = galacticChain.constraints.find((item) => item.kind === 'field-domain');
assert.equal(galacticParentConstraint.allowedShapeAuthorities[0].qualification, 'unresolved');
assert.equal(validatePointer(galacticChain, 'GP:17').status, 'unresolved');

// Same-source definition and use are visible regardless of source order.
const specimenChild = schema({
  id: 'example.specimen-child.v1',
  parent: 'example.shape-base.v1',
  body: `${shapeConsumerGroup('Specimen Identifier')}\n${shapeDefinition('Specimen Identifier', 'tiinex.lexical.shape.v1', ['specimen = "SP-" DIGIT+'], 'specimen')}`
});
const shapeBase = schema({ id: 'example.shape-base.v1', body: '### Base\nRules\n- base' });
const specimenChain = compilePortableSchemaContractChain([shapeBase, specimenChild]);
assert.equal(specimenChain.constraints.find((item) => item.kind === 'field-domain').allowedShapeAuthorities[0].qualification, 'evaluable');
assert.equal(validatePointer(specimenChain, 'SP-42').status, 'valid');
assert.equal(validatePointer(specimenChain, 'GP:42').status, 'structurally-invalid');

// Grandchild inherits the definition; a sibling branch without it does not.
const specimenGrandchild = schema({ id: 'example.specimen-grandchild.v1', parent: 'example.specimen-child.v1', body: shapeConsumerGroup('Specimen Identifier') });
const specimenGrandchildChain = compilePortableSchemaContractChain([shapeBase, specimenChild, specimenGrandchild]);
const grandchildConstraint = specimenGrandchildChain.constraints.find((item) => item.sourceSchemaId === 'example.specimen-grandchild.v1');
assert.equal(grandchildConstraint.allowedShapeAuthorities[0].qualification, 'evaluable');

const specimenSibling = schema({ id: 'example.specimen-sibling.v1', parent: 'example.shape-base.v1', body: shapeConsumerGroup('Specimen Identifier') });
const specimenSiblingChain = compilePortableSchemaContractChain([shapeBase, specimenSibling]);
assert.equal(specimenSiblingChain.constraints.find((item) => item.kind === 'field-domain').allowedShapeAuthorities[0].qualification, 'unresolved');

// Exact-label conflicts are never deduplicated or child-wins.
const conflictParent = schema({ id: 'example.conflict-parent.v1', body: shapeDefinition('Pointer Shape') });
const conflictChild = schema({ id: 'example.conflict-child.v1', parent: 'example.conflict-parent.v1', body: `${shapeDefinition('Pointer Shape')}\n${shapeConsumerGroup('Pointer Shape')}` });
const conflictChain = compilePortableSchemaContractChain([conflictParent, conflictChild]);
const conflictConstraint = conflictChain.constraints.find((item) => item.kind === 'field-domain');
assert.equal(conflictConstraint.allowedShapeAuthorities[0].qualification, 'conflicting');
assert.equal(validatePointer(conflictChain, 'GP:17').status, 'unresolved');

// Known malformed definition is structurally invalid; unsupported profile is preserved but unavailable.
const malformedShape = schema({
  id: 'example.malformed-shape.v1',
  body: `${shapeDefinition('Broken Shape', 'tiinex.lexical.shape.v1', ['shape = "x"??'])}\n${shapeConsumerGroup('Broken Shape')}`
});
const malformedCompiled = compilePortableSchemaContract(malformedShape);
assert.equal(malformedCompiled.machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(malformedCompiled.constraints.find((item) => item.kind === 'field-domain').allowedShapeAuthorities[0].qualification, 'unresolved');

const unsupportedShape = schema({
  id: 'example.unsupported-shape.v1',
  body: `${shapeDefinition('Future Shape', 'tiinex.future.shape.v9', ['shape = future syntax'])}\n${shapeConsumerGroup('Future Shape')}`
});
const unsupportedCompiled = compilePortableSchemaContract(unsupportedShape);
assert.equal(unsupportedCompiled.machineShapes.definitions[0].definitionQualification, 'valid');
assert.equal(unsupportedCompiled.machineShapes.definitions[0].qualificationSupport, 'unavailable');
assert.equal(unsupportedCompiled.constraints.find((item) => item.kind === 'field-domain').allowedShapeAuthorities[0].qualification, 'unresolved');

// Grammar Rule raw source must survive generic contract parsing long enough for the lexical
// profile to reject non-ASCII meta-whitespace at the field-value boundary.
for (const [id, rule] of [
  ['example.leading-nbsp-shape.v1', '\u00a0shape = "x"'],
  ['example.trailing-nbsp-shape.v1', 'shape = "x"\u00a0']
]) {
  const source = schema({
    id,
    body: `${shapeDefinition('Bad Meta Shape', 'tiinex.lexical.shape.v1', [rule])}\n${shapeConsumerGroup('Bad Meta Shape')}`
  });
  const compiled = compilePortableSchemaContract(source);
  assert.equal(compiled.machineShapes.definitions[0].definitionQualification, 'structurally-invalid', `${id}: non-ASCII edge whitespace remains visible to the profile`);
  assert.equal(compiled.constraints.find((item) => item.kind === 'field-domain').allowedShapeAuthorities[0].qualification, 'unresolved');
}

// Multiple Allowed Shape alternatives obey Root's tri-state alternative semantics:
// a resolved match wins even when another requested shape is unresolved; without a match,
// any unresolved alternative keeps the consumer unresolved.
const multiShapeSchema = schema({
  id: 'example.multi-shape.v1',
  body: `${shapeDefinition('Specimen Identifier', 'tiinex.lexical.shape.v1', ['specimen = "SP-" DIGIT+'], 'specimen')}
### Thing Declaration
Entry Shape
- First-Level Hyphen List Item
Required Fields
- Pointer
Field Value Constraints
- Pointer
  - Allowed Shape: Missing Future Shape
  - Allowed Shape: Specimen Identifier
  - Domain Policy: closed
Rules
- Entries under \`## Things\` are repeated named declarations using this shape.`
});
const multiShapeCompiled = compilePortableSchemaContract(multiShapeSchema);
assert.equal(validatePointer(multiShapeCompiled, 'SP-17').status, 'valid', 'resolved matching alternative wins');
assert.equal(validatePointer(multiShapeCompiled, 'no-match').status, 'unresolved', 'unresolved alternative prevents a false closed no-match');

// Exact-label conflicts are preserved even when both definitions are byte-semantically identical
// and originate in one source schema.
const duplicateSameSourceShape = schema({
  id: 'example.same-source-shape-conflict.v1',
  body: `### Machine Shape Authority
Machine Shape Definitions
- Duplicate Shape
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: shape
  - Grammar Rule: shape = "D:" DIGIT+
  - Human Meaning: first declaration
- Duplicate Shape
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: shape
  - Grammar Rule: shape = "D:" DIGIT+
  - Human Meaning: second declaration
${shapeConsumerGroup('Duplicate Shape')}`
});
const duplicateSameSourceCompiled = compilePortableSchemaContract(duplicateSameSourceShape);
assert.equal(duplicateSameSourceCompiled.machineShapes.definitions.length, 2);
assert.equal(duplicateSameSourceCompiled.constraints.find((item) => item.kind === 'field-domain').allowedShapeAuthorities[0].qualification, 'conflicting');
assert.equal(validatePointer(duplicateSameSourceCompiled, 'D:7').status, 'unresolved');

console.log('✓ portable machine-shape authority compiles canonical definitions, enforces source-point visibility, and interprets lexical profile v1 generically');
