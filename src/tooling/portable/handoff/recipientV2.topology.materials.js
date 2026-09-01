import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';

export function bindingForWorkspace(descriptor = {}, workspaceId = '') { return (descriptor.workspaceArchiveBindings || []).find((binding) => String(binding.workspaceId || '') === String(workspaceId || '')) || null; }
export function routeClaimsDetachedMaterial(route = {}, material = {}) {
  const scopedWorkspace = String(material.routeWorkspaceId || '').trim();
  const scopedPath = normalizeWorkspacePath(material.routePath || '');
  if (scopedWorkspace && scopedPath) return scopedWorkspace === String(route.workspaceId || '') && scopedPath === normalizeWorkspacePath(route.workspaceRelativePath || '');
  const requirements = route.materialRequirements || {};
  const all = [...(requirements.required || []), ...(requirements.reference || []), ...(requirements.endpointRoles || []), ...(requirements.participantRoles || []), ...(requirements.dependencies || [])];
  return all.some((requirement) => String(requirement.id || '') === String(material.requirementId || '') || (material.referenceTarget && String(requirement.reference?.target || '') === String(material.referenceTarget || '')));
}

export function roleMaterialTarget(requirement = {}, descriptor = {}, workspaceById = new Map(), owningCache = null, route = {}) {
  const requirementId = String(requirement.id || '');
  const routeWorkspaceId = String(route.workspaceId || '');
  const routePath = normalizeWorkspacePath(route.workspaceRelativePath || '');
  const materialized = descriptor.materialized || [];
  const scoped = materialized.filter((item) => {
    const sourceRequirementId = String(item.sourceRequirementId || item.requirementId || '');
    if (sourceRequirementId !== requirementId) return false;
    const itemWorkspaceId = String(item.routeWorkspaceId || '');
    const itemRoutePath = normalizeWorkspacePath(item.routePath || '');
    return Boolean(itemWorkspaceId && itemRoutePath) && itemWorkspaceId === routeWorkspaceId && itemRoutePath === routePath;
  });
  const legacy = scoped.length ? [] : materialized.filter((item) => !item.routeWorkspaceId && !item.routePath && String(item.requirementId || '') === requirementId);
  const matches = scoped.length ? scoped : legacy;
  if (matches.length !== 1) return Object.freeze({ state: matches.length > 1 ? 'ambiguous' : 'unresolved', reason: matches.length > 1 ? 'material-ambiguous' : 'material-missing' });
  const material = matches[0];
  if (String(material.carrierKind || '') === 'workspace-archive-entry') {
    const targetWorkspace = workspaceById.get(String(material.workspaceId || ''));
    if (!targetWorkspace) return Object.freeze({ state: 'unresolved', reason: 'target-workspace-missing' });
    return Object.freeze({ state: 'qualified', carrierKind: 'workspace-archive-entry', targetWorkspaceId: String(material.workspaceId || ''), archivePath: targetWorkspace.archivePath, archiveSha256: targetWorkspace.archiveSha256, innerPath: String(material.workspaceRelativePath || ''), archiveEntry: '', bytes: Number(material.bytes || 0), sha256: String(material.sha256 || ''), referenceTarget: String(material.referenceTarget || requirement.reference?.target || '') });
  }
  if (!owningCache) return Object.freeze({ state: 'unresolved', reason: 'owning-cache-missing' });
  const cacheCandidates = (owningCache.materials || []).filter((item) => {
    const sourceRequirementId = String(item.sourceRequirementId || item.requirementId || '');
    if (sourceRequirementId !== requirementId) return false;
    const itemWorkspaceId = String(item.routeWorkspaceId || '');
    const itemRoutePath = normalizeWorkspacePath(item.routePath || '');
    if (itemWorkspaceId && itemRoutePath) return itemWorkspaceId === routeWorkspaceId && itemRoutePath === routePath;
    return String(item.requirementId || '') === requirementId;
  });
  const cacheMaterial = cacheCandidates.length === 1 ? cacheCandidates[0] : null;
  if (!cacheMaterial) return Object.freeze({ state: 'unresolved', reason: 'cache-material-missing' });
  return Object.freeze({ state: 'qualified', carrierKind: 'workspace-cache-entry', targetWorkspaceId: '', archivePath: owningCache.archivePath, archiveSha256: '', innerPath: '', archiveEntry: String(cacheMaterial.archiveEntry || ''), bytes: Number(cacheMaterial.bytes || 0), sha256: String(cacheMaterial.sha256 || ''), referenceTarget: String(cacheMaterial.referenceTarget || requirement.reference?.target || '') });
}

export function detachedMaterial(descriptor, byPath, findings) {
  const out = [];
  for (const material of descriptor.materialized || []) {
    if (String(material.carrierKind || '') === 'workspace-archive-entry') continue;
    const file = oneFile(byPath, material.packagePath, findings, 'detached-material');
    if (!file) continue;
    const data = packageFileBytes(file);
    const sha256 = sha256Hex(data);
    if (Number(material.bytes || 0) !== data.byteLength || String(material.sha256 || '') !== sha256) findings.push(finding('error', 'portable.handoff-v2-surface.cache.material-identity-mismatch', 'Detached material bytes diverge from qualified closure identity.', { requirementId: material.requirementId || '' }));
    out.push(Object.freeze({ requirementId: String(material.requirementId || ''), classification: String(material.classification || ''), referenceTarget: String(material.referenceTarget || ''), routeWorkspaceId: String(material.routeWorkspaceId || ''), routePath: String(material.routePath || ''), sourceRequirementId: String(material.sourceRequirementId || ''), originalPath: String(material.originalPath || ''), bytes: data.byteLength, sha256, data }));
  }
  return out.sort((a, b) => a.requirementId.localeCompare(b.requirementId));
}
export function groupRoutes(routes = []) { const map = new Map(); for (const route of [...routes].sort((a, b) => String(a.workspaceId || '').localeCompare(String(b.workspaceId || '')) || String(a.workspaceRelativePath || '').localeCompare(String(b.workspaceRelativePath || '')))) { const id = String(route.workspaceId || ''); const list = map.get(id) || []; list.push(route); map.set(id, list); } return map; }
export function uniqueFileIndex(files, findings) { const map = new Map(); for (const file of files) { const path = String(file.path || ''); const list = map.get(path) || []; list.push(file); map.set(path, list); } for (const [path, list] of map) if (list.length > 1) findings.push(finding('error', 'portable.handoff-v2-surface.source-path-ambiguous', 'Internal qualified source contains duplicate package paths.', { path, count: list.length })); return map; }
export function oneFile(byPath, path, findings, role) { const list = byPath.get(String(path || '')) || []; if (list.length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.source-unresolvable', 'Recipient-facing topology source byte is not uniquely resolvable.', { role, path: String(path || ''), count: list.length })); return list.length === 1 ? list[0] : null; }
export function duplicates(values = []) { const counts = new Map(); for (const value of values) counts.set(value, (counts.get(value) || 0) + 1); return [...counts].filter(([, count]) => count > 1).map(([value]) => value); }
function normalizeWorkspacePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
export function safeToken(value = '') { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'workspace'; }
export function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
export function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
export function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
