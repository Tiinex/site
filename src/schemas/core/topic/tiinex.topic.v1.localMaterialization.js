import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { compilePortableSchemaContractChain } from '../../../tooling/portable/schema/contract.compile.js';
import { topicValidate } from './tiinex.topic.v1.validate.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { inspectCreationRepresentation } from '../../creation.representation.js';


function exactRepresentationMultiplicity(representation = {}, mode = 'root') {
  if (representation.continuityContextHeadings !== 1 || representation.currentBlocks !== 1 || representation.currentSchema?.length !== 1 || representation.createdAt?.length !== 1 || representation.summary?.length !== 1 || representation.bodyH1?.length !== 1 || representation.integrityHeadings !== 1 || representation.selfIntegrityEntries?.length !== 1) return false;
  if (representation.parentBlocks !== (mode === 'parent' ? 1 : 0)) return false;
  return REQUIRED_INPUTS.slice(1).every((name) => (representation.sectionBodies?.[name] || []).length === 1);
}

export const CANONICAL_TOPIC_LOCAL_MATERIALIZER_SCHEMA_ID = 'tiinex.site.canonical-topic-local-materializer.v1';
export const CANONICAL_TOPIC_SCHEMA_ID = 'tiinex.topic.v1';
export const TOPIC_CANONICAL_REQUIRED_INPUTS = Object.freeze(['Summary', 'Current Read', 'Design Direction', 'Next Artifacts']);
const REQUIRED_INPUTS = TOPIC_CANONICAL_REQUIRED_INPUTS;

