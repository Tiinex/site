import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { makeAdapterResult } from '../adapters/adapter.contracts.js';
import { inspectExportPackageBundle } from './package.builder.js';

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
  if (!control.receipt) findings.push(importFinding('warning', 'export.package.import.receipt-missing', 'Package import has no receipt control file.'));
  if ((manifest.status || bundle.status) === 'blocked') {
    findings.push(importFinding('error', 'export.package.import.manifest-blocked', 'Package manifest is blocked; material is not applied by default.', { packageId: manifest.packageId || bundle.packageId || '' }));
  }

  const records = [];
  const sourceReferences = [];
  const assets = [];
  const workspaceCandidates = [];
  const ignored = [];

  for (const file of files) {
    const path = normalizePackagePath(file.path || '');
    if (!path) {
      findings.push(importFinding('error', 'export.package.import.file.path-unsafe', 'Unsafe package path was not imported.', { path: file.path || '' }));
      continue;
    }
    if (isControlFile(path)) continue;
    const entry = lookupManifestEntry(manifestIndex, file);
    if (file.kind === 'artifact-markdown') {
      records.push(recordFromArtifactFile(file, entry, findings));
    } else if (file.kind === 'source-reference') {
      const reference = sourceReferenceFromFile(file, entry, findings);
      if (reference) sourceReferences.push(reference);
    } else if (file.kind === 'asset-content') {
      assets.push(assetFromContentFile(file, entry, findings));
    } else if (file.kind === 'asset-metadata') {
      assets.push(assetFromMetadataFile(file, entry, findings));
    } else if (file.kind === 'workspace-candidate') {
      workspaceCandidates.push(workspaceCandidateFromFile(file, entry, findings));
    } else {
      ignored.push({ path, kind: file.kind || 'unknown' });
      findings.push(importFinding('info', 'export.package.import.file.ignored', 'Package file kind is not materialized by the import contract.', { path, kind: file.kind || '' }));
    }
  }

  const counts = Object.freeze({
    files: files.length,
    importedRecords: records.length,
    sourceReferences: sourceReferences.length,
    assets: assets.length,
    metadataOnlyAssets: assets.filter((asset) => asset.previewState === 'metadata-only').length,
    workspaceCandidates: workspaceCandidates.length,
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
    boundary: 'Import plan only. It reads a package file map, materializes bundled local drafts/assets as browser-local/session material, preserves source-backed records as references, and performs no remote fetch or source mutation.',
    importPolicy: 'Local artifact Markdown may become local/session records. Source-backed package entries remain source references. Assets remain assets. Workspace candidates remain context descriptors until explicit Open/Merge.',
    manifest,
    receipt,
    contract,
    inspection,
    counts,
    records: Object.freeze(records),
    sourceReferences: Object.freeze(sourceReferences),
    assets: Object.freeze(assets),
    workspaceCandidates: Object.freeze(workspaceCandidates),
    ignored: Object.freeze(ignored),
    findings: Object.freeze(findings)
  });
}

