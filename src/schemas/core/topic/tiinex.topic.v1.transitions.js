export const topicTransitions = Object.freeze([
  Object.freeze({
    id: 'topic.continue.task',
    fromSchema: 'tiinex.topic.v1',
    intent: 'continue',
    resultSchema: 'tiinex.task.v1',
    label: 'Create task',
    shortLabel: 'Task',
    priority: 100,
    availability: Object.freeze({
      sourceModes: Object.freeze(['local-*', 'source-backed']),
      parentKinds: Object.freeze(['loaded-record']),
      requiresEditableParent: false
    }),
    resultBoundary: Object.freeze({
      mode: 'browser-local-draft',
      sourceMutation: 'none',
      remoteWrite: false,
      mayInheritParentSource: false
    }),
    presentation: Object.freeze({
      group: 'Continue',
      placement: 'primary',
      variant: 'icon-only',
      icon: 'task',
      tooltip: 'Continue · Create task',
      ariaLabel: 'Continue: Create task',
      mobileLabel: 'Create task'
    })
  })
]);
