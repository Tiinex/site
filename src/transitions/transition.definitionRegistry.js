import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { schemaIdForRecord } from '../schemas/schema.identity.js';
import '../sources/source.identity.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { projectPortableContractInstance } from '../tooling/portable/schema/contract.project.js';
import { resolvePortableSchemaChainMaterial } from '../tooling/portable/providers/schema.providers.js';
import { CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID, LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID } from './transition.legacyShorthand.js';
import { collectTransitionDefinitionRegistryRecords, readTransitionDefinitionRepresentationQualification, readTransitionDefinitionSchemaQualification, registryIdentityForRecord, sourceBoundaryIdentity, sourceBoundarySignature } from './transition.definitionRegistryAggregation.js';
import { projectTransitionDefinitionPortableRead } from './transition.definitionReadProjection.js';

export const TRANSITION_DEFINITION_REGISTRY_SCHEMA_ID = 'tiinex.site.transition-definition-registry.v1';
export const TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID = 'tiinex.site.transition-definition-read-model.v1';

const ROOT_SCHEMA_ID = 'tiinex.root.v1';

export async function buildTransitionDefinitionRegistryFromPortableMaterial(input = {}) {
  const resolution = await resolvePortableSchemaChainMaterial({
    schemaId: CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID,
    records: Array.isArray(input.schemaRecords) ? input.schemaRecords : [],
    files: Array.isArray(input.schemaFiles) ? input.schemaFiles : [],
    schemaCache: input.schemaCache,
    providerResponses: input.providerResponses
  }, { providers: [] });
  const registry = buildTransitionDefinitionRegistry({
    ...input,
    schemaMaterial: undefined,
    schemaMaterials: resolution.materials?.files || [],
    schemaContracts: undefined,
    schemaRecords: []
  });
  return Object.freeze({
    ...registry,
    schemaMaterialResolution: Object.freeze({
      status: resolution.status,
      nodes: Object.freeze([...(resolution.nodes || [])]),
      providerRequest: resolution.providerRequest || null,
      findings: Object.freeze([...(resolution.findings || [])])
    })
  });
}

export function buildTransitionDefinitionRegistry(input = {}) {
  const records = collectTransitionDefinitionRegistryRecords(input, declaredRecordSchemaId, recordSchemaId, CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID);
  const definitions = records
    .filter((record) => isCanonicalTransitionDefinitionRecord(record))
    .map((record) => buildTransitionDefinitionReadModel(record, input))
    .sort(compareReadModels);
  return Object.freeze({
    schema: TRANSITION_DEFINITION_REGISTRY_SCHEMA_ID,
    count: definitions.length,
    definitions: Object.freeze(definitions),
    boundary: Object.freeze({
      readOnly: true,
      applicability: 'not-evaluated',
      execution: 'not-authorized',
      mutation: false
    })
  });
}

export function buildTransitionDefinitionReadModel(record = {}, input = {}) {
  const schemaChain = compileDefinitionSchemaChain(input);
  const chainQualification = schemaChain?.lineageQualification || unresolvedQualification('Canonical Root→Transition Definition schema material is not fully supplied.');
  const completeAuthority = chainQualification.state === 'valid' && chainQualification.complete === true;
  const instanceProjection = schemaChain
    ? projectPortableContractInstance({
        markdown: String(record.markdown || ''),
        compiledContract: schemaChain,
        resolvers: input.resolvers || {}
      })
    : unresolvedInstanceProjection();
  const validation = instanceProjection.validation;
  const portableRead = projectTransitionDefinitionPortableRead(instanceProjection);
  const ordinaryReadAuthority = ordinaryReadAuthorityQualification(schemaChain);
  const representationQualification = readTransitionDefinitionRepresentationQualification(record);
  const schemaQualification = readTransitionDefinitionSchemaQualification(record, CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID);
  const diagnostics = buildDiagnostics(chainQualification, validation, record, schemaQualification, ordinaryReadAuthority);
  const validationReadable = validation.status !== 'structurally-invalid';
  const contractReadValid = validation.status === 'valid' || validation.status === 'valid-with-preserved-unknowns';
  const canonicalSchemaClean = schemaQualification.state === 'equivalent'
    && schemaQualification.declaredSchemaIds.length === 1
    && schemaQualification.declaredSchemaIds[0] === CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID;
  const canonicalReadQualified = canonicalSchemaClean
    && completeAuthority
    && representationQualification.state === 'equivalent'
    && contractReadValid
    && ordinaryReadAuthority.state === 'available';
  return Object.freeze({
    schema: TRANSITION_DEFINITION_READ_MODEL_SCHEMA_ID,
    artifact: artifactIdentity(record),
    source: sourceIdentity(record),
    transitionIdentity: portableRead.transitionIdentity,
    ordinaryProjection: portableRead.ordinaryProjection,
    ordinaryReadAuthority,
    schemaChain: Object.freeze({
      schemaId: schemaChain?.schemaId || CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID,
      lineage: Object.freeze([...(chainQualification.lineage || [])]),
      suppliedLineage: Object.freeze([...(schemaChain?.suppliedLineage || [])]),
      state: chainQualification.state,
      complete: chainQualification.complete === true,
      completeAuthority
    }),
    contractValidation: Object.freeze({
      status: validation.status,
      states: validation.states || Object.freeze({ primary: 'unresolved', counts: Object.freeze({ unresolved: 1 }) })
    }),
    inputRoles: portableRead.inputRoles,
    outputRoles: portableRead.outputRoles,
    lifecycleEffects: portableRead.lifecycleEffects,
    parentEffects: portableRead.parentEffects,
    relationEffects: portableRead.relationEffects,
    destinationBindings: portableRead.destinationBindings,
    outputPlacements: portableRead.outputPlacements,
    representationQualification,
    schemaQualification,
    diagnostics: Object.freeze(diagnostics),
    readable: validationReadable,
    canonicalReadQualified,
    schemaAuthorityComplete: completeAuthority,
    applicability: 'not-evaluated',
    executable: false,
    executionReason: 'read-only canonical Transition Definition consumption seam; applicability and execution are outside this slice'
  });
}

