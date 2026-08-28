import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { inspectRecipientFacingV2Topology } from '../handoff/recipientV2.inspect.js';
import { RECIPIENT_V2_FORMAT_ID } from '../handoff/recipientV2.topology.js';
import {
  RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID,
  RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID
} from '../handoff/recipientV2.artifactFirstPhase1.js';
import { createDeterministicStoredZip, safeZipPath } from './deterministic.zip.js';

export function recipientFacingV2PackageZipBuffer(bundle = {}, options = {}) {
  if (String(bundle.transportFormat || '') !== RECIPIENT_V2_FORMAT_ID) throw new Error('portable.recipient-v2.zip.format.invalid');
  const inspection = options.inspection || inspectRecipientFacingV2Topology(bundle);
  const inspectionFormat = String(inspection?.format || '');
  const serializableFormats = new Set([
    RECIPIENT_V2_FORMAT_ID,
    RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID,
    RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID
  ]);
  if (inspection?.status !== 'valid' || !serializableFormats.has(inspectionFormat)) throw new Error('portable.recipient-v2.zip.bundle.invalid');
  const entries = (bundle.files || []).map((file) => {
    const name = safeZipPath(file.path);
    const data = bufferViewOfPackageFile(file);
    if (!name) throw new Error('portable.recipient-v2.zip.path.invalid');
    if (Number(file.bytes || data.byteLength) !== data.byteLength || (file.sha256 && String(file.sha256) !== sha256(data))) throw new Error('portable.recipient-v2.zip.file-identity.invalid');
    return { name, data };
  });
  return createDeterministicStoredZip(entries);
}

export async function writeRecipientFacingV2PackageZip(bundle = {}, outputPath = '', options = {}) {
  const target = path.resolve(String(outputPath || '').trim());
  if (!outputPath) throw new Error('portable.recipient-v2.zip.output.required');
  if (!target.toLowerCase().endsWith('.zip')) throw new Error('portable.recipient-v2.zip.output.extension');
  await mkdir(path.dirname(target), { recursive: true });
  const buffer = recipientFacingV2PackageZipBuffer(bundle, options);
  await writeFile(target, buffer);
  return Object.freeze({
    schema: 'tiinex.portable.recipient-facing-v2.zip-write.v1',
    status: 'written',
    path: target,
    bytes: buffer.length,
    transportFormat: RECIPIENT_V2_FORMAT_ID,
    boundary: Object.freeze({ localFilesystemWrite: true, remoteWrite: false, sourceMutation: false })
  });
}

function bufferViewOfPackageFile(file = {}) {
  const value = file.data;
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  const bytes = packageFileBytes(file);
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
function sha256(data) { return createHash('sha256').update(data).digest('hex'); }
