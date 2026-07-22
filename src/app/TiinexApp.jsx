import React, { useEffect, useMemo, useState } from 'react';
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
import { buildWorkspaceAuditView } from '../workspaces/workspace.auditView.js';
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
    view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '', displayOptions: { leavesFirst: true, leavesOnly: false, mismatchesOnly: false, showSupportingMarkdown: false, showWorkspaceCandidates: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' }, expandedTreeFolders: [] },
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
  const [sourceContinuationId, setSourceContinuationId] = useState('');
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
      transportLabel: 'direct public GitHub API/raw'
    });
    if (!result?.ok) {
      setNotice('Could not add GitHub source.');
      setGithubRequestPending(false);
      return;
    }
    const fileRefs = Array.isArray(input.fileRefs) ? input.fileRefs : String(input.fileRefs || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
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
        label: `${result.source.label} accepted · ${operationLabel} via direct public GitHub transport`,
        active: true,
        quantified: false,
        discoveryState: 'loading'
      }).state || finalState;
      setDialog(null);
      setNotice(`${result.source.label} source registered; loading started.`);
      commit(finalState, 'push');
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
        }, { fetchImpl: fetch, maxFiles: 500, transportPolicy, onProgress: publishGithubProgress });
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
          discoveryState: sourceState
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
    <main className={shellClasses} data-runtime="react-v181-card-lineage-navigation-parity" data-source-boundary={CLEAN_URL_BOUNDARY} data-uc="UC-001-empty-create-local-workspace-add-flow" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (!active && event.dataTransfer) { event.preventDefault(); addLocalFiles(event.dataTransfer, { sourceMode: 'stage-drop', fromDataTransfer: true }); } }}>
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
        />
      ) : (
        <EmptyStage workspaceConfig={workspaceConfig} />
      )}

      {notice ? <div className="tx-toast" role="status">{notice}</div> : null}
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

