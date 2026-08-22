import { parseNamedDeclarationSection } from '../schema/named.declarations.js';

export const PORTABLE_HANDOFF_MATERIAL_REQUIREMENTS_SCHEMA_ID = 'tiinex.portable.handoff-material-requirements.v1';

export function projectHandoffMaterialRequirements(handoff = {}) {
  const markdown = String(handoff.markdown || handoff.content || handoff.text || '');
  const findings = [];
  const required = projectSection(markdown, '## Required Context', 'required', findings);
  const reference = projectSection(markdown, '## Reference Context', 'reference', findings);
  return deepFreeze({
    schema: PORTABLE_HANDOFF_MATERIAL_REQUIREMENTS_SCHEMA_ID,
    handoff: Object.freeze({
      id: String(handoff.id || handoff.path || ''),
      path: String(handoff.path || ''),
      reference: String(handoff.reference || handoff.permalink || ''),
      semanticStatus: String(handoff.semanticStatus || handoff.validation?.status || 'unknown')
    }),
    required,
    reference,
    counts: Object.freeze({ required: required.length, reference: reference.length }),
    findings: Object.freeze(findings)
  });
}

function projectSection(markdown, heading, classification, findings) {
  const parsed = parseNamedDeclarationSection(markdown, heading);
  findings.push(...(parsed.findings || []).map((item) => finding('warning', `portable.handoff-material.${classification}.parse.${item.code || 'finding'}`, 'Handoff context declaration parsing reported a structural finding.', { classification, ...item })));
  const out = [];
  for (const entry of parsed.entries || []) {
    if (String(entry.name || '').trim().toLowerCase() === 'none') continue;
    const fields = entry.fields || {};
    const rawReference = String(fields['Material Reference'] || '').trim();
    const reference = parseMaterialReference(rawReference);
    out.push(Object.freeze({
      id: `${classification}:${safeToken(entry.name)}`,
      name: String(entry.name || ''),
      classification,
      material: String(fields.Material || ''),
      purpose: String(fields.Purpose || ''),
      availability: String(fields.Availability || 'unknown'),
      materialReference: rawReference,
      reference,
      source: entry.source || null,
      fields: Object.freeze({ ...fields })
    }));
  }
  return Object.freeze(out);
}

export function parseMaterialReference(value = '') {
  const raw = String(value || '').trim();
  const link = raw.match(/^\[([^\]\r\n]+)\]\(([^)\s]+)\)$/);
  if (link) return Object.freeze({ form: 'markdown-link', raw, label: link[1], target: link[2], exactTargetDeclared: true });
  return Object.freeze({ form: raw ? 'opaque' : 'absent', raw, label: '', target: raw, exactTargetDeclared: false });
}

function safeToken(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'material';
}
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
