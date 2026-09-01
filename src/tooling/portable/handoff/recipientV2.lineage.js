import { packageFileByteView, sha256Hex } from '../../../export/package.bytes.js';
import { finding, oneRecipientFile } from './recipientV2.inspect.helpers.js';

export function buildPackageLocalParentResolver(index) {
  return ({ parent = {} } = {}) => {
    const targets = new Set();
    if (parent.trace) targets.add(String(parent.trace));
    for (const entry of parent.originEntries || []) if (String(entry?.label || '') === 'relative' && entry?.target) targets.add(String(entry.target));
    const resolved = [...targets].map((path) => oneRecipientFile(index, path)).filter(Boolean);
    const unique = new Map(resolved.map((file) => [String(file.path || ''), file]));
    if (unique.size !== 1) return Object.freeze({ state: unique.size > 1 ? 'ambiguous' : 'unavailable', reason: unique.size > 1 ? 'multiple-package-local-parent-candidates' : 'package-local-parent-not-carried' });
    const file = [...unique.values()][0];
    const markdown = decodeUtf8(packageFileByteView(file));
    return markdown ? Object.freeze({ state: 'qualified', markdown, basis: 'package-local-parent-trace', packagePath: String(file.path || ''), sha256: sha256Hex(packageFileByteView(file)) }) : Object.freeze({ state: 'unavailable', reason: 'package-local-parent-not-markdown' });
  };
}

export function inspectPackageLocalLineage({ generatedArtifacts = [], rootArtifact = null, findings = [] } = {}) {
  if (!rootArtifact) return;
  const byPath = new Map(generatedArtifacts.map((item) => [item.path, item]));
  for (const artifact of generatedArtifacts) {
    const path = String(artifact.path || '');
    const trace = parentTrace(artifact);
    const childDimension = numericDimension(path);
    if (artifact === rootArtifact) {
      if (childDimension !== '001') findings.push(finding('error', 'portable.handoff-v2-surface.lineage.root-dimension-invalid', 'Package root must occupy numeric dimension 001.', { path, dimension: childDimension }));
      continue;
    }
    if (!trace) { findings.push(finding('error', 'portable.handoff-v2-surface.lineage.parent-missing', 'Every generated package-local artifact except the root must declare one Parent.', { path })); continue; }
    const parent = byPath.get(trace);
    if (!parent) { findings.push(finding('error', 'portable.handoff-v2-surface.lineage.parent-unresolved', 'Generated package-local Parent trace does not resolve to another carried generated artifact.', { path, parent: trace })); continue; }
    const parentDimension = numericDimension(trace);
    const expectedParentDimension = parentNumericDimension(childDimension);
    if (!childDimension || !parentDimension || parentDimension !== expectedParentDimension) findings.push(finding('error', 'portable.handoff-v2-surface.lineage.path-parent-mismatch', 'Numeric pathing must mirror the explicitly declared package-local Parent relation.', { path, childDimension, parent: trace, parentDimension, expectedParentDimension }));

    const seen = new Set([path]);
    let cursor = artifact;
    let reachedRoot = false;
    while (cursor && cursor !== rootArtifact) {
      const parentPath = parentTrace(cursor);
      if (!parentPath || seen.has(parentPath)) break;
      seen.add(parentPath);
      cursor = byPath.get(parentPath) || null;
      if (cursor === rootArtifact) reachedRoot = true;
    }
    if (!reachedRoot) findings.push(finding('error', 'portable.handoff-v2-surface.lineage.root-unreachable', 'Following declared Parent from a generated artifact must terminate at the single package-local root.', { path, root: rootArtifact.path }));
  }
}

export function inspectParticipantRolePointers(pointers, workspaces, caches, findings) {
  inspectRolePointers('participant-role', pointers, workspaces, caches, findings);
}

export function inspectEndpointRolePointers(pointers, workspaces, caches, findings) {
  inspectRolePointers('endpoint-role', pointers, workspaces, caches, findings);
}

