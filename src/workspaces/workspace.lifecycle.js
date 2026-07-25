(function attachWorkspaceLifecycle(global) {
'use strict';
const WORKSPACE_NAME_MAX_LENGTH=72;
const RECORD_TITLE_MAX_LENGTH = 96;
const RECORD_SUMMARY_MAX_LENGTH = 280;
const SESSION_SOURCE_KIND = 'local-session';
const CONFIGURED_SOURCE_KIND = 'github-tree';
const GITHUB_ADAPTER_ID = 'github';
const GITHUB_REPO_SOURCE_KIND = 'github.repo';
const SOURCE_STATES = new Set(['not-started', 'deferred', 'loading', 'loaded', 'partial', 'failed', 'unavailable']);
function nowIso(clock){return typeof clock==='function'?clock():new Date().toISOString();}
function normalizeWorkspaceName(value) {
return String(value || '').replace(/\s+/g, ' ').trim().slice(0, WORKSPACE_NAME_MAX_LENGTH);
}
function normalizeRecordTitle(value) {
return String(value || '').replace(/\s+/g, ' ').trim().slice(0, RECORD_TITLE_MAX_LENGTH);
}
function normalizeRecordSummary(value) {
return String(value || '').replace(/\s+/g, ' ').trim().slice(0, RECORD_SUMMARY_MAX_LENGTH);
}
function canonicalizeSourceRecordPath(input = {}, source = {}) {
const t = input.sourceTarget || {}, snap = input.snapshot || {}, raw = t.inputTarget || t.url || input.path || input.name || '';
const surface = String(t.surface || '').toLowerCase(), mode = String(input.sourceMode || '').toLowerCase(), kind = String(t.targetKind || '').toLowerCase();
const issue = surface === 'issuesnapshots' || mode.includes('issue-snapshot') || /^https?:\/\/github\.com\/[^/]+\/[^/]+\/(issues|discussions)\/\d+/i.test(String(raw || ''));
if (!issue) return canonicalizeSourcePath(input.path || input.name || '', source);
if(snap.embedded||/embedded-artifact|lineage-parent/.test(kind)||mode.includes('embedded-artifact'))return canonicalizeSourcePath(t.sourceArtifactPath||snap.sourceArtifactPath||input.path||input.name||'',{});
return canonicalizeExternalSourceTarget(raw, { preserveHash: kind.includes('comment') || /issuecomment-|discussioncomment-/i.test(String(raw || '')) });
}
function canonicalizeExternalSourceTarget(value = '', options = {}) {
const raw = String(value || '').trim(); if (!raw) return '';
try {
const u = new URL(raw), h = String(u.hostname || '').toLowerCase(), path = u.pathname.replace(/\/+$/g, ''), hash = options.preserveHash ? String(u.hash || '') : '';
return `${(h === 'github.com' || h.endsWith('.github.com')) ? 'https://github.com' : u.origin}${path}${hash}`;
} catch (_) {
const clean = raw.replace(/\?utm_[^#]*/g, '').replace(/\/+$/g, '');
return options.preserveHash ? clean : clean.replace(/#.*$/g, '');
}
}

function canonicalizeSourcePath(inputPath, source = {}) {
let p = String(inputPath || '').trim(); if (!p) return '';
try {
const u = new URL(p), h = String(u.hostname || '').toLowerCase(), parts = u.pathname.split('/').filter(Boolean), bi = parts.indexOf('blob');
p = h === 'raw.githubusercontent.com' ? (parts.length >= 4 ? parts.slice(3).join('/') : parts.join('/')) : h.endsWith('github.com') ? ((bi >= 0 && parts.length > bi + 2) ? parts.slice(bi + 2).join('/') : parts.join('/')) : u.pathname.replace(/^\/+/, '');
} catch (_) {}
p = p.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
const out = [];
for (const part of p.split('/')) { if (!part || part === '.') continue; if (part === '..') out.pop(); else out.push(part); }
p = out.join('/');
const roots = String(source.rootPath || '').split(/\r?\n|,/).map((item) => item.trim().replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, '')).filter((item) => item && item !== '.');
if (roots.length) {
const root = roots.find((item) => p === item || p.startsWith(item + '/')) || roots[0];
if (root && p && !p.startsWith(root + '/') && p !== root) p = root + '/' + p; else if (root && !p) p = root;
}
return p.replace(/\/+$/, '');
}

function makeWorkspaceId(name, createdAt) {
const slug = normalizeWorkspaceName(name)
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-|-$/g, '') || 'workspace';
const stamp = String(createdAt || nowIso()).replace(/[^0-9]/g, '').slice(0, 14) || 'session';
return `local-${slug}-${stamp}`;
}
function canonicalizeLocalPath(inputPath) {
let p = String(inputPath || '').trim();
if (!p) return '';
p = p.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
const out = [];
for (const part of p.split('/')) {
if (!part || part === '.') continue;
if (part === '..') {
out.pop();
continue;
}
out.push(part);
}
return out.join('/');
}
function makeLocalRecordId(workspaceId, path) {
const canonicalPath = canonicalizeLocalPath(path);
if (!canonicalPath) return '';
return `local:${workspaceId || 'workspace'}:${canonicalPath}`;
}
function makeRecordId(workspaceId, title, createdAt) {
const slug = normalizeRecordTitle(title)
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-|-$/g, '') || 'artifact';
const stamp = String(createdAt || nowIso()).replace(/[^0-9]/g, '').slice(0, 17) || 'session';
return `${workspaceId || 'workspace'}-${slug}-${stamp}`;
}
function countLocalRecords(workspace={}){return(Array.isArray(workspace.records)?workspace.records:[]).filter((record)=>{const source=record&&record.source;return !source||source.kind===SESSION_SOURCE_KIND||source.adapterId==='local';}).length;}
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
const createdAt = nowIso(options.clock), id = input.id || makeWorkspaceId(name, createdAt);
const workspace = { id, name, title: name, createdAt, kind: 'workspace', source: makeSessionSource(), sources: [makeLocalSource()], sourceOrder: ['local'], discoveryProgress: null, records: [], assets: [], importLog: [], mode: 'feed' };
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
const canonicalPath = canonicalizeLocalPath(input.path || '');
const deterministicLocalId = input.id || makeLocalRecordId(workspace.id, canonicalPath);
const record = Object.assign({}, input, {
id: deterministicLocalId || makeRecordId(workspace.id, title, createdAt),
title,
summary: normalizeRecordSummary(input.summary || input.body || 'Local session material added in Tiinex.'),
kind: input.kind || 'local.material',
status: input.status || 'local',
createdAt: input.createdAt || createdAt.slice(0, 10),
path: canonicalPath || input.path || '',
markdown: input.markdown || '',
sourceMode: input.sourceMode || 'local-manual',
hasContinuityContext: Boolean(input.hasContinuityContext),
hasIntegrity: Boolean(input.hasIntegrity),
source: makeSessionSource()
});
const existingIndex = Array.isArray(workspace.records)
? workspace.records.findIndex((item) => item.id === record.id || (canonicalPath && item.source?.kind === SESSION_SOURCE_KIND && canonicalizeLocalPath(item.path || '') === canonicalPath))
: -1;
if (existingIndex >= 0) {
workspace.records = workspace.records.slice();
workspace.records[existingIndex] = record;
} else {
workspace.records = [record].concat(Array.isArray(workspace.records) ? workspace.records : []);
}
workspace.sources = ensureWorkspaceSources(workspace);
upsertSource(workspace, makeLocalSource({ count: countLocalRecords(workspace) }));
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
function addWorkspaceAssets(state, workspaceId, inputs = [], options = {}) {
const assets = Array.isArray(inputs) ? inputs : [];
const next = cloneState(state);
const targetId = workspaceId || next.activeWorkspaceId;
const workspace = next.workspaces.find((item) => item.id === targetId);
if (!workspace) return { ok: false, error: 'workspace.not.found', state };
const added = [];
const existing = Array.isArray(workspace.assets) ? workspace.assets.slice() : [];
for (const input of assets) {
const canonicalPath = canonicalizeLocalPath(input.path || input.name || 'asset');
if (!canonicalPath) continue;
const id = input.id || `asset:${workspace.id}:${canonicalPath}`;
const asset = {
schema: input.schema || 'tiinex.local.asset.v1',
id,
path: canonicalPath,
name: input.name || canonicalPath.split('/').pop() || 'asset',
type: input.type || 'application/octet-stream',
size: Number(input.size || 0),
content: input.content || '',
dataUrl: input.dataUrl || '',
sourceMode: input.sourceMode || 'local-asset',
source: input.source || makeSessionSource(),
createdAt: input.createdAt || nowIso(options.clock).slice(0, 10)
};
const idx = existing.findIndex((item) => item.id === id || canonicalizeLocalPath(item.path || '') === canonicalPath);
if (idx >= 0) existing[idx] = asset;
else existing.unshift(asset);
added.push(asset);
}
workspace.assets = existing;
workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
if (added.length) workspace.importLog.unshift({ kind: 'assets', count: added.length, at: nowIso(options.clock) });
next.activeWorkspaceId = workspace.id;
return { ok: Boolean(added.length), assets: added, workspace, state: next, error: added.length ? '' : 'assets.empty' };
}
function openWorkspaceFromMarkdown(state, markdown = '', input = {}, options = {}) {
const title = normalizeWorkspaceName(input.title || workspaceTitleFromMarkdown(markdown) || input.name || 'Imported workspace');
if (!title) return { ok: false, error: 'workspace.title.required', state };
const createdAt = nowIso(options.clock);
const workspace = {
id: input.id || makeWorkspaceId(title, createdAt),
name: title,
title,
createdAt,
kind: 'workspace',
source: makeSessionSource(),
sources: [makeLocalSource()],
sourceOrder: ['local'],
discoveryProgress: null,
records: [],
assets: [],
importLog: [{ kind: 'workspace-open', path: input.path || 'workspace.workspace.md', at: createdAt }],
mode: 'feed',
workspaceMarkdown: String(markdown || ''),
workspaceImport: {
schema: 'tiinex.workspace.import.v1',
path: input.path || 'workspace.workspace.md',
sourceMode: input.sourceMode || 'local-workspace-file',
boundary: 'browser-local workspace file; no GitHub provenance inferred'
}
};
const next = cloneState(state);
next.workspaces = [workspace].concat((next.workspaces || []).filter((item) => item.id !== workspace.id));
next.activeWorkspaceId = workspace.id;
next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
return { ok: true, workspace, state: next };
}
function mergeWorkspaceImport(state, workspaceId, workspaceEntry = {}, options = {}) {
const next = cloneState(state);
const workspace = next.workspaces.find((item) => item.id === (workspaceId || next.activeWorkspaceId));
if (!workspace) return { ok: false, error: 'workspace.not.found', state };
const path = canonicalizeLocalPath(workspaceEntry.path || 'workspace.workspace.md') || 'workspace.workspace.md';
const candidate = Object.assign({}, workspaceEntry, { id: workspaceEntry.id || `workspace-candidate:local:${path}`, path, mergedAt: nowIso(options.clock) });
workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
workspace.importLog.unshift({ kind: 'workspace-merge-candidate', path, title: candidate.title || '', at: candidate.mergedAt });
const existing = Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates.slice() : [];
const idx = existing.findIndex((item) => canonicalizeLocalPath(item.path || '') === path || item.id === candidate.id);
if (idx >= 0) existing[idx] = candidate;
else existing.unshift(candidate);
workspace.workspaceMergeCandidates = existing;
next.activeWorkspaceId = workspace.id;
return { ok: true, workspace, state: next };
}
function workspaceTitleFromMarkdown(markdown = '') {
const text = String(markdown || '');
const browserTitle = text.match(/^\s*-\s*Browser Title:\s*(.+)$/mi)?.[1]?.trim();
if (browserTitle) return stripMarkdown(browserTitle);
const heading = text.match(/^#\s+(.+)\s*$/m)?.[1]?.trim();
return stripMarkdown(heading || '');
}
function stripMarkdown(value = '') {
return String(value || '').replace(/^\[([^\]]+)\]\([^)]*\)$/, '$1').trim();
}
function addWorkspaceSourceRecords(state, workspaceId, sourceId, inputs = [], options = {}) {
const records = Array.isArray(inputs) ? inputs : [];
let next = cloneState(state);
const targetId = workspaceId || next.activeWorkspaceId;
const workspace = next.workspaces.find((item) => item.id === targetId);
if (!workspace) return { ok: false, error: 'workspace.not.found', state };
const existingSource = Array.isArray(workspace.sources) ? workspace.sources.find((s) => s.id === sourceId) : null;
if (!existingSource) return { ok: false, error: 'source.not.found', state };
if (existingSource.kind !== CONFIGURED_SOURCE_KIND) return { ok: false, error: 'source.not.configured', state };
const added = [];
for (const input of records) {
const title = normalizeRecordTitle(input.title || input.name);
if (!title) continue;
const createdAt = nowIso(options.clock);
const canonicalPath = canonicalizeSourceRecordPath(input, existingSource);
const deterministicId = `source:${existingSource.id}:${canonicalPath || 'root'}`;
const existingIndex = Array.isArray(workspace.records)
? workspace.records.findIndex((r) => r.id === deterministicId || (r.source && r.source.id === existingSource.id && String(r.path || '').trim() === canonicalPath))
: -1;
const record = Object.assign({}, input, {
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
});
if (existingIndex >= 0) {
workspace.records = workspace.records.slice();
workspace.records[existingIndex] = record;
} else {
workspace.records = [record].concat(Array.isArray(workspace.records) ? workspace.records : []);
}
added.push(record);
}
if (!added.length) return { ok: false, error: 'records.empty', state };
const count = workspace.records.filter((r) => r.source && r.source.id === existingSource.id).length;
const materializedSource = Object.assign({}, existingSource, {
count,
discoveryState: normalizeSourceDiscoveryState(options.discoveryState || 'loaded', 'loaded')
});
workspace.sources = ensureWorkspaceSources(workspace);
upsertSource(workspace, materializedSource);
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
workspace.sources=ensureWorkspaceSources(workspace).filter(source=>source.id!==cleanId);
workspace.sourceOrder=workspace.sources.map(source=>source.id);
const keep=item=>String(item?.source?.id||'')!==cleanId;
for(const key of ['records','assets','workspaceMergeCandidates'])workspace[key]=Array.isArray(workspace[key])?workspace[key].filter(keep):[];
if(workspace.discoveryProgress?.sourceId===cleanId)workspace.discoveryProgress=null;const selected=String(next.view?.selectedRecordId||'').trim();
if(selected&&!workspace.records.some((record)=>String(record?.id||'')===selected))next.view=Object.assign(next.view||{},{selectedRecordId:''});
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
const requested = String(verse || '').trim();
const workspaceVerse = ['feed', 'tree', 'lineage', 'audit'].includes(requested) ? requested : 'feed';
next.view = Object.assign({}, next.view || {}, { workspaceVerse });
return next;
}
function setActiveWorkspace(state, workspaceId) {
const next = cloneState(state);
const target = String(workspaceId || '').trim();
if (!target || !next.workspaces.some((workspace) => workspace.id === target)) return next;
next.activeWorkspaceId = target;
return next;
}
function activeWorkspace(state){return (state.workspaces || []).find((workspace)=>workspace.id===state.activeWorkspaceId)||null;}
function cloneState(state){const base=state&&typeof state==='object'?state:makeEmptyAppState();return JSON.parse(JSON.stringify(Object.assign(makeEmptyAppState(),base)));}
function ensureWorkspaceSources(workspace) {
const sources = Array.isArray(workspace?.sources) ? workspace.sources.slice() : [];
if (!sources.some((source) => source.id === 'local')) sources.unshift(makeLocalSource({ count: countLocalRecords(workspace) }));
return sources.map((source) => Object.assign({}, source));
}
function upsertSource(workspace, source) {
const sources = ensureWorkspaceSources(workspace).filter((item) => item.id !== source.id);
sources.push(Object.assign({}, source));
workspace.sources = sources;
workspace.sourceOrder = sources.map((item) => item.id);
return source;
}
function makeLocalSource(input={}){return{id:'local',kind:'local',adapterId:'local',sourceKind:'local.session',label:'Local',count:Number(input.count||0),config:{persistence:'browser-local'},boundary:'browser-local session material',closeable:false};}
function normalizeSourceDiscoveryState(value,fallback='deferred'){const candidate=String(value||'').trim();return SOURCE_STATES.has(candidate)?candidate:fallback;}
function makeConfiguredSource(input = {}, options = {}) {
const repo = String(input.repository || input.repo || '').trim();
const label = String(input.label || repo || 'Source').trim();
const rootPath = String(input.rootPath || '.topics').trim() || '.topics';
const ref = String(input.ref || '').trim();
return { id: input.id || global.TiinexSourceIdentity?.makeConfiguredSourceId?.({ repo, ref, rootPath }) || `github:${repo.toLowerCase() || 'source'}`, kind: input.kind || CONFIGURED_SOURCE_KIND, adapterId: input.adapterId || GITHUB_ADAPTER_ID, sourceKind: input.sourceKind || GITHUB_REPO_SOURCE_KIND, label, repo, ref, rootPath, config: { repo, ref, rootPath, issueUrls: input.issueUrls || input.config?.issueUrls || '' }, count: Number(input.count || 0), boundary: 'explicit source boundary; no material is trusted until loaded', transportLabel: input.transportLabel || options.transportLabel || 'Source Pages mirror', transportRefreshTier: input.transportRefreshTier || input.preferredTransportTier || '', transportPlan: input.transportPlan ? Object.assign({}, input.transportPlan) : undefined, transportOutcome: input.transportOutcome ? Object.assign({}, input.transportOutcome) : undefined, transportTiers: input.transportTiers ? Object.assign({}, input.transportTiers) : undefined, repoDiscovery: Boolean(input.repoDiscovery || input.requestedSurfaces?.repoFiles?.requested), issueDiscovery: Boolean(input.issueDiscovery || input.requestedSurfaces?.issueSnapshots?.requested), issueUrls: input.issueUrls || input.config?.issueUrls || '', requestedSurfaces: input.requestedSurfaces ? Object.assign({}, input.requestedSurfaces) : { repoFiles: { requested: Boolean(input.repoDiscovery) }, explicitFiles: { requested: Boolean(input.explicitFileRefs || input.fileRefs) }, issueSnapshots: { requested: Boolean(input.issueDiscovery || input.issueUrls) } }, surfaces: Object.assign({}, input.surfaces || input.surfaceState || {}), discoveryState: normalizeSourceDiscoveryState(input.discoveryState, 'deferred'), closeable: true };
}
function sourceProgress(progress={},source={}){const percent=Math.max(0,Math.min(100,Number(progress.percent??48)));return{sourceId:source.id||'',phase:progress.phase||'snapshot-processing',label:progress.label||`Preparing repository snapshot from ${source.transportLabel||'repository mirror'}`,percent,active:progress.active!==false};}
function makeSessionSource(){return{kind:SESSION_SOURCE_KIND,adapterId:'local',sourceKind:'local.session',label:'local session workspace',boundary:'browser-local session state; no source files or GitHub provenance inferred',githubPolicy:'not guessed',sourceBacked:false,writeCapability:'session-local'};}
global.TiinexWorkspaceLifecycle = {
RECORD_SUMMARY_MAX_LENGTH,
RECORD_TITLE_MAX_LENGTH,
WORKSPACE_NAME_MAX_LENGTH,
CONFIGURED_SOURCE_KIND,
GITHUB_ADAPTER_ID,
GITHUB_REPO_SOURCE_KIND,
SESSION_SOURCE_KIND,
activeWorkspace,
addWorkspaceRecord,
addWorkspaceRecords,
addWorkspaceAssets,
openWorkspaceFromMarkdown,
mergeWorkspaceImport,
addWorkspaceSourceRecords,
addWorkspaceSource,
cloneState,
countLocalRecords,
closeWorkspace,
closeWorkspaceSource,
createWorkspace,
makeEmptyAppState,
makeConfiguredSource,
makeLocalSource,
normalizeSourceDiscoveryState,
makeLocalRecordId,
canonicalizeLocalPath,
makeRecordId,
makeWorkspaceId,
normalizeRecordSummary,
normalizeRecordTitle,
normalizeWorkspaceName,
setActiveWorkspace,
setWorkspaceVerse
};
})(typeof window !== 'undefined' ? window : globalThis);
