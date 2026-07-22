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
} from './engine.facade.js';
import { openPortableSession, restorePortableSession, serializePortableSession } from './session/portable.session.js';
import { summarizePortableFindings } from './findings.js';
import { createPortableCheckpoint, restorePortableCheckpoint } from './checkpoint/portable.checkpoint.js';
import { materializePortableDurableFindings, planPortableDurableMaterialization } from './materialization/durable.materialize.js';
import { buildPortableRuntimePackage, inspectPortableRuntimePackage, rehydratePortableRuntimePackage, roundTripPortableRuntimePackage } from './package/runtime.package.js';

export const PORTABLE_OPERATION_CATALOG_SCHEMA_ID = 'tiinex.portable.operation.catalog.v1';

export const portableOperationCatalog = Object.freeze({
  'prepare-task': operation({
    name: 'prepare-task',
    description: 'Orchestrate host discovery, schema/provider resolution, schema guides, artifact planning, draft validation, lineage search, or asset analysis into one explicit next-action response.',
    safety: 'planning-or-read-only',
    inputSchema: 'tiinex.portable.task-preparation.request.v1',
    remoteFetch: 'host-mediated-optional',
    handler: preparePortableTaskOperation
  }),
  'discover-tooling': operation({
    name: 'discover-tooling',
    description: 'Normalize host tools into capability-level routes so an LLM can choose equivalent filesystem, archive, repository, execution, and multimodal tooling without depending on product-specific names.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.tooling-discovery.request.v1',
    handler: discoverPortableTooling
  }),
  'list-material-providers': operation({
    name: 'list-material-providers',
    description: 'List loaded, cache, local, archive, repository, HTTP, and executable host provider options with explicit boundaries.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.provider-catalog.request.v1',
    handler: listPortableProviders
  }),
  'resolve-schema-material': operation({
    name: 'resolve-schema-material',
    description: 'Resolve exact readable schema material from loaded data, explicit cache, host responses, or executable providers; otherwise return a self-describing host provider request.',
    safety: 'read-only-or-host-mediated-fetch',
    inputSchema: 'tiinex.portable.schema-material.request.v1',
    remoteFetch: 'host-mediated-optional',
    handler: resolvePortableSchemaMaterialOperation
  }),
  'resolve-schema-chain-material': operation({
    name: 'resolve-schema-chain-material',
    description: 'Resolve readable child and parent schema material to Root through explicit providers without inventing missing schema meaning.',
    safety: 'read-only-or-host-mediated-fetch',
    inputSchema: 'tiinex.portable.schema-chain-material.request.v1',
    remoteFetch: 'host-mediated-optional',
    handler: resolvePortableSchemaChainMaterialOperation
  }),
  inspect: operation({
    name: 'inspect',
    description: 'Parse supplied material and return compact artifact, schema companion, source-boundary, and qualification views.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.input.v1',
    handler: inspectPortableMaterial
  }),
  audit: operation({
    name: 'audit',
    description: 'Run the existing Tiinex/site audit engine against supplied loaded material.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.input.v1',
    handler: auditPortableMaterial
  }),
  'resolve-lineage': operation({
    name: 'resolve-lineage',
    description: 'Resolve and traverse declared lineage edges inside the loaded material only.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.input.v1',
    handler: resolvePortableLineage
  }),
  'resolve-capabilities': operation({
    name: 'resolve-capabilities',
    description: 'Inspect the current site schema capability registry and explicit Root fallback qualification.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.capability.request.v1',
    handler: resolvePortableCapabilities
  }),
  'describe-schema-chain': operation({
    name: 'describe-schema-chain',
    description: 'Describe registered and supplied schema ancestry without claiming capability fallback execution.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.schema-chain.request.v1',
    handler: describePortableSchemaChain
  }),
  'inspect-creation-contract': operation({
    name: 'inspect-creation-contract',
    description: 'Inspect and validate the existing site creation contract for a target schema and transition.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.creation-contract.request.v1',
    handler: inspectPortableCreationContract
  }),
  'make-writer-brief': operation({
    name: 'make-writer-brief',
    description: 'Produce a safe exact-tooling, LLM-writer, or preserve-only creation brief.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.writer-brief.request.v1',
    handler: makePortableWriterBrief
  }),
  'schema-guide': operation({
    name: 'schema-guide',
    description: 'Compile a compact task-specific LLM guide from readable schema contracts, runtime capabilities, and optional schema companion hints.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.schema-guide.request.v1',
    handler: compilePortableSchemaGuide
  }),
  'read-schema-section': operation({
    name: 'read-schema-section',
    description: 'Retrieve bounded sections from supplied readable schema Markdown for progressive disclosure.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.schema-section.request.v1',
    handler: readPortableSchemaSection
  }),
  'plan-artifact': operation({
    name: 'plan-artifact',
    description: 'Build an LLM-oriented artifact plan with missing inputs, required structure, validation steps, and retrieval hints.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.artifact-plan.request.v1',
    handler: planPortableArtifactCreation
  }),
  'create-local-draft': operation({
    name: 'create-local-draft',
    description: 'Create an in-memory local Tiinex draft through exact site creation tooling or readable-schema writer fallback, then validate it without mutating source material.',
    safety: 'local-draft-result',
    inputSchema: 'tiinex.portable.draft-creation.request.v1',
    handler: createPortableArtifactDraft
  }),
  'stage-draft': operation({
    name: 'stage-draft',
    description: 'Qualify and return a local staged-artifact record without writing files, publishing, or inheriting source identity.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.stage-draft.request.v1',
    handler: stagePortableArtifactDraft
  }),
  'validate-draft': operation({
    name: 'validate-draft',
    description: 'Validate a local draft with the existing audit engine plus explicit contract-driven structural checks when readable schema material is supplied.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.draft-validation.request.v1',
    handler: validatePortableArtifactDraft
  }),
  'explain-findings': operation({
    name: 'explain-findings',
    description: 'Translate findings into compact ownership, blocking, and repair guidance without rewriting the artifact.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.finding-explanation.request.v1',
    handler: explainPortableArtifactFindings
  }),
  'repair-plan': operation({
    name: 'repair-plan',
    description: 'Group findings into a minimal ordered repair plan that preserves unknown content and source/continuity boundaries.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.repair-plan.request.v1',
    handler: planPortableArtifactRepairs
  }),
  'search-lineage': operation({
    name: 'search-lineage',
    description: 'Search and filter loaded lineage by text, schema, source mode, relation role, integrity, continuity, qualification, findings, path, and traversal scope.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.lineage-search.request.v1',
    handler: searchPortableLineage
  }),
  'inspect-assets': operation({
    name: 'inspect-assets',
    description: 'Index binary assets, MIME/media kind, local references, locators, and required host analysis capabilities without interpreting asset content.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.asset-index.request.v1',
    handler: inspectPortableAssetIndex
  }),
  'prepare-asset-analysis': operation({
    name: 'prepare-asset-analysis',
    description: 'Prepare a host-mediated image/PDF analysis request for a supplied asset while keeping source material and generated interpretation distinct.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.asset-analysis.request.v1',
    handler: preparePortableAssetAnalysisOperation
  }),
  'plan-durable-materialization': operation({
    name: 'plan-durable-materialization',
    description: 'Map explicit durable session findings to explicit target schemas without guessing artifact type or mutating source material.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.durable-materialization.request.v1',
    handler: (input = {}) => wrapPortableResult('plan-durable-materialization', planPortableDurableMaterialization(input))
  }),
  'materialize-durable-findings': operation({
    name: 'materialize-durable-findings',
    description: 'Create and optionally stage local schema-qualified drafts from explicitly mapped durable findings, leaving unmapped findings in session state.',
    safety: 'local-draft-and-state',
    inputSchema: 'tiinex.portable.durable-materialization.request.v1',
    remoteFetch: 'host-mediated-optional',
    handler: async (input = {}, options = {}) => wrapPortableResult('materialize-durable-findings', await materializePortableDurableFindings(input, options))
  }),
  'create-checkpoint': operation({
    name: 'create-checkpoint',
    description: 'Create a recoverable explicit portable session checkpoint. This is not a canonical Tiinex handoff artifact.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.checkpoint.create.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('create-checkpoint', createPortableCheckpoint(input, options))
  }),
  'restore-checkpoint': operation({
    name: 'restore-checkpoint',
    description: 'Verify and restore a portable checkpoint while preserving its explicit non-handoff boundary.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.checkpoint.v1',
    handler: (input = {}) => wrapPortableResult('restore-checkpoint', restorePortableCheckpoint(input))
  }),
  'build-runtime-package': operation({
    name: 'build-runtime-package',
    description: 'Build the current Tiinex/site runtime export-package bundle from loaded and staged material without claiming a locked canonical package schema.',
    safety: 'local-package-result',
    inputSchema: 'tiinex.portable.runtime-package.build.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('build-runtime-package', buildPortableRuntimePackage(input, options))
  }),
  'inspect-runtime-package': operation({
    name: 'inspect-runtime-package',
    description: 'Inspect a current runtime export-package bundle through the existing Tiinex/site package implementation.',
    safety: 'read-only',
    inputSchema: 'tiinex.export.package.bundle.v1',
    handler: (input = {}) => wrapPortableResult('inspect-runtime-package', inspectPortableRuntimePackage(input))
  }),
  'rehydrate-runtime-package': operation({
    name: 'rehydrate-runtime-package',
    description: 'Reconstruct the current in-memory runtime package contract from explicitly supplied serialized package files without executing received content.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.input.v1',
    handler: (input = {}) => wrapPortableResult('rehydrate-runtime-package', rehydratePortableRuntimePackage(input))
  }),
  'roundtrip-runtime-package': operation({
    name: 'roundtrip-runtime-package',
    description: 'Build or inspect, import-plan, apply-plan, and compare the current runtime package contract for a no-GitHub-inference round trip.',
    safety: 'read-only-or-local-package-result',
    inputSchema: 'tiinex.portable.runtime-package.roundtrip.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('roundtrip-runtime-package', roundTripPortableRuntimePackage(input, options))
  }),
  'serialize-session': operation({
    name: 'serialize-session',
    description: 'Serialize portable loaded material and explicit long-lived dialogue state without hidden chat provenance.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.session.open.v1',
    handler: (input = {}) => sessionOperationResult('serialize-session', serializePortableSession(openPortableSession(input)))
  }),
  'restore-session': operation({
    name: 'restore-session',
    description: 'Validate and normalize a previously serialized portable session snapshot.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.session.v1',
    handler: (input = {}) => sessionOperationResult('restore-session', restorePortableSession(input).snapshot())
  })
});

