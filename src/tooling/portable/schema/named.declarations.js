function normalizeKey(value = '') {
  return String(value || '').toLowerCase().replace(/[`*_#]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function cleanToken(value = '') {
  return String(value || '').trim().replace(/^`|`$/g, '').trim();
}

function categoryItems(group = {}, names = []) {
  const wanted = new Set(names.map((name) => String(name || '').trim()));
  return (group.categories || []).flatMap((category) => wanted.has(String(category.name || '').trim()) ? category.items : []);
}

function unique(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function headingTargetsFromRules(rules = []) {
  const targets = [];
  for (const rule of rules) {
    const text = String(rule || '');
    for (const match of text.matchAll(/(?:Entries|entry|declarations?|names)\s+under\s+`(#{2,6}\s+[^`]+)`/gi)) targets.push(match[1].trim());
    for (const match of text.matchAll(/unique\s+within\s+`(#{2,6}\s+[^`]+)`/gi)) targets.push(match[1].trim());
  }
  return unique(targets);
}

export function compileNamedDeclarationContracts(contract = {}) {
  const out = [];
  for (const group of contract.groups || []) {
    const entryShape = categoryItems(group, ['Entry Shape']).map(cleanToken);
    const requiredFields = categoryItems(group, ['Required Fields']).map(cleanToken);
    const optionalFields = categoryItems(group, ['Optional Fields']).map(cleanToken);
    const declarationFields = categoryItems(group, ['Declaration Fields', 'Fields']).map(cleanToken);
    const rules = categoryItems(group, ['Rules']);
    const namedEntry = entryShape.some((item) => normalizeKey(item) === 'first level hyphen list item' || normalizeKey(item) === 'named declaration');
    if (!namedEntry || !(requiredFields.length || optionalFields.length || declarationFields.length)) continue;
    const targetHeadings = headingTargetsFromRules(rules);
    out.push(Object.freeze({
      group: group.name,
      entryShape: Object.freeze(entryShape),
      requiredFields: Object.freeze(unique(requiredFields.length ? requiredFields : declarationFields)),
      optionalFields: Object.freeze(unique(optionalFields)),
      declarationFields: Object.freeze(unique(declarationFields)),
      allowedLabels: Object.freeze(unique(categoryItems(group, ['Allowed Labels']).map(cleanToken))),
      allowedShapes: Object.freeze(unique(categoryItems(group, ['Allowed Shapes']).map(cleanToken))),
      targetHeadings: Object.freeze(targetHeadings),
      allowLiteralNone: rules.some((rule) => /literal(?:\s+first-level)?\s+entry\s+`none`|literal\s+`none`/i.test(rule)),
      rules: Object.freeze(rules)
    }));
  }
  return Object.freeze(out);
}

export function parseNamedDeclarationSection(markdown = '', heading = '', declarationContract = {}) {
  const section = findExactSection(markdown, heading);
  if (!section) return Object.freeze({ heading, present: false, entries: Object.freeze([]), findings: Object.freeze([]) });
  const entries = [];
  const findings = [];
  let current = null;
  let fenced = false;
  for (let offset = 0; offset < section.lines.length; offset += 1) {
    const rawLine = section.lines[offset];
    const line = section.startIndex + offset + 1;
    if (/^\s*```/.test(rawLine)) { fenced = !fenced; continue; }
    if (fenced || !rawLine.trim()) continue;
    const first = rawLine.match(/^-\s+(.+?)\s*$/);
    if (first) {
      current = { name: first[1].trim(), fields: {}, fieldOrder: [], raw: [rawLine], startLine: line, endLine: line };
      entries.push(current);
      continue;
    }
    const nested = rawLine.match(/^\s+-\s+([^:]+):\s*(.*?)\s*$/);
    if (nested && current) {
      const field = nested[1].trim();
      const value = nested[2];
      current.raw.push(rawLine);
      current.endLine = line;
      if (Object.prototype.hasOwnProperty.call(current.fields, field)) {
        findings.push(Object.freeze({ code: 'portable.contract.declaration.field.duplicate', entry: current.name, field }));
      } else {
        current.fields[field] = value;
        current.fieldOrder.push(field);
      }
      continue;
    }
    if (current && /^\s+\S/.test(rawLine)) {
      current.raw.push(rawLine);
      current.endLine = line;
    }
  }
  const frozen = entries.map((entry) => Object.freeze({
    name: entry.name,
    fields: Object.freeze({ ...entry.fields }),
    fieldOrder: Object.freeze([...entry.fieldOrder]),
    raw: Object.freeze([...entry.raw]),
    source: Object.freeze({ line: entry.startLine, endLine: entry.endLine })
  }));
  return Object.freeze({ heading, present: true, entries: Object.freeze(frozen), findings: Object.freeze(findings) });
}

export function parseDeclarationsAgainstContract(markdown = '', declarationContracts = []) {
  const groups = [];
  for (const contract of declarationContracts || []) {
    const sections = contract.targetHeadings.map((heading) => parseNamedDeclarationSection(markdown, heading, contract));
    groups.push(Object.freeze({ contract, sections: Object.freeze(sections) }));
  }
  return Object.freeze(groups);
}

export function declarationOwnershipRanges(parsedDeclarations = []) {
  const ranges = [];
  for (const parsedGroup of parsedDeclarations || []) {
    for (const section of parsedGroup.sections || []) {
      for (const entry of section.entries || []) {
        const line = Number(entry.source?.line || 0);
        const endLine = Number(entry.source?.endLine || line);
        if (!line || endLine < line) continue;
        ranges.push(Object.freeze({
          line,
          endLine,
          group: String(parsedGroup.contract?.group || ''),
          heading: String(section.heading || ''),
          entry: String(entry.name || '')
        }));
      }
    }
  }
  return Object.freeze(ranges);
}

function findExactSection(markdown = '', heading = '') {
  const target = String(heading || '').trim();
  const explicit = target.match(/^(#{1,6})\s+(.+)$/);
  const wantedLevel = explicit ? explicit[1].length : null;
  const wantedTitle = explicit ? explicit[2].trim() : target;
  if (!wantedTitle) return null;
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  let fenced = false;
  let start = -1;
  let matchedLevel = wantedLevel;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;
    const level = match[1].length;
    const title = match[2].trim();
    if (start < 0 && (wantedLevel === null || level === wantedLevel) && title === wantedTitle) { start = index + 1; matchedLevel = level; continue; }
    if (start >= 0 && level <= matchedLevel) return { lines: lines.slice(start, index), line: start + 1, endLine: index, startIndex: start, endIndex: index };
  }
  return start >= 0 ? { lines: lines.slice(start), line: start + 1, endLine: lines.length, startIndex: start, endIndex: lines.length } : null;
}

export function declarationTargetKey(value = '') {
  return normalizeKey(String(value || '').replace(/^#{1,6}\s+/, ''))
    .replace(/\broles\b/g, 'role')
    .replace(/\bbindings\b/g, 'binding')
    .replace(/\beffects\b/g, 'effect')
    .replace(/\bplacements\b/g, 'placement');
}
