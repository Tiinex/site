import assert from 'node:assert/strict';
import { normalizePortableInput } from './portable.input.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-22 00:00:00
  - Summary: Input test

---

# Input Test

## Content

Test.
`;

const normalized = normalizePortableInput({
  files: [
    { path: 'artifact.md', content: markdown },
    { path: 'asset.png', size: 32, kind: 'asset' },
    { path: '../unsafe.md', content: markdown }
  ]
});
assert.equal(normalized.records.length, 1);
assert.equal(normalized.assets.length, 1);
assert.equal(normalized.records[0].source.adapterId, 'local');
assert.equal(normalized.boundary.inferredGitHubSource, false);
assert.equal(normalized.findings.some((finding) => finding.code === 'portable.input.path.unsafe'), true);

const explicitSource = normalizePortableInput({ records: [{
  id: 'source-backed',
  path: 'artifact.md',
  markdown,
  source: { adapterId: 'github', path: 'artifact.md', repo: 'Tiinex/docs' }
}] });
assert.equal(explicitSource.boundary.containsExplicitSourceMetadata, true);
assert.equal(explicitSource.records[0].source.adapterId, 'github');
assert.equal(explicitSource.records[0].source.provenanceQualification, 'explicit-supplied-unverified');
assert.equal(explicitSource.records[0].source.boundary.includes('did not fetch or infer'), true);

const duplicate = normalizePortableInput({
  files: [{ path: 'same.md', content: markdown }],
  records: [{ id: 'same', path: 'same.md', markdown }]
});
assert.equal(duplicate.findings.some((finding) => finding.code === 'portable.input.path.duplicate'), true);
assert.doesNotThrow(() => JSON.stringify(duplicate));

console.log('✓ portable supplied-material normalization and source boundaries passed');
