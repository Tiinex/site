import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildWorkspaceDiscoveryView, buildDiscoveryMaterialIndex, isDiscoveryLeafRecord } from './workspace.discoveryView.js';
import { buildWorkspacePathTree } from './workspace.pathTree.js';
import { buildWorkspaceLineageView } from './workspace.lineageView.js';

function artifactMarkdown({ title, summary, schema = 'tiinex.topic.v1', parentTrace = '', parentLabel = '001.trace.md' }) {
  const parentBlock = parentTrace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [${parentLabel}](${parentTrace})\n` : '';
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${parentBlock}- Current\n  - Current Schema: [${schema}](${schema}.schema.md)\n  - Created At: 2026-07-23T00:00:00.000Z\n  - Summary: ${summary}\n\n---\n\n# ${title}\n\n## Summary\n\n${summary}\n\n# Continuity Integrity\n\n- Method: pending\n  - Value: pending\n`;
}

function sourceBackedRecord(markdown, path, extra = {}) {
  return Object.assign(createRecordFromMarkdown(markdown, {
    path,
    sourceMode: 'source-backed'
  }), {
    id: extra.id || path,
    sourceMode: 'source-backed',
    source: { id: 'github:Tiinex/docs@master:.topics', adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics', label: 'Tiinex/docs' }
  }, extra);
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

const socialsRoot = sourceBackedRecord(artifactMarkdown({
  title: 'Socials Branch',
  summary: 'Socials folder root.'
}), '.topics/socials/discord/tiinex/001.trace.md');

const socialsTask = sourceBackedRecord(artifactMarkdown({
  title: 'Echo Cloud Handoff',
  summary: 'Task under socials root.',
  schema: 'tiinex.task.v1',
  parentTrace: './001.trace.md'
}), '.topics/socials/discord/tiinex/001-I-echo-cloud-handoff.trace.md');

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

const routeShell = {
  id: 'route-shell',
  title: 'Route Shell',
  path: '.topics/route/001.trace.md',
  schemaId: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { id: 'github:Tiinex/docs@master:.topics', adapterId: 'github', rootPath: '.topics', label: 'Tiinex/docs' },
  hasContinuityContext: true,
  cacheState: 'route-shell-material-unavailable',
  materialAvailability: 'material-unavailable'
};


const pathOnlyParent = sourceBackedRecord(artifactMarkdown({
  title: 'Path Only Root',
  summary: 'Branch root whose child lacks a declared trace.'
}), '.topics/path-only/001.trace.md');

const pathOnlyChild = sourceBackedRecord(artifactMarkdown({
  title: 'Path Only Child',
  summary: 'Terminal child under path-only branch.'
}), '.topics/path-only/child/001.trace.md');

const records = [educationalRoot, slidesBranch, terminalSlide, socialsRoot, socialsTask, pathOnlyParent, pathOnlyChild, metadataOnlyAdapter, routeShell];
const workspace = { id: 'workspace:discovery-test', title: 'Discovery test', records, assets: [], workspaceMergeCandidates: [] };
const view = buildWorkspaceDiscoveryView(workspace, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: true, showWorkspaceCandidates: false, showAssets: false },
  query: ''
});

assert.deepEqual(view.records.map((record) => record.path).sort(), [
  '.topics/educational/slides/expert-first/001.trace.md',
  '.topics/path-only/child/001.trace.md',
  '.topics/socials/discord/tiinex/001-I-echo-cloud-handoff.trace.md'
], 'Leaves only shows terminal work leaves only, even when Supporting docs is checked');
assert.equal(view.hiddenReasonsById.get(educationalRoot.id), 'hidden-loaded-parent', 'Educational Root is hidden as a resolved loaded parent');
assert.equal(view.hiddenReasonsById.get(pathOnlyParent.id), 'hidden-path-parent', 'Path-only branch root is hidden by path-parent fallback even without a declared trace edge');
assert.equal(view.hiddenReasonsById.get(slidesBranch.id), 'hidden-loaded-parent', 'Slides Branch is hidden as a resolved loaded parent');
assert.equal(view.hiddenReasonsById.get(socialsRoot.id), 'hidden-loaded-parent', 'Folder 001.trace.md parent is hidden when a sibling child declares it');
assert.equal(view.hiddenReasonsById.get(metadataOnlyAdapter.id), 'hidden-supporting', 'metadata-only adapter support is hidden from Leaves only');
assert.equal(view.hiddenReasonsById.get(routeShell.id), 'hidden-supporting', 'route-only unavailable shell is hidden from Leaves only');

