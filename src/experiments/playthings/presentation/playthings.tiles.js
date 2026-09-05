import { schemaRegistry } from '../../../schemas/registry.js';
import { resolvePlaythingsPresentationCompanion } from './playthings.presentation.js';

export const PLAYTHINGS_TILE_METADATA_KEY = 'tiinex.playthings.tiles';
export const PLAYTHINGS_TILE_RUNTIME = Object.freeze({
  width: 256,
  height: 256,
  cols: 8,
  rows: 8,
  cellWidth: 32,
  cellHeight: 32
});

export const DEFAULT_PLAYTHINGS_TILE_TOKENS = Object.freeze([
  'terrain.grass','terrain.dirt','terrain.stone','terrain.water','terrain.sand','terrain.mud','terrain.gravel','terrain.earth',
  'road.path','road.cobble','road.bridge','road.planks','wear.track','wear.scuff','wear.crack','wear.patch',
  'interior.floor.wood','interior.floor.stone','interior.floor.tile','interior.wall.brick','interior.wall.plaster','interior.wall.wood','interior.roof.slate','interior.window',
  'interior.door.closed','interior.door.open','interior.stairs.up','interior.stairs.down','interior.fence','interior.gate','interior.railing','interior.sign',
  'interior.table','interior.chair','interior.bed','interior.desk','interior.shelf','interior.cabinet','interior.crate','interior.barrel',
  'workshop.workbench','workshop.machine','workshop.anvil','workshop.furnace','workshop.gears','workshop.pipe','archive.shelf','archive.stack',
  'nature.tree','nature.shrub','nature.rock','nature.flower','nature.grass.tuft','nature.stump','nature.log','nature.mushroom',
  'utility.lamp','utility.post','utility.well','utility.pump','artifact.relic','artifact.blueprint','artifact.package','utility.spare'
]);

function defaultTokenMap() {
  return Object.freeze(Object.fromEntries(DEFAULT_PLAYTHINGS_TILE_TOKENS.map((token, index) => [token, Object.freeze({ row: Math.floor(index / 8), col: index % 8 })])));
}

export const ROOT_PLAYTHINGS_TILE_METADATA = Object.freeze({
  format: 'tiinex.playthings.tiles',
  version: 1,
  family: 'place-tiles-runtime',
  semanticAuthority: 'none-presentation-only',
  size: Object.freeze([256, 256]),
  mode: 'RGBA',
  grid: Object.freeze({ cols: 8, rows: 8 }),
  cell: Object.freeze({ width: 32, height: 32 }),
  tokens: defaultTokenMap()
});

export const rootPlaythingsTileCompanion = Object.freeze({
  id: 'playthings.tiles.root.v1',
  targetSchemaId: 'tiinex.root.v1',
  assetRelativePath: '../assets/runtime/root.playthings.tiles.png',
  url: new URL('../assets/runtime/root.playthings.tiles.png', import.meta.url).href,
  metadata: ROOT_PLAYTHINGS_TILE_METADATA,
  semanticAuthority: 'none'
});

export function rootPlaythingsTileUrl() {
  return new URL('../assets/runtime/root.playthings.tiles.png', import.meta.url).href;
}

function textDecoder() {
  return typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;
}

function u32be(bytes, offset) {
  return (((bytes[offset] << 24) >>> 0) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readNullTerminated(bytes, offset, limit) {
  let cursor = offset;
  while (cursor < limit && bytes[cursor] !== 0) cursor += 1;
  if (cursor >= limit) return null;
  const decoder = textDecoder();
  if (!decoder) return null;
  return { text: decoder.decode(bytes.subarray(offset, cursor)), next: cursor + 1 };
}

export function readPlaythingsTileMetadata(input) {
  const bytes = input instanceof Uint8Array ? input : input instanceof ArrayBuffer ? new Uint8Array(input) : null;
  if (!bytes || bytes.length < 12) return null;
  const sig = [137,80,78,71,13,10,26,10];
  if (!sig.every((value, index) => bytes[index] === value)) return null;
  const decoder = textDecoder();
  if (!decoder) return null;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = u32be(bytes, offset);
    const typeStart = offset + 4;
    const dataStart = typeStart + 4;
    const dataEnd = dataStart + length;
    const next = dataEnd + 4;
    if (next > bytes.length) return null;
    const type = decoder.decode(bytes.subarray(typeStart, typeStart + 4));
    if (type === 'iTXt') {
      const keyword = readNullTerminated(bytes, dataStart, dataEnd);
      if (keyword && keyword.text === PLAYTHINGS_TILE_METADATA_KEY) {
        let cursor = keyword.next;
        if (cursor + 2 > dataEnd) return null;
        const compressionFlag = bytes[cursor]; cursor += 2; // compression method is currently ignored after flag check.
        if (compressionFlag !== 0) return null;
        const language = readNullTerminated(bytes, cursor, dataEnd); if (!language) return null; cursor = language.next;
        const translated = readNullTerminated(bytes, cursor, dataEnd); if (!translated) return null; cursor = translated.next;
        try { return JSON.parse(decoder.decode(bytes.subarray(cursor, dataEnd))); } catch { return null; }
      }
    }
    if (type === 'IEND') break;
    offset = next;
  }
  return null;
}


function normalizeAssetPath(value = '') {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '');
}

