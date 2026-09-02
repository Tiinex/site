export async function refreshPlaythingsRepositoryMaterial({ state = {}, addGitHubSource = null } = {}) {
  if (typeof addGitHubSource !== 'function') return Object.freeze({ state, attempted: 0 });
  let sourceState = state;
  const initialWorkspaces = Array.isArray(sourceState.workspaces) ? sourceState.workspaces.slice() : [];
  let attempted = 0;
  for (const workspace of initialWorkspaces) {
    const currentWorkspace = workspaceById(sourceState, workspace.id) || workspace;
    for (const source of Array.isArray(currentWorkspace.sources) ? currentWorkspace.sources : []) {
      const repository = sourceRepository(source);
      if (!repository || String(source.id || '').trim() === 'local') continue;
      const explicitFileRefs = Array.isArray(source.explicitFileRefs || source.config?.explicitFileRefs)
        ? Array.from(source.explicitFileRefs || source.config?.explicitFileRefs)
        : [];
      const repoDiscovery = source.repoDiscovery === true;
      const issueDiscovery = source.issueDiscovery === true;
      const issueUrls = source.issueUrls || source.config?.issueUrls || '';
      if (!repoDiscovery && !issueDiscovery && !issueUrls && !explicitFileRefs.length) continue;
      attempted += 1;
      const out = await addGitHubSource({
        sourceId: source.id || '',
        repository,
        ref: source.ref || source.config?.ref || '',
        rootPath: source.rootPath || source.config?.rootPath || '.topics',
        label: source.label || repository,
        repoDiscovery,
        issueDiscovery,
        issueUrls,
        explicitFileRefs,
        workspaceMatch: source.workspaceMatch || source.config?.workspaceMatch || '',
        preserveView: true,
        resetSourceMaterial: true,
        resetSourceCache: true
      }, { state: sourceState, workspaceId: workspace.id });
      if (out?.state) sourceState = out.state;
    }
  }
  return Object.freeze({ state: sourceState, attempted });
}

function workspaceById(state = {}, id = '') {
  return (Array.isArray(state.workspaces) ? state.workspaces : []).find((workspace) => String(workspace?.id || '') === String(id || '')) || null;
}

function sourceRepository(source = {}) {
  return String(source.repo || source.repository || source.config?.repo || source.config?.repository || '').trim();
}
