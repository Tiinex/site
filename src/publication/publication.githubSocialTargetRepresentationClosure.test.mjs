import assert from 'node:assert/strict';
import { buildPublicationPlan, buildPublicationResult } from './publication.contract.js';
import {
  GITHUB_ISSUE_BODY_TARGET_KIND,
  GITHUB_ISSUE_COMMENT_TARGET_KIND
} from './publication.targetContract.js';
import { parseExactGithubIssueTarget } from '../sources/github/github.issueTarget.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-08-19T00:00:00.000Z
  - Summary: Exact GitHub social target representation closure
  - Status: draft/local

---

# Exact target representation closure

# Continuity Integrity

- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
`;
const record = { id: 'v446-draft', title: 'Draft', path: 'draft.md', markdown, schemaId: 'tiinex.topic.v1', sourceMode: 'local-transition', source: { adapterId: 'local' } };
const workspace = { id: 'w-v446', title: 'v446', records: [record], assets: [] };
const issue = 'https://github.com/Tiinex/docs/issues/1';
const comment = `${issue}#issuecomment-123`;

const createIssue = makePlan('create-new', GITHUB_ISSUE_BODY_TARGET_KIND, {});
const createComment = makePlan('create-comment', GITHUB_ISSUE_COMMENT_TARGET_KIND, { containerTarget: issue });
assert.equal(createIssue.status, 'ready');
assert.equal(createComment.status, 'ready');

const rejectedIssueObservations = [
  ` ${issue}`,
  `${issue} `,
  `\t${issue}\n`,
  'HTTPS://github.com/Tiinex/docs/issues/1',
  'https://GITHUB.COM/Tiinex/docs/issues/1',
  `${issue}?x=1`,
  `${issue}?`,
  `${issue}#`,
  `${issue}#comment-123`,
  'https://github.com/Tiinex/docs//issues/1',
  'https://github.com/Tiinex/docs/issues//1',
  'https://github.com/Tiinex/docs/issues/./1',
  'https://github.com/Tiinex/docs/issues/x/../1',
  'https://github.com/Tiinex/docs/issues/%2e/1',
  'https://github.com/Tiinex/docs/issues/x/%2e%2e/1',
  'https://github.com/Tiinex/docs/issues/1%2Fextra',
  'https://github.com/Tiinex/docs/issues/1%23issuecomment-123',
  'https://github.com/Tiinex/docs/issues/x\\..\\1',
  'https://github.com/Tiinex/docs/foo/issues/1',
  'https://github.com/Tiinex/docs/issues/1/extra'
];

for (const observation of rejectedIssueObservations) {
  assertRejectedParser(observation);
  assertRejectedResult(createIssue, observation, GITHUB_ISSUE_BODY_TARGET_KIND);
}

const rejectedCommentObservations = [
  ` ${comment}`,
  `${comment} `,
  `\t${comment}\n`,
  'HTTPS://github.com/Tiinex/docs/issues/1#issuecomment-123',
  'https://GITHUB.COM/Tiinex/docs/issues/1#issuecomment-123',
  `${issue}?x=1#issuecomment-123`,
  `${issue}?#issuecomment-123`,
  `${issue}#issuecomment-123-extra`,
  `${issue}#issuecomment-%31%32%33`,
  'https://github.com/Tiinex/docs/issues//1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/./1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/x/../1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/%2e/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1%2Fextra#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1\\#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1/comment-123'
];

for (const observation of rejectedCommentObservations) {
  assertRejectedParser(observation);
  assertRejectedResult(createComment, observation, GITHUB_ISSUE_COMMENT_TARGET_KIND);
}

