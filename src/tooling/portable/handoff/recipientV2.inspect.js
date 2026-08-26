import { packageFileByteView, packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { buildHandoffCarrierProjection } from './carrierProjection.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { handoffWorkspaceProviderForId } from './workspaceByteProvider.js';
import { inspectRecipientV2Artifact, parseRecipientV2Facts } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_FORMAT_ID, RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE } from './recipientV2.entryContract.js';
import { buildQualifiedRecipientV2WorkspaceByteProvider, dedupeFindings, deepFreeze, finding, indexRecipientFiles, inspectRecipientZipPayload, isForbiddenLegacyV2Path, oneRecipientFile, recipientColdProjection, recipientEntriesFingerprint, recipientWorkspaceDescriptor, virtualCacheMaterial } from './recipientV2.inspect.helpers.js';
import { buildPackageLocalParentResolver, inspectPackageLocalLineage, inspectParticipantRolePointers, inspectRoutePointers, parentTrace } from './recipientV2.lineage.js';

export const RECIPIENT_V2_TOPOLOGY_INSPECTION_SCHEMA_ID = 'tiinex.portable.recipient-facing-handoff-v2.inspection.v1';

export function roundTripRecipientFacingV2Topology(bundle = {}, sourceInspection = null) {
  sourceInspection = sourceInspection || inspectRecipientFacingV2Topology(bundle);
  if (sourceInspection.status !== 'valid') return deepFreeze({ schema: 'tiinex.portable.recipient-facing-handoff-v2.roundtrip.v1', status: 'failed', comparison: 'not-run', inspection: sourceInspection, findings: sourceInspection.findings });
  let zipBytes;
  try { zipBytes = exportFileMapZipUint8Array((bundle.files || []).map((file) => ({ path: String(file.path || ''), data: packageFileBytes(file) })), 'portable.handoff-v2-surface.roundtrip.path.invalid'); }
  catch (error) { return deepFreeze({ schema: 'tiinex.portable.recipient-facing-handoff-v2.roundtrip.v1', status: 'failed', comparison: 'not-run', inspection: sourceInspection, findings: Object.freeze([finding('error', 'portable.handoff-v2-surface.roundtrip.serialize-failed', 'Recipient-facing v2 serialization failed.', { detail: String(error?.message || error || '') })]) }); }
  const parsed = inspectStoredWorkspaceArchive(zipBytes, { ownedBytes: true });
  if (parsed.state !== 'qualified') return deepFreeze({ schema: 'tiinex.portable.recipient-facing-handoff-v2.roundtrip.v1', status: 'failed', comparison: 'mismatch', inspection: sourceInspection, findings: Object.freeze((parsed.findings || []).map((item) => finding('error', 'portable.handoff-v2-surface.roundtrip.zip-invalid', item.message || 'Serialized recipient-facing v2 ZIP is invalid.', { cause: item.code || '' }))) });
  const files = (parsed.entries || []).map((entry) => Object.freeze({ path: entry.path, data: entry.data, bytes: entry.bytes, sha256: entry.sha256 }));
  const reinspection = inspectRecipientFacingV2Topology({ ...bundle, files: Object.freeze(files) });
  const source = new Map((bundle.files || []).map((file) => [String(file.path || ''), `${packageFileBytes(file).byteLength}:${sha256Hex(packageFileBytes(file))}`]));
  const received = new Map(files.map((file) => [String(file.path || ''), `${packageFileBytes(file).byteLength}:${sha256Hex(packageFileBytes(file))}`]));
  const comparison = source.size === received.size && [...source].every(([path, identity]) => received.get(path) === identity) ? 'match' : 'mismatch';
  const status = comparison === 'match' && reinspection.status === 'valid' ? 'passed' : 'failed';
  return deepFreeze({ schema: 'tiinex.portable.recipient-facing-handoff-v2.roundtrip.v1', status, comparison, bytes: zipBytes.byteLength, inspection: reinspection, findings: reinspection.findings });
}

