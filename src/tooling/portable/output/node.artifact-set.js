import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createDeterministicStoredZip, safeZipPath } from './deterministic.zip.js';
import { normalizeLiveProtocol, verifyLiveOperationReceipts } from '../live/live.protocol.js';

export const PORTABLE_ARTIFACT_SET_MANIFEST_SCHEMA_ID = 'tiinex.portable.changeset.manifest.v1';
export const PORTABLE_ARTIFACT_SET_CHECKSUM_SCHEMA_ID = 'tiinex.portable.changeset.checksums.v1';
export const PORTABLE_ARTIFACT_SET_WRITE_RECEIPT_SCHEMA_ID = 'tiinex.portable.artifact-set.write-receipt.v1';

export async function writePortableArtifactSet(result = {}, outputDir = '', options = {}) {
  requireClean(result);
  const root = path.resolve(String(outputDir || '').trim());
  if (!outputDir) throw new Error('portable.artifact-set.output-dir.required');
  const artifacts = normalizeCreatedArtifacts(result.artifacts || []);
  await mkdir(root, { recursive: true });
  const receipts = [];
  for (const artifact of artifacts) {
    const target = safeOutputPath(root, artifact.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, artifact.content, { flag: options.overwrite === true ? 'w' : 'wx' });
    receipts.push(Object.freeze({ path: artifact.path, outputPath: target, bytes: artifact.bytes, sha256: artifact.sha256, schemaId: artifact.schemaId, proposalId: artifact.proposalId }));
  }
  const bundleReceipt = options.bundlePath ? await writePortableArtifactSetBundle(result, options.bundlePath, options) : null;
  return Object.freeze({
    schema: PORTABLE_ARTIFACT_SET_WRITE_RECEIPT_SCHEMA_ID,
    version: 1,
    status: 'written-local-clean',
    outputDir: root,
    artifacts: Object.freeze(receipts),
    bundleReceipt,
    boundary: Object.freeze({ localOutput: true, sourceMutation: false, remoteWrite: false, overwrite: options.overwrite === true })
  });
}

export async function writePortableArtifactSetBundle(result = {}, outputPath = '', options = {}) {
  requireClean(result);
  const target = path.resolve(String(outputPath || '').trim());
  if (!outputPath) throw new Error('portable.artifact-set.bundle-output.required');
  const created = normalizeCreatedArtifacts(result.artifacts || []);
  const contextAll = normalizeContextArtifacts(result.lineageClosure?.context || []);
  const context = options.includeContext === false ? [] : contextAll;
  const assets = normalizeAssets(result, options, created);
  const materialEntries = uniqueMaterialEntries([...created, ...context, ...assets]);
  const byPath = new Map([...created, ...contextAll, ...assets].map((entry) => [entry.path, entry]));
  const includedPaths = new Set(materialEntries.map((entry) => entry.path));
  const knownParents = normalizeKnownParents(result.lineageClosure?.edges || [], byPath, includedPaths);
  const liveOperations = normalizeLiveOperations(result.operationReceipt);
  const manifest = Object.freeze({
    schema: PORTABLE_ARTIFACT_SET_MANIFEST_SCHEMA_ID,
    version: 1,
    status: 'ready',
    profile: 'changeset-with-minimum-lineage-closure',
    material: Object.freeze(materialEntries.map(({ content, ...entry }) => entry)),
    lineage: Object.freeze({
      closurePolicy: options.includeContext === false ? 'checksums-only' : 'minimum-known-parent-closure',
      knownParents: Object.freeze(knownParents)
    }),
    ...(liveOperations ? { liveOperations } : {}),
    boundary: Object.freeze({
      localDrafts: true,
      sourceMutation: false,
      remoteWrite: false,
      bootstrapIncluded: false,
      qualifiedEvidenceIncluded: false,
      contextArtifactsUnchanged: true,
      assetsColocatedUnlessExplicitPath: true
    }),
    statement: 'This portable changeset contains created/modified material plus the minimum known Parent closure. Known Parent checksums remain in the manifest even when context files are omitted or deduplicated during merge.'
  });
  const manifestBytes = Buffer.from(stableJson(manifest), 'utf8');
  const checksumFiles = [
    ...materialEntries.map((entry) => Object.freeze({ path: entry.path, bytes: entry.bytes, sha256: entry.sha256 })),
    Object.freeze({ path: 'manifest.json', bytes: manifestBytes.length, sha256: sha256(manifestBytes) })
  ];
  const checksums = Object.freeze({ schema: PORTABLE_ARTIFACT_SET_CHECKSUM_SCHEMA_ID, version: 1, algorithm: 'sha256', files: Object.freeze(checksumFiles) });
  const archive = createDeterministicStoredZip([
    ...materialEntries.map((entry) => ({ name: entry.path, data: entry.content })),
    { name: 'manifest.json', data: manifestBytes },
    { name: 'checksums.json', data: stableJson(checksums) }
  ]);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, archive, { flag: options.overwrite === true ? 'w' : 'wx' });
  return Object.freeze({
    schema: 'tiinex.portable.changeset.bundle-receipt.v1',
    version: 1,
    status: 'written-local-changeset',
    outputPath: target,
    bytes: archive.length,
    sha256: sha256(archive),
    artifacts: created.length,
    contextArtifacts: context.length,
    assets: assets.length,
    knownParents: knownParents.length,
    liveOperationReceipts: liveOperations?.receipts?.length || 0,
    files: materialEntries.length + 2,
    profile: manifest.profile
  });
}

