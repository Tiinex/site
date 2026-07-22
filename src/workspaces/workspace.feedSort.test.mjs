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

console.log('✓ workspace.feedSort tests passed');
