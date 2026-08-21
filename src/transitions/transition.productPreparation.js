import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedArtifactParticipantIndex, resolveCurrentArtifactParticipant } from '../artifacts/artifact.participantIndex.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST, qualifyCanonicalTransitionSchemaCacheSubset } from './canonicalTransition.schemaCache.js';
import { buildTransitionDefinitionRegistry } from './transition.definitionRegistry.js';
import { buildCanonicalTransitionAvailabilityPlan } from './transition.availabilityPlanner.js';
import { buildCanonicalTransitionResultPlan } from './transition.resultSemantics.js';
import { localArtifactMaterializerForSchema } from './transition.localArtifactMaterializers.js';
import { localCreateCapability } from './transition.localCreateCapability.js';
import { referenceCreateCapability } from './transition.referenceCreateCapability.js';
import { qualifyPortableExplicitGenerationBinding } from '../tooling/portable/package/generation.binding.js';
import { recoverCanonicalParentReference, unavailableCanonicalParentReference } from './transition.parentReference.js';
import { qualifyExactAuthorityRepresentation } from './transition.authorityRepresentation.js';
export { recoverCanonicalParentReference, finalizeCanonicalParentReference } from './transition.parentReference.js';

export const CANONICAL_TRANSITION_PRODUCT_PREPARATION_SCHEMA_ID = 'tiinex.site.canonical-transition-product-preparation.v1';
export const CANONICAL_LOCAL_CREATE_CAPABILITY_SCHEMA_ID = 'tiinex.site.canonical-transition-local-create-capability.v1';
export const CANONICAL_TRANSITION_PRODUCT_CONTEXT_SCHEMA_ID = 'tiinex.site.canonical-transition-product-context.v1';
const TASK_SCHEMA_ID = 'tiinex.task.v1';
const ROOT_SCHEMA_ID = 'tiinex.root.v1';
const TRANSITION_SCHEMA_ID = 'tiinex.transition.definition.v1';
const SCHEMA_CONTRACT_SCHEMA_ID = 'tiinex.schema.contract.v1';
const SCHEMA_GENERATION_SCHEMA_ID = 'tiinex.schema.generation.v1';
const freeze = Object.freeze;

export function prepareCanonicalTransitionProductContext(input = {}) {
  const workspaceRecords = Array.isArray(input.workspaceRecords) ? input.workspaceRecords : [];
  const referenceRecords = Array.isArray(input.referenceRecords) ? input.referenceRecords : workspaceRecords;
  const schemaCache = Array.isArray(input.schemaCache) ? input.schemaCache : [];
  const bundledDefinitions = Array.isArray(input.bundledDefinitions) ? input.bundledDefinitions : [];
  const cacheQualification = qualifyProductSchemaCache(schemaCache);
  const participantIndex = buildLoadedArtifactParticipantIndex({ records: workspaceRecords });
  const referenceParticipantIndex = referenceRecords === workspaceRecords ? participantIndex : buildLoadedArtifactParticipantIndex({ records: referenceRecords });
  if (!cacheQualification.sourceQualified) return productContext({ workspaceRecords, referenceRecords, schemaCache, bundledDefinitions, participantIndex, referenceParticipantIndex, cacheQualification, state: 'schema-cache-unqualified' });

  const cache = Object.fromEntries(cacheQualification.entries.map((item) => [item.schemaId, item]));
  const creationAuthorities = buildCreationAuthorities(cacheQualification.entries);
  const definitionMaterials = [cache[ROOT_SCHEMA_ID]?.markdown || '', cache[TRANSITION_SCHEMA_ID]?.markdown || ''];
  const resolvers = buildProductSchemaResolvers(participantIndex, cacheQualification.entries, creationAuthorities);
  const records = workspaceRecords.concat(bundledDefinitionRecords(bundledDefinitions));
  const registry = buildTransitionDefinitionRegistry({ records, schemaMaterials: definitionMaterials, resolvers });
  const explicitGenerationAuthorities = buildExplicitGenerationAuthorities({ cache, registry, bundledDefinitions });
  return productContext({ workspaceRecords, referenceRecords, schemaCache, bundledDefinitions, participantIndex, referenceParticipantIndex, cacheQualification, cache, creationAuthorities, explicitGenerationAuthorities, registry, state: 'prepared' });
}