export async function verifyPortableArtifactSetDirectory(rootPath = '') {
  const root = path.resolve(String(rootPath || '').trim());
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  const checksums = JSON.parse(await readFile(path.join(root, 'checksums.json'), 'utf8'));
  const findings = [];
  if (manifest.schema !== PORTABLE_ARTIFACT_SET_MANIFEST_SCHEMA_ID) findings.push({ code: 'portable.artifact-set.manifest.schema', severity: 'error' });
  if (checksums.schema !== PORTABLE_ARTIFACT_SET_CHECKSUM_SCHEMA_ID) findings.push({ code: 'portable.artifact-set.checksums.schema', severity: 'error' });
  for (const entry of checksums.files || []) {
    const bytes = await readFile(safeOutputPath(root, entry.path));
    if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) findings.push({ code: 'portable.artifact-set.checksum.mismatch', severity: 'error', path: entry.path });
  }
  return Object.freeze({ schema: 'tiinex.portable.changeset.verification.v1', status: findings.length ? 'invalid' : 'valid', artifacts: (manifest.material || []).filter((entry) => entry.kind === 'artifact' && entry.role !== 'context').length, knownParents: manifest.lineage?.knownParents?.length || 0, findings: Object.freeze(findings) });
}

function normalizeLiveOperations(value) {
  if (!value) return null;
  const findings = [];
  const receipts = verifyLiveOperationReceipts(value.receipts || [], value, findings);
  const protocol = normalizeLiveProtocol(value, receipts, findings);
  if (findings.some((finding) => finding.severity === 'error')) throw new Error(`portable.artifact-set.live-operation-receipt.invalid:${findings.map((finding) => finding.code).join(',')}`);
  if (!receipts.some((entry) => entry.operation === 'export-live-lineage')) throw new Error('portable.artifact-set.live-operation-export-receipt.required');
  return Object.freeze({
    schema: String(value.schema || ''),
    version: Number(value.version || 1),
    sessionId: protocol.sessionId,
    stateRevision: protocol.stateRevision,
    latestEventSequence: protocol.latestEventSequence,
    preparedEventSequence: protocol.preparedEventSequence,
    latestTurnSequence: protocol.latestTurnSequence,
    preparedTurnSequence: protocol.preparedTurnSequence,
    exportCount: protocol.exportCount,
    receiptChainHead: protocol.receiptChainHead,
    counts: Object.freeze({ ...(value.counts || {}) }),
    receipts: Object.freeze(receipts),
    boundary: Object.freeze({ ...(value.boundary || {}) })
  });
}

