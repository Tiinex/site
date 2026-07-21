import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildLoadedAuditTraversalScope } from './audit.traverse.js';

function leaf({ id, title, trace = '', origin = '', path = `${id}.md`, schema = 'tiinex.topic.v1', integrity = true }) {
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
    integrity ? '- Test Integrity' : '',
    integrity ? '  - Method: fixture' : '',
    integrity ? '  - Value: ok' : ''
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path }), { id });
}

const root = leaf({ id: 'root', title: 'Root', path: 'topics/root.md' });
const child = leaf({ id: 'child', title: 'Child', trace: 'record:root', origin: 'topics/root.md', path: 'topics/child.md' });
const invalid = leaf({ id: 'invalid', title: 'Invalid Child', trace: 'record:child', origin: 'topics/child.md', path: 'topics/invalid.md', integrity: false });
const missing = leaf({ id: 'missing', title: 'Missing Parent', trace: 'record:not-loaded', origin: 'topics/not-loaded.md', path: 'topics/missing.md' });

const result = buildLoadedAuditTraversalScope([root, child, invalid, missing], { startId: 'invalid', direction: 'ancestors', maxDepth: 4 });
assert.equal(result.schema, 'tiinex.audit.traversal.scope.v1');
assert.equal(result.boundary.includes('no remote fetch'), true, 'audit traversal boundary forbids remote fetch');
assert.equal(result.counts.visitedNodes, 3, 'audit traversal visits loaded ancestor chain');
assert.equal(result.counts.auditedNodes, 3, 'audit traversal audits all loaded visited nodes');
assert(result.audited.some((item) => item.id === 'root'), 'root was audited');
assert(result.audited.some((item) => item.id === 'child'), 'child was audited');
assert(result.audited.some((item) => item.id === 'invalid' && Number(item.summary.warning || 0) >= 1), 'missing-integrity node contributes warnings at current root severity');
assert.equal(result.status, 'degraded', 'warnings produce degraded audit traversal status');

const missingResult = buildLoadedAuditTraversalScope([root, child, invalid, missing], { startId: 'missing', direction: 'ancestors', maxDepth: 4 });
assert.equal(missingResult.counts.unavailableTargets, 1, 'missing lineage target is counted as unavailable');
assert(missingResult.findings.some((finding) => finding.code === 'audit.traversal.unavailableTarget'), 'unavailable target finding is emitted');
assert.equal(missingResult.status, 'degraded', 'missing target degrades traversal audit');

const missingStart = buildLoadedAuditTraversalScope([root], { startId: 'not-loaded', direction: 'ancestors' });
assert.equal(missingStart.counts.auditedNodes, 0, 'missing start audits no records');
assert(missingStart.findings.some((finding) => finding.code === 'lineage.traversal.start.missing'), 'missing start finding is preserved');

console.log('audit.traverse: ok');
