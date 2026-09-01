export function correlateExternalPayloadFacts(markdown, facts, findings, path) {
  if (!facts || facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) return;
  const identity = sectionText(markdown, 'Payload Identity');
  const location = sectionText(markdown, 'Payload Location');
  const integrity = sectionText(markdown, 'Integrity Reference');
  const visiblePath = markdownTarget(fieldValue(location, 'Location'));
  if (facts.archivePath && visiblePath !== String(facts.archivePath)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.visible-location-mismatch', 'External Payload visible Location diverges from its sealed machine facts.', { path }));
  if (facts.archiveSha256 && fieldValue(integrity, 'Integrity Value') !== String(facts.archiveSha256)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.visible-integrity-mismatch', 'External Payload visible integrity value diverges from its sealed machine facts.', { path }));
  if (facts.archiveBytes !== undefined && Number(fieldValue(identity, 'Byte Size') || -1) !== Number(facts.archiveBytes)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.visible-bytes-mismatch', 'External Payload visible byte size diverges from its sealed machine facts.', { path }));
}
export function correlateRelationFacts(markdown, facts, findings, path) {
  if (!facts || facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) return;
  const target = sectionText(markdown, 'Relation Target');
  if (facts.relationDirection === 'payload artifact -> represented artifact') {
    if (facts.payloadArtifactPath && markdownTarget(fieldValue(target, 'Source')) !== String(facts.payloadArtifactPath)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.visible-source-mismatch', 'Relation visible Source diverges from its derived compatibility facts.', { path }));
    if (facts.workspaceArtifactInnerPath && markdownTarget(fieldValue(target, 'Target')) !== String(facts.workspaceArtifactInnerPath)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.visible-target-mismatch', 'Relation visible Target diverges from its derived compatibility facts.', { path }));
    return;
  }
  if (facts.workspaceArtifactPath && markdownTarget(fieldValue(target, 'Source')) !== String(facts.workspaceArtifactPath)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.visible-source-mismatch', 'Relation visible Source diverges from its sealed machine facts.', { path }));
  if (facts.payloadArtifactPath && markdownTarget(fieldValue(target, 'Target')) !== String(facts.payloadArtifactPath)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.visible-target-mismatch', 'Relation visible Target diverges from its sealed machine facts.', { path }));
}
export function correlatePointerFacts(markdown, facts, findings, path) {
  if (!facts || facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) return;
  if (facts.role !== 'handoff-route' || !facts.archivePath) return;
  const targets = [...sectionText(markdown, 'Destinations').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]);
  if (targets.length !== 1 || targets[0] !== String(facts.archivePath)) findings.push(finding('error', 'portable.handoff-v2-surface.pointer.visible-destination-mismatch', 'Route Pointer visible Destination diverges from its sealed machine facts.', { path }));
}
export function markdownTarget(value = '') { return String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || String(value || '').trim(); }
export function inspectExternalPayloadShape(markdown, findings, path) {
  for (const section of ['Payload Identity', 'Payload Location', 'Integrity Reference', 'Access Boundary', 'Interpretation Limits']) if (!sectionText(markdown, section)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.section-missing', `External Payload artifact is missing required section ${section}.`, { path, section }));
  const required = [['Payload Identity', 'Payload Label'], ['Payload Identity', 'Payload Kind'], ['Payload Location', 'Location'], ['Payload Location', 'Location Type'], ['Integrity Reference', 'Integrity Status'], ['Access Boundary', 'Access Boundary']];
  for (const [section, field] of required) if (!fieldValue(sectionText(markdown, section), field)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.field-missing', `External Payload artifact is missing required field ${field}.`, { path, section, field }));
}
export function inspectRelationShape(markdown, findings, path) {
  for (const section of ['Relation Declaration', 'Relation Target', 'Relation Boundary']) if (!sectionText(markdown, section)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.section-missing', `Relation artifact is missing required section ${section}.`, { path, section }));
  for (const field of ['Relation Type', 'Relation Direction', 'Relation Scope']) if (!fieldValue(sectionText(markdown, 'Relation Declaration'), field)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.field-missing', `Relation artifact is missing required field ${field}.`, { path, field }));
}
export function currentSchemaId(markdown = '') {
  const match = String(markdown || '').match(/Current Schema:\s*(?:\[)?(tiinex\.[a-z0-9._-]+)(?:\])?/i);
  return String(match?.[1] || '').toLowerCase();
}
export function sectionText(markdown = '', heading = '') {
  const re = new RegExp(`^##\\s+${escapeRe(heading)}\\s*$`, 'mi');
  const match = re.exec(String(markdown || ''));
  if (!match) return '';
  const rest = String(markdown || '').slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}
export function fieldValue(section = '', name = '') { const m = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRe(name)}:\\s*(.+?)\\s*$`, 'mi')); return String(m?.[1] || '').trim(); }
export function unquoteCode(value = '') { const text = String(value || '').trim(); return text.startsWith('`') && text.endsWith('`') ? text.slice(1, -1) : text; }
export function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
export function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
export function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
