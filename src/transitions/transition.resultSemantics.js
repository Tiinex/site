import { TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID } from './transition.definitionRegistry.js';
import { CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID } from './transition.legacyShorthand.js';
import {
  roleParticipantClassification,
  participantClassificationUsable,
  schemaRestrictionUnresolved
} from './transition.availabilitySemantics.js';

export const TRANSITION_RESULT_SEMANTICS_PLAN_SCHEMA_ID = 'tiinex.site.transition-result-semantics-plan.v1';

export function buildCanonicalTransitionResultPlan({ definition } = {}) {
  if (!isCanonicalDefinitionReadModel(definition)) return blockedPlan(definition, 'definition-not-canonical-read-model');
  if (definition.canonicalReadQualified !== true) return blockedPlan(definition, 'canonical-read-not-qualified');

  const inputRoles = activeDeclarations(definition.inputRoles);
  const outputRoleDeclarations = activeDeclarations(definition.outputRoles);
  const destinations = activeDeclarations(definition.destinationBindings);
  const roleNames = new Set([...inputRoles, ...outputRoleDeclarations].map((item) => String(item.name || '')));
  const outputNames = new Set(outputRoleDeclarations.map((item) => String(item.name || '')));
  const destinationNames = new Set(destinations.map((item) => String(item.name || '')));

  const projectedOutputRoles = outputRoleDeclarations.map(projectOutputRole);
  const lifecycleEffects = activeDeclarations(definition.lifecycleEffects).map((effect) => projectLifecycleEffect(effect, roleNames));
  const parentEffects = activeDeclarations(definition.parentEffects).map((effect) => projectParentEffect(effect, roleNames, outputNames));
  const relationEffects = activeDeclarations(definition.relationEffects).map((effect) => projectRelationEffect(effect, roleNames));
  const outputPlacements = activeDeclarations(definition.outputPlacements).map((placement) => projectOutputPlacement(placement, roleNames, outputNames, destinationNames));
  const outputRoles = projectedOutputRoles.map((role) => withLifecycleCoverage(role, lifecycleEffects));
  const destinationBindings = destinations
    .map(projectDestinationBinding)
    .map((binding) => withDestinationPlacementCoverage(binding, outputPlacements));
  const authoringGuidance = projectAuthoringGuidance(definition);

  const unresolvedReasons = collectUnresolvedReasons({
    outputRoles,
    destinationBindings,
    lifecycleEffects,
    parentEffects,
    relationEffects,
    outputPlacements
  });

  return Object.freeze({
    schema: TRANSITION_RESULT_SEMANTICS_PLAN_SCHEMA_ID,
    definition: definitionIdentity(definition),
    readOnly: true,
    mutation: false,
    networkFetch: false,
    executable: false,
    qualification: unresolvedReasons.length ? 'unresolved' : 'qualified',
    reasons: Object.freeze(unresolvedReasons),
    outputRoles: Object.freeze(outputRoles),
    lifecycleEffects: Object.freeze(lifecycleEffects),
    parentEffects: Object.freeze(parentEffects),
    relationEffects: Object.freeze(relationEffects),
    destinationBindings: Object.freeze(destinationBindings),
    outputPlacements: Object.freeze(outputPlacements),
    authoringGuidance,
    boundary: Object.freeze({
      participantBinding: false,
      conditionEvaluation: false,
      concreteMemberMapping: false,
      generationResolution: false,
      pathResolution: false,
      materialization: false,
      parentMutation: false,
      relationMaterialization: false,
      execution: false
    })
  });
}

