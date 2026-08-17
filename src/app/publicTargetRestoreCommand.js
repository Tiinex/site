import { runGithubSourceOperation } from './githubSourceOperation.js';
import { runExplicitUrlMaterialImportCommand } from './urlMaterialCommand.js';
import { openWorkspaceRecordAction, openWorkspaceRecordMemberAction } from './workspaceRecordActions.js';
import { stateWithWorkspaceViewPatchAndFocus } from './workspaceScopedInteraction.js';
import {
  normalizePublicTarget,
  publicTargetRestoreCapability,
  PublicTargetRestoreCapability
} from './publicTarget.js';

export async function runPublicTargetRestoreCommand({
  target,
  runtimeApi = {},
  fetchImpl = globalThis.fetch,
  workspaceConfig = {},
  isCurrentOwner = () => true,
  runGithubOperation = runGithubSourceOperation,
  runUrlImport = runExplicitUrlMaterialImportCommand
} = {}) {
  const normalized = normalizePublicTarget(target);
  const lifecycle = runtimeApi.lifecycle;
  if (!normalized) return failure('public-target.invalid', 'Public target is invalid.');
  const restoreCapability = publicTargetRestoreCapability(normalized);
  if (restoreCapability === PublicTargetRestoreCapability.invalid) return failure('public-target.invalid', 'Public target is invalid.', { target: normalized });
  if (restoreCapability === PublicTargetRestoreCapability.unsupported) return failure('public-target.unsupported', 'This public URL target is not a supported Tiinex material target.', { target: normalized });
  if (!lifecycle?.makeEmptyAppState || !lifecycle?.createWorkspace) return failure('public-target.lifecycle-missing', 'Workspace lifecycle is unavailable.');
  if (!isCurrentOwner()) return failure('public-target.stale', 'Public target restore was superseded.');

  const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'public-target', name: publicTargetLabel(normalized) });
  if (!created?.ok) return failure(created?.error || 'public-target.workspace-failed', 'Could not create public target workspace.');
  let state = created.state;
  const workspaceId = created.workspace.id;

  const materialized = normalized.adapterId === 'github'
    ? await materializeGithubTarget({ normalized, state, workspaceId, runtimeApi, workspaceConfig, fetchImpl, runGithubOperation, isCurrentOwner })
    : await runUrlImport({ lifecycle, state, workspaceId, urls: [normalized.externalTarget], fetchImpl });
  if (!materialized?.ok) return failure(materialized?.error || 'public-target.materialization-failed', materialized?.notice || 'Could not materialize public target.', { target: normalized, state: materialized?.state || state });
  if (!isCurrentOwner()) return failure('public-target.stale', 'Public target restore was superseded.', { state: materialized.state });
  state = materialized.state;

  const workspace = workspaceById(state, workspaceId) || lifecycle.activeWorkspace?.(state);
  const record = selectPublicTargetRecord(workspace, normalized);
  if (!record) return failure('public-target.record-missing', 'Public target materialized without a matching Tiinex artifact.', { target: normalized, state });

  if (isWorkspaceArtifact(record) && ['workspace', 'workspace.member'].includes(normalized.targetKind)) {
    const opened = normalized.targetKind === 'workspace.member'
      ? openWorkspaceRecordMemberAction({ lifecycle, parseWorkspaceConfig: runtimeApi.config?.parseWorkspaceConfig, state, record, memberIdentity: normalized.memberIdentity, descriptorTarget: normalized })
      : openWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig: runtimeApi.config?.parseWorkspaceConfig, state, record, descriptorTarget: normalized });
    if (!opened?.ok) return failure(opened?.error || 'public-target.workspace-open-failed', opened?.message || 'Could not open public workspace target.', { target: normalized, state });
    state = opened.state;
    if (workspaceId && workspaceById(state, workspaceId) && String(opened.workspace?.id || '') !== workspaceId) {
      const consumed = lifecycle.closeWorkspace?.(state, workspaceId);
      if (consumed?.ok) state = consumed.state;
    }
    for (const sourceInput of opened.sourceInputs || []) {
      if (!isCurrentOwner()) return failure('public-target.stale', 'Public target restore was superseded.', { state });
      const loaded = await materializeWorkspaceSourceInput({ sourceInput, state, runtimeApi, workspaceConfig, fetchImpl, runGithubOperation, isCurrentOwner });
      if (!loaded?.ok) return failure(loaded?.error || 'public-target.workspace-source-failed', loaded?.message || 'Could not materialize a workspace entrypoint from the public target.', { target: normalized, state: loaded?.state || state });
      state = loaded.state;
    }
    return { ok: true, state, target: normalized, record, workspaceTarget: true, workspace: lifecycle.activeWorkspace?.(state) || null };
  }

  const selectedState = stateWithWorkspaceViewPatchAndFocus(state, workspace?.id || workspaceId, { workspaceVerse: 'lineage', selectedRecordId: record.id || '' });
  return { ok: true, state: selectedState, target: normalized, record, workspaceTarget: false, workspace: workspaceById(selectedState, workspace?.id || workspaceId) };
}

