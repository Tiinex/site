import assert from 'node:assert/strict';
import { resolveTimePortalSnapshot, timePortalGithubSources } from './timePortalSnapshotResolution.js';
const a = 'a'.repeat(40);
const workspace = { id: 'w1', sources: [
  { id: 'local', kind: 'local' },
  { id: 'github:docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' }
] };
assert.deepEqual(timePortalGithubSources(workspace).map((source) => source.id), ['github:docs']);
const direct = await resolveTimePortalSnapshot({ workspace, view: { timePortal: { mode: 'intent', end: '2026-05-31T22:40' } }, snapshotInput: a, fetchImpl: async () => { throw new Error('no network'); } });
assert.equal(direct.ok, true);
assert.equal(direct.snapshot.materializedCommit, a);
assert.equal(direct.snapshot.sourceId, 'github:docs');
assert.equal(direct.snapshot.repository, 'Tiinex/docs');
assert.equal(direct.snapshot.rootPath, '.topics');
const multi = { ...workspace, sources: workspace.sources.concat({ id: 'github:other', adapterId: 'github', repo: 'Tiinex/other', ref: 'main' }) };
assert.equal((await resolveTimePortalSnapshot({ workspace: multi, snapshotInput: a })).code, 'time-portal.source.ambiguous');
assert.equal((await resolveTimePortalSnapshot({ workspace: { id: 'local-only', sources: [{ id: 'local' }] }, snapshotInput: a })).code, 'time-portal.source.unsupported');
const dateOnly = await resolveTimePortalSnapshot({ workspace, view: { timePortal: { mode: 'intent', begin: '2026-05-01T00:00', end: '2026-05-31T22:40' } }, snapshotInput: '', fetchImpl: async () => { throw new Error('date must not trigger transport'); } });
assert.equal(dateOnly.code, 'time-portal.snapshot-input.required', 'Begin/End intent must never be guessed into a commit selector');
console.log('timePortalSnapshotResolution: ok');
