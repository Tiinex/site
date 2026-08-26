export function indexDirectWorkspaceSources(items = []) {
  const map = new Map();
  for (const item of items) {
    const key = String(item?.transportCorrelationKey || '');
    if (!key || String(item?.correlationStatus || '') !== 'qualified' || !item?.workspace) continue;
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

export function resolveDirectWorkspaceSource(index, correlationKey = '') {
  const items = index.get(String(correlationKey || '')) || [];
  return items.length === 1 ? items[0] : null;
}

export function indexUniqueArchiveBaselineFiles(files = [], findings = []) {
  const map = new Map();
  for (const file of files) {
    const path = String(file.path || '');
    const list = map.get(path) || [];
    list.push(file);
    map.set(path, list);
  }
  for (const [path, filesAtPath] of map) {
    if (filesAtPath.length > 1) findings.push(Object.freeze({
      severity: 'error',
      code: 'portable.handoff-v2.outer-file-map.duplicate-path',
      message: 'Baseline package contains duplicate outer paths; v2 refuses ambiguous byte selection.',
      path,
      count: filesAtPath.length
    }));
  }
  return map;
}
