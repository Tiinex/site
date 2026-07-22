import {
  auditPortableMaterial,
  createPortableArtifactDraft,
  discoverPortableTooling,
  compilePortableSchemaGuide,
  explainPortableArtifactFindings,
  describePortableSchemaChain,
  inspectPortableAssetIndex,
  inspectPortableCreationContract,
  inspectPortableMaterial,
  planPortableArtifactCreation,
  planPortableArtifactRepairs,
  preparePortableTaskOperation,
  preparePortableAssetAnalysisOperation,
  readPortableSchemaSection,
  listPortableProviders,
  makePortableWriterBrief,
  resolvePortableCapabilities,
  resolvePortableSchemaChainMaterialOperation,
  resolvePortableSchemaMaterialOperation,
  searchPortableLineage,
  stagePortableArtifactDraft,
  resolvePortableLineage,
  validatePortableArtifactDraft
} from '../engine.facade.js';
import { buildPortableRuntimePackage, inspectPortableRuntimePackage, rehydratePortableRuntimePackage, roundTripPortableRuntimePackage } from '../package/runtime.package.js';

export const PORTABLE_SESSION_SCHEMA_ID = 'tiinex.portable.session.v1';

export function openPortableSession(input = {}) {
  const state = normalizeSessionState(input);
  return Object.freeze({
    schema: PORTABLE_SESSION_SCHEMA_ID,
    prepareTask: (request = {}, options = {}) => preparePortableTaskOperation({ ...state.materials, ...request, schemaCache: state.schemaCache }, options),
    discoverTooling: (request = {}, options = {}) => discoverPortableTooling({ ...request, schemaCache: state.schemaCache }, options),
    listProviders: (request = {}, options = {}) => listPortableProviders({ ...state.materials, ...request, schemaCache: state.schemaCache }, options),
    resolveSchemaMaterial: (request = {}, options = {}) => resolvePortableSchemaMaterialOperation({ ...state.materials, ...request, schemaCache: state.schemaCache }, options),
    resolveSchemaChainMaterial: (request = {}, options = {}) => resolvePortableSchemaChainMaterialOperation({ ...state.materials, ...request, schemaCache: state.schemaCache }, options),
    inspect: (options = {}) => inspectPortableMaterial(state.materials, options),
    audit: (options = {}) => auditPortableMaterial(state.materials, options),
    resolveLineage: (options = {}) => resolvePortableLineage(state.materials, { ...options, startId: options.startId || state.currentFocus }),
    resolveCapabilities: (request = {}, options = {}) => resolvePortableCapabilities(request, options),
    describeSchemaChain: (request = {}, options = {}) => describePortableSchemaChain({ ...state.materials, ...request }, options),
    inspectCreationContract: (request = {}, options = {}) => inspectPortableCreationContract(request, options),
    makeWriterBrief: (request = {}, options = {}) => makePortableWriterBrief({ ...state.materials, ...request }, options),
    schemaGuide: (request = {}, options = {}) => compilePortableSchemaGuide({ ...state.materials, ...request }, options),
    readSchemaSection: (request = {}, options = {}) => readPortableSchemaSection({ ...state.materials, ...request }, options),
    planArtifact: (request = {}, options = {}) => planPortableArtifactCreation({ ...state.materials, ...request }, options),
    createLocalDraft: (request = {}, options = {}) => createPortableArtifactDraft({ ...state.materials, ...request }, options),
    validateDraft: (request = {}, options = {}) => validatePortableArtifactDraft({ ...state.materials, ...request }, options),
    stageDraft: (request = {}, options = {}) => stagePortableArtifactDraft({ ...state.materials, ...request }, options),
    explainFindings: (request = {}, options = {}) => explainPortableArtifactFindings(request, options),
    repairPlan: (request = {}, options = {}) => planPortableArtifactRepairs(request, options),
    searchLineage: (request = {}, options = {}) => searchPortableLineage({ ...state.materials, ...request }, options),
    inspectAssets: (request = {}, options = {}) => inspectPortableAssetIndex({ ...state.materials, ...request }, options),
    prepareAssetAnalysis: (request = {}, options = {}) => preparePortableAssetAnalysisOperation({ ...state.materials, ...request }, options),
    planDurableMaterialization: async (request = {}) => {
      const { planPortableDurableMaterialization } = await import('../materialization/durable.materialize.js');
      return planPortableDurableMaterialization({ session: state, ...request });
    },
    materializeDurableFindings: async (request = {}, options = {}) => {
      const { materializePortableDurableFindings } = await import('../materialization/durable.materialize.js');
      return materializePortableDurableFindings({ session: state, ...request }, options);
    },
    createCheckpoint: async (request = {}, options = {}) => {
      const { createPortableCheckpoint } = await import('../checkpoint/portable.checkpoint.js');
      return createPortableCheckpoint({ session: state, ...request }, options);
    },
    buildRuntimePackage: (request = {}, options = {}) => buildPortableRuntimePackage({ session: state, ...request }, options),
    inspectRuntimePackage: (request = {}) => inspectPortableRuntimePackage(request),
    rehydrateRuntimePackage: (request = {}) => rehydratePortableRuntimePackage(request),
    roundTripRuntimePackage: (request = {}, options = {}) => roundTripPortableRuntimePackage({ session: state, ...request }, options),
    snapshot: () => serializePortableSession(state),
    withFocus: (currentFocus = '') => openPortableSession({ ...state, currentFocus }),
    withDurableFinding: (finding = {}) => openPortableSession({ ...state, durableFindings: [...state.durableFindings, finding] }),
    withStagedArtifact: (artifact = {}) => openPortableSession({ ...state, stagedArtifacts: [...state.stagedArtifacts, artifact] }),
    withSchemaCache: (entries = []) => openPortableSession({ ...state, schemaCache: mergeSchemaCache(state.schemaCache, entries) }),
    withCheckpoint: (lastCheckpoint = {}) => openPortableSession({ ...state, lastCheckpoint })
  });
}

