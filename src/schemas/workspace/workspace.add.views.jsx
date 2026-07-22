import React, { useRef, useState } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { TiinexAdapterRegistry } from '../../adapters/registry.js';
import { collectLocalFilesFromDataTransfer } from '../../adapters/local/local.adapter.js';

export function AddToWorkspaceDialog({ workspace, workspaceConfig, sourceContinuation = null, onDismiss, onAddFiles, onAddGitHubSource, onAddUrls, githubBusy = false }) {
  const [mode, setMode] = useState(sourceContinuation ? 'git' : '');
  const [stagedFiles, setStagedFiles] = useState([]);
  const title = `Add to ${workspace.title || workspace.name || 'workspace'}`;
  const modalClass = mode ? 'tx-add-flow-modal tx-add-mode-modal' : 'tx-add-flow-modal';

  return (
    <Modal title={modeTitle(mode, title)} onDismiss={onDismiss} className={modalClass}>
      {!mode ? (
        <AddChoiceGrid onMode={setMode} onAddFiles={onAddFiles} title={title} />
      ) : null}
      {mode === 'git' ? (
        <GitHubSourceForm sourceContinuation={sourceContinuation} onBack={() => sourceContinuation ? onDismiss?.() : setMode('')} onSubmit={onAddGitHubSource} busy={githubBusy} />
      ) : null}
      {mode === 'urls' ? (
        <ExplicitUrlsForm onBack={() => setMode('')} onSubmit={onAddUrls} />
      ) : null}
      {mode === 'drop' ? (
        <DropMode stagedFiles={stagedFiles} setStagedFiles={setStagedFiles} onBack={() => setMode('')} onSubmit={() => onAddFiles(stagedFiles, { sourceMode: 'drop' })} />
      ) : null}
    </Modal>
  );
}

function AddChoiceGrid({ onMode, onAddFiles, title }) {
  const hasGithub = Boolean(TiinexAdapterRegistry.forSourceKind('github.repo'));
  const hasLocal = Boolean(TiinexAdapterRegistry.forSourceKind('local.files'));
  return (
    <div className="tx-add-flow" data-flow="old-like-add-menu">
      <div className="tx-add-choice-grid">
        {hasLocal ? <label className="tx-add-choice-card tx-add-choice-file">
          <span className="tx-add-choice-icon"><Icon name="manualFiles" /></span>
          <span className="tx-add-choice-copy"><strong>Manual files</strong><small>Markdown / zip</small></span>
          <Icon name="upload" />
          <input className="tx-visually-hidden-file" type="file" multiple accept=".md,.markdown,.trace.md,.schema.md,.validator.md,.workspace.md,.zip" onChange={(event) => onAddFiles(event.target.files, { sourceMode: 'manual-files' })} />
        </label> : null}
        <label className="tx-add-choice-card tx-add-choice-folder">
          <span className="tx-add-choice-icon"><Icon name="folderOpen" /></span>
          <span className="tx-add-choice-copy"><strong>Manual folder</strong><small>Folder / zip paths</small></span>
          <Icon name="folderPlus" />
          <input className="tx-visually-hidden-file" type="file" multiple webkitdirectory="" directory="" onChange={(event) => onAddFiles(event.target.files, { sourceMode: 'manual-folder' })} />
        </label>
        {hasGithub ? <button type="button" className="tx-add-choice-card" onClick={() => onMode('git')}>
          <span className="tx-add-choice-icon"><Icon name="github" /></span>
          <span className="tx-add-choice-copy"><strong>GitHub source</strong><small>Repo boundary</small></span>
          <Icon name="source" />
        </button> : null}
        <button type="button" className="tx-add-choice-card" onClick={() => onMode('urls')}>
          <span className="tx-add-choice-icon"><Icon name="source" /></span>
          <span className="tx-add-choice-copy"><strong>Explicit URLs</strong><small>Raw / blob URLs</small></span>
          <Icon name="source" />
        </button>
        <button type="button" className="tx-add-choice-card tx-desktop-only-choice" onClick={() => onMode('drop')}>
          <span className="tx-add-choice-icon"><Icon name="handPointer" /></span>
          <span className="tx-add-choice-copy"><strong>Drag and drop</strong><small>Files, folders, zip</small></span>
          <Icon name="drop" />
        </button>
      </div>
    </div>
  );
}

