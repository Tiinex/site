import React from 'react';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';

export function WorkspaceExportDialog({ workspace = {}, plan = null, publication = null, publicationInput = {}, publicationProgress = {}, onPublicationInput, onPublicationCopy, onPublicationOpen, onPublicationAttest, onPublicationVerify, onDismiss, onExecute, onSelectExportType }) {
  const exportPlan = plan || {};
  const title = workspace.title || workspace.name || 'Workspace';
  const selectedAdapter = (exportPlan.adapters || []).find((adapter) => adapter.selected) || (exportPlan.adapters || [])[0] || null;
  const selectedType = (exportPlan.exportTypes || []).find((type) => type.selected) || (exportPlan.exportTypes || [])[0] || null;
  const selectedScope = (exportPlan.scopes || []).find((scope) => scope.selected) || (exportPlan.scopes || [])[0] || null;
  const executeDisabled = !exportPlan.execution?.available;
  return (
    <Modal title="Prepare workspace export" className="tx-dialog-export-adapter" onDismiss={onDismiss} initialFocus="tx-export-execute">
      <div className="tx-export-flow" data-export-plan-schema={exportPlan.schema || ''}>
        <p className="tx-export-intro">Configure adapter, scope, export type and transport before executing export for <strong>{title}</strong>.</p>
        <div className="tx-export-steps" aria-label="Export steps">
          <span className="tx-export-step tx-export-step-active">1 · Configure</span>
          <span className="tx-export-step">2 · Execute</span>
        </div>

        <ExportSection title="Adapter">
          <div className="tx-export-card-grid tx-export-card-grid-adapters">
            {(exportPlan.adapters || []).map((adapter) => <ExportCard key={adapter.id} item={adapter} />)}
          </div>
        </ExportSection>

        <ExportSection title="Scope">
          <div className="tx-export-card-grid tx-export-card-grid-scopes">
            {(exportPlan.scopes || []).map((scope) => <ExportCard key={scope.id} item={scope} compact />)}
          </div>
        </ExportSection>

        <ExportSection title="Export type">
          <div className="tx-export-card-grid tx-export-card-grid-types">
            {(exportPlan.exportTypes || []).map((type) => <ExportCard key={type.id} item={type} compact onSelect={type.status === 'ready' || type.status === 'degraded' || type.status === 'available' ? () => onSelectExportType?.(type.id) : null} />)}
          </div>
        </ExportSection>

        <div className="tx-export-summary-grid" aria-label="Export summary">
          <SummaryTile label="Adapter" value={selectedAdapter?.label || 'Download'} meta={selectedAdapter?.status || 'ready'} />
          <SummaryTile label="Scope" value={selectedScope?.label || 'All'} meta={`${exportPlan.counts?.records || 0} records`} />
          <SummaryTile label="Export" value={selectedType?.label || 'Tree export'} meta={selectedType?.packageEnvelope ? 'package envelope' : 'no package envelope'} />
          <SummaryTile label="Transport" value={exportPlan.transportLevel || 'TL0'} meta={exportPlan.operation || 'local-download'} />
        </div>

        <p className="tx-export-boundary">{exportPlan.execution?.boundary || exportPlan.boundary || 'Export plan does not mutate sources.'}</p>
        {exportPlan.selectedExportType === 'github-publish' ? <GithubPublicationRoutine publication={publication} input={publicationInput} progress={publicationProgress} onInput={onPublicationInput} onCopy={onPublicationCopy} onOpen={onPublicationOpen} onAttest={onPublicationAttest} onVerify={onPublicationVerify} /> : null}
        {selectedAdapter?.status === 'future' ? <p className="tx-export-note">This adapter is intentionally visible as a future option but cannot execute in this slice.</p> : null}
        {selectedAdapter?.status === 'blocked' ? <p className="tx-export-note">This export mode is blocked by current shared package qualification and will not download.</p> : null}
        <div className="tx-dialog-actions tx-export-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Cancel</Button>
          {exportPlan.selectedExportType === 'github-publish' ? null : <Button id="tx-export-execute" variant="primary" icon="download" disabled={executeDisabled} onClick={() => onExecute?.(exportPlan)}>{exportPlan.execution?.label || 'Execute tree export'}</Button>}
        </div>
      </div>
    </Modal>
  );
}

