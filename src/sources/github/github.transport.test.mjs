import assert from 'node:assert/strict';
import { buildGithubTransportPlan, clearGithubSourceTextCacheForSource, createGithubTransportFetch, hydrateGithubRecordFromSourceCache } from './github.transport.js';

function makeResponse(body, options = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body || {});
  return {
    ok: options.ok !== false,
    status: options.status || (options.ok === false ? 500 : 200),
    statusText: options.statusText || (options.ok === false ? 'Error' : 'OK'),
    text: async () => text,
    json: async () => JSON.parse(text || '{}'),
    clone: () => makeResponse(text, options)
  };
}

const workspaceConfig = {
  repositoryMirrors: [{ repository: 'Owner/Repo', name: 'Repo mirror' }],
  repositoryTransports: [{ kind: 'git-proxy', match: 'github.com/*', proxy: 'https://cors.isomorphic-git.org' }]
};

const plan = buildGithubTransportPlan({ repo: 'owner/repo' }, { workspaceConfig });
assert.deepEqual(plan.tiers, ['cache', 'mirror', 'proxy', 'direct'], 'configured source should prefer cache, mirror, proxy, direct');
assert.equal(plan.label, 'cache → mirror → proxy → direct');

const cache = Object.create(null);
const calls = [];
const directFetch = async (url) => {
  calls.push(url);
  return makeResponse('# cached document');
};
const first = createGithubTransportFetch({ id: 'gh', repo: 'owner/repo' }, { fetchImpl: directFetch, allowMirror: false, allowProxy: false, sourceCache: cache });
const firstRes = await first.fetch('https://raw.githubusercontent.com/owner/repo/main/.topics/a.md', {});
assert.equal(await firstRes.text(), '# cached document');
assert(calls.length === 1, 'first miss should call direct fallback');
const second = createGithubTransportFetch({ id: 'gh', repo: 'owner/repo' }, { fetchImpl: directFetch, allowMirror: false, allowProxy: false, sourceCache: cache });
const secondRes = await second.fetch('https://raw.githubusercontent.com/owner/repo/main/.topics/a.md', {});
assert.equal(await secondRes.text(), '# cached document');
assert.equal(calls.length, 1, 'second read should hit source cache before direct');
assert(second.events.some((event) => event.code === 'github.transport.cache.hit'), 'cache hit should be diagnosable');

cache['tiinex.source-cache.v1:api-json:https://api.github.com/repos/owner/repo/issues/1'] = { body: '{"number":1}', contentType: 'application/json' };
const clearedCount = clearGithubSourceTextCacheForSource({ repo: 'owner/repo' }, { sourceCache: cache });
assert.equal(clearedCount, 2, 'source cache should clear raw markdown and GitHub issue API entries for the matching repository');
const afterClear = createGithubTransportFetch({ id: 'gh', repo: 'owner/repo' }, { fetchImpl: directFetch, allowMirror: false, allowProxy: false, sourceCache: cache });
const afterClearRes = await afterClear.fetch('https://raw.githubusercontent.com/owner/repo/main/.topics/a.md', {});
assert.equal(await afterClearRes.text(), '# cached document');
assert.equal(calls.length, 2, 'cleared source cache should force a fresh direct fetch on next read');

const mirrorCalls = [];
const mirrorFetchImpl = async (url) => {
  mirrorCalls.push(url);
  return makeResponse('# mirror doc');
};
const directShouldNotRun = async () => {
  throw new Error('direct should not run after mirror hit');
};
const mirrorRuntime = createGithubTransportFetch({ id: 'gh', repo: 'owner/repo' }, { fetchImpl: directShouldNotRun, mirrorFetchImpl, allowProxy: false, sourceCache: Object.create(null) });
const mirrorRes = await mirrorRuntime.fetch('https://raw.githubusercontent.com/owner/repo/main/.topics/mirror.md', {});
assert.equal(await mirrorRes.text(), '# mirror doc');
assert.equal(mirrorCalls.length, 1, 'mirror tier should be attempted before direct');
assert(mirrorRuntime.events.some((event) => event.code === 'github.transport.mirror.ok'), 'mirror success should be diagnosable');

const proxyEvents = [];
const proxyRuntime = createGithubTransportFetch({ id: 'gh', repo: 'owner/repo' }, {
  fetchImpl: async () => makeResponse('# direct fallback'),
  workspaceConfig,
  sourceCache: Object.create(null),
  onTransportEvent: (event) => proxyEvents.push(event)
});
const proxyRes = await proxyRuntime.fetch('https://raw.githubusercontent.com/owner/repo/main/.topics/direct.md', {});
assert.equal(await proxyRes.text(), '# direct fallback');
assert(proxyEvents.some((event) => event.code === 'github.transport.proxy.configured-unavailable'), 'configured git proxy without raw reader must be explicit, not silently claimed');
assert(proxyEvents.some((event) => event.code === 'github.transport.direct.ok'), 'direct fallback should remain explicit');



const hydrated = hydrateGithubRecordFromSourceCache({
  id: 'source:gh:.topics/a.md',
  title: 'A',
  path: '.topics/a.md',
  sourceMode: 'source-backed',
  source: { id: 'gh', adapterId: 'github', repo: 'owner/repo', ref: 'main', rootPath: '.topics' }
}, { sourceCache: cache });
assert.equal(hydrated.markdown, '# cached document', 'source-backed record shells should hydrate readable Markdown from the source text cache');
assert.equal(hydrated.materialAvailability, 'available', 'cache-hydrated source record should become readable in detail/markdown views');

console.log('github transport ladder: ok');

const proxyOnlyEvents = [];
const proxyOnlyRuntime = createGithubTransportFetch({ id: 'gh', repo: 'owner/repo' }, {
  preferredTransports: ['proxy'],
  transportOrderExact: true,
  workspaceConfig,
  sourceCache: Object.create(null),
  onTransportEvent: (event) => proxyOnlyEvents.push(event),
  fetchImpl: async () => { throw new Error('direct must not run during explicit proxy-tier refresh'); }
});
const proxyOnlyRes = await proxyOnlyRuntime.fetch('https://raw.githubusercontent.com/owner/repo/main/.topics/proxy-only.md', {});
assert.equal(proxyOnlyRuntime.plan.label, 'proxy', 'explicit transport refresh should present the selected tier, not the whole ladder');
assert.equal(proxyOnlyRes.transportTier, 'none', 'unavailable explicit tier should degrade without falling through to direct');
assert(proxyOnlyEvents.some((event) => event.code === 'github.transport.proxy.configured-unavailable'), 'explicit proxy refresh should expose proxy unavailability');
assert(!proxyOnlyEvents.some((event) => String(event.code || '').includes('direct')), 'explicit proxy refresh must not silently fall through to direct');
