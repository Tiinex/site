import React from 'react';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';

export function WorkspaceExportDialog({ workspace = {}, plan = null, onDismiss, onExecute }) {
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
            {(exportPlan.exportTypes || []).map((type) => <ExportCard key={type.id} item={type} compact />)}
          </div>
        </ExportSection>

        <div className="tx-export-summary-grid" aria-label="Export summary">
          <SummaryTile label="Adapter" value={selectedAdapter?.label || 'Download'} meta={selectedAdapter?.status || 'ready'} />
          <SummaryTile label="Scope" value={selectedScope?.label || 'All'} meta={`${exportPlan.counts?.records || 0} records`} />
          <SummaryTile label="Export" value={selectedType?.label || 'Tree export'} meta={selectedType?.packageEnvelope ? 'package envelope' : 'no package envelope'} />
          <SummaryTile label="Transport" value={exportPlan.transportLevel || 'TL0'} meta={exportPlan.operation || 'local-download'} />
        </div>

        <p className="tx-export-boundary">{exportPlan.execution?.boundary || exportPlan.boundary || 'Export plan does not mutate sources.'}</p>
        {selectedAdapter?.status === 'future' ? <p className="tx-export-note">This adapter is intentionally visible as a future option but cannot execute in this slice.</p> : null}
        <div className="tx-dialog-actions tx-export-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button id="tx-export-execute" variant="primary" icon="download" disabled={executeDisabled} onClick={() => onExecute?.(exportPlan)}>{exportPlan.execution?.label || 'Execute tree export'}</Button>
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

function ExportCard({ item = {}, compact = false }) {
  const classes = [
    'tx-export-card',
    compact ? 'tx-export-card-compact' : '',
    item.selected ? 'tx-export-card-selected' : '',
    item.status === 'future' || item.status === 'disabled' || item.status === 'blocked' ? 'tx-export-card-disabled' : ''
  ].filter(Boolean).join(' ');
  return (
    <article className={classes} data-export-status={item.status || 'ready'} aria-disabled={item.status !== 'ready'}>
      <div className="tx-export-card-icon"><Icon name={item.icon || iconForItem(item)} /></div>
      <div className="tx-export-card-copy">
        <div className="tx-export-card-title"><strong>{item.label || item.id}</strong><span>{item.status || 'ready'}</span></div>
        <p>{item.description || item.capability || ''}</p>
        {item.capability ? <small>{item.capability}</small> : null}
      </div>
    </article>
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
