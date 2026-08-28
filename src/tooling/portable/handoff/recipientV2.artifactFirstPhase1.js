import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView, packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { qualifySelectedHandoffArtifact } from './routeArtifactConformance.js';
import { projectHandoffMaterialRequirements } from './materialClosure.requirements.js';
import {
  inspectRecipientV2Artifact,
  parseRecipientV2Pointer,
  parseRecipientV2Relation,
  renderRecipientV2ExternalPayload,
  renderRecipientV2Pointer,
  renderRecipientV2Relation
} from './recipientV2.artifacts.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { buildRecipientV2TransportManifestFile, inspectRecipientV2TransportManifest, RECIPIENT_V2_TRANSPORT_MANIFEST_PATH, recipientV2TransportFacts } from './recipientV2.transportManifest.js';

const RECIPIENT_V2_READ_PATH = '001-1-READ-BEFORE-PROCEEDING.trace.md';
const RECIPIENT_V2_BASE_FORMAT_ID = 'tiinex-recipient-facing-handoff-v2-flat';
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID = `${RECIPIENT_V2_BASE_FORMAT_ID}-artifact-first-phase1`;
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID = 'tiinex.portable.handoff-recipient-v2-artifact-first-phase1.v1';
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID = `${RECIPIENT_V2_BASE_FORMAT_ID}-artifact-first-clean-phase2`;
export const RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_SCHEMA_ID = 'tiinex.portable.handoff-recipient-v2-artifact-first-clean-phase2.v1';
const PHASE2_CLEAN_PROFILE = 'artifact-first-clean-carrier-phase2';
const PHASE2_COMPATIBILITY_TRANSPORT = 'omitted-derived-non-authoritative';
const PHASE1_BOOTSTRAP_ROLE = 'portable Tooling bootstrap runtime for recipient orientation and verification';
const PHASE1_WORKSPACE_ROLE = 'complete Workspace archive representation payload';
const PHASE1_CACHE_ROLE = 'workspace-scoped Handoff dependency cache';

export function buildRecipientFacingV2ArtifactFirstPhase1(input = {}) {
  return buildRecipientFacingV2ArtifactFirst(input, false);
}

export function buildRecipientFacingV2ArtifactFirstPhase2Clean(input = {}) {
  return buildRecipientFacingV2ArtifactFirst(input, true);
}

