import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import { openWorkspaceEntrypointSet, mergeWorkspaceEntrypointSet } from '../workspaces/workspace.entrypointLifecycle.js';
import { materializeGithubIssueSurface } from '../adapters/github/github.issueSurface.js';
import { sourceTransportRefreshInputForSource } from '../app/sourceTransportRefresh.js';
import { declaredSchemaRecoveryTarget } from '../app/schemaSourceRecovery.js';
import { openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const route = globalThis.TiinexWorkspaceRoute;

// A. Creation and workspace-set insertion are append-based.
let state = lifecycle.makeEmptyAppState();
const a = lifecycle.createWorkspace(state, { id: 'a', name: 'A' });
const b = lifecycle.createWorkspace(a.state, { id: 'b', name: 'B' });
assert.deepEqual(b.state.workspaces.map((workspace) => workspace.title), ['A', 'B'], 'Create appends a new workspace to the right');
assert.equal(b.state.activeWorkspaceId, 'b', 'newly created workspace becomes focus');
const opened = openWorkspaceEntrypointSet({ lifecycle, state: b.state, sourceInputs: [
  { label: 'News', repository: 'Tiinex/site', rootPath: '.topics/news', repoDiscovery: true },
  { label: 'Documentation', repository: 'Tiinex/docs', rootPath: '.topics/docs', repoDiscovery: true }
] });
assert.deepEqual(opened.workspaces.map((workspace) => workspace.title), ['News', 'Documentation'], 'Open preserves declared entrypoint order with append-based creation');
assert.equal(opened.state.activeWorkspaceId, opened.workspaces[0].id, 'Open focuses first declared workspace');
const merged = mergeWorkspaceEntrypointSet({ lifecycle, state: a.state, sourceInputs: [
  { label: 'B', repository: 'owner/b', rootPath: '.topics', repoDiscovery: true },
  { label: 'C', repository: 'owner/c', rootPath: '.topics', repoDiscovery: true }
] });
assert.deepEqual(merged.state.workspaces.map((workspace) => workspace.title), ['A', 'B', 'C'], 'Merge appends missing declared workspaces in declared order');

// B. Broad issue discovery and exact issue targets are independent dimensions.
const explicitOnlySource = lifecycle.makeConfiguredSource({ repository: 'owner/repo', ref: 'main', rootPath: '.topics', issueDiscovery: false, issueUrls: 'https://github.com/owner/repo/issues/3' });
assert.equal(explicitOnlySource.issueDiscovery, false, 'explicit issue target must not silently enable broad issue discovery');
assert.equal(explicitOnlySource.requestedSurfaces.issueSnapshots.requested, true, 'explicit target still requests issue snapshot materialization surface');
const refresh = sourceTransportRefreshInputForSource(Object.assign({}, explicitOnlySource, { transportPlan: { configured: { cache: true, mirror: true, proxy: true, direct: true } }, surfaces: { issueSnapshots: { requested: true, loaded: 1, transportTier: 'cache' } } }), 'cache', ['issueSnapshots']);
assert.equal(refresh.ok, true);
assert.equal(refresh.input.issueDiscovery, false, 'refresh of explicit-only issue source must stay explicit-only');
assert.match(refresh.input.issueUrls, /issues\/3/, 'refresh preserves explicit issue target');
const explicitOnlyRouteSource = route.compactSource(explicitOnlySource);
assert.equal(explicitOnlyRouteSource.issueDiscovery, false, 'route/cache projection must preserve explicit-only issue discovery choice');
assert.match(explicitOnlyRouteSource.issueUrls, /issues\/3/, 'route/cache projection preserves exact issue targets independently of discovery');

const explicitOnlyCalls = [];
const explicitOnlyFetch = async (url) => {
  explicitOnlyCalls.push(String(url));
  const number = /\/issues\/(\d+)$/.exec(String(url))?.[1] || '0';
  return fetchJsonResponse({ number: Number(number), html_url: `https://github.com/owner/repo/issues/${number}`, title: `Issue ${number}`, state: 'open', body: `body ${number}`, user: { login: 'q' }, comments: 0 });
};

const issueCalls = [];
const fetchJsonResponse = (body) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body, text: async () => JSON.stringify(body), headers: { get: () => 'application/json' } });
const issueFetch = async (url) => {
  issueCalls.push(String(url));
  if (String(url).includes('/issues?')) return fetchJsonResponse([
    { number: 2, html_url: 'https://github.com/owner/repo/issues/2', title: 'Two', state: 'open', body: 'two', user: { login: 'q' }, comments: 0 },
    { number: 3, html_url: 'https://github.com/owner/repo/issues/3', title: 'Three', state: 'open', body: 'three', user: { login: 'q' }, comments: 0 }
  ]);
  const number = /\/issues\/(\d+)$/.exec(String(url))?.[1] || '0';
  return fetchJsonResponse({ number: Number(number), html_url: `https://github.com/owner/repo/issues/${number}`, title: `Issue ${number}`, state: 'open', body: `body ${number}`, user: { login: 'q' }, comments: 0 });
};
const explicitOnlyMaterialized = await materializeGithubIssueSurface({ id: 'github:owner/repo', repo: 'owner/repo' }, {
  issueDiscovery: false,
  issueUrls: 'https://github.com/owner/repo/issues/3'
}, { preferredTransports: ['proxy'], transportOrderExact: true, proxyFetchImpl: explicitOnlyFetch, sourceFetchImpl: explicitOnlyFetch, fetchImpl: explicitOnlyFetch, maxComments: 0 });
assert.equal(explicitOnlyMaterialized.records.length, 1, 'explicit-only issue source materializes its exact target');
assert.equal(explicitOnlyCalls.some((url) => url.includes('/issues?')), false, 'explicit-only issue source must not run broad issue discovery');
assert(explicitOnlyCalls.some((url) => /\/issues\/3$/.test(url)), 'explicit-only issue source fetches exact issue target');
assert.equal(explicitOnlyMaterialized.diagnostics.issueSnapshotTargets, 1, 'explicit-only issue source reports its exact target independently');

