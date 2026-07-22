const tests = [
  './input/portable.input.test.mjs',
  './input/node.input.test.mjs',
  './portable.engine.test.mjs',
  './operation.catalog.test.mjs',
  './bootstrap/bootstrap.test.mjs',
  './host/host.capabilities.test.mjs',
  './host/tool.bindings.test.mjs',
  './orchestration/task.prepare.test.mjs',
  './providers/schema.providers.test.mjs',
  './schema/schema.guide.test.mjs',
  './lineage/lineage.search.test.mjs',
  './draft/draft.operations.test.mjs',
  './draft/draft.create.test.mjs',
  './assets/asset.operations.test.mjs',
  './session/portable.session.test.mjs',
  './materialization/durable.materialize.test.mjs',
  './checkpoint/portable.checkpoint.test.mjs',
  './package/runtime.package.test.mjs'
];

for (const test of tests) await import(test);

console.log('✓ portable tooling aggregate suite passed');
