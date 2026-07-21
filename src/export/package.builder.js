import { buildExportPackageContract } from './package.manifest.js';

export const EXPORT_PACKAGE_BUNDLE_SCHEMA_ID = 'tiinex.export.package.bundle.v1';
export const EXPORT_PACKAGE_BUILD_RECEIPT_SCHEMA_ID = 'tiinex.export.package.build.receipt.v1';

export function buildExportPackageBundle(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const contract = input.contract || buildExportPackageContract(workspace, Object.assign({}, input, { records, assets, workspaceCandidates }));
  const manifest = contract.manifest || {};
  const receipt = contract.receipt || {};
  const builtAt = typeof input.clock === 'function' ? input.clock() : (input.builtAt || new Date().toISOString());
  const allowBlocked = input.allowBlocked === true;
  const includeDegraded = input.includeDegraded !== false;
  const recordIndex = indexByIdAndPath(records);
  const assetIndex = indexByIdAndPath(assets);
  const candidateIndex = indexByIdAndPath(workspaceCandidates);
  const findings = [];
  const materialFiles = [];

  const blocked = manifest.status === 'blocked' && !allowBlocked;
  if (blocked) {
    findings.push(bundleFinding('error', 'export.package.bundle.blocked', 'Package bundle was not built because the manifest is blocked.', { packageId: manifest.packageId || '' }));
  } else if (manifest.status === 'degraded' && !includeDegraded) {
    findings.push(bundleFinding('error', 'export.package.bundle.degraded-disabled', 'Package bundle was not built because degraded package entries were not allowed.', { packageId: manifest.packageId || '' }));
  } else {
    materialFiles.push(...buildLocalDraftFiles(manifest.material?.localDrafts || [], recordIndex, findings));
    materialFiles.push(...buildSourceReferenceFiles(manifest.material?.sourceReferences || [], findings));
    materialFiles.push(...buildAssetFiles(manifest.material?.assets || [], assetIndex, findings));
    materialFiles.push(...buildWorkspaceCandidateFiles(manifest.material?.workspaceContextCandidates || [], candidateIndex, findings));
  }

  const buildReceipt = buildPackageBuildReceipt({ contract, manifest, receipt, builtAt, materialFiles, findings, blocked });
  const controlFiles = buildControlFiles({ contract, manifest, receipt, buildReceipt, findings });
  const files = uniqueFiles([...controlFiles, ...materialFiles], findings);
  const packageFingerprint = stableFingerprint(files.map((file) => ({ path: file.path, fingerprint: file.fingerprint, bytes: file.bytes })));
  const counts = Object.freeze({
    files: files.length,
    controlFiles: controlFiles.length,
    materialFiles: materialFiles.length,
    localDraftFiles: files.filter((file) => file.kind === 'artifact-markdown').length,
    sourceReferenceFiles: files.filter((file) => file.kind === 'source-reference').length,
    assetContentFiles: files.filter((file) => file.kind === 'asset-content').length,
    assetMetadataFiles: files.filter((file) => file.kind === 'asset-metadata').length,
    workspaceCandidateFiles: files.filter((file) => file.kind === 'workspace-candidate').length,
    blocked: manifest.counts?.blocked || 0,
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length,
    findings: findings.length
  });
  const status = counts.errors || blocked ? 'blocked' : (manifest.status === 'degraded' || counts.warnings ? 'degraded' : 'ready');

  return deepFreeze({
    schema: EXPORT_PACKAGE_BUNDLE_SCHEMA_ID,
    packageId: manifest.packageId || contract.receipt?.packageId || '',
    builtAt,
    status,
    boundary: 'In-memory package file map. It writes no zip, mutates no source, fetches no remote content, and preserves local/source/asset boundaries.',
    packageFingerprint,
    contract,
    manifest,
    receipt,
    buildReceipt,
    counts,
    files: Object.freeze(files),
    findings: Object.freeze(findings)
  });
}

