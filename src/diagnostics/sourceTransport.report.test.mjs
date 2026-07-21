import assert from 'node:assert/strict';
import { buildSourceTransportReport, classifyTransportIssue, normalizeTransportEvent } from './sourceTransport.report.js';

assert.equal(classifyTransportIssue({ status: 403, message: 'API rate limit exceeded' }), 'rate-limited-or-forbidden');
assert.equal(classifyTransportIssue({ error: '404 Not Found' }), 'not-found');
assert.equal(classifyTransportIssue({ code: 'source.github.ref.unpinned' }), 'unpinned-source');
assert.equal(classifyTransportIssue({ code: 'github.issue.reader.deferred' }), 'unavailable');

const normalized = normalizeTransportEvent({ adapterId: 'github', sourceId: 'gh', code: 'github.repo.discovery.rate-limited-or-forbidden', status: 403, message: 'rate limited' });
assert.equal(normalized.classification, 'rate-limited-or-forbidden');
assert.equal(normalized.retryable, true);
assert.equal(normalized.severity, 'warning');

const workspace = {
  id: 'w-transport',
  sources: [
    { id: 'local', adapterId: 'local' },
    { id: 'gh-unpinned', adapterId: 'github', repo: 'Tiinex/docs' },
    { id: 'gh-pinned', adapterId: 'github', repo: 'Tiinex/docs', ref: 'abcdef' }
  ],
  importResults: [{
    adapterId: 'github',
    sourceId: 'gh-unpinned',
    warnings: [{ code: 'github.repo.discovery.rate-limited-or-forbidden', severity: 'warning', message: 'GitHub repo discovery is unavailable right now (API 403/rate-limit).', status: 403 }],
    errors: [{ ref: 'missing.md', error: '404 Not Found' }],
    diagnostics: {
      transport: 'public-github-api/raw',
      explicitFileRefs: 2,
      discoveredFileRefs: 0,
      discoveryUnavailable: true,
      discoveryError: '403 Forbidden API rate limit exceeded',
      cacheHits: 1,
      cacheMisses: 2,
      treeUrl: 'https://api.github.com/repos/Tiinex/docs/git/trees/main?recursive=1'
    }
  }]
};

const report = buildSourceTransportReport(workspace);
assert.equal(report.schema, 'tiinex.sourceTransport.report.v1');
assert.equal(report.status, 'blocked', '404 file error blocks transport report');
assert.equal(report.counts.sources, 3);
assert.equal(report.counts.rateLimited >= 1, true, '403/rate-limit should be classified');
assert.equal(report.counts.notFound >= 1, true, '404 should be classified');
assert.equal(report.counts.retryable >= 1, true, 'rate-limit should be retryable');
assert.equal(report.counts.cacheHits, 1);
assert.equal(report.counts.cacheMisses, 2);
assert.ok(report.events.some((event) => event.code === 'source.github.ref.unpinned'));
assert.ok(report.nextActions.some((action) => action.includes('explicit file refs')));
assert.ok(report.nextActions.some((action) => action.includes('repo/ref/path')));
assert.ok(report.nextActions.some((action) => action.includes('Pin or resolve')));

const clean = buildSourceTransportReport({ id: 'clean', sources: [{ id: 'local', adapterId: 'local' }], importResults: [] });
assert.equal(clean.status, 'clean');
assert.equal(clean.counts.events, 0);

console.log('sourceTransport.report: ok');
