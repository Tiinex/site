(function attachSourceIdentity(global) {
  'use strict';
  function sourceIdPart(value, fallback = 'unresolved') {
    return String(value || '').trim().toLowerCase()
      .replace(/^\.+\/?/, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9._/-]+/g, '-')
      .replace(/\/{2,}/g, '/')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/\//g, '-') || fallback;
  }
  function makeConfiguredSourceId(input = {}) {
    return `github:${sourceIdPart(input.repository || input.repo, 'source')}:${sourceIdPart(input.ref, 'unresolved')}:${sourceIdPart(input.rootPath || '.topics', 'root')}`;
  }
  global.TiinexSourceIdentity = { sourceIdPart, makeConfiguredSourceId };
})(typeof window !== 'undefined' ? window : globalThis);
