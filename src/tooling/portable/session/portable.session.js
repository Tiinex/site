import {
  auditPortableMaterial,
  compilePortableSchemaGuide,
  explainPortableArtifactFindings,
  describePortableSchemaChain,
  inspectPortableCreationContract,
  inspectPortableMaterial,
  planPortableArtifactCreation,
  planPortableArtifactRepairs,
  readPortableSchemaSection,
  makePortableWriterBrief,
  resolvePortableCapabilities,
  searchPortableLineage,
  resolvePortableLineage,
  validatePortableArtifactDraft
} from '../engine.facade.js';

export const PORTABLE_SESSION_SCHEMA_ID = 'tiinex.portable.session.v1';

export function openPortableSession(input = {}) {
  const state = normalizeSessionState(input);
  return Object.freeze({
    schema: PORTABLE_SESSION_SCHEMA_ID,
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
    validateDraft: (request = {}, options = {}) => validatePortableArtifactDraft({ ...state.materials, ...request }, options),
    explainFindings: (request = {}, options = {}) => explainPortableArtifactFindings(request, options),
    repairPlan: (request = {}, options = {}) => planPortableArtifactRepairs(request, options),
    searchLineage: (request = {}, options = {}) => searchPortableLineage({ ...state.materials, ...request }, options),
    snapshot: () => serializePortableSession(state),
    withFocus: (currentFocus = '') => openPortableSession({ ...state, currentFocus }),
    withDurableFinding: (finding = {}) => openPortableSession({ ...state, durableFindings: [...state.durableFindings, finding] }),
    withStagedArtifact: (artifact = {}) => openPortableSession({ ...state, stagedArtifacts: [...state.stagedArtifacts, artifact] }),
    withCheckpoint: (lastCheckpoint = {}) => openPortableSession({ ...state, lastCheckpoint })
  });
}

export function serializePortableSession(sessionOrState = {}) {
  const source = typeof sessionOrState.snapshot === 'function' ? sessionOrState.snapshot() : normalizeSessionState(sessionOrState);
  return Object.freeze(JSON.parse(JSON.stringify(source)));
}

export function restorePortableSession(snapshot = {}) {
  if (snapshot?.schema !== PORTABLE_SESSION_SCHEMA_ID) throw new Error('portable.session.schema.invalid');
  if (Number(snapshot?.version || 0) !== 1) throw new Error('portable.session.version.unsupported');
  return openPortableSession(snapshot);
}

function normalizeSessionState(input = {}) {
  const materials = input.materials || pickMaterialInput(input);
  return Object.freeze({
    schema: PORTABLE_SESSION_SCHEMA_ID,
    version: 1,
    boundary: Object.freeze({
      hiddenConversationStateIsProvenance: false,
      remoteFetch: false,
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
    qualification: input.qualification ? Object.freeze({ ...input.qualification }) : null
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
