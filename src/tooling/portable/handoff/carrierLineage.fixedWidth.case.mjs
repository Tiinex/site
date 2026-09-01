import assert from 'node:assert/strict';
import { finalizeFile } from '../../../export/package.fileMap.js';
import { advanceHandoffCarrierMajor, continueHandoffCarrierLineage, initialHandoffCarrierLineage, parentHandoffCarrierLineageFromBundle, qualifyMajorCarrierReadiness } from './carrierLineage.js';
import { renderHandoffPackageV1 } from './recipientV2.packageV1.contract.js';
import { buildRecipientV2TransportManifestFile, recipientV2TransportFacts } from './recipientV2.transportManifest.js';

const initial = initialHandoffCarrierLineage();
assert.equal(initial.dimension, '001');
assert.equal(initial.major, '001');

const child = continueHandoffCarrierLineage({ ...initial, packageSha256: 'a'.repeat(64), packageFilename: '001-parent.zip' });
assert.equal(child.dimension, '001-1');
assert.equal(child.major, '001');
assert.equal(child.parentDimension, '001');

const grandchild = continueHandoffCarrierLineage({ ...child, packageSha256: 'b'.repeat(64), packageFilename: '001-1-parent.zip' });
assert.equal(grandchild.dimension, '001-1-1');
assert.equal(grandchild.major, '001');

const major = advanceHandoffCarrierMajor({ ...grandchild, packageSha256: 'c'.repeat(64), packageFilename: '001-1-1-parent.zip' }, 'stabilization checkpoint');
assert.equal(major.dimension, '002');
assert.equal(major.major, '002');
assert.equal(major.parentDimension, '001-1-1');

const progressionReadiness = qualifyMajorCarrierReadiness({ workspaceMaterializations: [] }, grandchild);
assert.equal(progressionReadiness.state, 'not-applicable');
const incompleteMajor = qualifyMajorCarrierReadiness({ requireBusinessDocsSiteMajorClosure: true, workspaceMaterializations: [
  { id: 'site', state: 'complete', completenessEvidence: { state: 'qualified' } },
  { id: 'business', state: 'complete', completenessEvidence: { state: 'qualified' } }
] }, major);
assert.equal(incompleteMajor.state, 'blocked');
assert.deepEqual(incompleteMajor.missingWorkspaceIds, ['docs']);
const completeMajor = qualifyMajorCarrierReadiness({ requireBusinessDocsSiteMajorClosure: true, workspaceMaterializations: [
  { id: 'site', state: 'complete', completenessEvidence: { state: 'qualified' } },
  { id: 'business', state: 'complete', completenessEvidence: { state: 'qualified' } },
  { id: 'docs', state: 'complete', completenessEvidence: { state: 'qualified' } }
] }, major);
assert.equal(completeMajor.state, 'qualified');

const rootPath = '001-package.trace.md';
const root = finalizeFile({
  path: rootPath,
  kind: 'handoff-package-lineage-root',
  mediaType: 'text/markdown',
  content: '# placeholder\n',
  transportFacts: recipientV2TransportFacts('package-root', { carrierLineage: grandchild, packageRootPath: rootPath, entryArtifactPath: '001-1-READ-BEFORE-PROCEEDING.trace.md', format: 'tiinex-recipient-facing-handoff-v2-flat' })
});
const manifest = buildRecipientV2TransportManifestFile([root], { format: 'tiinex-recipient-facing-handoff-v2-flat', packageRootPath: rootPath, entryArtifactPath: '001-1-READ-BEFORE-PROCEEDING.trace.md' });
const recovered = parentHandoffCarrierLineageFromBundle({ files: [root, manifest] }, { packageSha256: 'd'.repeat(64), packageFilename: '001-1-1-carrier.zip' });
assert.equal(recovered.dimension, '001-1-1');
assert.equal(recovered.major, '001');
assert.equal(continueHandoffCarrierLineage(recovered).dimension, '001-1-1-1');
assert.equal(advanceHandoffCarrierMajor(recovered, 'next fixed-width checkpoint').dimension, '002');

const packageV1Root = finalizeFile({
  path: '001-tiinex-handoff-package.trace.md',
  kind: 'handoff-package-v1-root',
  mediaType: 'text/markdown',
  content: renderHandoffPackageV1({
    createdAt: '2026-09-01 15:51:48',
    carrierLineage: { mode: 'continue', dimension: '002-1', parentDimension: '002', checkpointKind: 'progression' },
    workspaces: [{
      workspaceId: 'site',
      workspacePath: '001-5-site.workspace.md',
      archivePath: '001-5-site.workspace.zip',
      sourceWorkspaceTargetInnerPath: '.topics/.workspaces/tiinex-site.workspace.md',
      archiveSha256: 'e'.repeat(64),
      archiveBytes: 123
    }]
  })
});
const recoveredPackageV1 = parentHandoffCarrierLineageFromBundle({ files: [packageV1Root] });
assert.equal(recoveredPackageV1.dimension, '002-1');
assert.equal(recoveredPackageV1.parentDimension, '002');
assert.equal(recoveredPackageV1.checkpointKind, 'progression');
assert.equal(continueHandoffCarrierLineage(recoveredPackageV1).dimension, '002-1-1');

console.log('✓ carrier lineage fixed-width regression: 001 is preserved through continuation and explicit major advancement');
