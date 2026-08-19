export const DEFAULT_DISPLAY_OPTIONS = Object.freeze({
  leavesFirst: false,
  leavesOnly: true,
  mismatchesOnly: false,
  showSupportingMarkdown: false,
  showWorkspaceArtifacts: true,
  showAssets: false,
  schemaFilter: 'all',
  artifactFilter: 'all',
  sourceFilter: 'all'
});

export function normalizeWorkspaceDisplayOptions(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    leavesFirst: source.leavesFirst === true,
    leavesOnly: source.leavesOnly !== false,
    mismatchesOnly: source.mismatchesOnly === true,
    showSupportingMarkdown: source.showSupportingMarkdown === true ? true : DEFAULT_DISPLAY_OPTIONS.showSupportingMarkdown,
    showWorkspaceArtifacts: source.showWorkspaceArtifacts !== false ? DEFAULT_DISPLAY_OPTIONS.showWorkspaceArtifacts : false,
    showAssets: source.showAssets === true ? true : DEFAULT_DISPLAY_OPTIONS.showAssets,
    schemaFilter: normalizeDisplayFilterValue(source.schemaFilter),
    artifactFilter: normalizeDisplayFilterValue(source.artifactFilter),
    sourceFilter: normalizeDisplayFilterValue(source.sourceFilter)
  };
}

export function normalizeDisplayFilterValue(value) {
  const text = String(value || 'all').trim();
  return text || 'all';
}

export function lineageDisplayOptions(input = {}) {
  const normalized = normalizeWorkspaceDisplayOptions(input);
  return Object.assign({}, normalized, {
    leavesOnly: false,
    showSupportingMarkdown: true,
    showWorkspaceArtifacts: true,
    showAssets: true
  });
}

export function displayOptionsActiveConstraintCount(options = {}, scope = 'discovery') {
  const normalized = normalizeWorkspaceDisplayOptions(options);
  const lineageScope = String(scope || 'discovery') === 'lineage';
  const common = (normalized.mismatchesOnly ? 1 : 0)
    + (normalized.schemaFilter !== 'all' ? 1 : 0)
    + (normalized.artifactFilter !== 'all' ? 1 : 0)
    + (normalized.sourceFilter !== 'all' ? 1 : 0);
  if (lineageScope) return common;
  return common
    + (normalized.showAssets === false ? 1 : 0)
    + (normalized.showWorkspaceArtifacts === false ? 1 : 0)
    + (normalized.showSupportingMarkdown === false ? 1 : 0)
    + (normalized.leavesOnly ? 1 : 0);
}

export const displayOptionsHiddenCount = displayOptionsActiveConstraintCount;
