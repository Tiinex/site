import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { discoverPortableHostCapabilities } from '../host/host.capabilities.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { parseRecipientV2Facts } from './recipientV2.artifacts.js';

export const PORTABLE_COLD_START_INGRESS_CONTRACT_SCHEMA_ID = 'tiinex.portable.cold-start-ingress-contract.v1';
export const PORTABLE_COLD_CONSUMER_GROUNDING_SCHEMA_ID = 'tiinex.portable.cold-consumer-grounding.v1';
export const PORTABLE_COLD_START_QUALIFICATION_SCHEMA_ID = 'tiinex.portable.cold-start-qualification.v1';
export const PORTABLE_COLD_START_HOST_PROJECTION_SCHEMA_ID = 'tiinex.portable.cold-start-host-projection.v1';

export const COLD_START_INGRESS_KINDS = Object.freeze({
  HANDOFF: 'routed-handoff-package',
  WORKSPACE: 'workspace-bootstrap',
  DEGRADED_CAPTURE: 'degraded-capture'
});

const NON_EXECUTION_MODES = new Set(['review', 'explanation', 'design-discussion', 'orientation', 'collaborative-dialogue']);
const READY_OPERATION_STATES = new Set(['ready', 'qualified', 'valid', 'accepted', 'passed', 'completed', 'degraded']);

const INGRESS_PROFILES = deepFreeze({
  [COLD_START_INGRESS_KINDS.HANDOFF]: {
    firstSemanticOperation: 'orient-handoff-package',
    requiredBeforeSubstantive: ['orient-handoff-package', 'ground-cold-consumer'],
    orientationOperation: 'orient-handoff-package',
    frontierOperation: 'orient-handoff-package',
    minimalNativeBootstrapActions: 1,
    description: 'A received routed Handoff package enters through qualified package orientation before arbitrary artifact archaeology.'
  },
  [COLD_START_INGRESS_KINDS.WORKSPACE]: {
    firstSemanticOperation: 'discover-tooling',
    requiredBeforeSubstantive: ['discover-tooling', 'search-lineage', 'ground-cold-consumer'],
    orientationOperation: 'search-lineage',
    frontierOperation: 'search-lineage',
    minimalNativeBootstrapActions: 1,
    description: 'A workspace with a qualified Tiinex bootstrap discovers host/session capabilities, then searches loaded lineage before arbitrary artifact reads.'
  },
  [COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE]: {
    firstSemanticOperation: '',
    requiredBeforeSubstantive: [],
    orientationOperation: '',
    frontierOperation: '',
    minimalNativeBootstrapActions: 0,
    description: 'A Tooling-unavailable environment may preserve attributed contributions only; durable semantic qualification waits for a later Tooling-capable turn.'
  }
});

export function describePortableColdStartIngress(input = {}) {
  const kind = normalizeIngressKind(input.ingressKind || input.kind || COLD_START_INGRESS_KINDS.HANDOFF);
  const profile = INGRESS_PROFILES[kind];
  return deepFreeze({
    schema: PORTABLE_COLD_START_INGRESS_CONTRACT_SCHEMA_ID,
    version: 1,
    ingressKind: kind,
    profile,
    metrics: Object.freeze([
      'nativeActionsBeforeTiinexTakeover',
      'unexpectedNativeActionsBeforeTiinexTakeover',
      'arbitraryFilesReadBeforeOrientation',
      'tiinexCallsToOrientation',
      'totalActionsToOrientation',
      'bytesToOrientation',
      'timeToOrientationMs',
      'candidateArtifactsInspectedBeforeOrientation',
      'fallbackUsed',
      'fallbackJustified'
    ]),
    qualification: Object.freeze({
      recoveryIsNotPreferredPath: true,
      qualifiedToolingAvailabilityMustBeObserved: true,
      firstSemanticOperationMustMatchProfile: true,
      nativePreTakeoverUse: `At most ${profile.minimalNativeBootstrapActions} explicit minimal host/bootstrap ingress action(s); arbitrary semantic archaeology before Tiinex takeover does not qualify.`,
      groundingBeforeSubstantiveWork: kind !== COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE,
      fallback: 'Explicit and justified only. Valid fallback may preserve recovery while remaining non-preferred when qualified Tiinex orientation was available.'
    }),
    authority: Object.freeze({
      providerSpecificSemanticAuthority: false,
      hostProjectionAuthority: false,
      packagePlacementAuthority: false,
      canonicalHandoffRoleSchemaProcessTruthPreserved: true,
      providerNameGrantsCapability: false,
      capabilityAdvertisementIsExerciseEvidence: false
    }),
    semanticSeparations: Object.freeze({
      lineageLeafIsWorkflowFrontier: false,
      lineageLeafIsTaskState: false,
      workflowFrontierIsTaskState: false,
      boundary: 'Lineage topology, current workflow frontier, and Task lifecycle state remain separate qualified observations; cold-start discovery must not collapse them into one currentness boolean.'
    }),
    traceability: Object.freeze({
      operations: Object.freeze(['orient-handoff-package', 'search-lineage', 'discover-tooling', 'ground-cold-consumer', 'plan-host-action', 'accept-host-receipt']),
      schemas: Object.freeze(['tiinex.handoff.v1', 'tiinex.party.role.v1']),
      capabilityBinding: 'tiinex.portable.tooling-discovery.v1'
    })
  });
}

