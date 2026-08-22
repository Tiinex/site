export function parseArtifactMarkdown(markdown = '') {
  const text = normalizeLineEndings(markdown);
  const envelopeBoundary = findFirstHorizontalRule(text);
  const envelopeText = envelopeBoundary === -1 ? text : text.slice(0, envelopeBoundary).trimEnd();
  const remainder = envelopeBoundary === -1 ? '' : text.slice(envelopeBoundary).replace(/^---\s*\n?/, '');
  const integrityIndex = remainder.search(/^# Continuity Integrity\s*$/m);
  const bodyText = integrityIndex === -1 ? remainder.trim() : remainder.slice(0, integrityIndex).trim();
  const integrityText = integrityIndex === -1 ? '' : remainder.slice(integrityIndex).trim();

  const envelope = parseContinuityEnvelope(envelopeText);
  const body = parseBody(bodyText);
  const integrity = parseIntegrity(integrityText);

  return {
    markdown: text,
    title: body.title || envelope.current.summary || 'Untitled artifact',
    envelope,
    body,
    integrity,
    hasContinuityContext: /^# Continuity Context\s*$/m.test(envelopeText),
    hasIntegrity: integrity.methods.length > 0
  };
}

export function parseContinuityEnvelope(envelopeText = '') {
  const parentBlock = blockAfterTopLevelList(envelopeText, 'Parent');
  const currentBlock = blockAfterTopLevelList(envelopeText, 'Current');
  return {
    envelopeSchema: extractSchemaField(envelopeText, 'Envelope Schema'),
    parent: {
      schema: extractSchemaField(parentBlock, 'Parent Schema'),
      createdAt: extractListField(parentBlock, 'Created At'),
      trace: extractListField(parentBlock, 'Trace', { preferLinkTarget: true }),
      traceLabel: extractListField(parentBlock, 'Trace'),
      traceRaw: extractListField(parentBlock, 'Trace', { preserveRaw: true }),
      origin: extractListField(parentBlock, 'Origin', { preferLinkTarget: true }),
      originEntries: Object.freeze(extractNestedLinkEntries(parentBlock, 'Origin')),
      boundary: extractListField(parentBlock, 'Boundary')
    },
    current: {
      schema: extractSchemaField(currentBlock, 'Current Schema'),
      createdAt: extractListField(currentBlock, 'Created At'),
      summary: extractListField(currentBlock, 'Summary'),
      authors: extractListField(currentBlock, 'Authors'),
      status: extractListField(currentBlock, 'Status'),
      why: extractListField(currentBlock, 'Why')
    },
    repairsDeclared: /^\s*-\s*Repairs:/m.test(envelopeText),
    origin: extractListField(envelopeText, 'Origin', { preferLinkTarget: true }),
    boundary: extractListField(envelopeText, 'Boundary')
  };
}

export function parseBody(bodyText = '') {
  const headings = [...bodyText.matchAll(/^(#{1,6})\s+(.+)\s*$/gm)].map((match) => ({ level: match[1].length, text: match[2].trim() }));
  const firstHeading = headings.find((heading) => heading.level === 1 && heading.text !== 'Continuity Context' && heading.text !== 'Continuity Integrity');
  return {
    title: firstHeading?.text || '',
    headings,
    sections: headings.filter((heading) => heading.level === 2).map((heading) => heading.text),
    text: bodyText
  };
}

export function parseIntegrity(integrityText = '') {
  const entries = parseIntegrityEntries(integrityText);
  const methods = entries.flatMap((entry) => [entry.method, entry.declaredMethod]).filter(Boolean);
  const values = entries.map((entry) => entry.value).filter(Boolean);
  return { methods, values, entries, text: integrityText };
}

function parseIntegrityEntries(integrityText = '') {
  const lines = String(integrityText || '').split('\n');
  const entries = [];
  let current = null;
  const flush = () => {
    if (!current) return;
    const method = current.label || '';
    const declaredMethod = current.fields.Method || '';
    entries.push({
      method: stripMarkdown(method),
      declaredMethod: stripMarkdown(declaredMethod),
      methodRaw: method,
      towards: normalizeFieldValue(current.fields.Towards || '', { preferLinkTarget: true }),
      towardsLabel: normalizeFieldValue(current.fields.Towards || ''),
      value: stripMarkdown(current.fields.Value || ''),
      raw: current.lines.join('\n')
    });
    current = null;
  };
  for (const line of lines) {
    const top = line.match(/^-\s+(.+?)\s*$/);
    if (top) {
      flush();
      current = { label: top[1].trim(), fields: {}, lines: [line] };
      continue;
    }
    if (!current) continue;
    current.lines.push(line);
    const field = line.match(/^\s+-\s*([A-Za-z][A-Za-z0-9 _+-]{0,40}):\s*(.+?)\s*$/);
    if (!field) continue;
    current.fields[field[1].trim()] = field[2].trim();
  }
  flush();
  return entries.filter((entry) => entry.method || entry.value || entry.towards);
}

function extractSchemaField(text, label) {
  const raw = extractListField(text, label, { preserveRaw: true });
  const link = markdownLink(raw);
  return { raw, id: link?.label || raw, target: link?.href || '', form: link ? 'markdown-link' : raw ? 'plain-schema-id' : 'empty' };
}


function extractListField(text, label, options = {}) {
  const lines = String(text || '').split('\n');
  const escaped = escapeRegExp(label);
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(new RegExp(`^(\\s*)-\\s*${escaped}:\\s*(.*)$`));
    if (!match) continue;
    const parentIndent = match[1].length;
    const inline = match[2].trim();
    if (inline) return normalizeFieldValue(inline, options);
    const nested = firstNestedListValue(lines, i + 1, parentIndent);
    if (nested) return normalizeFieldValue(nested, options);
    return '';
  }
  return '';
}

function firstNestedListValue(lines, start, parentIndent) {
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    const indent = leadingSpaces(line);
    if (/^\s*-\s+\S/.test(line) && indent <= parentIndent) return '';
    const item = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!item) continue;
    const raw = item[1].trim();
    // Origin blocks commonly use labelled nested entries, e.g.
    //   - relative: ../parent.trace.md
    //   - [github git file](https://github.com/...)
    // Returning the value portion keeps parent/origin resolution from treating
    // the label as part of the path while still preserving markdown links for
    // normalizeFieldValue(..., { preferLinkTarget: true }).
    const labelled = raw.match(/^([A-Za-z][A-Za-z0-9 _+-]{0,40}):\s*(.+)$/);
    return (labelled ? labelled[2] : raw).trim();
  }
  return '';
}

function extractNestedLinkEntries(text, label) {
  const lines = String(text || '').split('\n');
  const escaped = escapeRegExp(label);
  const start = lines.findIndex((line) => line.match(new RegExp(`^(\\s*)-\\s*${escaped}:\\s*$`)));
  if (start < 0) return [];
  const parentIndent = leadingSpaces(lines[start]);
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const indent = leadingSpaces(line);
    if (/^\s*-\s+\S/.test(line) && indent <= parentIndent) break;
    const item = line.match(/^\s*-\s+(\[[^\]]+\]\([^)]+\))\s*$/);
    if (!item) continue;
    const link = markdownLink(item[1]);
    if (!link) continue;
    out.push(Object.freeze({ label: link.label, target: link.href, raw: item[1] }));
  }
  return out;
}

function normalizeFieldValue(value, options = {}) {
  const raw = String(value || '').trim();
  if (options.preserveRaw) return raw;
  const link = markdownLink(raw);
  if (link && options.preferLinkTarget) return link.href || link.label || raw;
  return link?.label || stripMarkdown(raw);
}

function blockAfterTopLevelList(text, label) {
  const lines = String(text || '').split('\n');
  const start = lines.findIndex((line) => line.trim() === `- ${label}`);
  if (start === -1) return '';
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^-\s+\S/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

function normalizeLineEndings(value) { return String(value || '').replace(/\r\n?/g, '\n'); }
function findFirstHorizontalRule(text) { const match = /^---\s*$/m.exec(text); return match ? match.index : -1; }
function markdownLink(value) {
  const match = String(value || '').match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) return null;
  return { label: match[1].trim(), href: match[2].trim() };
}
function markdownLabel(value) { return markdownLink(value)?.label || ''; }
function stripMarkdown(value) { return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').trim(); }
function leadingSpaces(value) { return String(value || '').match(/^\s*/)?.[0]?.length || 0; }
function escapeRegExp(value) { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