// Every supported result alias must preserve raw exactness before qualification.
for (const alias of ['inputTarget', 'externalTarget', 'url']) {
  const observation = ` ${comment}`;
  const execution = verifiedExecution(createComment, GITHUB_ISSUE_COMMENT_TARGET_KIND, { [alias]: observation });
  const result = buildPublicationResult(createComment, execution);
  assert.equal(result.status, 'failure', `${alias} must not be trimmed before exact social target qualification`);
  assert.equal(result.sourceBinding, null);
  assert.ok(result.findings.some((item) => item.code === 'publication.result.social-target.invalid'));
  assert.equal(result.remoteTarget.inputTarget, observation);
}
const remoteTargetObservation = ` ${comment}`;
const remoteTargetResult = buildPublicationResult(createComment, {
  state: 'success',
  verificationStatus: 'verified',
  verifiedPayloadSha256: createComment.outboundPayload.sha256,
  remoteTarget: { adapterId: 'github', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, inputTarget: remoteTargetObservation }
});
assert.equal(remoteTargetResult.status, 'failure');
assert.equal(remoteTargetResult.sourceBinding, null);
assert.equal(remoteTargetResult.remoteTarget.inputTarget, remoteTargetObservation);
assert.ok(remoteTargetResult.findings.some((item) => item.code === 'publication.result.social-target.invalid'));

// Plan-side exact target fields remain raw and fail closed rather than becoming ready after trim/rewrite.
for (const observation of [` ${issue}`, `${issue} `, `\t${issue}\n`]) {
  const updateIssue = makePlan('update-known', GITHUB_ISSUE_BODY_TARGET_KIND, { externalTarget: observation });
  assert.equal(updateIssue.status, 'blocked');
  assert.equal(updateIssue.destination.externalTarget, observation);
  assert.ok(updateIssue.findings.some((item) => item.code === 'publication.plan.destination.issue-target.invalid'));

  const createCommentBadContainer = makePlan('create-comment', GITHUB_ISSUE_COMMENT_TARGET_KIND, { containerTarget: observation });
  assert.equal(createCommentBadContainer.status, 'blocked');
  assert.equal(createCommentBadContainer.destination.containerTarget, observation);
  assert.ok(createCommentBadContainer.findings.some((item) => item.code === 'publication.plan.destination.container-target.invalid'));
}

for (const observation of [` ${comment}`, `${comment} `, `\t${comment}\n`]) {
  const updateComment = makePlan('update-known', GITHUB_ISSUE_COMMENT_TARGET_KIND, { externalTarget: observation });
  assert.equal(updateComment.status, 'blocked');
  assert.equal(updateComment.destination.externalTarget, observation);
  assert.ok(updateComment.findings.some((item) => item.code === 'publication.plan.destination.comment-target.invalid'));
}

// Plan-side fallback aliases must preserve the same raw evidence before exact qualification.
for (const alias of ['inputTarget', 'url']) {
  const observation = ` ${issue}`;
  const updateIssueAlias = makePlan('update-known', GITHUB_ISSUE_BODY_TARGET_KIND, { [alias]: observation });
  assert.equal(updateIssueAlias.status, 'blocked');
  assert.equal(updateIssueAlias.destination.externalTarget, observation);
  assert.ok(updateIssueAlias.findings.some((item) => item.code === 'publication.plan.destination.issue-target.invalid'));
}
for (const alias of ['parentTarget', 'issueTarget']) {
  const observation = ` ${issue}`;
  const createCommentAlias = makePlan('create-comment', GITHUB_ISSUE_COMMENT_TARGET_KIND, { [alias]: observation });
  assert.equal(createCommentAlias.status, 'blocked');
  assert.equal(createCommentAlias.destination.containerTarget, observation);
  assert.ok(createCommentAlias.findings.some((item) => item.code === 'publication.plan.destination.container-target.invalid'));
}

