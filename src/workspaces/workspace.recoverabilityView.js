import { buildPublicationPreflight } from '../publication/publication.preflight.js';
import { buildSourceBoundaryReport } from '../diagnostics/sourceBoundary.report.js';
import { buildReingestPlan } from '../reingest/reingest.plan.js';
import { buildExportPackagePreflight } from '../export/package.preflight.js';
import { buildExportPackageContract, buildExportPackageManifest, buildExportPackageReceipt } from '../export/package.manifest.js';
import { buildExportPackageBundle, inspectExportPackageBundle } from '../export/package.builder.js';
import { buildExportPackageApplyResult, buildExportPackageImportPlan } from '../export/package.apply.js';
import { buildSourceTransportReport } from '../diagnostics/sourceTransport.report.js';

export const WORKSPACE_RECOVERABILITY_VIEW_SCHEMA_ID = 'tiinex.workspace.recoverabilityView.v1';

export function buildWorkspaceRecoverabilityView(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const importResults = Array.isArray(workspace.importResults) ? workspace.importResults : [];
  const importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
  const sourceBackedRecords = records.filter((record) => isSourceBacked(record.source));
  const localRecords = records.filter((record) => !isSourceBacked(record.source));
  const localAssets = assets.filter((asset) => !isSourceBacked(asset.source));
  const previewOmittedAssets = assets.filter((asset) => asset.previewState === 'omitted-large' || asset.cacheState === 'preview-truncated-for-session-cache');
  const latestImport = importResults[0] || null;
  const warnings = importResults.flatMap((result) => Array.isArray(result.warnings) ? result.warnings : []);
  const errors = importResults.flatMap((result) => Array.isArray(result.errors) ? result.errors : []);
  const sourceBoundary = buildSourceBoundaryReport(workspace, { records, assets });
  const sourceTransport = buildSourceTransportReport(workspace);
  const publicationPreflight = buildPublicationPreflight(workspace, { records, assets, workspaceCandidates });
  const reingestPlan = buildReingestPlan(workspace, { records, assets, workspaceCandidates, sourceBoundary, publicationPreflight });
  const exportPackagePreflight = buildExportPackagePreflight(workspace, { records, assets, workspaceCandidates, sourceBoundary, publicationPreflight, reingestPlan });
  const exportPackageManifest = buildExportPackageManifest(workspace, { records, assets, workspaceCandidates, sourceBoundary, publicationPreflight, reingestPlan, preflight: exportPackagePreflight });
  const exportPackageReceipt = buildExportPackageReceipt(exportPackageManifest);
  const exportPackageContract = buildExportPackageContract(workspace, { records, assets, workspaceCandidates, sourceBoundary, publicationPreflight, reingestPlan, preflight: exportPackagePreflight, manifest: exportPackageManifest, receipt: exportPackageReceipt });
  const exportPackageBundle = buildExportPackageBundle(workspace, { records, assets, workspaceCandidates, contract: exportPackageContract });
  const exportPackageBundleInspection = inspectExportPackageBundle(exportPackageBundle);
  const exportPackageImportPlan = buildExportPackageImportPlan(exportPackageBundle, { inspection: exportPackageBundleInspection });
  const exportPackageApplyResult = buildExportPackageApplyResult(exportPackageBundle, { importPlan: exportPackageImportPlan });
  const degraded = Boolean(errors.length || warnings.length || previewOmittedAssets.length || sourceBoundary.status !== 'clean' || sourceTransport.status !== 'clean' || publicationPreflight.status !== 'ready' || reingestPlan.status !== 'ready' || exportPackagePreflight.status !== 'ready');

  return {
    schema: WORKSPACE_RECOVERABILITY_VIEW_SCHEMA_ID,
    workspaceId: workspace.id || '',
    title: `Recoverability · ${workspace.title || workspace.name || 'workspace'}`,
    status: errors.length ? 'needs-attention' : degraded ? 'degraded' : 'recoverable',
    boundary: 'Loaded/session recovery summary. Local material remains local; source-backed material keeps explicit source boundaries.',
    counts: {
      records: records.length,
      localRecords: localRecords.length,
      sourceBackedRecords: sourceBackedRecords.length,
      assets: assets.length,
      localAssets: localAssets.length,
      workspaceCandidates: workspaceCandidates.length,
      importResults: importResults.length,
      warnings: warnings.length,
      errors: errors.length,
      previewOmitted: previewOmittedAssets.length,
      importLogEntries: importLog.length,
      sourceBoundaryErrors: sourceBoundary.counts.errors || 0,
      sourceBoundaryWarnings: sourceBoundary.counts.warnings || 0,
      sourceTransportEvents: sourceTransport.counts.events || 0,
      sourceTransportRateLimited: sourceTransport.counts.rateLimited || 0,
      sourceTransportRetryable: sourceTransport.counts.retryable || 0,
      sourceTransportErrors: sourceTransport.counts.errors || 0,
      sourceTransportWarnings: sourceTransport.counts.warnings || 0,
      publishableLocalDrafts: publicationPreflight.counts.publishableLocalDrafts || 0,
      publicationPreflightErrors: publicationPreflight.counts.errors || 0,
      publicationPreflightWarnings: publicationPreflight.counts.warnings || 0,
      reingestSourceTargets: reingestPlan.counts.sourceTargets || 0,
      reingestPinnedSourceTargets: reingestPlan.counts.pinnedSourceTargets || 0,
      reingestLocalDraftTargets: reingestPlan.counts.localDraftTargets || 0,
      reingestErrors: reingestPlan.counts.errors || 0,
      reingestWarnings: reingestPlan.counts.warnings || 0,
      exportPackageEntries: exportPackagePreflight.counts.packageEntries || 0,
      exportPackageLocalDraftEntries: exportPackagePreflight.counts.localDraftEntries || 0,
      exportPackageSourceReferences: exportPackagePreflight.counts.sourceReferenceEntries || 0,
      exportPackageErrors: exportPackagePreflight.counts.errors || 0,
      exportPackageWarnings: exportPackagePreflight.counts.warnings || 0,
      exportPackageManifestEntries: exportPackageManifest.counts.entries || 0,
      exportPackageManifestBlocked: exportPackageManifest.counts.blocked || 0,
      exportPackageBundleFiles: exportPackageBundle.counts.files || 0,
      exportPackageBundleMaterialFiles: exportPackageBundle.counts.materialFiles || 0,
      exportPackageBundleErrors: exportPackageBundle.counts.errors || 0,
      exportPackageBundleWarnings: exportPackageBundle.counts.warnings || 0,
      exportPackageImportRecords: exportPackageImportPlan.counts.importedRecords || 0,
      exportPackageImportSourceReferences: exportPackageImportPlan.counts.sourceReferences || 0,
      exportPackageImportAssets: exportPackageImportPlan.counts.assets || 0,
      exportPackageImportWorkspaceCandidates: exportPackageImportPlan.counts.workspaceCandidates || 0,
      exportPackageApplyRecords: exportPackageApplyResult.counts.records || 0,
      exportPackageApplyAssets: exportPackageApplyResult.counts.assets || 0
    },
    latestImport: latestImport ? summarizeImportResult(latestImport) : null,
    sourceBoundary,
    sourceTransport: summarizeSourceTransport(sourceTransport),
    publicationPreflight: summarizePublicationPreflight(publicationPreflight),
    reingestPlan: summarizeReingestPlan(reingestPlan),
    exportPackagePreflight: summarizeExportPackagePreflight(exportPackagePreflight),
    exportPackageManifest: summarizeExportPackageManifest(exportPackageManifest),
    exportPackageReceipt: summarizeExportPackageReceipt(exportPackageReceipt),
    exportPackageContract: summarizeExportPackageContract(exportPackageContract),
    exportPackageBundle: summarizeExportPackageBundle(exportPackageBundle, exportPackageBundleInspection),
    exportPackageImportPlan: summarizeExportPackageImportPlan(exportPackageImportPlan),
    exportPackageApplyResult: summarizeExportPackageApplyResult(exportPackageApplyResult),
    guarantees: [
      `${localRecords.length} local/session artifact${localRecords.length === 1 ? '' : 's'} retained without GitHub provenance.`,
      `${localAssets.length} local asset${localAssets.length === 1 ? '' : 's'} retained as assets, not fake leaves.`,
      `${workspaceCandidates.length} workspace candidate${workspaceCandidates.length === 1 ? '' : 's'} available for explicit open/merge.`,
      `${sourceBackedRecords.length} source-backed artifact${sourceBackedRecords.length === 1 ? '' : 's'} retain explicit source boundary.`
    ],
    warnings: warnings.slice(0, 10).map(normalizeIssue),
    errors: errors.slice(0, 10).map(normalizeIssue),
    assets: assets.slice(0, 12).map((asset) => ({
      id: asset.id || asset.path || '',
      path: asset.path || '',
      name: asset.name || asset.path || 'asset',
      previewState: asset.previewState || (asset.content || asset.dataUrl ? 'preview-available' : 'metadata-only'),
      cacheState: asset.cacheState || '',
      boundary: asset.source?.boundary || 'Local/session asset boundary.'
    }))
  };
}





