import assert from 'node:assert/strict';
import { pocParityLedger, POC_PARITY_LEDGER_SCHEMA_ID, PoCParityStatus, summarizePoCParity } from './poc.parityLedger.js';

assert.equal(pocParityLedger.schema, POC_PARITY_LEDGER_SCHEMA_ID, 'ledger must declare schema');
assert.equal(pocParityLedger.checkpoint, 'v158', 'ledger checkpoint should match package checkpoint');
assert(pocParityLedger.scenarios.length >= 6, 'ledger must cover multiple PoC loops');
for (const scenario of pocParityLedger.scenarios) {
  assert(scenario.id, 'scenario requires id');
  assert(Object.values(PoCParityStatus).includes(scenario.status), `scenario ${scenario.id} has valid status`);
  assert(scenario.legacyBehavior, `scenario ${scenario.id} requires legacy behavior`);
  assert(scenario.semanticOwner, `scenario ${scenario.id} requires semantic owner`);
  assert(scenario.runtimeOwner, `scenario ${scenario.id} requires runtime owner`);
  assert(Array.isArray(scenario.automatedChecks), `scenario ${scenario.id} automatedChecks must be array`);
  assert(Array.isArray(scenario.manualChecks), `scenario ${scenario.id} manualChecks must be array`);
  assert(scenario.failureResult, `scenario ${scenario.id} requires degraded/failure result`);
}

const localArchive = pocParityLedger.scenarios.find((item) => item.id === 'local-archive-intake');
assert.equal(localArchive.status, PoCParityStatus.parity, 'local/archive intake is the current proven parity loop');
assert(localArchive.automatedChecks.some((name) => name.includes('poc.localArchiveParity')), 'local archive scenario must name parity test');

const githubScenario = pocParityLedger.scenarios.find((item) => item.id === 'github-source-discovery');
assert(githubScenario.automatedChecks.includes('src/adapters/github/github.issueSnapshot.test.mjs'), 'github scenario must name issue snapshot parser test');

const lineage = pocParityLedger.scenarios.find((item) => item.id === 'loaded-lineage-resolution');
assert.equal(lineage.status, PoCParityStatus.partial, 'loaded lineage remains partial until audit traversal is complete');
assert(lineage.automatedChecks.includes('src/lineage/lineage.resolve.test.mjs'), 'loaded lineage must be resolver-test-backed');
assert(lineage.automatedChecks.includes('src/lineage/lineage.traverse.test.mjs'), 'loaded lineage traversal must be test-backed');
assert(lineage.automatedChecks.includes('src/workspaces/workspace.lineageView.test.mjs'), 'loaded lineage projection must be test-backed');

const auditTraversal = pocParityLedger.scenarios.find((item) => item.id === 'lineage-audit-traversal');
assert(auditTraversal.automatedChecks.includes('src/audit/audit.traverse.test.mjs'), 'audit traversal scenario must name audit traversal test');

const cache = pocParityLedger.scenarios.find((item) => item.id === 'reload-safe-material-cache');
assert.equal(cache.status, PoCParityStatus.partial, 'reload-safe cache needs manual refresh confirmation before parity');
assert(cache.automatedChecks.includes('src/workspaces/workspace.persistence.test.mjs'), 'reload-safe cache must be persistence-test-backed');


const packageBundle = pocParityLedger.scenarios.find((item) => item.id === 'export-package-file-map');
assert.equal(packageBundle.status, PoCParityStatus.partial, 'package file-map remains partial until actual zip/export UX exists');
assert(packageBundle.automatedChecks.includes('src/export/package.builder.test.mjs'), 'package bundle scenario must name builder test');

const schemaCaps = pocParityLedger.scenarios.find((item) => item.id === 'schema-capability-registry');
assert.equal(schemaCaps.status, PoCParityStatus.partial, 'schema capability registry is a core guardrail until consumed by all surfaces');
assert(schemaCaps.automatedChecks.includes('src/schemas/capability.registry.test.mjs'), 'schema capability scenario must name registry test');

const creationContracts = pocParityLedger.scenarios.find((item) => item.id === 'artifact-creation-contracts');
assert.equal(creationContracts.status, PoCParityStatus.partial, 'artifact creation contracts remain partial until all creation UI consumes them');
assert(creationContracts.automatedChecks.includes('src/schemas/creation.contracts.test.mjs'), 'creation contract scenario must name contract test');

const storagePolicy = pocParityLedger.scenarios.find((item) => item.id === 'storage-session-cache-policy');
assert.equal(storagePolicy.status, PoCParityStatus.partial, 'storage policy remains partial until manual browser reload checks');
assert(storagePolicy.automatedChecks.includes('src/storage/storage.policy.test.mjs'), 'storage policy scenario must name policy test');

const sourceTransport = pocParityLedger.scenarios.find((item) => item.id === 'source-transport-diagnostics');
assert.equal(sourceTransport.status, PoCParityStatus.partial, 'source transport diagnostics remain partial until browser/API behavior is reviewed');
assert(sourceTransport.automatedChecks.includes('src/diagnostics/sourceTransport.report.test.mjs'), 'source transport scenario must name transport report test');
assert(sourceTransport.automatedChecks.includes('src/sources/transport.policy.test.mjs'), 'source transport scenario must name transport policy test');

const conformance = pocParityLedger.scenarios.find((item) => item.id === 'conformance-fixture-spine');
assert.equal(conformance.status, PoCParityStatus.partial, 'conformance fixture spine is a guardrail, not a user-visible parity claim');
assert(conformance.automatedChecks.includes('src/conformance/conformance.run.test.mjs'), 'conformance scenario must name fixture test');

const summary = summarizePoCParity();
assert.equal(summary.checkpoint, 'v158', 'summary checkpoint matches ledger');
assert(summary.notParity.includes('declared-lineage-tree'), 'summary should expose remaining non-parity loops');

console.log('✓ PoC parity ledger tests passed');
