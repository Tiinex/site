import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { renderRecipientV2Pointer } from './recipientV2.artifacts.js';

export function buildPhase1RolePointers(input = {}) {
  const kind = input.kind === 'endpoint' ? 'endpoint' : 'participant';
  const expectedRole = `${kind}-role`;
  const artifacts = [];
  const projections = [];
  const findings = [];
  const workspaceById = new Map((input.workspaceCarriers || []).map((item) => [String(item.workspaceId || ''), item]));
  for (const [index, sourcePointerPath] of [...(input.sourcePointerPaths || [])].entries()) {
    const facts = input.sourceFactsByPath?.get(String(sourcePointerPath || '')) || null;
    if (!facts || String(facts.role || '') !== expectedRole) {
      findings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.source-unresolved`, `Selected-route ${kind} Role Pointer transport facts are unavailable in the qualified source carrier.`, { path: String(sourcePointerPath || '') }));
      continue;
    }
    const targetCarrierKind = String(facts.targetCarrierKind || '');
    const targetWorkspaceId = String(facts.targetWorkspaceId || '');
    const workspaceCarrier = targetCarrierKind === 'workspace-archive-entry' ? workspaceById.get(targetWorkspaceId) || null : null;
    const targetPayload = workspaceCarrier ? workspaceCarrier.payloadArtifactPath : targetCarrierKind === 'workspace-cache-entry' ? String(input.cacheArtifact?.path || '') : '';
    if (!targetPayload) {
      findings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.target-unresolved`, `Selected-route ${kind} Role target must resolve to an explicit carried Workspace or cache External Payload artifact.`, { path: String(sourcePointerPath || ''), targetCarrierKind, targetWorkspaceId }));
      continue;
    }
    if (targetCarrierKind === 'workspace-cache-entry' && !(input.selectedCacheMaterials || []).some((item) => String(item.archiveEntry || '') === String(facts.targetArchiveEntry || ''))) {
      findings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.cache-material-unresolved`, `${kind} Role cache target is not owned by the selected-route cache External Payload.`, { path: String(sourcePointerPath || ''), targetArchiveEntry: String(facts.targetArchiveEntry || '') }));
      continue;
    }
    const roleLabel = String(facts.roleLabelHint || `${kind}-role`);
    const pathPrefix = String(input.pathPrefix || '001-6').replace(/-+$/g, '') || '001-6';
    const pointerPath = `${pathPrefix}-${kind === 'endpoint' ? 'e' : 'p'}-${index + 1}-${safeToken(roleLabel)}-role-pointer.trace.md`;
    const requirementId = String(kind === 'endpoint' ? facts.endpointRequirementId : facts.participantRequirementId || '');
    const currentRead = [
      { label: 'Workspace Id', value: `\`${String(input.routeWorkspaceId || '')}\`` },
      { label: 'Route Id', value: `\`${String(input.selectedRouteId || '')}\`` },
      ...(kind === 'endpoint' ? [
        { label: 'Endpoint Requirement Id', value: `\`${requirementId}\`` },
        { label: 'Endpoint Party', value: String(facts.endpointParty || '') }
      ] : [{ label: 'Participant Requirement Id', value: `\`${requirementId}\`` }]),
      ...(facts.roleLabelHint ? [{ label: 'Role Label Hint', value: String(facts.roleLabelHint) }] : []),
      { label: 'Role Reference', value: `\`${String(facts.referenceTarget || '')}\`` },
      { label: 'Target Carrier Kind', value: targetCarrierKind },
      { label: 'Target Payload', value: `[payload](${targetPayload})` },
      ...(targetCarrierKind === 'workspace-archive-entry' ? [
        { label: 'Target Workspace Id', value: `\`${targetWorkspaceId}\`` },
        { label: 'Target Inner Path', value: `\`${String(facts.targetInnerPath || '')}\`` }
      ] : []),
      ...(targetCarrierKind === 'workspace-cache-entry' ? [{ label: 'Target Archive Entry', value: `\`${String(facts.targetArchiveEntry || '')}\`` }] : [])
    ];
    const pointer = finalizeFile({
      path: pointerPath,
      kind: `${kind}-role-pointer`,
      logicalKind: `recipient-v2-phase1-${kind}-role-pointer`,
      mediaType: 'text/markdown',
      content: renderRecipientV2Pointer({
        artifactFirst: true,
        createdAt: input.createdAt,
        role: expectedRole,
        title: `${kind === 'endpoint' ? 'Endpoint' : 'Participant'} Role Pointer — ${roleLabel}`,
        summary: `Artifact-first Pointer to one exact ${kind} Role artifact carried by an explicit Workspace or cache External Payload.`,
        prose: kind === 'endpoint'
          ? 'This Pointer grounds one exact Handoff From/To Role endpoint. It does not prove a human holder, consent, Handoff acceptance, or Role authority beyond the referenced Role artifact.'
          : 'This Pointer contributes one additional participant Role to interaction grounding. It does not change Handoff From/To, prove a human holder, or create Role authority.',
        currentRead,
        destinations: [{ label: `Exact ${kind} Role payload owner`, target: targetPayload }]
      })
    });
    artifacts.push(pointer);
    projections.push(Object.freeze({
      pointerPath,
      workspaceId: String(input.routeWorkspaceId || ''),
      routeId: String(input.selectedRouteId || ''),
      requirementId,
      ...(kind === 'endpoint' ? { endpointParty: String(facts.endpointParty || '') } : {}),
      roleLabelHint: String(facts.roleLabelHint || ''),
      referenceTarget: String(facts.referenceTarget || ''),
      targetCarrierKind,
      targetWorkspaceId,
      targetInnerPath: String(facts.targetInnerPath || facts.targetArchiveEntry || ''),
      targetSha256: String(facts.targetSha256 || '')
    }));
  }
  return Object.freeze({ artifacts: Object.freeze(artifacts), projections: Object.freeze(projections), findings: Object.freeze(findings) });
}

