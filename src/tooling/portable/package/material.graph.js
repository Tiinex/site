import { parsePortableSchemaDocument } from '../schema/schema.contract.js';

export const PORTABLE_MATERIAL_GRAPH_SCHEMA_ID = 'tiinex.portable.material-graph.v1';

export function indexPortableMaterials(materials = []) {
  const normalized = (Array.isArray(materials) ? materials : []).map((material, index) => normalizeMaterial(material, index));
  const byKeyCandidates = new Map();
  const byKey = new Map();
  const byPath = new Map();
  const byReference = new Map();
  for (const material of normalized) {
    pushIndex(byKeyCandidates, material.representationKey, material);
    if (material.path) pushIndex(byPath, material.path, material);
    for (const reference of material.referenceAliases) pushIndex(byReference, reference, material);
  }
  const representationKeyConflicts = [];
  for (const [representationKey, candidates] of byKeyCandidates) {
    if (candidates.length === 1) byKey.set(representationKey, candidates[0]);
    else representationKeyConflicts.push(Object.freeze({
      representationKey,
      candidates: Object.freeze(candidates.map((material) => Object.freeze({
        suppliedIndex: material.suppliedIndex,
        path: material.path,
        schemaId: material.schemaId,
        source: material.source
      })))
    }));
  }
  return Object.freeze({
    schema: PORTABLE_MATERIAL_GRAPH_SCHEMA_ID,
    materials: Object.freeze(normalized),
    byKey,
    byKeyCandidates,
    byPath,
    byReference,
    representationKeyConflicts: Object.freeze(representationKeyConflicts)
  });
}

export function resolvePortableMaterialReference(index = {}, fromMaterial = {}, target = '') {
  const reference = String(target || '');
  if (!reference) return resolution('unresolved', [], '', false, 'Reference target is empty.');

  // Absolute references resolve only through exact explicitly supplied aliases.
  // Relative references are always source-topology relative and must never be
  // captured first by a repository/global alias with the same text.
  if (isAbsoluteReference(reference)) {
    const exact = index.byReference?.get(reference) || [];
    if (exact.length) return exact.length === 1
      ? resolution('resolved', exact, reference, false, '')
      : resolution('ambiguous', exact, reference, false, `Exact reference resolves to ${exact.length} material representations.`);
    return resolution('unresolved', [], reference, false, 'Absolute reference is not present in the explicitly supplied material graph.');
  }

  if (!fromMaterial?.path) return resolution('unresolved', [], reference, false, 'Relative reference cannot resolve without a source material path.');
  const joined = resolveRelativePath(dirname(fromMaterial.path), reference);
  if (joined.escaped) return resolution('unresolved', [], joined.path, true, 'Relative reference escapes the available path root.');
  const candidates = index.byPath?.get(joined.path) || [];
  if (candidates.length === 1) return resolution('resolved', candidates, joined.path, false, '');
  if (candidates.length > 1) return resolution('ambiguous', candidates, joined.path, false, `Relative reference resolves to ${candidates.length} material representations.`);
  return resolution('unresolved', [], joined.path, false, 'Relative reference target is not present in the explicitly supplied material graph.');
}

export function extractQualifiedMarkdownLinkTarget(value = '') {
  const text = String(value || '');
  // This is intentionally a decomposition helper, not a shape matcher. Callers must
  // first prove the scalar matched canonical Machine Shape authority.
  if (!text.startsWith('[') || !text.endsWith(')')) return '';
  const separator = text.indexOf('](');
  if (separator < 1) return '';
  return text.slice(separator + 2, -1);
}


export function portableFieldDomainOccurrenceQualification(projection = {}, group = '', field = '', value = '', entry = '') {
  const bucket = (projection.fieldDomains?.groups || []).find((item) => exactToken(item.group) === exactToken(group) && exactToken(item.field) === exactToken(field));
  if (!bucket) return 'unresolved';
  const occurrence = (bucket.occurrences || []).find((item) => {
    if (String(item.value ?? '') !== String(value ?? '')) return false;
    if (entry && item.owner?.kind === 'declaration') return exactToken(item.owner.entry) === exactToken(entry);
    return true;
  });
  return String(occurrence?.qualification || 'unresolved');
}

export function normalizePortablePath(value = '') {
  const text = String(value || '').replace(/\\/g, '/');
  const absolute = text.startsWith('/');
  const parts = [];
  for (const raw of text.split('/')) {
    const part = raw.trim() === '' ? '' : raw;
    if (!part || part === '.') continue;
    if (part === '..') {
      if (parts.length && parts.at(-1) !== '..') parts.pop();
      else if (!absolute) parts.push('..');
      continue;
    }
    parts.push(part);
  }
  const joined = parts.join('/');
  return absolute ? `/${joined}` : joined;
}

