import { C14N_V2_METHOD_ID, canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';

export const EXACT_AUTHORITY_REPRESENTATION_SCHEMA_ID = 'tiinex.site.exact-authority-representation.v1';
const freeze = Object.freeze;

export function qualifyExactAuthorityRepresentation(input = {}) {
  const reference = token(input.reference) || (token(input.path) ? `site-local:${token(input.path)}` : '');
  const path = token(input.path);
  const markdown = String(input.markdown || '');
  if (!reference || !path || !markdown) return unavailable(reference, path, 'authority-representation-input-missing');
  const integrity = canonicalC14nV2SelfState(markdown);
  if (integrity.state !== 'verified' || integrity.method !== C14N_V2_METHOD_ID || !token(integrity.declaredValue)) {
    return unavailable(reference, path, `authority-representation-integrity-${integrity.state || 'unavailable'}`, integrity);
  }
  return freeze({
    schema: EXACT_AUTHORITY_REPRESENTATION_SCHEMA_ID,
    state: 'qualified',
    reason: '',
    reference,
    path,
    method: integrity.method,
    value: integrity.declaredValue,
    integrity: freeze({ state: integrity.state, method: integrity.method, towards: integrity.towards, declaredValue: integrity.declaredValue, computedValue: integrity.computedValue }),
    readOnly: true
  });
}

export function verifyExactAuthorityRepresentation(expected = {}, material = {}) {
  const actual = qualifyExactAuthorityRepresentation(material);
  const match = actual.state === 'qualified'
    && token(expected.reference) === actual.reference
    && token(expected.method) === actual.method
    && token(expected.value) === actual.value;
  return freeze({
    state: match ? 'qualified' : 'mismatch',
    reason: match ? '' : actual.state !== 'qualified' ? actual.reason : 'authority-representation-identity-mismatch',
    expected: freeze({ reference: token(expected.reference), method: token(expected.method), value: token(expected.value) }),
    actual
  });
}

function unavailable(reference = '', path = '', reason = '', integrity = null) {
  return freeze({
    schema: EXACT_AUTHORITY_REPRESENTATION_SCHEMA_ID,
    state: 'unavailable',
    reason,
    reference,
    path,
    method: token(integrity?.method),
    value: token(integrity?.declaredValue),
    integrity: integrity ? freeze({ state: integrity.state || '', method: integrity.method || '', towards: integrity.towards || '', declaredValue: integrity.declaredValue || '', computedValue: integrity.computedValue || '' }) : null,
    readOnly: true
  });
}
function token(value = '') { return String(value || '').trim(); }
