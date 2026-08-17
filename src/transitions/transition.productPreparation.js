import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedArtifactParticipantIndex, resolveCurrentArtifactParticipant } from '../artifacts/artifact.participantIndex.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/index.js';
import { qualifyCanonicalTransitionSchemaCache } from './canonicalTransition.schemaCache.js';
import { buildTransitionDefinitionRegistry } from './transition.definitionRegistry.js';
import { buildCanonicalTransitionAvailabilityPlan } from './transition.availabilityPlanner.js';
import { buildCanonicalTransitionResultPlan } from './transition.resultSemantics.js';

export const CANONICAL_TRANSITION_PRODUCT_PREPARATION_SCHEMA_ID = 'tiinex.site.canonical-transition-product-preparation.v1';
export const CANONICAL_LOCAL_CREATE_CAPABILITY_SCHEMA_ID = 'tiinex.site.canonical-transition-local-create-capability.v1';
const TOPIC_SCHEMA_ID = 'tiinex.topic.v1';
const TASK_SCHEMA_ID = 'tiinex.task.v1';
const ROOT_SCHEMA_ID = 'tiinex.root.v1';
const TRANSITION_SCHEMA_ID = 'tiinex.transition.definition.v1';
const freeze = Object.freeze;

export function prepareCanonicalTransitionProductActions(input = {}) {
  const workspaceRecords = Array.isArray(input.workspaceRecords) ? input.workspaceRecords : [];
  const cacheQualification = qualifyCanonicalTransitionSchemaCache(input.schemaCache || []);
  const participantIndex = buildLoadedArtifactParticipantIndex({ records: workspaceRecords });
  const currentParticipant = resolveCurrentArtifactParticipant(input.currentRecord, participantIndex);
  if (!cacheQualification.sourceQualified) return preparation([], participantIndex, currentParticipant, cacheQualification, 'schema-cache-unqualified');

  const cache = Object.fromEntries(cacheQualification.entries.map((item) => [item.schemaId, item]));
  const definitionMaterials = [cache[ROOT_SCHEMA_ID]?.markdown || '', cache[TRANSITION_SCHEMA_ID]?.markdown || ''];
  const resolvers = buildProductSchemaResolvers(participantIndex, cacheQualification.entries);
  const records = workspaceRecords.concat(bundledDefinitionRecords(input.bundledDefinitions));
  const registry = buildTransitionDefinitionRegistry({ records, schemaMaterials: definitionMaterials, resolvers });
  const availabilityPlan = buildCanonicalTransitionAvailabilityPlan({ definitions: registry.definitions, participantIndex, currentArtifact: currentParticipant || input.currentRecord });
  const actions = availabilityPlan.transitions.map((availability) => {
    const definition = definitionForAvailability(registry.definitions, availability);
    return buildProductAction({
      definition,
      availability,
      participantIndex,
      currentParticipant,
      currentRecord: input.currentRecord,
      workspaceId: input.workspaceId,
      cache
    });
  }).filter(Boolean);
  return preparation(actions, participantIndex, currentParticipant, cacheQualification, 'prepared', registry);
}

export function recoverCanonicalParentReference(record = {}, participant = {}) {
  const source = record.source || {};
  const target = record.sourceTarget || {};
  const adapterId = token(participant.source?.adapterId || source.adapterId);
  const sourceMode = token(participant.source?.sourceMode || record.sourceMode);
  const sourceKind = token(source.kind || source.sourceKind);
  const repository = token(source.repository || source.repo || source.config?.repo);
  const ref = token(source.ref || source.requestedRef || source.config?.ref || participant.source?.ref);
  const path = String(target.sourceArtifactPath || record.path || participant.source?.sourceArtifactPath || '').replace(/^\/+/, '');
  const schemaId = token(participant.candidateSchemaId);
  if (adapterId !== 'github' || /(^|[^a-z0-9])(local|session)([^a-z0-9]|$)/i.test(`${sourceMode} ${sourceKind}`) || !repository || !/^[0-9a-f]{40}$/i.test(ref) || !path) return unavailableParent();
  const permalink = githubCommitPermalink(repository, ref, path);
  if (!permalink) return unavailableParent('source-topic-parent-link-target-unavailable');
  const label = markdownLabel(record.title || participant.artifact?.title || 'Topic');
  return freeze({ state: 'qualified', trace: `[${label}](${permalink})`, origin: `[browse + git](${permalink})`, permalink, repository, ref, path, schemaId });
}

