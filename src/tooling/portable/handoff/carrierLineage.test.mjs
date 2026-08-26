import assert from 'node:assert/strict';
import { advanceHandoffCarrierMajor, continueHandoffCarrierLineage, initialHandoffCarrierLineage, normalizeHandoffCarrierLineage, qualifyMajorCarrierReadiness } from './carrierLineage.js';

const root = initialHandoffCarrierLineage();
assert.equal(root.dimension, '001');
assert.equal(root.checkpointKind, 'major');

const child = continueHandoffCarrierLineage({ ...root, packageSha256: 'a'.repeat(64), packageFilename: 'tiinex-business-001-anchor-to-anchor.handoff-package.zip' });
assert.equal(child.dimension, '001-1');
assert.equal(child.parentDimension, '001');
assert.equal(child.parentPackageSha256, 'a'.repeat(64));
assert.equal(child.checkpointKind, 'progression');

const grandchild = continueHandoffCarrierLineage(child);
assert.equal(grandchild.dimension, '001-1-1');

const major = advanceHandoffCarrierMajor({ ...grandchild, packageSha256: 'b'.repeat(64) }, 'artifactization milestone closed');
assert.equal(major.dimension, '002');
assert.equal(major.parentDimension, '001-1-1');
assert.equal(major.checkpointKind, 'major');
assert.equal(major.majorReason, 'artifactization milestone closed');

assert.throws(() => advanceHandoffCarrierMajor(child, ''), /major-reason\.required/);
assert.equal(normalizeHandoffCarrierLineage({ dimension: '004-2' }).dimension, '004-2');

const ready = qualifyMajorCarrierReadiness({ workspaceMaterializations: [{ state: 'complete', completenessEvidence: { state: 'qualified' } }] }, major);
assert.equal(ready.state, 'qualified');
const blocked = qualifyMajorCarrierReadiness({ workspaceMaterializations: [{ state: 'partial', completenessEvidence: { state: 'qualified' } }] }, major);
assert.equal(blocked.state, 'blocked');

console.log('✓ Handoff carrier lineage keeps child progression separate from explicit self-contained major advancement');