export function prepareCanonicalTransitionProductActions(input = {}) {
  const workspaceRecords = Array.isArray(input.workspaceRecords) ? input.workspaceRecords : [];
  const referenceRecords = Array.isArray(input.referenceRecords) ? input.referenceRecords : workspaceRecords;
  const schemaCache = Array.isArray(input.schemaCache) ? input.schemaCache : [];
  const bundledDefinitions = Array.isArray(input.bundledDefinitions) ? input.bundledDefinitions : [];
  const context = productContextMatches(input.productContext, workspaceRecords, referenceRecords, schemaCache, bundledDefinitions)
    ? input.productContext
    : prepareCanonicalTransitionProductContext({ workspaceRecords, referenceRecords, schemaCache, bundledDefinitions });
  const participantIndex = context.participantIndex;
  const currentParticipant = resolveCurrentArtifactParticipant(input.currentRecord, participantIndex);
  if (!context.cacheQualification?.sourceQualified) return preparation([], participantIndex, currentParticipant, context.cacheQualification, 'schema-cache-unqualified');

  const definitions = context.registry?.definitions || [];
  const availabilityPlan = buildCanonicalTransitionAvailabilityPlan({ definitions, participantIndex, currentArtifact: currentParticipant || input.currentRecord });
  const referenceParticipantIndex = context.referenceParticipantIndex || participantIndex;
  const referenceCurrentParticipant = referenceParticipantIndex === participantIndex
    ? currentParticipant
    : resolveCurrentArtifactParticipant(input.currentRecord, referenceParticipantIndex);
  const referenceAvailabilityPlan = referenceParticipantIndex === participantIndex
    ? availabilityPlan
    : buildCanonicalTransitionAvailabilityPlan({ definitions, participantIndex: referenceParticipantIndex, currentArtifact: referenceCurrentParticipant || input.currentRecord });
  const referenceAvailabilityByDefinition = new Map(referenceAvailabilityPlan.transitions.map((item) => [availabilityDefinitionKey(item), item]));
  const actions = availabilityPlan.transitions.map((localAvailability) => {
    const definition = definitionForAvailability(definitions, localAvailability);
    const result = definition ? buildCanonicalTransitionResultPlan({ definition }) : null;
    const reference = Boolean((result?.relationEffects || []).length);
    const availability = reference ? (referenceAvailabilityByDefinition.get(availabilityDefinitionKey(localAvailability)) || localAvailability) : localAvailability;
    return buildProductAction({
      definition,
      availability,
      participantIndex: reference ? referenceParticipantIndex : participantIndex,
      currentParticipant: reference ? referenceCurrentParticipant : currentParticipant,
      currentRecord: input.currentRecord,
      workspaceId: input.workspaceId,
      cache: context.cache,
      creationAuthorities: context.creationAuthorities,
      explicitGenerationAuthorities: context.explicitGenerationAuthorities,
      productScope: 'record'
    });
  }).filter((action) => action?.capability?.scope === 'record');
  return preparation(actions, participantIndex, currentParticipant, context.cacheQualification, 'prepared', context.registry);
}


