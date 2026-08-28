import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPortableCli, withCliSummaryProjection } from './cli.run.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-cold-start-summary-'));
try {
  const fixtures = JSON.parse(await readFile('src/tooling/portable/handoff/fixtures/cold-start-qualification.v1.examples.json', 'utf8'));
  const evidencePath = path.join(root, 'evidence.json');
  await writeFile(evidencePath, `${JSON.stringify(fixtures.examples[0], null, 2)}\n`, 'utf8');

  const full = await runJson(['qualify-cold-start', '--evidence', evidencePath, '--compact']);
  assert.equal(full.operation, 'qualify-cold-start');
  assert.equal('projection' in full, false, 'default cold-start qualification projection must remain unchanged');
  assert.equal(typeof full.contract, 'object');
  assert.equal(typeof full.evidence, 'object');

  const summary = await runJson(['qualify-cold-start', '--evidence', evidencePath, '--summary', '--phase-timing', '--compact']);
  assert.equal(summary.projection, 'bounded-summary');
  assert.equal(summary.operation, 'qualify-cold-start');
  assert.equal(summary.status, full.status);
  assert.equal(summary.qualification.preferredPathPassed, full.qualification.preferredPathPassed);
  assert.equal('contract' in summary, false);
  assert.equal('evidence' in summary, false);
  assert.equal(summary.projectionBoundary.requiredContextBodiesProjected, false);
  assert.equal(summary.cliPhaseTiming.command, 'qualify-cold-start');

  const syntheticFindings = Array.from({ length: 25 }, (_, index) => ({ severity: 'warning', code: `w-${index + 1}`, message: 'bounded warning' }));
  const syntheticFull = {
    schema: 'tiinex.portable.operation.result.v1', operation: 'qualify-cold-start', resultSchema: 'tiinex.portable.cold-start-qualification.v1', status: 'preferred-pass', ingressKind: 'routed-handoff-package',
    qualification: full.qualification, metrics: full.metrics, findings: syntheticFindings, findingSummary: { status: 'warnings', counts: { error: 0, warning: 25, info: 0, total: 25 } },
    grounding: { status: 'ready', ingressKind: 'routed-handoff-package', selectedRoute: { id: 'route', state: 'qualified', requiredClosure: { state: 'qualified', requiredCount: 30, qualifiedCount: 30, requirements: Array.from({ length: 30 }, (_, i) => ({ requirementId: `r-${i}`, name: `n-${i}`, state: 'qualified', resolution: { content: 'x'.repeat(5000) } })) } }, handoff: { purpose: 'bounded purpose', from: 'Anchor', to: 'Loom', transfers: Array.from({ length: 25 }, (_, i) => ({ id: `t-${i}`, description: 'work', boundary: 'bounded' })) }, role: { state: 'qualified', exactBoundaryLoaded: { inScope: 'x'.repeat(20000) }, authorityBoundaryLoaded: { mayDo: 'x'.repeat(20000) }, interpretationLimitsLoaded: { doesNotProve: 'x'.repeat(20000) } }, participation: {}, interaction: {}, capabilities: {}, findings: syntheticFindings, findingSummary: { status: 'warnings', counts: { error: 0, warning: 25, info: 0, total: 25 } } },
    continuation: { state: 'ready', substantiveWorkMayBegin: true, qualificationState: 'preferred-pass', selectedRoute: { id: 'route' }, transfer: Array.from({ length: 25 }, (_, i) => ({ id: `t-${i}`, description: 'work', boundary: 'bounded' })), requiredContext: Array.from({ length: 30 }, (_, i) => ({ requirementId: `r-${i}`, name: `n-${i}`, state: 'qualified', contentState: 'hydrated-text', content: 'y'.repeat(10000) })), completionExpectation: { returnTo: 'Anchor' } },
    oneShot: { state: 'qualified' }
  };
  const syntheticSummary = withCliSummaryProjection(syntheticFull, 'qualify-cold-start');
  assert.equal(syntheticSummary.continuation.transfer.length, 20);
  assert.equal(syntheticSummary.continuation.transferOmitted, 5);
  assert.equal(syntheticSummary.continuation.requiredContext.length, 20);
  assert.equal(syntheticSummary.continuation.requiredContextOmitted, 10);
  assert.equal(syntheticSummary.continuation.requiredContextContentBodiesOmitted, 30);
  assert.equal(syntheticSummary.continuation.requiredContext.every((item) => !Object.hasOwn(item, 'content') && item.contentProjected === false), true);
  assert.equal(syntheticSummary.actionableFindings.length, 20);
  assert.equal(syntheticSummary.actionableFindingsOmitted, 5);
  assert.equal(JSON.stringify(syntheticSummary).length < JSON.stringify(syntheticFull).length / 10, true);

  const selectedSummary = withCliSummaryProjection(syntheticFull, 'qualify-cold-start', { 'include-required-context': 'r-25,n-2,missing' });
  assert.equal(selectedSummary.continuation.requiredContextContentBodiesProjected, 2);
  assert.equal(selectedSummary.continuation.requiredContextContentBodiesOmitted, 28);
  assert.deepEqual(selectedSummary.continuation.unmatchedRequiredContextSelectors, ['missing']);
  const projectedBodies = selectedSummary.continuation.requiredContext.filter((item) => item.contentProjected);
  assert.deepEqual(projectedBodies.map((item) => item.requirementId).sort(), ['r-2', 'r-25']);
  assert.equal(projectedBodies.every((item) => typeof item.content === 'string' && item.content.length === 10000), true);

  const allSummary = withCliSummaryProjection(syntheticFull, 'qualify-cold-start', { 'include-required-context': 'all' });
  assert.equal(allSummary.continuation.requiredContextContentBodiesProjected, 20);
  assert.equal(allSummary.continuation.requiredContextContentBodiesOmitted, 10);
  assert.equal(allSummary.continuation.requiredContextOmitted, 10);

  const largeEvidence = structuredClone(fixtures.examples[0]);
  largeEvidence.findings = [];
  const syntheticPath = path.join(root, 'large.json');
  await writeFile(syntheticPath, `${JSON.stringify(largeEvidence, null, 2)}\n`, 'utf8');
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('✓ CLI bounded cold-start qualification summary preserves default output and omits body-scale qualification evidence');

async function runJson(argv, expectedCode = 0) {
  const lines = [];
  const errors = [];
  const code = await runPortableCli(argv, { log: (value) => lines.push(value), error: (value) => errors.push(value) });
  assert.equal(code, expectedCode, errors.join('\n'));
  return JSON.parse(lines.at(-1));
}
