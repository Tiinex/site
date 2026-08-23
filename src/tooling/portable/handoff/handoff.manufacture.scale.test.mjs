import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-scale-'));
try {
  const workspaceRoot = path.join(root, 'workspace');
  const runtimeRoot = path.join(root, 'runtime');
  await mkdir(path.join(workspaceRoot, '.topics'), { recursive: true });
  await mkdir(path.join(workspaceRoot, 'files'), { recursive: true });
  await writeFile(path.join(workspaceRoot, '.topics', 'context.md'), '# Scale context\n', 'utf8');
  await writeFile(path.join(workspaceRoot, '.topics', 'handoff.trace.md'), `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-08-23 11:00:00\n\n---\n\n# Scale handoff fixture\n\n## Required Context\n\n- context\n  - Material: scale context\n  - Purpose: exact material closure under scale\n  - Availability: available\n  - Material Reference: [Context](context.md)\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture\n`, 'utf8');
  for (let index = 0; index < 1284; index += 1) await writeFile(path.join(workspaceRoot, 'files', `${String(index).padStart(4, '0')}.txt`), `carrier-${index}\n`, 'utf8');
  await makeRuntime(runtimeRoot);

  const started = performance.now();
  const input = await prepareNodeHandoffManufacturingInput({ workspaceRoot, workspaceId: 'scale-fixture', handoffPath: '.topics/handoff.trace.md', runtimeRoot, toolingBootstrap: 'embedded' });
  const result = manufactureRecipientRelativeHandoffPackage(input, { packageInput: { builtAt: '2026-08-23T11:05:00.000Z' } });
  const elapsedMs = Math.round(performance.now() - started);
  assert.equal(input.manufacturingEvidence.enumeration.entryCount, 1286);
  assert.equal(result.status, 'ready');
  assert.equal(result.verification.packageInspection, 'valid');
  assert.equal(result.verification.closureInspection, 'valid');
  assert.equal(result.verification.companionInspection, 'valid');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal(result.verification.toolingBootstrap, 'valid');
  assert.equal(result.bundle.files.filter((file) => file.path.startsWith('handoff.workspaces/scale-fixture/')).length, 1286);
  console.log(`✓ Handoff manufacturing scale pressure passed: 1,286 workspace carriers, ${result.bundle.files.length} package files, ${elapsedMs} ms`);
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeRuntime(rootPath) {
  await mkdir(path.join(rootPath, 'tools'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1'), { recursive: true });
  await writeFile(path.join(rootPath, 'tools', 'tiinex-portable.mjs'), "import '../src/runtime.js';\n", 'utf8');
  await writeFile(path.join(rootPath, 'src', 'runtime.js'), "export const runtime = 'scale-fixture';\n", 'utf8');
  await writeFile(path.join(rootPath, 'package.json'), '{"type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.md'), '# Portable bootstrap fixture\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.pointer.json'), '{"schema":"fixture"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1', 'schema.md'), '# Schema fixture\n', 'utf8');
}
