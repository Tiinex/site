import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView, packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import {
  RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET,
  RECIPIENT_V2_POINTER_SCHEMA_TARGET,
  RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET,
  RECIPIENT_V2_WORKSPACE_REPRESENTATION_SCHEMA_TARGET,
  renderRecipientV2ExternalPayload,
  renderRecipientV2Pointer,
  renderRecipientV2Workspace,
  renderRecipientV2WorkspaceRepresentation
} from './recipientV2.artifacts.js';
import { selectRecipientRoutes } from './recipientV2.routeSelection.js';
import { recipientEntriesFingerprint, recipientPackageRootPath } from './recipientV2.topology.helpers.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE, recipientV2EntryCurrentRead } from './recipientV2.entryContract.js';
import { buildRecipientV2TransportManifestFile, recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { buildRecipientFacingV2ArtifactFirstPhase1, buildRecipientFacingV2ArtifactFirstPhase2Clean } from './recipientV2.artifactFirstPhase1.js';

export const RECIPIENT_V2_READ_PATH = '001-1-READ-BEFORE-PROCEEDING.trace.md';
export const RECIPIENT_V2_FORMAT_ID = 'tiinex-recipient-facing-handoff-v2-flat';

export function buildRecipientFacingV2Topology(input = {}) {
  const sourceSurface = buildRecipientFacingV2TopologyLegacy({ ...input, artifactFirstDualProjectionPhase1: false, artifactFirstCleanCarrierPhase2: false, legacyRecipientV2Compatibility: false });
  if (input.legacyRecipientV2Compatibility === true) return sourceSurface;
  if (input.artifactFirstDualProjectionPhase1 === true) return buildRecipientFacingV2ArtifactFirstPhase1({ ...input, sourceSurface });
  return buildRecipientFacingV2ArtifactFirstPhase2Clean({ ...input, sourceSurface });
}

function buildRecipientFacingV2TopologyLegacy(input = {}) {
  const internalBundle = input.bundle || {};
  const descriptor = input.descriptor || internalBundle.handoffClosure || {};
  const carrier = input.carrierProjection || {};
  const createdAt = input.createdAt || internalBundle.manifest?.createdAt || internalBundle.builtAt || '';
  const findings = [];
  const files = [];
  const topology = { root: null, read: null, workspaces: [], caches: [], participantRoles: [], routes: [], bootstrap: null };
  const byPath = uniqueFileIndex(internalBundle.files || [], findings);

  const routeSelection = selectRecipientRoutes(carrier.routes || [], input.routeSelector || '', findings);
  const selectedWorkspaceIds = routeSelection.selector ? new Set(routeSelection.routes.map((route) => String(route.workspaceId || ''))) : null;
  const bindings = [...(descriptor.workspaceArchiveBindings || [])]
    .filter((binding) => !selectedWorkspaceIds || selectedWorkspaceIds.has(String(binding.workspaceId || '')))
    .sort((a, b) => String(a.workspaceId || '').localeCompare(String(b.workspaceId || '')));
  const workspacePlans = bindings.map((binding, index) => {
    const ordinal = index + 3;
    const workspaceId = String(binding.workspaceId || '');
    const slug = safeToken(workspaceId || `workspace-${ordinal}`);
    const prefix = `001-${ordinal}`;
    return Object.freeze({ binding, ordinal, workspaceId, slug, prefix, workspacePath: `${prefix}-${slug}.workspace.md`, archivePath: `${prefix}-${slug}.workspace.zip`, payloadArtifactPath: `${prefix}-1-workspace-representation-payload.trace.md`, representationArtifactPath: `${prefix}-2-workspace-representation.trace.md` });
  });
  const workspaceOrdinalById = new Map(workspacePlans.map((plan) => [plan.workspaceId, plan.ordinal]));
  const routesByWorkspace = groupRoutes(routeSelection.routes);
  const routePlans = [];
  for (const workspace of workspacePlans) {
    const routes = (routesByWorkspace.get(workspace.workspaceId) || []).filter((route) => String(route.state || '') === 'qualified');
    routes.forEach((route, index) => routePlans.push(Object.freeze({ workspace, route, ordinal: index + 1 })));
  }

  const detached = detachedMaterial(descriptor, byPath, findings);

  const bootstrapSource = (internalBundle.files || []).filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/'));
  const rootPath = recipientPackageRootPath(workspacePlans);
  const rootDestinations = [
    { label: 'Read before proceeding', target: RECIPIENT_V2_READ_PATH },
    ...(bootstrapSource.length ? [{ label: 'Portable Tooling bootstrap', target: '001-2-bootstrap.trace.md' }] : []),
    ...workspacePlans.map((workspace) => ({ label: `Workspace ${workspace.workspaceId}`, target: workspace.workspacePath }))
  ];
  const rootFacts = { format: RECIPIENT_V2_FORMAT_ID, packageRootPath: rootPath, entryArtifactPath: RECIPIENT_V2_READ_PATH, artifactSurface: 'flat-qualified-tiinex-artifacts-and-explicit-payload-zips', carrierLineage: carrier.lineage || null, pathParentProjection: true, pathAuthority: false };
  const rootFile = finalizeFile({
    path: rootPath,
    kind: 'handoff-package-lineage-root',
    logicalKind: 'recipient-v2-package-root',
    mediaType: 'text/markdown',
    transportFacts: recipientV2TransportFacts('package-root', rootFacts),
    content: renderRecipientV2Pointer({
      createdAt,
      role: 'package-root',
      title: 'Tiinex Handoff Package',
      summary: 'Package-local Tiinex lineage root for one recipient-facing Handoff carrier.',
      prose: 'This artifact is the package-local lineage root. Its descendants deliberately mirror this declared Parent tree in their numeric pathing so a reader can random-access any leaf and traverse back to this root.',
      currentRead: [
        { label: 'Start', value: `[READ BEFORE PROCEEDING](${RECIPIENT_V2_READ_PATH})` },
        { label: 'Carrier Dimension', value: `\`${String(carrier.lineage?.dimension || '001')}\`` },
        ...(carrier.lineage?.parentDimension ? [{ label: 'Parent Carrier Dimension', value: `\`${String(carrier.lineage.parentDimension)}\`` }] : []),
        { label: 'Carrier Checkpoint', value: String(carrier.lineage?.checkpointKind || 'major') },
        { label: 'Lineage Rule', value: 'numeric pathing mirrors declared package-local Parent continuity; filenames alone never establish the relation' }
      ],
      destinations: rootDestinations,
      facts: rootFacts
    })
  });
  files.push(rootFile);
  topology.root = Object.freeze({ path: rootPath, sha256: rootFile.sha256 });
  const rootParent = parentAuthority(rootFile, 'tiinex.pointer.v1', RECIPIENT_V2_POINTER_SCHEMA_TARGET, createdAt);

  if (bootstrapSource.length) {
    const bootstrap = buildBootstrapCarrier(bootstrapSource, createdAt, findings, rootParent);
    if (bootstrap) {
      files.push(bootstrap.artifact, bootstrap.payload);
      topology.bootstrap = bootstrap.projection;
    }
  }

  const workspaceById = new Map();
  for (const plan of workspacePlans) {
    const { binding, ordinal, workspaceId, workspacePath, archivePath, payloadArtifactPath, representationArtifactPath } = plan;
    const sourceTarget = oneFile(byPath, binding.workspaceTarget?.packagePath, findings, 'workspace-target');
    const sourceArchive = oneFile(byPath, binding.representation?.packagePath, findings, 'workspace-archive');
    if (!sourceTarget || !sourceArchive) continue;
    const sourceTargetData = packageFileByteView(sourceTarget);
    const sourceTargetSha256 = sha256Hex(sourceTargetData);
    const archiveFile = repathFinalizedFile(sourceArchive, archivePath, { kind: 'handoff-workspace-archive', logicalKind: 'recipient-v2-complete-workspace-archive', mediaType: 'application/zip', boundary: 'Exact complete Workspace archive representation. Its semantic provider activation is owned by the explicit Workspace Representation + External Payload artifacts; package placement is not binding authority.' });
    const facts = {
      workspaceId,
      archivePath,
      archiveBytes: archiveFile.bytes,
      archiveSha256: archiveFile.sha256,
      representationArtifactPath,
      payloadArtifactPath,
      sourceWorkspaceTargetInnerPath: String(binding.workspaceTarget?.innerPath || ''),
      sourceWorkspaceTargetBytes: sourceTargetData.byteLength,
      sourceWorkspaceTargetSha256: sourceTargetSha256,
      entryCount: Number(binding.entryMap?.count || 0),
      entriesFingerprint: recipientEntriesFingerprint(binding.entryMap?.entries || []),
      totalBytes: Number(binding.completeness?.totalBytes || 0),
      completenessState: String(binding.completeness?.state || ''),
      completenessBasis: String(binding.completeness?.basis || ''),
      archiveCodec: String(binding.representation?.codec || ''),
      providerKind: String(binding.provider?.kind || '')
    };
    const workspaceFile = finalizeFile({
      path: workspacePath,
      kind: 'handoff-package-workspace-node',
      logicalKind: 'recipient-v2-workspace-node',
      mediaType: 'text/markdown',
      transportFacts: recipientV2TransportFacts('workspace-node', facts),
      content: renderRecipientV2Workspace({
        createdAt,
        parent: rootParent,
        workspaceId,
        title: `${workspaceId || 'Workspace'} — Handoff Workspace`,
        representationPath: representationArtifactPath,
        sourceWorkspaceInnerPath: facts.sourceWorkspaceTargetInnerPath,
        facts
      })
    });
    const workspaceParent = parentAuthority(workspaceFile, 'tiinex.workspace.v1', RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET, createdAt);
    const payloadFacts = {
      workspaceId,
      payloadClass: 'workspace-representation',
      archivePath,
      archiveBytes: archiveFile.bytes,
      archiveSha256: archiveFile.sha256
    };
    const payloadArtifact = finalizeFile({
      path: payloadArtifactPath,
      kind: 'tiinex-external-payload-artifact',
      logicalKind: 'recipient-v2-workspace-representation-payload',
      mediaType: 'text/markdown',
      transportFacts: recipientV2TransportFacts('workspace-representation-payload', payloadFacts),
      content: renderRecipientV2ExternalPayload({
        createdAt,
        parent: workspaceParent,
        title: `Workspace Representation Payload — ${workspaceId}`,
        summary: 'Exact complete Workspace archive payload referenced by the canonical Workspace Representation binding.',
        label: `${workspaceId} complete Workspace archive`,
        kind: 'zip export',
        role: 'complete Workspace archive representation payload',
        location: archivePath,
        bytes: archiveFile.bytes,
        sha256: archiveFile.sha256,
        facts: payloadFacts
      })
    });
    const representationFacts = {
      workspaceId,
      workspaceArtifactPath: workspacePath,
      payloadArtifactPath,
      sourceWorkspaceTargetInnerPath: facts.sourceWorkspaceTargetInnerPath,
      archivePath,
      archiveSha256: archiveFile.sha256,
      entryCount: facts.entryCount,
      entriesFingerprint: facts.entriesFingerprint,
      completenessState: facts.completenessState
    };
    const representationArtifact = finalizeFile({
      path: representationArtifactPath,
      kind: 'tiinex-workspace-representation-artifact',
      logicalKind: 'recipient-v2-workspace-representation-binding',
      mediaType: 'text/markdown',
      transportFacts: recipientV2TransportFacts('workspace-representation', representationFacts),
      content: renderRecipientV2WorkspaceRepresentation({
        createdAt,
        parent: workspaceParent,
        title: `Workspace Representation — ${workspaceId}`,
        workspaceLabel: `${workspaceId} Handoff Workspace`,
        workspaceArtifactPath: workspacePath,
        payloadLabel: `${workspaceId} Workspace archive payload`,
        payloadArtifactPath,
        workspaceArtifactInnerPath: facts.sourceWorkspaceTargetInnerPath,
        decoderRequirement: 'deterministic stored ZIP with safe-entry validation',
        facts: representationFacts
      })
    });
    files.push(workspaceFile, payloadArtifact, representationArtifact, archiveFile);
    const projection = Object.freeze({
      workspaceId,
      ordinal,
      workspacePath,
      workspaceSha256: workspaceFile.sha256,
      representationArtifactPath,
      representationArtifactSha256: representationArtifact.sha256,
      payloadArtifactPath,
      payloadArtifactSha256: payloadArtifact.sha256,
      archivePath,
      archiveSha256: archiveFile.sha256,
      sourceWorkspaceTargetInnerPath: facts.sourceWorkspaceTargetInnerPath,
      sourceWorkspaceTargetSha256: sourceTargetSha256,
      sourceWorkspaceTargetBytes: sourceTargetData.byteLength
    });
    topology.workspaces.push(projection);
    workspaceById.set(workspaceId, { ...projection, file: workspaceFile, representationArtifact, payloadArtifact, parent: workspaceParent });
  }

  const cachePlanByWorkspace = new Map();
  for (const workspacePlan of workspacePlans) {
    const workspace = workspaceById.get(workspacePlan.workspaceId);
    if (!workspace) continue;
    const workspaceRoutes = routePlans.filter((plan) => plan.workspace.workspaceId === workspace.workspaceId);
    const materials = detached.filter((item) => workspaceRoutes.some((plan) => routeClaimsDetachedMaterial(plan.route, item)));
    if (!materials.length) continue;
    const artifactPath = `001-${workspacePlan.ordinal}-1-cache.trace.md`;
    const archivePath = `001-${workspacePlan.ordinal}-1-cache.zip`;
    const cacheEntries = materials.map((item, index) => ({ path: `material/${index + 1}-${safeToken(item.requirementId || item.referenceTarget || 'material')}.bin`, data: item.data }));
    const cacheBytes = exportFileMapZipUint8Array(cacheEntries, 'portable.handoff-v2-surface.cache.path.invalid');
    const cacheFile = finalizeFile({ path: archivePath, kind: 'handoff-material-cache', logicalKind: 'recipient-v2-workspace-dependency-cache', mediaType: 'application/zip', data: cacheBytes, boundary: 'Exact detached dependency bytes required by Handoff routes owned by this Workspace and absent from all qualified Workspace payloads. No Workspace byte may be duplicated here.' });
    const cacheFacts = {
      workspaceId: workspace.workspaceId,
      archivePath,
      archiveBytes: cacheFile.bytes,
      archiveSha256: cacheFile.sha256,
      materials: materials.map((item, index) => ({ requirementId: item.requirementId, classification: item.classification, referenceTarget: item.referenceTarget, routeWorkspaceId: item.routeWorkspaceId, routePath: item.routePath, sourceRequirementId: item.sourceRequirementId, originalPath: item.originalPath, archiveEntry: cacheEntries[index].path, bytes: item.bytes, sha256: item.sha256 }))
    };
    const cacheArtifact = finalizeFile({ path: artifactPath, kind: 'tiinex-external-payload-artifact', logicalKind: 'recipient-v2-workspace-dependency-cache-reference', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('workspace-scoped Handoff dependency cache', cacheFacts), content: renderRecipientV2ExternalPayload({ createdAt, parent: workspace.parent, title: `Workspace Dependency Cache — ${workspace.workspaceId}`, summary: 'Exact recipient-relative dependency bytes not satisfied by any qualified Workspace archive.', label: `${workspace.workspaceId} Handoff dependency cache`, kind: 'zip export', role: 'workspace-scoped Handoff dependency cache', location: archivePath, bytes: cacheFile.bytes, sha256: cacheFile.sha256, facts: cacheFacts }) });
    files.push(cacheArtifact, cacheFile);
    const projection = Object.freeze({ workspaceId: workspace.workspaceId, artifactPath, archivePath, materials: cacheFacts.materials });
    topology.caches.push(projection);
    cachePlanByWorkspace.set(workspace.workspaceId, { ...projection, parent: parentAuthority(cacheArtifact, 'tiinex.external.payload.v1', RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET, createdAt) });
  }

  const claimedDetached = new Set();
  for (const cache of topology.caches) for (const material of cache.materials || []) claimedDetached.add(`${material.requirementId}\u0000${material.referenceTarget}\u0000${material.sha256}`);
  for (const item of detached) {
    const key = `${item.requirementId}\u0000${item.referenceTarget}\u0000${item.sha256}`;
    if (!claimedDetached.has(key)) findings.push(finding('error', 'portable.handoff-v2-surface.cache.material-unowned', 'Detached dependency bytes are not claimed by any Workspace-scoped Handoff route cache.', { requirementId: item.requirementId || '', referenceTarget: item.referenceTarget || '' }));
  }

  for (const plan of routePlans) {
    const workspace = workspaceById.get(plan.workspace.workspaceId);
    if (!workspace) continue;
    const route = plan.route;
    const binding = bindingForWorkspace(descriptor, workspace.workspaceId);
    const cache = cachePlanByWorkspace.get(workspace.workspaceId) || null;
    const routeDimension = cache ? `001-${plan.workspace.ordinal}-1-${plan.ordinal}` : `001-${plan.workspace.ordinal}-${plan.ordinal}`;
    let lineageParent = cache?.parent || workspace.parent;
    let nextDimension = routeDimension;
    for (const requirement of route.materialRequirements?.participantRoles || []) {
      const target = participantRoleTarget(requirement, descriptor, workspaceById, cache);
      if (target.state !== 'qualified') {
        findings.push(finding('error', `portable.handoff-v2-surface.participant-role.${target.reason || 'unresolved'}`, 'Participant Role requirement did not resolve to one exact carried Workspace/cache representation.', { routeId: String(route.id || ''), requirementId: String(requirement.id || '') }));
        continue;
      }
      const roleToken = safeToken(requirement.roleLabel || requirement.name || target.referenceTarget || 'participant-role');
      const rolePointerPath = `${nextDimension}-${roleToken}-role-pointer.trace.md`;
      const roleFacts = {
        workspaceId: workspace.workspaceId,
        routeId: String(route.id || ''),
        participantRequirementId: String(requirement.id || ''),
        roleLabelHint: String(requirement.roleLabel || ''),
        referenceTarget: String(target.referenceTarget || ''),
        targetCarrierKind: target.carrierKind,
        targetWorkspaceId: String(target.targetWorkspaceId || ''),
        archivePath: target.archivePath,
        archiveSha256: target.archiveSha256,
        targetInnerPath: String(target.innerPath || ''),
        targetArchiveEntry: String(target.archiveEntry || ''),
        targetBytes: Number(target.bytes || 0),
        targetSha256: String(target.sha256 || '')
      };
      const rolePointer = finalizeFile({
        path: rolePointerPath,
        kind: 'participant-role-pointer',
        logicalKind: 'recipient-v2-participant-role-pointer',
        mediaType: 'text/markdown',
        transportFacts: recipientV2TransportFacts('participant-role', roleFacts),
        content: renderRecipientV2Pointer({
          createdAt,
          parent: lineageParent,
          role: 'participant-role',
          title: `Participant Role Pointer — ${String(requirement.roleLabel || requirement.name || 'Role')}`,
          summary: 'Package-local Pointer to one exact additional interaction participant Role artifact for the selected Handoff route.',
          prose: 'This Pointer contributes one additional participant Role to interaction grounding for its descendant Handoff route. It does not change Handoff From/To, prove a human holder, or create Role authority.',
          currentRead: [
            { label: 'Handoff Route', value: `\`${String(route.id || '')}\`` },
            ...(roleFacts.roleLabelHint ? [{ label: 'Role Label Hint', value: roleFacts.roleLabelHint }] : []),
            { label: 'Role Reference', value: roleFacts.referenceTarget ? `\`${roleFacts.referenceTarget}\`` : 'exact carried target' }
          ],
          destinations: [{ label: 'Exact participant Role carrier', display: `${target.archivePath} :: ${target.innerPath || target.archiveEntry}`, target: target.archivePath }],
          facts: roleFacts
        })
      });
      files.push(rolePointer);
      topology.participantRoles.push(Object.freeze({ pointerPath: rolePointerPath, workspaceId: workspace.workspaceId, routeId: String(route.id || ''), requirementId: String(requirement.id || ''), targetCarrierKind: target.carrierKind, targetWorkspaceId: String(target.targetWorkspaceId || ''), targetInnerPath: String(target.innerPath || target.archiveEntry || ''), targetSha256: String(target.sha256 || '') }));
      lineageParent = parentAuthority(rolePointer, 'tiinex.pointer.v1', RECIPIENT_V2_POINTER_SCHEMA_TARGET, createdAt);
      nextDimension = `${nextDimension}-1`;
    }
    const pointerPath = `${nextDimension}-handoff-pointer.trace.md`;
    const pointerFacts = {
      workspaceId: workspace.workspaceId,
      workspaceArtifactPath: workspace.workspacePath,
      workspaceArtifactSha256: workspace.workspaceSha256,
      archivePath: workspace.archivePath,
      archiveSha256: workspace.archiveSha256,
      sourceWorkspaceTargetInnerPath: workspace.sourceWorkspaceTargetInnerPath,
      sourceWorkspaceTargetSha256: workspace.sourceWorkspaceTargetSha256,
      workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''),
      handoffBytes: Number((binding?.entryMap?.entries || []).find((entry) => String(entry.path || '') === String(route.workspaceRelativePath || ''))?.bytes || 0),
      handoffSha256: String(route.sha256 || ''),
      routeId: String(route.id || ''),
      parties: route.parties || {},
      cacheArtifactPath: cache?.artifactPath || '',
      requiredContextBindings: Object.freeze((route.requiredClosure?.requirements || [])
        .filter((entry) => entry.state === 'qualified' && entry.resolution?.kind === 'workspace-archive-entry')
        .map((entry) => Object.freeze({
          requirementId: String(entry.requirementId || ''),
          name: String(entry.name || ''),
          referenceTarget: String(entry.referenceTarget || ''),
          workspaceId: String(entry.resolution?.workspaceId || ''),
          workspaceRelativePath: String(entry.resolution?.workspaceRelativePath || entry.resolution?.innerPath || ''),
          bytes: Number(entry.resolution?.bytes || 0),
          sha256: String(entry.resolution?.sha256 || '')
        })))
    };
    const pointer = finalizeFile({
      path: pointerPath,
      kind: 'handoff-route-pointer',
      logicalKind: 'recipient-v2-handoff-route-pointer',
      mediaType: 'text/markdown',
      transportFacts: recipientV2TransportFacts('handoff-route', pointerFacts),
      content: renderRecipientV2Pointer({
        createdAt,
        parent: lineageParent,
        role: 'handoff-route',
        title: `Handoff Route Pointer — ${String(route.parties?.to || workspace.workspaceId || 'recipient')}`,
        summary: 'Qualified package-local Pointer to one selected Handoff inside one exact Workspace archive representation.',
        prose: 'Follow the declared Parent chain for package lineage, then resolve the workspace-relative Handoff path against the exact Workspace archive bytes declared by this route.',
        currentRead: [
          { label: 'Workspace', value: `[${workspace.workspaceId}](${workspace.workspacePath})` },
          ...(pointerFacts.cacheArtifactPath ? [{ label: 'Workspace Dependency Cache', value: `[cache](${pointerFacts.cacheArtifactPath})` }] : []),
          { label: 'Handoff Workspace Path', value: `\`${String(route.workspaceRelativePath || '')}\`` }
        ],
        destinations: [{ label: 'Workspace archive containing the qualified Handoff route', display: `${workspace.archivePath} :: ${String(route.workspaceRelativePath || '')}`, target: workspace.archivePath }],
        facts: pointerFacts
      })
    });
    files.push(pointer);
    topology.routes.push(Object.freeze({ pointerPath, workspaceId: workspace.workspaceId, workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''), routeId: String(route.id || ''), sha256: String(route.sha256 || '') }));
  }

  const readDestinations = [
    ...(topology.bootstrap ? [{ label: 'Portable Tooling bootstrap', target: topology.bootstrap.artifactPath }] : []),
    ...topology.workspaces.map((workspace) => ({ label: `Workspace ${workspace.workspaceId}`, target: workspace.workspacePath })),
    ...topology.caches.map((cache) => ({ label: `Workspace dependency cache ${cache.workspaceId}`, target: cache.artifactPath })),
    ...topology.participantRoles.map((role) => ({ label: `Participant Role ${role.requirementId}`, target: role.pointerPath })),
    ...topology.routes.map((route) => ({ label: `Handoff route ${route.routeId || route.workspaceRelativeHandoffPath}`, target: route.pointerPath }))
  ];
  const readFacts = { format: RECIPIENT_V2_FORMAT_ID, packageRootPath: rootPath, entryArtifactPath: RECIPIENT_V2_READ_PATH, artifactSurface: 'flat-qualified-tiinex-artifacts-and-explicit-payload-zips', routeAuthority: 'qualified-handoff-route-pointer-plus-exact-handoff-bytes', routeSelectionAuthority: RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, siblingRouteInference: RECIPIENT_V2_SIBLING_ROUTE_INFERENCE, pathParentProjection: true, pathAuthority: false };
  const readFile = finalizeFile({
    path: RECIPIENT_V2_READ_PATH,
    kind: 'handoff-recovery-pointer',
    logicalKind: 'recipient-v2-recovery-orientation',
    mediaType: 'text/markdown',
    transportFacts: recipientV2TransportFacts('recovery-orientation', readFacts),
    content: renderRecipientV2Pointer({
      createdAt,
      parent: rootParent,
      role: 'recovery-orientation',
      title: 'READ BEFORE PROCEEDING — Tiinex Handoff Carrier',
      summary: 'Qualified recovery/orientation Pointer for the visible recipient-facing Handoff carrier.',
      prose: 'Read this artifact before traversing the sibling material nodes. The package-local numeric tree mirrors declared Parent continuity, while exact Workspace/archive/Handoff bytes must still independently qualify.',
      currentRead: recipientV2EntryCurrentRead(),
      destinations: readDestinations,
      facts: readFacts
    })
  });
  files.push(readFile);
  topology.read = Object.freeze({ path: RECIPIENT_V2_READ_PATH, sha256: readFile.sha256 });
  const transportManifest = buildRecipientV2TransportManifestFile(files, { format: RECIPIENT_V2_FORMAT_ID, packageRootPath: rootPath, entryArtifactPath: RECIPIENT_V2_READ_PATH });
  files.push(transportManifest);
  topology.transportManifest = Object.freeze({ path: transportManifest.path, sha256: transportManifest.sha256 });

  const duplicatePaths = duplicates(files.map((file) => file.path));
  for (const path of duplicatePaths) findings.push(finding('error', 'portable.handoff-v2-surface.path-duplicate', 'Recipient-facing v2 topology generated duplicate root paths.', { path }));
  for (const file of files) if (String(file.path || '').includes('/')) findings.push(finding('error', 'portable.handoff-v2-surface.path-nonflat', 'Recipient-facing v2 topology must expose only flat root files.', { path: file.path || '' }));
  const sortedFiles = [...files].sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));
  const status = findings.some((item) => item.severity === 'error') || !topology.workspaces.length || !topology.routes.length ? 'blocked' : 'ready';
  return deepFreeze({
    status,
    files: Object.freeze(sortedFiles),
    topology: deepFreeze(topology),
    findings: Object.freeze(findings),
    boundary: 'Recipient-facing v2 serialization only: a flat root of qualified Tiinex Markdown lineage nodes and explicitly owned ZIP companions. Numeric pathing deliberately mirrors declared package-local Parent continuity, but filenames alone never establish semantic authority.'
  });
}

