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

const DEFAULT_DISPLAY_OPTIONS = Object.freeze({
  showSupportingMarkdown: true,
  showWorkspaceCandidates: true,
  showAssets: false
});

export function normalizeWorkspaceDisplayOptions(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    showSupportingMarkdown: source.showSupportingMarkdown !== false ? DEFAULT_DISPLAY_OPTIONS.showSupportingMarkdown : false,
    showWorkspaceCandidates: source.showWorkspaceCandidates !== false ? DEFAULT_DISPLAY_OPTIONS.showWorkspaceCandidates : false,
    showAssets: source.showAssets === true ? true : DEFAULT_DISPLAY_OPTIONS.showAssets
  };
}

function isSupportingMarkdownRecord(record = {}) {
  const kind = String(record.kind || '').toLowerCase();
  const schema = String(record.schemaId || record.currentSchemaId || record.envelopeSchemaId || '').toLowerCase();
  const markdown = String(record.markdown || '');
  if (kind.includes('supporting')) return true;
  if (schema.includes('tiinex.markdown.supporting')) return true;
  if (record.hasContinuityContext || record.hasIntegrity || record.trace || record.origin || record.parentSchemaId) return false;
  if (/^\s*#\s*Continuity Context\b/im.test(markdown)) return false;
  if (/^\s*Current Schema\s*:/im.test(markdown) || /^\s*Envelope Schema\s*:/im.test(markdown)) return false;
  return Boolean(markdown.trim()) && !schema;
}

export function WorkspaceColumnSurface({ workspace, state, onClose, onVerse, onQuery, onOpenDisplayOptions, onOpenAddDialog, onCloseSource, onDropFiles, onOpenRecord, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate, onShareRecord, onRecordAction }) {
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const query = state.view?.query || '';
  const verse = state.view?.workspaceVerse || 'feed';
  const displayOptions = normalizeWorkspaceDisplayOptions(state.view?.displayOptions);
  const allRecords = Array.isArray(workspace.records) ? workspace.records : [];
  const allAssets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const allWorkspaceCandidates = Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [];
  const workspaceCandidates = displayOptions.showWorkspaceCandidates ? allWorkspaceCandidates.filter((candidate) => workspaceCandidateMatchesQuery(candidate, query)) : [];
  const records = allRecords
    .filter((record) => displayOptions.showSupportingMarkdown || !isSupportingMarkdownRecord(record))
    .filter((record) => recordMatchesQuery(record, query));
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
      <SourceStrip workspace={workspace} boundary={presentation.sourceBoundary} onCloseSource={onCloseSource} />
      <WorkspaceDropHint workspace={workspace} hasMaterial={hasMaterial} />
      <WorkspaceMaterialSummary summary={materialSummary} />
      <LineageTrustStrip workspace={workspace} records={allRecords} query={query} onOpenLineage={() => onVerse('lineage')} onOpenAudit={() => onVerse('audit')} />
      <ModeToolbar state={state} query={query} displayOptions={displayOptions} onVerse={onVerse} onQuery={onQuery} onOpenDisplayOptions={onOpenDisplayOptions} />
      <ProgressStrip workspace={workspace} />
      <section className="tx-primary-stage tx-column-primary-stage" aria-label="Column feed">
        {verse === 'tree'
          ? <WorkspaceTreeState workspace={workspace} query={query} records={records} assets={assets} workspaceCandidates={workspaceCandidates} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
          : verse === 'lineage'
            ? <WorkspaceLineageState workspace={workspace} query={query} records={allRecords} onOpenRecord={onOpenRecord} />
          : verse === 'audit'
            ? <WorkspaceAuditState workspace={workspace} query={query} records={allRecords} assets={allAssets} workspaceCandidates={allWorkspaceCandidates} onOpenRecord={onOpenRecord} />
          : (records.length || assets.length || workspaceCandidates.length)
            ? <>
                {workspaceCandidates.map((candidate) => <WorkspaceCandidateCard key={candidate.id || candidate.path} candidate={candidate} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />)}
                {records.map((record) => <RecordCard key={record.id} record={record} onOpenRecord={onOpenRecord} onShareRecord={onShareRecord} onRecordAction={onRecordAction} />)}
                {assets.map((asset) => <AssetCard key={asset.id || asset.path} asset={asset} onOpenAsset={onOpenAsset} />)}
              </>
            : <EmptyWorkspaceState filtered={isFilteredEmpty} hasMaterial={hasMaterial} query={query} />}
      </section>
    </section>
  );
}

