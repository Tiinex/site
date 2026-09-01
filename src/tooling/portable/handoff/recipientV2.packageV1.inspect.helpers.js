import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { parseRecipientV2ExternalPayload, parseRecipientV2Pointer } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, RECIPIENT_V2_SIBLING_ROUTE_INFERENCE } from './recipientV2.entryContract.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { parentTrace } from './recipientV2.lineage.js';
import { finding } from './recipientV2.topology.materials.js';
import { RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH } from './recipientV2.packageV1.constants.js';
import { currentSchemaId, decodeUtf8, field, markdownTarget, numericDimension, oneFile, sectionText, unquote } from './recipientV2.packageV1.shared.js';

export function validateRouteClosure(routePointers, endpointPointers, participantPointers, caches, workspaces, findings) {
  const roles = new Map([...(endpointPointers || []), ...(participantPointers || [])].map((item) => [item.path, item]));
  const cacheByPath = new Map((caches || []).map((item) => [item.artifact.path, item]));
  const workspaceByPath = new Map((workspaces || []).map((item) => [item.artifact.path, item]));
  for (const pointer of routePointers || []) {
    const expectedWorkspace = workspaces.find((item) => item.workspaceId === String(pointer.facts?.workspaceId || ''));
    if (!expectedWorkspace) continue;
    let cursor = pointer;
    const seen = new Set([pointer.path]);
    const ancestorRoles = [];
    let terminal = '';
    while (cursor) {
      const trace = parentTrace(cursor);
      if (!trace || seen.has(trace)) break;
      seen.add(trace);
      if (roles.has(trace)) { cursor = roles.get(trace); ancestorRoles.push(trace); continue; }
      if (cacheByPath.has(trace) || workspaceByPath.has(trace)) { terminal = trace; break; }
      findings.push(finding('error', 'portable.handoff-package-v1.route-ancestor-unknown', 'Selected Handoff Pointer ancestor closure contains an unjustified package artifact role.', { pointer: pointer.path, ancestor: trace })); break;
    }
    const expectedTerminal = String(pointer.facts?.cacheArtifactPath || expectedWorkspace.artifact.path);
    if (terminal !== expectedTerminal) findings.push(finding('error', 'portable.handoff-package-v1.route-ancestor-terminal-invalid', 'Selected Handoff Pointer ancestor closure must terminate at its bounded cache when present, otherwise its owning Workspace artifact.', { pointer: pointer.path, expectedTerminal, observedTerminal: terminal }));
    for (const role of [...(endpointPointers || []), ...(participantPointers || [])].filter((item) => String(item.facts?.routeId || '') === String(pointer.facts?.routeId || ''))) if (!ancestorRoles.includes(role.path)) findings.push(finding('error', 'portable.handoff-package-v1.route-role-off-closure', 'Route-required Role Pointer must be on the selected Handoff Pointer ancestor closure.', { pointer: pointer.path, rolePointer: role.path }));
    const wsDim = numericDimension(expectedWorkspace.artifact.path);
    const pointerDim = numericDimension(pointer.path);
    if (!wsDim || !pointerDim || !pointerDim.startsWith(`${wsDim}-`)) findings.push(finding('error', 'portable.handoff-package-v1.route-placement-invalid', 'Handoff Pointer numeric path must descend from the Workspace containing its authoritative Handoff target.', { pointer: pointer.path, workspace: expectedWorkspace.artifact.path }));
    validateNumericParentChain(pointer, roles, cacheByPath, expectedWorkspace, findings);
  }
}

function validateNumericParentChain(pointer, roles, cacheByPath, workspace, findings) {
  let child = pointer;
  const lookup = new Map([...roles, ...cacheByPath].map(([key, value]) => [key, value.artifact || value]));
  lookup.set(workspace.artifact.path, workspace.artifact);
  const seen = new Set();
  while (child && !seen.has(child.path)) {
    seen.add(child.path);
    const trace = parentTrace(child);
    if (!trace) break;
    const childDim = numericDimension(child.path);
    const parentDim = numericDimension(trace);
    const expected = childDim.split('-').slice(0, -1).join('-');
    if (!childDim || !parentDim || parentDim !== expected) findings.push(finding('error', 'portable.handoff-package-v1.numeric-lineage-invalid', 'Carrier-local route ancestor numeric dimensions must mirror declared Parent continuity without alphabetic lineage components.', { path: child.path, parent: trace, childDimension: childDim, parentDimension: parentDim, expectedParentDimension: expected }));
    if (trace === workspace.artifact.path) break;
    child = lookup.get(trace) || null;
  }
}

