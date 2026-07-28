import { createHash } from 'node:crypto';
import { portableFinding } from '../findings.js';

export const PORTABLE_LIVE_OPERATION_RECEIPT_SCHEMA_ID = 'tiinex.portable.live-operation-receipt.v1';
export const PORTABLE_LIVE_OPERATION_CHAIN_SCHEMA_ID = 'tiinex.portable.live-operation-chain.v1';

export function emptyLiveProtocol(input = {}) {
  return Object.freeze({
    schema: PORTABLE_LIVE_OPERATION_CHAIN_SCHEMA_ID,
    version: 2,
    sessionId: clean(input.sessionId || 'live-session'),
    stateRevision: 0,
    latestEventSequence: 0,
    preparedEventSequence: 0,
    latestTurnSequence: 0,
    preparedTurnSequence: 0,
    exportCount: 0,
    receiptChainHead: '',
    startedAt: runtimeTimestamp(input)
  });
}

export function normalizeLiveProtocol(value = {}, receipts = [], findings = []) {
  const protocol = Object.freeze({
    schema: PORTABLE_LIVE_OPERATION_CHAIN_SCHEMA_ID,
    version: 2,
    sessionId: clean(value.sessionId || 'live-session'),
    stateRevision: nonNegative(value.stateRevision),
    latestEventSequence: nonNegative(value.latestEventSequence),
    preparedEventSequence: nonNegative(value.preparedEventSequence),
    latestTurnSequence: nonNegative(value.latestTurnSequence),
    preparedTurnSequence: nonNegative(value.preparedTurnSequence),
    exportCount: nonNegative(value.exportCount),
    receiptChainHead: clean(value.receiptChainHead),
    startedAt: timestamp(value.startedAt)
  });
  verifyLiveOperationReceipts(receipts, protocol, findings);
  if (protocol.preparedEventSequence > protocol.latestEventSequence) findings.push(portableFinding('error', 'live-protocol.prepared-ahead', 'Prepared response event sequence cannot exceed the latest artifact event sequence.', { preparedEventSequence: protocol.preparedEventSequence, latestEventSequence: protocol.latestEventSequence }));
  if (protocol.preparedTurnSequence > protocol.latestTurnSequence) findings.push(portableFinding('error', 'live-protocol.turn-prepared-ahead', 'Prepared response turn sequence cannot exceed the latest dialogue turn sequence.', { preparedTurnSequence: protocol.preparedTurnSequence, latestTurnSequence: protocol.latestTurnSequence }));
  return protocol;
}

export function appendLiveOperationReceipt(input = {}) {
  const receipts = normalizeReceipts(input.receipts);
  const protocol = input.protocol || emptyLiveProtocol(input);
  const operation = clean(input.operation);
  if (!operation) throw new Error('live-protocol.operation.required');
  const sequence = receipts.length + 1;
  const stateRevision = nonNegative(input.stateRevision ?? protocol.stateRevision + 1);
  const receiptBase = {
    schema: PORTABLE_LIVE_OPERATION_RECEIPT_SCHEMA_ID,
    version: 2,
    sequence,
    operation,
    sessionId: clean(input.sessionId || protocol.sessionId || 'live-session'),
    stateRevision,
    eventSequence: nonNegative(input.eventSequence ?? protocol.latestEventSequence),
    coversThroughEventSequence: nonNegative(input.coversThroughEventSequence ?? 0),
    turnSequence: nonNegative(input.turnSequence ?? protocol.latestTurnSequence),
    coversThroughTurnSequence: nonNegative(input.coversThroughTurnSequence ?? 0),
    turnId: clean(input.turnId),
    turnMessageSha256: clean(input.turnMessageSha256),
    decision: clean(input.decision),
    artifactIds: Object.freeze(strings(input.artifactIds)),
    evidenceRefs: Object.freeze(strings(input.evidenceRefs)),
    status: clean(input.status || 'completed'),
    previousReceiptSha256: clean(protocol.receiptChainHead),
    observedAt: runtimeTimestamp(input),
    details: Object.freeze(sortObject(input.details || {}))
  };
  const receiptSha256 = digest(receiptBase);
  const receipt = Object.freeze({ ...receiptBase, receiptSha256 });
  const nextProtocol = Object.freeze({
    ...protocol,
    version: 2,
    stateRevision,
    latestEventSequence: nonNegative(input.latestEventSequence ?? protocol.latestEventSequence),
    preparedEventSequence: nonNegative(input.preparedEventSequence ?? protocol.preparedEventSequence),
    latestTurnSequence: nonNegative(input.latestTurnSequence ?? protocol.latestTurnSequence),
    preparedTurnSequence: nonNegative(input.preparedTurnSequence ?? protocol.preparedTurnSequence),
    exportCount: nonNegative(input.exportCount ?? protocol.exportCount),
    receiptChainHead: receiptSha256
  });
  return Object.freeze({ receipt, receipts: Object.freeze([...receipts, receipt]), protocol: nextProtocol });
}

