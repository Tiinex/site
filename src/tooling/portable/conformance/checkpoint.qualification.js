import { dedupePortableFindings, portableFinding, summarizePortableFindings } from '../findings.js';

export const PORTABLE_CHECKPOINT_GATE_SCHEMA_ID = 'tiinex.portable.checkpoint-gate.v1';
export const PORTABLE_VALIDATION_RECEIPT_SCHEMA_ID = 'tiinex.portable.validation-receipt.v1';
export const PORTABLE_CHECKPOINT_QUALIFICATION_SCHEMA_ID = 'tiinex.portable.checkpoint-qualification.v1';

const TYPECHECK_COMMAND = 'npx --no-install tsc --allowJs --jsx react-jsx --noEmit --skipLibCheck --moduleResolution bundler --module ESNext --target ES2022 src/app/TiinexApp.jsx src/schemas/workspace/workspace.views.jsx src/schemas/companion.js src/workspaces/workspace.feedSort.js src/workspaces/workspace.materialRole.js src/ui/primitives/Icon.jsx';

const GATES = Object.freeze({
  'portable-syntax': gate('portable-syntax', 'Portable syntax', 'node --check <portable JavaScript sources>', 'portable', false),
  'portable-tests': gate('portable-tests', 'Portable aggregate suite', 'node src/tooling/portable/portable.test.mjs', 'portable', false),
  validate: gate('validate', 'Shared source validation', 'npm run validate', 'shared-core', false),
  'ui-shape': gate('ui-shape', 'UI shape validation', 'npm run ui:shape', 'viewer', false),
  'usecase-uc001': gate('usecase-uc001', 'UC001 validation', 'npm run usecase:uc001', 'viewer', false),
  metrics: gate('metrics', 'Repository metrics', 'npm run metrics', 'diagnostics', false),
  'storage-scan': gate('storage-scan', 'Storage scan', 'npm run storage:scan', 'diagnostics', false),
  typecheck: gate('typecheck', 'Focused TypeScript check', TYPECHECK_COMMAND, 'viewer', true),
  'runtime-smoke': gate('runtime-smoke', 'Runtime startup smoke', 'npm run runtime:smoke', 'runtime', true),
  'build-public': gate('build-public', 'Public build', 'npm run build:public', 'release', true),
  'public-check': gate('public-check', 'Public output validation', 'npm run public:check', 'release', true)
});

const PROFILES = Object.freeze({
  portable: Object.freeze(['portable-syntax', 'portable-tests']),
  'source-clean': Object.freeze(['portable-syntax', 'portable-tests', 'validate', 'ui-shape', 'usecase-uc001', 'metrics', 'storage-scan', 'typecheck']),
  release: Object.freeze(['portable-syntax', 'portable-tests', 'validate', 'ui-shape', 'usecase-uc001', 'metrics', 'storage-scan', 'typecheck', 'runtime-smoke', 'build-public', 'public-check'])
});

export function describePortableCheckpointGate(input = {}) {
  const profile = normalizeProfile(input.profile);
  const gates = PROFILES[profile].map((id) => Object.freeze({ ...GATES[id], required: true }));
  return Object.freeze({
    schema: PORTABLE_CHECKPOINT_GATE_SCHEMA_ID,
    profile,
    gates: Object.freeze(gates),
    boundaries: Object.freeze({
      executesCommands: false,
      acceptsExplicitReceipts: true,
      canonicalReleaseClaim: false,
      canonicalHandoffGenerated: false,
      browserParityProven: false
    }),
    findings: Object.freeze([]),
    findingSummary: summarizePortableFindings([])
  });
}