// Decimal identity policy: safe integer lexemes are accepted without identity rewrite.
for (const issueNumber of ['1', '123456', String(Number.MAX_SAFE_INTEGER)]) {
  const raw = `https://github.com/Tiinex/docs/issues/${issueNumber}`;
  const parsed = parseExactGithubIssueTarget(raw);
  assert.equal(parsed.ok, true, `safe issue number must qualify: ${issueNumber}`);
  assert.equal(parsed.issueNumber, issueNumber);
  assert.equal(String(parsed.number), issueNumber);
  assert.equal(parsed.inputTarget, raw);
  assert.equal(parsed.issueTarget, raw);

  const result = buildPublicationResult(createIssue, verifiedExecution(createIssue, GITHUB_ISSUE_BODY_TARGET_KIND, { inputTarget: raw }));
  assert.equal(result.status, 'success');
  assert.ok(result.sourceBinding);
  assert.equal(result.remoteTarget.inputTarget, raw);
  assert.equal(result.remoteTarget.issueNumber, Number(issueNumber));
  assert.equal(result.remoteTarget.issueNumberLexeme, issueNumber);
}

const unsafeIssueNumbers = [
  String(Number.MAX_SAFE_INTEGER + 1),
  '9007199254740993',
  '999999999999999999999999999999999999999'
];
for (const issueNumber of unsafeIssueNumbers) {
  const raw = `https://github.com/Tiinex/docs/issues/${issueNumber}`;
  assertRejectedParser(raw);
  assertRejectedResult(createIssue, raw, GITHUB_ISSUE_BODY_TARGET_KIND);

  const updateIssue = makePlan('update-known', GITHUB_ISSUE_BODY_TARGET_KIND, { externalTarget: raw });
  assert.equal(updateIssue.status, 'blocked');
  assert.equal(updateIssue.destination.externalTarget, raw);
  assert.ok(updateIssue.findings.some((item) => item.code === 'publication.plan.destination.issue-target.invalid'));
}

// Positive regression: explicit allowlist and shared publication comparisons.
for (const [raw, expectedTarget, normalization] of [
  [issue, issue, 'none'],
  [`${issue}/`, issue, 'trailing-slash'],
  ['https://api.github.com/repos/Tiinex/docs/issues/1', issue, 'api-issue-to-canonical-web-issue'],
  ['https://api.github.com/repos/Tiinex/docs/issues/1/', issue, 'api-trailing-slash-to-canonical-web-issue']
]) {
  const parsed = parseExactGithubIssueTarget(raw);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.inputTarget, expectedTarget);
  assert.equal(parsed.normalization, normalization);
}
for (const [raw, expectedTarget] of [
  [comment, comment],
  [`${issue}/#issuecomment-123`, comment]
]) {
  const parsed = parseExactGithubIssueTarget(raw);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.inputTarget, expectedTarget);
}

const createIssueSuccess = buildPublicationResult(createIssue, verifiedExecution(createIssue, GITHUB_ISSUE_BODY_TARGET_KIND, { inputTarget: issue }));
assert.equal(createIssueSuccess.status, 'success');
assert.ok(createIssueSuccess.sourceBinding);

const createCommentSuccess = buildPublicationResult(createComment, verifiedExecution(createComment, GITHUB_ISSUE_COMMENT_TARGET_KIND, { inputTarget: comment }));
assert.equal(createCommentSuccess.status, 'success');
assert.ok(createCommentSuccess.sourceBinding);
assert.equal(createCommentSuccess.remoteTarget.containerTarget, issue);

const updateIssue = makePlan('update-known', GITHUB_ISSUE_BODY_TARGET_KIND, { externalTarget: issue });
assert.equal(updateIssue.status, 'ready');
assert.equal(buildPublicationResult(updateIssue, verifiedExecution(updateIssue, GITHUB_ISSUE_BODY_TARGET_KIND, { inputTarget: issue })).status, 'success');

const updateComment = makePlan('update-known', GITHUB_ISSUE_COMMENT_TARGET_KIND, { externalTarget: comment });
assert.equal(updateComment.status, 'ready');
assert.equal(buildPublicationResult(updateComment, verifiedExecution(updateComment, GITHUB_ISSUE_COMMENT_TARGET_KIND, { inputTarget: comment })).status, 'success');

