import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { makeAdapterResult } from '../adapters/adapter.contracts.js';
import { inspectExportPackageBundle } from './package.builder.js';
import { packageFileBytes, utf8Text } from './package.bytes.js';
import { EXPORT_PACKAGE_CONTROL_ROLES } from './package.controlTopology.js';

export const EXPORT_PACKAGE_IMPORT_PLAN_SCHEMA_ID = 'tiinex.export.package.import.plan.v1';
export const EXPORT_PACKAGE_APPLY_RESULT_SCHEMA_ID = 'tiinex.export.package.apply.result.v1';
export const EXPORT_PACKAGE_IMPORT_ADAPTER_ID = 'export-package';

export function buildExportPackageImportPlan(bundle = {}, input = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const inspection = input.inspection || inspectExportPackageBundle(bundle);
  const control = readControlFiles(files);
  const manifest = control.manifest || bundle.manifest || {};
  const receipt = control.receipt || bundle.receipt || {};
  const contract = control.contract || bundle.contract || {};
  const manifestIndex = indexManifestEntries(manifest);
  const findings = [];

  if (inspection.status !== 'valid') {
    findings.push(...(inspection.findings || []).map((item) => importFinding(item.severity || 'error', `export.package.import.${item.code || 'inspection-finding'}`, item.message || 'Package inspection finding.', pickFindingExtra(item))));
  }
  if (!control.manifest) findings.push(importFinding('error', 'export.package.import.manifest-missing', 'Package import cannot be trusted without a manifest control file.'));
  if (!control.fileMap) findings.push(importFinding('error', 'export.package.import.file-map-missing', 'Package import cannot be trusted without durable serialized file-map authority.'));
  if (!control.receipt) findings.push(importFinding('warning', 'export.package.import.receipt-missing', 'Package import has no receipt control file.'));
  if ((manifest.status || bundle.status) === 'blocked') findings.push(importFinding('error', 'export.package.import.manifest-blocked', 'Package manifest is blocked; material is not applied by default.', { packageId: manifest.packageId || bundle.packageId || '' }));

  const records = [];
  const sourceReferences = [];
  const assets = [];
  const workspaceCandidates = [];
  const ignored = [];
  let workspaceContext = null;
  let workspaceMarkdown = '';

  for (const file of files) {
    const path = normalizePackagePath(file.path || '');
    if (!path) {
      findings.push(importFinding('error', 'export.package.import.file.path-unsafe', 'Unsafe package path was not imported.', { path: file.path || '' }));
      continue;
    }
    if (isControlFile(path)) continue;
    const entry = lookupManifestEntry(manifestIndex, file);
    if (file.kind === 'artifact-markdown') records.push(recordFromArtifactFile(file, entry, findings));
    else if (file.kind === 'source-reference') {
      const reference = sourceReferenceFromFile(file, entry, findings, 'artifact');
      if (reference) sourceReferences.push(reference);
    } else if (file.kind === 'asset-source-reference') {
      const reference = sourceReferenceFromFile(file, entry, findings, 'asset');
      if (reference) sourceReferences.push(reference);
    } else if (file.kind === 'asset-content') assets.push(assetFromContentFile(file, entry, findings));
    else if (file.kind === 'asset-metadata') assets.push(assetFromMetadataFile(file, entry, findings));
    else if (file.kind === 'workspace-candidate') workspaceCandidates.push(workspaceCandidateFromFile(file, entry, findings));
    else if (file.kind === 'workspace-context') workspaceContext = parseJsonFile(file) || null;
    else if (file.kind === 'workspace-context-markdown') workspaceMarkdown = utf8Text(packageFileBytes(file));
    else {
      ignored.push({ path, kind: file.kind || 'unknown' });
      findings.push(importFinding('info', 'export.package.import.file.ignored', 'Package file kind is not materialized by the import contract.', { path, kind: file.kind || '' }));
    }
  }

  if (!workspaceContext) findings.push(importFinding('error', 'export.package.import.workspace-context.missing', 'Handoff package is missing canonical workspace context.'));
  if (workspaceContext?.workspaceMarkdown?.available && !workspaceMarkdown) findings.push(importFinding('error', 'export.package.import.workspace-context.markdown-missing', 'Workspace context claims owned workspace Markdown but the governed Markdown file is missing or empty.'));
  const workspaceEntries = workspaceContext?.workspaceMarkdown?.available && workspaceMarkdown
    ? [workspaceEntryFromContext(workspaceContext, workspaceMarkdown)]
    : [];

  const counts = Object.freeze({
    files: files.length,
    importedRecords: records.length,
    sourceReferences: sourceReferences.length,
    artifactSourceReferences: sourceReferences.filter((item) => item.materialKind === 'artifact').length,
    assetSourceReferences: sourceReferences.filter((item) => item.materialKind === 'asset').length,
    assets: assets.length,
    metadataOnlyAssets: assets.filter((asset) => asset.previewState === 'metadata-only').length,
    workspaceCandidates: workspaceCandidates.length,
    workspaceContext: workspaceContext ? 1 : 0,
    workspaceEntries: workspaceEntries.length,
    ignored: ignored.length,
    findings: findings.length,
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length
  });
  const status = counts.errors ? 'blocked' : (inspection.status !== 'valid' || counts.warnings || counts.metadataOnlyAssets || counts.workspaceCandidates ? 'degraded' : 'ready');

  return deepFreeze({
    schema: EXPORT_PACKAGE_IMPORT_PLAN_SCHEMA_ID,
    packageId: manifest.packageId || bundle.packageId || receipt.packageId || '',
    status,
    boundary: 'Import plan reads only explicitly supplied governed package bytes. Local-owned artifacts/assets remain local, source-backed entries remain references, canonical workspace context remains context, and no network/source mutation occurs.',
    importPolicy: 'Materialization follows durable file-map + manifest authority only; no repository/global/nearest-path recovery is permitted.',
    manifest,
    receipt,
    contract,
    fileMap: control.fileMap || bundle.fileMap || null,
    inspection,
    counts,
    records: Object.freeze(records),
    sourceReferences: Object.freeze(sourceReferences),
    assets: Object.freeze(assets),
    workspaceContext,
    workspaceEntries: Object.freeze(workspaceEntries),
    workspaceCandidates: Object.freeze(workspaceCandidates),
    ignored: Object.freeze(ignored),
    findings: Object.freeze(findings)
  });
}