export function taskCreationAuthorityFromCache(cacheEntries = []) {
  const cacheQualification = qualifyCanonicalTransitionSchemaCache(cacheEntries);
  if (!cacheQualification.sourceQualified) return freeze({ state: 'unresolved', requiredInputs: freeze([]), requiredSections: freeze([]), toolingConfigurationFields: freeze([]), compiled: null });
  const bySchema = Object.fromEntries(cacheQualification.entries.map((item) => [item.schemaId, item]));
  try {
    const compiled = compilePortableSchemaContractChain([bySchema[ROOT_SCHEMA_ID].markdown, bySchema[TASK_SCHEMA_ID].markdown]);
    const creation = compiled.creation || {};
    const usable = compiled.schemaId === TASK_SCHEMA_ID && compiled.lineageQualification?.state === 'valid' && compiled.lineageQualification?.complete === true && (creation.requiredInputs || []).length > 0;
    return freeze({ state: usable ? 'qualified' : 'unresolved', requiredInputs: freeze([...(creation.requiredInputs || [])]), optionalInputs: freeze([...(creation.optionalInputs || [])]), requiredSections: freeze([...(creation.requiredSections || [])]), toolingConfigurationFields: freeze([...(creation.toolingConfigurationFields || [])]), compiled: usable ? compiled : null });
  } catch (_) { return freeze({ state: 'unresolved', requiredInputs: freeze([]), optionalInputs: freeze([]), requiredSections: freeze([]), toolingConfigurationFields: freeze([]), compiled: null }); }
}

function buildProductAction({ definition, availability, participantIndex, currentParticipant, currentRecord, workspaceId, cache }) {
  if (!definition) return null;
  const result = buildCanonicalTransitionResultPlan({ definition });
  const creation = taskCreationAuthorityFromCache(Object.values(cache));
  const parent = currentParticipant ? recoverCanonicalParentReference(currentRecord || {}, currentParticipant) : unavailableParent('current-topic-not-resolved');
  const support = localCreateCapability({ result, availability, creation, currentParticipant, workspaceId, parent });
  const identity = definition.transitionIdentity || {};
  const executionKey = definitionExecutionKey(definition);
  return freeze({
    schema: CANONICAL_LOCAL_CREATE_CAPABILITY_SCHEMA_ID,
    id: `canonical-transition:${executionKey}`,
    canonicalIdentifier: String(identity['Canonical Identifier'] || ''),
    label: String(identity['Human Label'] || identity.Name || 'Transition'),
    icon: 'create',
    kind: 'canonical-transition-product',
    definitionKey: executionKey,
    identityConflict: null,
    definition,
    availability,
    resultSemantics: result,
    currentParticipant,
    parentRecovery: parent,
    authoring: freeze({ schemaId: TASK_SCHEMA_ID, requiredInputs: creation.requiredInputs, requiredSections: creation.requiredSections, toolingConfigurationFields: creation.toolingConfigurationFields }),
    productCapable: support.state === 'qualified',
    capability: support,
    enabled: support.state === 'qualified'
  });
}

