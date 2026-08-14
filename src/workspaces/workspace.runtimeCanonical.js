export function workspaceRuntimeCandidateViolations(state = {}) {
  const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
  return workspaces.flatMap((workspace) => {
    if (!workspace || !Object.prototype.hasOwnProperty.call(workspace, 'workspaceMergeCandidates')) return [];
    const candidates = Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [];
    return [{ workspaceId: workspace.id || '', count: candidates.length, reason: 'legacy-candidate-shape-present' }];
  });
}

export function assertCanonicalWorkspaceRuntimeState(state = {}, boundary = 'runtime') {
  const violations = workspaceRuntimeCandidateViolations(state);
  return Object.freeze({
    ok: violations.length === 0,
    schema: 'tiinex.workspace.runtime-canonicality.v1',
    boundary,
    violations: Object.freeze(violations)
  });
}
