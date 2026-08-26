import { packageFileBytes } from '../../../export/package.bytes.js';
import { inspectHandoffCarrierProjection } from './carrierProjection.js';
import { inspectHandoffPointerEntrypoints } from './pointerEntrypoint.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';

export const HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH = 'tiinex.package/START.md';
export const HANDOFF_COLD_CONSUMER_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-cold-consumer-projection.v1';
export const HANDOFF_COLD_CONSUMER_ENTRYPOINT_INSPECTION_SCHEMA_ID = 'tiinex.portable.handoff-cold-consumer-entrypoint.inspection.v1';

const BEGIN = '<!-- tiinex.handoff-start.projection.begin -->';
const END = '<!-- tiinex.handoff-start.projection.end -->';
const BOUNDARY = 'Package-local cold-consumer orientation only. This projection is generated from qualified package control/workspace bytes and has no Handoff, Parent, assignment, acceptance, completion, filename, or package-identity authority.';

export function buildHandoffColdConsumerProjection(input = {}) {
  const carrier = input.carrierProjection || input.projection || {};
  const workspaces = Object.freeze((carrier.workspaces || []).map((workspace) => Object.freeze({
    id: String(workspace.id || ''),
    title: String(workspace.title || workspace.id || ''),
    slug: String(workspace.slug || ''),
    qualification: String(workspace.qualification || 'unresolved')
  })));
  const routes = Object.freeze((carrier.routes || []).map((route) => Object.freeze({
    id: String(route.id || ''),
    state: String(route.state || ''),
    workspaceId: String(route.workspaceId || ''),
    workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''),
    packagePath: String(route.packagePath || ''),
    sha256: String(route.sha256 || ''),
    from: String(route.parties?.from || ''),
    to: String(route.parties?.to || '')
  })));
  const qualifiedRoutes = routes.filter((route) => route.state === 'qualified');
  const single = carrier.status === 'ready' && qualifiedRoutes.length === 1 ? qualifiedRoutes[0] : null;
  return deepFreeze({
    schema: HANDOFF_COLD_CONSUMER_PROJECTION_SCHEMA_ID,
    version: 1,
    status: carrier.status === 'ready' ? 'ready' : 'blocked',
    boundary: BOUNDARY,
    controls: Object.freeze({
      start: HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH,
      carrier: 'tiinex.package/handoff-carrier.json',
      closure: 'tiinex.package/handoff-closure.json',
      fileMap: 'tiinex.package/file-map.json',
      manifest: 'tiinex.package/manifest.json'
    }),
    preferredPath: Object.freeze({
      ingressKind: 'routed-handoff-package',
      firstSemanticOperation: 'orient-handoff-package',
      groundingOperation: 'ground-cold-consumer',
      qualificationOperation: 'qualify-cold-start',
      minimalHostBootstrapActions: 1,
      nativeFallback: 'explicit-and-justified-only',
      providerSpecificSemanticAuthority: false
    }),
    workspaces,
    routes,
    selection: Object.freeze({
      policy: String(carrier.selection?.policy || ''),
      qualifiedRouteCount: Number(carrier.selection?.qualifiedRouteCount || 0),
      implicitRouteId: single?.id || ''
    }),
    authority: Object.freeze({
      semanticAuthority: 'none',
      packageTruthRequired: true,
      routeBindingAuthority: 'correlated-carrier-and-closure-package-truth-only'
    })
  });
}

export function renderHandoffColdConsumerEntrypoint(input = {}) {
  const projection = input.projection || buildHandoffColdConsumerProjection(input);
  const workspaceLines = projection.workspaces.length
    ? projection.workspaces.map((workspace) => `- \`${workspace.id}\` — ${workspace.title} (${workspace.qualification})`).join('\n')
    : '- none qualified';
  const routeLines = projection.routes.length
    ? projection.routes.map((route) => `- \`${route.id}\` → workspace \`${route.workspaceId}\` / \`${route.workspaceRelativeHandoffPath}\` (${route.state})`).join('\n')
    : '- none qualified';
  const next = projection.selection.implicitRouteId
    ? `Continue from the single qualified route \`${projection.selection.implicitRouteId}\`.`
    : projection.selection.qualifiedRouteCount > 1
      ? 'Select exactly one qualified route by route id before projecting recipient-facing output.'
      : 'No qualified route is available; inspect the package control findings and fail closed.';
  return `# Tiinex Handoff Package Start\n\nThis file is a generated orientation aid for a cold consumer. Read it without executing package code. The structured projection below is non-authoritative and must correlate with the package-local carrier, closure, file map, manifest, and carried workspace bytes.\n\n## Preferred Tiinex Ingress\n\nAfter the host has surfaced this package to qualified portable Tooling, invoke \`orient-handoff-package\` as the first semantic operation. Before that takeover, at most one minimal host/bootstrap ingress action is allowed. Do not perform arbitrary ZIP/filesystem archaeology first when qualified Tiinex orientation is available. Ground the recipient/participants/interaction with \`ground-cold-consumer\` before substantive work; native tools remain valid after takeover and as explicit justified fallback.\n\n## Workspaces\n\n${workspaceLines}\n\n## Routes\n\n${routeLines}\n\n## Next\n\n${next}\n\n${BEGIN}\n\`\`\`json\n${stablePrettyJson(projection)}\n\`\`\`\n${END}\n`;
}

