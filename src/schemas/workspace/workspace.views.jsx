import React, { useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { workspaceI18n } from './workspace.i18n.js';
import { createRecordActionResult, presentRecordActions, RecordActionKind } from '../../actions/record.actions.js';
import { createContinuationDraft, createReferenceDraft, listContinuationTargets } from '../../transitions/record.transitions.js';
import { presentWorkspaceFeed, presentWorkspaceTree } from './workspace.presenter.js';
import { buildWorkspacePathTree } from '../../workspaces/workspace.pathTree.js';
import { shouldShowWorkspaceSummary, summarizeWorkspaceMaterial } from '../../workspaces/workspace.summary.js';
import { buildWorkspaceLineageView } from '../../workspaces/workspace.lineageView.js';
import { buildWorkspaceAuditView } from '../../workspaces/workspace.auditView.js';
import { buildWorkspaceRecoverabilityView } from '../../workspaces/workspace.recoverabilityView.js';
import { inferRecordMaterialRole, isSupportingRecord, materialRoleLabel, sourceBoundaryClass, MaterialRole } from '../../workspaces/workspace.materialRole.js';

const DEFAULT_DISPLAY_OPTIONS = Object.freeze({
  leavesFirst: true,
  leavesOnly: false,
  mismatchesOnly: false,
  showSupportingMarkdown: false,
  showWorkspaceCandidates: true,
  showAssets: false,
  schemaFilter: 'all',
  artifactFilter: 'all',
  sourceFilter: 'all'
});

export function normalizeWorkspaceDisplayOptions(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    leavesFirst: source.leavesFirst !== false ? DEFAULT_DISPLAY_OPTIONS.leavesFirst : false,
    leavesOnly: source.leavesOnly === true,
    mismatchesOnly: source.mismatchesOnly === true,
    showSupportingMarkdown: source.showSupportingMarkdown === true ? true : DEFAULT_DISPLAY_OPTIONS.showSupportingMarkdown,
    showWorkspaceCandidates: source.showWorkspaceCandidates !== false ? DEFAULT_DISPLAY_OPTIONS.showWorkspaceCandidates : false,
    showAssets: source.showAssets === true ? true : DEFAULT_DISPLAY_OPTIONS.showAssets,
    schemaFilter: normalizeDisplayFilterValue(source.schemaFilter),
    artifactFilter: normalizeDisplayFilterValue(source.artifactFilter),
    sourceFilter: normalizeDisplayFilterValue(source.sourceFilter)
  };
}

function normalizeDisplayFilterValue(value) {
  const text = String(value || 'all').trim();
  return text || 'all';
}

function isSupportingMarkdownRecord(record = {}) {
  return isSupportingRecord(record);
}

function recordSourceClass(record = {}) {
  return sourceBoundaryClass(record);
}


function auditIndexForWorkspace(workspace = {}, records = []) {
  const audit = buildWorkspaceAuditView(workspace, { records, query: '' });
  return new Map((audit.items || []).map((item) => [item.id, item]));
}

function auditBadgeForRecord(record = {}, auditItem = null) {
  const item = auditItem || null;
  const status = String(item?.status || '').toLowerCase();
  if (status === 'readable') return { label: item?.fallbackUsed ? 'open' : 'schema ok', tone: item?.fallbackUsed ? 'open' : 'ok', title: item?.fallbackUsed ? 'Readable through root fallback; review schema confidence.' : 'Loaded leaf passed schema/audit checks; byte-level integrity is not claimed.' };
  if (status === 'supporting-material') return { label: 'doc', tone: 'open', title: 'Plain Markdown supporting material; not an invalid Tiinex leaf.' };
  if (status === 'pending-unavailable') return { label: 'open', tone: 'pending', title: 'Material is not loaded in this route/session; audit is pending.' };
  if (status === 'degraded') return { label: 'open', tone: 'pending', title: 'Readable with warnings or fallback; review lineage/source confidence.' };
  if (status) return { label: 'mismatch', tone: 'mismatch', title: 'Audit found errors or incomplete Tiinex leaf structure.' };
  if (record?.hasIntegrity || record?.hasContinuityContext || record?.schemaId) return { label: 'open', tone: 'pending', title: 'Lineage/audit status is not fully resolved yet.' };
  return { label: 'doc', tone: 'open', title: 'Supporting material.' };
}

function AuditStatusBadge({ record, item }) {
  const badge = auditBadgeForRecord(record, item);
  return <Badge className={`tx-audit-badge tx-audit-badge-${badge.tone}`} title={badge.title}>{badge.label}</Badge>;
}

function auditIsMismatch(record = {}, auditItem = null) {
  return auditBadgeForRecord(record, auditItem).tone === 'mismatch';
}

function recordSchemaValue(record = {}) {
  return String(record.schemaId || record.currentSchemaId || record.envelopeSchemaId || record.kind || 'artifact').trim() || 'artifact';
}

function recordArtifactClass(record = {}) {
  return inferRecordMaterialRole(record);
}


function displayRecordIncluded(record = {}, options = {}, auditById = new Map()) {
  const supporting = isSupportingMarkdownRecord(record);
  if ((options.leavesOnly || !options.showSupportingMarkdown) && supporting) return false;
  if (options.mismatchesOnly && !auditIsMismatch(record, auditById.get(record.id))) return false;
  const schemaFilter = normalizeDisplayFilterValue(options.schemaFilter);
  if (schemaFilter !== 'all' && recordSchemaValue(record) !== schemaFilter) return false;
  const artifactFilter = normalizeDisplayFilterValue(options.artifactFilter);
  if (artifactFilter !== 'all' && recordArtifactClass(record) !== artifactFilter) return false;
  const sourceFilter = normalizeDisplayFilterValue(options.sourceFilter);
  if (sourceFilter !== 'all' && recordSourceClass(record) !== sourceFilter) return false;
  return true;
}

