import { packageFileByteView, packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { buildHandoffCarrierProjection } from './carrierProjection.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { handoffWorkspaceProviderForId } from './workspaceByteProvider.js';
import { inspectRecipientV2Artifact, parseRecipientV2ExternalPayload, parseRecipientV2WorkspaceRepresentation } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_FORMAT_ID, RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE } from './recipientV2.entryContract.js';
import { buildQualifiedRecipientV2WorkspaceByteProvider, dedupeFindings, deepFreeze, finding, indexRecipientFiles, inspectRecipientZipPayload, isForbiddenLegacyV2Path, oneRecipientFile, recipientColdProjection, recipientEntriesFingerprint, recipientWorkspaceDescriptor, virtualCacheMaterial } from './recipientV2.inspect.helpers.js';
import { buildPackageLocalParentResolver, inspectPackageLocalLineage, inspectParticipantRolePointers, inspectRoutePointers, parentTrace } from './recipientV2.lineage.js';
import { inspectRecipientV2TransportManifest, recipientV2FactsForFile, RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';
import { inspectRecipientFacingV2ArtifactFirstPhase1, isRecipientV2ArtifactFirstPhase1Surface } from './recipientV2.artifactFirstPhase1.js';

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
  const verifiedPhysicalIdentityByPath = new Map((parsed.entries || []).map((entry) => [String(entry.path || ''), Object.freeze({ data: entry.data, bytes: entry.bytes, sha256: entry.sha256 })]));
  const reinspection = inspectRecipientFacingV2Topology({ ...bundle, files: Object.freeze(files) }, { verifiedPhysicalIdentityByPath });
  const sourceManifestSha256 = String(sourceInspection.transportManifest?.sha256 || '');
  const receivedManifestSha256 = String(reinspection.transportManifest?.sha256 || '');
  const manifestComparisonAvailable = sourceInspection.transportManifest?.state === 'valid' && reinspection.transportManifest?.state === 'valid' && sourceManifestSha256 && receivedManifestSha256;
  const comparison = manifestComparisonAvailable
    ? (sourceManifestSha256 === receivedManifestSha256 ? 'match' : 'mismatch')
    : compareRecipientFileBytes(bundle.files || [], files);
  const status = comparison === 'match' && reinspection.status === 'valid' ? 'passed' : 'failed';
  return deepFreeze({ schema: 'tiinex.portable.recipient-facing-handoff-v2.roundtrip.v1', status, comparison, bytes: zipBytes.byteLength, inspection: reinspection, findings: reinspection.findings });
}

