import assert from 'assert';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { stateWithSourceMaterialCleared } from './workspace.sourceMaterial.js';

// Load the lifecycle to attach to globalThis
await import('../sources/source.identity.js');
await import('./workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function fail(msg) { throw new Error(msg); }

try {
  // 1) createRecordFromMarkdown now returns a record-shaped input only
  //    (identity and provenance are assigned by the lifecycle layer)
  const md = '# Title\n\nSome body text';
  const rec = createRecordFromMarkdown(md, { path: 'a.md', name: 'a.md', sourceMode: 'manual-file' });
  assert(rec && rec.title, 'record shape missing title');
  if ('id' in rec) fail('createRecordFromMarkdown must not add id');
  if ('createdAt' in rec) fail('createRecordFromMarkdown must not add createdAt');
  if ('source' in rec) fail('createRecordFromMarkdown must not add source');
  const pathTitleRecord = createRecordFromMarkdown('Body without heading', { path: 'docs/architecture/source-provenance-grounding.md', sourceMode: 'archive-local' });
  assert.equal(pathTitleRecord.title, 'Source Provenance Grounding', 'headingless Markdown should use readable path-derived title instead of Untitled artifact');

  // 2) Normal addWorkspaceRecords keeps local/session provenance
  const base = lifecycle.makeEmptyAppState();
  const create = lifecycle.createWorkspace(base, { name: 'Test' });
  if (!create?.ok) fail('createWorkspace failed');
  const ws = create.workspace;
  const renamed = lifecycle.renameWorkspace(create.state, ws.id, 'Renamed Test');
  if (!renamed?.ok) fail('renameWorkspace failed');
  if (renamed.workspace.id !== ws.id) fail('renameWorkspace must preserve stable workspace id');
  if (renamed.workspace.title !== 'Renamed Test' || renamed.workspace.name !== 'Renamed Test') fail('renameWorkspace must update visible workspace title/name');
  const blankRename = lifecycle.renameWorkspace(renamed.state, ws.id, '   ');
  if (blankRename?.ok || blankRename?.error !== 'workspace.name.required') fail('renameWorkspace must reject empty names');
  const addLocal = lifecycle.addWorkspaceRecords(create.state, ws.id, [rec]);
  if (!addLocal?.ok) fail('addWorkspaceRecords failed');
  const added = addLocal.records[0];
  if (!added?.source || added.source.kind !== lifecycle.SESSION_SOURCE_KIND) fail('local record must have session source');
  if (added.path !== 'a.md') fail('local record must preserve path');
  if (!added.markdown || !added.markdown.includes('# Title')) fail('local record must preserve markdown for detail view');

  // 2b) Same local path is an idempotent upsert, and same-title/different-path files remain distinct
  const samePathAgain = createRecordFromMarkdown('# Title\n\nUpdated body', { path: 'a.md', name: 'a.md', sourceMode: 'manual-file' });
  const addLocalAgain = lifecycle.addWorkspaceRecords(addLocal.state, ws.id, [samePathAgain]);
  if (!addLocalAgain?.ok) fail('addWorkspaceRecords failed for repeated local path');
  const afterLocalAgain = lifecycle.activeWorkspace(addLocalAgain.state);
  const localARecords = afterLocalAgain.records.filter((item) => item.path === 'a.md');
  if (localARecords.length !== 1) fail('repeated local path must upsert to one record');
  if (!String(localARecords[0].markdown || '').includes('Updated body')) fail('repeated local path must update material');
  const secondPath = createRecordFromMarkdown('# Title\n\nOther body', { path: 'folder/a.md', name: 'a.md', sourceMode: 'manual-folder' });
  const addSecondPath = lifecycle.addWorkspaceRecords(addLocalAgain.state, ws.id, [secondPath]);
  if (!addSecondPath?.ok) fail('addWorkspaceRecords failed for same title different path');
  const afterSecondPath = lifecycle.activeWorkspace(addSecondPath.state);
  if (!afterSecondPath.records.some((item) => item.path === 'a.md') || !afterSecondPath.records.some((item) => item.path === 'folder/a.md')) fail('same title with distinct paths must remain distinct records');


  // ensure adding records using 'local' as sourceId is rejected
  const badLocal = lifecycle.addWorkspaceSourceRecords(addLocal.state, ws.id, 'local', [rec]);
  if (badLocal?.ok || badLocal?.error !== 'source.not.configured') fail('addWorkspaceSourceRecords must reject local sourceId');

  // 3) Add configured source and verify addWorkspaceSourceRecords behavior
  const addSource = lifecycle.addWorkspaceSource(addSecondPath.state, ws.id, { label: 'Repo', repository: 'owner/repo', ref: 'master', rootPath: '.topics', count: 0, transportLabel: 'Source Pages mirror' });
  if (!addSource?.ok) fail('addWorkspaceSource failed');
  const sourceId = addSource.source.id;
  if (addSource.source.discoveryState !== 'deferred') fail('configured source registration must start as deferred');
  if (addSource.source.id !== 'github:owner-repo:master:topics') fail('configured source id must include repo/ref/root identity');
  const otherRefSource = lifecycle.makeConfiguredSource({ repository: 'owner/repo', ref: 'develop', rootPath: '.topics' });
  if (otherRefSource.id === addSource.source.id) fail('configured source identity must not collide across refs');
  const otherRootSource = lifecycle.makeConfiguredSource({ repository: 'owner/repo', ref: 'master', rootPath: 'docs' });
  if (otherRootSource.id === addSource.source.id) fail('configured source identity must not collide across roots');
  const continuationSource = lifecycle.makeConfiguredSource({ label: 'Plan', repository: 'owner/repo', ref: 'master', rootPath: '.topics', repoDiscovery: true, issueDiscovery: true, issueUrls: 'https://github.com/owner/repo/issues/1', surfaces: { repoFiles: { requested: true, loaded: 7 }, issueSnapshots: { requested: true, deferred: true, loaded: 0 } }, governanceBoundary: { schema: 'tiinex.governance.boundary.v1', status: 'origin-fallback', policy: { kind: 'LICENSE' } } });
  if (!continuationSource.repoDiscovery || !continuationSource.issueDiscovery) fail('configured source must preserve requested source surfaces for continuation');
  if (!continuationSource.surfaces.issueSnapshots?.deferred) fail('configured source must preserve deferred surface state');
  if (continuationSource.governanceBoundary?.status !== 'origin-fallback') fail('configured source must preserve governance boundary metadata');
  const invalidStateSource = lifecycle.makeConfiguredSource({ label: 'Bad State', repository: 'owner/repo', discoveryState: 'resolved' });
  if (invalidStateSource.discoveryState !== 'deferred') fail('unknown source discovery state must normalize to deferred');
  if (lifecycle.normalizeSourceDiscoveryState('partial') !== 'partial') fail('known source discovery state must be preserved');
  if (lifecycle.normalizeSourceDiscoveryState('resolved') !== 'deferred') fail('resolved must not become a hidden source discovery state');

  const srcRec = createRecordFromMarkdown('# S\n\nbody', { path: '.topics/1.md', name: '1.md', sourceMode: 'source' });
  const addSrcRes = lifecycle.addWorkspaceSourceRecords(addSource.state, ws.id, sourceId, [srcRec]);
  if (!addSrcRes?.ok) fail('addWorkspaceSourceRecords failed');
  const inserted = addSrcRes.records[0];
  if (!inserted?.source || inserted.source.id !== sourceId) fail('inserted record must have explicit source provenance');
  if (!inserted?.id || !String(inserted.id).startsWith('source:')) fail('source-backed record must have deterministic source id');
  if (String(inserted.path || '') !== '.topics/1.md') fail('source-backed record path must be canonicalized to include rootPath');
  const foundSource = addSrcRes.workspace.sources.find((s) => s.id === sourceId);
  if (!foundSource) fail('configured source not present after insert');
  if (!(Number(foundSource.count) > 0)) fail('configured source count not updated');
  if (foundSource.discoveryState !== 'loaded') fail('configured source must become loaded after source records are inserted');
  if (addSrcRes.workspace.discoveryProgress) fail('discoveryProgress must remain untouched/null by insertion');

  const preserveViewState = JSON.parse(JSON.stringify(addSrcRes.state));
  preserveViewState.view = Object.assign({}, preserveViewState.view || {}, { workspaceVerse: 'lineage', selectedRecordId: inserted.id });
  const preserveViewInsert = lifecycle.addWorkspaceSourceRecords(preserveViewState, ws.id, sourceId, [createRecordFromMarkdown('# Preserve\n\nbody', { path: '.topics/preserve.md', name: 'preserve.md', sourceMode: 'source' })], { discoveryState: 'partial', preserveView: true });
  if (!preserveViewInsert?.ok) fail('addWorkspaceSourceRecords preserveView insert failed');
  if (preserveViewInsert.state.view.workspaceVerse !== 'lineage') fail('source parent recovery inserts must preserve active workspace verse');
  if (preserveViewInsert.state.view.selectedRecordId !== inserted.id) fail('source parent recovery inserts must preserve selected record');

  const stateWithSourceMaterial = JSON.parse(JSON.stringify(addSrcRes.state));
  stateWithSourceMaterial.view = Object.assign({}, stateWithSourceMaterial.view || {}, { selectedRecordId: inserted.id, lineageLoadReport: { selectedRecordId: inserted.id }, lineageAuditReport: { selectedRecordId: inserted.id } });
  const materialWorkspace = stateWithSourceMaterial.workspaces.find((item) => item.id === ws.id);
  materialWorkspace.assets = [
    { id: 'source-asset', path: 'source.png', source: { id: sourceId } },
    { id: 'local-asset', path: 'local.png', source: { id: 'local' } }
  ];
  materialWorkspace.workspaceMergeCandidates = [
    { id: 'source-candidate', path: 'source.workspace.md', source: { id: sourceId } },
    { id: 'local-candidate', path: 'local.workspace.md', source: { id: 'local' } }
  ];
  materialWorkspace.discoveryProgress = { sourceId, step: 'materializing' };
  const closeSourceRes = lifecycle.closeWorkspaceSource(stateWithSourceMaterial, ws.id, sourceId);
  if (!closeSourceRes?.ok) fail('closeWorkspaceSource failed');
  const closedWorkspace = lifecycle.activeWorkspace(closeSourceRes.state);
  if (closedWorkspace.sources.some((s) => s.id === sourceId)) fail('closed source must be removed from workspace sources');
  if (closedWorkspace.records.some((r) => r.source && r.source.id === sourceId)) fail('closed source must remove source-backed records from the workspace');
  if (!closedWorkspace.records.some((r) => r.source && (r.source.id === 'local' || r.source.kind === lifecycle.SESSION_SOURCE_KIND))) fail('closeWorkspaceSource must preserve local/session records');
  if (closedWorkspace.assets.some((asset) => asset.source?.id === sourceId)) fail('closed source must remove source-backed assets');
  if (!closedWorkspace.assets.some((asset) => asset.source?.id === 'local')) fail('closeWorkspaceSource must preserve local assets');
  if (closedWorkspace.workspaceMergeCandidates.some((candidate) => candidate.source?.id === sourceId)) fail('closed source must remove source-backed workspace candidates');
  if (!closedWorkspace.workspaceMergeCandidates.some((candidate) => candidate.source?.id === 'local')) fail('closeWorkspaceSource must preserve local workspace candidates');
  if (closedWorkspace.discoveryProgress) fail('closed source must clear in-flight discovery progress');
  if (closeSourceRes.state.view.selectedRecordId) fail('closeWorkspaceSource must clear a dangling selected source record');

  const clearSourceState = JSON.parse(JSON.stringify(addSrcRes.state));
  clearSourceState.view = Object.assign({}, clearSourceState.view || {}, { workspaceVerse: 'lineage', selectedRecordId: inserted.id });
  const clearWorkspace = clearSourceState.workspaces.find((item) => item.id === ws.id);
  clearWorkspace.assets = [{ id: 'source-asset-2', path: 'source-2.png', source: { id: sourceId } }, { id: 'local-asset-2', path: 'local-2.png', source: { id: 'local' } }];
  const clearMaterialRes = stateWithSourceMaterialCleared(clearSourceState, ws.id, sourceId, { discoveryState: 'deferred' });
  if (!clearMaterialRes?.ok) fail('clearWorkspaceSourceMaterial failed');
  const clearedMaterialWorkspace = lifecycle.activeWorkspace(clearMaterialRes.state);
  if (!clearedMaterialWorkspace.sources.some((s) => s.id === sourceId)) fail('clearing material must keep the configured source boundary pinned');
  if (clearedMaterialWorkspace.records.some((r) => r.source?.id === sourceId)) fail('clearing material must remove source-backed records');
  if (clearedMaterialWorkspace.assets.some((asset) => asset.source?.id === sourceId)) fail('clearing material must remove source-backed assets');
  if (!clearedMaterialWorkspace.assets.some((asset) => asset.source?.id === 'local')) fail('clearing material must preserve local assets');
  if (clearMaterialRes.state.view.workspaceVerse !== 'lineage') fail('clearing material during transport refresh must not reset the workspace verse');
  if (clearMaterialRes.state.view.selectedRecordId) fail('clearing material must clear a dangling selected source record');
  if (Number(clearedMaterialWorkspace.sources.find((s) => s.id === sourceId)?.count ?? -1) !== 0) fail('cleared source boundary count must reset to zero');


  const surfaceClearState = JSON.parse(JSON.stringify(addSource.state));
  const repoSurfaceRec = Object.assign(createRecordFromMarkdown('# Repo file\n\nbody', { path: '.topics/repo.md', name: 'repo.md', sourceMode: 'source' }), { sourceTarget: { surface: 'repoFiles', transportTier: 'mirror' } });
  const issueSurfaceRec = Object.assign(createRecordFromMarkdown('# Issue\n\nbody', { path: '.topics/.issues/1.md', name: '1.md', sourceMode: 'source' }), { sourceTarget: { surface: 'issueSnapshots', transportTier: 'proxy' } });
  let surfaceState = lifecycle.addWorkspaceSourceRecords(surfaceClearState, ws.id, sourceId, [repoSurfaceRec, issueSurfaceRec]).state;
  const surfaceClearRes = stateWithSourceMaterialCleared(surfaceState, ws.id, sourceId, { discoveryState: 'loading', surfaces: ['issueSnapshots'] });
  if (!surfaceClearRes?.ok) fail('surface-scoped clear failed');
  const surfaceClearedWorkspace = lifecycle.activeWorkspace(surfaceClearRes.state);
  if (!surfaceClearedWorkspace.records.some((r) => r.source?.id === sourceId && r.sourceTarget?.surface === 'repoFiles')) fail('surface-scoped clear must preserve other surface records');
  if (surfaceClearedWorkspace.records.some((r) => r.source?.id === sourceId && r.sourceTarget?.surface === 'issueSnapshots')) fail('surface-scoped clear must remove selected surface records');
  if (Number(surfaceClearedWorkspace.sources.find((s) => s.id === sourceId)?.count ?? -1) !== 1) fail('surface-scoped clear must keep source count for preserved records');

  // 4) Unknown sourceId should fail
  const bad = lifecycle.addWorkspaceSourceRecords(addSrcRes.state, ws.id, 'nope', [srcRec]);
  if (bad?.ok) fail('addWorkspaceSourceRecords must fail for unknown source');

  // 5) Path variant case: different logical path forms should dedupe to one record
  const variants = [
    createRecordFromMarkdown('# V\n\nbody', { path: '.topics/README.md', name: 'README.md', sourceMode: 'source' }),
    createRecordFromMarkdown('# V\n\nbody', { path: 'README.md', name: 'README.md', sourceMode: 'source' }),
    createRecordFromMarkdown('# V\n\nbody', { path: './README.md', name: 'README.md', sourceMode: 'source' }),
    createRecordFromMarkdown('# V\n\nbody', { path: 'https://raw.githubusercontent.com/owner/repo/master/README.md', name: 'README.md', sourceMode: 'source' })
  ];

  // Capture prev configured-source count, then insert variants sequentially
  const prevCount = Number(addSrcRes.workspace.sources.find((s) => s.id === sourceId)?.count || 0);
  let currentState = addSrcRes.state;
  for (const v of variants) {
    const res = lifecycle.addWorkspaceSourceRecords(currentState, ws.id, sourceId, [v]);
    if (!res?.ok) fail('addWorkspaceSourceRecords failed for variant insert');
    currentState = res.state;
  }

  // Final assertions against the workspace state after sequential inserts
  const finalWorkspace = lifecycle.activeWorkspace(currentState);
  const cfg = finalWorkspace.sources.find((s) => s.id === sourceId);
  if (!cfg) fail('configured source missing after variants');
  if (Number(cfg.count) !== prevCount + 1) fail('expected source count to increase by exactly 1 for README variants');
  if (cfg.discoveryState !== 'loaded') fail('source with loaded material must remain loaded after upserts');
  if (lifecycle.countLocalRecords(finalWorkspace) !== 2) fail('local source count must include only local records and not source-backed records');
  const found = finalWorkspace.records.filter((r) => r.source && r.source.id === sourceId && r.path === '.topics/README.md');
  if (found.length !== 1) fail('workspace must contain a single canonical source-backed record for the logical README');
  const single = found[0];
  if (!single.id || !single.id.startsWith('source:')) fail('canonical record must have source id');
  if (single.id !== `source:${sourceId}:.topics/README.md`) fail('canonical README id mismatch');
  if (finalWorkspace.discoveryProgress) fail('discoveryProgress must remain untouched/null by insertion');

  const lineageVerseState = lifecycle.setWorkspaceVerse(currentState, 'lineage');
  if (lineageVerseState.view.workspaceVerse !== 'lineage') fail('lineage verse must be a first-class workspace verse');
  const auditVerseState = lifecycle.setWorkspaceVerse(currentState, 'audit');
  if (auditVerseState.view.workspaceVerse !== 'audit') fail('audit verse must be a first-class loaded-only workspace verse');
  const invalidVerseState = lifecycle.setWorkspaceVerse(currentState, 'map');
  if (invalidVerseState.view.workspaceVerse !== 'feed') fail('unknown workspace verse should fall back to feed');


  // 6) Asset insertion is separate from leaf records and keeps local/session boundary
  const assetRes = lifecycle.addWorkspaceAssets(currentState, ws.id, [{ path: 'assets/picture.png', name: 'picture.png', type: 'image/png', size: 7, dataUrl: 'data:image/png;base64,ZmFrZQ==' }]);
  if (!assetRes?.ok) fail('addWorkspaceAssets failed');
  const assetWorkspace = lifecycle.activeWorkspace(assetRes.state);
  if (!Array.isArray(assetWorkspace.assets) || assetWorkspace.assets.length !== 1) fail('workspace asset must be stored separately from records');
  if (assetWorkspace.records.some((record) => record.path === 'assets/picture.png')) fail('asset must not become a fake leaf record');
  const assetAgain = lifecycle.addWorkspaceAssets(assetRes.state, ws.id, [{ path: './assets//picture.png', name: 'picture.png', type: 'image/png', size: 8 }]);
  if (!assetAgain?.ok) fail('addWorkspaceAssets repeated path failed');
  const assetAgainWorkspace = lifecycle.activeWorkspace(assetAgain.state);
  if (assetAgainWorkspace.assets.length !== 1 || Number(assetAgainWorkspace.assets[0].size) !== 8) fail('asset path must upsert deterministically');

  // 7) .workspace.md opens as a workspace object, not as a leaf
  const workspaceMd = '# Tiinex Viewer\n\n## Workspace Entrypoints\n';
  const openWs = lifecycle.openWorkspaceFromMarkdown(lifecycle.makeEmptyAppState(), workspaceMd, { path: 'viewer.workspace.md', title: 'Imported Viewer' });
  if (!openWs?.ok) fail('openWorkspaceFromMarkdown failed');
  if (openWs.workspace.records.length !== 0) fail('.workspace.md must not become a normal record');
  if (openWs.workspace.workspaceImport?.path !== 'viewer.workspace.md') fail('workspace import path missing');
  const merge = lifecycle.mergeWorkspaceImport(openWs.state, openWs.workspace.id, { path: 'other.workspace.md', title: 'Other' });
  if (!merge?.ok) fail('mergeWorkspaceImport failed');
  const mergedWorkspace = lifecycle.activeWorkspace(merge.state);
  if (!mergedWorkspace.workspaceMergeCandidates?.length) fail('workspace merge candidate must be recorded explicitly');
  const mergeAgain = lifecycle.mergeWorkspaceImport(merge.state, openWs.workspace.id, { path: './other.workspace.md', title: 'Other updated' });
  if (!mergeAgain?.ok) fail('mergeWorkspaceImport repeat failed');
  const mergedAgainWorkspace = lifecycle.activeWorkspace(mergeAgain.state);
  if (mergedAgainWorkspace.workspaceMergeCandidates.length !== 1) fail('workspace merge candidate path must upsert, not duplicate');
  if (mergedAgainWorkspace.workspaceMergeCandidates[0].title !== 'Other updated') fail('workspace merge candidate upsert should refresh metadata');


  // 8) Issue snapshot source identity must preserve material paths instead of collapsing every issue/comment to the issue URL.
  {
    let issueState = lifecycle.makeEmptyAppState();
    const issueCreated = lifecycle.createWorkspace(issueState, { name: 'Issue path guard' }, { clock: () => '2026-07-24T00:00:00.000Z' });
    issueState = issueCreated.state;
    const issueSource = lifecycle.addWorkspaceSource(issueState, issueCreated.workspace.id, { repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics', label: 'Tiinex/docs' });
    issueState = issueSource.state;
    const issueLoaded = lifecycle.addWorkspaceSourceRecords(issueState, issueCreated.workspace.id, issueSource.source.id, [{
      title: 'Issue snapshot',
      path: 'https://github.com/Tiinex/docs/issues/123',
      kind: 'tiinex.evidence.v1',
      sourceMode: 'github-issue-snapshot',
      sourceTarget: { surface: 'issueSnapshots', targetKind: 'github-issue-snapshot', inputTarget: 'https://github.com/Tiinex/docs/issues/123' },
      markdown: `# Continuity Context

# Evidence
`
    }, {
      title: 'Comment artifact one',
      path: '.topics/.github/.issues/tiinex-docs-issue-123/comment-001-5001-recovered-one.trace.md',
      kind: 'tiinex.topic.v1',
      sourceMode: 'github-comment-embedded-artifact',
      sourceTarget: { surface: 'issueSnapshots', targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/123#issuecomment-5001' },
      snapshot: { embedded: true, sourceArtifactPath: '' },
      markdown: `# Continuity Context

# One
`
    }, {
      title: 'Comment artifact two',
      path: '.topics/.github/.issues/tiinex-docs-issue-123/comment-002-5002-recovered-two.trace.md',
      kind: 'tiinex.topic.v1',
      sourceMode: 'github-comment-embedded-artifact',
      sourceTarget: { surface: 'issueSnapshots', targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/123#issuecomment-5002' },
      snapshot: { embedded: true, sourceArtifactPath: '' },
      markdown: `# Continuity Context

# Two
`
    }]);
    assert.equal(issueLoaded.ok, true, 'issue snapshot source records should insert');
    assert.equal(issueLoaded.records[0].path, '.topics/.issues/github/tiinex-docs/123/issue-snapshot.trace.md', 'plain issue snapshot path should use logical .topics/.issues scope, not a GitHub URL pseudo-tree');
    assert(!issueLoaded.records[0].id.includes('.topics/tiinex/docs/issues'), 'plain issue snapshot deterministic id must not inherit repo rootPath');
    const issueRecords = issueLoaded.workspace.records.filter((record) => record.source?.id === issueSource.source.id);
    assert.equal(issueRecords.length, 3, 'comment-embedded issue artifacts must survive addWorkspaceSourceRecords as distinct records');
    assert(issueRecords.some((record) => record.path === '.topics/.issues/github/tiinex-docs/123/comment-001-5001-recovered-one.trace.md'), 'first comment embedded artifact path should normalize to logical issue scope');
    assert(issueRecords.some((record) => record.path === '.topics/.issues/github/tiinex-docs/123/comment-002-5002-recovered-two.trace.md'), 'second comment embedded artifact path should normalize to logical issue scope');
    const outsideRoot = lifecycle.addWorkspaceSourceRecords(issueLoaded.state, issueCreated.workspace.id, issueSource.source.id, [{
      title: 'Outside root embedded artifact',
      path: '.topics/.github/.issues/tiinex-docs-issue-123/comment-003-5003-recovered-outside.trace.md',
      kind: 'tiinex.topic.v1',
      sourceMode: 'github-comment-embedded-artifact',
      sourceTarget: { surface: 'issueSnapshots', targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/123#issuecomment-5003', sourceArtifactPath: 'odysseus/001-1-1.trace.md' },
      snapshot: { embedded: true, sourceArtifactPath: 'odysseus/001-1-1.trace.md' },
      markdown: `# Continuity Context

# Outside
`
    }]);
    assert.equal(outsideRoot.records[0].path, 'odysseus/001-1-1.trace.md', 'embedded artifact Source Path outside discovery root must not be rewritten under rootPath');
  }

  console.log('✓ workspace.lifecycle tests passed');
  process.exit(0);
} catch (err) {
  console.error('workspace.lifecycle tests failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}
