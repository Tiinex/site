export function projectParticipantAuthority(authority = null) {
  const role = authority?.role || {};
  const material = role.material?.artifact || null;
  const declared = role.authorityBoundaryLoaded || {};
  const holder = authority?.holderBinding || {};
  const hasBasis = String(role.state || '') === 'qualified' && Boolean(material) && Boolean(declared.mayDo || declared.doesNotAuthorize || declared.reviewBoundary);
  if (!hasBasis) return Object.freeze({ state: 'unresolved', participantIdentityCreatesAuthority: false, conversationPositionCreatesAuthority: false, universalHumanFeedbackRule: false });
  return Object.freeze({
    state: 'qualified-declared-basis',
    recipientRole: String(role.endpoint?.label || authority?.handoff?.to || ''),
    roleMaterial: Object.freeze({ path: String(material.path || ''), schemaId: String(material.schemaId || ''), roleLabel: String(material.roleLabel || '') }),
    authorityBoundary: Object.freeze({ mayDo: compact(declared.mayDo), doesNotAuthorize: compact(declared.doesNotAuthorize), reviewBoundary: compact(declared.reviewBoundary) }),
    holderBinding: Object.freeze({ state: String(holder.state || 'unresolved'), roleLabel: String(holder.roleLabel || ''), source: String(holder.source || 'none'), explicit: Boolean(holder.explicit), inferredFromTransport: Boolean(holder.inferredFromTransport) }),
    participantIdentityCreatesAuthority: false,
    conversationPositionCreatesAuthority: false,
    universalHumanFeedbackRule: false,
    boundary: 'Qualified Role material plus explicit holder binding is the basis. Identity/chat position alone create no authority; no universal human-input-as-feedback rule is imposed.'
  });
}
function compact(value = '', limit = 180) { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text; }
