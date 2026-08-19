import assert from 'node:assert/strict';
import { buildWorkspaceExportPlan } from '../export/export.plan.js';
import { executeWorkspaceExportCommand } from './workspaceExportExecutionCommand.js';
import { exportWorkspaceHandoffDownload } from './workspaceHandoffExport.js';

const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-19T12:00:00.000Z\n  - Summary: Draft\n\n---\n\n# Draft\n\nBody\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
const workspaceMarkdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.workspace.v1\n  - Created At: 2026-08-19T12:00:00.000Z\n  - Summary: Handoff\n\n---\n\n# Handoff\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
const workspace = {
  id: 'w-handoff', title: 'Handoff Test', workspaceMarkdown,
  workspaceImport: { sourceMode: 'local-manual', boundary: 'browser-local', localDraft: true, path: 'handoff.workspace.md' },
  records: [
    { id: 'local-a', title: 'Local A', path: 'a.trace.md', markdown, sourceMode: 'local-transition', source: { adapterId: 'local' } },
    { id: 'source-a', title: 'Source A', path: '.topics/source.trace.md', markdown, sourceMode: 'source-backed', source: { id: 'github:docs', adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', sourceBacked: true }, sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: '.topics/source.trace.md', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }
  ],
  assets: [{ id: 'bin', path: 'assets/raw.bin', type: 'application/octet-stream', bytes: new Uint8Array([0, 1, 127, 255]), source: { adapterId: 'local' } }],
  sources: [{ id: 'local', adapterId: 'local' }, { id: 'github:docs', label: 'Docs', adapterId: 'github', sourceKind: 'github.repo', repo: 'Tiinex/docs', ref: 'main', materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', rootPath: '.topics' }],
  sourceOrder: ['local', 'github:docs']
};

const tree = buildWorkspaceExportPlan(workspace, { exportType: 'tree', clock: () => '2026-08-19T12:01:00.000Z' });
assert.equal(tree.selectedExportType, 'tree');
assert.equal(tree.execution.action, 'download-tree-zip');
assert.equal(tree.execution.available, true);
assert.equal(tree.packageEnvelope, false);

const handoff = buildWorkspaceExportPlan(workspace, { exportType: 'handoff-package', clock: () => '2026-08-19T12:01:00.000Z' });
assert.equal(handoff.selectedAdapterId, 'handoff-package');
assert.equal(handoff.execution.action, 'download-handoff-package');
assert.equal(handoff.execution.available, true);
assert.equal(handoff.packageEnvelope, true);
assert.equal(Object.prototype.hasOwnProperty.call(handoff, 'handoffBundle'), false);
assert.equal(Object.prototype.hasOwnProperty.call(handoff, 'handoffInspection'), false);

let downloaded = 0;
const executed = executeWorkspaceExportCommand({
  workspace, exportPlan: handoff,
  download(inputWorkspace, _doc, _win, preparation) {
    downloaded += 1;
    assert.equal(inputWorkspace.id, workspace.id);
    assert.equal(preparation.inspection.status, 'valid');
    return { filename: 'tiinex-handoff-handoff-test.zip' };
  }
});
assert.equal(executed.ok, true);
assert.equal(downloaded, 1);
assert.match(executed.notice, /Handoff package/);
assert.equal(executed.preparation.inspection.status, 'valid');
assert.ok(executed.bundle.files.some((file) => file.path === 'tiinex.package/index.json'));
assert.equal(executed.bundle.files.some((file) => file.kind === 'source-reference'), true, 'source-backed record must be transported as a source reference at execution');

const clicks = [];
const blobs = [];
const doc = { body: { appendChild() {} }, createElement() { return { href: '', download: '', rel: '', click() { clicks.push(this.download); }, remove() {} }; } };
const win = { URL: { createObjectURL(blob) { blobs.push(blob); return 'blob:handoff'; }, revokeObjectURL() {} }, setTimeout(fn) { fn(); } };
const actual = exportWorkspaceHandoffDownload(workspace, doc, win);
assert.equal(clicks.length, 1);
assert.match(actual.filename, /^tiinex-handoff-handoff-test-/);
assert.equal(blobs.length, 1);
assert.equal(blobs[0] instanceof Blob, true, 'product download uses exact package ZIP Blob serializer');

const blockedPlan = { ...handoff, execution: { ...handoff.execution, available: false, action: 'github-publication-held' } };
const blocked = executeWorkspaceExportCommand({ workspace, exportPlan: blockedPlan });
assert.equal(blocked.ok, false);
assert.equal(blocked.error, 'export.mode.not-executable');

console.log('workspaceHandoffExport: ok');
