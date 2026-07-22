import assert from 'node:assert/strict';
import { schemaCanonicalBinding, schemaLineageActions, schemaReadPresentation, SCHEMA_COMPANION_CONTRACT_ID } from './companion.js';

const evidence = {
  id: 'ev1',
  title: 'Evidence sample',
  summary: 'Sample evidence summary.',
  schemaId: 'tiinex.evidence.v1',
  kind: 'tiinex.evidence.v1',
  markdown: [
    '# Continuity Context',
    '',
    '- Current',
    '  - Current Schema: [tiinex.evidence.v1](tiinex.evidence.v1.schema.md)',
    '  - Created At: 2026-01-01T00:00:00Z',
    '  - Summary: Sample evidence summary.',
    '',
    '# Evidence sample',
    '',
    '## Supported Claim',
    '',
    '- The claim is schema-owned.',
    '',
    '## Evidence Material',
    '',
    '- The material belongs to evidence.',
    '',
    '# Continuity Integrity',
    '',
    '- Draft Local Integrity'
  ].join('\n'),
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master', label: 'Tiinex/docs' },
  path: '.topics/evidence/sample.md'
};

const read = schemaReadPresentation(evidence, { compact: true, maxSections: 2 });
assert.equal(read.contract, SCHEMA_COMPANION_CONTRACT_ID);
assert.equal(read.companionId, 'tiinex.evidence.v1');
assert.deepEqual(read.sections.map((section) => section.label), ['SUPPORTED CLAIM', 'EVIDENCE MATERIAL']);

const actions = schemaLineageActions(evidence, { surface: 'lineage' }).map((action) => action.id);
assert(actions.includes('record.continue'));
assert(actions.includes('record.reference'));
assert(actions.includes('record.markdown'));
assert(!actions.includes('record.share'));

const binding = schemaCanonicalBinding(evidence);
assert.equal(binding.snapshot, './tiinex.evidence.v1.schema.md');
assert(binding.permalink.includes('/Tiinex/docs/'));

console.log('✓ schema companion owns read projection and lineage actions');
