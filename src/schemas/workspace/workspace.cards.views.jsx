import React from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { presentRecordActions, RecordActionKind } from '../../actions/record.actions.js';
import { AuditStatusBadge } from './workspace.auditBadge.views.jsx';
import { SchemaReadView } from './workspace.read.views.jsx';
import { actionClassName, actionLabel, compactPath, compactRecordDate, recordLifecycleBadge, recordSchemaBadge, recordSourceBadge } from './workspace.viewFormatting.js';

export function WorkspaceCandidateCard({ candidate, onOpenWorkspaceCandidate, onMergeWorkspaceCandidate }) {
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

export function AssetCard({ asset, onOpenAsset }) {
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

export function RecordCard({ record, auditItem, onOpenRecord, onFocusRecordLineage, onShareRecord, onRecordAction, context = 'discovery', expanded = false, onToggleExpanded }) {
  const lineageContext = context === 'lineage';
  const baseActions = presentRecordActions(record).filter((action) => action.enabled !== false && action.id !== RecordActionKind.reference);
  const actions = lineageContext
    ? [{ id: RecordActionKind.lineage, label: 'Anchor', icon: 'lineage', enabled: true }, ...baseActions]
    : baseActions.filter((action) => action.id !== RecordActionKind.lineage);
  const dateBadge = compactRecordDate(record);
  const schemaBadge = recordSchemaBadge(record);
  const sourceBadge = recordSourceBadge(record);
  const primaryClick = () => {
    if (lineageContext) return onToggleExpanded?.(record.id);
    return onFocusRecordLineage?.(record.id);
  };
  const onKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); primaryClick(); }
  };
  return (
    <article className={`tx-artifact-card tx-record-card tx-old-like-record-card tx-clickable-record-card ${lineageContext ? 'tx-lineage-as-record-card' : ''} ${expanded ? 'tx-record-card-expanded' : ''}`} role="button" tabIndex="0" aria-expanded={lineageContext ? expanded : undefined} aria-label={`${lineageContext ? 'Toggle read preview for' : 'Focus lineage for'} ${record.title || 'artifact'}`} onClick={primaryClick} onKeyDown={onKey}>
      <div className="tx-card-badges tx-legacy-card-badges">
        <AuditStatusBadge record={record} item={auditItem} />
        {recordLifecycleBadge(record) ? <Badge title="Lifecycle/publication state">{recordLifecycleBadge(record)}</Badge> : null}
        <Badge>{schemaBadge}</Badge>
        {dateBadge ? <Badge>{dateBadge}</Badge> : null}
        <Badge>{sourceBadge}</Badge>
      </div>
      <h3>{record.title || 'Untitled'}</h3>
      <p>{record.summary || 'No summary available yet.'}</p>
      {record.path ? <div className="tx-card-pathline" title={record.path}><Icon name="folderOpen" />{compactPath(record.path)}</div> : null}
      {lineageContext && expanded ? (
        <div className="tx-record-card-read-preview" onClick={(event) => event.stopPropagation()}>
          <SchemaReadView record={record} compact maxSections={2} showHeader={false} lineClamp />
        </div>
      ) : null}
      <footer className="tx-legacy-action-row tx-artifact-actions" aria-label="Artifact actions" onClick={(event) => event.stopPropagation()}>
        {actions.map((action) => action.href ? (
          <a key={action.id} className={actionClassName(action)} href={action.href} target="_blank" rel="noopener noreferrer" title={actionLabel(action)} aria-label={actionLabel(action)}><Icon name={action.icon} /><strong>{actionLabel(action)}</strong></a>
        ) : (
          <button key={action.id} type="button" className={actionClassName(action)} title={actionLabel(action)} aria-label={actionLabel(action)} onClick={() => {
            if (action.id === RecordActionKind.open) return onOpenRecord?.(record.id);
            if (action.id === RecordActionKind.lineage) return onFocusRecordLineage?.(record.id);
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