export function playthingsTilesCompanionPathForArtifactPath(artifactPath = '') {
  const path = normalizeAssetPath(artifactPath);
  if (!path) return '';
  const suffixes = ['.trace.md', '.schema.md', '.workspace.md', '.md'];
  const suffix = suffixes.find((candidate) => path.toLowerCase().endsWith(candidate));
  const base = suffix ? path.slice(0, -suffix.length) : path.replace(/\.[^/.]+$/, '');
  return `${base}.playthings.tiles.png`;
}

function dataUrlBytes(value = '') {
  const text = String(value || '');
  const match = text.match(/^data:([^;,]*)(;base64)?,(.*)$/s);
  if (!match) return null;
  try {
    if (match[2]) {
      const binary = typeof atob === 'function' ? atob(match[3] || '') : '';
      if (!binary && match[3]) return null;
      const out = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i) & 255;
      return out;
    }
    return new TextEncoder().encode(decodeURIComponent(String(match[3] || '').replace(/\+/g, '%20')));
  } catch (_) { return null; }
}

function assetByteView(asset = {}) {
  if (asset?.bytes instanceof Uint8Array) return asset.bytes;
  if (asset?.bytes instanceof ArrayBuffer) return new Uint8Array(asset.bytes);
  if (ArrayBuffer.isView(asset?.bytes)) return new Uint8Array(asset.bytes.buffer, asset.bytes.byteOffset, asset.bytes.byteLength);
  if (Array.isArray(asset?.bytes) && asset.bytes.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)) return Uint8Array.from(asset.bytes);
  return dataUrlBytes(asset?.dataUrl || '');
}

export function playthingsTileCompanionFromAsset(asset = {}) {
  const path = normalizeAssetPath(asset?.path || asset?.name || '');
  if (!/\.playthings\.tiles\.png$/i.test(path)) return null;
  const bytes = assetByteView(asset);
  if (!bytes?.length) return null;
  const metadata = readPlaythingsTileMetadata(bytes);
  if (!metadata || validatePlaythingsTileMetadata(metadata).status !== 'valid') return null;
  const url = String(asset?.dataUrl || asset?.url || asset?.rawUrl || '').trim();
  if (!url) return null;
  return Object.freeze({
    id: String(asset?.id || `playthings.tiles:${path}`),
    path,
    url,
    metadata,
    sourceAssetId: String(asset?.id || ''),
    semanticAuthority: 'none'
  });
}

export function findArtifactLocalPlaythingsTileCompanion({ artifactPath = '', assets = [] } = {}) {
  const target = playthingsTilesCompanionPathForArtifactPath(artifactPath);
  if (!target) return null;
  const asset = (Array.isArray(assets) ? assets : []).find((candidate) => normalizeAssetPath(candidate?.path || candidate?.name || '') === target) || null;
  return asset ? playthingsTileCompanionFromAsset(asset) : null;
}

export function validatePlaythingsTileMetadata(metadata = {}) {
  const findings = [];
  if (metadata?.format !== 'tiinex.playthings.tiles') findings.push('format');
  if (Number(metadata?.grid?.cols) !== 8 || Number(metadata?.grid?.rows) !== 8) findings.push('grid');
  if (Number(metadata?.cell?.width) !== 32 || Number(metadata?.cell?.height) !== 32) findings.push('cell');
  const size = Array.isArray(metadata?.size) ? metadata.size : [];
  if (Number(size[0]) !== 256 || Number(size[1]) !== 256) findings.push('size');
  const tokens = metadata?.tokens && typeof metadata.tokens === 'object' ? metadata.tokens : {};
  if (Object.keys(tokens).length !== 64) findings.push('tokens');
  for (const [token, cell] of Object.entries(tokens)) {
    if (!token || !Number.isInteger(cell?.row) || !Number.isInteger(cell?.col) || cell.row < 0 || cell.row > 7 || cell.col < 0 || cell.col > 7) {
      findings.push(`token:${token || 'empty'}`);
      break;
    }
  }
  return Object.freeze({ status: findings.length ? 'invalid' : 'valid', findings: Object.freeze(findings), semanticAuthority: 'none' });
}

