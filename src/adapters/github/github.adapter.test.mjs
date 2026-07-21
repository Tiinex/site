import assert from 'assert';
import { discoverGithubMarkdownRefs, materializeGithubSource, resolveGithubSourceRef } from './github.adapter.js';

function makeFetch(map, called = []) {
  return async function fetchImpl(url) {
    called.push(url);
    const hit = map[url];
    if (!hit) return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}), text: async () => '' };
    if (hit.ok === false) {
      return {
        ok: false,
        status: hit.status || 500,
        statusText: hit.statusText || 'Error',
        json: async () => hit.json || {},
        text: async () => hit.text || ''
      };
    }
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => hit.json,
      text: async () => hit.text
    };
  };
}

const repo = 'owner/repo';
const repoApi = 'https://api.github.com/repos/owner/repo';
const treeApi = 'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1';
const rawTopic = 'https://raw.githubusercontent.com/owner/repo/main/.topics/a.md';
const rawNested = 'https://raw.githubusercontent.com/owner/repo/main/.topics/nested/b.trace.md';

const map = {
  [repoApi]: { json: { default_branch: 'main' } },
  [treeApi]: { json: { truncated: false, tree: [
    { type: 'blob', path: '.topics/a.md' },
    { type: 'blob', path: '.topics/nested/b.trace.md' },
    { type: 'blob', path: '.topics/image.png' },
    { type: 'blob', path: 'README.md' }
  ] } },
  [rawTopic]: { text: '# A\n\nBody' },
  [rawNested]: { text: '# B\n\nBody' }
};

const called = [];
const fetchImpl = makeFetch(map, called);
const source = { id: 'github:owner/repo:.topics', repo, ref: '', rootPath: '.topics' };

const resolved = await resolveGithubSourceRef(source, { fetchImpl });
assert.equal(resolved.ref, 'main', 'blank ref should resolve public default branch');

const discovered = await discoverGithubMarkdownRefs(source, { fetchImpl });
assert.deepEqual(discovered.refs, ['.topics/a.md', '.topics/nested/b.trace.md'], 'repo discovery should return only markdown under roots');
assert.equal(discovered.ref, 'main', 'discovery should return resolved ref');

const materialized = await materializeGithubSource(source, { repoDiscovery: true, fileRefs: [] }, { fetchImpl });
assert.equal(materialized.okCount, 2, 'repo discovery should load discovered markdown files');
assert.equal(materialized.failCount, 0, 'repo discovery should not fail for mapped files');
assert.equal(materialized.records.length, 2, 'records should be materialized');
assert(materialized.records.every((record) => !record.source), 'adapter must not assign lifecycle source provenance');
assert.equal(materialized.diagnostics.resolvedRef, 'main', 'adapter result should expose resolved ref');
assert.equal(materialized.diagnostics.requests, 2, 'raw materialization should count fetch requests');

const limitedFetch = makeFetch({
  [repoApi]: { json: { default_branch: 'main' } },
  [treeApi]: { ok: false, status: 403, statusText: 'Forbidden', json: { message: 'API rate limit exceeded' } }
});
const limited = await materializeGithubSource(source, { repoDiscovery: true, fileRefs: [] }, { fetchImpl: limitedFetch });
assert.equal(limited.okCount, 0, 'rate-limited repo discovery should not materialize records');
assert.equal(limited.failCount, 0, 'rate-limited repo discovery should be a warning, not a file failure');
assert.equal(limited.errors.length, 0, 'rate-limited repo discovery should not be a fatal adapter error');
assert(limited.warnings.some((warning) => warning.code === 'github.repo.discovery.rate-limited-or-forbidden'), '403 discovery should produce a precise warning');
assert.equal(limited.diagnostics.discoveryUnavailable, true, 'diagnostics should preserve discovery-unavailable state');
assert(limited.diagnostics.transportEvents.some((event) => event.code === 'github.repo.discovery.rate-limited-or-forbidden'), '403 discovery should be captured as a transport event');


const budgetCalled = [];
const budgetLimited = await materializeGithubSource(
  { id: 'github:owner/repo', repo, ref: 'main', rootPath: '.topics' },
  { repoDiscovery: false, fileRefs: ['.topics/a.md', '.topics/nested/b.trace.md'] },
  { fetchImpl: makeFetch(map, budgetCalled), maxRequestsPerOperation: 1 }
);
assert.equal(budgetLimited.records.length, 0, 'transport budget should block raw materialization before fetching');
assert.equal(budgetLimited.okCount, 0, 'budget-blocked materialization should not claim loaded records');
assert.equal(budgetLimited.failCount, 0, 'budget-blocked transport policy is degraded warning, not file failure');
assert.equal(budgetLimited.diagnostics.requests, 0, 'budget block must happen before raw fetch requests');
assert.equal(budgetCalled.length, 0, 'budget-blocked raw load must not call fetch');
assert(budgetLimited.warnings.some((warning) => warning.code === 'transport.policy.request-budget-exceeded'), 'budget warning must be surfaced');
assert(budgetLimited.diagnostics.transportEvents.some((event) => event.code === 'transport.policy.request-budget-exceeded'), 'budget warning must be a transport event');

const issueDeferred = await materializeGithubSource(source, { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' }, { fetchImpl });
assert(issueDeferred.warnings.some((warning) => warning.code === 'github.issue.reader.deferred'), 'issue reader must be honest/deferred without fixtures');
assert.equal(issueDeferred.diagnostics.issueSnapshotTargets, 1, 'issue targets should be parsed into diagnostics');

const issueSnapshot = await materializeGithubSource(source, { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' }, { fetchImpl, issueSnapshotFixtures: { 'https://github.com/owner/repo/issues/1': { title: 'Fixture issue', state: 'open', body: 'Issue body', user: { login: 'q' }, created_at: '2026-07-21T00:00:00.000Z' } } });
assert.equal(issueSnapshot.records.length, 1, 'fixture-backed issue snapshot should materialize one evidence record');
assert.equal(issueSnapshot.records[0].kind, 'tiinex.evidence.v1', 'issue snapshot should become an evidence record');
assert.equal(issueSnapshot.records[0].source, undefined, 'adapter must not assign lifecycle source provenance to issue snapshots');

console.log('✓ github.adapter tests passed');
