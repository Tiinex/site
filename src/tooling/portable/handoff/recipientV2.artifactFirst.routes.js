import { qualifySelectedHandoffArtifact } from './routeArtifactConformance.js';
import { qualifyPhase1RolePointer } from './recipientV2.artifactFirst.roles.js';
import { qualifyPhase1RequiredContextClosure, resolveArchiveParent, parseHandoffParties } from './recipientV2.artifactFirst.closure.js';
import { decodeUtf8, finding } from './recipientV2.artifactFirst.shared.js';

export function qualifyPhase1RouteBindings({ routes = [], workspaceQualifications = new Map(), findings = [], recoveryParentCandidates = [], selectedRouteIdFromIngress = '', cacheQualifications = [], rolePointers = [], endpointPointers = [], participantPointers = [], cachePayloads = [], endpointRoleQualifications = [], participantRoleQualifications = [], boundRolePaths = new Set(), routeQualifications = [] } = {}) {
  for (const route of routes) {
    const routeWorkspaceId = String(route.parsed.workspaceId || '');
    const workspaceQualification = workspaceQualifications.get(routeWorkspaceId) || null;
    if (!workspaceQualification && routeWorkspaceId) findings.push(finding('error', 'portable.handoff-v2-phase1.workspace.route-unresolved', 'Every visible route Workspace must resolve one qualified artifact-first Workspace payload/relation pair.', { workspaceId: routeWorkspaceId, pointerPath: route.path }));
    const payload = workspaceQualification?.payload || null;
    const relation = workspaceQualification?.relation || null;
    const archive = workspaceQualification?.archive || null;
    const archiveFile = workspaceQualification?.archiveFile || null;
    const workspaceTargetQualification = workspaceQualification?.workspaceTargetQualification || null;
    let routeEntry = null;
    let routeConformance = null;
    let routeParties = Object.freeze({ from: '', to: '' });
    let requiredClosure = Object.freeze({ state: 'blocked', requiredCount: 0, qualifiedCount: 0, requirements: Object.freeze([]), boundary: 'Artifact-first Required Context qualification has not run.' });
    const semanticRouteId = String(route.parsed.routeId || `handoff-route:${routeWorkspaceId}:${String(route.parsed.handoffWorkspacePath || '')}`);
    const routeEndpointRoles = [];
    const routeParticipantRoles = [];

    if (route && payload) {
      if (route.parsed.workspaceId !== payload.parsed.workspaceId || route.parsed.workspacePayload !== payload.path) findings.push(finding('error', 'portable.handoff-v2-phase1.route.workspace-mismatch', 'Route Pointer must visibly bind the same Workspace identity and External Payload artifact.', { routeId: semanticRouteId }));
      if (!route.parsed.handoffWorkspacePath) findings.push(finding('error', 'portable.handoff-v2-phase1.route.path-missing', 'Route Pointer must visibly declare the Handoff Workspace Path.', { routeId: semanticRouteId }));
      if (!route.parsed.routeId || route.parsed.routeId !== semanticRouteId) findings.push(finding('error', 'portable.handoff-v2-phase1.route.id-missing', 'Route Pointer must visibly bind one exact route identity.', { routeId: semanticRouteId }));
    }
    if (archive?.state === 'qualified' && route) {
      const routeEntries = archive.entries.filter((entry) => String(entry.path || '') === String(route.parsed.handoffWorkspacePath || ''));
      if (routeEntries.length !== 1) findings.push(finding('error', 'portable.handoff-v2-phase1.route.unresolved', 'Route Pointer Handoff Workspace Path must resolve exactly one exact artifact inside its Workspace payload.', { routeId: semanticRouteId, path: route.parsed.handoffWorkspacePath || '', count: routeEntries.length }));
      else {
        routeEntry = routeEntries[0];
        const routeMarkdown = decodeUtf8(routeEntry.data);
        routeConformance = qualifySelectedHandoffArtifact({ markdown: routeMarkdown, resolveParent: ({ parent, targetEntry }) => resolveArchiveParent(route.parsed.handoffWorkspacePath, archive.entries, parent, targetEntry, recoveryParentCandidates) });
        if (routeConformance.status !== 'qualified') findings.push(...(routeConformance.findings || []).map((item) => finding(item.severity || 'error', item.code || 'portable.handoff-v2-phase1.route.unqualified', item.message || 'Exact Handoff route did not qualify.', { routeId: semanticRouteId })));
        routeParties = parseHandoffParties(routeMarkdown);
        if (!routeParties.from || !routeParties.to) findings.push(finding('error', 'portable.handoff-v2-phase1.route.parties-unresolved', 'Exact Handoff bytes must provide From and To parties; route Pointer does not duplicate them.', { routeId: semanticRouteId }));
        requiredClosure = qualifyPhase1RequiredContextClosure({
          markdown: routeMarkdown,
          routePath: route.parsed.handoffWorkspacePath,
          workspaceId: payload?.parsed?.workspaceId || routeWorkspaceId,
          archivePath: payload?.parsed?.location || '',
          entries: archive.entries,
          workspaceArchives: [...workspaceQualifications.values()].filter((item) => item?.archive?.state === 'qualified').map((item) => Object.freeze({ workspaceId: String(item.workspaceId || item.payload?.parsed?.workspaceId || ''), archivePath: String(item.payload?.parsed?.location || ''), entries: Object.freeze([...(item.archive?.entries || [])]) })),
          caches: semanticRouteId === selectedRouteIdFromIngress ? cacheQualifications : []
        });
        findings.push(...(requiredClosure.findings || []).map((item) => Object.freeze({ ...item, routeId: semanticRouteId })));
      }
    }

    if (route && payload && archive?.state === 'qualified') {
      const expectedRolePaths = route.parsed.destinations.filter((target) => String(target || '') !== String(payload.path || ''));
      for (const expectedPath of expectedRolePaths) {
        const matches = rolePointers.filter((item) => String(item.path || '') === String(expectedPath || ''));
        if (matches.length !== 1) {
          findings.push(finding('error', 'portable.handoff-v2-phase1.role.pointer-missing', 'Route Pointer must resolve every declared Role Pointer exactly once.', { routeId: semanticRouteId, path: String(expectedPath || ''), count: matches.length }));
          if (!endpointPointers.length && !participantPointers.length) findings.push(finding('error', 'portable.handoff-v2-phase1.participant-role.pointer-missing', 'Route Pointer has an unresolved Role destination and no surviving explicit Role Pointer can classify it.', { routeId: semanticRouteId, path: String(expectedPath || ''), count: matches.length }));
          continue;
        }
        const pointer = matches[0];
        boundRolePaths.add(String(pointer.path || ''));
        const kind = pointer.parsed.role === 'endpoint-role' ? 'endpoint' : 'participant';
        const result = qualifyPhase1RolePointer(pointer, { kind, routeWorkspaceId, routeId: semanticRouteId, workspaceQualifications, cachePayloads, cacheQualifications }, findings);
        if (kind === 'endpoint') { routeEndpointRoles.push(result); endpointRoleQualifications.push(result); }
        else { routeParticipantRoles.push(result); participantRoleQualifications.push(result); }
      }
    } else if (route?.parsed?.destinations?.some((target) => rolePointers.some((pointer) => String(pointer.path || '') === String(target || '')))) {
      findings.push(finding('error', 'portable.handoff-v2-phase1.role.route-unresolved', 'Role Pointers cannot qualify until their route and Workspace payload qualify.', { routeId: semanticRouteId }));
    }

    const routeReasons = [];
    if (routeConformance?.status !== 'qualified') routeReasons.push('handoff-conformance-unqualified');
    if (requiredClosure.state !== 'qualified') routeReasons.push('required-context-closure-unqualified');
    if (routeEndpointRoles.some((item) => item.state !== 'qualified')) routeReasons.push('endpoint-role-grounding-unqualified');
    if (routeParticipantRoles.some((item) => item.state !== 'qualified')) routeReasons.push('participant-role-grounding-unqualified');
    routeQualifications.push(Object.freeze({
      route,
      routeId: semanticRouteId,
      workspaceId: routeWorkspaceId,
      workspaceQualification,
      payload,
      relation,
      archive,
      archiveFile,
      workspaceTargetQualification,
      routeEntry,
      routeConformance,
      routeParties,
      requiredClosure,
      endpointRoles: Object.freeze(routeEndpointRoles),
      participantRoles: Object.freeze(routeParticipantRoles),
      reasons: Object.freeze(routeReasons)
    }));
  }

}