function summarizeSourceTransport(report = {}) {
  return {
    schema: report.schema || 'tiinex.sourceTransport.report.v1',
    status: report.status || 'unknown',
    boundary: report.boundary || '',
    counts: Object.assign({ sources: 0, importResults: 0, adapterResults: 0, events: 0, requests: 0, cacheHits: 0, cacheMisses: 0, rateLimited: 0, unavailable: 0, notFound: 0, retryable: 0, errors: 0, warnings: 0 }, report.counts || {}),
    events: (report.events || []).slice(0, 8).map(normalizeIssue),
    nextActions: (report.nextActions || []).slice(0, 5)
  };
}

function summarizeExportPackageImportPlan(plan = {}) {
  return {
    schema: plan.schema || 'tiinex.export.package.import.plan.v1',
    status: plan.status || 'unknown',
    packageId: plan.packageId || '',
    boundary: plan.boundary || '',
    counts: Object.assign({ files: 0, importedRecords: 0, sourceReferences: 0, assets: 0, metadataOnlyAssets: 0, workspaceCandidates: 0, errors: 0, warnings: 0 }, plan.counts || {}),
    findings: (plan.findings || []).slice(0, 8).map(normalizeIssue)
  };
}

function summarizeExportPackageApplyResult(result = {}) {
  return {
    schema: result.schema || 'tiinex.export.package.apply.result.v1',
    status: result.status || 'unknown',
    packageId: result.packageId || '',
    boundary: result.boundary || '',
    counts: Object.assign({ records: 0, assets: 0, sourceReferences: 0, workspaceCandidates: 0, errors: 0, warnings: 0 }, result.counts || {}),
    diagnostics: Object.assign({ noRemoteFetch: false, noSourceMutation: false }, result.adapterResult?.diagnostics || {})
  };
}

