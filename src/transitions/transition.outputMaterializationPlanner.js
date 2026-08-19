import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { buildCanonicalTransitionInvocationBindingPlan } from './transition.invocationBindingPlanner.js';
import { buildCanonicalTransitionResultPlan } from './transition.resultSemantics.js';
import { hasConcreteInvocationValue, immutableInvocationValue } from './transition.invocationBindingPacket.js';
import { planExplicitGeneration } from './transition.explicitGenerationPlanner.js';
import { planGenerationInputs } from './transition.generationInputPlanner.js';
export const TRANSITION_OUTPUT_MATERIALIZATION_PLAN_SCHEMA_ID = 'tiinex.site.transition-output-materialization-intent-plan.v1';
const freeze = Object.freeze;
const NONE = freeze([]);
const LOCAL_ORDER = freeze(['invalid', 'unresolved', 'incomplete', 'qualified']);
const PLAN_BOUNDARY = freeze({ readOnly: true, mutation: false, networkFetch: false, artifactCreated: false, draftRendered: false, pathResolution: false, materialization: false, parentMutation: false, relationMaterialization: false, execution: false, executable: false });
export function buildCanonicalTransitionOutputMaterializationPlan(input = {}) {
  const definition = input.definition || {};
  const bindingPlan = buildCanonicalTransitionInvocationBindingPlan({
    definition,
    participantIndex: input.participantIndex,
    currentArtifact: input.currentArtifact,
    bindingPacket: input.bindingPacket
  });
  const result = buildCanonicalTransitionResultPlan({ definition });
  const generationInputs = normalizeGenerationInputs(input.generationInputs);
  const authorities = normalizeTargetAuthorities(input.targetSchemaAuthorities);
  const explicitAuthorities = normalizeExplicitGenerationAuthorities(input.explicitGenerationAuthorities);
  if (bindingPlan.qualification !== 'qualified') {
    return upstreamPlan(bindingPlan, result, generationInputs, authorities, explicitAuthorities);
  }
  const outputs = result.outputRoles || [];
  const outputNames = new Set(outputs.map((role) => role.name));
  const targetSchemas = new Set(outputs.filter((role) => role.generationBinding === 'target-schema').map((role) => role.name));
  const generationAudit = auditGenerationNamespaces(generationInputs, authorities, explicitAuthorities, outputNames, targetSchemas);
  const outputRolePlans = (result.outputRoles || []).map((role) => planOutputRole({
    role,
    result,
    bindingPlan,
    generationInputs: generationInputs.filter((entry) => entry.outputRole === role.name),
    authorities: authorities.filter((entry) => entry.outputRole === role.name),
    explicitAuthorities: explicitAuthorities.filter((entry) => entry.outputRole === role.name)
  }));
  const localReasons = collectLocalReasons(generationAudit, outputRolePlans);
  const qualification = dominantLocalQualification(localReasons);
  return freeze({
    schema: TRANSITION_OUTPUT_MATERIALIZATION_PLAN_SCHEMA_ID,
    definition: freeze({ ...(bindingPlan.definition || {}) }),
    qualification,
    reasons: freeze(flattenReasonBuckets(localReasons)),
    reasonsByState: localReasons,
    bindingPlan: bindingSummary(bindingPlan),
    resultSemantics: resultSummary(result),
    generationAudit,
    outputRolePlans: freeze(outputRolePlans),
    ...PLAN_BOUNDARY
  });
}
function planOutputRole({ role, result, bindingPlan, generationInputs, authorities, explicitAuthorities }) {
  const count = outputCount(role);
  const zero = count.state === 'resolved' && count.exactCount === 0;
  const targetKind = role.effectiveParticipantKind || '';
  const declaredGeneration = role.generationBinding || '';
  const generation = zero
    ? generationPlan(declaredGeneration, 'not-required', 'exact-zero-output-no-generation-obligation', declaredGeneration === 'target-schema'
      ? { authority: 'target-schema' } : declaredGeneration ? { authority: 'explicit-reference', reference: declaredGeneration } : { authority: 'not-prescribed' })
    : planGeneration({ role, targetKind, generationInputs, authorities, explicitAuthorities });
  const lifecycleBase = planLifecycle(role, result);
  const lifecycle = zero ? freeze({ ...lifecycleBase, state: 'not-required', reason: 'exact-zero-output-no-materialization-obligation', requestedOperation: '', command: null }) : lifecycleBase;
  const placements = (result.outputPlacements || []).filter((placement) => placement.outputBinding?.resolvedName === role.name).map((placement) => zero
    ? placementPlan(placement, 'not-required', 'exact-zero-output-no-placement-obligation', undefined, noNaming(planNaming(placement, bindingPlan), 'exact-zero-output-no-naming-obligation'))
    : planPlacement(placement, bindingPlan));
  const mappingDependencies = planMappingDependencies(role, result, bindingPlan).map((mapping) => zero
    ? freeze({ ...mapping, sourceState: mapping.state, state: 'not-required', reason: 'exact-zero-output-no-mapping-obligation', associations: NONE, positionalInference: false }) : mapping);
  const parentDependencies = (result.parentEffects || []).filter((effect) => effect.outputBinding?.resolvedName === role.name)
    .map((effect) => freeze({ effect: effect.name, state: zero ? 'not-required' : 'deferred', actualParentAssigned: false }));
  const relationDependencies = (result.relationEffects || [])
    .filter((effect) => effect.subjectBinding?.resolvedName === role.name || effect.objectBinding?.resolvedName === role.name)
    .map((effect) => freeze({ effect: effect.name, state: zero ? 'not-required' : 'deferred', relationMaterialized: false }));
  const reasons = [];
  if (!zero) {
    if (!targetKind) reasons.push(reason('unresolved', 'target-kind-unresolved'));
    if (count.state !== 'resolved') reasons.push(reason('unresolved', 'output-count-unresolved'));
    collectStateReason(reasons, 'generation', generation);
    collectStateReason(reasons, 'lifecycle', lifecycle);
    for (const placement of placements) collectStateReason(reasons, `placement:${placement.name}`, placement);
    for (const mapping of mappingDependencies) if (['unresolved', 'invalid', 'incomplete'].includes(mapping.state)) {
      reasons.push(reason(mapping.state, `mapping:${mapping.effect}:${mapping.reason || mapping.state}`));
    }
    if (targetKind === 'artifact' && ['create', 'revise'].includes(lifecycle.requestedOperation) && generation.authority === 'not-prescribed') {
      reasons.push(reason('unresolved', 'generation-not-prescribed-for-materialization'));
    }
  }
  return freeze({
    name: role.name, targetKind: role.targetKind, effectiveParticipantKind: targetKind, participantClassification: role.participantClassification,
    schemaConstraint: role.schemaConstraint, schemaConstraintQualification: role.schemaConstraintQualification, outputCount: count, generation, lifecycle,
    placements: freeze(placements), mappingDependencies: freeze(mappingDependencies), parentDependencies: freeze(parentDependencies),
    relationDependencies: freeze(relationDependencies), qualification: dominantReasonState(reasons),
    reasons: freeze(reasons.map((item) => `${item.state}:${item.code}`)), outputMemberIds: NONE, artifactDraft: null, concretePath: null, executable: false
  });
}
function outputCount(role) {
  const minimum = role.minimumCount || {};
  const maximum = role.maximumCount || {};
  if (minimum.kind === 'numeric' && maximum.kind === 'numeric' && minimum.value === maximum.value) {
    return freeze({ state: 'resolved', exactCount: minimum.value, minimum, maximum, memberIdentitiesInvented: false });
  }
  return freeze({ state: 'unresolved', exactCount: null, minimum, maximum, memberIdentitiesInvented: false });
}
function planGeneration({ role, targetKind, generationInputs, authorities, explicitAuthorities = [] }) {
  const declared = role.generationBinding || '';
  if (!targetKind) return generationPlan(declared, 'unresolved', 'participant-kind-unresolved');
  if (targetKind === 'non-artifact') {
    if (!declared) return generationPlan('', 'not-prescribed', 'generation-not-prescribed');
    if (declared !== 'target-schema') return planExplicitGeneration({ role, declared, generationInputs, explicitAuthorities });
    return generationPlan(declared, 'deferred', 'non-artifact-generation-runtime-not-owned', { authority: 'target-schema' });
  }
  if (targetKind !== 'artifact') return generationPlan(declared, 'unresolved', 'participant-kind-unresolved');
  if (!declared) return generationPlan('', 'not-prescribed', 'generation-not-prescribed');
  if (declared !== 'target-schema') return planExplicitGeneration({ role, declared, generationInputs, explicitAuthorities });
  if (!role.schemaConstraint || role.schemaConstraintQualification !== 'resolved') {
    return generationPlan(declared, 'unresolved', 'target-schema-constraint-unresolved', { authority: 'target-schema' });
  }
  if (authorities.length > 1) return generationPlan(declared, 'invalid', 'duplicate-target-schema-authority-entry', { authority: 'target-schema' });
  if (!authorities.length) return generationPlan(declared, 'unresolved', 'target-schema-authority-missing', { authority: 'target-schema' });
  const authority = authorities[0];
  const readableMaterials = authority.materials.filter((material) => material.trim().length > 0);
  if (!readableMaterials.length) return generationPlan(declared, 'unresolved', 'target-schema-authority-missing', { authority: 'target-schema' });
  let compiled;
  try { compiled = compilePortableSchemaContractChain(readableMaterials); }
  catch { return generationPlan(declared, 'invalid', 'target-schema-authority-compile-failed', { authority: 'target-schema' }); }
  if (compiled.schemaId !== role.schemaConstraint) {
    return generationPlan(declared, 'invalid', 'target-schema-authority-schema-mismatch', { authority: 'target-schema', compiledSchemaId: compiled.schemaId });
  }
  if (compiled.lineageQualification?.state !== 'valid' || compiled.lineageQualification?.complete !== true) {
    return generationPlan(declared, 'unresolved', 'target-schema-authority-lineage-unresolved', { authority: 'target-schema', compiledSchemaId: compiled.schemaId, lineageQualification: compiled.lineageQualification });
  }
  const creation = compiled.creation || {};
  const usable = Boolean((creation.groups || []).length || (creation.requiredInputs || []).length || (creation.optionalInputs || []).length || (creation.requiredSections || []).length);
  if (!usable) return generationPlan(declared, 'unresolved', 'target-schema-creation-authority-unavailable', { authority: 'target-schema', compiledSchemaId: compiled.schemaId });
  const inputs = planGenerationInputs(role.name, creation, generationInputs);
  return freeze({
    declared,
    authority: 'target-schema',
    reference: '',
    state: inputs.state,
    reason: inputs.reason,
    compiledSchemaId: compiled.schemaId,
    lineageQualification: compiled.lineageQualification,
    requiredInputs: freeze([...(creation.requiredInputs || [])]),
    optionalInputs: freeze([...(creation.optionalInputs || [])]),
    requiredSections: freeze([...(creation.requiredSections || [])]),
    toolingConfigurationFields: freeze([...(creation.toolingConfigurationFields || [])]),
    creationGroups: freeze((creation.groups || []).map((group) => group.name)),
    inputPlans: inputs.plans,
    unclaimedInputs: inputs.unclaimed,
    draftRendered: false,
    executable: false
  });
}

