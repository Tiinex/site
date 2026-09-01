import assert from 'node:assert/strict';
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPortableCli } from './cli.run.js';
import { runPortableOperation } from '../../operation.catalog.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-cli-turn-binding-'));
try {
  const transaction = path.join(root, 'turn.json');
  const output = path.join(root, 'state.json');
  await writeFile(transaction, `${JSON.stringify({
    sessionId: 'session-cli-binding',
    turn: {
      id: 'dialogue:turn-0001',
      sequence: 1,
      userMessage: 'Exact current user message.',
      messageSha256: 'a'.repeat(64),
      summary: 'Caller supplied a mismatched digest.'
    },
    changes: []
  }, null, 2)}\n`, 'utf8');
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['process-live-turn', '--turn', transaction, '--output', output], io);
  assert.equal(code, 2);
  const result = JSON.parse(lines.at(-1));
  assert.equal(result.status, 'blocked');
  assert.equal('cliPhaseTiming' in result, false, 'default CLI output must remain unchanged when --phase-timing is absent');
  assert.deepEqual(result.findings.map((entry) => entry.code), ['live-lineage.turn.message-digest-mismatch']);
  await assert.rejects(access(output), /ENOENT/, 'blocked turn binding must not rewrite the persisted state file');
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log('✓ CLI blocks mismatched turn binding without persisting state passed');

{
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['describe-cold-start-ingress', 'routed-handoff-package', '--phase-timing'], io);
  assert.equal(code, 0);
  const result = JSON.parse(lines.at(-1));
  assert.equal(result.cliPhaseTiming.schema, 'tiinex.portable.cli.phase-timing.v1');
  assert.equal(result.cliPhaseTiming.command, 'describe-cold-start-ingress');
  assert.equal('totalElapsedMs' in result.cliPhaseTiming, false, 'pre-serialization elapsed time must not be presented as total CLI elapsed time');
  assert.equal(result.cliPhaseTiming.measuredElapsedBeforeFinalSerializationMs >= 0, true);
  assert.equal(result.cliPhaseTiming.phases.inputPreparationMs >= 0, true);
  assert.equal(result.cliPhaseTiming.phases.operationExecutionMs >= 0, true);
  assert.equal(result.cliPhaseTiming.phases.outputMaterializationMs >= 0, true);
  assert.equal(result.cliPhaseTiming.measurementBoundary, 'immediately-before-final-json-serialization');
  assert.deepEqual(result.cliPhaseTiming.unmeasured, { finalJsonSerialization: true, finalEmission: true });
  assert.match(result.cliPhaseTiming.boundary, /final JSON serialization and emission are explicitly unmeasured/);
  assert.match(result.cliPhaseTiming.boundary, /excludes host review\/queue latency/);
}
console.log('✓ CLI opt-in in-process phase timing passed');


{
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['describe-cold-start-ingress', 'routed-handoff-package'], io);
  assert.equal(code, 0);
  const expected = await runPortableOperation('describe-cold-start-ingress', { ingressKind: 'routed-handoff-package' }, {});
  assert.equal(lines.at(-1), JSON.stringify(expected, null, 2), 'default CLI output must remain byte-equivalent to ordinary pretty JSON operation output');
}
console.log('✓ CLI default output byte-equivalence without phase timing passed');

{
  const lines = [];
  const io = { log: (value) => lines.push(value), error: (value) => lines.push(value) };
  const code = await runPortableCli(['discover-tooling', '--phase-timing'], io);
  assert.equal(code, 0);
  const serialized = lines.at(-1);
  assert.equal(Buffer.byteLength(serialized, 'utf8') > 4096, true, 'focused timing regression must exercise a non-trivial JSON serialization/output path');
  const result = JSON.parse(serialized);
  assert.equal('totalElapsedMs' in result.cliPhaseTiming, false);
  assert.equal(result.cliPhaseTiming.measurementBoundary, 'immediately-before-final-json-serialization');
  assert.equal(result.cliPhaseTiming.unmeasured.finalJsonSerialization, true);
  assert.equal(result.cliPhaseTiming.unmeasured.finalEmission, true);
}
console.log('✓ CLI phase timing truthfully bounds non-trivial final serialization/output passed');
