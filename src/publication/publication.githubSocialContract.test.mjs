import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildPublicationPlan, buildPublicationResult } from './publication.contract.js';
import { acceptPortablePublicationResult, planPortablePublication } from '../tooling/portable/publication/runtime.publication.js';
import {
  GITHUB_ISSUE_BODY_TARGET_KIND,
  GITHUB_ISSUE_COMMENT_TARGET_KIND,
  GITHUB_REPO_FILE_TARGET_KIND
} from './publication.targetContract.js';
import { parseExactGithubIssueTarget } from '../sources/github/github.issueTarget.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-08-19T00:00:00.000Z
  - Summary: Publication draft
  - Status: draft/local

---

# Publication draft

# Continuity Integrity

- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
`;
const record = { id: 'draft-social', title: 'Draft', path: 'topics/draft.md', markdown, schemaId: 'tiinex.topic.v1', sourceMode: 'local-transition', source: { adapterId: 'local' } };
const workspace = { id: 'w-social', title: 'Social publication', records: [record], assets: [] };
const commit = 'a'.repeat(40);
const issue1 = 'https://github.com/Tiinex/docs/issues/1';
const issue2 = 'https://github.com/Tiinex/docs/issues/2';
const otherRepoIssue = 'https://github.com/Tiinex/site/issues/1';
const comment1 = `${issue1}#issuecomment-101`;
const comment2 = `${issue2}#issuecomment-202`;

const parsedIssue = parseExactGithubIssueTarget(issue1);
assert.equal(parsedIssue.ok, true);
assert.equal(parsedIssue.targetKind, GITHUB_ISSUE_BODY_TARGET_KIND);
assert.equal(parsedIssue.repository, 'Tiinex/docs');
assert.equal(parsedIssue.number, 1);
const parsedComment = parseExactGithubIssueTarget(comment1);
assert.equal(parsedComment.ok, true);
assert.equal(parsedComment.targetKind, GITHUB_ISSUE_COMMENT_TARGET_KIND);
assert.equal(parsedComment.commentId, '101');
assert.equal(parsedComment.issueTarget, issue1);

// Repo-file regression.
const repoPlan = plan({
  mutationPolicy: 'create-or-fail',
  destination: { provider: 'github', repository: 'Tiinex/docs', ref: 'main', path: '.topics/published.trace.md', targetKind: 'github-repo-file' }
});
assert.equal(repoPlan.status, 'ready');
assert.equal(repoPlan.destination.targetKind, GITHUB_REPO_FILE_TARGET_KIND);
const repoSuccess = result(repoPlan, {
  sourceTarget: { adapterId: 'github', repo: 'Tiinex/docs', path: '.topics/published.trace.md', materializedCommit: commit, targetKind: 'github-repo-file' }
});
assert.equal(repoSuccess.status, 'success');
assert.equal(repoSuccess.remoteTarget.materializedCommit, commit);
assert.equal(repoSuccess.remoteTarget.immutability, 'immutable-materialized-commit');
assert.equal(repoSuccess.sourceBinding.mutability, 'immutable-materialized-representation');

const branchOnly = result(repoPlan, { sourceTarget: { adapterId: 'github', repo: 'Tiinex/docs', path: '.topics/published.trace.md', configuredRef: 'main', targetKind: 'github-repo-file' } });
assert.equal(branchOnly.status, 'failure');
assert.ok(branchOnly.findings.some((finding) => finding.code === 'publication.result.target.commit-missing'));

const repoPathMismatch = result(repoPlan, { sourceTarget: { adapterId: 'github', repo: 'Tiinex/docs', path: '.topics/other.trace.md', materializedCommit: commit, targetKind: 'github-repo-file' } });
assert.equal(repoPathMismatch.status, 'failure');
assert.ok(repoPathMismatch.findings.some((finding) => finding.code === 'publication.result.target.path-mismatch'));

const repoMismatch = result(repoPlan, { sourceTarget: { adapterId: 'github', repo: 'Tiinex/site', path: '.topics/published.trace.md', materializedCommit: commit, targetKind: 'github-repo-file' } });
assert.equal(repoMismatch.status, 'failure');
assert.ok(repoMismatch.findings.some((finding) => finding.code === 'publication.result.target.repo-mismatch'));

const repoWrongDigest = result(repoPlan, { verifiedPayloadSha256: '0'.repeat(64), sourceTarget: { adapterId: 'github', repo: 'Tiinex/docs', path: '.topics/published.trace.md', materializedCommit: commit, targetKind: 'github-repo-file' } });
assert.equal(repoWrongDigest.status, 'failure');
assert.ok(repoWrongDigest.findings.some((finding) => finding.code === 'publication.result.payload-verification.mismatch'));

