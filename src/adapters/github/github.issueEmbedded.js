import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
export function createGithubEmbeddedArtifactRecord(markdown = '', context = {}, options = {}) {
  const target = context.target || {};
  const item = context.item || {};
  const sourceUrl = context.sourceUrl || target.canonicalUrl || item.html_url || '';
  const sourcePath = context.sourceArtifactPath || embeddedSourceArtifactPath(markdown);
  const recoveredPath = sourcePath || githubRecoveredEmbeddedArtifactPath(target, item, context.ordinal || 0, markdown, context.sourceKind || 'issue');
  const record = createRecordFromMarkdown(markdown, {
    path: recoveredPath,
    name: item.title || `${capitalize(target.kind || 'issue')} #${target.number || ''}`,
    sourceMode: `github-${context.sourceKind || 'issue'}-embedded-artifact`
  });
  return Object.assign({}, record, {
    recoveredFromUrl: sourceUrl,
    recoveryKind: `github-${context.sourceKind || 'issue'}-embedded-tiinex-artifact`,
    sourceMode: `github-${context.sourceKind || 'issue'}-embedded-artifact`,
    sourceTarget: {
      schema: 'tiinex.source.material.target.v1',
      surface: 'issueSnapshots',
      targetKind: `github-${context.sourceKind || 'issue'}-embedded-artifact`,
      inputTarget: sourceUrl,
      sourceArtifactPath: sourcePath || recoveredPath,
      loaded: true
    },
    snapshot: {
      schema: context.snapshotSchema || 'tiinex.github.issueSnapshot.v1',
      target,
      embedded: true,
      sourceKind: context.sourceKind || 'issue',
      sourceUrl,
      method: context.method || 'github-explicit-snapshot-fixture',
      sourceArtifactPath: sourcePath || ''
    }
  });
}

export function extractEmbeddedTiinexMarkdownBlocks(body = '') {
  const text = stripGitHubPresentationLayerForTiinexImport(body || '');
  const out = [];
  const seen = new Set();
  const push = (candidate = '') => {
    const clean = normalizeNewlines(candidate).trim();
    if (/^##\s+Source Markdown(?:\s+Excerpt|\s+Payload)?\s*$/im.test(clean)) return;
    if (!looksLikeStandaloneTiinexArtifact(clean) || seen.has(clean)) return;
    seen.add(clean);
    out.push(clean);
  };
  for (const block of extractSourceMarkdownPayloadBlocks(text)) push(block);
  for (const block of extractMarkdownFenceBlocks(text, { languages: ['md', 'markdown', ''] })) push(block);
  for (const block of extractGitHubDetailsPayloadBlocks(text)) push(block);
  if (!/<details\b/i.test(text) && looksLikeStandaloneTiinexArtifact(text.trim())) push(text.trim());
  return out;
}

function stripGitHubPresentationLayerForTiinexImport(body = '') {
  let text = normalizeNewlines(body || '');
  text = text.replace(/<!--\s*tiinex-artifact-start:[\s\S]*?-->/ig, '\n');
  return text;
}


function extractGitHubDetailsPayloadBlocks(text = '') {
  const source = normalizeNewlines(text || '');
  const blocks = [];
  const detailsRe = /<details\b[^>]*>([\s\S]*?)<\/details>/gim;
  let match;
  while ((match = detailsRe.exec(source))) {
    const rawInner = normalizeNewlines(String(match[1] || ''));
    const summary = rawInner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/im)?.[1] || '';
    if (!/tiinex\s+source\s+payload/i.test(stripHtml(summary))) continue;
    const inner = rawInner
      .replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/ig, '\n')
      .replace(/<!--\s*tiinex-artifact-start:[\s\S]*?-->/ig, '\n')
      .replace(/<\/?[^>]+>/g, '\n')
      .trim();
    if (!inner) continue;
    for (const block of extractSourceMarkdownPayloadBlocks(inner)) blocks.push(block);
    for (const block of extractMarkdownFenceBlocks(inner, { languages: ['md', 'markdown', ''] })) blocks.push(block);
    if (looksLikeStandaloneTiinexArtifact(inner)) blocks.push(inner);
  }
  return blocks;
}

function extractSourceMarkdownPayloadBlocks(text = '') {
  const source = normalizeNewlines(text || '');
  const blocks = [];
  const headingRe = /^##\s+Source Markdown(?:\s+Excerpt|\s+Payload)?\s*$/gim;
  let match;
  while ((match = headingRe.exec(source))) {
    const rest = source.slice(headingRe.lastIndex);
    const endMatch = rest.match(/\n##\s+(?:Publication Notes|Tiinex Boundary)\s*$|\n<\/details>\s*$/im);
    const section = (endMatch ? rest.slice(0, endMatch.index) : rest).trim();
    const greedy = extractOuterMarkdownFenceBlockGreedy(section, { languages: ['md', 'markdown', ''] });
    if (greedy) blocks.push(greedy);
    else {
      const fenced = extractMarkdownFenceBlocks(section, { languages: ['md', 'markdown', ''] });
      for (const block of fenced) blocks.push(block || '');
      if (!fenced.length && looksLikeStandaloneTiinexArtifact(section)) blocks.push(section);
    }
  }
  return blocks;
}

function extractMarkdownFenceBlocks(source = '', options = {}) {
  const allowed = new Set((options.languages || ['md', 'markdown', '']).map((item) => String(item || '').trim().toLowerCase()));
  const text = normalizeNewlines(source || '');
  const blocks = [];
  const openerRe = /^\s*(`{3,}|~{3,})([^\n`]*)\s*$/gm;
  let opener;
  while ((opener = openerRe.exec(text))) {
    const fence = opener[1];
    const info = String(opener[2] || '').trim().toLowerCase().split(/\s+/)[0] || '';
    if (!allowed.has(info)) continue;
    const bodyStart = openerRe.lastIndex;
    const closeRe = new RegExp(`^\\s*${escapeRegExp(fence)}\\s*$`, 'gm');
    closeRe.lastIndex = bodyStart;
    const close = closeRe.exec(text);
    if (!close) break;
    blocks.push(text.slice(bodyStart, close.index));
    openerRe.lastIndex = close.index + close[0].length;
  }
  return blocks;
}