export function inspectHandoffColdConsumerEntrypoint(bundle = {}, options = {}) {
  const findings = [];
  const file = findFile(bundle, HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH);
  const parsed = file ? parseProjectionFromMarkdown(decodeUtf8(packageFileBytes(file))) : null;
  if (!file) findings.push(finding('error', 'portable.handoff-start.missing', 'Handoff package is missing the package-local cold-consumer START entrypoint.'));
  else if (!parsed) findings.push(finding('error', 'portable.handoff-start.projection.unparseable', 'Handoff START entrypoint does not contain one bounded parseable structured projection.'));
  if (parsed && parsed.schema !== HANDOFF_COLD_CONSUMER_PROJECTION_SCHEMA_ID) findings.push(finding('error', 'portable.handoff-start.schema.invalid', 'Handoff START projection schema/version is unsupported.'));
  if (parsed && parsed.boundary !== BOUNDARY) findings.push(finding('error', 'portable.handoff-start.boundary.invalid', 'Handoff START projection lost its non-authoritative package-orientation boundary.'));

  const carrierInspection = options.carrierInspection || inspectHandoffCarrierProjection(bundle);
  if (carrierInspection.status !== 'valid') findings.push(finding('error', 'portable.handoff-start.carrier.invalid', 'Handoff START cannot qualify because the package carrier projection does not independently correlate with current package truth.'));
  if (parsed && carrierInspection.projection) {
    const expected = buildHandoffColdConsumerProjection({ carrierProjection: carrierInspection.projection });
    for (const field of ['status', 'controls', 'workspaces', 'routes', 'selection', 'authority']) {
      if (stableJson(parsed[field]) !== stableJson(expected[field])) findings.push(finding('error', `portable.handoff-start.${field}.mismatch`, `Handoff START ${field} diverges from independently recomputed package truth.`));
    }
    if (Object.prototype.hasOwnProperty.call(parsed, 'preferredPath') && stableJson(parsed.preferredPath) !== stableJson(expected.preferredPath)) findings.push(finding('error', 'portable.handoff-start.preferredPath.mismatch', 'Handoff START preferredPath diverges from independently recomputed portable cold-start guidance.'));
    if (parsed.authority?.semanticAuthority !== 'none' || parsed.authority?.packageTruthRequired !== true) findings.push(finding('error', 'portable.handoff-start.authority.promotion', 'Handoff START projection promotes orientation text into semantic authority.'));
  }

  return deepFreeze({
    schema: HANDOFF_COLD_CONSUMER_ENTRYPOINT_INSPECTION_SCHEMA_ID,
    status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid',
    path: HANDOFF_COLD_CONSUMER_ENTRYPOINT_PATH,
    projection: parsed,
    carrierInspection,
    findings: Object.freeze(findings),
    findingSummary: Object.freeze({ findings: findings.length, errors: findings.filter((item) => item.severity === 'error').length })
  });
}

export function orientColdConsumerFromHandoffPackage(input = {}) {
  const bundle = input.bundle || input;
  if ((bundle.files || []).some((file) => String(file.path || '') === RECIPIENT_V2_READ_PATH)) {
    const v2 = inspectRecipientFacingV2Topology(bundle);
    const projection = v2.coldConsumerProjection || null;
    const routeMetadata = new Map((v2.routes || []).map((route) => [`${String(route.workspaceId || '')}\u0000${String(route.workspaceRelativeHandoffPath || '')}`, route]));
    const routes = Object.freeze((projection?.routes || []).map((route) => {
      const metadata = routeMetadata.get(`${String(route.workspaceId || '')}\u0000${String(route.workspaceRelativeHandoffPath || '')}`) || {};
      return Object.freeze({ ...route, pointerPath: String(metadata.pointerPath || ''), participantRolePointers: Object.freeze([...(metadata.participantRolePointers || [])]) });
    }));
    return deepFreeze({ schema: 'tiinex.portable.handoff-cold-consumer-orientation.v1', status: v2.status === 'valid' && projection?.status === 'ready' ? 'ready' : 'blocked', entrypoint: Object.freeze({ schema: 'tiinex.portable.handoff-v2.recipient-orientation.inspection.v1', status: v2.status, path: RECIPIENT_V2_READ_PATH, projection, findings: v2.findings }), pointerEntrypoints: Object.freeze({ schema: 'tiinex.portable.handoff-v2.recipient-pointer.inspection.v1', status: v2.status, entries: v2.routes, findings: v2.findings }), workspaces: projection?.workspaces || Object.freeze([]), routes, participantRoles: v2.participantRoles || Object.freeze([]), selection: projection?.selection || null, boundary: 'Read-only recipient-facing v2 orientation from qualified visible Tiinex artifacts and exact payload bytes; no legacy control JSON, filename, or adjacency authority.' });
  }
  const inspection = inspectHandoffColdConsumerEntrypoint(bundle);
  const pointerEntrypoints = inspectHandoffPointerEntrypoints(bundle);
  const projection = inspection.projection || null;
  return deepFreeze({
    schema: 'tiinex.portable.handoff-cold-consumer-orientation.v1',
    status: inspection.status === 'valid' && pointerEntrypoints.status === 'valid' && projection?.status === 'ready' ? 'ready' : 'blocked',
    entrypoint: inspection,
    pointerEntrypoints,
    workspaces: projection?.workspaces || Object.freeze([]),
    routes: projection?.routes || Object.freeze([]),
    selection: projection?.selection || null,
    boundary: 'Read-only package orientation. Received package code is not executed; START and package-root Pointer projections must independently correlate with package truth and never override it.'
  });
}

function parseProjectionFromMarkdown(markdown = '') {
  const text = String(markdown || '');
  const begin = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (begin < 0 || end < 0 || end <= begin || text.indexOf(BEGIN, begin + BEGIN.length) >= 0 || text.indexOf(END, end + END.length) >= 0) return null;
  const bounded = text.slice(begin + BEGIN.length, end).trim();
  const match = bounded.match(/^```json\s*\n([\s\S]*?)\n```$/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}
function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function stablePrettyJson(value) { return JSON.stringify(sortJson(value), null, 2); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
