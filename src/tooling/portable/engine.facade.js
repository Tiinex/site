import { parseArtifactMarkdown } from '../../artifacts/artifact.parse.js';
import { runAudit } from '../../audit/audit.run.js';
import { resolveLineage } from '../../lineage/lineage.resolve.js';
import { traverseLoadedLineage } from '../../lineage/lineage.traverse.js';
import { resolveSchemaCapabilities } from '../../schemas/capability.registry.js';
import { buildArtifactCreationContract, validateArtifactCreationContract } from '../../schemas/creation.contracts.js';
import { schemaCanonicalBinding, schemaReadPresentation } from '../../schemas/companion.js';
import { schemaRegistry } from '../../schemas/registry.js';
import { findSchemaMaterial, normalizePortableInput, suppliedSchemaParentId } from './input/portable.input.js';
import { dedupePortableFindings, normalizePortableFinding, portableFinding, summarizePortableFindings } from './findings.js';
import { qualifyAuditResult, qualifyCapabilityResolution, qualifyCreationContract, qualifyWriterBrief } from './qualification.js';

export const PORTABLE_RESULT_SCHEMA_ID = 'tiinex.portable.operation.result.v1';
export const PORTABLE_SCHEMA_CHAIN_SCHEMA_ID = 'tiinex.portable.schema-chain.v1';

export function inspectPortableMaterial(input = {}, options = {}) {
  const material = normalizePortableInput(input);
  const records = material.records.map((record) => {
    const parsed = parseArtifactMarkdown(record.markdown || '');
    const declaredSchemaId = record.schemaId || record.kind || parsed.envelope?.current?.schema?.id || '';
    const resolution = resolveSchemaCapabilities({ schemaId: declaredSchemaId }, { capability: 'read' });
    const presentation = schemaReadPresentation(record, options.presentation || {});
    return Object.freeze({
      id: record.id,
      path: record.path,
      title: record.title,
      summary: record.summary,
      declaredSchemaId,
      resolvedCompanionId: presentation.companionId || resolution.descriptor?.moduleId || '',
      sourceMode: record.sourceMode || '',
      sourceBoundary: record.source?.boundary || record.boundary || '',
      sourceQualification: record.source?.provenanceQualification || (record.source?.adapterId === 'local' ? 'local-supplied' : 'explicit-supplied'),
      hasContinuityContext: Boolean(record.hasContinuityContext),
      hasIntegrity: Boolean(record.hasIntegrity),
      parent: Object.freeze({
        schemaId: record.parentSchemaId || '',
        trace: record.trace || '',
        origin: record.origin || '',
        boundary: record.boundary || ''
      }),
      body: Object.freeze({
        title: parsed.body?.title || '',
        sections: Object.freeze([...(parsed.body?.sections || [])])
      }),
      presentation,
      resolvedBinding: schemaCanonicalBinding(record),
      qualification: qualifyCapabilityResolution(resolution, 'read'),
      ...(options.includeMarkdown ? { markdown: record.markdown || '' } : {})
    });
  });
  return operationResult('inspect', {
    boundary: material.boundary,
    files: material.files,
    records,
    assets: material.assets,
    workspaceEntries: material.workspaceEntries,
    findings: material.findings
  });
}

export function auditPortableMaterial(input = {}, options = {}) {
  const material = normalizePortableInput(input);
  const audits = material.records.map((record) => sanitizeAudit(runAudit({ record, markdown: record.markdown }), record, options));
  const findings = [...material.findings, ...audits.flatMap((audit) => audit.findings || [])];
  return operationResult('audit', {
    boundary: material.boundary,
    audits,
    findings
  });
}

export function resolvePortableLineage(input = {}, options = {}) {
  const material = normalizePortableInput(input);
  const resolved = resolveLineage(material.records, { depth: options.depth || 'loaded-portable' });
  const traversal = traverseLoadedLineage(material.records, {
    resolvedLineage: resolved,
    startIds: options.startIds || options.startId || options.selectedId,
    direction: options.direction || 'ancestors',
    maxDepth: options.maxDepth ?? options.depthLimit ?? 3
  });
  const findings = [...material.findings, ...(resolved.findings || []), ...(traversal.findings || [])];
  return operationResult('resolve-lineage', {
    boundary: Object.freeze({ ...material.boundary, lineage: 'loaded-only; no remote fetch; no inferred edges' }),
    lineage: sanitizeLineage(resolved),
    traversal: sanitizeTraversal(traversal),
    findings
  });
}

