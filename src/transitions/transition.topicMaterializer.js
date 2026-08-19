import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { compilePortableSchemaContractChain } from '../tooling/portable/schema/contract.compile.js';
import { projectPortableContractInstance } from '../tooling/portable/schema/contract.project.js';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../integrity/integrity.c14nV2.js';

export const CANONICAL_TOPIC_LOCAL_MATERIALIZER_SCHEMA_ID = 'tiinex.site.canonical-topic-local-materializer.v1';
export const CANONICAL_TOPIC_SCHEMA_ID = 'tiinex.topic.v1';
export const TOPIC_CANONICAL_REQUIRED_INPUTS = Object.freeze(['Summary', 'Current Read', 'Design Direction', 'Next Artifacts']);
const REQUIRED_INPUTS = TOPIC_CANONICAL_REQUIRED_INPUTS;

export function renderCanonicalTopicLocalArtifact(input = {}) {
  const values = input.values || {};
  if (input.continuityMode !== 'root' || input.parent) return Object.freeze({ state: 'unqualified', reason: 'topic-root-continuity-required', markdown: '' });
  if (!REQUIRED_INPUTS.every((name) => Object.prototype.hasOwnProperty.call(values, name) && values[name] !== undefined)) {
    return Object.freeze({ state: 'unqualified', reason: 'topic-generation-input-missing', markdown: '' });
  }
  const createdAt = rootTimestamp(input.now instanceof Date ? input.now : new Date(input.now || Date.now()));
  const summary = scalar(values.Summary);
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.topic.v1
  - Created At: ${createdAt}
  - Summary: ${summary}

---

# ${summary}

This topic captures the current direction for ${summary}.

## Current Read

${scalar(values['Current Read'])}

## Design Direction

${scalar(values['Design Direction'])}

## Next Artifacts

${scalar(values['Next Artifacts'])}

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
  if (continuityMode !== 'root' || parent) return Object.freeze({ state: 'invalid', reason: 'topic-root-continuity-required', findings: Object.freeze([]), record: null });
  let compiled, parsed, projection;
  try {
    compiled = compilePortableSchemaContractChain(schemaMaterials);
    parsed = parseArtifactMarkdown(markdown);
    projection = projectPortableContractInstance({ markdown, compiledContract: compiled });
  } catch (_) { return Object.freeze({ state: 'invalid', reason: 'canonical-topic-parse-or-compile-failed', findings: Object.freeze([]), record: null }); }
  const errors = (projection.validation?.findings || []).filter((finding) => finding?.severity === 'error' || finding?.state === 'structurally-invalid' || finding?.state === 'contradictory');
  const sections = sectionBodies(markdown);
  const current = parsed.envelope?.current || {};
  const exactBody = REQUIRED_INPUTS.slice(1).every((name) => sections[name] === scalar(values[name]));
  const integrity = canonicalC14nV2SelfState(markdown);
  const invariant = compiled.schemaId === CANONICAL_TOPIC_SCHEMA_ID
    && current.schema?.id === CANONICAL_TOPIC_SCHEMA_ID
    && String(current.summary || '') === scalar(values.Summary)
    && !declaredParentEnvelope(parsed.envelope?.parent)
    && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(current.createdAt || ''))
    && firstBodyHeading(markdown) === scalar(values.Summary)
    && exactBody
    && integrity.state === 'verified';
  if (errors.length || !invariant) return Object.freeze({ state: 'invalid', reason: errors.length ? 'canonical-topic-contract-errors' : 'canonical-topic-invariant-mismatch', findings: Object.freeze(errors), record: null, projection });
  const record = Object.assign(createRecordFromMarkdown(markdown, { path, name: scalar(values.Summary), sourceMode: 'local-transition-canonical' }), {
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
