import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { isWorkspaceRecord } from '../../actions/record.actions.js';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { presentWorkspaceFeed, presentWorkspaceTree } from './tiinex.workspace.v1.presenter.js';
import { summarizeWorkspaceMaterial } from '../../workspaces/workspace.summary.js';
import { buildWorkspaceLineageView } from '../../workspaces/workspace.lineageView.js';
import { buildDiscoveryMaterialIndex, buildWorkspaceDiscoveryView } from '../../workspaces/workspace.discoveryView.js';
import { buildWorkspaceAuditView } from '../../workspaces/workspace.auditView.js';
import { normalizeWorkspaceDisplayOptions } from '../../workspaces/workspace.displayOptions.js';
import { WorkspaceBoundaryKicker, SourceStrip, WorkspaceDropHint, WorkspaceMaterialSummary, ModeToolbar, ProgressStrip, EmptyWorkspaceState } from './workspace.chrome.views.jsx';
import { DiscoveryRecordList } from './workspace.discovery.views.jsx';
import { WorkspaceTreeState } from './workspace.tree.views.jsx';
import { WorkspaceAuditState } from './workspace.audit.views.jsx';
import { WorkspaceLineageState } from './workspace.lineage.views.jsx';
import { transitionProductContextForWorkspace } from '../../transitions/transition.productPresentation.browser.js';
import { TimePortalBanner, TimePortalCompactMarker } from './workspace.timePortal.views.jsx';
import { WorkspaceSelectionSurface } from './workspace.selection.views.jsx';

const WorkspaceGraphState = React.lazy(() => import('./workspace.graph.views.jsx').then((module) => ({ default: module.WorkspaceGraphState })));

export { AssetDetailDialog } from './workspace.cards.views.jsx';
export { RecordDetailDialog, RecordMarkdownDialog, RecordActionDialog, CreateWorkspaceDialog, RenameWorkspaceDialog, CloseWorkspaceDialog } from './workspace.recordDialogs.views.jsx';
export { WorkspaceCanonicalCreateDialog } from './workspace.canonicalTaskDialog.views.jsx';
export { GovernanceBoundaryDialog } from './workspace.governance.views.jsx';

function auditIndexForWorkspace(workspace = {}, records = []) {
  const audit = buildWorkspaceAuditView(workspace, { records, query: '' });
  return new Map((audit.items || []).map((item) => [item.id, item]));
}

function selectedRecordFrom(workspace = {}, selectedRecordId = '') {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  return records.find((record) => record.id === selectedRecordId) || null;
}

function lineageControlsReadyForTraversal(traversal = null) {
  if (!traversal) return false;
  const state = String(traversal.terminalState || traversal.status?.terminalState || '').trim();
  if (traversal.noParentDeclared === true) return true;
  if (['root-reached', 'root-reached-scope-transition', 'no-parent-declared', 'target-unavailable', 'ambiguous-parent', 'integrity-mismatch'].includes(state)) return true;
  return traversal.complete === true;
}