export function renderCanonicalTopicLocalArtifact(input = {}) {
  const values = input.values || {};
  const parent = input.parent || null;
  const continuityMode = input.continuityMode === 'parent' ? 'parent' : 'root';
  const parentQualified = continuityMode === 'root' ? !parent : Boolean(parent?.state === 'qualified' && parent?.finalized === true && String(parent?.schemaId || '').trim());
  if (!parentQualified) return Object.freeze({ state: 'unqualified', reason: continuityMode === 'root' ? 'root-parent-must-be-absent' : 'parent-reference-unavailable', markdown: '' });
  if (!REQUIRED_INPUTS.every((name) => Object.prototype.hasOwnProperty.call(values, name) && values[name] !== undefined)) {
    return Object.freeze({ state: 'unqualified', reason: 'topic-generation-input-missing', markdown: '' });
  }
  const createdAt = rootTimestamp(input.now instanceof Date ? input.now : new Date(input.now || Date.now()));
  const summary = canonicalSummary(values.Summary);
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
${continuityMode === 'parent' ? `- Parent\n  - Parent Schema: ${parent.schemaId}\n  - Created At: ${parent.createdAt || 'unknown'}\n  - Trace: ${parent.traceTarget}\n  - Origin: ${parent.originTarget}\n  - Boundary: ${parent.boundary || 'explicit-parent-reference'}\n` : ''}- Current
  - Current Schema: tiinex.topic.v1
  - Created At: ${createdAt}
  - Summary: ${summary}

---

# ${summary}

This topic captures the current direction for ${summary}.

## Current Read

${canonicalSection(values['Current Read'])}

## Design Direction

${canonicalSection(values['Design Direction'])}

## Next Artifacts

${canonicalSection(values['Next Artifacts'])}

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: pending
`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') return Object.freeze({ state: 'unqualified', reason: 'canonical-topic-integrity-seal-unavailable', markdown: '' });
  return Object.freeze({ state: 'rendered', markdown: sealed.markdown, createdAt, summary, integrityValue: sealed.value });
}

export function qualifyCanonicalTopicLocalArtifact({ markdown = '', schemaMaterials = [], values = {}, parent = null, path = '', continuityMode = '' } = {}) {
  const mode = continuityMode === 'parent' ? 'parent' : 'root';
  const parentQualified = mode === 'root' ? !parent : Boolean(parent?.state === 'qualified' && parent?.finalized === true && String(parent?.schemaId || '').trim());
  if (!parentQualified) return Object.freeze({ state: 'invalid', reason: mode === 'root' ? 'root-parent-must-be-absent' : 'parent-reference-unavailable', findings: Object.freeze([]), record: null });
  let compiled, parsed, projection;
  try {
    compiled = compilePortableSchemaContractChain(schemaMaterials);
    parsed = parseArtifactMarkdown(markdown);
    const schemaFindings = topicValidate(parsed);
    projection = Object.freeze({ schema: 'tiinex.site.schema-local-materialization-qualification.v1', validation: Object.freeze({ findings: Object.freeze(schemaFindings) }) });
  } catch (_) { return Object.freeze({ state: 'invalid', reason: 'canonical-topic-parse-or-compile-failed', findings: Object.freeze([]), record: null }); }
  const errors = (projection.validation?.findings || []).filter((finding) => finding?.severity === 'error' || finding?.state === 'structurally-invalid' || finding?.state === 'contradictory');
  const sections = sectionBodies(markdown);
  const representation = inspectCreationRepresentation(markdown, { boundSections: REQUIRED_INPUTS.slice(1) });
  const current = parsed.envelope?.current || {};
  const exactBody = REQUIRED_INPUTS.slice(1).every((name) => sections[name] === canonicalSection(values[name]));
  const integrity = canonicalC14nV2SelfState(markdown);
  const invariant = compiled.schemaId === CANONICAL_TOPIC_SCHEMA_ID
    && current.schema?.id === CANONICAL_TOPIC_SCHEMA_ID
    && String(current.summary || '') === canonicalSummary(values.Summary)
    && (mode === 'root'
      ? !declaredParentEnvelope(parsed.envelope?.parent)
      : String(parsed.envelope?.parent?.schema?.id || '') === String(parent.schemaId || '')
        && String(parsed.envelope?.parent?.trace || '') === String(parent.traceTarget || '')
        && String(parsed.envelope?.parent?.origin || '') === String(parent.originTarget || '')
        && String(parsed.envelope?.parent?.boundary || '') === String(parent.boundary || 'explicit-parent-reference'))
    && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(current.createdAt || ''))
    && firstBodyHeading(markdown) === canonicalSummary(values.Summary)
    && exactBody
    && exactRepresentationMultiplicity(representation, mode)
    && integrity.state === 'verified';
  if (errors.length || !invariant) return Object.freeze({ state: 'invalid', reason: errors.length ? 'canonical-topic-contract-errors' : 'canonical-topic-invariant-mismatch', findings: Object.freeze(errors), record: null, projection });
  const record = Object.assign(createRecordFromMarkdown(markdown, { path, name: canonicalSummary(values.Summary), sourceMode: 'local-transition-canonical' }), {
    kind: CANONICAL_TOPIC_SCHEMA_ID,
    schemaId: CANONICAL_TOPIC_SCHEMA_ID,
    status: 'local',
    sourceMode: 'local-transition-canonical',
    path,
    hasContinuityContext: true,
    hasIntegrity: true
  });
  return Object.freeze({ state: 'qualified', reason: '', findings: Object.freeze(errors), record, projection });
}

function rootTimestamp(date) { return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''); }
function scalar(value) { return String(value === null ? '' : value ?? ''); }
function canonicalSummary(value) { return scalar(value).trim(); }
function canonicalSection(value) { return scalar(value).trimEnd(); }
function declaredParentEnvelope(parent = null) { return Boolean(parent && (String(parent.schema?.id || '').trim() || String(parent.trace || '').trim() || String(parent.origin || '').trim() || String(parent.createdAt || '').trim())); }
function firstBodyHeading(markdown) { return String(markdown).split('\n---\n')[1]?.match(/^#\s+(.+)$/m)?.[1]?.trim() || ''; }
function sectionBodies(markdown) {
  const body = String(markdown).split('\n---\n')[1] || '';
  const out = {};
  for (const name of REQUIRED_INPUTS.slice(1)) {
    const match = body.match(new RegExp(`^## ${escapeRegExp(name)}\\n\\n([\\s\\S]*?)(?=\\n\\n## |\\n\\n# Continuity Integrity|$)`, 'm'));
    out[name] = match ? match[1].trimEnd() : undefined;
  }
  return out;
}
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export const topicLocalMaterialization = Object.freeze({
  schemaId: CANONICAL_TOPIC_SCHEMA_ID,
  label: 'Topic',
  render: renderCanonicalTopicLocalArtifact,
  qualify: qualifyCanonicalTopicLocalArtifact,
  implementation: Object.freeze({ kind: 'browser-local-artifact-representation', status: 'implemented' })
});
