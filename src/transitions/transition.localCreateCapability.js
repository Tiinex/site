export const CANONICAL_LOCAL_CREATE_CAPABILITY_OWNER_SCHEMA_ID = 'tiinex.site.canonical-local-create-capability-owner.v1';
const freeze = Object.freeze;

export function localCreateCapability(input = {}) {
  return input.productScope === 'workspace' ? workspaceRootCreateCapability(input) : recordLocalCreateCapability(input);
}

function recordLocalCreateCapability({ result, availability, creation, currentParticipant, workspaceId, parent, materializer }) {
  const reasons = [];
  const outputs = result.outputRoles || [];
  const output = outputs[0];
  const lifecycle = result.lifecycleEffects || [];
  const parents = result.parentEffects || [];
  const relations = result.relationEffects || [];
  const placements = result.outputPlacements || [];
  const destinations = result.destinationBindings || [];
  const parentEffect = parents[0];
  const parentRoleName = token(parentEffect?.parentBinding?.resolvedName);
  const currentRoleIds = availability.context?.candidateRoleIds || [];
  const parentRole = (availability.inputRoles || []).find((role) => role.name === parentRoleName);
  const inputSchemaId = token(parentRole?.schemaConstraint);
  const outputSchemaId = token(output?.schemaConstraint);

  if (availability.availability !== 'available') reasons.push('canonical-transition-not-available');
  if (result.qualification !== 'qualified') reasons.push('canonical-result-semantics-not-qualified');
  if (availability.context?.assignment !== 'unique' || !currentParticipant) reasons.push('current-artifact-role-not-unique');
  if ((availability.inputRoles || []).length !== 1) reasons.push('unsupported-input-role-arity');
  if (outputs.length !== 1) reasons.push('unsupported-output-role-arity');
  if (currentRoleIds.length !== 1 || !parentRoleName || parentRoleName !== currentRoleIds[0]) reasons.push('parent-role-not-current-artifact-role');
  if (!supportedCanonicalParentRole(parentRole)) reasons.push('unsupported-parent-role-capability');
  if (currentParticipant?.cleanCandidate !== true || !inputSchemaId || currentParticipant?.candidateSchemaId !== inputSchemaId) reasons.push('current-artifact-schema-unqualified');
  if (!supportedCanonicalOutput(output)) reasons.push('unsupported-output-capability');
  if (lifecycle.length !== 1 || !supportedLifecycle(lifecycle[0], output)) reasons.push('unsupported-lifecycle-capability');
  if (parents.length !== 1 || !supportedParentEffect(parentEffect, output, parentRoleName)) reasons.push('unsupported-parent-capability');
  if (relations.length) reasons.push('relation-effects-not-supported');
  if (!supportedLocalPlacement(placements, destinations, output)) reasons.push('unsupported-placement-capability');
  if (creation.state !== 'qualified' || creation.schemaId !== outputSchemaId) reasons.push('creation-authority-unavailable');
  if (!materializer || materializer.schemaId !== outputSchemaId) reasons.push('local-materializer-unavailable');
  if (!String(workspaceId || '').trim()) reasons.push('workspace-destination-unavailable');
  if (parent.state !== 'qualified' || !inputSchemaId || parent.schemaId !== inputSchemaId) reasons.push(parent.reason || 'parent-recovery-unavailable');
  const uniqueReasons = unique(reasons);
  return freeze({ state: uniqueReasons.length ? 'unavailable' : 'qualified', reasons: freeze(uniqueReasons), remoteWrite: false, sourceMutation: false, relationMaterialization: false, concretePath: null, executablePattern: uniqueReasons.length === 0, scope: 'record', continuityMode: 'parent' });
}

