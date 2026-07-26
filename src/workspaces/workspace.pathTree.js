import { inferRecordMaterialRole, MaterialRole } from './workspace.materialRole.js';
import { recordLogicalPath, normalizeWorkspacePath } from './workspace.recordPaths.js';

const ITEM_TYPE_ORDER = { record: 0, workspace: 1, asset: 2 };

export function normalizeTreePath(value = '') {
  return normalizeWorkspacePath(value);
}

export function buildWorkspacePathTree(input = {}) {
  const records = Array.isArray(input.records) ? input.records : [];
  const assets = Array.isArray(input.assets) ? input.assets : [];
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : [];
  const query = String(input.query || '').trim();
  const root = makeFolderNode('', '', 0);

  for (const record of records) {
    addItem(root, makeTreeItem('record', record));
  }
  for (const candidate of workspaceCandidates) {
    addItem(root, makeTreeItem('workspace', candidate));
  }
  for (const asset of assets) {
    addItem(root, makeTreeItem('asset', asset));
  }

  finalizeFolder(root);
  return {
    schema: 'tiinex.workspace.pathTree.v1',
    rootLabel: input.rootLabel || 'Root',
    query,
    counts: root.counts,
    folders: root.folders,
    items: root.items,
    empty: !root.folders.length && !root.items.length
  };
}

function makeTreeItem(type, source = {}) {
  const path = normalizeTreePath(type === 'record' ? recordLogicalPath(source) : (source.path || source.name || source.title || type));
  const fallbackName = type === 'workspace' ? 'Workspace candidate' : type === 'asset' ? 'Asset' : 'Artifact';
  const name = basename(path) || source.title || source.name || fallbackName;
  return {
    type,
    id: source.id || `${type}:${path || name}`,
    path,
    name,
    title: source.title || source.name || name,
    kind: source.kind || source.schema || source.type || type,
    previewState: source.previewState || '',
    materialRole: type === 'record' ? inferRecordMaterialRole(source) : type === 'asset' ? MaterialRole.asset : type === 'workspace' ? MaterialRole.workspaceCandidate : '',
    source
  };
}

function addItem(root, item) {
  const path = item.path || item.name;
  const parts = normalizeTreePath(path).split('/').filter(Boolean);
  const fileName = parts.pop() || item.name || item.title;
  let folder = root;
  for (const segment of parts) {
    folder = ensureFolder(folder, segment);
  }
  folder.items.push(Object.assign({}, item, { name: fileName || item.name }));
}

function ensureFolder(parent, name) {
  const cleanName = String(name || '').trim() || 'folder';
  let folder = parent._folderMap.get(cleanName);
  if (!folder) {
    const path = parent.path ? `${parent.path}/${cleanName}` : cleanName;
    folder = makeFolderNode(cleanName, path, parent.depth + 1);
    parent._folderMap.set(cleanName, folder);
    parent.folders.push(folder);
  }
  return folder;
}

function makeFolderNode(name, path, depth) {
  return {
    type: 'folder',
    name,
    path,
    depth,
    folders: [],
    items: [],
    counts: { records: 0, leaves: 0, supporting: 0, schemaDefinitions: 0, assets: 0, workspaceCandidates: 0, total: 0 },
    _folderMap: new Map()
  };
}

function finalizeFolder(folder) {
  const counts = { records: 0, leaves: 0, supporting: 0, schemaDefinitions: 0, assets: 0, workspaceCandidates: 0, total: 0 };
  for (const child of folder.folders) {
    finalizeFolder(child);
    counts.records += child.counts.records;
    counts.assets += child.counts.assets;
    counts.leaves += child.counts.leaves || 0;
    counts.supporting += child.counts.supporting || 0;
    counts.schemaDefinitions += child.counts.schemaDefinitions || 0;
    counts.workspaceCandidates += child.counts.workspaceCandidates;
    counts.total += child.counts.total;
  }
  for (const item of folder.items) {
    if (item.type === 'asset') counts.assets += 1;
    else if (item.type === 'workspace') counts.workspaceCandidates += 1;
    else {
      counts.records += 1;
      const role = item.materialRole || inferRecordMaterialRole(item.source || {});
      if (role === MaterialRole.leaf) counts.leaves += 1;
      else if (role === MaterialRole.schemaDefinition) counts.schemaDefinitions += 1;
      else counts.supporting += 1;
    }
    counts.total += 1;
  }
  folder.counts = counts;
  folder.folders.sort(compareFolders);
  folder.items.sort(compareItems);
  delete folder._folderMap;
}

function compareFolders(a, b) {
  return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' });
}

function compareItems(a, b) {
  const typeDelta = (ITEM_TYPE_ORDER[a.type] ?? 9) - (ITEM_TYPE_ORDER[b.type] ?? 9);
  if (typeDelta) return typeDelta;
  return String(a.name || a.title || '').localeCompare(String(b.name || b.title || ''), undefined, { numeric: true, sensitivity: 'base' });
}

function basename(path = '') {
  const parts = String(path || '').split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}
