import { parseExactGithubIssueTarget } from '../sources/github/github.issueTarget.js';

export const WORKSPACE_PUBLICATION_RECEIPTS_LIMIT = 64;

export function stateWithWorkspacePublicationReceipt(state = {}, workspaceId = '', result = {}, options = {}) {
  if (result?.status !== 'success' || !result?.sourceBinding || !result?.receipt) return { ok: false, error: 'publication.receipt.unqualified', state };
  const executionAttestation = qualifiedGithubHumanMutationAttestation(result, options.executionAttestation);
  if (!executionAttestation) return { ok: false, error: 'publication.receipt.human-mutation-attestation-missing', state };
  const next = JSON.parse(JSON.stringify(state || {}));
  const id = String(workspaceId || next.activeWorkspaceId || '').trim();
  const workspace = (next.workspaces || []).find((item) => String(item?.id || '') === id);
  if (!workspace) return { ok: false, error: 'workspace.not.found', state };
  const recordId = String(result.receipt?.localInputId || result.sourceBinding?.localInputId || '').trim();
  const record = (workspace.records || []).find((item) => String(item?.id || '') === recordId);
  if (!record) return { ok: false, error: 'publication.receipt.local-input-missing', state };
  const before = JSON.stringify(record);
  const entry = {
    schema: 'tiinex.site.workspace.publicationReceipt.v1',
    resultId: String(result.resultId || ''),
    recordedAt: nowIso(options.clock),
    receipt: result.receipt,
    sourceBinding: result.sourceBinding,
    executionAttestation,
    boundary: 'Browser-local durable publication fact with exact-plan + exact-target human GitHub web mutation confirmation. Tiinex did not perform a hidden/API write, and this state does not re-identify, remove, or mutate the local input artifact.'
  };
  const existing = Array.isArray(workspace.publicationReceipts) ? workspace.publicationReceipts.filter((item) => item?.receipt?.receiptId !== result.receipt.receiptId) : [];
  workspace.publicationReceipts = [entry, ...existing].slice(0, WORKSPACE_PUBLICATION_RECEIPTS_LIMIT);
  const after = JSON.stringify((workspace.records || []).find((item) => String(item?.id || '') === recordId));
  if (after !== before) return { ok: false, error: 'publication.receipt.local-input-mutated', state };
  return { ok: true, state: next, workspace, entry };
}

function qualifiedGithubHumanMutationAttestation(result = {}, value = null) {
  if (!value || typeof value !== 'object') return null;
  if (String(value.type || '') !== 'human-github-web-mutation-confirmation') return null;
  const planSha256 = String(result?.receipt?.planSha256 || '').trim();
  if (!planSha256 || String(value.planSha256 || '') !== planSha256) return null;
  const resultTarget = result?.sourceBinding?.remoteTarget || result?.receipt?.remoteTarget || result?.remoteTarget || null;
  const attestedTarget = value.mutationTarget || null;
  const parsedResult = parseExactGithubIssueTarget(resultTarget?.inputTarget || '');
  const parsedAttested = parseExactGithubIssueTarget(attestedTarget?.inputTarget || '');
  if (!parsedResult.ok || !parsedAttested.ok) return null;
  if (String(resultTarget?.targetKind || '') !== parsedResult.targetKind || String(attestedTarget?.targetKind || '') !== parsedAttested.targetKind) return null;
  if (parsedResult.targetKind !== parsedAttested.targetKind || parsedResult.inputTarget !== parsedAttested.inputTarget) return null;
  const confirmedAt = String(value.confirmedAt || '').trim();
  if (!confirmedAt) return null;
  return Object.freeze({
    schema: 'tiinex.site.workspace.publicationExecutionAttestation.v2',
    type: 'human-github-web-mutation-confirmation',
    planSha256,
    mutationTarget: Object.freeze({ provider: 'github', targetKind: parsedAttested.targetKind, inputTarget: parsedAttested.inputTarget, repository: parsedAttested.repository, issueNumberLexeme: parsedAttested.issueNumber, commentId: String(parsedAttested.commentId || ''), issueTarget: parsedAttested.issueTarget }),
    confirmedAt,
    boundary: String(value.boundary || 'Human confirmed the GitHub web mutation for the exact publication plan at the exact qualified target; Tiinex did not perform a hidden/API write.')
  });
}
function nowIso(clock) { return typeof clock === 'function' ? new Date(clock()).toISOString() : new Date().toISOString(); }
