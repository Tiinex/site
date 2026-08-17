(function attachSourceIdentity(global) {
  'use strict';
  function sourceIdPart(value, fallback = 'unresolved', options = {}) {
    const caseSensitive = options?.caseSensitive === true;
    let text = String(value || '').trim();
    if (!caseSensitive) text = text.toLowerCase();
    return text
      .replace(/^\.+\/?/, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(caseSensitive ? /[^A-Za-z0-9._/-]+/g : /[^a-z0-9._/-]+/g, '-')
      .replace(/\/{2,}/g, '/')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/\//g, '-') || fallback;
  }
  function canonicalSourcePath(value = '.topics') {
    const out = [];
    for (const part of String(value || '.topics').trim().replace(/\\/g, '/').replace(/\/{2,}/g, '/').split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/') || '.topics';
  }
  function configuredSourceBoundaryParts(input = {}) {
    const repository = String(input.repository || input.repo || input.config?.repo || '').trim().toLowerCase();
    if (!repository) return null;
    const ref = String(input.ref || input.requestedRef || input.config?.ref || '').trim();
    const rootPath = canonicalSourcePath(input.rootPath || input.config?.rootPath || '.topics');
    return Object.freeze({ repository, ref, rootPath });
  }
  function configuredSourceBoundaryKey(input = {}) {
    const parts = configuredSourceBoundaryParts(input);
    return parts ? JSON.stringify([parts.repository, parts.ref, parts.rootPath]) : '';
  }
  function configuredSourceBoundarySignature(input = {}) {
    const parts = configuredSourceBoundaryParts(input);
    return parts ? [parts.repository, parts.ref, parts.rootPath].join('|') : '';
  }
  function configuredSourceBoundaryIdentity(input = {}) {
    const parts = configuredSourceBoundaryParts(input);
    if (!parts) return null;
    return Object.freeze({
      ...parts,
      key: configuredSourceBoundaryKey(parts),
      signature: configuredSourceBoundarySignature(parts)
    });
  }
  function makeConfiguredSourceId(input = {}) {
    const repository = sourceIdPart(input.repository || input.repo || input.config?.repo, 'source');
    const ref = sourceIdPart(input.ref || input.requestedRef || input.config?.ref, 'unresolved', { caseSensitive: true });
    const rootPath = sourceIdPart(canonicalSourcePath(input.rootPath || input.config?.rootPath || '.topics'), 'root', { caseSensitive: true });
    return `github:${repository}:${ref}:${rootPath}`;
  }
  global.TiinexSourceIdentity = { sourceIdPart, configuredSourceBoundaryParts, configuredSourceBoundaryKey, configuredSourceBoundarySignature, configuredSourceBoundaryIdentity, makeConfiguredSourceId };
})(typeof window !== 'undefined' ? window : globalThis);
