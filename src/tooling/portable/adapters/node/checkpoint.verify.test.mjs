import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runNodePortableCheckpointVerification } from './checkpoint.verify.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-portable-verify-'));
await mkdir(path.join(root, 'src/tooling/portable/bootstrap'), { recursive: true });
await mkdir(path.join(root, 'src/parity'), { recursive: true });
await mkdir(path.join(root, '.github/workflows'), { recursive: true });
await mkdir(path.join(root, 'tools'), { recursive: true });
await writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'tiinex-site', version: '0.0.1-v7', type: 'module', dependencies: {} }), 'utf8');
await writeFile(path.join(root, 'src/tooling/portable/example.js'), 'export const example = true;\n', 'utf8');
await writeFile(path.join(root, 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md'), '# Bootstrap\n', 'utf8');
await writeFile(path.join(root, 'src/parity/poc.parityLedger.js'), "export const ledger = { checkpoint: 'v6' };\n", 'utf8');
await writeFile(path.join(root, '.github/workflows/publish-public.yml'), 'steps:\n  - run: npm install --no-audit\n', 'utf8');
await writeFile(path.join(root, 'yarn.lock'), '# lock\n', 'utf8');

const result = await runNodePortableCheckpointVerification({ repoRoot: root, profile: 'portable' });
assert.equal(result.schema, 'tiinex.portable.node-checkpoint-verification.v1');
assert.equal(result.receipts.length, 2);
assert.equal(result.receipts[0].gateId, 'portable-syntax');
assert.equal(result.receipts[0].status, 'passed');
assert.equal(result.receipts[1].gateId, 'portable-tests');
assert.equal(result.receipts[1].status, 'failed');
assert.equal(result.qualification.status, 'failed');
assert.equal(result.qualification.continuity.status, 'drift');
assert.equal(result.qualification.portableIdentity.sourceFiles >= 2, true);

console.log('✓ Node portable checkpoint verifier emits fixed-command receipts and deterministic source identity');
