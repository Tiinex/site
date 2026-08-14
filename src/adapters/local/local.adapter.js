import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { materializeArchiveFiles } from '../archive/archive.adapter.js';

export const LOCAL_ADAPTER_ID = 'local';

export function createLocalAdapter() {
  return makeAdapterDefinition({
    id: LOCAL_ADAPTER_ID,
    label: 'Local session material',
    availability: AdapterAvailability.available,
    sourceKinds: ['local.session', 'local.files', 'local.folder', 'local.drop', 'local.zip'],
    capabilities: {
      registerSource: true,
      materialize: true,
      openExternal: false,
      requiresBridge: false
    },
    configShape: {
      files: 'FileList | File[] supplied by browser UI; .zip routes through archive adapter',
      folder: 'browser DataTransferEntry or webkitdirectory FileList when user grants access',
      persistence: 'browser-local workspace state'
    },
    boundary: 'browser-local session material; no external provenance inferred',
    notes: ['UI supplies File objects or a drop DataTransfer; adapter contract owns browser-local materialization boundary.']
  });
}

export function createLocalAdapterResult(records = [], diagnostics = {}) {
  return makeAdapterResult({
    adapterId: LOCAL_ADAPTER_ID,
    sourceId: 'local',
    records,
    diagnostics: Object.assign({ sourceBoundary: 'local-session' }, diagnostics)
  });
}

const MARKDOWN_FILE_RE = /(?:\.md|\.markdown|\.trace\.md|\.schema\.md|\.workspace\.md)$/i;
const SUPPORTED_LOCAL_FILE_RE = /(?:\.md|\.markdown|\.trace\.md|\.schema\.md|\.validator\.md|\.workspace\.md|\.zip)$/i;

export function isMarkdownLikeFileName(name = '') {
  return MARKDOWN_FILE_RE.test(String(name || '').trim());
}

export function isSupportedLocalIntakeFileName(name = '') {
  return SUPPORTED_LOCAL_FILE_RE.test(String(name || '').trim());
}

export async function collectLocalFilesFromDataTransfer(dataTransfer) {
  if (!dataTransfer) return [];
  const items = Array.from(dataTransfer.items || []).filter(Boolean);
  if (!items.length) return Array.from(dataTransfer.files || []).filter(Boolean);
  const collected = [];
  for (const item of items) {
    if (typeof item.getAsFileSystemHandle === 'function') {
      try {
        const handle = await item.getAsFileSystemHandle();
        if (handle) {
          collected.push(...await readFileSystemHandleFiles(handle));
          continue;
        }
      } catch (_) {}
    }
    const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null;
    if (entry) {
      collected.push(...await readEntryFiles(entry));
      continue;
    }
    const file = typeof item.getAsFile === 'function' ? item.getAsFile() : null;
    if (file) collected.push(file);
  }
  return collected.length ? collected : Array.from(dataTransfer.files || []).filter(Boolean);
}

async function readFileSystemHandleFiles(handle, parentPath = '') {
  if (!handle) return [];
  const currentPath = [parentPath, handle.name || 'file'].filter(Boolean).join('/');
  if (handle.kind === 'file') {
    try {
      const file = await handle.getFile();
      return [wrapFileWithRelativePath(file, currentPath)];
    } catch (_) {
      return [];
    }
  }
  if (handle.kind !== 'directory') return [];
  const nested = [];
  try {
    for await (const child of handle.values()) nested.push(...await readFileSystemHandleFiles(child, currentPath));
  } catch (_) {}
  return nested;
}

async function readEntryFiles(entry, parentPath = '') {
  if (!entry) return [];
  if (entry.isFile) {
    const file = await entryFile(entry);
    const relativePath = [parentPath, entry.name || file?.name || 'file'].filter(Boolean).join('/');
    return [wrapFileWithRelativePath(file, relativePath)];
  }
  if (!entry.isDirectory) return [];
  const reader = entry.createReader?.();
  if (!reader) return [];
  const folderPath = [parentPath, entry.name || 'folder'].filter(Boolean).join('/');
  const entries = await readAllDirectoryEntries(reader);
  const nested = [];
  for (const child of entries) nested.push(...await readEntryFiles(child, folderPath));
  return nested;
}

function entryFile(entry) {
  return new Promise((resolve, reject) => {
    try {
      entry.file(resolve, reject);
    } catch (error) {
      reject(error);
    }
  });
}

function readAllDirectoryEntries(reader) {
  return new Promise((resolve, reject) => {
    const all = [];
    const read = () => {
      try {
        reader.readEntries((entries = []) => {
          if (!entries.length) return resolve(all);
          all.push(...entries);
          read();
        }, reject);
      } catch (error) {
        reject(error);
      }
    };
    read();
  });
}

function wrapFileWithRelativePath(file, relativePath) {
  if (!file) return file;
  const path = relativePath || file.webkitRelativePath || file.name || 'file';
  return {
    name: file.name || path.split('/').pop() || 'file',
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    relativePath: path,
    webkitRelativePath: path,
    tiinexRelativePath: path,
    text: () => file.text(),
    arrayBuffer: () => file.arrayBuffer(),
    stream: typeof file.stream === 'function' ? () => file.stream() : undefined,
    slice: typeof file.slice === 'function' ? (...args) => file.slice(...args) : undefined
  };
}

export async function materializeLocalMarkdownFiles(fileList = [], options = {}) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) {
    return makeAdapterResult({
      adapterId: LOCAL_ADAPTER_ID,
      sourceId: 'local',
      records: [],
      assets: [],
      workspaceEntries: [],
      diagnostics: { sourceBoundary: 'local-session', fileCount: 0, skippedCount: 0 }
    });
  }

  // Delegate all browser-local files/folders/zips through the archive intake contract.
  // This preserves the PoC behavior where folders may contain a mix of leaves, workspace files,
  // and assets. UI must not decide that non-Markdown files are disposable.
  const result = await materializeArchiveFiles(files, {
    ...options,
    sourceMode: options.sourceMode || 'local-files',
    source: options.sourceMode || 'local-files'
  });
  return makeAdapterResult({
    adapterId: LOCAL_ADAPTER_ID,
    sourceId: 'local',
    state: result.state,
    records: result.records,
    assets: result.assets,
    workspaceEntries: result.workspaceEntries,
    errors: result.errors,
    warnings: result.warnings,
    diagnostics: Object.assign({ sourceBoundary: 'local-session', fileCount: files.length }, result.diagnostics || {})
  });
}
