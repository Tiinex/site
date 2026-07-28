import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDeterministicStoredZip, safeZipPath } from './deterministic.zip.js';

export const PORTABLE_ARTIFACT_RESULT_PACKAGE_SCHEMA_ID = 'tiinex.portable.artifact-result-package.v1';
export const PORTABLE_ARTIFACT_CREATION_RECEIPT_SCHEMA_ID = 'tiinex.portable.artifact-creation-receipt.v1';
export const PORTABLE_ARTIFACT_INPUT_SNAPSHOT_SCHEMA_ID = 'tiinex.portable.artifact-input-snapshot.v1';
export const PORTABLE_ARTIFACT_OPERATION_RECEIPT_SCHEMA_ID = 'tiinex.portable.artifact-operation-receipt.v1';
export const PORTABLE_ARTIFACT_RESULT_CHECKSUM_SCHEMA_ID = 'tiinex.portable.artifact-result-checksums.v1';
export const PORTABLE_ARTIFACT_RESULT_WRITE_RECEIPT_SCHEMA_ID = 'tiinex.portable.artifact-result-package-write-receipt.v1';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const RESULT_VERIFIER_SOURCE = path.resolve(MODULE_DIR, '../bootstrap/artifact.result.selfverify.mjs');

export async function writePortableArtifactResultPackage(result = {}, outputPath = '', context = {}) {
  const target = path.resolve(String(outputPath || '').trim());
  if (!String(outputPath || '').trim()) throw new Error('portable.artifact-result.path.required');
  assertCleanCreation(result, context.writeReceipt);

  const createdAt = normalizeCreatedAt(context.createdAt);
  const artifact = normalizeMarkdown(result.draft.markdown);
  const artifactSha256 = sha256(artifact);
  const inputSnapshot = buildInputSnapshot(context.creationInput || {}, createdAt);
  const inputSnapshotBytes = stableJson(inputSnapshot);
  const inputSnapshotSha256 = sha256(inputSnapshotBytes);
  const operationReceipt = buildOperationReceipt(result, artifactSha256, createdAt);
  const operationReceiptBytes = stableJson(operationReceipt);
  const writeReceipt = cloneJson(context.writeReceipt);
  const writeReceiptBytes = stableJson(writeReceipt);
  const transferManifest = requireObject(context.transferManifest, 'portable.artifact-result.transfer-manifest.required');
  const bootstrapManifest = requireObject(context.bootstrapManifest, 'portable.artifact-result.bootstrap-manifest.required');
  const transferVerification = requireValidVerification(context.transferVerification, 'tiinex.llm.transfer.verification.v1', 'portable.artifact-result.transfer-verification');
  const bootstrapVerification = requireValidVerification(context.bootstrapVerification, ['tiinex.bootstrap.verification.v2', 'tiinex.bootstrap.archive-verification.v2'], 'portable.artifact-result.bootstrap-verification');
  const taskRequest = normalizeMarkdown(String(context.taskRequest || '').trim());
  if (!String(context.taskRequest || '').trim()) throw new Error('portable.artifact-result.task-request.required');
  const transferManifestBytes = stableJson(transferManifest);
  const bootstrapManifestBytes = stableJson(bootstrapManifest);
  const transferVerificationBytes = exactJsonBytes(context.transferVerificationBytes, transferVerification, 'portable.artifact-result.transfer-verification-bytes');
  const bootstrapVerificationBytes = exactJsonBytes(context.bootstrapVerificationBytes, bootstrapVerification, 'portable.artifact-result.bootstrap-verification-bytes');
  const identities = qualifyContextIdentities({ transferManifest, bootstrapManifest, transferVerification, bootstrapVerification, transferVerificationBytes, bootstrapVerificationBytes, taskRequest });

  const creationReceipt = Object.freeze({
    schema: PORTABLE_ARTIFACT_CREATION_RECEIPT_SCHEMA_ID,
    version: 1,
    status: 'packaged-local-clean',
    createdAt,
    operation: 'create-local-draft',
    artifact: Object.freeze({
      packagePath: 'artifact.trace.md',
      logicalPath: String(result.draft.path || ''),
      schemaId: String(result.draft.schemaId || result.schemaId || ''),
      bytes: Buffer.byteLength(artifact, 'utf8'),
      sha256: artifactSha256,
      validationStatus: String(result.validation?.status || '')
    }),
    inputSnapshot: Object.freeze({
      packagePath: 'artifact.input.snapshot.json',
      sha256: inputSnapshotSha256
    }),
    operationReceipt: Object.freeze({
      packagePath: 'artifact.operation.receipt.json',
      sha256: sha256(operationReceiptBytes),
      status: operationReceipt.status
    }),
    writeReceipt: Object.freeze({
      packagePath: 'artifact.write.receipt.json',
      sha256: sha256(writeReceiptBytes),
      status: String(writeReceipt.status || '')
    }),
    context: identities,
    boundary: Object.freeze({
      localDraft: true,
      sourceBacked: false,
      sourceMutation: false,
      remoteWrite: false,
      publication: false,
      handoffAuthority: false
    })
  });
  const creationReceiptBytes = stableJson(creationReceipt);
  const verifier = await readFile(RESULT_VERIFIER_SOURCE);

  const manifest = Object.freeze({
    schema: PORTABLE_ARTIFACT_RESULT_PACKAGE_SCHEMA_ID,
    version: 1,
    boundary: 'Local Tiinex artifact plus durable creation evidence. This package is not publication, source authority, or a handoff claim.',
    entrypoints: Object.freeze({
      artifact: 'artifact.trace.md',
      creationReceipt: 'artifact.creation.receipt.json',
      inputSnapshot: 'artifact.input.snapshot.json',
      operationReceipt: 'artifact.operation.receipt.json',
      writeReceipt: 'artifact.write.receipt.json',
      verifier: 'bin/verify-result.mjs',
      checksums: 'checksums.json'
    }),
    artifact: creationReceipt.artifact,
    evidence: Object.freeze({
      creationReceipt: Object.freeze({ path: 'artifact.creation.receipt.json', sha256: sha256(creationReceiptBytes) }),
      inputSnapshot: creationReceipt.inputSnapshot,
      operationReceipt: creationReceipt.operationReceipt,
      writeReceipt: creationReceipt.writeReceipt,
      taskRequest: Object.freeze({ path: 'context/task.request.txt', sha256: sha256(taskRequest) }),
      transferManifest: Object.freeze({ path: 'context/transfer.manifest.json', sha256: sha256(transferManifestBytes) }),
      bootstrapManifest: Object.freeze({ path: 'context/bootstrap.manifest.json', sha256: sha256(bootstrapManifestBytes) }),
      transferVerification: Object.freeze({ path: 'verification/transfer.json', sha256: sha256(transferVerificationBytes), status: transferVerification.status }),
      bootstrapVerification: Object.freeze({ path: 'verification/bootstrap.json', sha256: sha256(bootstrapVerificationBytes), status: bootstrapVerification.status })
    }),
    context: identities,
    trust: Object.freeze({
      artifactCodeExecution: 'never-auto-execute',
      verifierExecution: 'allowed',
      sourceMutation: false,
      remoteWrite: false
    })
  });

  const baseEntries = [
    fileEntry('artifact.trace.md', artifact),
    fileEntry('artifact.creation.receipt.json', creationReceiptBytes),
    fileEntry('artifact.input.snapshot.json', inputSnapshotBytes),
    fileEntry('artifact.operation.receipt.json', operationReceiptBytes),
    fileEntry('artifact.write.receipt.json', writeReceiptBytes),
    fileEntry('context/task.request.txt', taskRequest),
    fileEntry('context/transfer.manifest.json', transferManifestBytes),
    fileEntry('context/bootstrap.manifest.json', bootstrapManifestBytes),
    fileEntry('verification/transfer.json', transferVerificationBytes),
    fileEntry('verification/bootstrap.json', bootstrapVerificationBytes),
    fileEntry('manifest.json', stableJson(manifest)),
    fileEntry('bin/verify-result.mjs', verifier)
  ].sort((a, b) => a.path.localeCompare(b.path));
  const checksums = Object.freeze({
    schema: PORTABLE_ARTIFACT_RESULT_CHECKSUM_SCHEMA_ID,
    version: 1,
    algorithm: 'sha256',
    files: Object.freeze(baseEntries.map(({ path: filePath, bytes, sha256: digest }) => Object.freeze({ path: filePath, bytes, sha256: digest })))
  });
  const entries = [...baseEntries, fileEntry('checksums.json', stableJson(checksums))].sort((a, b) => a.path.localeCompare(b.path));
  const archive = createDeterministicStoredZip(entries.map((entry) => ({ name: entry.path, data: entry.content })));

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, archive, { flag: context.overwrite === true ? 'w' : 'wx' });
  return Object.freeze({
    schema: PORTABLE_ARTIFACT_RESULT_WRITE_RECEIPT_SCHEMA_ID,
    version: 1,
    status: 'written-local-result-package',
    outputPath: target,
    bytes: archive.length,
    sha256: sha256(archive),
    artifactSha256,
    inputSnapshotSha256,
    createdAt,
    files: entries.length,
    boundary: Object.freeze({
      localOutput: true,
      sourceMutation: false,
      remoteWrite: false,
      overwrite: context.overwrite === true
    })
  });
}