export function isCanonicalTransitionDefinitionRecord(record = {}) {
  if (String(record?.schema || '') === LEGACY_TRANSITION_SHORTHAND_CONTRACT_ID) return false;
  const aggregation = record.registryAggregation || {};
  if (aggregation.canonicalSchemaObserved === true) return true;
  return declaredRecordSchemaId(record) === CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID;
}

function compileDefinitionSchemaChain(input = {}) {
  const supplied = suppliedSchemaMaterial(input);
  const root = supplied.get(ROOT_SCHEMA_ID);
  const transition = supplied.get(CANONICAL_TRANSITION_DEFINITION_SCHEMA_ID);
  if (!transition) return null;
  return compilePortableSchemaContractChain(root ? [root, transition] : [transition]);
}

function suppliedSchemaMaterial(input = {}) {
  const out = new Map();
  const supplied = input.schemaMaterial || input.schemaMaterials || input.schemaContracts || {};
  if (Array.isArray(supplied)) {
    for (const item of supplied) addSchemaMaterial(out, item);
  } else {
    for (const [schemaId, item] of Object.entries(supplied || {})) addSchemaMaterial(out, typeof item === 'string' ? { schemaId, markdown: item } : { schemaId, ...item });
  }
  for (const record of Array.isArray(input.schemaRecords) ? input.schemaRecords : []) addSchemaMaterial(out, record);
  return out;
}

function addSchemaMaterial(out, item = {}) {
  const markdown = typeof item === 'string' ? item : String(item?.markdown ?? item?.content ?? '');
  if (!markdown) return;
  const parsed = parseArtifactMarkdown(markdown);
  const schemaId = String(item?.schemaId || parsed.envelope?.current?.schema?.id || '').trim();
  if (!schemaId || out.has(schemaId)) return;
  out.set(schemaId, markdown);
}

function artifactIdentity(record = {}) {
  const declaredSchemaId = declaredRecordSchemaId(record);
  const metadataSchemaId = recordSchemaId(record);
  const workspaceIds = Array.isArray(record.workspaceIds)
    ? [...new Set(record.workspaceIds.map((value) => String(value || '').trim()).filter(Boolean))].sort()
    : String(record.workspaceId || '').trim() ? [String(record.workspaceId).trim()] : [];
  const registryIdentity = record.registryIdentity || registryIdentityForRecord(record, workspaceIds, declaredRecordSchemaId, recordSchemaId);
  return Object.freeze({
    id: String(record.id || ''),
    registryIdentity: String(registryIdentity.id || ''),
    registryIdentityKind: String(registryIdentity.kind || ''),
    loadedRecordIds: Object.freeze([...(record.loadedRecordIds || [record.id]).map((value) => String(value || '').trim()).filter(Boolean)].sort()),
    workspaceId: workspaceIds[0] || '',
    workspaceIds: Object.freeze(workspaceIds),
    path: String(record.path || ''),
    schemaId: declaredSchemaId || metadataSchemaId,
    metadataSchemaId,
    createdAt: String(record.currentCreatedAt || record.createdAt || '')
  });
}

