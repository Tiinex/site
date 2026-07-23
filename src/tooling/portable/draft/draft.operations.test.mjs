import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { explainPortableArtifactFindings, planPortableArtifactRepairs, validatePortableArtifactDraft } from '../engine.facade.js';

const evidenceSchema = await readFile(new URL('../../../schemas/core/evidence/tiinex.evidence.v1.schema.md', import.meta.url), 'utf8');
const rootSchema = await readFile(new URL('../../../schemas/tiinex.root.v1.schema.md', import.meta.url), 'utf8');
const material = { files: [{ path: 'schemas/tiinex.evidence.v1.schema.md', content: evidenceSchema }] };
const incomplete = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.evidence.v1
  - Created At: 2026-07-22 00:00:00
  - Summary: Incomplete evidence draft.

---

# Evidence Draft

## Supported Claim Or Question

- Supported Claim Or Question: whether mobile overflow was observed
- Evidence Role: supports
`;

const validation = validatePortableArtifactDraft({ ...material, schemaId: 'tiinex.evidence.v1', path: 'draft.md', markdown: incomplete });
assert.equal(validation.operation, 'validate-draft');
assert.equal(validation.validation.structural.missingSections.includes('Provenance'), true);
assert.equal(validation.validation.structural.missingFields.includes('Known Source'), true);
assert.equal(validation.validation.qualification.contractDrivenStructuralValidation, true);
assert.equal(validation.findingSummary.counts.error > 0, true);

const explanation = explainPortableArtifactFindings(validation.validation);
assert.equal(explanation.explanation.explanations.some((item) => item.category === 'structure'), true);
assert.equal(explanation.explanation.explanations.some((item) => item.recommendedAction.includes('required section/field')), true);

const repair = planPortableArtifactRepairs(validation.validation);
assert.equal(repair.repairPlan.steps.length > 0, true);
assert.equal(repair.repairPlan.boundary.automaticRewrite, false);
assert.equal(repair.repairPlan.boundary.preserveUnknownSections, true);

const rootDraft = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.root.v1
  - Created At: 2026-07-22 00:00:00

---

# Root Draft
`;
const rootValidation = validatePortableArtifactDraft({
  files: [{ path: 'schemas/tiinex.root.v1.schema.md', content: rootSchema }],
  schemaId: 'tiinex.root.v1',
  path: 'root-draft.md',
  markdown: rootDraft
});
assert.equal(rootValidation.validation.structural.missingFields.includes('Parent Schema'), false);
assert.equal(rootValidation.validation.structural.missingFields.includes('Trace'), false);
assert.equal(rootValidation.validation.structural.conditionalRequirements.some((entry) => entry.name === 'Parent'), true);
assert.equal(rootValidation.validation.sharedParserQuirks.some((entry) => entry.code === 'portable.draft.shared-parser.parent-block-fallback'), true);
assert.equal(rootValidation.findings.some((finding) => finding.code === 'root.parent.schema.missing'), false);
assert.equal(rootValidation.findings.some((finding) => finding.code === 'root.parent.trace.missing'), false);
assert.equal(rootValidation.findings.some((finding) => finding.code === 'root.parent.origin.missing'), false);

console.log('✓ portable draft validation, finding explanation, and bounded repair plan passed');
