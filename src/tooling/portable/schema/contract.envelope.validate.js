import { portableFinding } from '../findings.js';
import { qualifyResolvedMachineShape } from './contract.machine-shape.js';
import { qualifyReferenceShape } from '../../../schemas/reference.shapes.js';

export function validatePortableEnvelopeContract(markdown = '', compiled = {}) {
  const findings = [];
  const envelope = parseContinuityEnvelopeTree(markdown);
  validateConditionalRequirements(compiled, envelope, findings);
  validateFieldShapeRequirements(compiled, envelope, findings);
  return Object.freeze({ summary: envelope.summary, findings: Object.freeze(findings) });
}

function validateConditionalRequirements(compiled = {}, envelope = {}, findings = []) {
  for (const requirement of compiled.validation?.conditionalRequirements || []) {
    const conditions = (requirement.requiredWhen || []).map(parseExistsCondition);
    if (!conditions.length || conditions.some((condition) => !condition)) continue;
    const triggered = conditions.every((condition) => envelope.nodes.some((node) => node.label === condition.label));
    if (!triggered) continue;

    const scopes = envelope.nodes.filter((node) => node.path.join(' ') === String(requirement.name || ''));
    if (scopes.length !== 1) {
      findings.push(finding('error', scopes.length ? 'portable.contract.conditional.target.ambiguous' : 'portable.contract.conditional.target.missing', `${requirement.name} is required by ${requirement.requiredWhen.join('; ')} but its exact envelope target ${scopes.length ? 'is ambiguous' : 'is missing'}.`, scopes.length ? 'structurally-invalid' : 'incomplete', { group: requirement.name, occurrenceCount: scopes.length }));
      continue;
    }
    const scope = scopes[0];
    for (const field of requirement.requiredFields || []) {
      const occurrences = scope.children.filter((child) => child.label === field);
      if (!occurrences.length) findings.push(finding('error', 'portable.contract.conditional.field.required.missing', `Required field is missing from ${requirement.name}: ${field}.`, 'incomplete', { group: requirement.name, field }));
      else if (occurrences.length > 1) findings.push(finding('error', 'portable.contract.conditional.field.duplicate', `Required field occurs more than once in ${requirement.name}: ${field}.`, 'structurally-invalid', { group: requirement.name, field, occurrenceCount: occurrences.length }));
    }

    const allowedLabels = new Set((requirement.allowedLabels || []).map(exactToken));
    if (allowedLabels.size) {
      for (const child of scope.children) {
        if (allowedLabels.has(exactToken(child.label))) continue;
        findings.push(finding('preserve', 'portable.contract.conditional.label.unknown.preserved', `Unknown or extension label is preserved in ${requirement.name}: ${child.label}.`, 'preserve', { group: requirement.name, field: child.label }));
      }
    }

    validateConditionalEntryShapes(requirement, scope, compiled, findings);
    validateConditionalOrdering(requirement, scope, findings);
  }
}

function validateConditionalEntryShapes(requirement = {}, scope = {}, compiled = {}, findings = []) {
  const requested = (requirement.entryShapes || []).map(exactToken).filter(Boolean);
  if (!requested.length || !scope.children.length) return;
  const active = compiled.machineShapes?.active || [];
  const resolutions = requested.map((shapeLabel) => active.find((item) => exactToken(item.shapeLabel) === shapeLabel)).filter(Boolean);
  if (!resolutions.length) return;
  for (const child of scope.children) {
    const results = resolutions.map((resolution) => qualifyResolvedMachineShape(child.rawValue, resolution));
    if (results.some((result) => result.qualification === 'matched')) continue;
    if (results.some((result) => result.qualification === 'unresolved')) {
      findings.push(finding('warning', 'portable.contract.conditional.entry-shape.unresolved', `Entry shape cannot be fully qualified in ${requirement.name}: ${child.rawValue}.`, 'unresolved', { group: requirement.name, field: child.label, requestedShapes: requested }));
      continue;
    }
    findings.push(finding('error', 'portable.contract.conditional.entry-shape.no-match', `Entry does not satisfy the declared shape in ${requirement.name}: ${child.rawValue}.`, 'structurally-invalid', { group: requirement.name, field: child.label, requestedShapes: requested }));
  }
}

function validateConditionalOrdering(requirement = {}, scope = {}, findings = []) {
  const ordering = (requirement.ordering || []).map(exactToken).filter(Boolean);
  if (!ordering.length) return;
  const rank = new Map(ordering.map((label, index) => [label, index]));
  let previous = -1;
  for (const child of scope.children) {
    if (!rank.has(exactToken(child.label))) continue;
    const current = rank.get(exactToken(child.label));
    if (current < previous) {
      findings.push(finding('error', 'portable.contract.conditional.order.invalid', `Entry ordering in ${requirement.name} does not follow the declared Ordering contract.`, 'structurally-invalid', { group: requirement.name, ordering }));
      return;
    }
    previous = current;
  }
}

