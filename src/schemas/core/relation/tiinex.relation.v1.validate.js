import { RELATION_DECLARATION_FIELDS, RELATION_REQUIRED_SECTIONS } from './tiinex.relation.v1.contract.js';

export function relationValidate(artifact = {}) {
  const findings = [];
  if (artifact?.envelope?.current?.schema?.id !== 'tiinex.relation.v1') {
    return [finding('warning', 'relation.schema.mismatch', 'Relation validator invoked for non-relation current schema.')];
  }
  const body = String(artifact?.body?.text || '');
  const sections = new Set(Array.isArray(artifact?.body?.sections) ? artifact.body.sections : []);
  if (!artifact?.body?.title) findings.push(finding('error', 'relation.title.missing', 'Relation artifact should begin with a human-readable title.'));
  for (const section of RELATION_REQUIRED_SECTIONS) {
    if (!sections.has(section)) findings.push(finding('error', 'relation.section.missing', `Relation body is missing required ${section} section.`, { section }));
  }
  for (const field of RELATION_DECLARATION_FIELDS) {
    if (!fieldValue(body, field)) findings.push(finding('error', 'relation.field.missing', `Relation Declaration is missing ${field}.`, { field }));
  }
  const boundary = sectionBody(body, 'Relation Boundary');
  if (boundary && !/not\s+(?:the\s+)?(?:tiinex\s+continuity\s+)?parent/i.test(boundary)) {
    findings.push(finding('error', 'relation.boundary.parent-confusion', 'Relation Boundary must explicitly preserve that the relation target is not Parent.'));
  }
  if (!findings.some((item) => item.severity === 'error')) {
    findings.push(finding('info', 'relation.contract.readable', 'Relation body exposes the required typed non-parent relation contract.'));
  }
  return findings;
}

function fieldValue(body = '', field = '') {
  const escaped = String(field).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(body).match(new RegExp(`^\\s*-\\s*${escaped}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
}
function sectionBody(body = '', name = '') {
  const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(body).match(new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|^#\\s+Continuity Integrity\\s*$|(?![\\s\\S]))`, 'm'));
  return match?.[1]?.trim() || '';
}
function finding(severity, code, message, params = {}) { return { severity, code, messageKey: code, message, source: 'tiinex.relation.v1', params }; }
