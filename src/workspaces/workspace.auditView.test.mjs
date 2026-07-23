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
    integrity ? '- sha256-base64url-c14n-v2' : '',
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
assert(view.counts.schemaOwned >= 2, 'known topic records should count as schema-owned reads');
assert(view.counts.rootFallback >= 1, 'unknown schema should count as root fallback');
assert(view.counts.unknownSchema >= 1, 'unknown schema coverage should be counted separately');
assert(view.counts.warnings >= 1, 'missing integrity should become a warning');
assert(view.counts.validationComplete >= 2, 'known schema companions should count as complete validation');
assert(view.counts.validationPartial >= 1, 'unknown child schema should count as partial validation');
assert(view.counts.childValidatorUnavailable >= 1, 'unknown child schema should expose unavailable child validator');
assert(view.counts.integrityV2 >= 2, 'v2 integrity method usage should be counted when present');
assert.equal(view.items.find((item) => item.id === 'child').validationState, 'exact-schema-validated', 'known topic child runs exact schema validation');
assert.equal(view.items.find((item) => item.id === 'unknown').validationState, 'root-only-child-validator-unavailable', 'unknown child schema is Root-only validation, not exact validation');
assert(view.items.find((item) => item.id === 'unknown').findings.some((finding) => finding.code === 'audit.validator.unavailable'), 'unknown child schema reports unavailable child validator');
assert(view.lineage.edges.some((edge) => edge.from === 'parent' && edge.to === 'child'), 'audit view should include loaded lineage edges');
assert(view.boundary.includes('Loaded material only'), 'audit view must disclose loaded-only boundary');

const filtered = buildWorkspaceAuditView({ id: 'w1', title: 'Audit Demo', records: [parent, child, unknown] }, { query: 'unknown' });
assert.equal(filtered.items.length, 1, 'audit query should filter rows');
assert.equal(filtered.items[0].id, 'unknown');
assert(filtered.visibleCounts.fallbackUsed >= 1, 'visible counts should reflect filtered rows');


const rootRecord = record({ id: 'root-record', title: 'Root Record', schema: 'tiinex.root.v1', path: 'topics/root.md' });
const rootAuditView = buildWorkspaceAuditView({ id: 'w4', title: 'Root Audit', records: [rootRecord] });
assert.equal(rootAuditView.items[0].readState, 'root-readable', 'root schema must be root-readable, not fallback');
assert.equal(rootAuditView.counts.rootReadable, 1, 'root-readable count is exposed');
assert.equal(rootAuditView.counts.rootFallback, 0, 'root-readable should not count as root fallback');
assert.equal(rootAuditView.items[0].validationState, 'root-validated', 'root artifacts run Root validation exactly');

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
assert.equal(pendingView.items[0].readState, 'unavailable-body', 'pending metadata-only source has unavailable-body read state');
assert.equal(pendingView.counts.unavailableBody, 1, 'unavailable body count is exposed');
assert.equal(pendingView.counts.invalid, 0, 'metadata-only source-backed record must not count as invalid');
assert.equal(pendingView.items[0].validationState, 'not-run-body-unavailable', 'metadata-only source shell validation is not run until body loads');
assert.equal(pendingView.counts.validationUnavailable, 1, 'body-unavailable validation count is exposed');
assert(pendingView.items[0].findings.some((finding) => finding.code === 'audit.material.unavailable'), 'pending audit finding is present');

const plainMarkdown = createRecordFromMarkdown('# Plain README\n\nThis is supporting project documentation, not a Tiinex leaf.', {
  path: 'README.md',
  sourceMode: 'archive-local'
});
const supportingView = buildWorkspaceAuditView({ id: 'w3', title: 'Supporting Markdown Audit', records: [Object.assign({ id: 'plain-readme' }, plainMarkdown)] });
assert.equal(supportingView.items[0].status, 'supporting-material', 'plain markdown should be supporting material, not an invalid leaf');
assert.equal(supportingView.counts.supporting, 1, 'supporting material count is exposed');
assert.equal(supportingView.counts.invalid, 0, 'plain markdown should not count as invalid');
assert.equal(supportingView.counts.errors, 0, 'plain markdown support classification should not emit audit errors');
assert.equal(supportingView.items[0].validationState, 'not-applicable-supporting', 'supporting markdown is not a failed Tiinex schema validation');
assert.equal(supportingView.counts.validationNotApplicable, 1, 'supporting validation not-applicable count is exposed');
assert(supportingView.items[0].findings.some((finding) => finding.code === 'audit.markdown.supporting-material'), 'supporting material finding is present');

console.log('✓ workspace.auditView tests passed');