function validateFieldShapeRequirements(compiled = {}, envelope = {}, findings = []) {
  for (const requirement of compiled.validation?.fieldShapes || []) {
    const occurrences = envelope.nodes.filter((node) => node.label === requirement.field && node.value !== null);
    if (!occurrences.length) continue;
    for (const occurrence of occurrences) {
      const authorities = requirement.allowedShapeAuthorities || [];
      const evaluations = (requirement.allowedShapes || []).map((shapeLabel) => {
        const authority = authorities.find((item) => exactToken(item.shapeLabel) === exactToken(shapeLabel));
        const machine = authority ? qualifyResolvedMachineShape(occurrence.value, authority) : Object.freeze({ qualification: 'unresolved' });
        return machine.qualification === 'unresolved' ? qualifyReferenceShape(shapeLabel, occurrence.value) : machine;
      });
      if (evaluations.some((item) => item.qualification === 'matched')) continue;
      const unresolved = evaluations.some((item) => item.qualification === 'unresolved');
      if (unresolved) {
        findings.push(finding('warning', 'portable.contract.field-shape.unresolved', `${requirement.field} does not match a currently evaluable allowed shape and at least one declared shape authority is unresolved.`, 'unresolved', { group: requirement.group, field: requirement.field, value: occurrence.value, allowedShapes: requirement.allowedShapes || [] }));
      } else {
        findings.push(finding('error', 'portable.contract.field-shape.no-match', `${requirement.field} does not satisfy any declared allowed shape.`, 'structurally-invalid', { group: requirement.group, field: requirement.field, value: occurrence.value, allowedShapes: requirement.allowedShapes || [] }));
      }
    }
  }
}

function parseExistsCondition(value = '') {
  const match = String(value || '').match(/^(.+?) exists$/u);
  if (!match) return null;
  const label = exactToken(match[1]);
  return label ? Object.freeze({ kind: 'exists', label }) : null;
}

function parseContinuityEnvelopeTree(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const heading = lines.findIndex((line) => line === '# Continuity Context');
  if (heading < 0) return Object.freeze({ nodes: Object.freeze([]), roots: Object.freeze([]), summary: Object.freeze({ available: false, nodeCount: 0 }) });
  let end = lines.length;
  for (let index = heading + 1; index < lines.length; index += 1) {
    if (lines[index] === '---' || /^#\s+/.test(lines[index])) { end = index; break; }
  }
  const roots = [];
  const nodes = [];
  const stack = [];
  for (let index = heading + 1; index < end; index += 1) {
    const match = lines[index].match(/^(\s*)-\s+(.+?)\s*$/u);
    if (!match) continue;
    const indent = indentationWidth(match[1]);
    const parsed = parseEnvelopeItem(match[2]);
    while (stack.length && stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1) || null;
    const node = {
      label: parsed.label,
      value: parsed.value,
      rawValue: parsed.rawValue,
      form: parsed.form,
      indent,
      line: index + 1,
      parent,
      children: [],
      path: Object.freeze([...(parent?.path || []), parsed.label])
    };
    if (parent) parent.children.push(node); else roots.push(node);
    nodes.push(node);
    stack.push(node);
  }
  const freezeNode = (node) => Object.freeze({
    label: node.label,
    value: node.value,
    rawValue: node.rawValue,
    form: node.form,
    indent: node.indent,
    line: node.line,
    path: node.path,
    children: Object.freeze(node.children.map(freezeNode))
  });
  const frozenRoots = Object.freeze(roots.map(freezeNode));
  const flattened = [];
  const visit = (node) => { flattened.push(node); for (const child of node.children) visit(child); };
  for (const root of frozenRoots) visit(root);
  return Object.freeze({ nodes: Object.freeze(flattened), roots: frozenRoots, summary: Object.freeze({ available: true, nodeCount: flattened.length }) });
}

function parseEnvelopeItem(value = '') {
  const rawValue = String(value || '').trim();
  const link = rawValue.match(/^\[([^\]]+)\]\(([^)]+)\)$/u);
  if (link) return Object.freeze({ label: link[1], value: link[2], rawValue, form: 'markdown-link-entry' });
  const separator = rawValue.indexOf(':');
  if (separator >= 0) {
    const label = rawValue.slice(0, separator).trim();
    const fieldValue = rawValue.slice(separator + 1).trim();
    return Object.freeze({ label, value: fieldValue, rawValue: fieldValue, form: fieldValue ? 'field' : 'block' });
  }
  return Object.freeze({ label: rawValue, value: null, rawValue, form: 'block' });
}

function indentationWidth(value = '') {
  let width = 0;
  for (const char of String(value || '')) width += char === '\t' ? 4 : 1;
  return width;
}

function exactToken(value = '') { return String(value || '').trim(); }
function finding(severity, code, message, state, extra = {}) { return portableFinding(severity, code, message, { ...extra, state }); }
