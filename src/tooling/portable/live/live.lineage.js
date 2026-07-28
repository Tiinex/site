import { createHash } from 'node:crypto';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { appendLiveOperationReceipt, emptyLiveProtocol, normalizeLiveProtocol, verifyLiveOperationReceipts } from './live.protocol.js';
import { materializeLiveArtifact } from './live.artifact.js';

export const PORTABLE_LIVE_LINEAGE_SCHEMA_ID = 'tiinex.portable.live-lineage.v1';
export const PORTABLE_LIVE_LINEAGE_UPDATE_SCHEMA_ID = 'tiinex.portable.live-lineage.update.v1';
export const PORTABLE_LIVE_LINEAGE_READ_SCHEMA_ID = 'tiinex.portable.live-lineage.read.v1';
export const PORTABLE_LIVE_RESPONSE_PREPARE_SCHEMA_ID = 'tiinex.portable.live-response.prepare.v1';
export const PORTABLE_LIVE_TURN_PROCESS_SCHEMA_ID = 'tiinex.portable.live-turn.process.v1';

const CHANGE_ACTIONS = new Set(['upsert', 'withdraw']);

export function updatePortableLiveLineage(input = {}, options = {}) {
  const findings = [];
  const runtimeObservedAt = runtimeTimestamp(options);
  const state = normalizePortableLiveLineageState(input.state || input.liveLineage || {}, findings, { sessionId: input.sessionId, clock: options.clock });
  const material = normalizePortableInput(input.materials || input);
  const turnInputPresent = Boolean(input.turn && typeof input.turn === 'object' && Object.keys(input.turn).length);
  const turn = normalizeTurn(input.turn, findings, runtimeObservedAt);
  const changes = normalizeChanges(input.changes || input.artifactChanges || input.change || [], findings);
  if (!turn && !turnInputPresent) findings.push(portableFinding('error', 'live-lineage.turn.required', 'A substantive live-lineage transaction requires an explicit dialogue turn.'));
  if (input.sessionId && clean(input.sessionId) !== state.protocol.sessionId) findings.push(portableFinding('error', 'live-lineage.session-id.drift', 'The dialogue session id must remain stable for the live lineage.', { expected: state.protocol.sessionId, actual: clean(input.sessionId) }));
  if (turn && turn.sequence !== state.protocol.latestTurnSequence + 1) findings.push(portableFinding('error', 'live-lineage.turn.sequence-drift', 'Dialogue turn sequence must continue the persisted live session.', { expected: state.protocol.latestTurnSequence + 1, actual: turn.sequence, turnId: turn.id }));
  if (turn && state.evidence.some((entry) => entry.id === turn.id)) findings.push(portableFinding('error', 'live-lineage.turn.duplicate', 'Dialogue turn id already exists in the live session.', { turnId: turn.id }));
  if (changes.length && state.protocol.latestTurnSequence > state.protocol.preparedTurnSequence) {
    findings.push(portableFinding('error', 'live-lineage.response-preflight.pending', 'Run prepare-live-response before another live artifact update.', {
      latestTurnSequence: state.protocol.latestTurnSequence,
      preparedTurnSequence: state.protocol.preparedTurnSequence
    }));
  }
  if (findings.some((finding) => finding.severity === 'error')) return blockedUpdate(state, findings);

  const artifacts = new Map(state.artifacts.map((entry) => [entry.id, entry]));
  const evidence = new Map(state.evidence.map((entry) => [entry.id, entry]));
  const events = [...state.events];
  if (turn) evidence.set(turn.id, turn);

  for (const change of changes) {
    if (change.action === 'withdraw') {
      const current = artifacts.get(change.id);
      if (!current) {
        findings.push(portableFinding('error', 'live-lineage.withdraw.missing', 'Cannot withdraw a live artifact that does not exist.', { artifactId: change.id }));
        continue;
      }
      artifacts.set(change.id, freezeArtifact({ ...current, status: 'withdrawn', revision: current.revision + 1, updatedAt: runtimeObservedAt, evidenceRefs: mergeStrings(current.evidenceRefs, change.evidenceRefs) }));
      events.push(freezeEvent({ sequence: events.length + 1, kind: 'withdrawn', artifactId: change.id, evidenceRefs: change.evidenceRefs, reason: change.changeReason || 'Explicit live-artifact withdrawal.' }));
      continue;
    }

    const current = artifacts.get(change.id) || null;
    const next = materializeLiveArtifact({ current, change, material, artifacts, findings, input: { ...input, state, runtimeObservedAt }, options });
    if (!next) continue;
    artifacts.set(change.id, next);
    events.push(freezeEvent({
      sequence: events.length + 1,
      kind: current ? 'updated' : 'created',
      artifactId: change.id,
      revision: next.revision,
      evidenceRefs: next.evidenceRefs,
      changedFields: Object.freeze(changedFields(current, next)),
      reason: change.changeReason || change.rationale || (current ? 'Dialogue changed the artifact.' : 'Dialogue warranted the artifact.')
    }));
  }

  if (findings.some((finding) => finding.severity === 'error')) return blockedUpdate(state, findings);
  const normalizedArtifacts = [...artifacts.values()].sort((a, b) => a.id.localeCompare(b.id));
  const normalizedEvidence = [...evidence.values()].sort((a, b) => a.id.localeCompare(b.id));
  let protocol = state.protocol;
  let receipts = state.receipts;
  if (turn || events.length > state.events.length) {
    const appended = appendLiveOperationReceipt({
      protocol,
      receipts,
      operation: 'update-live-lineage',
      eventSequence: events.length,
      latestEventSequence: events.length,
      preparedEventSequence: protocol.preparedEventSequence,
      turnSequence: turn?.sequence || protocol.latestTurnSequence,
      latestTurnSequence: turn?.sequence || protocol.latestTurnSequence,
      preparedTurnSequence: protocol.preparedTurnSequence,
      turnId: turn?.id || '',
      turnMessageSha256: turn?.messageSha256 || '',
      decision: events.length > state.events.length ? 'artifact-change' : 'no-artifact-change',
      artifactIds: changes.map((entry) => entry.id),
      evidenceRefs: turn ? [turn.id] : [],
      clock: options.clock,
      sessionId: input.sessionId,
      details: { eventsAdded: events.length - state.events.length, changeCount: changes.length, boundedTurnSummary: turn?.summary || '' }
    });
    protocol = appended.protocol;
    receipts = appended.receipts;
  }
  const nextState = Object.freeze({
    schema: PORTABLE_LIVE_LINEAGE_SCHEMA_ID,
    version: 3,
    focusArtifactId: resolveFocus(input.focusArtifactId, state.focusArtifactId, normalizedArtifacts),
    evidence: Object.freeze(normalizedEvidence),
    artifacts: Object.freeze(normalizedArtifacts),
    events: Object.freeze(events),
    protocol,
    receipts,
    boundary: liveBoundary()
  });
  const read = readPortableLiveLineage({ state: nextState });
  return Object.freeze({
    schema: PORTABLE_LIVE_LINEAGE_UPDATE_SCHEMA_ID,
    status: events.length > state.events.length ? 'updated' : turn ? 'observed-no-change' : 'unchanged',
    state: nextState,
    read,
    operationReceipt: receipts.at(-1) || null,
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

function blockedUpdate(state, findings) {
  return Object.freeze({
    schema: PORTABLE_LIVE_LINEAGE_UPDATE_SCHEMA_ID,
    status: 'blocked',
    state,
    read: readPortableLiveLineage({ state }),
    operationReceipt: null,
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function readPortableLiveLineage(input = {}) {
  const findings = [];
  const state = normalizePortableLiveLineageState(input.state || input.liveLineage || input, findings);
  const active = state.artifacts.filter((entry) => entry.status !== 'withdrawn');
  const focus = active.find((entry) => entry.id === state.focusArtifactId) || active.at(-1) || null;
  const artifacts = active.map((entry) => Object.freeze({
    id: entry.id,
    schemaId: entry.schemaId,
    path: entry.path,
    title: entry.title,
    summary: entry.summary,
    parentRef: entry.parentRef,
    revision: entry.revision,
    status: entry.status,
    exportReady: entry.exportReady,
    evidenceRefs: entry.evidenceRefs,
    blockingFindings: entry.validation?.findingSummary?.counts?.error || 0
  }));
  return Object.freeze({
    schema: PORTABLE_LIVE_LINEAGE_READ_SCHEMA_ID,
    status: findings.some((entry) => entry.severity === 'error') ? 'blocked' : 'ready',
    focusArtifactId: focus?.id || '',
    artifacts: Object.freeze(artifacts),
    responseContext: Object.freeze({
      current: focus ? `${focus.title}: ${focus.summary}` : 'No live artifact exists.',
      continuity: focus?.parentRef ? `Continues ${focus.parentRef}.` : focus ? 'Current artifact is a local lineage root.' : 'No continuity edge is declared.',
      openBoundary: focus?.exportReady ? 'Artifact is exportable.' : focus ? 'The live artifact remains incomplete or blocked and must not be exported as clean.' : 'Dialogue may continue without an artifact.',
      instruction: 'Use this bounded state while answering. Do not expose internal state, JSON, Markdown, or operational boilerplate unless the user asks.'
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function preparePortableLiveResponse(input = {}, options = {}) {
  const findings = [];
  const state = normalizePortableLiveLineageState(input.state || input.liveLineage || input, findings);
  const read = readPortableLiveLineage({ state });
  if (findings.some((finding) => finding.severity === 'error')) return Object.freeze({
    schema: PORTABLE_LIVE_RESPONSE_PREPARE_SCHEMA_ID,
    status: 'blocked',
    state,
    read,
    responseContext: read.responseContext,
    responseToken: '',
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
  const hadPendingUpdate = state.protocol.latestEventSequence > state.protocol.preparedEventSequence;
  const hadPendingTurn = state.protocol.latestTurnSequence > state.protocol.preparedTurnSequence;
  if (!hadPendingTurn) return Object.freeze({
    schema: PORTABLE_LIVE_RESPONSE_PREPARE_SCHEMA_ID,
    status: 'already-prepared',
    state,
    read,
    responseContext: read.responseContext,
    responseToken: state.protocol.receiptChainHead,
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
  const appended = appendLiveOperationReceipt({
    protocol: state.protocol,
    receipts: state.receipts,
    operation: 'prepare-live-response',
    eventSequence: state.protocol.latestEventSequence,
    coversThroughEventSequence: state.protocol.latestEventSequence,
    latestEventSequence: state.protocol.latestEventSequence,
    preparedEventSequence: state.protocol.latestEventSequence,
    turnSequence: state.protocol.latestTurnSequence,
    coversThroughTurnSequence: state.protocol.latestTurnSequence,
    latestTurnSequence: state.protocol.latestTurnSequence,
    preparedTurnSequence: state.protocol.latestTurnSequence,
    artifactIds: state.artifacts.filter((entry) => entry.status !== 'withdrawn').map((entry) => entry.id),
    clock: options.clock,
    decision: state.artifacts.some((entry) => entry.status !== 'withdrawn') ? 'response-from-artifact-state' : 'response-without-artifact',
    details: { responseContextDigestBasis: 'bounded-live-artifact-read', rawMarkdownExposed: false, hadPendingArtifactUpdate: hadPendingUpdate, hadPendingDialogueTurn: hadPendingTurn }
  });
  const nextState = Object.freeze({ ...state, protocol: appended.protocol, receipts: appended.receipts });
  const nextRead = readPortableLiveLineage({ state: nextState });
  return Object.freeze({
    schema: PORTABLE_LIVE_RESPONSE_PREPARE_SCHEMA_ID,
    status: hadPendingUpdate ? 'prepared-after-change' : 'prepared-no-change',
    state: nextState,
    read: nextRead,
    responseContext: nextRead.responseContext,
    responseToken: appended.receipt.receiptSha256,
    operationReceipt: appended.receipt,
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}


export function processPortableLiveTurn(input = {}, options = {}) {
  const updated = updatePortableLiveLineage(input, options);
  if (updated.status === 'blocked') return Object.freeze({
    schema: PORTABLE_LIVE_TURN_PROCESS_SCHEMA_ID,
    status: 'blocked',
    state: updated.state,
    read: updated.read,
    responseContext: updated.read?.responseContext || {},
    operationReceipts: Object.freeze([]),
    findings: updated.findings,
    findingSummary: updated.findingSummary
  });
  const prepared = preparePortableLiveResponse({ state: updated.state }, options);
  const operationReceipts = [updated.operationReceipt, prepared.operationReceipt].filter(Boolean);
  return Object.freeze({
    schema: PORTABLE_LIVE_TURN_PROCESS_SCHEMA_ID,
    status: prepared.status === 'blocked' ? 'blocked' : updated.status === 'updated' ? 'processed-with-artifact-change' : 'processed-without-artifact-change',
    decision: updated.status === 'updated' ? 'artifact-change' : 'no-artifact-change',
    state: prepared.state,
    read: prepared.read,
    responseContext: prepared.responseContext,
    responseToken: prepared.responseToken,
    operationReceipts: Object.freeze(operationReceipts),
    boundary: Object.freeze({ oneCommandPerSubstantiveTurn: true, rawUserMessagePersisted: false, userMessageDigestPersisted: true, artifactChangeOptional: true, responseContextPreparedAtomically: true }),
    findings: prepared.findings,
    findingSummary: prepared.findingSummary
  });
}


export function normalizePortableLiveLineageState(value, findings = [], defaults = {}) {
  if (!value || !Object.keys(value).length) {
    const protocol = emptyLiveProtocol(defaults);
    return Object.freeze({ schema: PORTABLE_LIVE_LINEAGE_SCHEMA_ID, version: 3, focusArtifactId: '', evidence: Object.freeze([]), artifacts: Object.freeze([]), events: Object.freeze([]), protocol, receipts: Object.freeze([]), boundary: liveBoundary() });
  }
  if (value.schema !== PORTABLE_LIVE_LINEAGE_SCHEMA_ID) findings.push(portableFinding('error', 'live-lineage.schema.invalid', 'Live lineage state schema is unsupported.', { actual: value.schema || '' }));
  const evidence = Object.freeze(normalizeArray(value.evidence).map(normalizeExistingEvidence).filter(Boolean));
  const artifacts = Object.freeze(normalizeArray(value.artifacts).map((entry) => freezeArtifact(entry)).filter((entry) => entry.id));
  const events = Object.freeze(normalizeArray(value.events).map(freezeEvent));
  const receipts = verifyLiveOperationReceipts(value.receipts || [], value.protocol || {}, findings);
  const protocol = normalizeLiveProtocol(value.protocol || {}, receipts, findings);
  const latestEventSequence = events.at(-1)?.sequence || 0;
  if (latestEventSequence !== protocol.latestEventSequence) findings.push(portableFinding('error', 'live-protocol.event-sequence.drift', 'Live protocol event sequence does not match the stored artifact events.', { expected: latestEventSequence, actual: protocol.latestEventSequence }));
  const latestTurnSequence = evidence.reduce((max, entry) => Math.max(max, entry.sequence || 0), 0);
  if (latestTurnSequence !== protocol.latestTurnSequence) findings.push(portableFinding('error', 'live-protocol.turn-sequence.state-drift', 'Live protocol turn sequence does not match stored dialogue evidence.', { expected: latestTurnSequence, actual: protocol.latestTurnSequence }));
  if ((artifacts.length || events.length) && !receipts.length) findings.push(portableFinding('error', 'live-protocol.receipts.required', 'Operation receipts are required; legacy unreceipted state is blocked.'));
  return Object.freeze({
    schema: PORTABLE_LIVE_LINEAGE_SCHEMA_ID,
    version: 3,
    focusArtifactId: clean(value.focusArtifactId),
    evidence,
    artifacts,
    events,
    protocol,
    receipts,
    boundary: liveBoundary()
  });
}

function normalizeTurn(value, findings, observedAt = '') {
  if (!value || !Object.keys(value).length) return null;
  const id = clean(value.id || value.evidenceRef);
  const summary = clean(value.summary);
  const sequence = Math.max(0, Number(value.sequence || 0));
  const rawMessage = String(value.userMessage ?? value.message ?? '');
  const suppliedMessageSha256 = clean(value.messageSha256);
  const messageSha256 = rawMessage ? createHash('sha256').update(rawMessage).digest('hex') : '';
  if (!id) findings.push(portableFinding('error', 'live-lineage.turn.id-missing', 'Dialogue turn requires an explicit evidence id.'));
  if (!summary) findings.push(portableFinding('error', 'live-lineage.turn.summary-missing', 'Dialogue turn requires a bounded observable summary.', { turnId: id }));
  if (!sequence) findings.push(portableFinding('error', 'live-lineage.turn.sequence-missing', 'Dialogue turn requires a positive contiguous sequence.', { turnId: id }));
  if (!rawMessage) findings.push(portableFinding('error', 'live-lineage.turn.user-message-required', 'Dialogue turn requires the exact current userMessage so the runtime can derive its digest.', { turnId: id }));
  if (suppliedMessageSha256 && suppliedMessageSha256 !== messageSha256) findings.push(portableFinding('error', 'live-lineage.turn.message-digest-mismatch', 'Supplied messageSha256 does not match the exact current userMessage.', { turnId: id, supplied: suppliedMessageSha256, computed: messageSha256 }));
  if (messageSha256 && !/^[a-f0-9]{64}$/.test(messageSha256)) findings.push(portableFinding('error', 'live-lineage.turn.message-digest-invalid', 'Runtime-derived dialogue digest is invalid.', { turnId: id }));
  const blocked = findings.some((finding) => finding.severity === 'error');
  return !blocked && id && summary && sequence && messageSha256
    ? Object.freeze({ id, sequence, summary, messageSha256, observedAt: observedAt || runtimeTimestamp() })
    : null;
}

function normalizeExistingEvidence(value) {
  const id = clean(value?.id);
  const summary = clean(value?.summary);
  const sequence = Math.max(0, Number(value?.sequence || 0));
  const messageSha256 = clean(value?.messageSha256);
  return id && summary && sequence && /^[a-f0-9]{64}$/.test(messageSha256) ? Object.freeze({ id, sequence, summary, messageSha256, observedAt: timestamp(value.observedAt) }) : null;
}
function normalizeChanges(value, findings) {
  return Object.freeze(normalizeArray(value).map((entry) => {
    const id = clean(entry?.id);
    const action = clean(entry?.action || 'upsert').toLowerCase();
    if (!id) findings.push(portableFinding('error', 'live-lineage.change.id-missing', 'Live artifact change requires an explicit id.'));
    if (!CHANGE_ACTIONS.has(action)) findings.push(portableFinding('error', 'live-lineage.change.action-invalid', 'Live artifact change action must be upsert or withdraw.', { artifactId: id, action }));
    return Object.freeze({ ...entry, id, action, evidenceRefs: Object.freeze(normalizeStrings(entry?.evidenceRefs)) });
  }).filter((entry) => entry.id && CHANGE_ACTIONS.has(entry.action)));
}

function freezeArtifact(value = {}) {
  return Object.freeze({
    ...value,
    id: clean(value.id), schemaId: clean(value.schemaId), path: normalizeArtifactPath(value.path || ''), parentRef: clean(value.parentRef), title: clean(value.title), summary: clean(value.summary), why: clean(value.why),
    values: Object.freeze(clone(value.values || {})), sections: Object.freeze(clone(value.sections || {})), evidenceRefs: Object.freeze(normalizeStrings(value.evidenceRefs)),
    revision: Math.max(1, Number(value.revision || 1)), status: clean(value.status || 'live-incomplete'), exportReady: value.exportReady === true,
    draft: value.draft ? Object.freeze({ ...value.draft }) : null, validation: value.validation ? Object.freeze({ ...value.validation }) : null, qualification: value.qualification ? Object.freeze({ ...value.qualification }) : null
  });
}
function freezeEvent(value = {}) { return Object.freeze({ ...value, sequence: Math.max(1, Number(value.sequence || 1)), evidenceRefs: Object.freeze(normalizeStrings(value.evidenceRefs)), changedFields: Object.freeze(normalizeStrings(value.changedFields)) }); }
function liveBoundary() { return Object.freeze({ role: 'tool-owned live local artifact state', artifactStateIsPrimaryWorkingObject: true, dialogueIsInterface: true, turnTransactionRequiredBeforeSubstantiveResponse: true, responsePreflightRequiredBetweenUpdates: true, operationReceiptChainRequired: true, hiddenReasoning: false, sourceMutation: false, remoteWrite: false, genericFileFallback: false, exportRequiresSharedValidation: true }); }
function resolveFocus(requested, current, artifacts) { const wanted = clean(requested || current); if (artifacts.some((entry) => entry.id === wanted && entry.status !== 'withdrawn')) return wanted; return artifacts.filter((entry) => entry.status !== 'withdrawn').at(-1)?.id || ''; }
function normalizeArtifactPath(value) { const cleanPath = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\.(?:\/|$)/g, '').trim(); if (!cleanPath) return ''; const withSuffix = cleanPath.toLowerCase().endsWith('.trace.md') ? cleanPath : cleanPath.replace(/\.md$/i, '') + '.trace.md'; return withSuffix.startsWith('.bootstrap/') || withSuffix === '.bootstrap' ? '' : withSuffix; }
function changedFields(before, after) { if (!before) return ['artifact']; const fields = ['title', 'summary', 'why', 'values', 'sections', 'evidenceRefs', 'status']; return fields.filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field])); }
function normalizeStrings(value) { return [...new Set(normalizeArray(value).map(clean).filter(Boolean))].sort(); }
function normalizeArray(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function timestamp(value) { const text = String(value || '').trim(); if (text) return text; return new Date().toISOString(); }
function runtimeTimestamp(options = {}) { const value = typeof options.clock === 'function' ? options.clock() : new Date().toISOString(); const date = value instanceof Date ? value : new Date(value); return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(); }
function clone(value) { return value == null ? {} : JSON.parse(JSON.stringify(value)); }
