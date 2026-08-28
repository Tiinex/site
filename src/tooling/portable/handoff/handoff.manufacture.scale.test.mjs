import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-scale-'));
try {
  const workspaceRoot = path.join(root, 'workspace');
  const runtimeRoot = path.join(root, 'runtime');
  await mkdir(path.join(workspaceRoot, '.topics'), { recursive: true });
  await mkdir(path.join(workspaceRoot, 'files'), { recursive: true });
  await writeFile(path.join(workspaceRoot, '.topics', 'context.md'), '# Scale context\n', 'utf8');
  await writeFile(path.join(workspaceRoot, 'workspace.workspace.md'), workspaceMarkdown(), 'utf8');
  await writeFile(path.join(workspaceRoot, '.topics', 'handoff.trace.md'), qualifiedHandoffFixture({ title: 'Scale handoff fixture', to: 'Loom', purpose: 'scale manufacture fixture', createdAt: '2026-08-23 11:00:00', requiredContext: `- context\n  - Material: scale context\n  - Purpose: exact material closure under scale\n  - Availability: available\n  - Material Reference: [Context](context.md)` }), 'utf8');
  for (let index = 0; index < 1283; index += 1) await writeFile(path.join(workspaceRoot, 'files', `${String(index).padStart(4, '0')}.txt`), `carrier-${index}\n`, 'utf8');
  await makeRuntime(runtimeRoot);

  const started = performance.now();
  const input = await prepareNodeHandoffManufacturingInput({ workspaceRoot, workspaceId: 'scale-fixture', workspaceTargetPath: 'workspace.workspace.md', handoffPath: '.topics/handoff.trace.md', runtimeRoot, toolingBootstrap: 'embedded' });
  const result = manufactureRecipientRelativeHandoffPackage(input, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T11:05:00.000Z' } });
  const elapsedMs = Math.round(performance.now() - started);
  assert.equal(input.manufacturingEvidence.enumeration.entryCount, 1286);
  assert.equal(result.status, 'ready');
  assert.equal(result.verification.packageInspection, 'valid');
  assert.equal(result.verification.closureInspection, 'valid');
  assert.equal(result.verification.companionInspection, 'valid');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal(result.verification.toolingBootstrap, 'valid');
  assert.equal(result.descriptor.workspaceArchiveBindings[0].entryMap.count, 1286);
  assert.equal(result.bundle.files.filter((file) => /\.workspace\.zip$/i.test(String(file.path || ''))).length, 1);
  assert(result.migration.avoidedExplodedWorkspaceFiles >= 1286);
  console.log(`✓ Handoff manufacturing scale pressure passed: 1,286 workspace archive entries, ${result.bundle.files.length} package files, ${elapsedMs} ms`);
} finally {
  await rm(root, { recursive: true, force: true });
}

function workspaceMarkdown() {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-08-23 10:59:00
  - Authors: Fixture
  - Why: Qualify the exact Workspace carried by the scale-manufacture regression.
  - Summary: Scale manufacture fixture Workspace.
  - Status: active/local

---

# Scale Manufacture Fixture Workspace

Bounded fixture Workspace.

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: `;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
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
