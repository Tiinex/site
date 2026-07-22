import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

export const PORTABLE_SCHEMA_DOCUMENT_SCHEMA_ID = 'tiinex.portable.schema-document.v1';

export function parsePortableSchemaDocument(markdown = '') {
  const text = String(markdown || '').replace(/\r\n?/g, '\n');
  const parsed = safeParseArtifact(text);
  const sections = parseHeadingSections(text);
  const validation = parseContractGroups(findSection(sections, 'Schema Validation Contract'));
  const creation = parseContractGroups(findSection(sections, 'Artifact Creation Contract'));
  const summarySection = findSection(sections, 'Summary');
  return Object.freeze({
    schema: PORTABLE_SCHEMA_DOCUMENT_SCHEMA_ID,
    schemaId: String(parsed.envelope?.current?.schema?.id || '').trim(),
    parentSchemaId: String(parsed.envelope?.parent?.schema?.id || '').trim(),
    title: parsed.body?.title || parsed.title || '',
    summary: firstParagraph(summarySection?.content || parsed.envelope?.current?.summary || ''),
    outline: Object.freeze(sections.map((section) => Object.freeze({
      level: section.level,
      title: section.title,
      line: section.line,
      endLine: section.endLine,
      chars: section.content.length
    }))),
    sections: Object.freeze(sections),
    validation,
    creation
  });
}

export function readPortableSchemaSections(markdown = '', selectors = [], options = {}) {
  const document = parsePortableSchemaDocument(markdown);
  const wanted = normalizeSelectors(selectors);
  const maxChars = normalizePositiveInt(options.maxChars, 12000);
  const includeChildren = options.includeChildren !== false;
  const matches = [];
  let remaining = maxChars;
  for (const section of document.sections) {
    if (wanted.length && !wanted.some((selector) => sectionMatches(section, selector))) continue;
    const content = includeChildren ? section.fullContent : section.content;
    const clipped = content.length > remaining ? `${content.slice(0, Math.max(0, remaining)).trimEnd()}\n…` : content;
    matches.push(Object.freeze({
      level: section.level,
      title: section.title,
      line: section.line,
      endLine: section.endLine,
      content: clipped,
      truncated: clipped.length < content.length
    }));
    remaining -= clipped.length;
    if (remaining <= 0) break;
  }
  return Object.freeze({
    schema: 'tiinex.portable.schema-section.result.v1',
    schemaId: document.schemaId,
    selectors: Object.freeze(wanted),
    matches: Object.freeze(matches),
    truncated: remaining <= 0
  });
}

export function contractCategoryItems(contract = {}, categoryNames = []) {
  const names = new Set(normalizeSelectors(categoryNames).map(normalizeKey));
  const items = [];
  for (const group of contract.groups || []) {
    for (const category of group.categories || []) {
      if (!names.has(normalizeKey(category.name))) continue;
      items.push(...category.items);
    }
  }
  return uniqueStrings(items);
}

export function unconditionalContractCategoryItems(contract = {}, categoryNames = []) {
  const names = new Set(normalizeSelectors(categoryNames).map(normalizeKey));
  const items = [];
  for (const group of contract.groups || []) {
    if (groupRequiredWhen(group).length) continue;
    for (const category of group.categories || []) {
      if (!names.has(normalizeKey(category.name))) continue;
      items.push(...category.items);
    }
  }
  return uniqueStrings(items);
}

export function conditionalContractGroups(contract = {}) {
  return Object.freeze((contract.groups || []).flatMap((group) => {
    const requiredWhen = groupRequiredWhen(group);
    if (!requiredWhen.length) return [];
    return [Object.freeze({
      name: group.name,
      requiredWhen: Object.freeze(requiredWhen),
      requiredSections: Object.freeze(uniqueStrings([
        ...groupCategoryItems(group, ['Required Sections', 'Header Sections', 'Footer Sections']).map(cleanContractToken),
        ...groupCategoryItems(group, ['Required Shape']).flatMap(extractHeadingRequirements)
      ])),
      requiredFields: Object.freeze(uniqueStrings(groupCategoryItems(group, ['Required Fields', 'Required Entries']).map(cleanContractToken)))
    })];
  }));
}

export function contractRules(contract = {}) {
  return contractCategoryItems(contract, ['Rules']);
}

export function requiredSchemaSections(document = {}) {
  const direct = unconditionalContractCategoryItems(document.validation, ['Required Sections', 'Header Sections', 'Footer Sections']);
  const shape = unconditionalContractCategoryItems(document.validation, ['Required Shape']).flatMap(extractHeadingRequirements);
  return uniqueStrings([...direct.map(cleanContractToken), ...shape]);
}