export function prepareCanonicalTransitionWorkspaceActions(input = {}) {
  const schemaCache = Array.isArray(input.schemaCache) ? input.schemaCache : [];
  const bundledDefinitions = Array.isArray(input.bundledDefinitions) ? input.bundledDefinitions : [];
  // Workspace-level standalone Create is intentionally derived from exact bundled
  // zero-input definitions. It does not rebuild a participant index from every card.
  const context = prepareCanonicalTransitionProductContext({ workspaceRecords: [], schemaCache, bundledDefinitions });
  const participantIndex = context.participantIndex;
  if (!context.cacheQualification?.sourceQualified) return preparation([], participantIndex, null, context.cacheQualification, 'schema-cache-unqualified', context.registry);

  const availabilityPlan = buildCanonicalTransitionAvailabilityPlan({
    definitions: context.registry?.definitions || [],
    participantIndex,
    currentArtifact: null
  });
  const actions = availabilityPlan.transitions.map((availability) => {
    const definition = definitionForAvailability(context.registry?.definitions || [], availability);
    return buildProductAction({
      definition,
      availability,
      participantIndex,
      currentParticipant: null,
      currentRecord: null,
      workspaceId: input.workspaceId,
      cache: context.cache,
      creationAuthorities: context.creationAuthorities,
      explicitGenerationAuthorities: context.explicitGenerationAuthorities,
      productScope: 'workspace'
    });
  }).filter((action) => action?.capability?.scope === 'workspace');
  return preparation(actions, participantIndex, null, context.cacheQualification, 'prepared', context.registry);
}

function productContext(input = {}) {
  return freeze({
    schema: CANONICAL_TRANSITION_PRODUCT_CONTEXT_SCHEMA_ID,
    state: input.state || 'prepared',
    workspaceRecords: input.workspaceRecords || [],
    referenceRecords: input.referenceRecords || input.workspaceRecords || [],
    schemaCache: input.schemaCache || [],
    bundledDefinitions: input.bundledDefinitions || [],
    participantIndex: input.participantIndex || buildLoadedArtifactParticipantIndex({ records: [] }),
    referenceParticipantIndex: input.referenceParticipantIndex || input.participantIndex || buildLoadedArtifactParticipantIndex({ records: [] }),
    cacheQualification: input.cacheQualification || null,
    cache: freeze({ ...(input.cache || {}) }),
    creationAuthorities: freeze({ ...(input.creationAuthorities || {}) }),
    explicitGenerationAuthorities: freeze({ ...(input.explicitGenerationAuthorities || {}) }),
    registry: input.registry || null,
    readOnly: true,
    mutation: false,
    networkFetch: false
  });
}

function productContextMatches(context, workspaceRecords, referenceRecords, schemaCache, bundledDefinitions) {
  return context?.schema === CANONICAL_TRANSITION_PRODUCT_CONTEXT_SCHEMA_ID
    && context.workspaceRecords === workspaceRecords
    && context.referenceRecords === referenceRecords
    && context.schemaCache === schemaCache
    && context.bundledDefinitions === bundledDefinitions;
}

function qualifyProductSchemaCache(entries = []) {
  const foundation = qualifyCanonicalTransitionSchemaCacheSubset(entries, [ROOT_SCHEMA_ID, TRANSITION_SCHEMA_ID]);
  if (!foundation.sourceQualified) return foundation;
  const qualifiedById = new Map(foundation.entries.map((item) => [item.schemaId, item]));
  const findings = [...foundation.findings];
  for (const expected of CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST) {
    if (expected.schemaId === ROOT_SCHEMA_ID || expected.schemaId === TRANSITION_SCHEMA_ID) continue;
    const matches = (Array.isArray(entries) ? entries : []).filter((item) => String(item?.schemaId || '') === expected.schemaId);
    if (!matches.length) continue;
    const result = qualifyCanonicalTransitionSchemaCacheSubset(entries, [expected.schemaId]);
    if (result.sourceQualified) qualifiedById.set(expected.schemaId, result.entries[0]);
    else findings.push(...result.findings);
  }
  return freeze({
    status: 'qualified',
    sourceQualified: true,
    entries: freeze([...qualifiedById.values()]),
    findings: freeze(findings),
    foundationQualified: true
  });
}

