export function resolveSource(source) {
  if (!source) return { kind: 'draft', githubPolicy: 'not-guessed' };
  if (source.kind === 'github-source-backed' && !source.permalink) return { ...source, kind: 'draft', githubPolicy: 'not-guessed' };
  return source;
}
