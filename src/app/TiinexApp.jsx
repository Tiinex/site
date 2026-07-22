import React, { useEffect, useMemo, useState } from 'react';
import { schemaRegistry } from '../schemas/registry.js';
import { Button } from '../ui/primitives/Button.jsx';
import { Badge } from '../ui/primitives/Badge.jsx';
import { Modal } from '../ui/primitives/Modal.jsx';
import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { collectLocalFilesFromDataTransfer, materializeLocalMarkdownFiles } from '../adapters/local/local.adapter.js';
import { materializeExplicitUrls } from '../adapters/static/static.adapter.js';
import { applyLocalAdapterResultToWorkspace, appendImportSummary } from '../workspaces/workspace.import.js';
import { buildSourceTransportPolicy } from '../sources/transport.policy.js';
import { mergeWorkspaceCandidate as mergeStagedWorkspaceCandidate, openWorkspaceCandidate as openStagedWorkspaceCandidate } from '../workspaces/workspace.candidates.js';
import {
  AssetDetailDialog,
  CloseWorkspaceDialog,
  CreateWorkspaceDialog,
  DisplayOptionsDialog,
  RecordActionDialog,
  RecordDetailDialog,
  normalizeWorkspaceDisplayOptions,
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
    view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { showSupportingMarkdown: true, showWorkspaceCandidates: true, showAssets: false } },
    workspaces: [],
    audit: null
  };
}

