export const evidenceFindings = Object.freeze({
  namespace: 'tiinex.evidence.v1',
  defaultSeverity: 'info',
  codes: Object.freeze({
    'evidence.section.missing': finding('evidence.section.missing', 'error', 'manual'),
    'evidence.sections.present': finding('evidence.sections.present', 'info', 'none')
  })
});
function finding(messageKey, severity, fixability) { return Object.freeze({ severity, messageKey, fixability }); }
