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
const issueApi = 'https://api.github.com/repos/owner/repo/issues/1';
const issueCommentsApi = 'https://api.github.com/repos/owner/repo/issues/1/comments?per_page=6';
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
assert(issueLoaded.diagnostics.transportEvents.some((event) => event.url === issueApi && event.code === 'github.transport.direct.ok'), 'issue reader should use shared transport events');

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
  { fetchImpl: makeFetch(map, proxyIssueCalls), preferredTransports: ['proxy'], transportOrderExact: true }
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
  { fetchImpl: makeNativeResponseFetch(map, nativeProxyIssueCalls), preferredTransports: ['proxy'], transportOrderExact: true }
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
