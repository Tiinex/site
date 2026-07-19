export function rootValidate(artifact) {
  const findings = [];
  if (!artifact.hasContinuityContext) findings.push(error('root.continuity.missing', 'Missing # Continuity Context.'));
  if (!artifact.envelope.envelopeSchema.id) findings.push(error('root.envelopeSchema.missing', 'Missing Envelope Schema.'));
  if (!artifact.envelope.current.schema.id) findings.push(error('root.currentSchema.missing', 'Missing Current -> Current Schema.'));
  if (!artifact.envelope.current.createdAt) findings.push(error('root.createdAt.missing', 'Missing Current -> Created At.'));
  if (!artifact.hasIntegrity) findings.push(warning('root.integrity.missing', 'Missing Continuity Integrity footer.'));
  if (!artifact.envelope.parent.schema.id) findings.push(info('root.parent.absent', 'No parent edge declared; artifact is local lineage root unless another relation says otherwise.'));
  if (!findings.length) findings.push(info('root.envelope.readable', 'Root envelope is readable at scaffold validation depth.'));
  return findings;
}

export function rootFallbackFinding(schemaId) {
  return warning('root.fallback.used', `Schema module unavailable for ${schemaId || 'missing schema'}; root/envelope semantics only.`);
}

function finding(severity, code, message) { return { severity, code, message, source: 'tiinex.root.v1' }; }
function error(code, message) { return finding('error', code, message); }
function warning(code, message) { return finding('warning', code, message); }
function info(code, message) { return finding('info', code, message); }
