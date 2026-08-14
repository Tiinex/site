export const IMPORT_CONFLICT_SCHEMA_ID = 'tiinex.workspace.import.conflict.v1';
export const ImportConflictResolution = Object.freeze({
  SIBLING: 'sibling',
  REPLACE: 'replace',
  CANCEL: 'cancel'
});

export function detectLocalImportConflicts(workspace = {}, adapterResult = {}) {
  const incoming = importMaterialEntries(adapterResult);
  if (!incoming.length) return [];
  const existing = workspaceMaterialEntries(workspace);
  const existingByPath = new Map(existing.map((entry) => [canonicalPath(entry.path), entry]));
  const localTraceSlots = new Map();
  for (const entry of existing) {
    if (!isLocalMaterial(entry.material)) continue;
    const slot = traceDimensionSlot(entry.path);
    if (slot) localTraceSlots.set(slot, entry);
  }

  const conflicts = [];
  for (const entry of incoming) {
    const path = canonicalPath(entry.path);
    if (!path) continue;
    if (isTracePath(path)) {
      const slot = traceDimensionSlot(path);
      const existingSlot = slot ? localTraceSlots.get(slot) : null;
      if (existingSlot) {
        conflicts.push(conflict('trace-slot', entry, existingSlot));
        continue;
      }
    }
    const existingPath = existingByPath.get(path);
    if (existingPath && isLocalMaterial(existingPath.material)) conflicts.push(conflict('path', entry, existingPath));
  }
  return dedupeConflicts(conflicts);
}

export function resolveLocalImportConflicts(workspace = {}, adapterResult = {}, resolution = '') {
  const mode = String(resolution || '').trim().toLowerCase();
  const conflicts = detectLocalImportConflicts(workspace, adapterResult);
  if (!conflicts.length) return { ok: true, resolution: 'none', conflicts: [], adapterResult };
  if (mode === ImportConflictResolution.CANCEL) return { ok: false, cancelled: true, resolution: mode, conflicts, adapterResult: null };
  if (mode === ImportConflictResolution.REPLACE) return { ok: true, resolution: mode, conflicts, adapterResult };
  if (mode !== ImportConflictResolution.SIBLING) return { ok: false, requiresResolution: true, resolution: '', conflicts, adapterResult: null };

  const pathMap = buildSiblingPathMap(workspace, adapterResult, conflicts);
  return {
    ok: true,
    resolution: mode,
    conflicts,
    pathMap,
    adapterResult: remapAdapterResultPaths(adapterResult, pathMap)
  };
}

export function importConflictSummary(conflicts = []) {
  const trace = conflicts.filter((item) => item.type === 'trace-slot').length;
  const path = conflicts.filter((item) => item.type === 'path').length;
  const parts = [];
  if (trace) parts.push(`${trace} lineage slot conflict${trace === 1 ? '' : 's'}`);
  if (path) parts.push(`${path} file path conflict${path === 1 ? '' : 's'}`);
  return parts.join(' · ') || 'Import conflicts';
}

function importMaterialEntries(adapterResult = {}) {
  return [
    ...(adapterResult.records || []).map((material) => entryFor(material, 'record')),
    ...(adapterResult.workspaceEntries || []).map((material) => entryFor(material, 'workspace')),
    ...(adapterResult.assets || []).map((material) => entryFor(material, 'asset'))
  ].filter((entry) => entry.path);
}

function workspaceMaterialEntries(workspace = {}) {
  const out = [
    ...(workspace.records || []).map((material) => entryFor(material, 'record')),
    ...(workspace.assets || []).map((material) => entryFor(material, 'asset'))
  ];
  const workspacePath = workspace.workspaceImport?.path || '';
  if (workspacePath) out.push(entryFor({ path: workspacePath, source: workspace.source || { adapterId: 'local', kind: 'local-session' } }, 'workspace-root'));
  return out.filter((entry) => entry.path);
}

function entryFor(material = {}, kind = '') {
  return { path: canonicalPath(material.path || material.name || ''), kind, material };
}

function conflict(type, incoming, existing) {
  return Object.freeze({
    schema: IMPORT_CONFLICT_SCHEMA_ID,
    type,
    incoming: incoming.path,
    existing: existing.path,
    materialKind: incoming.kind,
    slot: type === 'trace-slot' ? traceDimensionSlot(incoming.path) : ''
  });
}

