export function projectColumnVerse(workspaces = []) {
  return workspaces.map((workspace, index) => ({
    columnId: workspace.id || `column-${index + 1}`,
    workspace,
    width: workspace.width || 'auto'
  }));
}
