export const TRANSPORT_LEVELS_SCHEMA_ID = 'tiinex.transport.levels.v1';
export const TRANSPORT_PLAN_SCHEMA_ID = 'tiinex.transport.operationPlan.v1';

export const TransportLevel = Object.freeze({
  TL0: 'TL0',
  TL1: 'TL1',
  TL2: 'TL2',
  TL3: 'TL3',
  TL4: 'TL4'
});

const LEVEL_ORDER = Object.freeze([TransportLevel.TL0, TransportLevel.TL1, TransportLevel.TL2, TransportLevel.TL3, TransportLevel.TL4]);
const OPERATION_ALIASES = Object.freeze({
  readKnown: 'read-known',
  listScope: 'list-scope',
  readHistory: 'read-history',
  localDownload: 'local-download',
  localImport: 'local-import',
  write: 'write',
  verify: 'verify',
  sync: 'sync'
});

export function normalizeTransportLevel(value = '') {
  const text = String(value || '').trim().toUpperCase();
  return LEVEL_ORDER.includes(text) ? text : '';
}

export function transportLevelRank(level = '') {
  const normalized = normalizeTransportLevel(level);
  return normalized ? LEVEL_ORDER.indexOf(normalized) : -1;
}

export function transportLevelsAtOrBelow(level = '') {
  const rank = transportLevelRank(level);
  if (rank < 0) return Object.freeze([]);
  return Object.freeze(LEVEL_ORDER.slice(0, rank + 1));
}

export function normalizeTransportOperation(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return OPERATION_ALIASES[raw] || raw.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`).replace(/^-/, '').toLowerCase();
}

export function resolveTransportPlan(sourceConfig = {}, operation = '', input = {}) {
  const op = normalizeTransportOperation(operation || input.operation || 'read-known');
  const configured = configuredLevelForOperation(sourceConfig, op) || normalizeTransportLevel(input.defaultLevel || TransportLevel.TL0) || TransportLevel.TL0;
  const requested = normalizeTransportLevel(input.requestedLevel || configured) || configured;
  const maxRank = transportLevelRank(configured);
  const requestedRank = transportLevelRank(requested);
  const selected = requestedRank >= 0 && requestedRank <= maxRank ? requested : configured;
  const fallbackLevels = input.allowFallback === false ? Object.freeze([]) : transportLevelsAtOrBelow(selected).filter((level) => level !== selected).reverse();
  const credentialMaterialIncluded = hasCredentialMaterial(sourceConfig);
  const authRequired = transportLevelRank(selected) >= transportLevelRank(TransportLevel.TL3) || Boolean(sourceConfig.authRequired || input.authRequired);
  return deepFreeze({
    schema: TRANSPORT_PLAN_SCHEMA_ID,
    operation: op,
    selectedLevel: selected,
    configuredLevel: configured,
    fallbackLevels,
    authRequired,
    authProvider: String(sourceConfig.authProvider || input.authProvider || '').trim(),
    credentialMaterialIncluded,
    status: credentialMaterialIncluded ? 'blocked' : 'ready',
    boundary: 'Transport plan describes allowed movement for one operation. It must not infer provenance, mutate sources, or include user secrets in artifacts, source config, or export packages.'
  });
}

function configuredLevelForOperation(sourceConfig = {}, operation = '') {
  const candidates = [
    sourceConfig.transportLevels?.[operation],
    sourceConfig.transportLevels?.[operation.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())],
    sourceConfig.operations?.[operation]?.transportLevel,
    sourceConfig.capabilities?.[operation]?.transportLevel,
    sourceConfig.transportLevel,
    sourceConfig.configuredTransportLevel
  ];
  for (const candidate of candidates) {
    const normalized = normalizeTransportLevel(candidate);
    if (normalized) return normalized;
  }
  return '';
}

function hasCredentialMaterial(value = {}) {
  const secretKeys = /(?:token|password|passwd|secret|api[_-]?key|refresh[_-]?token|access[_-]?token|client[_-]?secret)/i;
  const stack = [value];
  const seen = new Set();
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object' || seen.has(item)) continue;
    seen.add(item);
    for (const [key, child] of Object.entries(item)) {
      if (secretKeys.test(key) && child != null && String(child).trim()) return true;
      if (child && typeof child === 'object') stack.push(child);
    }
  }
  return false;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
