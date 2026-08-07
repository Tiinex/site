import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { buildLineageSourceRecoveryPlan, lineageRecoveryFileRefForTarget, lineageRecoveryIssueUrlForTarget } from './lineageSourceRecovery.js';

const childMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [Parent](../parent.trace.md)
- Current
  - Current Schema: [tiinex.discovery.follow.v1](tiinex.discovery.follow.v1.schema.md)
  - Created At: 2026-07-24
  - Summary: Awaiting response from Felix.

---

# Awaiting response

Currently awaiting response from Felix

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: child`;

const child = Object.assign(createRecordFromMarkdown(childMarkdown, { path: '.topics/issues/awaiting.trace.md', name: 'Awaiting response' }), {
  id: 'source:github:tiinex/docs:.topics/issues/awaiting.trace.md',
  source: { id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' }
});
const workspace = { id: 'ws', records: [child] };
const view = buildWorkspaceLineageView(workspace, { selectedRecordId: child.id });
assert.equal(view.selectedTraversal.hasMissing, true, 'fixture should expose missing parent before recovery');
const plan = buildLineageSourceRecoveryPlan(workspace, view);
assert.equal(plan.length, 1, 'one GitHub source should own the missing parent recovery');
assert.deepEqual(plan[0].fileRefs.map((item) => item.ref), ['.topics/parent.trace.md'], 'relative Parent Trace should become an exact repo file ref');
assert.equal(plan[0].fileRefs[0].targetKind, 'lineage-parent', 'lineage recovery refs should be marked as targeted parent-file reads');
assert.equal(lineageRecoveryFileRefForTarget('https://github.com/Tiinex/docs/blob/master/.topics/root.trace.md', child), '.topics/root.trace.md', 'blob URL parent targets become repo-relative refs');
const embeddedIssueChild = Object.assign(createRecordFromMarkdown(childMarkdown.replace('[Parent](../parent.trace.md)', '[Parent](../001-1-1.trace.md)'), { path: '.topics/.github/.issues/tiinex-docs-issue-10/comment-001-99-recovered-awaiting.trace.md', name: 'Awaiting response' }), {
  id: 'source:github:tiinex/docs:.topics/.github/.issues/tiinex-docs-issue-10/comment-001-99-recovered-awaiting.trace.md',
  source: { id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' },
  sourceTarget: { sourceArtifactPath: 'odysseus/branch/awaiting.trace.md' },
  snapshot: { embedded: true, sourceArtifactPath: 'odysseus/branch/awaiting.trace.md' }
});
assert.equal(lineageRecoveryFileRefForTarget('../001-1-1.trace.md', embeddedIssueChild), 'odysseus/001-1-1.trace.md', 'embedded issue lineage recovery must resolve relative Parent Trace from Source Path, not synthetic issue path');
assert.equal(lineageRecoveryFileRefForTarget('https://github.com/Tiinex/docs/issues/9', embeddedIssueChild), '', 'lineage recovery must not treat a GitHub issue URL as a repo file ref');
assert.equal(lineageRecoveryFileRefForTarget('https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075', embeddedIssueChild), '', 'lineage recovery must not treat a GitHub issue comment URL as a repo file ref');

const embeddedWithIssueCommentParent = Object.assign({}, embeddedIssueChild, {
  trace: 'comment-002-5011116876-recovered-klagomuren.trace.md',
  sourceTarget: Object.assign({}, embeddedIssueChild.sourceTarget, {
    parentArtifactPath: 'comment-002-5011116876-recovered-klagomuren.trace.md',
    parentSourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876',
    parentRawUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876'
  }),
  snapshot: Object.assign({}, embeddedIssueChild.snapshot, {
    parentArtifactPath: 'comment-002-5011116876-recovered-klagomuren.trace.md',
    parentSourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876'
  })
});
assert.equal(lineageRecoveryIssueUrlForTarget('comment-002-5011116876-recovered-klagomuren.trace.md', embeddedWithIssueCommentParent), 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876', 'issue-comment parent provenance should become a targeted issue recovery URL rather than a repo file guess');
assert.equal(lineageRecoveryFileRefForTarget('comment-002-5011116876-recovered-klagomuren.trace.md', embeddedWithIssueCommentParent), 'odysseus/branch/comment-002-5011116876-recovered-klagomuren.trace.md', 'file recovery remains available only as the legacy relative fallback');

const missingIssueCommentWorkspace = { id: 'ws-comment', records: [Object.assign({}, embeddedWithIssueCommentParent, { id: 'source:github:tiinusen/socials:child', source: { id: 'github:tiinusen/socials', adapterId: 'github', kind: 'github-tree', repo: 'Tiinusen/socials', ref: '', rootPath: '.topics', transportRefreshTier: 'proxy' } })] };
const missingIssueCommentView = buildWorkspaceLineageView(missingIssueCommentWorkspace, { selectedRecordId: 'source:github:tiinusen/socials:child' });
const issueCommentPlan = buildLineageSourceRecoveryPlan(missingIssueCommentWorkspace, missingIssueCommentView);
assert.equal(issueCommentPlan.length, 1, 'missing issue-comment parents should produce a recovery plan');
assert.deepEqual(issueCommentPlan[0].issueUrls, ['https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876'], 'issue-comment parent recovery should target the concrete parent comment URL');
assert.deepEqual(issueCommentPlan[0].fileRefs, [], 'issue-comment parent recovery should not queue a misleading repo file ref when concrete issue provenance exists');

const embeddedWithDeclaredParentPath = Object.assign({}, embeddedIssueChild, {
  sourceTarget: Object.assign({}, embeddedIssueChild.sourceTarget, { parentArtifactPath: '.topics/educational/memes/magic-the-gathering/001-2-the-stack-remembers.trace.md' }),
  snapshot: Object.assign({}, embeddedIssueChild.snapshot, { parentArtifactPath: '.topics/educational/memes/magic-the-gathering/001-2-the-stack-remembers.trace.md' })
});
assert.equal(lineageRecoveryFileRefForTarget('../../../educational/memes/magic-the-gathering/001-2-the-stack-remembers.trace.md', embeddedWithDeclaredParentPath), '.topics/educational/memes/magic-the-gathering/001-2-the-stack-remembers.trace.md', 'publication Parent Artifact Path should override synthetic issue path for exact parent-file recovery');
const embeddedWithIssueLocalParent = Object.assign({}, embeddedIssueChild, {
  sourceTarget: Object.assign({}, embeddedIssueChild.sourceTarget, { parentArtifactPath: 'issue-root-recovered-welcome-to-the-next-dimension.trace.md' }),
  snapshot: Object.assign({}, embeddedIssueChild.snapshot, { parentArtifactPath: 'issue-root-recovered-welcome-to-the-next-dimension.trace.md' })
});
assert.equal(lineageRecoveryFileRefForTarget('issue-root-recovered-welcome-to-the-next-dimension.trace.md', embeddedWithIssueLocalParent), 'odysseus/branch/issue-root-recovered-welcome-to-the-next-dimension.trace.md', 'simple issue-local parent aliases remain normal relative targets and are not treated as repo-root file refs');


const recoveredSourceFileWithStaleSourcePath = Object.assign(createRecordFromMarkdown(childMarkdown.replace('[Parent](../parent.trace.md)', '[Parent](001.trace.md)'), { path: '.topics/odysseus/001-1.trace.md', name: 'Odysseus / Context Reduction And Compaction Review' }), {
  id: 'source:github:tiinex/docs:.topics/odysseus/001-1.trace.md',
  source: { id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' },
  sourceTarget: { surface: 'lineageRecovery', targetKind: 'lineage-parent', sourceArtifactPath: '.topics/educational/memes/magic-the-gathering/001-1.trace.md' }
});
assert.equal(lineageRecoveryFileRefForTarget('001.trace.md', recoveredSourceFileWithStaleSourcePath), '.topics/odysseus/001.trace.md', 'lineage recovery for an already loaded source file must respect the file path, not stale issue/sourceArtifactPath context');


const recoveredSourceFileWithParentOrigin = Object.assign(createRecordFromMarkdown(childMarkdown.replace('[Parent](../parent.trace.md)', '[Parent](001.trace.md)'), { path: 'https://raw.githubusercontent.com/Tiinex/docs/25c3d5380e7fa98427dc4d0b128ccbeb5e46a72a/.topics/odysseus/001-1.trace.md', name: 'Odysseus / Context Reduction And Compaction Review' }), {
  id: 'source:github:tiinex/docs:.topics/odysseus/001-1.trace.md',
  source: { id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' },
  origin: 'https://github.com/Tiinex/docs/blob/6bbbeb9757a9d44d951877753b6f729ab3eb8f0b/.topics/odysseus/001.trace.md'
});
assert.equal(lineageRecoveryFileRefForTarget('001.trace.md', recoveredSourceFileWithParentOrigin), '.topics/odysseus/001.trace.md', 'lineage recovery should prefer an explicit parent Origin file URL over current source ref guessing');


const recoveredSourceFileWithRelativeOrigin = Object.assign(createRecordFromMarkdown(childMarkdown.replace('[Parent](../parent.trace.md)', '[Parent](001.trace.md)'), { path: '.topics/odysseus/001-1.trace.md', name: 'Odysseus / Context Reduction And Compaction Review' }), {
  id: 'source:github:tiinex/docs:.topics/odysseus/001-1.trace.md:relative-origin',
  source: { id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' },
  origin: '001.trace.md'
});
assert.equal(lineageRecoveryFileRefForTarget('001.trace.md', recoveredSourceFileWithRelativeOrigin), '.topics/odysseus/001.trace.md', 'relative Parent Origin on a real source file must not override cwd-relative parent recovery');

console.log('lineageSourceRecovery: ok');
