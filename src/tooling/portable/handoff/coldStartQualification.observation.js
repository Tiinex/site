import { portableFinding, summarizePortableFindings } from '../findings.js';
import {
  COLD_START_INGRESS_KINDS,
  PORTABLE_COLD_START_QUALIFICATION_SCHEMA_ID,
  describePortableColdStartIngress,
  normalizeIngressKind
} from './coldStartQualification.contract.js';
import {
  READY_OPERATION_STATES,
  deepFreeze,
  finiteOrNull,
  normalizeSemanticClass,
  normalizeToken,
  parseTime
} from './coldStartQualification.shared.js';

export function qualifyPortableColdStartTrace(input = {}, options = {}) {
  const ingressKind = normalizeIngressKind(input.ingressKind || input.kind || COLD_START_INGRESS_KINDS.HANDOFF);
  const contract = describePortableColdStartIngress({ ingressKind });
  const profile = contract.profile;
  const events = normalizeObservationEvents(input.events || input.observations || input.trace || []);
  const findings = [];
  const tiinexEvents = events.filter((event) => event.mechanism === 'tiinex');
  const firstTiinex = tiinexEvents[0] || null;
  const firstTiinexIndex = firstTiinex?.index ?? Infinity;
  const orientationEvent = findReadyOperationEvent(events, profile.orientationOperation);
  const orientationIndex = orientationEvent?.index ?? Infinity;
  const firstSubstantive = events.find((event) => event.semanticClass === 'substantive-work' || event.substantive) || null;
  const groundingEvent = findReadyOperationEvent(events, 'ground-cold-consumer');
  const availabilityObserved = input.toolingAvailable === true || Boolean(firstTiinex) || input.tooling?.available === true || input.bootstrap?.qualified === true;
  const explicitlyUnavailable = input.toolingAvailable === false || input.tooling?.available === false;
  const hostEvidenceState = normalizeToken(input.hostEvidence?.state || input.hostEvidenceState || '');
  const hostEvidenceSource = String(input.hostEvidence?.source || input.hostEvidenceSource || '').trim();
  const hostEvidenceRequired = input.requireHostEvidence === true;
  const hostEvidenceQualified = !hostEvidenceRequired || ['provided', 'observed', 'external-observer', 'host-instrumented', 'self-reported'].includes(hostEvidenceState);

  const preTakeoverNative = events.filter((event) => event.index < firstTiinexIndex && event.mechanism === 'native-host');
  const minimalBootstrap = preTakeoverNative.filter((event) => event.semanticClass === 'minimal-bootstrap');
  const unexpectedNative = ingressKind === COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE
    ? []
    : preTakeoverNative.filter((event) => event.semanticClass !== 'minimal-bootstrap');
  const arbitraryReadsBeforeOrientation = ingressKind === COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE
    ? []
    : events.filter((event) => event.index < orientationIndex && event.mechanism === 'native-host' && event.read && event.arbitrary !== false);
  const candidateArtifactsInspected = arbitraryReadsBeforeOrientation.reduce((sum, event) => sum + Math.max(0, Number(event.candidateArtifacts || (event.candidateArtifact ? 1 : 0) || 0)), 0);
  const actionsToOrientation = Number.isFinite(orientationIndex) ? events.filter((event) => event.index <= orientationIndex) : events;
  const tiinexCallsToOrientation = Number.isFinite(orientationIndex) ? tiinexEvents.filter((event) => event.index <= orientationIndex).length : tiinexEvents.length;
  const bytesToOrientation = actionsToOrientation.reduce((sum, event) => sum + Math.max(0, Number(event.bytes || 0)), 0);
  const timeToOrientationMs = computeTimeToOrientation(events, orientationEvent);
  const fallback = qualifyFallback(input, events);

  if (hostEvidenceRequired && !hostEvidenceQualified) findings.push(portableFinding('warning', 'portable.cold-start.host-evidence.unverified', 'Portable Tooling cannot independently observe pre-takeover native-host actions in this run; preferred-path qualification remains incomplete until bounded host evidence is supplied.', { source: hostEvidenceSource || 'unverified' }));
  if (!explicitlyUnavailable && !availabilityObserved) findings.push(portableFinding('warning', 'portable.cold-start.tooling-availability.unqualified', 'Preferred-path qualification cannot pass without observed qualified Tiinex Tooling/bootstrap availability.'));
  if (firstTiinex && profile.firstSemanticOperation && firstTiinex.operation !== profile.firstSemanticOperation) findings.push(portableFinding('error', 'portable.cold-start.first-semantic-operation.mismatch', 'The first observed Tiinex semantic operation does not match the ingress contract.', { expected: profile.firstSemanticOperation, actual: firstTiinex.operation }));
  if (minimalBootstrap.length > profile.minimalNativeBootstrapActions) findings.push(portableFinding('error', 'portable.cold-start.minimal-bootstrap.exceeded', 'Native/bootstrap ingress exceeded the explicit minimal pre-Tiinex allowance.', { allowed: profile.minimalNativeBootstrapActions, actual: minimalBootstrap.length }));
  if (unexpectedNative.length) findings.push(portableFinding('error', 'portable.cold-start.native-archaeology.pre-takeover', 'Native semantic/archive/filesystem archaeology occurred before Tiinex takeover.', { count: unexpectedNative.length }));
  if (arbitraryReadsBeforeOrientation.length) findings.push(portableFinding('error', 'portable.cold-start.arbitrary-read.pre-orientation', 'Arbitrary files were read before qualified Tiinex orientation/frontier discovery.', { count: arbitraryReadsBeforeOrientation.length }));
  if (profile.orientationOperation && !orientationEvent && !explicitlyUnavailable) findings.push(portableFinding('error', 'portable.cold-start.orientation.missing', 'The ingress trace does not contain a successful qualified orientation/frontier operation.', { operation: profile.orientationOperation }));

  const orderedOperations = profile.requiredBeforeSubstantive.map((operation) => findReadyOperationEvent(events, operation));
  const missingRequired = profile.requiredBeforeSubstantive.filter((operation, index) => !orderedOperations[index]);
  if (missingRequired.length && !explicitlyUnavailable) findings.push(portableFinding('error', 'portable.cold-start.required-grounding-sequence.incomplete', 'Required Tiinex orientation/grounding operations are missing before substantive work.', { operations: missingRequired }));
  if (!missingRequired.length && orderedOperations.length > 1) {
    for (let index = 1; index < orderedOperations.length; index += 1) {
      if (orderedOperations[index].index <= orderedOperations[index - 1].index) findings.push(portableFinding('error', 'portable.cold-start.required-grounding-sequence.order', 'Required Tiinex cold-start operations occurred out of order.', { previous: profile.requiredBeforeSubstantive[index - 1], current: profile.requiredBeforeSubstantive[index] }));
    }
  }
  if (firstSubstantive && groundingEvent && groundingEvent.index > firstSubstantive.index) findings.push(portableFinding('error', 'portable.cold-start.grounding.after-substantive-work', 'Recipient/participant/interaction grounding occurred after substantive work began.'));
  if (firstSubstantive && !groundingEvent && ingressKind !== COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE && !explicitlyUnavailable) findings.push(portableFinding('error', 'portable.cold-start.grounding.missing-before-substantive-work', 'Substantive work began without an observed grounding operation.'));
  if (input.grounding?.status === 'blocked') findings.push(portableFinding('error', 'portable.cold-start.grounding.blocked', 'Supplied consumer grounding is blocked and cannot support preferred-path qualification.'));
  if (fallback.used && !fallback.justified) findings.push(portableFinding('error', 'portable.cold-start.fallback.unjustified', 'Native fallback was used without an explicit bounded reason.'));
  if (fallback.used && availabilityObserved && fallback.beforeOrientation) findings.push(portableFinding('warning', 'portable.cold-start.fallback.available-tooling', 'Fallback was used before Tiinex orientation even though qualified Tooling availability was observed; recovery may still succeed but preferred-path qualification cannot pass.'));

  const recoveryState = normalizeRecoveryState(input.outcome || input.recovery || {});
  const blockingErrors = findings.filter((finding) => finding.severity === 'error');
  const preferredPassed = !explicitlyUnavailable
    && hostEvidenceQualified
    && availabilityObserved
    && Boolean(firstTiinex)
    && (!profile.orientationOperation || Boolean(orientationEvent))
    && minimalBootstrap.length <= profile.minimalNativeBootstrapActions
    && unexpectedNative.length === 0
    && arbitraryReadsBeforeOrientation.length === 0
    && missingRequired.length === 0
    && blockingErrors.length === 0
    && !(fallback.used && fallback.beforeOrientation);

  const state = preferredPassed
    ? 'preferred-pass'
    : hostEvidenceRequired && !hostEvidenceQualified
      ? 'incomplete'
    : recoveryState === 'recovered'
      ? 'recovered-not-preferred'
      : explicitlyUnavailable || (fallback.used && fallback.justified)
        ? 'degraded-fallback'
        : blockingErrors.length
          ? 'failed'
          : 'incomplete';

  return deepFreeze({
    schema: PORTABLE_COLD_START_QUALIFICATION_SCHEMA_ID,
    version: 1,
    status: state,
    ingressKind,
    contract,
    qualification: Object.freeze({
      state,
      preferredPathPassed: preferredPassed,
      recoveryState,
      recoveryIsPreferredPathEvidence: false,
      toolingAvailability: explicitlyUnavailable ? 'unavailable' : availabilityObserved ? 'observed-available' : 'unqualified',
      firstSemanticOperation: firstTiinex?.operation || '',
      expectedFirstSemanticOperation: profile.firstSemanticOperation,
      orientationOperation: orientationEvent?.operation || '',
      groundingState: input.grounding?.status || (groundingEvent ? String(groundingEvent.status || 'observed') : 'unobserved'),
      hostEvidence: Object.freeze({ required: hostEvidenceRequired, state: hostEvidenceState || (hostEvidenceRequired ? 'unverified' : 'not-required'), source: hostEvidenceSource || '', mode: String(input.hostEvidence?.mode || ''), independentlyObservedByTooling: false }),
      fallback
    }),
    metrics: Object.freeze({
      nativeActionsBeforeTiinexTakeover: preTakeoverNative.length,
      minimalBootstrapActionsBeforeTiinexTakeover: minimalBootstrap.length,
      unexpectedNativeActionsBeforeTiinexTakeover: unexpectedNative.length,
      arbitraryFilesReadBeforeOrientation: arbitraryReadsBeforeOrientation.length,
      tiinexCallsToOrientation,
      totalActionsToOrientation: actionsToOrientation.length,
      bytesToOrientation,
      timeToOrientationMs,
      candidateArtifactsInspectedBeforeOrientation: candidateArtifactsInspected,
      fallbackUsed: fallback.used,
      fallbackJustified: fallback.justified
    }),
    evidence: Object.freeze({
      events,
      firstTiinexEvent: firstTiinex,
      orientationEvent,
      groundingEvent,
      firstSubstantiveEvent: firstSubstantive,
      unexpectedNativeEvents: Object.freeze(unexpectedNative),
      arbitraryReadEvents: Object.freeze(arbitraryReadsBeforeOrientation)
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings),
    boundary: 'Preferred-path qualification is independent from final-answer correctness. Native host tools remain valid after Tiinex takeover and as explicit degraded fallback; this result does not authorize network access, authentication, source mutation, repository writes, or fabricated receipts.'
  });
}

function normalizeObservationEvents(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return Object.freeze(list.map((raw, index) => {
    const operation = String(raw?.operation || raw?.tiinexOperation || '').trim();
    const semanticClass = normalizeSemanticClass(raw?.semanticClass || raw?.class || raw?.boundary || raw?.kind || '');
    const mechanism = operation || raw?.mechanism === 'tiinex' || raw?.tooling === true ? 'tiinex' : 'native-host';
    const read = raw?.read === true || /read|open|extract|inspect|list|search/.test(String(raw?.action || raw?.name || raw?.kind || '').toLowerCase());
    return deepFreeze({
      index,
      sequence: Number.isFinite(Number(raw?.sequence)) ? Number(raw.sequence) : index + 1,
      mechanism,
      operation,
      action: String(raw?.action || raw?.name || raw?.kind || operation || '').trim(),
      semanticClass,
      status: String(raw?.status || raw?.result || raw?.state || '').trim(),
      read,
      arbitrary: raw?.arbitrary === false ? false : raw?.arbitrary === true ? true : read,
      path: String(raw?.path || raw?.target || '').trim(),
      bytes: Math.max(0, Number(raw?.bytes || raw?.byteCount || 0) || 0),
      elapsedMs: finiteOrNull(raw?.elapsedMs ?? raw?.timeMs ?? raw?.t),
      timestamp: String(raw?.timestamp || raw?.at || '').trim(),
      candidateArtifact: Boolean(raw?.candidateArtifact),
      candidateArtifacts: Math.max(0, Number(raw?.candidateArtifacts || 0) || 0),
      fallback: Boolean(raw?.fallback || semanticClass === 'fallback'),
      reason: String(raw?.reason || '').trim(),
      substantive: Boolean(raw?.substantive || semanticClass === 'substantive-work')
    });
  }));
}

function findReadyOperationEvent(events, operation) {
  if (!operation) return null;
  return events.find((event) => event.mechanism === 'tiinex' && event.operation === operation && operationEventReady(event)) || null;
}

function operationEventReady(event) {
  const status = normalizeToken(event.status);
  return !status || READY_OPERATION_STATES.has(status) || status.startsWith('passed');
}

function qualifyFallback(input, events) {
  const declared = input.fallback || {};
  const fallbackEvents = events.filter((event) => event.fallback);
  const used = declared.used === true || fallbackEvents.length > 0;
  const reason = String(declared.reason || fallbackEvents.find((event) => event.reason)?.reason || '').trim();
  const first = fallbackEvents[0] || null;
  const orientationEvent = events.find((event) => event.mechanism === 'tiinex' && ['orient-handoff-package', 'search-lineage'].includes(event.operation) && operationEventReady(event)) || null;
  return deepFreeze({
    used,
    justified: !used || Boolean(reason),
    reason,
    beforeOrientation: Boolean(used && first && (!orientationEvent || first.index < orientationEvent.index)),
    hiddenNetworkAccess: false,
    remoteWrite: false
  });
}

function normalizeRecoveryState(value = {}) {
  if (value === true) return 'recovered';
  if (value === false) return 'failed';
  const state = normalizeToken(value.state || value.status || '');
  if (['recovered', 'correct', 'success', 'passed', 'ready'].includes(state) || value.correct === true || value.recovered === true) return 'recovered';
  if (['failed', 'incorrect', 'error'].includes(state) || value.correct === false || value.recovered === false) return 'failed';
  return 'unknown';
}

function computeTimeToOrientation(events, orientationEvent) {
  if (!orientationEvent) return null;
  if (orientationEvent.elapsedMs !== null) return orientationEvent.elapsedMs;
  const firstTimestamp = parseTime(events[0]?.timestamp);
  const orientationTimestamp = parseTime(orientationEvent.timestamp);
  if (firstTimestamp !== null && orientationTimestamp !== null) return Math.max(0, orientationTimestamp - firstTimestamp);
  return null;
}
