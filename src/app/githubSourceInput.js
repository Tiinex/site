export function existingGithubSourceForInput(input = {}, sources = []) {
  const sourceId = String(input.sourceId || '').trim();
  if (!sourceId || !Array.isArray(sources)) return null;
  return sources.find((item) => String(item?.id || '') === sourceId) || null;
}

export function githubRequestedSurfaces(input = {}, fileRefs = []) {
  return {
    repoFiles: { requested: Boolean(input.repoDiscovery) },
    explicitFiles: { requested: Boolean(fileRefs.length), requestedCount: fileRefs.length },
    issueSnapshots: { requested: Boolean(input.issueDiscovery || input.issueUrls) }
  };
}

export function githubSourceFormState(input = {}, sources = [], normalizeRepository) {
  const repository = normalizeRepository(input.repository || input.repo || '');
  const existingSource = existingGithubSourceForInput(input, sources);
  return {
    repository,
    existingSource,
    sourceId: existingSource?.id || input.sourceId || undefined,
    rootPath: String(input.rootPath || input.root || existingSource?.rootPath || existingSource?.config?.rootPath || '.topics').trim() || '.topics',
    ref: String(input.ref || existingSource?.ref || existingSource?.config?.ref || '').trim(),
    label: input.label || existingSource?.label || repository
  };
}


export function mergeGithubSurfaceStates(previous = {}, next = {}, selectedKeys = []) {
  const keys = Array.isArray(selectedKeys) ? selectedKeys.filter(Boolean) : [];
  if (!keys.length) return Object.assign({}, next || {});
  const merged = JSON.parse(JSON.stringify(previous || {}));
  for (const key of keys) merged[key] = Object.assign({}, next?.[key] || {}, { transportRefreshTier: next?.[key]?.transportTier || next?.[key]?.transportRefreshTier || '' });
  for (const [key, value] of Object.entries(next || {})) {
    if (keys.includes(key)) continue;
    if (!merged[key] && value?.requested) merged[key] = Object.assign({}, value);
  }
  return merged;
}

export function mergeGithubRequestedSurfaces(previous = {}, next = {}, selectedKeys = []) {
  const keys = Array.isArray(selectedKeys) ? selectedKeys.filter(Boolean) : [];
  if (!keys.length) return Object.assign({}, next || {});
  const merged = JSON.parse(JSON.stringify(previous || {}));
  for (const key of keys) merged[key] = Object.assign({}, next?.[key] || {}, { requested: true });
  return merged;
}
