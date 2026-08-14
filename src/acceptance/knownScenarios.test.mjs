import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { knownScenarioMatrix, KNOWN_SCENARIO_MATRIX_SCHEMA, KnownScenarioStatus, summarizeKnownScenarioMatrix } from './knownScenarios.js';

const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const packageCheckpoint = String(packageJson.version || '').match(/-(v\d+)$/)?.[1] || '';

assert.equal(knownScenarioMatrix.schema, KNOWN_SCENARIO_MATRIX_SCHEMA);
assert.equal(knownScenarioMatrix.checkpoint, packageCheckpoint, 'known scenario matrix checkpoint follows package version');
assert(knownScenarioMatrix.scenarios.length >= 5, 'matrix must cover local/import, source-over-import, lineage, schema navigation, and public/browser gates');
for (const scenario of knownScenarioMatrix.scenarios) {
  assert(scenario.id, 'scenario requires id');
  assert(Object.values(KnownScenarioStatus).includes(scenario.status), `${scenario.id} has a known status`);
  assert(scenario.contract, `${scenario.id} requires a contract`);
  assert(Array.isArray(scenario.automatedChecks), `${scenario.id} automated checks are explicit`);
  assert(Array.isArray(scenario.manualChecks), `${scenario.id} manual checks are explicit`);
  assert(scenario.failureMode, `${scenario.id} declares failure mode`);
}

const critical = knownScenarioMatrix.scenarios.filter((item) => item.priority === 'critical');
assert(critical.length >= 3, 'critical matrix must cover the three recovered PoC-critical loops');
for (const item of critical) assert.equal(item.status, KnownScenarioStatus.automated, `${item.id} is backed by an automated recovery scenario`);

const localRoundtrip = knownScenarioMatrix.scenarios.find((item) => item.id === 'local-tree-import-open-merge-export-reimport');
assert(localRoundtrip.automatedChecks.includes('src/acceptance/recoveryAcceptance.test.mjs'));
assert(localRoundtrip.contract.includes('without guessed GitHub provenance'));

const sourceOverImport = knownScenarioMatrix.scenarios.find((item) => item.id === 'github-source-over-import-continuity');
assert(sourceOverImport.failureMode.includes('ledger'));
assert(sourceOverImport.manualChecks.some((item) => item.includes('close source')));

const lineage = knownScenarioMatrix.scenarios.find((item) => item.id === 'source-boundary-lineage-recovery');
assert(lineage.contract.includes('without converting the declaring artifact'));

const schemaNav = knownScenarioMatrix.scenarios.find((item) => item.id === 'schema-reading-contract-navigation');
assert.equal(schemaNav.status, KnownScenarioStatus.automated, 'schema navigation affordance is command-tested');
assert(schemaNav.contract.includes('without applying a hidden display filter'));

const publicGate = knownScenarioMatrix.scenarios.find((item) => item.id === 'browser-public-release-gate');
assert.equal(publicGate.status, KnownScenarioStatus.blockedInSandbox, 'public/browser gate remains unclaimed in sandbox');
assert(publicGate.failureMode.includes('Do not claim public/browser PASS'));

const summary = summarizeKnownScenarioMatrix();
assert.equal(summary.checkpoint, packageCheckpoint);
assert.equal(summary.total, knownScenarioMatrix.scenarios.length);
assert(summary.manualRequired.includes('browser-public-release-gate'), 'summary exposes remaining public/browser gate');

console.log('✓ known scenario matrix tests passed');
