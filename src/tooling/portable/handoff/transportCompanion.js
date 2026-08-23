import { packageFileBytes } from '../../../export/package.bytes.js';

export const HANDOFF_TRANSPORT_COMPANION_SCHEMA_ID = 'tiinex.portable.handoff-transport-companion-projection.v1';
export const HANDOFF_TRANSPORT_COMPANION_PATH = 'tiinex.package/handoff-companion.json';

const ACTIONS = Object.freeze({
  providePackage: 'tiinex.handoff.transport.action.provide-package',
  invokeRecipient: 'tiinex.handoff.transport.action.invoke-recipient',
  carryResult: 'tiinex.handoff.transport.action.carry-result'
});

const KEYS = Object.freeze({
  providePackage: 'handoff.transport.action.providePackage',
  invokeRecipient: 'handoff.transport.action.invokeRecipient',
  carryResult: 'handoff.transport.action.carryResult',
  invocation: 'handoff.transport.invocation.workspaceArtifact',
  routingDetail: 'handoff.transport.detail.routing',
  participationDetail: 'handoff.transport.detail.participation',
  blockerDetail: 'handoff.transport.detail.blockers'
});

export function buildHandoffTransportCompanionProjection(input = {}) {
  const descriptor = input.descriptor || {};
  const bundle = input.bundle || {};
  const packageStatus = String(input.packageStatus || descriptor.plan?.status || bundle.status || 'blocked');
  const routing = qualifyRouting(bundle, descriptor);
  const participation = qualifyParticipation(input.participation || input.transportParticipation || {});
  const blockers = [];
  if (packageStatus === 'blocked') blockers.push(blocker('package-blocked', { packageStatus }));
  if (routing.state !== 'qualified') blockers.push(blocker(`routing-${routing.state}`, routing.parameters));
  if (participation.actingRole.state === 'ambiguous') blockers.push(blocker('acting-role-ambiguous', {}));
  if (participation.actingRole.state === 'unresolved') blockers.push(blocker('acting-role-unresolved', {}));
  if (participation.actingRole.state === 'invalid') blockers.push(blocker('acting-role-invalid', {}));
  if (participation.transportPosture.state !== 'qualified') blockers.push(blocker('participation-posture-unqualified', { state: participation.transportPosture.state }));
  const status = blockers.some((item) => item.id.includes('ambiguous')) ? 'ambiguous' : blockers.length ? 'blocked' : 'ready';
  const routeParameters = Object.freeze({
    workspaceId: routing.workspace.id,
    workspaceTitle: routing.workspace.title,
    controllingArtifactPath: routing.controllingArtifact.workspaceRelativePath
  });
  const actions = Object.freeze([
    action(ACTIONS.providePackage, KEYS.providePackage, Object.freeze({ packageStatus })),
    action(ACTIONS.invokeRecipient, KEYS.invokeRecipient, routeParameters),
    action(ACTIONS.carryResult, KEYS.carryResult, Object.freeze({}))
  ]);
  return deepFreeze({
    schema: HANDOFF_TRANSPORT_COMPANION_SCHEMA_ID,
    version: 1,
    boundary: 'non-authoritative-disposable-transport-projection',
    status,
    packageState: Object.freeze({ status: packageStatus, descriptorSchema: String(descriptor.schema || '') }),
    routing,
    participation,
    recipientEntrypoint: Object.freeze({
      kind: 'workspace-artifact-routing',
      localizationKey: KEYS.invocation,
      parameters: routeParameters
    }),
    actions,
    progressiveDisclosure: Object.freeze({
      expertActionIds: Object.freeze(actions.map((item) => item.id)),
      details: Object.freeze([
        disclosure('routing', KEYS.routingDetail, routeParameters),
        disclosure('participation', KEYS.participationDetail, participationParameters(participation)),
        disclosure('blockers', KEYS.blockerDetail, Object.freeze({ blockerIds: Object.freeze(blockers.map((item) => item.id)) }))
      ])
    }),
    blockers: Object.freeze(blockers),
    authority: Object.freeze({ semanticAuthority: 'none', carrierEndpointPromotion: false, acceptanceAuthority: false })
  });
}

