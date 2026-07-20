import React, { useEffect, useMemo, useState } from 'react';
import { schemaRegistry } from '../schemas/registry.js';
import { Button } from '../ui/primitives/Button.jsx';
import { Badge } from '../ui/primitives/Badge.jsx';
import { Modal } from '../ui/primitives/Modal.jsx';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import {
  CloseWorkspaceDialog,
  CreateWorkspaceDialog,
  WorkspaceColumnSurface
} from '../schemas/workspace/workspace.views.jsx';
import { AddToWorkspaceDialog } from '../schemas/workspace/workspace.add.views.jsx';

const CLEAN_URL_BOUNDARY = 'clean-url-does-not-bootstrap-stale-local-storage';
const LOGO_SRC = `${import.meta.env.BASE_URL}assets/tiinex-logo-white-transparent.png`;

function runtime() {
  return {
    config: window.TiinexWorkspaceConfig,
    lifecycle: window.TiinexWorkspaceLifecycle,
    route: window.TiinexWorkspaceRoute,
    persistence: window.TiinexWorkspacePersistence
  };
}

function defaultState() {
  return runtime().lifecycle?.makeEmptyAppState?.() || {
    version: 1,
    activeWorkspaceId: '',
    view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' },
    workspaces: [],
    audit: null
  };
}

function initialState() {
  const { lifecycle, route, persistence } = runtime();
  const routeState = persistence?.readInitialState?.({ location: window.location });
  return routeState ? route?.normalizeRouteState?.(routeState, lifecycle) || routeState : defaultState();
}

function activeWorkspace(state) {
  return runtime().lifecycle?.activeWorkspace?.(state) || null;
}

