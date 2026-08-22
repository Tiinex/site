const runtimeOwnedBootstrapSources = new WeakSet();

export function markPortableBootstrapCanonicalSource(source = {}) {
  if (source && typeof source === 'object') runtimeOwnedBootstrapSources.add(source);
  return source;
}

export function hasPortableBootstrapCanonicalProvenance(source = null) {
  return Boolean(source && typeof source === 'object' && runtimeOwnedBootstrapSources.has(source));
}
