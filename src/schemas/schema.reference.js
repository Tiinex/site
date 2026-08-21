import { canonicalGithubSchemaSourceTargets } from './schema.githubSourceTarget.js';

export const SCHEMA_REFERENCE_AUTHORITY_SCHEMA_ID = 'tiinex.site.schema-reference-authority.v1';

export function schemaReferenceAuthorityFromBinding(schemaId = '', binding = {}, sourceAuthority = null) {
  const id = String(schemaId || binding?.schemaId || '').trim();
  const exactSourceTargets = canonicalGithubSchemaSourceTargets(sourceAuthority);
  const exactTargets = exactSourceTargets.state === 'qualified' ? [...exactSourceTargets.targets] : [];
  return Object.freeze({
    schema: SCHEMA_REFERENCE_AUTHORITY_SCHEMA_ID,
    schemaId: id,
    exactTargets: Object.freeze(exactTargets),
    preferredTarget: exactTargets[0] || '',
    targetAuthority: exactTargets.length ? 'exact-source-target' : 'schema-id-only',
    exactSourceTargets
  });
}

export function parseSchemaReferenceValue(value = '') {
  const raw = String(value ?? '');
  if (!raw) return Object.freeze({ raw: '', form: 'empty', schemaId: '', target: '' });
  const link = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (link) return Object.freeze({ raw, form: 'markdown-link', schemaId: link[1], target: link[2] });
  return Object.freeze({ raw, form: 'plain-schema-id', schemaId: raw, target: '' });
}

export function renderSchemaReference(authority = {}) {
  const schemaId = String(authority?.schemaId || '').trim();
  if (!schemaId) throw new Error('schema-reference-id-missing');
  const target = String(authority?.preferredTarget || '').trim();
  return target ? `[${schemaId}](${target})` : schemaId;
}

export function qualifySchemaReferenceValue(value = '', authority = {}) {
  const observed = parseSchemaReferenceValue(value);
  const expectedSchemaId = String(authority?.schemaId || '').trim();
  const exactTargets = new Set([...(authority?.exactTargets || [])].map((item) => String(item ?? '')).filter(Boolean));
  const findings = [];
  if (!expectedSchemaId) findings.push('Expected schema identifier authority is unavailable.');
  if (observed.schemaId !== expectedSchemaId) findings.push(`Schema identifier must be exactly ${expectedSchemaId}; observed ${observed.schemaId || '(empty)'}.`);
  let targetState = 'not-present';
  if (observed.form === 'markdown-link') {
    targetState = exactTargets.has(observed.target) ? 'qualified' : 'unqualified';
    if (targetState !== 'qualified') findings.push(`Schema reference target is not qualified for ${expectedSchemaId}: ${observed.target || '(empty)'}.`);
  }
  if (observed.form === 'empty') findings.push('Schema reference value is empty.');
  return Object.freeze({
    state: findings.length ? 'unavailable' : 'qualified',
    schemaIdState: observed.schemaId === expectedSchemaId && expectedSchemaId ? 'qualified' : 'unavailable',
    targetState,
    observed,
    authority,
    findings: Object.freeze(findings)
  });
}