export function buildExportPackageApplyResult(bundle = {}, input = {}) {
  const importPlan = input.importPlan || buildExportPackageImportPlan(bundle, input);
  const errors = importPlan.findings.filter((finding) => finding.severity === 'error').map(toAdapterFinding);
  const warnings = importPlan.findings.filter((finding) => finding.severity === 'warning').map(toAdapterFinding);
  const adapterResult = makeAdapterResult({
    adapterId: EXPORT_PACKAGE_IMPORT_ADAPTER_ID,
    sourceId: `package:${importPlan.packageId || 'unknown'}`,
    records: importPlan.status === 'blocked' && input.allowBlocked !== true ? [] : importPlan.records,
    assets: importPlan.status === 'blocked' && input.allowBlocked !== true ? [] : importPlan.assets,
    workspaceEntries: [],
    errors,
    warnings,
    diagnostics: {
      sourceBoundary: 'local-session-package-import',
      packageId: importPlan.packageId || '',
      sourceReferenceCount: importPlan.counts.sourceReferences,
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
    boundary: 'Apply result is adapter-shaped for local records/assets only. Source references and workspace candidates are returned as descriptors and are not converted into local leaves or guessed sources.',
    importPlan,
    adapterResult,
    sourceReferences: importPlan.sourceReferences,
    workspaceCandidates: importPlan.workspaceCandidates,
    counts: Object.freeze({
      records: adapterResult.records.length,
      assets: adapterResult.assets.length,
      sourceReferences: importPlan.sourceReferences.length,
      workspaceCandidates: importPlan.workspaceCandidates.length,
      errors: errors.length,
      warnings: warnings.length
    })
  });
}

function readControlFiles(files = []) {
  const control = {};
  for (const file of files) {
    const path = String(file.path || '');
    if (path === 'tiinex.package/manifest.json') control.manifest = parseJsonFile(file);
    else if (path === 'tiinex.package/receipt.json') control.receipt = parseJsonFile(file);
    else if (path === 'tiinex.package/contract.json') control.contract = parseJsonFile(file);
    else if (path === 'tiinex.package/index.json') control.index = parseJsonFile(file);
    else if (path === 'tiinex.package/build-receipt.json') control.buildReceipt = parseJsonFile(file);
  }
  return control;
}

function indexManifestEntries(manifest = {}) {
  const index = new Map();
  const material = manifest.material || {};
  for (const group of ['localDrafts', 'sourceReferences', 'assets', 'workspaceContextCandidates', 'blocked']) {
    for (const entry of material[group] || []) {
      for (const key of [entry.id, entry.path, entry.packagePath]) {
        if (key) index.set(String(key), entry);
      }
    }
  }
  return index;
}

function lookupManifestEntry(index, file = {}) {
  for (const key of [file.entryId, file.path, stripKnownPackagePrefix(file.path || '')]) {
    if (key && index.has(String(key))) return index.get(String(key));
  }
  return null;
}

function recordFromArtifactFile(file = {}, entry = {}, findings = []) {
  const markdown = String(file.content || '');
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

function sourceReferenceFromFile(file = {}, entry = {}, findings = []) {
  const parsed = parseJsonFile(file);
  if (!parsed) {
    findings.push(importFinding('error', 'export.package.import.source-reference.invalid-json', 'Source reference package entry could not be parsed.', { path: file.path || '' }));
    return null;
  }
  const target = parsed.target || entry?.target || {};
  const status = parsed.status || entry?.status || 'degraded-reference';
  if (!target.repo || !target.path) findings.push(importFinding('warning', 'export.package.import.source-reference.incomplete', 'Source reference is incomplete and remains degraded.', { path: file.path || '', repo: target.repo || '' }));
  return Object.freeze({
    schema: 'tiinex.export.package.import.source-reference.v1',
    id: parsed.id || entry?.id || file.entryId || file.path || '',
    title: parsed.title || entry?.title || 'Source reference',
    status,
    boundary: parsed.boundary || entry?.boundary || 'Imported package source reference. It is not materialized as a local leaf and requires explicit source access to reload.',
    target: Object.freeze({ adapterId: target.adapterId || entry?.adapterId || '', repo: target.repo || entry?.repo || '', ref: target.ref || entry?.ref || '', path: normalizeMaterialPath(target.path || entry?.path || '') }),
    packagePath: file.path || ''
  });
}

function assetFromContentFile(file = {}, entry = {}, findings = []) {
  const path = normalizeMaterialPath(entry?.path || stripKnownPackagePrefix(file.path || '') || file.path || 'asset');
  const content = String(file.content || '');
  if (!content) findings.push(importFinding('warning', 'export.package.import.asset.content-empty', 'Asset content entry was empty.', { path }));
  return Object.freeze({
    schema: 'tiinex.local.asset.v1',
    id: `asset:package:${entry?.id || path}`,
    path,
    name: fileName(path),
    type: entry?.mediaType || file.mediaType || 'application/octet-stream',
    size: Number(file.bytes || content.length || 0),
    content,
    dataUrl: '',
    previewState: 'available',
    sourceMode: 'package-import-asset',
    source: makePackageLocalSource(path),
    packageEntryId: entry?.id || file.entryId || '',
    packagePath: file.path || ''
  });
}

function assetFromMetadataFile(file = {}, entry = {}, findings = []) {
  const parsed = parseJsonFile(file) || {};
  const path = normalizeMaterialPath(parsed.path || entry?.path || stripKnownPackagePrefix(file.path || '') || file.path || 'asset');
  findings.push(importFinding('warning', 'export.package.import.asset.metadata-only', 'Asset imported as metadata-only; content requires reselection or source access.', { path }));
  return Object.freeze({
    schema: 'tiinex.local.asset.v1',
    id: `asset:package:${parsed.id || entry?.id || path}`,
    path,
    name: parsed.title || fileName(path),
    type: parsed.mediaType || entry?.mediaType || 'application/octet-stream',
    size: 0,
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
  findings.push(importFinding('info', 'export.package.import.workspace-candidate.descriptor-only', 'Workspace candidate imported as descriptor only until explicit Open/Merge.', { path }));
  return Object.freeze({
    schema: 'tiinex.export.package.import.workspace-candidate.v1',
    id: parsed.id || entry?.id || path,
    title: parsed.title || entry?.title || fileName(path),
    path,
    status: parsed.status || entry?.status || 'open-or-merge-required',
    boundary: parsed.boundary || entry?.boundary || 'Package workspace candidate descriptor; not a leaf and not opened/merged automatically.',
    packagePath: file.path || ''
  });
}

function parseJsonFile(file = {}) {
  try {
    return JSON.parse(String(file.content || '{}'));
  } catch (_) {
    return null;
  }
}

function isControlFile(path = '') {
  return String(path || '').startsWith('tiinex.package/');
}

function stripKnownPackagePrefix(path = '') {
  const clean = normalizePackagePath(path);
  return clean
    .replace(/^artifacts\//, '')
    .replace(/^assets\//, '')
    .replace(/^sources\//, '')
    .replace(/^metadata\//, '')
    .replace(/^context\//, '')
    .replace(/\.asset\.json$/i, '')
    .replace(/\.json$/i, '');
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

function normalizeMaterialPath(path = '') {
  return normalizePackagePath(path) || 'entry';
}

function fileName(path = '') {
  return String(path || '').split('/').filter(Boolean).pop() || 'entry';
}

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

function toAdapterFinding(finding = {}) {
  return { code: finding.code || 'export.package.import.finding', message: finding.message || String(finding.code || 'Import finding'), ref: finding.path || finding.recordId || finding.assetId || '' };
}

function pickFindingExtra(item = {}) {
  const out = {};
  for (const key of ['path', 'kind', 'repo', 'recordId', 'assetId', 'packageId']) {
    if (item[key]) out[key] = item[key];
  }
  return out;
}

function importFinding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}
