import assert from 'node:assert/strict';
import { sortWorkspaceFeedRecords, workspaceRecordSortTimestamp } from './workspace.feedSort.js';

const records = sortWorkspaceFeedRecords([
  { id: 'old-topic', title: 'Old topic', path: '.topics/old/001.trace.md', currentCreatedAt: '2026-06-02', schemaId: 'tiinex.topic.v1' },
  { id: 'new-decision', title: 'New decision', path: '.topics/new/001.trace.md', currentCreatedAt: '2026-07-22', schemaId: 'tiinex.decision.v1' },
  { id: 'same-date-b', title: 'B', path: '.topics/zeta/001.trace.md', currentCreatedAt: '2026-07-01', schemaId: 'tiinex.topic.v1' },
  { id: 'same-date-a', title: 'A', path: '.topics/alpha/001.trace.md', currentCreatedAt: '2026-07-01', schemaId: 'tiinex.evidence.v1' }
]);
assert.deepEqual(records.map((item) => item.id), ['new-decision', 'same-date-a', 'same-date-b', 'old-topic'], 'feed should sort by created timestamp descending, then path');

const midnightWithCommit = workspaceRecordSortTimestamp({ currentCreatedAt: '2026-07-22 00:00:00', gitCommittedAt: '2026-07-22T19:30:00Z' });
const midnightWithoutCommit = workspaceRecordSortTimestamp({ currentCreatedAt: '2026-07-22 00:00:00' });
assert.ok(midnightWithCommit > midnightWithoutCommit, 'commit time should disambiguate same-day midnight artifact dates when it matches the created date');


const issueRecords = sortWorkspaceFeedRecords([
  { id: 'artifact-newer-but-source-older', path: '.topics/.github/owner/repo/.issues/1/comment.trace.md', currentCreatedAt: '2026-07-30', sourceTarget: { surface: 'issueSnapshots', sourceSortAt: '2026-07-10T10:00:00Z' } },
  { id: 'artifact-older-but-source-newer', path: '.topics/.github/owner/repo/.issues/2/comment.trace.md', currentCreatedAt: '2026-07-01', sourceTarget: { surface: 'issueSnapshots', sourceSortAt: '2026-07-22T10:00:00Z' } }
]);
assert.deepEqual(issueRecords.map((item) => item.id), ['artifact-older-but-source-newer', 'artifact-newer-but-source-older'], 'issue snapshot feed order should use stable source updated timestamp when available');


const sameDayIssueRecords = sortWorkspaceFeedRecords([
  { id: 'issue-root-3', path: '.topics/.github/tiinusen/socials/.issues/3/issue-root-recovered-fs25-markaryd.workspace.md', currentCreatedAt: '2026-07-18', sourceTarget: { surface: 'issueSnapshots', inputTarget: 'https://github.com/Tiinusen/socials/issues/3' } },
  { id: 'comment-early', path: '.topics/.github/tiinusen/socials/.issues/3/comment-001-5008615398-recovered-lagar-och-regler.trace.md', currentCreatedAt: '2026-07-18', sourceTarget: { surface: 'issueSnapshots', inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5008615398' } },
  { id: 'comment-latest', path: '.topics/.github/tiinusen/socials/.issues/3/comment-004-5011198457-recovered-fler-bondgardar.trace.md', currentCreatedAt: '2026-07-18', sourceTarget: { surface: 'issueSnapshots', inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457' } },
  { id: 'comment-middle', path: '.topics/.github/tiinusen/socials/.issues/3/comment-002-5011116876-recovered-klagomuren.trace.md', currentCreatedAt: '2026-07-18', sourceTarget: { surface: 'issueSnapshots', inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876' } }
]);
assert.deepEqual(sameDayIssueRecords.map((item) => item.id), ['comment-latest', 'comment-middle', 'comment-early', 'issue-root-3'], 'same-day issue snapshot feed order should use stable GitHub publication identity before path fallback');

const restoredIssueRecords = sortWorkspaceFeedRecords([
  { id: 'restored-old-comment', path: '.topics/.github/tiinusen/socials/.issues/3/comment-001-5008615398-recovered-lagar-och-regler.trace.md', currentCreatedAt: '2026-07-18' },
  { id: 'restored-new-comment', path: '.topics/.github/tiinusen/socials/.issues/3/comment-004-5011198457-recovered-fler-bondgardar.trace.md', currentCreatedAt: '2026-07-18' }
]);
assert.deepEqual(restoredIssueRecords.map((item) => item.id), ['restored-new-comment', 'restored-old-comment'], 'restored/proxy issue records should still sort by stable GitHub publication id even if sourceTarget.surface was not preserved');

const embeddedIssueArtifacts = sortWorkspaceFeedRecords([
  { id: 'issue-root', path: '.topics/.github/tiinusen/socials/.issues/3/issue-root-recovered-fs25-markaryd.workspace.md', currentCreatedAt: '2026-07-17 23:57:29', sourceMode: 'github-issue-embedded-artifact', sourceTarget: { surface: 'issueSnapshots', targetKind: 'github-issue-embedded-artifact', inputTarget: 'https://github.com/Tiinusen/socials/issues/3', sourceSortAt: '2026-07-18T22:03:24Z' }, snapshot: { embedded: true, sourceKind: 'issue', sourceUrl: 'https://github.com/Tiinusen/socials/issues/3', sourceSortAt: '2026-07-18T22:03:24Z' } },
  { id: 'comment-18', path: '.topics/.github/tiinusen/socials/.issues/3/comment-002-5011116876-recovered-klagomuren.trace.md', currentCreatedAt: '2026-07-18 11:41:06', sourceMode: 'github-comment-embedded-artifact', sourceTarget: { surface: 'issueSnapshots', targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876', sourceSortAt: '2026-07-18T11:41:06Z' }, snapshot: { embedded: true, sourceKind: 'comment', sourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876', sourceSortAt: '2026-07-18T11:41:06Z' } }
]);
assert.deepEqual(embeddedIssueArtifacts.map((item) => item.id), ['comment-18', 'issue-root'], 'embedded issue artifacts should sort by artifact created date; issue thread updated_at must not lift an older workspace root above newer comments');

console.log('✓ workspace.feedSort tests passed');
