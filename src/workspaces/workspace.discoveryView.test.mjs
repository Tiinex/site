import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildWorkspaceDiscoveryView } from './workspace.discoveryView.js';
import { buildWorkspacePathTree } from './workspace.pathTree.js';
import { buildWorkspaceLineageView } from './workspace.lineageView.js';

function artifactMarkdown({ title, summary, schema = 'tiinex.topic.v1', parentTrace = '', parentLabel = '001.trace.md' }) {
  const parentBlock = parentTrace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [${parentLabel}](${parentTrace})\n` : '';
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${parentBlock}- Current\n  - Current Schema: [${schema}](${schema}.schema.md)\n  - Created At: 2026-07-23T00:00:00.000Z\n  - Summary: ${summary}\n\n---\n\n# ${title}\n\n## Summary\n\n${summary}\n\n# Continuity Integrity\n\n- Method: pending\n  - Value: pending\n`;
}

function sourceBackedRecord(markdown, path) {
  return Object.assign(createRecordFromMarkdown(markdown, {
    path,
    sourceMode: 'source-backed'
  }), {
    id: path,
    sourceMode: 'source-backed',
    source: { id: 'github:Tiinex/docs@master:.topics', adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics', label: 'Tiinex/docs' }
  });
}

const educationalRoot = sourceBackedRecord(artifactMarkdown({
  title: 'Educational Root',
  summary: 'Educational branch root.'
}), '.topics/educational/001.trace.md');

const slidesBranch = sourceBackedRecord(artifactMarkdown({
  title: 'Slides Branch',
  summary: 'Slides branch under educational root.',
  parentTrace: '../001.trace.md'
}), '.topics/educational/slides/001.trace.md');

const terminalSlide = sourceBackedRecord(artifactMarkdown({
  title: 'Expert First Diagrams',
  summary: 'Terminal work leaf under slides branch.',
  parentTrace: '../001.trace.md'
}), '.topics/educational/slides/expert-first/001.trace.md');

const metadataOnlyAdapter = {
  id: '.topics/.adapters/github/discussion.adapter.md',
  title: 'GitHub Discussion Discovery Adapter',
  path: '.topics/.adapters/github/discussion.adapter.md',
  schemaId: 'tiinex.adapter.v1',
  kind: 'tiinex.adapter.v1',
  sourceMode: 'source-backed',
  source: { id: 'github:Tiinex/docs@master:.topics', adapterId: 'github', rootPath: '.topics', label: 'Tiinex/docs' },
  trace: '../001.trace.md',
  hasContinuityContext: true,
  hasIntegrity: true,
  cacheState: 'source-backed-metadata-only-session-cache'
};

const records = [educationalRoot, slidesBranch, terminalSlide, metadataOnlyAdapter];
const workspace = { id: 'workspace:discovery-test', title: 'Discovery test', records, assets: [], workspaceMergeCandidates: [] };
const view = buildWorkspaceDiscoveryView(workspace, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceCandidates: false, showAssets: false },
  query: ''
});

assert.deepEqual(view.records.map((record) => record.path), ['.topics/educational/slides/expert-first/001.trace.md'], 'Leaves only shows only terminal work leaves in Discovery Feed');
assert.equal(view.hiddenReasonsById.get(educationalRoot.id), 'hidden-not-terminal-work-leaf', 'Educational Root is hidden as a loaded parent');
assert.equal(view.hiddenReasonsById.get(slidesBranch.id), 'hidden-not-terminal-work-leaf', 'Slides Branch is hidden as a loaded parent');
assert.equal(view.hiddenReasonsById.get(metadataOnlyAdapter.id), 'hidden-not-terminal-work-leaf', 'metadata-only adapter support is hidden from Leaves only');

const tree = buildWorkspacePathTree({ records: view.records, assets: view.assets, workspaceCandidates: view.workspaceCandidates, rootLabel: 'Visible tree' });
const treeJson = JSON.stringify(tree);
assert.equal(treeJson.includes('Educational Root'), false, 'Tree read-model uses same Discovery membership and hides parent root records');
assert.equal(treeJson.includes('Slides Branch'), false, 'Tree read-model uses same Discovery membership and hides branch parent records');
assert.equal(treeJson.includes('Expert First Diagrams'), true, 'Tree still includes terminal work leaf');
assert.equal(treeJson.includes('GitHub Discussion Discovery Adapter'), false, 'Tree hides support records under Leaves only');

const lineage = buildWorkspaceLineageView(workspace, { records, selectedRecordId: terminalSlide.id });
assert.deepEqual((lineage.selectedTraversal?.nodes || []).map((node) => node.id), [terminalSlide.id, slidesBranch.id, educationalRoot.id], 'Lineage still traverses parent/root chain independent of Discovery membership');

console.log('✓ workspace.discoveryView integration tests passed');
