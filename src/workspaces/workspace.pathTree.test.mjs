import assert from 'node:assert/strict';
import { buildWorkspacePathTree, normalizeTreePath } from './workspace.pathTree.js';
import { recordLogicalPath } from './workspace.recordPaths.js';

assert.equal(normalizeTreePath('./src//artifacts/../artifacts/topic.trace.md'), 'src/artifacts/topic.trace.md');
assert.equal(normalizeTreePath('nested\\folder\\file.md'), 'nested/folder/file.md');


assert.equal(
  recordLogicalPath({ path: 'artifacts/.topics/.github/tiinusen/socials/.issues/3/001-1-imported.trace.md', sourceMode: 'package-import' }),
  '.topics/.github/tiinusen/socials/.issues/3/001-1-imported.trace.md',
  'package artifact envelope prefix must not be treated as logical tree/provenance path'
);

assert.equal(
  recordLogicalPath({ path: 'artifacts/manual-note.trace.md', sourceMode: 'local-files' }),
  'artifacts/manual-note.trace.md',
  'root artifacts/ is only stripped when record context says package import'
);

const tree = buildWorkspacePathTree({
  records: [
    { id: 'r1', title: 'Topic', path: 'src/artifacts/topic.trace.md', kind: 'topic' },
    { id: 'r2', title: 'Root', path: '.schemas/root.schema.md', kind: 'schema' },
    { id: 'w1', title: 'Workspace', path: '.workspaces/demo.workspace.md', kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1', workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true } }
  ],
  assets: [
    { id: 'a1', name: 'icon.svg', path: 'src/assets/icon.svg', type: 'image/svg+xml' }
  ]
});

assert.equal(tree.schema, 'tiinex.workspace.pathTree.v1');
assert.equal(tree.counts.records, 3);
assert.equal(tree.counts.assets, 1);
assert.equal(tree.counts.workspaceArtifacts, 1);
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
assert.equal(workspaces.items[0].type, 'record');
assert.equal(workspaces.items[0].materialRole, 'workspace-artifact', 'canonical workspace artifact stays a normal record item with workspace capability role');


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
assert(issueLeafPaths.includes('.topics/.github/tiinex/docs/.issues/9/000-issue-snapshot.trace.md'), 'GitHub issue URL records should get a canonical issue-sidecar display path');
assert(issueLeafPaths.includes('.topics/.github/tiinex/docs/.issues/9/001-legacy.trace.md'), 'legacy issue paths should normalize to canonical dimension-prefixed issue filenames');



const packageTree = buildWorkspacePathTree({
  records: [{
    id: 'pkg-child',
    title: 'Imported child',
    path: 'artifacts/.topics/.github/tiinusen/socials/.issues/3/001-1-imported-child.trace.md',
    sourceMode: 'package-import',
    source: { adapterId: 'export-package', sourceBacked: false }
  }]
});
const packageTopics = packageTree.folders.find((folder) => folder.name === '.topics');
assert(packageTopics, 'package-imported records should render by logical .topics path, not package envelope path');
assert(!packageTree.folders.some((folder) => folder.name === 'artifacts'), 'path tree must not make artifacts/ an ordinary folder for imported package records');



const gamingIssueTree = buildWorkspacePathTree({
  records: [{
    id: 'gaming-comment-canonical',
    title: '§1 Ängkvistlagen',
    path: '.topics/.github/tiinusen/socials/.issues/3/comment-003-5011140374-recovered-1-ngkvistlagen.trace.md',
    sourceMode: 'github-comment-embedded-artifact',
    sourceTarget: { inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011140374' }
  }, {
    id: 'gaming-comment-bare-legacy',
    title: 'Fler bondgårdar',
    path: 'comment-5011198457-fler-bondgårdar.trace.md',
    sourceMode: 'github-comment-embedded-artifact',
    sourceTarget: { inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457' }
  }]
});
const gamingIssuePaths = [];
function collectGamingPaths(folder) {
  for (const item of folder.items || []) gamingIssuePaths.push(item.path);
  for (const child of folder.folders || []) collectGamingPaths(child);
}
collectGamingPaths(gamingIssueTree);
assert(gamingIssuePaths.includes('.topics/.github/tiinusen/socials/.issues/3/003-1-ngkvistlagen.trace.md'), 'adapter recovered issue comments should render with canonical dimension-prefixed filenames, not comment-* filenames');
assert(gamingIssuePaths.includes('.topics/.github/tiinusen/socials/.issues/3/004-fler-bondg-rdar.trace.md'), 'bare legacy comment Source Paths should use source ordinal metadata for canonical tree filenames');
assert(!gamingIssuePaths.some((path) => /\/comment-/.test(path)), 'Tree view must not expose adapter comment-* filenames as ordinary logical filenames');

console.log('✓ workspace.pathTree tests passed');
