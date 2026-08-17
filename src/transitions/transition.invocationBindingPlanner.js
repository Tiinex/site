import { buildCanonicalTransitionAvailability } from './transition.availabilityPlanner.js';
import { buildCanonicalTransitionResultPlan } from './transition.resultSemantics.js';
import {
  hasConcreteInvocationValue,
  immutableInvocationValue,
  invocationBindingPacketCounts,
  normalizeInvocationBindingPacket
} from './transition.invocationBindingPacket.js';

export const TRANSITION_INVOCATION_BINDING_PLAN_SCHEMA_ID = 'tiinex.site.transition-invocation-binding-plan.v1';

const QUALIFICATION_ORDER = Object.freeze(['blocked', 'invalid', 'unresolved', 'incomplete', 'qualified']);
const NONE=Object.freeze([]);

export function buildCanonicalTransitionInvocationBindingPlan(input = {}) {
  const definition = input.definition || {};
  const participantIndex = input.participantIndex || { participants: [] };
  const packet = normalizeInvocationBindingPacket(input.bindingPacket);
  const availability = buildCanonicalTransitionAvailability({
    definition,
    participantIndex,
    currentArtifact: input.currentArtifact
  });
  const resultSemantics = buildCanonicalTransitionResultPlan({ definition });

  if (definition.canonicalReadQualified !== true || availability.availability === 'blocked' || resultSemantics.qualification === 'blocked') {
    return blockedPlan(definition, availability, resultSemantics, packet, 'canonical-read-not-qualified');
  }

  const packetAudit = auditPacketNamespaces(packet, availability, resultSemantics);
  const inputRoleBindings = availability.inputRoles.map((role) => planInputRoleBinding({
    role,
    entries: packet.inputRoles.filter((entry) => entry.role === role.name),
    participantIndex,
    currentContext: availability.context
  }));
  const destinationBindings = resultSemantics.destinationBindings.map((destination) => planDestinationBinding(
    destination,
    packet.destinations.filter((entry) => entry.name === destination.name)
  ));
  const namingBindings = resultSemantics.outputPlacements.map((placement) => planNamingBinding(
    placement,
    packet.naming.filter((entry) => entry.placement === placement.name)
  ));
  const boundMembers = boundInputMemberIndex(inputRoleBindings);
  const memberAssociations = planMemberAssociations({
    resultSemantics,
    entries: packet.memberAssociations,
    boundMembers
  });

  const reasonsByState = collectReasonsByState({
    packetAudit,
    inputRoleBindings,
    destinationBindings,
    namingBindings,
    memberAssociations,
    availability,
    resultSemantics
  });
  const qualification = dominantQualification(reasonsByState);

  return Object.freeze({
    schema: TRANSITION_INVOCATION_BINDING_PLAN_SCHEMA_ID,
    definition: Object.freeze({ ...(availability.definition || resultSemantics.definition || {}) }),
    qualification,
    reasons: Object.freeze(flattenReasons(reasonsByState)),
    reasonsByState,
    packetAudit,
    inputRoleBindings: Object.freeze(inputRoleBindings),
    destinationBindings: Object.freeze(destinationBindings),
    namingBindings: Object.freeze(namingBindings),
    memberAssociations: Object.freeze(memberAssociations),
    availability: availabilitySummary(availability),
    resultSemantics: resultSummary(resultSemantics),
    currentArtifactContext: availability.context,
    readOnly: true,
    mutation: false,
    networkFetch: false,
    generation: false,
    pathResolution: false,
    materialization: false,
    parentMutation: false,
    relationMaterialization: false,
    execution: false,
    executable: false
  });
}

