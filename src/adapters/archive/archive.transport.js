const BOOTSTRAP_ROOT = '.bootstrap/';
const PORTABLE_MANIFEST_SCHEMAS = new Set([
  'tiinex.portable.artifact-set.manifest.v1',
  'tiinex.portable.changeset.manifest.v1'
]);
const PORTABLE_CHECKSUM_SCHEMAS = new Set([
  'tiinex.portable.artifact-set.checksums.v1',
  'tiinex.portable.changeset.checksums.v1'
]);

export function isBootstrapTransportPath(value = '') {
  const path = cleanPath(value);
  return path === '.bootstrap' || path.startsWith(BOOTSTRAP_ROOT);
}

export async function filterArchiveTransportEntries(entries = [], options = {}) {
  const source = Array.isArray(entries) ? entries : [];
  const bootstrap = source.filter((entry) => isBootstrapTransportPath(entry.path));
  const ordinary = source.filter((entry) => !isBootstrapTransportPath(entry.path));
  const manifestEntry = ordinary.find((entry) => entry.path === 'manifest.json');
  const checksumsEntry = ordinary.find((entry) => entry.path === 'checksums.json');
  const manifest = parseJson(manifestEntry?.content);
  const checksums = parseJson(checksumsEntry?.content);
  const portableControl = Boolean(PORTABLE_MANIFEST_SCHEMAS.has(manifest?.schema) && PORTABLE_CHECKSUM_SCHEMAS.has(checksums?.schema));
  const stripBootstrap = options.stripBootstrapTransport !== false;
  const stripPortableControl = options.stripPortableControl !== false;
  const filtered = source.filter((entry) => {
    if (stripBootstrap && isBootstrapTransportPath(entry.path)) return false;
    if (stripPortableControl && portableControl && (entry.path === 'manifest.json' || entry.path === 'checksums.json')) return false;
    return true;
  });
  const mergePreflight = portableControl
    ? await preflightPortableChangeset(manifest, ordinary, options.existingRecords || [])
    : neutralMergePreflight();
  return Object.freeze({
    entries: Object.freeze(filtered),
    manifest,
    checksums,
    portableControl,
    mergePreflight,
    diagnostics: Object.freeze({
      bootstrapDetected: bootstrap.length > 0,
      bootstrapStrippedCount: stripBootstrap ? bootstrap.length : 0,
      bootstrapManifestSchema: parseJson(bootstrap.find((entry) => entry.path === '.bootstrap/manifest.json')?.content)?.schema || '',
      portableControlDetected: portableControl,
      portableControlStrippedCount: stripPortableControl && portableControl ? Number(Boolean(manifestEntry)) + Number(Boolean(checksumsEntry)) : 0,
      mergePreflight
    })
  });
}

export async function preflightPortableChangeset(manifest = {}, entries = [], existingRecords = []) {
  if (!PORTABLE_MANIFEST_SCHEMAS.has(manifest?.schema)) return neutralMergePreflight();
  const existing = indexExistingRecords(existingRecords);
  const included = new Map((entries || []).map((entry) => [cleanPath(entry.path), entry]));
  const conflicts = [];
  const matched = [];
  const availableContext = [];
  const missing = [];

  for (const parent of manifest.lineage?.knownParents || []) {
    const path = cleanPath(parent.path);
    const expected = String(parent.sha256 || '').trim().toLowerCase();
    const current = existing.get(path) || existing.get(String(parent.id || '').trim());
    if (current) {
      const digest = await sha256Hex(String(current.markdown || current.content || ''));
      if (expected && digest !== expected) conflicts.push(conflict('archive.merge.parent-drift', path, expected, digest));
      else matched.push(path);
      continue;
    }
    const packaged = included.get(path);
    if (packaged && parent.included !== false) {
      const digest = await sha256Hex(packaged.bytes || packaged.content || '');
      if (expected && digest !== expected) conflicts.push(conflict('archive.merge.context-checksum-mismatch', path, expected, digest));
      else availableContext.push(path);
      continue;
    }
    missing.push(path);
    conflicts.push(conflict('archive.merge.parent-missing', path, expected, 'missing'));
  }

  for (const material of manifest.material || []) {
    if (material.role !== 'modified') continue;
    const path = cleanPath(material.path);
    const current = existing.get(path);
    const expectedBase = String(material.baseSha256 || '').trim().toLowerCase();
    if (!current) conflicts.push(conflict('archive.merge.modified-base-missing', path, expectedBase, 'missing'));
    else {
      const digest = await sha256Hex(String(current.markdown || current.content || ''));
      if (expectedBase && digest !== expectedBase) conflicts.push(conflict('archive.merge.modified-base-drift', path, expectedBase, digest));
    }
  }

  return Object.freeze({
    schema: 'tiinex.archive.merge-preflight.v1',
    status: conflicts.length ? 'blocked' : 'ready',
    checkedParents: (manifest.lineage?.knownParents || []).length,
    matchedParents: matched.length,
    availableContext: availableContext.length,
    missingParents: missing.length,
    conflicts: Object.freeze(conflicts)
  });
}

function neutralMergePreflight() {
  return Object.freeze({ schema: 'tiinex.archive.merge-preflight.v1', status: 'not-applicable', checkedParents: 0, matchedParents: 0, availableContext: 0, missingParents: 0, conflicts: Object.freeze([]) });
}
function conflict(code, path, expected, actual) { return Object.freeze({ code, path, expected, actual }); }
function parseJson(value) { try { return value ? JSON.parse(String(value)) : null; } catch { return null; } }
function cleanPath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/{2,}/g, '/').replace(/^\/+|\/+$/g, ''); }
function indexExistingRecords(records = []) {
  const map = new Map();
  for (const record of Array.isArray(records) ? records : []) {
    const path = cleanPath(record.path);
    if (path) map.set(path, record);
    if (record.id) map.set(String(record.id), record);
  }
  return map;
}
async function sha256Hex(value) {
  const bytes = value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : new TextEncoder().encode(String(value || ''));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