export function buildExportPackageApplyResult(bundle = {}, input = {}) {
  const importPlan = input.importPlan || buildExportPackageImportPlan(bundle, input);
  const errors = importPlan.findings.filter((finding) => finding.severity === 'error').map(toAdapterFinding);
  const warnings = importPlan.findings.filter((finding) => finding.severity === 'warning').map(toAdapterFinding);
  const blocked = importPlan.status === 'blocked' && input.allowBlocked !== true;
  const adapterResult = makeAdapterResult({
    adapterId: EXPORT_PACKAGE_IMPORT_ADAPTER_ID,
    sourceId: `package:${importPlan.packageId || 'unknown'}`,
    records: blocked ? [] : importPlan.records,
    assets: blocked ? [] : importPlan.assets,
    workspaceEntries: blocked ? [] : importPlan.workspaceEntries,
    errors,
    warnings,
    diagnostics: {
      sourceBoundary: 'local-session-package-import',
      packageId: importPlan.packageId || '',
      sourceReferenceCount: importPlan.counts.sourceReferences,
      workspaceContextCount: importPlan.counts.workspaceContext,
      workspaceEntryCount: importPlan.counts.workspaceEntries,
      workspaceCandidateCount: importPlan.counts.workspaceCandidates,
      metadataOnlyAssetCount: importPlan.counts.metadataOnlyAssets,
      noRemoteFetch: true,
      noSourceMutation: true
    }
  });

  return deepFreeze({
    schema: EXPORT_PACKAGE_APPLY_RESULT_SCHEMA_ID,
    packageId: importPlan.packageId || '',
    status: importPlan.status,
    boundary: 'Apply result is adapter-shaped for owned local records/assets/workspace entries only. Source references remain descriptors and are never converted into local leaves or guessed sources.',
    importPlan,
    adapterResult,
    sourceReferences: importPlan.sourceReferences,
    workspaceContext: importPlan.workspaceContext,
    workspaceCandidates: importPlan.workspaceCandidates,
    counts: Object.freeze({
      records: adapterResult.records.length,
      assets: adapterResult.assets.length,
      workspaceEntries: adapterResult.workspaceEntries?.length || 0,
      sourceReferences: importPlan.sourceReferences.length,
      workspaceCandidates: importPlan.workspaceCandidates.length,
      errors: errors.length,
      warnings: warnings.length
    })
  });
}

function readControlFiles(files = []) {
  const control = {};
  for (const entry of EXPORT_PACKAGE_CONTROL_ROLES) {
    const file = files.find((candidate) => String(candidate?.path || '') === entry.path);
    control[entry.role] = file ? parseJsonFile(file) : null;
  }
  return control;
}

