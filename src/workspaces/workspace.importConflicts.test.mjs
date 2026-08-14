import assert from 'node:assert/strict';
import { detectLocalImportConflicts, resolveLocalImportConflicts } from './workspace.importConflicts.js';

const local = { adapterId: 'local', kind: 'local-session' };
const workspace = {
  id: 'w',
  workspaceImport: { path: 'viewer.workspace.md' },
  source: local,
  records: [
    { path: 'notes/001-old.trace.md', source: local, sourceMode: 'manual-files' },
    { path: 'notes/readme.md', source: local, sourceMode: 'manual-files' }
  ],
  assets: [{ path: 'assets/diagram.svg', source: local, sourceMode: 'local-asset' }]
};
const incoming = {
  records: [
    { path: 'notes/001-new.trace.md', markdown: '# New' },
    { path: 'notes/readme.md', markdown: '# Readme' }
  ],
  assets: [{ path: 'assets/diagram.svg', content: '<svg />' }],
  workspaceEntries: [{ path: 'viewer.workspace.md', markdown: '# Viewer' }],
  diagnostics: {}
};

const conflicts = detectLocalImportConflicts(workspace, incoming);
assert.equal(conflicts.filter((item) => item.type === 'trace-slot').length, 1, 'different trace slugs in the same lineage slot must conflict');
assert.equal(conflicts.filter((item) => item.type === 'path').length, 3, 'same non-trace paths and workspace root must conflict by path');

const pending = resolveLocalImportConflicts(workspace, incoming, '');
assert.equal(pending.requiresResolution, true, 'conflicts must not silently upsert');

const replacement = resolveLocalImportConflicts(workspace, incoming, 'replace');
assert.equal(replacement.ok, true);
assert.equal(replacement.adapterResult.records[0].path, 'notes/001-new.trace.md', 'replace keeps incoming canonical path');

const sibling = resolveLocalImportConflicts(workspace, incoming, 'sibling');
assert.equal(sibling.ok, true);
assert.notEqual(sibling.adapterResult.records[0].path, 'notes/001-new.trace.md', 'trace conflict must move to a new lineage slot');
assert.match(sibling.adapterResult.records[0].path, /^notes\/002-/, 'root trace slot 001 should advance to 002');
assert.equal(sibling.adapterResult.records[1].path, 'notes/readme-sibling-2.md');
assert.equal(sibling.adapterResult.assets[0].path, 'assets/diagram-sibling-2.svg');
assert.equal(sibling.adapterResult.workspaceEntries[0].path, 'viewer.workspace-sibling-2.md');

const cancelled = resolveLocalImportConflicts(workspace, incoming, 'cancel');
assert.equal(cancelled.cancelled, true);
assert.equal(cancelled.adapterResult, null);

console.log('✓ workspace import conflict tests passed');
