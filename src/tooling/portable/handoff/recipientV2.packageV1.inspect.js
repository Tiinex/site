import { packageFileByteView, packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { buildHandoffCarrierProjection } from './carrierProjection.js';
import { buildHandoffWorkspaceByteProvider, inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { inspectRecipientV2Artifact, parseRecipientV2ExternalPayload, parseRecipientV2Facts } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { buildPackageLocalParentResolver, inspectEndpointRolePointers, inspectParticipantRolePointers, inspectRoutePointers, parentTrace } from './recipientV2.lineage.js';
import { finding } from './recipientV2.topology.materials.js';
import { indexRecipientFiles, recipientColdProjection, recipientWorkspaceDescriptor, virtualCacheMaterial } from './recipientV2.inspect.helpers.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { projectRecipientV2EndpointRoles, projectRecipientV2ParticipantRoles, projectRecipientV2Routes } from './recipientV2.inspect.projection.js';
import { RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID } from './recipientV2.packageV1.constants.js';
import { parseHandoffPackageV1, validatePackageFields } from './recipientV2.packageV1.contract.js';
import { deriveVisibleFacts, validateRouteClosure } from './recipientV2.packageV1.inspect.helpers.js';
import { byteEqual, currentSchemaId, decodeUtf8, dedupeFindings, deepFreeze, oneFile } from './recipientV2.packageV1.shared.js';

export function inspectRecipientFacingV2PackageV1(bundle = {}, options = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const findings = [];
  const index = indexRecipientFiles(files, findings);
  for (const file of files) if (String(file.path || '').includes('/')) findings.push(finding('error', 'portable.handoff-package-v1.path-nonflat', 'Package v1 carrier root must be flat.', { path: file.path || '' }));
  const packageCandidates = files.filter((file) => currentSchemaId(decodeUtf8(packageFileBytes(file))) === RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID);
  if (packageCandidates.length !== 1) findings.push(finding('error', 'portable.handoff-package-v1.package-artifact-count', 'Carrier must contain exactly one tiinex.handoff.package.v1 artifact.', { count: packageCandidates.length }));
  const packageFile = packageCandidates[0] || null;
  const packageMarkdown = packageFile ? decodeUtf8(packageFileBytes(packageFile)) : '';
  const packageContract = packageFile ? parseHandoffPackageV1(packageMarkdown) : null;
  if (packageFile) {
    if (!/^\d{3}-tiinex-handoff-package\.trace\.md$/.test(String(packageFile.path || ''))) findings.push(finding('error', 'portable.handoff-package-v1.filename-invalid', 'Handoff package artifact filename must expose exactly one numeric package-root dimension.', { path: packageFile.path || '' }));
    const self = canonicalC14nV2SelfState(packageMarkdown);
    if (self.state !== 'verified') findings.push(finding('error', 'portable.handoff-package-v1.integrity-self-invalid', 'Handoff package artifact self-integrity must independently verify.', { reason: self.reason || self.state }));
    validatePackageFields(packageContract, findings);
  }

  const generatedArtifacts = [];
  const resolveParent = buildPackageLocalParentResolver(index);
  for (const file of files) {
    if (!/\.md$/i.test(String(file.path || '')) || file === packageFile) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    const schemaId = currentSchemaId(markdown);
    const facts = file.transportFacts || parseRecipientV2Facts(markdown) || deriveVisibleFacts({ file, markdown, schemaId, packageContract, index });
    if (schemaId === 'tiinex.workspace.v1' && !facts) continue;
    if (schemaId === 'tiinex.party.role.v1') { findings.push(finding('error', 'portable.handoff-package-v1.detached-role-copy', 'Package root must not carry detached Role artifacts; route grounding uses Role Pointers to exact Workspace/cache bytes.', { path: file.path || '' })); continue; }
    if (!facts) { findings.push(finding('error', 'portable.handoff-package-v1.unknown-artifact-role', 'Package root contains Markdown whose semantic carrier role is not justified by package v1.', { path: file.path || '', schemaId })); continue; }
    const artifact = inspectRecipientV2Artifact(file, { facts, resolveParent });
    generatedArtifacts.push(artifact);
    findings.push(...artifact.findings);
  }
  const readArtifact = generatedArtifacts.find((item) => item.path === packageContract?.startPath && item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'recovery-orientation') || null;
  if (!readArtifact) findings.push(finding('error', 'portable.handoff-package-v1.start-unresolved', 'Start Artifact must resolve to one qualified recovery/orientation Pointer.'));
  else if (packageFile && parentTrace(readArtifact) !== packageFile.path) findings.push(finding('error', 'portable.handoff-package-v1.start-parent-mismatch', 'Start Artifact must descend directly from the package artifact.', { observedParent: parentTrace(readArtifact), expectedParent: packageFile.path }));

  const bindings = packageContract?.workspaces || [];
  const workspaceParts = [];
  const workspaceDescriptors = [];
  const virtualWorkspaceTargets = [];
  for (const binding of bindings) {
    const workspaceFile = oneFile(index, binding.workspaceArtifactPath);
    const archiveFile = oneFile(index, binding.snapshotPath);
    if (!workspaceFile || !archiveFile) { findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-unresolved', 'Workspace binding paths must resolve exactly once inside the package.', { workspaceId: binding.workspaceId })); continue; }
    const workspaceMarkdown = decodeUtf8(packageFileBytes(workspaceFile));
    if (currentSchemaId(workspaceMarkdown) !== 'tiinex.workspace.v1') findings.push(finding('error', 'portable.handoff-package-v1.workspace-schema-invalid', 'Workspace Artifact must declare tiinex.workspace.v1.', { workspaceId: binding.workspaceId, path: workspaceFile.path || '' }));
    if (String(binding.snapshotKind || '') !== 'exact-workspace-byte-tree-archive' || String(binding.coverage || '') !== 'complete' || String(binding.bindingState || '') !== 'verified' || String(binding.integrityMethod || '') !== 'sha256') findings.push(finding('error', 'portable.handoff-package-v1.workspace-binding-contract-invalid', 'Qualified package v1 Workspace binding requires exact complete verified sha256 semantics.', { workspaceId: binding.workspaceId }));
    const archiveData = packageFileByteView(archiveFile);
    const archiveSha = sha256Hex(archiveData);
    if (archiveSha !== binding.integrityValue) findings.push(finding('error', 'portable.handoff-package-v1.workspace-snapshot-digest-mismatch', 'Workspace Snapshot Integrity Value diverges from exact carried bytes.', { workspaceId: binding.workspaceId }));
    if (binding.byteSize !== null && Number(binding.byteSize) !== archiveData.byteLength) findings.push(finding('error', 'portable.handoff-package-v1.workspace-snapshot-size-mismatch', 'Workspace Snapshot Byte Size diverges from exact carried bytes.', { workspaceId: binding.workspaceId }));
    const parsed = inspectStoredWorkspaceArchive(archiveData, { ownedBytes: true });
    if (parsed.state !== 'qualified') { findings.push(finding('error', 'portable.handoff-package-v1.workspace-snapshot-invalid', 'Workspace Snapshot failed safe normalized archive qualification.', { workspaceId: binding.workspaceId })); continue; }
    const inner = (parsed.entries || []).filter((entry) => entry.path === binding.workspaceArtifactInnerPath);
    if (inner.length !== 1) { findings.push(finding('error', 'portable.handoff-package-v1.workspace-inner-unresolved', 'Workspace Artifact Inner Path must resolve exactly once.', { workspaceId: binding.workspaceId, count: inner.length })); continue; }
    const workspaceData = packageFileByteView(workspaceFile);
    const innerData = packageFileByteView({ data: inner[0].data });
    if (!byteEqual(workspaceData, innerData)) findings.push(finding('error', 'portable.handoff-package-v1.workspace-inner-byte-mismatch', 'Carried Workspace Artifact bytes must exactly equal the selected snapshot inner entry.', { workspaceId: binding.workspaceId }));
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: binding.workspaceArtifactInnerPath, targetData: workspaceData, entries: parsed.entries || [] });
    if (targetQualification.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.workspace-target-unqualified', 'Exact bound Workspace Artifact does not qualify.', { workspaceId: binding.workspaceId, reasons: targetQualification.reasons || [] }));
    const descriptorPart = recipientWorkspaceDescriptor({ workspaceId: binding.workspaceId, facts: { providerKind: 'package-local-stored-zip-v1' }, representation: { workspaceArtifactInnerPath: binding.workspaceArtifactInnerPath, coverage: 'complete' }, payload: { location: binding.snapshotPath }, entries: parsed.entries || [], targetMarkdown: workspaceMarkdown, targetPackagePath: binding.workspaceArtifactPath, targetFile: { bytes: workspaceData.byteLength, sha256: sha256Hex(workspaceData) }, archiveFile: { path: archiveFile.path, bytes: archiveData.byteLength, sha256: archiveSha } });
    workspaceDescriptors.push(descriptorPart);
    workspaceParts.push({ workspaceId: binding.workspaceId, artifact: Object.freeze({ path: workspaceFile.path, sha256: sha256Hex(workspaceData), markdown: workspaceMarkdown }), facts: { workspaceId: binding.workspaceId, sourceWorkspaceTargetInnerPath: binding.workspaceArtifactInnerPath, sourceWorkspaceTargetSha256: sha256Hex(workspaceData) }, archiveFile, archive: { archive: parsed, sha256: archiveSha }, targetQualification });
    virtualWorkspaceTargets.push(workspaceFile);
  }

  const payloadArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.external.payload.v1' && item.status === 'qualified');
  const bootstrapArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'portable Tooling bootstrap runtime for recipient orientation and verification');
  const cacheArtifacts = payloadArtifacts.filter((item) => item.facts?.role === 'workspace-scoped Handoff dependency cache');
  const forbiddenWorkspacePayloads = payloadArtifacts.filter((item) => item.facts?.role === 'workspace-representation-payload');
  if (forbiddenWorkspacePayloads.length) findings.push(finding('error', 'portable.handoff-package-v1.workspace-payload-redundant', 'Complete package-local Workspace bindings must not carry redundant Workspace External Payload companions.', { count: forbiddenWorkspacePayloads.length }));
  if (generatedArtifacts.some((item) => item.schemaId === 'tiinex.workspace.representation.v1' || item.schemaId === 'tiinex.relation.v1')) findings.push(finding('error', 'portable.handoff-package-v1.workspace-representation-redundant', 'Complete package-local Workspace bindings must not carry redundant Workspace Representation/Relation companions.'));

  let bootstrapInspection = null;
  if (packageContract?.bootstrapPath) {
    const bootstrapArtifact = bootstrapArtifacts.find((item) => item.path === packageContract.bootstrapPath) || null;
    if (!bootstrapArtifact) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-unresolved', 'Tooling Bootstrap Descriptor must resolve to one qualified bootstrap External Payload artifact.'));
    else {
      const payload = parseRecipientV2ExternalPayload(bootstrapArtifact.markdown);
      const zip = oneFile(index, payload.location);
      if (!zip || payload.integrityMethod !== 'sha256' || payload.integrityValue !== (zip ? sha256Hex(packageFileBytes(zip)) : '')) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-payload-invalid', 'Tooling bootstrap descriptor/payload byte identity failed qualification.'));
      else {
        const parsed = inspectStoredWorkspaceArchive(packageFileBytes(zip), { ownedBytes: true });
        if (parsed.state === 'qualified') {
          bootstrapInspection = inspectPortableToolingBootstrap({ files: (parsed.entries || []).map((entry) => Object.freeze({ path: `tiinex.bootstrap/${entry.path}`, data: entry.data })) });
          if (bootstrapInspection.status !== 'valid') findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-runtime-unqualified', 'Tooling bootstrap payload failed embedded runtime qualification.'));
        }
      }
    }
  }

  const caches = [];
  for (const artifact of cacheArtifacts) {
    const payload = parseRecipientV2ExternalPayload(artifact.markdown);
    const file = oneFile(index, payload.location);
    if (!file) { findings.push(finding('error', 'portable.handoff-package-v1.cache-payload-missing', 'Cache descriptor payload location is unresolved.', { path: artifact.path })); continue; }
    const parsed = inspectStoredWorkspaceArchive(packageFileBytes(file), { ownedBytes: true });
    if (parsed.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.cache-payload-invalid', 'Cache payload is not a qualified safe stored ZIP.', { path: file.path }));
    caches.push({ artifact, file, facts: artifact.facts || {}, archive: { archive: parsed, sha256: sha256Hex(packageFileBytes(file)) } });
  }
  const virtualCacheParts = caches.map((cache) => virtualCacheMaterial(cache, findings));
  const virtualCache = { files: Object.freeze(virtualCacheParts.flatMap((item) => item.files || [])), materialized: Object.freeze(virtualCacheParts.flatMap((item) => item.materialized || [])) };

  const descriptor = deepFreeze({ schema: 'tiinex.transport.handoff-material-closure-descriptor.v2', version: 2, workspaceMaterializations: Object.freeze(workspaceDescriptors.map((item) => item.workspace)), workspaceArchiveBindings: Object.freeze(workspaceDescriptors.map((item) => item.binding)), materialized: Object.freeze(virtualCache.materialized), requirements: Object.freeze({ required: Object.freeze([]), reference: Object.freeze([]), endpointRoles: Object.freeze([]), participantRoles: Object.freeze([]), dependencies: Object.freeze([]) }) });
  const semanticBundle = { ...bundle, files: Object.freeze([...files, ...virtualCache.files]) };
  const workspaceByteProvider = buildHandoffWorkspaceByteProvider(semanticBundle, descriptor);
  findings.push(...(workspaceByteProvider.findings || []));

  const routePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'handoff-route' && item.status === 'qualified');
  const endpointRolePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'endpoint-role' && item.status === 'qualified');
  const participantRolePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'participant-role' && item.status === 'qualified');
  inspectEndpointRolePointers(endpointRolePointers, workspaceParts, caches, findings);
  inspectParticipantRolePointers(participantRolePointers, workspaceParts, caches, findings);
  const routeSpecs = routePointers.map((pointer) => ({ workspaceId: String(pointer.facts?.workspaceId || ''), path: String(pointer.facts?.workspaceRelativeHandoffPath || ''), purpose: '' }));
  const lineage = packageContract ? Object.freeze({ dimension: packageContract.carrierDimension, parentDimension: packageContract.parentCarrierDimension, checkpointKind: packageContract.carrierCheckpoint, majorReason: packageContract.majorReason || '' }) : null;
  const carrierProjection = buildHandoffCarrierProjection({ bundle: semanticBundle, descriptor, workspaceByteProvider, carrierLineage: lineage, routes: routeSpecs });
  if (carrierProjection.status !== 'ready') findings.push(finding('error', 'portable.handoff-package-v1.routes-unqualified', 'Selected Handoff Pointer does not independently resolve to qualified authoritative Handoff bytes.', { causes: carrierProjection.findings || [] }));
  inspectRoutePointers(routePointers, carrierProjection, workspaceParts, endpointRolePointers, participantRolePointers, index, findings);
  validateRouteClosure(routePointers, endpointRolePointers, participantRolePointers, caches, workspaceParts, findings);
  if (routePointers.length !== 1) findings.push(finding('error', 'portable.handoff-package-v1.route-count-invalid', 'Qualified package-v1 delivery requires exactly one selected Handoff Pointer.', { count: routePointers.length }));
  for (const route of carrierProjection.routes || []) {
    if (route.requiredClosure?.state !== 'qualified') findings.push(finding('error', 'portable.handoff-package-v1.required-closure-unqualified', 'Authoritative Handoff Required Context is not fully carried by exact Workspace snapshots or bounded cache.', { routeId: route.id || '' }));
    for (const requirement of route.requiredClosure?.requirements || []) if (requirement.state === 'qualified' && !['workspace-archive-entry', 'materialized-required-material'].includes(String(requirement.resolution?.kind || ''))) findings.push(finding('error', 'portable.handoff-package-v1.external-closure-asset', 'Selected route closure requires a carrier kind not owned by complete Workspace snapshots or bounded cache.', { routeId: route.id || '', requirementId: requirement.requirementId || '', kind: requirement.resolution?.kind || '' }));
  }
  const allowedCacheRequirementIds = new Set();
  for (const route of carrierProjection.routes || []) for (const requirement of route.requiredClosure?.requirements || []) if (requirement.requirementId) allowedCacheRequirementIds.add(String(requirement.requirementId));
  for (const pointer of endpointRolePointers) if (pointer.facts?.endpointRequirementId) allowedCacheRequirementIds.add(String(pointer.facts.endpointRequirementId));
  for (const pointer of participantRolePointers) if (pointer.facts?.participantRequirementId) allowedCacheRequirementIds.add(String(pointer.facts.participantRequirementId));
  for (const cache of caches) {
    for (const material of cache.facts?.materials || []) {
      const requirementId = String(material.sourceRequirementId || material.requirementId || '');
      if (!requirementId || !allowedCacheRequirementIds.has(requirementId)) findings.push(finding('error', 'portable.handoff-package-v1.cache-over-expansion', 'Workspace dependency cache contains material not required by the selected Handoff route closure.', { cache: cache.artifact.path, requirementId }));
    }
  }

  const knownPaths = new Set([
    packageFile?.path,
    packageContract?.startPath,
    ...(bindings || []).flatMap((binding) => [binding.workspaceArtifactPath, binding.snapshotPath]),
    ...generatedArtifacts.filter((item) => ['recovery-orientation', 'handoff-route', 'endpoint-role', 'participant-role'].includes(String(item.facts?.role || ''))).map((item) => item.path),
    ...bootstrapArtifacts.flatMap((artifact) => [artifact.path, parseRecipientV2ExternalPayload(artifact.markdown).location]),
    ...caches.flatMap((cache) => [cache.artifact.path, cache.file.path])
  ].filter(Boolean));
  for (const file of files) {
    const filePath = String(file.path || '');
    if (/\.json$/i.test(filePath)) findings.push(finding('error', 'portable.handoff-package-v1.parallel-truth-json', 'Package-v1 carrier must not contain receipt.json, manifest.json, or equivalent root-level JSON parallel semantic truth.', { path: filePath }));
    if (!knownPaths.has(filePath)) findings.push(finding('error', 'portable.handoff-package-v1.unknown-package-artifact', 'Package root contains an artifact whose carrier semantic role is not justified by package-v1 bindings or selected route closure.', { path: filePath }));
  }
  const finalFindings = dedupeFindings(findings);
  const status = finalFindings.some((item) => item.severity === 'error') ? 'invalid' : 'valid';
  const coldConsumerProjection = recipientColdProjection(carrierProjection, RECIPIENT_V2_READ_PATH);
  return deepFreeze({
    schema: 'tiinex.portable.recipient-facing-handoff-package-v1.inspection.v1', detected: Boolean(packageFile), status, format: RECIPIENT_V2_PACKAGE_V1_FORMAT_ID,
    rootArtifact: packageFile ? Object.freeze({ path: packageFile.path, schemaId: RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, sha256: sha256Hex(packageFileBytes(packageFile)), carrierLineage: lineage }) : null,
    readArtifact, workspaces: Object.freeze(workspaceParts.map((item) => Object.freeze({ workspaceId: item.workspaceId, coverage: 'complete', workspaceArtifactPath: item.artifact.path, workspaceArchivePath: item.archiveFile.path, sourceWorkspaceTargetInnerPath: item.facts.sourceWorkspaceTargetInnerPath, sourceWorkspaceTargetSha256: item.facts.sourceWorkspaceTargetSha256 }))),
    routes: projectRecipientV2Routes(routePointers, endpointRolePointers, participantRolePointers), endpointRoles: projectRecipientV2EndpointRoles(endpointRolePointers), participantRoles: projectRecipientV2ParticipantRoles(participantRolePointers),
    caches: Object.freeze(caches.map((cache) => Object.freeze({ workspaceId: String(cache.facts?.workspaceId || ''), artifactPath: cache.artifact.path, archivePath: cache.file.path, materials: cache.facts.materials || [] }))),
    bootstrapInspection, transportManifest: null, artifactFacts: Object.freeze(generatedArtifacts.map((item) => Object.freeze({ path: item.path, facts: item.facts }))), descriptor, workspaceByteProvider, carrierProjection, coldConsumerProjection,
    packageContract, findings: Object.freeze(finalFindings), findingSummary: Object.freeze({ errors: finalFindings.filter((item) => item.severity === 'error').length, findings: finalFindings.length }),
    boundary: 'Read-only qualification of tiinex.handoff.package.v1: visible package identity/discovery and complete package-local Workspace bindings are reverified from exact bytes; derived inventories have no authority.'
  });
}
