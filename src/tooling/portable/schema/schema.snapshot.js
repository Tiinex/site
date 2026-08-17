import { createHash } from 'node:crypto';
import { parsePortableSchemaDocument } from './schema.contract.js';
import { projectMachineShapeSemanticIdentity } from './contract.machine-shape.js';

export const PORTABLE_SCHEMA_FRESHNESS_SCHEMA_ID = 'tiinex.portable.schema-freshness.v1';

export function comparePortableSchemaSnapshots(input = {}) {
  const candidate = normalizeSide(input.candidate || input.bundled || {});
  const reference = normalizeSide(input.reference || input.canonical || {});
  if (!candidate.markdown || !reference.markdown) return result('comparison-unresolved', candidate, reference, ['Both candidate and reference schema Markdown must be supplied explicitly.']);
  const candidateDoc = parsePortableSchemaDocument(candidate.markdown);
  const referenceDoc = parsePortableSchemaDocument(reference.markdown);
  if (!candidateDoc.schemaId || !referenceDoc.schemaId) return result('comparison-unresolved', candidate, reference, ['Schema identity could not be parsed from one or both supplied materials.']);
  if (candidateDoc.schemaId !== referenceDoc.schemaId) return result('authority-mismatch', candidate, reference, [`Schema identity differs: ${candidateDoc.schemaId} != ${referenceDoc.schemaId}.`], candidateDoc, referenceDoc);
  if (input.expectedReferenceAuthority) {
    const mismatch = authorityMismatch(reference.authority, input.expectedReferenceAuthority);
    if (mismatch.length) return result('authority-mismatch', candidate, reference, mismatch, candidateDoc, referenceDoc);
  }
  const candidateShape = contractShape(candidateDoc);
  const referenceShape = contractShape(referenceDoc);
  const candidateFingerprint = fingerprint(candidateShape);
  const referenceFingerprint = fingerprint(referenceShape);
  const status = candidateFingerprint === referenceFingerprint ? 'equivalent-current' : 'materially-stale';
  return Object.freeze({
    schema: PORTABLE_SCHEMA_FRESHNESS_SCHEMA_ID,
    status,
    schemaId: referenceDoc.schemaId,
    candidate: Object.freeze({ authority: candidate.authority, fingerprint: candidateFingerprint }),
    reference: Object.freeze({ authority: reference.authority, fingerprint: referenceFingerprint }),
    differences: Object.freeze(status === 'materially-stale' ? diffShapes(candidateShape, referenceShape) : [])
  });
}

function normalizeSide(value) {
  return Object.freeze({ markdown: String(value.markdown || value.content || ''), authority: Object.freeze({ ...(value.authority || value.source || {}) }) });
}

function contractShape(document) {
  return Object.freeze({
    schemaId: document.schemaId,
    parentSchemaId: document.parentSchemaId || '',
    envelopeSchemaId: document.envelopeSchemaId || '',
    validation: normalizeContract(document.validation, { suppressValidationMachineShapes: true }),
    creation: normalizeContract(document.creation),
    machineShapes: projectMachineShapeSemanticIdentity(document)
  });
}

function normalizeContract(contract = {}, options = {}) {
  const suppressValidationMachineShapes = options.suppressValidationMachineShapes === true;
  return (contract.groups || []).map((group) => ({
    name: group.name,
    categories: (group.categories || []).filter((category) => !(suppressValidationMachineShapes && String(category.name || '').trim() === 'Machine Shape Definitions')).map((category) => ({
      name: category.name,
      nodes: canonicalCategoryNodes(category)
    }))
  }));
}

function canonicalCategoryNodes(category = {}) {
  const ordered = String(category.name || '').trim() === 'Ordering';
  const nodes = (category.nodes || []).map((node) => canonicalNode(node, ordered));
  if (nodes.length) return ordered ? nodes : nodes.sort(compareCanonicalNodes);
  const fallback = [...(category.items || [])].map((value) => ({ value: String(value), children: [] }));
  return ordered ? fallback : fallback.sort(compareCanonicalNodes);
}

function canonicalNode(node = {}, ordered = false) {
  const children = (node.children || []).map((child) => canonicalNode(child, ordered));
  if (!ordered) children.sort(compareCanonicalNodes);
  return { value: String(node.value || ''), children };
}

function compareCanonicalNodes(left = {}, right = {}) {
  return compareExactStrings(JSON.stringify(left), JSON.stringify(right));
}

function compareExactStrings(left = '', right = '') {
  const a = String(left);
  const b = String(right);
  return a < b ? -1 : a > b ? 1 : 0;
}


function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function diffShapes(candidate, reference) {
  const diffs = [];
  if ((candidate.parentSchemaId || '') !== (reference.parentSchemaId || '')) diffs.push(`parent schema identity differs: ${candidate.parentSchemaId || '(none)'} != ${reference.parentSchemaId || '(none)'}`);
  if ((candidate.envelopeSchemaId || '') !== (reference.envelopeSchemaId || '')) diffs.push(`envelope schema identity differs: ${candidate.envelopeSchemaId || '(none)'} != ${reference.envelopeSchemaId || '(none)'}`);
  for (const surface of ['validation', 'creation']) {
    const a = JSON.stringify(candidate[surface]);
    const b = JSON.stringify(reference[surface]);
    if (a !== b) diffs.push(`${surface} contract differs`);
  }
  if (JSON.stringify(candidate.machineShapes) !== JSON.stringify(reference.machineShapes)) diffs.push('machine-shape authority differs');
  return diffs;
}

function authorityMismatch(actual = {}, expected = {}) {
  const diffs = [];
  for (const key of ['repository', 'commit', 'path']) {
    if (expected[key] && actual[key] !== expected[key]) diffs.push(`Reference authority ${key} mismatch.`);
  }
  return diffs;
}

function result(status, candidate, reference, differences, candidateDoc = null, referenceDoc = null) {
  return Object.freeze({
    schema: PORTABLE_SCHEMA_FRESHNESS_SCHEMA_ID,
    status,
    schemaId: referenceDoc?.schemaId || candidateDoc?.schemaId || '',
    candidate: Object.freeze({ authority: candidate.authority, fingerprint: '' }),
    reference: Object.freeze({ authority: reference.authority, fingerprint: '' }),
    differences: Object.freeze(differences)
  });
}
