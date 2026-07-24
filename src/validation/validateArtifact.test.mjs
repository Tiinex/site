import assert from 'node:assert/strict';
import { validateArtifact } from './validateArtifact.js';
import { resolveFindingMessage } from './i18n.js';

const topicMarkdown = [
  '# Continuity Context',
  '',
  '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
  '- Current',
  '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
  '  - Created At: 2026-01-01T00:00:00Z',
  '  - Summary: Topic test.',
  '',
  '---',
  '',
  '# Short',
  '',
  'tiny',
  '',
  '# Continuity Integrity',
  '',
  '- sha256-base64url-c14n-v2',
  '  - Towards: self',
  '  - Value: pending'
].join('\n');

const result = validateArtifact({ markdown: topicMarkdown });
assert.equal(result.validation.rootValidator, 'run', 'Root validation must run through the shared pipeline');
assert.equal(result.validation.childValidator, 'run', 'exact Topic validator must run after Root');
assert(result.findings.some((finding) => finding.code === 'root.parent.absent'), 'Root findings must be present');
assert(result.findings.some((finding) => finding.code === 'topic.body.thin'), 'Topic-specific findings must be present');
assert(result.findings.some((finding) => finding.code === 'integrity.c14n-v2.detected'), 'integrity engine must see c14n-v2 declarations');
assert(!result.findings.some((finding) => finding.code === 'audit.validator.unavailable'), 'exact schema validators must not be reported unavailable');
const titleFinding = result.findings.find((finding) => finding.code === 'topic.body.thin');
assert.equal(resolveFindingMessage(titleFinding, { locale: 'en' }), 'Topic body is thin; reader may not understand the active topic thread.');

const rootlessChildSource = await import('../schemas/core/topic/tiinex.topic.v1.validate.js');
assert.equal(typeof rootlessChildSource.topicValidate, 'function');

console.log('✓ validation pipeline composes Root, integrity, exact schema, findings, and i18n');
