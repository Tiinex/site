import assert from 'node:assert/strict';
import {
  GITHUB_ISSUE_BODY_TARGET_KIND,
  GITHUB_ISSUE_COMMENT_TARGET_KIND,
  githubIssueCommentIdFromTarget,
  parseExactGithubIssueTarget
} from './github.issueTarget.js';

const issue = 'https://github.com/Tiinex/docs/issues/1';
const comment = `${issue}#issuecomment-123`;

assert.deepEqual(
  pick(parseExactGithubIssueTarget(issue)),
  { ok: true, repository: 'Tiinex/docs', number: 1, commentId: '', targetKind: GITHUB_ISSUE_BODY_TARGET_KIND, inputTarget: issue, issueTarget: issue, normalization: 'none' }
);
assert.deepEqual(
  pick(parseExactGithubIssueTarget(comment)),
  { ok: true, repository: 'Tiinex/docs', number: 1, commentId: '123', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, inputTarget: comment, issueTarget: issue, normalization: 'none' }
);

const trailingIssue = parseExactGithubIssueTarget(`${issue}/`);
assert.equal(trailingIssue.ok, true);
assert.equal(trailingIssue.inputTarget, issue);
assert.equal(trailingIssue.normalization, 'trailing-slash');

const trailingComment = parseExactGithubIssueTarget(`${issue}/#issuecomment-123`);
assert.equal(trailingComment.ok, true);
assert.equal(trailingComment.inputTarget, comment);
assert.equal(trailingComment.normalization, 'trailing-slash');

const apiIssue = parseExactGithubIssueTarget('https://api.github.com/repos/Tiinex/docs/issues/1');
assert.equal(apiIssue.ok, true);
assert.equal(apiIssue.targetKind, GITHUB_ISSUE_BODY_TARGET_KIND);
assert.equal(apiIssue.inputTarget, issue);
assert.equal(apiIssue.normalization, 'api-issue-to-canonical-web-issue');

for (const raw of [
  'https://evil.github.com/Tiinex/docs/issues/1#issuecomment-123',
  'https://github.com.evil.example/Tiinex/docs/issues/1#issuecomment-123',
  'http://github.com/Tiinex/docs/issues/1#issuecomment-123',
  'https://github.com:443/Tiinex/docs/issues/1#issuecomment-123',
  'https://user@github.com/Tiinex/docs/issues/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1?x=issues/comments/123',
  'https://github.com/Tiinex/docs/issues/1?',
  'https://github.com/Tiinex/docs/issues/1#',
  'https://github.com/Tiinex/docs/issues/1?x=1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1/comment-123',
  'https://github.com/Tiinex/docs/issues/1/comment-123#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1/comments/123',
  'https://github.com/Tiinex/docs/issues/1#comment-123',
  'https://github.com/Tiinex/docs/issues/1#issuecomment-123-extra',
  'https://github.com/Tiinex/docs/issues/1#foo-issuecomment-123',
  'https://github.com/Tiinex/docs/issues/0',
  'https://github.com/Tiinex/docs/issues/-1',
  'https://github.com/Tiinex/docs/issues/1/extra',
  'https://github.com/Tiinex/docs/issues',
  'https://github.com/Tiinex/docs/pull/1',
  'github.com/Tiinex/docs/issues/1',
  'not-a-url',
  'https://api.github.com/repos/Tiinex/docs/issues/1/comments/123',
  'https://api.github.com/repos/Tiinex/docs/issues/1?x=1',
  'https://api.github.com/repos/Tiinex/docs/issues/1?',
  'https://api.github.com/repos/Tiinex/docs/issues/1#',
  'https://api.github.com/repos/Tiinex/docs/issues/1#issuecomment-123',
  'https://evil.api.github.com/repos/Tiinex/docs/issues/1'
]) {
  const parsed = parseExactGithubIssueTarget(raw);
  assert.equal(parsed.ok, false, `unsupported observation must fail closed: ${raw}`);
  assert.equal(githubIssueCommentIdFromTarget(raw), '', `unsupported observation must not yield comment identity: ${raw}`);
}

assert.equal(githubIssueCommentIdFromTarget(comment), '123');
assert.equal(githubIssueCommentIdFromTarget(issue), '');

console.log('github.issueTarget: PASS');

function pick(value) {
  return {
    ok: value.ok,
    repository: value.repository,
    number: value.number,
    commentId: value.commentId,
    targetKind: value.targetKind,
    inputTarget: value.inputTarget,
    issueTarget: value.issueTarget,
    normalization: value.normalization
  };
}
