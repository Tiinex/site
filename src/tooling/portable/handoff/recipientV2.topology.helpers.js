import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

export function recipientPackageRootPath(workspaces = []) {
  if (workspaces.length === 1) return `001-${safeToken(workspaces[0].workspaceId || 'tiinex')}-handoff-package.trace.md`;
  return '001-tiinex-handoff-package.trace.md';
}

export function recipientEntriesFingerprint(entries = []) {
  const identities = entries.map((entry) => ({ path: String(entry.path || ''), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || '') })).sort((a, b) => a.path.localeCompare(b.path));
  return sha256Hex(utf8Bytes(JSON.stringify(sortJson(identities))));
}

function safeToken(value = '') {
  return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'workspace';
}
function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}
