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
      trace: extractListField(parentBlock, 'Trace'),
      origin: extractListField(parentBlock, 'Origin', { preferLinkTarget: true }),
      boundary: extractListField(parentBlock, 'Boundary')
    },
    current: {
      schema: extractSchemaField(currentBlock, 'Current Schema'),
      createdAt: extractListField(currentBlock, 'Created At'),
      summary: extractListField(currentBlock, 'Summary'),
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
  const methods = [...integrityText.matchAll(/^-\s+([^\n]+)\n(?:\s+-\s+[^\n]+\n?)*/gm)].map((match) => match[1].trim());
  const values = [...integrityText.matchAll(/^\s*-\s*Value:\s*(.+)$/gm)].map((match) => match[1].trim());
  return { methods, values, text: integrityText };
}

function extractSchemaField(text, label) {
  const raw = extractListField(text, label, { preserveRaw: true });
  return { raw, id: markdownLabel(raw) || raw };
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
    if (item) return item[1].trim();
  }
  return '';
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
  if (start === -1) return text;
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
