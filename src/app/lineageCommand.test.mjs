import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { lineageControlsReadyForTraversal, lineageLoadReportForSelectedView, loadFullLineageCommand, runLineageAuditCommand, shouldAutoLoadLineage } from './lineageCommand.js';

await import('../workspaces/workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function record({ id, title, path, trace = '' }) {
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace ? '- Parent' : '',
    trace ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: ${trace}` : '',
    '- Current',
    '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
    `  - Summary: ${title}`,
    '',
    '---',
    '',
    `# ${title}`,
    '',
    '# Continuity Integrity',
    '',
    '- Fixture Integrity',
    '  - Method: fixture',
    '  - Value: ok'
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path }), { id });
}

const parent = record({ id: 'parent', title: 'Parent', path: 'parent.trace.md' });
const child = record({ id: 'child', title: 'Child', path: 'child.trace.md', trace: 'record:parent' });
const missing = record({ id: 'missing-child', title: 'Missing Child', path: 'missing-child.trace.md', trace: 'record:missing-parent' });

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Lineage Demo' }, { clock: () => '2026-08-08T00:00:00.000Z' });
const state = created.state;
const workspace = lifecycle.activeWorkspace(state);
workspace.records = [parent, child, missing];

assert.equal(lineageLoadReportForSelectedView({ selectedRecordId: 'child', lineageLoadReport: { selectedRecordId: 'other' } }), null, 'stale lineage report must not be reused for a different selected record');
assert.equal(lineageLoadReportForSelectedView({ selectedRecordId: 'child', lineageLoadReport: { selectedRecordId: 'child' } }).selectedRecordId, 'child');
assert.equal(lineageControlsReadyForTraversal({ terminalState: 'root-reached' }), true);

const autoload = shouldAutoLoadLineage({ workspace, selectedRecordId: 'missing-child', loadedKeys: new Set() });
assert.equal(autoload.shouldLoad, true, 'missing selected parent should request auto-load once');
const alreadyLoaded = shouldAutoLoadLineage({ workspace, selectedRecordId: 'missing-child', loadedKeys: new Set([autoload.key]) });
assert.equal(alreadyLoaded.shouldLoad, false, 'auto-load key prevents repeated discovery loops');

const loaded = await loadFullLineageCommand({ lifecycle, state, workspace, selectedRecordId: 'child', clock: () => '2026-08-08T00:01:00.000Z' });
assert.equal(loaded.ok, true, loaded.error);
assert.equal(loaded.lineageLoadReport.state, 'complete', 'loaded local parent continuity should produce a complete lineage report');
assert.equal(loaded.lineageLoadReport.rootReached, true);
assert.equal(loaded.commitMode, 'replace', 'no source recovery means no history push');

const audit = runLineageAuditCommand({ state, workspace, selectedRecordId: 'child', existingLoadReport: loaded.lineageLoadReport, clock: () => '2026-08-08T00:02:00.000Z' });
assert.equal(audit.ok, true, audit.error);
assert.equal(audit.lineageAuditReport.selectedRecordId, 'child');
assert.equal(audit.lineageAuditReport.nodes, 2, 'audit should run over the selected lineage nodes, not the whole workspace');


const originChildMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [Recovered parent](recovered-parent.trace.md)
  - Origin: [Recovered parent](https://github.com/Tiinex/docs/blob/abc123/.topics/recovered-parent.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: Local child with explicit source boundary

---

# Local Child With Explicit Origin`;
const originChild = Object.assign(createRecordFromMarkdown(originChildMarkdown, { path: 'local/child.trace.md', sourceMode: 'archive-local' }), {
  id: 'local:explicit-origin-child',
  source: { id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session' }
});
const originCreated = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Origin Recovery Demo' }, { clock: () => '2026-08-08T00:03:00.000Z' });
const originState = originCreated.state;
const originWorkspace = lifecycle.activeWorkspace(originState);
originWorkspace.records = [originChild];
originWorkspace.sources = [{ id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session', sourceBacked: false }];
const requests = [];
const parentMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: recovered parent

---

# Recovered Parent`;
const fetchImpl = async (url) => {
  requests.push(String(url || ''));
  return { ok: true, status: 200, statusText: 'OK', transportTier: 'direct', text: async () => parentMarkdown };
};
const originLoaded = await loadFullLineageCommand({ lifecycle, state: originState, workspace: originWorkspace, selectedRecordId: originChild.id, fetchImpl, clock: () => '2026-08-08T00:04:00.000Z' });
assert.equal(originLoaded.ok, true, originLoaded.error);
assert.equal(originLoaded.recoveredParents, 1, 'explicit GitHub origin should recover one missing parent without a pre-added discovery source');
assert.equal(originLoaded.lineageLoadReport.state, 'complete', 'recovered parent should complete the loaded lineage');
assert.equal(originLoaded.lineageLoadReport.rootReached, true);
assert.equal(originLoaded.commitMode, 'push', 'source-assisted recovery should push history because workspace material changed');
assert(requests.some((url) => url === 'https://raw.githubusercontent.com/tiinex/docs/abc123/.topics/recovered-parent.trace.md'), 'parent fetch should use the exact GitHub blob ref from Origin, not default-branch guessing');
const originAfter = lifecycle.activeWorkspace(originLoaded.state);
assert.equal(originAfter.records.find((record) => record.id === originChild.id).source.id, 'local', 'imported/local declaring artifact must remain local after parent recovery');
const recoverySource = originAfter.sources.find((source) => source.id === 'origin:github:tiinex:docs');
assert(recoverySource, 'lineage recovery should register a recovery-only source boundary when none existed');
assert.equal(recoverySource.originReferenceSource, true);
assert.equal(recoverySource.sourceBacked, false, 'recovery-only source row must not imply that imported material became source-backed');
assert.equal(recoverySource.ref, 'abc123');
assert(originAfter.records.some((record) => record.id.startsWith('source:origin:github:tiinex:docs:')), 'recovered parent should be source-bound to the explicit origin boundary');

console.log('✓ lineageCommand tests passed');