function summarizeExportPackageBundle(bundle = {}, inspection = {}) {
  return {
    schema: bundle.schema || 'tiinex.export.package.bundle.v1',
    status: bundle.status || 'unknown',
    packageId: bundle.packageId || '',
    boundary: bundle.boundary || '',
    packageFingerprint: bundle.packageFingerprint || '',
    counts: Object.assign({ files: 0, controlFiles: 0, materialFiles: 0, localDraftFiles: 0, sourceReferenceFiles: 0, assetContentFiles: 0, assetMetadataFiles: 0, workspaceCandidateFiles: 0, errors: 0, warnings: 0 }, bundle.counts || {}),
    inspection: {
      schema: inspection.schema || 'tiinex.export.package.bundle.inspection.v1',
      status: inspection.status || 'unknown',
      counts: Object.assign({ files: 0, findings: 0, errors: 0 }, inspection.counts || {})
    },
    findings: (bundle.findings || []).slice(0, 8).map(normalizeIssue)
  };
}

function summarizeExportPackageManifest(manifest = {}) {
  return {
    schema: manifest.schema || 'tiinex.export.package.manifest.v1',
    status: manifest.status || 'unknown',
    packageId: manifest.packageId || '',
    boundary: manifest.boundary || '',
    counts: Object.assign({ entries: 0, localDrafts: 0, sourceReferences: 0, assets: 0, workspaceContextCandidates: 0, blocked: 0, errors: 0, warnings: 0 }, manifest.counts || {}),
    integrity: Object.assign({ algorithm: '', fingerprint: '' }, manifest.integrity || {}),
    findings: (manifest.findings || []).slice(0, 8).map(normalizeIssue)
  };
}