export function optionalSchemaSections(document = {}) {
  return uniqueStrings(contractCategoryItems(document.validation, ['Optional Sections']).map(cleanContractToken));
}

export function requiredSchemaFields(document = {}) {
  return uniqueStrings(unconditionalContractCategoryItems(document.validation, ['Required Fields', 'Required Entries']).map(cleanContractToken));
}

export function optionalSchemaFields(document = {}) {
  return uniqueStrings(contractCategoryItems(document.validation, ['Optional Fields']).map(cleanContractToken));
}

export function requiredCreationInputFields(document = {}) {
  return uniqueStrings(contractCategoryItemsExcludingToolingGroups(document.creation, [
    'Required Inputs', 'Required Fields', 'Creation Fields'
  ], { unconditionalOnly: true }).map(cleanContractToken));
}

export function optionalCreationInputFields(document = {}) {
  return uniqueStrings(contractCategoryItemsExcludingToolingGroups(document.creation, [
    'Optional Inputs', 'Optional Fields'
  ], { unconditionalOnly: true }).map(cleanContractToken));
}

export function requiredCreationSections(document = {}) {
  const direct = contractCategoryItemsExcludingToolingGroups(document.creation, ['Required Sections', 'Header Sections', 'Footer Sections'], { unconditionalOnly: true });
  const shape = contractCategoryItemsExcludingToolingGroups(document.creation, ['Required Shape'], { unconditionalOnly: true })
    .flatMap(extractHeadingRequirements)
    .filter((heading) => !isTemplatePlaceholderHeading(heading));
  return uniqueStrings([...direct.map(cleanContractToken), ...shape]);
}

export function requiredCreationContentInputs(document = {}) {
  const placeholders = contractCategoryItemsExcludingToolingGroups(document.creation, ['Required Shape'], { unconditionalOnly: true })
    .flatMap(extractTemplatePlaceholders)
    .map(humanizeToken);
  const validationGroups = new Map((document.validation?.groups || []).map((group) => [normalizeKey(group.name), group]));
  const sectionInputs = requiredCreationSections(document).filter((section) => {
    const group = validationGroups.get(normalizeKey(section));
    return groupCategoryItems(group, ['Required Fields', 'Required Entries']).length === 0;
  });
  return uniqueStrings([...placeholders, ...sectionInputs]);
}

export function creationToolingConfigurationFields(document = {}) {
  const fields = [];
  for (const group of document.creation?.groups || []) {
    if (!isToolingConfigurationGroup(group)) continue;
    fields.push(...groupCategoryItems(group, ['Required Fields', 'Optional Fields', 'Prompt Fields']).map(cleanContractToken));
  }
  return uniqueStrings(fields);
}

export function conditionalCreationInputs(document = {}) {
  const explicit = [];
  for (const group of document.creation?.groups || []) {
    const categoryItems = groupCategoryItems(group, ['Conditional Inputs']).map(cleanContractToken);
    if (categoryItems.length) {
      explicit.push(Object.freeze({
        group: group.name,
        requiredWhen: Object.freeze(groupRequiredWhen(group)),
        fields: Object.freeze(uniqueStrings(categoryItems))
      }));
    }
  }
  const conditionalGroups = conditionalContractGroups(document.creation).map((group) => Object.freeze({
    group: group.name,
    requiredWhen: group.requiredWhen,
    fields: group.requiredFields
  }));
  return Object.freeze([...explicit, ...conditionalGroups].filter((entry) => entry.fields.length));
}

export function creationInputFields(document = {}) {
  return uniqueStrings([
    ...requiredCreationInputFields(document),
    ...optionalCreationInputFields(document),
    ...conditionalCreationInputs(document).flatMap((entry) => entry.fields)
  ]);
}

function parseHeadingSections(markdown = '') {
  const lines = markdown.split('\n');
  const headings = [];
  let fenced = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;
    headings.push({ index, level: match[1].length, title: match[2].trim() });
  }
  return headings.map((heading, position) => {
    const nextAny = headings[position + 1]?.index ?? lines.length;
    let nextPeer = lines.length;
    for (let cursor = position + 1; cursor < headings.length; cursor += 1) {
      if (headings[cursor].level <= heading.level) {
        nextPeer = headings[cursor].index;
        break;
      }
    }
    const content = lines.slice(heading.index + 1, nextAny).join('\n').trim();
    const fullContent = lines.slice(heading.index, nextPeer).join('\n').trim();
    return Object.freeze({
      level: heading.level,
      title: heading.title,
      line: heading.index + 1,
      endLine: nextPeer,
      content,
      fullContent
    });
  });
}

