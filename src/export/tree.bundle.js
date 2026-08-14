import { buildRecordLogicalPathMap, recordLogicalPathFromMap } from '../workspaces/workspace.recordPaths.js';
import { resolveTransportPlan } from '../sources/transport.levels.js';
import { isWorkspaceRecord } from '../actions/record.actions.js';
export const TREE_EXPORT_BUNDLE_SCHEMA_ID = 'tiinex.export.tree.bundle.v1';

export function buildWorkspaceTreeExportBundle(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const includeAssets = input.includeAssets !== false;
  const includeWorkspaceEntries = input.includeWorkspaceEntries !== false;
  const builtAt = typeof input.clock === 'function' ? input.clock() : (input.builtAt || new Date().toISOString());
  const transport = resolveTransportPlan(input.sourceConfig || workspace.sourceConfig || {}, 'local-download', { defaultLevel: 'TL0', allowFallback: false });
  const findings = [];
  const files = [];
  const recordPathMap = buildRecordLogicalPathMap(records);

  if (includeWorkspaceEntries) {
    for (const entry of collectWorkspaceTreeEntries(workspace, input, records)) {
      const file = treeFileForWorkspaceEntry(entry, findings);
      if (file) files.push(file);
    }
  }

  for (const record of records) {
    if (isWorkspaceRecord(record)) continue;
    const file = treeFileForRecord(record, findings, recordPathMap);
    if (file) files.push(file);
  }
  if (includeAssets) {
    for (const asset of assets) {
      const file = treeFileForAsset(asset, findings);
      if (file) files.push(file);
    }
  }

  const unique = uniqueFiles(files, findings);
  const counts = Object.freeze({
    files: unique.length,
    records: unique.filter((file) => file.kind === 'artifact-markdown').length,
    workspaceEntries: unique.filter((file) => file.kind === 'workspace-markdown').length,
    assets: unique.filter((file) => file.kind === 'asset-content').length,
    skippedRecords: findings.filter((finding) => finding.code === 'export.tree.record.content-missing').length,
    skippedAssets: findings.filter((finding) => finding.code === 'export.tree.asset.content-unavailable').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length,
    errors: findings.filter((finding) => finding.severity === 'error').length,
    findings: findings.length
  });
  const status = counts.errors ? 'blocked' : counts.warnings ? 'degraded' : 'ready';

  return deepFreeze({
    schema: TREE_EXPORT_BUNDLE_SCHEMA_ID,
    exportType: 'tree',
    transportLevel: transport.selectedLevel,
    builtAt,
    status,
    boundary: 'Ordinary local download tree export. File paths mirror the logical Tiinex tree; no package envelope, receipts, source mutation, remote fetch, or provenance inference is included.',
    packageEnvelope: false,
    sourceMutation: false,
    remoteFetch: false,
    transport,
    counts,
    files: unique,
    findings
  });
}

export function inspectTreeExportBundle(bundle = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const findings = [];
  if (bundle.schema !== TREE_EXPORT_BUNDLE_SCHEMA_ID) findings.push(treeFinding('error', 'export.tree.schema.invalid', 'Tree export bundle schema is invalid.'));
  if (bundle.packageEnvelope === true || files.some((file) => String(file.path || '').startsWith('tiinex.package/'))) {
    findings.push(treeFinding('error', 'export.tree.package-envelope.detected', 'Ordinary tree export must not contain package envelope control files.'));
  }
  const seen = new Set();
  for (const file of files) {
    const path = normalizeTreePath(file.path || '');
    if (!path) findings.push(treeFinding('error', 'export.tree.file.path-invalid', 'Tree export file has an invalid path.', { path: file.path || '' }));
    if (path && seen.has(path)) findings.push(treeFinding('error', 'export.tree.file.path-duplicate', 'Tree export file path is duplicated.', { path }));
    seen.add(path);
    if (isPackageEnvelopePath(path)) findings.push(treeFinding('error', 'export.tree.package-prefix.visible', 'Tree export path still contains a package envelope prefix.', { path }));
  }
  return Object.freeze({
    schema: 'tiinex.export.tree.bundle.inspection.v1',
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid' : findings.some((finding) => finding.severity === 'warning') ? 'degraded' : 'valid',
    counts: Object.freeze({ files: files.length, findings: findings.length, errors: findings.filter((finding) => finding.severity === 'error').length, warnings: findings.filter((finding) => finding.severity === 'warning').length }),
    findings: Object.freeze(findings)
  });
}


