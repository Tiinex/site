import assert from 'node:assert/strict';
import { openPortableSession, restorePortableSession } from './portable.session.js';
import { runPortableOperation } from '../operation.catalog.js';

const session = openPortableSession({
  files: [{ path: 'note.md', content: '# Note\n\nLocal supporting material.' }],
  currentFocus: 'note.md'
})
  .withDurableFinding({ code: 'decision.keep-visible', message: 'Keep this durable decision visible.' })
  .withStagedArtifact({ path: 'drafts/next.md', schemaId: 'tiinex.topic.v1', markdown: '# Draft' })
  .withCheckpoint({ id: 'checkpoint-1', status: 'local' });

const snapshot = session.snapshot();
assert.equal(snapshot.schema, 'tiinex.portable.session.v1');
assert.equal(snapshot.currentFocus, 'note.md');
assert.equal(snapshot.durableFindings.length, 1);
assert.equal(snapshot.stagedArtifacts.length, 1);
assert.equal(snapshot.boundary.hiddenConversationStateIsProvenance, false);
assert.doesNotThrow(() => JSON.stringify(snapshot));

const restored = restorePortableSession(JSON.parse(JSON.stringify(snapshot)));
assert.deepEqual(restored.snapshot(), snapshot);
assert.equal(restored.inspect().records.length, 1);
assert.throws(() => restorePortableSession({ schema: 'wrong', version: 1 }), /portable.session.schema.invalid/);
assert.throws(() => restorePortableSession({ schema: 'tiinex.portable.session.v1', version: 2 }), /portable.session.version.unsupported/);

const serializedOperation = await runPortableOperation('serialize-session', { files: [{ path: 'note.md', content: '# Note' }] });
assert.equal(serializedOperation.operation, 'serialize-session');
assert.equal(serializedOperation.session.schema, 'tiinex.portable.session.v1');
const restoredOperation = await runPortableOperation('restore-session', serializedOperation.session);
assert.equal(restoredOperation.operation, 'restore-session');
assert.deepEqual(restoredOperation.session, serializedOperation.session);

console.log('✓ portable session serialize/restore and explicit dialogue state passed');
