import React, { useRef, useState } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { TiinexAdapterRegistry } from '../../adapters/registry.js';
import { collectLocalFilesFromDataTransfer } from '../../adapters/local/local.adapter.js';
import { importConflictSummary } from '../../workspaces/workspace.importConflicts.js';

export function AddToWorkspaceDialog({ workspace, sourceContinuation = null, onDismiss, onAddFiles, onAddPastedTrace, onAddGitHubSource, onAddUrls, githubBusy = false }) {
  const githubContinuation = isGitHubSourceContinuation(sourceContinuation) ? sourceContinuation : null;
  const [mode, setMode] = useState(githubContinuation ? 'git' : '');
  const [stagedFiles, setStagedFiles] = useState([]);
  const title = `Add to ${workspace.title || workspace.name || 'workspace'}`;
  const modalClass = mode ? 'tx-add-flow-modal tx-add-mode-modal' : 'tx-add-flow-modal';

  return (
    <Modal title={modeTitle(mode, title)} onDismiss={onDismiss} className={modalClass}>
      {!mode ? (
        <AddChoiceGrid onMode={setMode} onAddFiles={onAddFiles} title={title} />
      ) : null}
      {mode === 'git' ? (
        <GitHubSourceForm sourceContinuation={githubContinuation} onBack={() => githubContinuation ? onDismiss?.() : setMode('')} onSubmit={onAddGitHubSource} busy={githubBusy} />
      ) : null}
      {mode === 'urls' ? (
        <ExplicitUrlsForm onBack={() => setMode('')} onSubmit={onAddUrls} />
      ) : null}
      {mode === 'drop' ? (
        <DropMode stagedFiles={stagedFiles} setStagedFiles={setStagedFiles} onBack={() => setMode('')} onSubmit={() => onAddFiles(stagedFiles, { sourceMode: 'drop' })} />
      ) : null}
      {mode === 'paste-trace' ? (
        <PasteTraceForm onBack={() => setMode('')} onSubmit={onAddPastedTrace} />
      ) : null}
    </Modal>
  );
}


function isGitHubSourceContinuation(source = null) {
  if (!source || source.id === 'local' || source.recoveryOnly === true || source.originReferenceSource === true) return false;
  const kind = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
  return kind.includes('github') && source.loadable !== false;
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
      <details className="tx-add-advanced-imports">
        <summary>Advanced imports</summary>
        <div className="tx-add-choice-grid tx-add-choice-grid-secondary">
          <button type="button" className="tx-add-choice-card" onClick={() => onMode('paste-trace')}>
            <span className="tx-add-choice-icon"><Icon name="markdown" /></span>
            <span className="tx-add-choice-copy"><strong>Paste trace</strong><small>Paste existing trace Markdown</small></span>
            <Icon name="continue" />
          </button>
        </div>
      </details>
    </div>
  );
}

