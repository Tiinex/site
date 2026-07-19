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
  return {
    envelopeSchema: extractSchemaLine(envelopeText, /^-\s*Envelope Schema:\s*(.+)$/m),
    parent: {
      schema: extractSchemaLine(envelopeText, /^\s*-\s*Parent Schema:\s*(.+)$/m),
      createdAt: extractPlainLine(envelopeText, /^\s*-\s*Created At:\s*(.+)$/m, 'Parent'),
      trace: extractPlainLine(envelopeText, /^\s*-\s*Trace:\s*(.+)$/m)
    },
    current: {
      schema: extractSchemaLine(envelopeText, /^\s*-\s*Current Schema:\s*(.+)$/m),
      createdAt: extractPlainLine(envelopeText, /^\s*-\s*Created At:\s*(.+)$/m, 'Current'),
      summary: extractPlainLine(envelopeText, /^\s*-\s*Summary:\s*(.+)$/m),
      status: extractPlainLine(envelopeText, /^\s*-\s*Status:\s*(.+)$/m),
      why: extractPlainLine(envelopeText, /^\s*-\s*Why:\s*(.+)$/m)
    },
    repairsDeclared: /^\s*-\s*Repairs:/m.test(envelopeText)
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

function normalizeLineEndings(value) { return String(value || '').replace(/\r\n?/g, '\n'); }
function findFirstHorizontalRule(text) { const match = /^---\s*$/m.exec(text); return match ? match.index : -1; }
function extractSchemaLine(text, pattern) {
  const raw = text.match(pattern)?.[1]?.trim() || '';
  return { raw, id: markdownLabel(raw) || raw };
}
function extractPlainLine(text, pattern, afterHeading) {
  if (!afterHeading) return stripMarkdown(text.match(pattern)?.[1]?.trim() || '');
  const block = blockAfterTopLevelList(text, afterHeading);
  return stripMarkdown(block.match(pattern)?.[1]?.trim() || '');
}
function blockAfterTopLevelList(text, label) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.trim() === `- ${label}`);
  if (start === -1) return text;
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^-\s+\S/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}
function markdownLabel(value) { return value.match(/^\[([^\]]+)\]/)?.[1]?.trim() || ''; }
function stripMarkdown(value) { return value.replace(/^\[([^\]]+)\]\([^)]*\)$/, '$1').trim(); }
