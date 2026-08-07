import assert from 'node:assert/strict';
import {
  classifyRecordAuthority,
  MaterialAuthorityKind,
  MaterialMutabilityKind,
  isRemovableLocalRecord,
  isRecordSourceBacked
} from './workspace.authority.js';

const sourceBacked = {
  id: 'source-1',
  title: 'Source',
  path: '.topics/source.trace.md',
  schemaId: 'tiinex.topic.v1',
  sourceMode: 'source-backed',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master' }
};
const sourceAuthority = classifyRecordAuthority(sourceBacked);
assert.equal(sourceAuthority.authorityKind, MaterialAuthorityKind.sourceBacked);
assert.equal(sourceAuthority.mutabilityKind, MaterialMutabilityKind.readOnlySource);
assert.equal(sourceAuthority.sourceActionAllowed, true);
assert.equal(sourceAuthority.removable, false);
assert.equal(isRecordSourceBacked(sourceBacked), true);

const localDraft = {
  id: 'draft-1',
  title: 'Task draft',
  path: '.topics/news/001-1-task.trace.md',
  status: 'local',
  sourceMode: 'local-transition',
  source: { adapterId: 'local', kind: 'local-session' }
};
const draftAuthority = classifyRecordAuthority(localDraft);
assert.equal(draftAuthority.authorityKind, MaterialAuthorityKind.localDraft);
assert.equal(draftAuthority.mutabilityKind, MaterialMutabilityKind.deletableLocalDraft);
assert.equal(draftAuthority.sourceActionAllowed, false);
assert.equal(isRemovableLocalRecord(localDraft), true);
assert.equal(isRecordSourceBacked(localDraft), false);

const packageImport = {
  id: 'package:local:artifact',
  title: 'Imported',
  path: 'artifacts/imported.trace.md',
  sourceMode: 'package-import',
  packageImport: true,
  source: { adapterId: 'export-package', kind: 'local-session', sourceKind: 'export.package.import', sourceBacked: false }
};
const importAuthority = classifyRecordAuthority(packageImport);
assert.equal(importAuthority.authorityKind, MaterialAuthorityKind.importedLocal);
assert.equal(importAuthority.mutabilityKind, MaterialMutabilityKind.removableImportedLocal);
assert.equal(importAuthority.sourceBacked, false);
assert.equal(importAuthority.removable, true);
assert.equal(isRemovableLocalRecord(packageImport), true);

const manualLocal = {
  id: 'manual-1',
  title: 'Manual',
  path: 'manual.md',
  sourceMode: 'manual-file',
  source: { adapterId: 'local', kind: 'local-session' }
};
const manualAuthority = classifyRecordAuthority(manualLocal);
assert.equal(manualAuthority.authorityKind, MaterialAuthorityKind.localSession);
assert.equal(manualAuthority.removable, false, 'manual local/session records are not silently treated as deletable drafts');

const unavailable = classifyRecordAuthority({
  id: 'source-shell',
  title: 'Shell',
  path: '.topics/source.trace.md',
  sourceMode: 'source-backed',
  source: { adapterId: 'github', repo: 'Tiinex/docs' },
  cacheState: 'route-shell-material-unavailable',
  materialAvailability: 'material-unavailable'
});
assert.equal(unavailable.authorityKind, MaterialAuthorityKind.sourceBacked);
assert.equal(unavailable.mutabilityKind, MaterialMutabilityKind.unavailable);
assert.equal(unavailable.authorityLabel, 'source-backed · unavailable');

console.log('✓ workspace authority tests passed');
