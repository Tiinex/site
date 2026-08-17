import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePortableSchemaContractChain } from '../schema/contract.compile.js';
import { compilePortableSemanticPackage } from './semantic.package.js';

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

// 1-3: single package, one/many schemas, zero/many distributed transitions.
let materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('topic', 'pkg/topic.schema.md', schemaDoc('tiinex.topic.v1'))
];
let result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.packageGraph.nodes.length, 1);
assert.equal(result.transitionRegistry.length, 0);
assert.equal(attachmentState(result, 'tiinex.topic.v1').state, 'absent');

materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('topic', 'pkg/topic.schema.md', schemaDoc('tiinex.topic.v1')),
  mat('task', 'pkg/task.schema.md', schemaDoc('tiinex.task.v1')),
  mat('t1', 'pkg/topic/.transitions/a-transition-definition.trace.md', transition('a', '1', 'tiinex.topic.v1', 'tiinex.task.v1')),
  mat('t2', 'pkg/deep/task/.transitions/b-transition-definition.trace.md', transition('b', '1', 'tiinex.task.v1', 'tiinex.topic.v1'))
];
result = compile('pkg', materials);
assert.equal(result.transitionRegistry.length, 2, 'all reachable distributed .transitions directories are discovered');
assert.deepEqual([...result.packageGraph.nodes[0].localSchemaKeys].sort(), ['task', 'topic']);

// 4-5: nested package boundary is a hard stop until explicitly included.
const nestedManifest = packageManifest({ name: 'Nested' });
materials = [
  mat('root-pkg', 'root/package.trace.md', packageManifest()),
  mat('root-schema', 'root/root.schema.md', schemaDoc('example.root.schema.v1')),
  mat('nested-pkg', 'root/nested/package.trace.md', nestedManifest),
  mat('nested-schema', 'root/nested/nested.schema.md', schemaDoc('example.nested.schema.v1')),
  mat('nested-transition', 'root/nested/.transitions/n-transition-definition.trace.md', transition('nested', '1', 'example.nested.schema.v1', 'example.nested.schema.v1'))
];
result = compile('root-pkg', materials);
assert.equal(result.packageGraph.nodes.length, 1);
assert.equal(result.transitionRegistry.length, 0);
assert.equal(result.packageGraph.nodes[0].localMaterialKeys.includes('nested-schema'), false);

materials[0] = mat('root-pkg', 'root/package.trace.md', packageManifest({ included: [{ name: 'nested', reference: '[Nested](nested/package.trace.md)' }] }));
result = compile('root-pkg', materials);
assert.equal(result.packageGraph.nodes.length, 2);
assert.equal(result.transitionRegistry.length, 1);
assert.equal(result.transitionRegistry[0].representationKey, 'nested-transition');

// 6-7: two sibling packages through an explicit integration package; exact external package authority.
const topicUrl = 'https://packages.test/topic/package.trace.md';
const taskUrl = 'https://packages.test/task/package.trace.md';
materials = [
  mat('integration', 'integration/package.trace.md', packageManifest({
    name: 'Integration',
    external: [
      { name: 'topic', reference: `[Topic](${topicUrl})` },
      { name: 'task', reference: `[Task](${taskUrl})` }
    ]
  })),
  mat('topic-pkg', 'packages/topic/package.trace.md', packageManifest({ name: 'Topic Package' }), { url: topicUrl }),
  mat('topic-schema', 'packages/topic/topic.schema.md', schemaDoc('tiinex.topic.v1'), { url: 'https://packages.test/topic/topic.schema.md' }),
  mat('task-pkg', 'packages/task/package.trace.md', packageManifest({ name: 'Task Package' }), { url: taskUrl }),
  mat('task-schema', 'packages/task/task.schema.md', schemaDoc('tiinex.task.v1'), { url: 'https://packages.test/task/task.schema.md' }),
  mat('integration-transition', 'integration/.transitions/topic-task-transition-definition.trace.md', transition('topic-task', '1', 'tiinex.topic.v1', 'tiinex.task.v1'))
];
result = compile('integration', materials);
assert.equal(result.packageGraph.nodes.length, 3);
assert.equal(result.transitionRegistry.length, 1);
assert.equal(schemaResolution(result, 'integration', 'tiinex.topic.v1').qualification, 'resolved');
assert.equal(schemaResolution(result, 'integration', 'tiinex.task.v1').qualification, 'resolved');