export function inspectHandoffTransportCompanion(bundle = {}) {
  const findings = [];
  const projectionFile = (bundle.files || []).find((file) => String(file.path || '') === HANDOFF_TRANSPORT_COMPANION_PATH);
  const projection = projectionFile ? parseJsonFile(projectionFile) : null;
  const descriptorFile = (bundle.files || []).find((file) => String(file.path || '') === 'tiinex.package/handoff-closure.json');
  const descriptor = descriptorFile ? parseJsonFile(descriptorFile) : bundle.handoffClosure || null;
  if (!projection) findings.push(finding('error', 'portable.handoff-companion.missing', 'Handoff package is missing a readable transport companion projection.'));
  if (projection && projection.schema !== HANDOFF_TRANSPORT_COMPANION_SCHEMA_ID) findings.push(finding('error', 'portable.handoff-companion.schema.invalid', 'Transport companion projection runtime contract is unsupported.'));
  if (projection && projection.boundary !== 'non-authoritative-disposable-transport-projection') findings.push(finding('error', 'portable.handoff-companion.boundary.invalid', 'Transport companion projection lost its non-authoritative disposable boundary.'));
  if (projection && containsCarrierTopology(projection)) findings.push(finding('error', 'portable.handoff-companion.routing.carrier-topology-leak', 'Transport companion exposes disposable package carrier topology as host routing truth.'));
  if (projection && descriptor) inspectProjectionCorrespondence(projection, descriptor, bundle, findings);
  const errors = findings.filter((item) => item.severity === 'error').length;
  return deepFreeze({ schema: 'tiinex.portable.handoff-transport-companion.inspection.v1', status: errors ? 'invalid' : 'valid', projection, findings: Object.freeze(findings), findingSummary: Object.freeze({ findings: findings.length, errors }) });
}

function qualifyRouting(bundle = {}, descriptor = {}) {
  const manifest = bundle.manifest || parseJsonFile((bundle.files || []).find((file) => String(file.path || '') === 'tiinex.package/manifest.json')) || {};
  const workspaceIds = unique([manifest.workspaceId, manifest.packageScope?.workspaceId].filter(Boolean).map(String));
  const descriptorWorkspaces = descriptor.workspaceMaterializations || [];
  if (!workspaceIds.length && descriptorWorkspaces.length === 1) workspaceIds.push(String(descriptorWorkspaces[0].id || ''));
  if (workspaceIds.length !== 1 || !workspaceIds[0]) return routingResult(workspaceIds.length > 1 ? 'ambiguous' : 'unresolved', workspaceIds[0] || '', '', '', { workspaceCandidates: workspaceIds });
  const workspaceId = workspaceIds[0];
  const workspaceTitle = String(manifest.packageScope?.workspaceTitle || manifest.title || workspaceId);
  const artifactPath = controllingArtifactPath(descriptor.handoff || {});
  if (!artifactPath) return routingResult('unresolved', workspaceId, workspaceTitle, '', { workspaceId, reason: 'controlling-artifact-unqualified' });
  const workspaceMatches = descriptorWorkspaces.filter((item) => String(item.id || '') === workspaceId);
  if (descriptorWorkspaces.length && workspaceMatches.length !== 1) return routingResult(workspaceMatches.length > 1 ? 'ambiguous' : 'unresolved', workspaceId, workspaceTitle, artifactPath, { workspaceId, controllingArtifactPath: artifactPath });
  if (workspaceMatches.length === 1) {
    const workspace = workspaceMatches[0];
    if (String(workspace.qualification || '') !== 'qualified' || String(workspace.correlationStatus || '') !== 'qualified') return routingResult('blocked', workspaceId, workspaceTitle, artifactPath, { workspaceId, controllingArtifactPath: artifactPath });
    const matches = (workspace.includedEntries || []).filter((entry) => normalizeWorkspacePath(entry.path) === artifactPath);
    if (matches.length !== 1) return routingResult(matches.length > 1 ? 'ambiguous' : 'unresolved', workspaceId, workspaceTitle, artifactPath, { workspaceId, controllingArtifactPath: artifactPath });
  } else if (!manifestContainsArtifact(manifest, artifactPath)) {
    return routingResult('unresolved', workspaceId, workspaceTitle, artifactPath, { workspaceId, controllingArtifactPath: artifactPath });
  }
  return routingResult('qualified', workspaceId, workspaceTitle, artifactPath, { workspaceId, controllingArtifactPath: artifactPath });
}

function qualifyParticipation(input = {}) {
  const posture = String(input.transportPosture || input.posture || 'transport-only');
  const transportPosture = Object.freeze({ state: posture === 'transport-only' ? 'qualified' : 'unresolved', id: posture });
  const role = input.actingRole || null;
  let actingRole = Object.freeze({ state: 'none', schemaId: '', reference: '', label: '' });
  if (role) {
    const state = String(role.qualification || role.state || 'unresolved');
    if (state === 'ambiguous') actingRole = Object.freeze({ state: 'ambiguous', schemaId: '', reference: '', label: '' });
    else if (state !== 'qualified') actingRole = Object.freeze({ state: 'unresolved', schemaId: String(role.schemaId || ''), reference: '', label: '' });
    else if (String(role.schemaId || '') !== 'tiinex.party.role.v1' || !exactRoleReference(role.reference)) actingRole = Object.freeze({ state: 'invalid', schemaId: String(role.schemaId || ''), reference: '', label: '' });
    else actingRole = Object.freeze({ state: 'qualified', schemaId: 'tiinex.party.role.v1', reference: String(role.reference), label: String(role.label || '') });
  }
  return deepFreeze({ transportPosture, actingRole, carrierAuthority: 'none', endpointPromotion: false });
}

