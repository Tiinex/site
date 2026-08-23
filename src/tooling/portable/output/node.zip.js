import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectExportPackageBundle } from '../../../export/package.builder.js';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { createDeterministicStoredZip, safeZipPath } from './deterministic.zip.js';

export function portableRuntimePackageZipBuffer(bundle = {}) {
  const inspection = inspectExportPackageBundle(bundle);
  if (inspection.status !== 'valid') throw new Error('portable.runtime-package.zip.bundle.invalid');
  const entries = (bundle.files || []).map((file) => ({ name: safeZipPath(file.path), data: Buffer.from(packageFileBytes(file)) }));
  if (entries.some((entry) => !entry.name)) throw new Error('portable.runtime-package.zip.path.invalid');
  return createDeterministicStoredZip(entries);
}

export async function writePortableRuntimePackageZip(bundle = {}, outputPath = '') {
  const target = path.resolve(String(outputPath || '').trim());
  if (!outputPath) throw new Error('portable.runtime-package.zip.output.required');
  if (!target.toLowerCase().endsWith('.zip')) throw new Error('portable.runtime-package.zip.output.extension');
  await mkdir(path.dirname(target), { recursive: true });
  const buffer = portableRuntimePackageZipBuffer(bundle);
  await writeFile(target, buffer);
  return Object.freeze({
    schema: 'tiinex.portable.runtime-package.zip-write.v1',
    status: 'written',
    path: target,
    bytes: buffer.length,
    packageId: bundle.packageId || '',
    boundary: Object.freeze({ localFilesystemWrite: true, remoteWrite: false, sourceMutation: false })
  });
}

