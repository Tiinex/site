export const NON_EXECUTION_MODES = new Set(['review', 'explanation', 'design-discussion', 'orientation', 'collaborative-dialogue']);
export const READY_OPERATION_STATES = new Set(['ready', 'qualified', 'valid', 'accepted', 'passed', 'completed', 'degraded']);
export function normalizeAttribution(value) {
  const normalized = normalizeToken(value);
  if (['verified', 'declared', 'unverified', 'unknown'].includes(normalized)) return normalized;
  return normalized ? 'unverified' : 'unknown';
}
export function normalizeInteractionMode(value) {
  const normalized = normalizeToken(value).replace(/_/g, '-');
  if (!normalized) return '';
  const aliases = { design: 'design-discussion', discussion: 'collaborative-dialogue', explain: 'explanation', review: 'review', execute: 'execution' };
  return aliases[normalized] || normalized;
}
export function sectionText(markdown = '', heading = '') {
  const escaped = escapeRegExp(heading);
  const match = new RegExp(`^##\\s+${escaped}\\s*$`, 'mi').exec(String(markdown || ''));
  if (!match) return '';
  const rest = String(markdown).slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}
export function sectionField(section = '', name = '') {
  const escaped = escapeRegExp(name);
  const match = String(section || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  return stripMarkdown(String(match?.[1] || '').trim());
}
export function sectionReferenceTarget(section = '', name = '') {
  const escaped = escapeRegExp(name);
  const match = String(section || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+?)\\s*$`, 'mi'));
  const raw = String(match?.[1] || '').trim();
  const link = raw.match(/^\[[^\]]+\]\(([^)\s]+)\)$/);
  return String(link?.[1] || raw).trim();
}
export function stripMarkdown(value = '') {
  const text = String(value || '').trim();
  const link = text.match(/^\[([^\]]+)\]\([^)]+\)$/);
  if (link) return link[1].trim();
  return text.replace(/^`(.+)`$/, '$1').replace(/^\*\*(.+)\*\*$/, '$1').trim();
}
export function normalizeSemanticClass(value) {
  const normalized = normalizeToken(value).replace(/_/g, '-');
  if (['bootstrap', 'host-bootstrap', 'minimal-ingress', 'minimal-bootstrap'].includes(normalized)) return 'minimal-bootstrap';
  if (['substantive', 'reasoning', 'work', 'substantive-work'].includes(normalized)) return 'substantive-work';
  if (['fallback', 'degraded-fallback'].includes(normalized)) return 'fallback';
  if (['native-read', 'artifact-read', 'filesystem-read', 'archive-read'].includes(normalized)) return 'native-read';
  return normalized || 'native-action';
}
export function normalizeComparable(value) { return stripMarkdown(value).toLowerCase().replace(/\s+/g, ' ').trim(); }
export function normalizeToken(value) { return String(value || '').trim().toLowerCase(); }
export function normalizePath(value) { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
export function normalizeStringList(value) { const list = Array.isArray(value) ? value : value ? [value] : []; return [...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))]; }
export function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
export function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
export function finiteOrNull(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
export function parseTime(value) { const ms = Date.parse(String(value || '')); return Number.isFinite(ms) ? ms : null; }
export function escapeRegExp(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
