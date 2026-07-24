export const topicFindings = Object.freeze({
  namespace: 'tiinex.topic.v1',
  defaultSeverity: 'info',
  codes: Object.freeze({
    'topic.schema.mismatch': finding('topic.schema.mismatch', 'warning', 'none'),
    'topic.title.missing': finding('topic.title.missing', 'error', 'safe'),
    'topic.body.thin': finding('topic.body.thin', 'warning', 'manual'),
    'topic.body.readable': finding('topic.body.readable', 'info', 'none')
  })
});
function finding(messageKey, severity, fixability) { return Object.freeze({ severity, messageKey, fixability }); }
