import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_PLAYTHINGS_TILE_TOKENS,
  ROOT_PLAYTHINGS_TILE_METADATA,
  readPlaythingsTileMetadata,
  validatePlaythingsTileMetadata,
  tileCellForToken,
  resolvePlaythingsTileCompanion,
  resolvePlaythingsTileToken,
  rootPlaythingsTileCompanion,
  playthingsTilesCompanionPathForArtifactPath,
  playthingsTileCompanionFromAsset,
  findArtifactLocalPlaythingsTileCompanion
} from './playthings.tiles.js';

const rootPng = fileURLToPath(new URL('../assets/runtime/root.playthings.tiles.png', import.meta.url));
const metadata = readPlaythingsTileMetadata(fs.readFileSync(rootPng));
assert.ok(metadata, 'root PNG should carry its own iTXt tile metadata');
assert.equal(validatePlaythingsTileMetadata(metadata).status, 'valid');
assert.equal(DEFAULT_PLAYTHINGS_TILE_TOKENS.length, 64);
assert.equal(Object.keys(metadata.tokens).length, 64);
assert.deepEqual(tileCellForToken(metadata, 'terrain.grass'), { token:'terrain.grass', row:0, col:0, x:0, y:0, width:32, height:32 });
assert.deepEqual(tileCellForToken(metadata, 'utility.spare'), { token:'utility.spare', row:7, col:7, x:224, y:224, width:32, height:32 });
assert.equal(tileCellForToken(metadata, 'semantic.need.bed'), null, 'unknown semantic facts must not become presentation tokens implicitly');

const artifactCompanion={id:'artifact',metadata};
const schemaCompanion={id:'task',metadata};
assert.equal(resolvePlaythingsTileCompanion({artifact:{schemaId:'tiinex.task.v1',playthingsTilesCompanion:artifactCompanion},schemaCompanions:new Map([['tiinex.task.v1',schemaCompanion]])}).resolution,'artifact-local');
assert.equal(resolvePlaythingsTileCompanion({schemaId:'tiinex.task.v1',schemaCompanions:new Map([['tiinex.task.v1',schemaCompanion]])}).resolution,'schema-exact');
const inherited=resolvePlaythingsTileCompanion({schemaId:'tiinex.discovery.finding.v1',schemaCompanions:new Map([['tiinex.discovery.v1',{id:'discovery',metadata}]])});
assert.equal(inherited.resolution,'schema-ancestor');
assert.equal(inherited.resolvedSchemaId,'tiinex.discovery.v1');
assert.equal(resolvePlaythingsTileCompanion({schemaId:'unknown.custom.v1'}).resolution,'root-fallback');
assert.equal(resolvePlaythingsTileToken({token:'interior.bed',schemaId:'tiinex.task.v1'}).cell.token,'interior.bed');
const incomplete={id:'custom',metadata:{...ROOT_PLAYTHINGS_TILE_METADATA,tokens:{'terrain.grass':{row:0,col:0}}}};
assert.equal(resolvePlaythingsTileToken({token:'interior.bed',artifact:{schemaId:'tiinex.task.v1',playthingsTilesCompanion:incomplete}}).resolution,'root-token-fallback');
assert.equal(resolvePlaythingsTileToken({token:'does.not.exist',schemaId:'tiinex.task.v1'}).cell,null);
assert.equal(rootPlaythingsTileCompanion.semanticAuthority,'none');


assert.equal(playthingsTilesCompanionPathForArtifactPath('.topics/tiinex.trace.md'), '.topics/tiinex.playthings.tiles.png');
assert.equal(playthingsTilesCompanionPathForArtifactPath('.topics/.schemas/tiinex.task.v1.schema.md'), '.topics/.schemas/tiinex.task.v1.playthings.tiles.png');
const rootBytes = fs.readFileSync(rootPng);
const rootDataUrl = `data:image/png;base64,${rootBytes.toString('base64')}`;
const localAsset = { id:'asset:tiles', path:'.topics/playthings.task.playthings.tiles.png', type:'image/png', dataUrl:rootDataUrl, previewState:'available' };
const assetCompanion = playthingsTileCompanionFromAsset(localAsset);
assert.ok(assetCompanion, 'loaded PNG bytes with valid embedded metadata should qualify as a tile companion');
assert.equal(assetCompanion.metadata.tokens['interior.bed'].row, 4);
assert.equal(findArtifactLocalPlaythingsTileCompanion({ artifactPath:'.topics/playthings.task.trace.md', assets:[localAsset] })?.id, 'asset:tiles');
assert.equal(findArtifactLocalPlaythingsTileCompanion({ artifactPath:'.topics/other.trace.md', assets:[localAsset] }), null);
assert.equal(playthingsTileCompanionFromAsset({ ...localAsset, dataUrl:'' }), null, 'metadata-only asset must not pretend to be runtime-ready');

console.log('✓ Playthings tiles metadata/token/fallback/asset-binding cases passed');
