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
assert.equal(read.readState, 'schema-owned', 'evidence companion must report schema-owned read state');
assert.equal(read.schemaCoverage, 'exact-companion', 'evidence companion must report exact schema coverage');
assert.equal(read.bodyAvailability, 'available', 'schema-owned evidence read body is available');

const actions = schemaLineageActions(evidence, { surface: 'lineage' }).map((action) => action.id);
assert(actions.includes('record.continue'));
assert(actions.includes('record.reference'));
assert(actions.includes('record.markdown'));
assert(!actions.includes('record.share'));

const binding = schemaCanonicalBinding(evidence);
assert.equal(binding.snapshot, './tiinex.evidence.v1.schema.md');
assert(binding.permalink.includes('/Tiinex/docs/'));


const unknown = {
  id: 'party1',
  title: 'Party Organization',
  summary: 'Schema for an organization party.',
  schemaId: 'party.organization',
  kind: 'party.organization',
  currentCreatedAt: '2026-07-23T00:00:00Z',
  markdown: [
    '# Continuity Context',
    '',
    '- Current',
    '  - Current Schema: [party.organization](party.organization.v1.schema.md)',
    '  - Created At: 2026-07-23T00:00:00Z',
    '  - Summary: Schema for an organization party.',
    '  - Status: draft/local',
    '',
    '# Party Organization',
    '',
    '## Organization Identity',
    '',
    '- Name: Demo organization',
    '- Role: bounded party',
    '',
    '# Continuity Integrity',
    '',
    '- Draft Local Integrity'
  ].join('\n'),
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master', label: 'Tiinex/docs' },
  path: '.topics/.schemas/party/party.organization.v1.schema.md'
};

const fallbackRead = schemaReadPresentation(unknown, { compact: true, maxSections: 2 });
assert.equal(fallbackRead.companionId, 'tiinex.root.v1', 'unknown child schema must read through root companion');
assert.equal(fallbackRead.readMode, 'root-fallback', 'unknown child schema must disclose root fallback read mode');
assert.equal(fallbackRead.fallbackUsed, true, 'unknown child schema must mark fallback use');
assert.equal(fallbackRead.readState, 'root-fallback', 'unknown child schema must use root-fallback read state');
assert.equal(fallbackRead.schemaCoverage, 'unknown-schema', 'unknown child schema must disclose missing exact companion');
assert.equal(fallbackRead.bodyAvailability, 'available', 'unknown child schema body remains readable through root fallback');
assert(fallbackRead.sections.length >= 1, 'root fallback must still provide readable sections');
assert(fallbackRead.sections.some((section) => /fallback/i.test(section.label) || /organization identity/i.test(section.label)), 'fallback read should expose status or material sections');


const rootArtifact = {
  id: 'root1',
  title: 'Root artifact',
  schemaId: 'tiinex.root.v1',
  kind: 'tiinex.root.v1',
  markdown: [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    '- Current',
    '  - Current Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    '  - Created At: 2026-07-23T00:00:00Z',
    '  - Summary: Root artifact summary.',
    '',
    '# Root',
    '',
    'Root artifact body.',
    '',
    '# Continuity Integrity',
    '',
    '- Draft Local Integrity'
  ].join('\n')
};
const rootRead = schemaReadPresentation(rootArtifact, { compact: true, maxSections: 2 });
assert.equal(rootRead.companionId, 'tiinex.root.v1', 'root artifact reads through root companion');
assert.equal(rootRead.readState, 'root-readable', 'root artifact must have root-readable state distinct from fallback');
assert.equal(rootRead.schemaCoverage, 'exact-companion', 'root artifact has exact companion coverage');

const unavailable = schemaReadPresentation({ id: 'metadata', title: 'Metadata shell', schemaId: 'tiinex.topic.v1', markdown: '', source: { adapterId: 'github', repo: 'Tiinex/docs' } }, { compact: true });
assert.equal(unavailable.readState, 'unavailable-body', 'metadata-only source shell must disclose unavailable body');
assert.equal(unavailable.bodyAvailability, 'unavailable-body', 'metadata-only source shell must not pretend body is available');

console.log('✓ schema companion owns read projection and lineage actions');
