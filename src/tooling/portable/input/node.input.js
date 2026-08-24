import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { zipBufferToImportEntries } from '../../../adapters/archive/archive.adapter.js';
import { portableFinding } from '../findings.js';

const DEFAULT_MAX_FILES = 4000;
const DEFAULT_MAX_TEXT_BYTES = 4 * 1024 * 1024;
const DEFAULT_EXCLUDED_DIRECTORIES = Object.freeze(['.git', 'node_modules', '.site-publish']);
const TEXT_RE = /\.(?:md|markdown|json|txt|yml|yaml|js|mjs|cjs|ts|tsx|jsx|html|css)$/i;
const PACKAGE_CONTROL_JSON_RE = /^tiinex\.package\/[^/]+\.json$/i;

export async function loadNodePortableInput(targets, options = {}) {
  const list = normalizeTargets(targets);
  const files = [];
  const findings = [];
  const maxFiles = positiveInteger(options.maxFiles, DEFAULT_MAX_FILES);
  const maxTextBytes = positiveInteger(options.maxTextBytes, DEFAULT_MAX_TEXT_BYTES);
  if (!list.length) findings.push(portableFinding('error', 'portable.node.target.required', 'At least one file, directory, or zip target is required.'));

  for (const target of list) {
    if (files.length >= maxFiles) break;
    const absolute = path.resolve(target);
    let info;
    try { info = await lstat(absolute); }
    catch (error) {
      findings.push(portableFinding('error', 'portable.node.target.unavailable', 'Input target could not be read.', { ref: target, detail: String(error.message || error) }));
      continue;
    }
    if (info.isSymbolicLink()) {
      findings.push(portableFinding('warning', 'portable.node.symlink.skipped', 'Symbolic-link input was skipped to avoid crossing the supplied material boundary.', { ref: target }));
      continue;
    }
    if (info.isDirectory()) await readDirectory(absolute, files, findings, { ...options, maxFiles, maxTextBytes });
    else if (info.isFile()) await readSingleFile(absolute, files, findings, { ...options, maxFiles, maxTextBytes });
    else findings.push(portableFinding('warning', 'portable.node.target.unsupported', 'Input target is neither a regular file nor a directory and was skipped.', { ref: target }));
  }

  if (files.length >= maxFiles) findings.push(portableFinding('warning', 'portable.node.file-limit', 'Portable input stopped at the configured file limit.', { maxFiles }));
  return Object.freeze({
    files: Object.freeze(files.slice(0, maxFiles)),
    findings: Object.freeze(findings),
    sourceMode: 'portable-node-local'
  });
}

async function readDirectory(root, files, findings, options) {
  let entries;
  try { entries = await walk(root, options, findings); }
  catch (error) {
    findings.push(portableFinding('error', 'portable.node.directory.read-failed', 'Directory input could not be traversed.', { ref: root, detail: String(error.message || error) }));
    return;
  }
  for (const absolute of entries) {
    if (files.length >= options.maxFiles) break;
    await readSingleFile(absolute, files, findings, { ...options, root });
  }
}

async function readSingleFile(absolute, files, findings, options = {}) {
  if (files.length >= positiveInteger(options.maxFiles, DEFAULT_MAX_FILES)) return;
  const relative = options.root ? path.relative(options.root, absolute) : path.basename(absolute);
  const materialPath = relative.replace(/\\/g, '/');
  let info;
  try { info = await lstat(absolute); }
  catch (error) {
    findings.push(portableFinding('error', 'portable.node.file.unavailable', 'Input file could not be read.', { ref: materialPath, detail: String(error.message || error) }));
    return;
  }
  if (info.isSymbolicLink()) {
    findings.push(portableFinding('warning', 'portable.node.symlink.skipped', 'Symbolic-link material was skipped.', { ref: materialPath }));
    return;
  }

  if (/\.zip$/i.test(absolute)) {
    await readZipFile(absolute, files, findings, options);
    return;
  }
  if (!TEXT_RE.test(absolute)) {
    files.push(Object.freeze({ path: materialPath, size: info.size, type: '', kind: 'asset', sourceMode: 'portable-node-local', locator: Object.freeze({ kind: 'node-file', localPath: absolute }) }));
    return;
  }
  if (info.size > positiveInteger(options.maxTextBytes, DEFAULT_MAX_TEXT_BYTES)) {
    files.push(Object.freeze({ path: materialPath, size: info.size, type: 'text/plain', kind: 'asset', sourceMode: 'portable-node-local', locator: Object.freeze({ kind: 'node-file', localPath: absolute }) }));
    findings.push(portableFinding('warning', 'portable.node.text-too-large', 'Text-like input exceeded the configured text limit and was retained as metadata only.', { ref: materialPath, size: info.size }));
    return;
  }
  try {
    files.push(Object.freeze({ path: materialPath, content: await readFile(absolute, 'utf8'), size: info.size, sourceMode: 'portable-node-local' }));
  } catch (error) {
    findings.push(portableFinding('error', 'portable.node.file.read-failed', 'Text input could not be read.', { ref: materialPath, detail: String(error.message || error) }));
  }
}