export function creationAuthorityForSchemaFromCache(cacheEntries = [], schemaId = '') {
  const targetSchemaId = token(schemaId);
  const cacheQualification = qualifyCanonicalTransitionSchemaCacheSubset(cacheEntries, [ROOT_SCHEMA_ID, targetSchemaId]);
  if (!targetSchemaId || !cacheQualification.sourceQualified) return unresolvedCreationAuthority(targetSchemaId);
  const bySchema = Object.fromEntries(cacheQualification.entries.map((item) => [item.schemaId, item]));
  if (!bySchema[ROOT_SCHEMA_ID]?.markdown || !bySchema[targetSchemaId]?.markdown) return unresolvedCreationAuthority(targetSchemaId);
  try {
    const compiled = compilePortableSchemaContractChain([bySchema[ROOT_SCHEMA_ID].markdown, bySchema[targetSchemaId].markdown]);
    const creation = compiled.creation || {};
    const usable = compiled.schemaId === targetSchemaId
      && compiled.lineageQualification?.state === 'valid'
      && compiled.lineageQualification?.complete === true
      && (creation.requiredInputs || []).length > 0;
    return freeze({
      state: usable ? 'qualified' : 'unresolved',
      schemaId: targetSchemaId,
      requiredInputs: freeze([...(creation.requiredInputs || [])]),
      optionalInputs: freeze([...(creation.optionalInputs || [])]),
      requiredSections: freeze([...(creation.requiredSections || [])]),
      toolingConfigurationFields: freeze([...(creation.toolingConfigurationFields || [])]),
      compiled: usable ? compiled : null
    });
  } catch (_) { return unresolvedCreationAuthority(targetSchemaId); }
}

export function taskCreationAuthorityFromCache(cacheEntries = []) {
  return creationAuthorityForSchemaFromCache(cacheEntries, TASK_SCHEMA_ID);
}

function unresolvedCreationAuthority(schemaId = '') {
  return freeze({ state: 'unresolved', schemaId: token(schemaId), requiredInputs: freeze([]), optionalInputs: freeze([]), requiredSections: freeze([]), toolingConfigurationFields: freeze([]), compiled: null });
}

function buildProductAction({ definition, availability, participantIndex, currentParticipant, currentRecord, workspaceId, cache, creationAuthorities, explicitGenerationAuthorities, productScope = 'record' }) {
  if (!definition) return null;
  const result = buildCanonicalTransitionResultPlan({ definition });
  const output = result.outputRoles?.[0];
  const outputSchemaId = token(output?.schemaConstraint);
  const creation = creationAuthorities?.[outputSchemaId] || unresolvedCreationAuthority(outputSchemaId);
  const parent = productScope === 'workspace' ? null : (currentParticipant ? recoverCanonicalParentReference(currentRecord || {}, currentParticipant) : unavailableCanonicalParentReference('current-artifact-not-resolved'));
  const materializer = localArtifactMaterializerForSchema(outputSchemaId);
  const invocationRepresentationBindings = freeze({ parentTarget: canonicalSourceTargetForParent(parent) });
  const fixedInputs = materializer?.authoringInputsFromInvocationBindings
    ? freeze({ ...(materializer.authoringInputsFromInvocationBindings(invocationRepresentationBindings) || {}) })
    : freeze({});
  const identity = definition.transitionIdentity || {};
  const executionKey = definitionExecutionKey(definition);
  const explicitGeneration = explicitGenerationAuthorities?.[`${executionKey}\u0000${output?.name || ''}`] || null;
  const referenceSupport = productScope === 'record' && (result.relationEffects || []).length
    ? referenceCreateCapability({ result, availability, currentParticipant, workspaceId, generationQualification: explicitGeneration, materializer })
    : null;
  const support = referenceSupport || localCreateCapability({ result, availability, creation, currentParticipant, workspaceId, parent, materializer, productScope });
  return freeze({
    schema: CANONICAL_LOCAL_CREATE_CAPABILITY_SCHEMA_ID,
    id: `canonical-transition:${executionKey}`,
    canonicalIdentifier: String(identity['Canonical Identifier'] || ''),
    label: String(identity['Human Label'] || identity.Name || 'Transition'),
    icon: canonicalTransitionProductIcon({ productScope, result, creation, referenceSupport, support }),
    kind: 'canonical-transition-product',
    productScope,
    description: String(definition.purposeAndScope?.Purpose || definition.purposeAndScope?.purpose || ''),
    continuityMode: support.continuityMode || 'parent',
    definitionKey: executionKey,
    identityConflict: null,
    definition,
    availability,
    resultSemantics: result,
    currentParticipant,
    parentRecovery: parent,
    authoring: freeze({
      schemaId: outputSchemaId,
      schemaLabel: materializer?.label || outputSchemaId || 'Artifact',
      requiredInputs: creation.requiredInputs,
      optionalInputs: creation.optionalInputs,
      requiredSections: creation.requiredSections,
      toolingConfigurationFields: creation.toolingConfigurationFields,
      fixedInputs
    }),
    explicitGenerationQualification: explicitGeneration,
    referenceCapability: referenceSupport,
    productCapable: support.state === 'qualified',
    capability: support,
    enabled: support.state === 'qualified'
  });
}


