#!/usr/bin/env node
import { runFoundationSuite } from './run-foundation-suite.mjs';

const result = runFoundationSuite('all');
if (result.status !== 'passed') {
  const failed = result.results.find((item) => item.exitCode !== 0);
  if (failed?.failureOutput) console.error(failed.failureOutput);
  console.error(`Foundation acceptance failed at ${failed?.file || 'unknown case'}`);
  process.exit(1);
}
console.log(`✓ Foundation acceptance spine passed ${result.executedCases}/${result.plannedCases} cases in ${result.totalElapsedMs.toFixed(3)} ms`);
