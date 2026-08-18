export const taskFindings = Object.freeze({
  namespace: 'tiinex.task.v1',
  defaultSeverity: 'info',
  codes: Object.freeze({
    'task.schema.mismatch': finding('task.schema.mismatch', 'warning', 'none'),
    'task.title.missing': finding('task.title.missing', 'error', 'safe'),
    'task.objective.missing': finding('task.objective.missing', 'error', 'manual'),
    'task.doneCriteria.missing': finding('task.doneCriteria.missing', 'error', 'manual'),
    'task.scope.missing': finding('task.scope.missing', 'error', 'manual'),
    'task.dependencies.missing': finding('task.dependencies.missing', 'error', 'manual'),
    'task.legacyShape.observed': finding('task.legacyShape.observed', 'warning', 'manual'),
    'task.legacyShape.incomplete': finding('task.legacyShape.incomplete', 'error', 'manual'),
    'task.legacyShape.readable': finding('task.legacyShape.readable', 'info', 'none'),
    'task.body.thin': finding('task.body.thin', 'warning', 'manual'),
    'task.body.canonical': finding('task.body.canonical', 'info', 'none')
  })
});
function finding(messageKey, severity, fixability) { return Object.freeze({ severity, messageKey, fixability }); }
