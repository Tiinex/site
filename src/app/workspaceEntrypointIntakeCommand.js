import { collectLocalFilesFromDataTransfer, materializeLocalMarkdownFiles } from '../adapters/local/local.adapter.js';
import { mergeWorkspaceRecordAction, openWorkspaceRecordAction } from './workspaceRecordActions.js';
import { assertCanonicalWorkspaceRuntimeState } from '../workspaces/workspace.runtimeCanonical.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';

export async function prepareWorkspaceEntrypointIntake({ fileList = [], adapterResult = null, options = {} } = {}) {
  const collectFiles = options.collectFiles || collectLocalFilesFromDataTransfer;
  const materialize = options.materialize || materializeLocalMarkdownFiles;
  const files = options.fromDataTransfer ? await collectFiles(fileList) : Array.from(fileList || []).filter(Boolean);
  if (!files.length && !adapterResult) return { ok: false, error: 'workspace.entrypoint.files.empty', files: [], notice: 'No workspace file was available.' };
  let result = adapterResult;
  if (!result) {
    try {
      result = await materialize(files, { ...options, sourceMode: options.sourceMode || 'global-workspace-drop' });
    } catch (exception) {
      return { ok: false, error: 'workspace.entrypoint.materialize.failed', files, exception, notice: 'Could not read the workspace file.' };
    }
  }
  const workspaceEntries = Array.isArray(result?.workspaceEntries) ? result.workspaceEntries : [];
  const ordinaryRecords = Array.isArray(result?.records) ? result.records : [];
  const assets = Array.isArray(result?.assets) ? result.assets : [];
  if (!workspaceEntries.length) return { ok: false, error: 'workspace.entrypoint.none', files, adapterResult: result, notice: 'Drop local material into a workspace or use Add.' };
  if (ordinaryRecords.length || assets.length) {
    return { ok: false, error: 'workspace.entrypoint.mixed-global-material', files, adapterResult: result, workspaceEntries, notice: 'Drop workspace files alone outside a workspace, or drop mixed material into a specific workspace.' };
  }
  return { ok: true, files, adapterResult: result, workspaceEntries };
}

export async function runWorkspaceEntrypointIntakeCommand({
  lifecycle,
  state = {},
  parseWorkspaceConfig,
  fileList = [],
  adapterResult = null,
  mode = '',
  options = {},
  persistenceOwnership = null
} = {}) {
  const authority = durableLocalMutationDecision(persistenceOwnership, DurableLocalMutationOperation.localWorkspaceEntrypointIntake);
  if (!authority.ok) return { ok: false, error: authority.error, state, notice: authority.notice, authority };
  const prepared = await prepareWorkspaceEntrypointIntake({ fileList, adapterResult, options });
  if (!prepared.ok) return Object.assign({ state }, prepared);
  const requestedMode = String(mode || '').trim().toLowerCase();
  const existingWorkspaces = Array.isArray(state?.workspaces) ? state.workspaces.length : 0;
  if (!requestedMode && existingWorkspaces > 0) {
    return Object.assign({}, prepared, { ok: false, requiresChoice: true, error: 'workspace.entrypoint.choice-required', state, choices: ['open', 'merge'] });
  }
  const actionMode = requestedMode === 'merge' ? 'merge' : 'open';
  let nextState = state;
  const sourceInputs = [];
  const appliedEntries = [];
  for (const entry of prepared.workspaceEntries) {
    const record = workspaceRecordFromEntry(entry);
    const result = actionMode === 'merge'
      ? mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state: nextState, workspaceId: nextState.activeWorkspaceId || '', record })
      : openWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state: nextState, record });
    if (!result?.ok) return Object.assign({}, prepared, { ok: false, error: result?.error || 'workspace.entrypoint.apply.failed', message: result?.message || 'Could not apply workspace entrypoint.', state: nextState, mode: actionMode, appliedEntries, sourceInputs });
    nextState = result.state;
    appliedEntries.push(entry);
    sourceInputs.push(...(result.sourceInputs || []));
  }
  const canonicality = assertCanonicalWorkspaceRuntimeState(nextState, `global-workspace-entrypoint-${actionMode}`);
  if (!canonicality.ok) return Object.assign({}, prepared, { ok: false, error: 'workspace.runtime-candidate-model-leak', state, canonicality, mode: actionMode });
  return Object.assign({}, prepared, {
    ok: true,
    state: nextState,
    mode: actionMode,
    sourceInputs,
    appliedEntries,
    notice: actionMode === 'merge'
      ? `Merged workspace entrypoint${appliedEntries.length === 1 ? '' : 's'} into the current workspace set.`
      : `Opened workspace entrypoint${appliedEntries.length === 1 ? '' : 's'} as the current workspace set.`
  });
}

function workspaceRecordFromEntry(entry = {}) {
  const path = entry.path || 'workspace.workspace.md';
  return {
    id: `local-workspace-entrypoint:${path}`,
    title: entry.title || path,
    path,
    markdown: String(entry.markdown || ''),
    sourceMode: entry.sourceMode || 'local-workspace-file',
    source: { id: 'local', kind: 'local-session', adapterId: 'local', sourceKind: 'local.session' },
    workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true, origin: 'global-local-intake' }
  };
}
