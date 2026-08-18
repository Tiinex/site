import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { runExplicitUrlMaterialImportCommand } from './urlMaterialCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'URL import' }, { clock: () => '2026-08-09T00:00:00.000Z' });
assert.equal(created.ok, true);
const empty = await runExplicitUrlMaterialImportCommand({ lifecycle, state: created.state, workspaceId: created.workspace.id, urlText: '' });
assert.equal(empty.ok, false);
assert.equal(empty.error, 'url.required');
const calls = [];
const loaded = await runExplicitUrlMaterialImportCommand({
  lifecycle,
  state: created.state,
  workspaceId: created.workspace.id,
  urlText: 'https://example.test/topic.md',
  fetchImpl: async (url) => {
    calls.push(url);
    return { ok: true, status: 200, statusText: 'OK', url, text: async () => '# URL Topic\n\nBody from explicit URL.' };
  }
});
assert.equal(loaded.ok, true, loaded.error);
assert.deepEqual(calls, ['https://example.test/topic.md']);
const workspace = lifecycle.activeWorkspace(loaded.state);
assert.equal(workspace.records.length, 1);
assert.match(workspace.records[0].path, /topic\.md$/);
assert.equal(workspace.records[0].source?.kind, lifecycle.SESSION_SOURCE_KIND, 'explicit URLs remain local/session material, not guessed GitHub source');
assert.equal(workspace.records[0].sourceTarget?.targetKind, 'web.markdown');
assert.equal(workspace.records[0].sourceTarget?.inputTarget, 'https://example.test/topic.md');
assert.equal(workspace.records[0].sourceTarget?.rawUrl, 'https://example.test/topic.md');
assert.equal(workspace.records[0].path, 'topic.md', 'URL is not stored as a fake local hierarchy');
assert.match(loaded.notice, /Added 1 URL artifact/);
console.log('urlMaterialCommand: ok');
