import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePortableSchemaContract, compilePortableSchemaContractChain } from './contract.compile.js';
import { buildPortableSchemaGuide } from './schema.guide.js';
import { validatePortableContractInstance } from './contract.validate.js';
import { comparePortableSchemaSnapshots } from './schema.snapshot.js';
import { parsePortableSchemaDocument } from './schema.contract.js';

const canonicalCommit = '3c1987527c431660c4fc6eab4af24f503653034b';
const rootContract = await readFile(new URL('./fixtures/tiinex.root.v1.contract-fixture.md', import.meta.url), 'utf8');
const taskContract = await readFile(new URL('./fixtures/tiinex.task.v1.contract-fixture.md', import.meta.url), 'utf8');
const transitionContract = await readFile(new URL('./fixtures/tiinex.transition.definition.v1.contract-fixture.md', import.meta.url), 'utf8');
const staleTask = await readFile(new URL('../../../schemas/core/task/tiinex.task.v1.schema.md', import.meta.url), 'utf8');

const taskDocument = parsePortableSchemaDocument(taskContract);
assert.equal(taskDocument.envelopeSchemaId, 'tiinex.root.v1', 'Envelope Schema identity is exposed by the portable schema parser');
const task = compilePortableSchemaContract(taskContract);
assert.equal(task.schemaId, 'tiinex.task.v1');
assert.equal(task.envelopeSchemaId, 'tiinex.root.v1', 'compiled contract preserves Envelope Schema identity');
assert.deepEqual(task.creation.requiredSections, ['Objective', 'Done Criteria', 'Scope', 'Dependencies']);
assert.equal(task.creation.requiredInputs.includes('Objective'), true);
assert.equal(task.creation.requiredInputs.includes('Next Step'), false);

const transition = compilePortableSchemaContract(transitionContract);
const declarations = new Map(transition.declarations.map((entry) => [entry.group, entry]));
assert.deepEqual(declarations.get('Input Role Declaration').targetHeadings, ['## Input Roles']);
assert.deepEqual(declarations.get('Output Role Declaration').requiredFields, ['Meaning', 'Minimum Count', 'Maximum Count']);
assert.deepEqual(declarations.get('Lifecycle Effect Declaration').targetHeadings, ['### Lifecycle Effects']);
assert.deepEqual(declarations.get('Parent Effect Declaration').targetHeadings, ['### Parent Effects']);
assert.deepEqual(declarations.get('Relation Effect Declaration').targetHeadings, ['## Relation Effects']);
assert.deepEqual(declarations.get('Destination Binding Declaration').targetHeadings, ['### Destination Bindings']);
assert.deepEqual(declarations.get('Output Placement Declaration').targetHeadings, ['### Output Placements']);
assert.equal(transition.constraints.some((item) => item.kind === 'classification-agreement'), true);
assert.equal(transition.constraints.some((item) => item.kind === 'target-schema-authority'), true);
assert.equal(transition.constraints.some((item) => item.kind === 'target-schema-authority-via-reference'), true);
assert.equal(transition.validation.requiredHeadings.some((item) => item.level === 2 && item.title === 'Transition Identity'), true, 'explicit Required Shape heading depth is compiled');
const transitionGuide = buildPortableSchemaGuide({
  schemaId: 'tiinex.transition.definition.v1',
  task: 'read',
  detail: 'standard',
  files: [{ path: '.topics/.schemas/transition/definition/tiinex.transition.definition.v1.schema.md', content: transitionContract }]
});
assert.equal(transitionGuide.guide.declarationContracts.some((item) => item.group === 'Output Role Declaration'), true);

const rootToTransition = compilePortableSchemaContractChain([rootContract, transitionContract]);
assert.deepEqual(rootToTransition.lineage, ['tiinex.root.v1', 'tiinex.transition.definition.v1']);
assert.equal(rootToTransition.lineageQualification.state, 'valid');
assert.equal(rootToTransition.lineageQualification.complete, true);
assert.equal(rootToTransition.validation.requiredFields.includes('Current'), true);
assert.equal(rootToTransition.validation.requiredFields.includes('Method Entry'), false);
assert.equal(rootToTransition.validation.requiredEntries.some((item) => item.entries.includes('Method Entry')), true);
assert.equal(rootToTransition.declarations.some((item) => item.group === 'Method Entry' && item.targetHeadings.includes('Continuity Integrity')), true);

