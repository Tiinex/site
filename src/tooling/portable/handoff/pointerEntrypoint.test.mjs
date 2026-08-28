import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { buildRecipientRelativeHandoffTransportPackage } from './materialClosure.package.js';
import { inspectHandoffPointerEntrypoints, isHandoffPointerEntrypointPath, CANONICAL_POINTER_SCHEMA_TARGET } from './pointerEntrypoint.js';
import { orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-pointer-entrypoint-'));
try {
  const workspaceRoot = path.join(root, 'workspace');
  const runtimeRoot = path.join(root, 'runtime');
  await makeWorkspace(workspaceRoot);
  await makeRuntime(runtimeRoot);
  const routes = ['.topics/handoff/016-anchor-to-loom.trace.md', '.topics/handoff/016-anchor-to-axiom.trace.md'];
  const input = await prepareNodeHandoffManufacturingInput({ workspaceRoot, workspaceId: 'site', workspaceTargetPath: 'workspace.workspace.md', handoffPath: routes[0], handoffRoutes: routes, toolingBootstrap: 'embedded', runtimeRoot });
  const built = buildRecipientRelativeHandoffTransportPackage(input, { packageInput: { builtAt: '2026-08-23T18:30:00.000Z' } });
  assert.equal(built.status, 'ready');
  assert.equal(built.pointerEntrypointInspection.status, 'valid');
  assert.equal(built.pointerEntrypointProjection.entries.length, 2);
  const pointers = built.bundle.files.filter((file) => isHandoffPointerEntrypointPath(file.path));
  assert.equal(pointers.length, 2);
  assert(built.bundle.files.some((file) => file.path === 'tiinex.package/START.md'), 'START must remain during Pointer migration');
  assert.equal(orientColdConsumerFromHandoffPackage(built.bundle).status, 'ready');
  for (const file of pointers) {
    const markdown = new TextDecoder().decode(packageFileBytes(file));
    assert(markdown.includes(`[tiinex.pointer.v1](${CANONICAL_POINTER_SCHEMA_TARGET})`));
    assert.equal(/^\s*-\s+Parent\b/m.test(markdown), false, 'generated route pointers must not mint Parent continuity');
    assert.equal((markdown.match(/^##\s+Destinations\s*$/gm) || []).length, 1);
    assert.equal(canonicalC14nV2SelfState(markdown).state, 'verified');
  }

  const firstPointer = pointers[0];
  const secondPointer = pointers[1];
  const firstText = new TextDecoder().decode(packageFileBytes(firstPointer));
  const secondTarget = built.pointerEntrypointProjection.entries.find((entry) => entry.path === secondPointer.path).targetPackagePath;

  const unsealedTamper = replaceFile(built.bundle, firstPointer.path, `${firstText}\nTampered without reseal.\n`);
  const unsealedInspection = inspectHandoffPointerEntrypoints(unsealedTamper);
  assert.equal(unsealedInspection.status, 'invalid');
  assert(unsealedInspection.findings.some((item) => item.code === 'portable.handoff-pointer.integrity.invalid'));

  const currentTarget = built.pointerEntrypointProjection.entries.find((entry) => entry.path === firstPointer.path).targetPackagePath;
  const staleQualifiedText = reseal(firstText.replace(`](${currentTarget})`, `](${secondTarget})`));
  const staleQualifiedInspection = inspectHandoffPointerEntrypoints(replaceFile(built.bundle, firstPointer.path, staleQualifiedText));
  assert.equal(staleQualifiedInspection.status, 'invalid');
  assert(staleQualifiedInspection.findings.some((item) => item.code === 'portable.handoff-pointer.projection.mismatch'));

  const missingTarget = 'handoff.workspaces/site/.topics/handoff/016-anchor-to-missing.trace.md';
  const unqualifiedText = reseal(firstText.replace(`](${currentTarget})`, `](${missingTarget})`));
  const unqualifiedInspection = inspectHandoffPointerEntrypoints(replaceFile(built.bundle, firstPointer.path, unqualifiedText));
  assert.equal(unqualifiedInspection.status, 'invalid');
  assert(unqualifiedInspection.findings.some((item) => item.code === 'portable.handoff-pointer.target.unqualified-route'));

  const duplicateInspection = inspectHandoffPointerEntrypoints({ ...built.bundle, files: [...built.bundle.files, firstPointer] });
  assert.equal(duplicateInspection.status, 'invalid');
  assert(duplicateInspection.findings.some((item) => item.code === 'portable.handoff-pointer.duplicate-path'));

  const noPointers = { ...built.bundle, files: built.bundle.files.filter((file) => !isHandoffPointerEntrypointPath(file.path)) };
  assert.equal(inspectHandoffPointerEntrypoints(noPointers).status, 'invalid');
  assert.equal(orientColdConsumerFromHandoffPackage(noPointers).status, 'blocked', 'cold orientation must fail closed when route Pointer projection is missing');
} finally {
  await rm(root, { recursive: true, force: true });
}

function replaceFile(bundle, targetPath, content) {
  return { ...bundle, files: bundle.files.map((file) => file.path === targetPath ? { ...file, content, data: new TextEncoder().encode(content) } : file) };
}
function reseal(markdown) {
  const sealed = sealC14nV2Self(markdown);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics', 'handoff'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), '{"name":"tiinex-site-pointer-fixture","type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown(), 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'context.md'), '# Context\n', 'utf8');
  for (const [filename, to] of [['016-anchor-to-loom.trace.md', 'Loom'], ['016-anchor-to-axiom.trace.md', 'Axiom']]) await writeFile(path.join(rootPath, '.topics', 'handoff', filename), handoffMarkdown(to), 'utf8');
}
function workspaceMarkdown() {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-08-23 18:29:00
  - Authors: Fixture
  - Why: Qualify the exact Workspace carried by the Pointer entrypoint regression.
  - Summary: Pointer entrypoint fixture Workspace.
  - Status: active/local

---

# Pointer Entrypoint Fixture Workspace

Bounded fixture Workspace.

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: `;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
function handoffMarkdown(to) {
  return qualifiedHandoffFixture({
    title: `Pointer fixture ${to}`,
    to,
    purpose: 'pointer fixture',
    createdAt: '2026-08-23 18:30:00',
    requiredContext: `- context
  - Material: exact context
  - Material Reference: [Context](../context.md)
  - Purpose: fixture
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

console.log('✓ Tooling 016 canonical Pointer entrypoint generation and adversarial verification passed');