export function tileCellForToken(metadata = ROOT_PLAYTHINGS_TILE_METADATA, token = '') {
  const normalized = String(token || '').trim();
  const cell = metadata?.tokens?.[normalized] || null;
  if (!cell) return null;
  return Object.freeze({ token: normalized, row: Number(cell.row), col: Number(cell.col), x: Number(cell.col) * 32, y: Number(cell.row) * 32, width: 32, height: 32 });
}

function companionMapValue(map, key) {
  if (!key || !map) return null;
  if (map instanceof Map) return map.get(key) || null;
  return typeof map === 'object' ? map[key] || null : null;
}

function artifactTileCompanion(artifact = {}) {
  return artifact?.playthingsTilesCompanion || artifact?.presentation?.playthingsTilesCompanion || null;
}

export function resolvePlaythingsTileCompanion({ artifact = null, schemaId = '', schemaCompanions = null, rootCompanion = rootPlaythingsTileCompanion } = {}) {
  const local = artifactTileCompanion(artifact || {});
  if (local) return Object.freeze({ companion: local, resolution: 'artifact-local', requestedSchemaId: String(schemaId || artifact?.schemaId || ''), resolvedSchemaId: String(schemaId || artifact?.schemaId || ''), semanticAuthority: 'none' });

  const requestedSchemaId = String(schemaId || artifact?.schemaId || '').trim() || 'tiinex.root.v1';
  const exactSchema = companionMapValue(schemaCompanions, requestedSchemaId);
  if (exactSchema) return Object.freeze({ companion: exactSchema, resolution: 'schema-exact', requestedSchemaId, resolvedSchemaId: requestedSchemaId, semanticAuthority: 'none' });

  // Reuse the existing presentation-companion resolution so tiles and scene grammar inherit through one schema ancestry interpretation.
  const presentation = resolvePlaythingsPresentationCompanion(requestedSchemaId);
  if (presentation.resolvedSchemaId && presentation.resolvedSchemaId !== requestedSchemaId) {
    const inherited = companionMapValue(schemaCompanions, presentation.resolvedSchemaId);
    if (inherited) return Object.freeze({ companion: inherited, resolution: 'schema-ancestor', requestedSchemaId, resolvedSchemaId: presentation.resolvedSchemaId, inheritedDepth: presentation.inheritedDepth, semanticAuthority: 'none' });
  }

  // If the presentation registry has no explicit companion for an intermediate schema, continue through canonical schema parents before root.
  let cursor = String(schemaRegistry.byId?.get(requestedSchemaId)?.parentSchemaId || '').trim();
  const visited = new Set([requestedSchemaId]);
  let depth = 1;
  while (cursor && !visited.has(cursor)) {
    visited.add(cursor);
    const inherited = companionMapValue(schemaCompanions, cursor);
    if (inherited) return Object.freeze({ companion: inherited, resolution: 'schema-ancestor', requestedSchemaId, resolvedSchemaId: cursor, inheritedDepth: depth, semanticAuthority: 'none' });
    cursor = String(schemaRegistry.byId?.get(cursor)?.parentSchemaId || '').trim();
    depth += 1;
  }

  return Object.freeze({ companion: rootCompanion, resolution: 'root-fallback', requestedSchemaId, resolvedSchemaId: 'tiinex.root.v1', inheritedDepth: Math.max(1, depth), semanticAuthority: 'none' });
}

export function resolvePlaythingsTileToken({ token = '', artifact = null, schemaId = '', schemaCompanions = null, rootCompanion = rootPlaythingsTileCompanion } = {}) {
  const resolved = resolvePlaythingsTileCompanion({ artifact, schemaId, schemaCompanions, rootCompanion });
  const metadata = resolved.companion?.metadata || ROOT_PLAYTHINGS_TILE_METADATA;
  const cell = tileCellForToken(metadata, token);
  if (cell) return Object.freeze({ ...resolved, cell, token: cell.token });
  if (resolved.companion !== rootCompanion) {
    const fallback = tileCellForToken(rootCompanion?.metadata || ROOT_PLAYTHINGS_TILE_METADATA, token);
    if (fallback) return Object.freeze({ companion: rootCompanion, resolution: 'root-token-fallback', requestedSchemaId: resolved.requestedSchemaId, resolvedSchemaId: 'tiinex.root.v1', semanticAuthority: 'none', cell: fallback, token: fallback.token });
  }
  return Object.freeze({ ...resolved, cell: null, token: String(token || '').trim() });
}