const rootToTask = compilePortableSchemaContractChain([rootContract, taskContract]);
assert.deepEqual(rootToTask.lineage, ['tiinex.root.v1', 'tiinex.task.v1']);
assert.equal(rootToTask.lineageQualification.state, 'valid');
assert.equal(rootToTask.creation.requiredSections.includes('Objective'), true);

const additiveParent = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: example.parent.v1
  - Created At: 2026-08-15 00:00:00

---

# Parent

## Schema Validation Contract

### Shared

Required Fields

- A

Rules

- parent-rule
`;
const additiveChild = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: example.parent.v1
  - Trace: parent.trace.md
  - Origin: parent.trace.md
- Current
  - Current Schema: example.child.v1
  - Created At: 2026-08-15 00:00:00

---

# Child

## Schema Validation Contract

### Shared

Required Fields

- B

Rules

- child-rule
`;
const additiveChain = compilePortableSchemaContractChain([additiveParent, additiveChild]);
assert.equal(additiveChain.lineageQualification.state, 'valid');
const sharedGroup = additiveChain.validation.groups.find((group) => group.name === 'Shared');
assert.ok(sharedGroup, 'same-named parent/child contract group remains represented once');
assert.deepEqual(sharedGroup.categories.find((category) => category.name === 'Required Fields').items, ['A', 'B']);
assert.deepEqual(sharedGroup.categories.find((category) => category.name === 'Rules').items, ['parent-rule', 'child-rule']);

const additiveCreationParent = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: example.creation.parent.v1
  - Created At: 2026-08-15 00:00:00

---

# Parent

## Artifact Creation Contract

### Inputs

Required Fields

- Parent Input

Rules

- parent-creation-rule
`;
const additiveCreationChild = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: example.creation.parent.v1
  - Trace: parent.trace.md
  - Origin: parent.trace.md
- Current
  - Current Schema: example.creation.child.v1
  - Created At: 2026-08-15 00:00:00

---

# Child

## Artifact Creation Contract

### Inputs

Required Fields

- Child Input

Rules

- child-creation-rule
`;
const additiveCreationChain = compilePortableSchemaContractChain([additiveCreationParent, additiveCreationChild]);
assert.equal(additiveCreationChain.lineageQualification.state, 'valid');
assert.deepEqual(additiveCreationChain.creation.requiredInputs, ['Parent Input', 'Child Input']);
const creationInputsGroup = additiveCreationChain.creation.groups.find((group) => group.name === 'Inputs');
assert.ok(creationInputsGroup, 'same-named creation group remains represented once');
assert.deepEqual(creationInputsGroup.categories.find((category) => category.name === 'Required Fields').items, ['Parent Input', 'Child Input']);
assert.deepEqual(creationInputsGroup.categories.find((category) => category.name === 'Rules').items, ['parent-creation-rule', 'child-creation-rule']);
assert.deepEqual(additiveCreationChain.guidance.creationRules, ['parent-creation-rule', 'child-creation-rule']);

const additiveCreationOptionalChild = additiveCreationChild.replace('Required Fields\n\n- Child Input', 'Optional Fields\n\n- Parent Input');
const additiveCreationRequiredDominance = compilePortableSchemaContractChain([additiveCreationParent, additiveCreationOptionalChild]);
assert.deepEqual(additiveCreationRequiredDominance.creation.requiredInputs, ['Parent Input']);
assert.equal(additiveCreationRequiredDominance.creation.optionalInputs.includes('Parent Input'), false, 'inherited required creation input is not weakened by descendant optional presentation');

const requiredDominatesOptionalChild = additiveChild.replace('Required Fields\n\n- B', 'Optional Fields\n\n- A');
const requiredDominatesOptionalChain = compilePortableSchemaContractChain([additiveParent, requiredDominatesOptionalChild]);
assert.deepEqual(requiredDominatesOptionalChain.validation.requiredFields, ['A']);
assert.equal(requiredDominatesOptionalChain.validation.optionalFields.includes('A'), false, 'inherited required truth is not weakened by descendant optional presentation');

const sameLabelOwnership = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: example.same-label.v1
  - Created At: 2026-08-15 00:00:00

---

# Same Label Ownership

## Schema Validation Contract

### Body

Required Fields

- Meaning

### Thing Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Meaning

Rules

- Entries under \`## Things\` are repeated named declarations using this shape.
`;
const sameLabelCompiled = compilePortableSchemaContract(sameLabelOwnership);
assert.equal(sameLabelCompiled.validation.requiredFields.includes('Meaning'), true, 'ordinary Body field survives same-label declaration ownership');
const thingDeclaration = sameLabelCompiled.declarations.find((entry) => entry.group === 'Thing Declaration');
assert.ok(thingDeclaration, 'Thing Declaration remains compiled as a declaration contract');
assert.equal(thingDeclaration.requiredFields.includes('Meaning'), true, 'same Meaning label remains declaration-owned in declaration scope');

