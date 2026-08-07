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
    if (hit.buffer != null) {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: async () => toArrayBuffer(hit.buffer),
        json: async () => hit.json,
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
const issueApi = 'https://api.github.com/repos/owner/repo/issues/1';
const issueCommentsApi = 'https://api.github.com/repos/owner/repo/issues/1/comments?per_page=24';
const issueListApi = 'https://api.github.com/repos/owner/repo/issues?state=all&sort=updated&direction=desc&per_page=12';

const map = {
  [repoApi]: { json: { default_branch: 'main' } },
  [treeApi]: { json: { truncated: false, tree: [
    { type: 'blob', path: '.topics/a.md' },
    { type: 'blob', path: '.topics/nested/b.trace.md' },
    { type: 'blob', path: '.topics/image.png' },
    { type: 'blob', path: 'README.md' }
  ] } },
  [rawTopic]: { text: '# A\n\n![diagram](diagram.png)' },
  [rawNested]: { text: '# B\n\nBody' },
  [issueApi]: { json: { html_url: 'https://github.com/owner/repo/issues/1', number: 1, title: 'API issue', state: 'open', body: 'Issue body', user: { login: 'q' }, created_at: '2026-07-21T00:00:00.000Z', comments: 1 } },
  [issueCommentsApi]: { json: [{ user: { login: 'reviewer' }, body: 'Comment body' }] },
  [issueListApi]: { json: [{ html_url: 'https://github.com/owner/repo/issues/1', number: 1, title: 'API issue', state: 'open', body: 'Issue body', user: { login: 'q' }, created_at: '2026-07-21T00:00:00.000Z', comments: 0 }] }
};

const called = [];
const fetchImpl = makeFetch(map, called);
const source = { id: 'github:owner/repo:.topics', repo, ref: '', rootPath: '.topics' };

const resolved = await resolveGithubSourceRef(source, { fetchImpl });
assert.equal(resolved.ref, 'main', 'blank ref should resolve public default branch');

const discovered = await discoverGithubMarkdownRefs(source, { fetchImpl });
assert.deepEqual(discovered.refs, ['.topics/a.md', '.topics/nested/b.trace.md'], 'repo discovery should return only markdown under roots');
assert.equal(discovered.ref, 'main', 'discovery should return resolved ref');

const progressEvents = [];
const materialized = await materializeGithubSource(source, { repoDiscovery: true, fileRefs: [] }, { fetchImpl, onProgress: (event) => progressEvents.push(event) });
assert.equal(materialized.okCount, 2, 'repo discovery should load discovered markdown files');
assert.equal(materialized.failCount, 0, 'repo discovery should not fail for mapped files');
assert.equal(materialized.records.length, 2, 'records should be materialized');
assert(materialized.records.every((record) => !record.source), 'adapter must not assign lifecycle source provenance');
assert.equal(materialized.diagnostics.resolvedRef, 'main', 'adapter result should expose resolved ref');
assert.equal(materialized.diagnostics.requests, 2, 'raw materialization should count fetch requests');
assert.equal(materialized.diagnostics.surfaces.repoFiles.discovered, 2, 'repo surface should report discovered markdown count');
assert.equal(materialized.diagnostics.surfaces.repoFiles.loaded, 2, 'repo surface should report loaded markdown count');
assert(progressEvents.some((event) => event.phase === 'repo-discovery' && /Found 2 Markdown/.test(event.label || '')), 'repo discovery should emit a visible found-count progress event');
assert(progressEvents.some((event) => event.phase === 'raw-file-load' && event.total === 2), 'raw loading should emit concrete N/M progress');
assert.equal(materialized.diagnostics.assetReferences.counts['referenced-unloaded'], 1, 'adapter should report referenced-but-unloaded source assets without fetching binaries');
assert(materialized.warnings.some((warning) => warning.code === 'github.asset.referenced-unloaded'), 'referenced source assets should be surfaced as honest non-fetch warnings');

const workspaceTreeApi = 'https://api.github.com/repos/owner/workspaces/git/trees/main?recursive=1';
const workspaceRepoApi = 'https://api.github.com/repos/owner/workspaces';
const rawWorkspace = 'https://raw.githubusercontent.com/owner/workspaces/main/.topics/news.workspace.md';
const rawOrdinary = 'https://raw.githubusercontent.com/owner/workspaces/main/.topics/ordinary.md';
const workspaceFetch = makeFetch({
  [workspaceRepoApi]: { json: { default_branch: 'main' } },
  [workspaceTreeApi]: { json: { truncated: false, tree: [
    { type: 'blob', path: '.topics/news.workspace.md' },
    { type: 'blob', path: '.topics/ordinary.md' }
  ] } },
  [rawWorkspace]: { text: `# News

## Workspace Entrypoints

### News

- Repository: owner/news
` },
  [rawOrdinary]: { text: '# Ordinary' }
});
const workspaceDiscoveryOnly = await materializeGithubSource(
  { id: 'github:owner/workspaces:.topics', repo: 'owner/workspaces', ref: '', rootPath: '.topics', workspaceMatch: '*.workspace.md' },
  { repoDiscovery: true, fileRefs: [], workspaceMatch: '*.workspace.md' },
  { fetchImpl: workspaceFetch, allowCache: false }
);
assert.equal(workspaceDiscoveryOnly.records.length, 1, 'workspace discovery should materialize only matched workspace config files');
assert.equal(workspaceDiscoveryOnly.records[0].sourceTarget.inputTarget, '.topics/news.workspace.md');
assert.equal(workspaceDiscoveryOnly.diagnostics.surfaces.repoFiles.discovered, 1, 'workspace discovery count should reflect matched workspace configs, not all markdown');

const limitedFetch = makeFetch({
  [repoApi]: { json: { default_branch: 'main' } },
  [treeApi]: { ok: false, status: 403, statusText: 'Forbidden', json: { message: 'API rate limit exceeded' } }
});
const limited = await materializeGithubSource(source, { repoDiscovery: true, fileRefs: [] }, { fetchImpl: limitedFetch, allowCache: false });
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
  { fetchImpl: makeFetch(map, budgetCalled), maxRequestsPerOperation: 1, allowCache: false }
);
assert.equal(budgetLimited.records.length, 0, 'transport budget should block raw materialization before fetching');
assert.equal(budgetLimited.okCount, 0, 'budget-blocked materialization should not claim loaded records');
assert.equal(budgetLimited.failCount, 0, 'budget-blocked transport policy is degraded warning, not file failure');
assert.equal(budgetLimited.diagnostics.requests, 0, 'budget block must happen before raw fetch requests');
assert.equal(budgetCalled.length, 0, 'budget-blocked raw load must not call fetch');
assert(budgetLimited.warnings.some((warning) => warning.code === 'transport.policy.request-budget-exceeded'), 'budget warning must be surfaced');
assert(budgetLimited.diagnostics.transportEvents.some((event) => event.code === 'transport.policy.request-budget-exceeded'), 'budget warning must be a transport event');