// 8-9: missing and ambiguous external package refs fail closed without repository search.
result = compile('integration', [mat('integration', 'integration/package.trace.md', packageManifest({ external: [{ name: 'missing', reference: '[Missing](https://packages.test/missing/package.trace.md)' }] }))]);
assert.equal(result.status, 'unresolved');
assert.equal(hasFinding(result, 'portable.semantic-package.external.reference.unresolved'), true);
const ambiguousUrl = 'https://packages.test/ambiguous/package.trace.md';
result = compile('integration', [
  mat('integration', 'integration/package.trace.md', packageManifest({ external: [{ name: 'amb', reference: `[Amb](${ambiguousUrl})` }] })),
  mat('amb-1', 'a/package.trace.md', packageManifest({ name: 'A' }), { url: ambiguousUrl }),
  mat('amb-2', 'b/package.trace.md', packageManifest({ name: 'B' }), { url: ambiguousUrl })
]);
assert.equal(result.status, 'invalid');
assert.equal(hasFinding(result, 'portable.semantic-package.external.reference.ambiguous'), true);

// 10: package dependency cycles terminate and retain evidence.
const aUrl = 'https://packages.test/a/package.trace.md';
const bUrl = 'https://packages.test/b/package.trace.md';
materials = [
  mat('a', 'a/package.trace.md', packageManifest({ name: 'A', external: [{ name: 'b', reference: `[B](${bUrl})` }] }), { url: aUrl }),
  mat('b', 'b/package.trace.md', packageManifest({ name: 'B', external: [{ name: 'a', reference: `[A](${aUrl})` }] }), { url: bUrl })
];
result = compile('a', materials);
assert.equal(result.packageGraph.nodes.length, 2);
assert.equal(hasFinding(result, 'portable.semantic-package.cycle.observed'), true);

// 11-14: schema resolution unresolved / exact / ambiguous / duplicate binding.
result = compile('pkg', [mat('pkg', 'pkg/package.trace.md', packageManifest({ bindings: [{ id: 'missing.v1', schemaReference: '[missing](missing.schema.md)' }] }))]);
assert.equal(schemaResolution(result, 'pkg', 'missing.v1').qualification, 'unresolved');

materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({ bindings: [{ id: 'tiinex.task.v1', schemaReference: '[task](task.schema.md)' }] })),
  mat('task', 'pkg/task.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').qualification, 'resolved');
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').target.representationKey, 'task');

materials = [
  mat('integration', 'integration/package.trace.md', packageManifest({ external: [
    { name: 'a', reference: '[A](https://packages.test/a2/package.trace.md)' },
    { name: 'b', reference: '[B](https://packages.test/b2/package.trace.md)' }
  ] })),
  mat('a-pkg', 'a2/package.trace.md', packageManifest({ name: 'A' }), { url: 'https://packages.test/a2/package.trace.md' }),
  mat('a-task', 'a2/task-a.schema.md', schemaDoc('tiinex.task.v1')),
  mat('b-pkg', 'b2/package.trace.md', packageManifest({ name: 'B' }), { url: 'https://packages.test/b2/package.trace.md' }),
  mat('b-task', 'b2/task-b.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('integration', materials);
assert.equal(schemaResolution(result, 'integration', 'tiinex.task.v1').qualification, 'ambiguous');

materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({ bindings: [
    { id: 'tiinex.task.v1', schemaReference: '[one](one.schema.md)' },
    { id: 'tiinex.task.v1', schemaReference: '[two](two.schema.md)' }
  ] })),
  mat('one', 'pkg/one.schema.md', schemaDoc('tiinex.task.v1')),
  mat('two', 'pkg/two.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').qualification, 'ambiguous');
assert.equal(hasFinding(result, 'portable.semantic-package.schema-binding.duplicate'), true);

