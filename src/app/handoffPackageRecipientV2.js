import { decodeZipBufferEntries, materializeArchiveFiles } from '../adapters/archive/archive.adapter.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { inspectRecipientFacingV2Topology } from '../tooling/portable/handoff/recipientV2.inspect.js';
import { registerWorkspaceConfigSources } from './workspaceRecordActions.js';

const MARKDOWN_PATH_RE = /\.(?:md|markdown)$/i;

export async function tryReadRecipientFacingV2(decoded = {}, options = {}) {
  const bundle = { files: (decoded.entries || []).map((entry) => ({ path: entry.path, data: entry.bytes })) };
  let inspection;
  try {
    inspection = inspectRecipientFacingV2Topology(bundle);
  } catch (error) {
    return { detected: false, inspectionError: error };
  }
  if (!inspection.detected) return { detected: false, inspection };
  if (inspection.status !== 'valid') {
    return { detected: true, ok: false, kind: 'recipient-v2', error: 'handoff-package.recipient-v2-invalid', inspection, extracted: decoded, notice: firstFinding(inspection.findings) || 'Recipient-facing Handoff package failed qualification.' };
  }

  const outerByPath = new Map((decoded.entries || []).map((entry) => [String(entry.path || ''), entry]));
  const workspaces = [];
  for (const descriptor of inspection.workspaces || []) {
    const archiveEntry = outerByPath.get(String(descriptor.workspaceArchivePath || ''));
    if (!archiveEntry?.bytes) {
      return { detected: true, ok: false, kind: 'recipient-v2', error: 'handoff-package.recipient-v2-workspace-archive-missing', inspection, extracted: decoded, notice: `Qualified Handoff workspace archive is missing: ${descriptor.workspaceId || 'workspace'}.` };
    }
    let nestedDecoded;
    try {
      // Viewer only needs artifact/workspace Markdown to project the carried repository.
      // Exact package/archive qualification remains owned by recipient-v2 inspection above;
      // skipping non-Markdown decompression avoids turning a repo snapshot into UI-thread asset work.
      nestedDecoded = await decodeZipBufferEntries(archiveEntry.bytes, {
        ...options,
        source: `handoff-workspace:${descriptor.workspaceId}`,
        excludeRepositoryInternals: true,
        entryFilter: (path) => MARKDOWN_PATH_RE.test(String(path || ''))
      });
    } catch (error) {
      return { detected: true, ok: false, kind: 'recipient-v2', error: 'handoff-package.recipient-v2-workspace-read-failed', inspection, extracted: decoded, exception: error, notice: `Could not read carried workspace ${descriptor.workspaceId || ''}.` };
    }
    const adapterResult = await materializeArchiveFiles([{ name: descriptor.workspaceArchivePath }], {
      ...options,
      predecodedArchive: nestedDecoded,
      sourceMode: 'handoff-recipient-v2-workspace',
      enforceMergePreflight: false
    });
    if ((adapterResult.errors || []).length) {
      return { detected: true, ok: false, kind: 'recipient-v2', error: 'handoff-package.recipient-v2-workspace-materialize-failed', inspection, extracted: decoded, adapterResult, notice: `Could not materialize carried workspace ${descriptor.workspaceId || ''}.` };
    }
    const targetPath = canonicalPath(descriptor.sourceWorkspaceTargetInnerPath || '');
    const workspaceEntry = (adapterResult.workspaceEntries || []).find((entry) => canonicalPath(entry.path) === targetPath)
      || ((adapterResult.workspaceEntries || []).length === 1 ? adapterResult.workspaceEntries[0] : null);
    if (!workspaceEntry) {
      return { detected: true, ok: false, kind: 'recipient-v2', error: 'handoff-package.recipient-v2-workspace-artifact-missing', inspection, extracted: decoded, adapterResult, notice: `Carried workspace ${descriptor.workspaceId || ''} has no resolvable Workspace artifact.` };
    }
    const workspaceArtifactRecords = (adapterResult.workspaceEntries || []).map((entry) => createRecordFromMarkdown(entry.markdown || '', { path: entry.path, name: entry.title || entry.path, sourceMode: 'handoff-recipient-v2-workspace-artifact' }));
    const projectedAdapterResult = Object.assign({}, adapterResult, { records: [...(adapterResult.records || []), ...workspaceArtifactRecords] });
    workspaces.push(Object.freeze({ descriptor, workspaceEntry, adapterResult: projectedAdapterResult }));
  }
  return {
    detected: true,
    ok: true,
    kind: 'recipient-v2',
    inspection,
    extracted: decoded,
    recipientWorkspaces: Object.freeze(workspaces),
    boundary: 'Qualified recipient-facing v2 carrier. Site reuses Tooling qualification and projects only carried Markdown into transient Viewer workspaces; no remote fetch or package-semantic inference is performed.'
  };
}

export function applyOperationalHandoffPackageToWorkspace(input = {}) {
  const handoff = input.handoff;
  if (handoff?.kind === 'recipient-v2') return applyRecipientFacingV2Handoff(input);
  return applyLegacyOperationalHandoff(input);
}

