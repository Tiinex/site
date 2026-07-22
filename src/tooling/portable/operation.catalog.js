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
} from './engine.facade.js';
import { openPortableSession, restorePortableSession, serializePortableSession } from './session/portable.session.js';
import { summarizePortableFindings } from './findings.js';

export const PORTABLE_OPERATION_CATALOG_SCHEMA_ID = 'tiinex.portable.operation.catalog.v1';

export const portableOperationCatalog = Object.freeze({
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

function operation({ name, description, safety, inputSchema, handler }) {
  return Object.freeze({
    name,
    description,
    safety,
    inputSchema,
    outputSchema: 'tiinex.portable.operation.result.v1',
    remoteFetch: false,
    remoteWrite: false,
    sourceMutation: false,
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
