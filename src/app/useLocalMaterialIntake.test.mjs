import assert from 'node:assert/strict';
import { passwordProviderForWindow } from './useLocalMaterialIntake.js';

assert.equal(passwordProviderForWindow(null), undefined, 'non-browser hosts must not invent a password prompt');
let promptText = '';
const provider = passwordProviderForWindow({ prompt(message) { promptText = message; return 'secret'; } });
assert.equal(await provider({ name: 'private.zip' }), 'secret');
assert.match(promptText, /private\.zip/, 'password prompt should name the selected archive');
console.log('✓ local material intake ownership helpers passed');