const declarationMeaningOnly = validatePortableContractInstance({
  markdown: `# Artifact

## Things

- thing
  - Meaning: declaration meaning
`,
  compiledContract: sameLabelCompiled
});
assert.equal(declarationMeaningOnly.status, 'incomplete', 'declaration-owned Meaning cannot satisfy ordinary Meaning requirement');
assert.equal(declarationMeaningOnly.findings.some((item) => item.code === 'portable.contract.field.required.missing' && item.field === 'Meaning'), true);

const ordinaryAndDeclarationMeaning = validatePortableContractInstance({
  markdown: `# Artifact

- Meaning: ordinary meaning

## Things

- thing
  - Meaning: declaration meaning
`,
  compiledContract: sameLabelCompiled
});
assert.equal(ordinaryAndDeclarationMeaning.status, 'valid', 'ordinary and declaration Meaning namespaces can both be satisfied');

const ordinaryMeaningOnly = validatePortableContractInstance({
  markdown: `# Artifact

- Meaning: ordinary meaning

## Things

- thing
`,
  compiledContract: sameLabelCompiled
});
assert.equal(ordinaryMeaningOnly.status, 'incomplete', 'ordinary Meaning cannot satisfy declaration-owned Meaning requirement');
assert.equal(ordinaryMeaningOnly.findings.some((item) => item.code === 'portable.contract.declaration.field.required.missing' && item.group === 'Thing Declaration' && item.field === 'Meaning'), true);

function machineSyntaxContract({ section = 'Schema Validation Contract', category = 'Required Fields' } = {}) {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: example.machine-syntax.v1
  - Created At: 2026-08-15 00:00:00

---

# Machine Syntax Fixture

## ${section}

### Body

${category}

- Exact Field
`;
}

const exactMachineSyntax = compilePortableSchemaContract(machineSyntaxContract());
assert.deepEqual(exactMachineSyntax.validation.requiredFields, ['Exact Field']);
assert.deepEqual(compilePortableSchemaContract(machineSyntaxContract({ section: 'schema validation contract' })).validation.requiredFields, [], 'lowercase machine-authoritative section is not canonical authority');
assert.deepEqual(compilePortableSchemaContract(machineSyntaxContract({ section: 'Schema-Validation Contract' })).validation.requiredFields, [], 'punctuation-variant machine-authoritative section is not canonical authority');
assert.deepEqual(compilePortableSchemaContract(machineSyntaxContract({ category: 'required fields' })).validation.requiredFields, [], 'lowercase category label is not canonical authority');
assert.deepEqual(compilePortableSchemaContract(machineSyntaxContract({ category: 'Required-Fields' })).validation.requiredFields, [], 'punctuation-variant category label is not canonical authority');

function freshnessContract({ category, items }) {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: example.freshness.v1
  - Created At: 2026-08-15 00:00:00

---

# Freshness Fixture

## Schema Validation Contract

### Body

${category}

${items.map((item) => `- ${item}`).join('\n')}
`;
}

const unorderedRequiredFields = comparePortableSchemaSnapshots({
  candidate: { markdown: freshnessContract({ category: 'Required Fields', items: ['A', 'B'] }), authority: { repository: 'candidate' } },
  reference: { markdown: freshnessContract({ category: 'Required Fields', items: ['B', 'A'] }), authority: { repository: 'reference' } }
});
assert.equal(unorderedRequiredFields.status, 'equivalent-current', 'Required Fields list order is semantically insignificant');

const unorderedAllowedLabels = comparePortableSchemaSnapshots({
  candidate: { markdown: freshnessContract({ category: 'Allowed Labels', items: ['x', 'y'] }), authority: { repository: 'candidate' } },
  reference: { markdown: freshnessContract({ category: 'Allowed Labels', items: ['y', 'x'] }), authority: { repository: 'reference' } }
});
assert.equal(unorderedAllowedLabels.status, 'equivalent-current', 'Allowed Labels list order is semantically insignificant');

const orderedItems = comparePortableSchemaSnapshots({
  candidate: { markdown: freshnessContract({ category: 'Ordering', items: ['A', 'B'] }), authority: { repository: 'candidate' } },
  reference: { markdown: freshnessContract({ category: 'Ordering', items: ['B', 'A'] }), authority: { repository: 'reference' } }
});
assert.equal(orderedItems.status, 'materially-stale', 'Ordering list order remains semantically significant');

