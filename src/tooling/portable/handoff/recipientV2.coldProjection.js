export function recipientColdProjection(carrier = {}, readPath = '001-1-READ-BEFORE-PROCEEDING.trace.md') {
  const routes = Object.freeze((carrier.routes || []).map((route) => Object.freeze({ id: String(route.id || ''), state: String(route.state || ''), workspaceId: String(route.workspaceId || ''), workspaceRelativeHandoffPath: String(route.workspaceRelativePath || ''), packagePath: String(route.packagePath || ''), sha256: String(route.sha256 || ''), from: String(route.parties?.from || ''), to: String(route.parties?.to || '') })));
  const workspaces = Object.freeze((carrier.workspaces || []).map((workspace) => Object.freeze({ id: String(workspace.id || ''), title: String(workspace.title || workspace.id || ''), slug: String(workspace.slug || ''), qualification: String(workspace.qualification || '') })));
  const qualified = routes.filter((route) => route.state === 'qualified');
  const workspaceMode = String(carrier.mode || '') === 'workspace';
  return deepFreeze({
    schema: 'tiinex.portable.handoff-cold-consumer-projection.v1', version: 1,
    status: carrier.status === 'ready' ? 'ready' : 'blocked',
    controls: Object.freeze({ start: readPath, carrier: 'visible-qualified-artifacts', closure: 'visible-qualified-artifacts-plus-exact-payload-bytes', fileMap: 'not-exposed-in-v2', manifest: 'not-exposed-in-v2' }),
    preferredPath: Object.freeze(workspaceMode
      ? { ingressKind: 'pointerless-workspace-package', firstSemanticOperation: 'orient-handoff-package', groundingOperation: 'none', qualificationOperation: 'workspace-qualification-after-orientation', minimalHostBootstrapActions: 1, nativeFallback: 'explicit-and-justified-only', providerSpecificSemanticAuthority: false }
      : { ingressKind: 'routed-handoff-package', firstSemanticOperation: 'orient-handoff-package', groundingOperation: 'ground-cold-consumer', qualificationOperation: 'qualify-cold-start', minimalHostBootstrapActions: 1, nativeFallback: 'explicit-and-justified-only', providerSpecificSemanticAuthority: false }),
    workspaces, routes,
    selection: Object.freeze({ policy: String(carrier.selection?.policy || ''), qualifiedRouteCount: qualified.length, implicitRouteId: workspaceMode ? '' : qualified.length === 1 ? qualified[0].id : '' }),
    authority: Object.freeze({ semanticAuthority: 'none', packageTruthRequired: true, routeBindingAuthority: workspaceMode ? 'none' : 'qualified-visible-artifact-plus-exact-payload-byte-truth-only' })
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
