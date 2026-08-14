import assert from 'assert';
import { deflateRawSync } from 'zlib';
import { materializeArchiveFiles } from '../adapters/archive/archive.adapter.js';
import { applyLocalAdapterResultToWorkspace } from '../workspaces/workspace.import.js';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const encoder = new TextEncoder();

function crc32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  return table;
}
const CRC = crc32Table();
function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function u16(n){ const b=Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function u32(n){ const b=Buffer.alloc(4); b.writeUInt32LE(n>>>0); return b; }
function dosTime(){ return Buffer.from([0,0,0,0]); }
function makeZip(entries) {
  const locals=[]; const centrals=[]; let offset=0;
  for (const entry of entries) {
    const name=Buffer.from(entry.name);
    const plain=encoder.encode(entry.content || '');
    const compressed=entry.method === 8 ? deflateRawSync(plain) : Buffer.from(plain);
    const method=entry.method || 0;
    const flag=entry.encrypted ? 1 : 0x0800;
    const crc=crc32(plain);
    const local=Buffer.concat([u32(0x04034b50), u16(20), u16(flag), u16(method), dosTime(), u32(crc), u32(compressed.length), u32(plain.length), u16(name.length), u16(0), name, compressed]);
    locals.push(local);
    const central=Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(flag), u16(method), dosTime(), u32(crc), u32(compressed.length), u32(plain.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]);
    centrals.push(central);
    offset += local.length;
  }
  const cd=Buffer.concat(centrals);
  const eocd=Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(cd.length), u32(offset), u16(0)]);
  return Buffer.concat([...locals, cd, eocd]);
}
function fileFromZip(name, zip) {
  return { name, size: zip.length, type: 'application/zip', arrayBuffer: async () => zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) };
}

try {
  const bundle = makeZip([
    { name: 'viewer.workspace.md', content: '# PoC Import Workspace\n\n## Workspace Entrypoints\n' },
    { name: 'notes/001-alpha.trace.md', content: '# Alpha\n\nBody', method: 8 },
    { name: 'notes/beta.md', content: '# Beta\n\nBody', method: 8 },
    { name: 'assets/diagram.svg', content: '<svg></svg>' },
    { name: '../evil.md', content: '# Evil' }
  ]);
  const adapterResult = await materializeArchiveFiles([fileFromZip('poc-loop.zip', bundle)]);
  assert.equal(adapterResult.workspaceEntries.length, 1);
  assert.equal(adapterResult.records.length, 2);
  assert.equal(adapterResult.assets.length, 1);
  assert(adapterResult.warnings.some((warning) => warning.code === 'archive.unsafe-path-skipped'));

  const applied = applyLocalAdapterResultToWorkspace(lifecycle, lifecycle.makeEmptyAppState(), '', adapterResult, { clock: () => '2026-07-20T22:00:00.000Z' });
  assert.equal(applied.ok, true);
  assert.equal(applied.workspaceOpened, true);
  const workspace = lifecycle.activeWorkspace(applied.state);
  assert.equal(workspace.workspaceImport.path, 'viewer.workspace.md');
  assert.equal(workspace.records.length, 2);
  assert.equal(workspace.assets.length, 1);
  assert.equal(workspace.records.filter((record) => record.source?.kind === lifecycle.SESSION_SOURCE_KIND).length, 2, 'all archive leaves remain local/session');
  assert.equal(workspace.records.filter((record) => record.source?.adapterId === 'github').length, 0, 'archive import must never infer GitHub provenance');
  assert.equal(workspace.importResults[0].counts.warnings, 1);

  const repeated = applyLocalAdapterResultToWorkspace(lifecycle, applied.state, workspace.id, adapterResult, { clock: () => '2026-07-20T22:01:00.000Z' });
  assert.equal(repeated.ok, false, 'repeat import with overlapping local paths must not silently upsert');
  assert.equal(repeated.error, 'import.conflict.requires-resolution');
  assert(repeated.conflicts.some((conflict) => conflict.type === 'trace-slot'), 'PoC lineage-slot conflicts are detected even when trace slugs differ');
  assert(repeated.conflicts.some((conflict) => conflict.type === 'path'), 'same-path conflicts require an explicit user choice');

  const replaced = applyLocalAdapterResultToWorkspace(lifecycle, applied.state, workspace.id, adapterResult, { clock: () => '2026-07-20T22:02:00.000Z', conflictResolution: 'replace' });
  const afterReplace = lifecycle.activeWorkspace(replaced.state);
  assert.equal(replaced.ok, true);
  assert.equal(afterReplace.records.length, 2, 'replace keeps canonical local artifact paths without creating duplicates');
  assert.equal(afterReplace.assets.length, 1, 'replace keeps canonical local asset path');
  assert.equal(afterReplace.workspaceMarkdown, adapterResult.workspaceEntries[0].markdown, 'replace updates the current workspace artifact rather than adding a duplicate workspace record');

  const siblinged = applyLocalAdapterResultToWorkspace(lifecycle, applied.state, workspace.id, adapterResult, { clock: () => '2026-07-20T22:03:00.000Z', conflictResolution: 'sibling' });
  const afterSibling = lifecycle.activeWorkspace(siblinged.state);
  assert.equal(siblinged.ok, true);
  assert(afterSibling.records.length > workspace.records.length, 'Import as sibling preserves existing material and adds renamed incoming material');
  assert(afterSibling.records.some((record) => /notes\/002-/.test(record.path || '')), 'trace sibling import moves the conflicting lineage slot forward');

  console.log('✓ PoC local/archive parity tests passed');
  process.exit(0);
} catch (error) {
  console.error('PoC local/archive parity tests failed:', error && error.stack ? error.stack : error);
  process.exit(1);
}