const issueLoaded = await materializeGithubSource(source, { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' }, { fetchImpl });
assert.equal(issueLoaded.records.length, 1, 'explicit issue target should materialize through browser issue reader');
assert.equal(issueLoaded.records[0].kind, 'tiinex.evidence.v1', 'issue reader should create an Evidence snapshot record');
assert.equal(issueLoaded.records[0].summary, 'Issue body', 'issue reader should project issue body into the visible card summary');
assert(issueLoaded.records[0].markdown.includes('## Interpretation Limits'), 'issue reader should create schema-valid Evidence sections');
assert.equal(issueLoaded.diagnostics.issueSnapshotTargets, 1, 'issue targets should be parsed into diagnostics');
assert.equal(issueLoaded.diagnostics.surfaces.issueSnapshots.loaded, 1, 'issue surface should report loaded browser issue reader state');
assert.equal(issueLoaded.diagnostics.surfaces.repoFiles.loaded, 0, 'issue targets must not be attributed to repo files');
assert.equal(issueLoaded.diagnostics.recordAttribution[0].surface, 'issueSnapshots', 'issue targets must claim issueSnapshots attribution');
assert.equal(issueLoaded.diagnostics.sourcePlan.surfaces.issueSnapshots.requested, true, 'normalized source plan should preserve requested issue surface');
assert.equal(issueLoaded.diagnostics.sourcePlan.surfaces.issueSnapshots.attempted, true, 'normalized source plan should preserve attempted issue surface');
assert(issueLoaded.diagnostics.transportEvents.some((event) => event.url === issueApi && event.code === 'github.transport.proxy.ok'), 'default issue reader should expose GitHub API issue reads as the proxy tier');
assert(!issueLoaded.diagnostics.transportEvents.some((event) => event.url === issueApi && event.code === 'github.transport.direct.ok'), 'default issue reader must not label GitHub API reads as direct');

const issueUrlAsExplicitFile = await materializeGithubSource(source, { repoDiscovery: false, fileRefs: ['https://github.com/owner/repo/issues/1'], issueDiscovery: false, issueUrls: '' }, { fetchImpl });
assert.equal(issueUrlAsExplicitFile.okCount, 0, 'issue URL in explicit file surface must not become a repo file');
assert.equal(issueUrlAsExplicitFile.diagnostics.surfaces.repoFiles.loaded, 0, 'invalid explicit issue URL must not increment repo file surface');
assert.equal(issueUrlAsExplicitFile.diagnostics.surfaces.explicitFiles.failed, 1, 'invalid explicit issue URL should be owned by explicit files surface');
assert(issueUrlAsExplicitFile.errors.some((error) => error.surface === 'explicitFiles'), 'invalid explicit target should preserve owning surface');


const issueBudgetCalled = [];
const issueBudgetBlocked = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' },
  { fetchImpl: makeFetch(map, issueBudgetCalled), maxRequestsPerOperation: 1, allowCache: false }
);
assert.equal(issueBudgetBlocked.records.length, 0, 'transport budget should block explicit issue snapshot loading before fetching');
assert.equal(issueBudgetCalled.length, 0, 'budget-blocked issue snapshot load must not call GitHub API');
assert.equal(issueBudgetBlocked.diagnostics.surfaces.issueSnapshots.skipped, true, 'issue surface should report skipped when budget-blocked');
assert(issueBudgetBlocked.warnings.some((warning) => warning.code === 'transport.policy.request-budget-exceeded' && warning.surface === 'issueSnapshots'), 'issue budget warning must stay owned by issueSnapshots');

const repoWideIssueLoaded = await materializeGithubSource(source, { issueDiscovery: true, issueUrls: '' }, { fetchImpl });
assert.equal(repoWideIssueLoaded.records.length, 1, 'repo-wide issue discovery should materialize bounded public issue snapshots');
assert.equal(repoWideIssueLoaded.diagnostics.issueSnapshotDiscovery.discovered, 1, 'repo-wide issue discovery should report discovered targets');
assert.equal(repoWideIssueLoaded.diagnostics.surfaces.issueSnapshots.loaded, 1, 'issue surface should report loaded repo-wide issue snapshots');
assert.equal(repoWideIssueLoaded.diagnostics.transportOutcome.sequenceTier, 'proxy', 'repo-wide issue discovery via GitHub API should display proxy, not cache or direct');

const issueSnapshot = await materializeGithubSource(source, { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' }, { fetchImpl, issueSnapshotFixtures: { 'https://github.com/owner/repo/issues/1': { title: 'Fixture issue', state: 'open', body: 'Issue body', user: { login: 'q' }, created_at: '2026-07-21T00:00:00.000Z' } } });
assert.equal(issueSnapshot.records.length, 1, 'fixture-backed issue snapshot should materialize one evidence record');
assert.equal(issueSnapshot.records[0].kind, 'tiinex.evidence.v1', 'issue snapshot should become an evidence record');
assert.equal(issueSnapshot.records[0].source, undefined, 'adapter must not assign lifecycle source provenance to issue snapshots');



const progressSinkFailure = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: '' },
  { fetchImpl, onProgress: () => { throw new Error('progress sink failed'); } }
);
assert.equal(progressSinkFailure.records.length, 0, 'issue surface exceptions should not promote invalid records');
assert.equal(progressSinkFailure.errors.length, 0, 'issue surface exceptions should remain degraded warnings, not fatal adapter errors');
assert(progressSinkFailure.warnings.some((warning) => warning.code === 'github.issue.surface.exception'), 'issue surface exceptions should surface a retryable issue warning');
assert.equal(progressSinkFailure.diagnostics.sourcePlan.surfaces.issueSnapshots.requested, true, 'issue surface request must remain in diagnostics after degraded failure');
assert.equal(progressSinkFailure.diagnostics.sourcePlan.surfaces.issueSnapshots.unavailable, true, 'issue surface exception should be marked unavailable, not fatal');


console.log('✓ github.adapter tests passed');

const discoveryBudgetCalled = [];
const discoveryBudgetBlocked = await materializeGithubSource(
  { id: 'github:owner/repo', repo, ref: '', rootPath: '.topics' },
  { repoDiscovery: true, fileRefs: [] },
  { fetchImpl: makeFetch(map, discoveryBudgetCalled), maxRequestsPerOperation: 1, allowCache: false }
);
assert.equal(discoveryBudgetBlocked.records.length, 0, 'transport budget should block repo discovery before fetching');
assert.equal(discoveryBudgetBlocked.diagnostics.discoveryBlockedByPolicy, true, 'repo discovery policy block must be diagnosed');
assert.equal(discoveryBudgetCalled.length, 0, 'budget-blocked repo discovery must not call default-branch or tree fetch');
assert(discoveryBudgetBlocked.warnings.some((warning) => warning.code === 'transport.policy.request-budget-exceeded'), 'repo discovery budget warning must be surfaced');

const proxyIssueCalls = [];
const proxyIssueLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' },
  { fetchImpl: async () => { throw new Error('direct fetch must not run for configured proxy issue test'); }, proxyFetchImpl: makeFetch(map, proxyIssueCalls), preferredTransports: ['proxy'], transportOrderExact: true }
);
assert.equal(proxyIssueLoaded.records.length, 1, 'explicit proxy transport should read issue snapshots through the GitHub issue API tier');
assert(proxyIssueLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.transport.proxy.ok' && event.url === issueApi), 'proxy issue API success should be exposed as proxy transport evidence');
assert(!proxyIssueLoaded.diagnostics.transportEvents.some((event) => String(event.code || '').includes('direct')), 'explicit proxy issue refresh must not silently fall through to direct');


function makeNativeResponseFetch(map, called = []) {
  return async function fetchImpl(url) {
    called.push(url);
    const hit = map[url];
    if (!hit) return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404, statusText: 'Not Found', headers: { 'content-type': 'application/json' } });
    if (hit.ok === false) return new Response(JSON.stringify(hit.json || { message: hit.statusText || 'Error' }), { status: hit.status || 500, statusText: hit.statusText || 'Error', headers: { 'content-type': 'application/json' } });
    if (hit.text != null) return new Response(String(hit.text), { status: 200, statusText: 'OK', headers: { 'content-type': 'text/markdown; charset=utf-8' } });
    return new Response(JSON.stringify(hit.json || {}), { status: 200, statusText: 'OK', headers: { 'content-type': 'application/json' } });
  };
}

