export const DISCOVERY_INITIAL_RECORD_WINDOW = 60;
export const DISCOVERY_RECORD_WINDOW_STEP = 40;
export const DISCOVERY_MOBILE_INITIAL_RECORD_WINDOW = 30;
export const DISCOVERY_MOBILE_RECORD_WINDOW_STEP = 24;
export const DISCOVERY_DESKTOP_ESTIMATED_CARD_HEIGHT = 126;
export const DISCOVERY_MOBILE_ESTIMATED_CARD_HEIGHT = 154;
export const DISCOVERY_SCROLL_RESTORE_OVERSCAN_PX = 900;

export function discoveryRenderWindowProfile(viewport = {}) {
  const width = Number(viewport.width || 0);
  const coarse = viewport.coarse === true;
  const mobile = coarse || (width > 0 && width <= 540);
  return Object.freeze({
    mobile,
    initial: mobile ? DISCOVERY_MOBILE_INITIAL_RECORD_WINDOW : DISCOVERY_INITIAL_RECORD_WINDOW,
    step: mobile ? DISCOVERY_MOBILE_RECORD_WINDOW_STEP : DISCOVERY_RECORD_WINDOW_STEP,
    estimatedCardHeight: mobile ? DISCOVERY_MOBILE_ESTIMATED_CARD_HEIGHT : DISCOVERY_DESKTOP_ESTIMATED_CARD_HEIGHT,
    restoreOverscanPx: DISCOVERY_SCROLL_RESTORE_OVERSCAN_PX
  });
}

export function discoveryInitialRecordWindowLimitForScroll(scrollTop = 0, viewport = {}, profile = discoveryRenderWindowProfile(viewport)) {
  const initial = Math.max(1, Number(profile.initial || DISCOVERY_INITIAL_RECORD_WINDOW));
  const top = Math.max(0, Number(scrollTop || 0));
  if (!Number.isFinite(top) || top <= 0) return initial;
  const viewportHeight = Math.max(0, Number(viewport.height || 0));
  const estimate = Math.max(72, Number(profile.estimatedCardHeight || DISCOVERY_DESKTOP_ESTIMATED_CARD_HEIGHT));
  const overscan = Math.max(0, Number(profile.restoreOverscanPx || DISCOVERY_SCROLL_RESTORE_OVERSCAN_PX));
  const needed = Math.ceil((top + viewportHeight + overscan) / estimate);
  return Math.max(initial, needed);
}

export function discoveryRecordWindowKey(records = [], workspaceCandidates = [], assets = []) {
  const first = records[0]?.id || records[0]?.path || '';
  const last = records[records.length - 1]?.id || records[records.length - 1]?.path || '';
  const firstCandidate = workspaceCandidates[0]?.id || workspaceCandidates[0]?.path || '';
  const firstAsset = assets[0]?.id || assets[0]?.path || '';
  return `${records.length}:${first}:${last}:${workspaceCandidates.length}:${firstCandidate}:${assets.length}:${firstAsset}`;
}

export function discoveryWindowState(records = [], requestedLimit = 0, profile = discoveryRenderWindowProfile()) {
  const source = Array.isArray(records) ? records : [];
  const total = source.length;
  const initial = Math.max(1, Number(profile.initial || DISCOVERY_INITIAL_RECORD_WINDOW));
  const requested = Math.max(initial, Number(requestedLimit || initial));
  const limit = total > initial ? Math.min(total, requested) : total;
  const visibleRecords = limit < total ? source.slice(0, limit) : source;
  return Object.freeze({
    total,
    visibleRecords,
    visibleCount: visibleRecords.length,
    remaining: Math.max(0, total - visibleRecords.length),
    partial: visibleRecords.length < total,
    initial,
    step: Math.max(1, Number(profile.step || DISCOVERY_RECORD_WINDOW_STEP))
  });
}
