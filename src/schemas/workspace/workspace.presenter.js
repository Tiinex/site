export function workspacePresent(workspace = {}, context = {}) {
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const explicitSources = sources.filter((source) => source.id !== 'local');
  return {
    schemaId: 'tiinex.workspace.v1',
    title: workspace.title || workspace.name || 'Workspace',
    subtitle: workspace.source?.boundary || 'Browser-local session state; no source files or GitHub provenance inferred.',
    sourceCount: sources.length,
    explicitSourceCount: explicitSources.length,
    recordCount: records.length,
    activeVerse: context.verse || workspace.mode || 'feed',
    query: context.query || '',
    localBoundary: 'browser-local session state; no source files or GitHub provenance inferred',
    sourceBoundary: explicitSources.length
      ? 'explicit source is visible but not evidence, preservation, or proof until material is loaded and promoted'
      : 'local/session material stays local until an explicit source is attached'
  };
}

export function presentWorkspaceFeed(workspace = {}, context = {}) {
  return workspacePresent(workspace, { ...context, verse: 'feed' });
}

export function presentWorkspaceTree(workspace = {}, context = {}) {
  return workspacePresent(workspace, { ...context, verse: 'tree' });
}
