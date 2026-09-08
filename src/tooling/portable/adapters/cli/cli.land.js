export async function land(flags, material, readOptionalJson, splitFlag) {
  const repositoriesValue = await readOptionalJson(flags.repositories || flags.repos);
  const selectionsValue = await readOptionalJson(flags.selections);
  return {
    input: {
      ...material,
      repositories: repositoriesValue.repositories || (Array.isArray(repositoriesValue) ? repositoriesValue : []),
      selections: selectionsValue.selections || selectionsValue || repositoriesValue.selections || {},
      workspaceIds: splitFlag(flags.workspaces || flags['workspace-ids'])
    },
    options: {}
  };
}