function repathFinalizedFile(file = {}, path = '', overrides = {}) {
  const data = packageFileByteView(file);
  const bytes = Number(file.bytes || 0);
  const sha256 = String(file.sha256 || '');
  const fingerprint = String(file.fingerprint || '');
  if (bytes !== data.byteLength || !/^[0-9a-f]{64}$/i.test(sha256) || !fingerprint) {
    return finalizeFile({ ...file, ...overrides, path, requestedPath: path, data });
  }
  return Object.freeze({ ...file, ...overrides, path, requestedPath: path, data, bytes, sha256, fingerprint });
}

function parentAuthority(file, schemaId, schemaTarget, createdAt) {
  const markdown = new TextDecoder('utf-8').decode(packageFileBytes(file));
  const self = validatedC14nV2PrimarySelfDigest(markdown);
  if (self.state !== 'verified') throw new Error(`portable.handoff-v2-surface.parent-self-unverified:${String(file?.path || '')}:${self.reason || self.state}`);
  return Object.freeze({ path: String(file.path || ''), label: String(file.path || ''), schemaId, schemaTarget, createdAt, selfDigest: self.value });
}

function bindingForWorkspace(descriptor = {}, workspaceId = '') { return (descriptor.workspaceArchiveBindings || []).find((binding) => String(binding.workspaceId || '') === String(workspaceId || '')) || null; }

