import assert from 'node:assert/strict';
import { finalizeFile } from '../../../export/package.fileMap.js';
import { advanceHandoffCarrierMajor, continueHandoffCarrierLineage, initialHandoffCarrierLineage, parentHandoffCarrierLineageFromBundle } from './carrierLineage.js';
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

console.log('✓ carrier lineage fixed-width regression: 001 is preserved through continuation and explicit major advancement');
