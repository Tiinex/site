import assert from 'assert';
import { loadGithubFilesForSource } from './github.loader.js';

function makeFakeFetch(map, called) {
  return async function fetchImpl(url, opts) {
    called.push(url);
    if (!map[url]) return { ok: false, status: 404, statusText: 'Not Found' };
    return { ok: true, status: 200, statusText: 'OK', text: async () => map[url] };
  };
}

async function runTests() {
  const source = { repo: 'owner/repo', ref: 'main', rootPath: '.topics' };
  const raw = 'https://raw.githubusercontent.com/owner/repo/main/.topics/foo.md';
  const blob = 'https://github.com/owner/repo/blob/main/.topics/foo.md';
  const repoRelative = 'foo.md';
  const map = {};
  map[raw] = '# Title\n\nContent';

  // Track called URLs
  const called = [];
  const fetchImpl = makeFakeFetch(map, called);

  // raw URL should load and call fetch with raw URL
  const r1 = await loadGithubFilesForSource(source, [raw], { fetchImpl });
  assert(r1.okCount === 1 && r1.failCount === 0, 'raw URL should load');
  assert(called.includes(raw), 'raw URL should be fetched');

  // blob URL normalizes to raw and should load
  called.length = 0;
  const r2 = await loadGithubFilesForSource(source, [blob], { fetchImpl });
  assert(r2.okCount === 1, 'blob URL should normalize and load');
  assert(called.length === 1 && called[0].includes('raw.githubusercontent.com'), 'blob should be converted to raw fetch');

  // repo-relative path should be normalized using rootPath and not double-prefix
  called.length = 0;
  const r3 = await loadGithubFilesForSource(source, [repoRelative], { fetchImpl });
  assert(r3.okCount === 1 && r3.failCount === 0, 'repo-relative path should load');
  // The called URL should contain exactly one "/.topics/" segment
  const calledUrl = called[0] || '';
  const occurrences = (calledUrl.match(/\.topics/g) || []).length;
  assert(occurrences === 1, '.topics should appear exactly once in normalized path');



  // Repo-relative paths require a concrete source ref; no implicit master fallback.
  called.length = 0;
  const noRef = await loadGithubFilesForSource({ repo: 'owner/repo', ref: '', rootPath: '.topics' }, ['foo.md'], { fetchImpl });
  assert(noRef.okCount === 0 && noRef.failCount === 1, 'repo-relative paths should require explicit/resolved ref');
  assert(called.length === 0, 'missing ref should fail before fetch');

  // Unsupported host should be rejected without calling fetch
  called.length = 0;
  const badHost = 'https://example.com/x.md';
  const r4 = await loadGithubFilesForSource(source, [badHost], { fetchImpl });
  assert(r4.okCount === 0 && r4.failCount === 1, 'unsupported host must fail');
  assert(called.length === 0, 'fetch must not be called for unsupported hosts');

  // Non-HTTPS URL should be rejected without calling fetch
  called.length = 0;
  const nonHttps = 'http://raw.githubusercontent.com/owner/repo/main/.topics/foo.md';
  const r5 = await loadGithubFilesForSource(source, [nonHttps], { fetchImpl });
  assert(r5.okCount === 0 && r5.failCount === 1, 'non-https must fail');
  assert(called.length === 0, 'fetch must not be called for non-https absolute URLs');

  // Partial success: include one valid and one invalid ref
  called.length = 0;
  const valid = raw;
  const invalid = 'does-not-exist.md';
  const r6 = await loadGithubFilesForSource(source, [valid, invalid], { fetchImpl });
  assert(r6.okCount === 1 && r6.failCount === 1, 'partial success should return records + errors');
  assert(r6.records[0] && !r6.records[0].source, 'records must not include source');

  console.log('✓ github.loader tests passed');
}

runTests().catch((e) => { console.error(e); process.exit(1); });
