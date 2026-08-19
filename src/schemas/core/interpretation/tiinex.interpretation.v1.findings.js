export const interpretationFindings = Object.freeze({
  namespace: 'tiinex.interpretation.v1',
  defaultSeverity: 'info',
  codes: Object.freeze({
    'interpretation.schema.mismatch': finding('warning', 'manual'),
    'interpretation.title.missing': finding('error', 'manual'),
    'interpretation.section.missing': finding('error', 'manual'),
    'interpretation.field.missing': finding('error', 'manual'),
    'interpretation.contract.readable': finding('info', 'none')
  })
});
function finding(severity, fixability) { return Object.freeze({ severity, messageKey: '', fixability }); }
