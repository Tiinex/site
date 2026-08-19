import { buildExportPackageApplyResult, buildExportPackageImportPlan } from '../../../export/package.apply.js';
import { buildExportPackageBundle, inspectExportPackageBundle } from '../../../export/package.builder.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { packageFileBytes, sha256Hex, stableFingerprintBytes, utf8Text } from '../../../export/package.bytes.js';
import { EXPORT_PACKAGE_CONTROL_PATHS, exportPackageControlKindForPath } from '../../../export/package.controlTopology.js';

export const PORTABLE_RUNTIME_PACKAGE_SCHEMA_ID = 'tiinex.portable.runtime-package.v1';
export const PORTABLE_RUNTIME_PACKAGE_ROUNDTRIP_SCHEMA_ID = 'tiinex.portable.runtime-package.roundtrip.v1';
export const PORTABLE_RUNTIME_PACKAGE_REHYDRATION_SCHEMA_ID = 'tiinex.portable.runtime-package.rehydration.v1';

export function buildPortableRuntimePackage(input = {}, options = {}) {
  const workspace = portableWorkspace(input);
  const bundle = buildExportPackageBundle(workspace, {
    records: workspace.records,
    assets: workspace.assets,
    workspaceCandidates: workspace.workspaceMergeCandidates,
    allowBlocked: input.allowBlocked === true || options.allowBlocked === true,
    includeDegraded: input.includeDegraded !== false && options.includeDegraded !== false,
    builtAt: input.builtAt || options.builtAt,
    clock: options.clock
  });
  const findings = [...(bundle.findings || [])];
  return Object.freeze({
    schema: PORTABLE_RUNTIME_PACKAGE_SCHEMA_ID,
    status: bundle.status,
    workspace: Object.freeze({ id: workspace.id, title: workspace.title, records: workspace.records.length, assets: workspace.assets.length, workspaceCandidates: workspace.workspaceMergeCandidates.length }),
    bundle,
    qualification: packageQualification(bundle),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function inspectPortableRuntimePackage(input = {}) {
  const bundle = input.bundle || input;
  const inspection = inspectExportPackageBundle(bundle);
  return Object.freeze({
    schema: 'tiinex.portable.runtime-package.inspection.v1',
    status: inspection.status,
    inspection,
    qualification: packageQualification(bundle),
    findings: inspection.findings,
    findingSummary: summarizePortableFindings(inspection.findings || [])
  });
}

export function rehydratePortableRuntimePackage(input = {}) {
  const suppliedFiles = Array.isArray(input.files) ? input.files : [];
  const findings = [];
  const byPath = new Map(suppliedFiles.map((file) => [normalizePath(file.path || file.name || ''), file]));
  const manifest = parseJsonContent(byPath.get(EXPORT_PACKAGE_CONTROL_PATHS.manifest));
  const receipt = parseJsonContent(byPath.get(EXPORT_PACKAGE_CONTROL_PATHS.receipt));
  const contract = parseJsonContent(byPath.get(EXPORT_PACKAGE_CONTROL_PATHS.contract));
  const buildReceipt = parseJsonContent(byPath.get(EXPORT_PACKAGE_CONTROL_PATHS.buildReceipt));
  const fileMap = parseJsonContent(byPath.get(EXPORT_PACKAGE_CONTROL_PATHS.fileMap));
  if (!manifest) findings.push(portableFinding('error', 'portable.runtime-package.rehydrate.manifest-missing', 'Serialized runtime package files are missing a readable manifest control file.'));
  const entryIndex = manifestEntryIndex(manifest || {});
  const fileMapIndex = durableFileMapIndex(fileMap || {});
  const files = suppliedFiles.map((file) => rehydratedFile(file, entryIndex, fileMapIndex)).filter((file) => file.path);
  const bundle = Object.freeze({
    schema: 'tiinex.export.package.bundle.v1',
    packageId: String(manifest?.packageId || receipt?.packageId || ''),
    builtAt: String(buildReceipt?.builtAt || receipt?.at || ''),
    status: String(manifest?.status || 'degraded'),
    boundary: 'Rehydrated from explicitly supplied serialized package files. No remote fetch, source mutation, or received-code execution occurred.',
    packageFingerprint: '',
    packageRepresentationSha256: String(fileMap?.representationSha256 || ''),
    fileMap: fileMap || null,
    contract: contract || {},
    manifest: manifest || {},
    receipt: receipt || {},
    buildReceipt: buildReceipt || {},
    counts: Object.freeze(packageFileCounts(files, findings)),
    files: Object.freeze(files),
    findings: Object.freeze(findings)
  });
  const inspection = inspectExportPackageBundle(bundle);
  const combinedFindings = [...findings, ...(inspection.findings || [])];
  return Object.freeze({
    schema: PORTABLE_RUNTIME_PACKAGE_REHYDRATION_SCHEMA_ID,
    status: inspection.status === 'valid' && !combinedFindings.some((finding) => finding.severity === 'error') ? 'rehydrated' : 'invalid',
    bundle,
    inspection,
    qualification: packageQualification(bundle),
    findings: Object.freeze(combinedFindings),
    findingSummary: summarizePortableFindings(combinedFindings)
  });
}

export function roundTripPortableRuntimePackage(input = {}, options = {}) {
  const rehydrated = !input.bundle && looksLikeSerializedPackage(input.files) ? rehydratePortableRuntimePackage(input) : null;
  const built = input.bundle
    ? Object.freeze({ bundle: input.bundle, status: input.bundle.status, qualification: packageQualification(input.bundle), findings: Object.freeze([]) })
    : rehydrated
      ? Object.freeze({ bundle: rehydrated.bundle, status: rehydrated.status, qualification: rehydrated.qualification, findings: rehydrated.findings })
      : buildPortableRuntimePackage(input, options);
  const bundle = built.bundle;
  const inspection = inspectExportPackageBundle(bundle);
  const importPlan = buildExportPackageImportPlan(bundle, { inspection });
  const applyResult = buildExportPackageApplyResult(bundle, { importPlan });
  const findings = [...(built.findings || []), ...(inspection.findings || []), ...(importPlan.findings || [])];
  const comparisons = compareRoundTrip(bundle, importPlan);
  findings.push(...comparisons.findings);
  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const status = errors ? 'failed' : bundle.status === 'ready' && importPlan.status === 'ready' && comparisons.status === 'match' ? 'passed' : 'passed-degraded';
  return Object.freeze({
    schema: PORTABLE_RUNTIME_PACKAGE_ROUNDTRIP_SCHEMA_ID,
    status,
    packageId: bundle.packageId || '',
    bundle,
    inspection,
    importPlan,
    applyResult,
    comparison: comparisons,
    qualification: packageQualification(bundle),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

function portableWorkspace(input = {}) {
  const session = input.session || input.snapshot || {};
  const materials = session.materials || input.materials || input;
  const staged = input.stagedArtifacts || session.stagedArtifacts || [];
  const records = dedupeRecords([
    ...(materials.records || input.records || []),
    ...staged.map(stagedRecord)
  ]);
  const assets = [...(materials.assets || input.assets || [])];
  const workspaceCandidates = [...(input.workspaceCandidates || input.workspaceMergeCandidates || [])];
  return Object.freeze({
    id: String(input.workspaceId || session.workspaceId || 'portable-runtime-package'),
    name: String(input.name || input.title || input.workspaceTitle || session.workspaceTitle || 'Portable runtime package'),
    title: String(input.title || input.workspaceTitle || session.workspaceTitle || 'Portable runtime package'),
    createdAt: String(input.createdAt || session.createdAt || ''),
    records: Object.freeze(records),
    assets: Object.freeze(assets),
    workspaceMergeCandidates: Object.freeze(workspaceCandidates),
    workspaceMarkdown: String(input.workspaceMarkdown || session.workspaceMarkdown || ''),
    workspaceImport: Object.freeze({ ...(session.workspaceImport || {}), ...(input.workspaceImport || {}) }),
    sources: Object.freeze([...(session.sources || input.sources || [])]),
    sourceOrder: Object.freeze([...(session.sourceOrder || input.sourceOrder || [])]),
    workspaceMemberBindings: Object.freeze([...(session.workspaceMemberBindings || input.workspaceMemberBindings || [])])
  });
}

function stagedRecord(artifact = {}) {
  return Object.freeze({
    id: artifact.id || artifact.path,
    title: artifact.title || titleFromMarkdown(artifact.markdown) || artifact.path || 'Staged artifact',
    path: artifact.path || 'draft.md',
    markdown: artifact.markdown || '',
    schemaId: artifact.schemaId || '',
    lifecycleStatus: artifact.lifecycleStatus || 'draft',
    sourceMode: artifact.sourceMode || 'local-portable-staged',
    source: Object.freeze({
      kind: 'local-session',
      adapterId: 'local',
      path: artifact.path || 'draft.md',
      boundary: 'Portable staged local artifact; no GitHub provenance inferred.',
      sourceBacked: false
    })
  });
}

function dedupeRecords(records) {
  const map = new Map();
  for (const record of records) {
    const key = String(record.id || record.path || `${record.title}:${map.size}`);
    const existing = map.get(key);
    if (!existing || (String(record.sourceMode || '').startsWith('local-portable-staged') && !String(existing.sourceMode || '').startsWith('local-portable-staged'))) map.set(key, Object.freeze({ ...record }));
  }
  return [...map.values()];
}

function compareRoundTrip(bundle, importPlan) {
  const findings = [];
  const artifactFiles = (bundle.files || []).filter((file) => file.kind === 'artifact-markdown');
  const importedByEntry = new Map((importPlan.records || []).map((record) => [String(record.packageEntryId || '').trim(), record]));
  for (const file of artifactFiles) {
    const entryId = String(file.entryId || '').trim();
    const imported = importedByEntry.get(entryId);
    if (!imported) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.artifact.missing', 'A governed bundled local artifact did not materialize during import.', { ref: entryId || file.path || '' }));
    else {
      const expected = typeof file.content === 'string' ? file.content : utf8Text(packageFileBytes(file));
      if (String(imported.markdown || '') !== expected) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.artifact.changed', 'A governed bundled local artifact changed during package import.', { ref: entryId || file.path || '' }));
    }
  }
  if ((importPlan.records || []).length !== artifactFiles.length) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.artifact.count', 'Governed local artifact cardinality changed during package import.'));
  const sourceFiles = (bundle.files || []).filter((file) => file.kind === 'source-reference' || file.kind === 'asset-source-reference');
  if ((importPlan.sourceReferences || []).length !== sourceFiles.length) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.source-reference.count', 'Source reference cardinality changed during package import.'));
  const assetFiles = (bundle.files || []).filter((file) => file.kind === 'asset-content' || file.kind === 'asset-metadata');
  if ((importPlan.assets || []).length !== assetFiles.length) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.asset.count', 'Owned/metadata asset cardinality changed during package import.'));
  for (const file of assetFiles.filter((item) => item.kind === 'asset-content')) {
    const asset = (importPlan.assets || []).find((item) => String(item.packageEntryId || '') === String(file.entryId || ''));
    if (!asset) continue;
    const expected = packageFileBytes(file);
    const actual = asset.bytes instanceof Uint8Array ? asset.bytes : packageFileBytes({ content: asset.content || '' });
    if (expected.byteLength !== actual.byteLength || sha256Hex(expected) !== sha256Hex(actual)) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.asset.changed', 'Owned asset bytes changed during package import.', { ref: file.entryId || file.path || '' }));
  }
  if ((importPlan.records || []).some((record) => record.source?.adapterId === 'github')) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.github-inference', 'Package import incorrectly materialized a local record as GitHub-backed.'));
  return Object.freeze({
    schema: 'tiinex.portable.runtime-package.comparison.v2',
    status: findings.some((finding) => finding.severity === 'error') ? 'mismatch' : 'match',
    counts: Object.freeze({ artifacts: artifactFiles.length, importedRecords: importPlan.records?.length || 0, sourceReferences: importPlan.sourceReferences?.length || 0, assets: importPlan.assets?.length || 0, workspaceContext: importPlan.counts?.workspaceContext || 0 }),
    findings: Object.freeze(findings)
  });
}

function packageQualification(bundle = {}) {
  return Object.freeze({
    sharedRuntimeContract: bundle.schema === 'tiinex.export.package.bundle.v1',
    runtimeContractId: bundle.schema || 'tiinex.export.package.bundle.v1',
    canonicalPackageSchemaLocked: false,
    canonicalHandoffGenerated: true,
    inMemoryFileMap: true,
    durableSerializedFileMap: Boolean(bundle.fileMap || (bundle.files || []).some((file) => normalizePath(file.path) === EXPORT_PACKAGE_CONTROL_PATHS.fileMap)),
    remoteFetch: false,
    remoteWrite: false,
    sourceMutation: false,
    statement: 'Operational Tiinex handoff package with durable representation-level file-map integrity. It is not tiinex.semantic.package.v1 and does not claim semantic ownership or external provenance.'
  });
}

function looksLikeSerializedPackage(files = []) {
  return Array.isArray(files) && files.some((file) => normalizePath(file.path || file.name || '') === EXPORT_PACKAGE_CONTROL_PATHS.manifest);
}

function parseJsonContent(file = null) {
  if (!file) return null;
  try { return JSON.parse(utf8Text(packageFileBytes(file))); }
  catch { return null; }
}

function manifestEntryIndex(manifest = {}) {
  const index = new Map();
  const groups = [
    ['localDrafts', 'artifact-markdown'],
    ['sourceReferences', 'source-reference'],
    ['assets', 'asset'],
    ['workspaceContextCandidates', 'workspace-candidate']
  ];
  for (const [group, kind] of groups) {
    for (const entry of manifest.material?.[group] || []) {
      for (const packagePath of [entry.packagePath, ...(entry.packagePaths || [])].filter(Boolean)) index.set(normalizePath(packagePath), Object.freeze({ ...entry, inferredKind: kind }));
    }
  }
  const context = manifest.material?.workspaceContext;
  if (context) {
    for (const packagePath of [context.packagePath, ...(context.packagePaths || [])].filter(Boolean)) index.set(normalizePath(packagePath), Object.freeze({ ...context, inferredKind: packagePath.endsWith('.md') ? 'workspace-context-markdown' : 'workspace-context' }));
  }
  return index;
}

function durableFileMapIndex(fileMap = {}) {
  const index = new Map();
  for (const entry of fileMap.entries || []) if (entry?.path) index.set(normalizePath(entry.path), entry);
  return index;
}

function rehydratedFile(file = {}, entryIndex = new Map(), fileMapIndex = new Map()) {
  const path = normalizePath(file.path || file.name || '');
  const data = packageFileBytes(file);
  const entry = entryIndex.get(path) || null;
  const durable = fileMapIndex.get(path) || null;
  let kind = exportPackageControlKindForPath(path) || durable?.kind || entry?.inferredKind || String(file.kind || 'unknown');
  if (kind === 'asset') kind = entry?.status === 'source-reference' ? 'asset-source-reference' : entry?.content?.available ? 'asset-content' : 'asset-metadata';
  const mediaType = String(durable?.mediaType || entry?.mediaType || file.mediaType || file.type || '');
  const textual = kind.includes('json') || kind.includes('markdown') || /^text\//i.test(mediaType) || /json|markdown/i.test(mediaType);
  return Object.freeze({
    path,
    requestedPath: String(durable?.requestedPath || path),
    kind,
    ...(textual ? { content: typeof file.content === 'string' ? file.content : utf8Text(data) } : {}),
    data,
    bytes: data.byteLength,
    sha256: sha256Hex(data),
    fingerprint: stableFingerprintBytes(data),
    entryId: String(durable?.entryId || entry?.id || file.entryId || ''),
    logicalKind: String(durable?.logicalKind || ''),
    title: String(entry?.title || file.title || ''),
    mediaType,
    boundary: String(durable?.boundary || entry?.boundary || file.boundary || ''),
    sourceBoundary: String(durable?.sourceBoundary || '')
  });
}

function packageFileCounts(files = [], findings = []) {
  return {
    files: files.length,
    controlFiles: files.filter((file) => file.path.startsWith('tiinex.package/')).length,
    materialFiles: files.filter((file) => !file.path.startsWith('tiinex.package/')).length,
    localDraftFiles: files.filter((file) => file.kind === 'artifact-markdown').length,
    sourceReferenceFiles: files.filter((file) => file.kind === 'source-reference').length,
    assetContentFiles: files.filter((file) => file.kind === 'asset-content').length,
    assetMetadataFiles: files.filter((file) => file.kind === 'asset-metadata').length,
    assetReferenceFiles: files.filter((file) => file.kind === 'asset-source-reference').length,
    workspaceContextFiles: files.filter((file) => file.kind === 'workspace-context' || file.kind === 'workspace-context-markdown').length,
    workspaceCandidateFiles: files.filter((file) => file.kind === 'workspace-candidate').length,
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length,
    findings: findings.length
  };
}

function stableTextFingerprint(value = '') {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `tixfp1-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function titleFromMarkdown(markdown = '') {
  const match = String(markdown || '').match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || '';
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, ''); }
