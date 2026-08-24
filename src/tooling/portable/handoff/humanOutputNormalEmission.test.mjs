import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { portableCliHelpText } from '../adapters/cli/cli.help.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { projectHandoffHumanOutput } from './carrierProjection.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-human-output-018-'));
try {
  const workspaceRoot = path.join(root, 'workspace');
  const runtimeRoot = path.join(root, 'runtime');
  const outputDir = path.join(root, 'out');
  await makeWorkspace(workspaceRoot);
  await makeRuntime(runtimeRoot);

  const help = portableCliHelpText();
  assert(help.includes('humanOutput.primary as the sole package choice'));
  assert(help.includes('humanOutput.normalInlineRouting.content adjacent to it'));
  assert(help.includes('--transport-text is optional fallback only'));

  const routes = [
    '.topics/handoff/018-anchor-to-loom.trace.md',
    '.topics/handoff/018-anchor-to-axiom.trace.md'
  ];
  const selectedRoute = routes[0];
  const lines = [];
  const code = await runPortableCli([
    'manufacture-handoff-package', workspaceRoot,
    '--handoff', routes[0],
    '--handoff-routes', routes.join(','),
    '--route', selectedRoute,
    '--workspace-id', 'human-output-fixture',
    '--output-dir', outputDir,
    '--built-at', '2026-08-24T06:20:00.000Z',
    '--compact'
  ], { log: (value) => lines.push(value), error: (value) => lines.push(value) }, { runtimeRoot });

  assert.equal(code, 0);
  assert.equal(lines.length, 1, 'normal cold return should be recoverable from the one manufacture result');
  const result = JSON.parse(lines[0]);
  const expectedText = `Handoff package attached.\n\nWorkspace: tiinex-human-output-fixture\nContinue from:\n${selectedRoute}\n`;
  assert.equal(result.status, 'ready');
  assert.equal(result.humanOutput.status, 'ready');
  assert.equal(result.humanOutput.primary.singleHumanTransportChoice, true);
  assert.equal(result.humanOutput.primary.workspaceRelativeHandoffPath, selectedRoute);
  assert.equal(result.primaryOutput.projectedFilename, result.humanOutput.primary.filename);
  assert.equal(result.transportTextSidecar, null, 'normal desktop fast path must not require or emit the optional sidecar');
  assert.deepEqual(result.humanOutput.normalInlineRouting, {
    kind: 'transport-text',
    content: expectedText,
    normalEmission: true,
    requiredForHumanCompletion: true,
    placement: 'adjacent-to-primary',
    authority: 'none'
  });
  assert.equal(result.humanOutput.fallbackTransportText.normalEmission, false);
  assert.equal(result.humanOutput.fallbackTransportText.requiredForHumanCompletion, false);
  assert.equal('content' in result.humanOutput.fallbackTransportText, false, 'bounded manufacture summary must preserve normal bytes without duplicating fallback content');

  const prepared = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'human-output-fixture',
    handoffPath: routes[0],
    handoffRoutes: routes,
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const built = manufactureRecipientRelativeHandoffPackage(prepared, { packageInput: { builtAt: '2026-08-24T06:20:00.000Z' } });
  const selectionRequired = projectHandoffHumanOutput({ projection: built.carrierProjection });
  assert.equal(selectionRequired.status, 'selection-required');
  assert.equal(selectionRequired.primary, null);
  assert.equal(selectionRequired.normalInlineRouting, null);
  assert.equal(selectionRequired.fallbackTransportText, null);
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics', 'handoff'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), '{"name":"tiinex-human-output-fixture","type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'context.md'), '# Required context\n', 'utf8');
  for (const [filename, to] of [['018-anchor-to-loom.trace.md', 'Loom'], ['018-anchor-to-axiom.trace.md', 'Axiom']]) {
    await writeFile(path.join(rootPath, '.topics', 'handoff', filename), handoffMarkdown(to), 'utf8');
  }
}
function handoffMarkdown(to) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-08-24 08:20:00\n\n---\n\n# Tooling 018 ${to} fixture\n\n## Handoff Parties\n\n- Purpose: prove normal human output emission\n- From: Anchor\n- From Kind: role\n- To: ${to}\n- To Kind: role\n\n## Required Context\n\n- required-context\n  - Material: exact fixture context\n  - Material Reference: [Context](../context.md)\n  - Purpose: qualify shared-route required closure\n  - Availability: available\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture\n`;
}
async function makeRuntime(rootPath) {
  await mkdir(path.join(rootPath, 'tools'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1'), { recursive: true });
  await writeFile(path.join(rootPath, 'tools', 'tiinex-portable.mjs'), "import '../src/runtime.js';\n", 'utf8');
  await writeFile(path.join(rootPath, 'src', 'runtime.js'), "export const runtime = 'fixture';\n", 'utf8');
  await writeFile(path.join(rootPath, 'package.json'), '{"type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.md'), '# Portable bootstrap fixture\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.pointer.json'), '{"schema":"fixture"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1', 'schema.md'), '# Canonical schema material fixture\n', 'utf8');
}

console.log('✓ Tooling 018 one-command normal human-output emission and shared-route selection pressure passed');