function planInputRoleBinding({ role, entries, participantIndex, currentContext }) {
  const suppliedEntryCount = entries.length;
  const duplicateEntry = suppliedEntryCount > 1;
  const entry = entries[0] || null;
  const members = entry ? entry.members : [];
  const reasons = [];
  let state = 'resolved';

  if (duplicateEntry) {
    state = 'invalid';
    reasons.push('duplicate-role-binding-entry');
  }

  const cardinalityState = roleCardinalityState(role, members.length);
  if (state !== 'invalid' && cardinalityState.state !== 'resolved') {
    state = cardinalityState.state;
    reasons.push(...cardinalityState.reasons);
  }

  const optionalUnbound = members.length === 0
    && role.cardinality?.minimum?.kind === 'numeric'
    && role.cardinality.minimum.value === 0;
  const memberPlans = members.map((member, index) => planRoleMember({ role, member, participantIndex, index }));
  const bindingIds = memberPlans.map((member) => member.bindingId).filter(Boolean);
  if (state !== 'invalid' && new Set(bindingIds).size !== bindingIds.length) {
    state = 'invalid';
    reasons.push('duplicate-member-binding-id');
  }
  const memberState = dominantSubplanState(memberPlans);

  if (state !== 'invalid' && memberState !== 'resolved') {
    state = strongerBindingState(state, memberState);
    reasons.push(...memberPlans.flatMap((member) => member.reasons));
  }

  if (state !== 'invalid' && !optionalUnbound) {
    const semanticState = roleSemanticBindingState(role, members.length);
    if (semanticState.state !== 'resolved') {
      state = strongerBindingState(state, semanticState.state);
      reasons.push(...semanticState.reasons);
    }
  }

  if (state === 'resolved' && optionalUnbound) reasons.push('optional-role-unbound');
  if (state === 'resolved' && members.length === 0 && role.cardinality?.minimum?.value > 0) {
    state = 'incomplete';
    reasons.push('required-role-binding-missing');
  }

  return Object.freeze({
    role: role.name,
    targetKind: role.targetKind,
    effectiveParticipantKind: role.effectiveParticipantKind,
    participantClassification: role.participantClassification,
    schemaConstraint: role.schemaConstraint,
    schemaConstraintQualification: role.schemaConstraintQualification,
    acquisitionPolicy: role.acquisitionPolicy,
    participation: role.participation,
    cardinality: role.cardinality,
    cleanCandidateIds: Object.freeze([...(role.cleanCandidateIds || [])]),
    currentArtifactCandidate: Boolean(currentContext?.candidateRoleIds?.includes(role.name)),
    autoSelected: false,
    suppliedEntryCount,
    suppliedMemberCount: members.length,
    state,
    reasons: Object.freeze(unique(reasons)),
    members: Object.freeze(memberPlans)
  });
}
function roleCardinalityState(role, count) {
  const minimum = role.cardinality?.minimum || {};
  const maximum = role.cardinality?.maximum || {};
  if (minimum.kind !== 'numeric') return { state: 'unresolved', reasons: ['minimum-count-unresolved'] };
  if (!['numeric', 'unbounded'].includes(maximum.kind)) return { state: 'unresolved', reasons: ['maximum-count-unresolved'] };
  if (maximum.kind === 'numeric' && count > maximum.value) return { state: 'invalid', reasons: ['maximum-count-exceeded'] };
  if (count < minimum.value) return { state: 'incomplete', reasons: ['minimum-count-not-satisfied'] };
  return { state: 'resolved', reasons: [] };
}
function roleSemanticBindingState(role, count) {
  if (role.participation === 'unresolved') return { state: 'unresolved', reasons: ['role-condition-not-evaluated'] };
  if (!role.effectiveParticipantKind) return { state: 'unresolved', reasons: ['participant-classification-unresolved'] };
  if (role.schemaConstraint && role.schemaConstraintQualification !== 'resolved') return { state: 'unresolved', reasons: ['schema-constraint-authority-unresolved'] };
  if (role.effectiveParticipantKind === 'non-artifact' && role.acquisitionPolicy !== 'invocation-provided') {
    const reason = NON_ARTIFACT_REASONS[role.acquisitionPolicy] || 'acquisition-policy-unresolved';
    return { state: 'unresolved', reasons: [reason] };
  }
  if (role.acquisitionPolicy === 'create-only') return { state: 'unresolved', reasons: ['unresolved-needs-producing-transition'] };
  if (role.acquisitionPolicy === 'existing-or-create' && count === 0 && role.availability === 'unresolved-needs-producing-transition') {
    return { state: 'unresolved', reasons: ['unresolved-needs-producing-transition'] };
  }
  if (role.acquisitionPolicy === 'derived') return { state: 'unresolved', reasons: ['derivation-not-evaluated'] };
  if (role.acquisitionPolicy === 'unknown') return { state: 'unresolved', reasons: ['acquisition-policy-unknown'] };
  return { state: 'resolved', reasons: [] };
}

