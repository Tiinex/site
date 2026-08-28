import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { portableRuntimePackageZipBuffer } from '../output/node.zip.js';
import { buildRecipientRelativeHandoffTransportPackage } from './materialClosure.package.js';
import { inspectHandoffCarrierProjection, projectHandoffCarrierOutputFromPackage, projectHandoffHumanOutput } from './carrierProjection.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-carrier-'));
try {
  const workspaceRoot = path.join(root, 'shared-workspace');
  const runtimeRoot = path.join(root, 'portable-runtime');
  await makeWorkspace(workspaceRoot);
  await makeRuntime(runtimeRoot);
  const routes = [
    '.topics/handoff/004-anchor-to-loom.trace.md',
    '.topics/handoff/004-anchor-to-axiom.trace.md',
    '.topics/handoff/004-anchor-to-kodax.trace.md'
  ];
  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'shared-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: routes[0],
    handoffRoutes: routes,
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  assert.equal(input.workspace.title, 'tiinex-shared-fixture', 'workspace-readable slug source should come from qualified package.json identity when title is not supplied');
  const built = buildRecipientRelativeHandoffTransportPackage(input, { packageInput: { builtAt: '2026-08-23T13:00:00.000Z' } });
  assert.equal(built.status, 'ready');
  const purposeInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'shared-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: routes[0],
    handoffRoutes: [{ workspaceId: 'shared-fixture', path: routes[0], purpose: 'warm recipient pressure test' }],
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const purposeBuilt = buildRecipientRelativeHandoffTransportPackage(purposeInput, { packageInput: { builtAt: '2026-08-23T13:00:00.000Z' } });
  assert.equal(purposeBuilt.carrierProjection.routes[0].projectedFilename, 'tiinex-shared-fixture-001-anchor-to-loom.handoff-package.zip', 'route purpose/test scenario must never leak into Tooling-projected carrier basename');
  assert.equal(built.carrierInspection.status, 'valid');
  assert.equal(built.carrierProjection.status, 'ready');
  assert.equal(built.carrierProjection.mode, 'shared');
  assert.equal(built.carrierProjection.selection.policy, 'explicit-qualified-route-required');
  assert.equal(built.carrierProjection.routes.length, 3);
  assert.deepEqual(built.carrierProjection.routes.map((route) => route.dimension), ['001', '001', '001']);
  assert.deepEqual(built.carrierProjection.routes.map((route) => route.projectedFilename), [
    'tiinex-shared-fixture-001-anchor-to-axiom.handoff-package.zip',
    'tiinex-shared-fixture-001-anchor-to-kodax.handoff-package.zip',
    'tiinex-shared-fixture-001-anchor-to-loom.handoff-package.zip'
  ]);
  assert.equal(built.bundle.files.filter((file) => file.path === 'handoff.workspaces/shared-fixture/.topics/shared-context.md').length, 1, 'shared carrier must carry common workspace bytes once');

  const noSelection = projectHandoffHumanOutput({ projection: built.carrierProjection });
  assert.equal(noSelection.status, 'selection-required');
  assert.equal(noSelection.primary, null);
  assert.equal(noSelection.normalInlineRouting, null);
  assert.equal(noSelection.fallbackTransportText, null);
  const selectedOutputs = routes.map((route) => projectHandoffHumanOutput({ projection: built.carrierProjection, route }));
  for (let index = 0; index < routes.length; index += 1) {
    const projected = selectedOutputs[index];
    assert.equal(projected.status, 'ready');
    assert.equal(projected.primary.workspaceRelativeHandoffPath, routes[index]);
    assert(projected.fallbackTransportText.content.includes(`Continue from:\n${routes[index]}\n`));
    assert.equal(projected.fallbackTransportText.normalEmission, false);
  }
  const collision = projectHandoffHumanOutput({ projection: built.carrierProjection, route: routes[0], collisionInstance: 2 });
  assert.equal(collision.primary.filename, 'tiinex-shared-fixture-001-anchor-to-loom--2.handoff-package.zip');
  assert.equal(collision.selectedRoute.dimension, '001', 'collision suffix must not mutate dimensional lineage');

  const zip = portableRuntimePackageZipBuffer(built.bundle);
  const zipSha = createHash('sha256').update(zip).digest('hex');
  for (const route of routes) {
    const regenerated = projectHandoffCarrierOutputFromPackage({ files: built.bundle.files, route });
    assert.equal(regenerated.status, 'ready');
    assert.equal(regenerated.humanOutput.primary.workspaceRelativeHandoffPath, route);
    assert.equal(regenerated.humanOutput.normalInlineRouting.content, regenerated.humanOutput.fallbackTransportText.content);
    assert.equal(regenerated.humanOutput.normalInlineRouting.normalEmission, true);
    assert.equal(createHash('sha256').update(portableRuntimePackageZipBuffer(built.bundle)).digest('hex'), zipSha, 'route selection must not mutate shared carrier bytes');
  }

  const reversedInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'shared-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: routes[0],
    handoffRoutes: [...routes].reverse(),
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const reversed = buildRecipientRelativeHandoffTransportPackage(reversedInput, { packageInput: { builtAt: '2026-08-23T13:00:00.000Z' } });
  assert.deepEqual(reversed.carrierProjection.routes, built.carrierProjection.routes, 'shared carrier route order must not alter deterministic route projection');

  await assert.rejects(
    () => prepareNodeHandoffManufacturingInput({
      workspaceRoot,
      workspaceId: 'shared-fixture',
      workspaceTargetPath: 'workspace.workspace.md',
      handoffPath: routes[0],
      handoffRoutes: [...routes, '.topics/handoff/004-anchor-to-missing.trace.md'],
      toolingBootstrap: 'embedded',
      runtimeRoot
    }),
    (error) => error?.code === 'ENOENT',
    'missing advertised Handoff routes must fail closed during deterministic input preparation'
  );

  const missingRequiredRoot = path.join(root, 'missing-secondary-required');
  await makeWorkspace(missingRequiredRoot);
  await writeFile(path.join(missingRequiredRoot, '.topics', 'handoff', '004-anchor-to-axiom.trace.md'), handoffMarkdownWithMissingSecondaryRequired('Axiom'), 'utf8');
  await writeFile(path.join(missingRequiredRoot, '.topics', 'handoff', '004-anchor-to-kodax.trace.md'), handoffMarkdownWithMissingReference('Kodax'), 'utf8');
  const missingRequiredInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: missingRequiredRoot,
    workspaceId: 'shared-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: routes[0],
    handoffRoutes: routes,
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const missingRequired = buildRecipientRelativeHandoffTransportPackage(missingRequiredInput, { packageInput: { builtAt: '2026-08-23T13:00:00.000Z' } });
  assert.equal(missingRequired.status, 'blocked', 'shared carrier must fail closed when a secondary route Required Context byte is absent');
  const missingAxiom = missingRequired.carrierProjection.routes.find((route) => route.workspaceRelativePath === routes[1]);
  const referenceOnlyKodax = missingRequired.carrierProjection.routes.find((route) => route.workspaceRelativePath === routes[2]);
  assert.equal(missingAxiom.requiredClosure.state, 'blocked');
  assert(missingAxiom.reasons.includes('required-context-closure-unqualified'));
  assert(missingAxiom.requiredClosure.requirements.some((entry) => entry.reasons.includes('required-workspace-entry-missing')));
  assert.equal(referenceOnlyKodax.requiredClosure.state, 'qualified', 'missing Reference Context must remain non-blocking');

  await writeFile(path.join(missingRequiredRoot, '.topics', 'handoff', 'missing.trace.md'), '# Required secondary material\n', 'utf8');
  const correctedInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: missingRequiredRoot,
    workspaceId: 'shared-fixture',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: routes[0],
    handoffRoutes: routes,
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const corrected = buildRecipientRelativeHandoffTransportPackage(correctedInput, { packageInput: { builtAt: '2026-08-23T13:00:00.000Z' } });
  assert.equal(corrected.status, 'ready', 'shared carrier should become ready once the secondary route required byte is carried');
  assert(corrected.carrierProjection.routes.every((route) => route.requiredClosure.state === 'qualified'));

  const carrierFile = built.bundle.files.find((file) => file.path === 'tiinex.package/handoff-carrier.json');
  const tamperedProjection = JSON.parse(String(carrierFile.content || ''));
  tamperedProjection.routes[0].projectedFilename = 'filename-is-not-authority.handoff-package.zip';
  const tamperedFile = { ...carrierFile, data: new TextEncoder().encode(`${JSON.stringify(tamperedProjection, null, 2)}\n`) };
  const tamperedBundle = { ...built.bundle, files: built.bundle.files.map((file) => file.path === carrierFile.path ? tamperedFile : file) };
  const tamperedInspection = inspectHandoffCarrierProjection(tamperedBundle);
  assert.equal(tamperedInspection.status, 'invalid');
  assert(tamperedInspection.findings.some((finding) => finding.code === 'portable.handoff-carrier.routes.mismatch'));

  const cliDir = path.join(root, 'out');
  const cliLines = [];
  const code = await runPortableCli([
    'manufacture-handoff-package', workspaceRoot,
    '--handoff', routes[0],
    '--handoff-routes', routes.join(','),
    '--route', routes[2],
    '--workspace-id', 'shared-fixture',
    '--workspace-target', 'workspace.workspace.md',
    '--legacy-recipient-v2-compatibility',
    '--output-dir', cliDir,
    '--transport-text',
    '--built-at', '2026-08-23T13:00:00.000Z',
    '--compact'
  ], { log: (value) => cliLines.push(value), error: (value) => cliLines.push(value) }, { runtimeRoot });
  assert.equal(code, 0);
  const cli = JSON.parse(cliLines.at(-1));
  assert.equal(cli.status, 'ready');
  assert.equal(cli.carrierProjection.mode, 'shared');
  assert.equal(cli.primaryOutput.projectedFilename, 'tiinex-shared-fixture-001-anchor-to-kodax.handoff-package.zip');
  assert.equal(path.basename(cli.primaryOutput.path), cli.primaryOutput.projectedFilename);
  assert.equal(cli.transportTextSidecar.status, 'written');
  assert.equal(await readFile(cli.transportTextSidecar.path, 'utf8'), `Handoff package attached.\n\nCold start: read Start directly; do not list or extract this package.\n\nStart:\n001-1-READ-BEFORE-PROCEEDING.trace.md\nContinue from (do not read native; pass to Tiinex after bootstrap):\n001-3-2-handoff-pointer.trace.md\n`);
  assert(Buffer.byteLength(cliLines.at(-1), 'utf8') < 60_000, 'shared-carrier CLI receipt must remain bounded and not serialize package bytes');

  const leakedNameLines = [];
  const leakedNamePath = path.join(cliDir, 'warm-recipient.handoff-package.zip');
  const leakedNameCode = await runPortableCli([
    'manufacture-handoff-package', workspaceRoot,
    '--handoff', routes[0],
    '--handoff-routes', routes.join(','),
    '--route', routes[0],
    '--workspace-id', 'shared-fixture',
    '--workspace-target', 'workspace.workspace.md',
    '--legacy-recipient-v2-compatibility',
    '--output', leakedNamePath,
    '--built-at', '2026-08-23T13:00:00.000Z',
    '--compact'
  ], { log: (value) => leakedNameLines.push(value), error: (value) => leakedNameLines.push(value) }, { runtimeRoot });
  assert.equal(leakedNameCode, 1, 'Handoff manufacture must fail closed when caller-supplied basename diverges from Tooling projection');
  assert.equal(JSON.parse(leakedNameLines.at(-1)).error, 'portable.cli.handoff-carrier.output-filename.mismatch');

  const exactNameLines = [];
  const exactNamePath = path.join(cliDir, 'tiinex-shared-fixture-001-anchor-to-loom.handoff-package.zip');
  const exactNameCode = await runPortableCli([
    'manufacture-handoff-package', workspaceRoot,
    '--handoff', routes[0],
    '--handoff-routes', routes.join(','),
    '--route', routes[0],
    '--workspace-id', 'shared-fixture',
    '--workspace-target', 'workspace.workspace.md',
    '--legacy-recipient-v2-compatibility',
    '--output', exactNamePath,
    '--built-at', '2026-08-23T13:00:00.000Z',
    '--compact'
  ], { log: (value) => exactNameLines.push(value), error: (value) => exactNameLines.push(value) }, { runtimeRoot });
  assert.equal(exactNameCode, 0, 'exact Tooling-projected basename remains a valid explicit output path');
  assert.equal(path.basename(JSON.parse(exactNameLines.at(-1)).primaryOutput.path), 'tiinex-shared-fixture-001-anchor-to-loom.handoff-package.zip');

  const selectionLines = [];
  const projectionCode = await runPortableCli([
    'project-handoff-carrier-output', cli.primaryOutput.path,
    '--route', routes[1],
    '--collision-instance', '3',
    '--compact'
  ], { log: (value) => selectionLines.push(value), error: (value) => selectionLines.push(value) });
  assert.equal(projectionCode, 0);
  const projected = JSON.parse(selectionLines.at(-1));
  assert.equal(projected.status, 'ready');
  assert.equal(projected.humanOutput.primary.filename, 'shared-fixture-001-anchor-to-axiom--3.handoff-package.zip');
  assert.equal(projected.humanOutput.normalInlineRouting.content, `Handoff package attached.

Cold start: read Start directly; do not list or extract this package.

Start:
001-1-READ-BEFORE-PROCEEDING.trace.md
Continue from (do not read native; pass to Tiinex after bootstrap):
001-3-1-handoff-pointer.trace.md
`);
  assert.equal(projected.humanOutput.normalInlineRouting.content, projected.humanOutput.fallbackTransportText.content);
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics', 'handoff'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), '{"name":"tiinex-shared-fixture","type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown(), 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'shared-context.md'), '# Shared context\n\nExact common byte.\n', 'utf8');
  await writeFile(path.join(rootPath, 'common.txt'), 'one immutable workspace carrier\n', 'utf8');
  for (const [to, filename] of [['Loom', '004-anchor-to-loom.trace.md'], ['Axiom', '004-anchor-to-axiom.trace.md'], ['Kodax', '004-anchor-to-kodax.trace.md']]) {
    await writeFile(path.join(rootPath, '.topics', 'handoff', filename), handoffMarkdown(to), 'utf8');
  }
}
function workspaceMarkdown() {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-08-23 12:59:00
  - Authors: Fixture
  - Why: Qualify the exact Workspace carried by the shared carrier regression.
  - Summary: Shared carrier fixture Workspace.
  - Status: active/local

---

# Shared Carrier Fixture Workspace

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
function handoffMarkdown(to) {
  return qualifiedHandoffFixture({
    title: `Shared ${to} handoff`,
    to,
    purpose: 'shared-carrier fixture',
    createdAt: '2026-08-23 13:00:00',
    requiredContext: `- shared-context
  - Material: exact shared context
  - Material Reference: [Shared context](../shared-context.md)
  - Purpose: prove common-byte reuse
  - Availability: available`
  });
}
function handoffMarkdownWithMissingSecondaryRequired(to) {
  return qualifiedHandoffFixture({
    title: `Shared ${to} handoff`,
    to,
    purpose: 'shared-carrier fixture',
    createdAt: '2026-08-23 13:00:00',
    requiredContext: `- shared-context
  - Material: exact shared context
  - Material Reference: [Missing secondary material](missing.trace.md)
  - Purpose: prove common-byte reuse
  - Availability: available`
  });
}
function handoffMarkdownWithMissingReference(to) {
  return qualifiedHandoffFixture({
    title: `Shared ${to} handoff`,
    to,
    purpose: 'shared-carrier fixture',
    createdAt: '2026-08-23 13:00:00',
    requiredContext: `- shared-context
  - Material: exact shared context
  - Material Reference: [Shared context](../shared-context.md)
  - Purpose: prove common-byte reuse
  - Availability: available`,
    referenceContext: `- optional-missing
  - Material: optional missing material
  - Material Reference: [Optional missing](missing-reference.trace.md)
  - Purpose: prove Reference Context remains non-blocking
  - Availability: unavailable`
  });
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

console.log('✓ Tooling 012 carrier naming, shared-route fan-out, collision hygiene, and human-output fallback pressure passed');
