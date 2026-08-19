export const CANONICAL_REFERENCE_CREATE_CAPABILITY_SCHEMA_ID = 'tiinex.site.canonical-reference-create-capability.v1';
const freeze = Object.freeze;

export function referenceCreateCapability(input = {}) {
  const reasons = [];
  const { result = {}, availability = {}, currentParticipant = null, workspaceId = '', generationQualification = null, materializer = null } = input;
  const outputs = result.outputRoles || [];
  const output = outputs[0];
  const inputs = availability.inputRoles || [];
  const currentRoleIds = availability.context?.candidateRoleIds || [];
  const lifecycle = result.lifecycleEffects || [];
  const parents = result.parentEffects || [];
  const relations = result.relationEffects || [];
  const placements = result.outputPlacements || [];
  const destinations = result.destinationBindings || [];
  const relation = relations[0];
  const currentRoleName = currentRoleIds.length === 1 ? currentRoleIds[0] : '';
  const currentRole = inputs.find((role) => role.name === currentRoleName);
  const targetRoleName = relation?.objectBinding?.resolvedName || '';
  const targetRole = inputs.find((role) => role.name === targetRoleName);
  const outputSchemaId = token(output?.schemaConstraint);

  if (availability.availability !== 'available') reasons.push('canonical-transition-not-available');
  if (result.qualification !== 'qualified') reasons.push('canonical-result-semantics-not-qualified');
  if (availability.context?.assignment !== 'unique' || !currentParticipant) reasons.push('current-artifact-role-not-unique');
  if (inputs.length !== 2) reasons.push('reference-requires-two-input-roles');
  if (outputs.length !== 1 || outputSchemaId !== 'tiinex.relation.v1') reasons.push('reference-relation-output-unqualified');
  if (!currentRoleName || relation?.subjectBinding?.resolvedName !== currentRoleName) reasons.push('reference-subject-not-current-artifact-role');
  if (!supportedExistingArtifactRole(currentRole) || currentParticipant?.candidateSchemaId !== currentRole?.schemaConstraint) reasons.push('reference-subject-schema-unqualified');
  if (!targetRoleName || targetRoleName === currentRoleName || !supportedExistingArtifactRole(targetRole)) reasons.push('reference-target-role-unqualified');
  if (!Array.isArray(targetRole?.cleanCandidateIds) || targetRole.cleanCandidateIds.length < 1) reasons.push('reference-target-candidate-unavailable');
  if (!supportedOutput(output)) reasons.push('reference-output-generation-unqualified');
  if (lifecycle.length !== 1 || !supportedLifecycle(lifecycle[0], output)) reasons.push('reference-lifecycle-unqualified');
  if (parents.length !== 0) reasons.push('reference-parent-effect-not-allowed');
  if (relations.length !== 1 || !supportedRelationEffect(relation, currentRoleName, targetRoleName)) reasons.push('reference-relation-effect-unqualified');
  if (!supportedLocalPlacement(placements, destinations, output)) reasons.push('reference-placement-unqualified');
  if (generationQualification?.qualification !== 'qualified'
    || generationQualification.outputRoleName !== output?.name
    || generationQualification.expectedTargetSchema !== outputSchemaId
    || generationQualification.authority?.generationTargetSchema !== outputSchemaId
    || generationQualification.declaredBinding !== output?.generationBinding) reasons.push('reference-generation-authority-unqualified');
  const exactRepresentations = generationQualification?.exactAuthorityRepresentations || {};
  if (exactRepresentations.transition?.state !== 'qualified'
    || exactRepresentations.generation?.state !== 'qualified'
    || exactRepresentations.generation?.reference !== generationQualification?.resolution?.target) reasons.push('reference-exact-authority-representation-unqualified');
  if (!materializer || materializer.schemaId !== outputSchemaId || !materializer.continuityModes?.includes?.('root')) reasons.push('reference-local-materializer-unavailable');
  if (!token(workspaceId)) reasons.push('workspace-destination-unavailable');

  const uniqueReasons = unique(reasons);
  return freeze({
    schema: CANONICAL_REFERENCE_CREATE_CAPABILITY_SCHEMA_ID,
    state: uniqueReasons.length ? 'unavailable' : 'qualified',
    reasons: freeze(uniqueReasons),
    scope: 'record',
    continuityMode: 'root',
    subjectRole: currentRoleName,
    targetRole: targetRoleName,
    targetSchemaId: token(targetRole?.schemaConstraint),
    targetCandidateParticipantIds: freeze([...(targetRole?.cleanCandidateIds || [])].filter((id) => id !== currentParticipant?.identity?.id)),
    outputRole: output?.name || '',
    outputSchemaId,
    relationEffect: relation || null,
    generationQualification,
    remoteWrite: false,
    sourceMutation: false,
    targetMutation: false,
    relationMaterialization: uniqueReasons.length === 0,
    concretePath: null,
    executablePattern: uniqueReasons.length === 0
  });
}

function supportedExistingArtifactRole(role = {}) {
  return role?.targetKind === 'artifact' && role?.effectiveParticipantKind === 'artifact'
    && Boolean(token(role?.schemaConstraint)) && role?.acquisitionPolicy === 'existing-only'
    && exactCount(role?.cardinality?.minimum, 1) && exactCount(role?.cardinality?.maximum, 1);
}
function supportedOutput(role = {}) {
  return role?.targetKind === 'artifact' && role?.effectiveParticipantKind === 'artifact'
    && token(role?.schemaConstraint) === 'tiinex.relation.v1'
    && exactCount(role?.minimumCount, 1) && exactCount(role?.maximumCount, 1)
    && Boolean(token(role?.generationBinding)) && role?.generationBinding !== 'target-schema';
}
function supportedLifecycle(effect = {}, output = {}) {
  const mapping = token(effect?.memberMapping?.declared);
  return effect?.participation?.state === 'active' && effect?.targetBinding?.resolvedName === output?.name
    && effect?.effect === 'create-new' && effect?.logicalContinuity === 'new-subject' && effect?.requiredMaterializationOperation === 'create'
    && effect?.resultBinding?.qualification === 'absent' && !token(effect?.resultBinding?.declared)
    && ['', 'no'].includes(token(effect?.preserveWhy)) && ['', 'single'].includes(mapping);
}
function supportedRelationEffect(effect = {}, subjectRole = '', objectRole = '') {
  return effect?.participation?.state === 'active'
    && effect?.semanticQualification?.state === 'qualified'
    && effect?.effect === 'declare'
    && effect?.subjectBinding?.resolvedName === subjectRole
    && effect?.objectBinding?.resolvedName === objectRole
    && token(effect?.predicateIdentifier)
    && token(effect?.predicateMeaning)
    && effect?.predicateScope === 'local-transition-definition'
    && effect?.portablePredicateIdentityClaimed === false
    && ['directed', 'undirected', 'bidirectional'].includes(token(effect?.directionality))
    && ['pairwise', 'single'].includes(token(effect?.memberMapping?.declared));
}
function supportedLocalPlacement(placements = [], destinations = [], output = {}) {
  const placement = placements[0], destination = destinations[0], destinationFields = destination?.fields || {};
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
function exactCount(value = {}, expected = 1) { return value?.kind === 'numeric' && value?.value === expected; }
function token(value = '') { return String(value || '').trim(); }
function unique(values = []) { return [...new Set(values.filter(Boolean))]; }
