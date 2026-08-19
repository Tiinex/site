export const GITHUB_ISSUE_BODY_TARGET_KIND = 'github.issue.body';
export const GITHUB_ISSUE_COMMENT_TARGET_KIND = 'github.issue.comment';

const SAFE_PATH_SEGMENT = /^[A-Za-z0-9_.-]+$/;
const WEB_ISSUE_LEXICAL = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/issues\/([1-9]\d*)(\/)?(?:#issuecomment-(\d+))?$/;
const API_ISSUE_LEXICAL = /^https:\/\/api\.github\.com\/repos\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/issues\/([1-9]\d*)(\/)?$/;

export function parseExactGithubIssueTarget(value = '') {
  const raw = String(value || '');
  if (!raw) return failure(raw, 'missing-github-issue-target');

  const web = raw.match(WEB_ISSUE_LEXICAL);
  if (web) return parseExactWebIssueTarget(raw, web);

  const api = raw.match(API_ISSUE_LEXICAL);
  if (api) return parseExactApiIssueTarget(raw, api);

  return failure(raw, 'unsupported-github-issue-target');
}

export function githubIssueCommentIdFromTarget(value = '') {
  const parsed = parseExactGithubIssueTarget(value);
  return parsed.ok && parsed.targetKind === GITHUB_ISSUE_COMMENT_TARGET_KIND ? String(parsed.commentId || '') : '';
}

export function sameGithubRepository(a = '', b = '') {
  const left = normalizeRepository(a);
  const right = normalizeRepository(b);
  return Boolean(left && right && left === right);
}

export function normalizeGithubRepository(value = '') {
  return normalizeRepository(value);
}

function parseExactWebIssueTarget(raw, match) {
  const owner = match[1];
  const repo = match[2];
  const issueNumber = match[3];
  const trailingSlash = Boolean(match[4]);
  const commentId = match[5] || '';
  if (!validRepositoryParts(owner, repo) || !validIssueNumber(issueNumber)) return failure(raw, 'unsupported-github-issue-target');

  const number = Number(issueNumber);
  const issueTarget = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
  return success({
    raw,
    repository: `${owner}/${repo}`,
    owner,
    repo,
    number,
    issueNumber,
    commentId,
    targetKind: commentId ? GITHUB_ISSUE_COMMENT_TARGET_KIND : GITHUB_ISSUE_BODY_TARGET_KIND,
    inputTarget: commentId ? `${issueTarget}#issuecomment-${commentId}` : issueTarget,
    issueTarget,
    normalization: trailingSlash ? 'trailing-slash' : 'none'
  });
}

function parseExactApiIssueTarget(raw, match) {
  const owner = match[1];
  const repo = match[2];
  const issueNumber = match[3];
  const trailingSlash = Boolean(match[4]);
  if (!validRepositoryParts(owner, repo) || !validIssueNumber(issueNumber)) return failure(raw, 'unsupported-github-issue-target');

  const number = Number(issueNumber);
  const issueTarget = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
  return success({
    raw,
    repository: `${owner}/${repo}`,
    owner,
    repo,
    number,
    issueNumber,
    commentId: '',
    targetKind: GITHUB_ISSUE_BODY_TARGET_KIND,
    inputTarget: issueTarget,
    issueTarget,
    normalization: trailingSlash ? 'api-trailing-slash-to-canonical-web-issue' : 'api-issue-to-canonical-web-issue'
  });
}

function validRepositoryParts(owner, repo) {
  return Boolean(
    owner && repo
    && owner !== '.' && owner !== '..'
    && repo !== '.' && repo !== '..'
    && SAFE_PATH_SEGMENT.test(owner)
    && SAFE_PATH_SEGMENT.test(repo)
  );
}

function validIssueNumber(value = '') {
  const lexical = String(value || '');
  if (!/^[1-9]\d*$/.test(lexical)) return false;
  const numeric = Number(lexical);
  return Number.isSafeInteger(numeric) && String(numeric) === lexical;
}

function success(value = {}) {
  return Object.freeze({
    ok: true,
    provider: 'github',
    repository: value.repository,
    owner: value.owner,
    repo: value.repo,
    number: value.number,
    issueNumber: value.issueNumber,
    commentId: value.commentId,
    targetKind: value.targetKind,
    inputTarget: value.inputTarget,
    issueTarget: value.issueTarget,
    mutable: true,
    normalization: value.normalization || 'none'
  });
}

function failure(input, error) {
  return Object.freeze({ ok: false, input, error });
}

function normalizeRepository(value = '') {
  const parts = String(value || '').trim().toLowerCase().split('/').filter(Boolean);
  return parts.length === 2 ? `${parts[0]}/${parts[1]}` : '';
}
