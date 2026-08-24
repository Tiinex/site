import { packageFileBytes } from '../../../../export/package.bytes.js';
export function normalizeAdditionalWorkspaceDescriptors(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((entry) => typeof entry === 'string' ? parseWorkspaceDescriptorString(entry) : Object.freeze({ ...(entry || {}) }));
  if (typeof value === 'string') return value.split(',').map((entry) => entry.trim()).filter(Boolean).map(parseWorkspaceDescriptorString);
  if (typeof value === 'object') return Object.entries(value).map(([id, descriptor]) => typeof descriptor === 'string' ? Object.freeze({ id, root: descriptor }) : Object.freeze({ id, ...(descriptor || {}) }));
  return [];
}

export function normalizeTransportRoute(route, defaultWorkspaceId = '') {
  if (typeof route === 'string') {
    const pathValue = normalizeRelativePath(route);
    return pathValue ? pathValue : null;
  }
  const pathValue = normalizeRelativePath(route?.path || route?.workspaceRelativePath || '');
  if (!pathValue) return null;
  const workspaceId = String(route?.workspaceId || route?.workspace || '').trim();
  if (!workspaceId) throw new Error('portable.handoff-manufacture.route.workspace-id.required');
  return Object.freeze({ ...route, workspaceId, path: pathValue });
}

export function safeWorkspaceToken(value = '') {
  return String(value || '').trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'workspace';
}

export function serializableMetadata(value = {}) {
  const out = {};
  for (const [key, item] of Object.entries(value || {})) if (typeof item !== 'function' && typeof item !== 'undefined') out[key] = item;
  return out;
}


export function inferWorkspaceTitle(enumeration = {}) {
  const entry = (enumeration.materialization?.entries || []).find((item) => normalizeRelativePath(item.path) === 'package.json');
  if (!entry) return '';
  try { return String(JSON.parse(new TextDecoder().decode(packageFileBytes(entry))).name || '').trim(); }
  catch { return ''; }
}
function parseWorkspaceDescriptorString(value = '') {
  const text = String(value || '').trim();
  const separator = text.indexOf('=');
  if (separator <= 0) throw new Error('portable.handoff-manufacture.additional-workspace.descriptor.invalid');
  return Object.freeze({ id: text.slice(0, separator).trim(), root: text.slice(separator + 1).trim() });
}
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