const broadPlusExplicit = await materializeGithubIssueSurface({ id: 'github:owner/repo', repo: 'owner/repo' }, {
  issueDiscovery: true,
  issueUrls: 'https://github.com/owner/repo/issues/3\nhttps://github.com/owner/repo/issues/4'
}, { preferredTransports: ['proxy'], transportOrderExact: true, proxyFetchImpl: issueFetch, sourceFetchImpl: issueFetch, fetchImpl: issueFetch, maxComments: 0 });
assert.equal(broadPlusExplicit.diagnostics.issueSnapshotDiscovery.discovered, 2, 'broad discovery runs even when explicit targets are present');
assert.equal(broadPlusExplicit.diagnostics.issueSnapshotDiscovery.explicitTargets, 2, 'explicit target count remains distinct from discovery count');
assert.equal(broadPlusExplicit.diagnostics.issueSnapshotDiscovery.unionTargets, 3, 'broad + explicit target union dedupes duplicate issue 3');
assert.equal(new Set(broadPlusExplicit.records.map((record) => record.snapshot?.target?.number).filter(Boolean)).size, 3, 'union materializes issues 2, 3 and 4 once each');

// D. Reading-contract recovery follows declared truth, never schema-name guessing.
const absoluteRecord = {
  id: 'feedback', path: '.topics/feedback.trace.md', schemaId: 'tiinex.decision.v1',
  markdown: '# Continuity Context\n\n- Current\n  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/main/.topics/.schemas/tiinex.decision.v1.schema.md)\n\n---\n\n# Feedback',
  source: { id: 'github:socials', adapterId: 'github', repo: 'Tiinusen/socials', ref: 'personal' }
};
const absoluteTarget = declaredSchemaRecoveryTarget(absoluteRecord, 'tiinex.decision.v1');
assert.equal(absoluteTarget.ok, true);
assert.equal(absoluteTarget.repo, 'Tiinex/docs', 'absolute declared schema link, not artifact origin repo, owns recovery target');
assert.equal(absoluteTarget.fetchUrl, 'https://raw.githubusercontent.com/Tiinex/docs/main/.topics/.schemas/tiinex.decision.v1.schema.md');
const localUnknown = declaredSchemaRecoveryTarget({ path: 'local.md', schemaId: 'tiinex.unknown.v1', markdown: '# Continuity Context\n\n- Current\n  - Current Schema: [tiinex.unknown.v1](tiinex.unknown.v1.schema.md)', source: { adapterId: 'local' } }, 'tiinex.unknown.v1');
assert.equal(localUnknown.ok, false, 'relative schema link without verified source context must not guess GitHub provenance');

