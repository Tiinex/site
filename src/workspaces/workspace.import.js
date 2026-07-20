export function ensureWorkspaceForLocalMaterial(lifecycle, state, workspaceId = '', input = {}, options = {}) {
  const current = lifecycle?.cloneState?.(state) || state;
  const targetId = workspaceId || current?.activeWorkspaceId || '';
  const existing = targetId && Array.isArray(current?.workspaces)
    ? current.workspaces.find((item) => item.id === targetId)
    : null;
  if (existing) return { ok: true, created: false, workspace: existing, workspaceId: existing.id, state: current };

  const name = normalizeWorkspaceName(lifecycle, input.name || input.title || 'Local import');
  if (!name) return { ok: false, error: 'workspace.name.required', state };
  const created = lifecycle?.createWorkspace?.(current, { name }, options);
  if (!created?.ok) return created || { ok: false, error: 'workspace.create.failed', state };
  created.workspace.importLog = Array.isArray(created.workspace.importLog) ? created.workspace.importLog : [];
  created.workspace.importLog.unshift({
    kind: 'workspace-auto-created-for-local-import',
    title: name,
    at: typeof options.clock === 'function' ? options.clock() : new Date().toISOString()
  });
  return { ok: true, created: true, workspace: created.workspace, workspaceId: created.workspace.id, state: created.state };
}

function normalizeWorkspaceName(lifecycle, value) {
  if (typeof lifecycle?.normalizeWorkspaceName === 'function') return lifecycle.normalizeWorkspaceName(value);
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 72);
}
