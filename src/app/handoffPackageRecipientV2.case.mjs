import assert from 'node:assert/strict';
import '../workspaces/workspace.lifecycle.js';
import { applyRecipientFacingV2Handoff } from './handoffPackageRecipientV2.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
let state = lifecycle.makeEmptyAppState();
state = lifecycle.createWorkspace(state, { id: 'site', name: 'Tiinex Site' }, { clock: () => '2026-09-03T10:00:00Z' }).state;
const localDraft = { id: 'local:site:new-task', title: 'New task', path: '.topics/new-task.trace.md', markdown: '# New task', sourceMode: 'local-transition-canonical', source: { id: 'local', adapterId: 'local', kind: 'local-session' } };
state = lifecycle.addWorkspaceRecord(state, 'site', localDraft).state;
const carried = { id: 'carried:site:old', title: 'Old carried', path: '.topics/old.trace.md', markdown: '# Old', sourceMode: 'handoff-recipient-v2-workspace', source: { id: 'local', adapterId: 'local', kind: 'local-session' } };
const handoff = {
  ok: true,
  kind: 'recipient-v2',
  recipientWorkspaces: [{
    descriptor: { workspaceId: 'site', workspaceArchivePath: 'site.workspace.zip', sourceWorkspaceTargetInnerPath: '.topics/.workspaces/tiinex-site.workspace.md', sourceWorkspaceTargetSha256: 'demo' },
    workspaceEntry: { title: 'Tiinex Site', path: '.topics/.workspaces/tiinex-site.workspace.md', markdown: '# Tiinex Site' },
    adapterResult: { records: [carried], warnings: [] }
  }]
};
const applied = applyRecipientFacingV2Handoff({ lifecycle, state, handoff, options: { clock: () => '2026-09-03T10:01:00Z' } });
assert.equal(applied.ok, true);
const workspace = applied.state.workspaces.find((item) => item.id === 'site');
assert.ok(workspace.records.some((record) => record.path === '.topics/new-task.trace.md' && record.sourceMode === 'local-transition-canonical'), 'recipient-v2 re-import must preserve browser-local canonical artifacts created after the previous package snapshot');
assert.ok(workspace.records.some((record) => record.path === '.topics/old.trace.md'), 'recipient-v2 re-import still refreshes carried package material');
console.log('✓ recipient-v2 reconcile preserves user-created local artifacts');
