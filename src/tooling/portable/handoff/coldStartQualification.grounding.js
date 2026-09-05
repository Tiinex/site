import { discoverPortableHostCapabilities } from '../host/host.capabilities.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import { resolveColdStartRolePointerMaterial } from './coldStartRolePointers.js';
import {
  COLD_START_INGRESS_KINDS,
  PORTABLE_COLD_CONSUMER_GROUNDING_SCHEMA_ID,
  capabilityDiscoveryInput,
  normalizeIngressKind
} from './coldStartQualification.contract.js';
import {
  collectPackageRoleMaterials,
  createColdStartMaterialContext,
  dedupeRoleMaterials,
  emptyHandoffGrounding,
  normalizeRoleMaterials,
  parseHandoffGrounding,
  parseRoleMaterial,
  resolveGroundingRouteMarkdown,
  recipientFactsIndexForColdStart,
  resolveReferencedRoleMaterial,
  selectGroundingRoute
} from './coldStartQualification.materials.js';
import {
  NON_EXECUTION_MODES,
  deepFreeze,
  findFile,
  normalizeAttribution,
  normalizeComparable,
  normalizeInteractionMode,
  normalizeStringList,
  normalizeToken
} from './coldStartQualification.shared.js';

export function groundPortableColdConsumer(input = {}, options = {}) {
  const ingressKind = normalizeIngressKind(input.ingressKind || input.kind || (input.toolingAvailable === false ? COLD_START_INGRESS_KINDS.DEGRADED_CAPTURE : COLD_START_INGRESS_KINDS.HANDOFF));
  const findings = [];
  const materialContext = options.coldStartMaterialContext || createColdStartMaterialContext();
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
      const markdown = resolveGroundingRouteMarkdown(bundle, selectedRoute, findings, materialContext);
      if (markdown) handoff = parseHandoffGrounding(markdown, selectedRoute);
    }
  } else if (input.handoffMarkdown || input.handoff?.markdown) {
    handoff = parseHandoffGrounding(input.handoffMarkdown || input.handoff?.markdown || '', null);
  }

  const bundle = input.bundle || input.package || input;
  const role = groundRecipientRole(input, handoff, bundle, orientation, selectedRoute, findings, materialContext);
  const holderBinding = groundHolderBinding(input, handoff, findings);
  const participation = groundParticipation(input, handoff, bundle, orientation, selectedRoute, findings, materialContext);
  const interaction = groundInteraction(input, handoff);

  if (degradedCapture.active) {
    findings.push(portableFinding('info', 'portable.cold-start.degraded-capture.active', 'This grounding describes a Tooling-unavailable capture boundary; Tooling-dependent mutation and durable semantic claims remain prohibited until later qualification.'));
  }

  const blocked = findings.some((finding) => finding.severity === 'error');
  const degraded = degradedCapture.active || role.state === 'degraded' || holderBinding.state === 'unresolved' || interaction.modeState === 'unresolved' || participation.participantState === 'unresolved';
  return deepFreeze({
    schema: PORTABLE_COLD_CONSUMER_GROUNDING_SCHEMA_ID,
    version: 1,
    status: blocked ? 'blocked' : degraded ? 'degraded' : 'ready',
    ingressKind,
    orientation,
    selectedRoute,
    handoff,
    role,
    holderBinding,
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
    next: Object.freeze({
      qualification: Object.freeze({
        operation: 'qualify-cold-start',
        mode: 'one-shot-package',
        eligible: !blocked,
        groundingStatus: blocked ? 'blocked' : degraded ? 'degraded' : 'ready',
        degradedGroundingBlocksPreferredPath: false,
        cli: 'qualify-cold-start <same-handoff-package.zip> --route <same-Continue-from> --pre-takeover minimal-bootstrap-only|none|native-archaeology',
        externalQualificationSchemaRequired: false,
        separateGroundingCallRequired: false,
        hostEvidenceBoundary: 'Choose the pre-takeover value from the behavior actually observed; portable Tooling does not independently observe native-host actions that happened before Tooling takeover.',
        missingDataBoundary: 'Do not invent host capabilities, interaction mode, participant identity, or Role material merely to remove a degraded grounding state; qualification may proceed whenever grounding is not blocked.'
      })
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings),
    boundary: 'Portable consumer grounding only. Handoff and Role artifacts remain semantic authority; participant identity is never inferred from one transport channel; host/provider projections do not create authority.'
  });
}