function indexManifestEntries(manifest = {}) {
  const index = new Map();
  const material = manifest.material || {};
  const entries = [
    ...(material.localDrafts || []),
    ...(material.sourceReferences || []),
    ...(material.assets || []),
    ...(material.workspaceContextCandidates || []),
    ...(material.blocked || []),
    ...(material.workspaceContext ? [material.workspaceContext] : [])
  ];
  for (const entry of entries) {
    const keys = [entry.id, entry.path, entry.packagePath, ...(Array.isArray(entry.packagePaths) ? entry.packagePaths : [])];
    for (const key of keys) if (key) index.set(String(key), entry);
    if (entry.id && material.workspaceContext === entry) index.set(`${entry.id}:markdown`, entry);
  }
  return index;
}

function lookupManifestEntry(index, file = {}) {
  for (const key of [file.entryId, file.path, stripKnownPackagePrefix(file.path || '')]) if (key && index.has(String(key))) return index.get(String(key));
  return null;
}

function recordFromArtifactFile(file = {}, entry = {}, findings = []) {
  const markdown = typeof file.content === 'string' ? file.content : utf8Text(packageFileBytes(file));
  const path = normalizeMaterialPath(entry?.path || stripKnownPackagePrefix(file.path || '') || file.path || 'artifact.md');
  const record = createRecordFromMarkdown(markdown, { path, name: entry?.title || file.title || path, sourceMode: 'package-import' });
  if (!markdown) findings.push(importFinding('error', 'export.package.import.artifact.content-missing', 'Artifact package entry had no Markdown content.', { path }));
  return Object.assign({}, record, {
    id: `package:local:${entry?.id || path}`,
    path,
    title: entry?.title || record.title,
    sourceMode: 'package-import',
    source: makePackageLocalSource(path),
    packageEntryId: entry?.id || file.entryId || '',
    packagePath: file.path || '',
    packageImport: true
  });
}

function sourceReferenceFromFile(file = {}, entry = {}, findings = [], materialKind = 'artifact') {
  const parsed = parseJsonFile(file);
  if (!parsed) {
    findings.push(importFinding('error', 'export.package.import.source-reference.invalid-json', 'Source reference package entry could not be parsed.', { path: file.path || '' }));
    return null;
  }
  const target = parsed.target || entry?.target || entry?.sourceReference || {};
  const status = parsed.status || entry?.status || target.status || 'degraded-reference';
  if (target.adapterId === 'github' && (!target.repo || (!target.path && !target.inputTarget) || !target.materializedCommit)) findings.push(importFinding('warning', 'export.package.import.source-reference.incomplete', 'GitHub source reference remains degraded because exact immutable source authority is incomplete.', { path: file.path || '', repo: target.repo || '' }));
  if (target.adapterId !== 'github' && !target.inputTarget) findings.push(importFinding('warning', 'export.package.import.source-reference.incomplete', 'External source reference remains degraded because exact input target is unavailable.', { path: file.path || '' }));
  return deepFreeze({
    schema: 'tiinex.export.package.import.source-reference.v2',
    materialKind,
    id: parsed.id || entry?.id || file.entryId || file.path || '',
    title: parsed.title || entry?.title || 'Source reference',
    status,
    boundary: parsed.boundary || entry?.boundary || 'Imported package source reference. It is not materialized as a local leaf.',
    target: { ...target },
    packagePath: file.path || ''
  });
}

function assetFromContentFile(file = {}, entry = {}, findings = []) {
  const path = normalizeMaterialPath(entry?.path || stripKnownPackagePrefix(file.path || '') || file.path || 'asset');
  const data = packageFileBytes(file);
  if (!data.byteLength) findings.push(importFinding('warning', 'export.package.import.asset.content-empty', 'Asset content entry was empty.', { path }));
  const content = typeof file.content === 'string' ? file.content : (isTextMediaType(entry?.mediaType || file.mediaType) ? utf8Text(data) : '');
  return deepFreeze({
    schema: 'tiinex.local.asset.v1',
    id: `asset:package:${entry?.id || path}`,
    path,
    name: fileName(path),
    type: entry?.mediaType || file.mediaType || 'application/octet-stream',
    size: data.byteLength,
    bytes: data,
    content,
    dataUrl: '',
    previewState: data.byteLength ? 'available' : 'metadata-only',
    sourceMode: 'package-import-asset',
    source: makePackageLocalSource(path),
    packageEntryId: entry?.id || file.entryId || '',
    packagePath: file.path || ''
  });
}

