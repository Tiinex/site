import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EmptyStage, GlobalDock, HelpDialog } from './appShell.views.jsx';
import { activeWorkspace, CLEAN_URL_BOUNDARY, defaultState, initialState, runtime } from './runtimeState.js';
import { shouldPageWorkspaces, useViewportWidth } from './viewport.js';
import { summarizeGithubAdapterResult, summarizeGithubMaterialization, normalizeRepository } from './githubMaterializationSummary.js';
import { buildDisplayOptionCounts } from './workspaceDisplayCounts.js';
import { hydrateUiRecord } from './recordUi.js';
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
import { buildExportPackageBundle } from '../export/package.builder.js';
import { exportPackageZipBlob } from '../export/package.zip.js';
import { buildWorkspaceAuditView } from '../workspaces/workspace.auditView.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { mergeWorkspaceCandidate as mergeStagedWorkspaceCandidate, openWorkspaceCandidate as openStagedWorkspaceCandidate } from '../workspaces/workspace.candidates.js';
import {
  AssetDetailDialog,
  CloseWorkspaceDialog,
  CreateWorkspaceDialog,
  RecordActionDialog,
  RecordDetailDialog,
  WorkspaceColumnSurface
} from '../schemas/workspace/workspace.views.jsx';
import { normalizeWorkspaceDisplayOptions } from '../workspaces/workspace.displayOptions.js';
import { AddToWorkspaceDialog } from '../schemas/workspace/workspace.add.views.jsx';
import { DisplayOptionsDialog } from '../schemas/workspace/workspace.displayOptions.views.jsx';
import { schemaRegistry } from '../schemas/registry.js';
import { workspaceViewScrollKeyFor, stateWithViewPatch, stateWithViewUpdate, stateWithCapturedViewScroll } from './viewState.js';
import { shouldCommitGithubProgress, yieldForVisibleSourceProgress } from './githubProgress.js';

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
  const viewScrollRef = useRef({});
  const latestStateRef = useRef(state);
  const lineageAutoLoadKeysRef = useRef(new Set());
  const scrollPersistTimerRef = useRef(null);
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

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => () => {
    if (scrollPersistTimerRef.current) window.clearTimeout(scrollPersistTimerRef.current);
  }, []);

  useEffect(() => {
    const flushOnUnload = () => persistCapturedViewScroll('replace');
    window.addEventListener('beforeunload', flushOnUnload);
    return () => window.removeEventListener('beforeunload', flushOnUnload);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 9000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => { const id = String(state.view?.selectedRecordId || '').trim(); if (state.view?.workspaceVerse !== 'lineage' || !active || !id || lineageLoadReportForSelected(state)) return; const lineage = buildWorkspaceLineageView(active, { records: Array.isArray(active.records) ? active.records : [], query: '', selectedRecordId: id }); const key = `${active.id}:${id}:${active.records?.length || 0}:${lineage.selectedTraversal?.missingEdges?.length || 0}`; if (lineage.selectedTraversal?.hasMissing && !lineageAutoLoadKeysRef.current.has(key)) { lineageAutoLoadKeysRef.current.add(key); window.setTimeout(() => loadFullLineage(), 0); } }, [state]);

  function commit(nextState, mode = 'push') {
    const sourceState = latestStateRef.current || state;
    const withScroll = preserveCapturedViewScroll(nextState, sourceState);
    latestStateRef.current = withScroll;
    setState(withScroll);
    if (withScroll?.workspaces?.length) runtime().persistence?.writeState?.(withScroll, { mode });
    else runtime().persistence?.clearState?.({ mode });
  }

  function viewScrollKeyFor(sourceState = state, viewOverride = null) {
    return workspaceViewScrollKeyFor(sourceState, viewOverride, active?.id || 'workspace');
  }

  function commitViewPatch(patch = {}, mode = 'replace') {
    const sourceState = latestStateRef.current || state;
    commit(stateWithViewPatch(sourceState, patch), mode);
  }

  function commitViewUpdate(updater = null, mode = 'replace') {
    const sourceState = latestStateRef.current || state;
    commit(stateWithViewUpdate(sourceState, updater), mode);
  }

  function preserveCapturedViewScroll(nextState = state, sourceState = state) {
    return stateWithCapturedViewScroll(nextState, sourceState, viewScrollRef.current, active?.id || 'workspace');
  }

  function persistCapturedViewScroll(mode = 'replace') {
    const base = latestStateRef.current || state;
    const withScroll = preserveCapturedViewScroll(base, base);
    if (withScroll === base) return;
    latestStateRef.current = withScroll;
    setState(withScroll);
    if (withScroll?.workspaces?.length) runtime().persistence?.writeState?.(withScroll, { mode });
  }

  function noteViewScroll(verse, top) {
    const currentState = latestStateRef.current || state;
    const view = Object.assign({}, currentState.view || {}, { workspaceVerse: verse || currentState.view?.workspaceVerse || 'feed' });
    viewScrollRef.current[viewScrollKeyFor(currentState, view)] = Math.max(0, Math.round(Number(top || 0)));
    if (scrollPersistTimerRef.current) window.clearTimeout(scrollPersistTimerRef.current);
    scrollPersistTimerRef.current = window.setTimeout(() => {
      scrollPersistTimerRef.current = null;
      persistCapturedViewScroll('replace');
    }, 220);
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

  async function addGitHubSource(input = {}) {
    if (githubRequestPending) {
      setNotice('GitHub source operation already in progress.');
      return;
    }
    setGithubRequestPending(true);
    const { repository, existingSource, sourceId, rootPath, ref, label } = githubSourceFormState(input, active?.sources || [], normalizeRepository);
    if (!repository) {
      setNotice('Repo URL or owner/name is required.');
      setGithubRequestPending(false);
      return;
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
    const result = runtime().lifecycle?.addWorkspaceSource?.(state, active?.id, Object.assign({
      id: sourceId, kind: input.sourceKind || input.kind || 'github-tree', label, repository, ref, rootPath,
      repoDiscovery: Boolean(input.repoDiscovery), issueDiscovery: Boolean(input.issueDiscovery), issueUrls: input.issueUrls || '',
      transportLabel, transportRefreshTier, requestedSurfaces: requestedSurfacesForInput
    }, preservedSourceState));
    if (!result?.ok) {
      setNotice('Could not add GitHub source.');
      setGithubRequestPending(false);
      return;
    }
    const wantsMaterialization = !registerOnly && Boolean(fileRefs.length || input.repoDiscovery || input.issueDiscovery || input.issueUrls);
    if (wantsMaterialization && input.resetSourceCache !== false && input.allowSourceCache !== true) sourceCacheCleared = clearGithubSourceTextCacheForSource({ repo: repository });
    let sourceRegistrationState = result.state;
    const cleared = wantsMaterialization && input.resetSourceMaterial !== false ? stateWithSourceMaterialCleared(sourceRegistrationState, active?.id, result.source.id, { discoveryState: 'loading', surfaces: selectedTransportSurfaces }) : null;
    if (cleared?.ok) sourceRegistrationState = cleared.state;
    const selectedOperations = [input.repoDiscovery ? 'repo files discovery' : '', fileRefs.length ? 'explicit file loading' : '', input.issueDiscovery || input.issueUrls ? 'issue snapshot loading' : ''].filter(Boolean);
    const operationLabel = selectedOperations.length ? selectedOperations.join(' + ') : 'boundary registration';
    let finalState = sourceRegistrationState;
    let materializationSourceId = result.source.id;
    let materializationSourceLabel = result.source.label;
    let noticeMessage = `${result.source.label} source registered. No loading is running; choose Discover on the source to select repo files, explicit files, or issue snapshots.`;
    const progressCommit = { at: 0, phase: '', percent: -1, label: '' };
    const publishGithubProgress = (progress = {}) => {
      const progressed = setWorkspaceDiscoveryProgress(finalState, active?.id, Object.assign({
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
      finalState = setWorkspaceDiscoveryProgress(finalState, active?.id, {
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
        const out = await materializeGithubSource(result.source, {
          fileRefs,
          repoDiscovery: Boolean(input.repoDiscovery),
          issueDiscovery: Boolean(input.issueDiscovery),
          issueUrls: input.issueUrls || ''
        }, { fetchImpl: fetch, maxFiles: 500, transportPolicy, workspaceConfig, onProgress: publishGithubProgress, preferredTransports: preferredTransports || undefined, transportOrderExact: Boolean(preferredTransports), allowCache: input.allowSourceCache !== false, sourceCacheCleared });
        const resolvedRef = String(out.diagnostics?.resolvedRef || '').trim();
        if (resolvedRef && !String(result.source.ref || '').trim()) {
          const pinned = runtime().lifecycle?.addWorkspaceSource?.(finalState, active?.id, Object.assign({}, result.source, {
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
          const ins = runtime().lifecycle?.addWorkspaceSourceRecords?.(finalState, active?.id, materializationSourceId, out.records || [], { preserveView: Boolean(input.preserveView) });
          if (ins?.ok) finalState = ins.state;
        }
        await yieldForVisibleSourceProgress();
        const finalWorkspaceForSourceCount = runtime().lifecycle?.activeWorkspace?.(finalState);
        const totalSourceRecordCount = Array.isArray(finalWorkspaceForSourceCount?.records)
          ? finalWorkspaceForSourceCount.records.filter((record) => record?.source?.id === materializationSourceId).length
          : 0;
        const sourceState = Number(out.okCount || 0) > 0
          ? (Number(out.failCount || 0) > 0 ? 'partial' : 'loaded')
          : (Number(out.failCount || 0) > 0 || (out.errors || []).length ? 'failed' : 'unavailable');
        const updatedSource = runtime().lifecycle?.addWorkspaceSource?.(finalState, active?.id, Object.assign({}, result.source, {
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
          requestedSurfaces: requestedSurfacesForInput,
          surfaces: mergeGithubSurfaceStates(existingSource?.surfaces || result.source?.surfaces || {}, out.diagnostics?.surfaces || {}, selectedTransportSurfaces),
          sourcePlan: out.diagnostics?.sourcePlan || {},
          recordAttribution: out.diagnostics?.recordAttribution || [],
          transportTiers: out.diagnostics?.transportTiers || {},
          transportOutcome: out.diagnostics?.transportOutcome || {},
          transportPlan: out.diagnostics?.transportPlan || {},
          transportLabel: out.diagnostics?.transportPlan?.label || transportLabel,
          transportRefreshTier
        }));
        if (updatedSource?.ok) finalState = updatedSource.state;
        finalState = appendImportSummary(runtime().lifecycle, finalState, summarizeGithubAdapterResult(out), {});
        noticeMessage = summarizeGithubMaterialization(materializationSourceLabel, out);
      } catch (e) {
        console.error(e);
        finalState = setWorkspaceDiscoveryProgress(finalState, active?.id, {
          sourceId: result.source.id,
          phase: 'failed',
          label: `${materializationSourceLabel} materialization failed`,
          percent: 100,
          active: false
        }).state || finalState;
        noticeMessage = `${materializationSourceLabel} source registered; source materialization failed.`;
      }
      finalState = clearWorkspaceDiscoveryProgress(finalState, active?.id, '').state || finalState;
    }

    setDialog(null);
    setNotice(noticeMessage);
    setGithubRequestPending(false);
    commit(finalState, 'push');
  }

  async function refreshSourceTransport(sourceId, currentTier = '', surfaceKeys = []) {
    const source = (active?.sources || []).find((item) => String(item.id || '') === String(sourceId || ''));
    if (!source) return setNotice('Source not found.');
    const refresh = sourceTransportRefreshInputForSource(source, currentTier, surfaceKeys);
    if (refresh.reason === 'pending') return setNotice(`${source.label || 'Source'} is already trying ${refresh.pendingTier} transport.`);
    if (refresh.reason === 'last-tier') return setNotice(`${source.label || 'Source'} is already using the last transport tier (direct).`);
    if (refresh.reason === 'no-surfaces') return openAddToWorkspace(source.id || sourceId);
    clearGithubSourceTextCacheForSource(source);
    const pendingSource = runtime().lifecycle?.addWorkspaceSource?.(state, active?.id, sourceTransportPendingUpdateInputForSource(source, refresh));
    if (pendingSource?.ok) commit(pendingSource.state, 'replace');
    setNotice(`${source.label || 'Source'} trying ${refresh.nextTier} transport.`);
    await addGitHubSource(Object.assign({}, refresh.input, { preserveView: true, resetSourceMaterial: true, resetSourceCache: false }));
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
    commit(Object.assign({}, sourceState, { activeWorkspaceId: workspaces[nextIndex]?.id || sourceState.activeWorkspaceId }), 'push');
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

  const activeRecord = activeRecordId && active?.records ? hydrateUiRecord(active.records.find((record) => record.id === activeRecordId)) : null;
  const activeAsset = activeAssetId && active?.assets ? active.assets.find((asset) => asset.id === activeAssetId || asset.path === activeAssetId) : null;
  const actionRecord = recordAction?.recordId && active?.records ? hydrateUiRecord(active.records.find((record) => record.id === recordAction.recordId)) : null;

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
    <main className={shellClasses} data-runtime="react-v189-lineage-viewer-readability" data-source-boundary={CLEAN_URL_BOUNDARY} data-uc="UC-001-empty-create-local-workspace-add-flow" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (!active && event.dataTransfer) { event.preventDefault(); addLocalFiles(event.dataTransfer, { sourceMode: 'stage-drop', fromDataTransfer: true }); } }}>
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
          onRenameWorkspace={() => setDialog('rename-workspace')}
          onVerse={setVerse}
          onQuery={setQuery}
          onOpenDisplayOptions={() => setDialog('display-options')}
          onOpenAddDialog={openAddToWorkspace}
          onExportWorkspace={exportWorkspacePackage}
          onCloseSource={closeSource}
          onDropFiles={addLocalFiles}
          onOpenRecord={openRecord}
          onFocusRecordLineage={focusRecordLineage}
          onOpenAsset={openAsset}
          onOpenWorkspaceCandidate={openWorkspaceCandidate}
          onMergeWorkspaceCandidate={mergeWorkspaceCandidate}
          onShareRecord={shareRecord}
          onRecordAction={openRecordAction}
          onToggleTreeFolder={toggleTreeFolder}
          onSourceTransportRefresh={refreshSourceTransport}
          onViewScroll={noteViewScroll}
          stageScrollTop={currentStageScrollTop()}
          expandedLineageRecordIds={state.view?.expandedLineageRecordIds || []}
          lineageAuditReport={state.view?.lineageAuditReport || null}
          lineageLoadReport={state.view?.lineageLoadReport || null}
          onToggleLineageCard={toggleLineageCard}
          onRunLineageAudit={runLineageAudit}
          onLoadFullLineage={loadFullLineage}
        />
      ) : (
        <EmptyStage workspaceConfig={workspaceConfig} />
      )}

      {notice ? <div className="tx-toast" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div> : null}
      <footer className="tx-footer" translate="no" title="Powered by Tiinex">Powered by <a href="https://github.com/Tiinex" target="_blank" rel="noopener noreferrer">Tiinex</a></footer>

      {dialog === 'create-workspace' ? <CreateWorkspaceDialog error={createError} onSubmit={createWorkspace} onDismiss={dismissDialog} /> : null}
      {dialog === 'rename-workspace' && active ? <RenameWorkspaceDialog workspace={active} onSubmit={renameWorkspace} onDismiss={dismissDialog} /> : null}
      {dialog === 'close-workspace' && active ? <CloseWorkspaceDialog workspace={active} onDismiss={dismissDialog} onConfirm={() => closeWorkspace(active.id)} /> : null}
      {activeRecord ? <RecordDetailDialog record={activeRecord} onDismiss={dismissRecord} onShare={() => shareRecord(activeRecord)} /> : null}
      {activeAsset ? <AssetDetailDialog asset={activeAsset} onDismiss={dismissAsset} /> : null}
      {actionRecord ? <RecordActionDialog record={actionRecord} action={recordAction.action} schemaRegistry={schemaRegistry} onDismiss={dismissRecordAction} onShare={() => shareRecord(actionRecord)} onCreateTransition={createTransitionRecord} /> : null}
      {dialog === 'display-options' && active ? (
        <DisplayOptionsDialog
          options={state.view?.displayOptions}
          counts={buildDisplayOptionCounts(active)}
          scope={state.view?.workspaceVerse === 'lineage' ? 'lineage' : 'discovery'}
          onSubmit={setDisplayOptions}
          onDismiss={dismissDialog}
        />
      ) : null}
      {dialog === 'add-to-workspace' && active ? (
        <AddToWorkspaceDialog
          workspace={active}
          workspaceConfig={workspaceConfig}
          sourceContinuation={active.sources?.find((source) => source.id === sourceContinuationId) || null}
          onDismiss={dismissDialog}
          onAddFiles={addLocalFiles}
          onAddGitHubSource={addGitHubSource}
          onAddUrls={addExplicitUrls}
          githubBusy={githubRequestPending}
        />
      ) : null}
      {dialog === 'help' ? <HelpDialog workspaceConfig={workspaceConfig} onDismiss={dismissDialog} /> : null}
    </main>
  );
}