export function qualifyPortableCheckpoint(input = {}) {
  const gate = describePortableCheckpointGate({ profile: input.profile });
  const findings = [];
  const receipts = normalizeReceipts(input.receipts);
  const receiptByGate = new Map(receipts.map((receipt) => [receipt.gateId, receipt]));
  const evaluatedGates = gate.gates.map((descriptor) => evaluateGate(descriptor, receiptByGate.get(descriptor.id), findings));
  const siteIdentity = normalizeSiteIdentity(input.siteIdentity || input.package || {});
  const portableIdentity = normalizePortableIdentity(input.portableIdentity || {});
  const reproducibility = inspectReproducibility(input.reproducibility || input.package || {}, findings);
  const continuity = inspectContinuityIdentity(siteIdentity, input.continuity || input, findings);
  const evidence = inspectEvidence(input.evidence || [], findings);

  if (!siteIdentity.version) findings.push(portableFinding('error', 'portable.checkpoint.identity.version.missing', 'Checkpoint qualification requires an explicit site/package version.'));
  if (!portableIdentity.sourceFingerprint) findings.push(portableFinding('warning', 'portable.checkpoint.portable-identity.source-fingerprint.missing', 'Portable source fingerprint is missing; the receipt proves command outcomes but not the exact portable source set.'));
  if (!portableIdentity.operationFingerprint) findings.push(portableFinding('warning', 'portable.checkpoint.portable-identity.operation-fingerprint.missing', 'Portable operation-catalog fingerprint is missing.'));

  const failed = evaluatedGates.filter((entry) => entry.status === 'failed').length;
  const incomplete = evaluatedGates.filter((entry) => entry.status === 'missing' || entry.status === 'blocked' || entry.status === 'skipped').length;
  const warningCountBeforeStatus = findings.filter((finding) => finding.severity === 'warning').length;
  const status = failed
    ? 'failed'
    : incomplete
      ? 'incomplete'
      : findings.some((finding) => finding.severity === 'error')
        ? 'failed'
        : warningCountBeforeStatus
          ? 'qualified-with-warnings'
          : 'qualified';

  const dedupedFindings = dedupePortableFindings(findings);
  return Object.freeze({
    schema: PORTABLE_CHECKPOINT_QUALIFICATION_SCHEMA_ID,
    status,
    profile: gate.profile,
    siteIdentity,
    portableIdentity,
    continuity,
    reproducibility,
    gates: Object.freeze(evaluatedGates),
    gateSummary: Object.freeze({
      total: evaluatedGates.length,
      passed: evaluatedGates.filter((entry) => entry.status === 'passed').length,
      failed,
      blocked: evaluatedGates.filter((entry) => entry.status === 'blocked').length,
      skipped: evaluatedGates.filter((entry) => entry.status === 'skipped').length,
      missing: evaluatedGates.filter((entry) => entry.status === 'missing').length
    }),
    evidence,
    qualification: Object.freeze({
      technicalGateProfile: gate.profile,
      commandsExecutedByThisOperation: false,
      explicitReceiptsRequired: true,
      exactPortableSourceBound: Boolean(portableIdentity.sourceFingerprint),
      reproducibleBuildProven: reproducibility.status === 'deterministic',
      checkpointIdentityConsistent: continuity.status === 'consistent',
      browserParityProven: evidence.browser.count > 0 && evidence.browser.allPassed,
      canonicalReleaseClaim: false,
      canonicalHandoffGenerated: false,
      statement: qualificationStatement(status, gate.profile)
    }),
    findings: dedupedFindings,
    findingSummary: summarizePortableFindings(dedupedFindings)
  });
}

function evaluateGate(descriptor, receipt, findings) {
  if (!receipt) {
    findings.push(portableFinding('warning', 'portable.checkpoint.gate.receipt.missing', `Required gate ${descriptor.id} has no receipt.`, { gateId: descriptor.id }));
    return Object.freeze({ ...descriptor, status: 'missing', receipt: null });
  }
  if (receipt.schema && receipt.schema !== PORTABLE_VALIDATION_RECEIPT_SCHEMA_ID) {
    findings.push(portableFinding('error', 'portable.checkpoint.gate.receipt.schema', `Gate ${descriptor.id} uses an unsupported receipt schema.`, { gateId: descriptor.id, receivedSchema: receipt.schema }));
  }
  if (receipt.command && normalizeWhitespace(receipt.command) !== normalizeWhitespace(descriptor.command)) {
    findings.push(portableFinding('error', 'portable.checkpoint.gate.command.mismatch', `Gate ${descriptor.id} receipt command does not match the declared checkpoint gate.`, { gateId: descriptor.id, expected: descriptor.command, received: receipt.command }));
  }
  const status = normalizeReceiptStatus(receipt.status, receipt.exitCode);
  if (status === 'failed') findings.push(portableFinding('error', 'portable.checkpoint.gate.failed', `Checkpoint gate ${descriptor.id} failed.`, { gateId: descriptor.id, exitCode: receipt.exitCode ?? null }));
  if (status === 'blocked') findings.push(portableFinding('warning', 'portable.checkpoint.gate.blocked', `Checkpoint gate ${descriptor.id} was blocked by the execution environment.`, { gateId: descriptor.id, reason: receipt.reason || '' }));
  if (status === 'skipped') findings.push(portableFinding('warning', 'portable.checkpoint.gate.skipped', `Checkpoint gate ${descriptor.id} was skipped.`, { gateId: descriptor.id, reason: receipt.reason || '' }));
  return Object.freeze({ ...descriptor, status, receipt: Object.freeze({ ...receipt, status }) });
}

