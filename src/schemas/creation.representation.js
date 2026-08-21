import { C14N_V2_METHOD_ID } from '../integrity/integrity.c14nV2.js';

export function inspectCreationRepresentation(markdown = '', options = {}) {
  const text = String(markdown || '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const boundary = lines.findIndex((line) => line === '---');
  const envelopeLines = boundary >= 0 ? lines.slice(0, boundary) : lines.slice();
  const integrityHeadingIndexes = indexesOf(lines, (line) => line === '# Continuity Integrity');
  const integrityStart = integrityHeadingIndexes.length ? integrityHeadingIndexes[0] : lines.length;
  const bodyLines = boundary >= 0 ? lines.slice(boundary + 1, integrityStart) : [];
  const currentBlocks = topLevelListBlocks(envelopeLines, 'Current');
  const parentBlocks = topLevelListBlocks(envelopeLines, 'Parent');
  const boundSections = [...new Set((options.boundSections || []).map((value) => String(value || '')).filter(Boolean))];
  const bodyH1 = headingOccurrences(bodyLines, 1);
  const bodyH2 = headingOccurrences(bodyLines, 2);
  const sectionBodies = Object.fromEntries(boundSections.map((section) => [section, Object.freeze(exactSectionBodies(bodyLines, section))]));
  const selfEntries = integritySelfEntries(lines, integrityHeadingIndexes);
  return Object.freeze({
    schema: 'tiinex.site.creation-representation-occurrences.v1',
    continuityContextHeadings: countExact(envelopeLines, '# Continuity Context'),
    envelopeSeparators: boundary >= 0 ? 1 : 0,
    currentBlocks: currentBlocks.length,
    parentBlocks: parentBlocks.length,
    envelopeSchema: Object.freeze(topLevelFieldValues(envelopeLines, 'Envelope Schema')),
    currentSchema: Object.freeze(currentFieldValues(currentBlocks, 'Current Schema')),
    createdAt: Object.freeze(currentFieldValues(currentBlocks, 'Created At')),
    summary: Object.freeze(currentFieldValues(currentBlocks, 'Summary')),
    bodyH1: Object.freeze(bodyH1),
    bodyH2: Object.freeze(bodyH2),
    sectionBodies: Object.freeze(sectionBodies),
    integrityHeadings: integrityHeadingIndexes.length,
    selfIntegrityEntries: Object.freeze(selfEntries)
  });
}

export function qualifyRootCreationRepresentation(markdown = '', contract = {}) {
  const creation = contract?.creation || {};
  const summaryBound = (creation.inputBindings || []).some((item) => item?.kind === 'root-current-summary-body-title');
  const sections = [...new Set([...(creation.requiredSections || []), ...(creation.inputBindings || []).filter((item) => item?.kind === 'section-body').map((item) => item.section).filter(Boolean)])];
  const observed = inspectCreationRepresentation(markdown, { boundSections: sections });
  const findings = [];
  expectCount(findings, 'Continuity Context heading', observed.continuityContextHeadings, 1);
  expectCount(findings, 'Envelope Schema field', observed.envelopeSchema.length, 1);
  expectCount(findings, 'Current block', observed.currentBlocks, 1);
  expectCount(findings, 'Parent block', observed.parentBlocks, 0);
  expectCount(findings, 'Current Schema field', observed.currentSchema.length, 1);
  expectCount(findings, 'Created At field', observed.createdAt.length, 1);
  if (summaryBound) expectCount(findings, 'Current Summary field', observed.summary.length, 1);
  expectCount(findings, 'body H1 title', observed.bodyH1.length, 1);
  expectCount(findings, 'Continuity Integrity heading', observed.integrityHeadings, 1);
  expectCount(findings, `${C14N_V2_METHOD_ID} Towards:self entry`, observed.selfIntegrityEntries.length, 1);
  for (const section of sections) expectCount(findings, `bound section ${section}`, observed.sectionBodies[section]?.length || 0, 1);
  return Object.freeze({ state: findings.length ? 'ambiguous' : 'qualified', findings: Object.freeze(findings), observed });
}

function expectCount(findings, label, count, expected) {
  if (count === expected) return;
  findings.push(`${label} requires exactly ${expected} occurrence${expected === 1 ? '' : 's'}; observed ${count}.`);
}
function countExact(lines, exact) { return lines.reduce((count, line) => count + (line === exact ? 1 : 0), 0); }
function indexesOf(lines, predicate) { const out = []; for (let i = 0; i < lines.length; i += 1) if (predicate(lines[i], i)) out.push(i); return out; }
function topLevelListBlocks(lines, label) {
  const starts = indexesOf(lines, (line) => line === `- ${label}`);
  return starts.map((start) => {
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i += 1) if (/^-\s+\S/.test(lines[i])) { end = i; break; }
    return Object.freeze({ start, end, lines: Object.freeze(lines.slice(start + 1, end)) });
  });
}

