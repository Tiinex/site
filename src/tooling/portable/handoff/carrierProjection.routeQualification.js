import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { projectHandoffMaterialRequirements, projectParticipantRoleRequirements } from './materialClosure.requirements.js';
import { qualifySelectedHandoffArtifact } from './routeArtifactConformance.js';
import { listHandoffWorkspaceEntries, resolveHandoffWorkspaceEntry } from './workspaceByteProvider.js';
import { parseWorkspaceQualifiedReference, SHARED_ROUTE_REQUIRED_CONTEXT_BOUNDARY } from './workspaceQualifiedReference.js';
import { decodeUtf8, deepFreeze, findFile, normalizeWorkspacePath } from './carrierProjection.shared.js';

export function qualifyRoute(bundle, descriptor, byteProvider, workspace, spec = {}, options = {}) {
  const routePath = normalizeWorkspacePath(spec.path || spec.workspaceRelativePath || '');
  const reasons = [];
  if (workspace.state !== 'qualified') reasons.push(`workspace-${workspace.state || 'unresolved'}`);
  if (!routePath || !isWorkspaceRelativeArtifactPath(routePath)) reasons.push('workspace-relative-trace-path-required');
  const resolution = routePath && workspace.id ? resolveHandoffWorkspaceEntry(byteProvider, workspace.id, routePath) : null;
  if (!resolution || resolution.state !== 'qualified') reasons.push(resolution?.reason || 'workspace-entry-missing');
  const data = resolution?.state === 'qualified' ? packageFileBytes({ data: resolution.data }) : new Uint8Array();
  if (resolution?.state === 'qualified' && String(resolution.sha256 || '') !== sha256Hex(data)) reasons.push('workspace-byte-digest-mismatch');
  const markdown = data.byteLength ? decodeUtf8(data) : '';
  const conformance = markdown ? qualifySelectedHandoffArtifact({ markdown, resolveParent: ({ parent, targetEntry }) => resolveRouteParent(bundle, descriptor, byteProvider, workspace, routePath, parent, targetEntry) }) : null;
  if (!conformance || conformance.status !== 'qualified') reasons.push('handoff-conformance-unqualified');
  const participantRoleSpecs = Object.freeze([...(spec.participantRoles || spec.roles || [])].map((entry) => typeof entry === 'string' ? entry : Object.freeze({ ...(entry || {}) })));
  const baseRequirements = projectHandoffMaterialRequirements({ path: routePath, markdown });
  const participantRoles = projectParticipantRoleRequirements(participantRoleSpecs, { workspaceId: String(workspace.id || spec.workspaceId || ''), routePath });
  const materialRequirements = deepFreeze({ ...baseRequirements, participantRoles, counts: Object.freeze({ ...(baseRequirements.counts || {}), participantRoles: participantRoles.length }) });
  const requiredClosure = qualifyRouteRequiredClosure(bundle, descriptor, byteProvider, workspace, routePath, materialRequirements);
  if (options.enforceRequiredClosure && requiredClosure.state !== 'qualified') reasons.push('required-context-closure-unqualified');
  const parties = parseHandoffParties(markdown);
  if (!parties.from) reasons.push('from-unresolved');
  if (!parties.to) reasons.push('to-unresolved');
  const dimension = String(options.carrierDimension || '').trim();
  if (!dimension) reasons.push('dimension-unresolved');
  const purpose = slug(spec.purpose || '');
  const projectedFilename = !reasons.length ? carrierFilename(workspace.slug, dimension, parties.from, parties.to) : '';
  const providerMode = String(resolution?.providerMode || '');
  const packagePath = String(resolution?.packagePath || '');
  const pointerTarget = providerMode === 'archive'
    ? `${packagePath}#tiinex-workspace-entry=${encodeURIComponent(routePath)}`
    : packagePath;
  return deepFreeze({
    id: routePath && workspace.id ? `handoff-route:${workspace.id}:${routePath}` : '',
    workspaceId: String(workspace.id || spec.workspaceId || ''),
    state: reasons.length ? 'blocked' : 'qualified',
    workspaceRelativePath: routePath,
    packagePath,
    ...(providerMode === 'archive' ? { providerMode, archivePackagePath: String(resolution?.archivePackagePath || packagePath), pointerTarget } : {}),
    sha256: data.byteLength ? sha256Hex(data) : '',
    dimension,
    parties: Object.freeze({ from: parties.from, to: parties.to, fromSlug: slug(parties.from), toSlug: slug(parties.to) }),
    purpose,
    projectedFilename,
    conformance,
    materialRequirements,
    participantRoles,
    participantRoleSpecs,
    requiredClosure,
    reasons: Object.freeze(reasons),
    authority: Object.freeze({ artifactPartiesAuthoritative: true, dimensionSemanticAuthority: false, filenameSemanticAuthority: false })
  });
}

