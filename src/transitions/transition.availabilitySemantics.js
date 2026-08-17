import {
  participantMatchesSchema,
  resolveCurrentArtifactParticipant
} from '../artifacts/artifact.participantIndex.js';

export function roleParticipantClassification(role = {}) {
  const fields = role.fields || {};
  const semantic = role.participantClassification || {};
  const declared = token(semantic.declared || fields['Target Kind']);
  const resolved = token(semantic.resolved);
  const qualification = token(semantic.qualification) || 'unresolved';
  const authority = token(semantic.authority);
  const schemaConstraint = semantic.schemaConstraint || {};
  const schemaConstraintQualification = token(schemaConstraint.qualification)
    || (schemaToken(fields['Schema Constraint']) ? 'unresolved' : 'absent');
  const effective = participantClassificationUsable({ qualification, resolved }) ? resolved : '';
  return Object.freeze({
    declared,
    resolved,
    effective,
    qualification,
    authority,
    schemaConstraint: Object.freeze({
      schemaId: token(schemaConstraint.schemaId) || schemaToken(fields['Schema Constraint']),
      qualification: schemaConstraintQualification,
      observedTargetKind: token(schemaConstraint.observedTargetKind)
    }),
    evidence: Object.freeze((semantic.evidence || []).map((item) => Object.freeze({ ...item })))
  });
}

export function participantClassificationUsable(classification = {}) {
  const qualification = token(classification.qualification);
  const resolved = token(classification.resolved);
  return ['explicit', 'agreement', 'resolved-by-authority'].includes(qualification)
    && ['artifact', 'non-artifact'].includes(resolved);
}

export function participantClassificationReason(classification = {}) {
  const qualification = token(classification.qualification);
  if (qualification === 'preserved-unknown' || token(classification.resolved) === 'unknown') return 'participant-kind-unknown';
  if (qualification === 'contradictory') return 'participant-kind-contradictory';
  return 'participant-kind-unresolved';
}

export function schemaRestrictionUsable(schemaConstraint = '', qualification = '') {
  if (!schemaConstraint) return true;
  return qualification === 'resolved';
}

export function schemaRestrictionUnresolved(schemaConstraint = '', qualification = '') {
  return Boolean(schemaConstraint) && qualification !== 'resolved';
}

export function planTransitionApplicability(definition = {}) {
  const group = definition.ordinaryProjection?.byGroup?.['Applicability And Conditions'] || {};
  const values = group.values || {};
  const applicabilityMeaning = token(values['Applicability Meaning']);
  const condition = token(values.Condition);
  const conditionReference = token(values['Condition Reference']);
  const failureMeaning = token(values['Failure Meaning']);
  const unknownMeaning = token(values['Unknown Meaning']);
  const unresolved = Boolean(condition || conditionReference);
  return Object.freeze({
    applicabilityMeaning,
    condition,
    conditionReference,
    failureMeaning,
    unknownMeaning,
    conditionQualification: Object.freeze({
      state: unresolved ? 'unresolved' : 'active',
      reason: unresolved ? 'transition-condition-not-evaluated' : 'no-condition-prescribed'
    }),
    ordinaryGroupQualification: token(group.qualification) || 'unresolved'
  });
}

export function emptyTransitionApplicability(state = 'unresolved') {
  return Object.freeze({
    applicabilityMeaning: '',
    condition: '',
    conditionReference: '',
    failureMeaning: '',
    unknownMeaning: '',
    conditionQualification: Object.freeze({
      state,
      reason: state === 'blocked' ? 'canonical-read-not-qualified' : 'unresolved'
    }),
    ordinaryGroupQualification: 'unresolved'
  });
}

export function planCurrentArtifactContext(currentArtifact, participantIndex, roles = []) {
  const roleTruth = roles.map((role) => ({ role, classification: roleParticipantClassification(role) }));
  const artifactRoles = roleTruth.filter(({ classification }) => classification.effective === 'artifact' && participantClassificationUsable(classification));
  const unresolvedRoles = roleTruth.filter(({ classification }) => !participantClassificationUsable(classification));
  if (!currentArtifact) return Object.freeze({
    provided: false,
    candidateRoleIds: Object.freeze([]),
    unresolvedRoleIds: Object.freeze(unresolvedRoles.map(({ role }) => String(role.name || ''))),
    assignment: 'none',
    artifactContextCandidate: artifactRoles.length === 0
  });

  const participant = resolveCurrentArtifactParticipant(currentArtifact, participantIndex);
  if (!participant) return Object.freeze({
    provided: true,
    participantIdentity: '',
    candidateRoleIds: Object.freeze([]),
    unresolvedRoleIds: Object.freeze(unresolvedRoles.map(({ role }) => String(role.name || ''))),
    assignment: 'unresolved',
    artifactContextCandidate: false,
    reasons: Object.freeze(['current-artifact-participant-unresolved'])
  });

  const candidateRoleIds = [];
  const unresolvedRoleIds = unresolvedRoles.map(({ role }) => String(role.name || ''));
  for (const { role, classification } of artifactRoles) {
    const schemaConstraint = schemaToken(role.fields?.['Schema Constraint']);
    const schemaQualification = classification.schemaConstraint.qualification;
    if (schemaRestrictionUnresolved(schemaConstraint, schemaQualification)) {
      unresolvedRoleIds.push(String(role.name || ''));
      continue;
    }
    if (participantMatchesSchema(participant, schemaConstraint)) candidateRoleIds.push(String(role.name || ''));
  }

  const uniqueUnresolvedRoleIds = [...new Set(unresolvedRoleIds)].sort();
  const assignment = candidateRoleIds.length > 1
    ? 'ambiguous'
    : candidateRoleIds.length === 1 && uniqueUnresolvedRoleIds.length === 0
      ? 'unique'
      : uniqueUnresolvedRoleIds.length
        ? 'unresolved'
        : artifactRoles.length
          ? 'no-match'
          : 'not-required';
  return Object.freeze({
    provided: true,
    participantIdentity: String(participant.identity?.id || ''),
    candidateRoleIds: Object.freeze(candidateRoleIds),
    unresolvedRoleIds: Object.freeze(uniqueUnresolvedRoleIds),
    assignment,
    artifactContextCandidate: artifactRoles.length === 0 || candidateRoleIds.length > 0,
    reasons: Object.freeze(assignment === 'unresolved' ? ['role-participant-classification-or-schema-unresolved'] : [])
  });
}

function schemaToken(value = '') { return token(value).replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1'); }
function token(value = '') { return String(value || '').trim(); }
