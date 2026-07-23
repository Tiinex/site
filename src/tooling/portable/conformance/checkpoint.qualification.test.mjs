import assert from 'node:assert/strict';
import {
  PORTABLE_VALIDATION_RECEIPT_SCHEMA_ID,
  describePortableCheckpointGate,
  qualifyPortableCheckpoint
} from './checkpoint.qualification.js';

const gate = describePortableCheckpointGate({ profile: 'source-clean' });
assert.equal(gate.profile, 'source-clean');
assert.equal(gate.gates.some((entry) => entry.id === 'portable-tests'), true);
assert.equal(gate.gates.some((entry) => entry.id === 'typecheck'), true);
assert.equal(gate.boundaries.executesCommands, false);

const receipts = gate.gates.map((entry) => ({
  schema: PORTABLE_VALIDATION_RECEIPT_SCHEMA_ID,
  gateId: entry.id,
  command: entry.command,
  status: 'passed',
  exitCode: 0,
  stdoutDigest: 'sha256:ok',
  stderrDigest: 'sha256:empty'
}));

const qualified = qualifyPortableCheckpoint({
  profile: 'source-clean',
  siteIdentity: { name: 'tiinex-site', version: '0.2.19-v199' },
  portableIdentity: { sourceFingerprint: 'sha256:source', operationFingerprint: 'sha256:catalog', operationCount: 35, sourceFiles: 48 },
  receipts,
  reproducibility: {
    dependencies: { react: '19.1.0', vite: '7.0.0' },
    lockfiles: ['package-lock.json'],
    installer: 'npm ci --no-audit --no-fund'
  },
  continuity: { parityCheckpoint: 'v199' }
});
assert.equal(qualified.status, 'qualified');
assert.equal(qualified.gateSummary.passed, gate.gates.length);
assert.equal(qualified.reproducibility.status, 'deterministic');
assert.equal(qualified.continuity.status, 'consistent');
assert.equal(qualified.qualification.canonicalReleaseClaim, false);

const currentRisk = qualifyPortableCheckpoint({
  profile: 'source-clean',
  siteIdentity: { name: 'tiinex-site', version: '0.2.19-v199' },
  portableIdentity: { sourceFingerprint: 'sha256:source', operationFingerprint: 'sha256:catalog' },
  receipts,
  reproducibility: {
    dependencies: { react: 'latest', vite: 'latest' },
    lockfiles: ['yarn.lock'],
    installer: 'npm install --no-audit --no-fund'
  },
  continuity: { parityCheckpoint: 'v181' }
});
assert.equal(currentRisk.status, 'qualified-with-warnings');
assert.equal(currentRisk.reproducibility.status, 'at-risk');
assert.equal(currentRisk.continuity.status, 'drift');
assert.equal(currentRisk.findings.some((finding) => finding.code === 'portable.checkpoint.reproducibility.latest-dependencies'), true);
assert.equal(currentRisk.findings.some((finding) => finding.code === 'portable.checkpoint.identity.declared-checkpoint.mismatch'), true);

const incomplete = qualifyPortableCheckpoint({
  profile: 'release',
  siteIdentity: { version: '0.2.19-v199' },
  portableIdentity: { sourceFingerprint: 'sha256:source', operationFingerprint: 'sha256:catalog' },
  receipts: receipts.filter((entry) => entry.gateId !== 'typecheck'),
  reproducibility: { dependencies: {}, lockfiles: ['package-lock.json'], installer: 'npm ci' }
});
assert.equal(incomplete.status, 'incomplete');
assert(incomplete.gateSummary.missing > 0);

const failedReceipt = receipts.map((entry) => entry.gateId === 'portable-tests' ? { ...entry, status: 'failed', exitCode: 1 } : entry);
const failed = qualifyPortableCheckpoint({
  profile: 'source-clean',
  siteIdentity: { version: '0.2.19-v199' },
  portableIdentity: { sourceFingerprint: 'sha256:source', operationFingerprint: 'sha256:catalog' },
  receipts: failedReceipt,
  reproducibility: { dependencies: {}, lockfiles: ['package-lock.json'], installer: 'npm ci' }
});
assert.equal(failed.status, 'failed');
assert.equal(failed.findings.some((finding) => finding.code === 'portable.checkpoint.gate.failed'), true);

const privacyFailure = qualifyPortableCheckpoint({
  profile: 'portable',
  siteIdentity: { version: '0.2.19-v199' },
  portableIdentity: { sourceFingerprint: 'sha256:source', operationFingerprint: 'sha256:catalog' },
  receipts: receipts.filter((entry) => entry.gateId === 'portable-syntax' || entry.gateId === 'portable-tests'),
  reproducibility: {},
  evidence: [{ id: 'private-corpus', kind: 'manual', private: true, embedded: true }]
});
assert.equal(privacyFailure.status, 'failed');
assert.equal(privacyFailure.findings.some((finding) => finding.code === 'portable.checkpoint.evidence.private-embedded'), true);

console.log('✓ portable checkpoint gate, explicit receipt qualification, identity drift, reproducibility, and privacy boundaries passed');
