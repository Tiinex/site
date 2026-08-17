import { collectLocalFilesFromDataTransfer, materializeLocalMarkdownFiles } from '../adapters/local/local.adapter.js';
import { applyLocalAdapterResultToWorkspace } from '../workspaces/workspace.import.js';
import { assertCanonicalWorkspaceRuntimeState } from '../workspaces/workspace.runtimeCanonical.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';

export async function runLocalMaterialImportCommand(input = {}) {
  const lifecycle = input.lifecycle;
  const state = input.state;
  const options = input.options || {};
  const authority = durableLocalMutationDecision(input.persistenceOwnership, DurableLocalMutationOperation.localMaterialIntake);
  if (!authority.ok) return { ok: false, error: authority.error, state, notice: authority.notice, authority };
  if (!lifecycle) return { ok: false, error: 'lifecycle.missing', state, notice: 'Could not add selected material.' };
  const fileList = input.fileList || [];
  const collectFiles = input.collectFiles || collectLocalFilesFromDataTransfer;
  const materialize = input.materialize || materializeLocalMarkdownFiles;
  const apply = input.apply || applyLocalAdapterResultToWorkspace;
  const files = options.fromDataTransfer ? await collectFiles(fileList) : Array.from(fileList || []).filter(Boolean);
  if (!files.length && !input.adapterResult) return { ok: false, error: 'local.files.empty', state, notice: 'No files selected.', files: [] };

  let adapterResult = input.adapterResult || null;
  if (!adapterResult) {
    try {
      adapterResult = await materialize(files, { ...options, sourceMode: options.sourceMode || 'manual-files' });
    } catch (error) {
      return { ok: false, error: 'local.materialize.failed', state, notice: 'Could not read local files or archives.', exception: error, files };
    }
  }

  const materialCount = localMaterialCount(adapterResult);
  if (!materialCount) {
    const skipped = (adapterResult?.warnings?.length || 0) + (adapterResult?.errors?.length || 0);
    return {
      ok: false,
      error: skipped ? 'local.material.empty-with-findings' : 'local.material.empty',
      state,
      notice: skipped ? 'No readable Markdown, workspace, asset, or zip material was imported.' : 'No files selected.',
      files,
      adapterResult,
      materialCount
    };
  }

  let applied;
  try {
    applied = apply(lifecycle, state, input.workspaceId || '', adapterResult, options);
  } catch (error) {
    return { ok: false, error: 'local.apply.failed', state, notice: 'Could not materialize selected zip/files into the workspace.', exception: error, files, adapterResult, materialCount };
  }

  const changed = Boolean(applied?.addedRecords || applied?.addedAssets || applied?.workspaceOpened || applied?.workspaceEntries);
  if (applied?.error === 'import.conflict.requires-resolution') {
    return { ok: false, error: applied.error, state, notice: 'Incoming material overlaps this workspace.', conflicts: applied.conflicts || [], files, adapterResult, applied, materialCount };
  }
  if (applied?.error === 'import.cancelled') {
    return { ok: false, error: applied.error, cancelled: true, state, notice: 'Import cancelled.', conflicts: applied.conflicts || [], files, adapterResult, applied, materialCount };
  }
  if (!applied?.ok && applied?.state === state && !changed) {
    return { ok: false, error: applied?.error || 'local.apply.noop', state, notice: 'Could not add selected material.', files, adapterResult, applied, materialCount };
  }
  const nextState = applied?.state || state;
  const canonicality = assertCanonicalWorkspaceRuntimeState(nextState, 'local-import');
  if (!canonicality.ok) return { ok: false, error: 'workspace.runtime-candidate-model-leak', state, notice: 'Imported workspace material could not be normalized safely.', files, adapterResult, applied, materialCount, canonicality };
  return {
    ok: applied?.ok !== false || changed,
    state: nextState,
    notice: applied?.summary?.message || 'Import completed.',
    files,
    adapterResult,
    applied,
    materialCount,
    summary: applied?.summary || null,
    workspaceId: applied?.workspaceId || input.workspaceId || ''
  };
}

export function localMaterialCount(adapterResult = {}) {
  return (adapterResult.records?.length || 0) + (adapterResult.assets?.length || 0) + (adapterResult.workspaceEntries?.length || 0);
}


export function looksLikePastedTraceMarkdown(text = '') {
  const body = String(text || '');
  if (!body.trim()) return false;
  if (/^#\s+Continuity Context\s*$/m.test(body)) return true;
  return /^\s*Current Schema\s*:/mi.test(body) && /^#\s+Continuity Integrity\s*$/m.test(body);
}

export function makePastedTraceFile(text = '', options = {}) {
  const body = String(text || '');
  if (!looksLikePastedTraceMarkdown(body)) return null;
  const stamp = (typeof options.clock === 'function' ? options.clock() : new Date().toISOString()).replace(/[:.]/g, '-');
  const name = `pasted-trace-${stamp}.trace.md`;
  const bytes = new TextEncoder().encode(body);
  if (typeof File !== 'undefined') return new File([body], name, { type: 'text/markdown' });
  return {
    name,
    size: bytes.byteLength,
    type: 'text/markdown',
    async text() { return body; },
    async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); }
  };
}