function canonicalTransitionProductIcon({ productScope = 'record', result = {}, creation = {}, referenceSupport = null, support = {} } = {}) {
  if (referenceSupport || (result.relationEffects || []).length) return 'reference';
  if (productScope === 'workspace' || support.continuityMode === 'root') return 'create';
  if (support.continuityMode === 'parent' || (result.parentEffects || []).length) return 'continue';
  return 'create';
}


function buildExplicitGenerationAuthorities({ cache = {}, registry = null, bundledDefinitions = [] } = {}) {
  const out = {};
  const root = cache[ROOT_SCHEMA_ID]?.markdown || '';
  const transitionSchema = cache[TRANSITION_SCHEMA_ID]?.markdown || '';
  const schemaContract = cache[SCHEMA_CONTRACT_SCHEMA_ID]?.markdown || '';
  const generationSchema = cache[SCHEMA_GENERATION_SCHEMA_ID]?.markdown || '';
  if (!root || !transitionSchema || !schemaContract || !generationSchema) return freeze(out);
  let transitionContract, generationContract;
  try {
    transitionContract = compilePortableSchemaContractChain([root, transitionSchema]);
    generationContract = compilePortableSchemaContractChain([root, schemaContract, generationSchema]);
  } catch (_) { return freeze(out); }
  if (transitionContract.lineageQualification?.state !== 'valid' || transitionContract.lineageQualification?.complete !== true) return freeze(out);
  if (generationContract.lineageQualification?.state !== 'valid' || generationContract.lineageQualification?.complete !== true) return freeze(out);

  for (const supplied of Array.isArray(bundledDefinitions) ? bundledDefinitions : []) {
    const generationMaterials = Array.isArray(supplied?.generationMaterials) ? supplied.generationMaterials : [];
    if (!generationMaterials.length) continue;
    const definition = exactOne((registry?.definitions || []).filter((candidate) => token(candidate?.artifact?.path) === token(supplied.path)));
    if (!definition) continue;
    const result = buildCanonicalTransitionResultPlan({ definition });
    for (const output of result.outputRoles || []) {
      const declared = token(output.generationBinding);
      if (!declared || declared === 'target-schema') continue;
      const transitionMaterial = freeze({
        id: supplied.id || `bundled-transition:${definitionExecutionKey(definition)}`,
        path: supplied.path || '',
        markdown: supplied.markdown || '',
        source: freeze({ ...(supplied.source || {}) })
      });
      const qualification = qualifyPortableExplicitGenerationBinding({
        transitionMaterial,
        outputRoleName: output.name,
        expectedTargetSchema: token(output.schemaConstraint),
        materials: [transitionMaterial, ...generationMaterials],
        transitionContract,
        generationContract
      });
      const selectedPath = token(qualification.authority?.selectedRepresentation?.path);
      const generationMaterial = exactOne(generationMaterials.filter((item) => token(item?.path) === selectedPath));
      const exactAuthorityRepresentations = freeze({
        transition: qualifyExactAuthorityRepresentation({
          reference: transitionMaterial.path ? `site-local:${transitionMaterial.path}` : '',
          path: transitionMaterial.path,
          markdown: transitionMaterial.markdown
        }),
        generation: qualifyExactAuthorityRepresentation({
          reference: token(qualification.resolution?.target),
          path: generationMaterial?.path || '',
          markdown: generationMaterial?.markdown || ''
        })
      });
      out[`${definitionExecutionKey(definition)}\u0000${output.name}`] = freeze({ ...qualification, exactAuthorityRepresentations });
    }
  }
  return freeze(out);
}


