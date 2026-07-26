import assert from 'node:assert/strict';
import { buildWorkspacePathTree, normalizeTreePath } from './workspace.pathTree.js';

assert.equal(normalizeTreePath('./src//artifacts/../artifacts/topic.trace.md'), 'src/artifacts/topic.trace.md');
assert.equal(normalizeTreePath('nested\\folder\\file.md'), 'nested/folder/file.md');

const tree = buildWorkspacePathTree({
  records: [
    { id: 'r1', title: 'Topic', path: 'src/artifacts/topic.trace.md', kind: 'topic' },
    { id: 'r2', title: 'Root', path: '.schemas/root.schema.md', kind: 'schema' }
  ],
  assets: [
    { id: 'a1', name: 'icon.svg', path: 'src/assets/icon.svg', type: 'image/svg+xml' }
  ],
  workspaceCandidates: [
    { id: 'w1', title: 'Workspace', path: '.workspaces/demo.workspace.md' }
  ]
});

assert.equal(tree.schema, 'tiinex.workspace.pathTree.v1');
assert.equal(tree.counts.records, 2);
assert.equal(tree.counts.assets, 1);
assert.equal(tree.counts.workspaceCandidates, 1);
assert.equal(tree.counts.total, 4);
assert.deepEqual(tree.folders.map((folder) => folder.name), ['.schemas', '.workspaces', 'src']);

const src = tree.folders.find((folder) => folder.name === 'src');
assert.equal(src.counts.records, 1);
assert.equal(src.counts.assets, 1);
assert.deepEqual(src.folders.map((folder) => folder.name), ['artifacts', 'assets']);

const artifacts = src.folders.find((folder) => folder.name === 'artifacts');
assert.equal(artifacts.items[0].name, 'topic.trace.md');
assert.equal(artifacts.items[0].type, 'record');

const workspaces = tree.folders.find((folder) => folder.name === '.workspaces');
assert.equal(workspaces.items[0].type, 'workspace');


const issueTree = buildWorkspacePathTree({
  records: [{
    id: 'issue-record',
    title: 'Issue snapshot',
    path: 'https://github.com/Tiinex/docs/issues/9',
    sourceMode: 'github-issue-snapshot',
    source: { adapterId: 'github', repo: 'Tiinex/docs' },
    sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9' }
  }, {
    id: 'legacy-comment',
    title: 'Legacy comment',
    path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-001-4881780075-recovered-legacy.trace.md',
    sourceMode: 'github-comment-embedded-artifact',
    source: { adapterId: 'github', repo: 'Tiinex/docs' },
    sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075' }
  }]
});
const topicsFolder = issueTree.folders.find((folder) => folder.name === '.topics');
assert(topicsFolder, 'issue records should display under .topics');
const issuesFolder = topicsFolder.folders.find((folder) => folder.name === '.issues');
assert(issuesFolder, 'issue records should use logical .topics/.issues scope');
assert(!topicsFolder.folders.some((folder) => folder.name === '.github'), 'legacy .topics/.github issue paths should not leak into the display tree');
const issueLeafPaths = [];
function collectItemPaths(folder) {
  for (const item of folder.items || []) issueLeafPaths.push(item.path);
  for (const child of folder.folders || []) collectItemPaths(child);
}
collectItemPaths(issuesFolder);
assert(issueLeafPaths.includes('.topics/.issues/github/tiinex-docs/9/issue-snapshot.trace.md'), 'GitHub issue URL records should get a logical display path');
assert(issueLeafPaths.includes('.topics/.issues/github/tiinex-docs/9/comment-001-4881780075-recovered-legacy.trace.md'), 'legacy issue paths should normalize to the logical issue scope');

console.log('✓ workspace.pathTree tests passed');