export function verifyLiveOperationReceipts(value = [], protocol = {}, findings = []) {
  const receipts = normalizeReceipts(value);
  let previous = '';
  let expectedTurnSequence = 1;
  let latestTurnSequence = 0;
  let preparedTurnSequence = 0;
  for (let index = 0; index < receipts.length; index += 1) {
    const receipt = receipts[index];
    const expectedSequence = index + 1;
    if (receipt.schema !== PORTABLE_LIVE_OPERATION_RECEIPT_SCHEMA_ID) findings.push(portableFinding('error', 'live-protocol.receipt.schema', 'Live operation receipt schema is invalid.', { sequence: receipt.sequence || expectedSequence }));
    if (receipt.sequence !== expectedSequence) findings.push(portableFinding('error', 'live-protocol.receipt.sequence', 'Live operation receipt sequence is not contiguous.', { expected: expectedSequence, actual: receipt.sequence }));
    if (clean(receipt.sessionId) !== clean(protocol.sessionId || receipt.sessionId)) findings.push(portableFinding('error', 'live-protocol.receipt.session-drift', 'Live operation receipt session id differs from the protocol session id.', { sequence: expectedSequence, expected: clean(protocol.sessionId), actual: clean(receipt.sessionId) }));
    if (clean(receipt.previousReceiptSha256) !== previous) findings.push(portableFinding('error', 'live-protocol.receipt.previous-drift', 'Live operation receipt chain does not point to the previous receipt.', { sequence: expectedSequence }));
    const { receiptSha256, ...base } = receipt;
    const actual = digest(base);
    if (receiptSha256 !== actual) findings.push(portableFinding('error', 'live-protocol.receipt.digest', 'Live operation receipt digest is invalid.', { sequence: expectedSequence, expected: receiptSha256, actual }));
    if (receipt.operation === 'update-live-lineage') {
      if (receipt.turnSequence !== expectedTurnSequence) findings.push(portableFinding('error', 'live-protocol.turn-sequence.drift', 'Dialogue turn receipts must be contiguous.', { expected: expectedTurnSequence, actual: receipt.turnSequence }));
      expectedTurnSequence += 1;
      latestTurnSequence = Math.max(latestTurnSequence, receipt.turnSequence);
      if (!receipt.turnId) findings.push(portableFinding('error', 'live-protocol.turn-id.missing', 'Dialogue turn receipt requires a turn id.', { sequence: expectedSequence }));
      if (!/^[a-f0-9]{64}$/.test(receipt.turnMessageSha256)) findings.push(portableFinding('error', 'live-protocol.turn-message-digest.invalid', 'Dialogue turn receipt requires a lowercase SHA-256 message digest.', { sequence: expectedSequence, turnId: receipt.turnId }));
    }
    if (receipt.operation === 'prepare-live-response') preparedTurnSequence = Math.max(preparedTurnSequence, receipt.coversThroughTurnSequence);
    previous = receipt.receiptSha256;
  }
  if (receipts.length && clean(protocol.receiptChainHead) !== previous) findings.push(portableFinding('error', 'live-protocol.chain-head.drift', 'Live operation chain head does not match the final receipt.', { expected: previous, actual: clean(protocol.receiptChainHead) }));
  if (!receipts.length && clean(protocol.receiptChainHead)) findings.push(portableFinding('error', 'live-protocol.chain-head.orphaned', 'Live operation chain head exists without receipts.'));
  if (receipts.length && nonNegative(protocol.latestTurnSequence) !== latestTurnSequence) findings.push(portableFinding('error', 'live-protocol.latest-turn.drift', 'Protocol latest turn sequence does not match update receipts.', { expected: latestTurnSequence, actual: nonNegative(protocol.latestTurnSequence) }));
  if (receipts.length && nonNegative(protocol.preparedTurnSequence) !== preparedTurnSequence) findings.push(portableFinding('error', 'live-protocol.prepared-turn.drift', 'Protocol prepared turn sequence does not match response-preflight receipts.', { expected: preparedTurnSequence, actual: nonNegative(protocol.preparedTurnSequence) }));
  return Object.freeze(receipts);
}

