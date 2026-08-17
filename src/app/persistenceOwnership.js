export const PersistenceRouteOwner = Object.freeze({
  semanticState: 'semantic-state',
  publicTarget: 'public-target',
  clean: 'clean'
});

export const TIINEX_HISTORY_AUTHORITY_KEY = '__tiinexPersistenceAuthority';
export const TIINEX_HISTORY_AUTHORITY_SCHEMA = 'tiinex.history.persistenceAuthority.v1';

export const DurableLocalAuthority = Object.freeze({
  normal: 'normal',
  isolatedPreexistingRecovery: 'isolated-preexisting-recovery'
});

export function createPersistenceOwnershipPolicy(initialRouteKind = PersistenceRouteOwner.clean, options = {}) {
  let routeKind = normalizeRouteKind(initialRouteKind);
  let durableLocalAuthority = normalizeDurableLocalAuthority(
    options.durableLocalAuthority,
    routeKind === PersistenceRouteOwner.publicTarget ? DurableLocalAuthority.isolatedPreexistingRecovery : DurableLocalAuthority.normal
  );

  function setRouteKind(nextKind = PersistenceRouteOwner.clean) {
    routeKind = normalizeRouteKind(nextKind);
    return routeKind;
  }

  function setDurableLocalAuthority(nextAuthority = DurableLocalAuthority.normal) {
    durableLocalAuthority = normalizeDurableLocalAuthority(nextAuthority);
    return durableLocalAuthority;
  }

  function restoreHistoryEntry({ routeKind: nextRouteKind = PersistenceRouteOwner.clean, durableLocalAuthority: nextDurableAuthority = DurableLocalAuthority.normal } = {}) {
    routeKind = normalizeRouteKind(nextRouteKind);
    durableLocalAuthority = normalizeDurableLocalAuthority(nextDurableAuthority, routeKind === PersistenceRouteOwner.publicTarget ? DurableLocalAuthority.isolatedPreexistingRecovery : DurableLocalAuthority.normal);
    return report();
  }

  function beginSemanticNavigation(requestedMode = 'push') {
    const firstExitFromPublicTarget = routeKind === PersistenceRouteOwner.publicTarget;
    routeKind = PersistenceRouteOwner.semanticState;
    return Object.freeze({
      firstExitFromPublicTarget,
      mode: firstExitFromPublicTarget ? 'push' : normalizeWriteMode(requestedMode),
      routeKind,
      durableLocalAuthority
    });
  }

  function writePolicy() {
    const out = { routeKind, durableLocalAuthority };
    if (routeKind === PersistenceRouteOwner.publicTarget) out.preserveUrl = true;
    if (durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery) out.durableLocalPolicy = 'preserve-existing';
    out.historyStatePatch = historyStatePatch(durableLocalAuthority);
    return Object.freeze(out);
  }

  function report() { return Object.freeze({ routeKind, durableLocalAuthority }); }

  return Object.freeze({ setRouteKind, setDurableLocalAuthority, restoreHistoryEntry, beginSemanticNavigation, writePolicy, report });
}

export function persistenceWriteEnvForOwnership(ownership = null, base = {}) {
  const policy = ownership?.writePolicy?.() || {};
  return Object.assign({}, base || {}, policy);
}

export function isolatedDurableLocalAuthority(ownership = null) {
  return ownership?.report?.().durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery;
}

function historyStatePatch(durableLocalAuthority) {
  return {
    [TIINEX_HISTORY_AUTHORITY_KEY]: durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery
      ? Object.freeze({ schema: TIINEX_HISTORY_AUTHORITY_SCHEMA, durableLocalAuthority: DurableLocalAuthority.isolatedPreexistingRecovery })
      : null
  };
}

function normalizeRouteKind(value = '') {
  const kind = String(value || '').trim();
  if (kind === PersistenceRouteOwner.semanticState || kind === PersistenceRouteOwner.publicTarget) return kind;
  return PersistenceRouteOwner.clean;
}

function normalizeDurableLocalAuthority(value = '', fallback = DurableLocalAuthority.normal) {
  const authority = String(value || '').trim();
  if (authority === DurableLocalAuthority.isolatedPreexistingRecovery) return authority;
  if (authority === DurableLocalAuthority.normal) return authority;
  return fallback;
}

function normalizeWriteMode(value = '') { return value === 'push' ? 'push' : 'replace'; }