function collectWorkspaceTreeEntries(workspace = {}, input = {}, records = []) {
  const entries = [];
  const seen = new Set();
  const push = (entry = {}, role = 'workspace') => {
    const markdown = String(entry.markdown || entry.workspaceMarkdown || entry.content || '');
    if (!markdown) return;
    const path = normalizeWorkspaceEntryPath(entry.path || entry.logicalPath || entry.name || `${slugPart(entry.title || workspace.title || workspace.name || 'workspace')}.workspace.md`);
    if (!path) return;
    const key = path.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(Object.assign({}, entry, { path, markdown, workspaceEntryRole: role }));
  };

  if (input.workspaceEntry) push(input.workspaceEntry, input.workspaceEntry.workspaceEntryRole || 'current-workspace');
  const importPath = workspace.workspaceImport?.path || '';
  const importMarkdown = workspace.workspaceMarkdown || workspace.workspaceImport?.markdown || '';
  if (importPath || importMarkdown) push({ path: importPath, markdown: importMarkdown, title: workspace.title || workspace.name || '' }, 'current-workspace');
  for (const record of Array.isArray(records) ? records : []) {
    if (!isWorkspaceRecord(record)) continue;
    push({ path: record.path || record.sourcePath || '', markdown: record.markdown || record.content || '', title: record.title || '', id: record.id || '', source: record.source || {}, boundary: record.boundary || '' }, 'workspace-artifact-record');
  }
  for (const entry of Array.isArray(workspace.workspaceMergedEntries) ? workspace.workspaceMergedEntries : []) push(entry, 'merged-workspace');
  // Compatibility-only: old checkpoints/packages may still contain candidate objects.
  for (const entry of Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []) push(entry, 'legacy-workspace-candidate');
  return entries;
}

function treeFileForWorkspaceEntry(entry = {}, findings = []) {
  const path = normalizeWorkspaceEntryPath(entry.path || entry.name || 'workspace.workspace.md');
  const content = String(entry.markdown || entry.workspaceMarkdown || entry.content || '');
  if (!path) {
    findings.push(treeFinding('error', 'export.tree.workspace.path-missing', 'Workspace entry cannot be exported without a safe logical path.', { workspaceEntryId: entry.id || '' }));
    return null;
  }
  if (isPackageEnvelopePath(path)) {
    findings.push(treeFinding('error', 'export.tree.workspace.package-path-refused', 'Workspace entry resolved to a package envelope path; ordinary tree export requires logical workspace paths.', { workspaceEntryId: entry.id || '', path }));
    return null;
  }
  if (!content) {
    findings.push(treeFinding('warning', 'export.tree.workspace.content-missing', 'Workspace entry has no loaded Markdown content and was omitted from the ordinary tree export.', { workspaceEntryId: entry.id || '', path }));
    return null;
  }
  return makeTextFile(path, 'workspace-markdown', content, {
    workspaceEntryId: entry.id || '',
    title: entry.title || '',
    sourceBoundary: entry.source?.boundary || entry.boundary || '',
    presentationPath: path,
    workspaceEntryRole: entry.workspaceEntryRole || 'workspace'
  });
}

function normalizeWorkspaceEntryPath(path = '') {
  const clean = normalizeTreePath(path || 'workspace.workspace.md');
  if (!clean) return '';
  if (/\.workspace\.md$/i.test(clean)) return clean;
  return clean.replace(/(?:\.md|\.markdown)?$/i, '.workspace.md');
}

function treeFileForRecord(record = {}, findings = [], recordPathMap = null) {
  const logicalPath = recordLogicalPathFromMap(record, recordPathMap);
  const path = normalizeTreePath(logicalPath || record.name || record.title || 'artifact.md');
  const content = String(record.markdown || record.content || record.text || '');
  if (!path) {
    findings.push(treeFinding('error', 'export.tree.record.path-missing', 'Record cannot be exported without a safe logical path.', { recordId: record.id || '' }));
    return null;
  }
  if (isPackageEnvelopePath(path)) {
    findings.push(treeFinding('error', 'export.tree.record.package-path-refused', 'Record resolved to a package envelope path; ordinary tree export requires logical material paths.', { recordId: record.id || '', path, logicalPath }));
    return null;
  }
  if (!content) {
    findings.push(treeFinding('warning', 'export.tree.record.content-missing', 'Record has no loaded Markdown content and was omitted from the ordinary tree export.', { recordId: record.id || '', path }));
    return null;
  }
  return makeTextFile(path, 'artifact-markdown', content, {
    recordId: record.id || '',
    title: record.title || '',
    sourceBoundary: record.source?.boundary || record.boundary || '',
    provenancePath: record.sourcePath || record.sourceTarget?.sourceArtifactPath || record.snapshot?.sourceArtifactPath || '',
    presentationPath: path,
    logicalPath
  });
}