function assetFromMetadataFile(file = {}, entry = {}, findings = []) {
  const parsed = parseJsonFile(file) || {};
  const path = normalizeMaterialPath(parsed.path || entry?.path || stripKnownPackagePrefix(file.path || '') || file.path || 'asset');
  findings.push(importFinding('warning', 'export.package.import.asset.metadata-only', 'Local asset imported as metadata-only; content requires reselection.', { path }));
  return deepFreeze({
    schema: 'tiinex.local.asset.v1',
    id: `asset:package:${parsed.id || entry?.id || path}`,
    path,
    name: parsed.title || fileName(path),
    type: parsed.mediaType || entry?.mediaType || 'application/octet-stream',
    size: Number(parsed.size || entry?.byteSize || 0),
    content: '',
    dataUrl: '',
    previewState: 'metadata-only',
    sourceMode: 'package-import-asset-metadata',
    source: makePackageLocalSource(path),
    packageEntryId: entry?.id || file.entryId || '',
    packagePath: file.path || ''
  });
}

function workspaceCandidateFromFile(file = {}, entry = {}, findings = []) {
  const parsed = parseJsonFile(file) || {};
  const path = normalizeMaterialPath(parsed.path || entry?.path || stripKnownPackagePrefix(file.path || '') || file.path || 'workspace.workspace.md');
  findings.push(importFinding('info', 'export.package.import.workspace-candidate.descriptor-only', 'Compatibility workspace candidate imported as descriptor only; canonical workspace context is separate.', { path }));
  return deepFreeze({
    schema: 'tiinex.export.package.import.workspace-candidate.v1',
    id: parsed.id || entry?.id || path,
    title: parsed.title || entry?.title || fileName(path),
    path,
    status: parsed.status || entry?.status || 'open-or-merge-required',
    boundary: parsed.boundary || entry?.boundary || 'Package workspace candidate descriptor; not opened/merged automatically.',
    packagePath: file.path || ''
  });
}

function workspaceEntryFromContext(context = {}, markdown = '') {
  const workspaceImport = context.workspaceImport || {};
  return deepFreeze({
    schema: 'tiinex.workspace.import.v1',
    path: workspaceImport.path || 'workspace.workspace.md',
    title: context.title || context.name || 'Imported workspace',
    markdown,
    sourceMode: 'package-import-workspace-file',
    boundary: 'Browser-local workspace context restored from exact handoff-package bytes; explicit workspace lifecycle still owns Open/Merge.'
  });
}

function parseJsonFile(file = {}) {
  try { return JSON.parse(utf8Text(packageFileBytes(file))); }
  catch (_) { return null; }
}
function isControlFile(path = '') { return String(path || '').startsWith('tiinex.package/'); }
function stripKnownPackagePrefix(path = '') {
  const clean = normalizePackagePath(path);
  return clean.replace(/^artifacts\//, '').replace(/^assets\//, '').replace(/^sources\//, '').replace(/^metadata\//, '').replace(/^context\//, '').replace(/\.asset\.source\.json$/i, '').replace(/\.asset\.json$/i, '').replace(/\.source\.json$/i, '').replace(/\.json$/i, '');
}
function normalizePackagePath(path = '') {
  const input = String(path || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = [];
  for (const part of input.split('/')) {
    const clean = part.trim();
    if (!clean || clean === '.') continue;
    if (clean === '..') continue;
    parts.push(clean.replace(/[\u0000-\u001f<>:"|?*]/g, '_'));
  }
  return parts.join('/');
}
function normalizeMaterialPath(path = '') { return normalizePackagePath(path) || 'entry'; }
function fileName(path = '') { return String(path || '').split('/').filter(Boolean).pop() || 'entry'; }
function isTextMediaType(mediaType = '') { return /^text\//i.test(mediaType) || /(?:json|xml|javascript|markdown)/i.test(mediaType); }
function makePackageLocalSource(path = '') {
  return Object.freeze({
    kind: 'local-session',
    adapterId: EXPORT_PACKAGE_IMPORT_ADAPTER_ID,
    sourceKind: 'export.package.import',
    label: 'package import',
    boundary: 'Browser-local package import material; no GitHub provenance inferred.',
    githubPolicy: 'not guessed',
    sourceBacked: false,
    writeCapability: 'session-local',
    path
  });
}
function toAdapterFinding(finding = {}) { return { code: finding.code || 'export.package.import.finding', message: finding.message || String(finding.code || 'Import finding'), ref: finding.path || finding.recordId || finding.assetId || '' }; }
function pickFindingExtra(item = {}) {
  const out = {};
  for (const key of ['path', 'kind', 'repo', 'recordId', 'assetId', 'packageId', 'entryId']) if (item[key] !== undefined && item[key] !== '') out[key] = item[key];
  return out;
}
function importFinding(severity, code, message, extra = {}) { return Object.freeze(Object.assign({ severity, code, message }, extra)); }
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const item of Object.values(value)) deepFreeze(item);
  return Object.freeze(value);
}
