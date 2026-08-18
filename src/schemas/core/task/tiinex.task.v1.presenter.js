export function taskPresent(artifact, context = {}) {
  return {
    title: artifact?.title || 'Task',
    summary: artifact?.summary || 'Canonical Task artifact.',
    badges: ['concrete', 'tiinex.task.v1'],
    disclosure: context.degraded ? 'degraded' : 'normal'
  };
}
