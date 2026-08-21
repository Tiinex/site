import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';
import { loadFullLineageCommand } from '../app/lineageCommand.js';
import { runInitialWorkspaceBootstrapOperation } from '../app/initialWorkspaceBootstrapOperation.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';

await import('../workspaces/workspace.config.js');
await import('../workspaces/workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

// 1. Workspace-scoped schema navigation + compatible exact-target source coalescing.
let state = lifecycle.makeEmptyAppState();
let a = lifecycle.createWorkspace(state, { name: 'A' }); state = a.state;
let b = lifecycle.createWorkspace(state, { name: 'B' }); state = b.state;
const workspaceA = state.workspaces.find((workspace) => workspace.id === a.workspace.id);
const workspaceB = state.workspaces.find((workspace) => workspace.id === b.workspace.id);
workspaceA.records = [localArtifact('a-topic', 'A topic', 'tiinex.topic.v1')];
const schemaTargets = ['tiinex.topic.v1', 'tiinex.task.v1', 'tiinex.evidence.v1'];
workspaceB.records = schemaTargets.map((schemaId, index) => schemaDeclaringArtifact(`b-${index}`, `B ${index}`, schemaId));
state.activeWorkspaceId = workspaceA.id;
state.view = { universe: 'column', workspaceVerse: 'feed', query: 'a-query', selectedRecordId: 'a-topic', layoutMode: 'expanded' };
state.workspaceViews = {
  [workspaceA.id]: { ...state.view },
  [workspaceB.id]: { universe: 'column', workspaceVerse: 'tree', query: 'b-query', selectedRecordId: 'b-0', layoutMode: 'compact' }
};
const originalAView = JSON.parse(JSON.stringify(state.workspaceViews[workspaceA.id]));
const schemaFetches = [];
for (let index = 0; index < schemaTargets.length; index += 1) {
  const schemaId = schemaTargets[index];
  const currentB = state.workspaces.find((workspace) => workspace.id === workspaceB.id);
  const declaring = currentB.records.find((record) => record.id === `b-${index}`);
  const opened = await openSchemaForRecordCommand({
    state, workspace: currentB, record: declaring, schemaId,
    fetchImpl: async (url) => { schemaFetches.push(String(url)); return responseText(schemaMarkdown(schemaId)); },
    clock: () => `2026-08-14T00:0${index}:00.000Z`
  });
  assert.equal(opened.ok, true, opened.error);
  state = opened.state;
  assert.deepEqual(state.workspaceViews[workspaceA.id], originalAView, 'schema navigation in B must not mutate workspace A presentation');
  assert.equal(state.workspaceViews[workspaceB.id].workspaceVerse, 'lineage', 'schema navigation is owned by canonical workspaceViews[B]');
  assert.equal(state.workspaceViews[workspaceB.id].selectedRecordId, opened.record.id, 'canonical workspace view selects the recovered schema');
  assert.equal(state.view.selectedRecordId, opened.record.id, 'active legacy mirror follows the canonical active workspace view rather than owning it');
}
const schemaWorkspace = state.workspaces.find((workspace) => workspace.id === workspaceB.id);
const docsSources = schemaWorkspace.sources.filter((source) => String(source.repo || source.repository || '').toLowerCase() === 'tiinex/docs');
assert.equal(docsSources.length, 1, 'compatible targeted schema reads coalesce into one Tiinex/docs configured source');
assert.equal(docsSources[0].repoDiscovery, false, 'targeted schema recovery must not enable broad repo discovery');
assert.deepEqual(new Set(docsSources[0].explicitFileRefs), new Set(schemaTargets.map((schemaId) => `.topics/.schemas/${schemaId}.schema.md`)), 'one source plan owns all recovered exact schema targets');
const schemaRecords = schemaWorkspace.records.filter((record) => record.schemaNavigation?.reason === 'reading-contract-badge');
assert.equal(schemaRecords.length, 3);
assert(schemaRecords.every((record) => record.source.id === docsSources[0].id), 'recovered schemas share one canonical source owner');
assert(schemaRecords.every((record) => /github\.com\/Tiinex\/docs\/blob\/main\//.test(record.sourceTarget?.browseUrl || '')), 'each schema record keeps exact Open source provenance');
assert.equal(schemaFetches.length, 3);

// 2. Exact-known-but-unloaded parent identity must become recoverable missing truth, not weak ambiguity.
const docsSource = { id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'main', rootPath: '.topics', sourceBacked: true, transportRefreshTier: 'direct' };
const weakPath = '.topics/.github/tiinex/docs/.issues/9/comment-003-4881782365-recovered-continuity-context.trace.md';
const weakA = lineageArtifact({ id: 'weak-a', title: 'Weak A', path: weakPath, source: docsSource });
const weakB = lineageArtifact({ id: 'weak-b', title: 'Weak B', path: weakPath, source: docsSource });
const rewatch = lineageArtifact({
  id: 're-watch', title: 'Re-watch Silicon Valley',
  path: '.topics/.github/tiinex/docs/.issues/9/comment-004-4930310346-recovered-re-watch-silicon-valley.trace.md',
  trace: 'comment-003-4881782365-recovered-continuity-context.trace.md', source: docsSource,
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4930310346', parentSourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365', parentRawUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365', parentArtifactPath: '.topics/.github/tiinex/docs/.issues/9/comment-002-4881782365-recovered-silicon-valley.trace.md' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4930310346', parentSourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365', parentRawUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365', parentArtifactPath: '.topics/.github/tiinex/docs/.issues/9/comment-002-4881782365-recovered-silicon-valley.trace.md' }
});
let lineageState = lifecycle.makeEmptyAppState();
const lineageCreated = lifecycle.createWorkspace(lineageState, { name: 'Lineage recovery' }); lineageState = lineageCreated.state;
let lineageWorkspace = lifecycle.activeWorkspace(lineageState);
lineageWorkspace.sources = [docsSource];
lineageWorkspace.records = [weakA, weakB, rewatch];
const beforeRecovery = buildWorkspaceLineageView(lineageWorkspace, { selectedRecordId: rewatch.id });
assert.equal(beforeRecovery.selectedTraversal.ambiguous, false, 'strong exact unloaded parent identity must suppress weaker path ambiguity');
assert.equal(beforeRecovery.selectedTraversal.hasMissing, true, 'known exact parent that is not loaded remains a recoverable missing edge');
assert.equal(beforeRecovery.selectedTraversal.missingEdges[0].target, 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365');
const lineageCalls = [];
const loadedLineage = await loadFullLineageCommand({
  lifecycle, state: lineageState, workspace: lineageWorkspace, selectedRecordId: rewatch.id,
  fetchImpl: async (url) => lineageFetch(url, lineageCalls),
  workspaceConfig: {}, clock: () => '2026-08-14T00:10:00.000Z'
});
assert.equal(loadedLineage.ok, true, loadedLineage.error);
assert.deepEqual(loadedLineage.lineage.selectedTraversal.nodes.map((node) => node.title), ['Re-watch Silicon Valley', 'Silicon Valley', 'Welcome to the Next Dimension'], 'actual Load full lineage path recovers the public three-node chain from exact parent evidence');
assert.equal(loadedLineage.lineageLoadReport.rootReached, true);
assert.equal(loadedLineage.lineageLoadReport.ambiguous, false);
assert(loadedLineage.recoveredParents >= 2, 'missing strong parent material is source-recovered rather than assumed preloaded');
assert(lineageCalls.includes('https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365'), 'exact declared parent comment target is fetched');
assert(lineageCalls.includes('https://github.com/Tiinex/docs/issues/9'), 'issue root is fetched as lineage continues');

// Genuine ambiguity remains negative proof.
const weakChild = lineageArtifact({ id: 'weak-child', title: 'Weak child', path: '.topics/weak-child.trace.md', trace: 'comment-003-4881782365-recovered-continuity-context.trace.md', source: docsSource });
const weakView = buildWorkspaceLineageView({ id: 'weak', records: [weakA, weakB, weakChild] }, { selectedRecordId: weakChild.id });
assert.equal(weakView.selectedTraversal.ambiguous, true);

// 3. Real startup chain: discovery workspace artifact -> parse entrypoints -> Open-On-Apply workspace set.
const startupMaterializations = [];
let startupCommitted = null;
const startupResult = await runInitialWorkspaceBootstrapOperation({
  runtimeApi: { lifecycle, persistence: { hydrateWorkspaceWithLocalDeltas: (sourceState) => sourceState, augmentStartupStateWithLocalRecovery: (sourceState) => sourceState }, config: globalThis.TiinexWorkspaceConfig },
  state: lifecycle.makeEmptyAppState(), storage: {}, locationLike: { href: 'https://tiinex.dev/', search: '' }, windowObj: {}, workspaceConfig: {},
  resolveStartupInput: async () => ({
    ok: true, startupClass: 'hosted-config', selectedPlan: 'workspace-discovery', configUrl: 'https://tiinex.dev/tiinex.workspace.md', targetUrl: 'https://tiinex.dev/',
    config: { viewerIdentity: { browserTitle: 'Tiinex' } },
    input: { repository: 'Tiinex/docs', label: 'Tiinex Viewer', rootPath: '.topics', repoDiscovery: true, issueDiscovery: false, workspaceMatch: 'tiinex-viewer.workspace.md', appConfigPlan: 'workspace-discovery', preferredDisplay: 'workspace-artifacts' },
    inputs: [{ repository: 'Tiinex/docs', label: 'Tiinex Viewer', rootPath: '.topics', repoDiscovery: true, issueDiscovery: false, workspaceMatch: 'tiinex-viewer.workspace.md', appConfigPlan: 'workspace-discovery', preferredDisplay: 'workspace-artifacts' }],
    diagnostics: { selectedConvention: 'workspace-discovery' }
  }),
  commit: (next) => { startupCommitted = next; },
  materializeSource: async (input, options = {}) => {
    startupMaterializations.push({ label: input.workspaceLabel || input.label, plan: input.appConfigPlan || '', workspaceId: options.workspaceId });
    if (input.appConfigPlan === 'workspace-discovery') {
      const record = Object.assign(createRecordFromMarkdown(startupWorkspaceMarkdown(), { path: '.topics/tiinex-viewer.workspace.md', sourceMode: 'source-backed-workspace-file' }), {
        id: 'workspace-record:tiinex-viewer', title: 'Tiinex Viewer', path: '.topics/tiinex-viewer.workspace.md', kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1',
        source: { id: 'github:tiinex/docs', adapterId: 'github', sourceKind: 'github.repo', repo: 'Tiinex/docs', ref: 'main', rootPath: '.topics', sourceBacked: true },
        workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true }
      });
      const registered = lifecycle.addWorkspaceSource(options.state, options.workspaceId, Object.assign({}, input, { repo: input.repository, discoveryState: 'loaded' }));
      const sourceId = registered.source?.id || 'github:tiinex/docs';
      const inserted = lifecycle.addWorkspaceSourceRecords(registered.state, options.workspaceId, sourceId, [record]);
      return { state: inserted.state };
    }
    return { state: options.state };
  }
});
assert.equal(startupResult.ok, true, startupResult.error);
assert.equal(startupResult.selected, 'hosted-config-workspace-artifact-applied', 'startup applies the discovered workspace descriptor instead of stopping on its card');
assert.deepEqual(startupResult.state.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'Open-On-Apply entrypoints become the first useful workspace set');
assert.deepEqual(startupMaterializations.map((item) => item.label), ['Tiinex Viewer', 'News', 'Documentation'], 'real startup chain materializes descriptor first, then every declared workspace entrypoint');
assert(!startupResult.state.workspaces.some((workspace) => workspace.name === 'Tiinex Viewer'), 'intermediary discovery shell is not left for human manual Open');
assert.deepEqual(startupCommitted.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'final startup commit exposes the applied workspace set');

console.log('✓ bounded cross-owner PoC parity recovery tranche tests passed');

function localArtifact(id, title, schemaId) {
  return Object.assign(createRecordFromMarkdown(`# Continuity Context\n\n- Current\n  - Current Schema: [${schemaId}](${schemaId}.schema.md)\n  - Summary: ${title}\n\n---\n\n# ${title}`, { path: `${id}.trace.md`, sourceMode: 'archive-local' }), { id, title, source: { id: 'local', adapterId: 'local', sourceKind: 'local.session' } });
}
function schemaDeclaringArtifact(id, title, schemaId) {
  const href = `https://github.com/Tiinex/docs/blob/main/.topics/.schemas/${schemaId}.schema.md`;
  return Object.assign(createRecordFromMarkdown(`# Continuity Context\n\n- Current\n  - Current Schema: [${schemaId}](${href})\n  - Summary: ${title}\n\n---\n\n# ${title}`, { path: `.topics/${id}.trace.md`, sourceMode: 'source-backed' }), { id, title, source: { id: 'github:other/repo', adapterId: 'github', sourceKind: 'github.repo', repo: 'other/repo', ref: 'main', rootPath: '.topics', sourceBacked: true } });
}
function schemaMarkdown(schemaId) {
  const paths = {
    'tiinex.topic.v1': '../schemas/core/topic/tiinex.topic.v1.schema.md',
    'tiinex.task.v1': '../schemas/core/task/tiinex.task.v1.schema.md',
    'tiinex.evidence.v1': '../schemas/core/evidence/tiinex.evidence.v1.schema.md'
  };
  const relative = paths[schemaId];
  if (!relative) return '';
  return readFileSync(new URL(relative, import.meta.url), 'utf8');
}
function lineageArtifact({ id, title, path, trace = '', source = {}, sourceMode = '', sourceTarget = {}, snapshot = {} }) {
  const parent = trace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [Parent](${trace})\n` : '';
  const markdown = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${parent}- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Summary: ${title}\n\n---\n\n# ${title}`;
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode }), { id, title, path, source, sourceMode, sourceTarget: { ...sourceTarget }, snapshot: { ...snapshot } });
}
function responseText(body) { return { ok: true, status: 200, statusText: 'OK', text: async () => body, json: async () => JSON.parse(body), clone() { return responseText(body); } }; }
function responseJson(json, options = {}) { const body = JSON.stringify(json); return { ok: options.ok !== false, status: options.status || 200, statusText: options.ok === false ? 'Not Found' : 'OK', json: async () => JSON.parse(body), text: async () => body, clone: () => responseJson(json, options) }; }
function lineageFetch(url, calls) {
  calls.push(String(url));
  if (url === 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365') return responseText(sourcePayload(lineageArtifactMarkdown('Silicon Valley', 'https://github.com/Tiinex/docs/issues/9'), ['- Tiinex Parent Source URL: https://github.com/Tiinex/docs/issues/9', '- Tiinex Parent Raw URL: https://github.com/Tiinex/docs/issues/9']));
  if (url === 'https://github.com/Tiinex/docs/issues/9') return responseText(sourcePayload(lineageArtifactMarkdown('Welcome to the Next Dimension', '')));
  return responseJson({ message: `missing ${url}` }, { ok: false, status: 404 });
}
function lineageArtifactMarkdown(title, trace) { return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${trace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [Parent](${trace})\n` : ''}- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Summary: ${title}\n\n---\n\n# ${title}`; }
function sourcePayload(markdown, metadata = []) { return ['## Tiinex Boundary', '', ...metadata, '', '## Source Markdown', '', '```md', markdown, '```'].join('\n'); }
function startupWorkspaceMarkdown() { return `# Tiinex Viewer\n\n## Workspace Entrypoints\n\n### News\n- Source Kind: github-tree\n- Repository: Tiinex/site\n- Root Path: .topics/news\n- Workspace Label: News\n- Open On Apply: true\n\n### Disabled\n- Source Kind: github-tree\n- Repository: Tiinex/disabled\n- Root Path: .topics/disabled\n- Workspace Label: Disabled\n- Open On Apply: false\n\n### Documentation\n- Source Kind: github-tree\n- Repository: Tiinex/docs\n- Root Path: .topics/documentation\n- Workspace Label: Documentation\n`; }
