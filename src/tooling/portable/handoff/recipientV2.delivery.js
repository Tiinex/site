import { packageFileBytes } from '../../../export/package.bytes.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { parseRecipientV2Facts } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_FORMAT_ID, RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';

export function selectRecipientFacingV2Delivery(bundle = {}, selector = '') {
  const inspection = inspectRecipientFacingV2Topology(bundle);
  if (inspection.status !== 'valid') return blocked(bundle, 'recipient-v2-source-unqualified', inspection.findings || []);
  const route = selectRoute(inspection.carrierProjection?.routes || [], selector);
  if (!route) return blocked(bundle, 'recipient-v2-route-selection-unresolved', []);
  const routeMeta = (inspection.routes || []).find((item) => item.workspaceId === route.workspaceId && item.workspaceRelativeHandoffPath === route.workspaceRelativePath);
  const workspace = (inspection.workspaces || []).find((item) => item.workspaceId === route.workspaceId);
  if (!routeMeta || !workspace || !inspection.rootArtifact?.path) return blocked(bundle, 'recipient-v2-route-workspace-unresolved', []);
  const byPath = new Map((bundle.files || []).map((file) => [String(file.path || ''), file]));
  const pointerFile = byPath.get(routeMeta.pointerPath);
  const pointerFacts = pointerFile ? factsFor(pointerFile) : null;
  if (!pointerFile || !pointerFacts) return blocked(bundle, 'recipient-v2-route-pointer-unresolved', []);

  // Preserve the original package root and READ artifact bytes so descendant Parent-target seals remain valid.
  // Selected delivery prunes material branches; it does not rewrite the package-local lineage root in place.
  const paths = new Set([
    inspection.rootArtifact.path,
    RECIPIENT_V2_READ_PATH,
    routeMeta.pointerPath,
    workspace.workspaceArtifactPath,
    workspace.workspaceArchivePath
  ].filter(Boolean));
  addPayloadRole(bundle, paths, (facts) => !facts.workspaceId && !Array.isArray(facts.materials) && facts.entryCount !== undefined);
  if (pointerFacts.cacheArtifactPath) addPayloadArtifact(bundle, paths, String(pointerFacts.cacheArtifactPath));
  const files = Object.freeze([...paths].map((path) => byPath.get(path)).filter(Boolean).sort((a, b) => String(a.path || '').localeCompare(String(b.path || ''))));
  const selectedBundle = Object.freeze({ ...bundle, files, transportFormat: RECIPIENT_V2_FORMAT_ID, boundary: `${bundle.boundary || ''} Selected recipient-relative v2 delivery preserves the sealed package root/READ lineage and carries exactly one qualified material route branch.` });
  const selectedInspection = inspectRecipientFacingV2Topology(selectedBundle);
  const siblingRoutes = (selectedInspection.carrierProjection?.routes || []).filter((item) => item.state === 'qualified');
  const status = selectedInspection.status === 'valid' && siblingRoutes.length === 1 && siblingRoutes[0].id === route.id ? 'ready' : 'blocked';
  return Object.freeze({ schema: 'tiinex.portable.recipient-facing-handoff-v2.delivery.v1', status, routeId: route.id, bundle: selectedBundle, inspection: selectedInspection, findings: selectedInspection.findings || Object.freeze([]) });
}

function addPayloadRole(bundle, paths, predicate) { for (const file of bundle.files || []) { const facts = factsFor(file); if (!facts || !predicate(facts)) continue; paths.add(String(file.path || '')); if (facts.archivePath) paths.add(String(facts.archivePath)); } }
function addPayloadArtifact(bundle, paths, artifactPath) { const file = (bundle.files || []).find((item) => String(item.path || '') === artifactPath); const facts = file ? factsFor(file) : null; if (!file || !facts) return; paths.add(artifactPath); if (facts.archivePath) paths.add(String(facts.archivePath)); }
function factsFor(file) { if (!/\.md$/i.test(String(file?.path || ''))) return null; return parseRecipientV2Facts(decodeUtf8(packageFileBytes(file))); }
function selectRoute(routes, selector) { if (selector && typeof selector === 'object') return routes.find((route) => route.id === selector.id && route.workspaceId === selector.workspaceId && route.workspaceRelativePath === selector.workspaceRelativePath) || null; const value = String(selector || ''); return routes.find((route) => route.id === value || route.workspaceRelativePath === value) || (routes.length === 1 ? routes[0] : null); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function blocked(bundle, reason, findings) { return Object.freeze({ schema: 'tiinex.portable.recipient-facing-handoff-v2.delivery.v1', status: 'blocked', routeId: '', bundle, inspection: null, findings: Object.freeze([...(findings || []), Object.freeze({ severity: 'error', code: `portable.handoff-v2-delivery.${reason}`, message: 'Recipient-facing v2 selected delivery could not be qualified.' })]) }); }
