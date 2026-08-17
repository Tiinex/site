import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePortableSchemaContractChain } from '../schema/contract.compile.js';
import { indexPortableMaterials, resolvePortableMaterialReference } from './material.graph.js';
import { compilePortableSemanticPackage } from './semantic.package.js';
import { selectSemanticPackageManifest } from './semantic.package.graph.js';

const fixture = async (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const root = await fixture('tiinex.root.v1.package-authority.contract-fixture.md');
const semanticPackageSchema = await fixture('tiinex.semantic.package.v1.contract-fixture.md');
const companionSchema = await fixture('tiinex.schema.transition.companion.v1.contract-fixture.md');
const transitionSchema = await fixture('tiinex.transition.definition.v1.package-contract-fixture.md');
const contracts = Object.freeze({
  semanticPackage: compilePortableSchemaContractChain([root, semanticPackageSchema]),
  schemaTransitionCompanion: compilePortableSchemaContractChain([root, companionSchema]),
  transitionDefinition: compilePortableSchemaContractChain([root, transitionSchema])
});

// A1: relative current-package Transition reference remains valid.
let materials = basePackageWithSchemas();
materials.push(mat('local-transition', 'pkg/.transitions/local.trace.md', transition('local', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('task-comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', [
  { name: 'local', reference: '[Local](.transitions/local.trace.md)' }
])));
let result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'resolved');
assert.equal(result.companions[0].attachmentSet.attachments[0].transitionRepresentationKey, 'local-transition');

// A2: relative reference cannot cross into an explicitly included nested package.
materials = basePackageWithSchemas();
materials[0] = mat('pkg', 'pkg/package.trace.md', packageManifest({
  bindings: localBindings(),
  included: [{ name: 'nested', reference: '[Nested](nested/package.trace.md)' }]
}));
materials.push(mat('nested-pkg', 'pkg/nested/package.trace.md', packageManifest({ name: 'Nested' })));
materials.push(mat('nested-transition', 'pkg/nested/.transitions/nested.trace.md', transition('nested', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('task-comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', [
  { name: 'nested', reference: '[Nested](nested/.transitions/nested.trace.md)' }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'invalid');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'invalid');
assert.equal(result.companions[0].attachmentSet.attachments[0].transitionRepresentationKey, '');
assert.equal(result.companions[0].attachmentSet.attachments[0].transitionPath, '');

// A3: absolute included-nested reference is eligible because the package route is explicit.
const nestedTransitionUrl = 'https://packages.test/nested/t.trace.md';
materials = basePackageWithSchemas();
materials[0] = mat('pkg', 'pkg/package.trace.md', packageManifest({
  bindings: localBindings(),
  included: [{ name: 'nested', reference: '[Nested](nested/package.trace.md)' }]
}));
materials.push(mat('nested-pkg', 'pkg/nested/package.trace.md', packageManifest({ name: 'Nested' })));
materials.push(mat('nested-transition', 'pkg/nested/off-locality.trace.md', transition('nested', '1', 'tiinex.topic.v1', 'tiinex.task.v1'), { url: nestedTransitionUrl }));
materials.push(mat('task-comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', [
  { name: 'nested', reference: `[Nested](${nestedTransitionUrl})` }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'resolved');
assert.equal(result.companions[0].attachmentSet.attachments[0].transitionRepresentationKey, 'nested-transition');

// A4: absolute external direct and transitive package references require explicit graph reachability.
const aPackageUrl = 'https://packages.test/a/package.trace.md';
const bPackageUrl = 'https://packages.test/b/package.trace.md';
const bTransitionUrl = 'https://packages.test/b/t.trace.md';
materials = basePackageWithSchemas();
materials[0] = mat('pkg', 'pkg/package.trace.md', packageManifest({ bindings: localBindings(), external: [
  { name: 'a', reference: `[A](${aPackageUrl})` }
] }));
materials.push(mat('a-pkg', 'ext/a/package.trace.md', packageManifest({ name: 'A', external: [
  { name: 'b', reference: `[B](${bPackageUrl})` }
] }), { url: aPackageUrl }));
materials.push(mat('b-pkg', 'ext/b/package.trace.md', packageManifest({ name: 'B' }), { url: bPackageUrl }));
materials.push(mat('b-transition', 'ext/b/off-locality.trace.md', transition('b', '1', 'tiinex.topic.v1', 'tiinex.task.v1'), { url: bTransitionUrl }));
materials.push(mat('task-comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', [
  { name: 'b', reference: `[B](${bTransitionUrl})` }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'resolved');

const unreachableTransitionUrl = 'https://packages.test/unreachable/t.trace.md';
materials = basePackageWithSchemas();
materials.push(mat('unreachable-pkg', 'unreachable/package.trace.md', packageManifest({ name: 'Unreachable' }), { url: 'https://packages.test/unreachable/package.trace.md' }));
materials.push(mat('unreachable-transition', 'unreachable/t.trace.md', transition('unreachable', '1', 'tiinex.topic.v1', 'tiinex.task.v1'), { url: unreachableTransitionUrl }));
materials.push(mat('task-comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', [
  { name: 'unreachable', reference: `[Unreachable](${unreachableTransitionUrl})` }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'unresolved');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'unresolved');
assert.equal(result.companions[0].attachmentSet.attachments[0].transitionRepresentationKey, '');

// A5: relative Schema Resolution Binding cannot cross into an included nested package.
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({
    included: [{ name: 'nested', reference: '[Nested](nested/package.trace.md)' }],
    bindings: [{ id: 'tiinex.task.v1', schemaReference: '[Task](nested/task.schema.md)', packageReference: '[Nested](nested/package.trace.md)' }]
  })),
  mat('nested-pkg', 'pkg/nested/package.trace.md', packageManifest({ name: 'Nested' })),
  mat('nested-task', 'pkg/nested/task.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').qualification, 'invalid');
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').target, null);

// A6: an absolute Schema Reference may resolve inside an explicitly included nested package.
const nestedSchemaUrl = 'https://packages.test/nested/task.schema.md';
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({
    included: [{ name: 'nested', reference: '[Nested](nested/package.trace.md)' }],
    bindings: [{ id: 'tiinex.task.v1', schemaReference: `[Task](${nestedSchemaUrl})`, packageReference: '[Nested](nested/package.trace.md)' }]
  })),
  mat('nested-pkg', 'pkg/nested/package.trace.md', packageManifest({ name: 'Nested' })),
  mat('nested-task', 'pkg/nested/task.schema.md', schemaDoc('tiinex.task.v1'), { url: nestedSchemaUrl })
];
result = compile('pkg', materials);
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').qualification, 'resolved');
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').target.representationKey, 'nested-task');

// B1: ambiguous companion Schema Reference preserves candidate evidence but selects no material authority.
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('task-a', 'pkg/task.schema.md', schemaDoc('tiinex.task.v1')),
  mat('task-b', 'pkg/task.schema.md', schemaDoc('tiinex.task.v1')),
  mat('comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', []))
];
result = compile('pkg', materials);
const ambiguousBinding = result.companions[0].schemaBinding;
assert.equal(ambiguousBinding.qualification, 'ambiguous');
assert.equal(ambiguousBinding.representationKey, '');
assert.equal(ambiguousBinding.schemaId, '');
assert.equal(ambiguousBinding.path, '');
assert.equal(ambiguousBinding.candidates.length, 2);
assert.equal(result.schemaAttachments.every((item) => item.state === 'absent'), true);

// B2: ambiguous Transition Reference never exposes first-candidate key/path as target authority.
materials = basePackageWithSchemas();
materials.push(mat('t-a', 'pkg/.transitions/shared.trace.md', transition('a', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('t-b', 'pkg/.transitions/shared.trace.md', transition('b', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', [
  { name: 'ambiguous', reference: '[Ambiguous](.transitions/shared.trace.md)' }
])));
result = compile('pkg', materials);
const ambiguousAttachment = result.companions[0].attachmentSet.attachments[0];
assert.equal(ambiguousAttachment.referenceQualification, 'ambiguous');
assert.equal(ambiguousAttachment.transitionRepresentationKey, '');
assert.equal(ambiguousAttachment.transitionPath, '');

// B3: unresolved references likewise expose no selected target authority.
materials = basePackageWithSchemas();
materials.push(mat('comp', 'pkg/task-transitions.trace.md', companion('task.schema.md', [
  { name: 'missing', reference: '[Missing](.transitions/missing.trace.md)' }
])));
result = compile('pkg', materials);
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'unresolved');
assert.equal(result.companions[0].attachmentSet.attachments[0].transitionRepresentationKey, '');
assert.equal(result.companions[0].attachmentSet.attachments[0].transitionPath, '');

// C1-C3: duplicate supplied representationKey is always a v1 material-graph conflict.
for (const supplied of [
  [mat('same', 'pkg/package.trace.md', packageManifest()), mat('same', 'pkg/task.schema.md', schemaDoc('tiinex.task.v1'))],
  [mat('same', 'pkg/package.trace.md', packageManifest()), mat('same', 'pkg/package.trace.md', schemaDoc('tiinex.task.v1'))],
  [mat('same', 'pkg/package.trace.md', packageManifest()), mat('same', 'pkg/package.trace.md', packageManifest())]
]) {
  result = compile('pkg/package.trace.md', supplied);
  assert.equal(result.status, 'invalid');
  assert.equal(hasFinding(result, 'portable.material-graph.representation-key.duplicate'), true);
  assert.equal(result.packageGraph.nodes.length, 0, 'representation-key conflicts fail before package authority compilation');
}

// C4: different keys at one path remain ambiguous rather than collapsing.
let index = indexPortableMaterials([
  mat('one', 'pkg/shared.md', schemaDoc('one.v1')),
  mat('two', 'pkg/shared.md', schemaDoc('two.v1'))
]);
let resolution = resolvePortableMaterialReference(index, { path: 'pkg/from.md' }, 'shared.md');
assert.equal(resolution.qualification, 'ambiguous');
assert.equal(resolution.candidates.length, 2);

// D: nullish aliases are absent; literal user-supplied "undefined" remains literal authority.
index = indexPortableMaterials([mat('pkg', 'pkg/package.trace.md', packageManifest())]);
assert.equal(index.byReference.has('undefined'), false);
assert.equal(selectSemanticPackageManifest(index, 'undefined').qualification, 'unresolved');
result = compile('undefined', [mat('pkg', 'pkg/package.trace.md', packageManifest())]);
assert.equal(result.status, 'invalid');

index = indexPortableMaterials([mat('pkg', 'pkg/package.trace.md', packageManifest(), { reference: 'undefined' })]);
assert.equal(index.byReference.has('undefined'), true);
assert.equal(selectSemanticPackageManifest(index, 'undefined').qualification, 'resolved');
result = compile('undefined', [mat('pkg', 'pkg/package.trace.md', packageManifest(), { reference: 'undefined' })]);
assert.equal(result.status, 'valid');

// E1: pathless manifest cannot establish manifest-directory boundary or absorb root-level supplied material.
materials = [
  mat('pkg', '', packageManifest()),
  mat('task', 'task.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(result.status, 'invalid');
assert.equal(hasFinding(result, 'portable.semantic-package.boundary.manifest-path-missing'), true);
assert.deepEqual(result.packageGraph.nodes[0].localMaterialKeys, ['pkg']);

// E2: a legitimate repository-root package has non-empty manifest path and empty dirname; it remains valid.
materials = [
  mat('pkg', 'package.trace.md', packageManifest()),
  mat('task', 'task.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes[0].packageRoot, '');
assert.equal(result.packageGraph.nodes[0].localSchemaKeys.includes('task'), true);

// F1: a valid repository-root package must not auto-discover a pathless schema.
materials = [
  mat('pkg', 'package.trace.md', packageManifest()),
  mat('ghost', '', schemaDoc('tiinex.ghost.v1'))
];
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes[0].packageRoot, '');
assert.deepEqual(result.packageGraph.nodes[0].localMaterialKeys, ['pkg']);
assert.equal(result.packageGraph.nodes[0].localSchemaKeys.includes('ghost'), false);
assert.equal(result.schemaResolutions.some((item) => item.schemaId === 'tiinex.ghost.v1'), false);

// F2: a pathless companion remains supplied evidence but is not package-local or auto-compiled.
materials = [
  mat('pkg', 'package.trace.md', packageManifest()),
  mat('task', 'task.schema.md', schemaDoc('tiinex.task.v1')),
  mat('ghost-comp', '', companion('task.schema.md', []))
];
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes[0].localCompanionKeys.includes('ghost-comp'), false);
assert.equal(result.companions.length, 0);

// F3: a pathless Transition remains supplied evidence but is not package-local or auto-discovered.
materials = [
  mat('pkg', 'package.trace.md', packageManifest()),
  mat('ghost-transition', '', transition('ghost', '1', 'tiinex.topic.v1', 'tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes[0].localTransitionKeys.includes('ghost-transition'), false);
assert.equal(result.transitionRegistry.length, 0);

// F4: a real root-level schema remains package-local.
materials = [
  mat('pkg', 'package.trace.md', packageManifest()),
  mat('task', 'task.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes[0].localSchemaKeys.includes('task'), true);

// F5: a real root-level companion remains package-local and auto-compiled.
materials = [
  mat('pkg', 'package.trace.md', packageManifest()),
  mat('task', 'task.schema.md', schemaDoc('tiinex.task.v1')),
  mat('task-comp', 'task-transitions.trace.md', companion('task.schema.md', []))
];
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes[0].localCompanionKeys.includes('task-comp'), true);
assert.equal(result.companions.length, 1);
assert.equal(result.companions[0].representationKey, 'task-comp');

// F6: a real root-level .transitions artifact remains auto-discovered.
materials = [
  mat('pkg', 'package.trace.md', packageManifest()),
  mat('root-transition', '.transitions/root.trace.md', transition('root', '1', 'tiinex.topic.v1', 'tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes[0].localTransitionKeys.includes('root-transition'), true);
assert.equal(result.transitionRegistry.some((item) => item.representationKey === 'root-transition'), true);

// Adjacent alias authority: duplicate absolute alias remains ambiguous and no package is selected by first/last precedence.
const duplicateAlias = 'https://packages.test/duplicate/package.trace.md';
index = indexPortableMaterials([
  mat('one', 'one/package.trace.md', packageManifest({ name: 'One' }), { url: duplicateAlias }),
  mat('two', 'two/package.trace.md', packageManifest({ name: 'Two' }), { url: duplicateAlias })
]);
assert.equal(selectSemanticPackageManifest(index, duplicateAlias).qualification, 'ambiguous');

console.log('✓ semantic-package reference boundary, authority monotonicity, material identity and alias/path hygiene passed');

function compile(selectedManifest, supplied) {
  return compilePortableSemanticPackage({ selectedManifest, materials: supplied, contracts });
}

function mat(id, path, markdown, extra = {}) {
  return { id, path, markdown, ...extra };
}

function artifact(schemaId, title, body) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-17 00:00:00\n\n---\n\n# ${title}\n\n${body.trim()}\n`;
}

function schemaDoc(schemaId) {
  return artifact(schemaId, schemaId, `## Schema Validation Contract\n\n### Identity\n\nRules\n\n- Synthetic schema authority fixture.`);
}

function packageManifest(options = {}) {
  const included = options.included ?? [];
  const external = options.external ?? [];
  const bindings = options.bindings ?? [];
  return artifact('tiinex.semantic.package.v1', options.name || 'Package', `
## Package Identity

- Package Name: ${options.name || 'Package'}
- Purpose: Authority-closure package fixture

## Package Boundary

- Boundary Root: manifest-directory
- Discovery Policy: recursive-within-boundary
- Nested Package Policy: explicit-only

## Included Packages

${declarationList(included, 'Package Reference')}

## External Package Dependencies

${declarationList(external, 'Package Reference')}

## Schema Resolution Bindings

${bindingList(bindings)}

## Interpretation Limits

- Does Not Mean: semantic ownership
- Must Not Be Used To Claim: applicability or execution
`);
}

function companion(schemaReference, attachments = []) {
  return artifact('tiinex.schema.transition.companion.v1', 'Schema Transition Companion', `
## Schema Binding

- Schema Reference: [Schema](${schemaReference})

## Transition Attachments

${declarationList(attachments, 'Transition Reference')}

## Interpretation Limits

- Does Not Mean: participation by itself
- Must Not Be Used To Claim: applicability or execution
`);
}

function transition(canonicalIdentifier, version, inputSchema, outputSchema) {
  return artifact('tiinex.transition.definition.v1', canonicalIdentifier, `
## Transition Identity

- Name: ${canonicalIdentifier}
- Version: ${version}
- Canonical Identifier: ${canonicalIdentifier}

## Input Roles

- input
  - Meaning: input
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: ${inputSchema}

## Output Roles

- output
  - Meaning: output
  - Minimum Count: 1
  - Maximum Count: 1
  - Target Kind: artifact
  - Schema Constraint: ${outputSchema}
`);
}

function basePackageWithSchemas() {
  return [
    mat('pkg', 'pkg/package.trace.md', packageManifest({ bindings: localBindings() })),
    mat('topic', 'pkg/topic.schema.md', schemaDoc('tiinex.topic.v1')),
    mat('task', 'pkg/task.schema.md', schemaDoc('tiinex.task.v1'))
  ];
}

function localBindings() {
  return [
    { id: 'tiinex.topic.v1', schemaReference: '[Topic](topic.schema.md)' },
    { id: 'tiinex.task.v1', schemaReference: '[Task](task.schema.md)' }
  ];
}

function declarationList(items, field) {
  if (!items.length) return '- none';
  return items.map((item) => `- ${item.name}\n  - ${field}: ${item.reference}`).join('\n');
}

function bindingList(bindings) {
  if (!bindings.length) return '- none';
  return bindings.map((binding) => `- ${binding.id}\n  - Schema Reference: ${binding.schemaReference}${binding.packageReference ? `\n  - Package Reference: ${binding.packageReference}` : ''}`).join('\n');
}

function schemaResolution(output, packageKey, schemaId) {
  return output.schemaResolutions.find((item) => item.packageKey === packageKey && item.schemaId === schemaId);
}

function hasFinding(output, code) {
  return output.findings.some((item) => item.code === code);
}