function buildCreationAuthorities(cacheEntries = []) {
  const out = {};
  for (const entry of cacheEntries || []) {
    const schemaId = token(entry?.schemaId);
    if (!schemaId || schemaId === ROOT_SCHEMA_ID || schemaId === TRANSITION_SCHEMA_ID) continue;
    out[schemaId] = creationAuthorityForSchemaFromCache(cacheEntries, schemaId);
  }
  return freeze(out);
}

function buildProductSchemaResolvers(participantIndex, cacheEntries, creationAuthorities = {}) {
  const schemaAuthorities = {};
  for (const participant of participantIndex.participants || []) if (participant.cleanCandidate && participant.candidateSchemaId) schemaAuthorities[participant.candidateSchemaId] = freeze({ targetKind: 'artifact' });
  for (const entry of cacheEntries || []) {
    const schemaId = token(entry?.schemaId);
    if (!schemaId || schemaId === ROOT_SCHEMA_ID || schemaId === TRANSITION_SCHEMA_ID) continue;
    const creation = creationAuthorities[schemaId] || unresolvedCreationAuthority(schemaId);
    schemaAuthorities[schemaId] = freeze({ ...(schemaAuthorities[schemaId] || {}), targetKind: 'artifact', generation: creation.state === 'qualified' });
  }
  return freeze({ schemaAuthorities: freeze(schemaAuthorities) });
}

function bundledDefinitionRecords(definitions = []) {
  return (Array.isArray(definitions) ? definitions : []).map((item) => Object.assign(createRecordFromMarkdown(String(item.markdown || ''), { path: item.path || '', name: item.title || '', sourceMode: item.sourceMode || 'bundled-canonical-transition-definition' }), item));
}
function preparation(actions, participantIndex, currentParticipant, cacheQualification, state, registry = null, identityConflicts = []) {
  return freeze({ schema: CANONICAL_TRANSITION_PRODUCT_PREPARATION_SCHEMA_ID, state, actions: freeze(actions), participantIndex, currentParticipant, cacheQualification, registry, identityConflicts: freeze(identityConflicts), readOnly: true, mutation: false, networkFetch: false });
}
function availabilityDefinitionKey(availability = {}) {
  return token(availability.definition?.artifactRegistryIdentity || availability.definition?.artifactId || availability.definition?.canonicalIdentifier);
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
function exactOne(values = []) { return values.length === 1 ? values[0] : null; }
function markdownLabel(value) { return String(value || '').replace(/[\[\]\n\r]/g, ' ').trim() || 'Topic'; }
function canonicalSourceTargetForParent(parent = {}) {
  const traceTarget = token(parent?.traceTarget);
  const originTarget = token(parent?.originTarget);
  const kind = token(parent?.representationKind);
  if ((kind === 'github-issue-embedded' || kind === 'github-comment-embedded') && traceTarget && originTarget) return `${traceTarget} @ ${originTarget}`;
  return traceTarget || originTarget;
}

function token(value = '') { return String(value || '').trim(); }
