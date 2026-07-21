import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';

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
      encrypted: 'detected and reported; no fake import'
    },
    boundary: 'user-provided local archive; paths are sanitized; material remains browser-local/session until explicitly exported or published',
    resultShape: {
      records: 'markdown leaf/trace records',
      assets: 'non-markdown local assets',
      workspaceEntries: '.workspace.md entries routed as workspace configuration candidates',
      diagnostics: 'counts, skipped unsafe paths, encryption/unsupported entries'
    },
    notes: [
      'Ported from .old archive intake: preserve relative paths, split workspace files/leaves/assets, and report encrypted/unsupported zip entries honestly.',
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
  return /\.workspace\.md$/i.test(String(path || '').trim());
}

export function looksLikeWorkspaceMarkdown(markdown = '') {
  const text = String(markdown || '');
  // Only explicit workspace schema declarations classify an arbitrary Markdown
  // entry as a workspace import candidate. Generic headings such as
  // `# Tiinex Viewer` or `## Workspace Entrypoints` occur in normal docs too
  // and must remain records; otherwise source zips flood the feed with false
  // open/merge candidates. Path-based `.workspace.md` detection still applies.
  return /Current Schema:\s*\[[^\]]*tiinex\.workspace\.v1/i.test(text)
    || /Current Schema:\s*tiinex\.workspace\.v1/i.test(text);
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

export async function zipBufferToImportEntries(zipBuffer, options = {}) {
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
    if (central.flag & 0x0001) {
      encrypted.push(path);
      errors.push({ code: 'archive.encrypted-entry', ref: path, message: 'Encrypted zip entries require a password bridge and are not imported in this viewer pass.' });
      continue;
    }
    try {
      const compressed = readLocalFileData(bytes, central);
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

  return { entries, errors, warnings, diagnostics: { requestedCount: centralEntries.length, encryptedCount: encrypted.length, unsupportedCount: unsupported.length, unsafeCount: unsafe.length } };
}

export async function fileToArchiveImportEntries(file, options = {}) {
  const relativePath = safeArchivePath(fileRelativePath(file) || file?.name || 'upload');
  if (!relativePath) {
    return { entries: [], errors: [{ code: 'archive.unsafe-path', ref: file?.name || 'upload', message: 'Unsafe local path skipped.' }], warnings: [], diagnostics: { unsafeCount: 1 } };
  }
  if (/\.zip$/i.test(relativePath || file?.name || '')) {
    const buffer = await file.arrayBuffer();
    if (zipBufferHasEncryptedEntries(buffer)) {
      // Continue through parser so unencrypted files are still recoverable if a mixed archive is supplied.
      // Each encrypted entry is reported explicitly; no fake password prompt is shown in React.
    }
    return zipBufferToImportEntries(buffer, { source: 'zip', excludeRepositoryInternals: true });
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
  const diagnostics = { sourceBoundary: 'local-archive', fileCount: 0, entryCount: 0, recordCount: 0, assetCount: 0, workspaceCount: 0, encryptedCount: 0, unsafeCount: 0, unsupportedCount: 0, previewOmittedCount: 0, suggestedWorkspaceName: suggestWorkspaceNameForFiles(files) };

  for (const file of Array.from(files || []).filter(Boolean)) {
    diagnostics.fileCount += 1;
    try {
      const result = await fileToArchiveImportEntries(file, options);
      errors.push(...(result.errors || []));
      warnings.push(...(result.warnings || []));
      diagnostics.encryptedCount += Number(result.diagnostics?.encryptedCount || 0);
      diagnostics.unsafeCount += Number(result.diagnostics?.unsafeCount || 0);
      diagnostics.unsupportedCount += Number(result.diagnostics?.unsupportedCount || 0);
      for (const entry of result.entries || []) {
        diagnostics.entryCount += 1;
        if (entry.kind === 'workspace') {
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
    const localOffset = zipU32(bytes, offset + 42);
    const name = decodeZipName(bytes.slice(offset + 46, offset + 46 + nameLength), flag);
    entries.push({ flag, method, compressedSize, uncompressedSize, name, localOffset, isDirectory: name.endsWith('/') });
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
