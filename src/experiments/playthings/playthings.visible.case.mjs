import assert from 'node:assert/strict';
import { projectVisiblePlaythingsModel } from './playthings.visible.js';

const artifact = (key, createdAt) => ({ key, title: key, schemaId: 'tiinex.task.v1', verseId: 'repo:tiinex/site', repo: 'Tiinex/site', createdAt, visualKind: 'workbench', presentationSeed: key, isSchemaArtifact: false });
const root = artifact('root', '2026-09-01 10:00:00');
const child = artifact('child', '2026-09-01 11:00:00');
const full = {
  schema: 'tiinex.playthings.multiverse.experimental.v1', fingerprint: 'f',
  artifacts: [root, child], edges: [{ key: 'p', kind: 'parent', from: 'root', to: 'child' }], portals: [], unresolved: [], unboundArtifacts: [],
  verses: [{ id: 'repo:tiinex/site', repo: 'Tiinex/site', artifacts: [root, child], edges: [], actors: [] }]
};
const first = projectVisiblePlaythingsModel(full, new Set(['repo:tiinex/site']), new Set(['root']), new Set());
const second = projectVisiblePlaythingsModel(full, new Set(['repo:tiinex/site']), new Set(['root', 'child']), new Set());
assert.equal(first.actors.length, 1);
assert.equal(second.actors.length, 1);
assert.equal(first.actors[0].id, second.actors[0].id, 'linear leaf advance must preserve rendered Plaything identity in the visible playhead projection');
assert.equal(second.actors[0].headKey, 'child');

const schema = { ...artifact('schema', '2026-09-01 10:30:00'), schemaId: 'tiinex.schema.v1', isSchemaArtifact: true, interactionKind: 'blueprint' };
const afterSchema = artifact('after-schema', '2026-09-01 11:00:00');
const schemaFull = {
  ...full, fingerprint: 'schema-visible', artifacts: [root, schema, afterSchema],
  edges: [{ key: 's1', kind: 'parent', from: 'root', to: 'schema' }, { key: 's2', kind: 'parent', from: 'schema', to: 'after-schema' }],
  verses: [{ ...full.verses[0], artifacts: [root, schema, afterSchema] }]
};
const blueprintOnlyVisible = projectVisiblePlaythingsModel(schemaFull, new Set(['repo:tiinex/site']), new Set(['root', 'schema']), new Set());
assert.deepEqual(blueprintOnlyVisible.actors.map((actor) => actor.headKey), ['root'], 'a schema child cannot terminate the visible living root');
const bridgeVisible = projectVisiblePlaythingsModel(schemaFull, new Set(['repo:tiinex/site']), new Set(['root', 'schema', 'after-schema']), new Set());
assert.deepEqual(bridgeVisible.actors.map((actor) => actor.headKey), ['after-schema'], 'a real child after a schema blueprint becomes the living leaf');
assert.equal(blueprintOnlyVisible.actors[0].id, bridgeVisible.actors[0].id, 'schema-only Parent hops do not remount the continuing Plaything identity');

console.log('✓ Playthings visible projection preserves linear actor identity');
