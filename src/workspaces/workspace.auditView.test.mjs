import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildWorkspaceAuditView } from './workspace.auditView.js';

function record({ id, title, schema = 'tiinex.topic.v1', path = `${id}.md`, trace = '', origin = '', integrity = true }) {
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace || origin ? '- Parent' : '',
    trace || origin ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: ${trace}` : '',
    origin ? `  - Origin: ${origin}` : '',
    '- Current',
    `  - Current Schema: [${schema}](${schema}.schema.md)`,
    '  - Created At: 2026-07-21T00:00:00.000Z',
    `  - Summary: ${title}`,
    '',
    '---',
    '',
    `# ${title}`,
    '',
    integrity ? '# Continuity Integrity' : '',
    integrity ? '' : '',
    integrity ? '- Fixture Integrity' : '',
    integrity ? '  - Method: fixture' : '',
    integrity ? '  - Value: ok' : ''
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path }), { id });
}

const parent = record({ id: 'parent', title: 'Parent Topic', path: 'topics/parent.md' });
const child = record({ id: 'child', title: 'Child Topic', path: 'topics/child.md', trace: 'record:parent', origin: 'topics/parent.md' });
const unknown = record({ id: 'unknown', title: 'Unknown Child', schema: 'tiinex.unknown.v1', path: 'topics/unknown.md', integrity: false });

const view = buildWorkspaceAuditView({ id: 'w1', title: 'Audit Demo', records: [parent, child, unknown] });
assert.equal(view.schema, 'tiinex.workspace.loadedAuditView.v1');
assert.equal(view.mode, 'loaded-only');
assert.equal(view.items.length, 3);
assert(view.counts.records === 3, 'audit should count loaded records');
assert(view.counts.fallbackUsed >= 1, 'unknown schema should use root fallback');
assert(view.counts.warnings >= 1, 'missing integrity should become a warning');
assert(view.lineage.edges.some((edge) => edge.from === 'parent' && edge.to === 'child'), 'audit view should include loaded lineage edges');
assert(view.boundary.includes('Loaded material only'), 'audit view must disclose loaded-only boundary');

const filtered = buildWorkspaceAuditView({ id: 'w1', title: 'Audit Demo', records: [parent, child, unknown] }, { query: 'unknown' });
assert.equal(filtered.items.length, 1, 'audit query should filter rows');
assert.equal(filtered.items[0].id, 'unknown');
assert(filtered.visibleCounts.fallbackUsed >= 1, 'visible counts should reflect filtered rows');

console.log('✓ workspace.auditView tests passed');

const metadataOnly = {
  id: 'source:github:demo:topics/remote.md',
  title: 'Remote Metadata Only',
  summary: 'Remote record shell without material.',
  path: 'topics/remote.md',
  kind: 'tiinex.topic.v1',
  schemaId: 'tiinex.topic.v1',
  markdown: '',
  sourceMode: 'source-backed',
  cacheState: 'metadata-only',
  materialAvailability: 'material-unavailable',
  source: { id: 'github:demo', adapterId: 'github', repo: 'owner/repo', ref: 'main' }
};
const pendingView = buildWorkspaceAuditView({ id: 'w2', title: 'Pending Audit', records: [metadataOnly] });
assert.equal(pendingView.items[0].status, 'pending-unavailable', 'metadata-only source-backed record is pending, not invalid');
assert.equal(pendingView.counts.pending, 1, 'pending count is exposed');
assert.equal(pendingView.counts.invalid, 0, 'metadata-only source-backed record must not count as invalid');
assert(pendingView.items[0].findings.some((finding) => finding.code === 'audit.material.unavailable'), 'pending audit finding is present');
