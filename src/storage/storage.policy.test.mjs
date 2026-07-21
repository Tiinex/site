import assert from 'node:assert/strict';
import { classifyAssetPersistence, classifyRecordPersistence, classifyWorkspaceCandidatePersistence, summarizeStoragePolicy } from './storage.policy.js';

const localRecord = { id: 'local', markdown: '# Local', sourceMode: 'local-draft', source: { adapterId: 'local', kind: 'local-session' } };
const githubRecord = { id: 'source', markdown: '# Remote copy', sourceMode: 'source-backed', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'abcdef' } };
const largeRecord = { id: 'large', markdown: 'x'.repeat(20), sourceMode: 'local-draft', source: { adapterId: 'local' } };

assert.equal(classifyRecordPersistence(localRecord).persistence, 'full', 'local draft markdown may be session-cached');
assert.equal(classifyRecordPersistence(githubRecord).persistence, 'metadata-only', 'source-backed record markdown is not cache authority');
assert.equal(classifyRecordPersistence(githubRecord).persistContent, false, 'source-backed markdown content is omitted');
assert.equal(classifyRecordPersistence(largeRecord, { maxRecordMarkdownChars: 5 }).persistence, 'truncated', 'large local markdown is truncated');

const localAsset = { id: 'asset', content: '<svg/>', source: { adapterId: 'local', kind: 'local-session' } };
const githubAsset = { id: 'remote-asset', content: '<svg/>', source: { adapterId: 'github' } };
assert.equal(classifyAssetPersistence(localAsset).persistence, 'full', 'local asset preview may be cached');
assert.equal(classifyAssetPersistence(githubAsset).persistence, 'metadata-only', 'source-backed asset preview is metadata-only');
assert.equal(classifyWorkspaceCandidatePersistence({ markdown: '# Workspace' }).persistence, 'full', 'workspace candidate markdown can be cached');

const summary = summarizeStoragePolicy({ id: 'ws', records: [localRecord, githubRecord], assets: [localAsset, githubAsset], workspaceMergeCandidates: [{ markdown: '# Workspace' }] });
assert.equal(summary.schema, 'tiinex.storage.policy.v1');
assert.equal(summary.counts.full, 3, 'local record, local asset, and workspace candidate are full');
assert.equal(summary.counts.metadataOnly, 2, 'source-backed record and asset are metadata-only');
assert(summary.counts.originalBytes > summary.counts.persistedBytes, 'metadata-only source-backed material reduces persisted bytes');

console.log('storage.policy: ok');