function parseContractGroups(section = null) {
  if (!section) return Object.freeze({ groups: Object.freeze([]) });
  const lines = section.fullContent.split('\n');
  const groups = [];
  let current = null;
  let category = null;
  let fenced = false;
  const flushCategory = () => {
    if (!current || !category) return;
    current.categories.push(Object.freeze({ name: category.name, items: Object.freeze(category.items) }));
    category = null;
  };
  const flushGroup = () => {
    flushCategory();
    if (!current) return;
    groups.push(Object.freeze({ name: current.name, categories: Object.freeze(current.categories) }));
    current = null;
  };
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const groupMatch = line.match(/^###\s+(.+?)\s*$/);
    if (groupMatch) {
      flushGroup();
      current = { name: groupMatch[1].trim(), categories: [] };
      continue;
    }
    if (!current) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^-\s+/.test(trimmed)) {
      if (!category) category = { name: 'Items', items: [] };
      category.items.push(trimmed.replace(/^-\s+/, '').trim());
      continue;
    }
    const nextNonEmpty = nextMeaningfulLine(lines, index + 1);
    if (nextNonEmpty && /^-\s+/.test(nextNonEmpty.trim())) {
      flushCategory();
      category = { name: trimmed, items: [] };
    }
  }
  flushGroup();
  return Object.freeze({ groups: Object.freeze(groups) });
}

function contractCategoryItemsExcludingToolingGroups(contract = {}, categoryNames = [], options = {}) {
  const names = new Set(normalizeSelectors(categoryNames).map(normalizeKey));
  const items = [];
  for (const group of contract.groups || []) {
    if (isToolingConfigurationGroup(group)) continue;
    if (options.unconditionalOnly && groupRequiredWhen(group).length) continue;
    for (const category of group.categories || []) {
      if (names.has(normalizeKey(category.name))) items.push(...category.items);
    }
  }
  return uniqueStrings(items);
}

function isToolingConfigurationGroup(group = {}) {
  const key = normalizeKey(group.name);
  return key === 'prompt fields'
    || key.includes('tooling configuration')
    || key.includes('create surface configuration')
    || key.includes('ui configuration');
}

function groupCategoryItems(group = {}, categoryNames = []) {
  const names = new Set(normalizeSelectors(categoryNames).map(normalizeKey));
  return uniqueStrings((group.categories || []).flatMap((category) => names.has(normalizeKey(category.name)) ? category.items : []));
}

function groupRequiredWhen(group = {}) {
  return groupCategoryItems(group, ['Required When']).map(cleanContractToken);
}

function findSection(sections = [], title = '') {
  const wanted = normalizeKey(title);
  return sections.find((section) => normalizeKey(section.title) === wanted) || null;
}

function extractHeadingRequirements(value = '') {
  const text = String(value || '');
  const matches = [...text.matchAll(/`(#{1,6})\s+([^`]+)`/g)].map((match) => match[2].trim());
  if (matches.length) return matches;
  const plain = text.match(/^(#{1,6})\s+(.+)$/);
  return plain ? [plain[2].trim()] : [];
}

function isTemplatePlaceholderHeading(value = '') {
  return /^\{\{\s*[a-zA-Z0-9_.-]+\s*\}\}$/.test(String(value || '').trim());
}

function extractTemplatePlaceholders(value = '') {
  return [...String(value || '').matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)].map((match) => match[1]);
}

function humanizeToken(value = '') {
  const text = String(value || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[._-]+/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function cleanContractToken(value = '') {
  return String(value || '').trim().replace(/^`|`$/g, '').replace(/^#{1,6}\s+/, '').replace(/\s+section$/i, '').trim();
}

function sectionMatches(section = {}, selector = '') {
  const wanted = normalizeKey(selector);
  const actual = normalizeKey(section.title);
  return actual === wanted || actual.includes(wanted) || wanted.includes(actual);
}

function normalizeSelectors(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((item) => String(item || '').trim()).filter(Boolean);
}

function normalizeKey(value = '') {
  return String(value || '').toLowerCase().replace(/[`*_#]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function nextMeaningfulLine(lines = [], start = 0) {
  for (let index = start; index < lines.length; index += 1) {
    if (lines[index].trim()) return lines[index];
  }
  return '';
}

function firstParagraph(value = '') {
  return String(value || '').trim().split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
}

function normalizePositiveInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim()).filter(Boolean))];
}

function safeParseArtifact(markdown = '') {
  try { return parseArtifactMarkdown(markdown); }
  catch { return { envelope: {}, body: {}, title: '' }; }
}