const repoMismatch = buildPublicationResult(createIssue, verifiedExecution(createIssue, GITHUB_ISSUE_BODY_TARGET_KIND, { inputTarget: 'https://github.com/OpenAI/docs/issues/1' }));
assert.equal(repoMismatch.status, 'failure');
assert.equal(repoMismatch.sourceBinding, null);
assert.ok(repoMismatch.findings.some((item) => item.code === 'publication.result.target.repo-mismatch'));

const kindMismatch = buildPublicationResult(createIssue, verifiedExecution(createIssue, GITHUB_ISSUE_COMMENT_TARGET_KIND, { inputTarget: comment }));
assert.equal(kindMismatch.status, 'failure');
assert.equal(kindMismatch.sourceBinding, null);
assert.ok(kindMismatch.findings.some((item) => item.code === 'publication.result.target.kind-mismatch' || item.code === 'publication.result.social-target.kind-mismatch'));

const containerMismatch = buildPublicationResult(createComment, verifiedExecution(createComment, GITHUB_ISSUE_COMMENT_TARGET_KIND, { inputTarget: 'https://github.com/Tiinex/docs/issues/2#issuecomment-123' }));
assert.equal(containerMismatch.status, 'failure');
assert.equal(containerMismatch.sourceBinding, null);
assert.ok(containerMismatch.findings.some((item) => item.code === 'publication.result.social-target.container-mismatch'));

const payloadMismatch = buildPublicationResult(createIssue, {
  ...verifiedExecution(createIssue, GITHUB_ISSUE_BODY_TARGET_KIND, { inputTarget: issue }),
  verifiedPayloadSha256: '0'.repeat(64)
});
assert.equal(payloadMismatch.status, 'failure');
assert.equal(payloadMismatch.sourceBinding, null);
assert.ok(payloadMismatch.findings.some((item) => item.code === 'publication.result.payload-verification.mismatch'));

const unverified = buildPublicationResult(createIssue, {
  state: 'success',
  verificationStatus: 'not-run',
  sourceTarget: { adapterId: 'github', inputTarget: issue, targetKind: GITHUB_ISSUE_BODY_TARGET_KIND }
});
assert.notEqual(unverified.status, 'success');
assert.equal(unverified.sourceBinding, null);

console.log('publication.githubSocialTargetRepresentationClosure: PASS');

function makePlan(mutationPolicy, targetKind, destinationExtra) {
  return buildPublicationPlan(workspace, {
    recordId: record.id,
    mutationPolicy,
    destination: {
      provider: 'github',
      repository: 'Tiinex/docs',
      targetKind,
      ...destinationExtra
    }
  });
}

function verifiedExecution(plan, targetKind, targetFields) {
  return {
    state: 'success',
    verificationStatus: 'verified',
    verifiedPayloadSha256: plan.outboundPayload.sha256,
    sourceTarget: { adapterId: 'github', targetKind, ...targetFields }
  };
}

function assertRejectedParser(observation) {
  const parsed = parseExactGithubIssueTarget(observation);
  assert.equal(parsed.ok, false, `unsupported exact observation must fail parser: ${JSON.stringify(observation)}`);
  assert.equal(parsed.inputTarget, undefined);
}

function assertRejectedResult(plan, observation, targetKind) {
  const result = buildPublicationResult(plan, verifiedExecution(plan, targetKind, { inputTarget: observation }));
  assert.equal(result.status, 'failure', `unsupported exact observation must fail publication result: ${JSON.stringify(observation)}`);
  assert.equal(result.sourceBinding, null);
  assert.ok(result.findings.some((item) => item.code === 'publication.result.social-target.invalid'));
  assert.equal(result.remoteTarget.inputTarget, observation, 'failure evidence must preserve the exact supplied unsupported observation');
}
