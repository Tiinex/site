import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';

export const GITHUB_ISSUE_SNAPSHOT_SCHEMA_ID = 'tiinex.github.issueSnapshot.v1';
const TARGET_PATTERN = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(issues|pull|discussions)\/(\d+)(?:[#?].*)?$/i;

export function parseGithubIssueSnapshotTarget(value = '') {
  const raw = String(value || '').trim();
  const match = raw.match(TARGET_PATTERN);
  if (!match) return { ok: false, input: raw, error: 'unsupported-github-issue-target' };
  const [, owner, repo, kind, number] = match;
  const normalizedKind = kind === 'pull' ? 'pull' : kind === 'discussions' ? 'discussion' : 'issue';
  return {
    ok: true,
    schema: GITHUB_ISSUE_SNAPSHOT_SCHEMA_ID,
    input: raw,
    owner,
    repo,
    repository: `${owner}/${repo}`,
    kind: normalizedKind,
    number: Number(number),
    canonicalUrl: `https://github.com/${owner}/${repo}/${kind}/${number}`,
    apiUrl: apiUrlFor({ owner, repo, kind: normalizedKind, number })
  };
}

export function parseGithubIssueSnapshotTargets(value = '') {
  const lines = Array.isArray(value) ? value : String(value || '').split(/\r?\n|,/);
  const targets = [];
  const errors = [];
  const seen = new Set();
  for (const line of lines) {
    const text = String(line || '').trim();
    if (!text) continue;
    const parsed = parseGithubIssueSnapshotTarget(text);
    if (!parsed.ok) {
      errors.push({ ref: text, error: parsed.error });
      continue;
    }
    const key = parsed.canonicalUrl.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push(parsed);
  }
  return { schema: 'tiinex.github.issueSnapshot.targets.v1', targets, errors, counts: { targets: targets.length, errors: errors.length } };
}

export function createGithubIssueSnapshotRecord(snapshot = {}, options = {}) {
  const target = snapshot.target || parseGithubIssueSnapshotTarget(snapshot.url || snapshot.html_url || '');
  if (!target.ok) throw new Error(target.error || 'invalid issue snapshot target');
  const comments = Array.isArray(snapshot.comments) ? snapshot.comments : [];
  const createdAt = snapshot.created_at || snapshot.createdAt || options.createdAt || 'unknown';
  const title = snapshot.title || `${capitalize(target.kind)} #${target.number}`;
  const state = snapshot.state || 'unknown';
  const author = snapshot.user?.login || snapshot.author || 'unknown';
  const body = snapshot.body || '';
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    '- Current',
    '  - Current Schema: [tiinex.evidence.v1](tiinex.evidence.v1.schema.md)',
    `  - Created At: ${createdAt}`,
    `  - Summary: GitHub ${target.kind} snapshot for ${target.repository} #${target.number}`,
    '  - Status: source-backed/snapshot',
    '  - Why: Captured as an explicit GitHub issue/discussion snapshot target. No hidden repo discovery is implied.',
    '',
    '---',
    '',
    `# ${title}`,
    '',
    '## GitHub Snapshot Boundary',
    '',
    `- Repository: ${target.repository}`,
    `- Kind: ${target.kind}`,
    `- Number: ${target.number}`,
    `- URL: ${target.canonicalUrl}`,
    `- State: ${state}`,
    `- Author: ${author}`,
    '',
    '## Body',
    '',
    body || '_No body captured._',
    '',
    comments.length ? '## Comments' : '',
    ...comments.flatMap((comment, index) => [
      comments.length ? `### Comment ${index + 1} · ${comment.user?.login || comment.author || 'unknown'}` : '',
      comments.length ? '' : '',
      comments.length ? (comment.body || '_No comment body captured._') : '',
      comments.length ? '' : ''
    ]),
    '# Continuity Integrity',
    '',
    '- Snapshot Integrity',
    '  - Method: github-explicit-snapshot-fixture',
    `  - Value: ${target.canonicalUrl}`
  ].filter(Boolean).join('\n');
  const record = createRecordFromMarkdown(markdown, { path: target.canonicalUrl, name: title, sourceMode: 'github-issue-snapshot' });
  return Object.assign({}, record, {
    snapshot: {
      schema: GITHUB_ISSUE_SNAPSHOT_SCHEMA_ID,
      target,
      comments: comments.length,
      state,
      author
    }
  });
}

export function materializeGithubIssueSnapshotFixtures(issueUrls = '', fixtures = {}) {
  const parsed = parseGithubIssueSnapshotTargets(issueUrls);
  const records = [];
  const warnings = [];
  const errors = [...parsed.errors];
  for (const target of parsed.targets) {
    const fixture = fixtures[target.canonicalUrl] || fixtures[`${target.repository}#${target.number}`] || fixtures[String(target.number)] || null;
    if (!fixture) {
      warnings.push({ code: 'github.issue.snapshot.fixture-missing', severity: 'warning', message: `No fixture supplied for ${target.canonicalUrl}; snapshot remains deferred.`, url: target.canonicalUrl });
      continue;
    }
    try {
      records.push(createGithubIssueSnapshotRecord(Object.assign({}, fixture, { target })));
    } catch (error) {
      errors.push({ ref: target.canonicalUrl, error: error?.message || String(error) });
    }
  }
  return {
    schema: 'tiinex.github.issueSnapshot.materialization.v1',
    records,
    warnings,
    errors,
    counts: { targets: parsed.targets.length, records: records.length, warnings: warnings.length, errors: errors.length }
  };
}

function apiUrlFor({ owner, repo, kind, number }) {
  if (kind === 'discussion') return `https://api.github.com/repos/${owner}/${repo}/discussions/${number}`;
  if (kind === 'pull') return `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;
  return `https://api.github.com/repos/${owner}/${repo}/issues/${number}`;
}
function capitalize(value = '') { const text = String(value || 'item'); return text.charAt(0).toUpperCase() + text.slice(1); }