export function inspectExportPackageBundle(bundle = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const paths = new Set();
  const findings = [];
  for (const file of files) {
    if (!file.path) findings.push(bundleFinding('error', 'export.package.bundle.file.path-missing', 'Package file is missing a path.', { kind: file.kind || '' }));
    if (file.path && paths.has(file.path)) findings.push(bundleFinding('error', 'export.package.bundle.file.path-duplicate', 'Package file path is duplicated.', { path: file.path }));
    paths.add(file.path);
    if (file.path && isUnsafePackagePath(file.path)) findings.push(bundleFinding('error', 'export.package.bundle.file.path-unsafe', 'Package file path is unsafe.', { path: file.path }));
    const content = stringifyContent(file.content);
    if ((file.bytes || 0) !== content.length) findings.push(bundleFinding('error', 'export.package.bundle.file.bytes-mismatch', 'Package file byte count does not match serialized content length.', { path: file.path || '' }));
    if (file.fingerprint && file.fingerprint !== stableFingerprint(content)) findings.push(bundleFinding('error', 'export.package.bundle.file.fingerprint-mismatch', 'Package file fingerprint does not match serialized content.', { path: file.path || '' }));
  }
  const hasManifest = files.some((file) => file.path === 'tiinex.package/manifest.json');
  const hasReceipt = files.some((file) => file.path === 'tiinex.package/receipt.json');
  const hasIndex = files.some((file) => file.path === 'tiinex.package/index.json');
  if (!hasManifest) findings.push(bundleFinding('error', 'export.package.bundle.manifest-missing', 'Package bundle is missing manifest control file.'));
  if (!hasReceipt) findings.push(bundleFinding('error', 'export.package.bundle.receipt-missing', 'Package bundle is missing receipt control file.'));
  if (!hasIndex) findings.push(bundleFinding('error', 'export.package.bundle.index-missing', 'Package bundle is missing package index control file.'));
  return Object.freeze({
    schema: 'tiinex.export.package.bundle.inspection.v1',
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid' : 'valid',
    counts: Object.freeze({ files: files.length, findings: findings.length, errors: findings.filter((finding) => finding.severity === 'error').length }),
    findings: Object.freeze(findings)
  });
}

function buildControlFiles({ contract, manifest, receipt, buildReceipt, findings }) {
  const index = {
    schema: 'tiinex.export.package.index.v1',
    packageId: manifest.packageId || '',
    status: manifest.status || 'unknown',
    boundary: 'Package index points to control documents and bundled material. It is generated from manifest data only.',
    manifestPath: 'tiinex.package/manifest.json',
    receiptPath: 'tiinex.package/receipt.json',
    buildReceiptPath: 'tiinex.package/build-receipt.json',
    contractPath: 'tiinex.package/contract.json',
    findingsPath: 'tiinex.package/findings.json',
    entries: flattenManifestEntries(manifest)
  };
  return [
    makeJsonFile('tiinex.package/index.json', 'package-index', index),
    makeJsonFile('tiinex.package/manifest.json', 'package-manifest', manifest),
    makeJsonFile('tiinex.package/receipt.json', 'package-receipt', receipt),
    makeJsonFile('tiinex.package/build-receipt.json', 'package-build-receipt', buildReceipt),
    makeJsonFile('tiinex.package/contract.json', 'package-contract', contract),
    makeJsonFile('tiinex.package/findings.json', 'package-findings', { schema: 'tiinex.export.package.findings.v1', findings })
  ];
}

function buildLocalDraftFiles(entries = [], recordIndex = new Map(), findings = []) {
  return entries.map((entry) => {
    const record = lookupEntry(recordIndex, entry) || {};
    const markdown = record.markdown || record.content || record.text || '';
    if (!markdown) findings.push(bundleFinding('error', 'export.package.bundle.local-draft.content-missing', 'Local draft manifest entry had no Markdown content to bundle.', { entryId: entry.id || '', path: entry.path || '' }));
    return makeTextFile(entry.packagePath || `artifacts/${normalizeRelativePath(entry.path || entry.id || 'draft.md')}`, 'artifact-markdown', markdown, {
      entryId: entry.id || '',
      title: entry.title || record.title || '',
      boundary: entry.boundary || 'Local draft Markdown bundled as local/session material.'
    });
  });
}

