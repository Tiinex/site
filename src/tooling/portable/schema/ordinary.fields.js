import { declarationOwnershipRanges, parseDeclarationsAgainstContract } from './named.declarations.js';

export const PORTABLE_ORDINARY_FIELD_INSTANCE_SCHEMA_ID = 'tiinex.portable.ordinary-field-instance.v1';

export function resolveOrdinaryFieldInstances(markdown = '', compiledContract = {}, options = {}) {
  const source = String(markdown || '');
  const blocks = parseHeadingBlocks(source);
  const parsedDeclarations = options.parsedDeclarations || parseDeclarationsAgainstContract(source, compiledContract?.declarations || []);
  const declarationOwnership = declarationOwnershipRanges(parsedDeclarations);
  const groups = (compiledContract?.validation?.ordinaryGroups || []).map((contract) => resolveGroup(contract, blocks, declarationOwnership));
  return Object.freeze({
    schema: PORTABLE_ORDINARY_FIELD_INSTANCE_SCHEMA_ID,
    groups: Object.freeze(groups)
  });
}

function resolveGroup(contract = {}, blocks = [], declarationOwnership = []) {
  const compiledQualification = String(contract.qualification || 'unresolved');
  const targetContract = contract.target || {};
  if (compiledQualification !== 'valid' || targetContract.qualification !== 'valid' || !targetContract.title) {
    return Object.freeze({
      group: contract.group || '',
      qualification: compiledQualification === 'valid' ? String(targetContract.qualification || 'unresolved') : compiledQualification,
      target: projectTarget(targetContract, [], false),
      fields: Object.freeze(projectFields(contract, [])),
      contributors: contract.contributors || Object.freeze([])
    });
  }

  const exactBlocks = blocks.filter((block) => block.level === Number(targetContract.level || 0) && block.title === targetContract.title);
  const ambiguous = exactBlocks.length > 1;
  const block = exactBlocks.length === 1 ? exactBlocks[0] : null;
  const targetPresent = exactBlocks.length > 0;
  const targetQualification = ambiguous ? 'ambiguous' : targetContract.requiredness === 'unresolved' && !targetPresent ? 'unresolved' : 'resolved';
  const fieldDeclarations = [...(contract.requiredFields || []).map((label) => ({ label, requirement: 'required' })),
    ...(contract.optionalFields || []).map((label) => ({ label, requirement: 'optional' }))];
  const fields = fieldDeclarations.map((declaration) => resolveField(declaration, block, {
    ambiguous,
    targetPresent,
    requiredness: targetContract.requiredness,
    declarationOwnership
  }));

  return Object.freeze({
    group: contract.group || '',
    qualification: ambiguous ? 'ambiguous' : targetQualification,
    target: projectTarget(targetContract, exactBlocks, targetPresent, targetQualification),
    fields: Object.freeze(fields),
    contributors: contract.contributors || Object.freeze([])
  });
}

function projectTarget(target = {}, blocks = [], present = false, qualification = '') {
  return Object.freeze({
    heading: String(target.heading || ''),
    title: String(target.title || ''),
    level: Number(target.level || 0),
    authority: String(target.authority || ''),
    requiredness: String(target.requiredness || 'unresolved'),
    qualification: qualification || String(target.qualification || 'unresolved'),
    present: Boolean(present),
    occurrenceCount: blocks.length,
    occurrences: Object.freeze(blocks.map((block) => Object.freeze({
      line: block.line,
      endLine: block.endLine,
      order: block.order
    })))
  });
}

function projectFields(contract = {}, occurrences = []) {
  return [
    ...(contract.requiredFields || []).map((label) => Object.freeze({ label, requirement: 'required', qualification: 'unresolved', occurrences: Object.freeze(occurrences) })),
    ...(contract.optionalFields || []).map((label) => Object.freeze({ label, requirement: 'optional', qualification: 'unresolved', occurrences: Object.freeze(occurrences) }))
  ];
}

