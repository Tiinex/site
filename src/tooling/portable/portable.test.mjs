const tests = [
  './input/portable.input.test.mjs',
  './input/node.input.test.mjs',
  './portable.engine.test.mjs',
  './schema/schema.guide.test.mjs',
  './lineage/lineage.search.test.mjs',
  './draft/draft.operations.test.mjs',
  './session/portable.session.test.mjs'
];

for (const test of tests) await import(test);

console.log('✓ portable tooling aggregate suite passed');
