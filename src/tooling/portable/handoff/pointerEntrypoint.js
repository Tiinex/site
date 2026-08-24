import { packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { inspectHandoffCarrierProjection } from './carrierProjection.js';

export const HANDOFF_POINTER_ENTRYPOINT_PROJECTION_SCHEMA_ID = 'tiinex.portable.handoff-pointer-entrypoints.v1';
export const HANDOFF_POINTER_ENTRYPOINT_INSPECTION_SCHEMA_ID = 'tiinex.portable.handoff-pointer-entrypoints.inspection.v1';
export const HANDOFF_POINTER_ENTRYPOINT_PREFIX = 'handoff-entrypoint-';
export const CANONICAL_POINTER_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/pointer/tiinex.pointer.v1.schema.md';

const BOUNDARY = 'Generated package-root tiinex.pointer.v1 orientation only. Pointer filename, prose, and placement have no Parent, assignment, acceptance, completion, source, package-identity, or route-selection authority; qualified package carrier/closure truth remains controlling.';

export function buildHandoffPointerEntrypoints(input = {}) {
  const carrier = input.carrierProjection || input.projection || {};
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const qualifiedRoutes = carrier.status === 'ready' ? (carrier.routes || []).filter((route) => route.state === 'qualified') : [];
  const entries = qualifiedRoutes.map((route) => buildPointerEntry(route, createdAt));
  return deepFreeze({
    schema: HANDOFF_POINTER_ENTRYPOINT_PROJECTION_SCHEMA_ID,
    version: 1,
    status: carrier.status === 'ready' && entries.length === qualifiedRoutes.length && entries.length > 0 ? 'ready' : 'blocked',
    boundary: BOUNDARY,
    canonicalPointerSchema: CANONICAL_POINTER_SCHEMA_TARGET,
    entries: Object.freeze(entries),
    authority: Object.freeze({ semanticAuthority: 'none', routeSelectionAuthority: 'package-qualified-route-membership-only', parentAuthority: false, sourceAuthority: false })
  });
}

export function inspectHandoffPointerEntrypoints(bundle = {}) {
  const findings = [];
  const carrierInspection = inspectHandoffCarrierProjection(bundle);
  if (carrierInspection.status !== 'valid') findings.push(finding('error', 'portable.handoff-pointer.carrier.invalid', 'Handoff Pointer entrypoints cannot qualify because package carrier truth is invalid.'));
  const carrier = carrierInspection.projection || {};
  const createdAt = packageCreatedAt(bundle);
  const expected = buildHandoffPointerEntrypoints({ carrierProjection: carrier, createdAt });
  const actualFiles = (bundle.files || []).filter((file) => isHandoffPointerEntrypointPath(file.path));
  const actualByPath = new Map();
  for (const file of actualFiles) {
    const path = String(file.path || '');
    const list = actualByPath.get(path) || [];
    list.push(file);
    actualByPath.set(path, list);
  }
  for (const [path, files] of actualByPath) if (files.length > 1) findings.push(finding('error', 'portable.handoff-pointer.duplicate-path', 'Multiple generated Pointer carriers use the same package-root path.', { path, count: files.length }));

  const expectedByPath = new Map((expected.entries || []).map((entry) => [entry.path, entry]));
  const qualifiedTargets = new Set((carrier.routes || []).filter((route) => route.state === 'qualified').map((route) => String(route.packagePath || '')));
  const actualEntries = [];
  for (const file of actualFiles) {
    const parsed = parsePointer(file);
    actualEntries.push(parsed);
    if (parsed.schemaState !== 'qualified') findings.push(finding('error', 'portable.handoff-pointer.schema.invalid', 'Package-root Pointer is not an ordinary tiinex.pointer.v1 artifact.', { path: parsed.path }));
    if (parsed.integrityState !== 'verified') findings.push(finding('error', 'portable.handoff-pointer.integrity.invalid', 'Package-root Pointer self integrity is not verified.', { path: parsed.path, integrityState: parsed.integrityState }));
    if (parsed.targets.length !== 1) findings.push(finding('error', 'portable.handoff-pointer.target.cardinality', 'Each package route Pointer must expose exactly one explicit destination.', { path: parsed.path, count: parsed.targets.length }));
    if (/^\s*-\s+Parent\b/m.test(parsed.markdown)) findings.push(finding('error', 'portable.handoff-pointer.parent.promotion', 'Generated package route Pointer must not mint Parent continuity. ', { path: parsed.path }));
    for (const target of parsed.targets) if (!qualifiedTargets.has(target)) findings.push(finding('error', 'portable.handoff-pointer.target.unqualified-route', 'Pointer target is not a package-qualified Handoff route.', { path: parsed.path, target }));
    const expectedEntry = expectedByPath.get(parsed.path);
    if (!expectedEntry) findings.push(finding('error', 'portable.handoff-pointer.unexpected', 'Package contains an unexpected route Pointer projection.', { path: parsed.path }));
    else if (parsed.markdown !== expectedEntry.markdown) findings.push(finding('error', 'portable.handoff-pointer.projection.mismatch', 'Pointer bytes diverge from the projection independently rebuilt from package route truth.', { path: parsed.path }));
  }
  for (const expectedEntry of expected.entries || []) if (!actualByPath.has(expectedEntry.path)) findings.push(finding('error', 'portable.handoff-pointer.missing', 'Package is missing the expected route-specific root Pointer.', { path: expectedEntry.path, routeId: expectedEntry.routeId }));
  if (actualFiles.length !== (expected.entries || []).length) findings.push(finding('error', 'portable.handoff-pointer.count.mismatch', 'Package-root Pointer count diverges from qualified route count.', { actual: actualFiles.length, expected: (expected.entries || []).length }));

  return deepFreeze({
    schema: HANDOFF_POINTER_ENTRYPOINT_INSPECTION_SCHEMA_ID,
    status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid',
    projection: expected,
    entries: Object.freeze(actualEntries.map(({ markdown, ...entry }) => Object.freeze(entry))),
    carrierInspection,
    findings: Object.freeze(findings),
    findingSummary: Object.freeze({ findings: findings.length, errors: findings.filter((item) => item.severity === 'error').length }),
    boundary: BOUNDARY
  });
}

export function isHandoffPointerEntrypointPath(value = '') {
  const path = String(value || '');
  return path.startsWith(HANDOFF_POINTER_ENTRYPOINT_PREFIX) && path.endsWith('.trace.md') && !path.includes('/');
}

function buildPointerEntry(route = {}, createdAt = '') {
  const path = pointerPath(route);
  const title = `Handoff route pointer — ${String(route.parties?.to || route.workspaceId || 'recipient')}`;
  const unsigned = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: [tiinex.pointer.v1](${CANONICAL_POINTER_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: Thin package-local pointer to one qualified Handoff route.\n\n---\n\n# ${title}\n\nThis generated pointer exposes one next hop only. Package carrier and closure controls remain the authority for whether that Handoff route is qualified.\n\n## Destinations\n\n- Qualified Handoff route: [${route.workspaceRelativePath}](${route.packagePath})\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`portable.handoff-pointer.integrity.seal-failed:${sealed.reason || sealed.state}`);
  return deepFreeze({
    path,
    routeId: String(route.id || ''),
    workspaceId: String(route.workspaceId || ''),
    targetPackagePath: String(route.packagePath || ''),
    targetSha256: String(route.sha256 || ''),
    markdown: `${sealed.markdown}\n`,
    boundary: BOUNDARY
  });
}

function pointerPath(route = {}) {
  const seed = String(route.id || `${route.workspaceId}:${route.workspaceRelativePath}`);
  const token = slug(`${route.workspaceId}-${route.dimension || ''}-${route.parties?.to || ''}`) || 'route';
  return `${HANDOFF_POINTER_ENTRYPOINT_PREFIX}${token}-${sha256Hex(utf8Bytes(seed)).slice(0, 12)}.trace.md`;
}

function parsePointer(file = {}) {
  const markdown = decodeUtf8(packageFileBytes(file));
  const schemaState = /Current Schema:\s*\[tiinex\.pointer\.v1\]\([^)]+\)/i.test(markdown) || /Current Schema:\s*tiinex\.pointer\.v1\b/i.test(markdown) ? 'qualified' : 'invalid';
  const integrityState = canonicalC14nV2SelfState(markdown).state;
  const targets = parseDestinationTargets(markdown);
  return Object.freeze({ path: String(file.path || ''), schemaState, integrityState, targets: Object.freeze(targets), sha256: sha256Hex(packageFileBytes(file)), markdown });
}

function parseDestinationTargets(markdown = '') {
  const source = String(markdown || '');
  const heading = /^##\s+Destinations\s*$/mi.exec(source);
  if (!heading) return [];
  const afterHeading = source.slice(heading.index + heading[0].length);
  const nextHeading = /^#{1,2}\s+/m.exec(afterHeading);
  const section = nextHeading ? afterHeading.slice(0, nextHeading.index) : afterHeading;
  const out = [];
  const link = /\[[^\]\r\n]+\]\(([^)\r\n]+)\)/g;
  let found;
  while ((found = link.exec(section))) out.push(String(found[1] || '').trim());
  return out;
}

function packageCreatedAt(bundle = {}) {
  const manifest = parseJsonFile((bundle.files || []).find((file) => String(file.path || '') === 'tiinex.package/manifest.json')) || bundle.manifest || {};
  return normalizeCreatedAt(manifest.createdAt || bundle.builtAt || '');
}
function normalizeCreatedAt(value = '') { return String(value || '').trim() || '1970-01-01T00:00:00.000Z'; }
function parseJsonFile(file = null) { try { return file ? JSON.parse(decodeUtf8(packageFileBytes(file))) : null; } catch { return null; } }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function slug(value = '') { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
