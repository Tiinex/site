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
assert.equal(snapshot.version, 2);
assert.equal(snapshot.currentFocus, 'note.md');
assert.equal(snapshot.durableFindings.length, 1);
assert.equal(snapshot.stagedArtifacts.length, 1);
assert.equal(snapshot.boundary.hiddenConversationStateIsProvenance, false);
assert.doesNotThrow(() => JSON.stringify(snapshot));

const restored = restorePortableSession(JSON.parse(JSON.stringify(snapshot)));
assert.deepEqual(restored.snapshot(), snapshot);
assert.equal(restored.inspect().records.length, 1);
assert.throws(() => restorePortableSession({ schema: 'wrong', version: 1 }), /portable.session.schema.invalid/);
assert.throws(() => restorePortableSession({ schema: 'tiinex.portable.session.v1', version: 3 }), /portable.session.version.unsupported/);
const migrated = restorePortableSession({ schema: 'tiinex.portable.session.v1', version: 1, materials: { files: [] } });
assert.equal(migrated.snapshot().version, 2);
assert.deepEqual(migrated.snapshot().schemaCache, []);

const serializedOperation = await runPortableOperation('serialize-session', { files: [{ path: 'note.md', content: '# Note' }] });
assert.equal(serializedOperation.operation, 'serialize-session');
assert.equal(serializedOperation.session.schema, 'tiinex.portable.session.v1');
const restoredOperation = await runPortableOperation('restore-session', serializedOperation.session);
assert.equal(restoredOperation.operation, 'restore-session');
assert.deepEqual(restoredOperation.session, serializedOperation.session);

const materializationPlan = await session.planDurableMaterialization({
  materializations: [{ id: 'decision-artifact', findingIds: ['decision.keep-visible'], schemaId: 'tiinex.decision.v1' }]
});
assert.equal(materializationPlan.status, 'ready');
const checkpoint = await session.createCheckpoint({ createdAt: '2026-07-23T05:00:00.000Z' });
assert.equal(checkpoint.boundary.canonicalHandoffArtifact, false);

const packageSession = openPortableSession({
  stagedArtifacts: [{
    id: 'draft-1',
    path: 'drafts/package.md',
    schemaId: 'tiinex.topic.v1',
    sourceMode: 'local-portable-staged',
    lifecycleStatus: 'draft',
    markdown: `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-07-23T05:00:00.000Z\n  - Summary: Package session test\n  - Status: draft/local\n\n---\n\n# Package Session Test\n\n## Current Read\n\nPortable package session test.\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: portable-local-draft\n  - Value: pending-explicit-export\n`
  }]
});
const packageRoundTrip = packageSession.roundTripRuntimePackage({}, { clock: () => '2026-07-23T05:01:00.000Z' });
assert.equal(packageRoundTrip.comparison.status, 'match');
assert.equal(packageRoundTrip.qualification.canonicalPackageSchemaLocked, false);

console.log('✓ portable session serialize/restore and explicit dialogue state passed');
