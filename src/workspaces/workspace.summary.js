import { isOriginReferenceSource } from '../sources/origin.references.js';
import { materialReconciliationCounts, countReconciledLocalSnapshots } from './workspace.materialReconciliation.js';
import { isLocalSessionMaterial } from './workspace.localSourceLifecycle.js';
import { buildWorkspaceMaterialLedger } from './workspace.materialLedger.js';
import { isWorkspaceRecord } from '../actions/record.actions.js';
export function summarizeWorkspaceMaterial(workspace = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const importResults = Array.isArray(workspace.importResults) ? workspace.importResults : [];
  const recoveryOriginSources = sources.filter((source) => isOriginReferenceSource(source) || source.recoveryOnly === true);
  const configuredSources = sources.filter((source) => source.id !== 'local' && !recoveryOriginSources.includes(source));
  const sourceBackedRecords = records.filter((record) => isSourceBackedMaterial(record));
  const localRecords = records.filter((record) => isLocalSessionMaterial(record));
  const workspaceArtifacts = records.filter(isWorkspaceRecord);
  const sourceBackedWorkspaceArtifacts = workspaceArtifacts.filter((record) => isSourceBackedMaterial(record));
  const localWorkspaceArtifacts = workspaceArtifacts.filter((record) => isLocalSessionMaterial(record));
  const localAssets = assets.filter((asset) => isLocalSessionMaterial(asset));
  const reconciliationCounts = materialReconciliationCounts(records);
  const reconciledLocalRecords = countReconciledLocalSnapshots(records);
  const directLocalRecords = localRecords.length;
  const localMaterial = Object.freeze({
    records: directLocalRecords + reconciledLocalRecords,
    directRecords: directLocalRecords,
    reconciledLocalRecords,
    assets: localAssets.length,
    workspaceArtifacts: localWorkspaceArtifacts.length,
    total: directLocalRecords + reconciledLocalRecords + localAssets.length
  });
  const currentImportResults = importResults.filter((receipt) => receiptAppliesToCurrentWorkspace(receipt, configuredSources));
  const latestImport = currentImportResults[0] || null;
  const materialLedger = buildWorkspaceMaterialLedger(workspace, { displayOptions: workspace.displayOptions || {} });
  return {
    schema: 'tiinex.workspace.material.summary.v1',
    counts: {
      records: records.length,
      assets: assets.length,
      workspaceArtifacts: workspaceArtifacts.length,
      sources: sources.length,
      configuredSources: configuredSources.length,
      recoveryOriginSources: recoveryOriginSources.length,
      originReferences: recoveryOriginSources.reduce((sum, source) => sum + Number(source.originReferenceCount || 0), 0),
      localRecords: localMaterial.records,
      directLocalRecords: localMaterial.directRecords,
      reconciledLocalRecords,
      localAssets: localAssets.length,
      localWorkspaceArtifacts: localWorkspaceArtifacts.length,
      sourceBackedRecords: sourceBackedRecords.length,
      sourceBackedWorkspaceArtifacts: sourceBackedWorkspaceArtifacts.length,
      materialChecksumMatches: reconciliationCounts.checksumMatches,
      materialChecksumMismatches: reconciliationCounts.checksumMismatches,
      materialUnverifiedSameOrigin: reconciliationCounts.unverifiedSameOrigin,
      warnings: Number(latestImport?.counts?.warnings || 0),
      errors: Number(latestImport?.counts?.errors || 0),
      previewOmitted: Number(latestImport?.counts?.previewOmitted || 0),
      visibleRecords: materialLedger.counts.visibleRecords,
      hiddenRecords: materialLedger.counts.hiddenRecords,
      groupedRecords: materialLedger.counts.groupedRecords,
      hiddenByDisplayRecords: materialLedger.counts.hiddenByDisplayRecords,
      hiddenWorkspaceArtifacts: materialLedger.counts.hiddenWorkspaceArtifacts,
      visibleWorkspaceArtifacts: materialLedger.counts.visibleWorkspaceArtifacts,
      lineageUsableRecords: materialLedger.counts.lineageUsableRecords
    },
    materialLedger,
    latestImport: latestImport ? {
      ok: latestImport.ok !== false,
      message: String(latestImport.message || 'Import completed.').slice(0, 220),
      at: latestImport.at || '',
      warnings: Array.isArray(latestImport.warnings) ? latestImport.warnings.slice(0, 3) : [],
      errors: Array.isArray(latestImport.errors) ? latestImport.errors.slice(0, 3) : [],
      diagnostics: latestImport.diagnostics || {}
    } : null,
    boundaryReadability: buildBoundaryReadability({ localMaterial, sourceBackedRecords, sourceBackedWorkspaceArtifacts, recoveryOriginSources }),
    hasMaterial: Boolean(records.length || assets.length),
    hasSourceBackedMaterial: Boolean(sourceBackedRecords.length || sourceBackedWorkspaceArtifacts.length),
    hasRecoveryOrigins: Boolean(recoveryOriginSources.length),
    hasLocalMaterial: Boolean(localMaterial.total)
  };
}


function receiptAppliesToCurrentWorkspace(receipt = {}, configuredSources = []) {
  const diagnostics = receipt?.diagnostics || {};
  const sourceId = String(diagnostics.sourceId || diagnostics.materialLedgerReceipt?.sourceId || '').trim();
  if (!sourceId) return true;
  return (Array.isArray(configuredSources) ? configuredSources : []).some((source) => String(source?.id || '') === sourceId);
}

export function shouldShowWorkspaceSummary(summary = {}) {
  return Boolean(summary.hasMaterial || summary.latestImport);
}

function isSourceBackedMaterial(item = {}) {
  const source = item?.source || {};
  const mode = String(item?.sourceMode || '').trim().toLowerCase();
  return Boolean(source.adapterId && source.adapterId !== 'local')
    || source.kind === 'github-tree'
    || source.sourceKind === 'github.repo'
    || mode === 'source-backed'
    || mode.includes('source-backed');
}

function buildBoundaryReadability({ localMaterial = {}, sourceBackedRecords = [], sourceBackedWorkspaceArtifacts = [], recoveryOriginSources = [] } = {}) {
  const sourceTotal = Number(sourceBackedRecords.length || 0) + Number(sourceBackedWorkspaceArtifacts.length || 0);
  const localTotal = Number(localMaterial.total || 0);
  const recoveryTotal = Array.isArray(recoveryOriginSources) ? recoveryOriginSources.length : 0;
  return Object.freeze({
    local: localTotal ? 'local/session material: imported or created in this browser; no GitHub provenance inferred' : '',
    source: sourceTotal ? 'source-backed material: loaded from explicitly configured source rows' : '',
    recovery: recoveryTotal ? 'recovery origins: explicit origin metadata only; not loaded source authority' : '',
    mixed: Boolean(localTotal && sourceTotal),
    localTotal,
    sourceTotal,
    recoveryTotal
  });
}
