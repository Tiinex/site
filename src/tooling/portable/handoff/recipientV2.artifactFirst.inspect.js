import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { inspectRecipientV2Artifact, parseRecipientV2Pointer, parseRecipientV2Relation } from './recipientV2.artifacts.js';
import { inspectRecipientV2TransportManifest, RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';
import { qualifyPhase1WorkspaceCarriers, PHASE1_COMPLETE_WORKSPACE_ROLE, PHASE1_BOUNDED_WORKSPACE_ROLE } from './recipientV2.artifactFirst.workspaces.js';
import { deriveRecipientV2ArtifactFirstPhase1Facts, parsePhase1Payload, qualifyPhase1BootstrapPayload, qualifyPhase1CachePayload } from './recipientV2.artifactFirst.materials.js';
import { phase1CacheParentCandidates } from './recipientV2.artifactFirst.closure.js';
import { qualifyPhase1RouteBindings, validatePhase1IngressBindings } from './recipientV2.artifactFirst.routes.js';
import { RECIPIENT_V2_READ_PATH, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_SCHEMA_ID, PHASE2_CLEAN_PROFILE, PHASE2_COMPATIBILITY_TRANSPORT, PHASE1_BOOTSTRAP_ROLE, PHASE1_CACHE_ROLE, artifactFirstCarrierFilename, safeToken, currentSchemaId, decodeUtf8, stableJson, deepFreeze, finding } from './recipientV2.artifactFirst.shared.js';

export function inspectRecipientV2ArtifactFirstPhase1Specimen(bundle = {}) {
  const files = Array.isArray(bundle) ? bundle : (bundle.files || []);
  const findings = [];
  const semanticFiles = files.filter((file) => String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  const markdownFiles = semanticFiles.filter((file) => /\.md$/i.test(String(file.path || '')));
  const workspaceWrappers = markdownFiles.filter((file) => currentSchemaId(decodeUtf8(packageFileBytes(file))) === 'tiinex.workspace.v1');
  if (workspaceWrappers.length) findings.push(finding('error', 'portable.handoff-v2-phase1.workspace-wrapper.present', 'Phase 1 artifact-first specimen must not generate an outer Workspace wrapper.', { count: workspaceWrappers.length }));

  const factsByPath = deriveRecipientV2ArtifactFirstPhase1Facts(semanticFiles);
  const qualified = markdownFiles.map((file) => inspectRecipientV2Artifact(file, { facts: factsByPath.get(String(file.path || '')) || null }));
  for (const item of qualified) findings.push(...(item.findings || []));

  const pointers = qualified.filter((item) => item.schemaId === 'tiinex.pointer.v1').map((item) => ({ ...item, parsed: parseRecipientV2Pointer(item.markdown) }));
  const payloads = qualified.filter((item) => item.schemaId === 'tiinex.external.payload.v1').map((item) => ({ ...item, parsed: parsePhase1Payload(item.markdown) }));
  const relations = qualified.filter((item) => item.schemaId === 'tiinex.relation.v1').map((item) => ({ ...item, parsed: parseRecipientV2Relation(item.markdown) }));
  const ingress = pointers.filter((item) => item.path === RECIPIENT_V2_READ_PATH && item.parsed.role === 'recovery-orientation');
  const routes = pointers.filter((item) => item.parsed.role === 'handoff-route');
  const endpointPointers = pointers.filter((item) => item.parsed.role === 'endpoint-role');
  const participantPointers = pointers.filter((item) => item.parsed.role === 'participant-role');
  const workspacePayloads = payloads.filter((item) => [PHASE1_COMPLETE_WORKSPACE_ROLE, PHASE1_BOUNDED_WORKSPACE_ROLE].includes(item.parsed.payloadRole));
  const bootstrapPayloads = payloads.filter((item) => item.parsed.payloadRole === PHASE1_BOOTSTRAP_ROLE);
  const cachePayloads = payloads.filter((item) => item.parsed.payloadRole === PHASE1_CACHE_ROLE);
  const unknownPayloads = payloads.filter((item) => ![PHASE1_COMPLETE_WORKSPACE_ROLE, PHASE1_BOUNDED_WORKSPACE_ROLE, PHASE1_BOOTSTRAP_ROLE, PHASE1_CACHE_ROLE].includes(item.parsed.payloadRole));
  if (ingress.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.count', 'Phase 1 specimen requires exactly one ingress Pointer.', { count: ingress.length }));
  if (!routes.length) findings.push(finding('error', 'portable.handoff-v2-phase1.route.count', 'Artifact-first specimen requires at least one visible Handoff route Pointer.', { count: routes.length }));
  if (!workspacePayloads.length) findings.push(finding('error', 'portable.handoff-v2-phase1.payload.workspace-count', 'Artifact-first full-source carriage requires at least one Workspace External Payload artifact.', { count: workspacePayloads.length }));
  if (bootstrapPayloads.length > 1) findings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.count', 'A carried portable Tooling bootstrap must have exactly one owning External Payload artifact.', { count: bootstrapPayloads.length }));
  if (cachePayloads.length > 1) findings.push(finding('error', 'portable.handoff-v2-phase1.cache.count', 'A selected Workspace may expose at most one selected-route dependency cache External Payload.', { count: cachePayloads.length }));
  if (unknownPayloads.length) findings.push(finding('error', 'portable.handoff-v2-phase1.payload.unclassified', 'Phase 1 specimen contains an External Payload artifact outside the bounded Workspace/bootstrap/cache ownership subset.', { count: unknownPayloads.length }));
  if (!relations.length) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.count', 'Artifact-first full-source carriage requires a typed material-representation Relation for every carried Workspace.', { count: relations.length }));
  if (markdownFiles.some((file) => factsByPath.get(String(file.path || ''))?.role === 'package-root')) findings.push(finding('error', 'portable.handoff-v2-phase1.package-root.present', 'Phase 1 specimen must not use a package-root Pointer as receiver semantic authority.'));

  const bootstrapPayload = bootstrapPayloads[0] || null;
  const ingressPointer = ingress[0];
  const selectedRouteIdFromIngress = String(ingressPointer?.parsed?.selectedRouteId || '');
  const bootstrapQualification = bootstrapPayload ? qualifyPhase1BootstrapPayload(bootstrapPayload, semanticFiles, findings) : null;
  const cacheQualifications = cachePayloads.map((item) => qualifyPhase1CachePayload(item, semanticFiles, findings));
  const recoveryParentCandidates = phase1CacheParentCandidates(cacheQualifications);
  const workspaceQualificationList = qualifyPhase1WorkspaceCarriers({ workspacePayloads, relations, semanticFiles, recoveryParentCandidates, findings });
  const workspaceQualifications = new Map(workspaceQualificationList.map((item) => [String(item.workspaceId || ''), item]));
  const endpointRoleQualifications = [];
  const participantRoleQualifications = [];
  const rolePointers = [...endpointPointers, ...participantPointers];
  const boundRolePaths = new Set();
  const routeQualifications = [];

  qualifyPhase1RouteBindings({
    routes, workspaceQualifications, findings, recoveryParentCandidates, selectedRouteIdFromIngress, cacheQualifications, rolePointers, endpointPointers, participantPointers, cachePayloads, endpointRoleQualifications, participantRoleQualifications, boundRolePaths, routeQualifications
  });

  validatePhase1IngressBindings({ workspaceQualificationList, ingressPointer, routes, bootstrapPayload, cachePayloads, rolePointers, boundRolePaths, findings });

  if (ingressPointer) {
    const candidateCount = Number(ingressPointer.parsed.candidateRouteCount || 0);
    const selectedRouteId = String(ingressPointer.parsed.selectedRouteId || '');
    const mode = String(ingressPointer.parsed.routeSelection || '');
    if (candidateCount < 1) findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.candidate-count-missing', 'Ingress Pointer must preserve the qualified candidate-route count used for artifact-first selection.'));
    if (candidateCount !== routes.length) findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.candidate-count-mismatch', 'Ingress candidate-route count must equal the complete visible shared route set.', { candidateCount, visibleRouteCount: routes.length }));
    if (candidateCount > 1 && mode !== 'explicit-qualified-route-selector') findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.explicit-required', 'More than one qualified source Handoff route requires one explicit default recipient route selector.'));
    if (candidateCount === 1 && mode !== 'implicit-single-qualified-route' && mode !== 'explicit-qualified-route-selector') findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.mode-invalid', 'Single-route artifact-first selection mode is unsupported.', { mode }));
    const selectedMatches = routeQualifications.filter((item) => item.routeId === selectedRouteId);
    if (!selectedRouteId || selectedMatches.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.binding-mismatch', 'Ingress route selection must bind exactly one member of the complete visible shared route set.', { selectedRouteId, matches: selectedMatches.length }));
  }

  const selectedRouteQualification = routeQualifications.find((item) => item.routeId === selectedRouteIdFromIngress) || routeQualifications[0] || null;
  const payload = selectedRouteQualification?.payload || null;
  const relation = selectedRouteQualification?.relation || null;
  const route = selectedRouteQualification?.route || null;
  const routeEntry = selectedRouteQualification?.routeEntry || null;
  const routeConformance = selectedRouteQualification?.routeConformance || null;
  const requiredClosure = selectedRouteQualification?.requiredClosure || Object.freeze({ state: 'blocked', requiredCount: 0, qualifiedCount: 0, requirements: Object.freeze([]) });
  const workspaceTargetQualification = selectedRouteQualification?.workspaceTargetQualification || null;
  const semanticStatus = findings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified';
  const cleanCarrierPhase2 = Boolean(
    ingressPointer
    && ingressPointer.parsed.carrierProfile === PHASE2_CLEAN_PROFILE
    && ingressPointer.parsed.compatibilityTransport === PHASE2_COMPATIBILITY_TRANSPORT
  );
  if (ingressPointer && (Boolean(ingressPointer.parsed.carrierProfile) !== Boolean(ingressPointer.parsed.compatibilityTransport))) findings.push(finding('error', 'portable.handoff-v2-phase2.clean-profile.incomplete', 'Clean-carrier profile and compatibility-transport declaration must appear together on the visible ingress Pointer.'));
  if (ingressPointer?.parsed?.carrierProfile && ingressPointer.parsed.carrierProfile !== PHASE2_CLEAN_PROFILE) findings.push(finding('error', 'portable.handoff-v2-phase2.clean-profile.unsupported', 'Artifact-first ingress declares an unsupported clean-carrier profile.', { profile: ingressPointer.parsed.carrierProfile }));
  if (ingressPointer?.parsed?.compatibilityTransport && ingressPointer.parsed.compatibilityTransport !== PHASE2_COMPATIBILITY_TRANSPORT) findings.push(finding('error', 'portable.handoff-v2-phase2.compatibility-transport.unsupported', 'Artifact-first ingress declares an unsupported compatibility-transport mode.', { mode: ingressPointer.parsed.compatibilityTransport }));
  const transport = inspectRecipientV2TransportManifest(files);
  const compatibilityFindings = [...(transport.findings || [])];
  let compatibilityStatus = transport.state;
  if (cleanCarrierPhase2) {
    if (transport.state !== 'absent') compatibilityFindings.push(finding('error', 'portable.handoff-v2-phase2.compatibility.present', 'Clean-carrier Phase 2 profile must omit stored compatibility JSON; visible semantic artifacts and exact payload bytes are the complete receiver truth surface.'));
    compatibilityStatus = compatibilityFindings.some((item) => item.severity === 'error') ? 'invalid' : 'omitted-qualified';
  } else if (transport.state === 'valid') {
    if (String(transport.manifest?.format || '') !== RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID) compatibilityFindings.push(finding('error', 'portable.handoff-v2-phase1.compatibility.format-mismatch', 'Compatibility JSON format does not identify the Phase 1 artifact-first specimen.'));
    const declaredFacts = transport.factsByPath || new Map();
    for (const [path, facts] of factsByPath) if (stableJson(declaredFacts.get(path) || null) !== stableJson(facts)) compatibilityFindings.push(finding('error', 'portable.handoff-v2-phase1.compatibility.not-derived', 'Compatibility JSON facts diverge from facts re-derived from visible semantic artifacts.', { path }));
    compatibilityStatus = compatibilityFindings.some((item) => item.severity === 'error') ? 'invalid' : 'valid';
  }
  const finalSemanticStatus = findings.some((item) => item.severity === 'error') ? 'blocked' : semanticStatus;
  const status = finalSemanticStatus === 'qualified' && (cleanCarrierPhase2 ? compatibilityStatus === 'omitted-qualified' : compatibilityStatus === 'valid') ? 'ready' : 'blocked';
  const workspaceId = String(selectedRouteQualification?.workspaceId || payload?.parsed?.workspaceId || relation?.parsed?.targetWorkspaceId || route?.parsed?.workspaceId || '');
  const lineage = ingressPointer ? Object.freeze({
    mode: ingressPointer.parsed.carrierDimension?.includes('-') ? 'continue' : 'root',
    dimension: String(ingressPointer.parsed.carrierDimension || ''),
    parentDimension: String(ingressPointer.parsed.parentCarrierDimension || ''),
    checkpointKind: String(ingressPointer.parsed.carrierCheckpoint || '')
  }) : Object.freeze({ mode: '', dimension: '', parentDimension: '', checkpointKind: '' });
  const carrierRoutes = routeQualifications.map((item) => item.route && item.routeEntry ? Object.freeze({
    id: item.routeId,
    workspaceId: item.workspaceId,
    state: item.reasons.length ? 'blocked' : 'qualified',
    workspaceRelativePath: String(item.route.parsed.handoffWorkspacePath || ''),
    packagePath: String(item.payload?.parsed?.location || ''),
    providerMode: 'archive',
    archivePackagePath: String(item.payload?.parsed?.location || ''),
    sha256: String(item.routeEntry.sha256 || ''),
    dimension: String(lineage.dimension || ''),
    parties: item.routeParties,
    purpose: '',
    projectedFilename: artifactFirstCarrierFilename(item.workspaceId, lineage.dimension, item.routeParties.from, item.routeParties.to),
    conformance: item.routeConformance,
    requiredClosure: item.requiredClosure,
    endpointRolePointers: Object.freeze(item.endpointRoles.filter((role) => role.state === 'qualified').map((role) => role.pointerPath)),
    participantRolePointers: Object.freeze(item.participantRoles.filter((role) => role.state === 'qualified').map((role) => role.pointerPath)),
    reasons: item.reasons,
    authority: Object.freeze({ artifactPartiesAuthoritative: true, dimensionSemanticAuthority: false, filenameSemanticAuthority: false })
  }) : null).filter(Boolean);
  const selectedRouteId = String(selectedRouteIdFromIngress || selectedRouteQualification?.routeId || '');
  const selectedCarrierRoute = carrierRoutes.find((item) => item.id === selectedRouteId) || null;
  const selectedWorkspaceQualification = workspaceQualifications.get(workspaceId) || null;
  const sourceCandidateRouteCount = Number(ingressPointer?.parsed?.candidateRouteCount || 0);
  const sourceSelectionMode = String(ingressPointer?.parsed?.routeSelection || '');
  const selectionPolicy = sourceCandidateRouteCount > 1 || sourceSelectionMode === 'explicit-qualified-route-selector'
    ? 'explicit-qualified-route-bound'
    : 'implicit-single-qualified-route';
  const qualifiedRouteCount = carrierRoutes.filter((item) => item.state === 'qualified').length;
  const allVisibleRoutesQualified = carrierRoutes.length === routeQualifications.length && qualifiedRouteCount === carrierRoutes.length;
  const carrierProjection = deepFreeze({
    schema: 'tiinex.portable.handoff-carrier-projection.v1',
    version: 1,
    status: finalSemanticStatus === 'qualified' && allVisibleRoutesQualified && selectedCarrierRoute?.state === 'qualified' ? 'ready' : 'blocked',
    mode: routeQualifications.length > 1 ? 'shared' : 'single',
    lineage,
    workspaces: Object.freeze(workspaceQualificationList.map((item) => Object.freeze({ id: item.workspaceId, title: item.workspaceId, slug: safeToken(item.workspaceId), qualification: item.workspaceTargetQualification?.state === 'qualified' ? 'qualified' : 'blocked' }))),
    workspace: workspaceId ? Object.freeze({ id: workspaceId, title: workspaceId, slug: safeToken(workspaceId), qualification: selectedWorkspaceQualification?.workspaceTargetQualification?.state === 'qualified' ? 'qualified' : 'blocked' }) : Object.freeze({ id: '', title: '', slug: '', qualification: 'unresolved' }),
    selection: Object.freeze({ policy: selectionPolicy, qualifiedRouteCount, sourceCandidateRouteCount, selectedRouteId }),
    routes: Object.freeze(carrierRoutes),
    authority: Object.freeze({ semanticAuthority: 'none', filenameAuthority: false, dimensionalParentAuthority: false, routeSelectionAuthority: 'qualified-visible-route-pointer-plus-exact-handoff-bytes' }),
    findings: Object.freeze([])
  });
  const coldConsumerProjection = deepFreeze({
    schema: 'tiinex.portable.handoff-cold-consumer-projection.v1',
    version: 1,
    status: carrierProjection.status,
    workspaces: carrierProjection.workspaces,
    routes: Object.freeze(carrierProjection.routes.map((item) => Object.freeze({ id: item.id, state: item.state, workspaceId: item.workspaceId, workspaceRelativeHandoffPath: item.workspaceRelativePath, packagePath: item.packagePath, sha256: item.sha256, from: item.parties?.from || '', to: item.parties?.to || '', endpointRolePointers: Object.freeze(item.endpointRolePointers || []), participantRolePointers: Object.freeze(item.participantRolePointers || []) }))),
    selection: Object.freeze({ policy: carrierProjection.selection.policy, qualifiedRouteCount: carrierProjection.selection.qualifiedRouteCount, implicitRouteId: carrierProjection.routes.length === 1 && carrierProjection.routes[0].state === 'qualified' ? carrierProjection.routes[0].id : '' }),
    authority: Object.freeze({ semanticAuthority: 'none', packageTruthRequired: true, routeBindingAuthority: 'visible-route-pointer-plus-exact-payload-and-handoff-bytes' })
  });
  const format = cleanCarrierPhase2 ? RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID : RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID;
  return deepFreeze({
    schema: cleanCarrierPhase2 ? RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_SCHEMA_ID : RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID,
    format,
    cleanCarrierPhase2,
    status,
    semanticStatus: finalSemanticStatus,
    compatibilityStatus,
    workspaceId,
    coverage: payload?.parsed?.payloadRole === PHASE1_BOUNDED_WORKSPACE_ROLE ? 'bounded' : 'complete',
    handoffWorkspacePath: String(route?.parsed?.handoffWorkspacePath || ''),
    workspaceTargetQualification,
    routeEntry: routeEntry ? Object.freeze({ path: routeEntry.path, bytes: routeEntry.bytes, sha256: routeEntry.sha256 }) : null,
    routeConformance,
    requiredClosure,
    bootstrapQualification,
    workspaces: Object.freeze(workspaceQualificationList.map((item) => Object.freeze({ workspaceId: item.workspaceId, payloadArtifactPath: item.payload.path, representationArtifactPath: item.relation.path, archivePath: item.payload.parsed.location, coverage: item.payload.parsed.payloadRole === PHASE1_BOUNDED_WORKSPACE_ROLE ? 'bounded' : 'complete', workspaceTargetQualification: item.workspaceTargetQualification }))),
    caches: Object.freeze(cacheQualifications.map((item) => Object.freeze({ workspaceId: item.workspaceId, artifactPath: item.artifactPath, archivePath: item.payloadPath, materials: item.materials }))),
    endpointRoles: Object.freeze(endpointRoleQualifications.filter((item) => item.state === 'qualified').map((item) => Object.freeze({ pointerPath: item.pointerPath, workspaceId: item.workspaceId, routeId: item.routeId, requirementId: item.requirementId, endpointParty: item.endpointParty, roleLabelHint: item.roleLabelHint, referenceTarget: item.referenceTarget, targetCarrierKind: item.targetCarrierKind, targetWorkspaceId: item.targetWorkspaceId, archivePath: item.archivePath, targetInnerPath: item.targetInnerPath, targetArchiveEntry: item.targetArchiveEntry, targetBytes: item.targetBytes, targetSha256: item.targetSha256 }))),
    participantRoles: Object.freeze(participantRoleQualifications.filter((item) => item.state === 'qualified').map((item) => Object.freeze({ pointerPath: item.pointerPath, workspaceId: item.workspaceId, routeId: item.routeId, requirementId: item.requirementId, roleLabelHint: item.roleLabelHint, referenceTarget: item.referenceTarget, targetCarrierKind: item.targetCarrierKind, targetWorkspaceId: item.targetWorkspaceId, archivePath: item.archivePath, targetInnerPath: item.targetInnerPath, targetArchiveEntry: item.targetArchiveEntry, targetBytes: item.targetBytes, targetSha256: item.targetSha256 }))),
    routeSelection: ingressPointer ? Object.freeze({ mode: String(ingressPointer.parsed.routeSelection || ''), selectedRouteId: String(ingressPointer.parsed.selectedRouteId || ''), candidateCount: Number(ingressPointer.parsed.candidateRouteCount || 0) }) : null,
    carrierProjection,
    coldConsumerProjection,
    transportManifest: transport.state === 'absent' ? null : Object.freeze({ state: transport.state, path: RECIPIENT_V2_TRANSPORT_MANIFEST_PATH, sha256: transport.file ? sha256Hex(packageFileBytes(transport.file)) : '' }),
    semanticFactsByPath: factsByPath,
    findings: Object.freeze([...findings, ...compatibilityFindings]),
    boundary: cleanCarrierPhase2
      ? 'Artifact-first Phase 2 clean-carrier qualification reconstructs receiver truth only from visible semantic artifacts plus exact payload bytes and requires stored compatibility JSON to be absent.'
      : 'Artifact-first Phase 1 qualification keeps semantic receiver artifacts independently qualifiable from compatibility JSON. Phase 1 still requires the derived JSON projection for interoperability, but it is not receiver semantic authority.'
  });
}
