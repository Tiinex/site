import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { portableRuntimePackageZipBuffer } from '../output/node.zip.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { auditHandoffPackageContextCarriage } from './contextAudit.js';
import { packageFileBytes } from '../../../export/package.bytes.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-context-audit-'));
try {
  const workspaceRoot = path.join(root, 'workspace');
  const runtimeRoot = path.join(root, 'runtime');
  await makeWorkspace(workspaceRoot);
  await makeRuntime(runtimeRoot);
  const baseInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'site',
    handoffPath: '.topics/handoff/017-anchor-to-loom.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const detached = Object.freeze({ path: 'transport/detached.bin', kind: 'handoff-transport-material', logicalKind: 'recipient-relative-transport-material', data: Uint8Array.from([9, 0, 255, 7]) });
  const fullInput = Object.freeze({ ...baseInput, additionalTransportFiles: Object.freeze([...(baseInput.additionalTransportFiles || []), detached]) });
  const full = manufactureRecipientRelativeHandoffPackage(fullInput, { packageInput: { builtAt: '2026-08-23T19:00:00.000Z' } });
  assert.equal(full.status, 'ready');
  const fullAudit = auditHandoffPackageContextCarriage(full.bundle);
  assert.equal(fullAudit.status, 'ready');
  assert.equal(fullAudit.coverage.state, 'qualified');
  assert.equal(fullAudit.unexplainedCarriers.length, 0);
  assert.equal(fullAudit.workspaceMaterializations.length, 1);
  assert.equal(fullAudit.workspaceMaterializations[0].reason, 'complete-workspace-materialization');
  assert(fullAudit.workspaceMaterializations[0].routeGrounding.some((item) => item.role === 'controlling-handoff'));
  assert(fullAudit.workspaceMaterializations[0].routeGrounding.some((item) => item.role === 'required-context'));
  assert.equal(fullAudit.workspaceMaterializations[0].routeGrounding.some((item) => /prior-handoff|decision/.test(item.workspaceRelativePath)), false, 'unrelated workspace extras must not be promoted into Handoff context');
  assert.equal(fullAudit.explicitDetachedMaterial.length, 1);
  assert.equal(fullAudit.explicitDetachedMaterial[0].path, 'transport/detached.bin');
  assert.equal(fullAudit.explicitDetachedMaterial[0].bytes, 4);
  assert.equal(fullAudit.materialCarriers.length, 1);
  const material = fullAudit.materialCarriers[0];
  assert.equal(material.requirement.id, 'required:required-context');
  assert.equal(material.requirement.name, 'required-context');
  assert.equal(material.requirement.referenceTarget, 'required-context.bin');
  assert.equal(material.bytes, 6);
  assert.equal(material.actualBytes, 6);
  assert.equal(material.identicalWorkspaceBytes.length, 1, 'duplicate requirement/workspace bytes must be visible');
  assert.equal(fullAudit.duplicateByteSummary.materialCarriersAlsoPresentInWorkspace, 1);

  const complete = baseInput.workspaceMaterializations[0];
  const keep = new Set(['.topics/handoff/017-anchor-to-loom.trace.md', '.topics/handoff/required-context.bin']);
  const partialEntries = complete.entries.filter((entry) => keep.has(entry.path));
  const partialIncluded = complete.includedEntries.filter((entry) => keep.has(entry.path));
  const partialWorkspace = Object.freeze({ ...complete, state: 'partial', completenessEvidence: Object.freeze({}), entries: Object.freeze(partialEntries), includedEntries: Object.freeze(partialIncluded) });
  const minimalInput = Object.freeze({ ...baseInput, workspaceMaterializations: Object.freeze([partialWorkspace]) });
  const minimal = manufactureRecipientRelativeHandoffPackage(minimalInput, { packageInput: { builtAt: '2026-08-23T19:00:00.000Z' } });
  assert.equal(minimal.status, 'ready');
  const minimalAudit = auditHandoffPackageContextCarriage(minimal.bundle);
  assert.equal(minimalAudit.status, 'ready');
  assert.equal(minimalAudit.workspaceMaterializations[0].reason, 'partial-workspace-materialization');
  assert(minimalAudit.workspaceMaterializations[0].entryCount < fullAudit.workspaceMaterializations[0].entryCount);
  assert(minimalAudit.workspaceMaterializations[0].totalBytes < fullAudit.workspaceMaterializations[0].totalBytes);
  assert.equal(minimalAudit.materialCarriers[0].requirement.name, 'required-context');

  const mysteryBundle = { ...full.bundle, files: [...full.bundle.files, { path: 'mystery.bin', data: Uint8Array.from([1, 2, 3]) }] };
  const mysteryAudit = auditHandoffPackageContextCarriage(mysteryBundle);
  assert.equal(mysteryAudit.status, 'blocked');
  assert(mysteryAudit.findings.some((item) => item.code === 'portable.handoff-context.carrier.unexplained'));

  const materialFile = full.bundle.files.find((file) => String(file.path || '').startsWith('handoff.material/'));
  const wrongBytesBundle = replaceFile(full.bundle, materialFile.path, Uint8Array.from([1, 1, 1, 1, 1, 1]));
  const wrongBytesAudit = auditHandoffPackageContextCarriage(wrongBytesBundle);
  assert.equal(wrongBytesAudit.status, 'blocked');
  assert(wrongBytesAudit.findings.some((item) => String(item.code || '').includes('handoff-closure') || String(item.code || '').includes('material')));

  const descriptorFile = full.bundle.files.find((file) => file.path === 'tiinex.package/handoff-closure.json');
  const descriptor = JSON.parse(new TextDecoder().decode(packageFileBytes(descriptorFile)));
  descriptor.materialized[0].sha256 = '0'.repeat(64);
  const staleDescriptorBundle = replaceFile(full.bundle, descriptorFile.path, new TextEncoder().encode(`${JSON.stringify(descriptor, null, 2)}\n`));
  const staleAudit = auditHandoffPackageContextCarriage(staleDescriptorBundle);
  assert.equal(staleAudit.status, 'blocked');

  const zipPath = path.join(root, 'context-audit.zip');
  await writeFile(zipPath, portableRuntimePackageZipBuffer(full.bundle));
  const lines = [];
  const code = await runPortableCli(['audit-handoff-package-context', zipPath, '--compact'], { log: (value) => lines.push(value), error: (value) => lines.push(value) });
  assert.equal(code, 0);
  const cli = JSON.parse(lines.at(-1));
  assert.equal(cli.status, 'ready');
  assert.equal(cli.coverage.state, 'qualified');
  assert.equal(cli.explicitDetachedMaterial[0].bytes, 4, 'binary detached bytes must survive ZIP input audit');
  assert(Buffer.byteLength(lines.at(-1), 'utf8') < 80_000, 'context audit CLI output must stay bounded');
} finally {
  await rm(root, { recursive: true, force: true });
}