function projectOutputRole(role = {}) {
  const fields = role.fields || {};
  const participantClassification = roleParticipantClassification(role);
  const schemaConstraint = schemaToken(fields['Schema Constraint']);
  const generationBinding = token(fields['Generation Binding']);
  const classificationResolved = participantClassificationUsable(participantClassification);
  const schemaRestrictionQualification = participantClassification.schemaConstraint?.qualification || (schemaConstraint ? 'unresolved' : 'absent');
  const generation = generationBinding === 'target-schema'
    ? Object.freeze({ declared: generationBinding, authority: 'target-schema', qualification: 'not-evaluated', executable: false })
    : generationBinding
      ? Object.freeze({ declared: generationBinding, authority: 'explicit-reference', qualification: 'not-evaluated', executable: false })
      : Object.freeze({ declared: '', authority: 'none-prescribed', qualification: 'absent', executable: false });
  return Object.freeze({
    name: String(role.name || ''),
    meaning: token(fields.Meaning),
    minimumCount: cardinality(fields['Minimum Count'], false),
    maximumCount: cardinality(fields['Maximum Count'], true),
    targetKind: participantClassification.declared,
    effectiveParticipantKind: classificationResolved ? participantClassification.resolved : '',
    participantClassification,
    schemaConstraint,
    schemaConstraintQualification: schemaRestrictionQualification,
    generationBinding,
    generation,
    selectionNotes: token(fields['Selection Notes']),
    qualification: !classificationResolved || schemaRestrictionUnresolved(schemaConstraint, schemaRestrictionQualification)
      ? 'unresolved'
      : 'qualified',
    executable: false
  });
}

function projectLifecycleEffect(effect = {}, roleNames) {
  const fields = effect.fields || {};
  const targetBinding = bindingReference(fields['Target Binding'], roleNames, 'participant-role', true);
  const resultBinding = bindingReference(fields['Result Binding'], roleNames, 'participant-role', false);
  const effectLabel = token(fields.Effect);
  const logicalContinuity = token(fields['Logical Continuity']);
  const effectMeaning = token(fields['Effect Meaning']);
  const preserveWhy = token(fields['Preserve Why']);
  const mapping = memberMapping(fields);
  const participation = effectParticipation(fields);
  const reasons = [];
  if (participation.state === 'unresolved') reasons.push('condition-unresolved');
  if (targetBinding.qualification === 'unresolved') reasons.push('target-binding-unresolved');
  if (resultBinding.qualification === 'unresolved') reasons.push('result-binding-unresolved');
  if (effectLabel === 'unknown') reasons.push('effect-unresolved');
  if (logicalContinuity === 'unknown') reasons.push('logical-continuity-unresolved');
  if (preserveWhy === 'unknown') reasons.push('preserve-why-unresolved');
  if (effectLabel === 'custom' && !effectMeaning) reasons.push('effect-meaning-required');
  reasons.push(...mapping.semanticQualification.reasons.map((reason) => `member-mapping-${reason}`));
  return Object.freeze({
    name: String(effect.name || ''),
    targetBinding,
    effect: effectLabel,
    resultBinding,
    logicalContinuity,
    effectMeaning,
    requiredMaterializationOperation: token(fields['Required Materialization Operation']),
    preserveWhy,
    memberMapping: mapping,
    participation,
    semanticQualification: semanticQualification(reasons),
    notes: token(fields.Notes),
    executable: false,
    command: null
  });
}

function projectParentEffect(effect = {}, roleNames, outputNames) {
  const fields = effect.fields || {};
  const outputBinding = bindingReference(fields['Output Binding'], outputNames, 'output-role', true);
  const effectLabel = token(fields.Effect);
  const parentBinding = bindingReference(fields['Parent Binding'], roleNames, 'participant-role', false);
  const mapping = memberMapping(fields);
  const participation = effectParticipation(fields);
  const reasons = [];
  if (participation.state === 'unresolved') reasons.push('condition-unresolved');
  if (outputBinding.qualification === 'unresolved') reasons.push('output-binding-unresolved');
  if (parentBinding.qualification === 'unresolved') reasons.push('parent-binding-unresolved');
  if (effectLabel === 'unknown') reasons.push('effect-unresolved');
  if (['set', 'replace'].includes(effectLabel) && parentBinding.qualification !== 'resolved') {
    reasons.push('parent-binding-required');
  }
  reasons.push(...mapping.semanticQualification.reasons.map((reason) => `member-mapping-${reason}`));
  return Object.freeze({
    name: String(effect.name || ''),
    outputBinding,
    effect: effectLabel,
    parentBinding,
    memberMapping: mapping,
    participation,
    semanticQualification: semanticQualification(reasons),
    notes: token(fields.Notes),
    actualParentAssigned: false,
    executable: false
  });
}

