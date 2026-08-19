import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { projectPortableContractInstance } from '../tooling/portable/schema/contract.project.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../integrity/integrity.c14nV2.js';
import {
  INTERPRETATION_CREATION_FIELDS,
  INTERPRETATION_SECTION_FIELDS
} from '../schemas/core/interpretation/tiinex.interpretation.v1.contract.js';

export const CANONICAL_INTERPRETATION_LOCAL_MATERIALIZER_SCHEMA_ID = 'tiinex.site.canonical-interpretation-local-materializer.v1';
export const CANONICAL_INTERPRETATION_SCHEMA_ID = 'tiinex.interpretation.v1';
const REQUIRED_INPUTS = INTERPRETATION_CREATION_FIELDS;

export function renderCanonicalInterpretationLocalArtifact(input = {}) {
  const values = input.values || {};
  const parent = input.parent || {};
  if (parent.state !== 'qualified' || parent.finalized !== true) {
    return Object.freeze({ state: 'unqualified', reason: 'parent-reference-unavailable', markdown: '' });
  }
  if (!REQUIRED_INPUTS.every((name) => Object.prototype.hasOwnProperty.call(values, name) && values[name] !== undefined && scalar(values[name]).trim())) {
    return Object.freeze({ state: 'unqualified', reason: 'interpretation-generation-input-missing', markdown: '' });
  }
  const createdAt = rootTimestamp(input.now instanceof Date ? input.now : new Date(input.now || Date.now()));
  const targetRole = scalar(values['Target Role']).trim();
  const action = scalar(values['Interpretation Action']).trim();
  const summary = `${action || 'Use as'} · ${targetRole || 'Interpretation'}`;
  const body = INTERPRETATION_SECTION_FIELDS.map(([section, fields]) => `## ${section}\n\n${fields.map((field) => `- ${field}: ${scalar(values[field])}`).join('\n')}`).join('\n\n');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: ${parent.schemaId}\n  - Trace: ${parent.trace}\n  - Origin: ${parent.origin}\n- Current\n  - Current Schema: tiinex.interpretation.v1\n  - Created At: ${createdAt}\n  - Summary: ${summary}\n\n---\n\n# ${summary}\n\n${body}\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') return Object.freeze({ state: 'unqualified', reason: 'canonical-interpretation-integrity-seal-unavailable', markdown: '' });
  return Object.freeze({ state: 'rendered', markdown: sealed.markdown, createdAt, summary, integrityValue: sealed.value });
}

export function qualifyCanonicalInterpretationLocalArtifact({ markdown = '', schemaMaterials = [], values = {}, parent = {}, path = '' } = {}) {
  let compiled, parsed, projection;
  try {
    compiled = compilePortableSchemaContractChain(schemaMaterials);
    parsed = parseArtifactMarkdown(markdown);
    projection = projectPortableContractInstance({ markdown, compiledContract: compiled });
  } catch (_) {
    return Object.freeze({ state: 'invalid', reason: 'canonical-interpretation-parse-or-compile-failed', findings: Object.freeze([]), record: null });
  }
  const errors = (projection.validation?.findings || []).filter((finding) => finding?.severity === 'error' || finding?.state === 'structurally-invalid' || finding?.state === 'contradictory');
  const current = parsed.envelope?.current || {};
  const parentEnvelope = parsed.envelope?.parent || {};
  const exactFields = REQUIRED_INPUTS.every((name) => fieldValue(parsed.body?.text || '', name) === scalar(values[name]));
  const integrity = canonicalC14nV2SelfState(markdown);
  const invariant = compiled.schemaId === CANONICAL_INTERPRETATION_SCHEMA_ID
    && current.schema?.id === CANONICAL_INTERPRETATION_SCHEMA_ID
    && String(parentEnvelope.schema?.id || '') === String(parent.schemaId || '')
    && String(parentEnvelope.trace || '') === String(parent.traceTarget || '')
    && String(parentEnvelope.origin || '') === String(parent.originTarget || '')
    && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(current.createdAt || ''))
    && exactFields
    && integrity.state === 'verified';
  if (errors.length || !invariant) {
    return Object.freeze({ state: 'invalid', reason: errors.length ? 'canonical-interpretation-contract-errors' : 'canonical-interpretation-invariant-mismatch', findings: Object.freeze(errors), record: null, projection });
  }
  const record = Object.assign(createRecordFromMarkdown(markdown, { path, name: String(current.summary || ''), sourceMode: 'local-transition-canonical' }), {
    kind: CANONICAL_INTERPRETATION_SCHEMA_ID,
    schemaId: CANONICAL_INTERPRETATION_SCHEMA_ID,
    status: 'local',
    sourceMode: 'local-transition-canonical',
    path,
    hasContinuityContext: true,
    hasIntegrity: true
  });
  return Object.freeze({ state: 'qualified', reason: '', findings: Object.freeze(errors), record, projection });
}

export function canonicalInterpretationRequiredInputs() { return REQUIRED_INPUTS; }

function fieldValue(body = '', field = '') {
  const escaped = String(field).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(body).match(new RegExp(`^\\s*-\\s*${escaped}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
}
function rootTimestamp(date) { return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''); }
function scalar(value) { return String(value === null ? '' : value ?? ''); }