const NON_ARTIFACT_REASONS = {
  'existing-only': 'non-artifact-existing-authority-unavailable',
  'existing-or-create': 'unresolved-needs-producing-transition',
  'create-only': 'unresolved-needs-producing-transition',
  derived: 'derivation-not-evaluated',
  unknown: 'acquisition-policy-unknown'
};
function planRoleMember({ role, member, participantIndex, index }) {
  const bindingId = token(member?.bindingId);
  if (role.effectiveParticipantKind === 'artifact') {
    const participantId = token(member?.participantId);
    if (!participantId) return memberPlan(index, bindingId, 'invalid', ['participant-id-required'], { participantId: '' });
    const matches = (participantIndex.participants || []).filter((participant) => participant.identity?.id === participantId);
    if (matches.length === 0) return memberPlan(index, bindingId, 'unresolved', ['participant-identity-not-loaded'], { participantId });
    if (matches.length !== 1) return memberPlan(index, bindingId, 'unresolved', ['participant-identity-ambiguous'], { participantId });
    const participant = matches[0];
    if (!participant.cleanCandidate) return memberPlan(index, bindingId, 'unresolved', ['participant-authority-not-clean'], { participantId });
    if (role.schemaConstraint && role.schemaConstraintQualification !== 'resolved') {
      return memberPlan(index, bindingId, 'unresolved', ['schema-constraint-authority-unresolved'], { participantId });
    }
    if (role.schemaConstraint && participant.candidateSchemaId !== role.schemaConstraint) {
      return memberPlan(index, bindingId, 'invalid', ['participant-schema-mismatch'], {
        participantId,
        candidateSchemaId: participant.candidateSchemaId
      });
    }
    return memberPlan(index, bindingId, 'resolved', [], {
      participantId,
      candidateSchemaId: participant.candidateSchemaId,
      participantIdentityKey: participant.identity?.key || ''
    });
  }

  if (role.effectiveParticipantKind === 'non-artifact') {
    if (!hasConcreteInvocationValue(member)) return memberPlan(index, bindingId, 'incomplete', ['opaque-value-missing'], {});
    return memberPlan(index, bindingId, 'resolved', [], { value: immutableInvocationValue(member.value) });
  }

  return memberPlan(index, bindingId, 'unresolved', ['participant-classification-unresolved'], {});
}
function memberPlan(index, bindingId, state, reasons, data) {
  return Object.freeze({ index, bindingId, state, reasons: Object.freeze(reasons), ...data });
}
function planDestinationBinding(destination, entries) {
  const duplicate = entries.length > 1;
  const entry = entries[0] || null;
  const reasons = [];
  let state = 'resolved';
  if (duplicate) {
    state = 'invalid';
    reasons.push('duplicate-destination-binding-entry');
  } else if (destination.requiredQualification?.state === 'unresolved') {
    state = 'unresolved';
    reasons.push('destination-requiredness-unresolved');
  } else if (destination.requiredQualification?.state === 'required' && (!entry || !entry.hasValue)) {
    state = 'incomplete';
    reasons.push(entry ? 'required-destination-value-missing' : 'required-destination-binding-missing');
  }
  return Object.freeze({
    name: destination.name,
    requiredQualification: destination.requiredQualification,
    placementCoverage: destination.placementCoverage,
    suppliedEntryCount: entries.length,
    state,
    reasons: Object.freeze(reasons),
    value: entry ? immutableInvocationValue(entry.value) : undefined,
  });
}
function planNamingBinding(placement, entries) {
  const authority = token(placement.namingAuthority);
  const duplicate = entries.length > 1;
  const entry = entries[0] || null;
  const reasons = [];
  let state = 'resolved';
  if (duplicate) {
    state = 'invalid';
    reasons.push('duplicate-naming-binding-entry');
  } else if (authority === 'explicit-binding' && (!entry || !entry.hasValue)) {
    state = 'incomplete';
    reasons.push(entry ? 'explicit-naming-value-missing' : 'explicit-naming-binding-missing');
  } else if (authority !== 'explicit-binding' && entry) {
    state = 'invalid';
    reasons.push('caller-naming-binding-not-authorized');
  }
  return Object.freeze({
    placement: placement.name,
    outputBinding: placement.outputBinding,
    namingAuthority: authority,
    explicitOverrideAllowed: placement.explicitOverrideAllowed,
    suppliedEntryCount: entries.length,
    state,
    reasons: Object.freeze(reasons),
    value: entry ? immutableInvocationValue(entry.value) : undefined,
    concretePath: null,
    pathQualification: 'not-evaluated'
  });
}
function planMemberAssociations({ resultSemantics, entries, boundMembers }) {
  const requirements = mappingRequirements(resultSemantics);
  const entryGroups = new Map();
  for (const entry of entries) {
    const key = `${entry.group}\u0000${entry.effect}`;
    if (!entryGroups.has(key)) entryGroups.set(key, []);
    entryGroups.get(key).push(entry);
  }
  return requirements.map((requirement) => {
    const key = `${requirement.group}\u0000${requirement.effect}`;
    const supplied = entryGroups.get(key) || [];
    if (requirement.mapping !== 'explicit-at-invocation') {
      const open = ['custom', 'unknown'].includes(requirement.mapping);
      const state = supplied.length ? 'invalid' : open ? 'unresolved' : 'deferred';
      const why = supplied.length ? 'association-input-not-authorized-for-mapping' : open ? `${requirement.mapping}-mapping-not-evaluated` : 'concrete-mapping-not-evaluated';
      return Object.freeze({ ...requirement, suppliedEntryCount: supplied.length, state, reasons: Object.freeze([why]), associations: NONE, positionalInference: false });
    }
    if (supplied.length > 1) {
      return Object.freeze({ ...requirement, suppliedEntryCount: supplied.length, state: 'invalid', reasons: Object.freeze(['duplicate-member-association-entry']), associations: NONE, positionalInference: false });
    }
    if (!supplied.length) {
      return Object.freeze({ ...requirement, suppliedEntryCount: 0, state: 'incomplete', reasons: Object.freeze(['explicit-member-association-missing']), associations: NONE, positionalInference: false });
    }
    const associationPlans = supplied[0].associations.map((association, index) => planAssociation(association, index, requirement.roleNames, resultSemantics, boundMembers));
    const substate = dominantSubplanState(associationPlans);
    return Object.freeze({
      ...requirement,
      suppliedEntryCount: 1,
      state: substate,
      reasons: Object.freeze(unique(associationPlans.flatMap((association) => association.reasons))),
      associations: Object.freeze(associationPlans),
      positionalInference: false
    });
  });
}
function mappingRequirements(resultSemantics) {
  const requirements = [];
  const add = (group, effects, bindingKeys) => {
    for (const effect of effects || []) {
      const mapping = effect.memberMapping?.declared || '';
      if (!mapping) continue;
      const roleNames = unique(bindingKeys.map((key) => effect[key]?.resolvedName).filter(Boolean));
      requirements.push(Object.freeze({ group, effect: effect.name, mapping, roleNames: Object.freeze(roleNames) }));
    }
  };
  add('lifecycle', resultSemantics.lifecycleEffects, ['targetBinding', 'resultBinding']);
  add('parent', resultSemantics.parentEffects, ['outputBinding', 'parentBinding']);
  add('relation', resultSemantics.relationEffects, ['subjectBinding', 'objectBinding']);
  return requirements;
}
function planAssociation(association, index, allowedRoleNames, resultSemantics, boundMembers) {
  const from = planAssociationEndpoint(association?.from, allowedRoleNames, resultSemantics, boundMembers);
  const to = planAssociationEndpoint(association?.to, allowedRoleNames, resultSemantics, boundMembers);
  const states = [from.state, to.state];
  const state = states.includes('invalid') ? 'invalid' : states.includes('unresolved') || states.includes('deferred') ? 'unresolved' : 'resolved';
  return Object.freeze({ index, from, to, state, reasons: Object.freeze(unique([...from.reasons, ...to.reasons])) });
}
function planAssociationEndpoint(endpoint, allowedRoleNames, resultSemantics, boundMembers) {
  const role = token(endpoint?.role);
  const suppliedMemberId = token(endpoint?.memberId);
  if (!role || !allowedRoleNames.includes(role)) return endpointPlan(role, suppliedMemberId, 'invalid', 'association-role-not-owned-by-effect');
  if ((resultSemantics.outputRoles || []).some((output) => output.name === role)) return endpointPlan(role, suppliedMemberId, 'deferred', 'output-member-not-created');
  if (!suppliedMemberId) return endpointPlan(role, '', 'invalid', 'association-member-id-required');
  const binding = boundMembers.get(role);
  if (!binding?.ids.has(suppliedMemberId)) {
    const state = binding?.state === 'unresolved' ? 'unresolved' : 'invalid';
    return endpointPlan(role, suppliedMemberId, state, state === 'unresolved' ? 'association-member-role-unresolved' : 'association-member-not-bound');
  }
  return endpointPlan(role, suppliedMemberId, 'resolved', '', suppliedMemberId);
}
function endpointPlan(role, suppliedMemberId, state, reason, resolvedMemberId = '') {
  return Object.freeze({ role, suppliedMemberId, resolvedMemberId, state, reasons: Object.freeze(reason ? [reason] : []) });
}
function boundInputMemberIndex(rolePlans) {
  return new Map(rolePlans.map((role) => [role.role, {
    state: role.state,
    ids: new Set(['resolved', 'incomplete'].includes(role.state) ? role.members.filter((member) => member.state === 'resolved' && member.bindingId).map((member) => member.bindingId) : [])
  }]));
}
function auditPacketNamespaces(packet, availability, resultSemantics) {
  const roleNames = new Set((availability.inputRoles || []).map((role) => role.name));
  const destinationNames = new Set((resultSemantics.destinationBindings || []).map((destination) => destination.name));
  const placementNames = new Set((resultSemantics.outputPlacements || []).map((placement) => placement.name));
  const effectKeys = new Set(mappingRequirements(resultSemantics).map((requirement) => `${requirement.group}\u0000${requirement.effect}`));
  const findings = [];
  for (const entry of packet.inputRoles) if (!roleNames.has(entry.role)) findings.push(finding('invalid', 'unknown-input-role-binding', entry.role));
  for (const entry of packet.destinations) if (!destinationNames.has(entry.name)) findings.push(finding('invalid', 'unknown-destination-binding', entry.name));
  for (const entry of packet.naming) if (!placementNames.has(entry.placement)) findings.push(finding('invalid', 'unknown-naming-placement', entry.placement));
  for (const entry of packet.memberAssociations) if (!effectKeys.has(`${entry.group}\u0000${entry.effect}`)) findings.push(finding('invalid', 'unknown-member-association-effect', `${entry.group}:${entry.effect}`));
  return Object.freeze({ findings: Object.freeze(findings), supplied: invocationBindingPacketCounts(packet) });
}
function collectReasonsByState({ packetAudit, inputRoleBindings, destinationBindings, namingBindings, memberAssociations, availability, resultSemantics }) {
  const buckets = { blocked: [], invalid: [], unresolved: [], incomplete: [] };
  for (const finding of packetAudit.findings) buckets[finding.state].push(`${finding.code}:${finding.subject}`);
  collectSubplanReasons(buckets, 'input', inputRoleBindings, 'role');
  collectSubplanReasons(buckets, 'destination', destinationBindings, 'name');
  collectSubplanReasons(buckets, 'naming', namingBindings, 'placement');
  collectSubplanReasons(buckets, 'mapping', memberAssociations, 'effect');
  if (availability.transitionApplicability?.conditionQualification?.state === 'unresolved') {
    buckets.unresolved.push('transition-condition-not-evaluated');
  }
  if (resultSemantics.qualification === 'unresolved') {
    for (const reason of resultSemantics.reasons || ['result-semantics-unresolved']) buckets.unresolved.push(`result:${reason}`);
  }
  return Object.freeze(Object.fromEntries(Object.entries(buckets).map(([state, reasons]) => [state, Object.freeze(unique(reasons))])));
}

