import { parentTrace } from './recipientV2.lineage.js';

export function projectRecipientV2Routes(routePointers = [], endpointPointers = [], participantPointers = []) {
  return Object.freeze(routePointers.map((item) => Object.freeze({
    pointerPath: item.path,
    workspaceId: String(item.facts?.workspaceId || ''),
    workspaceRelativeHandoffPath: String(item.facts?.workspaceRelativeHandoffPath || ''),
    endpointRolePointers: Object.freeze(rolePointerAncestors(item, endpointPointers, participantPointers).filter((path) => endpointPointers.some((pointer) => pointer.path === path))),
    participantRolePointers: Object.freeze(rolePointerAncestors(item, endpointPointers, participantPointers).filter((path) => participantPointers.some((pointer) => pointer.path === path)))
  })));
}

export function projectRecipientV2EndpointRoles(pointers = []) {
  return Object.freeze(pointers.map((item) => Object.freeze({
    pointerPath: item.path,
    workspaceId: String(item.facts?.workspaceId || ''),
    routeId: String(item.facts?.routeId || ''),
    requirementId: String(item.facts?.endpointRequirementId || ''),
    endpointParty: String(item.facts?.endpointParty || ''),
    roleLabelHint: String(item.facts?.roleLabelHint || ''),
    referenceTarget: String(item.facts?.referenceTarget || ''),
    targetCarrierKind: String(item.facts?.targetCarrierKind || ''),
    targetWorkspaceId: String(item.facts?.targetWorkspaceId || ''),
    archivePath: String(item.facts?.archivePath || ''),
    targetInnerPath: String(item.facts?.targetInnerPath || item.facts?.targetArchiveEntry || ''),
    targetArchiveEntry: String(item.facts?.targetArchiveEntry || ''),
    targetBytes: Number(item.facts?.targetBytes || 0),
    targetSha256: String(item.facts?.targetSha256 || '')
  })));
}

export function projectRecipientV2ParticipantRoles(pointers = []) {
  return Object.freeze(pointers.map((item) => Object.freeze({
    pointerPath: item.path,
    workspaceId: String(item.facts?.workspaceId || ''),
    routeId: String(item.facts?.routeId || ''),
    roleLabelHint: String(item.facts?.roleLabelHint || ''),
    referenceTarget: String(item.facts?.referenceTarget || ''),
    targetCarrierKind: String(item.facts?.targetCarrierKind || ''),
    targetWorkspaceId: String(item.facts?.targetWorkspaceId || ''),
    targetInnerPath: String(item.facts?.targetInnerPath || item.facts?.targetArchiveEntry || ''),
    targetSha256: String(item.facts?.targetSha256 || '')
  })));
}

function rolePointerAncestors(routePointer, endpointPointers = [], participantPointers = []) {
  const byPath = new Map([...endpointPointers, ...participantPointers].map((item) => [String(item.path || ''), item]));
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
