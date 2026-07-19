export function projectWorkspaceToMap(workspace) {
  const records = workspace?.records || [];
  return {
    verse: 'map',
    context: 'workspace',
    workspaceId: workspace?.id || 'unknown-workspace',
    nodes: records.map((record, index) => ({
      id: record.id,
      label: record.label,
      sourceKind: record.source?.kind || 'unknown',
      x: 50 + Math.cos((Math.PI * 2 * index) / Math.max(records.length, 1)) * 32,
      y: 50 + Math.sin((Math.PI * 2 * index) / Math.max(records.length, 1)) * 32
    })),
    edges: [],
    truthMutation: false
  };
}
