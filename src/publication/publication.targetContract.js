import {
  GITHUB_ISSUE_BODY_TARGET_KIND,
  GITHUB_ISSUE_COMMENT_TARGET_KIND,
  normalizeGithubRepository,
  parseExactGithubIssueTarget,
  sameGithubRepository
} from '../sources/github/github.issueTarget.js';

export const GITHUB_REPO_FILE_TARGET_KIND = 'github.repo.file';
export { GITHUB_ISSUE_BODY_TARGET_KIND, GITHUB_ISSUE_COMMENT_TARGET_KIND };

const REPO_FILE_ALIASES = new Set([GITHUB_REPO_FILE_TARGET_KIND, 'github-repo-file']);
const ISSUE_BODY_ALIASES = new Set([GITHUB_ISSUE_BODY_TARGET_KIND, 'github-issue-body']);
const ISSUE_COMMENT_ALIASES = new Set([GITHUB_ISSUE_COMMENT_TARGET_KIND, 'github-issue-comment']);

export function normalizePublicationDestination(value = {}) {
  const provider = String(value.provider || value.adapterId || '').trim().toLowerCase();
  const targetKind = canonicalTargetKind(value.targetKind || value.surface || '');
  const exactSocialTarget = provider === 'github' && [GITHUB_ISSUE_BODY_TARGET_KIND, GITHUB_ISSUE_COMMENT_TARGET_KIND].includes(targetKind);
  const externalTarget = rawTargetAlias(value, ['externalTarget', 'inputTarget', 'url']);
  const containerTarget = rawTargetAlias(value, ['containerTarget', 'parentTarget', 'issueTarget']);
  return deepFreeze({
    provider,
    repository: String(value.repository || value.repo || '').trim(),
    ref: String(value.ref || value.branch || '').trim(),
    path: String(value.path || '').trim().replace(/^\/+/, ''),
    externalTarget: exactSocialTarget ? externalTarget : externalTarget.trim(),
    containerTarget: exactSocialTarget ? containerTarget : containerTarget.trim(),
    targetKind,
    declaredTargetKind: String(value.targetKind || value.surface || '').trim()
  });
}

export function publicationDestinationFindings(destination = {}, mutationPolicy = '') {
  const findings = [];
  if (!destination.provider) findings.push(finding('error', 'publication.plan.destination.provider-missing', 'Publication destination requires explicit provider identity.'));
  if (destination.provider !== 'github') {
    if (!destination.externalTarget && !destination.path) findings.push(finding('error', 'publication.plan.destination.target-missing', 'Publication destination requires an exact provider target/path.'));
    return findings;
  }

  if (!destination.repository) findings.push(finding('error', 'publication.plan.destination.repo-missing', 'GitHub publication destination requires exact repository.'));
  if (!destination.targetKind) {
    findings.push(finding('error', 'publication.plan.destination.target-kind-missing', 'GitHub publication destination requires one exact target kind.'));
    return findings;
  }

  if (destination.targetKind === GITHUB_REPO_FILE_TARGET_KIND) {
    if (!destination.ref) findings.push(finding('error', 'publication.plan.destination.ref-missing', 'GitHub repo-file publication requires explicit destination ref/branch.'));
    if (!destination.path) findings.push(finding('error', 'publication.plan.destination.path-missing', 'GitHub repo-file publication requires exact repo-relative target path.'));
    return findings;
  }

  if (destination.targetKind === GITHUB_ISSUE_BODY_TARGET_KIND) {
    if (!['create-new', 'update-known'].includes(mutationPolicy)) findings.push(finding('error', 'publication.plan.mutation-policy.unsupported-for-target', 'GitHub issue-body publication requires create-new or update-known mutation policy.'));
    if (mutationPolicy === 'update-known' && !destination.externalTarget) findings.push(finding('error', 'publication.plan.destination.issue-target-missing', 'Updating a known GitHub issue body requires its exact issue URL in the plan.'));
    if (destination.externalTarget) findings.push(...validateSocialTarget(destination.externalTarget, destination, GITHUB_ISSUE_BODY_TARGET_KIND, 'issue-target'));
    return findings;
  }

  if (destination.targetKind === GITHUB_ISSUE_COMMENT_TARGET_KIND) {
    if (!['create-comment', 'update-known'].includes(mutationPolicy)) findings.push(finding('error', 'publication.plan.mutation-policy.unsupported-for-target', 'GitHub issue-comment publication requires create-comment or update-known mutation policy.'));
    if (mutationPolicy === 'create-comment' && !destination.containerTarget) findings.push(finding('error', 'publication.plan.destination.container-target-missing', 'Creating a GitHub issue comment requires the exact parent issue URL.'));
    if (mutationPolicy === 'update-known' && !destination.externalTarget) findings.push(finding('error', 'publication.plan.destination.comment-target-missing', 'Updating a known GitHub issue comment requires its exact comment permalink.'));
    if (destination.containerTarget) findings.push(...validateSocialTarget(destination.containerTarget, destination, GITHUB_ISSUE_BODY_TARGET_KIND, 'container-target'));
    if (destination.externalTarget) findings.push(...validateSocialTarget(destination.externalTarget, destination, GITHUB_ISSUE_COMMENT_TARGET_KIND, 'comment-target'));
    const container = parseExactGithubIssueTarget(destination.containerTarget);
    const exactComment = parseExactGithubIssueTarget(destination.externalTarget);
    if (container.ok && exactComment.ok && !sameIssueContainer(exactComment, container)) findings.push(finding('error', 'publication.plan.destination.comment-container-mismatch', 'GitHub comment target belongs to a different issue than the declared publication container.'));
    return findings;
  }

  findings.push(finding('error', 'publication.plan.destination.target-kind-unsupported', 'GitHub publication target kind is not supported by the shared contract.', { targetKind: destination.declaredTargetKind || destination.targetKind }));
  return findings;
}

