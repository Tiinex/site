import { buildPublicationPlan, buildPublicationResult } from '../publication/publication.contract.js';
import { buildPublicationPreflight } from '../publication/publication.preflight.js';
import { GITHUB_ISSUE_BODY_TARGET_KIND, GITHUB_ISSUE_COMMENT_TARGET_KIND } from '../publication/publication.targetContract.js';
import { normalizeGithubRepository, parseExactGithubIssueTarget, sameGithubRepository } from '../sources/github/github.issueTarget.js';
import { readExactGithubIssuePublicationRepresentation } from '../adapters/github/github.publicationRead.js';
import { sha256Hex, utf8Bytes } from '../export/package.bytes.js';

export const GITHUB_PUBLICATION_MODE = Object.freeze({
  createIssue: 'create-issue',
  createComment: 'create-comment',
  updateIssue: 'update-issue',
  updateComment: 'update-comment'
});

export const GITHUB_PUBLICATION_HUMAN_MUTATION_ATTESTATION = 'human-github-web-mutation-confirmation';

export function buildWorkspaceGithubPublicationPreflight(workspace = {}) { return buildPublicationPreflight(workspace); }

export function buildWorkspaceGithubPublicationProduct(workspace = {}, input = {}, options = {}) {
  const preflight = options.preflight || buildWorkspaceGithubPublicationPreflight(workspace);
  const mode = normalizeMode(input.mode);
  const modeSpec = modeSpecification(mode);
  const recordId = String(input.recordId || '').trim();
  const repository = String(input.repository || '');
  const targetInput = String(input.targetInput || '');
  const destination = {
    provider: 'github',
    repository,
    targetKind: modeSpec.targetKind,
    ...(modeSpec.targetField ? { [modeSpec.targetField]: targetInput } : {})
  };
  const plan = buildPublicationPlan(workspace, { recordId, destination, mutationPolicy: modeSpec.mutationPolicy, preflight });
  const openUrl = publicationOpenUrl(plan);
  const verificationTarget = String(input.finalTarget || (plan.mutationPolicy === 'update-known' ? plan.destination?.externalTarget || '' : ''));
  const mutationTargetQualification = qualifyMutationTarget(plan, verificationTarget);
  const latestReceipt = (Array.isArray(workspace.publicationReceipts) ? workspace.publicationReceipts : []).find((entry) => String(entry?.receipt?.localInputId || '') === recordId) || null;
  return Object.freeze({
    schema: 'tiinex.site.githubPublicationProduct.v1',
    mode,
    modes: publicationModes(),
    eligibleRecords: preflight.publishableLocalDrafts || [],
    preflight,
    plan,
    openUrl,
    verificationTarget,
    mutationTarget: mutationTargetQualification.target || null,
    mutationTargetQualified: mutationTargetQualification.ok === true,
    latestReceipt,
    targetLabel: modeSpec.targetLabel,
    targetRequired: Boolean(modeSpec.targetField),
    targetPlaceholder: modeSpec.targetPlaceholder,
    finalTargetRequired: plan.mutationPolicy !== 'update-known',
    boundary: 'Guided browser routine only. Shared publication plan/result own payload and success; Site performs no GitHub mutation.'
  });
}

export function publicationProgressFor(plan = {}, verificationTarget = '', progress = {}) {
  const current = String(plan?.planSha256 || '');
  const targetQualification = qualifyMutationTarget(plan, verificationTarget);
  const mutationAttestation = targetQualification.ok ? qualifiedHumanMutationAttestation(current, targetQualification.target, progress.mutationAttestation) : null;
  return Object.freeze({
    ...progress,
    mutationAttestation,
    copied: Boolean(current && progress.copiedPlanSha256 === current),
    opened: Boolean(current && progress.openedPlanSha256 === current),
    attested: Boolean(mutationAttestation),
    verified: Boolean(current && progress.verificationPlanSha256 === current && progress.result?.status === 'success' && targetQualification.ok && sameExactMutationTarget(targetQualification.target, progress.result?.remoteTarget))
  });
}