function collectSubplanReasons(buckets, prefix, plans, key) {
  for (const plan of plans) {
    const state = normalizeBindingState(plan.state);
    if (state === 'qualified') continue;
    for (const reason of plan.reasons || [state]) buckets[state].push(`${prefix}:${plan[key] || ''}:${reason}`);
  }
}

function normalizeBindingState(state) {
  if (state === 'resolved' || state === 'satisfied' || state === 'deferred') return 'qualified';
  if (state === 'unresolved-needs-producing-transition') return 'unresolved';
  return ['invalid', 'unresolved', 'incomplete', 'blocked'].includes(state) ? state : 'unresolved';
}
function dominantQualification(reasonsByState) {
  return QUALIFICATION_ORDER.find((state) => state === 'qualified' || reasonsByState[state]?.length) || 'qualified';
}
function dominantSubplanState(plans) {
  const states = plans.map((plan) => plan.state);
  if (states.includes('invalid')) return 'invalid';
  if (states.includes('unresolved') || states.includes('deferred')) return 'unresolved';
  if (states.includes('incomplete')) return 'incomplete';
  return 'resolved';
}
function strongerBindingState(left, right) {
  const order = ['invalid', 'unresolved', 'incomplete', 'resolved'];
  return order.indexOf(left) <= order.indexOf(right) ? left : right;
}
function availabilitySummary(availability) {
  return Object.freeze({
    availability: availability.availability,
    roleBasedAvailability: availability.roleBasedAvailability,
    transitionApplicability: availability.transitionApplicability,
    discoverable: availability.discoverable,
    executable: false
  });
}
function resultSummary(result) {
  return Object.freeze({ qualification: result.qualification, reasons: Object.freeze([...(result.reasons || [])]), executable: false });
}

