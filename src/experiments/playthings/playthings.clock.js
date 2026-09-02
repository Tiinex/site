export const PLAYTHINGS_IDLE_LONG_AFTER_DAYS = 4;
export const PLAYTHINGS_IDLE_REST_AFTER_DAYS = 7;

export function playthingsPlayheadTime({ phase = 'paused', atNow = false, currentEvent = null, nowMs = Date.now() } = {}) {
  if (phase === 'settled' && atNow) return Object.freeze({ mode: 'live', label: 'Live', ms: Number(nowMs), at: new Date(Number(nowMs)).toISOString() });
  const raw = String(currentEvent?.at || '').trim();
  const parsed = parsePlaythingsTime(raw);
  return Object.freeze({ mode: 'historical', label: raw || 'Origin', ms: parsed, at: raw });
}

export function playthingsLeafIdleState(createdAt = '', playheadMs = NaN) {
  const born = parsePlaythingsTime(createdAt);
  if (!Number.isFinite(born) || !Number.isFinite(playheadMs) || playheadMs < born) return Object.freeze({ state: 'normal', days: 0 });
  const days = Math.max(0, (playheadMs - born) / 86400000);
  if (days > PLAYTHINGS_IDLE_REST_AFTER_DAYS) return Object.freeze({ state: 'resting', days });
  if (days >= PLAYTHINGS_IDLE_LONG_AFTER_DAYS) return Object.freeze({ state: 'long-idle', days });
  return Object.freeze({ state: 'normal', days });
}

export function parsePlaythingsTime(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return NaN;
  const normalized = raw.includes('T') ? raw : `${raw.replace(' ', 'T')}Z`;
  const stamp = Date.parse(normalized);
  return Number.isFinite(stamp) ? stamp : NaN;
}
