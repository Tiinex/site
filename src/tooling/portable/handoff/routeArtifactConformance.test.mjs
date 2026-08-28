import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { qualifySelectedHandoffArtifact } from './routeArtifactConformance.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { readLegacyArtifactFixture } from '../fixtures/legacyArtifactFixtures.mjs';

const valid = qualifiedHandoffFixture({ to: 'Loom' });
const validQualification = qualifySelectedHandoffArtifact({ markdown: valid });
assert.equal(validQualification.status, 'qualified');
assert.equal(validQualification.contractState, 'valid');
assert.equal(validQualification.selfIntegrity.state, 'verified');

const missingExclusions = reseal(valid.replace(/\n## Exclusions And Dependencies\n\n- none\n/, '\n'));
const missingExclusionsQualification = qualifySelectedHandoffArtifact({ markdown: missingExclusions });
assert.equal(missingExclusionsQualification.status, 'blocked');
assert(missingExclusionsQualification.findings.some((item) => item.code === 'portable.contract.section.required.missing'));
assert.equal(missingExclusionsQualification.selfIntegrity.state, 'verified', 'schema failure must remain blocking even when self integrity verifies');

const invalidTransfer = qualifiedHandoffFixture({ transferKind: 'result' });
const invalidTransferQualification = qualifySelectedHandoffArtifact({ markdown: invalidTransfer });
assert.equal(invalidTransferQualification.status, 'blocked');
assert(invalidTransferQualification.findings.some((item) => item.code === 'portable.contract.field-domain.value.invalid'));
assert.equal(invalidTransferQualification.selfIntegrity.state, 'verified');

const invalidSignal = qualifiedHandoffFixture({ signalKind: 'decision' });
const invalidSignalQualification = qualifySelectedHandoffArtifact({ markdown: invalidSignal });
assert.equal(invalidSignalQualification.status, 'blocked');
assert(invalidSignalQualification.findings.some((item) => item.code === 'portable.contract.field-domain.value.invalid'));
assert.equal(invalidSignalQualification.selfIntegrity.state, 'verified');

const malformedSelf = valid.replace('bounded fixture result', 'changed bounded fixture result');
const malformedSelfQualification = qualifySelectedHandoffArtifact({ markdown: malformedSelf });
assert.equal(malformedSelfQualification.status, 'blocked');
assert(malformedSelfQualification.findings.some((item) => item.code === 'portable.route-artifact.integrity.self.unverified'));

const originalInvalid = await readFile(new URL('./fixtures/027-invalid-return-handoff.fixture.txt', import.meta.url), 'utf8');
const originalInvalidQualification = qualifySelectedHandoffArtifact({ markdown: originalInvalid });
assert.equal(originalInvalidQualification.status, 'blocked');
assert.equal(originalInvalidQualification.selfIntegrity.state, 'verified', 'original invalid return is the checksum-valid/schema-invalid regression');
assert(originalInvalidQualification.findings.some((item) => item.code === 'portable.contract.section.required.missing'));
assert(originalInvalidQualification.findings.filter((item) => item.code === 'portable.contract.field-domain.value.invalid').length >= 2);

const parentLogicalPath = '.topics/development/tooling/dogfood/027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md';
const parentMarkdown = await readLegacyArtifactFixture(parentLogicalPath);
const parentDigest = validatedC14nV2PrimarySelfDigest(parentMarkdown);
assert.equal(parentDigest.state, 'verified');
const parentBinding = {
  trace: '../parent.trace.md',
  browseGit: 'https://github.com/Tiinex/site/blob/b7de59cc6c47e122265188debbd2964b8e5a00a1/.topics/development/tooling/dogfood/027-handoff-package-workspace-archive-and-control-plane-minimality-audit.trace.md',
  targetValue: parentDigest.value
};
const withParent = qualifiedHandoffFixture({ parent: parentBinding });
const withParentQualification = qualifySelectedHandoffArtifact({ markdown: withParent, parentMarkdown });
assert.equal(withParentQualification.status, 'qualified');
assert.equal(withParentQualification.parentContinuity.state, 'qualified');
assert.equal(withParentQualification.parentContinuity.targetResolution.verification.state, 'verified');

const missingBrowseGit = qualifiedHandoffFixture({ parent: { ...parentBinding, includeBrowseGit: false } });
const missingBrowseGitQualification = qualifySelectedHandoffArtifact({ markdown: missingBrowseGit, parentMarkdown });
assert.equal(missingBrowseGitQualification.status, 'qualified', 'directly recoverable local Parent continuity requires truthful relative Origin, not fabricated publication authority');
assert.equal(missingBrowseGitQualification.selfIntegrity.state, 'verified');
assert.equal(missingBrowseGitQualification.parentContinuity.targetResolution.verification.state, 'verified');
assert(!missingBrowseGitQualification.findings.some((item) => item.code === 'portable.contract.conditional.field.required.missing'));

const missingRelative = qualifiedHandoffFixture({ parent: { ...parentBinding, includeRelative: false } });
const missingRelativeQualification = qualifySelectedHandoffArtifact({ markdown: missingRelative, parentMarkdown });
assert.equal(missingRelativeQualification.status, 'blocked', 'browse + git alone must not replace required direct Parent recovery continuity');
assert.equal(missingRelativeQualification.selfIntegrity.state, 'verified');
assert.equal(missingRelativeQualification.parentContinuity.targetResolution.verification.state, 'verified', 'valid target/self digests must not mask missing required relative Parent Origin authority');
assert(missingRelativeQualification.findings.some((item) => item.code === 'portable.contract.conditional.field.required.missing' && item.message.includes('relative')));

const wrongParentTarget = qualifiedHandoffFixture({ parent: { ...parentBinding, targetValue: 'A'.repeat(43) } });
const wrongParentTargetQualification = qualifySelectedHandoffArtifact({ markdown: wrongParentTarget, parentMarkdown });
assert.equal(wrongParentTargetQualification.status, 'blocked');
assert(wrongParentTargetQualification.findings.some((item) => item.code === 'portable.route-artifact.integrity.parent-target.unverified'));
assert.equal(wrongParentTargetQualification.selfIntegrity.state, 'verified');

const corruptedParent = parentMarkdown.replace('workspace archive', 'workspace archive CORRUPTED');
const corruptedParentQualification = qualifySelectedHandoffArtifact({ markdown: withParent, parentMarkdown: corruptedParent });
assert.equal(corruptedParentQualification.status, 'blocked');
assert(corruptedParentQualification.findings.some((item) => item.code === 'portable.route-artifact.integrity.parent-target.unverified'));

console.log('routeArtifactConformance.test.mjs: ok');

function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