function buildRecipientFacingV2ArtifactFirst(input = {}, cleanCarrierPhase2 = false) {
  const sourceSurface = input.sourceSurface || null;
  const selectionFindings = [];
  const routeSelection = selectPhase1SourceRoute(input.carrierProjection || sourceSurface?.carrierProjection || {}, input.routeSelector || input.routeId || '', selectionFindings);
  if (routeSelection.state !== 'qualified') return blocked('route-selection-blocked', selectionFindings);
  if (!sourceSurface || sourceSurface.status !== 'ready') return blocked('source-surface-unready', sourceSurface?.findings || []);
  const specimen = buildRecipientV2ArtifactFirstPhase1Specimen({
    bundle: { files: sourceSurface.files || [] },
    createdAt: input.createdAt,
    workspaceId: routeSelection.route.workspaceId || input.workspaceId || '',
    routePath: routeSelection.route.workspaceRelativePath || '',
    routeSelection,
    bootstrap: sourceSurface.topology?.bootstrap || null,
    cleanCarrierPhase2
  });
  if (specimen.status !== 'ready') return specimen;
  return deepFreeze({
    status: 'ready',
    files: specimen.files,
    topology: specimen.topology,
    inspection: specimen.inspection,
    findings: specimen.inspection.findings,
    boundary: specimen.boundary
  });
}

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

  const sourceArchive = oneFile(sourceBundle.files || [], workspace.workspaceArchivePath);
  if (!sourceArchive) return blocked('workspace-archive-unresolved', [finding('error', 'portable.handoff-v2-phase1.archive.unresolved', 'Selected Workspace archive is unavailable in the qualified source carrier.', { path: workspace.workspaceArchivePath })]);

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
  const archivePath = '001-2-workspace.zip';
  const payloadArtifactPath = '001-2-workspace-payload.trace.md';
  const relationArtifactPath = '001-3-workspace-representation-relation.trace.md';
  const routePointerPath = '001-4-handoff-pointer.trace.md';
  const archiveFile = repathFinalizedFile(sourceArchive, archivePath, {
    kind: 'handoff-workspace-archive',
    logicalKind: 'recipient-v2-phase1-complete-workspace-archive',
    mediaType: 'application/zip',
    boundary: 'Exact Workspace archive bytes owned by the visible External Payload artifact; package placement is not semantic provider authority.'
  });

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

  const payloadArtifact = finalizeFile({
    path: payloadArtifactPath,
    kind: 'tiinex-external-payload-artifact',
    logicalKind: 'recipient-v2-phase1-workspace-payload',
    mediaType: 'text/markdown',
    content: renderRecipientV2ExternalPayload({
      artifactFirst: true,
      createdAt,
      workspaceId,
      title: `Workspace Payload — ${workspaceId}`,
      summary: 'Artifact-first Phase 1 exact Workspace archive payload.',
      label: `${workspaceId} complete Workspace archive`,
      kind: 'zip export',
      role: PHASE1_WORKSPACE_ROLE,
      location: archivePath,
      bytes: archiveFile.bytes,
      sha256: archiveFile.sha256
    })
  });

  const relationArtifact = finalizeFile({
    path: relationArtifactPath,
    kind: 'tiinex-relation-artifact',
    logicalKind: 'recipient-v2-phase1-workspace-representation-relation',
    mediaType: 'text/markdown',
    content: renderRecipientV2Relation({
      artifactFirst: true,
      createdAt,
      title: `Workspace Material Representation — ${workspaceId}`,
      summary: 'Typed non-Parent material-representation relation from the External Payload artifact to the represented Workspace artifact.',
      relationType: 'material representation',
      direction: 'payload artifact -> represented artifact',
      scope: 'complete recipient-relative workspace materialization',
      sourceLabel: `${workspaceId} Workspace payload artifact`,
      source: payloadArtifactPath,
      targetLabel: `${workspaceId} represented Workspace artifact`,
      target: String(workspace.sourceWorkspaceTargetInnerPath || ''),
      targetWorkspaceId: workspaceId,
      targetWorkspaceInnerPath: String(workspace.sourceWorkspaceTargetInnerPath || '')
    })
  });

  const sourceCache = (sourceInspection.caches || []).find((item) => String(item.workspaceId || '') === workspaceId) || null;
  const selectedCacheMaterials = sourceCache ? (sourceCache.materials || []).filter((item) => cacheMaterialBelongsToRoute(item, workspaceId, route.workspaceRelativeHandoffPath)) : [];
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

  const participantRoleArtifacts = [];
  const participantRoleProjections = [];
  for (const [index, sourcePointerPath] of [...(sourceRouteInspection?.participantRolePointers || [])].entries()) {
    const sourceFacts = sourceFactsByPath.get(String(sourcePointerPath || '')) || null;
    if (!sourceFacts || String(sourceFacts.role || '') !== 'participant-role') return blocked('participant-role-source-unresolved', [finding('error', 'portable.handoff-v2-phase1.participant-role.source-unresolved', 'Selected-route participant Role Pointer transport facts are unavailable in the qualified source carrier.', { path: String(sourcePointerPath || '') })]);
    const targetCarrierKind = String(sourceFacts.targetCarrierKind || '');
    const targetPayload = targetCarrierKind === 'workspace-cache-entry' ? String(cacheArtifact?.path || '') : targetCarrierKind === 'workspace-archive-entry' ? payloadArtifactPath : '';
    if (!targetPayload) return blocked('participant-role-target-unresolved', [finding('error', 'portable.handoff-v2-phase1.participant-role.target-unresolved', 'Selected-route participant Role target must resolve to the explicit Workspace or cache External Payload artifact.', { path: String(sourcePointerPath || ''), targetCarrierKind })]);
    if (targetCarrierKind === 'workspace-cache-entry' && !selectedCacheMaterials.some((item) => String(item.archiveEntry || '') === String(sourceFacts.targetArchiveEntry || ''))) return blocked('participant-role-cache-material-unresolved', [finding('error', 'portable.handoff-v2-phase1.participant-role.cache-material-unresolved', 'Participant Role cache target is not owned by the selected-route cache External Payload.', { path: String(sourcePointerPath || ''), targetArchiveEntry: String(sourceFacts.targetArchiveEntry || '') })]);
    const roleLabel = String(sourceFacts.roleLabelHint || 'participant-role');
    const pointerPath = `001-6-${index + 1}-${safeToken(roleLabel)}-role-pointer.trace.md`;
    const pointer = finalizeFile({
      path: pointerPath,
      kind: 'participant-role-pointer',
      logicalKind: 'recipient-v2-phase1-participant-role-pointer',
      mediaType: 'text/markdown',
      content: renderRecipientV2Pointer({
        artifactFirst: true,
        createdAt,
        role: 'participant-role',
        title: `Participant Role Pointer — ${roleLabel}`,
        summary: 'Artifact-first Phase 1 Pointer to one exact additional participant Role artifact carried by the selected Workspace or cache External Payload.',
        prose: 'This Pointer contributes one additional participant Role to interaction grounding for this selected Handoff route. It does not change Handoff From/To, prove a human holder, or create Role authority.',
        currentRead: [
          { label: 'Workspace Id', value: `\`${workspaceId}\`` },
          { label: 'Route Id', value: `\`${selectedRouteId}\`` },
          { label: 'Participant Requirement Id', value: `\`${String(sourceFacts.participantRequirementId || '')}\`` },
          ...(sourceFacts.roleLabelHint ? [{ label: 'Role Label Hint', value: String(sourceFacts.roleLabelHint) }] : []),
          { label: 'Role Reference', value: `\`${String(sourceFacts.referenceTarget || '')}\`` },
          { label: 'Target Carrier Kind', value: targetCarrierKind },
          { label: 'Target Payload', value: `[payload](${targetPayload})` },
          ...(targetCarrierKind === 'workspace-archive-entry' ? [{ label: 'Target Workspace Id', value: `\`${String(sourceFacts.targetWorkspaceId || workspaceId)}\`` }, { label: 'Target Inner Path', value: `\`${String(sourceFacts.targetInnerPath || '')}\`` }] : []),
          ...(targetCarrierKind === 'workspace-cache-entry' ? [{ label: 'Target Archive Entry', value: `\`${String(sourceFacts.targetArchiveEntry || '')}\`` }] : [])
        ],
        destinations: [{ label: 'Exact participant Role payload owner', target: targetPayload }]
      })
    });
    participantRoleArtifacts.push(pointer);
    participantRoleProjections.push(Object.freeze({ pointerPath, workspaceId, routeId: selectedRouteId, requirementId: String(sourceFacts.participantRequirementId || ''), roleLabelHint: String(sourceFacts.roleLabelHint || ''), referenceTarget: String(sourceFacts.referenceTarget || ''), targetCarrierKind, targetWorkspaceId: String(sourceFacts.targetWorkspaceId || ''), targetInnerPath: String(sourceFacts.targetInnerPath || sourceFacts.targetArchiveEntry || ''), targetSha256: String(sourceFacts.targetSha256 || '') }));
  }

  const routePointer = finalizeFile({
    path: routePointerPath,
    kind: 'handoff-route-pointer',
    logicalKind: 'recipient-v2-phase1-handoff-route-pointer',
    mediaType: 'text/markdown',
    content: renderRecipientV2Pointer({
      artifactFirst: true,
      createdAt,
      role: 'handoff-route',
      title: `Handoff Route Pointer — ${workspaceId}`,
      summary: 'Artifact-first Phase 1 navigation pointer to one exact Handoff path inside the explicitly owned Workspace payload.',
      prose: 'This Pointer identifies navigation coordinates only. The exact Handoff artifact inside the Workspace payload remains the Handoff authority.',
      currentRead: [
        { label: 'Workspace Id', value: `\`${workspaceId}\`` },
        { label: 'Workspace Payload', value: `[payload](${payloadArtifactPath})` },
        { label: 'Handoff Workspace Path', value: `\`${String(route.workspaceRelativeHandoffPath || '')}\`` },
        { label: 'Route Id', value: `\`${selectedRouteId}\`` }
      ],
      destinations: [{ label: 'Workspace payload artifact', target: payloadArtifactPath }, ...participantRoleArtifacts.map((item) => ({ label: 'Participant Role pointer', target: item.path }))]
    })
  });

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
        { label: 'Workspace payload', target: payloadArtifactPath },
        ...(cacheArtifact ? [{ label: 'Selected-route dependency cache payload', target: cacheArtifact.path }] : []),
        { label: 'Workspace material representation', target: relationArtifactPath },
        ...participantRoleArtifacts.map((item) => ({ label: 'Participant Role pointer', target: item.path })),
        { label: 'Handoff route', target: routePointerPath }
      ]
    })
  });

  const semanticFiles = Object.freeze([ingressPointer, ...(bootstrapArtifact && bootstrapArchiveFile ? [bootstrapArtifact, bootstrapArchiveFile] : []), payloadArtifact, archiveFile, relationArtifact, ...(cacheArtifact && cacheArchiveFile ? [cacheArtifact, cacheArchiveFile] : []), ...participantRoleArtifacts, routePointer]);
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
    workspaces: Object.freeze([Object.freeze({
      workspaceId,
      workspacePath: '',
      payloadArtifactPath,
      representationArtifactPath: relationArtifactPath,
      archivePath,
      archiveSha256: archiveFile.sha256,
      sourceWorkspaceTargetInnerPath: String(workspace.sourceWorkspaceTargetInnerPath || ''),
      sourceWorkspaceTargetSha256: String(workspace.sourceWorkspaceTargetSha256 || '')
    })]),
    caches: Object.freeze(cacheProjection ? [cacheProjection] : []),
    participantRoles: Object.freeze(participantRoleProjections),
    routes: Object.freeze([Object.freeze({ pointerPath: routePointerPath, workspaceId, workspaceRelativeHandoffPath: String(route.workspaceRelativeHandoffPath || ''), routeId: selectedRouteId, participantRolePointers: Object.freeze(participantRoleProjections.map((item) => item.pointerPath)) })]),
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
    routeSelection,
    semanticFactsByPath: factsByPath,
    inspection,
    findings: inspection.findings,
    boundary: cleanCarrierPhase2
      ? 'Phase 2 clean-carrier qualification specimen only. Receiver truth is visible Pointer + External Payload + typed non-Parent Relation + exact payload bytes; stored compatibility JSON is intentionally absent and cannot be recreated as hidden authority.'
      : 'Phase 1 dual projection specimen only. Receiver semantic authority is visible Pointer + External Payload + typed non-Parent Relation + exact payload bytes; compatibility JSON is derived and remains required only for Phase 1 interoperability.'
  });
}

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
  const participantPointers = pointers.filter((item) => item.parsed.role === 'participant-role');
  const workspacePayloads = payloads.filter((item) => item.parsed.payloadRole === PHASE1_WORKSPACE_ROLE);
  const bootstrapPayloads = payloads.filter((item) => item.parsed.payloadRole === PHASE1_BOOTSTRAP_ROLE);
  const cachePayloads = payloads.filter((item) => item.parsed.payloadRole === PHASE1_CACHE_ROLE);
  const unknownPayloads = payloads.filter((item) => ![PHASE1_WORKSPACE_ROLE, PHASE1_BOOTSTRAP_ROLE, PHASE1_CACHE_ROLE].includes(item.parsed.payloadRole));
  if (ingress.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.count', 'Phase 1 specimen requires exactly one ingress Pointer.', { count: ingress.length }));
  if (routes.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.route.count', 'Phase 1 specimen requires exactly one selected Handoff route Pointer.', { count: routes.length }));
  if (workspacePayloads.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.payload.workspace-count', 'Phase 1 specimen requires exactly one selected Workspace External Payload artifact.', { count: workspacePayloads.length }));
  if (bootstrapPayloads.length > 1) findings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.count', 'A carried portable Tooling bootstrap must have exactly one owning External Payload artifact.', { count: bootstrapPayloads.length }));
  if (cachePayloads.length > 1) findings.push(finding('error', 'portable.handoff-v2-phase1.cache.count', 'A selected Workspace may expose at most one selected-route dependency cache External Payload.', { count: cachePayloads.length }));
  if (unknownPayloads.length) findings.push(finding('error', 'portable.handoff-v2-phase1.payload.unclassified', 'Phase 1 specimen contains an External Payload artifact outside the bounded Workspace/bootstrap/cache ownership subset.', { count: unknownPayloads.length }));
  if (relations.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.count', 'Phase 1 specimen requires exactly one typed Workspace material-representation Relation.', { count: relations.length }));
  if (markdownFiles.some((file) => factsByPath.get(String(file.path || ''))?.role === 'package-root')) findings.push(finding('error', 'portable.handoff-v2-phase1.package-root.present', 'Phase 1 specimen must not use a package-root Pointer as receiver semantic authority.'));

  const payload = workspacePayloads[0];
  const bootstrapPayload = bootstrapPayloads[0] || null;
  const relation = relations[0];
  const route = routes[0];
  const ingressPointer = ingress[0];
  let archive = null;
  let workspaceTargetQualification = null;
  let routeEntry = null;
  let routeConformance = null;
  let routeParties = Object.freeze({ from: '', to: '' });
  let requiredClosure = Object.freeze({ state: 'blocked', requiredCount: 0, qualifiedCount: 0, requirements: Object.freeze([]), boundary: 'Artifact-first Phase 1 Required Context qualification has not run.' });
  let bootstrapQualification = bootstrapPayload ? qualifyPhase1BootstrapPayload(bootstrapPayload, semanticFiles, findings) : null;
  const cacheQualifications = cachePayloads.map((item) => qualifyPhase1CachePayload(item, semanticFiles, findings));
  let participantRoleQualifications = [];
  let archiveFile = null;
  if (payload) {
    const archiveFiles = semanticFiles.filter((file) => String(file.path || '') === String(payload.parsed.location || ''));
    if (archiveFiles.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.payload.location-unresolved', 'External Payload Location must resolve exactly one exact payload file.', { path: payload.parsed.location || '', count: archiveFiles.length }));
    else {
      archiveFile = archiveFiles[0];
      const bytes = packageFileBytes(archiveFile);
      if (payload.parsed.bytes !== bytes.byteLength || payload.parsed.integrityMethod !== 'sha256' || payload.parsed.integrityValue !== sha256Hex(bytes)) findings.push(finding('error', 'portable.handoff-v2-phase1.payload.identity-mismatch', 'Visible External Payload byte identity diverges from exact payload bytes.'));
      archive = inspectStoredWorkspaceArchive(bytes);
      findings.push(...(archive.findings || []));
      if (archive.state === 'qualified' && relation) {
        const targetEntries = archive.entries.filter((entry) => String(entry.path || '') === String(relation.parsed.targetWorkspaceInnerPath || ''));
        if (targetEntries.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.workspace-target.unresolved', 'Relation target Workspace inner path must resolve exactly one Workspace artifact inside the payload.', { path: relation.parsed.targetWorkspaceInnerPath || '', count: targetEntries.length }));
        else {
          workspaceTargetQualification = qualifyHandoffWorkspaceTarget({ targetPath: targetEntries[0].path, targetData: targetEntries[0].data, entries: archive.entries });
          if (workspaceTargetQualification.state !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-phase1.workspace-target.unqualified', 'Relation-selected Workspace artifact inside the payload did not independently qualify.', { reasons: workspaceTargetQualification.reasons || [] }));
        }
      }
      if (archive.state === 'qualified' && route) {
        const routeEntries = archive.entries.filter((entry) => String(entry.path || '') === String(route.parsed.handoffWorkspacePath || ''));
        if (routeEntries.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.route.unresolved', 'Route Pointer Handoff Workspace Path must resolve exactly one exact artifact inside the Workspace payload.', { path: route.parsed.handoffWorkspacePath || '', count: routeEntries.length }));
        else {
          routeEntry = routeEntries[0];
          const routeMarkdown = decodeUtf8(routeEntry.data);
          routeConformance = qualifySelectedHandoffArtifact({ markdown: routeMarkdown, resolveParent: ({ parent, targetEntry }) => resolveArchiveParent(route.parsed.handoffWorkspacePath, archive.entries, parent, targetEntry) });
          if (routeConformance.status !== 'qualified') findings.push(...(routeConformance.findings || []).map((item) => finding(item.severity || 'error', item.code || 'portable.handoff-v2-phase1.route.unqualified', item.message || 'Exact Handoff route did not qualify.')));
          routeParties = parseHandoffParties(routeMarkdown);
          if (!routeParties.from || !routeParties.to) findings.push(finding('error', 'portable.handoff-v2-phase1.route.parties-unresolved', 'Exact Handoff bytes must provide From and To parties; route Pointer does not duplicate them.'));
          requiredClosure = qualifyPhase1RequiredContextClosure({
            markdown: routeMarkdown,
            routePath: route.parsed.handoffWorkspacePath,
            workspaceId: payload.parsed.workspaceId,
            archivePath: payload.parsed.location,
            entries: archive.entries,
            caches: cacheQualifications
          });
          findings.push(...(requiredClosure.findings || []));
        }
      }
    }
  }
  if (payload && relation) {
    if (relation.parsed.relationType !== 'material representation' || relation.parsed.direction !== 'payload artifact -> represented artifact' || relation.parsed.scope !== 'complete recipient-relative workspace materialization') findings.push(finding('error', 'portable.handoff-v2-phase1.relation.semantic-contract-mismatch', 'Workspace representation Relation does not match the accepted Phase 1 material-representation predicate/direction/scope.'));
    if (relation.parsed.source !== payload.path) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.payload-mismatch', 'Material-representation Relation Source must be the explicit External Payload artifact.'));
    if (!relation.parsed.targetWorkspaceId || relation.parsed.targetWorkspaceId !== payload.parsed.workspaceId) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.workspace-id-mismatch', 'Relation and External Payload must visibly agree on represented Workspace identity.'));
    if (!relation.parsed.targetWorkspaceInnerPath || relation.parsed.target !== relation.parsed.targetWorkspaceInnerPath) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.workspace-inner-path-missing', 'Material-representation Relation must visibly identify the represented Workspace inner path.'));
  }
  const semanticRouteId = route ? String(route.parsed.routeId || `handoff-route:${String(payload?.parsed?.workspaceId || '')}:${String(route.parsed.handoffWorkspacePath || '')}`) : '';
  if (route && payload) {
    if (route.parsed.workspaceId !== payload.parsed.workspaceId || route.parsed.workspacePayload !== payload.path) findings.push(finding('error', 'portable.handoff-v2-phase1.route.workspace-mismatch', 'Route Pointer must visibly select the same Workspace identity and External Payload artifact.'));
    if (!route.parsed.handoffWorkspacePath) findings.push(finding('error', 'portable.handoff-v2-phase1.route.path-missing', 'Route Pointer must visibly declare the Handoff Workspace Path.'));
    if (!route.parsed.routeId || route.parsed.routeId !== semanticRouteId) findings.push(finding('error', 'portable.handoff-v2-phase1.route.id-missing', 'Selected route Pointer must visibly bind one exact route identity.'));
  }
  if (ingressPointer && payload && !ingressPointer.parsed.destinations.includes(payload.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.payload-missing', 'Ingress Pointer must navigate to the Workspace External Payload artifact.'));
  if (ingressPointer && relation && !ingressPointer.parsed.destinations.includes(relation.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.relation-missing', 'Ingress Pointer must navigate to the Workspace material-representation Relation.'));
  if (ingressPointer && route && !ingressPointer.parsed.destinations.includes(route.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.route-missing', 'Ingress Pointer must navigate to the Handoff route Pointer.'));
  if (ingressPointer && bootstrapPayload && !ingressPointer.parsed.destinations.includes(bootstrapPayload.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.bootstrap-missing', 'Ingress Pointer must navigate to the visible portable Tooling bootstrap External Payload artifact when one is carried.'));
  if (ingressPointer && !bootstrapPayload && ingressPointer.parsed.destinations.some((target) => /bootstrap/i.test(String(target || '')))) findings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.artifact-unresolved', 'Ingress Pointer declares a portable Tooling bootstrap destination but no owning External Payload artifact is present.'));
  for (const cachePayload of cachePayloads) if (ingressPointer && !ingressPointer.parsed.destinations.includes(cachePayload.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.cache-missing', 'Ingress Pointer must navigate to every selected-route cache External Payload artifact.', { path: cachePayload.path }));
  if (route && payload && archive?.state === 'qualified') {
    const expectedParticipantPaths = route.parsed.destinations.filter((target) => String(target || '') !== String(payload.path || ''));
    const expectedSet = new Set(expectedParticipantPaths);
    for (const expectedPath of expectedParticipantPaths) {
      const matches = participantPointers.filter((item) => String(item.path || '') === String(expectedPath || ''));
      if (matches.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.pointer-missing', 'Selected route Pointer must resolve every declared participant Role Pointer exactly once.', { path: String(expectedPath || ''), count: matches.length }));
      else participantRoleQualifications.push(qualifyPhase1ParticipantRolePointer(matches[0], { routeId: semanticRouteId, workspaceId: payload.parsed.workspaceId, workspacePayload: payload, workspaceArchive: archive, cachePayloads, cacheQualifications }, findings));
    }
    for (const pointer of participantPointers) if (!expectedSet.has(String(pointer.path || ''))) findings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.unbound', 'Participant Role Pointer must be explicitly bound by the selected route Pointer.', { path: String(pointer.path || '') }));
    for (const pointer of participantPointers) if (ingressPointer && !ingressPointer.parsed.destinations.includes(pointer.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.participant-role-missing', 'Ingress Pointer must navigate to every selected-route participant Role Pointer.', { path: pointer.path }));
  } else if (participantPointers.length) {
    findings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.route-unresolved', 'Participant Role Pointers cannot qualify until the selected route and Workspace payload qualify.'));
  }
  if (ingressPointer && route) {
    const candidateCount = Number(ingressPointer.parsed.candidateRouteCount || 0);
    const selectedRouteId = String(ingressPointer.parsed.selectedRouteId || '');
    const mode = String(ingressPointer.parsed.routeSelection || '');
    if (candidateCount < 1) findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.candidate-count-missing', 'Ingress Pointer must preserve the qualified candidate-route count used for the bounded Phase 1 selection.'));
    if (candidateCount > 1 && mode !== 'explicit-qualified-route-selector') findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.explicit-required', 'More than one qualified source Handoff route requires an explicit outer route selector.'));
    if (candidateCount === 1 && mode !== 'implicit-single-qualified-route' && mode !== 'explicit-qualified-route-selector') findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.mode-invalid', 'Single-route Phase 1 selection mode is unsupported.', { mode }));
    if (!selectedRouteId || selectedRouteId !== semanticRouteId) findings.push(finding('error', 'portable.handoff-v2-phase1.route-selection.binding-mismatch', 'Ingress route selection must bind exactly the one visible route Pointer and exact inner Handoff target.', { selectedRouteId, semanticRouteId }));
  }

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
  const workspaceId = String(payload?.parsed?.workspaceId || relation?.parsed?.targetWorkspaceId || route?.parsed?.workspaceId || '');
  const lineage = ingressPointer ? Object.freeze({
    mode: ingressPointer.parsed.carrierDimension?.includes('-') ? 'continue' : 'root',
    dimension: String(ingressPointer.parsed.carrierDimension || ''),
    parentDimension: String(ingressPointer.parsed.parentCarrierDimension || ''),
    checkpointKind: String(ingressPointer.parsed.carrierCheckpoint || '')
  }) : Object.freeze({ mode: '', dimension: '', parentDimension: '', checkpointKind: '' });
  const routeId = semanticRouteId;
  const routeReasons = [];
  if (routeConformance?.status !== 'qualified') routeReasons.push('handoff-conformance-unqualified');
  if (requiredClosure.state !== 'qualified') routeReasons.push('required-context-closure-unqualified');
  if (participantRoleQualifications.some((item) => item.state !== 'qualified')) routeReasons.push('participant-role-grounding-unqualified');
  const carrierRoute = route && routeEntry ? Object.freeze({
    id: routeId,
    workspaceId,
    state: routeReasons.length ? 'blocked' : 'qualified',
    workspaceRelativePath: String(route.parsed.handoffWorkspacePath || ''),
    packagePath: String(payload?.parsed?.location || ''),
    providerMode: 'archive',
    archivePackagePath: String(payload?.parsed?.location || ''),
    sha256: String(routeEntry.sha256 || ''),
    dimension: String(lineage.dimension || ''),
    parties: routeParties,
    purpose: '',
    projectedFilename: artifactFirstCarrierFilename(workspaceId, lineage.dimension, routeParties.from, routeParties.to),
    conformance: routeConformance,
    requiredClosure,
    participantRolePointers: Object.freeze(participantRoleQualifications.filter((item) => item.state === 'qualified').map((item) => item.pointerPath)),
    reasons: Object.freeze(routeReasons),
    authority: Object.freeze({ artifactPartiesAuthoritative: true, dimensionSemanticAuthority: false, filenameSemanticAuthority: false })
  }) : null;
  const sourceCandidateRouteCount = Number(ingressPointer?.parsed?.candidateRouteCount || 0);
  const sourceSelectionMode = String(ingressPointer?.parsed?.routeSelection || '');
  const selectionPolicy = sourceCandidateRouteCount > 1 || sourceSelectionMode === 'explicit-qualified-route-selector'
    ? 'explicit-qualified-route-bound'
    : 'implicit-single-qualified-route';
  const carrierProjection = deepFreeze({
    schema: 'tiinex.portable.handoff-carrier-projection.v1',
    version: 1,
    status: finalSemanticStatus === 'qualified' && carrierRoute?.state === 'qualified' ? 'ready' : 'blocked',
    mode: 'single',
    lineage,
    workspaces: Object.freeze(workspaceId ? [Object.freeze({ id: workspaceId, title: workspaceId, slug: safeToken(workspaceId), qualification: workspaceTargetQualification?.state === 'qualified' ? 'qualified' : 'blocked' })] : []),
    workspace: workspaceId ? Object.freeze({ id: workspaceId, title: workspaceId, slug: safeToken(workspaceId), qualification: workspaceTargetQualification?.state === 'qualified' ? 'qualified' : 'blocked' }) : Object.freeze({ id: '', title: '', slug: '', qualification: 'unresolved' }),
    selection: Object.freeze({ policy: selectionPolicy, qualifiedRouteCount: carrierRoute?.state === 'qualified' ? 1 : 0, sourceCandidateRouteCount, selectedRouteId: routeId }),
    routes: Object.freeze(carrierRoute ? [carrierRoute] : []),
    authority: Object.freeze({ semanticAuthority: 'none', filenameAuthority: false, dimensionalParentAuthority: false, routeSelectionAuthority: 'qualified-visible-route-pointer-plus-exact-handoff-bytes' }),
    findings: Object.freeze([])
  });
  const coldConsumerProjection = deepFreeze({
    schema: 'tiinex.portable.handoff-cold-consumer-projection.v1',
    version: 1,
    status: carrierProjection.status,
    workspaces: carrierProjection.workspaces,
    routes: Object.freeze(carrierProjection.routes.map((item) => Object.freeze({ id: item.id, state: item.state, workspaceId: item.workspaceId, workspaceRelativeHandoffPath: item.workspaceRelativePath, packagePath: item.packagePath, sha256: item.sha256, from: item.parties?.from || '', to: item.parties?.to || '', participantRolePointers: Object.freeze(item.participantRolePointers || []) }))),
    selection: Object.freeze({ policy: carrierProjection.selection.policy, qualifiedRouteCount: carrierProjection.selection.qualifiedRouteCount, implicitRouteId: carrierRoute?.state === 'qualified' ? carrierRoute.id : '' }),
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
    handoffWorkspacePath: String(route?.parsed?.handoffWorkspacePath || ''),
    workspaceTargetQualification,
    routeEntry: routeEntry ? Object.freeze({ path: routeEntry.path, bytes: routeEntry.bytes, sha256: routeEntry.sha256 }) : null,
    routeConformance,
    requiredClosure,
    bootstrapQualification,
    caches: Object.freeze(cacheQualifications.map((item) => Object.freeze({ workspaceId: item.workspaceId, artifactPath: item.artifactPath, archivePath: item.payloadPath, materials: item.materials }))),
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

export function isRecipientV2ArtifactFirstPhase1Surface(files = []) {
  return files.some((file) => {
    if (String(file.path || '') !== RECIPIENT_V2_READ_PATH) return false;
    const markdown = decodeUtf8(packageFileBytes(file));
    return markdown.includes('Artifact-First Phase 1 Specimen') || markdown.includes(`Carrier Profile: ${PHASE2_CLEAN_PROFILE}`);
  });
}

export function inspectRecipientFacingV2ArtifactFirstPhase1(bundle = {}) {
  const inspection = inspectRecipientV2ArtifactFirstPhase1Specimen(bundle);
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const facts = inspection.semanticFactsByPath || new Map();
  const ingressFile = files.find((file) => String(file.path || '') === RECIPIENT_V2_READ_PATH) || null;
  const payloadEntry = [...facts.entries()].find(([, item]) => item?.role === 'workspace-representation-payload') || null;
  const relationEntry = [...facts.entries()].find(([, item]) => item?.role === 'workspace-representation') || null;
  const routeEntry = [...facts.entries()].find(([, item]) => item?.role === 'handoff-route') || null;
  const bootstrapEntry = [...facts.entries()].find(([, item]) => item?.role === 'tooling-bootstrap') || null;
  const cacheEntries = [...facts.entries()].filter(([, item]) => item?.role === 'workspace-dependency-cache');
  return deepFreeze({
    schema: 'tiinex.portable.recipient-facing-handoff-v2.inspection.v1',
    detected: true,
    status: inspection.status === 'ready' ? 'valid' : 'invalid',
    format: inspection.format || RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID,
    rootArtifact: null,
    readArtifact: ingressFile ? Object.freeze({ path: RECIPIENT_V2_READ_PATH, schemaId: 'tiinex.pointer.v1', sha256: sha256Hex(packageFileBytes(ingressFile)), facts: facts.get(RECIPIENT_V2_READ_PATH) || null }) : null,
    workspaces: payloadEntry && relationEntry ? Object.freeze([Object.freeze({
      workspaceId: String(payloadEntry[1]?.workspaceId || relationEntry[1]?.workspaceId || ''),
      workspaceArtifactPath: '',
      workspaceRepresentationArtifactPath: relationEntry[0],
      workspacePayloadArtifactPath: payloadEntry[0],
      workspaceArchivePath: String(payloadEntry[1]?.archivePath || ''),
      sourceWorkspaceTargetInnerPath: String(relationEntry[1]?.workspaceArtifactInnerPath || ''),
      sourceWorkspaceTargetSha256: ''
    })]) : Object.freeze([]),
    routes: routeEntry ? Object.freeze([Object.freeze({ pointerPath: routeEntry[0], workspaceId: String(routeEntry[1]?.workspaceId || ''), workspaceRelativeHandoffPath: String(routeEntry[1]?.workspaceRelativeHandoffPath || ''), participantRolePointers: Object.freeze(inspection.participantRoles.map((item) => item.pointerPath)) })]) : Object.freeze([]),
    participantRoles: Object.freeze(inspection.participantRoles || []),
    caches: Object.freeze(inspection.caches || cacheEntries.map(([artifactPath, item]) => Object.freeze({ workspaceId: String(item?.workspaceId || ''), artifactPath, archivePath: String(item?.archivePath || ''), materials: Object.freeze(item?.materials || []) }))),
    bootstrapInspection: bootstrapEntry ? Object.freeze({ status: inspection.bootstrapQualification?.state === 'qualified' ? 'valid' : 'invalid', path: bootstrapEntry[0], state: inspection.bootstrapQualification?.state || 'blocked', archivePath: String(bootstrapEntry[1]?.archivePath || ''), bytes: Number(bootstrapEntry[1]?.archiveBytes || 0), sha256: String(bootstrapEntry[1]?.archiveSha256 || ''), findings: Object.freeze([...(inspection.bootstrapQualification?.findings || [])]) }) : null,
    transportManifest: inspection.transportManifest,
    artifactFacts: Object.freeze([...facts.entries()].map(([path, item]) => Object.freeze({ path, facts: item }))),
    descriptor: null,
    workspaceByteProvider: null,
    carrierProjection: inspection.carrierProjection,
    coldConsumerProjection: inspection.coldConsumerProjection,
    findings: inspection.findings,
    findingSummary: Object.freeze({ errors: inspection.findings.filter((item) => item.severity === 'error').length, findings: inspection.findings.length }),
    boundary: inspection.boundary,
    phase1: inspection
  });
}

export function deriveRecipientV2ArtifactFirstPhase1Facts(files = []) {
  const facts = new Map();
  const payloadByPath = new Map();
  for (const file of files) {
    const path = String(file.path || '');
    if (!/\.md$/i.test(path)) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    if (currentSchemaId(markdown) === 'tiinex.external.payload.v1') payloadByPath.set(path, parsePhase1Payload(markdown));
  }
  for (const file of files) {
    const path = String(file.path || '');
    if (!/\.md$/i.test(path)) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    const schemaId = currentSchemaId(markdown);
    if (schemaId === 'tiinex.pointer.v1') {
      const parsed = parseRecipientV2Pointer(markdown);
      if (parsed.role === 'participant-role') {
        const targetPayload = payloadByPath.get(String(parsed.targetPayload || '')) || null;
        const targetArchive = targetPayload ? oneFile(files, targetPayload.location) : null;
        const archive = targetArchive ? inspectStoredWorkspaceArchive(packageFileBytes(targetArchive), { ownedBytes: true }) : null;
        const targetPath = parsed.targetCarrierKind === 'workspace-cache-entry' ? parsed.targetArchiveEntry : parsed.targetInnerPath;
        const targetMatches = archive?.state === 'qualified' ? archive.entries.filter((entry) => String(entry.path || '') === String(targetPath || '')) : [];
        const target = targetMatches.length === 1 ? targetMatches[0] : null;
        const targetBytes = target ? packageFileBytes({ data: target.data }) : new Uint8Array();
        facts.set(path, recipientV2TransportFacts('participant-role', {
          workspaceId: parsed.workspaceId || '',
          routeId: parsed.routeId || '',
          participantRequirementId: parsed.participantRequirementId || '',
          roleLabelHint: parsed.roleLabelHint || '',
          referenceTarget: parsed.roleReference || '',
          targetCarrierKind: parsed.targetCarrierKind || '',
          targetWorkspaceId: parsed.targetWorkspaceId || '',
          archivePath: targetPayload?.location || '',
          archiveSha256: targetArchive ? sha256Hex(packageFileBytes(targetArchive)) : '',
          targetInnerPath: parsed.targetInnerPath || '',
          targetArchiveEntry: parsed.targetArchiveEntry || '',
          targetBytes: targetBytes.byteLength,
          targetSha256: targetBytes.byteLength ? sha256Hex(targetBytes) : ''
        }));
      } else facts.set(path, recipientV2TransportFacts(parsed.role || 'navigation', {
          workspaceId: parsed.workspaceId || '',
          payloadArtifactPath: parsed.workspacePayload || '',
          workspaceRelativeHandoffPath: parsed.handoffWorkspacePath || '',
          routeId: parsed.routeId || '',
          routeSelection: parsed.role === 'recovery-orientation' ? Object.freeze({ mode: parsed.routeSelection || '', selectedRouteId: parsed.selectedRouteId || '', candidateCount: Number(parsed.candidateRouteCount || 0) }) : undefined,
          carrierLineage: parsed.role === 'recovery-orientation' ? Object.freeze({ dimension: parsed.carrierDimension || '', parentDimension: parsed.parentCarrierDimension || '', checkpointKind: parsed.carrierCheckpoint || '' }) : undefined
        }));
    } else if (schemaId === 'tiinex.external.payload.v1') {
      const parsed = parsePhase1Payload(markdown);
      if (parsed.payloadRole === PHASE1_WORKSPACE_ROLE) facts.set(path, recipientV2TransportFacts('workspace-representation-payload', { workspaceId: parsed.workspaceId, archivePath: parsed.location || '', archiveBytes: Number(parsed.bytes || 0), archiveSha256: parsed.integrityValue || '' }));
      else if (parsed.payloadRole === PHASE1_BOOTSTRAP_ROLE) facts.set(path, recipientV2TransportFacts('tooling-bootstrap', { archivePath: parsed.location || '', archiveBytes: Number(parsed.bytes || 0), archiveSha256: parsed.integrityValue || '', payloadRole: parsed.payloadRole }));
      else if (parsed.payloadRole === PHASE1_CACHE_ROLE) {
        const archiveFile = oneFile(files, parsed.location);
        const archive = archiveFile ? inspectStoredWorkspaceArchive(packageFileBytes(archiveFile), { ownedBytes: true }) : null;
        const materials = parsed.materials.map((material) => {
          const matches = archive?.state === 'qualified' ? archive.entries.filter((entry) => String(entry.path || '') === String(material.archiveEntry || '')) : [];
          const entry = matches.length === 1 ? matches[0] : null;
          const bytes = entry ? packageFileBytes({ data: entry.data }) : new Uint8Array();
          return Object.freeze({ requirementId: material.requirementId, classification: material.classification, referenceTarget: material.referenceTarget, routeWorkspaceId: parsed.workspaceId, routePath: '', sourceRequirementId: material.requirementId, originalPath: '', archiveEntry: material.archiveEntry, bytes: bytes.byteLength, sha256: bytes.byteLength ? sha256Hex(bytes) : '' });
        });
        facts.set(path, recipientV2TransportFacts('workspace-dependency-cache', { workspaceId: parsed.workspaceId, archivePath: parsed.location || '', archiveBytes: Number(parsed.bytes || 0), archiveSha256: parsed.integrityValue || '', materials: Object.freeze(materials) }));
      }
    } else if (schemaId === 'tiinex.relation.v1') {
      const parsed = parseRecipientV2Relation(markdown);
      facts.set(path, recipientV2TransportFacts('workspace-representation', {
        workspaceId: parsed.targetWorkspaceId || '', workspaceArtifactInnerPath: parsed.targetWorkspaceInnerPath || '', payloadArtifactPath: parsed.source || '', relationType: parsed.relationType || '', relationDirection: parsed.direction || '', relationScope: parsed.scope || ''
      }));
    }
  }
  return facts;
}

function parsePhase1Payload(markdown = '') {
  const identity = sectionText(markdown, 'Payload Identity');
  const location = sectionText(markdown, 'Payload Location');
  const integrity = sectionText(markdown, 'Integrity Reference');
  return Object.freeze({
    workspaceId: fieldValue(identity, 'Workspace Id'),
    payloadRole: fieldValue(identity, 'Payload Role'),
    bytes: Number(fieldValue(identity, 'Byte Size') || 0),
    location: markdownTarget(fieldValue(location, 'Location')),
    integrityStatus: fieldValue(integrity, 'Integrity Status'),
    integrityMethod: fieldValue(integrity, 'Integrity Method'),
    integrityValue: fieldValue(integrity, 'Integrity Value'),
    integrityTarget: fieldValue(integrity, 'Integrity Target'),
    materials: parsePhase1MaterialBindings(markdown)
  });
}

function parsePhase1MaterialBindings(markdown = '') {
  const section = sectionText(markdown, 'Payload Material Bindings');
  if (!section) return Object.freeze([]);
  const out = [];
  let current = null;
  for (const line of section.split(/\r?\n/)) {
    const requirement = line.match(/^\s*-\s+Requirement Id:\s*(.*?)\s*$/i);
    if (requirement) {
      if (current) out.push(Object.freeze(current));
      current = { requirementId: String(requirement[1] || '').trim(), classification: '', referenceTarget: '', archiveEntry: '' };
      continue;
    }
    if (!current) continue;
    const classification = line.match(/^\s+-\s+Classification:\s*(.*?)\s*$/i);
    const reference = line.match(/^\s+-\s+Material Reference:\s*(.*?)\s*$/i);
    const archiveEntry = line.match(/^\s+-\s+Archive Entry:\s*(.*?)\s*$/i);
    if (classification) current.classification = String(classification[1] || '').trim();
    else if (reference) current.referenceTarget = String(reference[1] || '').trim();
    else if (archiveEntry) current.archiveEntry = String(archiveEntry[1] || '').trim();
  }
  if (current) out.push(Object.freeze(current));
  return Object.freeze(out);
}

function selectPhase1SourceRoute(carrierProjection = {}, selector = '', findings = []) {
  const candidates = [...(carrierProjection.routes || [])].filter((route) => String(route.state || '') === 'qualified');
  const requested = String(selector || '').trim();
  if (!requested) {
    if (candidates.length === 1) return deepFreeze({ state: 'qualified', mode: 'implicit-single-qualified-route', selector: '', candidateCount: 1, route: candidates[0] });
    findings.push(finding('error', candidates.length > 1 ? 'portable.handoff-v2-phase1.route-selection.required' : 'portable.handoff-v2-phase1.route-selection.unresolved', candidates.length > 1 ? 'Phase 1 artifact-first manufacture requires an explicit route selector when more than one qualified Handoff candidate exists.' : 'Phase 1 artifact-first manufacture requires exactly one qualified Handoff route candidate.', { candidateCount: candidates.length }));
    return deepFreeze({ state: 'blocked', mode: candidates.length > 1 ? 'selection-required' : 'unresolved', selector: '', candidateCount: candidates.length, route: null });
  }
  const normalized = normalizeRoutePath(requested);
  const matches = candidates.filter((route) => String(route.id || '') === requested || normalizeRoutePath(route.workspaceRelativePath || '') === normalized || `${String(route.workspaceId || '')}:${normalizeRoutePath(route.workspaceRelativePath || '')}` === requested);
  if (matches.length !== 1) {
    findings.push(finding('error', matches.length > 1 ? 'portable.handoff-v2-phase1.route-selection.ambiguous' : 'portable.handoff-v2-phase1.route-selection.unresolved', 'Explicit Phase 1 route selector must bind exactly one qualified Handoff route candidate.', { selector: requested, matches: matches.length, candidateCount: candidates.length }));
    return deepFreeze({ state: 'blocked', mode: matches.length > 1 ? 'ambiguous' : 'unresolved', selector: requested, candidateCount: candidates.length, route: null });
  }
  return deepFreeze({ state: 'qualified', mode: 'explicit-qualified-route-selector', selector: requested, candidateCount: candidates.length, route: matches[0] });
}

function qualifyPhase1BootstrapPayload(bootstrapPayload = null, semanticFiles = [], findings = []) {
  if (!bootstrapPayload) return null;
  const localFindings = [];
  if (String(bootstrapPayload.parsed?.payloadRole || '') !== PHASE1_BOOTSTRAP_ROLE) localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.role-mismatch', 'Portable Tooling bootstrap External Payload must declare the accepted bootstrap payload role.'));
  const location = String(bootstrapPayload.parsed?.location || '');
  const matches = semanticFiles.filter((file) => String(file.path || '') === location);
  if (!location || matches.length !== 1) localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.location-unresolved', 'Portable Tooling bootstrap External Payload Location must resolve exactly one carried payload file.', { path: location, count: matches.length }));
  let bytes = new Uint8Array();
  if (matches.length === 1) {
    bytes = packageFileBytes(matches[0]);
    const digest = sha256Hex(bytes);
    if (Number(bootstrapPayload.parsed?.bytes || 0) !== bytes.byteLength || String(bootstrapPayload.parsed?.integrityStatus || '') !== 'verified' || String(bootstrapPayload.parsed?.integrityMethod || '') !== 'sha256' || String(bootstrapPayload.parsed?.integrityValue || '') !== digest) localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.identity-mismatch', 'Portable Tooling bootstrap visible byte identity diverges from the exact carried payload bytes.', { path: location }));
    const archive = inspectStoredWorkspaceArchive(bytes, { ownedBytes: true });
    if (archive.state !== 'qualified') localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.archive-invalid', 'Portable Tooling bootstrap payload is not a qualified deterministic stored-ZIP representation.', { path: location, findings: archive.findings || [] }));
  }
  findings.push(...localFindings);
  return deepFreeze({ state: localFindings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', artifactPath: String(bootstrapPayload.path || ''), payloadPath: location, payloadRole: String(bootstrapPayload.parsed?.payloadRole || ''), bytes: bytes.byteLength, sha256: bytes.byteLength ? sha256Hex(bytes) : '', findings: Object.freeze(localFindings), boundary: 'Visible External Payload ownership of exact portable Tooling bootstrap bytes. Ingress navigation and package placement create no Parent or package authority.' });
}

function qualifyPhase1CachePayload(cachePayload = null, semanticFiles = [], findings = []) {
  if (!cachePayload) return null;
  const localFindings = [];
  const location = String(cachePayload.parsed?.location || '');
  const matches = semanticFiles.filter((file) => String(file.path || '') === location);
  if (!location || matches.length !== 1) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.location-unresolved', 'Selected-route cache External Payload Location must resolve exactly one carried payload file.', { path: location, count: matches.length }));
  let bytes = new Uint8Array();
  let archive = null;
  const materialQualifications = [];
  if (matches.length === 1) {
    bytes = packageFileBytes(matches[0]);
    const digest = sha256Hex(bytes);
    if (Number(cachePayload.parsed?.bytes || 0) !== bytes.byteLength || String(cachePayload.parsed?.integrityStatus || '') !== 'verified' || String(cachePayload.parsed?.integrityMethod || '') !== 'sha256' || String(cachePayload.parsed?.integrityValue || '') !== digest) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.identity-mismatch', 'Selected-route cache visible byte identity diverges from exact carried cache bytes.', { path: location }));
    archive = inspectStoredWorkspaceArchive(bytes, { ownedBytes: true });
    if (archive.state !== 'qualified') localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.archive-invalid', 'Selected-route cache payload is not a qualified deterministic stored-ZIP representation.', { path: location, findings: archive.findings || [] }));
  }
  const seenRequirements = new Set();
  const seenReferences = new Set();
  const seenEntries = new Set();
  for (const material of cachePayload.parsed?.materials || []) {
    const requirementId = String(material.requirementId || '');
    const referenceTarget = String(material.referenceTarget || '');
    const archiveEntry = String(material.archiveEntry || '');
    if (!requirementId || !referenceTarget || !archiveEntry) {
      localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-binding-incomplete', 'Every selected-route cache material binding must visibly declare requirement id, material reference, and archive entry.'));
      continue;
    }
    if (seenRequirements.has(requirementId) || seenReferences.has(referenceTarget) || seenEntries.has(archiveEntry)) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-binding-ambiguous', 'Selected-route cache material bindings must be one-to-one by requirement id, material reference, and archive entry.', { requirementId, referenceTarget, archiveEntry }));
    seenRequirements.add(requirementId); seenReferences.add(referenceTarget); seenEntries.add(archiveEntry);
    const entryMatches = archive?.state === 'qualified' ? archive.entries.filter((entry) => String(entry.path || '') === archiveEntry) : [];
    if (archive?.state === 'qualified' && entryMatches.length !== 1) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-entry-unresolved', 'Selected-route cache material binding must resolve exactly one exact cache entry.', { requirementId, referenceTarget, archiveEntry, count: entryMatches.length }));
    const entry = entryMatches.length === 1 ? entryMatches[0] : null;
    const entryBytes = entry ? packageFileBytes({ data: entry.data }) : new Uint8Array();
    materialQualifications.push(deepFreeze({ requirementId, classification: String(material.classification || ''), referenceTarget, archiveEntry, bytes: entryBytes.byteLength, sha256: entryBytes.byteLength ? sha256Hex(entryBytes) : '' }));
  }
  if (!(cachePayload.parsed?.materials || []).length) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-bindings-missing', 'Selected-route cache External Payload must visibly bind every owned detached material to one archive entry.'));
  findings.push(...localFindings);
  return deepFreeze({ state: localFindings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', workspaceId: String(cachePayload.parsed?.workspaceId || ''), artifactPath: String(cachePayload.path || ''), payloadPath: location, payloadRole: String(cachePayload.parsed?.payloadRole || ''), bytes: bytes.byteLength, sha256: bytes.byteLength ? sha256Hex(bytes) : '', archive, materials: Object.freeze(materialQualifications), findings: Object.freeze(localFindings), boundary: 'Visible cache External Payload ownership plus exact cache ZIP bytes and visible material-to-entry bindings. Cache location and compatibility JSON do not create material authority.' });
}

function qualifyPhase1ParticipantRolePointer(pointer = null, context = {}, findings = []) {
  const localFindings = [];
  const parsed = pointer?.parsed || {};
  const targetCarrierKind = String(parsed.targetCarrierKind || '');
  if (String(parsed.workspaceId || '') !== String(context.workspaceId || '') || String(parsed.routeId || '') !== String(context.routeId || '')) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.route-binding-mismatch', 'Participant Role Pointer must visibly bind the selected Workspace and selected route.', { path: String(pointer?.path || '') }));
  if (!['workspace-archive-entry', 'workspace-cache-entry'].includes(targetCarrierKind)) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.target-carrier-invalid', 'Participant Role Pointer target carrier must be the explicit Workspace payload or selected-route cache payload.', { path: String(pointer?.path || ''), targetCarrierKind }));
  const targetPayload = String(parsed.targetPayload || '');
  let targetArchive = null;
  let archivePath = '';
  let targetPath = '';
  let targetBytes = 0;
  if (targetCarrierKind === 'workspace-archive-entry') {
    if (targetPayload !== String(context.workspacePayload?.path || '')) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.workspace-payload-mismatch', 'Workspace-carried participant Role Pointer must target the selected Workspace External Payload artifact.'));
    targetArchive = context.workspaceArchive;
    archivePath = String(context.workspacePayload?.parsed?.location || '');
    targetPath = String(parsed.targetInnerPath || '');
    if (!parsed.targetWorkspaceId || String(parsed.targetWorkspaceId) !== String(context.workspaceId || '')) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.workspace-id-mismatch', 'Workspace-carried participant Role Pointer must visibly identify the selected Workspace id.'));
  } else if (targetCarrierKind === 'workspace-cache-entry') {
    const cacheIndex = (context.cachePayloads || []).findIndex((item) => String(item.path || '') === targetPayload);
    if (cacheIndex < 0) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.cache-payload-unresolved', 'Cache-carried participant Role Pointer must target the explicit selected-route cache External Payload artifact.', { targetPayload }));
    else {
      const cacheQualification = context.cacheQualifications?.[cacheIndex] || null;
      const cacheFile = (context.cachePayloads || [])[cacheIndex];
      targetPath = String(parsed.targetArchiveEntry || '');
      const material = (cacheQualification?.materials || []).find((item) => String(item.archiveEntry || '') === targetPath) || null;
      if (!material) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.cache-entry-unowned', 'Cache-carried participant Role target must be one exact material explicitly owned by the selected-route cache External Payload.', { targetPath }));
      targetArchive = cacheQualification?.archive || null;
      archivePath = String(cacheQualification?.payloadPath || '');
    }
  }
  const matches = targetArchive?.state === 'qualified' ? targetArchive.entries.filter((entry) => String(entry.path || '') === targetPath) : [];
  if (!targetPath || matches.length !== 1) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.target-unresolved', 'Participant Role Pointer must resolve exactly one exact Role artifact inside its explicit payload owner.', { targetPayload, targetPath, count: matches.length }));
  let targetSha256 = '';
  if (matches.length === 1) {
    const data = packageFileBytes({ data: matches[0].data });
    targetBytes = data.byteLength;
    targetSha256 = sha256Hex(data);
    const markdown = decodeUtf8(data);
    if (currentSchemaId(markdown) !== 'tiinex.party.role.v1') localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.schema-invalid', 'Participant Role Pointer target must be one exact tiinex.party.role.v1 artifact.', { targetPath }));
    const roleLabel = fieldValue(sectionText(markdown, 'Role Identity'), 'Role Label');
    if (!roleLabel) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.label-unresolved', 'Participant Role target must visibly declare Role Label.', { targetPath }));
    if (parsed.roleLabelHint && roleLabel && normalizePhase1Token(parsed.roleLabelHint) !== normalizePhase1Token(roleLabel)) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.label-mismatch', 'Participant Role Pointer label hint conflicts with the exact carried Role artifact.', { hint: parsed.roleLabelHint, roleLabel }));
  }
  if (!parsed.participantRequirementId || !parsed.roleReference) localFindings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.binding-incomplete', 'Participant Role Pointer must visibly preserve its requirement id and Role reference.'));
  findings.push(...localFindings);
  return deepFreeze({ state: localFindings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', pointerPath: String(pointer?.path || ''), workspaceId: String(parsed.workspaceId || ''), routeId: String(parsed.routeId || ''), requirementId: String(parsed.participantRequirementId || ''), roleLabelHint: String(parsed.roleLabelHint || ''), referenceTarget: String(parsed.roleReference || ''), targetCarrierKind, targetWorkspaceId: String(parsed.targetWorkspaceId || ''), archivePath, targetInnerPath: targetPath, targetArchiveEntry: targetCarrierKind === 'workspace-cache-entry' ? targetPath : '', targetBytes, targetSha256, findings: Object.freeze(localFindings) });
}

export function qualifyRecipientV2ArtifactFirstPhase1RequiredContextClosure(input = {}) {
  return qualifyPhase1RequiredContextClosure(input);
}
function qualifyPhase1RequiredContextClosure({ markdown = '', routePath = '', workspaceId = '', archivePath = '', entries = [], caches = [] } = {}) {
  const projected = projectHandoffMaterialRequirements({ path: routePath, markdown });
  const findings = [];
  const requirements = (projected.required || []).map((requirement) => {
    const target = String(requirement.reference?.target || '').trim();
    const reasons = [];
    let resolution = null;
    if (!target || target.startsWith('#') || !requirement.reference?.exactTargetDeclared) reasons.push('exact-required-material-reference-unresolved');
    else if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) {
      const matches = caches.flatMap((cache) => (cache?.state === 'qualified' ? (cache.materials || []).filter((material) => String(material.referenceTarget || '') === target && (!requirement.id || String(material.requirementId || '') === String(requirement.id || ''))).map((material) => ({ cache, material })) : []));
      if (matches.length > 1) reasons.push('required-cache-material-ambiguous');
      else if (matches.length < 1) reasons.push('required-cache-material-missing');
      else {
        const { cache, material } = matches[0];
        if (!material.sha256 || !material.bytes) reasons.push('required-cache-material-byte-identity-unresolved');
        else resolution = deepFreeze({ state: 'qualified', kind: 'workspace-cache-entry', workspaceId: String(cache.workspaceId || workspaceId || ''), workspaceRelativePath: '', providerMode: 'cache', packagePath: String(cache.payloadPath || ''), archivePackagePath: String(cache.payloadPath || ''), innerPath: String(material.archiveEntry || ''), archiveEntry: String(material.archiveEntry || ''), bytes: Number(material.bytes || 0), sha256: String(material.sha256 || '') });
      }
    }
    else {
      const resolvedPath = resolveRelativeWorkspacePath(routePath, target);
      if (!resolvedPath) reasons.push('workspace-reference-outside-or-invalid');
      else {
        const matches = entries.filter((entry) => String(entry.path || '') === resolvedPath);
        if (matches.length > 1) reasons.push('required-workspace-entry-ambiguous');
        else if (matches.length < 1) reasons.push('required-workspace-entry-missing');
        else {
          const entry = matches[0];
          const data = packageFileBytes({ data: entry.data });
          const digest = sha256Hex(data);
          if (Number(entry.bytes || 0) !== data.byteLength || String(entry.sha256 || '') !== digest) reasons.push('required-workspace-package-byte-mismatch');
          else resolution = deepFreeze({ state: 'qualified', kind: 'workspace-archive-entry', workspaceId: String(workspaceId || ''), workspaceRelativePath: resolvedPath, providerMode: 'archive', packagePath: String(archivePath || ''), archivePackagePath: String(archivePath || ''), innerPath: resolvedPath, bytes: data.byteLength, sha256: digest });
        }
      }
    }
    const state = reasons.length || !resolution ? 'blocked' : 'qualified';
    if (state !== 'qualified') findings.push(finding('error', `portable.handoff-v2-phase1.required-context.${reasons[0] || 'unresolved'}`, 'Required Context must resolve to one exact inner artifact carried by the selected Workspace payload or qualified selected-route cache; compatibility JSON cannot supply missing receiver truth.', { requirementId: String(requirement.id || ''), name: String(requirement.name || ''), referenceTarget: target, reasons: Object.freeze([...new Set(reasons)]) }));
    return deepFreeze({ requirementId: String(requirement.id || ''), name: String(requirement.name || ''), referenceTarget: target, state, resolution: state === 'qualified' ? resolution : null, reasons: Object.freeze([...new Set(reasons)]) });
  });
  const qualifiedCount = requirements.filter((entry) => entry.state === 'qualified').length;
  return deepFreeze({ state: qualifiedCount === requirements.length ? 'qualified' : 'blocked', requiredCount: requirements.length, qualifiedCount, requirements: Object.freeze(requirements), findings: Object.freeze(findings), boundary: 'Artifact-first Phase 1 Required Context closure. Every Required Context item must resolve to exact inner bytes of the selected qualified Workspace payload or qualified selected-route cache; Reference Context and compatibility JSON are intentionally excluded from blocking receiver truth.' });
}

function normalizeRoutePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function normalizePhase1Token(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function cacheMaterialBelongsToRoute(material = {}, workspaceId = '', routePath = '') {
  return String(material.routeWorkspaceId || '') === String(workspaceId || '') && normalizeRoutePath(material.routePath || '') === normalizeRoutePath(routePath || '');
}
function resolveArchiveParent(routePath = '', entries = [], parent = {}, targetEntry = {}) {
  const refs = [String(parent.trace || ''), ...(parent.originEntries || []).map((item) => String(item.target || '')), String(targetEntry.towards || '')].filter(Boolean);
  for (const ref of refs) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(ref)) continue;
    const resolved = resolveRelativeWorkspacePath(routePath, ref);
    if (!resolved) continue;
    const matches = entries.filter((entry) => String(entry.path || '') === resolved);
    if (matches.length === 1) return Object.freeze({ state: 'qualified', markdown: decodeUtf8(matches[0].data), basis: 'artifact-first-workspace-archive', workspaceRelativePath: resolved, sha256: String(matches[0].sha256 || '') });
  }
  return Object.freeze({ state: 'unresolved', reason: 'parent-entry-unresolved' });
}
function resolveRelativeWorkspacePath(fromPath = '', ref = '') {
  const value = String(ref || '').split('#')[0].replace(/\\/g, '/');
  if (!value || value.startsWith('/') || /^[A-Za-z]:\//.test(value)) return '';
  const base = String(fromPath || '').replace(/\\/g, '/').split('/'); base.pop();
  const parts = value.startsWith('./') || value.startsWith('../') ? [...base, ...value.split('/')] : [...base, ...value.split('/')];
  const out = [];
  for (const part of parts) { if (!part || part === '.') continue; if (part === '..') { if (!out.length) return ''; out.pop(); } else out.push(part); }
  return out.join('/');
}
function parseHandoffParties(markdown = '') { const section = sectionText(markdown, 'Handoff Parties'); return Object.freeze({ from: fieldValue(section, 'From'), to: fieldValue(section, 'To') }); }
function selectOne(items = [], selector = '', label = 'item', findings = [], selectorFn = (item) => String(item.workspaceId || '')) { const candidates = selector ? items.filter((item) => selectorFn(item) === String(selector)) : items; if (candidates.length !== 1) { findings.push(finding('error', `portable.handoff-v2-phase1.${label}.selection`, `Phase 1 specimen requires exactly one selected ${label}.`, { selector: String(selector || ''), count: candidates.length })); return null; } return candidates[0]; }
function oneFile(files = [], path = '') { const matches = files.filter((file) => String(file.path || '') === String(path || '')); return matches.length === 1 ? matches[0] : null; }
function repathFinalizedFile(file = {}, path = '', overrides = {}) { return finalizeFile({ ...overrides, path, requestedPath: path, data: packageFileByteView(file) }); }
function currentSchemaId(markdown = '') { return String(String(markdown || '').match(/Current Schema:\s*(?:\[)?(tiinex\.[a-z0-9._-]+)(?:\])?/i)?.[1] || '').toLowerCase(); }
function sectionText(markdown = '', heading = '') { const re = new RegExp(`^##\\s+${escapeRe(heading)}\\s*$`, 'mi'); const match = re.exec(String(markdown || '')); if (!match) return ''; const rest = String(markdown || '').slice(match.index + match[0].length); const next = /^##\s+/m.exec(rest); return (next ? rest.slice(0, next.index) : rest).trim(); }
function fieldValue(section = '', name = '') { const m = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRe(name)}:\\s*(.+?)\\s*$`, 'mi')); return String(m?.[1] || '').trim(); }
function markdownTarget(value = '') { return String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || String(value || '').trim(); }
function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function artifactFirstCarrierFilename(workspaceId = '', dimension = '', from = '', to = '') {
  const workspace = safeToken(workspaceId);
  const dimensionToken = String(dimension || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const fromToken = String(from || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const toToken = String(to || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return workspace && dimensionToken && fromToken && toToken ? `${workspace}-${dimensionToken}-${fromToken}-to-${toToken}.handoff-package.zip` : '';
}
function safeToken(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace'; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function blocked(reason, findings = []) { return deepFreeze({ schema: RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID, status: 'blocked', files: Object.freeze([]), topology: deepFreeze({ root: null, read: null, workspaces: [], caches: [], participantRoles: [], routes: [], bootstrap: null }), findings: Object.freeze([finding('error', `portable.handoff-v2-phase1.${reason}`, 'Artifact-first Phase 1 specimen could not be built.'), ...findings]) }); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer || value instanceof Map) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