function generationPlan(declared, state, reasonCode, extra = {}) {
  return freeze({
    declared,
    authority: extra.authority || (declared ? 'unresolved' : 'not-prescribed'),
    reference: extra.reference || '',
    state,
    reason: reasonCode,
    compiledSchemaId: extra.compiledSchemaId || '',
    lineageQualification: extra.lineageQualification || null,
    requiredInputs: NONE,
    optionalInputs: NONE,
    requiredSections: NONE,
    toolingConfigurationFields: NONE,
    creationGroups: NONE,
    inputPlans: NONE,
    unclaimedInputs: NONE,
    draftRendered: false,
    executable: false
  });
}

function planLifecycle(role, result) {
  const active = (result.lifecycleEffects || []).filter((effect) =>
    effect.participation?.state === 'active' && (effect.targetBinding?.resolvedName === role.name || effect.resultBinding?.resolvedName === role.name));
  const effects = freeze(active.map((effect) => freeze({
    name: effect.name, targetBinding: effect.targetBinding, resultBinding: effect.resultBinding, effect: effect.effect,
    logicalContinuity: effect.logicalContinuity, requiredMaterializationOperation: effect.requiredMaterializationOperation || '',
    memberMapping: effect.memberMapping?.declared || '', participation: effect.participation
  })));
  const operations = effects.filter((effect) => effect.requiredMaterializationOperation);
  if (operations.length > 1) return freeze({ state: 'unresolved', reason: 'multiple-materialization-operations-require-composition', requestedOperation: '', effects, command: null });
  if (operations.length === 1) return freeze({ state: 'resolved', reason: '', requestedOperation: operations[0].requiredMaterializationOperation, effects, command: null });
  return freeze({ state: 'not-prescribed', reason: 'materialization-operation-not-prescribed', requestedOperation: '', effects, command: null });
}

