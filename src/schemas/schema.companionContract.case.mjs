import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { schemaRegistry } from './registry.js';
import { schemaReadPresentation } from './companion.js';
import { resolveFindingMessage } from '../validation/i18n.js';
import { normalizeFinding } from '../validation/findings.js';

const root = fileURLToPath(new URL('../..', import.meta.url)).replace(/[\\/]$/, '');
const schemaRoot = join(root, 'src/schemas');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full.replace(root + '/', '').replaceAll('\\', '/'));
  }
  return out;
}

const files = walk(schemaRoot);
for (const module of schemaRegistry.modules) {
  assert(files.some((file) => file.endsWith(`/${module.id}.schema.md`) || file === `src/schemas/${module.id}.schema.md`), `${module.id} must use versioned schema snapshot naming`);
  assert(files.some((file) => file.endsWith(`/${module.id}.schema.json`) || file === `src/schemas/${module.id}.schema.json`), `${module.id} must use versioned binding naming`);
  assert(files.some((file) => file.endsWith(`/${module.id}.schema.js`) || file === `src/schemas/${module.id}.schema.js`), `${module.id} must use versioned module naming`);
  if (module.findings?.codes) {
    for (const [code, definition] of Object.entries(module.findings.codes)) {
      assert.equal(definition.messageKey || code, code, `${module.id} finding ${code} should use the finding code as message key unless explicitly justified`);
      const rendered = resolveFindingMessage(normalizeFinding({ code, source: module.id }, { schemaId: module.id }), { locale: 'en', schemaId: module.id });
      assert.notEqual(rendered, code, `${module.id} finding ${code} must render through i18n or have an explicit fallback`);
    }
  }
}

const inertSurfaceOrFormFiles = files.filter((file) => /\.(feed|tree|lineage|detail|preview|share|graph)\.presenter\.js$|\.(create|edit|quick|full)\.form\.js$/.test(file));
assert.deepEqual(inertSurfaceOrFormFiles, [], 'inactive surface presenter/form scaffold files should not ship before a real divergent owner exists');

const sv = resolveFindingMessage(normalizeFinding({ code: 'topic.body.thin', source: 'tiinex.topic.v1' }, { schemaId: 'tiinex.topic.v1' }), { locale: 'sv', schemaId: 'tiinex.topic.v1' });
assert.equal(sv, 'Topic body is thin; reader may not understand the active topic thread.', 'missing locale-specific key should fall back explicitly to English pack');