async function readZipFile(absolute, files, findings, options = {}) {
  try {
    const buffer = await readFile(absolute);
    const result = await zipBufferToImportEntries(buffer, { source: 'portable-node-zip', excludeRepositoryInternals: true });
    for (const entry of result.entries || []) {
      if (files.length >= positiveInteger(options.maxFiles, DEFAULT_MAX_FILES)) break;
      const maxTextBytes = positiveInteger(options.maxTextBytes, DEFAULT_MAX_TEXT_BYTES);
      const packageControlContent = typeof entry.content !== 'string' && PACKAGE_CONTROL_JSON_RE.test(String(entry.path || '')) && Number(entry.size || 0) <= maxTextBytes && entry.bytes
        ? new TextDecoder().decode(entry.bytes)
        : null;
      const textContent = typeof entry.content === 'string' ? entry.content : packageControlContent;
      const tooLargeText = Boolean((typeof entry.content === 'string' || PACKAGE_CONTROL_JSON_RE.test(String(entry.path || ''))) && Number(entry.size || 0) > maxTextBytes);
      if (tooLargeText) {
        files.push(Object.freeze({ path: entry.path, size: entry.size, type: entry.type, kind: 'asset', sourceMode: 'portable-node-zip', locator: Object.freeze({ kind: 'node-zip-entry', archivePath: absolute, entryPath: entry.path }) }));
        findings.push(portableFinding('warning', 'portable.node.zip-text-too-large', 'Zip text material exceeded the configured text limit and was retained as metadata only.', { ref: entry.path, size: entry.size }));
      } else {
        files.push(Object.freeze({
          path: entry.path,
          ...(typeof textContent === 'string' ? { content: textContent } : {}),
          ...(typeof textContent !== 'string' && entry.bytes ? { data: entry.bytes } : {}),
          size: entry.size,
          type: entry.type,
          kind: entry.kind,
          sourceMode: 'portable-node-zip',
          ...(typeof textContent === 'string' ? {} : { locator: Object.freeze({ kind: 'node-zip-entry', archivePath: absolute, entryPath: entry.path }) })
        }));
      }
    }
    findings.push(...(result.errors || []), ...(result.warnings || []));
  } catch (error) {
    findings.push(portableFinding('error', 'portable.node.zip.read-failed', 'Zip input could not be materialized.', { ref: absolute, detail: String(error.message || error) }));
  }
}

async function walk(root, options = {}, findings = []) {
  const out = [];
  const excluded = new Set(options.excludeDirectories || DEFAULT_EXCLUDED_DIRECTORIES);
  const queue = [root];
  const maxFiles = positiveInteger(options.maxFiles, DEFAULT_MAX_FILES);
  while (queue.length && out.length < maxFiles) {
    const current = queue.shift();
    let entries;
    try { entries = await readdir(current, { withFileTypes: true }); }
    catch (error) {
      findings.push(portableFinding('warning', 'portable.node.directory.entry-unavailable', 'A directory entry could not be read and was skipped.', { ref: current, detail: String(error.message || error) }));
      continue;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (excluded.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        findings.push(portableFinding('info', 'portable.node.symlink.skipped', 'Symbolic link was skipped during directory traversal.', { ref: path.relative(root, absolute).replace(/\\/g, '/') }));
        continue;
      }
      if (entry.isDirectory()) queue.push(absolute);
      else if (entry.isFile()) out.push(absolute);
      if (out.length >= maxFiles) break;
    }
  }
  return out;
}

function normalizeTargets(targets) {
  const list = Array.isArray(targets) ? targets : [targets];
  return list.map((value) => String(value || '').trim()).filter(Boolean);
}

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}
