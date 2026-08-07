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
const githubFolder = topicsFolder.folders.find((folder) => folder.name === '.github');
assert(githubFolder, 'issue records should use adapter-owned .topics/.github sidecar scope');
const tiinexFolder = githubFolder.folders.find((folder) => folder.name === 'tiinex');
const docsFolder = tiinexFolder?.folders.find((folder) => folder.name === 'docs');
const issuesFolder = docsFolder?.folders.find((folder) => folder.name === '.issues');
assert(issuesFolder, 'issue records should group under .topics/.github/<owner>/<repo>/.issues');
assert(!githubFolder.folders.some((folder) => folder.name === '.issues'), 'legacy .topics/.github/.issues paths should normalize below owner/repo');
const issueLeafPaths = [];
function collectItemPaths(folder) {
  for (const item of folder.items || []) issueLeafPaths.push(item.path);
  for (const child of folder.folders || []) collectItemPaths(child);
}
collectItemPaths(issuesFolder);
assert(issueLeafPaths.includes('.topics/.github/tiinex/docs/.issues/9/issue-snapshot.trace.md'), 'GitHub issue URL records should get a logical display path');
assert(issueLeafPaths.includes('.topics/.github/tiinex/docs/.issues/9/comment-001-4881780075-recovered-legacy.trace.md'), 'legacy issue paths should normalize to the logical issue scope');


const authorityTree = buildWorkspacePathTree({
  records: [{
    id: 'package:local:.topics/imported.trace.md',
    title: 'Imported package',
    path: 'artifacts/.topics/imported.trace.md',
    displayPath: '.topics/imported.trace.md',
    sourceMode: 'package-import',
    packageImport: true,
    source: { adapterId: 'export-package', kind: 'local-session', sourceKind: 'export.package.import', sourceBacked: false },
    sourceTarget: { browseUrl: 'https://github.com/owner/repo/blob/main/.topics/imported.trace.md' }
  }]
});
const importedItem = authorityTree.folders.find((folder) => folder.name === '.topics')?.items[0];
assert(importedItem, 'imported package item should keep its presentation path under .topics');
assert.equal(importedItem.authorityKind, 'imported-local', 'tree items should expose authority kind without making path provenance truth');
assert.equal(importedItem.presentationPath, '.topics/imported.trace.md', 'tree presentation path must remain separate from provenance/source path');
assert.equal(importedItem.provenancePath, 'https://github.com/owner/repo/blob/main/.topics/imported.trace.md', 'tree item can carry explicit provenance target separately from presentation path');

console.log('✓ workspace.pathTree tests passed');