function qualifyRouteRequiredClosure(bundle, descriptor, byteProvider, workspace, routePath, requirements) {
  const required=(requirements.required||[]).map((requirement)=>qualifyRequiredRequirement(bundle,descriptor,byteProvider,workspace,routePath,requirement));
  const qualified=required.filter((entry)=>entry.state==='qualified').length;
  return deepFreeze({state:qualified===required.length?'qualified':'blocked',requiredCount:required.length,qualifiedCount:qualified,requirements:Object.freeze(required),boundary:SHARED_ROUTE_REQUIRED_CONTEXT_BOUNDARY});
}

function qualifyRequiredRequirement(bundle, descriptor, byteProvider, workspace, routePath, requirement = {}) {
  const target=String(requirement.reference?.target||'').trim(), requirementId=String(requirement.id||'').trim(), reasons=[];
  let resolution=null;
  if (!target||target.startsWith('#')) { resolution=resolveDescriptorMaterial(bundle,descriptor,byteProvider,target,requirementId,workspace.id,routePath); if(!resolution) reasons.push('exact-required-material-reference-or-binding-unresolved'); }
  const qualified=parseWorkspaceQualifiedReference(target);
  if (!resolution&&!reasons.length&&qualified) resolution=resolveWorkspaceRequiredMaterial(byteProvider,{id:qualified.workspaceId},qualified.path);
  if (!resolution&&!reasons.length&&!qualified&&!isExternalReference(target)) { const resolvedPath=resolveWorkspaceReference(routePath,target); if(!resolvedPath) reasons.push('workspace-reference-outside-or-invalid'); else resolution=resolveWorkspaceRequiredMaterial(byteProvider,workspace,resolvedPath); }
  if (!resolution&&!reasons.length) resolution=resolveDescriptorMaterial(bundle,descriptor,byteProvider,target,requirementId,workspace.id,routePath);
  if (!resolution&&!reasons.length) reasons.push('required-material-not-carried');
  if (resolution?.state!=='qualified'&&resolution?.reason) reasons.push(resolution.reason);
  return deepFreeze({requirementId:String(requirement.id||''),name:String(requirement.name||''),referenceTarget:target,state:!reasons.length&&resolution?.state==='qualified'?'qualified':'blocked',resolution:resolution?.state==='qualified'?resolution:null,reasons:Object.freeze([...new Set(reasons)])});
}

function resolveWorkspaceRequiredMaterial(byteProvider, workspace, resolvedPath) {
  const resolution = resolveHandoffWorkspaceEntry(byteProvider, workspace.id, resolvedPath);
  if (resolution.state !== 'qualified') {
    const reason = resolution.state === 'ambiguous' ? 'required-workspace-entry-ambiguous' : resolution.state === 'unresolved' ? 'required-workspace-entry-missing' : (resolution.reason || 'required-workspace-entry-missing');
    return Object.freeze({ state: 'blocked', reason });
  }
  const data = packageFileBytes({ data: resolution.data });
  if (Number(resolution.bytes || 0) !== data.byteLength || String(resolution.sha256 || '') !== sha256Hex(data)) return Object.freeze({ state: 'blocked', reason: 'required-workspace-package-byte-mismatch' });
  return Object.freeze({
    state: 'qualified',
    kind: resolution.kind,
    workspaceRelativePath: resolvedPath,
    packagePath: String(resolution.packagePath || ''),
    ...(resolution.providerMode === 'archive' ? { workspaceId: String(workspace.id || ''), providerMode: 'archive', archivePackagePath: String(resolution.archivePackagePath || resolution.packagePath || ''), innerPath: String(resolution.innerPath || resolvedPath) } : {}),
    bytes: data.byteLength,
    sha256: sha256Hex(data)
  });
}

