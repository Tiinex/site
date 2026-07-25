import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
import { createGithubEmbeddedArtifactRecord, extractEmbeddedTiinexMarkdownBlocks, sourceArtifactPathFromPublicationBody } from './github.issueEmbedded.js';

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

export async function discoverGithubIssueSnapshotTargets(source = {}, options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  const repository = String(source.repo || source.repository || '').trim();
  const [owner, repo] = repository.split('/').filter(Boolean);
  const maxIssues = Math.max(1, Math.min(100, Number(options.maxIssues || options.maxIssueSnapshots || 12)));
  if (!fetchImpl || !owner || !repo) {
    return {
      schema: 'tiinex.github.issueSnapshot.discovery.v1',
      status: 'unavailable',
      targets: [],
      warnings: [finding('warning', 'github.issue.discovery.unavailable', 'GitHub issue discovery is unavailable without a fetch implementation and explicit repository boundary.', { surface: 'issueSnapshots' })],
      errors: [],
      counts: { discovered: 0, targets: 0, warnings: 1, errors: 0 }
    };
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&sort=updated&direction=desc&per_page=${encodeURIComponent(String(maxIssues))}`;
  try {
    const rows = await fetchJson(url, fetchImpl);
    const seen = new Set();
    const targets = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      if (row && row.pull_request) continue;
      const html = row.html_url || `https://github.com/${owner}/${repo}/issues/${row.number}`;
      const parsed = parseGithubIssueSnapshotTarget(html);
      if (!parsed.ok) continue;
      const key = parsed.canonicalUrl.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      targets.push(Object.assign(parsed, { issue: row }));
      if (targets.length >= maxIssues) break;
    }
    const warnings = [];
    if (Array.isArray(rows) && rows.length >= maxIssues) warnings.push(finding('info', 'github.issue.discovery.bounded', `Issue discovery loaded a bounded first page of ${targets.length} issue target(s).`, { surface: 'issueSnapshots', maxIssues }));
    return {
      schema: 'tiinex.github.issueSnapshot.discovery.v1',
      status: 'ready',
      targets,
      warnings,
      errors: [],
      counts: { discovered: targets.length, targets: targets.length, warnings: warnings.length, errors: 0 },
      url
    };
  } catch (error) {
    const warning = githubIssueFetchWarning(error, 'github.issue.discovery.unavailable', 'GitHub issue discovery is unavailable right now. Source boundary remains registered; retry later or provide explicit issue URLs.');
    return { schema: 'tiinex.github.issueSnapshot.discovery.v1', status: 'unavailable', targets: [], warnings: [warning], errors: [], counts: { discovered: 0, targets: 0, warnings: 1, errors: 0 }, url };
  }
}

export async function materializeGithubIssueSnapshots(issueUrlsOrTargets = '', options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  const parsed = Array.isArray(issueUrlsOrTargets)
    ? { targets: issueUrlsOrTargets, errors: [], counts: { targets: issueUrlsOrTargets.length, errors: 0 } }
    : parseGithubIssueSnapshotTargets(issueUrlsOrTargets);
  const records = [];
  const warnings = [];
  const errors = [...parsed.errors];
  if (!fetchImpl) {
    if (parsed.counts.targets) warnings.push(finding('warning', 'github.issue.reader.unavailable', 'Issue snapshot targets were parsed, but no fetch implementation is available.', { surface: 'issueSnapshots', targetCount: parsed.counts.targets }));
    return { schema: 'tiinex.github.issueSnapshot.materialization.v1', records, warnings, errors, counts: { targets: parsed.counts.targets, records: 0, warnings: warnings.length, errors: errors.length } };
  }
  const maxComments = Math.max(0, Math.min(100, Number(options.maxComments ?? 6)));
  for (const target of parsed.targets) {
    await yieldToBrowserIfAvailable();
    const normalized = target.ok ? target : parseGithubIssueSnapshotTarget(target.canonicalUrl || target.html_url || target.url || '');
    if (!normalized.ok) {
      errors.push({ ref: target.input || target.url || '', error: normalized.error || 'invalid issue target' });
      continue;
    }
    if (normalized.kind === 'discussion') {
      warnings.push(finding('warning', 'github.discussion.reader.deferred', 'GitHub Discussion snapshots are not available through the browser REST reader yet; this target remains deferred.', { surface: 'issueSnapshots', url: normalized.canonicalUrl }));
      continue;
    }
    try {
      const issue = target.issue || await fetchJson(normalized.apiUrl, fetchImpl);
      const comments = maxComments && Number(issue.comments || 0) > 0
        ? await fetchCommentsForIssue(normalized, fetchImpl, maxComments)
        : [];
      const issueRecords = createGithubIssueSnapshotRecords(Object.assign({}, issue, { target: normalized, comments, method: 'github-browser-issue-reader' }), options);
      for (const record of issueRecords) {
        record.sourceTarget = Object.assign({
          schema: 'tiinex.source.material.target.v1',
          surface: 'issueSnapshots',
          targetKind: record.snapshot?.embedded ? `github-${normalized.kind}-embedded-artifact` : `github-${normalized.kind}-snapshot`,
          inputTarget: record.snapshot?.sourceUrl || normalized.canonicalUrl,
          transportTier: issue.transportTier || '',
          loaded: true
        }, record.sourceTarget || {});
        records.push(record);
      }
    } catch (error) {
      warnings.push(githubIssueFetchWarning(error, 'github.issue.snapshot.fetch-failed', `Could not fetch ${normalized.canonicalUrl}; snapshot remains unavailable.`, { url: normalized.canonicalUrl }));
    }
  }
  return {
    schema: 'tiinex.github.issueSnapshot.materialization.v1',
    records,
    warnings,
    errors,
    counts: { targets: parsed.counts.targets, records: records.length, warnings: warnings.length, errors: errors.length }
  };
}