function resolveField(declaration = {}, block = null, context = {}) {
  if (context.ambiguous) {
    return Object.freeze({
      label: declaration.label,
      requirement: declaration.requirement,
      qualification: 'unresolved',
      occurrences: Object.freeze([])
    });
  }
  if (!context.targetPresent) {
    const inactiveOptionalTarget = context.requiredness === 'optional';
    return Object.freeze({
      label: declaration.label,
      requirement: declaration.requirement,
      qualification: inactiveOptionalTarget || declaration.requirement === 'optional' ? 'absent' : context.requiredness === 'required' ? 'missing-required' : 'unresolved',
      occurrences: Object.freeze([])
    });
  }
  const occurrences = (block?.fields || []).filter((field) => field.label === declaration.label && !lineOwnedByDeclaration(field.line, context.declarationOwnership));
  const qualification = occurrences.length > 1
    ? 'duplicate'
    : occurrences.length === 1
      ? 'present'
      : declaration.requirement === 'required'
        ? 'missing-required'
        : 'absent';
  return Object.freeze({
    label: declaration.label,
    requirement: declaration.requirement,
    qualification,
    occurrences: Object.freeze(occurrences.map((field) => Object.freeze({
      value: field.value,
      rawValue: field.rawValue,
      line: field.line,
      order: field.order,
      form: field.form
    })))
  });
}

function lineOwnedByDeclaration(line = 0, ranges = []) {
  const target = Number(line || 0);
  return target > 0 && (ranges || []).some((range) => target >= Number(range.line || 0) && target <= Number(range.endLine || 0));
}

export function parseHeadingBlocks(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const headings = [];
  let fenced = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) continue;
    headings.push({ index, level: match[1].length, title: match[2].trim() });
  }

  const blocks = [];
  let order = 0;
  for (let position = 0; position < headings.length; position += 1) {
    const heading = headings[position];
    let end = lines.length;
    for (let cursor = position + 1; cursor < headings.length; cursor += 1) {
      if (headings[cursor].level <= heading.level) { end = headings[cursor].index; break; }
    }
    const directContentEnd = Math.min(end, headings[position + 1]?.index ?? end);
    blocks.push(Object.freeze({
      level: heading.level,
      title: heading.title,
      line: heading.index + 1,
      endLine: end,
      order: order++,
      fields: Object.freeze(parseTopLevelFieldOccurrences(lines, heading.index + 1, directContentEnd))
    }));
  }
  return Object.freeze(blocks);
}

export function parseSecondLevelBlocks(markdown = '') {
  return Object.freeze(parseHeadingBlocks(markdown).filter((block) => block.level === 2));
}

function parseTopLevelFieldOccurrences(lines = [], start = 0, end = 0) {
  const fields = [];
  let fenced = false;
  let order = 0;
  for (let index = start; index < end; index += 1) {
    const raw = lines[index];
    if (/^\s*```/.test(raw)) { fenced = !fenced; continue; }
    if (fenced) continue;

    const scalar = raw.match(/^-\s+([^:]+):\s*(.*?)\s*$/);
    if (scalar) {
      fields.push(Object.freeze({
        label: scalar[1].trim(),
        value: scalar[2],
        rawValue: scalar[2],
        line: index + 1,
        order: order++,
        form: 'scalar'
      }));
      continue;
    }

    const block = raw.match(/^-\s+([^:]+?)\s*$/);
    if (!block) continue;
    const nested = [];
    let cursor = index + 1;
    while (cursor < end) {
      const next = lines[cursor];
      if (!next.trim()) { nested.push(next); cursor += 1; continue; }
      if (/^\s+/.test(next)) { nested.push(next); cursor += 1; continue; }
      break;
    }
    if (!nested.some((line) => /^\s+-\s+/.test(line))) continue;
    const rawValue = nested.join('\n').trimEnd();
    fields.push(Object.freeze({
      label: block[1].trim(),
      value: rawValue,
      rawValue,
      line: index + 1,
      order: order++,
      form: 'block'
    }));
  }
  return fields;
}