function summarizeExportPackageReceipt(receipt = {}) {
  return {
    schema: receipt.schema || 'tiinex.export.package.receipt.v1',
    state: receipt.state || 'unknown',
    status: receipt.status || 'unknown',
    receiptId: receipt.receiptId || '',
    manifestFingerprint: receipt.manifestFingerprint || '',
    boundary: receipt.boundary || '',
    counts: Object.assign({ entries: 0, blocked: 0, errors: 0, warnings: 0 }, receipt.counts || {}),
    nextActions: (receipt.nextActions || []).slice(0, 5),
    findings: (receipt.findings || []).slice(0, 8).map(normalizeIssue)
  };
}

function summarizeExportPackageContract(contract = {}) {
  return {
    schema: contract.schema || 'tiinex.export.package.contract.v1',
    status: contract.status || 'unknown',
    boundary: contract.boundary || ''
  };
}

function summarizeExportPackagePreflight(preflight = {}) {
  return {
    schema: preflight.schema || 'tiinex.export.package.preflight.v1',
    status: preflight.status || 'unknown',
    boundary: preflight.boundary || '',
    entryPolicy: preflight.entryPolicy || '',
    counts: Object.assign({ packageEntries: 0, localDraftEntries: 0, blockedLocalEntries: 0, sourceReferenceEntries: 0, pinnedSourceReferences: 0, degradedSourceReferences: 0, assetEntries: 0, metadataOnlyAssets: 0, workspaceCandidateEntries: 0, errors: 0, warnings: 0 }, preflight.counts || {}),
    findings: (preflight.findings || []).slice(0, 8).map(normalizeIssue)
  };
}

function summarizeReingestPlan(plan = {}) {
  return {
    schema: plan.schema || 'tiinex.reingest.plan.v1',
    status: plan.status || 'unknown',
    boundary: plan.boundary || '',
    counts: Object.assign({ sourceTargets: 0, pinnedSourceTargets: 0, degradedSourceTargets: 0, localDraftTargets: 0, blockedLocalTargets: 0, assets: 0, metadataOnlyAssets: 0, workspaceCandidates: 0, errors: 0, warnings: 0 }, plan.counts || {}),
    findings: (plan.findings || []).slice(0, 8).map(normalizeIssue)
  };
}

function summarizePublicationPreflight(preflight = {}) {
  return {
    schema: preflight.schema || 'tiinex.publication.preflight.v1',
    status: preflight.status || 'unknown',
    boundary: preflight.boundary || '',
    counts: Object.assign({ publishableLocalDrafts: 0, blockedLocalDrafts: 0, sourceReferences: 0, errors: 0, warnings: 0 }, preflight.counts || {}),
    findings: (preflight.findings || []).slice(0, 8).map(normalizeIssue)
  };
}

function summarizeImportResult(result = {}) {
  return {
    ok: result.ok !== false,
    message: result.message || 'Import result available.',
    at: result.at || '',
    counts: Object.assign({ records: 0, assets: 0, workspaceEntries: 0, warnings: 0, errors: 0, previewOmitted: 0 }, result.counts || {}),
    diagnostics: Object.assign({}, result.diagnostics || {})
  };
}

function normalizeIssue(issue = {}) {
  if (typeof issue === 'string') return { code: 'message', message: issue };
  return {
    code: issue.code || issue.error || issue.type || 'message',
    message: issue.message || issue.error || String(issue.code || issue.type || 'Issue'),
    path: issue.path || issue.ref || ''
  };
}

function isSourceBacked(source = {}) {
  return Boolean(source?.adapterId && source.adapterId !== 'local');
}
