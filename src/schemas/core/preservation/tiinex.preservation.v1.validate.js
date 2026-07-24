const requiredSections = ['Preserved Material', 'Preservation Act', 'Provenance', 'Fidelity And Loss', 'Custody Or Storage Boundary', 'Interpretation Limits'];

export function preservationValidate(artifact) {
  const findings = [];
  for (const section of requiredSections) {
    if (!artifact.body.sections.includes(section)) findings.push({ severity: 'error', code: 'preservation.section.missing', messageKey: 'preservation.section.missing', message: `Missing required preservation section: ${section}.`, source: 'tiinex.preservation.v1', params: { section }, fixability: 'manual' });
  }
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'preservation.sections.present', messageKey: 'preservation.sections.present', message: 'Required preservation sections are present.', source: 'tiinex.preservation.v1' });
  return findings;
}
