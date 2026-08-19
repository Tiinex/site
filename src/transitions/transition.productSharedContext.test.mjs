import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from './canonicalTransition.schemaCache.js';
import { CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID } from './canonicalTransition.semanticPackage.js';
import { transitionProductActionsForRecord, transitionProductContextForWorkspace } from './transition.productPresentation.js';

const cacheCommit = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';
const cachePaths = {
  'tiinex.root.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.root.v1.schema.md`,
  'tiinex.transition.definition.v1': `src/transitions/canonical-schema-cache/${cacheCommit}/tiinex.transition.definition.v1.schema.md`,
  'tiinex.task.v1': 'src/schemas/core/task/tiinex.task.v1.schema.md',
  'tiinex.topic.v1': 'src/transitions/canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md',
  'tiinex.interpretation.v1': 'src/schemas/core/interpretation/tiinex.interpretation.v1.schema.md',
  'tiinex.relation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.relation.v1.schema.md',
  'tiinex.schema.contract.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.contract.v1.schema.md',
  'tiinex.schema.generation.v1': 'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.generation.v1.schema.md'
};
const schemaCache = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => ({ ...item, markdown: fs.readFileSync(cachePaths[item.schemaId], 'utf8'), sourceQualification: 'source-qualified-cache' }));
const definitionPath = 'src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md';
const bundledDefinitions = Object.freeze([{ path: definitionPath, title: 'Topic to Task', markdown: fs.readFileSync(definitionPath, 'utf8'), sourceQualification: 'compiled-semantic-package-qualified', sourceMode: 'bundled-canonical-transition-definition', source: { id: CANONICAL_TOPIC_TO_TASK_BUNDLED_SOURCE_ID, adapterId: 'static', kind: 'bundled-canonical' } }]);

function topic(index) {
  const path = `.topics/shared-context/${index}.trace.md`;
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-18 00:00:00\n  - Summary: Topic ${index}\n\n---\n\n# Topic ${index}\n\nReadable topic.\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path, name: `Topic ${index}`, sourceMode: 'local' }), { id: `topic-${index}`, title: `Topic ${index}`, path, sourceMode: 'local', source: { id: 'local', adapterId: 'local', kind: 'local-session' } });
}

const workspaceRecords = [topic(1), topic(2), topic(3)];
const context = transitionProductContextForWorkspace({ workspaceRecords, schemaCache, bundledDefinitions });
assert.equal(context.state, 'prepared');
assert.equal(context.workspaceRecords, workspaceRecords, 'shared context is bound to the exact workspace record-set identity');
assert.equal(context.readOnly, true);
assert.equal(context.mutation, false);

for (const record of workspaceRecords) {
  const baseline = transitionProductActionsForRecord(record, { workspaceRecords, workspaceId: 'w', maxPrimary: 10, schemaCache, bundledDefinitions });
  const shared = transitionProductActionsForRecord(record, { workspaceRecords, workspaceId: 'w', maxPrimary: 10, schemaCache, bundledDefinitions, productContext: context });
  assert.deepEqual(shared, baseline, `${record.id}: shared preparation context must preserve exact product-action semantics`);
}

const differentRecords = workspaceRecords.slice();
const mismatch = transitionProductActionsForRecord(differentRecords[0], { workspaceRecords: differentRecords, workspaceId: 'w', maxPrimary: 10, schemaCache, bundledDefinitions, productContext: context });
const fresh = transitionProductActionsForRecord(differentRecords[0], { workspaceRecords: differentRecords, workspaceId: 'w', maxPrimary: 10, schemaCache, bundledDefinitions });
assert.deepEqual(mismatch, fresh, 'context from a different record-set identity must fail closed to fresh preparation');

const viewSource = fs.readFileSync('src/schemas/workspace/workspace.views.jsx', 'utf8');
assert.ok(viewSource.includes("const transitionProductActionsVisible = !readOnlyHistorical && (verse === 'feed' || verse === 'lineage')"), 'workspace presentation scopes shared transition preparation to live card/action surfaces and disables it for historical review');
assert.ok(viewSource.includes('? transitionProductContextForWorkspace({ workspaceRecords: allRecords, referenceRecords })'), 'Feed/Lineage builds shared transition preparation once per stable local+reference record-set');
assert.ok(viewSource.includes(': null), [transitionProductActionsVisible, allRecords, referenceRecords])'), 'Tree/Audit do not pay workspace-wide transition preparation cost');
assert.ok(viewSource.includes('transitionProductContext={transitionProductContext}'), 'shared context is passed to card surfaces');

console.log('transition product shared preparation context semantics: PASS');
