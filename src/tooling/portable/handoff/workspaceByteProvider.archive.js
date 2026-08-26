import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';

export function inspectStoredWorkspaceArchiveBytes(bytesInput = new Uint8Array(), normalizeInnerPath = () => Object.freeze({ state: 'invalid', path: '' }), options = {}) {
  const bytes = options.ownedBytes === true && bytesInput instanceof Uint8Array ? bytesInput : packageFileBytes({ data: bytesInput });
  const findings = [];
  const entries = [];
  if (bytes.byteLength < 22) return deepFreeze({ state: 'invalid', entries: Object.freeze([]), findings: Object.freeze([finding('error', 'portable.handoff-workspace-provider.archive.truncated', 'Workspace archive is too small to be a qualified ZIP representation.')]) });
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let offset = 0;
  while (offset + 4 <= bytes.byteLength && view.getUint32(offset, true) === 0x04034b50) {
    if (offset + 30 > bytes.byteLength) { findings.push(finding('error', 'portable.handoff-workspace-provider.archive.local-header-truncated', 'Workspace archive local header is truncated.')); break; }
    const flags = view.getUint16(offset + 6, true);
    const method = view.getUint16(offset + 8, true);
    const crc = view.getUint32(offset + 14, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const uncompressedSize = view.getUint32(offset + 22, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > bytes.byteLength) { findings.push(finding('error', 'portable.handoff-workspace-provider.archive.entry-truncated', 'Workspace archive entry bytes exceed archive bounds.')); break; }
    let rawName = '';
    try { rawName = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength)); }
    catch { findings.push(finding('error', 'portable.handoff-workspace-provider.archive.path-utf8-invalid', 'Workspace archive entry name is not valid UTF-8.')); }
    const normalized = normalizeInnerPath(rawName);
    if (normalized.state !== 'qualified') findings.push(finding('error', 'portable.handoff-workspace-provider.archive.path-unsafe', 'Workspace archive contains an unsafe inner path.', { path: rawName }));
    if ((flags & 0x0001) !== 0) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.encrypted-unsupported', 'Encrypted workspace archive entries are unavailable to the qualified provider.', { path: rawName }));
    if ((flags & 0x0008) !== 0) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.data-descriptor-unsupported', 'Workspace archive data-descriptor entries are unavailable to the deterministic provider.', { path: rawName }));
    if (method !== 0) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.decoder-unavailable', 'Workspace archive entry codec is unavailable to the package-local stored-ZIP provider.', { path: rawName, method }));
    if (compressedSize !== uncompressedSize) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.size-shape-invalid', 'Stored workspace archive entry has divergent compressed/uncompressed sizes.', { path: rawName }));
    const data = bytes.subarray(dataStart, dataEnd);
    if (method === 0 && crc32(data) !== crc) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.crc-mismatch', 'Workspace archive entry CRC does not match exact carried bytes.', { path: rawName }));
    entries.push(deepFreeze({ rawPath: rawName, path: normalized.path || rawName, bytes: data.byteLength, sha256: sha256Hex(data), crc32: crc, method, localOffset: offset, data }));
    offset = dataEnd;
  }
  for (const path of duplicates(entries.map((entry) => entry.path))) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.path-duplicate', 'Workspace archive contains duplicate normalized inner paths.', { path }));

  const centralStart = offset;
  let centralCount = 0;
  const central = [];
  while (offset + 4 <= bytes.byteLength && view.getUint32(offset, true) === 0x02014b50) {
    if (offset + 46 > bytes.byteLength) { findings.push(finding('error', 'portable.handoff-workspace-provider.archive.central-header-truncated', 'Workspace archive central directory is truncated.')); break; }
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const crc = view.getUint32(offset + 16, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const nameStart = offset + 46;
    const next = nameStart + nameLength + extraLength + commentLength;
    if (next > bytes.byteLength) { findings.push(finding('error', 'portable.handoff-workspace-provider.archive.central-entry-truncated', 'Workspace archive central directory entry exceeds archive bounds.')); break; }
    let rawName = '';
    try { rawName = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength)); } catch { /* local finding already covers malformed names */ }
    central.push({ rawName, flags, method, crc, compressedSize, uncompressedSize, localOffset });
    centralCount += 1;
    offset = next;
  }
  if (offset + 22 > bytes.byteLength || view.getUint32(offset, true) !== 0x06054b50) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.eocd-missing', 'Workspace archive is missing a canonical end-of-central-directory record.'));
  else qualifyEndRecord({ bytes, view, offset, centralStart, centralCount, entries, findings });
  if (central.length === entries.length) compareCentralEntries(entries, central, findings);
  return deepFreeze({ state: findings.some((item) => item.severity === 'error') ? 'invalid' : 'qualified', entries: Object.freeze(entries), findings: Object.freeze(findings) });
}

function qualifyEndRecord({ bytes, view, offset, centralStart, centralCount, entries, findings }) {
  const disk = view.getUint16(offset + 4, true);
  const centralDisk = view.getUint16(offset + 6, true);
  const entriesDisk = view.getUint16(offset + 8, true);
  const entriesTotal = view.getUint16(offset + 10, true);
  const centralSize = view.getUint32(offset + 12, true);
  const declaredCentralOffset = view.getUint32(offset + 16, true);
  const commentLength = view.getUint16(offset + 20, true);
  if (disk !== 0 || centralDisk !== 0 || entriesDisk !== entriesTotal) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.multidisk-unsupported', 'Workspace archive multi-disk topology is unavailable to the package-local provider.'));
  if (entriesTotal !== entries.length || centralCount !== entries.length) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.entry-count-mismatch', 'Workspace archive local and central entry counts diverge.', { local: entries.length, central: centralCount, declared: entriesTotal }));
  if (declaredCentralOffset !== centralStart || centralSize !== (offset - centralStart)) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.central-directory-mismatch', 'Workspace archive central-directory location/size diverges from exact bytes.'));
  if (offset + 22 + commentLength !== bytes.byteLength) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.trailing-bytes', 'Workspace archive contains unqualified trailing bytes after the end record.'));
}

function compareCentralEntries(entries, central, findings) {
  for (let index = 0; index < entries.length; index += 1) {
    const local = entries[index];
    const item = central[index];
    if (item.rawName !== local.rawPath || item.method !== local.method || item.crc !== local.crc32 || item.compressedSize !== local.bytes || item.uncompressedSize !== local.bytes || item.localOffset !== local.localOffset) findings.push(finding('error', 'portable.handoff-workspace-provider.archive.central-entry-mismatch', 'Workspace archive central entry diverges from its local-header/byte representation.', { path: local.rawPath }));
  }
}
function duplicates(values = []) { const counts = new Map(); for (const value of values) counts.set(value, (counts.get(value) || 0) + 1); return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
const CRC_TABLE = makeCrcTable();
function crc32(buffer) { let crc = 0xffffffff; for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
function makeCrcTable() { const table = new Uint32Array(256); for (let index = 0; index < 256; index += 1) { let value = index; for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1); table[index] = value >>> 0; } return table; }
