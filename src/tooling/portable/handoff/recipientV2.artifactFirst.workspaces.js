import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileByteView, packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { qualifyHandoffWorkspaceTarget } from './workspaceTargetConformance.js';
import { renderRecipientV2ExternalPayload, renderRecipientV2Relation } from './recipientV2.artifacts.js';

export const PHASE1_COMPLETE_WORKSPACE_ROLE = 'complete Workspace archive representation payload';
export const PHASE1_BOUNDED_WORKSPACE_ROLE = 'bounded Workspace archive representation payload';

export function buildPhase1WorkspaceCarriers(input = {}) {
  const sourceInspection = input.sourceInspection || {};
  const sourceBundle = input.sourceBundle || {};
  const selectedWorkspaceId = String(input.selectedWorkspaceId || '');
  const findings = [];
  const ordered = [...(sourceInspection.workspaces || [])].sort((a, b) => {
    const aid = String(a.workspaceId || '');
    const bid = String(b.workspaceId || '');
    if (aid === selectedWorkspaceId && bid !== selectedWorkspaceId) return -1;
    if (bid === selectedWorkspaceId && aid !== selectedWorkspaceId) return 1;
    return aid.localeCompare(bid);
  });
  const carriers = [];
  const seen = new Set();
  for (const [index, workspace] of ordered.entries()) {
    const workspaceId = String(workspace.workspaceId || '');
    if (!workspaceId || seen.has(workspaceId)) {
      findings.push(finding('error', 'portable.handoff-v2-phase1.workspace.identity-ambiguous', 'Artifact-first full-source carriage requires one unique visible Workspace identity per carried Workspace.', { workspaceId }));
      continue;
    }
    seen.add(workspaceId);
    const sourceArchive = oneFile(sourceBundle.files || [], workspace.workspaceArchivePath);
    if (!sourceArchive) {
      findings.push(finding('error', 'portable.handoff-v2-phase1.archive.unresolved', 'Carried Workspace archive is unavailable in the qualified source carrier.', { workspaceId, path: workspace.workspaceArchivePath }));
      continue;
    }
    const selected = workspaceId === selectedWorkspaceId;
    const token = safeToken(workspaceId);
    const ordinal = index + 1;
    const archivePath = selected ? '001-2-workspace.zip' : `001-2-${ordinal}-${token}-workspace.zip`;
    const payloadArtifactPath = selected ? '001-2-workspace-payload.trace.md' : `001-2-${ordinal}-${token}-workspace-payload.trace.md`;
    const relationArtifactPath = selected ? '001-3-workspace-representation-relation.trace.md' : `001-3-${ordinal}-${token}-workspace-representation-relation.trace.md`;
    const coverage = workspace.coverage === 'bounded' ? 'bounded' : 'complete';
    const payloadRole = coverage === 'bounded' ? PHASE1_BOUNDED_WORKSPACE_ROLE : PHASE1_COMPLETE_WORKSPACE_ROLE;
    const scope = coverage === 'bounded' ? 'bounded recipient-relative workspace materialization' : 'complete recipient-relative workspace materialization';
    const archiveFile = finalizeFile({
      path: archivePath,
      requestedPath: archivePath,
      kind: 'handoff-workspace-archive',
      logicalKind: coverage === 'bounded' ? 'recipient-v2-phase1-bounded-workspace-archive' : 'recipient-v2-phase1-complete-workspace-archive',
      mediaType: 'application/zip',
      data: packageFileByteView(sourceArchive),
      boundary: 'Exact Workspace archive bytes owned by the visible External Payload artifact; package placement is not semantic provider authority.'
    });
    const payloadArtifact = finalizeFile({
      path: payloadArtifactPath,
      kind: 'tiinex-external-payload-artifact',
      logicalKind: 'recipient-v2-phase1-workspace-payload',
      mediaType: 'text/markdown',
      content: renderRecipientV2ExternalPayload({
        artifactFirst: true,
        createdAt: input.createdAt,
        workspaceId,
        title: `Workspace Payload — ${workspaceId}`,
        summary: `Artifact-first Phase 1 exact ${coverage} Workspace archive payload.`,
        label: `${workspaceId} ${coverage} Workspace archive`,
        kind: 'zip export',
        role: payloadRole,
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
        createdAt: input.createdAt,
        title: `Workspace Material Representation — ${workspaceId}`,
        summary: 'Typed non-Parent material-representation relation from the External Payload artifact to the represented Workspace artifact.',
        relationType: 'material representation',
        direction: 'payload artifact -> represented artifact',
        scope,
        sourceLabel: `${workspaceId} Workspace payload artifact`,
        source: payloadArtifactPath,
        targetLabel: `${workspaceId} represented Workspace artifact`,
        target: String(workspace.sourceWorkspaceTargetInnerPath || ''),
        targetWorkspaceId: workspaceId,
        targetWorkspaceInnerPath: String(workspace.sourceWorkspaceTargetInnerPath || '')
      })
    });
    carriers.push(Object.freeze({ workspace, workspaceId, selected, coverage, archivePath, payloadArtifactPath, relationArtifactPath, archiveFile, payloadArtifact, relationArtifact }));
  }
  if (!carriers.some((item) => item.selected)) findings.push(finding('error', 'portable.handoff-v2-phase1.workspace.selection', 'Selected route Workspace is not present in the carried full-source Workspace set.', { workspaceId: selectedWorkspaceId }));
  return Object.freeze({ state: findings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', carriers: Object.freeze(carriers), findings: Object.freeze(findings) });
}

export function qualifyPhase1WorkspaceCarriers(input = {}) {
  const payloads = input.workspacePayloads || [];
  const relations = input.relations || [];
  const semanticFiles = input.semanticFiles || [];
  const recoveryParentCandidates = input.recoveryParentCandidates || [];
  const findings = input.findings || [];
  const records = [];
  const payloadByWorkspace = uniqueByWorkspace(payloads, (item) => item.parsed?.workspaceId, 'payload', findings);
  const relationByWorkspace = uniqueByWorkspace(relations, (item) => item.parsed?.targetWorkspaceId, 'relation', findings);
  const ids = new Set([...payloadByWorkspace.keys(), ...relationByWorkspace.keys()]);
  for (const workspaceId of [...ids].sort()) {
    const payload = payloadByWorkspace.get(workspaceId) || null;
    const relation = relationByWorkspace.get(workspaceId) || null;
    if (!payload || !relation) {
      findings.push(finding('error', 'portable.handoff-v2-phase1.workspace.surface-incomplete', 'Every carried artifact-first Workspace requires one External Payload and one material-representation Relation.', { workspaceId, payload: Boolean(payload), relation: Boolean(relation) }));
      continue;
    }
    const expectedScope = payload.parsed.payloadRole === PHASE1_BOUNDED_WORKSPACE_ROLE ? 'bounded recipient-relative workspace materialization' : 'complete recipient-relative workspace materialization';
    if (relation.parsed.relationType !== 'material representation' || relation.parsed.direction !== 'payload artifact -> represented artifact' || relation.parsed.scope !== expectedScope) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.semantic-contract-mismatch', 'Workspace representation Relation does not match the accepted artifact-first material-representation predicate/direction/scope.', { workspaceId }));
    if (relation.parsed.source !== payload.path) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.payload-mismatch', 'Material-representation Relation Source must be the explicit Workspace External Payload artifact.', { workspaceId }));
    if (!relation.parsed.targetWorkspaceId || relation.parsed.targetWorkspaceId !== workspaceId) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.workspace-id-mismatch', 'Relation and External Payload must visibly agree on represented Workspace identity.', { workspaceId }));
    if (!relation.parsed.targetWorkspaceInnerPath || relation.parsed.target !== relation.parsed.targetWorkspaceInnerPath) findings.push(finding('error', 'portable.handoff-v2-phase1.relation.workspace-inner-path-missing', 'Material-representation Relation must visibly identify the represented Workspace inner path.', { workspaceId }));
    const archiveFiles = semanticFiles.filter((file) => String(file.path || '') === String(payload.parsed.location || ''));
    if (archiveFiles.length !== 1) {
      findings.push(finding('error', 'portable.handoff-v2-phase1.payload.location-unresolved', 'Workspace External Payload Location must resolve exactly one exact payload file.', { workspaceId, path: payload.parsed.location || '', count: archiveFiles.length }));
      continue;
    }
    const archiveFile = archiveFiles[0];
    const bytes = packageFileBytes(archiveFile);
    if (payload.parsed.bytes !== bytes.byteLength || payload.parsed.integrityMethod !== 'sha256' || payload.parsed.integrityValue !== sha256Hex(bytes)) findings.push(finding('error', 'portable.handoff-v2-phase1.payload.identity-mismatch', 'Visible Workspace External Payload byte identity diverges from exact payload bytes.', { workspaceId }));
    const archive = inspectStoredWorkspaceArchive(bytes, { ownedBytes: true });
    findings.push(...(archive.findings || []));
    let workspaceTargetQualification = null;
    if (archive.state === 'qualified') {
      const targetEntries = archive.entries.filter((entry) => String(entry.path || '') === String(relation.parsed.targetWorkspaceInnerPath || ''));
      if (targetEntries.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.workspace-target.unresolved', 'Relation target Workspace inner path must resolve exactly one Workspace artifact inside the payload.', { workspaceId, path: relation.parsed.targetWorkspaceInnerPath || '', count: targetEntries.length }));
      else {
        workspaceTargetQualification = qualifyHandoffWorkspaceTarget({ targetPath: targetEntries[0].path, targetData: targetEntries[0].data, entries: archive.entries, parentCandidates: recoveryParentCandidates });
        if (workspaceTargetQualification.state !== 'qualified') findings.push(finding('error', 'portable.handoff-v2-phase1.workspace-target.unqualified', 'Relation-selected Workspace artifact inside the payload did not independently qualify.', { workspaceId, reasons: workspaceTargetQualification.reasons || [] }));
      }
    }
    records.push(Object.freeze({ workspaceId, payload, relation, archiveFile, archive, workspaceTargetQualification }));
  }
  return Object.freeze(records);
}

function uniqueByWorkspace(items, idFn, label, findings) {
  const map = new Map();
  for (const item of items) {
    const workspaceId = String(idFn(item) || '');
    if (!workspaceId || map.has(workspaceId)) {
      findings.push(finding('error', `portable.handoff-v2-phase1.${label}.workspace-ambiguous`, `Artifact-first Workspace ${label} must visibly bind one unique Workspace id.`, { workspaceId }));
      continue;
    }
    map.set(workspaceId, item);
  }
  return map;
}
function oneFile(files = [], path = '') { const matches = files.filter((file) => String(file.path || '') === String(path || '')); return matches.length === 1 ? matches[0] : null; }
function safeToken(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace'; }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
