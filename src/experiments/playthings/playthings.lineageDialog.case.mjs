import assert from 'node:assert/strict';
import { playthingsLineageSnapshotFor } from './playthings.lineage.js';

const root = { id: 'root-record', title: 'Root Task', path: '.topics/root.trace.md', schemaId: 'tiinex.task.v1', trace: '', origin: '' };
const child = { id: 'child-record', title: 'Child Task', path: '.topics/child.trace.md', schemaId: 'tiinex.task.v1', trace: 'record:root-record', origin: '' };
const state = { activeWorkspaceId: 'site', workspaces: [{ id: 'site', title: 'Tiinex Site', records: [root, child] }] };
const snapshot = playthingsLineageSnapshotFor(state, 'child-record', 'site');
assert.equal(snapshot.workspaceId, 'site');
assert.equal(snapshot.selectedRecordId, 'child-record');
assert.equal(snapshot.selectedTitle, 'Child Task');
assert.ok(snapshot.selectedTraversal, 'Lineage Verse uses the existing loaded Tiinex lineage projection');
assert.deepEqual(snapshot.selectedTraversal.nodes.map((node) => node.id), ['child-record', 'root-record']);
assert.equal(snapshot.selectedTraversal.rootReached, true);
assert.equal(snapshot.semanticAuthority, 'none');
console.log('✓ Playthings in-world Lineage Verse projection passed');
