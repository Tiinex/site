export function parseRecipientV2Pointer(markdown = '') {
  const current = sectionText(markdown, 'Current Read');
  const destinations = sectionText(markdown, 'Destinations');
  return Object.freeze({
    role: fieldValue(current, 'Carrier Role'),
    workspaceId: unquoteCode(fieldValue(current, 'Workspace Id')),
    workspacePayload: markdownTarget(fieldValue(current, 'Workspace Payload')),
    handoffWorkspacePath: unquoteCode(fieldValue(current, 'Handoff Workspace Path')),
    routeId: unquoteCode(fieldValue(current, 'Route Id')),
    routeSelection: fieldValue(current, 'Route Selection'),
    selectedRouteId: unquoteCode(fieldValue(current, 'Selected Route Id')),
    candidateRouteCount: Number(unquoteCode(fieldValue(current, 'Candidate Route Count')) || 0),
    carrierDimension: unquoteCode(fieldValue(current, 'Carrier Dimension')),
    parentCarrierDimension: unquoteCode(fieldValue(current, 'Parent Carrier Dimension')),
    carrierCheckpoint: fieldValue(current, 'Carrier Checkpoint'),
    carrierProfile: fieldValue(current, 'Carrier Profile'),
    compatibilityTransport: fieldValue(current, 'Compatibility Transport'),
    endpointRequirementId: unquoteCode(fieldValue(current, 'Endpoint Requirement Id')),
    endpointParty: fieldValue(current, 'Endpoint Party'),
    participantRequirementId: unquoteCode(fieldValue(current, 'Participant Requirement Id')),
    roleLabelHint: fieldValue(current, 'Role Label Hint'),
    roleReference: unquoteCode(fieldValue(current, 'Role Reference')),
    targetCarrierKind: unquoteCode(fieldValue(current, 'Target Carrier Kind')),
    targetPayload: markdownTarget(fieldValue(current, 'Target Payload')),
    targetWorkspaceId: unquoteCode(fieldValue(current, 'Target Workspace Id')),
    targetInnerPath: unquoteCode(fieldValue(current, 'Target Inner Path')),
    targetArchiveEntry: unquoteCode(fieldValue(current, 'Target Archive Entry')),
    destinations: Object.freeze([...String(destinations || '').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => String(match[1] || '')))
  });
}

function sectionText(markdown = '', heading = '') {
  const escaped = escapeRe(heading);
  const match = String(markdown || '').match(new RegExp(`(?:^|\\n)## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n---\\n|$)`));
  return String(match?.[1] || '').trim();
}
function fieldValue(section = '', name = '') { const m = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRe(name)}:\\s*(.+?)\\s*$`, 'mi')); return String(m?.[1] || '').trim(); }
function unquoteCode(value = '') { const text = String(value || '').trim(); return text.startsWith('`') && text.endsWith('`') ? text.slice(1, -1) : text; }
function markdownTarget(value = '') { return String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || String(value || '').trim(); }
function escapeRe(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
