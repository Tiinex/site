export const rootFindings = Object.freeze({
  namespace: 'tiinex.root.v1',
  defaultSeverity: 'info',
  codes: Object.freeze({
    'root.continuity.missing': finding('root.continuity.missing', 'error', false),
    'root.envelopeSchema.missing': finding('root.envelopeSchema.missing', 'error', false),
    'root.currentSchema.missing': finding('root.currentSchema.missing', 'error', false),
    'root.createdAt.missing': finding('root.createdAt.missing', 'error', false),
    'root.integrity.missing': finding('root.integrity.missing', 'warning', false),
    'root.parent.absent': finding('root.parent.absent', 'info', false),
    'root.parent.schema.missing': finding('root.parent.schema.missing', 'warning', false),
    'root.parent.trace.missing': finding('root.parent.trace.missing', 'warning', false),
    'root.parent.origin.missing': finding('root.parent.origin.missing', 'warning', false),
    'root.repairs.declared': finding('root.repairs.declared', 'info', false),
    'root.envelope.readable': finding('root.envelope.readable', 'info', false),
    'root.fallback.used': finding('root.fallback.used', 'warning', false)
  })
});
function finding(messageKey, severity, safeFix) { return Object.freeze({ severity, messageKey, fixability: safeFix ? 'safe' : 'none' }); }