function GitHubSourceForm({ sourceContinuation = null, onBack, onSubmit, busy = false }) {
  const continuation = sourceContinuation || null;
  const [repository, setRepository] = useState(continuation?.repo || continuation?.config?.repo || '');
  const [ref, setRef] = useState(continuation?.ref || continuation?.config?.ref || '');
  const [rootPath, setRootPath] = useState(continuation?.rootPath || continuation?.config?.rootPath || '.topics');
  const repoRequested = Boolean(continuation?.repoDiscovery);
  const issueRequested = Boolean(continuation?.issueDiscovery);
  // Broad discovery is a user-owned source setting. Requested/loaded issue surfaces may also come from explicit targets and must not re-enable it.
  const [repoDiscovery, setRepoDiscovery] = useState(continuation ? repoRequested : true);
  const [issueDiscovery, setIssueDiscovery] = useState(continuation ? issueRequested : false);
  const [issueUrls, setIssueUrls] = useState(continuation?.issueUrls || continuation?.config?.issueUrls || '');
  const [fileRefs, setFileRefs] = useState(() => (Array.isArray(continuation?.explicitFileRefs || continuation?.config?.explicitFileRefs) ? Array.from(continuation?.explicitFileRefs || continuation?.config?.explicitFileRefs).join('\n') : String(continuation?.explicitFileRefs || continuation?.config?.explicitFileRefs || '')));
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
      setError('Choose at least one discovery surface, add explicit paths, or use Save source.');
      return;
    }
    onSubmit({
      repository,
      ref,
      rootPath,
      operation: registerOnly ? 'register' : 'materialize',
      repoDiscovery: Boolean(repoDiscovery),
      issueDiscovery: Boolean(issueDiscovery),
      issueUrls,
      label: repository,
      explicitFileRefs: fileRefs,
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
    issueDiscovery ? 'public issues' : '',
    explicitIssues ? 'specific issue targets' : ''
  ].filter(Boolean);
  const primaryLabel = activeSurfaces.length === 0
    ? 'Choose material to load'
    : activeSurfaces.length === 1 && activeSurfaces[0] === 'repo files'
      ? (continuation ? 'Reload repo Markdown' : 'Discover repo Markdown')
      : `${continuation ? 'Reload' : 'Load'} material`;
  const sourceLabel = continuation?.label || repository || 'GitHub source';
  const backLabel = continuation ? 'Cancel' : 'Back';
  const saveLabel = 'Save source';

  return (
    <form className="tx-add-source-form tx-github-source-form tx-github-source-plan-form" onSubmit={submit} data-operation={continuation ? "source-edit" : "source-plan"}>
      {continuation ? (
        <div className="tx-source-continuation-banner" role="status">
          <Icon name="source" />
          <span><strong>Continue {sourceLabel}</strong><small>{continuation.count || 0} loaded · {sourceContinuationSummary(continuation)}</small></span>
        </div>
      ) : null}
      <p className="tx-github-source-intro">Read-only GitHub source. Saving the source and loading material are separate.</p>
      <div className="tx-github-source-field-grid">
        <TextField id="source-repo" label="Repository" value={repository} onChange={setRepository} placeholder="Tiinex/docs" />
        <TextField id="source-ref" label="Ref" value={ref} onChange={setRef} placeholder="default branch" />
      </div>
      <label className="tx-textarea-field">
        <span>Root paths</span>
        <textarea value={rootPath} onChange={(event) => setRootPath(event.target.value)} placeholder=".topics&#10;.github/agents/.topics" />
      </label>
      <fieldset className="tx-github-discovery-surfaces" aria-label="Discover broadly">
        <legend>Discover broadly</legend>
        <label className={`tx-github-discovery-card ${repoDiscovery ? 'is-active' : ''}`}>
          <input type="checkbox" checked={repoDiscovery} onChange={(event) => setRepoDiscovery(event.target.checked)} />
          <span><strong>Repo Markdown under root paths</strong><small>Discover bounded Markdown material under the configured roots.</small></span>
        </label>
        <label className={`tx-github-discovery-card ${issueDiscovery ? 'is-active' : ''}`}>
          <input type="checkbox" checked={issueDiscovery} onChange={(event) => setIssueDiscovery(event.target.checked)} />
          <span><strong>Public issues</strong><small>Discover a bounded set of public issues. Specific targets below are independent and always included.</small></span>
        </label>
      </fieldset>
      <label className="tx-textarea-field">
        <span>Include specific targets · Markdown paths / URLs <small>optional; always included</small></span>
        <textarea value={fileRefs} onChange={(event) => setFileRefs(event.target.value)} placeholder="One path or URL per line, e.g. .topics/foo.md or https://raw.githubusercontent.com/owner/repo/main/.topics/foo.md" />
      </label>
      <label className="tx-textarea-field">
        <span>Issue / Discussion URLs <small>optional; exact targets are included independently of broad discovery</small></span>
        <textarea value={issueUrls} onChange={(event) => setIssueUrls(event.target.value)} placeholder="https://github.com/Tiinex/docs/issues/123&#10;https://github.com/Tiinex/docs/discussions/123" />
      </label>
      <details className="tx-github-technical-details">
        <summary>Technical details</summary>
        <p>Transport tries available cache, mirror, proxy, then direct tiers. Operation results are shown after loading.</p>
      </details>
      {error ? <p className="tx-form-error" role="alert">{error}</p> : null}
      <div className="tx-dialog-actions tx-github-dialog-actions">
        <Button type="button" variant="ghost" icon="previous" onClick={onBack}>{backLabel}</Button>
        <Button type="button" variant={continuation ? 'primary' : 'ghost'} icon="source" disabled={busy} onClick={() => send('register')}>{saveLabel}</Button>
        <Button type="submit" variant={continuation ? 'ghost' : 'primary'} icon="github" disabled={busy || activeSurfaces.length === 0}>{busy ? 'GitHub operation running…' : primaryLabel}</Button>
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



export function ImportConflictDialog({ conflicts = [], onResolve, onDismiss }) {
  const examples = conflicts.slice(0, 5);
  return (
    <Modal title="Incoming material overlaps this workspace" onDismiss={onDismiss} className="tx-import-conflict-modal">
      <div className="tx-import-conflict-copy">
        <p>{importConflictSummary(conflicts)}</p>
        <p><strong>.trace.md conflicts use lineage slot numbers.</strong> Different slugs in the same numbered slot still conflict.</p>
        {examples.length ? <ul>{examples.map((item, index) => <li key={`${item.type}:${item.incoming}:${index}`}><strong>{item.type === 'trace-slot' ? 'Same lineage slot' : 'Same file path'}</strong><br /><span>{item.incoming} → {item.existing}</span></li>)}</ul> : null}
      </div>
      <div className="tx-dialog-actions">
        <Button variant="primary" onClick={() => onResolve?.('sibling')}>Import as sibling</Button>
        <Button onClick={() => onResolve?.('replace')}>Replace existing</Button>
        <Button variant="subtle" onClick={onDismiss}>Cancel import</Button>
      </div>
    </Modal>
  );
}

function PasteTraceForm({ onBack, onSubmit }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    if (!String(text || '').trim()) { setError('Paste trace Markdown first.'); return; }
    const ok = onSubmit?.(text);
    if (ok === false) setError('Clipboard text does not look like Tiinex trace Markdown.');
  }
  return (
    <form className="tx-add-source-form tx-paste-trace-form" onSubmit={submit}>
      <p className="tx-boundary-note">Paste an existing Tiinex trace. It stays local/session material until explicitly published.</p>
      <label><span>Trace Markdown</span><textarea rows="14" value={text} onChange={(event) => setText(event.target.value)} placeholder="# Continuity Context
..." /></label>
      {error ? <p role="alert" className="tx-field-error">{error}</p> : null}
      <div className="tx-dialog-actions"><Button onClick={onBack}>Back</Button><Button variant="primary" type="submit">Add trace</Button></div>
    </form>
  );
}