function GitHubSourceForm({ sourceContinuation = null, onBack, onSubmit, busy = false }) {
  const continuation = sourceContinuation || null;
  const [repository, setRepository] = useState(continuation?.repo || continuation?.config?.repo || '');
  const [ref, setRef] = useState(continuation?.ref || continuation?.config?.ref || '');
  const [rootPath, setRootPath] = useState(continuation?.rootPath || continuation?.config?.rootPath || '.topics');
  const [operation, setOperation] = useState(continuation ? 'repo' : 'register');
  const [issueUrls, setIssueUrls] = useState('');
  const [fileRefs, setFileRefs] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const cleanRepo = String(repository || '').trim();
    const explicitRefs = String(fileRefs || '').trim();
    const explicitIssues = String(issueUrls || '').trim();
    if (!cleanRepo) {
      setError('Repo URL or owner/name is required.');
      return;
    }
    if (operation === 'explicit' && !explicitRefs) {
      setError('Add at least one Markdown path or raw/blob URL for explicit files.');
      return;
    }
    if (operation === 'issues' && !explicitIssues) {
      setError('Add at least one GitHub issue or discussion URL.');
      return;
    }
    onSubmit({
      repository,
      ref,
      rootPath,
      operation,
      repoDiscovery: operation === 'repo',
      issueDiscovery: operation === 'issues',
      issueUrls: operation === 'issues' ? issueUrls : '',
      label: repository,
      fileRefs: operation === 'explicit' ? fileRefs : '',
      sourceId: continuation?.id || ''
    });
  }

  const submitLabel = operation === 'register'
    ? 'Register source boundary'
    : operation === 'explicit'
      ? 'Load explicit files'
      : operation === 'issues'
        ? 'Load issue snapshots'
        : 'Discover repo Markdown';
  const sourceLabel = continuation?.label || repository || 'GitHub source';

  return (
    <form className="tx-add-source-form tx-github-source-form" onSubmit={submit} data-operation={operation}>
      {continuation ? (
        <div className="tx-source-continuation-banner" role="status">
          <Icon name="source" />
          <span><strong>Continue {sourceLabel}</strong><small>{continuation.count || 0} loaded · {continuation.discoveryState || 'deferred'} · no work runs until you choose a source operation.</small></span>
        </div>
      ) : null}
      <div className="tx-github-operation-surfaces" aria-label="GitHub source operations">
        <OperationCard id="register" active={operation === 'register'} onSelect={setOperation} title="Register boundary" detail="Add source identity only. No requests, no loading." />
        <OperationCard id="explicit" active={operation === 'explicit'} onSelect={setOperation} title="Explicit files" detail="Load listed Markdown paths or raw/blob URLs now." />
        <OperationCard id="repo" active={operation === 'repo'} onSelect={setOperation} title="Repo files discovery" detail="Discover bounded Markdown under the root paths." />
        <OperationCard id="issues" active={operation === 'issues'} onSelect={setOperation} title="Issue snapshots" detail="Parse explicit issue/discussion targets when available." />
      </div>
      <div className="tx-github-operation-receipt" role="status">
        <strong>{operationSummary(operation)}</strong>
        <small>{operationDetail(operation)}</small>
      </div>
      <div className="tx-github-source-field-grid">
        <TextField id="source-repo" label="Repo URL or owner/name" value={repository} onChange={setRepository} placeholder="Tiinex/docs" />
        <TextField id="source-ref" label="Ref optional" value={ref} onChange={setRef} placeholder="default branch" />
      </div>
      <label className="tx-textarea-field">
        <span>Explicit Markdown paths / URLs <small>{operation === 'explicit' ? 'required for this operation' : 'optional'}</small></span>
        <textarea value={fileRefs} onFocus={() => setOperation('explicit')} onChange={(event) => setFileRefs(event.target.value)} placeholder="One path or URL per line, e.g. .topics/foo.md or https://raw.githubusercontent.com/owner/repo/main/.topics/foo.md" />
      </label>
      <label className="tx-textarea-field">
        <span>Root paths</span>
        <textarea value={rootPath} onChange={(event) => setRootPath(event.target.value)} placeholder=".topics&#10;.github/agents/.topics" />
      </label>
      <label className="tx-textarea-field">
        <span>Issue / Discussion URLs <small>{operation === 'issues' ? 'required for this operation' : 'optional'}</small></span>
        <textarea value={issueUrls} onFocus={() => setOperation('issues')} onChange={(event) => setIssueUrls(event.target.value)} placeholder="https://github.com/Tiinex/docs/issues/123&#10;https://github.com/Tiinex/docs/discussions/123" />
      </label>
      <div className="tx-transport-contract-panel" aria-label="Transport contract">
        <span><strong>Transport</strong><small>direct public GitHub API/raw · no hidden mirror/proxy claim</small></span>
        <span><strong>Result</strong><small>{operation === 'register' ? 'source boundary only' : 'accepted/loading receipt, then loaded/skipped/failed summary'}</small></span>
      </div>
      {error ? <p className="tx-form-error" role="alert">{error}</p> : null}
      <div className="tx-dialog-actions">
        <Button type="button" variant="ghost" icon="previous" onClick={onBack}>Back</Button>
        <Button type="submit" variant="primary" icon="github" disabled={busy}>{busy ? 'GitHub operation running…' : submitLabel}</Button>
      </div>
    </form>
  );
}

