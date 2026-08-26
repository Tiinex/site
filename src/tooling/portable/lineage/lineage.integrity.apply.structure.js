import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_METHOD_ID } from '../../../integrity/integrity.methodReference.js';

export function applyStructureAwareLineageMutation({ markdown = '', target = '', digest = '', parentPath = '', parentOriginTarget = '' } = {}) {
  const before = structuralSnapshots(markdown);
  if (!before.ok) return before;
  let next = String(markdown || '');
  const mutationSurfaces = [];
  if (parentOriginTarget) {
    const header = updateParentBrowseGit(next, parentOriginTarget);
    if (!header.ok) return header;
    next = header.markdown;
    mutationSurfaces.push('Continuity Context/Parent/Origin/browse + git');
  }
  const footer = upsertParentIntegrity(next, { target, digest, parentPath });
  if (!footer.ok) return footer;
  next = footer.markdown;
  mutationSurfaces.push('Continuity Integrity/Parent-target c14n-v2');
  const resealed = resealSelfPreservingRepresentation(next);
  if (!resealed.ok) return resealed;
  next = resealed.markdown;
  mutationSurfaces.push('Continuity Integrity/primary self Value');
  const after = structuralSnapshots(next);
  const guard = representationGuard(before, after, { headerUpdate: Boolean(parentOriginTarget) });
  if (!guard.ok) return guard;
  return Object.freeze({ ok: true, markdown: next, mutationSurfaces: Object.freeze(mutationSurfaces), bodyPreserved: before.body === after.body, siblingFooterEntriesPreserved: guard.siblingFooterEntriesPreserved });
}

function upsertParentIntegrity(markdown, { target, digest, parentPath }) {
  const model = scanIntegrity(markdown);
  if (!model.ok) return model;
  if (model.selfEntries.length !== 1) return fail('primary-self-entry-not-exactly-one');
  if (model.parentEntries.length > 1) return fail('parent-target-entry-ambiguous');
  const lines = model.lines.slice();
  if (model.parentEntries.length === 1) {
    const entry = model.parentEntries[0];
    if (entry.towardsLine < 0 || entry.valueLine < 0) return fail('parent-target-entry-malformed');
    lines[entry.towardsLine] = replaceFieldLine(lines[entry.towardsLine], 'Towards', renderTowards(entry.towardsRaw, target));
    lines[entry.valueLine] = replaceFieldLine(lines[entry.valueLine], 'Value', digest);
    return Object.freeze({ ok: true, markdown: joinLines(lines) });
  }
  const self = model.selfEntries[0];
  const methodRaw = self.methodRaw || C14N_V2_METHOD_ID;
  const eol = model.preferredEol;
  const label = basename(parentPath) || basename(target) || 'parent';
  const insert = [
    makeLine(`- ${methodRaw}`, eol),
    makeLine(`  - Towards: [${label}](${target})`, eol),
    makeLine(`  - Value: ${digest}`, eol),
    makeLine('', eol)
  ];
  lines.splice(self.start, 0, ...insert);
  return Object.freeze({ ok: true, markdown: joinLines(lines) });
}

function resealSelfPreservingRepresentation(markdown) {
  const state = canonicalC14nV2SelfState(markdown);
  if (!['verified', 'mismatch', 'prepared'].includes(state.state)) return fail(`self-seal-${state.reason || state.state}`);
  const model = scanIntegrity(markdown);
  if (!model.ok || model.selfEntries.length !== 1) return fail('primary-self-entry-not-exactly-one');
  const self = model.selfEntries[0];
  if (self.valueLine < 0) return fail('self-value-field-missing');
  const lines = model.lines.slice();
  lines[self.valueLine] = replaceFieldLine(lines[self.valueLine], 'Value', state.computedValue);
  const next = joinLines(lines);
  const verified = canonicalC14nV2SelfState(next);
  if (verified.state !== 'verified') return fail(`self-seal-postcondition-${verified.state}`);
  return Object.freeze({ ok: true, markdown: next, value: verified.declaredValue });
}

