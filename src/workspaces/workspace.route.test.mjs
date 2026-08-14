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
    sources: [{ id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary', repoDiscovery: true, issueDiscovery: true, explicitFileRefs: ['.topics/exact.md'], transportRefreshTier: 'proxy', transportOutcome: { activeTier: 'direct' }, transportTiers: { direct: 3 }, transportPlan: { configured: { direct: true } }, governanceBoundary: { schema: 'tiinex.governance.boundary.v1', status: 'found', scope: { kind: 'github-repo-root', repo: 'Tiinex/docs', ref: 'abcdef', root: '/' }, policy: { kind: 'LINEAGE_POLICY.md', path: 'LINEAGE_POLICY.md', url: 'https://raw.githubusercontent.com/Tiinex/docs/abcdef/LINEAGE_POLICY.md', contentAvailable: true }, rootChecked: true, discoveredFrom: 'repo-mirror-archive' }, requestedSurfaces: { repoFiles: { requested: true, loaded: 2 }, issueSnapshots: { requested: true, loaded: 1 } }, surfaces: { repoFiles: { requested: true, loaded: 2 }, issueSnapshots: { requested: true, loaded: 1 } } }],
    sourceOrder: ['github:tiinex-docs'],
    discoveryProgress: { sourceId: 'github:tiinex-docs', phase: 'source-materialization', label: 'trying proxy transport', active: true },
    records: [{
      id: 'source:github:tiinex-docs:topics/source.md',
      title: 'Source backed shell',
      summary: 'Route shell only',
      path: 'topics/source.md',
      markdown: '# source body that ordinary route compaction must omit',
      sourceMode: 'source-backed',
      materialAvailability: 'available',
      cacheState: 'source-materialized',
      source: { id: 'github:tiinex-docs', kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'abcdef', rootPath: '.topics', boundary: 'explicit source boundary' }
    }]
  }]
};
const sourceRoute = route.makeRouteState(stateWithSourceRecord);
if (sourceRoute.workspaces[0].discoveryProgress) throw new Error('route hash must not preserve transient source discovery/transport progress');
const sourceRecordShell = sourceRoute.workspaces[0].records[0];
if (sourceRoute.workspaces[0].sources[0].issueDiscovery !== true) throw new Error('route source shell must preserve issue discovery selection');
if (sourceRoute.workspaces[0].sources[0].explicitFileRefs?.[0] !== '.topics/exact.md') throw new Error('route source shell must preserve durable explicit file targets independently of broad discovery');
if (sourceRoute.workspaces[0].sources[0].requestedSurfaces.issueSnapshots.requested !== true) throw new Error('route source shell must preserve requested issue surface across F5');
if (sourceRoute.workspaces[0].sources[0].transportRefreshTier || sourceRoute.workspaces[0].sources[0].transportOutcome || sourceRoute.workspaces[0].sources[0].transportPlan || sourceRoute.workspaces[0].sources[0].transportTiers) throw new Error('route hash must not preserve volatile transport state');
if (sourceRoute.workspaces[0].sources[0].governanceBoundary?.policy?.path !== 'LINEAGE_POLICY.md') throw new Error('route source shell must preserve persisted governance boundary metadata');
if (sourceRecordShell.source.adapterId !== 'github') throw new Error('route shell must preserve source adapter');

