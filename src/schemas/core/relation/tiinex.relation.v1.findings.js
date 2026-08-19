export const relationFindings = Object.freeze({ namespace: 'tiinex.relation.v1', defaultSeverity: 'info', codes: Object.freeze({
  'relation.schema.mismatch': finding('warning','manual'),
  'relation.title.missing': finding('error','manual'),
  'relation.section.missing': finding('error','manual'),
  'relation.field.missing': finding('error','manual'),
  'relation.boundary.parent-confusion': finding('error','manual'),
  'relation.contract.readable': finding('info','none')
}) });
function finding(severity, fixability) { return Object.freeze({ severity, messageKey: '', fixability }); }
