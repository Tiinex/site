import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

export const RECIPIENT_V2_READ_PATH = '001-1-READ-BEFORE-PROCEEDING.trace.md';
const RECIPIENT_V2_BASE_FORMAT_ID = 'tiinex-recipient-facing-handoff-v2-flat';
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID = `${RECIPIENT_V2_BASE_FORMAT_ID}-artifact-first-phase1`;
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID = 'tiinex.portable.handoff-recipient-v2-artifact-first-phase1.v1';
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID = `${RECIPIENT_V2_BASE_FORMAT_ID}-artifact-first-clean-phase2`;
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_SCHEMA_ID = 'tiinex.portable.handoff-recipient-v2-artifact-first-clean-phase2.v1';
export const PHASE2_CLEAN_PROFILE = 'artifact-first-clean-carrier-phase2';
export const PHASE2_COMPATIBILITY_TRANSPORT = 'omitted-derived-non-authoritative';
export const PHASE1_BOOTSTRAP_ROLE = 'portable Tooling bootstrap runtime for recipient orientation and verification';
export const PHASE1_CACHE_ROLE = 'workspace-scoped Handoff dependency cache';

export function normalizeRoutePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }

export function normalizePhase1Token(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ''); }

export function cacheMaterialBelongsToRoute(material = {}, workspaceId = '', routePath = '') {
  return String(material.routeWorkspaceId || '') === String(workspaceId || '') && normalizeRoutePath(material.routePath || '') === normalizeRoutePath(routePath || '');
}

export function selectOne(items = [], selector = '', label = 'item', findings = [], selectorFn = (item) => String(item.workspaceId || '')) { const candidates = selector ? items.filter((item) => selectorFn(item) === String(selector)) : items; if (candidates.length !== 1) { findings.push(finding('error', `portable.handoff-v2-phase1.${label}.selection`, `Phase 1 specimen requires exactly one selected ${label}.`, { selector: String(selector || ''), count: candidates.length })); return null; } return candidates[0]; }

export function oneFile(files = [], path = '') { const matches = files.filter((file) => String(file.path || '') === String(path || '')); return matches.length === 1 ? matches[0] : null; }

export function repathFinalizedFile(file = {}, path = '', overrides = {}) { return finalizeFile({ ...overrides, path, requestedPath: path, data: packageFileByteView(file) }); }

export function currentSchemaId(markdown = '') { return String(String(markdown || '').match(/Current Schema:\s*(?:\[)?(tiinex\.[a-z0-9._-]+)(?:\])?/i)?.[1] || '').toLowerCase(); }

export function sectionText(markdown = '', heading = '') { const re = new RegExp(`^##\\s+${escapeRe(heading)}\\s*$`, 'mi'); const match = re.exec(String(markdown || '')); if (!match) return ''; const rest = String(markdown || '').slice(match.index + match[0].length); const next = /^##\s+/m.exec(rest); return (next ? rest.slice(0, next.index) : rest).trim(); }

export function fieldValue(section = '', name = '') { const m = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRe(name)}:\\s*(.+?)\\s*$`, 'mi')); return String(m?.[1] || '').trim(); }

export function markdownTarget(value = '') { return String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || String(value || '').trim(); }

export function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }

export function phase1RouteToken(route = {}) {
  const workspaceId = String(route.workspaceId || 'workspace');
  const routePath = String(route.workspaceRelativePath || 'route');
  const routeId = String(route.id || '');
  const human = safeToken(`${workspaceId}-${routePath}`).slice(0, 42) || 'route';
  return `${human}-${sha256Hex(utf8Bytes(`${workspaceId}\0${routePath}\0${routeId}`)).slice(0, 12)}`;
}

export function phase1RoutePointerPath(route = {}, index = 0, count = 1, selectedRouteId = '') {
  if (String(route.id || '') === String(selectedRouteId || '') || count <= 1) return '001-4-handoff-pointer.trace.md';
  return `001-4-${index + 1}-${phase1RouteToken(route)}-handoff-pointer.trace.md`;
}

export function phase1RolePathPrefix(route = {}, index = 0, count = 1, selectedRouteId = '') {
  if (String(route.id || '') === String(selectedRouteId || '') || count <= 1) return '001-6';
  return `001-6-${index + 1}-${phase1RouteToken(route)}`;
}

export function artifactFirstCarrierFilename(workspaceId = '', dimension = '', from = '', to = '') {
  const workspace = safeToken(workspaceId);
  const dimensionToken = String(dimension || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const fromToken = String(from || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const toToken = String(to || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return workspace && dimensionToken && fromToken && toToken ? `${workspace}-${dimensionToken}-${fromToken}-to-${toToken}.handoff-package.zip` : '';
}

export function safeToken(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace'; }

export function stableJson(value) { return JSON.stringify(sortJson(value)); }

export function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }

export function blocked(reason, findings = []) { return deepFreeze({ schema: RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID, status: 'blocked', files: Object.freeze([]), topology: deepFreeze({ root: null, read: null, workspaces: [], caches: [], participantRoles: [], routes: [], bootstrap: null }), findings: Object.freeze([finding('error', `portable.handoff-v2-phase1.${reason}`, 'Artifact-first Phase 1 specimen could not be built.'), ...findings]) }); }

export function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }

export function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer || value instanceof Map) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }

export function sortedQualifiedCarrierRoutes(routes = [], selectedRouteId = '') {
  return [...routes].filter((item) => String(item.state || '') === 'qualified').sort((a, b) => {
    const aid = String(a.id || '');
    const bid = String(b.id || '');
    if (aid === selectedRouteId && bid !== selectedRouteId) return -1;
    if (bid === selectedRouteId && aid !== selectedRouteId) return 1;
    return `${String(a.workspaceId || '')}:${normalizeRoutePath(a.workspaceRelativePath || '')}`.localeCompare(`${String(b.workspaceId || '')}:${normalizeRoutePath(b.workspaceRelativePath || '')}`);
  });
}
