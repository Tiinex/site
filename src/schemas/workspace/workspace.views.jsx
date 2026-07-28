import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
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

export { AssetDetailDialog } from './workspace.cards.views.jsx';
export { RecordDetailDialog, RecordMarkdownDialog, RecordActionDialog, CreateWorkspaceDialog, RenameWorkspaceDialog, CloseWorkspaceDialog } from './workspace.recordDialogs.views.jsx';
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
  if (['root-reached', 'root-reached-scope-transition', 'no-parent-declared', 'target-unavailable', 'ambiguous-parent', 'integrity-mismatch'].includes(state)) return true;
  return traversal.complete === true;
}

export const WorkspaceColumnSurface = React.memo(function WorkspaceColumnSurface({ workspace, state, onClose, onRenameWorkspace, onVerse, onQuery, onOpenDisplayOptions, onOpenAddDialog, onExportWorkspace, onCloseSource, onDropFiles, onOpenRecord, onFocusRecordLineage, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate, onShareRecord, onRecordAction, onToggleTreeFolder, onSourceTransportRefresh, onOpenGovernance, onViewScroll, stageScrollTop, expandedLineageRecordIds = [], lineageAuditReport = null, lineageLoadReport = null, onToggleLineageCard, onRunLineageAudit, onLoadFullLineage }) {
  const stageRef = useRef(null);
  const restoreKey = `${workspace?.id || 'workspace'}:${state.view?.workspaceVerse || 'feed'}:${state.view?.query || ''}:${state.view?.selectedRecordId || ''}`;
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const top = Number(stageScrollTop || 0);
    stage.scrollTop = Number.isFinite(top) && top > 0 ? top : 0;
  }, [restoreKey, stageScrollTop]);
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const verse = state.view?.workspaceVerse || 'feed';
  const lineageVerse = verse === 'lineage';
  const allRecords = Array.isArray(workspace.records) ? workspace.records : [];
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
  const allWorkspaceCandidates = useMemo(() => (Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : []), [workspace.workspaceMergeCandidates]);
  const discoveryView = useMemo(() => buildWorkspaceDiscoveryView(workspace, {
    records: allRecords,
    assets: allAssets,
    workspaceCandidates: allWorkspaceCandidates,
    displayOptions,
    query: discoveryQuery,
    auditById,
    materialIndex
  }), [workspace, allRecords, allAssets, allWorkspaceCandidates, displayOptions, discoveryQuery, auditById, materialIndex]);
  const workspaceCandidates = discoveryView.workspaceCandidates;
  const records = discoveryView.records;
  const assets = discoveryView.assets;
  const hasMaterial = Boolean(allRecords.length || allAssets.length || allWorkspaceCandidates.length);
  const isFilteredEmpty = Boolean(hasMaterial && !records.length && !assets.length && !workspaceCandidates.length);
  const presentation = useMemo(() => (verse === 'tree'
    ? presentWorkspaceTree(workspace, { verse, query: discoveryQuery })
    : presentWorkspaceFeed(workspace, { verse, query: discoveryQuery })), [workspace, verse, discoveryQuery]);
  const materialSummary = useMemo(() => summarizeWorkspaceMaterial(workspace), [workspace]);
  return (
    <section className="tx-workspace-window tx-column-window tx-uc001-created-workspace tx-schema-workspace-surface tx-compact-column-window" aria-label="Tiinex workspace window" data-schema-id="tiinex.workspace.v1" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer) onDropFiles?.(event.dataTransfer, { sourceMode: 'workspace-drop', fromDataTransfer: true }); }}>
      <header className="tx-window-header tx-workspace-schema-header tx-compact-window-header">
        <div className="tx-window-title-block">
          <h1>
            <button type="button" className="tx-workspace-title-rename-button" title="Rename workspace" aria-label={`Rename workspace ${presentation.title || ''}`.trim()} onClick={onRenameWorkspace}>
              <span>{presentation.title}</span>
              <Icon name="edit" />
            </button>
          </h1>
          <WorkspaceBoundaryKicker workspace={workspace} />
        </div>
        <div className="tx-window-actions tx-compact-window-actions" aria-label="Workspace actions">
          <span className="tx-stat-pill" title="Visible records after Display options"><Icon name="manualFiles" />{records.length}</span>
          <span className="tx-stat-pill" title="Local assets"><Icon name="asset" />{allAssets.length}</span>
          <span className="tx-stat-pill" title="Workspace candidates"><Icon name="workspace" />{allWorkspaceCandidates.length}</span>
          <span className="tx-stat-pill" title="Sources"><Icon name="source" />{sources.length}</span>
          <Button icon="add" variant="primary" shape="round" aria-label="Add to workspace" title="Add to workspace" onClick={onOpenAddDialog} />
          <Button icon="edit" variant="ghost" shape="round" aria-label="Rename workspace" title="Rename workspace" onClick={onRenameWorkspace} />
          <Button icon="download" variant="ghost" shape="round" aria-label="Export workspace package" title="Export workspace package" onClick={onExportWorkspace} />
          <Button icon="close" variant="ghost" shape="round" aria-label="Close workspace" title="Close workspace" onClick={onClose} />
        </div>
      </header>
      <SourceStrip workspace={workspace} boundary={presentation.sourceBoundary} onCloseSource={onCloseSource} onOpenAddDialog={onOpenAddDialog} onSourceTransportRefresh={onSourceTransportRefresh} onOpenGovernance={onOpenGovernance} />
      <WorkspaceDropHint workspace={workspace} hasMaterial={hasMaterial} />
      <WorkspaceMaterialSummary summary={materialSummary} />
      <ModeToolbar state={state} query={query} displayOptions={displayOptions} selectedRecord={selectedRecord} lineageLoadReport={lineageLoadReport} lineageReady={lineageLoadReady} onVerse={onVerse} onQuery={onQuery} onOpenDisplayOptions={onOpenDisplayOptions} onRunLineageAudit={onRunLineageAudit} onLoadFullLineage={onLoadFullLineage} />
      <ProgressStrip workspace={workspace} />
      <section ref={stageRef} className="tx-primary-stage tx-column-primary-stage" aria-label="Column feed" onScroll={(event) => onViewScroll?.(verse, event.currentTarget.scrollTop)} data-workspace-verse={verse}>
        {verse === 'tree'
          ? <WorkspaceTreeState workspace={workspace} query={query} records={records} assets={assets} workspaceCandidates={workspaceCandidates} auditById={auditById} expandedFolders={state.view?.expandedTreeFolders} onToggleTreeFolder={onToggleTreeFolder} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
          : verse === 'lineage'
            ? <WorkspaceLineageState workspace={workspace} query={query} records={allRecords} selectedRecordId={selectedRecordId} auditById={auditById} onOpenRecord={onOpenRecord} onRecordAction={onRecordAction} onFocusRecordLineage={onFocusRecordLineage} onShareRecord={onShareRecord} lineageAuditReport={lineageAuditReport} lineageLoadReport={lineageLoadReport} lineageReady={lineageLoadReady} expandedRecordIds={expandedLineageRecordIds} displayOptions={displayOptions} onToggleLineageCard={onToggleLineageCard} />
          : verse === 'audit'
            ? <WorkspaceAuditState workspace={workspace} query={query} records={allRecords} assets={allAssets} workspaceCandidates={allWorkspaceCandidates} onOpenRecord={onOpenRecord} />
          : (records.length || assets.length || workspaceCandidates.length)
            ? <DiscoveryRecordList
                workspaceCandidates={workspaceCandidates}
                records={records}
                assets={assets}
                stageScrollTop={stageScrollTop}
                auditById={auditById}
                onOpenWorkspaceCandidate={onOpenWorkspaceCandidate}
                onMergeWorkspaceCandidate={onMergeWorkspaceCandidate}
                onOpenRecord={onOpenRecord}
                onFocusRecordLineage={onFocusRecordLineage}
                onShareRecord={onShareRecord}
                onRecordAction={onRecordAction}
                onOpenAsset={onOpenAsset}
              />
            : <EmptyWorkspaceState filtered={isFilteredEmpty} hasMaterial={hasMaterial} query={query} summary={materialSummary} />}
      </section>
    </section>
  );
}, workspaceColumnSurfacePropsEqual);

function workspaceColumnSurfacePropsEqual(previous = {}, next = {}) {
  return previous.workspace === next.workspace
    && previous.state === next.state
    && previous.expandedLineageRecordIds === next.expandedLineageRecordIds
    && previous.lineageAuditReport === next.lineageAuditReport
    && previous.lineageLoadReport === next.lineageLoadReport;
}
