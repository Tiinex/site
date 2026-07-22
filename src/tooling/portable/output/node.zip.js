import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectExportPackageBundle } from '../../../export/package.builder.js';

export function portableRuntimePackageZipBuffer(bundle = {}) {
  const inspection = inspectExportPackageBundle(bundle);
  if (inspection.status !== 'valid') throw new Error('portable.runtime-package.zip.bundle.invalid');
  const entries = (bundle.files || []).map((file) => ({ name: safeZipPath(file.path), data: Buffer.from(String(file.content ?? ''), 'utf8') }));
  if (entries.some((entry) => !entry.name)) throw new Error('portable.runtime-package.zip.path.invalid');
  return storedZip(entries);
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

function storedZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data || '');
    const crc = crc32(data);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    name.copy(local, 30);
    localParts.push(local, data);

    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    centralParts.push(central);
    offset += local.length + data.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function safeZipPath(value = '') {
  const input = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = [];
  for (const part of input.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') return '';
    parts.push(part.replace(/[\u0000-\u001f<>:"|?*]/g, '_'));
  }
  return parts.join('/');
}

const CRC_TABLE = makeCrcTable();
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    table[index] = value >>> 0;
  }
  return table;
}