function dedupeConflicts(conflicts = []) {
  const seen = new Set();
  return conflicts.filter((item) => {
    const key = `${item.type}:${item.incoming}:${item.existing}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSiblingPathMap(workspace = {}, adapterResult = {}, conflicts = []) {
  const occupied = new Set(workspaceMaterialEntries(workspace).map((entry) => canonicalPath(entry.path)).filter(Boolean));
  const map = new Map();
  const incoming = importMaterialEntries(adapterResult);
  const traceConflicts = conflicts.filter((item) => item.type === 'trace-slot');

  for (const conflictItem of traceConflicts) {
    const oldDim = traceDimensionFromPath(conflictItem.incoming);
    const newDim = nextSiblingDimension(occupied, conflictItem.existing || conflictItem.incoming);
    if (!oldDim || !newDim || oldDim === newDim) continue;
    const incomingDir = dirname(conflictItem.incoming);
    for (const entry of incoming) {
      if (dirname(entry.path) !== incomingDir || !fileName(entry.path).startsWith(oldDim)) continue;
      const renamed = canonicalPath(joinPath(incomingDir, newDim + fileName(entry.path).slice(oldDim.length)));
      map.set(entry.path, renamed);
      occupied.add(renamed);
    }
  }

  for (const entry of incoming) {
    const current = map.get(entry.path) || entry.path;
    if (!occupied.has(current)) {
      occupied.add(current);
      continue;
    }
    if (isTracePath(current)) continue;
    const renamed = nextPathSibling(occupied, current);
    map.set(entry.path, renamed);
    occupied.add(renamed);
  }
  return map;
}

function remapAdapterResultPaths(adapterResult = {}, pathMap = new Map()) {
  const remap = (material = {}) => {
    const oldPath = canonicalPath(material.path || material.name || '');
    const path = pathMap.get(oldPath) || oldPath;
    if (!path || path === oldPath) return Object.assign({}, material);
    return Object.assign({}, material, { path, name: fileName(path), importConflictOriginalPath: oldPath, importConflictResolution: 'sibling' });
  };
  return Object.assign({}, adapterResult, {
    records: (adapterResult.records || []).map(remap),
    workspaceEntries: (adapterResult.workspaceEntries || []).map(remap),
    assets: (adapterResult.assets || []).map(remap),
    diagnostics: Object.assign({}, adapterResult.diagnostics || {}, { importConflictResolution: 'sibling', importSiblingRemapCount: pathMap.size })
  });
}

function isLocalMaterial(material = {}) {
  const source = material.source || {};
  const mode = String(material.sourceMode || '').toLowerCase();
  return source.adapterId === 'local' || source.kind === 'local-session' || source.kind === 'local' || mode.startsWith('local-') || mode.includes('archive') || mode.includes('manual') || mode.includes('drop') || mode.includes('roundtrip');
}

function traceDimensionFromPath(path = '') {
  const match = fileName(path).match(/^(\d{3}(?:-\d+)*)/u);
  return match ? match[1] : '';
}

function traceDimensionSlot(path = '') {
  const dim = traceDimensionFromPath(path);
  return dim ? `${dirname(path)}::${dim}` : '';
}

function nextSiblingDimension(occupiedPaths = new Set(), conflictingPath = '') {
  const dim = traceDimensionFromPath(conflictingPath);
  if (!dim) return '';
  const parts = dim.split('-').filter(Boolean);
  const current = Number(parts.pop() || 0);
  const parent = parts.join('-');
  let next = Math.max(current + 1, 1);
  const dir = dirname(conflictingPath);
  while ([...occupiedPaths].some((path) => dirname(path) === dir && traceDimensionFromPath(path) === formatDimension(parent, next))) next += 1;
  return formatDimension(parent, next);
}

function formatDimension(parent, index) { return parent ? `${parent}-${index}` : String(index).padStart(3, '0'); }
function nextPathSibling(occupied, path) {
  const dir = dirname(path);
  const name = fileName(path);
  const dot = name.lastIndexOf('.');
  const stem = dot >= 0 ? name.slice(0, dot) : name;
  const ext = dot >= 0 ? name.slice(dot) : '';
  let n = 2;
  let candidate = canonicalPath(joinPath(dir, `${stem}-sibling-${n}${ext}`));
  while (occupied.has(candidate)) { n += 1; candidate = canonicalPath(joinPath(dir, `${stem}-sibling-${n}${ext}`)); }
  return candidate;
}
function isTracePath(path = '') { return /\.trace\.md$/iu.test(path); }
function dirname(path = '') { const parts = canonicalPath(path).split('/'); parts.pop(); return parts.join('/'); }
function fileName(path = '') { return canonicalPath(path).split('/').filter(Boolean).pop() || ''; }
function joinPath(dir = '', name = '') { return [dir, name].filter(Boolean).join('/'); }
function canonicalPath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/').trim(); }
