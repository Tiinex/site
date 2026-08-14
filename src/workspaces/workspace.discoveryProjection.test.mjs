import assert from 'node:assert/strict';
import { buildWorkspaceDiscoveryView } from './workspace.discoveryView.js';

const workspaceRecord = {
  id: 'source:github:demo:repo:.topics/hobbies/hobbies.workspace.md',
  title: 'Hobbies',
  path: '.topics/hobbies/hobbies.workspace.md',
  markdown: '# Hobbies\n',
  schemaId: 'tiinex.workspace.v1',
  source: { id: 'source:github:demo:repo', adapterId: 'github', sourceKind: 'github.repo' },
  sourceMode: 'source-backed'
};
const duplicateCandidate = {
  id: `workspace-record:${workspaceRecord.id}`,
  title: 'Hobbies',
  path: '.topics/hobbies/hobbies.workspace.md',
  markdown: '# Hobbies\n',
  sourceRecordId: workspaceRecord.id,
  source: workspaceRecord.source,
  sourceMode: 'source-backed-workspace-file'
};
const otherCandidate = {
  id: 'workspace-record:other',
  title: 'Start',
  path: '.topics/start/start.workspace.md',
  markdown: '# Start\n',
  source: workspaceRecord.source,
  sourceMode: 'source-backed-workspace-file'
};

const discovery = buildWorkspaceDiscoveryView({
  id: 'ws',
  title: 'Gaming',
  records: [workspaceRecord],
  workspaceMergeCandidates: [duplicateCandidate, otherCandidate]
}, {
  displayOptions: { showWorkspaceCandidates: true, leavesOnly: false, showSupportingMarkdown: true, showAssets: true },
  query: ''
});

assert.equal(discovery.records.length, 1, 'matching workspace record remains the canonical visible object');
assert.equal(discovery.records[0].id, workspaceRecord.id);
assert.deepEqual(discovery.records[0].workspaceCandidateRoles.map((candidate) => candidate.id), [duplicateCandidate.id], 'candidate role is attached to canonical record');
assert.deepEqual(discovery.workspaceCandidates.map((candidate) => candidate.id), [otherCandidate.id], 'candidate+record duplicate is not rendered as a separate user object');
assert.equal(discovery.counts.workspaceCandidates, 2, 'raw candidate count is preserved for ledger/source diagnostics');
assert.equal(discovery.counts.visibleWorkspaceCandidates, 1, 'visible candidate count reflects de-duplicated projection');
assert.equal(discovery.counts.groupedWorkspaceCandidates, 1, 'grouped candidate count explains why raw and visible counts differ');

console.log('✓ workspace discovery projection tests passed');