function inspectRolePointers(roleKind, pointers, workspaces, caches, findings) {
  const codeKind = roleKind === 'endpoint-role' ? 'endpoint-role' : 'participant-role';
  const labelKind = roleKind === 'endpoint-role' ? 'Endpoint Role' : 'Participant Role';
  for (const pointer of pointers || []) {
    const facts = pointer.facts || {};
    const carrierKind = String(facts.targetCarrierKind || '');
    let entry = null;
    let archivePath = '';
    if (carrierKind === 'workspace-archive-entry') {
      const workspace = workspaces.find((item) => item.workspaceId === String(facts.targetWorkspaceId || ''));
      archivePath = String(workspace?.archiveFile?.path || '');
      entry = (workspace?.archive?.archive?.entries || []).find((item) => String(item.path || '') === String(facts.targetInnerPath || '')) || null;
    } else if (carrierKind === 'workspace-cache-entry') {
      const cache = caches.find((item) => item.artifact.path === String(facts.archivePath || '') || item.file.path === String(facts.archivePath || '') || String(item.facts?.workspaceId || '') === String(facts.workspaceId || ''));
      archivePath = String(cache?.file?.path || '');
      entry = (cache?.archive?.archive?.entries || []).find((item) => String(item.path || '') === String(facts.targetArchiveEntry || '')) || null;
    } else {
      findings.push(finding('error', `portable.handoff-v2-surface.${codeKind}.carrier-kind-invalid`, `${labelKind} Pointer declares an unsupported exact carrier kind.`, { path: pointer.path || '', carrierKind }));
      continue;
    }
    if (!entry) {
      findings.push(finding('error', `portable.handoff-v2-surface.${codeKind}.target-unresolved`, `${labelKind} Pointer target does not resolve to one exact carried archive entry.`, { path: pointer.path || '', carrierKind }));
      continue;
    }
    const data = packageFileByteView({ data: entry.data });
    const digest = sha256Hex(data);
    if (String(facts.archivePath || '') !== archivePath) findings.push(finding('error', `portable.handoff-v2-surface.${codeKind}.archive-path-mismatch`, `${labelKind} Pointer archive path diverges from the independently resolved carrier.`, { path: pointer.path || '', expected: archivePath, observed: String(facts.archivePath || '') }));
    if (Number(facts.targetBytes || 0) !== data.byteLength || String(facts.targetSha256 || '') !== digest) findings.push(finding('error', `portable.handoff-v2-surface.${codeKind}.target-identity-mismatch`, `${labelKind} Pointer byte identity diverges from the exact carried Role target.`, { path: pointer.path || '' }));
    const markdown = decodeUtf8(data);
    if (!/^\s*-\s+Current Schema:\s*(?:\[)?tiinex\.party\.role\.v1(?:\])?/mi.test(markdown)) findings.push(finding('error', `portable.handoff-v2-surface.${codeKind}.target-schema-invalid`, `${labelKind} Pointer target is not a readable tiinex.party.role.v1 artifact.`, { path: pointer.path || '' }));
    const label = String(markdown.match(/^\s*-\s+Role Label:\s*(.+?)\s*$/mi)?.[1] || '').trim();
    if (!label) findings.push(finding('error', `portable.handoff-v2-surface.${codeKind}.target-label-missing`, `${labelKind} Pointer target lacks a readable Role Label.`, { path: pointer.path || '' }));
    if (facts.roleLabelHint && label && String(facts.roleLabelHint) !== label) findings.push(finding('error', `portable.handoff-v2-surface.${codeKind}.label-hint-mismatch`, `${labelKind} label hint contradicts the exact carried Role artifact.`, { path: pointer.path || '', expected: label, observed: String(facts.roleLabelHint || '') }));
    if (roleKind === 'endpoint-role' && !['from', 'to'].includes(String(facts.endpointParty || '').toLowerCase())) findings.push(finding('error', 'portable.handoff-v2-surface.endpoint-role.party-invalid', 'Endpoint Role Pointer must visibly bind exactly one Handoff endpoint party.', { path: pointer.path || '', endpointParty: String(facts.endpointParty || '') }));
  }
}

