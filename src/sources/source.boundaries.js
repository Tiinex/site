export function resolveSourceBoundary(source = {}) {
  const kind = source.kind || 'draft';
  return {
    kind,
    label: source.label || kind,
    sourceBacked: kind === 'github-source-backed' && Boolean(source.permalink),
    githubPolicy: kind === 'github-source-backed' && source.permalink ? 'explicit' : 'not-guessed',
    disclosure: source.boundary || 'source boundary unavailable'
  };
}

export function mustNotGuessGithubSource(source = {}) {
  return source.kind !== 'github-source-backed' || Boolean(source.permalink);
}
