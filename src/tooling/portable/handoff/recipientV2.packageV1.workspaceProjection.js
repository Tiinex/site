import { WORKSPACE_PACKAGE_ROLE } from './recipientV2.packageV1.contract.js';
import { deepFreeze } from './recipientV2.packageV1.shared.js';

export function workspaceCarrierProjection(workspaceParts = [], lineage = null) {
  const workspaces = workspaceParts.map((item) => Object.freeze({
    id: String(item.workspaceId || ''),
    title: String(item.workspaceId || ''),
    slug: String(item.workspaceId || '').replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase(),
    qualification: item.targetQualification?.state === 'qualified' ? 'qualified' : 'unresolved'
  }));
  const ready = workspaces.length > 0 && workspaces.every((item) => item.qualification === 'qualified');
  return deepFreeze({
    schema: 'tiinex.portable.handoff-carrier-projection.v1', version: 1,
    status: ready ? 'ready' : 'blocked', mode: 'workspace', lineage,
    workspaces: Object.freeze(workspaces),
    workspace: workspaces[0] || Object.freeze({ id: '', title: '', slug: '', qualification: 'unresolved' }),
    selection: Object.freeze({ policy: 'none', qualifiedRouteCount: 0, implicitRouteId: '', packageRole: WORKSPACE_PACKAGE_ROLE }),
    routes: Object.freeze([]),
    authority: Object.freeze({ semanticAuthority: 'none', filenameAuthority: false, dimensionalParentAuthority: false, routeSelectionAuthority: 'none' }),
    findings: Object.freeze([])
  });
}