export function projectExecutedPublicationTarget(plan = {}, execution = {}) {
  const supplied = execution.sourceTarget || execution.remoteTarget || {};
  const destination = plan.destination || {};
  const plannedTargetKind = canonicalTargetKind(destination.targetKind || '');
  const suppliedTargetKind = canonicalTargetKind(supplied.targetKind || '');
  let projection;
  if (destination.provider === 'github' && plannedTargetKind === GITHUB_REPO_FILE_TARGET_KIND) projection = projectRepoFileTarget(plan, execution, supplied);
  else if (destination.provider === 'github' && (plannedTargetKind === GITHUB_ISSUE_BODY_TARGET_KIND || plannedTargetKind === GITHUB_ISSUE_COMMENT_TARGET_KIND)) projection = projectGithubSocialTarget(plan, execution, supplied, plannedTargetKind);
  else projection = projectGenericTarget(plan, execution, supplied, plannedTargetKind);
  const findings = [...(projection.findings || [])];
  if (suppliedTargetKind && suppliedTargetKind !== plannedTargetKind) findings.push(finding('error', 'publication.result.target.kind-mismatch', 'Supplied publication result target kind differs from the planned target kind.'));
  const suppliedAdapter = String(supplied.adapterId || supplied.provider || '').trim().toLowerCase();
  if (suppliedAdapter && destination.provider && suppliedAdapter !== destination.provider) findings.push(finding('error', 'publication.result.target.provider-mismatch', 'Supplied publication result provider differs from the planned destination provider.'));
  return deepFreeze({ target: projection.target, findings, qualified: !hasErrors(findings) && publicationTargetQualified(projection.target) });
}

export function publicationTargetQualified(target = {}) {
  if (!target?.adapterId) return false;
  if (target.adapterId === 'github' && target.targetKind === GITHUB_REPO_FILE_TARGET_KIND) return Boolean(target.repo && target.path && target.materializedCommit && target.immutability === 'immutable-materialized-commit');
  if (target.adapterId === 'github' && [GITHUB_ISSUE_BODY_TARGET_KIND, GITHUB_ISSUE_COMMENT_TARGET_KIND].includes(target.targetKind)) return Boolean(target.repo && target.inputTarget && target.mutability === 'mutable-remote-representation' && target.exactTarget === true);
  return Boolean(target.inputTarget || target.path);
}

