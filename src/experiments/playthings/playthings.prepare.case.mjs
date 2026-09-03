import assert from 'node:assert/strict';
import { compactPlaythingsWorkspaces, compactPlaythingsWorkspacesCooperatively, preparePlaythingsSnapshot } from './playthings.prepare.js';

const workspaces = [{ id: 'site', title: 'Tiinex Site', sources: [{ id: 'local', kind: 'local', adapterId: 'local' }], records: [{
  id: 'root', path: '.topics/root.trace.md', title: 'Root', summary: 'root task', schemaId: 'tiinex.task.v1', currentCreatedAt: '2026-09-03 12:00:00', authors: 'Anchor', markdown: '# Root\n' + 'large irrelevant body '.repeat(1000)
}, {
  id: 'schema', path: '.topics/task.schema.md', title: 'Task schema', currentCreatedAt: '2026-09-03 12:01:00', markdown: '- Current Schema: [tiinex.schema.v1](https://example.invalid/schema)\n- Authors: [Anchor](https://example.invalid/anchor)\n'
}]}];
const compact = compactPlaythingsWorkspaces(workspaces);
assert.equal(compact[0].records[0].markdown, '', 'worker payload omits ordinary large artifact markdown when structured fields already carry the projection inputs');
assert.equal(compact[0].records[1].schemaId, 'tiinex.schema.v1', 'compact fallback extracts the visible Current Schema id rather than the Markdown link URL');
let yields = 0;
const cooperative = await compactPlaythingsWorkspacesCooperatively(workspaces, null, async () => { yields += 1; });
assert.equal(cooperative[0].records.length, 2);
assert.ok(yields >= 1, 'cooperative worker-payload packing yields back to the browser before projection begins');
const snapshot = preparePlaythingsSnapshot(cooperative);
assert.ok(snapshot.model && snapshot.history && snapshot.world, 'prepared snapshot carries model, history and shared-earth world so React does not rebuild them synchronously');
assert.equal(snapshot.semanticAuthority, 'none');
console.log('✓ Playthings asynchronous preparation contract passed');
