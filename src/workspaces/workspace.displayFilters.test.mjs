import assert from 'node:assert/strict';
import { buildDiscoveryDisplayOptionCounts, buildWorkspaceDiscoveryView } from './workspace.discoveryView.js';
import { displayRecordIncluded, qualifiedSchemaFilterValue, recordSchemaValue } from './workspace.displayFilters.js';

const topic = { id: 'topic', title: 'Topic', path: 'topic.trace.md', schemaId: 'tiinex.topic.v1', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Topic' };
const task = { id: 'task', title: 'Task', path: 'task.trace.md', currentSchemaId: 'tiinex.task.v1', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Task' };
const plainMarkdown = { id: 'readme', title: 'README', path: 'README.md', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# README' };
const supporting = { id: 'support', title: 'Support', path: 'support.md', kind: 'supporting-markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Support' };
const envelopeQualified = { id: 'schema', title: 'Schema', path: 'tiinex.topic.v1.schema.md', envelopeSchemaId: 'tiinex.schema.module.v1', kind: 'schema-definition', sourceMode: 'source-backed', source: { adapterId: 'github' }, markdown: '# Schema' };

assert.equal(recordSchemaValue(topic), 'tiinex.topic.v1');
assert.equal(recordSchemaValue(task), 'tiinex.task.v1');
assert.equal(recordSchemaValue(envelopeQualified), 'tiinex.schema.module.v1');
assert.equal(recordSchemaValue(plainMarkdown), '', 'record.kind must not masquerade as Schema identity');
assert.equal(recordSchemaValue(supporting), '', 'supporting classification must not masquerade as Schema identity');
assert.equal(qualifiedSchemaFilterValue('markdown', [topic, task, plainMarkdown, supporting]), 'all', 'persisted pseudo-schema selection resolves to the unfiltered state');
assert.equal(qualifiedSchemaFilterValue('tiinex.topic.v1', [topic, task, plainMarkdown, supporting]), 'tiinex.topic.v1', 'valid qualified schema selection remains selected');

const workspace = { id: 'w', records: [topic, task, plainMarkdown, supporting, envelopeQualified], assets: [] };
const counts = buildDiscoveryDisplayOptionCounts(workspace);
assert.deepEqual(counts.schemaChoices, [
  ['tiinex.schema.module.v1', 1],
  ['tiinex.task.v1', 1],
  ['tiinex.topic.v1', 1]
], 'Schema choices expose only qualified schema identity and omit kind-only/supporting records');

const topicView = buildWorkspaceDiscoveryView(workspace, {
  displayOptions: { leavesOnly: false, showSupportingMarkdown: true, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'tiinex.topic.v1', artifactFilter: 'all', sourceFilter: 'all' },
  query: ''
});
assert.deepEqual(topicView.records.map((record) => record.id), ['topic'], 'Schema filter matches qualified schema identity only');
assert.equal(displayRecordIncluded(plainMarkdown, { leavesOnly: false, showSupportingMarkdown: true, schemaFilter: 'markdown', artifactFilter: 'all', sourceFilter: 'all' }), false, 'legacy kind-derived schema filter value cannot select kind-only Markdown');

console.log('✓ workspace display filter schema-truth tests passed');