function LineageTrustStrip({ workspace, records = [], query = '', onOpenLineage, onOpenAudit }) {
  const lineage = buildWorkspaceLineageView(workspace, { records, query: '' });
  const audit = buildWorkspaceAuditView(workspace, { records, query: '' });
  const counts = audit.visibleCounts || audit.counts || {};
  const signal = summarizeLineageTrust({ counts, lineage, records });
  return (
    <section className={`tx-lineage-trust-strip tx-trust-${signal.status}`} aria-label="Lineage trust status">
      <div className="tx-lineage-trust-main">
        <strong><Icon name={signal.icon} /> Lineage trust</strong>
        <span>{signal.message}</span>
      </div>
      <div className="tx-lineage-trust-signals" aria-label="Lineage status signals">
        <span className={`tx-trust-chip tx-trust-${signal.status}`}>{signal.label}</span>
        <span>{lineage.stats.visibleEdges || 0} loaded edge{(lineage.stats.visibleEdges || 0) === 1 ? '' : 's'}</span>
        <span>{counts.missingLineage || 0} missing</span>
        <span>{counts.errors || 0} errors</span>
        {counts.supporting ? <span>{counts.supporting} supporting</span> : null}
      </div>
      <div className="tx-lineage-trust-actions">
        <button type="button" onClick={onOpenLineage}>Lineage mode</button>
        <button type="button" onClick={onOpenAudit}>Audit details</button>
      </div>
    </section>
  );
}

function summarizeLineageTrust({ counts = {}, lineage = {}, records = [] }) {
  const recordCount = Number(records.length || counts.records || 0);
  const errors = Number(counts.errors || 0);
  const invalid = Number(counts.invalid || 0);
  const missing = Number(counts.missingLineage || 0);
  const lineageFindings = Number(counts.lineageFindings || lineage.stats?.visibleFindings || 0);
  const degraded = Number(counts.degraded || 0);
  if (!recordCount) return { status: 'open', label: 'open', icon: 'open', message: 'No loaded artifacts yet; lineage remains open.' };
  if (errors || invalid || missing || lineageFindings) return { status: 'mismatch', label: 'mismatch', icon: 'warning', message: 'Loaded material has lineage or validation findings that need review.' };
  if (degraded) return { status: 'pending', label: 'pending', icon: 'warning', message: 'Some material is unavailable or degraded; trust is pending more context.' };
  return { status: 'ok', label: 'ok', icon: 'check', message: 'Loaded artifacts have no blocking lineage findings.' };
}