function buildBootstrapCarrier(source, createdAt, findings, parent) {
  const entries = source.map((file) => ({ path: String(file.path || '').slice('tiinex.bootstrap/'.length), data: packageFileBytes(file) })).filter((entry) => entry.path).sort((a, b) => a.path.localeCompare(b.path));
  if (!entries.length) return null;
  const zipBytes = exportFileMapZipUint8Array(entries, 'portable.handoff-v2-surface.bootstrap.path.invalid');
  const payloadPath = '001-2-bootstrap.zip';
  const artifactPath = '001-2-bootstrap.trace.md';
  const payload = finalizeFile({ path: payloadPath, kind: 'handoff-tooling-bootstrap-archive', logicalKind: 'recipient-v2-tooling-bootstrap-payload', mediaType: 'application/zip', data: zipBytes, boundary: 'Portable Tooling bootstrap payload. Runtime/source/JSON remain inside this explicitly referenced ZIP and gain no authority by archive placement.' });
  const identities = entries.map((entry) => ({ path: entry.path, bytes: entry.data.byteLength, sha256: sha256Hex(entry.data) }));
  const bootstrapFacts = { archivePath: payloadPath, archiveBytes: payload.bytes, archiveSha256: payload.sha256, entryCount: identities.length, totalBytes: identities.reduce((sum, item) => sum + item.bytes, 0), entriesFingerprint: sha256Hex(utf8Bytes(stableJson(identities))) };
  const artifact = finalizeFile({ path: artifactPath, kind: 'tiinex-external-payload-artifact', logicalKind: 'recipient-v2-tooling-bootstrap-reference', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('portable Tooling bootstrap runtime for recipient orientation and verification', bootstrapFacts), content: renderRecipientV2ExternalPayload({
    createdAt,
    parent,
    title: 'Portable Tooling Bootstrap Payload',
    summary: 'Qualified package-local payload node for the portable Tooling bootstrap archive.',
    label: 'portable Tooling bootstrap runtime',
    kind: 'zip export',
    role: 'portable Tooling bootstrap runtime for recipient orientation and verification',
    location: payloadPath,
    bytes: payload.bytes,
    sha256: payload.sha256,
    facts: bootstrapFacts
  }) });
  if (!entries.some((entry) => entry.path === 'manifest.json')) findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.manifest-missing', 'Bootstrap payload source lacks its existing manifest.json authority.'));
  return Object.freeze({ artifact, payload, projection: Object.freeze({ artifactPath, payloadPath, payloadSha256: payload.sha256, entryCount: identities.length }) });
}