export function createGithubIssueSnapshotRecord(snapshot = {}, options = {}) {
  return createGithubIssueSnapshotRecords(snapshot, options)[0];
}

export function createGithubIssueSnapshotRecords(snapshot = {}, options = {}) {
  const target = snapshot.target || parseGithubIssueSnapshotTarget(snapshot.url || snapshot.html_url || '');
  if (!target.ok) throw new Error(target.error || 'invalid issue snapshot target');
  const issueEmbedded = extractEmbeddedTiinexMarkdownBlocks(snapshot.body || '');
  const records = [];
  if (issueEmbedded.length) {
    records.push(createGithubEmbeddedArtifactRecord(issueEmbedded[0], { target, item: snapshot, ordinal: 0, sourceKind: 'issue', sourceUrl: target.canonicalUrl, sourceArtifactPath: sourceArtifactPathFromPublicationBody(snapshot.body || ''), method: snapshot.method || 'github-explicit-snapshot-fixture', snapshotSchema: GITHUB_ISSUE_SNAPSHOT_SCHEMA_ID }, options));
  } else {
    records.push(createGithubIssueSnapshotEvidenceRecord(snapshot, options));
  }
  const comments = Array.isArray(snapshot.comments) ? snapshot.comments : [];
  comments.forEach((comment, index) => {
    for (const embedded of extractEmbeddedTiinexMarkdownBlocks(comment.body || '')) {
      records.push(createGithubEmbeddedArtifactRecord(embedded, { target, item: comment, ordinal: index + 1, sourceKind: 'comment', sourceUrl: comment.html_url || `${target.canonicalUrl}#issuecomment-${comment.id || index + 1}`, method: snapshot.method || 'github-explicit-snapshot-fixture', snapshotSchema: GITHUB_ISSUE_SNAPSHOT_SCHEMA_ID }, options));
    }
  });
  return records;
}

