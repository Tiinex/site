export function relationPresent(artifact = {}, context = {}) {
  return { title: artifact?.title || 'Relation', summary: artifact?.summary || 'Typed non-parent relation.', badges: ['concrete','tiinex.relation.v1'], disclosure: context.degraded ? 'degraded' : 'normal' };
}
