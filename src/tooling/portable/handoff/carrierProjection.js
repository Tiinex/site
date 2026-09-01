import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { projectHandoffMaterialRequirements, projectParticipantRoleRequirements } from './materialClosure.requirements.js';
import { qualifyHandoffCarrierWorkspaces, selectHandoffCarrierDefaultWorkspace, handoffCarrierWorkspaceForRoute, projectHandoffCarrierWorkspace, findProjectedHandoffCarrierWorkspace } from './carrierProjection.workspaces.js';
import { HANDOFF_HUMAN_OUTPUT_PRESENTATION, HANDOFF_NORMAL_EMISSION_BOUNDARY } from './humanOutputPresentation.js';
import { normalizeHandoffCarrierLineage } from './carrierLineage.js';
import { qualifySelectedHandoffArtifact } from './routeArtifactConformance.js';
import { buildHandoffWorkspaceByteProvider, listHandoffWorkspaceEntries, resolveHandoffWorkspaceEntry } from './workspaceByteProvider.js';
import { parseWorkspaceQualifiedReference, SHARED_ROUTE_REQUIRED_CONTEXT_BOUNDARY } from './workspaceQualifiedReference.js';

export const HANDOFF_CARRIER_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-carrier-projection.v1';
export const HANDOFF_CARRIER_PROJECTION_PATH = 'tiinex.package/handoff-carrier.json';
export const HANDOFF_HUMAN_OUTPUT_SCHEMA_ID = 'tiinex.portable.handoff-human-output.v1';

const BOUNDARY = 'Disposable human carrier/output projection derived from qualified package/workspace Handoff bytes. Filename, dimension, route labels, transport text, and collision suffix carry no Parent, assignment, acceptance, completion, package-identity, or source authority.';

export function buildHandoffCarrierProjection(input = {}) {
  const bundle = input.bundle || {};
  const descriptor = input.descriptor || parseJsonFile(findFile(bundle, 'tiinex.package/handoff-closure.json')) || bundle.handoffClosure || {};
  const byteProvider = input.workspaceByteProvider || buildHandoffWorkspaceByteProvider(bundle, descriptor);
  const workspaces = qualifyHandoffCarrierWorkspaces(bundle, descriptor, byteProvider);
  const defaultWorkspace = selectHandoffCarrierDefaultWorkspace(bundle, workspaces);
  const routeSpecs = normalizeRouteSpecs(input.routes || input.handoffRoutes || [], descriptor, defaultWorkspace);
  const lineage = normalizeHandoffCarrierLineage(input.carrierLineage || input.lineage || null);
  const shared = routeSpecs.length > 1;
  const routes = routeSpecs.map((spec) => qualifyRoute(bundle, descriptor, byteProvider, handoffCarrierWorkspaceForRoute(workspaces, spec.workspaceId), spec, { enforceRequiredClosure: shared, carrierDimension: lineage.dimension }));
  const qualifiedRoutes = routes.filter((route) => route.state === 'qualified');
  const mode = routes.length > 1 ? 'shared' : 'single';
  const findings = [];
  if (!workspaces.length) findings.push(finding('error', 'portable.handoff-carrier.workspaces.missing', 'Carrier projection requires at least one package workspace materialization.'));
  for (const workspace of workspaces) if (workspace.state !== 'qualified') findings.push(finding('error', `portable.handoff-carrier.workspace.${workspace.state}`, 'Carrier projection workspace is not uniquely qualified against package truth.', { workspaceId: workspace.id || '' }));
  if (!routes.length) findings.push(finding('error', 'portable.handoff-carrier.routes.missing', 'Carrier projection requires at least one controlling Handoff route.'));
  for (const route of routes) {
    if (route.state !== 'qualified') findings.push(finding('error', `portable.handoff-carrier.route.${route.state}`, 'Carrier projection route is not independently qualified against package truth.', { path: route.workspaceRelativePath || '', reasons: route.reasons || [] }));
    for (const item of route.conformance?.findings || []) findings.push(finding(item.severity || 'error', item.code || 'portable.handoff-carrier.route.conformance', item.message || 'Selected Handoff conformance failed.', { path: route.workspaceRelativePath || '' }));
  }
  if (qualifiedRoutes.length !== routes.length) findings.push(finding('error', 'portable.handoff-carrier.routes.unqualified', 'One or more advertised Handoff routes are unqualified; shared human routing must fail closed.'));
  const status = findings.some((item) => item.severity === 'error') ? 'blocked' : 'ready';
  return deepFreeze({
    schema: HANDOFF_CARRIER_PROJECTION_SCHEMA_ID,
    version: 1,
    boundary: BOUNDARY,
    status,
    mode,
    lineage,
    workspaces: Object.freeze(workspaces.map(projectHandoffCarrierWorkspace)),
    workspace: defaultWorkspace ? projectHandoffCarrierWorkspace(defaultWorkspace) : Object.freeze({ id: '', title: '', slug: '', qualification: 'unresolved' }),
    selection: Object.freeze({ policy: mode === 'shared' ? 'explicit-qualified-route-required' : 'implicit-single-qualified-route', qualifiedRouteCount: qualifiedRoutes.length }),
    routes: Object.freeze(routes),
    authority: Object.freeze({ semanticAuthority: 'none', filenameAuthority: false, dimensionalParentAuthority: false, routeSelectionAuthority: 'package-qualified-route-membership-only' }),
    findings: Object.freeze(findings)
  });
}

