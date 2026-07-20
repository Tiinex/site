import React, { useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { workspaceI18n } from './workspace.i18n.js';
import { presentWorkspaceFeed, presentWorkspaceTree } from './workspace.presenter.js';

export function WorkspaceColumnSurface({ workspace, state, onClose, onVerse, onQuery, onOpenAddDialog, onCloseSource }) {
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const query = state.view?.query || '';
  const verse = state.view?.workspaceVerse || 'feed';
  const records = (workspace.records || []).filter((record) => recordMatchesQuery(record, query));
  const presentation = verse === 'tree'
    ? presentWorkspaceTree(workspace, { verse, query })
    : presentWorkspaceFeed(workspace, { verse, query });
  return (
    <section className="tx-workspace-window tx-column-window tx-uc001-created-workspace tx-schema-workspace-surface tx-compact-column-window" aria-label="Tiinex workspace window" data-schema-id="tiinex.workspace.v1">
      <header className="tx-window-header tx-workspace-schema-header tx-compact-window-header">
        <div className="tx-window-title-block">
          <h1>{presentation.title}</h1>
          <span className="tx-window-kicker tx-local-workspace-kicker" title="Local/session workspace; source provenance is not inferred."><Icon name="workspace" /><span>local</span></span>
        </div>
        <div className="tx-window-actions tx-compact-window-actions" aria-label="Workspace actions">
          <span className="tx-stat-pill" title="Shown artifacts"><Icon name="manualFiles" />{records.length}</span>
          <span className="tx-stat-pill" title="Sources"><Icon name="source" />{sources.length}</span>
          <Button icon="add" variant="primary" shape="round" aria-label="Add to workspace" title="Add to workspace" onClick={onOpenAddDialog} />
          <Button icon="close" variant="ghost" shape="round" aria-label="Close workspace" title="Close workspace" onClick={onClose} />
        </div>
      </header>
      <SourceStrip workspace={workspace} boundary={presentation.sourceBoundary} onCloseSource={onCloseSource} />
      <WorkspaceDropHint workspace={workspace} />
      <ModeToolbar state={state} query={query} onVerse={onVerse} onQuery={onQuery} />
      <ProgressStrip workspace={workspace} />
      <section className="tx-primary-stage tx-column-primary-stage" aria-label="Column feed">
        {verse === 'tree' ? <WorkspaceTreeState workspace={workspace} records={records} /> : records.length ? records.map((record) => <RecordCard key={record.id} record={record} />) : <EmptyWorkspaceState />}
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
      {workspace.records?.length ? <span className="tx-source-boundary tx-compact-source-boundary">{workspace.records.length} loaded</span> : null}
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

function WorkspaceDropHint({ workspace }) {
  if ((workspace.records || []).length || workspace.discoveryProgress) return null;
  return <div className="tx-workspace-drop-hint">Drop lineage files, folders, or zips · or use +</div>;
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

function EmptyWorkspaceState() {
  return (
    <div className="tx-empty-node-state tx-compact-empty-node-state" role="status" aria-live="polite">
      <span>{workspaceI18n.emptyResult}</span>
    </div>
  );
}

function WorkspaceTreeState({ workspace, records }) {
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
        <div className="tx-tree-record-row" role="treeitem" key={record.id}>
          <span><Icon name="open" /> {record.title || 'Untitled'}</span>
          <Badge>{record.kind || 'artifact'}</Badge>
        </div>
      ))}
      {!records.length ? <p className="tx-tree-empty">No loaded artifacts yet. Source and workspace boundaries remain visible.</p> : null}
    </div>
  );
}

function RecordCard({ record }) {
  return (
    <article className="tx-artifact-card tx-record-card">
      <div className="tx-card-badges">
        <Badge>{record.status || 'local'}</Badge>
        <Badge>{record.kind || 'artifact'}</Badge>
        {record.path ? <Badge>{record.path}</Badge> : null}
      </div>
      <h3>{record.title || 'Untitled'}</h3>
      <p>{record.summary || 'Local session material.'}</p>
      <footer className="tx-artifact-actions">
        <Button icon="open" variant="ghost">Open</Button>
      </footer>
    </article>
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


function recordMatchesQuery(record, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return [record.title, record.summary, record.kind, record.status, record.path].some((value) => String(value || '').toLowerCase().includes(q));
}
