import assert from 'assert';
import { loadGithubFilesForSource } from './github.loader.js';

// stubbed fetch
async function fakeFetchFactory(map) {
  return async function fetchImpl(url, opts) {
    const key = url;
    if (!map[key]) return { ok: false, status: 404, statusText: 'Not Found' };
    return { ok: true, status: 200, statusText: 'OK', text: async () => map[key] };
  };
}

async function runTests() {
  const source = { repo: 'owner/repo', ref: 'main', rootPath: '.topics' };
  const raw = 'https://raw.githubusercontent.com/owner/repo/main/.topics/foo.md';
  const blob = 'https://github.com/owner/repo/blob/main/.topics/foo.md';
  const map = {};
  map[raw] = '# A\n\nbody';
  const fetchImpl = await fakeFetchFactory(map);

  // raw URL
  const res1 = await loadGithubFilesForSource(source, [raw], { fetchImpl });
  assert(res1.okCount === 1 && res1.failCount === 0, 'raw URL should load');

  // blob URL
  const res2 = await loadGithubFilesForSource(source, [blob], { fetchImpl });
  assert(res2.okCount === 1, 'blob URL should normalize and load');

  // repo-relative path
  const res3 = await loadGithubFilesForSource(source, ['foo.md'], { fetchImpl });
  assert(res3.okCount === 1, 'repo-relative path should load');

  // non-github URL rejected
  const res4 = await loadGithubFilesForSource(source, ['https://example.com/x.md'], { fetchImpl });
  assert(res4.failCount === 1, 'non-github URL must fail');

  console.log('✓ github.loader tests passed');
}

runTests().catch((e) => { console.error(e); process.exit(1); });
