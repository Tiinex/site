const requiredSections = ['Supported Claim Or Question', 'Provenance', 'Evidence Material', 'Preservation And Fidelity', 'Interpretation Limits'];

export function evidenceValidate(artifact) {
  const findings = [];
  for (const section of requiredSections) {
    if (!artifact.body.sections.includes(section)) findings.push({ severity: 'error', code: 'evidence.section.missing', messageKey: 'evidence.section.missing', message: `Missing required evidence section: ${section}.`, source: 'tiinex.evidence.v1', params: { section }, fixability: 'manual' });
  }
  if (!artifact.envelope.parent.schema.id) findings.push({ severity: 'warning', code: 'evidence.preservation.parent.unresolved', messageKey: 'evidence.preservation.parent.unresolved', message: 'Evidence is preservation-specialized; no parent preservation edge is declared in the envelope.', source: 'tiinex.evidence.v1' });
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'evidence.sections.present', messageKey: 'evidence.sections.present', message: 'Required evidence sections are present at scaffold validation depth.', source: 'tiinex.evidence.v1' });
  return findings;
}