const nativeProxyIssueCalls = [];
const nativeProxyIssueLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' },
  { fetchImpl: async () => { throw new Error('direct fetch must not run for configured native proxy issue test'); }, proxyFetchImpl: makeNativeResponseFetch(map, nativeProxyIssueCalls), preferredTransports: ['proxy'], transportOrderExact: true }
);
assert.equal(nativeProxyIssueLoaded.records.length, 1, 'explicit proxy transport should work with native Fetch Response objects');
assert(nativeProxyIssueLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.transport.proxy.ok' && event.url === issueApi), 'native proxy issue API success should remain observable as proxy transport evidence');

const mirrorBase = 'https://viewer.example/';
const mirrorMetaUrl = 'https://viewer.example/issues/github.com/owner/repo.json';
const mirrorManifestUrl = 'https://viewer.example/issues/github.com/owner/repo/manifest.json';
const mirrorIssueJsonUrl = 'https://viewer.example/issues/github.com/owner/repo/issues/2/issue.json';
const mirrorIssueBodyUrl = 'https://viewer.example/issues/github.com/owner/repo/issues/2/issue.md';
const mirrorCommentJsonUrl = 'https://viewer.example/issues/github.com/owner/repo/issues/2/comments/200.json';
const mirrorCommentBodyUrl = 'https://viewer.example/issues/github.com/owner/repo/issues/2/comments/200.md';
const mirrorMap = {
  [mirrorMetaUrl]: { json: { type: 'tiinex.github.issues.snapshot', repo, directory: 'repo/', manifest: 'repo/manifest.json', generatedAt: '2026-07-24T00:00:00.000Z', sourceUpdatedAt: '2026-07-24T00:00:00.000Z' } },
  [mirrorManifestUrl]: { json: { type: 'tiinex.github.issues.snapshot.manifest.v1', repository: repo, issues: [{ number: 2, title: 'Mirror issue', state: 'open', updated_at: '2026-07-24T00:00:00.000Z', issue: 'issues/2/issue.json', body: 'issues/2/issue.md' }] } },
  [mirrorIssueJsonUrl]: { json: { html_url: 'https://github.com/owner/repo/issues/2', number: 2, title: 'Mirror issue', state: 'open', user: { login: 'mirror' }, created_at: '2026-07-24T00:00:00.000Z', comments: [{ id: 200, json: 'comments/200.json', path: 'comments/200.md', html_url: 'https://github.com/owner/repo/issues/2#issuecomment-200' }] } },
  [mirrorIssueBodyUrl]: { text: 'Mirror body from hosted snapshot' },
  [mirrorCommentJsonUrl]: { json: { id: 200, user: { login: 'commenter' }, html_url: 'https://github.com/owner/repo/issues/2#issuecomment-200' } },
  [mirrorCommentBodyUrl]: { text: 'Mirror comment from hosted snapshot' }
};
const mirrorIssueCalls = [];
const mirrorIssueLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: '' },
  { fetchImpl: makeFetch(mirrorMap, mirrorIssueCalls), preferredTransports: ['mirror'], transportOrderExact: true, hostedIssueSnapshotBaseUrls: [mirrorBase] }
);
assert.equal(mirrorIssueLoaded.records.length, 1, 'explicit mirror transport should read hosted issue snapshots');
assert.equal(mirrorIssueLoaded.records[0].summary, 'Mirror body from hosted snapshot', 'mirror issue snapshot body should become card summary');
assert(mirrorIssueLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.transport.mirror.ok' && event.url === mirrorMetaUrl), 'mirror metadata fetch should be exposed as mirror transport evidence');
assert(!mirrorIssueCalls.some((url) => url.includes('api.github.com')), 'explicit mirror issue refresh must not call live GitHub API');

const mirrorPartialCommentCalls = [];
const mirrorPartialCommentLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: '' },
  {
    fetchImpl: makeFetch(Object.assign({}, mirrorMap, { [mirrorCommentBodyUrl]: { ok: false, status: 404, statusText: 'Not Found', json: { message: 'missing comment body' } } }), mirrorPartialCommentCalls),
    preferredTransports: ['mirror'],
    transportOrderExact: true,
    hostedIssueSnapshotBaseUrls: [mirrorBase]
  }
);
assert.equal(mirrorPartialCommentLoaded.records.length, 1, 'mirror issue body should still materialize when one hosted comment payload is unavailable');
assert(mirrorPartialCommentLoaded.warnings.some((warning) => warning.code === 'github.issue.mirror.comment-fetch-failed'), 'mirror comment fetch degradation should be explicit');
assert.equal(mirrorPartialCommentLoaded.diagnostics.issueSnapshotMaterialization.loadedTargets, 1, 'mirror target diagnostics should count the issue target loaded despite partial comments');


