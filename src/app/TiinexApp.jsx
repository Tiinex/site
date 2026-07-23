import React, { useEffect, useMemo, useRef, useState } from 'react';
import { schemaRegistry } from '../schemas/registry.js';
import { Button } from '../ui/primitives/Button.jsx';
import { Badge } from '../ui/primitives/Badge.jsx';
import { Modal } from '../ui/primitives/Modal.jsx';
import { materializeGithubSource } from '../adapters/github/github.adapter.js';
import { collectLocalFilesFromDataTransfer, materializeLocalMarkdownFiles } from '../adapters/local/local.adapter.js';
import { materializeExplicitUrls } from '../adapters/static/static.adapter.js';
import { applyLocalAdapterResultToWorkspace, appendImportSummary } from '../workspaces/workspace.import.js';
import { setWorkspaceDiscoveryProgress, clearWorkspaceDiscoveryProgress } from '../workspaces/workspace.discoveryProgress.js';
import { buildSourceTransportPolicy } from '../sources/transport.policy.js';
import { clearGithubSourceTextCacheForSource, hydrateGithubRecordFromSourceCache } from '../sources/github/github.transport.js';
import { buildWorkspaceAuditView } from '../workspaces/workspace.auditView.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';
import { inferRecordMaterialRole, isSupportingRecord, sourceBoundaryClass, MaterialRole } from '../workspaces/workspace.materialRole.js';
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
    view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: false, leavesOnly: true, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' }, expandedTreeFolders: [] },
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
    return `Loaded ${okCount} source file${okCount === 1 ? '' : 's'}${warnings.length ? `; ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ''}${githubSurfaceSummary(out) ? ` · ${githubSurfaceSummary(out)}` : ''}.`;
  }
  if (okCount > 0) {
    return `Loaded ${okCount} source file${okCount === 1 ? '' : 's'}; ${failCount} failed/deferred${githubSurfaceSummary(out) ? ` · ${githubSurfaceSummary(out)}` : ''}.`;
  }
  if (firstWarning?.message) return `${sourceLabel} source registered. ${firstWarning.message}`;
  if (firstError?.error) return `${sourceLabel} source registered; source loading failed: ${firstError.error}.`;
  return `${sourceLabel} source registered; no source files loaded.`;
}

function githubSurfaceSummary(out = {}) {
  const surfaces = out.diagnostics?.surfaces || {};
  const parts = [];
  const repo = surfaces.repoFiles || {};
  const explicit = surfaces.explicitFiles || {};
  const issues = surfaces.issueSnapshots || {};
  if (repo.requested) parts.push(`Repo files: ${Number(repo.loaded || 0)} loaded${repo.discovered != null ? ` / ${Number(repo.discovered || 0)} discovered` : ''}`);
  if (explicit.requested) parts.push(`Explicit files: ${Number(explicit.loaded || 0)} loaded${explicit.requestedCount != null ? ` / ${Number(explicit.requestedCount || 0)} requested` : ''}`);
  if (issues.requested) {
    const issueState = Number(issues.loaded || 0) > 0
      ? `${Number(issues.loaded || 0)} loaded`
      : issues.deferred || issues.unavailable
        ? 'deferred in browser runtime'
        : `${Number(issues.targets || 0)} targets`;
    parts.push(`Issue snapshots: ${issueState}`);
  }
  return parts.join(' · ');
}


function isSupportingMarkdownForDisplay(record = {}) {
  return isSupportingRecord(record);
}

function displaySchemaValue(record = {}) {
  return String(record.schemaId || record.currentSchemaId || record.envelopeSchemaId || record.kind || 'artifact').trim() || 'artifact';
}

function displayArtifactClass(record = {}) {
  return inferRecordMaterialRole(record);
}

function buildDisplayOptionCounts(workspace = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const audit = buildWorkspaceAuditView(workspace, { records, query: '' });
  const auditById = new Map((audit.items || []).map((item) => [item.id, item]));
  const schemaCounts = new Map();
  const artifactCounts = new Map();
  const sourceCounts = new Map();
  for (const record of records) {
    const schema = displaySchemaValue(record);
    schemaCounts.set(schema, (schemaCounts.get(schema) || 0) + 1);
    const artifact = displayArtifactClass(record);
    artifactCounts.set(artifact, (artifactCounts.get(artifact) || 0) + 1);
    const source = sourceBoundaryClass(record);
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
  }
  const mismatchItems = (audit.items || []).filter((item) => {
    const status = String(item.status || '').toLowerCase();
    return status && !['readable', 'supporting-material', 'pending-unavailable', 'degraded'].includes(status);
  });
  return {
    records: records.length,
    leaves: artifactCounts.get(MaterialRole.leaf) || 0,
    supportingMarkdown: (artifactCounts.get(MaterialRole.supporting) || 0) + (artifactCounts.get(MaterialRole.schemaDefinition) || 0) + (artifactCounts.get(MaterialRole.unknown) || 0),
    mismatches: mismatchItems.length,
    assets: workspace.assets?.length || 0,
    workspaceCandidates: workspace.workspaceMergeCandidates?.length || 0,
    schemaChoices: Array.from(schemaCounts.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    artifactChoices: [MaterialRole.leaf, MaterialRole.schemaDefinition, MaterialRole.supporting, MaterialRole.unknown].filter((key) => artifactCounts.has(key)).map((key) => [key, artifactCounts.get(key)]),
    sourceChoices: ['source-backed', 'local', 'unknown'].filter((key) => sourceCounts.has(key)).map((key) => [key, sourceCounts.get(key)])
  };
}


function summarizeGithubAdapterResult(out = {}) {
  const warnings = Array.isArray(out.warnings) ? out.warnings : [];
  const errors = Array.isArray(out.errors) ? out.errors : [];
  return {
    schema: 'tiinex.workspace.import.result.v1',
    ok: Number(out.okCount || 0) > 0 || warnings.length > 0,
    message: `GitHub source materialization: ${Number(out.okCount || 0)} loaded · ${warnings.length} warning${warnings.length === 1 ? '' : 's'} · ${errors.length} error${errors.length === 1 ? '' : 's'}${githubSurfaceSummary(out) ? ` · ${githubSurfaceSummary(out)}` : ''}.`,
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
  const [sourceContinuationId, setSourceContinuationId] = useState('');
  const viewScrollRef = useRef({});
  const latestStateRef = useRef(state);
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

  function commit(nextState, mode = 'push') {
    const sourceState = latestStateRef.current || state;
    const withScroll = preserveCapturedViewScroll(nextState, sourceState);
    latestStateRef.current = withScroll;
    setState(withScroll);
    if (withScroll?.workspaces?.length) runtime().persistence?.writeState?.(withScroll, { mode });
    else runtime().persistence?.clearState?.({ mode });
  }

  function viewScrollKeyFor(sourceState = state, viewOverride = null) {
    const view = viewOverride || sourceState?.view || {};
    const workspaceId = sourceState?.activeWorkspaceId || active?.id || 'workspace';
    const verse = view.workspaceVerse || 'feed';
    const query = verse === 'lineage' ? (view.lineageQuery || '') : (view.query || '');
    const selected = verse === 'lineage' ? (view.selectedRecordId || '') : '';
    const display = view.displayOptions ? JSON.stringify(view.displayOptions) : '';
    return `${workspaceId}:${verse}:${query}:${selected}:${display}`;
  }

  function preserveCapturedViewScroll(nextState = state, sourceState = state) {
    const key = viewScrollKeyFor(sourceState);
    const top = viewScrollRef.current[key];
    if (!Number.isFinite(Number(top))) return nextState;
    const next = structuredClone(nextState);
    const scrollPositions = Object.assign({}, next.view?.scrollPositions || {});
    const roundedTop = Math.max(0, Math.round(Number(top)));
    if (Number(scrollPositions[key] || 0) === roundedTop) return nextState;
    scrollPositions[key] = roundedTop;
    next.view = Object.assign({}, next.view || {}, { scrollPositions });
    return next;
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
    const fileRefs = Array.isArray(input.fileRefs) ? input.fileRefs : String(input.fileRefs || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
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
      transportLabel: 'cache → mirror → proxy → direct',
      requestedSurfaces: {
        repoFiles: { requested: Boolean(input.repoDiscovery) },
        explicitFiles: { requested: Boolean(fileRefs.length), requestedCount: fileRefs.length },
        issueSnapshots: { requested: Boolean(input.issueDiscovery || input.issueUrls) }
      }
    });
    if (!result?.ok) {
      setNotice('Could not add GitHub source.');
      setGithubRequestPending(false);
      return;
    }
        const wantsMaterialization = Boolean(fileRefs.length || input.repoDiscovery || input.issueDiscovery || input.issueUrls);
    const selectedOperations = [
      input.repoDiscovery ? 'repo files discovery' : '',
      fileRefs.length ? 'explicit file loading' : '',
      input.issueDiscovery || input.issueUrls ? 'issue snapshot loading' : ''
    ].filter(Boolean);
    const operationLabel = selectedOperations.length ? selectedOperations.join(' + ') : 'boundary registration';
    let finalState = result.state;
    let materializationSourceId = result.source.id;
    let materializationSourceLabel = result.source.label;
    let noticeMessage = `${result.source.label} source registered. No loading is running; choose Discover on the source to select repo files, explicit files, or issue snapshots.`;
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
        commit(finalState, 'replace');
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
        label: `${result.source.label} accepted · ${operationLabel} via cache → mirror → proxy → direct transport`,
        active: true,
        quantified: false,
        discoveryState: 'loading'
      }).state || finalState;
      setDialog(null);
      setNotice(`${result.source.label} source registered; loading started.`);
      commit(finalState, 'push');
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
        }, { fetchImpl: fetch, maxFiles: 500, transportPolicy, workspaceConfig, onProgress: publishGithubProgress });
        const resolvedRef = String(out.diagnostics?.resolvedRef || '').trim();
        if (resolvedRef && !String(result.source.ref || '').trim()) {
          const pinned = runtime().lifecycle?.addWorkspaceSource?.(finalState, active?.id, Object.assign({}, result.source, {
            repository: result.source.repo || repository,
            repo: result.source.repo || repository,
            ref: resolvedRef,
            rootPath: result.source.rootPath || rootPath,
            label: result.source.label || label,
            discoveryState: 'deferred',
            repoDiscovery: Boolean(input.repoDiscovery),
            issueDiscovery: Boolean(input.issueDiscovery || input.issueUrls),
            issueUrls: input.issueUrls || '',
            requestedSurfaces: {
              repoFiles: { requested: Boolean(input.repoDiscovery) },
              explicitFiles: { requested: Boolean(fileRefs.length), requestedCount: fileRefs.length },
              issueSnapshots: { requested: Boolean(input.issueDiscovery || input.issueUrls) }
            }
          }));
          if (pinned?.ok) {
            finalState = pinned.state;
            materializationSourceId = pinned.source.id;
            materializationSourceLabel = pinned.source.label || materializationSourceLabel;
          }
        }
        if (out.okCount > 0) {
          const ins = runtime().lifecycle?.addWorkspaceSourceRecords?.(finalState, active?.id, materializationSourceId, out.records || []);
          if (ins?.ok) finalState = ins.state;
        }
        const sourceState = Number(out.okCount || 0) > 0
          ? (Number(out.failCount || 0) > 0 ? 'partial' : 'loaded')
          : (Number(out.failCount || 0) > 0 || (out.errors || []).length ? 'failed' : 'unavailable');
        const updatedSource = runtime().lifecycle?.addWorkspaceSource?.(finalState, active?.id, Object.assign({}, result.source, {
          id: materializationSourceId,
          label: materializationSourceLabel,
          count: Number(out.okCount || 0),
          discoveryState: sourceState,
          repoDiscovery: Boolean(input.repoDiscovery),
          issueDiscovery: Boolean(input.issueDiscovery || input.issueUrls),
          issueUrls: input.issueUrls || '',
          requestedSurfaces: {
            repoFiles: { requested: Boolean(input.repoDiscovery) },
            explicitFiles: { requested: Boolean(fileRefs.length), requestedCount: fileRefs.length },
            issueSnapshots: { requested: Boolean(input.issueDiscovery || input.issueUrls) }
          },
          surfaces: out.diagnostics?.surfaces || {},
          sourcePlan: out.diagnostics?.sourcePlan || {},
          recordAttribution: out.diagnostics?.recordAttribution || [],
          transportTiers: out.diagnostics?.transportTiers || {},
          transportOutcome: out.diagnostics?.transportOutcome || {},
          transportPlan: out.diagnostics?.transportPlan || {},
          transportLabel: out.diagnostics?.transportPlan?.label || 'cache → mirror → proxy → direct'
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

  function refreshSourceTransport(sourceId) {
    const source = (active?.sources || []).find((item) => String(item.id || '') === String(sourceId || ''));
    if (!source) {
      setNotice('Source not found.');
      return;
    }
    const removed = clearGithubSourceTextCacheForSource(source);
    setNotice(`${source.label || 'Source'} cache cleared (${removed} entr${removed === 1 ? 'y' : 'ies'}). Source controls opened; retry uses mirror/proxy before direct when configured.`);
    openAddToWorkspace(source.id || sourceId);
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
    const next = structuredClone(state);
    next.view = Object.assign({}, next.view || {}, {
      workspaceVerse: 'lineage',
      selectedRecordId: id,
      lineageQuery: '',
      expandedLineageRecordIds: [],
      lineageAuditReport: null,
      lineageLoadReport: null
    });
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

  function lineageLoadReportForSelected(sourceState = state) {
    const view = sourceState?.view || {};
    const selectedRecordId = String(view.selectedRecordId || '').trim();
    const report = view.lineageLoadReport || null;
    return selectedRecordId && report && String(report.selectedRecordId || '') === selectedRecordId ? report : null;
  }

  function loadFullLineage() {
    if (!active) return;
    const selectedRecordId = String(state.view?.selectedRecordId || '').trim();
    const records = Array.isArray(active.records) ? active.records : [];
    if (!selectedRecordId) {
      setNotice('Select an artifact lineage before loading lineage.');
      return;
    }
    const lineage = buildWorkspaceLineageView(active, { records, query: '', selectedRecordId });
    const traversal = lineage.selectedTraversal || null;
    const nodes = Array.isArray(traversal?.nodes) ? traversal.nodes : [];
    const stateLabel = traversal?.complete ? 'complete' : 'partial';
    const terminalState = traversal?.terminalState || traversal?.status?.terminalState || (stateLabel === 'complete' ? 'complete' : 'partial');
    const scopeTransitions = Array.isArray(traversal?.scopeTransitions) ? traversal.scopeTransitions : [];
    const next = structuredClone(state);
    next.view = Object.assign({}, next.view || {}, {
      lineageQuery: '',
      lineageLoadReport: {
        schema: 'tiinex.workspace.lineageLoadReport.v1',
        selectedRecordId,
        mode: 'loaded-workspace',
        state: stateLabel,
        terminalState,
        statusLabel: traversal?.status?.label || '',
        nodes: nodes.length,
        rootReached: Boolean(traversal?.rootReached),
        noParentDeclared: Boolean(traversal?.noParentDeclared),
        hasMissing: Boolean(traversal?.hasMissing),
        ambiguous: Boolean(traversal?.ambiguous),
        depthLimited: Boolean(traversal?.depthLimited),
        scopeTransitions: scopeTransitions.length,
        generatedAt: new Date().toISOString()
      },
      lineageAuditReport: null
    });
    setNotice(stateLabel === 'complete' ? 'Full loaded-workspace lineage index ready.' : 'Loaded lineage index is partial; terminal root was not proven.');
    commit(next, 'replace');
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
    if (!existingLoadReport && !lineage.selectedTraversal?.complete) {
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
      ambiguous: Boolean(lineage.selectedTraversal?.ambiguous),
      depthLimited: Boolean(lineage.selectedTraversal?.depthLimited),
      scopeTransitions: Array.isArray(lineage.selectedTraversal?.scopeTransitions) ? lineage.selectedTraversal.scopeTransitions.length : 0
    };
    const auditState = loadReport?.state === 'complete' && lineage.selectedTraversal?.complete ? 'complete' : 'partial';
    const next = structuredClone(state);
    next.view = Object.assign({}, next.view || {}, {
      lineageAuditReport: {
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
      }
    });
    commit(next, 'replace');
  }

  function setVerse(verse) {
    const currentVerse = state.view?.workspaceVerse || 'feed';
    if ((verse === 'feed' || verse === 'tree') && currentVerse === 'lineage' && Array.isArray(state.view?.expandedLineageRecordIds) && state.view.expandedLineageRecordIds.length) {
      const collapsed = structuredClone(state);
      collapsed.view = Object.assign({}, collapsed.view || {}, { expandedLineageRecordIds: [] });
      commit(collapsed, 'replace');
      return;
    }
    const next = runtime().lifecycle?.setWorkspaceVerse?.(state, verse) || state;
    if (verse === 'feed' || verse === 'tree') {
      next.view = Object.assign({}, next.view || {}, { selectedRecordId: '', expandedLineageRecordIds: [], lineageAuditReport: null, lineageLoadReport: null });
    }
    commit(next, 'push');
  }

  function toggleLineageCard(recordId) {
    const id = String(recordId || '').trim();
    if (!id) return;
    const next = structuredClone(state);
    const current = new Set(Array.isArray(next.view?.expandedLineageRecordIds) ? next.view.expandedLineageRecordIds : []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    next.view = Object.assign({}, next.view || {}, { expandedLineageRecordIds: Array.from(current) });
    commit(next, 'replace');
  }

  function setQuery(query) {
    const next = structuredClone(state);
    const verse = next.view?.workspaceVerse || 'feed';
    next.view = verse === 'lineage'
      ? Object.assign({}, next.view || {}, { lineageQuery: query })
      : Object.assign({}, next.view || {}, { query });
    commit(next, 'replace');
  }

  function setDisplayOptions(options) {
    const next = structuredClone(state);
    next.view = Object.assign({}, next.view || {}, { displayOptions: normalizeWorkspaceDisplayOptions(options) });
    setDialog(null);
    commit(next, 'replace');
  }

  function toggleTreeFolder(folderPath, open) {
    const path = String(folderPath || '').trim();
    if (!path) return;
    const next = structuredClone(state);
    const existing = new Set(Array.isArray(next.view?.expandedTreeFolders) ? next.view.expandedTreeFolders : []);
    if (open) existing.add(path);
    else existing.delete(path);
    next.view = Object.assign({}, next.view || {}, { expandedTreeFolders: Array.from(existing).sort() });
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
          onVerse={setVerse}
          onQuery={setQuery}
          onOpenDisplayOptions={() => setDialog('display-options')}
          onOpenAddDialog={openAddToWorkspace}
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
      {dialog === 'close-workspace' && active ? <CloseWorkspaceDialog workspace={active} onDismiss={dismissDialog} onConfirm={() => closeWorkspace(active.id)} /> : null}
      {activeRecord ? <RecordDetailDialog record={activeRecord} onDismiss={dismissRecord} onShare={() => shareRecord(activeRecord)} /> : null}
      {activeAsset ? <AssetDetailDialog asset={activeAsset} onDismiss={dismissAsset} /> : null}
      {actionRecord ? <RecordActionDialog record={actionRecord} action={recordAction.action} schemaRegistry={schemaRegistry} onDismiss={dismissRecordAction} onShare={() => shareRecord(actionRecord)} onCreateTransition={createTransitionRecord} /> : null}
      {dialog === 'display-options' && active ? (
        <DisplayOptionsDialog
          options={state.view?.displayOptions}
          counts={buildDisplayOptionCounts(active)}
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


function hydrateUiRecord(record) {
  if (!record) return null;
  return hydrateGithubRecordFromSourceCache(record, { storage: typeof window !== 'undefined' ? window.localStorage : null });
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