function replaceFile(bundle, targetPath, data) {
  return { ...bundle, files: bundle.files.map((file) => file.path === targetPath ? { ...file, content: undefined, data } : file) };
}
async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics', 'handoff'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), '{"name":"tiinex-site-context-fixture","type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'handoff', 'required-context.bin'), Uint8Array.from([4, 5, 6, 7, 8, 9]));
  await writeFile(path.join(rootPath, '.topics', 'handoff', '016-prior-handoff.trace.md'), '# Prior unrelated handoff\n', 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'handoff', 'decision.trace.md'), '# Unrelated decision\n', 'utf8');
  await writeFile(path.join(rootPath, 'notes.md'), '# Workspace extra\n', 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'handoff', '017-anchor-to-loom.trace.md'), handoffMarkdown(), 'utf8');
}
function handoffMarkdown() {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-08-23 19:00:00\n\n---\n\n# Context audit fixture\n\n## Handoff Parties\n\n- Purpose: recipient-context audit fixture\n- From: Anchor\n- From Kind: role\n- To: Loom\n- To Kind: role\n\n## Required Context\n\n- required-context\n  - Material: exact required binary\n  - Material Reference: [Required binary](required-context.bin)\n  - Purpose: explicit route grounding\n  - Availability: available\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: fixture\n`;
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

console.log('✓ Tooling 017 recipient-context carriage audit, duplicate-byte visibility, minimal/full comparison, and adversarial pressure passed');
