import { TASK_CANONICAL_BODY_SECTIONS, TASK_LEGACY_BODY_SECTIONS } from './tiinex.task.v1.contract.js';

const SECTION_FINDINGS = Object.freeze({
  Objective: ['task.objective.missing', 'Task body is missing the required Objective section.'],
  'Done Criteria': ['task.doneCriteria.missing', 'Task body is missing the required Done Criteria section.'],
  Scope: ['task.scope.missing', 'Task body is missing the required Scope section.'],
  Dependencies: ['task.dependencies.missing', 'Task body is missing the required Dependencies section.']
});

export function taskValidate(artifact) {
  const findings = [];
  if (artifact.envelope.current.schema.id !== 'tiinex.task.v1') {
    findings.push({ severity: 'warning', code: 'task.schema.mismatch', messageKey: 'task.schema.mismatch', message: 'Task validator invoked for non-task current schema.', source: 'tiinex.task.v1' });
    return findings;
  }
  const body = String(artifact.body?.text || '');
  const sections = new Set(Array.isArray(artifact.body?.sections) ? artifact.body.sections : []);
  if (!artifact.body.title) findings.push({ severity: 'error', code: 'task.title.missing', messageKey: 'task.title.missing', message: 'Task artifact should begin with a human-readable title.', source: 'tiinex.task.v1', fixability: 'safe' });
  for (const section of TASK_CANONICAL_BODY_SECTIONS) {
    if (sections.has(section)) continue;
    const [code, message] = SECTION_FINDINGS[section];
    findings.push({ severity: 'error', code, messageKey: code, message, source: 'tiinex.task.v1', fixability: 'manual' });
  }
  if (TASK_LEGACY_BODY_SECTIONS.some((section) => sections.has(section))) findings.push({ severity: 'warning', code: 'task.legacyShape.observed', messageKey: 'task.legacyShape.observed', message: 'Task body uses legacy browser-draft sections and is not the exact current canonical Task shape.', source: 'tiinex.task.v1', fixability: 'manual' });
  if (!body || body.length < 40) findings.push({ severity: 'warning', code: 'task.body.thin', messageKey: 'task.body.thin', message: 'Task body is thin; the bounded work request may be unclear.', source: 'tiinex.task.v1', fixability: 'manual' });
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'task.body.canonical', messageKey: 'task.body.canonical', message: 'Task body exposes the current canonical Objective, Done Criteria, Scope, and Dependencies sections.', source: 'tiinex.task.v1' });
  return findings;
}


export function validateLegacyTaskDraftCompatibility(artifact) {
  const findings = [];
  if (artifact?.envelope?.current?.schema?.id !== 'tiinex.task.v1') return [{ severity: 'error', code: 'task.schema.mismatch', messageKey: 'task.schema.mismatch', message: 'Legacy Task compatibility invoked for non-task current schema.', source: 'tiinex.task.v1' }];
  const sections = new Set(Array.isArray(artifact.body?.sections) ? artifact.body.sections : []);
  if (!artifact.body?.title) findings.push({ severity: 'error', code: 'task.title.missing', messageKey: 'task.title.missing', message: 'Task artifact should begin with a human-readable title.', source: 'tiinex.task.v1', fixability: 'safe' });
  const missing = TASK_LEGACY_BODY_SECTIONS.filter((section) => !sections.has(section));
  if (missing.length) findings.push({ severity: 'error', code: 'task.legacyShape.incomplete', messageKey: 'task.legacyShape.incomplete', message: `Legacy browser-draft compatibility requires: ${missing.join(', ')}.`, source: 'tiinex.task.v1', fixability: 'manual', params: { missing: missing.join(', ') } });
  findings.push({ severity: 'warning', code: 'task.legacyShape.observed', messageKey: 'task.legacyShape.observed', message: 'Task body uses the historical browser-draft shape; it is readable compatibility material, not the exact current canonical Task shape.', source: 'tiinex.task.v1', fixability: 'manual' });
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'task.legacyShape.readable', messageKey: 'task.legacyShape.readable', message: 'Historical browser-local Task draft remains readable and editable through the explicit compatibility boundary.', source: 'tiinex.task.v1' });
  return findings;
}
