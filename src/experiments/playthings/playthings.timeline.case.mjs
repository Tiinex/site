import assert from 'node:assert/strict';
import { planPlaythingsHistory, playthingsObservationFromModel, playthingsProjectionAtCursor, resolvePlaythingsObservationCursor } from './playthings.timeline.js';

const model = {
  fingerprint: 'demo',
  verses: [{ id: 'repo:tiinex/site' }],
  artifacts: [
    { key: 'root', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 10:00:00', title: 'Root' },
    { key: 'child-a', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 09:00:00', title: 'Child A' },
    { key: 'child-b', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 11:00:00', title: 'Child B' }
  ],
  edges: [
    { key: 'parent:root->child-a', kind: 'parent', from: 'root', to: 'child-a' },
    { key: 'parent:root->child-b', kind: 'parent', from: 'root', to: 'child-b' }
  ],
  portals: []
};
const history = planPlaythingsHistory(model);
assert.deepEqual(history.events.map((event) => event.artifactKey), ['root', 'child-a', 'child-b'], 'Parent must precede child even when a child timestamp sorts earlier');
assert.deepEqual(history.events.map((event) => event.kind), ['spawn', 'advance', 'split'], 'root spawns, first child advances, later sibling splits');
assert.equal(playthingsProjectionAtCursor(history, 0).artifactKeys.size, 0, 'origin is a blank static world');
assert.deepEqual([...playthingsProjectionAtCursor(history, 2).artifactKeys], ['root', 'child-a']);

const observation = playthingsObservationFromModel({ ...model, artifacts: model.artifacts.slice(0, 2), edges: model.edges.slice(0, 1), portals: [] });
const resolution = resolvePlaythingsObservationCursor(observation, history, model);
assert.equal(resolution.valid, true);
assert.equal(resolution.cursor, 2, 'a prior observed prefix resumes exactly at the delta');

const retroactive = {
  ...observation,
  artifactKeys: ['root', 'child-b'],
  edgeKeys: ['parent:root->child-b']
};
assert.equal(resolvePlaythingsObservationCursor(retroactive, history, model).valid, false, 'non-prefix observation must rebuild rather than silently reorder history');

const independentModel = {
  fingerprint: 'priority-kahn', verses: [{ id: 'repo:tiinex/site' }], portals: [],
  artifacts: [
    { key: 'root-a', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 10:00:00', title: 'Root A' },
    { key: 'root-b', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 20:00:00', title: 'Root B' },
    { key: 'child-a', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 11:00:00', title: 'Child A' }
  ],
  edges: [{ key: 'parent:root-a->child-a', kind: 'parent', from: 'root-a', to: 'child-a' }]
};
assert.deepEqual(planPlaythingsHistory(independentModel).events.map((event) => event.artifactKey), ['root-a', 'child-a', 'root-b'], 'each newly-ready child must re-enter chronological priority immediately instead of waiting behind an older ready batch');

console.log('✓ Playthings history ordering, leaf branching and observation resume passed');

const schemaBridgeModel = {
  fingerprint: 'schema-bridge', verses: [{ id: 'repo:tiinex/site' }], portals: [],
  artifacts: [
    { key: 'living-root', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 12:00:00', title: 'Living root', isSchemaArtifact: false },
    { key: 'schema-blueprint', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 12:01:00', title: 'Blueprint', isSchemaArtifact: true, interactionKind: 'blueprint' },
    { key: 'after-blueprint', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 12:02:00', title: 'After blueprint', isSchemaArtifact: false },
    { key: 'real-sibling', verseId: 'repo:tiinex/site', createdAt: '2026-09-01 12:03:00', title: 'Real sibling', isSchemaArtifact: false }
  ],
  edges: [
    { key: 'p1', kind: 'parent', from: 'living-root', to: 'schema-blueprint' },
    { key: 'p2', kind: 'parent', from: 'schema-blueprint', to: 'after-blueprint' },
    { key: 'p3', kind: 'parent', from: 'living-root', to: 'real-sibling' }
  ]
};
const schemaBridgeHistory = planPlaythingsHistory(schemaBridgeModel);
assert.deepEqual(schemaBridgeHistory.events.map((event) => event.kind), ['spawn', 'observe', 'advance', 'split'], 'schema documents remain observed blueprint events and do not consume a living continuation/sibling slot');
assert.equal(schemaBridgeHistory.events[2].livingParentKey, 'living-root', 'a real descendant after schema-only Parent hops continues from the nearest real living ancestor without rewriting Tiinex Parent');
assert.equal(schemaBridgeHistory.events[2].parentKey, 'schema-blueprint', 'the semantic Parent remains the actual schema artifact');