export function listPortableOperations() {
  return Object.freeze({
    schema: PORTABLE_OPERATION_CATALOG_SCHEMA_ID,
    operations: Object.freeze(Object.values(portableOperationCatalog).map(({ handler, ...descriptor }) => Object.freeze(descriptor)))
  });
}

export async function runPortableOperation(name = '', input = {}, options = {}) {
  const descriptor = portableOperationCatalog[String(name || '').trim()];
  if (!descriptor) throw new Error(`portable.operation.unknown:${name}`);
  return descriptor.handler(input, options);
}

function operation({ name, description, safety, inputSchema, handler, remoteFetch = false, remoteWrite = false, sourceMutation = false }) {
  return Object.freeze({
    name,
    description,
    safety,
    inputSchema,
    outputSchema: 'tiinex.portable.operation.result.v1',
    remoteFetch,
    remoteWrite,
    sourceMutation,
    serializableResult: true,
    handler
  });
}

function sessionOperationResult(operationName, session) {
  const findings = Object.freeze([]);
  return Object.freeze({
    schema: 'tiinex.portable.operation.result.v1',
    operation: operationName,
    session,
    findings,
    findingSummary: summarizePortableFindings(findings)
  });
}

function wrapPortableResult(operationName, result = {}) {
  const { schema: resultSchema = '', ...payload } = result || {};
  const findings = Object.freeze([...(result?.findings || [])]);
  return Object.freeze({
    schema: 'tiinex.portable.operation.result.v1',
    operation: operationName,
    resultSchema,
    ...payload,
    findings,
    findingSummary: result?.findingSummary || summarizePortableFindings(findings)
  });
}