export function groundPortableColdConsumer(input = {}, options = {}) {
  const ingressKind = normalizeIngressKind(input.ingressKind || input.kind || (input.toolingAvailable === false ? COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE : COLD_START_INGRESS_KINDS.HANDOFF));
  const findings = [];
  const degradedCapture = projectDegradedCapture(input);
  const discovery = discoverPortableHostCapabilities(capabilityDiscoveryInput(input), options);
  let orientation = null;
  let selectedRoute = null;
  let handoff = emptyHandoffGrounding();

  if (ingressKind === COLD_START_INGRESS_KINDS.HANDOFF) {
    const bundle = input.bundle || input.package || input;
    orientation = orientColdConsumerFromHandoffPackage({ bundle });
    if (orientation.status !== 'ready') findings.push(portableFinding('error', 'portable.cold-start.handoff.orientation.unqualified', 'Recipient grounding requires a qualified routed Handoff package orientation.'));
    const selected = selectGroundingRoute(orientation, input.route || input.routeId || input.routePath || '');
    selectedRoute = selected.route;
    if (selected.state !== 'qualified') findings.push(portableFinding('error', `portable.cold-start.handoff.route.${selected.state}`, selected.state === 'selection-required' ? 'Recipient grounding requires explicit route selection when multiple Handoff routes are qualified.' : 'Recipient grounding could not resolve exactly one qualified Handoff route.'));
    if (selectedRoute) {
      const markdown = resolveGroundingRouteMarkdown(bundle, selectedRoute, findings);
      if (markdown) handoff = parseHandoffGrounding(markdown, selectedRoute);
    }
  } else if (input.handoffMarkdown || input.handoff?.markdown) {
    handoff = parseHandoffGrounding(input.handoffMarkdown || input.handoff?.markdown || '', null);
  }

  const bundle = input.bundle || input.package || input;
  const role = groundRecipientRole(input, handoff, bundle, findings);
  const participation = groundParticipation(input, handoff, bundle, orientation, selectedRoute, findings);
  const interaction = groundInteraction(input, handoff);

  if (degradedCapture.active) {
    findings.push(portableFinding('info', 'portable.cold-start.degraded-capture.active', 'This grounding describes a Tooling-unavailable capture boundary; Tooling-dependent mutation and durable semantic claims remain prohibited until later qualification.'));
  }

  const blocked = findings.some((finding) => finding.severity === 'error');
  const degraded = degradedCapture.active || role.state === 'degraded' || interaction.modeState === 'unresolved' || participation.participantState === 'unresolved';
  return deepFreeze({
    schema: PORTABLE_COLD_CONSUMER_GROUNDING_SCHEMA_ID,
    version: 1,
    status: blocked ? 'blocked' : degraded ? 'degraded' : 'ready',
    ingressKind,
    orientation,
    selectedRoute,
    handoff,
    role,
    participation,
    interaction,
    capabilities: Object.freeze({
      discovery,
      instance: discovery.profile?.capabilityInstance || null,
      providerNameGrantsCapability: false,
      advertisementIsExerciseEvidence: false
    }),
    degradedCapture,
    mutationBoundary: Object.freeze({
      sourceMutation: false,
      remoteWrite: false,
      authentication: 'request-capability-only; never inferred from provider identity',
      trustSensitiveExerciseRequiresAcceptedReceipt: true
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings),
    boundary: 'Portable consumer grounding only. Handoff and Role artifacts remain semantic authority; participant identity is never inferred from one transport channel; host/provider projections do not create authority.'
  });
}

export function qualifyPortableColdStart(input = {}, options = {}) {
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

export function projectPortableColdStartHostGuidance(input = {}, options = {}) {
  const ingressKind = normalizeIngressKind(input.ingressKind || input.kind || COLD_START_INGRESS_KINDS.HANDOFF);
  const contract = describePortableColdStartIngress({ ingressKind });
  const discovery = discoverPortableHostCapabilities(capabilityDiscoveryInput(input), options);
  const capabilities = discovery.profile?.capabilities || {};
  const packageReadable = Boolean(capabilities.materialAccess?.attachments || capabilities.materialAccess?.projectSources || capabilities.materialAccess?.filesystemRead || capabilities.materialAccess?.archiveRead);
  const processReady = Boolean(capabilities.execution?.javascript || capabilities.execution?.shell || capabilities.execution?.process);
  const requirements = ingressKind === COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE
    ? [requirement('contribution-capture', true, 'Preserve contribution and speaker attribution without Tooling-dependent mutation claims.')]
    : [
      requirement('package-or-workspace-readable', packageReadable, 'The host can surface explicitly supplied package/workspace bytes to portable Tooling.'),
      requirement('portable-tooling-invocation', processReady || input.toolingInvocationAvailable === true, 'The host can invoke already-qualified portable Tooling or an equivalent registered Tooling entrypoint.'),
      requirement('human-confirmation', Boolean(capabilities.interaction?.humanConfirmation), 'Explicit human confirmation is available when an operation requires it.', true),
      requirement('artifact-return', Boolean(capabilities.interaction?.artifactReturn), 'The host can return generated local artifacts/results to the human.', true),
      requirement('copyable-text-presentation', Boolean(capabilities.interaction?.copyableTextPresentation), 'The host can present exact copyable routing/result text when required.', true)
    ];
  const requiredMissing = requirements.filter((entry) => !entry.optional && !entry.satisfied);
  return deepFreeze({
    schema: PORTABLE_COLD_START_HOST_PROJECTION_SCHEMA_ID,
    version: 1,
    status: requiredMissing.length ? 'degraded' : 'ready',
    ingressKind,
    contract,
    capabilityInstance: discovery.profile?.capabilityInstance || null,
    capabilityDiscovery: discovery,
    requirements: Object.freeze(requirements),
    steps: Object.freeze(contract.profile.requiredBeforeSubstantive.map((operation, index) => Object.freeze({
      order: index + 1,
      operation,
      authority: 'canonical-portable-operation-contract',
      hostSpecificToolNameRequired: false
    }))),
    traceability: Object.freeze({
      operationContract: 'tiinex.portable.operation.catalog.v1',
      capabilityContract: 'tiinex.portable.tooling-discovery.v1',
      handoffSchema: 'tiinex.handoff.v1',
      roleSchema: 'tiinex.party.role.v1'
    }),
    authority: Object.freeze({
      semanticAuthority: 'none',
      providerSpecificSemanticAuthority: false,
      providerNameGrantsCapability: false,
      capabilityAdvertisementIsExerciseEvidence: false,
      trustSensitiveExerciseStillRequiresAcceptedReceipt: true
    }),
    degraded: Object.freeze({
      requiredMissing: Object.freeze(requiredMissing.map((entry) => entry.capability)),
      fallbackMustBeExplicit: true,
      hiddenNetworkAccess: false,
      remoteWrite: false,
      authenticationMayBeRequestedOnlyThroughDeclaredCapability: true
    }),
    boundary: 'Non-authoritative host/bootstrap projection derived from portable ingress and capability contracts. Hosts may render this into CLI, LLM, Viewer, IDE, or future provider-specific instruction formats without adding semantic rules.'
  });
}

function capabilityDiscoveryInput(input = {}) {
  const host = input.host && typeof input.host === 'object' ? input.host : {};
  return {
    ...host,
    tools: input.tools || input.availableTools || host.tools || host.availableTools || [],
    capabilities: input.capabilities || input.hostCapabilities || host.capabilities,
    provider: input.provider || host.provider,
    hostIdentity: input.hostIdentity || input.hostContext || host.hostIdentity || host.host || nestedHostIdentity(host),
    session: input.session || input.sessionContext || host.session,
    capabilityInstanceId: input.capabilityInstanceId || host.capabilityInstanceId || ''
  };
}

function nestedHostIdentity(host = {}) {
  if (!host || typeof host !== 'object') return undefined;
  const id = String(host.id || host.identifier || host.slug || '').trim();
  const name = String(host.name || host.label || id || '').trim();
  return id || name ? Object.freeze({ id, name }) : undefined;
}

function groundRecipientRole(input, handoff, bundle, findings) {
  const toKind = normalizeToken(handoff.toKind);
  if (toKind && toKind !== 'role') return deepFreeze({
    state: 'not-applicable',
    endpoint: Object.freeze({ label: handoff.to || '', kind: handoff.toKind || '', bounded: Boolean(handoff.to) }),
    material: Object.freeze({ state: 'not-required', artifact: null }),
    transition: Object.freeze({ state: 'not-applicable', id: '' }),
    predecessor: Object.freeze({ state: 'not-applicable', target: '' }),
    compatibility: 'not-applicable',
    exactBoundaryLoaded: null,
    boundary: 'Recipient endpoint is not declared as Role; no Role artifact is invented.'
  });

  const explicitMaterials = normalizeRoleMaterials(input.roleMaterials || input.roleMaterial || []);
  const packageMaterials = collectPackageRoleMaterials(bundle);
  const referencedMaterial = handoff.toReference ? resolveReferencedRoleMaterial(bundle, handoff, findings) : null;
  const all = dedupeRoleMaterials([...(referencedMaterial ? [referencedMaterial] : []), ...explicitMaterials, ...packageMaterials]);
  const parsed = all.map((entry) => parseRoleMaterial(entry)).filter(Boolean);
  const target = normalizeComparable(handoff.to || input.recipientRole || input.roleLabel || '');
  const exactReferenced = referencedMaterial ? parseRoleMaterial(referencedMaterial) : null;
  const matches = target ? parsed.filter((entry) => normalizeComparable(entry.label) === target) : [];
  const explicitParsed = parsed.filter((entry) => entry.explicit);
  const explicitMismatch = explicitParsed.length === 1 && target && normalizeComparable(explicitParsed[0].label) !== target;
  let state = 'degraded';
  let compatibility = 'degraded-missing-material';
  let selected = null;
  if (explicitMismatch) {
    state = 'blocked';
    compatibility = 'mismatch';
    findings.push(portableFinding('error', 'portable.cold-start.role.explicit-material.mismatch', 'Explicit recipient Role material does not match the Handoff recipient Role label.', { handoffTo: handoff.to || '', roleLabel: explicitParsed[0].label || '' }));
  } else if (exactReferenced && target && normalizeComparable(exactReferenced.label) !== target) {
    state = 'blocked';
    compatibility = 'mismatch';
    findings.push(portableFinding('error', 'portable.cold-start.role.reference-material.mismatch', 'The exact Handoff To Reference resolved to a Role artifact whose Role Label contradicts the Handoff To endpoint.', { handoffTo: handoff.to || '', roleLabel: exactReferenced.label || '', reference: handoff.toReference || '' }));
  } else if (exactReferenced) {
    selected = exactReferenced;
    state = 'qualified';
    compatibility = 'compatible-exact-reference';
  } else if (matches.length === 1) {
    selected = matches[0];
    state = 'qualified';
    compatibility = 'compatible';
  } else if (matches.length > 1) {
    state = 'blocked';
    compatibility = 'ambiguous';
    findings.push(portableFinding('error', 'portable.cold-start.role.material.ambiguous', 'More than one Role artifact matches the Handoff recipient Role; current Role material is ambiguous.', { role: handoff.to || '', candidates: matches.map((entry) => entry.path) }));
  } else if (toKind === 'role' || (!toKind && handoff.to)) {
    findings.push(portableFinding('warning', handoff.toReference ? 'portable.cold-start.role.reference-material.missing' : 'portable.cold-start.role.material.missing', 'Handoff declares a bounded recipient Role endpoint but current Role material is not resolvable; grounding is degraded rather than silently invalidated.', { role: handoff.to || '' }));
  }
  const transitionInput = input.roleTransition || input.role?.transition || {};
  const transitionId = String(transitionInput.id || transitionInput.transitionId || transitionInput.path || '').trim();
  return deepFreeze({
    state,
    endpoint: Object.freeze({ label: handoff.to || input.recipientRole || '', kind: handoff.toKind || (handoff.to ? 'role' : ''), bounded: Boolean(handoff.to) }),
    material: Object.freeze({
      state: selected ? 'qualified' : state === 'blocked' ? compatibility : 'missing',
      artifact: selected ? Object.freeze({ path: selected.path, sha256: selected.sha256, schemaId: selected.schemaId, title: selected.title, roleLabel: selected.label, roleKind: selected.roleKind, reference: handoff.toReference || '' }) : null,
      candidatesInspected: parsed.length
    }),
    transition: Object.freeze({ state: transitionId ? 'declared' : 'unresolved', id: transitionId, predecessor: String(transitionInput.predecessor || transitionInput.predecessorId || '') }),
    predecessor: Object.freeze({ state: selected?.parentTrace ? 'declared' : 'unresolved', target: selected?.parentTrace || '', schemaId: selected?.parentSchemaId || '' }),
    compatibility,
    exactBoundaryLoaded: selected ? selected.boundary : null,
    authorityBoundaryLoaded: selected ? selected.authorityBoundary : null,
    interpretationLimitsLoaded: selected ? selected.interpretationLimits : null,
    boundary: 'A Handoff `To Kind: role` endpoint remains bounded even when current Role material is missing. Matching Role material qualifies the loaded boundary but does not prove a human holder, consent, or authority beyond the Role artifact itself.'
  });
}

function groundParticipation(input, handoff, bundle, orientation, selectedRoute, findings) {
  const explicitParticipants = normalizeParticipants(input.participants || input.interaction?.participants || []);
  const packageRoleParticipants = resolvePackageParticipantRoles(bundle, orientation, selectedRoute, findings);
  const participants = dedupeGroundedParticipants([...explicitParticipants, ...packageRoleParticipants]);
  const contributions = normalizeContributions(input.contributions || input.interaction?.contributions || []);
  const currentContributionId = String(input.currentContributionId || input.interaction?.currentContributionId || '').trim();
  const current = currentContributionId ? contributions.find((entry) => entry.id === currentContributionId) || null : null;
  return deepFreeze({
    participantState: participants.length ? 'declared' : 'unresolved',
    participants: Object.freeze(participants),
    packageRoleParticipants: Object.freeze(packageRoleParticipants),
    contributions: Object.freeze(contributions),
    currentContribution: Object.freeze({
      state: current ? (current.attribution === 'verified' ? 'verified' : 'declared-unverified') : currentContributionId ? 'unresolved' : 'not-declared',
      id: current?.id || currentContributionId,
      speakerId: current?.speakerId || '',
      speakerLabel: current?.speakerLabel || '',
      attribution: current?.attribution || 'unknown'
    }),
    handoffCapacities: Object.freeze([
      ...(handoff.from ? [Object.freeze({ direction: 'from', label: handoff.from, kind: handoff.fromKind || '', semanticClass: 'handoff-capacity', humanIdentityProof: false })] : []),
      ...(handoff.to ? [Object.freeze({ direction: 'to', label: handoff.to, kind: handoff.toKind || '', semanticClass: 'handoff-capacity', humanIdentityProof: false })] : [])
    ]),
    transportIdentityAssumption: false,
    cardinality: Object.freeze({ participants: participants.length, contributions: contributions.length, oneHumanOneLlmRequired: false }),
    boundary: 'Participants and speakers are explicit semantic declarations. Package-local participant Role Pointer ancestry may declare Role participation for interaction grounding, but never proves a human holder, speaker identity, or transport identity. One chat/account/transport channel is not treated as one human identity.'
  });
}

function resolvePackageParticipantRoles(bundle = {}, orientation = null, selectedRoute = null, findings = []) {
  const pointerPaths = selectedRoute?.participantRolePointers || [];
  const out = [];
  for (let index = 0; index < pointerPaths.length; index += 1) {
    const pointerPath = String(pointerPaths[index] || '');
    const pointerFile = findFile(bundle, pointerPath);
    if (!pointerFile) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.pointer.missing', 'Selected Handoff route declares participant Role Pointer ancestry that is not carried.', { pointerPath })); continue; }
    const facts = parseRecipientV2Facts(decodeUtf8(packageFileBytes(pointerFile))) || {};
    if (facts.role !== 'participant-role') { findings.push(portableFinding('error', 'portable.cold-start.participant-role.pointer.invalid', 'Selected route ancestor is not a participant Role Pointer.', { pointerPath })); continue; }
    const material = resolveParticipantRolePointerMaterial(bundle, facts, findings, pointerPath);
    if (!material) continue;
    const parsed = parseRoleMaterial({ path: material.path, markdown: material.markdown, explicit: false });
    if (!parsed) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.material.invalid', 'Participant Role Pointer target is not one exact tiinex.party.role.v1 artifact.', { pointerPath, target: material.path })); continue; }
    const hint = String(facts.roleLabelHint || '').trim();
    if (hint && parsed.label && normalizeToken(hint) !== normalizeToken(parsed.label)) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.label-mismatch', 'Participant Role Pointer label hint conflicts with the exact carried Role artifact.', { pointerPath, hint, roleLabel: parsed.label })); continue; }
    out.push(deepFreeze({
      id: `package-role-${index + 1}`,
      label: parsed.label || hint || parsed.title,
      identities: Object.freeze([]),
      roles: Object.freeze([parsed.label || hint || parsed.title].filter(Boolean)),
      verification: 'declared',
      transportChannel: '',
      transportChannelIsIdentityProof: false,
      packageDeclared: true,
      roleArtifact: Object.freeze({ path: parsed.path, sha256: parsed.sha256, schemaId: parsed.schemaId, roleLabel: parsed.label, roleKind: parsed.roleKind }),
      pointerPath
    }));
  }
  return Object.freeze(out);
}

function resolveParticipantRolePointerMaterial(bundle, facts, findings, pointerPath) {
  const archivePath = String(facts.archivePath || '').trim();
  const archiveFile = findFile(bundle, archivePath);
  if (!archiveFile) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.archive.missing', 'Participant Role Pointer target archive is not carried.', { pointerPath, archivePath })); return null; }
  const archive = inspectStoredWorkspaceArchive(packageFileBytes(archiveFile), { ownedBytes: true });
  if (archive.state !== 'qualified') { findings.push(portableFinding('error', 'portable.cold-start.participant-role.archive.invalid', 'Participant Role Pointer target archive is not qualified.', { pointerPath, archivePath })); return null; }
  const targetPath = String(facts.targetCarrierKind || '') === 'workspace-cache-entry' ? String(facts.targetArchiveEntry || '') : String(facts.targetInnerPath || '');
  const matches = (archive.entries || []).filter((entry) => normalizePath(entry.path || '') === normalizePath(targetPath));
  if (matches.length !== 1) { findings.push(portableFinding('error', matches.length > 1 ? 'portable.cold-start.participant-role.target.ambiguous' : 'portable.cold-start.participant-role.target.missing', 'Participant Role Pointer does not resolve to exactly one target entry.', { pointerPath, archivePath, targetPath, matches: matches.length })); return null; }
  const entry = matches[0];
  const data = packageFileBytes({ data: entry.data });
  if ((facts.targetBytes && Number(facts.targetBytes) !== data.byteLength) || (facts.targetSha256 && String(facts.targetSha256) !== sha256Hex(data))) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.target.identity-mismatch', 'Participant Role Pointer target bytes diverge from the declared exact identity.', { pointerPath, archivePath, targetPath })); return null; }
  const markdown = decodeUtf8(data);
  return markdown ? Object.freeze({ path: `${archivePath}::${targetPath}`, markdown }) : null;
}

function dedupeGroundedParticipants(items = []) {
  const map = new Map();
  for (const item of items) {
    const key = item.roleArtifact?.sha256 ? `role:${item.roleArtifact.sha256}` : `participant:${item.id || ''}:${item.label || ''}`;
    if (!map.has(key)) map.set(key, item);
  }
  return Object.freeze([...map.values()]);
}

function groundInteraction(input, handoff) {
  const interaction = input.interaction || {};
  const mode = normalizeInteractionMode(interaction.mode || input.interactionMode || '');
  const currentPurpose = String(interaction.purpose || input.interactionPurpose || handoff.purpose || '').trim();
  return deepFreeze({
    handoffPurpose: handoff.purpose || '',
    currentPurpose,
    purposeState: currentPurpose ? 'declared' : 'unresolved',
    mode,
    modeState: mode ? 'declared' : 'unresolved',
    executionExpected: mode ? mode === 'execution' : null,
    nonExecutionMode: Boolean(mode && NON_EXECUTION_MODES.has(mode)),
    continuingDialoguePermitted: interaction.continuingDialogue === false ? false : true,
    oneShotAssumed: false,
    boundary: 'Handoff purpose and current interaction mode are separate. Execution is not assumed from Handoff existence, and review/explanation/design/orientation/dialogue modes remain valid continuing interactions.'
  });
}

function projectDegradedCapture(input) {
  const capture = input.capture || input.degradedCapture || {};
  const active = input.toolingAvailable === false || capture.toolingAvailable === false || capture.mode === 'degraded-capture' || capture.toolingState === 'unavailable';
  return deepFreeze({
    active,
    mode: active ? 'degraded-capture' : 'inactive',
    preserveContributions: active,
    preserveSpeakerAttribution: active,
    toolingDependentMutationAllowed: false,
    toolingDependentClaimsAllowed: false,
    hiddenNetworkAccessAllowed: false,
    laterToolingCapableCondensationRequired: active,
    durableArtifactQualificationRequiredLater: active,
    reason: String(capture.reason || (active ? 'Tooling unavailable in capture environment.' : '')).trim()
  });
}

function collectPackageRoleMaterials(bundle = {}) {
  if (!Array.isArray(bundle?.files)) return [];
  const out = [];
  for (const file of bundle.files) {
    const path = String(file.path || '');
    if (!/\.trace\.md$/i.test(path) || /\.schema\.md$/i.test(path) || path.startsWith('tiinex.package/') || path.startsWith('tiinex.bootstrap/')) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    if (!/Current Schema:\s*(?:\[)?tiinex\.party\.role\.v1\b/i.test(markdown)) continue;
    out.push(Object.freeze({ path, markdown, explicit: false }));
  }
  return out;
}

function resolveReferencedRoleMaterial(bundle = {}, handoff = {}, findings = []) {
  const reference = String(handoff.toReference || '').trim();
  if (!reference) return null;
  if (!isExternalReference(reference)) {
    const workspaceZip = findFile(bundle, String(handoff.packagePath || ''));
    if (workspaceZip && /\.zip$/i.test(String(workspaceZip.path || ''))) {
      const archive = inspectStoredWorkspaceArchive(packageFileBytes(workspaceZip), { ownedBytes: true });
      if (archive.state === 'qualified') {
        const resolvedPath = resolveRelativeArtifactPath(handoff.workspaceRelativePath || '', reference);
        const matches = resolvedPath ? (archive.entries || []).filter((entry) => normalizePath(entry.path || '') === resolvedPath) : [];
        if (matches.length === 1) {
          const markdown = decodeUtf8(matches[0].data || new Uint8Array());
          if (markdown) return Object.freeze({ path: `${workspaceZip.path}::${resolvedPath}`, markdown, explicit: false, exactReference: reference });
        }
        if (matches.length > 1) findings.push(portableFinding('error', 'portable.cold-start.role.reference-material.ambiguous', 'Handoff To Reference resolves to multiple entries in the selected Workspace archive.', { reference, resolvedPath }));
      }
    }
  }
  const cacheMatches = [];
  for (const file of bundle.files || []) {
    if (!/\.trace\.md$/i.test(String(file.path || ''))) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    const facts = parseRecipientV2Facts(markdown);
    if (facts?.role !== 'workspace-dependency-cache' && !/dependency cache/i.test(String(facts?.role || ''))) continue;
    for (const material of facts.materials || []) {
      if (String(material.referenceTarget || '') !== reference) continue;
      const archiveFile = findFile(bundle, String(facts.archivePath || ''));
      if (!archiveFile) continue;
      const archive = inspectStoredWorkspaceArchive(packageFileBytes(archiveFile), { ownedBytes: true });
      if (archive.state !== 'qualified') continue;
      const entries = (archive.entries || []).filter((entry) => String(entry.path || '') === String(material.archiveEntry || ''));
      if (entries.length !== 1) continue;
      const roleMarkdown = decodeUtf8(entries[0].data || new Uint8Array());
      if (roleMarkdown) cacheMatches.push(Object.freeze({ path: `${archiveFile.path}::${material.archiveEntry}`, markdown: roleMarkdown, explicit: false, exactReference: reference }));
    }
  }
  if (cacheMatches.length === 1) return cacheMatches[0];
  if (cacheMatches.length > 1) findings.push(portableFinding('error', 'portable.cold-start.role.reference-material.ambiguous', 'Handoff To Reference resolves to multiple cached exact byte carriers.', { reference, count: cacheMatches.length }));
  return null;
}

function resolveRelativeArtifactPath(basePath = '', reference = '') {
  const target = String(reference || '').split('#')[0].trim().replace(/\\/g, '/');
  if (!target || target.startsWith('/') || isExternalReference(target)) return '';
  const base = normalizePath(basePath).split('/'); base.pop();
  for (const part of target.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!base.length) return ''; base.pop(); }
    else base.push(part);
  }
  return normalizePath(base.join('/'));
}

function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:\/\//i.test(String(value || '').trim()); }

function normalizeRoleMaterials(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.flatMap((item, index) => {
    if (typeof item === 'string') return [Object.freeze({ path: `explicit-role-${index + 1}.trace.md`, markdown: item, explicit: true })];
    const markdown = String(item?.markdown || item?.content || '');
    if (!markdown) return [];
    return [Object.freeze({ path: String(item.path || `explicit-role-${index + 1}.trace.md`), markdown, explicit: true })];
  });
}

function dedupeRoleMaterials(entries) {
  const map = new Map();
  for (const entry of entries) {
    const markdown = String(entry.markdown || '');
    const key = `${entry.path}\u0000${markdown}`;
    if (!map.has(key)) map.set(key, entry);
  }
  return [...map.values()];
}

function parseRoleMaterial(entry) {
  try {
    const parsed = parseArtifactMarkdown(entry.markdown || '');
    const schemaId = String(parsed.envelope?.current?.schema?.id || '');
    if (schemaId !== 'tiinex.party.role.v1') return null;
    const roleSection = sectionText(parsed.body?.text || '', 'Role Identity');
    const boundarySection = sectionText(parsed.body?.text || '', 'Role Boundary');
    const authoritySection = sectionText(parsed.body?.text || '', 'Authority And Responsibility Boundary');
    const limitsSection = sectionText(parsed.body?.text || '', 'Interpretation Limits');
    const label = sectionField(roleSection, 'Role Label');
    return deepFreeze({
      path: entry.path,
      explicit: Boolean(entry.explicit),
      sha256: sha256Hex(new TextEncoder().encode(entry.markdown || '')),
      schemaId,
      title: parsed.title || '',
      label,
      roleKind: sectionField(roleSection, 'Role Kind'),
      boundary: Object.freeze({ inScope: sectionField(boundarySection, 'In Scope'), outOfScope: sectionField(boundarySection, 'Out Of Scope'), context: sectionField(boundarySection, 'Context') }),
      authorityBoundary: Object.freeze({ mayDo: sectionField(authoritySection, 'May Do'), doesNotAuthorize: sectionField(authoritySection, 'Does Not Authorize'), reviewBoundary: sectionField(authoritySection, 'Review Boundary') }),
      interpretationLimits: Object.freeze({ doesNotProve: sectionField(limitsSection, 'Does Not Prove'), mustNotBeTreatedAs: sectionField(limitsSection, 'Must Not Be Treated As') }),
      parentTrace: String(parsed.envelope?.parent?.trace || ''),
      parentSchemaId: String(parsed.envelope?.parent?.schema?.id || '')
    });
  } catch {
    return null;
  }
}

function parseHandoffGrounding(markdown, route) {
  const parties = sectionText(markdown, 'Handoff Parties');
  return deepFreeze({
    schemaId: /Current Schema:\s*(?:\[)?tiinex\.handoff\.v1\b/i.test(markdown) ? 'tiinex.handoff.v1' : '',
    purpose: sectionField(parties, 'Purpose'),
    from: sectionField(parties, 'From'),
    fromKind: sectionField(parties, 'From Kind'),
    to: sectionField(parties, 'To'),
    toKind: sectionField(parties, 'To Kind'),
    fromReference: sectionReferenceTarget(parties, 'From Reference'),
    toReference: sectionReferenceTarget(parties, 'To Reference'),
    routeId: String(route?.id || ''),
    workspaceId: String(route?.workspaceId || ''),
    workspaceRelativePath: String(route?.workspaceRelativeHandoffPath || route?.workspaceRelativePath || ''),
    packagePath: String(route?.packagePath || ''),
    sha256: String(route?.sha256 || ''),
    boundary: 'Exact Handoff parties/purpose read from selected qualified Handoff bytes; transport route labels are not substituted for artifact semantics.'
  });
}

function emptyHandoffGrounding() {
  return deepFreeze({ schemaId: '', purpose: '', from: '', fromKind: '', fromReference: '', to: '', toKind: '', toReference: '', routeId: '', workspaceId: '', workspaceRelativePath: '', packagePath: '', sha256: '', boundary: 'No Handoff material supplied.' });
}

function resolveGroundingRouteMarkdown(bundle = {}, selectedRoute = {}, findings = []) {
  const packagePath = String(selectedRoute.packagePath || '');
  const routeFile = findFile(bundle, packagePath);
  if (!routeFile) {
    findings.push(portableFinding('error', 'portable.cold-start.handoff.route-carrier.missing', 'Selected Handoff route carrier is missing from the received package.'));
    return '';
  }
  const workspaceRelativePath = normalizePath(selectedRoute.workspaceRelativeHandoffPath || selectedRoute.workspaceRelativePath || '');
  if (/\.zip$/i.test(packagePath) && workspaceRelativePath) {
    const archive = inspectStoredWorkspaceArchive(packageFileBytes(routeFile), { ownedBytes: true });
    if (archive.state !== 'qualified') {
      findings.push(portableFinding('error', 'portable.cold-start.handoff.route-workspace-archive.invalid', 'Selected recipient-v2 Workspace archive carrier is not a qualified readable ZIP.'));
      return '';
    }
    const matches = (archive.entries || []).filter((entry) => normalizePath(entry.path || '') === workspaceRelativePath);
    if (matches.length !== 1) {
      findings.push(portableFinding('error', 'portable.cold-start.handoff.route-entry.unresolved', 'Selected recipient-v2 Handoff path does not resolve to exactly one entry inside the qualified Workspace archive.'));
      return '';
    }
    const entry = matches[0];
    const expectedSha256 = String(selectedRoute.sha256 || '').trim();
    const observedSha256 = String(entry.sha256 || sha256Hex(entry.data || new Uint8Array())).trim();
    if (expectedSha256 && expectedSha256 !== observedSha256) {
      findings.push(portableFinding('error', 'portable.cold-start.handoff.route-bytes.integrity-mismatch', 'Selected recipient-v2 Handoff archive entry bytes do not match the qualified route digest.'));
      return '';
    }
    const markdown = decodeUtf8(entry.data || new Uint8Array());
    if (!markdown) findings.push(portableFinding('error', 'portable.cold-start.handoff.route-bytes.unreadable', 'Selected recipient-v2 Handoff archive entry is not readable UTF-8 Markdown.'));
    return markdown;
  }
  const markdown = decodeUtf8(packageFileBytes(routeFile));
  if (!markdown) findings.push(portableFinding('error', 'portable.cold-start.handoff.route-bytes.unreadable', 'Selected Handoff route bytes are missing or unreadable.'));
  return markdown;
}

function selectGroundingRoute(orientation = {}, selector = '') {
  const routes = (orientation.routes || []).filter((route) => route.state === 'qualified');
  const requested = String(selector || '').trim();
  if (!requested) {
    if (routes.length === 1) return Object.freeze({ state: 'qualified', route: routes[0] });
    return Object.freeze({ state: routes.length > 1 ? 'selection-required' : 'unresolved', route: null });
  }
  const normalized = normalizePath(requested);
  const matches = routes.filter((route) => route.id === requested || normalizePath(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || '') === normalized || `${route.workspaceId}:${normalizePath(route.workspaceRelativeHandoffPath || route.workspaceRelativePath || '')}` === requested);
  return Object.freeze({ state: matches.length === 1 ? 'qualified' : matches.length > 1 ? 'ambiguous' : 'unresolved', route: matches.length === 1 ? matches[0] : null });
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

function normalizeParticipants(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((entry, index) => deepFreeze({
    id: String(entry?.id || `participant-${index + 1}`),
    label: String(entry?.label || entry?.name || '').trim(),
    identities: Object.freeze(normalizeStringList(entry?.identities || entry?.identity)),
    roles: Object.freeze(normalizeStringList(entry?.roles || entry?.capacities || entry?.role)),
    verification: normalizeAttribution(entry?.verification || entry?.attribution || 'unverified'),
    transportChannel: String(entry?.transportChannel || entry?.channel || '').trim(),
    transportChannelIsIdentityProof: false
  }));
}

function normalizeContributions(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((entry, index) => deepFreeze({
    id: String(entry?.id || `contribution-${index + 1}`),
    speakerId: String(entry?.speakerId || entry?.participantId || '').trim(),
    speakerLabel: String(entry?.speakerLabel || entry?.speaker || '').trim(),
    attribution: normalizeAttribution(entry?.attribution || entry?.verification || 'unverified'),
    contentReference: String(entry?.contentReference || entry?.reference || '').trim(),
    contributionKind: String(entry?.kind || entry?.type || 'message').trim()
  }));
}

function normalizeAttribution(value) {
  const normalized = normalizeToken(value);
  if (['verified', 'declared', 'unverified', 'unknown'].includes(normalized)) return normalized;
  return normalized ? 'unverified' : 'unknown';
}

function normalizeInteractionMode(value) {
  const normalized = normalizeToken(value).replace(/_/g, '-');
  if (!normalized) return '';
  const aliases = { design: 'design-discussion', discussion: 'collaborative-dialogue', explain: 'explanation', review: 'review', execute: 'execution' };
  return aliases[normalized] || normalized;
}

function requirement(capability, satisfied, meaning, optional = false) {
  return deepFreeze({ capability, satisfied: Boolean(satisfied), optional: Boolean(optional), meaning });
}

function sectionText(markdown = '', heading = '') {
  const escaped = escapeRegExp(heading);
  const match = new RegExp(`^##\\s+${escaped}\\s*$`, 'mi').exec(String(markdown || ''));
  if (!match) return '';
  const rest = String(markdown).slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}

function sectionField(section = '', name = '') {
  const escaped = escapeRegExp(name);
  const match = String(section || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  return stripMarkdown(String(match?.[1] || '').trim());
}

function sectionReferenceTarget(section = '', name = '') {
  const escaped = escapeRegExp(name);
  const match = String(section || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  const raw = String(match?.[1] || '').trim();
  const link = raw.match(/^\[[^\]]+\]\(([^)\s]+)\)$/);
  return String(link?.[1] || raw).trim();
}

function stripMarkdown(value = '') {
  const text = String(value || '').trim();
  const link = text.match(/^\[([^\]]+)\]\([^)]+\)$/);
  if (link) return link[1].trim();
  return text.replace(/^`(.+)`$/, '$1').replace(/^\*\*(.+)\*\*$/, '$1').trim();
}

function normalizeIngressKind(value) {
  const normalized = normalizeToken(value).replace(/_/g, '-');
  if (Object.prototype.hasOwnProperty.call(INGRESS_PROFILES, normalized)) return normalized;
  if (['handoff', 'handoff-package', 'routed-handoff'].includes(normalized)) return COLD_START_INGRESS_KINDS.HANDOFF;
  if (['workspace', 'workspace-with-bootstrap'].includes(normalized)) return COLD_START_INGRESS_KINDS.WORKSPACE;
  if (['voice', 'stt', 'capture'].includes(normalized)) return COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE;
  return COLD_START_INGRESS_KINDS.HANDOFF;
}

function normalizeSemanticClass(value) {
  const normalized = normalizeToken(value).replace(/_/g, '-');
  if (['bootstrap', 'host-bootstrap', 'minimal-ingress', 'minimal-bootstrap'].includes(normalized)) return 'minimal-bootstrap';
  if (['substantive', 'reasoning', 'work', 'substantive-work'].includes(normalized)) return 'substantive-work';
  if (['fallback', 'degraded-fallback'].includes(normalized)) return 'fallback';
  if (['native-read', 'artifact-read', 'filesystem-read', 'archive-read'].includes(normalized)) return 'native-read';
  return normalized || 'native-action';
}

function normalizeComparable(value) { return stripMarkdown(value).toLowerCase().replace(/\s+/g, ' ').trim(); }
function normalizeToken(value) { return String(value || '').trim().toLowerCase(); }
function normalizePath(value) { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function normalizeStringList(value) { const list = Array.isArray(value) ? value : value ? [value] : []; return [...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))]; }
function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function finiteOrNull(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
function parseTime(value) { const ms = Date.parse(String(value || '')); return Number.isFinite(ms) ? ms : null; }
function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
