import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
import { filterArchiveTransportEntries } from './archive.transport.js';
import { qualifyPortableChangesetEntries } from './archive.portableChangeset.js';
import { resolveTransportPlan } from '../../sources/transport.levels.js';

export const ARCHIVE_ADAPTER_ID = 'archive';

const TEXT_DECODER = new TextDecoder();
const TEXT_ENCODER = new TextEncoder();
const MARKDOWN_RE = /(?:\.md|\.markdown|\.trace\.md|\.schema\.md|\.validator\.md|\.workspace\.md)$/i;
const TEXT_ASSET_RE = /\.(?:txt|json|yml|yaml|csv|svg|html|css|js)$/i;
const IMAGE_ASSET_RE = /\.(?:png|jpg|jpeg|gif|webp|svg)$/i;
const MAX_TEXT_ASSET_PREVIEW_BYTES = 128 * 1024;
const MAX_BINARY_ASSET_DATA_URL_BYTES = 512 * 1024;

export function createArchiveAdapter() {
  return makeAdapterDefinition({
    id: ARCHIVE_ADAPTER_ID,
    label: 'Archive intake',
    availability: AdapterAvailability.available,
    sourceKinds: ['archive.zip', 'archive.local', 'archive.workspace-bundle'],
    capabilities: {
      registerSource: false,
      materialize: true,
      resolveAsset: true,
      openExternal: false,
      requiresBridge: false
    },
    configShape: {
      files: 'File[] where .zip is parsed and other files are routed by extension',
      paths: 'safe relative archive paths only',
      encrypted: 'ZipCrypto stored entries supported with an explicit password; unsupported encrypted forms are reported'
    },
    boundary: 'user-provided local archive; paths are sanitized; material remains browser-local/session until explicitly exported or published',
    resultShape: {
      records: 'markdown leaf/trace records',
      assets: 'non-markdown local assets',
      workspaceEntries: '.workspace.md entries routed as workspace configuration candidates',
      diagnostics: 'counts, skipped unsafe paths, encryption/unsupported entries'
    },
    notes: [
      'Ported from .old archive intake: preserve relative paths, split workspace files/leaves/assets, and support password-protected ZipCrypto stored entries through an explicit password boundary.',
      'This adapter never infers GitHub provenance from archive paths.'
    ]
  });
}

export function safeArchivePath(value = '', options = {}) {
  const raw = String(value || '').replace(/\\/g, '/').trim();
  if (!raw || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw)) return '';
  const segments = raw.split('/').filter((segment) => segment && segment !== '.');
  if (!segments.length || segments.some((segment) => segment === '..')) return '';
  if (options.excludeRepositoryInternals && (segments[0] === '.git' || segments[0] === '.mirrors')) return '';
  return segments.join('/').replace(/\/+/g, '/');
}

export function isWorkspaceMarkdownPath(path = '') {
  const name = String(path || '').trim();
  return /\.workspace(?:\s*\(\d+\))?\.md$/iu.test(name);
}


