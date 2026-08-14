import React from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { workspaceEmptyStateCopy } from '../../workspaces/workspace.emptyStateCopy.js';
import { displayOptionsHiddenCount } from '../../workspaces/workspace.displayOptions.js';
import { recordSourceClass } from '../../workspaces/workspace.displayFilters.js';
import { shouldShowWorkspaceSummary } from '../../workspaces/workspace.summary.js';
import { isLocalSessionMaterial } from '../../workspaces/workspace.localSourceLifecycle.js';
import { normalizeGithubTransportTier } from '../../sources/github/github.transport.js';
import { isOriginReferenceSource } from '../../sources/origin.references.js';
import { sourceTransportBadgesForSource } from '../../app/sourceTransportRefresh.js';
import { buildGovernanceBoundaryForSource, GOVERNANCE_BOUNDARY_SCHEMA_ID } from '../../governance/governance.boundary.js';
import { SourceReceiptDetails } from './workspace.sourceReceipt.views.jsx';

export function WorkspaceBoundaryKicker({ workspace = {} }) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const localCount = records.filter((record) => recordSourceClass(record) === 'local').length
    + records.filter((record) => record?.materialReconciliation?.status === 'checksum-match' && record.materialReconciliation.localSnapshot).length
    + assets.filter((asset) => isLocalSessionMaterial(asset)).length;
  const sourceCount = records.filter((record) => recordSourceClass(record) === 'source-backed').length;
  if (!localCount && !sourceCount) return null;
  const label = sourceCount && localCount ? 'mixed' : sourceCount ? 'source-backed' : 'local';
  const title = sourceCount && localCount
    ? 'Workspace contains both browser-local and explicit source-backed material.'
    : sourceCount
      ? 'Workspace is currently showing explicit source-backed material.'
      : 'Browser-local session material; source provenance is not inferred.';
  return <span className={`tx-window-kicker tx-boundary-workspace-kicker tx-${label}`} title={title}><Icon name={sourceCount ? 'source' : 'workspace'} /><span>{label}</span></span>;
}