// 15-17: external schema binding must name one declared package and resolve inside it.
materials = [
  mat('root', 'root/package.trace.md', packageManifest({
    external: [{ name: 'task-package', reference: '[Task Package](https://packages.test/ext-task/package.trace.md)' }],
    bindings: [{
      id: 'tiinex.task.v1',
      schemaReference: '[Task](https://packages.test/ext-task/task.schema.md)',
      packageReference: '[Task Package](https://packages.test/ext-task/package.trace.md)'
    }]
  })),
  mat('task-pkg', 'ext-task/package.trace.md', packageManifest({ name: 'Task ext' }), { url: 'https://packages.test/ext-task/package.trace.md' }),
  mat('task-schema', 'ext-task/task.schema.md', schemaDoc('tiinex.task.v1'), { url: 'https://packages.test/ext-task/task.schema.md' })
];
result = compile('root', materials);
assert.equal(schemaResolution(result, 'root', 'tiinex.task.v1').qualification, 'resolved');
assert.equal(schemaResolution(result, 'root', 'tiinex.task.v1').target.representationKey, 'task-schema');

// 18-20: no companion, explicit empty companion, one/many attachments.
materials = basePackageWithSchemas();
result = compile('pkg', materials);
assert.equal(attachmentState(result, 'tiinex.task.v1').state, 'absent');
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [])));
result = compile('pkg', materials);
assert.equal(attachmentState(result, 'tiinex.task.v1').state, 'explicit-empty');

materials = basePackageWithSchemas();
materials.push(mat('t1', 'pkg/.transitions/one-transition-definition.trace.md', transition('one', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('t2', 'pkg/.transitions/two-transition-definition.trace.md', transition('two', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [
  { name: 'one', reference: '[One](.transitions/one-transition-definition.trace.md)' },
  { name: 'two', reference: '[Two](.transitions/two-transition-definition.trace.md)' }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(attachmentState(result, 'tiinex.task.v1').attachments.length, 2);
assert.equal(result.transitionRegistry.length, 2);

// 21: duplicate exact attachment is invalid even with different local names.
materials = basePackageWithSchemas();
materials.push(mat('t1', 'pkg/.transitions/one-transition-definition.trace.md', transition('one', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [
  { name: 'first', reference: '[One](.transitions/one-transition-definition.trace.md)' },
  { name: 'second', reference: '[One Again](.transitions/one-transition-definition.trace.md)' }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'invalid');
assert.equal(result.companions[0].attachmentSet.attachments[1].duplicate, true);
assert.equal(result.companions[0].findings.some((item) => item.code === 'portable.companion.attachment.duplicate'), true);

// 22: same exact Transition may be attached by Topic + Task companions while registry remains one representation.
materials = basePackageWithSchemas();
materials.push(mat('t1', 'pkg/.transitions/shared-transition-definition.trace.md', transition('shared', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [{ name: 'shared', reference: '[Shared](.transitions/shared-transition-definition.trace.md)' }])));
materials.push(mat('topic-comp', 'pkg/tiinex.topic.v1-transitions.trace.md', companion('topic.schema.md', [{ name: 'shared', reference: '[Shared](.transitions/shared-transition-definition.trace.md)' }])));
result = compile('pkg', materials);
assert.equal(result.transitionRegistry.length, 1);
assert.equal(result.transitionRegistry[0].attachmentProvenance.length, 2);
assert.equal(attachmentState(result, 'tiinex.task.v1').state, 'declared');
assert.equal(attachmentState(result, 'tiinex.topic.v1').state, 'declared');

// 23-25: missing, ambiguous, contradiction and unresolved participation fail closed.
materials = basePackageWithSchemas();
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [{ name: 'missing', reference: '[Missing](.transitions/missing.trace.md)' }])));
result = compile('pkg', materials);
assert.equal(result.status, 'unresolved');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'unresolved');

const sameTransitionUrl = 'https://packages.test/transitions/same.trace.md';
materials = basePackageWithSchemas();
materials.push(mat('amb-t1', 'pkg/.transitions/a.trace.md', transition('a', '1', 'tiinex.topic.v1', 'tiinex.task.v1'), { url: sameTransitionUrl }));
materials.push(mat('amb-t2', 'pkg/.transitions/b.trace.md', transition('b', '1', 'tiinex.topic.v1', 'tiinex.task.v1'), { url: sameTransitionUrl }));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [{ name: 'amb', reference: `[Amb](${sameTransitionUrl})` }])));
result = compile('pkg', materials);
assert.equal(result.status, 'invalid');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'ambiguous');

materials = basePackageWithSchemas();
materials.push(mat('other', 'pkg/other.schema.md', schemaDoc('tiinex.other.v1')));
materials.push(mat('exclude', 'pkg/.transitions/exclude.trace.md', transition('exclude', '1', 'tiinex.topic.v1', 'tiinex.other.v1')));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [{ name: 'exclude', reference: '[Exclude](.transitions/exclude.trace.md)' }])));
result = compile('pkg', materials);
assert.equal(result.status, 'invalid');
assert.equal(result.companions[0].attachmentSet.attachments[0].participation.qualification, 'contradictory');

