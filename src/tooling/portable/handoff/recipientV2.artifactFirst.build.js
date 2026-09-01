import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { renderRecipientV2ExternalPayload, renderRecipientV2Pointer } from './recipientV2.artifacts.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { buildRecipientV2TransportManifestFile } from './recipientV2.transportManifest.js';
import { buildPhase1WorkspaceCarriers } from './recipientV2.artifactFirst.workspaces.js';
import { buildPhase1RolePointers } from './recipientV2.artifactFirst.roles.js';
import { deriveRecipientV2ArtifactFirstPhase1Facts } from './recipientV2.artifactFirst.materials.js';
import { inspectRecipientV2ArtifactFirstPhase1Specimen } from './recipientV2.artifactFirst.inspect.js';
import { RECIPIENT_V2_READ_PATH, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_SCHEMA_ID, PHASE2_CLEAN_PROFILE, PHASE2_COMPATIBILITY_TRANSPORT, PHASE1_BOOTSTRAP_ROLE, PHASE1_CACHE_ROLE, normalizeRoutePath, cacheMaterialBelongsToRoute, sortedQualifiedCarrierRoutes, selectOne, oneFile, repathFinalizedFile, phase1RoutePointerPath, phase1RolePathPrefix, blocked, finding, deepFreeze } from './recipientV2.artifactFirst.shared.js';

