import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildRecipientRelativeHandoffTransportPackage } from './materialClosure.package.js';
import { inspectHandoffColdConsumerEntrypoint, orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import { projectHandoffHumanOutput } from './carrierProjection.js';
import { portableRuntimePackageZipBuffer } from '../output/node.zip.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';

const encoder = new TextEncoder();
const primaryPath = '.topics/handoff/005-anchor-to-loom.trace.md';
const secondaryPath = '.topics/handoff/006-anchor-to-axiom.trace.md';
const primaryMarkdown = handoffMarkdown('Anchor', 'Loom');
const secondaryMarkdown = handoffMarkdown('Anchor', 'Axiom');

const built = buildRecipientRelativeHandoffTransportPackage({
  workspace: { id: 'alpha', title: 'Tiinex Alpha', name: 'Tiinex Alpha', records: [], assets: [] },
  handoff: { id: primaryPath, path: primaryPath, semanticStatus: 'unknown', markdown: primaryMarkdown },
  workspaceMaterializations: [
    workspaceMaterialization('alpha', 'Tiinex Alpha', primaryPath, primaryMarkdown),
    workspaceMaterialization('beta', 'Tiinex Beta', secondaryPath, secondaryMarkdown)
  ],
  materials: [],
  recipient: { referenceTargets: [] },
  transportRoutes: [
    { workspaceId: 'alpha', path: primaryPath },
    { workspaceId: 'beta', path: secondaryPath }
  ],
  verifyRoundtrip: false
}, { packageInput: { builtAt: '2026-08-23T17:00:00.000Z' } });

assert.equal(built.status, 'ready');
assert.equal(built.carrierProjection.status, 'ready');
assert.deepEqual(built.carrierProjection.workspaces.map((workspace) => workspace.id), ['alpha', 'beta']);
assert.deepEqual(built.carrierProjection.routes.map((route) => [route.workspaceId, route.workspaceRelativePath]), [
  ['alpha', primaryPath],
  ['beta', secondaryPath]
]);
assert.equal(built.carrierProjection.routes[0].projectedFilename, 'tiinex-alpha-005-anchor-to-loom.handoff-package.zip');
assert.equal(built.carrierProjection.routes[1].projectedFilename, 'tiinex-beta-006-anchor-to-axiom.handoff-package.zip');

const startFile = built.bundle.files.find((file) => file.path === 'tiinex.package/START.md');
assert(startFile, 'manufactured package must contain the maintained cold-consumer START entrypoint');
assert.equal(built.coldConsumerEntrypointInspection.status, 'valid');
assert.equal(built.coldConsumerProjection.workspaces.length, 2);
assert.equal(built.coldConsumerProjection.selection.policy, 'explicit-qualified-route-required');
assert.equal(built.coldConsumerProjection.selection.implicitRouteId, '');

const cold = orientColdConsumerFromHandoffPackage(built.bundle);
assert.equal(cold.status, 'ready');
assert.deepEqual(cold.routes.map((route) => route.workspaceId), ['alpha', 'beta']);

const secondaryHuman = projectHandoffHumanOutput({ projection: built.carrierProjection, route: built.carrierProjection.routes[1].id });
assert.equal(secondaryHuman.status, 'ready');
assert.equal(secondaryHuman.primary.workspaceId, 'beta');
assert.equal(secondaryHuman.primary.filename, 'tiinex-beta-006-anchor-to-axiom.handoff-package.zip');
assert.match(secondaryHuman.fallbackTransportText.content, /Workspace: Tiinex Beta/);
assert.match(secondaryHuman.fallbackTransportText.content, new RegExp(escapeRegExp(secondaryPath)));

const tamperedStart = String(startFile.content || '').replace('"workspaceId": "beta"', '"workspaceId": "alpha"');
const tamperedBundle = {
  ...built.bundle,
  files: built.bundle.files.map((file) => file.path === startFile.path ? { ...file, data: encoder.encode(tamperedStart), content: undefined } : file)
};
const tamperedInspection = inspectHandoffColdConsumerEntrypoint(tamperedBundle);
assert.equal(tamperedInspection.status, 'invalid');
assert(tamperedInspection.findings.some((finding) => finding.code === 'portable.handoff-start.routes.mismatch'));

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-handoff-cold-consumer-'));
try {
  const zipPath = path.join(root, 'multi-workspace.handoff-package.zip');
  await writeFile(zipPath, portableRuntimePackageZipBuffer(built.bundle));
  const lines = [];
  const code = await runPortableCli(['orient-handoff-package', zipPath, '--compact'], { log: (value) => lines.push(value), error: (value) => lines.push(value) });
  assert.equal(code, 0);
  const cli = JSON.parse(lines.at(-1));
  assert.equal(cli.status, 'ready');
  assert.equal(cli.entrypoint.status, 'valid');
  assert.deepEqual(cli.workspaces.map((workspace) => workspace.id), ['alpha', 'beta']);
  assert.equal(cli.routes[1].workspaceRelativeHandoffPath, secondaryPath);
} finally {
  await rm(root, { recursive: true, force: true });
}

function workspaceMaterialization(id, title, handoffPath, markdown) {
  return {
    id,
    title,
    state: 'complete',
    source: { kind: 'fixture', workspaceId: id },
    completenessEvidence: { state: 'qualified', proof: 'bounded-multi-workspace-fixture', boundary: '.' },
    entries: [{ path: handoffPath, data: encoder.encode(markdown), mediaType: 'text/markdown' }]
  };
}

function handoffMarkdown(from, to) {
  return `# Continuity Context\n\n- Current\n  - Current Schema: tiinex.handoff.v1\n  - Created At: 2026-08-23 17:00:00\n\n---\n\n# Multi-workspace ${to} handoff\n\n## Handoff Parties\n\n- Purpose: Tooling 013 multi-workspace fixture\n- From: ${from}\n- From Kind: role\n- To: ${to}\n- To Kind: role\n\n# Continuity Integrity\n`;
}
function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

console.log('✓ Tooling 013 cold-consumer START correlation and multi-workspace route projection pressure passed');