function assertCleanCreation(result, writeReceipt) {
  if (result?.status !== 'created-clean') throw new Error(`portable.artifact-result.not-clean:${result?.status || 'unknown'}`);
  if (result?.validation?.status !== 'clean') throw new Error(`portable.artifact-result.validation-not-clean:${result?.validation?.status || 'unknown'}`);
  if (!result?.draft?.markdown) throw new Error('portable.artifact-result.markdown.required');
  if (!String(result.draft.sourceMode || '').startsWith('local-') || result.draft.source) throw new Error('portable.artifact-result.source-boundary.invalid');
  if (!writeReceipt || writeReceipt.status !== 'written-local-clean') throw new Error(`portable.artifact-result.write-receipt.invalid:${writeReceipt?.status || 'missing'}`);
  if (writeReceipt.sha256 !== sha256(normalizeMarkdown(result.draft.markdown))) throw new Error('portable.artifact-result.write-receipt.sha256-mismatch');
  if (writeReceipt.validationStatus !== 'clean') throw new Error('portable.artifact-result.write-receipt.validation-not-clean');
}

function buildInputSnapshot(input = {}, createdAt = '') {
  return Object.freeze({
    schema: PORTABLE_ARTIFACT_INPUT_SNAPSHOT_SCHEMA_ID,
    version: 1,
    capturedAt: createdAt,
    operation: 'create-local-draft',
    request: Object.freeze({
      schemaId: String(input.schemaId || ''),
      path: String(input.path || ''),
      title: String(input.title || ''),
      summary: String(input.summary || ''),
      why: String(input.why || ''),
      values: cloneJson(input.values || {}),
      sections: cloneJson(input.sections || {}),
      parent: boundedParent(input.parent),
      allowIncomplete: Boolean(input.allowIncomplete)
    }),
    boundary: Object.freeze({
      dialogueOrHostInput: true,
      sourceMutation: false,
      remoteWrite: false,
      omittedLoadedSchemaMaterial: true
    })
  });
}

