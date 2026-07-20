import React, { useEffect, useMemo, useState } from 'react';
import { schemaRegistry } from '../schemas/registry.js';
import { Button } from '../ui/primitives/Button.jsx';
import { Badge } from '../ui/primitives/Badge.jsx';
import { Modal } from '../ui/primitives/Modal.jsx';
import { materializeGithubFiles } from '../adapters/github/github.adapter.js';
import { collectLocalFilesFromDataTransfer, materializeLocalMarkdownFiles } from '../adapters/local/local.adapter.js';
import { materializeExplicitUrls } from '../adapters/static/static.adapter.js';
import { ensureWorkspaceForLocalMaterial } from '../workspaces/workspace.import.js';
import {
  CloseWorkspaceDialog,
  CreateWorkspaceDialog,
  RecordActionDialog,
  RecordDetailDialog,
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

function useViewportWidth() {
  const readWidth = () => {
    if (typeof window === 'undefined') return 0;
    return Math.floor(window.visualViewport?.width || window.innerWidth || 0);
  };
  const [width, setWidth] = useState(readWidth);
  useEffect(() => {
    const update = () => setWidth(readWidth());
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener?.('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener?.('resize', update);
    };
  }, []);
  return width;
}

function shouldPageWorkspaces(workspaceCount, viewportWidth) {
  const count = Number(workspaceCount || 0);
  if (count <= 1) return false;
  const width = Number(viewportWidth || 0) || 1280;
  const minimumColumnWidth = width <= 760 ? 320 : 540;
  const workspaceGap = width <= 760 ? 10 : 16;
  const safeViewportPadding = width <= 760 ? 18 : 32;
  const required = (count * minimumColumnWidth) + ((count - 1) * workspaceGap) + safeViewportPadding;
  return required > width;
}

export function TiinexApp() {
  const [state, setState] = useState(initialState);
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const [createError, setCreateError] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [recordAction, setRecordAction] = useState(null);
  const workspaceConfig = useMemo(() => runtime().config?.createDefaultWorkspaceConfig?.(), []);
  const active = activeWorkspace(state);
  const viewportWidth = useViewportWidth();
  const pagerVisible = shouldPageWorkspaces(state.workspaces.length, viewportWidth);

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

  function applyLocalAdapterResult(baseState, workspaceId, adapterResult, options = {}) {
    let nextState = baseState;
    let addedRecords = 0;
    let addedAssets = 0;
    let workspaceOpened = false;
    const workspaces = Array.isArray(adapterResult.workspaceEntries) ? adapterResult.workspaceEntries : [];
    const hasMaterial = Boolean((adapterResult.records?.length || 0) + (adapterResult.assets?.length || 0));
    const targetWorkspaceId = workspaceId || nextState.activeWorkspaceId;

    if (workspaces.length && !targetWorkspaceId && runtime().lifecycle?.openWorkspaceFromMarkdown) {
      const first = workspaces[0];
      const opened = runtime().lifecycle.openWorkspaceFromMarkdown(nextState, first.markdown || '', first);
      if (opened?.ok) {
        nextState = opened.state;
        workspaceOpened = true;
        const openedWorkspaceId = runtime().lifecycle?.activeWorkspace?.(nextState)?.id;
        if (openedWorkspaceId && runtime().lifecycle?.mergeWorkspaceImport) {
          for (const entry of workspaces.slice(1)) {
            const merged = runtime().lifecycle.mergeWorkspaceImport(nextState, openedWorkspaceId, entry);
            if (merged?.ok) nextState = merged.state;
          }
        }
      }
    } else if (workspaces.length && targetWorkspaceId && runtime().lifecycle?.mergeWorkspaceImport) {
      for (const entry of workspaces) {
        const merged = runtime().lifecycle.mergeWorkspaceImport(nextState, targetWorkspaceId, entry);
        if (merged?.ok) nextState = merged.state;
      }
    }

    let finalWorkspaceId = runtime().lifecycle?.activeWorkspace?.(nextState)?.id || targetWorkspaceId;
    if (!finalWorkspaceId && hasMaterial) {
      const ensured = ensureWorkspaceForLocalMaterial(runtime().lifecycle, nextState, '', {
        name: adapterResult.diagnostics?.suggestedWorkspaceName || options.workspaceName || 'Local import'
      });
      if (ensured?.ok) {
        nextState = ensured.state;
        finalWorkspaceId = ensured.workspaceId;
        workspaceOpened = Boolean(ensured.created);
      }
    }
    if (adapterResult.records?.length && finalWorkspaceId) {
      const added = runtime().lifecycle?.addWorkspaceRecords?.(nextState, finalWorkspaceId, adapterResult.records);
      if (added?.ok) {
        nextState = added.state;
        addedRecords = added.records.length;
      }
    }
    if (adapterResult.assets?.length && finalWorkspaceId && runtime().lifecycle?.addWorkspaceAssets) {
      const assetResult = runtime().lifecycle.addWorkspaceAssets(nextState, finalWorkspaceId, adapterResult.assets);
      if (assetResult?.ok) {
        nextState = assetResult.state;
        addedAssets = assetResult.assets.length;
      }
    }
    return { state: nextState, addedRecords, addedAssets, workspaceOpened, workspaceEntries: workspaces.length };
  }

  async function addLocalFiles(fileList, options = {}) {
    const files = options.fromDataTransfer
      ? await collectLocalFilesFromDataTransfer(fileList)
      : Array.from(fileList || []).filter(Boolean);
    if (!files.length) {
      setNotice('No files selected.');
      return;
    }
    let adapterResult;
    try {
      adapterResult = await materializeLocalMarkdownFiles(files, { sourceMode: options.sourceMode || 'manual-files' });
    } catch (error) {
      console.error(error);
      setNotice('Could not read local files or archives.');
      return;
    }
    const materialCount = (adapterResult.records?.length || 0) + (adapterResult.assets?.length || 0) + (adapterResult.workspaceEntries?.length || 0);
    if (!materialCount) {
      const skipped = adapterResult.warnings?.length || adapterResult.errors?.length || 0;
      setNotice(skipped ? 'No readable Markdown, workspace, asset, or zip material was imported.' : 'No files selected.');
      return;
    }
    const applied = applyLocalAdapterResult(state, active?.id, adapterResult, options);
    if (applied.state === state && !applied.addedRecords && !applied.addedAssets && !applied.workspaceOpened && !applied.workspaceEntries) {
      setNotice('Could not add selected material.');
      return;
    }
    setDialog(null);
    const skipped = (adapterResult.warnings?.length || 0) + (adapterResult.errors?.length || 0);
    const parts = [];
    if (applied.workspaceOpened) parts.push('opened workspace');
    else if (applied.workspaceEntries) parts.push(`${applied.workspaceEntries} workspace file${applied.workspaceEntries === 1 ? '' : 's'} staged for merge`);
    if (applied.addedRecords) parts.push(`${applied.addedRecords} artifact${applied.addedRecords === 1 ? '' : 's'}`);
    if (applied.addedAssets) parts.push(`${applied.addedAssets} asset${applied.addedAssets === 1 ? '' : 's'}`);
    setNotice(`${parts.length ? `Imported ${parts.join(' · ')}` : 'Import completed'}${skipped ? `; ${skipped} warning/error${skipped === 1 ? '' : 's'}` : ''}.`);
    commit(applied.state, 'push');
  }

  async function addExplicitUrls(urlText) {
    const urls = String(urlText || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!urls.length) {
      setNotice('Paste at least one URL.');
      return;
    }
    let adapterResult;
    try {
      adapterResult = await materializeExplicitUrls(urls, { fetchImpl: fetch });
    } catch (error) {
      console.error(error);
      setNotice('Could not load URL material.');
      return;
    }
    if (!adapterResult.records.length) {
      setNotice(`No URLs could be loaded${adapterResult.errors?.length ? '; check CORS/source availability.' : '.'}`);
      return;
    }
    const result = runtime().lifecycle?.addWorkspaceRecords?.(state, active?.id, adapterResult.records);
    if (!result?.ok) {
      setNotice('Could not add URL material.');
      return;
    }
    setDialog(null);
    setNotice(`Added ${result.records.length} URL artifact${result.records.length === 1 ? '' : 's'}${adapterResult.errors?.length ? `; ${adapterResult.errors.length} failed` : ''}.`);
    commit(result.state, 'push');
  }


  async function addGitHubSource(input = {}) {
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
    const fileRefs = Array.isArray(input.fileRefs) ? input.fileRefs : String(input.fileRefs || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    let finalState = result.state;
    let noticeMessage = `${result.source.label} source registered.`;

    if (fileRefs.length) {
      try {
        const out = await materializeGithubFiles(result.source, fileRefs, { fetchImpl: fetch });
        if (out.okCount > 0) {
          const ins = runtime().lifecycle?.addWorkspaceSourceRecords?.(finalState, active?.id, result.source.id, out.records || []);
          if (ins?.ok) finalState = ins.state;
        }
        // Compose terse notice
        if ((out.okCount || 0) === 0 && (out.failCount || 0) === 0) {
          noticeMessage = `${result.source.label} source registered; no source files loaded.`;
        } else if ((out.okCount || 0) === 0) {
          noticeMessage = `Source registered; ${out.failCount || 0} files failed to load.`;
        } else if ((out.failCount || 0) === 0) {
          noticeMessage = `Loaded ${out.okCount} source file${out.okCount === 1 ? '' : 's'}.`;
        } else {
          noticeMessage = `Loaded ${out.okCount} of ${fileRefs.length} source files; ${out.failCount} failed.`;
        }
        if (out.errors && out.errors.length) console.warn('github loader errors', out.errors);
      } catch (e) {
        console.error(e);
        noticeMessage = `${result.source.label} source registered; file loading failed.`;
      }
    }

    setDialog(null);
    setNotice(noticeMessage);
    commit(finalState, 'push');
  }

  function openRecord(recordId) {
    setRecordAction(null);
    setActiveRecordId(String(recordId || ''));
  }

  function dismissRecord() {
    setActiveRecordId('');
  }

  function openRecordAction(record, action) {
    setActiveRecordId('');
    setRecordAction({ recordId: record?.id || '', action });
  }

  function dismissRecordAction() {
    setRecordAction(null);
  }

  function createTransitionRecord(parentRecord, draft) {
    if (!draft?.title) {
      setNotice('Transition draft is missing a title.');
      return;
    }
    const result = runtime().lifecycle?.addWorkspaceRecord?.(state, active?.id, draft);
    if (!result?.ok) {
      setNotice('Could not create transition leaf.');
      return;
    }
    setRecordAction(null);
    setActiveRecordId(result.record.id);
    setNotice(`Created local ${draft.kind || 'transition'} leaf from ${parentRecord?.title || 'artifact'}.`);
    commit(result.state, 'push');
  }

  function shareRecord(record) {
    const label = record?.title || 'artifact';
    copyShareUrl();
    setNotice(`Share link copied for ${label}.`);
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

  function cycleWorkspace(direction) {
    const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
    if (workspaces.length <= 1) return;
    const currentIndex = Math.max(0, workspaces.findIndex((workspace) => workspace.id === state.activeWorkspaceId));
    const offset = direction === 'previous' ? -1 : 1;
    const nextIndex = (currentIndex + offset + workspaces.length) % workspaces.length;
    const next = structuredClone(state);
    next.activeWorkspaceId = workspaces[nextIndex]?.id || state.activeWorkspaceId;
    commit(next, 'push');
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

  const activeRecord = activeRecordId && active?.records ? active.records.find((record) => record.id === activeRecordId) : null;
  const actionRecord = recordAction?.recordId && active?.records ? active.records.find((record) => record.id === recordAction.recordId) : null;

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
    <main className={shellClasses} data-runtime="react-v119.3" data-source-boundary={CLEAN_URL_BOUNDARY} data-uc="UC-001-empty-create-local-workspace-add-flow" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (!active && event.dataTransfer) { event.preventDefault(); addLocalFiles(event.dataTransfer, { sourceMode: 'stage-drop', fromDataTransfer: true }); } }}>
      <GlobalDock
        hasWorkspace={Boolean(active)}
        workspaceCount={state.workspaces.length}
        pagerVisible={pagerVisible}
        onPreviousWorkspace={() => cycleWorkspace('previous')}
        onNextWorkspace={() => cycleWorkspace('next')}
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
          onDropFiles={addLocalFiles}
          onOpenRecord={openRecord}
          onShareRecord={shareRecord}
          onRecordAction={openRecordAction}
        />
      ) : (
        <EmptyStage workspaceConfig={workspaceConfig} />
      )}

      {notice ? <div className="tx-toast" role="status">{notice}</div> : null}
      <footer className="tx-footer" translate="no" title="Powered by Tiinex">Powered by <a href="https://github.com/Tiinex" target="_blank" rel="noopener noreferrer">Tiinex</a></footer>

      {dialog === 'create-workspace' ? <CreateWorkspaceDialog error={createError} onSubmit={createWorkspace} onDismiss={() => setDialog(null)} /> : null}
      {dialog === 'close-workspace' && active ? <CloseWorkspaceDialog workspace={active} onDismiss={() => setDialog(null)} onConfirm={() => closeWorkspace(active.id)} /> : null}
      {activeRecord ? <RecordDetailDialog record={activeRecord} onDismiss={dismissRecord} onShare={() => shareRecord(activeRecord)} /> : null}
      {actionRecord ? <RecordActionDialog record={actionRecord} action={recordAction.action} schemaRegistry={schemaRegistry} onDismiss={dismissRecordAction} onShare={() => shareRecord(actionRecord)} onCreateTransition={createTransitionRecord} /> : null}
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

function GlobalDock({ hasWorkspace, workspaceCount, pagerVisible, onPreviousWorkspace, onNextWorkspace, onCreate, onHome, onShare, onHelp, onMultiverse }) {
  const showPager = Boolean(hasWorkspace && pagerVisible);
  return (
    <nav
      className={`tx-top-dock tx-dock-shell-row ${showPager ? 'tx-top-dock-paged' : 'tx-top-dock-fit'}`}
      aria-label="Global actions"
      data-workspace-count={workspaceCount}
      data-overflow-pager={showPager ? 'visible' : 'hidden'}
    >
      {showPager ? <Button shape="round" icon="previous" aria-label="Previous workspace" onClick={onPreviousWorkspace} /> : null}
      <span className="tx-dock-core tx-centered-dock-core tx-content-fit-dock">
        <span className="tx-dock-side tx-dock-left">
          <Button icon="multiverse" variant="nav" aria-label="Change multiverse" title="Change multiverse" onClick={onMultiverse} />
          <Button icon="create" variant="primary" onClick={onCreate}>Create</Button>
        </span>
        <button className="tx-logo-command tx-logo-home tx-dock-logo-large" data-home type="button" onClick={onHome} aria-label="Tiinex home">
          <img src={LOGO_SRC} alt="" />
        </button>
        <span className="tx-dock-side tx-dock-right">
          <Button icon="shareNodes" variant="nav" onClick={onShare}>Share</Button>
          <Button icon="help" variant="nav" aria-label="Help" onClick={onHelp} />
        </span>
      </span>
      {showPager ? <Button shape="round" icon="next" aria-label="Next workspace" onClick={onNextWorkspace} /> : null}
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

// `createRecordFromMarkdown` moved to `src/artifacts/artifact.record.js` (v121 materialization foundation)

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

