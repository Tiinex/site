import { packageFileBytes, sha256Hex, stableFingerprintBytes, utf8Bytes } from './package.bytes.js';

export const EXPORT_PACKAGE_FILE_MAP_SCHEMA_ID = 'tiinex.export.package.file-map.v1';
export const EXPORT_PACKAGE_FILE_MAP_PATH = 'tiinex.package/file-map.json';

export function assignFinalPackagePaths(files = [], findings = []) {
  const seen = new Map();
  return files.map((file) => {
    const requestedPath = normalizePackagePath(file.path || '');
    if (!requestedPath) return Object.freeze({ ...file, path: '' });
    const count = seen.get(requestedPath) || 0;
    seen.set(requestedPath, count + 1);
    if (!count) return finalizeFile({ ...file, requestedPath });
    const finalPath = addPathSuffix(requestedPath, `duplicate-${count}`);
    findings.push(finding('warning', 'export.package.bundle.path-deduped', 'Duplicate package file path was made unique and recorded as final package authority.', { path: requestedPath, renamedPath: finalPath, entryId: file.entryId || '' }));
    return finalizeFile({ ...file, path: finalPath, requestedPath });
  });
}

export function finalizeFile(file = {}) {
  const data = packageFileBytes(file);
  const bytes = data.byteLength;
  const sha256 = sha256Hex(data);
  return Object.freeze({
    ...file,
    path: normalizePackagePath(file.path || ''),
    requestedPath: normalizePackagePath(file.requestedPath || file.path || ''),
    bytes,
    sha256,
    fingerprint: stableFingerprintBytes(data),
    ...(typeof file.content === 'string' ? { content: file.content } : {}),
    ...(file.data instanceof Uint8Array || (!('content' in file) && data.byteLength) ? { data } : {})
  });
}

export function buildExportPackageFileMap(files = [], input = {}) {
  const governed = files.filter((file) => normalizePackagePath(file.path || '') !== EXPORT_PACKAGE_FILE_MAP_PATH).map(finalizeFile);
  const entries = governed.map((file, index) => fileMapEntry(file, index));
  const representationSha256 = sha256Hex(utf8Bytes(stableJson(entries)));
  return deepFreeze({
    schema: EXPORT_PACKAGE_FILE_MAP_SCHEMA_ID,
    version: 1,
    packageId: String(input.packageId || ''),
    boundary: 'Exact byte-integrity map for this serialized package representation. It proves declared path/length/SHA-256 consistency inside the supplied package; it does not claim external provenance, authorship, or semantic truth.',
    algorithm: 'sha256',
    governedSet: 'all package files except tiinex.package/file-map.json itself',
    representationSha256,
    entries
  });
}

