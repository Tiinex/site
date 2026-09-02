import assert from 'node:assert/strict';
import { PLAYTHINGS_PRESENTATION_PALETTE, playthingsSeedAngle, playthingsSeedIndex, playthingsSeedUnit, playthingsShirtColor } from './playthings.seed.js';

const checksum = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
assert.equal(playthingsSeedUnit(checksum, 'shirt'), playthingsSeedUnit(checksum, 'shirt'), 'same seed and purpose must be reproducible');
assert.notEqual(playthingsSeedUnit(checksum, 'shirt'), playthingsSeedUnit(checksum, 'scan-angle'), 'purpose namespaces must decorrelate presentation choices');
assert.equal(playthingsShirtColor(checksum), playthingsShirtColor(checksum), 'shirt color must be recoverable from the same seed');
assert.equal(PLAYTHINGS_PRESENTATION_PALETTE.includes(playthingsShirtColor(checksum)), true);
assert.equal(playthingsSeedIndex(checksum, 'palette', 8) >= 0 && playthingsSeedIndex(checksum, 'palette', 8) < 8, true);
assert.equal(playthingsSeedAngle(checksum) >= 0 && playthingsSeedAngle(checksum) < Math.PI * 2, true);
console.log('✓ Playthings deterministic presentation entropy passed');