export function confirmWorkspaceGithubPublicationMutation(plan = {}, options = {}) {
  const planSha256 = String(plan?.planSha256 || '').trim();
  if (plan.status !== 'ready' || !planSha256) return Object.freeze({ ok: false, error: 'publication.plan.not-ready', mutationAttestation: null, notice: 'Publication plan is not ready for human mutation confirmation.' });
  const targetQualification = qualifyMutationTarget(plan, options.finalTarget);
  if (!targetQualification.ok) return Object.freeze({ ok: false, error: targetQualification.error, mutationAttestation: null, notice: targetQualification.notice });
  const mutationAttestation = Object.freeze({
    schema: 'tiinex.site.githubPublicationHumanMutationAttestation.v2',
    type: GITHUB_PUBLICATION_HUMAN_MUTATION_ATTESTATION,
    planSha256,
    mutationTarget: targetQualification.target,
    confirmedAt: nowIso(options.clock),
    boundary: 'Human confirms they performed the GitHub web mutation for this exact publication plan at this exact qualified GitHub target. Tiinex did not perform a hidden/API write.'
  });
  return Object.freeze({ ok: true, mutationAttestation, notice: 'Human GitHub mutation confirmed for this exact publication plan and exact target.' });
}

export async function copyWorkspaceGithubPublicationPayload(plan = {}, options = {}) {
  if (plan.status !== 'ready') return Object.freeze({ ok: false, error: 'publication.plan.not-ready', planSha256: plan.planSha256 || '', notice: 'Publication plan is not ready.' });
  const clipboard = options.clipboard;
  if (!clipboard || typeof clipboard.writeText !== 'function') return Object.freeze({ ok: false, error: 'clipboard.unavailable', planSha256: plan.planSha256 || '', notice: 'Clipboard is unavailable.' });
  try {
    await clipboard.writeText(String(plan.outboundPayload?.content || ''));
    return Object.freeze({ ok: true, planSha256: plan.planSha256 || '', payloadSha256: plan.outboundPayload?.sha256 || '', notice: 'Exact publication payload copied.' });
  } catch (exception) {
    return Object.freeze({ ok: false, error: 'clipboard.write-failed', exception, planSha256: plan.planSha256 || '', notice: 'Could not copy publication payload.' });
  }
}

export function openWorkspaceGithubPublicationTarget(plan = {}, options = {}) {
  if (plan.status !== 'ready') return Object.freeze({ ok: false, error: 'publication.plan.not-ready', planSha256: plan.planSha256 || '', notice: 'Publication plan is not ready.' });
  const url = publicationOpenUrl(plan);
  if (!url) return Object.freeze({ ok: false, error: 'publication.open-target.unavailable', planSha256: plan.planSha256 || '', notice: 'GitHub target is not qualified for opening.' });
  const open = options.open || options.window?.open?.bind(options.window);
  if (typeof open !== 'function') return Object.freeze({ ok: false, error: 'publication.open.unavailable', planSha256: plan.planSha256 || '', url, notice: 'Browser open is unavailable.' });
  try {
    const opened = open(url, '_blank', 'noopener,noreferrer');
    if (opened === null || opened === false) return Object.freeze({ ok: false, error: 'publication.open.blocked', planSha256: plan.planSha256 || '', url, notice: 'GitHub window could not be opened.' });
    return Object.freeze({ ok: true, planSha256: plan.planSha256 || '', url, notice: 'GitHub opened. This is not publication success.' });
  } catch (exception) {
    return Object.freeze({ ok: false, error: 'publication.open.failed', exception, planSha256: plan.planSha256 || '', url, notice: 'GitHub window could not be opened.' });
  }
}