export function SourceStrip({ workspace, boundary, onCloseSource, onOpenAddDialog, onSourceTransportRefresh, onOpenGovernance }) {
  const sources = (Array.isArray(workspace.sources) ? workspace.sources : []);
  if (!sources.length) return null;
  return (
    <div className="tx-source-strip workspace-source-strip tx-compact-source-strip" aria-label="Workspace sources">
      <div className="tx-source-list">
        {sources.map((source) => {
          const closeable = Boolean(source.closeable);
          const kind = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
          const isLocal = kind.includes('local') || source.id === 'local';
          const isOriginRecovery = isOriginReferenceSource(source) || source.recoveryOnly === true;
          const isTargetedFileRecovery = source.sourceKind === 'github.file' && source.loadable === false;
          const transport = isOriginRecovery ? originRecoveryTransportSummary(source) : sourceTransportSummary(source);
          const sourceLabel = source.label || source.id || 'Source';
          const addTitle = isLocal ? 'Add local files, archive imports, or workspace artifacts' : 'Open source controls for this source: choose repo files, explicit files, or issue snapshots';
          const addLabel = isLocal ? 'Add' : 'Discover';
          const canLoadFromSource = closeable && !isOriginRecovery && source.loadable !== false;
          const closeTitle = isLocal ? (source.closeLabel || 'Clear local/session material') : isOriginRecovery ? `Dismiss recovery origin ${sourceLabel}` : `Close ${sourceLabel}`;
          const closeAria = isLocal ? 'Clear Local source material from this browser session' : isOriginRecovery ? `Dismiss recovery-only origin ${sourceLabel}` : `Close ${sourceLabel}`;
          return (
            <span
              key={source.id || source.label}
              className={`tx-source-pill ${closeable ? 'tx-source-pill-closeable' : ''} ${isOriginRecovery ? 'tx-source-origin-recovery' : kind.includes('github') ? 'source-github' : 'source-local'}`}
              title={source.boundary || boundary || ''}
              data-discovery-state={source.discoveryState || undefined}
              data-source-kind={kind || undefined}
              data-source-role={isOriginRecovery ? 'origin-recovery' : isLocal ? 'local-session' : isTargetedFileRecovery ? 'targeted-provenance' : 'configured-source'}
            >
              <Icon name={kind.includes('github') ? 'source' : 'workspace'} />
              <strong>{sourceLabel}</strong>
              <small title={isOriginRecovery ? 'Explicit origin references recovered from imported/local artifacts, not loaded source records.' : undefined}>{sourceCountText(source, isOriginRecovery)}</small>
              {isOriginRecovery ? <span className="tx-source-role-badge" title="Recovery-only origin: imported records remain local/session authority.">recovery only</span> : null}
              {transport.badges?.length ? <span className={`tx-source-transport-group ${transport.mixed ? 'is-mixed' : ''}`} aria-label={transport.mixed ? 'Surface transports' : 'Source transport'}>
                {transport.badges.map((badge) => badge.refreshable ? (
                  <button key={badge.key} type="button" className={`tx-source-transport tx-source-transport-button ${badge.className}`} title={badge.title} aria-label={badge.title} onClick={() => onSourceTransportRefresh?.(source.id, badge.refreshTier || badge.tier, badge.surfaceKeys || [])}>{badge.label}</button>
                ) : (
                  <span key={badge.key} className={`tx-source-transport ${badge.className}`} title={badge.title}>{badge.label}</span>
                ))}
              </span> : null}
              <SourceGovernanceBadge source={source} onOpenGovernance={onOpenGovernance} />
              {canLoadFromSource ? <button type="button" className="tx-source-load" aria-label={`${addLabel} material for ${sourceLabel}`} title={addTitle} onClick={() => onOpenAddDialog?.(isLocal ? '' : source.id)}><Icon name="add" /><span>{addLabel}</span></button> : null}
              {closeable ? <button type="button" className="tx-source-close" aria-label={closeAria} title={closeTitle} onClick={() => onCloseSource?.(source.id)}><Icon name="close" /></button> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}


function sourceCountText(source = {}, originRecovery = false) {
  if (!originRecovery) return Number(source.count || 0);
  const refs = Number(source.originReferenceCount || 0);
  return refs ? `${refs} ref${refs === 1 ? '' : 's'}` : '0 loaded';
}

function originRecoveryTransportSummary(source = {}) {
  return {
    badges: [{
      key: 'origin-recovery',
      label: 'recovery',
      tier: 'direct',
      refreshTier: '',
      refreshable: false,
      title: source.boundary || 'Explicit origin metadata is available for user-invoked lineage recovery; this is not a configured source and does not make imported material source-backed.',
      className: 'tx-transport-tier-direct tx-transport-origin-recovery'
    }],
    mixed: false
  };
}

function SourceGovernanceBadge({ source = {}, onOpenGovernance }) {
  if (isOriginReferenceSource(source) || source.recoveryOnly === true) return null;
  const sourceKind = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
  const repo = String(source.repo || source.repository || source.config?.repo || '').trim();
  const explicitBoundary = source.governanceBoundary && typeof source.governanceBoundary === 'object' && source.governanceBoundary.schema === GOVERNANCE_BOUNDARY_SCHEMA_ID
    ? source.governanceBoundary
    : null;
  const boundary = explicitBoundary || (sourceKind.includes('github') && repo
    ? buildGovernanceBoundaryForSource(source, { rootChecked: false, discoveredFrom: 'source-strip-unchecked' })
    : null);
  if (!boundary || typeof boundary !== 'object') return null;
  const status = String(boundary.status || '').trim();
  if (!status || status === 'local') return null;
  const policyKind = boundary.policy?.kind || '';
  const label = status === 'found'
    ? 'lineage policy'
    : status === 'origin-fallback'
      ? (policyKind || 'license')
      : status === 'missing'
        ? 'no policy'
        : 'policy ?';
  const title = `${boundary.note || boundary.boundary || 'Source governance boundary'} · Click to read governance context.`;
  const className = `tx-source-governance tx-governance-${status}`;
  if (typeof onOpenGovernance === 'function') {
    return <button type="button" className={className} title={title} aria-label={`Open governance boundary: ${label}`} onClick={() => onOpenGovernance(source.id)}><Icon name={status === 'missing' ? 'warning' : 'audit'} /><span>{label}</span></button>;
  }
  return <span className={className} title={title} aria-label={`Governance boundary: ${label}`}><Icon name={status === 'missing' ? 'warning' : 'audit'} /><span>{label}</span></span>;
}

function sourceTransportSummary(source = {}) {
  const plan = String(source.transportLabel || source.transport || 'cache → mirror → proxy → direct').replace(/\s*→\s*/g, ' → ');
  const pendingTier = normalizeGithubTransportTier(source.transportOutcome?.pendingTier || '');
  const badges = sourceTransportBadgesForSource(source).map((badge) => {
    const pending = Boolean(badge.pendingTier || (pendingTier && (!Array.isArray(source.transportOutcome?.pendingSurfaces) || source.transportOutcome.pendingSurfaces.includes(badge.key))));
    const tier = normalizeGithubTransportTier(badge.pendingTier || badge.tier || pendingTier || '') || 'cache';
    const refreshTier = tier;
    const status = String(badge.status || '').toLowerCase();
    const titleParts = [
      badge.mixed ? `${badge.label}: ${tier}` : `Source transport: ${tier}`,
      badge.surfaceKeys?.length && badge.key !== 'all' ? `Surface: ${badge.surfaceKeys.join(', ')}` : '',
      pending ? `Trying ${tier} now` : '',
      Number(badge.loaded || 0) ? `${Number(badge.loaded || 0)} loaded` : '',
      badge.unavailable ? 'Unavailable/skipped' : '',
      badge.failed ? 'Failed' : '',
      `Configured plan: ${plan}`,
      badge.refreshable ? `Click: try ${badge.nextTier}` : 'Direct is the last fallback tier.'
    ].filter(Boolean);
    const text = badge.mixed && badge.shortLabel ? `${badge.shortLabel} ${tier}${pending ? '…' : ''}` : `${tier}${pending ? '…' : ''}`;
    return Object.assign({}, badge, {
      label: text,
      tier,
      refreshTier,
      refreshable: Boolean(badge.refreshable && !pending),
      title: titleParts.join(' · '),
      className: [
        `tx-transport-tier-${tier}`,
        badge.mixed ? 'is-transport-surface' : '',
        pending ? 'is-transport-pending' : '',
        status === 'failed' || status === 'unavailable' || badge.unavailable || badge.failed ? 'is-transport-failed' : '',
        status === 'ok' || Number(badge.loaded || 0) ? 'is-transport-ok' : ''
      ].filter(Boolean).join(' ')
    });
  });
  return { badges, mixed: badges.length > 1 };
}

export function WorkspaceMaterialSummary({ summary }) {
  if (!shouldShowWorkspaceSummary(summary)) return null;
  const counts = summary.counts || {};
  const latest = summary.latestImport;
  const latestDiagnostics = latest?.diagnostics || {};
  const latestLedger = latestDiagnostics.materialLedgerReceipt || latestDiagnostics.materialLedger || null;
  const ledgerExplainsVisibility = Boolean(latestLedger && (Number(latestLedger.hiddenRecords || 0) || Number(latestLedger.groupedRecords || 0) || Number(latestLedger.sourceWorkspaceArtifacts || latestLedger.legacySourceWorkspaceArtifacts || latestLedger.sourceWorkspaceArtifacts || 0)));
  const noisyLatest = latest && (latest.ok === false || counts.errors || counts.warnings || counts.previewOmitted || ledgerExplainsVisibility);
  return (
    <section className="tx-workspace-material-summary" aria-label="Workspace material summary">
      <div className="tx-material-summary-counts">
        <span title="Loaded records before Display options"><Icon name="manualFiles" /><strong>{counts.records || 0}</strong><small>loaded records</small></span>
        <span><Icon name="asset" /><strong>{counts.assets || 0}</strong><small>assets</small></span>
        <span><Icon name="workspace" /><strong>{counts.workspaceArtifacts || 0}</strong><small>workspaces</small></span>
        {counts.sourceBackedRecords ? <span><Icon name="source" /><strong>{counts.sourceBackedRecords}</strong><small>source-backed</small></span> : null}
        {counts.hiddenRecords ? <span title="Loaded records not visible in the current feed/tree view. Grouped records are source+local material shown as one canonical card; display-hidden records are filtered/supporting/parent material still available for lineage."><Icon name="filters" /><strong>{counts.visibleRecords || 0}/{counts.records || 0}</strong><small>visible</small></span> : null}
        {counts.groupedRecords ? <span title="Records grouped under a canonical source/local artifact cluster, not lost."><Icon name="check" /><strong>{counts.groupedRecords}</strong><small>grouped</small></span> : null}
        {counts.hiddenByDisplayRecords ? <span title="Records hidden by Display options/search/leaf membership; still available for lineage and recovery."><Icon name="filters" /><strong>{counts.hiddenByDisplayRecords}</strong><small>display-hidden</small></span> : null}
        {counts.lineageUsableRecords && counts.lineageUsableRecords !== counts.visibleRecords ? <span title="Records available to lineage/read-models, including material hidden by current display filters."><Icon name="lineage" /><strong>{counts.lineageUsableRecords}</strong><small>lineage usable</small></span> : null}
        {counts.materialChecksumMatches ? <span title="Verified local/source equivalents were reconciled to one canonical source-backed artifact; redundant local duplicates are pruned instead of hidden for later resurrection."><Icon name="check" /><strong>{counts.materialChecksumMatches}</strong><small>deduped matches</small></span> : null}
        {counts.localAssets ? <span title="Browser-local assets are locally available only; they are not source or public truth."><Icon name="asset" /><strong>{counts.localAssets}</strong><small>local assets</small></span> : null}
        {counts.materialChecksumMismatches ? <span title="Imported/local material and source material share identity but checksum differs."><Icon name="warning" /><strong>{counts.materialChecksumMismatches}</strong><small>mismatch</small></span> : null}
        {counts.recoveryOriginSources ? <span title="Explicit origins preserved from imported/local artifacts; recovery-only, not source-backed authority."><Icon name="source" /><strong>{counts.recoveryOriginSources}</strong><small>recovery origins</small></span> : null}
      </div>
      {noisyLatest ? (
        <div className={`tx-material-summary-import ${latest.ok ? 'tx-import-ok' : 'tx-import-degraded'}`} title={latest.message}>
          <Icon name={latest.ok ? 'check' : 'warning'} />
          <span>{latest.message}</span>
          {(counts.warnings || counts.errors || counts.previewOmitted) ? (
            <small>{counts.errors || 0} errors · {counts.warnings || 0} warnings · {counts.previewOmitted || 0} previews omitted</small>
          ) : null}
          <SourceReceiptDetails latest={latest} />
        </div>
      ) : null}
    </section>
  );
}

export function ProgressStrip({ workspace }) {
  const progress = workspace.discoveryProgress;
  if (!progress?.active) return null;
  return (
    <div className="tx-progress-strip tx-portal-resolution-progress" role="status" aria-live="polite" data-phase={progress.phase || 'resolving'}>
      <span>{progress.label || 'Preparing source snapshot'}</span>
      {progress.quantified !== false && progress.percent != null ? <div className="tx-progress-bar" aria-label="Source progress"><i style={{ width: `${Math.max(0, Math.min(100, Number(progress.percent || 0)))}%` }} /></div> : <small className="tx-progress-phase">{progress.phase || 'working'}</small>}
    </div>
  );
}

export function WorkspaceDropHint({ workspace, hasMaterial }) {
  if (hasMaterial || workspace.discoveryProgress) return null;
  return (
    <div className="tx-workspace-drop-hint" role="note">
      <p><strong>Drop local material here</strong><span>.md, folders, or .zip · local/session only</span></p>
    </div>
  );
}

export function ModeToolbar({ state, query, displayOptions, selectedRecord, lineageLoadReport = null, lineageReady = false, onVerse, onQuery, onOpenDisplayOptions, onRunLineageAudit, onLoadFullLineage }) {
  const verse = state.view?.workspaceVerse || 'feed';
  const discoveryVerse = verse === 'feed' || verse === 'tree';
  const lineageVerse = verse === 'lineage';
  const auditVerse = verse === 'audit';
  const selectedRecordId = String(state.view?.selectedRecordId || '');
  const selectedLineageReport = lineageLoadReport && String(lineageLoadReport.selectedRecordId || '') === selectedRecordId ? lineageLoadReport : null;
  const lineageAttempted = Boolean(lineageVerse && selectedRecord && (lineageReady || selectedLineageReport));
  const lineageComplete = Boolean(lineageAttempted && (lineageReady || (selectedLineageReport && selectedLineageReport.state === 'complete' && !selectedLineageReport.hasMissing)));
  const needsLineageLoad = Boolean(lineageVerse && selectedRecord && (!selectedLineageReport || selectedLineageReport.state !== 'complete' || selectedLineageReport.hasMissing));
  const modeLabel = lineageVerse ? 'LINEAGE MODE' : auditVerse ? 'AUDIT DETAILS' : 'DISCOVERY MODE';
  const hiddenPresentationCount = displayOptionsHiddenCount(displayOptions, lineageVerse ? 'lineage' : 'discovery');
  const returnVerse = auditVerse && selectedRecord ? 'lineage' : 'feed';
  const canDisplayOptions = discoveryVerse || lineageAttempted;
  const canSearch = !lineageVerse || lineageAttempted;
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
      {needsLineageLoad ? (
        <button type="button" className="tx-mode-load-lineage-button" onClick={onLoadFullLineage} title="Load or retry the full lineage index from available source/direct transport before Audit" aria-label="Load full lineage">
          <Icon name="lineage" /><span>Load full lineage</span>
        </button>
      ) : null}
      {lineageComplete ? (
        <button type="button" className="tx-mode-action-button tx-mode-audit-button tx-mode-audit-run-button" onClick={onRunLineageAudit} title="Audit lineage" aria-label="Audit lineage">
          <Icon name="audit" /><span>Audit</span>
        </button>
      ) : null}
      {canDisplayOptions ? (
        <button type="button" className="tx-mode-action-button tx-display-options-icon-trigger" onClick={onOpenDisplayOptions} title={`Display options${hiddenPresentationCount ? ` · ${hiddenPresentationCount} hidden` : ''}`} aria-label={`Display options${hiddenPresentationCount ? `, ${hiddenPresentationCount} hidden` : ''}`}>
          <Icon name="filters" />
          {hiddenPresentationCount ? <span className="tx-mode-action-count">{hiddenPresentationCount}</span> : null}
        </button>
      ) : null}
      {canSearch ? (
        <label className="tx-search-field tx-search-field-icon">
          <Icon name="search" />
          <input value={query} onChange={(event) => onQuery(event.target.value)} type="search" placeholder={lineageVerse ? 'Search loaded lineage…' : 'Search title/body/schema…'} />
        </label>
      ) : null}
    </div>
  );
}

export function EmptyWorkspaceState({ filtered, hasMaterial, query, summary = null, progress = null }) {
  const copy = workspaceEmptyStateCopy({ filtered, hasMaterial, query, summary, progress });
  return (
    <div className="tx-empty-node-state tx-compact-empty-node-state" role="status" aria-live="polite">
      <p>{copy.message}</p>
      {copy.hint ? <small>{copy.hint}</small> : null}
      {copy.firstWarning?.message ? <small className="tx-empty-receipt-detail">Warning: {String(copy.firstWarning.message).slice(0, 220)}</small> : null}
      {copy.firstError?.error ? <small className="tx-empty-receipt-detail">Error: {String(copy.firstError.error).slice(0, 220)}</small> : null}
    </div>
  );
}