for (const category of ['ordering', 'ORDERING', 'Ordering-']) {
  const nonCanonicalOrdering = comparePortableSchemaSnapshots({
    candidate: { markdown: freshnessContract({ category, items: ['A', 'B'] }), authority: { repository: 'candidate' } },
    reference: { markdown: freshnessContract({ category, items: ['B', 'A'] }), authority: { repository: 'reference' } }
  });
  assert.equal(nonCanonicalOrdering.status, 'equivalent-current', `${category} does not inherit canonical Ordering order semantics`);
}

function lineageFreshnessContract(parentSchemaId) {
  const parent = parentSchemaId ? `- Parent\n  - Parent Schema: ${parentSchemaId}\n  - Trace: parent.trace.md\n  - Origin: parent.trace.md\n` : '';
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
${parent}- Current
  - Current Schema: example.child.v1
  - Created At: 2026-08-15 00:00:00

---

# Child

## Schema Validation Contract

### Body

Required Fields

- A
`;
}

const parentIdentityFreshness = comparePortableSchemaSnapshots({
  candidate: { markdown: lineageFreshnessContract('parent.a.v1'), authority: { repository: 'candidate' } },
  reference: { markdown: lineageFreshnessContract('parent.b.v1'), authority: { repository: 'reference' } }
});
assert.equal(parentIdentityFreshness.status, 'materially-stale', 'parent schema identity participates in semantic freshness');
assert.equal(parentIdentityFreshness.differences.some((item) => item.startsWith('parent schema identity differs:')), true);

function envelopeFreshnessContract(envelopeSchemaId) {
  return `# Continuity Context

- Envelope Schema: ${envelopeSchemaId}
- Parent
  - Parent Schema: parent.a.v1
  - Trace: parent.trace.md
  - Origin: parent.trace.md
- Current
  - Current Schema: example.child.v1
  - Created At: 2026-08-15 00:00:00

---

# Child

## Schema Validation Contract

### Body

Required Fields

- A
`;
}

const envelopeIdentityFreshness = comparePortableSchemaSnapshots({
  candidate: { markdown: envelopeFreshnessContract('tiinex.root.v1'), authority: { repository: 'candidate' } },
  reference: { markdown: envelopeFreshnessContract('other.root.v1'), authority: { repository: 'reference' } }
});
assert.equal(envelopeIdentityFreshness.status, 'materially-stale', 'Envelope Schema identity participates in semantic freshness');
assert.equal(envelopeIdentityFreshness.differences.some((item) => item.startsWith('envelope schema identity differs:')), true);

const unrelatedTaskToTransition = compilePortableSchemaContractChain([taskContract, transitionContract]);
assert.equal(unrelatedTaskToTransition.lineageQualification.state, 'contradictory');
assert.deepEqual(unrelatedTaskToTransition.lineage, [], 'mismatched inputs are not presented as a valid lineage');
assert.deepEqual(unrelatedTaskToTransition.suppliedLineage, ['tiinex.task.v1', 'tiinex.transition.definition.v1']);
assert.equal(unrelatedTaskToTransition.validation.requiredFields.includes('Current'), false, 'mismatched parent contract is not silently merged into leaf truth');
assert.equal(unrelatedTaskToTransition.creation.requiredInputs.includes('Objective'), false, 'mismatched Task creation truth is not merged into Transition leaf truth');

const transitionWithoutParentMaterial = compilePortableSchemaContractChain([transitionContract]);
assert.equal(transitionWithoutParentMaterial.lineageQualification.state, 'unresolved');
assert.equal(transitionWithoutParentMaterial.lineageQualification.complete, false);
assert.deepEqual(transitionWithoutParentMaterial.lineage, ['tiinex.transition.definition.v1']);

const topicToTask = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.transition.definition.v1
  - Created At: 2026-08-15 00:00:00

---

# Topic To Task

## Transition Identity

- Name: Topic to Task
- Version: 1
- Canonical Identifier: topic-to-task

## Purpose And Scope

- Purpose: Create one Task from one bound Topic.
- Semantic Boundary: Reusable transition semantics only.

## Input Roles

- source-topic
  - Meaning: Topic used as the direct continuity source.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.topic.v1
  - Acquisition Policy: existing-only

## Output Roles

- task
  - Meaning: Task created by the invocation.
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: tiinex.task.v1
  - Generation Binding: target-schema

## Lifecycle And Continuity Effects

### Lifecycle Effects

- create-task
  - Target Binding: task
  - Effect: create-new
  - Logical Continuity: new-subject
  - Required Materialization Operation: create

### Parent Effects

- task-continues-topic
  - Output Binding: task
  - Parent Binding: source-topic
  - Effect: set

## Relation Effects

- none

## Applicability And Conditions

- Applicability Meaning: exactly one suitable source-topic must be bound.

## Authoring Bindings

- none

## Placement Intent

### Destination Bindings

- destination-root
  - Meaning: writable root selected once for the Task.
  - Required: yes

### Output Placements

- task-placement
  - Output Binding: task
  - Placement Intent: new-materialization
  - Destination Binding: destination-root
  - Naming Authority: target-schema

## Interpretation Limits

- Does Not Prove: invocation or output existence.
- Must Not Be Inferred: source truth or mutation.
`;

const rootedTopicToTask = `${topicToTask}
# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture-integrity-value
`;

const rootChainValid = validatePortableContractInstance({ markdown: rootedTopicToTask, compiledContract: rootToTransition, resolvers: { schemaAuthorities: {
  'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
  'tiinex.task.v1': { targetKind: 'artifact', generation: true, fileNaming: true }
} } });
assert.equal(rootChainValid.status, 'valid');
assert.equal(rootChainValid.findings.some((item) => item.code === 'portable.contract.field.required.missing' && item.field === 'Current'), false);
assert.equal(rootChainValid.findings.some((item) => item.code === 'portable.contract.entry.required.missing' && item.entryContract === 'Method Entry'), false);

const wrongHeadingDepth = validatePortableContractInstance({
  markdown: rootedTopicToTask.replace('## Transition Identity', '### Transition Identity'),
  compiledContract: rootToTransition,
  resolvers: { schemaAuthorities: {
    'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
    'tiinex.task.v1': { targetKind: 'artifact', generation: true, fileNaming: true }
  } }
});
assert.equal(wrongHeadingDepth.status, 'incomplete');
assert.equal(wrongHeadingDepth.findings.some((item) => item.code === 'portable.contract.heading.required.missing' && item.section === 'Transition Identity' && item.level === 2), true, 'explicit heading depth mismatch is structural/incomplete');

const missingMethodEntry = validatePortableContractInstance({
  markdown: rootedTopicToTask.replace(/# Continuity Integrity[\s\S]*$/, '# Continuity Integrity\n'),
  compiledContract: rootToTransition
});
assert.equal(missingMethodEntry.findings.some((item) => item.code === 'portable.contract.entry.required.missing' && item.entryContract === 'Method Entry'), true);

const malformedMethodEntry = validatePortableContractInstance({
  markdown: rootedTopicToTask.replace('  - Towards: self\n', ''),
  compiledContract: rootToTransition
});
assert.equal(malformedMethodEntry.findings.some((item) => item.code === 'portable.contract.declaration.field.required.missing' && item.group === 'Method Entry' && item.field === 'Towards'), true);

const authorities = {
  schemaAuthorities: {
    'tiinex.topic.v1': { targetKind: 'artifact', generation: true, fileNaming: true },
    'tiinex.task.v1': { targetKind: 'artifact', generation: true, fileNaming: true }
  }
};

const positive = validatePortableContractInstance({ markdown: topicToTask, compiledContract: transition, resolvers: authorities });
assert.equal(positive.status, 'valid');
assert.equal(positive.findings.some((item) => item.code === 'portable.contract.member-mapping.unresolved'), false);
assert.equal(positive.declarations.find((group) => group.contract.group === 'Relation Effect Declaration').sections[0].entries[0].name, 'none');

const unknownKind = validatePortableContractInstance({
  markdown: topicToTask.replace('  - Target Kind: artifact\n  - Schema Constraint: tiinex.task.v1', '  - Target Kind: unknown\n  - Schema Constraint: tiinex.task.v1'),
  compiledContract: transition,
  resolvers: authorities
});
assert.equal(unknownKind.findings.some((item) => item.code === 'portable.contract.unknown.preserved' && item.field === 'Target Kind'), true);
assert.equal(unknownKind.findings.some((item) => item.code === 'portable.contract.classification.contradiction'), false);

const unknownMaximum = validatePortableContractInstance({
  markdown: topicToTask.replace('  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1', '  - Maximum Count: unknown\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1'),
  compiledContract: transition,
  resolvers: authorities
});
const sourceRole = unknownMaximum.declarations.find((group) => group.contract.group === 'Input Role Declaration').sections[0].entries[0];
assert.equal(sourceRole.fields['Maximum Count'], 'unknown');
assert.equal(unknownMaximum.findings.some((item) => item.code === 'portable.contract.unknown.preserved' && item.field === 'Maximum Count'), true);

const contradiction = validatePortableContractInstance({
  markdown: topicToTask,
  compiledContract: transition,
  resolvers: { schemaAuthorities: { ...authorities.schemaAuthorities, 'tiinex.task.v1': { targetKind: 'non-artifact', generation: true, fileNaming: true } } }
});
assert.equal(contradiction.status, 'contradictory');
assert.equal(contradiction.findings.some((item) => item.code === 'portable.contract.classification.contradiction'), true);

const unresolvedSchema = validatePortableContractInstance({
  markdown: topicToTask.replaceAll('tiinex.topic.v1', 'tiinex.unresolved.v1'),
  compiledContract: transition,
  resolvers: authorities
});
assert.equal(unresolvedSchema.findings.some((item) => item.code === 'portable.contract.classification.schema.unresolved'), true);
assert.equal(unresolvedSchema.findings.some((item) => item.code === 'portable.contract.classification.contradiction' && item.schemaId === 'tiinex.unresolved.v1'), false);

const invalidParticipantBinding = validatePortableContractInstance({
  markdown: topicToTask.replace('  - Target Binding: task', '  - Target Binding: destination-root'),
  compiledContract: transition,
  resolvers: authorities
});
assert.equal(invalidParticipantBinding.findings.some((item) => item.code === 'portable.contract.reference.unresolved' && item.value === 'destination-root'), true);

const mappingAmbiguous = validatePortableContractInstance({
  markdown: topicToTask.replace('  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1', '  - Maximum Count: 2\n  - Target Kind: artifact\n  - Schema Constraint: tiinex.topic.v1'),
  compiledContract: transition,
  resolvers: authorities
});
assert.equal(mappingAmbiguous.findings.some((item) => item.code === 'portable.contract.member-mapping.unresolved'), true);

const generationUnresolved = validatePortableContractInstance({
  markdown: topicToTask,
  compiledContract: transition,
  resolvers: { schemaAuthorities: { ...authorities.schemaAuthorities, 'tiinex.task.v1': { targetKind: 'artifact', generation: false, fileNaming: true } } }
});
assert.equal(generationUnresolved.findings.some((item) => item.code === 'portable.contract.authority.target-schema.unresolved'), true);

const namingUnresolved = validatePortableContractInstance({
  markdown: topicToTask,
  compiledContract: transition,
  resolvers: { schemaAuthorities: { ...authorities.schemaAuthorities, 'tiinex.task.v1': { targetKind: 'artifact', generation: true, fileNaming: false } } }
});
assert.equal(namingUnresolved.findings.some((item) => item.code === 'portable.contract.naming.target-schema.unresolved'), true);

const incomplete = validatePortableContractInstance({
  markdown: topicToTask.replace('  - Meaning: Task created by the invocation.\n', ''),
  compiledContract: transition,
  resolvers: authorities
});
assert.equal(incomplete.status, 'incomplete');
assert.equal(incomplete.findings.some((item) => item.code === 'portable.contract.declaration.field.required.missing'), true);

const freshness = comparePortableSchemaSnapshots({
  candidate: { markdown: staleTask, authority: { repository: 'Tiinex/site', commit: 'viewer-local-v313', path: 'src/schemas/core/task/tiinex.task.v1.schema.md' } },
  reference: { markdown: taskContract, authority: { repository: 'Tiinex/docs', commit: canonicalCommit, path: '.topics/.schemas/core/task/tiinex.task.v1.schema.md' } },
  expectedReferenceAuthority: { repository: 'Tiinex/docs', commit: canonicalCommit, path: '.topics/.schemas/core/task/tiinex.task.v1.schema.md' }
});
assert.equal(freshness.status, 'materially-stale');
assert.equal(freshness.differences.includes('creation contract differs'), true);

const equivalent = comparePortableSchemaSnapshots({
  candidate: { markdown: taskContract, authority: { repository: 'local-test' } },
  reference: { markdown: taskContract, authority: { repository: 'Tiinex/docs', commit: canonicalCommit } }
});
assert.equal(equivalent.status, 'equivalent-current');

console.log('✓ portable contract compilation, declaration validation, unknown preservation, and snapshot freshness passed');
