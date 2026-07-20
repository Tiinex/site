import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';

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
      requiresBridge: false
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

export function createShareAdapterResult(payload = {}, diagnostics = {}) {
  return makeAdapterResult({
    adapterId: EXPORT_ADAPTER_ID,
    records: [],
    warnings: payload.warnings || [],
    diagnostics: Object.assign({ payload }, diagnostics)
  });
}
