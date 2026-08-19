import { buildExportPackageContract, buildExportPackageReceipt, finalizeExportPackageManifestPaths } from './package.manifest.js';
import { packageAssetBytes, packageFileBytes, sha256Hex, stableFingerprintBytes, utf8Bytes } from './package.bytes.js';
import { assignFinalPackagePaths, buildExportPackageFileMap, EXPORT_PACKAGE_FILE_MAP_PATH, finalizeFile, inspectExportPackageFileMap } from './package.fileMap.js';
import { workspaceContextOwnedMarkdown } from './package.workspaceContext.js';
import { inspectExportPackageControlConsistency, packageMaterialRepresentationSha256 } from './package.controlIntegrity.js';
import { buildExportPackageControlIndex, EXPORT_PACKAGE_CONTROL_PATHS, inspectExportPackageControlTopology } from './package.controlTopology.js';

export const EXPORT_PACKAGE_BUNDLE_SCHEMA_ID = 'tiinex.export.package.bundle.v1';
export const EXPORT_PACKAGE_BUILD_RECEIPT_SCHEMA_ID = 'tiinex.export.package.build.receipt.v1';

export function buildExportPackageBundle(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const initialContract = input.contract || buildExportPackageContract(workspace, Object.assign({}, input, { records, assets, workspaceCandidates }));
  const initialManifest = initialContract.manifest || {};
  const builtAt = typeof input.clock === 'function' ? input.clock() : (input.builtAt || new Date().toISOString());
  const allowBlocked = input.allowBlocked === true;
  const includeDegraded = input.includeDegraded !== false;
  const recordIndex = indexByIdAndPath(records);
  const assetIndex = indexByIdAndPath(assets);
  const candidateIndex = indexByIdAndPath(workspaceCandidates);
  const findings = [];
  const materialFiles = [];

  const blocked = initialManifest.status === 'blocked' && !allowBlocked;
  if (blocked) {
    findings.push(bundleFinding('error', 'export.package.bundle.blocked', 'Package bundle was not built because the manifest is blocked.', { packageId: initialManifest.packageId || '' }));
  } else if (initialManifest.status === 'degraded' && !includeDegraded) {
    findings.push(bundleFinding('error', 'export.package.bundle.degraded-disabled', 'Package bundle was not built because degraded package entries were not allowed.', { packageId: initialManifest.packageId || '' }));
  } else {
    materialFiles.push(...buildLocalDraftFiles(initialManifest.material?.localDrafts || [], recordIndex, findings));
    materialFiles.push(...buildSourceReferenceFiles(initialManifest.material?.sourceReferences || [], findings));
    materialFiles.push(...buildAssetFiles(initialManifest.material?.assets || [], assetIndex, findings));
    materialFiles.push(...buildWorkspaceCandidateFiles(initialManifest.material?.workspaceContextCandidates || [], candidateIndex, findings));
    materialFiles.push(...buildWorkspaceContextFiles(initialManifest.material?.workspaceContext || {}, workspace, findings));
  }

  const finalMaterialFiles = assignFinalPackagePaths(materialFiles, findings);
  const manifest = finalizeExportPackageManifestPaths(initialManifest, finalMaterialFiles);
  const receipt = buildExportPackageReceipt(manifest, input);
  const contract = deepFreeze({ ...initialContract, status: manifest.status || initialContract.status || 'unknown', manifest, receipt });
  const buildReceipt = buildPackageBuildReceipt({ contract, manifest, receipt, builtAt, materialFiles: finalMaterialFiles, findings, blocked });
  const controlFiles = buildControlFiles({ contract, manifest, receipt, buildReceipt, findings });
  const governedFiles = assignFinalPackagePaths([...controlFiles, ...finalMaterialFiles], findings).map(finalizeFile);
  const fileMap = buildExportPackageFileMap(governedFiles, { packageId: manifest.packageId || '' });
  const fileMapFile = makeJsonFile(EXPORT_PACKAGE_FILE_MAP_PATH, 'package-file-map', fileMap);
  const files = Object.freeze([...governedFiles, fileMapFile]);
  const packageFingerprint = stableFingerprint(files.map((file) => ({ path: file.path, fingerprint: file.fingerprint, bytes: file.bytes })));
  const counts = Object.freeze({
    files: files.length,
    controlFiles: files.filter((file) => file.path.startsWith('tiinex.package/')).length,
    materialFiles: finalMaterialFiles.length,
    localDraftFiles: files.filter((file) => file.kind === 'artifact-markdown').length,
    sourceReferenceFiles: files.filter((file) => file.kind === 'source-reference').length,
    assetContentFiles: files.filter((file) => file.kind === 'asset-content').length,
    assetReferenceFiles: files.filter((file) => file.kind === 'asset-source-reference').length,
    assetMetadataFiles: files.filter((file) => file.kind === 'asset-metadata').length,
    workspaceCandidateFiles: files.filter((file) => file.kind === 'workspace-candidate').length,
    workspaceContextFiles: files.filter((file) => file.kind === 'workspace-context' || file.kind === 'workspace-context-markdown').length,
    blocked: manifest.counts?.blocked || 0,
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length,
    findings: findings.length
  });
  const status = counts.errors || blocked ? 'blocked' : (manifest.status === 'degraded' || counts.warnings ? 'degraded' : 'ready');

  return deepFreeze({
    schema: EXPORT_PACKAGE_BUNDLE_SCHEMA_ID,
    packageId: manifest.packageId || receipt.packageId || '',
    builtAt,
    status,
    boundary: 'Platform-neutral package representation with durable serialized file-map authority. It writes no zip by itself, mutates no source, fetches no remote content, and preserves local/source/asset/workspace-context boundaries.',
    packageFingerprint,
    packageRepresentationSha256: fileMap.representationSha256,
    contract,
    manifest,
    receipt,
    buildReceipt,
    fileMap,
    counts,
    files,
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
    const data = packageFileBytes(file);
    if (Number(file.bytes || 0) !== data.byteLength) findings.push(bundleFinding('error', 'export.package.bundle.file.bytes-mismatch', 'Package file byte count does not match exact serialized bytes.', { path: file.path || '' }));
    if (file.sha256 && file.sha256 !== sha256Hex(data)) findings.push(bundleFinding('error', 'export.package.bundle.file.sha256-mismatch', 'Package file SHA-256 does not match exact serialized bytes.', { path: file.path || '' }));
    if (file.fingerprint && file.fingerprint !== stableFingerprintBytes(data)) findings.push(bundleFinding('error', 'export.package.bundle.file.fingerprint-mismatch', 'Package file compatibility fingerprint does not match exact serialized bytes.', { path: file.path || '' }));
  }
  const controlTopology = inspectExportPackageControlTopology(files);
  findings.push(...controlTopology.findings);
  findings.push(...inspectExportPackageControlConsistency(files, { controls: controlTopology.controls, topologyChecked: true }));

  const fileMapFile = files.find((file) => file.path === EXPORT_PACKAGE_CONTROL_PATHS.fileMap);
  const fileMap = controlTopology.controls.fileMap || parseJsonFile(fileMapFile) || bundle.fileMap || null;
  if (!fileMap) {
    findings.push(bundleFinding('error', 'export.package.bundle.file-map-unreadable', 'Package bundle is missing a readable durable file map.'));
  } else {
    const manifestFile = files.find((file) => file.path === EXPORT_PACKAGE_CONTROL_PATHS.manifest);
    const manifest = controlTopology.controls.manifest || parseJsonFile(manifestFile) || bundle.manifest || {};
    const fileMapInspection = inspectExportPackageFileMap(fileMap, files, manifest);
    findings.push(...fileMapInspection.findings);
  }
  return Object.freeze({
    schema: 'tiinex.export.package.bundle.inspection.v2',
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid' : 'valid',
    counts: Object.freeze({ files: files.length, findings: findings.length, errors: findings.filter((finding) => finding.severity === 'error').length }),
    findings: Object.freeze(findings)
  });
}

function buildControlFiles({ contract, manifest, receipt, buildReceipt, findings }) {
  const index = buildExportPackageControlIndex({
    packageId: manifest.packageId || '',
    status: manifest.status || 'unknown',
    entries: flattenManifestEntries(manifest)
  });
  return [
    makeJsonFile(EXPORT_PACKAGE_CONTROL_PATHS.index, 'package-index', index),
    makeJsonFile(EXPORT_PACKAGE_CONTROL_PATHS.manifest, 'package-manifest', manifest),
    makeJsonFile(EXPORT_PACKAGE_CONTROL_PATHS.receipt, 'package-receipt', receipt),
    makeJsonFile(EXPORT_PACKAGE_CONTROL_PATHS.buildReceipt, 'package-build-receipt', buildReceipt),
    makeJsonFile(EXPORT_PACKAGE_CONTROL_PATHS.contract, 'package-contract', contract),
    makeJsonFile(EXPORT_PACKAGE_CONTROL_PATHS.findings, 'package-findings', { schema: 'tiinex.export.package.findings.v1', findings })
  ];
}

function buildLocalDraftFiles(entries = [], recordIndex = new Map(), findings = []) {
  return entries.map((entry) => {
    const record = lookupEntry(recordIndex, entry) || {};
    const markdown = record.markdown || record.content || record.text || '';
    if (!markdown) findings.push(bundleFinding('error', 'export.package.bundle.local-draft.content-missing', 'Local draft manifest entry had no Markdown content to bundle.', { entryId: entry.id || '', path: entry.path || '' }));
    return makeTextFile(entry.packagePath || `artifacts/${normalizeRelativePath(entry.path || entry.id || 'draft.md')}`, 'artifact-markdown', markdown, {
      entryId: entry.id || '',
      logicalKind: 'local-draft',
      title: entry.title || record.title || '',
      boundary: entry.boundary || 'Local draft Markdown bundled as local/session material.'
    });
  });
}

function buildSourceReferenceFiles(entries = [], findings = []) {
  return entries.map((entry) => {
    if (entry.status === 'degraded-reference') findings.push(bundleFinding('warning', 'export.package.bundle.source-reference.degraded', 'Source reference bundled with degraded exactness; no fallback lookup is attempted.', { entryId: entry.id || '', path: entry.path || '', repo: entry.repo || '' }));
    const sourceReference = {
      schema: 'tiinex.export.package.source-reference.v2',
      id: entry.id || '',
      title: entry.title || '',
      status: entry.status || 'degraded-reference',
      boundary: entry.boundary || 'Source-backed material remains a reference.',
      target: entry.target || {}
    };
    return makeJsonFile(entry.packagePath || `sources/${normalizeRelativePath(entry.id || 'source.source.json')}`, 'source-reference', sourceReference, {
      entryId: entry.id || '',
      logicalKind: 'source-reference',
      sourceBoundary: entry.target?.boundary || ''
    });
  });
}

function buildAssetFiles(entries = [], assetIndex = new Map(), findings = []) {
  return entries.map((entry) => {
    const asset = lookupEntry(assetIndex, entry) || {};
    if (entry.status === 'source-reference') {
      return makeJsonFile(entry.packagePath, 'asset-source-reference', {
        schema: 'tiinex.export.package.asset-source-reference.v1',
        id: entry.id || '',
        title: entry.title || '',
        path: entry.path || '',
        mediaType: entry.mediaType || asset.type || asset.mimeType || '',
        byteSize: Number(entry.byteSize || asset.size || 0),
        status: 'source-reference',
        boundary: entry.boundary || asset.source?.boundary || 'Source-backed asset remains a reference.',
        target: entry.sourceReference || {}
      }, { entryId: entry.id || '', logicalKind: 'asset-source-reference', sourceBoundary: entry.sourceReference?.boundary || '' });
    }
    if (entry.status === 'content-available') {
      const projection = packageAssetBytes(asset);
      if (!projection.bytes.byteLength) findings.push(bundleFinding('error', 'export.package.bundle.asset.content-missing', 'Asset manifest claimed owned content but exact bytes were unavailable.', { entryId: entry.id || '', path: entry.path || '' }));
      return makeBinaryFile(entry.packagePath, 'asset-content', projection.bytes, {
        entryId: entry.id || '',
        logicalKind: 'owned-local-asset',
        mediaType: entry.mediaType || projection.mediaType || 'application/octet-stream',
        boundary: entry.boundary || asset.source?.boundary || 'Owned local asset bytes bundled without source promotion.',
        ...(projection.representation.startsWith('utf8-') ? { content: asset.content || asset.text || '' } : {})
      });
    }
    findings.push(bundleFinding('warning', 'export.package.bundle.asset.metadata-only', 'Local asset bundled as metadata-only descriptor because full owned bytes are unavailable.', { entryId: entry.id || '', path: entry.path || '' }));
    return makeJsonFile(entry.packagePath, 'asset-metadata', {
      schema: 'tiinex.export.package.asset-metadata.v2',
      id: entry.id || '',
      title: entry.title || '',
      path: entry.path || '',
      mediaType: entry.mediaType || asset.type || asset.mimeType || '',
      size: Number(entry.byteSize || asset.size || 0),
      status: 'metadata-only',
      boundary: entry.boundary || asset.source?.boundary || 'Metadata-only local asset entry; content requires reselection.'
    }, { entryId: entry.id || '', logicalKind: 'asset-metadata' });
  });
}

function buildWorkspaceCandidateFiles(entries = [], candidateIndex = new Map(), findings = []) {
  return entries.map((entry) => {
    const candidate = lookupEntry(candidateIndex, entry) || {};
    findings.push(bundleFinding('info', 'export.package.bundle.workspace-candidate.descriptor', 'Legacy/I/O workspace candidate bundled as descriptor only; canonical workspace context is separate.', { entryId: entry.id || '', path: entry.path || '' }));
    return makeJsonFile(entry.packagePath, 'workspace-candidate', {
      schema: 'tiinex.export.package.workspace-candidate.v1',
      id: entry.id || '',
      title: entry.title || candidate.title || '',
      path: entry.path || candidate.path || '',
      status: entry.status || 'open-or-merge-required',
      boundary: entry.boundary || 'Compatibility workspace candidate descriptor; not canonical runtime workspace context.'
    }, { entryId: entry.id || '', logicalKind: 'workspace-candidate' });
  });
}

function buildWorkspaceContextFiles(entry = {}, workspace = {}, findings = []) {
  if (!entry.id) return [];
  const context = entry.context || {};
  const out = [makeJsonFile(entry.packagePath || 'context/workspace.json', 'workspace-context', context, {
    entryId: entry.id,
    logicalKind: 'workspace-context',
    boundary: entry.boundary || context.boundary || ''
  })];
  const markdown = workspaceContextOwnedMarkdown(workspace);
  if (context.workspaceMarkdown?.available) {
    if (!markdown) findings.push(bundleFinding('error', 'export.package.bundle.workspace-context.markdown-missing', 'Workspace context claimed owned local workspace Markdown but exact content was unavailable.', { entryId: entry.id }));
    else out.push(makeTextFile(context.workspaceMarkdown.packagePath || 'context/workspace.workspace.md', 'workspace-context-markdown', markdown, {
      entryId: `${entry.id}:markdown`,
      logicalKind: 'workspace-context-markdown',
      mediaType: 'text/markdown',
      boundary: 'Owned local workspace artifact/context Markdown. It remains local until explicit publication.'
    }));
  }
  return out;
}

function buildPackageBuildReceipt({ contract, manifest, receipt, builtAt, materialFiles, findings, blocked }) {
  const status = blocked || findings.some((finding) => finding.severity === 'error') ? 'blocked' : (manifest.status === 'degraded' || findings.some((finding) => finding.severity === 'warning') ? 'degraded' : 'ready');
  return Object.freeze({
    schema: EXPORT_PACKAGE_BUILD_RECEIPT_SCHEMA_ID,
    packageId: manifest.packageId || receipt.packageId || '',
    at: builtAt,
    operation: 'export-package-file-map-built',
    state: status === 'blocked' ? 'blocked' : 'built-governed-file-map',
    status,
    boundary: 'Build receipt records deterministic package material/control construction before ZIP serialization. Exact serialized file bytes are governed by tiinex.package/file-map.json; no remote/source mutation occurred.',
    manifestFingerprint: manifest.integrity?.fingerprint || '',
    materialRepresentationSha256: packageMaterialRepresentationSha256(materialFiles),
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
    ...(material.workspaceContextCandidates || []),
    ...(material.workspaceContext ? [material.workspaceContext] : [])
  ].map((entry) => ({ id: entry.id || '', kind: entry.kind || '', path: entry.path || '', packagePath: entry.packagePath || '', packagePaths: entry.packagePaths || [], status: entry.status || '' }));
}

function makeTextFile(path, kind, content, extra = {}) {
  const text = String(content ?? '');
  return finalizeFile({
    path: normalizeRelativePath(path),
    kind,
    mediaType: extra.mediaType || (kind.includes('markdown') ? 'text/markdown' : 'text/plain'),
    content: text,
    ...omit(extra, ['mediaType'])
  });
}

function makeBinaryFile(path, kind, data, extra = {}) {
  return finalizeFile({
    path: normalizeRelativePath(path),
    kind,
    mediaType: extra.mediaType || 'application/octet-stream',
    data,
    ...omit(extra, ['mediaType', 'content']),
    ...(typeof extra.content === 'string' ? { content: extra.content } : {})
  });
}

function makeJsonFile(path, kind, value, extra = {}) {
  const content = `${stablePrettyJson(value)}\n`;
  return finalizeFile({
    path: normalizeRelativePath(path),
    kind,
    mediaType: 'application/json',
    content,
    ...extra
  });
}

function parseJsonFile(file = {}) {
  try {
    const data = packageFileBytes(file);
    return JSON.parse(new TextDecoder().decode(data));
  } catch (_) {
    return null;
  }
}

function indexByIdAndPath(items = []) {
  const index = new Map();
  for (const item of items) {
    for (const key of [item.id, item.path, item.title, item.name]) if (key) index.set(String(key), item);
  }
  return index;
}
function lookupEntry(index, entry = {}) {
  for (const key of [entry.id, entry.path, entry.title]) if (key && index.has(String(key))) return index.get(String(key));
  return null;
}
function normalizeRelativePath(path = '') {
  const input = String(path || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = [];
  for (const part of input.split('/')) {
    const clean = part.trim();
    if (!clean || clean === '.' || clean === '..') continue;
    parts.push(clean.replace(/[\u0000-\u001f<>:"|?*]/g, '_'));
  }
  return parts.join('/') || 'entry';
}
function isUnsafePackagePath(path = '') { return !path || path.startsWith('/') || path.split('/').includes('..') || /[\\\u0000-\u001f]/.test(path); }
function stableFingerprint(value) {
  const text = stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return `tixfp1-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
function stableStringify(value) { return JSON.stringify(sortForJson(value)); }
function stablePrettyJson(value) { return JSON.stringify(sortForJson(value), null, 2); }
function sortForJson(value) {
  if (Array.isArray(value)) return value.map(sortForJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortForJson(value[key])]));
}
function omit(object = {}, keys = []) {
  const out = {};
  for (const [key, value] of Object.entries(object)) if (!keys.includes(key)) out[key] = value;
  return out;
}
function bundleFinding(severity, code, message, extra = {}) { return Object.freeze(Object.assign({ severity, code, message }, extra)); }
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