function createGithubIssueSnapshotEvidenceRecord(snapshot = {}, options = {}) {
  const target = snapshot.target || parseGithubIssueSnapshotTarget(snapshot.url || snapshot.html_url || '');
  if (!target.ok) throw new Error(target.error || 'invalid issue snapshot target');
  const comments = Array.isArray(snapshot.comments) ? snapshot.comments : [];
  const createdAt = snapshot.created_at || snapshot.createdAt || options.createdAt || 'unknown';
  const title = snapshot.title || `${capitalize(target.kind)} #${target.number}`;
  const state = snapshot.state || 'unknown';
  const author = snapshot.user?.login || snapshot.author || 'unknown';
  const body = String(snapshot.body || '');
  const method = snapshot.method || 'github-explicit-snapshot-fixture';
  const summary = issueSnapshotSummary({ body, title, target });
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    '- Current',
    '  - Current Schema: [tiinex.evidence.v1](tiinex.evidence.v1.schema.md)',
    `  - Created At: ${createdAt}`,
    `  - Summary: ${summary}`,
    '  - Status: source-backed/snapshot',
    '  - Why: Captured as a read-only GitHub issue snapshot. It preserves observed source material without promoting it to project truth.',
    '',
    '---',
    '',
    `# ${title}`,
    '',
    '## Supported Claim Or Question',
    '',
    `This record preserves the observed GitHub ${target.kind} material for ${target.repository} #${target.number} so it can be inspected, searched, exported, and used explicitly by later Tiinex work.`,
    '',
    '## Provenance',
    '',
    `- Repository: ${target.repository}`,
    `- Kind: ${target.kind}`,
    `- Number: ${target.number}`,
    `- URL: ${target.canonicalUrl}`,
    `- State: ${state}`,
    `- Author: ${author}`,
    `- Transport: ${method}`,
    '- Source Boundary: read-only GitHub issue snapshot; no repo-file discovery or remote mutation is implied.',
    '',
    '## Evidence Material',
    '',
    body ? markdownFence(body, 'md') : '_No issue body was captured._',
    '',
    comments.length ? '### Captured comments' : '',
    ...comments.flatMap((comment, index) => [
      comments.length ? `#### Comment ${index + 1} · ${comment.user?.login || comment.author || 'unknown'}` : '',
      comments.length ? '' : '',
      comments.length ? markdownFence(comment.body || '_No comment body captured._', 'md') : '',
      comments.length ? '' : ''
    ]),
    '',
    '## Preservation And Fidelity',
    '',
    '- Snapshot Type: GitHub issue materialization',
    `- Snapshot Method: ${method}`,
    `- Snapshot Target: ${target.canonicalUrl}`,
    '- Fidelity: preserves title, state, author, body, and bounded comments available to the browser reader at materialization time.',
    '',
    '## Interpretation Limits',
    '',
    '- GitHub issues and comments are mutable source material.',
    '- This Evidence record does not mean acceptance, task status, owner intent, or canonical Tiinex lineage by itself.',
    '- Use a later explicit transition or artifact draft to interpret this source material.',
    '',
    '# Continuity Integrity',
    '',
    '- Snapshot Integrity',
    `  - Method: ${method}`,
    `  - Value: ${target.canonicalUrl}`
  ].filter(Boolean).join('\n');
  const record = createRecordFromMarkdown(markdown, { path: target.canonicalUrl, name: title, sourceMode: 'github-issue-snapshot' });
  return Object.assign({}, record, {
    snapshot: {
      schema: GITHUB_ISSUE_SNAPSHOT_SCHEMA_ID,
      target,
      comments: comments.length,
      state,
      author,
      method
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
      records.push(...createGithubIssueSnapshotRecords(Object.assign({}, fixture, { target })));
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



function issueSnapshotSummary({ body = '', title = '', target = {} } = {}) {
  const excerpt = plainExcerpt(body, 140);
  if (excerpt) return excerpt;
  return `GitHub ${target.kind || 'issue'} snapshot for ${target.repository || 'repository'} #${target.number || ''}: ${plainExcerpt(title, 96) || 'untitled'}`.trim();
}


function plainExcerpt(value = '', limit = 140) {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, (match) => {
      const label = match.match(/!?\[([^\]]*)\]/)?.[1] || '';
      return label ? ` ${label} ` : ' ';
    })
    .replace(/[#>*_`~\-|:[\](){}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

function markdownFence(text, lang = '') {
  const body = String(text || '');
  let fence = '```';
  while (body.includes(fence)) fence += '`';
  return `${fence}${lang ? lang : ''}\n${body}\n${fence}`;
}

async function fetchCommentsForIssue(target = {}, fetchImpl, maxComments = 20) {
  const commentsUrl = `https://api.github.com/repos/${target.owner}/${target.repo}/issues/${target.number}/comments?per_page=${encodeURIComponent(String(maxComments))}`;
  try {
    const comments = await fetchJson(commentsUrl, fetchImpl);
    return Array.isArray(comments) ? comments.slice(0, maxComments) : [];
  } catch (_) {
    return [];
  }
}

async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res || !res.ok) {
    const status = res?.status || 0;
    const statusText = res?.statusText || '';
    let bodyMessage = '';
    try {
      const body = await res.json();
      bodyMessage = body?.message ? String(body.message) : '';
    } catch (_) {}
    const err = new Error([status ? `GitHub API ${status}` : 'GitHub API', statusText, bodyMessage].filter(Boolean).join(' ').trim() || 'GitHub API request failed');
    err.status = status;
    err.statusText = statusText;
    err.url = url;
    throw err;
  }
  const body = await res.json();
  if (body && typeof body === 'object' && !Array.isArray(body)) body.transportTier = res.transportTier || '';
  return body;
}

function githubIssueFetchWarning(error, code = 'github.issue.fetch-failed', message = '', extra = {}) {
  return finding('warning', code, message || 'GitHub issue reader could not fetch the requested issue material.', Object.assign({ surface: 'issueSnapshots', status: error?.status || 0, url: error?.url || '' }, extra));
}

function apiUrlFor({ owner, repo, kind, number }) {
  if (kind === 'discussion') return `https://api.github.com/repos/${owner}/${repo}/discussions/${number}`;
  if (kind === 'pull') return `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;
  return `https://api.github.com/repos/${owner}/${repo}/issues/${number}`;
}
function finding(severity, code, message, extra = {}) { return Object.assign({ severity, code, message }, extra); }
function capitalize(value = '') { const text = String(value || 'item'); return text.charAt(0).toUpperCase() + text.slice(1); }


function yieldToBrowserIfAvailable() {
  if (typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout: 80 });
      return;
    }
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    window.setTimeout(resolve, 0);
  });
}

export function __testYieldToBrowserIfAvailable() {
  return yieldToBrowserIfAvailable();
}
