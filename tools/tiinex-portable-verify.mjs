#!/usr/bin/env node
import process from 'node:process';
import { runNodePortableCheckpointVerification } from '../src/tooling/portable/adapters/node/checkpoint.verify.js';

const args = parseArgs(process.argv.slice(2));
try {
  const result = await runNodePortableCheckpointVerification({
    repoRoot: args.root || process.cwd(),
    profile: args.profile || 'source-clean',
    output: args.output || '',
    expectedVersion: args['expected-version'] || '',
    commit: args.commit || '',
    sourceCheckpoint: args['source-checkpoint'] || '',
    echo: Boolean(args.echo),
    failFast: Boolean(args['fail-fast']),
    includePaths: Boolean(args['include-paths'])
  });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.qualification.status === 'failed' ? 1 : result.qualification.status === 'incomplete' ? 2 : 0;
} catch (error) {
  console.error(JSON.stringify({ schema: 'tiinex.portable.node-checkpoint-verification.error.v1', error: String(error?.message || error) }, null, 2));
  process.exitCode = 1;
}

function parseArgs(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) { out[key] = next; index += 1; }
    else out[key] = true;
  }
  return out;
}