export function TiinexApp() {
  const [state, setState] = useState(initialState);
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const [createError, setCreateError] = useState('');
  const workspaceConfig = useMemo(() => runtime().config?.createDefaultWorkspaceConfig?.(), []);
  const active = activeWorkspace(state);

  useEffect(() => {
    const onRoute = () => {
      const { lifecycle, route, persistence } = runtime();
      const routeState = persistence?.readHashState?.(window.location);
      if (!routeState) {
        setState(defaultState());
        return;
      }
      setState(route?.normalizeRouteState?.(routeState, lifecycle) || routeState);
    };
    window.addEventListener('popstate', onRoute);
    window.addEventListener('hashchange', onRoute);
    return () => {
      window.removeEventListener('popstate', onRoute);
      window.removeEventListener('hashchange', onRoute);
    };
  }, []);

  useEffect(() => {
    document.title = workspaceConfig?.viewerIdentity?.browserTitle || 'Tiinex';
  }, [workspaceConfig]);

  function commit(nextState, mode = 'push') {
    setState(nextState);
    if (nextState?.workspaces?.length) runtime().persistence?.writeState?.(nextState, { mode });
    else runtime().persistence?.clearState?.({ mode });
  }

  function openCreate() {
    setCreateError('');
    setDialog('create-workspace');
  }

  function createWorkspace(name) {
    const result = runtime().lifecycle?.createWorkspace?.(state, { name });
    if (!result?.ok) {
      setCreateError(result?.error === 'workspace.name.required' ? 'Workspace name is required.' : 'Could not create workspace.');
      return false;
    }
    setDialog(null);
    setNotice('');
    commit(result.state, 'push');
    return true;
  }

  function closeWorkspace(workspaceId) {
    const result = runtime().lifecycle?.closeWorkspace?.(state, workspaceId || state.activeWorkspaceId);
    if (!result?.ok) return;
    setDialog(null);
    setNotice(result.state.workspaces.length ? 'Workspace closed.' : 'Workspace closed. Clean start restored.');
    commit(result.state, 'push');
  }

  async function addLocalFiles(fileList, options = {}) {
    const files = Array.from(fileList || []).filter(Boolean);
    const markdownFiles = files.filter((file) => /\.(md|markdown|trace\.md|schema\.md|workspace\.md)$/i.test(file.name || ''));
    const skipped = files.length - markdownFiles.length;
    if (!markdownFiles.length) {
      setNotice(skipped ? 'No readable Markdown files found. Zip intake is not wired in this React slice yet.' : 'No files selected.');
      return;
    }
    const records = [];
    for (const file of markdownFiles) {
      const markdown = await file.text();
      records.push(recordFromMarkdown(markdown, {
        path: file.webkitRelativePath || file.name,
        name: file.name,
        sourceMode: options.sourceMode || 'manual-file'
      }));
    }
    const result = runtime().lifecycle?.addWorkspaceRecords?.(state, active?.id, records);
    if (!result?.ok) {
      setNotice('Could not add selected files.');
      return;
    }
    setDialog(null);
    setNotice(`Added ${result.records.length} local Markdown artifact${result.records.length === 1 ? '' : 's'}${skipped ? `; skipped ${skipped} unsupported file${skipped === 1 ? '' : 's'}` : ''}.`);
    commit(result.state, 'push');
  }

  async function addExplicitUrls(urlText) {
    const urls = String(urlText || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!urls.length) {
      setNotice('Paste at least one URL.');
      return;
    }
    const records = [];
    const failed = [];
    for (const url of urls) {
      const fetchUrl = normalizeReadableUrl(url);
      try {
        const response = await fetch(fetchUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const markdown = await response.text();
        records.push(recordFromMarkdown(markdown, { path: url, name: fileNameFromUrl(url), sourceMode: 'explicit-url' }));
      } catch (error) {
        failed.push(url);
      }
    }
    if (!records.length) {
      setNotice(`No URLs could be loaded${failed.length ? '; check CORS/source availability.' : '.'}`);
      return;
    }
    const result = runtime().lifecycle?.addWorkspaceRecords?.(state, active?.id, records);
    if (!result?.ok) {
      setNotice('Could not add URL material.');
      return;
    }
    setDialog(null);
    setNotice(`Added ${result.records.length} URL artifact${result.records.length === 1 ? '' : 's'}${failed.length ? `; ${failed.length} failed` : ''}.`);
    commit(result.state, 'push');
  }

  function addGitHubSource(input = {}) {
    const repository = normalizeRepository(input.repository || input.repo || 'Tiinex/docs');
    if (!repository) {
      setNotice('Repo URL or owner/name is required.');
      return;
    }
    const rootPath = String(input.rootPath || input.root || '.topics').trim() || '.topics';
    const label = input.label || repository;
    const result = runtime().lifecycle?.addWorkspaceSource?.(state, active?.id, {
      id: `github:${repository.toLowerCase()}:${rootPath.toLowerCase()}`,
      kind: input.sourceKind || input.kind || 'github-tree',
      label,
      repository,
      ref: input.ref || 'master',
      rootPath,
      count: 0,
      repoDiscovery: input.repoDiscovery !== false,
      issueDiscovery: input.issueDiscovery !== false,
      issueUrls: input.issueUrls || '',
      transportLabel: 'Source Pages mirror'
    });
    if (!result?.ok) {
      setNotice('Could not add GitHub source.');
      return;
    }
    setDialog(null);
    setNotice(`${result.source.label} source registered. Loading adapter deferred.`);
    commit(result.state, 'push');
  }

  function closeSource(sourceId) {
    const result = runtime().lifecycle?.closeWorkspaceSource?.(state, active?.id, sourceId);
    if (!result?.ok) {
      setNotice('Local source stays pinned.');
      return;
    }
    setNotice('Source closed.');
    commit(result.state, 'push');
  }

  function setVerse(verse) {
    const next = runtime().lifecycle?.setWorkspaceVerse?.(state, verse) || state;
    commit(next, 'push');
  }

  function setQuery(query) {
    const next = structuredClone(state);
    next.view = { ...next.view, query };
    commit(next, 'replace');
  }

  function copyShareUrl() {
    const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    setNotice('Copy this URL from the browser bar if clipboard access is blocked.');
    navigator.clipboard?.writeText?.(new URL(url, window.location.href).href)
      ?.then(() => setNotice('Clean link copied.'))
      ?.catch(() => {});
  }

  function resetHome() {
    setDialog(null);
    setNotice('');
    commit(defaultState(), 'push');
  }

  const shellClasses = [
    'tx-react-runtime',
    'tx-uc001-shell',
    'tx-shell-config-grounded',
    'tx-shell-route-grounded',
    'tx-shell-command-portable',
    'tx-shell-scroll-owned',
    'tx-schema-companion-runtime',
    active ? 'tx-workspace-mode' : 'tx-empty-stage-mode'
  ].join(' ');

  return (
    <main className={shellClasses} data-runtime="react-v119.2" data-source-boundary={CLEAN_URL_BOUNDARY} data-uc="UC-001-empty-create-local-workspace-add-flow">
      <GlobalDock
        hasWorkspace={Boolean(active)}
        workspaceCount={state.workspaces.length}
        onCreate={openCreate}
        onHome={resetHome}
        onShare={copyShareUrl}
        onHelp={() => setDialog('help')}
        onMultiverse={() => setNotice('Column multiverse is active for UC-001. Other universes stay deferred.')}
      />

      {active ? (
        <WorkspaceColumnSurface
          workspace={active}
          state={state}
          onClose={() => setDialog('close-workspace')}
          onVerse={setVerse}
          onQuery={setQuery}
          onOpenAddDialog={() => setDialog('add-to-workspace')}
          onCloseSource={closeSource}
        />
      ) : (
        <EmptyStage workspaceConfig={workspaceConfig} />
      )}

      {notice ? <div className="tx-toast" role="status">{notice}</div> : null}
      <footer className="tx-footer" translate="no" title="Powered by Tiinex">Powered by <a href="https://github.com/Tiinex" target="_blank" rel="noopener noreferrer">Tiinex</a></footer>

      {dialog === 'create-workspace' ? <CreateWorkspaceDialog error={createError} onSubmit={createWorkspace} onDismiss={() => setDialog(null)} /> : null}
      {dialog === 'close-workspace' && active ? <CloseWorkspaceDialog workspace={active} onDismiss={() => setDialog(null)} onConfirm={() => closeWorkspace(active.id)} /> : null}
      {dialog === 'add-to-workspace' && active ? (
        <AddToWorkspaceDialog
          workspace={active}
          workspaceConfig={workspaceConfig}
          onDismiss={() => setDialog(null)}
          onAddFiles={addLocalFiles}
          onAddGitHubSource={addGitHubSource}
          onAddUrls={addExplicitUrls}
        />
      ) : null}
      {dialog === 'help' ? <HelpDialog workspaceConfig={workspaceConfig} onDismiss={() => setDialog(null)} /> : null}
    </main>
  );
}

function GlobalDock({ hasWorkspace, workspaceCount, onCreate, onHome, onShare, onHelp, onMultiverse }) {
  const showPager = hasWorkspace && workspaceCount > 1;
  return (
    <nav className={`tx-top-dock ${showPager ? 'tx-top-dock-paged' : 'tx-top-dock-fit'}`} aria-label="Global actions">
      {showPager ? <Button shape="round" icon="previous" aria-label="Previous workspace" /> : null}
      <span className="tx-dock-core tx-centered-dock-core">
        <span className="tx-dock-side tx-dock-left">
          <Button icon="multiverse" variant="nav" aria-label="Change multiverse" title="Change multiverse" onClick={onMultiverse} />
          <Button icon="create" variant="primary" onClick={onCreate}>Create</Button>
        </span>
        <button className="tx-logo-command tx-logo-home" data-home type="button" onClick={onHome} aria-label="Tiinex home">
          <img src={LOGO_SRC} alt="" />
        </button>
        <span className="tx-dock-side tx-dock-right">
          <Button icon="share" variant="nav" onClick={onShare}>Share</Button>
          <Button icon="help" variant="nav" aria-label="Help" onClick={onHelp} />
        </span>
      </span>
      {showPager ? <Button shape="round" icon="next" aria-label="Next workspace" /> : null}
    </nav>
  );
}

function EmptyStage({ workspaceConfig }) {
  const subtitle = runtime().config?.emptyStageSubtitle?.(workspaceConfig, 0) || 'Every handoff starts somewhere';
  return (
    <section className="tx-empty-stage tx-old-empty-stage tx-uc001-empty-start" aria-label="No workspace loaded">
      <p>{subtitle}</p>
    </section>
  );
}

function HelpDialog({ workspaceConfig, onDismiss }) {
  const help = workspaceConfig?.help || [];
  return (
    <Modal title="Help" onDismiss={onDismiss}>
      <div className="tx-help-stack">
        {help.length ? help.map((item) => (
          <details key={item.question} open={item.question === 'What is this view?'}>
            <summary>{item.question}</summary>
            <p>{item.body}</p>
          </details>
        )) : <p className="tx-muted">No workspace help is configured.</p>}
        <div className="tx-schema-origin-note">
          <Badge>canonical-core: Tiinex/docs</Badge>
          <Badge>viewer-extension: Tiinex/site</Badge>
          <Badge>{schemaRegistry.modules.length} schema modules</Badge>
        </div>
      </div>
    </Modal>
  );
}

function recordFromMarkdown(markdown, meta = {}) {
  const parsed = parseArtifactMarkdown(markdown || '');
  const schemaId = parsed.envelope?.current?.schema?.id || '';
  return {
    id: `local:${String(meta.path || meta.name || parsed.title || Date.now()).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: parsed.title || meta.name || 'Untitled artifact',
    summary: parsed.envelope?.current?.summary || parsed.body?.sections?.slice(0, 3).join(' · ') || meta.path || 'Local Markdown artifact.',
    kind: schemaId || (parsed.hasContinuityContext ? 'tiinex.artifact' : 'markdown'),
    status: parsed.hasIntegrity ? 'byte ok' : 'local',
    path: meta.path || meta.name || '',
    markdown,
    sourceMode: meta.sourceMode || 'local-manual',
    hasContinuityContext: parsed.hasContinuityContext,
    hasIntegrity: parsed.hasIntegrity
  };
}

function normalizeRepository(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const parts = url.pathname.replace(/^\/+|\.git$/g, '').split('/').filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : raw;
  } catch {
    return raw.replace(/^github\.com\//i, '').replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  }
}

function normalizeReadableUrl(value) {
  const raw = String(value || '').trim();
  try {
    const url = new URL(raw);
    if (url.hostname === 'github.com' && url.pathname.includes('/blob/')) {
      const [owner, repo, , ref, ...path] = url.pathname.split('/').filter(Boolean);
      return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path.join('/')}`;
    }
  } catch {}
  return raw;
}

function fileNameFromUrl(value) {
  try {
    return new URL(value).pathname.split('/').filter(Boolean).pop() || value;
  } catch {
    return value;
  }
}
