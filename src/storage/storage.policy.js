export const STORAGE_POLICY_SCHEMA_ID = 'tiinex.storage.policy.v1';

export const DefaultStoragePolicyLimits = Object.freeze({
  maxRecordMarkdownChars: 160000,
  maxAssetPreviewChars: 160000,
  maxWorkspaceMarkdownChars: 160000,
  maxImportLogEntries: 25
});

export function classifyRecordPersistence(record = {}, limits = DefaultStoragePolicyLimits) {
  const markdown = String(record.markdown || '');
  const local = isLocalRecord(record);
  const sourceBacked = isSourceBacked(record);
  if (sourceBacked && !local) return decision('record', 'metadata-only', false, 'source-backed-record-not-session-cache-authority', 0, markdown.length);
  if (!markdown) return decision('record', 'metadata-only', false, 'no-markdown-content', 0, 0);
  const limit = Number(limits.maxRecordMarkdownChars || 0);
  if (limit > 0 && markdown.length > limit) return decision('record', 'truncated', true, 'record-markdown-truncated-for-session-cache', limit, markdown.length);
  return decision('record', 'full', true, 'local-record-session-cache', markdown.length, markdown.length);
}

export function classifyAssetPersistence(asset = {}, limits = DefaultStoragePolicyLimits) {
  const contentLength = String(asset.content || '').length;
  const dataUrlLength = String(asset.dataUrl || '').length;
  const previewLength = Math.max(contentLength, dataUrlLength);
  const sourceBacked = isSourceBacked(asset);
  if (sourceBacked) return decision('asset', 'metadata-only', false, 'source-backed-asset-reference', 0, previewLength);
  if (!previewLength) return decision('asset', 'metadata-only', false, 'asset-metadata-only', 0, 0);
  const limit = Number(limits.maxAssetPreviewChars || 0);
  if (limit > 0 && previewLength > limit) return decision('asset', 'truncated', true, 'asset-preview-truncated-for-session-cache', limit, previewLength);
  return decision('asset', 'full', true, 'local-asset-session-cache', previewLength, previewLength);
}

export function classifyWorkspaceCandidatePersistence(candidate = {}, limits = DefaultStoragePolicyLimits) {
  const markdown = String(candidate.markdown || '');
  if (!markdown) return decision('workspace-candidate', 'metadata-only', false, 'workspace-candidate-metadata-only', 0, 0);
  const limit = Number(limits.maxWorkspaceMarkdownChars || 0);
  if (limit > 0 && markdown.length > limit) return decision('workspace-candidate', 'truncated', true, 'workspace-markdown-truncated-for-session-cache', limit, markdown.length);
  return decision('workspace-candidate', 'full', true, 'workspace-candidate-session-cache', markdown.length, markdown.length);
}

export function summarizeStoragePolicy(workspace = {}, limits = DefaultStoragePolicyLimits) {
  const records = (workspace.records || []).map((record) => classifyRecordPersistence(record, limits));
  const assets = (workspace.assets || []).map((asset) => classifyAssetPersistence(asset, limits));
  const workspaceCandidates = (workspace.workspaceMergeCandidates || []).map((candidate) => classifyWorkspaceCandidatePersistence(candidate, limits));
  const all = [...records, ...assets, ...workspaceCandidates];
  return Object.freeze({
    schema: STORAGE_POLICY_SCHEMA_ID,
    workspaceId: workspace.id || '',
    counts: Object.freeze({
      records: records.length,
      assets: assets.length,
      workspaceCandidates: workspaceCandidates.length,
      full: all.filter((item) => item.persistence === 'full').length,
      truncated: all.filter((item) => item.persistence === 'truncated').length,
      metadataOnly: all.filter((item) => item.persistence === 'metadata-only').length,
      persistedBytes: all.reduce((sum, item) => sum + item.persistedBytes, 0),
      originalBytes: all.reduce((sum, item) => sum + item.originalBytes, 0)
    }),
    records: Object.freeze(records),
    assets: Object.freeze(assets),
    workspaceCandidates: Object.freeze(workspaceCandidates)
  });
}

function isLocalRecord(record = {}) {
  const source = record.source || {};
  const mode = String(record.sourceMode || '').toLowerCase();
  return source.adapterId === 'local' || source.kind === 'local-session' || mode.startsWith('local-') || mode.includes('fixture');
}

function isSourceBacked(item = {}) {
  const source = item.source || {};
  const mode = String(item.sourceMode || '').toLowerCase();
  return source.adapterId === 'github' || source.kind === 'github-tree' || source.sourceKind === 'github.repo' || mode === 'source-backed';
}

function decision(kind, persistence, persistContent, reason, persistedBytes, originalBytes) {
  return Object.freeze({ kind, persistence, persistContent, reason, persistedBytes, originalBytes });
}
