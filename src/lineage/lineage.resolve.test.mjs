import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { resolveLineage } from './lineage.resolve.js';
import { resolveAuditLineage } from '../audit/lineage/auditLineage.resolve.js';

function leaf({ title, id, trace = '', origin = '', path = `${id}.md` }) {
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
    '- Test Integrity',
    '  - Method: fixture',
    '  - Value: ok'
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path }), { id });
}

const parent = leaf({ id: 'parent-1', title: 'Parent', path: 'topics/parent.md' });
const childByTrace = leaf({ id: 'child-1', title: 'Child Trace', trace: 'record:parent-1', origin: 'topics/parent.md', path: 'topics/child.md' });
const childByOrigin = leaf({ id: 'child-2', title: 'Child Origin', origin: 'topics/parent.md', path: 'topics/child-origin.md' });
const childMissing = leaf({ id: 'child-3', title: 'Child Missing', trace: 'record:missing-parent', origin: 'missing.md', path: 'topics/child-missing.md' });

const result = resolveLineage([parent, childByTrace, childByOrigin, childMissing]);
assert.equal(result.schema, 'tiinex.lineage.view.v1', 'lineage result declares view schema');
assert.equal(result.stats.nodes, 4, 'lineage should include all nodes');
assert(result.edges.some((edge) => edge.from === 'parent-1' && edge.to === 'child-1' && edge.kind === 'parent'), 'trace should resolve parent edge');
assert(result.edges.some((edge) => edge.from === 'parent-1' && edge.to === 'child-2' && edge.kind === 'origin'), 'origin-only recovery should resolve origin edge');
assert(result.edges.some((edge) => edge.to === 'child-3' && edge.status === 'missing'), 'missing trace should produce missing edge');
assert(result.findings.some((finding) => finding.code === 'lineage.parent.missing' && finding.nodeId === 'child-3'), 'missing parent finding should be emitted');
assert.equal(parent.trace, '', 'root record should expose empty trace');
assert.equal(childByTrace.trace, 'record:parent-1', 'record shaping should preserve parsed Trace');
assert.equal(childByTrace.origin, 'topics/parent.md', 'record shaping should preserve parsed Origin');


const nestedOriginMarkdown = [
  '# Continuity Context',
  '',
  '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
  '- Parent',
  '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
  '  - Trace: record:missing-url-parent',
  '  - Origin:',
  '    - [browse + git](https://github.com/Tiinex/docs/blob/abcdef/topics/parent.md)',
  '- Current',
  '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
  '  - Created At: 2026-07-21T00:00:00.000Z',
  '  - Summary: Child Origin URL',
  '',
  '---',
  '',
  '# Child Origin URL',
  '',
  '# Continuity Integrity',
  '',
  '- Test Integrity',
  '  - Method: fixture',
  '  - Value: ok'
].join('\n');
const childByNestedOriginUrl = Object.assign(createRecordFromMarkdown(nestedOriginMarkdown, { path: 'topics/child-url.md' }), { id: 'child-url' });
const urlResult = resolveLineage([parent, childByNestedOriginUrl]);
assert.equal(childByNestedOriginUrl.origin, 'https://github.com/Tiinex/docs/blob/abcdef/topics/parent.md', 'parser should preserve nested Origin link target');
assert(urlResult.edges.some((edge) => edge.from === 'parent-1' && edge.to === 'child-url' && edge.kind === 'origin' && edge.method === 'path-suffix'), 'origin URL should resolve loaded parent by explicit path suffix');

const audit = resolveAuditLineage([parent, childByTrace]);
assert.equal(audit.schema, 'tiinex.audit.lineage.resolve.v1', 'audit lineage result declares schema');
assert(audit.edges.length >= 1, 'audit lineage should reuse resolver edges');

console.log('✓ lineage.resolve tests passed');