function topLevelFieldValues(lines, label) {
  const escaped = escapeRegExp(label); const out = [];
  for (const line of lines) {
    const match = line.match(new RegExp(`^-\\s*${escaped}:\\s*(.*)$`));
    if (match) out.push(match[1]);
  }
  return out;
}

function currentFieldValues(blocks, label) {
  const escaped = escapeRegExp(label); const out = [];
  for (const block of blocks) for (const line of block.lines) {
    const match = line.match(new RegExp(`^\\s+-\\s*${escaped}:\\s*(.*)$`));
    if (match) out.push(match[1]);
  }
  return out;
}
function headingOccurrences(lines, level) {
  const prefix = '#'.repeat(level); const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(new RegExp(`^${prefix}\\s+(.+)$`));
    if (match) out.push(Object.freeze({ index: i, text: match[1] }));
  }
  return out;
}
function exactSectionBodies(lines, section) {
  const heading = `## ${section}`; const starts = indexesOf(lines, (line) => line === heading); const out = [];
  for (const startHeading of starts) {
    let start = startHeading + 1; if (lines[start] === '') start += 1;
    let end = lines.length;
    for (let i = start; i < lines.length; i += 1) if (/^#{1,2}\s+/.test(lines[i])) { end = i; break; }
    if (end > start && lines[end - 1] === '') end -= 1;
    out.push(lines.slice(start, end).join('\n'));
  }
  return out;
}
function integritySelfEntries(lines, integrityHeadingIndexes) {
  const out = [];
  for (const headingIndex of integrityHeadingIndexes) {
    const end = nextTopLevelHeading(lines, headingIndex + 1);
    let current = null;
    for (let i = headingIndex + 1; i < end; i += 1) {
      const top = lines[i].match(/^-\s+(.+?)\s*$/);
      if (top) {
        if (current && isSelf(current)) out.push(Object.freeze(current));
        current = { method: stripLink(top[1]), towards: '', valueCount: 0 };
        continue;
      }
      if (!current) continue;
      const towards = lines[i].match(/^\s+-\s+Towards:\s*(.*?)\s*$/); if (towards) current.towards = stripLink(towards[1]);
      if (/^\s+-\s+Value:\s*/.test(lines[i])) current.valueCount += 1;
    }
    if (current && isSelf(current)) out.push(Object.freeze(current));
  }
  return out;
}
function isSelf(entry) { return entry.method === C14N_V2_METHOD_ID && entry.towards === 'self'; }
function nextTopLevelHeading(lines, start) { for (let i = start; i < lines.length; i += 1) if (/^#\s+/.test(lines[i])) return i; return lines.length; }
function stripLink(value = '') { const text = String(value || '').trim(); const link = text.match(/^\[([^\]]+)\]\([^)]+\)$/); return (link ? link[1] : text).trim(); }
function escapeRegExp(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
