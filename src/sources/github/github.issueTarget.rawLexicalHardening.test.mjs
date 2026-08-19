import assert from 'node:assert/strict';
import {
  GITHUB_ISSUE_BODY_TARGET_KIND,
  GITHUB_ISSUE_COMMENT_TARGET_KIND,
  parseExactGithubIssueTarget
} from './github.issueTarget.js';

const issue = 'https://github.com/Tiinex/docs/issues/1';
const comment = `${issue}#issuecomment-123`;

const positives = [
  [issue, GITHUB_ISSUE_BODY_TARGET_KIND, issue, 'none'],
  [`${issue}/`, GITHUB_ISSUE_BODY_TARGET_KIND, issue, 'trailing-slash'],
  [comment, GITHUB_ISSUE_COMMENT_TARGET_KIND, comment, 'none'],
  [`${issue}/#issuecomment-123`, GITHUB_ISSUE_COMMENT_TARGET_KIND, comment, 'trailing-slash'],
  ['https://api.github.com/repos/Tiinex/docs/issues/1', GITHUB_ISSUE_BODY_TARGET_KIND, issue, 'api-issue-to-canonical-web-issue'],
  ['https://api.github.com/repos/Tiinex/docs/issues/1/', GITHUB_ISSUE_BODY_TARGET_KIND, issue, 'api-trailing-slash-to-canonical-web-issue']
];

for (const [raw, kind, inputTarget, normalization] of positives) {
  const parsed = parseExactGithubIssueTarget(raw);
  assert.equal(parsed.ok, true, `supported raw observation should qualify: ${raw}`);
  assert.equal(parsed.targetKind, kind);
  assert.equal(parsed.inputTarget, inputTarget);
  assert.equal(parsed.normalization, normalization);
}

const hostileWeb = [
  'https://github.com/Tiinex/docs/issues/x/../1',
  'https://github.com/Tiinex/docs/issues/2/../1',
  'https://github.com/Tiinex/docs/foo/../issues/1',
  'https://github.com/Tiinex/docs/issues/./1',
  'https://github.com/Tiinex/docs/issues/1/.',
  'https://github.com/Tiinex/docs/issues/%2e/1',
  'https://github.com/Tiinex/docs/issues/%2E%2E/issues/1',
  'https://github.com/Tiinex/docs/issues/x/%2e%2e/1',
  'https://github.com/Tiinex/docs/issues/x\\..\\1',
  'https://github.com/Tiinex/docs/foo\\..\\issues/1',
  'https://github.com/Tiinex/docs/issues/1\\',
  'https://github.com/Tiinex/docs//issues/1',
  'https://github.com/Tiinex//docs/issues/1',
  'https://github.com/Tiinex/docs/issues//1',
  'https://github.com/Tiinex/docs/issues/1//',
  'https://github.com/Tiinex/docs/issues/%31',
  'https://github.com/Tiinex/docs/issues/1%2fextra',
  'https://github.com/Tiinex/docs/issues/1%23issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1?x=1',
  'https://github.com/Tiinex/docs/issues/1#issuecomment-%31%32%33',
  'HTTPS://github.com/Tiinex/docs/issues/1',
  'https://GITHUB.COM/Tiinex/docs/issues/1',
  ` ${issue}`,
  `${issue} `
];

const hostileComments = hostileWeb.map((raw) => `${raw}#issuecomment-123`).concat([
  'https://github.com/Tiinex/docs/issues/x/../1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/./1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1/.#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/%2e/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/x/%2e%2e/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/x\\..\\1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1\\#issuecomment-123'
]);

const hostileApi = [
  'https://api.github.com/repos/Tiinex/docs/foo/../issues/1',
  'https://api.github.com/repos/Tiinex/docs/issues/./1',
  'https://api.github.com/repos/Tiinex/docs/issues/1/.',
  'https://api.github.com/repos/Tiinex/docs/issues/%2e/1',
  'https://api.github.com/repos/Tiinex/docs/issues/x/%2e%2e/1',
  'https://api.github.com/repos/Tiinex/docs/issues/x\\..\\1',
  'https://api.github.com/repos/Tiinex/docs/issues/1\\',
  'https://api.github.com/repos/Tiinex/docs//issues/1',
  'https://api.github.com/repos/Tiinex//docs/issues/1',
  'https://api.github.com/repos/Tiinex/docs/issues/1?x=1',
  'https://api.github.com/repos/Tiinex/docs/issues/1#issuecomment-123',
  'HTTPS://api.github.com/repos/Tiinex/docs/issues/1',
  'https://API.GITHUB.COM/repos/Tiinex/docs/issues/1'
];

for (const raw of [...hostileWeb, ...hostileComments, ...hostileApi]) {
  const parsed = parseExactGithubIssueTarget(raw);
  assert.equal(parsed.ok, false, `unsupported raw lexical observation must fail closed before structural rewrite: ${raw}`);
  assert.equal(parsed.inputTarget, undefined, 'failure must not manufacture canonical inputTarget');
}

console.log('github.issueTarget.rawLexicalHardening: PASS');
