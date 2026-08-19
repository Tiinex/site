import { buildExportPackagePreflight } from './package.preflight.js';
import { packageAssetBytes, utf8Bytes } from './package.bytes.js';

export const EXPORT_PACKAGE_MANIFEST_SCHEMA_ID = 'tiinex.export.package.manifest.v1';
export const EXPORT_PACKAGE_RECEIPT_SCHEMA_ID = 'tiinex.export.package.receipt.v1';
export const EXPORT_PACKAGE_CONTRACT_SCHEMA_ID = 'tiinex.export.package.contract.v1';

export function buildExportPackageManifest(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const preflight = input.preflight || input.exportPackagePreflight || buildExportPackagePreflight(workspace, { records, assets, workspaceCandidates });
  const createdAt = typeof input.clock === 'function' ? input.clock() : (input.createdAt || new Date().toISOString());
  const recordIndex = indexByIdAndPath(records);
  const assetIndex = indexByIdAndPath(assets);
  const candidateIndex = indexByIdAndPath(workspaceCandidates);

  const localDrafts = (preflight.localDraftEntries || []).map((entry) => manifestLocalDraftEntry(entry, recordIndex));
  const sourceReferences = (preflight.sourceReferenceEntries || []).map((entry) => manifestSourceReferenceEntry(entry));
  const assetEntries = (preflight.assetEntries || []).map((entry) => manifestAssetEntry(entry, assetIndex));
  const contextCandidates = (preflight.workspaceCandidateEntries || []).map((entry) => manifestWorkspaceCandidateEntry(entry, candidateIndex));
  const workspaceContext = manifestWorkspaceContextEntry(preflight.workspaceContext || {}, workspace);
  const blocked = (preflight.blockedLocalEntries || []).map((entry) => manifestBlockedEntry(entry));
  const findings = (preflight.findings || []).map((finding) => manifestFinding('preflight', finding));

  const packageScope = Object.freeze({
    workspaceId: workspace.id || '',
    workspaceTitle: workspace.title || workspace.name || 'workspace',
    materialBoundary: 'bounded-loaded-workspace',
    includesLocalDraftMarkdown: localDrafts.length > 0,
    includesSourceReferences: sourceReferences.length > 0,
    includesAssets: assetEntries.length > 0,
    includesWorkspaceContextCandidates: contextCandidates.length > 0,
    includesWorkspaceContext: true,
    governanceBoundary: preflight.governanceBoundary || null,
    sourceMutation: false,
    remoteFetch: false,
    packageZipCreated: false
  });

  const material = Object.freeze({
    localDrafts: Object.freeze(localDrafts),
    sourceReferences: Object.freeze(sourceReferences),
    assets: Object.freeze(assetEntries),
    workspaceContextCandidates: Object.freeze(contextCandidates),
    workspaceContext,
    blocked: Object.freeze(blocked)
  });
  const counts = Object.freeze({
    entries: localDrafts.length + sourceReferences.length + assetEntries.length + contextCandidates.length + 1,
    localDrafts: localDrafts.length,
    sourceReferences: sourceReferences.length,
    pinnedSourceReferences: sourceReferences.filter((entry) => entry.status === 'pinned-reference').length,
    degradedSourceReferences: sourceReferences.filter((entry) => entry.status !== 'pinned-reference').length,
    assets: assetEntries.length,
    metadataOnlyAssets: assetEntries.filter((entry) => entry.status === 'metadata-only').length,
    workspaceContextCandidates: contextCandidates.length,
    workspaceContext: 1,
    blocked: blocked.length,
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length,
    findings: findings.length
  });
  const status = counts.blocked || counts.errors ? 'blocked' : (preflight.status === 'blocked' ? 'blocked' : (preflight.status === 'degraded' || counts.warnings || counts.metadataOnlyAssets || counts.degradedSourceReferences || counts.workspaceContextCandidates ? 'degraded' : 'ready'));
  const fingerprint = exportPackageManifestFingerprint({ packageScope, workspaceId: packageScope.workspaceId, status, material });
  const packageId = `package:${safeToken(packageScope.workspaceId || 'workspace')}:${fingerprint}`;

  return deepFreeze({
    schema: EXPORT_PACKAGE_MANIFEST_SCHEMA_ID,
    packageId,
    createdAt,
    workspaceId: packageScope.workspaceId,
    title: `Tiinex export package manifest · ${packageScope.workspaceTitle}`,
    status,
    boundary: 'Manifest only. It describes a future bounded export package without creating a zip, mutating sources, or assigning new provenance.',
    packageScope,
    entryPolicy: Object.freeze({
      localDrafts: 'Embed validated local draft Markdown as package artifacts while preserving local/draft boundary.',
      sourceReferences: 'Package source-backed material as explicit pinned/degraded source references, not as new local leaves.',
      assets: 'Package assets as assets; metadata-only assets require reselection or explicit metadata-only receipt.',
      workspaceCandidates: 'Workspace candidates remain context candidates until explicit Open/Merge.',
      blocked: 'Blocked material is listed as excluded; it is never silently converted into a valid Tiinex leaf.'
    }),
    material,
    counts,
    findings: Object.freeze(findings),
    integrity: Object.freeze({
      algorithm: 'tiinex-stable-fingerprint-v1',
      fingerprint,
      note: 'Deterministic manifest fingerprint for conformance and roundtrip checks; not a cryptographic content hash.'
    })
  });
}


