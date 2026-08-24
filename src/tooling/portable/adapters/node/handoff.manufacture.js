import { createHash } from 'node:crypto';
import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageFileBytes, sha256Hex } from '../../../../export/package.bytes.js';
import { projectHandoffMaterialRequirements } from '../../handoff/materialClosure.requirements.js';
import { inferWorkspaceTitle, normalizeAdditionalWorkspaceDescriptors, normalizeTransportRoute, safeWorkspaceToken, serializableMetadata } from './handoff.manufacture.multiRoot.js';

export const PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID = 'tiinex.portable.node-workspace-enumeration.v1';
export const PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID = 'tiinex.portable.tooling-bootstrap.manifest.v1';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_RUNTIME_ROOT = path.resolve(MODULE_DIR, '../../../../..');
const DEFAULT_EXCLUDED_DIRECTORIES = Object.freeze(['.git', 'node_modules', '.site-publish']);
const DEFAULT_MAX_FILES = 10000;
const IMPORT_RE = /(?:\bimport\s+(?:[^'";]+?\s+from\s+)?|\bexport\s+(?:\*|\{[^}]*\})\s+from\s+|\bimport\s*\()\s*['"]([^'"]+)['"]/g;

export async function prepareNodeHandoffManufacturingInput(input = {}, options = {}) {
  const workspaceRoot = path.resolve(String(input.workspaceRoot || input.workspace || '.'));
  const workspaceId = safeWorkspaceToken(input.workspaceId || path.basename(workspaceRoot) || 'workspace');
  const requestedWorkspaceTitle = String(input.workspaceTitle || input.title || '').trim();
  const handoffPath = normalizeRelativePath(input.handoffPath || input.handoff || '');
  if (!handoffPath) throw new Error('portable.handoff-manufacture.handoff-path.required');
  const absoluteHandoff = path.resolve(workspaceRoot, handoffPath);
  assertInside(workspaceRoot, absoluteHandoff, 'portable.handoff-manufacture.handoff-path.outside-workspace');
  const handoffMarkdown = await readFile(absoluteHandoff, 'utf8');
  const handoff = Object.freeze({
    id: handoffPath,
    path: handoffPath,
    semanticStatus: String(input.handoffSemanticStatus || 'unknown'),
    markdown: handoffMarkdown
  });

  const enumeration = await enumerateNodeWorkspace(workspaceRoot, {
    workspaceId,
    workspaceTitle: requestedWorkspaceTitle,
    sourceMetadata: input.workspaceSource || input.sourceMetadata || {},
    excludeDirectories: input.excludeDirectories || options.excludeDirectories,
    maxFiles: input.maxFiles || options.maxFiles
  });
  if (enumeration.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${enumeration.status}`);
  const workspaceTitle = requestedWorkspaceTitle || inferWorkspaceTitle(enumeration) || workspaceId;
  const primaryMaterialization = Object.freeze({ ...enumeration.materialization, title: workspaceTitle });
  const additionalWorkspaceDescriptors = normalizeAdditionalWorkspaceDescriptors(input.additionalWorkspaces || input.workspaceRoots || input.workspaceDescriptors || []);
  const workspaceMaterializations = [primaryMaterialization];
  const workspaceEnumerations = [Object.freeze({ id: workspaceId, root: workspaceRoot, evidence: enumeration.evidence })];
  const seenWorkspaceIds = new Set([workspaceId]);
  for (const descriptor of additionalWorkspaceDescriptors) {
    const id = safeWorkspaceToken(descriptor.id || descriptor.workspaceId || '');
    if (!descriptor.id && !descriptor.workspaceId) throw new Error('portable.handoff-manufacture.additional-workspace.id.required');
    if (seenWorkspaceIds.has(id)) throw new Error(`portable.handoff-manufacture.workspace-id.duplicate:${id}`);
    seenWorkspaceIds.add(id);
    const root = path.resolve(String(descriptor.root || descriptor.workspaceRoot || descriptor.path || ''));
    if (!descriptor.root && !descriptor.workspaceRoot && !descriptor.path) throw new Error(`portable.handoff-manufacture.additional-workspace.root.required:${id}`);
    const requestedTitle = String(descriptor.title || descriptor.name || descriptor.workspaceTitle || '').trim();
    const enumerated = await enumerateNodeWorkspace(root, {
      workspaceId: id,
      workspaceTitle: requestedTitle,
      sourceMetadata: descriptor.source || descriptor.sourceMetadata || {},
      excludeDirectories: descriptor.excludeDirectories || input.excludeDirectories || options.excludeDirectories,
      maxFiles: descriptor.maxFiles || input.maxFiles || options.maxFiles
    });
    if (enumerated.status !== 'qualified-complete') throw new Error(`portable.handoff-manufacture.workspace-enumeration.${id}.${enumerated.status}`);
    const title = requestedTitle || inferWorkspaceTitle(enumerated) || id;
    workspaceMaterializations.push(Object.freeze({ ...enumerated.materialization, title }));
    workspaceEnumerations.push(Object.freeze({ id, root, evidence: enumerated.evidence }));
  }
  const transportRoutes = Object.freeze([...(input.transportRoutes || input.handoffRoutes || [])].map((route) => normalizeTransportRoute(route, workspaceId)).filter(Boolean));

  const requirements = projectHandoffMaterialRequirements(handoff);
  const materials = await resolveWorkspaceRequirementMaterials(requirements, workspaceRoot, path.dirname(absoluteHandoff), enumeration, input.materialBindings || {});
  const toolingBootstrap = await buildToolingBootstrapTransportFiles({
    delivery: input.toolingBootstrap || input.bootstrapDelivery || 'embedded',
    runtimeRoot: input.runtimeRoot || options.runtimeRoot || DEFAULT_RUNTIME_ROOT,
    expected: input.expectedToolingBootstrap || null,
    maxFiles: input.bootstrapMaxFiles || options.bootstrapMaxFiles
  });
  const orientationBootstrap = input.transportBootstrapContent
    ? Object.freeze({ present: true, path: String(input.transportBootstrapPath || 'tiinex.package/bootstrap.md'), content: String(input.transportBootstrapContent), mediaType: 'text/markdown' })
    : Object.freeze({ present: false });

  return Object.freeze({
    handoff,
    requirements,
    workspace: Object.freeze({ id: workspaceId, name: workspaceTitle, title: workspaceTitle, records: Object.freeze([]), assets: Object.freeze([]) }),
    workspaceMaterializations: Object.freeze(workspaceMaterializations),
    materials: Object.freeze(materials),
    recipient: Object.freeze({ referenceTargets: Object.freeze([...(input.referenceTargets || [])].map(String)) }),
    bootstrap: orientationBootstrap,
    additionalTransportFiles: toolingBootstrap.files,
    transportRoutes,
    toolingBootstrap: toolingBootstrap.summary,
    manufacturingEvidence: Object.freeze({
      enumeration: enumeration.evidence,
      workspaceEnumerations: Object.freeze(workspaceEnumerations),
      toolingBootstrap: toolingBootstrap.summary,
      carrierProjection: Object.freeze({ requestedRoutes: transportRoutes.length || 1, boundary: 'Routes are qualified later against packaged workspace bytes; adapter text is not authority.' })
    }),
    verifyRoundtrip: input.verifyRoundtrip !== false
  });
}

export async function enumerateNodeWorkspace(rootInput = '.', options = {}) {
  const root = path.resolve(String(rootInput || '.'));
  const maxFiles = positiveInteger(options.maxFiles, DEFAULT_MAX_FILES);
  const excluded = new Set([...(options.excludeDirectories || DEFAULT_EXCLUDED_DIRECTORIES)].map(String));
  const queue = [root];
  const absoluteFiles = [];
  const skippedSymlinks = [];
  while (queue.length) {
    const current = queue.shift();
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isDirectory() && excluded.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) { skippedSymlinks.push(normalizeRelativePath(path.relative(root, absolute))); continue; }
      if (entry.isDirectory()) queue.push(absolute);
      else if (entry.isFile()) absoluteFiles.push(absolute);
      if (absoluteFiles.length > maxFiles) {
        return Object.freeze({ schema: PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID, status: 'file-limit-exceeded', maxFiles, observedFiles: absoluteFiles.length, materialization: null, evidence: Object.freeze({ state: 'blocked', proof: 'deterministic-node-enumeration-v1', maxFiles, observedFiles: absoluteFiles.length }) });
      }
    }
  }
  absoluteFiles.sort((a, b) => normalizeRelativePath(path.relative(root, a)).localeCompare(normalizeRelativePath(path.relative(root, b))));
  const entries = [];
  const includedEntries = [];
  let totalBytes = 0;
  for (const absolute of absoluteFiles) {
    const relative = normalizeRelativePath(path.relative(root, absolute));
    const data = new Uint8Array(await readFile(absolute));
    const bytes = data.byteLength;
    const sha256 = sha256Hex(data);
    totalBytes += bytes;
    entries.push(Object.freeze({ path: relative, data, bytes, sha256, mediaType: mediaTypeForPath(relative) }));
    includedEntries.push(Object.freeze({ path: relative, bytes, sha256, referenceTarget: '' }));
  }
  const workspaceId = safeWorkspaceToken(options.workspaceId || path.basename(root) || 'workspace');
  const workspaceTitle = String(options.workspaceTitle || '').trim();
  const evidencePayload = Object.freeze({
    schema: 'tiinex.portable.workspace-completeness-evidence.v1',
    state: 'qualified',
    proof: 'deterministic-node-enumeration-v1',
    boundary: 'regular-files-under-workspace-root',
    workspaceId,
    entryCount: includedEntries.length,
    totalBytes,
    exclusions: Object.freeze({ directories: Object.freeze([...excluded].sort()), symbolicLinks: 'excluded-and-reported' }),
    skippedSymlinks: Object.freeze(skippedSymlinks.sort()),
    entriesFingerprint: sha256Text(stableJson(includedEntries))
  });
  return Object.freeze({
    schema: PORTABLE_NODE_WORKSPACE_ENUMERATION_SCHEMA_ID,
    status: 'qualified-complete',
    rootBoundary: '.',
    evidence: evidencePayload,
    materialization: Object.freeze({
      id: workspaceId,
      title: workspaceTitle || workspaceId,
      state: 'complete',
      source: Object.freeze({ kind: 'node-directory-enumeration', workspaceId, boundary: '.', operatorMetadata: Object.freeze(serializableMetadata(options.sourceMetadata || {})), authority: 'none' }),
      completenessEvidence: evidencePayload,
      entries: Object.freeze(entries),
      includedEntries: Object.freeze(includedEntries)
    })
  });
}
async function resolveWorkspaceRequirementMaterials(requirements, workspaceRoot, handoffDir, enumeration, bindings = {}) {
  const out = [];
  const byPath = new Map((enumeration.materialization?.entries || []).map((entry) => [normalizeRelativePath(entry.path), entry]));
  for (const requirement of [...(requirements.required || []), ...(requirements.reference || [])]) {
    const explicit = bindings[requirement.id] || bindings[requirement.name];
    if (explicit) {
      const candidate = await materialCandidateFromBinding(requirement, explicit, workspaceRoot);
      if (candidate) out.push(candidate);
      continue;
    }
    const target = String(requirement.reference?.target || '');
    if (!target || isExternalReference(target) || target.startsWith('#')) continue;
    const absolute = path.resolve(handoffDir, decodeURIComponent(target.split('#')[0]));
    if (!inside(workspaceRoot, absolute)) continue;
    const relative = normalizeRelativePath(path.relative(workspaceRoot, absolute));
    const entry = byPath.get(relative);
    if (!entry) continue;
    out.push(Object.freeze({
      requirementId: requirement.id,
      referenceTarget: target,
      path: relative,
      data: entry.data,
      bytes: entry.bytes,
      sha256: entry.sha256,
      mediaType: entry.mediaType,
      providerId: 'node-workspace-enumerator',
      providerKind: 'qualified-local-workspace',
      provenance: Object.freeze({ workspaceId: enumeration.materialization.id, path: relative, boundary: '.' }),
      authority: Object.freeze({ localIdentityQualified: true, completenessEvidenceFingerprint: enumeration.evidence.entriesFingerprint })
    }));
  }
  return out;
}

async function materialCandidateFromBinding(requirement, binding, workspaceRoot) {
  if (typeof binding === 'string') {
    const absolute = path.resolve(workspaceRoot, binding);
    assertInside(workspaceRoot, absolute, 'portable.handoff-manufacture.material-binding.outside-workspace');
    const data = new Uint8Array(await readFile(absolute));
    return Object.freeze({ requirementId: requirement.id, referenceTarget: String(requirement.reference?.target || ''), path: normalizeRelativePath(path.relative(workspaceRoot, absolute)), data, providerId: 'node-explicit-material-binding', providerKind: 'qualified-local-workspace', authority: Object.freeze({ localIdentityQualified: true }) });
  }
  if (!binding || typeof binding !== 'object') return null;
  if (binding.path) return materialCandidateFromBinding(requirement, String(binding.path), workspaceRoot);
  const data = packageFileBytes(binding);
  return Object.freeze({ ...binding, requirementId: requirement.id, referenceTarget: String(binding.referenceTarget || requirement.reference?.target || ''), data, providerId: String(binding.providerId || 'node-explicit-material-binding'), providerKind: String(binding.providerKind || 'supplied-material'), authority: Object.freeze({ ...(binding.authority || {}), localIdentityQualified: binding.authority?.localIdentityQualified === true || !requirement.reference?.target }) });
}

export async function buildToolingBootstrapTransportFiles(input = {}) {
  const delivery = normalizeDelivery(input.delivery);
  const runtimeRoot = path.resolve(String(input.runtimeRoot || DEFAULT_RUNTIME_ROOT));
  const runtime = await enumerateRuntimeDependencyGraph(runtimeRoot, { maxFiles: input.maxFiles });
  const manifest = Object.freeze({
    schema: PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID,
    version: 1,
    delivery,
    entrypoint: 'runtime/tools/tiinex-portable.mjs',
    qualification: Object.freeze({
      authority: 'manifest-declared-exact-runtime-bytes-only',
      ordinaryWorkspaceBytesAreBootstrapAuthority: false,
      filenameOrColocationAuthority: false
    }),
    runtime: Object.freeze({
      files: runtime.entries.length,
      bytes: runtime.totalBytes,
      representationSha256: runtime.representationSha256,
      entries: Object.freeze(runtime.entries.map(({ path: entryPath, bytes, sha256 }) => Object.freeze({ path: `runtime/${entryPath}`, bytes, sha256 })))
    }),
    canonicalSchemaMaterial: Object.freeze({
      boundary: 'Carried as runtime data required by the portable schema provider; canonical schema authority remains the declared external Tiinex/docs binding inside that material, not this bootstrap manifest.'
    }),
    boundary: 'Portable Tooling bootstrap transport authority only. Transport orientation bootstrap and canonical schema-material authority remain separate concerns.'
  });
  const manifestBytes = new TextEncoder().encode(`${JSON.stringify(sortJson(manifest), null, 2)}\n`);
  const manifestSha256 = sha256Hex(manifestBytes);
  const persistentVerification = delivery === 'persistent'
    ? verifyExpectedPersistentBootstrap(input.expected, manifest, manifestSha256)
    : Object.freeze({ state: 'not-required' });
  const summary = Object.freeze({ schema: 'tiinex.portable.tooling-bootstrap.summary.v1', delivery, manifestSha256, representationSha256: runtime.representationSha256, runtimeFiles: runtime.entries.length, runtimeBytes: runtime.totalBytes, status: delivery === 'embedded' ? 'embedded-qualified' : 'persistent-identity-verified', persistentVerification });
  const files = [transportFile('tiinex.bootstrap/manifest.json', manifestBytes, 'tooling-bootstrap-manifest', 'portable-tooling-bootstrap-control')];
  if (delivery === 'embedded') {
    for (const entry of runtime.entries) files.push(transportFile(`tiinex.bootstrap/runtime/${entry.path}`, entry.data, 'tooling-bootstrap-runtime', 'portable-tooling-bootstrap-runtime'));
  }
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
  return Object.freeze({
    state: 'verified',
    basis: 'caller-supplied-exact-runtime-identity',
    representationSha256: manifest.runtime.representationSha256,
    runtimeFiles: manifest.runtime.files,
    runtimeBytes: manifest.runtime.bytes,
    manifestSha256
  });
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
  for (const explicit of ['package.json', 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md', 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.pointer.json']) {
    if (!files.has(explicit)) files.set(explicit, new Uint8Array(await readFile(path.resolve(runtimeRoot, explicit))));
  }
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
function staticRelativeSpecifiers(text = '') {
  const out = [];
  IMPORT_RE.lastIndex = 0;
  let match;
  while ((match = IMPORT_RE.exec(text))) if (String(match[1] || '').startsWith('.')) out.push(match[1]);
  return out;
}
function resolveImportRelative(fromFile, specifier) {
  const clean = String(specifier || '').split('?')[0].split('#')[0];
  if (!clean.startsWith('.')) return '';
  let resolved = normalizeRelativePath(path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), clean)));
  if (!path.posix.extname(resolved)) resolved = `${resolved}.js`;
  return resolved;
}
function transportFile(filePath, data, kind, logicalKind) { return Object.freeze({ path: filePath, data, kind, logicalKind, mediaType: mediaTypeForPath(filePath), boundary: 'Manifest-declared portable Tooling bootstrap transport byte. Co-location does not grant bootstrap authority; exact manifest membership and digest are required.' }); }
function normalizeDelivery(value) { const delivery = String(value || 'embedded').trim().toLowerCase(); if (!['embedded', 'persistent'].includes(delivery)) throw new Error(`portable.tooling-bootstrap.delivery.unsupported:${delivery}`); return delivery; }
function mediaTypeForPath(value = '') { const lower = String(value).toLowerCase(); if (lower.endsWith('.md')) return 'text/markdown'; if (lower.endsWith('.json')) return 'application/json'; if (/\.(?:m?js|cjs)$/.test(lower)) return 'text/javascript'; if (lower.endsWith('.ts')) return 'text/typescript'; if (lower.endsWith('.css')) return 'text/css'; if (lower.endsWith('.html')) return 'text/html'; if (/\.(?:yml|yaml)$/.test(lower)) return 'text/yaml'; if (lower.endsWith('.txt')) return 'text/plain'; return 'application/octet-stream'; }
function normalizeRelativePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter((part) => part && part !== '.').join('/'); }
function inside(root, absolute) { const relative = path.relative(root, absolute); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
function assertInside(root, absolute, code) { if (!inside(root, absolute)) throw new Error(code); }
function isExternalReference(value = '') { return /^[a-z][a-z0-9+.-]*:/i.test(String(value || '')) || String(value || '').startsWith('//'); }
function positiveInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function sha256Text(value = '') { return createHash('sha256').update(String(value), 'utf8').digest('hex'); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]).filter(([, item]) => typeof item !== 'undefined')); }
