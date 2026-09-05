import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

export function parseStandaloneInheritanceRecord(input = '') {
  const markdown = typeof input === 'string' ? input : String(input?.markdown || '');
  let parsed;
  try { parsed = parseArtifactMarkdown(markdown); }
  catch { return blocked('Standalone inheritance record could not be parsed as a Tiinex artifact.'); }
  if (String(parsed?.envelope?.current?.schema?.id || '') !== 'tiinex.schema.inheritance.v1') return blocked('Standalone inheritance record Current Schema must be tiinex.schema.inheritance.v1.');

  const sections = secondLevelSections(markdown);
  const identity = scalarFields(sections.get('Inheritance Identity') || '');
  const parent = scalarFields(sections.get('Parent Contract') || '');
  const child = scalarFields(sections.get('Child Contract') || '');
  const mergeRules = repeatedRecords(sections.get('Merge Rules') || '');
  const findings = [];
  requireField(findings, identity, 'Inheritance Handle');
  requireExact(findings, identity, 'Inheritance Kind', 'override');
  requireField(findings, parent, 'Parent Schema');
  requireField(findings, parent, 'Parent Contract Nodes');
  requireExact(findings, parent, 'Parent Resolution State', 'resolved');
  requireField(findings, child, 'Child Schema');
  requireField(findings, child, 'Child Contract Nodes');
  requireExact(findings, child, 'Child Resolution State', 'resolved');
  if (!mergeRules.length) findings.push('Standalone inheritance record must declare at least one Merge Rules record.');

  const rules = [];
  for (const record of mergeRules) {
    const operation = String(record.fields['Merge Operation'] || '').trim();
    if (operation !== 'override') findings.push(`Merge Rules record ${record.name || '(unnamed)'} must use explicit Merge Operation: override.`);
    for (const field of ['Applies To', 'Parent Node', 'Child Node']) if (!record.fields[field]) findings.push(`Merge Rules record ${record.name || '(unnamed)'} is missing ${field}.`);
    if (record.fields['Parent Node'] && record.fields['Parent Node'] !== parent['Parent Contract Nodes']) findings.push(`Merge Rules record ${record.name || '(unnamed)'} Parent Node must exactly match Parent Contract Nodes.`);
    if (record.fields['Child Node'] && record.fields['Child Node'] !== child['Child Contract Nodes']) findings.push(`Merge Rules record ${record.name || '(unnamed)'} Child Node must exactly match Child Contract Nodes.`);
    rules.push(Object.freeze({ name: record.name, operation, parentNode: record.fields['Parent Node'] || '', childNode: record.fields['Child Node'] || '', appliesTo: record.fields['Applies To'] || '' }));
  }
  if (findings.length) return Object.freeze({ state: 'unresolved', findings: Object.freeze(findings), rules: Object.freeze([]) });
  return Object.freeze({
    state: 'qualified',
    findings: Object.freeze([]),
    handle: identity['Inheritance Handle'],
    parentSchemaId: parent['Parent Schema'],
    parentNode: parent['Parent Contract Nodes'],
    childSchemaId: child['Child Schema'],
    childNode: child['Child Contract Nodes'],
    rules: Object.freeze(rules)
  });
}

function secondLevelSections(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const out = new Map(); let title = ''; let body = []; let fenced = false;
  const flush = () => { if (title) out.set(title, body.join('\n').trim()); body = []; };
  for (const line of lines) {
    if (/^\s*```/.test(line)) { fenced = !fenced; if (title) body.push(line); continue; }
    if (!fenced) { const match = line.match(/^##\s+(.+?)\s*$/); if (match) { flush(); title = match[1].trim(); continue; } }
    if (title) body.push(line);
  }
  flush(); return out;
}
function scalarFields(text = '') {
  const out = {};
  for (const line of String(text || '').split('\n')) { const match = line.match(/^([A-Za-z][A-Za-z0-9 _+-]{0,80}):\s*(.*?)\s*$/); if (match) out[match[1].trim()] = match[2].trim(); }
  return out;
}
function repeatedRecords(text = '') {
  const records = []; let current = null;
  const flush = () => { if (current) records.push(Object.freeze({ name: current.name, fields: Object.freeze({ ...current.fields }) })); current = null; };
  for (const line of String(text || '').split('\n')) {
    const top = line.match(/^-\s+(.+?)\s*$/); if (top) { flush(); current = { name: top[1].trim(), fields: {} }; continue; }
    if (!current) continue;
    const field = line.match(/^\s{2,}-\s*([A-Za-z][A-Za-z0-9 _+-]{0,80}):\s*(.*?)\s*$/); if (field) current.fields[field[1].trim()] = field[2].trim();
  }
  flush(); return records;
}
function requireField(findings, fields, name) { if (!String(fields?.[name] || '').trim()) findings.push(`Standalone inheritance record is missing ${name}.`); }
function requireExact(findings, fields, name, expected) { if (String(fields?.[name] || '').trim() !== expected) findings.push(`Standalone inheritance record ${name} must be exactly ${expected}.`); }
function blocked(message) { return Object.freeze({ state: 'unresolved', findings: Object.freeze([message]), rules: Object.freeze([]) }); }