// Issue body: create-new intent can be ready without materialized issue URL.
const createIssue = plan({
  mutationPolicy: 'create-new',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_BODY_TARGET_KIND }
});
assert.equal(createIssue.status, 'ready');
assert.equal(createIssue.destination.externalTarget, '');
assert.equal(createIssue.destination.path, '');
assert.equal(createIssue.destination.ref, '');

const createIssueWithoutResultTarget = result(createIssue, { sourceTarget: { adapterId: 'github', targetKind: GITHUB_ISSUE_BODY_TARGET_KIND } });
assert.equal(createIssueWithoutResultTarget.status, 'failure');
assert.equal(createIssueWithoutResultTarget.sourceBinding, null);

const createIssueSuccess = result(createIssue, { sourceTarget: { adapterId: 'github', inputTarget: issue1, targetKind: GITHUB_ISSUE_BODY_TARGET_KIND } });
assert.equal(createIssueSuccess.status, 'success');
assert.equal(createIssueSuccess.remoteTarget.inputTarget, issue1);
assert.equal(createIssueSuccess.remoteTarget.issueNumber, 1);
assert.equal(createIssueSuccess.remoteTarget.materializedCommit, '');
assert.equal(createIssueSuccess.remoteTarget.path, '');
assert.equal(createIssueSuccess.remoteTarget.mutability, 'mutable-remote-representation');
assert.equal(createIssueSuccess.sourceBinding.targetKind, GITHUB_ISSUE_BODY_TARGET_KIND);
assert.equal(createIssueSuccess.sourceBinding.mutability, 'mutable-remote-representation');

const createIssueWrongRepo = result(createIssue, { sourceTarget: { adapterId: 'github', inputTarget: otherRepoIssue, targetKind: GITHUB_ISSUE_BODY_TARGET_KIND } });
assert.equal(createIssueWrongRepo.status, 'failure');
assert.ok(createIssueWrongRepo.findings.some((finding) => finding.code === 'publication.result.target.repo-mismatch'));

const createIssueCommentAsBody = result(createIssue, { sourceTarget: { adapterId: 'github', inputTarget: comment1, targetKind: GITHUB_ISSUE_BODY_TARGET_KIND } });
assert.equal(createIssueCommentAsBody.status, 'failure');
assert.ok(createIssueCommentAsBody.findings.some((finding) => finding.code === 'publication.result.social-target.kind-mismatch'));

const updateIssueMissing = plan({
  mutationPolicy: 'update-known',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_BODY_TARGET_KIND }
});
assert.equal(updateIssueMissing.status, 'blocked');
assert.ok(updateIssueMissing.findings.some((finding) => finding.code === 'publication.plan.destination.issue-target-missing'));

const updateIssue = plan({
  mutationPolicy: 'update-known',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_BODY_TARGET_KIND, externalTarget: issue1 }
});
assert.equal(updateIssue.status, 'ready');
assert.equal(result(updateIssue, { sourceTarget: { inputTarget: issue2, targetKind: GITHUB_ISSUE_BODY_TARGET_KIND } }).status, 'failure');
assert.equal(result(updateIssue, { sourceTarget: { inputTarget: issue1, targetKind: GITHUB_ISSUE_BODY_TARGET_KIND } }).status, 'success');

const missingTargetKind = plan({
  mutationPolicy: 'create-new',
  destination: { provider: 'github', repository: 'Tiinex/docs' }
});
assert.equal(missingTargetKind.status, 'blocked');
assert.ok(missingTargetKind.findings.some((finding) => finding.code === 'publication.plan.destination.target-kind-missing'));

const issueWrongDigest = result(createIssue, { verifiedPayloadSha256: 'f'.repeat(64), sourceTarget: { inputTarget: issue1, targetKind: GITHUB_ISSUE_BODY_TARGET_KIND } });
assert.equal(issueWrongDigest.status, 'failure');

// Issue comment: parent issue intent known before final comment exists.
const createComment = plan({
  mutationPolicy: 'create-comment',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, containerTarget: issue1 }
});
assert.equal(createComment.status, 'ready');
assert.equal(createComment.destination.externalTarget, '');
assert.equal(createComment.destination.containerTarget, issue1);

const commentWithoutPermalink = result(createComment, { sourceTarget: { adapterId: 'github', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND } });
assert.equal(commentWithoutPermalink.status, 'failure');
assert.equal(commentWithoutPermalink.sourceBinding, null);

const commentSuccess = result(createComment, { sourceTarget: { adapterId: 'github', inputTarget: comment1, targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND } });
assert.equal(commentSuccess.status, 'success');
assert.equal(commentSuccess.remoteTarget.inputTarget, comment1);
assert.equal(commentSuccess.remoteTarget.containerTarget, issue1);
assert.equal(commentSuccess.remoteTarget.commentId, '101');
assert.equal(commentSuccess.remoteTarget.materializedCommit, '');
assert.equal(commentSuccess.remoteTarget.path, '');

