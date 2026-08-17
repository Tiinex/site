import assert from 'node:assert/strict';
import { compilePortableSchemaContract } from './contract.compile.js';
import { validatePortableContractInstance } from './contract.validate.js';
import { projectPortableContractInstance } from './contract.project.js';

const schema = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: example.generic.classification.v1
  - Created At: 2026-08-16 00:00:00

---

# Generic Classification Fixture

## Schema Validation Contract

### Thing Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning

Optional Fields

- Target Kind
- Schema Constraint

Rules

- Entries under \`## Things\` are repeated named declarations using this shape.

### Participant Classification

Applies To

- Thing Declaration

Rules

- When both explicit \`Target Kind\` and a resolvable normative \`Schema Constraint\`/authority determine participant representation, they must agree.
`;

const compiled = compilePortableSchemaContract(schema);
assert.equal(compiled.schemaId, 'example.generic.classification.v1');
assert.equal(compiled.constraints.some((item) => item.kind === 'classification-agreement' && item.groups.includes('Thing Declaration')), true, 'generic fixture compiles classification-agreement without Transition schema identity');

const authorities = {
  schemaAuthorities: {
    'example.artifact.v1': { targetKind: 'artifact' },
    'example.non-artifact.v1': { targetKind: 'non-artifact' }
  }
};

function artifact(fields = []) {
  return `# Generic Artifact\n\n## Things\n\n- thing\n  - Meaning: participant\n${fields.map(([name, value]) => `  - ${name}: ${value}`).join('\n')}\n`;
}

function projection(markdown, resolvers = authorities) {
  return projectPortableContractInstance({ markdown, compiledContract: compiled, resolvers });
}

function classification(result) {
  return result.declarations[0].sections[0].entries[0].semantics[0];
}

let projected = projection(artifact([['Target Kind', 'artifact']]));
assert.deepEqual(pick(classification(projected)), {
  declared: 'artifact', resolved: 'artifact', qualification: 'explicit', authority: 'explicit-declaration', schemaConstraintQualification: 'absent'
});

projected = projection(artifact([['Target Kind', 'non-artifact']]));
assert.deepEqual(pick(classification(projected)), {
  declared: 'non-artifact', resolved: 'non-artifact', qualification: 'explicit', authority: 'explicit-declaration', schemaConstraintQualification: 'absent'
});

projected = projection(artifact([['Schema Constraint', 'example.artifact.v1']]));
assert.deepEqual(pick(classification(projected)), {
  declared: '', resolved: 'artifact', qualification: 'resolved-by-authority', authority: 'schema-constraint', schemaConstraintQualification: 'resolved'
});

projected = projection(artifact([['Schema Constraint', 'example.non-artifact.v1']]));
assert.deepEqual(pick(classification(projected)), {
  declared: '', resolved: 'non-artifact', qualification: 'resolved-by-authority', authority: 'schema-constraint', schemaConstraintQualification: 'resolved'
});

projected = projection(artifact([['Target Kind', 'artifact'], ['Schema Constraint', 'example.artifact.v1']]));
assert.deepEqual(pick(classification(projected)), {
  declared: 'artifact', resolved: 'artifact', qualification: 'agreement', authority: 'explicit+schema-constraint', schemaConstraintQualification: 'resolved'
});

const contradictoryMarkdown = artifact([['Target Kind', 'artifact'], ['Schema Constraint', 'example.non-artifact.v1']]);
const contradictoryValidation = validatePortableContractInstance({ markdown: contradictoryMarkdown, compiledContract: compiled, resolvers: authorities });
projected = projectPortableContractInstance({ markdown: contradictoryMarkdown, compiledContract: compiled, resolvers: authorities });
assert.equal(contradictoryValidation.findings.some((item) => item.code === 'portable.contract.classification.contradiction'), true);
assert.deepEqual(pick(classification(projected)), {
  declared: 'artifact', resolved: '', qualification: 'contradictory', authority: 'conflicting-authorities', schemaConstraintQualification: 'resolved'
});

