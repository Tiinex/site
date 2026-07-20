import assert from 'assert';
import { discoverGithubMarkdownRefs, materializeGithubSource, resolveGithubSourceRef } from './github.adapter.js';

function makeFetch(map, called = []) {
  return async function fetchImpl(url) {
    called.push(url);
    const hit = map[url];
    if (!hit) return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}), text: async () => '' };
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

const issueDeferred = await materializeGithubSource(source, { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' }, { fetchImpl });
assert(issueDeferred.warnings.some((warning) => warning.code === 'github.issue.reader.deferred'), 'issue reader must be honest/deferred');

console.log('✓ github.adapter tests passed');