const index = buildDiscoveryMaterialIndex(records);
const viewWithReusedIndex = buildWorkspaceDiscoveryView(workspace, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: true, showWorkspaceCandidates: false, showAssets: false },
  query: 'expert',
  materialIndex: index
});
assert.equal(viewWithReusedIndex.materialIndex, index, 'Discovery view can reuse a stable material index across query/filter changes');
assert.equal(isDiscoveryLeafRecord(educationalRoot, index), false, 'path branch roots are not Discovery leaves');
assert.equal(isDiscoveryLeafRecord(socialsRoot, index), false, 'same-folder 001.trace.md roots are not Discovery leaves when they have child work records');
assert.equal(isDiscoveryLeafRecord(socialsTask, index), true, 'terminal same-folder child remains a Discovery leaf');


const workspaceConfigRecord = sourceBackedRecord(`# Continuity Context

- Current
  - Current Schema: [tiinex.workspace.v1](schema.md)
  - Summary: Workspace selector.

---

# Documentation

## Workspace Entrypoints
`, '.topics/documentation.workspace.md', { currentSchemaId: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1' });
const workspaceRecordView = buildWorkspaceDiscoveryView({ id: 'workspace:workspace-record', records: [workspaceConfigRecord], assets: [], workspaceMergeCandidates: [] }, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false },
  query: ''
});
assert.equal(workspaceRecordView.records.length, 1, 'source-backed .workspace.md records stay visible when workspace candidates are enabled even under Leaves only');
const workspaceRecordHiddenView = buildWorkspaceDiscoveryView({ id: 'workspace:workspace-record', records: [workspaceConfigRecord], assets: [], workspaceMergeCandidates: [] }, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: true, showWorkspaceCandidates: false, showAssets: false },
  query: ''
});
assert.equal(workspaceRecordHiddenView.records.length, 0, 'source-backed .workspace.md records respect the workspace candidates display toggle');

const parentWorkspaceRecord = sourceBackedRecord(`# Continuity Context

- Current
  - Current Schema: [tiinex.workspace.v1](schema.md)
  - Summary: Parent workspace.

---

# Parent Workspace
`, '.topics/parent.workspace.md', { currentSchemaId: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1' });
const childWorkspaceRecord = sourceBackedRecord(`# Continuity Context

- Parent
  - Parent Schema: [tiinex.workspace.v1](schema.md)
  - Trace: [parent.workspace.md](./parent.workspace.md)
- Current
  - Current Schema: [tiinex.workspace.v1](schema.md)
  - Summary: Child workspace.

---

# Child Workspace
`, '.topics/child.workspace.md', { currentSchemaId: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1' });
const workspaceRecordLeafView = buildWorkspaceDiscoveryView({ id: 'workspace:workspace-record-lineage', records: [parentWorkspaceRecord, childWorkspaceRecord], assets: [], workspaceMergeCandidates: [] }, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false },
  query: ''
});
assert.deepEqual(workspaceRecordLeafView.records.map((record) => record.title), ['Child Workspace'], 'Leaves only hides parent .workspace.md records but keeps terminal workspace cards for Open/Merge');
assert.equal(workspaceRecordLeafView.hiddenReasonsById.get(parentWorkspaceRecord.id), 'hidden-loaded-parent', 'parent workspace card is hidden by leaf membership rather than the workspace-candidates toggle');

const staleRootWorkspaceRecord = sourceBackedRecord(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](schema.md)
- Current
  - Current Schema: [tiinex.workspace.v1](schema.md)
  - Summary: Start workspace root.

---

# Start

# Continuity Integrity

- [sha](validator.md)
  - Towards: self
  - Value: current-start-hash
`, '.topics/site/1/issue-root-recovered-start.workspace.md', { id: 'stale-start-workspace', currentSchemaId: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1' });
const staleRootChildTopic = sourceBackedRecord(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](schema.md)
- Parent
  - Parent Schema: [tiinex.workspace.v1](schema.md)
  - Trace: [issue-root-recovered-start.workspace.md](issue-root-recovered-start.workspace.md)
- Current
  - Current Schema: [tiinex.topic.v1](schema.md)
  - Summary: News child.

---

# News

# Continuity Integrity

- [sha](validator.md)
  - Towards: [issue-root-recovered-start.workspace.md](issue-root-recovered-start.workspace.md)
  - Value: old-start-hash
`, '.topics/site/2/issue-root-recovered-news.trace.md', { id: 'news-child-topic', currentSchemaId: 'tiinex.topic.v1', schemaId: 'tiinex.topic.v1', sourceTarget: { parentArtifactPath: '.topics/site/1/issue-root-recovered-start.workspace.md' }, snapshot: { parentArtifactPath: '.topics/site/1/issue-root-recovered-start.workspace.md' } });
const staleWorkspaceRootLeafView = buildWorkspaceDiscoveryView({ id: 'workspace:stale-workspace-root', records: [staleRootWorkspaceRecord, staleRootChildTopic], assets: [], workspaceMergeCandidates: [] }, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false },
  query: ''
});
assert.deepEqual(staleWorkspaceRootLeafView.records.map((record) => record.title), ['News'], 'Leaves only hides loaded workspace/root parents even when the edge is stale or integrity-mismatched');
assert.equal(staleWorkspaceRootLeafView.hiddenReasonsById.get(staleRootWorkspaceRecord.id), 'hidden-loaded-parent', 'mismatched workspace roots stay classified as loaded parents for Discovery membership');

