import React, { useRef, useState } from 'react';
import { Button } from '../../ui/primitives/Button.jsx';
import { TextField } from '../../ui/primitives/Field.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { TiinexAdapterRegistry } from '../../adapters/registry.js';
import { collectLocalFilesFromDataTransfer } from '../../adapters/local/local.adapter.js';

export function AddToWorkspaceDialog({ workspace, workspaceConfig, onDismiss, onAddFiles, onAddGitHubSource, onAddUrls }) {
  const [mode, setMode] = useState('');
  const [stagedFiles, setStagedFiles] = useState([]);
  const entrypoints = Array.isArray(workspaceConfig?.workspaceEntrypoints) ? workspaceConfig.workspaceEntrypoints : [];
  const defaultEntrypoint = entrypoints[0] || { name: 'Tiinex docs', repository: 'Tiinex/docs', ref: 'master', rootPath: '.topics', sourceKind: 'github-tree' };
  const title = `Add to ${workspace.title || workspace.name || 'workspace'}`;
  const modalClass = mode ? 'tx-add-flow-modal tx-add-mode-modal' : 'tx-add-flow-modal';

  return (
    <Modal title={modeTitle(mode, title)} onDismiss={onDismiss} className={modalClass}>
      {!mode ? (
        <AddChoiceGrid onMode={setMode} onAddFiles={onAddFiles} title={title} />
      ) : null}
      {mode === 'git' ? (
        <GitHubSourceForm defaultEntrypoint={defaultEntrypoint} entrypoints={entrypoints} onBack={() => setMode('')} onSubmit={onAddGitHubSource} />
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
          <span className="tx-add-choice-copy"><strong>Manual files</strong><small>Markdown / trace</small></span>
          <Icon name="upload" />
          <input className="tx-visually-hidden-file" type="file" multiple accept=".md,.markdown,.trace.md,.schema.md,.workspace.md" onChange={(event) => onAddFiles(event.target.files, { sourceMode: 'manual-files' })} />
        </label> : null}
        <label className="tx-add-choice-card tx-add-choice-folder">
          <span className="tx-add-choice-icon"><Icon name="folderOpen" /></span>
          <span className="tx-add-choice-copy"><strong>Manual folder</strong><small>Folder import</small></span>
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
          <span className="tx-add-choice-copy"><strong>Drag and drop</strong><small>Focused drop target</small></span>
          <Icon name="drop" />
        </button>
      </div>
    </div>
  );
}

function GitHubSourceForm({ defaultEntrypoint, entrypoints, onBack, onSubmit }) {
  const [repository, setRepository] = useState(defaultEntrypoint.repository || 'Tiinex/docs');
  const [ref, setRef] = useState(defaultEntrypoint.ref || 'master');
  const [rootPath, setRootPath] = useState(defaultEntrypoint.rootPath || '.topics');
  const [repoDiscovery, setRepoDiscovery] = useState(defaultEntrypoint.repoFilesDiscovery !== false);
  const [issueDiscovery, setIssueDiscovery] = useState(defaultEntrypoint.issueDiscovery !== false);
  const [issueUrls, setIssueUrls] = useState(defaultEntrypoint.issueUrl || '');
  const [fileRefs, setFileRefs] = useState('');

  function applyEntrypoint(event) {
    const entry = entrypoints.find((item) => (item.repository || item.name || '') === event.target.value);
    if (!entry) return;
    setRepository(entry.repository || repository);
    setRef(entry.ref || 'master');
    setRootPath(entry.rootPath || '.topics');
    setRepoDiscovery(entry.repoFilesDiscovery !== false);
    setIssueDiscovery(entry.issueDiscovery !== false);
    setIssueUrls(entry.issueUrl || '');
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({ repository, ref, rootPath, repoDiscovery, issueDiscovery, issueUrls, label: repository, fileRefs });
  }


  return (
    <form className="tx-add-source-form tx-github-source-form" onSubmit={submit}>
      {entrypoints.length ? (
        <label className="tx-select-field">
          <span>Start from</span>
          <select onChange={applyEntrypoint} defaultValue={defaultEntrypoint.repository || defaultEntrypoint.name || ''}>
            {entrypoints.map((entrypoint) => <option key={`${entrypoint.repository || entrypoint.name}-${entrypoint.rootPath || ''}`} value={entrypoint.repository || entrypoint.name}>{entrypoint.name || entrypoint.repository}</option>)}
          </select>
        </label>
      ) : null}
      <div className="tx-github-source-field-grid">
        <TextField id="source-repo" label="Repo URL or owner/name" value={repository} onChange={setRepository} placeholder="Tiinex/docs" />
        <TextField id="source-ref" label="Ref optional" value={ref} onChange={setRef} placeholder="default branch" />
      </div>
      <label className="tx-textarea-field">
        <span>Markdown file paths / URLs <small>optional</small></span>
        <textarea value={fileRefs} onChange={(event) => setFileRefs(event.target.value)} placeholder="One path or URL per line, e.g. .topics/foo.md or https://raw.githubusercontent.com/owner/repo/main/.topics/foo.md" />
        <small className="tx-field-hint">Explicit file paths or raw/blob URLs to load immediately. Optional — leave empty to register source only.</small>
      </label>
      <label className="tx-textarea-field">
        <span>Root path</span>
        <textarea value={rootPath} onChange={(event) => setRootPath(event.target.value)} placeholder=".topics&#10;.github/agents/.topics" />
      </label>
      <div className="tx-github-source-surface-grid">
        <label className="tx-display-option-row"><span><strong>Repo files</strong><small>repo tree</small></span><input type="checkbox" checked={repoDiscovery} onChange={(event) => setRepoDiscovery(event.target.checked)} /></label>
        <label className="tx-display-option-row"><span><strong>Issue snapshots</strong><small>public issues</small></span><input type="checkbox" checked={issueDiscovery} onChange={(event) => setIssueDiscovery(event.target.checked)} /></label>
      </div>
      <details className="tx-github-advanced-issues" open={Boolean(issueUrls)}>
        <summary>Issue / Discussion URLs <em>optional</em></summary>
        <textarea value={issueUrls} onChange={(event) => setIssueUrls(event.target.value)} placeholder="https://github.com/Tiinex/docs/issues/123&#10;https://github.com/Tiinex/docs/discussions/123" />
      </details>
      <div className="tx-dialog-actions">
        <Button type="button" variant="ghost" icon="previous" onClick={onBack}>Back</Button>
        <Button type="submit" variant="primary" icon="github">Add GitHub source</Button>
      </div>
    </form>
  );
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
        aria-label="Drop source material here"
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
      <input ref={inputRef} className="tx-visually-hidden-file" type="file" multiple webkitdirectory="" directory="" accept=".md,.markdown,.trace.md,.schema.md,.workspace.md" onChange={(event) => handleFiles(event.target.files)} />
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