function inspectProjectionCorrespondence(projection, descriptor, bundle, findings) {
  const expected = buildHandoffTransportCompanionProjection({ bundle, descriptor, packageStatus: bundle.status || descriptor.plan?.status || 'blocked', participation: projectionParticipationInput(projection.participation) });
  if (stableJson(expected.packageState) !== stableJson(projection.packageState)) findings.push(finding('error', 'portable.handoff-companion.package-state.mismatch', 'Transport companion package state diverges from package/closure truth.'));
  if (stableJson(expected.routing) !== stableJson(projection.routing)) findings.push(finding('error', 'portable.handoff-companion.routing.mismatch', 'Transport companion routing diverges from package/closure truth.'));
  if (stableJson(expected.participation) !== stableJson(projection.participation)) findings.push(finding('error', 'portable.handoff-companion.participation.mismatch', 'Transport companion participation projection is internally inconsistent.'));
  if (stableJson(expected.blockers) !== stableJson(projection.blockers)) findings.push(finding('error', 'portable.handoff-companion.blockers.mismatch', 'Transport companion blockers diverge from projected package/routing/participation truth.'));
  if (String(expected.status) !== String(projection.status)) findings.push(finding('error', 'portable.handoff-companion.status.mismatch', 'Transport companion status diverges from projected blocker truth.'));
  if (projection.authority?.semanticAuthority !== 'none' || projection.authority?.carrierEndpointPromotion !== false || projection.authority?.acceptanceAuthority !== false) findings.push(finding('error', 'portable.handoff-companion.authority.promotion', 'Transport companion promotes carrier/projection metadata into semantic authority.'));
}

function projectionParticipationInput(participation = {}) {
  return { transportPosture: participation.transportPosture?.id || 'transport-only', actingRole: participation.actingRole?.state === 'none' ? null : participation.actingRole };
}
function controllingArtifactPath(handoff = {}) {
  for (const raw of [handoff.id, handoff.path]) {
    const path = normalizeWorkspacePath(raw);
    if (isWorkspaceRelativeArtifactPath(path)) return path;
  }
  return '';
}
function isWorkspaceRelativeArtifactPath(path = '') {
  if (!path || path.startsWith('/') || path.startsWith('handoff.workspaces/') || path.startsWith('tiinex.package/')) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path) || path.includes('/../') || path.startsWith('../')) return false;
  return path.includes('/') && /\.trace\.md$/i.test(path);
}
function exactRoleReference(value = '') {
  const ref = String(value || '').trim().replace(/\\/g, '/');
  return Boolean(ref) && !ref.startsWith('handoff.workspaces/') && !ref.includes('/../') && (ref.endsWith('.trace.md') || /^https:\/\//i.test(ref));
}
function manifestContainsArtifact(manifest = {}, artifactPath = '') {
  const material = manifest.material || {};
  const entries = [...(material.localDrafts || []), ...(material.sourceReferences || []), ...(material.workspaceArtifacts || [])];
  return entries.some((entry) => normalizeWorkspacePath(entry.path || entry.sourceArtifactPath) === artifactPath);
}
function routingResult(state, id, title, path, parameters) {
  return deepFreeze({ state, workspace: Object.freeze({ id, title }), controllingArtifact: Object.freeze({ workspaceRelativePath: path }), parameters: Object.freeze(parameters || {}) });
}
function participationParameters(participation) { return Object.freeze({ transportPosture: participation.transportPosture.id, actingRoleState: participation.actingRole.state, actingRoleReference: participation.actingRole.reference || '' }); }
function action(id, localizationKey, parameters) { return Object.freeze({ id, localizationKey, parameters }); }
function disclosure(id, localizationKey, parameters) { return Object.freeze({ id, localizationKey, parameters }); }
function blocker(id, parameters) { return Object.freeze({ id: `tiinex.handoff.transport.blocker.${id}`, localizationKey: `handoff.transport.blocker.${camel(id)}`, parameters: Object.freeze(parameters || {}) }); }
function camel(value = '') { return String(value).replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }
function normalizeWorkspacePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function unique(values = []) { return [...new Set(values.filter(Boolean))]; }
function containsCarrierTopology(value) { return stableJson(value).includes('handoff.workspaces/') || stableJson(value).includes('package://handoff.workspaces/'); }
function parseJsonFile(file = {}) { try { return JSON.parse(new TextDecoder().decode(packageFileBytes(file))); } catch { return null; } }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