function treeFileForAsset(asset = {}, findings = []) {
  const path = normalizeTreePath(asset.path || asset.name || 'asset');
  const content = typeof asset.content === 'string' && asset.content
    ? asset.content
    : typeof asset.dataUrl === 'string' && asset.dataUrl
      ? asset.dataUrl
      : typeof asset.text === 'string'
        ? asset.text
        : '';
  if (!path) {
    findings.push(treeFinding('error', 'export.tree.asset.path-missing', 'Asset cannot be exported without a safe logical path.', { assetId: asset.id || '' }));
    return null;
  }
  if (!content) {
    findings.push(treeFinding('warning', 'export.tree.asset.content-unavailable', 'Asset content was unavailable and was omitted from the ordinary tree export.', { assetId: asset.id || '', path }));
    return null;
  }
  return makeTextFile(path, 'asset-content', content, {
    assetId: asset.id || '',
    title: asset.title || asset.name || '',
    mediaType: asset.type || asset.mediaType || asset.mimeType || 'application/octet-stream',
    presentationPath: path
  });
}

function makeTextFile(path, kind, content, extra = {}) {
  const text = String(content || '');
  return Object.freeze(Object.assign({
    path: normalizeTreePath(path),
    kind,
    mediaType: extra.mediaType || (kind === 'artifact-markdown' ? 'text/markdown' : 'application/octet-stream'),
    bytes: text.length,
    content: text
  }, omit(extra, ['mediaType'])));
}

function uniqueFiles(files = [], findings = []) {
  const seen = new Map();
  return files.map((file) => {
    const path = normalizeTreePath(file.path || '');
    if (!seen.has(path)) {
      seen.set(path, 0);
      return file;
    }
    const next = seen.get(path) + 1;
    seen.set(path, next);
    const renamedPath = addPathSuffix(path, `duplicate-${next}`);
    findings.push(treeFinding('warning', 'export.tree.path-deduped', 'Duplicate tree export path was made unique.', { path, renamedPath }));
    return Object.freeze(Object.assign({}, file, { path: renamedPath, presentationPath: renamedPath }));
  });
}

function addPathSuffix(path, suffix) {
  const slash = path.lastIndexOf('/');
  const dot = path.lastIndexOf('.');
  if (dot <= slash) return `${path}.${suffix}`;
  return `${path.slice(0, dot)}.${suffix}${path.slice(dot)}`;
}

export function normalizeTreePath(path = '') {
  const input = String(path || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = [];
  for (const part of input.split('/')) {
    const clean = part.trim();
    if (!clean || clean === '.') continue;
    if (clean === '..') continue;
    parts.push(clean.replace(/[\u0000-\u001f<>:"|?*]/g, '_'));
  }
  const output = parts.join('/');
  if (!output) return '';
  if (/\.(?:md|markdown|trace\.md|schema\.md|validator\.md|workspace\.md)$/i.test(output)) return output;
  const leaf = output.split('/').filter(Boolean).pop() || '';
  return leaf.includes('.') ? output : `${output}.md`;
}

function slugPart(value = '') {
  return String(value || 'workspace').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'workspace';
}

function isPackageEnvelopePath(path = '') {
  const clean = String(path || '').replace(/\\/g, '/').replace(/^\/+/, '');
  return clean === 'artifacts' || clean.startsWith('artifacts/')
    || clean === 'tiinex.package' || clean.startsWith('tiinex.package/')
    || clean === 'workspace-candidates' || clean.startsWith('workspace-candidates/');
}

function omit(value = {}, keys = []) {
  const remove = new Set(keys);
  const out = {};
  for (const [key, item] of Object.entries(value || {})) if (!remove.has(key)) out[key] = item;
  return out;
}

function treeFinding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}
