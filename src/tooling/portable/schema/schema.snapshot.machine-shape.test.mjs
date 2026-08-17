import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { comparePortableSchemaSnapshots } from './schema.snapshot.js';
import { compilePortableSchemaContract } from './contract.compile.js';

const fixture = readFileSync(new URL('./fixtures/tiinex.root.v1.machine-shape.contract-fixture.md', import.meta.url), 'utf8');

function compare(candidate, reference = fixture) {
  return comparePortableSchemaSnapshots({ candidate: { markdown: candidate }, reference: { markdown: reference } });
}

function replaceOnce(source, from, to) {
  assert.equal(source.includes(from), true, `fixture contains ${JSON.stringify(from)}`);
  return source.replace(from, to);
}

const canonicalLinkRule = '  - Grammar Rule: markdown-link = "[" label "](" target ")"';

const compactGrammar = replaceOnce(
  fixture,
  canonicalLinkRule,
  '  - Grammar Rule: markdown-link="["label"]("target")"'
);
assert.equal(compare(compactGrammar).status, 'equivalent-current', 'ASCII grammar meta-whitespace spelling is non-semantic');

const trailingAsciiSpace = replaceOnce(fixture, canonicalLinkRule, `${canonicalLinkRule}   `);
assert.equal(compare(trailingAsciiSpace).status, 'equivalent-current', 'trailing ASCII SPACE is grammar meta-whitespace');

const trailingAsciiTab = replaceOnce(fixture, canonicalLinkRule, `${canonicalLinkRule}\t`);
assert.equal(compare(trailingAsciiTab).status, 'equivalent-current', 'trailing TAB is grammar meta-whitespace');

const trailingNbsp = replaceOnce(fixture, canonicalLinkRule, `${canonicalLinkRule}\u00A0`);
assert.equal(compilePortableSchemaContract(trailingNbsp).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compare(trailingNbsp).status, 'materially-stale', 'forbidden trailing NBSP remains freshness-significant');

const internalNbsp = replaceOnce(
  fixture,
  canonicalLinkRule,
  '  - Grammar Rule: markdown-link\u00A0= "[" label "](" target ")"'
);
assert.equal(compilePortableSchemaContract(internalNbsp).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compare(internalNbsp).status, 'materially-stale', 'forbidden internal NBSP remains freshness-significant');

const changedLanguage = replaceOnce(
  fixture,
  canonicalLinkRule,
  '  - Grammar Rule: markdown-link = "{" label "](" target ")"'
);
assert.equal(compare(changedLanguage).status, 'materially-stale', 'grammar AST changes accepted-language identity');

const ruleLines = [
  canonicalLinkRule,
  '  - Grammar Rule: label = ANY-EXCEPT("]", TAB, CR, LF)+',
  '  - Grammar Rule: target = ANY-EXCEPT(")", SPACE, TAB, CR, LF)+'
].join('\n');
const reorderedRules = replaceOnce(fixture, ruleLines, [
  '  - Grammar Rule: target = ANY-EXCEPT(")", SPACE, TAB, CR, LF)+',
  canonicalLinkRule,
  '  - Grammar Rule: label = ANY-EXCEPT("]", TAB, CR, LF)+'
].join('\n'));
assert.equal(compare(reorderedRules).status, 'equivalent-current', 'Grammar Rule declaration order is non-semantic');

const duplicateRule = replaceOnce(fixture, canonicalLinkRule, `${canonicalLinkRule}\n${canonicalLinkRule}`);
assert.equal(compilePortableSchemaContract(duplicateRule).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compare(duplicateRule).status, 'materially-stale', 'duplicate Grammar Rule multiplicity remains visible');

const canonicalDefinition = `- Markdown Link
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: markdown-link
${ruleLines}
  - Human Meaning: Exactly one complete inline Tiinex Markdown link with a non-empty single-line label and non-empty target. ASCII space is allowed in the label; ASCII space, tab, CR, and LF are forbidden in the target.`;
const specimenDefinition = `- Specimen Identifier
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: specimen
  - Grammar Rule: specimen = "SP-" DIGIT+
  - Human Meaning: A synthetic specimen identifier used only for portable snapshot pressure.`;
