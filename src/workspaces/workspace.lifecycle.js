import{canonicalizeSourceRecordPath}from'./workspace.sourceRecordPath.js';
import{clearLocalSourceBoundary,countLocalRecords,isLocalSessionMaterial,makeLocalSource,makeLocalSourceForWorkspace as localSourceFor}from'./workspace.localSourceLifecycle.js';
import{reconcileLocalRecordWithSourceBackedWorkspace,restoreLocalShadowForRemovedSource,restoreLocalSnapshotsForRemovedSourceRecord}from'./workspace.materialReconciliation.js';
import{addWorkspaceSourceRecordsWithReconciliation}from'./workspace.sourceRecords.js';
import{makeConfiguredSource as configuredSource}from'./workspace.configuredSource.js';
(function attachWorkspaceLifecycle(global) {
const WORKSPACE_NAME_MAX_LENGTH=72,RECORD_TITLE_MAX_LENGTH=96,RECORD_SUMMARY_MAX_LENGTH=280,SESSION_SOURCE_KIND='local-session',CONFIGURED_SOURCE_KIND='github-tree',GITHUB_ADAPTER_ID='github',GITHUB_REPO_SOURCE_KIND='github.repo',SOURCE_STATES=new Set(['not-started','deferred','loading','loaded','partial','failed','unavailable']);
function nowIso(clock){return typeof clock==='function'?clock():new Date().toISOString();}
function normalizeWorkspaceName(value){return String(value||'').replace(/\s+/g,' ').trim().slice(0,WORKSPACE_NAME_MAX_LENGTH);}
function normalizeRecordTitle(value){return String(value||'').replace(/\s+/g,' ').trim().slice(0,RECORD_TITLE_MAX_LENGTH);}
function normalizeRecordSummary(value){return String(value||'').replace(/\s+/g,' ').trim().slice(0,RECORD_SUMMARY_MAX_LENGTH);}
function makeWorkspaceId(name,createdAt){
const slug = normalizeWorkspaceName(name)
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-|-$/g, '') || 'workspace';
const stamp = String(createdAt || nowIso()).replace(/[^0-9]/g, '').slice(0, 14) || 'session';
return `local-${slug}-${stamp}`;
}
function canonicalizeLocalPath(inputPath){
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
function makeLocalRecordId(workspaceId,path){
const canonicalPath = canonicalizeLocalPath(path);
if (!canonicalPath) return '';
return `local:${workspaceId || 'workspace'}:${canonicalPath}`;
}
function makeRecordId(workspaceId,title,createdAt){
const slug = normalizeRecordTitle(title)
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-|-$/g, '') || 'artifact';
const stamp = String(createdAt || nowIso()).replace(/[^0-9]/g, '').slice(0, 17) || 'session';
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
function createWorkspace(state,input={},options={}){
const name = normalizeWorkspaceName(input.name);
if (!name) return { ok: false, error: 'workspace.name.required', state };
const createdAt = nowIso(options.clock), id = input.id || makeWorkspaceId(name, createdAt);
const workspace = { id, name, title: name, createdAt, kind: 'workspace', source: makeSessionSource(), sources: [makeLocalSource()], sourceOrder: ['local'], discoveryProgress: null, records: [], assets: [], importLog: [], mode: 'feed' };
const next = cloneState(state);
next.workspaces = next.workspaces.filter((item) => item.id !== workspace.id).concat(workspace);
next.activeWorkspaceId = workspace.id;
next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
return { ok: true, workspace, state: next };
}
function addWorkspaceRecord(state,workspaceId,input={},options={}){
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
const reconciled = reconcileLocalRecordWithSourceBackedWorkspace(workspace, record);
if (reconciled?.reconciled) {
workspace.sources=ensureWorkspaceSources(workspace);upsertSource(workspace,localSourceFor(workspace));
next.activeWorkspaceId = workspace.id;
next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
return { ok: true, record: reconciled.record, localSnapshotRecord: record, reconciliationAction: reconciled.action, workspace, state: next };
}
workspace.records = [record].concat(Array.isArray(workspace.records) ? workspace.records : []);
}
workspace.sources=ensureWorkspaceSources(workspace);upsertSource(workspace,localSourceFor(workspace));
next.activeWorkspaceId = workspace.id;
next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
return { ok: true, record, workspace, state: next };
}

function removableLocalSessionRecord(record){const source=record&&record.source||{};const sourceMode=String(record&&record.sourceMode||'').trim().toLowerCase();const status=String(record&&(record.status||record.lifecycleStatus||record.currentStatus)||'').trim().toLowerCase();const localSource=source.adapterId==='local'||source.kind===SESSION_SOURCE_KIND||source.kind==='local'||source.sourceKind==='local.session';const draftLike=sourceMode.startsWith('local-transition')||sourceMode.startsWith('local-reference')||sourceMode.startsWith('local-draft')||status==='draft'||status==='local'||status==='draft/local';return Boolean(localSource&&draftLike);}
function removeWorkspaceRecord(state,workspaceId,recordId){
const next=cloneState(state);
const targetId=workspaceId||next.activeWorkspaceId;
const workspace=next.workspaces.find((item)=>item.id===targetId);
if(!workspace)return{ok:false,error:'workspace.not.found',state};
const cleanId=String(recordId||'').trim();
if(!cleanId)return{ok:false,error:'record.id.required',state};
const records=Array.isArray(workspace.records)?workspace.records:[];
const record=records.find((item)=>String(item&&item.id||'')===cleanId)||null;
if(!record)return{ok:false,error:'record.not.found',state};
if(!removableLocalSessionRecord(record))return{ok:false,error:'record.remove.refused',state};
workspace.records=records.filter((item)=>String(item&&item.id||'')!==cleanId);
workspace.sources=ensureWorkspaceSources(workspace);upsertSource(workspace,localSourceFor(workspace));
if(String(next.view?.selectedRecordId||'')===cleanId)next.view=Object.assign({},next.view||{},{selectedRecordId:'',lineageAuditReport:null,lineageLoadReport:null});
next.activeWorkspaceId=workspace.id;
return{ok:true,record,workspace,state:next};
}
function addWorkspaceRecords(state,workspaceId,inputs=[],options={}){
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
const asset = Object.assign({}, input, {
schema: input.schema || 'tiinex.local.asset.v1',
id,
path: canonicalPath,
name: input.name || canonicalPath.split('/').pop() || 'asset',
type: input.type || 'application/octet-stream',
size: Number(input.size || 0),
content: input.content || '',
dataUrl: input.dataUrl || '',
sourceMode: input.sourceMode || 'local-asset',
source: makeSessionSource(),
createdAt: input.createdAt || nowIso(options.clock).slice(0, 10),
assetBoundary: 'local-asset-store',
materialAvailability: input.materialAvailability || (input.content || input.dataUrl ? 'local-available' : 'local-metadata-only'),
publicAvailability: 'not-public',
boundary: 'browser-local asset availability; not source or public truth'
});
const idx = existing.findIndex((item) => item.id === id || canonicalizeLocalPath(item.path || '') === canonicalPath);
if (idx >= 0) existing[idx] = asset;
else existing.unshift(asset);
added.push(asset);
}
workspace.assets = existing;
workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
if (added.length) workspace.importLog.unshift({ kind: 'assets', count: added.length, at: nowIso(options.clock) });
workspace.sources = ensureWorkspaceSources(workspace);
upsertSource(workspace, localSourceFor(workspace));
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
next.workspaces = (next.workspaces || []).filter((item) => item.id !== workspace.id).concat(workspace);
next.activeWorkspaceId = workspace.id;
next.view = Object.assign({ universe: 'column', workspaceVerse: 'feed', reader: 'scan', query: '' }, next.view || {}, { workspaceVerse: 'feed' });
return { ok: true, workspace, state: next };
}
function mergeWorkspaceArtifactContext(state, workspaceId, workspaceEntry = {}, options = {}) {
const next = cloneState(state);
const workspace = next.workspaces.find((item) => item.id === (workspaceId || next.activeWorkspaceId));
if (!workspace) return { ok: false, error: 'workspace.not.found', state };
const path = canonicalizeLocalPath(workspaceEntry.path || 'workspace.workspace.md') || 'workspace.workspace.md';
const mergedAt = nowIso(options.clock);
const merged = Object.assign({}, workspaceEntry, { path, mergedAt, mergeMode: 'artifact-context', mergedIntoWorkspaceId: workspace.id || '', mergedIntoWorkspaceTitle: workspace.title || workspace.name || '' });
workspace.workspaceMergedEntries = Array.isArray(workspace.workspaceMergedEntries) ? workspace.workspaceMergedEntries.slice() : [];
const idx = workspace.workspaceMergedEntries.findIndex((item) => canonicalizeLocalPath(item.path || '') === path);
if (idx >= 0) workspace.workspaceMergedEntries[idx] = merged;
else workspace.workspaceMergedEntries.unshift(merged);
workspace.importLog = Array.isArray(workspace.importLog) ? workspace.importLog : [];
workspace.importLog.unshift({ kind: 'workspace-artifact-merge', path, title: merged.title || '', at: mergedAt });
next.activeWorkspaceId = workspace.id;
return { ok: true, workspace, state: next, entry: merged, merge: { mode: 'artifact-context', targetWorkspaceId: workspace.id || '', targetWorkspaceTitle: workspace.title || workspace.name || '' } };
}
// Compatibility alias for older callers/checkpoints. Canonical runtime material remains record-based.
function mergeWorkspaceImport(state, workspaceId, workspaceEntry = {}, options = {}) {
return mergeWorkspaceArtifactContext(state, workspaceId, workspaceEntry, options);
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
return addWorkspaceSourceRecordsWithReconciliation(state,workspaceId,sourceId,inputs,options,{cloneState,activeWorkspace,nowIso,normalizeRecordTitle,normalizeRecordSummary,normalizeSourceDiscoveryState,canonicalizeSourceRecordPath,CONFIGURED_SOURCE_KIND,ensureWorkspaceSources,upsertSource});
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
function closeWorkspaceSource(state,workspaceId,sourceId){const next=cloneState(state),targetId=workspaceId||next.activeWorkspaceId,workspace=next.workspaces.find((item)=>item.id===targetId);if(!workspace)return{ok:false,error:'workspace.not.found',state};const cleanId=String(sourceId||'').trim();if(!cleanId)return{ok:false,error:'source.close.refused',state};if(cleanId==='local'){const counts=clearLocalSourceBoundary(workspace,next);next.activeWorkspaceId=workspace.id;return{ok:true,workspace,state:next,localSessionCleared:true,counts};}workspace.sources=ensureWorkspaceSources(workspace).filter(source=>source.id!==cleanId);workspace.sourceOrder=workspace.sources.map(source=>source.id);const keep=item=>String(item?.source?.id||'')!==cleanId;workspace.records=Array.isArray(workspace.records)?workspace.records.flatMap((record)=>{if(keep(record))return[restoreLocalShadowForRemovedSource(record,cleanId)];const restored=restoreLocalSnapshotsForRemovedSourceRecord(record);return restored?[restored]:[];}):[];workspace.assets=Array.isArray(workspace.assets)?workspace.assets.filter(keep):[];if(workspace.discoveryProgress?.sourceId===cleanId)workspace.discoveryProgress=null;workspace.sources=ensureWorkspaceSources(workspace);const selected=String(next.view?.selectedRecordId||'').trim();if(selected&&!workspace.records.some((record)=>String(record?.id||'')===selected))next.view=Object.assign(next.view||{},{selectedRecordId:'',lineageAuditReport:null,lineageLoadReport:null});next.activeWorkspaceId=workspace.id;return{ok:true,workspace,state:next};}
function renameWorkspace(state,workspaceId,name){const next=cloneState(state),workspace=next.workspaces.find((item)=>item.id===(workspaceId||next.activeWorkspaceId));if(!workspace)return{ok:false,error:'workspace.not.found',state};const cleanName=normalizeWorkspaceName(name);if(!cleanName)return{ok:false,error:'workspace.name.required',state};workspace.name=cleanName;workspace.title=cleanName;workspace.renamedAt=nowIso();next.activeWorkspaceId=workspace.id;return{ok:true,workspace,state:next};}
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
if (!sources.some((source) => source.id === 'local')) sources.unshift(localSourceFor(workspace));
return sources.map((source) => source.id === 'local' ? Object.assign({}, source, localSourceFor(workspace)) : Object.assign({}, source));
}
function upsertSource(workspace, source) {
const sources = ensureWorkspaceSources(workspace).filter((item) => item.id !== source.id);
sources.push(Object.assign({}, source));
workspace.sources = sources;
workspace.sourceOrder = sources.map((item) => item.id);
return source;
}
function normalizeSourceDiscoveryState(value,fallback='deferred'){const candidate=String(value||'').trim();return SOURCE_STATES.has(candidate)?candidate:fallback;}
function makeConfiguredSource(input={},options={}){return configuredSource(input,options,{configuredSourceKind:CONFIGURED_SOURCE_KIND,githubAdapterId:GITHUB_ADAPTER_ID,githubRepoSourceKind:GITHUB_REPO_SOURCE_KIND,normalizeSourceDiscoveryState});}
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
removeWorkspaceRecord,
addWorkspaceAssets,
openWorkspaceFromMarkdown,
mergeWorkspaceArtifactContext,
mergeWorkspaceImport,
addWorkspaceSourceRecords,
addWorkspaceSource,
cloneState,
countLocalRecords,
closeWorkspace,
closeWorkspaceSource,
createWorkspace,
renameWorkspace,
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
