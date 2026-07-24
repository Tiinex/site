import React from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { displayOptionsHiddenCount } from '../../workspaces/workspace.displayOptions.js';
import { recordSourceClass } from '../../workspaces/workspace.displayFilters.js';
import { shouldShowWorkspaceSummary } from '../../workspaces/workspace.summary.js';

export function WorkspaceBoundaryKicker({ workspace = {} }) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const candidates = Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [];
  const localCount = records.filter((record) => recordSourceClass(record) === 'local').length + assets.length + candidates.length;
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

export function SourceStrip({ workspace, boundary, onCloseSource, onOpenAddDialog, onSourceTransportRefresh }) {
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
          const transport = sourceTransportSummary(source);
          const idle = source.discoveryState === 'deferred' || source.discoveryState === 'not-started';
          return (
            <span key={source.id || source.label} className={`tx-source-pill ${closeable ? 'tx-source-pill-closeable' : ''} ${kind.includes('github') ? 'source-github' : 'source-local'}`} title={source.boundary || boundary || ''}>
              <Icon name={kind.includes('github') ? 'source' : 'workspace'} />
              <strong>{source.label || source.id || 'Source'}</strong>
              <small>{source.count || 0}</small>
              {transport.label ? <button type="button" className="tx-source-transport tx-source-transport-button" title={transport.title} onClick={() => onSourceTransportRefresh?.(source.id)}>{transport.label}</button> : null}
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

function sourceTransportSummary(source = {}) {
  const plan = String(source.transportLabel || source.transport || 'cache → mirror → proxy → direct').replace(/\s*→\s*/g, ' → ');
  const outcome = source.transportOutcome || {};
  const tiers = source.transportTiers || {};
  const winning = Array.isArray(outcome.winningTiers) && outcome.winningTiers.length
    ? outcome.winningTiers
    : ['cache', 'mirror', 'proxy', 'direct'].filter((tier) => Number(tiers[tier] || 0) > 0);
  const attempted = Array.isArray(outcome.attemptedTiers) ? outcome.attemptedTiers : [];
  const label = winning.length ? `used: ${winning.join('+')}` : 'plan';
  const skipped = Array.isArray(outcome.skipped) ? outcome.skipped : [];
  const failed = Array.isArray(outcome.failed) ? outcome.failed : [];
  const titleParts = [
    `Configured plan: ${plan}`,
    attempted.length ? `Attempted: ${attempted.join(' → ')}` : 'Attempted: not browser-verified yet',
    winning.length ? `Delivered by: ${winning.join(', ')}` : 'Delivered by: none recorded yet',
    skipped.length ? `Skipped/unavailable: ${skipped.map((item) => `${item.tier}${item.message ? ` (${item.message})` : ''}`).join(', ')}` : '',
    failed.length ? `Failed attempts: ${failed.map((item) => `${item.tier}${item.status ? ` ${item.status}` : ''}`).join(', ')}` : '',
    'Click to clear this source cache and reopen source controls for the next explicit transport attempt.'
  ].filter(Boolean);
  return { label, title: titleParts.join(' · ') };
}

export function WorkspaceMaterialSummary({ summary }) {
  if (!shouldShowWorkspaceSummary(summary)) return null;
  const counts = summary.counts || {};
  const latest = summary.latestImport;
  const noisyLatest = latest && (latest.ok === false || counts.errors || counts.warnings || counts.previewOmitted);
  return (
    <section className="tx-workspace-material-summary" aria-label="Workspace material summary">
      <div className="tx-material-summary-counts">
        <span title="Loaded records before Display options"><Icon name="manualFiles" /><strong>{counts.records || 0}</strong><small>loaded records</small></span>
        <span><Icon name="asset" /><strong>{counts.assets || 0}</strong><small>assets</small></span>
        <span><Icon name="workspace" /><strong>{counts.workspaceCandidates || 0}</strong><small>workspaces</small></span>
        {counts.sourceBackedRecords ? <span><Icon name="source" /><strong>{counts.sourceBackedRecords}</strong><small>source-backed</small></span> : null}
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

function SourceReceiptDetails({ latest }) {
  const surfaces = latest?.diagnostics?.surfaces || latest?.diagnostics?.sourcePlan?.surfaces || null;
  const outcome = latest?.diagnostics?.transportOutcome || null;
  if (!surfaces && !outcome) return null;
  const rows = [];
  const pushSurface = (key, label) => {
    const item = surfaces?.[key];
    if (!item?.requested && !item?.attempted && !Number(item?.loaded || 0) && !item?.deferred && !item?.unavailable) return;
    const bits = [];
    if (item.requested) bits.push('requested');
    if (item.attempted) bits.push('attempted');
    if (Number(item.discovered || 0)) bits.push(`${Number(item.discovered || 0)} discovered`);
    if (Number(item.requestedCount || 0) && key !== 'repoFiles') bits.push(`${Number(item.requestedCount || 0)} targets`);
    if (Number(item.loaded || 0)) bits.push(`${Number(item.loaded || 0)} loaded`);
    if (Number(item.failed || 0)) bits.push(`${Number(item.failed || 0)} failed`);
    if (item.deferred) bits.push('deferred');
    if (item.unavailable) bits.push('unavailable');
    if (item.skipped) bits.push('skipped');
    rows.push({ key, label, text: bits.join(' · ') || 'no result' });
  };
  pushSurface('repoFiles', 'Repo files');
  pushSurface('explicitFiles', 'Explicit files');
  pushSurface('issueSnapshots', 'Issue snapshots');
  const attempted = Array.isArray(outcome?.attemptedTiers) ? outcome.attemptedTiers.join(' → ') : '';
  const winning = Array.isArray(outcome?.winningTiers) ? outcome.winningTiers.join(' + ') : '';
  return (
    <div className="tx-source-receipt-details" aria-label="Source receipt details">
      {rows.map((row) => <span key={row.key}><strong>{row.label}</strong><small>{row.text}</small></span>)}
      {outcome ? <span><strong>Transport</strong><small>{attempted ? `attempted ${attempted}` : 'attempted tiers unavailable'}{winning ? ` · used ${winning}` : ''}</small></span> : null}
    </div>
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
  const lineageLoaded = Boolean(lineageVerse && selectedRecord && (lineageReady || (lineageLoadReport && String(lineageLoadReport.selectedRecordId || '') === selectedRecordId)));
  const modeLabel = lineageVerse ? 'LINEAGE MODE' : auditVerse ? 'AUDIT DETAILS' : 'DISCOVERY MODE';
  const hiddenPresentationCount = displayOptionsHiddenCount(displayOptions, lineageVerse ? 'lineage' : 'discovery');
  const returnVerse = auditVerse && selectedRecord ? 'lineage' : 'feed';
  const canDisplayOptions = discoveryVerse || lineageLoaded;
  const canSearch = !lineageVerse || lineageLoaded;
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
      {lineageVerse && selectedRecord && !lineageLoaded ? (
        <button type="button" className="tx-mode-load-lineage-button" onClick={onLoadFullLineage} title="Load the full loaded-workspace lineage index before search, filters, or Audit" aria-label="Load full lineage">
          <Icon name="lineage" /><span>Load full lineage</span>
        </button>
      ) : null}
      {lineageLoaded ? (
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

export function EmptyWorkspaceState({ filtered, hasMaterial, query, summary = null }) {
  const latest = summary?.latestImport || null;
  const hasDeferredSourceReceipt = Boolean(!hasMaterial && latest && (latest.message || latest.warnings?.length || latest.errors?.length));
  const message = filtered
    ? 'No nodes match this view.'
    : hasMaterial
      ? 'No artifacts match this view.'
      : hasDeferredSourceReceipt
        ? 'No readable material was produced.'
        : 'No material yet.';
  const hint = filtered && query
    ? `Search filter: ${query}`
    : hasDeferredSourceReceipt
      ? String(latest.message || 'The source boundary is registered, but the selected reader did not produce records.').slice(0, 260)
      : '';
  const firstWarning = hasDeferredSourceReceipt && latest.warnings?.length ? latest.warnings[0] : null;
  const firstError = hasDeferredSourceReceipt && latest.errors?.length ? latest.errors[0] : null;
  return (
    <div className="tx-empty-node-state tx-compact-empty-node-state" role="status" aria-live="polite">
      <p>{message}</p>
      {hint ? <small>{hint}</small> : null}
      {firstWarning?.message ? <small className="tx-empty-receipt-detail">Warning: {String(firstWarning.message).slice(0, 220)}</small> : null}
      {firstError?.error ? <small className="tx-empty-receipt-detail">Error: {String(firstError.error).slice(0, 220)}</small> : null}
    </div>
  );
}
