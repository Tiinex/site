import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { buildLineageSourceRecoveryPlan, lineageRecoveryFileRefForTarget } from './lineageSourceRecovery.js';

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

console.log('lineageSourceRecovery: ok');
