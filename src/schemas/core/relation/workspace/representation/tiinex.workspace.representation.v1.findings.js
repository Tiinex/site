export const workspaceRepresentationFindings = Object.freeze({ namespace: 'tiinex.workspace.representation.v1', defaultSeverity: 'info', codes: Object.freeze({
  'workspace-representation.schema.mismatch': finding('warning','manual'),
  'workspace-representation.title.missing': finding('error','manual'),
  'workspace-representation.section.missing': finding('error','manual'),
  'workspace-representation.field.missing': finding('error','manual'),
  'workspace-representation.field.domain-invalid': finding('error','manual'),
  'workspace-representation.endpoint.workspace-invalid': finding('error','manual'),
  'workspace-representation.endpoint.payload-invalid': finding('error','manual'),
  'workspace-representation.mapping.manifest-missing': finding('error','manual'),
  'workspace-representation.binding.verified-incomplete': finding('error','manual'),
  'workspace-representation.contract.readable': finding('info','none')
}) });
function finding(severity, fixability) { return Object.freeze({ severity, messageKey: '', fixability }); }
