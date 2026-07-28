import { readFile } from 'node:fs/promises';
import { writePortableLocalDraftFile } from '../../output/node.draft.js';
import { writePortableArtifactResultPackage } from '../../output/artifact.result.package.js';
import { writePortableArtifactSet, writePortableArtifactSetBundle } from '../../output/node.artifact-set.js';

export async function materializeCliLocalDraftResult(result = {}, input = {}, flags = {}) {
  if (!flags.output) throw new Error('portable.cli.artifact-output.required');
  const writeReceipt = await writePortableLocalDraftFile(result, flags.output, { overwrite: flags.overwrite === true });
  const qualifiedPath = flags['qualified-package'] || flags['result-package'] || '';
  const primaryOutput = Object.freeze({ role: 'artifact', mediaType: 'text/markdown', path: writeReceipt.outputPath, sha256: writeReceipt.sha256, bytes: writeReceipt.bytes, status: writeReceipt.status });
  if (!qualifiedPath) return Object.freeze({ ...result, writeReceipt, delivery: Object.freeze({ profile: 'artifact-first', primary: primaryOutput, secondary: null }) });

  const transferVerificationDocument = await readRequiredJsonDocument(flags['transfer-verification'], 'portable.cli.transfer-verification.required');
  const bootstrapVerificationDocument = await readRequiredJsonDocument(flags['bootstrap-verification'], 'portable.cli.bootstrap-verification.required');
  const resultPackageReceipt = await writePortableArtifactResultPackage(result, qualifiedPath, {
    writeReceipt,
    creationInput: input,
    transferManifest: await readRequiredJson(flags['transfer-manifest'], 'portable.cli.transfer-manifest.required'),
    bootstrapManifest: await readRequiredJson(flags['bootstrap-manifest'], 'portable.cli.bootstrap-manifest.required'),
    transferVerification: transferVerificationDocument.value,
    transferVerificationBytes: transferVerificationDocument.bytes,
    bootstrapVerification: bootstrapVerificationDocument.value,
    bootstrapVerificationBytes: bootstrapVerificationDocument.bytes,
    taskRequest: await readRequiredText(flags['task-request'], 'portable.cli.task-request.required'),
    createdAt: flags['created-at'] || '',
    overwrite: flags.overwrite === true
  });
  return Object.freeze({ ...result, writeReceipt, resultPackageReceipt, delivery: Object.freeze({ profile: 'artifact-first-with-qualified-evidence', primary: primaryOutput, secondary: Object.freeze({ role: 'qualified-evidence', mediaType: 'application/zip', path: resultPackageReceipt.outputPath, sha256: resultPackageReceipt.sha256, bytes: resultPackageReceipt.bytes, status: resultPackageReceipt.status }) }) });
}

async function readRequiredJson(file = '', code = 'portable.cli.json-file.required') {
  if (!String(file || '').trim()) throw new Error(code);
  return JSON.parse(await readFile(file, 'utf8'));
}

async function readRequiredJsonDocument(file = '', code = 'portable.cli.json-file.required') {
  if (!String(file || '').trim()) throw new Error(code);
  const bytes = await readFile(file);
  return Object.freeze({ value: JSON.parse(bytes.toString('utf8')), bytes });
}

async function readRequiredText(file = '', code = 'portable.cli.text-file.required') {
  if (!String(file || '').trim()) throw new Error(code);
  return readFile(file, 'utf8');
}

export async function materializeCliArtifactSetResult(result = {}, flags = {}, options = {}) {
  if (options.bundlePrimary === true) {
    if (!flags.bundle) throw new Error('portable.cli.live-export.bundle.required');
    const bundleReceipt = await writePortableArtifactSetBundle(result, flags.bundle, { overwrite: flags.overwrite === true });
    return Object.freeze({
      ...result,
      bundleReceipt,
      delivery: Object.freeze({
        profile: 'bundle-only',
        primary: Object.freeze({ role: 'artifact-bundle', mediaType: 'application/zip', path: bundleReceipt.outputPath, sha256: bundleReceipt.sha256, bytes: bundleReceipt.bytes, status: bundleReceipt.status }),
        secondary: null
      })
    });
  }
  if (!flags['output-dir']) throw new Error('portable.cli.artifact-set.output-dir.required');
  const writeReceipt = await writePortableArtifactSet(result, flags['output-dir'], { bundlePath: flags.bundle || '', overwrite: flags.overwrite === true });
  return Object.freeze({
    ...result,
    writeReceipt,
    delivery: Object.freeze({
      profile: 'artifact-first-set',
      primary: Object.freeze(writeReceipt.artifacts.map((entry) => Object.freeze({ role: 'artifact', mediaType: 'text/markdown', path: entry.outputPath, sha256: entry.sha256, bytes: entry.bytes, status: 'written-local-clean' }))),
      secondary: writeReceipt.bundleReceipt ? Object.freeze({ role: 'artifact-bundle', mediaType: 'application/zip', path: writeReceipt.bundleReceipt.outputPath, sha256: writeReceipt.bundleReceipt.sha256, bytes: writeReceipt.bundleReceipt.bytes, status: writeReceipt.bundleReceipt.status }) : null
    })
  });
}