function buildSourceReferenceFiles(entries = [], findings = []) {
  return entries.map((entry) => {
    if (entry.status !== 'pinned-reference') {
      findings.push(bundleFinding('warning', 'export.package.bundle.source-reference.degraded', 'Source reference bundled without a pinned ref.', { entryId: entry.id || '', path: entry.path || '', repo: entry.repo || '' }));
    }
    const sourceReference = {
      schema: 'tiinex.export.package.source-reference.v1',
      id: entry.id || '',
      title: entry.title || '',
      status: entry.status || 'degraded-reference',
      boundary: entry.boundary || 'Source-backed material remains a reference.',
      target: entry.target || { adapterId: entry.adapterId || '', repo: entry.repo || '', ref: entry.ref || '', path: entry.path || '' }
    };
    return makeJsonFile(entry.packagePath || `sources/${normalizeRelativePath(entry.path || entry.id || 'source.source.json')}`, 'source-reference', sourceReference, { entryId: entry.id || '' });
  });
}

function buildAssetFiles(entries = [], assetIndex = new Map(), findings = []) {
  return entries.map((entry) => {
    const asset = lookupEntry(assetIndex, entry) || {};
    const content = asset.content || asset.dataUrl || asset.text || asset.bytes || '';
    if (entry.status === 'content-available' && content) {
      return makeTextFile(entry.packagePath || `assets/${normalizeRelativePath(entry.path || entry.id || 'asset')}`, 'asset-content', content, {
        entryId: entry.id || '',
        mediaType: entry.mediaType || asset.type || asset.mimeType || 'application/octet-stream',
        boundary: entry.boundary || asset.source?.boundary || 'Asset bundled as asset content, not a leaf.'
      });
    }
    findings.push(bundleFinding('warning', 'export.package.bundle.asset.metadata-only', 'Asset bundled as metadata-only descriptor because full content is unavailable.', { entryId: entry.id || '', path: entry.path || '' }));
    return makeJsonFile(`metadata/${normalizeRelativePath(entry.packagePath || `assets/${entry.path || entry.id || 'asset'}`)}.asset.json`, 'asset-metadata', {
      schema: 'tiinex.export.package.asset-metadata.v1',
      id: entry.id || '',
      title: entry.title || '',
      path: entry.path || '',
      mediaType: entry.mediaType || asset.type || asset.mimeType || '',
      status: 'metadata-only',
      boundary: entry.boundary || asset.source?.boundary || 'Metadata-only asset entry; content requires reselection or source access.'
    }, { entryId: entry.id || '' });
  });
}

function buildWorkspaceCandidateFiles(entries = [], candidateIndex = new Map(), findings = []) {
  return entries.map((entry) => {
    const candidate = lookupEntry(candidateIndex, entry) || {};
    findings.push(bundleFinding('info', 'export.package.bundle.workspace-candidate.descriptor', 'Workspace candidate bundled as descriptor only until explicit Open/Merge.', { entryId: entry.id || '', path: entry.path || '' }));
    return makeJsonFile(`context/${normalizeRelativePath(entry.packagePath || `workspace-candidates/${entry.path || entry.id || 'workspace.workspace.md'}`)}.json`, 'workspace-candidate', {
      schema: 'tiinex.export.package.workspace-candidate.v1',
      id: entry.id || '',
      title: entry.title || candidate.title || '',
      path: entry.path || candidate.path || '',
      status: entry.status || 'open-or-merge-required',
      boundary: entry.boundary || 'Workspace candidate remains context material until explicit Open/Merge.'
    }, { entryId: entry.id || '' });
  });
}

function buildPackageBuildReceipt({ contract, manifest, receipt, builtAt, materialFiles, findings, blocked }) {
  const status = blocked || findings.some((finding) => finding.severity === 'error') ? 'blocked' : (manifest.status === 'degraded' || findings.some((finding) => finding.severity === 'warning') ? 'degraded' : 'ready');
  return Object.freeze({
    schema: EXPORT_PACKAGE_BUILD_RECEIPT_SCHEMA_ID,
    packageId: manifest.packageId || receipt.packageId || '',
    at: builtAt,
    operation: 'export-package-file-map-built',
    state: status === 'blocked' ? 'blocked' : 'built-file-map',
    status,
    boundary: 'Build receipt records creation of an in-memory package file map only. No zip was written and no remote/source mutation occurred.',
    manifestFingerprint: manifest.integrity?.fingerprint || '',
    contractStatus: contract.status || manifest.status || 'unknown',
    counts: Object.freeze({ materialFiles: materialFiles.length, findings: findings.length, errors: findings.filter((finding) => finding.severity === 'error').length, warnings: findings.filter((finding) => finding.severity === 'warning').length }),
    findings: Object.freeze(findings.slice())
  });
}