function extractOuterMarkdownFenceBlockGreedy(section = '', options = {}) {
  const allowed = new Set((options.languages || ['md', 'markdown', '']).map((item) => String(item || '').trim().toLowerCase()));
  const lines = normalizeNewlines(section || '').trim().split('\n');
  let openIndex = -1;
  let fence = '';
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^\s*(`{3,}|~{3,})([^`]*)\s*$/);
    if (!match) continue;
    const info = String(match[2] || '').trim().toLowerCase().split(/\s+/)[0] || '';
    if (!allowed.has(info)) continue;
    openIndex = i;
    fence = match[1];
    break;
  }
  if (openIndex < 0 || !fence) return '';
  const closeRe = new RegExp(`^\\s*${escapeRegExp(fence)}\\s*$`);
  for (let i = lines.length - 1; i > openIndex; i -= 1) {
    if (closeRe.test(lines[i])) return lines.slice(openIndex + 1, i).join('\n').trim();
  }
  return '';
}

function looksLikeStandaloneTiinexArtifact(markdown = '') {
  const text = normalizeNewlines(markdown || '').trim();
  return /^#\s+Continuity Context\s*$/im.test(text) && /Current Schema\s*:/i.test(text) && /^---\s*$/m.test(text);
}

export function sourceArtifactPathFromPublicationBody(body = '') {
  const text = normalizeNewlines(body || '').trim();
  const beforeSource = text.split(/^##\s+Source Markdown(?:\s+Excerpt|\s+Payload)?\s*$/im)[0] || '';
  const sourcePath = beforeSource.match(/(?:^|\n)-\s+(?:Tiinex\s+)?Source(?:\s+Artifact)?\s+Path:\s*(.*)$/im)?.[1]
    || beforeSource.match(/(?:^|\n)-\s+Source\s+Artifact:\s*(.*)$/im)?.[1]
    || beforeSource.match(/(?:^|\n)-\s+Source\s+Path:\s*(.*)$/im)?.[1]
    || beforeSource.match(/(?:^|\n)>\s*Source\s+Path:\s*(.*)$/im)?.[1]
    || '';
  return stripMarkdownInline(sourcePath || '').trim();
}

function embeddedSourceArtifactPath(markdown = '') {
  const text = normalizeNewlines(markdown || '').trim();
  const transition = text.match(/(?:^|\n)##\s+(?:Tiinex\s+)?(?:Transition|Tiinex)\s+Boundary\s*(?:\n|$)[\s\S]*?(?=\n##\s+Source Markdown\s*$|\n##\s+Publication Notes\s*$|\n#\s+Continuity Integrity\s*$|\n---\s*$|$)/im)?.[0] || '';
  const sourcePath = transition.match(/(?:^|\n)-\s+(?:Tiinex\s+)?Source(?:\s+Artifact)?\s+Path:\s*(.*)$/im)?.[1] || '';
  return stripMarkdownInline(sourcePath || '').trim();
}

function githubRecoveredEmbeddedArtifactPath(target = {}, item = {}, ordinal = 0, markdown = '', sourceKind = 'issue') {
  const folder = `.topics/.github/.issues/${slugPart(target.owner || 'owner')}-${slugPart(target.repo || 'repo')}-issue-${target.number || 'target'}`;
  const id = String(item?.id || ordinal || sourceKind || 'source').replace(/[^A-Za-z0-9_.-]+/g, '-');
  const parsedTitle = String(markdown.match(/^#\s+(.+)\s*$/m)?.[1] || item.title || `${sourceKind} artifact`).trim();
  const slug = slugPart(parsedTitle).slice(0, 52) || 'artifact';
  const extension = /Current Schema:\s*\[[^\]]*workspace/i.test(markdown) || /Current Schema:\s*tiinex\.workspace\.v1/i.test(markdown) ? '.workspace.md' : '.trace.md';
  if (sourceKind === 'issue') return `${folder}/issue-root-recovered-${slug}${extension}`;
  return `${folder}/comment-${String(ordinal || 1).padStart(3, '0')}-${id}-recovered-${slug}${extension}`;
}

function stripMarkdownInline(value = '') {
  return String(value || '').replace(/^\[([^\]]+)\]\(([^)]+)\)$/, '$2').trim();
}

function normalizeNewlines(value = '') { return String(value || '').replace(/\r\n?/g, '\n'); }
function escapeRegExp(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function slugPart(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; }
function stripHtml(value = '') { return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function capitalize(value = '') { const text = String(value || 'item'); return text.charAt(0).toUpperCase() + text.slice(1); }
