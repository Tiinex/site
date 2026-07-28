#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const findings = [];
try {
  const manifest = await json('manifest.json');
  const checksums = await json('checksums.json');
  const creation = await json('artifact.creation.receipt.json');
  const input = await json('artifact.input.snapshot.json');
  const operation = await json('artifact.operation.receipt.json');
  const writeReceipt = await json('artifact.write.receipt.json');
  const transferManifest = await json('context/transfer.manifest.json');
  const bootstrapManifest = await json('context/bootstrap.manifest.json');
  const taskRequest = await readFile(path.join(root, 'context/task.request.txt'));
  const transfer = await json('verification/transfer.json');
  const bootstrap = await json('verification/bootstrap.json');
  const actual = await walk(root);
  const expected = new Map((checksums.files || []).map((entry) => [entry.path, entry]));

  check(manifest.schema === 'tiinex.portable.artifact-result-package.v1', 'result.verify.manifest-schema', 'manifest.json');
  check(checksums.schema === 'tiinex.portable.artifact-result-checksums.v1', 'result.verify.checksum-schema', 'checksums.json');
  check(creation.schema === 'tiinex.portable.artifact-creation-receipt.v1' && creation.status === 'packaged-local-clean', 'result.verify.creation-receipt', 'artifact.creation.receipt.json');
  check(input.schema === 'tiinex.portable.artifact-input-snapshot.v1', 'result.verify.input-snapshot', 'artifact.input.snapshot.json');
  check(operation.schema === 'tiinex.portable.artifact-operation-receipt.v1' && operation.status === 'created-clean', 'result.verify.operation-receipt', 'artifact.operation.receipt.json');
  check(writeReceipt.schema === 'tiinex.portable.draft-write-receipt.v1' && writeReceipt.status === 'written-local-clean', 'result.verify.write-receipt', 'artifact.write.receipt.json');
  check(transfer.schema === 'tiinex.llm.transfer.verification.v1' && transfer.status === 'valid', 'result.verify.transfer-verification', 'verification/transfer.json');
  check(['tiinex.bootstrap.verification.v2', 'tiinex.bootstrap.archive-verification.v2'].includes(bootstrap.schema) && bootstrap.status === 'valid', 'result.verify.bootstrap-verification', 'verification/bootstrap.json');

  for (const [relative, entry] of expected) {
    try {
      const bytes = await readFile(path.join(root, relative));
      check(bytes.length === entry.bytes, 'result.verify.bytes-mismatch', relative, { expected: entry.bytes, actual: bytes.length });
      check(sha256(bytes) === entry.sha256, 'result.verify.sha256-mismatch', relative, { expected: entry.sha256, actual: sha256(bytes) });
    } catch (error) {
      findings.push(finding('error', 'result.verify.file-missing', relative, { detail: String(error?.message || error) }));
    }
  }
  for (const relative of actual) {
    if (relative === 'checksums.json') continue;
    check(expected.has(relative), 'result.verify.file-unlisted', relative);
  }
  for (const required of ['artifact.trace.md', 'artifact.creation.receipt.json', 'artifact.input.snapshot.json', 'artifact.operation.receipt.json', 'artifact.write.receipt.json', 'context/task.request.txt', 'context/transfer.manifest.json', 'context/bootstrap.manifest.json', 'verification/transfer.json', 'verification/bootstrap.json', 'manifest.json', 'checksums.json', 'bin/verify-result.mjs']) check(actual.includes(required), 'result.verify.required-file-missing', required);

  const artifact = await readFile(path.join(root, 'artifact.trace.md'));
  const artifactSha = sha256(artifact);
  const inputSha = sha256(await readFile(path.join(root, 'artifact.input.snapshot.json')));
  const taskSha = sha256(taskRequest);
  const transferManifestSha = sha256(await readFile(path.join(root, 'context/transfer.manifest.json')));
  const bootstrapManifestSha = sha256(await readFile(path.join(root, 'context/bootstrap.manifest.json')));
  const transferVerificationSha = sha256(await readFile(path.join(root, 'verification/transfer.json')));
  const bootstrapVerificationSha = sha256(await readFile(path.join(root, 'verification/bootstrap.json')));
  check(manifest.artifact?.sha256 === artifactSha, 'result.verify.manifest-artifact-binding', 'manifest.json');
  check(creation.artifact?.sha256 === artifactSha, 'result.verify.creation-artifact-binding', 'artifact.creation.receipt.json');
  check(operation.artifact?.sha256 === artifactSha, 'result.verify.operation-artifact-binding', 'artifact.operation.receipt.json');
  check(writeReceipt.sha256 === artifactSha, 'result.verify.write-artifact-binding', 'artifact.write.receipt.json');
  check(creation.inputSnapshot?.sha256 === inputSha, 'result.verify.creation-input-binding', 'artifact.creation.receipt.json');
  check(manifest.evidence?.inputSnapshot?.sha256 === inputSha, 'result.verify.manifest-input-binding', 'manifest.json');
  check(manifest.evidence?.taskRequest?.sha256 === taskSha && creation.context?.task?.sha256 === taskSha, 'result.verify.task-binding', 'context/task.request.txt');
  check(manifest.evidence?.transferManifest?.sha256 === transferManifestSha && creation.context?.transfer?.manifestSha256 === transferManifestSha, 'result.verify.transfer-manifest-binding', 'context/transfer.manifest.json');
  check(manifest.evidence?.bootstrapManifest?.sha256 === bootstrapManifestSha && creation.context?.bootstrap?.manifestSha256 === bootstrapManifestSha, 'result.verify.bootstrap-manifest-binding', 'context/bootstrap.manifest.json');
  check(manifest.evidence?.transferVerification?.sha256 === transferVerificationSha && creation.context?.transfer?.verificationSha256 === transferVerificationSha, 'result.verify.transfer-verification-binding', 'verification/transfer.json');
  check(manifest.evidence?.bootstrapVerification?.sha256 === bootstrapVerificationSha && creation.context?.bootstrap?.verificationSha256 === bootstrapVerificationSha, 'result.verify.bootstrap-verification-binding', 'verification/bootstrap.json');
  check(transferManifest.schema === 'tiinex.llm.transfer.package.v1' && bootstrapManifest.schema === 'tiinex.bootstrap.package.v1', 'result.verify.context-manifest-schema', 'context');
  check(transferManifest.expectedBootstrap?.bootstrapVersion === bootstrapManifest.bootstrapVersion, 'result.verify.context-bootstrap-version', 'context');
  check(transferManifest.expectedBootstrap?.sourceIdentity?.runtimeFingerprint === bootstrapManifest.sourceIdentity?.runtimeFingerprint, 'result.verify.context-bootstrap-runtime', 'context');
  check(transferManifest.expectedBootstrap?.canonicalMaterial?.schemaPackFingerprint === bootstrapManifest.canonicalMaterial?.schemaPackFingerprint, 'result.verify.context-bootstrap-canonical', 'context');
  check(creation.context?.bootstrap?.verificationStatus === 'valid' && creation.context?.transfer?.verificationStatus === 'valid', 'result.verify.context-status', 'artifact.creation.receipt.json');
  check(creation.boundary?.sourceMutation === false && creation.boundary?.remoteWrite === false && creation.boundary?.sourceBacked === false, 'result.verify.boundary', 'artifact.creation.receipt.json');

  const result = {
    schema: 'tiinex.portable.artifact-result-verification.v1',
    status: findings.some((entry) => entry.severity === 'error') ? 'invalid' : 'valid',
    root,
    artifact: { schemaId: creation.artifact?.schemaId || '', logicalPath: creation.artifact?.logicalPath || '', sha256: artifactSha },
    context: creation.context || null,
    counts: { files: actual.length, checkedFiles: expected.size, findings: findings.length, errors: findings.filter((entry) => entry.severity === 'error').length },
    findings
  };
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.status === 'valid' ? 0 : 1;
} catch (error) {
  console.error(JSON.stringify({ schema: 'tiinex.portable.artifact-result-verification.v1', status: 'invalid', root, error: String(error?.message || error) }, null, 2));
  process.exitCode = 1;
}

async function json(relative) { return JSON.parse(await readFile(path.join(root, relative), 'utf8')); }
async function walk(directory) {
  const output = [];
  const queue = [directory];
  while (queue.length) {
    const current = queue.shift();
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      const info = await lstat(absolute);
      if (info.isSymbolicLink()) throw new Error(`result.verify.symlink:${absolute}`);
      if (info.isDirectory()) queue.push(absolute);
      else if (info.isFile()) output.push(path.relative(directory, absolute).replace(/\\/g, '/'));
    }
  }
  return output.sort();
}
function check(condition, code, file, extra = {}) { if (!condition) findings.push(finding('error', code, file, extra)); }
function finding(severity, code, file, extra = {}) { return { severity, code, file, ...extra }; }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
