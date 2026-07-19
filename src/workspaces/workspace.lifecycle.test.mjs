import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadLifecycle() {
  const sandbox = { window: {}, globalThis: {} };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL('./workspace.lifecycle.js', import.meta.url), 'utf8'), sandbox);
  return sandbox.window.TiinexWorkspaceLifecycle;
}

const lifecycle = loadLifecycle();
const state = lifecycle.makeEmptyAppState();
const created = lifecycle.createWorkspace(state, { name: '  Research Desk  ' }, { clock: () => '2026-07-19T20:50:00.000Z' });

if (!created.ok) throw new Error('workspace should be created');
if (created.workspace.name !== 'Research Desk') throw new Error('workspace name should be normalized');
if (created.workspace.source.githubPolicy !== 'not guessed') throw new Error('local workspace must not guess GitHub source');
if (created.state.activeWorkspaceId !== created.workspace.id) throw new Error('created workspace should become active');
if (created.state.workspaces.length !== 1) throw new Error('created workspace should be in Column state');


const added = lifecycle.addWorkspaceRecord(created.state, created.workspace.id, { title: '  First note  ', summary: 'Material created during UC-001.' }, { clock: () => '2026-07-19T20:51:00.000Z' });
if (!added.ok) throw new Error('workspace record should be added');
if (added.record.title !== 'First note') throw new Error('record title should be normalized');
if (added.record.source.githubPolicy !== 'not guessed') throw new Error('local record must not guess GitHub source');
if (added.state.workspaces[0].records.length !== 1) throw new Error('record should be inserted into workspace state');

const missingRecord = lifecycle.addWorkspaceRecord(created.state, created.workspace.id, { title: '   ' });
if (missingRecord.ok || missingRecord.error !== 'record.title.required') throw new Error('empty record title must be rejected');

const missing = lifecycle.createWorkspace(state, { name: '   ' });
if (missing.ok || missing.error !== 'workspace.name.required') throw new Error('empty workspace name must be rejected');

const closed = lifecycle.closeWorkspace(created.state, created.workspace.id);
if (!closed.ok) throw new Error('workspace close should succeed');
if (closed.state.workspaces.length !== 0 || closed.state.activeWorkspaceId) throw new Error('close should return to empty state');

console.log('✓ workspace lifecycle tests passed');