export function inspectHandoffCarrierProjection(bundle = {}, options = {}) {
  const findings = [];
  const file = findFile(bundle, HANDOFF_CARRIER_PROJECTION_PATH);
  const projection = parseJsonFile(file);
  if (!projection) findings.push(finding('error', 'portable.handoff-carrier.missing', 'Handoff package is missing a readable carrier projection.'));
  if (projection && projection.schema !== HANDOFF_CARRIER_PROJECTION_SCHEMA_ID) findings.push(finding('error', 'portable.handoff-carrier.schema.invalid', 'Handoff carrier projection schema/version is unsupported.'));
  if (projection && projection.boundary !== BOUNDARY) findings.push(finding('error', 'portable.handoff-carrier.boundary.invalid', 'Handoff carrier projection lost its disposable non-authoritative boundary.'));
  if (projection) {
    const expected = buildHandoffCarrierProjection({ bundle, workspaceByteProvider: options.workspaceByteProvider || null, carrierLineage: projection.lineage || null, routes: (projection.routes || []).map((route) => ({ workspaceId: route.workspaceId, path: route.workspaceRelativePath, purpose: route.purpose, participantRoles: route.participantRoleSpecs || [] })) });
    for (const field of ['status', 'mode', 'lineage', 'workspaces', 'workspace', 'selection', 'routes', 'authority']) {
      if (stableJson(expected[field]) !== stableJson(projection[field])) findings.push(finding('error', `portable.handoff-carrier.${field}.mismatch`, `Handoff carrier ${field} diverges from current package/workspace truth.`));
    }
    if (projection.authority?.semanticAuthority !== 'none' || projection.authority?.filenameAuthority !== false || projection.authority?.dimensionalParentAuthority !== false) findings.push(finding('error', 'portable.handoff-carrier.authority.promotion', 'Handoff carrier projection promotes human transport metadata into semantic authority.'));
  }
  return deepFreeze({ schema: 'tiinex.portable.handoff-carrier-projection.inspection.v1', status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid', projection, findings: Object.freeze(findings), findingSummary: Object.freeze({ findings: findings.length, errors: findings.filter((item) => item.severity === 'error').length }) });
}

export function projectHandoffHumanOutput(input = {}) {
  const projection = input.projection || input.carrierProjection || {};
  const findings = [];
  if (projection.schema !== HANDOFF_CARRIER_PROJECTION_SCHEMA_ID || projection.status !== 'ready') findings.push(finding('error', 'portable.handoff-human-output.projection.unready', 'Human output requires a ready qualified Handoff carrier projection.'));
  const selected = selectRoute(projection, input.route || input.routePath || input.routeId || '');
  if (selected.state !== 'qualified') findings.push(finding('error', `portable.handoff-human-output.route.${selected.state}`, selected.state === 'selection-required' ? 'Shared carrier output requires explicit selection of one qualified Handoff route.' : 'Requested Handoff route is not qualified by the carrier projection.', { selector: String(input.route || input.routePath || input.routeId || '') }));
  const instance = normalizeInstance(input.collisionInstance || input.instance || 1);
  const filename = selected.route ? carrierFilenameForInstance(selected.route.projectedFilename, instance) : '';
  const routeWorkspace = selected.route ? findProjectedHandoffCarrierWorkspace(projection, selected.route.workspaceId) : null;
  const transportText = selected.route ? transportTextForRoute(routeWorkspace || projection.workspace || {}, selected.route) : '';
  const status = findings.some((item) => item.severity === 'error') ? (selected.state === 'selection-required' ? 'selection-required' : 'blocked') : 'ready';
  return deepFreeze({
    schema: HANDOFF_HUMAN_OUTPUT_SCHEMA_ID,
    status,
    primary: selected.route ? Object.freeze({ kind: 'handoff-package', filename, dimension: String(projection.lineage?.dimension || selected.route.dimension || ''), parentDimension: String(projection.lineage?.parentDimension || ''), checkpointKind: String(projection.lineage?.checkpointKind || ''), routeId: selected.route.id, workspaceId: selected.route.workspaceId, workspaceRelativeHandoffPath: selected.route.workspaceRelativePath, collisionInstance: instance, singleHumanTransportChoice: true }) : null,
    normalInlineRouting: selected.route ? Object.freeze({ kind: 'transport-text', content: transportText, normalEmission: true, requiredForHumanCompletion: true, placement: 'adjacent-to-primary', authority: 'none' }) : null,
    presentation: HANDOFF_HUMAN_OUTPUT_PRESENTATION,
    normalEmissionBoundary: HANDOFF_NORMAL_EMISSION_BOUNDARY,
    fallbackTransportText: selected.route ? Object.freeze({ supported: true, filename: transportSidecarFilename(filename), content: transportText, normalEmission: false, requiredForHumanCompletion: false, authority: 'none' }) : null,
    selectedRoute: selected.route || null,
    findings: Object.freeze(findings),
    boundary: 'Human-facing output projection only. Normal completion is exactly the sole primary package plus the adjacent exact routing content in a copyable host surface. Presentation wrappers carry no semantic authority. Internal humanOutput JSON, helper artifacts, semantic work-summary prose, manually reconstructed routing, duplicate normal file choices, and optional transport-text sidecars are outside normal emission unless explicitly requested.'
  });
}

export function projectHandoffCarrierOutputFromPackage(input = {}) {
  const bundle = input.bundle || input;
  const inspection = inspectHandoffCarrierProjection(bundle);
  const humanOutput = projectHandoffHumanOutput({ projection: inspection.projection || {}, route: input.route || input.routePath || input.routeId || '', collisionInstance: input.collisionInstance || input.instance || 1 });
  const findings = Object.freeze([...(inspection.findings || []), ...(humanOutput.findings || [])]);
  return deepFreeze({ schema: 'tiinex.portable.handoff-carrier-output-projection.v1', status: inspection.status === 'valid' && humanOutput.status === 'ready' ? 'ready' : humanOutput.status === 'selection-required' ? 'selection-required' : 'blocked', carrierInspection: inspection, humanOutput, findings, boundary: 'Read-only regeneration of carrier filename and minimal transport text from package-qualified route truth.' });
}

export function carrierFilenameForInstance(filename = '', instance = 1) {
  const value = String(filename || 'handoff.handoff-package.zip');
  const number = normalizeInstance(instance);
  if (number <= 1) return value;
  const suffix = '.handoff-package.zip';
  return value.toLowerCase().endsWith(suffix) ? `${value.slice(0, -suffix.length)}--${number}${suffix}` : `${value}--${number}`;
}


function qualifyRoute(bundle, descriptor, byteProvider, workspace, spec = {}, options = {}) {
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

function normalizeRouteSpecs(value, descriptor, defaultWorkspace = null) {
  const supplied = Array.isArray(value) ? value : value ? [value] : [];
  const fallback = normalizeWorkspacePath(descriptor.handoff?.path || descriptor.handoff?.id || '');
  const defaultWorkspaceId = String(defaultWorkspace?.id || '');
  const map = new Map();
  for (const raw of supplied.length ? supplied : [Object.freeze({ workspaceId: defaultWorkspaceId, path: fallback })]) {
    const spec = typeof raw === 'string' ? { workspaceId: defaultWorkspaceId, path: raw } : (raw || {});
    const path = normalizeWorkspacePath(spec.path || spec.workspaceRelativePath || '');
    const workspaceId = String(spec.workspaceId || spec.workspace || defaultWorkspaceId || '');
    const key = `${workspaceId}\u0000${path}`;
    if (path && !map.has(key)) map.set(key, Object.freeze({ workspaceId, path, purpose: String(spec.purpose || ''), participantRoles: Object.freeze([...(spec.participantRoles || spec.roles || [])].map((entry) => typeof entry === 'string' ? entry : Object.freeze({ ...(entry || {}) }))) }));
  }
  return [...map.values()].sort((a, b) => a.workspaceId.localeCompare(b.workspaceId) || a.path.localeCompare(b.path));
}

function selectRoute(projection, selector = '') {
  const routes = (projection.routes || []).filter((route) => route.state === 'qualified');
  const requested = String(selector || '').trim();
  if (!requested) {
    if (projection.mode === 'shared' || routes.length > 1) return Object.freeze({ state: 'selection-required', route: null });
    return routes.length === 1 ? Object.freeze({ state: 'qualified', route: routes[0] }) : Object.freeze({ state: 'unresolved', route: null });
  }
  const normalized = normalizeWorkspacePath(requested);
  const matches = routes.filter((route) => route.id === requested || `${route.workspaceId}:${normalizeWorkspacePath(route.workspaceRelativePath)}` === requested || normalizeWorkspacePath(route.workspaceRelativePath) === normalized);
  return matches.length === 1 ? Object.freeze({ state: 'qualified', route: matches[0] }) : Object.freeze({ state: matches.length > 1 ? 'ambiguous' : 'unresolved', route: null });
}

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
function dimensionFromPath(value = '') {
  const name = normalizeWorkspacePath(value).split('/').pop() || '';
  return String(name.match(/^(\d{3}(?:-\d+)*)-/)?.[1] || '');
}
function carrierFilename(workspaceSlug, dimension, from, to) {
  return `${[slug(workspaceSlug), slug(dimension), slug(from), 'to', slug(to)].filter(Boolean).join('-')}.handoff-package.zip`;
}
function transportTextForRoute(workspace = {}, route = {}) {
  const title = String(workspace.title || workspace.id || 'workspace');
  return `Handoff package attached.\n\nWorkspace: ${title}\nContinue from:\n${route.workspaceRelativePath}\n`;
}
function transportSidecarFilename(filename = '') {
  const suffix = '.handoff-package.zip';
  return filename.toLowerCase().endsWith(suffix) ? `${filename.slice(0, -suffix.length)}.transport.txt` : `${filename}.transport.txt`;
}
function normalizeInstance(value) { const n = Number.parseInt(value, 10); return Number.isFinite(n) && n > 1 ? n : 1; }
function slug(value = '') { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120); }
function normalizeWorkspacePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function isWorkspaceRelativeArtifactPath(path = '') { return Boolean(path) && !path.startsWith('/') && !path.startsWith('handoff.workspaces/') && !path.startsWith('tiinex.package/') && !path.startsWith('../') && !path.includes('/../') && /\.trace\.md$/i.test(path); }
function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function parseJsonFile(file = null) { try { return file ? JSON.parse(decodeUtf8(packageFileBytes(file))) : null; } catch { return null; } }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
