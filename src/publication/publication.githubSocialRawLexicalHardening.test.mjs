import assert from 'node:assert/strict';
import { buildPublicationPlan, buildPublicationResult } from './publication.contract.js';
import { GITHUB_ISSUE_BODY_TARGET_KIND, GITHUB_ISSUE_COMMENT_TARGET_KIND } from './publication.targetContract.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-08-19T00:00:00.000Z
  - Summary: Publication lexical hardening
  - Status: draft/local

---

# Publication lexical hardening

# Continuity Integrity

- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
`;
const record = { id: 'raw-lexical-draft', title: 'Draft', path: 'draft.md', markdown, schemaId: 'tiinex.topic.v1', sourceMode: 'local-transition', source: { adapterId: 'local' } };
const workspace = { id: 'w-raw-lexical', title: 'Raw lexical publication', records: [record], assets: [] };
const issue = 'https://github.com/Tiinex/docs/issues/1';
const comment = `${issue}#issuecomment-123`;

const createComment = buildPublicationPlan(workspace, {
  recordId: record.id,
  mutationPolicy: 'create-comment',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, containerTarget: issue }
});
assert.equal(createComment.status, 'ready');

const createIssue = buildPublicationPlan(workspace, {
  recordId: record.id,
  mutationPolicy: 'create-new',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_BODY_TARGET_KIND }
});
assert.equal(createIssue.status, 'ready');

const hostileComments = [
  'https://github.com/Tiinex/docs/issues/x/../1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/2/../1#issuecomment-123',
  'https://github.com/Tiinex/docs/foo/../issues/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/./1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1/.#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/%2e/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/%2E%2E/issues/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/x/%2e%2e/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/x\\..\\1#issuecomment-123',
  'https://github.com/Tiinex/docs/foo\\..\\issues/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1\\#issuecomment-123'
];

for (const observation of hostileComments) {
  const result = verifiedResult(createComment, observation, GITHUB_ISSUE_COMMENT_TARGET_KIND);
  assert.equal(result.status, 'failure', `unsupported comment observation must not qualify: ${observation}`);
  assert.equal(result.sourceBinding, null);
  assert.ok(result.findings.some((finding) => finding.code === 'publication.result.social-target.invalid'));
  assert.equal(result.remoteTarget.inputTarget, observation, 'failure evidence must preserve the supplied unsupported observation');
  assert.notEqual(result.remoteTarget.inputTarget, comment, 'failure must not manufacture the nominal canonical comment permalink');
}

const hostileIssues = [
  'https://github.com/Tiinex/docs/issues/x/../1',
  'https://github.com/Tiinex/docs/issues/./1',
  'https://github.com/Tiinex/docs/issues/1/.',
  'https://github.com/Tiinex/docs/issues/%2e/1',
  'https://github.com/Tiinex/docs/issues/x/%2e%2e/1',
  'https://github.com/Tiinex/docs/issues/x\\..\\1',
  'https://github.com/Tiinex/docs/issues/1\\',
  'https://api.github.com/repos/Tiinex/docs/foo/../issues/1',
  'https://api.github.com/repos/Tiinex/docs/issues/./1'
];

for (const observation of hostileIssues) {
  const result = verifiedResult(createIssue, observation, GITHUB_ISSUE_BODY_TARGET_KIND);
  assert.equal(result.status, 'failure', `unsupported issue observation must not qualify: ${observation}`);
  assert.equal(result.sourceBinding, null);
  assert.ok(result.findings.some((finding) => finding.code === 'publication.result.social-target.invalid'));
  assert.equal(result.remoteTarget.inputTarget, observation);
  assert.notEqual(result.remoteTarget.inputTarget, issue);
}

for (const [plan, observation, targetKind] of [
  [createIssue, issue, GITHUB_ISSUE_BODY_TARGET_KIND],
  [createIssue, `${issue}/`, GITHUB_ISSUE_BODY_TARGET_KIND],
  [createIssue, 'https://api.github.com/repos/Tiinex/docs/issues/1', GITHUB_ISSUE_BODY_TARGET_KIND],
  [createComment, comment, GITHUB_ISSUE_COMMENT_TARGET_KIND],
  [createComment, `${issue}/#issuecomment-123`, GITHUB_ISSUE_COMMENT_TARGET_KIND]
]) {
  const result = verifiedResult(plan, observation, targetKind);
  assert.equal(result.status, 'success', `supported exact observation must remain qualified: ${observation}`);
  assert.ok(result.sourceBinding);
}

console.log('publication.githubSocialRawLexicalHardening: PASS');

function verifiedResult(plan, inputTarget, targetKind) {
  return buildPublicationResult(plan, {
    state: 'success',
    verificationStatus: 'verified',
    verifiedPayloadSha256: plan.outboundPayload.sha256,
    sourceTarget: { adapterId: 'github', inputTarget, targetKind }
  });
}
