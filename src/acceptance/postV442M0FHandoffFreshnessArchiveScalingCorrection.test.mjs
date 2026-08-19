import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildWorkspaceExportPlan } from '../export/export.plan.js';
import { executeWorkspaceHandoffExportCommand } from '../app/workspaceHandoffExport.js';
import { prepareWorkspaceHandoffExport } from '../export/handoff.plan.js';
import { exportFileMapZipUint8Array, exportPackageZipUint8Array, exportTreeZipUint8Array } from '../export/package.zip.js';
import { buildWorkspaceTreeExportBundle } from '../export/tree.bundle.js';
import { runLocalMaterialImportCommand } from '../app/localMaterialCommand.js';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const clock = () => '2026-08-19T15:30:00.000Z';
const workspaceMarkdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.workspace.v1\n  - Created At: 2026-08-19T15:00:00.000Z\n  - Summary: v442 freshness\n\n---\n\n# v442 freshness\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`;
function draft(id, path) {
  return {
    id, title: id, path, sourceMode: 'local-transition', source: { adapterId: 'local' },
    markdown: `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.topic.v1\n  - Created At: 2026-08-19T15:00:00.000Z\n  - Summary: ${id}\n\n---\n\n# ${id}\n\nBody ${id}\n\n# Continuity Integrity\n\n- Draft Local Integrity\n  - Method: browser-local-draft\n  - Value: pending-publication-or-export\n`
  };
}
function workspace(records) {
  return {
    id: 'w-v442', title: 'v442 Handoff', workspaceMarkdown,
    workspaceImport: { sourceMode: 'local-manual', boundary: 'browser-local', localDraft: true, path: 'v442.workspace.md' },
    records,
    assets: [],
    sources: [{ id: 'local', adapterId: 'local' }],
    sourceOrder: ['local']
  };
}

// Freshness: plan A contains no package snapshot; execution against B must build B exactly.
const workspaceA = workspace([draft('A-only', 'a.trace.md')]);
const stalePlan = buildWorkspaceExportPlan(workspaceA, { exportType: 'handoff-package', clock });
assert.equal(Object.prototype.hasOwnProperty.call(stalePlan, 'handoffBundle'), false);
assert.equal(Object.prototype.hasOwnProperty.call(stalePlan, 'handoffInspection'), false);
const workspaceB = workspace([draft('A-only', 'a.trace.md'), draft('B-new', 'b.trace.md')]);
let executedPreparation = null;
const executed = executeWorkspaceHandoffExportCommand({
  workspace: workspaceB,
  exportPlan: stalePlan,
  clock,
  download(_workspace, _doc, _win, preparation) {
    executedPreparation = preparation;
    return { filename: 'v442-current.zip' };
  }
});
assert.equal(executed.ok, true);
assert.equal(executed.freshness.recordCount, 2);
assert.equal(executedPreparation.bundle.counts.localDraftFiles, 2, 'execution must build from latest current workspace B, not stale plan A');
assert.equal(executedPreparation.bundle.files.some((file) => file.kind === 'artifact-markdown' && file.path.endsWith('b.trace.md')), true, 'B-only material must be in the exported package');

const exportPlanSource = fs.readFileSync(new URL('../export/export.plan.js', import.meta.url), 'utf8');
assert.doesNotMatch(exportPlanSource, /prepareWorkspaceHandoffExport|buildExportPackageBundle|inspectExportPackageBundle/, 'render/read-model planning must not invoke full Handoff package build/inspection');
assert.doesNotMatch(exportPlanSource, /handoffBundle|handoffInspection/, 'render/read-model plan must not cache serialized package truth');

// Ordinary single ZIP: one file read + one decode owner pass, then ordinary semantics.
const ordinaryTreeZip = exportTreeZipUint8Array(buildWorkspaceTreeExportBundle(workspaceA, { clock }));
const ordinaryFile = countingZip('tree.zip', ordinaryTreeZip);
const ordinary = await runLocalMaterialImportCommand({ lifecycle, state: lifecycle.makeEmptyAppState(), fileList: [ordinaryFile], options: { clock } });
assert.equal(ordinary.ok, true);
assert.equal(ordinaryFile.readCount(), 1, 'ordinary ZIP byte owner must read selected archive once');
assert.equal(ordinary.adapterResult.diagnostics.archiveDecodePassCount, 1, 'ordinary ZIP must have one archive decode ownership pass');

// Valid Handoff: same one extraction pass, then shared package interpretation.
const handoffPreparation = prepareWorkspaceHandoffExport(workspaceB, { clock });
assert.equal(handoffPreparation.executable, true);
const handoffZip = exportPackageZipUint8Array(handoffPreparation.bundle);
const handoffFile = countingZip('tiinex-handoff-v442.zip', handoffZip);
const handoff = await runLocalMaterialImportCommand({ lifecycle, state: lifecycle.makeEmptyAppState(), fileList: [handoffFile], options: { clock } });
assert.equal(handoff.ok, true);
assert.equal(handoff.handoffPackage.ok, true);
assert.equal(handoffFile.readCount(), 1, 'valid Handoff ZIP must be extracted once before shared inspection/import');
assert.equal(handoff.handoffPackage.extracted.diagnostics.archiveDecodePassCount, 1);

// Invalid claimed Handoff: fail closed after the same single extraction, no generic fallback.
const invalidFiles = handoffPreparation.bundle.files.filter((file) => file.path !== 'tiinex.package/contract.json');
const invalidFile = countingZip('claimed-handoff.zip', exportFileMapZipUint8Array(invalidFiles));
const invalid = await runLocalMaterialImportCommand({ lifecycle, state: lifecycle.makeEmptyAppState(), fileList: [invalidFile], options: { clock } });
assert.equal(invalid.ok, false);
assert.equal(invalid.error, 'handoff-package.invalid');
assert.equal(invalidFile.readCount(), 1, 'invalid claimed Handoff must fail closed without a second archive decode/fallback');
assert.equal(invalid.handoffPackage.extracted.diagnostics.archiveDecodePassCount, 1);

console.log('post-v442 M0-F Handoff freshness + archive scaling correction: PASS');

function countingZip(name, bytes) {
  let reads = 0;
  return {
    name,
    size: bytes.byteLength,
    type: 'application/zip',
    readCount: () => reads,
    async arrayBuffer() {
      reads += 1;
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }
  };
}