const twoDefinitions = replaceOnce(fixture, canonicalDefinition, `${canonicalDefinition}\n${specimenDefinition}`);
const reorderedDefinitions = replaceOnce(fixture, canonicalDefinition, `${specimenDefinition}\n${canonicalDefinition}`);
assert.equal(compare(twoDefinitions, reorderedDefinitions).status, 'equivalent-current', 'Machine Shape Definition declaration order is non-semantic');

const duplicateDefinition = replaceOnce(fixture, canonicalDefinition, `${canonicalDefinition}\n${canonicalDefinition}`);
assert.equal(compilePortableSchemaContract(duplicateDefinition).machineShapes.definitions.length, 2);
assert.equal(compare(duplicateDefinition).status, 'materially-stale', 'duplicate exact shape definition multiplicity remains visible');

const changedStartRule = replaceOnce(fixture, '  - Start Rule: markdown-link', '  - Start Rule: label');
assert.equal(compare(changedStartRule).status, 'materially-stale', 'Start Rule participates in semantic freshness');

const changedProfile = replaceOnce(fixture, '  - Grammar Profile: tiinex.lexical.shape.v1', '  - Grammar Profile: example.unsupported.shape.v1');
assert.equal(compare(changedProfile).status, 'materially-stale', 'Grammar Profile participates in semantic freshness');

const changedHumanMeaning = replaceOnce(
  fixture,
  '  - Human Meaning: Exactly one complete inline Tiinex Markdown link with a non-empty single-line label and non-empty target. ASCII space is allowed in the label; ASCII space, tab, CR, and LF are forbidden in the target.',
  '  - Human Meaning: Same lexical grammar, deliberately changed human-readable meaning for freshness pressure.'
);
assert.equal(compare(changedHumanMeaning).status, 'materially-stale', 'Human Meaning participates in semantic freshness');

console.log('✓ portable schema snapshot freshness consumes compiled Machine Shape semantic identity');

const extraPropertyAlpha = replaceOnce(
  fixture,
  '  - Grammar Profile: tiinex.lexical.shape.v1',
  '  - Grammar Profile: tiinex.lexical.shape.v1\n  - Extra Property: alpha'
);
const differentExtraBeta = replaceOnce(
  fixture,
  '  - Grammar Profile: tiinex.lexical.shape.v1',
  '  - Grammar Profile: tiinex.lexical.shape.v1\n  - Different Extra: beta'
);
assert.equal(compilePortableSchemaContract(extraPropertyAlpha).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compilePortableSchemaContract(differentExtraBeta).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compare(extraPropertyAlpha, differentExtraBeta).status, 'materially-stale', 'different malformed unknown declaration properties remain structurally distinct');

const nestedUnsupportedA = replaceOnce(
  fixture,
  '  - Grammar Profile: tiinex.lexical.shape.v1',
  '  - Grammar Profile: tiinex.lexical.shape.v1\n  - Extra Property: alpha\n    - Nested Unsupported: one'
);
const nestedUnsupportedB = replaceOnce(
  fixture,
  '  - Grammar Profile: tiinex.lexical.shape.v1',
  '  - Grammar Profile: tiinex.lexical.shape.v1\n  - Extra Property: alpha\n    - Nested Unsupported: two'
);
assert.equal(compare(nestedUnsupportedA, nestedUnsupportedB).status, 'materially-stale', 'nested unsupported declaration structure remains freshness-significant');

const humanMeaningLine = '  - Human Meaning: Exactly one complete inline Tiinex Markdown link with a non-empty single-line label and non-empty target. ASCII space is allowed in the label; ASCII space, tab, CR, and LF are forbidden in the target.';
const missingHumanMeaning = replaceOnce(fixture, `\n${humanMeaningLine}`, '');
const duplicateHumanMeaning = replaceOnce(fixture, humanMeaningLine, `${humanMeaningLine}\n${humanMeaningLine}`);
assert.equal(compilePortableSchemaContract(missingHumanMeaning).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compilePortableSchemaContract(duplicateHumanMeaning).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compare(missingHumanMeaning, duplicateHumanMeaning).status, 'materially-stale', 'missing and duplicate single-cardinality declaration fields remain distinct');

const malformedTrailingNbsp = trailingNbsp;
const malformedInternalNbsp = internalNbsp;
assert.equal(compare(malformedTrailingNbsp, malformedInternalNbsp).status, 'materially-stale', 'different malformed raw Grammar Rule source remains structurally distinct');

