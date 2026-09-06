import {
  auditPortableMaterial,
  createPortableArtifactDraft,
  deletePortableArtifactDraft,
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
  stagePortableArtifactDraft,
  updatePortableArtifactDraft,
  resolvePortableLineage,
  validatePortableArtifactDraft
} from './engine.facade.js';
import { portableLineageOperationDescriptors } from './lineage/lineage.operations.js';
import { portableReductionOperationDescriptors } from './reduction/reduction.operations.js';
import { portableLifecycleOperationDescriptors } from './lifecycle/lifecycle.operations.js';
import { createPortableArtifactSet, preparePortableMaterialization } from './materialization/materialization.facade.js';
import { processPortableLiveTurn, readPortableLiveLineage } from './live/live.lineage.js';
import { exportPortableLiveLineage } from './live/live.export.js';
import { summarizePortableFindings } from './findings.js';
import { materializePortableDurableFindings, planPortableDurableMaterialization } from './materialization/durable.materialize.js';
import { acceptPortableHostActionReceipt, planPortableHostAction } from './host/tool.bindings.js';
import { describePortableCheckpointGate, qualifyPortableCheckpoint } from './conformance/checkpoint.qualification.js';
import { describePortableColdStartIngress, groundPortableColdConsumer, projectPortableColdStartHostGuidance, qualifyPortableColdStart } from './handoff/coldStartQualification.js';
import { projectPortableOperatingOverview } from './overview/operatingOverview.js';
import { projectPortableGroundingReadiness } from './grounding/grounding.readiness.js';
import { createPortablePackageOperationEntries } from './operation.catalog.package.js';

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
  'describe-cold-start-ingress': operation({
    name: 'describe-cold-start-ingress',
    description: 'Describe the portable Tiinex-first cold-start ingress contract, measurable preferred-path evidence, minimal host bootstrap allowance, and explicit degraded fallback boundary.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.cold-start-ingress.request.v1',
    handler: (input = {}) => wrapPortableResult('describe-cold-start-ingress', describePortableColdStartIngress(input))
  }),
  'project-cold-start-host': operation({
    name: 'project-cold-start-host',
    description: 'Project non-authoritative host/bootstrap guidance from the portable cold-start ingress contract and current provider-neutral host/session capability bindings.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.cold-start-host-projection.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('project-cold-start-host', projectPortableColdStartHostGuidance(input, options))
  }),
  'ground-cold-consumer': operation({
    name: 'ground-cold-consumer',
    description: 'Ground the selected Handoff recipient Role boundary, participants/contributions, interaction purpose/mode, and provider/host/session capabilities without inferring transport identity or provider authority.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.cold-consumer-grounding.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('ground-cold-consumer', groundPortableColdConsumer(input, options))
  }),
  'project-grounding-readiness': operation({
    name: 'project-grounding-readiness',
    description: 'Compose bounded Handoff authority, exact declared Parent-lineage leaf topology, current-work signals, blockers, and unresolved evidence into fail-visible readiness for the next action.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.grounding-readiness.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('project-grounding-readiness', projectPortableGroundingReadiness(input, options))
  }),
  'qualify-cold-start': operation({
    name: 'qualify-cold-start',
    description: 'Qualify cold-start behavior from either an explicit observation trace or a Handoff package + route one-shot run that generates Tooling orientation/grounding receipts while keeping pre-takeover host evidence explicitly attributed.',
    safety: 'read-only-normalization',
    inputSchema: 'tiinex.portable.cold-start-qualification.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('qualify-cold-start', qualifyPortableColdStart(input, options))
  }),
  'plan-host-action': operation({
    name: 'plan-host-action',
    description: 'Bind a capability-level request to concrete host tools, ranked alternatives, argument templates, and an explicit receipt contract without invoking the host.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.host-action-plan.request.v1',
    remoteFetch: 'host-mediated-optional',
    handler: (input = {}, options = {}) => wrapPortableResult('plan-host-action', planPortableHostAction(input, options))
  }),
  'accept-host-receipt': operation({
    name: 'accept-host-receipt',
    description: 'Validate an explicit host-tool receipt and normalize repository material, local material, or generated multimodal interpretations without treating raw tool output as provenance.',
    safety: 'read-only-normalization',
    inputSchema: 'tiinex.portable.host-action-receipt.accept.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('accept-host-receipt', acceptPortableHostActionReceipt(input, options))
  }),
  'describe-checkpoint-gate': operation({
    name: 'describe-checkpoint-gate',
    description: 'Describe fixed portable, source-clean, or release checkpoint gates without executing commands or claiming browser parity.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.checkpoint-gate.request.v1',
    handler: (input = {}) => wrapPortableResult('describe-checkpoint-gate', describePortableCheckpointGate(input))
  }),
  'qualify-checkpoint': operation({
    name: 'qualify-checkpoint',
    description: 'Qualify explicit validation receipts, portable source identity, checkpoint continuity, reproducibility metadata, and private-evidence boundaries without executing commands.',
    safety: 'read-only-normalization',
    inputSchema: 'tiinex.portable.checkpoint-qualification.request.v1',
    handler: (input = {}) => wrapPortableResult('qualify-checkpoint', qualifyPortableCheckpoint(input))
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
  'project-operating-overview': operation({
    name: 'project-operating-overview',
    description: 'Project loaded Project inventory, exact-qualified Task frontier candidates, explicit blocker/resource signals, and deferred Monitoring/cross-repository capability boundaries without creating overview semantic authority.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.input.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('project-operating-overview', projectPortableOperatingOverview(input, options))
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
  'process-live-turn': operation({
    name: 'process-live-turn',
    description: 'Atomically record one substantive dialogue turn, optionally create or revise supported live artifacts, and return bounded artifact-state for the reply. A no-artifact decision is still receipted.',
    safety: 'local-draft-state-and-response-preflight',
    inputSchema: 'tiinex.portable.live-turn.process.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('process-live-turn', processPortableLiveTurn(input, options))
  }),
  'read-live-lineage': operation({
    name: 'read-live-lineage',
    description: 'Return bounded current artifact-state without exposing raw Markdown, state JSON, or hidden reasoning.',
    safety: 'read-only-local-state',
    inputSchema: 'tiinex.portable.live-lineage.read.request.v1',
    handler: (input = {}) => wrapPortableResult('read-live-lineage', readPortableLiveLineage(input))
  }),
  'export-live-lineage': operation({
    name: 'export-live-lineage',
    description: 'Validate and flush artifacts that already existed during dialogue into an artifact-first changeset; generic Markdown or JSON fallback is forbidden.',
    safety: 'local-package-result',
    inputSchema: 'tiinex.portable.live-lineage.export.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('export-live-lineage', exportPortableLiveLineage(input, options))
  }),
  'prepare-materialization': operation({
    name: 'prepare-materialization',
    description: 'Validate an evidence-grounded proposal for zero, one, or multiple local Tiinex artifacts against shared schema companions and explicit loaded or earlier-proposal Parents without forcing a fixed questionnaire.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.epistemic-materialization.request.v1',
    handler: preparePortableMaterialization
  }),
  'create-local-artifact-set': operation({
    name: 'create-local-artifact-set',
    description: 'Create one or more clean local Tiinex artifacts from a ready epistemic plan, preserving explicit loaded Parents or ordered proposal-to-proposal lineage without source mutation.',
    safety: 'local-draft-result',
    inputSchema: 'tiinex.portable.artifact-set-creation.request.v1',
    handler: createPortableArtifactSet
  }),
  'create-local-draft': operation({
    name: 'create-local-draft',
    description: 'Create an in-memory local Tiinex draft through exact site creation tooling or readable-schema writer fallback, then validate it without mutating source material.',
    safety: 'local-draft-result',
    inputSchema: 'tiinex.portable.draft-creation.request.v1',
    handler: createPortableArtifactDraft
  }),
  'update-local-draft': operation({
    name: 'update-local-draft',
    description: 'Validate and return a complete replacement for explicitly local draft state while preserving identity and blocking silent schema or continuity changes.',
    safety: 'local-draft-result',
    inputSchema: 'tiinex.portable.draft-update.request.v1',
    handler: updatePortableArtifactDraft
  }),
  'delete-local-draft': operation({
    name: 'delete-local-draft',
    description: 'Return an explicitly confirmed local-state deletion record without mutating source material, remote systems, or the caller filesystem.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.draft-delete.request.v1',
    handler: deletePortableArtifactDraft
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
  ...Object.fromEntries(portableLineageOperationDescriptors.map((descriptor) => [descriptor.name, operation(descriptor)])),
  ...Object.fromEntries(portableReductionOperationDescriptors.map((descriptor) => [descriptor.name, operation(descriptor)])),
  ...Object.fromEntries(portableLifecycleOperationDescriptors.map((descriptor) => [descriptor.name, operation(descriptor)])),
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
  ...createPortablePackageOperationEntries({ operation, wrapPortableResult, sessionOperationResult })
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
