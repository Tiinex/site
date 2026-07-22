import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildWorkspaceLineageView } from './workspace.lineageView.js';

function record({ id, title, path, trace = '', origin = '' }) {
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace || origin ? '- Parent' : '',
    trace || origin ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: ${trace}` : '',
    origin ? `  - Origin: ${origin}` : '',
    '- Current',
    '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
    '  - Created At: 2026-07-21T00:00:00.000Z',
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

const parent = record({ id: 'p1', title: 'Parent Topic', path: 'topics/parent.md' });
const child = record({ id: 'c1', title: 'Child Topic', path: 'topics/child.md', trace: 'record:p1', origin: 'topics/parent.md' });
const missing = record({ id: 'c2', title: 'Missing Parent Child', path: 'topics/missing-child.md', trace: 'record:nope' });
const view = buildWorkspaceLineageView({ id: 'w1', title: 'Demo', records: [parent, child, missing] });

assert.equal(view.schema, 'tiinex.workspace.loadedLineageView.v1');
assert.equal(view.stats.visibleNodes, 3);
assert(view.edges.some((edge) => edge.from === 'p1' && edge.to === 'c1' && edge.kind === 'parent'), 'lineage view should surface parent edge');
assert(view.edges.some((edge) => edge.to === 'c2' && edge.status === 'missing'), 'lineage view should surface missing parent edge');
assert(view.findings.some((finding) => finding.code === 'lineage.parent.missing'), 'lineage view should keep missing-parent findings');

const filtered = buildWorkspaceLineageView({ id: 'w1', title: 'Demo', records: [parent, child, missing] }, { query: 'child topic' });
assert(filtered.nodes.some((node) => node.id === 'c1'), 'filtered lineage should include matching child');
assert(filtered.nodes.some((node) => node.id === 'p1'), 'filtered lineage should include immediate parent context');
assert(filtered.edges.some((edge) => edge.from === 'p1' && edge.to === 'c1'), 'filtered lineage should preserve resolved edge context');



const selected = buildWorkspaceLineageView({ id: 'w1', title: 'Demo', records: [parent, child, missing] }, { selectedRecordId: 'c1' });
assert.equal(selected.selectedTraversal.schema, 'tiinex.lineage.traversal.v1', 'selected lineage should expose a loaded traversal');
assert.deepEqual(selected.selectedTraversal.nodes.map((node) => node.id), ['c1', 'p1'], 'selected traversal should present selected ancestors first');
assert(selected.selectedTraversal.edges.some((edge) => edge.from === 'p1' && edge.to === 'c1'), 'selected traversal should reuse the workspace-resolved parent edge');
assert.equal(selected.selectedTraversal.stats.loadedNodes, selected.stats.nodes, 'selected traversal must be based on the same resolved workspace graph');
assert.equal(selected.selectedTraversal.rootReached, true, 'selected traversal should report that the terminal ancestor is a loaded root');
assert.equal(selected.selectedTraversal.status.label, 'root reached', 'selected traversal status should describe the path result, not whether the selected node itself is root');


const childWithMissingOrigin = record({ id: 'c3', title: 'Child With Missing Origin', path: 'topics/child-origin.md', trace: 'record:p1', origin: 'topics/not-loaded-origin.md' });
const selectedWithSecondaryOrigin = buildWorkspaceLineageView({ id: 'w1', title: 'Demo', records: [parent, childWithMissingOrigin] }, { selectedRecordId: 'c3' });
assert.equal(selectedWithSecondaryOrigin.selectedTraversal.rootReached, true, 'missing Origin hint must not override a successful Parent Trace traversal');
assert.equal(selectedWithSecondaryOrigin.selectedTraversal.status.label, 'root reached', 'root reached should dominate secondary origin diagnostics');
assert(selectedWithSecondaryOrigin.selectedTraversal.secondaryFindings.some((finding) => finding.code === 'lineage.origin.unresolved'), 'unresolved origin should remain available as secondary audit context');

const selectedMissing = buildWorkspaceLineageView({ id: 'w1', title: 'Demo', records: [parent, child, missing] }, { selectedRecordId: 'c2' });
assert.equal(selectedMissing.selectedTraversal.missingEdges.length, 1, 'selected traversal should expose missing edge for selected leaf only');
assert(selectedMissing.selectedTraversal.findings.some((finding) => finding.code === 'lineage.traversal.missingTarget'), 'selected traversal should explain where the selected lineage stops');

console.log('✓ workspace.lineageView tests passed');
