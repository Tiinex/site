export function projectUniverse(workspaces = []) {
  return {
    verse: 'universe',
    multiverse: 'column',
    panes: workspaces.map((workspace, index) => ({
      paneId: workspace.id || `workspace-${index + 1}`,
      workspaceId: workspace.id || `workspace-${index + 1}`,
      activeVerse: workspace.activeVerse || 'feed',
      sourceBoundary: workspace.sourceBoundary || 'preserve-per-pane'
    }))
  };
}