function inspectReproducibility(input = {}, findings) {
  const dependencies = input.dependencies || input.packageJson?.dependencies || {};
  const latestDependencies = Object.entries(dependencies).filter(([, value]) => String(value || '').trim() === 'latest').map(([name]) => name).sort();
  const lockfiles = normalizeStringList(input.lockfiles || input.lockfileNames);
  const installer = String(input.installer || input.workflowInstaller || '').trim();
  const hasPackageLock = lockfiles.some((name) => /(^|\/)package-lock\.json$/i.test(name));
  const hasNpmShrinkwrap = lockfiles.some((name) => /(^|\/)npm-shrinkwrap\.json$/i.test(name));
  const hasYarnLock = lockfiles.some((name) => /(^|\/)yarn\.lock$/i.test(name));
  const npmInstaller = /\bnpm\s+(install|ci)\b/i.test(installer);
  const npmCi = /\bnpm\s+ci\b/i.test(installer);
  const compatibleLock = !npmInstaller || hasPackageLock || hasNpmShrinkwrap;

  if (latestDependencies.length) findings.push(portableFinding('warning', 'portable.checkpoint.reproducibility.latest-dependencies', 'Dependencies using "latest" prevent a reproducible dependency graph.', { dependencies: latestDependencies }));
  if (npmInstaller && !compatibleLock) findings.push(portableFinding('warning', 'portable.checkpoint.reproducibility.npm-lock.missing', 'The workflow uses npm without a package-lock.json or npm-shrinkwrap.json.', { installer, lockfiles }));
  if (/\bnpm\s+install\b/i.test(installer) && !npmCi) findings.push(portableFinding('warning', 'portable.checkpoint.reproducibility.npm-install', 'Release installation uses npm install rather than npm ci.', { installer }));
  if (hasYarnLock && npmInstaller && !hasPackageLock && !hasNpmShrinkwrap) findings.push(portableFinding('warning', 'portable.checkpoint.reproducibility.lockfile-installer-mismatch', 'A yarn.lock is present while the release workflow installs with npm; the checked-in lockfile does not constrain that install.', { installer, lockfiles }));

  const status = latestDependencies.length || !compatibleLock || (/\bnpm\s+install\b/i.test(installer) && !npmCi) ? 'at-risk' : lockfiles.length || !installer ? 'deterministic' : 'unqualified';
  return Object.freeze({
    status,
    latestDependencies: Object.freeze(latestDependencies),
    lockfiles: Object.freeze(lockfiles),
    installer,
    compatibleLock,
    npmCi,
    notes: Object.freeze([
      'This diagnostic does not mutate package.json, lockfiles, or workflows.',
      'Deterministic status describes supplied dependency/install metadata only.'
    ])
  });
}

function inspectContinuityIdentity(siteIdentity, input, findings) {
  const packageCheckpoint = checkpointToken(siteIdentity.version);
  const declaredCheckpoint = String(input.parityCheckpoint || input.declaredCheckpoint || '').trim();
  const expectedVersion = String(input.expectedVersion || '').trim();
  if (expectedVersion && expectedVersion !== siteIdentity.version) findings.push(portableFinding('error', 'portable.checkpoint.identity.expected-version.mismatch', 'Checkpoint version does not match the explicitly expected version.', { expectedVersion, actualVersion: siteIdentity.version }));
  if (declaredCheckpoint && packageCheckpoint && normalizeCheckpoint(declaredCheckpoint) !== normalizeCheckpoint(packageCheckpoint)) findings.push(portableFinding('warning', 'portable.checkpoint.identity.declared-checkpoint.mismatch', 'A supplied parity/checkpoint identity does not match package version.', { declaredCheckpoint, packageCheckpoint }));
  return Object.freeze({
    status: declaredCheckpoint && packageCheckpoint && normalizeCheckpoint(declaredCheckpoint) !== normalizeCheckpoint(packageCheckpoint) ? 'drift' : siteIdentity.version ? 'consistent' : 'unknown',
    packageCheckpoint,
    declaredCheckpoint,
    expectedVersion,
    singleCanonicalIdentityProven: false,
    statement: 'This diagnostic compares supplied identities; it does not make package.json a canonical Tiinex artifact.'
  });
}

