import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { resolveLineage } from '../lineage/lineage.resolve.js';
import { traverseLoadedLineage } from '../lineage/lineage.traverse.js';
import { buildWorkspaceAuditView } from '../workspaces/workspace.auditView.js';
import { buildLoadedAuditTraversalScope } from '../audit/audit.traverse.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { buildWorkspacePathTree } from '../workspaces/workspace.pathTree.js';
import { summarizeWorkspaceMaterial } from '../workspaces/workspace.summary.js';
import { createContinuationDraft, createReferenceDraft } from '../transitions/record.transitions.js';
import { buildPublicationPreflight } from '../publication/publication.preflight.js';
import { buildReingestPlan } from '../reingest/reingest.plan.js';
import { buildExportPackagePreflight } from '../export/package.preflight.js';
import { buildExportPackageContract, buildExportPackageManifest, buildExportPackageReceipt } from '../export/package.manifest.js';
import { buildExportPackageBundle, inspectExportPackageBundle } from '../export/package.builder.js';
import { buildExportPackageApplyResult, buildExportPackageImportPlan } from '../export/package.apply.js';
import { buildSourceBoundaryReport } from '../diagnostics/sourceBoundary.report.js';
import { buildSourceTransportReport } from '../diagnostics/sourceTransport.report.js';
import { buildSchemaCapabilityRegistry, resolveSchemaCapabilities } from '../schemas/capability.registry.js';
import { listSurfaceFindings, surfaceRegistry } from '../surfaces/registry.js';
import { buildArtifactCreationContract, listCreatableArtifactSchemas, validateArtifactCreationContract, validateArtifactCreationResult } from '../schemas/creation.contracts.js';
import { summarizeStoragePolicy } from '../storage/storage.policy.js';
import { authorizeSourceTransport, summarizeSourceTransportOutcomes } from '../sources/transport.policy.js';
import { conformanceFixtures } from './conformance.fixtures.js';

export const CONFORMANCE_RESULT_SCHEMA_ID = 'tiinex.conformance.result.v1';

export function materializeConformanceWorkspace(fixtureSet = conformanceFixtures) {
  const workspace = {
    id: fixtureSet.id || 'core-loaded-workspace-v1',
    title: 'Conformance Fixture Workspace',
    name: 'Conformance Fixture Workspace',
    kind: 'workspace',
    source: makeLocalSource(),
    sources: [makeLocalSource()],
    sourceOrder: ['local'],
    records: (fixtureSet.records || []).map(materializeRecord),
    assets: (fixtureSet.assets || []).map((asset) => Object.assign({}, asset)),
    workspaceMergeCandidates: (fixtureSet.workspaceCandidates || []).map((candidate) => Object.assign({}, candidate)),
    importResults: [{
      schema: 'tiinex.workspace.import.result.v1',
      ok: true,
      message: 'Conformance fixture materialized.',
      counts: {
        records: (fixtureSet.records || []).length,
        assets: (fixtureSet.assets || []).length,
        workspaceEntries: (fixtureSet.workspaceCandidates || []).length,
        warnings: 0,
        errors: 0,
        previewOmitted: 0
      },
      warnings: [],
      errors: [],
      diagnostics: { fixtureSet: fixtureSet.id || 'core-loaded-workspace-v1' },
      at: '2026-07-21T00:00:00.000Z'
    }],
    importLog: [{ kind: 'conformance-fixture', at: '2026-07-21T00:00:00.000Z' }]
  };
  return workspace;
}

