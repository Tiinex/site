import assert from 'assert';
import { ensureWorkspaceForLocalMaterial } from './workspace.import.js';
import './workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;

try {
  const empty = lifecycle.makeEmptyAppState();
  const created = ensureWorkspaceForLocalMaterial(lifecycle, empty, '', { name: 'document-local-export' }, { clock: () => '2026-07-20T21:30:00.000Z' });
  assert.equal(created.ok, true);
  assert.equal(created.created, true);
  assert.equal(created.workspace.name, 'document-local-export');
  assert.equal(created.state.activeWorkspaceId, created.workspace.id);
  assert(created.workspace.importLog.some((entry) => entry.kind === 'workspace-auto-created-for-local-import'));

  const reused = ensureWorkspaceForLocalMaterial(lifecycle, created.state, created.workspace.id, { name: 'ignored' });
  assert.equal(reused.ok, true);
  assert.equal(reused.created, false);
  assert.equal(reused.workspaceId, created.workspace.id);

  console.log('✓ workspace.import tests passed');
  process.exit(0);
} catch (error) {
  console.error('workspace.import tests failed:', error && error.stack ? error.stack : error);
  process.exit(1);
}
