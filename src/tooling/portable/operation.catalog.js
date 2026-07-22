import {
  auditPortableMaterial,
  describePortableSchemaChain,
  inspectPortableCreationContract,
  inspectPortableMaterial,
  makePortableWriterBrief,
  resolvePortableCapabilities,
  resolvePortableLineage
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