export function resolvePortableCapabilities(input = {}, options = {}) {
  const schemaIds = normalizeSchemaIds(input.schemaIds || input.schemaId || options.schemaIds || options.schemaId);
  const capability = String(input.capability || options.capability || '').trim();
  const findings = [];
  if (!schemaIds.length) findings.push(portableFinding('error', 'portable.capability.schema.required', 'At least one schema id is required for capability resolution.'));
  const resolutions = schemaIds.map((schemaId) => {
    const resolution = resolveSchemaCapabilities({ schemaId, checksum: input.checksum || '' }, { capability });
    return Object.freeze({
      requested: resolution.requested,
      status: resolution.status,
      fallbackUsed: resolution.fallbackUsed,
      unresolvedSchemaId: resolution.unresolvedSchemaId,
      descriptor: resolution.descriptor,
      capability: resolution.capability,
      qualification: qualifyCapabilityResolution(resolution, capability)
    });
  });
  findings.push(...resolutions.flatMap((item) => item.descriptor?.findings || []));
  return operationResult('resolve-capabilities', {
    capability,
    resolverBoundary: Object.freeze({ mode: 'site-exact-or-direct-root', semanticParentCapabilityFallback: false }),
    resolutions,
    findings
  });
}

export function inspectPortableCreationContract(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const transitionType = String(input.transitionType || options.transitionType || 'create-artifact').trim();
  const contract = buildArtifactCreationContract({ schemaId, transitionType });
  const validation = validateArtifactCreationContract(contract);
  return operationResult('inspect-creation-contract', {
    contract,
    validation,
    qualification: qualifyCreationContract(contract),
    findings: [...(contract.findings || []), ...(validation.findings || [])]
  });
}

export function describePortableSchemaChain(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const sourceInput = input.materials || input;
  const maxDepth = normalizeDepth(options.maxDepth ?? input.maxDepth ?? 16, 16);
  const findings = [];
  const nodes = [];
  const seen = new Set();
  let current = schemaId;
  let status = 'partial';

  if (!current) findings.push(portableFinding('error', 'portable.schema-chain.schema.required', 'Schema chain resolution requires a schema id.'));
  while (current && nodes.length < maxDepth) {
    if (seen.has(current)) {
      findings.push(portableFinding('error', 'portable.schema-chain.cycle', 'Schema parent chain contains a cycle.', { schemaId: current }));
      status = 'cycle';
      break;
    }
    seen.add(current);
    const module = schemaRegistry.byId.get(current) || null;
    const material = findSchemaMaterial(current, sourceInput);
    const materialParent = suppliedSchemaParentId(current, sourceInput);
    const parentSchemaId = String(module?.parentSchemaId || materialParent || '').trim();
    const capabilityResolution = resolveSchemaCapabilities({ schemaId: current });
    nodes.push(Object.freeze({
      schemaId: current,
      registered: Boolean(module),
      moduleId: module?.id || '',
      parentSchemaId,
      parentSource: module?.parentSchemaId ? 'registered-module' : (materialParent ? 'supplied-schema-material' : 'unavailable'),
      suppliedSchema: material ? Object.freeze({ path: material.path, role: material.role, authority: material.authority }) : null,
      binding: module ? Object.freeze({
        schemaId: module.binding?.schemaId || module.id || '',
        sourcePath: module.binding?.sourcePath || '',
        sourceRepository: module.binding?.sourceRepository || '',
        sourceCommit: module.binding?.sourceCommit || '',
        snapshot: module.binding?.snapshot || ''
      }) : null,
      registeredCapabilities: module ? Object.freeze({
        read: capabilityResolution.descriptor?.actions?.read?.status || '',
        validate: capabilityResolution.descriptor?.actions?.validate?.status || '',
        create: capabilityResolution.descriptor?.actions?.create?.status || '',
        fallback: capabilityResolution.descriptor?.actions?.fallback?.status || ''
      }) : null,
      runtimeResolution: Object.freeze({
        status: capabilityResolution.status || '',
        fallbackUsed: Boolean(capabilityResolution.fallbackUsed),
        resolvedModuleId: capabilityResolution.descriptor?.moduleId || ''
      })
    }));
    if (current === 'tiinex.root.v1' || !parentSchemaId) {
      status = current === 'tiinex.root.v1' ? 'complete-to-root' : 'partial';
      break;
    }
    current = parentSchemaId;
  }

  if (current && nodes.length >= maxDepth && status !== 'complete-to-root') findings.push(portableFinding('warning', 'portable.schema-chain.depth-limit', 'Schema chain stopped at the configured depth limit.', { maxDepth }));
  const requestedRegistered = Boolean(schemaRegistry.byId.get(schemaId));
  const runtimeFallback = !requestedRegistered ? Object.freeze({ used: true, mode: 'direct-root', semanticParentCapabilityFallback: false }) : Object.freeze({ used: false, mode: 'none', semanticParentCapabilityFallback: false });
  if (!requestedRegistered) findings.push(portableFinding('info', 'portable.schema-chain.runtime-root-fallback', 'The current shared runtime resolves an unregistered schema directly to Root; this does not assert that Root is its semantic parent.', { schemaId }));

  return operationResult('describe-schema-chain', {
    chain: Object.freeze({
      schema: PORTABLE_SCHEMA_CHAIN_SCHEMA_ID,
      requestedSchema: schemaId,
      status,
      maxDepth,
      nodes: Object.freeze(nodes),
      runtimeFallback
    }),
    findings
  });
}

