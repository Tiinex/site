import assert from 'node:assert/strict';
import { schemaRegistry } from '../schemas/registry.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { rootValidate } from '../schemas/tiinex.root.v1.validate.js';
import { resolveLineage } from '../lineage/lineage.resolve.js';
import { createContinuationDraft, createReferenceDraft, ensureUniqueTransitionPath, listContinuationTargets, RECORD_TRANSITION_RESULT_SCHEMA_ID } from './record.transitions.js';

const targets = listContinuationTargets(schemaRegistry);
assert(targets.some((target) => target.id === 'tiinex.task.v1'), 'task continuation target must be exposed');
assert(targets.every((target) => target.id === 'tiinex.task.v1'), 'only schema-honest Task continuation is exposed until other renderers land');
assert(targets.every((target) => target.contract === 'tiinex.record.transitions.v1'), 'targets must declare transition contract');

const parent = {
  id: 'local:ws:notes/example.md',
  title: 'Example artifact',
  summary: 'Example summary',
  path: 'notes/example.md',
  markdown: '# Example artifact\n\nMaterial body',
  kind: 'tiinex.topic.v1',
  createdAt: '2026-07-20',
  source: { adapterId: 'local', kind: 'local-session' },
  sourceMode: 'local-files'
};

const continuation = createContinuationDraft(parent, targets.find((target) => target.id === 'tiinex.task.v1'), {}, { clock: () => '2026-07-21T00:00:00.000Z' });
assert.equal(continuation.schema, RECORD_TRANSITION_RESULT_SCHEMA_ID, 'continuation draft must declare result schema');
assert.equal(continuation.kind, 'tiinex.task.v1', 'continuation draft must target selected schema');
assert.equal(continuation.status, 'local', 'continuation must remain local/session');
assert.equal(continuation.hasContinuityContext, true, 'continuation must claim continuity context');
assert.equal(continuation.hasIntegrity, true, 'continuation must include draft integrity marker');
assert.equal(continuation.validation.ok, true, 'continuation must pass transition validation');
assert(continuation.markdown.includes('Envelope Schema: [tiinex.root.v1]'), 'continuation markdown must include Envelope Schema');
assert(continuation.markdown.includes('Parent Schema: [tiinex.topic.v1]'), 'continuation markdown must include Parent Schema');
assert(continuation.markdown.includes('Trace: record:local:ws:notes/example.md'), 'continuation markdown must include parent trace');
assert(continuation.markdown.includes('Current Schema: [tiinex.task.v1]'), 'continuation markdown must include target schema');
assert.equal(continuation.path, 'notes/example-artifact--task.trace.md', 'continuation path defaults to parent directory with trace suffix');
assert.equal(continuation.schemaId, 'tiinex.task.v1', 'continuation record metadata exposes current schema for runtime readmodels');
assert.equal(continuation.parentSchemaId, 'tiinex.topic.v1', 'continuation record metadata exposes parent schema for runtime readmodels');
assert.equal(continuation.trace, 'record:local:ws:notes/example.md', 'continuation record metadata exposes parent trace for loaded lineage');
assert.equal(continuation.origin, 'notes/example.md', 'continuation record metadata exposes parent origin for diagnostics');
const localLineage = resolveLineage([parent, continuation]);
assert(localLineage.edges.some((edge) => edge.from === parent.id && edge.to === continuation.path && edge.kind === 'parent'), 'fresh local continuation should resolve to its loaded parent without reparsing during render');

const siblingContinuation = createContinuationDraft(parent, targets.find((target) => target.id === 'tiinex.task.v1'), {}, { clock: () => '2026-07-21T00:01:00.000Z', existingRecords: [continuation] });
assert.notEqual(siblingContinuation.path, continuation.path, 'repeated continuations from same parent must not reuse the same local path');
assert.equal(siblingContinuation.path, 'notes/example-artifact--task-2.trace.md', 'second continuation uses a deterministic sibling suffix in the parent directory');
const defensiveContinuation = ensureUniqueTransitionPath(continuation, [continuation]);
assert.equal(defensiveContinuation.path, 'notes/example-artifact--task-2.trace.md', 'final add path guard prevents lifecycle overwrite when dialogs race');