function flattenManifestEntries(manifest = {}) {
  const material = manifest.material || {};
  return [
    ...(material.localDrafts || []),
    ...(material.sourceReferences || []),
    ...(material.assets || []),
    ...(material.workspaceContextCandidates || [])
  ].map((entry) => ({ id: entry.id || '', kind: entry.kind || '', path: entry.path || '', packagePath: entry.packagePath || '', status: entry.status || '' }));
}

function makeTextFile(path, kind, content, extra = {}) {
  const safePath = normalizeRelativePath(path);
  const text = String(content || '');
  return Object.freeze(Object.assign({
    path: safePath,
    kind,
    mediaType: extra.mediaType || (kind === 'artifact-markdown' ? 'text/markdown' : 'application/octet-stream'),
    bytes: text.length,
    fingerprint: stableFingerprint(text),
    content: text
  }, omit(extra, ['mediaType'])));
}

function makeJsonFile(path, kind, value, extra = {}) {
  const content = `${stablePrettyJson(value)}\n`;
  return Object.freeze(Object.assign({
    path: normalizeRelativePath(path),
    kind,
    mediaType: 'application/json',
    bytes: content.length,
    fingerprint: stableFingerprint(content),
    content
  }, extra));
}

function uniqueFiles(files = [], findings = []) {
  const seen = new Map();
  return files.map((file) => {
    if (!seen.has(file.path)) {
      seen.set(file.path, 0);
      return file;
    }
    const next = seen.get(file.path) + 1;
    seen.set(file.path, next);
    const renamedPath = addPathSuffix(file.path, `duplicate-${next}`);
    findings.push(bundleFinding('warning', 'export.package.bundle.path-deduped', 'Duplicate package file path was made unique.', { path: file.path, renamedPath }));
    return Object.freeze(Object.assign({}, file, { path: renamedPath }));
  });
}

function addPathSuffix(path, suffix) {
  const index = path.lastIndexOf('.');
  if (index <= 0 || path.includes('/') && index < path.lastIndexOf('/')) return `${path}.${suffix}`;
  return `${path.slice(0, index)}.${suffix}${path.slice(index)}`;
}

function indexByIdAndPath(items = []) {
  const index = new Map();
  for (const item of items) {
    for (const key of [item.id, item.path, item.title, item.name]) {
      if (key) index.set(String(key), item);
    }
  }
  return index;
}

function lookupEntry(index, entry = {}) {
  for (const key of [entry.id, entry.path, entry.title]) {
    if (key && index.has(String(key))) return index.get(String(key));
  }
  return null;
}

function normalizeRelativePath(path = '') {
  const input = String(path || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = [];
  for (const part of input.split('/')) {
    const clean = part.trim();
    if (!clean || clean === '.') continue;
    if (clean === '..') continue;
    parts.push(clean.replace(/[\u0000-\u001f<>:"|?*]/g, '_'));
  }
  return parts.join('/') || 'entry';
}

function isUnsafePackagePath(path = '') {
  return !path || path.startsWith('/') || path.includes('..') || /[\\\u0000-\u001f]/.test(path);
}

function stringifyContent(value) {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return '';
  return String(value);
}

function stableFingerprint(value) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `tixfp1-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function stablePrettyJson(value) {
  return JSON.stringify(sortForJson(value), null, 2);
}

function sortForJson(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortForJson);
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = sortForJson(value[key]);
  return out;
}

function omit(object = {}, keys = []) {
  const blocked = new Set(keys);
  const out = {};
  for (const [key, value] of Object.entries(object)) {
    if (!blocked.has(key)) out[key] = value;
  }
  return out;
}

function bundleFinding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}
