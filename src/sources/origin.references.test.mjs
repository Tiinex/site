import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { collectOriginReferencesFromMarkdown, originReferenceSourcesForRecords, recoverySourceForRecord } from './origin.references.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)
  - Trace: [issue root](issue-root-recovered-fs25-markaryd.workspace.md)
  - Origin:
    - relative: issue-root-recovered-fs25-markaryd.workspace.md
    - [github issue](https://github.com/Tiinusen/socials/issues/3)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: child

---

# Child`;

const refs = collectOriginReferencesFromMarkdown(markdown);
assert(refs.some((ref) => ref.kind === 'relative' && ref.path === 'issue-root-recovered-fs25-markaryd.workspace.md'), 'relative origin should remain available');
assert(refs.some((ref) => ref.kind === 'github-issue' && ref.repository === 'Tiinusen/socials' && ref.number === '3'), 'explicit nested GitHub issue origin should be preserved');

const record = createRecordFromMarkdown(markdown, { path: '.topics/.github/tiinusen/socials/.issues/3/001-child.trace.md', sourceMode: 'archive-local' });
assert.equal(record.sourceMode, 'archive-local');
assert(record.originReferences.some((ref) => ref.kind === 'github-issue'), 'artifact record should carry explicit origin references');

const sources = originReferenceSourcesForRecords([record]);
assert.equal(sources.length, 1);
assert.equal(sources[0].id, 'origin:github:tiinusen:socials');
assert.equal(sources[0].sourceKind, 'github.origin-reference');
assert.equal(sources[0].sourceBacked, false, 'origin reference source must not promote imported material to source-backed authority');
assert.equal(sources[0].config.issueUrls, 'https://github.com/Tiinusen/socials/issues/3');
assert.equal(sources[0].recoveryOnly, true);
assert.equal(sources[0].loadable, false, 'recovery-only origin row must not look like a configured source loader');
assert.equal(sources[0].roleLabel, 'recovery only');
assert.equal(sources[0].originReferenceCount, 1);


const fileOriginMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [Parent](parent.trace.md)
  - Origin: [parent](https://github.com/Tiinex/docs/blob/abc123/.topics/parent.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: file origin child

---

# File Origin Child`;
const fileOriginRecord = createRecordFromMarkdown(fileOriginMarkdown, { path: 'child.trace.md', sourceMode: 'archive-local' });
const fileRecoverySource = recoverySourceForRecord(Object.assign({}, fileOriginRecord, { source: { id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session' } }), { id: 'ws', sources: [{ id: 'local', kind: 'local' }] });
assert.equal(fileRecoverySource.id, 'origin:github:tiinex:docs', 'file origin without configured source should create recovery-only source');
assert.equal(fileRecoverySource.ref, 'abc123', 'GitHub blob origin ref should be retained for exact parent-file recovery');
assert.equal(fileRecoverySource.config.ref, 'abc123', 'recovery source config must carry the exact origin ref');
assert.equal(fileRecoverySource.sourceBacked, false, 'origin recovery source must not promote local/imported authority');

console.log('✓ origin reference tests passed');
