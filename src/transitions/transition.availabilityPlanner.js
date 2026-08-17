import { TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID } from './transition.definitionRegistry.js';
import { CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID } from './transition.legacyShorthand.js';
import { participantMatchesSchema } from '../artifacts/artifact.participantIndex.js';
import {
  roleParticipantClassification,
  participantClassificationUsable,
  participantClassificationReason,
  schemaRestrictionUsable,
  schemaRestrictionUnresolved,
  planTransitionApplicability,
  emptyTransitionApplicability,
  planCurrentArtifactContext
} from './transition.availabilitySemantics.js';

export const TRANSITION_AVAILABILITY_PLAN_SCHEMA_ID = 'tiinex.site.transition-availability-plan.v1';
export const TRANSITION_AVAILABILITY_SCHEMA_ID = 'tiinex.site.transition-availability.v1';

export function buildCanonicalTransitionAvailabilityPlan(input = {}) {
  const participantIndex = input.participantIndex || { participants: [] };
  const definitions = canonicalDefinitions(input.definitions || input.registry?.definitions || []);
  const transitions = definitions
    .map((definition) => buildCanonicalTransitionAvailability({
      definition,
      participantIndex,
      currentArtifact: input.currentArtifact
    }))
    .sort(compareAvailability);
  return Object.freeze({
    schema: TRANSITION_AVAILABILITY_PLAN_SCHEMA_ID,
    count: transitions.length,
    transitions: Object.freeze(transitions),
    boundary: Object.freeze({ readOnly: true, executable: false, mutation: false, networkFetch: false })
  });
}

export function buildCanonicalTransitionAvailability(input = {}) {
  const definition = input.definition || {};
  const participantIndex = input.participantIndex || { participants: [] };
  if (!isCanonicalDefinitionReadModel(definition)) return blockedAvailability(definition, 'definition-not-canonical-read-model');
  if (definition.canonicalReadQualified !== true) return blockedAvailability(definition, 'canonical-read-not-qualified');

  const roles = activeInputRoleDeclarations(definition.inputRoles || []);
  const rolePlans = roles.map((role) => planInputRole(role, participantIndex));
  const context = planCurrentArtifactContext(input.currentArtifact, participantIndex, roles);
  const destinationRequirements = planDestinationRequirements(definition.destinationBindings || []);
  const roleBasedAvailability = overallAvailability(rolePlans);
  const transitionApplicability = planTransitionApplicability(definition);
  const availability = transitionApplicability.conditionQualification.state === 'unresolved'
    ? 'unresolved'
    : roleBasedAvailability;
  const invocationInputQualification = combineInvocationInputQualification(rolePlans, destinationRequirements);
  const invocationRequirements = collectInvocationRequirements(rolePlans, destinationRequirements);

  return Object.freeze({
    schema: TRANSITION_AVAILABILITY_SCHEMA_ID,
    definition: definitionIdentity(definition),
    readOnly: true,
    mutation: false,
    networkFetch: false,
    availability,
    roleBasedAvailability,
    transitionApplicability,
    discoverable: availability !== 'blocked',
    executable: false,
    executionReason: 'read-only canonical availability planning; transition execution is not authorized',
    invocationInputRequired: invocationInputQualification.state === 'required',
    invocationInputQualification,
    invocationRequirements: Object.freeze(invocationRequirements),
    inputRoles: Object.freeze(rolePlans),
    destinationRequirements: Object.freeze(destinationRequirements),
    context,
    definitionDiagnostics: Object.freeze([...(definition.diagnostics || [])])
  });
}

