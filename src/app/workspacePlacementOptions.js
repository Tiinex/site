export const WORKSPACE_PLACEMENT_OPTIONS_SCHEMA_ID = 'tiinex.site.workspace-placement-options.v1';

export function workspacePlacementOptions(state = {}, workspaceId = '') {
  const id = token(workspaceId);
  const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
  const target = workspaces.find((workspace) => token(workspace?.id) === id);
  if (!target) return Object.freeze({ schema: WORKSPACE_PLACEMENT_OPTIONS_SCHEMA_ID, state: 'workspace-unavailable', options: Object.freeze([]) });
  const options = [];
  for (const workspace of workspaces) {
    const currentId = token(workspace?.id);
    for (const path of folderPathsForWorkspace(workspace)) {
      const sameWorkspace = currentId === id;
      options.push(Object.freeze({
        kind: 'folder', key: placementFolderSelectionKey(currentId, path), workspaceId: currentId, path,
        title: path === '.' ? `${workspace.name || workspace.title || currentId} root` : path,
        enabled: sameWorkspace,
        reason: sameWorkspace ? '' : 'cross-workspace-placement-authority-unavailable',
        boundary: sameWorkspace ? 'Same-workspace storage coordinate only; does not change Parent, Reference, or provenance.' : 'Cross-workspace placement requires semantic/lifecycle authority not present in the current canonical create command.'
      }));
    }
  }
  return Object.freeze({ schema: WORKSPACE_PLACEMENT_OPTIONS_SCHEMA_ID, state: 'qualified', workspaceId: id, options: Object.freeze(options), qualifiedOptions: Object.freeze(options.filter((item) => item.enabled)), unavailableOptions: Object.freeze(options.filter((item) => !item.enabled)), crossWorkspaceClassification: 'PLACEMENT AUTHORITY ESCALATION REQUIRED' });
}

export function folderPathsForWorkspace(workspace = {}) {
  const folders = new Set(['.topics']);
  for (const record of Array.isArray(workspace.records) ? workspace.records : []) {
    const path = canonicalPath(record?.path || '');
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) continue;
    let current = '';
    for (const part of parts.slice(0, -1)) { current = current ? `${current}/${part}` : part; folders.add(current); }
  }
  return Object.freeze([...folders].sort((a,b) => a.localeCompare(b)));
}

export function explicitPlacementPath(defaultPath = '', folder = '') {
  const path = canonicalPath(defaultPath), dir = canonicalFolder(folder);
  const name = path.split('/').filter(Boolean).at(-1) || '';
  if (!name || !dir) return '';
  return dir === '.' ? name : `${dir}/${name}`;
}
export function placementFolderSelectionKey(workspaceId = '', path = '') { return `placement-folder:${token(workspaceId)}:${canonicalFolder(path)}`; }
function canonicalPath(value = '') { return token(value).replace(/\\/g,'/').replace(/^\/+|\/+$/g,'').replace(/\/+/g,'/'); }
function canonicalFolder(value = '') { const v=canonicalPath(value); return v || '.'; }
function token(value = '') { return String(value || '').trim(); }