function groundRecipientRole(input, handoff, bundle, orientation, selectedRoute, findings, materialContext) {
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
  const referencedMaterial = handoff.toReference ? resolveReferencedRoleMaterial(bundle, handoff, orientation, selectedRoute, findings, materialContext) : null;
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


function groundHolderBinding(input, handoff, findings) {
  const raw = input.holderBinding || input.sessionHolderBinding || input.sessionRoleBinding || {};
  const explicit = typeof raw === 'string' ? { roleLabel: raw } : (raw && typeof raw === 'object' ? raw : {});
  const roleLabel = String(explicit.roleLabel || explicit.role || input.holderRole || input.sessionRole || '').trim();
  const holderId = String(explicit.holderId || explicit.sessionId || explicit.id || input.holderId || '').trim();
  const recipientRoleLabel = String(handoff.to || '').trim();
  const recipientRoleKind = normalizeToken(handoff.toKind || (recipientRoleLabel ? 'role' : ''));
  const roleRecipient = recipientRoleKind === 'role';
  const explicitlySupplied = Boolean(roleLabel || holderId);

  if (!roleRecipient) return deepFreeze({
    state: 'not-applicable',
    holderId,
    roleLabel,
    recipientRoleLabel,
    recipientCompatibility: 'not-applicable',
    source: explicitlySupplied ? 'explicit-input' : 'none',
    explicit: explicitlySupplied,
    inferredFromTransport: false,
    boundary: 'The selected Handoff recipient is not a Role endpoint, so no consuming-session Role holder binding is required or inferred.'
  });

  if (!roleLabel) {
    if (holderId) findings.push(portableFinding('warning', 'portable.cold-start.holder-binding.role-missing', 'A consuming-session holder identifier was supplied without an explicit Role capacity; the holder binding remains unresolved.', { holderId, recipientRole: recipientRoleLabel }));
    return deepFreeze({
      state: 'unresolved',
      holderId,
      roleLabel: '',
      recipientRoleLabel,
      recipientCompatibility: 'unresolved',
      source: explicitlySupplied ? 'explicit-input' : 'none',
      explicit: explicitlySupplied,
      inferredFromTransport: false,
      boundary: 'Recipient Role and consuming-session holder are separate. No holder Role is inferred from route selection, transport identity, provider identity, assistant/user position, or participant declarations.'
    });
  }

  if (recipientRoleLabel && normalizeComparable(roleLabel) !== normalizeComparable(recipientRoleLabel)) {
    findings.push(portableFinding('error', 'portable.cold-start.holder-binding.role-mismatch', 'Explicit consuming-session holder Role does not match the selected Handoff recipient Role.', { holderRole: roleLabel, recipientRole: recipientRoleLabel }));
    return deepFreeze({
      state: 'blocked',
      holderId,
      roleLabel,
      recipientRoleLabel,
      recipientCompatibility: 'mismatch',
      source: 'explicit-input',
      explicit: true,
      inferredFromTransport: false,
      boundary: 'An explicit holder Role mismatch is contradictory and blocks act-ready grounding. Tooling does not relabel the session to make the route fit.'
    });
  }

  return deepFreeze({
    state: 'qualified',
    holderId,
    roleLabel,
    recipientRoleLabel,
    recipientCompatibility: 'matched',
    source: 'explicit-input',
    explicit: true,
    inferredFromTransport: false,
    boundary: 'Explicit consuming-session Role-capacity binding only. This binds the current Tooling invocation/session to the selected recipient Role capacity; it does not prove a human identity, consent, or authority beyond the qualified Handoff/Role/Task boundaries.'
  });
}

function groundParticipation(input, handoff, bundle, orientation, selectedRoute, findings, materialContext) {
  const explicitParticipants = normalizeParticipants(input.participants || input.interaction?.participants || []);
  const packageRoleGrounding = resolvePackageParticipantRoles(bundle, orientation, selectedRoute, findings);
  const participants = dedupeGroundedParticipants(explicitParticipants);
  const contributions = normalizeContributions(input.contributions || input.interaction?.contributions || []);
  const currentContributionId = String(input.currentContributionId || input.interaction?.currentContributionId || '').trim();
  const current = currentContributionId ? contributions.find((entry) => entry.id === currentContributionId) || null : null;
  return deepFreeze({
    participantState: participants.length ? 'declared' : 'unresolved',
    participants: Object.freeze(participants),
    packageRoleParticipants: Object.freeze(packageRoleGrounding),
    packageRoleGrounding: Object.freeze(packageRoleGrounding),
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
    boundary: 'Participants and speakers are explicit semantic declarations. Package-local Role Pointer ancestry is recipient discovery/grounding only and never declares semantic participation. Participation meaning must come from authoritative Handoff/Relation/context authority. One chat/account/transport channel is not treated as one human identity.'
  });
}

function resolvePackageParticipantRoles(bundle = {}, orientation = null, selectedRoute = null, findings = [], materialContext = null) {
  const pointerPaths = selectedRoute?.participantRolePointers || [];
  const out = [];
  for (let index = 0; index < pointerPaths.length; index += 1) {
    const pointerPath = String(pointerPaths[index] || '');
    const pointerFile = findFile(bundle, pointerPath);
    if (!pointerFile) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.pointer.missing', 'Selected Handoff route declares Role grounding Pointer ancestry that is not carried.', { pointerPath })); continue; }
    const compatibilityFacts = recipientV2FactsIndex(bundle).map.get(pointerPath) || null;
    const projectedFacts = (orientation?.participantRoles || []).find((item) => String(item.pointerPath || '') === pointerPath) || null;
    const facts = compatibilityFacts?.role === 'participant-role'
      ? compatibilityFacts
      : projectedFacts
        ? { role: 'participant-role', ...projectedFacts }
        : {};
    if (facts.role !== 'participant-role') { findings.push(portableFinding('error', 'portable.cold-start.participant-role.pointer.invalid', 'Selected route ancestor is not a qualified package-local Role grounding Pointer.', { pointerPath })); continue; }
    const material = resolveParticipantRolePointerMaterial(bundle, facts, findings, pointerPath);
    if (!material) continue;
    const parsed = parseRoleMaterial({ path: material.path, markdown: material.markdown, explicit: false });
    if (!parsed) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.material.invalid', 'Role grounding Pointer target is not one exact tiinex.party.role.v1 artifact.', { pointerPath, target: material.path })); continue; }
    const hint = String(facts.roleLabelHint || '').trim();
    if (hint && parsed.label && normalizeToken(hint) !== normalizeToken(parsed.label)) { findings.push(portableFinding('error', 'portable.cold-start.participant-role.label-mismatch', 'Role grounding Pointer label hint conflicts with the exact carried Role artifact.', { pointerPath, hint, roleLabel: parsed.label })); continue; }
    out.push(deepFreeze({
      id: `package-role-${index + 1}`,
      label: parsed.label || hint || parsed.title,
      identities: Object.freeze([]),
      roles: Object.freeze([parsed.label || hint || parsed.title].filter(Boolean)),
      verification: 'declared',
      transportChannel: '',
      transportChannelIsIdentityProof: false,
      packageDeclared: true,
      groundingOnly: true,
      semanticParticipant: false,
      roleArtifact: Object.freeze({ path: parsed.path, sha256: parsed.sha256, schemaId: parsed.schemaId, roleLabel: parsed.label, roleKind: parsed.roleKind }),
      pointerPath
    }));
  }
  return Object.freeze(out);
}

function resolveParticipantRolePointerMaterial(bundle, facts, findings, pointerPath) {
  return resolveColdStartRolePointerMaterial(bundle, facts, findings, pointerPath, 'participant-role');
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