function planInputRole(role = {}, participantIndex = {}) {
  const fields = role.fields || {};
  const minimum = parseMinimum(fields['Minimum Count']);
  const maximum = parseMaximum(fields['Maximum Count']);
  const participantClassification = roleParticipantClassification(role);
  const targetKind = participantClassification.declared;
  const effectiveParticipantKind = participantClassification.effective;
  const schemaConstraint = schemaToken(fields['Schema Constraint']);
  const schemaConstraintQualification = participantClassification.schemaConstraint.qualification;
  const acquisitionPolicy = token(fields['Acquisition Policy']);
  const condition = token(fields.Condition);
  const conditionReference = token(fields['Condition Reference']);
  const participation = condition || conditionReference ? 'unresolved' : 'active';
  const participants = Array.isArray(participantIndex.participants) ? participantIndex.participants : [];
  const inspectableMatches = effectiveParticipantKind === 'artifact'
    ? participants.filter((participant) => participantCouldMatchSchema(participant, schemaConstraint))
    : [];
  const cleanCandidates = effectiveParticipantKind === 'artifact' && schemaRestrictionUsable(schemaConstraint, schemaConstraintQualification)
    ? participants.filter((participant) => participantMatchesSchema(participant, schemaConstraint))
    : [];
  const requiredQualification = roleRequiredQualification(minimum);
  const required = requiredQualification.state === 'required';
  const evaluation = evaluateRole({
    targetKind,
    effectiveParticipantKind,
    participantClassification,
    schemaConstraint,
    schemaConstraintQualification,
    acquisitionPolicy,
    participation,
    minimum,
    cleanCandidateCount: cleanCandidates.length,
    required,
    requiredQualification,
    maximum
  });

  return Object.freeze({
    name: String(role.name || ''),
    meaning: token(fields.Meaning),
    minimumCount: minimum.raw,
    maximumCount: maximum.raw,
    cardinality: Object.freeze({ minimum, maximum }),
    targetKind,
    effectiveParticipantKind,
    participantClassification,
    schemaConstraint,
    schemaConstraintQualification,
    acquisitionPolicy,
    condition,
    conditionReference,
    selectionNotes: token(fields['Selection Notes']),
    participation,
    required,
    requiredQualification,
    availability: evaluation.availability,
    invocationInputRequired: evaluation.invocationInputQualification.state === 'required',
    invocationInputQualification: evaluation.invocationInputQualification,
    requirementKind: evaluation.requirementKind,
    cleanCandidateCount: cleanCandidates.length,
    cleanCandidateIds: Object.freeze(cleanCandidates.map((participant) => participant.identity.id)),
    inspectableMatchingParticipantIds: Object.freeze(inspectableMatches.map((participant) => participant.identity.id)),
    maximumSelectionConstraint: maximum.kind === 'numeric' ? maximum.value : maximum.raw,
    reasons: Object.freeze(evaluation.reasons)
  });
}

function evaluateRole(input = {}) {
  const reasons = [];
  if (input.participation === 'unresolved') {
    reasons.push('role-condition-not-evaluated');
    return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'condition', reasons);
  }
  if (input.minimum.kind === 'unknown') {
    reasons.push('minimum-count-unknown');
    return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'cardinality', reasons);
  }
  if (input.maximum.kind === 'unknown') {
    reasons.push('maximum-count-unknown');
    return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'cardinality', reasons);
  }
  if (!participantClassificationUsable(input.participantClassification)) {
    reasons.push(participantClassificationReason(input.participantClassification));
    return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'participant-kind', reasons);
  }
  if (schemaRestrictionUnresolved(input.schemaConstraint, input.schemaConstraintQualification)) {
    reasons.push('schema-constraint-authority-unresolved');
    return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'schema-restriction', reasons);
  }
  if (input.effectiveParticipantKind === 'non-artifact') return evaluateNonArtifactRole(input, reasons);
  if (input.effectiveParticipantKind !== 'artifact') {
    reasons.push('participant-kind-unrecognized');
    return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'participant-kind', reasons);
  }
  return evaluateArtifactRole(input, reasons);
}

function evaluateArtifactRole(input, reasons) {
  const enoughExisting = input.cleanCandidateCount >= numericMinimum(input.minimum);
  switch (input.acquisitionPolicy) {
    case 'existing-only':
      if (enoughExisting) return roleEvaluation('available', invocationQualification('not-required'), 'existing-artifact', reasons);
      reasons.push('insufficient-clean-loaded-artifacts');
      return roleEvaluation('unavailable-current-index', invocationQualification('not-required'), 'existing-artifact', reasons);
    case 'existing-or-create':
      if (enoughExisting) return roleEvaluation('available', invocationQualification('not-required'), 'existing-artifact', reasons);
      reasons.push('producing-transition-required');
      return roleEvaluation('unresolved-needs-producing-transition', invocationQualification('not-required'), 'producing-transition', reasons);
    case 'create-only':
      reasons.push('producing-transition-required');
      return roleEvaluation('unresolved-needs-producing-transition', invocationQualification('not-required'), 'producing-transition', reasons);
    case 'invocation-provided':
      reasons.push('explicit-invocation-binding-required');
      return roleEvaluation('available', roleInvocationInputQualification(input), 'invocation-artifact', reasons);
    case 'derived':
      reasons.push('derivation-not-evaluated');
      return roleEvaluation('unresolved', invocationQualification('not-required'), 'derived', reasons);
    case 'unknown':
      reasons.push('acquisition-policy-unknown');
      return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'acquisition', reasons);
    case '':
      if (enoughExisting) return roleEvaluation('available', invocationQualification('not-required'), 'existing-artifact-unprescribed', reasons);
      if (!input.required) return roleEvaluation('available', invocationQualification('not-required'), 'optional-unprescribed', reasons);
      reasons.push('required-role-acquisition-unprescribed');
      return roleEvaluation('unresolved', invocationQualification('unresolved'), 'acquisition-unprescribed', reasons);
    default:
      reasons.push('acquisition-policy-unrecognized');
      return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'acquisition', reasons);
  }
}

