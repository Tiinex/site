import { finalizeFile } from '../../../export/package.fileMap.js';
import { RECIPIENT_V2_POINTER_SCHEMA_TARGET, renderRecipientV2Pointer } from './recipientV2.artifacts.js';
import { recipientV2TransportFacts } from './recipientV2.transportManifest.js';

export function buildEndpointRolePointerChain(input = {}) {
  const files = [];
  const roles = [];
  const findings = [];
  let lineageParent = input.lineageParent || null;
  let nextDimension = String(input.nextDimension || '');
  for (const requirement of input.requirements || []) {
    const target = input.resolveRoleMaterialTarget(requirement, input.descriptor, input.workspaceById, input.cache, input.route);
    if (target.state !== 'qualified') {
      findings.push(finding('error', `portable.handoff-v2-surface.endpoint-role.${target.reason || 'unresolved'}`, 'Endpoint Role requirement did not resolve to one exact carried Workspace/cache representation.', { routeId: String(input.route?.id || ''), requirementId: String(requirement.id || '') }));
      continue;
    }
    const party = String(requirement.party || requirement.fields?.Side || '').toLowerCase() || 'endpoint';
    const roleToken = safeToken(requirement.roleLabel || requirement.name || target.referenceTarget || `${party}-role`);
    const rolePointerPath = `${nextDimension}-${party}-${roleToken}-endpoint-role-pointer.trace.md`;
    const roleFacts = {
      workspaceId: input.workspace.workspaceId,
      routeId: String(input.route?.id || ''),
      endpointRequirementId: String(requirement.id || ''),
      endpointParty: party,
      roleLabelHint: String(requirement.roleLabel || ''),
      referenceTarget: String(target.referenceTarget || ''),
      targetCarrierKind: target.carrierKind,
      targetWorkspaceId: String(target.targetWorkspaceId || ''),
      archivePath: target.archivePath,
      archiveSha256: target.archiveSha256,
      targetInnerPath: String(target.innerPath || ''),
      targetArchiveEntry: String(target.archiveEntry || ''),
      targetBytes: Number(target.bytes || 0),
      targetSha256: String(target.sha256 || '')
    };
    const rolePointer = finalizeFile({
      path: rolePointerPath,
      kind: 'endpoint-role-pointer',
      logicalKind: 'recipient-v2-endpoint-role-pointer',
      mediaType: 'text/markdown',
      transportFacts: recipientV2TransportFacts('endpoint-role', roleFacts),
      content: renderRecipientV2Pointer({
        createdAt: input.createdAt,
        parent: lineageParent,
        role: 'endpoint-role',
        title: `Endpoint Role Pointer — ${String(requirement.roleLabel || requirement.name || 'Role')}`,
        summary: 'Package-local Pointer to one exact Handoff endpoint Role artifact for the selected Handoff route.',
        prose: 'This Pointer grounds one exact Handoff From/To Role endpoint in an explicit carried Workspace/cache representation. It does not prove a human holder, consent, Handoff acceptance, or Role authority beyond the referenced Role artifact.',
        currentRead: [
          { label: 'Handoff Route', value: `\`${String(input.route?.id || '')}\`` },
          { label: 'Endpoint Requirement Id', value: `\`${String(requirement.id || '')}\`` },
          { label: 'Endpoint Party', value: party },
          ...(roleFacts.roleLabelHint ? [{ label: 'Role Label Hint', value: roleFacts.roleLabelHint }] : []),
          { label: 'Role Reference', value: roleFacts.referenceTarget ? `\`${roleFacts.referenceTarget}\`` : 'exact carried target' },
          { label: 'Target Carrier Kind', value: target.carrierKind },
          { label: 'Target Payload', value: `[payload](${target.archivePath})` },
          ...(target.carrierKind === 'workspace-archive-entry'
            ? [{ label: 'Target Workspace Id', value: `\`${String(target.targetWorkspaceId || '')}\`` }, { label: 'Target Inner Path', value: `\`${String(target.innerPath || '')}\`` }]
            : []),
          ...(target.carrierKind === 'workspace-cache-entry'
            ? [{ label: 'Target Archive Entry', value: `\`${String(target.archiveEntry || '')}\`` }]
            : [])
        ],
        destinations: [{ label: 'Exact endpoint Role carrier', display: `${target.archivePath} :: ${target.innerPath || target.archiveEntry}`, target: target.archivePath }],
        facts: roleFacts
      })
    });
    files.push(rolePointer);
    roles.push(Object.freeze({
      pointerPath: rolePointerPath,
      workspaceId: input.workspace.workspaceId,
      routeId: String(input.route?.id || ''),
      requirementId: String(requirement.id || ''),
      endpointParty: party,
      roleLabelHint: String(requirement.roleLabel || ''),
      referenceTarget: String(target.referenceTarget || ''),
      targetCarrierKind: target.carrierKind,
      targetWorkspaceId: String(target.targetWorkspaceId || ''),
      targetInnerPath: String(target.innerPath || target.archiveEntry || ''),
      targetSha256: String(target.sha256 || '')
    }));
    lineageParent = input.parentAuthority(rolePointer, 'tiinex.pointer.v1', RECIPIENT_V2_POINTER_SCHEMA_TARGET, input.createdAt);
    nextDimension = `${nextDimension}-1`;
  }
  return Object.freeze({
    files: Object.freeze(files),
    roles: Object.freeze(roles),
    findings: Object.freeze(findings),
    lineageParent,
    nextDimension
  });
}