function projectRelationEffect(effect = {}, roleNames) {
  const fields = effect.fields || {};
  const predicateVocabulary = token(fields['Predicate Vocabulary']);
  const predicateAuthority = token(fields['Predicate Authority']);
  const predicateScope = predicateAuthority
    ? 'declared-authority'
    : predicateVocabulary
      ? 'declared-vocabulary'
      : 'local-transition-definition';
  const subjectBinding = bindingReference(fields['Subject Binding'], roleNames, 'participant-role', true);
  const objectBinding = bindingReference(fields['Object Binding'], roleNames, 'participant-role', true);
  const effectLabel = token(fields.Effect);
  const mapping = memberMapping(fields);
  const participation = effectParticipation(fields);
  const reasons = [];
  if (participation.state === 'unresolved') reasons.push('condition-unresolved');
  if (subjectBinding.qualification === 'unresolved') reasons.push('subject-binding-unresolved');
  if (objectBinding.qualification === 'unresolved') reasons.push('object-binding-unresolved');
  if (effectLabel === 'unknown') reasons.push('effect-unresolved');
  reasons.push(...mapping.semanticQualification.reasons.map((reason) => `member-mapping-${reason}`));
  return Object.freeze({
    name: String(effect.name || ''),
    effect: effectLabel,
    subjectBinding,
    predicateIdentifier: token(fields['Predicate Identifier']),
    predicateMeaning: token(fields['Predicate Meaning']),
    objectBinding,
    directionality: token(fields.Directionality),
    predicateLabel: token(fields['Predicate Label']),
    predicateVocabulary,
    predicateAuthority,
    predicateScope,
    portablePredicateIdentityClaimed: Boolean(predicateAuthority || predicateVocabulary),
    inversePredicateIdentifier: token(fields['Inverse Predicate Identifier']),
    memberMapping: mapping,
    participation,
    semanticQualification: semanticQualification(reasons),
    notes: token(fields.Notes),
    relationMaterialized: false,
    executable: false
  });
}

function projectDestinationBinding(binding = {}) {
  const fields = binding.fields || {};
  const required = token(fields.Required);
  return Object.freeze({
    name: String(binding.name || ''),
    fields: Object.freeze({ ...fields }),
    meaning: token(fields.Meaning),
    required,
    requiredQualification: Object.freeze({
      state: required === 'yes' ? 'required' : required === 'no' || !required ? 'not-required' : 'unresolved'
    }),
    invocationInputRequired: required === 'yes',
    executable: false
  });
}

function projectOutputPlacement(placement = {}, roleNames, outputNames, destinationNames) {
  const fields = placement.fields || {};
  const outputBinding = bindingReference(fields['Output Binding'], outputNames, 'output-role', true);
  const destinationBinding = bindingReference(fields['Destination Binding'], destinationNames, 'destination-binding', false);
  const relativeToBinding = bindingReference(fields['Relative To Binding'], roleNames, 'participant-role', false);
  const placementIntent = token(fields['Placement Intent']);
  const namingAuthority = token(fields['Naming Authority']);
  const namingAuthorityReference = token(fields['Naming Authority Reference']);
  const namingQualification = namingAuthorityQualification(namingAuthority, namingAuthorityReference);
  const explicitOverrideAllowed = token(fields['Explicit Override Allowed']);
  const reasons = [];
  if (outputBinding.qualification === 'unresolved') reasons.push('output-binding-unresolved');
  if (destinationBinding.qualification === 'unresolved') reasons.push('destination-binding-unresolved');
  if (relativeToBinding.qualification === 'unresolved') reasons.push('relative-to-binding-unresolved');
  if (placementIntent === 'unknown') reasons.push('intent-unresolved');
  if (namingQualification.state === 'unresolved') reasons.push(namingQualification.reason || 'naming-unresolved');
  if (explicitOverrideAllowed === 'unknown') reasons.push('explicit-override-unresolved');
  return Object.freeze({
    name: String(placement.name || ''),
    outputBinding,
    destinationBinding,
    placementIntent,
    namingAuthority,
    namingAuthorityReference,
    namingQualification,
    relativeToBinding,
    relativePlacementMeaning: token(fields['Relative Placement Meaning']),
    explicitOverrideAllowed,
    semanticQualification: semanticQualification(reasons),
    notes: token(fields.Notes),
    concretePath: null,
    pathQualification: 'not-evaluated',
    materializationCommand: null,
    executable: false
  });
}

