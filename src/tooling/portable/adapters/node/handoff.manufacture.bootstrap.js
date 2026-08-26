import { createHash } from 'node:crypto';
import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256Hex } from '../../../../export/package.bytes.js';

export const PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID = 'tiinex.portable.tooling-bootstrap.manifest.v1';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_RUNTIME_ROOT = path.resolve(MODULE_DIR, '../../../../..');
const IMPORT_RE = /(?:\bimport\s+(?:[^'";]+?\s+from\s+)?|\bexport\s+(?:\*|\{[^}]*\})\s+from\s+|\bimport\s*\()\s*['"]([^'"]+)['"]/g;

export async function buildToolingBootstrapTransportFiles(input = {}) {
  const delivery = normalizeDelivery(input.delivery);
  const runtimeRoot = path.resolve(String(input.runtimeRoot || DEFAULT_RUNTIME_ROOT));
  const runtime = await enumerateRuntimeDependencyGraph(runtimeRoot, { maxFiles: input.maxFiles });
  const manifest = Object.freeze({
    schema: PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID,
    version: 1,
    delivery,
    entrypoint: 'runtime/tools/tiinex-portable.mjs',
    qualification: Object.freeze({ authority: 'manifest-declared-exact-runtime-bytes-only', ordinaryWorkspaceBytesAreBootstrapAuthority: false, filenameOrColocationAuthority: false }),
    runtime: Object.freeze({ files: runtime.entries.length, bytes: runtime.totalBytes, representationSha256: runtime.representationSha256, entries: Object.freeze(runtime.entries.map(({ path: entryPath, bytes, sha256 }) => Object.freeze({ path: `runtime/${entryPath}`, bytes, sha256 }))) }),
    canonicalSchemaMaterial: Object.freeze({ boundary: 'Carried as runtime data required by the portable schema provider; canonical schema authority remains the declared external Tiinex/docs binding inside that material, not this bootstrap manifest.' }),
    boundary: 'Portable Tooling bootstrap transport authority only. Transport orientation bootstrap and canonical schema-material authority remain separate concerns.'
  });
  const manifestBytes = new TextEncoder().encode(`${JSON.stringify(sortJson(manifest), null, 2)}\n`);
  const manifestSha256 = sha256Hex(manifestBytes);
  const persistentVerification = delivery === 'persistent' ? verifyExpectedPersistentBootstrap(input.expected, manifest, manifestSha256) : Object.freeze({ state: 'not-required' });
  const summary = Object.freeze({ schema: 'tiinex.portable.tooling-bootstrap.summary.v1', delivery, manifestSha256, representationSha256: runtime.representationSha256, runtimeFiles: runtime.entries.length, runtimeBytes: runtime.totalBytes, status: delivery === 'embedded' ? 'embedded-qualified' : 'persistent-identity-verified', persistentVerification });
  const files = [transportFile('tiinex.bootstrap/manifest.json', manifestBytes, 'tooling-bootstrap-manifest', 'portable-tooling-bootstrap-control')];
  if (delivery === 'embedded') for (const entry of runtime.entries) files.push(transportFile(`tiinex.bootstrap/runtime/${entry.path}`, entry.data, 'tooling-bootstrap-runtime', 'portable-tooling-bootstrap-runtime'));
  return Object.freeze({ manifest, summary, files: Object.freeze(files) });
}

function verifyExpectedPersistentBootstrap(expected, manifest, manifestSha256) {
  if (!expected || typeof expected !== 'object' || !Object.keys(expected).length) throw new Error('portable.tooling-bootstrap.persistent-verification.required');
  const candidate = expected.manifest && typeof expected.manifest === 'object' ? expected.manifest : expected;
  const expectedRepresentationSha256 = String(candidate.runtime?.representationSha256 || candidate.representationSha256 || expected.representationSha256 || '');
  if (!expectedRepresentationSha256) throw new Error('portable.tooling-bootstrap.persistent-verification.representation-required');
  if (expectedRepresentationSha256 !== manifest.runtime.representationSha256) throw new Error('portable.tooling-bootstrap.persistent-verification.representation-mismatch');
  const expectedFiles = Number(candidate.runtime?.files ?? candidate.runtimeFiles ?? expected.runtimeFiles ?? 0);
  if (expectedFiles && expectedFiles !== manifest.runtime.files) throw new Error('portable.tooling-bootstrap.persistent-verification.file-count-mismatch');
  const expectedBytes = Number(candidate.runtime?.bytes ?? candidate.runtimeBytes ?? expected.runtimeBytes ?? 0);
  if (expectedBytes && expectedBytes !== manifest.runtime.bytes) throw new Error('portable.tooling-bootstrap.persistent-verification.byte-count-mismatch');
  const expectedManifestSha256 = String(expected.manifestSha256 || '');
  if (expectedManifestSha256 && expected.delivery === 'persistent' && expectedManifestSha256 !== manifestSha256) throw new Error('portable.tooling-bootstrap.persistent-verification.manifest-mismatch');
  return Object.freeze({ state: 'verified', basis: 'caller-supplied-exact-runtime-identity', representationSha256: manifest.runtime.representationSha256, runtimeFiles: manifest.runtime.files, runtimeBytes: manifest.runtime.bytes, manifestSha256 });
}

async function enumerateRuntimeDependencyGraph(runtimeRoot, options = {}) {
  const maxFiles = positiveInteger(options.maxFiles, 4000);
  const queue = ['tools/tiinex-portable.mjs'];
  const seen = new Set();
  const files = new Map();
  while (queue.length) {
    const relative = normalizeRelativePath(queue.shift());
    if (seen.has(relative)) continue;
    seen.add(relative);
    if (seen.size > maxFiles) throw new Error(`portable.tooling-bootstrap.file-limit:${maxFiles}`);
    const absolute = path.resolve(runtimeRoot, relative);
    assertInside(runtimeRoot, absolute, 'portable.tooling-bootstrap.path.outside-runtime');
    const info = await lstat(absolute);
    if (!info.isFile()) throw new Error(`portable.tooling-bootstrap.dependency.not-file:${relative}`);
    const data = new Uint8Array(await readFile(absolute));
    files.set(relative, data);
    if (!/\.(?:m?js|cjs)$/i.test(relative)) continue;
    const text = new TextDecoder().decode(data);
    for (const specifier of staticRelativeSpecifiers(text)) {
      const resolved = resolveImportRelative(relative, specifier);
      if (resolved) queue.push(resolved);
    }
  }
  for (const explicit of ['package.json', 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md', 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.pointer.json']) if (!files.has(explicit)) files.set(explicit, new Uint8Array(await readFile(path.resolve(runtimeRoot, explicit))));
  const canonicalRoot = path.resolve(runtimeRoot, 'src/tooling/portable/schema/bootstrap');
  for (const relative of await enumerateFilesUnder(canonicalRoot, runtimeRoot)) if (!files.has(relative)) files.set(relative, new Uint8Array(await readFile(path.resolve(runtimeRoot, relative))));
  const entries = [...files.entries()].map(([entryPath, data]) => Object.freeze({ path: entryPath, data, bytes: data.byteLength, sha256: sha256Hex(data) })).sort((a, b) => a.path.localeCompare(b.path));
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  const representationSha256 = sha256Text(stableJson(entries.map(({ path: entryPath, bytes, sha256 }) => ({ path: `runtime/${entryPath}`, bytes, sha256 }))));
  return Object.freeze({ entries: Object.freeze(entries), totalBytes, representationSha256 });
}

async function enumerateFilesUnder(root, runtimeRoot) {
  const out = [];
  const queue = [root];
  while (queue.length) {
    const current = queue.shift();
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(absolute);
      else if (entry.isFile()) out.push(normalizeRelativePath(path.relative(runtimeRoot, absolute)));
    }
  }
  return out.sort();
}
function staticRelativeSpecifiers(text = '') { const out = []; IMPORT_RE.lastIndex = 0; let match; while ((match = IMPORT_RE.exec(text))) if (String(match[1] || '').startsWith('.')) out.push(match[1]); return out; }
function resolveImportRelative(fromFile, specifier) { const clean = String(specifier || '').split('?')[0].split('#')[0]; if (!clean.startsWith('.')) return ''; let resolved = normalizeRelativePath(path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), clean))); if (!path.posix.extname(resolved)) resolved = `${resolved}.js`; return resolved; }
function transportFile(filePath, data, kind, logicalKind) { return Object.freeze({ path: filePath, data, kind, logicalKind, mediaType: mediaTypeForPath(filePath), boundary: 'Manifest-declared portable Tooling bootstrap transport byte. Co-location does not grant bootstrap authority; exact manifest membership and digest are required.' }); }
function normalizeDelivery(value) { const delivery = String(value || 'embedded').trim().toLowerCase(); if (!['embedded', 'persistent'].includes(delivery)) throw new Error(`portable.tooling-bootstrap.delivery.unsupported:${delivery}`); return delivery; }
function mediaTypeForPath(value = '') { const lower = String(value).toLowerCase(); if (lower.endsWith('.md')) return 'text/markdown'; if (lower.endsWith('.json')) return 'application/json'; if (/\.(?:m?js|cjs)$/.test(lower)) return 'text/javascript'; if (lower.endsWith('.ts')) return 'text/typescript'; if (lower.endsWith('.css')) return 'text/css'; if (lower.endsWith('.html')) return 'text/html'; if (/\.(?:yml|yaml)$/.test(lower)) return 'text/yaml'; if (lower.endsWith('.txt')) return 'text/plain'; return 'application/octet-stream'; }
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function inside(root, absolute) { const relative = path.relative(root, absolute); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
function assertInside(root, absolute, code) { if (!inside(root, absolute)) throw new Error(code); }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