function resolveDescriptorMaterial(bundle, descriptor, byteProvider, target = '', requirementId = '', routeWorkspaceId = '', routePath = '') {
  const expectedTarget = String(target || '');
  const expectedRequirementId = String(requirementId || '');
  const expectedRouteWorkspaceId = String(routeWorkspaceId || '');
  const expectedRoutePath = normalizeWorkspacePath(routePath || '');
  const matches = (descriptor.materialized || []).filter((entry) => {
    if (expectedRequirementId && String(entry.requirementId || '') !== expectedRequirementId) return false;
    if (expectedTarget && String(entry.referenceTarget || '') !== expectedTarget) return false;
    if (expectedRouteWorkspaceId && entry.routeWorkspaceId && String(entry.routeWorkspaceId || '') !== expectedRouteWorkspaceId) return false;
    if (expectedRoutePath && entry.routePath && normalizeWorkspacePath(entry.routePath || '') !== expectedRoutePath) return false;
    return Boolean(expectedTarget || expectedRequirementId);
  });
  const byRepresentation = new Map();
  for (const entry of matches) {
    const key = entry.carrierKind === 'workspace-archive-entry'
      ? `${entry.workspaceId || ''}\u0000${entry.workspaceRelativePath || ''}\u0000${entry.sha256 || ''}\u0000${Number(entry.bytes || 0)}`
      : `${entry.packagePath || ''}\u0000${entry.sha256 || ''}\u0000${Number(entry.bytes || 0)}`;
    if (!byRepresentation.has(key)) byRepresentation.set(key, entry);
  }
  if (byRepresentation.size !== 1) return byRepresentation.size > 1 ? Object.freeze({ state: 'blocked', reason: 'required-material-carrier-ambiguous' }) : null;
  const entry = [...byRepresentation.values()][0];
  if (String(entry.carrierKind || '') === 'workspace-archive-entry') {
    const resolved = resolveHandoffWorkspaceEntry(byteProvider, entry.workspaceId, entry.workspaceRelativePath);
    if (resolved.state !== 'qualified') return Object.freeze({ state: 'blocked', reason: resolved.reason || 'required-material-workspace-provider-unqualified' });
    const data = packageFileBytes({ data: resolved.data });
    if (Number(entry.bytes || 0) !== data.byteLength || String(entry.sha256 || '') !== sha256Hex(data)) return Object.freeze({ state: 'blocked', reason: 'required-material-package-byte-mismatch' });
    return Object.freeze({ state: 'qualified', kind: 'workspace-archive-entry', workspaceId: String(entry.workspaceId || ''), workspaceRelativePath: String(entry.workspaceRelativePath || ''), providerMode: 'archive', packagePath: String(resolved.packagePath || ''), archivePackagePath: String(resolved.archivePackagePath || resolved.packagePath || ''), innerPath: String(resolved.innerPath || entry.workspaceRelativePath || ''), bytes: data.byteLength, sha256: sha256Hex(data) });
  }
  const file = findFile(bundle, String(entry.packagePath || ''));
  if (!file) return Object.freeze({ state: 'blocked', reason: 'required-material-package-byte-missing' });
  const data = packageFileBytes(file);
  if (Number(entry.bytes || 0) !== data.byteLength || String(entry.sha256 || '') !== sha256Hex(data)) return Object.freeze({ state: 'blocked', reason: 'required-material-package-byte-mismatch' });
  return Object.freeze({ state: 'qualified', kind: 'materialized-required-material', packagePath: String(entry.packagePath || ''), bytes: data.byteLength, sha256: sha256Hex(data) });
}

function resolveRouteParent(bundle, descriptor, byteProvider, workspace, routePath, parent = {}, targetEntry = {}) {
  const localTargets = [];
  if (parent.trace && !isExternalReference(parent.trace)) localTargets.push(String(parent.trace));
  for (const entry of parent.originEntries || []) {
    if (String(entry?.label || '').trim() === 'relative' && entry?.target && !isExternalReference(entry.target)) localTargets.push(String(entry.target));
  }
  const candidates = new Map();
  for (const target of localTargets) {
    const resolvedPath = resolveWorkspaceReference(routePath, target);
    if (!resolvedPath) continue;
    const resolved = resolveHandoffWorkspaceEntry(byteProvider, workspace.id, resolvedPath);
    if (resolved.state !== 'qualified') continue;
    const data = packageFileBytes({ data: resolved.data });
    if (Number(resolved.bytes || 0) !== data.byteLength || String(resolved.sha256 || '') !== sha256Hex(data)) continue;
    const markdown = decodeUtf8(data);
    if (!markdown) continue;
    candidates.set(`${workspace.id}\u0000${resolvedPath}`, Object.freeze({ state: 'qualified', markdown, basis: 'parent-local-reference', workspaceRelativePath: resolvedPath, packagePath: String(resolved.packagePath || ''), sha256: sha256Hex(data) }));
  }
  if (candidates.size === 1) return [...candidates.values()][0];
  if (candidates.size > 1) return Object.freeze({ state: 'ambiguous', reason: 'multiple-parent-local-reference-candidates' });

  const digest = String(targetEntry?.value || '').trim();
  if (!digest) return Object.freeze({ state: 'unavailable', reason: 'parent-target-digest-missing' });
  const digestMatches = new Map();
  for (const candidate of packageParentCandidates(bundle, descriptor, byteProvider)) {
    const data = candidate.data || (candidate.packagePath ? packageFileBytes(findFile(bundle, candidate.packagePath) || {}) : new Uint8Array());
    if (!data.byteLength) continue;
    if (Number(candidate.bytes || data.byteLength) !== data.byteLength || (candidate.sha256 && String(candidate.sha256) !== sha256Hex(data))) continue;
    const markdown = decodeUtf8(data);
    if (!markdown) continue;
    const self = validatedC14nV2PrimarySelfDigest(markdown);
    if (self.state !== 'verified' || self.value !== digest) continue;
    const key = `${candidate.workspaceId || ''}\u0000${candidate.workspaceRelativePath || ''}\u0000${candidate.packagePath || ''}`;
    digestMatches.set(key, Object.freeze({ state: 'qualified', markdown, basis: 'parent-target-digest-candidate', workspaceRelativePath: normalizeWorkspacePath(candidate.workspaceRelativePath || ''), packagePath: String(candidate.packagePath || ''), sha256: sha256Hex(data) }));
  }
  if (digestMatches.size === 1) return [...digestMatches.values()][0];
  if (digestMatches.size > 1) return Object.freeze({ state: 'ambiguous', reason: 'multiple-parent-target-digest-candidates' });
  return Object.freeze({ state: 'unavailable', reason: 'parent-representation-not-carried' });
}