function withLifecycleCoverage(role = {}, lifecycleEffects = []) {
  const matchingEffects = lifecycleEffects.filter((effect) =>
    effect.targetBinding?.resolvedName === role.name || effect.resultBinding?.resolvedName === role.name);
  const active = matchingEffects.filter((effect) => effect.participation?.state === 'active');
  const unresolved = matchingEffects.filter((effect) => effect.participation?.state === 'unresolved');
  const state = active.length ? 'present' : unresolved.length ? 'unresolved' : 'missing';
  return Object.freeze({
    ...role,
    lifecycleCoverage: Object.freeze({
      state,
      effectNames: Object.freeze(matchingEffects.map((effect) => effect.name).sort()),
      activeEffectNames: Object.freeze(active.map((effect) => effect.name).sort()),
      unresolvedEffectNames: Object.freeze(unresolved.map((effect) => effect.name).sort())
    })
  });
}

function withDestinationPlacementCoverage(binding = {}, placements = []) {
  const placementNames = placements
    .filter((placement) => placement.destinationBinding?.resolvedName === binding.name)
    .map((placement) => placement.name)
    .sort();
  return Object.freeze({
    ...binding,
    placementCoverage: Object.freeze({
      state: placementNames.length ? 'present' : 'missing',
      placementNames: Object.freeze(placementNames)
    })
  });
}

function namingAuthorityQualification(authority = '', reference = '') {
  if (!authority) return Object.freeze({ state: 'absent', reason: '' });
  if (authority === 'unknown') return Object.freeze({ state: 'unresolved', reason: 'naming-authority-unresolved' });
  if (authority === 'external-authority' && !reference) {
    return Object.freeze({ state: 'unresolved', reason: 'naming-authority-reference-required' });
  }
  return Object.freeze({ state: 'not-evaluated', reason: '' });
}

function projectAuthoringGuidance(definition = {}) {
  const group = definition.ordinaryProjection?.byGroup?.['Authoring Bindings'] || {};
  const values = group.values || {};
  return Object.freeze({
    interactionUnit: token(values['Interaction Unit']),
    schemaModule: token(values['Schema Module']),
    presentationSurface: token(values['Presentation Surface']),
    authoringNotes: token(values['Authoring Notes']),
    qualification: token(group.qualification) || 'unresolved',
    guidanceOnly: true,
    generationAuthority: false,
    executionAuthority: false
  });
}

function effectParticipation(fields = {}) {
  const condition = token(fields.Condition);
  const conditionReference = token(fields['Condition Reference']);
  return Object.freeze({
    condition,
    conditionReference,
    state: condition || conditionReference ? 'unresolved' : 'active',
    reason: condition || conditionReference ? 'effect-condition-not-evaluated' : 'no-condition-prescribed'
  });
}

function memberMapping(fields = {}) {
  const declared = token(fields['Member Mapping']);
  const mappingKey = token(fields['Mapping Key']);
  const mappingMeaning = token(fields['Mapping Meaning']);
  const reasons = [];
  if (declared === 'unknown') reasons.push('unresolved');
  if (declared === 'custom' && !mappingMeaning) reasons.push('meaning-required');
  if (declared === 'by-key' && !mappingKey) reasons.push('key-required');
  return Object.freeze({
    declared,
    mappingKey,
    mappingMeaning,
    semanticQualification: semanticQualification(reasons),
    concreteQualification: declared ? 'not-evaluated' : 'not-required',
    concreteAssociations: Object.freeze([]),
    positionalInference: false
  });
}

function bindingReference(value, allowedNames, namespace, required) {
  const declared = token(value);
  if (!declared) return Object.freeze({ declared: '', namespace, qualification: required ? 'unresolved' : 'absent', resolvedName: '' });
  return Object.freeze({
    declared,
    namespace,
    qualification: allowedNames.has(declared) ? 'resolved' : 'unresolved',
    resolvedName: allowedNames.has(declared) ? declared : ''
  });
}