const staleIssueParent = sourceBackedRecord(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](schema.md)
  - Created At: 2026-07-18
  - Summary: Parent whose integrity changed.

---

# Klagomuren

# Continuity Integrity

- [sha](validator.md)
  - Towards: self
  - Value: current-parent-integrity
`, '.topics/.github/tiinusen/socials/.issues/3/comment-002-5011116876-recovered-klagomuren.trace.md', { id: 'stale-issue-parent' });
const staleIssueChild = sourceBackedRecord(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](schema.md)
  - Trace: [comment-002-5011116876-recovered-klagomuren.trace.md](comment-002-5011116876-recovered-klagomuren.trace.md)
- Current
  - Current Schema: [tiinex.discovery.finding.v1](schema.md)
  - Created At: 2026-07-18
  - Summary: Child points at older parent integrity.

---

# Fler bondgårdar

# Continuity Integrity

- [sha](validator.md)
  - Towards: [comment-002-5011116876-recovered-klagomuren.trace.md](comment-002-5011116876-recovered-klagomuren.trace.md)
  - Value: stale-parent-integrity
`, '.topics/.github/tiinusen/socials/.issues/3/comment-004-5011198457-recovered-fler-bondgardar.trace.md', { id: 'stale-issue-child' });
const staleIssueView = buildWorkspaceDiscoveryView({ id: 'workspace:stale-issue-parent', records: [staleIssueParent, staleIssueChild], assets: [], workspaceMergeCandidates: [] }, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false },
  query: ''
});
assert.deepEqual(staleIssueView.records.map((record) => record.id), ['stale-issue-child', 'stale-issue-parent'], 'Leaves-only should keep stale/mismatch issue parents visible while Lineage remains navigable with mismatch diagnostics');

const tree = buildWorkspacePathTree({ records: view.records, assets: view.assets, workspaceCandidates: view.workspaceCandidates, rootLabel: 'Visible tree' });
const treeJson = JSON.stringify(tree);
assert.equal(treeJson.includes('Educational Root'), false, 'Tree read-model uses same Discovery membership and hides parent root records');
assert.equal(treeJson.includes('Slides Branch'), false, 'Tree read-model uses same Discovery membership and hides branch parent records');
assert.equal(treeJson.includes('Socials Branch'), false, 'Tree read-model uses same Discovery membership and hides same-folder 001.trace.md parents');
assert.equal(treeJson.includes('Path Only Root'), false, 'Tree read-model hides path-only branch parents');
assert.equal(treeJson.includes('Path Only Child'), true, 'Tree still includes path-only terminal child');
assert.equal(treeJson.includes('Expert First Diagrams'), true, 'Tree still includes terminal work leaf');
assert.equal(treeJson.includes('Echo Cloud Handoff'), true, 'Tree still includes terminal sibling work leaf');
assert.equal(treeJson.includes('GitHub Discussion Discovery Adapter'), false, 'Tree hides support records under Leaves only');

const lineage = buildWorkspaceLineageView(workspace, { records, selectedRecordId: terminalSlide.id });
assert.deepEqual((lineage.selectedTraversal?.nodes || []).map((node) => node.id), [terminalSlide.id, slidesBranch.id, educationalRoot.id], 'Lineage still traverses parent/root chain independent of Discovery membership');


const syntheticRecords = Array.from({ length: 325 }, (_, index) => ({
  id: `synthetic-${index}`,
  title: `Synthetic ${index}`,
  path: `.topics/perf/group-${Math.floor(index / 10)}/child-${index % 10}/001.trace.md`,
  sourcePath: `.topics/perf/group-${Math.floor(index / 10)}/child-${index % 10}/001.trace.md`,
  schemaId: 'tiinex.topic.v1',
  kind: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { id: 'github:Tiinex/docs@master:.topics', adapterId: 'github', rootPath: '.topics', label: 'Tiinex/docs' },
  hasContinuityContext: true,
  hasIntegrity: true
}));
const startedAt = Date.now();
buildWorkspaceDiscoveryView({ id: 'workspace:perf', records: syntheticRecords }, {
  displayOptions: { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceCandidates: false, showAssets: false },
  query: ''
});
const elapsed = Date.now() - startedAt;
assert.ok(elapsed < 1000, `Discovery membership for 325 records should stay render-safe; took ${elapsed}ms`);

console.log('✓ workspace.discoveryView integration tests passed');