export function validatePhase1IngressBindings({ workspaceQualificationList = [], ingressPointer = null, routes = [], bootstrapPayload = null, cachePayloads = [], rolePointers = [], boundRolePaths = new Set(), findings = [] } = {}) {
  for (const item of workspaceQualificationList) {
    if (ingressPointer && !ingressPointer.parsed.destinations.includes(item.payload.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.payload-missing', 'Ingress Pointer must navigate to every carried Workspace External Payload artifact.', { workspaceId: item.workspaceId, path: item.payload.path }));
    if (ingressPointer && !ingressPointer.parsed.destinations.includes(item.relation.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.relation-missing', 'Ingress Pointer must navigate to every carried Workspace material-representation Relation.', { workspaceId: item.workspaceId, path: item.relation.path }));
  }
  for (const route of routes) if (ingressPointer && !ingressPointer.parsed.destinations.includes(route.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.route-missing', 'Ingress Pointer must navigate to every Handoff route Pointer.', { path: route.path }));
  if (ingressPointer && bootstrapPayload && !ingressPointer.parsed.destinations.includes(bootstrapPayload.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.bootstrap-missing', 'Ingress Pointer must navigate to the visible portable Tooling bootstrap External Payload artifact when one is carried.'));
  if (ingressPointer && !bootstrapPayload && ingressPointer.parsed.destinations.some((target) => /bootstrap/i.test(String(target || '')))) findings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.artifact-unresolved', 'Ingress Pointer declares a portable Tooling bootstrap destination but no owning External Payload artifact is present.'));
  for (const cachePayload of cachePayloads) if (ingressPointer && !ingressPointer.parsed.destinations.includes(cachePayload.path)) findings.push(finding('error', 'portable.handoff-v2-phase1.ingress.cache-missing', 'Ingress Pointer must navigate to every selected-route cache External Payload artifact.', { path: cachePayload.path }));
  for (const pointer of rolePointers) {
    if (!boundRolePaths.has(String(pointer.path || ''))) findings.push(finding('error', 'portable.handoff-v2-phase1.role.unbound', 'Role Pointer must be explicitly bound by one visible route Pointer.', { path: String(pointer.path || '') }));
    if (ingressPointer && !ingressPointer.parsed.destinations.includes(pointer.path)) findings.push(finding('error', pointer.parsed.role === 'endpoint-role' ? 'portable.handoff-v2-phase1.ingress.endpoint-role-missing' : 'portable.handoff-v2-phase1.ingress.participant-role-missing', 'Ingress Pointer must navigate to every visible Role Pointer.', { path: pointer.path }));
  }

}
