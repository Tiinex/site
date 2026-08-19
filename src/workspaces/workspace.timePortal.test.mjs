import assert from 'node:assert/strict';
import {
  normalizeTimePortalView,
  timePortalHistoricalActive,
  timePortalIntentFor,
  timePortalViewFor,
  timePortalWithIntent,
  timePortalWithResolvedSnapshot,
  timePortalWithoutIntent,
  timePortalReferencesSource
} from './workspace.timePortal.js';

const commit = 'a'.repeat(40);
assert.equal(normalizeTimePortalView(null), null, 'latest/default is represented by absence of temporal state');
const intentView = timePortalWithIntent({ workspaceVerse: 'feed' }, { begin: '2026-05-01T10:00', end: '2026-05-31T22:40', sourceId: 'github:docs' });
assert.equal(timePortalViewFor(intentView)?.mode, 'intent');
assert.equal(timePortalIntentFor(intentView).end, '2026-05-31T22:40');
assert.equal(timePortalHistoricalActive(intentView), false);
const resolved = timePortalWithResolvedSnapshot(intentView, {
  sourceId: 'github:docs', repository: 'Tiinex/docs', rootPath: '.topics', requestedRef: 'main', resolvedRef: 'main', materializedCommit: commit, inputTarget: 'main', resolvedBy: 'github.commit-resolution'
});
assert.equal(timePortalHistoricalActive(resolved), true);
assert.equal(timePortalViewFor(resolved).snapshot.materializedCommit, commit);
assert.equal(timePortalReferencesSource(resolved, 'github:docs'), true);
assert.equal(timePortalReferencesSource(resolved, 'github:other'), false);
assert.equal(timePortalViewFor(resolved).end, '2026-05-31T22:40', 'temporal intent remains presentation context, not source identity');
assert.equal(timePortalViewFor(timePortalWithoutIntent(resolved)), null);
assert.equal(normalizeTimePortalView({ mode: 'historical', snapshot: { sourceId: 'github:docs', repository: 'Tiinex/docs', materializedCommit: 'not-a-commit' } }), null, 'invalid exact identity must not survive as resolved history');
console.log('workspace.timePortal: ok');
