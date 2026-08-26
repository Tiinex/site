import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const HANDOFF_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md';
const TASK_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';

export function qualifiedHandoffFixture(input = {}) {
  const title = String(input.title || `Qualified ${input.to || 'recipient'} handoff fixture`);
  const from = String(input.from || 'Anchor');
  const to = String(input.to || 'Loom');
  const purpose = String(input.purpose || 'qualified Handoff regression fixture');
  const createdAt = String(input.createdAt || '2026-08-23 12:00:00');
  const requiredContext = sectionEntries(input.requiredContext, '- none');
  const referenceContext = sectionEntries(input.referenceContext, '- none');
  const retainedResponsibilities = sectionEntries(input.retainedResponsibilities, '- none');
  const exclusions = sectionEntries(input.exclusionsAndDependencies, '- none');
  const transferKind = String(input.transferKind || 'work');
  const signalKind = String(input.signalKind || 'return');
  const parent = input.parent && typeof input.parent === 'object' ? input.parent : null;
  const parentBlock = parent ? `- Parent\n  - Parent Schema: [${String(parent.schemaId || 'tiinex.task.v1')}](${String(parent.schemaTarget || TASK_SCHEMA_TARGET)})\n  - Created At: ${String(parent.createdAt || '2026-08-23 11:00:00')}\n  - Trace: [Parent](${String(parent.trace || '../parent.trace.md')})\n  - Origin:\n${parent.includeRelative === false ? '' : `    - [relative](${String(parent.relative || parent.trace || '../parent.trace.md')})\n`}${parent.includeBrowseGit === false ? '' : `    - [browse + git](${String(parent.browseGit || 'https://github.com/Tiinex/site/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/.topics/parent.trace.md')})\n`}\n` : '';
  const parentIntegrityEntry = parent ? `- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [Parent](${String(parent.towards || parent.browseGit || 'https://github.com/Tiinex/site/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/.topics/parent.trace.md')})\n  - Value: ${String(parent.targetValue || '')}\n\n` : '';
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n${parentBlock}- Current\n  - Current Schema: [tiinex.handoff.v1](${HANDOFF_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Authors: Fixture\n  - Why: Exercise portable Handoff qualification.\n  - Summary: ${title}.\n  - Status: local\n\n---\n\n# ${title}\n\n## Handoff Parties\n\n- Purpose: ${purpose}\n- From: ${from}\n- From Kind: role\n- To: ${to}\n- To Kind: role\n\n## Transfers\n\n- fixture-transfer\n  - Transfer Kind: ${transferKind}\n  - Description: bounded fixture work\n  - Boundary: fixture-only\n\n## Required Context\n\n${requiredContext}\n\n## Reference Context\n\n${referenceContext}\n\n## Retained Responsibilities\n\n${retainedResponsibilities}\n\n## Exclusions And Dependencies\n\n${exclusions}\n\n## Completion Expectation\n\n- Signal Kind: ${signalKind}\n- Signal Meaning: return the bounded fixture result\n- Return To: ${from}\n\n## Interpretation Limits\n\n- Does Not Mean: fixture routing grants semantic authority\n- Must Not Be Used To Claim: package placement or filenames override Tiinex qualification\n- Authority Limits: fixture only\n\n# Continuity Integrity\n\n${parentIntegrityEntry}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: \n`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`qualified-handoff-fixture.seal-failed:${sealed.reason || sealed.state}`);
  return `${sealed.markdown}\n`;
}

function sectionEntries(value, fallback) {
  const text = value === undefined || value === null ? fallback : String(value);
  return text.trim() || fallback;
}