export function runConformanceFixtureSet(fixtureSet = conformanceFixtures) {
  const workspace = materializeConformanceWorkspace(fixtureSet);
  const lineage = resolveLineage(workspace.records, { depth: 'loaded-workspace-conformance' });
  const lineageTraversal = traverseLoadedLineage(workspace.records, { startId: 'topic-child-trace', direction: 'ancestors', maxDepth: 4, resolvedLineage: lineage });
  const lineageView = buildWorkspaceLineageView(workspace, { records: workspace.records });
  const auditTraversalScope = buildLoadedAuditTraversalScope(workspace.records, { startId: 'topic-child-trace', direction: 'ancestors', maxDepth: 4, traversal: lineageTraversal });
  const auditView = buildWorkspaceAuditView(workspace, { records: workspace.records });
  const pathTree = buildWorkspacePathTree({
    records: workspace.records,
    assets: workspace.assets,
    workspaceCandidates: workspace.workspaceMergeCandidates,
    rootLabel: workspace.title
  });
  const summary = summarizeWorkspaceMaterial(workspace);
  const sourceBoundary = buildSourceBoundaryReport(workspace);
  const sourceTransport = buildSourceTransportReport(workspace);
  const sourceTransportAuthorization = authorizeSourceTransport({ kind: 'conformance-no-fetch', sourceId: 'local', adapterId: 'local', requestedRequests: 0 }, { maxRequestsPerOperation: 1, now: '2026-07-21T02:00:00.000Z' });
  const sourceTransportPolicySummary = summarizeSourceTransportOutcomes([sourceTransportAuthorization]);
  const storagePolicy = summarizeStoragePolicy(workspace);
  const schemaCapabilities = buildSchemaCapabilityRegistry();
  const unknownSchemaCapabilityResolution = resolveSchemaCapabilities({ schemaId: 'tiinex.future.unknown.v9' });
  const creatableArtifactSchemas = listCreatableArtifactSchemas();
  const topicCreationContract = buildArtifactCreationContract({ schemaId: 'tiinex.topic.v1', transitionType: 'continue-from-record' });
  const unknownCreationContract = buildArtifactCreationContract({ schemaId: 'tiinex.future.unknown.v9', transitionType: 'create-artifact' });
  const publicationPreflight = buildPublicationPreflight(workspace);
  const reingestPlan = buildReingestPlan(workspace, { sourceBoundary, publicationPreflight });
  const exportPackagePreflight = buildExportPackagePreflight(workspace, { sourceBoundary, schemaCapabilities, unknownSchemaCapabilityResolution, publicationPreflight, reingestPlan });
  const exportPackageManifest = buildExportPackageManifest(workspace, { sourceBoundary, schemaCapabilities, unknownSchemaCapabilityResolution, publicationPreflight, reingestPlan, preflight: exportPackagePreflight, clock: () => '2026-07-21T02:00:00.000Z' });
  const exportPackageReceipt = buildExportPackageReceipt(exportPackageManifest, { clock: () => '2026-07-21T02:01:00.000Z' });
  const exportPackageContract = buildExportPackageContract(workspace, { sourceBoundary, schemaCapabilities, unknownSchemaCapabilityResolution, publicationPreflight, reingestPlan, preflight: exportPackagePreflight, manifest: exportPackageManifest, receipt: exportPackageReceipt, clock: () => '2026-07-21T02:02:00.000Z' });
  const exportPackageBundle = buildExportPackageBundle(workspace, { contract: exportPackageContract, clock: () => '2026-07-21T02:03:00.000Z' });
  const exportPackageBundleInspection = inspectExportPackageBundle(exportPackageBundle);
  const exportPackageImportPlan = buildExportPackageImportPlan(exportPackageBundle, { inspection: exportPackageBundleInspection });
  const exportPackageApplyResult = buildExportPackageApplyResult(exportPackageBundle, { importPlan: exportPackageImportPlan });
  const transitionParent = workspace.records.find((record) => record.id === 'topic-child-trace') || workspace.records[0];
  const continuationDraft = transitionParent ? createContinuationDraft(transitionParent, { id: 'tiinex.topic.v1', label: 'Topic' }, { title: 'Continue Fixture', summary: 'Continuation fixture draft.' }, { clock: () => '2026-07-21T01:00:00.000Z' }) : null;
  const referenceDraft = transitionParent ? createReferenceDraft(transitionParent, { title: 'Reference Fixture', summary: 'Reference fixture draft.' }, { clock: () => '2026-07-21T01:00:00.000Z' }) : null;
  const topicCreationContractValidation = validateArtifactCreationContract(topicCreationContract);
  const unknownCreationContractValidation = validateArtifactCreationContract(unknownCreationContract);
  const continuationCreationValidation = continuationDraft && transitionParent ? validateArtifactCreationResult(continuationDraft, transitionParent, { contract: topicCreationContract }) : null;
  return {
    schema: CONFORMANCE_RESULT_SCHEMA_ID,
    fixtureSet: fixtureSet.id || 'core-loaded-workspace-v1',
    workspace,
    lineage,
    lineageView,
    lineageTraversal,
    auditView,
    auditTraversalScope,
    pathTree,
    summary,
    transitions: { continuationDraft, referenceDraft },
    sourceBoundary,
    sourceTransport,
    sourceTransportAuthorization,
    sourceTransportPolicySummary,
    storagePolicy,
    schemaCapabilities,
    surfaceRegistry,
    surfaceFindings: listSurfaceFindings(),
    unknownSchemaCapabilityResolution,
    creationContracts: { creatableArtifactSchemas, topicCreationContract, unknownCreationContract, topicCreationContractValidation, unknownCreationContractValidation, continuationCreationValidation },
    publicationPreflight,
    reingestPlan,
    exportPackagePreflight,
    exportPackageManifest,
    exportPackageReceipt,
    exportPackageContract,
    exportPackageBundle,
    exportPackageBundleInspection,
    exportPackageImportPlan,
    exportPackageApplyResult,
    invariants: summarizeConformanceInvariants({ workspace, lineage, lineageTraversal, auditTraversalScope, auditView, continuationDraft, referenceDraft, sourceBoundary, sourceTransport, sourceTransportAuthorization, sourceTransportPolicySummary, storagePolicy, schemaCapabilities, unknownSchemaCapabilityResolution, creatableArtifactSchemas, topicCreationContract, unknownCreationContract, topicCreationContractValidation, unknownCreationContractValidation, continuationCreationValidation, publicationPreflight, reingestPlan, exportPackagePreflight, exportPackageManifest, exportPackageReceipt, exportPackageContract, exportPackageBundle, exportPackageBundleInspection, exportPackageImportPlan, exportPackageApplyResult })
  };
}