export function serializePortableSession(sessionOrState = {}) {
  const source = typeof sessionOrState.snapshot === 'function' ? sessionOrState.snapshot() : normalizeSessionState(sessionOrState);
  return Object.freeze(JSON.parse(JSON.stringify(source)));
}

export function restorePortableSession(snapshot = {}) {
  if (snapshot?.schema !== PORTABLE_SESSION_SCHEMA_ID) throw new Error('portable.session.schema.invalid');
  const version = Number(snapshot?.version || 0);
  if (![1, 2].includes(version)) throw new Error('portable.session.version.unsupported');
  return openPortableSession(version === 1 ? { ...snapshot, version: 2, schemaCache: [] } : snapshot);
}

function normalizeSessionState(input = {}) {
  const materials = input.materials || pickMaterialInput(input);
  return Object.freeze({
    schema: PORTABLE_SESSION_SCHEMA_ID,
    version: 2,
    boundary: Object.freeze({
      hiddenConversationStateIsProvenance: false,
      remoteFetch: 'explicit-host-mediated-only',
      remoteWrite: false,
      sourceMutation: false
    }),
    materials: Object.freeze({
      markdown: typeof materials.markdown === 'string' ? materials.markdown : undefined,
      path: materials.path || undefined,
      files: Object.freeze((materials.files || []).map((file) => Object.freeze({ ...file }))),
      records: Object.freeze((materials.records || []).map((record) => Object.freeze({ ...record }))),
      assets: Object.freeze((materials.assets || []).map((asset) => Object.freeze({ ...asset }))),
      findings: Object.freeze((materials.findings || []).map((finding) => Object.freeze({ ...finding }))),
      sourceMode: materials.sourceMode || 'portable-local'
    }),
    currentFocus: String(input.currentFocus || ''),
    stagedArtifacts: Object.freeze((input.stagedArtifacts || []).map((artifact) => Object.freeze({ ...artifact }))),
    durableFindings: Object.freeze((input.durableFindings || []).map((finding) => Object.freeze({ ...finding }))),
    lastCheckpoint: input.lastCheckpoint ? Object.freeze({ ...input.lastCheckpoint }) : null,
    qualification: input.qualification ? Object.freeze({ ...input.qualification }) : null,
    schemaCache: Object.freeze(normalizeSchemaCache(input.schemaCache))
  });
}

function pickMaterialInput(input = {}) {
  return {
    markdown: input.markdown,
    path: input.path,
    files: input.files || [],
    records: input.records || [],
    assets: input.assets || [],
    findings: input.findings || [],
    sourceMode: input.sourceMode
  };
}


function normalizeSchemaCache(value) {
  const entries = value instanceof Map ? [...value.values()] : Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
  return entries.filter((entry) => entry?.schemaId && typeof entry?.markdown === 'string').map((entry) => Object.freeze({ ...entry }));
}

function mergeSchemaCache(current, next) {
  const map = new Map(normalizeSchemaCache(current).map((entry) => [entry.cacheKey || `${entry.schemaId}:${entry.path}`, entry]));
  for (const entry of normalizeSchemaCache(next)) map.set(entry.cacheKey || `${entry.schemaId}:${entry.path}`, entry);
  return [...map.values()];
}