export const WorkspaceColumnSurface = React.memo(function WorkspaceColumnSurface({ workspace, state, referenceRecords = [], graphWorkspaces = [], selectionSession = null, onSelectionChoose, onSelectionCancel, layoutMode = 'expanded', onLayoutMode, onClose, onRenameWorkspace, onVerse, onQuery, onOpenDisplayOptions, onOpenAddDialog, onOpenCreateArtifact, onShareWorkspace, onExportWorkspace, onCloseSource, onDropFiles, onOpenRecord, onOpenGraphRecord, onFocusRecordLineage, onOpenAsset, onShareRecord, onRecordAction, onOpenSchema, onToggleTreeFolder, onSourceTransportRefresh, onOpenGovernance, onViewScroll, stageScrollTop, expandedLineageRecordIds = [], lineageAuditReport = null, lineageLoadReport = null, onToggleLineageCard, onRunLineageAudit, onLoadFullLineage, timePortal = null, historicalReadModel = null, readOnlyHistorical = false, onLoadHistoricalSnapshot, onReturnToLatest }) {
  const stageRef = useRef(null);
  const restoreKey = `${workspace?.id || 'workspace'}:${state.view?.workspaceVerse || 'feed'}:${state.view?.query || ''}:${state.view?.selectedRecordId || ''}`;
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const top = Number(stageScrollTop || 0);
    stage.scrollTop = Number.isFinite(top) && top > 0 ? top : 0;
  }, [restoreKey, stageScrollTop]);
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const requestedVerse = state.view?.workspaceVerse || 'feed';
  const selectionActive = Boolean(selectionSession?.ok);
  const selectionVerse = String(selectionSession?.presentation?.verse || '');
  const verse = selectionActive && ['feed', 'tree'].includes(selectionVerse) ? selectionVerse : readOnlyHistorical && !['feed', 'tree', 'graph'].includes(requestedVerse) ? 'feed' : requestedVerse;
  const lineageVerse = verse === 'lineage';
  const allRecords = Array.isArray(workspace.records) ? workspace.records : [];
  const transitionProductActionsVisible = !selectionActive && !readOnlyHistorical && (verse === 'feed' || verse === 'lineage');
  const transitionProductContext = useMemo(() => (transitionProductActionsVisible
    ? transitionProductContextForWorkspace({ workspaceRecords: allRecords, referenceRecords })
    : null), [transitionProductActionsVisible, allRecords, referenceRecords]);
  const selectedRecordId = String(state.view?.selectedRecordId || '');
  const lineageTraversalPreview = useMemo(() => (lineageVerse && selectedRecordId
    ? buildWorkspaceLineageView(workspace, { records: allRecords, query: '', selectedRecordId }).selectedTraversal
    : null), [lineageVerse, selectedRecordId, workspace, allRecords]);
  const lineageAlreadyReady = lineageControlsReadyForTraversal(lineageTraversalPreview);
  const lineageLoadReady = Boolean(lineageVerse && selectedRecordId && (lineageAlreadyReady || (lineageLoadReport && String(lineageLoadReport.selectedRecordId || '') === String(state.view?.selectedRecordId || ''))));
  const discoveryQuery = state.view?.query || '';
  const lineageQuery = lineageLoadReady ? (state.view?.lineageQuery || '') : '';
  const query = lineageVerse ? lineageQuery : discoveryQuery;
  const displayOptions = useMemo(() => normalizeWorkspaceDisplayOptions(state.view?.displayOptions), [state.view?.displayOptions]);
  const selectedRecord = selectedRecordFrom(workspace, selectedRecordId);
  const materialIndex = useMemo(() => buildDiscoveryMaterialIndex(allRecords), [allRecords]);
  const auditById = useMemo(() => auditIndexForWorkspace(workspace, allRecords), [workspace, allRecords]);
  const allAssets = useMemo(() => (Array.isArray(workspace.assets) ? workspace.assets : []), [workspace.assets]);
  const workspaceArtifactCount = useMemo(() => allRecords.filter(isWorkspaceRecord).length, [allRecords]);
  const discoveryView = useMemo(() => buildWorkspaceDiscoveryView(workspace, {
    records: allRecords,
    assets: allAssets,
    displayOptions,
    query: discoveryQuery,
    auditById,
    materialIndex
  }), [workspace, allRecords, allAssets, displayOptions, discoveryQuery, auditById, materialIndex]);
  const selectionCandidates = useMemo(() => (Array.isArray(selectionSession?.candidates) ? selectionSession.candidates : []).filter((item) => item?.enabled !== false && String(item.workspaceId || '') === String(workspace?.id || '')), [selectionSession, workspace?.id]);
  const selectionRecordIds = useMemo(() => new Set(selectionCandidates.filter((item) => item?.id).map((item) => String(item.id))), [selectionCandidates]);
  const records = selectionActive && verse !== 'tree' ? allRecords.filter((record) => selectionRecordIds.has(String(record.id))) : discoveryView.records;
  const assets = selectionActive ? [] : discoveryView.assets;
  const hasMaterial = Boolean(allRecords.length || allAssets.length);
  const isFilteredEmpty = Boolean(hasMaterial && !records.length && !assets.length);
  const presentation = useMemo(() => (verse === 'tree'
    ? presentWorkspaceTree(workspace, { verse, query: discoveryQuery })
    : presentWorkspaceFeed(workspace, { verse, query: discoveryQuery })), [workspace, verse, discoveryQuery]);
  const materialSummary = useMemo(() => summarizeWorkspaceMaterial(workspace), [workspace]);
  const interactionRevision = [
    state.activeWorkspaceId || '',
    workspace?.id || '',
    state.view?.workspaceVerse || '',
    state.view?.selectedRecordId || '',
    allRecords.length,
    allAssets.length,
    sources.map((source) => `${source.id || source.label || ''}:${source.discoveryState || ''}:${Number(source.count || 0)}`).join('|')
  ].join('::');
  if (layoutMode === 'compact') {
    return (
      <section className="tx-workspace-window tx-workspace-window-compact tx-schema-workspace-surface" aria-label={`Compact workspace ${presentation.title || ''}`.trim()} data-schema-id="tiinex.workspace.v1" data-workspace-layout="compact">
        <div className="tx-workspace-compact-inner">
          <Button icon="expand" variant="ghost" shape="round" aria-label={`Expand workspace ${presentation.title || ''}`.trim()} title="Expand workspace" onClick={() => onLayoutMode?.('expanded')} />
          {readOnlyHistorical ? (
            <div className="tx-workspace-compact-historical">
              <TimePortalCompactMarker timePortal={timePortal} />
              <div className="tx-workspace-compact-title tx-workspace-compact-title-readonly" title={`Historical workspace review · ${presentation.title || ''}`.trim()}>{presentation.title}</div>
            </div>
          ) : <button type="button" className="tx-workspace-compact-title" title="Rename workspace" onClick={onRenameWorkspace}>{presentation.title}</button>}
          <div className="tx-workspace-compact-stats" aria-label={`${allRecords.length} records, ${allAssets.length} assets, ${sources.length} sources`}>
            <span><Icon name="manualFiles" />{allRecords.length}</span>
            <span><Icon name="asset" />{allAssets.length}</span>
            <span><Icon name="source" />{sources.length}</span>
          </div>
          <Button icon="close" variant="ghost" shape="round" aria-label={`Close workspace ${presentation.title || ''}`.trim()} title="Close workspace" onClick={onClose} />
        </div>
      </section>
    );
  }

  return (
    <section className="tx-workspace-window tx-column-window tx-uc001-created-workspace tx-schema-workspace-surface tx-compact-column-window" aria-label="Tiinex workspace window" data-schema-id="tiinex.workspace.v1" data-workspace-layout="expanded" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); if (event.dataTransfer) onDropFiles?.(event.dataTransfer, { sourceMode: 'workspace-drop', fromDataTransfer: true }); }}>
      <header className="tx-window-header tx-workspace-schema-header tx-compact-window-header">
        <div className="tx-window-title-block">
          <h1>
            <button type="button" className="tx-workspace-title-rename-button" title={readOnlyHistorical ? 'Historical workspace review' : 'Rename workspace'} aria-label={`${readOnlyHistorical ? 'Historical workspace review' : 'Rename workspace'} ${presentation.title || ''}`.trim()} onClick={readOnlyHistorical ? undefined : onRenameWorkspace}>
              <span>{presentation.title}</span>
              <Icon name="edit" />
            </button>
          </h1>
          <WorkspaceBoundaryKicker workspace={workspace} />
        </div>
        <div className="tx-window-actions tx-compact-window-actions" aria-label="Workspace actions">
          <span className="tx-stat-pill" title="Visible records after Display options"><Icon name="manualFiles" />{records.length}</span>
          <span className="tx-stat-pill" title="Local assets"><Icon name="asset" />{allAssets.length}</span>
          <span className="tx-stat-pill" title="Workspace artifacts"><Icon name="workspace" />{workspaceArtifactCount}</span>
          <span className="tx-stat-pill" title="Sources"><Icon name="source" />{sources.length}</span>
          {!readOnlyHistorical ? <Button icon="create" variant="primary" aria-label="Create artifact" title="Create artifact" onClick={onOpenCreateArtifact}>Create</Button> : null}
          {!readOnlyHistorical ? <Button icon="add" variant="primary" shape="round" aria-label="Add to workspace" title="Add to workspace" onClick={onOpenAddDialog} /> : null}
          <Button icon="shareNodes" variant="ghost" shape="round" aria-label="Share workspace" title="Share workspace" onClick={onShareWorkspace} />
          {!readOnlyHistorical ? <Button icon="edit" variant="ghost" shape="round" aria-label="Rename workspace" title="Rename workspace" onClick={onRenameWorkspace} /> : null}
          {!readOnlyHistorical ? <Button icon="download" variant="ghost" shape="round" aria-label="Prepare workspace export" title="Prepare workspace export" onClick={onExportWorkspace} /> : null}
          <Button icon="collapse" variant="ghost" shape="round" aria-label="Collapse workspace" title="Collapse workspace" onClick={() => onLayoutMode?.('compact')} />
          <Button icon="close" variant="ghost" shape="round" aria-label="Close workspace" title="Close workspace" onClick={onClose} />
        </div>
      </header>
      <TimePortalBanner timePortal={timePortal} readModel={historicalReadModel} onLoadSnapshot={onLoadHistoricalSnapshot} onReturnLatest={onReturnToLatest} />
      <SourceStrip readOnly={readOnlyHistorical} workspace={workspace} boundary={presentation.sourceBoundary} onCloseSource={onCloseSource} onOpenAddDialog={onOpenAddDialog} onSourceTransportRefresh={onSourceTransportRefresh} onOpenGovernance={onOpenGovernance} />
      {selectionActive ? <WorkspaceSelectionSurface session={selectionSession} onCancel={onSelectionCancel} /> : null}
      {!readOnlyHistorical && !selectionActive ? <WorkspaceDropHint workspace={workspace} hasMaterial={hasMaterial} /> : null}
      <WorkspaceMaterialSummary summary={materialSummary} />
      <ModeToolbar readOnly={readOnlyHistorical} state={state} query={query} displayOptions={displayOptions} selectedRecord={selectedRecord} lineageLoadReport={lineageLoadReport} lineageReady={lineageLoadReady} onVerse={onVerse} onQuery={onQuery} onOpenDisplayOptions={onOpenDisplayOptions} onRunLineageAudit={onRunLineageAudit} onLoadFullLineage={onLoadFullLineage} />
      <ProgressStrip workspace={workspace} />
      <section ref={stageRef} className="tx-primary-stage tx-column-primary-stage" aria-label="Column feed" onScroll={(event) => onViewScroll?.(verse, event.currentTarget.scrollTop)} data-workspace-verse={verse}>
        {verse === 'tree'
          ? <WorkspaceTreeState workspace={workspace} query={selectionActive ? '' : query} records={selectionActive ? allRecords : records} assets={assets} auditById={auditById} expandedFolders={state.view?.expandedTreeFolders} onToggleTreeFolder={onToggleTreeFolder} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onOpenAsset={onOpenAsset} readOnly={readOnlyHistorical || selectionActive} selectionActive={selectionActive} selectionCandidates={selectionCandidates} onSelectCandidate={onSelectionChoose} />
          : verse === 'graph'
            ? <React.Suspense fallback={<div className="tx-graph-loading" role="status">Loading Node Graph Verse…</div>}><WorkspaceGraphState workspace={workspace} graphWorkspaces={graphWorkspaces} query={query} selectedRecordId={selectedRecordId} onOpenRecord={onOpenGraphRecord} readOnly={readOnlyHistorical} /></React.Suspense>
          : verse === 'lineage'
            ? <WorkspaceLineageState workspace={workspace} query={query} records={allRecords} selectedRecordId={selectedRecordId} auditById={auditById} onOpenRecord={onOpenRecord} onRecordAction={onRecordAction} onFocusRecordLineage={onFocusRecordLineage} onShareRecord={onShareRecord} onOpenSchema={onOpenSchema} lineageAuditReport={lineageAuditReport} lineageLoadReport={lineageLoadReport} lineageReady={lineageLoadReady} expandedRecordIds={expandedLineageRecordIds} displayOptions={displayOptions} onToggleLineageCard={onToggleLineageCard} actionStateKey={interactionRevision} workspaceRecords={allRecords} workspaceId={workspace.id} transitionProductContext={transitionProductContext} />
          : verse === 'audit'
            ? <WorkspaceAuditState workspace={workspace} query={query} records={allRecords} assets={allAssets} onOpenRecord={onOpenRecord} />
          : (records.length || assets.length)
            ? <DiscoveryRecordList
                records={records}
                assets={assets}
                stageScrollTop={stageScrollTop}
                auditById={auditById}
                actionStateKey={interactionRevision}
                workspaceRecords={allRecords}
                workspaceId={workspace.id}
                transitionProductContext={transitionProductContext}
                onOpenRecord={onOpenRecord}
                onFocusRecordLineage={onFocusRecordLineage}
                onShareRecord={onShareRecord}
                onRecordAction={onRecordAction}
                onOpenSchema={onOpenSchema}
                onOpenAsset={onOpenAsset}
                readOnly={readOnlyHistorical || selectionActive}
                selectionActive={selectionActive}
                selectionCandidates={selectionCandidates}
                onSelectCandidate={onSelectionChoose}
              />
            : <EmptyWorkspaceState filtered={isFilteredEmpty} hasMaterial={hasMaterial} query={query} summary={materialSummary} progress={workspace.discoveryProgress} />}
      </section>
    </section>
  );
}, workspaceColumnSurfacePropsEqual);

function workspaceColumnSurfacePropsEqual(previous = {}, next = {}) {
  return previous.workspace === next.workspace
    && previous.state === next.state
    && previous.referenceRecords === next.referenceRecords
    && previous.graphWorkspaces === next.graphWorkspaces
    && previous.selectionSession === next.selectionSession
    && previous.expandedLineageRecordIds === next.expandedLineageRecordIds
    && previous.lineageAuditReport === next.lineageAuditReport
    && previous.lineageLoadReport === next.lineageLoadReport
    && previous.timePortal === next.timePortal
    && previous.historicalReadModel === next.historicalReadModel
    && previous.readOnlyHistorical === next.readOnlyHistorical;
}
