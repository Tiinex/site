import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { renderRecipientV2ExternalPayload, renderRecipientV2Pointer } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE, recipientV2EntryCurrentRead } from './recipientV2.entryContract.js';
import { recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { buildRecipientV2BootstrapCarrier, recipientV2ParentAuthority } from './recipientV2.topology.workspaces.js';
import { buildEndpointRolePointerChain, buildParticipantRolePointerChain } from './recipientV2.endpointRolePointers.js';
import { bindingForWorkspace, detachedMaterial, duplicates, finding, roleMaterialTarget, routeClaimsDetachedMaterial, safeToken, uniqueFileIndex } from './recipientV2.topology.materials.js';
import { RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET } from './recipientV2.packageV1.constants.js';
import { renderHandoffPackageV1 } from './recipientV2.packageV1.contract.js';
import { inspectRecipientFacingV2PackageV1 } from './recipientV2.packageV1.inspect.js';
import { blocked, deepFreeze, exactFile, workspaceSchemaTarget } from './recipientV2.packageV1.shared.js';

export function buildRecipientFacingV2PackageV1(input = {}) {
  const sourceSurface = input.sourceSurface || null;
  const descriptor = input.descriptor || input.bundle?.handoffClosure || {};
  const carrier = input.carrierProjection || {};
  const createdAt = input.createdAt || input.bundle?.manifest?.createdAt || input.bundle?.builtAt || '';
  const findings = [];
  if (!sourceSurface || sourceSurface.status !== 'ready') return blocked('source-surface-unready', sourceSurface?.findings || []);
  const routes = (carrier.routes || []).filter((route) => route.state === 'qualified');
  const selector = String(input.routeSelector || input.routeId || '').trim();
  const selected = selector ? routes.filter((route) => route.id === selector || route.workspaceRelativePath === selector || `${String(route.workspaceId || '')}:${String(route.workspaceRelativePath || '')}` === selector || `handoff-route:${String(route.workspaceId || '')}:${String(route.workspaceRelativePath || '')}` === selector) : routes;
  if (selected.length !== 1) return blocked('route-selection-unresolved', [finding('error', 'portable.handoff-package-v1.route-selection-unresolved', 'Package v1 manufacture requires exactly one qualified selected Handoff route.', { count: selected.length })]);
  const route = selected[0];
  const sourceWorkspaceById = new Map((sourceSurface.topology?.workspaces || []).map((item) => [String(item.workspaceId || ''), item]));
  const sourceByPath = new Map((sourceSurface.files || []).map((file) => [String(file.path || ''), file]));
  // The package-v1 carrier preserves the complete inherited Workspace source chain.
  // Route closure remains selected and minimal, but complete package-local Workspace
  // bindings are not pruned merely because one carried Workspace is not on the
  // selected Handoff's pre-Handoff closure.
  const workspaceIds = [...sourceWorkspaceById.keys()].filter(Boolean).sort();
  const workspacePlans = workspaceIds.map((workspaceId, index) => Object.freeze({ workspaceId, ordinal: index + 3, prefix: `001-${index + 3}`, slug: safeToken(workspaceId) }));
  const files = [];
  const topology = { root: null, read: null, workspaces: [], caches: [], endpointRoles: [], participantRoles: [], routes: [], bootstrap: null };
  const workspaceById = new Map();

  for (const plan of workspacePlans) {
    const source = sourceWorkspaceById.get(plan.workspaceId);
    if (!source || String(source.coverage || '') !== 'complete') { findings.push(finding('error', 'portable.handoff-package-v1.workspace.complete-required', 'Package-local direct Workspace binding requires one complete source snapshot.', { workspaceId: plan.workspaceId })); continue; }
    const sourceArchive = sourceByPath.get(String(source.archivePath || ''));
    if (!sourceArchive) { findings.push(finding('error', 'portable.handoff-package-v1.workspace.archive-missing', 'Selected complete Workspace archive is unavailable.', { workspaceId: plan.workspaceId })); continue; }
    const archiveData = packageFileByteView(sourceArchive);
    const parsed = inspectStoredWorkspaceArchive(archiveData, { ownedBytes: true });
    if (parsed.state !== 'qualified') { findings.push(finding('error', 'portable.handoff-package-v1.workspace.archive-invalid', 'Selected complete Workspace snapshot bytes do not qualify.', { workspaceId: plan.workspaceId })); continue; }
    const innerPath = String(source.sourceWorkspaceTargetInnerPath || '');
    const matches = (parsed.entries || []).filter((entry) => entry.path === innerPath);
    if (matches.length !== 1) { findings.push(finding('error', 'portable.handoff-package-v1.workspace.target-unresolved', 'Workspace artifact inner path must resolve exactly once inside the complete snapshot.', { workspaceId: plan.workspaceId, innerPath, count: matches.length })); continue; }
    const targetData = packageFileByteView({ data: matches[0].data });
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: innerPath, targetData, entries: parsed.entries || [] });
    if (targetQualification.state !== 'qualified') { findings.push(finding('error', 'portable.handoff-package-v1.workspace.target-unqualified', 'Exact Workspace artifact bytes inside the snapshot do not qualify.', { workspaceId: plan.workspaceId, reasons: targetQualification.reasons || [] })); continue; }
    const workspacePath = `${plan.prefix}-${plan.slug}.workspace.md`;
    const archivePath = `${plan.prefix}-${plan.slug}.workspace.zip`;
    const workspaceFile = exactFile(workspacePath, targetData, 'recipient-v2-package-v1-exact-workspace-artifact', 'text/markdown');
    const archiveFile = exactFile(archivePath, archiveData, 'recipient-v2-package-v1-complete-workspace-snapshot', 'application/zip');
    files.push(workspaceFile, archiveFile);
    const parent = recipientV2ParentAuthority(workspaceFile, 'tiinex.workspace.v1', workspaceSchemaTarget(targetQualification), createdAt);
    const projection = Object.freeze({
      workspaceId: plan.workspaceId, ordinal: plan.ordinal, workspacePath, workspaceSha256: workspaceFile.sha256,
      archivePath, archiveSha256: archiveFile.sha256, sourceWorkspaceTargetInnerPath: innerPath,
      sourceWorkspaceTargetSha256: workspaceFile.sha256, sourceWorkspaceTargetBytes: workspaceFile.bytes, coverage: 'complete'
    });
    topology.workspaces.push(projection);
    workspaceById.set(plan.workspaceId, { ...projection, file: workspaceFile, parent });
  }

  if (findings.some((item) => item.severity === 'error')) return blocked('workspace-binding-blocked', findings);

  const packageFile = finalizeFile({
    path: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH,
    kind: 'tiinex-handoff-package-artifact',
    logicalKind: 'recipient-v2-package-v1-root',
    mediaType: 'text/markdown',
    content: renderHandoffPackageV1({ createdAt, workspaces: topology.workspaces, carrierLineage: carrier.lineage || {}, startPath: RECIPIENT_V2_READ_PATH, bootstrapPath: hasBootstrap(input.bundle) ? '001-2-bootstrap.trace.md' : '' })
  });
  files.push(packageFile);
  topology.root = Object.freeze({ path: packageFile.path, sha256: packageFile.sha256 });
  const packageParent = recipientV2ParentAuthority(packageFile, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET, createdAt);

  const bootstrapSource = (input.bundle?.files || []).filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/'));
  if (bootstrapSource.length) {
    const bootstrap = buildRecipientV2BootstrapCarrier(bootstrapSource, createdAt, findings, packageParent);
    if (bootstrap) { files.push(bootstrap.artifact, bootstrap.payload); topology.bootstrap = bootstrap.projection; }
  }

  const byPath = uniqueFileIndex(input.bundle?.files || [], findings);
  const detached = detachedMaterial(descriptor, byPath, findings);
  const selectedDetached = detached.filter((item) => routeClaimsDetachedMaterial(route, item));
  const owningWorkspace = workspaceById.get(String(route.workspaceId || ''));
  let cache = null;
  if (selectedDetached.length && owningWorkspace) {
    const plan = workspacePlans.find((item) => item.workspaceId === owningWorkspace.workspaceId);
    const artifactPath = `${plan.prefix}-1-cache.trace.md`;
    const archivePath = `${plan.prefix}-1-cache.zip`;
    const cacheEntries = selectedDetached.map((item, index) => ({ path: `material/${index + 1}-${safeToken(item.requirementId || item.referenceTarget || 'material')}.bin`, data: item.data }));
    const cacheBytes = exportFileMapZipUint8Array(cacheEntries, 'portable.handoff-package-v1.cache.path.invalid');
    const cacheFile = finalizeFile({ path: archivePath, kind: 'handoff-material-cache', logicalKind: 'recipient-v2-package-v1-workspace-dependency-cache', mediaType: 'application/zip', data: cacheBytes });
    const cacheFacts = {
      workspaceId: owningWorkspace.workspaceId, archivePath, archiveBytes: cacheFile.bytes, archiveSha256: cacheFile.sha256,
      materials: selectedDetached.map((item, index) => ({ requirementId: item.requirementId, classification: item.classification, referenceTarget: item.referenceTarget, routeWorkspaceId: item.routeWorkspaceId, routePath: item.routePath, sourceRequirementId: item.sourceRequirementId, originalPath: item.originalPath, archiveEntry: cacheEntries[index].path, bytes: item.bytes, sha256: item.sha256 }))
    };
    const cacheArtifact = finalizeFile({ path: artifactPath, kind: 'tiinex-external-payload-artifact', logicalKind: 'recipient-v2-package-v1-workspace-dependency-cache-reference', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('workspace-scoped Handoff dependency cache', cacheFacts), content: renderRecipientV2ExternalPayload({ createdAt, parent: owningWorkspace.parent, title: `Workspace Dependency Cache — ${owningWorkspace.workspaceId}`, summary: 'Exact route-bounded dependency bytes not satisfied by a complete carried Workspace snapshot.', label: `${owningWorkspace.workspaceId} Handoff dependency cache`, kind: 'zip export', role: 'workspace-scoped Handoff dependency cache', location: archivePath, bytes: cacheFile.bytes, sha256: cacheFile.sha256, facts: cacheFacts }) });
    files.push(cacheArtifact, cacheFile);
    cache = { workspaceId: owningWorkspace.workspaceId, artifactPath, archivePath, materials: cacheFacts.materials, parent: recipientV2ParentAuthority(cacheArtifact, 'tiinex.external.payload.v1', RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET, createdAt) };
    topology.caches.push(Object.freeze({ workspaceId: cache.workspaceId, artifactPath, archivePath, materials: cache.materials }));
  }

  if (!owningWorkspace) findings.push(finding('error', 'portable.handoff-package-v1.route.workspace-unresolved', 'Selected Handoff route owning Workspace is not carried.'));
  else {
    const plan = workspacePlans.find((item) => item.workspaceId === owningWorkspace.workspaceId);
    const binding = bindingForWorkspace(descriptor, owningWorkspace.workspaceId);
    let lineageParent = cache?.parent || owningWorkspace.parent;
    let nextDimension = cache ? `${plan.prefix}-1-1` : `${plan.prefix}-1`;
    const endpointChain = buildEndpointRolePointerChain({ requirements: route.materialRequirements?.endpointRoles || [], descriptor, workspaceById, cache, workspace: owningWorkspace, route, createdAt, lineageParent, nextDimension, resolveRoleMaterialTarget: roleMaterialTarget, parentAuthority: recipientV2ParentAuthority });
    files.push(...endpointChain.files); topology.endpointRoles.push(...endpointChain.roles); findings.push(...endpointChain.findings); lineageParent = endpointChain.lineageParent; nextDimension = endpointChain.nextDimension;
    const participantChain = buildParticipantRolePointerChain({ requirements: route.materialRequirements?.participantRoles || [], descriptor, workspaceById, cache, workspace: owningWorkspace, route, createdAt, lineageParent, nextDimension, resolveRoleMaterialTarget: roleMaterialTarget, parentAuthority: recipientV2ParentAuthority });
    files.push(...participantChain.files); topology.participantRoles.push(...participantChain.roles); findings.push(...participantChain.findings); lineageParent = participantChain.lineageParent; nextDimension = participantChain.nextDimension;
    const pointerPath = `${nextDimension}-handoff-pointer.trace.md`;
    const routeEntry = (binding?.entryMap?.entries || []).find((entry) => String(entry.path || '') === String(route.workspaceRelativePath || ''));
    const pointerFacts = {
      workspaceId: owningWorkspace.workspaceId, workspaceArtifactPath: owningWorkspace.workspacePath, workspaceArtifactSha256: owningWorkspace.workspaceSha256,
      archivePath: owningWorkspace.archivePath, archiveSha256: owningWorkspace.archiveSha256, sourceWorkspaceTargetInnerPath: owningWorkspace.sourceWorkspaceTargetInnerPath,
      sourceWorkspaceTargetSha256: owningWorkspace.sourceWorkspaceTargetSha256, workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''), handoffBytes: Number(routeEntry?.bytes || 0), handoffSha256: String(route.sha256 || ''), routeId: String(route.id || ''), parties: route.parties || {}, cacheArtifactPath: cache?.artifactPath || '',
      requiredContextBindings: Object.freeze((route.requiredClosure?.requirements || []).filter((entry) => entry.state === 'qualified' && entry.resolution?.kind === 'workspace-archive-entry').map((entry) => Object.freeze({ requirementId: String(entry.requirementId || ''), name: String(entry.name || ''), referenceTarget: String(entry.referenceTarget || ''), workspaceId: String(entry.resolution?.workspaceId || ''), workspaceRelativePath: String(entry.resolution?.workspaceRelativePath || entry.resolution?.innerPath || ''), bytes: Number(entry.resolution?.bytes || 0), sha256: String(entry.resolution?.sha256 || '') })))
    };
    const pointer = finalizeFile({ path: pointerPath, kind: 'handoff-route-pointer', logicalKind: 'recipient-v2-package-v1-handoff-route-pointer', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('handoff-route', pointerFacts), content: renderRecipientV2Pointer({ createdAt, parent: lineageParent, role: 'handoff-route', title: `Handoff Route Pointer — ${String(route.parties?.to || owningWorkspace.workspaceId || 'recipient')}`, summary: 'Qualified package-local Pointer to one authoritative Handoff inside one complete Workspace snapshot.', prose: 'Follow only this Pointer carrier-ancestor closure for pre-Handoff package grounding, then resolve the authoritative Handoff path against the exact bound Workspace snapshot.', currentRead: [{ label: 'Workspace Id', value: `\`${owningWorkspace.workspaceId}\`` }, { label: 'Workspace', value: `[${owningWorkspace.workspaceId}](${owningWorkspace.workspacePath})` }, { label: 'Route Id', value: `\`${String(route.id || '')}\`` }, ...(pointerFacts.cacheArtifactPath ? [{ label: 'Workspace Dependency Cache', value: `[cache](${pointerFacts.cacheArtifactPath})` }] : []), { label: 'Handoff Workspace Path', value: `\`${String(route.workspaceRelativePath || '')}\`` }], destinations: [{ label: 'Workspace snapshot containing the qualified Handoff route', display: `${owningWorkspace.archivePath} :: ${String(route.workspaceRelativePath || '')}`, target: owningWorkspace.archivePath }], facts: pointerFacts }) });
    files.push(pointer);
    topology.routes.push(Object.freeze({ pointerPath, workspaceId: owningWorkspace.workspaceId, workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''), routeId: String(route.id || ''), sha256: String(route.sha256 || '') }));
  }

  const readFacts = { format: RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, packageRootPath: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, entryArtifactPath: RECIPIENT_V2_READ_PATH, artifactSurface: 'tiinex.handoff.package.v1-plus-exact-complete-workspace-snapshots', routeAuthority: 'qualified-handoff-route-pointer-plus-exact-handoff-bytes', routeSelectionAuthority: RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, siblingRouteInference: RECIPIENT_V2_SIBLING_ROUTE_INFERENCE, carrierLineage: carrier.lineage || null, pathParentProjection: true, pathAuthority: false };
  const readFile = finalizeFile({ path: RECIPIENT_V2_READ_PATH, kind: 'handoff-recovery-pointer', logicalKind: 'recipient-v2-package-v1-recovery-orientation', mediaType: 'text/markdown', transportFacts: recipientV2TransportFacts('recovery-orientation', readFacts), content: renderRecipientV2Pointer({ createdAt, parent: packageParent, role: 'recovery-orientation', title: 'READ BEFORE PROCEEDING — Tiinex Handoff Carrier', summary: 'Qualified recovery/orientation Pointer for the package-v1 recipient carrier.', prose: 'Read this Start artifact first, qualify the declared Tooling bootstrap, then continue from the exact supplied Handoff Pointer path. Do not infer sibling routes or derive semantic authority from package placement.', currentRead: [...recipientV2EntryCurrentRead(), { label: 'Package Artifact', value: `[Handoff Package](${RECIPIENT_V2_PACKAGE_V1_ROOT_PATH})` }, { label: 'Carrier Dimension', value: `\`${String(carrier.lineage?.dimension || '001')}\`` }, ...(carrier.lineage?.parentDimension ? [{ label: 'Parent Carrier Dimension', value: `\`${String(carrier.lineage.parentDimension)}\`` }] : []), { label: 'Carrier Checkpoint', value: String(carrier.lineage?.checkpointKind || 'progression') }], destinations: [{ label: 'Handoff Package contract', target: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH }, ...(topology.bootstrap ? [{ label: 'Portable Tooling bootstrap', target: topology.bootstrap.artifactPath }] : []), ...topology.workspaces.map((workspace) => ({ label: `Workspace ${workspace.workspaceId}`, target: workspace.workspacePath })), ...topology.routes.map((item) => ({ label: `Selected Handoff route ${item.routeId || item.workspaceRelativeHandoffPath}`, target: item.pointerPath }))], facts: readFacts }) });
  files.push(readFile); topology.read = Object.freeze({ path: readFile.path, sha256: readFile.sha256 });

  for (const duplicate of duplicates(files.map((file) => file.path))) findings.push(finding('error', 'portable.handoff-package-v1.path-duplicate', 'Package v1 generated duplicate package-local paths.', { path: duplicate }));
  for (const file of files) if (String(file.path || '').includes('/')) findings.push(finding('error', 'portable.handoff-package-v1.path-nonflat', 'Package v1 root surface must remain flat.', { path: file.path || '' }));
  const sortedFiles = [...files].sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));
  const bundle = { ...(input.bundle || {}), files: Object.freeze(sortedFiles), handoffClosure: null, transportFormat: RECIPIENT_V2_PACKAGE_V1_FORMAT_ID };
  const inspection = inspectRecipientFacingV2PackageV1(bundle);
  return Object.freeze({ status: inspection.status === 'valid' && !findings.some((item) => item.severity === 'error') ? 'ready' : 'blocked', files: Object.freeze(sortedFiles), topology: deepFreeze(topology), inspection, findings: Object.freeze([...findings, ...(inspection.findings || [])]), boundary: 'Recipient-facing tiinex.handoff.package.v1 carrier with exact complete Workspace artifacts/snapshots, bootstrap/cache External Payload ownership retained, and no redundant Workspace External Payload or Workspace Representation companions.' });
}

function hasBootstrap(bundle = {}) { return (bundle.files || []).some((file) => String(file.path || '').startsWith('tiinex.bootstrap/')); }
