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

export function WorkspaceColumnSurface({ workspace, state, onClose, onVerse, onQuery, onOpenAddDialog, onCloseSource, onDropFiles, onOpenRecord, onShareRecord, onRecordAction }) {
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const query = state.view?.query || '';
  const verse = state.view?.workspaceVerse || 'feed';
  const allRecords = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const records = allRecords.filter((record) => recordMatchesQuery(record, query));
  const hasMaterial = Boolean(allRecords.length || assets.length);
  const isFilteredEmpty = Boolean(hasMaterial && allRecords.length && !records.length);
  const presentation = verse === 'tree'
    ? presentWorkspaceTree(workspace, { verse, query })
    : presentWorkspaceFeed(workspace, { verse, query });
  return (
    <section className="tx-workspace-window tx-column-window tx-uc001-created-workspace tx-schema-workspace-surface tx-compact-column-window" aria-label="Tiinex workspace window" data-schema-id="tiinex.workspace.v1" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer) onDropFiles?.(event.dataTransfer, { sourceMode: 'workspace-drop', fromDataTransfer: true }); }}>
      <header className="tx-window-header tx-workspace-schema-header tx-compact-window-header">
        <div className="tx-window-title-block">
          <h1>{presentation.title}</h1>
          <span className="tx-window-kicker tx-local-workspace-kicker" title="Local/session workspace; source provenance is not inferred."><Icon name="workspace" /><span>local</span></span>
        </div>
        <div className="tx-window-actions tx-compact-window-actions" aria-label="Workspace actions">
          <span className="tx-stat-pill" title="Shown artifacts"><Icon name="manualFiles" />{records.length}</span>
          <span className="tx-stat-pill" title="Local assets"><Icon name="asset" />{(workspace.assets || []).length}</span>
          <span className="tx-stat-pill" title="Sources"><Icon name="source" />{sources.length}</span>
          <Button icon="add" variant="primary" shape="round" aria-label="Add to workspace" title="Add to workspace" onClick={onOpenAddDialog} />
          <Button icon="close" variant="ghost" shape="round" aria-label="Close workspace" title="Close workspace" onClick={onClose} />
        </div>
      </header>
      <SourceStrip workspace={workspace} boundary={presentation.sourceBoundary} onCloseSource={onCloseSource} />
      <WorkspaceDropHint workspace={workspace} hasMaterial={hasMaterial} />
      <ModeToolbar state={state} query={query} onVerse={onVerse} onQuery={onQuery} />
      <ProgressStrip workspace={workspace} />
      <section className="tx-primary-stage tx-column-primary-stage" aria-label="Column feed">
        {verse === 'tree' ? <WorkspaceTreeState workspace={workspace} records={records} onOpenRecord={onOpenRecord} /> : records.length ? records.map((record) => <RecordCard key={record.id} record={record} onOpenRecord={onOpenRecord} onShareRecord={onShareRecord} onRecordAction={onRecordAction} />) : <EmptyWorkspaceState filtered={isFilteredEmpty} hasMaterial={hasMaterial} query={query} />}
      </section>
    </section>
  );
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
      {(workspace.records?.length || workspace.assets?.length) ? <span className="tx-source-boundary tx-compact-source-boundary">{workspace.records?.length || 0} artifacts · {workspace.assets?.length || 0} assets</span> : null}
    </div>
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

function ModeToolbar({ state, query, onVerse, onQuery }) {
  const verse = state.view?.workspaceVerse || 'feed';
  return (
    <div className="tx-mode-strip tx-column-toolbar" aria-label="Mode controls">
      <strong className="tx-mode-name">DISCOVERY MODE</strong>
      <div className="tx-segment" aria-label="Workspace verse">
        <button type="button" className={verse === 'feed' ? 'tx-active' : ''} onClick={() => onVerse('feed')}>Feed</button>
        <button type="button" className={verse === 'tree' ? 'tx-active' : ''} onClick={() => onVerse('tree')}>Tree</button>
      </div>
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

function WorkspaceTreeState({ workspace, records, onOpenRecord }) {
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  return (
    <div className="tx-workspace-tree-state" role="tree" aria-label="Workspace source tree">
      <div className="tx-tree-root"><Icon name="tree" /> Root · {workspace.title || workspace.name}</div>
      {sources.map((source) => (
        <div className="tx-tree-source-row" role="treeitem" key={source.id || source.label}>
          <span><Icon name={source.kind === 'local' ? 'local' : 'source'} /> {source.label || 'Source'}</span>
          <Badge>{Number(source.count || 0)} artifacts</Badge>
        </div>
      ))}
      {records.map((record) => (
        <button type="button" className="tx-tree-record-row" role="treeitem" key={record.id} onClick={() => onOpenRecord?.(record.id)}>
          <span><Icon name="open" /> {record.title || 'Untitled'}</span>
          <Badge>{record.kind || 'artifact'}</Badge>
        </button>
      ))}
      {!records.length ? <p className="tx-tree-empty">No loaded artifacts yet. Source and workspace boundaries remain visible.</p> : null}
    </div>
  );
}

function RecordCard({ record, onOpenRecord, onShareRecord, onRecordAction }) {
  const actions = presentRecordActions(record).filter((action) => action.enabled !== false);
  return (
    <article className="tx-artifact-card tx-record-card">
      <div className="tx-card-badges">
        <Badge>{record.status || 'local'}</Badge>
        <Badge>{record.kind || 'artifact'}</Badge>
        {record.source?.adapterId ? <Badge>{record.source.adapterId}</Badge> : null}
        {record.path ? <Badge title={record.path}>{compactPath(record.path)}</Badge> : null}
      </div>
      <h3>{record.title || 'Untitled'}</h3>
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
        </dl>
        {record?.markdown ? <pre className="tx-record-markdown-preview">{String(record.markdown).slice(0, 2400)}</pre> : <p className="tx-muted">No embedded Markdown preview is available for this record.</p>}
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Close</Button>
          <Button variant="primary" icon="shareNodes" onClick={onShare}>Share</Button>
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
          <pre className="tx-record-markdown-preview">{draft.markdown}</pre>
          <div className="tx-dialog-actions">
            <Button variant="ghost" onClick={onDismiss}>Close</Button>
            <Button variant="ghost" icon="shareNodes" onClick={() => onShare?.(record)}>Share parent</Button>
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
          <Button variant="primary" icon="shareNodes" onClick={() => onShare?.(record)}>Share</Button>
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
        <div className="tx-dialog-actions">
          <Button variant="ghost" onClick={onDismiss}>Cancel</Button>
          <Button variant="primary" icon="continue" onClick={() => onCreateTransition?.(record, draft)}>Create local continuation</Button>
        </div>
      </div>
    </Modal>
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