const nativeMirrorIssueCalls = [];
const nativeMirrorIssueLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: '' },
  { fetchImpl: makeNativeResponseFetch(mirrorMap, nativeMirrorIssueCalls), preferredTransports: ['mirror'], transportOrderExact: true, hostedIssueSnapshotBaseUrls: [mirrorBase] }
);
assert.equal(nativeMirrorIssueLoaded.records.length, 1, 'explicit mirror transport should work with native Fetch Response objects');
assert.equal(nativeMirrorIssueLoaded.records[0].summary, 'Mirror body from hosted snapshot', 'native mirror issue snapshot body should become card summary');
assert(nativeMirrorIssueLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.transport.mirror.ok' && event.url === mirrorMetaUrl), 'native mirror metadata success should remain observable as mirror transport evidence');

const defaultMirrorIssueCalls = [];
const defaultMirrorIssueLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: '' },
  { fetchImpl: makeFetch(mirrorMap, defaultMirrorIssueCalls), hostedIssueSnapshotBaseUrls: [mirrorBase] }
);
assert.equal(defaultMirrorIssueLoaded.records.length, 1, 'default issue materialization should try hosted mirror before live API');
assert(defaultMirrorIssueLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.transport.cache.hit' && event.url === mirrorMetaUrl), 'default issue materialization should restore from Tiinex source cache after a hosted mirror load');
assert(!defaultMirrorIssueCalls.some((url) => url.includes('api.github.com')), 'source-cache issue restore should not call live GitHub API during default issue loading');
assert.equal(defaultMirrorIssueLoaded.diagnostics.transportOutcome.sequenceTier, 'cache', 'source-cache issue restore should make cache the visible transport tier after F5/route restore');


const directDiscoveryCalls = [];
const directDiscoveryOnly = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: '' },
  { fetchImpl: makeFetch(map, directDiscoveryCalls), preferredTransports: ['direct'], transportOrderExact: true }
);
assert.equal(directDiscoveryOnly.records.length, 0, 'direct issue transport must not perform repository-wide issue discovery');
assert.equal(directDiscoveryCalls.length, 0, 'direct issue discovery must not call GitHub API or raw URLs without explicit targets');
assert(directDiscoveryOnly.warnings.some((warning) => warning.code === 'github.issue.direct.discovery-unavailable'), 'direct issue discovery should explain that explicit issue URLs are required');

