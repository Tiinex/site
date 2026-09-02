const PREFIX = 'tiinex.playthings.observation.v1:';

export function playthingsObservationScope(model = {}) {
  const verses = (model.verses || []).map((verse) => verse.id).sort();
  return `${PREFIX}${hashToken(verses.join('|') || 'empty')}`;
}

export function readPlaythingsObservation(model = {}, storage = browserStorage()) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(playthingsObservationScope(model));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.schema === 'tiinex.playthings.observation-cache.v1' ? parsed : null;
  } catch (_) { return null; }
}

export function writePlaythingsObservation(model = {}, observation = null, storage = browserStorage()) {
  if (!storage || !observation) return false;
  try {
    storage.setItem(playthingsObservationScope(model), JSON.stringify(observation));
    return true;
  } catch (_) { return false; }
}

function browserStorage() {
  if (typeof window === 'undefined') return null;
  try { return window.sessionStorage || null; }
  catch (_) { return null; }
}
function hashToken(value) {
  let hash = 2166136261;
  for (const char of String(value || '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}
