import { discoverPortableHostCapabilities } from '../host/host.capabilities.js';
import { deepFreeze, normalizeToken } from './coldStartQualification.shared.js';

export const PORTABLE_COLD_START_INGRESS_CONTRACT_SCHEMA_ID = 'tiinex.portable.cold-start-ingress-contract.v1';

export const PORTABLE_COLD_CONSUMER_GROUNDING_SCHEMA_ID = 'tiinex.portable.cold-consumer-grounding.v1';

export const PORTABLE_COLD_START_QUALIFICATION_SCHEMA_ID = 'tiinex.portable.cold-start-qualification.v1';

export const PORTABLE_COLD_START_HOST_PROJECTION_SCHEMA_ID = 'tiinex.portable.cold-start-host-projection.v1';

export const COLD_START_INGRESS_KINDS = Object.freeze({
  HANDOFF: 'routed-handoff-package',
  WORKSPACE: 'workspace-bootstrap',
  DEGRADED_CAPTURE: 'degraded-capture'
});

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
      cli: 'qualify-cold-start <handoff-package.zip> --route <Continue-from> --pre-takeover minimal-bootstrap-only|none|native-archaeology',
      evidenceBoundary: 'Tooling generates orientation/grounding receipts itself in one-shot mode. Pre-takeover native-host behavior remains caller/host evidence unless the host supplies independent instrumentation.',
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

export function capabilityDiscoveryInput(input = {}) {
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

function requirement(capability, satisfied, meaning, optional = false) {
  return deepFreeze({ capability, satisfied: Boolean(satisfied), optional: Boolean(optional), meaning });
}

export function normalizeIngressKind(value) {
  const normalized = normalizeToken(value).replace(/_/g, '-');
  if (Object.prototype.hasOwnProperty.call(INGRESS_PROFILES, normalized)) return normalized;
  if (['handoff', 'handoff-package', 'routed-handoff'].includes(normalized)) return COLD_START_INGRESS_KINDS.HANDOFF;
  if (['workspace', 'workspace-with-bootstrap'].includes(normalized)) return COLD_START_INGRESS_KINDS.WORKSPACE;
  if (['voice', 'stt', 'capture'].includes(normalized)) return COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE;
  return COLD_START_INGRESS_KINDS.HANDOFF;
}
