export const PLAYTHINGS_PROFILE_SCHEMA = 'tiinex.playthings.local-profile.experimental.v1';
export const PLAYTHINGS_PROFILE_STORAGE_KEY = 'tiinex.playthings.profile.experimental.v1';
export const PLAYTHINGS_HOTBAR_SLOTS = 6;

export function emptyPlaythingsProfile() {
  return Object.freeze({
    schema: PLAYTHINGS_PROFILE_SCHEMA,
    inspectedSchemaIds: Object.freeze([]),
    upgradedSchemaIds: Object.freeze([]),
    hotbar: Object.freeze(Array(PLAYTHINGS_HOTBAR_SLOTS).fill('')),
    followPlaything: false
  });
}

export function readPlaythingsProfile(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) return emptyPlaythingsProfile();
  try { return normalizePlaythingsProfile(JSON.parse(storage.getItem(PLAYTHINGS_PROFILE_STORAGE_KEY) || 'null')); }
  catch (_) { return emptyPlaythingsProfile(); }
}

export function writePlaythingsProfile(profile, storage = typeof window !== 'undefined' ? window.localStorage : null) {
  const normalized = normalizePlaythingsProfile(profile);
  if (storage) {
    try { storage.setItem(PLAYTHINGS_PROFILE_STORAGE_KEY, JSON.stringify(normalized)); }
    catch (_) { /* UI cache only; failure must not affect Tiinex truth. */ }
  }
  return normalized;
}

export function inspectPlaythingsSchema(profile, schemaId) {
  const current = normalizePlaythingsProfile(profile);
  return normalizePlaythingsProfile({ ...current, inspectedSchemaIds: appendUnique(current.inspectedSchemaIds, schemaId) });
}

export function upgradePlaythingsSchema(profile, schemaId) {
  const current = normalizePlaythingsProfile(profile);
  return normalizePlaythingsProfile({ ...current, upgradedSchemaIds: appendUnique(current.upgradedSchemaIds, schemaId) });
}

export function assignPlaythingsHotbarSkill(profile, slot, schemaId) {
  const current = normalizePlaythingsProfile(profile);
  const index = clampSlot(slot);
  const next = [...current.hotbar];
  const clean = String(schemaId || '').trim();
  for (let i = 0; i < next.length; i += 1) if (next[i] === clean) next[i] = '';
  next[index] = clean;
  return normalizePlaythingsProfile({ ...current, hotbar: next });
}

export function clearPlaythingsHotbarSlot(profile, slot) {
  return assignPlaythingsHotbarSkill(profile, slot, '');
}

export function setPlaythingsFollow(profile, followPlaything) {
  return normalizePlaythingsProfile({ ...normalizePlaythingsProfile(profile), followPlaything: Boolean(followPlaything) });
}

export function normalizePlaythingsProfile(value = {}) {
  const inspectedSchemaIds = uniqueStrings(value?.inspectedSchemaIds);
  const upgradedSchemaIds = uniqueStrings(value?.upgradedSchemaIds);
  const hotbar = Array.from({ length: PLAYTHINGS_HOTBAR_SLOTS }, (_, index) => String(value?.hotbar?.[index] || '').trim());
  return Object.freeze({ schema: PLAYTHINGS_PROFILE_SCHEMA, inspectedSchemaIds: Object.freeze(inspectedSchemaIds), upgradedSchemaIds: Object.freeze(upgradedSchemaIds), hotbar: Object.freeze(hotbar), followPlaything: Boolean(value?.followPlaything) });
}

function appendUnique(values, value) { const clean = String(value || '').trim(); return clean && !values.includes(clean) ? [...values, clean] : values; }
function uniqueStrings(values) { return Array.from(new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim()).filter(Boolean))).sort(); }
function clampSlot(value) { return Math.max(0, Math.min(PLAYTHINGS_HOTBAR_SLOTS - 1, Math.floor(Number(value || 0)))); }
