import { C14N_V2_METHOD_ID, qualifyIntegrityMethodReferenceValue } from '../integrity/integrity.methodReference.js';
import { isMarkdownLink, isRelativePath } from './reference.shapes.js';

export function inspectCreationRepresentation(markdown = '', options = {}) {
  const text = String(markdown || '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const boundary = lines.findIndex((line) => line === '---');
  const envelopeLines = boundary >= 0 ? lines.slice(0, boundary) : lines.slice();
  const integrityHeadingIndexes = indexesOf(lines, (line) => line === '# Continuity Integrity');
  const integrityStart = integrityHeadingIndexes.length ? integrityHeadingIndexes[0] : lines.length;
  const footerSeparatorIndexes = integrityHeadingIndexes.filter((index) => canonicalDividerImmediatelyBefore(lines, index));
  const bodyEnd = footerSeparatorIndexes.length === 1 ? footerSeparatorIndexes[0] - 2 : integrityStart;
  const bodyLines = boundary >= 0 ? lines.slice(boundary + 1, bodyEnd) : [];
  const currentBlocks = topLevelListBlocks(envelopeLines, 'Current');
  const parentBlocks = topLevelListBlocks(envelopeLines, 'Parent');
  const boundSections = [...new Set((options.boundSections || []).map((value) => String(value || '')).filter(Boolean))];
  const bodyH1 = headingOccurrences(bodyLines, 1);
  const bodyH2 = headingOccurrences(bodyLines, 2);
  const sectionBodies = Object.fromEntries(boundSections.map((section) => [section, Object.freeze(exactSectionBodies(bodyLines, section))]));
  const integrityEntriesDetailed = integrityEntries(lines, integrityHeadingIndexes);
  const selfEntries = integrityEntriesDetailed.filter(isSelf);
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
    footerSeparators: footerSeparatorIndexes.length,
    integrityEntries: integrityEntriesDetailed.length,
    integrityEntryDetails: Object.freeze(integrityEntriesDetailed),
    selfIntegrityEntries: Object.freeze(selfEntries)
  });
}

export function qualifyRootCreationRepresentation(markdown = '', contract = {}) {
  const creation = contract?.creation || {};
  const summaryBound = (creation.inputBindings || []).some((item) => item?.kind === 'root-current-summary-body-title');
  const sections = [...new Set([...(creation.representationSections || []), ...(creation.requiredSections || []), ...(creation.inputBindings || []).map((item) => item?.section).filter(Boolean)])];
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
  expectCount(findings, 'canonical divider immediately before Continuity Integrity', observed.footerSeparators, 1);
  expectCount(findings, 'Continuity Integrity method entry', observed.integrityEntries, 1);
  expectCount(findings, `${C14N_V2_METHOD_ID} Towards:self entry`, observed.selfIntegrityEntries.length, 1);
  qualifyPrimarySelfMethodReference(findings, observed, contract);
  for (const section of sections) expectCount(findings, `bound section ${section}`, observed.sectionBodies[section]?.length || 0, 1);
  return Object.freeze({ state: findings.length ? 'ambiguous' : 'qualified', findings: Object.freeze(findings), observed });
}


function qualifyPrimarySelfMethodReference(findings, observed, contract) {
  if (observed.selfIntegrityEntries.length !== 1) return;
  const authority = contract?.integrityMethodReferences?.primarySelf || null;
  if (!authority) return;
  const qualification = qualifyIntegrityMethodReferenceValue(observed.selfIntegrityEntries[0].methodRaw || observed.selfIntegrityEntries[0].method || '', authority);
  for (const finding of qualification.findings || []) findings.push(finding);
}