function normalizeCreatedArtifacts(entries = []) {
  return entries.map((entry) => {
    const draft = entry.draft || entry.result?.draft || {};
    const artifactPath = safeMaterialPath(draft.path || 'artifact.trace.md');
    if (!artifactPath.toLowerCase().endsWith('.trace.md')) throw new Error(`portable.artifact-set.path.invalid:${draft.path || ''}`);
    const content = Buffer.from(normalizeMarkdown(draft.markdown), 'utf8');
    return Object.freeze({
      proposalId: String(entry.proposalId || draft.id || artifactPath),
      parentProposalId: String(entry.parentProposalId || ''),
      parentLoadedRef: String(entry.parentLoadedRef || ''),
      path: artifactPath,
      kind: 'artifact',
      role: String(draft.changeRole || 'created'),
      schemaId: String(draft.schemaId || ''),
      baseSha256: String(draft.baseSha256 || ''),
      content,
      bytes: content.length,
      sha256: sha256(content)
    });
  });
}
function normalizeContextArtifacts(entries = []) {
  return entries.map((entry) => {
    const artifactPath = safeMaterialPath(entry.path);
    const content = Buffer.from(String(entry.markdown || ''), 'utf8');
    return Object.freeze({ id: String(entry.id || artifactPath), path: artifactPath, kind: 'artifact', role: 'context', schemaId: String(entry.schemaId || ''), content, bytes: content.length, sha256: sha256(content) });
  });
}
function normalizeAssets(result, options, created) {
  const source = [...(Array.isArray(result.assets) ? result.assets : []), ...(Array.isArray(options.assets) ? options.assets : [])];
  const createdByProposal = new Map(created.map((entry) => [entry.proposalId, entry]));
  return source.filter((entry) => entry && typeof entry === 'object' && (String(entry.path || '').trim() || String(entry.content ?? entry.data ?? '').length || Number(entry.bytes || 0) > 0)).map((entry, index) => {
    const owner = createdByProposal.get(String(entry.artifactProposalId || entry.ownerProposalId || '')) || created[0];
    const assetPath = entry.path ? safeMaterialPath(entry.path) : colocatedAssetPath(owner?.path || '', entry.slug || `asset-${index + 1}`, entry.extension || extensionFromType(entry.type));
    const content = bytesFrom(entry.content ?? entry.data ?? entry.bytes ?? '');
    return Object.freeze({ path: assetPath, kind: 'asset', role: String(entry.role || 'created'), mediaType: String(entry.type || ''), ownerArtifactPath: owner?.path || '', content, bytes: content.length, sha256: sha256(content) });
  });
}
function normalizeKnownParents(edges, byPath, includedPaths) {
  const output = [];
  for (const edge of edges) {
    const parentPath = safeMaterialPath(edge.parentPath);
    const childPath = safeMaterialPath(edge.childPath);
    const parent = byPath.get(parentPath);
    if (!parent) throw new Error(`portable.artifact-set.parent-bytes.unavailable:${parentPath}`);
    output.push(Object.freeze({ childPath, parentPath, path: parentPath, schemaId: parent.schemaId || '', sha256: parent.sha256, bytes: parent.bytes, included: includedPaths.has(parentPath), role: parent.role }));
  }
  const map = new Map();
  for (const entry of output) map.set(`${entry.childPath}\0${entry.parentPath}`, entry);
  return [...map.values()].sort((a, b) => `${a.childPath}\0${a.parentPath}`.localeCompare(`${b.childPath}\0${b.parentPath}`));
}
function uniqueMaterialEntries(entries) {
  const map = new Map();
  for (const entry of entries) {
    const previous = map.get(entry.path);
    if (previous && previous.sha256 !== entry.sha256) throw new Error(`portable.artifact-set.path.collision:${entry.path}`);
    if (!previous || previous.role === 'context') map.set(entry.path, entry);
  }
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
}
function colocatedAssetPath(artifactPath, slug, extension) {
  if (!artifactPath) throw new Error('portable.artifact-set.asset-owner.required');
  const cleanSlug = String(slug || 'asset').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';
  const ext = String(extension || 'bin').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'bin';
  const stem = artifactPath.replace(/\.trace\.md$/i, '').replace(/\.md$/i, '');
  return safeMaterialPath(`${stem}-${cleanSlug}.${ext}`);
}
function extensionFromType(type = '') { return ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' })[String(type || '').toLowerCase()] || 'bin'; }
function safeMaterialPath(value) {
  const clean = safeZipPath(value);
  if (!clean || clean === '.bootstrap' || clean.startsWith('.bootstrap/')) throw new Error(`portable.artifact-set.path.reserved:${value}`);
  return clean;
}
function safeOutputPath(root, relative) {
  const clean = safeMaterialPath(relative);
  const target = path.resolve(root, clean);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error(`portable.artifact-set.path.escape:${relative}`);
  return target;
}
function requireClean(result) { if (result?.status !== 'created-clean') throw new Error(`portable.artifact-set.not-clean:${result?.status || 'unknown'}`); }
function bytesFrom(value) { if (Buffer.isBuffer(value)) return Buffer.from(value); if (value instanceof Uint8Array) return Buffer.from(value); if (value instanceof ArrayBuffer) return Buffer.from(new Uint8Array(value)); return Buffer.from(String(value ?? ''), 'utf8'); }
function normalizeMarkdown(value = '') { return `${String(value || '').replace(/\r\n/g, '\n').replace(/\s+$/u, '')}\n`; }
function stableJson(value) { return `${JSON.stringify(sortValue(value), null, 2)}\n`; }
function sortValue(value) { if (Array.isArray(value)) return value.map(sortValue); if (!value || typeof value !== 'object') return value; const out = {}; for (const key of Object.keys(value).sort()) out[key] = sortValue(value[key]); return out; }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