function blockedPlan(definition, availability, resultSemantics, packet, reason) {
  const identity = availability.definition || resultSemantics.definition || Object.freeze({
    canonicalIdentifier: String(definition?.transitionIdentity?.['Canonical Identifier'] || ''),
    name: String(definition?.transitionIdentity?.Name || '')
  });
  return Object.freeze({
    schema: TRANSITION_INVOCATION_BINDING_PLAN_SCHEMA_ID,
    definition: identity,
    qualification: 'blocked',
    reasons: Object.freeze([reason]),
    reasonsByState: Object.freeze({ blocked: Object.freeze([reason]), invalid: NONE, unresolved: NONE, incomplete: NONE }),
    packetAudit: Object.freeze({ findings: NONE, supplied: invocationBindingPacketCounts(packet) }),
    inputRoleBindings: NONE,
    destinationBindings: NONE,
    namingBindings: NONE,
    memberAssociations: NONE,
    availability: availabilitySummary(availability),
    resultSemantics: resultSummary(resultSemantics),
    currentArtifactContext: availability.context || Object.freeze({ assignment: 'not-required', candidateRoleIds: NONE, unresolvedRoleIds: NONE }),
    readOnly: true,
    mutation: false,
    networkFetch: false,
    generation: false,
    pathResolution: false,
    materialization: false,
    parentMutation: false,
    relationMaterialization: false,
    execution: false,
    executable: false
  });
}


function finding(state, code, subject) { return Object.freeze({ state, code, subject }); }
function token(value = '') { return String(value || '').trim(); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function flattenReasons(reasonsByState) {
  return QUALIFICATION_ORDER.filter((state) => state !== 'qualified').flatMap((state) => reasonsByState[state].map((reason) => `${state}:${reason}`));
}