function inspectEvidence(input = [], findings) {
  const entries = (Array.isArray(input) ? input : []).map((entry, index) => Object.freeze({
    id: String(entry.id || `evidence-${index + 1}`),
    kind: String(entry.kind || 'manual'),
    status: String(entry.status || 'observed'),
    private: Boolean(entry.private),
    embedded: Boolean(entry.embedded),
    summary: String(entry.summary || ''),
    locator: entry.locator || null
  }));
  for (const entry of entries) {
    if (entry.private && entry.embedded) findings.push(portableFinding('error', 'portable.checkpoint.evidence.private-embedded', 'Private dogfood evidence must not be embedded into distributable tooling or fixtures.', { evidenceId: entry.id }));
  }
  const browser = entries.filter((entry) => entry.kind === 'browser' || entry.kind === 'video' || entry.kind === 'screenshot');
  return Object.freeze({
    entries: Object.freeze(entries),
    browser: Object.freeze({ count: browser.length, allPassed: browser.length > 0 && browser.every((entry) => entry.status === 'passed' || entry.status === 'observed') }),
    private: Object.freeze({ count: entries.filter((entry) => entry.private).length, embedded: entries.filter((entry) => entry.private && entry.embedded).length })
  });
}

function normalizeReceipts(receipts = []) {
  return (Array.isArray(receipts) ? receipts : []).map((receipt) => Object.freeze({
    schema: String(receipt.schema || PORTABLE_VALIDATION_RECEIPT_SCHEMA_ID),
    gateId: String(receipt.gateId || receipt.id || ''),
    command: String(receipt.command || ''),
    status: String(receipt.status || ''),
    exitCode: typeof receipt.exitCode === 'number' ? receipt.exitCode : null,
    reason: String(receipt.reason || ''),
    startedAt: String(receipt.startedAt || ''),
    finishedAt: String(receipt.finishedAt || ''),
    durationMs: Number.isFinite(Number(receipt.durationMs)) ? Number(receipt.durationMs) : null,
    stdoutDigest: String(receipt.stdoutDigest || ''),
    stderrDigest: String(receipt.stderrDigest || ''),
    details: receipt.details || null,
    environment: receipt.environment || null
  })).filter((receipt) => receipt.gateId);
}

function normalizeSiteIdentity(input = {}) {
  return Object.freeze({
    name: String(input.name || input.packageName || ''),
    version: String(input.version || input.packageVersion || ''),
    description: String(input.description || ''),
    commit: String(input.commit || input.commitSha || ''),
    sourceCheckpoint: String(input.sourceCheckpoint || '')
  });
}

function normalizePortableIdentity(input = {}) {
  return Object.freeze({
    sourceFingerprint: String(input.sourceFingerprint || ''),
    operationFingerprint: String(input.operationFingerprint || ''),
    operationCount: Number.isFinite(Number(input.operationCount)) ? Number(input.operationCount) : null,
    sourceFiles: Number.isFinite(Number(input.sourceFiles)) ? Number(input.sourceFiles) : null,
    bootstrapFingerprint: String(input.bootstrapFingerprint || '')
  });
}

function gate(id, label, command, category, requiresInstalledDependencies) {
  return Object.freeze({ id, label, command, category, requiresInstalledDependencies });
}

function normalizeProfile(value = '') {
  const profile = String(value || 'source-clean').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(PROFILES, profile) ? profile : 'source-clean';
}

function normalizeReceiptStatus(value = '', exitCode = null) {
  const status = String(value || '').toLowerCase();
  if (status === 'passed' || status === 'failed' || status === 'blocked' || status === 'skipped') return status;
  if (typeof exitCode === 'number') return exitCode === 0 ? 'passed' : 'failed';
  return 'missing';
}

function checkpointToken(version = '') {
  const match = String(version || '').match(/(?:^|-)v(\d+)(?:$|[^\d])/i);
  return match ? `v${match[1]}` : '';
}

function normalizeCheckpoint(value = '') {
  const match = String(value || '').match(/v?(\d+)/i);
  return match ? `v${match[1]}` : String(value || '').trim().toLowerCase();
}

function normalizeWhitespace(value = '') { return String(value || '').trim().replace(/\s+/g, ' '); }
function normalizeStringList(value = []) { return [...new Set((Array.isArray(value) ? value : [value]).map((item) => String(item || '').trim()).filter(Boolean))].sort(); }
function qualificationStatement(status, profile) {
  if (status === 'qualified') return `All ${profile} checkpoint gates passed with explicit receipts and no reported diagnostic warnings.`;
  if (status === 'qualified-with-warnings') return `All ${profile} checkpoint gates passed, but identity or reproducibility diagnostics remain.`;
  if (status === 'incomplete') return `The ${profile} checkpoint is not fully qualified because required receipts are missing, blocked, or skipped.`;
  return `The ${profile} checkpoint failed one or more required gates or identity checks.`;
}