export function makePortableWriterBrief(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const transitionType = String(input.transitionType || options.transitionType || 'create-artifact').trim();
  const sourceInput = input.materials || input;
  const contract = buildArtifactCreationContract({ schemaId, transitionType });
  const schemaMaterial = findSchemaMaterial(schemaId, sourceInput);
  const exact = contract.status === 'ready';
  const mode = exact ? 'exact-create-tooling-available' : schemaMaterial ? 'llm-writer-fallback' : 'parent-or-root-artifact-only';
  const baseQualification = qualifyCreationContract(contract);
  const qualification = qualifyWriterBrief({ mode, base: baseQualification, requestedSchema: schemaId });
  const chainResult = describePortableSchemaChain({ ...sourceInput, schemaId }, { maxDepth: options.maxDepth ?? 16 });
  const findings = [...(chainResult.findings || [])];
  if (mode === 'llm-writer-fallback') findings.push(portableFinding('warning', 'portable.writer.llm-fallback', 'Exact child creation tooling is unavailable; writing is delegated to an LLM or human using supplied readable schema material.', { schemaId }));
  if (mode === 'parent-or-root-artifact-only') findings.push(portableFinding('error', 'portable.writer.schema-material.unavailable', 'Requested child creation is blocked because exact tooling and readable child schema material are unavailable.', { schemaId }));
  if (mode === 'exact-create-tooling-available') findings.push(portableFinding('info', 'portable.writer.exact-tooling.available', 'Exact create tooling is available in the site core; this first portable batch exposes planning only and does not execute durable creation.', { schemaId }));
  return operationResult('make-writer-brief', {
    mode,
    requestedSchema: schemaId,
    transitionType,
    schemaMaterial: schemaMaterial ? Object.freeze({
      schemaId: schemaMaterial.schemaId,
      path: schemaMaterial.path,
      role: schemaMaterial.role,
      authority: schemaMaterial.authority,
      ...(options.includeSchemaMarkdown === false ? {} : { markdown: schemaMaterial.markdown })
    }) : Object.freeze({ available: false }),
    schemaChain: chainResult.chain,
    creationContract: contract,
    qualification,
    instructions: writerInstructions({ mode, schemaId, schemaMaterial, qualification }),
    findings
  });
}