export function qualifyPhase1RolePointer(pointer = null, context = {}, findings = []) {
  const kind = context.kind === 'endpoint' ? 'endpoint' : 'participant';
  const parsed = pointer?.parsed || {};
  const localFindings = [];
  const targetCarrierKind = String(parsed.targetCarrierKind || '');
  if (String(parsed.workspaceId || '') !== String(context.routeWorkspaceId || '') || String(parsed.routeId || '') !== String(context.routeId || '')) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.route-binding-mismatch`, `${kind} Role Pointer must visibly bind the selected route Workspace and route id.`, { path: String(pointer?.path || '') }));
  if (!['workspace-archive-entry', 'workspace-cache-entry'].includes(targetCarrierKind)) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.target-carrier-invalid`, `${kind} Role Pointer target carrier must be an explicit Workspace or selected-route cache payload.`, { path: String(pointer?.path || ''), targetCarrierKind }));
  const targetPayload = String(parsed.targetPayload || '');
  let targetArchive = null;
  let archivePath = '';
  let targetPath = '';
  let targetWorkspaceId = String(parsed.targetWorkspaceId || '');
  if (targetCarrierKind === 'workspace-archive-entry') {
    const workspace = context.workspaceQualifications?.get(targetWorkspaceId) || null;
    if (!workspace) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.workspace-unresolved`, `${kind} Role Pointer target Workspace is not carried as a qualified artifact-first Workspace payload.`, { targetWorkspaceId }));
    else {
      if (targetPayload !== String(workspace.payload?.path || '')) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.workspace-payload-mismatch`, `${kind} Role Pointer must target the explicit External Payload for its target Workspace.`, { targetWorkspaceId }));
      targetArchive = workspace.archive;
      archivePath = String(workspace.payload?.parsed?.location || '');
      targetPath = String(parsed.targetInnerPath || '');
    }
  } else if (targetCarrierKind === 'workspace-cache-entry') {
    const cacheIndex = (context.cachePayloads || []).findIndex((item) => String(item.path || '') === targetPayload);
    if (cacheIndex < 0) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.cache-payload-unresolved`, `${kind} Role Pointer must target the explicit selected-route cache External Payload.`, { targetPayload }));
    else {
      const cacheQualification = context.cacheQualifications?.[cacheIndex] || null;
      targetPath = String(parsed.targetArchiveEntry || '');
      const material = (cacheQualification?.materials || []).find((item) => String(item.archiveEntry || '') === targetPath) || null;
      if (!material) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.cache-entry-unowned`, `${kind} Role cache target must be one exact material explicitly owned by the selected-route cache External Payload.`, { targetPath }));
      targetArchive = cacheQualification?.archive || null;
      archivePath = String(cacheQualification?.payloadPath || '');
    }
  }
  const matches = targetArchive?.state === 'qualified' ? targetArchive.entries.filter((entry) => String(entry.path || '') === targetPath) : [];
  if (!targetPath || matches.length !== 1) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.target-unresolved`, `${kind} Role Pointer must resolve exactly one exact Role artifact inside its explicit payload owner.`, { targetPayload, targetPath, count: matches.length }));
  let targetBytes = 0;
  let targetSha256 = '';
  if (matches.length === 1) {
    const data = packageFileBytes({ data: matches[0].data });
    targetBytes = data.byteLength;
    targetSha256 = sha256Hex(data);
    const markdown = decodeUtf8(data);
    if (currentSchemaId(markdown) !== 'tiinex.party.role.v1') localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.schema-invalid`, `${kind} Role Pointer target must be one exact tiinex.party.role.v1 artifact.`, { targetPath }));
    const roleLabel = fieldValue(sectionText(markdown, 'Role Identity'), 'Role Label');
    if (!roleLabel) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.label-unresolved`, `${kind} Role target must visibly declare Role Label.`, { targetPath }));
    if (parsed.roleLabelHint && roleLabel && normalizeToken(parsed.roleLabelHint) !== normalizeToken(roleLabel)) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.label-mismatch`, `${kind} Role Pointer label hint conflicts with the exact carried Role artifact.`, { hint: parsed.roleLabelHint, roleLabel }));
  }
  const requirementId = kind === 'endpoint' ? String(parsed.endpointRequirementId || '') : String(parsed.participantRequirementId || '');
  if (!requirementId || !parsed.roleReference) localFindings.push(finding('error', `portable.handoff-v2-phase1.${kind}-role.binding-incomplete`, `${kind} Role Pointer must visibly preserve its requirement id and Role reference.`));
  if (kind === 'endpoint' && !['from', 'to'].includes(String(parsed.endpointParty || '').toLowerCase())) localFindings.push(finding('error', 'portable.handoff-v2-phase1.endpoint-role.party-invalid', 'Endpoint Role Pointer must visibly declare endpoint party from or to.'));
  findings.push(...localFindings);
  return Object.freeze({
    state: localFindings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified',
    pointerPath: String(pointer?.path || ''),
    workspaceId: String(parsed.workspaceId || ''),
    routeId: String(parsed.routeId || ''),
    requirementId,
    ...(kind === 'endpoint' ? { endpointParty: String(parsed.endpointParty || '') } : {}),
    roleLabelHint: String(parsed.roleLabelHint || ''),
    referenceTarget: String(parsed.roleReference || ''),
    targetCarrierKind,
    targetWorkspaceId,
    archivePath,
    targetInnerPath: targetPath,
    targetArchiveEntry: targetCarrierKind === 'workspace-cache-entry' ? targetPath : '',
    targetBytes,
    targetSha256,
    findings: Object.freeze(localFindings)
  });
}

function currentSchemaId(markdown = '') { return String(String(markdown || '').match(/Current Schema:\s*(?:\[)?(tiinex\.[a-z0-9._-]+)(?:\])?/i)?.[1] || '').toLowerCase(); }
function sectionText(markdown = '', heading = '') { const re = new RegExp(`^##\\s+${escapeRe(heading)}\\s*$`, 'mi'); const match = re.exec(String(markdown || '')); if (!match) return ''; const rest = String(markdown || '').slice(match.index + match[0].length); const next = /^##\s+/m.exec(rest); return (next ? rest.slice(0, next.index) : rest).trim(); }
function fieldValue(section = '', name = '') { const m = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRe(name)}:\\s*(.+?)\\s*$`, 'mi')); return String(m?.[1] || '').trim(); }
function markdownTarget(value = '') { return String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || String(value || '').trim(); }
function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function normalizeToken(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function safeToken(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'role'; }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
