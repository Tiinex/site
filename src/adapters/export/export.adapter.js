import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { buildExportPackagePreflight } from '../../export/package.preflight.js';
import { buildExportPackageContract, buildExportPackageManifest, buildExportPackageReceipt } from '../../export/package.manifest.js';
import { buildExportPackageBundle, inspectExportPackageBundle } from '../../export/package.builder.js';
import { buildExportPackageApplyResult, buildExportPackageImportPlan } from '../../export/package.apply.js';

export const EXPORT_ADAPTER_ID = 'export';

export function createExportAdapter() {
  return makeAdapterDefinition({
    id: EXPORT_ADAPTER_ID,
    label: 'Export / Share',
    availability: AdapterAvailability.deferred,
    sourceKinds: ['export.share-package', 'export.public-card'],
    capabilities: {
      exportMaterial: true,
      registerSource: false,
      materialize: false,
      openExternal: true,
      requiresBridge: false,
      preflightPackage: true,
      packageManifest: true,
      packageReceipt: true,
      packageContract: true,
      packageBundle: true,
      inspectPackageBundle: true,
      importPackagePlan: true,
      applyPackageBundle: true
    },
    configShape: {
      workspaceId: 'workspace id',
      includeLocalMaterial: 'explicit policy decision',
      includeSourceLinks: 'source-backed only'
    },
    boundary: 'share/export output must preserve local-vs-source-backed boundaries',
    notes: ['Export is modeled as an adapter so share/package results have the same result vocabulary as source materialization.']
  });
}

export function planExportPackage(workspace = {}, input = {}) {
  return buildExportPackagePreflight(workspace, input);
}

export function planExportPackageManifest(workspace = {}, input = {}) {
  return buildExportPackageManifest(workspace, input);
}

export function planExportPackageReceipt(manifest = {}, input = {}) {
  return buildExportPackageReceipt(manifest, input);
}

export function planExportPackageContract(workspace = {}, input = {}) {
  return buildExportPackageContract(workspace, input);
}

export function buildPlannedExportPackage(workspace = {}, input = {}) {
  return buildExportPackageBundle(workspace, input);
}

export function inspectPlannedExportPackage(bundle = {}) {
  return inspectExportPackageBundle(bundle);
}

export function planExportPackageImport(bundle = {}, input = {}) {
  return buildExportPackageImportPlan(bundle, input);
}

export function applyPlannedExportPackage(bundle = {}, input = {}) {
  return buildExportPackageApplyResult(bundle, input);
}

export function createShareAdapterResult(payload = {}, diagnostics = {}) {
  return makeAdapterResult({
    adapterId: EXPORT_ADAPTER_ID,
    records: [],
    warnings: payload.warnings || [],
    diagnostics: Object.assign({ payload }, diagnostics)
  });
}
