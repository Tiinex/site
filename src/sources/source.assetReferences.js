export const SOURCE_ASSET_REFERENCE_SCHEMA_ID = 'tiinex.source.assetReference.discovery.v1';

const ASSET_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i;

export function collectSourceAssetReferences(records = [], options = {}) {
  const source = options.source || {};
  const available = new Set((Array.isArray(options.availablePaths) ? options.availablePaths : []).map((item) => canonicalPath(item)).filter(Boolean));
  const references = [];
  for (const record of Array.isArray(records) ? records : []) {
    const markdown = String(record?.markdown || '');
    if (!markdown) continue;
    for (const ref of extractMarkdownAssetRefs(markdown)) {
      const normalized = normalizeAssetReference(ref.target, record, source);
      if (!normalized) continue;
      const loaded = available.has(normalized.path);
      references.push(Object.freeze({
        schema: SOURCE_ASSET_REFERENCE_SCHEMA_ID,
        recordId: record.id || '',
        recordPath: record.path || '',
        raw: ref.target,
        label: ref.label || '',
        path: normalized.path,
        kind: normalized.kind,
        status: normalized.blocked ? 'blocked' : (loaded ? 'loaded' : 'referenced-unloaded'),
        boundary: normalized.boundary
      }));
    }
  }
  const counts = references.reduce((acc, item) => {
    acc.total += 1;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { total: 0, loaded: 0, 'referenced-unloaded': 0, missing: 0, blocked: 0 });
  return Object.freeze({ schema: SOURCE_ASSET_REFERENCE_SCHEMA_ID, references: Object.freeze(references), counts: Object.freeze(counts) });
}

export function extractMarkdownAssetRefs(markdown = '') {
  const text = String(markdown || '');
  const refs = [];
  const imageRe = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const linkRe = /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlImgRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of text.matchAll(imageRe)) pushIfAsset(refs, match[2], match[1]);
  for (const match of text.matchAll(linkRe)) pushIfAsset(refs, match[2], match[1]);
  for (const match of text.matchAll(htmlImgRe)) pushIfAsset(refs, match[1], 'img');
  return Object.freeze(refs.map((item) => Object.freeze(item)));
}

function pushIfAsset(out, target = '', label = '') {
  const clean = String(target || '').trim();
  if (!clean || clean.startsWith('#') || /^data:/i.test(clean)) return;
  const withoutQuery = clean.split(/[?#]/)[0];
  if (!ASSET_EXTENSIONS.test(withoutQuery)) return;
  out.push({ target: clean, label: String(label || '').trim() });
}

function normalizeAssetReference(target = '', record = {}, source = {}) {
  const raw = String(target || '').trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) {
    return { path: raw, kind: 'external', blocked: false, boundary: 'external asset reference; not fetched by source materialization' };
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(raw)) return null;
  const base = dirname(canonicalPath(record.path || ''));
  const path = canonicalPath([base, raw].filter(Boolean).join('/'));
  const roots = sourceRoots(source || record.source || {});
  const blocked = roots.length ? !roots.some((root) => path === root || path.startsWith(`${root}/`)) : false;
  return {
    path,
    kind: 'relative-source-asset',
    blocked,
    boundary: blocked
      ? 'relative asset reference resolves outside configured source root boundary'
      : 'relative asset reference inside configured source boundary; content not auto-fetched in this slice'
  };
}

function sourceRoots(source = {}) {
  return String(source.rootPath || source.config?.rootPath || '')
    .split(/\r?\n|,/)
    .map((item) => canonicalPath(item.trim().replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, '')))
    .filter((item) => item && item !== '.');
}

function dirname(path = '') {
  const parts = canonicalPath(path).split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}

function canonicalPath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    raw = url.hostname === 'raw.githubusercontent.com'
      ? url.pathname.split('/').filter(Boolean).slice(3).join('/')
      : url.pathname.replace(/^\/+/, '');
  } catch (error) {
    // not a URL
  }
  const out = [];
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}
