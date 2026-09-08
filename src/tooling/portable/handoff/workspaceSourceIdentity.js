export function parseWorkspaceEntrypoints(markdown = '') {
  const body = section(markdown, 'Workspace Entrypoints');
  if (!body) return Object.freeze([]);
  const chunks = body.split(/(?=^###\s+)/m).map((item) => item.trim()).filter(Boolean);
  const out = [];
  for (const chunk of chunks) {
    const heading = chunk.match(/^###\s+(.+)$/m)?.[1]?.trim() || '';
    const sourceKind = field(chunk, 'Source Kind');
    const repository = field(chunk, 'Repository');
    const ref = field(chunk, 'Ref');
    const rootPath = field(chunk, 'Root Path');
    if (!heading && !sourceKind && !repository && !ref && !rootPath) continue;
    out.push(Object.freeze({
      label: heading,
      sourceKind,
      repository,
      ref,
      rootPath,
      remoteState: 'not-checked',
      basis: 'qualified-durable-workspace-entrypoint'
    }));
  }
  return Object.freeze(out);
}

export function normalizeRepositoryIdentity(value = '') {
  let text = String(value || '').trim().replace(/\\/g, '/');
  if (!text) return '';
  text = text.replace(/^git\+/, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  const scp = text.match(/^[^@\s]+@[^:\s]+:(.+)$/);
  if (scp) text = scp[1];
  else {
    try {
      const url = new URL(text);
      text = url.pathname.replace(/^\/+/, '');
    } catch {
      text = text.replace(/^https?:\/\/[^/]+\//i, '').replace(/^ssh:\/\/[^/]+\//i, '');
    }
  }
  return text.replace(/^\/+/, '').replace(/\.git$/i, '').toLowerCase();
}

function section(markdown = '', heading = '') {
  const escaped = escapeRe(heading);
  return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || '';
}
function field(markdown = '', label = '') {
  const escaped = escapeRe(label);
  return strip(String(markdown || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+)$`, 'mi'))?.[1] || '');
}
function strip(value = '') { return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').replace(/[`*_]/g, '').trim(); }
function escapeRe(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