const portableCommentPlan = planPortablePublication({
  workspace,
  recordId: record.id,
  mutationPolicy: 'create-comment',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, containerTarget: issue1 }
});
assert.equal(portableCommentPlan.status, 'ready');
const portableCommentResult = acceptPortablePublicationResult({
  plan: portableCommentPlan,
  execution: {
    state: 'success',
    verificationStatus: 'verified',
    verifiedPayloadSha256: portableCommentPlan.plan.outboundPayload.sha256,
    sourceTarget: { adapterId: 'github', inputTarget: comment1, targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND }
  }
});
assert.equal(portableCommentResult.status, 'success');
assert.equal(portableCommentResult.qualification.exactSourceBinding, true);
assert.equal(portableCommentResult.qualification.bindingMutability, 'mutable-remote-representation');
assert.equal(portableCommentResult.qualification.immutableSourceBinding, false);
assert.equal(portableCommentResult.qualification.durableSourceBinding, false);

const commentDifferentIssue = result(createComment, { sourceTarget: { inputTarget: comment2, targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND } });
assert.equal(commentDifferentIssue.status, 'failure');
assert.ok(commentDifferentIssue.findings.some((finding) => finding.code === 'publication.result.social-target.container-mismatch'));

const commentDifferentRepo = result(createComment, { sourceTarget: { inputTarget: 'https://github.com/Tiinex/site/issues/1#issuecomment-101', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND } });
assert.equal(commentDifferentRepo.status, 'failure');
assert.ok(commentDifferentRepo.findings.some((finding) => finding.code === 'publication.result.target.repo-mismatch'));

const issueBodyAsComment = result(createComment, { sourceTarget: { inputTarget: issue1, targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND } });
assert.equal(issueBodyAsComment.status, 'failure');
assert.ok(issueBodyAsComment.findings.some((finding) => finding.code === 'publication.result.social-target.kind-mismatch'));

const commentWrongDigest = result(createComment, { verifiedPayloadSha256: 'e'.repeat(64), sourceTarget: { inputTarget: comment1, targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND } });
assert.equal(commentWrongDigest.status, 'failure');

// Architect v443 exact-source-binding reproductions: unsupported observations must never be promoted into exact comment permalinks.
for (const unsupportedObservation of [
  'https://evil.github.com/Tiinex/docs/issues/1#issuecomment-123',
  'https://github.com/Tiinex/docs/issues/1?x=issues/comments/123',
  'https://github.com/Tiinex/docs/issues/1/comment-123'
]) {
  const hardened = result(createComment, {
    sourceTarget: { adapterId: 'github', inputTarget: unsupportedObservation, targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND }
  });
  assert.equal(hardened.status, 'failure', `unsupported observation must not qualify publication success: ${unsupportedObservation}`);
  assert.equal(hardened.sourceBinding, null, `unsupported observation must not create a source binding: ${unsupportedObservation}`);
  assert.ok(hardened.findings.some((finding) => finding.code === 'publication.result.social-target.invalid'), `exact social-target invalid finding required: ${unsupportedObservation}`);
  assert.equal(hardened.remoteTarget.inputTarget, unsupportedObservation, 'failure evidence should preserve the supplied unsupported observation instead of manufacturing a different valid permalink');
}

const updateCommentMissing = plan({
  mutationPolicy: 'update-known',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, containerTarget: issue1 }
});
assert.equal(updateCommentMissing.status, 'blocked');
assert.ok(updateCommentMissing.findings.some((finding) => finding.code === 'publication.plan.destination.comment-target-missing'));

const updateComment = plan({
  mutationPolicy: 'update-known',
  destination: { provider: 'github', repository: 'Tiinex/docs', targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND, containerTarget: issue1, externalTarget: comment1 }
});
assert.equal(updateComment.status, 'ready');
assert.equal(result(updateComment, { sourceTarget: { inputTarget: comment1, targetKind: GITHUB_ISSUE_COMMENT_TARGET_KIND } }).status, 'success');

// Planning/result remain side-effect free and host-neutral.
assert.equal(workspace.records[0].source.adapterId, 'local');
const contractSource = fs.readFileSync(new URL('./publication.contract.js', import.meta.url), 'utf8');
const targetSource = fs.readFileSync(new URL('./publication.targetContract.js', import.meta.url), 'utf8');
assert.doesNotMatch(contractSource + targetSource, /\bfetch\s*\(/);
assert.doesNotMatch(contractSource + targetSource, /\b(token|oauth|authorization)\b/i);
assert.doesNotMatch(contractSource + targetSource, /TiinexApp|react/i);

console.log('publication.githubSocialContract: PASS');

function plan(input) {
  return buildPublicationPlan(workspace, { recordId: record.id, ...input });
}

function result(planValue, overrides = {}) {
  return buildPublicationResult(planValue, {
    state: 'success',
    verificationStatus: 'verified',
    verifiedPayloadSha256: planValue.outboundPayload.sha256,
    ...overrides
  });
}