function planPlacement(placement, bindingPlan) {
  const intent = placement.placementIntent || '', naming = planNaming(placement, bindingPlan);
  if (intent === 'no-materialization') return placementPlan(placement, 'resolved', 'physical-placement-not-required', undefined, noNaming(naming, 'physical-placement-not-required'));
  const inactive = intent === 'unknown' ? 'placement-intent-unresolved' : intent === 'preserve-current' ? 'current-placement-authority-unavailable' : intent !== 'new-materialization' ? 'placement-intent-not-supported' : '';
  if (inactive) return placementPlan(placement, 'unresolved', inactive, undefined, noNaming(naming, inactive));
  const destinationName = placement.destinationBinding?.resolvedName || '';
  const destination = (bindingPlan.destinationBindings || []).find((item) => item.name === destinationName);
  if (!destinationName || !destination || destination.value === undefined) return placementPlan(placement, 'unresolved', 'destination-component-unresolved', undefined, naming);
  if (placement.relativeToBinding?.resolvedName) return placementPlan(placement, 'unresolved', 'relative-placement-resolver-unavailable', destination.value, naming);
  if (naming.state !== 'resolved' && naming.state !== 'not-required') return placementPlan(placement, naming.state, naming.reason, destination.value, naming);
  return placementPlan(placement, 'resolved', '', destination.value, naming);
}
function noNaming(naming, reason) { return freeze({ ...naming, state: 'not-required', reason }); }

