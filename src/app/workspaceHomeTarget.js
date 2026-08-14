export function workspaceHomeHref(workspaceConfig = {}, locationLike = null) {
  const location = locationLike || globalThis.location || { href: '', pathname: '/', search: '' };
  const identity = workspaceConfig?.viewerIdentity || {};
  const configured = String(identity.workspaceHome || '').trim();
  const publicViewer = String(identity.publicViewerUrl || '').trim();
  return resolveHomeValue(configured, location) || resolveHomeValue(publicViewer, location) || cleanViewerHref(location);
}
function resolveHomeValue(value = '', location = {}) { const text = String(value || '').trim(); if (!text || /^(javascript|data|blob):/i.test(text)) return ''; if (text.startsWith('#')) return `${location.pathname || '/'}${location.search || ''}${text}`; try { return new URL(text, location.href || 'http://localhost/').href; } catch (_) { return ''; } }
function cleanViewerHref(location = {}) { return `${location.pathname || '/'}${location.search || ''}`; }
