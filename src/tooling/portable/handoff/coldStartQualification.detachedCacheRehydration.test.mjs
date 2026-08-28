import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { sha256Hex } from '../../../export/package.bytes.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { recipientFacingV2PackageZipBuffer } from '../output/recipientV2.zip.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'site-local:.topics/.schemas/tiinex.workspace.v1.schema.md';
const encoder = new TextEncoder();
const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-detached-cache-cold-start-'));

try {
  const workspaceRoot = path.join(root, 'workspace');
  const runtimeRoot = path.join(root, 'runtime');
  await mkdir(path.join(workspaceRoot, '.topics'), { recursive: true });
  await writeFile(path.join(workspaceRoot, 'workspace.workspace.md'), workspaceMarkdown(), 'utf8');
  await writeFile(path.join(workspaceRoot, '.topics', '015-handoff.trace.md'), qualifiedHandoffFixture({
    title: 'Detached cache cold-start rehydration fixture',
    to: 'Loom',
    purpose: 'Prove exact cache-entry rehydration after physical package serialization',
    createdAt: '2026-08-28 20:40:00',
    requiredContext: `- detached-alpha\n  - Material: first detached context\n  - Material Reference: [Alpha](external://context/alpha)\n  - Purpose: prove exact first inner cache entry\n  - Availability: available\n\n- detached-beta\n  - Material: second detached context\n  - Material Reference: [Beta](external://context/beta)\n  - Purpose: prove exact second inner cache entry\n  - Availability: available`
  }), 'utf8');
  await makeRuntime(runtimeRoot);

  const alpha = encoder.encode('alpha-detached-material-bytes');
  const beta = encoder.encode('beta-detached-material-bytes-with-distinct-length');
  assert.notEqual(alpha.byteLength, beta.byteLength);
  assert.notEqual(sha256Hex(alpha), sha256Hex(beta));

  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'cache-rehydration',
    workspaceTitle: 'Cache Rehydration',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    handoffRoutes: [{ workspaceId: 'cache-rehydration', path: '.topics/015-handoff.trace.md' }],
    materialBindings: {
      'external://context/alpha': { content: new TextDecoder().decode(alpha), providerId: 'fixture-alpha', providerKind: 'supplied-material', referenceTarget: 'external://context/alpha' },
      'external://context/beta': { content: new TextDecoder().decode(beta), providerId: 'fixture-beta', providerKind: 'supplied-material', referenceTarget: 'external://context/beta' }
    },
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });

  const built = manufactureRecipientRelativeHandoffPackage(input, {
    verifyRoundtrip: true,
    packageInput: { builtAt: '2026-08-28T20:40:00.000Z' }
  });
  assert.equal(built.status, 'ready', JSON.stringify(built.findings, null, 2));
  assert.equal(built.inspection.phase1.cleanCarrierPhase2, true);
  assert.equal(built.inspection.caches.length, 1);
  assert.equal(built.carrierProjection.routes[0].requiredClosure.state, 'qualified');
  assert.equal(built.carrierProjection.routes[0].requiredClosure.requirements.length, 2);

  const zipPath = path.join(root, 'detached-cache.handoff-package.zip');
  await writeFile(zipPath, recipientFacingV2PackageZipBuffer(built.bundle));
  const lines = [];
  const code = await runPortableCli([
    'qualify-cold-start', zipPath,
    '--route', built.inspection.routes[0].pointerPath,
    '--pre-takeover', 'minimal-bootstrap-only',
    '--compact'
  ], { log: (value) => lines.push(value), error: (value) => lines.push(value) });
  assert.equal(code, 0, JSON.stringify(lines, null, 2));
  const qualified = JSON.parse(lines.at(-1));
  assert.equal(qualified.status, 'preferred-pass', JSON.stringify(qualified.findings || [], null, 2));
  assert.notEqual(qualified.grounding.status, 'blocked', JSON.stringify(qualified.grounding.findings || [], null, 2));

  const required = qualified.continuation.requiredContext;
  assert.equal(required.length, 2);
  const byReference = new Map(required.map((entry) => [entry.referenceTarget, entry]));
  assert.equal(byReference.get('external://context/alpha')?.kind, 'workspace-cache-entry');
  assert.equal(byReference.get('external://context/alpha')?.actualBytes, alpha.byteLength);
  assert.equal(byReference.get('external://context/alpha')?.actualSha256, sha256Hex(alpha));
  assert.equal(byReference.get('external://context/beta')?.kind, 'workspace-cache-entry');
  assert.equal(byReference.get('external://context/beta')?.actualBytes, beta.byteLength);
  assert.equal(byReference.get('external://context/beta')?.actualSha256, sha256Hex(beta));
  assert.equal(byReference.get('external://context/alpha')?.state, 'qualified');
  assert.equal(byReference.get('external://context/beta')?.state, 'qualified');

  console.log('✓ detached Required Context cache entries rehydrate from exact serialized inner-entry bytes during one-shot cold start');
} finally {
  await rm(root, { recursive: true, force: true });
}

function workspaceMarkdown() {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-08-28 20:40:00\n  - Authors: Fixture\n  - Why: Exercise detached-cache cold-start rehydration.\n  - Summary: Detached cache cold-start regression workspace\n  - Status: active/local\n\n---\n\n# Detached cache regression\n\nWorkspace fixture body.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}

async function makeRuntime(rootPath) {
  await mkdir(path.join(rootPath, 'tools'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1'), { recursive: true });
  await writeFile(path.join(rootPath, 'tools', 'tiinex-portable.mjs'), "import '../src/runtime.js';\n", 'utf8');
  await writeFile(path.join(rootPath, 'src', 'runtime.js'), "export const runtime = 'fixture';\n", 'utf8');
  await writeFile(path.join(rootPath, 'package.json'), '{"type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.md'), '# Bootstrap\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.pointer.json'), '{"schema":"fixture"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1', 'schema.md'), '# Root\n', 'utf8');
}