let schemaState = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'schema-ws', name: 'Schema workspace' }).state;
const schemaWorkspace = lifecycle.activeWorkspace(schemaState);
schemaWorkspace.records = [absoluteRecord];
const recoveredSchema = await openSchemaForRecordCommand({
  state: schemaState, workspace: schemaWorkspace, record: absoluteRecord,
  catalog: {}, loadSchemaMarkdown: async () => null,
  fetchImpl: async (url) => ({ ok: String(url) === absoluteTarget.fetchUrl, status: 200, text: async () => '# Tiinex Decision v1 Schema\n\nReading contract.' }),
  clock: () => '2026-08-13T00:00:00.000Z'
});
assert.equal(recoveredSchema.ok, true, 'explicit declared schema target can recover a missing reading contract');
assert.equal(recoveredSchema.record.source.adapterId, 'github');
assert.equal(recoveredSchema.record.source.repo, 'Tiinex/docs');
assert.equal(recoveredSchema.record.schemaNavigation.source, 'declared-reading-contract-target');
const targetedSchemaSource = lifecycle.activeWorkspace(recoveredSchema.state).sources.find((source) => source.adapterId === 'github' && source.repo === 'Tiinex/docs');
assert(targetedSchemaSource, 'targeted schema recovery keeps truthful configured GitHub provenance on the workspace boundary');
assert.equal(targetedSchemaSource.repoDiscovery, false, 'targeted schema recovery must not enable broad repo discovery');
assert(targetedSchemaSource.explicitFileRefs.includes('.topics/.schemas/tiinex.decision.v1.schema.md'), 'targeted schema path is durable exact-source configuration');
assert.equal(recoveredSchema.record.source.id, targetedSchemaSource.id, 'schema record points at the shared configured source owner');
assert.match(recoveredSchema.record.sourceTarget?.browseUrl || '', /tiinex\.decision\.v1\.schema\.md$/, 'schema record retains exact Open source provenance');

// C/F. Product routing and dialog hierarchy are guarded at the actual source files.
const recordActionSource = readFileSync(new URL('../actions/record.actions.js', import.meta.url), 'utf8');
const recordCardSource = readFileSync(new URL('../schemas/workspace/workspace.cards.views.jsx', import.meta.url), 'utf8');
assert(recordActionSource.includes("id: RecordActionKind.source"), 'truthful source provenance remains a generic record action capability');
assert.equal(recordCardSource.includes('splitWorkspaceArtifactActionRows'), false, 'Workspace Artifact must not fork generic artifact actions into a provenance-specific renderer');
const addSource = readFileSync(new URL('../schemas/workspace/workspace.add.views.jsx', import.meta.url), 'utf8');
assert.equal(addSource.includes('onFocus={() => setIssueDiscovery(true)}'), false, 'explicit issue input focus must not auto-enable broad discovery');
assert.equal(addSource.includes('if (event.target.value.trim()) setIssueDiscovery(true)'), false, 'typing exact issue targets must not auto-enable broad discovery');
assert(addSource.includes('Discover broadly'), 'source dialog must separate broad discovery from explicit targets');
assert(addSource.includes('optional; exact targets are included independently of broad discovery'), 'explicit targets must disclose additive semantics');
assert(addSource.includes('Technical details'), 'transport internals are secondary technical details');
assert.equal(/['"`]Reload[^'"`]*selected surface/i.test(addSource), false, 'primary source CTA must not expose selected-surface implementation copy');

console.log('✓ M2 Q product-contract correction tests passed');
