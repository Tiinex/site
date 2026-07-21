import assert from 'node:assert/strict';
import { schemaRegistry } from '../schemas/registry.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { rootValidate } from '../schemas/root.validate.js';
import { createContinuationDraft, createReferenceDraft, listContinuationTargets, RECORD_TRANSITION_RESULT_SCHEMA_ID } from './record.transitions.js';

const targets = listContinuationTargets(schemaRegistry);
assert(targets.some((target) => target.id === 'tiinex.topic.v1'), 'topic continuation target must be exposed');
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

const continuation = createContinuationDraft(parent, targets.find((target) => target.id === 'tiinex.topic.v1'), {}, { clock: () => '2026-07-21T00:00:00.000Z' });
assert.equal(continuation.schema, RECORD_TRANSITION_RESULT_SCHEMA_ID, 'continuation draft must declare result schema');
assert.equal(continuation.kind, 'tiinex.topic.v1', 'continuation draft must target selected schema');
assert.equal(continuation.status, 'local', 'continuation must remain local/session');
assert.equal(continuation.hasContinuityContext, true, 'continuation must claim continuity context');
assert.equal(continuation.hasIntegrity, true, 'continuation must include draft integrity marker');
assert(continuation.markdown.includes('Envelope Schema: [tiinex.root.v1]'), 'continuation markdown must include Envelope Schema');
assert(continuation.markdown.includes('Parent Schema: [tiinex.topic.v1]'), 'continuation markdown must include Parent Schema');
assert(continuation.markdown.includes('Trace: record:local:ws:notes/example.md'), 'continuation markdown must include parent trace');
assert(continuation.markdown.includes('Current Schema: [tiinex.topic.v1]'), 'continuation markdown must include target schema');
assert(continuation.path.startsWith('continuations/'), 'continuation path must be deterministic local continuation path');

const parsedContinuation = parseArtifactMarkdown(continuation.markdown);
assert.equal(parsedContinuation.envelope.envelopeSchema.id, 'tiinex.root.v1', 'parsed continuation has envelope schema');
assert.equal(parsedContinuation.envelope.current.schema.id, 'tiinex.topic.v1', 'parsed continuation has current schema');
assert.equal(parsedContinuation.envelope.current.createdAt, '2026-07-21T00:00:00.000Z', 'parsed continuation has created at');
assert.equal(parsedContinuation.envelope.parent.schema.id, 'tiinex.topic.v1', 'parsed continuation has parent schema');
assert.equal(parsedContinuation.hasIntegrity, true, 'parsed continuation has integrity marker');
assert(!rootValidate(parsedContinuation).some((finding) => finding.severity === 'error'), 'continuation draft must satisfy root-required envelope fields');

const reference = createReferenceDraft(parent, {}, { clock: () => '2026-07-21T00:00:00.000Z' });
assert.equal(reference.kind, 'tiinex.evidence.v1', 'reference draft should materialize as evidence');
assert.equal(reference.hasIntegrity, true, 'reference must include draft integrity marker');
assert(reference.markdown.includes('## Reference'), 'reference draft must contain reference section');
assert(reference.markdown.includes('Current Schema: [tiinex.evidence.v1]'), 'reference draft must declare evidence current schema');
assert(reference.path.startsWith('references/'), 'reference path must be deterministic local reference path');
const parsedReference = parseArtifactMarkdown(reference.markdown);
assert.equal(parsedReference.envelope.current.schema.id, 'tiinex.evidence.v1', 'parsed reference has evidence schema');
assert(!rootValidate(parsedReference).some((finding) => finding.severity === 'error'), 'reference draft must satisfy root-required envelope fields');

console.log('✓ record.transitions tests passed');
