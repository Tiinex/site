import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { rootValidate } from '../schemas/root.validate.js';

export const TRANSITION_VALIDATION_SCHEMA_ID = 'tiinex.transition.validation.v1';

export function validateTransitionDraft(draft = {}, parentRecord = {}) {
  const parsed = parseArtifactMarkdown(draft.markdown || '');
  const findings = [];
  for (const finding of rootValidate(parsed)) {
    findings.push(normalizeFinding(finding));
  }

  const parent = parsed.envelope?.parent || {};
  const current = parsed.envelope?.current || {};
  const expectedTrace = parentRecord?.id ? `record:${parentRecord.id}` : '';
  const expectedCurrentSchema = String(draft.kind || draft.targetSchemaId || '').trim();
  const parentBoundary = String(parent.boundary || draft.transition?.parentBoundary || '').trim();
  const parentOrigin = String(parent.origin || '').trim();

  if (expectedTrace && parent.trace !== expectedTrace) {
    findings.push(error('transition.parent.trace.mismatch', `Draft parent Trace must preserve ${expectedTrace}.`));
  }
  if (!parent.trace) findings.push(error('transition.parent.trace.required', 'Transition draft must include Parent Trace.'));
  if (!parentBoundary) findings.push(error('transition.parent.boundary.required', 'Transition draft must include Parent Boundary.'));
  if (parentRecord?.path && !parentOrigin) findings.push(warning('transition.parent.origin.missing', 'Parent path exists but draft Origin is missing; recovery will be degraded.'));
  if (parentRecord?.path && parentOrigin && !originMatchesPath(parentOrigin, parentRecord.path)) {
    findings.push(warning('transition.parent.origin.unexpected', 'Draft Origin does not end with the parent canonical path.'));
  }

  if (expectedCurrentSchema && current.schema?.id !== expectedCurrentSchema) {
    findings.push(error('transition.current.schema.mismatch', `Draft Current Schema must be ${expectedCurrentSchema}.`));
  }
  if (draft.status !== 'local') findings.push(error('transition.result.status.not-local', 'Transition result must stay browser-local until explicit publication/export.'));
  if (!String(draft.sourceMode || '').startsWith('local')) findings.push(error('transition.result.sourceMode.not-local', 'Transition result sourceMode must remain local-transition/local-reference.'));
  if (draft.source?.adapterId === 'github') findings.push(error('transition.result.github.provenance.inferred', 'Transition draft must not inherit GitHub source provenance.'));

  const parentBoundaryExpectation = expectedParentBoundary(parentRecord);
  if (parentBoundaryExpectation === 'local' && impliesGithubProvenance(parentBoundary)) {
    findings.push(error('transition.parent.boundary.local-github-leak', 'Local parent boundary must not imply GitHub provenance.'));
  }
  if (parentBoundaryExpectation === 'local' && !/no github provenance inferred/i.test(parentBoundary)) {
    findings.push(warning('transition.parent.boundary.local-weak', 'Local parent boundary should explicitly say no GitHub provenance is inferred.'));
  }
  if (parentBoundaryExpectation === 'github' && !/source-backed github material/i.test(parentBoundary)) {
    findings.push(warning('transition.parent.boundary.github-weak', 'GitHub parent boundary should preserve that the parent was source-backed GitHub material.'));
  }

  if (!parsed.hasIntegrity) findings.push(error('transition.integrity.required', 'Transition draft must include draft integrity footer.'));
  if (!draft.transition?.contract) findings.push(error('transition.contract.missing', 'Transition result must declare the transition contract.'));
  if (!draft.transition?.type) findings.push(error('transition.type.missing', 'Transition result must declare transition type.'));

  return {
    schema: TRANSITION_VALIDATION_SCHEMA_ID,
    ok: !findings.some((finding) => finding.severity === 'error'),
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid' : findings.some((finding) => finding.severity === 'warning') ? 'degraded' : 'valid',
    counts: countFindings(findings),
    findings,
    parsed: {
      envelopeSchemaId: parsed.envelope?.envelopeSchema?.id || '',
      parentSchemaId: parent.schema?.id || '',
      parentTrace: parent.trace || '',
      parentOrigin,
      parentBoundary,
      currentSchemaId: current.schema?.id || '',
      currentCreatedAt: current.createdAt || '',
      hasIntegrity: Boolean(parsed.hasIntegrity)
    }
  };
}

function expectedParentBoundary(record = {}) {
  const source = record.source || {};
  if (source.adapterId === 'github' || source.kind === 'github-source-backed' || source.sourceKind === 'github.repo') return 'github';
  if (source.adapterId === 'local' || source.kind === 'local-session' || String(record.sourceMode || '').startsWith('local')) return 'local';
  return 'explicit';
}

function impliesGithubProvenance(boundary = '') {
  const text = String(boundary || '').toLowerCase();
  if (!text.includes('github')) return false;
  if (/no\s+github\s+provenance\s+inferred/.test(text)) return false;
  return /source-backed\s+github|github\s+material|github\s+provenance/.test(text);
}

function originMatchesPath(origin = '', path = '') {
  const cleanPath = normalizePath(path);
  const cleanOrigin = normalizePath(origin);
  return Boolean(cleanPath && (cleanOrigin === cleanPath || cleanOrigin.endsWith(`/${cleanPath}`)));
}

function normalizePath(value = '') {
  try {
    const url = new URL(String(value || ''));
    const host = url.hostname.toLowerCase();
    if (host === 'raw.githubusercontent.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts.length >= 4 ? parts.slice(3).join('/') : parts.join('/');
    }
    const parts = url.pathname.split('/').filter(Boolean);
    const blob = parts.indexOf('blob');
    if (host.endsWith('github.com') && blob >= 0 && parts.length > blob + 2) return parts.slice(blob + 2).join('/');
    return url.pathname.replace(/^\/+/, '');
  } catch (error) {
    return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/');
  }
}

function normalizeFinding(finding = {}) {
  return {
    severity: finding.severity || 'info',
    code: finding.code || 'transition.root.finding',
    message: finding.message || 'Root validation finding.',
    source: finding.source || 'tiinex.transition.validation.v1'
  };
}

function countFindings(findings = []) {
  const counts = { error: 0, warning: 0, info: 0, preserve: 0, total: 0 };
  for (const finding of findings) {
    const severity = finding?.severity || 'info';
    if (counts[severity] == null) counts[severity] = 0;
    counts[severity] += 1;
    counts.total += 1;
  }
  return counts;
}

function error(code, message) { return { severity: 'error', code, message, source: TRANSITION_VALIDATION_SCHEMA_ID }; }
function warning(code, message) { return { severity: 'warning', code, message, source: TRANSITION_VALIDATION_SCHEMA_ID }; }
