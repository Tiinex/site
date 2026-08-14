import assert from 'node:assert/strict';
import { executeWorkspaceTreeExportCommand } from './workspaceExportCommand.js';

const workspace = { title: 'Export Command', records: [{ id: 'r', path: '.topics/a.trace.md', markdown: '# A' }], assets: [] };
let called = 0;
const result = executeWorkspaceTreeExportCommand({
  workspace,
  download(inputWorkspace) {
    called += 1;
    assert.equal(inputWorkspace.title, 'Export Command');
    return { status: 'ready', counts: { files: 1 }, packageEnvelope: false };
  }
});
assert.equal(result.ok, true);
assert.equal(called, 1);
assert.match(result.notice, /Export tree ready: 1 file/);

const blocked = executeWorkspaceTreeExportCommand({ workspace, exportPlan: { execution: { available: false } } });
assert.equal(blocked.ok, false);
assert.equal(blocked.error, 'export.adapter.not.executable');

console.log('✓ workspaceExportCommand tests passed');