materials = basePackageWithSchemas();
materials.push(mat('unresolved', 'pkg/.transitions/unresolved.trace.md', transitionUnconstrained('unresolved', '1')));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [{ name: 'unresolved', reference: '[Unresolved](.transitions/unresolved.trace.md)' }])));
result = compile('pkg', materials);
assert.equal(result.status, 'unresolved');
assert.equal(result.companions[0].attachmentSet.attachments[0].participation.qualification, 'unresolved');

// 26: two companions resolving to one exact schema are competing attachment authority.
materials = basePackageWithSchemas();
materials.push(mat('c1', 'pkg/task-one-transitions.trace.md', companion('task.schema.md', [])));
materials.push(mat('c2', 'pkg/task-two-transitions.trace.md', companion('task.schema.md', [])));
result = compile('pkg', materials);
assert.equal(result.status, 'invalid');
assert.equal(attachmentState(result, 'tiinex.task.v1').state, 'competing');
assert.equal(hasFinding(result, 'portable.companion.binding.competing'), true);

// 27: identical Canonical Identifier + Version does not dedupe distinct representations.
materials = basePackageWithSchemas();
materials.push(mat('same-1', 'pkg/.transitions/same-1.trace.md', transition('same-id', '7', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('same-2', 'pkg/.transitions/same-2.trace.md', transition('same-id', '7', 'tiinex.topic.v1', 'tiinex.task.v1')));
result = compile('pkg', materials);
assert.equal(result.transitionRegistry.length, 2);
assert.deepEqual(result.transitionRegistry.map((item) => item.canonicalIdentifier), ['same-id', 'same-id']);

// 28: same exact Transition reached through repeated package routes collapses only by exact representation and keeps package routes.
const dUrl = 'https://packages.test/d/package.trace.md';
const bRouteUrl = 'https://packages.test/route-b/package.trace.md';
const cRouteUrl = 'https://packages.test/route-c/package.trace.md';
materials = [
  mat('root', 'root/package.trace.md', packageManifest({ external: [
    { name: 'b', reference: `[B](${bRouteUrl})` },
    { name: 'c', reference: `[C](${cRouteUrl})` }
  ] })),
  mat('b', 'route-b/package.trace.md', packageManifest({ name: 'B', external: [{ name: 'd', reference: `[D](${dUrl})` }] }), { url: bRouteUrl }),
  mat('c', 'route-c/package.trace.md', packageManifest({ name: 'C', external: [{ name: 'd', reference: `[D](${dUrl})` }] }), { url: cRouteUrl }),
  mat('d', 'd/package.trace.md', packageManifest({ name: 'D' }), { url: dUrl }),
  mat('d-schema', 'd/d.schema.md', schemaDoc('d.v1')),
  mat('d-transition', 'd/.transitions/d.trace.md', transition('d-transition', '1', 'd.v1', 'd.v1'))
];
result = compile('root', materials);
assert.equal(result.transitionRegistry.length, 1);
assert.equal(result.packageGraph.nodes.find((item) => item.manifestKey === 'd').routes.length, 2);
assert.equal(result.transitionRegistry[0].discoveryProvenance[0].packageRoutes.length, 2);

// 29: relative reference escaping selected boundary does not become implicit package authority.
materials = [
  mat('root', 'root/package.trace.md', packageManifest({ included: [{ name: 'escape', reference: '[Escape](../other/package.trace.md)' }] })),
  mat('other', 'other/package.trace.md', packageManifest({ name: 'Other' }))
];
result = compile('root', materials);
assert.equal(result.status, 'invalid');
assert.equal(hasFinding(result, 'portable.semantic-package.included.boundary.invalid'), true);

// 30: repository move with internal relative topology preserved keeps semantic qualifications/counts.
const beforeMove = basePackageWithSchemas();
beforeMove.push(mat('move-transition', 'pkg/.transitions/move.trace.md', transition('move', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
beforeMove.push(mat('move-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [{ name: 'move', reference: '[Move](.transitions/move.trace.md)' }])));
const moved = beforeMove.map((item) => ({ ...item, path: `mirror/${item.path}` }));
const beforeResult = compile('pkg', beforeMove);
const afterResult = compile('pkg', moved);
assert.equal(beforeResult.status, afterResult.status);
assert.equal(beforeResult.transitionRegistry.length, afterResult.transitionRegistry.length);
assert.equal(attachmentState(beforeResult, 'tiinex.task.v1').state, attachmentState(afterResult, 'tiinex.task.v1').state);

// 31: generated package graph pressure terminates deterministically at scale, including a cycle.
materials = [];
const packageCount = 36;
for (let index = 0; index < packageCount; index += 1) {
  const currentUrl = `https://packages.test/scale/${index}/package.trace.md`;
  const nextIndex = index === packageCount - 1 ? 0 : index + 1;
  const nextUrl = `https://packages.test/scale/${nextIndex}/package.trace.md`;
  materials.push(mat(`scale-${index}`, `scale/${index}/package.trace.md`, packageManifest({
    name: `Scale ${index}`,
    external: [{ name: `next-${nextIndex}`, reference: `[Next](${nextUrl})` }]
  }), { url: currentUrl }));
  materials.push(mat(`scale-schema-${index}`, `scale/${index}/schema.md`, schemaDoc(`scale.schema.${index}`)));
  if (index % 7 === 0) materials.push(mat(`scale-transition-${index}`, `scale/${index}/.transitions/t.trace.md`, transition(`scale-${index}`, '1', `scale.schema.${index}`, `scale.schema.${index}`)));
}
result = compile('scale-0', materials);
assert.equal(result.packageGraph.nodes.length, packageCount);
assert.equal(result.transitionRegistry.length, 6);
assert.equal(hasFinding(result, 'portable.semantic-package.cycle.observed'), true);


// 32: relative references are source-topology relative and cannot be captured by a global alias.
const aliasTrapUrl = 'https://packages.test/alias-trap/package.trace.md';
materials = basePackageWithSchemas();
materials[0] = mat('pkg', 'pkg/package.trace.md', packageManifest({ external: [
  { name: 'trap', reference: `[Trap](${aliasTrapUrl})` }
] }));
materials.push(mat('trap-pkg', 'external/trap/package.trace.md', packageManifest({ name: 'Trap' }), { url: aliasTrapUrl }));
materials.push(mat('trap-transition', 'external/trap/off-locality.trace.md', transition('trap', '1', 'tiinex.topic.v1', 'tiinex.task.v1'), { reference: '.transitions/trap.trace.md' }));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [
  { name: 'trap', reference: '[Trap](.transitions/trap.trace.md)' }
])));
result = compile('pkg', materials);
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'unresolved');
assert.equal(result.transitionRegistry.some((item) => item.representationKey === 'trap-transition'), false, 'relative reference text must not bind to an unrelated global alias');

// 33: a relative cross-package Transition Reference is invalid even when the external package is explicitly reachable.
const crossUrl = 'https://packages.test/cross/package.trace.md';
materials = basePackageWithSchemas();
materials[0] = mat('pkg', 'pkg/package.trace.md', packageManifest({ external: [
  { name: 'cross', reference: `[Cross](${crossUrl})` }
] }));
materials.push(mat('cross-pkg', 'cross/package.trace.md', packageManifest({ name: 'Cross' }), { url: crossUrl }));
materials.push(mat('cross-transition', 'cross/.transitions/cross.trace.md', transition('cross', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [
  { name: 'cross', reference: '[Cross](../cross/.transitions/cross.trace.md)' }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'invalid');
assert.equal(result.companions[0].attachmentSet.attachments[0].referenceQualification, 'invalid');
assert.equal(result.companions[0].findings.some((item) => item.code === 'portable.companion.reference.invalid'), true);

// 34: an absolute external Transition Reference is valid only through an explicitly reachable package route.
const externalTransitionUrl = 'https://packages.test/cross/transitions/cross.trace.md';
materials = basePackageWithSchemas();
materials[0] = mat('pkg', 'pkg/package.trace.md', packageManifest({ external: [
  { name: 'cross', reference: `[Cross](${crossUrl})` }
] }));
materials.push(mat('cross-pkg', 'cross/package.trace.md', packageManifest({ name: 'Cross' }), { url: crossUrl }));
materials.push(mat('cross-transition', 'cross/off-locality.trace.md', transition('cross', '1', 'tiinex.topic.v1', 'tiinex.task.v1'), { url: externalTransitionUrl }));
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [
  { name: 'cross', reference: `[Cross](${externalTransitionUrl})` }
])));
result = compile('pkg', materials);
assert.equal(result.status, 'valid');
assert.equal(result.transitionRegistry.length, 1, 'off-locality external Transition is registry-visible only because the explicit attachment reference reaches it through a declared package route');
assert.equal(result.transitionRegistry[0].representationKey, 'cross-transition');
assert.equal(result.transitionRegistry[0].attachmentProvenance[0].transitionReferenceTarget, externalTransitionUrl);

// 35: relative Schema Resolution Binding may not escape the package boundary even with an explicit Package Reference.
const extSchemaUrl = 'https://packages.test/ext/schema/task.schema.md';
const extPackageUrl = 'https://packages.test/ext/schema/package.trace.md';
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest({
    external: [{ name: 'ext', reference: `[Ext](${extPackageUrl})` }],
    bindings: [{
      id: 'tiinex.task.v1',
      schemaReference: '[Task](../ext-schema/task.schema.md)',
      packageReference: `[Ext](${extPackageUrl})`
    }]
  })),
  mat('ext-pkg', 'ext-schema/package.trace.md', packageManifest({ name: 'Ext' }), { url: extPackageUrl }),
  mat('ext-task', 'ext-schema/task.schema.md', schemaDoc('tiinex.task.v1'), { url: extSchemaUrl })
];
result = compile('pkg', materials);
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').qualification, 'invalid');

// 36: exact external binding resolves an otherwise ambiguous package-graph schema identifier.
const bindAUrl = 'https://packages.test/bind-a/package.trace.md';
const bindBUrl = 'https://packages.test/bind-b/package.trace.md';
const bindASchemaUrl = 'https://packages.test/bind-a/task.schema.md';
materials = [
  mat('integration', 'integration/package.trace.md', packageManifest({
    external: [
      { name: 'a', reference: `[A](${bindAUrl})` },
      { name: 'b', reference: `[B](${bindBUrl})` }
    ],
    bindings: [{ id: 'tiinex.task.v1', schemaReference: `[Task A](${bindASchemaUrl})`, packageReference: `[A](${bindAUrl})` }]
  })),
  mat('a-pkg', 'bind-a/package.trace.md', packageManifest({ name: 'A' }), { url: bindAUrl }),
  mat('a-task', 'bind-a/task.schema.md', schemaDoc('tiinex.task.v1'), { url: bindASchemaUrl }),
  mat('b-pkg', 'bind-b/package.trace.md', packageManifest({ name: 'B' }), { url: bindBUrl }),
  mat('b-task', 'bind-b/task.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('integration', materials);
assert.equal(schemaResolution(result, 'integration', 'tiinex.task.v1').qualification, 'resolved');
assert.equal(schemaResolution(result, 'integration', 'tiinex.task.v1').target.representationKey, 'a-task');
assert.equal(schemaResolution(result, 'integration', 'tiinex.task.v1').bindingProvenance[0].packageReference, `[A](${bindAUrl})`);

// 37: repository siblings outside the selected package boundary do not become schema candidates.
materials = [
  mat('pkg', 'selected/package.trace.md', packageManifest()),
  mat('selected-task', 'selected/task.schema.md', schemaDoc('tiinex.task.v1')),
  mat('sibling-task', 'sibling/task.schema.md', schemaDoc('tiinex.task.v1'))
];
result = compile('pkg', materials);
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').qualification, 'resolved');
assert.equal(schemaResolution(result, 'pkg', 'tiinex.task.v1').target.representationKey, 'selected-task');

// 38: schema ancestry does not create implicit companion inheritance.
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('parent-schema', 'pkg/parent.schema.md', schemaDoc('example.parent.v1')),
  mat('child-schema', 'pkg/child.schema.md', schemaDocWithParent('example.child.v1', 'example.parent.v1')),
  mat('parent-transition', 'pkg/.transitions/parent.trace.md', transition('parent-only', '1', 'example.parent.v1', 'example.parent.v1')),
  mat('parent-comp', 'pkg/example.parent.v1-transitions.trace.md', companion('parent.schema.md', [
    { name: 'parent-only', reference: '[Parent](.transitions/parent.trace.md)' }
  ]))
];
result = compile('pkg', materials);
assert.equal(attachmentState(result, 'example.parent.v1').state, 'declared');
assert.equal(attachmentState(result, 'example.child.v1').state, 'absent');

// 39: canonical locality layouts are all discoverable, but path does not become semantic identity/qualification.
materials = [
  mat('pkg', 'pkg/package.trace.md', packageManifest()),
  mat('topic', 'pkg/topic/topic.schema.md', schemaDoc('tiinex.topic.v1')),
  mat('task', 'pkg/task/task.schema.md', schemaDoc('tiinex.task.v1')),
  mat('single', 'pkg/task/.transitions/single.trace.md', transition('single-output', '1', 'tiinex.topic.v1', 'tiinex.task.v1')),
  mat('same-output', 'pkg/task/.transitions/same-output.trace.md', transitionWithOutputs('same-output', '1', 'tiinex.topic.v1', ['tiinex.task.v1', 'tiinex.task.v1'])),
  mat('multi-local', 'pkg/.transitions/multi-local.trace.md', transitionWithOutputs('multi-local', '1', 'tiinex.topic.v1', ['tiinex.topic.v1', 'tiinex.task.v1'])),
  mat('zero-output', 'pkg/.transitions/zero-output.trace.md', transitionZeroOutput('zero-output', '1', 'tiinex.topic.v1')),
  mat('generic-output', 'pkg/.transitions/generic-output.trace.md', transitionGenericOutput('generic-output', '1', 'tiinex.topic.v1'))
];
result = compile('pkg', materials);
assert.deepEqual(result.transitionRegistry.map((item) => item.representationKey).sort(), ['generic-output', 'multi-local', 'same-output', 'single', 'zero-output']);

// 40: a valid Transition outside .transitions is not auto-discovered, but an explicit allowed companion route may surface it.
materials = basePackageWithSchemas();
materials.push(mat('off-locality', 'pkg/off-locality.trace.md', transition('off-locality', '1', 'tiinex.topic.v1', 'tiinex.task.v1')));
result = compile('pkg', materials);
assert.equal(result.transitionRegistry.length, 0);
materials.push(mat('task-comp', 'pkg/tiinex.task.v1-transitions.trace.md', companion('task.schema.md', [
  { name: 'off-locality', reference: '[Off locality](off-locality.trace.md)' }
])));
result = compile('pkg', materials);
assert.equal(result.transitionRegistry.length, 1);
assert.equal(result.transitionRegistry[0].representationKey, 'off-locality');
assert.equal(result.transitionRegistry[0].discoveryProvenance.some((item) => item.kind === 'companion-attachment-reference'), true);

// 41: package declaration order does not create dependency precedence in compiled aggregate truth.
const orderA = [
  { name: 'a', reference: `[A](${bindAUrl})` },
  { name: 'b', reference: `[B](${bindBUrl})` }
];
const orderB = [...orderA].reverse();
const orderedMaterials = (external) => [
  mat('integration', 'integration/package.trace.md', packageManifest({ external })),
  mat('a-pkg', 'bind-a/package.trace.md', packageManifest({ name: 'A' }), { url: bindAUrl }),
  mat('a-schema', 'bind-a/a.schema.md', schemaDoc('example.a.v1')),
  mat('b-pkg', 'bind-b/package.trace.md', packageManifest({ name: 'B' }), { url: bindBUrl }),
  mat('b-schema', 'bind-b/b.schema.md', schemaDoc('example.b.v1'))
];
const orderResultA = compile('integration', orderedMaterials(orderA));
const orderResultB = compile('integration', orderedMaterials(orderB));
assert.deepEqual(
  orderResultA.packageGraph.nodes.map((item) => item.manifestKey),
  orderResultB.packageGraph.nodes.map((item) => item.manifestKey)
);
assert.deepEqual(
  orderResultA.schemaResolutions.map((item) => [item.schemaId, item.qualification, item.target?.representationKey || '']),
  orderResultB.schemaResolutions.map((item) => [item.schemaId, item.qualification, item.target?.representationKey || ''])
);
assert.doesNotThrow(() => JSON.stringify(orderResultA), 'compiled package truth remains JSON-serializable');

console.log('✓ portable semantic-package discovery, package graph, schema resolution, Transition registry and companion attachments passed');

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
- Purpose: Synthetic package pressure fixture

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

- Does Not Mean: package ownership of semantic truth
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

function transitionUnconstrained(canonicalIdentifier, version) {
  return artifact('tiinex.transition.definition.v1', canonicalIdentifier, `
## Transition Identity

- Name: ${canonicalIdentifier}
- Version: ${version}
- Canonical Identifier: ${canonicalIdentifier}

## Input Roles

- input
  - Meaning: generic input
  - Minimum Count: 0
  - Maximum Count: unknown
  - Target Kind: artifact

## Output Roles

- none
`);
}


function schemaDocWithParent(schemaId, parentSchemaId) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: ${parentSchemaId}\n  - Trace: parent.schema.md\n  - Origin: parent.schema.md\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-17 00:00:00\n\n---\n\n# ${schemaId}\n\n## Schema Validation Contract\n\n### Identity\n\nRules\n\n- Synthetic descendant schema authority fixture.\n`;
}

function transitionWithOutputs(canonicalIdentifier, version, inputSchema, outputSchemas) {
  const outputs = outputSchemas.map((schemaId, index) => `- output-${index + 1}\n  - Meaning: output ${index + 1}\n  - Minimum Count: 1\n  - Maximum Count: 1\n  - Target Kind: artifact\n  - Schema Constraint: ${schemaId}`).join('\n');
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

${outputs}
`);
}

function transitionZeroOutput(canonicalIdentifier, version, inputSchema) {
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

- none
`);
}

