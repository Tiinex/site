export function normalizeExplicitFileRefs(value = []) {
  const items = Array.isArray(value) ? value : String(value || '').split(/\r?\n/);
  const out = [];
  const seen = new Set();
  for (const item of items) {
    const ref = String(item?.ref ?? item ?? '').trim();
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    out.push(ref);
  }
  return Object.freeze(out);
}

export function explicitFileRefsText(value = []) {
  return normalizeExplicitFileRefs(value).join('\n');
}

export const WEB_MARKDOWN_SOURCE_TARGET_KIND = 'web.markdown';

export function normalizeExternalWebArtifactUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return /^https?:$/i.test(url.protocol) ? url.href : '';
  } catch (_) { return ''; }
}

export function explicitWebArtifactSourceTarget(inputTarget = '', materializedTarget = '') {
  const input = normalizeExternalWebArtifactUrl(inputTarget);
  const raw = normalizeExternalWebArtifactUrl(materializedTarget || inputTarget);
  if (!input || !raw) return null;
  return Object.freeze({ targetKind: WEB_MARKDOWN_SOURCE_TARGET_KIND, inputTarget: input, rawUrl: raw });
}

export function externalWebArtifactUrl(record = {}) {
  const source = record?.source || {};
  const target = record?.sourceTarget || {};
  const mode = String(record?.sourceMode || '').toLowerCase();
  const adapterId = String(source.adapterId || '').toLowerCase();
  const sourceKind = String(source.sourceKind || source.kind || '').toLowerCase();
  const targetKind = String(target.targetKind || '').toLowerCase();
  const webShaped = targetKind === WEB_MARKDOWN_SOURCE_TARGET_KIND
    || sourceKind === WEB_MARKDOWN_SOURCE_TARGET_KIND
    || (adapterId === 'web' && sourceKind.includes('web'))
    || (mode === 'explicit-url' && targetKind === WEB_MARKDOWN_SOURCE_TARGET_KIND);
  if (!webShaped) return '';
  return normalizeExternalWebArtifactUrl(target.inputTarget || source.url || target.rawUrl || '');
}
