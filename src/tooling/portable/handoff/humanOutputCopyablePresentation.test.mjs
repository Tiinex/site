import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { portableCliHelpText } from '../adapters/cli/cli.help.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-human-output-023-'));
try {
  const workspaceRoot = path.join(root, 'workspace');
  const runtimeRoot = path.join(root, 'runtime');
  const outputDir = path.join(root, 'out');
  const route = '.topics/handoff/023-loom-to-anchor.trace.md';
  await makeWorkspace(workspaceRoot, route);
  await makeRuntime(runtimeRoot);

  const help = portableCliHelpText();
  assert(help.includes('copyable surface'));
  assert(help.includes('supports fenced code blocks'));
  assert(help.includes('Do not add semantic work-summary prose'));
  assert(help.includes('Presentation wrappers have no semantic authority'));

  const bootstrap = await readFile(new URL('../bootstrap/tiinex.llm.bootstrap.md', import.meta.url), 'utf8');
  assert(bootstrap.includes('humanOutput.presentation'));
  assert(bootstrap.includes('fenced code block'));
  assert(bootstrap.includes('humanOutput.normalEmissionBoundary'));
  assert(bootstrap.includes('manually reconstructed routing'));

  const lines = [];
  const code = await runPortableCli([
    'manufacture-handoff-package', workspaceRoot,
    '--handoff', route,
    '--route', route,
    '--workspace-id', 'copyable-fixture',
    '--output-dir', outputDir,
    '--built-at', '2026-08-24T10:00:00.000Z',
    '--compact'
  ], { log: (value) => lines.push(value), error: (value) => lines.push(value) }, { runtimeRoot });
  assert.equal(code, 0);
  const result = JSON.parse(lines.at(-1));
  const expected = `Handoff package attached.\n\nWorkspace: tiinex-copyable-fixture\nContinue from:\n${route}\n`;
  assert.equal(result.humanOutput.normalInlineRouting.content, expected);
  assert.equal(result.humanOutput.normalInlineRouting.content.includes('```'), false, 'host wrapper must never become routing content');
  assert.deepEqual(result.humanOutput.presentation, {
    copyableSurfaceRequired: true,
    exactContentRequired: true,
    fencedCodeBlockWhenSupported: 'required',
    equivalentCopyableSurfaceAllowed: true,
    wrapperAuthority: 'none',
    hostCapabilityRule: 'Use a fenced code block when the chat host supports fenced copyable blocks; otherwise use an equivalent copyable host surface without changing routing content.'
  });
  assert.deepEqual(result.humanOutput.normalEmissionBoundary.allowed, ['primary', 'normalInlineRouting']);
  assert.equal(result.humanOutput.normalEmissionBoundary.semanticWorkSummaryProse, false);
  assert.equal(result.humanOutput.normalEmissionBoundary.internalHumanOutputJson, false);
  assert.equal(result.humanOutput.normalEmissionBoundary.helperArtifacts, false);
  assert.equal(result.humanOutput.normalEmissionBoundary.manuallyReconstructedRouting, false);
  assert.equal(result.humanOutput.normalEmissionBoundary.duplicateNormalFileChoices, false);
  assert.equal(result.transportTextSidecar, null);

  const projectedLines = [];
  const projectedCode = await runPortableCli([
    'project-handoff-carrier-output', result.primaryOutput.path,
    '--route', route,
    '--compact'
  ], { log: (value) => projectedLines.push(value), error: (value) => projectedLines.push(value) });
  assert.equal(projectedCode, 0);
  const projected = JSON.parse(projectedLines.at(-1));
  assert.equal(projected.humanOutput.normalInlineRouting.content, expected);
  assert.deepEqual(projected.humanOutput.presentation, result.humanOutput.presentation);
  assert.deepEqual(projected.humanOutput.normalEmissionBoundary, result.humanOutput.normalEmissionBoundary);
  assert.equal(projected.humanOutput.fallbackTransportText.normalEmission, false);
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath, route) {
  await mkdir(path.join(rootPath, '.topics', 'handoff'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), '{"name":"tiinex-copyable-fixture","type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, route), `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-08-24 10:00:00\n\n---\n\n# Copyable presentation fixture\n\n## Handoff Parties\n\n- Purpose: prove host presentation metadata\n- From: Loom\n- From Kind: role\n- To: Anchor\n- To Kind: role\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture\n`, 'utf8');
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

console.log('✓ Tooling 023 copyable normal Handoff presentation contract passed');