function buildOperationReceipt(result = {}, artifactSha256 = '', createdAt = '') {
  return Object.freeze({
    schema: PORTABLE_ARTIFACT_OPERATION_RECEIPT_SCHEMA_ID,
    version: 1,
    recordedAt: createdAt,
    operation: String(result.operation || 'create-local-draft'),
    status: String(result.status || ''),
    schemaId: String(result.schemaId || result.draft?.schemaId || ''),
    artifact: Object.freeze({
      logicalPath: String(result.draft?.path || ''),
      sha256: artifactSha256,
      sourceMode: String(result.draft?.sourceMode || '')
    }),
    validation: cloneJson(result.validation || null),
    qualification: cloneJson(result.qualification || null),
    findingSummary: cloneJson(result.findingSummary || null),
    findings: cloneJson(result.findings || [])
  });
}

function qualifyContextIdentities({ transferManifest, bootstrapManifest, transferVerification, bootstrapVerification, transferVerificationBytes, bootstrapVerificationBytes, taskRequest }) {
  if (transferManifest.schema !== 'tiinex.llm.transfer.package.v1') throw new Error('portable.artifact-result.transfer-manifest.schema');
  if (bootstrapManifest.schema !== 'tiinex.bootstrap.package.v1') throw new Error('portable.artifact-result.bootstrap-manifest.schema');
  const expected = transferManifest.expectedBootstrap || {};
  if (expected.bootstrapVersion !== bootstrapManifest.bootstrapVersion) throw new Error('portable.artifact-result.bootstrap-version-mismatch');
  if (expected.sourceIdentity?.runtimeFingerprint !== bootstrapManifest.sourceIdentity?.runtimeFingerprint) throw new Error('portable.artifact-result.bootstrap-runtime-mismatch');
  if (expected.canonicalMaterial?.ref !== bootstrapManifest.canonicalMaterial?.ref || expected.canonicalMaterial?.schemaPackFingerprint !== bootstrapManifest.canonicalMaterial?.schemaPackFingerprint) throw new Error('portable.artifact-result.bootstrap-canonical-mismatch');
  if (transferVerification.transferVersion !== transferManifest.transferVersion) throw new Error('portable.artifact-result.transfer-verification-version-mismatch');
  const verifiedBootstrapVersion = String(bootstrapVerification.packageVersion || bootstrapVerification.bootstrapVersion || '');
  if (verifiedBootstrapVersion !== bootstrapManifest.bootstrapVersion) throw new Error('portable.artifact-result.bootstrap-verification-version-mismatch');
  return Object.freeze({
    task: Object.freeze({
      packagePath: 'context/task.request.txt',
      sha256: sha256(taskRequest)
    }),
    transfer: Object.freeze({
      manifestSha256: sha256(stableJson(transferManifest)),
      verificationSha256: sha256(transferVerificationBytes),
      transferVersion: String(transferManifest.transferVersion || ''),
      profileId: String(transferManifest.profile?.id || ''),
      verificationStatus: transferVerification.status
    }),
    bootstrap: Object.freeze({
      manifestSha256: sha256(stableJson(bootstrapManifest)),
      verificationSha256: sha256(bootstrapVerificationBytes),
      bootstrapVersion: String(bootstrapManifest.bootstrapVersion || ''),
      sourceIdentity: cloneJson(bootstrapManifest.sourceIdentity || {}),
      canonicalMaterial: Object.freeze({
        repository: String(bootstrapManifest.canonicalMaterial?.repository || ''),
        ref: String(bootstrapManifest.canonicalMaterial?.ref || ''),
        schemaPackFingerprint: String(bootstrapManifest.canonicalMaterial?.schemaPackFingerprint || '')
      }),
      verificationStatus: bootstrapVerification.status
    })
  });
}

