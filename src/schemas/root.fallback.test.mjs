import assert from 'node:assert/strict';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { normalizeArtifact } from '../artifacts/artifact.normalize.js';
import { resolveSchemaModule } from './resolver.js';
import { rootValidate, rootFallbackFinding } from './root.validate.js';
import { createRootFallbackModel } from './root.fallback.js';
import { schemaBadgeClass, schemaIdFromText, schemaKey } from './root.classify.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-20T00:00:00.000Z
  - Trace: record:parent-1
  - Origin: local/parent.trace.md
  - Boundary: browser-local session material
- Current
  - Current Schema: [tiinex.future.verse.v1](tiinex.future.verse.v1.schema.md)
  - Created At: 2026-07-21T00:00:00.000Z
  - Summary: Unknown future verse artifact.
  - Status: draft/local

---

# Future Verse

## Body

This artifact uses a schema the current viewer does not know yet.

# Continuity Integrity

- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending
`;

const parsed = parseArtifactMarkdown(markdown);
assert.equal(parsed.envelope.parent.origin, 'local/parent.trace.md', 'parser must preserve parent origin for root fallback');
assert.equal(parsed.envelope.parent.boundary, 'browser-local session material', 'parser must preserve parent boundary for root fallback');
assert.equal(schemaIdFromText('Current Schema: [tiinex.topic.v1](x)'), 'tiinex.topic.v1', 'schemaIdFromText should parse markdown links');
assert.equal(schemaKey('tiinex.evidence.v1'), 'evidence', 'schemaKey ports legacy evidence classification');
assert.equal(schemaBadgeClass('tiinex.unknown.v1'), 'unknown', 'unknown schemas should get unknown badge class');

const resolution = resolveSchemaModule({ schemaId: parsed.envelope.current.schema.id });
assert.equal(resolution.fallbackUsed, true, 'unknown schema must resolve through root fallback');
const findings = rootValidate(parsed);
findings.push(rootFallbackFinding(parsed.envelope.current.schema.id));
const model = createRootFallbackModel(parsed, resolution, findings);
assert.equal(model.schema, 'tiinex.root.fallback.v1', 'fallback model must declare contract');
assert.equal(model.currentSchemaId, 'tiinex.future.verse.v1', 'fallback model preserves unknown current schema');
assert.equal(model.fallbackUsed, true, 'fallback model marks fallback use');
assert.equal(model.continuity.origin, 'local/parent.trace.md', 'fallback model exposes parent origin');
assert(model.badges.includes('root fallback'), 'fallback badges must disclose root fallback');

const normalized = normalizeArtifact(parsed, resolution, findings);
assert.equal(normalized.origin, 'local/parent.trace.md', 'normalized artifact should carry origin');
assert.equal(normalized.schemaKey, 'unknown', 'normalized artifact should carry schema classification');
assert.equal(normalized.fallbackModel.schema, 'tiinex.root.fallback.v1', 'normalized artifact should carry root fallback model');

console.log('✓ root fallback tests passed');
