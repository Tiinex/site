import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { compilePortableSchemaContractChain } from '../../../tooling/portable/schema/contract.compile.js';
import { taskValidate } from './tiinex.task.v1.validate.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { inspectCreationRepresentation } from '../../creation.representation.js';
import { TASK_CANONICAL_REQUIRED_INPUTS } from './tiinex.task.v1.contract.js';


function exactRepresentationMultiplicity(representation = {}, mode = 'root') {
  if (representation.continuityContextHeadings !== 1 || representation.currentBlocks !== 1 || representation.currentSchema?.length !== 1 || representation.createdAt?.length !== 1 || representation.summary?.length !== 1 || representation.bodyH1?.length !== 1 || representation.integrityHeadings !== 1 || representation.selfIntegrityEntries?.length !== 1) return false;
  if (representation.parentBlocks !== (mode === 'parent' ? 1 : 0)) return false;
  return REQUIRED_INPUTS.slice(1).every((name) => (representation.sectionBodies?.[name] || []).length === 1);
}

export const CANONICAL_TASK_LOCAL_MATERIALIZER_SCHEMA_ID = 'tiinex.site.canonical-task-local-materializer.v1';
export const CANONICAL_TASK_SCHEMA_ID = 'tiinex.task.v1';
const REQUIRED_INPUTS = TASK_CANONICAL_REQUIRED_INPUTS;