export function inspectRecipientFacingV2Topology(bundle = {}, options = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  if (isRecipientV2ArtifactFirstPhase1Surface(files)) return inspectRecipientFacingV2ArtifactFirstPhase1(bundle, options);
  const findings = [];
  const index = indexRecipientFiles(files, findings);
  const forbidden = files.filter((file) => isForbiddenLegacyV2Path(file.path));
  for (const file of forbidden) findings.push(finding('error', 'portable.handoff-v2-surface.legacy-envelope-exposed', 'Recipient-facing v2 package exposes a rejected legacy control/envelope path.', { path: file.path || '' }));
  for (const file of files) if (String(file.path || '').includes('/')) findings.push(finding('error', 'portable.handoff-v2-surface.path-nonflat', 'Recipient-facing v2 package root must be flat.', { path: file.path || '' }));

  const transportManifest = inspectRecipientV2TransportManifest(files, { verifiedPhysicalIdentityByPath: options.verifiedPhysicalIdentityByPath });
  if (transportManifest.state === 'invalid') findings.push(...transportManifest.findings);
  if (transportManifest.state === 'valid' && String(transportManifest.manifest?.format || '') !== RECIPIENT_V2_FORMAT_ID) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.format-mismatch', 'Recipient-v2 transport manifest declares an unsupported carrier format.', { observed: String(transportManifest.manifest?.format || ''), expected: RECIPIENT_V2_FORMAT_ID }));
  const generatedFiles = [];
  const generatedFacts = new Map();
  const untypedMarkdown = [];
  for (const file of files) {
    if (!/\.md$/i.test(String(file.path || ''))) continue;
    const facts = recipientV2FactsForFile(file, transportManifest.state === 'absent' ? null : transportManifest);
    if (facts) { generatedFiles.push(file); generatedFacts.set(String(file.path || ''), facts); }
    else untypedMarkdown.push(file);
  }
  const resolveParent = buildPackageLocalParentResolver(index);
  const generatedArtifacts = generatedFiles.map((file) => inspectRecipientV2Artifact(file, { facts: generatedFacts.get(String(file.path || '')) || null, resolveParent }));
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
  const detected = Boolean(rootArtifact || readArtifact?.facts?.format === RECIPIENT_V2_FORMAT_ID || transportManifest.state !== 'absent' || forbidden.length);

  const payloadArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.external.payload.v1' && item.status === 'qualified');
  const workspaceArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.workspace.v1' && item.facts?.role === 'workspace-node' && item.status === 'qualified');
  const workspaceRepresentationArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.workspace.representation.v1' && item.status === 'qualified');
  const routePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'handoff-route' && item.status === 'qualified');
  const participantRolePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'participant-role' && item.status === 'qualified');
  const workspacePayloadArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'workspace-representation-payload');
  const bootstrapPayloadArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'portable Tooling bootstrap runtime for recipient orientation and verification');
  const cachePayloadArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'workspace-scoped Handoff dependency cache');
  if (bootstrapPayloadArtifacts.length > 1) findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.ambiguous', 'Recipient-facing v2 package exposes more than one bootstrap payload artifact.'));

  inspectPackageLocalLineage({ generatedArtifacts, rootArtifact, findings });

  const workspaceParts = [];
  const workspaceDescriptors = [];
  const virtualWorkspaceTargetFiles = [];
  const archiveClaims = new Map();
  const representationClaims = new Map();
  const workspacePayloadClaims = new Map();
  for (const artifact of workspaceArtifacts) {
    const facts = artifact.facts || {};
    const workspaceId = String(facts.workspaceId || '');
    if (rootArtifact && parentTrace(artifact) !== rootArtifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.workspace.parent-mismatch', 'Package-local Workspace node must be a direct child of the package-local root.', { workspaceId, path: artifact.path, expectedParent: rootArtifact.path, observedParent: parentTrace(artifact) }));
    const representationCandidates = workspaceRepresentationArtifacts.filter((candidate) => parseRecipientV2WorkspaceRepresentation(candidate.markdown).workspaceArtifactPath === artifact.path);
    if (representationCandidates.length !== 1) {
      findings.push(finding('error', representationCandidates.length ? 'portable.handoff-v2-surface.workspace-representation.ambiguous' : 'portable.handoff-v2-surface.workspace-representation.missing', 'Each carried Workspace must resolve exactly one schema-valid canonical Workspace Representation binding.', { workspaceId, workspaceArtifactPath: artifact.path, count: representationCandidates.length }));
      continue;
    }
    const representationArtifact = representationCandidates[0];
    addClaim(representationClaims, representationArtifact.path, artifact.path);
    const representation = parseRecipientV2WorkspaceRepresentation(representationArtifact.markdown);
    if (parentTrace(representationArtifact) !== artifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.parent-mismatch', 'Workspace Representation must be a package-local child of the Workspace it binds.', { workspaceId, path: representationArtifact.path, expectedParent: artifact.path, observedParent: parentTrace(representationArtifact) }));
    if (String(representationArtifact.facts?.workspaceId || '') !== workspaceId || String(representationArtifact.facts?.workspaceArtifactPath || '') !== artifact.path || String(representationArtifact.facts?.payloadArtifactPath || '') !== representation.payloadArtifactPath) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.stale-transport-witness', 'Workspace Representation transport witness diverges from the visible canonical binding and must be treated as stale.', { workspaceId, path: representationArtifact.path }));

    const payloadArtifactMatches = workspacePayloadArtifacts.filter((candidate) => candidate.path === representation.payloadArtifactPath);
    if (payloadArtifactMatches.length !== 1) {
      findings.push(finding('error', payloadArtifactMatches.length ? 'portable.handoff-v2-surface.workspace-representation-payload.ambiguous' : 'portable.handoff-v2-surface.workspace-representation-payload.missing', 'Workspace Representation must resolve exactly one schema-valid External Payload endpoint.', { workspaceId, representationArtifactPath: representationArtifact.path, payloadArtifactPath: representation.payloadArtifactPath, count: payloadArtifactMatches.length }));
      continue;
    }
    const payloadArtifact = payloadArtifactMatches[0];
    addClaim(workspacePayloadClaims, payloadArtifact.path, representationArtifact.path);
    if (parentTrace(payloadArtifact) !== artifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.parent-mismatch', 'Workspace representation External Payload must be a package-local child of the bound Workspace.', { workspaceId, path: payloadArtifact.path, expectedParent: artifact.path, observedParent: parentTrace(payloadArtifact) }));
    const payload = parseRecipientV2ExternalPayload(payloadArtifact.markdown);
    if (payload.mediaType !== 'application/zip' || payload.format !== 'deterministic stored ZIP' || payload.integrityStatus !== 'verified' || payload.integrityMethod !== 'sha256' || payload.integrityTarget !== 'exact payload bytes as carried at the declared local Location') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.contract-invalid', 'Workspace representation payload does not satisfy the exact archive/integrity contract required for provider activation.', { workspaceId, path: payloadArtifact.path }));
    const archiveFile = oneRecipientFile(index, payload.location);
    if (!archiveFile) { findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.location-unresolved', 'Workspace Representation payload Location does not resolve to exactly one package-local payload file.', { workspaceId, path: payload.location || '' })); continue; }
    addClaim(archiveClaims, archiveFile.path, payloadArtifact.path);
    const archive = inspectRecipientZipPayload(archiveFile, { archivePath: payload.location, archiveBytes: payload.bytes, archiveSha256: payload.integrityValue }, findings, 'workspace-representation-payload', transportManifest.identityByPath?.get?.(archiveFile.path));
    if (!archive || archive.archive.state !== 'qualified') continue;
    const entries = archive.archive.entries || [];
    const totalBytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
    const entriesFingerprint = recipientEntriesFingerprint(entries);
    if (Number(facts.entryCount || 0) !== entries.length || Number(facts.totalBytes || 0) !== totalBytes || String(facts.entriesFingerprint || '') !== entriesFingerprint || String(facts.completenessState || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace.transport-witness-stale', 'Workspace transport witness diverges from the canonical representation payload or exact archive entry set.', { workspaceId }));
    if (String(representationArtifact.facts?.archivePath || '') !== payload.location || String(representationArtifact.facts?.archiveSha256 || '') !== archive.sha256 || Number(representationArtifact.facts?.entryCount || 0) !== entries.length || String(representationArtifact.facts?.entriesFingerprint || '') !== entriesFingerprint || String(representationArtifact.facts?.completenessState || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.stale-archive-witness', 'Workspace Representation transport witness diverges from the exact qualified payload and entry set.', { workspaceId, path: representationArtifact.path }));
    if (String(payloadArtifact.facts?.workspaceId || '') !== workspaceId || String(payloadArtifact.facts?.archivePath || '') !== payload.location || String(payloadArtifact.facts?.archiveSha256 || '') !== archive.sha256) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.stale-transport-witness', 'Workspace representation payload transport witness diverges from the visible payload contract or exact payload bytes.', { workspaceId, path: payloadArtifact.path }));

    const targetInnerPath = String(representation.workspaceArtifactInnerPath || '');
    const targetMatches = entries.filter((entry) => String(entry.path || '') === targetInnerPath);
    if (targetMatches.length !== 1) { findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.unresolvable', 'Canonical Workspace Representation must resolve exactly one durable source Workspace artifact inside its payload.', { workspaceId, targetInnerPath, count: targetMatches.length })); continue; }
    const targetEntry = targetMatches[0];
    const targetData = packageFileByteView({ data: targetEntry.data });
    const targetSha256 = sha256Hex(targetData);
    if (String(facts.sourceWorkspaceTargetInnerPath || '') !== targetInnerPath || Number(facts.sourceWorkspaceTargetBytes || 0) !== targetData.byteLength || String(facts.sourceWorkspaceTargetSha256 || '') !== targetSha256) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.stale-transport-witness', 'Workspace transport witness diverges from the canonical representation-selected durable Workspace artifact.', { workspaceId, targetInnerPath }));
    if (String(representationArtifact.facts?.sourceWorkspaceTargetInnerPath || '') !== targetInnerPath) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.target-stale', 'Workspace Representation transport witness selects a different durable Workspace target than its visible canonical correlation.', { workspaceId, targetInnerPath }));
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: targetInnerPath, targetData, entries });
    if (targetQualification.state !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.unqualified', 'Exact durable source Workspace artifact inside the archive does not independently qualify.', { workspaceId, targetInnerPath, reasons: targetQualification.reasons || [] }));

    const targetVirtualPath = `recipient.v2.workspace-target/${safeToken(workspaceId)}.workspace.md`;
    const targetVirtualFile = Object.freeze({ path: targetVirtualPath, data: targetData, bytes: targetData.byteLength, sha256: targetSha256, kind: 'recipient-v2-virtual-source-workspace-target' });
    virtualWorkspaceTargetFiles.push(targetVirtualFile);
    const descriptorPart = recipientWorkspaceDescriptor({ workspaceId, facts, representation, payload, entries, targetMarkdown: decodeUtf8(targetData), targetPackagePath: targetVirtualPath, targetFile: { bytes: targetData.byteLength, sha256: targetSha256 }, archiveFile: { path: archiveFile.path, bytes: archive.bytes, sha256: archive.sha256 } });
    workspaceDescriptors.push(descriptorPart);
    workspaceParts.push({ workspaceId, artifact, facts, representationArtifact, representation, payloadArtifact, payload, targetFile: targetVirtualFile, sourceTargetEntry: targetEntry, targetQualification, archiveFile, archive, descriptorPart });
  }
  for (const artifact of workspaceRepresentationArtifacts) if ((representationClaims.get(artifact.path) || []).length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.unowned', 'Every canonical Workspace Representation must bind exactly one carried Workspace.', { path: artifact.path, claims: (representationClaims.get(artifact.path) || []).length }));
  for (const artifact of workspacePayloadArtifacts) if ((workspacePayloadClaims.get(artifact.path) || []).length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.unowned', 'Every Workspace representation External Payload must be selected by exactly one canonical Workspace Representation.', { path: artifact.path, claims: (workspacePayloadClaims.get(artifact.path) || []).length }));

  const bootstrap = inspectBootstrap(bootstrapPayloadArtifacts[0], index, archiveClaims, findings, transportManifest);
  const caches = cachePayloadArtifacts.map((artifact) => inspectCache(artifact, index, archiveClaims, findings, transportManifest)).filter(Boolean);
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
    if (!/\.(?:md|zip)$/i.test(path) && path !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH) findings.push(finding('error', 'portable.handoff-v2-surface.root-file-kind-invalid', 'Recipient-facing v2 root may expose only qualified Tiinex Markdown artifacts, explicitly referenced ZIP companions, and the single transport-owned manifest.', { path }));
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
    workspaces: Object.freeze(workspaceParts.map((item) => Object.freeze({ workspaceId: item.workspaceId, workspaceArtifactPath: item.artifact.path, workspaceRepresentationArtifactPath: item.representationArtifact.path, workspacePayloadArtifactPath: item.payloadArtifact.path, workspaceArchivePath: item.archiveFile.path, sourceWorkspaceTargetInnerPath: item.representation.workspaceArtifactInnerPath, sourceWorkspaceTargetSha256: item.targetFile.sha256 }))),
    routes: Object.freeze(routePointers.map((item) => Object.freeze({ pointerPath: item.path, workspaceId: String(item.facts?.workspaceId || ''), workspaceRelativeHandoffPath: String(item.facts?.workspaceRelativeHandoffPath || ''), participantRolePointers: Object.freeze(participantRoleAncestors(item, participantRolePointers)) }))),
    participantRoles: Object.freeze(participantRolePointers.map((item) => Object.freeze({ pointerPath: item.path, workspaceId: String(item.facts?.workspaceId || ''), routeId: String(item.facts?.routeId || ''), roleLabelHint: String(item.facts?.roleLabelHint || ''), referenceTarget: String(item.facts?.referenceTarget || ''), targetCarrierKind: String(item.facts?.targetCarrierKind || ''), targetWorkspaceId: String(item.facts?.targetWorkspaceId || ''), targetInnerPath: String(item.facts?.targetInnerPath || item.facts?.targetArchiveEntry || ''), targetSha256: String(item.facts?.targetSha256 || '') }))),
    caches: Object.freeze(caches.map((cache) => Object.freeze({ workspaceId: String(cache.facts?.workspaceId || ''), artifactPath: cache.artifact.path, archivePath: cache.file.path, materials: cache.facts.materials || [] }))),
    bootstrapInspection: bootstrap?.inspection || null,
    transportManifest: transportManifest.state === 'absent' ? null : Object.freeze({ state: transportManifest.state, path: RECIPIENT_V2_TRANSPORT_MANIFEST_PATH, sha256: transportManifest.file ? sha256Hex(packageFileBytes(transportManifest.file)) : '', format: String(transportManifest.manifest?.format || '') }),
    artifactFacts: Object.freeze(generatedArtifacts.map((item) => Object.freeze({ path: item.path, facts: item.facts }))),
    descriptor,
    workspaceByteProvider,
    carrierProjection,
    coldConsumerProjection,
    findings: Object.freeze(finalFindings),
    findingSummary: Object.freeze({ errors: finalFindings.filter((item) => item.severity === 'error').length, findings: finalFindings.length }),
    boundary: 'Read-only qualification of the flat recipient-facing v2 carrier. The package-local numeric tree must mirror explicit Parent continuity; exact durable Workspace and Handoff source bytes remain independently qualified inside their owned archive representations.'
  });
}



function compareRecipientFileBytes(sourceFiles = [], receivedFiles = []) {
  const source = new Map(sourceFiles.map((file) => [String(file.path || ''), `${packageFileBytes(file).byteLength}:${sha256Hex(packageFileBytes(file))}`]));
  const received = new Map(receivedFiles.map((file) => [String(file.path || ''), `${packageFileBytes(file).byteLength}:${sha256Hex(packageFileBytes(file))}`]));
  return source.size === received.size && [...source].every(([path, identity]) => received.get(path) === identity) ? 'match' : 'mismatch';
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

function inspectBootstrap(artifact, index, claims, findings, transportManifest = null) {
  if (!artifact) return null;
  const facts = artifact.facts || {};
  const file = oneRecipientFile(index, facts.archivePath);
  if (!file) { findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.payload-missing', 'Bootstrap External Payload artifact does not resolve to its local ZIP companion.')); return null; }
  addClaim(claims, file.path, artifact.path);
  const archive = inspectRecipientZipPayload(file, facts, findings, 'bootstrap', transportManifest?.identityByPath?.get?.(file.path));
  if (!archive || archive.archive.state !== 'qualified') return { artifact, file, facts, archive, inspection: null };
  const entries = archive.archive.entries || [];
  const totalBytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
  if (Number(facts.entryCount || 0) !== entries.length || Number(facts.totalBytes || 0) !== totalBytes || String(facts.entriesFingerprint || '') !== recipientEntriesFingerprint(entries)) findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.identity-set-mismatch', 'Bootstrap archive entry identity set differs from its visible declaration.'));
  const reconstructed = { files: entries.map((entry) => Object.freeze({ path: `tiinex.bootstrap/${entry.path}`, data: entry.data })) };
  const inspection = inspectPortableToolingBootstrap(reconstructed);
  if (inspection.status !== 'valid') findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.unqualified', 'Reconstructed bootstrap payload does not qualify against its embedded manifest.', { causes: inspection.findings || [] }));
  return { artifact, file, facts, archive, inspection };
}

function inspectCache(artifact, index, claims, findings, transportManifest = null) {
  if (!artifact) return null;
  const facts = artifact.facts || {};
  const file = oneRecipientFile(index, facts.archivePath);
  if (!file) { findings.push(finding('error', 'portable.handoff-v2-surface.cache.payload-missing', 'Context cache External Payload artifact does not resolve to its local ZIP companion.')); return null; }
  addClaim(claims, file.path, artifact.path);
  const archive = inspectRecipientZipPayload(file, facts, findings, 'cache', transportManifest?.identityByPath?.get?.(file.path));
  return { artifact, file, facts, archive };
}

function addClaim(map, path, owner) { const key = String(path || ''); const list = map.get(key) || []; list.push(String(owner || '')); map.set(key, list); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function safeToken(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'workspace'; }