export function looksLikeWorkspaceMarkdown(markdown = '') {
  const text = String(markdown || '');
  if (!text.trim()) return false;
  if (/Current Schema:\s*(?:\[[^\]]*\]\([^)]*\)|[^\n]*)tiinex\.workspace\.v1/iu.test(text)) return true;
  if (/Current Schema:\s*tiinex\.workspace\.v1/iu.test(text)) return true;
  if (/^#\s+Tiinex Viewer\s*$/imu.test(text) && /^##\s+Workspace Entrypoints\s*$/imu.test(text)) return true;
  if (/^##\s+Workspace State\s*$/imu.test(text) && /tiinex\.workspace\.machineState\.v1/iu.test(text)) return true;
  if (/^##\s+Workspaces\s*$/imu.test(text) && /^##\s+Workspace Entrypoints\s*$/imu.test(text)) return true;
  return false;
}

export function classifyArchiveEntry(path = '', content = null) {
  const clean = safeArchivePath(path);
  if (!clean) return 'unsafe';
  const markdownPath = MARKDOWN_RE.test(clean);
  if (isWorkspaceMarkdownPath(clean) || (markdownPath && content && looksLikeWorkspaceMarkdown(content))) return 'workspace';
  if (markdownPath) return 'record';
  return 'asset';
}

export function zipBufferHasEncryptedEntries(buffer) {
  const bytes = bytesFrom(buffer);
  let encrypted = false;
  forEachCentralEntry(bytes, (entry) => {
    if (entry.flag & 0x0001) encrypted = true;
  });
  return encrypted;
}

export async function decodeZipBufferEntries(zipBuffer, options = {}) {
  const bytes = bytesFrom(zipBuffer);
  const entries = [];
  const warnings = [];
  const errors = [];
  const encrypted = [];
  const unsupported = [];
  const unsafe = [];

  const centralEntries = readCentralEntries(bytes);
  if (!centralEntries.length) throw new Error('zip.no.central.directory');

  for (const central of centralEntries) {
    if (central.isDirectory) continue;
    const path = safeArchivePath(central.name, { excludeRepositoryInternals: Boolean(options.excludeRepositoryInternals) });
    if (!path) {
      unsafe.push(central.name);
      warnings.push({ code: 'archive.unsafe-path-skipped', ref: central.name, message: 'Unsafe archive path skipped.' });
      continue;
    }
    try {
      let compressed = readLocalFileData(bytes, central);
      if (central.flag & 0x0001) {
        encrypted.push(path);
        if (!options.password) {
          errors.push({ code: 'archive.password-required', ref: path, message: 'Password required for password-protected zip material.' });
          continue;
        }
        if (central.flag & 0x0008) throw new Error('zip.encrypted-data-descriptor.unsupported');
        if (central.method !== 0) throw new Error(`zip.encrypted-method.unsupported:${central.method}`);
        const plain = zipCryptoDecryptBytes(compressed, options.password);
        const verificationByte = (central.crc >>> 24) & 0xff;
        if (plain.byteLength < 12 || plain[11] !== verificationByte) throw new Error('zip.password.invalid');
        compressed = plain.slice(12);
        if (compressed.byteLength !== central.uncompressedSize) throw new Error('zip.encrypted-size-mismatch');
        if (crc32Bytes(compressed) !== central.crc) throw new Error('zip.password.invalid-or-corrupt');
      }
      const data = await decompressZipEntry(compressed, central.method);
      let content = null;
      if (MARKDOWN_RE.test(path) || (TEXT_ASSET_RE.test(path) && data.byteLength <= MAX_TEXT_ASSET_PREVIEW_BYTES)) content = TEXT_DECODER.decode(data);
      entries.push({
        path,
        bytes: data,
        content,
        type: mimeTypeForPath(path),
        size: data.byteLength,
        lastModified: '',
        source: options.source || 'zip',
        kind: classifyArchiveEntry(path, content)
      });
    } catch (error) {
      unsupported.push(path);
      errors.push({ code: 'archive.entry-read-failed', ref: path, message: String(error && error.message ? error.message : error) });
    }
  }

  return {
    entries,
    errors,
    warnings,
    diagnostics: {
      requestedCount: centralEntries.length,
      encryptedCount: encrypted.length,
      unsupportedCount: unsupported.length,
      unsafeCount: unsafe.length,
      archiveDecodePassCount: 1
    }
  };
}

export async function qualifyDecodedArchiveEntries(decoded = {}, options = {}) {
  const warnings = [...(decoded.warnings || [])];
  const errors = [...(decoded.errors || [])];
  const filtered = await filterArchiveTransportEntries(decoded.entries || [], { ...options, stripPortableControl: false });
  if (filtered.mergePreflight.status === 'blocked' && options.enforceMergePreflight !== false) {
    for (const conflict of filtered.mergePreflight.conflicts || []) errors.push({ code: conflict.code, ref: conflict.path, message: 'Archive merge preflight detected missing or changed known lineage material.' });
  }
  const qualified = await qualifyPortableChangesetEntries(filtered.entries, warnings, errors, {
    safePath: safeArchivePath,
    isMarkdownPath: (value) => MARKDOWN_RE.test(value)
  });
  let materialEntries = qualified.entries;
  let portableControlStrippedCount = 0;
  if (!qualified.detected && filtered.portableControl && options.stripPortableControl !== false) {
    const before = materialEntries.length;
    materialEntries = materialEntries.filter((entry) => entry.path !== 'manifest.json' && entry.path !== 'checksums.json');
    portableControlStrippedCount = before - materialEntries.length;
  }
  const blocked = filtered.mergePreflight.status === 'blocked' && options.enforceMergePreflight !== false;
  return {
    entries: blocked ? [] : materialEntries,
    errors,
    warnings,
    diagnostics: {
      ...(decoded.diagnostics || {}),
      ...filtered.diagnostics,
      portableControlStrippedCount,
      portableChangesetCount: qualified.detected ? 1 : 0,
      controlCount: qualified.controlCount
    }
  };
}

export async function zipBufferToImportEntries(zipBuffer, options = {}) {
  const decoded = await decodeZipBufferEntries(zipBuffer, options);
  return qualifyDecodedArchiveEntries(decoded, options);
}

export async function fileToArchiveDecodedEntries(file, options = {}) {
  const relativePath = safeArchivePath(fileRelativePath(file) || file?.name || 'upload');
  if (!relativePath) {
    return { entries: [], errors: [{ code: 'archive.unsafe-path', ref: file?.name || 'upload', message: 'Unsafe local path skipped.' }], warnings: [], diagnostics: { unsafeCount: 1, archiveDecodePassCount: 0 } };
  }
  if (!/\.zip$/i.test(relativePath || file?.name || '')) throw new Error('archive.decoded-entries.zip-required');
  const buffer = await file.arrayBuffer();
  let password = options.password || '';
  if (zipBufferHasEncryptedEntries(buffer) && !password && typeof options.passwordProvider === 'function') {
    password = await options.passwordProvider(file);
  }
  return decodeZipBufferEntries(buffer, { ...options, password, source: options.source || 'zip', excludeRepositoryInternals: true });
}

export async function fileToArchiveImportEntries(file, options = {}) {
  const relativePath = safeArchivePath(fileRelativePath(file) || file?.name || 'upload');
  if (!relativePath) {
    return { entries: [], errors: [{ code: 'archive.unsafe-path', ref: file?.name || 'upload', message: 'Unsafe local path skipped.' }], warnings: [], diagnostics: { unsafeCount: 1 } };
  }
  if (/\.zip$/i.test(relativePath || file?.name || '')) {
    const decoded = await fileToArchiveDecodedEntries(file, options);
    return qualifyDecodedArchiveEntries(decoded, options);
  }
  const bytes = new Uint8Array(await file.arrayBuffer?.() || TEXT_ENCODER.encode(await file.text?.() || ''));
  let content = null;
  if (MARKDOWN_RE.test(relativePath) || TEXT_ASSET_RE.test(relativePath)) content = typeof file.text === 'function' ? await file.text() : TEXT_DECODER.decode(bytes);
  return { entries: [{ path: relativePath, bytes, content, type: file.type || mimeTypeForPath(relativePath), size: Number(file.size || bytes.byteLength || 0), lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : '', source: 'upload', kind: classifyArchiveEntry(relativePath, content) }], errors: [], warnings: [], diagnostics: { requestedCount: 1 } };
}

export async function materializeArchiveFiles(files = [], options = {}) {
  const records = [];
  const assets = [];
  const workspaceEntries = [];
  const errors = [];
  const warnings = [];
  const transport = resolveTransportPlan(options.sourceConfig || {}, 'local-import', { defaultLevel: 'TL0', allowFallback: false });
  const diagnostics = { sourceBoundary: 'local-archive', transportLevel: transport.selectedLevel, transportOperation: transport.operation, transport, fileCount: 0, entryCount: 0, recordCount: 0, assetCount: 0, workspaceCount: 0, controlCount: 0, portableChangesetCount: 0, encryptedCount: 0, unsafeCount: 0, unsupportedCount: 0, previewOmittedCount: 0, bootstrapDetected: false, bootstrapStrippedCount: 0, portableControlDetected: false, portableControlStrippedCount: 0, archiveDecodePassCount: 0, mergePreflight: null, suggestedWorkspaceName: suggestWorkspaceNameForFiles(files) };

  for (const file of Array.from(files || []).filter(Boolean)) {
    diagnostics.fileCount += 1;
    try {
      const result = options.predecodedArchive && Array.from(files || []).filter(Boolean).length === 1
        ? await qualifyDecodedArchiveEntries(options.predecodedArchive, options)
        : await fileToArchiveImportEntries(file, options);
      errors.push(...(result.errors || []));
      warnings.push(...(result.warnings || []));
      diagnostics.encryptedCount += Number(result.diagnostics?.encryptedCount || 0);
      diagnostics.unsafeCount += Number(result.diagnostics?.unsafeCount || 0);
      diagnostics.unsupportedCount += Number(result.diagnostics?.unsupportedCount || 0);
      diagnostics.archiveDecodePassCount += Number(result.diagnostics?.archiveDecodePassCount || 0);
      diagnostics.bootstrapDetected = diagnostics.bootstrapDetected || Boolean(result.diagnostics?.bootstrapDetected);
      diagnostics.bootstrapStrippedCount += Number(result.diagnostics?.bootstrapStrippedCount || 0);
      diagnostics.portableControlDetected = diagnostics.portableControlDetected || Boolean(result.diagnostics?.portableControlDetected);
      diagnostics.portableControlStrippedCount += Number(result.diagnostics?.portableControlStrippedCount || 0);
      diagnostics.portableChangesetCount += Number(result.diagnostics?.portableChangesetCount || 0);
      diagnostics.controlCount += Number(result.diagnostics?.controlCount || 0);
      if (result.diagnostics?.mergePreflight && result.diagnostics.mergePreflight.status !== 'not-applicable') diagnostics.mergePreflight = result.diagnostics.mergePreflight;
      for (const entry of result.entries || []) {
        diagnostics.entryCount += 1;
        if (entry.kind === 'control') {
          continue;
        } else if (entry.kind === 'workspace') {
          workspaceEntries.push(workspaceEntryFromImportEntry(entry));
        } else if (entry.kind === 'record') {
          records.push(createRecordFromMarkdown(entry.content || '', { path: entry.path, name: fileName(entry.path), sourceMode: options.sourceMode || 'archive-local' }));
        } else if (entry.kind === 'asset') {
          {
          const asset = assetFromImportEntry(entry);
          if (asset.previewState && asset.previewState !== 'available') diagnostics.previewOmittedCount += 1;
          assets.push(asset);
        }
        }
      }
    } catch (error) {
      errors.push({ code: 'archive.read-failed', ref: file?.name || 'archive', message: String(error && error.message ? error.message : error) });
    }
  }

  diagnostics.recordCount = records.length;
  diagnostics.assetCount = assets.length;
  diagnostics.workspaceCount = workspaceEntries.length;

  return makeAdapterResult({
    adapterId: ARCHIVE_ADAPTER_ID,
    sourceId: 'local',
    records,
    assets,
    workspaceEntries,
    errors,
    warnings,
    diagnostics
  });
}

export function workspaceEntryFromImportEntry(entry = {}) {
  const markdown = String(entry.content || '');
  return {
    schema: 'tiinex.workspace.import.v1',
    path: entry.path || 'workspace.workspace.md',
    title: workspaceTitleFromMarkdown(markdown) || fileName(entry.path || 'workspace.workspace.md'),
    markdown,
    sourceMode: entry.source || 'zip',
    boundary: 'browser-local workspace import candidate; open/merge decision belongs to workspace lifecycle/UI'
  };
}

export function assetFromImportEntry(entry = {}) {
  const path = entry.path || 'asset';
  const size = Number(entry.size || entry.bytes?.byteLength || 0);
  const type = entry.type || mimeTypeForPath(path);
  const textPreview = typeof entry.content === 'string' && entry.content.length <= MAX_TEXT_ASSET_PREVIEW_BYTES ? entry.content : '';
  const canPreviewBinary = !textPreview && IMAGE_ASSET_RE.test(path) && size > 0 && size <= MAX_BINARY_ASSET_DATA_URL_BYTES;
  const dataUrl = canPreviewBinary ? bytesToDataUrl(entry.bytes || new Uint8Array(), type) : '';
  const previewState = textPreview || dataUrl ? 'available' : (size > MAX_BINARY_ASSET_DATA_URL_BYTES || size > MAX_TEXT_ASSET_PREVIEW_BYTES ? 'omitted-large' : 'metadata-only');
  return {
    schema: 'tiinex.local.asset.v1',
    id: `asset:local:${path}`,
    path,
    name: fileName(path),
    type,
    size,
    content: textPreview,
    dataUrl,
    previewState,
    sourceMode: entry.source || 'zip',
    source: { kind: 'local-session', adapterId: 'archive', sourceKind: 'archive.zip', boundary: 'browser-local archive asset; no GitHub provenance inferred' }
  };
}

export function workspaceTitleFromMarkdown(markdown = '') {
  const text = String(markdown || '');
  const browserTitle = text.match(/^\s*-\s*Browser Title:\s*(.+)$/mi)?.[1]?.trim();
  if (browserTitle) return stripMarkdown(browserTitle).slice(0, 72);
  const heading = text.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
  return stripMarkdown(heading || '').slice(0, 72);
}

function readCentralEntries(bytes) {
  const eocdOffset = findEndOfCentralDirectory(bytes);
  if (eocdOffset < 0) return [];
  const count = zipU16(bytes, eocdOffset + 10);
  const cdOffset = zipU32(bytes, eocdOffset + 16);
  const entries = [];
  let offset = cdOffset;
  for (let i = 0; i < count && offset + 46 <= bytes.length; i += 1) {
    if (zipU32(bytes, offset) !== 0x02014b50) break;
    const flag = zipU16(bytes, offset + 8);
    const method = zipU16(bytes, offset + 10);
    const compressedSize = zipU32(bytes, offset + 20);
    const uncompressedSize = zipU32(bytes, offset + 24);
    const nameLength = zipU16(bytes, offset + 28);
    const extraLength = zipU16(bytes, offset + 30);
    const commentLength = zipU16(bytes, offset + 32);
    const crc = zipU32(bytes, offset + 16);
    const localOffset = zipU32(bytes, offset + 42);
    const name = decodeZipName(bytes.slice(offset + 46, offset + 46 + nameLength), flag);
    entries.push({ flag, method, crc, compressedSize, uncompressedSize, name, localOffset, isDirectory: name.endsWith('/') });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function forEachCentralEntry(bytes, visitor) {
  for (const entry of readCentralEntries(bytes)) visitor(entry);
}

function findEndOfCentralDirectory(bytes) {
  const min = Math.max(0, bytes.length - 0xffff - 22);
  for (let offset = bytes.length - 22; offset >= min; offset -= 1) {
    if (zipU32(bytes, offset) === 0x06054b50) return offset;
  }
  return -1;
}

function readLocalFileData(bytes, central) {
  const offset = central.localOffset;
  if (zipU32(bytes, offset) !== 0x04034b50) throw new Error('zip.local-header-missing');
  const nameLength = zipU16(bytes, offset + 26);
  const extraLength = zipU16(bytes, offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const end = start + central.compressedSize;
  if (end > bytes.length) throw new Error('zip.entry-truncated');
  return bytes.slice(start, end);
}

async function decompressZipEntry(compressed, method) {
  if (method === 0) return compressed;
  if (method !== 8) throw new Error(`zip.method.unsupported:${method}`);
  if (typeof DecompressionStream === 'undefined') throw new Error('zip.deflate.bridge-unavailable');
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}


const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32Update(crc, byte) { return (CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)) >>> 0; }
function crc32Bytes(bytes) { let crc = 0xffffffff; for (const byte of bytes) crc = crc32Update(crc, byte); return (crc ^ 0xffffffff) >>> 0; }
function zipCryptoKeys(password = '') {
  const keys = { k0: 0x12345678 >>> 0, k1: 0x23456789 >>> 0, k2: 0x34567890 >>> 0 };
  for (const byte of TEXT_ENCODER.encode(password)) zipCryptoUpdateKeys(keys, byte);
  return keys;
}
function zipCryptoUpdateKeys(keys, byte) {
  keys.k0 = crc32Update(keys.k0, byte);
  keys.k1 = (Math.imul((keys.k1 + (keys.k0 & 0xff)) >>> 0, 134775813) + 1) >>> 0;
  keys.k2 = crc32Update(keys.k2, (keys.k1 >>> 24) & 0xff);
}
function zipCryptoDecryptByte(keys) { const temp = (keys.k2 | 2) >>> 0; return ((Math.imul(temp, (temp ^ 1) >>> 0) >>> 8) & 0xff) >>> 0; }
function zipCryptoDecryptBytes(bytes, password) {
  const keys = zipCryptoKeys(password);
  const out = new Uint8Array(bytes.byteLength);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    const plain = bytes[i] ^ zipCryptoDecryptByte(keys);
    out[i] = plain;
    zipCryptoUpdateKeys(keys, plain);
  }
  return out;
}

function bytesFrom(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  return new Uint8Array(value || []);
}

function zipU16(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8)) >>> 0;
}

function zipU32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function decodeZipName(bytes, flag) {
  // UTF-8 flag is 0x800. The legacy viewer treats zip entry names as UTF-8 in practice;
  // falling back to TextDecoder keeps browser behavior deterministic without guessing provenance.
  return TEXT_DECODER.decode(bytes);
}


function suggestWorkspaceNameForFiles(files = []) {
  const list = Array.from(files || []).filter(Boolean);
  if (!list.length) return 'Local import';
  if (list.length === 1) {
    const raw = fileRelativePath(list[0]) || list[0].name || 'Local import';
    const base = fileName(raw).replace(/\.(?:zip|md|markdown|trace\.md|workspace\.md)$/i, '').replace(/[-_]+/g, ' ').trim();
    return titleCase(base || 'Local import');
  }
  const roots = new Set(list.map((file) => String(fileRelativePath(file) || file.name || '').replace(/\\/g, '/').split('/').filter(Boolean)[0]).filter(Boolean));
  if (roots.size === 1) return titleCase(Array.from(roots)[0].replace(/[-_]+/g, ' '));
  return 'Local import';
}

function titleCase(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (m) => m.toUpperCase()).slice(0, 72) || 'Local import';
}

function fileRelativePath(file = {}) {
  return file.tiinexRelativePath || file.relativePath || file.webkitRelativePath || file.path || file.name || '';
}

function fileName(path = '') {
  return String(path || '').split('/').filter(Boolean).pop() || 'asset';
}

function stripMarkdown(value = '') {
  return String(value || '').replace(/^\[([^\]]+)\]\([^)]*\)$/, '$1').trim();
}

function bytesToDataUrl(bytes, type = 'application/octet-stream') {
  const body = base64FromBytes(bytes);
  return `data:${type || 'application/octet-stream'};base64,${body}`;
}

function base64FromBytes(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let binary = '';
  for (const byte of bytes || []) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function mimeTypeForPath(path = '') {
  const lower = String(path || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.trace.md') || lower.endsWith('.workspace.md')) return 'text/markdown;charset=utf-8';
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.txt')) return 'text/plain;charset=utf-8';
  return 'application/octet-stream';
}