function canonicalDividerImmediatelyBefore(lines, headingIndex) {
  if (headingIndex < 2) return false;
  return lines[headingIndex - 1] === '' && lines[headingIndex - 2] === '---';
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
function integrityEntryCount(lines, integrityHeadingIndexes) {
  let count = 0;
  for (const headingIndex of integrityHeadingIndexes) {
    const end = nextTopLevelHeading(lines, headingIndex + 1);
    for (let i = headingIndex + 1; i < end; i += 1) if (/^-\s+\S/.test(lines[i])) count += 1;
  }
  return count;
}

function integrityEntries(lines, integrityHeadingIndexes) {
  const out = [];
  for (const headingIndex of integrityHeadingIndexes) {
    const end = nextTopLevelHeading(lines, headingIndex + 1);
    let current = null;
    const flush = () => {
      if (!current) return;
      out.push(Object.freeze(current));
      current = null;
    };
    for (let i = headingIndex + 1; i < end; i += 1) {
      const top = lines[i].match(/^-\s+(.+?)\s*$/);
      if (top) {
        flush();
        current = { methodRaw: top[1], method: stripLink(top[1]), towardsRaw: '', towards: '', towardsLabel: '', valueCount: 0, value: '' };
        continue;
      }
      if (!current) continue;
      const towards = lines[i].match(/^\s+-\s+Towards:\s*(.*?)\s*$/);
      if (towards) {
        current.towardsRaw = towards[1];
        current.towards = linkTargetOrText(towards[1]);
        current.towardsLabel = stripLink(towards[1]);
      }
      const value = lines[i].match(/^\s+-\s+Value:\s*(.*?)\s*$/);
      if (value) {
        current.valueCount += 1;
        if (current.valueCount === 1) current.value = value[1];
      }
    }
    flush();
  }
  return out;
}
function isSelf(entry) { return entry.method === C14N_V2_METHOD_ID && entry.towards === 'self'; }
function nextTopLevelHeading(lines, start) { for (let i = start; i < lines.length; i += 1) if (/^#\s+/.test(lines[i])) return i; return lines.length; }
function stripLink(value = '') { const text = String(value || '').trim(); const link = text.match(/^\[([^\]]+)\]\([^)]+\)$/); return (link ? link[1] : text).trim(); }
function linkTargetOrText(value = '') { const text = String(value || '').trim(); const link = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/); return (link ? link[2] : text).trim(); }
function escapeRegExp(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function qualifyContinuationCreationRepresentation(markdown = '', contract = {}, parentRecord = {}, options = {}) {
  const creation = contract?.creation || {};
  const sections = [...new Set([...(creation.representationSections || []), ...(creation.requiredSections || []), ...(creation.inputBindings || []).map((item) => item?.section).filter(Boolean)])];
  const observed = inspectCreationRepresentation(markdown, { boundSections: sections });
  const findings = [];
  expectCount(findings, 'Continuity Context heading', observed.continuityContextHeadings, 1);
  expectCount(findings, 'Envelope Schema field', observed.envelopeSchema.length, 1);
  expectCount(findings, 'Current block', observed.currentBlocks, 1);
  expectCount(findings, 'Parent block', observed.parentBlocks, 1);
  expectCount(findings, 'Current Schema field', observed.currentSchema.length, 1);
  expectCount(findings, 'Created At field', observed.createdAt.length, 1);
  expectCount(findings, 'body H1 title', observed.bodyH1.length, 1);
  expectCount(findings, 'Continuity Integrity heading', observed.integrityHeadings, 1);
  expectCount(findings, 'canonical divider immediately before Continuity Integrity', observed.footerSeparators, 1);
  expectCount(findings, 'Continuity Integrity method entry', observed.integrityEntries, 2);
  expectCount(findings, `${C14N_V2_METHOD_ID} Towards:self entry`, observed.selfIntegrityEntries.length, 1);
  qualifyPrimarySelfMethodReference(findings, observed, contract);
  qualifyParentTargetIntegrityEntry(findings, observed, contract, options.parentIntegrityTarget || '');
  for (const section of sections) expectCount(findings, `bound section ${section}`, observed.sectionBodies[section]?.length || 0, 1);

  const text = String(markdown || '').replace(/\r\n?/g, '\n');
  const parentBlock = exactTopLevelBlock(text, 'Parent');
  if (!parentBlock) findings.push('Parent block is required.');
  else {
    const traceLines = exactNestedFieldLines(parentBlock, 'Trace');
    const originHeader = exactNestedFieldLines(parentBlock, 'Origin', { allowEmpty: true });
    const boundaryLines = exactNestedFieldLines(parentBlock, 'Boundary');
    expectCount(findings, 'Parent Trace field', traceLines.length, 1);
    expectCount(findings, 'Parent Origin block', originHeader.length, 1);
    expectCount(findings, 'undeclared Parent Boundary field', boundaryLines.length, 0);
    const trace = traceLines[0]?.value || '';
    if (trace && !isMarkdownLink(trace) && !isRelativePath(trace)) findings.push('Parent Trace must be one Markdown link or one relative path; synthetic record tokens are not Root Trace authority.');
    if (trace.startsWith('record:')) findings.push('Parent Trace must not use a record: synthetic token.');
    const origins = originHeader.length ? nestedOriginLinks(parentBlock, originHeader[0].index) : [];
    const relative = origins.filter((entry) => entry.label === 'relative');
    const browse = origins.filter((entry) => entry.label === 'browse + git');
    const publishedReference = parentRecord?.publishedReference || parentRecord?.browseGitReference || parentRecord?.browseGit || null;
    const publishedTarget = typeof publishedReference === 'string' ? '' : String(publishedReference?.target || publishedReference?.url || '');
    const publishedState = typeof publishedReference === 'string' ? 'unresolved' : String(publishedReference?.state || publishedReference?.resolutionState || 'unresolved');
    const publishedQualified = Boolean(publishedTarget && publishedState === 'qualified');
    const recoveryMode = String(parentRecord?.recoveryMode || parentRecord?.parentRecoveryMode || '').trim() === 'external-versioned' ? 'external-versioned' : 'local-relative';
    if (recoveryMode === 'external-versioned') {
      if (!publishedQualified) findings.push('External Parent recovery requires one qualified version-stable published representation.');
      if (origins.length !== 1 || relative.length !== 0 || browse.length !== 1) findings.push('External Parent Origin must contain exactly one [browse + git](...) entry and must not fabricate [relative](...).');
      if (browse[0]?.target !== publishedTarget) findings.push('Parent browse + git Origin must preserve the exact qualified published Parent representation.');
      if (linkTargetOrText(trace) !== publishedTarget) findings.push('External Parent Trace must target the exact qualified published Parent representation.');
    } else {
      if (relative.length !== 1 || origins.length < 1 || origins.length > 2 || browse.length > 1) findings.push('Directly recoverable local Parent Origin must contain exactly one [relative](...) entry and may contain at most one truthful [browse + git](...) supplement.');
      if (relative[0]?.target !== String(options.relativeReference || '')) findings.push(`Parent relative Origin must be exactly ${options.relativeReference || '(unavailable)'}.`);
      if (browse.length && (!publishedQualified || browse[0]?.target !== publishedTarget)) findings.push('Parent browse + git Origin must preserve qualified publication evidence and must not be invented.');
    }
  }
  return Object.freeze({ state: findings.length ? 'ambiguous' : 'qualified', findings: Object.freeze(findings), observed });
}


function qualifyParentTargetIntegrityEntry(findings, observed, contract, expectedTarget = '') {
  const candidates = (observed.integrityEntryDetails || []).filter((entry) => entry.method === C14N_V2_METHOD_ID && entry.towards !== 'self');
  expectCount(findings, `${C14N_V2_METHOD_ID} Parent-target entry`, candidates.length, 1);
  if (candidates.length !== 1) return;
  const entry = candidates[0];
  const authority = contract?.integrityMethodReferences?.primarySelf || null;
  if (authority) {
    const qualification = qualifyIntegrityMethodReferenceValue(entry.methodRaw || entry.method || '', authority);
    for (const finding of qualification.findings || []) findings.push(finding);
  }
  if (!entry.towards) findings.push('Parent-target integrity Towards value is required.');
  else if (!expectedTarget) findings.push('Required Parent-target integrity target is unavailable.');
  else if (entry.towards !== String(expectedTarget)) findings.push(`Parent-target integrity Towards must be exactly ${expectedTarget}.`);
  expectCount(findings, 'Parent-target integrity Value field', entry.valueCount, 1);
  if (entry.valueCount === 1 && !entry.value) findings.push('Parent-target integrity Value must not be empty.');
}

function exactTopLevelBlock(text, label) {
  const lines = String(text || '').split('\n');
  const start = lines.findIndex((line) => line === `- ${label}`);
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) if (/^-\s+\S/.test(lines[i])) { end = i; break; }
  return Object.freeze({ lines: Object.freeze(lines.slice(start + 1, end)) });
}
function exactNestedFieldLines(block, label, options = {}) {
  const escaped = escapeRegExp(label); const out = [];
  for (let i = 0; i < (block?.lines || []).length; i += 1) {
    const match = block.lines[i].match(new RegExp(`^  - ${escaped}:\\s*(.*)$`));
    if (!match) continue;
    if (match[1] || options.allowEmpty) out.push(Object.freeze({ index: i, value: match[1] }));
  }
  return out;
}
function nestedOriginLinks(block, originIndex) {
  const out = [];
  for (let i = originIndex + 1; i < (block?.lines || []).length; i += 1) {
    const line = block.lines[i];
    if (/^  - \S/.test(line)) break;
    const match = line.match(/^    - \[([^\]]+)\]\(([^)]+)\)$/);
    if (match) out.push(Object.freeze({ label: match[1], target: match[2] }));
  }
  return out;
}