export function summarizeLiveOperationChain(input = {}) {
  const receipts = normalizeReceipts(input.receipts);
  const protocol = input.protocol || emptyLiveProtocol(input);
  const counts = {};
  for (const receipt of receipts) counts[receipt.operation] = (counts[receipt.operation] || 0) + 1;
  return Object.freeze({
    schema: PORTABLE_LIVE_OPERATION_CHAIN_SCHEMA_ID,
    version: 2,
    sessionId: protocol.sessionId,
    stateRevision: protocol.stateRevision,
    latestEventSequence: protocol.latestEventSequence,
    preparedEventSequence: protocol.preparedEventSequence,
    latestTurnSequence: protocol.latestTurnSequence,
    preparedTurnSequence: protocol.preparedTurnSequence,
    exportCount: protocol.exportCount,
    receiptChainHead: protocol.receiptChainHead,
    counts: Object.freeze(sortObject(counts)),
    receipts: Object.freeze(receipts),
    boundary: Object.freeze({ provesPortableOperationsRecorded: true, provesEveryProviderTurnObserved: false, doesNotProveUserVisibleQuality: true, hiddenReasoningIncluded: false })
  });
}

function normalizeReceipts(value) {
  return (Array.isArray(value) ? value : []).map((receipt) => Object.freeze({
    ...receipt,
    schema: clean(receipt?.schema),
    version: nonNegative(receipt?.version || 1),
    sequence: nonNegative(receipt?.sequence),
    operation: clean(receipt?.operation),
    sessionId: clean(receipt?.sessionId),
    stateRevision: nonNegative(receipt?.stateRevision),
    eventSequence: nonNegative(receipt?.eventSequence),
    coversThroughEventSequence: nonNegative(receipt?.coversThroughEventSequence),
    turnSequence: nonNegative(receipt?.turnSequence),
    coversThroughTurnSequence: nonNegative(receipt?.coversThroughTurnSequence),
    turnId: clean(receipt?.turnId),
    turnMessageSha256: clean(receipt?.turnMessageSha256),
    decision: clean(receipt?.decision),
    artifactIds: Object.freeze(strings(receipt?.artifactIds)),
    evidenceRefs: Object.freeze(strings(receipt?.evidenceRefs)),
    status: clean(receipt?.status),
    previousReceiptSha256: clean(receipt?.previousReceiptSha256),
    observedAt: timestamp(receipt?.observedAt),
    details: Object.freeze(sortObject(receipt?.details || {})),
    receiptSha256: clean(receipt?.receiptSha256)
  }));
}

function digest(value) { return createHash('sha256').update(stableJson(value)).digest('hex'); }
function stableJson(value) { return JSON.stringify(sortObject(value)); }
function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const key of Object.keys(value).sort()) output[key] = sortObject(value[key]);
  return output;
}
function strings(value) { return [...new Set((Array.isArray(value) ? value : value == null ? [] : [value]).map(clean).filter(Boolean))].sort(); }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function nonNegative(value) { return Math.max(0, Number(value || 0)); }
function timestamp(value) { return String(value || '').trim() || new Date().toISOString(); }
function runtimeTimestamp(input = {}) { const value = typeof input.clock === 'function' ? input.clock() : new Date().toISOString(); const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(); }