function routeClaimsDetachedMaterial(route = {}, material = {}) {
  const scopedWorkspace = String(material.routeWorkspaceId || '').trim();
  const scopedPath = normalizeWorkspacePath(material.routePath || '');
  if (scopedWorkspace && scopedPath) return scopedWorkspace === String(route.workspaceId || '') && scopedPath === normalizeWorkspacePath(route.workspaceRelativePath || '');
  const requirements = route.materialRequirements || {};
  const all = [...(requirements.required || []), ...(requirements.reference || []), ...(requirements.endpointRoles || []), ...(requirements.participantRoles || []), ...(requirements.dependencies || [])];
  return all.some((requirement) => String(requirement.id || '') === String(material.requirementId || '') || (material.referenceTarget && String(requirement.reference?.target || '') === String(material.referenceTarget || '')));
}

function participantRoleTarget(requirement = {}, descriptor = {}, workspaceById = new Map(), owningCache = null) {
  const matches = (descriptor.materialized || []).filter((item) => String(item.requirementId || '') === String(requirement.id || ''));
  if (matches.length !== 1) return Object.freeze({ state: matches.length > 1 ? 'ambiguous' : 'unresolved', reason: matches.length > 1 ? 'material-ambiguous' : 'material-missing' });
  const material = matches[0];
  if (String(material.carrierKind || '') === 'workspace-archive-entry') {
    const targetWorkspace = workspaceById.get(String(material.workspaceId || ''));
    if (!targetWorkspace) return Object.freeze({ state: 'unresolved', reason: 'target-workspace-missing' });
    return Object.freeze({ state: 'qualified', carrierKind: 'workspace-archive-entry', targetWorkspaceId: String(material.workspaceId || ''), archivePath: targetWorkspace.archivePath, archiveSha256: targetWorkspace.archiveSha256, innerPath: String(material.workspaceRelativePath || ''), archiveEntry: '', bytes: Number(material.bytes || 0), sha256: String(material.sha256 || ''), referenceTarget: String(material.referenceTarget || requirement.reference?.target || '') });
  }
  if (!owningCache) return Object.freeze({ state: 'unresolved', reason: 'owning-cache-missing' });
  const cacheMaterial = (owningCache.materials || []).find((item) => String(item.requirementId || '') === String(requirement.id || ''));
  if (!cacheMaterial) return Object.freeze({ state: 'unresolved', reason: 'cache-material-missing' });
  return Object.freeze({ state: 'qualified', carrierKind: 'workspace-cache-entry', targetWorkspaceId: '', archivePath: owningCache.archivePath, archiveSha256: '', innerPath: '', archiveEntry: String(cacheMaterial.archiveEntry || ''), bytes: Number(cacheMaterial.bytes || 0), sha256: String(cacheMaterial.sha256 || ''), referenceTarget: String(cacheMaterial.referenceTarget || requirement.reference?.target || '') });
}

