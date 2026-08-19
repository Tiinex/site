export const STARTUP_PRESENTATION_KIND = 'startup-resolving';

export function startupPresentationFor({ startupPhase = 'resolving', state = {} } = {}) {
  if (startupPhase !== 'resolving') return null;
  const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
  const owned = workspaces.filter((workspace) => hasStartupPresentationAuthority(workspace));
  const activeId = String(state?.activeWorkspaceId || '').trim();
  const active = owned.find((workspace) => String(workspace?.id || '') === activeId) || owned[0] || null;
  const declaredSize = owned.reduce((size, workspace) => Math.max(size, Number(workspace?.workspaceBootstrap?.workspaceSetSize || 0)), 0);
  const workspaceCount = Math.max(declaredSize, owned.length);
  const ownedMessage = cleanMessage(active?.discoveryProgress?.label || active?.workspaceBootstrap?.userFacingMessage || '');
  const message = workspaceCount > 1
    ? `Opening ${workspaceCount} configured workspaces`
    : (ownedMessage || 'Opening workspace');
  return Object.freeze({
    kind: STARTUP_PRESENTATION_KIND,
    message,
    workspaceCount,
    ownedWorkspaceId: String(active?.id || '')
  });
}

function hasStartupPresentationAuthority(workspace = {}) {
  return Boolean(
    workspace?.discoveryProgress?.active
    || workspace?.workspaceBootstrap?.schema === 'tiinex.workspace.bootstrap.v1'
    || workspace?.workspaceBootstrap?.startState
  );
}

function cleanMessage(value = '') {
  return String(value || '').trim().replace(/[.\s]+$/u, '');
}