export function renderCanonicalTaskLocalArtifact(input = {}) {
  const values = input.values || {};
  const parent = input.parent || null;
  const continuityMode = input.continuityMode === 'root' ? 'root' : 'parent';
  const parentQualified = continuityMode === 'root'
    ? !parent
    : Boolean(parent?.state === 'qualified' && parent?.finalized === true && String(parent?.schemaId || '').trim());
  const createdAt = rootTimestamp(input.now instanceof Date ? input.now : new Date(input.now || Date.now()));
  if (!parentQualified || !REQUIRED_INPUTS.every((name) => Object.prototype.hasOwnProperty.call(values, name) && values[name] !== undefined)) {
    const reason = !parentQualified ? (continuityMode === 'root' ? 'root-parent-must-be-absent' : 'parent-reference-unavailable') : 'task-generation-input-missing';
    return Object.freeze({ state: 'unqualified', reason, markdown: '' });
  }
  const summary = canonicalSummary(values.Summary);
  const parentEnvelope = continuityMode === 'parent'
    ? `- Parent
  - Parent Schema: ${parent.schemaId}
  - Trace: ${parent.trace}
  - Origin: ${parent.origin}
`
    : '';
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
${parentEnvelope}- Current
  - Current Schema: tiinex.task.v1
  - Created At: ${createdAt}
  - Summary: ${summary}

---

# ${summary}

## Objective

${canonicalSection(values.Objective)}

## Done Criteria

${canonicalSection(values['Done Criteria'])}

## Scope

${canonicalSection(values.Scope)}

## Dependencies

${canonicalSection(values.Dependencies)}

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: pending
`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') return Object.freeze({ state: 'unqualified', reason: 'canonical-task-integrity-seal-unavailable', markdown: '' });
  return Object.freeze({ state: 'rendered', markdown: sealed.markdown, createdAt, summary, integrityValue: sealed.value });
}

export function qualifyCanonicalTaskLocalArtifact({ markdown = '', schemaMaterials = [], values = {}, parent = null, path = '', continuityMode = 'parent' } = {}) {
  const mode = continuityMode === 'root' ? 'root' : 'parent';
  let compiled, parsed, projection;
  try {
    compiled = compilePortableSchemaContractChain(schemaMaterials);
    parsed = parseArtifactMarkdown(markdown);
    const schemaFindings = taskValidate(parsed);
    projection = Object.freeze({ schema: 'tiinex.site.schema-local-materialization-qualification.v1', validation: Object.freeze({ findings: Object.freeze(schemaFindings) }) });
  } catch (_) { return Object.freeze({ state: 'invalid', reason: 'canonical-task-parse-or-compile-failed', findings: Object.freeze([]), record: null }); }
  const errors = (projection.validation?.findings || []).filter((finding) => finding?.severity === 'error' || finding?.state === 'structurally-invalid' || finding?.state === 'contradictory');
  const sections = sectionBodies(markdown);
  const representation = inspectCreationRepresentation(markdown, { boundSections: REQUIRED_INPUTS.slice(1) });
  const current = parsed.envelope?.current || {};
  const parentEnvelope = parsed.envelope?.parent || null;
  const exactBody = REQUIRED_INPUTS.slice(1).every((name) => sections[name] === canonicalSection(values[name]));
  const integrity = canonicalC14nV2SelfState(markdown);
  const parentInvariant = mode === 'root'
    ? !parent && !declaredParentEnvelope(parentEnvelope)
    : Boolean(parent && String(parent.schemaId || '').trim()
      && String(parentEnvelope?.schema?.id || '') === parent.schemaId
      && String(parentEnvelope?.trace || '') === String(parent.traceTarget || '')
      && String(parentEnvelope?.origin || '') === String(parent.originTarget || ''));
  const invariant = compiled.schemaId === CANONICAL_TASK_SCHEMA_ID
    && current.schema?.id === CANONICAL_TASK_SCHEMA_ID
    && String(current.summary || '') === canonicalSummary(values.Summary)
    && parentInvariant
    && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(current.createdAt || ''))
    && firstBodyHeading(markdown) === canonicalSummary(values.Summary)
    && exactBody
    && exactRepresentationMultiplicity(representation, mode)
    && integrity.state === 'verified';
  if (errors.length || !invariant) return Object.freeze({ state: 'invalid', reason: errors.length ? 'canonical-task-contract-errors' : 'canonical-task-invariant-mismatch', findings: Object.freeze(errors), record: null, projection });
  const record = Object.assign(createRecordFromMarkdown(markdown, { path, name: canonicalSummary(values.Summary), sourceMode: 'local-transition-canonical' }), {
    kind: CANONICAL_TASK_SCHEMA_ID,
    schemaId: CANONICAL_TASK_SCHEMA_ID,
    status: 'local',
    sourceMode: 'local-transition-canonical',
    path,
    hasContinuityContext: true,
    hasIntegrity: true
  });
  return Object.freeze({ state: 'qualified', reason: '', findings: Object.freeze(errors), record, projection });
}

export function canonicalTaskRequiredInputs() { return REQUIRED_INPUTS; }
function rootTimestamp(date) { return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''); }
function scalar(value) { return String(value === null ? '' : value ?? ''); }
function canonicalSummary(value) { return scalar(value).trim(); }
function canonicalSection(value) { return scalar(value).trimEnd(); }
function declaredParentEnvelope(parent = null) { return Boolean(parent && (String(parent.schema?.id || '').trim() || String(parent.trace || '').trim() || String(parent.origin || '').trim() || String(parent.createdAt || '').trim())); }
function firstBodyHeading(markdown) { return String(markdown).split('\n---\n')[1]?.match(/^#\s+(.+)$/m)?.[1]?.trim() || ''; }
function sectionBodies(markdown) {
  const body = String(markdown).split('\n---\n')[1] || '';
  const names = REQUIRED_INPUTS.slice(1);
  const out = {};
  for (const name of names) {
    const match = body.match(new RegExp(`^## ${escapeRegExp(name)}\\n\\n([\\s\\S]*?)(?=\\n\\n## |\\n\\n# Continuity Integrity|$)`, 'm'));
    out[name] = match ? match[1].trimEnd() : undefined;
  }
  return out;
}
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export const taskLocalMaterialization = Object.freeze({
  schemaId: CANONICAL_TASK_SCHEMA_ID,
  label: 'Task',
  render: renderCanonicalTaskLocalArtifact,
  qualify: qualifyCanonicalTaskLocalArtifact,
  implementation: Object.freeze({ kind: 'browser-local-artifact-representation', status: 'implemented' })
});
