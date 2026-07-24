export function rootValidate(artifact) {
  const findings = [];
  const envelope = artifact?.envelope || {};
  const parent = envelope.parent || {};
  const current = envelope.current || {};
  if (!artifact.hasContinuityContext) findings.push(error('root.continuity.missing', 'Missing # Continuity Context.'));
  if (!envelope.envelopeSchema?.id) findings.push(error('root.envelopeSchema.missing', 'Missing Envelope Schema.'));
  if (!current.schema?.id) findings.push(error('root.currentSchema.missing', 'Missing Current -> Current Schema.'));
  if (!current.createdAt) findings.push(error('root.createdAt.missing', 'Missing Current -> Created At.'));
  if (!artifact.hasIntegrity) findings.push(warning('root.integrity.missing', 'Missing Continuity Integrity footer.'));

  const hasParent = Boolean(parent.schema?.id || parent.createdAt || parent.trace || parent.origin);
  if (!hasParent) {
    findings.push(info('root.parent.absent', 'No parent edge declared; artifact is local lineage root unless another relation says otherwise.'));
  } else {
    if (!parent.schema?.id) findings.push(warning('root.parent.schema.missing', 'Parent edge is present but Parent Schema is missing.'));
    if (!parent.trace) findings.push(warning('root.parent.trace.missing', 'Parent edge is present but Trace is missing; lineage traversal will be degraded.'));
    if (!parent.origin) findings.push(warning('root.parent.origin.missing', 'Parent edge is present but Origin is missing; recovery will rely on other hints.'));
  }
  if (envelope.repairsDeclared) findings.push(info('root.repairs.declared', 'Envelope declares repair notes; validators should preserve unknown repair fields.'));
  if (!findings.some((finding) => finding.severity === 'error')) findings.push(info('root.envelope.readable', 'Root envelope is readable at current validation depth.'));
  return findings;
}

export function rootFallbackFinding(schemaId) {
  return warning('root.fallback.used', `Schema module unavailable for ${schemaId || 'missing schema'}; root/envelope semantics only. Unknown child schema fields are preserved, not interpreted.`);
}

function finding(severity, code, message) { return { severity, code, message, source: 'tiinex.root.v1' }; }
function error(code, message) { return finding('error', code, message); }
function warning(code, message) { return finding('warning', code, message); }
function info(code, message) { return finding('info', code, message); }