function planNaming(placement, bindingPlan) {
  const authority = placement.namingAuthority || '';
  if (!authority) return freeze({ authority: '', state: 'unresolved', reason: 'naming-authority-not-prescribed', value: undefined });
  if (authority === 'explicit-binding') {
    const binding = (bindingPlan.namingBindings || []).find((item) => item.placement === placement.name);
    if (binding?.state !== 'resolved' || binding.value === undefined) return freeze({ authority, state: 'incomplete', reason: 'explicit-naming-component-missing', value: undefined });
    return freeze({ authority, state: 'resolved', reason: '', value: immutableInvocationValue(binding.value) });
  }
  if (authority === 'target-schema') return freeze({ authority, state: 'unresolved', reason: 'target-schema-naming-resolver-unavailable', value: undefined });
  if (authority === 'external-authority') return freeze({ authority, state: 'unresolved', reason: 'external-naming-resolver-unavailable', reference: placement.namingAuthorityReference || '', value: undefined });
  return freeze({ authority, state: 'unresolved', reason: 'naming-authority-unresolved', value: undefined });
}

function placementPlan(placement, state, reasonCode, destinationValue = undefined, naming = null) {
  return freeze({
    name: placement.name,
    placementIntent: placement.placementIntent,
    destinationBinding: placement.destinationBinding,
    destinationValue: destinationValue === undefined ? undefined : immutableInvocationValue(destinationValue),
    naming: naming || freeze({ authority: placement.namingAuthority || '', state: 'not-required', reason: '', value: undefined }),
    relativeToBinding: placement.relativeToBinding,
    relativePlacementMeaning: placement.relativePlacementMeaning,
    explicitOverrideAllowed: placement.explicitOverrideAllowed,
    state,
    reason: reasonCode,
    concretePath: null,
    pathResolution: false,
    materializationCommand: null,
    executable: false
  });
}

