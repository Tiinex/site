import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPortableLocalDraft, stagePortableDraft } from './draft.create.js';

const evidenceSchema = await readFile(new URL('../../../schemas/core/evidence/tiinex.evidence.v1.schema.md', import.meta.url), 'utf8');
const topicSchema = await readFile(new URL('../../../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const values = {
  'Supported Claim Or Question': 'whether mobile overflow was observed',
  'Evidence Role': 'supports that the issue was observed',
  'Known Source': 'explicitly supplied local test material',
  'Preservation Basis': 'bounded excerpt supplied to the test',
  'Provenance Limits': 'surrounding context is not included',
  'Material': 'A user reported mobile overflow.',
  'Material Kind': 'excerpt',
  'Preservation State': 'readable excerpt preserved in markdown',
  'Fidelity Notes': 'verbatim enough for structural testing',
  'Known Losses': 'device context is not included',
  'Does Not Prove': 'cause or fix correctness',
  'Must Not Be Treated As': 'task completion or consent'
};
const created = createPortableLocalDraft({
  files: [{ path: 'schemas/tiinex.evidence.v1.schema.md', content: evidenceSchema }],
  schemaId: 'tiinex.evidence.v1',
  title: 'Portable Evidence Draft',
  summary: 'A bounded local evidence draft.',
  values,
  parent: {
    id: 'parent-record',
    path: 'parent.md',
    schemaId: 'tiinex.preservation.v1',
    boundary: 'portable local material; no GitHub provenance inferred'
  },
  createdAt: '2026-07-23T00:00:00.000Z'
});
assert.equal(created.status, 'created-invalid', 'legacy readable-schema Parent representation remains materialized but is not semantic-clean under the unified Root contract');
assert.equal(created.draft.sourceMode, 'local-portable-draft');
assert.equal(created.draft.source, null);
assert.equal(created.draft.markdown.includes('## Evidence Material'), true);
assert.equal(created.draft.markdown.includes('- Material: A user reported mobile overflow.'), true);
assert.equal(created.validation.qualification.exactRuntimeValidation, false, 'legacy/readable-schema draft is not exact canonical Root validation');
assert.equal(created.qualification.remoteWrite, false);

const staged = stagePortableDraft({ draft: created.draft, files: [{ path: 'schemas/tiinex.evidence.v1.schema.md', content: evidenceSchema }], schemaId: 'tiinex.evidence.v1' }, { stagedAt: '2026-07-23T00:01:00.000Z' });
assert.equal(staged.status, 'blocked', 'semantic-invalid legacy draft must not be silently staged as clean');
assert.equal(staged.stagedArtifact, null);

const blocked = createPortableLocalDraft({
  files: [{ path: 'schemas/tiinex.evidence.v1.schema.md', content: evidenceSchema }],
  schemaId: 'tiinex.evidence.v1',
  values: { 'Known Source': 'only one field' }
});
assert.equal(blocked.status, 'blocked');
assert.equal(blocked.draft, null);
assert.equal(blocked.findings.some((finding) => finding.code === 'portable.draft-create.inputs.blocked'), true);

const unknownSchema = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Trace: [tiinex.root.v1.schema.md](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.experimental.note.v1](tiinex.experimental.note.v1.schema.md)
  - Created At: 2026-07-23 00:00:00
  - Summary: Experimental note schema.

---

# Experimental Note

## Summary

A note with one required section and field.

## Schema Validation Contract

### Note

Required Sections

- Note

Required Fields

- Statement

## Artifact Creation Contract

### Note Creation

Required Inputs

- Statement
`;
const unknown = createPortableLocalDraft({
  files: [{ path: 'schemas/tiinex.experimental.note.v1.schema.md', content: unknownSchema }],
  schemaId: 'tiinex.experimental.note.v1',
  title: 'Unknown Child Draft',
  summary: 'Created from readable schema material.',
  values: { Statement: 'The local draft preserves an explicit statement.' },
  createdAt: '2026-07-23T00:00:00.000Z'
});
assert.equal(unknown.draft.creationMode, 'readable-schema-root-writer');
assert.equal(unknown.draft.markdown.includes('## Note'), true);
assert.equal(unknown.qualification.exactCreateTooling, false);
assert.equal(unknown.qualification.contractDrivenStructuralValidation, true);
assert.equal(unknown.validation.qualification.fallbackUsed, true);
assert.equal(unknown.validation.sharedParserQuirks.some((entry) => entry.code === 'portable.draft.shared-parser.parent-block-fallback'), false);
assert.equal(unknown.findings.some((finding) => finding.code === 'root.parent.schema.missing'), false);
assert.equal(unknown.findings.some((finding) => finding.code === 'root.parent.trace.missing'), false);
assert.equal(unknown.findings.some((finding) => finding.code === 'root.parent.origin.missing'), false);

const invalidStage = stagePortableDraft({ draft: { ...unknown.draft, markdown: unknown.draft.markdown.replace('## Note', '## Wrong') }, files: [{ path: 'schemas/tiinex.experimental.note.v1.schema.md', content: unknownSchema }] });
assert.equal(invalidStage.status, 'blocked');
assert.equal(invalidStage.stagedArtifact, null);


const topicDraft = createPortableLocalDraft({
  files: [{ path: 'schemas/tiinex.topic.v1.schema.md', content: topicSchema }],
  schemaId: 'tiinex.topic.v1',
  title: 'Portable Topic',
  summary: 'Portable Topic',
  values: {
    Summary: 'Portable Topic',
    'Current Read': 'The current topic state is explicit.',
    'Design Direction': 'Continue through schema-aware portable tooling.',
    'Next Artifacts': 'Create a qualified follow-up artifact.'
  },
  createdAt: '2026-07-23T00:00:00.000Z'
});
assert.notEqual(topicDraft.status, 'blocked');
assert.equal(topicDraft.draft.markdown.includes(`## Current Read\n\nThe current topic state is explicit.`), true);
assert.equal(topicDraft.draft.markdown.includes(`## Design Direction\n\nContinue through schema-aware portable tooling.`), true);
assert.equal(topicDraft.draft.markdown.includes(`## Next Artifacts\n\nCreate a qualified follow-up artifact.`), true);
assert.equal(topicDraft.draft.markdown.includes('## {{summary}}'), false);
assert.equal(topicDraft.draft.markdown.includes('Additional Declared Inputs'), false);

console.log('✓ portable local draft creation, unknown-schema fallback, validation, and staging passed');
