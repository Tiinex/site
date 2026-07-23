import assert from 'node:assert/strict';
import { inferRecordMaterialRole, MaterialRole, isSupportingRecord } from './workspace.materialRole.js';

assert.equal(inferRecordMaterialRole({
  path: '.topics/educational/memes/doom/001.trace.md',
  schemaId: 'tiinex.topic.v1',
  hasContinuityContext: true
}), MaterialRole.leaf);

assert.equal(inferRecordMaterialRole({
  path: '.topics/.schemas/core/topic/tiinex.topic.v1.schema.md',
  schemaId: 'tiinex.topic.v1',
  hasContinuityContext: true
}), MaterialRole.leaf);

assert.equal(inferRecordMaterialRole({
  path: '.topics/.schemas/tiinex.root.v1.schema.md',
  schemaId: 'tiinex.root.v1',
  hasContinuityContext: true
}), MaterialRole.leaf);

assert.equal(inferRecordMaterialRole({
  path: 'src/schemas/core/topic/tiinex.topic.v1.schema.md',
  schemaId: 'tiinex.topic.v1',
  hasContinuityContext: true
}), MaterialRole.schemaDefinition);


assert.equal(inferRecordMaterialRole({
  path: '.topics/.schemas/resource/contribution/tiinex.resource.contribution.v1.schema.md',
  schemaId: 'tiinex.resource.contribution.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github' },
  hasContinuityContext: true,
  cacheState: 'source-backed-metadata-only-session-cache'
}), MaterialRole.leaf);

assert.equal(isSupportingRecord({
  path: '.topics/.schemas/resource/contribution/tiinex.resource.contribution.v1.schema.md',
  schemaId: 'tiinex.resource.contribution.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github' },
  hasContinuityContext: true,
  cacheState: 'source-backed-metadata-only-session-cache'
}), false);

assert.equal(inferRecordMaterialRole({
  path: '.topics/ideas/example/001.trace.md',
  schemaId: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github' },
  materialAvailability: 'material-unavailable',
  cacheState: 'route-shell-material-unavailable'
}), MaterialRole.unknown);

assert.equal(isSupportingRecord({
  path: '.topics/ideas/example/001.trace.md',
  schemaId: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github' },
  materialAvailability: 'material-unavailable',
  cacheState: 'route-shell-material-unavailable'
}), true);

assert.equal(inferRecordMaterialRole({
  path: '.topics/.schemas/resource/contribution/tiinex.resource.contribution.v1.schema.md',
  schemaId: 'tiinex.resource.contribution.v1',
  markdown: '# Resource Contribution\n\n- Continuity Context: present',
  hasContinuityContext: true
}), MaterialRole.leaf);

assert.equal(inferRecordMaterialRole({
  path: '.topics/.schemas/annotation/adapter/tiinex.adapter.annotation.v1.schema.md',
  schemaId: 'tiinex.adapter.annotation.v1',
  hasContinuityContext: true
}), MaterialRole.leaf);

assert.equal(inferRecordMaterialRole({
  path: '.topics/annotations/adapter/001.trace.md',
  schemaId: 'tiinex.adapter.annotation.v1',
  hasContinuityContext: true
}), MaterialRole.leaf);

assert.equal(inferRecordMaterialRole({
  path: '.topics/annotations/semantic/001.trace.md',
  schemaId: 'tiinex.semantic.annotation.v1',
  hasContinuityContext: true
}), MaterialRole.leaf);

assert.equal(inferRecordMaterialRole({
  path: '.topics/.adapters/github/adapter.md',
  schemaId: 'tiinex.adapter.v1',
  hasContinuityContext: true
}), MaterialRole.supporting);

assert.equal(inferRecordMaterialRole({
  path: '.topics/tools/source-model.md',
  schemaId: 'tiinex.source.v1',
  hasContinuityContext: true
}), MaterialRole.supporting);

assert.equal(isSupportingRecord({
  path: '.topics/tools/source-model.md',
  schemaId: 'tiinex.source.v1',
  hasContinuityContext: true
}), true);

assert.equal(inferRecordMaterialRole({
  path: '.topics/notes/plain.md',
  markdown: '# Plain note\n\nSupporting markdown.'
}), MaterialRole.supporting);


const lineageParent = {
  id: 'record:parent',
  path: '.topics/resource/001.trace.md',
  schemaId: 'tiinex.resource.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github', rootPath: '.topics' },
  hasContinuityContext: true,
  cacheState: 'source-backed-metadata-only-session-cache'
};
const lineageChild = {
  id: 'record:child',
  path: '.topics/resource/contribution/001.trace.md',
  schemaId: 'tiinex.resource.contribution.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github', rootPath: '.topics' },
  trace: 'record:parent',
  hasContinuityContext: true,
  cacheState: 'source-backed-metadata-only-session-cache'
};
const { buildDiscoveryMaterialIndex, isDiscoveryLeafRecord } = await import('./workspace.materialRole.js');
const discoveryIndex = buildDiscoveryMaterialIndex([lineageParent, lineageChild]);
assert.equal(inferRecordMaterialRole(lineageParent), MaterialRole.leaf);
assert.equal(inferRecordMaterialRole(lineageChild), MaterialRole.leaf);
assert.equal(isDiscoveryLeafRecord(lineageParent, discoveryIndex), false);
assert.equal(isDiscoveryLeafRecord(lineageChild, discoveryIndex), true);

const routeOnlyIndex = buildDiscoveryMaterialIndex([{
  id: 'route-shell',
  path: '.topics/ideas/example/001.trace.md',
  schemaId: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github' },
  materialAvailability: 'material-unavailable',
  cacheState: 'route-shell-material-unavailable'
}]);
assert.equal(isDiscoveryLeafRecord({
  id: 'route-shell',
  path: '.topics/ideas/example/001.trace.md',
  schemaId: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github' },
  materialAvailability: 'material-unavailable',
  cacheState: 'route-shell-material-unavailable'
}, routeOnlyIndex), false);

console.log('✓ workspace.materialRole tests passed');