export function applyRecipientFacingV2Handoff(input = {}) {
  const lifecycle = input.lifecycle;
  const state = input.state;
  const handoff = input.handoff;
  const options = input.options || {};
  const parseWorkspaceConfig = options.parseWorkspaceConfig;
  if (!lifecycle || !handoff?.ok) return { ok: false, error: 'handoff-package.apply.input-invalid', state, notice: 'Handoff package could not be applied.' };

  let nextState = lifecycle.cloneState?.(state) || structuredCloneSafe(state);
  const previousActiveId = String(state?.activeWorkspaceId || '');
  const applied = [];
  const findings = [];

  for (const prepared of handoff.recipientWorkspaces || []) {
    const descriptor = prepared.descriptor || {};
    const match = matchRecipientWorkspace(nextState, descriptor);
    if (match.ambiguous) {
      findings.push({ code: 'handoff-package.workspace-match-ambiguous', workspaceId: descriptor.workspaceId || '', candidates: match.candidates.map((workspace) => workspace.id) });
      continue;
    }

    const existing = match.workspace || null;
    let workspaceId = existing?.id || String(descriptor.workspaceId || '').trim();
    if (existing) {
      const index = (nextState.workspaces || []).findIndex((workspace) => workspace.id === existing.id);
      const localSources = (existing.sources || []).filter((source) => source?.id === 'local');
      const replacement = Object.assign({}, existing, {
        name: prepared.workspaceEntry.title || existing.name || descriptor.workspaceId || 'Handoff workspace',
        title: prepared.workspaceEntry.title || existing.title || existing.name || descriptor.workspaceId || 'Handoff workspace',
        records: [],
        assets: [],
        sources: localSources.length ? localSources : (existing.sources || []).filter((source) => source?.id === 'local'),
        sourceOrder: ['local'],
        workspaceMarkdown: String(prepared.workspaceEntry.markdown || ''),
        workspaceImport: Object.assign({}, existing.workspaceImport || {}, {
          schema: 'tiinex.workspace.import.v1',
          path: prepared.workspaceEntry.path || descriptor.sourceWorkspaceTargetInnerPath || existing.workspaceImport?.path || 'workspace.workspace.md',
          sourceMode: 'handoff-recipient-v2-workspace',
          boundary: 'browser-local recipient-v2 Handoff workspace projection; exact carrier qualification remains Tooling-owned',
          handoffWorkspaceId: String(descriptor.workspaceId || ''),
          handoffWorkspaceArchivePath: String(descriptor.workspaceArchivePath || ''),
          handoffWorkspaceTargetSha256: String(descriptor.sourceWorkspaceTargetSha256 || '')
        }),
        importLog: [{ kind: 'handoff-recipient-v2-reconcile', workspaceId: descriptor.workspaceId || '', at: nowIso(options) }, ...(Array.isArray(existing.importLog) ? existing.importLog.slice(0, 49) : [])]
      });
      nextState.workspaces[index] = replacement;
    } else {
      const opened = lifecycle.openWorkspaceFromMarkdown?.(nextState, prepared.workspaceEntry.markdown || '', {
        id: workspaceId || undefined,
        title: prepared.workspaceEntry.title || descriptor.workspaceId || 'Handoff workspace',
        path: prepared.workspaceEntry.path || descriptor.sourceWorkspaceTargetInnerPath || 'workspace.workspace.md',
        sourceMode: 'handoff-recipient-v2-workspace'
      }, options);
      if (!opened?.ok) return { ok: false, error: opened?.error || 'handoff-package.workspace-open-failed', state, handoff, notice: `Could not open carried workspace ${descriptor.workspaceId || ''}.` };
      nextState = opened.state;
      workspaceId = opened.workspace?.id || workspaceId;
      const openedWorkspace = (nextState.workspaces || []).find((workspace) => workspace.id === workspaceId);
      if (openedWorkspace) openedWorkspace.workspaceImport = Object.assign({}, openedWorkspace.workspaceImport || {}, {
        handoffWorkspaceId: String(descriptor.workspaceId || ''),
        handoffWorkspaceArchivePath: String(descriptor.workspaceArchivePath || ''),
        handoffWorkspaceTargetSha256: String(descriptor.sourceWorkspaceTargetSha256 || '')
      });
    }

    if (typeof parseWorkspaceConfig === 'function') {
      nextState = registerWorkspaceConfigSources(nextState, workspaceId, prepared.workspaceEntry.markdown || '', { lifecycle, parseWorkspaceConfig });
    }
    const records = Array.isArray(prepared.adapterResult?.records) ? prepared.adapterResult.records : [];
    if (records.length) {
      const recordResult = lifecycle.addWorkspaceRecords?.(nextState, workspaceId, records, options);
      if (!recordResult?.ok) return { ok: false, error: recordResult?.error || 'handoff-package.records-apply-failed', state, handoff, notice: `Could not restore carried artifacts for ${descriptor.workspaceId || ''}.` };
      nextState = recordResult.state;
    }
    const workspace = (nextState.workspaces || []).find((item) => item.id === workspaceId);
    if (workspace) {
      workspace.workspaceImport = Object.assign({}, workspace.workspaceImport || {}, {
        schema: 'tiinex.workspace.import.v1',
        sourceMode: 'handoff-recipient-v2-workspace',
        handoffWorkspaceId: String(descriptor.workspaceId || ''),
        handoffWorkspaceArchivePath: String(descriptor.workspaceArchivePath || ''),
        handoffWorkspaceTargetSha256: String(descriptor.sourceWorkspaceTargetSha256 || ''),
        boundary: 'transient browser-local recipient-v2 Handoff projection; package workspaces reconcile by qualified identity and remain in one Viewer world'
      });
      workspace.importResults = Array.isArray(workspace.importResults) ? workspace.importResults.slice() : [];
      workspace.importResults.unshift({
        schema: 'tiinex.workspace.import.result.v1', ok: true,
        message: `Reconciled Handoff workspace ${descriptor.workspaceId || workspaceId}.`,
        counts: { records: records.length, assets: 0, workspaceEntries: 1, warnings: prepared.adapterResult?.warnings?.length || 0, errors: 0 },
        diagnostics: { handoffPackage: true, recipientV2: true, transientSession: true, noRemoteFetch: true, workspaceId: descriptor.workspaceId || '' },
        at: nowIso(options)
      });
    }
    applied.push({ workspaceId, handoffWorkspaceId: descriptor.workspaceId || '', records: records.length, replaced: Boolean(existing) });
  }

  if (!applied.length && findings.length) {
    return { ok: false, error: 'handoff-package.workspace-reconcile-ambiguous', state, handoff, findings, notice: 'Handoff package workspace identities were ambiguous; no workspace was replaced.' };
  }
  nextState.activeWorkspaceId = (nextState.workspaces || []).some((workspace) => workspace.id === previousActiveId)
    ? previousActiveId
    : (nextState.activeWorkspaceId || applied[0]?.workspaceId || '');
  return {
    ok: true,
    state: nextState,
    handoff,
    recipientV2: true,
    transientSession: true,
    appliedWorkspaces: applied,
    findings,
    materialCount: applied.reduce((sum, item) => sum + item.records + 1, 0),
    workspaceId: nextState.activeWorkspaceId || applied[0]?.workspaceId || '',
    notice: `Handoff reconciled · ${applied.length} workspace${applied.length === 1 ? '' : 's'} · ${applied.reduce((sum, item) => sum + item.records, 0)} artifact${applied.reduce((sum, item) => sum + item.records, 0) === 1 ? '' : 's'}${findings.length ? ` · ${findings.length} ambiguous workspace${findings.length === 1 ? '' : 's'} left unchanged` : ''}.`
  };
}

