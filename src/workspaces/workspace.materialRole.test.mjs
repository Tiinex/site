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
}), MaterialRole.schemaDefinition);

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

console.log('✓ workspace.materialRole tests passed');
