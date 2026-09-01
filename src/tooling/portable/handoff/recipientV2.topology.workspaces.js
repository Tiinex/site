import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView, packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import {
  RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET,
  RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET,
  renderRecipientV2ExternalPayload,
  renderRecipientV2Workspace,
  renderRecipientV2WorkspaceRepresentation
} from './recipientV2.artifacts.js';
import { recipientEntriesFingerprint } from './recipientV2.topology.helpers.js';
import { recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { finding, oneFile, stableJson } from './recipientV2.topology.materials.js';

export function buildRecipientV2WorkspaceCarriers({ workspacePlans = [], byPath = new Map(), findings = [], createdAt = '', rootParent = null, files = [], topology = { workspaces: [] } } = {}) {
  const workspaceById = new Map();
  for (const plan of workspacePlans) {
    const { binding, ordinal, workspaceId, workspacePath, archivePath, payloadArtifactPath, representationArtifactPath } = plan;
    const sourceTarget = oneFile(byPath, binding.workspaceTarget?.packagePath, findings, 'workspace-target');
    const sourceArchive = oneFile(byPath, binding.representation?.packagePath, findings, 'workspace-archive');
    if (!sourceTarget || !sourceArchive) continue;
    const coverage = String(binding.coverage || '') === 'bounded' || String(binding.representation?.kind || '') === 'bounded-workspace-snapshot' ? 'bounded' : 'complete';
    const coverageEvidence = coverage === 'bounded' ? (binding.scope || {}) : (binding.completeness || {});
    const sourceTargetData = packageFileByteView(sourceTarget);
    const sourceTargetSha256 = sha256Hex(sourceTargetData);
    const archiveFile = repathFinalizedFile(sourceArchive, archivePath, { kind: 'handoff-workspace-archive', logicalKind: coverage === 'bounded' ? 'recipient-v2-bounded-workspace-archive' : 'recipient-v2-complete-workspace-archive', mediaType: 'application/zip', boundary: coverage === 'bounded' ? 'Exact bounded Workspace Representation entry set. Detached recovery closure is separate and package placement is not binding authority.' : 'Exact complete Workspace archive representation. Its semantic provider activation is owned by the explicit Workspace Representation + External Payload artifacts; package placement is not binding authority.' });
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
      coverage,
      totalBytes: Number(coverageEvidence.totalBytes || 0),
      coverageState: String(coverageEvidence.state || ''),
      coverageBasis: String(coverageEvidence.basis || coverageEvidence.proof || ''),
      completenessState: coverage === 'complete' ? String(coverageEvidence.state || '') : '',
      completenessBasis: coverage === 'complete' ? String(coverageEvidence.basis || '') : '',
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
    const workspaceParent = recipientV2ParentAuthority(workspaceFile, 'tiinex.workspace.v1', RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET, createdAt);
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
        summary: coverage === 'bounded' ? 'Exact bounded Workspace archive payload referenced by the canonical Workspace Representation binding.' : 'Exact complete Workspace archive payload referenced by the canonical Workspace Representation binding.',
        label: `${workspaceId} ${coverage} Workspace archive`,
        kind: 'zip export',
        role: `${coverage} Workspace archive representation payload`,
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
      coverage,
      coverageState: facts.coverageState,
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
        coverage,
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
      sourceWorkspaceTargetBytes: sourceTargetData.byteLength,
      coverage
    });
    topology.workspaces.push(projection);
    workspaceById.set(workspaceId, { ...projection, file: workspaceFile, representationArtifact, payloadArtifact, parent: workspaceParent });
  }
  return workspaceById;
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

export function recipientV2ParentAuthority(file, schemaId, schemaTarget, createdAt) {
  const markdown = new TextDecoder('utf-8').decode(packageFileBytes(file));
  const self = validatedC14nV2PrimarySelfDigest(markdown);
  if (self.state !== 'verified') throw new Error(`portable.handoff-v2-surface.parent-self-unverified:${String(file?.path || '')}:${self.reason || self.state}`);
  return Object.freeze({ path: String(file.path || ''), label: String(file.path || ''), schemaId, schemaTarget, createdAt, selfDigest: self.value });
}

function bindingForWorkspace(descriptor = {}, workspaceId = '') { return (descriptor.workspaceArchiveBindings || []).find((binding) => String(binding.workspaceId || '') === String(workspaceId || '')) || null; }

export function buildRecipientV2BootstrapCarrier(source, createdAt, findings, parent) {
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
