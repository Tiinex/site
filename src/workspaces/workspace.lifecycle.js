(function attachWorkspaceLifecycle(global) {
  'use strict';

  const WORKSPACE_NAME_MAX_LENGTH = 72;
  const RECORD_TITLE_MAX_LENGTH = 96;
  const RECORD_SUMMARY_MAX_LENGTH = 280;
  const SESSION_SOURCE_KIND = 'local-session';

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
    next.activeWorkspaceId = workspace.id;
    next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
    return { ok: true, record, workspace, state: next };
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

  function activeWorkspace(state) {
    return (state.workspaces || []).find((workspace) => workspace.id === state.activeWorkspaceId) || null;
  }

  function cloneState(state) {
    const base = state && typeof state === 'object' ? state : makeEmptyAppState();
    return JSON.parse(JSON.stringify(Object.assign(makeEmptyAppState(), base)));
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
    SESSION_SOURCE_KIND,
    activeWorkspace,
    addWorkspaceRecord,
    cloneState,
    closeWorkspace,
    createWorkspace,
    makeEmptyAppState,
    makeRecordId,
    makeWorkspaceId,
    normalizeRecordSummary,
    normalizeRecordTitle,
    normalizeWorkspaceName,
    setWorkspaceVerse
  };
})(typeof window !== 'undefined' ? window : globalThis);
