await import('../sources/source.identity.js');
await import('./workspace.lifecycle.js');
await import('./workspace.route.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const route = globalThis.TiinexWorkspaceRoute;

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Route Test' }, { clock: () => '2026-07-19T22:00:00.000Z' }).state;
created.view.workspaceVerse = 'audit';
created.view.query = 'schema';
const routeState = route.makeRouteState(created);
if (routeState.v !== 2) throw new Error('route state version should be explicit');
if (routeState.workspaces[0].records.length !== 0) throw new Error('empty workspace route should preserve empty records');
if (route.routeSummary(routeState).workspaceVerse !== 'audit') throw new Error('route summary should include active verse');
const normalized = route.normalizeRouteState(routeState, lifecycle);
if (normalized.activeWorkspaceId !== created.activeWorkspaceId) throw new Error('normalized route should keep active workspace');
if (normalized.view.query !== 'schema') throw new Error('normalized route should keep query');
const empty = route.normalizeRouteState({ v: 2, workspaces: [] }, lifecycle);
if (empty.workspaces.length !== 0 || empty.activeWorkspaceId) throw new Error('empty route should normalize to empty app state');

const stateWithSourceRecord = {
  version: 1,
  activeWorkspaceId: 'w-route-source',
  view: { workspaceVerse: 'feed', query: '' },
  workspaces: [{
    id: 'w-route-source',
    name: 'Route Source',
    sources: [{ id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary', repoDiscovery: true, issueDiscovery: true, transportRefreshTier: 'proxy', transportOutcome: { activeTier: 'direct' }, transportTiers: { direct: 3 }, transportPlan: { configured: { direct: true } }, requestedSurfaces: { repoFiles: { requested: true, loaded: 2 }, issueSnapshots: { requested: true, loaded: 1 } }, surfaces: { repoFiles: { requested: true, loaded: 2 }, issueSnapshots: { requested: true, loaded: 1 } } }],
    sourceOrder: ['github:tiinex-docs'],
    discoveryProgress: { sourceId: 'github:tiinex-docs', phase: 'source-materialization', label: 'trying proxy transport', active: true },
    records: [{
      id: 'source:github:tiinex-docs:topics/source.md',
      title: 'Source backed shell',
      summary: 'Route shell only',
      path: 'topics/source.md',
      sourceMode: 'source-backed',
      source: { id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary' }
    }]
  }]
};
const sourceRoute = route.makeRouteState(stateWithSourceRecord);
if (sourceRoute.workspaces[0].discoveryProgress) throw new Error('route hash must not preserve transient source discovery/transport progress');
const sourceRecordShell = sourceRoute.workspaces[0].records[0];
if (sourceRoute.workspaces[0].sources[0].issueDiscovery !== true) throw new Error('route source shell must preserve issue discovery selection');
if (sourceRoute.workspaces[0].sources[0].requestedSurfaces.issueSnapshots.requested !== true) throw new Error('route source shell must preserve requested issue surface across F5');
if (sourceRoute.workspaces[0].sources[0].transportRefreshTier || sourceRoute.workspaces[0].sources[0].transportOutcome || sourceRoute.workspaces[0].sources[0].transportPlan || sourceRoute.workspaces[0].sources[0].transportTiers) throw new Error('route hash must not preserve volatile transport state');
if (sourceRecordShell.source.adapterId !== 'github') throw new Error('route shell must preserve source adapter');
if (sourceRecordShell.sourceMode !== 'source-backed') throw new Error('route shell must preserve source mode');
if (sourceRecordShell.path !== 'topics/source.md') throw new Error('route shell must preserve path');
const normalizedSourceRoute = route.normalizeRouteState(sourceRoute, lifecycle);
const normalizedRecord = normalizedSourceRoute.workspaces[0].records[0];
if (normalizedRecord.source.adapterId !== 'github') throw new Error('normalized route must not turn source-backed record local');
if (normalizedRecord.materialAvailability !== 'material-unavailable') throw new Error('route-only record should disclose unavailable material');
if (normalizedRecord.cacheState !== 'route-shell-material-unavailable') throw new Error('route-only record should disclose route-shell cache state');

const stateWithIssueSnapshotRecord = {
  version: 1,
  activeWorkspaceId: 'w-route-issue-cache',
  view: { workspaceVerse: 'feed', query: '' },
  workspaces: [{
    id: 'w-route-issue-cache',
    name: 'Route Issue Cache',
    sources: [{ id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', issueDiscovery: true }],
    sourceOrder: ['github:tiinex-docs'],
    records: [{
      id: 'issue-comment-1',
      title: 'Cached issue comment leaf',
      summary: 'Preserved issue material',
      kind: 'tiinex.evidence.v1',
      currentCreatedAt: '2026-07-28',
      path: '.topics/.issues/github/Tiinex-docs/9/comment-001.trace.md',
      markdown: '# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.evidence.v1](tiinex.evidence.v1.schema.md)\n  - Created At: 2026-07-19\n  - Summary: issue snapshot body survives route restore\n\n---\n\n# Cached issue comment leaf\n',
      sourceMode: 'github-comment-embedded-artifact',
      source: { id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary' },
      sourceTarget: { schema: 'tiinex.source.material.target.v1', surface: 'issueSnapshots', targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-1', sourceSortAt: '2026-07-19T12:00:00Z', sourceUpdatedAt: '2026-07-19T12:00:00Z', loaded: true },
      snapshot: { schema: 'tiinex.github.issueSnapshot.v1', embedded: true, sourceKind: 'comment', sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-1', sourceSortAt: '2026-07-19T12:00:00Z' }
    }]
  }]
};
const issueRoute = route.makeRouteState(stateWithIssueSnapshotRecord);
const issueRecordShell = issueRoute.workspaces[0].records[0];
if (!issueRecordShell.markdown.includes('issue snapshot body survives route restore')) throw new Error('bounded issue snapshot route shell should preserve readable markdown for F5 cache restore');
if (issueRecordShell.sourceTarget?.sourceSortAt !== '2026-07-19T12:00:00Z') throw new Error('issue route shell should preserve source sort timestamp');
if (issueRecordShell.currentCreatedAt !== '2026-07-28') throw new Error('issue route shell should preserve current-created date for display');
const normalizedIssueRoute = route.normalizeRouteState(issueRoute, lifecycle);
const normalizedIssueRecord = normalizedIssueRoute.workspaces[0].records[0];
if (normalizedIssueRecord.materialAvailability !== 'available') throw new Error('bounded issue route material should restore as available');
if (!normalizedIssueRecord.markdown.includes('Cached issue comment leaf')) throw new Error('normalized issue route should keep readable markdown');


const stateWithRouteMaterial = {
  version: 1,
  activeWorkspaceId: 'w-route-material',
  view: { workspaceVerse: 'tree', query: '' },
  workspaces: [{
    id: 'w-route-material',
    name: 'Route Material',
    assets: [{ id: 'asset-1', name: 'diagram.png', path: 'assets/diagram.png', type: 'image/png', size: 128, content: 'binary', dataUrl: 'data:image/png;base64,abc', source: { kind: 'local-session', adapterId: 'local' } }],
    workspaceMergeCandidates: [{ id: 'candidate-1', title: 'Workspace Candidate', path: 'workspaces/demo.workspace.md', markdown: '# Workspace Candidate', source: { kind: 'local-session', adapterId: 'local' } }],
    importLog: [{ kind: 'archive', at: '2026-07-21T00:00:00.000Z', ok: true, message: 'Imported fixture.', counts: { records: 1, assets: 1 } }],
    records: []
  }]
};
const materialRoute = route.makeRouteState(stateWithRouteMaterial);
if (materialRoute.workspaces[0].assets.length !== 1) throw new Error('route state must preserve asset shells');
if (materialRoute.workspaces[0].assets[0].content) throw new Error('route asset shell must not include asset content');
if (materialRoute.workspaces[0].assets[0].path !== 'assets/diagram.png') throw new Error('route asset shell must preserve path');
if (materialRoute.workspaces[0].workspaceMergeCandidates.length !== 1) throw new Error('route state must preserve workspace candidate shells');
if (materialRoute.workspaces[0].workspaceMergeCandidates[0].markdown) throw new Error('route workspace candidate shell must not include markdown');
if (materialRoute.workspaces[0].importLog[0].counts.assets !== 1) throw new Error('route import log should preserve bounded counts');
const normalizedMaterialRoute = route.normalizeRouteState(materialRoute, lifecycle);
const normalizedAsset = normalizedMaterialRoute.workspaces[0].assets[0];
if (normalizedAsset.materialAvailability !== 'material-unavailable') throw new Error('route-only asset should disclose unavailable material');
if (normalizedAsset.cacheState !== 'route-shell-material-unavailable') throw new Error('route-only asset should disclose route-shell cache state');
const normalizedCandidate = normalizedMaterialRoute.workspaces[0].workspaceMergeCandidates[0];
if (normalizedCandidate.materialAvailability !== 'material-unavailable') throw new Error('route-only workspace candidate should disclose unavailable material');
if (normalizedCandidate.markdown !== '') throw new Error('route-only workspace candidate should not invent markdown');

console.log('✓ workspace route tests passed');
