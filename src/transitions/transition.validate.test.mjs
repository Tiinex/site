import assert from 'node:assert/strict';
import { createContinuationDraft, createReferenceDraft } from './record.transitions.js';
import { validateTransitionDraft } from './transition.validate.js';

const localParent = {
  id: 'local:workspace:notes/parent.md',
  title: 'Local parent',
  summary: 'Local summary',
  path: 'notes/parent.md',
  kind: 'tiinex.topic.v1',
  markdown: '# Local parent',
  sourceMode: 'local-files',
  source: { adapterId: 'local', kind: 'local-session' }
};

const localDraft = createContinuationDraft(localParent, { id: 'tiinex.topic.v1', label: 'Topic' }, {}, { clock: () => '2026-07-21T02:00:00.000Z' });
assert.equal(localDraft.validation.schema, 'tiinex.transition.validation.v1');
assert.equal(localDraft.validation.ok, true, 'local continuation should validate');
assert.equal(localDraft.validation.parsed.parentTrace, 'record:local:workspace:notes/parent.md');
assert.equal(localDraft.validation.parsed.parentOrigin, 'notes/parent.md');
assert.match(localDraft.validation.parsed.parentBoundary, /no GitHub provenance inferred/i);
assert(!localDraft.validation.findings.some((finding) => finding.severity === 'error'), 'local continuation has no validation errors');

const githubParent = {
  id: 'source:github:tiinex/docs:topics/parent.md',
  title: 'GitHub parent',
  summary: 'GitHub summary',
  path: 'topics/parent.md',
  kind: 'tiinex.topic.v1',
  markdown: '# GitHub parent',
  sourceMode: 'source-backed',
  source: { adapterId: 'github', kind: 'github-tree', sourceKind: 'github.repo', repo: 'Tiinex/docs', ref: 'master' }
};

const githubReference = createReferenceDraft(githubParent, {}, { clock: () => '2026-07-21T02:00:00.000Z' });
assert.equal(githubReference.validation.ok, true, 'github parent reference should validate as a local draft with source-backed parent boundary');
assert.match(githubReference.validation.parsed.parentBoundary, /source-backed github material/i);
assert.equal(githubReference.sourceMode, 'local-reference', 'transition result must stay local even when parent is source-backed');
assert.equal(githubReference.source?.adapterId, undefined, 'transition draft must not inherit GitHub source object');

const tampered = { ...localDraft, markdown: localDraft.markdown.replace(/# Continuity Integrity[\s\S]*$/, ''), hasIntegrity: false };
const tamperedValidation = validateTransitionDraft(tampered, localParent);
assert.equal(tamperedValidation.ok, false, 'missing integrity must fail transition validation');
assert(tamperedValidation.findings.some((finding) => finding.code === 'transition.integrity.required'), 'missing integrity has transition finding');

const wrongTrace = { ...localDraft, markdown: localDraft.markdown.replace('Trace: record:local:workspace:notes/parent.md', 'Trace: record:somewhere-else') };
const wrongTraceValidation = validateTransitionDraft(wrongTrace, localParent);
assert.equal(wrongTraceValidation.ok, false, 'trace mismatch must fail transition validation');
assert(wrongTraceValidation.findings.some((finding) => finding.code === 'transition.parent.trace.mismatch'), 'trace mismatch has transition finding');

const leakedBoundary = { ...localDraft, markdown: localDraft.markdown.replace('Boundary: browser-local session material; no GitHub provenance inferred', 'Boundary: source-backed github material') };
const leakValidation = validateTransitionDraft(leakedBoundary, localParent);
assert.equal(leakValidation.ok, false, 'local parent must not be promoted to GitHub provenance');
assert(leakValidation.findings.some((finding) => finding.code === 'transition.parent.boundary.local-github-leak'), 'boundary leak has transition finding');

console.log('transition.validate: ok');
