import assert from 'node:assert/strict';
import { schemaRegistry } from '../schemas/registry.js';
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
  source: { adapterId: 'local', kind: 'local-session' },
  sourceMode: 'local-files'
};

const continuation = createContinuationDraft(parent, targets.find((target) => target.id === 'tiinex.topic.v1'));
assert.equal(continuation.schema, RECORD_TRANSITION_RESULT_SCHEMA_ID, 'continuation draft must declare result schema');
assert.equal(continuation.kind, 'tiinex.topic.v1', 'continuation draft must target selected schema');
assert.equal(continuation.status, 'local', 'continuation must remain local/session');
assert(continuation.markdown.includes('browser-local session material; no GitHub provenance inferred'), 'continuation must preserve parent boundary');
assert(continuation.markdown.includes('Current Schema: [tiinex.topic.v1]'), 'continuation markdown must include target schema');
assert(continuation.path.startsWith('continuations/'), 'continuation path must be deterministic local continuation path');

const reference = createReferenceDraft(parent);
assert.equal(reference.kind, 'tiinex.evidence.v1', 'reference draft should materialize as evidence');
assert(reference.markdown.includes('## Reference'), 'reference draft must contain reference section');
assert(reference.path.startsWith('references/'), 'reference path must be deterministic local reference path');

console.log('✓ record.transitions tests passed');
