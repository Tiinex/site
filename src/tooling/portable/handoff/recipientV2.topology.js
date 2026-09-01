import { finalizeFile } from '../../../export/package.fileMap.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import {
  RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET,
  RECIPIENT_V2_POINTER_SCHEMA_TARGET,
  renderRecipientV2ExternalPayload,
  renderRecipientV2Pointer
} from './recipientV2.artifacts.js';
import { selectRecipientRoutes } from './recipientV2.routeSelection.js';
import { recipientPackageRootPath } from './recipientV2.topology.helpers.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE, recipientV2EntryCurrentRead } from './recipientV2.entryContract.js';
import { buildRecipientV2TransportManifestFile, recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { buildRecipientFacingV2ArtifactFirstPhase1, buildRecipientFacingV2ArtifactFirstPhase2Clean } from './recipientV2.artifactFirstPhase1.js';
import { buildEndpointRolePointerChain, buildParticipantRolePointerChain } from './recipientV2.endpointRolePointers.js';
import {
  bindingForWorkspace,
  deepFreeze,
  detachedMaterial,
  duplicates,
  finding,
  groupRoutes,
  roleMaterialTarget,
  routeClaimsDetachedMaterial,
  safeToken,
  uniqueFileIndex
} from './recipientV2.topology.materials.js';
import {
  buildRecipientV2BootstrapCarrier,
  buildRecipientV2WorkspaceCarriers,
  recipientV2ParentAuthority
} from './recipientV2.topology.workspaces.js';

export const RECIPIENT_V2_READ_PATH = '001-1-READ-BEFORE-PROCEEDING.trace.md';
export const RECIPIENT_V2_FORMAT_ID = 'tiinex-recipient-facing-handoff-v2-flat';

export function buildRecipientFacingV2Topology(input = {}) {
  const artifactFirst = input.legacyRecipientV2Compatibility !== true;
  const sourceSurface = buildRecipientFacingV2TopologyLegacy({
    ...input,
    ...(artifactFirst ? { routeSelector: '' } : {}),
    artifactFirstDualProjectionPhase1: false,
    artifactFirstCleanCarrierPhase2: false,
    legacyRecipientV2Compatibility: false
  });
  if (input.legacyRecipientV2Compatibility === true) return sourceSurface;
  if (input.artifactFirstDualProjectionPhase1 === true) return buildRecipientFacingV2ArtifactFirstPhase1({ ...input, sourceSurface });
  const explicitRouteSelector = String(input.routeSelector || input.routeId || '').trim();
  if (!explicitRouteSelector && (sourceSurface.topology?.routes || []).length > 1) return sourceSurface;
  return buildRecipientFacingV2ArtifactFirstPhase2Clean({ ...input, sourceSurface });
}

function buildRecipientFacingV2TopologyLegacy(input = {}) {
  const internalBundle = input.bundle || {};
  const descriptor = input.descriptor || internalBundle.handoffClosure || {};
  const carrier = input.carrierProjection || {};
  const createdAt = input.createdAt || internalBundle.manifest?.createdAt || internalBundle.builtAt || '';
  const findings = [];
  const files = [];
  const topology = { root: null, read: null, workspaces: [], caches: [], endpointRoles: [], participantRoles: [], routes: [], bootstrap: null };
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
  const rootParent = recipientV2ParentAuthority(rootFile, 'tiinex.pointer.v1', RECIPIENT_V2_POINTER_SCHEMA_TARGET, createdAt);

  if (bootstrapSource.length) {
    const bootstrap = buildRecipientV2BootstrapCarrier(bootstrapSource, createdAt, findings, rootParent);
    if (bootstrap) {
      files.push(bootstrap.artifact, bootstrap.payload);
      topology.bootstrap = bootstrap.projection;
    }
  }

  const workspaceById = buildRecipientV2WorkspaceCarriers({
    workspacePlans,
    byPath,
    findings,
    createdAt,
    rootParent,
    files,
    topology
  });


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
    cachePlanByWorkspace.set(workspace.workspaceId, { ...projection, parent: recipientV2ParentAuthority(cacheArtifact, 'tiinex.external.payload.v1', RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET, createdAt) });
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
    const endpointChain = buildEndpointRolePointerChain({
      requirements: route.materialRequirements?.endpointRoles || [],
      descriptor,
      workspaceById,
      cache,
      workspace,
      route,
      createdAt,
      lineageParent,
      nextDimension,
      resolveRoleMaterialTarget: roleMaterialTarget,
      parentAuthority: recipientV2ParentAuthority
    });
    files.push(...endpointChain.files);
    topology.endpointRoles.push(...endpointChain.roles);
    findings.push(...endpointChain.findings);
    lineageParent = endpointChain.lineageParent;
    nextDimension = endpointChain.nextDimension;
    const participantChain = buildParticipantRolePointerChain({
      requirements: route.materialRequirements?.participantRoles || [],
      descriptor,
      workspaceById,
      cache,
      workspace,
      route,
      createdAt,
      lineageParent,
      nextDimension,
      resolveRoleMaterialTarget: roleMaterialTarget,
      parentAuthority: recipientV2ParentAuthority
    });
    files.push(...participantChain.files);
    topology.participantRoles.push(...participantChain.roles);
    findings.push(...participantChain.findings);
    lineageParent = participantChain.lineageParent;
    nextDimension = participantChain.nextDimension;
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
    ...topology.endpointRoles.map((role) => ({ label: `Endpoint Role ${role.requirementId}`, target: role.pointerPath })),
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