function sourceIdentity(record = {}) {
  const source = record.source || {};
  const identity = record.registryIdentity || registryIdentityForRecord(record, record.workspaceIds || [], declaredRecordSchemaId, recordSchemaId);
  if (identity.kind === 'configured-source') {
    const boundary = identity.sourceBoundary || sourceBoundaryIdentity(record) || {};
    const repository = String(boundary.repository || '');
    const ref = String(boundary.ref || '');
    const rootPath = String(boundary.rootPath || '');
    return Object.freeze({
      sourceId: String(globalThis.TiinexSourceIdentity?.makeConfiguredSourceId?.({ repository, ref, rootPath }) || ''),
      loadedSourceIds: Object.freeze([...(record.loadedSourceIds || [])]),
      adapterId: String(source.adapterId || 'github'),
      sourceMode: String(record.sourceMode || ''),
      repository,
      ref,
      rootPath,
      boundaryKey: String(boundary.key || identity.boundaryKey || ''),
      boundarySignature: String(boundary.signature || identity.boundarySignature || ''),
      sourceArtifactPath: String(identity.sourceArtifactPath || ''),
      inputTarget: ''
    });
  }
  if (identity.kind === 'input-target') {
    const loadedSourceIds = [...(record.loadedSourceIds || [])].map((value) => String(value || '').trim()).filter(Boolean).sort();
    return Object.freeze({
      sourceId: loadedSourceIds[0] || `input-target:${String(identity.inputTarget || '')}`,
      loadedSourceIds: Object.freeze(loadedSourceIds),
      adapterId: String(source.adapterId || ''),
      sourceMode: String(record.sourceMode || ''),
      repository: '',
      ref: '',
      rootPath: '',
      boundaryKey: '',
      boundarySignature: '',
      sourceArtifactPath: '',
      inputTarget: String(identity.inputTarget || '')
    });
  }
  return Object.freeze({
    sourceId: String(source.id || ''),
    loadedSourceIds: Object.freeze([...(record.loadedSourceIds || [source.id]).map((value) => String(value || '').trim()).filter(Boolean)].sort()),
    adapterId: String(source.adapterId || ''),
    sourceMode: String(record.sourceMode || ''),
    repository: String(source.repository || source.repo || source.config?.repo || ''),
    ref: String(source.ref || source.requestedRef || source.config?.ref || ''),
    rootPath: String(source.rootPath || source.config?.rootPath || ''),
    boundaryKey: String(sourceBoundaryIdentity(record)?.key || ''),
    boundarySignature: sourceBoundarySignature(record),
    sourceArtifactPath: String(record.sourceTarget?.sourceArtifactPath || record.path || ''),
    inputTarget: String(record.sourceTarget?.inputTarget || '')
  });
}

