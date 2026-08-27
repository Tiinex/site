import projection from './bootstrap/qualified-local-root/tiinex.root.v1.runtime-projection.json' with { type: 'json' };

export const PORTABLE_QUALIFIED_LOCAL_ROOT_RUNTIME_PROJECTION_SCHEMA_ID = 'tiinex.portable.qualified-local-root-runtime-projection.v1';

export function qualifiedLocalRootRuntimeProjection() {
  return deepFreeze(clone(projection));
}

export function projectPortableValidationContractWithQualifiedLocalRoot(baseContract = null) {
  if (!baseContract || typeof baseContract !== 'object') return unavailable('base-validation-contract-unavailable');
  const lineage = Array.isArray(baseContract.lineage) ? baseContract.lineage.map(String) : [];
  if (!lineage.includes('tiinex.root.v1')) return unavailable('root-not-in-validation-lineage');
  if (projection?.lineageQualification?.state !== 'valid' || projection?.lineageQualification?.complete !== true) return unavailable('local-root-lineage-unqualified');

  const requirements = Array.isArray(baseContract?.validation?.conditionalRequirements)
    ? baseContract.validation.conditionalRequirements
    : [];
  const matchingIndexes = requirements
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => String(entry?.name || '') === 'Parent Origin' && normalizeList(entry?.requiredWhen).includes('Parent exists'))
    .map(({ index }) => index);
  if (matchingIndexes.length !== 1) return unavailable('parent-origin-contract-cardinality-unqualified', { observedMatches: matchingIndexes.length });

  const replacement = clone(projection.parentOrigin);
  const conditionalRequirements = requirements.map((entry, index) => index === matchingIndexes[0] ? replacement : clone(entry));
  const compiledContract = {
    ...clone(baseContract),
    validation: {
      ...clone(baseContract.validation || {}),
      conditionalRequirements
    },
    portableRuntimeProjection: {
      schema: PORTABLE_QUALIFIED_LOCAL_ROOT_RUNTIME_PROJECTION_SCHEMA_ID,
      state: 'qualified-local',
      schemaId: String(projection.schemaId || 'tiinex.root.v1'),
      authority: clone(projection.authority || {}),
      source: clone(projection.source || {}),
      boundary: String(projection?.authority?.boundary || '')
    }
  };
  return deepFreeze({
    state: 'qualified',
    reason: '',
    compiledContract,
    projection: clone(projection)
  });
}

function unavailable(reason, extra = {}) {
  return deepFreeze({ state: 'unavailable', reason: String(reason || 'unavailable'), compiledContract: null, projection: clone(projection), ...extra });
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean) : [];
}

function clone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(clone);
  const result = {};
  for (const [key, child] of Object.entries(value)) result[key] = clone(child);
  return result;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