function workspaceRootCreateCapability({ result, availability, creation, workspaceId, materializer }) {
  const reasons = [];
  const outputs = result.outputRoles || [];
  const output = outputs[0];
  const lifecycle = result.lifecycleEffects || [];
  const parents = result.parentEffects || [];
  const relations = result.relationEffects || [];
  const placements = result.outputPlacements || [];
  const destinations = result.destinationBindings || [];
  const outputSchemaId = token(output?.schemaConstraint);
  if (availability.availability !== 'available') reasons.push('canonical-transition-not-available');
  if (result.qualification !== 'qualified') reasons.push('canonical-result-semantics-not-qualified');
  if ((availability.inputRoles || []).length !== 0) reasons.push('root-create-requires-zero-input-roles');
  if (availability.context?.assignment !== 'none' || availability.context?.provided === true) reasons.push('root-create-current-artifact-context-not-empty');
  if (outputs.length !== 1) reasons.push('unsupported-output-role-arity');
  if (!supportedCanonicalOutput(output)) reasons.push('unsupported-output-capability');
  if (lifecycle.length !== 1 || !supportedLifecycle(lifecycle[0], output)) reasons.push('unsupported-lifecycle-capability');
  if (parents.length !== 0) reasons.push('root-create-parent-effect-not-allowed');
  if (relations.length !== 0) reasons.push('relation-effects-not-supported');
  if (!supportedLocalPlacement(placements, destinations, output)) reasons.push('unsupported-placement-capability');
  if (creation.state !== 'qualified' || creation.schemaId !== outputSchemaId) reasons.push('creation-authority-unavailable');
  if (!materializer || materializer.schemaId !== outputSchemaId) reasons.push('root-local-materializer-unavailable');
  if (!String(workspaceId || '').trim()) reasons.push('workspace-destination-unavailable');
  const uniqueReasons = unique(reasons);
  return freeze({ state: uniqueReasons.length ? 'unavailable' : 'qualified', reasons: freeze(uniqueReasons), remoteWrite: false, sourceMutation: false, relationMaterialization: false, concretePath: null, executablePattern: uniqueReasons.length === 0, scope: 'workspace', continuityMode: 'root' });
}

function supportedLifecycle(effect = {}, output = {}) {
  const mapping = token(effect.memberMapping?.declared);
  return effect.participation?.state === 'active' && effect.targetBinding?.resolvedName === output?.name
    && effect.effect === 'create-new' && effect.logicalContinuity === 'new-subject' && effect.requiredMaterializationOperation === 'create'
    && effect.resultBinding?.qualification === 'absent' && !token(effect.resultBinding?.declared)
    && ['', 'no'].includes(token(effect.preserveWhy)) && ['', 'single'].includes(mapping);
}
function supportedParentEffect(effect = {}, output = {}, parentRoleName = '') {
  return effect.participation?.state === 'active' && effect.effect === 'set' && effect.outputBinding?.resolvedName === output?.name
    && Boolean(parentRoleName) && ['', 'single'].includes(token(effect.memberMapping?.declared));
}
function supportedCanonicalParentRole(role = {}) {
  return role.targetKind === 'artifact' && role.effectiveParticipantKind === 'artifact' && Boolean(token(role.schemaConstraint))
    && exactNumericCardinality(role.cardinality?.minimum, 1) && exactNumericCardinality(role.cardinality?.maximum, 1)
    && role.acquisitionPolicy === 'existing-only';
}
function supportedCanonicalOutput(role = {}) {
  return role.targetKind === 'artifact' && role.effectiveParticipantKind === 'artifact' && Boolean(token(role.schemaConstraint))
    && exactNumericCardinality(role.minimumCount, 1) && exactNumericCardinality(role.maximumCount, 1)
    && role.generationBinding === 'target-schema';
}
function supportedLocalPlacement(placements = [], destinations = [], output = {}) {
  const placement = placements[0];
  const destination = destinations[0];
  const destinationFields = destination?.fields || {};
  return placements.length === 1 && destinations.length === 1
    && placement?.outputBinding?.resolvedName === output?.name
    && placement?.destinationBinding?.resolvedName === destination?.name
    && !token(placement?.relativeToBinding?.declared) && !placement?.relativeToBinding?.resolvedName
    && !token(placement?.relativePlacementMeaning) && !token(placement?.namingAuthorityReference)
    && placement?.placementIntent === 'new-materialization'
    && placement?.namingAuthority === 'explicit-binding'
    && placement?.explicitOverrideAllowed === 'no'
    && destination?.requiredQualification?.state === 'required'
    && !token(destinationFields['Destination Kind']) && !token(destinationFields['Capability Requirement']);
}
function exactNumericCardinality(value = {}, expected = 1) { return value.kind === 'numeric' && value.value === expected; }

function token(value = '') { return String(value || '').trim(); }
function unique(values = []) { return [...new Set(values.filter(Boolean))]; }