function collectUnresolvedReasons(plan = {}) {
  const reasons = [];
  for (const role of plan.outputRoles || []) {
    if (role.qualification !== 'qualified') reasons.push(`output-role:${role.name}:unresolved`);
    if (role.minimumCount.kind === 'unknown' || role.maximumCount.kind === 'unknown') reasons.push(`output-role:${role.name}:cardinality-unresolved`);
    if (role.lifecycleCoverage?.state === 'missing') reasons.push(`output-role:${role.name}:lifecycle-coverage-missing`);
    if (role.lifecycleCoverage?.state === 'unresolved') reasons.push(`output-role:${role.name}:lifecycle-coverage-unresolved`);
  }
  for (const destination of plan.destinationBindings || []) {
    if (destination.requiredQualification.state === 'unresolved') reasons.push(`destination:${destination.name}:requiredness-unresolved`);
    if (destination.requiredQualification.state === 'required' && destination.placementCoverage?.state !== 'present') {
      reasons.push(`destination:${destination.name}:required-placement-missing`);
    }
  }
  for (const [groupName, effects] of [['lifecycle', plan.lifecycleEffects], ['parent', plan.parentEffects], ['relation', plan.relationEffects]]) {
    for (const effect of effects || []) {
      for (const reason of effect.semanticQualification?.reasons || []) reasons.push(`${groupName}:${effect.name}:${reason}`);
    }
  }
  for (const placement of plan.outputPlacements || []) {
    for (const reason of placement.semanticQualification?.reasons || []) reasons.push(`placement:${placement.name}:${reason}`);
  }
  return [...new Set(reasons)].sort();
}

function semanticQualification(reasons = []) {
  const unique = [...new Set(reasons.filter(Boolean))].sort();
  return Object.freeze({
    state: unique.length ? 'unresolved' : 'qualified',
    reasons: Object.freeze(unique)
  });
}

function bindingKeysFor(groupName) {
  if (groupName === 'lifecycle') return ['targetBinding', 'resultBinding'];
  if (groupName === 'parent') return ['outputBinding', 'parentBinding'];
  return ['subjectBinding', 'objectBinding'];
}

function activeDeclarations(items = []) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 1 && token(list[0]?.name).toLowerCase() === 'none') return [];
  return list.filter((item) => token(item?.name).toLowerCase() !== 'none');
}

function cardinality(value, maximum) {
  const raw = token(value);
  if (raw === 'unknown') return Object.freeze({ raw, kind: 'unknown', value: null });
  if (maximum && raw === 'unbounded') return Object.freeze({ raw, kind: 'unbounded', value: null });
  if (/^(0|[1-9]\d*)$/.test(raw)) return Object.freeze({ raw, kind: 'numeric', value: Number(raw) });
  return Object.freeze({ raw, kind: raw ? 'invalid' : 'absent', value: null });
}

function definitionIdentity(definition = {}) {
  return Object.freeze({
    canonicalIdentifier: String(definition.transitionIdentity?.['Canonical Identifier'] || ''),
    name: String(definition.transitionIdentity?.Name || ''),
    version: String(definition.transitionIdentity?.Version || ''),
    registryIdentity: String(definition.artifact?.registryIdentity || ''),
    artifactId: String(definition.artifact?.id || '')
  });
}

function blockedPlan(definition, reason) {
  return Object.freeze({
    schema: TRANSITION_RESULT_SEMANTICS_PLAN_SCHEMA_ID,
    definition: definitionIdentity(definition),
    readOnly: true,
    mutation: false,
    networkFetch: false,
    executable: false,
    qualification: 'blocked',
    reasons: Object.freeze([reason]),
    outputRoles: Object.freeze([]),
    lifecycleEffects: Object.freeze([]),
    parentEffects: Object.freeze([]),
    relationEffects: Object.freeze([]),
    destinationBindings: Object.freeze([]),
    outputPlacements: Object.freeze([]),
    authoringGuidance: Object.freeze({ guidanceOnly: true, generationAuthority: false, executionAuthority: false }),
    boundary: Object.freeze({ execution: false })
  });
}

function isCanonicalDefinitionReadModel(definition = {}) {
  return definition?.schema === TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID
    && definition?.artifact?.schemaId === CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID;
}

function schemaToken(value = '') { return token(value).replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1'); }
function token(value = '') { return String(value || '').trim(); }
