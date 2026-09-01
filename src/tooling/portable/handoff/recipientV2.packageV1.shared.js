import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView } from '../../../export/package.bytes.js';
import { finding } from './recipientV2.topology.materials.js';

export function exactFile(path, data, logicalKind, mediaType) {
  return finalizeFile({ path, requestedPath: path, kind: logicalKind, logicalKind, mediaType, data: packageFileByteView({ data }) });
}
export function workspaceSchemaTarget(qualification = {}) {
  return String(qualification?.schemaTarget || '') || 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/workspace/tiinex.workspace.v1.schema.md';
}
export function oneFile(index, path) { const list = index.get(String(path || '')) || []; return list.length === 1 ? list[0] : null; }
export function validCarrierDimension(value = '') { return /^\d{3}(?:-(?:[1-9]\d*))*$/.test(String(value || '')); }
export function numericDimension(path = '') { return String(path || '').match(/^(\d{3}(?:-[1-9]\d*)*)-/)?.[1] || ''; }
export function currentSchemaId(markdown = '') { return String(markdown || '').match(/^\s*-\s+Current Schema:\s*(?:\[)?(tiinex\.[A-Za-z0-9._-]+)(?:\])?/mi)?.[1] || ''; }
export function sectionText(markdown = '', title = '') { const source = String(markdown || ''); const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const match = source.match(new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|^#\\s+Continuity Integrity\\s*$|\\Z)`, 'mi')); return match ? match[1] : ''; }
export function field(section = '', label = '') { const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return String(section || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.*?)\\s*$`, 'mi'))?.[1]?.trim() || ''; }
export function markdownTarget(value = '') { const match = String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/); return match ? match[1].trim() : ''; }
export function unquote(value = '') { const text = String(value || '').trim(); return text.startsWith('`') && text.endsWith('`') ? text.slice(1, -1) : text; }
export function byteEqual(a, b) { if (a.byteLength !== b.byteLength) return false; for (let i = 0; i < a.byteLength; i += 1) if (a[i] !== b[i]) return false; return true; }
export function normalizeCreatedAt(value = '') { const text = String(value || '').trim(); if (!text) return '1970-01-01 00:00:00'; return text.replace('T', ' ').replace(/\.\d{3}Z$/, '').replace(/Z$/, '').slice(0, 19); }
export function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
export function dedupeFindings(items = []) { const map = new Map(); for (const item of items) { const key = `${item.severity || ''}:${item.code || ''}:${item.workspaceId || ''}:${item.path || ''}:${item.pointer || ''}:${item.rolePointer || ''}`; if (!map.has(key)) map.set(key, item); } return [...map.values()]; }
export function blocked(reason, findings = []) { return Object.freeze({ status: 'blocked', files: Object.freeze([]), topology: Object.freeze({}), inspection: null, findings: Object.freeze([...(findings || []), finding('error', `portable.handoff-package-v1.${reason}`, 'Recipient-facing package-v1 construction failed closed.')]), boundary: 'Package-v1 construction failed closed before exposing a recipient carrier.' }); }
export function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
