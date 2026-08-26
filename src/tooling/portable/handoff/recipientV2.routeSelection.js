export function selectRecipientRoutes(routes = [], selector = '', findings = []) {
  const qualified = [...routes].filter((route) => String(route.state || '') === 'qualified');
  const requested = String(selector || '').trim();
  if (!requested) return Object.freeze({ selector: '', routes: Object.freeze(qualified) });
  const normalized = normalizeRoutePath(requested);
  const matches = qualified.filter((route) => String(route.id || '') === requested || normalizeRoutePath(route.workspaceRelativePath || '') === normalized || `${String(route.workspaceId || '')}:${normalizeRoutePath(route.workspaceRelativePath || '')}` === requested);
  if (matches.length !== 1) {
    findings.push(Object.freeze({ severity: 'error', code: matches.length > 1 ? 'portable.handoff-v2-surface.route-selector.ambiguous' : 'portable.handoff-v2-surface.route-selector.unresolved', message: 'Recipient-v2 selected transport route must resolve to exactly one qualified Handoff route before the visible surface is generated.', selector: requested, matches: matches.length }));
    return Object.freeze({ selector: requested, routes: Object.freeze([]) });
  }
  return Object.freeze({ selector: requested, routes: Object.freeze(matches) });
}

function normalizeRoutePath(value = '') {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
}
