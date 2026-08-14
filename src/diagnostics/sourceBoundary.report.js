export const SOURCE_BOUNDARY_REPORT_SCHEMA_ID = 'tiinex.sourceBoundary.report.v1';

export function buildSourceBoundaryReport(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const findings = [];

  for (const source of sources) inspectSourceRegistration(source, findings);
  for (const record of records) inspectRecordBoundary(record, findings);
  for (const asset of assets) inspectAssetBoundary(asset, findings);

  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const warnings = findings.filter((finding) => finding.severity === 'warning').length;
  const sourceBackedRecords = records.filter((record) => isSourceBacked(record.source)).length;
  const localRecords = records.length - sourceBackedRecords;
  const sourceBackedAssets = assets.filter((asset) => isSourceBacked(asset.source)).length;
  const localAssets = assets.length - sourceBackedAssets;
  const unpinnedGithubSources = sources.filter((source) => source?.adapterId === 'github' && !explicitRef(source)).length;

  return Object.freeze({
    schema: SOURCE_BOUNDARY_REPORT_SCHEMA_ID,
    workspaceId: workspace.id || '',
    status: errors ? 'blocked' : warnings ? 'degraded' : 'clean',
    boundary: 'Source-boundary diagnostics are loaded/session scoped. Local material must not acquire guessed GitHub provenance; source-backed material must disclose explicit source boundaries.',
    counts: Object.freeze({
      sources: sources.length,
      records: records.length,
      localRecords,
      sourceBackedRecords,
      assets: assets.length,
      localAssets,
      sourceBackedAssets,
      unpinnedGithubSources,
      errors,
      warnings,
      findings: findings.length
    }),
    findings: Object.freeze(findings)
  });
}

function inspectSourceRegistration(source = {}, findings = []) {
  const adapterId = String(source.adapterId || '').trim();
  const id = String(source.id || '').trim() || adapterId || 'source';
  if (!adapterId) {
    findings.push(finding('warning', 'source.adapter.missing', 'Source registration is missing adapter id.', { sourceId: id }));
    return;
  }
  if (adapterId === 'local') {
    if (source.repo || source.repository || source.permalink || source.config?.repo) {
      findings.push(finding('error', 'source.local.github-provenance-leak', 'Local source carries GitHub-like provenance fields.', { sourceId: id }));
    }
    return;
  }
  if (adapterId === 'github') {
    const repo = explicitRepo(source);
    if (!repo) findings.push(finding('error', 'source.github.repo.missing', 'GitHub source boundary must include an explicit repo.', { sourceId: id }));
    if (!explicitRef(source)) findings.push(finding('warning', 'source.github.ref.unpinned', 'GitHub source has no explicit/resolved ref; source links and re-ingest stay degraded until pinned.', { sourceId: id, repo }));
    return;
  }
  findings.push(finding('info', 'source.adapter.explicit-non-github', `Source uses explicit ${adapterId} adapter boundary.`, { sourceId: id }));
}

function inspectRecordBoundary(record = {}, findings = []) {
  const source = record.source || {};
  const id = record.id || record.path || record.title || 'record';
  const adapterId = String(source.adapterId || '').trim();
  const local = !isSourceBacked(source);
  if (local) {
    if (source.repo || source.repository || source.permalink || source.config?.repo) {
      findings.push(finding('error', 'record.local.github-provenance-leak', 'Local/session record carries GitHub provenance fields.', { recordId: id, path: record.path || '' }));
    }
    return;
  }
  if (adapterId === 'github') {
    if (!explicitRepo(source)) findings.push(finding('error', 'record.github.repo.missing', 'GitHub-backed record is missing repo boundary.', { recordId: id, path: record.path || '' }));
    if (!String(record.path || '').trim()) findings.push(finding('error', 'record.github.path.missing', 'GitHub-backed record is missing canonical path.', { recordId: id }));
    if (!explicitRef(source)) findings.push(finding('warning', 'record.github.ref.unpinned', 'GitHub-backed record has no explicit/resolved ref; source link/re-ingest is degraded.', { recordId: id, path: record.path || '' }));
    return;
  }
  findings.push(finding('info', 'record.source-backed.non-github', `Record uses explicit ${adapterId || 'external'} source boundary.`, { recordId: id, path: record.path || '' }));
}

function inspectAssetBoundary(asset = {}, findings = []) {
  const source = asset.source || {};
  const id = asset.id || asset.path || asset.name || 'asset';
  if (!isSourceBacked(source)) {
    if (source.repo || source.repository || source.permalink || source.config?.repo) {
      findings.push(finding('error', 'asset.local.github-provenance-leak', 'Local/session asset carries GitHub provenance fields.', { assetId: id, path: asset.path || '' }));
    }
  }
  if (asset.previewState === 'omitted-large' || asset.cacheState === 'preview-truncated-for-session-cache') {
    findings.push(finding('warning', 'asset.preview.omitted', 'Asset preview/content is not fully cached; export/publish must treat it as local-unavailable or metadata-only.', { assetId: id, path: asset.path || '' }));
  }
}

function finding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra));
}

export function isSourceBacked(source = {}) {
  return Boolean(source?.adapterId && source.adapterId !== 'local');
}

function explicitRepo(source = {}) {
  return String(source.repo || source.repository || source.config?.repo || '').trim();
}

function explicitRef(source = {}) {
  return String(source.ref || source.config?.ref || source.resolvedRef || source.commit || '').trim();
}