function buildDiagnostics(chainQualification, validation, record = {}, schemaQualification = {}, ordinaryReadAuthority = {}) {
  const diagnostics = [];
  for (const message of chainQualification.findings || []) diagnostics.push(finding('schema-chain', message, chainQualification.state));
  for (const item of validation.findings || []) diagnostics.push(Object.freeze({
    source: 'compiled-contract-validation',
    code: item.code || '',
    severity: item.severity || '',
    state: item.state || '',
    message: item.message || '',
    group: item.group || '',
    entry: item.entry || '',
    field: item.field || ''
  }));
  const declaredSchemaId = declaredRecordSchemaId(record);
  const metadataSchemaId = recordSchemaId(record);
  if (declaredSchemaId && metadataSchemaId && declaredSchemaId !== metadataSchemaId) {
    diagnostics.push(Object.freeze({
      source: 'transition-definition-registry',
      code: 'canonical-transition.record-schema-metadata.drift',
      severity: 'warning',
      state: 'preserve',
      message: `Artifact declares Current Schema ${declaredSchemaId} while record metadata reports ${metadataSchemaId}; canonical registry eligibility follows the artifact declaration.`
    }));
  }
  if (schemaQualification.state === 'conflicting') {
    diagnostics.push(Object.freeze({
      source: 'transition-definition-registry',
      code: 'canonical-transition.declared-schema.conflict',
      severity: 'error',
      state: 'contradictory',
      message: `Loaded observations share one qualified source Artifact identity but declare divergent Current Schema values: ${(schemaQualification.declaredSchemaIds || []).join(', ')}.`
    }));
  } else if (schemaQualification.state === 'unresolved' && schemaQualification.canonicalObserved === true) {
    diagnostics.push(Object.freeze({
      source: 'transition-definition-registry',
      code: 'canonical-transition.declared-schema.unresolved',
      severity: 'warning',
      state: 'unresolved',
      message: 'At least one loaded observation declares the canonical Transition Definition schema while another observation has unreadable or unresolved Current Schema truth.'
    }));
  }
  if (ordinaryReadAuthority.state === 'contradictory') {
    diagnostics.push(Object.freeze({
      source: 'transition-definition-registry',
      code: 'canonical-transition.ordinary-read-authority.contradictory',
      severity: 'error',
      state: 'contradictory',
      message: 'Compiled canonical schema chain has contradictory ordinary instance-read authority; canonical Transition Definition read qualification is refused.'
    }));
  } else if (ordinaryReadAuthority.state !== 'available') {
    diagnostics.push(Object.freeze({
      source: 'transition-definition-registry',
      code: 'canonical-transition.ordinary-read-authority.unavailable',
      severity: 'warning',
      state: 'unresolved',
      message: 'Compiled canonical schema chain does not provide usable ordinary instance-read authority; canonical Transition Definition read qualification is refused.'
    }));
  }
  const aggregation = record.registryAggregation || {};
  if (aggregation.representationState === 'conflicting') {
    diagnostics.push(Object.freeze({
      source: 'transition-definition-registry',
      code: 'canonical-transition.representation.conflict',
      severity: 'error',
      state: 'contradictory',
      message: 'Loaded observations share one qualified registry identity but contain divergent artifact representations; no canonical representation is selected for applicability or execution.'
    }));
  } else if (aggregation.representationState === 'unresolved') {
    diagnostics.push(Object.freeze({
      source: 'transition-definition-registry',
      code: 'canonical-transition.representation.unresolved',
      severity: 'warning',
      state: 'unresolved',
      message: 'Loaded observations share one qualified registry identity but upstream reconciliation does not prove one canonical representation.'
    }));
  }
  return diagnostics;
}

function ordinaryReadAuthorityQualification(schemaChain = null) {
  const authority = schemaChain?.validation?.ordinaryFieldAuthority;
  const state = String(authority?.state || 'unavailable');
  return Object.freeze({
    state,
    sources: Object.freeze([...(authority?.sources || [])]),
    findings: Object.freeze([...(authority?.findings || [])])
  });
}

function unresolvedQualification(message) {
  return Object.freeze({ state: 'unresolved', complete: false, lineage: Object.freeze([]), findings: Object.freeze([message]) });
}

function unresolvedInstanceProjection() {
  const validation = Object.freeze({
    status: 'unresolved',
    states: Object.freeze({ primary: 'unresolved', counts: Object.freeze({ valid: 0, incomplete: 0, unresolved: 1, preserve: 0, contradictory: 0, 'structurally-invalid': 0 }) }),
    declarations: Object.freeze([]),
    ordinaryGroups: Object.freeze([]),
    findings: Object.freeze([Object.freeze({ severity: 'warning', code: 'canonical-transition.schema-contract.unavailable', state: 'unresolved', message: 'Canonical Transition Definition schema contract material is unavailable.' })])
  });
  return Object.freeze({ validation, ordinaryGroups: Object.freeze([]), declarations: Object.freeze([]) });
}

function finding(code, message, state) { return Object.freeze({ source: 'transition-definition-registry', code, severity: state === 'contradictory' ? 'error' : 'warning', state, message }); }
function recordSchemaId(record = {}) { return schemaIdForRecord(record); }
function declaredRecordSchemaId(record = {}) {
  const markdown = String(record?.markdown || '');
  if (!markdown) return '';
  try { return String(parseArtifactMarkdown(markdown).envelope?.current?.schema?.id || '').trim(); }
  catch { return ''; }
}
function compareReadModels(left, right) {
  const canonical = String(left.transitionIdentity?.['Canonical Identifier'] || '').localeCompare(String(right.transitionIdentity?.['Canonical Identifier'] || ''));
  if (canonical) return canonical;
  const registryIdentity = String(left.artifact?.registryIdentity || '').localeCompare(String(right.artifact?.registryIdentity || ''));
  if (registryIdentity) return registryIdentity;
  return String(left.artifact?.path || left.artifact?.id || '').localeCompare(String(right.artifact?.path || right.artifact?.id || ''));
}

