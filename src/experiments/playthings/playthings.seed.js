export const PLAYTHINGS_PRESENTATION_PALETTE = Object.freeze([
  '#d86f69',
  '#e0a85a',
  '#d3c85f',
  '#79b86f',
  '#62b6a7',
  '#6ea4d8',
  '#987fd1',
  '#c779b6'
]);

/**
 * Presentation-only deterministic entropy.
 *
 * Tiinex identity/integrity remains authority for Tiinex. Playthings only turns
 * a stable input string into reproducible visual variance; the resulting value
 * has no semantic meaning and is never written back into Tiinex material.
 */
export function playthingsSeedUnit(seed = '', purpose = 'default') {
  return hashInteger(`${purpose}\u0000${String(seed || '')}`) / 0x100000000;
}

export function playthingsSeedIndex(seed = '', purpose = 'default', count = 1) {
  const length = Math.max(1, Math.floor(Number(count || 1)));
  return Math.min(length - 1, Math.floor(playthingsSeedUnit(seed, purpose) * length));
}

export function playthingsSeedAngle(seed = '', purpose = 'direction') {
  return playthingsSeedUnit(seed, purpose) * Math.PI * 2;
}

export function playthingsShirtColor(seed = '') {
  return PLAYTHINGS_PRESENTATION_PALETTE[playthingsSeedIndex(seed, 'shirt', PLAYTHINGS_PRESENTATION_PALETTE.length)];
}

export function playthingsVariant(seed = '') {
  return playthingsSeedIndex(seed, 'body-variant', 4);
}

function hashInteger(value) {
  let hash = 2166136261;
  for (const char of String(value || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
