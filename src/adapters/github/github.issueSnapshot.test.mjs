import assert from 'node:assert/strict';
import { __testYieldToBrowserIfAvailable, materializeGithubIssueSnapshotFixtures, parseGithubIssueSnapshotTarget, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';
import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
import { traverseLoadedLineage } from '../../lineage/lineage.traverse.js';

const issue = parseGithubIssueSnapshotTarget('https://github.com/Tiinex/docs/issues/123');
assert.equal(issue.ok, true);
assert.equal(issue.repository, 'Tiinex/docs');
assert.equal(issue.kind, 'issue');
assert.equal(issue.number, 123);
assert.equal(issue.canonicalUrl, 'https://github.com/Tiinex/docs/issues/123');
assert.equal(issue.apiUrl, 'https://api.github.com/repos/Tiinex/docs/issues/123');

const discussion = parseGithubIssueSnapshotTarget('https://github.com/Tiinex/docs/discussions/45?foo=bar');
assert.equal(discussion.ok, true);
assert.equal(discussion.kind, 'discussion');
assert.equal(discussion.canonicalUrl, 'https://github.com/Tiinex/docs/discussions/45');

const mixed = parseGithubIssueSnapshotTargets(['https://github.com/Tiinex/docs/issues/123', 'https://github.com/Tiinex/docs/issues/123', 'http://github.com/Tiinex/docs/issues/999', 'https://github.com/Tiinex/docs/pulls/1']);
assert.equal(mixed.counts.targets, 1, 'duplicates are removed and unsupported plural pulls URL is rejected');
assert.equal(mixed.counts.errors, 2, 'invalid issue targets are explicit errors');


const originalWindow = globalThis.window;
let idleOptions = null;
globalThis.window = {
  requestIdleCallback(callback, options) {
    idleOptions = options;
    callback({ didTimeout: false, timeRemaining: () => 0 });
  }
};
await __testYieldToBrowserIfAvailable();
assert.equal(idleOptions?.timeout, 80, 'browser yield must call requestIdleCallback with an IdleRequestOptions object, not a numeric timeout');
if (originalWindow === undefined) delete globalThis.window;
else globalThis.window = originalWindow;

const materialized = materializeGithubIssueSnapshotFixtures('https://github.com/Tiinex/docs/issues/123\nhttps://github.com/Tiinex/docs/discussions/45', {
  'https://github.com/Tiinex/docs/issues/123': {
    title: 'Snapshot issue',
    state: 'open',
    user: { login: 'q' },
    created_at: '2026-07-21T00:00:00.000Z',
    body: 'Issue body',
    comments: [{ user: { login: 'reviewer' }, body: 'Comment body' }]
  }
});
assert.equal(materialized.records.length, 1, 'fixture-backed issue materializes one record');
assert.equal(materialized.warnings.length, 1, 'missing discussion fixture is deferred as warning');
const record = materialized.records[0];
assert.equal(record.kind, 'tiinex.evidence.v1', 'issue snapshot materializes as evidence record');
assert.equal(record.snapshot.target.kind, 'issue');
assert(record.markdown.includes('## Supported Claim Or Question'), 'snapshot markdown includes Evidence required sections');
assert(record.markdown.includes('Source Boundary: read-only GitHub issue snapshot'), 'snapshot markdown is explicit about source boundary');
assert(record.markdown.includes('## Preservation And Fidelity'), 'snapshot markdown includes preservation section');
assert.equal(record.summary, 'Issue body', 'issue snapshot summary should use visible issue body excerpt instead of generic boundary text');
assert.equal(record.source, undefined, 'adapter materialization must not assign lifecycle source provenance');


const embeddedChild = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [Parent](parent.trace.md)
- Current
  - Current Schema: [tiinex.feedback.v1](tiinex.feedback.v1.schema.md)
  - Created At: 2026-07-24
  - Summary: Embedded feedback recovered from issue body.

---

# Embedded Feedback

Does not look like Magic the Gathering.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: fixture`;

const embeddedMaterialized = materializeGithubIssueSnapshotFixtures('https://github.com/Tiinex/docs/issues/13', {
  'https://github.com/Tiinex/docs/issues/13': {
    title: 'Feedback: embedded artifact',
    state: 'open',
    user: { login: 'q' },
    created_at: '2026-07-24T00:00:00.000Z',
    body: ['Presentation for GitHub readers.', '', '## Tiinex Boundary', '', '- Source Path: .topics/stack/feedback.trace.md', '', '## Source Markdown', '', '~~~md', embeddedChild, '~~~'].join('\n'),
    comments: [{ id: 5001, html_url: 'https://github.com/Tiinex/docs/issues/13#issuecomment-5001', user: { login: 'reviewer' }, body: 'plain comment' }]
  }
});
assert.equal(embeddedMaterialized.records.length, 1, 'embedded issue source markdown should materialize the typed artifact, not only an adapter evidence wrapper');
const embeddedRecord = embeddedMaterialized.records[0];
assert.equal(embeddedRecord.kind, 'tiinex.feedback.v1', 'embedded issue source markdown preserves the artifact Current Schema');
assert.equal(embeddedRecord.title, 'Embedded Feedback', 'embedded issue source markdown preserves the artifact title');
assert.equal(embeddedRecord.path, '.topics/stack/feedback.trace.md', 'embedded issue source path should be preserved when the publication boundary provides it');
assert.equal(embeddedRecord.trace, 'parent.trace.md', 'embedded issue source markdown preserves declared Parent Trace target for lineage resolution');
assert.equal(embeddedRecord.snapshot.embedded, true, 'embedded recovery is explicit metadata, not a generic evidence snapshot');
assert.equal(embeddedRecord.sourceTarget.targetKind, 'github-issue-embedded-artifact', 'source target classifies embedded artifact recovery separately from raw issue snapshots');

const parentRecord = createRecordFromMarkdown(`# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-23
  - Summary: Parent artifact for embedded issue lineage.

---

# Parent

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: parent`, { path: '.topics/stack/parent.trace.md', name: 'Parent' });
const embeddedTraversal = traverseLoadedLineage([parentRecord, embeddedRecord], { selectedId: embeddedRecord.id || embeddedRecord.path, maxDepth: 2 });
assert.equal(embeddedTraversal.stats.visitedNodes, 2, 'embedded issue artifact lineage should traverse to its loaded declared parent');
assert.equal(embeddedTraversal.stats.missingEdges, 0, 'embedded issue artifact should not become an isolated issue adapter shell when parent is loaded');

console.log('github.issueSnapshot: ok');
