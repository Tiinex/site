import {
  WORKSPACE_REPRESENTATION_FIXED_VALUES,
  WORKSPACE_REPRESENTATION_READY_CONTRACTS,
  WORKSPACE_REPRESENTATION_REQUIRED_FIELDS,
  WORKSPACE_REPRESENTATION_REQUIRED_SECTIONS,
  WORKSPACE_REPRESENTATION_SCOPE_FIELDS
} from './tiinex.workspace.representation.v1.contract.js';

export function workspaceRepresentationValidate(artifact = {}) {
  const findings = [];
  if (artifact?.envelope?.current?.schema?.id !== 'tiinex.workspace.representation.v1') {
    return [finding('warning', 'workspace-representation.schema.mismatch', 'Workspace Representation validator invoked for another current schema.')];
  }
  const body = String(artifact?.body?.text || '');
  const sections = new Set(Array.isArray(artifact?.body?.sections) ? artifact.body.sections : []);
  if (!artifact?.body?.title) findings.push(finding('error', 'workspace-representation.title.missing', 'Workspace Representation artifact should begin with a human-readable title.'));
  for (const section of WORKSPACE_REPRESENTATION_REQUIRED_SECTIONS) {
    if (!sections.has(section) && !sectionBody(body, section)) findings.push(finding('error', 'workspace-representation.section.missing', `Workspace Representation body is missing required ${section} section.`, { section }));
  }
  for (const [section, fields] of Object.entries(WORKSPACE_REPRESENTATION_REQUIRED_FIELDS)) {
    const text = sectionBody(body, section);
    for (const field of fields) if (!fieldValue(text, field)) findings.push(finding('error', 'workspace-representation.field.missing', `${section} is missing ${field}.`, { section, field }));
  }
  const binding = sectionBody(body, 'Representation Binding');
  const scope = sectionBody(body, 'Representation Scope');
  const correlation = sectionBody(body, 'Representation Correlation');
  const qualification = sectionBody(body, 'Provider Qualification');
  const coverage = fieldValue(binding, 'Coverage');
  const bindingState = fieldValue(binding, 'Binding State');

  if (coverage === 'bounded') {
    if (!scope) findings.push(finding('error', 'workspace-representation.scope.missing', 'Coverage: bounded requires an explicit Representation Scope section.'));
    for (const field of WORKSPACE_REPRESENTATION_SCOPE_FIELDS) {
      if (!fieldValue(scope, field)) findings.push(finding('error', 'workspace-representation.scope.field-missing', `Representation Scope is missing ${field}.`, { field }));
    }
  }

  for (const [field, allowed] of Object.entries(WORKSPACE_REPRESENTATION_FIXED_VALUES)) {
    const value = fieldValue(body, field);
    if (value && !allowed.includes(value)) findings.push(finding('error', 'workspace-representation.field.domain-invalid', `${field} is outside the canonical Workspace Representation domain.`, { field, value }));
  }

  const workspaceTarget = fieldValue(binding, 'Workspace Artifact');
  const payloadTarget = fieldValue(binding, 'Representation Payload');
  if (workspaceTarget && !markdownTarget(workspaceTarget)) findings.push(finding('error', 'workspace-representation.endpoint.workspace-invalid', 'Workspace Artifact must be one explicit Markdown-link endpoint.'));
  if (payloadTarget && !markdownTarget(payloadTarget)) findings.push(finding('error', 'workspace-representation.endpoint.payload-invalid', 'Representation Payload must be one explicit Markdown-link endpoint.'));
  if (fieldValue(correlation, 'Path Mapping') === 'manifest' && !markdownTarget(fieldValue(correlation, 'Mapping Manifest'))) findings.push(finding('error', 'workspace-representation.mapping.manifest-missing', 'Path Mapping: manifest requires one explicit Mapping Manifest reference.'));

  if (bindingState === 'verified' && !['complete', 'bounded'].includes(coverage)) {
    findings.push(finding('error', 'workspace-representation.binding.verified-nonready-coverage', 'A verified binding cannot claim partial or unknown coverage.'));
  }
  const ready = WORKSPACE_REPRESENTATION_READY_CONTRACTS[coverage];
  if (ready) {
    const observed = {
      representationKind: fieldValue(binding, 'Representation Kind'),
      activationRule: fieldValue(qualification, 'Activation Rule'),
      coverageRequirement: fieldValue(qualification, 'Coverage Requirement'),
      selectionRule: fieldValue(qualification, 'Selection Rule')
    };
    for (const [key, expected] of Object.entries(ready)) {
      if (observed[key] && observed[key] !== expected) findings.push(finding('error', 'workspace-representation.ready-contract.mismatch', `Coverage: ${coverage} requires ${key}=${expected}.`, { coverage, field: key, expected, observed: observed[key] }));
    }
  }
  if (!findings.some((item) => item.severity === 'error')) findings.push(finding('info', 'workspace-representation.contract.readable', 'Workspace Representation exposes the exact canonical complete-or-bounded binding, scope, correlation, qualification, and boundary contract.'));
  return findings;
}

function fieldValue(body = '', field = '') {
  const escaped = escapeRe(field);
  return String(body).match(new RegExp(`^\\s*-\\s*${escaped}:\\s*(.+)$`, 'mi'))?.[1]?.trim() || '';
}
function sectionBody(body = '', name = '') {
  const match = new RegExp(`^##\\s+${escapeRe(name)}\\s*$([\\s\\S]*?)(?=^##\\s+|^#\\s+Continuity Integrity\\s*$|(?![\\s\\S]))`, 'm').exec(String(body || ''));
  return match?.[1]?.trim() || '';
}
function markdownTarget(value = '') { return String(value || '').match(/^\[[^\]]+\]\(([^)]+)\)$/)?.[1] || ''; }
function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'); }
function finding(severity, code, message, params = {}) { return { severity, code, messageKey: code, message, source: 'tiinex.workspace.representation.v1', params }; }
