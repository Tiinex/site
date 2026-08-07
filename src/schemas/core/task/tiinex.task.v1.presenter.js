export function taskPresent(artifact, context = {}) {
  return {
    title: artifact?.title || 'Task',
    summary: artifact?.summary || 'Browser-local task draft.',
    badges: ['concrete', 'tiinex.task.v1'],
    disclosure: context.degraded ? 'degraded' : 'normal'
  };
}
