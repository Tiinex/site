import { fetchGithubJson } from './github.readTransport.js';
export async function readExactGithubIssuePublicationRepresentation(exactTarget = {}, options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('github-publication-verification-fetch-unavailable');
  if (!exactTarget?.ok || exactTarget?.provider !== 'github' || !exactTarget?.owner || !exactTarget?.repo || !exactTarget?.issueNumber) throw new Error('github-publication-verification-target-unqualified');
  const comment = exactTarget.targetKind === 'github.issue.comment';
  const url = comment
    ? `https://api.github.com/repos/${exactTarget.owner}/${exactTarget.repo}/issues/comments/${encodeURIComponent(String(exactTarget.commentId || ''))}`
    : `https://api.github.com/repos/${exactTarget.owner}/${exactTarget.repo}/issues/${exactTarget.issueNumber}`;
  if (comment && !exactTarget.commentId) throw new Error('github-publication-verification-comment-id-missing');
  const body = await fetchGithubJson(url, fetchImpl);
  return Object.freeze({
    schema: 'tiinex.github.publicationVerificationObservation.v1',
    targetKind: exactTarget.targetKind,
    inputTarget: exactTarget.inputTarget,
    issueTarget: exactTarget.issueTarget,
    content: String(body?.body || ''),
    providerReceiptId: String(body?.id || (comment ? exactTarget.commentId : exactTarget.issueNumber)),
    observedAt: String(body?.updated_at || body?.created_at || ''),
    method: comment ? 'github-browser-issue-reader-exact-comment-body' : 'github-browser-issue-reader-exact-issue-body',
    transportTier: String(body?.transportTier || ''),
    boundary: 'Read-only body observation over a target already qualified by the shared exact GitHub social target authority; this owner does not parse publication target strings or mutate GitHub.'
  });
}