function displayOptionChoices(records = [], auditById = new Map()) {
  const schemaCounts = new Map();
  const artifactCounts = new Map();
  const sourceCounts = new Map();
  for (const record of Array.isArray(records) ? records : []) {
    const schema = recordSchemaValue(record);
    schemaCounts.set(schema, (schemaCounts.get(schema) || 0) + 1);
    const artifact = recordArtifactClass(record);
    artifactCounts.set(artifact, (artifactCounts.get(artifact) || 0) + 1);
    const sourceClass = recordSourceClass(record);
    sourceCounts.set(sourceClass, (sourceCounts.get(sourceClass) || 0) + 1);
  }
  const schemas = Array.from(schemaCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const artifacts = [MaterialRole.leaf, MaterialRole.schemaDefinition, MaterialRole.supporting, MaterialRole.unknown].filter((key) => artifactCounts.has(key)).map((key) => [key, artifactCounts.get(key)]);
  const sources = ['source-backed', 'local', 'unknown'].filter((key) => sourceCounts.has(key)).map((key) => [key, sourceCounts.get(key)]);
  const supportingCount = (artifactCounts.get(MaterialRole.supporting) || 0) + (artifactCounts.get(MaterialRole.schemaDefinition) || 0) + (artifactCounts.get(MaterialRole.unknown) || 0);
  const mismatchCount = (Array.isArray(records) ? records : []).filter((record) => auditIsMismatch(record, auditById.get(record.id))).length;
  return { schemas, artifacts, sources, supportingCount, mismatchCount, leafCount: artifactCounts.get(MaterialRole.leaf) || 0 };
}


function selectedRecordFrom(workspace = {}, selectedRecordId = '') {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  return records.find((record) => record.id === selectedRecordId) || null;
}

export function WorkspaceColumnSurface({ workspace, state, onClose, onVerse, onQuery, onOpenDisplayOptions, onOpenAddDialog, onCloseSource, onDropFiles, onOpenRecord, onFocusRecordLineage, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate, onShareRecord, onRecordAction, onToggleTreeFolder }) {
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const query = state.view?.query || '';
  const verse = state.view?.workspaceVerse || 'feed';
  const displayOptions = normalizeWorkspaceDisplayOptions(state.view?.displayOptions);
  const allRecords = Array.isArray(workspace.records) ? workspace.records : [];
  const selectedRecordId = String(state.view?.selectedRecordId || '');
  const selectedRecord = selectedRecordFrom(workspace, selectedRecordId);
  const auditById = auditIndexForWorkspace(workspace, allRecords);
  const allAssets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const allWorkspaceCandidates = Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [];
  const workspaceCandidates = displayOptions.showWorkspaceCandidates ? allWorkspaceCandidates.filter((candidate) => workspaceCandidateMatchesQuery(candidate, query)) : [];
  const displayChoices = displayOptionChoices(allRecords, auditById);
  const records = prioritizeDiscoveryRecords(allRecords
    .filter((record) => displayRecordIncluded(record, displayOptions, auditById))
    .filter((record) => recordMatchesQuery(record, query)), displayOptions);
  const assets = displayOptions.showAssets ? allAssets.filter((asset) => assetMatchesQuery(asset, query)) : [];
  const hasMaterial = Boolean(allRecords.length || allAssets.length || allWorkspaceCandidates.length);
  const isFilteredEmpty = Boolean(hasMaterial && !records.length && !assets.length && !workspaceCandidates.length);
  const presentation = verse === 'tree'
    ? presentWorkspaceTree(workspace, { verse, query })
    : presentWorkspaceFeed(workspace, { verse, query });
  const materialSummary = summarizeWorkspaceMaterial(workspace);
  return (
    <section className="tx-workspace-window tx-column-window tx-uc001-created-workspace tx-schema-workspace-surface tx-compact-column-window" aria-label="Tiinex workspace window" data-schema-id="tiinex.workspace.v1" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer) onDropFiles?.(event.dataTransfer, { sourceMode: 'workspace-drop', fromDataTransfer: true }); }}>
      <header className="tx-window-header tx-workspace-schema-header tx-compact-window-header">
        <div className="tx-window-title-block">
          <h1>{presentation.title}</h1>
          <span className="tx-window-kicker tx-local-workspace-kicker" title="Local/session workspace; source provenance is not inferred."><Icon name="workspace" /><span>local</span></span>
        </div>
        <div className="tx-window-actions tx-compact-window-actions" aria-label="Workspace actions">
          <span className="tx-stat-pill" title="Shown artifacts"><Icon name="manualFiles" />{records.length}</span>
          <span className="tx-stat-pill" title="Local assets"><Icon name="asset" />{allAssets.length}</span>
          <span className="tx-stat-pill" title="Workspace candidates"><Icon name="workspace" />{allWorkspaceCandidates.length}</span>
          <span className="tx-stat-pill" title="Sources"><Icon name="source" />{sources.length}</span>
          <Button icon="add" variant="primary" shape="round" aria-label="Add to workspace" title="Add to workspace" onClick={onOpenAddDialog} />
          <Button icon="close" variant="ghost" shape="round" aria-label="Close workspace" title="Close workspace" onClick={onClose} />
        </div>
      </header>
      <SourceStrip workspace={workspace} boundary={presentation.sourceBoundary} onCloseSource={onCloseSource} onOpenAddDialog={onOpenAddDialog} />
      <WorkspaceDropHint workspace={workspace} hasMaterial={hasMaterial} />
      <WorkspaceMaterialSummary summary={materialSummary} />
      <ModeToolbar state={state} query={query} displayOptions={displayOptions} selectedRecord={selectedRecord} onVerse={onVerse} onQuery={onQuery} onOpenDisplayOptions={onOpenDisplayOptions} />
      <ProgressStrip workspace={workspace} />
      <section className="tx-primary-stage tx-column-primary-stage" aria-label="Column feed">
        {verse === 'tree'
          ? <WorkspaceTreeState workspace={workspace} query={query} records={records} assets={assets} workspaceCandidates={workspaceCandidates} auditById={auditById} expandedFolders={state.view?.expandedTreeFolders} onToggleTreeFolder={onToggleTreeFolder} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
          : verse === 'lineage'
            ? <WorkspaceLineageState workspace={workspace} query={query} records={allRecords} selectedRecordId={selectedRecordId} auditById={auditById} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onOpenAudit={() => onVerse('audit')} />
          : verse === 'audit'
            ? <WorkspaceAuditState workspace={workspace} query={query} records={allRecords} assets={allAssets} workspaceCandidates={allWorkspaceCandidates} onOpenRecord={onOpenRecord} />
          : (records.length || assets.length || workspaceCandidates.length)
            ? <>
                {workspaceCandidates.map((candidate) => <WorkspaceCandidateCard key={candidate.id || candidate.path} candidate={candidate} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />)}
                {records.map((record) => <RecordCard key={record.id} record={record} auditItem={auditById.get(record.id)} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onShareRecord={onShareRecord} onRecordAction={onRecordAction} />)}
                {assets.map((asset) => <AssetCard key={asset.id || asset.path} asset={asset} onOpenAsset={onOpenAsset} />)}
              </>
            : <EmptyWorkspaceState filtered={isFilteredEmpty} hasMaterial={hasMaterial} query={query} />}
      </section>
    </section>
  );
}


