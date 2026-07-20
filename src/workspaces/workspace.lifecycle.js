(function attachWorkspaceLifecycle(global) {
  'use strict';

  const WORKSPACE_NAME_MAX_LENGTH = 72;
  const RECORD_TITLE_MAX_LENGTH = 96;
  const RECORD_SUMMARY_MAX_LENGTH = 280;
  const SESSION_SOURCE_KIND = 'local-session';
  const CONFIGURED_SOURCE_KIND = 'github-tree';

  function nowIso(clock) {
    return typeof clock === 'function' ? clock() : new Date().toISOString();
  }

  function normalizeWorkspaceName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, WORKSPACE_NAME_MAX_LENGTH);
  }

  function normalizeRecordTitle(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, RECORD_TITLE_MAX_LENGTH);
  }

  function normalizeRecordSummary(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, RECORD_SUMMARY_MAX_LENGTH);
  }

  // Canonicalize a source-backed input path for deterministic identity.
  // Rules:
  // - collapse duplicate slashes
  // - remove leading './' and leading '/'
  // - treat rootPath '.' as empty
  // - avoid double-prefixing rootPath
  // - do not lowercase file paths
  // - for raw GitHub URLs, extract the path after owner/repo/ref
  function canonicalizeSourcePath(inputPath, source = {}) {
    let p = String(inputPath || '').trim();
    if (!p) return '';
    try {
      const url = new URL(p);
      const host = String(url.hostname || '').toLowerCase();
      if (host === 'raw.githubusercontent.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        p = parts.length >= 4 ? parts.slice(3).join('/') : parts.join('/');
      } else if (host.endsWith('github.com')) {
        const parts = url.pathname.split('/').filter(Boolean);
        const blobIndex = parts.indexOf('blob');
        p = (blobIndex >= 0 && parts.length > blobIndex + 2) ? parts.slice(blobIndex + 2).join('/') : parts.join('/');
      } else {
        p = url.pathname.replace(/^\/+/, '');
      }
    } catch (e) {
      // Not a URL; keep p as-is
    }
    // Normalize and collapse dot segments
    p = p.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
    const parts = p.split('/');
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') {
        out.pop();
        continue;
      }
      out.push(part);
    }
    p = out.join('/');

    const root = String(source.rootPath || '').trim();
    if (root && root !== '.' && root !== './') {
      const cleanedRoot = root.replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, '');
      if (cleanedRoot) {
        if (!p) p = cleanedRoot;
        else if (!p.startsWith(cleanedRoot + '/') && p !== cleanedRoot) p = cleanedRoot + '/' + p;
      }
    }
    p = p.replace(/\/+$/, '');
    return p;
  }

  function makeWorkspaceId(name, createdAt) {
    const slug = normalizeWorkspaceName(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'workspace';
    const stamp = String(createdAt || nowIso()).replace(/[^0-9]/g, '').slice(0, 14) || 'session';
    return `local-${slug}-${stamp}`;
  }

  function makeRecordId(workspaceId, title, createdAt) {
    const slug = normalizeRecordTitle(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'artifact';
    const stamp = String(createdAt || nowIso()).replace(/[^0-9]/g, '').slice(0, 14) || 'session';
    return `${workspaceId || 'workspace'}-${slug}-${stamp}`;
  }

  function makeEmptyAppState() {
    return {
      version: 1,
      activeWorkspaceId: '',
      view: { universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' },
      workspaces: [],
      audit: null
    };
  }

  function createWorkspace(state, input = {}, options = {}) {
    const name = normalizeWorkspaceName(input.name);
    if (!name) return { ok: false, error: 'workspace.name.required', state };
    const createdAt = nowIso(options.clock);
    const workspace = {
      id: input.id || makeWorkspaceId(name, createdAt),
      name,
      title: name,
      createdAt,
      kind: 'workspace',
      source: makeSessionSource(),
      sources: [makeLocalSource()],
      sourceOrder: ['local'],
      discoveryProgress: null,
      records: [],
      mode: 'feed'
    };
    const next = cloneState(state);
    next.workspaces = [workspace].concat(next.workspaces.filter((item) => item.id !== workspace.id));
    next.activeWorkspaceId = workspace.id;
    next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
    return { ok: true, workspace, state: next };
  }

  function addWorkspaceRecord(state, workspaceId, input = {}, options = {}) {
    const title = normalizeRecordTitle(input.title || input.name);
    if (!title) return { ok: false, error: 'record.title.required', state };
    const next = cloneState(state);
    const targetId = workspaceId || next.activeWorkspaceId;
    const workspace = next.workspaces.find((item) => item.id === targetId);
    if (!workspace) return { ok: false, error: 'workspace.not.found', state };
    const createdAt = nowIso(options.clock);
    const record = {
      id: input.id || makeRecordId(workspace.id, title, createdAt),
      title,
      summary: normalizeRecordSummary(input.summary || input.body || 'Local session material added in Tiinex.'),
      kind: input.kind || 'local.material',
      status: input.status || 'local',
      createdAt: input.createdAt || createdAt.slice(0, 10),
      source: makeSessionSource()
    };
    workspace.records = [record].concat(Array.isArray(workspace.records) ? workspace.records : []);
    workspace.sources = ensureWorkspaceSources(workspace);
    upsertSource(workspace, makeLocalSource({ count: workspace.records.length }));
    next.activeWorkspaceId = workspace.id;
    next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
    return { ok: true, record, workspace, state: next };
  }


  function addWorkspaceRecords(state, workspaceId, inputs = [], options = {}) {
    const records = Array.isArray(inputs) ? inputs : [];
    let next = cloneState(state);
    const added = [];
    for (const input of records) {
      const result = addWorkspaceRecord(next, workspaceId || next.activeWorkspaceId, input, options);
      if (result?.ok) {
        next = result.state;
        added.push(result.record);
      }
    }
    if (!added.length) return { ok: false, error: 'records.empty', state };
    const workspace = activeWorkspace(next);
    return { ok: true, records: added, workspace, state: next };
  }

  // v121: addWorkspaceSourceRecords
  // Minimal lifecycle API to insert records that are explicitly source-backed.
  // Does not perform network IO; expects caller to supply record-shaped inputs
  // (for example created via `createRecordFromMarkdown`). Attaches explicit
  // source provenance and updates the configured source `count`.
  function addWorkspaceSourceRecords(state, workspaceId, sourceId, inputs = [], options = {}) {
    const records = Array.isArray(inputs) ? inputs : [];
    let next = cloneState(state);
    const targetId = workspaceId || next.activeWorkspaceId;
    const workspace = next.workspaces.find((item) => item.id === targetId);
    if (!workspace) return { ok: false, error: 'workspace.not.found', state };
    const existingSource = Array.isArray(workspace.sources) ? workspace.sources.find((s) => s.id === sourceId) : null;
    if (!existingSource) return { ok: false, error: 'source.not.found', state };
    // Reject non-configured sources (for example the always-present `local` source)
    if (existingSource.kind !== CONFIGURED_SOURCE_KIND) return { ok: false, error: 'source.not.configured', state };
    const added = [];
    for (const input of records) {
      const title = normalizeRecordTitle(input.title || input.name);
      if (!title) continue;
      const createdAt = nowIso(options.clock);

      // Compute canonical path and deterministic id for source-backed records
      const canonicalPath = canonicalizeSourcePath(input.path || input.name || '', existingSource);
      const deterministicId = `source:${existingSource.id}:${canonicalPath || 'root'}`;

      // Upsert by deterministic id or by matching source+path (legacy records)
      const existingIndex = Array.isArray(workspace.records)
        ? workspace.records.findIndex((r) => r.id === deterministicId || (r.source && r.source.id === existingSource.id && String(r.path || '').trim() === canonicalPath))
        : -1;

      const record = {
        id: deterministicId,
        title,
        summary: normalizeRecordSummary(input.summary || input.body || 'Source-backed material added in Tiinex.'),
        kind: input.kind || 'local.material',
        status: input.status || 'local',
        createdAt: input.createdAt || createdAt.slice(0, 10),
        path: canonicalPath || '',
        markdown: input.markdown || '',
        sourceMode: input.sourceMode || 'source-backed',
        hasContinuityContext: Boolean(input.hasContinuityContext),
        hasIntegrity: Boolean(input.hasIntegrity),
        source: Object.assign({}, existingSource)
      };

      if (existingIndex >= 0) {
        // Replace existing record in place (idempotent upsert)
        workspace.records = workspace.records.slice();
        workspace.records[existingIndex] = record;
      } else {
        // Prepend new record
        workspace.records = [record].concat(Array.isArray(workspace.records) ? workspace.records : []);
      }
      added.push(record);
    }
    if (!added.length) return { ok: false, error: 'records.empty', state };
    // Recompute the configured source count and upsert it.
    const count = workspace.records.filter((r) => r.source && r.source.id === existingSource.id).length;
    workspace.sources = ensureWorkspaceSources(workspace);
    upsertSource(workspace, Object.assign({}, existingSource, { count }));
    next.activeWorkspaceId = workspace.id;
    next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
    const finalWorkspace = activeWorkspace(next);
    return { ok: true, records: added, workspace: finalWorkspace, state: next };
  }

  function addWorkspaceSource(state, workspaceId, input = {}, options = {}) {
    const next = cloneState(state);
    const targetId = workspaceId || next.activeWorkspaceId;
    const workspace = next.workspaces.find((item) => item.id === targetId);
    if (!workspace) return { ok: false, error: 'workspace.not.found', state };
    const source = makeConfiguredSource(input, options);
    workspace.sources = ensureWorkspaceSources(workspace);
    upsertSource(workspace, source);
    workspace.discoveryProgress = input.progress ? sourceProgress(input.progress || {}, source) : null;
    next.activeWorkspaceId = workspace.id;
    return { ok: true, source, workspace, state: next };
  }

  function closeWorkspaceSource(state, workspaceId, sourceId) {
    const next = cloneState(state);
    const targetId = workspaceId || next.activeWorkspaceId;
    const workspace = next.workspaces.find((item) => item.id === targetId);
    if (!workspace) return { ok: false, error: 'workspace.not.found', state };
    const cleanId = String(sourceId || '').trim();
    if (!cleanId || cleanId === 'local') return { ok: false, error: 'source.close.refused', state };
    workspace.sources = ensureWorkspaceSources(workspace).filter((source) => source.id !== cleanId);
    workspace.sourceOrder = workspace.sources.map((source) => source.id);
    if (workspace.discoveryProgress?.sourceId === cleanId) workspace.discoveryProgress = null;
    return { ok: true, workspace, state: next };
  }

  function closeWorkspace(state, workspaceId) {
    const next = cloneState(state);
    const targetId = workspaceId || next.activeWorkspaceId;
    const closed = next.workspaces.find((item) => item.id === targetId) || null;
    next.workspaces = next.workspaces.filter((item) => item.id !== targetId);
    next.activeWorkspaceId = next.workspaces[0]?.id || '';
    if (!next.activeWorkspaceId) {
      next.view = Object.assign({}, next.view || {}, { workspaceVerse: 'feed', query: '' });
      next.audit = null;
    }
    return { ok: Boolean(closed), closed, state: next };
  }

  function setWorkspaceVerse(state, verse) {
    const next = cloneState(state);
    next.view = Object.assign({}, next.view || {}, { workspaceVerse: verse === 'tree' ? 'tree' : 'feed' });
    return next;
  }

  function setActiveWorkspace(state, workspaceId) {
    const next = cloneState(state);
    const target = String(workspaceId || '').trim();
    if (!target || !next.workspaces.some((workspace) => workspace.id === target)) return next;
    next.activeWorkspaceId = target;
    return next;
  }

  function activeWorkspace(state) {
    return (state.workspaces || []).find((workspace) => workspace.id === state.activeWorkspaceId) || null;
  }

  function cloneState(state) {
    const base = state && typeof state === 'object' ? state : makeEmptyAppState();
    return JSON.parse(JSON.stringify(Object.assign(makeEmptyAppState(), base)));
  }

  function ensureWorkspaceSources(workspace) {
    const sources = Array.isArray(workspace?.sources) ? workspace.sources.slice() : [];
    if (!sources.some((source) => source.id === 'local')) sources.unshift(makeLocalSource({ count: Array.isArray(workspace?.records) ? workspace.records.length : 0 }));
    return sources.map((source) => Object.assign({}, source));
  }

  function upsertSource(workspace, source) {
    const sources = ensureWorkspaceSources(workspace).filter((item) => item.id !== source.id);
    sources.push(Object.assign({}, source));
    workspace.sources = sources;
    workspace.sourceOrder = sources.map((item) => item.id);
    return source;
  }

  function makeLocalSource(input = {}) {
    return {
      id: 'local',
      kind: 'local',
      label: 'Local',
      count: Number(input.count || 0),
      boundary: 'browser-local session material',
      closeable: false
    };
  }

  function makeConfiguredSource(input = {}, options = {}) {
    const repo = String(input.repository || input.repo || 'Tiinex/docs').trim();
    const label = String(input.label || repo || 'Source').trim();
    return {
      id: input.id || `github:${repo.toLowerCase()}`,
      kind: input.kind || CONFIGURED_SOURCE_KIND,
      label,
      repo,
      ref: input.ref || 'master',
      rootPath: input.rootPath || '.topics',
      count: Number(input.count || 0),
      boundary: 'explicit source boundary; no material is trusted until loaded',
      transportLabel: input.transportLabel || options.transportLabel || 'Source Pages mirror',
      discoveryState: input.discoveryState || 'deferred',
      closeable: true
    };
  }

  function sourceProgress(progress = {}, source = {}) {
    const percent = Math.max(0, Math.min(100, Number(progress.percent ?? 48)));
    return {
      sourceId: source.id || '',
      phase: progress.phase || 'snapshot-processing',
      label: progress.label || `Preparing repository snapshot from ${source.transportLabel || 'repository mirror'}`,
      percent,
      active: progress.active !== false
    };
  }

  function makeSessionSource() {
    return {
      kind: SESSION_SOURCE_KIND,
      label: 'local session workspace',
      boundary: 'browser-local session state; no source files or GitHub provenance inferred',
      githubPolicy: 'not guessed',
      sourceBacked: false,
      writeCapability: 'session-local'
    };
  }

  global.TiinexWorkspaceLifecycle = {
    RECORD_SUMMARY_MAX_LENGTH,
    RECORD_TITLE_MAX_LENGTH,
    WORKSPACE_NAME_MAX_LENGTH,
    CONFIGURED_SOURCE_KIND,
    SESSION_SOURCE_KIND,
    activeWorkspace,
    addWorkspaceRecord,
    addWorkspaceRecords,
    addWorkspaceSourceRecords,
    addWorkspaceSource,
    cloneState,
    closeWorkspace,
    closeWorkspaceSource,
    createWorkspace,
    makeEmptyAppState,
    makeConfiguredSource,
    makeLocalSource,
    makeRecordId,
    makeWorkspaceId,
    normalizeRecordSummary,
    normalizeRecordTitle,
    normalizeWorkspaceName,
    setActiveWorkspace,
    setWorkspaceVerse
  };
})(typeof window !== 'undefined' ? window : globalThis);
