export function projectGroundingAuthority(authority, mode) {
  if (!authority || mode !== 'routed-handoff-package') return Object.freeze({ state: 'not-supplied', route: null, handoff: null, role: null, holderBinding: null, operationBoundary: null });
  const mutationBoundary = authority.mutationBoundary || null;
  return Object.freeze({
    state: String(authority.status || ''),
    route: authority.selectedRoute ? Object.freeze({ id: authority.selectedRoute.id || '', pointerPath: authority.selectedRoute.pointerPath || '', workspaceId: authority.selectedRoute.workspaceId || '' }) : null,
    handoff: authority.handoff ? Object.freeze({ purpose: authority.handoff.purpose || '', from: authority.handoff.from || '', to: authority.handoff.to || '', completionExpectation: authority.handoff.completionExpectation || null }) : null,
    role: authority.role ? Object.freeze({ state: authority.role.state || '', label: authority.role.endpoint?.label || '', kind: authority.role.endpoint?.kind || '' }) : null,
    holderBinding: authority.holderBinding ? Object.freeze({ state: authority.holderBinding.state || '', holderId: authority.holderBinding.holderId || '', roleLabel: authority.holderBinding.roleLabel || '', recipientRoleLabel: authority.holderBinding.recipientRoleLabel || '', recipientCompatibility: authority.holderBinding.recipientCompatibility || '', source: authority.holderBinding.source || '', explicit: Boolean(authority.holderBinding.explicit), inferredFromTransport: Boolean(authority.holderBinding.inferredFromTransport), boundary: authority.holderBinding.boundary || '' }) : null,
    operationBoundary: mutationBoundary ? Object.freeze({
      ...mutationBoundary,
      scope: 'current-grounding-operation-only',
      semanticAuthority: 'Handoff/Task/Role artifacts govern downstream work authority; this operation boundary neither grants nor revokes source-edit authority.',
      boundary: 'Describes the non-mutating behavior and host-safety limits of the current Tooling grounding operation only. It must not be interpreted as a prohibition on separately authorized downstream Workspace work.'
    }) : null
  });
}
