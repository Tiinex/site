import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparePortableTask } from './task.prepare.js';

const evidenceSchema = await readFile(new URL('../../../schemas/core/evidence/tiinex.evidence.v1.schema.md', import.meta.url), 'utf8');
const preservationSchema = await readFile(new URL('../../../schemas/core/preservation/tiinex.preservation.v1.schema.md', import.meta.url), 'utf8');
const rootSchema = await readFile(new URL('../../../schemas/tiinex.root.v1.schema.md', import.meta.url), 'utf8');
const material = { files: [
  { path: 'schemas/tiinex.evidence.v1.schema.md', content: evidenceSchema },
  { path: 'schemas/tiinex.preservation.v1.schema.md', content: preservationSchema },
  { path: 'schemas/tiinex.root.v1.schema.md', content: rootSchema }
] };

const missing = await preparePortableTask({ ...material, task: 'create-artifact', schemaId: 'tiinex.evidence.v1', values: {} });
assert.equal(missing.status, 'authoring-input-required');
assert.equal(missing.nextAction.operation, 'collect-required-inputs');
assert.equal(missing.nextAction.missingInputs.includes('Known Source'), true);
assert.equal(missing.result.schemaChain.status, 'complete-to-root');

const providerNeeded = await preparePortableTask({
  task: 'read-schema',
  schemaId: 'tiinex.experimental.remote.v1',
  tools: [
    { name: 'GitHub.search', description: 'Search repository files.' },
    { name: 'GitHub.fetch_file', description: 'Read repository file content.' }
  ]
});
assert.equal(providerNeeded.status, 'provider-action-required');
assert.equal(providerNeeded.nextAction.capability, 'repository-search-and-read');

const search = await preparePortableTask({
  task: 'search-lineage',
  records: [{
    id: 'one', path: 'one.md', markdown: `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-07-23 00:00:00\n\n---\n\n# One\n\n## Content\n\nPortable search target.`
  }],
  query: 'search target'
});
assert.equal(search.status, 'ready');
assert.equal(search.result.search.matches.length, 1);

const materialization = await preparePortableTask({
  task: 'materialize-findings',
  durableFindings: [{ id: 'decision-1', code: 'decision.ready', message: 'A durable decision exists.' }],
  materializations: [{ id: 'decision-artifact', findingIds: ['decision-1'], schemaId: 'tiinex.decision.v1' }]
});
assert.equal(materialization.status, 'ready');
assert.equal(materialization.nextAction.operation, 'materialize-durable-findings');

const checkpoint = await preparePortableTask({ task: 'checkpoint', stagedArtifacts: [], durableFindings: [] });
assert.equal(checkpoint.status, 'ready');
assert.equal(checkpoint.nextAction.operation, 'create-checkpoint');
assert.equal(checkpoint.nextAction.canonicalHandoffArtifact, false);

const packageTask = await preparePortableTask({ task: 'package', stagedArtifacts: [{ path: 'drafts/one.md' }] });
assert.equal(packageTask.status, 'ready');
assert.equal(packageTask.nextAction.operation, 'build-runtime-package');
assert.equal(packageTask.result.canonicalPackageSchemaLocked, false);

console.log('✓ portable task orchestration and self-describing next actions passed');