export function dirname(value = '') {
  const path = normalizePortablePath(value);
  const index = path.lastIndexOf('/');
  if (index < 0) return '';
  if (index === 0) return '/';
  return path.slice(0, index);
}

export function pathWithinBoundary(path = '', root = '') {
  const candidate = normalizePortablePath(path);
  const boundary = normalizePortablePath(root);
  if (!boundary) return !candidate.startsWith('..') && !candidate.startsWith('/');
  return candidate === boundary || candidate.startsWith(`${boundary}/`);
}

export function relativePathEscapesBoundary(fromMaterial = {}, target = '', boundaryRoot = '') {
  if (isAbsoluteReference(target)) return false;
  if (!fromMaterial?.path) return true;
  const resolved = resolveRelativePath(dirname(fromMaterial.path), target);
  return resolved.escaped || !pathWithinBoundary(resolved.path, boundaryRoot);
}

export function isAbsoluteReference(value = '') {
  const text = String(value || '');
  const colon = text.indexOf(':');
  if (colon <= 0) return text.startsWith('//');
  const scheme = text.slice(0, colon);
  if (!isAsciiLetter(scheme[0])) return false;
  for (const char of scheme.slice(1)) {
    if (!(isAsciiLetter(char) || isAsciiDigit(char) || char === '+' || char === '-' || char === '.')) return false;
  }
  return true;
}

export function materialIsSchemaDocument(material = {}) {
  return Boolean(material.schemaDocument?.validation?.groups?.length);
}

export function materialUnderAnyBoundary(material = {}, roots = []) {
  return (roots || []).some((root) => pathWithinBoundary(material.path, root));
}

function normalizeMaterial(material = {}, index = 0) {
  const markdown = String(material.markdown ?? material.content ?? material.text ?? '');
  const path = normalizePortablePath(material.path || '');
  const schemaDocument = safeParseSchema(markdown);
  const explicitKey = String(material.representationId || material.representationKey || material.id || '').trim();
  const representationKey = explicitKey || `supplied-material:${index}`;
  const aliases = unique([
    material.reference,
    material.url,
    material.href,
    material.source?.reference,
    material.source?.url,
    material.source?.href
  ].filter((value) => value !== null && typeof value !== 'undefined' && String(value).trim().length > 0));
  return Object.freeze({
    representationKey,
    path,
    markdown,
    schemaId: String(schemaDocument.schemaId || '').trim(),
    parentSchemaId: String(schemaDocument.parentSchemaId || '').trim(),
    title: String(schemaDocument.title || '').trim(),
    schemaDocument,
    referenceAliases: Object.freeze(aliases),
    source: Object.freeze(serializableSource(material.source || {})),
    suppliedIndex: index
  });
}

function resolveRelativePath(base = '', target = '') {
  const targetText = String(target || '').replace(/\\/g, '/');
  const baseParts = normalizePortablePath(base).split('/').filter(Boolean);
  const absolute = normalizePortablePath(base).startsWith('/');
  let escaped = false;
  for (const part of targetText.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (baseParts.length) baseParts.pop();
      else escaped = true;
    } else {
      baseParts.push(part);
    }
  }
  const path = `${absolute ? '/' : ''}${baseParts.join('/')}`;
  return { path: normalizePortablePath(path), escaped };
}

function resolution(qualification, candidates, target, escaped, finding) {
  return Object.freeze({
    qualification,
    target,
    escaped,
    candidates: Object.freeze([...(candidates || [])]),
    finding: String(finding || '')
  });
}

function pushIndex(map, key, value) {
  const token = String(key || '');
  if (!token) return;
  if (!map.has(token)) map.set(token, []);
  map.get(token).push(value);
}

function safeParseSchema(markdown) {
  try { return parsePortableSchemaDocument(markdown); } catch { return { validation: { groups: [] }, creation: { groups: [] } }; }
}

function serializableSource(source = {}) {
  const out = {};
  for (const [key, value] of Object.entries(source || {})) {
    if (typeof value === 'function' || typeof value === 'undefined') continue;
    out[key] = value;
  }
  return out;
}

function unique(values = []) {
  return [...new Set(values.map((value) => String(value || '')).filter(Boolean))];
}

function exactToken(value = '') { return String(value || '').trim(); }

function isAsciiLetter(char = '') {
  const code = String(char || '').charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isAsciiDigit(char = '') {
  const code = String(char || '').charCodeAt(0);
  return code >= 48 && code <= 57;
}
