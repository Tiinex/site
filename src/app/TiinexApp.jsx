import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EmptyStage, GlobalDock, HelpDialog } from './appShell.views.jsx';
import { activeWorkspace, CLEAN_URL_BOUNDARY, defaultState, initialState, runtime } from './runtimeState.js';
import { shouldPageWorkspaces, useViewportWidth } from './viewport.js';
import { summarizeGithubAdapterResult, summarizeGithubMaterialization, normalizeRepository } from './githubMaterializationSummary.js';
import { buildDisplayOptionCounts } from './workspaceDisplayCounts.js';
import { hydrateUiRecord, hydrateUiWorkspace } from './recordUi.js';
import { stateWithActiveWorkspace, stateWithWorkspaceViewPatch, stateWithWorkspaceViewUpdate, visibleWorkspaceItemsFor } from './workspaceMulticolumn.js';
import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { collectLocalFilesFromDataTransfer, materializeLocalMarkdownFiles } from '../adapters/local/local.adapter.js';
import { materializeExplicitUrls } from '../adapters/static/static.adapter.js';
import { applyLocalAdapterResultToWorkspace, appendImportSummary } from '../workspaces/workspace.import.js';
import { setWorkspaceDiscoveryProgress, clearWorkspaceDiscoveryProgress } from '../workspaces/workspace.discoveryProgress.js';
import { stateWithSourceMaterialCleared } from '../workspaces/workspace.sourceMaterial.js';
import { buildSourceTransportPolicy } from '../sources/transport.policy.js';
import { clearGithubSourceTextCacheForSource, githubTransportOrderFromTier, nextGithubTransportTier, normalizeGithubTransportTier } from '../sources/github/github.transport.js';
import { sourceTransportPendingUpdateInputForSource, sourceTransportRefreshInputForSource } from './sourceTransportRefresh.js';
import { githubRequestedSurfaces, githubSourceFormState, mergeGithubRequestedSurfaces, mergeGithubSurfaceStates } from './githubSourceInput.js';
import { recoverMissingLineageParentsFromSource } from './lineageSourceRecovery.js';
import { sourceGovernanceDialogData } from './governanceDialogData.js';
import { buildExportPackageBundle } from '../export/package.builder.js';
import { exportPackageZipBlob } from '../export/package.zip.js';
import { buildWorkspaceAuditView } from '../workspaces/workspace.auditView.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { mergeWorkspaceCandidate as mergeStagedWorkspaceCandidate, openWorkspaceCandidate as openStagedWorkspaceCandidate } from '../workspaces/workspace.candidates.js';
import { AssetDetailDialog, CloseWorkspaceDialog, CreateWorkspaceDialog, RenameWorkspaceDialog, RecordActionDialog, RecordDetailDialog, GovernanceBoundaryDialog, WorkspaceColumnSurface } from '../schemas/workspace/workspace.views.jsx';
import { normalizeWorkspaceDisplayOptions } from '../workspaces/workspace.displayOptions.js';
import { AddToWorkspaceDialog } from '../schemas/workspace/workspace.add.views.jsx';
import { DisplayOptionsDialog } from '../schemas/workspace/workspace.displayOptions.views.jsx';
import { schemaRegistry } from '../schemas/registry.js';
import { workspaceViewScrollKeyFor, stateWithViewPatch, stateWithViewUpdate, stateWithCapturedViewScroll } from './viewState.js';
import { shouldCommitGithubProgress, yieldForVisibleSourceProgress } from './githubProgress.js';
import { TIINEX_RUNTIME_ID } from '../build.identity.js';
import { installVisualDormancy, visualDormancySummary } from './visualDormancy.js';
import { clearScheduledScrollPersistence, persistCapturedScroll, scheduleIdleScrollPersist } from './scrollPersistence.js';
import { commitStateWithPersistence, createStatePersistenceScheduler } from './statePersistenceScheduler.js';
import { resolveTiinexAppConfigGithubInput } from './tiinexAppConfigSource.js';
import { RecordActionKind } from '../actions/record.actions.js';
import { ensureUniqueTransitionPath } from '../transitions/record.transitions.js';
import { mergeWorkspaceRecordAction, openWorkspaceRecordAction } from './workspaceRecordActions.js';
import { stateWithWorkspaceRecordOpenProgress } from './workspaceOpenProgress.js';