function exactJsonBytes(raw, parsed, code) {
  if (raw == null) return stableJson(parsed);
  const bytes = Buffer.from(raw);
  let value;
  try { value = JSON.parse(bytes.toString('utf8')); }
  catch { throw new Error(`${code}.json`); }
  if (JSON.stringify(sortValue(value)) !== JSON.stringify(sortValue(parsed))) throw new Error(`${code}.mismatch`);
  return bytes;
}

function requireValidVerification(value, schema, code) {
  const verification = requireObject(value, `${code}.required`);
  const allowed = Array.isArray(schema) ? schema : [schema];
  if (!allowed.includes(verification.schema)) throw new Error(`${code}.schema`);
  if (verification.status !== 'valid') throw new Error(`${code}.invalid:${verification.status || 'unknown'}`);
  return cloneJson(verification);
}
function requireObject(value, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(code);
  return cloneJson(value);
}
function boundedParent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const parent = {};
  for (const key of ['id', 'path', 'schemaId', 'parentSchemaId', 'trace', 'origin', 'boundary', 'sourceMode', 'title', 'summary']) {
    if (value[key] !== undefined && value[key] !== null && value[key] !== '') parent[key] = value[key];
  }
  return Object.keys(parent).length ? Object.freeze(parent) : null;
}
function normalizeCreatedAt(value) {
  const candidate = String(value || '').trim() || new Date().toISOString();
  const parsed = new Date(candidate);
  if (!Number.isFinite(parsed.getTime())) throw new Error(`portable.artifact-result.created-at.invalid:${candidate}`);
  return parsed.toISOString();
}
function fileEntry(filePath, value) {
  const clean = safeZipPath(filePath);
  if (!clean || clean !== filePath) throw new Error(`portable.artifact-result.path.unsafe:${filePath}`);
  const content = Buffer.isBuffer(value) ? Buffer.from(value) : Buffer.from(String(value ?? ''), 'utf8');
  return Object.freeze({ path: clean, content, bytes: content.length, sha256: sha256(content) });
}
function normalizeMarkdown(value = '') { return `${String(value || '').replace(/\r\n/g, '\n').replace(/\s+$/u, '')}\n`; }
function stableJson(value) { return `${JSON.stringify(sortValue(value), null, 2)}\n`; }
function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const key of Object.keys(value).sort()) output[key] = sortValue(value[key]);
  return output;
}
function cloneJson(value) { return value === undefined ? null : JSON.parse(JSON.stringify(value)); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
