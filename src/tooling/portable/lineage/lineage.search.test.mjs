import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { searchPortableLineage } from '../engine.facade.js';

function topic({ id, title, summary, trace = '', body = '' }) {
  return {
    id,
    path: `${id}.trace.md`,
    markdown: `# Continuity Context

- Envelope Schema: tiinex.root.v1
${trace ? `- Parent\n  - Parent Schema: tiinex.topic.v1\n  - Trace: record:${trace}\n  - Boundary: portable local\n` : ''}- Current
  - Current Schema: tiinex.topic.v1
  - Created At: 2026-07-22 00:00:00
  - Summary: ${summary}

---

# ${title}

## Current Read

${body}
`
  };
}

const records = [
  topic({ id: 'root', title: 'Mobile investigation', summary: 'Root mobile investigation', body: 'Observed toolbar overflow on mobile.' }),
  topic({ id: 'fix', title: 'Toolbar repair', summary: 'Mobile toolbar fix', trace: 'root', body: 'Implemented a bounded toolbar repair.' }),
  topic({ id: 'desktop', title: 'Desktop polish', summary: 'Desktop-only polish', trace: 'root', body: 'Desktop alignment changed.' })
];

const searched = searchPortableLineage({ records, query: 'mobile toolbar', filters: { relation: 'leaf' } });
assert.deepEqual(searched.matches.map((item) => item.id), ['fix']);
assert.equal(searched.matches[0].relation.leaf, true);
assert.equal(searched.facets.schemas['tiinex.topic.v1'], 1);
assert.equal(searched.boundary.remoteFetch, false);

const scoped = searchPortableLineage({ records, query: 'mobile', scope: 'ancestors', startId: 'fix', maxDepth: 5 });
assert.equal(scoped.matches.some((item) => item.id === 'root'), true);
assert.equal(scoped.matches.some((item) => item.id === 'desktop'), false);

const filtered = searchPortableLineage({ records, filters: { schemaIds: ['tiinex.topic.v1'], hasContinuityContext: true, pathPrefix: 'desktop' } });
assert.deepEqual(filtered.matches.map((item) => item.id), ['desktop']);

const originOnly = {
  id: 'origin-only',
  path: 'origin-only.trace.md',
  markdown: `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.topic.v1
  - Origin: record:root
- Current
  - Current Schema: tiinex.topic.v1
  - Created At: 2026-07-22 00:00:00

---

# Origin-only recovery context
`
};
const relationSearch = searchPortableLineage({ records: [...records, originOnly], filters: { pathPrefix: 'origin-only' } });
assert.equal(relationSearch.matches[0].relation.root, true, 'Origin recovery edges must not become semantic Parent edges for root/leaf filters.');

function integrityTopic({ id, path, trace = '', parentHash = '', selfHash = '' }) {
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace ? '- Parent' : '',
    trace ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: [${trace}](${trace})` : '',
    '- Current',
    '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
    '  - Created At: 2026-08-27 00:00:00',
    `  - Summary: ${id}`,
    '',
    '---',
    '',
    `# ${id}`,
    '',
    '# Continuity Integrity',
    '',
    parentHash ? '- [sha256-base64url-c14n-v2](validator.md)' : '',
    parentHash ? `  - Towards: [${trace}](${trace})` : '',
    parentHash ? `  - Value: ${parentHash}` : '',
    selfHash ? '- [sha256-base64url-c14n-v2](validator.md)' : '',
    selfHash ? '  - Towards: self' : '',
    selfHash ? `  - Value: ${selfHash}` : ''
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path }), { id });
}

const verifiedParent = integrityTopic({ id: 'verified-parent', path: 'verified-parent.trace.md', selfHash: 'verified-parent-hash' });
const verifiedChild = integrityTopic({ id: 'verified-child', path: 'verified-child.trace.md', trace: 'verified-parent.trace.md', parentHash: 'verified-parent-hash', selfHash: 'verified-child-hash' });
const verifiedTopology = searchPortableLineage({ records: [verifiedParent, verifiedChild] });
const verifiedParentMatch = verifiedTopology.matches.find((item) => item.id === 'verified-parent');
const verifiedChildMatch = verifiedTopology.matches.find((item) => item.id === 'verified-child');
assert.deepEqual(verifiedParentMatch.relation, { root: true, leaf: false, parents: [], children: ['verified-child'] }, 'Integrity-verified Parent edges must remain visible in search topology.');
assert.deepEqual(verifiedChildMatch.relation, { root: false, leaf: true, parents: ['verified-parent'], children: [] }, 'Integrity-verified child topology must not collapse into a synthetic root.');

const mismatchParent = integrityTopic({ id: 'mismatch-parent', path: 'mismatch-parent.trace.md', selfHash: 'new-parent-hash' });
const mismatchChild = integrityTopic({ id: 'mismatch-child', path: 'mismatch-child.trace.md', trace: 'mismatch-parent.trace.md', parentHash: 'old-parent-hash', selfHash: 'mismatch-child-hash' });
const mismatchTopology = searchPortableLineage({ records: [mismatchParent, mismatchChild] });
assert.deepEqual(mismatchTopology.matches.find((item) => item.id === 'mismatch-child').relation.parents, ['mismatch-parent'], 'A stable Parent identity remains topological even when integrity qualification is mismatch; the mismatch state is not rewritten.');

const missingChild = integrityTopic({ id: 'missing-child', path: 'missing-child.trace.md', trace: 'not-loaded.trace.md', parentHash: 'missing-parent-hash', selfHash: 'missing-child-hash' });
const missingTopology = searchPortableLineage({ records: [missingChild] });
assert.equal(missingTopology.matches[0].relation.root, true, 'Missing Parent targets must remain roots in loaded-only search topology.');
assert.deepEqual(missingTopology.matches[0].relation.parents, [], 'Missing Parent targets must not create a guessed topological edge.');

console.log('✓ portable loaded-lineage search, filters, facets, and traversal scope passed');
