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
assert.deepEqual(plan[0].fileRefs, ['.topics/parent.trace.md'], 'relative Parent Trace should become an exact repo file ref');
assert.equal(lineageRecoveryFileRefForTarget('https://github.com/Tiinex/docs/blob/master/.topics/root.trace.md', child), '.topics/root.trace.md', 'blob URL parent targets become repo-relative refs');
console.log('lineageSourceRecovery: ok');
