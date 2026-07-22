import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  auditPortableMaterial,
  describePortableSchemaChain,
  inspectPortableMaterial,
  makePortableWriterBrief,
  resolvePortableCapabilities,
  resolvePortableLineage
} from './engine.facade.js';

const topicMarkdown = await readFile(new URL('../../artifacts/fixtures/topic.trace.md', import.meta.url), 'utf8');
const unknownMarkdown = await readFile(new URL('../../artifacts/fixtures/unknown-schema.trace.md', import.meta.url), 'utf8');
const topicSchemaMarkdown = await readFile(new URL('../../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');

const inspected = inspectPortableMaterial({ markdown: topicMarkdown, path: 'topic.trace.md' });
assert.equal(inspected.schema, 'tiinex.portable.operation.result.v1');
assert.equal(inspected.records.length, 1);
assert.equal(inspected.records[0].declaredSchemaId, 'tiinex.topic.v1');
assert.equal(inspected.records[0].qualification.exact, true);
assert.equal(inspected.records[0].qualification.capabilityStatus, 'implemented');
assert.equal(inspected.records[0].sourceBoundary.includes('no GitHub provenance inferred'), true);
assert.equal('markdown' in inspected.records[0], false);
assert.doesNotThrow(() => JSON.stringify(inspected));

const unknownAudit = auditPortableMaterial({ markdown: unknownMarkdown, path: 'unknown.trace.md' });
assert.equal(unknownAudit.audits[0].resolution.fallbackUsed, true);
assert.equal(unknownAudit.audits[0].qualification.exact, false);
assert.equal(unknownAudit.audits[0].qualification.fallback.mode, 'direct-root');
assert.equal(unknownAudit.audits[0].qualification.fallback.parentCapabilitiesEvaluated, false);

const unknownCapability = resolvePortableCapabilities({ schemaId: 'tiinex.experimental.unknown.v1', capability: 'validate' });
assert.equal(unknownCapability.resolutions[0].qualification.exact, false);
assert.equal(unknownCapability.resolutions[0].qualification.fallback.used, true);
assert.equal(unknownCapability.resolverBoundary.semanticParentCapabilityFallback, false);

const noSchemaCapability = resolvePortableCapabilities({ capability: 'read' });
assert.equal(noSchemaCapability.findingSummary.counts.error, 1);

const childSchemaMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Trace: [tiinex.root.v1.schema.md](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.experimental.child.v1](tiinex.experimental.child.v1.schema.md)
  - Created At: 2026-07-22 00:00:00
  - Summary: Experimental child schema supplied for writer fallback.

---

# Experimental Child Schema

## Schema Validation Contract

### Child Body

Required Shape

- \`## Child Content\`
`;

const childInput = {
  files: [
    { path: 'schemas/tiinex.experimental.child.v1.schema.md', content: childSchemaMarkdown },
    { path: 'schemas/tiinex.root.v1.schema.md', content: await readFile(new URL('../../schemas/tiinex.root.v1.schema.md', import.meta.url), 'utf8') }
  ],
  schemaId: 'tiinex.experimental.child.v1'
};

const chain = describePortableSchemaChain(childInput);
assert.equal(chain.chain.nodes[0].schemaId, 'tiinex.experimental.child.v1');
assert.equal(chain.chain.nodes[0].parentSchemaId, 'tiinex.root.v1');
assert.equal(chain.chain.nodes.at(-1).schemaId, 'tiinex.root.v1');
assert.equal(chain.chain.status, 'complete-to-root');
assert.equal(chain.chain.runtimeFallback.mode, 'direct-root');

const writerFallback = makePortableWriterBrief(childInput);
assert.equal(writerFallback.mode, 'llm-writer-fallback');
assert.equal(writerFallback.schemaMaterial.path, 'schemas/tiinex.experimental.child.v1.schema.md');
assert.equal(writerFallback.qualification.exact, false);
assert.equal(writerFallback.qualification.safeActions.includes('write-local-draft-from-supplied-schema'), true);
assert.equal(writerFallback.qualification.blockedActions.includes('claim-exact-create-tooling'), true);
assert.equal(writerFallback.findingSummary.status, 'degraded');

const blockedWriter = makePortableWriterBrief({ schemaId: 'tiinex.experimental.missing.v1' });
assert.equal(blockedWriter.mode, 'parent-or-root-artifact-only');
assert.equal(blockedWriter.findingSummary.counts.error >= 1, true);
assert.equal(blockedWriter.qualification.blockedActions.includes('guess-child-format'), true);

const exactWriter = makePortableWriterBrief({
  schemaId: 'tiinex.topic.v1',
  files: [{ path: 'src/schemas/core/topic/tiinex.topic.v1.schema.md', content: topicSchemaMarkdown }]
});
assert.equal(exactWriter.mode, 'exact-create-tooling-available');
assert.equal(exactWriter.qualification.exact, true);

const parentMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-22 00:00:00
  - Summary: Parent

---

# Parent

## Content

Parent body.
`;
const childMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: record:parent
  - Boundary: Portable local material
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-22 00:01:00
  - Summary: Child

---

# Child

## Content

Child body.
`;
const lineage = resolvePortableLineage({ records: [
  { id: 'parent', path: 'parent.md', markdown: parentMarkdown },
  { id: 'child', path: 'child.md', markdown: childMarkdown }
] }, { startId: 'child', maxDepth: 3 });
assert.equal(lineage.traversal.nodes.some((node) => node.id === 'parent'), true);
assert.equal(lineage.lineage.nodes.some((node) => Object.hasOwn(node, 'record')), false);
assert.equal(lineage.boundary.lineage.includes('loaded-only'), true);
assert.doesNotThrow(() => JSON.stringify(lineage));

console.log('✓ portable engine operations, qualification, writer fallback, and loaded lineage passed');