const unresolvedResolvers = { schemaAuthorities: {} };
const explicitUnresolvedMarkdown = artifact([['Target Kind', 'artifact'], ['Schema Constraint', 'example.unresolved.v1']]);
const explicitUnresolvedValidation = validatePortableContractInstance({ markdown: explicitUnresolvedMarkdown, compiledContract: compiled, resolvers: unresolvedResolvers });
projected = projectPortableContractInstance({ markdown: explicitUnresolvedMarkdown, compiledContract: compiled, resolvers: unresolvedResolvers });
assert.equal(explicitUnresolvedValidation.findings.some((item) => item.code === 'portable.contract.classification.schema.unresolved'), true);
assert.deepEqual(pick(classification(projected)), {
  declared: 'artifact', resolved: 'artifact', qualification: 'explicit', authority: 'explicit-declaration', schemaConstraintQualification: 'unresolved'
});

const unknownMarkdown = artifact([['Target Kind', 'unknown'], ['Schema Constraint', 'example.artifact.v1']]);
projected = projection(unknownMarkdown);
assert.deepEqual(pick(classification(projected)), {
  declared: 'unknown', resolved: 'unknown', qualification: 'preserved-unknown', authority: 'explicit-declaration', schemaConstraintQualification: 'resolved'
});

projected = projection(artifact());
assert.deepEqual(pick(classification(projected)), {
  declared: '', resolved: '', qualification: 'unresolved', authority: '', schemaConstraintQualification: 'absent'
});

const absentUnresolvedMarkdown = artifact([['Schema Constraint', 'example.unresolved.v1']]);
const absentUnresolvedValidation = validatePortableContractInstance({ markdown: absentUnresolvedMarkdown, compiledContract: compiled, resolvers: unresolvedResolvers });
projected = projectPortableContractInstance({ markdown: absentUnresolvedMarkdown, compiledContract: compiled, resolvers: unresolvedResolvers });
assert.equal(absentUnresolvedValidation.findings.some((item) => item.code === 'portable.contract.classification.schema.unresolved'), true, 'validation and projection share unresolved schema-authority truth');
assert.equal(classification(projected).qualification, 'unresolved');
assert.equal(classification(projected).schemaConstraint.qualification, 'unresolved');

const sourceValidation = validatePortableContractInstance({ markdown: unknownMarkdown, compiledContract: compiled, resolvers: authorities });
const entryBefore = JSON.stringify(sourceValidation.declarations[0].sections[0].entries[0]);
const sourceMarkdownBefore = unknownMarkdown;
const coherentProjection = projectPortableContractInstance({ markdown: unknownMarkdown, compiledContract: compiled, resolvers: authorities });
assert.equal(JSON.stringify(sourceValidation.declarations[0].sections[0].entries[0]), entryBefore, 'projection does not mutate independently parsed declaration/source truth');
assert.equal(unknownMarkdown, sourceMarkdownBefore, 'projection does not mutate source markdown material');
assert.equal(coherentProjection.validation.findings.some((item) => item.code === 'portable.contract.unknown.preserved'), true, 'projection returns the validation produced under its own authority context');

assert.throws(() => projectPortableContractInstance({
  markdown: contradictoryMarkdown,
  compiledContract: compiled,
  validation: contradictoryValidation,
  resolvers: { schemaAuthorities: { 'example.non-artifact.v1': { targetKind: 'artifact' } } }
}), /owns validation/, 'precomputed validation cannot be mixed with a different projection authority context');

assert.throws(() => projectPortableContractInstance({
  markdown: absentUnresolvedMarkdown,
  compiledContract: compiled,
  validation: absentUnresolvedValidation,
  resolvers: authorities
}), /owns validation/, 'unresolved validation cannot be combined with a separately resolved projection context');

console.log('✓ portable resolved contract-instance projection preserves declared/resolved classification truth');

function pick(item) {
  return {
    declared: item.declared,
    resolved: item.resolved,
    qualification: item.qualification,
    authority: item.authority,
    schemaConstraintQualification: item.schemaConstraint.qualification
  };
}
