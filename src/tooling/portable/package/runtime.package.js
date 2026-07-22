import { buildExportPackageApplyResult, buildExportPackageImportPlan } from '../../../export/package.apply.js';
import { buildExportPackageBundle, inspectExportPackageBundle } from '../../../export/package.builder.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';

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
  const manifest = parseJsonContent(byPath.get('tiinex.package/manifest.json'));
  const receipt = parseJsonContent(byPath.get('tiinex.package/receipt.json'));
  const contract = parseJsonContent(byPath.get('tiinex.package/contract.json'));
  const buildReceipt = parseJsonContent(byPath.get('tiinex.package/build-receipt.json'));
  if (!manifest) findings.push(portableFinding('error', 'portable.runtime-package.rehydrate.manifest-missing', 'Serialized runtime package files are missing a readable manifest control file.'));
  const entryIndex = manifestEntryIndex(manifest || {});
  const files = suppliedFiles.map((file) => rehydratedFile(file, entryIndex)).filter((file) => file.path);
  const bundle = Object.freeze({
    schema: 'tiinex.export.package.bundle.v1',
    packageId: String(manifest?.packageId || receipt?.packageId || ''),
    builtAt: String(buildReceipt?.builtAt || receipt?.at || ''),
    status: String(manifest?.status || 'degraded'),
    boundary: 'Rehydrated from explicitly supplied serialized package files. No remote fetch, source mutation, or received-code execution occurred.',
    packageFingerprint: '',
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
    title: String(input.title || input.workspaceTitle || 'Portable runtime package'),
    records: Object.freeze(records),
    assets: Object.freeze(assets),
    workspaceMergeCandidates: Object.freeze(workspaceCandidates)
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
  const importedByPath = new Map((importPlan.records || []).map((record) => [normalizePath(record.path), record]));
  for (const file of artifactFiles) {
    const path = normalizePath(file.path).replace(/^artifacts\//, '');
    const imported = importedByPath.get(path);
    if (!imported) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.artifact.missing', 'A bundled local artifact did not materialize during import.', { ref: path }));
    else if (String(imported.markdown || '') !== String(file.content || '')) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.artifact.changed', 'A bundled local artifact changed during package import.', { ref: path }));
  }
  if ((importPlan.sourceReferences || []).length !== (bundle.files || []).filter((file) => file.kind === 'source-reference').length) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.source-reference.count', 'Source reference count changed during package import.'));
  if ((importPlan.records || []).some((record) => record.source?.adapterId === 'github')) findings.push(portableFinding('error', 'portable.runtime-package.roundtrip.github-inference', 'Package import incorrectly materialized a local record as GitHub-backed.'));
  return Object.freeze({
    schema: 'tiinex.portable.runtime-package.comparison.v1',
    status: findings.some((finding) => finding.severity === 'error') ? 'mismatch' : 'match',
    counts: Object.freeze({ artifacts: artifactFiles.length, importedRecords: importPlan.records?.length || 0, sourceReferences: importPlan.sourceReferences?.length || 0, assets: importPlan.assets?.length || 0 }),
    findings: Object.freeze(findings)
  });
}

function packageQualification(bundle = {}) {
  return Object.freeze({
    sharedRuntimeContract: bundle.schema === 'tiinex.export.package.bundle.v1',
    runtimeContractId: bundle.schema || 'tiinex.export.package.bundle.v1',
    canonicalPackageSchemaLocked: false,
    canonicalHandoffGenerated: false,
    inMemoryFileMap: true,
    remoteFetch: false,
    remoteWrite: false,
    sourceMutation: false,
    statement: 'This is the current Tiinex/site runtime export package contract. It is not presented as a locked canonical package or handoff schema.'
  });
}

function looksLikeSerializedPackage(files = []) {
  return Array.isArray(files) && files.some((file) => normalizePath(file.path || file.name || '') === 'tiinex.package/manifest.json');
}

function parseJsonContent(file = null) {
  if (!file) return null;
  try { return JSON.parse(String(file.content || file.markdown || '')); }
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
      const packagePath = normalizePath(entry.packagePath || '');
      if (packagePath) index.set(packagePath, Object.freeze({ ...entry, inferredKind: kind }));
    }
  }
  return index;
}

function rehydratedFile(file = {}, entryIndex = new Map()) {
  const path = normalizePath(file.path || file.name || '');
  const content = String(file.content ?? file.markdown ?? '');
  const entry = entryIndex.get(path) || null;
  const controlKinds = {
    'tiinex.package/index.json': 'package-index',
    'tiinex.package/manifest.json': 'package-manifest',
    'tiinex.package/receipt.json': 'package-receipt',
    'tiinex.package/build-receipt.json': 'package-build-receipt',
    'tiinex.package/contract.json': 'package-contract',
    'tiinex.package/findings.json': 'package-findings'
  };
  let kind = controlKinds[path] || entry?.inferredKind || String(file.kind || 'unknown');
  if (kind === 'asset') kind = entry?.content?.available ? 'asset-content' : 'asset-metadata';
  return Object.freeze({
    path,
    kind,
    content,
    bytes: content.length,
    fingerprint: stableTextFingerprint(content),
    entryId: String(entry?.id || file.entryId || ''),
    title: String(entry?.title || file.title || ''),
    mediaType: String(entry?.mediaType || file.mediaType || file.type || ''),
    boundary: String(entry?.boundary || file.boundary || '')
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
