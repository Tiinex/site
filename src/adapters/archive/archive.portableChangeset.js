const PORTABLE_CHANGESET_MANIFEST_SCHEMA_ID = 'tiinex.portable.changeset.manifest.v1';
const PORTABLE_CHANGESET_CHECKSUMS_SCHEMA_ID = 'tiinex.portable.changeset.checksums.v1';

export async function qualifyPortableChangesetEntries(entries = [], warnings = [], errors = [], options = {}) {
  const safePath = typeof options.safePath === 'function' ? options.safePath : (value) => String(value || '').trim();
  const isMarkdownPath = typeof options.isMarkdownPath === 'function' ? options.isMarkdownPath : () => false;
  const manifestEntries = entries.filter((entry) => entry.path === 'manifest.json');
  if (manifestEntries.length !== 1 || typeof manifestEntries[0].content !== 'string') return unchanged(entries);
  const manifest = parseJsonObject(manifestEntries[0].content);
  if (!manifest || manifest.schema !== PORTABLE_CHANGESET_MANIFEST_SCHEMA_ID) return unchanged(entries);

  const checksumsEntries = entries.filter((entry) => entry.path === 'checksums.json');
  const controls = [controlEntry(manifestEntries[0], 'manifest')];
  if (checksumsEntries.length === 1) controls.push(controlEntry(checksumsEntries[0], 'checksums'));
  const fail = (code, ref, message) => errors.push({ code, ref, message });

  if (checksumsEntries.length !== 1 || typeof checksumsEntries[0]?.content !== 'string') {
    fail('archive.portable-changeset.checksums-missing', 'checksums.json', 'Portable changeset requires exactly one readable root checksums.json control file.');
    return blocked(controls);
  }
  const checksums = parseJsonObject(checksumsEntries[0].content);
  if (!checksums || checksums.schema !== PORTABLE_CHANGESET_CHECKSUMS_SCHEMA_ID || checksums.algorithm !== 'sha256') {
    fail('archive.portable-changeset.checksums-invalid', 'checksums.json', 'Portable changeset checksum control file is unsupported or invalid.');
    return blocked(controls);
  }

  const material = Array.isArray(manifest.material) ? manifest.material : [];
  const fileEntries = indexEntries(entries);
  const checksumEntries = indexChecksums(checksums.files, safePath, fail);
  await verifyPortableEntry(manifestEntries[0], checksumEntries.get('manifest.json'), '', fail);

  const allowedPaths = new Set(['manifest.json', 'checksums.json']);
  const materialEntries = [];
  for (const declaration of material) {
    const declaredPath = safePath(declaration?.path || '');
    if (!declaredPath || declaredPath === '.bootstrap' || declaredPath.startsWith('.bootstrap/')) {
      fail('archive.portable-changeset.material-path-invalid', String(declaration?.path || ''), 'Portable changeset material path is unsafe or transport-reserved.');
      continue;
    }
    if (allowedPaths.has(declaredPath)) {
      fail('archive.portable-changeset.material-path-duplicate', declaredPath, 'Portable changeset material paths must be unique and cannot replace control files.');
      continue;
    }
    allowedPaths.add(declaredPath);
    const matches = fileEntries.get(declaredPath) || [];
    if (matches.length !== 1) {
      fail(matches.length ? 'archive.portable-changeset.material-duplicate' : 'archive.portable-changeset.material-missing', declaredPath, matches.length ? 'Portable changeset material path appears more than once.' : 'Declared portable changeset material is missing.');
      continue;
    }
    const kind = String(declaration?.kind || '').trim();
    if (kind === 'artifact' && !isMarkdownPath(declaredPath)) {
      fail('archive.portable-changeset.artifact-path-invalid', declaredPath, 'Portable artifact material must use a supported Markdown artifact path.');
      continue;
    }
    if (kind !== 'artifact' && kind !== 'asset') {
      fail('archive.portable-changeset.material-kind-unsupported', declaredPath, 'Portable changeset material kind must be artifact or asset.');
      continue;
    }
    await verifyPortableEntry(matches[0], checksumEntries.get(declaredPath), String(declaration?.sha256 || ''), fail);
    materialEntries.push(Object.freeze({
      ...matches[0],
      kind: kind === 'artifact' ? 'record' : 'asset',
      packageRole: kind,
      packageDeclaration: Object.freeze({ ...declaration })
    }));
  }

  for (const entry of entries) {
    if (allowedPaths.has(entry.path)) continue;
    warnings.push({ code: 'archive.portable-changeset.undeclared-entry-skipped', ref: entry.path, message: 'Undeclared portable changeset entry was skipped instead of becoming workspace material.' });
  }
  if (errors.some((entry) => String(entry.code || '').startsWith('archive.portable-changeset.'))) return blocked(controls);
  return Object.freeze({ entries: Object.freeze([...controls, ...materialEntries]), detected: true, controlCount: controls.length });
}

function unchanged(entries) {
  return Object.freeze({ entries, detected: false, controlCount: 0 });
}
function blocked(controls) {
  return Object.freeze({ entries: Object.freeze(controls), detected: true, controlCount: controls.length });
}
function controlEntry(entry, packageRole) {
  return Object.freeze({ ...entry, kind: 'control', packageRole });
}
function indexEntries(entries) {
  const output = new Map();
  for (const entry of entries) {
    if (!output.has(entry.path)) output.set(entry.path, []);
    output.get(entry.path).push(entry);
  }
  return output;
}
function indexChecksums(files, safePath, fail) {
  const output = new Map();
  for (const entry of Array.isArray(files) ? files : []) {
    const path = safePath(entry?.path || '');
    if (!path || output.has(path)) {
      fail('archive.portable-changeset.checksum-entry-invalid', String(entry?.path || ''), 'Portable changeset checksum paths must be safe and unique.');
      continue;
    }
    output.set(path, entry);
  }
  return output;
}
async function verifyPortableEntry(entry, checksumEntry, manifestSha256, fail) {
  if (!checksumEntry) {
    fail('archive.portable-changeset.checksum-missing', entry?.path || '', 'Portable changeset entry has no checksum declaration.');
    return;
  }
  const bytes = bytesFrom(entry?.bytes || []);
  const actual = await sha256Hex(bytes);
  const expected = String(checksumEntry.sha256 || '').trim();
  const expectedBytes = Number(checksumEntry.bytes || 0);
  if (!/^[a-f0-9]{64}$/.test(expected) || expectedBytes !== bytes.byteLength || expected !== actual) {
    fail('archive.portable-changeset.checksum-mismatch', entry?.path || '', 'Portable changeset entry does not match its declared bytes and SHA-256 digest.');
  }
  if (manifestSha256 && manifestSha256 !== actual) {
    fail('archive.portable-changeset.manifest-digest-mismatch', entry?.path || '', 'Portable changeset material does not match the digest declared in manifest.json.');
  }
}
function parseJsonObject(value = '') {
  try {
    const parsed = JSON.parse(String(value || ''));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
async function sha256Hex(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error('archive.sha256.bridge-unavailable');
  const view = bytesFrom(bytes);
  const buffer = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', buffer));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
function bytesFrom(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  return new Uint8Array(value || []);
}
