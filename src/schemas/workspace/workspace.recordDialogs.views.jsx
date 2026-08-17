import React, { useEffect, useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { createRecordActionResult, RecordActionKind } from '../../actions/record.actions.js';
import { createReferenceDraft } from '../../transitions/record.transitions.js';
import { isTransitionAction } from '../../transitions/transition.presentation.js';
import { isCanonicalTransitionProductAction } from '../../transitions/transition.productPresentation.js';
import { ContinuationDialog, TransitionValidationNotice } from './workspace.continuationDialog.views.jsx';
import { CanonicalTaskCreateDialog } from './workspace.canonicalTaskDialog.views.jsx';
import { SchemaReadView } from './workspace.read.views.jsx';
import { recordDisplayPath, recordLifecycleBadge, recordSchemaBadge } from './workspace.viewFormatting.js';


export function RecordDetailDialog({ record, onDismiss, onShare }) {
  const source = record?.source || {};
  const displayPath = recordDisplayPath(record || {});
  const isSourceBacked = Boolean(source.adapterId && source.adapterId !== 'local');
  return (
    <Modal title={record?.title || 'Artifact'} onDismiss={onDismiss} className="tx-dialog-record-detail">
      <div className="tx-record-detail tx-record-read-detail">
        <div className="tx-card-badges">
          {recordLifecycleBadge(record) ? <Badge title="Lifecycle/publication state">{recordLifecycleBadge(record)}</Badge> : null}
          {record?.status ? <Badge title="Record status">{record.status}</Badge> : null}
          <Badge>{recordSchemaBadge(record)}</Badge>
          <Badge>{isSourceBacked ? 'source-backed' : 'local/session'}</Badge>
        </div>
        <DeferredSchemaReadView record={record} />
        <details className="tx-record-provenance-details">
          <summary>Provenance / envelope</summary>
          <dl className="tx-record-meta">
            <div><dt>Boundary</dt><dd>{isSourceBacked ? (source.boundary || 'Explicit source boundary') : 'Browser-local session material; no GitHub provenance inferred.'}</dd></div>
            {displayPath ? <div><dt>Path</dt><dd>{displayPath}</dd></div> : null}
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
        </details>
        {!record?.markdown ? <p className="tx-muted">{record?.materialAvailability === 'material-unavailable' ? 'Material is unavailable in this route/session shell; source boundary and path are preserved.' : 'No embedded Markdown body is available for this record.'}</p> : null}
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Close</Button>
          <Button variant="primary" icon="shareNodes" onClick={onShare}>Share artifact</Button>
        </div>
      </div>
    </Modal>
  );
}

function DeferredSchemaReadView({ record }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [record?.id]);
  if (!ready) {
    return (
      <section className="tx-schema-read-view tx-schema-read-deferred" aria-label="Artifact read view loading">
        <div className="tx-schema-read-skeleton"><strong>{record?.title || 'Artifact'}</strong><span>Opening read view…</span></div>
      </section>
    );
  }
  return <SchemaReadView record={record} />;
}

export function RecordMarkdownDialog({ record, onDismiss }) {
  return (
    <Modal title={`Markdown · ${record?.title || 'Artifact'}`} onDismiss={onDismiss} className="tx-dialog-record-markdown">
      <div className="tx-record-detail">
        <div className="tx-card-badges">
          <Badge>{record?.kind || 'artifact'}</Badge>
          <Badge>{recordDisplayPath(record || {}) || 'no path'}</Badge>
        </div>
        {record?.markdown ? <pre className="tx-record-markdown-preview tx-full-markdown-preview">{String(record.markdown)}</pre> : <p className="tx-muted">Markdown is not available in this route/session shell. Source boundary and path are preserved.</p>}
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

export function RecordActionDialog({ record, action, schemaRegistry, workspaceRecords = [], onDismiss, onShare, onCreateTransition, onCreateCanonicalTransition }) {
  const actionId = action?.id || action;
  if (isCanonicalTransitionProductAction(action)) {
    return <CanonicalTaskCreateDialog record={record} action={action} onDismiss={onDismiss} onCreate={onCreateCanonicalTransition} />;
  }
  if (isTransitionAction(action)) {
    return <ContinuationDialog record={record} schemaRegistry={schemaRegistry} transitionDefinition={action.transitionDefinition} workspaceRecords={workspaceRecords} onDismiss={onDismiss} onCreateTransition={onCreateTransition} />;
  }
  if (actionId === RecordActionKind.continue) {
    return <ContinuationDialog record={record} schemaRegistry={schemaRegistry} workspaceRecords={workspaceRecords} onDismiss={onDismiss} onCreateTransition={onCreateTransition} />;
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
            <Button variant="ghost" icon="shareNodes" onClick={() => onShare?.(record)}>Share parent artifact</Button>
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
          <Button variant="primary" icon="shareNodes" onClick={() => onShare?.(record)}>Share artifact</Button>
        </div>
      </div>
    </Modal>
  );
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

export function RenameWorkspaceDialog({ workspace, onDismiss, onSubmit }) {
  const [name, setName] = useState(workspace?.title || workspace?.name || '');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const ok = onSubmit?.(name);
    if (ok === false) setError('Workspace name is required.');
  }
  return (
    <Modal title="Rename workspace" onDismiss={onDismiss} initialFocus="workspaceRenameName">
      <form className="tx-form" onSubmit={submit} data-form="rename-workspace-form">
        <TextField id="workspaceRenameName" label="Workspace name" value={name} onChange={setName} required error={error} autoFocus />
        <p className="tx-muted">Renaming changes the local workspace label only. Source boundaries and loaded material stay untouched.</p>
        <div className="tx-dialog-actions">
          <Button type="button" variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button type="submit" variant="primary" icon="edit">Save name</Button>
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