if (sourceRecordShell.source.requestedSurfaces || sourceRecordShell.source.surfaces || sourceRecordShell.source.governanceBoundary || sourceRecordShell.source.config) throw new Error('route record source shells must not repeat source rail transport/governance/config metadata');
if (sourceRecordShell.sourceMode !== 'source-backed') throw new Error('route shell must preserve source mode');
if (sourceRecordShell.path !== 'topics/source.md') throw new Error('route shell must preserve path');
if (sourceRecordShell.markdown !== '') throw new Error('ordinary source-backed route shell must omit runtime markdown');
if (sourceRecordShell.materialAvailability !== 'material-unavailable') throw new Error('route compaction must not claim omitted ordinary source-backed markdown remains available');
if (sourceRecordShell.cacheState !== 'route-shell-material-unavailable') throw new Error('route compaction must describe the material actually carried by the route shell');
const normalizedSourceRoute = route.normalizeRouteState(sourceRoute, lifecycle);
if (normalizedSourceRoute.workspaces[0].sources[0].governanceBoundary?.status !== 'found') throw new Error('normalized route must preserve source governance boundary after F5');
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
      path: '.topics/.github/tiinex/docs/.issues/9/comment-001.trace.md',
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
    assets: [{ id: 'asset-1', name: 'diagram.png', path: 'assets/diagram.png', type: 'image/png', size: 128, content: 'binary', dataUrl: 'data:image/png;base64,abc', previewState: 'available', materialAvailability: 'available', cacheState: 'runtime-asset-materialized', source: { kind: 'local-session', adapterId: 'local' } }],
    importLog: [{ kind: 'archive', at: '2026-07-21T00:00:00.000Z', ok: true, message: 'Imported fixture.', counts: { records: 1, assets: 1 } }],
    records: [{ id: 'workspace-record-1', title: 'Workspace Artifact', path: 'workspaces/demo.workspace.md', markdown: '# Workspace Artifact', kind: 'tiinex.workspace.v1', schemaId: 'tiinex.workspace.v1', sourceMode: 'local-workspace-file', source: { kind: 'local-session', adapterId: 'local' }, workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true } }]
  }]
};
const materialRoute = route.makeRouteState(stateWithRouteMaterial);
if (materialRoute.workspaces[0].assets.length !== 1) throw new Error('route state must preserve asset shells');
if (materialRoute.workspaces[0].assets[0].content) throw new Error('route asset shell must not include asset content');
if (materialRoute.workspaces[0].assets[0].path !== 'assets/diagram.png') throw new Error('route asset shell must preserve path');
if (materialRoute.workspaces[0].assets[0].materialAvailability !== 'material-unavailable') throw new Error('route asset shell must not claim bytes remain available after compaction omits them');
if (materialRoute.workspaces[0].assets[0].previewState === 'available') throw new Error('route asset shell must not claim an available preview after preview bytes are omitted');
if (materialRoute.workspaces[0].assets[0].cacheState !== 'route-shell-material-unavailable') throw new Error('route asset shell must disclose truthful omitted-material cache state');
if (Object.prototype.hasOwnProperty.call(materialRoute.workspaces[0], 'workspaceMergeCandidates')) throw new Error('canonical outbound route must not manufacture legacy candidate state');
if (materialRoute.workspaces[0].records.length !== 1 || materialRoute.workspaces[0].records[0].path !== 'workspaces/demo.workspace.md') throw new Error('canonical outbound route preserves Workspace Artifact record shell');
if (materialRoute.workspaces[0].records[0].markdown) throw new Error('ordinary route Workspace Artifact shell must not include markdown material');
if (materialRoute.workspaces[0].importLog[0].counts.assets !== 1) throw new Error('route import log should preserve bounded counts');
const normalizedMaterialRoute = route.normalizeRouteState(materialRoute, lifecycle);
const normalizedAsset = normalizedMaterialRoute.workspaces[0].assets[0];
if (normalizedAsset.materialAvailability !== 'material-unavailable') throw new Error('route-only asset should disclose unavailable material');
if (normalizedAsset.cacheState !== 'route-shell-material-unavailable') throw new Error('route-only asset should disclose route-shell cache state');
const normalizedWorkspaceArtifact = normalizedMaterialRoute.workspaces[0].records[0];
if (normalizedWorkspaceArtifact.materialAvailability !== 'material-unavailable') throw new Error('route-only Workspace Artifact should disclose unavailable material');
if (normalizedWorkspaceArtifact.markdown !== '') throw new Error('route-only Workspace Artifact should not invent markdown');

// Explicit legacy inbound route shells remain accepted at the route I/O compatibility boundary.
const legacyCandidateInbound = route.normalizeRouteState({
  v: 2, activeWorkspaceId: 'legacy-route-w', view: { workspaceVerse: 'feed' },
  workspaces: [{ id: 'legacy-route-w', name: 'Legacy route', records: [], assets: [], sources: [], workspaceMergeCandidates: [{ id: 'legacy-route-candidate', path: 'legacy.workspace.md', markdown: '# legacy' }] }]
}, lifecycle);
if (legacyCandidateInbound.workspaces[0].workspaceMergeCandidates.length !== 1) throw new Error('legacy inbound route candidate shell remains readable at the explicit compatibility boundary');
if (legacyCandidateInbound.workspaces[0].workspaceMergeCandidates[0].markdown !== '') throw new Error('legacy inbound route candidate shell must not invent route material');

const invalidRouteShape = route.validateRouteOwnershipState({ arbitrary: true });
if (invalidRouteShape.ok) throw new Error('parseable arbitrary JSON must not become a resolved route owner');
const unsupportedRoute = route.validateRouteOwnershipState({ v: 999, workspaces: [] });
if (unsupportedRoute.ok) throw new Error('unsupported route version must not own startup');
const validEmptyRoute = route.validateRouteOwnershipState({ v: 2, activeWorkspaceId: '', view: {}, workspaces: [] });
if (!validEmptyRoute.ok || validEmptyRoute.reason !== 'route-owned-empty') throw new Error('well-shaped v2 empty route is an explicit resolved empty route');
const invalidWorkspaceRoute = route.validateRouteOwnershipState({ v: 2, workspaces: [{}] });
if (invalidWorkspaceRoute.ok) throw new Error('workspace-bearing route must provide canonical workspace identity');

const presentationRoute = route.makeRouteState({
  version: 1, activeWorkspaceId: 'presentation-w',
  view: { workspaceVerse: 'tree', query: 'schema', layoutMode: 'compact', scrollPositions: { 'presentation-w:tree:schema::': 175 } },
  workspaces: [{ id: 'presentation-w', name: 'Presentation', records: [], assets: [], sources: [], sourceOrder: [] }],
  workspaceViews: { 'presentation-w': { workspaceVerse: 'tree', layoutMode: 'compact', scrollPositions: { 'presentation-w:tree:schema::': 175 } } },
  workspaceWindow: { schema: 'tiinex.workspace.window.v1', offset: 1 }
});
if (presentationRoute.workspaceViews || presentationRoute.workspaceWindow) throw new Error('M2 workspace presentation must not enter route/share semantics');
if (presentationRoute.view.layoutMode || presentationRoute.view.scrollPositions) throw new Error('active layout/scroll presentation must remain outside route/share view projection');
if (presentationRoute.view.workspaceVerse !== 'tree' || presentationRoute.view.query !== 'schema') throw new Error('route must retain semantic active lens/query while excluding browser presentation');

console.log('✓ workspace route tests passed');
