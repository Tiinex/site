import { INTERPRETATION_CREATION_FIELDS, INTERPRETATION_REQUIRED_SECTIONS } from './tiinex.interpretation.v1.contract.js';

export function interpretationValidate(artifact = {}) {
  const findings = [];
  if (artifact?.envelope?.current?.schema?.id !== 'tiinex.interpretation.v1') {
    return [finding('warning', 'interpretation.schema.mismatch', 'Interpretation validator invoked for non-interpretation current schema.')];
  }
  const body = String(artifact?.body?.text || '');
  const sections = new Set(Array.isArray(artifact?.body?.sections) ? artifact.body.sections : []);
  if (!artifact?.body?.title) findings.push(finding('error', 'interpretation.title.missing', 'Interpretation artifact should begin with a human-readable title.'));
  for (const section of INTERPRETATION_REQUIRED_SECTIONS) {
    if (!sections.has(section)) findings.push(finding('error', 'interpretation.section.missing', `Interpretation body is missing the required ${section} section.`, { section }));
  }
  for (const field of INTERPRETATION_CREATION_FIELDS) {
    if (!fieldValue(body, field)) findings.push(finding('error', 'interpretation.field.missing', `Interpretation body is missing required field ${field}.`, { field }));
  }
  if (!findings.some((item) => item.severity === 'error')) findings.push(finding('info', 'interpretation.contract.readable', 'Interpretation body exposes the required bounded Use-as fields.'));
  return findings;
}

function fieldValue(body = '', field = '') {
  const escaped = String(field).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(body).match(new RegExp(`^\\s*-\\s*${escaped}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
}
function finding(severity, code, message, params = {}) { return { severity, code, messageKey: code, message, source: 'tiinex.interpretation.v1', params }; }
