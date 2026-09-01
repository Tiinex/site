import { parseNamedDeclarationSection } from '../schema/named.declarations.js';

export const PORTABLE_HANDOFF_MATERIAL_REQUIREMENTS_SCHEMA_ID = 'tiinex.portable.handoff-material-requirements.v1';

export function projectHandoffMaterialRequirements(handoff = {}) {
  const markdown = String(handoff.markdown || handoff.content || handoff.text || '');
  const findings = [];
  const required = projectSection(markdown, '## Required Context', 'required', findings);
  const reference = projectSection(markdown, '## Reference Context', 'reference', findings);
  const endpointRoles = projectEndpointRoleRequirements(markdown, findings);
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
    endpointRoles,
    dependencies: Object.freeze([]),
    counts: Object.freeze({ required: required.length, reference: reference.length, endpointRoles: endpointRoles.length, dependencies: 0 }),
    findings: Object.freeze(findings)
  });
}

export function projectParticipantRoleRequirements(participantRoles = [], scope = {}) {
  const routeWorkspaceId = String(scope.workspaceId || '').trim();
  const routePath = String(scope.routePath || scope.path || '').trim();
  const routeToken = safeToken(`${routeWorkspaceId}-${routePath}`);
  return Object.freeze((participantRoles || []).map((entry, index) => {
    const role = typeof entry === 'string' ? { reference: entry } : (entry || {});
    const targetWorkspaceId = String(role.workspaceId || role.targetWorkspaceId || '').trim();
    const targetPath = String(role.path || role.targetPath || '').trim();
    const rawReference = String(role.reference || role.referenceTarget || targetPath || '').trim();
    const reference = parseMaterialReference(rawReference);
    return Object.freeze({
      id: `participant-role:${routeToken}:${index + 1}`,
      name: String(role.label || role.roleLabel || `participant-role-${index + 1}`),
      classification: 'participant-role',
      roleLabel: String(role.label || role.roleLabel || ''),
      material: 'Role artifact required for package-local recipient grounding',
      purpose: 'package-local pre-Handoff Role grounding only; does not declare semantic participation',
      availability: 'declared',
      materialReference: rawReference,
      reference,
      routeWorkspaceId,
      routePath,
      targetWorkspaceId,
      targetPath,
      source: null,
      fields: Object.freeze({ RouteWorkspace: routeWorkspaceId, RoutePath: routePath, TargetWorkspace: targetWorkspaceId, TargetPath: targetPath, Reference: rawReference })
    });
  }));
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


function projectEndpointRoleRequirements(markdown, findings) {
  const section = sectionText(markdown, 'Handoff Parties');
  if (!section) return Object.freeze([]);
  const out = [];
  for (const side of ['From', 'To']) {
    const kind = field(section, `${side} Kind`).toLowerCase();
    const rawReference = field(section, `${side} Reference`);
    if (kind !== 'role' || !rawReference) continue;
    const reference = parseMaterialReference(rawReference);
    if (!reference.exactTargetDeclared) findings.push(finding('warning', 'portable.handoff-material.endpoint-role.reference-opaque', 'Role endpoint declares a Reference that is not an exact Markdown-link target.', { side: side.toLowerCase(), reference: rawReference }));
    out.push(Object.freeze({
      id: `endpoint-role:${side.toLowerCase()}`,
      name: field(section, side) || `${side} Role`,
      classification: 'endpoint-role',
      party: side.toLowerCase(),
      roleLabel: field(section, side),
      roleKind: kind,
      material: `${side} endpoint Role artifact`,
      purpose: 'cold-start endpoint Role grounding',
      availability: 'declared',
      materialReference: rawReference,
      reference,
      source: null,
      fields: Object.freeze({ Side: side, Role: field(section, side), Kind: kind, Reference: rawReference })
    }));
  }
  return Object.freeze(out);
}

function sectionText(markdown = '', heading = '') {
  const match = new RegExp(`^##\\s+${escapeRe(heading)}\\s*$`, 'mi').exec(String(markdown || ''));
  if (!match) return '';
  const rest = String(markdown || '').slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}
function field(section = '', name = '') {
  const match = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRe(name)}:\\s*(.+?)\\s*$`, 'mi'));
  return String(match?.[1] || '').trim();
}
function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

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
