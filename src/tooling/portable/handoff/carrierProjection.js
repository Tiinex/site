import { qualifyHandoffCarrierWorkspaces, selectHandoffCarrierDefaultWorkspace, handoffCarrierWorkspaceForRoute, projectHandoffCarrierWorkspace, findProjectedHandoffCarrierWorkspace } from './carrierProjection.workspaces.js';
import { HANDOFF_HUMAN_OUTPUT_PRESENTATION, HANDOFF_NORMAL_EMISSION_BOUNDARY } from './humanOutputPresentation.js';
import { normalizeHandoffCarrierLineage } from './carrierLineage.js';
import { buildHandoffWorkspaceByteProvider } from './workspaceByteProvider.js';
import { qualifyRoute } from './carrierProjection.routeQualification.js';
import { deepFreeze, findFile, normalizeWorkspacePath, parseJsonFile } from './carrierProjection.shared.js';


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
  const filename = selected.route ? carrierFilenameForInstance(projectedOuterFilename(projection, selected.route), instance) : '';
  const routeWorkspace = selected.route ? findProjectedHandoffCarrierWorkspace(projection, selected.route.workspaceId) : null;
  const transportText = selected.route ? transportTextForRoute(routeWorkspace || projection.workspace || {}, selected.route) : '';
  const sharedRouting = projectSharedRouting(projection, instance);
  const status = findings.some((item) => item.severity === 'error') ? (selected.state === 'selection-required' ? 'selection-required' : 'blocked') : 'ready';
  return deepFreeze({
    schema: HANDOFF_HUMAN_OUTPUT_SCHEMA_ID,
    status,
    primary: selected.route ? Object.freeze({ kind: 'handoff-package', filename, dimension: String(projection.lineage?.dimension || selected.route.dimension || ''), parentDimension: String(projection.lineage?.parentDimension || ''), checkpointKind: String(projection.lineage?.checkpointKind || ''), routeId: selected.route.id, workspaceId: selected.route.workspaceId, workspaceRelativeHandoffPath: selected.route.workspaceRelativePath, collisionInstance: instance, singleHumanTransportChoice: true }) : null,
    normalInlineRouting: selected.route ? Object.freeze({ kind: 'transport-text', content: transportText, normalEmission: true, requiredForHumanCompletion: true, placement: 'adjacent-to-primary', authority: 'none' }) : null,
    sharedRouting,
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



function projectSharedRouting(projection = {}, instance = 1) {
  if (String(projection.mode || '') !== 'shared') return null;
  const routes = (projection.routes || []).filter((route) => route.state === 'qualified');
  if (!routes.length) return null;
  const filename = carrierFilenameForInstance(projectedOuterFilename(projection, routes[0]), instance);
  return Object.freeze({
    mode: 'one-shared-package-many-exact-route-texts',
    primary: Object.freeze({ kind: 'handoff-package', filename }),
    routes: Object.freeze(routes.map((route) => {
      const workspace = findProjectedHandoffCarrierWorkspace(projection, route.workspaceId) || projection.workspace || {};
      return Object.freeze({
        routeId: String(route.id || ''),
        workspaceId: String(route.workspaceId || ''),
        workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''),
        transportText: transportTextForRoute(workspace, route),
        authority: 'none'
      });
    })),
    selectionAuthority: 'exact-qualified-route-only',
    siblingInference: false,
    readOnly: true
  });
}

function projectedOuterFilename(projection = {}, selectedRoute = {}) {
  if (String(projection.mode || '') !== 'shared') return String(selectedRoute.projectedFilename || '');
  const routes = (projection.routes || []).filter((route) => route.state === 'qualified');
  const recipients = [...new Set(routes.map((route) => String(route.parties?.to || '').trim()).filter(Boolean))];
  const senders = [...new Set(routes.map((route) => String(route.parties?.from || '').trim()).filter(Boolean))];
  const workspace = projection.workspace || findProjectedHandoffCarrierWorkspace(projection, selectedRoute.workspaceId) || {};
  const dimension = String(projection.lineage?.dimension || selectedRoute.dimension || '').trim();
  if (senders.length !== 1 || !recipients.length || !workspace.slug || !dimension) return String(selectedRoute.projectedFilename || '');
  const recipientSegment = recipients.map(slug).filter(Boolean).join('-and-');
  return `${slug(workspace.slug)}-${slug(dimension)}-${slug(senders[0])}-to-${recipientSegment}.handoff-package.zip`;
}

function slug(value = '') {
  return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
}

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

function transportTextForRoute(workspace = {}, route = {}) {
  const title = String(workspace.title || workspace.id || 'workspace');
  return `Handoff package attached.\n\nWorkspace: ${title}\nContinue from:\n${route.workspaceRelativePath}\n`;
}
function transportSidecarFilename(filename = '') {
  const suffix = '.handoff-package.zip';
  return filename.toLowerCase().endsWith(suffix) ? `${filename.slice(0, -suffix.length)}.transport.txt` : `${filename}.transport.txt`;
}
function normalizeInstance(value) { const n = Number.parseInt(value, 10); return Number.isFinite(n) && n > 1 ? n : 1; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
