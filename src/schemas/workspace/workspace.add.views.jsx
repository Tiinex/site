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
  const rememberedSurfaces = continuation?.surfaces || continuation?.requestedSurfaces || {};
  const rememberedIssue = continuation?.surfaces?.issueSnapshots || continuation?.requestedSurfaces?.issueSnapshots || {};
  const rememberedRepo = continuation?.surfaces?.repoFiles || continuation?.requestedSurfaces?.repoFiles || {};
  const [repoDiscovery, setRepoDiscovery] = useState(continuation ? Boolean(rememberedRepo.requested && rememberedRepo.loaded !== rememberedRepo.discovered) : true);
  const [issueDiscovery, setIssueDiscovery] = useState(continuation ? Boolean(continuation.issueDiscovery || rememberedIssue.requested || rememberedIssue.deferred || rememberedIssue.unavailable) : false);
  const [issueUrls, setIssueUrls] = useState(continuation?.issueUrls || continuation?.config?.issueUrls || '');
  const [fileRefs, setFileRefs] = useState('');
  const [error, setError] = useState('');

  function send(intent = 'load') {
    if (busy) return;
    setError('');
    const cleanRepo = String(repository || '').trim();
    const explicitRefs = String(fileRefs || '').trim();
    const explicitIssues = String(issueUrls || '').trim();
    if (!cleanRepo) {
      setError('Repo URL or owner/name is required.');
      return;
    }
    const registerOnly = intent === 'register';
    const shouldLoadIssues = !registerOnly && (issueDiscovery || Boolean(explicitIssues));
    const wantsLoad = !registerOnly && (repoDiscovery || Boolean(explicitRefs) || shouldLoadIssues);
    if (!registerOnly && !wantsLoad) {
      setError('Choose at least one discovery surface, add explicit paths, or use Register only.');
      return;
    }
    onSubmit({
      repository,
      ref,
      rootPath,
      operation: registerOnly ? 'register' : 'materialize',
      repoDiscovery: wantsLoad && repoDiscovery,
      issueDiscovery: shouldLoadIssues,
      issueUrls: shouldLoadIssues ? issueUrls : '',
      label: repository,
      fileRefs: wantsLoad ? fileRefs : '',
      sourceId: continuation?.id || ''
    });
  }

  function submit(event) {
    event.preventDefault();
    send('load');
  }

  const explicitRefs = String(fileRefs || '').trim();
  const explicitIssues = String(issueUrls || '').trim();
  const activeSurfaces = [
    repoDiscovery ? 'repo files' : '',
    explicitRefs ? 'explicit paths' : '',
    issueDiscovery || explicitIssues ? 'issue snapshots' : ''
  ].filter(Boolean);
  const primaryLabel = activeSurfaces.length === 0
    ? 'Choose material to load'
    : activeSurfaces.length === 1 && activeSurfaces[0] === 'repo files'
      ? 'Discover repo Markdown'
      : `Load ${activeSurfaces.length} selected surface${activeSurfaces.length === 1 ? '' : 's'}`;
  const sourceLabel = continuation?.label || repository || 'GitHub source';

  return (
    <form className="tx-add-source-form tx-github-source-form tx-github-source-plan-form" onSubmit={submit} data-operation="source-plan">
      {continuation ? (
        <div className="tx-source-continuation-banner" role="status">
          <Icon name="source" />
          <span><strong>Continue {sourceLabel}</strong><small>{continuation.count || 0} loaded · {sourceContinuationSummary(continuation)}</small></span>
        </div>
      ) : null}
      <section className="tx-github-boundary-panel" aria-label="GitHub source boundary">
        <strong>Source boundary</strong>
        <small>Registering the boundary is separate from reading material. No GitHub request runs until you submit a loading action.</small>
      </section>
      <div className="tx-github-source-field-grid">
        <TextField id="source-repo" label="Repo URL or owner/name" value={repository} onChange={setRepository} placeholder="Tiinex/docs" />
        <TextField id="source-ref" label="Ref optional" value={ref} onChange={setRef} placeholder="default branch" />
      </div>
      <label className="tx-textarea-field">
        <span>Root paths</span>
        <textarea value={rootPath} onChange={(event) => setRootPath(event.target.value)} placeholder=".topics&#10;.github/agents/.topics" />
      </label>
      <fieldset className="tx-github-discovery-surfaces" aria-label="Discovery surfaces">
        <legend>Discovery surfaces</legend>
        <label className={`tx-github-discovery-card ${repoDiscovery ? 'is-active' : ''}`}>
          <input type="checkbox" checked={repoDiscovery} onChange={(event) => setRepoDiscovery(event.target.checked)} />
          <span><strong>Repo files discovery</strong><small>Read bounded Markdown artifacts from the repo tree under the selected root paths.</small></span>
        </label>
        <label className={`tx-github-discovery-card ${issueDiscovery ? 'is-active' : ''}`}>
          <input type="checkbox" checked={issueDiscovery} onChange={(event) => setIssueDiscovery(event.target.checked)} />
          <span><strong>Issue snapshot discovery</strong><small>Use explicit issue/discussion targets as read-only source snapshots.</small></span>
        </label>
      </fieldset>
      <label className="tx-textarea-field">
        <span>Explicit Markdown paths / URLs <small>optional additional targets</small></span>
        <textarea value={fileRefs} onChange={(event) => setFileRefs(event.target.value)} placeholder="One path or URL per line, e.g. .topics/foo.md or https://raw.githubusercontent.com/owner/repo/main/.topics/foo.md" />
      </label>
      <label className="tx-textarea-field">
        <span>Issue / Discussion URLs <small>{issueDiscovery ? 'used by issue snapshot discovery' : 'optional; entering URLs enables issue snapshots'}</small></span>
        <textarea value={issueUrls} onFocus={() => setIssueDiscovery(true)} onChange={(event) => { setIssueUrls(event.target.value); if (event.target.value.trim()) setIssueDiscovery(true); }} placeholder="https://github.com/Tiinex/docs/issues/123&#10;https://github.com/Tiinex/docs/discussions/123" />
      </label>
      <div className="tx-github-operation-receipt tx-github-selected-plan" role="status">
        <strong>{activeSurfaces.length ? `Selected: ${activeSurfaces.join(' + ')}` : 'Selected: register boundary only'}</strong>
        <small>{activeSurfaces.length ? 'Submit starts visible source materialization with progress and a loaded/skipped/failed receipt.' : 'Use Register only to create a source boundary with no loading running.'}</small>
      </div>
      <div className="tx-transport-contract-panel" aria-label="Transport contract">
        <span><strong>Transport</strong><small>cache → mirror → proxy → direct · only configured/available tiers are used</small></span>
        <span><strong>Result</strong><small>{activeSurfaces.length ? 'progress, transport tier, then loaded/skipped/failed summary' : 'source boundary only'}</small></span>
      </div>
      {error ? <p className="tx-form-error" role="alert">{error}</p> : null}
      <div className="tx-dialog-actions tx-github-dialog-actions">
        <Button type="button" variant="ghost" icon="previous" onClick={onBack}>Back</Button>
        <Button type="button" variant="ghost" icon="source" disabled={busy} onClick={() => send('register')}>Register only</Button>
        <Button type="submit" variant="primary" icon="github" disabled={busy || activeSurfaces.length === 0}>{busy ? 'GitHub operation running…' : primaryLabel}</Button>
      </div>
    </form>
  );
}



function sourceContinuationSummary(source = {}) {
  const surfaces = source.surfaces || source.requestedSurfaces || {};
  const repo = surfaces.repoFiles || {};
  const issues = surfaces.issueSnapshots || {};
  const parts = [];
  if (repo.requested) parts.push(Number(repo.loaded || 0) ? 'repo files loaded' : 'repo files requested');
  if (issues.requested) parts.push(Number(issues.loaded || 0) ? 'issues loaded' : issues.deferred || issues.unavailable ? 'issue snapshots deferred' : 'issue snapshots requested');
  if (!parts.length) parts.push(source.discoveryState || 'deferred');
  return `${parts.join(' · ')} · continue the existing source plan.`;
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

