import { rootValidate } from '../../root.validate.js';

const requiredSections = ['Preserved Material', 'Preservation Act', 'Provenance', 'Fidelity And Loss', 'Custody Or Storage Boundary', 'Interpretation Limits'];

export function preservationValidate(artifact) {
  const findings = rootValidate(artifact);
  for (const section of requiredSections) {
    if (!artifact.body.sections.includes(section)) findings.push({ severity: 'error', code: 'preservation.section.missing', message: `Missing required preservation section: ${section}.`, source: 'tiinex.preservation.v1' });
  }
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'preservation.sections.present', message: 'Required preservation sections are present.', source: 'tiinex.preservation.v1' });
  return findings;
}