export function buildParticipantRolePointerChain(input = {}) {
  const files = [];
  const roles = [];
  const findings = [];
  let lineageParent = input.lineageParent || null;
  let nextDimension = String(input.nextDimension || '');
  for (const requirement of input.requirements || []) {
    const target = input.resolveRoleMaterialTarget(requirement, input.descriptor, input.workspaceById, input.cache, input.route);
    if (target.state !== 'qualified') {
      findings.push(finding('error', `portable.handoff-v2-surface.participant-role.${target.reason || 'unresolved'}`, 'Participant Role requirement did not resolve to one exact carried Workspace/cache representation.', { routeId: String(input.route?.id || ''), requirementId: String(requirement.id || '') }));
      continue;
    }
    const roleToken = safeToken(requirement.roleLabel || requirement.name || target.referenceTarget || 'participant-role');
    const rolePointerPath = `${nextDimension}-${roleToken}-role-pointer.trace.md`;
    const roleFacts = {
      workspaceId: input.workspace.workspaceId,
      routeId: String(input.route?.id || ''),
      participantRequirementId: String(requirement.id || ''),
      roleLabelHint: String(requirement.roleLabel || ''),
      referenceTarget: String(target.referenceTarget || ''),
      targetCarrierKind: target.carrierKind,
      targetWorkspaceId: String(target.targetWorkspaceId || ''),
      archivePath: target.archivePath,
      archiveSha256: target.archiveSha256,
      targetInnerPath: String(target.innerPath || ''),
      targetArchiveEntry: String(target.archiveEntry || ''),
      targetBytes: Number(target.bytes || 0),
      targetSha256: String(target.sha256 || '')
    };
    const rolePointer = finalizeFile({
      path: rolePointerPath,
      kind: 'participant-role-pointer',
      logicalKind: 'recipient-v2-participant-role-pointer',
      mediaType: 'text/markdown',
      transportFacts: recipientV2TransportFacts('participant-role', roleFacts),
      content: renderRecipientV2Pointer({
        createdAt: input.createdAt,
        parent: lineageParent,
        role: 'participant-role',
        title: `Participant Role Pointer — ${String(requirement.roleLabel || requirement.name || 'Role')}`,
        summary: 'Package-local Pointer to one exact additional interaction participant Role artifact for the selected Handoff route.',
        prose: 'This Pointer contributes one additional participant Role to interaction grounding for its descendant Handoff route. It does not change Handoff From/To, prove a human holder, or create Role authority.',
        currentRead: [
          { label: 'Handoff Route', value: `\`${String(input.route?.id || '')}\`` },
          ...(roleFacts.roleLabelHint ? [{ label: 'Role Label Hint', value: roleFacts.roleLabelHint }] : []),
          { label: 'Role Reference', value: roleFacts.referenceTarget ? `\`${roleFacts.referenceTarget}\`` : 'exact carried target' }
        ],
        destinations: [{ label: 'Exact participant Role carrier', display: `${target.archivePath} :: ${target.innerPath || target.archiveEntry}`, target: target.archivePath }],
        facts: roleFacts
      })
    });
    files.push(rolePointer);
    roles.push(Object.freeze({
      pointerPath: rolePointerPath,
      workspaceId: input.workspace.workspaceId,
      routeId: String(input.route?.id || ''),
      requirementId: String(requirement.id || ''),
      targetCarrierKind: target.carrierKind,
      targetWorkspaceId: String(target.targetWorkspaceId || ''),
      targetInnerPath: String(target.innerPath || target.archiveEntry || ''),
      targetSha256: String(target.sha256 || '')
    }));
    lineageParent = input.parentAuthority(rolePointer, 'tiinex.pointer.v1', RECIPIENT_V2_POINTER_SCHEMA_TARGET, input.createdAt);
    nextDimension = `${nextDimension}-1`;
  }
  return Object.freeze({
    files: Object.freeze(files),
    roles: Object.freeze(roles),
    findings: Object.freeze(findings),
    lineageParent,
    nextDimension
  });
}

function safeToken(value = '') { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'workspace'; }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