function packageParentCandidates(bundle = {}, descriptor = {}, byteProvider = {}) {
  const candidates = new Map();
  for (const workspace of descriptor.workspaceMaterializations || []) {
    for (const entry of listHandoffWorkspaceEntries(byteProvider, workspace.id)) {
      if (!/\.trace\.md$/i.test(String(entry.path || ''))) continue;
      const key = `${workspace.id}\u0000${entry.path}`;
      if (!candidates.has(key)) candidates.set(key, Object.freeze({ workspaceId: String(workspace.id || ''), packagePath: String(entry.packagePath || entry.archivePackagePath || ''), workspaceRelativePath: normalizeWorkspacePath(entry.path), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || ''), data: entry.data }));
    }
  }
  for (const entry of descriptor.materialized || []) {
    if (String(entry.carrierKind || '') === 'workspace-archive-entry') continue;
    const packagePath = String(entry.packagePath || '');
    if (!packagePath || candidates.has(`package\u0000${packagePath}`)) continue;
    const file = findFile(bundle, packagePath);
    candidates.set(`package\u0000${packagePath}`, Object.freeze({ packagePath, workspaceRelativePath: normalizeWorkspacePath(entry.originalPath || ''), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || ''), data: file ? packageFileBytes(file) : new Uint8Array() }));
  }
  return [...candidates.values()];
}

function resolveWorkspaceReference(routePath, target) {
  const raw = safeDecodeURIComponent(String(target || '').split('#')[0].split('?')[0]);
  if (!raw || raw.startsWith('/') || raw.startsWith('\\')) return '';
  const base = normalizeWorkspacePath(routePath).split('/').slice(0, -1);
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!base.length) return ''; base.pop(); }
    else base.push(part);
  }
  return normalizeWorkspacePath(base.join('/'));
}

function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:/i.test(String(value || '')) || String(value || '').startsWith('//'); }
function safeDecodeURIComponent(value = '') { try { return decodeURIComponent(value); } catch { return ''; } }

function parseHandoffParties(markdown = '') {
  const text = String(markdown || '');
  const heading = /^##\s+Handoff Parties\s*$/mi.exec(text);
  if (!heading) return Object.freeze({ from: '', to: '' });
  const rest = text.slice(heading.index + heading[0].length);
  const nextHeading = /^##\s+/m.exec(rest);
  const section = nextHeading ? rest.slice(0, nextHeading.index) : rest;
  return Object.freeze({ from: field(section, 'From'), to: field(section, 'To') });
}
function field(section, name) {
  const match = String(section || '').match(new RegExp(`^\\s*-\\s+${name}:\\s*(.+?)\\s*$`, 'mi'));
  return String(match?.[1] || '').trim();
}

function carrierFilename(workspaceSlug, dimension, from, to) {
  return `${[slug(workspaceSlug), slug(dimension), slug(from), 'to', slug(to)].filter(Boolean).join('-')}.handoff-package.zip`;
}

function slug(value = '') { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120); }

function isWorkspaceRelativeArtifactPath(path = '') { return Boolean(path) && !path.startsWith('/') && !path.startsWith('handoff.workspaces/') && !path.startsWith('tiinex.package/') && !path.startsWith('../') && !path.includes('/../') && /\.trace\.md$/i.test(path); }