const directIssuePage = 'https://github.com/owner/repo/issues/1';
const directExplicitCalls = [];
const directExplicitLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: directIssuePage },
  { fetchImpl: makeFetch({ [directIssuePage]: { text: 'Direct raw issue body' } }, directExplicitCalls), preferredTransports: ['direct'], transportOrderExact: true }
);
assert.equal(directExplicitLoaded.records.length, 1, 'direct issue transport may read explicitly provided issue URLs as raw/browser-readable material');
assert(directExplicitCalls.includes(directIssuePage), 'direct explicit issue load should fetch the canonical issue URL');
assert(!directExplicitCalls.some((url) => url.includes('api.github.com')), 'direct explicit issue load must not call GitHub API');
assert.equal(directExplicitLoaded.diagnostics.transportOutcome.sequenceTier, 'direct', 'direct explicit issue load should leave the visible transport sequence at direct');

const directStaticIssueUrl = 'https://viewer.example/issues/github.com/owner/repo/issues/4/issue.md';
const directStaticCalls = [];
const directStaticLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: directStaticIssueUrl },
  { fetchImpl: makeFetch({ [directStaticIssueUrl]: { text: 'Direct static issue body' } }, directStaticCalls), preferredTransports: ['direct'], transportOrderExact: true }
);
assert.equal(directStaticLoaded.records.length, 1, 'direct issue transport may read browser-readable static issue snapshot URLs');
assert(directStaticCalls.includes(directStaticIssueUrl), 'direct static issue load should fetch the literal static URL');
assert(!directStaticCalls.some((url) => url.includes('api.github.com')), 'direct static issue load must not call GitHub API');