const numberedParent = Object.assign({}, parent, { id: 'numbered', path: '.topics/ai-provenance/12-01-gpt-5-mini.trace.md', title: 'GPT 5 mini' });
const numberedContinuation = createContinuationDraft(numberedParent, targets.find((target) => target.id === 'tiinex.task.v1'), { title: 'Model follow-up' }, { existingRecords: [], clock: () => '2026-07-21T00:02:00.000Z' });
assert.equal(numberedContinuation.path, '.topics/ai-provenance/12-01-01-model-follow-up.trace.md', 'dimensioned parents allocate child prefix in same folder');
const numberedSibling = createContinuationDraft(numberedParent, targets.find((target) => target.id === 'tiinex.task.v1'), { title: 'Model follow-up' }, { existingRecords: [numberedContinuation], clock: () => '2026-07-21T00:03:00.000Z' });
assert.equal(numberedSibling.path, '.topics/ai-provenance/12-01-02-model-follow-up.trace.md', 'dimensioned siblings increment the lineage child segment');
const issueCommentParent = Object.assign({}, parent, { id: 'issue-comment-parent', path: '.topics/.github/tiinusen/socials/.issues/3/comment-001-5008615398-recovered-lagar-och-regler.trace.md', title: 'Lagar och regler' });
const issueDraft = createContinuationDraft(issueCommentParent, targets.find((target) => target.id === 'tiinex.task.v1'), { title: 'Lagar och regler continuation' }, { existingRecords: [issueCommentParent], clock: () => '2026-07-21T00:04:00.000Z' });
assert.equal(issueDraft.path, '.topics/.github/tiinusen/socials/.issues/3/001-1-lagar-och-regler-continuation.trace.md', 'recovered issue-comment parents still allocate canonical dimension-prefixed child paths');
const issueSiblingDraft = createContinuationDraft(issueCommentParent, targets.find((target) => target.id === 'tiinex.task.v1'), { title: 'Lagar och regler continuation' }, { existingRecords: [issueCommentParent, issueDraft], clock: () => '2026-07-21T00:05:00.000Z' });
assert.equal(issueSiblingDraft.path, '.topics/.github/tiinusen/socials/.issues/3/001-2-lagar-och-regler-continuation.trace.md', 'recovered issue-comment parent siblings increment canonical dimension child segment');
assert.equal(issueDraft.trace, 'record:issue-comment-parent', 'issue draft exposes parent trace on the record metadata');
const issueLineage = resolveLineage([issueCommentParent, issueDraft]);
assert(issueLineage.edges.some((edge) => edge.from === issueCommentParent.id && edge.to === issueDraft.path && edge.kind === 'parent'), 'issue-adjacent local continuation should resolve to its loaded parent');


const parsedContinuation = parseArtifactMarkdown(continuation.markdown);
assert.equal(parsedContinuation.envelope.envelopeSchema.id, 'tiinex.root.v1', 'parsed continuation has envelope schema');
assert.equal(parsedContinuation.envelope.current.schema.id, 'tiinex.task.v1', 'parsed continuation has current schema');
assert.equal(parsedContinuation.envelope.current.createdAt, '2026-07-21T00:00:00.000Z', 'parsed continuation has created at');
assert.equal(parsedContinuation.envelope.parent.schema.id, 'tiinex.topic.v1', 'parsed continuation has parent schema');
assert.equal(parsedContinuation.hasIntegrity, true, 'parsed continuation has integrity marker');
assert(!rootValidate(parsedContinuation).some((finding) => finding.severity === 'error'), 'continuation draft must satisfy root-required envelope fields');

const reference = createReferenceDraft(parent, {}, { clock: () => '2026-07-21T00:00:00.000Z' });
assert.equal(reference.kind, 'tiinex.evidence.v1', 'reference draft should materialize as evidence');
assert.equal(reference.hasIntegrity, true, 'reference must include draft integrity marker');
assert.equal(reference.validation.ok, true, 'reference must pass transition validation');
assert(reference.markdown.includes('## Reference'), 'reference draft must contain reference section');
assert(reference.markdown.includes('## Supported Claim Or Question'), 'reference draft must satisfy Evidence body contract');
assert(reference.creationValidation.ok, true, 'reference must pass target Evidence validator');
assert(reference.markdown.includes('Current Schema: [tiinex.evidence.v1]'), 'reference draft must declare evidence current schema');
assert(reference.path.startsWith('references/'), 'reference path must be deterministic local reference path');
const parsedReference = parseArtifactMarkdown(reference.markdown);
assert.equal(parsedReference.envelope.current.schema.id, 'tiinex.evidence.v1', 'parsed reference has evidence schema');
assert(!rootValidate(parsedReference).some((finding) => finding.severity === 'error'), 'reference draft must satisfy root-required envelope fields');

console.log('✓ record.transitions tests passed');
