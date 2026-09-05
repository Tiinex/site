const MAX_ITEMS = 6;

export function projectGroundingPlanningContext(requiredContext = []) {
  const items = [];
  for (const entry of requiredContext || []) {
    if (String(entry?.state || '') !== 'qualified' || typeof entry?.content !== 'string') continue;
    const planning = section(entry.content, 'Planning Context');
    if (!planning) continue;
    items.push(Object.freeze({
      requirementId: String(entry.requirementId || entry.name || ''),
      workspace: String(entry.workspaceId || ''),
      path: String(entry.innerPath || entry.workspaceRelativePath || ''),
      segment: field(planning, 'Segment'),
      purpose: field(planning, 'Purpose'),
      endCondition: field(planning, 'End Condition'),
      forecast: field(planning, 'Expected Remaining Turns Or Handoffs'),
      confidence: field(planning, 'Confidence'),
      afterBoundary: field(planning, 'After This Segment'),
      basis: 'exact-qualified-required-context-planning-section'
    }));
    if (items.length >= MAX_ITEMS) break;
  }
  if (!items.length) return Object.freeze({ state: 'unresolved', items: Object.freeze([]) });
  return Object.freeze({
    state: 'qualified',
    items: Object.freeze(items),
    boundary: 'Only qualified carried Planning Context fields create plan semantics.'
  });
}

function section(markdown = '', heading = '') { const escaped = escape(heading); return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || ''; }
function field(markdown = '', label = '') { const escaped = escape(label); return strip(String(markdown || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+)$`, 'mi'))?.[1] || ''); }
function strip(value = '') { return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').replace(/[`*_]/g, '').trim(); }
function escape(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