function planMappingDependencies(role, result, bindingPlan) {
  const relevant = new Set();
  for (const effect of result.lifecycleEffects || []) if (effect.targetBinding?.resolvedName === role.name || effect.resultBinding?.resolvedName === role.name) relevant.add(`lifecycle\u0000${effect.name}`);
  for (const effect of result.parentEffects || []) if (effect.outputBinding?.resolvedName === role.name) relevant.add(`parent\u0000${effect.name}`);
  for (const effect of result.relationEffects || []) if (effect.subjectBinding?.resolvedName === role.name || effect.objectBinding?.resolvedName === role.name) relevant.add(`relation\u0000${effect.name}`);
  return (bindingPlan.memberAssociations || []).filter((item) => relevant.has(`${item.group}\u0000${item.effect}`)).map((item) => {
    const declared = (result[`${item.group}Effects`] || []).find((effect) => effect.name === item.effect)?.memberMapping || {};
    return freeze({ group: item.group, effect: item.effect, mapping: item.mapping, mappingKey: declared.mappingKey || '', mappingMeaning: declared.mappingMeaning || '', state: item.state, reason: item.reasons?.[0] || '', associations: freeze([...(item.associations || [])]), positionalInference: false });
  });
}

function normalizeGenerationInputs(entries) {
  return freeze((Array.isArray(entries) ? entries : []).map((entry) => freeze({
    outputRole: token(entry?.outputRole),
    name: token(entry?.name),
    hasValue: hasConcreteInvocationValue(entry),
    value: entry?.value
  })));
}
function normalizeTargetAuthorities(entries) {
  return freeze((Array.isArray(entries) ? entries : []).map((entry) => freeze({
    outputRole: token(entry?.outputRole),
    materials: freeze((Array.isArray(entry?.materials) ? entry.materials : []).map((item) => String(item || '')))
  })));
}
function normalizeExplicitGenerationAuthorities(entries) {
  return freeze((Array.isArray(entries) ? entries : []).map((entry) => freeze({
    outputRole: token(entry?.outputRole),
    qualification: entry?.qualification || entry?.projection || null
  })));
}

