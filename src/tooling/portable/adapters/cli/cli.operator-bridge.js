export async function prepareOperatorBridgeCliInput(command = '', material = {}, flags = {}, readOptionalJson = async () => ({})) {
  if (command === 'project-workspace-package-sources') {
    const repositories = await readOptionalJson(flags.repositories);
    return { input: { ...material, repositories: repositories.repositories || repositories }, options: {} };
  }
  if (command === 'project-handoff-authoring-plan') return { input: { ...material, parentPath: flags.parent || flags['parent-path'] || '', title: flags.title || '' }, options: {} };
  if (command === 'project-handoff-endpoints') return { input: { ...material, workspaceId: flags['workspace-id'] || flags.workspace || 'workspace' }, options: {} };
  if (command === 'project-operator-context') {
    const repositories = await readOptionalJson(flags.repositories);
    const workspaceRoots = await readOptionalJson(flags['workspace-roots'] || flags.roots);
    return { input: { ...material, repositories: repositories.repositories || repositories, workspaceRoots: workspaceRoots.workspaces || workspaceRoots.roots || workspaceRoots }, options: {} };
  }
  if (command === 'project-staged-validation') {
    const staged = await readOptionalJson(flags.staged || flags.paths);
    return { input: { ...material, stagedPaths: staged.stagedPaths || staged.paths || (Array.isArray(staged) ? staged : []) }, options: {} };
  }
  return null;
}