export function exportPackageManifestFingerprint(manifest = {}) {
  return stableFingerprint({
    workspaceId: manifest.packageScope?.workspaceId || manifest.workspaceId || '',
    status: manifest.status || 'unknown',
    policy: 'tiinex-export-package-manifest-v1',
    governanceBoundary: manifest.packageScope?.governanceBoundary || null,
    material: manifest.material || {}
  });
}

export function buildExportPackageReceipt(manifest = {}, input = {}) {
  const at = typeof input.clock === 'function' ? input.clock() : (input.at || new Date().toISOString());
  const findings = Array.isArray(manifest.findings) ? manifest.findings : [];
  const status = manifest.status === 'blocked' ? 'blocked' : (manifest.status === 'degraded' ? 'degraded' : 'ready');
  const receiptFingerprint = stableFingerprint({
    manifestSchema: manifest.schema,
    packageId: manifest.packageId,
    manifestFingerprint: manifest.integrity?.fingerprint || '',
    status,
    counts: manifest.counts || {}
  });
  return deepFreeze({
    schema: EXPORT_PACKAGE_RECEIPT_SCHEMA_ID,
    receiptId: `receipt:${safeToken(manifest.packageId || 'package')}:${receiptFingerprint}`,
    packageId: manifest.packageId || '',
    at,
    operation: 'export-package-manifest-created',
    state: status === 'blocked' ? 'blocked' : 'planned',
    status,
    boundary: 'Receipt records manifest planning only. No zip was written, no source was mutated, and no remote material was fetched.',
    manifestFingerprint: manifest.integrity?.fingerprint || '',
    counts: Object.freeze(Object.assign({ entries: 0, blocked: 0, errors: 0, warnings: 0 }, manifest.counts || {})),
    guarantees: Object.freeze([
      'Local/session material remains local unless an explicit later publication transition assigns a durable source.',
      'Source-backed material remains a source reference and is not re-authored as a local draft.',
      'Assets remain assets and are not converted into fake artifact leaves.',
      'Blocked or degraded material is disclosed in findings before any future package builder may proceed.'
    ]),
    nextActions: Object.freeze(nextActionsForManifest(manifest)),
    findings: Object.freeze(findings.map((finding) => manifestFinding('manifest', finding)))
  });
}

export function buildExportPackageContract(workspace = {}, input = {}) {
  const records = Array.isArray(input.records) ? input.records : (Array.isArray(workspace.records) ? workspace.records : []);
  const assets = Array.isArray(input.assets) ? input.assets : (Array.isArray(workspace.assets) ? workspace.assets : []);
  const workspaceCandidates = Array.isArray(input.workspaceCandidates) ? input.workspaceCandidates : (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []);
  const preflight = input.preflight || input.exportPackagePreflight || buildExportPackagePreflight(workspace, { records, assets, workspaceCandidates });
  const manifest = input.manifest || buildExportPackageManifest(workspace, Object.assign({}, input, { records, assets, workspaceCandidates, preflight }));
  const receipt = input.receipt || buildExportPackageReceipt(manifest, input);
  return deepFreeze({
    schema: EXPORT_PACKAGE_CONTRACT_SCHEMA_ID,
    workspaceId: workspace.id || '',
    status: manifest.status || preflight.status || 'unknown',
    boundary: 'No-mutation package planning contract: preflight, manifest, and receipt are produced together for conformance before an export builder exists.',
    preflight,
    manifest,
    receipt
  });
}