const foundationCriticalReadCases = Object.freeze([
  Object.freeze({
    schemaId: 'tiinex.party.role.v1',
    expectedSections: Object.freeze(['ROLE IDENTITY', 'ROLE BOUNDARY', 'AUTHORITY AND RESPONSIBILITY BOUNDARY', 'HOLDER RELATIONSHIP', 'INTERPRETATION LIMITS']),
    meaningful: 'Role Label: Loom',
    markdown: `# Continuity Context

- Current
  - Current Schema: [tiinex.party.role.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/party/role/tiinex.party.role.v1.schema.md)
  - Created At: 2026-08-30 00:00:00
  - Summary: Loom role

---

# Loom Role

## Role Identity

- Role Label: Loom
- Role Kind: portable Tooling role

## Role Boundary

- In Scope: bounded Tooling work
- Out Of Scope: canonical schema meaning

## Authority And Responsibility Boundary

- May Do: implement bounded shared mechanics
- Does Not Authorize: unrelated authority

## Holder Relationship

- Holder State: assignable only by explicit handoff

## Interpretation Limits

- Does Not Prove: current human holder
- Must Not Be Treated As: personal identity
`
  }),
  Object.freeze({
    schemaId: 'tiinex.project.v1',
    expectedSections: Object.freeze(['PROJECT IDENTITY', 'PROJECT PURPOSE AND SCOPE', 'PARTIES AND RESOURCES', 'COORDINATION STATE', 'MILESTONES AND OUTCOMES', 'INTERPRETATION LIMITS']),
    meaningful: 'Description: Tiinex Viewer',
    markdown: `# Continuity Context

- Current
  - Current Schema: [tiinex.project.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/project/tiinex.project.v1.schema.md)
  - Created At: 2026-08-26 00:00:00
  - Summary: Tiinex Viewer

---

# Tiinex Viewer

## Project Identity

- Description: Tiinex Viewer
- Boundary: human-readable Site product

## Project Purpose And Scope

- Description: make Tiinex artifacts understandable
- Boundary: presentation without semantic rewriting

## Parties And Resources

- Relevant Parties: Anchor; Loom; Sigma
- Relevant Resources: Site source and canonical Docs schemas

## Coordination State

- Description: active Foundation work
- Boundary: current project state only

## Milestones And Outcomes

- Description: schema-owned reading coverage
- Boundary: deterministic product evidence

## Interpretation Limits

- Does Not Prove: release readiness
- Must Not Be Treated As: publication authority
`
  }),
  Object.freeze({
    schemaId: 'tiinex.party.organization.v1',
    expectedSections: Object.freeze(['ORGANIZATION IDENTITY', 'ORGANIZATION BOUNDARY', 'UNIT OR PARENT RELATIONSHIP', 'REPRESENTATION BOUNDARY', 'INTERPRETATION LIMITS']),
    meaningful: 'Organization Label: Tiinex',
    markdown: `# Continuity Context

- Current
  - Current Schema: [tiinex.party.organization.v1](https://github.com/Tiinex/docs/blob/911d4cf990e35ce25a56e8f376d296e327c48260/.topics/.schemas/party/organization/tiinex.party.organization.v1.schema.md)
  - Created At: 2026-08-26 00:00:00
  - Summary: Tiinex

---

# Tiinex

## Organization Identity

- Organization Label: Tiinex
- Organization Kind: project organization

## Organization Boundary

- In Scope: the open-source Tiinex project
- Out Of Scope: unrelated personal activity

## Unit Or Parent Relationship

- Parent Organization: none declared

## Representation Boundary

- Representation State: organizational continuity only

## Interpretation Limits

- Does Not Prove: legal status
- Must Not Be Treated As: representation authority
`
  }),
  Object.freeze({
    schemaId: 'tiinex.reduction.v1',
    expectedSections: Object.freeze(['SOURCE CONTEXT', 'CARRY-FORWARD STATE', 'LOSS AND UNCERTAINTY', 'VALIDATION']),
    meaningful: 'Source Scope: Foundation grounding inputs',
    markdown: `# Continuity Context

- Current
  - Current Schema: [tiinex.reduction.v1](https://github.com/Tiinex/docs/blob/8435cd46a3773a38301659da716785dc6465072c/.topics/.schemas/reduction/tiinex.reduction.v1.schema.md)
  - Created At: 2026-09-01 00:00:00
  - Summary: Foundation grounding checkpoint reduction

---

# Foundation Grounding Checkpoint Reduction

## Source Context

- Source Scope: Foundation grounding inputs
- Source Boundary: qualified carried material only

## Carry-Forward State

- Preserved State: current Foundation constraints and accepted decisions

## Loss And Uncertainty

- Known Loss: omitted historical detail remains recoverable from source
- Uncertainty: no release-readiness claim

## Validation

- Reduction Rule: no source item is removed before durable representation exists
`
  })
]);

for (const item of foundationCriticalReadCases) {
  const module = schemaRegistry.byId.get(item.schemaId);
  assert(module, `${item.schemaId} must be an exact registered companion`);
  assert.equal(Boolean(module.artifactCreation), false, `${item.schemaId} companion must remain presentation/read-only`);
  const presentation = schemaReadPresentation({ path: `.topics/${item.schemaId}.trace.md`, markdown: item.markdown });
  assert.equal(presentation.schema, item.schemaId);
  assert.equal(presentation.companionId, item.schemaId);
  assert.equal(presentation.readMode, 'schema-owned');
  assert.equal(presentation.readState, 'schema-owned');
  assert.equal(presentation.schemaCoverage, 'exact-companion');
  assert.equal(presentation.fallbackUsed, false);
  assert.deepEqual(presentation.sections.map((section) => section.label), item.expectedSections);
  assert(presentation.sections.some((section) => section.value.includes(item.meaningful)), `${item.schemaId} must expose meaningful schema-owned read content`);
}

assert.equal(schemaRegistry.byId.has('tiinex.party.v1'), false, 'party parent source dependency must not become a fifth read companion');
const partyParentFallback = schemaReadPresentation({
  markdown: `# Continuity Context

- Current
  - Current Schema: tiinex.party.v1
  - Created At: 2026-09-01 00:00:00

---

# Party

## Party Identity

- Label: bounded party
`
});
assert.equal(partyParentFallback.readMode, 'root-fallback', 'unregistered parent source dependency must preserve Root fallback');

const secondaryFamilyFallback = schemaReadPresentation({
  markdown: `# Continuity Context

- Current
  - Current Schema: tiinex.resource.v1
  - Created At: 2026-09-01 00:00:00

---

# Resource

## Resource Identity

- Description: secondary family remains intentionally unimplemented
`
});
assert.equal(secondaryFamilyFallback.readMode, 'root-fallback', 'secondary unimplemented families must preserve Root fallback');
assert.equal(secondaryFamilyFallback.schemaCoverage, 'unknown-schema');

console.log('✓ schema companion contract is flat, versioned, i18n-backed, and free of inert scaffold files, with bounded Foundation-critical read coverage');