export async function verifyWorkspaceGithubPublication(plan = {}, input = {}) {
  if (plan.status !== 'ready') return Object.freeze({ ok: false, error: 'publication.plan.not-ready', result: buildPublicationResult(plan, { state: 'failure', verificationStatus: 'not-run' }), notice: 'Publication plan is not ready.' });
  const targetQualification = qualifyMutationTarget(plan, input.finalTarget);
  if (!targetQualification.ok) {
    const result = buildPublicationResult(plan, { state: 'failure', verificationStatus: 'failed', sourceTarget: { adapterId: 'github', targetKind: plan.destination?.targetKind || '', inputTarget: String(input.finalTarget || '') } });
    return Object.freeze({ ok: false, error: targetQualification.error, result, executionAttestation: null, notice: targetQualification.notice });
  }
  const exactTarget = targetQualification.parsed;
  const executionAttestation = qualifiedHumanMutationAttestation(String(plan.planSha256 || ''), targetQualification.target, input.mutationAttestation);
  if (!executionAttestation) {
    const result = buildPublicationResult(plan, { state: 'failure', verificationStatus: 'not-run', sourceTarget: { adapterId: 'github', targetKind: exactTarget.targetKind, inputTarget: exactTarget.inputTarget } });
    return Object.freeze({
      ok: false,
      error: 'publication.verify.human-mutation-attestation-required',
      result,
      executionAttestation: null,
      notice: 'Confirm that you posted or updated this exact payload at this exact GitHub target before verification. Copy/Open are not write evidence.'
    });
  }
  try {
    const observed = await readExactGithubIssuePublicationRepresentation(exactTarget, { fetchImpl: input.fetchImpl });
    const verifiedPayloadSha256 = sha256Hex(utf8Bytes(String(observed.content || '')));
    const result = buildPublicationResult(plan, {
      state: 'success',
      verificationStatus: 'verified',
      verifiedPayloadSha256,
      providerReceiptId: observed.providerReceiptId || '',
      sourceTarget: { adapterId: 'github', targetKind: exactTarget.targetKind, inputTarget: exactTarget.inputTarget },
      verification: { status: 'verified', method: observed.method || 'github-browser-issue-reader-exact-body', observedAt: observed.observedAt || nowIso(input.clock), note: 'Exact GitHub issue/comment body read after shared v446 target qualification.' }
    });
    return Object.freeze({ ok: result.status === 'success' && Boolean(result.sourceBinding), result, observed, executionAttestation, notice: result.status === 'success' ? 'Human-guided GitHub publication verified exactly.' : 'GitHub target was read, but exact publication verification failed.' });
  } catch (exception) {
    const result = buildPublicationResult(plan, { state: 'partial', verificationStatus: 'unavailable', sourceTarget: { adapterId: 'github', targetKind: exactTarget.targetKind, inputTarget: exactTarget.inputTarget }, verification: { status: 'unavailable', method: 'github-browser-issue-reader', observedAt: nowIso(input.clock), note: exception?.message || 'GitHub read unavailable.' } });
    return Object.freeze({ ok: false, error: 'publication.verify.read-unavailable', exception, result, executionAttestation, notice: 'GitHub verification is unavailable; no source binding was created.' });
  }
}

export function publicationOpenUrl(plan = {}) {
  if (plan.status !== 'ready' || plan.destination?.provider !== 'github') return '';
  const rawRepo = String(plan.destination?.repository || '').trim();
  const repo = normalizeGithubRepository(rawRepo);
  if (!repo) return '';
  if (plan.mutationPolicy === 'create-new' && plan.destination?.targetKind === GITHUB_ISSUE_BODY_TARGET_KIND) return `https://github.com/${rawRepo}/issues/new`;
  if (plan.mutationPolicy === 'create-comment' && plan.destination?.targetKind === GITHUB_ISSUE_COMMENT_TARGET_KIND) {
    const parsed = parseExactGithubIssueTarget(plan.destination?.containerTarget || '');
    return parsed.ok ? parsed.issueTarget : '';
  }
  if (plan.mutationPolicy === 'update-known') {
    const parsed = parseExactGithubIssueTarget(plan.destination?.externalTarget || '');
    return parsed.ok ? parsed.inputTarget : '';
  }
  return '';
}

