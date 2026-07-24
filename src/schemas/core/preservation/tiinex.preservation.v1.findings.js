export const preservationFindings = Object.freeze({
  namespace: 'tiinex.preservation.v1',
  defaultSeverity: 'info',
  codes: Object.freeze({
    'preservation.section.missing': finding('preservation.section.missing', 'error', 'manual'),
    'preservation.sections.present': finding('preservation.sections.present', 'info', 'none')
  })
});
function finding(messageKey, severity, fixability) { return Object.freeze({ severity, messageKey, fixability }); }