function evaluateNonArtifactRole(input, reasons) {
  switch (input.acquisitionPolicy) {
    case 'invocation-provided':
      reasons.push('non-artifact-invocation-input-required');
      return roleEvaluation('available', roleInvocationInputQualification(input), 'invocation-non-artifact', reasons);
    case 'derived':
      reasons.push('non-artifact-derivation-not-evaluated');
      return roleEvaluation('unresolved', invocationQualification('not-required'), 'derived', reasons);
    case 'create-only':
    case 'existing-or-create':
      reasons.push('producing-transition-required');
      return roleEvaluation('unresolved-needs-producing-transition', invocationQualification('not-required'), 'producing-transition', reasons);
    case 'existing-only':
      reasons.push('non-artifact-existing-binding-not-indexed');
      return roleEvaluation(input.required ? 'unresolved' : 'available', invocationQualification('not-required'), 'non-artifact-existing', reasons);
    case 'unknown':
      reasons.push('acquisition-policy-unknown');
      return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'acquisition', reasons);
    case '':
      if (!input.required) return roleEvaluation('available', invocationQualification('not-required'), 'optional-unprescribed', reasons);
      reasons.push('required-non-artifact-acquisition-unprescribed');
      return roleEvaluation('unresolved', invocationQualification('unresolved'), 'acquisition-unprescribed', reasons);
    default:
      reasons.push('acquisition-policy-unrecognized');
      return roleEvaluation('unresolved', roleInvocationInputQualification(input), 'acquisition', reasons);
  }
}


function planDestinationRequirements(bindings = []) {
  return bindings
    .filter((binding) => String(binding?.name || '').trim().toLowerCase() !== 'none')
    .map((binding) => {
      const fields = binding.fields || {};
      const required = token(fields.Required);
      return Object.freeze({
        name: String(binding.name || ''),
        meaning: token(fields.Meaning),
        required,
        destinationKind: token(fields['Destination Kind']),
        capabilityRequirement: token(fields['Capability Requirement']),
        notes: token(fields.Notes),
        invocationInputRequired: required === 'yes',
        invocationInputQualification: destinationInvocationInputQualification(required),
        resolution: 'not-evaluated'
      });
    });
}

function collectInvocationRequirements(rolePlans, destinations) {
  const requirements = [];
  for (const role of rolePlans) {
    const state = role.invocationInputQualification?.state || 'unresolved';
    if (state === 'not-required') continue;
    requirements.push(Object.freeze({ kind: 'input-role', role: role.name, requirementKind: role.requirementKind, targetKind: role.targetKind, effectiveParticipantKind: role.effectiveParticipantKind, state }));
  }
  for (const destination of destinations) {
    const state = destination.invocationInputQualification?.state || 'unresolved';
    if (state === 'not-required') continue;
    requirements.push(Object.freeze({ kind: 'destination', destination: destination.name, requirementKind: 'destination-binding', state }));
  }
  return requirements;
}

function combineInvocationInputQualification(rolePlans = [], destinations = []) {
  const states = [
    ...rolePlans.map((role) => role.invocationInputQualification?.state || 'unresolved'),
    ...destinations.map((destination) => destination.invocationInputQualification?.state || 'unresolved')
  ];
  if (states.includes('required')) return invocationQualification('required');
  if (states.includes('unresolved')) return invocationQualification('unresolved');
  return invocationQualification('not-required');
}

function overallAvailability(rolePlans = []) {
  const applicabilityRelevant = rolePlans.filter((role) => role.requiredQualification?.state !== 'not-required');
  if (applicabilityRelevant.some((role) => role.availability === 'unavailable-current-index')) return 'unavailable-current-index';
  if (applicabilityRelevant.some((role) => role.availability === 'unresolved' || role.availability === 'unresolved-needs-producing-transition')) return 'unresolved';
  return 'available';
}