export function summarizeConformanceInvariants(result = {}) {
  const workspace = result.workspace || {};
  const lineage = result.lineage || {};
  const audit = result.auditView || {};
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const localBoundaryViolations = records.filter((record) => record.source?.adapterId && record.source.adapterId !== 'local');
  const parentEdges = (lineage.edges || []).filter((edge) => edge.kind === 'parent' && edge.status !== 'missing');
  const missingParentFindings = (lineage.findings || []).filter((finding) => finding.code === 'lineage.parent.missing');
  const fallbackItems = (audit.items || []).filter((item) => item.fallbackUsed);
  const invalidItems = (audit.items || []).filter((item) => item.status === 'invalid-or-incomplete');
  return {
    schema: 'tiinex.conformance.invariants.v1',
    localBoundaryClean: localBoundaryViolations.length === 0,
    localBoundaryViolations: localBoundaryViolations.map((record) => record.id || record.path),
    loadedParentEdges: parentEdges.length,
    missingParentFindings: missingParentFindings.length,
    lineageTraversalPresent: result.lineageTraversal?.schema === 'tiinex.lineage.traversal.v1',
    lineageTraversalLoadedOnly: result.lineageTraversal?.boundary?.includes('no remote fetch') === true,
    lineageTraversalVisitsAncestors: (result.lineageTraversal?.nodes || []).some((node) => node.id === 'topic-parent') && (result.lineageTraversal?.nodes || []).some((node) => node.id === 'topic-child-trace'),
    auditTraversalScopePresent: result.auditTraversalScope?.schema === 'tiinex.audit.traversal.scope.v1',
    auditTraversalScopeLoadedOnly: result.auditTraversalScope?.boundary?.includes('no remote fetch') === true,
    auditTraversalScopeAuditsVisited: (result.auditTraversalScope?.counts?.auditedNodes || 0) === (result.auditTraversalScope?.counts?.visitedNodes || -1),
    rootFallbackItems: fallbackItems.length,
    invalidItems: invalidItems.length,
    continuationEnvelope: Boolean(result.continuationDraft?.markdown?.includes('Envelope Schema') && result.continuationDraft?.markdown?.includes('Continuity Integrity')),
    referenceEnvelope: Boolean(result.referenceDraft?.markdown?.includes('Envelope Schema') && result.referenceDraft?.markdown?.includes('Continuity Integrity')),
    continuationValidationClean: result.continuationDraft?.validation?.ok === true,
    referenceValidationClean: result.referenceDraft?.validation?.ok === true,
    transitionSourceBoundaryClean: [result.continuationDraft, result.referenceDraft].every((draft) => draft && String(draft.sourceMode || '').startsWith('local') && !draft.source?.adapterId),
    sourceBoundaryClean: result.sourceBoundary?.status === 'clean',
    sourceTransportPresent: result.sourceTransport?.schema === 'tiinex.sourceTransport.report.v1',
    sourceTransportObservationOnly: result.sourceTransport?.boundary?.includes('must not infer provenance') === true,
    sourceTransportCleanForLocalFixture: result.sourceTransport?.status === 'clean',
    sourceTransportPolicyPresent: result.sourceTransportAuthorization?.schema === 'tiinex.sourceTransport.authorization.v1',
    sourceTransportPolicyDoesNotFetchLocalFixture: result.sourceTransportAuthorization?.allowed === true && result.sourceTransportAuthorization?.operation?.requestedRequests === 0,
    sourceTransportPolicySummaryClean: result.sourceTransportPolicySummary?.status === 'clean',
    storagePolicyPresent: result.storagePolicy?.schema === 'tiinex.storage.policy.v1',
    storagePolicyCountsMaterial: (result.storagePolicy?.counts?.records || 0) >= 1 && (result.storagePolicy?.counts?.assets || 0) >= 1,
    schemaCapabilityRegistryPresent: Boolean(result.schemaCapabilities?.schema),
    schemaCapabilityRegistryClean: result.schemaCapabilities?.status === 'clean',
    schemaCapabilityRegistryCoversModules: (result.schemaCapabilities?.counts?.modules || 0) >= 7,
    schemaCapabilityUnknownUsesRootFallback: result.unknownSchemaCapabilityResolution?.fallbackUsed === true && result.unknownSchemaCapabilityResolution?.descriptor?.moduleId === 'tiinex.root.v1',
    surfaceRegistryPresent: result.surfaceRegistry?.schema === 'tiinex.surface.registry.v1',
    surfaceRegistryNoParityClaims: (result.surfaceRegistry?.counts?.parity || 0) === 0,
    surfaceRegistryHasPartialCoreViews: (result.surfaceRegistry?.counts?.partial || 0) >= 4,
    surfaceRegistryScaffoldsAreDisclosed: ((result.surfaceRegistry?.counts?.scaffold || 0) + (result.surfaceRegistry?.counts?.unavailable || 0)) === 0 || (result.surfaceFindings || []).some((finding) => finding.code === 'surface.status.scaffold'),
    artifactCreationContractsPresent: Array.isArray(result.creatableArtifactSchemas) && result.creatableArtifactSchemas.length >= 2,
    artifactCreationContractReady: result.topicCreationContract?.status === 'ready' && result.topicCreationContractValidation?.ok === true,
    artifactCreationUnknownBlocked: result.unknownCreationContract?.status === 'blocked' && result.unknownCreationContractValidation?.ok === false,
    artifactCreationResultValidates: result.continuationCreationValidation?.ok === true,
    artifactCreationResultLocalOnly: result.continuationDraft?.creationContract?.resultBoundary?.remoteWrite === false && !result.continuationDraft?.source?.adapterId,
    publicationPreflightPresent: Boolean(result.publicationPreflight?.schema),
    publicationPreflightProtectsNonDrafts: (result.publicationPreflight?.counts?.blockedLocalDrafts || 0) >= 1,
    reingestPlanPresent: Boolean(result.reingestPlan?.schema),
    reingestPlanProtectsLocalMaterial: (result.reingestPlan?.counts?.blockedLocalTargets || 0) >= 1,
    exportPackagePreflightPresent: Boolean(result.exportPackagePreflight?.schema),
    exportPackageProtectsLocalMaterial: (result.exportPackagePreflight?.counts?.blockedLocalEntries || 0) >= 1,
    exportPackageKeepsAssetsAsAssets: (result.exportPackagePreflight?.assetEntries || []).every((entry) => entry.kind === 'asset'),
    exportPackageManifestPresent: Boolean(result.exportPackageManifest?.schema),
    exportPackageManifestMatchesPreflight: (result.exportPackageManifest?.counts?.sourceReferences || 0) === (result.exportPackagePreflight?.counts?.sourceReferenceEntries || 0),
    exportPackageManifestKeepsAssetsAsAssets: (result.exportPackageManifest?.material?.assets || []).every((entry) => entry.kind === 'asset'),
    exportPackageReceiptPresent: Boolean(result.exportPackageReceipt?.schema),
    exportPackageContractPresent: Boolean(result.exportPackageContract?.schema),
    exportPackageContractNoMutation: result.exportPackageContract?.boundary?.includes('No-mutation') === true,
    exportPackageBundlePresent: Boolean(result.exportPackageBundle?.schema),
    exportPackageBundleNoMutation: result.exportPackageBundle?.boundary?.includes('mutates no source') === true,
    exportPackageBundleHasControlFiles: ['tiinex.package/index.json', 'tiinex.package/manifest.json', 'tiinex.package/receipt.json'].every((path) => (result.exportPackageBundle?.files || []).some((file) => file.path === path)),
    exportPackageBundleInspectionValid: result.exportPackageBundleInspection?.status === 'valid',
    exportPackageBundleKeepsAssetsOutOfArtifacts: (result.exportPackageBundle?.files || []).filter((file) => String(file.kind || '').startsWith('asset')).every((file) => !String(file.path || '').startsWith('artifacts/')),
    exportPackageBundleKeepsSourceRefsOutOfArtifacts: (result.exportPackageBundle?.files || []).filter((file) => file.kind === 'source-reference').every((file) => !String(file.path || '').startsWith('artifacts/')),
    exportPackageImportPlanPresent: Boolean(result.exportPackageImportPlan?.schema),
    exportPackageImportPlanNoGithubGuess: (result.exportPackageImportPlan?.records || []).every((record) => record.source?.adapterId !== 'github'),
    exportPackageImportPlanKeepsSourceRefsSeparate: (result.exportPackageImportPlan?.sourceReferences || []).length === (result.exportPackageManifest?.counts?.sourceReferences || 0),
    exportPackageImportPlanKeepsAssetsAsAssets: (result.exportPackageImportPlan?.assets || []).every((asset) => asset.schema === 'tiinex.local.asset.v1'),
    exportPackageApplyResultPresent: Boolean(result.exportPackageApplyResult?.schema),
    exportPackageApplyResultNoRemoteMutation: result.exportPackageApplyResult?.adapterResult?.diagnostics?.noRemoteFetch === true && result.exportPackageApplyResult?.adapterResult?.diagnostics?.noSourceMutation === true,
    exportPackageApplyKeepsSourceRefsOutOfRecords: (result.exportPackageApplyResult?.adapterResult?.records || []).every((record) => record.source?.adapterId !== 'github')
  };
}

function materializeRecord(fixture = {}) {
  const record = createRecordFromMarkdown(fixture.markdown || '', { path: fixture.path, name: fixture.title, sourceMode: fixture.sourceMode || 'local-fixture' });
  return Object.assign({}, record, {
    id: fixture.id || `record:${fixture.path || fixture.title}`,
    path: fixture.path || record.path || '',
    title: fixture.title || record.title,
    sourceMode: fixture.sourceMode || 'local-fixture',
    source: makeLocalSource({ path: fixture.path || record.path || '' })
  });
}

function makeLocalSource(extra = {}) {
  return Object.assign({
    id: 'local',
    label: 'Local session',
    adapterId: 'local',
    kind: 'local-session',
    sourceKind: 'local.session',
    boundary: 'Browser-local session material; no GitHub provenance inferred.',
    count: 0
  }, extra);
}
