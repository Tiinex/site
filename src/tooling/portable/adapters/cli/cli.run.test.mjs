import assert from 'node:assert/strict';
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPortableCli } from './cli.run.js';

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
  assert.deepEqual(result.findings.map((entry) => entry.code), ['live-lineage.turn.message-digest-mismatch']);
  await assert.rejects(access(output), /ENOENT/, 'blocked turn binding must not rewrite the persisted state file');
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log('✓ CLI blocks mismatched turn binding without persisting state passed');