export function inspectRecipientFacingV2Topology(bundle = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const findings = [];
  const index = indexRecipientFiles(files, findings);
  const forbidden = files.filter((file) => isForbiddenLegacyV2Path(file.path));
  for (const file of forbidden) findings.push(finding('error', 'portable.handoff-v2-surface.legacy-envelope-exposed', 'Recipient-facing v2 package exposes a rejected legacy control/envelope path.', { path: file.path || '' }));
  for (const file of files) if (String(file.path || '').includes('/')) findings.push(finding('error', 'portable.handoff-v2-surface.path-nonflat', 'Recipient-facing v2 package root must be flat.', { path: file.path || '' }));

  const generatedFiles = [];
  const untypedMarkdown = [];
  for (const file of files) {
    if (!/\.md$/i.test(String(file.path || ''))) continue;
    const markdown = decodeUtf8(packageFileByteView(file));
    if (parseRecipientV2Facts(markdown)) generatedFiles.push(file);
    else untypedMarkdown.push(file);
  }
  const resolveParent = buildPackageLocalParentResolver(index);
  const generatedArtifacts = generatedFiles.map((file) => inspectRecipientV2Artifact(file, { resolveParent, allowPackageLocalParentOrigin: true }));
  for (const artifact of generatedArtifacts) findings.push(...artifact.findings);
  for (const file of untypedMarkdown) findings.push(finding('error', 'portable.handoff-v2-surface.markdown-unqualified', 'Recipient-facing v2 root contains Markdown that is not one generated qualified package-local Tiinex artifact.', { path: file.path || '' }));

  const packageRoots = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'package-root');
  const rootArtifact = packageRoots.length === 1 ? packageRoots[0] : null;
  if (packageRoots.length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.package-root.unresolvable', 'Recipient-facing v2 package must expose exactly one package-local Tiinex root artifact.', { count: packageRoots.length }));
  else {
    if (rootArtifact.conformance?.parentContinuity?.parentDeclared) findings.push(finding('error', 'portable.handoff-v2-surface.package-root.parent-invalid', 'Package-local root artifact must not declare a Parent.', { path: rootArtifact.path }));
    if (String(rootArtifact.facts?.entryArtifactPath || '') !== RECIPIENT_V2_READ_PATH) findings.push(finding('error', 'portable.handoff-v2-surface.package-root.entry-mismatch', 'Package-local root must explicitly declare the fixed recipient entry artifact.', { path: rootArtifact.path, expectedEntry: RECIPIENT_V2_READ_PATH, observedEntry: String(rootArtifact.facts?.entryArtifactPath || '') }));
  }

  const readArtifact = generatedArtifacts.find((item) => item.path === RECIPIENT_V2_READ_PATH) || null;
  if (!readArtifact) findings.push(finding('error', 'portable.handoff-v2-surface.read-missing', 'Recipient-facing v2 package is missing its qualified READ-BEFORE Pointer.'));
  else {
    if (readArtifact.schemaId !== 'tiinex.pointer.v1' || readArtifact.facts?.role !== 'recovery-orientation' || readArtifact.facts?.format !== RECIPIENT_V2_FORMAT_ID) findings.push(finding('error', 'portable.handoff-v2-surface.read-role-invalid', 'READ-BEFORE artifact does not identify the supported flat recipient-facing v2 surface.', { path: readArtifact.path || '' }));
    if (String(readArtifact.facts?.entryArtifactPath || '') !== RECIPIENT_V2_READ_PATH) findings.push(finding('error', 'portable.handoff-v2-surface.read.entry-mismatch', 'READ-BEFORE artifact must explicitly identify itself as the fixed recipient entry artifact.', { path: readArtifact.path || '', expectedEntry: RECIPIENT_V2_READ_PATH, observedEntry: String(readArtifact.facts?.entryArtifactPath || '') }));
    if (String(readArtifact.facts?.routeSelectionAuthority || '') !== RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY) findings.push(finding('error', 'portable.handoff-v2-surface.read.route-selection-authority-missing', 'READ-BEFORE artifact must declare that recipient routing is selected by one exact package-local Handoff Route Pointer supplied by the outer invocation.', { path: readArtifact.path || '' }));
    if (readArtifact.facts?.siblingRouteInference !== RECIPIENT_V2_SIBLING_ROUTE_INFERENCE) findings.push(finding('error', 'portable.handoff-v2-surface.read.sibling-route-inference-enabled', 'READ-BEFORE artifact must fail closed rather than infer among sibling Handoff routes.', { path: readArtifact.path || '' }));
    if (rootArtifact && parentTrace(readArtifact) !== rootArtifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.read.parent-mismatch', 'READ-BEFORE artifact must be a direct child of the package-local root.', { path: readArtifact.path, expectedParent: rootArtifact.path, observedParent: parentTrace(readArtifact) }));
  }
  const detected = Boolean(rootArtifact || readArtifact?.facts?.format === RECIPIENT_V2_FORMAT_ID || forbidden.length);

  const payloadArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.external.payload.v1' && item.status === 'qualified');
  const workspaceArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.workspace.v1' && item.facts?.role === 'workspace-node' && item.status === 'qualified');
  const routePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'handoff-route' && item.status === 'qualified');
  const participantRolePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'participant-role' && item.status === 'qualified');
  const bootstrapPayloadArtifacts = payloadArtifacts.filter((item) => !Array.isArray(item.facts?.materials) && item.facts?.entryCount !== undefined);
  const cachePayloadArtifacts = payloadArtifacts.filter((item) => Array.isArray(item.facts?.materials));
  if (bootstrapPayloadArtifacts.length > 1) findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.ambiguous', 'Recipient-facing v2 package exposes more than one bootstrap payload artifact.'));

  inspectPackageLocalLineage({ generatedArtifacts, rootArtifact, findings });

  const workspaceParts = [];
  const workspaceDescriptors = [];
  const virtualWorkspaceTargetFiles = [];
  const archiveClaims = new Map();
  for (const artifact of workspaceArtifacts) {
    const facts = artifact.facts || {};
    const workspaceId = String(facts.workspaceId || '');
    if (rootArtifact && parentTrace(artifact) !== rootArtifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.workspace.parent-mismatch', 'Package-local Workspace node must be a direct child of the package-local root.', { workspaceId, path: artifact.path, expectedParent: rootArtifact.path, observedParent: parentTrace(artifact) }));
    const archiveFile = oneRecipientFile(index, facts.archivePath);
    if (!archiveFile) { findings.push(finding('error', 'portable.handoff-v2-surface.workspace-archive.missing', 'Package-local Workspace node does not resolve to its exact visible archive companion.', { workspaceId, path: facts.archivePath || '' })); continue; }
    addClaim(archiveClaims, archiveFile.path, artifact.path);
    const archive = inspectRecipientZipPayload(archiveFile, facts, findings, 'workspace-archive');
    if (!archive || archive.archive.state !== 'qualified') continue;
    const entries = archive.archive.entries || [];
    const totalBytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
    if (Number(facts.entryCount || 0) !== entries.length) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-archive.entry-count-mismatch', 'Workspace archive entry count differs from its visible declaration.', { workspaceId }));
    if (Number(facts.totalBytes || 0) !== totalBytes) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-archive.total-bytes-mismatch', 'Workspace archive total entry bytes differ from its visible declaration.', { workspaceId }));
    if (String(facts.entriesFingerprint || '') !== recipientEntriesFingerprint(entries)) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-archive.entries-fingerprint-mismatch', 'Workspace archive entry identity set differs from its visible declaration.', { workspaceId }));
    if (String(facts.completenessState || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-archive.completeness-unqualified', 'Workspace archive does not visibly declare qualified completeness.', { workspaceId }));

    const targetInnerPath = String(facts.sourceWorkspaceTargetInnerPath || '');
    const targetMatches = entries.filter((entry) => String(entry.path || '') === targetInnerPath);
    if (targetMatches.length !== 1) { findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.unresolvable', 'Workspace node must resolve exactly one durable source Workspace artifact inside its archive.', { workspaceId, targetInnerPath, count: targetMatches.length })); continue; }
    const targetEntry = targetMatches[0];
    const targetData = packageFileByteView({ data: targetEntry.data });
    const targetSha256 = sha256Hex(targetData);
    if (Number(facts.sourceWorkspaceTargetBytes || 0) !== targetData.byteLength) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.bytes-mismatch', 'Exact durable source Workspace bytes differ from the package-local Workspace declaration.', { workspaceId, targetInnerPath }));
    if (String(facts.sourceWorkspaceTargetSha256 || '') !== targetSha256) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.sha256-mismatch', 'Exact durable source Workspace digest differs from the package-local Workspace declaration.', { workspaceId, targetInnerPath }));
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: targetInnerPath, targetData, entries });
    if (targetQualification.state !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.unqualified', 'Exact durable source Workspace artifact inside the archive does not independently qualify.', { workspaceId, targetInnerPath, reasons: targetQualification.reasons || [] }));

    const targetVirtualPath = `recipient.v2.workspace-target/${safeToken(workspaceId)}.workspace.md`;
    const targetVirtualFile = Object.freeze({ path: targetVirtualPath, data: targetData, bytes: targetData.byteLength, sha256: targetSha256, kind: 'recipient-v2-virtual-source-workspace-target' });
    virtualWorkspaceTargetFiles.push(targetVirtualFile);
    const descriptorPart = recipientWorkspaceDescriptor({ facts, entries, targetMarkdown: decodeUtf8(targetData), targetPackagePath: targetVirtualPath, targetFile: { bytes: targetData.byteLength, sha256: targetSha256 }, archiveFile: { bytes: archive.bytes, sha256: archive.sha256 } });
    workspaceDescriptors.push(descriptorPart);
    workspaceParts.push({ workspaceId, artifact, facts, targetFile: targetVirtualFile, sourceTargetEntry: targetEntry, targetQualification, archiveFile, archive, descriptorPart });
  }

  const bootstrap = inspectBootstrap(bootstrapPayloadArtifacts[0], index, archiveClaims, findings);
  const caches = cachePayloadArtifacts.map((artifact) => inspectCache(artifact, index, archiveClaims, findings)).filter(Boolean);
  const cacheWorkspaceIds = new Set();
  for (const cache of caches) {
    const workspaceId = String(cache.facts?.workspaceId || '');
    if (!workspaceId) findings.push(finding('error', 'portable.handoff-v2-surface.cache.workspace-id-missing', 'Workspace-scoped dependency cache must declare its owning Workspace id.', { path: cache.artifact.path || '' }));
    else if (cacheWorkspaceIds.has(workspaceId)) findings.push(finding('error', 'portable.handoff-v2-surface.cache.workspace-ambiguous', 'A Workspace may expose at most one package-local dependency cache.', { workspaceId }));
    else cacheWorkspaceIds.add(workspaceId);
    const workspace = workspaceParts.find((item) => item.workspaceId === workspaceId);
    if (!workspace) findings.push(finding('error', 'portable.handoff-v2-surface.cache.workspace-unresolved', 'Workspace-scoped dependency cache does not resolve to a carried qualified Workspace.', { workspaceId, path: cache.artifact.path || '' }));
    else if (parentTrace(cache.artifact) !== workspace.artifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.cache.parent-mismatch', 'Workspace-scoped dependency cache Parent must be its owning package-local Workspace node.', { workspaceId, path: cache.artifact.path || '', expectedParent: workspace.artifact.path, observedParent: parentTrace(cache.artifact) }));
  }
  const virtualCacheParts = caches.map((cache) => virtualCacheMaterial(cache, findings));
  const virtualCache = { files: Object.freeze(virtualCacheParts.flatMap((item) => item.files || [])), materialized: Object.freeze(virtualCacheParts.flatMap((item) => item.materialized || [])) };
  inspectParticipantRolePointers(participantRolePointers, workspaceParts, caches, findings);

  for (const file of files) {
    const path = String(file.path || '');
    if (/\.zip$/i.test(path) && (archiveClaims.get(path) || []).length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.payload-unowned', 'Every visible ZIP companion must be owned by exactly one qualified package-local Markdown lineage node.', { path, claims: (archiveClaims.get(path) || []).length }));
    if (!/\.(?:md|zip)$/i.test(path)) findings.push(finding('error', 'portable.handoff-v2-surface.root-file-kind-invalid', 'Recipient-facing v2 root may expose only qualified Tiinex Markdown artifacts and explicitly referenced ZIP companions.', { path }));
  }

  const descriptor = deepFreeze({
    schema: 'tiinex.transport.handoff-material-closure-descriptor.v2', version: 2,
    workspaceMaterializations: Object.freeze(workspaceDescriptors.map((item) => item.workspace)),
    workspaceArchiveBindings: Object.freeze(workspaceDescriptors.map((item) => item.binding)),
    materialized: virtualCache.materialized,
    requirements: Object.freeze({ required: Object.freeze([]), reference: Object.freeze([]), endpointRoles: Object.freeze([]), participantRoles: Object.freeze([]), dependencies: Object.freeze([]) })
  });
  const semanticBundle = { ...bundle, files: Object.freeze([...files, ...virtualWorkspaceTargetFiles, ...virtualCache.files]) };
  const workspaceByteProvider = buildQualifiedRecipientV2WorkspaceByteProvider(workspaceParts);
  findings.push(...workspaceByteProvider.findings);
  for (const workspace of workspaceParts) {
    const providerWorkspace = handoffWorkspaceProviderForId(workspaceByteProvider, workspace.workspaceId);
    if (providerWorkspace.state !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-provider.unqualified', 'Visible package-local Workspace node plus exact archive/source Workspace bytes did not requalify as one complete Workspace provider.', { workspaceId: workspace.workspaceId, reasons: providerWorkspace.reasons || [] }));
  }

  const routeSpecs = routePointers.map((pointer) => ({ workspaceId: String(pointer.facts?.workspaceId || ''), path: String(pointer.facts?.workspaceRelativeHandoffPath || ''), purpose: '' }));
  const carrierLineage = rootArtifact?.facts?.carrierLineage || legacyCarrierLineageFromRoutePointers(routePointers);
  const carrierProjection = buildHandoffCarrierProjection({ bundle: semanticBundle, descriptor, workspaceByteProvider, carrierLineage, routes: routeSpecs });
  if (carrierProjection.status !== 'ready') findings.push(finding('error', 'portable.handoff-v2-surface.routes.unqualified', 'Recipient-facing route Pointers do not independently resolve to qualified carried Handoff bytes.', { causes: carrierProjection.findings || [] }));
  inspectRoutePointers(routePointers, carrierProjection, workspaceParts, participantRolePointers, index, findings);
  for (const route of carrierProjection.routes || []) if (route.requiredClosure?.state !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.required-closure.unqualified', 'Selected Handoff Required Context does not resolve entirely to exact Workspace/archive or qualified cache bytes.', { routeId: route.id || '', requirements: route.requiredClosure?.requirements || [] }));
  if (!routePointers.length) findings.push(finding('error', 'portable.handoff-v2-surface.routes.missing', 'Recipient-facing v2 package requires at least one qualified Handoff route Pointer.'));
  if (!workspaceParts.length) findings.push(finding('error', 'portable.handoff-v2-surface.workspaces.missing', 'Recipient-facing v2 package requires at least one qualified package-local Workspace node/archive pair.'));

  const coldConsumerProjection = recipientColdProjection(carrierProjection, RECIPIENT_V2_READ_PATH);
  const finalFindings = dedupeFindings(findings);
  const status = finalFindings.some((item) => item.severity === 'error') ? 'invalid' : 'valid';
  return deepFreeze({
    schema: RECIPIENT_V2_TOPOLOGY_INSPECTION_SCHEMA_ID,
    detected,
    status,
    format: detected ? RECIPIENT_V2_FORMAT_ID : '',
    rootArtifact: rootArtifact ? Object.freeze({ path: rootArtifact.path, schemaId: rootArtifact.schemaId, sha256: rootArtifact.sha256, carrierLineage: carrierProjection.lineage || null }) : null,
    readArtifact,
    workspaces: Object.freeze(workspaceParts.map((item) => Object.freeze({ workspaceId: item.workspaceId, workspaceArtifactPath: item.artifact.path, workspaceArchivePath: item.archiveFile.path, sourceWorkspaceTargetInnerPath: item.facts.sourceWorkspaceTargetInnerPath, sourceWorkspaceTargetSha256: item.facts.sourceWorkspaceTargetSha256 }))),
    routes: Object.freeze(routePointers.map((item) => Object.freeze({ pointerPath: item.path, workspaceId: String(item.facts?.workspaceId || ''), workspaceRelativeHandoffPath: String(item.facts?.workspaceRelativeHandoffPath || ''), participantRolePointers: Object.freeze(participantRoleAncestors(item, participantRolePointers)) }))),
    participantRoles: Object.freeze(participantRolePointers.map((item) => Object.freeze({ pointerPath: item.path, workspaceId: String(item.facts?.workspaceId || ''), routeId: String(item.facts?.routeId || ''), roleLabelHint: String(item.facts?.roleLabelHint || ''), referenceTarget: String(item.facts?.referenceTarget || ''), targetCarrierKind: String(item.facts?.targetCarrierKind || ''), targetWorkspaceId: String(item.facts?.targetWorkspaceId || ''), targetInnerPath: String(item.facts?.targetInnerPath || item.facts?.targetArchiveEntry || ''), targetSha256: String(item.facts?.targetSha256 || '') }))),
    caches: Object.freeze(caches.map((cache) => Object.freeze({ workspaceId: String(cache.facts?.workspaceId || ''), artifactPath: cache.artifact.path, archivePath: cache.file.path, materials: cache.facts.materials || [] }))),
    bootstrapInspection: bootstrap?.inspection || null,
    descriptor,
    workspaceByteProvider,
    carrierProjection,
    coldConsumerProjection,
    findings: Object.freeze(finalFindings),
    findingSummary: Object.freeze({ errors: finalFindings.filter((item) => item.severity === 'error').length, findings: finalFindings.length }),
    boundary: 'Read-only qualification of the flat recipient-facing v2 carrier. The package-local numeric tree must mirror explicit Parent continuity; exact durable Workspace and Handoff source bytes remain independently qualified inside their owned archive representations.'
  });
}


function legacyCarrierLineageFromRoutePointers(routePointers = []) {
  const dimensions = [...new Set(routePointers.map((pointer) => {
    const name = String(pointer.facts?.workspaceRelativeHandoffPath || '').replace(/\\/g, '/').split('/').pop() || '';
    return String(name.match(/^(\d{3}(?:-\d+)*)-/)?.[1] || '');
  }).filter(Boolean))];
  if (dimensions.length !== 1) return null;
  const dimension = dimensions[0];
  return Object.freeze({ mode: dimension.includes('-') ? 'continue' : 'root', dimension, checkpointKind: dimension.includes('-') ? 'progression' : 'major' });
}

function participantRoleAncestors(routePointer, participantPointers = []) {
  const byPath = new Map(participantPointers.map((item) => [String(item.path || ''), item]));
  const out = [];
  const seen = new Set();
  let parent = parentTrace(routePointer);
  while (byPath.has(parent) && !seen.has(parent)) {
    seen.add(parent);
    const pointer = byPath.get(parent);
    out.unshift(pointer.path);
    parent = parentTrace(pointer);
  }
  return out;
}

function inspectBootstrap(artifact, index, claims, findings) {
  if (!artifact) return null;
  const facts = artifact.facts || {};
  const file = oneRecipientFile(index, facts.archivePath);
  if (!file) { findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.payload-missing', 'Bootstrap External Payload artifact does not resolve to its local ZIP companion.')); return null; }
  addClaim(claims, file.path, artifact.path);
  const archive = inspectRecipientZipPayload(file, facts, findings, 'bootstrap');
  if (!archive || archive.archive.state !== 'qualified') return { artifact, file, facts, archive, inspection: null };
  const entries = archive.archive.entries || [];
  const totalBytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
  if (Number(facts.entryCount || 0) !== entries.length || Number(facts.totalBytes || 0) !== totalBytes || String(facts.entriesFingerprint || '') !== recipientEntriesFingerprint(entries)) findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.identity-set-mismatch', 'Bootstrap archive entry identity set differs from its visible declaration.'));
  const reconstructed = { files: entries.map((entry) => Object.freeze({ path: `tiinex.bootstrap/${entry.path}`, data: entry.data })) };
  const inspection = inspectPortableToolingBootstrap(reconstructed);
  if (inspection.status !== 'valid') findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.unqualified', 'Reconstructed bootstrap payload does not qualify against its embedded manifest.', { causes: inspection.findings || [] }));
  return { artifact, file, facts, archive, inspection };
}

function inspectCache(artifact, index, claims, findings) {
  if (!artifact) return null;
  const facts = artifact.facts || {};
  const file = oneRecipientFile(index, facts.archivePath);
  if (!file) { findings.push(finding('error', 'portable.handoff-v2-surface.cache.payload-missing', 'Context cache External Payload artifact does not resolve to its local ZIP companion.')); return null; }
  addClaim(claims, file.path, artifact.path);
  const archive = inspectRecipientZipPayload(file, facts, findings, 'cache');
  return { artifact, file, facts, archive };
}

function addClaim(map, path, owner) { const key = String(path || ''); const list = map.get(key) || []; list.push(String(owner || '')); map.set(key, list); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function safeToken(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'workspace'; }
