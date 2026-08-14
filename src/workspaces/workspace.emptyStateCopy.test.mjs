import assert from 'node:assert/strict';
import { workspaceEmptyStateCopy } from './workspace.emptyStateCopy.js';

const loading = workspaceEmptyStateCopy({ progress: { active: true, label: 'Tiinex docs workspace discovery starting from explicit default config' } });
assert.equal(loading.message, 'Loading workspace material…');
assert.match(loading.hint, /Tiinex docs workspace discovery/);

const empty = workspaceEmptyStateCopy({});
assert.equal(empty.message, 'No material yet.');
assert.equal(empty.hint, '');

const receipt = workspaceEmptyStateCopy({ summary: { latestImport: { message: 'Tiinex docs: source boundary registered · no materialization requested.' } } });
assert.equal(receipt.message, 'No readable material was produced.');
assert.match(receipt.hint, /source boundary registered/);

console.log('✓ workspace empty-state copy tests passed');