function projectRepoFileTarget(plan, execution, supplied) {
  const destination = plan.destination || {};
  const findings = [];
  const repo = String(supplied.repo || supplied.repository || destination.repository || '').trim();
  const path = String(supplied.path || destination.path || '').trim().replace(/^\/+/, '');
  const materializedCommit = exactCommit(supplied.materializedCommit || supplied.commit || execution.materializedCommit || '');
  if (!sameGithubRepository(repo, destination.repository)) findings.push(finding('error', 'publication.result.target.repo-mismatch', 'Verified GitHub repo-file target repository differs from the planned destination.'));
  if (!path || path !== String(destination.path || '').trim().replace(/^\/+/, '')) findings.push(finding('error', 'publication.result.target.path-mismatch', 'Verified GitHub repo-file target path differs from the planned destination path.'));
  if (!materializedCommit) findings.push(finding('error', 'publication.result.target.commit-missing', 'Verified GitHub repo-file publication requires one exact 40-character materialized commit.'));
  const target = deepFreeze({
    schema: 'tiinex.publication.remote-target.v2',
    adapterId: 'github',
    repo,
    configuredRef: String(destination.ref || supplied.configuredRef || supplied.ref || '').trim(),
    materializedCommit,
    path,
    inputTarget: String(supplied.inputTarget || '').trim(),
    targetKind: GITHUB_REPO_FILE_TARGET_KIND,
    exactTarget: Boolean(repo && path && materializedCommit),
    immutability: materializedCommit ? 'immutable-materialized-commit' : 'degraded',
    mutability: 'immutable-materialized-representation',
    issueNumber: null,
    commentId: '',
    containerTarget: '',
    providerReceiptId: String(execution.providerReceiptId || supplied.providerReceiptId || '')
  });
  return deepFreeze({ target, findings, qualified: !hasErrors(findings) && publicationTargetQualified(target) });
}

function projectGithubSocialTarget(plan, execution, supplied, targetKind) {
  const destination = plan.destination || {};
  const findings = [];
  const inputTarget = rawTargetAlias(supplied, ['inputTarget', 'externalTarget', 'url']);
  const parsed = parseExactGithubIssueTarget(inputTarget);
  if (!parsed.ok) findings.push(finding('error', 'publication.result.social-target.invalid', 'Verified GitHub social publication requires one exact GitHub issue/comment target URL.'));
  else {
    if (parsed.targetKind !== targetKind) findings.push(finding('error', 'publication.result.social-target.kind-mismatch', 'Verified GitHub social target surface differs from the planned target kind.'));
    if (!sameGithubRepository(parsed.repository, destination.repository)) findings.push(finding('error', 'publication.result.target.repo-mismatch', 'Verified GitHub social target repository differs from the planned destination.'));
    if (targetKind === GITHUB_ISSUE_BODY_TARGET_KIND && destination.externalTarget && plan.mutationPolicy === 'update-known' && !sameExactSocialTarget(parsed, parseExactGithubIssueTarget(destination.externalTarget))) findings.push(finding('error', 'publication.result.social-target.planned-target-mismatch', 'Verified issue target differs from the exact known issue target in the plan.'));
    if (targetKind === GITHUB_ISSUE_COMMENT_TARGET_KIND) {
      const container = parseExactGithubIssueTarget(destination.containerTarget);
      if (container.ok && parsed.ok && !sameIssueContainer(parsed, container)) findings.push(finding('error', 'publication.result.social-target.container-mismatch', 'Verified comment target belongs to a different issue than the declared publication container.'));
      if (destination.externalTarget && plan.mutationPolicy === 'update-known' && !sameExactSocialTarget(parsed, parseExactGithubIssueTarget(destination.externalTarget))) findings.push(finding('error', 'publication.result.social-target.planned-target-mismatch', 'Verified comment target differs from the exact known comment target in the plan.'));
    }
  }
  const target = deepFreeze({
    schema: 'tiinex.publication.remote-target.v2',
    adapterId: 'github',
    repo: parsed.ok ? parsed.repository : String(supplied.repo || supplied.repository || destination.repository || '').trim(),
    configuredRef: '',
    materializedCommit: '',
    path: '',
    inputTarget: parsed.ok ? parsed.inputTarget : inputTarget,
    targetKind,
    exactTarget: Boolean(parsed.ok && parsed.targetKind === targetKind),
    immutability: 'mutable-exact-target',
    mutability: 'mutable-remote-representation',
    issueNumber: parsed.ok ? parsed.number : null,
    issueNumberLexeme: parsed.ok ? parsed.issueNumber : '',
    commentId: parsed.ok ? String(parsed.commentId || '') : '',
    containerTarget: parsed.ok ? parsed.issueTarget : String(destination.containerTarget || ''),
    providerReceiptId: String(execution.providerReceiptId || supplied.providerReceiptId || '')
  });
  return deepFreeze({ target, findings, qualified: !hasErrors(findings) && publicationTargetQualified(target) });
}