async function materializeGithubTarget({ normalized, state, workspaceId, runtimeApi, workspaceConfig, fetchImpl, runGithubOperation, isCurrentOwner }) {
  const input = githubInputForTarget(normalized);
  if (!input) return failure('public-target.github-invalid', 'GitHub public target could not be converted to an exact material request.', { state });
  const operationRef = { current: { token: null, controller: null } };
  const out = await runGithubOperation({
    input: Object.assign({ resetSourceCache: false, allowSourceCache: false }, input),
    options: { state, workspaceId },
    state,
    active: workspaceById(state, workspaceId),
    runtimeApi,
    workspaceConfig,
    operationRef,
    setNotice: () => {}, setDialog: () => {}, setGithubRequestPending: () => {}, commit: () => {},
    getLatestState: () => state,
    fetchImpl,
    AbortControllerImpl: undefined
  });
  if (!isCurrentOwner()) return failure('public-target.stale', 'Public target restore was superseded.', { state: out?.state || state });
  return out;
}

async function materializeWorkspaceSourceInput({ sourceInput, state, runtimeApi, workspaceConfig, fetchImpl, runGithubOperation, isCurrentOwner }) {
  if (String(sourceInput?.adapterId || 'github') !== 'github') return failure('public-target.workspace-source-unsupported', 'Public workspace target requested an unsupported source adapter.', { state });
  const workspaceId = sourceInput.workspaceId || state.activeWorkspaceId;
  const operationRef = { current: { token: null, controller: null } };
  const out = await runGithubOperation({
    input: Object.assign({ resetSourceCache: false, allowSourceCache: false }, sourceInput),
    options: { state, workspaceId },
    state,
    active: workspaceById(state, workspaceId),
    runtimeApi,
    workspaceConfig,
    operationRef,
    setNotice: () => {}, setDialog: () => {}, setGithubRequestPending: () => {}, commit: () => {},
    getLatestState: () => state,
    fetchImpl,
    AbortControllerImpl: undefined
  });
  if (!isCurrentOwner()) return failure('public-target.stale', 'Public target restore was superseded.', { state: out?.state || state });
  return out;
}

function githubInputForTarget(target = {}) {
  if (target.targetKind === 'github.issue' || target.targetKind === 'github.issue.comment' || target.targetKind === 'github.discussion') {
    return { repository: target.repository, rootPath: '.topics', repoDiscovery: false, issueDiscovery: false, issueUrls: target.externalTarget, explicitFileRefs: [] };
  }
  if (target.targetKind === 'github.file' || target.targetKind === 'workspace' || target.targetKind === 'workspace.member') {
    if (!target.repository || !target.path) return null;
    return { repository: target.repository, ref: target.ref || '', rootPath: '.topics', repoDiscovery: false, issueDiscovery: false, issueUrls: '', explicitFileRefs: [target.path] };
  }
  return null;
}

export function selectPublicTargetRecord(workspace = {}, target = {}) {
  const records = Array.isArray(workspace?.records) ? workspace.records : [];
  const external = String(target?.externalTarget || '').trim();
  const commentId = String(target?.commentId || '').trim();
  const targetPath = String(target?.path || '').replace(/^\/+/, '');
  const scored = records.map((record) => ({ record, score: scoreRecord(record, { external, commentId, targetPath, target }) })).filter((item) => item.score > 0);
  scored.sort((a, b) => b.score - a.score || String(a.record.path || '').localeCompare(String(b.record.path || '')));
  return scored[0]?.record || (records.length === 1 ? records[0] : null);
}

function scoreRecord(record = {}, context = {}) {
  const targetKind = String(record?.sourceTarget?.targetKind || '').toLowerCase();
  const inputTarget = String(record?.sourceTarget?.inputTarget || record?.snapshot?.target?.canonicalUrl || '').trim();
  const rawUrl = String(record?.sourceTarget?.rawUrl || record?.snapshot?.rawUrl || '').trim();
  const path = String(record?.sourceTarget?.sourceArtifactPath || record?.path || '').replace(/^\/+/, '');
  let score = 0;
  if (context.external && (inputTarget === context.external || rawUrl === context.external)) score += 300;
  if (context.commentId && (inputTarget.includes(`issuecomment-${context.commentId}`) || rawUrl.includes(`issuecomment-${context.commentId}`))) score += 400;
  if (context.targetPath && path === context.targetPath) score += 300;
  if (targetKind.includes('embedded-artifact')) score += 160;
  if (targetKind.includes('shell') || targetKind.includes('snapshot')) score -= 40;
  if (isWorkspaceArtifact(record) && ['workspace', 'workspace.member'].includes(context.target?.targetKind)) score += 250;
  return score;
}

function isWorkspaceArtifact(record = {}) { return Boolean(record?.workspaceArtifactRole?.openEligible) || /\.workspace\.md$/i.test(String(record?.path || record?.sourceTarget?.sourceArtifactPath || '')); }
function workspaceById(state = {}, workspaceId = '') { return (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => workspace.id === workspaceId) || null; }
function publicTargetLabel(target = {}) { try { const url = new URL(target.externalTarget); return ['workspace', 'workspace.member'].includes(target.targetKind) ? 'Shared workspace' : `Shared ${url.hostname}`; } catch (_) { return 'Shared target'; } }
function failure(error, message, extra = {}) { return Object.assign({ ok: false, error, message, state: extra.state }, extra); }
