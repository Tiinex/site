import { projectHandoffCarrierOutputFromPackage, projectHandoffHumanOutput } from './carrierProjection.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';

export function recipientV2StandardInvocation(humanOutput = {}, inspection = {}) {
  const route = humanOutput.selectedRoute || {};
  return recipientV2InvocationForRoute(route, inspection);
}

function recipientV2InvocationForRoute(route = {}, inspection = {}) {
  const routeMeta = (inspection.routes || []).find((item) => String(item.workspaceId || '') === String(route.workspaceId || '') && String(item.workspaceRelativeHandoffPath || '') === String(route.workspaceRelativePath || ''));
  if (!routeMeta?.pointerPath || !route.workspaceRelativePath || !route.workspaceId) return '';
  return [
    'Handoff package attached.',
    '',
    'Cold start: read Start directly; do not list or extract this package.',
    '',
    'Start:',
    RECIPIENT_V2_READ_PATH,
    'Continue from (do not read native; pass to Tiinex after bootstrap):',
    String(routeMeta.pointerPath),
    ''
  ].join('\n');
}

export function projectRecipientV2HumanOutput(humanOutput = {}, inspection = {}) {
  if (humanOutput.status !== 'ready' && humanOutput.status !== 'selection-required') return humanOutput;
  const invocation = humanOutput.primary ? recipientV2StandardInvocation(humanOutput, inspection) : '';
  if (humanOutput.primary && !invocation) return Object.freeze({ ...humanOutput, status: 'blocked', findings: Object.freeze([...(humanOutput.findings || []), Object.freeze({ severity: 'error', code: 'portable.handoff-v2-human-output.route-pointer.unresolved', message: 'Recipient-v2 human output requires one exact package-local Handoff route pointer for the selected semantic Handoff.' })]) });
  const sharedRoutes = (humanOutput.sharedRouting?.routes || []).map((item) => {
    const route = (inspection.carrierProjection?.routes || []).find((candidate) => String(candidate.id || '') === String(item.routeId || ''))
      || { id: item.routeId, workspaceId: item.workspaceId, workspaceRelativePath: item.workspaceRelativeHandoffPath };
    const transportText = recipientV2InvocationForRoute(route, inspection);
    return transportText ? Object.freeze({ ...item, transportText }) : null;
  });
  if (humanOutput.sharedRouting && sharedRoutes.some((item) => !item)) return Object.freeze({ ...humanOutput, status: 'blocked', findings: Object.freeze([...(humanOutput.findings || []), Object.freeze({ severity: 'error', code: 'portable.handoff-v2-human-output.shared-route-pointer.unresolved', message: 'Recipient-v2 shared human output requires one exact package-local Handoff route pointer for every qualified route.' })]) });
  const sharedRouting = humanOutput.sharedRouting ? Object.freeze({ ...humanOutput.sharedRouting, routes: Object.freeze(sharedRoutes) }) : null;
  return Object.freeze({
    ...humanOutput,
    normalInlineRouting: humanOutput.normalInlineRouting ? Object.freeze({ ...humanOutput.normalInlineRouting, content: invocation }) : null,
    sharedRouting,
    fallbackTransportText: humanOutput.fallbackTransportText ? Object.freeze({ ...humanOutput.fallbackTransportText, content: invocation }) : null,
    boundary: `${String(humanOutput.boundary || '')} Recipient-v2 host-layer routing is a deterministic address label only: the fixed package Start artifact and exact package-local Continue-from Handoff Route Pointers. Workspace, semantic Handoff path, Role, and Task stay package-owned; shared route texts are read-only addresses and sibling routes remain unselected until one exact qualified route is chosen.`
  });
}

export function projectPortableHandoffCarrierOutputFromPackage(input = {}) {
  const bundle = input.bundle || input;
  const inspection = inspectRecipientFacingV2Topology(bundle);
  if (inspection.detected !== true) return projectHandoffCarrierOutputFromPackage(input);
  const humanOutput = projectRecipientV2HumanOutput(projectHandoffHumanOutput({ projection: inspection.carrierProjection || {}, route: input.route || input.routePath || input.routeId || '', collisionInstance: input.collisionInstance || input.instance || 1 }), inspection);
  const findings = Object.freeze([...(inspection.findings || []), ...(humanOutput.findings || [])]);
  const status = inspection.status === 'valid' && humanOutput.status === 'ready' ? 'ready' : humanOutput.status === 'selection-required' ? 'selection-required' : 'blocked';
  const carrierInspection = boundedRecipientV2Inspection(inspection);
  return deepFreeze({ schema: 'tiinex.portable.handoff-carrier-output-projection.v1', status, carrierInspection, humanOutput, findings, boundary: 'Read-only regeneration of recipient-v2 carrier filename and minimal Start/Continue-from transport address from package-qualified route truth. Package byte/provider internals are intentionally omitted from the human-output projection.' });
}


function boundedRecipientV2Inspection(inspection = {}) {
  return Object.freeze({
    schema: String(inspection.schema || ''),
    status: String(inspection.status || 'invalid'),
    format: String(inspection.format || ''),
    rootArtifact: inspection.rootArtifact ? Object.freeze({ ...inspection.rootArtifact }) : null,
    entrypoint: inspection.readArtifact ? Object.freeze({ path: String(inspection.readArtifact.path || ''), status: String(inspection.readArtifact.status || '') }) : null,
    workspaces: Object.freeze((inspection.workspaces || []).map((item) => Object.freeze({ workspaceId: String(item.workspaceId || ''), workspaceArtifactPath: String(item.workspaceArtifactPath || ''), workspaceArchivePath: String(item.workspaceArchivePath || '') }))),
    routes: Object.freeze((inspection.routes || []).map((item) => Object.freeze({ pointerPath: String(item.pointerPath || ''), workspaceId: String(item.workspaceId || ''), workspaceRelativeHandoffPath: String(item.workspaceRelativeHandoffPath || '') }))),
    findingSummary: Object.freeze({ ...(inspection.findingSummary || {}) }),
    findings: Object.freeze([...(inspection.findings || [])])
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