function projectGenericTarget(plan, execution, supplied, targetKind) {
  const destination = plan.destination || {};
  const target = deepFreeze({
    schema: 'tiinex.publication.remote-target.v2',
    adapterId: String(supplied.adapterId || destination.provider || '').trim(),
    repo: String(supplied.repo || supplied.repository || destination.repository || '').trim(),
    configuredRef: String(destination.ref || supplied.configuredRef || supplied.ref || '').trim(),
    materializedCommit: '',
    path: String(supplied.path || destination.path || '').trim().replace(/^\/+/, ''),
    inputTarget: String(supplied.inputTarget || supplied.externalTarget || destination.externalTarget || '').trim(),
    targetKind,
    exactTarget: Boolean(supplied.inputTarget || supplied.externalTarget || supplied.path || destination.externalTarget || destination.path),
    immutability: 'not-claimed',
    mutability: 'provider-defined',
    issueNumber: null,
    commentId: '',
    containerTarget: '',
    providerReceiptId: String(execution.providerReceiptId || supplied.providerReceiptId || '')
  });
  const findings = [];
  if (!publicationTargetQualified(target)) findings.push(finding('error', 'publication.result.verified-target.incomplete', 'Verification claims success but exact source target identity is incomplete.'));
  return deepFreeze({ target, findings, qualified: !hasErrors(findings) && publicationTargetQualified(target) });
}

function validateSocialTarget(raw, destination, expectedKind, field) {
  const parsed = parseExactGithubIssueTarget(raw);
  if (!parsed.ok) return [finding('error', `publication.plan.destination.${field}.invalid`, 'GitHub social publication target must be one exact supported issue/comment URL.')];
  const findings = [];
  if (parsed.targetKind !== expectedKind) findings.push(finding('error', `publication.plan.destination.${field}.kind-mismatch`, 'GitHub social target URL does not match the declared target kind.'));
  if (destination.repository && !sameGithubRepository(parsed.repository, destination.repository)) findings.push(finding('error', `publication.plan.destination.${field}.repo-mismatch`, 'GitHub social target belongs to a different repository than the declared destination.'));
  return findings;
}


function rawTargetAlias(value = {}, keys = []) {
  for (const key of keys) {
    const candidate = value?.[key];
    if (candidate !== undefined && candidate !== null && String(candidate) !== '') return String(candidate);
  }
  return '';
}

function canonicalTargetKind(value = '') {
  const clean = String(value || '').trim().toLowerCase();
  if (REPO_FILE_ALIASES.has(clean)) return GITHUB_REPO_FILE_TARGET_KIND;
  if (ISSUE_BODY_ALIASES.has(clean)) return GITHUB_ISSUE_BODY_TARGET_KIND;
  if (ISSUE_COMMENT_ALIASES.has(clean)) return GITHUB_ISSUE_COMMENT_TARGET_KIND;
  return clean;
}

function sameIssueContainer(a = {}, b = {}) {
  return Boolean(a?.ok && b?.ok && sameGithubRepository(a.repository, b.repository) && exactIssueIdentity(a) === exactIssueIdentity(b));
}

function exactIssueIdentity(value = {}) {
  return String(value.issueNumber || value.number || '');
}

function sameExactSocialTarget(a = {}, b = {}) {
  if (!sameIssueContainer(a, b) || a.targetKind !== b.targetKind) return false;
  if (a.targetKind === GITHUB_ISSUE_COMMENT_TARGET_KIND) return String(a.commentId || '') === String(b.commentId || '');
  return true;
}

function exactCommit(value = '') {
  const text = String(value || '').trim();
  return /^[0-9a-f]{40}$/i.test(text) ? text.toLowerCase() : '';
}
function hasErrors(findings = []) { return findings.some((item) => item.severity === 'error'); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