function SourceStrip({ workspace, boundary, onCloseSource, onOpenAddDialog }) {
  const sources = (Array.isArray(workspace.sources) ? workspace.sources : []).filter((source) => {
    const kind = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
    const isLocal = kind.includes('local');
    return !(isLocal && Number(source.count || 0) <= 0);
  });
  if (!sources.length) return null;
  return (
    <div className="tx-source-strip workspace-source-strip tx-compact-source-strip" aria-label="Workspace sources">
      <div className="tx-source-list">
        {sources.map((source) => {
          const closeable = Boolean(source.closeable);
          const kind = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
          const transport = sourceTransportMode(source);
          const idle = source.discoveryState === 'deferred' || source.discoveryState === 'not-started';
          return (
            <span key={source.id || source.label} className={`tx-source-pill ${closeable ? 'tx-source-pill-closeable' : ''} ${kind.includes('github') ? 'source-github' : 'source-local'}`} title={source.boundary || boundary || ''}>
              <Icon name={kind.includes('github') ? 'source' : 'workspace'} />
              <strong>{source.label || source.id || 'Source'}</strong>
              <small>{source.count || 0}</small>
              {transport ? <em className="tx-source-transport" title={source.transportLabel || transport}>{transport}</em> : null}
              {source.discoveryState ? <em className={`tx-source-state tx-source-state-${source.discoveryState}`}>{source.discoveryState}</em> : null}
              {idle ? <em className="tx-source-motion-state" title="No source materialization is currently running.">idle</em> : null}
              {closeable ? <button type="button" className="tx-source-load" aria-label={`Discover material for ${source.label || 'source'}`} title="Open source controls for this source: choose repo files, explicit files, or issue snapshots" onClick={() => onOpenAddDialog?.(source.id)}><Icon name="add" /><span>Discover</span></button> : null}
              {closeable ? <button type="button" className="tx-source-close" aria-label={`Close ${source.label || 'source'}`} onClick={() => onCloseSource?.(source.id)}><Icon name="close" /></button> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function sourceTransportMode(source = {}) {
  const label = String(source.transportLabel || source.transport || '').toLowerCase();
  if (label.includes('cache')) return 'cache';
  if (label.includes('mirror')) return 'mirror';
  if (label.includes('proxy')) return 'proxy';
  if (label.includes('direct') || label.includes('raw') || label.includes('api')) return 'direct';
  if (source.adapterId === 'github') return 'direct';
  return '';
}

function WorkspaceMaterialSummary({ summary }) {
  if (!shouldShowWorkspaceSummary(summary)) return null;
  const counts = summary.counts || {};
  const latest = summary.latestImport;
  return (
    <section className="tx-workspace-material-summary" aria-label="Workspace material summary">
      <div className="tx-material-summary-counts">
        <span><Icon name="manualFiles" /><strong>{counts.records || 0}</strong><small>artifacts</small></span>
        <span><Icon name="asset" /><strong>{counts.assets || 0}</strong><small>assets</small></span>
        <span><Icon name="workspace" /><strong>{counts.workspaceCandidates || 0}</strong><small>workspaces</small></span>
        {counts.sourceBackedRecords ? <span><Icon name="source" /><strong>{counts.sourceBackedRecords}</strong><small>source-backed</small></span> : null}
      </div>
      {latest ? (
        <div className={`tx-material-summary-import ${latest.ok ? 'tx-import-ok' : 'tx-import-degraded'}`} title={latest.message}>
          <Icon name={latest.ok ? 'check' : 'warning'} />
          <span>{latest.message}</span>
          {(counts.warnings || counts.errors || counts.previewOmitted) ? (
            <small>{counts.errors || 0} errors · {counts.warnings || 0} warnings · {counts.previewOmitted || 0} previews omitted</small>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ProgressStrip({ workspace }) {
  const progress = workspace.discoveryProgress;
  if (!progress?.active) return null;
  return (
    <div className="tx-progress-strip tx-portal-resolution-progress" role="status" aria-live="polite" data-phase={progress.phase || 'resolving'}>
      <span>{progress.label || 'Preparing source snapshot'}</span>
      {progress.quantified !== false && progress.percent != null ? <div className="tx-progress-bar" aria-label="Source progress"><i style={{ width: `${Math.max(0, Math.min(100, Number(progress.percent || 0)))}%` }} /></div> : <small className="tx-progress-phase">{progress.phase || 'working'}</small>}
    </div>
  );
}

function WorkspaceDropHint({ workspace, hasMaterial }) {
  if (hasMaterial || workspace.discoveryProgress) return null;
  return (
    <div className="tx-workspace-drop-hint" role="note">
      <p><strong>Drop local material here</strong><span>.md, folders, or .zip · local/session only</span></p>
    </div>
  );
}

function ModeToolbar({ state, query, displayOptions, selectedRecord, onVerse, onQuery, onOpenDisplayOptions }) {
  const verse = state.view?.workspaceVerse || 'feed';
  const discoveryVerse = verse === 'feed' || verse === 'tree';
  const lineageVerse = verse === 'lineage';
  const auditVerse = verse === 'audit';
  const modeLabel = lineageVerse ? 'LINEAGE MODE' : auditVerse ? 'AUDIT DETAILS' : 'DISCOVERY MODE';
  const hiddenPresentationCount = (displayOptions?.showAssets === false ? 1 : 0) + (displayOptions?.showWorkspaceCandidates === false ? 1 : 0) + (displayOptions?.showSupportingMarkdown === false ? 1 : 0) + (displayOptions?.leavesOnly ? 1 : 0) + (displayOptions?.mismatchesOnly ? 1 : 0) + (displayOptions?.schemaFilter !== 'all' ? 1 : 0) + (displayOptions?.artifactFilter !== 'all' ? 1 : 0) + (displayOptions?.sourceFilter !== 'all' ? 1 : 0);
  const returnVerse = auditVerse && selectedRecord ? 'lineage' : 'feed';
  return (
    <div className="tx-mode-strip tx-column-toolbar" aria-label="Mode controls">
      <strong className="tx-mode-name">{modeLabel}</strong>
      {discoveryVerse ? (
        <div className="tx-segment" aria-label="Discovery view">
          <button type="button" className={verse === 'feed' ? 'tx-active' : ''} onClick={() => onVerse('feed')}>Feed</button>
          <button type="button" className={verse === 'tree' ? 'tx-active' : ''} onClick={() => onVerse('tree')}>Tree</button>
        </div>
      ) : (
        <button type="button" className="tx-mode-return" onClick={() => onVerse(returnVerse)}>← Back</button>
      )}
      {lineageVerse && selectedRecord ? <span className="tx-selected-lineage-chip" title={selectedRecord.path || selectedRecord.title}>Selected · {compactPath(selectedRecord.title || selectedRecord.path || 'artifact')}</span> : null}
      {lineageVerse && selectedRecord ? <button type="button" className="tx-mode-link tx-audit-details-trigger" onClick={() => onVerse('audit')}>Audit</button> : null}
      {discoveryVerse ? <button type="button" className="tx-mode-link tx-display-options-trigger" onClick={onOpenDisplayOptions}>Display options{hiddenPresentationCount ? ` · ${hiddenPresentationCount} hidden` : ''}</button> : null}
      <label className="tx-search-field tx-search-field-icon">
        <Icon name="search" />
        <input value={query} onChange={(event) => onQuery(event.target.value)} type="search" placeholder={lineageVerse ? 'Search lineage title/body/schema…' : 'Search title/body/schema…'} />
      </label>
    </div>
  );
}

function EmptyWorkspaceState({ filtered, hasMaterial, query }) {
  const message = filtered
    ? 'No nodes match this view.'
    : hasMaterial
      ? 'No artifacts match this view.'
      : 'No material yet.';
  const hint = filtered && query
    ? `Search filter: ${query}`
    : '';
  return (
    <div className="tx-empty-node-state tx-compact-empty-node-state" role="status" aria-live="polite">
      <p>{message}</p>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function WorkspaceTreeState({ workspace, query = '', records, assets = [], workspaceCandidates = [], auditById = new Map(), expandedFolders = [], onToggleTreeFolder, onOpenRecord, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  query = String(query || '').trim();
  const tree = buildWorkspacePathTree({
    records,
    assets,
    workspaceCandidates,
    rootLabel: `Root · ${workspace.title || workspace.name || 'workspace'}`,
    query
  });
  const expandedSet = new Set(Array.isArray(expandedFolders) ? expandedFolders : []);
  return (
    <div className="tx-workspace-tree-state tx-path-tree-state" role="tree" aria-label="Workspace path tree">
      <div className="tx-tree-root tx-path-tree-root">
        <span><Icon name="tree" /> {tree.rootLabel}</span>
        <TreeCountBadges counts={tree.counts} />
      </div>
      {tree.folders.map((folder) => (
        <TreeFolder key={folder.path || folder.name} folder={folder} query={query} expandedSet={expandedSet} onToggleFolder={onToggleTreeFolder} auditById={auditById} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
      ))}
      {tree.items.map((item) => (
        <TreeLeafItem key={item.id || item.path} item={item} auditById={auditById} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
      ))}
      {tree.empty ? <p className="tx-tree-empty">No loaded artifacts, assets, or workspace candidates yet. Source and workspace boundaries remain visible.</p> : null}
    </div>
  );
}

function TreeFolder({ folder, query, expandedSet = new Set(), onToggleFolder, auditById = new Map(), onOpenRecord, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  const open = Boolean(query) || expandedSet.has(folder.path || folder.name || '');
  return (
    <details className="tx-tree-folder" open={open} role="group" data-tree-folder-path={folder.path || folder.name || ''} onToggle={(event) => { if (event.currentTarget === event.target && !query) onToggleFolder?.(folder.path || folder.name || '', event.currentTarget.open); }}>
      <summary className="tx-tree-folder-summary" role="treeitem" aria-label={`Folder ${folder.name}`}>
        <span className="tx-tree-folder-name"><Icon name="folderOpen" /> {folder.name}</span>
        <TreeCountBadges counts={folder.counts} />
      </summary>
      <div className="tx-tree-folder-children">
        {folder.folders.map((child) => (
          <TreeFolder key={child.path || child.name} folder={child} query={query} expandedSet={expandedSet} onToggleFolder={onToggleFolder} auditById={auditById} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
        ))}
        {folder.items.map((item) => (
          <TreeLeafItem key={item.id || item.path} item={item} auditById={auditById} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
        ))}
      </div>
    </details>
  );
}

function TreeLeafItem({ item, auditById = new Map(), onOpenRecord, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  if (item.type === 'workspace') {
    return (
      <div className="tx-tree-record-row tx-tree-workspace-candidate-row tx-tree-leaf-row" role="treeitem">
        <button type="button" className="tx-tree-row-main" onClick={() => onOpenWorkspaceCandidate?.(item.source.id || item.source.path)}>
          <span><Icon name="workspace" /> {item.title || item.name || 'Workspace candidate'}</span>
          <Badge>workspace</Badge>
        </button>
        <button type="button" className="tx-tree-row-action" onClick={() => onMergeWorkspaceCandidate?.(item.source.id || item.source.path)}>Merge</button>
      </div>
    );
  }
  if (item.type === 'asset') {
    return (
      <button type="button" className="tx-tree-record-row tx-tree-asset-row tx-tree-leaf-row" role="treeitem" onClick={() => onOpenAsset?.(item.source.id || item.source.path)} title={item.path || ''}>
        <span><Icon name="asset" /> {item.name || item.title || 'Asset'}</span>
        <Badge>{item.source.previewState || item.kind || 'asset'}</Badge>
      </button>
    );
  }
  const auditItem = auditById.get(item.source.id);
  return (
    <button type="button" className="tx-tree-record-row tx-tree-leaf-row" role="treeitem" onClick={() => onOpenRecord?.(item.source.id)} title={item.path || ''}>
      <span><Icon name="open" /> {item.name || item.title || 'Untitled'}</span>
      <span className="tx-tree-row-badges">
        <AuditStatusBadge record={item.source} item={auditItem} />
        <Badge>{item.source.kind || item.kind || 'artifact'}</Badge>
      </span>
    </button>
  );
}

function TreeCountBadges({ counts = {} }) {
  const records = Number(counts.records || 0);
  const assets = Number(counts.assets || 0);
  const candidates = Number(counts.workspaceCandidates || 0);
  return (
    <span className="tx-tree-counts" aria-label={`${records} artifacts, ${assets} assets, ${candidates} workspace candidates`}>
      {records ? <span className="tx-tree-count-chip"><Icon name="manualFiles" />{records}</span> : null}
      {assets ? <span className="tx-tree-count-chip"><Icon name="asset" />{assets}</span> : null}
      {candidates ? <span className="tx-tree-count-chip"><Icon name="workspace" />{candidates}</span> : null}
    </span>
  );
}




function WorkspaceAuditState({ workspace, query = '', records = [], assets = [], workspaceCandidates = [], onOpenRecord }) {
  const audit = buildWorkspaceAuditView(workspace, { records, query });
  const recovery = buildWorkspaceRecoverabilityView(workspace, { records, assets, workspaceCandidates });
  const counts = audit.visibleCounts || audit.counts || {};
  return (
    <section className="tx-workspace-audit-state" aria-label="Loaded audit">
      <header className="tx-audit-header">
        <div>
          <strong><Icon name="audit" /> {audit.title}</strong>
          <small>{audit.boundary}</small>
        </div>
        <div className="tx-audit-stats" aria-label="Audit stats">
          <span><strong>{counts.records || 0}</strong><small>records</small></span>
          <span><strong>{counts.invalid || 0}</strong><small>invalid</small></span>
          <span><strong>{counts.degraded || 0}</strong><small>degraded</small></span>
          {counts.supporting ? <span><strong>{counts.supporting}</strong><small>supporting</small></span> : null}
          <span><strong>{counts.missingLineage || 0}</strong><small>missing lineage</small></span>
        </div>
      </header>
      <div className="tx-audit-finding-summary" aria-label="Audit finding summary">
        <span><Icon name={counts.errors ? 'warning' : 'check'} /> {counts.errors || 0} errors</span>
        <span><Icon name={counts.warnings ? 'warning' : 'check'} /> {counts.warnings || 0} warnings</span>
        <span><Icon name="audit" /> {counts.fallbackUsed || 0} root fallback</span>
        <span><Icon name="lineage" /> {counts.lineageFindings || 0} lineage findings</span>
      </div>
      {audit.lineage.findings.length ? (
        <div className="tx-audit-lineage-findings" aria-label="Loaded lineage audit findings">
          {audit.lineage.findings.slice(0, 6).map((finding, index) => (
            <span key={`${finding.code}-${finding.nodeId}-${index}`} className={`tx-lineage-finding tx-${finding.severity || 'info'}`} title={finding.message}>
              <Icon name={(finding.severity === 'warning' || finding.severity === 'error') ? 'warning' : 'check'} /> {finding.code}
            </span>
          ))}
        </div>
      ) : null}
      <AuditRecoverabilitySummary recovery={recovery} />
      <div className="tx-audit-record-list" role="list" aria-label="Loaded audit records">
        {audit.items.map((item) => <AuditRecordRow key={item.id} item={item} onOpenRecord={onOpenRecord} />)}
      </div>
      {audit.empty ? <p className="tx-tree-empty">No loaded records match this audit view.</p> : null}
    </section>
  );
}


function AuditRecoverabilitySummary({ recovery }) {
  if (!recovery) return null;
  const counts = recovery.counts || {};
  const latest = recovery.latestImport;
  return (
    <section className={`tx-audit-recovery-summary tx-recovery-${recovery.status || 'recoverable'}`} aria-label="Recoverability summary">
      <header>
        <strong><Icon name={recovery.status === 'needs-attention' ? 'warning' : 'check'} /> {recovery.status || 'recoverable'}</strong>
        <small>{recovery.boundary}</small>
      </header>
      <div className="tx-audit-recovery-grid">
        <span><strong>{counts.localRecords || 0}</strong><small>local records</small></span>
        <span><strong>{counts.sourceBackedRecords || 0}</strong><small>source-backed</small></span>
        <span><strong>{counts.assets || 0}</strong><small>assets</small></span>
        <span><strong>{counts.workspaceCandidates || 0}</strong><small>workspaces</small></span>
        <span><strong>{counts.previewOmitted || 0}</strong><small>preview omitted</small></span>
      </div>
      {latest ? <p className="tx-audit-recovery-latest"><Icon name={latest.ok ? 'check' : 'warning'} /> {latest.message}</p> : null}
      {recovery.publicationPreflight ? <AuditPublicationPreflight preflight={recovery.publicationPreflight} /> : null}
      {recovery.reingestPlan ? <AuditReingestPlan plan={recovery.reingestPlan} /> : null}
      {recovery.exportPackagePreflight ? <AuditExportPackagePreflight preflight={recovery.exportPackagePreflight} /> : null}
      {recovery.exportPackageManifest ? <AuditExportPackageManifest manifest={recovery.exportPackageManifest} receipt={recovery.exportPackageReceipt} /> : null}
      <ul className="tx-audit-recovery-guarantees">
        {(recovery.guarantees || []).slice(0, 4).map((item) => <li key={item}>{item}</li>)}
      </ul>
      {(recovery.errors?.length || recovery.warnings?.length) ? (
        <div className="tx-audit-recovery-issues">
          {[...(recovery.errors || []), ...(recovery.warnings || [])].slice(0, 6).map((issue, index) => (
            <span key={`${issue.code}-${issue.path}-${index}`} title={issue.message || issue.code}><Icon name="warning" /> {issue.code}{issue.path ? ` · ${compactPath(issue.path)}` : ''}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}


function AuditPublicationPreflight({ preflight }) {
  const counts = preflight.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-preflight-${preflight.status || 'unknown'}`} aria-label="Publication preflight">
      <span><Icon name={preflight.status === 'blocked' ? 'warning' : 'check'} /> publication preflight: <strong>{preflight.status || 'unknown'}</strong></span>
      <span>{counts.publishableLocalDrafts || 0} publishable local draft{(counts.publishableLocalDrafts || 0) === 1 ? '' : 's'}</span>
      <span>{counts.sourceReferences || 0} source reference{(counts.sourceReferences || 0) === 1 ? '' : 's'}</span>
      {(counts.errors || counts.warnings) ? <span>{counts.errors || 0} errors · {counts.warnings || 0} warnings</span> : null}
    </div>
  );
}

function AuditExportPackagePreflight({ preflight }) {
  const counts = preflight.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-export-package-${preflight.status || 'unknown'}`} aria-label="Export package preflight">
      <span><Icon name={preflight.status === 'blocked' ? 'warning' : 'check'} /> export package: <strong>{preflight.status || 'unknown'}</strong></span>
      <span>{counts.packageEntries || 0} package entr{(counts.packageEntries || 0) === 1 ? 'y' : 'ies'}</span>
      <span>{counts.localDraftEntries || 0} local draft{(counts.localDraftEntries || 0) === 1 ? '' : 's'} · {counts.sourceReferenceEntries || 0} source ref{(counts.sourceReferenceEntries || 0) === 1 ? '' : 's'}</span>
      {(counts.errors || counts.warnings) ? <span>{counts.errors || 0} errors · {counts.warnings || 0} warnings</span> : null}
    </div>
  );
}


function AuditExportPackageManifest({ manifest, receipt }) {
  const counts = manifest.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-export-manifest-${manifest.status || 'unknown'}`} aria-label="Export package manifest">
      <span><Icon name={manifest.status === 'blocked' ? 'warning' : 'check'} /> package manifest: <strong>{manifest.status || 'unknown'}</strong></span>
      <span>{counts.entries || 0} planned entr{(counts.entries || 0) === 1 ? 'y' : 'ies'} · {counts.blocked || 0} blocked</span>
      <span>{manifest.integrity?.fingerprint || 'no fingerprint'}</span>
      {receipt ? <span>receipt: {receipt.state || 'unknown'}</span> : null}
    </div>
  );
}

function AuditReingestPlan({ plan }) {
  const counts = plan.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-reingest-${plan.status || 'unknown'}`} aria-label="Re-ingest plan">
      <span><Icon name={plan.status === 'blocked' ? 'warning' : 'check'} /> re-ingest plan: <strong>{plan.status || 'unknown'}</strong></span>
      <span>{counts.pinnedSourceTargets || 0}/{counts.sourceTargets || 0} pinned source target{(counts.sourceTargets || 0) === 1 ? '' : 's'}</span>
      <span>{counts.localDraftTargets || 0} local draft target{(counts.localDraftTargets || 0) === 1 ? '' : 's'}</span>
      {(counts.errors || counts.warnings) ? <span>{counts.errors || 0} errors · {counts.warnings || 0} warnings</span> : null}
    </div>
  );
}

function AuditRecordRow({ item, onOpenRecord }) {
  const findings = item.findings || [];
  return (
    <button type="button" className={`tx-audit-record-row tx-audit-status-${item.status || 'unknown'}`} role="listitem" onClick={() => onOpenRecord?.(item.id)} title={item.path || ''}>
      <span className="tx-audit-record-main">
        <Icon name={item.status === 'readable' ? 'check' : 'warning'} />
        <strong>{item.title}</strong>
      </span>
      <span className="tx-audit-record-meta">
        <Badge>{item.status}</Badge>
        <Badge>{item.schemaId || 'markdown'}</Badge>
        <Badge>{item.sourceBacked ? 'source-backed' : 'local/session'}</Badge>
        {item.fallbackUsed ? <Badge>root fallback</Badge> : null}
        {item.path ? <small>{compactPath(item.path)}</small> : null}
      </span>
      {findings.length ? <small className="tx-audit-record-findings">{findings.slice(0, 3).map((finding) => finding.code).join(' · ')}</small> : null}
    </button>
  );
}

function WorkspaceLineageState({ workspace, query = '', records = [], selectedRecordId = '', auditById = new Map(), onOpenRecord, onFocusRecordLineage, onOpenAudit }) {
  const lineage = buildWorkspaceLineageView(workspace, { records, query });
  const selected = selectedRecordId ? lineage.nodes.find((node) => node.id === selectedRecordId) : null;
  const selectedAudit = selected ? auditById.get(selected.id) : null;
  return (
    <section className="tx-workspace-lineage-state" aria-label="Loaded lineage">
      <header className="tx-lineage-header">
        <div>
          <strong><Icon name="lineage" /> {lineage.title}</strong>
          <small>Loaded-only Parent Trace/Origin resolution · no network guesses</small>
        </div>
        <div className="tx-lineage-stats" aria-label="Lineage stats">
          <span><strong>{lineage.stats.visibleNodes}</strong><small>nodes</small></span>
          <span><strong>{lineage.stats.visibleEdges}</strong><small>edges</small></span>
          <span><strong>{lineage.stats.missingEdges || 0}</strong><small>missing</small></span>
          <span><strong>{lineage.stats.visibleFindings}</strong><small>findings</small></span>
        </div>
      </header>
      {selected ? <LineageSelectedSummary node={selected} auditItem={selectedAudit} lineage={lineage} onOpenRecord={onOpenRecord} onOpenAudit={onOpenAudit} /> : null}
      <details className="tx-lineage-workspace-overview" open={!selected} aria-label="Workspace lineage overview">
        <summary>Workspace lineage overview · {lineage.stats.visibleNodes} nodes · {lineage.stats.missingEdges || 0} missing · {lineage.stats.visibleFindings} findings</summary>
        {lineage.findings.length ? (
          <div className="tx-lineage-findings" aria-label="Workspace lineage findings"><strong>Workspace findings</strong>
            {lineage.findings.slice(0, 5).map((finding, index) => (
              <span key={`${finding.code}-${finding.nodeId}-${index}`} className={`tx-lineage-finding tx-${finding.severity || 'info'}`} title={finding.message}>
                <Icon name={(finding.severity === 'warning' || finding.severity === 'error') ? 'warning' : 'check'} /> {finding.code}
              </span>
            ))}
          </div>
        ) : null}
        {lineage.edges.length ? (
          <div className="tx-lineage-edge-list" role="list" aria-label="Resolved lineage edges">
            {lineage.edges.map((edge) => (
              <LineageEdgeRow key={edge.id} edge={edge} onFocusRecordLineage={onFocusRecordLineage} />
            ))}
          </div>
        ) : null}
        <div className="tx-lineage-node-list" role="list" aria-label="Loaded lineage nodes">
          {lineage.nodes.map((node) => (
            <button key={node.id} type="button" className="tx-lineage-node" onClick={() => onFocusRecordLineage?.(node.id)} title={node.path || ''}>
              <span className="tx-lineage-node-main"><Icon name={node.hasContinuityContext ? 'lineage' : 'open'} /> <strong>{node.title}</strong></span>
              <span className="tx-lineage-node-meta">
                {node.schemaId ? <Badge>{node.schemaId}</Badge> : <Badge>markdown</Badge>}
                <Badge>{node.sourceBacked ? 'source-backed' : 'local/session'}</Badge>
                {node.trace ? <small>Trace: {compactPath(node.trace)}</small> : null}
                {node.origin ? <small>Origin: {compactPath(node.origin)}</small> : null}
              </span>
            </button>
          ))}
        </div>
      </details>
      {lineage.empty ? <p className="tx-tree-empty">No loaded lineage nodes match this view.</p> : null}
    </section>
  );
}


function LineageSelectedSummary({ node, auditItem, lineage, onOpenRecord, onOpenAudit }) {
  const badge = auditBadgeForRecord(node.record, auditItem);
  const selectedLineage = selectedLineageStatus(node, lineage);
  const findings = auditItem?.findings || [];
  return (
    <section className={`tx-lineage-selected-summary tx-audit-badge-${badge.tone}`} aria-label="Selected artifact lineage status">
      <div>
        <strong>{node.title || 'Selected artifact'}</strong>
        <small>{node.path ? compactPath(node.path) : 'Loaded lineage focus'}</small>
      </div>
      <span className="tx-lineage-selected-badges">
        <Badge>{selectedLineage.label}</Badge>
        <AuditStatusBadge record={node.record} item={auditItem} />
        <Badge>{node.schemaId || 'markdown'}</Badge>
        <Badge>{node.sourceBacked ? 'source-backed' : 'local/session'}</Badge>
      </span>
      <p>{findings.length ? findings.slice(0, 2).map((finding) => finding.code).join(' · ') : selectedLineage.message}</p>
      <div className="tx-lineage-selected-actions">
        <button type="button" onClick={() => onOpenRecord?.(node.id)}>Open detail</button>
        <button type="button" onClick={onOpenAudit}>Audit details</button>
      </div>
    </section>
  );
}

function selectedLineageStatus(node = {}, lineage = {}) {
  const id = String(node.id || '');
  const selectedFindings = (lineage.findings || []).filter((finding) => finding.nodeId === id);
  const selectedEdges = (lineage.edges || []).filter((edge) => edge.from === id || edge.to === id);
  if (selectedFindings.some((finding) => finding.code === 'lineage.parent.missing' || finding.code === 'lineage.target.ambiguous')) {
    return { label: 'selected mismatch', message: 'Selected artifact has unresolved or ambiguous declared lineage. Workspace findings below may include unrelated records.' };
  }
  if (selectedFindings.some((finding) => finding.code === 'lineage.root')) {
    return { label: 'root reached', message: 'Selected artifact is a loaded lineage root. Workspace findings below may include unrelated records.' };
  }
  if (selectedEdges.length) {
    return { label: 'selected lineage', message: 'Selected artifact has loaded lineage context. Workspace overview below remains separate.' };
  }
  return { label: 'selected open', message: 'Selected artifact has no resolved lineage finding in the loaded workspace.' };
}

function LineageEdgeRow({ edge, onFocusRecordLineage }) {
  const missing = edge.status === 'missing';
  return (
    <div className={`tx-lineage-edge-row ${missing ? 'tx-lineage-edge-missing' : ''}`} role="listitem">
      <button type="button" disabled={missing || !edge.from} onClick={() => onFocusRecordLineage?.(edge.from)}>
        <span>{edge.fromTitle}</span>
        {edge.fromPath ? <small>{compactPath(edge.fromPath)}</small> : null}
      </button>
      <span className="tx-lineage-edge-connector" title={`${edge.kind} · ${edge.method || edge.status}`}>
        <Icon name={missing ? 'warning' : 'lineage'} /> {edge.kind}
      </span>
      <button type="button" onClick={() => onFocusRecordLineage?.(edge.to)}>
        <span>{edge.toTitle}</span>
        {edge.toPath ? <small>{compactPath(edge.toPath)}</small> : null}
      </button>
      <Badge>{edge.status}</Badge>
    </div>
  );
}


function discoveryRank(record = {}) {
  if (isSupportingMarkdownRecord(record)) return 40;
  const schema = String(record.schemaId || record.currentSchemaId || '').toLowerCase();
  const kind = String(record.kind || '').toLowerCase();
  if (schema.includes('topic') || schema.includes('decision') || schema.includes('evidence')) return 0;
  if (record.hasContinuityContext || record.hasIntegrity || record.trace || record.origin || record.parentSchemaId) return 4;
  if (kind.includes('topic') || kind.includes('decision') || kind.includes('evidence')) return 6;
  if (record.source?.adapterId && record.source.adapterId !== 'local') return 10;
  return 20;
}

function prioritizeDiscoveryRecords(records = [], options = {}) {
  const list = Array.isArray(records) ? records.slice() : [];
  if (options?.leavesFirst === false) return list;
  return list.sort((a, b) => {
    const delta = discoveryRank(a) - discoveryRank(b);
    if (delta) return delta;
    const dateDelta = String(b.currentCreatedAt || b.createdAt || '').localeCompare(String(a.currentCreatedAt || a.createdAt || ''));
    if (dateDelta) return dateDelta;
    return String(a.title || a.path || '').localeCompare(String(b.title || b.path || ''), undefined, { numeric: true, sensitivity: 'base' });
  });
}

function WorkspaceCandidateCard({ candidate, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  return (
    <article className="tx-artifact-card tx-workspace-candidate-card">
      <div className="tx-card-badges">
        <Badge>workspace</Badge>
        <Badge>open/merge candidate</Badge>
        <Badge>local/session</Badge>
      </div>
      <h3>{candidate.title || candidate.path || 'Workspace candidate'}</h3>
      {candidate.path ? <div className="tx-card-pathline" title={candidate.path}><Icon name="folderOpen" />{compactPath(candidate.path)}</div> : null}
      <p>Workspace file staged from local/archive intake. Open it as a workspace or merge its context into the current workspace.</p>
      <footer className="tx-artifact-actions">
        <Button icon="open" variant="ghost" onClick={() => onOpenWorkspaceCandidate?.(candidate.id || candidate.path)}>Open</Button>
        <Button icon="continue" variant="ghost" onClick={() => onMergeWorkspaceCandidate?.(candidate.id || candidate.path)}>Merge</Button>
      </footer>
    </article>
  );
}

function AssetCard({ asset, onOpenAsset }) {
  return (
    <article className="tx-artifact-card tx-asset-card">
      <div className="tx-card-badges">
        <Badge>local/session</Badge>
        <Badge>{asset.type || 'asset'}</Badge>
        <Badge>{asset.previewState || 'metadata-only'}</Badge>
      </div>
      <h3>{asset.name || asset.path || 'Local asset'}</h3>
      {asset.path ? <div className="tx-card-pathline" title={asset.path}><Icon name="folderOpen" />{compactPath(asset.path)}</div> : null}
      <p>{asset.size ? `${asset.size} bytes preserved as local asset.` : 'Preserved as a local asset, not a fake leaf.'}</p>
      <footer className="tx-artifact-actions">
        <Button icon="open" variant="ghost" onClick={() => onOpenAsset?.(asset.id || asset.path)}>Open</Button>
      </footer>
    </article>
  );
}

function compactRecordDate(record = {}) {
  const raw = record.currentCreatedAt || record.createdAt || record.date || '';
  const text = String(raw || '').trim();
  if (!text) return '';
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : text.slice(0, 10);
}

function recordSchemaBadge(record = {}) {
  const schema = record.schemaId || record.currentSchemaId || record.kind || '';
  const text = String(schema || '').trim();
  if (!text) return 'artifact';
  return text.replace(/^tiinex\./, '').replace(/\.v\d+$/, '');
}

function recordSourceBadge(record = {}) {
  const source = record.source || {};
  if (source.label) return source.label;
  if (source.repo) return source.repo;
  if (source.adapterId && source.adapterId !== 'local') return source.adapterId;
  return 'Local';
}

function actionClassName(action = {}) {
  const id = action.id;
  const labeled = id === RecordActionKind.continue || id === RecordActionKind.reference;
  const side = id === RecordActionKind.continue || id === RecordActionKind.reference ? 'tx-action-right' : 'tx-action-left';
  return ['tx-button', 'tx-button-ghost', 'tx-legacy-action', labeled ? 'tx-labeled-action' : '', side].filter(Boolean).join(' ');
}

function actionLabel(action = {}) {
  if (action.id === RecordActionKind.open) return 'Open details';
  if (action.id === RecordActionKind.markdown) return 'Show markdown';
  return action.label;
}

function RecordCard({ record, auditItem, onOpenRecord, onFocusRecordLineage, onShareRecord, onRecordAction }) {
  const actions = presentRecordActions(record).filter((action) => action.enabled !== false && action.id !== RecordActionKind.lineage);
  const dateBadge = compactRecordDate(record);
  const schemaBadge = recordSchemaBadge(record);
  const sourceBadge = recordSourceBadge(record);
  const focusLineage = () => onFocusRecordLineage?.(record.id);
  const onKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); focusLineage(); }
  };
  return (
    <article className="tx-artifact-card tx-record-card tx-old-like-record-card tx-clickable-record-card" role="button" tabIndex="0" aria-label={`Open lineage for ${record.title || 'artifact'}`} onClick={focusLineage} onKeyDown={onKey}>
      <div className="tx-card-badges tx-legacy-card-badges">
        <AuditStatusBadge record={record} item={auditItem} />
        <Badge>{schemaBadge}</Badge>
        {dateBadge ? <Badge>{dateBadge}</Badge> : null}
        <Badge>{sourceBadge}</Badge>
      </div>
      <h3>{record.title || 'Untitled'}</h3>
      <p>{record.summary || 'No summary available yet.'}</p>
      {record.path ? <div className="tx-card-pathline" title={record.path}><Icon name="folderOpen" />{compactPath(record.path)}</div> : null}
      <footer className="tx-legacy-action-row tx-artifact-actions" aria-label="Artifact actions" onClick={(event) => event.stopPropagation()}>
        {actions.map((action) => action.href ? (
          <a key={action.id} className={actionClassName(action)} href={action.href} target="_blank" rel="noopener noreferrer" title={actionLabel(action)} aria-label={actionLabel(action)}><Icon name={action.icon} /><strong>{actionLabel(action)}</strong></a>
        ) : (
          <button key={action.id} type="button" className={actionClassName(action)} title={actionLabel(action)} aria-label={actionLabel(action)} onClick={() => {
            if (action.id === RecordActionKind.open) return onOpenRecord?.(record.id);
            if (action.id === RecordActionKind.share) return onShareRecord?.(record);
            return onRecordAction?.(record, action);
          }}><Icon name={action.icon} /><strong>{actionLabel(action)}</strong></button>
        ))}
      </footer>
    </article>
  );
}



export function AssetDetailDialog({ asset, onDismiss }) {
  return (
    <Modal title={asset?.name || asset?.path || 'Local asset'} onDismiss={onDismiss}>
      <div className="tx-record-detail tx-asset-detail">
        <div className="tx-card-badges">
          <Badge>local/session</Badge>
          <Badge>{asset?.type || 'asset'}</Badge>
          <Badge>{asset?.previewState || 'metadata-only'}</Badge>
        </div>
        <dl className="tx-record-meta">
          {asset?.path ? <div><dt>Path</dt><dd>{asset.path}</dd></div> : null}
          {asset?.size != null ? <div><dt>Size</dt><dd>{asset.size} bytes</dd></div> : null}
          <div><dt>Boundary</dt><dd>{asset?.source?.boundary || 'Browser-local asset; no GitHub provenance inferred.'}</dd></div>
        </dl>
        {asset?.content ? <pre className="tx-record-markdown-preview">{String(asset.content).slice(0, 2400)}</pre> : null}
        {asset?.dataUrl ? <img className="tx-local-asset-preview" src={asset.dataUrl} alt="" /> : null}
        {!asset?.content && !asset?.dataUrl ? <p className="tx-muted">Preview is {asset?.previewState || 'metadata-only'}; metadata and local boundary are preserved.</p> : null}
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

export function RecordDetailDialog({ record, onDismiss, onShare }) {
  const source = record?.source || {};
  const isSourceBacked = Boolean(source.adapterId && source.adapterId !== 'local');
  return (
    <Modal title={record?.title || 'Artifact'} onDismiss={onDismiss} className="tx-dialog-record-detail">
      <div className="tx-record-detail">
        <div className="tx-card-badges">
          <Badge>{record?.status || 'local'}</Badge>
          <Badge>{record?.kind || 'artifact'}</Badge>
          <Badge>{isSourceBacked ? 'source-backed' : 'local/session'}</Badge>
        </div>
        <p className="tx-muted">{record?.summary || 'No summary available.'}</p>
        <dl className="tx-record-meta">
          <div><dt>Boundary</dt><dd>{isSourceBacked ? (source.boundary || 'Explicit source boundary') : 'Browser-local session material; no GitHub provenance inferred.'}</dd></div>
          {record?.path ? <div><dt>Path</dt><dd>{record.path}</dd></div> : null}
          {source.label ? <div><dt>Source</dt><dd>{source.label}</dd></div> : null}
          {source.adapterId ? <div><dt>Adapter</dt><dd>{source.adapterId} · {source.sourceKind || source.kind || 'source'}</dd></div> : null}
          {record?.envelopeSchemaId ? <div><dt>Envelope</dt><dd>{record.envelopeSchemaId}</dd></div> : null}
          {record?.schemaId ? <div><dt>Current schema</dt><dd>{record.schemaId}</dd></div> : null}
          {record?.currentCreatedAt ? <div><dt>Current created</dt><dd>{record.currentCreatedAt}</dd></div> : null}
          {record?.parentSchemaId ? <div><dt>Parent schema</dt><dd>{record.parentSchemaId}</dd></div> : null}
          {record?.trace ? <div><dt>Trace</dt><dd>{record.trace}</dd></div> : null}
          {record?.origin ? <div><dt>Origin</dt><dd>{record.origin}</dd></div> : null}
          {record?.rootDisclosure ? <div><dt>Root fallback</dt><dd>{record.rootDisclosure}</dd></div> : null}
        </dl>
        {record?.markdown ? <pre className="tx-record-markdown-preview">{String(record.markdown).slice(0, 2400)}</pre> : <p className="tx-muted">{record?.materialAvailability === 'material-unavailable' ? 'Material is unavailable in this route/session shell; source boundary and path are preserved.' : 'No embedded Markdown preview is available for this record.'}</p>}
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Close</Button>
          <Button variant="primary" icon="shareNodes" onClick={onShare}>Share session</Button>
        </div>
      </div>
    </Modal>
  );
}


export function RecordMarkdownDialog({ record, onDismiss }) {
  return (
    <Modal title={`Markdown · ${record?.title || 'Artifact'}`} onDismiss={onDismiss} className="tx-dialog-record-markdown">
      <div className="tx-record-detail">
        <div className="tx-card-badges">
          <Badge>{record?.kind || 'artifact'}</Badge>
          <Badge>{record?.path || 'no path'}</Badge>
        </div>
        {record?.markdown ? <pre className="tx-record-markdown-preview tx-full-markdown-preview">{String(record.markdown)}</pre> : <p className="tx-muted">Markdown is not available in this route/session shell. Source boundary and path are preserved.</p>}
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}



export function RecordActionDialog({ record, action, schemaRegistry, onDismiss, onShare, onCreateTransition }) {
  const actionId = action?.id || action;
  if (actionId === RecordActionKind.continue) {
    return <ContinuationDialog record={record} schemaRegistry={schemaRegistry} onDismiss={onDismiss} onCreateTransition={onCreateTransition} />;
  }
  if (actionId === RecordActionKind.markdown) {
    return <RecordMarkdownDialog record={record} onDismiss={onDismiss} />;
  }
  if (actionId === RecordActionKind.reference) {
    const draft = createReferenceDraft(record);
    const result = createRecordActionResult(record, actionId);
    return (
      <Modal title="Preserve evidence leaf" onDismiss={onDismiss}>
        <div className="tx-record-action-result">
          <div className="tx-card-badges">
            <Badge>{draft.schema}</Badge>
            <Badge>{draft.kind}</Badge>
            <Badge>{draft.transition.parentBoundary}</Badge>
          </div>
          <p className="tx-muted">Creates a browser-local Evidence draft from the selected record. This is not the old cross-artifact Reference relation; no source provenance is inferred.</p>
          <TransitionValidationNotice validation={draft.validation} />
          <pre className="tx-record-markdown-preview">{draft.markdown}</pre>
          <div className="tx-dialog-actions">
            <Button variant="ghost" onClick={onDismiss}>Close</Button>
            <Button variant="ghost" icon="shareNodes" onClick={() => onShare?.(record)}>Share parent session</Button>
            <Button variant="primary" icon="reference" onClick={() => onCreateTransition?.(record, draft)}>Create evidence</Button>
          </div>
          {result ? <p className="tx-muted tx-action-caption">Evidence preservation capsule remains available for handoff copy: {result.intent}.</p> : null}
        </div>
      </Modal>
    );
  }
  const result = createRecordActionResult(record, actionId);
  if (!result) return null;
  return (
    <Modal title={result.title || 'Record action'} onDismiss={onDismiss}>
      <div className="tx-record-action-result">
        <div className="tx-card-badges">
          <Badge>{result.schema}</Badge>
          <Badge>{result.intent}</Badge>
          <Badge>{result.sourceBoundary}</Badge>
        </div>
        <p className="tx-muted">This is a concrete Tiinex action result, not a decorative button. Copy it into a handoff, prompt, issue, or future builder.</p>
        <pre className="tx-record-markdown-preview">{result.text}</pre>
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Close</Button>
          <Button variant="primary" icon="shareNodes" onClick={() => onShare?.(record)}>Share session</Button>
        </div>
      </div>
    </Modal>
  );
}

function ContinuationDialog({ record, schemaRegistry, onDismiss, onCreateTransition }) {
  const targets = listContinuationTargets(schemaRegistry);
  const [selected, setSelected] = useState(targets[0]?.id || 'tiinex.topic.v1');
  const [title, setTitle] = useState(`Continue · ${record?.title || 'artifact'}`.slice(0, 96));
  const [summary, setSummary] = useState(`Continuation leaf drafted from ${record?.title || 'this artifact'}.`.slice(0, 280));
  const target = targets.find((item) => item.id === selected) || targets[0] || { id: 'tiinex.topic.v1', label: 'Topic', summary: 'Topic continuation.' };
  const draft = createContinuationDraft(record, target, { title, summary });
  return (
    <Modal title="Create continuation leaf" onDismiss={onDismiss} initialFocus="continuationTitle">
      <div className="tx-continuation-dialog">
        <div className="tx-card-badges">
          <Badge>{draft.schema}</Badge>
          <Badge>{target.id}</Badge>
          <Badge>{draft.transition.parentBoundary}</Badge>
        </div>
        <p className="tx-muted">Choose a schema-backed Tiinex leaf type. The draft stays browser-local until you explicitly publish or export it.</p>
        <div className="tx-continuation-target-grid" role="listbox" aria-label="Continuation target schema">
          {targets.map((item) => (
            <button key={item.id} type="button" className={`tx-continuation-target ${selected === item.id ? 'tx-active' : ''}`} aria-selected={selected === item.id} onClick={() => setSelected(item.id)}>
              <strong>{item.label}</strong>
              <small>{item.summary}</small>
            </button>
          ))}
        </div>
        <label className="tx-field"><span>Title</span><input id="continuationTitle" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={96} /></label>
        <label className="tx-field"><span>Summary</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} maxLength={280} /></label>
        <details className="tx-continuation-preview">
          <summary>Preview continuation Markdown</summary>
          <pre className="tx-record-markdown-preview">{draft.markdown}</pre>
        </details>
        <TransitionValidationNotice validation={draft.validation} />
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button variant="primary" icon="continue" onClick={() => onCreateTransition?.(record, draft)}>Create local continuation</Button>
        </div>
      </div>
    </Modal>
  );
}


function TransitionValidationNotice({ validation }) {
  if (!validation) return null;
  const severe = (validation.findings || []).filter((finding) => finding.severity === 'error' || finding.severity === 'warning').slice(0, 3);
  return (
    <div className={`tx-transition-validation tx-transition-validation-${validation.status || (validation.ok ? 'valid' : 'invalid')}`}>
      <strong>{validation.ok ? 'Transition conformance passed' : 'Transition conformance needs attention'}</strong>
      <span>{validation.counts?.error || 0} errors · {validation.counts?.warning || 0} warnings · local draft boundary</span>
      {severe.length ? <ul>{severe.map((finding) => <li key={finding.code}>{finding.message}</li>)}</ul> : null}
    </div>
  );
}

function compactPath(path = '') {
  const value = String(path || '').trim();
  if (value.length <= 44) return value;
  const parts = value.split('/').filter(Boolean);
  if (parts.length <= 2) return `…${value.slice(-41)}`;
  return `${parts[0]}/…/${parts.slice(-2).join('/')}`;
}

export function CreateWorkspaceDialog({ error, onSubmit, onDismiss }) {
  const [name, setName] = useState('');
  function submit(event) {
    event.preventDefault();
    onSubmit(name);
  }
  return (
    <Modal title="Create workspace" onDismiss={onDismiss} initialFocus="workspaceName">
      <form className="tx-form" onSubmit={submit} data-form="create-workspace-form">
        <TextField
          id="workspaceName"
          name="workspaceName"
          label="Workspace name"
          value={name}
          onChange={setName}
          required
          error={error}
          autoFocus
        />
        <p className="tx-muted">Local/session. No GitHub provenance inferred.</p>
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="create">Create</Button>
        </div>
      </form>
    </Modal>
  );
}

export function DisplayOptionsDialog({ options, counts = {}, onSubmit, onDismiss }) {
  const [draft, setDraft] = useState(normalizeWorkspaceDisplayOptions(options));
  const schemaChoices = Array.isArray(counts.schemaChoices) ? counts.schemaChoices : [];
  const artifactChoices = Array.isArray(counts.artifactChoices) ? counts.artifactChoices : [];
  const sourceChoices = Array.isArray(counts.sourceChoices) ? counts.sourceChoices : [];
  function setFlag(key, value) {
    setDraft((current) => Object.assign({}, current, { [key]: Boolean(value) }));
  }
  function setValue(key, value) {
    setDraft((current) => Object.assign({}, current, { [key]: String(value || 'all') || 'all' }));
  }
  function submit(event) {
    event.preventDefault();
    onSubmit?.(normalizeWorkspaceDisplayOptions(draft));
  }
  return (
    <Modal title="Display options" onDismiss={onDismiss} initialFocus="displayLeavesOnly" className="tx-dialog-display-options">
      <form className="tx-form tx-display-options-form tx-display-options-parity-form" onSubmit={submit} data-form="display-options-form">
        <p className="tx-muted">Presentation only. Source, audit, lineage, and export truth stay intact even when material is filtered from Feed/Tree.</p>
        <div className="tx-display-filter-grid" aria-label="Artifact filters">
          <label className="tx-select-field">
            <span>Schema</span>
            <select value={draft.schemaFilter} onChange={(event) => setValue('schemaFilter', event.target.value)}>
              <option value="all">All schemas</option>
              {schemaChoices.map(([value, count]) => <option key={value} value={value}>{compactSchemaOption(value)} · {count}</option>)}
            </select>
          </label>
          <label className="tx-select-field">
            <span>Artifact role</span>
            <select value={draft.artifactFilter} onChange={(event) => setValue('artifactFilter', event.target.value)}>
              <option value="all">All roles</option>
              {artifactChoices.map(([value, count]) => <option key={value} value={value}>{artifactFilterLabel(value)} · {count}</option>)}
            </select>
          </label>
          <label className="tx-select-field">
            <span>Source boundary</span>
            <select value={draft.sourceFilter} onChange={(event) => setValue('sourceFilter', event.target.value)}>
              <option value="all">All boundaries</option>
              {sourceChoices.map(([value, count]) => <option key={value} value={value}>{sourceFilterLabel(value)} · {count}</option>)}
            </select>
          </label>
        </div>
        <label className="tx-display-option-row tx-display-option-primary">
          <span><strong>Leaves only</strong><small>{Number(counts.leaves || 0)} likely Tiinex/work leaf{Number(counts.leaves || 0) === 1 ? '' : 's'} · hides supporting Markdown</small></span>
          <input id="displayLeavesOnly" type="checkbox" checked={draft.leavesOnly} onChange={(event) => setFlag('leavesOnly', event.target.checked)} />
        </label>
        <label className="tx-display-option-row">
          <span><strong>Mismatches only</strong><small>{Number(counts.mismatches || 0)} record{Number(counts.mismatches || 0) === 1 ? '' : 's'} currently carry mismatch-level audit status</small></span>
          <input id="displayMismatchesOnly" type="checkbox" checked={draft.mismatchesOnly} onChange={(event) => setFlag('mismatchesOnly', event.target.checked)} />
        </label>
        <label className="tx-display-option-row">
          <span><strong>Leaves first</strong><small>Sort Tiinex/work artifacts before schema/support docs when those docs are visible</small></span>
          <input id="displayLeavesFirst" type="checkbox" checked={draft.leavesFirst} onChange={(event) => setFlag('leavesFirst', event.target.checked)} />
        </label>
        <label className="tx-display-option-row">
          <span><strong>Supporting docs</strong><small>{Number(counts.supportingMarkdown || 0)} supporting doc{Number(counts.supportingMarkdown || 0) === 1 ? '' : 's'} · preserved but hidden by default</small></span>
          <input id="displaySupportingMarkdown" type="checkbox" checked={draft.showSupportingMarkdown} onChange={(event) => setFlag('showSupportingMarkdown', event.target.checked)} />
        </label>
        <label className="tx-display-option-row">
          <span><strong>Workspace candidates</strong><small>{Number(counts.workspaceCandidates || 0)} candidate{Number(counts.workspaceCandidates || 0) === 1 ? '' : 's'} · open/merge stays explicit</small></span>
          <input type="checkbox" checked={draft.showWorkspaceCandidates} onChange={(event) => setFlag('showWorkspaceCandidates', event.target.checked)} />
        </label>
        <label className="tx-display-option-row">
          <span><strong>Assets</strong><small>{Number(counts.assets || 0)} asset{Number(counts.assets || 0) === 1 ? '' : 's'} · hidden by default, never fake leaves</small></span>
          <input type="checkbox" checked={draft.showAssets} onChange={(event) => setFlag('showAssets', event.target.checked)} />
        </label>
        <details className="tx-display-deferred-controls">
          <summary>Deferred PoC controls</summary>
          <p>Time Portal and link-behavior controls remain deferred until their runtime owners are restored. They are not hidden parity claims.</p>
        </details>
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="check">Apply</Button>
        </div>
      </form>
    </Modal>
  );
}

function compactSchemaOption(value = '') {
  return String(value || 'artifact').replace(/^tiinex\./, '').replace(/\.v\d+$/, '');
}

function artifactFilterLabel(value = '') {
  return materialRoleLabel(value);
}

function sourceFilterLabel(value = '') {
  if (value === 'source-backed') return 'Source-backed';
  if (value === 'local') return 'Local/session';
  return value || 'Source boundary';
}


export function CloseWorkspaceDialog({ workspace, onDismiss, onConfirm }) {
  return (
    <Modal title={`Close ${workspace.title || workspace.name}?`} onDismiss={onDismiss}>
      <p className="tx-muted">Removes this browser session workspace. Source files are not deleted.</p>
      <div className="tx-dialog-actions">
        <Button variant="ghost" onClick={onDismiss}>Cancel</Button>
        <Button variant="danger" icon="close" onClick={onConfirm}>Close workspace</Button>
      </div>
    </Modal>
  );
}


function recordMatchesQuery(record, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [record.title, record.summary, record.kind, record.status, record.path].some((value) => String(value || '').toLowerCase().includes(q));
}

function assetMatchesQuery(asset, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [asset.name, asset.path, asset.type, asset.previewState, asset.sourceMode].some((value) => String(value || '').toLowerCase().includes(q));
}

function workspaceCandidateMatchesQuery(candidate, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [candidate.title, candidate.path, candidate.sourceMode, candidate.schema].some((value) => String(value || '').toLowerCase().includes(q));
}