function manifestLocalDraftEntry(entry = {}, recordIndex = new Map()) {
  const sourceRecord = lookupEntry(recordIndex, entry);
  const markdown = sourceRecord?.markdown || sourceRecord?.content || sourceRecord?.text || '';
  const path = normalizeRelativePath(entry.path || sourceRecord?.path || `${entry.id || 'draft'}.md`);
  return Object.freeze({
    id: entry.id || sourceRecord?.id || path,
    title: entry.title || sourceRecord?.title || 'Local draft',
    kind: 'artifact-markdown',
    path,
    packagePath: `artifacts/${path}`,
    status: entry.status || 'ready',
    mode: entry.mode || 'embed-local-draft-markdown',
    boundary: entry.boundary || 'Package may embed this validated local draft. It remains local/draft material.',
    content: Object.freeze({
      available: Boolean(markdown),
      mediaType: 'text/markdown',
      bytes: utf8Bytes(markdown).byteLength,
      fingerprint: markdown ? stableFingerprint(markdown) : '',
      embeddedByFutureBuilder: Boolean(markdown)
    })
  });
}

function manifestSourceReferenceEntry(entry = {}) {
  const target = entry.target || {};
  const path = normalizeRelativePath(target.path || entry.path || `${entry.id || 'source-reference'}.source.json`);
  return Object.freeze({
    id: entry.id || path,
    title: entry.title || 'Source reference',
    kind: 'source-reference',
    path,
    packagePath: `sources/${safeToken(target.adapterId || entry.adapterId || 'source')}/${safeToken(target.repo || entry.repo || target.inputTarget || 'target')}/${safeToken(target.materializedCommit || target.configuredRef || target.ref || entry.ref || 'unpinned')}/${safeToken(entry.id || path)}.source.json`,
    adapterId: target.adapterId || entry.adapterId || '',
    repo: target.repo || entry.repo || '',
    ref: target.ref || entry.ref || '',
    status: entry.status || target.status || 'degraded-reference',
    mode: entry.mode || 'preserve-source-reference',
    boundary: entry.boundary || 'Package stores exact available source-target authority as a reference; it does not republish it.',
    target: deepFreeze({ ...target })
  });
}

function manifestAssetEntry(entry = {}, assetIndex = new Map()) {
  const sourceAsset = lookupEntry(assetIndex, entry) || {};
  const path = normalizeRelativePath(entry.path || sourceAsset.path || `${entry.id || 'asset'}`);
  const byteProjection = packageAssetBytes(sourceAsset);
  const contentAvailable = entry.status === 'content-available' && byteProjection.bytes.byteLength > 0;
  const status = entry.status || (contentAvailable ? 'content-available' : 'metadata-only');
  const id = entry.id || sourceAsset.id || path;
  const packagePath = status === 'source-reference'
    ? `sources/assets/${safeToken(id)}.asset.source.json`
    : status === 'metadata-only'
      ? `metadata/assets/${path}.asset.json`
      : `assets/${path}`;
  return Object.freeze({
    id,
    title: entry.title || sourceAsset.name || path,
    kind: 'asset',
    path,
    packagePath,
    mediaType: entry.mediaType || sourceAsset.type || sourceAsset.mimeType || byteProjection.mediaType || '',
    byteSize: Number(entry.byteSize || sourceAsset.size || byteProjection.bytes.byteLength || 0),
    status,
    mode: entry.mode || (contentAvailable ? 'asset-content-entry' : 'asset-metadata-entry'),
    boundary: entry.boundary || sourceAsset.source?.boundary || 'Asset boundary follows its intake source; assets are not fake leaves.',
    sourceReference: entry.sourceReference ? deepFreeze({ ...entry.sourceReference }) : null,
    content: Object.freeze({
      available: contentAvailable,
      bytes: contentAvailable ? byteProjection.bytes.byteLength : 0,
      representation: contentAvailable ? byteProjection.representation : 'none',
      note: contentAvailable ? 'Package builder embeds exact owned bytes.' : 'No owned bytes are claimed by this manifest entry.'
    })
  });
}

function manifestWorkspaceCandidateEntry(entry = {}, candidateIndex = new Map()) {
  const sourceCandidate = lookupEntry(candidateIndex, entry);
  const path = normalizeRelativePath(entry.path || sourceCandidate?.path || `${entry.id || 'workspace'}.workspace.md`);
  return Object.freeze({
    id: entry.id || sourceCandidate?.id || path,
    title: entry.title || sourceCandidate?.title || path,
    kind: 'workspace-candidate',
    path,
    packagePath: `workspace-candidates/${path}`,
    status: entry.status || 'open-or-merge-required',
    mode: entry.mode || 'context-candidate-reference',
    boundary: entry.boundary || 'Workspace candidate is context material until explicit open/merge.'
  });
}