export function buildRecipientV2ArtifactFirstPhase1Specimen(input = {}) {
  const cleanCarrierPhase2 = input.cleanCarrierPhase2 === true;
  const formatId = cleanCarrierPhase2 ? RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID : RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID;
  const resultSchemaId = cleanCarrierPhase2 ? RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_SCHEMA_ID : RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID;
  const sourceBundle = input.bundle || {};
  const sourceInspection = input.inspection || inspectRecipientFacingV2Topology(sourceBundle);
  const findings = [];
  if (sourceInspection.status !== 'valid') return blocked('source-recipient-unqualified', sourceInspection.findings || []);

  const workspace = selectOne(sourceInspection.workspaces || [], input.workspaceId, 'workspace', findings);
  if (!workspace) return blocked('workspace-selection-blocked', findings);
  const routes = (sourceInspection.routes || []).filter((item) => String(item.workspaceId || '') === String(workspace.workspaceId || ''));
  const route = selectOne(routes, input.routePath || '', 'route', findings, (item) => String(item.workspaceRelativeHandoffPath || ''));
  if (!route) return blocked('route-selection-blocked', findings);

  const sourceCarrierRoute = (sourceInspection.carrierProjection?.routes || []).find((item) => String(item.workspaceId || '') === String(workspace.workspaceId || '') && String(item.workspaceRelativePath || '') === String(route.workspaceRelativeHandoffPath || '')) || null;
  const sourceRouteInspection = (sourceInspection.routes || []).find((item) => String(item.workspaceId || '') === String(workspace.workspaceId || '') && String(item.workspaceRelativeHandoffPath || '') === String(route.workspaceRelativeHandoffPath || '')) || null;
  const sourceFactsByPath = new Map((sourceInspection.artifactFacts || []).map((item) => [String(item.path || ''), item.facts || null]));
  const selectedRouteId = String(input.routeSelection?.route?.id || sourceCarrierRoute?.id || `handoff-route:${String(workspace.workspaceId || '')}:${String(route.workspaceRelativeHandoffPath || '')}`);
  const routeSelection = Object.freeze({
    mode: String(input.routeSelection?.mode || 'implicit-single-qualified-route'),
    selector: String(input.routeSelection?.selector || ''),
    candidateCount: Number(input.routeSelection?.candidateCount || 1),
    selectedRouteId
  });
  const lineage = sourceInspection.carrierProjection?.lineage || {};
  const createdAt = input.createdAt || sourceBundle.manifest?.createdAt || sourceBundle.builtAt || '1970-01-01T00:00:00.000Z';
  const workspaceId = String(workspace.workspaceId || 'workspace');
  const workspaceBuild = buildPhase1WorkspaceCarriers({
    sourceInspection,
    sourceBundle,
    selectedWorkspaceId: workspaceId,
    createdAt
  });
  if (workspaceBuild.state !== 'qualified') return blocked('workspace-carriage-blocked', workspaceBuild.findings || []);
  const workspaceCarriers = [...workspaceBuild.carriers];
  const selectedWorkspaceCarrier = workspaceCarriers.find((item) => item.selected) || null;
  if (!selectedWorkspaceCarrier) return blocked('workspace-selection-blocked', [finding('error', 'portable.handoff-v2-phase1.workspace.selection', 'Selected route Workspace has no artifact-first carrier representation.', { workspaceId })]);
  const { archivePath, payloadArtifactPath, relationArtifactPath, archiveFile, payloadArtifact, relationArtifact } = selectedWorkspaceCarrier;
  const sourceCarrierRoutes = sortedQualifiedCarrierRoutes(sourceInspection.carrierProjection?.routes || [], selectedRouteId);
  const routePlans = sourceCarrierRoutes.map((carrierRoute, index) => {
    const routeWorkspaceId = String(carrierRoute.workspaceId || '');
    const workspaceRelativeHandoffPath = String(carrierRoute.workspaceRelativePath || '');
    const routeId = String(carrierRoute.id || `handoff-route:${routeWorkspaceId}:${workspaceRelativeHandoffPath}`);
    const sourceRoute = (sourceInspection.routes || []).find((item) => String(item.workspaceId || '') === routeWorkspaceId && normalizeRoutePath(item.workspaceRelativeHandoffPath || '') === normalizeRoutePath(workspaceRelativeHandoffPath)) || null;
    const workspaceCarrier = workspaceCarriers.find((item) => String(item.workspaceId || '') === routeWorkspaceId) || null;
    return Object.freeze({
      routeId,
      carrierRoute,
      sourceRoute,
      workspaceCarrier,
      workspaceId: routeWorkspaceId,
      workspaceRelativeHandoffPath,
      pointerPath: phase1RoutePointerPath(carrierRoute, index, sourceCarrierRoutes.length, selectedRouteId),
      rolePathPrefix: phase1RolePathPrefix(carrierRoute, index, sourceCarrierRoutes.length, selectedRouteId)
    });
  });
  const unresolvedRoutePlans = routePlans.filter((plan) => !plan.sourceRoute || !plan.workspaceCarrier);
  if (!routePlans.length || unresolvedRoutePlans.length) return blocked('shared-route-source-unresolved', [finding('error', 'portable.handoff-v2-phase1.shared-route.source-unresolved', 'Every qualified source route must resolve one exact source route inspection and one carried Workspace payload.', { routeCount: routePlans.length, unresolvedRouteIds: unresolvedRoutePlans.map((item) => item.routeId) })]);
  const selectedRoutePlan = routePlans.find((plan) => plan.routeId === selectedRouteId) || null;
  if (!selectedRoutePlan) return blocked('route-selection-blocked', [finding('error', 'portable.handoff-v2-phase1.route-selection.binding-unresolved', 'Selected artifact-first route must remain one exact member of the carried shared route set.', { selectedRouteId })]);

  const bootstrapSourcePath = String(input.bootstrap?.payloadPath || '');
  const bootstrapSource = bootstrapSourcePath ? oneFile(sourceBundle.files || [], bootstrapSourcePath) : null;
  if (bootstrapSourcePath && !bootstrapSource) return blocked('bootstrap-payload-unresolved', [finding('error', 'portable.handoff-v2-phase1.bootstrap.source-unresolved', 'Carried portable Tooling bootstrap payload is unavailable in the qualified source carrier.', { path: bootstrapSourcePath })]);
  const bootstrapArchivePath = bootstrapSource ? '001-2-bootstrap.zip' : '';
  const bootstrapArtifactPath = bootstrapSource ? '001-2-bootstrap.trace.md' : '';
  const bootstrapArchiveFile = bootstrapSource ? repathFinalizedFile(bootstrapSource, bootstrapArchivePath, {
    kind: 'handoff-tooling-bootstrap-archive',
    logicalKind: 'recipient-v2-phase1-tooling-bootstrap-payload',
    mediaType: 'application/zip',
    boundary: 'Exact portable Tooling bootstrap bytes owned by one visible External Payload artifact; navigation and package placement create no Parent or package authority.'
  }) : null;
  const bootstrapArtifact = bootstrapArchiveFile ? finalizeFile({
    path: bootstrapArtifactPath,
    kind: 'tiinex-external-payload-artifact',
    logicalKind: 'recipient-v2-phase1-tooling-bootstrap-reference',
    mediaType: 'text/markdown',
    content: renderRecipientV2ExternalPayload({
      artifactFirst: true,
      createdAt,
      title: 'Portable Tooling Bootstrap Payload',
      summary: 'Artifact-first Phase 1 exact portable Tooling bootstrap payload.',
      label: 'portable Tooling bootstrap runtime',
      kind: 'zip export',
      role: PHASE1_BOOTSTRAP_ROLE,
      location: bootstrapArchivePath,
      bytes: bootstrapArchiveFile.bytes,
      sha256: bootstrapArchiveFile.sha256
    })
  }) : null;

  const sourceCache = (sourceInspection.caches || []).find((item) => String(item.workspaceId || '') === workspaceId) || null;
  const selectedCacheMaterials = sourceCache ? (sourceCache.materials || []).filter((item) => cacheMaterialBelongsToRoute(item, workspaceId, route.workspaceRelativeHandoffPath)) : [];
  const siblingDetachedMaterials = routePlans
    .filter((plan) => plan.routeId !== selectedRouteId)
    .flatMap((plan) => (sourceInspection.caches || []).flatMap((cache) => (cache.materials || []).filter((item) => cacheMaterialBelongsToRoute(item, plan.workspaceId, plan.workspaceRelativeHandoffPath))));
  if (siblingDetachedMaterials.length) return blocked('shared-route-detached-cache-unsupported', [finding('error', 'portable.handoff-v2-phase1.shared-route.detached-cache-unsupported', 'Shared artifact-first carriage currently supports detached cache material only for the explicitly selected route; sibling routes must resolve closure from carried Workspace source.', { count: siblingDetachedMaterials.length })]);
  let cacheArtifact = null;
  let cacheArchiveFile = null;
  let cacheProjection = null;
  if (selectedCacheMaterials.length) {
    const sourceCacheArchive = oneFile(sourceBundle.files || [], sourceCache.archivePath);
    if (!sourceCacheArchive) return blocked('cache-source-unresolved', [finding('error', 'portable.handoff-v2-phase1.cache.source-unresolved', 'Selected-route detached cache archive is unavailable in the qualified source carrier.', { path: sourceCache.archivePath })]);
    const sourceCacheInspection = inspectStoredWorkspaceArchive(packageFileBytes(sourceCacheArchive), { ownedBytes: true });
    if (sourceCacheInspection.state !== 'qualified') return blocked('cache-source-invalid', [finding('error', 'portable.handoff-v2-phase1.cache.source-invalid', 'Selected-route detached cache archive did not independently qualify.', { path: sourceCache.archivePath, findings: sourceCacheInspection.findings || [] })]);
    const selectedEntries = [];
    const materialBindings = [];
    for (const material of selectedCacheMaterials) {
      const archiveEntry = String(material.archiveEntry || '');
      const matches = sourceCacheInspection.entries.filter((entry) => String(entry.path || '') === archiveEntry);
      if (matches.length !== 1) return blocked('cache-material-unresolved', [finding('error', 'portable.handoff-v2-phase1.cache.material-unresolved', 'Selected-route cache material must resolve exactly one source cache entry.', { requirementId: String(material.requirementId || ''), referenceTarget: String(material.referenceTarget || ''), archiveEntry, count: matches.length })]);
      selectedEntries.push({ path: archiveEntry, data: matches[0].data });
      materialBindings.push(Object.freeze({ requirementId: String(material.requirementId || ''), classification: String(material.classification || ''), referenceTarget: String(material.referenceTarget || ''), archiveEntry }));
    }
    const cacheArchivePath = '001-5-cache.zip';
    const cacheArtifactPath = '001-5-cache.trace.md';
    cacheArchiveFile = finalizeFile({
      path: cacheArchivePath,
      kind: 'handoff-material-cache',
      logicalKind: 'recipient-v2-phase1-workspace-dependency-cache',
      mediaType: 'application/zip',
      data: exportFileMapZipUint8Array(selectedEntries, 'portable.handoff-v2-phase1.cache.path.invalid'),
      boundary: 'Exact selected-route detached dependency bytes owned by the visible cache External Payload artifact. Cache location and compatibility JSON are not semantic authority.'
    });
    cacheArtifact = finalizeFile({
      path: cacheArtifactPath,
      kind: 'tiinex-external-payload-artifact',
      logicalKind: 'recipient-v2-phase1-workspace-dependency-cache-reference',
      mediaType: 'text/markdown',
      content: renderRecipientV2ExternalPayload({
        artifactFirst: true,
        createdAt,
        workspaceId,
        title: `Workspace Dependency Cache — ${workspaceId}`,
        summary: 'Artifact-first Phase 1 exact selected-route dependency bytes absent from the qualified Workspace payload.',
        label: `${workspaceId} selected-route Handoff dependency cache`,
        kind: 'zip export',
        role: PHASE1_CACHE_ROLE,
        location: cacheArchivePath,
        bytes: cacheArchiveFile.bytes,
        sha256: cacheArchiveFile.sha256,
        materials: materialBindings
      })
    });
    cacheProjection = Object.freeze({ workspaceId, artifactPath: cacheArtifactPath, archivePath: cacheArchivePath, materials: Object.freeze(materialBindings) });
  }

  const endpointRoleArtifacts = [];
  const participantRoleArtifacts = [];
  const endpointRoleProjections = [];
  const participantRoleProjections = [];
  const routePointers = [];
  const routeTopology = [];
  for (const plan of routePlans) {
    const ownsSelectedCache = plan.routeId === selectedRouteId;
    const endpointRoleBuild = buildPhase1RolePointers({
      kind: 'endpoint',
      sourcePointerPaths: plan.sourceRoute?.endpointRolePointers || [],
      sourceFactsByPath,
      workspaceCarriers,
      cacheArtifact: ownsSelectedCache ? cacheArtifact : null,
      selectedCacheMaterials: ownsSelectedCache ? selectedCacheMaterials : [],
      routeWorkspaceId: plan.workspaceId,
      selectedRouteId: plan.routeId,
      pathPrefix: plan.rolePathPrefix,
      createdAt
    });
    const participantRoleBuild = buildPhase1RolePointers({
      kind: 'participant',
      sourcePointerPaths: plan.sourceRoute?.participantRolePointers || [],
      sourceFactsByPath,
      workspaceCarriers,
      cacheArtifact: ownsSelectedCache ? cacheArtifact : null,
      selectedCacheMaterials: ownsSelectedCache ? selectedCacheMaterials : [],
      routeWorkspaceId: plan.workspaceId,
      selectedRouteId: plan.routeId,
      pathPrefix: plan.rolePathPrefix,
      createdAt
    });
    const roleBuildFindings = [...endpointRoleBuild.findings, ...participantRoleBuild.findings];
    if (roleBuildFindings.some((item) => item.severity === 'error')) return blocked('role-pointer-build-blocked', roleBuildFindings);
    endpointRoleArtifacts.push(...endpointRoleBuild.artifacts);
    participantRoleArtifacts.push(...participantRoleBuild.artifacts);
    endpointRoleProjections.push(...endpointRoleBuild.projections);
    participantRoleProjections.push(...participantRoleBuild.projections);
    const routePointer = finalizeFile({
      path: plan.pointerPath,
      kind: 'handoff-route-pointer',
      logicalKind: 'recipient-v2-phase1-handoff-route-pointer',
      mediaType: 'text/markdown',
      content: renderRecipientV2Pointer({
        artifactFirst: true,
        createdAt,
        role: 'handoff-route',
        title: `Handoff Route Pointer — ${plan.workspaceId}`,
        summary: 'Artifact-first navigation pointer to one exact Handoff path inside an explicitly owned Workspace payload.',
        prose: 'This Pointer identifies navigation coordinates only. The exact Handoff artifact inside the Workspace payload remains the Handoff authority.',
        currentRead: [
          { label: 'Workspace Id', value: `\`${plan.workspaceId}\`` },
          { label: 'Workspace Payload', value: `[payload](${plan.workspaceCarrier.payloadArtifactPath})` },
          { label: 'Handoff Workspace Path', value: `\`${plan.workspaceRelativeHandoffPath}\`` },
          { label: 'Route Id', value: `\`${plan.routeId}\`` }
        ],
        destinations: [
          { label: 'Workspace payload artifact', target: plan.workspaceCarrier.payloadArtifactPath },
          ...endpointRoleBuild.artifacts.map((item) => ({ label: 'Endpoint Role pointer', target: item.path })),
          ...participantRoleBuild.artifacts.map((item) => ({ label: 'Participant Role pointer', target: item.path }))
        ]
      })
    });
    routePointers.push(routePointer);
    routeTopology.push(Object.freeze({ pointerPath: plan.pointerPath, workspaceId: plan.workspaceId, workspaceRelativeHandoffPath: plan.workspaceRelativeHandoffPath, routeId: plan.routeId, endpointRolePointers: Object.freeze(endpointRoleBuild.projections.map((item) => item.pointerPath)), participantRolePointers: Object.freeze(participantRoleBuild.projections.map((item) => item.pointerPath)) }));
  }
  const selectedRoutePointerPath = selectedRoutePlan.pointerPath;

  const ingressCurrentRead = [
    { label: 'Workspace Id', value: `\`${workspaceId}\`` },
    { label: 'Workspace Payload', value: `[payload](${payloadArtifactPath})` },
    ...(cleanCarrierPhase2 ? [
      { label: 'Carrier Profile', value: PHASE2_CLEAN_PROFILE },
      { label: 'Compatibility Transport', value: PHASE2_COMPATIBILITY_TRANSPORT }
    ] : []),
    { label: 'Route Selection', value: routeSelection.mode },
    { label: 'Selected Route Id', value: `\`${selectedRouteId}\`` },
    { label: 'Candidate Route Count', value: `\`${routeSelection.candidateCount}\`` },
    ...(lineage.dimension ? [{ label: 'Carrier Dimension', value: `\`${String(lineage.dimension)}\`` }] : []),
    ...(lineage.parentDimension ? [{ label: 'Parent Carrier Dimension', value: `\`${String(lineage.parentDimension)}\`` }] : []),
    ...(lineage.checkpointKind ? [{ label: 'Carrier Checkpoint', value: String(lineage.checkpointKind) }] : [])
  ];
  const ingressPointer = finalizeFile({
    path: RECIPIENT_V2_READ_PATH,
    kind: 'handoff-recovery-pointer',
    logicalKind: 'recipient-v2-phase1-ingress-pointer',
    mediaType: 'text/markdown',
    content: renderRecipientV2Pointer({
      artifactFirst: true,
      createdAt,
      role: 'recovery-orientation',
      title: cleanCarrierPhase2 ? 'READ BEFORE PROCEEDING — Artifact-First Clean Carrier Phase 2' : 'READ BEFORE PROCEEDING — Artifact-First Phase 1 Specimen',
      summary: cleanCarrierPhase2 ? 'Single ingress Pointer for the bounded artifact-first recipient-v2 clean-carrier specimen.' : 'Single ingress Pointer for the bounded artifact-first recipient-v2 specimen.',
      prose: cleanCarrierPhase2 ? 'Use the visible semantic artifacts and exact payload bytes for receiver meaning. This clean-carrier profile intentionally omits stored compatibility JSON; no receiver truth may be reconstructed from its absence.' : 'Use the visible semantic artifacts and exact payload bytes for receiver meaning. Compatibility JSON is a derived projection only.',
      currentRead: ingressCurrentRead,
      destinations: [
        ...(bootstrapArtifact ? [{ label: 'Portable Tooling bootstrap payload', target: bootstrapArtifactPath }] : []),
        ...workspaceCarriers.map((item) => ({ label: `${item.workspaceId} Workspace payload`, target: item.payloadArtifactPath })),
        ...(cacheArtifact ? [{ label: 'Selected-route dependency cache payload', target: cacheArtifact.path }] : []),
        ...workspaceCarriers.map((item) => ({ label: `${item.workspaceId} Workspace material representation`, target: item.relationArtifactPath })),
        ...endpointRoleArtifacts.map((item) => ({ label: 'Endpoint Role pointer', target: item.path })),
        ...participantRoleArtifacts.map((item) => ({ label: 'Participant Role pointer', target: item.path })),
        ...routePointers.map((item) => ({ label: 'Handoff route', target: item.path }))
      ]
    })
  });

  const workspaceFiles = workspaceCarriers.flatMap((item) => [item.payloadArtifact, item.archiveFile, item.relationArtifact]);
  const semanticFiles = Object.freeze([ingressPointer, ...(bootstrapArtifact && bootstrapArchiveFile ? [bootstrapArtifact, bootstrapArchiveFile] : []), ...workspaceFiles, ...(cacheArtifact && cacheArchiveFile ? [cacheArtifact, cacheArchiveFile] : []), ...endpointRoleArtifacts, ...participantRoleArtifacts, ...routePointers]);
  const factsByPath = deriveRecipientV2ArtifactFirstPhase1Facts(semanticFiles);
  const manifestInputs = semanticFiles.map((file) => {
    const facts = factsByPath.get(String(file.path || '')) || null;
    return facts ? Object.freeze({ ...file, transportFacts: facts }) : file;
  });
  const transportManifest = cleanCarrierPhase2 ? null : buildRecipientV2TransportManifestFile(manifestInputs, {
    format: RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID,
    packageRootPath: RECIPIENT_V2_READ_PATH,
    entryArtifactPath: RECIPIENT_V2_READ_PATH
  });
  const files = Object.freeze([...semanticFiles, ...(transportManifest ? [transportManifest] : [])].sort((a, b) => String(a.path || '').localeCompare(String(b.path || ''))));
  const inspection = inspectRecipientV2ArtifactFirstPhase1Specimen({ files });
  const topology = deepFreeze({
    root: null,
    read: Object.freeze({ path: RECIPIENT_V2_READ_PATH, sha256: ingressPointer.sha256 }),
    workspaces: Object.freeze(workspaceCarriers.map((item) => Object.freeze({
      workspaceId: item.workspaceId,
      workspacePath: '',
      payloadArtifactPath: item.payloadArtifactPath,
      representationArtifactPath: item.relationArtifactPath,
      archivePath: item.archivePath,
      archiveSha256: item.archiveFile.sha256,
      sourceWorkspaceTargetInnerPath: String(item.workspace.sourceWorkspaceTargetInnerPath || ''),
      sourceWorkspaceTargetSha256: String(item.workspace.sourceWorkspaceTargetSha256 || '')
    }))),
    caches: Object.freeze(cacheProjection ? [cacheProjection] : []),
    endpointRoles: Object.freeze(endpointRoleProjections),
    participantRoles: Object.freeze(participantRoleProjections),
    routes: Object.freeze(routeTopology),
    bootstrap: bootstrapArtifact && bootstrapArchiveFile ? Object.freeze({ artifactPath: bootstrapArtifactPath, payloadPath: bootstrapArchivePath, payloadSha256: bootstrapArchiveFile.sha256, payloadBytes: bootstrapArchiveFile.bytes }) : null,
    transportManifest: transportManifest ? Object.freeze({ path: transportManifest.path, sha256: transportManifest.sha256 }) : null
  });
  return deepFreeze({
    schema: resultSchemaId,
    format: formatId,
    cleanCarrierPhase2,
    status: inspection.status === 'ready' ? 'ready' : 'blocked',
    files,
    topology,
    workspaceId,
    routePath: String(route.workspaceRelativeHandoffPath || ''),
    routePointerPath: selectedRoutePointerPath,
    routeSelection,
    semanticFactsByPath: factsByPath,
    inspection,
    findings: inspection.findings,
    boundary: cleanCarrierPhase2
      ? 'Phase 2 clean-carrier qualification specimen only. Receiver truth is visible Pointer + External Payload + typed non-Parent Relation + exact payload bytes; stored compatibility JSON is intentionally absent and cannot be recreated as hidden authority.'
      : 'Phase 1 dual projection specimen only. Receiver semantic authority is visible Pointer + External Payload + typed non-Parent Relation + exact payload bytes; compatibility JSON is derived and remains required only for Phase 1 interoperability.'
  });
}
