import { DurableLocalAuthority, TIINEX_HISTORY_AUTHORITY_KEY, TIINEX_HISTORY_AUTHORITY_SCHEMA } from './persistenceOwnership.js';

export { TIINEX_HISTORY_AUTHORITY_KEY, TIINEX_HISTORY_AUTHORITY_SCHEMA };

export function durableLocalAuthorityFromHistoryState(historyState = null) {
  const metadata = historyState && typeof historyState === 'object' ? historyState[TIINEX_HISTORY_AUTHORITY_KEY] : null;
  return metadata?.schema === TIINEX_HISTORY_AUTHORITY_SCHEMA && metadata?.durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery
    ? DurableLocalAuthority.isolatedPreexistingRecovery
    : DurableLocalAuthority.normal;
}

export function durableLocalAuthorityForRoute(routeKind = '', historyState = null) {
  if (String(routeKind || '') === 'public-target') return DurableLocalAuthority.isolatedPreexistingRecovery;
  if (String(routeKind || '') === 'semantic-state') return durableLocalAuthorityFromHistoryState(historyState);
  return DurableLocalAuthority.normal;
}

export function historyStatePatchForDurableLocalAuthority(authority = DurableLocalAuthority.normal) {
  return {
    [TIINEX_HISTORY_AUTHORITY_KEY]: authority === DurableLocalAuthority.isolatedPreexistingRecovery
      ? Object.freeze({ schema: TIINEX_HISTORY_AUTHORITY_SCHEMA, durableLocalAuthority: DurableLocalAuthority.isolatedPreexistingRecovery })
      : null
  };
}

export function composeHistoryState(baseState = null, patch = {}) {
  const out = baseState && typeof baseState === 'object' && !Array.isArray(baseState) ? Object.assign({}, baseState) : {};
  for (const [key, value] of Object.entries(patch || {})) {
    if (value == null) delete out[key];
    else out[key] = value;
  }
  return out;
}

export function markCurrentHistoryDurableAuthority(historyLike = null, locationLike = null, authority = DurableLocalAuthority.normal) {
  if (!historyLike?.replaceState) return null;
  const nextState = composeHistoryState(historyLike.state, historyStatePatchForDurableLocalAuthority(authority));
  const href = currentRelativeUrl(locationLike);
  try {
    historyLike.replaceState(nextState, '', href || undefined);
    return nextState;
  } catch (_) {
    return null;
  }
}

function currentRelativeUrl(locationLike = null) {
  if (!locationLike) return '';
  const pathname = String(locationLike.pathname || '');
  const search = String(locationLike.search || '');
  const hash = String(locationLike.hash || '');
  return `${pathname}${search}${hash}`;
}
