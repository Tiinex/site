import assert from 'node:assert/strict';
import { createPortableCheckpoint, PORTABLE_CHECKPOINT_SCHEMA_ID, restorePortableCheckpoint } from './portable.checkpoint.js';
import { openPortableSession } from '../session/portable.session.js';
import { runPortableOperation } from '../operation.catalog.js';

const session = openPortableSession({
  files: [{ path: 'artifact.md', content: '# Artifact' }],
  currentFocus: 'artifact.md',
  stagedArtifacts: [{ path: 'drafts/next.md', schemaId: 'tiinex.topic.v1', markdown: '# Draft', qualification: { validationStatus: 'clean', exportReady: true } }],
  durableFindings: [{ id: 'decision-1', code: 'decision.pending', message: 'A durable decision should be materialized.' }]
});
const checkpoint = createPortableCheckpoint({ session, createdAt: '2026-07-23T01:00:00.000Z' });
assert.equal(checkpoint.schema, 'tiinex.portable.checkpoint.v1');
assert.equal(checkpoint.status, 'degraded');
assert.equal(checkpoint.summary.stagedArtifacts, 1);
assert.equal(checkpoint.summary.durableFindings, 1);
assert.equal(checkpoint.boundary.canonicalHandoffArtifact, false);
assert.equal(checkpoint.integrity.cryptographic, false);

const restored = restorePortableCheckpoint(checkpoint);
assert.equal(restored.status, 'restored');
assert.equal(restored.session.currentFocus, 'artifact.md');
assert.equal(restored.session.stagedArtifacts.length, 1);
assert.equal(restored.session.durableFindings.length, 1);

assert.throws(() => restorePortableCheckpoint({ ...checkpoint, version: 2 }), /version\.unsupported/);
assert.throws(() => restorePortableCheckpoint({ ...checkpoint, session: { ...checkpoint.session, currentFocus: 'tampered.md' } }), /integrity\.mismatch/);

const operation = await runPortableOperation('create-checkpoint', { session, createdAt: '2026-07-23T01:00:00.000Z' });
assert.equal(operation.operation, 'create-checkpoint');
assert.equal(operation.resultSchema, PORTABLE_CHECKPOINT_SCHEMA_ID);
assert.equal(operation.boundary.canonicalHandoffArtifact, false);

console.log('✓ portable recoverable checkpoint and explicit non-handoff boundary passed');