export function deriveVisibleFacts({ markdown = '', schemaId = '', packageContract = null, index = new Map() } = {}) {
  if (schemaId === 'tiinex.pointer.v1') {
    const visible = parseRecipientV2Pointer(markdown);
    const role = String(visible.role || '');
    if (!role) return null;
    const base = { factsFormat: 'portable-recipient-v2', factsVersion: 1, role };
    if (role === 'recovery-orientation') return { ...base, format: RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, packageRootPath: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, entryArtifactPath: RECIPIENT_V2_READ_PATH, routeSelectionAuthority: RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY, siblingRouteInference: RECIPIENT_V2_SIBLING_ROUTE_INFERENCE };
    if (role === 'handoff-route') {
      const workspaceId = String(visible.workspaceId || '');
      const binding = (packageContract?.workspaces || []).find((item) => item.workspaceId === workspaceId) || null;
      const archiveFile = binding ? oneFile(index, binding.snapshotPath) : null;
      const workspaceFile = binding ? oneFile(index, binding.workspaceArtifactPath) : null;
      const parsed = archiveFile ? inspectStoredWorkspaceArchive(packageFileBytes(archiveFile), { ownedBytes: true }) : null;
      const handoffEntry = (parsed?.entries || []).find((entry) => entry.path === visible.handoffWorkspacePath) || null;
      const current = sectionText(markdown, 'Current Read');
      return { ...base, workspaceId, workspaceArtifactPath: binding?.workspaceArtifactPath || '', workspaceArtifactSha256: workspaceFile ? sha256Hex(packageFileBytes(workspaceFile)) : '', archivePath: binding?.snapshotPath || '', archiveSha256: archiveFile ? sha256Hex(packageFileBytes(archiveFile)) : '', sourceWorkspaceTargetInnerPath: binding?.workspaceArtifactInnerPath || '', sourceWorkspaceTargetSha256: workspaceFile ? sha256Hex(packageFileBytes(workspaceFile)) : '', workspaceRelativeHandoffPath: visible.handoffWorkspacePath, handoffBytes: Number(handoffEntry?.bytes || 0), handoffSha256: String(handoffEntry?.sha256 || ''), routeId: visible.routeId || unquote(field(current, 'Route Id')), cacheArtifactPath: markdownTarget(field(current, 'Workspace Dependency Cache')), requiredContextBindings: Object.freeze([]) };
    }
    if (role === 'endpoint-role' || role === 'participant-role') {
      const targetPayload = visible.targetPayload || '';
      const payload = oneFile(index, targetPayload);
      let entry = null;
      if (payload) {
        const parsed = inspectStoredWorkspaceArchive(packageFileBytes(payload), { ownedBytes: true });
        entry = (parsed.entries || []).find((item) => item.path === (visible.targetInnerPath || visible.targetArchiveEntry)) || null;
      }
      return { ...base, workspaceId: workspaceIdForRoute(index, visible.routeId || ''), routeId: visible.routeId || '', endpointRequirementId: visible.endpointRequirementId || '', participantRequirementId: visible.participantRequirementId || '', endpointParty: visible.endpointParty || '', roleLabelHint: visible.roleLabelHint || '', referenceTarget: visible.roleReference || '', targetCarrierKind: visible.targetCarrierKind || '', targetWorkspaceId: visible.targetWorkspaceId || '', archivePath: targetPayload, archiveSha256: payload ? sha256Hex(packageFileBytes(payload)) : '', targetInnerPath: visible.targetInnerPath || '', targetArchiveEntry: visible.targetArchiveEntry || '', targetBytes: Number(entry?.bytes || 0), targetSha256: String(entry?.sha256 || '') };
    }
    return base;
  }
  if (schemaId === 'tiinex.external.payload.v1') {
    const visible = parseRecipientV2ExternalPayload(markdown);
    const role = String(visible.payloadRole || '');
    const parent = parentTraceFromMarkdown(markdown);
    const workspaceId = String(visible.workspaceId || '') || (packageContract?.workspaces || []).find((item) => item.workspaceArtifactPath === parent)?.workspaceId || '';
    const materials = parsePayloadMaterials(sectionText(markdown, 'Payload Material Bindings'));
    return { factsFormat: 'portable-recipient-v2', factsVersion: 1, role, workspaceId, archivePath: visible.location, archiveBytes: visible.bytes, archiveSha256: visible.integrityValue, materials };
  }
  return null;
}

function workspaceIdForRoute(index = new Map(), routeId = '') {
  const targetRouteId = String(routeId || '');
  if (!targetRouteId) return '';
  const matches = [];
  for (const files of index.values()) for (const candidate of files || []) {
    if (!/\.md$/i.test(String(candidate.path || ''))) continue;
    const candidateMarkdown = decodeUtf8(packageFileBytes(candidate));
    if (currentSchemaId(candidateMarkdown) !== 'tiinex.pointer.v1') continue;
    const visible = parseRecipientV2Pointer(candidateMarkdown);
    if (visible.role === 'handoff-route' && String(visible.routeId || '') === targetRouteId) matches.push(String(visible.workspaceId || ''));
  }
  const unique = [...new Set(matches.filter(Boolean))];
  return unique.length === 1 ? unique[0] : '';
}

function parsePayloadMaterials(section = '') {
  const lines = String(section || '').split('\n');
  const out = []; let current = null;
  for (const line of lines) {
    const first = line.match(/^- Requirement Id:\s*(.+)$/);
    if (first) { if (current) out.push(current); current = { requirementId: first[1].trim() }; continue; }
    const match = line.match(/^\s{2}-\s+([^:]+):\s*(.*)$/); if (!current || !match) continue;
    const key = match[1].trim(), value = match[2].trim();
    if (key === 'Classification') current.classification = value; else if (key === 'Material Reference') current.referenceTarget = value; else if (key === 'Archive Entry') current.archiveEntry = value; else if (key === 'Route Workspace Id') current.routeWorkspaceId = value; else if (key === 'Route Path') current.routePath = value; else if (key === 'Source Requirement Id') current.sourceRequirementId = value; else if (key === 'Original Path') current.originalPath = value; else if (key === 'Byte Size') current.bytes = Number(value || 0); else if (key === 'SHA256') current.sha256 = value;
  }
  if (current) out.push(current);
  return out;
}
function parentTraceFromMarkdown(markdown = '') { return String(markdown).match(/^\s*-\s+Trace:\s*\[[^\]]*\]\(([^)]+)\)\s*$/mi)?.[1] || ''; }
