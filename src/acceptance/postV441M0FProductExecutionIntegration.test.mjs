import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildWorkspaceExportPlan } from '../export/export.plan.js';
import { exportPackageZipUint8Array, exportTreeZipUint8Array } from '../export/package.zip.js';
import { buildWorkspaceTreeExportBundle } from '../export/tree.bundle.js';
import { tryReadOperationalHandoffPackage } from '../app/handoffPackageImportCommand.js';
import { executeWorkspaceHandoffExportCommand } from '../app/workspaceHandoffExport.js';
import { buildPublicationPlan } from '../publication/publication.contract.js';

const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-19T12:00:00.000Z\n  - Summary: Local draft\n\n---\n\n# Local draft\n\nBody\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
const workspaceMarkdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.workspace.v1\n  - Created At: 2026-08-19T12:00:00.000Z\n  - Summary: Handoff product\n\n---\n\n# Handoff product\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
const workspace = {
  id: 'w-v441', title: 'v441 Handoff', workspaceMarkdown,
  workspaceImport: { sourceMode: 'local-manual', boundary: 'browser-local', localDraft: true, path: 'v441.workspace.md' },
  records: [
    { id: 'local-a', title: 'Local A', path: 'local/a.trace.md', markdown, sourceMode: 'local-transition', source: { adapterId: 'local' } },
    { id: 'source-a', title: 'Source A', path: '.topics/source.trace.md', markdown, sourceMode: 'source-backed', source: { id: 'github:docs', adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'a'.repeat(40), sourceBacked: true }, sourceTarget: { targetKind: 'github-repo-file', sourceArtifactPath: '.topics/source.trace.md', materializedCommit: 'a'.repeat(40) } }
  ],
  assets: [{ id: 'bin', path: 'assets/raw.bin', type: 'application/octet-stream', bytes: new Uint8Array([0, 1, 127, 128, 255]), source: { adapterId: 'local' } }],
  sources: [{ id: 'local', adapterId: 'local' }, { id: 'github:docs', label: 'Docs', adapterId: 'github', sourceKind: 'github.repo', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'a'.repeat(40), rootPath: '.topics' }],
  sourceOrder: ['local', 'github:docs']
};

const treePlan = buildWorkspaceExportPlan(workspace, { exportType: 'tree', clock: () => '2026-08-19T12:01:00.000Z' });
assert.equal(treePlan.execution.action, 'download-tree-zip');
assert.equal(treePlan.packageEnvelope, false);
assert.equal(Object.prototype.hasOwnProperty.call(treePlan, 'handoffPreparation'), false, 'ordinary/default Tree plan owns no package preparation snapshot');
assert.equal(treePlan.exportTypes.find((item) => item.id === 'handoff-package')?.status, 'available', 'Handoff stays discoverable as explicit opt-in');

const handoffPlan = buildWorkspaceExportPlan(workspace, { exportType: 'handoff-package', clock: () => '2026-08-19T12:01:00.000Z' });
assert.equal(handoffPlan.execution.action, 'download-handoff-package');
assert.equal(handoffPlan.execution.available, true);
assert.equal(Object.prototype.hasOwnProperty.call(handoffPlan, 'handoffInspection'), false, 'selected read-model owns no exact inspection');
const handoffExecution = executeWorkspaceHandoffExportCommand({ workspace, exportPlan: handoffPlan, clock: () => '2026-08-19T12:01:00.000Z', download(_workspace, _doc, _win, preparation) { return { filename: 'v441-handoff.zip', bundle: preparation.bundle }; } });
assert.equal(handoffExecution.ok, true);
assert.equal(handoffExecution.bundle.files.some((entry) => entry.kind === 'source-reference'), true, 'source-backed material remains reference-only in the execution-built package');

const packageZip = exportPackageZipUint8Array(handoffExecution.bundle);
const read = await tryReadOperationalHandoffPackage([zipFile('tiinex-handoff-v441.zip', packageZip)]);
assert.equal(read.detected, true);
assert.equal(read.ok, true);
assert.equal(read.rehydrated.inspection.status, 'valid');
assert.equal(read.importPlan.records.length, 1, 'only package-owned local record rehydrates as a record');
assert.equal(read.importPlan.sourceReferences.length, 1, 'source-backed record rehydrates as a source reference');
assert.deepEqual([...read.importPlan.assets[0].bytes], [0, 1, 127, 128, 255], 'binary package bytes survive exact rehydration');

const treeZip = exportTreeZipUint8Array(buildWorkspaceTreeExportBundle(workspace, { clock: () => '2026-08-19T12:02:00.000Z' }));
const ordinary = await tryReadOperationalHandoffPackage([zipFile('tree.zip', treeZip)]);
assert.equal(ordinary.detected, false, 'ordinary Tree ZIP must not be reinterpreted as an operational package');

const issueCommentTarget = buildPublicationPlan(workspace, {
  recordId: 'local-a',
  mutationPolicy: 'create-comment',
  destination: {
    provider: 'github', repository: 'Tiinex/docs', ref: 'main',
    externalTarget: 'https://github.com/Tiinex/docs/issues/1#issuecomment-1',
    targetKind: 'github-issue-comment'
  }
});
assert.equal(issueCommentTarget.status, 'blocked', 'v443 supersedes the old repo-file-only boundary: create-comment now fails only because this historical fixture omits its exact parent issue container.');
assert.equal(issueCommentTarget.findings.some((finding) => finding.code === 'publication.plan.destination.path-missing'), false, 'issue/comment publication must not be forced through repo-file path authority');
assert.equal(issueCommentTarget.findings.some((finding) => finding.code === 'publication.plan.destination.container-target-missing'), true, 'create-comment remains fail-closed without exact parent issue intent');

const exportSource = fs.readFileSync(new URL('../export/export.plan.js', import.meta.url), 'utf8');
const dialogController = fs.readFileSync(new URL('../schemas/workspace/workspace.exportDialog.controller.jsx', import.meta.url), 'utf8');
assert.doesNotMatch(exportSource, /prepareWorkspaceHandoffExport|buildExportPackageBundle|inspectExportPackageBundle/, 'render/read-model plan must not build or inspect Handoff packages');
assert.match(dialogController, /useState\(ExportType\.tree\)/, 'ordinary Tree remains product-default');
assert.match(dialogController, /buildWorkspaceExportPlan\(workspace, \{ exportType \}\)/, 'controller only projects cheap export selection state');

console.log('post-v441 M0-F product execution integration: PASS');

function zipFile(name, bytes) {
  return { name, size: bytes.byteLength, type: 'application/zip', async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
}
