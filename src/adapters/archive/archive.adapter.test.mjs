import assert from 'assert';
import { createHash } from 'node:crypto';
import { deflateRawSync } from 'zlib';
import {
  classifyArchiveEntry,
  createArchiveAdapter,
  materializeArchiveFiles,
  safeArchivePath,
  zipBufferHasEncryptedEntries,
  zipBufferToImportEntries
} from './archive.adapter.js';

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
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
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
  assert.equal(createArchiveAdapter().schema, 'tiinex.adapter.definition.v1');
  assert.equal(safeArchivePath('../evil.md'), '');
  assert.equal(safeArchivePath('/evil.md'), '');
  assert.equal(safeArchivePath('./a//b/trace.md'), 'a/b/trace.md');
  assert.equal(classifyArchiveEntry('viewer.workspace.md', '# Tiinex Viewer'), 'workspace');
  assert.equal(classifyArchiveEntry('docs/viewer.md', '# Tiinex Viewer\n\n## Workspace Entrypoints'), 'record', 'generic viewer docs must not become workspace candidates');
  assert.equal(classifyArchiveEntry('docs/explicit.md', '# Explicit\n\n- Current Schema: tiinex.workspace.v1'), 'workspace', 'explicit workspace schema can still become a candidate');
  assert.equal(classifyArchiveEntry('src/workspaces/workspace.config.js', 'const DEFAULT_WORKSPACE_MARKDOWN = `- Current Schema: tiinex.workspace.v1`;'), 'asset', 'embedded workspace markdown inside JS must remain an asset, not an open/merge candidate');
  assert.equal(classifyArchiveEntry('a/001.trace.md', '# A'), 'record');
  assert.equal(classifyArchiveEntry('assets/img.png', null), 'asset');

  const zip = makeZip([
    { name: 'viewer.workspace.md', content: '# Tiinex Viewer\n\n## Workspace Entrypoints\n' },
    { name: 'folder/001.trace.md', content: '# Leaf\n\nbody', method: 8 },
    { name: 'assets/picture.png', content: 'fakepng' },
    { name: '../skip.md', content: '# unsafe' }
  ]);
  const parsed = await zipBufferToImportEntries(zip);
  assert.equal(parsed.entries.length, 3, 'unsafe path should be skipped');
  assert(parsed.warnings.some((w) => w.code === 'archive.unsafe-path-skipped'));

  const result = await materializeArchiveFiles([fileFromZip('bundle.zip', zip)]);
  assert.equal(result.schema, 'tiinex.adapter.result.v1');
  assert.equal(result.records.length, 1);
  assert.equal(result.assets.length, 1);
  assert.equal(result.workspaceEntries.length, 1);
  assert.equal(result.records[0].path, 'folder/001.trace.md');
  assert.equal(result.workspaceEntries[0].path, 'viewer.workspace.md');
  assert.equal(result.diagnostics.recordCount, 1);
  assert.equal(result.diagnostics.assetCount, 1);
  assert.equal(result.diagnostics.suggestedWorkspaceName, 'Bundle');



  const portableArtifact = '# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n\n---\n\n# Portable Topic\n';
  const artifactBytes = Buffer.from(portableArtifact, 'utf8');
  const artifactSha = createHash('sha256').update(artifactBytes).digest('hex');
  const portableManifest = {
    schema: 'tiinex.portable.changeset.manifest.v1',
    version: 1,
    status: 'ready',
    profile: 'changeset-with-minimum-lineage-closure',
    material: [{
      path: '.topics/portable/topic.trace.md',
      kind: 'artifact',
      role: 'created',
      schemaId: 'tiinex.topic.v1',
      bytes: artifactBytes.length,
      sha256: artifactSha
    }],
    lineage: { closurePolicy: 'minimum-known-parent-closure', knownParents: [] },
    boundary: { bootstrapIncluded: false }
  };
  const portableManifestText = `${JSON.stringify(portableManifest, null, 2)}\n`;
  const portableManifestBytes = Buffer.from(portableManifestText, 'utf8');
  const portableChecksums = {
    schema: 'tiinex.portable.changeset.checksums.v1',
    version: 1,
    algorithm: 'sha256',
    files: [
      { path: '.topics/portable/topic.trace.md', bytes: artifactBytes.length, sha256: artifactSha },
      { path: 'manifest.json', bytes: portableManifestBytes.length, sha256: createHash('sha256').update(portableManifestBytes).digest('hex') }
    ]
  };
  const portableZip = makeZip([
    { name: '.topics/portable/topic.trace.md', content: portableArtifact },
    { name: 'manifest.json', content: portableManifestText },
    { name: 'checksums.json', content: `${JSON.stringify(portableChecksums, null, 2)}\n` },
    { name: 'rogue.json', content: '{"mustNotBecomeAsset":true}' }
  ]);
  const portableParsed = await zipBufferToImportEntries(portableZip);
  assert.equal(portableParsed.diagnostics.portableChangesetCount, 1);
  assert.equal(portableParsed.diagnostics.controlCount, 2);
  assert.equal(portableParsed.entries.filter((entry) => entry.kind === 'control').length, 2);
  assert.equal(portableParsed.entries.filter((entry) => entry.kind === 'record').length, 1);
  assert.equal(portableParsed.entries.some((entry) => entry.path === 'rogue.json'), false, 'undeclared package files must not become assets');
  assert(portableParsed.warnings.some((warning) => warning.code === 'archive.portable-changeset.undeclared-entry-skipped'));

  const portableResult = await materializeArchiveFiles([fileFromZip('portable.zip', portableZip)]);
  assert.equal(portableResult.records.length, 1);
  assert.equal(portableResult.assets.length, 0, 'portable manifest/checksums controls must not become assets');
  assert.equal(portableResult.diagnostics.controlCount, 2);
  assert.equal(portableResult.diagnostics.portableChangesetCount, 1);

  const tamperedPortableZip = makeZip([
    { name: '.topics/portable/topic.trace.md', content: `${portableArtifact}\ntampered\n` },
    { name: 'manifest.json', content: portableManifestText },
    { name: 'checksums.json', content: `${JSON.stringify(portableChecksums, null, 2)}\n` }
  ]);
  const tamperedPortableResult = await materializeArchiveFiles([fileFromZip('portable-tampered.zip', tamperedPortableZip)]);
  assert.equal(tamperedPortableResult.records.length, 0, 'checksum mismatch must block package materialization');
  assert.equal(tamperedPortableResult.assets.length, 0);
  assert(tamperedPortableResult.errors.some((error) => error.code === 'archive.portable-changeset.checksum-mismatch'));

  const largeAsset = makeZip([{ name: 'big/app.js', content: 'x'.repeat(160 * 1024), method: 8 }]);
  const largeResult = await materializeArchiveFiles([fileFromZip('large.zip', largeAsset)]);
  assert.equal(largeResult.assets.length, 1);
  assert.equal(largeResult.assets[0].content, '');
  assert.equal(largeResult.assets[0].dataUrl, '');
  assert.equal(largeResult.assets[0].previewState, 'omitted-large');

  const encrypted = makeZip([{ name: 'secret.md', content: '# Secret', encrypted: true }]);
  assert.equal(zipBufferHasEncryptedEntries(encrypted), true);
  const encryptedResult = await materializeArchiveFiles([fileFromZip('secret.zip', encrypted)]);
  assert.equal(encryptedResult.records.length, 0);
  assert(encryptedResult.errors.some((e) => e.code === 'archive.encrypted-entry'));

  console.log('✓ archive.adapter tests passed');
  process.exit(0);
} catch (err) {
  console.error('archive.adapter tests failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}
