export function interpretationPresent(artifact = {}, context = {}) {
  return {
    title: artifact?.title || 'Interpretation',
    summary: artifact?.summary || 'Explicit bounded interpretation of another artifact or target.',
    badges: ['concrete', 'tiinex.interpretation.v1'],
    disclosure: context.degraded ? 'degraded' : 'normal'
  };
}