function blockedAvailability(definition, reason) {
  return Object.freeze({
    schema: TRANSITION_AVAILABILITY_SCHEMA_ID,
    definition: definitionIdentity(definition),
    readOnly: true,
    mutation: false,
    networkFetch: false,
    availability: 'blocked',
    roleBasedAvailability: 'blocked',
    transitionApplicability: emptyTransitionApplicability('blocked'),
    discoverable: false,
    executable: false,
    executionReason: 'definition is not qualified for canonical availability evaluation',
    invocationInputRequired: false,
    invocationInputQualification: invocationQualification('unresolved'),
    invocationRequirements: Object.freeze([]),
    inputRoles: Object.freeze([]),
    destinationRequirements: Object.freeze([]),
    context: Object.freeze({ provided: false, candidateRoleIds: Object.freeze([]), assignment: 'none', artifactContextCandidate: false }),
    definitionDiagnostics: Object.freeze([...(definition?.diagnostics || [])]),
    reasons: Object.freeze([reason])
  });
}

function canonicalDefinitions(definitions = []) { return definitions.filter(isCanonicalDefinitionReadModel); }
function isCanonicalDefinitionReadModel(definition = {}) {
  return definition?.schema === TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID
    && definition?.artifact?.schemaId === CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID;
}
function activeInputRoleDeclarations(roles = []) {
  if (roles.length === 1 && String(roles[0]?.name || '').trim().toLowerCase() === 'none') return [];
  return roles.filter((role) => String(role?.name || '').trim().toLowerCase() !== 'none');
}
function participantCouldMatchSchema(participant = {}, schemaConstraint = '') {
  if (!participant?.indexedReadable) return false;
  if (!schemaConstraint) return true;
  return (participant.schemaQualification?.declaredSchemaIds || []).includes(schemaConstraint);
}
function parseMinimum(value) {
  const raw = token(value);
  if (raw === 'unknown') return Object.freeze({ raw, kind: 'unknown', value: null });
  if (/^(0|[1-9]\d*)$/.test(raw)) return Object.freeze({ raw, kind: 'numeric', value: Number(raw) });
  return Object.freeze({ raw, kind: raw ? 'invalid' : 'absent', value: null });
}
function parseMaximum(value) {
  const raw = token(value);
  if (raw === 'unknown') return Object.freeze({ raw, kind: 'unknown', value: null });
  if (raw === 'unbounded') return Object.freeze({ raw, kind: 'unbounded', value: null });
  if (/^(0|[1-9]\d*)$/.test(raw)) return Object.freeze({ raw, kind: 'numeric', value: Number(raw) });
  return Object.freeze({ raw, kind: raw ? 'invalid' : 'absent', value: null });
}
function numericMinimum(minimum) { return minimum.kind === 'numeric' ? minimum.value : 0; }
function roleEvaluation(availability, invocationInputQualification, requirementKind, reasons) { return { availability, invocationInputQualification, requirementKind, reasons }; }
function roleRequiredQualification(minimum = {}) {
  if (minimum.kind === 'numeric') return invocationQualification(minimum.value > 0 ? 'required' : 'not-required');
  return invocationQualification('unresolved');
}
function roleInvocationInputQualification(input = {}) {
  const requiredState = input.requiredQualification?.state || (input.required ? 'required' : 'not-required');
  if (input.acquisitionPolicy === 'invocation-provided') {
    if (requiredState === 'not-required') return invocationQualification('not-required');
    if (input.participation === 'unresolved' || requiredState === 'unresolved') return invocationQualification('unresolved');
    return invocationQualification('required');
  }
  if (input.acquisitionPolicy === 'unknown' || input.acquisitionPolicy === '' || !input.acquisitionPolicy) {
    return invocationQualification(requiredState === 'not-required' ? 'not-required' : 'unresolved');
  }
  return invocationQualification('not-required');
}
function destinationInvocationInputQualification(required = '') {
  if (required === 'yes') return invocationQualification('required');
  if (required === 'no') return invocationQualification('not-required');
  return invocationQualification('unresolved');
}
function invocationQualification(state = 'unresolved') { return Object.freeze({ state }); }
function definitionIdentity(definition = {}) {
  return Object.freeze({
    canonicalIdentifier: token(definition.transitionIdentity?.['Canonical Identifier']),
    name: token(definition.transitionIdentity?.Name),
    artifactRegistryIdentity: token(definition.artifact?.registryIdentity),
    artifactId: token(definition.artifact?.id)
  });
}
function schemaToken(value = '') { return token(value).replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1'); }
function token(value = '') { return String(value || '').trim(); }
function compareAvailability(left, right) {
  return String(left.definition.canonicalIdentifier).localeCompare(String(right.definition.canonicalIdentifier))
    || String(left.definition.artifactRegistryIdentity).localeCompare(String(right.definition.artifactRegistryIdentity));
}