export function inspectRoutePointers(pointers, carrier, workspaces, endpointPointers, participantPointers, index, findings) {
  const byKey = new Map((carrier.routes || []).map((route) => [`${route.workspaceId}\u0000${route.workspaceRelativePath}`, route]));
  const roleByPath = new Map([...(endpointPointers || []), ...(participantPointers || [])].map((pointer) => [String(pointer.path || ''), pointer]));
  for (const pointer of pointers) {
    const facts = pointer.facts || {};
    const key = `${String(facts.workspaceId || '')}\u0000${String(facts.workspaceRelativeHandoffPath || '')}`;
    const route = byKey.get(key);
    const workspace = workspaces.find((item) => item.workspaceId === String(facts.workspaceId || ''));
    if (!route || route.state !== 'qualified' || !workspace) { findings.push(finding('error', 'portable.handoff-v2-surface.route-pointer.unqualified', 'Handoff route Pointer does not resolve to one independently qualified Handoff route.', { path: pointer.path || '' })); continue; }
    const checks = [
      [facts.workspaceArtifactPath, workspace.artifact.path, 'workspace-artifact-path'],
      [facts.workspaceArtifactSha256, workspace.artifact.sha256, 'workspace-artifact-sha256'],
      [facts.archivePath, workspace.archiveFile.path, 'archive-path'],
      [facts.archiveSha256, String(workspace.archive?.sha256 || ''), 'archive-sha256'],
      [facts.sourceWorkspaceTargetInnerPath, workspace.facts.sourceWorkspaceTargetInnerPath, 'source-workspace-target-inner-path'],
      [facts.sourceWorkspaceTargetSha256, workspace.facts.sourceWorkspaceTargetSha256, 'source-workspace-target-sha256'],
      [facts.handoffSha256, route.sha256, 'handoff-sha256']
    ];
    for (const [actual, expected, name] of checks) if (String(actual || '') !== String(expected || '')) findings.push(finding('error', `portable.handoff-v2-surface.route-pointer.${name}-mismatch`, 'Handoff route Pointer diverges from independently qualified Workspace/archive/Handoff truth.', { path: pointer.path || '' }));
    const expectedBaseParent = facts.cacheArtifactPath ? String(facts.cacheArtifactPath) : workspace.artifact.path;
    if (facts.cacheArtifactPath && !oneRecipientFile(index, facts.cacheArtifactPath)) findings.push(finding('error', 'portable.handoff-v2-surface.route-pointer.cache-missing', 'Handoff route Pointer declares a package-local Workspace dependency cache ancestor that is not carried.', { path: pointer.path || '', cacheArtifactPath: facts.cacheArtifactPath }));
    let cursorParent = parentTrace(pointer);
    const roleAncestors = [];
    const seen = new Set();
    while (roleByPath.has(cursorParent) && !seen.has(cursorParent)) {
      seen.add(cursorParent);
      const rolePointer = roleByPath.get(cursorParent);
      roleAncestors.push(rolePointer);
      if (String(rolePointer.facts?.routeId || '') !== String(route.id || '') || String(rolePointer.facts?.workspaceId || '') !== String(workspace.workspaceId || '')) findings.push(finding('error', 'portable.handoff-v2-surface.route-pointer.role-route-mismatch', 'Role Pointer ancestor is bound to a different Handoff route/Workspace.', { path: pointer.path || '', rolePointer: rolePointer.path || '' }));
      cursorParent = parentTrace(rolePointer);
    }
    if (cursorParent !== expectedBaseParent) findings.push(finding('error', 'portable.handoff-v2-surface.route-pointer.parent-mismatch', 'Handoff route Pointer ancestry must pass only through route-bound endpoint/participant Role Pointers and terminate at its Workspace dependency cache when present, otherwise its package-local Workspace node.', { path: pointer.path || '', expectedParent: expectedBaseParent, observedTerminalParent: cursorParent }));
    if (Number(facts.handoffBytes || 0) && Number(facts.handoffBytes || 0) !== Number(resolveRouteBytes(workspace, facts.workspaceRelativeHandoffPath))) findings.push(finding('error', 'portable.handoff-v2-surface.route-pointer.handoff-bytes-mismatch', 'Handoff route Pointer byte count differs from exact archive entry bytes.', { path: pointer.path || '' }));
  }
}

function resolveRouteBytes(workspace, path) {
  const entry = (workspace.archive?.archive?.entries || []).find((item) => String(item.path || '') === String(path || ''));
  return Number(entry?.bytes || 0);
}

export function parentTrace(artifact = {}) {
  return String(artifact?.conformance?.parentContinuity?.trace || '');
}

function numericDimension(path = '') { return String(path || '').match(/^(\d+(?:-\d+)*)-/)?.[1] || ''; }
function parentNumericDimension(dimension = '') { const parts = String(dimension || '').split('-').filter(Boolean); return parts.length > 1 ? parts.slice(0, -1).join('-') : ''; }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
