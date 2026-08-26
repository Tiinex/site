import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { portableCliHelpText } from '../adapters/cli/cli.help.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { projectHandoffHumanOutput } from './carrierProjection.js';
import { projectRecipientV2HumanOutput, recipientV2StandardInvocation } from './recipientV2.humanOutput.js';

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
    '--workspace-target', 'workspace.workspace.md',
    '--output-dir', outputDir,
    '--built-at', '2026-08-24T06:20:00.000Z',
    '--compact'
  ], { log: (value) => lines.push(value), error: (value) => lines.push(value) }, { runtimeRoot });

  assert.equal(code, 0);
  assert.equal(lines.length, 1, 'normal cold return should be recoverable from the one manufacture result');
  const result = JSON.parse(lines[0]);
  const expectedText = `Handoff package attached.\n\nCold start: read Start directly; do not list or extract this package.\n\nStart:\n001-1-READ-BEFORE-PROCEEDING.trace.md\nContinue from (do not read native; pass to Tiinex after bootstrap):\n001-3-2-handoff-pointer.trace.md\n`;
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
    workspaceTargetPath: 'workspace.workspace.md',
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
  const recipientV2Inspection = { routes: [
    { pointerPath: '001-3-2-handoff-pointer.trace.md', workspaceId: 'human-output-fixture', workspaceRelativeHandoffPath: routes[0] },
    { pointerPath: '001-3-1-handoff-pointer.trace.md', workspaceId: 'human-output-fixture', workspaceRelativeHandoffPath: routes[1] }
  ] };
  const baseRecipientV2HumanOutput = projectHandoffHumanOutput({ projection: built.carrierProjection, route: selectedRoute });
  const recipientV2HumanOutput = projectRecipientV2HumanOutput(baseRecipientV2HumanOutput, recipientV2Inspection);
  const expectedRecipientV2Invocation = recipientV2StandardInvocation(baseRecipientV2HumanOutput, recipientV2Inspection);
  assert.equal(recipientV2HumanOutput.normalInlineRouting.content, expectedRecipientV2Invocation);
  assert.equal(recipientV2HumanOutput.fallbackTransportText.content, expectedRecipientV2Invocation);
  assert.equal(expectedRecipientV2Invocation, `Handoff package attached.\n\nCold start: read Start directly; do not list or extract this package.\n\nStart:\n001-1-READ-BEFORE-PROCEEDING.trace.md\nContinue from (do not read native; pass to Tiinex after bootstrap):\n001-3-2-handoff-pointer.trace.md\n`);
  assert.equal(expectedRecipientV2Invocation.includes(routes[0]), false, 'transport text must not duplicate the semantic Handoff path owned by the selected route Pointer');
  assert.equal(expectedRecipientV2Invocation.includes('Workspace:'), false, 'recipient-v2 transport text must not expose Workspace naming as an alternate ingress hint');
  assert.equal(expectedRecipientV2Invocation.includes('human-output-fixture'), false, 'recipient-v2 transport text must not leak Workspace id outside package-owned artifacts');
  assert.equal(expectedRecipientV2Invocation.includes('Selected Handoff'), false, 'transport text is an address label, not a semantic Handoff summary');
  const axiomBase = projectHandoffHumanOutput({ projection: built.carrierProjection, route: routes[1] });
  const axiomInvocation = recipientV2StandardInvocation(axiomBase, recipientV2Inspection);
  assert.equal(axiomInvocation, `Handoff package attached.\n\nCold start: read Start directly; do not list or extract this package.\n\nStart:\n001-1-READ-BEFORE-PROCEEDING.trace.md\nContinue from (do not read native; pass to Tiinex after bootstrap):\n001-3-1-handoff-pointer.trace.md\n`);
  assert.notEqual(axiomInvocation, expectedRecipientV2Invocation, 'the same shared ZIP must be addressable to different recipients only by exact route-specific outer invocation');
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics', 'handoff'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), '{"name":"tiinex-human-output-fixture","type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown(), 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'context.md'), '# Required context\n', 'utf8');
  for (const [filename, to] of [['018-anchor-to-loom.trace.md', 'Loom'], ['018-anchor-to-axiom.trace.md', 'Axiom']]) {
    await writeFile(path.join(rootPath, '.topics', 'handoff', filename), handoffMarkdown(to), 'utf8');
  }
}
function handoffMarkdown(to) {
  return qualifiedHandoffFixture({
    title: `Tooling 018 ${to} fixture`,
    to,
    purpose: 'prove normal human output emission',
    createdAt: '2026-08-24 08:20:00',
    requiredContext: `- required-context
  - Material: exact fixture context
  - Material Reference: [Context](../context.md)
  - Purpose: qualify shared-route required closure
  - Availability: available`
  });
}
function workspaceMarkdown() {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-08-24 08:00:00
  - Authors: Fixture
  - Why: Qualify the exact Workspace carried by the human-output regression.
  - Summary: Human output fixture Workspace.
  - Status: active/local

---

# Human Output Fixture Workspace

Bounded fixture Workspace.

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: `;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}
`;
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
