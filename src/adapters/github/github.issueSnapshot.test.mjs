import assert from 'node:assert/strict';
import { materializeGithubIssueSnapshotFixtures, parseGithubIssueSnapshotTarget, parseGithubIssueSnapshotTargets } from './github.issueSnapshot.js';

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
assert(record.markdown.includes('GitHub Snapshot Boundary'), 'snapshot markdown includes boundary section');
assert(record.markdown.includes('No hidden repo discovery is implied'), 'snapshot markdown is explicit about source boundary');
assert.equal(record.source, undefined, 'adapter materialization must not assign lifecycle source provenance');

console.log('github.issueSnapshot: ok');