function transitionGenericOutput(canonicalIdentifier, version, inputSchema) {
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
  - Meaning: generic output
  - Minimum Count: 0
  - Maximum Count: unknown
  - Target Kind: artifact
`);
}

function basePackageWithSchemas() {
  return [
    mat('pkg', 'pkg/package.trace.md', packageManifest({ bindings: [
      { id: 'tiinex.topic.v1', schemaReference: '[Topic](topic.schema.md)' },
      { id: 'tiinex.task.v1', schemaReference: '[Task](task.schema.md)' }
    ] })),
    mat('topic', 'pkg/topic.schema.md', schemaDoc('tiinex.topic.v1')),
    mat('task', 'pkg/task.schema.md', schemaDoc('tiinex.task.v1'))
  ];
}

function declarationList(items, field) {
  if (!items.length) return '- none';
  return items.map((item) => `- ${item.name}\n  - ${field}: ${item.reference}${item.note ? `\n  - Note: ${item.note}` : ''}`).join('\n');
}

function bindingList(bindings) {
  if (!bindings.length) return '- none';
  return bindings.map((binding) => `- ${binding.id}\n  - Schema Reference: ${binding.schemaReference}${binding.packageReference ? `\n  - Package Reference: ${binding.packageReference}` : ''}`).join('\n');
}

function schemaResolution(output, packageKey, schemaId) {
  return output.schemaResolutions.find((item) => item.packageKey === packageKey && item.schemaId === schemaId);
}

function attachmentState(output, schemaId) {
  return output.schemaAttachments.find((item) => item.schemaId === schemaId);
}

function hasFinding(output, code) {
  return output.findings.some((item) => item.code === code);
}
