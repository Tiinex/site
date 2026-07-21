import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { traverseLoadedLineage } from './lineage.traverse.js';

function leaf({ id, title, trace = '', origin = '', path = `${id}.md` }) {
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace || origin ? '- Parent' : '',
    trace || origin ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: ${trace}` : '',
    origin ? `  - Origin: ${origin}` : '',
    trace || origin ? '  - Boundary: browser-local session material; no GitHub provenance inferred' : '',
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
    '- Test Integrity',
    '  - Method: fixture',
    '  - Value: ok'
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path }), { id });
}

const root = leaf({ id: 'root', title: 'Root', path: 'topics/root.md' });
const child = leaf({ id: 'child', title: 'Child', trace: 'record:root', origin: 'topics/root.md', path: 'topics/child.md' });
const grandchild = leaf({ id: 'grandchild', title: 'Grandchild', trace: 'record:child', origin: 'topics/child.md', path: 'topics/grandchild.md' });
const missing = leaf({ id: 'missing', title: 'Missing Parent', trace: 'record:not-loaded', origin: 'topics/not-loaded.md', path: 'topics/missing.md' });
const records = [root, child, grandchild, missing];

const ancestors = traverseLoadedLineage(records, { startId: 'grandchild', direction: 'ancestors', maxDepth: 4 });
assert.equal(ancestors.schema, 'tiinex.lineage.traversal.v1');
assert.equal(ancestors.boundary.includes('no remote fetch'), true, 'traversal boundary forbids remote fetch');
assert.deepEqual(ancestors.nodes.map((node) => node.id), ['grandchild', 'child', 'root'], 'ancestor traversal walks declared parent chain');
assert.equal(ancestors.edges.length, 2, 'ancestor traversal includes two loaded edges');
assert.equal(ancestors.stats.missingEdges, 0, 'complete ancestor chain has no missing edges');

const depthOne = traverseLoadedLineage(records, { startId: 'grandchild', direction: 'ancestors', maxDepth: 1 });
assert.deepEqual(depthOne.nodes.map((node) => node.id), ['grandchild', 'child'], 'maxDepth limits traversal');
assert.equal(depthOne.stats.stoppedAtDepth, true, 'depth-limited traversal reports stop at depth');

const descendants = traverseLoadedLineage(records, { startId: 'root', direction: 'descendants', maxDepth: 4 });
assert.deepEqual(descendants.nodes.map((node) => node.id), ['root', 'child', 'grandchild'], 'descendant traversal follows child edges');

const missingTraversal = traverseLoadedLineage(records, { startId: 'missing', direction: 'ancestors', maxDepth: 3 });
assert.equal(missingTraversal.nodes.length, 1, 'missing target traversal keeps loaded start node');
assert.equal(missingTraversal.missingEdges.length, 1, 'missing target edge is represented');
assert(missingTraversal.findings.some((finding) => finding.code === 'lineage.traversal.missingTarget'), 'missing target finding exists');

const missingStart = traverseLoadedLineage(records, { startId: 'not-in-workspace', direction: 'ancestors' });
assert.equal(missingStart.nodes.length, 0, 'missing start returns empty traversal');
assert(missingStart.findings.some((finding) => finding.code === 'lineage.traversal.start.missing'), 'missing start finding exists');

console.log('lineage.traverse: ok');