function sanitizeAudit(result = {}, record = {}, options = {}) {
  const parsed = result.parsed || null;
  return Object.freeze({
    id: record.id || record.path || '',
    path: record.path || '',
    status: result.status || '',
    schemaId: parsed?.envelope?.current?.schema?.id || result.artifact?.schemaId || record.schemaId || '',
    resolution: Object.freeze({
      status: result.resolution?.status || '',
      moduleId: result.resolution?.module?.id || result.artifact?.moduleId || '',
      fallbackUsed: Boolean(result.resolution?.fallbackUsed || result.artifact?.fallbackUsed),
      unresolvedSchemaId: result.resolution?.unresolvedSchemaId || ''
    }),
    artifact: result.artifact || null,
    parsed: parsed ? Object.freeze({
      title: parsed.title,
      hasContinuityContext: parsed.hasContinuityContext,
      hasIntegrity: parsed.hasIntegrity,
      envelope: parsed.envelope,
      body: Object.freeze({ title: parsed.body?.title || '', sections: Object.freeze([...(parsed.body?.sections || [])]) })
    }) : null,
    findings: Object.freeze((result.findings || []).map((finding) => normalizePortableFinding(finding))),
    summary: result.summary || null,
    materialAvailability: result.materialAvailability || null,
    qualification: qualifyAuditResult(result),
    ...(options.includeMarkdown ? { markdown: record.markdown || '' } : {})
  });
}

function sanitizeLineage(result = {}) {
  return Object.freeze({
    schema: result.schema,
    nodes: Object.freeze((result.nodes || []).map((node) => Object.freeze({
      id: node.id,
      title: node.title,
      path: node.path,
      schemaId: node.schemaId,
      sourceId: node.sourceId,
      sourceMode: node.sourceMode,
      boundary: node.boundary,
      trace: node.trace,
      origin: node.origin,
      parentSchemaId: node.parentSchemaId,
      hasContinuityContext: node.hasContinuityContext,
      hasIntegrity: node.hasIntegrity
    }))),
    edges: Object.freeze(result.edges || []),
    findings: Object.freeze(result.findings || []),
    stats: result.stats || {},
    options: result.options || {}
  });
}

function sanitizeTraversal(result = {}) {
  return Object.freeze({
    schema: result.schema,
    boundary: result.boundary,
    direction: result.direction,
    maxDepth: result.maxDepth,
    startIds: result.startIds,
    nodes: result.nodes,
    edges: result.edges,
    missingEdges: result.missingEdges,
    findings: result.findings,
    stats: result.stats
  });
}

function writerInstructions({ mode, schemaId, schemaMaterial, qualification }) {
  if (mode === 'exact-create-tooling-available') return Object.freeze([
    'Use the exact registered create companion and creation contract.',
    'Keep the draft local and validate the result before export or publication.',
    'Do not inherit a parent source object or perform a remote write.',
    'This portable batch describes the operation but does not execute durable creation.'
  ]);
  if (mode === 'llm-writer-fallback') return Object.freeze([
    `Read the supplied ${schemaId} schema artifact before writing.`,
    'Read every supplied or registered parent in the reported schema chain and preserve the Root continuity envelope.',
    'Write a transparent local draft from the readable contract; do not invent source provenance or unavailable facts.',
    'Run all available validation and report child semantic qualification as partial unless exact child validation is available.',
    `Do not claim exact child create tooling. Schema material: ${schemaMaterial.path}`
  ]);
  return Object.freeze([
    `Do not guess the ${schemaId || 'unknown'} child format because its schema material and exact create tooling are unavailable.`,
    'Preserve the intended content or create a genuine supported parent/Root artifact instead.',
    'Record the unavailable schema as a blocking limitation and request the schema artifact.',
    ...(qualification.limitations || [])
  ]);
}

function operationResult(operation, payload = {}) {
  const findings = dedupePortableFindings(payload.findings || []);
  return Object.freeze({
    schema: PORTABLE_RESULT_SCHEMA_ID,
    operation,
    ...payload,
    findings,
    findingSummary: summarizePortableFindings(findings)
  });
}

function normalizeSchemaIds(value) {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))];
}

function normalizeDepth(value, fallback = 16) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(64, parsed));
}