const malformedOrderA = replaceOnce(
  fixture,
  '- Markdown Link\n  - Grammar Profile: tiinex.lexical.shape.v1',
  '- Markdown Link\n  - Extra Property: alpha\n  - Grammar Profile: tiinex.lexical.shape.v1'
);
const malformedOrderB = replaceOnce(
  fixture,
  humanMeaningLine,
  `${humanMeaningLine}\n  - Extra Property: alpha`
);
assert.equal(compilePortableSchemaContract(malformedOrderA).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compilePortableSchemaContract(malformedOrderB).machineShapes.definitions[0].definitionQualification, 'structurally-invalid');
assert.equal(compare(malformedOrderA, malformedOrderB).status, 'equivalent-current', 'malformed declaration child order remains non-semantic while multiplicity is preserved');

function withCreationMachineShape(grammarLiteral) {
  return `${fixture}\n\n## Artifact Creation Contract\n\n### Creation Shape\n\nMachine Shape Definitions\n\n- Foo\n  - Grammar Profile: tiinex.lexical.shape.v1\n  - Start Rule: foo\n  - Grammar Rule: foo = "${grammarLiteral}"\n  - Human Meaning: foo\n`;
}
const creationShapeA = withCreationMachineShape('A');
const creationShapeB = withCreationMachineShape('B');
assert.equal(compare(creationShapeA, creationShapeB).status, 'materially-stale', 'creation-surface Machine Shape Definitions remain in ordinary creation freshness identity');

console.log('✓ malformed machine-shape structural fallback and creation-surface preservation remain freshness-significant');


const splitCategoryReference = replaceOnce(
  twoDefinitions,
  `${canonicalDefinition}\n${specimenDefinition}`,
  `${canonicalDefinition}\n${specimenDefinition}`
);
const splitCategoryCandidate = replaceOnce(
  twoDefinitions,
  `${canonicalDefinition}\n${specimenDefinition}`,
  `${canonicalDefinition}\n\nMachine Shape Definitions\n\n${specimenDefinition}`
);
assert.equal(compare(splitCategoryCandidate, splitCategoryReference).status, 'materially-stale', 'duplicate validation Machine Shape Definitions category occurrence remains freshness-significant');

const additionalDuplicateCategory = replaceOnce(
  fixture,
  '\nRules\n\n- Machine-shape definitions are resolved by lineage prefix at the source point of the shape use.',
  '\nMachine Shape Definitions\n\n- Empty\n\nRules\n\n- Machine-shape definitions are resolved by lineage prefix at the source point of the shape use.'
);
assert.equal(compare(additionalDuplicateCategory).status, 'materially-stale', 'an additional duplicate validation Machine Shape Definitions category occurrence remains freshness-significant');

const categoryA = `${canonicalDefinition}\n${specimenDefinition}`;
const categoryB = `- Coordinate Reference
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: crs
  - Grammar Rule: crs = "EPSG:" DIGIT+
  - Human Meaning: synthetic coordinate reference
- Measurement Unit
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: unit
  - Grammar Rule: unit = "mm" | "cm"
  - Human Meaning: synthetic measurement unit`;
const duplicateCategoryOrderA = replaceOnce(
  fixture,
  canonicalDefinition,
  `${categoryA}\n\nMachine Shape Definitions\n\n${categoryB}`
);
const duplicateCategoryOrderB = replaceOnce(
  fixture,
  canonicalDefinition,
  `${specimenDefinition}\n${canonicalDefinition}\n\nMachine Shape Definitions\n\n- Measurement Unit
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: unit
  - Grammar Rule: unit = "mm" | "cm"
  - Human Meaning: synthetic measurement unit
- Coordinate Reference
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: crs
  - Grammar Rule: crs = "EPSG:" DIGIT+
  - Human Meaning: synthetic coordinate reference`
);
assert.equal(compare(duplicateCategoryOrderA, duplicateCategoryOrderB).status, 'equivalent-current', 'definition order remains non-semantic within corresponding duplicate category occurrences');

assert.equal(compare(twoDefinitions, reorderedDefinitions).status, 'equivalent-current', 'single validation category definition order remains non-semantic after container preservation');
assert.equal(compare(compactGrammar).status, 'equivalent-current', 'valid single-category grammar meta-spacing remains semantic-equivalent after container preservation');

console.log('✓ validation Machine Shape Definitions category occurrence and membership boundaries remain freshness-significant');
