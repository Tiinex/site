import assert from 'node:assert/strict';
import { printPortableLineage } from './lineage.print.js';

function topic({ id, title, summary, trace = '', body = '' }) {
  return {
    id,
    path: `${id}.trace.md`,
    markdown: `# Continuity Context

- Envelope Schema: tiinex.root.v1
${trace ? `- Parent\n  - Parent Schema: tiinex.topic.v1\n  - Trace: record:${trace}\n  - Boundary: portable local\n` : ''}- Current
  - Current Schema: tiinex.topic.v1
  - Created At: 2026-08-06 18:00:00
  - Summary: ${summary}

---

# ${title}

## Current Read

${body}

# Continuity Integrity

- Draft Local Integrity
  - Method: test
  - Value: pending
`
  };
}

const records = [
  topic({ id: 'root', title: 'Root idea', summary: 'Root summary', body: 'ROOT BODY SECRET' }),
  topic({ id: 'middle', title: 'Budget shift', summary: 'Budget summary', trace: 'root', body: 'MIDDLE BODY SECRET' }),
  topic({ id: 'leaf', title: 'Current landing', summary: 'Leaf summary', trace: 'middle', body: 'LEAF BODY SECRET' }),
  topic({ id: 'sibling', title: 'Alternative leaf', summary: 'Sibling summary', trace: 'root', body: 'SIBLING BODY SECRET' })
];

const all = printPortableLineage({ records, scope: 'all' });
assert.equal(all.schema, 'tiinex.portable.lineage-print.v1');
assert.equal(all.boundary.projectionOnly, true);
assert.equal(all.boundary.rawMarkdownIncluded, false);
assert.equal(all.stats.artifacts, 4);
assert.equal(all.stats.parentEdges, 3);
assert.equal(all.graph.edges.filter((edge) => edge.status === 'included').length, 3);
assert.equal(all.textMap.includes('Root idea'), true);
assert.equal(JSON.stringify(all).includes('ROOT BODY SECRET'), false, 'lineage print must not expose raw Markdown body text');

const ancestors = printPortableLineage({ records, scope: 'node-ancestors', focusArtifactId: 'leaf' });
assert.deepEqual(ancestors.graph.nodes.map((node) => node.id).sort(), ['leaf', 'middle', 'root']);
assert.equal(ancestors.graph.edges.filter((edge) => edge.status === 'included').length, 2);

const hidden = printPortableLineage({ records, scope: 'export-scope', artifactIds: ['root', 'leaf'] });
assert.deepEqual(hidden.graph.nodes.map((node) => node.id).sort(), ['leaf', 'root']);
assert.equal(hidden.graph.edges.some((edge) => edge.status === 'hidden-intermediate' && edge.hiddenCount === 1), true);
assert.equal(hidden.findings.some((finding) => finding.code === 'lineage-print.hidden-intermediate'), true);

const manifest = {
  liveOperations: {
    latestTurnSequence: 7,
    preparedTurnSequence: 7,
    receipts: [
      { operation: 'update-live-lineage', decision: 'artifact-change', turnSequence: 1, artifactIds: ['sibling'], observedAt: '2026-08-06T18:01:00Z' },
      { operation: 'prepare-live-response', decision: 'response-from-artifact-state', turnSequence: 1 },
      { operation: 'update-live-lineage', decision: 'artifact-change', turnSequence: 7, artifactIds: ['leaf'], observedAt: '2026-08-06T18:07:00Z' },
      { operation: 'prepare-live-response', decision: 'response-from-artifact-state', turnSequence: 7 }
    ]
  }
};
const latest = printPortableLineage({ records, scope: 'latest-leaves', latestLimit: 1, files: [{ path: 'manifest.json', content: JSON.stringify(manifest) }] });
assert.equal(latest.graph.nodes.some((node) => node.id === 'leaf'), true);
assert.equal(latest.graph.nodes.some((node) => node.id === 'sibling'), false);
assert.equal(latest.stats.liveProcessedTurns, 7);

const overcompressedManifest = {
  liveOperations: {
    latestTurnSequence: 7,
    preparedTurnSequence: 7,
    receipts: Array.from({ length: 6 }, (_, index) => ({ operation: 'update-live-lineage', decision: 'artifact-change', turnSequence: index + 1, artifactIds: ['single'], observedAt: `2026-08-06T18:0${index}:00Z` }))
  }
};
const single = printPortableLineage({ records: [topic({ id: 'single', title: 'Single compressed topic', summary: 'Single summary' })], files: [{ path: 'manifest.json', content: JSON.stringify(overcompressedManifest) }] });
const singleCodes = single.findings.map((finding) => finding.code);
assert.equal(singleCodes.includes('lineage-print.overcompression.possible'), true);
assert.equal(singleCodes.includes('lineage-print.authorship.metadata-missing'), true);
assert.equal(singleCodes.includes('lineage-print.reduction.capability-missing'), true);
assert.equal(singleCodes.includes('lineage-print.source-span.metadata-missing'), true);

console.log('✓ portable lineage print projections, scopes, hidden edges, and overcompression diagnostics passed');
