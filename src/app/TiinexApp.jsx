import { runWorkspaceStartupTransition } from './workspaceStartupTransition.js';
import { workspaceHomeHref } from './workspaceHomeTarget.js';
import { canonicalProductState } from './productStateBoundary.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EmptyStage, GlobalDock, HelpDialog } from './appShell.views.jsx';
import { activeWorkspace, CLEAN_URL_BOUNDARY, defaultState, initialRuntimeSnapshot, runtime } from './runtimeState.js';
import { initialStartupRenderPhase, shouldRenderProductStage } from './startupRenderPhase.js';
import { startupPresentationFor } from './startupPresentation.js';
import { StartupStage } from './startupPresentation.views.jsx';
import { createStartupOwnershipGate, runOwnedWorkspaceStartupTransition } from './startupOwnership.js';
import { shouldPageWorkspaces, useViewportWidth } from './viewport.js';
import { buildDisplayOptionCounts } from './workspaceDisplayCounts.js';
import { hydrateUiRecord, hydrateUiWorkspace } from './recordUi.js';
import { activeWorkspaceViewFor, stateWithWorkspaceLayoutMode, stateWithWorkspaceViewPatch, visibleWorkspaceItemsFor } from './workspaceMulticolumn.js';
import { sourceTransportPendingUpdateInputForSource, sourceTransportRefreshInputForSource } from './sourceTransportRefresh.js';
import { sourceGovernanceDialogData } from './governanceDialogData.js';
import { AssetDetailDialog, CloseWorkspaceDialog, CreateWorkspaceDialog, RenameWorkspaceDialog, RecordActionDialog, RecordDetailDialog, GovernanceBoundaryDialog, WorkspaceCanonicalCreateDialog, WorkspaceColumnSurface } from '../schemas/workspace/workspace.views.jsx';
import { normalizeWorkspaceDisplayOptions } from '../workspaces/workspace.displayOptions.js';
import { AddToWorkspaceDialog, ImportConflictDialog } from '../schemas/workspace/workspace.add.views.jsx';
import { DisplayOptionsDialog } from '../schemas/workspace/workspace.displayOptions.views.jsx';
import { WorkspaceExportDialogController } from '../schemas/workspace/workspace.exportDialog.controller.jsx';
import { stateWithWorkspacePublicationReceipt } from '../workspaces/workspace.publicationReceipts.js';
import { WorkspaceEntrypointChoiceDialog } from '../schemas/workspace/workspace.entrypointChoice.views.jsx';
import { schemaRegistry } from '../schemas/registry.js';
import { workspaceViewScrollKeyFor, stateWithCapturedViewScroll } from './viewState.js';
import { TIINEX_RUNTIME_ID } from '../build.identity.js';
import { installVisualDormancy, visualDormancySummary } from './visualDormancy.js';
import { clearScheduledScrollPersistence, persistCapturedScroll, scheduleIdleScrollPersist } from './scrollPersistence.js';
import { commitStateWithPersistence, createStatePersistenceScheduler } from './statePersistenceScheduler.js';
import { createPersistenceOwnershipPolicy, DurableLocalAuthority } from './persistenceOwnership.js';
import { durableLocalAuthorityForRoute, markCurrentHistoryDurableAuthority } from './historyAuthority.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';
import { runLocalDraftDiscardCommand, runLocalDraftUpdateCommand } from './localDraftMutationCommand.js';
import { useWorkspaceSelectionProductController } from './useWorkspaceSelectionProductController.jsx';
import { createCanonicalCreationProductController } from './canonicalCreationProductController.js';
import { useCanonicalReferenceSelectionOptions } from './useCanonicalReferenceSelectionOptions.js';
import { useCanonicalPlacementSelectionOptions } from './useCanonicalPlacementSelectionOptions.js';
import { captureWorkspaceSelectionOriginContext, restoreWorkspaceSelectionOriginContext } from './workspaceSelectionOriginContext.js';
import { transitionProductActionsForWorkspace } from '../transitions/transition.productPresentation.browser.js';
import { RecordActionKind } from '../actions/record.actions.js';
import { ensureUniqueTransitionPath } from '../transitions/record.transitions.js';
import { mergeWorkspaceRecordAction, openWorkspaceRecordAction } from './workspaceRecordActions.js';
import { stateWithWorkspaceRecordOpenProgress } from './workspaceOpenProgress.js';
import { workspaceRecordMergedNotice, workspaceRecordOpenedNotice } from './workspaceContinuityNotices.js';
import { lineageLoadReportForSelectedView, loadFullLineageCommand, runLineageAuditCommand, shouldAutoLoadLineage } from './lineageCommand.js';
import { useLocalMaterialIntake } from './useLocalMaterialIntake.js';
import { useWorkspaceEntrypointIntake } from './useWorkspaceEntrypointIntake.js';
import { executeWorkspaceExportCommand } from './workspaceExportExecutionCommand.js';
import { openSchemaForRecordCommand } from './schemaNavigationCommand.js';
import { loadViewerSchemaMarkdown } from './schemaNavigationRuntimeCatalog.js';
import { abortGithubSourceOperation, clearGithubSourceCacheForSource, runGithubSourceOperation } from './githubSourceOperation.js';
import { createSemanticOperationHistoryCommit } from './semanticOperationHistory.js';
import { classifyRouteLocation } from './publicTarget.js';
import { runPublicTargetRestoreCommand } from './publicTargetRestoreCommand.js';
import { runExplicitUrlMaterialImportCommand } from './urlMaterialCommand.js';
import { runWorkspaceSourceCloseCommand } from './workspaceSourceCloseCommand.js';
import { timePortalGithubSources } from './timePortalSnapshotResolution.js';
import { historicalWorkspaceForReadModel } from './timePortalHistoricalRead.js';
import { timePortalReferencesSource, timePortalViewFor, timePortalWithoutIntent } from '../workspaces/workspace.timePortal.js';
import { useTimePortalProductController } from './useTimePortalProductController.jsx';
import { TimePortalResolveDialog } from '../schemas/workspace/workspace.timePortal.views.jsx';
import { projectShareTruth, ShareScope } from './shareProjection.js';
import { executeShareProjectionAction } from './shareActionCommand.js';
import { stateAfterWorkspaceClosePresentation, stateWithRecordLineageFocused, stateWithWorkspaceFocused, stateWithWorkspaceViewPatchAndFocus, stateWithWorkspaceViewUpdateAndFocus, workspaceById } from './workspaceScopedInteraction.js';
import { stateWithWorkspaceWindowPage, workspaceWindowFor } from './workspaceWindow.js';
import { PlaythingsMultiverse } from '../experiments/playthings/PlaythingsMultiverse.jsx';
import { playthingsExperimentRequested } from '../experiments/playthings/playthings.model.js';
import { refreshPlaythingsRepositoryMaterial } from '../experiments/playthings/playthings.refresh.js';
import { playthingsTransitionOptionsFor, playthingsTransitionTargetFor } from './playthingsInteractionBridge.js'; import { playthingsLineageSnapshotFor } from '../experiments/playthings/playthings.lineage.js';
export function TiinexApp() {
  const playthingsUrlExperiment = playthingsExperimentRequested(typeof window !== 'undefined' ? window.location : null);
  const initialRuntimeRef = useRef(null);
  if (!initialRuntimeRef.current) initialRuntimeRef.current = initialRuntimeSnapshot();
  const startupOwnershipRef = useRef(null);
  if (!startupOwnershipRef.current) startupOwnershipRef.current = createStartupOwnershipGate();
  const [state, setState] = useState(() => initialRuntimeRef.current.state);
  const [startupPhase, setStartupPhase] = useState(() => initialStartupRenderPhase({ locationLike: typeof window !== 'undefined' ? window.location : null, routeResolved: initialRuntimeRef.current.routeResolved }));
  const [dialog, setDialog] = useState(null);
  const [playthingsOpen, setPlaythingsOpen] = useState(false);
  const [dialogWorkspaceId, setDialogWorkspaceId] = useState('');
  const [notice, setNotice] = useState('');
  const [createError, setCreateError] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [activeRecordWorkspaceId, setActiveRecordWorkspaceId] = useState(''); const [preferredCreateSchemaId, setPreferredCreateSchemaId] = useState('');
  const [activeAssetId, setActiveAssetId] = useState('');
  const [recordAction, setRecordAction] = useState(null);
  const [githubRequestPending, setGithubRequestPending] = useState(false);
  const [sourceContinuationId, setSourceContinuationId] = useState('');
  const viewScrollRef = useRef({}); const latestStateRef = useRef(state);
  const githubOperationRef = useRef({ token: null, controller: null }); const lineageAutoLoadKeysRef = useRef(new Set());
  const scrollPersistTimerRef = useRef(null);
  const scrollPersistIdleRef = useRef(null);
  const persistenceOwnershipRef = useRef(null);
  if (!persistenceOwnershipRef.current) persistenceOwnershipRef.current = createPersistenceOwnershipPolicy(initialRuntimeRef.current.routeKind, { durableLocalAuthority: initialRuntimeRef.current.durableLocalAuthority });
  const statePersistenceSchedulerRef = useRef(null);
  const appConfigDiagnosticsRef = useRef({ last: null });
  if (!statePersistenceSchedulerRef.current) statePersistenceSchedulerRef.current = createStatePersistenceScheduler(typeof window !== 'undefined' ? window : globalThis, { persistenceOwnership: persistenceOwnershipRef.current });
  const workspaceConfig = useMemo(() => runtime().config?.createDefaultWorkspaceConfig?.(), []);
  const startupPresentation = useMemo(() => startupPresentationFor({ startupPhase, state }), [startupPhase, state]);
  const active = activeWorkspace(state);
  const playthingsExperiment = playthingsUrlExperiment || playthingsOpen;
  const referenceParticipantRecords = useMemo(() => (state.workspaces || []).flatMap((workspace) => (workspace.records || []).map((record) => ({ ...record, workspaceIds: [...new Set([...(record.workspaceIds || []), workspace.id].filter(Boolean))] }))), [state.workspaces]);
  const activeWorkspaceConfig = active?.workspaceConfig || workspaceConfig;
  const activeUi = useMemo(() => hydrateUiWorkspace(active), [active]);
  const viewportWidth = useViewportWidth();
  const selection = useWorkspaceSelectionProductController({ setNotice, captureOriginContext: () => captureWorkspaceSelectionOriginContext(latestStateRef.current || state), restoreOriginContext: (context) => commit(restoreWorkspaceSelectionOriginContext(latestStateRef.current || state, context), 'replace', { deferPersistence: true, persistenceReason: 'workspace-selection-origin-restore' }) });
  const canonicalCreation = createCanonicalCreationProductController({ getState: () => latestStateRef.current || state, getLifecycle: () => runtime().lifecycle, getPersistenceOwnership: () => persistenceOwnershipRef.current, getRecordAction: () => recordAction, getDialogWorkspaceId: () => dialogWorkspaceId, resetSelection: selection.reset, setDialog, setDialogWorkspaceId, setRecordAction, setActiveRecordId, setActiveAssetId, setNotice, commitSemanticNavigation, viewportWidth });
  const workspaceWindow = useMemo(() => workspaceWindowFor(state, { viewportWidth, activeWorkspaceId: active?.id || state.activeWorkspaceId }), [state, viewportWidth, active]);
  const pagerVisible = shouldPageWorkspaces(state.workspaces.length, viewportWidth);
  const visibleWorkspaceItems = useMemo(() => visibleWorkspaceItemsFor(state, { active, activeUi, viewportWidth }), [state, active, activeUi, viewportWidth]);
  const workspaceGridColumns = useMemo(() => visibleWorkspaceItems.map((item) => selection.session ? 'minmax(16rem, 1fr)' : (item.layoutMode === 'compact' ? 'minmax(4.5rem, 5.75rem)' : 'minmax(0, 1fr)')).join(' '), [visibleWorkspaceItems, selection.session]);
  useEffect(() => {
    const onRoute = () => {
      const { lifecycle, route, persistence } = runtime();
      startupOwnershipRef.current.invalidate();
      abortGithubSourceOperation(githubOperationRef);
      setGithubRequestPending(false);
      const routeOwner = classifyRouteLocation(window.location);
      const durableLocalAuthority = durableLocalAuthorityForRoute(routeOwner.kind, window.history?.state || null);
      persistenceOwnershipRef.current?.restoreHistoryEntry?.({ routeKind: routeOwner.kind, durableLocalAuthority });
      if (routeOwner.kind === 'public-target') {
        markCurrentHistoryDurableAuthority(window.history, window.location, DurableLocalAuthority.isolatedPreexistingRecovery);
        setStartupPhase('resolving'); window.setTimeout(() => restorePublicTargetFromOwnership(routeOwner.target), 0); return;
      }
      if (routeOwner.kind !== 'semantic-state') { setStartupPhase('resolving'); window.setTimeout(() => startWorkspaceFromOwnership('replace'), 0); return; }
      const routeResolution = persistence?.resolveInitialState?.({
        location: window.location,
        storage: window.localStorage,
        durableLocalPolicy: durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery ? 'preserve-existing' : 'normal'
      });
      if (!routeResolution?.resolved) { setStartupPhase('resolving'); window.setTimeout(() => startWorkspaceFromOwnership('replace'), 0); return; }
      const routeState = routeResolution.state;
      const routed = route?.normalizeRouteState?.(routeState, lifecycle) || routeState;
      setStartupPhase('resolved');
      setState(canonicalProductState(routed, persistence, 'route-navigation'));
    };
    window.addEventListener('popstate', onRoute);
    window.addEventListener('hashchange', onRoute);
    return () => { window.removeEventListener('popstate', onRoute); window.removeEventListener('hashchange', onRoute); };
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialRuntimeRef.current.routeKind === 'public-target') {
      markCurrentHistoryDurableAuthority(window.history, window.location, DurableLocalAuthority.isolatedPreexistingRecovery);
    }
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialRuntimeRef.current.routeKind === 'public-target' && initialRuntimeRef.current.publicTarget) {
      window.setTimeout(() => restorePublicTargetFromOwnership(initialRuntimeRef.current.publicTarget), 0);
      return;
    }
    if (initialRuntimeRef.current.routeResolved || state.workspaces?.length) return;
    window.setTimeout(() => startWorkspaceFromOwnership('replace'), 0);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onPersistenceFailure = (event) => {
      if (!event?.detail?.localMaterialAtRisk) return;
      if (event.detail.lastKnownGoodPreserved) setNotice('Newest local changes could not be saved. Your previous local recovery is still preserved; keep this tab open and export or copy the newest work before continuing.');
      else setNotice('Local changes could not be saved. Keep this tab open and export or copy important work before continuing.');
    };
    window.addEventListener('tiinex:local-persistence-failure', onPersistenceFailure);
    return () => window.removeEventListener('tiinex:local-persistence-failure', onPersistenceFailure);
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
  useEffect(() => { const id = String(state.view?.selectedRecordId || '').trim(); if (state.view?.workspaceVerse !== 'lineage' || !active || !id) return; const decision = shouldAutoLoadLineage({ workspace: activeUi || active, selectedRecordId: id, existingLoadReport: lineageLoadReportForSelected(state), loadedKeys: lineageAutoLoadKeysRef.current }); if (decision.shouldLoad) { lineageAutoLoadKeysRef.current.add(decision.key); window.setTimeout(() => loadFullLineage(), 0); } }, [state]);
  function commit(nextState, mode = 'push', options = {}) {
    commitStateWithPersistence({ nextState, mode, options, sourceState: latestStateRef.current || state, preserveCapturedViewScroll, latestStateRef, setState, runtime, scheduler: statePersistenceSchedulerRef.current, persistenceOwnership: persistenceOwnershipRef.current });
  }
  function commitSemanticNavigation(nextState, mode = 'push', options = {}) {
    const transition = persistenceOwnershipRef.current?.beginSemanticNavigation?.(mode) || { mode };
    const isolated = persistenceOwnershipRef.current?.report?.().durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery;
    const navigationOptions = Object.assign({}, options, { allowEmptySemanticState: isolated && !(nextState?.workspaces?.length) });
    if (transition.firstExitFromPublicTarget) {
      navigationOptions.deferPersistence = false;
      navigationOptions.persistenceReason = 'public-route-semantic-exit';
    }
    commit(nextState, transition.mode || mode, navigationOptions);
    return transition;
  }
  function authorizeDurableLocalMutation(operation) {
    return durableLocalMutationDecision(persistenceOwnershipRef.current, operation);
  }
  async function restorePublicTargetFromOwnership(target) {
    if (typeof window === 'undefined') return null;
    const token = startupOwnershipRef.current.claim();
    const isCurrentOwner = () => startupOwnershipRef.current.isCurrent(token);
    setStartupPhase('resolving');
    const result = await runPublicTargetRestoreCommand({ target, runtimeApi: runtime(), fetchImpl: fetch, workspaceConfig, isCurrentOwner });
    if (!isCurrentOwner()) return Object.assign({}, result, { stale: true });
    if (!result?.ok) { setStartupPhase('failed'); setNotice(result?.message || 'Could not restore public target.'); return result; }
    commit(result.state, 'replace');
    setStartupPhase('resolved');
    return result;
  }
  async function startWorkspaceFromOwnership(mode = 'replace') {
    if (typeof window === 'undefined') return null;
    return runOwnedWorkspaceStartupTransition({
      gate: startupOwnershipRef.current,
      runTransition: runWorkspaceStartupTransition,
      setPhase: setStartupPhase,
      setNotice,
      transitionOptions: {
        runtimeApi: runtime(),
        emptyState: defaultState(),
        workspaceConfig,
        storage: window.localStorage,
        locationLike: window.location,
        windowObj: window,
        fetchImpl: fetch,
        commit,
        materializeSource: addGitHubSource,
        setDiagnostics: (value) => { appConfigDiagnosticsRef.current = value; },
        mode
      }
    });
  }
  function viewScrollKeyFor(sourceState = state, viewOverride = null, workspaceId = '') {
    return workspaceViewScrollKeyFor(sourceState, viewOverride, workspaceId || sourceState?.activeWorkspaceId || active?.id || 'workspace');
  }
  function commitWorkspaceViewPatch(workspaceId = '', patch = {}, mode = 'replace') {
    const sourceState = latestStateRef.current || state;
    commitSemanticNavigation(stateWithWorkspaceViewPatchAndFocus(sourceState, workspaceId || active?.id, patch, viewportWidth), mode, { deferPersistence: true, persistenceReason: 'workspace-view-patch' });
  }
  function commitWorkspaceViewUpdate(workspaceId = '', updater = null, mode = 'replace') {
    const sourceState = latestStateRef.current || state;
    commitSemanticNavigation(stateWithWorkspaceViewUpdateAndFocus(sourceState, workspaceId || active?.id, updater, viewportWidth), mode, { deferPersistence: true, persistenceReason: 'workspace-view-update' });
  }
  const timePortalController = useTimePortalProductController({ state, latestStateRef, activeWorkspaceId: active?.id || '', dialogWorkspaceId, dialog, commitWorkspaceViewUpdate, setNotice, setDialog, setDialogWorkspaceId, setActiveRecordId, setActiveAssetId, dismissDialog, fetchImpl: typeof fetch !== 'undefined' ? fetch : null });
  const { readFor: timePortalReadFor, clearHistoricalRead, openResolver: openTimePortalResolver, loadSnapshot: loadHistoricalSnapshot, resolveFromDialog: resolveTimePortalFromDialog, returnToLatest: returnTimePortalToLatest, busy: timePortalBusy, error: timePortalError } = timePortalController;
  function commitViewPatch(patch = {}, mode = 'replace') { commitWorkspaceViewPatch(active?.id, patch, mode); }
  function commitViewUpdate(updater = null, mode = 'replace') { commitWorkspaceViewUpdate(active?.id, updater, mode); }
  function preserveCapturedViewScroll(nextState = state, sourceState = state) {
    return stateWithCapturedViewScroll(nextState, sourceState, viewScrollRef.current, active?.id || 'workspace');
  }
  // UI guard: persistCapturedViewScroll('replace') remains the scroll replace-state path.
  function persistCapturedViewScroll(mode = 'replace', options = {}) {
    return persistCapturedScroll({ latestStateRef, state, preserveCapturedViewScroll, runtime, mode, options: Object.assign({ setState }, options), doc: document, persistenceOwnership: persistenceOwnershipRef.current });
  }
  function persistWorkspaceScroll(workspaceId, key, top) {
    const currentState = latestStateRef.current || state;
    const currentView = activeWorkspaceViewFor(currentState, workspaceId);
    const scrollPositions = Object.assign({}, currentView.scrollPositions || {}, { [key]: Math.max(0, Math.round(Number(top || 0))) });
    commit(stateWithWorkspaceViewPatch(currentState, workspaceId, { scrollPositions }), 'replace', { deferPersistence: true, persistenceReason: 'workspace-scroll' });
  }
  function noteViewScroll(workspaceId, verse, top) {
    const id = String(workspaceId || active?.id || '').trim();
    if (!id) return;
    const currentState = latestStateRef.current || state;
    const currentView = activeWorkspaceViewFor(currentState, id);
    const view = Object.assign({}, currentView, { workspaceVerse: verse || currentView.workspaceVerse || 'feed' });
    const key = viewScrollKeyFor(currentState, view, id);
    const roundedTop = Math.max(0, Math.round(Number(top || 0)));
    viewScrollRef.current[key] = roundedTop;
    scheduleIdleScrollPersist({ timerRef: scrollPersistTimerRef, idleRef: scrollPersistIdleRef }, () => persistWorkspaceScroll(id, key, roundedTop), window);
  }
  function currentStageScrollTop(workspaceId, surfaceState = state) {
    const id = String(workspaceId || active?.id || '').trim();
    const view = activeWorkspaceViewFor(surfaceState, id);
    const key = viewScrollKeyFor(surfaceState, view, id);
    const fromRef = viewScrollRef.current[key];
    if (Number.isFinite(Number(fromRef))) return Number(fromRef);
    return Number(view.scrollPositions?.[key] || 0);
  }
  const { addLocalFiles, resolveLocalImportConflict, addPastedTrace, pendingLocalImport } = useLocalMaterialIntake({
    getLifecycle: () => runtime().lifecycle,
    getState: () => latestStateRef.current || state,
    workspaceId: active?.id || '',
    parseWorkspaceConfig: runtime().config?.parseWorkspaceConfig,
    setNotice,
    setDialog,
    commit,
    getPersistenceOwnership: () => persistenceOwnershipRef.current,
    windowObj: typeof window !== 'undefined' ? window : null
  });
  const { handleGlobalWorkspaceDrop, resolveWorkspaceEntrypointChoice, pendingWorkspaceEntrypoint } = useWorkspaceEntrypointIntake({
    getLifecycle: () => runtime().lifecycle,
    getState: () => latestStateRef.current || state,
    parseWorkspaceConfig: runtime().config?.parseWorkspaceConfig,
    setNotice,
    setDialog,
    commit,
    getPersistenceOwnership: () => persistenceOwnershipRef.current,
    materializeSource: addGitHubSource,
    windowObj: typeof window !== 'undefined' ? window : null
  });
  function focusWorkspaceForInteraction(workspaceId = '', mode = 'replace') {
    const id = String(workspaceId || '').trim();
    const sourceState = latestStateRef.current || state;
    if (!id || !workspaceById(sourceState, id)) return sourceState;
    const next = stateWithWorkspaceFocused(sourceState, id, viewportWidth);
    if (next !== sourceState) commitSemanticNavigation(next, mode, { deferPersistence: true, persistenceReason: 'workspace-focus' });
    return next;
  }
  function openCreate() {
    setCreateError('');
    setSourceContinuationId('');
    setDialogWorkspaceId('');
    setDialog('create-workspace');
  }
  function openAddToWorkspace(sourceId = '', workspaceId = active?.id || '') {
    const id = String(workspaceId || active?.id || '').trim();
    if (id) focusWorkspaceForInteraction(id);
    setDialogWorkspaceId(id);
    setSourceContinuationId(String(sourceId || ''));
    setDialog('add-to-workspace');
  }
  function openGovernanceBoundary(sourceId = '', workspaceId = active?.id || '') {
    const source = String(sourceId || '').trim();
    const id = String(workspaceId || active?.id || '').trim();
    if (!source || !id) return;
    focusWorkspaceForInteraction(id);
    setDialogWorkspaceId(id);
    setSourceContinuationId(source);
    setDialog('source-governance');
  }
  function openWorkspaceDialog(name, workspaceId = active?.id || '') {
    const id = String(workspaceId || active?.id || '').trim();
    if (!id) return;
    focusWorkspaceForInteraction(id);
    setDialogWorkspaceId(id);
    setDialog(name);
  }
  function dismissDialog() {
    selection.reset();
    setDialog(null);
    setDialogWorkspaceId('');
    setPreferredCreateSchemaId('');
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
    commitSemanticNavigation(result.state, 'push');
    return true;
  }
  function renameWorkspace(name) { const sourceState = latestStateRef.current || state, targetId = dialogWorkspaceId || sourceState.activeWorkspaceId; const result = runtime().lifecycle?.renameWorkspace?.(sourceState, targetId, name); if (!result?.ok) return false; dismissDialog(); setNotice('Workspace renamed.'); commitSemanticNavigation(stateWithWorkspaceFocused(result.state, targetId, viewportWidth), 'replace'); return true; }
  function closeWorkspace(workspaceId) {
    const sourceState = latestStateRef.current || state;
    const result = runtime().lifecycle?.closeWorkspace?.(sourceState, workspaceId || dialogWorkspaceId || sourceState.activeWorkspaceId);
    if (!result?.ok) return;
    dismissDialog();
    const isolated = persistenceOwnershipRef.current?.report?.().durableLocalAuthority === DurableLocalAuthority.isolatedPreexistingRecovery;
    setNotice(result.state.workspaces.length ? 'Workspace closed.' : (isolated ? 'Workspace closed. This shared view is now empty.' : 'Workspace closed. Clean start restored.'));
    commitSemanticNavigation(stateAfterWorkspaceClosePresentation(result.state, viewportWidth), 'push');
  }
  async function addExplicitUrls(urlText) {
    const result = await runExplicitUrlMaterialImportCommand({ lifecycle: runtime().lifecycle, state: latestStateRef.current || state, workspaceId: dialogWorkspaceId || active?.id, urlText, fetchImpl: fetch });
    if (result.exception) console.error(result.exception);
    if (!result.ok) return setNotice(result.notice || 'Could not add URL material.');
    setDialog(null);
    setNotice(result.notice || 'URL material added.');
    commitSemanticNavigation(result.state, 'push');
  }
  async function addGitHubSource(input = {}, options = {}) {
    const isCurrentOwner = typeof options.isCurrentOwner === 'function' ? options.isCurrentOwner : null;
    const ownerAllows = () => !isCurrentOwner || isCurrentOwner();
    const guarded = (fn) => (...args) => ownerAllows() ? fn(...args) : undefined;
    return runGithubSourceOperation({
      input,
      options,
      state,
      active,
      runtimeApi: runtime(),
      workspaceConfig,
      githubRequestPending,
      operationRef: githubOperationRef,
      setNotice: guarded(setNotice),
      setDialog: guarded(setDialog),
      setGithubRequestPending: guarded(setGithubRequestPending),
      commit: guarded(options.bufferProductState
        ? () => {}
        : options.semanticNavigation
          ? createSemanticOperationHistoryCommit({ commit, commitSemanticNavigation })
          : options.semanticNavigationEstablished
            ? createSemanticOperationHistoryCommit({ commit, commitSemanticNavigation, navigationEstablished: true })
            : commit),
      getLatestState: () => latestStateRef.current || state,
      fetchImpl: fetch,
      AbortControllerImpl: typeof AbortController !== 'undefined' ? AbortController : undefined
    });
  }
  async function refreshSourceTransport(sourceId, currentTier = '', surfaceKeys = [], workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const targetId = String(workspaceId || sourceState.activeWorkspaceId || '').trim();
    const targetWorkspace = workspaceById(sourceState, targetId);
    const source = (targetWorkspace?.sources || []).find((item) => String(item.id || '') === String(sourceId || ''));
    if (!source) return setNotice('Source not found.');
    const refresh = sourceTransportRefreshInputForSource(source, currentTier, surfaceKeys);
    if (refresh.replacingPending) { abortGithubSourceOperation(githubOperationRef); setGithubRequestPending(false); }
    if (refresh.reason === 'last-tier') return setNotice(`${source.label || 'Source'} is already using the last transport tier (direct).`);
    if (refresh.reason === 'no-surfaces') return openAddToWorkspace(source.id || sourceId, targetId);
    clearGithubSourceCacheForSource(source);
    const focusedState = stateWithWorkspaceFocused(sourceState, targetId, viewportWidth);
    const pendingSource = runtime().lifecycle?.addWorkspaceSource?.(focusedState, targetId, sourceTransportPendingUpdateInputForSource(source, refresh));
    const operationState = pendingSource?.ok ? pendingSource.state : focusedState;
    if (pendingSource?.ok) commit(operationState, 'replace');
    setNotice(`${source.label || 'Source'} trying ${refresh.nextTier} transport.`);
    await addGitHubSource(Object.assign({}, refresh.input, { preserveView: true, resetSourceMaterial: true, resetSourceCache: false, abortPreviousGithubOperation: Boolean(refresh.replacingPending) }), { state: operationState, workspaceId: targetId });
  }
  async function refreshPlaythingsMaterial() {
    const out = await refreshPlaythingsRepositoryMaterial({ state: latestStateRef.current || state, addGitHubSource });
    if (!out.attempted) setNotice('Playthings found no configured repository source to refresh.');
    return out.state;
  }
  function exitPlaythings() {
    if (playthingsUrlExperiment && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('experiment');
      window.location.assign(url.toString());
      return;
    }
    setPlaythingsOpen(false);
  }
  function openRecord(recordId, workspaceId = active?.id || '') {
    const id = String(recordId || '');
    const ownerWorkspaceId = String(workspaceId || active?.id || '');
    if (ownerWorkspaceId && !playthingsExperiment) focusWorkspaceForInteraction(ownerWorkspaceId);
    setRecordAction(null);
    setActiveAssetId('');
    setActiveRecordWorkspaceId(ownerWorkspaceId);
    setActiveRecordId(id);
  }
  function playthingsTransitionOptions(recordId, workspaceId) { return playthingsTransitionOptionsFor(latestStateRef.current || state, recordId, workspaceId, referenceParticipantRecords); }
  function activatePlaythingsTransition(recordId, workspaceId, action) { const target = playthingsTransitionTargetFor(latestStateRef.current || state, recordId, workspaceId); if (target.record && action) openRecordAction(target.record, action, target.workspace?.id || workspaceId); }
  function openPlaythingsCreateSkill(schemaId) {
    const targetWorkspaceId = String((latestStateRef.current || state).activeWorkspaceId || active?.id || ''); if (!targetWorkspaceId) return setNotice('Playthings needs an active workspace before creating an artifact.');
    setPreferredCreateSchemaId(String(schemaId || '')); setDialogWorkspaceId(targetWorkspaceId); setDialog('create-artifact');
  }
  function focusRecordLineage(recordId, workspaceId = active?.id || '', exitAfter = false) {
    const id = String(recordId || '');
    setRecordAction(null);
    setActiveAssetId('');
    setActiveRecordId('');
    if (!id) return;
    const sourceState = latestStateRef.current || state;
    commitSemanticNavigation(stateWithRecordLineageFocused(sourceState, workspaceId || active?.id, id, viewportWidth), 'push', { deferPersistence: true, persistenceReason: 'workspace-lineage-focus' }); if (exitAfter) setPlaythingsOpen(false);
  }
  function dismissRecord() {
    setActiveRecordId('');
    setActiveRecordWorkspaceId('');
  }
  function openAsset(assetId, workspaceId = active?.id || '') {
    if (workspaceId) focusWorkspaceForInteraction(workspaceId);
    setRecordAction(null);
    setActiveRecordId('');
    setActiveAssetId(String(assetId || ''));
  }
  function dismissAsset() {
    setActiveAssetId('');
  }
  async function openWorkspaceRecord(record = {}, originWorkspaceId = '') {
    const currentState = latestStateRef.current || state;
    const result = openWorkspaceRecordAction({ lifecycle: runtime().lifecycle, parseWorkspaceConfig: runtime().config?.parseWorkspaceConfig, state: currentState, record });
    if (!result?.ok) return setNotice(result?.message || 'Could not open workspace artifact.');
    setDialog(null); setActiveRecordId(''); setActiveAssetId(''); setRecordAction(null);
    const preparedState = stateWithWorkspaceRecordOpenProgress(result.state, result.workspace?.id, result.sourceInputs || [], result.entry);
    setNotice(workspaceRecordOpenedNotice(result));
    commitSemanticNavigation(preparedState, 'push');
    let materialState = preparedState;
    for (const sourceInput of result.sourceInputs || []) {
      const loaded = await addGitHubSource(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || result.workspace?.id, semanticNavigationEstablished: true });
      if (loaded?.state) materialState = loaded.state;
    }
  }
  async function mergeWorkspaceRecord(record = {}, originWorkspaceId = '') {
    const currentState = latestStateRef.current || state;
    const result = mergeWorkspaceRecordAction({ lifecycle: runtime().lifecycle, parseWorkspaceConfig: runtime().config?.parseWorkspaceConfig, state: currentState, workspaceId: originWorkspaceId || currentState.activeWorkspaceId || active?.id, record });
    if (!result?.ok) return setNotice(result?.message || 'Could not merge workspace artifact.');
    setNotice(workspaceRecordMergedNotice(result));
    commitSemanticNavigation(result.state, 'push');
    let materialState = result.state;
    for (const sourceInput of result.sourceInputs || []) {
      const loaded = await addGitHubSource(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || result.workspace?.id || active?.id, semanticNavigationEstablished: true });
      if (loaded?.state) materialState = loaded.state;
    }
  }
  function openRecordAction(record, action, originWorkspaceId = '') {
    if (action?.id === RecordActionKind.workspaceOpen) return openWorkspaceRecord(record, originWorkspaceId);
    if (action?.id === RecordActionKind.workspaceMerge) return mergeWorkspaceRecord(record, originWorkspaceId);
    if (action?.id === RecordActionKind.deleteLocal) return deleteLocalDraftRecord(record, originWorkspaceId);
    if (originWorkspaceId) focusWorkspaceForInteraction(originWorkspaceId);
    selection.reset(); setActiveRecordId(''); setActiveAssetId(''); setRecordAction({ recordId: record?.id || '', workspaceId: originWorkspaceId || state.activeWorkspaceId || active?.id || '', action });
  }
  function dismissRecordAction() { selection.reset(); setRecordAction(null); }
  function deleteLocalDraftRecord(record = {}, originWorkspaceId = '') {
    const currentState = latestStateRef.current || state, workspaceId = originWorkspaceId || currentState.activeWorkspaceId || active?.id;
    const result = runLocalDraftDiscardCommand({ lifecycle: runtime().lifecycle, state: currentState, workspaceId, recordId: record?.id || '', persistenceOwnership: persistenceOwnershipRef.current });
    if (!result?.ok) return setNotice(result?.notice || 'Could not discard local draft.');
    setRecordAction(null); if (activeRecordId === record?.id) setActiveRecordId(''); setNotice(result.notice); commitSemanticNavigation(stateWithWorkspaceFocused(result.state, workspaceId, viewportWidth), 'push');
  }
  function updateLocalDraftRecord(record = {}, markdown = '', originWorkspaceId = '') {
    const currentState = latestStateRef.current || state, workspaceId = originWorkspaceId || currentState.activeWorkspaceId || active?.id;
    const result = runLocalDraftUpdateCommand({ lifecycle: runtime().lifecycle, state: currentState, workspaceId, recordId: record?.id || '', candidate: { markdown }, persistenceOwnership: persistenceOwnershipRef.current });
    if (!result?.ok) { setNotice(result?.notice || 'Could not update local draft.'); return result; }
    setRecordAction(null); setNotice(result.notice); commit(result.state, 'replace', { persistenceReason: 'local-draft-edit' });
    return result;
  }

  function createTransitionRecord(parentRecord, draft) {
    if (!draft?.title) return setNotice('Transition draft is missing a title.');
    const authority = authorizeDurableLocalMutation(DurableLocalMutationOperation.localDraftCreate);
    if (!authority.ok) return setNotice(authority.notice);
    const uniqueDraft = ensureUniqueTransitionPath(draft, active?.records || []), result = runtime().lifecycle?.addWorkspaceRecord?.(state, active?.id, uniqueDraft);
    if (!result?.ok) return setNotice('Could not create transition leaf.');
    setRecordAction(null);
    setActiveRecordId('');
    setActiveAssetId('');
    setNotice(`Created local ${uniqueDraft.kind || 'transition'} leaf from ${parentRecord?.title || 'artifact'}; focused new lineage.`);
    commitSemanticNavigation(stateWithWorkspaceViewPatch(result.state, result.workspace?.id || active?.id, { workspaceVerse: 'lineage', selectedRecordId: result.record?.id || uniqueDraft.id || '', lineageQuery: '', lineageLoadReport: null, lineageAuditReport: null }), 'push');
  }
  async function shareRecord(record, workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const targetWorkspace = workspaceById(sourceState, workspaceId || sourceState.activeWorkspaceId) || active;
    const projection = shareProjectionFor(ShareScope.artifact, { state: sourceState, workspace: targetWorkspace, record });
    const result = await executeShareProjectionAction({ projection, clipboard: typeof navigator !== 'undefined' ? navigator.clipboard : null, label: record?.title || record?.path || 'artifact' });
    setNotice(result.notice);
  }
  async function shareWorkspace(workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const targetWorkspace = workspaceById(sourceState, workspaceId || sourceState.activeWorkspaceId);
    if (!targetWorkspace) return setNotice('No workspace is available to share.');
    const projection = shareProjectionFor(ShareScope.workspace, { state: sourceState, workspace: targetWorkspace });
    const result = await executeShareProjectionAction({ projection, clipboard: typeof navigator !== 'undefined' ? navigator.clipboard : null, label: targetWorkspace.name || targetWorkspace.title || 'workspace' });
    setNotice(result.notice);
  }
  function openWorkspaceExportDialog(workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const target = workspaceById(sourceState, workspaceId || sourceState.activeWorkspaceId);
    if (!target) return setNotice('No workspace to export.');
    openWorkspaceDialog('export-workspace', target.id);
  }
  function persistWorkspacePublicationResult(result = null, plan = null, executionAttestation = null) {
    const sourceState = latestStateRef.current || state;
    const targetId = dialogWorkspaceId || sourceState.activeWorkspaceId;
    const applied = stateWithWorkspacePublicationReceipt(sourceState, targetId, result || {}, { executionAttestation });
    if (!applied.ok) { setNotice('Verified publication could not be recorded locally.'); return applied; }
    commit(applied.state, 'replace', { persistenceReason: 'publication-receipt' });
    setNotice('GitHub publication verified and receipt recorded locally.');
    return applied;
  }
  function executeWorkspaceExport(exportPlan = null) {
    const sourceState = latestStateRef.current || state;
    const target = workspaceById(sourceState, dialogWorkspaceId || sourceState.activeWorkspaceId) || active;
    const result = executeWorkspaceExportCommand({ workspace: hydrateUiWorkspace(target) || target, exportPlan, document, window });
    if (result.exception) console.error(result.exception);
    setNotice(result.notice || (result.ok ? 'Export completed.' : 'Could not execute export.'));
    if (result.ok) setDialog(null);
  }
  function closeSource(sourceId, workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const targetId = String(workspaceId || sourceState.activeWorkspaceId || '').trim();
    const sourceForClose = timePortalReferencesSource(activeWorkspaceViewFor(sourceState, targetId), sourceId) ? stateWithWorkspaceViewUpdateAndFocus(sourceState, targetId, (view) => timePortalWithoutIntent(view), viewportWidth) : sourceState;
    if (sourceForClose !== sourceState) clearHistoricalRead(targetId);
    const result = runWorkspaceSourceCloseCommand({ lifecycle: runtime().lifecycle, state: sourceForClose, workspaceId: targetId, sourceId });
    if (!result?.ok) return setNotice(result.notice || 'Source stays pinned.');
    setNotice(result.notice || 'Source closed.');
    commitSemanticNavigation(stateWithWorkspaceFocused(result.state, targetId, viewportWidth), 'push');
  }
  function pageWorkspaceWindow(direction) {
    const sourceState = latestStateRef.current || state;
    const nextState = stateWithWorkspaceWindowPage(sourceState, direction, viewportWidth);
    if (nextState === sourceState) return;
    commitSemanticNavigation(nextState, 'replace', { deferPersistence: true, persistenceReason: 'workspace-window-page' });
  }
  function activateWorkspace(workspaceId, mode = 'replace') {
    const id = String(workspaceId || '').trim();
    const sourceState = latestStateRef.current || state;
    if (!id || id === sourceState.activeWorkspaceId) return;
    if (!(Array.isArray(sourceState.workspaces) ? sourceState.workspaces : []).some((workspace) => workspace.id === id)) return;
    commitSemanticNavigation(stateWithWorkspaceFocused(sourceState, id, viewportWidth), mode, { deferPersistence: true, persistenceReason: 'workspace-activate' });
  }
  function setWorkspaceLayoutMode(workspaceId, layoutMode) {
    const id = String(workspaceId || '').trim();
    const sourceState = latestStateRef.current || state;
    if (!id || !workspaceById(sourceState, id)) return;
    const withLayout = stateWithWorkspaceLayoutMode(sourceState, id, layoutMode);
    commit(stateWithWorkspaceFocused(withLayout, id, viewportWidth), 'replace', { deferPersistence: true, persistenceReason: 'workspace-layout' });
  }
  function lineageLoadReportForSelected(sourceState = state) {
    return lineageLoadReportForSelectedView(sourceState?.view || {});
  }
  async function loadFullLineage(workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const targetId = String(workspaceId || sourceState.activeWorkspaceId || '').trim();
    const targetWorkspace = workspaceById(sourceState, targetId);
    const targetView = activeWorkspaceViewFor(sourceState, targetId);
    const selectedRecordId = String(targetView.selectedRecordId || '').trim();
    const result = await loadFullLineageCommand({ lifecycle: runtime().lifecycle, state: Object.assign({}, sourceState, { view: targetView }), workspace: targetWorkspace, selectedRecordId, fetchImpl: fetch, workspaceConfig });
    if (!result?.ok) return setNotice(result?.message || 'Could not load lineage.');
    setNotice(result.notice);
    commit(stateWithWorkspaceViewPatchAndFocus(result.state, targetId, { lineageQuery: '', lineageLoadReport: result.lineageLoadReport, lineageAuditReport: null }, viewportWidth), result.commitMode || 'replace');
  }
  function runLineageAudit(workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const targetId = String(workspaceId || sourceState.activeWorkspaceId || '').trim();
    const targetWorkspace = workspaceById(sourceState, targetId);
    const targetView = activeWorkspaceViewFor(sourceState, targetId);
    const selectedRecordId = String(targetView.selectedRecordId || '').trim();
    const result = runLineageAuditCommand({ state: Object.assign({}, sourceState, { view: targetView }), workspace: targetWorkspace, selectedRecordId, query: targetView.lineageQuery || '', existingLoadReport: lineageLoadReportForSelectedView(targetView) });
    if (!result?.ok) return setNotice(result?.message || 'Could not run lineage audit.');
    commit(stateWithWorkspaceViewPatchAndFocus(result.state, targetId, { lineageAuditReport: result.lineageAuditReport }, viewportWidth), 'replace');
  }
  function setVerse(verse, workspaceId = active?.id || '') {
    const normalizedVerse = verse === 'tree' || verse === 'lineage' ? verse : 'feed';
    const resetLineage = normalizedVerse === 'feed' || normalizedVerse === 'tree';
    commitWorkspaceViewPatch(workspaceId, Object.assign({
      workspaceVerse: normalizedVerse
    }, resetLineage ? {
      lineageReturnVerse: '',
      selectedRecordId: '',
      expandedLineageRecordIds: [],
      lineageAuditReport: null,
      lineageLoadReport: null
    } : {}), 'push');
  }
  function toggleLineageCard(recordId, workspaceId = active?.id || '') {
    const id = String(recordId || '').trim();
    if (!id) return;
    commitWorkspaceViewUpdate(workspaceId, (currentView) => {
      const current = new Set(Array.isArray(currentView.expandedLineageRecordIds) ? currentView.expandedLineageRecordIds : []);
      if (current.has(id)) current.delete(id);
      else current.add(id);
      return Object.assign({}, currentView, { expandedLineageRecordIds: Array.from(current) });
    }, 'replace');
  }
  function setQuery(query, workspaceId = active?.id || '') {
    commitWorkspaceViewUpdate(workspaceId, (currentView) => {
      const verse = currentView.workspaceVerse || 'feed';
      return verse === 'lineage'
        ? Object.assign({}, currentView, { lineageQuery: query })
        : Object.assign({}, currentView, { query });
    }, 'replace');
  }
  async function openSchemaForRecord(record, workspaceId = active?.id || '') {
    const sourceState = latestStateRef.current || state;
    const targetId = String(workspaceId || sourceState.activeWorkspaceId || '').trim();
    const targetWorkspace = workspaceById(sourceState, targetId);
    const result = await openSchemaForRecordCommand({ state: stateWithWorkspaceFocused(sourceState, targetId, viewportWidth), workspace: targetWorkspace, record, loadSchemaMarkdown: (schemaId) => loadViewerSchemaMarkdown(schemaId, fetch), fetchImpl: fetch, clock: () => new Date().toISOString() });
    if (!result?.ok) return setNotice(result?.notice || 'Schema reading contract is not available.');
    setNotice(result.notice);
    commitSemanticNavigation(result.state, result.commitMode || 'push');
  }
  function setDisplayOptions(options) {
    const targetId = dialogWorkspaceId || (latestStateRef.current || state).activeWorkspaceId;
    dismissDialog();
    commitWorkspaceViewPatch(targetId, { displayOptions: normalizeWorkspaceDisplayOptions(options) }, 'replace');
  }
  function toggleTreeFolder(folderPath, open, workspaceId = active?.id || '') {
    const path = String(folderPath || '').trim();
    if (!path) return;
    commitWorkspaceViewUpdate(workspaceId, (currentView) => {
      const existing = new Set(Array.isArray(currentView.expandedTreeFolders) ? currentView.expandedTreeFolders : []);
      if (open) existing.add(path);
      else existing.delete(path);
      return Object.assign({}, currentView, { expandedTreeFolders: Array.from(existing).sort() });
    }, 'replace');
  }
  function shareProjectionFor(scope, { state: sourceState = latestStateRef.current || state, workspace = null, record = null } = {}) {
    const configForScope = workspace?.workspaceConfig || activeWorkspaceConfig || workspaceConfig;
    const { route, persistence } = runtime();
    return projectShareTruth({
      scope,
      state: sourceState,
      workspace,
      record,
      publicViewerUrl: configForScope?.viewerIdentity?.publicViewerUrl || workspaceConfig?.viewerIdentity?.publicViewerUrl || '',
      exactStateBaseUrl: typeof window !== 'undefined' ? window.location.href : '',
      routeCodec: route,
      persistenceCodec: persistence
    });
  }
  async function shareCurrent() {
    const sourceState = latestStateRef.current || state;
    const projection = shareProjectionFor(ShareScope.current, { state: sourceState, workspace: workspaceById(sourceState, sourceState.activeWorkspaceId) });
    const result = await executeShareProjectionAction({ projection, clipboard: typeof navigator !== 'undefined' ? navigator.clipboard : null });
    setNotice(result.notice);
  }
  const activeTemporal = active ? timePortalViewFor(activeWorkspaceViewFor(state, active.id)) : null;
  const activeHistoricalRead = active ? timePortalReadFor(active, activeWorkspaceViewFor(state, active.id)) : null;
  const activeHistoricalWorkspace = activeHistoricalRead ? historicalWorkspaceForReadModel(active, activeHistoricalRead) : null;
  const activeRecordOwner = activeRecordWorkspaceId ? workspaceById(state, activeRecordWorkspaceId) : null;
  const activeRecordOwnerUi = activeRecordOwner ? hydrateUiWorkspace(activeRecordOwner) : null;
  const activeRecord = activeRecordId ? hydrateUiRecord((activeRecordOwnerUi?.records || activeHistoricalWorkspace?.records || activeUi?.records || []).find((record) => record.id === activeRecordId)) : null;
  const activeAsset = activeAssetId && activeUi?.assets ? activeUi.assets.find((asset) => asset.id === activeAssetId || asset.path === activeAssetId) : null;
  const actionWorkspace = recordAction?.workspaceId ? workspaceById(state, recordAction.workspaceId) : active;
  const actionWorkspaceUi = hydrateUiWorkspace(actionWorkspace);
  const actionRecord = recordAction?.recordId && actionWorkspaceUi?.records ? hydrateUiRecord(actionWorkspaceUi.records.find((record) => record.id === recordAction.recordId)) : null;
  const dialogWorkspace = workspaceById(state, dialogWorkspaceId || state.activeWorkspaceId) || active;
  const dialogWorkspaceUi = hydrateUiWorkspace(dialogWorkspace);
  const dialogWorkspaceView = activeWorkspaceViewFor(state, dialogWorkspace?.id || '');
  const referenceSelectionOptions = useCanonicalReferenceSelectionOptions({ state, actionRecord, recordAction, actionWorkspace });
  const placementSelectionOptions = useCanonicalPlacementSelectionOptions({ state, actionRecord, recordAction, actionWorkspace, dialog, dialogWorkspace });
  const workspaceCreateActions = useMemo(() => dialog === 'create-artifact' && dialogWorkspace?.id
    ? transitionProductActionsForWorkspace({ workspaceId: dialogWorkspace.id })
    : Object.freeze([]), [dialog, dialogWorkspace?.id]);
  const governanceDialogSource = dialog === 'source-governance' && dialogWorkspaceUi?.sources
    ? dialogWorkspaceUi.sources.find((source) => source.id === sourceContinuationId) || null
    : null;
  const governanceDialogData = governanceDialogSource ? sourceGovernanceDialogData(governanceDialogSource, dialogWorkspaceUi) : null;
  if (!shouldRenderProductStage(startupPhase)) return <StartupStage presentation={startupPresentation} runtimeId={TIINEX_RUNTIME_ID} sourceBoundary={CLEAN_URL_BOUNDARY} />;
  const shellClasses = [
    'tx-react-runtime',
    'tx-uc001-shell',
    'tx-shell-config-grounded',
    'tx-shell-route-grounded',
    'tx-shell-command-portable',
    'tx-shell-scroll-owned',
    'tx-shell-footer-row-owned',
    'tx-schema-companion-runtime',
    playthingsExperiment ? 'tx-playthings-mode' : '',
    active ? 'tx-workspace-mode' : 'tx-empty-stage-mode'
  ].join(' ');
  return (
    <main className={shellClasses} data-runtime={TIINEX_RUNTIME_ID} data-source-boundary={CLEAN_URL_BOUNDARY} data-uc="UC-001-empty-create-local-workspace-add-flow" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (event.dataTransfer) { event.preventDefault(); if (!playthingsExperiment && activeTemporal?.mode === 'historical') { setNotice('Return to latest before importing material.'); return; } void addLocalFiles(event.dataTransfer, { sourceMode: playthingsExperiment ? 'playthings-global-drop' : 'stage-drop', fromDataTransfer: true, dropScope: 'global' }); } }}>
      <GlobalDock
        hasWorkspace={Boolean(active)}
        workspaceCount={state.workspaces.length}
        pagerVisible={!playthingsExperiment && pagerVisible}
        previousWorkspaceEnabled={workspaceWindow.previousEnabled}
        nextWorkspaceEnabled={workspaceWindow.nextEnabled}
        onPreviousWorkspace={() => pageWorkspaceWindow('previous')}
        onNextWorkspace={() => pageWorkspaceWindow('next')}
        onCreate={activeTemporal?.mode === 'historical' ? () => setNotice('Return to latest before creating or importing material.') : openCreate}
        homeHref={workspaceHomeHref(activeWorkspaceConfig, typeof window !== 'undefined' ? window.location : null)}
        onShare={shareCurrent}
        onHelp={() => setDialog('help')}
        playthingsActive={playthingsExperiment}
        onTogglePlaythings={playthingsExperiment ? exitPlaythings : () => setPlaythingsOpen(true)}
      />
      {playthingsExperiment ? (
        <PlaythingsMultiverse workspaces={state.workspaces} onRefresh={refreshPlaythingsMaterial} onOpenRecord={openRecord} onOpenLineage={(recordId, workspaceId) => focusRecordLineage(recordId, workspaceId, true)} onResolveLineage={(recordId, workspaceId) => playthingsLineageSnapshotFor(latestStateRef.current || state, recordId, workspaceId)} onCreateSkill={openPlaythingsCreateSkill} onResolveTransitions={playthingsTransitionOptions} onActivateTransition={activatePlaythingsTransition} />
      ) : active ? (
        <div
          className={`${visibleWorkspaceItems.length > 1 ? 'tx-workspace-multicolumn-stage' : 'tx-workspace-single-stage'} ${visibleWorkspaceItems.length === 1 && visibleWorkspaceItems[0]?.layoutMode === 'compact' ? 'tx-workspace-single-stage-compact' : ''}`.trim()}
          data-workspace-columns={visibleWorkspaceItems.length}
          data-window-from={workspaceWindow.from}
          data-window-to={workspaceWindow.to}
          style={{ '--tx-visible-workspace-columns': visibleWorkspaceItems.length, '--tx-workspace-columns': workspaceGridColumns }}
        >
          {visibleWorkspaceItems.map(({ workspace, ui, active: itemActive, surfaceState, layoutMode }) => {
            const itemView = (surfaceState || state).view || {};
            const itemTemporal = timePortalViewFor(itemView);
            const itemReadModel = timePortalReadFor(workspace, itemView);
            const historicalResolved = itemTemporal?.mode === 'historical';
            const historicalWorkspace = historicalResolved && itemReadModel ? historicalWorkspaceForReadModel(workspace, itemReadModel) : null;
            const presentedWorkspace = historicalResolved ? (historicalWorkspace || Object.assign({}, ui || workspace, { records: [], assets: [], sources: [], sourceOrder: [], historicalReview: true, historicalSnapshot: itemTemporal.snapshot })) : (ui || workspace);
            return (
            <div key={workspace.id} className={`tx-workspace-frame ${itemActive ? 'tx-workspace-frame-active' : 'tx-workspace-frame-inactive'} ${layoutMode === 'compact' ? 'tx-workspace-frame-compact' : 'tx-workspace-frame-expanded'}`} onMouseDownCapture={() => { if (!selection.session && !itemActive) activateWorkspace(workspace.id); }}>
              <WorkspaceColumnSurface
                workspace={presentedWorkspace}
                state={surfaceState || state}
                referenceRecords={referenceParticipantRecords}
                layoutMode={selection.session ? 'expanded' : layoutMode}
                selectionSession={selection.session}
                onSelectionChoose={selection.choose}
                onSelectionCancel={selection.cancel}
                onLayoutMode={(mode) => setWorkspaceLayoutMode(workspace.id, mode)}
                onClose={() => openWorkspaceDialog('close-workspace', workspace.id)}
                onRenameWorkspace={() => openWorkspaceDialog('rename-workspace', workspace.id)}
                onVerse={(verse) => setVerse(verse, workspace.id)}
                onQuery={(query) => setQuery(query, workspace.id)}
                onOpenDisplayOptions={() => openWorkspaceDialog('display-options', workspace.id)}
                onOpenAddDialog={(sourceId = '') => openAddToWorkspace(sourceId, workspace.id)}
                onOpenCreateArtifact={() => openWorkspaceDialog('create-artifact', workspace.id)}
                onExportWorkspace={() => openWorkspaceExportDialog(workspace.id)}
                onShareWorkspace={() => historicalResolved ? shareCurrent() : shareWorkspace(workspace.id)}
                onCloseSource={(sourceId) => closeSource(sourceId, workspace.id)}
                onDropFiles={historicalResolved ? undefined : (fileList, options = {}) => addLocalFiles(fileList, Object.assign({}, options, { workspaceId: workspace.id }))}
                onOpenRecord={(recordId) => openRecord(recordId, workspace.id)}
                onFocusRecordLineage={(recordId) => focusRecordLineage(recordId, workspace.id)}
                onOpenAsset={(assetId) => openAsset(assetId, workspace.id)}
                onShareRecord={(record) => shareRecord(record, workspace.id)}
                onRecordAction={(record, action) => openRecordAction(record, action, workspace.id)}
                onOpenSchema={(record) => openSchemaForRecord(record, workspace.id)}
                onToggleTreeFolder={(folderPath, open) => toggleTreeFolder(folderPath, open, workspace.id)}
                onSourceTransportRefresh={(sourceId, currentTier, surfaceKeys) => refreshSourceTransport(sourceId, currentTier, surfaceKeys, workspace.id)}
                onOpenGovernance={(sourceId) => openGovernanceBoundary(sourceId, workspace.id)}
                onViewScroll={(verse, top) => noteViewScroll(workspace.id, verse, top)}
                stageScrollTop={currentStageScrollTop(workspace.id, surfaceState || state)}
                expandedLineageRecordIds={(surfaceState || state).view?.expandedLineageRecordIds || []}
                lineageAuditReport={(surfaceState || state).view?.lineageAuditReport || null}
                lineageLoadReport={(surfaceState || state).view?.lineageLoadReport || null}
                onToggleLineageCard={(recordId) => toggleLineageCard(recordId, workspace.id)}
                onRunLineageAudit={() => runLineageAudit(workspace.id)}
                onLoadFullLineage={() => loadFullLineage(workspace.id)}
                timePortal={itemTemporal}
                historicalReadModel={itemReadModel}
                readOnlyHistorical={historicalResolved}
                onLoadHistoricalSnapshot={() => loadHistoricalSnapshot(workspace.id)}
                onReturnToLatest={() => returnTimePortalToLatest(workspace.id)}
              />
            </div>
            );
          })}
        </div>
      ) : (
        <EmptyStage workspaceConfig={activeWorkspaceConfig} />
      )}
      {notice && !playthingsExperiment ? <div className="tx-toast" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div> : null}
      <footer className="tx-footer" translate="no" title="Powered by Tiinex">Powered by <a href="https://github.com/Tiinex" target="_blank" rel="noopener noreferrer">Tiinex</a></footer>
      {dialog === 'create-workspace' ? <CreateWorkspaceDialog error={createError} onSubmit={createWorkspace} onDismiss={dismissDialog} /> : null}
      {dialog === 'create-artifact' && dialogWorkspace ? <WorkspaceCanonicalCreateDialog workspace={dialogWorkspaceUi || dialogWorkspace} actions={workspaceCreateActions} preferredSchemaId={preferredCreateSchemaId} placementTargets={placementSelectionOptions.dialog?.options || []} selectionSession={selection.session} selectionResult={selection.result} onBeginSelection={selection.begin} onSelectionConsumed={selection.consume} onDismiss={dismissDialog} onCreate={canonicalCreation.createTransitionRecord} /> : null}
      {dialog === 'rename-workspace' && dialogWorkspace ? <RenameWorkspaceDialog workspace={dialogWorkspaceUi || dialogWorkspace} onSubmit={renameWorkspace} onDismiss={dismissDialog} /> : null}
      {dialog === 'close-workspace' && dialogWorkspace ? <CloseWorkspaceDialog workspace={dialogWorkspaceUi || dialogWorkspace} onDismiss={dismissDialog} onConfirm={() => closeWorkspace(dialogWorkspace.id)} /> : null}
      {activeRecord ? <RecordDetailDialog record={activeRecord} onDismiss={dismissRecord} onShare={activeRecord?.historicalSnapshot ? null : () => shareRecord(activeRecord)} /> : null}
      {activeAsset ? <AssetDetailDialog asset={activeAsset} onDismiss={dismissAsset} /> : null}
      {actionRecord ? <RecordActionDialog record={actionRecord} action={recordAction.action} schemaRegistry={schemaRegistry} workspaceId={actionWorkspace?.id || ''} workspaceRecords={actionWorkspace?.records || []} referenceTargets={referenceSelectionOptions?.options || []} placementTargets={placementSelectionOptions.action?.options || []} selectionSession={selection.session} selectionResult={selection.result} onBeginSelection={selection.begin} onSelectionConsumed={selection.consume} onDismiss={dismissRecordAction} onShare={() => shareRecord(actionRecord, actionWorkspace?.id || '')} onCreateTransition={createTransitionRecord} onCreateCanonicalTransition={canonicalCreation.createTransitionRecord} onCreateCanonicalReference={canonicalCreation.createReferenceRecord} onUpdateLocalDraft={updateLocalDraftRecord} /> : null}
      {dialog === 'display-options' && dialogWorkspace ? <DisplayOptionsDialog options={dialogWorkspaceView?.displayOptions} counts={buildDisplayOptionCounts(dialogWorkspaceUi || dialogWorkspace)} scope={dialogWorkspaceView?.workspaceVerse === 'lineage' ? 'lineage' : 'discovery'} timePortal={timePortalViewFor(dialogWorkspaceView)} onResolveTimePortal={(intent) => openTimePortalResolver(intent, dialogWorkspace.id)} onReturnLatest={() => returnTimePortalToLatest(dialogWorkspace.id)} onSubmit={setDisplayOptions} onDismiss={dismissDialog} /> : null}
      {dialog === 'time-portal-resolve' && dialogWorkspace ? <TimePortalResolveDialog timePortal={timePortalViewFor(dialogWorkspaceView)} sources={timePortalGithubSources(dialogWorkspace)} busy={timePortalBusy} error={timePortalError} onResolve={resolveTimePortalFromDialog} onDismiss={dismissDialog} /> : null}
      {dialog === 'export-workspace' && dialogWorkspace ? <WorkspaceExportDialogController workspace={dialogWorkspaceUi || dialogWorkspace} onDismiss={dismissDialog} onExecute={executeWorkspaceExport} onPublicationResult={persistWorkspacePublicationResult} /> : null}
      {dialog === 'add-to-workspace' && dialogWorkspace ? (
        <AddToWorkspaceDialog
          workspace={dialogWorkspaceUi || dialogWorkspace}
          sourceContinuation={(dialogWorkspaceUi || dialogWorkspace).sources?.find((source) => source.id === sourceContinuationId) || null}
          onDismiss={dismissDialog}
          onAddFiles={(fileList, options = {}) => addLocalFiles(fileList, Object.assign({}, options, { workspaceId: dialogWorkspace.id }))}
          onAddPastedTrace={addPastedTrace}
          onAddGitHubSource={(input) => addGitHubSource(input, { state: latestStateRef.current || state, workspaceId: dialogWorkspace.id, semanticNavigation: true })}
          onAddUrls={addExplicitUrls}
          githubBusy={githubRequestPending}
        />
      ) : null}
      {dialog === 'import-conflict' && pendingLocalImport ? <ImportConflictDialog conflicts={pendingLocalImport.conflicts} onResolve={resolveLocalImportConflict} onDismiss={() => resolveLocalImportConflict('cancel')} /> : null}
      {dialog === 'workspace-entrypoint-choice' && pendingWorkspaceEntrypoint ? <WorkspaceEntrypointChoiceDialog entries={pendingWorkspaceEntrypoint.workspaceEntries} onResolve={resolveWorkspaceEntrypointChoice} onDismiss={() => resolveWorkspaceEntrypointChoice('cancel')} /> : null}
      {governanceDialogSource && governanceDialogData ? <GovernanceBoundaryDialog source={governanceDialogSource} boundary={governanceDialogData.boundary} documents={governanceDialogData.documents} onDismiss={dismissDialog} /> : null}
      {dialog === 'help' ? <HelpDialog workspaceConfig={activeWorkspaceConfig} onDismiss={dismissDialog} /> : null}
    </main>
  );
}