function publicationModes() {
  return Object.freeze([
    Object.freeze({ id: GITHUB_PUBLICATION_MODE.createIssue, label: 'Create new issue' }),
    Object.freeze({ id: GITHUB_PUBLICATION_MODE.createComment, label: 'Create comment' }),
    Object.freeze({ id: GITHUB_PUBLICATION_MODE.updateIssue, label: 'Update known issue' }),
    Object.freeze({ id: GITHUB_PUBLICATION_MODE.updateComment, label: 'Update known comment' })
  ]);
}
function normalizeMode(value = '') { return Object.values(GITHUB_PUBLICATION_MODE).includes(value) ? value : GITHUB_PUBLICATION_MODE.createIssue; }
function modeSpecification(mode) {
  if (mode === GITHUB_PUBLICATION_MODE.createComment) return { targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, mutationPolicy: 'create-comment', targetField: 'containerTarget', targetLabel: 'Parent issue URL', targetPlaceholder: 'https://github.com/owner/repo/issues/123' };
  if (mode === GITHUB_PUBLICATION_MODE.updateIssue) return { targetKind: GITHUB_ISSUE_BODY_TARGET_KIND, mutationPolicy: 'update-known', targetField: 'externalTarget', targetLabel: 'Exact issue URL', targetPlaceholder: 'https://github.com/owner/repo/issues/123' };
  if (mode === GITHUB_PUBLICATION_MODE.updateComment) return { targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, mutationPolicy: 'update-known', targetField: 'externalTarget', targetLabel: 'Exact comment permalink', targetPlaceholder: 'https://github.com/owner/repo/issues/123#issuecomment-456' };
  return { targetKind: GITHUB_ISSUE_BODY_TARGET_KIND, mutationPolicy: 'create-new', targetField: '', targetLabel: 'Final issue URL after posting', targetPlaceholder: '' };
}
function qualifyMutationTarget(plan = {}, rawTarget = '') {
  if (plan.status !== 'ready') return Object.freeze({ ok: false, error: 'publication.plan.not-ready', target: null, parsed: null, notice: 'Publication plan is not ready.' });
  const knownTarget = plan.mutationPolicy === 'update-known' ? String(plan.destination?.externalTarget || '') : '';
  const raw = String(rawTarget || knownTarget || '');
  if (!raw) return Object.freeze({ ok: false, error: 'publication.attestation.target-required', target: null, parsed: null, notice: 'Supply the exact GitHub issue/comment target before confirming the human mutation.' });
  const parsed = parseExactGithubIssueTarget(raw);
  if (!parsed.ok) return Object.freeze({ ok: false, error: 'publication.attestation.target-invalid', target: null, parsed: null, notice: 'Mutation confirmation requires one exact supported GitHub issue/comment target.' });
  if (parsed.targetKind !== String(plan.destination?.targetKind || '')) return Object.freeze({ ok: false, error: 'publication.attestation.target-kind-mismatch', target: null, parsed, notice: 'Mutation target kind differs from the publication plan.' });
  if (!sameGithubRepository(parsed.repository, plan.destination?.repository || '')) return Object.freeze({ ok: false, error: 'publication.attestation.target-repo-mismatch', target: null, parsed, notice: 'Mutation target belongs to a different repository than the publication plan.' });
  if (plan.mutationPolicy === 'create-comment') {
    const container = parseExactGithubIssueTarget(plan.destination?.containerTarget || '');
    if (!container.ok || parsed.issueTarget !== container.issueTarget) return Object.freeze({ ok: false, error: 'publication.attestation.target-container-mismatch', target: null, parsed, notice: 'Mutation comment target belongs to a different issue than the declared comment container.' });
  }
  if (plan.mutationPolicy === 'update-known') {
    const expected = parseExactGithubIssueTarget(plan.destination?.externalTarget || '');
    if (!expected.ok || parsed.inputTarget !== expected.inputTarget || parsed.targetKind !== expected.targetKind) return Object.freeze({ ok: false, error: 'publication.attestation.target-plan-mismatch', target: null, parsed, notice: 'Mutation confirmation must bind the exact known GitHub target already qualified by the publication plan.' });
  }
  const target = exactMutationTargetProjection(parsed);
  return Object.freeze({ ok: true, target, parsed, error: '', notice: '' });
}
function exactMutationTargetProjection(parsed = {}) {
  return Object.freeze({
    provider: 'github',
    targetKind: String(parsed.targetKind || ''),
    inputTarget: String(parsed.inputTarget || ''),
    repository: String(parsed.repository || ''),
    issueNumberLexeme: String(parsed.issueNumber || ''),
    commentId: String(parsed.commentId || ''),
    issueTarget: String(parsed.issueTarget || '')
  });
}
function sameExactMutationTarget(a = null, b = null) {
  if (!a || !b) return false;
  return String(a.targetKind || '') === String(b.targetKind || '') && String(a.inputTarget || '') === String(b.inputTarget || '');
}
function qualifiedHumanMutationAttestation(planSha256 = '', exactTarget = null, value = null) {
  const current = String(planSha256 || '').trim();
  if (!current || !exactTarget || !value || typeof value !== 'object') return null;
  if (String(value.type || '') !== GITHUB_PUBLICATION_HUMAN_MUTATION_ATTESTATION) return null;
  if (String(value.planSha256 || '') !== current) return null;
  if (!sameExactMutationTarget(value.mutationTarget, exactTarget)) return null;
  const parsed = parseExactGithubIssueTarget(value.mutationTarget?.inputTarget || '');
  if (!parsed.ok || parsed.targetKind !== String(value.mutationTarget?.targetKind || '') || parsed.inputTarget !== String(value.mutationTarget?.inputTarget || '')) return null;
  const confirmedAt = String(value.confirmedAt || '').trim();
  if (!confirmedAt) return null;
  return Object.freeze({
    schema: 'tiinex.site.githubPublicationHumanMutationAttestation.v2',
    type: GITHUB_PUBLICATION_HUMAN_MUTATION_ATTESTATION,
    planSha256: current,
    mutationTarget: exactMutationTargetProjection(parsed),
    confirmedAt,
    boundary: String(value.boundary || 'Human-confirmed GitHub web mutation for the exact plan at the exact qualified target; Tiinex did not perform a hidden/API write.')
  });
}
function nowIso(clock) { return typeof clock === 'function' ? new Date(clock()).toISOString() : new Date().toISOString(); }
