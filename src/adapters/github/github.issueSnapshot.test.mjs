import assert from 'node:assert/strict';
import { __testYieldToBrowserIfAvailable, createGithubIssueSnapshotRecords, materializeGithubIssueSnapshotFixtures, materializeGithubIssueSnapshots, parseGithubIssueSnapshotTarget, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';
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
    body: ['Presentation for GitHub readers.', '', '## Tiinex Boundary', '', '- Source Path: .topics/stack/feedback.trace.md', '- Tiinex Parent Artifact Path: .topics/stack/parent.trace.md', '', '## Source Markdown', '', '~~~md', embeddedChild, '~~~'].join('\n'),
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
assert.equal(embeddedRecord.sourceTarget.parentArtifactPath, '.topics/stack/parent.trace.md', 'embedded issue recovery preserves publication Parent Artifact Path as recovery metadata');

const detailsEmbeddedMaterialized = materializeGithubIssueSnapshotFixtures('https://github.com/Tiinex/docs/issues/9', {
  'https://github.com/Tiinex/docs/issues/9': {
    title: 'Welcome to the Next Dimension',
    state: 'open',
    user: { login: 'q' },
    created_at: '2026-07-24T00:00:00.000Z',
    body: [
      'Presentation for GitHub readers.',
      '',
      '<details>',
      '<summary>Tiinex source payload</summary>',
      '',
      '<!-- tiinex-artifact-start: presentation above is for GitHub readers; Tiinex importers recover the artifact from the Source Markdown below. -->',
      '',
      '## Tiinex Boundary',
      '',
      '- Source Path: .topics/education/next-dimension.trace.md',
      '',
      '# Continuity Context',
      '',
      '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
      '- Current',
      '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
      '  - Created At: 2026-07-24',
      '  - Summary: Welcome to the Next Dimension.',
      '',
      '---',
      '',
      '# Welcome to the Next Dimension',
      '',
      '---',
      '',
      '# Continuity Integrity',
      '',
      '- sha256-base64url-c14n-v2',
      '  - Towards: self',
      '  - Value: fixture',
      '</details>'
    ].join('\n')
  }
});
assert.equal(detailsEmbeddedMaterialized.records.length, 1, 'details-wrapped Tiinex source payload should materialize as an embedded artifact');
assert.equal(detailsEmbeddedMaterialized.records[0].title, 'Welcome to the Next Dimension', 'details-wrapped payload should preserve the artifact title');
assert.equal(detailsEmbeddedMaterialized.records[0].path, '.topics/education/next-dimension.trace.md', 'details-wrapped payload should preserve the embedded source path');

const genericDetailsMaterialized = materializeGithubIssueSnapshotFixtures('https://github.com/Tiinex/docs/issues/8', {
  'https://github.com/Tiinex/docs/issues/8': {
    title: 'Plain details should stay evidence',
    state: 'open',
    user: { login: 'q' },
    created_at: '2026-07-24T00:00:00.000Z',
    body: ['<details>', '<summary>Implementation notes</summary>', '# Continuity Context', '', '- Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)', '', '---', '', '# Not a declared source payload', '</details>'].join('\n')
  }
});
assert.equal(genericDetailsMaterialized.records.length, 1, 'generic details block should not be imported as a Tiinex artifact');
assert.equal(genericDetailsMaterialized.records[0].kind, 'tiinex.evidence.v1', 'generic details block should remain an evidence snapshot');


const issueApiOne = 'https://api.github.com/repos/Tiinex/docs/issues/1';
const issueCommentApiOne = 'https://api.github.com/repos/Tiinex/docs/issues/1/comments?per_page=6';
const issueApiTwo = 'https://api.github.com/repos/Tiinex/docs/issues/2';
const resilientCalls = [];
const resilientMaterialized = await materializeGithubIssueSnapshots([
  parseGithubIssueSnapshotTarget('https://github.com/Tiinex/docs/issues/1'),
  parseGithubIssueSnapshotTarget('https://github.com/Tiinex/docs/issues/2')
], {
  fetchImpl: async (url) => {
    resilientCalls.push(url);
    if (url === issueApiOne) return responseJson({ html_url: 'https://github.com/Tiinex/docs/issues/1', number: 1, title: 'Issue with comment outage', state: 'open', body: 'Issue one body', user: { login: 'q' }, comments: 1 });
    if (url === issueCommentApiOne) return responseJson({ message: 'rate limited' }, { ok: false, status: 403, statusText: 'Forbidden' });
    if (url === issueApiTwo) return responseJson({ html_url: 'https://github.com/Tiinex/docs/issues/2', number: 2, title: 'Issue two', state: 'open', body: 'Issue two body', user: { login: 'q' }, comments: 0 });
    return responseJson({ message: 'not found' }, { ok: false, status: 404, statusText: 'Not Found' });
  }
});
assert.equal(resilientMaterialized.records.length, 2, 'issue materialization should keep loading issue bodies when comments are unavailable');
assert.equal(resilientMaterialized.counts.loadedTargets, 2, 'target diagnostics should count loaded issue targets independently from record count');
assert.equal(resilientMaterialized.counts.failedTargets, 0, 'comment outage should not mark the issue target failed');
assert(resilientMaterialized.warnings.some((warning) => warning.code === 'github.issue.comments.fetch-failed'), 'comment outage should be diagnosable instead of silent');
assert.deepEqual(resilientMaterialized.targetResults.map((target) => target.status), ['loaded', 'loaded'], 'per-target issue materialization diagnostics should preserve target status');

function responseJson(json, options = {}) {
  const body = JSON.stringify(json || {});
  return {
    ok: options.ok !== false,
    status: options.status || (options.ok === false ? 500 : 200),
    statusText: options.statusText || (options.ok === false ? 'Error' : 'OK'),
    transportTier: options.transportTier || '',
    json: async () => JSON.parse(body),
    text: async () => body,
    clone: () => responseJson(json, options)
  };
}

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


const commentEmbeddedOne = embeddedChild.replace('# Embedded Feedback', '# Comment One').replace('Embedded feedback recovered from issue body.', 'Comment one recovered from issue comment.');
const commentEmbeddedTwo = embeddedChild.replace('# Embedded Feedback', '# Comment Two').replace('Embedded feedback recovered from issue body.', 'Comment two recovered from issue comment.');
const multiCommentRecords = createGithubIssueSnapshotRecords({
  target: parseGithubIssueSnapshotTarget('https://github.com/Tiinex/docs/issues/123'),
  title: 'Comment payload issue',
  state: 'open',
  user: { login: 'q' },
  body: 'Plain issue body',
  comments: [{
    id: 5001,
    html_url: 'https://github.com/Tiinex/docs/issues/123#issuecomment-5001',
    body: ['## Source Markdown', '', '```md', commentEmbeddedOne, '```'].join('\n')
  }, {
    id: 5002,
    html_url: 'https://github.com/Tiinex/docs/issues/123#issuecomment-5002',
    body: ['## Source Markdown', '', '```md', commentEmbeddedTwo, '```'].join('\n')
  }]
});
assert.equal(multiCommentRecords.length, 3, 'plain issue shell plus two embedded comment artifacts should materialize as separate records');
const commentRecovered = multiCommentRecords.filter((record) => record.sourceMode === 'github-comment-embedded-artifact');
assert.equal(commentRecovered.length, 2, 'both embedded comment payloads should become recovered artifact records');
assert.notEqual(commentRecovered[0].path, commentRecovered[1].path, 'comment recovered artifacts must not share one material path');
assert(commentRecovered.every((record) => record.sourceTarget.sourceArtifactPath && record.sourceTarget.sourceArtifactPath === record.path), 'embedded source target must expose the material path used for lifecycle identity');
assert(commentRecovered.every((record) => /#issuecomment-500[12]$/.test(record.sourceTarget.inputTarget)), 'comment embedded records must keep comment URL anchors as provenance');
assert(commentRecovered.some((record) => /recovered-comment-one\.trace\.md$/.test(record.path)), 'comment recovered material path should use the embedded artifact title, not the envelope heading');
assert(commentRecovered.some((record) => /recovered-comment-two\.trace\.md$/.test(record.path)), 'each comment recovered material path should remain title-addressable for issue-local lineage aliases');


const syntheticIssuePaths = createGithubIssueSnapshotRecords({
  target: parseGithubIssueSnapshotTarget('https://github.com/Tiinex/docs/issues/9'),
  title: 'Welcome to the Next Dimension',
  state: 'open',
  user: { login: 'q' },
  body: 'Plain issue body',
  comments: [{
    id: 4881782365,
    html_url: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
    body: ['## Source Markdown', '', '```md', commentEmbeddedOne.replace('# Comment One', '# Silicon Valley'), '```'].join('\n')
  }]
});
assert(syntheticIssuePaths.every((record) => String(record.path || '').startsWith('.topics/.issues/github/tiinex-docs/9/')), 'issue/comment material without an explicit Source Path should live under the logical .topics/.issues scope');
assert(syntheticIssuePaths.some((record) => /comment-001-4881782365-recovered-silicon-valley\.trace\.md$/.test(record.path)), 'comment recovered artifacts should preserve comment id and title under the logical issue scope');

console.log('github.issueSnapshot: ok');