function updateParentBrowseGit(markdown, target) {
  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//.test(String(target || ''))) return fail('parent-origin-target-not-immutable-github-blob');
  const lines = splitLines(markdown);
  const rule = firstRuleIndex(lines);
  if (rule < 0) return fail('continuity-envelope-divider-missing');
  const parent = topLevelBlock(lines, '- Parent', rule);
  if (!parent) return fail('parent-envelope-block-missing');
  const originIndex = findInRange(lines, parent.start + 1, parent.end, /^\s{2}-\s+Origin:\s*$/);
  if (originIndex < 0) return fail('parent-origin-block-missing');
  const nestedEnd = nestedListEnd(lines, originIndex + 1, parent.end, 2);
  const browse = findInRange(lines, originIndex + 1, nestedEnd, /^\s{4}-\s+\[browse \+ git\]\([^)]+\)\s*$/);
  if (browse >= 0) {
    const raw = lines[browse].content;
    lines[browse] = { ...lines[browse], content: raw.replace(/\[browse \+ git\]\([^)]+\)/, `[browse + git](${target})`) };
  } else {
    const eol = preferredEol(lines);
    lines.splice(nestedEnd, 0, makeLine(`    - [browse + git](${target})`, eol));
  }
  return Object.freeze({ ok: true, markdown: joinLines(lines) });
}

