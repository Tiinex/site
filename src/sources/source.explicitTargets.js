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
