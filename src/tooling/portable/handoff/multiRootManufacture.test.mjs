import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { packageFileBytes } from '../../../export/package.bytes.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-multi-root-'));
try {
  const siteRoot = path.join(root, 'site');
  const docsRoot = path.join(root, 'docs');
  const runtimeRoot = path.join(root, 'runtime');
  await makeWorkspace(siteRoot, 'Site', 'Loom', 'site-context.md', [10, 11, 12]);
  await makeWorkspace(docsRoot, 'Docs', 'Axiom', 'docs-context.md', [0, 1, 2, 255, 128]);
  await makeRuntime(runtimeRoot);

  const secondaryOnlyInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    handoffPath: '.topics/015-handoff.trace.md',
    additionalWorkspaces: [{ id: 'docs', root: docsRoot, title: 'Docs' }],
    handoffRoutes: [{ workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }],
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  assert.deepEqual(secondaryOnlyInput.workspaceMaterializations.map((item) => item.id), ['site', 'docs']);
  assert.equal(secondaryOnlyInput.manufacturingEvidence.workspaceEnumerations.length, 2);
  assert.equal(secondaryOnlyInput.workspaceMaterializations[1].source.authority, 'none');
  const secondaryOnly = manufactureRecipientRelativeHandoffPackage(secondaryOnlyInput, { packageInput: { builtAt: '2026-08-23T18:00:00.000Z' } });
  assert.equal(secondaryOnly.status, 'ready');
  assert.equal(secondaryOnly.carrierProjection.routes.length, 1);
  assert.equal(secondaryOnly.carrierProjection.routes[0].workspaceId, 'docs');
  assert.equal(secondaryOnly.carrierProjection.routes[0].workspaceRelativePath, '.topics/015-handoff.trace.md');
  assert.equal(secondaryOnly.carrierProjection.workspaces.length, 2, 'a carried workspace may intentionally have no route');
  const docsBlob = secondaryOnly.bundle.files.find((file) => file.path === 'handoff.workspaces/docs/content/blob.bin');
  assert.deepEqual([...packageFileBytes(docsBlob)], [0, 1, 2, 255, 128], 'secondary binary bytes must survive package manufacture');

  const twoRoutesInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    handoffPath: '.topics/015-handoff.trace.md',
    additionalWorkspaces: [{ id: 'docs', root: docsRoot }],
    handoffRoutes: [
      { workspaceId: 'site', path: '.topics/015-handoff.trace.md' },
      { workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }
    ],
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const twoRoutes = manufactureRecipientRelativeHandoffPackage(twoRoutesInput, { packageInput: { builtAt: '2026-08-23T18:00:00.000Z' } });
  assert.equal(twoRoutes.status, 'ready');
  assert.equal(twoRoutes.carrierProjection.mode, 'shared');
  assert.deepEqual(twoRoutes.carrierProjection.routes.map((route) => route.workspaceId).sort(), ['docs', 'site']);
  assert.equal(twoRoutes.pointerEntrypointProjection.entries.length, 2);

  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot: siteRoot,
      workspaceId: 'site',
      handoffPath: '.topics/015-handoff.trace.md',
      additionalWorkspaces: [{ id: 'site', root: docsRoot }],
      runtimeRoot
    }),
    /workspace-id\.duplicate:site/
  );
  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot: siteRoot,
      workspaceId: 'site',
      handoffPath: '.topics/015-handoff.trace.md',
      additionalWorkspaces: [{ id: 'missing', root: path.join(root, 'missing') }],
      runtimeRoot
    }),
    /ENOENT|no such file/i
  );
  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot: siteRoot,
      workspaceId: 'site',
      handoffPath: '.topics/015-handoff.trace.md',
      additionalWorkspaces: [{ id: 'docs', root: docsRoot }],
      handoffRoutes: [{ path: '.topics/015-handoff.trace.md' }],
      runtimeRoot
    }),
    /route\.workspace-id\.required/
  );

  const workspaceJson = path.join(root, 'workspaces.json');
  const routesJson = path.join(root, 'routes.json');
  const cliZip = path.join(root, 'multi-root.zip');
  await writeFile(workspaceJson, `${JSON.stringify({ workspaces: [{ id: 'docs', root: docsRoot, title: 'Docs' }] }, null, 2)}\n`, 'utf8');
  await writeFile(routesJson, `${JSON.stringify({ routes: [{ workspaceId: 'site', path: '.topics/015-handoff.trace.md' }, { workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }] }, null, 2)}\n`, 'utf8');
  const lines = [];
  const code = await runPortableCli([
    'manufacture-handoff-package', siteRoot,
    '--handoff', '.topics/015-handoff.trace.md',
    '--workspace-id', 'site',
    '--workspace-roots', workspaceJson,
    '--workspace-routes', routesJson,
    '--route', 'handoff-route:docs:.topics/015-handoff.trace.md',
    '--output', cliZip,
    '--built-at', '2026-08-23T18:00:00.000Z',
    '--compact'
  ], { log: (value) => lines.push(value), error: (value) => lines.push(value) }, { runtimeRoot });
  assert.equal(code, 0);
  const cli = JSON.parse(lines.at(-1));
  assert.equal(cli.status, 'ready');
  assert.deepEqual(cli.planSummary.workspaces.map((item) => item.id), ['site', 'docs']);
  assert.equal(cli.carrierProjection.routes.length, 2);
  assert.equal((await readFile(cliZip)).byteLength > 0, true);

  const legacyInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    handoffPath: '.topics/015-handoff.trace.md',
    handoffRoutes: ['.topics/015-handoff.trace.md'],
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  assert.equal(legacyInput.workspaceMaterializations.length, 1);
  assert.equal(legacyInput.transportRoutes[0], '.topics/015-handoff.trace.md');
  const legacy = manufactureRecipientRelativeHandoffPackage(legacyInput, { packageInput: { builtAt: '2026-08-23T18:00:00.000Z' } });
  assert.equal(legacy.status, 'ready');
  assert.equal(legacy.carrierProjection.routes[0].workspaceId, 'site');
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath, title, to, contextName, bytes) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await mkdir(path.join(rootPath, 'content'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), `${JSON.stringify({ name: `tiinex-${title.toLowerCase()}-fixture`, type: 'module' })}\n`, 'utf8');
  await writeFile(path.join(rootPath, '.topics', contextName), `# ${title} context\n`, 'utf8');
  await writeFile(path.join(rootPath, '.topics', '015-handoff.trace.md'), handoffMarkdown(title, to, contextName), 'utf8');
  await writeFile(path.join(rootPath, 'content', 'blob.bin'), Uint8Array.from(bytes));
}
function handoffMarkdown(title, to, contextName) {
  return qualifiedHandoffFixture({
    title: `${title} handoff`,
    to,
    purpose: 'multi-root fixture',
    createdAt: '2026-08-23 18:00:00',
    requiredContext: `- local-context
  - Material: exact context
  - Material Reference: [Context](${contextName})
  - Purpose: route-local context
  - Availability: available`
  });
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

console.log('✓ Tooling 015 operator-supplied multi-root manufacturing and one-root compatibility passed');