function scanIntegrity(markdown) {
  const lines = splitLines(markdown);
  const headings = [];
  for (let i = 0; i < lines.length; i += 1) if (/^# Continuity Integrity[ \t]*$/.test(lines[i].content)) headings.push(i);
  if (headings.length !== 1) return fail(headings.length ? 'multiple-integrity-footers' : 'integrity-footer-missing');
  const heading = headings[0];
  const entries = [];
  let current = null;
  const finish = (end) => { if (current) { current.end = end; entries.push(Object.freeze(current)); current = null; } };
  for (let i = heading + 1; i < lines.length; i += 1) {
    const line = lines[i].content;
    if (/^#\s+/.test(line)) { finish(i); break; }
    const top = line.match(/^-\s+(.+?)\s*$/);
    if (top) {
      finish(i);
      current = { start: i, end: lines.length, methodRaw: top[1].trim(), method: stripLink(top[1].trim()), towards: '', towardsRaw: '', towardsLine: -1, value: '', valueLine: -1 };
      continue;
    }
    if (!current) continue;
    const towards = line.match(/^\s+-\s+Towards:\s*(.*?)\s*$/);
    if (towards) { current.towardsRaw = towards[1].trim(); current.towards = linkTargetOrText(current.towardsRaw); current.towardsLine = i; }
    const value = line.match(/^\s+-\s+Value:\s*(.*?)\s*$/);
    if (value) { current.value = value[1].trim(); current.valueLine = i; }
  }
  finish(lines.length);
  const c14n = entries.filter((entry) => entry.method === C14N_V2_METHOD_ID);
  return Object.freeze({ ok: true, lines, heading, entries: Object.freeze(entries), selfEntries: Object.freeze(c14n.filter((entry) => entry.towards === 'self')), parentEntries: Object.freeze(c14n.filter((entry) => entry.towards && entry.towards !== 'self')), preferredEol: preferredEol(lines) });
}

function structuralSnapshots(markdown) {
  const lines = splitLines(markdown);
  const rule = firstRuleIndex(lines);
  const footer = lines.findIndex((line) => /^# Continuity Integrity[ \t]*$/.test(line.content));
  if (rule < 0 || footer < 0 || footer <= rule) return Object.freeze({ ok: false, blockers: Object.freeze(['artifact-structure-boundaries-unavailable']) });
  const envelope = joinLines(lines.slice(0, rule));
  const body = joinLines(lines.slice(rule, footer));
  const integrity = scanIntegrity(markdown);
  if (!integrity.ok) return Object.freeze({ ok: false, blockers: integrity.blockers });
  const siblingEntries = integrity.entries.filter((entry) => entry.method !== C14N_V2_METHOD_ID).map((entry) => joinLines(lines.slice(entry.start, entry.end)));
  const repairs = envelopeBlockRaw(lines, rule, '- Repairs:');
  return Object.freeze({ ok: true, envelope, body, repairs, siblingEntries: Object.freeze(siblingEntries) });
}

function representationGuard(before, after, { headerUpdate = false } = {}) {
  const blockers = [];
  if (!after.ok) blockers.push(...(after.blockers || ['post-repair-structure-unavailable']));
  if (before.body !== after.body) blockers.push('body-representation-changed');
  if (!headerUpdate && before.envelope !== after.envelope) blockers.push('unapproved-header-representation-changed');
  if (before.repairs !== after.repairs) blockers.push('repairs-provenance-changed');
  const siblingFooterEntriesPreserved = JSON.stringify(before.siblingEntries) === JSON.stringify(after.siblingEntries);
  if (!siblingFooterEntriesPreserved) blockers.push('unapproved-sibling-footer-entry-changed');
  return Object.freeze({ ok: blockers.length === 0, blockers: Object.freeze(unique(blockers)), siblingFooterEntriesPreserved });
}

function splitLines(text) {
  const out = [];
  const source = String(text || '');
  const re = /([^\r\n]*)(\r\n|\n|\r|$)/g;
  let match;
  while ((match = re.exec(source)) && (match[0] || re.lastIndex === 0)) {
    if (match[0] === '' && re.lastIndex >= source.length) break;
    out.push({ content: match[1], eol: match[2] });
    if (!match[2]) break;
  }
  if (!out.length) out.push({ content: '', eol: '' });
  return out;
}
function joinLines(lines) { return lines.map((line) => `${line.content}${line.eol}`).join(''); }
function makeLine(content, eol) { return { content, eol }; }
function preferredEol(lines) { return lines.find((line) => line.eol)?.eol || '\n'; }
function replaceFieldLine(line, label, value) {
  const match = line.content.match(new RegExp(`^(\\s+-\\s+${escapeRegExp(label)}:)([ \\t]*)(.*)$`));
  if (!match) return line;
  return { ...line, content: `${match[1]}${match[2]}${value}` };
}
function renderTowards(raw, target) { const match = String(raw || '').match(/^\[([^\]]+)\]\([^)]+\)$/); return match ? `[${match[1]}](${target})` : target; }
function stripLink(value) { const match = String(value || '').match(/^\[([^\]]+)\]\([^)]+\)$/); return (match ? match[1] : String(value || '')).trim(); }
function linkTargetOrText(value) { const match = String(value || '').match(/^\[[^\]]+\]\(([^)]+)\)$/); return (match ? match[1] : String(value || '')).trim(); }
function firstRuleIndex(lines) { return lines.findIndex((line) => /^---[ \t]*$/.test(line.content)); }
function topLevelBlock(lines, marker, limit) { const start = lines.findIndex((line, index) => index < limit && line.content === marker); if (start < 0) return null; let end = limit; for (let i = start + 1; i < limit; i += 1) if (/^-\s+\S/.test(lines[i].content)) { end = i; break; } return { start, end }; }
function findInRange(lines, start, end, regex) { for (let i = start; i < end; i += 1) if (regex.test(lines[i].content)) return i; return -1; }
function nestedListEnd(lines, start, end, parentIndent) { for (let i = start; i < end; i += 1) { const indent = (lines[i].content.match(/^\s*/) || [''])[0].length; if (/^\s*-\s+\S/.test(lines[i].content) && indent <= parentIndent) return i; } return end; }
function envelopeBlockRaw(lines, rule, marker) { const start = lines.findIndex((line, index) => index < rule && line.content === marker); if (start < 0) return ''; let end = rule; for (let i = start + 1; i < rule; i += 1) if (/^-\s+\S/.test(lines[i].content)) { end = i; break; } return joinLines(lines.slice(start, end)); }
function basename(value) { const clean = String(value || '').replace(/[?#].*$/, '').replace(/\/+$/, ''); return clean.split('/').pop() || ''; }
function unique(values) { return [...new Set((values || []).map(String).filter(Boolean))]; }
function escapeRegExp(value) { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function fail(...blockers) { return Object.freeze({ ok: false, blockers: Object.freeze(unique(blockers.flat())) }); }
