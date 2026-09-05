export function workspaceTitleFromMarkdown(markdown = '') {
  const text = String(markdown || '');
  const headings = Array.from(text.matchAll(/^#\s+(.+)\s*$/gm)).map((match) => stripMarkdown(match[1] || '').trim()).filter(Boolean);
  const heading = headings.find((value) => !['continuity context', 'continuity integrity'].includes(value.toLowerCase())) || '';
  if (heading) return normalizeWorkspaceDisplayTitle(heading).slice(0, 72);
  const browserTitle = text.match(/^\s*-\s*Browser Title:\s*(.+)$/mi)?.[1]?.trim();
  return normalizeWorkspaceDisplayTitle(stripMarkdown(browserTitle || '')).slice(0, 72);
}

function normalizeWorkspaceDisplayTitle(value = '') {
  const title = String(value || '').trim();
  const repoWorkspace = title.match(/^tiinex\/([^—-]+?)\s*(?:—|-)\s*workspace$/i);
  if (!repoWorkspace) return title;
  const repo = repoWorkspace[1].trim();
  return `Tiinex ${repo.slice(0, 1).toUpperCase()}${repo.slice(1)}`;
}

function stripMarkdown(value = '') { return String(value || '').replace(/[*_`]/g, '').trim(); }