const mirrorIssueFallbackCalls = [];
const mirrorIssueFallbackLoaded = await materializeGithubSource(
  source,
  { issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1' },
  { fetchImpl: makeFetch(map, mirrorIssueFallbackCalls), preferredTransports: ['mirror'], transportOrderExact: true, hostedIssueSnapshotBaseUrls: ['https://viewer.example/missing/'] }
);
assert.equal(mirrorIssueFallbackLoaded.records.length, 1, 'issue snapshots should fall back from hosted mirror to the next issue transport');
assert(mirrorIssueFallbackLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.issue.transport.surface-fallback'), 'issue surface fallback must be diagnosable');
assert(mirrorIssueFallbackLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.transport.proxy.ok' && event.url === issueApi), 'fallback issue load should expose GitHub issue API as proxy after hosted mirror is unavailable');
assert(!mirrorIssueFallbackLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.transport.direct.ok' && String(event.url || '').includes('api.github.com')), 'issue direct tier must not call GitHub API during mirror fallback');


const repoMirrorRepo = 'mirror-owner/mirror-repo';
const repoMirrorSource = { id: 'github:mirror-owner/mirror-repo:.topics', repo: repoMirrorRepo, ref: '', rootPath: '.topics' };
const repoMirrorMetaUrl = 'https://viewer.example/mirrors/github.com/mirror-owner/mirror-repo.json';
const repoMirrorArchiveUrl = 'https://viewer.example/mirrors/github.com/mirror-owner/mirror/repo.zip';
const repoMirrorZip = storedZip([
  { name: 'mirror-repo-main/.topics/mirror.md', data: '# Repo Mirror\n\nMirror file body' },
  { name: 'mirror-repo-main/README.md', data: '# Ignored' }
]);
const repoMirrorCalls = [];
const repoMirrorLoaded = await materializeGithubSource(
  repoMirrorSource,
  { repoDiscovery: true, fileRefs: [] },
  {
    fetchImpl: makeFetch({
      [repoMirrorMetaUrl]: { json: { type: 'tiinex.repository.snapshot', repository: repoMirrorRepo, commit: 'abc123', archive: 'mirror/repo.zip' } },
      [repoMirrorArchiveUrl]: { buffer: repoMirrorZip }
    }, repoMirrorCalls),
    preferredTransports: ['mirror'],
    transportOrderExact: true,
    hostedRepoMirrorBaseUrls: [mirrorBase]
  }
);
assert.equal(repoMirrorLoaded.records.length, 1, 'explicit repo-file mirror transport should read hosted repository snapshot archives');
assert.equal(repoMirrorLoaded.records[0].path, 'https://raw.githubusercontent.com/mirror-owner/mirror-repo/abc123/.topics/mirror.md', 'repo mirror records should preserve source raw URL path identity');
assert.equal(repoMirrorLoaded.records[0].sourceTarget.transportTier, 'mirror', 'repo mirror records should disclose mirror transport');
assert(!repoMirrorCalls.some((url) => url.includes('api.github.com')), 'repo mirror transport must not call GitHub API tree discovery');
assert.equal(repoMirrorLoaded.diagnostics.surfaces.repoFiles.transportTier, 'mirror', 'repo mirror success should set repoFiles surface transport to mirror');

const repoCacheCalls = [];
const repoCacheLoaded = await materializeGithubSource(
  Object.assign({}, repoMirrorSource, { ref: 'abc123' }),
  { repoDiscovery: true, fileRefs: [] },
  { fetchImpl: makeFetch({}, repoCacheCalls), hostedRepoMirrorBaseUrls: [mirrorBase] }
);
assert.equal(repoCacheLoaded.records.length, 1, 'repo-file source cache should restore after a mirror load without network materialization');
assert.equal(repoCacheLoaded.records[0].sourceTarget.transportTier, 'cache', 'repo-file source-cache restore should disclose cache transport');
assert.equal(repoCacheCalls.length, 0, 'repo-file cache restore should not call mirror, proxy, direct, or GitHub API');
assert.equal(repoCacheLoaded.diagnostics.surfaces.repoFiles.transportTier, 'cache', 'repo-file cache restore should set repoFiles surface transport to cache');

const repoNoCacheCalls = [];
const repoNoCacheLoaded = await materializeGithubSource(
  Object.assign({}, repoMirrorSource, { ref: 'abc123' }),
  { repoDiscovery: true, fileRefs: [] },
  {
    fetchImpl: makeFetch({
      [repoMirrorMetaUrl]: { json: { type: 'tiinex.repository.snapshot', repository: repoMirrorRepo, commit: 'abc123', archive: 'mirror/repo.zip' } },
      [repoMirrorArchiveUrl]: { buffer: repoMirrorZip }
    }, repoNoCacheCalls),
    hostedRepoMirrorBaseUrls: [mirrorBase],
    allowCache: false
  }
);
assert.equal(repoNoCacheLoaded.records.length, 1, 'user/material reload should bypass source-cache when allowCache is false');
assert(repoNoCacheCalls.some((url) => url === repoMirrorMetaUrl), 'allowCache=false should try mirror instead of serving repo files from cache');

const repoCaseMirrorCalls = [];
const repoCaseMirrorLoaded = await materializeGithubSource(
  { id: 'github:Tiinex/docs:.topics', repo: 'Tiinex/docs', ref: '', rootPath: '.topics' },
  { repoDiscovery: true, fileRefs: [] },
  {
    fetchImpl: makeFetch({
      ['https://viewer.example/mirrors/github.com/Tiinex/docs.json']: { json: { type: 'tiinex.repository.snapshot', repository: 'Tiinex/docs', commit: 'case123', archive: 'case.zip' } },
      ['https://viewer.example/mirrors/github.com/Tiinex/case.zip']: { buffer: repoMirrorZip }
    }, repoCaseMirrorCalls),
    preferredTransports: ['mirror'],
    transportOrderExact: true,
    hostedRepoMirrorBaseUrls: [mirrorBase]
  }
);
assert.equal(repoCaseMirrorLoaded.records.length, 1, 'repo-file mirror should try case-preserving Tiinex/docs metadata before lowercase fallback');
assert(repoCaseMirrorCalls.some((url) => url === 'https://viewer.example/mirrors/github.com/Tiinex/docs.json'), 'case-preserving repository mirror URL should be attempted');

const repoProxyCalls = [];
const repoProxyExact = await materializeGithubSource(
  repoMirrorSource,
  { repoDiscovery: true, fileRefs: [] },
  { fetchImpl: makeFetch(map, repoProxyCalls), preferredTransports: ['proxy'], transportOrderExact: true }
);
assert.equal(repoProxyExact.records.length, 0, 'repo-file proxy should not silently fall through to direct when the browser Git runtime is unavailable');
assert.equal(repoProxyCalls.length, 0, 'repo-file proxy unavailable should not call GitHub API through direct fetch');
assert(repoProxyExact.warnings.some((warning) => warning.code === 'github.repo.proxy.unavailable'), 'repo-file proxy unavailability should be explicit');

const fakeGitProxyRuntime = {
  acquireSnapshot: async (options = {}) => ({
    ok: true,
    repo: options.repo,
    ref: 'main',
    commit: 'def456',
    networkOperation: 'git-proxy-snapshot',
    networkOperationSucceeded: true,
    candidates: ['.topics/proxy.md', 'README.md']
  }),
  ensureRuntime: async () => ({ ok: true }),
  readGitText: async (_runtime, path) => (path === '.topics/proxy.md' ? '# Repo Proxy\n\nProxy file body' : '')
};
const repoProxyLoaded = await materializeGithubSource(
  repoMirrorSource,
  { repoDiscovery: true, fileRefs: [] },
  {
    fetchImpl: async () => { throw new Error('direct fetch must not run for repo-file proxy'); },
    gitNativeRuntime: fakeGitProxyRuntime,
    workspaceConfig: { repositoryTransports: [{ kind: 'git-proxy', match: 'github.com/*', proxy: 'https://cors.isomorphic-git.org' }] },
    preferredTransports: ['proxy'],
    transportOrderExact: true
  }
);
assert.equal(repoProxyLoaded.records.length, 1, 'repo-file proxy should materialize Markdown through the browser Git runtime when configured');
assert.equal(repoProxyLoaded.records[0].sourceTarget.transportTier, 'proxy', 'repo-file proxy records should disclose proxy transport');
assert.equal(repoProxyLoaded.diagnostics.surfaces.repoFiles.transportTier, 'proxy', 'repo-file proxy success should set repoFiles surface transport to proxy');
assert(repoProxyLoaded.diagnostics.transportEvents.some((event) => event.code === 'github.repo.proxy.ok'), 'repo-file proxy success should be diagnosable');

const abortController = new AbortController();
abortController.abort(new DOMException('user advanced transport', 'AbortError'));
let abortedRuntimeSawSignal = false;
const abortAwareGitProxyRuntime = {
  acquireSnapshot: async (options = {}) => {
    abortedRuntimeSawSignal = Boolean(options.transportSignal?.aborted);
    throw options.transportSignal?.reason || new DOMException('transport aborted', 'AbortError');
  },
  ensureRuntime: async () => { throw new Error('aborted proxy must not continue to ensureRuntime'); },
  readGitText: async () => ''
};
const repoProxyAborted = await materializeGithubSource(
  repoMirrorSource,
  { repoDiscovery: true, fileRefs: [] },
  {
    gitNativeRuntime: abortAwareGitProxyRuntime,
    workspaceConfig: { repositoryTransports: [{ kind: 'git-proxy', match: 'github.com/*', proxy: 'https://cors.isomorphic-git.org' }] },
    preferredTransports: ['proxy'],
    transportOrderExact: true,
    abortSignal: abortController.signal
  }
);
assert.equal(abortedRuntimeSawSignal, true, 'repo proxy runtime should receive the active operation abort signal');
assert(repoProxyAborted.warnings.some((warning) => warning.code === 'github.repo.proxy.aborted'), 'aborted repo proxy transport should be diagnosable and non-committing');

let slowRuntimeOptions = null;
const slowPolicyRuntime = {
  acquireSnapshot: async (options = {}) => { slowRuntimeOptions = options; return { ok: false, error: 'stop after capture' }; },
  ensureRuntime: async () => ({ ok: true }),
  readGitText: async () => ''
};
await materializeGithubSource(
  repoMirrorSource,
  { repoDiscovery: true, fileRefs: [] },
  {
    gitNativeRuntime: slowPolicyRuntime,
    workspaceConfig: { repositoryTransports: [{ kind: 'git-proxy', match: 'github.com/*', proxy: 'https://cors.isomorphic-git.org' }] },
    preferredTransports: ['proxy'],
    transportOrderExact: true,
    repoProxyTimeoutMs: 9000
  }
);
assert.equal(slowRuntimeOptions.maxNetworkDurationMs, 9000, 'repo proxy should pass a hard network budget into the browser Git runtime');
assert.equal(slowRuntimeOptions.reloadRuntime, true, 'repo proxy should refresh the runtime wrapper so abort signals do not get trapped in a stale cached http client');
assert(slowRuntimeOptions.minBytesPerSecond >= 8192, 'repo proxy should pass a low-throughput floor into the browser Git runtime');

const repoDirectCalls = [];
const repoDirectLoaded = await materializeGithubSource(
  source,
  { repoDiscovery: true, fileRefs: [] },
  { fetchImpl: makeFetch(map, repoDirectCalls), preferredTransports: ['direct'], transportOrderExact: true }
);
assert.equal(repoDirectLoaded.records.length, 2, 'repo-file direct transport should use GitHub tree/raw fallback when direct is explicitly selected');
assert(repoDirectCalls.some((url) => url === treeApi), 'repo-file direct transport should perform tree discovery only at direct tier');
assert(repoDirectLoaded.records.every((record) => record.sourceTarget?.transportTier === 'direct'), 'repo-file direct records should disclose direct raw/API transport');

function toArrayBuffer(value) {
  const buffer = value instanceof Uint8Array ? value : Buffer.from(value);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function storedZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.from(entry.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