export function TiinexApp() {
  const [state, setState] = useState(initialState);
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const [createError, setCreateError] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [activeAssetId, setActiveAssetId] = useState('');
  const [recordAction, setRecordAction] = useState(null);
  const [githubRequestPending, setGithubRequestPending] = useState(false);
  const [sourceContinuationId, setSourceContinuationId] = useState('');
  const viewScrollRef = useRef({}); const latestStateRef = useRef(state);
  const githubOperationRef = useRef({ token: null, controller: null }); const lineageAutoLoadKeysRef = useRef(new Set());
  const scrollPersistTimerRef = useRef(null);
  const scrollPersistIdleRef = useRef(null);
  const statePersistenceSchedulerRef = useRef(null);
  const appConfigDiagnosticsRef = useRef({ last: null });
  if (!statePersistenceSchedulerRef.current) statePersistenceSchedulerRef.current = createStatePersistenceScheduler(typeof window !== 'undefined' ? window : globalThis);
  const workspaceConfig = useMemo(() => runtime().config?.createDefaultWorkspaceConfig?.(), []);
  const active = activeWorkspace(state);
  const activeUi = useMemo(() => hydrateUiWorkspace(active), [active]);
  const viewportWidth = useViewportWidth();
  const pagerVisible = shouldPageWorkspaces(state.workspaces.length, viewportWidth);
  const visibleWorkspaceItems = useMemo(() => visibleWorkspaceItemsFor(state, { active, activeUi, pagerVisible, viewportWidth }), [state, active, activeUi, pagerVisible, viewportWidth]);
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
  useEffect(() => { document.title = workspaceConfig?.viewerIdentity?.browserTitle || 'Tiinex'; }, [workspaceConfig]);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.TiinexAppConfigSourceReport = () => appConfigDiagnosticsRef.current;
    return () => {
      if (window.TiinexAppConfigSourceReport) delete window.TiinexAppConfigSourceReport;
    };
  }, []);
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);
  useEffect(() => installVisualDormancy({ getSummary: () => visualDormancySummary(latestStateRef.current || state) }), []);
  useEffect(() => { window.TiinexStatePersistenceReport = () => statePersistenceSchedulerRef.current?.report?.() || { pending: false }; return () => { try { delete window.TiinexStatePersistenceReport; } catch (_) { window.TiinexStatePersistenceReport = undefined; } }; }, []);
  useEffect(() => () => { clearScheduledScrollPersistence({ timerRef: scrollPersistTimerRef, idleRef: scrollPersistIdleRef }, window); statePersistenceSchedulerRef.current?.cancel?.(); }, []);
  useEffect(() => {
    const flushOnUnload = () => { statePersistenceSchedulerRef.current?.flush?.('beforeunload'); persistCapturedViewScroll('replace', { force: true }); };
    window.addEventListener('beforeunload', flushOnUnload);
    return () => window.removeEventListener('beforeunload', flushOnUnload);
  }, []);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 9000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => { const id = String(state.view?.selectedRecordId || '').trim(); if (state.view?.workspaceVerse !== 'lineage' || !active || !id || lineageLoadReportForSelected(state)) return; const lineage = buildWorkspaceLineageView(activeUi || active, { records: Array.isArray((activeUi || active)?.records) ? (activeUi || active).records : [], query: '', selectedRecordId: id }); const key = `${active.id}:${id}:${(activeUi || active).records?.length || 0}:${lineage.selectedTraversal?.missingEdges?.length || 0}`; if (lineage.selectedTraversal?.hasMissing && !lineageAutoLoadKeysRef.current.has(key)) { lineageAutoLoadKeysRef.current.add(key); window.setTimeout(() => loadFullLineage(), 0); } }, [state]);
  function commit(nextState, mode = 'push', options = {}) {
    commitStateWithPersistence({ nextState, mode, options, sourceState: latestStateRef.current || state, preserveCapturedViewScroll, latestStateRef, setState, runtime, scheduler: statePersistenceSchedulerRef.current });
  }
  function viewScrollKeyFor(sourceState = state, viewOverride = null) {
    return workspaceViewScrollKeyFor(sourceState, viewOverride, active?.id || 'workspace');
  }
  function commitViewPatch(patch = {}, mode = 'replace') {
    const sourceState = latestStateRef.current || state;
    commit(stateWithWorkspaceViewPatch(sourceState, active?.id, patch), mode, { deferPersistence: true, persistenceReason: 'view-patch' });
  }
  function commitViewUpdate(updater = null, mode = 'replace') {
    const sourceState = latestStateRef.current || state;
    commit(stateWithWorkspaceViewUpdate(sourceState, active?.id, updater), mode, { deferPersistence: true, persistenceReason: 'view-update' });
  }
  function preserveCapturedViewScroll(nextState = state, sourceState = state) {
    return stateWithCapturedViewScroll(nextState, sourceState, viewScrollRef.current, active?.id || 'workspace');
  }
  // UI guard: persistCapturedViewScroll('replace') remains the scroll replace-state path.
  function persistCapturedViewScroll(mode = 'replace', options = {}) {
    return persistCapturedScroll({ latestStateRef, state, preserveCapturedViewScroll, runtime, mode, options: Object.assign({ setState }, options), doc: document });
  }
  function noteViewScroll(verse, top) {
    const currentState = latestStateRef.current || state;
    const view = Object.assign({}, currentState.view || {}, { workspaceVerse: verse || currentState.view?.workspaceVerse || 'feed' });
    viewScrollRef.current[viewScrollKeyFor(currentState, view)] = Math.max(0, Math.round(Number(top || 0)));
    scheduleIdleScrollPersist({ timerRef: scrollPersistTimerRef, idleRef: scrollPersistIdleRef }, () => persistCapturedViewScroll('replace', { render: false }), window);
  }
  function currentStageScrollTop() {
    const key = viewScrollKeyFor(state);
    const fromRef = viewScrollRef.current[key];
    if (Number.isFinite(Number(fromRef))) return Number(fromRef);
    return Number(state.view?.scrollPositions?.[key] || 0);
  }
  function openCreate() {
    setCreateError('');
    setSourceContinuationId('');
    setDialog('create-workspace');
  }
  function openAddToWorkspace(sourceId = '') {
    setSourceContinuationId(String(sourceId || ''));
    setDialog('add-to-workspace');
  }
  function openGovernanceBoundary(sourceId = '') {
    const id = String(sourceId || '').trim();
    if (!id) return;
    setSourceContinuationId(id);
    setDialog('source-governance');
  }
  function dismissDialog() {
    setDialog(null);
    setSourceContinuationId('');
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
  function renameWorkspace(name) { const result = runtime().lifecycle?.renameWorkspace?.(state, active?.id, name); if (!result?.ok) return false; setDialog(null); setNotice('Workspace renamed.'); commit(result.state, 'replace'); return true; }
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
  async function addTiinexAppConfig(targetUrl) {
    const resolved = await resolveTiinexAppConfigGithubInput(targetUrl, { fetchImpl: fetch, parseWorkspaceConfig: runtime().config?.parseWorkspaceConfig });
    appConfigDiagnosticsRef.current = { last: { targetUrl, ok: Boolean(resolved?.ok), selectedConvention: resolved?.diagnostics?.selectedConvention || '', selectedPlan: resolved?.selectedPlan || '', input: resolved?.input || null, diagnostics: resolved?.diagnostics || null, message: resolved?.message || '' } };
    if (!resolved?.ok) return setNotice(resolved?.message || 'Could not read Tiinex app config source.');
    setNotice(`Config source found: ${resolved.configUrl || resolved.targetUrl}; ${resolved.diagnostics?.selectedConvention ? `${resolved.diagnostics.selectedConvention}; ` : ''}loading ${resolved.input.repository}${resolved.selectedPlan === 'workspace-discovery' ? ' workspace discovery' : ''}.`);
    await addGitHubSource(resolved.input);
  }
  async function addGitHubSource(input = {}, options = {}) {
    const sourceState = options.state || latestStateRef.current || state;
    const targetWorkspaceId = options.workspaceId || sourceState.activeWorkspaceId || active?.id || '';
    const targetWorkspace = (Array.isArray(sourceState.workspaces) ? sourceState.workspaces : []).find((workspace) => workspace.id === targetWorkspaceId) || active || null;
    if (githubRequestPending && input.abortPreviousGithubOperation !== true) { setNotice('GitHub source operation already in progress.'); return { ok: false, error: 'github.operation.pending', state: sourceState }; }
    if (githubRequestPending && input.abortPreviousGithubOperation === true) try { githubOperationRef.current?.controller?.abort?.(); } catch (_) {}
    const operationToken = Symbol('github-source-operation'); let operationController = null;
    const operationIsCurrent = () => !operationController || githubOperationRef.current?.token === operationToken;
    setGithubRequestPending(true);
    const { repository, existingSource, sourceId, rootPath, ref, label } = githubSourceFormState(input, targetWorkspace?.sources || [], normalizeRepository);
    if (!repository) {
      setNotice('Repo URL or owner/name is required.');
      setGithubRequestPending(false);
      return { ok: false, error: 'github.repository.required', state: sourceState };
    }
    const registerOnly = input.operation === 'register';
    let sourceCacheCleared = 0;
    const transportRefreshTier = normalizeGithubTransportTier(input.transportRefreshTier || input.preferredTransportTier || '');
    const preferredTransports = transportRefreshTier ? githubTransportOrderFromTier(transportRefreshTier) : null;
    const transportLabel = preferredTransports ? preferredTransports.join(' → ') : 'cache → mirror → proxy → direct';
    const fileRefs = Array.isArray(input.fileRefs) ? input.fileRefs : String(input.fileRefs || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const selectedTransportSurfaces = Array.isArray(input.transportRefreshSurfaces) ? input.transportRefreshSurfaces.filter(Boolean) : [];
    const requestedSurfacesForInput = selectedTransportSurfaces.length ? mergeGithubRequestedSurfaces(existingSource?.requestedSurfaces || {}, githubRequestedSurfaces(input, fileRefs), selectedTransportSurfaces) : githubRequestedSurfaces(input, fileRefs);
    const preservedSourceState = registerOnly && existingSource ? { count: Number(existingSource.count || 0), discoveryState: existingSource.discoveryState, surfaces: existingSource.surfaces, transportOutcome: existingSource.transportOutcome, transportPlan: existingSource.transportPlan, transportTiers: existingSource.transportTiers } : {};
    const result = runtime().lifecycle?.addWorkspaceSource?.(sourceState, targetWorkspaceId, Object.assign({
      id: sourceId, kind: input.sourceKind || input.kind || 'github-tree', label, repository, ref, rootPath,
      repoDiscovery: Boolean(input.repoDiscovery), issueDiscovery: Boolean(input.issueDiscovery), issueUrls: input.issueUrls || '',
      workspaceMatch: input.workspaceMatch || '', appConfigPlan: input.appConfigPlan || '', openBehavior: input.openBehavior || '', preferredDisplay: input.preferredDisplay || '',
      transportLabel, transportRefreshTier, requestedSurfaces: requestedSurfacesForInput
    }, preservedSourceState));
    if (!result?.ok) {
      setNotice('Could not add GitHub source.');
      setGithubRequestPending(false);
      return { ok: false, error: result?.error || 'github.source.add.failed', state: sourceState };
    }
    const wantsMaterialization = !registerOnly && Boolean(fileRefs.length || input.repoDiscovery || input.issueDiscovery || input.issueUrls);
    if (wantsMaterialization && typeof AbortController !== 'undefined') { operationController = new AbortController(); githubOperationRef.current = { token: operationToken, controller: operationController }; }
    if (wantsMaterialization && input.resetSourceCache !== false && input.allowSourceCache !== true) sourceCacheCleared = clearGithubSourceTextCacheForSource({ repo: repository });
    let sourceRegistrationState = result.state;
    const cleared = wantsMaterialization && input.resetSourceMaterial !== false ? stateWithSourceMaterialCleared(sourceRegistrationState, targetWorkspaceId, result.source.id, { discoveryState: 'loading', surfaces: selectedTransportSurfaces }) : null;
    if (cleared?.ok) sourceRegistrationState = cleared.state;
    const selectedOperations = [input.repoDiscovery ? 'repo files discovery' : '', fileRefs.length ? 'explicit file loading' : '', input.issueDiscovery || input.issueUrls ? 'issue snapshot loading' : ''].filter(Boolean);
    const operationLabel = selectedOperations.length ? selectedOperations.join(' + ') : 'boundary registration';
    let finalState = sourceRegistrationState;
    let materializationSourceId = result.source.id;
    let materializationSourceLabel = result.source.label;
    let noticeMessage = `${result.source.label} source registered. No loading is running; choose Discover on the source to select repo files, explicit files, or issue snapshots.`;
    const progressCommit = { at: 0, phase: '', percent: -1, label: '' };
    const publishGithubProgress = (progress = {}) => {
      if (!operationIsCurrent()) return { ok: false, error: 'github.operation.stale', state: finalState };
      const progressed = setWorkspaceDiscoveryProgress(finalState, targetWorkspaceId, Object.assign({
        sourceId: materializationSourceId || result.source.id,
        phase: 'source-materialization',
        label: `${materializationSourceLabel} source materialization running`,
        active: true,
        quantified: progress.percent != null
      }, progress));
      if (progressed?.ok) {
        finalState = progressed.state;
        if (shouldCommitGithubProgress(progress, progressCommit)) commit(finalState, 'replace');
      }
    };
    if (!wantsMaterialization) {
      finalState = appendImportSummary(runtime().lifecycle, finalState, {
        schema: 'tiinex.workspace.import.result.v1',
        ok: true,
        message: `${result.source.label}: source boundary registered · no materialization requested.`,
        counts: { records: 0, assets: 0, workspaceEntries: 0, warnings: 0, errors: 0, previewOmitted: 0 },
        warnings: [],
        errors: [],
        diagnostics: { adapterId: 'github', sourceId: result.source.id, operation: 'register-boundary-only', transport: 'none' }
      }, {});
    }
    if (wantsMaterialization) {
      finalState = setWorkspaceDiscoveryProgress(finalState, targetWorkspaceId, {
        sourceId: result.source.id,
        phase: input.repoDiscovery ? 'repo-discovery' : input.issueDiscovery ? 'issue-snapshots' : 'source-materialization',
        label: `${result.source.label} accepted · ${operationLabel} via ${transportLabel} transport`,
        active: true,
        quantified: false,
        discoveryState: 'loading'
      }).state || finalState;
      setDialog(null);
      setNotice(`${result.source.label} source registered; loading started.`);
      commit(finalState, 'push');
      await yieldForVisibleSourceProgress();
      try {
        const transportPolicy = buildSourceTransportPolicy({
          mode: 'cache-mirror-proxy-direct',
          maxRequestsPerOperation: Number(input.maxRequestsPerOperation || 550),
          now: new Date().toISOString(),
          offline: Boolean(input.offline)
        });
        const fetchForOperation = operationController ? (url, init = {}) => fetch(url, Object.assign({}, init || {}, { signal: operationController.signal })) : fetch;
        const out = await materializeGithubSource(result.source, {
          fileRefs,
          repoDiscovery: Boolean(input.repoDiscovery),
          issueDiscovery: Boolean(input.issueDiscovery),
          issueUrls: input.issueUrls || '',
          workspaceMatch: input.workspaceMatch || ''
        }, { fetchImpl: fetchForOperation, abortSignal: operationController?.signal || null, maxFiles: 500, transportPolicy, workspaceConfig, onProgress: publishGithubProgress, preferredTransports: preferredTransports || undefined, transportOrderExact: Boolean(preferredTransports), allowCache: input.allowSourceCache === true, sourceCacheCleared, hostedRepoMirrorBaseUrls: input.hostedRepoMirrorBaseUrls || [], hostedIssueSnapshotBaseUrls: input.hostedIssueSnapshotBaseUrls || [] });
        if (!operationIsCurrent()) return { ok: false, error: 'github.operation.stale', state: finalState };
        const resolvedRef = String(out.diagnostics?.resolvedRef || '').trim();
        if (resolvedRef && !String(result.source.ref || '').trim()) {
          const pinned = runtime().lifecycle?.addWorkspaceSource?.(finalState, targetWorkspaceId, Object.assign({}, result.source, {
            id: materializationSourceId,
            repository: result.source.repo || repository,
            repo: result.source.repo || repository,
            ref: resolvedRef,
            rootPath: result.source.rootPath || rootPath,
            label: result.source.label || label,
            discoveryState: 'deferred',
            repoDiscovery: Boolean(input.repoDiscovery),
            issueDiscovery: Boolean(input.issueDiscovery || input.issueUrls),
            issueUrls: input.issueUrls || '',
            workspaceMatch: input.workspaceMatch || '', appConfigPlan: input.appConfigPlan || '', openBehavior: input.openBehavior || '', preferredDisplay: input.preferredDisplay || '',
            transportRefreshTier,
            requestedSurfaces: requestedSurfacesForInput
          }));
          if (pinned?.ok) {
            finalState = pinned.state;
            materializationSourceId = pinned.source.id;
            materializationSourceLabel = pinned.source.label || materializationSourceLabel;
          }
        }
        if (out.okCount > 0) {
          const ins = runtime().lifecycle?.addWorkspaceSourceRecords?.(finalState, targetWorkspaceId, materializationSourceId, out.records || [], { preserveView: Boolean(input.preserveView) });
          if (ins?.ok) finalState = ins.state;
        }
        await yieldForVisibleSourceProgress();
        const finalWorkspaceForSourceCount = (Array.isArray(finalState?.workspaces) ? finalState.workspaces : []).find((workspace) => workspace.id === targetWorkspaceId) || runtime().lifecycle?.activeWorkspace?.(finalState);
        const totalSourceRecordCount = Array.isArray(finalWorkspaceForSourceCount?.records)
          ? finalWorkspaceForSourceCount.records.filter((record) => record?.source?.id === materializationSourceId).length
          : 0;
        const sourceState = Number(out.okCount || 0) > 0
          ? (Number(out.failCount || 0) > 0 ? 'partial' : 'loaded')
          : (Number(out.failCount || 0) > 0 || (out.errors || []).length ? 'failed' : 'unavailable');
        const updatedSource = runtime().lifecycle?.addWorkspaceSource?.(finalState, targetWorkspaceId, Object.assign({}, result.source, {
          id: materializationSourceId,
          label: materializationSourceLabel,
          repository,
          repo: repository,
          ref: resolvedRef || ref,
          rootPath,
          count: Number(totalSourceRecordCount || out.okCount || 0),
          discoveryState: sourceState,
          repoDiscovery: Boolean(input.repoDiscovery),
          issueDiscovery: Boolean(input.issueDiscovery || input.issueUrls),
          issueUrls: input.issueUrls || '',
          workspaceMatch: input.workspaceMatch || '', appConfigPlan: input.appConfigPlan || '', openBehavior: input.openBehavior || '', preferredDisplay: input.preferredDisplay || '',
          requestedSurfaces: requestedSurfacesForInput,
          surfaces: mergeGithubSurfaceStates(existingSource?.surfaces || result.source?.surfaces || {}, out.diagnostics?.surfaces || {}, selectedTransportSurfaces),
          sourcePlan: out.diagnostics?.sourcePlan || {},
          recordAttribution: out.diagnostics?.recordAttribution || [],
          transportTiers: out.diagnostics?.transportTiers || {},
          transportOutcome: out.diagnostics?.transportOutcome || {},
          transportPlan: out.diagnostics?.transportPlan || {}, governanceBoundary: out.diagnostics?.governanceBoundary || result.source?.governanceBoundary || {},
          transportLabel: out.diagnostics?.transportPlan?.label || transportLabel,
          transportRefreshTier
        }));
        if (updatedSource?.ok) finalState = updatedSource.state;
        finalState = appendImportSummary(runtime().lifecycle, finalState, summarizeGithubAdapterResult(out), {});
        noticeMessage = summarizeGithubMaterialization(materializationSourceLabel, out);
      } catch (e) {
        if (!operationIsCurrent()) return { ok: false, error: 'github.operation.stale', state: finalState };
        console.error(e);
        finalState = setWorkspaceDiscoveryProgress(finalState, targetWorkspaceId, {
          sourceId: result.source.id,
          phase: 'failed',
          label: `${materializationSourceLabel} materialization failed`,
          percent: 100,
          active: false
        }).state || finalState;
        noticeMessage = `${materializationSourceLabel} source registered; source materialization failed.`;
      }
      finalState = clearWorkspaceDiscoveryProgress(finalState, targetWorkspaceId, '').state || finalState;
    }
    if (!operationIsCurrent()) return { ok: false, error: 'github.operation.stale', state: finalState };
    if (operationController && operationIsCurrent()) githubOperationRef.current = { token: null, controller: null };
    setDialog(null);
    setNotice(noticeMessage);
    setGithubRequestPending(false);
    commit(finalState, 'push');
    return { ok: true, state: finalState, sourceId: materializationSourceId };
  }
  async function refreshSourceTransport(sourceId, currentTier = '', surfaceKeys = []) {
    const source = (active?.sources || []).find((item) => String(item.id || '') === String(sourceId || ''));
    if (!source) return setNotice('Source not found.');
    const refresh = sourceTransportRefreshInputForSource(source, currentTier, surfaceKeys);
    if (refresh.replacingPending) { try { githubOperationRef.current?.controller?.abort?.(); } catch (_) {} setGithubRequestPending(false); }
    if (refresh.reason === 'last-tier') return setNotice(`${source.label || 'Source'} is already using the last transport tier (direct).`);
    if (refresh.reason === 'no-surfaces') return openAddToWorkspace(source.id || sourceId);
    clearGithubSourceTextCacheForSource(source);
    const pendingSource = runtime().lifecycle?.addWorkspaceSource?.(state, active?.id, sourceTransportPendingUpdateInputForSource(source, refresh));
    if (pendingSource?.ok) commit(pendingSource.state, 'replace');
    setNotice(`${source.label || 'Source'} trying ${refresh.nextTier} transport.`);
    await addGitHubSource(Object.assign({}, refresh.input, { preserveView: true, resetSourceMaterial: true, resetSourceCache: false, abortPreviousGithubOperation: Boolean(refresh.replacingPending) }));
  }
  function openRecord(recordId) {
    const id = String(recordId || '');
    setRecordAction(null);
    setActiveAssetId('');
    setActiveRecordId(id);
  }
  function focusRecordLineage(recordId) {
    const id = String(recordId || '');
    setRecordAction(null);
    setActiveAssetId('');
    setActiveRecordId('');
    if (!id) return;
    commitViewPatch({
      workspaceVerse: 'lineage',
      selectedRecordId: id,
      lineageQuery: '',
      expandedLineageRecordIds: [],
      lineageAuditReport: null,
      lineageLoadReport: null
    }, 'push');
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
    setDialog(null); setActiveRecordId(''); setActiveAssetId(''); setRecordAction(null);
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
  async function openWorkspaceRecord(record = {}, originWorkspaceId = '') {
    const currentState = latestStateRef.current || state;
    const result = openWorkspaceRecordAction({ lifecycle: runtime().lifecycle, parseWorkspaceConfig: runtime().config?.parseWorkspaceConfig, state: currentState, record });
    if (!result?.ok) return setNotice(result?.message || 'Could not open workspace artifact.');
    setDialog(null); setActiveRecordId(''); setActiveAssetId(''); setRecordAction(null);
    const preparedState = stateWithWorkspaceRecordOpenProgress(result.state, result.workspace?.id, result.sourceInputs || [], result.entry);
    const hasSourcesToLoad = Boolean((result.sourceInputs || []).length);
    setNotice((hasSourcesToLoad ? `Opened workspace artifact ${result.entry?.title || result.entry?.path || ''}; source loading queued.` : `Opened workspace artifact ${result.entry?.title || result.entry?.path || ''}.`).replace(/\s+([;.])/, '$1'));
    commit(preparedState, 'push');
    let materialState = preparedState;
    for (const sourceInput of result.sourceInputs || []) {
      const loaded = await addGitHubSource(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || result.workspace?.id });
      if (loaded?.state) materialState = loaded.state;
    }
  }
  async function mergeWorkspaceRecord(record = {}, originWorkspaceId = '') {
    const currentState = latestStateRef.current || state;
    const result = mergeWorkspaceRecordAction({ lifecycle: runtime().lifecycle, parseWorkspaceConfig: runtime().config?.parseWorkspaceConfig, state: currentState, workspaceId: originWorkspaceId || currentState.activeWorkspaceId || active?.id, record });
    if (!result?.ok) return setNotice(result?.message || 'Could not merge workspace artifact.');
    setNotice(`Merged workspace artifact ${result.entry?.title || result.entry?.path || ''}.`.replace(/\s+\./, '.'));
    commit(result.state, 'push');
    let materialState = result.state;
    for (const sourceInput of result.sourceInputs || []) {
      const loaded = await addGitHubSource(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || result.workspace?.id || active?.id });
      if (loaded?.state) materialState = loaded.state;
    }
  }
  function openRecordAction(record, action, originWorkspaceId = '') {
    if (action?.id === RecordActionKind.workspaceOpen) return openWorkspaceRecord(record, originWorkspaceId);
    if (action?.id === RecordActionKind.workspaceMerge) return mergeWorkspaceRecord(record, originWorkspaceId);
    if (action?.id === RecordActionKind.deleteLocal) return deleteLocalDraftRecord(record, originWorkspaceId);
    setActiveRecordId(''); setActiveAssetId(''); setRecordAction({ recordId: record?.id || '', action });
  }
  function dismissRecordAction() { setRecordAction(null); }

  function deleteLocalDraftRecord(record = {}, originWorkspaceId = '') {
    const currentState = latestStateRef.current || state, workspaceId = originWorkspaceId || currentState.activeWorkspaceId || active?.id, result = runtime().lifecycle?.removeWorkspaceRecord?.(currentState, workspaceId, record?.id || '');
    if (!result?.ok) return setNotice(result?.message || 'Could not remove local draft.');
    setRecordAction(null); if (activeRecordId === record?.id) setActiveRecordId(''); setNotice(`Removed local draft ${record?.title || record?.path || 'artifact'} from this browser session.`); commit(result.state, 'push');
  }
  function createTransitionRecord(parentRecord, draft) {
    if (!draft?.title) return setNotice('Transition draft is missing a title.');
    const uniqueDraft = ensureUniqueTransitionPath(draft, active?.records || []), result = runtime().lifecycle?.addWorkspaceRecord?.(state, active?.id, uniqueDraft);
    if (!result?.ok) return setNotice('Could not create transition leaf.');
    setRecordAction(null);
    setActiveRecordId(''); setNotice(`Created local ${uniqueDraft.kind || 'transition'} leaf from ${parentRecord?.title || 'artifact'}.`);
    commit(result.state, 'push');
  }
  function shareRecord(record) {
    const label = record?.title || 'artifact';
    copyShareUrl();
    setNotice(`Workspace/session share copied for ${label}; route-only viewers preserve boundary and may show material unavailable.`);
  }
  function exportWorkspacePackage() {
    if (!active) {
      setNotice('No workspace to export.');
      return;
    }
    try {
      const bundle = buildExportPackageBundle(active);
      const blob = exportPackageZipBlob(bundle);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportPackageFilename(active, bundle);
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`Export package ${bundle.status}: ${bundle.counts.files} files · ${bundle.counts.materialFiles} material files · no source mutation.`);
    } catch (error) {
      console.error(error);
      setNotice('Could not build export package.');
    }
  }
  function closeSource(sourceId) {
    const source = (active?.sources || []).find((item) => String(item.id || '') === String(sourceId || '')) || null;
    if (source) clearGithubSourceTextCacheForSource(source);
    const result = runtime().lifecycle?.closeWorkspaceSource?.(state, active?.id, sourceId);
    if (!result?.ok) {
      setNotice('Local source stays pinned.');
      return;
    }
    setNotice('Source closed.');
    commit(result.state, 'push');
  }
  function cycleWorkspace(direction) {
    const sourceState = latestStateRef.current || state;
    const workspaces = Array.isArray(sourceState.workspaces) ? sourceState.workspaces : [];
    if (workspaces.length <= 1) return;
    const currentIndex = Math.max(0, workspaces.findIndex((workspace) => workspace.id === sourceState.activeWorkspaceId));
    const offset = direction === 'previous' ? -1 : 1;
    const nextIndex = (currentIndex + offset + workspaces.length) % workspaces.length;
    commit(stateWithActiveWorkspace(sourceState, workspaces[nextIndex]?.id || sourceState.activeWorkspaceId), 'push');
  }
  function activateWorkspace(workspaceId, mode = 'replace') {
    const id = String(workspaceId || '').trim();
    const sourceState = latestStateRef.current || state;
    if (!id || id === sourceState.activeWorkspaceId) return;
    if (!(Array.isArray(sourceState.workspaces) ? sourceState.workspaces : []).some((workspace) => workspace.id === id)) return;
    commit(stateWithActiveWorkspace(sourceState, id), mode, { deferPersistence: true, persistenceReason: 'workspace-activate' });
  }
  function lineageLoadReportForSelected(sourceState = state) {
    const view = sourceState?.view || {};
    const selectedRecordId = String(view.selectedRecordId || '').trim();
    const report = view.lineageLoadReport || null;
    return selectedRecordId && report && String(report.selectedRecordId || '') === selectedRecordId ? report : null;
  }
  function lineageControlsReadyForTraversal(traversal = null) {
    if (!traversal) return false;
    const terminalState = String(traversal.terminalState || traversal.status?.terminalState || '').trim();
    if (['root-reached', 'root-reached-scope-transition', 'no-parent-declared', 'target-unavailable', 'ambiguous-parent', 'integrity-mismatch'].includes(terminalState)) return true;
    return traversal.complete === true;
  }
  async function loadFullLineage() {
    if (!active) return;
    const selectedRecordId = String(state.view?.selectedRecordId || '').trim();
    if (!selectedRecordId) {
      setNotice('Select an artifact lineage before loading lineage.');
      return;
    }
    const recovered = await recoverMissingLineageParentsFromSource({ lifecycle: runtime().lifecycle, state: latestStateRef.current || state, workspace: active, selectedRecordId, fetchImpl: fetch, workspaceConfig });
    const sourceState = recovered.state || latestStateRef.current || state;
    const lineage = recovered.lineage || buildWorkspaceLineageView(active, { records: Array.isArray(active.records) ? active.records : [], query: '', selectedRecordId });
    const recoveredParents = Number(recovered.recoveredParents || 0);
    const traversal = lineage.selectedTraversal || null;
    const nodes = Array.isArray(traversal?.nodes) ? traversal.nodes : [];
    const stateLabel = traversal?.complete ? 'complete' : 'partial';
    const terminalState = traversal?.terminalState || traversal?.status?.terminalState || (stateLabel === 'complete' ? 'complete' : 'partial');
    const scopeTransitions = Array.isArray(traversal?.scopeTransitions) ? traversal.scopeTransitions : [];
    const lineageLoadReport = {
      schema: 'tiinex.workspace.lineageLoadReport.v1', selectedRecordId,
      mode: recoveredParents ? 'source-assisted-loaded-workspace' : 'loaded-workspace',
      state: stateLabel, terminalState, statusLabel: traversal?.status?.label || '', nodes: nodes.length,
      rootReached: Boolean(traversal?.rootReached), noParentDeclared: Boolean(traversal?.noParentDeclared), hasMissing: Boolean(traversal?.hasMissing),
      hasMismatch: Boolean(traversal?.hasMismatch), ambiguous: Boolean(traversal?.ambiguous), depthLimited: Boolean(traversal?.depthLimited), scopeTransitions: scopeTransitions.length, recoveredParents,
      generatedAt: new Date().toISOString()
    };
    setNotice(recoveredParents
      ? `Loaded ${recoveredParents} declared parent artifact${recoveredParents === 1 ? '' : 's'} from the source boundary.`
      : stateLabel === 'complete' ? 'Full loaded-workspace lineage index ready.' : 'Loaded lineage index is partial; terminal root was not proven.');
    commit(stateWithViewPatch(sourceState, { lineageQuery: '', lineageLoadReport, lineageAuditReport: null }), recoveredParents ? 'push' : 'replace');
  }
  function runLineageAudit() {
    if (!active) return;
    const selectedRecordId = String(state.view?.selectedRecordId || '').trim();
    const records = Array.isArray(active.records) ? active.records : [];
    if (!selectedRecordId) {
      setNotice('Select an artifact lineage before running Audit.');
      return;
    }
    const lineage = buildWorkspaceLineageView(active, { records, query: state.view?.lineageQuery || '', selectedRecordId });
    const existingLoadReport = lineageLoadReportForSelected(state);
    if (!existingLoadReport && !lineageControlsReadyForTraversal(lineage.selectedTraversal)) {
      setNotice('Load full lineage before running Audit.');
      return;
    }
    const audit = buildWorkspaceAuditView(active, { records, query: '' });
    const auditById = new Map((audit.items || []).map((item) => [item.id, item]));
    const traversalNodes = Array.isArray(lineage.selectedTraversal?.nodes) && lineage.selectedTraversal.nodes.length
      ? lineage.selectedTraversal.nodes
      : records.filter((record) => record.id === selectedRecordId).map((record) => ({ id: record.id, record }));
    const counts = { ok: 0, mismatch: 0, open: 0, pending: 0 };
    for (const node of traversalNodes) {
      const id = String(node.id || node.record?.id || '');
      const item = auditById.get(id);
      const status = String(item?.status || '').toLowerCase();
      if (status === 'readable' && !item?.fallbackUsed) counts.ok += 1;
      else if (status === 'pending-unavailable') counts.pending += 1;
      else if (status === 'readable' || status === 'degraded' || item?.fallbackUsed || !status) counts.open += 1;
      else counts.mismatch += 1;
    }
    const loadReport = existingLoadReport || {
      selectedRecordId,
      state: lineage.selectedTraversal?.complete ? 'complete' : 'partial',
      terminalState: lineage.selectedTraversal?.terminalState || lineage.selectedTraversal?.status?.terminalState || '',
      rootReached: Boolean(lineage.selectedTraversal?.rootReached),
      noParentDeclared: Boolean(lineage.selectedTraversal?.noParentDeclared),
      hasMissing: Boolean(lineage.selectedTraversal?.hasMissing),
      hasMismatch: Boolean(lineage.selectedTraversal?.hasMismatch),
      ambiguous: Boolean(lineage.selectedTraversal?.ambiguous),
      depthLimited: Boolean(lineage.selectedTraversal?.depthLimited),
      scopeTransitions: Array.isArray(lineage.selectedTraversal?.scopeTransitions) ? lineage.selectedTraversal.scopeTransitions.length : 0
    };
    const auditState = loadReport?.state === 'complete' && lineage.selectedTraversal?.complete ? 'complete' : 'partial';
    const sourceState = latestStateRef.current || state;
    const lineageAuditReport = {
        schema: 'tiinex.workspace.lineageAuditInline.v1',
        selectedRecordId,
        state: auditState,
        terminalState: lineage.selectedTraversal?.terminalState || loadReport?.terminalState || '',
        statusLabel: lineage.selectedTraversal?.status?.label || loadReport?.statusLabel || '',
        nodes: traversalNodes.length,
        rootReached: Boolean(lineage.selectedTraversal?.rootReached),
        noParentDeclared: Boolean(lineage.selectedTraversal?.noParentDeclared),
        hasMissing: Boolean(lineage.selectedTraversal?.hasMissing),
        scopeTransitions: Array.isArray(lineage.selectedTraversal?.scopeTransitions) ? lineage.selectedTraversal.scopeTransitions.length : Number(loadReport?.scopeTransitions || 0),
        counts,
        generatedAt: new Date().toISOString()
      };
    commit(stateWithViewPatch(sourceState, { lineageAuditReport }), 'replace');
  }
  function setVerse(verse) {
    const normalizedVerse = verse === 'tree' || verse === 'lineage' ? verse : 'feed';
    const resetLineage = normalizedVerse === 'feed' || normalizedVerse === 'tree';
    commitViewPatch(Object.assign({
      workspaceVerse: normalizedVerse
    }, resetLineage ? {
      selectedRecordId: '',
      expandedLineageRecordIds: [],
      lineageAuditReport: null,
      lineageLoadReport: null
    } : {}), 'push');
  }
  function toggleLineageCard(recordId) {
    const id = String(recordId || '').trim();
    if (!id) return;
    commitViewUpdate((currentView) => {
      const current = new Set(Array.isArray(currentView.expandedLineageRecordIds) ? currentView.expandedLineageRecordIds : []);
      if (current.has(id)) current.delete(id);
      else current.add(id);
      return Object.assign({}, currentView, { expandedLineageRecordIds: Array.from(current) });
    }, 'replace');
  }
  function setQuery(query) {
    commitViewUpdate((currentView) => {
      const verse = currentView.workspaceVerse || 'feed';
      return verse === 'lineage'
        ? Object.assign({}, currentView, { lineageQuery: query })
        : Object.assign({}, currentView, { query });
    }, 'replace');
  }
  function setDisplayOptions(options) {
    setDialog(null);
    commitViewPatch({ displayOptions: normalizeWorkspaceDisplayOptions(options) }, 'replace');
  }
  function toggleTreeFolder(folderPath, open) {
    const path = String(folderPath || '').trim();
    if (!path) return;
    commitViewUpdate((currentView) => {
      const existing = new Set(Array.isArray(currentView.expandedTreeFolders) ? currentView.expandedTreeFolders : []);
      if (open) existing.add(path);
      else existing.delete(path);
      return Object.assign({}, currentView, { expandedTreeFolders: Array.from(existing).sort() });
    }, 'replace');
  }
  function exportPackageFilename(workspace = {}, bundle = {}) {
    const slug = String(workspace.title || workspace.name || workspace.id || 'workspace').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'workspace';
    const stamp = String(bundle.builtAt || new Date().toISOString()).replace(/[^0-9]/g, '').slice(0, 14) || 'session';
    return `tiinex-${slug}-${stamp}.zip`;
  }
  function copyShareUrl() {
    statePersistenceSchedulerRef.current?.flush?.('share-url');
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
  const activeRecord = activeRecordId && activeUi?.records ? hydrateUiRecord(activeUi.records.find((record) => record.id === activeRecordId)) : null;
  const activeAsset = activeAssetId && activeUi?.assets ? activeUi.assets.find((asset) => asset.id === activeAssetId || asset.path === activeAssetId) : null;
  const actionRecord = recordAction?.recordId && activeUi?.records ? hydrateUiRecord(activeUi.records.find((record) => record.id === recordAction.recordId)) : null;
  const governanceDialogSource = dialog === 'source-governance' && activeUi?.sources
    ? activeUi.sources.find((source) => source.id === sourceContinuationId) || null
    : null;
  const governanceDialogData = governanceDialogSource ? sourceGovernanceDialogData(governanceDialogSource, activeUi) : null;
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
    <main className={shellClasses} data-runtime={TIINEX_RUNTIME_ID} data-source-boundary={CLEAN_URL_BOUNDARY} data-uc="UC-001-empty-create-local-workspace-add-flow" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (!active && event.dataTransfer) { event.preventDefault(); addLocalFiles(event.dataTransfer, { sourceMode: 'stage-drop', fromDataTransfer: true }); } }}>
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
        <div className={visibleWorkspaceItems.length > 1 ? 'tx-workspace-multicolumn-stage' : 'tx-workspace-single-stage'} data-workspace-columns={visibleWorkspaceItems.length} style={{ '--tx-visible-workspace-columns': visibleWorkspaceItems.length }}>
          {visibleWorkspaceItems.map(({ workspace, ui, active: itemActive, surfaceState }) => (
            <div key={workspace.id} className={`tx-workspace-frame ${itemActive ? 'tx-workspace-frame-active' : 'tx-workspace-frame-inactive'}`} onMouseDownCapture={() => { if (!itemActive) activateWorkspace(workspace.id); }}>
              <WorkspaceColumnSurface
                workspace={ui || workspace}
                state={surfaceState || state}
                onClose={itemActive ? () => setDialog('close-workspace') : undefined}
                onRenameWorkspace={itemActive ? () => setDialog('rename-workspace') : undefined}
                onVerse={itemActive ? setVerse : undefined}
                onQuery={itemActive ? setQuery : undefined}
                onOpenDisplayOptions={itemActive ? () => setDialog('display-options') : undefined}
                onOpenAddDialog={itemActive ? openAddToWorkspace : undefined}
                onExportWorkspace={itemActive ? exportWorkspacePackage : undefined} /* onExportWorkspace={exportWorkspacePackage} */
                onCloseSource={itemActive ? closeSource : undefined}
                onDropFiles={itemActive ? addLocalFiles : undefined}
                onOpenRecord={itemActive ? openRecord : undefined}
                onFocusRecordLineage={itemActive ? focusRecordLineage : undefined}
                onOpenAsset={itemActive ? openAsset : undefined}
                onOpenWorkspaceCandidate={itemActive ? openWorkspaceCandidate : undefined}
                onMergeWorkspaceCandidate={itemActive ? mergeWorkspaceCandidate : undefined}
                onShareRecord={itemActive ? shareRecord : undefined}
                onRecordAction={(record, action) => openRecordAction(record, action, workspace.id)}
                onToggleTreeFolder={itemActive ? toggleTreeFolder : undefined}
                onSourceTransportRefresh={itemActive ? refreshSourceTransport : undefined}
                onOpenGovernance={itemActive ? openGovernanceBoundary : undefined}
                onViewScroll={itemActive ? noteViewScroll : undefined}
                stageScrollTop={itemActive ? currentStageScrollTop() : 0}
                expandedLineageRecordIds={itemActive ? ((surfaceState || state).view?.expandedLineageRecordIds || []) : []}
                lineageAuditReport={itemActive ? ((surfaceState || state).view?.lineageAuditReport || null) : null}
                lineageLoadReport={itemActive ? ((surfaceState || state).view?.lineageLoadReport || null) : null}
                onToggleLineageCard={itemActive ? toggleLineageCard : undefined}
                onRunLineageAudit={itemActive ? runLineageAudit : undefined}
                onLoadFullLineage={itemActive ? loadFullLineage : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyStage workspaceConfig={workspaceConfig} />
      )}
      {notice ? <div className="tx-toast" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div> : null}
      <footer className="tx-footer" translate="no" title="Powered by Tiinex">Powered by <a href="https://github.com/Tiinex" target="_blank" rel="noopener noreferrer">Tiinex</a></footer>
      {dialog === 'create-workspace' ? <CreateWorkspaceDialog error={createError} onSubmit={createWorkspace} onDismiss={dismissDialog} /> : null}
      {dialog === 'rename-workspace' && active ? <RenameWorkspaceDialog workspace={activeUi || active} onSubmit={renameWorkspace} onDismiss={dismissDialog} /> : null}
      {dialog === 'close-workspace' && active ? <CloseWorkspaceDialog workspace={activeUi || active} onDismiss={dismissDialog} onConfirm={() => closeWorkspace(active.id)} /> : null}
      {activeRecord ? <RecordDetailDialog record={activeRecord} onDismiss={dismissRecord} onShare={() => shareRecord(activeRecord)} /> : null}
      {activeAsset ? <AssetDetailDialog asset={activeAsset} onDismiss={dismissAsset} /> : null}
      {actionRecord ? <RecordActionDialog record={actionRecord} action={recordAction.action} schemaRegistry={schemaRegistry} workspaceRecords={active?.records || []} onDismiss={dismissRecordAction} onShare={() => shareRecord(actionRecord)} onCreateTransition={createTransitionRecord} /> : null}
      {dialog === 'display-options' && active ? <DisplayOptionsDialog options={state.view?.displayOptions} counts={buildDisplayOptionCounts(activeUi || active)} scope={state.view?.workspaceVerse === 'lineage' ? 'lineage' : 'discovery'} onSubmit={setDisplayOptions} onDismiss={dismissDialog} /> : null}
      {dialog === 'add-to-workspace' && active ? (
        <AddToWorkspaceDialog
          workspace={activeUi || active}
          workspaceConfig={workspaceConfig}
          sourceContinuation={(activeUi || active).sources?.find((source) => source.id === sourceContinuationId) || null}
          onDismiss={dismissDialog}
          onAddFiles={addLocalFiles}
          onAddGitHubSource={addGitHubSource}
          onAddUrls={addExplicitUrls}
          onAddTiinexAppConfig={addTiinexAppConfig}
          githubBusy={githubRequestPending}
        />
      ) : null}
      {governanceDialogSource && governanceDialogData ? <GovernanceBoundaryDialog source={governanceDialogSource} boundary={governanceDialogData.boundary} documents={governanceDialogData.documents} onDismiss={dismissDialog} /> : null}
      {dialog === 'help' ? <HelpDialog workspaceConfig={workspaceConfig} onDismiss={dismissDialog} /> : null}
    </main>
  );
}
