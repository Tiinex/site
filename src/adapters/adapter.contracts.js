export const ADAPTER_DEFINITION_SCHEMA_ID = 'tiinex.adapter.definition.v1';
export const ADAPTER_RESULT_SCHEMA_ID = 'tiinex.adapter.result.v1';
export const SOURCE_REGISTRATION_SCHEMA_ID = 'tiinex.source.registration.v1';

export const AdapterAvailability = Object.freeze({
  available: 'available',
  deferred: 'deferred',
  unavailable: 'unavailable'
});

export const AdapterResultState = Object.freeze({
  ok: 'ok',
  partial: 'partial',
  failed: 'failed',
  unavailable: 'unavailable'
});

export const SourceDiscoveryState = Object.freeze({
  notStarted: 'not-started',
  deferred: 'deferred',
  loading: 'loading',
  loaded: 'loaded',
  partial: 'partial',
  failed: 'failed',
  unavailable: 'unavailable'
});

export function makeAdapterDefinition(input = {}) {
  const id = cleanId(input.id || input.adapterId);
  if (!id) throw new Error('adapter.id.required');
  const sourceKinds = freezeList(input.sourceKinds);
  return Object.freeze({
    schema: ADAPTER_DEFINITION_SCHEMA_ID,
    id,
    label: String(input.label || id).trim(),
    availability: input.availability || AdapterAvailability.available,
    sourceKinds,
    capabilities: Object.freeze(Object.assign({
      registerSource: false,
      materialize: false,
      discover: false,
      resolveAsset: false,
      openExternal: false,
      exportMaterial: false,
      requiresBridge: false
    }, input.capabilities || {})),
    configShape: Object.freeze(Object.assign({}, input.configShape || {})),
    resultShape: Object.freeze(Object.assign({
      schema: ADAPTER_RESULT_SCHEMA_ID,
      records: 'array',
      errors: 'array',
      warnings: 'array',
      diagnostics: 'object',
      provenance: 'explicit'
    }, input.resultShape || {})),
    boundary: String(input.boundary || 'adapter boundary is explicit').trim(),
    unavailableReason: String(input.unavailableReason || '').trim(),
    notes: freezeList(input.notes)
  });
}

export function makeSourceRegistration(input = {}, adapter = null) {
  const adapterId = cleanId(input.adapterId || adapter?.id);
  const sourceKind = String(input.sourceKind || input.kind || adapter?.sourceKinds?.[0] || '').trim();
  if (!adapterId) throw new Error('source.adapterId.required');
  if (!sourceKind) throw new Error('source.sourceKind.required');
  const id = String(input.id || `${adapterId}:${stableSourceKey(input)}`).trim();
  return Object.freeze({
    schema: SOURCE_REGISTRATION_SCHEMA_ID,
    id,
    adapterId,
    sourceKind,
    label: String(input.label || input.repo || input.path || id).trim(),
    config: Object.freeze(Object.assign({}, input.config || sourceConfigFromLegacyFields(input))),
    discoveryState: input.discoveryState || SourceDiscoveryState.deferred,
    count: Math.max(0, Number(input.count || 0)),
    boundary: String(input.boundary || adapter?.boundary || 'explicit source boundary').trim(),
    closeable: input.closeable !== false
  });
}

export function makeAdapterResult(input = {}) {
  const records = Array.isArray(input.records) ? input.records.slice() : [];
  const errors = Array.isArray(input.errors) ? input.errors.slice() : [];
  const warnings = Array.isArray(input.warnings) ? input.warnings.slice() : [];
  const state = input.state || (errors.length && records.length ? AdapterResultState.partial : (errors.length ? AdapterResultState.failed : AdapterResultState.ok));
  return Object.freeze({
    schema: ADAPTER_RESULT_SCHEMA_ID,
    adapterId: cleanId(input.adapterId || ''),
    sourceId: String(input.sourceId || '').trim(),
    state,
    records: Object.freeze(records),
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    diagnostics: Object.freeze(Object.assign({}, input.diagnostics || {})),
    okCount: Number(input.okCount ?? records.length),
    failCount: Number(input.failCount ?? errors.length)
  });
}

export function makeUnavailableAdapterResult(adapterId, reason, extra = {}) {
  return makeAdapterResult({
    adapterId,
    state: AdapterResultState.unavailable,
    errors: [{ code: 'adapter.unavailable', message: String(reason || 'adapter unavailable') }],
    warnings: extra.warnings || [],
    diagnostics: Object.assign({ unavailable: true }, extra.diagnostics || {})
  });
}

export function adapterSupportsSourceKind(adapter, sourceKind) {
  return Boolean(adapter && Array.isArray(adapter.sourceKinds) && adapter.sourceKinds.includes(sourceKind));
}

function cleanId(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_.:-]+/g, '-').replace(/^-|-$/g, '');
}

function freezeList(value) {
  return Object.freeze((Array.isArray(value) ? value : []).map((item) => String(item || '').trim()).filter(Boolean));
}

function sourceConfigFromLegacyFields(input = {}) {
  const config = {};
  for (const key of ['repo', 'repository', 'ref', 'rootPath', 'path', 'url', 'remote']) {
    if (input[key] !== undefined && input[key] !== null && String(input[key]).trim()) config[key === 'repository' ? 'repo' : key] = input[key];
  }
  return config;
}

function stableSourceKey(input = {}) {
  return String(input.repo || input.repository || input.path || input.url || input.label || 'source')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:/-]+/g, '-')
    .replace(/^[:/-]+|[:/-]+$/g, '') || 'source';
}
