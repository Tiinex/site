import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from './artifact.parse.js';

const ROOT_WITHOUT_PARENT = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Created At: 2026-07-23T00:00:00.000Z
  - Summary: Root artifact without an artifact parent.

---

# Root Artifact

## Summary

No parent is declared.

# Continuity Integrity

- Method: pending
  - Value: pending
`;

const CHILD_SCHEMA_WITHOUT_ARTIFACT_PARENT = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.schema.module.v1](tiinex.schema.module.v1.schema.md)
  - Created At: 2026-07-23T00:01:00.000Z
  - Summary: Child schema artifact that inherits schema meaning but declares no artifact parent.

---

# Schema Module

## Summary

No artifact Parent block is declared here.

# Continuity Integrity

- Method: pending
  - Value: pending
`;

const CHILD_WITH_PARENT = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [parent](parent.trace.md)
  - Origin: [browse + git](https://github.com/Tiinex/docs/blob/abc/parent.trace.md)
  - Created At: 2026-07-22T00:00:00.000Z
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-23T00:02:00.000Z
  - Summary: Child with declared parent.

---

# Child

# Continuity Integrity

- Method: pending
  - Value: pending
`;

const root = parseArtifactMarkdown(ROOT_WITHOUT_PARENT);
assert.equal(root.envelope.parent.schema.id, '', 'root without Parent must not inherit Current Schema as Parent Schema');
assert.equal(root.envelope.parent.createdAt, '', 'Current Created At must not leak into Parent Created At');
assert.equal(root.envelope.parent.trace, '', 'root without Parent must not infer a Trace');
assert.equal(root.envelope.parent.origin, '', 'root without Parent must not infer an Origin');
assert.equal(root.envelope.current.schema.id, 'tiinex.root.v1', 'Current Schema remains readable');
assert.equal(root.envelope.current.createdAt, '2026-07-23T00:00:00.000Z', 'Current Created At remains readable');

const schemaArtifact = parseArtifactMarkdown(CHILD_SCHEMA_WITHOUT_ARTIFACT_PARENT);
assert.equal(schemaArtifact.envelope.parent.schema.id, '', 'child schema artifact without artifact Parent must not fabricate parent schema');
assert.equal(schemaArtifact.envelope.parent.trace, '', 'child schema artifact without artifact Parent must not fabricate parent trace');
assert.equal(schemaArtifact.envelope.current.schema.id, 'tiinex.schema.module.v1', 'child schema Current Schema remains readable');

const child = parseArtifactMarkdown(CHILD_WITH_PARENT);
assert.equal(child.envelope.parent.schema.id, 'tiinex.topic.v1', 'valid Parent Schema parses');
assert.equal(child.envelope.parent.trace, 'parent.trace.md', 'valid Parent Trace uses markdown link target for resolution');
assert.equal(child.envelope.parent.traceLabel, 'parent', 'valid Parent Trace preserves markdown link label for presentation');
assert.equal(child.envelope.parent.origin, 'https://github.com/Tiinex/docs/blob/abc/parent.trace.md', 'valid Parent Origin parses');
assert.equal(child.envelope.parent.createdAt, '2026-07-22T00:00:00.000Z', 'valid Parent Created At parses');
assert.equal(child.envelope.current.createdAt, '2026-07-23T00:02:00.000Z', 'valid Current Created At stays separate');



const CHILD_WITH_RELATIVE_PARENT_LINK = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [001.trace.md](../001.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-23T00:03:00.000Z
  - Summary: Child with relative parent href.

---

# Child With Relative Parent
`;

const relativeChild = parseArtifactMarkdown(CHILD_WITH_RELATIVE_PARENT_LINK);
assert.equal(relativeChild.envelope.parent.trace, '../001.trace.md', 'Parent Trace link href is the resolution target');
assert.equal(relativeChild.envelope.parent.traceLabel, '001.trace.md', 'Parent Trace label remains available for display');


const CHILD_WITH_LABELLED_PARENT_ORIGIN = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [001.trace.md](001.trace.md)
  - Origin:
    - relative: 001.trace.md
    - [github git file](https://github.com/Tiinex/docs/blob/main/.topics/area/001.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-25T00:00:00.000Z
  - Summary: Child with labelled nested origin.

---

# Child With Labelled Origin
`;
const labelledOriginChild = parseArtifactMarkdown(CHILD_WITH_LABELLED_PARENT_ORIGIN);
assert.equal(labelledOriginChild.envelope.parent.origin, '001.trace.md', 'labelled nested Parent Origin should expose the value, not the label prefix');


const INTEGRITY_WITH_TOWARDS = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [001.trace.md](001.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: Integrity entries

---

# Integrity Entries

# Continuity Integrity

- [sha256-base64url-c14n-v2](validator.md)
  - Towards: [001.trace.md](001.trace.md)
  - Value: parent-hash

- [sha256-base64url-c14n-v2](validator.md)
  - Towards: self
  - Value: self-hash
`;
const integrityEntries = parseArtifactMarkdown(INTEGRITY_WITH_TOWARDS).integrity.entries;
assert.equal(integrityEntries.length, 2, 'integrity parser should expose structured entries');
assert.equal(integrityEntries[0].towards, '001.trace.md', 'integrity Towards should prefer link target');
assert.equal(integrityEntries[0].value, 'parent-hash', 'integrity parent Value should parse');
assert.equal(integrityEntries[1].towards, 'self', 'integrity self Towards should parse');
assert.equal(integrityEntries[1].value, 'self-hash', 'integrity self Value should parse');

console.log('✓ artifact parser Parent-block regression guards passed');
