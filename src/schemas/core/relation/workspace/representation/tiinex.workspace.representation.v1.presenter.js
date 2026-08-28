export function workspaceRepresentationPresent(artifact = {}, context = {}) {
  return { title: artifact?.title || 'Workspace Representation', summary: artifact?.summary || 'Explicit Workspace-to-representation binding.', badges: ['concrete','tiinex.workspace.representation.v1'], disclosure: context.degraded ? 'degraded' : 'normal' };
}