function SourceStrip({ workspace, boundary, onCloseSource }) {
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  return (
    <div className="tx-source-strip workspace-source-strip tx-compact-source-strip" aria-label="Workspace sources" title={boundary || ''}>
      <div className="tx-source-list">
        {sources.map((source) => (
          <span className={`tx-source-pill ${source.closeable ? 'tx-source-pill-closeable' : ''}`} key={source.id || source.label} title={source.boundary || ''}>
            <Icon name={source.kind === 'local' ? 'local' : 'source'} />
            <strong>{source.label || 'Source'}</strong>
            <small>{Number(source.count || 0)}</small>
            {source.closeable ? (
              <button type="button" className="tx-source-close" aria-label={`Close ${source.label || 'source'}`} onClick={() => onCloseSource?.(source.id)}>
                <Icon name="close" />
              </button>
            ) : null}
          </span>
        ))}
      </div>
      {(workspace.records?.length || workspace.assets?.length || workspace.workspaceMergeCandidates?.length) ? <span className="tx-source-boundary tx-compact-source-boundary">{workspace.records?.length || 0} artifacts · {workspace.assets?.length || 0} assets · {workspace.workspaceMergeCandidates?.length || 0} workspace candidates</span> : null}
    </div>
  );
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
      <div className="tx-progress-bar" aria-label="Source progress"><i style={{ width: `${Math.max(0, Math.min(100, Number(progress.percent || 0)))}%` }} /></div>
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

function ModeToolbar({ state, query, displayOptions, onVerse, onQuery, onOpenDisplayOptions }) {
  const verse = state.view?.workspaceVerse || 'feed';
  const discoveryVerse = verse === 'feed' || verse === 'tree';
  const modeLabel = verse === 'lineage' ? 'LINEAGE MODE' : verse === 'audit' ? 'AUDIT DETAILS' : 'DISCOVERY MODE';
  const hiddenPresentationCount = (displayOptions?.showAssets === false ? 1 : 0) + (displayOptions?.showWorkspaceCandidates === false ? 1 : 0) + (displayOptions?.showSupportingMarkdown === false ? 1 : 0);
  return (
    <div className="tx-mode-strip tx-column-toolbar" aria-label="Mode controls">
      <strong className="tx-mode-name">{modeLabel}</strong>
      {discoveryVerse ? (
        <div className="tx-segment" aria-label="Discovery view">
          <button type="button" className={verse === 'feed' ? 'tx-active' : ''} onClick={() => onVerse('feed')}>Feed</button>
          <button type="button" className={verse === 'tree' ? 'tx-active' : ''} onClick={() => onVerse('tree')}>Tree</button>
        </div>
      ) : (
        <button type="button" className="tx-mode-return" onClick={() => onVerse('feed')}>Discovery mode</button>
      )}
      {discoveryVerse ? <button type="button" className="tx-mode-link" onClick={() => onVerse('lineage')}>Lineage mode</button> : null}
      <button type="button" className="tx-mode-link tx-display-options-trigger" onClick={onOpenDisplayOptions}>Display options{hiddenPresentationCount ? ` · ${hiddenPresentationCount} hidden` : ''}</button>
      <label className="tx-search-field tx-search-field-icon">
        <Icon name="search" />
        <input value={query} onChange={(event) => onQuery(event.target.value)} type="search" placeholder="Search title/body/schema…" />
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

function WorkspaceTreeState({ workspace, query = '', records, assets = [], workspaceCandidates = [], onOpenRecord, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  query = String(query || '').trim();
  const tree = buildWorkspacePathTree({
    records,
    assets,
    workspaceCandidates,
    rootLabel: `Root · ${workspace.title || workspace.name || 'workspace'}`,
    query
  });
  return (
    <div className="tx-workspace-tree-state tx-path-tree-state" role="tree" aria-label="Workspace path tree">
      <div className="tx-tree-root tx-path-tree-root">
        <span><Icon name="tree" /> {tree.rootLabel}</span>
        <TreeCountBadges counts={tree.counts} />
      </div>
      {tree.folders.map((folder) => (
        <TreeFolder key={folder.path || folder.name} folder={folder} query={query} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
      ))}
      {tree.items.map((item) => (
        <TreeLeafItem key={item.id || item.path} item={item} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
      ))}
      {tree.empty ? <p className="tx-tree-empty">No loaded artifacts, assets, or workspace candidates yet. Source and workspace boundaries remain visible.</p> : null}
    </div>
  );
}

function TreeFolder({ folder, query, onOpenRecord, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
  const open = Boolean(query);
  return (
    <details className="tx-tree-folder" open={open} role="group">
      <summary className="tx-tree-folder-summary" role="treeitem" aria-label={`Folder ${folder.name}`}>
        <span className="tx-tree-folder-name"><Icon name="folderOpen" /> {folder.name}</span>
        <TreeCountBadges counts={folder.counts} />
      </summary>
      <div className="tx-tree-folder-children">
        {folder.folders.map((child) => (
          <TreeFolder key={child.path || child.name} folder={child} query={query} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
        ))}
        {folder.items.map((item) => (
          <TreeLeafItem key={item.id || item.path} item={item} onOpenRecord={onOpenRecord} onOpenAsset={onOpenAsset} onOpenWorkspaceCandidate={onOpenWorkspaceCandidate} onMergeWorkspaceCandidate={onMergeWorkspaceCandidate} />
        ))}
      </div>
    </details>
  );
}

function TreeLeafItem({ item, onOpenRecord, onOpenAsset, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
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
  return (
    <button type="button" className="tx-tree-record-row tx-tree-leaf-row" role="treeitem" onClick={() => onOpenRecord?.(item.source.id)} title={item.path || ''}>
      <span><Icon name="open" /> {item.name || item.title || 'Untitled'}</span>
      <Badge>{item.source.kind || item.kind || 'artifact'}</Badge>
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

function WorkspaceLineageState({ workspace, query = '', records = [], onOpenRecord }) {
  const lineage = buildWorkspaceLineageView(workspace, { records, query });
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
      {lineage.findings.length ? (
        <div className="tx-lineage-findings" aria-label="Lineage findings">
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
            <LineageEdgeRow key={edge.id} edge={edge} onOpenRecord={onOpenRecord} />
          ))}
        </div>
      ) : null}
      <div className="tx-lineage-node-list" role="list" aria-label="Loaded lineage nodes">
        {lineage.nodes.map((node) => (
          <button key={node.id} type="button" className="tx-lineage-node" onClick={() => onOpenRecord?.(node.id)} title={node.path || ''}>
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
      {lineage.empty ? <p className="tx-tree-empty">No loaded lineage nodes match this view.</p> : null}
    </section>
  );
}

function LineageEdgeRow({ edge, onOpenRecord }) {
  const missing = edge.status === 'missing';
  return (
    <div className={`tx-lineage-edge-row ${missing ? 'tx-lineage-edge-missing' : ''}`} role="listitem">
      <button type="button" disabled={missing || !edge.from} onClick={() => onOpenRecord?.(edge.from)}>
        <span>{edge.fromTitle}</span>
        {edge.fromPath ? <small>{compactPath(edge.fromPath)}</small> : null}
      </button>
      <span className="tx-lineage-edge-connector" title={`${edge.kind} · ${edge.method || edge.status}`}>
        <Icon name={missing ? 'warning' : 'lineage'} /> {edge.kind}
      </span>
      <button type="button" onClick={() => onOpenRecord?.(edge.to)}>
        <span>{edge.toTitle}</span>
        {edge.toPath ? <small>{compactPath(edge.toPath)}</small> : null}
      </button>
      <Badge>{edge.status}</Badge>
    </div>
  );
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

function RecordCard({ record, onOpenRecord, onShareRecord, onRecordAction }) {
  const actions = presentRecordActions(record).filter((action) => action.enabled !== false);
  return (
    <article className="tx-artifact-card tx-record-card">
      <div className="tx-card-badges">
        <Badge>{record.source?.adapterId && record.source.adapterId !== 'local' ? 'source-backed' : 'local/session'}</Badge>
        <Badge>{record.kind || 'artifact'}</Badge>
        {record.source?.adapterId && record.source.adapterId !== 'local' ? <Badge>{record.source.adapterId}</Badge> : null}
      </div>
      <h3>{record.title || 'Untitled'}</h3>
      {record.path ? <div className="tx-card-pathline" title={record.path}><Icon name="folderOpen" />{compactPath(record.path)}</div> : null}
      <p>{record.summary || 'Local session material.'}</p>
      <footer className="tx-artifact-actions">
        {actions.map((action) => action.href ? (
          <a key={action.id} className="tx-button tx-button-ghost" href={action.href} target="_blank" rel="noopener noreferrer"><Icon name={action.icon} /><span>{action.label}</span></a>
        ) : (
          <Button key={action.id} icon={action.icon} variant="ghost" onClick={() => {
            if (action.id === RecordActionKind.open) return onOpenRecord?.(record.id);
            if (action.id === RecordActionKind.share) return onShareRecord?.(record);
            return onRecordAction?.(record, action);
          }}>{action.label}</Button>
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
    <Modal title={record?.title || 'Artifact'} onDismiss={onDismiss}>
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



export function RecordActionDialog({ record, action, schemaRegistry, onDismiss, onShare, onCreateTransition }) {
  const actionId = action?.id || action;
  if (actionId === RecordActionKind.continue) {
    return <ContinuationDialog record={record} schemaRegistry={schemaRegistry} onDismiss={onDismiss} onCreateTransition={onCreateTransition} />;
  }
  if (actionId === RecordActionKind.reference) {
    const draft = createReferenceDraft(record);
    const result = createRecordActionResult(record, actionId);
    return (
      <Modal title="Create reference leaf" onDismiss={onDismiss}>
        <div className="tx-record-action-result">
          <div className="tx-card-badges">
            <Badge>{draft.schema}</Badge>
            <Badge>{draft.kind}</Badge>
            <Badge>{draft.transition.parentBoundary}</Badge>
          </div>
          <p className="tx-muted">Creates a browser-local evidence/reference draft. The parent boundary is preserved; no source provenance is inferred.</p>
          <TransitionValidationNotice validation={draft.validation} />
          <pre className="tx-record-markdown-preview">{draft.markdown}</pre>
          <div className="tx-dialog-actions">
            <Button variant="ghost" onClick={onDismiss}>Close</Button>
            <Button variant="ghost" icon="shareNodes" onClick={() => onShare?.(record)}>Share parent session</Button>
            <Button variant="primary" icon="reference" onClick={() => onCreateTransition?.(record, draft)}>Create reference</Button>
          </div>
          {result ? <p className="tx-muted tx-action-caption">Reference capsule remains available for handoff copy: {result.intent}.</p> : null}
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
  function setFlag(key, value) {
    setDraft((current) => Object.assign({}, current, { [key]: Boolean(value) }));
  }
  function submit(event) {
    event.preventDefault();
    onSubmit?.(normalizeWorkspaceDisplayOptions(draft));
  }
  return (
    <Modal title="Display options" onDismiss={onDismiss} initialFocus="displaySupportingMarkdown">
      <form className="tx-form tx-display-options-form" onSubmit={submit} data-form="display-options-form">
        <p className="tx-muted">Presentation only. Source, audit, lineage, and export truth stay intact even when material is hidden from Feed/Tree.</p>
        <label className="tx-display-option-row">
          <span><strong>Supporting Markdown</strong><small>{Number(counts.records || 0)} loaded record{Number(counts.records || 0) === 1 ? '' : 's'} · plain docs stay distinct from Tiinex leaves</small></span>
          <input id="displaySupportingMarkdown" type="checkbox" checked={draft.showSupportingMarkdown} onChange={(event) => setFlag('showSupportingMarkdown', event.target.checked)} />
        </label>
        <label className="tx-display-option-row">
          <span><strong>Workspace candidates</strong><small>{Number(counts.workspaceCandidates || 0)} candidate{Number(counts.workspaceCandidates || 0) === 1 ? '' : 's'} · open/merge stays explicit</small></span>
          <input type="checkbox" checked={draft.showWorkspaceCandidates} onChange={(event) => setFlag('showWorkspaceCandidates', event.target.checked)} />
        </label>
        <label className="tx-display-option-row">
          <span><strong>Assets</strong><small>{Number(counts.assets || 0)} asset{Number(counts.assets || 0) === 1 ? '' : 's'} · hidden by default like supporting files, never fake leaves</small></span>
          <input type="checkbox" checked={draft.showAssets} onChange={(event) => setFlag('showAssets', event.target.checked)} />
        </label>
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="check">Apply</Button>
        </div>
      </form>
    </Modal>
  );
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