function detachedMaterial(descriptor, byPath, findings) {
  const out = [];
  for (const material of descriptor.materialized || []) {
    if (String(material.carrierKind || '') === 'workspace-archive-entry') continue;
    const file = oneFile(byPath, material.packagePath, findings, 'detached-material');
    if (!file) continue;
    const data = packageFileBytes(file);
    const sha256 = sha256Hex(data);
    if (Number(material.bytes || 0) !== data.byteLength || String(material.sha256 || '') !== sha256) findings.push(finding('error', 'portable.handoff-v2-surface.cache.material-identity-mismatch', 'Detached material bytes diverge from qualified closure identity.', { requirementId: material.requirementId || '' }));
    out.push(Object.freeze({ requirementId: String(material.requirementId || ''), classification: String(material.classification || ''), referenceTarget: String(material.referenceTarget || ''), routeWorkspaceId: String(material.routeWorkspaceId || ''), routePath: String(material.routePath || ''), sourceRequirementId: String(material.sourceRequirementId || ''), originalPath: String(material.originalPath || ''), bytes: data.byteLength, sha256, data }));
  }
  return out.sort((a, b) => a.requirementId.localeCompare(b.requirementId));
}
function groupRoutes(routes = []) { const map = new Map(); for (const route of [...routes].sort((a, b) => String(a.workspaceId || '').localeCompare(String(b.workspaceId || '')) || String(a.workspaceRelativePath || '').localeCompare(String(b.workspaceRelativePath || '')))) { const id = String(route.workspaceId || ''); const list = map.get(id) || []; list.push(route); map.set(id, list); } return map; }
function uniqueFileIndex(files, findings) { const map = new Map(); for (const file of files) { const path = String(file.path || ''); const list = map.get(path) || []; list.push(file); map.set(path, list); } for (const [path, list] of map) if (list.length > 1) findings.push(finding('error', 'portable.handoff-v2-surface.source-path-ambiguous', 'Internal qualified source contains duplicate package paths.', { path, count: list.length })); return map; }
function oneFile(byPath, path, findings, role) { const list = byPath.get(String(path || '')) || []; if (list.length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.source-unresolvable', 'Recipient-facing topology source byte is not uniquely resolvable.', { role, path: String(path || ''), count: list.length })); return list.length === 1 ? list[0] : null; }
function duplicates(values = []) { const counts = new Map(); for (const value of values) counts.set(value, (counts.get(value) || 0) + 1); return [...counts].filter(([, count]) => count > 1).map(([value]) => value); }
function normalizeWorkspacePath(value = '') { return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function safeToken(value = '') { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'workspace'; }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
