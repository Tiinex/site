import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { projectPortableContractInstance } from '../tooling/portable/schema/contract.project.js';

export const CANONICAL_TASK_LOCAL_MATERIALIZER_SCHEMA_ID = 'tiinex.site.canonical-task-local-materializer.v1';
export const CANONICAL_TASK_SCHEMA_ID = 'tiinex.task.v1';
const CANONICAL_TOPIC_SCHEMA_ID = 'tiinex.topic.v1';
const REQUIRED_INPUTS = Object.freeze(['Summary', 'Objective', 'Done Criteria', 'Scope', 'Dependencies']);

export function renderCanonicalTaskLocalArtifact(input = {}) {
  const values = input.values || {};
  const parent = input.parent || {};
  const createdAt = rootTimestamp(input.now instanceof Date ? input.now : new Date(input.now || Date.now()));
  if (parent.state !== 'qualified' || parent.schemaId !== CANONICAL_TOPIC_SCHEMA_ID || !REQUIRED_INPUTS.every((name) => Object.prototype.hasOwnProperty.call(values, name) && values[name] !== undefined)) {
    const reason = parent.state !== 'qualified' ? 'parent-reference-unavailable' : parent.schemaId !== CANONICAL_TOPIC_SCHEMA_ID ? 'parent-schema-unsupported' : 'task-generation-input-missing';
    return Object.freeze({ state: 'unqualified', reason, markdown: '' });
  }
  const summary = scalar(values.Summary);
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Parent\n  - Parent Schema: ${parent.schemaId}\n  - Trace: ${parent.trace}\n  - Origin: ${parent.origin}\n- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: ${createdAt}\n  - Summary: ${summary}\n\n---\n\n# ${summary}\n\n## Objective\n\n${scalar(values.Objective)}\n\n## Done Criteria\n\n${scalar(values['Done Criteria'])}\n\n## Scope\n\n${scalar(values.Scope)}\n\n## Dependencies\n\n${scalar(values.Dependencies)}\n\n# Continuity Integrity\n\n- local-transition-canonical-v1\n  - Towards: self\n  - Value: tiinex.site.local-transition:${sourceIdentity(parent)}:${createdAt}\n`;
  return Object.freeze({ state: 'rendered', markdown, createdAt, summary });
}

export function qualifyCanonicalTaskLocalArtifact({ markdown = '', schemaMaterials = [], values = {}, parent = {} } = {}) {
  let compiled, parsed, projection;
  try {
    compiled = compilePortableSchemaContractChain(schemaMaterials);
    parsed = parseArtifactMarkdown(markdown);
    projection = projectPortableContractInstance({ markdown, compiledContract: compiled });
  } catch (_) { return Object.freeze({ state: 'invalid', reason: 'canonical-task-parse-or-compile-failed', findings: Object.freeze([]), record: null }); }
  const errors = (projection.validation?.findings || []).filter((finding) => finding?.severity === 'error' || finding?.state === 'structurally-invalid' || finding?.state === 'contradictory');
  const sections = sectionBodies(markdown);
  const current = parsed.envelope?.current || {};
  const parentEnvelope = parsed.envelope?.parent || {};
  const exactBody = REQUIRED_INPUTS.slice(1).every((name) => sections[name] === scalar(values[name]));
  const invariant = compiled.schemaId === CANONICAL_TASK_SCHEMA_ID
    && current.schema?.id === CANONICAL_TASK_SCHEMA_ID
    && String(current.summary || '') === scalar(values.Summary)
    && parent.schemaId === CANONICAL_TOPIC_SCHEMA_ID
    && String(parentEnvelope.schema?.id || '') === parent.schemaId
    && String(parentEnvelope.trace || '') === String(parent.permalink || '')
    && String(parentEnvelope.origin || '') === String(parent.permalink || '')
    && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(current.createdAt || ''))
    && firstBodyHeading(markdown) === scalar(values.Summary)
    && exactBody;
  if (errors.length || !invariant) return Object.freeze({ state: 'invalid', reason: errors.length ? 'canonical-task-contract-errors' : 'canonical-task-invariant-mismatch', findings: Object.freeze(errors), record: null, projection });
  const record = Object.assign(createRecordFromMarkdown(markdown, { path: '', name: scalar(values.Summary), sourceMode: 'local-transition-canonical' }), {
    kind: CANONICAL_TASK_SCHEMA_ID,
    schemaId: CANONICAL_TASK_SCHEMA_ID,
    status: 'local',
    sourceMode: 'local-transition-canonical',
    path: '',
    hasContinuityContext: true,
    hasIntegrity: true
  });
  return Object.freeze({ state: 'qualified', reason: '', findings: Object.freeze(errors), record, projection });
}

export function canonicalTaskRequiredInputs() { return REQUIRED_INPUTS; }
function rootTimestamp(date) { return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''); }
function scalar(value) { return String(value === null ? '' : value ?? ''); }
function sourceIdentity(parent) { return encodeURIComponent(String(parent.permalink || parent.trace || 'source-topic')); }
function firstBodyHeading(markdown) { return String(markdown).split('\n---\n')[1]?.match(/^#\s+(.+)$/m)?.[1]?.trim() || ''; }
function sectionBodies(markdown) {
  const body = String(markdown).split('\n---\n')[1] || '';
  const names = ['Objective', 'Done Criteria', 'Scope', 'Dependencies'];
  const out = {};
  for (const name of names) {
    const match = body.match(new RegExp(`^## ${escapeRegExp(name)}\\n\\n([\\s\\S]*?)(?=\\n\\n## |\\n\\n# Continuity Integrity|$)`, 'm'));
    out[name] = match ? match[1].trimEnd() : undefined;
  }
  return out;
}
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