export function inspectExportPackageFileMap(fileMap = {}, files = [], manifest = {}) {
  const findings = [];
  if (fileMap.schema !== EXPORT_PACKAGE_FILE_MAP_SCHEMA_ID) findings.push(finding('error', 'export.package.file-map.schema.invalid', 'Package file map schema is missing or unsupported.'));
  const supplied = new Map();
  for (const file of files) {
    const path = normalizePackagePath(file.path || '');
    if (!path || path === EXPORT_PACKAGE_FILE_MAP_PATH) continue;
    if (supplied.has(path)) findings.push(finding('error', 'export.package.file-map.physical.duplicate', 'Serialized package contains duplicate physical path.', { path }));
    supplied.set(path, file);
  }
  const declared = new Map();
  for (const entry of Array.isArray(fileMap.entries) ? fileMap.entries : []) {
    const path = normalizePackagePath(entry.path || '');
    if (!path) {
      findings.push(finding('error', 'export.package.file-map.entry.path-missing', 'File-map entry is missing final physical path.', { entryId: entry.entryId || '' }));
      continue;
    }
    if (declared.has(path)) findings.push(finding('error', 'export.package.file-map.entry.path-duplicate', 'File-map declares duplicate final physical path.', { path }));
    declared.set(path, entry);
    const file = supplied.get(path);
    if (!file) {
      findings.push(finding('error', 'export.package.file-map.claimed-file-missing', 'File-map claims a governed package file that is physically missing.', { path, entryId: entry.entryId || '' }));
      continue;
    }
    const data = packageFileBytes(file);
    if (Number(entry.bytes) !== data.byteLength) findings.push(finding('error', 'export.package.file-map.bytes-mismatch', 'Governed package file byte length does not match file-map authority.', { path, expected: Number(entry.bytes), actual: data.byteLength }));
    const digest = sha256Hex(data);
    if (String(entry.sha256 || '') !== digest) findings.push(finding('error', 'export.package.file-map.sha256-mismatch', 'Governed package file SHA-256 does not match file-map authority.', { path, expected: entry.sha256 || '', actual: digest }));
    if (entry.kind && file.kind && String(entry.kind) !== String(file.kind)) findings.push(finding('error', 'export.package.file-map.kind-mismatch', 'Governed package file kind differs from file-map authority.', { path, expected: entry.kind, actual: file.kind }));
    if (entry.entryId && file.entryId && String(entry.entryId) !== String(file.entryId)) findings.push(finding('error', 'export.package.file-map.entry-id-mismatch', 'Governed package file entry identity differs from file-map authority.', { path, expected: entry.entryId, actual: file.entryId }));
  }
  for (const [path] of supplied) {
    if (!declared.has(path)) findings.push(finding('error', 'export.package.file-map.unmapped-file', 'Serialized package contains a governed physical file absent from the durable file map.', { path }));
  }
  const entries = Array.isArray(fileMap.entries) ? fileMap.entries : [];
  const representationSha256 = sha256Hex(utf8Bytes(stableJson(entries)));
  if (String(fileMap.representationSha256 || '') !== representationSha256) findings.push(finding('error', 'export.package.file-map.representation-digest-mismatch', 'File-map representation digest does not match its declared entries.'));
  findings.push(...inspectManifestMappings(manifest, declared));
  return Object.freeze({
    schema: 'tiinex.export.package.file-map.inspection.v1',
    status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid',
    representationSha256,
    counts: Object.freeze({ declared: declared.size, supplied: supplied.size, findings: findings.length, errors: findings.filter((item) => item.severity === 'error').length }),
    findings: Object.freeze(findings)
  });
}

function inspectManifestMappings(manifest = {}, declared = new Map()) {
  const findings = [];
  if (String(manifest.status || '') === 'blocked') return findings;
  for (const entry of flattenManifestEntries(manifest)) {
    const paths = [...new Set([entry.packagePath, ...(Array.isArray(entry.packagePaths) ? entry.packagePaths : [])].filter(Boolean))];
    if (!paths.length) continue;
    for (const rawPath of paths) {
      const path = normalizePackagePath(rawPath);
      const mapped = declared.get(path);
      if (!mapped) {
        findings.push(finding('error', 'export.package.file-map.manifest-entry-unmapped', 'Manifest material entry has no matching governed physical package file.', { entryId: entry.id || '', path }));
        continue;
      }
      if (entry.id && mapped.entryId && String(entry.id) !== String(mapped.entryId) && !String(mapped.entryId).startsWith(`${entry.id}:`)) {
        findings.push(finding('error', 'export.package.file-map.manifest-entry-id-mismatch', 'Manifest material identity does not match durable file-map entry identity.', { entryId: entry.id || '', mappedEntryId: mapped.entryId || '', path }));
      }
    }
  }
  return findings;
}

function flattenManifestEntries(manifest = {}) {
  const material = manifest.material || {};
  return [
    ...(material.localDrafts || []),
    ...(material.sourceReferences || []),
    ...(material.assets || []),
    ...(material.workspaceContextCandidates || []),
    ...(material.workspaceContext ? [material.workspaceContext] : [])
  ];
}

function fileMapEntry(file = {}, index = 0) {
  return deepFreeze({
    ordinal: index,
    path: normalizePackagePath(file.path || ''),
    requestedPath: normalizePackagePath(file.requestedPath || file.path || ''),
    entryId: String(file.entryId || ''),
    logicalKind: String(file.logicalKind || ''),
    kind: String(file.kind || ''),
    mediaType: String(file.mediaType || ''),
    bytes: Number(file.bytes || 0),
    sha256: String(file.sha256 || ''),
    boundary: String(file.boundary || ''),
    sourceBoundary: String(file.sourceBoundary || '')
  });
}

function addPathSuffix(path, suffix) {
  const slash = path.lastIndexOf('/');
  const dot = path.lastIndexOf('.');
  if (dot <= slash) return `${path}.${suffix}`;
  return `${path.slice(0, dot)}.${suffix}${path.slice(dot)}`;
}

function normalizePackagePath(value = '') {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.' && part !== '..').join('/');
}

function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
