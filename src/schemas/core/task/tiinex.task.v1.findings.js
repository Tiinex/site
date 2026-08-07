export const taskFindings = Object.freeze({
  namespace: 'tiinex.task.v1',
  defaultSeverity: 'info',
  codes: Object.freeze({
    'task.schema.mismatch': finding('task.schema.mismatch', 'warning', 'none'),
    'task.title.missing': finding('task.title.missing', 'error', 'safe'),
    'task.body.thin': finding('task.body.thin', 'warning', 'manual'),
    'task.nextStep.missing': finding('task.nextStep.missing', 'warning', 'manual'),
    'task.body.readable': finding('task.body.readable', 'info', 'none')
  })
});
function finding(messageKey, severity, fixability) { return Object.freeze({ severity, messageKey, fixability }); }