function localCreateCapability({ result, availability, creation, currentParticipant, workspaceId, parent }) {
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

  if (availability.availability !== 'available') reasons.push('canonical-transition-not-available');
  if (result.qualification !== 'qualified') reasons.push('canonical-result-semantics-not-qualified');
  if (availability.context?.assignment !== 'unique' || !currentParticipant) reasons.push('current-artifact-role-not-unique');
  if ((availability.inputRoles || []).length !== 1) reasons.push('unsupported-input-role-arity');
  if (outputs.length !== 1) reasons.push('unsupported-output-role-arity');
  if (currentRoleIds.length !== 1 || !parentRoleName || parentRoleName !== currentRoleIds[0]) reasons.push('parent-role-not-current-artifact-role');
  if (!supportedTopicParentRole(parentRole)) reasons.push('unsupported-parent-role-capability');
  if (currentParticipant?.cleanCandidate !== true || currentParticipant?.candidateSchemaId !== TOPIC_SCHEMA_ID) reasons.push('current-topic-schema-unqualified');
  if (!supportedTaskOutput(output)) reasons.push('unsupported-output-capability');
  if (lifecycle.length !== 1 || !supportedLifecycle(lifecycle[0], output)) reasons.push('unsupported-lifecycle-capability');
  if (parents.length !== 1 || !supportedParentEffect(parentEffect, output, parentRoleName)) reasons.push('unsupported-parent-capability');
  if (relations.length) reasons.push('relation-effects-not-supported');
  if (!supportedLocalPlacement(placements, destinations, output)) reasons.push('unsupported-placement-capability');
  if (creation.state !== 'qualified') reasons.push('task-creation-authority-unavailable');
  if (!String(workspaceId || '').trim()) reasons.push('workspace-destination-unavailable');
  if (parent.state !== 'qualified' || parent.schemaId !== TOPIC_SCHEMA_ID) reasons.push(parent.reason || 'parent-recovery-unavailable');
  const uniqueReasons = unique(reasons);
  return freeze({ state: uniqueReasons.length ? 'unavailable' : 'qualified', reasons: freeze(uniqueReasons), remoteWrite: false, sourceMutation: false, relationMaterialization: false, concretePath: null, executablePattern: uniqueReasons.length === 0 });
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
function supportedTopicParentRole(role = {}) {
  return role.targetKind === 'artifact' && role.effectiveParticipantKind === 'artifact' && role.schemaConstraint === TOPIC_SCHEMA_ID
    && exactNumericCardinality(role.cardinality?.minimum, 1) && exactNumericCardinality(role.cardinality?.maximum, 1)
    && role.acquisitionPolicy === 'existing-only';
}
function supportedTaskOutput(role = {}) {
  return role.targetKind === 'artifact' && role.effectiveParticipantKind === 'artifact' && role.schemaConstraint === TASK_SCHEMA_ID
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

function buildProductSchemaResolvers(participantIndex, cacheEntries) {
  const schemaAuthorities = {};
  for (const participant of participantIndex.participants || []) if (participant.cleanCandidate && participant.candidateSchemaId) schemaAuthorities[participant.candidateSchemaId] = freeze({ targetKind: 'artifact' });
  const creation = taskCreationAuthorityFromCache(cacheEntries);
  if (creation.state === 'qualified') schemaAuthorities[TASK_SCHEMA_ID] = freeze({ targetKind: 'artifact', generation: true });
  return freeze({ schemaAuthorities: freeze(schemaAuthorities) });
}
function bundledDefinitionRecords(definitions = []) {
  return (Array.isArray(definitions) ? definitions : []).map((item) => Object.assign(createRecordFromMarkdown(String(item.markdown || ''), { path: item.path || '', name: item.title || '', sourceMode: item.sourceMode || 'bundled-canonical-transition-definition' }), item));
}
function preparation(actions, participantIndex, currentParticipant, cacheQualification, state, registry = null, identityConflicts = []) {
  return freeze({ schema: CANONICAL_TRANSITION_PRODUCT_PREPARATION_SCHEMA_ID, state, actions: freeze(actions), participantIndex, currentParticipant, cacheQualification, registry, identityConflicts: freeze(identityConflicts), readOnly: true, mutation: false, networkFetch: false });
}
function definitionForAvailability(definitions = [], availability = {}) {
  const registryIdentity = token(availability.definition?.artifactRegistryIdentity);
  if (registryIdentity) return exactOne(definitions.filter((candidate) => token(candidate.artifact?.registryIdentity) === registryIdentity));
  const artifactId = token(availability.definition?.artifactId);
  return artifactId ? exactOne(definitions.filter((candidate) => token(candidate.artifact?.id) === artifactId)) : null;
}
function definitionExecutionKey(definition = {}) {
  return JSON.stringify([token(definition.transitionIdentity?.['Canonical Identifier']), token(definition.artifact?.registryIdentity || definition.artifact?.id)]);
}
function unavailableParent(reason = 'source-topic-portable-parent-reference-unavailable') {
  return freeze({ state: 'unavailable', trace: '', origin: '', permalink: '', repository: '', ref: '', path: '', schemaId: '', reason });
}
function githubCommitPermalink(repository, ref, path) {
  try {
    const repo = encodeGithubPath(repository);
    const encodedPath = encodeGithubPath(path);
    const target = repo && encodedPath ? `https://github.com/${repo}/blob/${ref}/${encodedPath}` : '';
    return target && !/[)\s]/.test(target) ? target : '';
  } catch (_) { return ''; }
}
function encodeGithubPath(value = '') {
  return String(value).split('/').map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)).join('/');
}
function exactOne(values = []) { return values.length === 1 ? values[0] : null; }
function markdownLabel(value) { return String(value || '').replace(/[\[\]\n\r]/g, ' ').trim() || 'Topic'; }
function token(value = '') { return String(value || '').trim(); }
function unique(values = []) { return [...new Set(values.filter(Boolean))]; }
