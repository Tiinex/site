import assert from 'node:assert/strict';
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

console.log('✓ portable loaded-lineage search, filters, facets, and traversal scope passed');