function manifestWorkspaceContextEntry(context = {}, workspace = {}) {
  const id = `workspace-context:${context.id || workspace.id || 'workspace'}`;
  const packagePaths = ['context/workspace.json'];
  if (context.workspaceMarkdown?.available) packagePaths.push(context.workspaceMarkdown.packagePath || 'context/workspace.workspace.md');
  return Object.freeze({
    id,
    title: `Workspace context · ${context.title || workspace.title || workspace.name || 'Workspace'}`,
    kind: 'workspace-context',
    path: context.workspaceImport?.path || '',
    packagePath: packagePaths[0],
    packagePaths: Object.freeze(packagePaths),
    status: 'ready',
    mode: 'canonical-workspace-context',
    boundary: context.boundary || 'Canonical workspace context projection for handoff/re-ingest.',
    context: deepFreeze({ ...context })
  });
}

function manifestBlockedEntry(entry = {}) {
  const path = normalizeRelativePath(entry.path || entry.id || 'blocked-entry');
  return Object.freeze({
    id: entry.id || path,
    title: entry.title || 'Blocked material',
    kind: entry.kind || 'blocked-material',
    path,
    status: 'blocked',
    reason: entry.reason || 'not-package-ready',
    boundary: entry.boundary || 'Blocked material is excluded from package entries.'
  });
}

export function finalizeExportPackageManifestPaths(manifest = {}, files = []) {
  const byEntryId = new Map();
  for (const file of files) {
    const entryId = String(file.entryId || '');
    if (!entryId) continue;
    const current = byEntryId.get(entryId) || [];
    current.push(String(file.path || ''));
    byEntryId.set(entryId, current);
  }
  const material = manifest.material || {};
  const remap = (entries = []) => entries.map((entry) => {
    const paths = byEntryId.get(String(entry.id || '')) || [];
    return paths.length ? Object.freeze({ ...entry, packagePath: paths[0], packagePaths: Object.freeze(paths.slice()) }) : entry;
  });
  const workspaceContext = material.workspaceContext ? (() => {
    const baseId = String(material.workspaceContext.id || '');
    const direct = byEntryId.get(baseId) || [];
    const markdown = byEntryId.get(`${baseId}:markdown`) || [];
    const paths = [...direct, ...markdown];
    return paths.length ? Object.freeze({ ...material.workspaceContext, packagePath: paths[0], packagePaths: Object.freeze(paths) }) : material.workspaceContext;
  })() : null;
  const nextMaterial = Object.freeze({
    localDrafts: Object.freeze(remap(material.localDrafts || [])),
    sourceReferences: Object.freeze(remap(material.sourceReferences || [])),
    assets: Object.freeze(remap(material.assets || [])),
    workspaceContextCandidates: Object.freeze(remap(material.workspaceContextCandidates || [])),
    workspaceContext,
    blocked: Object.freeze(material.blocked || [])
  });
  const fingerprint = exportPackageManifestFingerprint({ ...manifest, material: nextMaterial });
  const packageId = `package:${safeToken(manifest.packageScope?.workspaceId || manifest.workspaceId || 'workspace')}:${fingerprint}`;
  return deepFreeze({
    ...manifest,
    packageId,
    material: nextMaterial,
    integrity: Object.freeze({
      algorithm: 'tiinex-stable-fingerprint-v1',
      fingerprint,
      note: 'Deterministic manifest semantic fingerprint for conformance; durable serialized byte integrity is separately owned by tiinex.package/file-map.json.'
    })
  });
}

function nextActionsForManifest(manifest = {}) {
  const actions = [];
  if (manifest.status === 'ready') actions.push('Future export builder may create a package from this manifest.');
  if (manifest.status === 'degraded') actions.push('Review degraded source references, metadata-only assets, and workspace candidates before package creation.');
  if (manifest.status === 'blocked') actions.push('Resolve blocked local material or exclude it before package creation.');
  if ((manifest.counts?.workspaceContextCandidates || 0) > 0) actions.push('Open or merge workspace candidates explicitly if they should become package context.');
  if ((manifest.counts?.metadataOnlyAssets || 0) > 0) actions.push('Reselect metadata-only assets or accept a degraded metadata-only package entry.');
  return actions.length ? actions : ['No action required before a future package builder.'];
}

function manifestFinding(source, item = {}) {
  return Object.freeze({
    source,
    severity: item.severity || 'info',
    code: item.code || 'finding',
    message: item.message || String(item.code || 'Finding'),
    recordId: item.recordId || '',
    assetId: item.assetId || '',
    workspaceCandidateId: item.workspaceCandidateId || '',
    path: item.path || '',
    repo: item.repo || ''
  });
}

function indexByIdAndPath(items = []) {
  const index = new Map();
  for (const item of items) {
    for (const key of [item.id, item.path, item.name, item.title]) {
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

function safeToken(value = '') {
  return String(value || '').trim().replace(/\\/g, '/').replace(/[^a-zA-Z0-9._/-]+/g, '-').replace(/^[-/.]+|[-/.]+$/g, '').replace(/\/+/, '/').slice(0, 120) || 'unnamed';
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

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}
