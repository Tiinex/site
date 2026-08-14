import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { appendImportSummary } from '../workspaces/workspace.import.js';
import { setWorkspaceDiscoveryProgress, clearWorkspaceDiscoveryProgress } from '../workspaces/workspace.discoveryProgress.js';
import { stateWithSourceMaterialCleared } from '../workspaces/workspace.sourceMaterial.js';
import { buildSourceTransportPolicy } from '../sources/transport.policy.js';
import { clearGithubSourceTextCacheForSource, githubTransportOrderFromTier, normalizeGithubTransportTier } from '../sources/github/github.transport.js';
import { githubRequestedSurfaces, githubSourceFormState, mergeGithubRequestedSurfaces } from './githubSourceInput.js';
import { summarizeGithubMaterialization, normalizeRepository } from './githubMaterializationSummary.js';
import { shouldCommitGithubProgress, yieldForVisibleSourceProgress } from './githubProgress.js';
import { appConfigMaterializationNotice } from './workspaceContinuityNotices.js';
import { applyGithubSourceMaterializationCommand } from './githubSourceMaterializationCommand.js';
import { normalizeExplicitFileRefs } from '../sources/source.explicitTargets.js';

export async function runGithubSourceOperation(context = {}) {
  const {
    input = {},
    options = {},
    state,
    active,
    runtimeApi,
    workspaceConfig,
    githubRequestPending = false,
    operationRef = { current: { token: null, controller: null } },
    setNotice = () => {},
    setDialog = () => {},
    setGithubRequestPending = () => {},
    commit = () => {},
    getLatestState = () => state,
    fetchImpl = globalThis.fetch?.bind(globalThis),
    AbortControllerImpl = globalThis.AbortController
  } = context;
  const lifecycle = runtimeApi?.lifecycle;
  const sourceState = options.state || getLatestState() || state;
  const targetWorkspaceId = options.workspaceId || sourceState?.activeWorkspaceId || active?.id || '';
  const targetWorkspace = (Array.isArray(sourceState?.workspaces) ? sourceState.workspaces : []).find((workspace) => workspace.id === targetWorkspaceId) || active || null;
  if (githubRequestPending && input.abortPreviousGithubOperation !== true) { setNotice('GitHub source operation already in progress.'); return { ok: false, error: 'github.operation.pending', state: sourceState }; }
  if (githubRequestPending && input.abortPreviousGithubOperation === true) try { operationRef.current?.controller?.abort?.(); } catch (_) {}
  const operationToken = Symbol('github-source-operation'); let operationController = null;
  const operationIsCurrent = () => !operationController || operationRef.current?.token === operationToken;
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
  const explicitFileRefs = normalizeExplicitFileRefs(input.explicitFileRefs ?? input.fileRefs ?? existingSource?.explicitFileRefs ?? existingSource?.config?.explicitFileRefs ?? []);
  const fileRefs = explicitFileRefs.slice();
  const selectedTransportSurfaces = Array.isArray(input.transportRefreshSurfaces) ? input.transportRefreshSurfaces.filter(Boolean) : [];
  const requestedSurfacesForInput = selectedTransportSurfaces.length ? mergeGithubRequestedSurfaces(existingSource?.requestedSurfaces || {}, githubRequestedSurfaces(input, fileRefs), selectedTransportSurfaces) : githubRequestedSurfaces(input, fileRefs);
  const preservedSourceState = registerOnly && existingSource ? { count: Number(existingSource.count || 0), discoveryState: existingSource.discoveryState, surfaces: existingSource.surfaces, transportOutcome: existingSource.transportOutcome, transportPlan: existingSource.transportPlan, transportTiers: existingSource.transportTiers } : {};
  const result = lifecycle?.addWorkspaceSource?.(sourceState, targetWorkspaceId, Object.assign({
    id: sourceId, kind: input.sourceKind || input.kind || 'github-tree', label, repository, ref, rootPath,
    repoDiscovery: Boolean(input.repoDiscovery), issueDiscovery: Boolean(input.issueDiscovery), issueUrls: input.issueUrls || '', explicitFileRefs,
    workspaceMatch: input.workspaceMatch || '', appConfigPlan: input.appConfigPlan || '', openBehavior: input.openBehavior || '', preferredDisplay: input.preferredDisplay || '',
    transportLabel, transportRefreshTier, requestedSurfaces: requestedSurfacesForInput
  }, preservedSourceState));
  if (!result?.ok) {
    setNotice('Could not add GitHub source.');
    setGithubRequestPending(false);
    return { ok: false, error: result?.error || 'github.source.add.failed', state: sourceState };
  }
  const wantsMaterialization = !registerOnly && Boolean(fileRefs.length || input.repoDiscovery || input.issueDiscovery || input.issueUrls);
  if (wantsMaterialization && typeof AbortControllerImpl !== 'undefined') { operationController = new AbortControllerImpl(); operationRef.current = { token: operationToken, controller: operationController }; }
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
    finalState = appendImportSummary(lifecycle, finalState, {
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
      const fetchForOperation = operationController ? (url, init = {}) => fetchImpl(url, Object.assign({}, init || {}, { signal: operationController.signal })) : fetchImpl;
      const out = await materializeGithubSource(result.source, {
        fileRefs,
        repoDiscovery: Boolean(input.repoDiscovery),
        issueDiscovery: Boolean(input.issueDiscovery),
        issueUrls: input.issueUrls || '',
        explicitFileRefs,
        workspaceMatch: input.workspaceMatch || ''
      }, { fetchImpl: fetchForOperation, abortSignal: operationController?.signal || null, maxFiles: 500, transportPolicy, workspaceConfig, onProgress: publishGithubProgress, preferredTransports: preferredTransports || undefined, transportOrderExact: Boolean(preferredTransports), allowCache: input.allowSourceCache === true, sourceCacheCleared, hostedRepoMirrorBaseUrls: input.hostedRepoMirrorBaseUrls || [], hostedIssueSnapshotBaseUrls: input.hostedIssueSnapshotBaseUrls || [] });
      if (!operationIsCurrent()) return { ok: false, error: 'github.operation.stale', state: finalState };
      const resolvedRef = String(out.diagnostics?.resolvedRef || '').trim();
      if (resolvedRef && !String(result.source.ref || '').trim()) {
        const pinned = lifecycle?.addWorkspaceSource?.(finalState, targetWorkspaceId, Object.assign({}, result.source, {
          id: materializationSourceId,
          repository: result.source.repo || repository,
          repo: result.source.repo || repository,
          ref: resolvedRef,
          rootPath: result.source.rootPath || rootPath,
          label: result.source.label || label,
          discoveryState: 'deferred',
          repoDiscovery: Boolean(input.repoDiscovery),
          issueDiscovery: Boolean(input.issueDiscovery),
          issueUrls: input.issueUrls || '',
          explicitFileRefs,
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
      await yieldForVisibleSourceProgress();
      const appliedSource = applyGithubSourceMaterializationCommand({
        lifecycle,
        state: finalState,
        workspaceId: targetWorkspaceId,
        source: result.source,
        sourceId: materializationSourceId,
        sourceLabel: materializationSourceLabel,
        adapterResult: out,
        repository,
        ref: resolvedRef || ref,
        rootPath,
        repoDiscovery: Boolean(input.repoDiscovery),
        issueDiscovery: Boolean(input.issueDiscovery),
        issueUrls: input.issueUrls || '',
        explicitFileRefs,
        workspaceMatch: input.workspaceMatch || '',
        appConfigPlan: input.appConfigPlan || '',
        openBehavior: input.openBehavior || '',
        preferredDisplay: input.preferredDisplay || '',
        requestedSurfaces: requestedSurfacesForInput,
        selectedTransportSurfaces,
        existingSource,
        transportLabel,
        transportRefreshTier,
        preserveView: Boolean(input.preserveView)
      });
      if (appliedSource?.ok) finalState = appliedSource.state;
      noticeMessage = appConfigMaterializationNotice(input, materializationSourceLabel, summarizeGithubMaterialization(materializationSourceLabel, out));
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
  if (operationController && operationIsCurrent()) operationRef.current = { token: null, controller: null };
  setDialog(null);
  setNotice(noticeMessage);
  setGithubRequestPending(false);
  commit(finalState, 'push');
  return { ok: true, state: finalState, sourceId: materializationSourceId };
}

export function abortGithubSourceOperation(operationRef = { current: null }) {
  try { operationRef.current?.controller?.abort?.(); } catch (_) {}
}

export function clearGithubSourceCacheForSource(source = {}) {
  return clearGithubSourceTextCacheForSource(source);
}
