import { canonicalPath, githubRepoRelativePathFromUrl } from './lineage.targetKeys.js';

export function declaredParentBindingTargetValuesForNode(node = {}, rawTarget = '') {
  const record = node?.record || node || {};
  const values = [
    record?.sourceTarget?.parentRawUrl,
    record?.sourceTarget?.parentSourceUrl,
    record?.snapshot?.parentRawUrl,
    record?.snapshot?.parentSourceUrl,
    record?.sourceTarget?.parentArtifactPath,
    record?.snapshot?.parentArtifactPath
  ];
  const out = [];
  const seen = new Set();
  for (const value of values) {
    const raw = String(value || '').trim();
    if (!raw || seen.has(raw)) continue;
    seen.add(raw);
    const filePath = githubRepoRelativePathFromUrl(raw) || canonicalPath(raw);
    if (!filePath && !isGitHubIssueTarget(raw)) continue;
    if (!declaredParentBindingMatchesTarget(raw, rawTarget)) continue;
    if (!isStrongDeclaredParentBinding(raw, filePath)) continue;
    out.push(Object.freeze({ raw, filePath, isGitHubIssueTarget: isGitHubIssueTarget(raw) }));
  }
  return out;
}

export function isSyntheticPublicationLineageNode(node = {}) {
  const record = node?.record || node || {};
  const mode = String(record.sourceMode || record.recoveryKind || '').toLowerCase();
  const targetKind = String(record.sourceTarget?.targetKind || record.snapshot?.sourceKind || '').toLowerCase();
  const path = canonicalPath(record.path || node?.path || '').toLowerCase();
  const recovered = String(record.recoveredFromUrl || record.sourceTarget?.inputTarget || record.snapshot?.sourceUrl || '').trim();
  return Boolean(
    mode.includes('github-issue') ||
    mode.includes('github-comment') ||
    targetKind.includes('github-issue') ||
    targetKind.includes('github-comment') ||
    path.includes('/.issues/') ||
    path.includes('/.github/.issues/') ||
    isGitHubIssueTarget(recovered)
  );
}

function declaredParentBindingMatchesTarget(parent = '', target = '') {
  const parentPath = githubRepoRelativePathFromUrl(parent) || canonicalPath(parent);
  const targetPath = githubRepoRelativePathFromUrl(target) || canonicalPath(target);
  if (isGitHubIssueTarget(parent)) return normalizeGitHubIssueTarget(parent) === normalizeGitHubIssueTarget(target);
  if (!parentPath) return false;
  if (!targetPath) return true;
  if (parentPath === targetPath || parentPath.endsWith(`/${targetPath}`) || targetPath.endsWith(`/${parentPath}`)) return true;
  const parentBase = basename(parentPath);
  const targetBase = basename(targetPath);
  return Boolean(parentBase && targetBase && parentBase === targetBase && parentPath.includes('/'));
}

function isStrongDeclaredParentBinding(raw = '', path = '') {
  if (isGitHubIssueTarget(raw)) return true;
  const clean = canonicalPath(path || raw);
  if (!clean) return false;
  if (/^\.topics(?:\/|$)/.test(clean)) return true;
  return clean.includes('/');
}

function isGitHubIssueTarget(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    return (url.hostname === 'github.com' || url.hostname.endsWith('.github.com') || url.hostname === 'api.github.com') && parts.includes('issues');
  } catch (_) { return false; }
}

function normalizeGitHubIssueTarget(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    return `${url.hostname.toLowerCase()}${url.pathname.toLowerCase()}${url.hash.toLowerCase()}`;
  } catch (_) { return String(value || '').trim().toLowerCase(); }
}

function basename(path = '') { return canonicalPath(path).split('/').filter(Boolean).pop() || ''; }
