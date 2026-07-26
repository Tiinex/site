import React, { useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { createRecordActionResult, RecordActionKind } from '../../actions/record.actions.js';
import { createContinuationDraft, createReferenceDraft, listContinuationTargets } from '../../transitions/record.transitions.js';
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
        <SchemaReadView record={record} />
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