function ExportSection({ title, children }) {
  return (
    <section className="tx-export-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ExportCard({ item = {}, compact = false, onSelect = null }) {
  const selectable = item.status === 'ready' || item.status === 'degraded' || item.status === 'available';
  const classes = [
    'tx-export-card',
    compact ? 'tx-export-card-compact' : '',
    item.selected ? 'tx-export-card-selected' : '',
    item.status === 'future' || item.status === 'disabled' || item.status === 'blocked' ? 'tx-export-card-disabled' : ''
  ].filter(Boolean).join(' ');
  const content = <>
    <div className="tx-export-card-icon"><Icon name={item.icon || iconForItem(item)} /></div>
    <div className="tx-export-card-copy">
      <div className="tx-export-card-title"><strong>{item.label || item.id}</strong><span>{item.status || 'ready'}</span></div>
      <p>{item.description || item.capability || ''}</p>
      {item.capability ? <small>{item.capability}</small> : null}
    </div>
  </>;
  return onSelect ? (
    <button type="button" className={`${classes} tx-export-card-button`} data-export-status={item.status || 'ready'} aria-pressed={Boolean(item.selected)} onClick={onSelect}>{content}</button>
  ) : (
    <article className={classes} data-export-status={item.status || 'ready'} aria-disabled={!selectable}>{content}</article>
  );
}

function SummaryTile({ label, value, meta }) {
  return (
    <div className="tx-export-summary-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  );
}

function iconForItem(item = {}) {
  if (item.id === 'github') return 'github';
  if (item.id === 'handoff-package') return 'archive';
  if (item.id === 'local') return 'local';
  if (item.id === 'source') return 'source';
  if (item.id === 'tree') return 'tree';
  return 'download';
}


function GithubPublicationRoutine({ publication = null, input = {}, progress = {}, onInput, onCopy, onOpen, onAttest, onVerify }) {
  const product = publication || {};
  const plan = product.plan || {};
  const ready = plan.status === 'ready';
  const records = product.eligibleRecords || [];
  return (
    <section className="tx-export-section tx-github-publication" aria-label="Guided GitHub publication">
      <h3>Guided GitHub publication</h3>
      <p className="tx-export-note">Human-performed GitHub mutation: choose the local artifact and exact intent, Copy → Open GitHub → post/update the exact payload → explicitly confirm that exact action at the exact final target → Verify the exact remote body. Copy/Open alone never count as publication success.</p>
      <label className="tx-field"><span>Local artifact</span><select value={input.recordId || ''} onChange={(event) => onInput?.({ recordId: event.target.value })}><option value="">Choose owned-local artifact…</option>{records.map((record) => <option key={record.id} value={record.id}>{record.title || record.path || record.id}</option>)}</select></label>
      <label className="tx-field"><span>Target mode</span><select value={input.mode || ''} onChange={(event) => onInput?.({ mode: event.target.value, targetInput: '', finalTarget: '' })}>{(product.modes || []).map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}</select></label>
      <label className="tx-field"><span>Repository</span><input value={input.repository || ''} placeholder="owner/repo" onChange={(event) => onInput?.({ repository: event.target.value })} /></label>
      {product.targetRequired ? <label className="tx-field"><span>{product.targetLabel}</span><input value={input.targetInput || ''} placeholder={product.targetPlaceholder || ''} onChange={(event) => onInput?.({ targetInput: event.target.value })} /></label> : null}
      <div className="tx-export-summary-grid">
        <SummaryTile label="Plan" value={plan.status || 'blocked'} meta={plan.planId || 'No qualified plan'} />
        <SummaryTile label="Payload" value={plan.outboundPayload?.sha256 ? plan.outboundPayload.sha256.slice(0, 12) : '—'} meta={plan.outboundPayload?.representation || 'exact local Markdown'} />
      </div>
      {plan.findings?.length ? <div className="tx-export-note" role="status">{plan.findings.filter((item) => item.severity === 'error').slice(0, 3).map((item) => <div key={item.code}>{item.message}</div>)}</div> : null}
      <div className="tx-dialog-actions tx-export-dialog-actions tx-github-publication-actions">
        <Button variant="secondary" icon="share" disabled={!ready} onClick={() => onCopy?.()}>{progress.copied ? 'Copied' : 'Copy exact payload'}</Button>
        <Button variant="secondary" icon="github" disabled={!ready || !product.openUrl} onClick={() => onOpen?.()}>{progress.opened ? 'GitHub opened' : 'Open GitHub'}</Button>
      </div>
      <label className="tx-field"><span>Final exact GitHub URL</span><input value={input.finalTarget || ''} placeholder={product.finalTargetRequired ? 'Required after posting: exact issue URL or comment permalink' : 'Known target is reused unless you supply another exact final URL'} onChange={(event) => onInput?.({ finalTarget: event.target.value })} /></label>
      <label className="tx-field tx-publication-attestation"><span>Human mutation confirmation</span><span><input type="checkbox" checked={Boolean(progress.attested)} disabled={!ready || !product.mutationTargetQualified} onChange={(event) => onAttest?.(event.target.checked)} /> I posted/updated this exact payload at this exact GitHub target for the current plan.</span><small>Tiinex does not infer a write from Copy, Open, or a matching pre-existing target.</small></label>
      <div className="tx-dialog-actions tx-export-dialog-actions"><Button variant="primary" icon="check" disabled={!ready || !product.mutationTargetQualified || !progress.attested} onClick={() => onVerify?.()}>{progress.verified ? 'Verified' : 'Verify exact publication'}</Button></div>
      {product.latestReceipt ? <p className="tx-export-note">Previous verified receipt: <strong>{product.latestReceipt.receipt?.receiptId || 'recorded'}</strong> · {product.latestReceipt.sourceBinding?.remoteTarget?.inputTarget || ''}</p> : null}
      {progress.notice ? <p className="tx-export-note" role="status">{progress.notice}</p> : null}
      {progress.result ? <p className="tx-export-note"><strong>{progress.result.status === 'success' ? 'Verified publication receipt recorded.' : 'Not source-qualified.'}</strong> {progress.result.remoteTarget?.inputTarget || ''}</p> : null}
    </section>
  );
}
