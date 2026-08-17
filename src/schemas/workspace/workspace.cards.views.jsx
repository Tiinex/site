import React from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { isWorkspaceRecord, presentRecordActions, RecordActionKind } from '../../actions/record.actions.js';
import { transitionProductActionsForRecord } from '../../transitions/transition.productPresentation.browser.js';
import { AuditStatusBadge } from './workspace.auditBadge.views.jsx';
import { SchemaReadView } from './workspace.read.views.jsx';
import { appendTransitionActionsToStaticRow } from './workspace.cardActions.js';
import { compactPath, compactRecordDate, recordDisplayPath, recordLifecycleBadge, recordMaterialBadge, recordSchemaBadge, recordSchemaCanOpen, recordSourceBadge } from './workspace.viewFormatting.js';
import { workspaceArtifactActionModel, workspaceArtifactBoundaryBadge } from '../../workspaces/workspace.artifactActions.js';
import { RecordActionButton } from './workspace.recordActionButton.views.jsx';


export const AssetCard = React.memo(function AssetCard({ asset, actionStateKey = '', onOpenAsset }) {
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
}, assetCardPropsEqual);

export function RecordCard({ record, auditItem, actionStateKey = '', workspaceRecords = [], workspaceId = '', onOpenRecord, onFocusRecordLineage, onShareRecord, onRecordAction, onOpenSchema, context = 'discovery', expanded = false, onToggleExpanded }) {
  const lineageContext = context === 'lineage';
  const displayPath = recordDisplayPath(record);
  const transitionActions = transitionProductActionsForRecord(record, { surface: context, maxPrimary: 1, workspaceRecords, workspaceId });
  const isWorkspaceArtifact = isWorkspaceRecord(record);
  const workspaceActionModel = isWorkspaceArtifact ? workspaceArtifactActionModel(record) : null;
  const baseActions = presentRecordActions(record).filter((action) => action.enabled !== false && action.id !== RecordActionKind.reference && action.id !== RecordActionKind.continue);
  const contextualActions = lineageContext
    ? [{ id: RecordActionKind.lineage, label: 'Anchor', icon: 'lineage', enabled: true }, ...baseActions]
    : baseActions.filter((action) => action.id !== RecordActionKind.lineage);
  const actions = appendTransitionActionsToStaticRow(contextualActions, transitionActions);
  const dateBadge = compactRecordDate(record);
  const schemaBadge = recordSchemaBadge(record);
  const schemaOpenable = recordSchemaCanOpen(record);
  const sourceBadge = recordSourceBadge(record);
  const primaryClick = () => {
    if (lineageContext) return onToggleExpanded?.(record.id);
    return onFocusRecordLineage?.(record.id);
  };
  const onKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); primaryClick(); }
  };
  return (
    <article className={`tx-artifact-card tx-record-card tx-old-like-record-card tx-clickable-record-card ${isWorkspaceArtifact ? 'tx-workspace-artifact-record-card' : ''} ${lineageContext ? 'tx-lineage-as-record-card' : ''} ${expanded ? 'tx-record-card-expanded' : ''}`} role="button" tabIndex="0" aria-expanded={lineageContext ? expanded : undefined} aria-label={`${lineageContext ? 'Toggle read preview for' : 'Focus lineage for'} ${record.title || 'artifact'}`} onClick={primaryClick} onKeyDown={onKey} data-workspace-artifact-action-model={workspaceActionModel?.schema || undefined}>
      <div className="tx-card-badges tx-legacy-card-badges">
        {isWorkspaceArtifact ? <Badge>workspace</Badge> : null}
        {isWorkspaceArtifact ? <Badge>{workspaceActionModel.roleLabel}</Badge> : null}
        {isWorkspaceArtifact ? <Badge>{workspaceArtifactBoundaryBadge(record)}</Badge> : null}
        <AuditStatusBadge record={record} item={auditItem} />
        {recordLifecycleBadge(record) ? <Badge title="Lifecycle/publication state">{recordLifecycleBadge(record)}</Badge> : null}
        {schemaOpenable ? <button type="button" className="tx-badge tx-badge-default tx-schema-nav-badge" title={`Open reading contract schema lineage for ${schemaBadge}`} aria-label={`Open reading contract schema lineage for ${schemaBadge}`} onClick={(event) => { event.stopPropagation(); onOpenSchema?.(record); }}>{schemaBadge}</button> : <Badge>{schemaBadge}</Badge>}
        {dateBadge ? <Badge>{dateBadge}</Badge> : null}
        <Badge>{sourceBadge}</Badge>
        {recordMaterialBadge(record) ? <Badge title={record.materialReconciliation?.message || 'Material reconciliation'}>{recordMaterialBadge(record)}</Badge> : null}
      </div>
      <h3>{record.title || 'Untitled'}</h3>
      <p>{record.summary || 'No summary available yet.'}</p>
      {displayPath ? <div className="tx-card-pathline" title={displayPath}><Icon name="folderOpen" />{compactPath(displayPath)}</div> : null}
      {lineageContext && expanded ? (
        <div className="tx-record-card-read-preview" onClick={(event) => event.stopPropagation()}>
          <SchemaReadView record={record} compact maxSections={2} showHeader={false} lineClamp />
        </div>
      ) : null}
      <footer className="tx-legacy-action-row tx-artifact-actions" aria-label="Artifact actions" onClick={(event) => event.stopPropagation()}>
        {actions.map((action) => <RecordActionButton key={action.id} action={action} record={record} workspaceActionModel={workspaceActionModel} onOpenRecord={onOpenRecord} onFocusRecordLineage={onFocusRecordLineage} onShareRecord={onShareRecord} onRecordAction={onRecordAction} />)}
      </footer>
    </article>
  );
}



export const MemoRecordCard = React.memo(RecordCard, recordCardPropsEqual);




export function assetCardPropsEqual(previous = {}, next = {}) {
  return previous.asset === next.asset
    && previous.actionStateKey === next.actionStateKey
    && Boolean(previous.onOpenAsset) === Boolean(next.onOpenAsset);
}

export function recordCardPropsEqual(previous = {}, next = {}) {
  return previous.record === next.record
    && previous.auditItem === next.auditItem
    && previous.context === next.context
    && previous.expanded === next.expanded
    && previous.actionStateKey === next.actionStateKey
    && previous.workspaceRecords === next.workspaceRecords
    && previous.workspaceId === next.workspaceId
    && Boolean(previous.onOpenRecord) === Boolean(next.onOpenRecord)
    && Boolean(previous.onFocusRecordLineage) === Boolean(next.onFocusRecordLineage)
    && Boolean(previous.onShareRecord) === Boolean(next.onShareRecord)
    && Boolean(previous.onRecordAction) === Boolean(next.onRecordAction)
    && Boolean(previous.onOpenSchema) === Boolean(next.onOpenSchema);
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
