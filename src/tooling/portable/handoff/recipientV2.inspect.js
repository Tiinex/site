import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { buildHandoffCarrierProjection } from './carrierProjection.js';
import { handoffWorkspaceProviderForId } from './workspaceByteProvider.js';
import { inspectRecipientV2Artifact } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_FORMAT_ID, RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE } from './recipientV2.entryContract.js';
import { buildQualifiedRecipientV2WorkspaceByteProvider, dedupeFindings, deepFreeze, finding, indexRecipientFiles, isForbiddenLegacyV2Path, recipientColdProjection } from './recipientV2.inspect.helpers.js';
import { buildPackageLocalParentResolver, inspectRoutePointers, parentTrace } from './recipientV2.lineage.js';
import { inspectRecipientV2TransportManifest, recipientV2FactsForFile, RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';
import { inspectRecipientFacingV2ArtifactFirstPhase1, isRecipientV2ArtifactFirstPhase1Surface } from './recipientV2.artifactFirstPhase1.js';
import { projectRecipientV2EndpointRoles, projectRecipientV2ParticipantRoles, projectRecipientV2Routes } from './recipientV2.inspect.projection.js';
import { inspectRecipientV2WorkspaceSurface } from './recipientV2.inspect.workspaces.js';

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

  const workspaceSurface = inspectRecipientV2WorkspaceSurface({ generatedArtifacts, rootArtifact, index, findings, transportManifest });
  const {
    routePointers,
    endpointRolePointers,
    participantRolePointers,
    bootstrap,
    workspaceParts,
    workspaceDescriptors,
    virtualWorkspaceTargetFiles,
    archiveClaims,
    caches,
    virtualCache
  } = workspaceSurface;

  for (const file of files) {
    const path = String(file.path || '');
    if (/\.zip$/i.test(path) && (archiveClaims.get(path) || []).length !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.payload-unowned', 'Every visible ZIP companion must be owned by exactly one qualified package-local Markdown lineage node.', { path, claims: (archiveClaims.get(path) || []).length }));
    if (!/\.(?:md|zip)$/i.test(path) && path !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH) findings.push(finding('error', 'portable.handoff-v2-surface.root-file-kind-invalid', 'Recipient-facing v2 root may expose only qualified Tiinex Markdown artifacts, explicitly referenced ZIP companions, and the single transport-owned manifest.', { path }));
  }

  const routeWorkspaceMaterialized = routePointers.flatMap((pointer) => {
    const facts = pointer.facts || {};
    return (Array.isArray(facts.requiredContextBindings) ? facts.requiredContextBindings : []).map((binding) => Object.freeze({
      requirementId: String(binding.requirementId || ''),
      classification: 'required',
      referenceTarget: String(binding.referenceTarget || ''),
      routeWorkspaceId: String(facts.workspaceId || ''),
      routePath: String(facts.workspaceRelativeHandoffPath || ''),
      carrierKind: 'workspace-archive-entry',
      workspaceId: String(binding.workspaceId || ''),
      workspaceRelativePath: String(binding.workspaceRelativePath || ''),
      bytes: Number(binding.bytes || 0),
      sha256: String(binding.sha256 || '')
    }));
  });
  const descriptor = deepFreeze({
    schema: 'tiinex.transport.handoff-material-closure-descriptor.v2', version: 2,
    workspaceMaterializations: Object.freeze(workspaceDescriptors.map((item) => item.workspace)),
    workspaceArchiveBindings: Object.freeze(workspaceDescriptors.map((item) => item.binding)),
    materialized: Object.freeze([...virtualCache.materialized, ...routeWorkspaceMaterialized]),
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
  inspectRoutePointers(routePointers, carrierProjection, workspaceParts, endpointRolePointers, participantRolePointers, index, findings);
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
    workspaces: Object.freeze(workspaceParts.map((item) => Object.freeze({ workspaceId: item.workspaceId, coverage: item.representation.coverage === 'bounded' ? 'bounded' : 'complete', workspaceArtifactPath: item.artifact.path, workspaceRepresentationArtifactPath: item.representationArtifact.path, workspacePayloadArtifactPath: item.payloadArtifact.path, workspaceArchivePath: item.archiveFile.path, sourceWorkspaceTargetInnerPath: item.representation.workspaceArtifactInnerPath, sourceWorkspaceTargetSha256: item.targetFile.sha256 }))),
    routes: projectRecipientV2Routes(routePointers, endpointRolePointers, participantRolePointers),
    endpointRoles: projectRecipientV2EndpointRoles(endpointRolePointers),
    participantRoles: projectRecipientV2ParticipantRoles(participantRolePointers),
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
  const identityMap = (files) => new Map(files.map((file) => {
    const data = packageFileBytes(file);
    return [String(file.path || ''), `${data.byteLength}:${sha256Hex(data)}`];
  }));
  const source = identityMap(sourceFiles);
  const received = identityMap(receivedFiles);
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
