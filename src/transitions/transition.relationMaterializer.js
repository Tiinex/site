import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { projectPortableContractInstance } from '../tooling/portable/schema/contract.project.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../integrity/integrity.c14nV2.js';

export const CANONICAL_RELATION_SCHEMA_ID = 'tiinex.relation.v1';
export const CANONICAL_RELATION_LOCAL_MATERIALIZER_SCHEMA_ID = 'tiinex.site.canonical-relation-local-materializer.v1';
export const REFERENCE_RELATION_REQUIRED_INPUTS = Object.freeze([
  'Relation Type', 'Relation Direction', 'Relation Scope', 'Relation Target',
  'Predicate Identifier', 'Predicate Meaning', 'Subject Binding', 'Object Binding',
  'Directionality', 'Transition Authority', 'Transition Authority Representation Method', 'Transition Authority Representation Value',
  'Generation Authority', 'Generation Authority Representation Method', 'Generation Authority Representation Value'
]);

export function renderCanonicalRelationLocalArtifact(input = {}) {
  const values = input.values || {};
  if (input.parent) return Object.freeze({ state: 'unqualified', reason: 'relation-parent-must-be-absent', markdown: '' });
  if (!REFERENCE_RELATION_REQUIRED_INPUTS.every((name) => scalar(values[name]).trim())) {
    return Object.freeze({ state: 'unqualified', reason: 'relation-generation-input-missing', markdown: '' });
  }
  const createdAt = rootTimestamp(input.now instanceof Date ? input.now : new Date(input.now || Date.now()));
  const title = `Reference: ${readableTarget(values['Subject Binding'])} → ${readableTarget(values['Object Binding'])}`;
  const summary = `${scalar(values['Relation Type'])}: ${readableTarget(values['Subject Binding'])} → ${readableTarget(values['Object Binding'])}`;
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.relation.v1
  - Created At: ${createdAt}
  - Summary: ${summary}

---

# ${title}

## Relation Declaration

- Relation Type: ${scalar(values['Relation Type'])}
- Relation Direction: ${scalar(values['Relation Direction'])}
- Relation Scope: ${scalar(values['Relation Scope'])}

## Relation Target

- Target: ${scalar(values['Relation Target'])}

## Relation Boundary

- This Relation records a typed non-parent binding. The Relation target is not the Tiinex continuity Parent.

## Relation Source

- Subject: ${scalar(values['Subject Binding'])}
- Object: ${scalar(values['Object Binding'])}
- Predicate Identifier: ${scalar(values['Predicate Identifier'])}
- Predicate Meaning: ${scalar(values['Predicate Meaning'])}
- Directionality: ${scalar(values.Directionality)}

## References

- Defining Transition: ${scalar(values['Transition Authority'])}
- Defining Transition Representation Method: ${scalar(values['Transition Authority Representation Method'])}
- Defining Transition Representation Value: ${scalar(values['Transition Authority Representation Value'])}
- Generation Authority: ${scalar(values['Generation Authority'])}
- Generation Authority Representation Method: ${scalar(values['Generation Authority Representation Method'])}
- Generation Authority Representation Value: ${scalar(values['Generation Authority Representation Value'])}

## Interpretation Limits

- Does Not Prove: truth, evidence, authority, dependency, or continuity ancestry.
- Must Not Be Treated As: Parent, Evidence, source provenance, or universal Reference applicability.

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: pending
`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') return Object.freeze({ state: 'unqualified', reason: 'canonical-relation-integrity-seal-unavailable', markdown: '' });
  return Object.freeze({ state: 'rendered', markdown: sealed.markdown, createdAt, summary, integrityValue: sealed.value });
}

export function qualifyCanonicalRelationLocalArtifact({ markdown = '', schemaMaterials = [], values = {}, parent = null, path = '' } = {}) {
  if (parent) return Object.freeze({ state: 'invalid', reason: 'relation-parent-must-be-absent', findings: Object.freeze([]), record: null });
  let compiled, parsed, projection;
  try {
    compiled = compilePortableSchemaContractChain(schemaMaterials);
    parsed = parseArtifactMarkdown(markdown);
    projection = projectPortableContractInstance({ markdown, compiledContract: compiled });
  } catch (_) { return Object.freeze({ state: 'invalid', reason: 'canonical-relation-parse-or-compile-failed', findings: Object.freeze([]), record: null }); }
  const errors = (projection.validation?.findings || []).filter((finding) => finding?.severity === 'error' || finding?.state === 'structurally-invalid' || finding?.state === 'contradictory');
  const current = parsed.envelope?.current || {};
  const body = parsed.body?.text || '';
  const integrity = canonicalC14nV2SelfState(markdown);
  const invariant = compiled.schemaId === CANONICAL_RELATION_SCHEMA_ID
    && current.schema?.id === CANONICAL_RELATION_SCHEMA_ID
    && !declaredParent(parsed.envelope?.parent)
    && fieldValue(body, 'Relation Type') === scalar(values['Relation Type'])
    && fieldValue(body, 'Relation Direction') === scalar(values['Relation Direction'])
    && fieldValue(body, 'Relation Scope') === scalar(values['Relation Scope'])
    && fieldValue(body, 'Target') === scalar(values['Relation Target'])
    && fieldValue(body, 'Predicate Identifier') === scalar(values['Predicate Identifier'])
    && fieldValue(body, 'Predicate Meaning') === scalar(values['Predicate Meaning'])
    && fieldValue(body, 'Subject') === scalar(values['Subject Binding'])
    && fieldValue(body, 'Object') === scalar(values['Object Binding'])
    && fieldValue(body, 'Directionality') === scalar(values.Directionality)
    && fieldValue(body, 'Defining Transition') === scalar(values['Transition Authority'])
    && fieldValue(body, 'Defining Transition Representation Method') === scalar(values['Transition Authority Representation Method'])
    && fieldValue(body, 'Defining Transition Representation Value') === scalar(values['Transition Authority Representation Value'])
    && fieldValue(body, 'Generation Authority') === scalar(values['Generation Authority'])
    && fieldValue(body, 'Generation Authority Representation Method') === scalar(values['Generation Authority Representation Method'])
    && fieldValue(body, 'Generation Authority Representation Value') === scalar(values['Generation Authority Representation Value'])
    && /not\s+(?:the\s+)?tiinex\s+continuity\s+Parent/i.test(sectionBody(body, 'Relation Boundary'))
    && integrity.state === 'verified';
  if (errors.length || !invariant) return Object.freeze({ state: 'invalid', reason: errors.length ? 'canonical-relation-contract-errors' : 'canonical-relation-invariant-mismatch', findings: Object.freeze(errors), record: null, projection });
  const record = Object.assign(createRecordFromMarkdown(markdown, { path, name: String(current.summary || ''), sourceMode: 'local-transition-canonical' }), {
    kind: CANONICAL_RELATION_SCHEMA_ID, schemaId: CANONICAL_RELATION_SCHEMA_ID, status: 'local', sourceMode: 'local-transition-canonical', path, hasContinuityContext: true, hasIntegrity: true
  });
  return Object.freeze({ state: 'qualified', reason: '', findings: Object.freeze(errors), record, projection });
}

function declaredParent(parent = {}) { return Boolean(String(parent?.schema?.id || '').trim() || String(parent?.trace || '').trim() || String(parent?.origin || '').trim()); }
function fieldValue(body = '', field = '') { const escaped = String(field).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return String(body).match(new RegExp(`^\\s*-\\s*${escaped}:\\s*(.+)$`, 'm'))?.[1]?.trim() || ''; }
function sectionBody(body = '', name = '') { const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return String(body).match(new RegExp(`^##\\s+${escaped}[^\\S\\r\\n]*$([\\s\\S]*?)(?=^##\\s+|^#\\s+Continuity Integrity[^\\S\\r\\n]*$|(?![\\s\\S]))`, 'm'))?.[1]?.trim() || ''; }
function readableTarget(value = '') { const text = scalar(value).trim(); return text.length > 70 ? `${text.slice(0, 67)}…` : text; }
function rootTimestamp(date) { return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''); }
function scalar(value) { return String(value === null ? '' : value ?? ''); }
