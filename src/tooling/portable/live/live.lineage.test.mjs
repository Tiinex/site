import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendLiveOperationReceipt } from './live.protocol.js';
import { processPortableLiveTurn } from './live.lineage.js';

const runtimeTime = '2026-07-28T20:00:00.000Z';
const userMessage = 'Exakt aktuell användartur.';
const correctDigest = createHash('sha256').update(userMessage).digest('hex');
const wrongDigest = createHash('sha256').update('annan tur').digest('hex');

const mismatch = processPortableLiveTurn({
  sessionId: 'session-binding',
  turn: {
    id: 'dialogue:turn-0001',
    sequence: 1,
    userMessage,
    messageSha256: wrongDigest,
    summary: 'User supplied one exact current turn.',
    observedAt: '1900-01-01T00:00:00Z'
  },
  updatedAt: '1900-01-01T00:00:00Z',
  preparedAt: '1900-01-01T00:00:00Z',
  changes: []
}, { clock: () => runtimeTime });
assert.equal(mismatch.status, 'blocked');
assert.equal(mismatch.state.evidence.length, 0, 'digest mismatch must block before evidence/state mutation');
assert.ok(mismatch.findings.some((finding) => finding.code === 'live-lineage.turn.message-digest-mismatch'));

const digestOnly = processPortableLiveTurn({
  sessionId: 'session-binding',
  turn: {
    id: 'dialogue:turn-0001',
    sequence: 1,
    messageSha256: correctDigest,
    summary: 'Digest without the exact message is insufficient.'
  },
  changes: []
}, { clock: () => runtimeTime });
assert.equal(digestOnly.status, 'blocked');
assert.ok(digestOnly.findings.some((finding) => finding.code === 'live-lineage.turn.user-message-required'));

const processed = processPortableLiveTurn({
  sessionId: 'session-binding',
  turn: {
    id: 'dialogue:turn-0001',
    sequence: 1,
    userMessage,
    messageSha256: correctDigest,
    summary: 'User supplied one exact current turn.',
    observedAt: '1900-01-01T00:00:00Z'
  },
  updatedAt: '1900-01-01T00:00:00Z',
  preparedAt: '1900-01-01T00:00:00Z',
  changes: []
}, { clock: () => runtimeTime });
assert.equal(processed.status, 'processed-without-artifact-change');
assert.equal(processed.state.evidence[0].messageSha256, correctDigest);
assert.equal(processed.state.evidence[0].observedAt, runtimeTime, 'turn observation time must be runtime-owned');
assert.deepEqual(processed.state.receipts.map((receipt) => receipt.observedAt), [runtimeTime, runtimeTime], 'receipt times must ignore caller timestamps');
assert.equal(processed.state.protocol.startedAt, runtimeTime, 'session start time must be runtime-owned');

const appended = appendLiveOperationReceipt({
  protocol: processed.state.protocol,
  receipts: processed.state.receipts,
  operation: 'diagnostic',
  observedAt: '1900-01-01T00:00:00Z',
  clock: () => runtimeTime
});
assert.equal(appended.receipt.observedAt, runtimeTime, 'append receipt must ignore caller-supplied observedAt');

console.log('✓ live lineage exact turn binding and runtime-owned timestamps passed');
