export const WorkspaceMode = Object.freeze({ local: 'file-local', sourceBacked: 'source-backed', mixed: 'mixed' });

export function createWorkspace({ id, name, mode = WorkspaceMode.local } = {}) {
  return { id: id || 'local-workspace', name: name || 'Local workspace', mode, records: [], activeId: '' };
}
