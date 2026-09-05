import assert from 'node:assert/strict';
import { PLAYTHINGS_PRESENTATION_PALETTE, playthingsRoleHat, playthingsSeedAngle, playthingsSeedIndex, playthingsSeedUnit, playthingsShirtColor } from './playthings.seed.js';

const checksum = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
assert.equal(playthingsSeedUnit(checksum, 'shirt'), playthingsSeedUnit(checksum, 'shirt'), 'same seed and purpose must be reproducible');
assert.notEqual(playthingsSeedUnit(checksum, 'shirt'), playthingsSeedUnit(checksum, 'scan-angle'), 'purpose namespaces must decorrelate presentation choices');
assert.equal(playthingsShirtColor(checksum), playthingsShirtColor(checksum), 'shirt color must be recoverable from the same seed');
assert.equal(PLAYTHINGS_PRESENTATION_PALETTE.includes(playthingsShirtColor(checksum)), true);
assert.equal(playthingsSeedIndex(checksum, 'palette', 8) >= 0 && playthingsSeedIndex(checksum, 'palette', 8) < 8, true);
assert.equal(playthingsSeedAngle(checksum) >= 0 && playthingsSeedAngle(checksum) < Math.PI * 2, true);
const anchorHat = playthingsRoleHat('Anchor');
assert.deepEqual(anchorHat, playthingsRoleHat('anchor'), 'same normalized role must always get the same hat shape and color');
assert.equal(anchorHat.visible, true);
assert.notDeepEqual(playthingsRoleHat('Anchor'), playthingsRoleHat('Loom'), 'different roles may vary role livery deterministically');
console.log('✓ Playthings deterministic presentation entropy passed');
