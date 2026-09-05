const requiredSections = ['Supported Claim Or Question', 'Provenance', 'Evidence Material', 'Preservation And Fidelity', 'Interpretation Limits'];

export function evidenceValidate(artifact) {
  const findings = [];
  for (const section of requiredSections) {
    if (!artifact.body.sections.includes(section)) findings.push({ severity: 'error', code: 'evidence.section.missing', messageKey: 'evidence.section.missing', message: `Missing required evidence section: ${section}.`, source: 'tiinex.evidence.v1', params: { section }, fixability: 'manual' });
  }
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'evidence.sections.present', messageKey: 'evidence.sections.present', message: 'Required evidence sections are present at scaffold validation depth.', source: 'tiinex.evidence.v1' });
  return findings;
}