function initialState() {
  const { lifecycle, route, persistence } = runtime();
  const routeState = persistence?.readInitialState?.({ location: window.location, storage: window.localStorage });
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

function summarizeGithubMaterialization(sourceLabel, out = {}) {
  const okCount = Number(out.okCount || 0);
  const failCount = Number(out.failCount || 0);
  const warnings = Array.isArray(out.warnings) ? out.warnings : [];
  const errors = Array.isArray(out.errors) ? out.errors : [];
  const firstWarning = warnings[0];
  const firstError = errors[0];
  if (okCount > 0 && failCount === 0) {
    return `Loaded ${okCount} source file${okCount === 1 ? '' : 's'}${warnings.length ? `; ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ''}.`;
  }
  if (okCount > 0) {
    return `Loaded ${okCount} source file${okCount === 1 ? '' : 's'}; ${failCount} failed/deferred.`;
  }
  if (firstWarning?.message) return `${sourceLabel} source registered. ${firstWarning.message}`;
  if (firstError?.error) return `${sourceLabel} source registered; source loading failed: ${firstError.error}.`;
  return `${sourceLabel} source registered; no source files loaded.`;
}

function summarizeGithubAdapterResult(out = {}) {
  const warnings = Array.isArray(out.warnings) ? out.warnings : [];
  const errors = Array.isArray(out.errors) ? out.errors : [];
  return {
    schema: 'tiinex.workspace.import.result.v1',
    ok: Number(out.okCount || 0) > 0 || warnings.length > 0,
    message: `GitHub source materialization: ${Number(out.okCount || 0)} loaded · ${warnings.length} warning${warnings.length === 1 ? '' : 's'} · ${errors.length} error${errors.length === 1 ? '' : 's'}.`,
    counts: {
      records: Number(out.okCount || 0),
      assets: 0,
      workspaceEntries: 0,
      warnings: warnings.length,
      errors: errors.length,
      previewOmitted: 0
    },
    warnings,
    errors,
    diagnostics: Object.assign({ adapterId: 'github' }, out.diagnostics || {})
  };
}

export function TiinexApp() {
  const [state, setState] = useState(initialState);
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const [createError, setCreateError] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [activeAssetId, setActiveAssetId] = useState('');
  const [recordAction, setRecordAction] = useState(null);
  const [githubRequestPending, setGithubRequestPending] = useState(false);
  const workspaceConfig = useMemo(() => runtime().config?.createDefaultWorkspaceConfig?.(), []);
  const active = activeWorkspace(state);
  const viewportWidth = useViewportWidth();
  const pagerVisible = shouldPageWorkspaces(state.workspaces.length, viewportWidth);

  useEffect(() => {
    const onRoute = () => {
      const { lifecycle, route, persistence } = runtime();
      const routeState = persistence?.readInitialState?.({ location: window.location, storage: window.localStorage });
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
    const applied = applyLocalAdapterResultToWorkspace(runtime().lifecycle, state, active?.id, adapterResult, options);
    if (!applied.ok && applied.state === state && !applied.addedRecords && !applied.addedAssets && !applied.workspaceOpened && !applied.workspaceEntries) {
      setNotice('Could not add selected material.');
      return;
    }
    setDialog(null);
    setNotice(applied.summary?.message || 'Import completed.');
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
    if (githubRequestPending) {
      setNotice('GitHub source operation already in progress.');
      return;
    }
    setGithubRequestPending(true);
    const repository = normalizeRepository(input.repository || input.repo || '');
    if (!repository) {
      setNotice('Repo URL or owner/name is required.');
      setGithubRequestPending(false);
      return;
    }
    const rootPath = String(input.rootPath || input.root || '.topics').trim() || '.topics';
    const ref = String(input.ref || '').trim();
    const label = input.label || repository;
    const result = runtime().lifecycle?.addWorkspaceSource?.(state, active?.id, {
      kind: input.sourceKind || input.kind || 'github-tree',
      label,
      repository,
      ref,
      rootPath,
      count: 0,
      repoDiscovery: Boolean(input.repoDiscovery),
      issueDiscovery: Boolean(input.issueDiscovery),
      issueUrls: input.issueUrls || '',
      transportLabel: 'public GitHub API/raw'
    });
    if (!result?.ok) {
      setNotice('Could not add GitHub source.');
      setGithubRequestPending(false);
      return;
    }
    const fileRefs = Array.isArray(input.fileRefs) ? input.fileRefs : String(input.fileRefs || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    let finalState = result.state;
    let noticeMessage = `${result.source.label} source registered.`;

    if (fileRefs.length || input.repoDiscovery || input.issueDiscovery || input.issueUrls) {
      try {
        const transportPolicy = buildSourceTransportPolicy({
          mode: 'bounded-online',
          maxRequestsPerOperation: Number(input.maxRequestsPerOperation || 550),
          now: new Date().toISOString(),
          offline: Boolean(input.offline)
        });
        const out = await materializeGithubSource(result.source, {
          fileRefs,
          repoDiscovery: Boolean(input.repoDiscovery),
          issueDiscovery: Boolean(input.issueDiscovery),
          issueUrls: input.issueUrls || ''
        }, { fetchImpl: fetch, maxFiles: 500, transportPolicy });
        const resolvedRef = String(out.diagnostics?.resolvedRef || '').trim();
        if (resolvedRef && !String(result.source.ref || '').trim()) {
          const pinned = runtime().lifecycle?.addWorkspaceSource?.(finalState, active?.id, Object.assign({}, result.source, {
            repository: result.source.repo || repository,
            repo: result.source.repo || repository,
            ref: resolvedRef,
            rootPath: result.source.rootPath || rootPath,
            label: result.source.label || label,
            discoveryState: 'deferred'
          }));
          if (pinned?.ok) finalState = pinned.state;
        }
        if (out.okCount > 0) {
          const ins = runtime().lifecycle?.addWorkspaceSourceRecords?.(finalState, active?.id, result.source.id, out.records || []);
          if (ins?.ok) finalState = ins.state;
        }
        finalState = appendImportSummary(runtime().lifecycle, finalState, summarizeGithubAdapterResult(out), {});
        noticeMessage = summarizeGithubMaterialization(result.source.label, out);
      } catch (e) {
        console.error(e);
        noticeMessage = `${result.source.label} source registered; source materialization failed.`;
      }
    }

    setDialog(null);
    setNotice(noticeMessage);
    setGithubRequestPending(false);
    commit(finalState, 'push');
  }

  function openRecord(recordId) {
    const id = String(recordId || '');
    setRecordAction(null);
    setActiveAssetId('');
    setActiveRecordId('');
    if (!id) return;
    const next = structuredClone(state);
    next.view = Object.assign({}, next.view || {}, { workspaceVerse: 'lineage', selectedRecordId: id });
    commit(next, 'push');
  }

  function dismissRecord() {
    setActiveRecordId('');
  }

  function openAsset(assetId) {
    setRecordAction(null);
    setActiveRecordId('');
    setActiveAssetId(String(assetId || ''));
  }

  function dismissAsset() {
    setActiveAssetId('');
  }

  function openWorkspaceCandidate(candidateId) {
    const result = openStagedWorkspaceCandidate(runtime().lifecycle, state, active?.id, candidateId);
    if (!result?.ok) {
      setNotice('Could not open workspace candidate.');
      return;
    }
    setDialog(null);
    setActiveRecordId('');
    setActiveAssetId('');
    setRecordAction(null);
    setNotice(`Opened workspace candidate ${result.candidate?.title || result.candidate?.path || ''}.`.replace(/\s+\./, '.'));
    commit(result.state, 'push');
  }

  function mergeWorkspaceCandidate(candidateId) {
    const result = mergeStagedWorkspaceCandidate(runtime().lifecycle, state, active?.id, candidateId);
    if (!result?.ok) {
      setNotice('Could not merge workspace candidate.');
      return;
    }
    setNotice(`Merged workspace candidate ${result.candidate?.title || result.candidate?.path || ''}.`.replace(/\s+\./, '.'));
    commit(result.state, 'push');
  }

  function openRecordAction(record, action) {
    setActiveRecordId('');
    setActiveAssetId('');
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
    setNotice(`Workspace/session share copied for ${label}; route-only viewers preserve boundary and may show material unavailable.`);
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
    if (verse === 'feed' || verse === 'tree') {
      next.view = Object.assign({}, next.view || {}, { selectedRecordId: '' });
    }
    commit(next, 'push');
  }

  function setQuery(query) {
    const next = structuredClone(state);
    next.view = { ...next.view, query };
    commit(next, 'replace');
  }

  function setDisplayOptions(options) {
    const next = structuredClone(state);
    next.view = Object.assign({}, next.view || {}, { displayOptions: normalizeWorkspaceDisplayOptions(options) });
    setDialog(null);
    commit(next, 'replace');
  }

  function copyShareUrl() {
    const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    setNotice('Copy this URL from the browser bar if clipboard access is blocked.');
    navigator.clipboard?.writeText?.(new URL(url, window.location.href).href)
      ?.then(() => setNotice('Workspace/session link copied.'))
      ?.catch(() => {});
  }

  function resetHome() {
    setDialog(null);
    setNotice('');
    commit(defaultState(), 'push');
  }

  const activeRecord = activeRecordId && active?.records ? active.records.find((record) => record.id === activeRecordId) : null;
  const activeAsset = activeAssetId && active?.assets ? active.assets.find((asset) => asset.id === activeAssetId || asset.path === activeAssetId) : null;
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
    <main className={shellClasses} data-runtime="react-v174-lineage-presentation-parity" data-source-boundary={CLEAN_URL_BOUNDARY} data-uc="UC-001-empty-create-local-workspace-add-flow" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (!active && event.dataTransfer) { event.preventDefault(); addLocalFiles(event.dataTransfer, { sourceMode: 'stage-drop', fromDataTransfer: true }); } }}>
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
          onOpenDisplayOptions={() => setDialog('display-options')}
          onOpenAddDialog={() => setDialog('add-to-workspace')}
          onCloseSource={closeSource}
          onDropFiles={addLocalFiles}
          onOpenRecord={openRecord}
          onOpenAsset={openAsset}
          onOpenWorkspaceCandidate={openWorkspaceCandidate}
          onMergeWorkspaceCandidate={mergeWorkspaceCandidate}
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
      {activeAsset ? <AssetDetailDialog asset={activeAsset} onDismiss={dismissAsset} /> : null}
      {actionRecord ? <RecordActionDialog record={actionRecord} action={recordAction.action} schemaRegistry={schemaRegistry} onDismiss={dismissRecordAction} onShare={() => shareRecord(actionRecord)} onCreateTransition={createTransitionRecord} /> : null}
      {dialog === 'display-options' && active ? (
        <DisplayOptionsDialog
          options={state.view?.displayOptions}
          counts={{ records: active.records?.length || 0, assets: active.assets?.length || 0, workspaceCandidates: active.workspaceMergeCandidates?.length || 0 }}
          onSubmit={setDisplayOptions}
          onDismiss={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'add-to-workspace' && active ? (
        <AddToWorkspaceDialog
          workspace={active}
          workspaceConfig={workspaceConfig}
          onDismiss={() => setDialog(null)}
          onAddFiles={addLocalFiles}
          onAddGitHubSource={addGitHubSource}
          onAddUrls={addExplicitUrls}
          githubBusy={githubRequestPending}
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
          <Button icon="shareNodes" variant="nav" onClick={onShare}>Share session</Button>
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

