import { packageFileByteView, sha256Hex } from '../../../export/package.bytes.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { parseRecipientV2ExternalPayload, parseRecipientV2WorkspaceRepresentation } from './recipientV2.artifacts.js';
import {
  finding,
  inspectRecipientZipPayload,
  oneRecipientFile,
  recipientEntriesFingerprint,
  recipientWorkspaceDescriptor,
  virtualCacheMaterial
} from './recipientV2.inspect.helpers.js';
import {
  inspectEndpointRolePointers,
  inspectPackageLocalLineage,
  inspectParticipantRolePointers,
  parentTrace
} from './recipientV2.lineage.js';

export function inspectRecipientV2WorkspaceSurface({ generatedArtifacts = [], rootArtifact = null, index = new Map(), findings = [], transportManifest = null } = {}) {
  const payloadArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.external.payload.v1' && item.status === 'qualified');
  const workspaceArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.workspace.v1' && item.facts?.role === 'workspace-node' && item.status === 'qualified');
  const workspaceRepresentationArtifacts = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.workspace.representation.v1' && item.status === 'qualified');
  const routePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'handoff-route' && item.status === 'qualified');
  const endpointRolePointers = generatedArtifacts.filter((item) => item.schemaId === 'tiinex.pointer.v1' && item.facts?.role === 'endpoint-role' && item.status === 'qualified');
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
  const caches = cachePayloadArtifacts.map((artifact) => inspectCache(artifact, index, archiveClaims, findings, transportManifest)).filter(Boolean);
  const recoveryEntriesByWorkspace = indexCacheRecoveryEntries(caches);
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
    addRecipientClaim(representationClaims, representationArtifact.path, artifact.path);
    const representation = parseRecipientV2WorkspaceRepresentation(representationArtifact.markdown);
    if (parentTrace(representationArtifact) !== artifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.parent-mismatch', 'Workspace Representation must be a package-local child of the Workspace it binds.', { workspaceId, path: representationArtifact.path, expectedParent: artifact.path, observedParent: parentTrace(representationArtifact) }));
    if (String(representationArtifact.facts?.workspaceId || '') !== workspaceId || String(representationArtifact.facts?.workspaceArtifactPath || '') !== artifact.path || String(representationArtifact.facts?.payloadArtifactPath || '') !== representation.payloadArtifactPath) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.stale-transport-witness', 'Workspace Representation transport witness diverges from the visible canonical binding and must be treated as stale.', { workspaceId, path: representationArtifact.path }));

    const payloadArtifactMatches = workspacePayloadArtifacts.filter((candidate) => candidate.path === representation.payloadArtifactPath);
    if (payloadArtifactMatches.length !== 1) {
      findings.push(finding('error', payloadArtifactMatches.length ? 'portable.handoff-v2-surface.workspace-representation-payload.ambiguous' : 'portable.handoff-v2-surface.workspace-representation-payload.missing', 'Workspace Representation must resolve exactly one schema-valid External Payload endpoint.', { workspaceId, representationArtifactPath: representationArtifact.path, payloadArtifactPath: representation.payloadArtifactPath, count: payloadArtifactMatches.length }));
      continue;
    }
    const payloadArtifact = payloadArtifactMatches[0];
    addRecipientClaim(workspacePayloadClaims, payloadArtifact.path, representationArtifact.path);
    if (parentTrace(payloadArtifact) !== artifact.path) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.parent-mismatch', 'Workspace representation External Payload must be a package-local child of the bound Workspace.', { workspaceId, path: payloadArtifact.path, expectedParent: artifact.path, observedParent: parentTrace(payloadArtifact) }));
    const payload = parseRecipientV2ExternalPayload(payloadArtifact.markdown);
    if (payload.mediaType !== 'application/zip' || payload.format !== 'deterministic stored ZIP' || payload.integrityStatus !== 'verified' || payload.integrityMethod !== 'sha256' || payload.integrityTarget !== 'exact payload bytes as carried at the declared local Location') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.contract-invalid', 'Workspace representation payload does not satisfy the exact archive/integrity contract required for provider activation.', { workspaceId, path: payloadArtifact.path }));
    const archiveFile = oneRecipientFile(index, payload.location);
    if (!archiveFile) { findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.location-unresolved', 'Workspace Representation payload Location does not resolve to exactly one package-local payload file.', { workspaceId, path: payload.location || '' })); continue; }
    addRecipientClaim(archiveClaims, archiveFile.path, payloadArtifact.path);
    const archive = inspectRecipientZipPayload(archiveFile, { archivePath: payload.location, archiveBytes: payload.bytes, archiveSha256: payload.integrityValue }, findings, 'workspace-representation-payload', transportManifest.identityByPath?.get?.(archiveFile.path));
    if (!archive || archive.archive.state !== 'qualified') continue;
    const entries = archive.archive.entries || [];
    const totalBytes = entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
    const entriesFingerprint = recipientEntriesFingerprint(entries);
    const coverage = representation.coverage === 'bounded' ? 'bounded' : 'complete';
    if (Number(facts.entryCount || 0) !== entries.length || Number(facts.totalBytes || 0) !== totalBytes || String(facts.entriesFingerprint || '') !== entriesFingerprint || String(facts.coverage || 'complete') !== coverage || String(facts.coverageState || facts.completenessState || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace.transport-witness-stale', 'Workspace transport witness diverges from the canonical representation payload or exact archive entry set.', { workspaceId }));
    if (String(representationArtifact.facts?.archivePath || '') !== payload.location || String(representationArtifact.facts?.archiveSha256 || '') !== archive.sha256 || Number(representationArtifact.facts?.entryCount || 0) !== entries.length || String(representationArtifact.facts?.entriesFingerprint || '') !== entriesFingerprint || String(representationArtifact.facts?.coverage || 'complete') !== coverage || String(representationArtifact.facts?.coverageState || representationArtifact.facts?.completenessState || '') !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.stale-archive-witness', 'Workspace Representation transport witness diverges from the exact qualified payload and entry set.', { workspaceId, path: representationArtifact.path }));
    if (String(payloadArtifact.facts?.workspaceId || '') !== workspaceId || String(payloadArtifact.facts?.archivePath || '') !== payload.location || String(payloadArtifact.facts?.archiveSha256 || '') !== archive.sha256) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation-payload.stale-transport-witness', 'Workspace representation payload transport witness diverges from the visible payload contract or exact payload bytes.', { workspaceId, path: payloadArtifact.path }));

    const targetInnerPath = String(representation.workspaceArtifactInnerPath || '');
    const targetMatches = entries.filter((entry) => String(entry.path || '') === targetInnerPath);
    if (targetMatches.length !== 1) { findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.unresolvable', 'Canonical Workspace Representation must resolve exactly one durable source Workspace artifact inside its payload.', { workspaceId, targetInnerPath, count: targetMatches.length })); continue; }
    const targetEntry = targetMatches[0];
    const targetData = packageFileByteView({ data: targetEntry.data });
    const targetSha256 = sha256Hex(targetData);
    if (String(facts.sourceWorkspaceTargetInnerPath || '') !== targetInnerPath || Number(facts.sourceWorkspaceTargetBytes || 0) !== targetData.byteLength || String(facts.sourceWorkspaceTargetSha256 || '') !== targetSha256) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-source-target.stale-transport-witness', 'Workspace transport witness diverges from the canonical representation-selected durable Workspace artifact.', { workspaceId, targetInnerPath }));
    if (String(representationArtifact.facts?.sourceWorkspaceTargetInnerPath || '') !== targetInnerPath) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.target-stale', 'Workspace Representation transport witness selects a different durable Workspace target than its visible canonical correlation.', { workspaceId, targetInnerPath }));
    const targetQualification = qualifyHandoffWorkspaceTarget({ targetPath: targetInnerPath, targetData, entries, parentCandidates: recoveryEntriesByWorkspace.get(workspaceId) || [] });
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
  inspectEndpointRolePointers(endpointRolePointers, workspaceParts, caches, findings);
  inspectParticipantRolePointers(participantRolePointers, workspaceParts, caches, findings);

  return Object.freeze({
    routePointers: Object.freeze(routePointers),
    endpointRolePointers: Object.freeze(endpointRolePointers),
    participantRolePointers: Object.freeze(participantRolePointers),
    bootstrap: bootstrap || null,
    workspaceParts: Object.freeze(workspaceParts),
    workspaceDescriptors: Object.freeze(workspaceDescriptors),
    virtualWorkspaceTargetFiles: Object.freeze(virtualWorkspaceTargetFiles),
    archiveClaims,
    caches: Object.freeze(caches),
    virtualCache: Object.freeze(virtualCache)
  });
}

function indexCacheRecoveryEntries(caches = []) {
  const map = new Map();
  for (const cache of caches || []) {
    const workspaceId = String(cache?.facts?.workspaceId || '');
    if (!workspaceId || cache?.archive?.archive?.state !== 'qualified') continue;
    const byArchivePath = new Map((cache.archive.archive.entries || []).map((entry) => [String(entry.path || ''), entry]));
    const entries = map.get(workspaceId) || [];
    for (const material of cache.facts?.materials || []) {
      const originalPath = String(material.originalPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
      const entry = byArchivePath.get(String(material.archiveEntry || ''));
      if (!originalPath || !entry) continue;
      entries.push(Object.freeze({ path: originalPath, data: entry.data, bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || '') }));
    }
    map.set(workspaceId, entries);
  }
  return map;
}
function inspectBootstrap(artifact, index, claims, findings, transportManifest = null) {
  if (!artifact) return null;
  const facts = artifact.facts || {};
  const file = oneRecipientFile(index, facts.archivePath);
  if (!file) { findings.push(finding('error', 'portable.handoff-v2-surface.bootstrap.payload-missing', 'Bootstrap External Payload artifact does not resolve to its local ZIP companion.')); return null; }
  addRecipientClaim(claims, file.path, artifact.path);
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
  addRecipientClaim(claims, file.path, artifact.path);
  const archive = inspectRecipientZipPayload(file, facts, findings, 'cache', transportManifest?.identityByPath?.get?.(file.path));
  return { artifact, file, facts, archive };
}

export function addRecipientClaim(map, path, owner) { const key = String(path || ''); const list = map.get(key) || []; list.push(String(owner || '')); map.set(key, list); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function safeToken(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'workspace'; }