function matchRecipientWorkspace(state = {}, descriptor = {}) {
  const workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
  const desiredId = String(descriptor.workspaceId || '').trim();
  const exact = workspaces.filter((workspace) => String(workspace?.id || '') === desiredId);
  if (exact.length === 1) return { workspace: exact[0], candidates: exact, reason: 'workspace-id', ambiguous: false };
  if (exact.length > 1) return { workspace: null, candidates: exact, reason: 'workspace-id', ambiguous: true };

  const targetPath = canonicalPath(descriptor.sourceWorkspaceTargetInnerPath || '');
  const contextual = workspaces.filter((workspace) => {
    const importState = workspace?.workspaceImport || {};
    if (String(importState.handoffWorkspaceId || '') === desiredId) return true;
    if (targetPath && canonicalPath(importState.path || '') === targetPath) return true;
    const packageContextId = String(workspace?.packageWorkspaceContext?.id || workspace?.packageWorkspaceContext?.workspaceId || '');
    if (packageContextId && packageContextId === desiredId) return true;
    return false;
  });
  if (contextual.length === 1) return { workspace: contextual[0], candidates: contextual, reason: 'workspace-context', ambiguous: false };
  if (contextual.length > 1) return { workspace: null, candidates: contextual, reason: 'workspace-context', ambiguous: true };

  const byRepo = workspaces.filter((workspace) => (workspace.sources || []).some((source) => repoSlug(source?.repository || source?.repo || '') === desiredId));
  if (byRepo.length === 1) return { workspace: byRepo[0], candidates: byRepo, reason: 'repository-affinity', ambiguous: false };
  if (byRepo.length > 1) return { workspace: null, candidates: byRepo, reason: 'repository-affinity', ambiguous: true };
  return { workspace: null, candidates: [], reason: 'new', ambiguous: false };
}

function repoSlug(value = '') {
  const text = String(value || '').replace(/\.git$/i, '').replace(/\\/g, '/').replace(/\/+$/, '');
  return text.split('/').filter(Boolean).pop() || '';
}

function canonicalPath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/').trim(); }


function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value || {})); }
function firstFinding(findings = []) { return String((findings || []).find((finding) => finding?.severity === 'error')?.message || (findings || [])[0]?.message || '').trim(); }
function nowIso(options = {}) { return typeof options.clock === 'function' ? options.clock() : new Date().toISOString(); }