function auditGenerationNamespaces(inputs, authorities, explicitAuthorities, outputNames, targetSchemas) {
  const findings = [], keys = new Map();
  for (const entry of inputs) {
    if (!outputNames.has(entry.outputRole)) findings.push(freeze({ state: 'invalid', code: 'unknown-generation-output-role', subject: entry.outputRole }));
    const key = `${entry.outputRole}\u0000${entry.name}`;
    keys.set(key, (keys.get(key) || 0) + 1);
  }
  for (const [key, count] of keys) if (count > 1) findings.push(freeze({ state: 'invalid', code: 'duplicate-generation-input-entry', subject: key.replace('\u0000', ':') }));
  for (const entry of authorities) {
    if (!outputNames.has(entry.outputRole)) findings.push(freeze({ state: 'invalid', code: 'unknown-target-authority-output-role', subject: entry.outputRole }));
  }
  for (const entry of explicitAuthorities) {
    if (!outputNames.has(entry.outputRole)) findings.push(freeze({ state: 'invalid', code: 'unknown-explicit-generation-output-role', subject: entry.outputRole }));
  }
  const explicitNames = new Set(explicitAuthorities.map((entry) => entry.outputRole));
  for (const name of explicitNames) if (explicitAuthorities.filter((entry) => entry.outputRole === name).length > 1) findings.push(freeze({ state: 'invalid', code: 'duplicate-explicit-generation-authority-entry', subject: name }));
  for (const name of targetSchemas) if (authorities.filter((entry) => entry.outputRole === name).length > 1) findings.push(freeze({ state: 'invalid', code: 'duplicate-target-schema-authority-entry', subject: name }));
  return freeze({ findings: freeze(findings), generationInputEntries: inputs.length, targetAuthorityEntries: authorities.length, explicitAuthorityEntries: explicitAuthorities.length });
}
function collectLocalReasons(audit, outputPlans) {
  const buckets = { invalid: [], unresolved: [], incomplete: [] };
  for (const finding of audit.findings) buckets[finding.state].push(`${finding.code}:${finding.subject}`);
  for (const output of outputPlans) for (const item of output.reasons) {
    const split = item.indexOf(':');
    const state = item.slice(0, split);
    const code = item.slice(split + 1);
    if (buckets[state]) buckets[state].push(`output:${output.name}:${code}`);
  }
  return freeze(Object.fromEntries(Object.entries(buckets).map(([state, values]) => [state, freeze(unique(values))])));
}
function collectStateReason(reasons, prefix, plan) {
  if (['invalid', 'unresolved', 'incomplete'].includes(plan.state)) reasons.push(reason(plan.state, `${prefix}:${plan.reason || plan.state}`));
}
function reason(state, code) { return freeze({ state, code }); }
function dominantReasonState(reasons) {
  for (const state of LOCAL_ORDER) if (state === 'qualified' || reasons.some((item) => item.state === state)) return state;
  return 'qualified';
}
function dominantLocalQualification(buckets) {
  return LOCAL_ORDER.find((state) => state === 'qualified' || buckets[state]?.length) || 'qualified';
}
function strongerLocalState(left, right) {
  const normalize = (state) => ['resolved', 'optional-unbound'].includes(state) ? 'qualified' : state;
  const a = normalize(left); const b = normalize(right);
  const order = ['invalid', 'unresolved', 'incomplete', 'qualified'];
  return order.indexOf(a) <= order.indexOf(b) ? (a === 'qualified' ? 'resolved' : a) : (b === 'qualified' ? 'resolved' : b);
}
function upstreamPlan(bindingPlan, result, generationInputs, authorities, explicitAuthorities = []) {
  return freeze({
    schema: TRANSITION_OUTPUT_MATERIALIZATION_PLAN_SCHEMA_ID,
    definition: freeze({ ...(bindingPlan.definition || {}) }),
    qualification: bindingPlan.qualification,
    reasons: freeze((bindingPlan.reasons || []).map((item) => `upstream:${item}`)),
    reasonsByState: freeze({ upstream: freeze([...(bindingPlan.reasons || [])]) }),
    bindingPlan: bindingSummary(bindingPlan),
    resultSemantics: resultSummary(result),
    generationAudit: freeze({ findings: NONE, generationInputEntries: generationInputs.length, targetAuthorityEntries: authorities.length, explicitAuthorityEntries: explicitAuthorities.length }),
    outputRolePlans: NONE,
    ...PLAN_BOUNDARY
  });
}
function bindingSummary(plan) { return freeze({ qualification: plan.qualification, reasons: freeze([...(plan.reasons || [])]), executable: false }); }
function resultSummary(plan) { return freeze({ qualification: plan.qualification, reasons: freeze([...(plan.reasons || [])]), executable: false }); }
function flattenReasonBuckets(buckets) { return LOCAL_ORDER.filter((state) => state !== 'qualified').flatMap((state) => (buckets[state] || []).map((item) => `${state}:${item}`)); }
function stableJson(value) { return JSON.stringify(value ?? null); }
function token(value = '') { return String(value || '').trim(); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