function OperationCard({ id, title, detail, active, onSelect }) {
  return (
    <button type="button" className={`tx-github-operation-card ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={() => onSelect(id)}>
      <strong>{title}</strong>
      <small>{detail}</small>
    </button>
  );
}

function operationSummary(operation) {
  if (operation === 'explicit') return 'Operation selected: load explicit files';
  if (operation === 'repo') return 'Operation selected: repo files discovery';
  if (operation === 'issues') return 'Operation selected: issue snapshots';
  return 'Operation selected: register boundary only';
}

function operationDetail(operation) {
  if (operation === 'explicit') return 'The source is registered and listed file targets are materialized immediately.';
  if (operation === 'repo') return 'The source is registered, then bounded repo Markdown discovery starts with visible progress.';
  if (operation === 'issues') return 'The source is registered, then explicit issue/discussion targets are handled by the source reader.';
  return 'No source material is read and no loading is running after submit.';
}


function ExplicitUrlsForm({ onBack, onSubmit }) {
  const [urls, setUrls] = useState('');
  function submit(event) {
    event.preventDefault();
    onSubmit(urls);
  }
  return (
    <form className="tx-add-source-form" onSubmit={submit}>
      <label className="tx-textarea-field">
        <span>URLs</span>
        <textarea value={urls} onChange={(event) => setUrls(event.target.value)} placeholder="https://github.com/Tiinex/docs/blob/master/.topics/.../001.trace.md&#10;https://raw.githubusercontent.com/Tiinex/docs/master/.topics/.../001.trace.md" />
      </label>
      <div className="tx-dialog-actions">
        <Button type="button" variant="ghost" icon="previous" onClick={onBack}>Back</Button>
        <Button type="submit" variant="primary" icon="source">Add URLs</Button>
      </div>
    </form>
  );
}

function DropMode({ stagedFiles, setStagedFiles, onBack, onSubmit }) {
  const inputRef = useRef(null);
  const count = stagedFiles.length;
  const handleFiles = (files) => setStagedFiles(Array.from(files || []));
  async function handleDataTransfer(dataTransfer) {
    const files = await collectLocalFilesFromDataTransfer(dataTransfer);
    setStagedFiles(files);
  }
  return (
    <div className="tx-add-source-form">
      <div
        className="tx-source-dropzone tx-add-full-dropzone"
        tabIndex="0"
        role="button"
        aria-label="Drop Markdown, folders, or zip archives here"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleDataTransfer(event.dataTransfer);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="tx-source-drop-icon"><Icon name="drop" /></div>
        <div>
          <strong>Drop folder, trace files, or markdown</strong>
          <small>{count ? `${count} file${count === 1 ? '' : 's'} staged` : 'No files staged yet.'}</small>
        </div>
      </div>
      <input ref={inputRef} className="tx-visually-hidden-file" type="file" multiple webkitdirectory="" directory="" accept=".md,.markdown,.trace.md,.schema.md,.validator.md,.workspace.md,.zip" onChange={(event) => handleFiles(event.target.files)} />
      <div className="tx-dialog-actions">
        <Button type="button" variant="ghost" icon="previous" onClick={onBack}>Back</Button>
        <Button type="button" variant="ghost" icon="manualFiles" onClick={() => inputRef.current?.click()}>Choose files</Button>
        <Button type="button" variant="primary" icon="fileUpload" onClick={onSubmit} disabled={!count}>Add staged material</Button>
      </div>
    </div>
  );
}

function modeTitle(mode, title) {
  if (mode === 'git') return 'GitHub source';
  if (mode === 'urls') return 'Explicit URLs';
  if (mode === 'drop') return 'Drag and drop';
  return title;
}

